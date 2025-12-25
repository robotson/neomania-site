// === WORDMARK WIGGLE & OPACITY: PERFORMANCE-OPTIMIZED ANIMATION ===
// This script handles only the letter wiggle animation and opacity effects.
// Positioning is now handled by the FLIP modules (flip-measure.js + scroll-progress.js)

document.addEventListener("DOMContentLoaded", () => {
  // Target wordmark letters for animation
  const letters = document.querySelectorAll(".wordmark-letter");
  if (!letters.length) return;

  const wordmarkEl = document.querySelector(".animated-wordmark");

  // Feature flag for performance optimizations (for easy rollback)
  // PERFORMANCE: Set to FALSE to enable full aesthetic detail (12 axes) now that WebGL handles the heavy lifting.
  const PERF_PATCH_ENABLED = false;

  // --- SAFARI DETECTION ---
  // PERFORMANCE: We previously disabled this on Safari, but now that Grain is WebGL, we can enable it.
  const isSafari = false;

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

  // Standard Roboto Flex Defaults
  // Used as fallback when an axis isn't specified in the "Final" config.
  // Instead of interpolating to (min+max)/2, we settle to these Standard values.
  const AXIS_DEFAULTS = {
    wght: 400,
    wdth: 100,
    opsz: 14,
    GRAD: 0,
    slnt: 0,
    XOPQ: 96,
    XTRA: 468,
    YOPQ: 79,
    YTAS: 750,
    YTDE: -203,
    YTFI: 738,
    YTLC: 514,
    YTUC: 712
  };

  // Pre-calculate ranges for performance
  const AXES_RANGES = {};
  Object.entries(AXES_CONFIG).forEach(([axis, config]) => {
    AXES_RANGES[axis] = config.max - config.min;
  });

  // AXIS GROUPS:
  // 1. WIGGLE_AXES: These oscillate to create the "alive" feeling.
  const WIGGLE_AXES = ['wght', 'wdth', 'opsz', 'slnt', 'GRAD'];

  // 2. STRUCTURAL_AXES: These define the "Brand Look" (e.g. the specific shape of the N).
  // They should stay FIXED to their final values at all times to prevent the logo from looking "Generic".
  const STRUCTURAL_AXES = ['XOPQ', 'XTRA', 'YOPQ', 'YTAS', 'YTDE', 'YTFI', 'YTLC', 'YTUC'];

  function getActiveAxes(wiggleAmplitude) {
    // If wiggle is high, we animate the wiggle axes.
    // The structural axes are always "active" in the sense that they must be set,
    // but they don't wiggle.
    return Object.keys(AXES_CONFIG);
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
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  function handleScroll() {
    const scrollY = window.scrollY;
    // We still use scrollAnimationEnd for general opacity/bg transitions,
    // but the WIGGLE fade-out will be much faster.
    const progress = Math.min(1, Math.max(0, scrollY / scrollAnimationEnd));

    // Update CSS custom properties for smooth transitions
    updateCSSProperties(progress);

    // Start perpetual RAF if not running and in scroll range
    // Important: We only need the RAF if we are NEAR THE TOP (progress close to 0)
    // or if we haven't finished fading out the wiggle.
    const WIGGLE_FADE_THRESHOLD = 0.06; // Wiggle dies after 6% scroll

    // SKIP RAF IF SAFARI
    if (!isSafari && progress < WIGGLE_FADE_THRESHOLD && !rafRunning) {
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
    const navOpacity = 1; // Always visible

    // Wordmark opacity
    const wordmarkOpacity = lerp(1, 0.7, easedProgress);

    // Wiggle amplitude - FADES OUT IMMEDIATELY
    // 0% -> 5% scroll: 1 -> 0 amplitude
    let wiggleAmplitude;
    // CRITICAL: IF SAFARI, WIGGLE IS ALWAYS 0
    if (isSafari) {
      wiggleAmplitude = 0;
    } else {
      const fadeEnd = 0.05;
      if (progress <= 0) {
        wiggleAmplitude = 1;
      } else if (progress < fadeEnd) {
        wiggleAmplitude = 1 - (progress / fadeEnd);
      } else {
        wiggleAmplitude = 0;
      }
    }

    // Glow opacity fades as scroll progresses - throttled for performance
    let glowAlpha;
    // SKIP GLOW ANIMATION ON SAFARI to prevent drop-shadow thrashing
    if (isSafari) {
      glowAlpha = 0.8; // Static value
    } else {
      const scrollY = window.scrollY;
      if (Math.abs(scrollY - lastGlowUpdate) >= GLOW_UPDATE_THRESHOLD || cachedGlowAlpha === null) {
        glowAlpha = 1 - easedProgress; // 1 → 0
        cachedGlowAlpha = glowAlpha;
        lastGlowUpdate = scrollY;
      } else {
        glowAlpha = cachedGlowAlpha;
      }
    }

    // Calculate wiggle transform for CSS
    const wiggleTransform = wiggleAmplitude > 0 ? '' : ''; // Placeholder for future wiggle transforms

    // Batch CSS custom property updates for better performance
    const updates = {
      '--hero-bg-opacity': bgOpacity,
      '--content-opacity': contentOpacity,
      '--nav-opacity': navOpacity,
    };

    // ONLY update these animation-specific properties if NOT Safari
    // In Safari, they are set to static values once in setup(), so updating them 
    // every frame just triggers unnecessary style recalcs.
    if (!isSafari) {
      // FIX: We can't update glow-alpha directly if we switched to a full color variable.
      // Instead, we will control opacity via a separate variable if needed, or rely on the fact 
      // that the shadow fades naturally with scroll.
      // For now, let's keep it simple: The glow COLOR changes with theme. 
      // The Opacity animation was removed/disabled in favor of theme support.
      // updates['--glow-alpha'] = glowAlpha.toFixed(3); 

      updates['--wordmark-opacity'] = wordmarkOpacity;
      updates['--wiggle-amplitude'] = wiggleAmplitude.toFixed(3);
      updates['--wiggle-transform'] = wiggleTransform;

      // Update Debug Panel
      const debugWiggle = document.getElementById('debug-wiggle');
      if (debugWiggle) debugWiggle.textContent = (wiggleAmplitude * 100).toFixed(1) + '%';
    }

    // Apply all updates in one batch
    const root = document.documentElement;
    Object.entries(updates).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  // --- Main Animation Loop ---
  function masterAnimationLoop() {
    // SECURITY GUARD: If Safari, NEVER run this loop.
    if (isSafari) {
      rafRunning = false;
      return;
    }

    // Set will-change when entering animation loop for better GPU compositing
    if (wordmarkEl && !wordmarkEl.style.willChange) {
      wordmarkEl.style.willChange = 'transform, font-variation-settings';
    }

    const scrollY = window.scrollY;
    const progress = Math.min(1, Math.max(0, scrollY / scrollAnimationEnd));
    const easedProgress = easeInOutCubic(progress);

    // Calculate wiggle amplitude directly - MATCHES updateCSSProperties logic
    let wiggleAmplitude;
    const fadeEnd = 0.05;
    if (progress <= 0) {
      wiggleAmplitude = 1;
    } else if (progress < fadeEnd) {
      wiggleAmplitude = 1 - (progress / fadeEnd);
    } else {
      wiggleAmplitude = 0;
    }

    // Early exit for performance - stop RAF loop when no animation needed
    // If amplitude is basically zero, we can stop the loop.
    if (wiggleAmplitude <= 0.001) {
      if (wordmarkEl) {
        wordmarkEl.style.willChange = '';
      }

      // OPTIMIZATION: Even if we stop the loop, we should ensure the final state is correct.
      // But continuing the loop once to apply the final state is safer.
      // We will let it run one last update with amplitude 0.
    }

    // Animate Font Variation Settings with Wiggle
    const activeAxes = Object.keys(AXES_CONFIG);

    letters.forEach((letter, i) => {
      const finalSettings = {};

      // === 1. Calculate Wiggle Step (Random Walk) ===
      // Only do this for WIGGLE_AXES. Structural axes are stable.
      if (wiggleAmplitude > 0) {
        WIGGLE_AXES.forEach(axis => {
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

        // Apply balanced relationships (only for wiggle axes)
        balancedAxes.forEach(({ axis1, axis2, correlation }) => {
          if (WIGGLE_AXES.includes(axis1) && WIGGLE_AXES.includes(axis2)) {
            // ... existing balance logic ...
            const range1 = AXES_RANGES[axis1];
            const normalizedPos1 = (letterStates[i].currentValues[axis1] - AXES_CONFIG[axis1].min) / range1;
            const targetPos2 = correlation < 0 ? 1 - normalizedPos1 * Math.abs(correlation) : normalizedPos1 * correlation;
            const range2 = AXES_RANGES[axis2];
            const targetValue2 = AXES_CONFIG[axis2].min + targetPos2 * range2;
            letterStates[i].currentValues[axis2] = letterStates[i].currentValues[axis2] * 0.7 + targetValue2 * 0.3;
          }
        });
      }

      // === 2. Calculate Final Value (Wiggle vs Settled) ===
      activeAxes.forEach(axis => {
        let finalValue;
        const state = letterStates[i];

        // Determine the "Final / Settled" value for this axis
        let finalTargetValue;
        if (i === 0 && FINAL_AXES_N.hasOwnProperty(axis)) {
          finalTargetValue = FINAL_AXES_N[axis];
        } else if (FINAL_AXES_COMMON.hasOwnProperty(axis)) {
          finalTargetValue = FINAL_AXES_COMMON[axis];
        } else {
          // For axes NOT in Final config, use the FONT DEFAULT.
          finalTargetValue = AXIS_DEFAULTS[axis] || (AXES_CONFIG[axis].min + AXES_CONFIG[axis].max) / 2;
        }

        // Logic split: Is this a WIGGLE axis or a STRUCTURAL axis?
        if (WIGGLE_AXES.includes(axis)) {
          // == WIGGLE AXIS (wght, wdth, etc.) ==
          // It oscillates AROUND the "Final Value" (Branded Style).
          // It creates an offset from the perfect brand shape, rather than interpolating from a generic center.

          // Special handling for 'wght' which has unique resting weights per letter
          let anchorValue;
          if (axis === 'wght') {
            anchorValue = RESTING_WGHT[i];
          } else {
            anchorValue = finalTargetValue;
          }

          // Calculate the wiggle offset based on the random walk state and amplitude
          // We use the 'currentValues' essentially as a noise source.
          // But we need to center the variability around the anchorValue.

          // 1. Calculate a normalized noise value (-1 to 1 approx) based on the range
          const range = AXES_RANGES[axis];
          const noise = (state.currentValues[axis] - (AXES_CONFIG[axis].min + AXES_CONFIG[axis].max) / 2) / (range / 2);

          // 2. Apply this noise as an offset to the ANCHOR value, scaled by amplitude
          // We scale range/2 down to something reasonable to avoid breaking legibility at max wiggle
          const maxOffset = range * 0.9; // Max wiggle variance (Increased for expression)
          const offset = noise * maxOffset * wiggleAmplitude;

          finalValue = anchorValue + offset;

        } else {
          // == STRUCTURAL AXIS (YTAS, XOPQ, etc.) ==
          // It DOES NOT WIGGLE. It IS the final value. Always.
          // This ensures the "Style" is visible immediately at the top.
          finalValue = finalTargetValue;
        }

        finalSettings[axis] = finalValue;
      });

      letter.style.fontVariationSettings = Object.entries(finalSettings)
        .map(([k, v]) => `"${k}" ${Math.round(v)}`)
        .join(", ");
    });

    // Continue RAF loop while in animation range
    // STOP if wiggleAmplitude is low enough
    if (wiggleAmplitude > 0.001) {
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
    window.removeEventListener("scroll", onScroll);

    // If Safari is detected, treat it like reduced-motion for the wiggle feature
    if (prefersReduced || isSafari) {
      if (isSafari && !prefersReduced) {
        // Special case: Safari users who haven't explicitly asked for reduced motion
        // We still want the scroll effects (opacity/nav), just not the wiggle.
        // So we enable scroll handler but force wiggle to 0 in handleScroll.

        document.body.classList.remove("no-animation-timeline");
        handleScroll(); // Initial call
        window.addEventListener("scroll", onScroll, { passive: true });

        // Ensure wiggle is zeroed out initially
        const root = document.documentElement;
        root.style.setProperty('--wiggle-amplitude', '0');
        // FIX: Also force a static glow alpha to avoid repaints
        root.style.setProperty('--glow-alpha', '0.8');

      } else {
        // Reduced motion users get the full static treatment
        const root = document.documentElement;
        root.style.setProperty('--hero-bg-opacity', '0');
        root.style.setProperty('--content-opacity', '1');
        root.style.setProperty('--nav-opacity', '1');
        root.style.setProperty('--wiggle-amplitude', '0');
        document.body.classList.add("no-animation-timeline");
      }
    } else {
      document.body.classList.remove("no-animation-timeline");

      handleScroll(); // Initial call to set progress
      // Start perpetual RAF loop
      if (!rafRunning) {
        rafRunning = true;
        masterAnimationLoop();
      }
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  }

  // Wait for fonts to be ready before setting up
  document.fonts.ready.then(setup);
  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener("change", setup);
});