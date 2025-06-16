// === WORDMARK SEQUENCE: SCROLL-DRIVEN HERO ANIMATION ===
// This script handles the entire logo "splash → pinned" journey with smooth interpolation.
// It animates the wordmark font, the hero container, and fades in the main content.
// This implementation uses a scroll event listener for cross-browser compatibility.

document.addEventListener("DOMContentLoaded", () => {
  const letters = document.querySelectorAll(".wordmark-letter");
  if (!letters.length) return;

  // --- DOM ELEMENT REFERENCES ---
  const hero = document.querySelector(".main-hero");
  const mainContent = document.querySelector(".main-content");
  const wordmarkText = document.querySelector(
    ".animated-wordmark .wordmark-text"
  );
  const fixedHeroContainer = document.querySelector(".fixed-hero-container");

  // --- STATE & CONFIGURATION ---
  let animationFrameId = null;
  let progress = 0;
  const scrollAnimationEnd = window.innerHeight; // Animation completes over 1x viewport height
  const heroEndHeight = 6.25 * 16; // 6.25rem in pixels
  let initialFontSize; // Will be read after fonts load
  const finalFontSize = 2.2 * 16; // 2.2rem in pixels

  const AXES_CONFIG = {
    wght: { min: 300, max: 900 }, // Expanded range to include all resting weights
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

  // The final, "at-rest" state for the wordmark when it's sticky.
  const FINAL_AXES_COMMON = {
    wdth: 100,
    opsz: 80,
    GRAD: 0,
    slnt: 0,
  };

  const RESTING_WGHT = [900, 750, 650, 550, 450, 400, 350, 300];

  const balancedAxes = [
    { axis1: "wght", axis2: "XOPQ", correlation: -0.6 },
    { axis1: "wdth", axis2: "XOPQ", correlation: -0.4 },
    { axis1: "wght", axis2: "wdth", correlation: -0.3 },
  ];

  const letterStates = Array.from(letters).map((_, i) => ({
    currentValues: Object.fromEntries(
      Object.entries(AXES_CONFIG).map(([axis, range]) => [
        axis,
        axis === "wght" ? RESTING_WGHT[i] : (range.min + range.max) / 2,
      ])
    ),
    directions: Object.fromEntries(
      Object.keys(AXES_CONFIG).map((axis) => [
        axis,
        Math.random() < 0.5 ? -1 : 1,
      ])
    ),
    speed: Math.random() * 0.003 + 0.004, // Reduced speed for a more subtle effect
  }));

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // --- The One True Scroll Handler ---
  function handleScroll() {
    const scrollY = window.scrollY;
    progress = Math.min(1, Math.max(0, scrollY / scrollAnimationEnd));

    // If the animation loop isn't running and we're in the animation zone, start it.
    if (!animationFrameId && progress < 1) {
      masterAnimationLoop();
    }
  }

  // --- Main Animation Loop ---
  function masterAnimationLoop() {
    const easedProgress = easeInOutCubic(progress);

    // Calculate wiggle amplitude with a 10% buffer at the start
    let wiggleAmplitude = 1;
    if (progress > 0.1) {
      const wiggleProgress = (progress - 0.1) / 0.9;
      wiggleAmplitude = 1 - easeInOutCubic(wiggleProgress);
    }

    // 1. Animate Hero Container
    const heroHeight = lerp(window.innerHeight, heroEndHeight, easedProgress);
    hero.style.height = `${heroHeight}px`;
    hero.style.backgroundColor = `rgba(10, 10, 10, ${easedProgress * 0.75})`;

    // 2. Animate Wordmark Font Size & Shadow
    const currentFontSize = lerp(initialFontSize, finalFontSize, easedProgress);
    wordmarkText.style.fontSize = `${currentFontSize}px`;
    wordmarkText.style.textShadow = `2px 2px ${lerp(
      4,
      0,
      easedProgress
    )}px rgba(0, 0, 0, ${lerp(0.5, 0, easedProgress)})`;

    // 3. Animate Main Content Opacity - Fast fade over first 10%
    const contentFadeProgress = Math.min(1, progress / 0.1);
    mainContent.style.opacity = contentFadeProgress;

    // 4. Animate Font Variation Settings with Wiggle
    letters.forEach((letter, i) => {
      const finalSettings = {};

      // Primary animation step - move each axis value
      for (const axis in AXES_CONFIG) {
        const range = AXES_CONFIG[axis].max - AXES_CONFIG[axis].min;
        letterStates[i].currentValues[axis] +=
          letterStates[i].directions[axis] * range * letterStates[i].speed;
        if (
          letterStates[i].currentValues[axis] >= AXES_CONFIG[axis].max ||
          letterStates[i].currentValues[axis] <= AXES_CONFIG[axis].min
        ) {
          letterStates[i].directions[axis] *= -1;
        }
      }

      // Apply balanced relationships between axes
      balancedAxes.forEach(({ axis1, axis2, correlation }) => {
        const range1 = AXES_CONFIG[axis1].max - AXES_CONFIG[axis1].min;
        const normalizedPos1 =
          (letterStates[i].currentValues[axis1] - AXES_CONFIG[axis1].min) /
          range1;
        const targetPos2 =
          correlation < 0
            ? 1 - normalizedPos1 * Math.abs(correlation)
            : normalizedPos1 * correlation;
        const range2 = AXES_CONFIG[axis2].max - AXES_CONFIG[axis2].min;
        const targetValue2 = AXES_CONFIG[axis2].min + targetPos2 * range2;
        letterStates[i].currentValues[axis2] =
          letterStates[i].currentValues[axis2] * 0.7 + targetValue2 * 0.3;
      });

      // Legibility protection
      const weightNormalized =
        (letterStates[i].currentValues.wght - AXES_CONFIG.wght.min) /
        (AXES_CONFIG.wght.max - AXES_CONFIG.wght.min);
      const xopqNormalized =
        (letterStates[i].currentValues.XOPQ - AXES_CONFIG.XOPQ.min) /
        (AXES_CONFIG.XOPQ.max - AXES_CONFIG.XOPQ.min);
      if (weightNormalized < 0.3 && xopqNormalized < 0.3) {
        if (Math.random() < 0.5) {
          letterStates[i].currentValues.wght =
            AXES_CONFIG.wght.min +
            (AXES_CONFIG.wght.max - AXES_CONFIG.wght.min) * 0.4;
        } else {
          letterStates[i].currentValues.XOPQ =
            AXES_CONFIG.XOPQ.min +
            (AXES_CONFIG.XOPQ.max - AXES_CONFIG.XOPQ.min) * 0.4;
        }
      }

      // Blend the wiggling animation with the scroll-based "settling" animation
      for (const axis in AXES_CONFIG) {
        let finalValue;
        const state = letterStates[i];

        if (axis === "wght") {
          // Each letter settles to its own specific resting weight.
          const settledValue = lerp(
            (AXES_CONFIG.wght.min + AXES_CONFIG.wght.max) / 2,
            RESTING_WGHT[i],
            easedProgress
          );
          const wiggleOffset =
            (state.currentValues[axis] - settledValue) * wiggleAmplitude;
          finalValue = settledValue + wiggleOffset;
        } else if (FINAL_AXES_COMMON.hasOwnProperty(axis)) {
          // Other specified axes settle to a common value.
          const settledValue = lerp(
            (AXES_CONFIG[axis].min + AXES_CONFIG[axis].max) / 2,
            FINAL_AXES_COMMON[axis],
            easedProgress
          );
          const wiggleOffset =
            (state.currentValues[axis] - settledValue) * wiggleAmplitude;
          finalValue = settledValue + wiggleOffset;
        } else {
          // This axis is for the random "dance" effect only.
          // We fade it out by interpolating from its current wiggle value
          // to a neutral center point, based on the wiggleAmplitude.
          const neutralValue =
            (AXES_CONFIG[axis].min + AXES_CONFIG[axis].max) / 2;
          finalValue = lerp(
            neutralValue,
            state.currentValues[axis],
            wiggleAmplitude
          );
        }

        // Only apply the axis if it's part of the final design OR if there's still a wiggle.
        if (
          FINAL_AXES_COMMON.hasOwnProperty(axis) ||
          axis === "wght" ||
          wiggleAmplitude > 0.001
        ) {
          finalSettings[axis] = finalValue;
        }
      }

      letter.style.fontVariationSettings = Object.entries(finalSettings)
        .map(([k, v]) => `"${k}" ${Math.round(v)}`)
        .join(", ");
    });

    // Continue the loop if the animation isn't finished.
    if (progress < 1) {
      animationFrameId = requestAnimationFrame(masterAnimationLoop);
    } else {
      // Ensure final state is set perfectly when animation ends
      mainContent.style.opacity = "1";
      wordmarkText.style.fontSize = `${finalFontSize}px`;
      wordmarkText.style.letterSpacing = "0.08em"; // Add generous letter-spacing

      letters.forEach((letter, i) => {
        const finalSettings = {
          ...FINAL_AXES_COMMON,
          wght: RESTING_WGHT[i],
        };
        letter.style.fontVariationSettings = Object.entries(finalSettings)
          .map(([k, v]) => `"${k}" ${v}`)
          .join(", ");
      });
      animationFrameId = null;
    }
  }

  // --- EVENT BINDING & REDUCED MOTION ---
  function setup() {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    initialFontSize = parseFloat(getComputedStyle(wordmarkText).fontSize);

    // Always clean up previous listeners
    window.removeEventListener("scroll", handleScroll);

    if (prefersReduced) {
      // Set final, static state for reduced motion
      hero.style.height = `${finalFontSize * 4}px`;
      hero.style.backgroundColor = "rgba(10, 10, 10, 0.75)";
      mainContent.style.opacity = "1";
      wordmarkText.style.fontSize = `${finalFontSize}px`;
      wordmarkText.style.textShadow = "none";
      document.body.classList.add("no-animation-timeline");
    } else {
      document.body.classList.remove("no-animation-timeline");
      handleScroll(); // Initial call to set progress
      masterAnimationLoop(); // Start the animation loop
      window.addEventListener("scroll", handleScroll, { passive: true });
    }
  }

  // Wait for fonts to be ready before setting up, to get correct initial font size
  document.fonts.ready.then(setup);
  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener("change", setup);
});
