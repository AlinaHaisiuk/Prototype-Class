class Slider {
  constructor(containerSelector, config = {}) {
    this.container = document.querySelector(containerSelector);
    this.imageList = this.container.querySelector(".image-list");
    this.slideButtons = this.container.querySelectorAll(".slide-button");
    this.sliderScrollbar = this.container.querySelector(".slider-scrollbar");
    this.scrollbarThumb =
      this.sliderScrollbar.querySelector(".scrollbar-thumb");
    this.pauseButton = this.container.querySelector("#pause-slide");

    this.config = Object.assign(
      {
        autoScrollInterval: 2000,
        pauseOnHover: true,
      },
      config
    );

    this.maxScrollLeft =
      this.imageList.scrollWidth - this.imageList.clientWidth;
    this.autoScroll = true;
    this.autoScrollTimer = null;

    this.init();
  }

  init() {
    this.addEventListeners();
    this.startAutoScroll();
  }

  addEventListeners() {
    this.slideButtons.forEach((button) => {
      button.addEventListener("click", () =>
        this.handleSlideButtonClick(button)
      );
    });

    this.scrollbarThumb.addEventListener("mousedown", (e) =>
      this.handleScrollbarThumbMouseDown(e)
    );
    this.imageList.addEventListener("scroll", () =>
      this.handleImageListScroll()
    );
    this.pauseButton.addEventListener("click", () => this.toggleAutoScroll());

    if (this.config.pauseOnHover) {
      this.imageList.addEventListener("mouseenter", () =>
        this.stopAutoScroll()
      );
      this.imageList.addEventListener("mouseleave", () =>
        this.startAutoScroll()
      );
    }

    this.imageList.addEventListener("mousedown", (e) =>
      this.handleMouseDown(e)
    );
    this.imageList.addEventListener("mousemove", (e) =>
      this.handleMouseMove(e)
    );
    this.imageList.addEventListener("mouseup", () => this.handleMouseUp());
    this.imageList.addEventListener("touchstart", (e) =>
      this.handleTouchStart(e)
    );
    this.imageList.addEventListener("touchmove", (e) =>
      this.handleTouchMove(e)
    );
    this.imageList.addEventListener("touchend", () => this.handleTouchEnd());
  }

  startAutoScroll() {
    this.autoScrollTimer = setInterval(() => {
      if (this.autoScroll) {
        const nextSlide =
          this.imageList.scrollLeft + this.imageList.clientWidth;
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
  }

  stopAutoScroll() {
    clearInterval(this.autoScrollTimer);
  }

  toggleAutoScroll() {
    this.autoScroll = !this.autoScroll;
    this.pauseButton.textContent = this.autoScroll ? "Pause" : "Play";
    if (this.autoScroll) {
      this.startAutoScroll();
    } else {
      this.stopAutoScroll();
    }
  }

  handleSlideButtonClick(button) {
    this.stopAutoScroll();
    const direction = button.id === "prev-slide" ? -1 : 1;
    const scrollAmount = this.imageList.clientWidth * direction;
    this.imageList.scrollBy({ left: scrollAmount, behavior: "smooth" });
    this.startAutoScroll();
  }

  handleScrollbarThumbMouseDown(e) {
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
  }

  handleImageListScroll() {
    const scrollPosition = this.imageList.scrollLeft;
    const thumbPosition =
      (scrollPosition / this.maxScrollLeft) *
      (this.sliderScrollbar.clientWidth - this.scrollbarThumb.offsetWidth);
    this.scrollbarThumb.style.left = `${thumbPosition}px`;
  }

  handleMouseDown(e) {
    this.stopAutoScroll();
    this.startX = e.clientX;
  }

  handleMouseMove(e) {
    if (e.buttons > 0) {
      const deltaX = e.clientX - this.startX;
      this.imageList.scrollBy({ left: -deltaX, behavior: "smooth" });
      this.startX = e.clientX;
    }
  }

  handleMouseUp() {
    this.startAutoScroll();
  }

  handleTouchStart(e) {
    this.stopAutoScroll();
    this.startX = e.touches[0].clientX;
  }

  handleTouchMove(e) {
    const deltaX = e.touches[0].clientX - this.startX;
    this.imageList.scrollBy({ left: -deltaX, behavior: "smooth" });
    this.startX = e.touches[0].clientX;
  }

  handleTouchEnd() {
    this.startAutoScroll();
  }
}

window.addEventListener("load", () => {
  new Slider(".container", { autoScrollInterval: 2000, pauseOnHover: true });
});
