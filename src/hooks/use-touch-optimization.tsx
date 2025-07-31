import { useEffect } from 'react';

export const useTouchOptimization = () => {
  useEffect(() => {
    // Prevent default touch behaviors
    const preventDefaults = (e: TouchEvent) => {
      if ((e.target as Element)?.closest('.mobile-grid, .touch-friendly')) {
        e.preventDefault();
      }
    };

    // Set up touch optimizations
    document.addEventListener('touchstart', preventDefaults, { passive: false });
    document.addEventListener('touchmove', preventDefaults, { passive: false });
    
    // Configure viewport and performance
    document.body.style.cssText += `
      touch-action: manipulation;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      overscroll-behavior: none;
    `;

    // TWA optimizations
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
      // Note: disableVerticalSwipes is not available in all TWA versions
      // Remove this line if it causes errors
      // window.Telegram.WebApp.disableVerticalSwipes();
    }

    return () => {
      document.removeEventListener('touchstart', preventDefaults);
      document.removeEventListener('touchmove', preventDefaults);
    };
  }, []);
};