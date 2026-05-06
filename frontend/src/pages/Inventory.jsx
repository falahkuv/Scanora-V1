import React, { useState, useEffect } from 'react';
import { Search, Clock, Package, X, Trash2 } from 'lucide-react';
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
  const [selectedItem, setSelectedItem] = useState(null);

  // Undo State
  const [undoItem, setUndoItem] = useState(null);
  const [undoProgress, setUndoProgress] = useState(0);
  const undoTimeoutRef = React.useRef(null);
  const undoIntervalRef = React.useRef(null);

  // Scroll visibility for floating tab
  const [showFloating, setShowFloating] = useState(false);
  const observerTarget = React.useRef(null);

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

    // Setup intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        setShowFloating(!entries[0].isIntersecting);
      },
      { root: null, threshold: 0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
      observer.disconnect();
    };
  }, []);

  const handleDeleteHistory = (item) => {
    // Optimistic UI update
    setHistoryData(prev => prev.filter(i => i.id !== item.id));
    setSelectedItem(null);
    setUndoItem(item);
    setUndoProgress(100);

    // Clear any existing timeout
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);

    // Progress bar animation (4s = 40 steps of 100ms)
    undoIntervalRef.current = setInterval(() => {
      setUndoProgress(prev => Math.max(0, prev - 2.5));
    }, 100);

    // Actual API delete after 4 seconds
    undoTimeoutRef.current = setTimeout(async () => {
      clearInterval(undoIntervalRef.current);
      setUndoItem(null);
      try {
        await api.delete(`/scan/history/${item.id}`);
      } catch (err) {
        console.error(err);
      }
    }, 4000);
  };

  const handleUndo = () => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
    
    setHistoryData(prev => {
      const newData = [undoItem, ...prev].sort((a, b) => new Date(b.scanned_at) - new Date(a.scanned_at));
      return newData;
    });
    setUndoItem(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-32 no-scrollbar">
      {/* Header fixed at top */}
      <div className="bg-white px-6 pt-6 pb-4 shadow-sm z-10 sticky top-0 border-b border-gray-100">
        <div className="bg-gray-100 p-1 rounded-xl flex relative">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all active:scale-95 min-h-[44px] ${activeTab === 'inventory' ? 'bg-white text-scanora-dark shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            <Package size={16} /> Inventori
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all active:scale-95 min-h-[44px] ${activeTab === 'history' ? 'bg-white text-scanora-dark shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            <Clock size={16} /> Riwayat
          </button>
        </div>
      </div>

      {/* Target for intersection observer to know when we scrolled past header */}
      <div ref={observerTarget} className="h-1 w-full" />

      {/* Floating Tab Switcher */}
      <div className={`fixed left-0 right-0 z-30 flex justify-center transition-all duration-300 ease-out ${showFloating ? 'bottom-32 translate-y-0 opacity-100 pointer-events-auto' : 'bottom-28 translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-gray-100/90 backdrop-blur-md p-1.5 rounded-full flex gap-1 shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-gray-200">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-all active:scale-95 ${activeTab === 'inventory' ? 'bg-white text-scanora-dark shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Package size={16} /> Inventori
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-all active:scale-95 ${activeTab === 'history' ? 'bg-white text-scanora-dark shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Clock size={16} /> Riwayat
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
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center cursor-pointer hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all"
                >
                  <div className="w-full aspect-square bg-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.fruit_type} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl drop-shadow-sm">{getFruitIcon(item.fruit_type)}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 capitalize">{item.fruit_type} {getFruitIcon(item.fruit_type)}</h3>
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
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all"
              >
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

      {/* Detail Dialog Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all animate-slide-up">
            <div className="relative aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
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
                  <h2 className="text-2xl font-bold text-gray-900 capitalize flex items-center gap-2">
                    {selectedItem.fruit_type} {getFruitIcon(selectedItem.fruit_type)}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(selectedItem.added_at || selectedItem.scanned_at)}
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase ${
                  selectedItem.condition === 'ripe' ? 'text-amber-700 bg-amber-100' :
                  selectedItem.condition === 'rotten' ? 'text-red-700 bg-red-100' :
                  'text-gray-700 bg-gray-100'
                }`}>
                  {selectedItem.condition}
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Informasi</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Buah ini terdeteksi sebagai {selectedItem.fruit_type} dalam kondisi {selectedItem.condition}.
                  {selectedItem.reminder_at ? ` Sisa waktu optimal: ${calculateDaysLeft(selectedItem.reminder_at)} hari.` : ''}
                </p>
              </div>

              {activeTab === 'inventory' ? (
                <div className="space-y-3">
                  <button 
                    onClick={async () => {
                      try {
                        await api.delete(`/inventory/${selectedItem.id}`);
                        setInventoryData(prev => prev.filter(i => i.id !== selectedItem.id));
                        setSelectedItem(null);
                      } catch(err) { console.error(err); }
                    }}
                    className="w-full min-h-[44px] bg-scanora-green text-white font-semibold rounded-xl hover:bg-scanora-dark active:scale-95 transition-all"
                  >
                    Sudah aing makan
                  </button>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="w-full min-h-[44px] bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
                  >
                    Tutup
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button 
                    onClick={async () => {
                      try {
                        await api.post('/inventory', {
                          fruit_type: selectedItem.fruit_type,
                          condition: selectedItem.condition,
                          scan_id: selectedItem.id,
                          reminder_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
                        });
                        setSelectedItem(null);
                        // Refresh inventory silently
                        api.get('/inventory').then(res => setInventoryData(res.data.data));
                      } catch(err) { console.error(err); }
                    }}
                    className="w-full min-h-[44px] bg-scanora-green text-white font-semibold rounded-xl hover:bg-scanora-dark active:scale-95 transition-all"
                  >
                    Masukkan ke Inventori
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDeleteHistory(selectedItem)}
                      className="w-[20%] min-h-[44px] bg-red-100 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-200 active:scale-95 transition-all"
                      title="Hapus dari Riwayat"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button 
                      onClick={() => setSelectedItem(null)}
                      className="w-[80%] min-h-[44px] bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Undo Toast */}
      {undoItem && (
        <div className="fixed bottom-28 left-4 right-4 z-50 bg-white text-gray-900 p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex flex-col gap-2 border border-gray-100 animate-fade-in-down">
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-medium">Riwayat item dihapus</span>
            <button 
              onClick={handleUndo}
              className="text-scanora-green font-bold text-sm uppercase tracking-wide hover:text-green-500 active:scale-95 transition-all"
            >
              Undo
            </button>
          </div>
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-scanora-green transition-all duration-100 ease-linear"
              style={{ width: `${undoProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
