/**
 * Two‑stage sticky header system:
 * 1. First sentinel (at wordmark top) - tracks when wordmark reaches viewport top
 * 2. Second sentinel (at buffer top) - triggers final lock when buffer top scrolls past viewport top
 *
 * This creates smooth scroll-driven shrink → breathing room → final lock transition
 */

document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".main-hero");
  const buffer = document.getElementById("hero-buffer-spacer");
  const wordmarkSentinel = document.getElementById("hero-sentinel");
  const bufferSentinel = document.getElementById("buffer-sentinel");

  // Debug overlay elements
  const debugScroll = document.getElementById("debug-scroll");
  const debugHero = document.getElementById("debug-hero");
  const debugBuffer = document.getElementById("debug-buffer");
  const debugWordmark = document.getElementById("debug-wordmark");
  const debugBufferSentinel = document.getElementById("debug-buffer-sentinel");

  if (!hero || !buffer || !wordmarkSentinel || !bufferSentinel) {
    console.log("⚠️ STICKY FLAG: Missing required elements", {
      hero: !!hero,
      buffer: !!buffer,
      wordmarkSentinel: !!wordmarkSentinel,
      bufferSentinel: !!bufferSentinel,
    });
    return;
  }

  // Helper function to get comprehensive two-stage stats
  function getTwoStageStats(label) {
    const heroRect = hero.getBoundingClientRect();
    const bufferRect = buffer.getBoundingClientRect();
    const wordmarkSentinelRect = wordmarkSentinel.getBoundingClientRect();
    const bufferSentinelRect = bufferSentinel.getBoundingClientRect();
    const wordmark = document.querySelector(
      ".animated-wordmark .wordmark-text"
    );
    const wordmarkRect = wordmark ? wordmark.getBoundingClientRect() : null;

    const stats = {
      timestamp: Date.now(),
      label,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollY: window.scrollY,
        scrollX: window.scrollX,
      },
      hero: {
        classes: Array.from(hero.classList),
        height: hero.offsetHeight,
        position: heroRect,
        computedStyle: {
          position: getComputedStyle(hero).position,
          top: getComputedStyle(hero).top,
          zIndex: getComputedStyle(hero).zIndex,
        },
      },
      buffer: {
        classes: Array.from(buffer.classList),
        height: buffer.offsetHeight,
        position: bufferRect,
        computedHeight: getComputedStyle(buffer).height,
      },
      wordmarkSentinel: {
        height: wordmarkSentinel.offsetHeight,
        position: wordmarkSentinelRect,
        visible:
          wordmarkSentinelRect.top < window.innerHeight &&
          wordmarkSentinelRect.bottom > 0,
      },
      bufferSentinel: {
        height: bufferSentinel.offsetHeight,
        position: bufferSentinelRect,
        visible:
          bufferSentinelRect.top < window.innerHeight &&
          bufferSentinelRect.bottom > 0,
      },
      wordmark: wordmarkRect
        ? {
            fontSize: getComputedStyle(wordmark).fontSize,
            position: wordmarkRect,
            visible:
              wordmarkRect.top < window.innerHeight && wordmarkRect.bottom > 0,
          }
        : null,
    };

    // Pretty print with visual organization
    console.group(`🎯 TWO-STAGE STICKY DEBUG: ${label}`);
    console.log(
      "⏰ Timestamp:",
      new Date(stats.timestamp).toLocaleTimeString()
    );

    // Viewport and scroll info
    console.table({
      "Viewport Width": `${stats.viewport.width}px`,
      "Viewport Height": `${stats.viewport.height}px`,
      "Scroll Y": `${stats.viewport.scrollY}px`,
    });

    // Hero state
    console.log("🦸 Hero Element:");
    const heroPos = stats.hero.position;
    console.table({
      "CSS Position": stats.hero.computedStyle.position,
      Classes: stats.hero.classes.join(" "),
      Height: `${stats.hero.height}px`,
      Top: `${Math.round(heroPos.top)}px`,
      Bottom: `${Math.round(heroPos.bottom)}px`,
    });

    // Buffer state
    console.log("📦 Buffer Spacer:");
    const bufferPos = stats.buffer.position;
    console.table({
      Classes: stats.buffer.classes.join(" "),
      "Offset Height": `${stats.buffer.height}px`,
      "Computed Height": stats.buffer.computedHeight,
      Top: `${Math.round(bufferPos.top)}px`,
      Bottom: `${Math.round(bufferPos.bottom)}px`,
    });

    // Sentinel states
    console.log("🎯 Sentinels:");
    console.table({
      "Wordmark Sentinel Top": `${Math.round(
        stats.wordmarkSentinel.position.top
      )}px`,
      "Wordmark Sentinel Visible": stats.wordmarkSentinel.visible,
      "Buffer Sentinel Top": `${Math.round(
        stats.bufferSentinel.position.top
      )}px`,
      "Buffer Sentinel Visible": stats.bufferSentinel.visible,
      "Buffer Top Position": `${Math.round(stats.buffer.position.top)}px`,
    });

    if (stats.wordmark) {
      console.log("📏 Wordmark:");
      const wordmarkPos = stats.wordmark.position;
      console.table({
        "Font Size": stats.wordmark.fontSize,
        Top: `${Math.round(wordmarkPos.top)}px`,
        Height: `${Math.round(wordmarkPos.height)}px`,
      });
    }

    console.groupEnd();
    return stats;
  }

  console.log("🎯 TWO-STAGE STICKY: Initializing dual-sentinel system");
  getTwoStageStats("INIT");

  // Track if user has started scrolling to prevent premature triggering
  let hasScrolled = false;
  let initialScrollY = window.scrollY;

  // Stage 1: Wordmark sentinel observer (makes hero sticky when wordmark hits top)
  const wordmarkObserver = new IntersectionObserver(
    ([entry]) => {
      console.group("📍 WORDMARK SENTINEL EVENT");
      console.table({
        "Is Intersecting": entry.isIntersecting,
        "Intersection Ratio": entry.intersectionRatio.toFixed(3),
        "Target Top": `${Math.round(entry.boundingClientRect.top)}px`,
        "Has Scrolled": hasScrolled,
      });

      getTwoStageStats(
        `WORDMARK_${entry.isIntersecting ? "VISIBLE" : "AT_TOP"}`
      );
      console.groupEnd();

      // When wordmark sentinel hits top of viewport, make hero sticky
      if (
        !entry.isIntersecting &&
        hasScrolled &&
        window.scrollY > initialScrollY
      ) {
        console.log(
          "🎯 WORDMARK STICKY: Making hero sticky at top of viewport"
        );
        hero.classList.add("sticky");
        getTwoStageStats("HERO_MADE_STICKY");

        // Dispatch event for other scripts
        document.dispatchEvent(new CustomEvent("heroSticky"));
        console.log("📡 EVENT: heroSticky event dispatched");
      }
    },
    { threshold: 0 }
  );

  // Stage 2: Buffer sentinel observer (triggers final lock)
  const bufferObserver = new IntersectionObserver(
    ([entry]) => {
      console.group("📍 BUFFER SENTINEL EVENT");
      console.table({
        "Is Intersecting": entry.isIntersecting,
        "Intersection Ratio": entry.intersectionRatio.toFixed(3),
        "Target Top": `${Math.round(entry.boundingClientRect.top)}px`,
        "Has Scrolled": hasScrolled,
        "Current Scroll": window.scrollY,
      });

      getTwoStageStats(
        `BUFFER_${entry.isIntersecting ? "VISIBLE" : "TOP_SCROLLED_PAST"}`
      );
      console.groupEnd();

      // Only trigger if user has actually scrolled AND sentinel is not intersecting
      if (
        !entry.isIntersecting &&
        hasScrolled &&
        window.scrollY > initialScrollY
      ) {
        console.log(
          "🔒 FINAL LOCK: Buffer top scrolled past viewport, locking header and collapsing spacer"
        );
        getTwoStageStats("LOCK_TRIGGERED");

        // Apply final locked state
        hero.classList.add("locked");
        buffer.classList.add("collapsed");

        console.log("📐 LAYOUT: Hero locked and buffer collapsed");
        getTwoStageStats("LOCK_APPLIED");

        // Notify other scripts (wordmark settling)
        document.dispatchEvent(new CustomEvent("heroLocked"));
        console.log("📡 EVENT: heroLocked event dispatched");
        getTwoStageStats("EVENT_DISPATCHED");

        // Disconnect both observers - one-way transition complete
        wordmarkObserver.disconnect();
        bufferObserver.disconnect();
        console.log(
          "👁️ OBSERVERS: Both disconnected - two-stage transition complete"
        );
      } else if (!entry.isIntersecting && !hasScrolled) {
        console.log(
          "⏸️ BUFFER SENTINEL: Not intersecting at page load - waiting for scroll"
        );
      }
    },
    { threshold: 0 }
  );

  // Track when user starts scrolling
  window.addEventListener(
    "scroll",
    () => {
      if (!hasScrolled && window.scrollY > initialScrollY + 10) {
        // 10px threshold to avoid tiny movements
        hasScrolled = true;
        console.log(
          "🖱️ SCROLL: User has started scrolling, observers now active"
        );
      }
    },
    { passive: true }
  );

  // Start observing both sentinels
  wordmarkObserver.observe(wordmarkSentinel);
  bufferObserver.observe(bufferSentinel);

  console.log("👁️ OBSERVERS: Both sentinels being watched");
  getTwoStageStats("OBSERVERS_ACTIVE");

  // Update debug overlay
  function updateDebugOverlay() {
    if (!debugScroll) return;

    const scrollY = window.scrollY;
    const heroRect = hero.getBoundingClientRect();
    const bufferRect = buffer.getBoundingClientRect();
    const wordmarkSentinelRect = wordmarkSentinel.getBoundingClientRect();
    const bufferSentinelRect = bufferSentinel.getBoundingClientRect();

    debugScroll.textContent = `Scroll: ${Math.round(scrollY)}px`;

    // Hero status
    if (hero.classList.contains("locked")) {
      debugHero.textContent = "Hero: 🔒 LOCKED";
      debugHero.className = "status locked";
    } else {
      debugHero.textContent = `Hero: Normal (top: ${Math.round(
        heroRect.top
      )}px)`;
      debugHero.className = "status";
    }

    // Buffer status
    if (buffer.classList.contains("collapsed")) {
      debugBuffer.textContent = "Buffer: 📦 COLLAPSED";
      debugBuffer.className = "status locked";
    } else {
      debugBuffer.textContent = `Buffer: Visible (top: ${Math.round(
        bufferRect.top
      )}px, height: ${Math.round(bufferRect.height)}px)`;
      debugBuffer.className = "status";
    }

    // Wordmark sentinel status
    const wordmarkVisible =
      wordmarkSentinelRect.top < window.innerHeight &&
      wordmarkSentinelRect.bottom > 0;
    if (wordmarkSentinelRect.top <= 0) {
      debugWordmark.textContent = "Wordmark: 📏 AT TOP";
      debugWordmark.className = "status active";
    } else if (wordmarkVisible) {
      debugWordmark.textContent = `Wordmark: Visible (${Math.round(
        wordmarkSentinelRect.top
      )}px from top)`;
      debugWordmark.className = "status";
    } else {
      debugWordmark.textContent = "Wordmark: Below viewport";
      debugWordmark.className = "status";
    }

    // Buffer sentinel status
    const bufferSentinelVisible =
      bufferSentinelRect.top < window.innerHeight &&
      bufferSentinelRect.bottom > 0;
    if (bufferSentinelRect.top <= 0) {
      debugBufferSentinel.textContent = "Buffer Sentinel: 🎯 TRIGGERED";
      debugBufferSentinel.className = "status locked";
    } else if (bufferSentinelVisible) {
      debugBufferSentinel.textContent = `Buffer Sentinel: Visible (${Math.round(
        bufferSentinelRect.top
      )}px from top)`;
      debugBufferSentinel.className = "status active";
    } else {
      debugBufferSentinel.textContent = "Buffer Sentinel: Below viewport";
      debugBufferSentinel.className = "status";
    }
  }

  // Update debug overlay on scroll
  window.addEventListener("scroll", updateDebugOverlay);
  updateDebugOverlay(); // Initial update
});
