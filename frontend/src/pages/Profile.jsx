import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, ChevronLeft, User, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

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
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'id' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32 transition-colors">
      <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4 shadow-sm z-10 sticky top-0 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('profile.title')}</h1>
      </div>

      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 flex flex-col items-center shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="w-20 h-20 bg-scanora-green/10 rounded-full flex items-center justify-center text-scanora-green mb-4">
            <User size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('profile.greeting')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">sobat@scanora.app</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 transition-colors">
          <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500">
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-500">
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

          <div 
            onClick={handleLogout}
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500">
                <LogOut size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-red-500">{t('profile.logout')}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
