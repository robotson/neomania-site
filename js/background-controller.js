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
  let lastScrollY = -1;

  function updateBackgroundVisibility() {
    const scrollY = window.scrollY;
    
    // Only update if scroll position changed
    if (scrollY === lastScrollY) return;
    lastScrollY = scrollY;

    // Get the main content position relative to viewport
    const contentRect = mainContent.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Show background when main content is 30% visible from top
    const showThreshold = viewportHeight * 0.7;
    const shouldBeVisible = contentRect.top <= showThreshold;

    if (shouldBeVisible !== isVisible) {
      isVisible = shouldBeVisible;
      
      if (isVisible) {
        texture.classList.add('visible');
        grainOverlay.classList.add('visible');
      } else {
        texture.classList.remove('visible');
        grainOverlay.classList.remove('visible');
      }
    }
  }

  // Respect reduced motion preferences
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Still show the background, but without animation triggers
    texture.classList.add('visible');
    grainOverlay.classList.add('visible');
    return;
  }

  // Throttled scroll listener for performance
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateBackgroundVisibility();
        ticking = false;
      });
      ticking = true;
    }
  }

  // Set up event listeners
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateBackgroundVisibility, { passive: true });

  // Initial check
  updateBackgroundVisibility();
});