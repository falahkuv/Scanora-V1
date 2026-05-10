import { Home, Boxes, Camera } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav = ({ onOpenScanner }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-16 py-3 flex justify-between items-center pb-safe max-w-md mx-auto rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 transition-colors">
      <button 
        onClick={() => navigate('/')}
        className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-scanora-green' : 'text-gray-400'}`}
      >
        <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Beranda</span>
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
        <span className="text-[10px] font-medium mt-1 text-gray-400">Scan Buah</span>
      </div>

      <button 
        onClick={() => navigate('/inventory')}
        className={`flex flex-col items-center gap-1 ${isActive('/inventory') ? 'text-scanora-green' : 'text-gray-400'}`}
      >
        <Boxes size={24} strokeWidth={isActive('/inventory') ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Inventori</span>
      </button>
    </div>
  );
};

export default BottomNav;
