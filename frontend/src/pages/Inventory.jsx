import React, { useState, useEffect, useCallback, useRef } from 'react';
import { History, Salad, X, Trash2, Apple, Banana, Citrus, ChevronRight, SquareCheck, SquareX, ImageOff, Utensils, Package, Refrigerator, ArrowUp, ArrowDown, CalendarArrowUp, CalendarArrowDown, Camera, Sparkles, Bot } from 'lucide-react';
import { useLocation } from 'react-router-dom';
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
  if (c === 'ripe') return 'bg-orange-main/15 text-orange-main';
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
  const bg = pct >= 70 ? 'bg-green-100' : pct > 0 ? 'bg-orange-main/15' : 'bg-red-100';
  const text = pct >= 70 ? 'text-green-700' : pct > 0 ? 'text-orange-main' : 'text-red-700';
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
        className={`bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all flex flex-row relative overflow-hidden ${countdown.isExpired ? 'opacity-60 brightness-[0.95]' : ''}`}
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
              <h3 className="text-fruit-name-sm font-bold text-gray-900 capitalize">
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
              <span className="text-sm font-semibold text-gray-500">
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
      className={`bg-white p-2 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all flex flex-col relative ${countdown.isExpired ? 'opacity-60 bg-gray-100 brightness-[0.95]' : ''}`}
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
        <h3 className="text-fruit-name font-bold text-gray-900 leading-tight capitalize">
          {getFruitLabel(item.fruit_type)}
        </h3>

        {/* Date — min 14px */}
        <div className="flex items-center gap-1.5 mt-1">
          {(item.condition_latest || item.condition) === 'unripe' ? (
            <SquareCheck size={14} className="text-gray-400" />
          ) : (
            <SquareX size={14} className="text-gray-400" />
          )}
          <span className="text-sm font-semibold text-gray-500">
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

  // Detail modal sticky header visibility
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const fruitNameRef = useRef(null);
  const scrollContainerRef = useRef(null);

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
    // Reset sticky header on new item
    setShowStickyHeader(false);
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

  // Handle scroll to show/hide sticky header in detail modal
  const handleDetailScroll = (e) => {
    if (!fruitNameRef.current) return;
    const scrollTop = e.target.scrollTop;
    // Show sticky header after scrolling past ~60px
    setShowStickyHeader(scrollTop > 60);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-32 no-scrollbar">
      {/* Sticky Header */}
      <div className="bg-white px-4 pt-6 pb-4 shadow-sm z-40 sticky top-0 border-b border-gray-100">
        <div className="flex relative gap-2">
          <div className="bg-gray-100 p-1 rounded-xl flex flex-1 relative overflow-hidden">
            <div
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-out pointer-events-none ${
                activeTab === 'inventory' ? 'translate-x-0' : 'translate-x-full'
              }`}
            />
            <button
              onClick={() => { setActiveTab('inventory'); setShowSortPopup(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all active:scale-95 min-h-[44px] relative z-10 ${activeTab === 'inventory' ? 'text-scanora-dark' : 'text-gray-500'}`}
            >
              <Salad size={16} /> Inventori
            </button>
            <button
              onClick={() => { setActiveTab('history'); setShowSortPopup(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all active:scale-95 min-h-[44px] relative z-10 ${activeTab === 'history' ? 'text-scanora-dark' : 'text-gray-500'}`}
            >
              <History size={16} /> Riwayat
            </button>
          </div>
          <div className="bg-gray-100 p-1 rounded-xl flex">
            <button
              onClick={() => setShowSortPopup(!showSortPopup)}
              className="h-[44px] flex items-center justify-between gap-2 px-3 rounded-lg active:scale-95 transition-all bg-white text-scanora-green text-sm font-semibold whitespace-nowrap min-w-[44px]"
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
              <div className="absolute top-[60px] right-0 bg-white rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-gray-100 p-2 min-w-[200px] flex flex-col gap-1 z-[200]">
                <button onClick={() => handleSortSelect('priority')} className={`text-left px-3 py-2.5 text-sm rounded-lg flex justify-between items-center min-h-[44px] text-gray-600 hover:bg-gray-50`}>
                  <span>Freshness Score</span>
                  {sortConfig.key === 'priority' && sortConfig.direction === 'asc' ? <ArrowDown size={14} /> : <ArrowUp size={14} className={sortConfig.key === 'priority' ? '' : 'text-gray-400'} />}
                </button>
                <button onClick={() => handleSortSelect('date')} className={`text-left px-3 py-2.5 text-sm rounded-lg flex justify-between items-center min-h-[44px] text-gray-600 hover:bg-gray-50`}>
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
            { key: 'all', label: 'Semua', count: inventoryData.length, active: 'bg-gray-100 text-gray-600 border border-transparent', inactive: 'border border-gray-200 text-gray-600 bg-transparent' },
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
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                ${conditionFilter === pill.key
                  ? (pill.key === 'all' ? 'bg-gray-200 text-gray-600' : 'bg-white/20 text-white')
                  : 'bg-gray-100 text-gray-500'}`}>
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
          <div className="bg-gray-100/90 backdrop-blur-md p-1.5 rounded-full flex shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-gray-200 relative overflow-hidden">
            <div
              className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-0.375rem)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-out pointer-events-none ${
                activeTab === 'inventory' ? 'translate-x-0' : 'translate-x-full'
              }`}
            />
            <button onClick={() => { setActiveTab('inventory'); setShowSortPopup(false); }} className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full min-h-[44px] transition-all active:scale-95 relative z-10 ${activeTab === 'inventory' ? 'text-scanora-dark' : 'text-gray-500 hover:text-gray-900'}`}>
              <Salad size={16} /> <span className="hidden sm:inline">Inventori</span>
            </button>
            <button onClick={() => { setActiveTab('history'); setShowSortPopup(false); }} className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full min-h-[44px] transition-all active:scale-95 relative z-10 ${activeTab === 'history' ? 'text-scanora-dark' : 'text-gray-500 hover:text-gray-900'}`}>
              <History size={16} /> <span className="hidden sm:inline">Riwayat</span>
            </button>
          </div>
          <div className="bg-gray-100/90 backdrop-blur-md p-1.5 rounded-full flex border border-gray-200">
            <button
              onClick={() => setShowSortPopup(!showSortPopup)}
              className="h-[44px] flex items-center justify-between gap-2 px-4 rounded-full active:scale-95 transition-all bg-white text-scanora-green text-sm font-semibold min-w-[44px] md:min-w-[170px]"
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
              <div className="absolute bottom-16 right-0 bg-white rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-gray-100 p-2 min-w-[200px] flex flex-col gap-1 z-[200]">
                <button onClick={() => handleSortSelect('priority')} className={`text-left px-3 py-2.5 text-sm rounded-lg flex justify-between items-center min-h-[44px] text-gray-600 hover:bg-gray-50`}>
                  <span>Freshness Score</span>
                  {sortConfig.key === 'priority' && sortConfig.direction === 'asc' ? <ArrowDown size={14} /> : <ArrowUp size={14} className={sortConfig.key === 'priority' ? '' : 'text-gray-400'} />}
                </button>
                <button onClick={() => handleSortSelect('date')} className={`text-left px-3 py-2.5 text-sm rounded-lg flex justify-between items-center min-h-[44px] text-gray-600 hover:bg-gray-50`}>
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
        {loading ? (
          activeTab === 'inventory' ? (
            // Skeleton — Inventory grid
            <div className="grid grid-cols-2 gap-4">
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
        ) : activeTab === 'inventory' ? (() => {
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
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {conditionFilter === 'all' ? 'Inventori kamu masih kosong' : `Buah status ${conditionFilter} tidak ditemukan`}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[260px]">
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
                        className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all"
                      >
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
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
                          <h3 className="font-semibold text-gray-900 capitalize">{getFruitLabel(item.fruit_type)}</h3>
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
              <h3 className="text-lg font-bold text-gray-800 mb-2">Belum ada riwayat scan</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[260px]">
                Setiap hasil scan buah yang dilakukan akan tersimpan ke sini.
              </p>
            </div>
          )
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedItem(null)}>
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl transform transition-all animate-slide-up flex flex-col overflow-hidden relative"
            style={{ maxHeight: '90dvh' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 w-11 h-11 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all cursor-pointer z-40"
            >
              <X size={18} />
            </button>

            {/* ── Sticky fruit header ── */}
            <div
              className={`absolute top-0 left-0 right-0 z-30 flex items-center gap-2 px-5 py-5 bg-white border-b border-gray-100 transition-all duration-300 ${showStickyHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}
            >
              <span className="text-[18px] font-bold text-gray-900 capitalize leading-none">
                {getFruitLabel(selectedItem.fruit_type)}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md capitalize ${getConditionBadgeStyle(selectedItem.condition_latest || selectedItem.condition)}`}>
                {getConditionLabel(selectedItem.condition_latest || selectedItem.condition)}
              </span>
            </div>

            {/* Scrollable content */}
            <div
              className="overflow-y-auto flex-1 no-scrollbar"
              ref={scrollContainerRef}
              onScroll={handleDetailScroll}
            >
              {/* Image banner — scrolls away */}
              <div className="relative aspect-video bg-gradient-to-b from-sky-200 to-green-200 flex items-center justify-center overflow-hidden flex-shrink-0 z-20">
                {selectedItem.image_url ? (
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.fruit_type}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div
                  className="w-full h-full items-center justify-center flex-col gap-2 bg-gradient-to-b from-sky-200 to-green-200"
                  style={{ display: selectedItem.image_url ? 'none' : 'flex' }}
                >
                  <img
                    src={getMascotSrc(selectedItem.fruit_type, selectedItem.condition_latest || selectedItem.condition)}
                    alt=""
                    className="h-24 object-contain drop-shadow-lg"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>

              <div className="p-5 pb-2">
                {/* Name + badge + Mascot — 1 row */}
                <div ref={fruitNameRef} className="flex items-center justify-between mb-4 mt-2">
                  <div className="flex flex-row items-center gap-2">
                    <h2 className="text-3xl font-bold text-gray-900 capitalize leading-none">
                      {getFruitLabel(selectedItem.fruit_type)}
                    </h2>
                    <span className={`text-sm font-bold px-2 py-1 rounded-md capitalize leading-none ${getConditionBadgeStyle(selectedItem.condition_latest || selectedItem.condition)}`}>
                      {getConditionLabel(selectedItem.condition_latest || selectedItem.condition)}
                    </span>
                  </div>
                  <div className="relative w-20">
                    <img
                      src={getMascotSrc(selectedItem.fruit_type, selectedItem.condition_latest || selectedItem.condition)}
                      alt=""
                      className="absolute bottom-0 right-0 h-32 object-contain drop-shadow-md pointer-events-none"
                      style={{ transform: 'translateY(64px)' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                </div>

                {/* Detail Scan label — not bold */}
                <p className="text-xs font-normal text-gray-400 text-center mb-2">Detail Scan:</p>

                {activeTab === 'inventory' ? (
                  <>
                    {/* Date + score card */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-3">
                      <div className="flex flex-col gap-3 mb-4">
                        <p className="text-gray-500 font-medium text-sm flex items-center gap-2">
                          <Camera size={16} />
                          <span>Tgl. Foto: {formatShortDate(selectedItem.added_at || selectedItem.created_at)}</span>
                        </p>
                        <p className="text-gray-500 font-medium text-sm flex items-center gap-2">
                          {(selectedItem.condition_latest || selectedItem.condition) === 'unripe' ? (
                            <SquareCheck size={16} />
                          ) : (
                            <SquareX size={16} />
                          )}
                          <span>
                            {(selectedItem.condition_latest || selectedItem.condition) === 'unripe' ? 'Tgl. Matang:' : 'Tgl. Batas Layak:'}{' '}
                            {formatShortDate(selectedItem.reminder_at)}
                          </span>
                        </p>
                      </div>
                      <hr className="border-gray-200 mb-4" />
                      {/* Freshness score row — animated chevrons */}
                      <div className="flex items-center gap-3 mb-4">
                        <p className="text-sm text-gray-500 font-medium whitespace-nowrap">Update Freshness Score:</p>
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <div className="flex-1">
                            <ScoreBadge score={selectedItem.freshness_score_initial} className="py-2 text-sm" />
                          </div>
                          <div className="flex -space-x-2 flex-shrink-0 animate-pulse">
                            <ChevronRight size={18} className="text-gray-400" />
                            <ChevronRight size={18} className="text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <ScoreBadge score={selectedItem.freshness_score_latest ?? selectedItem.freshness_score_initial} className="py-2 text-sm" />
                          </div>
                        </div>
                      </div>
                      {(() => {
                        const daysLeft = calculateDaysLeft(selectedItem.reminder_at);
                        const countdown = getCountdownConfig((selectedItem.condition_latest || selectedItem.condition), daysLeft);
                        return (
                          <div className={`px-4 py-3 rounded-xl text-center text-base font-bold w-full ${countdown.bg} ${countdown.text}`}>
                            {countdown.btnText}
                          </div>
                        );
                      })()}
                    </div>
                  </>
                ) : (
                  /* History tab: compact date + score in one row */
                  <div className="mb-4">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium flex-1">
                          <Camera size={16} />
                          <span>Tgl. Foto: {formatShortDate(selectedItem.scanned_at)}</span>
                        </div>
                        <div className="min-w-[80px]">
                          <ScoreBadge score={selectedItem.freshness_score} className="py-1.5 text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Suggestion Box */}
                {selectedItem.scan_id && activeTab === 'inventory' && (
                  <div className="mb-4 mt-2">
                    {!aiSuggestion && !aiLoading && (
                      <button
                        onClick={handleGetAiSuggestion}
                        className="w-full min-h-[44px] bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 font-semibold rounded-2xl flex items-center justify-center gap-2 text-sm active:scale-95 transition-all cursor-pointer overflow-hidden relative"
                      >
                        <Sparkles size={16} className="text-green-600" />
                        Minta Saran AI
                      </button>
                    )}

                    {aiLoading && (
                      <div className="w-full min-h-[44px] bg-green-50 border border-green-200 rounded-2xl flex flex-col items-center justify-center gap-2 px-4 py-3 overflow-hidden relative">
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          <p className="text-sm text-green-700 font-medium animate-pulse">Scanora sedang berpikir...</p>
                        </div>
                        <div className="w-full h-1 bg-green-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-400 rounded-full animate-[indeterminate_1.5s_ease-in-out_infinite]" style={{ width: '40%', animation: 'indeterminate 1.5s ease-in-out infinite' }} />
                        </div>
                        <div className="animate-pulse flex flex-col gap-2 mt-2 w-full">
                          <div className="h-3 bg-green-200/60 rounded-full w-full" />
                        </div>
                      </div>
                    )}

                    {aiSuggestion && !aiLoading && (
                      <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                        <h4 className="font-semibold text-green-800 text-sm flex items-center gap-1.5 mb-3">
                          <Sparkles size={14} className="text-green-600" /> Saran AI Chef Scanora
                        </h4>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          {renderMarkdown(aiSuggestion)}
                        </div>
                      </div>
                    )}

                    {aiError && !aiLoading && (
                      <div className="bg-red-50 rounded-2xl p-4 border border-red-100 flex items-center justify-between gap-2">
                        <p className="text-sm text-red-600">{aiError}</p>
                        <button onClick={handleGetAiSuggestion} className="text-xs text-red-600 font-bold underline">Coba Lagi</button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Always-visible Disclaimer ── */}
                <div className="flex items-start gap-3 bg-gray-100/80 border border-gray-200/70 rounded-2xl px-4 py-3 mb-5 mt-2">
                  <Bot size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-gray-500 leading-relaxed">
                    Estimasi berdasarkan skenario terbaik. Kondisi asli bisa berbeda. Foto ulang untuk update.
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky CTAs — always at bottom */}
            <div className="p-5 pt-3 flex-shrink-0 border-t border-gray-100">
              {activeTab === 'inventory' ? (
                <div className="flex gap-4">
                  <button
                    onClick={async () => {
                      try {
                        await api.delete(`/inventory/${selectedItem.id}`, { data: { outcome: 'discarded' } });
                        setInventoryData(prev => prev.filter(i => i.id !== selectedItem.id));
                        setSelectedItem(null);
                      } catch (err) { console.error(err); }
                    }}
                    className="flex-1 min-h-[44px] bg-red-100 text-red-600 font-semibold rounded-xl hover:bg-red-200 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
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
                    className={`flex-1 min-h-[44px] font-semibold rounded-xl active:scale-95 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer bg-scanora-green text-white hover:bg-scanora-dark`}
                  >
                    <Utensils size={16} /> Dikonsumsi
                  </button>
                </div>
              ) : (
                <div className="flex gap-4">
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

      {/* Indeterminate bar keyframe */}
      <style>{`
        @keyframes indeterminate {
          0%   { transform: translateX(-100%); width: 40%; }
          50%  { width: 60%; }
          100% { transform: translateX(250%); width: 40%; }
        }
      `}</style>
    </div>
  );
};

export default Inventory;
