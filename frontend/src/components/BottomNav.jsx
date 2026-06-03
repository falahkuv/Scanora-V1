import { Home, Salad, Camera } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BottomNav = ({ onOpenScanner }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-around items-center pb-safe rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 transition-colors mt-auto">
      <button
        onClick={() => navigate('/')}
        className={`flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] ${isActive('/') ? 'text-scanora-green' : 'text-gray-400'}`}
      >
        <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
        <span className="text-[10px] font-medium">{t('nav.home')}</span>
      </button>

      {/* Floating Action Button (FAB) */}
      <div className="relative flex flex-col items-center">
        <button
          onClick={onOpenScanner}
          className="absolute -top-12 bg-scanora-green text-white p-4 rounded-full shadow-lg shadow-scanora-green/40 hover:bg-scanora-dark transition-colors transform active:scale-95"
        >
          <Camera size={28} strokeWidth={2.5} />
        </button>
        <div className="w-14 h-6"></div>
        <span className="text-[10px] font-medium mt-1 text-gray-400">{t('nav.scanFruit')}</span>
      </div>

      <button
        onClick={() => navigate('/inventory')}
        className={`flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] ${isActive('/inventory') ? 'text-scanora-green' : 'text-gray-400'}`}
      >
        <Salad size={24} strokeWidth={isActive('/inventory') ? 2.5 : 2} />
        <span className="text-[10px] font-medium">{t('nav.inventory')}</span>
      </button>
    </div>
  );
};

export default BottomNav;
