import { createContext, useContext, useState, useEffect } from 'react';

const ViewportContext = createContext();

const STORAGE_KEY = 'scanora_viewport_mode';

/**
 * Compute the actual layout based on mode + window width.
 * - fullscreen: responsive to actual canvas width
 * - compact: max tablet (never desktop), responsive at phone breakpoint
 */
const computeLayout = (mode, width) => {
  if (mode === 'fullscreen') {
    if (width >= 1024) return 'desktop';
    if (width >= 640)  return 'tablet';
    return 'mobile';
  }
  // compact: cap at tablet
  if (width >= 640) return 'tablet';
  return 'mobile';
};

export const ViewportProvider = ({ children }) => {
  const [mode, setModeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'compact' ? 'compact' : 'fullscreen';
  });

  const [layout, setLayout] = useState(() =>
    computeLayout(
      localStorage.getItem(STORAGE_KEY) === 'compact' ? 'compact' : 'fullscreen',
      typeof window !== 'undefined' ? window.innerWidth : 1024
    )
  );

  useEffect(() => {
    const update = () => setLayout(computeLayout(mode, window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [mode]);

  const setMode = (newMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
    setLayout(computeLayout(newMode, window.innerWidth));
  };

  return (
    <ViewportContext.Provider value={{ mode, layout, setMode,
      // legacy aliases so existing code (viewport / setViewport) still works
      viewport: layout,
      setViewport: (v) => {
        // map old 3-option values to new 2-option
        if (v === 'full-screen') setMode('fullscreen');
        else setMode('compact');
      },
    }}>
      {children}
    </ViewportContext.Provider>
  );
};

export const useViewport = () => useContext(ViewportContext);
