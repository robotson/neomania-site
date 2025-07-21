// ======== FLIP MEASUREMENT MODULE ========
// Measures hero → header deltas once per layout change
// Writes --dx, --dy, --s CSS custom properties for pure CSS animation

document.addEventListener('DOMContentLoaded', () => {
  // ---- constants  ----------------------------------------------------------
  const hero   = document.querySelector('.animated-wordmark');
  const target = document.querySelector('#wordmark-anchor');
  const root   = document.documentElement;

  if (!hero || !target) {
    console.warn('FLIP: Missing hero (.animated-wordmark) or target (#wordmark-anchor)');
    return;
  }

  // CSS vars we'll write
  const css = (name, value) => root.style.setProperty(name, value);

  // Cache so we only touch the DOM once per measurement
  const val = { dx: 0, dy: 0, s: 1 };

  // ---- measurement ---------------------------------------------------------
  function measure() {
    if (!hero || !target) return;

    /** Guard: only measure when animation is reset (p ≈ 0) */
    if (parseFloat(getComputedStyle(root).getPropertyValue('--p')) > 0.001) {
      return;                // ignore measurements mid-animation
    }

    const from = hero.getBoundingClientRect();
    const to   = target.getBoundingClientRect();

    // center ➜ center
    const fromCx = from.left + from.width  / 2;
    const fromCy = from.top  + from.height / 2;
    const toCx   = to.left   + to.width   / 2;
    const toCy   = to.top    + to.height  / 2;

    val.dx = toCx - fromCx;
    val.dy = toCy - fromCy;

    val.s  = to.height / from.height; // keep using height ratio

    css('--dx', `${val.dx}px`);
    css('--dy', `${val.dy}px`);
    css('--s' , val.s);

    console.log('FLIP measured (top-left to top-left):', { 
      dx: val.dx, 
      dy: val.dy, 
      s: val.s,
      fromTopLeft: { x: from.left, y: from.top },
      toTopLeft: { x: to.left, y: to.top }
    });
  }

  // ---- subscribe to "layout may have changed" ------------------------------
  document.fonts.ready.then(measure);     // fonts swapped in
  addEventListener('resize', throttle(measure, 100));        // viewport change

  if ('ResizeObserver' in window) {       // dynamic layout shifts
    const ro = new ResizeObserver(throttle(measure, 100));
    ro.observe(target);      // only the static element
  }

  // Initial measurement
  measure();

  // helper
  function throttle(fn, ms) {
    let id;
    return () => { 
      if (id) return; 
      id = setTimeout(() => { 
        fn(); 
        id = 0; 
      }, ms); 
    };
  }
});