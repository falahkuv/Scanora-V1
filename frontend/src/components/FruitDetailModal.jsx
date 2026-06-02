/**
 * FruitDetailModal.jsx
 *
 * Shared detail modal used by both Home (Segera Konsumsi) and
 * Inventory (all tabs). Pass item + callbacks from parent.
 *
 * Props:
 *   item          – inventory/history item object
 *   activeTab     – 'inventory' | 'history'
 *   onClose       – fn()
 *   onConsumed    – fn() – mark as consumed (inventory only)
 *   onDiscarded   – fn() – mark as discarded (inventory only)
 *   onDeleteHistory – fn() – delete from history (history only)
 *   aiSuggestion  – string | null
 *   aiLoading     – bool
 *   aiError       – string | null
 *   onRequestAI   – fn() – trigger AI suggestion fetch
 */

import { X, Trash2, Utensils, Camera, SquareCheck, SquareX, ChevronRight, Sparkles, Bot } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizeFruit = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('pisang') || t.includes('banana')) return 'banana';
  if (t.includes('apel')   || t.includes('apple'))  return 'apple';
  if (t.includes('jeruk')  || t.includes('orange')) return 'orange';
  return 'apple';
};

const getMascotSrc = (fruitType, condition) =>
  `/mascots/${normalizeFruit(fruitType)}_${(condition || 'ripe').toLowerCase()}.png`;

const getFruitLabel = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('pisang') || t.includes('banana')) return 'Pisang';
  if (t.includes('apel')   || t.includes('apple'))  return 'Apel';
  if (t.includes('jeruk')  || t.includes('orange')) return 'Jeruk';
  return type;
};

const getConditionLabel = (condition) => {
  const c = (condition || '').toLowerCase();
  if (c === 'unripe') return 'Unripe';
  if (c === 'ripe')   return 'Ripe';
  if (c === 'rotten') return 'Rotten';
  return condition;
};

const getConditionBadgeStyle = (condition) => {
  const c = (condition || '').toLowerCase();
  if (c === 'unripe') return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300';
  if (c === 'ripe')   return 'bg-orange-100 dark:bg-orange-900/40 text-orange-main dark:text-orange-400';
  if (c === 'rotten') return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300';
  return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
};

const calculateDaysLeft = (reminderAt) => {
  if (!reminderAt) return null;
  return Math.ceil((new Date(reminderAt) - new Date()) / (1000 * 60 * 60 * 24));
};

const getCountdownConfig = (condition, daysLeft) => {
  const cond = (condition || '').toLowerCase();
  if (cond === 'rotten' || cond === 'discarded')
    return { bg: 'bg-red-main', text: 'text-white', btnText: 'Tidak Layak' };
  if (cond === 'unripe') {
    if (daysLeft === null)  return { bg: 'bg-red-main', text: 'text-white', btnText: 'Tidak Akan Matang' };
    if (daysLeft <= 0)      return { bg: 'bg-scanora-green', text: 'text-white', btnText: 'Siap Matang' };
    return { bg: 'bg-scanora-green', text: 'text-white', btnText: `Matang ${daysLeft} Hari Lagi` };
  }
  if (daysLeft === null || daysLeft < 0) return { bg: 'bg-red-main', text: 'text-white', btnText: 'Kedaluwarsa' };
  if (daysLeft === 0) return { bg: 'bg-red-main', text: 'text-white', btnText: 'Hari ini!' };
  if (daysLeft === 1) return { bg: 'bg-red-main', text: 'text-white', btnText: 'Sisa 1 Hari Lagi' };
  return { bg: 'bg-orange-main', text: 'text-white', btnText: `Sisa ${daysLeft} Hari Lagi` };
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

/** Freshness score badge — keeps opacity background per design. */
const ScoreBadge = ({ score, className = 'py-1 text-[11px]' }) => {
  const pct  = Math.round(score ?? 0);
  const bg   = pct >= 70 ? 'bg-green-500/15 dark:bg-green-500/20'
             : pct > 0   ? 'bg-orange-main/15 dark:bg-orange-500/20'
             :              'bg-red-500/15 dark:bg-red-500/20';
  const text = pct >= 70 ? 'text-green-700 dark:text-green-300'
             : pct > 0   ? 'text-orange-main dark:text-orange-300'
             :              'text-red-700 dark:text-red-300';
  return (
    <div className={`px-2 rounded w-full text-center font-bold flex items-center justify-center ${bg} ${text} ${className}`}>
      {pct}%
    </div>
  );
};

/** Minimal markdown renderer: **bold**, *italic*, bullet lists. */
const renderMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const isBullet = /^[-*•]\s+/.test(line);
    const content  = line.replace(/^[-*•]\s+/, '');
    const parseInline = (str) =>
      str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, j) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={j}>{part.slice(2, -2)}</strong>;
        if (/^\*[^*]+\*$/.test(part))     return <em key={j}>{part.slice(1, -1)}</em>;
        return part;
      });
    if (isBullet) return (
      <div key={i} className="flex gap-2 mt-1">
        <span className="text-scanora-green font-bold mt-0.5">•</span>
        <span>{parseInline(content)}</span>
      </div>
    );
    if (!line.trim()) return <div key={i} className="mt-2" />;
    return <p key={i} className="mt-1">{parseInline(line)}</p>;
  });
};

