import { useState, useEffect, useRef } from 'react';
import { User, AlertCircle, X, Utensils, Trash2, Salad, Sprout, ImageOff, ChevronRight, CalendarCheck, CalendarX, Bell, CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useViewport } from '../context/ViewportContext';
import { getCachedSuggestion, saveSuggestionToCache } from '../lib/aiSuggestionCache';

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
  if (c === 'unripe') return 'bg-green-100 text-green-700';
  if (c === 'ripe') return 'bg-orange-100 text-orange-700';
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
  const pct = Math.round(score ?? 0);
  const bg = pct >= 70 ? 'bg-green-100' : pct > 0 ? 'bg-orange-100' : 'bg-red-800';
  const text = pct >= 70 ? 'text-green-700' : pct > 0 ? 'text-orange-700' : 'text-white';
  return (
    <div className={`px-2 rounded w-full text-center font-bold flex items-center justify-center ${bg} ${text} ${className}`}>
      {pct}%
    </div>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const getCountdownConfig = (condition, daysLeft) => {
  const cond = (condition || '').toLowerCase();
  const isExpired = cond === 'rotten' || daysLeft === null || daysLeft < 0;

  if (isExpired) {
    return { bg: 'bg-gray-100', text: 'text-gray-500', btnText: 'Tidak Layak', isExpired: true };
  }

  if (cond === 'unripe') {
    if (daysLeft === null) {
      return { bg: 'bg-gray-100', text: 'text-gray-500', btnText: 'Tidak Akan Matang', isExpired: true };
    }
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

const NotificationItem = ({ notif, onDelete }) => {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    if (diff < 0) { // Only allow swiping left
      setTranslateX(diff);
      currentXRef.current = diff;
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (currentXRef.current < -80) { // Threshold to delete
      setTranslateX(-window.innerWidth); // Animate out
      setTimeout(() => onDelete(notif.id), 300); // Delete after animation
    } else {
      setTranslateX(0); // Snap back
    }
  };

  return (
    <div className="relative mb-3 overflow-hidden rounded-2xl bg-red-100 dark:bg-red-900/40">
      {/* Delete Background / Icon */}
      <div className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center text-red-600 dark:text-red-400">
        <Trash2 size={24} />
      </div>
      
      {/* Draggable Card */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative z-10 flex gap-4"
        style={{ 
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-scanora-green'}`} />
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 dark:text-white text-sm">{notif.title}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{notif.message}</p>
          <span className="text-[10px] font-bold text-gray-400 mt-2 block">{notif.date}</span>
        </div>
      </div>
    </div>
  );
};

const Home = ({ onOpenScanner }) => {
  const navigate = useNavigate();
  const [urgentItems, setUrgentItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [impact, setImpact] = useState({ saved: '-', consumed: '-', discarded: '-' });
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifBtnRef = useRef(null);
  
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset and auto-load AI suggestion state when selected item changes
  useEffect(() => {
    if (!selectedItem?.scan_id) {
      setAiSuggestion(null);
      setAiError(null);
      setAiLoading(false);
      return;
    }

    const currentScore = selectedItem.freshness_score_latest ?? selectedItem.freshness_score_initial;
    const condition = selectedItem.condition;
    const daysLeft = calculateDaysLeft(selectedItem.reminder_at);
    
    const { suggestion, tierChanged } = getCachedSuggestion(selectedItem.scan_id, currentScore, condition, daysLeft);

    if (suggestion) {
      setAiSuggestion(suggestion);
      setAiError(null);
      setAiLoading(false);

      if (tierChanged) {
        handleGetAiSuggestion(true);
      }
    } else {
      setAiSuggestion(null);
      setAiError(null);
      setAiLoading(false);
    }
  }, [selectedItem?.id]);

  const handleGetAiSuggestion = async (isBackground = false) => {
    if (!selectedItem?.scan_id) return;
    if (!isBackground) setAiLoading(true);
    setAiError(null);
    try {
      const currentScore = selectedItem.freshness_score_latest ?? selectedItem.freshness_score_initial;
      const condition = selectedItem.condition;
      const daysLeft = calculateDaysLeft(selectedItem.reminder_at);

      const res = await api.post(`/scan/${selectedItem.scan_id}/suggestion`, {
        freshness_score_latest: currentScore
      });
      const newSuggestion = res.data?.data?.ai_suggestion || 'Tidak ada saran tersedia.';
      setAiSuggestion(newSuggestion);
      saveSuggestionToCache(selectedItem.scan_id, newSuggestion, currentScore, condition, daysLeft);
    } catch (err) {
      if (!isBackground) setAiError('Gagal mendapatkan saran. Coba lagi.');
    } finally {
      if (!isBackground) setAiLoading(false);
    }
  };

  // ── Notification read-state helpers (persisted via localStorage) ──────────
  const getReadIds = () => {
    try { return new Set(JSON.parse(localStorage.getItem('scanora_read_notifs') || '[]')); }
    catch { return new Set(); }
  };
  const saveReadIds = (ids) => {
    localStorage.setItem('scanora_read_notifs', JSON.stringify([...ids]));
  };
  const markAllAsRead = (notifList) => {
    const ids = getReadIds();
    notifList.forEach(n => ids.add(n.id));
    saveReadIds(ids);
  };
  // ─────────────────────────────────────────────────────────────────────────

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = user.name ? user.name.split(' ')[0] : 'Sobat';

  // ── Request notification permission ──────────────────────────────────────
  const ensureNotifPermission = async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      localStorage.setItem('notificationsEnabled', 'true');
      return true;
    }
    return false;
  };

  const handleOpenNotifications = async () => {
    // Ask permission if not yet decided
    await ensureNotifPermission();
    setShowNotifications(true);
    // Mark all current notifs as read and persist
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      markAllAsRead(updated);
      return updated;
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua notifikasi?')) {
      markAllAsRead(notifications);
      setNotifications([]);
    }
  };

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [invRes, summaryRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/inventory/summary').catch(() => ({ data: { success: false } })),
      ]);

      if (invRes.data.success) {
        const allItems = invRes.data.data;
        
        // Urgent items for main view
        const urgent = allItems
          .map(item => ({ ...item, daysLeft: calculateDaysLeft(item.reminder_at) }))
          .filter(item => item.condition === 'ripe')
          .sort((a, b) => a.daysLeft - b.daysLeft);
        setUrgentItems(urgent);
        setImpact(prev => ({ ...prev, saved: allItems.length }));

        // --- DYNAMIC NOTIFICATIONS GENERATION ---
        const readIds = getReadIds();
        const newNotifs = [];
        allItems.forEach(item => {
           const dLeft = calculateDaysLeft(item.reminder_at);
           // Only notify for items within 3 days (and not negative)
           if (dLeft === null || dLeft > 3 || dLeft < 0) return;
           
           const fruitName = getFruitLabel(item.fruit_type);
           let title = '';
           let body = '';
           
           if (dLeft === 3 || dLeft === 2) {
              title = `🥗 Jangan Lupa ${fruitName} Kamu!`;
              body = `Mengingatkan: ${fruitName} kamu tinggal ${dLeft} hari lagi sebelum mulai membusuk. Yuk, jadwalkan untuk dikonsumsi!`;
           } else if (dLeft === 1) {
              title = `⚠️ ${fruitName} Hampir Busuk!`;
              body = `Perhatian! ${fruitName} yang kamu simpan sisa 1 hari lagi. Segera konsumsi atau olah menjadi jus hari ini!`;
           } else if (dLeft === 0) {
              title = `🚨 HARI TERAKHIR untuk ${fruitName}!`;
              body = `${fruitName} kamu diperkirakan sudah mencapai batas maksimal kesegarannya HARI INI. Konsumsi sekarang sebelum terbuang sia-sia!`;
           }
           
           const addedDate = item.added_at || item.created_at;
           const dateStr = addedDate ? new Date(addedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
           
           if (title) {
               const notifId = `notif-${item.id}`;
               newNotifs.push({
                   id: notifId,
                   title,
                   message: body,
                   // Restore isRead from localStorage — survives page navigation!
                   isRead: readIds.has(notifId),
                   date: `Difoto pada: ${dateStr}`,
                   daysLeft: dLeft
               });
           }
        });
        
        newNotifs.sort((a, b) => a.daysLeft - b.daysLeft);
        setNotifications(newNotifs);

        // ── In-App false-safe push notification (fires once per session) ──
        const sessionKey = 'scanora_push_sent_session';
        const alreadySentThisSession = sessionStorage.getItem(sessionKey);
        if (!alreadySentThisSession && Notification.permission === 'granted') {
          sessionStorage.setItem(sessionKey, '1');
          const urgentToday = newNotifs.filter(n => n.daysLeft === 0 || n.daysLeft === 1);
          urgentToday.forEach((n, idx) => {
            setTimeout(() => {
              try {
                new Notification(n.title, {
                  body: n.message,
                  icon: '/icons/icon-192x192.png',
                  tag: n.id,
                });
              } catch (e) { /* Silent fail on unsupported browsers */ }
            }, idx * 1500); // Stagger each notification by 1.5s
          });
        }
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

  const { viewport } = useViewport();
  const isDesktop = viewport === 'desktop';
  const isTablet  = viewport === 'tablet';

  return (
    <div className={`${isDesktop ? 'p-8 pb-8' : 'p-6 pb-32'} bg-gray-50 dark:bg-gray-900 transition-colors min-h-screen`}>
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Halo, {firstName}!</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ayo selamatkan makanan hari ini.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenNotifications}
            className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all shadow-sm relative
              ${isDesktop ? 'gap-2 px-4 h-11 rounded-xl text-sm font-semibold' : 'w-12 h-12'}`}
          >
            <Bell size={isDesktop ? 18 : 24} />
            {isDesktop && <span>Notifikasi</span>}
            {notifications.some(n => !n.isRead) && (
              <div className={`absolute bg-red-500 rounded-full border-2 border-white dark:border-gray-800
                ${isDesktop ? 'top-2 right-2 w-2 h-2' : 'top-3 right-3 w-2.5 h-2.5'}`} />
            )}
          </button>
          {!isDesktop && (
            <button
              onClick={() => navigate('/profile')}
              className="w-12 h-12 bg-scanora-green/10 rounded-full flex items-center justify-center text-scanora-green hover:bg-scanora-green/20 active:scale-95 transition-all"
            >
              <User size={24} />
            </button>
          )}
        </div>
      </header>

      {/* Impact Section */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sprout className="text-scanora-green" size={20} />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Impact Kamu</h2>
        </div>
        <div className="bg-transparent">
          {isDesktop ? (
            // Desktop: 4-column horizontal cards
            <div className="grid grid-cols-4 gap-4">
              {/* Dikonsumsi */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Utensils size={22} className="text-green-700" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold leading-none text-green-700">{impact.consumed}</p>
                  <p className="text-green-700 text-xs font-medium mt-1">Dikonsumsi</p>
                </div>
              </div>
              {/* Dibuang */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trash2 size={22} className="text-red-700" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold leading-none text-red-700">{impact.discarded}</p>
                  <p className="text-red-700 text-xs font-medium mt-1">Dibuang</p>
                </div>
              </div>
              {/* Disimpan */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Salad size={22} className="text-orange-700" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold leading-none text-orange-700">{impact.saved}</p>
                  <p className="text-orange-700 text-xs font-medium mt-1">Disimpan</p>
                </div>
              </div>
              {/* Tingkat Keberhasilan */}
              {saveRate !== null ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col justify-center shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-500 text-xs font-semibold">Tingkat Keberhasilan</p>
                    <p className="text-scanora-green font-bold text-sm">{saveRate}%</p>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-scanora-green rounded-full transition-all duration-700" style={{ width: `${saveRate}%` }} />
                  </div>
                  <p className="text-gray-400 text-xs mt-2">{prideMsg}</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-center shadow-sm">
                  <p className="text-gray-500 text-sm">Mulai konsumsi atau buang buah untuk melihat statistikmu!</p>
                </div>
              )}
            </div>
          ) : (
            // Mobile / Tablet: 3-col grid + bar below
            <>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className={`bg-green-500/10 border border-green-500/20 backdrop-blur-md rounded-xl p-3 ${isTablet ? 'flex items-center gap-3' : 'text-center'}`}>
                  <div className={`w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 ${isTablet ? '' : 'mx-auto mb-1.5'}`}>
                    <Utensils size={16} className="text-green-700" />
                  </div>
                  <div className={isTablet ? 'flex flex-col text-left' : ''}>
                    <p className={`${isTablet ? 'text-xl' : 'text-2xl'} font-extrabold leading-none text-green-700`}>{impact.consumed}</p>
                    <p className={`text-green-700 text-[10px] font-medium ${isTablet ? 'mt-0.5' : 'mt-1'}`}>Dikonsumsi</p>
                  </div>
                </div>
                <div className={`bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-xl p-3 ${isTablet ? 'flex items-center gap-3' : 'text-center'}`}>
                  <div className={`w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 ${isTablet ? '' : 'mx-auto mb-1.5'}`}>
                    <Trash2 size={16} className="text-red-700" />
                  </div>
                  <div className={isTablet ? 'flex flex-col text-left' : ''}>
                    <p className={`${isTablet ? 'text-xl' : 'text-2xl'} font-extrabold leading-none text-red-700`}>{impact.discarded}</p>
                    <p className={`text-red-700 text-[10px] font-medium ${isTablet ? 'mt-0.5' : 'mt-1'}`}>Dibuang</p>
                  </div>
                </div>
                <div className={`bg-orange-500/10 border border-orange-500/20 backdrop-blur-md rounded-xl p-3 ${isTablet ? 'flex items-center gap-3' : 'text-center'}`}>
                  <div className={`w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 ${isTablet ? '' : 'mx-auto mb-1.5'}`}>
                    <Salad size={16} className="text-orange-700" />
                  </div>
                  <div className={isTablet ? 'flex flex-col text-left' : ''}>
                    <p className={`${isTablet ? 'text-xl' : 'text-2xl'} font-extrabold leading-none text-orange-700`}>{impact.saved}</p>
                    <p className={`text-orange-700 text-[10px] font-medium ${isTablet ? 'mt-0.5' : 'mt-1'}`}>Disimpan</p>
                  </div>
                </div>
              </div>
              {saveRate !== null ? (
                <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-gray-500 text-xs font-semibold">Tingkat Keberhasilan</p>
                    <p className="text-scanora-green font-bold text-sm">{saveRate}%</p>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-scanora-green rounded-full transition-all duration-700 ease-out" style={{ width: `${saveRate}%` }} />
                  </div>
                  <p className="text-gray-400 text-sm mt-2 text-center">{prideMsg}</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-xs">Mulai konsumsi atau buang buah dari inventori untuk melihat statistikmu!</p>
                </div>
              )}
            </>
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
          <div className={`space-y-3 ${isDesktop ? 'pb-2' : 'max-h-[340px] overflow-y-auto no-scrollbar pb-2 pr-1'}`}>
            {urgentItems.map(item => {
              const dotColor = item.daysLeft === 0
                ? 'bg-[#e02224]'
                : item.daysLeft <= 2
                ? 'bg-orange-500'
                : 'bg-scanora-green';
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.fruit_type} className="w-full h-full object-cover"
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
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      <span className="text-xs text-gray-500">{item.daysLeft === 0 ? 'Hari ini!' : `Sisa ${item.daysLeft} hari`}</span>
                    </div>
                    {isDesktop && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                        <CalendarPlus size={12} />
                        <span>Tgl. Foto: {item.added_at ? new Date(item.added_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}</span>
                      </div>
                    )}
                  </div>
                  <div className="w-16 flex-shrink-0">
                    <ScoreBadge score={item.freshness_score_latest ?? item.freshness_score_initial} className="py-1 text-[12px]" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm">Semua buah masih aman! 🌿</p>
          </div>
        )}
      </section>

      {/* ── Detail Modal ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all animate-slide-up" onClick={e => e.stopPropagation()}>
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
                className="absolute top-4 right-4 w-11 h-11 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all"
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
              <div className="flex flex-col gap-1.5 mb-5">
                <p className="text-gray-500 font-medium text-sm flex items-center gap-2">
                  <CalendarPlus size={16} />
                  Tanggal Foto: {formatDate(selectedItem.added_at || selectedItem.created_at)}
                </p>
                <p className="text-gray-500 font-medium text-sm flex items-center gap-2">
                  {selectedItem.condition === 'unripe' ? (
                    <CalendarCheck size={16} />
                  ) : (
                    <CalendarX size={16} />
                  )}
                  <span className="font-bold">
                    {selectedItem.condition === 'unripe' ? 'Matang saat:' : 'Batas layak:'} {formatShortDate(selectedItem.reminder_at)}
                  </span>
                </p>
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

              {/* AI Suggestion Box */}
              {selectedItem.scan_id && (
                <div className="mb-4">
                  {!aiSuggestion && !aiLoading && (
                    <button
                      onClick={() => handleGetAiSuggestion()}
                      className="w-full min-h-[44px] bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 font-semibold rounded-2xl flex items-center justify-center gap-2 text-sm active:scale-95 transition-all"
                    >
                      💡 Minta Saran AI
                    </button>
                  )}

                  {aiLoading && (
                    <div className="bg-green-50 rounded-2xl p-4 border border-green-100 flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      <p className="text-sm text-green-700 font-medium">Scanora sedang berpikir...</p>
                    </div>
                  )}

                  {aiSuggestion && !aiLoading && (
                    <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                      <h4 className="font-semibold text-green-800 text-sm flex items-center gap-1.5 mb-2">💡 Saran Chef Scanora</h4>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{aiSuggestion}</p>
                    </div>
                  )}

                  {aiError && !aiLoading && (
                    <div className="bg-red-50 rounded-2xl p-4 border border-red-100 flex items-center justify-between gap-2">
                      <p className="text-sm text-red-600">{aiError}</p>
                      <button onClick={() => handleGetAiSuggestion()} className="text-xs text-red-600 font-bold underline">Coba Lagi</button>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
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


      {/* Notifications — Desktop: mini dropdown, Mobile: half-page sheet */}
      {showNotifications && (
        isDesktop ? (
          <div className="fixed inset-0 z-50" onClick={() => setShowNotifications(false)}>
            <div
              className="absolute top-20 right-8 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slide-up"
              style={{ maxHeight: '480px' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Bell size={16} /> Notifikasi
                </h2>
                <div className="flex items-center gap-3">
                  {notifications.length > 0 && (
                    <button onClick={handleClearAll} className="text-xs font-semibold text-red-500 hover:text-red-600 min-h-[36px] px-3 rounded-lg hover:bg-red-50 transition-all">
                      Hapus Semua
                    </button>
                  )}
                  <button onClick={() => setShowNotifications(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 active:scale-95 transition-all">
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-3 space-y-1">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <Bell size={36} className="mb-3 opacity-20" />
                    <p className="text-sm">Belum ada notifikasi.</p>
                  </div>
                ) : notifications.map(notif => (
                  <NotificationItem key={notif.id} notif={notif} onDelete={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowNotifications(false)}>
            <div className="bg-gray-50 dark:bg-gray-900 w-full h-[85vh] rounded-t-3xl shadow-2xl flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-3xl shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell size={20} /> Inbox Notifikasi
                </h2>
                <div className="flex items-center gap-3">
                  {notifications.length > 0 && (
                    <button onClick={handleClearAll} className="text-xs font-semibold text-red-500 hover:text-red-600 active:scale-95 transition-all min-h-[44px] px-4 flex items-center justify-center rounded-lg hover:bg-red-50">
                      Hapus Semua
                    </button>
                  )}
                  <button onClick={() => setShowNotifications(false)} className="w-11 h-11 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 active:scale-95 transition-all">
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-12">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Bell size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-sm">Belum ada notifikasi.</p>
                  </div>
                ) : notifications.map(notif => (
                  <NotificationItem key={notif.id} notif={notif} onDelete={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
                ))}
              </div>
            </div>
          </div>
        )
      )}

    </div>
  );
};

export default Home;
