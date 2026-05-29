import { useState, useEffect } from 'react';
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
import Onboarding from './pages/Onboarding';
import ImpactStats from './pages/ImpactStats';
import ScannerSheet from './components/ScannerSheet';
import LoadingScreen from './components/LoadingScreen';
import { initializeAuth } from './api';
import { ViewportProvider, useViewport } from './context/ViewportContext';

// Pages where nav should NOT appear
const NO_NAV_PATHS = ['/login', '/register', '/onboarding'];

// ─── Inner shell: needs Router context for useLocation ───────────────────────
function AppShell({ isScannerOpen, setIsScannerOpen, isAppEntering, isSplashVisible }) {
  const { layout, compactWidth, windowWidth, isFullscreen } = useViewport();
  const location = useLocation();

  const isNoNav   = NO_NAV_PATHS.includes(location.pathname);
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
                <Route path="/"           element={<Home onOpenScanner={() => setIsScannerOpen(true)} />} />
                <Route path="/inventory"  element={<Inventory />} />
                <Route path="/profile"    element={<Profile />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/login"      element={<Login />} />
                <Route path="/register"   element={<Register />} />
                <Route path="/stats"      element={<ImpactStats />} />
                <Route path="*"           element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* BottomNav: show for non-desktop or compact mode */}
            {(!isDesktop || isCompact) && !isNoNav && (
              <Routes>
                <Route path="/login"      element={null} />
                <Route path="/register"   element={null} />
                <Route path="/profile"    element={null} />
                <Route path="/onboarding" element={null} />
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
  const [isScannerOpen,   setIsScannerOpen]   = useState(false);
  const [isAuthReady,     setIsAuthReady]     = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(() => !sessionStorage.getItem('scanora_first_load'));
  const [isSplashExiting, setIsSplashExiting] = useState(false);
  const [isAppEntering,   setIsAppEntering]   = useState(() => !!sessionStorage.getItem('scanora_first_load'));

  useEffect(() => {
    initializeAuth().then(() => setIsAuthReady(true));

    // ── Dev: keyboard notification triggers ──
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'p') {
        if ('Notification' in window) {
          Notification.requestPermission().then(perm => alert(`Status Izin Notifikasi: ${perm}`));
        }
        return;
      }
      const mockDate = new Date();
      mockDate.setDate(mockDate.getDate() - 5);
      const savedDateStr = mockDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
      const caseMap = {
        '1': { title: "🥗 Jangan Lupa Apel🍎 Kamu!",  body: `Apel🍎 yang kamu simpan sejak ${savedDateStr} tinggal 3 hari lagi.` },
        '2': { title: "⚠️ Pisang🍌 Hampir Busuk!",    body: `Pisang🍌 yang kamu simpan sejak ${savedDateStr} sisa 1 hari lagi.` },
        '3': { title: "🚨 HARI TERAKHIR Jeruk🍊!",    body: `Jeruk🍊 yang kamu simpan sejak ${savedDateStr} mencapai batas HARI INI.` },
        '4': { title: "✨ Apel🍎 Matang Besok!",       body: `Apel🍎 yang kamu simpan sejak ${savedDateStr} matang dalam 1 hari lagi.` },
        '5': { title: "😋 Pisang🍌 Sudah Matang!",    body: `Pisang🍌 yang kamu simpan sejak ${savedDateStr} HARI INI sudah matang.` },
      };
      if (caseMap[e.key]) {
        window.dispatchEvent(new CustomEvent('scanora:testNotif', { detail: `Memproses Notifikasi Case ${e.key}...` }));
        setTimeout(() => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(caseMap[e.key].title, { body: caseMap[e.key].body });
          } else {
            alert(`[Notif Diblokir]\nTitle: ${caseMap[e.key].title}\nBody: ${caseMap[e.key].body}\n\nTekan 'P' untuk request permission.`);
          }
        }, 3000);
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
