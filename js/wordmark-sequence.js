// === WORDMARK WIGGLE & OPACITY: PERFORMANCE-OPTIMIZED ANIMATION ===
// This script handles only the letter wiggle animation and opacity effects.
// Positioning is now handled by the FLIP modules (flip-measure.js + scroll-progress.js)

document.addEventListener("DOMContentLoaded", () => {
  // Target wordmark letters for animation
  const letters = document.querySelectorAll(".wordmark-letter");
  if (!letters.length) return;

  const wordmarkEl = document.querySelector(".animated-wordmark");
  
  // Feature flag for performance optimizations (for easy rollback)
  const PERF_PATCH_ENABLED = window.__NEOMANIA_PERF_PATCH__ !== false;

  // --- STATE & CONFIGURATION ---
  let rafRunning = false;
  const scrollAnimationEnd = window.innerHeight; // Animation completes over 1x viewport height
  
  // Glow throttling state
  let lastGlowUpdate = 0;
  let cachedGlowAlpha = null;
  const GLOW_UPDATE_THRESHOLD = 4; // Update glow every 4px of scroll

  const AXES_CONFIG = {
    wght: { min: 300, max: 900 },
    wdth: { min: 80, max: 120 },
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

  // Pre-calculate ranges for performance
  const AXES_RANGES = {};
  Object.entries(AXES_CONFIG).forEach(([axis, config]) => {
    AXES_RANGES[axis] = config.max - config.min;
  });

  // QW-2: Axis profile switching - lite mode uses fewer axes for performance
  const ACTIVE_AXES_FULL = Object.keys(AXES_CONFIG);
  const ACTIVE_AXES_LITE = ['wght', 'wdth', 'opsz'];
  function getActiveAxes(wiggleAmplitude) {
    return wiggleAmplitude >= 0.4 ? ACTIVE_AXES_FULL : ACTIVE_AXES_LITE;
  }

  // The final, "at-rest" state for the wordmark when it's sticky.
  const FINAL_AXES_COMMON = {
    wdth: 100,
    opsz: 80,
    GRAD: 0,
    slnt: 0,
  };

  // Use the finely tuned values with thinner strokes for bigger counters
  const FINAL_AXES_N = {
    wdth: 110,
    opsz: 80,
    GRAD: 0,
    slnt: 0,
    YTAS: 750,
    YTUC: 712,
    YOPQ: 60,
    YTLC: 514,
    YTDE: -203,
    YTFI: 738,
    XOPQ: 80,
    XTRA: 468,
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
        axis === "wght" ? RESTING_WGHT[i] : 
        axis === "slnt" ? 0 :
        (range.min + range.max) / 2,
      ])
    ),
    directions: Object.fromEntries(
      Object.keys(AXES_CONFIG).map((axis) => [
        axis,
        Math.random() < 0.5 ? -1 : 1,
      ])
    ),
    speed: Math.random() * 0.003 + 0.004,
  }));

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeInOutCubic(t) {
    if (t < 0.5) {
      return 4 * t * t * t;
    } else {
      const f = 2 * t - 2;
      return 1 + f * f * f / 2;
    }
  }

  // --- Bidirectional Scroll Handler ---
  function handleScroll() {
    const scrollY = window.scrollY;
    const progress = Math.min(1, Math.max(0, scrollY / scrollAnimationEnd));
    
    // Update CSS custom properties for smooth transitions
    updateCSSProperties(progress);
    
    // Start perpetual RAF if not running and in scroll range
    if (scrollY <= scrollAnimationEnd && !rafRunning) {
      rafRunning = true;
      requestAnimationFrame(masterAnimationLoop);
    }
  }

  // --- Update CSS Custom Properties ---
  function updateCSSProperties(progress) {
    const easedProgress = easeInOutCubic(progress);
    
    // Calculate all values first (no DOM access during calculations)
    const bgOpacity = progress < 0.5 ? easedProgress * 0.75 : lerp(0.75, 0, (progress - 0.5) * 2);
    const contentOpacity = Math.min(1, progress / 0.1);
    const navOpacity = progress > 0.3 ? Math.min(1, (progress - 0.3) / 0.3) : 0;
    
    // Wordmark opacity
    const wordmarkOpacity = lerp(1, 0.7, easedProgress);
    
    // Wiggle amplitude
    let wiggleAmplitude;
    if (progress <= 0.33) {
      wiggleAmplitude = 1;
    } else if (progress <= 0.5) {
      wiggleAmplitude = 1 - ((progress - 0.33) / 0.17);
    } else {
      wiggleAmplitude = 0;
    }
    
    // Glow opacity fades as scroll progresses - throttled for performance
    let glowAlpha;
    const scrollY = window.scrollY;
    if (Math.abs(scrollY - lastGlowUpdate) >= GLOW_UPDATE_THRESHOLD || cachedGlowAlpha === null) {
      glowAlpha = 1 - easedProgress; // 1 → 0
      cachedGlowAlpha = glowAlpha;
      lastGlowUpdate = scrollY;
    } else {
      glowAlpha = cachedGlowAlpha;
    }
    
    // Calculate wiggle transform for CSS
    const wiggleTransform = wiggleAmplitude > 0 ? '' : ''; // Placeholder for future wiggle transforms
    
    // Batch CSS custom property updates for better performance
    const updates = {
      '--hero-bg-opacity': bgOpacity,
      '--content-opacity': contentOpacity,
      '--nav-opacity': navOpacity,
      '--glow-alpha': glowAlpha.toFixed(3),
      '--wordmark-opacity': wordmarkOpacity,
      '--wiggle-amplitude': wiggleAmplitude,
      '--wiggle-transform': wiggleTransform
    };
    
    // Apply all updates in one batch
    const root = document.documentElement;
    Object.entries(updates).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  // --- Main Animation Loop ---
  function masterAnimationLoop() {
    // Set will-change when entering animation loop for better GPU compositing
    if (wordmarkEl && !wordmarkEl.style.willChange) {
      wordmarkEl.style.willChange = 'transform, font-variation-settings';
    }

    const scrollY = window.scrollY;
    const progress = Math.min(1, Math.max(0, scrollY / scrollAnimationEnd));
    const easedProgress = easeInOutCubic(progress);
    
    // Calculate wiggle amplitude directly
    let wiggleAmplitude;
    if (progress <= 0.33) {
      wiggleAmplitude = 1;
    } else if (progress <= 0.5) {
      wiggleAmplitude = 1 - ((progress - 0.33) / 0.17);
    } else {
      wiggleAmplitude = 0;
    }

    // Early exit for performance - stop RAF loop when no animation needed
    if (wiggleAmplitude <= 0.001 && progress >= 0.5) {
      if (wordmarkEl) {
        wordmarkEl.style.willChange = '';
      }
      rafRunning = false;
      return;
    }

    // Pause when beyond scroll range
    if (PERF_PATCH_ENABLED && scrollY > scrollAnimationEnd) {
      if (wordmarkEl) {
        wordmarkEl.style.willChange = '';
      }
      rafRunning = false;
      return;
    }

    // Animate Font Variation Settings with Wiggle
    const activeAxes = PERF_PATCH_ENABLED ? getActiveAxes(wiggleAmplitude) : Object.keys(AXES_CONFIG);
    
    letters.forEach((letter, i) => {
      const finalSettings = {};

      // Primary animation step - move each axis value 
      if (PERF_PATCH_ENABLED) {
        activeAxes.forEach(axis => {
          const range = AXES_RANGES[axis];
          letterStates[i].currentValues[axis] +=
            letterStates[i].directions[axis] * range * letterStates[i].speed;
          if (
            letterStates[i].currentValues[axis] >= AXES_CONFIG[axis].max ||
            letterStates[i].currentValues[axis] <= AXES_CONFIG[axis].min
          ) {
            letterStates[i].directions[axis] *= -1;
          }
        });
      } else {
        for (const axis in AXES_CONFIG) {
          const range = AXES_RANGES[axis];
          letterStates[i].currentValues[axis] +=
            letterStates[i].directions[axis] * range * letterStates[i].speed;
          if (
            letterStates[i].currentValues[axis] >= AXES_CONFIG[axis].max ||
            letterStates[i].currentValues[axis] <= AXES_CONFIG[axis].min
          ) {
            letterStates[i].directions[axis] *= -1;
          }
        }
      }

      // Apply balanced relationships between axes 
      balancedAxes.forEach(({ axis1, axis2, correlation }) => {
        const shouldApply = PERF_PATCH_ENABLED 
          ? (activeAxes.includes(axis1) && activeAxes.includes(axis2))
          : true;
        
        if (shouldApply) {
          const range1 = AXES_RANGES[axis1];
          const normalizedPos1 =
            (letterStates[i].currentValues[axis1] - AXES_CONFIG[axis1].min) /
            range1;
          const targetPos2 =
            correlation < 0
              ? 1 - normalizedPos1 * Math.abs(correlation)
              : normalizedPos1 * correlation;
          const range2 = AXES_RANGES[axis2];
          const targetValue2 = AXES_CONFIG[axis2].min + targetPos2 * range2;
          letterStates[i].currentValues[axis2] =
            letterStates[i].currentValues[axis2] * 0.7 + targetValue2 * 0.3;
        }
      });

      // Legibility protection
      const shouldCheckLegibility = PERF_PATCH_ENABLED 
        ? (activeAxes.includes('wght') && activeAxes.includes('XOPQ'))
        : true;
      if (shouldCheckLegibility) {
        const weightNormalized =
          (letterStates[i].currentValues.wght - AXES_CONFIG.wght.min) /
          AXES_RANGES.wght;
        const xopqNormalized =
          (letterStates[i].currentValues.XOPQ - AXES_CONFIG.XOPQ.min) /
          AXES_RANGES.XOPQ;
        if (weightNormalized < 0.3 && xopqNormalized < 0.3) {
          if (Math.random() < 0.5) {
            letterStates[i].currentValues.wght =
              AXES_CONFIG.wght.min + AXES_RANGES.wght * 0.4;
          } else {
            letterStates[i].currentValues.XOPQ =
              AXES_CONFIG.XOPQ.min + AXES_RANGES.XOPQ * 0.4;
          }
        }
      }

      // Blend the wiggling animation with the scroll-based "settling" animation
      const axesToProcess = PERF_PATCH_ENABLED ? activeAxes : Object.keys(AXES_CONFIG);
      axesToProcess.forEach(axis => {
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
          const neutralValue =
            (AXES_CONFIG[axis].min + AXES_CONFIG[axis].max) / 2;
          finalValue = lerp(
            neutralValue,
            state.currentValues[axis],
            wiggleAmplitude
          );
        }

        finalSettings[axis] = finalValue;
      });

      letter.style.fontVariationSettings = Object.entries(finalSettings)
        .map(([k, v]) => `"${k}" ${Math.round(v)}`)
        .join(", ");
    });

    // Continue RAF loop while in animation range
    if (scrollY <= scrollAnimationEnd) {
      requestAnimationFrame(masterAnimationLoop);
    } else {
      if (wordmarkEl) {
        wordmarkEl.style.willChange = '';
      }
      rafRunning = false;
    }
  }

  // --- EVENT BINDING & REDUCED MOTION ---
  function setup() {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Always clean up previous listeners
    window.removeEventListener("scroll", handleScroll);

    if (prefersReduced) {
      // Set final, static state for reduced motion
      const root = document.documentElement;
      root.style.setProperty('--hero-bg-opacity', '0');
      root.style.setProperty('--content-opacity', '1');
      root.style.setProperty('--nav-opacity', '1');
      root.style.setProperty('--wiggle-amplitude', '0');
      document.body.classList.add("no-animation-timeline");
    } else {
      document.body.classList.remove("no-animation-timeline");
      
      handleScroll(); // Initial call to set progress
      // Start perpetual RAF loop
      if (!rafRunning) {
        rafRunning = true;
        masterAnimationLoop();
      }
      window.addEventListener("scroll", handleScroll, { passive: true });
    }
  }

  // Wait for fonts to be ready before setting up
  document.fonts.ready.then(setup);
  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener("change", setup);
});