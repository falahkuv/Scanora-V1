import React, { useState, useEffect, useCallback, useRef } from 'react';
import { History, Salad, Apple, Banana, Citrus, SquareCheck, SquareX, ImageOff, Package, ArrowUp, ArrowDown, CalendarArrowUp, CalendarArrowDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import FruitDetailModal from '../components/FruitDetailModal';
import api from '../api';
import { useViewport } from '../context/ViewportContext';
import { getCachedSuggestion, saveSuggestionToCache } from '../lib/aiSuggestionCache';

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
  if (c === 'unripe') return 'bg-green-100 text-green-700';
  if (c === 'ripe') return 'bg-orange-main text-white';
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

  if (cond === 'rotten' || cond === 'discarded') {
    return { bg: 'bg-red-main', text: 'text-white', btnText: 'Tidak Layak', isExpired: true };
  }

  if (cond === 'unripe') {
    if (daysLeft === null) {
      return { bg: 'bg-red-main', text: 'text-white', btnText: 'Tidak Akan Matang', isExpired: true };
    }
    if (daysLeft <= 0) {
      return { bg: 'bg-scanora-green', text: 'text-white', btnText: 'Siap Matang', isExpired: false };
    }
    return { bg: 'bg-scanora-green', text: 'text-white', btnText: `Matang ${daysLeft} Hari Lagi`, isExpired: false };
  }

  // cond === 'ripe'
  if (daysLeft === null || daysLeft < 0) {
    return { bg: 'bg-red-main', text: 'text-white', btnText: 'Kedaluwarsa', isExpired: true };
  }

  if (daysLeft === 0) {
    return { bg: 'bg-red-main', text: 'text-white', btnText: `Hari ini!`, isExpired: false };
  }
  if (daysLeft === 1) {
    return { bg: 'bg-red-main', text: 'text-white', btnText: `Sisa 1 Hari Lagi`, isExpired: false };
  }
  if (daysLeft > 1) {
    return { bg: 'bg-orange-main', text: 'text-white', btnText: `Sisa ${daysLeft} Hari Lagi`, isExpired: false };
  }

  return { bg: 'bg-red-main', text: 'text-white', btnText: 'Tidak Layak', isExpired: true };
};

/** Short date: "11 Mei 2026" */
const formatShortDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const fullYear = d.getFullYear();
  return `${d.getDate()} ${months[d.getMonth()]} ${fullYear}`;
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

/** Percent badge for freshness score. */
const ScoreBadge = ({ score, className = "py-1 text-[11px]" }) => {
  const pct = Math.round(score ?? 0);
  const bg = pct >= 70 ? 'bg-green-500/15 dark:bg-green-500/20' : pct > 0 ? 'bg-orange-main/15 dark:bg-orange-500/20' : 'bg-red-500/15 dark:bg-red-500/20';
  const text = pct >= 70 ? 'text-green-700 dark:text-green-300' : pct > 0 ? 'text-orange-main dark:text-orange-300' : 'text-red-700 dark:text-red-300';
  return (
    <div className={`px-2 rounded w-full text-center font-bold flex items-center justify-center ${bg} ${text} ${className}`}>
      {pct}%
    </div>
  );
};

/** Render AI suggestion markdown: **bold**, *italic*, bullet lists */
const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // bullet
    const isBullet = /^[-*•]\s+/.test(line);
    const content = line.replace(/^[-*•]\s+/, '');
    // parse inline bold/italic
    const parseInline = (str) => {
      const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
      return parts.map((part, j) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={j}>{part.slice(2, -2)}</strong>;
        if (/^\*[^*]+\*$/.test(part)) return <em key={j}>{part.slice(1, -1)}</em>;
        return part;
      });
    };
    if (isBullet) {
      return (
        <div key={i} className="flex gap-2 mt-1">
          <span className="text-green-600 font-bold mt-0.5">•</span>
          <span>{parseInline(content)}</span>
        </div>
      );
    }
    if (!line.trim()) return <div key={i} className="mt-2" />;
    return <p key={i} className="mt-1">{parseInline(line)}</p>;
  });
};

// ─── Card Component ────────────────────────────────────────────────────────────

