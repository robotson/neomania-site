// === WORDMARK SEQUENCE: SCROLL-DRIVEN HERO ANIMATION ===
// This script handles the entire logo "splash → pinned" journey with smooth interpolation.
// It disables its own logic if `prefers-reduced-motion`.

document.addEventListener("DOMContentLoaded", () => {
  const letters = document.querySelectorAll(".wordmark-letter");
  let animationId = null;

  if (!letters.length) return;

  // --- DEBUG PANEL REFERENCES ---
  const debug = {
    scroll: document.getElementById("debug-scroll"),
    progress: document.getElementById("debug-progress"),
    wiggle: document.getElementById("debug-wiggle"),
    heroHeight: document.getElementById("debug-hero-height"),
    fontSize: document.getElementById("debug-font-size"),
    heroPos: document.getElementById("debug-hero-pos"),
  };
  const hero = document.querySelector(".main-hero");
  const wordmarkText = document.querySelector(
    ".animated-wordmark .wordmark-text"
  );

  // --- CONFIGURATION ---
  // This value MUST match the --animation-scroll-range in landing.css
  const scrollAnimationEnd = window.innerHeight * 1.0;

  const AXES_CONFIG = {
    wght: { min: 350, max: 800 },
    wdth: { min: 50, max: 130 },
    opsz: { min: 14, max: 120 },
    GRAD: { min: -100, max: 100 },
    slnt: { min: -5, max: 0 },
    XOPQ: { min: 60, max: 150 },
    XTRA: { min: 350, max: 550 },
    YOPQ: { min: 35, max: 120 },
    YTAS: { min: 700, max: 850 },
    YTDE: { min: -250, max: -120 },
    YTFI: { min: 600, max: 750 },
    YTLC: { min: 450, max: 550 },
    YTUC: { min: 550, max: 700 },
  };
  const FINAL_AXES = {
    wght: 500,
    wdth: 100,
    slnt: 0,
    opsz: 48,
    GRAD: 0,
    XOPQ: 100,
    XTRA: 468,
    YOPQ: 79,
    YTAS: 750,
    YTDE: -203,
    YTFI: 738,
    YTLC: 514,
    YTUC: 712,
  };
  const START_WGHT = [900, 750, 650, 550, 450, 400, 350, 300];
  const BALANCED_AXES = [
    { axis1: "wght", axis2: "XOPQ", correlation: -0.6 },
    { axis1: "wdth", axis2: "XOPQ", correlation: -0.4 },
    { axis1: "wght", axis2: "wdth", correlation: -0.3 },
  ];
  const letterStates = Array.from(letters).map((_, i) => ({
    currentValues: Object.fromEntries(
      Object.entries(AXES_CONFIG).map(([axis, range]) => [
        axis,
        axis === "wght" ? START_WGHT[i] : (range.min + range.max) / 2,
      ])
    ),
    directions: Object.fromEntries(
      Object.keys(AXES_CONFIG).map((axis) => [
        axis,
        Math.random() < 0.5 ? -1 : 1,
      ])
    ),
    speed: Math.random() * 0.005 + 0.008,
  }));

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function masterAnimationLoop() {
    const scrollY = window.scrollY;
    let progress = Math.max(0, Math.min(1, scrollY / scrollAnimationEnd));
    const easedProgress = easeInOutCubic(progress);
    const wiggleAmplitude = 1 - easedProgress;

    // --- Update Debug Panel ---
    if (debug.scroll) debug.scroll.textContent = `${scrollY.toFixed(0)}px`;
    if (debug.progress)
      debug.progress.textContent = `${(progress * 100).toFixed(1)}%`;
    if (debug.wiggle)
      debug.wiggle.textContent = `${(wiggleAmplitude * 100).toFixed(1)}%`;
    if (hero && debug.heroHeight)
      debug.heroHeight.textContent = `${hero.offsetHeight.toFixed(1)}px`;
    if (wordmarkText && debug.fontSize)
      debug.fontSize.textContent = getComputedStyle(wordmarkText).fontSize;
    if (hero && debug.heroPos)
      debug.heroPos.textContent = getComputedStyle(hero).position;

    letters.forEach((letter, i) => {
      const state = letterStates[i];
      const finalSettings = {};

      // Wiggle calculation with restored balancing
      for (const axis in AXES_CONFIG) {
        const range = AXES_CONFIG[axis].max - AXES_CONFIG[axis].min;
        state.currentValues[axis] +=
          state.directions[axis] * range * state.speed;

        if (
          state.currentValues[axis] >= AXES_CONFIG[axis].max ||
          state.currentValues[axis] <= AXES_CONFIG[axis].min
        ) {
          state.directions[axis] *= -1;
        }
      }

      // Apply the balancing rules to the wiggled values
      if (wiggleAmplitude > 0) {
        BALANCED_AXES.forEach(({ axis1, axis2, correlation }) => {
          const val1 = state.currentValues[axis1];
          const range1 = AXES_CONFIG[axis1].max - AXES_CONFIG[axis1].min;
          const normalized1 = (val1 - AXES_CONFIG[axis1].min) / range1;

          const range2 = AXES_CONFIG[axis2].max - AXES_CONFIG[axis2].min;
          const target2 =
            correlation < 0
              ? AXES_CONFIG[axis2].max - normalized1 * range2
              : AXES_CONFIG[axis2].min + normalized1 * range2;

          // Gently pull the second axis toward its correlated target
          state.currentValues[axis2] = lerp(
            state.currentValues[axis2],
            target2,
            Math.abs(correlation) * 0.1
          );
        });
      }

      for (const axis in AXES_CONFIG) {
        const startVal =
          axis === "wght" ? START_WGHT[i] : AXES_CONFIG[axis].min;
        const settledValue = lerp(startVal, FINAL_AXES[axis], easedProgress);

        const wiggleOffset =
          (state.currentValues[axis] - settledValue) * wiggleAmplitude;
        finalSettings[axis] = settledValue + wiggleOffset;
      }
      letter.style.fontVariationSettings = Object.entries(finalSettings)
        .map(([k, v]) => `"${k}" ${Math.round(v)}`)
        .join(", ");
    });

    // Continue the animation as long as there's some wiggle.
    if (wiggleAmplitude > 0.001) {
      animationId = requestAnimationFrame(masterAnimationLoop);
    } else {
      letters.forEach((letter, i) => {
        letter.style.fontVariationSettings = Object.entries(FINAL_AXES)
          .map(([k, v]) => `"${k}" ${v}`)
          .join(", ");
      });
      animationId = null; // Stop the loop
    }
  }

  // --- EVENT BINDING & REDUCED MOTION ---
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function handleMotionChange() {
    if (prefersReduced.matches) {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    } else {
      if (!animationId) {
        masterAnimationLoop();
      }
    }
  }

  // Re-start animation loop if user scrolls back to top
  window.addEventListener("scroll", () => {
    if (!animationId && window.scrollY < 10 && !prefersReduced.matches) {
      masterAnimationLoop();
    }
  });

  handleMotionChange();
  prefersReduced.addEventListener("change", handleMotionChange);
});
