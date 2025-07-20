// Mobile Navigation System
// Handles hamburger menu and modal functionality for XS/SM breakpoints

class MobileNavigation {
  constructor() {
    this.modal = document.getElementById('mobile-menu-modal');
    this.hamburger = document.querySelector('.header-nav--hamburger');
    this.closeBtn = document.querySelector('.mobile-menu--close');
    this.backBtn = document.querySelector('.mobile-menu--back');
    this.backdrop = document.querySelector('.mobile-menu-backdrop');
    this.listenBtn = document.querySelector('.mobile-menu--listen');
    this.submenu = document.getElementById('listen-submenu');
    
    this.isInSubmenu = false;
    
    console.log('📱 MOBILE NAV: Initializing mobile navigation system');
    this.bindEvents();
  }
  
  bindEvents() {
    // Hamburger menu click
    this.hamburger?.addEventListener('click', (e) => {
      console.log('📱 MOBILE NAV: Hamburger clicked');
      this.open();
    });
    
    // Close button click
    this.closeBtn?.addEventListener('click', (e) => {
      console.log('📱 MOBILE NAV: Close button clicked');
      this.close();
    });
    
    // Back button click
    this.backBtn?.addEventListener('click', (e) => {
      console.log('📱 MOBILE NAV: Back button clicked');
      if (this.isInSubmenu) {
        this.hideSubmenu();
      } else {
        this.close();
      }
    });
    
    // Backdrop click
    this.backdrop?.addEventListener('click', (e) => {
      console.log('📱 MOBILE NAV: Backdrop clicked');
      this.close();
    });
    
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        console.log('📱 MOBILE NAV: Escape key pressed');
        this.close();
      }
    });
    
    // Listen button click for sub-menu
    this.listenBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('📱 MOBILE NAV: Listen button clicked');
      this.showSubmenu();
    });
    
    console.log('📱 MOBILE NAV: Event listeners bound successfully');
  }
  
  open() {
    if (!this.modal) {
      console.warn('📱 MOBILE NAV: Modal element not found');
      return;
    }
    
    console.log('📱 MOBILE NAV: Opening mobile menu');
    this.modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    
    // Focus management
    const firstFocusable = this.modal.querySelector('button, a');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }
  
  close() {
    if (!this.modal) {
      console.warn('📱 MOBILE NAV: Modal element not found');
      return;
    }
    
    console.log('📱 MOBILE NAV: Closing mobile menu');
    this.modal.classList.remove('is-open');
    document.body.style.overflow = '';
    
    // Return focus to hamburger
    if (this.hamburger) {
      this.hamburger.focus();
    }
  }
  
  isOpen() {
    return this.modal?.classList.contains('is-open') || false;
  }
  
  showSubmenu() {
    if (!this.submenu) {
      console.warn('📱 MOBILE NAV: Submenu element not found');
      return;
    }
    
    console.log('📱 MOBILE NAV: Showing Listen submenu');
    this.submenu.classList.add('is-visible');
    this.isInSubmenu = true;
    
    // Show back button when in submenu
    if (this.backBtn) {
      this.backBtn.style.visibility = 'visible';
    }
  }
  
  hideSubmenu() {
    if (!this.submenu) {
      console.warn('📱 MOBILE NAV: Submenu element not found');
      return;
    }
    
    console.log('📱 MOBILE NAV: Hiding Listen submenu');
    this.submenu.classList.remove('is-visible');
    this.isInSubmenu = false;
    
    // Hide back button when not in submenu
    if (this.backBtn) {
      this.backBtn.style.visibility = 'hidden';
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 MOBILE NAV: DOM ready, initializing mobile navigation');
  new MobileNavigation();
});

console.log('📱 MOBILE NAV: Mobile navigation module loaded');