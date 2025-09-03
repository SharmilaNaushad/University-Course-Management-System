/**
 * Responsive utility functions for the application
 * These utilities can be imported and used in components to make them responsive
 * without modifying existing code logic
 */

// Breakpoint values matching common device sizes
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 768,
  lg: 992,
  xl: 1200
};

/**
 * Check if the current viewport matches a media query
 * @param {string} query - CSS media query string
 * @returns {boolean} - Whether the media query matches
 */
export const matchesMediaQuery = (query) => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(query).matches;
};

/**
 * Get the current viewport width
 * @returns {number} - Current viewport width
 */
export const getViewportWidth = () => {
  if (typeof window === 'undefined') return 1200; // Default to desktop for SSR
  return window.innerWidth;
};

/**
 * Check if the current device is mobile
 * @returns {boolean} - Whether the device is mobile
 */
export const isMobileDevice = () => {
  return getViewportWidth() < breakpoints.md;
};

/**
 * Check if the current device is a tablet
 * @returns {boolean} - Whether the device is a tablet
 */
export const isTabletDevice = () => {
  const width = getViewportWidth();
  return width >= breakpoints.md && width < breakpoints.lg;
};

/**
 * Get appropriate padding/margin based on screen size
 * @returns {object} - Object with responsive spacing values
 */
export const getResponsiveSpacing = () => {
  const width = getViewportWidth();
  
  if (width < breakpoints.sm) {
    return {
      padding: '8px',
      margin: '8px',
      gap: '8px'
    };
  } else if (width < breakpoints.md) {
    return {
      padding: '12px',
      margin: '12px',
      gap: '12px'
    };
  } else {
    return {
      padding: '16px',
      margin: '16px',
      gap: '16px'
    };
  }
};

/**
 * Get responsive font size based on screen size
 * @param {string} element - Element type (h1, h2, body, etc.)
 * @returns {string} - Responsive font size
 */
export const getResponsiveFontSize = (element) => {
  const width = getViewportWidth();
  
  const fontSizes = {
    h1: width < breakpoints.sm ? '1.8rem' : width < breakpoints.lg ? '2.2rem' : '2.5rem',
    h2: width < breakpoints.sm ? '1.5rem' : width < breakpoints.lg ? '1.8rem' : '2rem',
    h3: width < breakpoints.sm ? '1.2rem' : width < breakpoints.lg ? '1.5rem' : '1.8rem',
    body: width < breakpoints.sm ? '0.9rem' : width < breakpoints.lg ? '1rem' : '1.1rem',
    small: width < breakpoints.sm ? '0.8rem' : '0.9rem'
  };
  
  return fontSizes[element] || fontSizes.body;
};

/**
 * Get appropriate grid column count based on screen size
 * @param {number} desktopColumns - Number of columns on desktop
 * @returns {number} - Responsive column count
 */
export const getResponsiveGridColumns = (desktopColumns = 3) => {
  const width = getViewportWidth();
  
  if (width < breakpoints.sm) {
    return 1; // Stack on mobile
  } else if (width < breakpoints.md) {
    return Math.min(2, desktopColumns); // Max 2 columns on tablet
  } else if (width < breakpoints.lg) {
    return Math.min(3, desktopColumns); // Max 3 columns on small desktop
  } else {
    return desktopColumns; // Use specified desktop columns
  }
};

// Export a helper for print media detection
export const isPrintMode = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('print').matches;
};
