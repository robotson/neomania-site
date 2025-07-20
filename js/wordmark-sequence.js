// === WORDMARK SEQUENCE: SAFARI-COMPATIBLE SCROLL ANIMATION ===
// This script creates a smooth, bidirectional scroll experience using CSS custom properties
// instead of DOM manipulation. Compatible with Safari and all modern browsers.

document.addEventListener("DOMContentLoaded", () => {
  const letters = document.querySelectorAll(".wordmark-letter");
  if (!letters.length) return;

  // --- STATE & CONFIGURATION ---
  let animationFrameId = null;
  let lastScrollY = 0;
  const scrollAnimationEnd = window.innerHeight; // Animation completes over 1x viewport height
  let initialFontSize; // Will be read after fonts load
  const finalFontSize = 2.0 * 16; // 2.0rem in pixels - try larger for header
  
  // Responsive font size system - continuous scaling
  function getResponsiveFontSize(baseSize, progress) {
    const viewportWidth = window.innerWidth;
    
    // Continuous scaling using viewport width
    // Scale from 40px at 320px viewport to 112px at 1920px viewport
    const minViewport = 320;
    const maxViewport = 1920;
    const minFontSize = 40;
    const maxFontSize = 112;
    
    // Clamp viewport width to our range
    const clampedViewport = Math.max(minViewport, Math.min(maxViewport, viewportWidth));
    
    // Calculate continuous font size based on viewport width
    const viewportProgress = (clampedViewport - minViewport) / (maxViewport - minViewport);
    const responsiveBaseSize = lerp(minFontSize, maxFontSize, viewportProgress);
    
    // Interpolate between responsive base size and final size
    return lerp(responsiveBaseSize, finalFontSize, progress);
  }

  const AXES_CONFIG = {
    wght: { min: 300, max: 900 }, // Expanded range to include all resting weights
    wdth: { min: 80, max: 120 }, // Center at 100 - wider for more counter space
    opsz: { min: 14, max: 120 },
    GRAD: { min: -100, max: 100 },
    slnt: { min: -5, max: 0 },
    XOPQ: { min: 60, max: 150 },
    XTRA: { min: 350, max: 550 },
    YOPQ: { min: 35, max: 120 },
    YTAS: { min: 700, max: 850 }, // Restored normal ranges
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

  // Use the finely tuned values with thinner strokes for bigger counters
  const FINAL_AXES_N = {
    wdth: 110,  // Wider N letter
    opsz: 80,   // From CSS file
    GRAD: 0,    // From CSS file  
    slnt: 0,
    YTAS: 750,  // From CSS file
    YTUC: 712,  // From CSS file
    YOPQ: 60,   // Even thinner vertical strokes for wider counters
    YTLC: 514,  // From CSS file
    YTDE: -203, // From CSS file
    YTFI: 738,  // From CSS file
    XOPQ: 80,   // Even thinner horizontal strokes for wider counters
    XTRA: 468,  // From CSS file
  };

  const RESTING_WGHT = [900, 750, 650, 550, 450, 400, 350, 300]; // Restored N to 900

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

  // --- Bidirectional Scroll Handler ---
  function handleScroll() {
    const scrollY = window.scrollY;
    const progress = Math.min(1, Math.max(0, scrollY / scrollAnimationEnd));
    
    // Update CSS custom properties for smooth transitions
    updateCSSProperties(progress);
    
    // Continue letter animation while in scroll range
    if (scrollY <= scrollAnimationEnd && !animationFrameId) {
      masterAnimationLoop();
    }
    
    lastScrollY = scrollY;
  }
  
  // --- Responsive Resize Handler ---
  function handleResize() {
    // Update immediately during resize for real-time feedback
    const scrollY = window.scrollY;
    const progress = Math.min(1, Math.max(0, scrollY / scrollAnimationEnd));
    updateCSSProperties(progress);
  }
  
  // --- Update CSS Custom Properties ---
  function updateCSSProperties(progress) {
    const easedProgress = easeInOutCubic(progress);
    const root = document.documentElement;
    
    // Hero container height - shrink from 100vh to header size
    const heroHeight = lerp(window.innerHeight, 80, easedProgress); // 80px to match header height
    root.style.setProperty('--hero-container-height', `${heroHeight}px`);
    
    // Hero container positioning - move to align with header
    const heroTop = lerp(0, 0, easedProgress); // Stay at top
    root.style.setProperty('--hero-top', `${heroTop}px`);
    
    // Background opacity
    const bgOpacity = easedProgress * 0.75;
    root.style.setProperty('--hero-bg-opacity', bgOpacity);
    
    // Content opacity - fast fade over first 10%
    const contentOpacity = Math.min(1, progress / 0.1);
    root.style.setProperty('--content-opacity', contentOpacity);
    
    // Navigation opacity - fade in faster, starting at 30% scroll
    const navOpacity = progress > 0.3 ? (progress - 0.3) / 0.3 : 0;
    root.style.setProperty('--nav-opacity', Math.min(1, navOpacity));
    
    // Wordmark font size and styling - now truly responsive
    const currentFontSize = getResponsiveFontSize(null, easedProgress);
    root.style.setProperty('--wordmark-font-size', `${currentFontSize}px`);
    
    // Text shadow (glow) - fade to zero smoothly
    const shadowBlur = lerp(4, 0, easedProgress);
    const shadowOpacity = lerp(0.5, 0, easedProgress);
    
    if (shadowOpacity < 0.01) {
      // Completely remove shadow when very close to zero
      root.style.setProperty('--wordmark-text-shadow', 'none');
      root.style.setProperty('--text-shadow', 'none');
    } else {
      root.style.setProperty('--wordmark-text-shadow', `2px 2px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity})`);
      
      // Also animate the theme-based shadow for letters
      const letterShadowOpacity = lerp(0.8, 0, easedProgress);
      root.style.setProperty('--text-shadow', `0 0 10px rgba(255, 255, 255, ${letterShadowOpacity}), 0 0 20px rgba(255, 255, 255, ${letterShadowOpacity * 0.5}), 0 0 30px rgba(255, 255, 255, ${letterShadowOpacity * 0.3})`);
    }
    
    // Wordmark opacity - fade to more subtle in final state
    const wordmarkOpacity = lerp(1, 0.7, easedProgress);
    root.style.setProperty('--wordmark-opacity', wordmarkOpacity);
    
    // Wiggle amplitude for letter animation - smoother transition
    const wiggleProgress = Math.max(0, (progress - 0.1) / 0.9);
    const wiggleAmplitude = 1 - wiggleProgress; // Linear instead of eased to avoid double-easing
    root.style.setProperty('--wiggle-amplitude', wiggleAmplitude);
  }

  // --- Main Animation Loop ---
  function masterAnimationLoop() {
    const scrollY = window.scrollY;
    const progress = Math.min(1, Math.max(0, scrollY / scrollAnimationEnd));
    const easedProgress = easeInOutCubic(progress);
    
    // Get wiggle amplitude from CSS custom property
    const wiggleAmplitude = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--wiggle-amplitude') || '1'
    );

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
        } else if (FINAL_AXES_COMMON.hasOwnProperty(axis) || (i === 0 && FINAL_AXES_N.hasOwnProperty(axis))) {
          // Other specified axes settle to a common value, or special N values
          const finalAxes = i === 0 ? FINAL_AXES_N : FINAL_AXES_COMMON;
          
          if (i === 0 && FINAL_AXES_N.hasOwnProperty(axis)) {
            // For the N, settle directly to final value with NO wiggle offset
            finalValue = lerp(
              state.currentValues[axis],
              finalAxes[axis],
              easedProgress
            );
          } else {
            // For other letters, use center-to-final interpolation
            const settledValue = lerp(
              (AXES_CONFIG[axis].min + AXES_CONFIG[axis].max) / 2,
              finalAxes[axis],
              easedProgress
            );
            const wiggleOffset = (state.currentValues[axis] - settledValue) * wiggleAmplitude;
            finalValue = settledValue + wiggleOffset;
          }
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

    // Keep animation running continuously to maintain smooth letter variations
    animationFrameId = requestAnimationFrame(masterAnimationLoop);
  }

  // --- EVENT BINDING & REDUCED MOTION ---
  function setup() {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    
    // Get initial font size from computed styles
    const wordmarkText = document.querySelector(".animated-wordmark .wordmark-text");
    if (wordmarkText) {
      initialFontSize = parseFloat(getComputedStyle(wordmarkText).fontSize);
    }

    // Always clean up previous listeners
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleResize);

    if (prefersReduced) {
      // Set final, static state for reduced motion using CSS custom properties
      const root = document.documentElement;
      root.style.setProperty('--hero-container-height', '100px');
      root.style.setProperty('--hero-bg-opacity', '0.75');
      root.style.setProperty('--content-opacity', '1');
      root.style.setProperty('--nav-opacity', '1');
      root.style.setProperty('--wordmark-font-size', `${getResponsiveFontSize(null, 1)}px`);
      root.style.setProperty('--wordmark-text-shadow', 'none');
      root.style.setProperty('--wiggle-amplitude', '0');
      document.body.classList.add("no-animation-timeline");
    } else {
      document.body.classList.remove("no-animation-timeline");
      handleScroll(); // Initial call to set progress
      masterAnimationLoop(); // Start the animation loop
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleResize, { passive: true });
    }
  }

  // Wait for fonts to be ready before setting up, to get correct initial font size
  document.fonts.ready.then(setup);
  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener("change", setup);
});