// ─── Modal Component ──────────────────────────────────────────────────────────

const FruitDetailModal = ({
  item,
  activeTab = 'inventory',
  onClose,
  onConsumed,
  onDiscarded,
  onDeleteHistory,
  aiSuggestion,
  aiLoading,
  aiError,
  onRequestAI,
}) => {
  if (!item) return null;

  const condition = item.condition_latest || item.condition;
  const daysLeft  = calculateDaysLeft(item.reminder_at);
  const countdown = getCountdownConfig(condition, daysLeft);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl transform transition-all animate-slide-up flex flex-col overflow-hidden relative"
        style={{ maxHeight: '85dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Close button ── */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-11 h-11 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all cursor-pointer z-40"
        >
          <X size={18} />
        </button>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 no-scrollbar">

          {/* Image banner */}
          <div className="relative aspect-video bg-gradient-to-b from-sky-200 to-green-200 flex items-center justify-center overflow-hidden flex-shrink-0 z-20">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.fruit_type}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div
              className="w-full h-full items-center justify-center flex-col gap-2 bg-gradient-to-b from-sky-200 to-green-200"
              style={{ display: item.image_url ? 'none' : 'flex' }}
            >
              <img
                src={getMascotSrc(item.fruit_type, condition)}
                alt=""
                className="h-24 object-contain drop-shadow-lg"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>

          <div className="p-5 pb-2">

            {/* ── Name + condition badge + floating mascot ── */}
            <div className="flex items-center justify-between mb-4 mt-2">
              <div className="flex flex-row items-center gap-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white capitalize leading-none">
                  {getFruitLabel(item.fruit_type)}
                </h2>
                <span className={`text-sm font-bold px-2 py-1 rounded-md capitalize leading-none ${getConditionBadgeStyle(condition)}`}>
                  {getConditionLabel(condition)}
                </span>
              </div>
              <div className="relative w-20">
                <img
                  src={getMascotSrc(item.fruit_type, condition)}
                  alt=""
                  className="absolute bottom-0 right-0 h-32 object-contain drop-shadow-md pointer-events-none"
                  style={{ transform: 'translateY(64px)' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>

            {/* ── Detail Scan label ── */}
            <p className="text-xs font-normal text-gray-400 dark:text-gray-500 text-center mb-2">Detail Scan:</p>

            {/* ── Tab-specific detail card ── */}
            {activeTab === 'inventory' ? (
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 mb-3">
                <div className="flex flex-col gap-3 mb-4">
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-sm flex items-center gap-2">
                    <Camera size={16} />
                    <span>Tgl. Foto: {formatShortDate(item.added_at || item.created_at)}</span>
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-sm flex items-center gap-2">
                    {condition === 'unripe' ? <SquareCheck size={16} /> : <SquareX size={16} />}
                    <span>
                      {condition === 'unripe' ? 'Tgl. Matang:' : 'Tgl. Batas Layak:'}{' '}
                      {formatShortDate(item.reminder_at)}
                    </span>
                  </p>
                </div>
                <hr className="border-gray-200 dark:border-gray-600 mb-4" />
                {/* Freshness score update row */}
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Update Freshness Score:</p>
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <div className="flex-1">
                      <ScoreBadge score={item.freshness_score_initial} className="py-2 text-sm" />
                    </div>
                    <div className="flex -space-x-2 flex-shrink-0 animate-pulse">
                      <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
                      <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <ScoreBadge score={item.freshness_score_latest ?? item.freshness_score_initial} className="py-2 text-sm" />
                    </div>
                  </div>
                </div>
                {/* Countdown pill */}
                <div className={`px-4 py-3 rounded-xl text-center text-base font-bold w-full ${countdown.bg} ${countdown.text}`}>
                  {countdown.btnText}
                </div>
              </div>
            ) : (
              /* History: compact date + score row */
              <div className="mb-4">
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium flex-1">
                      <Camera size={16} />
                      <span>Tgl. Foto: {formatShortDate(item.scanned_at)}</span>
                    </div>
                    <div className="min-w-[80px]">
                      <ScoreBadge score={item.freshness_score} className="py-1.5 text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── AI Suggestion Box (inventory only) ── */}
            {item.scan_id && activeTab === 'inventory' && (
              <div className="mb-4 mt-2">
                {!aiSuggestion && !aiLoading && (
                  <button
                    onClick={onRequestAI}
                    className="w-full min-h-[44px] bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 border border-scanora-green text-scanora-green font-semibold rounded-2xl flex items-center justify-center gap-2 text-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <Sparkles size={16} className="text-scanora-green" />
                    Minta Saran AI
                  </button>
                )}

                {aiLoading && (
                  <div className="w-full bg-white dark:bg-gray-800 border border-scanora-green/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(34,197,94,0.1)] relative overflow-hidden">
                    <div className="absolute inset-0 bg-scanora-green/5 animate-pulse" />
                    <div className="relative z-10 flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-scanora-green/20 flex items-center justify-center animate-pulse">
                        <Sparkles size={16} className="text-scanora-green" />
                      </div>
                      <p className="text-sm font-bold text-scanora-green animate-pulse">Chef Scanora sedang menganalisa...</p>
                    </div>
                    <div className="relative z-10 space-y-2.5">
                      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-full animate-pulse" />
                      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6 animate-pulse" />
                      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-4/6 animate-pulse" />
                    </div>
                  </div>
                )}

                {aiSuggestion && !aiLoading && (
                  <div
                    className="bg-transparent rounded-2xl p-4 border border-scanora-green"
                  >
                    <h4 className="font-bold text-scanora-green text-sm flex items-center gap-1.5 mb-3">
                      <Sparkles size={14} /> Chef Scanora Menyarankan
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {renderMarkdown(aiSuggestion)}
                    </div>
                  </div>
                )}

                {aiError && !aiLoading && (
                  <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-4 border border-red-100 dark:border-red-800 flex items-center justify-between gap-2">
                    <p className="text-sm text-red-600 dark:text-red-400">{aiError}</p>
                    <button onClick={onRequestAI} className="text-xs text-red-600 dark:text-red-400 font-bold underline">Coba Lagi</button>
                  </div>
                )}
              </div>
            )}

            {/* ── Disclaimer ── */}
            <div className="flex items-start gap-3 bg-gray-100/80 dark:bg-gray-700/40 border border-gray-200/70 dark:border-gray-600/50 rounded-2xl px-4 py-3 mb-5 mt-2">
              <Bot size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                Estimasi berdasarkan skenario terbaik. Kondisi asli bisa berbeda. Foto ulang untuk update.
              </p>
            </div>

          </div>
        </div>

        {/* ── Sticky CTAs ── */}
        <div className="p-5 pt-3 flex-shrink-0 border-t border-gray-100 dark:border-gray-700">
          {activeTab === 'inventory' ? (
            <div className="flex gap-4">
              <button
                onClick={onDiscarded}
                className="flex-1 min-h-[44px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 size={16} /> Dibuang
              </button>
              <button
                onClick={onConsumed}
                className="flex-1 min-h-[44px] bg-scanora-green text-white font-semibold rounded-xl hover:bg-scanora-dark active:scale-95 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Utensils size={16} /> Dikonsumsi
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={onDeleteHistory}
                className="w-[20%] min-h-[44px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 active:scale-95 transition-all"
                title="Hapus dari Riwayat"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={onClose}
                className="w-[80%] min-h-[44px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FruitDetailModal;
