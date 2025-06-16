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
    // Helper function to get motion preference stats
    function getMotionStats(preference) {
      const wordmark = document.querySelector(
        ".animated-wordmark .wordmark-text"
      );
      const hero = document.querySelector(".main-hero");

      const stats = {
        timestamp: Date.now(),
        preference,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          scrollY: window.scrollY,
        },
        document: {
          dataMotion: document.documentElement.getAttribute("data-motion"),
          readyState: document.readyState,
        },
        wordmark: wordmark
          ? {
              fontSize: getComputedStyle(wordmark).fontSize,
              position: wordmark.getBoundingClientRect(),
            }
          : null,
        hero: hero
          ? {
              classes: Array.from(hero.classList),
              position: hero.getBoundingClientRect(),
            }
          : null,
      };

      // Pretty print with visual organization
      console.group(`♿ MOTION PREFERENCE DEBUG: ${preference.toUpperCase()}`);
      console.log(
        "⏰ Timestamp:",
        new Date(stats.timestamp).toLocaleTimeString()
      );

      // Motion and document state
      console.table({
        "Motion Preference": stats.preference,
        "Data Motion Attr": stats.document.dataMotion || "none",
        "Document Ready": stats.document.readyState,
        "Viewport Width": `${stats.viewport.width}px`,
        "Viewport Height": `${stats.viewport.height}px`,
        "Scroll Y": `${stats.viewport.scrollY}px`,
      });

      // Wordmark state if available
      if (stats.wordmark) {
        console.log("📏 Wordmark Element:");
        const pos = stats.wordmark.position;
        console.table({
          "Font Size": stats.wordmark.fontSize,
          Top: `${Math.round(pos.top)}px`,
          Left: `${Math.round(pos.left)}px`,
          Width: `${Math.round(pos.width)}px`,
          Height: `${Math.round(pos.height)}px`,
        });
      }

      // Hero state if available
      if (stats.hero) {
        console.log("🦸 Hero Element:");
        const pos = stats.hero.position;
        console.table({
          Classes: stats.hero.classes.join(" "),
          Top: `${Math.round(pos.top)}px`,
          Left: `${Math.round(pos.left)}px`,
          Width: `${Math.round(pos.width)}px`,
          Height: `${Math.round(pos.height)}px`,
        });
      }

      console.groupEnd();
      return stats;
    }

    if (mediaQuery.matches) {
      // Reduced motion requested
      console.log(
        "♿ REDUCED MOTION: User prefers reduced motion, stopping wiggle"
      );
      getMotionStats("reduced");
      document.documentElement.setAttribute("data-motion", "reduced");

      // Dispatch event to stop wiggle animation
      document.dispatchEvent(new CustomEvent("stopWiggle"));
    } else {
      // Normal motion allowed
      console.log("🎬 NORMAL MOTION: User allows motion, starting wiggle");
      getMotionStats("normal");
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
