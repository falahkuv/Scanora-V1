import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import ScannerSheet from './components/ScannerSheet';
import LoadingScreen from './components/LoadingScreen';
import { initializeAuth } from './api';

function App() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    initializeAuth().then(() => setIsAuthReady(true));
  }, []);

  if (!isAuthReady) return <LoadingScreen />;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col max-w-md mx-auto relative shadow-xl overflow-hidden transition-colors">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar w-full">
          <Routes>
            <Route path="/" element={<Home onOpenScanner={() => setIsScannerOpen(true)} />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Routes>
          <Route path="/login" element={null} />
          <Route path="/register" element={null} />
          <Route path="/profile" element={null} />
          <Route path="/onboarding" element={null} />
          <Route path="*" element={<BottomNav onOpenScanner={() => setIsScannerOpen(true)} />} />
        </Routes>

        {/* Scanner Overlay (Bottom Sheet) */}
        <ScannerSheet isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
      </div>
    </Router>
  );
}

export default App;
