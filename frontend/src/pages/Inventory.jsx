import React, { useState, useEffect, useCallback } from 'react';
import { History, Salad, X, Trash2, Apple, Banana, Citrus, ChevronRight, CalendarCheck, CalendarX, ImageOff, Utensils, Package, Refrigerator } from 'lucide-react';
import api from '../api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizeFruit = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('pisang') || t.includes('banana')) return 'banana';
  if (t.includes('apel') || t.includes('apple')) return 'apple';
  if (t.includes('jeruk') || t.includes('orange')) return 'orange';
  return 'apple';
};

const getMascotSrc = (fruitType, condition) => {
  const fruit = normalizeFruit(fruitType);
  const cond = (condition || 'ripe').toLowerCase();
  return `/mascots/${fruit}_${cond}.png`;
};

const getFruitLabel = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('pisang') || t.includes('banana')) return 'Pisang';
  if (t.includes('apel') || t.includes('apple')) return 'Apel';
  if (t.includes('jeruk') || t.includes('orange')) return 'Jeruk';
  return type;
};

const getConditionLabel = (condition) => {
  const c = (condition || '').toLowerCase();
  if (c === 'unripe') return 'Unripe';
  if (c === 'ripe') return 'Ripe';
  if (c === 'rotten') return 'Rotten';
  return condition;
};

const getConditionBadgeStyle = (condition) => {
  const c = (condition || '').toLowerCase();
  if (c === 'unripe') return 'bg-teal-100 text-teal-700'; // Cyan/Teal like in mockup
  if (c === 'ripe') return 'bg-green-100 text-green-700'; // Like freshness score
  if (c === 'rotten') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-600';
};

