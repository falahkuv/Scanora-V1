import { useState, useEffect } from 'react';
import { User, AlertCircle, ChevronRight } from 'lucide-react';
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
  const [urgentItems, setUrgentItems] = useState([]);
  const [savedCount, setSavedCount] = useState(0);

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
  }, []);

  return (
    <div className="p-6 pb-32">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Halo, Sobat!</h1>
          <p className="text-sm text-gray-500">Ayo selamatkan makanan hari ini.</p>
        </div>
        <div className="w-12 h-12 bg-scanora-green/10 rounded-full flex items-center justify-center text-scanora-green">
          <User size={24} />
        </div>
      </header>

      {/* Urgent Action Highlight */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="text-status-ripe" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Segera Konsumsi</h2>
        </div>
        
        {urgentItems.length > 0 ? (
          <div className="space-y-3">
            {urgentItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
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
                <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-scanora-green hover:bg-scanora-green/10 transition-colors">
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
    </div>
  );
};

export default Home;
