// === WORDMARK SEQUENCE: SAFARI-COMPATIBLE SCROLL ANIMATION ===
// This script creates a smooth, bidirectional scroll experience using CSS custom properties
// instead of DOM manipulation. Compatible with Safari and all modern browsers.

document.addEventListener("DOMContentLoaded", () => {
  // Target wordmark letters for animation
  const letters = document.querySelectorAll(".wordmark-letter");
  if (!letters.length) return;

  // Feature flag for performance optimizations (for easy rollback)
  const PERF_PATCH_ENABLED = window.__NEOMANIA_PERF_PATCH__ !== false;

  // --- STATE & CONFIGURATION ---
  let animationFrameId = null;
  let cachedAmp = null; // Cache wiggle amplitude to avoid repeated getComputedStyle calls
  // isHeroVisible removed - Fix 5: Simplified to scroll-based logic
  let lastNavPointerEvents = null; // Fix 3b: Track last pointer events state
  let lastContentPointerEvents = null; // Fix 3b: Track last pointer events state
  let rafRunning = false; // 2-B: Perpetual RAF state
  const scrollAnimationEnd = window.innerHeight; // Animation completes over 1x viewport height
  // Fix 6a: Removed unused initialFontSize & finalFontSize vars
  const baseFontSize = 3 * 16; // 48 px (matches new CSS)
  
  // MW-1: Responsive scaling system - returns scale factor instead of font size
  function getResponsiveScale(progress) {
    const viewportWidth = window.innerWidth;
    
    // Continuous scaling using viewport width
    // Scale from 40px to 112px equivalent (relative to 64px base)
    const minViewport = 320;
    const maxViewport = 1920;
    const minFontSize = 40;
    const maxFontSize = 112;
    
    // Clamp viewport width to our range
    const clampedViewport = Math.max(minViewport, Math.min(maxViewport, viewportWidth));
    
    // Calculate continuous font size based on viewport width
    const viewportProgress = (clampedViewport - minViewport) / (maxViewport - minViewport);
    const responsiveBaseSize = lerp(minFontSize, maxFontSize, viewportProgress);
    
    // Interpolate between responsive base size and final size (2rem = 32px)
    const finalFontSize = 2.0 * 16; // 32 px target when fully settled
    const targetSize = lerp(responsiveBaseSize, finalFontSize, progress);
    
    const rawScale = targetSize / baseFontSize;
    /* Fix-SCALE-2: hard clamp so it never explodes or collapses - increased upper limit for big screens */
    return Math.max(0.4, Math.min(2.5, rawScale));
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

  // Pre-calculate ranges for performance (avoid calculating every frame)
  const AXES_RANGES = {};
  Object.entries(AXES_CONFIG).forEach(([axis, config]) => {
    AXES_RANGES[axis] = config.max - config.min;
  });

  // QW-2: Axis profile switching - lite mode uses fewer axes for performance
  const ACTIVE_AXES_FULL = Object.keys(AXES_CONFIG);
  const ACTIVE_AXES_LITE = ['wght', 'wdth', 'opsz']; // Fix 3c: Keep opsz, drop XOPQ
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
        axis === "wght" ? RESTING_WGHT[i] : 
        axis === "slnt" ? 0 : // Start with no slant
        (range.min + range.max) / 2,
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
    // Truly smooth cubic ease-in-out without 50% discontinuity
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
    
    // Reset cached amplitude when scroll changes (only while wiggle active)
    if (progress < 0.5) cachedAmp = null;
    
    // Update CSS custom properties for smooth transitions
    updateCSSProperties(progress);
    
    // 2-B: Start perpetual RAF if not running and in scroll range
    if (scrollY <= scrollAnimationEnd && !rafRunning) {
      rafRunning = true;
      animationFrameId = requestAnimationFrame(masterAnimationLoop);
    }
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
    
    // Calculate all values first (no DOM access during calculations)
    const heroHeight = lerp(window.innerHeight, 80, easedProgress); // Back to height changes
    const heroTop = lerp(0, 0, easedProgress);
    const bgOpacity = easedProgress * 0.75;
    const contentOpacity = Math.min(1, progress / 0.1);
    const navOpacity = progress > 0.3 ? Math.min(1, (progress - 0.3) / 0.3) : 0;
    
    // MW-1: Calculate scale factor instead of font size
    const currentScale = getResponsiveScale(easedProgress);
    
    // Removed shadow calculations - now using filter-based glow
    
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
    
    // 2-C: Glow opacity fades as scroll progresses
    const glowAlpha = 1 - easedProgress; // 1 → 0
    
    // Batch all CSS custom property updates for better performance
    const updates = {
      '--hero-container-height': `${heroHeight}px`,
      '--hero-top': `${heroTop}px`,
      '--hero-bg-opacity': bgOpacity,
      '--content-opacity': contentOpacity,
      '--nav-opacity': navOpacity,
      '--glow-alpha': glowAlpha.toFixed(3), // GPU-friendly glow opacity
      '--wordmark-opacity': wordmarkOpacity,
      '--wiggle-amplitude': wiggleAmplitude
    };
    
    // Apply all updates in one batch
    const root = document.documentElement;
    Object.entries(updates).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Fix cascade precedence: set transform directly on element
    // Keep full precision for smooth scaling
    const wordmarkEl = document.querySelector('.animated-wordmark');
    if (wordmarkEl) {
      wordmarkEl.style.setProperty(
        '--wordmark-transform',
        `scale(${currentScale})`
      );
    }

    // Fix 3b: Guard pointer events toggle - only set when value changes
    const newNavPointerEvents = navOpacity > 0.1 ? 'auto' : 'none';
    const newContentPointerEvents = contentOpacity > 0.1 ? 'auto' : 'none';
    
    if (newNavPointerEvents !== lastNavPointerEvents) {
      const headerNav = document.querySelector('.header-nav');
      const headerNavMobile = document.querySelector('.header-nav--mobile'); // Fix 6c
      if (headerNav) headerNav.style.pointerEvents = newNavPointerEvents;
      if (headerNavMobile) headerNavMobile.style.pointerEvents = newNavPointerEvents;
      lastNavPointerEvents = newNavPointerEvents;
    }
    
    if (newContentPointerEvents !== lastContentPointerEvents) {
      const mainContent = document.querySelector('.main-content');
      if (mainContent) mainContent.style.pointerEvents = newContentPointerEvents;
      lastContentPointerEvents = newContentPointerEvents;
    }
  }

  // --- Main Animation Loop ---
  function masterAnimationLoop(timestamp) {
    // C-3: Set will-change when entering animation loop for better GPU compositing
    const wordmarkEl = document.querySelector('.animated-wordmark');
    if (wordmarkEl && !wordmarkEl.style.willChange) {
      wordmarkEl.style.willChange = 'transform';
    }

    const scrollY = window.scrollY;
    const progress = Math.min(1, Math.max(0, scrollY / scrollAnimationEnd));
    const easedProgress = easeInOutCubic(progress);
    
    // QW-1: Cache wiggle amplitude to avoid repeated getComputedStyle calls
    let wiggleAmplitude;
    if (PERF_PATCH_ENABLED) {
      if (!cachedAmp) {
        cachedAmp = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--wiggle-amplitude') || '1'
        );
      }
      wiggleAmplitude = cachedAmp;
    } else {
      wiggleAmplitude = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--wiggle-amplitude') || '1'
      );
    }

    // Early exit for performance - stop RAF loop when no animation needed
    if (wiggleAmplitude <= 0.001 && progress >= 0.5) {
      // C-3: Clear will-change when parking RAF to avoid unnecessary compositing
      const wordmarkEl = document.querySelector('.animated-wordmark');
      if (wordmarkEl) {
        wordmarkEl.style.willChange = '';
      }
      rafRunning = false;
      animationFrameId = null;
      return;
    }

    // Fix 5: Simplified visibility logic - pause when beyond scroll range
    if (PERF_PATCH_ENABLED && scrollY > scrollAnimationEnd) {
      // C-3: Clear will-change when parking RAF to avoid unnecessary compositing
      const wordmarkEl = document.querySelector('.animated-wordmark');
      if (wordmarkEl) {
        wordmarkEl.style.willChange = '';
      }
      rafRunning = false;
      animationFrameId = null;
      return;
    }

    // 4. Animate Font Variation Settings with Wiggle
    // QW-2: Use dynamic axis set based on wiggle amplitude
    const activeAxes = PERF_PATCH_ENABLED ? getActiveAxes(wiggleAmplitude) : Object.keys(AXES_CONFIG);
    
    letters.forEach((letter, i) => {
      const finalSettings = {};

      // Primary animation step - move each axis value 
      if (PERF_PATCH_ENABLED) {
        // Use filtered active axes for performance
        activeAxes.forEach(axis => {
          const range = AXES_RANGES[axis]; // Use pre-calculated range
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
        // Original logic - all axes
        for (const axis in AXES_CONFIG) {
          const range = AXES_RANGES[axis]; // Use pre-calculated range
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
          const range1 = AXES_RANGES[axis1]; // Use pre-calculated range
          const normalizedPos1 =
            (letterStates[i].currentValues[axis1] - AXES_CONFIG[axis1].min) /
            range1;
          const targetPos2 =
            correlation < 0
              ? 1 - normalizedPos1 * Math.abs(correlation)
              : normalizedPos1 * correlation;
          const range2 = AXES_RANGES[axis2]; // Use pre-calculated range
          const targetValue2 = AXES_CONFIG[axis2].min + targetPos2 * range2;
          letterStates[i].currentValues[axis2] =
            letterStates[i].currentValues[axis2] * 0.7 + targetValue2 * 0.3;
        }
      });

      // Legibility protection (using pre-calculated ranges)
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

        // Always apply active axes (they're already filtered)
        finalSettings[axis] = finalValue;
      });

      letter.style.fontVariationSettings = Object.entries(finalSettings)
        .map(([k, v]) => `"${k}" ${Math.round(v)}`)
        .join(", ");
    });

    // 2-B: Perpetual RAF - keep running while hero visible, stop cleanly when beyond scroll range
    if (scrollY <= scrollAnimationEnd) {
      animationFrameId = requestAnimationFrame(masterAnimationLoop);
    } else {
      // C-3: Clear will-change when parking RAF to avoid unnecessary compositing
      const wordmarkEl = document.querySelector('.animated-wordmark');
      if (wordmarkEl) {
        wordmarkEl.style.willChange = '';
      }
      rafRunning = false;
      animationFrameId = null;      // let it park when past animation range
    }
  }

  // Fix 5: Removed IntersectionObserver - using simpler scroll-based logic

  // --- EVENT BINDING & REDUCED MOTION ---
  function setup() {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    
    // Fix 6a: Removed unused initialFontSize setup

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
      // Apply reduced motion scale directly to element for cascade precedence
      const wordmarkEl = document.querySelector('.animated-wordmark');
      if (wordmarkEl) {
        wordmarkEl.style.setProperty('--wordmark-transform', `scale(${getResponsiveScale(1)})`);
      }
      root.style.setProperty('--wordmark-text-shadow', 'none');
      root.style.setProperty('--wiggle-amplitude', '0');
      document.body.classList.add("no-animation-timeline");
    } else {
      document.body.classList.remove("no-animation-timeline");
      
      // Fix 5: Removed visibility observer setup - using scroll-based logic
      
      handleScroll(); // Initial call to set progress
      // 2-B: Start perpetual RAF loop
      if (!rafRunning) {
        rafRunning = true;
        masterAnimationLoop(); // Start the animation loop
      }
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
