/**
 * ViewportResizeHandle.jsx
 *
 * A draggable edge handle that lets users resize the app shell width.
 * - Shows as a pill/grip on the right edge of the app container
 * - Drag left to shrink (compact), drag right to expand
 * - Double-click to toggle fullscreen/compact preset
 * - Tooltip shows current layout mode
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import { useViewport } from '../context/ViewportContext';

const MIN_WIDTH = 375;

const ViewportResizeHandle = ({ isHidden = false }) => {
  const { compactWidth, windowWidth, isFullscreen, setCompactWidth } = useViewport();
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [jiggle, setJiggle] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  // Current effective width for display
  const currentWidth = isFullscreen ? windowWidth : (compactWidth ?? windowWidth);


  const handleTouchStart = useCallback((e) => {
    dragStartX.current = e.touches[0].clientX;
    dragStartWidth.current = currentWidth;
    setIsDragging(true);
  }, [currentWidth]);

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const delta = clientX - dragStartX.current;
      const newWidth = Math.max(MIN_WIDTH, Math.min(windowWidth, dragStartWidth.current + delta));
      setCompactWidth(newWidth >= windowWidth * 0.95 ? null : newWidth);
    };

    const onUp = () => setIsDragging(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, windowWidth, setCompactWidth]);

  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setJiggle(true);
    setTimeout(() => setJiggle(false), 500);
    // Toggle: compact → fullscreen, fullscreen → compact (430px)
    setCompactWidth(isFullscreen ? 430 : null);
  };

  // Prevent single-click from stealing dblclick on some browsers
  const handleMouseDown = useCallback((e) => {
    // Only start drag on left-mouse-button and not a double-click sequence
    if (e.detail >= 2) return; // ignore mousedown that's part of dblclick
    e.preventDefault();
    dragStartX.current = e.clientX;
    dragStartWidth.current = currentWidth;
    setIsDragging(true);
  }, [currentWidth]);

  const layoutLabel = isFullscreen
    ? 'Fullscreen'
    : currentWidth >= 1024 ? 'Desktop'
    : currentWidth >= 640  ? 'Tablet'
    : 'Mobile';

  return (
    <div
      className={`fixed right-0 top-1/2 -translate-y-1/2 z-[998] transition-all duration-300 select-none
        ${isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}
        ${isDragging ? 'cursor-col-resize' : 'cursor-ew-resize'}
      `}
      style={{ touchAction: 'none' }}
    >
      {/* Tooltip */}
      {(showTooltip || isDragging) && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none max-w-[110px] text-center leading-snug">
          {isDragging
            ? `${Math.round(currentWidth)}px · ${layoutLabel}`
            : `Drag / Double Click\nto Resize`}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-gray-900" />
        </div>
      )}

      {/* Handle pill */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          flex items-center justify-center
          w-5 h-14 rounded-l-xl
          bg-white border border-gray-200 border-r-0
          shadow-[−2px_0_12px_rgba(0,0,0,0.1)]
          transition-all duration-200
          hover:bg-scanora-green/5 hover:border-scanora-green/30 hover:w-6
          ${isDragging ? 'bg-scanora-green/10 border-scanora-green/40 w-6 shadow-lg' : ''}
          ${jiggle ? 'animate-fab-jiggle' : ''}
        `}
      >
        <ChevronsLeftRight
          size={14}
          className={`transition-colors ${isDragging ? 'text-scanora-green' : 'text-gray-400'}`}
          strokeWidth={2.5}
        />
      </div>

      {/* Drag line overlay while resizing */}
      {isDragging && (
        <div
          className="fixed inset-0 z-[997] cursor-col-resize"
          style={{ pointerEvents: 'all' }}
        />
      )}
    </div>
  );
};

export default ViewportResizeHandle;
