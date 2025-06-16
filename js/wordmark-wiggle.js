// ===== WORDMARK WIGGLE - Pure Font-Variation Animation =====

function startWordmarkWiggle() {
  const letters = document.querySelectorAll(".wordmark-letter");
  if (!letters.length) {
    console.log("⚠️ WORDMARK: No letters found, skipping animation", {
      timestamp: Date.now(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollY: window.scrollY,
      },
      querySelectorResults: {
        letters: document.querySelectorAll(".wordmark-letter").length,
        wordmark: !!document.querySelector(".animated-wordmark"),
        hero: !!document.querySelector(".main-hero"),
      },
    });
    return;
  }
  // Initialize variables first
  let isAnimating = false;
  let isSettling = false;
  let frameCount = 0;
  let animationId = null;
  let letterStates = null;

  // Helper function to get animation stats (now variables are accessible)
  function getAnimationStats(label) {
    const wordmark = document.querySelector(
      ".animated-wordmark .wordmark-text"
    );
    const hero = document.querySelector(".main-hero");

    const stats = {
      timestamp: Date.now(),
      label,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollY: window.scrollY,
      },
      animation: {
        isAnimating: isAnimating || false,
        isSettling: isSettling || false,
        frameCount: frameCount || 0,
        letterCount: letters.length,
      },
      wordmark: wordmark
        ? {
            fontSize: getComputedStyle(wordmark).fontSize,
            fontVariationSettings:
              getComputedStyle(wordmark).fontVariationSettings,
            position: wordmark.getBoundingClientRect(),
          }
        : null,
      hero: hero
        ? {
            classes: Array.from(hero.classList),
            height: hero.offsetHeight,
            position: hero.getBoundingClientRect(),
            computedPosition: getComputedStyle(hero).position,
          }
        : null,
      letterStates: letterStates
        ? letterStates.slice(0, 3).map((state, i) => ({
            letterIndex: i,
            currentValues: Object.fromEntries(
              Object.entries(state.currentValues).slice(0, 4) // first 4 axes
            ),
            speed: state.speed,
          }))
        : null,
    };

    // Pretty print with visual separators
    console.group(`🔤 WORDMARK DEBUG: ${label}`);
    console.log(
      "⏰ Timestamp:",
      new Date(stats.timestamp).toLocaleTimeString()
    );

    // Viewport info in a table for easy reading
    console.table({
      "Viewport Width": `${stats.viewport.width}px`,
      "Viewport Height": `${stats.viewport.height}px`,
      "Scroll Y": `${stats.viewport.scrollY}px`,
    });

    // Animation state
    console.log("🎬 Animation State:");
    console.table({
      "Is Animating": stats.animation.isAnimating,
      "Is Settling": stats.animation.isSettling,
      "Frame Count": stats.animation.frameCount,
      "Letter Count": stats.animation.letterCount,
    });

    // Wordmark dimensions and position
    if (stats.wordmark) {
      console.log("📏 Wordmark Dimensions & Position:");
      const pos = stats.wordmark.position;
      console.table({
        "Font Size": stats.wordmark.fontSize,
        Top: `${Math.round(pos.top)}px`,
        Left: `${Math.round(pos.left)}px`,
        Width: `${Math.round(pos.width)}px`,
        Height: `${Math.round(pos.height)}px`,
        Bottom: `${Math.round(pos.bottom)}px`,
        Right: `${Math.round(pos.right)}px`,
      });
      console.log("🎛️ Font Variations:", stats.wordmark.fontVariationSettings);
    }

    // Hero dimensions and position
    if (stats.hero) {
      console.log("🦸 Hero Element Dimensions & Position:");
      const pos = stats.hero.position;
      console.table({
        "CSS Position": stats.hero.computedPosition,
        Classes: stats.hero.classes.join(" "),
        "Offset Height": `${stats.hero.height}px`,
        "Bounding Top": `${Math.round(pos.top)}px`,
        "Bounding Left": `${Math.round(pos.left)}px`,
        "Bounding Width": `${Math.round(pos.width)}px`,
        "Bounding Height": `${Math.round(pos.height)}px`,
        "Bounding Bottom": `${Math.round(pos.bottom)}px`,
        "Bounding Right": `${Math.round(pos.right)}px`,
      });
    }

    // Letter states in a compact table
    if (stats.letterStates && stats.letterStates.length > 0) {
      console.log("🔤 Letter States (first 3):");
      const letterTable = {};
      stats.letterStates.forEach((state, i) => {
        letterTable[`Letter ${i}`] = {
          Speed: state.speed.toFixed(4),
          Weight: Math.round(state.currentValues.wght || 0),
          Width: Math.round(state.currentValues.wdth || 0),
          OptSize: Math.round(state.currentValues.opsz || 0),
          Gradient: Math.round(state.currentValues.GRAD || 0),
        };
      });
      console.table(letterTable);
    }

    console.groupEnd();

    return stats;
  }

  console.log(
    `🔤 WORDMARK: Found ${letters.length} letters, initializing animation`
  );
  getAnimationStats("INIT");

  /* ─────── final axis values for settling ─────── */
  const FINAL_AXIS = {
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

  // Variable font axes configuration
  const axes = {
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

  // Create balanced relationships between parameters
  const balancedAxes = [
    // When one gets thinner, the other gets thicker (negative correlation)
    { axis1: "wght", axis2: "XOPQ", correlation: -0.6 },
    { axis1: "wdth", axis2: "XOPQ", correlation: -0.4 },
    { axis1: "wght", axis2: "wdth", correlation: -0.3 },
  ];

  // Initialize state for each letter
  letterStates = Array.from(letters).map(() => ({
    currentValues: Object.fromEntries(
      Object.entries(axes).map(([axis, range]) => [
        axis,
        Math.random() * (range.max - range.min) + range.min,
      ])
    ),
    directions: Object.fromEntries(
      Object.keys(axes).map((axis) => [axis, Math.random() < 0.5 ? -1 : 1])
    ),
    updateCounter: 0,
    // Give each letter a slightly different animation speed
    speed: Math.random() * 0.006 + 0.01, // Between 0.006 and 0.01 (slower for smoothness)
  }));

  // Throttle animation updates to every few frames
  const LETTER_ANIMATION_THROTTLE = 1;

  function animate() {
    frameCount++;

    // Only update letters every few frames
    if (frameCount % LETTER_ANIMATION_THROTTLE === 0) {
      letters.forEach((letter, index) => {
        const state = letterStates[index];
        state.updateCounter++;

        // Only check for direction changes occasionally
        if (state.updateCounter % 10 === 0) {
          for (let axis in axes) {
            if (Math.random() < 0.01) {
              state.directions[axis] *= -1;
            }
          }
        }

        const targetValues = isSettling ? FINAL_AXIS : axes;

        // Primary animation step
        for (let axis in axes) {
          if (isSettling) {
            /* lerp toward final axis values */
            state.currentValues[axis] +=
              (FINAL_AXIS[axis] - state.currentValues[axis]) * 0.12; // easing
          } else {
            /* regular wiggle */
            state.currentValues[axis] +=
              state.directions[axis] *
              (axes[axis].max - axes[axis].min) *
              state.speed;
          }

          if (state.currentValues[axis] <= axes[axis].min) {
            state.currentValues[axis] = axes[axis].min;
            state.directions[axis] = 1;
          } else if (state.currentValues[axis] >= axes[axis].max) {
            state.currentValues[axis] = axes[axis].max;
            state.directions[axis] = -1;
          }
        }

        /* Apply balanced relationships only while free-wiggling */
        if (!isSettling) {
          balancedAxes.forEach((relation) => {
            const { axis1, axis2, correlation } = relation;

            // Get normalized position of first axis (0 to 1)
            const range1 = axes[axis1].max - axes[axis1].min;
            const normalizedPos1 =
              (state.currentValues[axis1] - axes[axis1].min) / range1;

            // Calculate target position for second axis based on correlation
            // Negative correlation: when one is high, the other should be low
            let targetPos2;
            if (correlation < 0) {
              targetPos2 = 1 - normalizedPos1 * Math.abs(correlation);
            } else {
              targetPos2 = normalizedPos1 * correlation;
            }

            // Calculate a "pull" toward the balanced relationship
            // but don't override the independent animation completely
            const range2 = axes[axis2].max - axes[axis2].min;
            const targetValue2 = axes[axis2].min + targetPos2 * range2;
            const currentValue2 = state.currentValues[axis2];

            // Blend between current value and balanced target (30% influence)
            state.currentValues[axis2] =
              currentValue2 * 0.7 + targetValue2 * 0.3;
          });
        }

        if (!isSettling) {
          // Extra protection (only during free wiggle)
          const weightNormalized =
            (state.currentValues.wght - axes.wght.min) /
            (axes.wght.max - axes.wght.min);
          const xopqNormalized =
            (state.currentValues.XOPQ - axes.XOPQ.min) /
            (axes.XOPQ.max - axes.XOPQ.min);

          // If both weight and optical weight are in the lower 30%, boost one of them
          if (weightNormalized < 0.3 && xopqNormalized < 0.3) {
            if (Math.random() < 0.5) {
              state.currentValues.wght =
                axes.wght.min + (axes.wght.max - axes.wght.min) * 0.4;
            } else {
              state.currentValues.XOPQ =
                axes.XOPQ.min + (axes.XOPQ.max - axes.XOPQ.min) * 0.4;
            }
          }
        }

        // Apply the animation to the letter with rounding for performance
        letter.style.fontVariationSettings = Object.entries(state.currentValues)
          .map(([axis, value]) => `'${axis}' ${Math.round(value)}`)
          .join(", ");
      });

      /* stop when everyone is ~2 units away from final (slightly looser) */
      if (
        isSettling &&
        Array.from(letters).every((l, i) =>
          Object.entries(FINAL_AXIS).every(
            ([ax, fin]) => Math.abs(fin - letterStates[i].currentValues[ax]) < 2
          )
        )
      ) {
        console.log(
          "✅ SETTLE COMPLETE: All letters within tolerance, stopping animation"
        );
        getAnimationStats("SETTLE_COMPLETE");
        stopAnimation();
      }
    }

    if (isAnimating) {
      animationId = requestAnimationFrame(animate);
    }
  }

  function startAnimation() {
    if (!isAnimating) {
      isAnimating = true;
      console.log("🎯 WIGGLE START: Letter animation began");
      getAnimationStats("START_ANIMATION");
      animate();
    }
  }

  function stopAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
      isAnimating = false;
      console.log("⏹️ ANIMATION STOP: RAF cancelled, letters settled");
      getAnimationStats("STOP_ANIMATION");
    }
  }

  // Check for reduced motion preference initially
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  console.log(`🎚️ MOTION PREF: Reduced motion = ${prefersReducedMotion}`);
  getAnimationStats("MOTION_CHECK");
  if (!prefersReducedMotion) {
    startAnimation();
  } else {
    console.log(
      "⏸️ MOTION: Skipping initial animation due to reduced motion preference"
    );
    getAnimationStats("MOTION_SKIPPED");
  }

  // Listen for events from reduced-motion controller
  document.addEventListener("startWiggle", startAnimation);
  document.addEventListener("stopWiggle", stopAnimation);

  /* ─────── graceful settle when hero locks ─────── */
  function beginSettle() {
    /* turn off random direction changes & correlations */
    console.log("🎭 SETTLE BEGIN: Switching from wiggle to settling mode");
    getAnimationStats("SETTLE_BEGIN");
    isSettling = true;
    startAnimation(); // make sure RAF is running for the glide
    console.log("🎯 SETTLE: Easing toward final letter variations...");
    getAnimationStats("SETTLE_ACTIVE");
  }

  document.addEventListener("heroLocked", beginSettle, { once: true });

  // Return cleanup function
  return () => {
    stopAnimation();
    document.removeEventListener("startWiggle", startAnimation);
    document.removeEventListener("stopWiggle", stopAnimation);
    document.removeEventListener("heroLocked", beginSettle);
  };
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", startWordmarkWiggle);
