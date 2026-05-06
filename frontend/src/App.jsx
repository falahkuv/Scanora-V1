import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import ScannerSheet from './components/ScannerSheet';
import { initializeAuth } from './api';

function App() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    initializeAuth().then(() => setIsAuthReady(true));
  }, []);

  if (!isAuthReady) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-scanora-green">Memuat...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative shadow-xl overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar w-full">
          <Routes>
            <Route path="/" element={<Home onOpenScanner={() => setIsScannerOpen(true)} />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Bottom Navigation */}
        <BottomNav onOpenScanner={() => setIsScannerOpen(true)} />

        {/* Scanner Overlay (Bottom Sheet) */}
        <ScannerSheet isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
      </div>
    </Router>
  );
}

export default App;
