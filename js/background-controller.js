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
  
  // Don't force show - let scroll trigger control visibility

  let isVisible = false;

  function updateBackgroundVisibility(shouldBeVisible) {
    if (shouldBeVisible === isVisible) return;

    isVisible = shouldBeVisible;

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
    texture.classList.add('visible');
    grainOverlay.classList.add('visible');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        updateBackgroundVisibility(entry.isIntersecting);
      });
    },
    {
      // Trigger visibility change when the main content reaches 70% of the viewport height
      rootMargin: '0px 0px -30% 0px',
      threshold: 0
    }
  );

  observer.observe(mainContent);
});