const calculateDaysLeft = (reminderAt) => {
  if (!reminderAt) return null;
  const diff = new Date(reminderAt) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Returns countdown display config based on condition + daysLeft.
 * - unripe: always green, "Matang X Hari Lagi!"
 * - ripe/rotten: color-coded by days left
 */
const getCountdownConfig = (condition, daysLeft) => {
  const cond = (condition || '').toLowerCase();
  const isExpired = cond === 'rotten' || daysLeft === null || daysLeft < 0;

  if (isExpired) {
    return { bg: 'bg-gray-100', text: 'text-gray-500', btnText: 'Tidak Layak', isExpired: true };
  }

  if (cond === 'unripe') {
    return { bg: 'bg-scanora-green', text: 'text-white', btnText: daysLeft > 0 ? `Matang ${daysLeft} Hari Lagi` : 'Siap Matang', isExpired: false };
  }

  if (daysLeft === 0) {
    return { bg: 'bg-[#e02224]', text: 'text-white', btnText: `Hari ini!`, isExpired: false };
  }
  if (daysLeft === 1) {
    return { bg: 'bg-[#e02224]', text: 'text-white', btnText: `Sisa 1 Hari Lagi`, isExpired: false };
  }
  if (daysLeft > 1) {
    return { bg: 'bg-orange-400', text: 'text-white', btnText: `Sisa ${daysLeft} Hari Lagi`, isExpired: false };
  }

  return { bg: 'bg-gray-100', text: 'text-gray-500', btnText: 'Kedaluwarsa', isExpired: true };
};

/** Short month: "11 Mei 2026" */
const formatShortDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

/** Captured date: "27 Mei" */
const formatCapturedDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

/** Percent badge for freshness score */
const ScoreBadge = ({ score, className = "py-1 text-[11px]" }) => {
  const pct = Math.round((score ?? 0) * 100);
  const bg = pct >= 70 ? 'bg-green-100' : pct > 0 ? 'bg-orange-100' : 'bg-red-800';
  const text = pct >= 70 ? 'text-green-700' : pct > 0 ? 'text-orange-700' : 'text-white';
  return (
    <div className={`px-2 rounded w-full text-center font-bold flex items-center justify-center ${bg} ${text} ${className}`}>
      {pct}%
    </div>
  );
};

// ─── Card Component ────────────────────────────────────────────────────────────

const InventoryCard = ({ item, onClick }) => {
  const daysLeft = calculateDaysLeft(item.reminder_at);
  const countdown = getCountdownConfig(item.condition, daysLeft);
  const labelText = item.condition === 'unripe' ? 'Matang:' : 'Busuk:';

  // Sky/grass background gradient for the card header
  const headerBg = 'bg-gradient-to-b from-sky-200 via-sky-100 to-green-200';

  return (
    <div
      onClick={onClick}
      className={`bg-white p-2 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all flex flex-col relative ${countdown.isExpired ? 'opacity-60 bg-gray-100 brightness-[0.95]' : ''}`}
    >
      <div className="relative">
        {/* ── Top half: image area ── */}
        <div className={`relative ${headerBg} flex-shrink-0 rounded-xl overflow-hidden aspect-square`}>
          {/* Condition Badge */}
          <span className={`absolute top-2 left-2 px-2.5 py-1 z-20 rounded-md text-[11px] font-bold shadow-sm ${getConditionBadgeStyle(item.condition)}`}>
            {getConditionLabel(item.condition)}
          </span>

          {/* Captured date */}
          <span className="absolute top-2 right-2 px-2 py-1 z-20 bg-white/90 backdrop-blur rounded-md text-[11px] font-bold text-gray-700 shadow-sm">
            {formatCapturedDate(item.added_at)}
          </span>

          {/* Real photo (full width) */}
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.fruit_type}
              className="absolute inset-0 w-full h-full object-cover z-0"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Broken image fallback */}
          <div
            className={`absolute inset-0 w-full h-full z-0 bg-gray-100 flex items-center justify-center flex-col gap-1`}
            style={{ display: item.image_url ? 'none' : 'flex' }}
          >
            <ImageOff size={40} className="text-gray-400" strokeWidth={1.5} />
            <span className="text-xs font-medium text-gray-400 text-center leading-tight px-2 mt-1">Gambar tidak ditemukan</span>
          </div>
        </div>

        {/* Mascot (bottom-right outside overflow-hidden) */}
        <img
          src={getMascotSrc(item.fruit_type, item.condition)}
          alt=""
          className="absolute -bottom-8 right-1 h-16 object-contain drop-shadow-md z-20"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* ── Bottom half: info ── */}
      <div className="px-2 pt-1 pb-1 flex flex-col gap-1.5 flex-1 mt-1">
        {/* Fruit name */}
        <h3 className="font-bold text-gray-900 text-lg leading-tight capitalize">
          {getFruitLabel(item.fruit_type)}
        </h3>

        {/* Label + date (with icons) */}
        <div className="flex items-center gap-1.5 mt-[0.5rem]">
          {item.condition === 'unripe' ? (
             <CalendarCheck size={14} className="text-gray-400" />
          ) : (
             <CalendarX size={14} className="text-gray-400" />
          )}
          <span className="text-xs font-semibold text-gray-500">
            {labelText} {item.reminder_at ? formatShortDate(item.reminder_at) : '-'}
          </span>
        </div>

        {/* Countdown & Freshness Score Row (80:20) */}
        <div className="flex gap-2 mt-1">
          <div className="w-[80%]">
            <div className={`w-full h-full flex items-center justify-center rounded-md py-1.5 text-[11px] font-bold ${countdown.bg} ${countdown.text}`}>
              {countdown.btnText}
            </div>
          </div>
          <div className="w-[20%]">
            <ScoreBadge score={item.freshness_score_latest ?? item.freshness_score_initial} className="h-full py-1.5 text-[10px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventoryData, setInventoryData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  // Undo state
  const [undoItem, setUndoItem] = useState(null);
  const [undoProgress, setUndoProgress] = useState(0);
  const undoTimeoutRef = React.useRef(null);
  const undoIntervalRef = React.useRef(null);

  // Floating tab
  const [showFloating, setShowFloating] = useState(false);
  const observerTarget = React.useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, histRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/scan/history'),
      ]);
      if (invRes.data.success) setInventoryData(invRes.data.data);
      if (histRes.data.success) setHistoryData(histRes.data.data);
    } catch (err) {
      console.error('Failed to fetch inventory data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const observer = new IntersectionObserver(
      (entries) => setShowFloating(!entries[0].isIntersecting),
      { root: null, threshold: 0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);

    window.addEventListener('scanora:inventoryUpdated', fetchData);

    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
      observer.disconnect();
      window.removeEventListener('scanora:inventoryUpdated', fetchData);
    };
  }, [fetchData]);

  const handleDeleteHistory = (item) => {
    setHistoryData(prev => prev.filter(i => i.id !== item.id));
    setSelectedItem(null);
    setUndoItem(item);
    setUndoProgress(100);

    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);

    undoIntervalRef.current = setInterval(() => {
      setUndoProgress(prev => Math.max(0, prev - 2.5));
    }, 100);

    undoTimeoutRef.current = setTimeout(async () => {
      clearInterval(undoIntervalRef.current);
      setUndoItem(null);
      try { await api.delete(`/scan/history/${item.id}`); } catch (err) { console.error(err); }
    }, 4000);
  };

  const handleUndo = () => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
    setHistoryData(prev =>
      [undoItem, ...prev].sort((a, b) => new Date(b.scanned_at) - new Date(a.scanned_at))
    );
    setUndoItem(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-32 no-scrollbar">
      {/* Sticky Header */}
      <div className="bg-white px-6 pt-6 pb-4 shadow-sm z-10 sticky top-0 border-b border-gray-100">
        <div className="bg-gray-100 p-1 rounded-xl flex relative">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all active:scale-95 min-h-[44px] ${activeTab === 'inventory' ? 'bg-white text-scanora-dark shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            <Salad size={16} /> Inventori ({inventoryData.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all active:scale-95 min-h-[44px] ${activeTab === 'history' ? 'bg-white text-scanora-dark shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            <History size={16} /> Riwayat ({historyData.length})
          </button>
        </div>
      </div>

      <div ref={observerTarget} className="h-1 w-full" />

      {/* Floating Tab Switcher */}
      <div className={`fixed left-0 right-0 z-30 flex justify-center transition-all duration-300 ease-out ${showFloating ? 'bottom-32 translate-y-0 opacity-100 pointer-events-auto' : 'bottom-28 translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-gray-100/90 backdrop-blur-md p-1.5 rounded-full flex gap-1 shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-gray-200">
          <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-all active:scale-95 ${activeTab === 'inventory' ? 'bg-white text-scanora-dark shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
            <Salad size={16} /> Inventori ({inventoryData.length})
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-all active:scale-95 ${activeTab === 'history' ? 'bg-white text-scanora-dark shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
            <History size={16} /> Riwayat ({historyData.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {loading ? (
          activeTab === 'inventory' ? (
            // Skeleton — Inventory grid
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="aspect-square bg-gray-100 animate-pulse" />
                  <div className="p-2 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                    <div className="h-7 w-full bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Skeleton — History list
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="w-16 h-6 bg-gray-100 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'inventory' ? (
          inventoryData.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {inventoryData.map(item => (
                <InventoryCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex gap-4 mb-6 items-center">
                <Apple size={48} className="text-red-400/40" strokeWidth={1.5} />
                <Banana size={48} className="text-yellow-400/40" strokeWidth={1.5} />
                <Citrus size={46} className="text-orange-400/40 -scale-x-100 -scale-y-100" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Inventori kamu masih kosong</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[260px]">
                Kalau kamu simpan ke Inventori maka aplikasi akan bisa memberi kamu notifikasi pengingat.
              </p>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {historyData.length > 0 ? historyData.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.fruit_type}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                    />
                  ) : null}
                  <div className="w-full h-full items-center justify-center" style={{ display: item.image_url ? 'none' : 'flex' }}>
                    <ImageOff size={20} className="text-gray-300" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 capitalize">{getFruitLabel(item.fruit_type)}</h3>
                  <p className="text-xs text-gray-400">{formatDate(item.scanned_at)}</p>
                </div>
                <span className={`text-xs font-semibold px-0 py-1 rounded-full uppercase flex-shrink-0 text-center min-w-[72px] ${getConditionBadgeStyle(item.condition)}`}>
                  {getConditionLabel(item.condition)}
                </span>
              </div>
            )) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
                <History size={48} className="text-gray-300 mb-6" strokeWidth={1.5} />
                <h3 className="text-lg font-bold text-gray-800 mb-2">Belum ada riwayat scan</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[260px]">
                  Setiap hasil scan buah yang dilakukan akan tersimpan ke sini.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all animate-slide-up">
            {/* Image banner */}
            <div className="relative aspect-video bg-gradient-to-b from-sky-200 to-green-200 flex items-center justify-center overflow-hidden">
              {selectedItem.image_url ? (
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.fruit_type}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                />
              ) : null}
              <div
                className="w-full h-full items-center justify-center flex-col gap-2 bg-gray-100"
                style={{ display: selectedItem.image_url ? 'none' : 'flex' }}
              >
                <ImageOff size={64} className="text-gray-400" strokeWidth={1.5} />
                <span className="text-lg font-medium text-gray-400">Gambar tidak ditemukan</span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {/* Name + badge hug */}
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-900 capitalize leading-none">
                  {getFruitLabel(selectedItem.fruit_type)}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase leading-none ${getConditionBadgeStyle(selectedItem.condition)}`}>
                  {getConditionLabel(selectedItem.condition)}
                </span>
              </div>

              {/* Date row */}
              <div className="flex items-center gap-1.5 mb-5">
                {selectedItem.condition === 'unripe' ? (
                  <CalendarCheck size={16} className="text-gray-400" />
                ) : (
                  <CalendarX size={16} className="text-gray-400" />
                )}
                <span className="text-sm text-gray-500 font-bold">
                  {selectedItem.condition === 'unripe' ? 'Matang saat:' : 'Batas layak:'} {formatShortDate(selectedItem.reminder_at)}
                </span>
              </div>

              {/* Freshness bar & Countdown */}
              <div className="mb-6">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-2">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2 font-bold text-center">Perubahan Freshness Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <ScoreBadge score={selectedItem.freshness_score_initial} className="py-2 text-sm" />
                    </div>
                    <div className="flex -space-x-2">
                      <ChevronRight size={20} className="text-gray-400 animate-pulse" style={{ animationDuration: '0.8s' }} />
                      <ChevronRight size={20} className="text-gray-400 animate-pulse" style={{ animationDuration: '0.8s', animationDelay: '0.2s' }} />
                    </div>
                    <div className="flex-1">
                      <ScoreBadge score={selectedItem.freshness_score_latest ?? selectedItem.freshness_score_initial} className="py-2 text-sm" />
                    </div>
                  </div>
                </div>

                {(() => {
                  const daysLeft = calculateDaysLeft(selectedItem.reminder_at);
                  const countdown = getCountdownConfig(selectedItem.condition, daysLeft, selectedItem.condition);
                  return (
                    <div className={`px-4 py-3 rounded-xl text-center text-sm font-bold w-full ${countdown.bg} ${countdown.text}`}>
                      {countdown.btnText}
                    </div>
                  );
                })()}
              </div>

              {/* Actions */}
              {activeTab === 'inventory' ? (
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await api.delete(`/inventory/${selectedItem.id}`, { data: { outcome: 'discarded' } });
                        setInventoryData(prev => prev.filter(i => i.id !== selectedItem.id));
                        setSelectedItem(null);
                      } catch (err) { console.error(err); }
                    }}
                    className="flex-1 min-h-[44px] bg-red-100 text-red-600 font-semibold rounded-xl hover:bg-red-200 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} /> Dibuang
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await api.delete(`/inventory/${selectedItem.id}`, { data: { outcome: 'consumed' } });
                        setInventoryData(prev => prev.filter(i => i.id !== selectedItem.id));
                        setSelectedItem(null);
                      } catch (err) { console.error(err); }
                    }}
                    className="flex-1 min-h-[44px] bg-scanora-green text-white font-semibold rounded-xl hover:bg-scanora-dark active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Utensils size={16} /> Dikonsumsi
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2 text-center">Simpan ke Inventori</p>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            await api.post('/inventory', { fruit_type: selectedItem.fruit_type, condition: selectedItem.condition, scan_id: selectedItem.id, storage_type: 'room_temp' });
                            setSelectedItem(null); fetchData(); window.dispatchEvent(new Event('scanora:inventoryUpdated'));
                          } catch (err) { console.error(err); }
                        }}
                        className="flex-1 min-h-[44px] bg-orange-100 text-orange-700 font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-orange-200 active:scale-95 transition-all text-[13px]"
                      >
                        <Package size={16} /> Suhu Ruang
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await api.post('/inventory', { fruit_type: selectedItem.fruit_type, condition: selectedItem.condition, scan_id: selectedItem.id, storage_type: 'refrigerated' });
                            setSelectedItem(null); fetchData(); window.dispatchEvent(new Event('scanora:inventoryUpdated'));
                          } catch (err) { console.error(err); }
                        }}
                        className="flex-1 min-h-[44px] bg-teal-100 text-teal-700 font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-teal-200 active:scale-95 transition-all text-[13px]"
                      >
                        <Refrigerator size={16} /> Suhu Dingin
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteHistory(selectedItem)}
                      className="w-[20%] min-h-[44px] bg-red-100 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-200 active:scale-95 transition-all"
                      title="Hapus dari Riwayat"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button onClick={() => setSelectedItem(null)} className="w-[80%] min-h-[44px] bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 active:scale-95 transition-all">
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
            <button onClick={handleUndo} className="text-scanora-green font-bold text-sm uppercase tracking-wide hover:text-green-500 active:scale-95 transition-all">Undo</button>
          </div>
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-scanora-green transition-all duration-100 ease-linear" style={{ width: `${undoProgress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
