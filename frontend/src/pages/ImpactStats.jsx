import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, TrendingUp, Utensils, Trash2, Star, BarChart2 } from 'lucide-react';
import { useViewport } from '../context/ViewportContext';
import api from '../api';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// ── Mock Data ───────────────────────────────────────────────────────────────────
const mockMonthlyData = [
  {
    name: 'Jan', year: 2026, consumed: 12, discarded: 4,
    topFruit: { name: 'Pisang', count: 7, img: '/mascots/banana_ripe.png' },
    distribution: [
      { name: 'Pisang', consumed: 7, discarded: 2, color: '#fdc107' },
      { name: 'Apel',   consumed: 3, discarded: 1, color: '#bb0006' },
      { name: 'Jeruk',  consumed: 2, discarded: 1, color: '#f87305' },
    ]
  },
  {
    name: 'Feb', year: 2026, consumed: 19, discarded: 8,
    topFruit: { name: 'Apel', count: 11, img: '/mascots/apple_ripe.png' },
    distribution: [
      { name: 'Pisang', consumed: 8, discarded: 3, color: '#fdc107' },
      { name: 'Apel',   consumed: 11, discarded: 5, color: '#bb0006' },
      { name: 'Jeruk',  consumed: 0,  discarded: 0, color: '#f87305' },
    ]
  },
  {
    name: 'Mar', year: 2026, consumed: 15, discarded: 2,
    topFruit: { name: 'Jeruk', count: 9, img: '/mascots/orange_ripe.png' },
    distribution: [
      { name: 'Pisang', consumed: 4, discarded: 1, color: '#fdc107' },
      { name: 'Apel',   consumed: 2, discarded: 1, color: '#bb0006' },
      { name: 'Jeruk',  consumed: 9, discarded: 0, color: '#f87305' },
    ]
  },
  {
    name: 'Apr', year: 2026, consumed: 22, discarded: 5,
    topFruit: { name: 'Pisang', count: 13, img: '/mascots/banana_ripe.png' },
    distribution: [
      { name: 'Pisang', consumed: 13, discarded: 2, color: '#fdc107' },
      { name: 'Apel',   consumed: 6, discarded: 2, color: '#bb0006' },
      { name: 'Jeruk',  consumed: 3, discarded: 1, color: '#f87305' },
    ]
  },
  {
    name: 'Mei', year: 2026, consumed: 28, discarded: 3,
    topFruit: { name: 'Pisang', count: 16, img: '/mascots/banana_ripe.png' },
    distribution: [
      { name: 'Pisang', consumed: 16, discarded: 1, color: '#fdc107' },
      { name: 'Apel',   consumed: 8,  discarded: 1, color: '#bb0006' },
      { name: 'Jeruk',  consumed: 4,  discarded: 1, color: '#f87305' },
    ]
  },
];

