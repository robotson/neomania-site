// ======== SCROLL PROGRESS MODULE ========
// Maps scrollY 0→scroll-range to --p 0→1 for FLIP animation
// Only writes CSS custom property, no DOM reads

document.addEventListener('DOMContentLoaded', () => {
  const root   = document.documentElement;
  const runway = document.querySelector('.scroll-container'); // the spacer div
  let   range  = runway ? runway.offsetHeight : window.innerHeight;
  let   lastP  = -1;

  function recalc() {         // on resize / orientation change
    range = runway ? runway.offsetHeight : window.innerHeight;
  }

  function onScroll() {
    // Map 0 → range px to progress 0 → 1
    const p = Math.min(1, Math.max(0, window.scrollY / range));
    if (p !== lastP) {
      root.style.setProperty('--p', p);
      lastP = p;
    }
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.style.setProperty('--p', 1);
    return;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { recalc(); onScroll(); }, { passive: true });

  recalc();   // first measurement
  onScroll(); // first paint
});