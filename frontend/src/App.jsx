import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import SideNav from './components/SideNav';
import ViewportToggle from './components/ViewportToggle';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import ScannerSheet from './components/ScannerSheet';
import LoadingScreen from './components/LoadingScreen';
import { initializeAuth } from './api';
import { ViewportProvider, useViewport } from './context/ViewportContext';

// Pages where nav/toggle should NOT appear
const NO_NAV_PATHS = ['/login', '/register', '/onboarding'];

// ─── Inner shell: needs Router context for useLocation ───────────────────────
function AppShell({ isScannerOpen, setIsScannerOpen, isAppEntering, isSplashVisible }) {
  const { viewport } = useViewport();
  const location = useLocation();

  const isNoNav = NO_NAV_PATHS.includes(location.pathname);
  const isDesktop = viewport === 'desktop';
  const isTablet  = viewport === 'tablet';

  // Container sizing per viewport
  const shellClass = isDesktop
    ? 'w-full flex flex-row'
    : isTablet
    ? 'max-w-2xl mx-auto flex flex-col shadow-2xl'
    : 'max-w-md mx-auto flex flex-col shadow-xl';

  return (
    <>
      {/* ── App Shell ── */}
      <div
        className={`${shellClass} h-[100dvh] bg-gray-50 dark:bg-gray-900 relative overflow-hidden transition-colors app-shell ${isAppEntering ? 'app-enter' : ''} ${isSplashVisible ? 'app-hidden' : ''}`}
      >
        {/* Desktop: left sidebar */}
        {isDesktop && !isNoNav && (
          <SideNav onOpenScanner={() => setIsScannerOpen(true)} />
        )}

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto no-scrollbar w-full">
          <Routes>
            <Route path="/"          element={<Home onOpenScanner={() => setIsScannerOpen(true)} />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/profile"   element={<Profile />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Mobile / Tablet: bottom nav */}
        {!isDesktop && !isNoNav && (
          <Routes>
            <Route path="/login"      element={null} />
            <Route path="/register"   element={null} />
            <Route path="/profile"    element={null} />
            <Route path="/onboarding" element={null} />
            <Route path="*" element={<BottomNav onOpenScanner={() => setIsScannerOpen(true)} />} />
          </Routes>
        )}

        {/* Scanner overlay */}
        <ScannerSheet isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
      </div>

      {/* ── Floating Viewport Toggle (outside shell, inside Router) ── */}
      {!isNoNav && <ViewportToggle />}
    </>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
function App() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAuthReady,   setIsAuthReady]   = useState(false);
  const [isSplashVisible,  setIsSplashVisible]  = useState(() => !sessionStorage.getItem('scanora_first_load'));
  const [isSplashExiting,  setIsSplashExiting]  = useState(false);
  const [isAppEntering,    setIsAppEntering]    = useState(() => !!sessionStorage.getItem('scanora_first_load'));

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
