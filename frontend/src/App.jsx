import { useState, useEffect } from 'react';
import i18n from './i18n';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import SideNav from './components/SideNav';
import ViewportToggle from './components/ViewportToggle';
import LiveWallpaper from './components/LiveWallpaper';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Onboarding from './pages/Onboarding';
import Statistic from './pages/Statistic';
import Dokumentasi from './pages/Dokumentasi';
import ScannerSheet from './components/ScannerSheet';
import LoadingScreen from './components/LoadingScreen';
import { initializeAuth } from './api';
import { ViewportProvider, useViewport } from './context/ViewportContext';

// Pages where nav should NOT appear
const NO_NAV_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/onboarding', '/dokumentasi'];

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ─── Inner shell: needs Router context for useLocation ───────────────────────
function AppShell({ isScannerOpen, setIsScannerOpen, isAppEntering, isSplashVisible }) {
  const { layout, compactWidth, windowWidth, isFullscreen } = useViewport();
  const location = useLocation();

  const isNoNav = NO_NAV_PATHS.includes(location.pathname);
  const isDesktop = layout === 'desktop';

  // Shell width: null = fill entire window, number = pixel width (compact mode)
  const shellWidthStyle = (isFullscreen || compactWidth === null)
    ? {}
    : { width: `${compactWidth}px`, maxWidth: `${compactWidth}px` };

  const isCompact = !isFullscreen;

  return (
    <>
      {/* ── Live Wallpaper (Compact only, fills entire screen behind shell) ── */}
      {isCompact && <LiveWallpaper />}

      {/* ── App Container ── */}
      <div
        className={`
          ${isCompact ? 'fixed inset-0 flex items-center justify-center overflow-hidden' : ''}
        `}
      >
        {/* Metallic bezel wrapper for compact */}
        <div
          className={`
            relative z-10
            ${isAppEntering ? 'app-enter' : ''}
            ${isSplashVisible ? 'app-hidden' : ''}
            ${isCompact ? '' : 'w-full'}
          `}
          style={isCompact ? {
            padding: '4px',
            borderRadius: '32px',
            background: 'linear-gradient(145deg, #404040 0%, #171717 20%, #262626 40%, #000000 60%, #171717 80%, #333333 100%)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.15)',
            height: '96dvh',
            ...shellWidthStyle,
          } : {}}
        >
          <div
            className={`
              ${isCompact ? 'h-full overflow-hidden' : 'h-[100dvh] overflow-hidden'}
              ${isDesktop && !isCompact ? 'flex flex-row' : 'flex flex-col'}
              bg-gray-50 dark:bg-gray-900 relative transition-colors app-shell
              ${isCompact ? '' : (isAppEntering ? 'app-enter' : '') + (isSplashVisible ? ' app-hidden' : '')}
            `}
            style={{
              borderRadius: isCompact ? '26px' : undefined,
              ...(isCompact ? {} : shellWidthStyle),
            }}
          >
            {isDesktop && !isCompact && !isNoNav && (
              <SideNav onOpenScanner={() => setIsScannerOpen(true)} />
            )}

            <main className="flex-1 overflow-y-auto no-scrollbar w-full">
              <Routes>
                <Route path="/" element={<ProtectedRoute><Home onOpenScanner={() => setIsScannerOpen(true)} /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/stats" element={<ProtectedRoute><Statistic /></ProtectedRoute>} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dokumentasi" element={<Dokumentasi />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* BottomNav: show for non-desktop or compact mode */}
            {(!isDesktop || isCompact) && !isNoNav && (
              <Routes>
                <Route path="/login" element={null} />
                <Route path="/register" element={null} />
                <Route path="/forgot-password" element={null} />
                <Route path="/reset-password" element={null} />
                <Route path="/profile" element={null} />
                <Route path="/onboarding" element={null} />
                <Route path="/dokumentasi" element={null} />
                <Route path="*" element={<BottomNav onOpenScanner={() => setIsScannerOpen(true)} />} />
              </Routes>
            )}

            <ScannerSheet isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
          </div>
        </div>
      </div>

      {/* ── Resize Handle (always outside shell) ── */}
      {!isNoNav && <ViewportToggle isHidden={isScannerOpen} />}
    </>
  );
}


// ─── Root App ─────────────────────────────────────────────────────────────────
function App() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(() => !sessionStorage.getItem('scanora_first_load'));
  const [isSplashExiting, setIsSplashExiting] = useState(false);
  const [isAppEntering, setIsAppEntering] = useState(() => !!sessionStorage.getItem('scanora_first_load'));

  useEffect(() => {
    const updateThemeColor = (isDark) => {
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.content = isDark ? '#111827' : '#f9fafb';
    };

    // ── Restore Theme ──
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
      updateThemeColor(true);
    } else {
      updateThemeColor(false);
    }

    initializeAuth().then(() => setIsAuthReady(true));

    // ── Dev: Hotkeys (Shift+Alt+T = theme, Shift+Alt+L = language) ──
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.altKey && e.key.toLowerCase() === 't') {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
          updateThemeColor(false);
        } else {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
          updateThemeColor(true);
        }
      } else if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'l') {
        const newLang = i18n.language === 'en' ? 'id' : 'en';
        i18n.changeLanguage(newLang);
        // If we also want to save the user preference in local storage/DB like Profile.jsx does:
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
          user.language = newLang;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSplashDone = () => {
    sessionStorage.setItem('scanora_first_load', '1');
    setIsSplashExiting(true);
    setTimeout(() => {
      setIsSplashVisible(false);
      setIsAppEntering(true);
    }, 900);
  };

  return (
    <ViewportProvider>
      <Router>
        <AppShell
          isScannerOpen={isScannerOpen}
          setIsScannerOpen={setIsScannerOpen}
          isAppEntering={isAppEntering}
          isSplashVisible={isSplashVisible}
        />

        {isSplashVisible && (
          <LoadingScreen
            isAuthReady={isAuthReady}
            isExiting={isSplashExiting}
            onDone={handleSplashDone}
          />
        )}

        <style>{`
          .app-hidden { opacity: 0; transform: translateY(24px); pointer-events: none; }
          .app-enter  { animation: app-enter 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes app-enter {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </Router>
    </ViewportProvider>
  );
}

export default App;