const InventoryCard = ({ item, onClick, isTablet }) => {
  const daysLeft = calculateDaysLeft(item.reminder_at);
  const countdown = getCountdownConfig((item.condition_latest || item.condition), daysLeft);

  if (isTablet) {
    // Tablet: horizontal card — photo left, info right
    return (
      <div
        onClick={onClick}
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all flex flex-row relative overflow-hidden ${countdown.isExpired ? 'opacity-60 brightness-[0.95] dark:brightness-100' : ''}`}
        style={{ minHeight: '130px' }}
      >
        {/* Left: photo */}
        <div className={`relative bg-gray-100 flex-shrink-0 w-[130px]`}>
          {/* Condition Badge */}
          <span className={`absolute top-2 left-2 px-2 py-1 z-20 rounded-md text-sm font-bold shadow-sm leading-none capitalize ${getConditionBadgeStyle((item.condition_latest || item.condition))}`}>
            {getConditionLabel((item.condition_latest || item.condition))}
          </span>
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.fruit_type}
              className="absolute inset-0 w-full h-full object-cover z-0"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div
            className="absolute inset-0 w-full h-full z-0 bg-gray-100 flex items-center justify-center flex-col gap-1"
            style={{ display: item.image_url ? 'none' : 'flex' }}
          >
            <ImageOff size={32} className="text-gray-400" strokeWidth={1.5} />
          </div>
        </div>

        {/* Right: info */}
        <div className="flex-1 px-4 py-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-fruit-name-sm font-bold text-gray-900 dark:text-white capitalize">
                {getFruitLabel(item.fruit_type)}
              </h3>
              <span className="text-xs font-bold text-gray-500 bg-white/80 px-2 py-0.5 rounded-md">
                {formatCapturedDate(item.added_at)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {(item.condition_latest || item.condition) === 'unripe' ? (
                <SquareCheck size={13} className="text-gray-400" />
              ) : (
                <SquareX size={13} className="text-gray-400" />
              )}
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                {(item.condition_latest || item.condition) === 'unripe' ? 'Matang: ' : 'Busuk: '}
                {item.reminder_at ? formatShortDate(item.reminder_at) : '-'}
              </span>
            </div>
          </div>
          {/* Countdown + score */}
          <div className="flex gap-2 mt-2">
            <div className="flex-1">
              <div className={`w-full flex items-center justify-center rounded-md py-2 text-base font-bold whitespace-nowrap overflow-hidden ${countdown.bg} ${countdown.text}`}>
                <span className="truncate px-1">{countdown.btnText}</span>
              </div>
            </div>
            <div className="w-16">
              <ScoreBadge score={item.freshness_score_latest ?? item.freshness_score_initial} className="h-full py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Mascot */}
        <img
          src={getMascotSrc(item.fruit_type, (item.condition_latest || item.condition))}
          alt=""
          className="absolute bottom-0 right-[150px] h-16 object-contain drop-shadow-md z-20 pointer-events-none"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
    );
  }

  // Default: vertical card
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all flex flex-col relative ${countdown.isExpired ? 'opacity-60 bg-gray-100 dark:bg-gray-800/80 brightness-[0.95] dark:brightness-100' : ''}`}
    >
      <div className="relative">
        {/* ── Top half: image area ── */}
        <div className={`relative bg-gray-100 flex-shrink-0 rounded-xl overflow-hidden aspect-square`}>
          {/* Condition Badge — min 14px */}
          <span className={`absolute top-2 left-2 px-2 py-1 z-20 rounded-md text-[14px] font-bold shadow-sm leading-none capitalize ${getConditionBadgeStyle((item.condition_latest || item.condition))}`}>
            {getConditionLabel((item.condition_latest || item.condition))}
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

        {/* Mascot (bottom-right outside overflow-hidden) — uses mascot-card-offset for -5vh */}
        <img
          src={getMascotSrc(item.fruit_type, (item.condition_latest || item.condition))}
          alt=""
          className="mascot-card-offset absolute right-1 h-16 object-contain drop-shadow-md z-20"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* ── Bottom half: info ── */}
      <div className="px-2 pt-1 pb-1 flex flex-col gap-1.5 flex-1 mt-1">
        {/* Fruit name — text-fruit-name semantic class */}
        <h3 className="text-fruit-name font-bold text-gray-900 dark:text-white leading-tight capitalize">
          {getFruitLabel(item.fruit_type)}
        </h3>

        {/* Date — min 14px */}
        <div className="flex items-center gap-1.5 mt-1">
          {(item.condition_latest || item.condition) === 'unripe' ? (
            <SquareCheck size={14} className="text-gray-400" />
          ) : (
            <SquareX size={14} className="text-gray-400" />
          )}
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {(item.condition_latest || item.condition) === 'unripe' ? 'Matang: ' : 'Busuk: '}
            {item.reminder_at ? formatShortDate(item.reminder_at) : '-'}
          </span>
        </div>

        {/* Countdown (16px) & Freshness Score (14px) Row */}
        <div className="flex gap-2 mt-1">
          <div className="w-[80%]">
            <div className={`w-full h-full flex items-center justify-center rounded-md py-1.5 text-base font-bold whitespace-nowrap overflow-hidden ${countdown.bg} ${countdown.text}`}>
              <span className="truncate px-1">{countdown.btnText}</span>
            </div>
          </div>
          <div className="w-[20%]">
            <ScoreBadge score={item.freshness_score_latest ?? item.freshness_score_initial} className="h-full py-1.5 text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const Inventory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    () => location.state?.tab === 'history' ? 'history' : 'inventory'
  );

  // Sync tab when SideNav navigates here with { tab: 'history' } state
  useEffect(() => {
    if (location.state?.tab === 'history') {
      setActiveTab('history');
    } else if (location.state?.tab === 'inventory') {
      setActiveTab('inventory');
    }
  }, [location.state]);
  const [inventoryData, setInventoryData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const { viewport, compactWidth, windowWidth } = useViewport();
  const isDesktop = viewport === 'desktop';
  const isTablet = viewport === 'tablet';
  // Effective rendered width for layout decisions
  const effectiveWidth = compactWidth ?? windowWidth;

  const [conditionFilter, setConditionFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [showSortPopup, setShowSortPopup] = useState(false);

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

  const handleSortSelect = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({ key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
    setShowSortPopup(false);
  };

  const sortedInventory = [...inventoryData].sort((a, b) => {
    if (sortConfig.key === 'priority') {
      const scoreA = a.freshness_score_latest ?? a.freshness_score_initial ?? 0;
      const scoreB = b.freshness_score_latest ?? b.freshness_score_initial ?? 0;
      return sortConfig.direction === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    } else {
      const dateA = new Date(a.added_at || a.created_at || 0).getTime();
      const dateB = new Date(b.added_at || b.created_at || 0).getTime();
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
  });

  const sortedHistory = [...historyData].sort((a, b) => {
    if (sortConfig.key === 'priority') {
      const scoreA = a.freshness_score_latest ?? a.freshness_score_initial ?? 0;
      const scoreB = b.freshness_score_latest ?? b.freshness_score_initial ?? 0;
      return sortConfig.direction === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    } else {
      const dateA = new Date(a.scanned_at || a.created_at || 0).getTime();
      const dateB = new Date(b.scanned_at || b.created_at || 0).getTime();
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
  });

  const getSortIcon = () => {
    if (sortConfig.key === 'priority') return sortConfig.direction === 'asc' ? <ArrowUp size={20} /> : <ArrowDown size={20} />;
    return sortConfig.direction === 'asc' ? <CalendarArrowUp size={20} /> : <CalendarArrowDown size={20} />;
  };

  // Reset and auto-load AI suggestion state when selected item changes
  useEffect(() => {
    if (!selectedItem?.scan_id) {
      setAiSuggestion(null);
      setAiError(null);
      setAiLoading(false);
      return;
    }

    const currentScore = selectedItem.freshness_score_latest ?? selectedItem.freshness_score_initial;
    const condition = (selectedItem.condition_latest || selectedItem.condition);
    const daysLeft = calculateDaysLeft(selectedItem.reminder_at);

    const { suggestion, tierChanged } = getCachedSuggestion(selectedItem.scan_id, currentScore, condition, daysLeft);

    if (suggestion) {
      setAiSuggestion(suggestion);
      setAiError(null);
      setAiLoading(false);

      // Background auto-refresh if tier changed
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
      const condition = (selectedItem.condition_latest || selectedItem.condition);
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
        setShowSortPopup(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-32 no-scrollbar transition-colors">
      {/* Sticky Header */}
      <div className="bg-white dark:bg-gray-800 px-4 pt-6 pb-4 shadow-sm z-40 sticky top-0 border-b border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex relative gap-2">
          <div className="bg-gray-100 dark:bg-gray-900 p-1 rounded-xl flex flex-1 relative overflow-hidden transition-colors">
            <div
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] bg-white dark:bg-gray-700 rounded-lg shadow-sm transition-transform duration-300 ease-out pointer-events-none ${
                activeTab === 'inventory' ? 'translate-x-0' : 'translate-x-full'
              }`}
            />
            <button
              onClick={() => { setActiveTab('inventory'); navigate('/inventory', { state: { tab: 'inventory' }, replace: true }); setShowSortPopup(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all active:scale-95 min-h-[44px] relative z-10 ${activeTab === 'inventory' ? 'text-scanora-dark dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <Salad size={16} /> Inventori
            </button>
            <button
              onClick={() => { setActiveTab('history'); navigate('/inventory', { state: { tab: 'history' }, replace: true }); setShowSortPopup(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all active:scale-95 min-h-[44px] relative z-10 ${activeTab === 'history' ? 'text-scanora-dark dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <History size={16} /> Riwayat
            </button>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 p-1 rounded-xl flex transition-colors">
            <button
              onClick={() => setShowSortPopup(!showSortPopup)}
              className="h-[44px] flex items-center justify-between gap-2 px-3 rounded-lg active:scale-95 transition-all bg-white dark:bg-gray-800 text-scanora-green text-sm font-semibold whitespace-nowrap min-w-[44px]"
            >
              {effectiveWidth > 500 && (
                <span className="text-left flex-1">
                  {sortConfig.key === 'priority' ? 'Freshness Score' : 'Tanggal Foto'}
                </span>
              )}
              {getSortIcon()}
            </button>
          </div>

          {showSortPopup && !showFloating && (
            <>
              <div className="fixed inset-0 z-[199]" onClick={() => setShowSortPopup(false)} />
              <div className="absolute top-[60px] right-0 bg-white dark:bg-gray-800 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-gray-700 p-2 min-w-[200px] flex flex-col gap-1 z-[200]">
                <button onClick={() => handleSortSelect('priority')} className={`text-left px-3 py-2.5 text-sm rounded-lg flex justify-between items-center min-h-[44px] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`}>
                  <span>Freshness Score</span>
                  {sortConfig.key === 'priority' && sortConfig.direction === 'asc' ? <ArrowDown size={14} /> : <ArrowUp size={14} className={sortConfig.key === 'priority' ? '' : 'text-gray-400'} />}
                </button>
                <button onClick={() => handleSortSelect('date')} className={`text-left px-3 py-2.5 text-sm rounded-lg flex justify-between items-center min-h-[44px] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`}>
                  <span>Tanggal Foto</span>
                  {sortConfig.key === 'date' && sortConfig.direction === 'asc' ? <CalendarArrowDown size={14} /> : <CalendarArrowUp size={14} className={sortConfig.key === 'date' ? '' : 'text-gray-400'} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Category Filter Pills (Inventori tab only) ── */}
      {activeTab === 'inventory' && (
        <div className="px-4 pt-3 pb-1 flex gap-2 overflow-x-clip no-scrollbar">
          {[
            { key: 'all', label: 'Semua', count: inventoryData.length, active: 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white', inactive: 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-transparent' },
            { key: 'ripe', label: 'Ripe', count: inventoryData.filter(i => (i.condition_latest || i.condition) === 'ripe').length, active: 'bg-orange-main text-white border border-transparent', inactive: 'border border-orange-main/30 text-orange-main bg-transparent' },
            { key: 'unripe', label: 'Unripe', count: inventoryData.filter(i => (i.condition_latest || i.condition) === 'unripe').length, active: 'bg-scanora-green text-white border border-transparent', inactive: 'border border-green-200 text-green-600 bg-transparent' },
            { key: 'rotten', label: 'Rotten', count: inventoryData.filter(i => (i.condition_latest || i.condition) === 'rotten').length, active: 'bg-red-main text-white border border-transparent', inactive: 'border border-red-200 text-red-600 bg-transparent' },
          ].map(pill => (
            <button
              key={pill.key}
              onClick={() => setConditionFilter(pill.key)}
              className={`flex items-center gap-1.5 px-6 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all active:scale-95 min-h-[44px] cursor-pointer
                ${conditionFilter === pill.key ? pill.active : pill.inactive}`}
            >
              {pill.label}
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center justify-center leading-none min-w-[1.5rem]
                ${conditionFilter === pill.key
                  ? (pill.key === 'all' ? 'bg-white/20 dark:bg-black/20 text-white dark:text-gray-900' : 'bg-white/20 text-white')
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                {pill.count}
              </span>
            </button>
          ))}
        </div>
      )}

      <div ref={observerTarget} className="h-1 w-full" />

      {/* Floating Tab Switcher */}
      <div className={`fixed left-0 right-0 z-30 flex justify-center transition-all duration-300 ease-out ${isDesktop ? 'pl-64' : ''} ${showFloating ? 'bottom-32 translate-y-0 opacity-100 pointer-events-auto' : 'bottom-28 translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="flex gap-4 relative">
          <div className="bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-md p-1.5 rounded-full flex shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-gray-200 dark:border-gray-700 relative overflow-hidden transition-colors">
            <div
              className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-0.375rem)] bg-white dark:bg-gray-600 rounded-full shadow-sm transition-transform duration-300 ease-out pointer-events-none ${
                activeTab === 'inventory' ? 'translate-x-0' : 'translate-x-full'
              }`}
            />
            <button onClick={() => { setActiveTab('inventory'); navigate('/inventory', { state: { tab: 'inventory' }, replace: true }); setShowSortPopup(false); }} className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full min-h-[44px] transition-all active:scale-95 relative z-10 ${activeTab === 'inventory' ? 'text-scanora-dark dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
              <Salad size={16} /> <span className="hidden sm:inline">Inventori</span>
            </button>
            <button onClick={() => { setActiveTab('history'); navigate('/inventory', { state: { tab: 'history' }, replace: true }); setShowSortPopup(false); }} className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full min-h-[44px] transition-all active:scale-95 relative z-10 ${activeTab === 'history' ? 'text-scanora-dark dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
              <History size={16} /> <span className="hidden sm:inline">Riwayat</span>
            </button>
          </div>
          <div className="bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-md p-1.5 rounded-full flex border border-gray-200 dark:border-gray-700 transition-colors">
            <button
              onClick={() => setShowSortPopup(!showSortPopup)}
              className="h-[44px] flex items-center justify-between gap-2 px-4 rounded-full active:scale-95 transition-all bg-white dark:bg-gray-700 text-scanora-green text-sm font-semibold min-w-[44px] md:min-w-[170px]"
            >
              <span className="hidden md:inline text-left flex-1">
                {sortConfig.key === 'priority' ? 'Freshness Score' : 'Tanggal Foto'}
              </span>
              {getSortIcon()}
            </button>
          </div>

          {showSortPopup && showFloating && (
            <>
              <div className="fixed inset-0 z-[199]" onClick={() => setShowSortPopup(false)} />
              <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-gray-700 p-2 min-w-[200px] flex flex-col gap-1 z-[200]">
                <button onClick={() => handleSortSelect('priority')} className={`text-left px-3 py-2.5 text-sm rounded-lg flex justify-between items-center min-h-[44px] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`}>
                  <span>Freshness Score</span>
                  {sortConfig.key === 'priority' && sortConfig.direction === 'asc' ? <ArrowDown size={14} /> : <ArrowUp size={14} className={sortConfig.key === 'priority' ? '' : 'text-gray-400'} />}
                </button>
                <button onClick={() => handleSortSelect('date')} className={`text-left px-3 py-2.5 text-sm rounded-lg flex justify-between items-center min-h-[44px] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`}>
                  <span>Tanggal Foto</span>
                  {sortConfig.key === 'date' && sortConfig.direction === 'asc' ? <CalendarArrowDown size={14} /> : <CalendarArrowUp size={14} className={sortConfig.key === 'date' ? '' : 'text-gray-400'} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {loading ? (() => {
          const skeletonCols = effectiveWidth >= 1100 ? 4 : effectiveWidth >= 780 ? 3 : effectiveWidth >= 500 ? 2 : 1;
          const gridClass = skeletonCols === 4 ? 'grid-cols-4' : skeletonCols === 3 ? 'grid-cols-3' : skeletonCols === 2 ? 'grid-cols-2' : 'grid-cols-1';
          return activeTab === 'inventory' ? (
            <div className={`grid ${gridClass} gap-4`}>
              {[...Array(skeletonCols * 2)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 animate-pulse" />
                  <div className="p-2 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-7 w-full bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex-shrink-0 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="w-16 h-6 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          );
        })() : activeTab === 'inventory' ? (() => {
          const filteredInventory = conditionFilter === 'all'
            ? sortedInventory
            : sortedInventory.filter(i => (i.condition_latest || i.condition) === conditionFilter);

          return filteredInventory.length > 0 ? (
            <div className={`grid gap-4 ${effectiveWidth >= 1100 ? 'grid-cols-4'
                : effectiveWidth >= 780 ? 'grid-cols-3'
                  : effectiveWidth >= 500 ? 'grid-cols-2'
                    : 'grid-cols-1'
              }`}>
              {filteredInventory.map(item => (
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
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                {conditionFilter === 'all' ? 'Inventori kamu masih kosong' : `Buah status ${conditionFilter} tidak ditemukan`}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[260px]">
                {conditionFilter === 'all' ? 'Kalau kamu simpan ke Inventori maka aplikasi akan bisa memberi kamu notifikasi pengingat.' : 'Coba ganti filter atau scan buah baru.'}
              </p>
            </div>
          );
        })() : (
          sortedHistory.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(
                sortedHistory.reduce((acc, item) => {
                  const d = new Date(item.scanned_at);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const itemDate = new Date(d);
                  itemDate.setHours(0, 0, 0, 0);

                  const diffTime = today.getTime() - itemDate.getTime();
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                  let key;
                  if (diffDays === 0) key = 'Hari Ini';
                  else if (diffDays === 1) key = 'Kemarin';
                  else if (diffDays <= 7) key = '7 Hari Terakhir';
                  else key = d.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

                  if (!acc[key]) acc[key] = [];
                  acc[key].push(item);
                  return acc;
                }, {})
              ).map(([groupTitle, items]) => (
                <div key={groupTitle}>
                  {/* Capitalize, not uppercase */}
                  <h3 className="text-sm font-medium text-gray-400 tracking-wider mb-3 px-1">{groupTitle}</h3>
                  <div className="space-y-3">
                    {items.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all"
                      >
                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.fruit_type}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                          ) : null}
                          <div className="w-full h-full items-center justify-center" style={{ display: item.image_url ? 'none' : 'flex' }}>
                            <ImageOff size={20} className="text-gray-300" strokeWidth={1.5} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{getFruitLabel(item.fruit_type)}</h3>
                          <p className="text-xs text-gray-400">{formatDate(item.scanned_at)}</p>
                        </div>
                        <span className={`text-xs font-semibold px-0 py-1 rounded-md capitalize flex-shrink-0 text-center min-w-[72px] ${getConditionBadgeStyle((item.condition_latest || item.condition))}`}>
                          {getConditionLabel((item.condition_latest || item.condition))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
              <History size={48} className="text-gray-300 mb-6" strokeWidth={1.5} />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Belum ada riwayat scan</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[260px]">
                Setiap hasil scan buah yang dilakukan akan tersimpan ke sini.
              </p>
            </div>
          )
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedItem && (
        <FruitDetailModal
          item={selectedItem}
          activeTab={activeTab}
          onClose={() => setSelectedItem(null)}
          onConsumed={async () => {
            try {
              await api.delete(`/inventory/${selectedItem.id}`, { data: { outcome: 'consumed' } });
              setInventoryData(prev => prev.filter(i => i.id !== selectedItem.id));
              setSelectedItem(null);
            } catch (err) { console.error(err); }
          }}
          onDiscarded={async () => {
            try {
              await api.delete(`/inventory/${selectedItem.id}`, { data: { outcome: 'discarded' } });
              setInventoryData(prev => prev.filter(i => i.id !== selectedItem.id));
              setSelectedItem(null);
            } catch (err) { console.error(err); }
          }}
          onDeleteHistory={() => handleDeleteHistory(selectedItem)}
          aiSuggestion={aiSuggestion}
          aiLoading={aiLoading}
          aiError={aiError}
          onRequestAI={handleGetAiSuggestion}
        />
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
