/**
 * Tooltip.jsx
 *
 * Universal tooltip that works on both desktop (hover) and touch screens (long-press).
 *
 * Usage:
 *   <Tooltip content="Penjelasan fitur ini">
 *     <button>Hover / Tahan saya</button>
 *   </Tooltip>
 *
 * Props:
 *   content   – string or JSX to display inside the tooltip
 *   placement – 'top' | 'bottom' | 'left' | 'right'  (default: 'top')
 *   delay     – hover delay in ms (default: 400)
 *   holdMs    – long-press duration in ms (default: 500)
 *   className – extra classes on the tooltip bubble
 */

import { useState, useRef, useCallback } from 'react';

const ARROW_SIZE = 6; // px

const Tooltip = ({
  children,
  content,
  placement = 'top',
  delay = 400,
  holdMs = 500,
  className = '',
}) => {
  const [visible, setVisible] = useState(false);
  const showTimer = useRef(null);
  const hideTimer = useRef(null);
  const holdTimer = useRef(null);

  const show = useCallback(() => {
    clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 100);
  }, []);

  // ── Touch handlers ───────────────────────────────────────────────────────────
  const onTouchStart = useCallback(() => {
    holdTimer.current = setTimeout(() => setVisible(true), holdMs);
  }, [holdMs]);

  const cancelHold = useCallback(() => {
    clearTimeout(holdTimer.current);
    // Hide after a short window so the user can read it
    setTimeout(() => setVisible(false), 1800);
  }, []);

  // ── Placement → CSS ──────────────────────────────────────────────────────────
  const bubbleBase =
    'absolute z-[1000] px-3 py-2 rounded-xl text-xs font-medium leading-snug ' +
    'bg-gray-900/95 text-white shadow-2xl backdrop-blur-sm pointer-events-none ' +
    'max-w-[220px] text-center whitespace-normal transition-all duration-150 ';

  const animClass = visible
    ? 'opacity-100 scale-100'
    : 'opacity-0 scale-95 pointer-events-none';

  const placementClass = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  }[placement] ?? 'bottom-full left-1/2 -translate-x-1/2 mb-2';

  // Arrow
  const arrowBase = 'absolute w-0 h-0 border-solid border-transparent';
  const arrowStyle = {
    top: {
      className: 'top-full left-1/2 -translate-x-1/2',
      style: {
        borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px 0 ${ARROW_SIZE}px`,
        borderTopColor: 'rgba(17,24,39,0.95)',
      },
    },
    bottom: {
      className: 'bottom-full left-1/2 -translate-x-1/2',
      style: {
        borderWidth: `0 ${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px`,
        borderBottomColor: 'rgba(17,24,39,0.95)',
      },
    },
    left: {
      className: 'left-full top-1/2 -translate-y-1/2',
      style: {
        borderWidth: `${ARROW_SIZE}px 0 ${ARROW_SIZE}px ${ARROW_SIZE}px`,
        borderLeftColor: 'rgba(17,24,39,0.95)',
      },
    },
    right: {
      className: 'right-full top-1/2 -translate-y-1/2',
      style: {
        borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px 0`,
        borderRightColor: 'rgba(17,24,39,0.95)',
      },
    },
  }[placement] ?? {
    className: 'top-full left-1/2 -translate-x-1/2',
    style: { borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px 0`, borderTopColor: 'rgba(17,24,39,0.95)' },
  };

  if (!content) return children;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onTouchStart={onTouchStart}
      onTouchEnd={cancelHold}
      onTouchCancel={cancelHold}
    >
      {children}

      {/* Tooltip bubble */}
      <span
        role="tooltip"
        className={`${bubbleBase} ${placementClass} ${animClass} ${className}`}
      >
        {content}
        {/* Arrow */}
        <span
          className={`${arrowBase} ${arrowStyle.className}`}
          style={arrowStyle.style}
        />
      </span>
    </span>
  );
};

export default Tooltip;
