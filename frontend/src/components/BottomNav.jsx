import { Home, List, Camera } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav = ({ onOpenScanner }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center pb-safe max-w-md mx-auto rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
      <button 
        onClick={() => navigate('/')}
        className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-scanora-green' : 'text-gray-400'}`}
      >
        <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Beranda</span>
      </button>

      {/* Floating Action Button (FAB) */}
      <div className="relative -top-6">
        <button 
          onClick={onOpenScanner}
          className="bg-scanora-green text-white p-4 rounded-full shadow-lg shadow-scanora-green/40 hover:bg-scanora-dark transition-colors transform active:scale-95"
        >
          <Camera size={28} strokeWidth={2.5} />
        </button>
      </div>

      <button 
        onClick={() => navigate('/inventory')}
        className={`flex flex-col items-center gap-1 ${isActive('/inventory') ? 'text-scanora-green' : 'text-gray-400'}`}
      >
        <List size={24} strokeWidth={isActive('/inventory') ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Inventori</span>
      </button>
    </div>
  );
};

export default BottomNav;
