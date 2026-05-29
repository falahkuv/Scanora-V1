import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, ChevronLeft, User, Languages, Bell, ChartColumnBig, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useViewport } from '../context/ViewportContext';

const Profile = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [notifEnabled, setNotifEnabled] = useState(() => {
    if ('Notification' in window) {
      return Notification.permission === 'granted' && localStorage.getItem('notificationsEnabled') !== 'false';
    }
    return false;
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = user.name || 'Sobat Scanora';
  const joinDateStr = user.created_at || user.createdAt;
  const joinDate = joinDateStr ? new Date(joinDateStr).toLocaleDateString('en-GB') : 'sekarang';

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/onboarding');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'id' : 'en';
    i18n.changeLanguage(newLang);
  };

  const toggleNotif = async () => {
    if (!notifEnabled) {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setNotifEnabled(true);
          localStorage.setItem('notificationsEnabled', 'true');
        } else {
          alert('Izin notifikasi ditolak. Silakan izinkan melalui pengaturan browser.');
        }
      } else {
        alert('Browser ini tidak mendukung notifikasi.');
      }
    } else {
      setNotifEnabled(false);
      localStorage.setItem('notificationsEnabled', 'false');
    }
  };

  const installPwa = () => {
    // If the browser provides a beforeinstallprompt event, we can capture it here
    // For now, prompt the user with instructions since this is typically captured at root level
    alert('Untuk meng-install aplikasi ini ke layar beranda Anda:\n\nAndroid: Tap tombol titik tiga (⋮) di Chrome lalu pilih "Add to Home screen"\n\niOS: Tap ikon Share (kotak dengan panah) di Safari, lalu pilih "Add to Home Screen"');
  };

  const { viewport } = useViewport();
  const isDesktop = viewport === 'desktop';
  const isTablet = viewport === 'tablet';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32 transition-colors">
      <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4 shadow-sm z-10 sticky top-0 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4">
        {!isDesktop && (
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('profile.title')}</h1>
      </div>

      <div className="p-6">
        <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors
          ${(isDesktop || isTablet) ? 'flex flex-row items-center gap-5' : 'flex flex-col items-center text-center gap-4'}`}>
          <div className="w-20 h-20 bg-scanora-green/10 rounded-full flex-shrink-0 flex items-center justify-center text-scanora-green">
            <User size={40} />
          </div>
          <div className={`flex flex-col overflow-hidden ${(isDesktop || isTablet) ? '' : 'items-center'}`}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{firstName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-1.5">{user.email || 'sobat@scanora.app'}</p>
            <p className="text-xs font-medium text-scanora-green bg-scanora-green/10 w-fit px-2.5 py-1 rounded-md">Sobat Scanora sejak {joinDate}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 transition-colors">
          <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-scanora-green/10 dark:bg-scanora-green/20 rounded-full flex items-center justify-center text-scanora-green">
                {isDark ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('profile.dark_mode')}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.dark_mode_desc')}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsDark(!isDark)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${isDark ? 'bg-scanora-green' : 'bg-gray-200 dark:bg-gray-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}`}></div>
            </button>
          </div>

          <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-scanora-green/10 dark:bg-scanora-green/20 rounded-full flex items-center justify-center text-scanora-green">
                <Languages size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('profile.language')}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.language_desc')}</p>
              </div>
            </div>
            <button 
              onClick={toggleLanguage}
              className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm rounded-full active:scale-95 transition-all"
            >
              {i18n.language === 'en' ? 'EN' : 'ID'}
            </button>
          </div>

          <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 gap-4">
            <div className="flex items-center gap-4 flex-1 pr-2 min-w-0">
              <div className="w-10 h-10 bg-scanora-green/10 dark:bg-scanora-green/20 rounded-full flex-shrink-0 flex items-center justify-center text-scanora-green">
                <Bell size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{i18n.language === 'en' ? 'Push Notifications' : 'Notifikasi Push'}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 break-words">{i18n.language === 'en' ? 'Smart freshness reminders' : 'Pengingat pintar sebelum buah matang dan membusuk'}</p>
              </div>
            </div>
            <button 
              onClick={toggleNotif}
              className={`flex-shrink-0 w-12 h-6 rounded-full transition-colors relative flex items-center ${notifEnabled ? 'bg-scanora-green' : 'bg-gray-200 dark:bg-gray-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${notifEnabled ? 'translate-x-6' : 'translate-x-1'}`}></div>
            </button>
          </div>

          <div 
            onClick={() => navigate('/stats')}
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-scanora-green/10 dark:bg-scanora-green/20 rounded-full flex items-center justify-center text-scanora-green">
                <ChartColumnBig size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Statistik Performa</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Lihat rekap pemindaian dan tingkat keberhasilan</p>
              </div>
            </div>
            <ChevronLeft size={20} className="text-gray-400 rotate-180" />
          </div>

          <div 
            onClick={installPwa}
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-scanora-green/10 dark:bg-scanora-green/20 rounded-full flex items-center justify-center text-scanora-green">
                <Download size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Install Aplikasi (PWA)</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tambahkan Scanora ke Home Screen</p>
              </div>
            </div>
          </div>

          <div 
            onClick={handleLogout}
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 dark:bg-red-main/30 rounded-full flex items-center justify-center text-red-main">
                <LogOut size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-red-main">{t('profile.logout')}</h3>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/home')}
          className="w-full mt-2 py-3.5 bg-scanora-green text-white font-bold rounded-2xl shadow-sm hover:bg-scanora-green/90 active:scale-[0.98] transition-all flex items-center justify-center"
        >
          Kembali ke Beranda
        </button>

        {/* Footer App Version */}
        <div className="mt-12 mb-8 flex flex-col items-center justify-center text-center opacity-80">
          <div className="flex items-center gap-1.5 mb-1.5 text-gray-500 dark:text-gray-400">
            <img src="/mascots/apple_ripe.png" alt="Scanora Logo" className="w-5 h-5 opacity-80" />
            <span className="font-bold tracking-wide">Scanora</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            v1.9.2 Beta &middot; Mei 2026
          </p>
          <p className="text-xs italic text-gray-500 dark:text-gray-400 mb-3">
            "Choose Better, Waste Less."
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            &copy; 2026 Scanora. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Profile;
