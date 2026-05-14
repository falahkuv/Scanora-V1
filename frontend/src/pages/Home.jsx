import { useState, useEffect } from 'react';
import { User, AlertCircle, X, Utensils, Trash2, Salad, Sprout, ImageOff, ChevronRight, CalendarCheck, CalendarX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const getFruitIcon = (type) => {
  const t = type?.toLowerCase() || '';
  if (t.includes('pisang') || t.includes('banana')) return '🍌';
  if (t.includes('apel') || t.includes('apple')) return '🍎';
  if (t.includes('jeruk') || t.includes('orange')) return '🍊';
  return '🍎';
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
  if (!reminderAt) return 999;
  const diff = new Date(reminderAt) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

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

  return { bg: 'bg-gray-100', text: 'text-gray-500', btnText: 'Tidak Layak', isExpired: true };
};

const Home = ({ onOpenScanner }) => {
  const navigate = useNavigate();
  const [urgentItems, setUrgentItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [impact, setImpact] = useState({ saved: '-', consumed: '-', discarded: '-' });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = user.name ? user.name.split(' ')[0] : 'Sobat';

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [invRes, summaryRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/inventory/summary').catch(() => ({ data: { success: false } })),
      ]);

      if (invRes.data.success) {
        const allItems = invRes.data.data;
        const urgent = allItems
          .map(item => ({ ...item, daysLeft: calculateDaysLeft(item.reminder_at) }))
          .filter(item => item.condition === 'ripe')
          .sort((a, b) => a.daysLeft - b.daysLeft);
        setUrgentItems(urgent);
        setImpact(prev => ({ ...prev, saved: allItems.length }));
      }

      if (summaryRes.data.success) {
        const s = summaryRes.data.data;
        setImpact(prev => ({ ...prev, consumed: s.consumed ?? 0, discarded: s.discarded ?? 0 }));
      }
    } catch (err) {
      console.error('Failed to load home data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
    window.addEventListener('scanora:inventoryUpdated', fetchHomeData);
    return () => window.removeEventListener('scanora:inventoryUpdated', fetchHomeData);
  }, []);

  const total = impact.consumed !== '-' ? impact.consumed + impact.discarded : 0;
  const saveRate = total > 0 ? Math.round((impact.consumed / total) * 100) : null;
  const prideMsg = saveRate === null ? null
    : saveRate >= 80 ? 'Luar biasa! Hampir semua buahmu terselamatkan. 🌟'
    : saveRate >= 50 ? 'Lumayan! Terus kurangi pemborosan ya. 👍'
    : 'Masih banyak yang dibuang. Yuk lebih bijak! 😬';

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

      {/* Impact Section */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sprout className="text-scanora-green" size={20} />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Impact Kamu</h2>
        </div>
        <div className="bg-gradient-to-br from-scanora-green to-scanora-dark rounded-2xl p-5 text-white shadow-md">
          {/* 3 metrics */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Consumed */}
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <Utensils size={16} className="text-white" />
              </div>
              <p className="text-2xl font-extrabold leading-none">{impact.consumed}</p>
              <p className="text-white/70 text-[10px] font-medium mt-1">Dikonsumsi</p>
            </div>
            {/* Discarded */}
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <Trash2 size={16} className="text-white" />
              </div>
              <p className="text-2xl font-extrabold leading-none">{impact.discarded}</p>
              <p className="text-white/70 text-[10px] font-medium mt-1">Dibuang</p>
            </div>
            {/* Saved */}
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <Salad size={16} className="text-white" />
              </div>
              <p className="text-2xl font-extrabold leading-none">{impact.saved}</p>
              <p className="text-white/70 text-[10px] font-medium mt-1">Disimpan</p>
            </div>
          </div>

          {/* Save rate bar */}
          {saveRate !== null ? (
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-white/80 text-xs font-semibold">Tingkat Keberhasilan</p>
                <p className="text-white font-bold text-sm">{saveRate}%</p>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${saveRate}%` }}
                />
              </div>
              <p className="text-white/70 text-[10px] mt-2 text-center">{prideMsg}</p>
            </div>
          ) : (
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-white/60 text-xs">Mulai konsumsi atau buang buah dari inventori untuk melihat statistikmu!</p>
            </div>
          )}
        </div>
      </section>

      {/* Urgent Action */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="text-status-ripe" size={20} />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Segera Konsumsi {!loading && `(${urgentItems.length})`}</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="w-12 h-6 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : urgentItems.length > 0 ? (
          <div className="space-y-3 max-h-[340px] overflow-y-auto no-scrollbar pb-2 pr-1">
            {urgentItems.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer active:scale-95 transition-all"
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
                  <div className="w-full h-full items-center justify-center bg-gray-100 flex-col gap-1" style={{ display: item.image_url ? 'none' : 'flex' }}>
                    <ImageOff size={20} className="text-gray-400" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 capitalize">{getFruitLabel(item.fruit_type)}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-status-ripe"></span>
                    <span className="text-xs text-gray-500">{item.daysLeft === 0 ? 'Hari ini!' : `Sisa ${item.daysLeft} hari`}</span>
                  </div>
                </div>
                <div className="w-16 flex-shrink-0">
                  <ScoreBadge score={item.freshness_score_latest ?? item.freshness_score_initial} className="py-1 text-[12px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm">Semua buah masih aman! 🌿</p>
          </div>
        )}
      </section>

      {/* Detail Dialog Modal (Same as Inventory Detail) */}
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
                  const countdown = getCountdownConfig(selectedItem.condition, daysLeft);
                  return (
                    <div className={`px-4 py-3 rounded-xl text-center text-sm font-bold w-full ${countdown.bg} ${countdown.text}`}>
                      {countdown.btnText}
                    </div>
                  );
                })()}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      await api.delete(`/inventory/${selectedItem.id}`, { data: { outcome: 'discarded' } });
                      setUrgentItems(prev => prev.filter(i => i.id !== selectedItem.id));
                      setSelectedItem(null);
                      fetchHomeData();
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
                      setUrgentItems(prev => prev.filter(i => i.id !== selectedItem.id));
                      setSelectedItem(null);
                      fetchHomeData();
                    } catch (err) { console.error(err); }
                  }}
                  className="flex-1 min-h-[44px] bg-scanora-green text-white font-semibold rounded-xl hover:bg-scanora-dark active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Utensils size={16} /> Dikonsumsi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
