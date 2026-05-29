import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ViewportContext = createContext();

const STORAGE_KEY = 'scanora_viewport_width';
const MIN_WIDTH = 375;   // Phone minimum
const MAX_WIDTH = null;  // null = fill window
const FULLSCREEN_THRESHOLD = 0.95; // >95% of window = fullscreen

/** Derive layout from pixel width */
const computeLayoutFromWidth = (px) => {
  if (px >= 1024) return 'desktop';
  if (px >= 640)  return 'tablet';
  return 'mobile';
};

export const ViewportProvider = ({ children }) => {
  // compactWidth: pixel width of the compact shell (null = fullscreen)
  const [compactWidth, setCompactWidthState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null; // default = fullscreen
    const n = parseInt(saved, 10);
    return isNaN(n) ? null : n;
  });

  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Effective width: the actual rendered canvas width
  const effectiveWidth = compactWidth === null
    ? windowWidth
    : Math.max(MIN_WIDTH, Math.min(compactWidth, windowWidth));

  const isFullscreen = compactWidth === null ||
    effectiveWidth >= windowWidth * FULLSCREEN_THRESHOLD;

  const layout = computeLayoutFromWidth(effectiveWidth);

  const setCompactWidth = useCallback((px) => {
    const clamped = px === null ? null : Math.max(MIN_WIDTH, Math.min(px, windowWidth));
    setCompactWidthState(clamped);
    if (clamped === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, String(clamped));
    }
  }, [windowWidth]);

  // Legacy setMode support
  const setMode = (newMode) => {
    if (newMode === 'fullscreen') setCompactWidth(null);
    else setCompactWidth(430); // default compact = phone width
  };

  const mode = isFullscreen ? 'fullscreen' : 'compact';

  return (
    <ViewportContext.Provider value={{
      mode,
      layout,
      viewport: layout,       // legacy alias
      compactWidth: isFullscreen ? null : effectiveWidth,
      windowWidth,
      isFullscreen,
      setMode,
      setCompactWidth,
      setViewport: (v) => {
        if (v === 'full-screen') setCompactWidth(null);
        else setCompactWidth(430);
      },
    }}>
      {children}
    </ViewportContext.Provider>
  );
};

export const useViewport = () => useContext(ViewportContext);
