function Slider(containerSelector, config = {}) {
  this.container = document.querySelector(containerSelector);
  this.imageList = this.container.querySelector(".image-list");
  this.slideButtons = this.container.querySelectorAll(".slide-button");
  this.sliderScrollbar = this.container.querySelector(".slider-scrollbar");
  this.scrollbarThumb = this.sliderScrollbar.querySelector(".scrollbar-thumb");
  this.pauseButton = this.container.querySelector("#pause-slide");

  this.config = Object.assign(
    {
      autoScrollInterval: 2000,
      pauseOnHover: true,
    },
    config
  );

  this.maxScrollLeft = this.imageList.scrollWidth - this.imageList.clientWidth;
  this.autoScroll = true;
  this.autoScrollTimer = null;

  this.init();
}

Slider.prototype.init = function () {
  this.addEventListeners();
  this.startAutoScroll();
};

Slider.prototype.addEventListeners = function () {
  this.slideButtons.forEach((button) => {
    button.addEventListener(
      "click",
      this.handleSlideButtonClick.bind(this, button)
    );
  });

  this.scrollbarThumb.addEventListener(
    "mousedown",
    this.handleScrollbarThumbMouseDown.bind(this)
  );
  this.imageList.addEventListener(
    "scroll",
    this.handleImageListScroll.bind(this)
  );
  this.pauseButton.addEventListener("click", this.toggleAutoScroll.bind(this));

  if (this.config.pauseOnHover) {
    this.imageList.addEventListener(
      "mouseenter",
      this.stopAutoScroll.bind(this)
    );
    this.imageList.addEventListener(
      "mouseleave",
      this.startAutoScroll.bind(this)
    );
  }

  this.imageList.addEventListener("mousedown", this.handleMouseDown.bind(this));
  this.imageList.addEventListener("mousemove", this.handleMouseMove.bind(this));
  this.imageList.addEventListener("mouseup", this.handleMouseUp.bind(this));
  this.imageList.addEventListener(
    "touchstart",
    this.handleTouchStart.bind(this)
  );
  this.imageList.addEventListener("touchmove", this.handleTouchMove.bind(this));
  this.imageList.addEventListener("touchend", this.handleTouchEnd.bind(this));
};

Slider.prototype.startAutoScroll = function () {
  this.autoScrollTimer = setInterval(() => {
    if (this.autoScroll) {
      const nextSlide = this.imageList.scrollLeft + this.imageList.clientWidth;
      if (nextSlide >= this.maxScrollLeft) {
        this.imageList.scrollLeft = 0;
      } else {
        this.imageList.scrollBy({
          left: this.imageList.clientWidth,
          behavior: "smooth",
        });
      }
    }
  }, this.config.autoScrollInterval);
};

Slider.prototype.stopAutoScroll = function () {
  clearInterval(this.autoScrollTimer);
};

Slider.prototype.toggleAutoScroll = function () {
  this.autoScroll = !this.autoScroll;
  this.pauseButton.textContent = this.autoScroll ? "Pause" : "Play";
  if (this.autoScroll) {
    this.startAutoScroll();
  } else {
    this.stopAutoScroll();
  }
};

Slider.prototype.handleSlideButtonClick = function (button) {
  this.stopAutoScroll();
  const direction = button.id === "prev-slide" ? -1 : 1;
  const scrollAmount = this.imageList.clientWidth * direction;
  this.imageList.scrollBy({ left: scrollAmount, behavior: "smooth" });
  this.startAutoScroll();
};

Slider.prototype.handleScrollbarThumbMouseDown = function (e) {
  this.stopAutoScroll();
  const startX = e.clientX;
  const thumbPosition = this.scrollbarThumb.offsetLeft;

  const handleMouseMove = (e) => {
    const deltaX = e.clientX - startX;
    const newThumbPosition = thumbPosition + deltaX;
    const maxThumbPosition =
      this.sliderScrollbar.getBoundingClientRect().width -
      this.scrollbarThumb.offsetWidth;
    const boundedPosition = Math.max(
      0,
      Math.min(maxThumbPosition, newThumbPosition)
    );
    const scrollPosition =
      (boundedPosition / maxThumbPosition) * this.maxScrollLeft;

    this.scrollbarThumb.style.left = `${boundedPosition}px`;
    this.imageList.scrollLeft = scrollPosition;
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    this.startAutoScroll();
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

Slider.prototype.handleImageListScroll = function () {
  const scrollPosition = this.imageList.scrollLeft;
  const thumbPosition =
    (scrollPosition / this.maxScrollLeft) *
    (this.sliderScrollbar.clientWidth - this.scrollbarThumb.offsetWidth);
  this.scrollbarThumb.style.left = `${thumbPosition}px`;
};

Slider.prototype.handleMouseDown = function (e) {
  this.stopAutoScroll();
  this.startX = e.clientX;
};

Slider.prototype.handleMouseMove = function (e) {
  if (e.buttons > 0) {
    const deltaX = e.clientX - this.startX;
    this.imageList.scrollBy({ left: -deltaX, behavior: "smooth" });
    this.startX = e.clientX;
  }
};

Slider.prototype.handleMouseUp = function () {
  this.startAutoScroll();
};

Slider.prototype.handleTouchStart = function (e) {
  this.stopAutoScroll();
  this.startX = e.touches[0].clientX;
};

Slider.prototype.handleTouchMove = function (e) {
  const deltaX = e.touches[0].clientX - this.startX;
  this.imageList.scrollBy({ left: -deltaX, behavior: "smooth" });
  this.startX = e.touches[0].clientX;
};

Slider.prototype.handleTouchEnd = function () {
  this.startAutoScroll();
};

window.addEventListener("load", function () {
  new Slider(".container", { autoScrollInterval: 2000, pauseOnHover: true });
});
