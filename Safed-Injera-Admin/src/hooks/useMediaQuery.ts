import { useState, useEffect } from 'react';

export const breakpoints = {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
};

type Breakpoint = keyof typeof breakpoints;

export const useMediaQuery = (minWidth: number): boolean => {
    const [matches, setMatches] = useState<boolean>(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(`(min-width: ${minWidth}px)`);

        // Set initial value
        setMatches(mediaQuery.matches);

        // Handler for changes
        const handler = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handler);
            return () => mediaQuery.removeListener(handler);
        }
    }, [minWidth]);

    return matches;
};

export const useBreakpoint = (breakpoint: Breakpoint): boolean => {
    return useMediaQuery(breakpoints[breakpoint]);
};

export const useDevice = () => {
    const isTablet = useBreakpoint('tablet');
    const isDesktop = useBreakpoint('desktop');
    const isWide = useBreakpoint('wide');

    return {
        isMobile: !isTablet,
        isTablet: isTablet && !isDesktop,
        isDesktop: isDesktop && !isWide,
        isWide,
    };
};
