import { createContext, useContext, useState, useEffect } from 'react';

const ViewportContext = createContext();

const STORAGE_KEY = 'scanora_viewport';

const getAutoViewport = () => {
  if (typeof window === 'undefined') return 'mobile';
  const w = window.innerWidth;
  if (w >= 1024) return 'desktop';
  if (w >= 640) return 'tablet';
  return 'mobile';
};

export const ViewportProvider = ({ children }) => {
  const [viewportMode, setViewportMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ['mobile', 'tablet', 'full-screen'].includes(saved)) return saved;
    return 'full-screen';
  });

  const [actualViewport, setActualViewport] = useState(() => 
    viewportMode === 'full-screen' ? getAutoViewport() : viewportMode
  );

  useEffect(() => {
    const handleResize = () => {
      if (viewportMode === 'full-screen') {
        setActualViewport(getAutoViewport());
      } else {
        setActualViewport(viewportMode);
      }
    };
    handleResize(); // run on mount/mode change
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewportMode]);

  const setViewport = (v) => {
    setViewportMode(v);
    localStorage.setItem(STORAGE_KEY, v);
  };

  return (
    <ViewportContext.Provider value={{ viewport: actualViewport, mode: viewportMode, setViewport }}>
      {children}
    </ViewportContext.Provider>
  );
};

export const useViewport = () => useContext(ViewportContext);
