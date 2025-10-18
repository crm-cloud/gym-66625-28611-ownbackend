import { useState, useEffect } from 'react';

interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useResponsive(breakpoints: Partial<BreakpointConfig> = {}) {
  const config = { ...defaultBreakpoints, ...breakpoints };
  
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window === 'undefined') return 'lg';
    
    const width = window.innerWidth;
    if (width >= config['2xl']) return '2xl';
    if (width >= config.xl) return 'xl';
    if (width >= config.lg) return 'lg';
    if (width >= config.md) return 'md';
    if (width >= config.sm) return 'sm';
    return 'xs';
  });

  const [windowSize, setWindowSize] = useState(() => {
    if (typeof window === 'undefined') return { width: 1024, height: 768 };
    return { width: window.innerWidth, height: window.innerHeight };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      
      if (width >= config['2xl']) setScreenSize('2xl');
      else if (width >= config.xl) setScreenSize('xl');
      else if (width >= config.lg) setScreenSize('lg');
      else if (width >= config.md) setScreenSize('md');
      else if (width >= config.sm) setScreenSize('sm');
      else setScreenSize('xs');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [config]);

  return {
    screenSize,
    windowSize,
    isMobile: screenSize === 'xs' || screenSize === 'sm',
    isTablet: screenSize === 'md',
    isDesktop: screenSize === 'lg' || screenSize === 'xl' || screenSize === '2xl',
    isSmall: screenSize === 'xs' || screenSize === 'sm',
    isMedium: screenSize === 'md' || screenSize === 'lg',
    isLarge: screenSize === 'xl' || screenSize === '2xl',
    breakpoints: config,
  };
}

// Hook for specific breakpoint checks
export function useBreakpoint(breakpoint: keyof BreakpointConfig) {
  const { screenSize, breakpoints } = useResponsive();
  const [isMatched, setIsMatched] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia(`(min-width: ${breakpoints[breakpoint]}px)`);
    setIsMatched(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsMatched(e.matches);
    mediaQuery.addListener(handler);
    
    return () => mediaQuery.removeListener(handler);
  }, [breakpoint, breakpoints]);

  return isMatched;
}