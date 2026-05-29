/**
 * ViewportToggle.jsx
 *
 * Single FAB button that toggles between Fullscreen (maximize) and Compact (minimize).
 * - Fullscreen: Expand icon  — app fills entire canvas
 * - Compact:    Minimize icon — app floats above live wallpaper, capped at Tablet
 *
 * Sizing by breakpoint:
 * - Mobile / Tablet (< 1024px): 44px  × 44px, bottom 14vh
 * - Laptop+ (≥ 1024px):         56px  × 56px, bottom 4vh
 *
 * Hides automatically when isHidden=true (scanner open, dialog active, etc.)
 */

import { useState } from 'react';
import { Expand, Minimize } from 'lucide-react';
import { useViewport } from '../context/ViewportContext';
import Tooltip from './Tooltip';

const ViewportToggle = ({ isHidden = false }) => {
  const { mode, setMode } = useViewport();
  const [jiggle, setJiggle] = useState(false);

  const isFullscreen = mode === 'fullscreen';

  const handleToggle = () => {
    setMode(isFullscreen ? 'compact' : 'fullscreen');
    setJiggle(true);
    setTimeout(() => setJiggle(false), 500);
  };

  const tooltipText = isFullscreen ? 'Compact Mode' : 'Fullscreen';

  return (
    <>
      <div
        className={`fixed right-[3vw] z-[999] transition-all duration-300
          bottom-[14vh] lg:bottom-[4vh]
          ${isHidden ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 pointer-events-auto scale-100'}
        `}
      >
        <Tooltip content={tooltipText} placement="left" delay={300}>
          <button
            id="viewport-toggle-btn"
            onClick={handleToggle}
            aria-label={tooltipText}
            className={`
              relative flex items-center justify-center gap-2
              w-11 h-11 lg:w-14 lg:h-14
              rounded-2xl bg-white border-gray-200 text-scanora-green shadow-xl hover:shadow-2xl hover:border-scanora-green/30
              border-2 transition-all duration-300 active:scale-90
              ${jiggle ? 'animate-fab-jiggle' : ''}
            `}
          >
            {isFullscreen
              ? <Minimize size={20} strokeWidth={2.2} className="lg:hidden" />
              : <Expand   size={20} strokeWidth={2.2} className="lg:hidden" />
            }
            {isFullscreen
              ? <Minimize size={22} strokeWidth={2.2} className="hidden lg:block" />
              : <Expand   size={22} strokeWidth={2.2} className="hidden lg:block" />
            }
          </button>
        </Tooltip>
      </div>
    </>
  );
};

export default ViewportToggle;
