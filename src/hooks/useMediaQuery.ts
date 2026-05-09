/**
 * hooks/useMediaQuery.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Reactive hook that returns true/false based on a CSS media query.
 * Used to adapt the layout for tablet vs. desktop vs. mobile breakpoints
 * without duplicating Tailwind logic in JS.
 *
 * Usage:
 *   const isTablet = useMediaQuery('(max-width: 1024px)');
 *   const isMobile = useMediaQuery('(max-width: 768px)');
 */

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // SSR-safe: default false if window not available
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Use addEventListener where supported (modern), fallback to addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler); // Safari < 14
    }

    // Sync immediately in case query changed between render and effect
    setMatches(mediaQuery.matches);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}
