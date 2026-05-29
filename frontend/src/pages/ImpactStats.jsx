import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, TrendingUp, Utensils, Trash2, Salad } from 'lucide-react';
import { useViewport } from '../context/ViewportContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// ── Mock Data ──────────────────────────────────────────────────────────────────
const monthlyData = [
  { name: 'Jan', consumed: 12, discarded: 4, saved: 18 },
  { name: 'Feb', consumed: 19, discarded: 8, saved: 22 },
  { name: 'Mar', consumed: 15, discarded: 2, saved: 19 },
  { name: 'Apr', consumed: 22, discarded: 5, saved: 27 },
  { name: 'Mei', consumed: 28, discarded: 3, saved: 31 },
];

const fruitData = [
  { name: 'Pisang', count: 45, color: '#facc15', bg: 'bg-yellow-50', textColor: 'text-yellow-700', emoji: '🍌' },
  { name: 'Apel',   count: 35, color: '#ef4444', bg: 'bg-red-50',    textColor: 'text-red-600',    emoji: '🍎' },
  { name: 'Jeruk',  count: 20, color: '#f97316', bg: 'bg-orange-50', textColor: 'text-orange-600', emoji: '🍊' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const getSaveRate = (d) => Math.round((d.consumed / (d.consumed + d.discarded)) * 100);

const bestMonth = monthlyData.reduce((a, b) => getSaveRate(a) > getSaveRate(b) ? a : b);

export default function ImpactStats() {
  const navigate = useNavigate();
  const { viewport } = useViewport();
  const isDesktop = viewport === 'desktop';

  const [monthIdx, setMonthIdx] = useState(monthlyData.length - 1);
  const current = monthlyData[monthIdx];
  const saveRate = getSaveRate(current);
  const total = current.consumed + current.discarded;

  // ── Chart.js: Bar ────────────────────────────────────────────────────────────
  const barData = {
    labels: monthlyData.map(d => d.name),
    datasets: [
      {
        label: 'Dibuang',
        data: monthlyData.map(d => d.discarded),
        backgroundColor: monthlyData.map((_, i) => i === monthIdx ? '#ef4444' : '#fecaca'),
        borderRadius: 5,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.65,
      },
      {
        label: 'Dikonsumsi',
        data: monthlyData.map(d => d.consumed),
        backgroundColor: monthlyData.map((_, i) => i === monthIdx ? '#10b981' : '#a7f3d0'),
        borderRadius: 5,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.65,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { size: 12, family: 'Nunito' },
          color: '#6b7280',
        },
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#111827',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        bodyFont: { family: 'Nunito', size: 12 },
        titleFont: { family: 'Nunito', size: 13, weight: 'bold' },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#9ca3af', font: { size: 11, family: 'Nunito' } },
      },
      y: {
        grid: { color: '#f3f4f6', drawBorder: false },
        border: { display: false, dash: [4, 4] },
        ticks: { color: '#9ca3af', font: { size: 11, family: 'Nunito' }, stepSize: 5 },
        beginAtZero: true,
      },
    },
  };

  // ── Chart.js: Pie ────────────────────────────────────────────────────────────
  const pieData = {
    labels: fruitData.map(f => f.name),
    datasets: [{
      data: fruitData.map(f => f.count),
      backgroundColor: fruitData.map(f => f.color),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 14,
          font: { size: 12, family: 'Nunito' },
          color: '#6b7280',
        },
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        bodyFont: { family: 'Nunito', size: 12, weight: 'bold' },
        titleFont: { family: 'Nunito', size: 13 },
        callbacks: {
          label: (ctx) => `  ${ctx.label}: ${ctx.parsed} Buah`,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors animate-page-in">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4 shadow-sm z-10 sticky top-0 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4">
        {!isDesktop && (
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors active:scale-95">
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Statistik Aksi</h1>
        {isDesktop && (
          <button onClick={() => navigate(-1)} className="ml-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 transition-colors active:scale-95">
            Tutup
          </button>
        )}
      </div>

      <div className="p-5 max-w-2xl mx-auto space-y-5">

        {/* ── Section 1: Performa Bulan Ini ──────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Performa Bulan Ini</h2>

          {/* Month Navigation */}
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 mb-3 shadow-sm">
            <button
              onClick={() => setMonthIdx(i => Math.max(0, i - 1))}
              disabled={monthIdx === 0}
              className={`p-1.5 rounded-lg transition-colors ${monthIdx === 0 ? 'text-gray-300 dark:text-gray-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95'}`}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <span className="font-bold text-gray-800 dark:text-gray-200 text-base">{current.name} '26</span>
              <span className="ml-2 text-xs text-gray-400 font-medium">Save Rate: {saveRate}%</span>
            </div>
            <button
              onClick={() => setMonthIdx(i => Math.min(monthlyData.length - 1, i + 1))}
              disabled={monthIdx === monthlyData.length - 1}
              className={`p-1.5 rounded-lg transition-colors ${monthIdx === monthlyData.length - 1 ? 'text-gray-300 dark:text-gray-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95'}`}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* 3 Stat Cards for current month */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl p-3 text-center">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-800/30 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                <Trash2 size={16} className="text-red-600" />
              </div>
              <p className="text-2xl font-extrabold text-red-600 leading-none">{current.discarded}</p>
              <p className="text-[10px] font-semibold text-red-500 mt-1">Dibuang</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-xl p-3 text-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-800/30 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                <Utensils size={16} className="text-green-600" />
              </div>
              <p className="text-2xl font-extrabold text-green-600 leading-none">{current.consumed}</p>
              <p className="text-[10px] font-semibold text-green-600 mt-1">Dikonsumsi</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30 rounded-xl p-3 text-center">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800/30 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                <Salad size={16} className="text-orange-600" />
              </div>
              <p className="text-2xl font-extrabold text-orange-600 leading-none">{current.saved}</p>
              <p className="text-[10px] font-semibold text-orange-500 mt-1">Disimpan</p>
            </div>
          </div>

          {/* Save Rate progress bar */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tingkat Keberhasilan</span>
              <span className="text-sm font-bold text-scanora-green">{saveRate}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-scanora-green rounded-full transition-all duration-700 ease-out"
                style={{ width: `${saveRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {saveRate >= 80 ? 'Luar biasa! Hampir semua buahmu terselamatkan. 🌟'
                : saveRate >= 50 ? 'Lumayan! Terus kurangi pemborosan ya. 👍'
                : 'Masih banyak yang dibuang. Yuk lebih bijak! 😬'}
            </p>
          </div>
        </section>

        {/* ── Section 2: Overview ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Overview</h2>

          {/* 2 highlight cards */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Buah Favorit */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col items-center text-center">
              <span className="text-2xl mb-1">🍌</span>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Buah Favorit</p>
              <p className="text-base font-bold text-gray-800 dark:text-gray-100 mt-0.5">Pisang</p>
            </div>
            {/* Best Save Rate */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-14 h-14 bg-scanora-green/10 rounded-bl-full" />
              <div className="w-9 h-9 bg-scanora-green/10 rounded-lg flex items-center justify-center text-scanora-green mb-1.5">
                <TrendingUp size={20} />
              </div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Save Rate Terbaik</p>
              <p className="text-base font-bold text-scanora-green mt-0.5">
                {getSaveRate(bestMonth)}%
                <span className="text-xs font-normal text-gray-400 ml-1">({bestMonth.name}'26)</span>
              </p>
            </div>
          </div>

          {/* Riwayat Performa Aksi — Bar Chart */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-3">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">Riwayat Performa Aksi</h3>
            <div className="h-56">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          {/* Komposisi Jenis Buah — Pie Chart */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">Komposisi Jenis Buah</h3>
            <p className="text-xs text-gray-400 mb-4">Distribusi buah yang masuk ke inventori.</p>
            <div className="h-52">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
