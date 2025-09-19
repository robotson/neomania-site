// ======== BACKGROUND TEXTURE CONTROLLER ========
// Controls scroll-triggered visibility of background texture and grain overlay

document.addEventListener('DOMContentLoaded', () => {
  console.log('Background controller loading...');

  const texture = document.querySelector('.viewport-background');
  const grainOverlay = document.querySelector('.viewport-grain-overlay');
  const mainContent = document.querySelector('.main-content');

  console.log('Elements found:', {
    texture: !!texture,
    grainOverlay: !!grainOverlay,
    mainContent: !!mainContent
  });

  if (!texture || !grainOverlay || !mainContent) {
    console.warn('Background controller: Required elements not found', {
      texture, grainOverlay, mainContent
    });
    return;
  }

  let isVisible = false;

  function setVisibility(visible) {
    if (visible === isVisible) return;
    isVisible = visible;

    if (isVisible) {
      texture.classList.add('visible');
      grainOverlay.classList.add('visible');
    } else {
      texture.classList.remove('visible');
      grainOverlay.classList.remove('visible');
    }
  }

  // Respect reduced motion preferences
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Still show the background, but without animation triggers
    setVisibility(true);
    return;
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const shouldBeVisible = entry.isIntersecting;
        setVisibility(shouldBeVisible);
      });
    }, {
      root: null,
      // Trigger once the main content reaches 70% of the viewport
      rootMargin: '0px 0px -30% 0px',
      threshold: [0, 0.001]
    });

    observer.observe(mainContent);
  } else {
    // Fallback: show background to avoid scroll handlers on unsupported browsers
    setVisibility(true);
  }
});
