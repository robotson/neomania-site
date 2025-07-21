// ======== SCROLL PROGRESS MODULE ========
// Maps scrollY 0→vh to --p 0→1 for FLIP animation
// Only writes CSS custom property, no DOM reads

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  let lastP = -1;

  function onScroll() {
    // Map scroll 0→viewport height to progress 0→1, clamped
    const p = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
    
    // Only update if value changed (avoid redundant style writes)
    if (p !== lastP) {
      root.style.setProperty('--p', p);
      lastP = p;
    }
  }

  // Reduced motion fallback
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.style.setProperty('--p', 1);   // jump to final
    return;
  }

  addEventListener('scroll', onScroll, { passive: true });
  onScroll();           // initial call
});