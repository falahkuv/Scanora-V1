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

    // ==========================================
    // TESTING NOTIFICATIONS (Keyboard Triggers)
    // ==========================================
    const handleKeyDown = (e) => {
      // "P" untuk minta izin notifikasi ke browser
      if (e.key.toLowerCase() === 'p') {
        if ('Notification' in window) {
          Notification.requestPermission().then(perm => {
            alert(`Status Izin Notifikasi: ${perm}`);
          });
        }
        return;
      }

      // Simulasi tanggal simpan (misal 5 hari yang lalu)
      const mockDate = new Date();
      mockDate.setDate(mockDate.getDate() - 5);
      const savedDateStr = mockDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });

      const caseMap = {
        '1': { 
          title: "🥗 Jangan Lupa Apel🍎 Kamu!", 
          body: `Mengingatkan: Apel🍎 yang kamu simpan sejak ${savedDateStr} tinggal 3 hari lagi sebelum mulai membusuk. Yuk, jadwalkan untuk dikonsumsi!` 
        },
        '2': { 
          title: "⚠️ Pisang🍌 Hampir Busuk!", 
          body: `Perhatian! Pisang🍌 yang kamu simpan sejak ${savedDateStr} sisa 1 hari lagi. Segera konsumsi atau olah menjadi jus hari ini!` 
        },
        '3': { 
          title: "🚨 HARI TERAKHIR untuk Jeruk🍊!", 
          body: `Jeruk🍊 yang kamu simpan sejak ${savedDateStr} diperkirakan sudah mencapai batas maksimal kesegarannya HARI INI. Konsumsi sekarang sebelum terbuang sia-sia!` 
        },
        '4': { 
          title: "✨ Apel🍎 Matang Besok!", 
          body: `Kabar gembira! Apel🍎 yang kamu simpan sejak ${savedDateStr} akan matang sempurna dalam 1 hari lagi. Siapkan resep favoritmu!` 
        },
        '5': { 
          title: "😋 Pisang🍌 Sudah Matang!", 
          body: `Hore! Pisang🍌 yang kamu simpan sejak ${savedDateStr} HARI INI sudah matang sempurna. Yuk, nikmati selagi rasanya paling manis!` 
        }
      };

      if (caseMap[e.key]) {
        const notifData = caseMap[e.key];
        console.log(`[Testing] Menyiapkan Notifikasi Case ${e.key} dalam 3 detik...`);
        // Munculkan toast kecil sebagai indikator di layar
        const event = new CustomEvent('scanora:testNotif', { detail: `Memproses Notifikasi Case ${e.key}...` });
        window.dispatchEvent(event);

        setTimeout(() => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notifData.title, { body: notifData.body });
            console.log("Notifikasi berhasil dimunculkan!");
          } else {
            alert(`[Notifikasi Diblokir Browser - Izin Belum Granted]\n\nTitle: ${notifData.title}\nBody: ${notifData.body}\n\n*Tekan 'P' di keyboard untuk request permission.`);
          }
        }, 3000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