// ── Component ───────────────────────────────────────────────────────────────────
export default function ImpactStats() {
  const navigate = useNavigate();
  const { viewport } = useViewport();
  const isDesktop = viewport === 'desktop';

  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const [monthIdx, setMonthIdx] = useState(0);
  const [rekapExpanded, setRekapExpanded] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === '1') {
        setUseMock(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (useMock) {
      setMonthlyData(mockMonthlyData);
      setMonthIdx(mockMonthlyData.length - 1);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    api.get('/inventory/monthly-stats')
      .then(res => {
        if (res.data?.data && res.data.data.length > 0) {
          setMonthlyData(res.data.data);
          setMonthIdx(res.data.data.length - 1);
        } else {
          setMonthlyData([]);
        }
      })
      .catch(err => {
        console.error(err);
        setMonthlyData([]);
      })
      .finally(() => setIsLoading(false));
  }, [useMock]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-500 font-bold p-6 text-center">
        <div className="w-10 h-10 border-4 border-scanora-green border-t-transparent rounded-full animate-spin mb-4" />
        <p>Mengumpulkan data statistikmu...</p>
      </div>
    );
  }

  if (monthlyData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 relative flex flex-col">
        {/* Header */}
        <div className="bg-white px-6 pt-6 pb-4 shadow-sm z-10 sticky top-0 border-b border-gray-100 flex items-center gap-4">
          {!isDesktop && (
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 transition-colors active:scale-95">
              <ChevronLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-900">Statistik Performa</h1>
          {isDesktop && (
            <button onClick={() => navigate(-1)} className="ml-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-700 transition-colors active:scale-95">
              Tutup
            </button>
          )}
        </div>
        
        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <BarChart2 size={40} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Data Statistik</h2>
          <p className="text-sm text-gray-500 mb-8 max-w-[250px]">
            Statistik akan muncul setelah kamu membuang atau mengonsumsi buah dari inventori.
          </p>
          <button onClick={() => navigate('/inventory')} className="px-6 py-3 bg-scanora-green text-white font-bold rounded-xl active:scale-95 transition-all shadow-md">
            Cek Inventori
          </button>
        </div>
      </div>
    );
  }

  const allTimeFavFruit = (() => {
    const counts = {};
    monthlyData.forEach(m => {
      m.distribution.forEach(d => {
        counts[d.name] = (counts[d.name] || 0) + d.consumed;
      });
    });
    const entries = Object.entries(counts);
    if (entries.length === 0) return { name: '-', count: 0, img: '' };
    const best = entries.sort((a, b) => b[1] - a[1])[0];
    const imgMap = { 'Pisang': '/mascots/banana_ripe.png', 'Apel': '/mascots/apple_ripe.png', 'Jeruk': '/mascots/orange_ripe.png' };
    return { name: best[0], count: best[1], img: imgMap[best[0]] || '/mascots/apple_ripe.png' };
  })();

  const getSaveRate = (d) => {
    if (!d) return 0;
    const total = d.consumed + d.discarded;
    if (total === 0) return 0;
    return Math.round((d.consumed / total) * 100);
  };

  const bestMonthIdx = monthlyData.reduce(
    (bestIdx, m, i, arr) => getSaveRate(m) > getSaveRate(arr[bestIdx]) ? i : bestIdx,
    0
  );

  const current = monthlyData[monthIdx];
  const saveRate = getSaveRate(current);

  // Pie data: distribution of consumed+discarded for current month
  const pieTotal = current.distribution.reduce((s, d) => s + d.consumed + d.discarded, 0);
  const pieData = {
    labels: current.distribution.filter(d => d.consumed + d.discarded > 0).map(d => d.name),
    datasets: [{
      data: current.distribution.filter(d => d.consumed + d.discarded > 0).map(d => d.consumed + d.discarded),
      backgroundColor: current.distribution.filter(d => d.consumed + d.discarded > 0).map(d => d.color),
      borderWidth: 3,
      borderColor: '#fff',
      hoverOffset: 8,
    }],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        bodyFont: { family: 'Nunito', size: 13, weight: 'bold' },
        titleFont: { family: 'Nunito', size: 12 },
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed;
            const pct = pieTotal > 0 ? ((val / pieTotal) * 100).toFixed(1).replace('.', ',') : '0';
            return `  ${ctx.label}: ${pct}%`;
          },
        },
      },
      datalabels: {
        color: '#fff',
        font: { family: 'Nunito', size: 12, weight: 'bold' },
        formatter: (value, ctx) => {
          const pct = pieTotal > 0 ? Math.round((value / pieTotal) * 100) : 0;
          if (pct < 8) return ''; // hide label on tiny slices
          return `${pct}%`;
        },
        textAlign: 'center',
        anchor: 'center',
        align: 'center',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 transition-colors relative">

      {/* ── Header ── */}
      <div className="bg-white px-6 pt-6 pb-4 shadow-sm z-10 sticky top-0 border-b border-gray-100 flex items-center gap-4">
        {!isDesktop && (
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 transition-colors active:scale-95">
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="text-xl font-bold text-gray-900">Statistik Performa</h1>
        {isDesktop && (
          <button onClick={() => navigate(-1)} className="ml-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-700 transition-colors active:scale-95">
            Tutup
          </button>
        )}
      </div>

      {/* ── Floating Month Nav Pill ── */}
      <div className={`fixed left-0 right-0 z-30 flex justify-center transition-all duration-300 ease-out ${isDesktop ? 'bottom-12 pl-[256px]' : 'bottom-24'} pointer-events-none`}>
        <div className="bg-gray-100/90 backdrop-blur-md p-1.5 rounded-full flex gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-gray-200 pointer-events-auto">
          <button
            onClick={() => setMonthIdx(i => Math.max(0, i - 1))}
            disabled={monthIdx === 0}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95 ${monthIdx === 0 ? 'text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:text-gray-900 shadow-sm'}`}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center px-2 font-bold text-gray-700 text-sm">
            {current.name} {current.year}
          </div>
          <button
            onClick={() => setMonthIdx(i => Math.min(monthlyData.length - 1, i + 1))}
            disabled={monthIdx === monthlyData.length - 1}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95 ${monthIdx === monthlyData.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:text-gray-900 shadow-sm'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-5 max-w-2xl mx-auto space-y-6">

        {/* ── Month Title — centered ── */}
        <div className="text-center pt-2">
          <p className="text-xs font-semibold text-gray-400 mb-1">Performa bulan ini:</p>
          <h2 className="text-2xl font-extrabold text-gray-900">{current.name} {current.year}</h2>
        </div>

        {/* ── Main Grid: Dikonsumsi | Dibuang | Tingkat Keberhasilan ── */}
        <div className="grid grid-cols-3 gap-3">
          {/* Dikonsumsi */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex flex-col items-center text-center">
            <div className="w-11 h-11 bg-green-500/20 rounded-xl flex items-center justify-center mb-2">
              <Utensils size={20} className="text-green-700" />
            </div>
            <p className="text-3xl font-extrabold leading-none text-green-700">{current.consumed}</p>
            <p className="text-green-700 text-xs font-semibold mt-1.5">Dikonsumsi</p>
          </div>
          {/* Dibuang */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col items-center text-center">
            <div className="w-11 h-11 bg-red-500/20 rounded-xl flex items-center justify-center mb-2">
              <Trash2 size={20} className="text-red-main" />
            </div>
            <p className="text-3xl font-extrabold leading-none text-red-main">{current.discarded}</p>
            <p className="text-red-main text-xs font-semibold mt-1.5">Dibuang</p>
          </div>
          {/* Skor Keberhasilan */}
          <div className="bg-scanora-green/10 border border-scanora-green/20 rounded-2xl p-4 flex flex-col items-center text-center">
            <div className="w-11 h-11 bg-scanora-green/20 rounded-xl flex items-center justify-center mb-2">
              <TrendingUp size={20} className="text-scanora-green" />
            </div>
            <p className="text-3xl font-extrabold leading-none text-scanora-green">{saveRate}%</p>
            <p className="text-scanora-green text-xs font-semibold mt-1.5">Skor Keberhasilan</p>
          </div>
        </div>

        {/* ── Row: Legend + Pie Chart + Top Fruit ── */}
        <div className="grid grid-cols-3 gap-3">
          {/* Legend */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
            <p className="text-xs font-semibold text-gray-400 mb-3">Distribusi Buah</p>
            <div className="space-y-2">
              {current.distribution.filter(d => d.consumed + d.discarded > 0).map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600 font-medium">{d.name}</span>
                  </div>
                  <span className="text-gray-400 font-semibold">{d.consumed + d.discarded} buah</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart: distribution */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center">
            <div className="w-full" style={{ height: '130px' }}>
              {pieTotal > 0 ? (
                <Pie data={pieData} options={pieOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300 text-xs">Tidak ada data</div>
              )}
            </div>
          </div>

          {/* Top Fruit this month */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '160px' }}>
            <div className="z-10">
              <p className="text-[11px] text-gray-400 font-semibold">Buah Favorit</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{current.topFruit.name}</p>
            </div>
            <p className="text-xl text-gray-500 mt-4 z-10 font-bold">{current.topFruit.count} Kali</p>
            <img
              src={current.topFruit.img}
              alt={current.topFruit.name}
              className="absolute bottom-4 right-2 h-24 object-contain drop-shadow-md"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>

        {/* ── Rekap Perjalanan Header ── */}
        <div className="text-center mt-8 mb-4">
          <h3 className="text-lg font-bold text-gray-900">Rekap Perjalanan:</h3>
        </div>

        {/* ── All-time insight cards ── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Buah Favorit Sepanjang Masa */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '160px' }}>
            <div className="z-10">
              <p className="text-[11px] text-gray-400 font-semibold truncate">Buah Favorit Sepanjang Masa</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{allTimeFavFruit.name}</p>
            </div>
            <p className="text-xl text-gray-500 mt-4 z-10 font-bold">{allTimeFavFruit.count} Kali</p>
            <img
              src={allTimeFavFruit.img}
              alt={allTimeFavFruit.name}
              className="absolute bottom-4 right-2 h-24 object-contain drop-shadow-md"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Skor Keberhasilan Terbaik */}
          <button
            onClick={() => setMonthIdx(bestMonthIdx)}
            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col hover:bg-gray-50 active:scale-95 transition-all text-left"
            style={{ minHeight: '160px' }}
          >
            <div className="z-10 mb-4">
              <p className="text-[11px] text-gray-500 font-semibold truncate">Skor Keberhasilan Terbaik</p>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <p className="text-5xl font-extrabold text-gray-900 leading-none">
                {getSaveRate(monthlyData[bestMonthIdx])}%
              </p>
            </div>
            <div className="z-10 mt-auto">
              <p className="text-sm text-gray-600 font-medium">
                {monthlyData[bestMonthIdx].name} {monthlyData[bestMonthIdx].year}
              </p>
            </div>
          </button>
        </div>

        {/* ── Lihat Bulan Lainnya Toggle ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-4">
          <button
            onClick={() => setRekapExpanded(prev => !prev)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              Lihat Bulan Lainnya
            </div>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-300 ${rekapExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Collapsible bar chart — custom, no Chart.js bar */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${rekapExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="px-5 pb-5">
              <div className="flex items-end gap-2 h-40">
                {monthlyData.map((m, i) => {
                  const maxVal = Math.max(...monthlyData.map(x => x.consumed + x.discarded));
                  const total = m.consumed + m.discarded;
                  const heightPct = maxVal > 0 ? (total / maxVal) * 100 : 0;
                  const consumedPct = total > 0 ? (m.consumed / total) * 100 : 0;
                  const discardedPct = total > 0 ? (m.discarded / total) * 100 : 0;
                  const isFocused = i === monthIdx;
                  return (
                    <button
                      key={m.name}
                      onClick={() => setMonthIdx(i)}
                      className={`flex-1 flex flex-col items-center gap-1 transition-all active:scale-95 rounded-t-lg cursor-pointer ${isFocused ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                    >
                      {/* Value above bar */}
                      <span className={`text-[10px] font-bold mb-0.5 ${isFocused ? 'text-gray-800' : 'text-gray-400'}`}>
                        {total}
                      </span>
                      {/* Bar */}
                      <div
                        className="w-full rounded-t-lg overflow-hidden flex flex-col-reverse transition-all duration-500 relative"
                        style={{ height: `${Math.max(8, heightPct * 1.3)}px` }}
                      >
                        {/* Discarded (red, bottom) */}
                        <div className="bg-red-main/70 relative flex items-center justify-center" style={{ height: `${discardedPct}%` }}>
                          {m.discarded > 0 && <span className="text-[9px] font-bold text-white leading-none">{m.discarded}</span>}
                        </div>
                        {/* Consumed (green, top) */}
                        <div className="bg-scanora-green relative flex items-center justify-center" style={{ height: `${consumedPct}%` }}>
                          {m.consumed > 0 && <span className="text-[9px] font-bold text-white leading-none">{m.consumed}</span>}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold ${isFocused ? 'text-scanora-green' : 'text-gray-400'}`}>
                        {m.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex gap-4 mt-3 justify-center">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-sm bg-scanora-green" /> Dikonsumsi
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-sm bg-red-main/70" /> Dibuang
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
