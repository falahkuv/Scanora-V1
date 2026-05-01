import { useState, useEffect } from 'react';
import { Search, Clock, Package } from 'lucide-react';
import api from '../api';

const getFruitIcon = (type) => {
  const t = type?.toLowerCase() || '';
  if (t.includes('pisang') || t.includes('banana')) return '🍌';
  if (t.includes('apel') || t.includes('apple')) return '🍎';
  if (t.includes('jeruk') || t.includes('orange')) return '🍊';
  return '🍎'; // default fallback
};

const calculateDaysLeft = (reminderAt) => {
  if (!reminderAt) return '-';
  const diff = new Date(reminderAt) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'history'
  const [inventoryData, setInventoryData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invRes, histRes] = await Promise.all([
          api.get('/inventory'),
          api.get('/scan/history')
        ]);
        if (invRes.data.success) setInventoryData(invRes.data.data);
        if (histRes.data.success) setHistoryData(histRes.data.data);
      } catch (err) {
        console.error("Failed to fetch inventory data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-32">
      {/* Header & Tabs fixed at top */}
      <div className="bg-white px-6 pt-6 pb-4 rounded-b-3xl shadow-sm z-10 sticky top-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Penyimpanan</h1>
        
        {/* Toggle Switch */}
        <div className="bg-gray-100 p-1 rounded-xl flex relative">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'inventory' ? 'bg-white text-scanora-dark shadow-sm' : 'text-gray-500'}`}
          >
            <Package size={16} />
            Inventori
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'history' ? 'bg-white text-scanora-dark shadow-sm' : 'text-gray-500'}`}
          >
            <Clock size={16} />
            Riwayat
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Memuat data...</div>
        ) : activeTab === 'inventory' ? (
          inventoryData.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {inventoryData.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                  <div className="text-4xl mb-3">{getFruitIcon(item.fruit_type)}</div>
                  <h3 className="font-semibold text-gray-900 capitalize">{item.fruit_type}</h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full mt-1 mb-2 ${
                    item.condition === 'ripe' ? 'bg-amber-100 text-amber-700' :
                    item.condition === 'unripe' ? 'bg-gray-100 text-gray-600' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.condition}
                  </span>
                  <p className="text-xs text-gray-500">Sisa {calculateDaysLeft(item.reminder_at)} hari</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-sm">Inventori kamu masih kosong.</div>
          )
        ) : (
          <div className="space-y-3">
            {historyData.length > 0 ? historyData.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                  {getFruitIcon(item.fruit_type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 capitalize">{item.fruit_type}</h3>
                  <p className="text-xs text-gray-400">{formatDate(item.scanned_at)}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded uppercase ${
                  item.condition === 'ripe' ? 'text-amber-600 bg-amber-50' :
                  item.condition === 'rotten' ? 'text-red-600 bg-red-50' :
                  'text-gray-600 bg-gray-50'
                }`}>
                  {item.condition}
                </span>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-400 text-sm">Belum ada riwayat scan.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
