import { useState, useEffect } from 'react';

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      
      // Only update if we've scrolled more than 10px (threshold)
      if (Math.abs(scrollY - lastScrollY) < 10) {
        ticking = false;
        return;
      }

      setScrollDirection(direction);
      setScrollY(scrollY);
      
      // Show/hide logic
      if (scrollY < 50) {
        // Always show when near top
        setIsVisible(true);
      } else if (direction === 'down' && scrollY > 100) {
        // Hide when scrolling down after 100px
        setIsVisible(false);
      } else if (direction === 'up') {
        // Show when scrolling up
        setIsVisible(true);
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { scrollDirection, scrollY, isVisible };
};