// ===== REDUCED MOTION CONTROLLER =====

class ReducedMotionController {
  constructor() {
    this.mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.init();
  }

  init() {
    this.handleMotionPreference(this.mediaQuery);
    this.mediaQuery.addEventListener(
      "change",
      this.handleMotionPreference.bind(this)
    );
  }

  handleMotionPreference(mediaQuery) {
    if (mediaQuery.matches) {
      // Reduced motion requested
      document.documentElement.setAttribute("data-motion", "reduced");

      // Dispatch event to stop wiggle animation
      document.dispatchEvent(new CustomEvent("stopWiggle"));
    } else {
      // Normal motion allowed
      document.documentElement.setAttribute("data-motion", "normal");

      // Dispatch event to start wiggle animation
      document.dispatchEvent(new CustomEvent("startWiggle"));
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new ReducedMotionController();
});
