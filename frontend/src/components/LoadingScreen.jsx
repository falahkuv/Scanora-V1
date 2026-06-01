import { useEffect, useState } from 'react';

const PROGRESS_DURATION_MS = 2000;

const LoadingScreen = ({ isAuthReady, isExiting, onDone }) => {
  const [showLogo, setShowLogo] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Detect dark mode so the splash bg matches the app root
  const isDark = document.documentElement.classList.contains('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  useEffect(() => {
    const timer = setTimeout(() => setShowLogo(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showLogo) return undefined;
    const timer = setTimeout(() => setShowBar(true), 500);
    return () => clearTimeout(timer);
  }, [showLogo]);

  useEffect(() => {
    if (!showBar || !isAuthReady || hasCompleted) return undefined;
    setProgress(100);
    const timer = setTimeout(() => {
      setHasCompleted(true);
      if (onDone) onDone();
    }, PROGRESS_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showBar, isAuthReady, hasCompleted, onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center splash-root ${isExiting ? 'splash-exit' : ''} ${isDark ? 'bg-gray-900' : 'bg-white'}`}
    >
      <div className="flex flex-col items-center justify-center splash-content">
        <div className="w-[180px] h-[180px] relative flex items-center justify-center">
          <div className="absolute w-[18px] h-[18px] bg-[#FFA726] animate-shape-sequence" />

          {showLogo ? (
            <img
              src="/images/splashscreenicon.png"
              alt="Scanora"
              className="w-[110px] h-auto animate-logo-reveal"
            />
          ) : null}
        </div>

        <div
          className="mt-7 w-[90px] h-[5px] bg-[#17b341]/20 rounded-[99px] overflow-hidden transition-opacity duration-200"
          style={{ opacity: showBar ? 1 : 0 }}
        >
          <div
            className="h-full bg-[#17b341] rounded-[99px] transition-[width] ease-linear"
            style={{ width: `${progress}%`, transitionDuration: `${PROGRESS_DURATION_MS}ms` }}
          />
        </div>
      </div>

      <style>{`
        .splash-root {
          transition: opacity 900ms ease-in-out;
        }

        .splash-exit {
          opacity: 0;
          pointer-events: none;
        }

        .splash-content {
          transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .splash-exit .splash-content {
          transform: scale(0.94);
        }

        @keyframes shape-sequence {
          0% {
            transform: translateY(-90vh) scale(0.2) rotate(0deg);
            border-radius: 6px;
            opacity: 1;
          }
          55% {
            transform: translateY(0px) scale(1) rotate(0deg);
            border-radius: 24px;
            opacity: 1;
          }
          75% {
            transform: translateY(0px) scale(1) rotate(8deg);
            border-radius: 26px;
            opacity: 1;
          }
          100% {
            transform: translateY(0px) scale(1) rotate(8deg);
            border-radius: 26px;
            opacity: 0;
          }
        }

        @keyframes logo-reveal {
          0% { transform: scale(0.2); opacity: 0; }
          70% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .animate-shape-sequence {
          animation: shape-sequence 700ms ease-out forwards;
          transform-origin: center;
        }

        .animate-logo-reveal {
          animation: logo-reveal 400ms ease-out forwards;
        }

      `}</style>
    </div>
  );
};

export default LoadingScreen;
