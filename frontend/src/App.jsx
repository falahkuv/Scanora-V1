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

// Pages where nav/toggle should NOT appear
const NO_NAV_PATHS = ['/login', '/register', '/onboarding', '/stats'];

// ─── Inner shell: needs Router context for useLocation ───────────────────────
function AppShell({ isScannerOpen, setIsScannerOpen, isAppEntering, isSplashVisible }) {
  const { mode, layout } = useViewport();
  const location = useLocation();

  const isNoNav   = NO_NAV_PATHS.includes(location.pathname);
  const isDesktop = layout === 'desktop';
  const isCompact = mode === 'compact';

  // ── Shell sizing ────────────────────────────────────────────────────────
  // FULLSCREEN: always w-full, no max-w, no mx-auto. Layout uses flex-row/col.
  // COMPACT:    always forced to Phone layout (Mobile L / Pro Max max-w-[430px]), centred.
  let shellClass;
  if (isCompact) {
    // Compact: forced mobile layout
    shellClass = 'max-w-[430px] w-full mx-auto flex flex-col';
  } else {
    // Fullscreen: fill everything
    shellClass = isDesktop
      ? 'w-full flex flex-row'
      : 'w-full flex flex-col';
  }

  // ── Metallic border for Compact (phone-bezel effect) ────────────────────
  // Outer wrapper handles the border; inner div is the app shell.
  const compactWrapper = isCompact ? (
    <div
      className={`relative z-10 my-auto ${isAppEntering ? 'app-enter' : ''} ${isSplashVisible ? 'app-hidden' : ''}`}
      style={{
        padding: '4px',
        borderRadius: '32px',
        background: 'linear-gradient(145deg, #404040 0%, #171717 20%, #262626 40%, #000000 60%, #171717 80%, #333333 100%)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.15)',
        height: '96dvh',
      }}
    >
      {/* inner shell */}
      <div
        className={`
          ${shellClass}
          h-full bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors app-shell
        `}
        style={{ borderRadius: '26px' }}
      >
        {/* Main scrollable content (compact never has desktop SideNav) */}
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

        {!isNoNav && (
          <Routes>
            <Route path="/login"      element={null} />
            <Route path="/register"   element={null} />
            <Route path="/profile"    element={null} />
            <Route path="/onboarding" element={null} />
            <Route path="/stats"      element={null} />
            <Route path="*" element={<BottomNav onOpenScanner={() => setIsScannerOpen(true)} />} />
          </Routes>
        )}

        <ScannerSheet isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* ── Live Wallpaper (Compact only, fills entire screen behind shell) ── */}
      {isCompact && <LiveWallpaper />}

      {isCompact ? (
        // Compact: wallpaper fills fixed viewport, shell floats centered
        <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
          {compactWrapper}
        </div>
      ) : (
        // Fullscreen: shell IS the viewport — no wrapper, no constraint
        <div
          className={`
            ${shellClass}
            h-[100dvh] bg-gray-50 dark:bg-gray-900 relative overflow-hidden transition-colors app-shell
            ${isAppEntering ? 'app-enter' : ''}
            ${isSplashVisible ? 'app-hidden' : ''}
          `}
        >
          {isDesktop && !isNoNav && (
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

          {!isDesktop && !isNoNav && (
            <Routes>
              <Route path="/login"      element={null} />
              <Route path="/register"   element={null} />
              <Route path="/profile"    element={null} />
              <Route path="/onboarding" element={null} />
              <Route path="/stats"      element={null} />
              <Route path="*" element={<BottomNav onOpenScanner={() => setIsScannerOpen(true)} />} />
            </Routes>
          )}

          <ScannerSheet isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
        </div>
      )}

      {/* ── Floating Viewport Toggle (outside shell) ── */}
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
