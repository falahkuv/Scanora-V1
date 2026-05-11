import { useState, useEffect } from 'react';
import { User, AlertCircle, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const getFruitIcon = (type) => {
  const t = type?.toLowerCase() || '';
  if (t.includes('pisang') || t.includes('banana')) return '🍌';
  if (t.includes('apel') || t.includes('apple')) return '🍎';
  if (t.includes('jeruk') || t.includes('orange')) return '🍊';
  return '🍎'; 
};

const calculateDaysLeft = (reminderAt) => {
  if (!reminderAt) return 999;
  const diff = new Date(reminderAt) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

const Home = ({ onOpenScanner }) => {
  const navigate = useNavigate();
  const [urgentItems, setUrgentItems] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = user.name ? user.name.split(' ')[0] : 'Sobat';

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/inventory');
        if (res.data.success) {
          const allItems = res.data.data;
          
          // Filter items that expire in <= 2 days
          const urgent = allItems
            .map(item => ({ ...item, daysLeft: calculateDaysLeft(item.reminder_at) }))
            .filter(item => item.daysLeft <= 2)
            .sort((a, b) => a.daysLeft - b.daysLeft);
            
          setUrgentItems(urgent);
          setSavedCount(allItems.length);
        }
      } catch (err) {
        console.error("Failed to load home data", err);
      }
    };
    fetchHomeData();
    window.addEventListener('scanora:inventoryUpdated', fetchHomeData);
    return () => window.removeEventListener('scanora:inventoryUpdated', fetchHomeData);
  }, []);

  return (
    <div className="p-6 pb-32 bg-gray-50 dark:bg-gray-900 transition-colors min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Halo, {firstName}!</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ayo selamatkan makanan hari ini.</p>
        </div>
        <button 
          onClick={() => navigate('/profile')}
          className="w-12 h-12 bg-scanora-green/10 rounded-full flex items-center justify-center text-scanora-green hover:bg-scanora-green/20 active:scale-95 transition-all"
        >
          <User size={24} />
        </button>
      </header>

      {/* Urgent Action Highlight */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="text-status-ripe" size={20} />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Segera Konsumsi ({urgentItems.length})</h2>
        </div>
        
        {urgentItems.length > 0 ? (
          <div className="space-y-3 max-h-[340px] overflow-y-auto no-scrollbar pb-2 pr-1">
            {urgentItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer active:scale-95 transition-all"
              >
                <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-3xl">
                  {getFruitIcon(item.fruit_type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 capitalize">{item.fruit_type}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-status-ripe"></span>
                    <span className="text-xs text-gray-500">Sisa {item.daysLeft} hari</span>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-300 hover:text-scanora-green hover:bg-scanora-green/10 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm">Semua buah masih aman! 🌿</p>
          </div>
        )}
      </section>

      {/* Mini Dashboard / Gamification (Backlog) */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Impact Kamu</h2>
        <div className="bg-gradient-to-br from-scanora-green to-scanora-dark rounded-2xl p-5 text-white shadow-md">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/80 text-sm mb-1">Buah tersimpan</p>
              <p className="text-3xl font-bold">{savedCount} <span className="text-lg font-normal">item</span></p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">Total</p>
              <p className="font-semibold text-sm">di inventori</p>
            </div>
          </div>
        </div>
      </section>
      {/* Detail Dialog Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all animate-slide-up">
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {selectedItem.image_url ? (
                <img src={selectedItem.image_url} alt={selectedItem.fruit_type} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl drop-shadow-md">{getFruitIcon(selectedItem.fruit_type)}</span>
              )}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                    {selectedItem.fruit_type} {getFruitIcon(selectedItem.fruit_type)}
                  </h2>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase ${
                  selectedItem.condition === 'ripe' ? 'text-amber-700 bg-amber-100' :
                  selectedItem.condition === 'rotten' ? 'text-red-700 bg-red-100' :
                  'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700'
                }`}>
                  {selectedItem.condition}
                </span>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 mb-6 border border-gray-100 dark:border-gray-600">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Informasi</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Buah ini terdeteksi sebagai {selectedItem.fruit_type} dalam kondisi {selectedItem.condition}.
                  {selectedItem.reminder_at ? ` Sisa waktu optimal: ${calculateDaysLeft(selectedItem.reminder_at)} hari.` : ''}
                </p>
              </div>

              <button 
                onClick={() => setSelectedItem(null)}
                className="w-full min-h-[44px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
