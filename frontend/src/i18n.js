import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Side-by-side dictionary for easier maintenance
const dictionary = {
  // Navigation & General
  nav: {
    home: { en: 'Home', id: 'Beranda' },
    inventory: { en: 'Inventory', id: 'Inventori' },
    history: { en: 'History', id: 'Riwayat' },
    stats: { en: 'Stats', id: 'Statistik' },
    profile: { en: 'Profile', id: 'Profil' },
    loading: { en: 'Loading...', id: 'Memuat...' }
  },

  // Home
  home: {
    greeting: { en: 'Hello, {{name}}!', id: 'Halo, {{name}}!' },
    subtitle: { en: 'Manage and rescue your food efficiently.', id: 'Ayo selamatkan makanan hari ini.' },
    notifications: { en: 'Notifications', id: 'Notifikasi' },
    monthlyPerformance: { en: 'Monthly Performance', id: 'Performa Bulan Ini' },
    viewStats: { en: 'View Analytics', id: 'Lihat Statistik' },
    consumed: { en: 'Consumed', id: 'Dikonsumsi' },
    discarded: { en: 'Discarded', id: 'Dibuang' },
    saved: { en: 'Saved', id: 'Disimpan' },
    // Standardized Terminology: Skor Penyelamatan
    successScore: { en: 'Rescue Score', id: 'Skor Penyelamatan' },
    emptyStats: { en: 'Start consuming or discarding items to generate your analytics.', id: 'Mulai konsumsi atau buang buah untuk melihat statistikmu!' },
    prideMsg: {
      excellent: { en: 'Excellent! You have successfully minimized food waste.', id: 'Luar biasa! Hampir semua buahmu terselamatkan. \uD83C\uDF1F' },
      good: { en: 'Good progress. Continue to reduce your food waste.', id: 'Lumayan! Terus kurangi pemborosan ya. \uD83D\uDC4D' },
      bad: { en: 'High waste rate detected. Consider improving your consumption habits.', id: 'Masih banyak yang dibuang. Yuk lebih bijak! \uD83D\uDE2C' }
    },
    disclaimer: { en: 'Estimations are based on optimal conditions. Actual states may vary. Rescan to update data.', id: 'Estimasi berdasarkan skenario terbaik. Kondisi asli bisa berbeda. Foto ulang untuk update.' }
  },

  // Condition & Scan Status
  condition: {
    unripe: { en: 'Unripe', id: 'Mentah' },
    ripe: { en: 'Ripe', id: 'Matang' },
    rotten: { en: 'Rotten', id: 'Busuk' },
    discarded: { en: 'Discarded', id: 'Dibuang' },
    consumed: { en: 'Consumed', id: 'Dikonsumsi' },
    all: { en: 'All', id: 'Semua' }
  },

  // Fruit Names
  fruit: {
    banana: { en: 'Banana', id: 'Pisang' },
    apple: { en: 'Apple', id: 'Apel' },
    orange: { en: 'Orange', id: 'Jeruk' },
    unknown: { en: 'Unknown', id: 'Tidak Diketahui' }
  },

  // Inventory & History
  inventory: {
    sortFreshness: { en: 'Freshness Score', id: 'Freshness Score' },
    sortDate: { en: 'Date Scanned', id: 'Tanggal Foto' },
    emptyInventory: { en: 'Your inventory is currently empty.', id: 'Belum ada buah di inventorimu.' },
    emptyInventorySubtitle: { en: 'Tap the scan button to add new items to your inventory.', id: 'Tekan tombol scan di bawah untuk mulai menambahkan.' },
    emptyHistory: { en: 'No historical records available.', id: 'Belum ada riwayat.' },
    emptyHistorySubtitle: { en: 'Consumed or discarded items will be documented here.', id: 'Buah yang kamu buang atau konsumsi akan muncul di sini.' }
  },

  // Details Modal
  details: {
    dateAdded: { en: 'Date Scanned', id: 'Tgl. Foto' },
    dateRipe: { en: 'Estimated Ripeness', id: 'Tgl. Matang' },
    dateExpire: { en: 'Estimated Expiry', id: 'Tgl. Batas Layak' },
    scanDetails: { en: 'Scan Analysis:', id: 'Detail Scan:' },
    updateFreshness: { en: 'Update Freshness Score:', id: 'Update Freshness Score:' },
    aiSuggestion: { en: 'Request AI Analysis', id: 'Minta Saran AI' },
    aiThinking: { en: 'AI is analyzing...', id: 'Scanora sedang berpikir...' },
    aiSuggestionTitle: { en: 'AI Recommendation', id: 'Saran Chef Scanora' },
    actionDiscarded: { en: 'Discarded', id: 'Dibuang' },
    actionConsumed: { en: 'Consumed', id: 'Dikonsumsi' },
    countdown: {
      ready: { en: 'Ready to Ripe', id: 'Siap Matang' },
      notRipe: { en: 'Will not ripe', id: 'Tidak Akan Matang' },
      daysToRipe_one: { en: 'Ripe in {{count}} Day', id: 'Matang 1 Hari Lagi' },
      daysToRipe_other: { en: 'Ripe in {{count}} Days', id: 'Matang {{count}} Hari Lagi' },
      expired: { en: 'Expired', id: 'Kedaluwarsa' },
      today: { en: 'Today!', id: 'Hari ini!' },
      daysLeft_one: { en: '1 Day Left', id: 'Sisa 1 Hari Lagi' },
      daysLeft_other: { en: '{{count}} Days Left', id: 'Sisa {{count}} Hari Lagi' },
      unfit: { en: 'Unfit for Consumption', id: 'Tidak Layak' }
    }
  },

  // Stats
  stats: {
    title: { en: 'Performance Analytics', id: 'Statistik Performa' },
    close: { en: 'Close', id: 'Tutup' },
    gathering: { en: 'Compiling statistical data...', id: 'Mengumpulkan data statistikmu...' },
    emptyTitle: { en: 'No Analytics Data Available', id: 'Belum Ada Data Statistik' },
    emptySubtitle: { en: 'Analytics will be generated once items are consumed or discarded.', id: 'Statistik akan muncul setelah kamu membuang atau mengonsumsi buah dari inventori.' },
    checkInventory: { en: 'View Inventory', id: 'Cek Inventori' },
    monthPerformance: { en: 'Current Month Performance:', id: 'Performa bulan ini:' },
    distribution: { en: 'Item Distribution', id: 'Distribusi Buah' },
    topFruit: { en: 'Most Scanned Item', id: 'Buah Favorit' },
    times: { en: 'Occurrences', id: 'Kali' },
    journeyRecap: { en: 'Activity Summary:', id: 'Rekap Perjalanan:' },
    allTimeFav: { en: 'All-Time Most Frequent Item', id: 'Buah Terfavorit' },
    bestScore: { en: 'Best Rescue Score', id: 'Skor Penyelamatan Terbaik' },
    seeMoreMonths: { en: 'View Previous Months', id: 'Lihat Bulan Lainnya' }
  },

  // Profile
  profile: {
    title: { en: 'Settings & Profile', id: 'Pengaturan & Profil' },
    appSettings: { en: 'Application Settings', id: 'Pengaturan Aplikasi' },
    accountActions: { en: 'Account Actions', id: 'Aksi Akun' },
    language: { en: 'Language', id: 'Bahasa' },
    language_desc: { en: 'Change application language', id: 'Ubah bahasa aplikasi' },
    dark_mode: { en: 'Dark Mode', id: 'Mode Gelap' },
    dark_mode_desc: { en: 'Switch to dark theme', id: 'Ubah ke tema gelap' },
    logout: { en: 'Sign Out', id: 'Keluar' },
    version: { en: 'App Version', id: 'Versi Aplikasi' },
    madeWith: { en: 'Made with \u2764\uFE0F by Scanora Team', id: 'Dibuat dengan \u2764\uFE0F oleh Tim Scanora' }
  }
};

// Builder to transform the dictionary into i18next resources format
const buildTranslations = (dict) => {
  const enObj = {};
  const idObj = {};

  const traverse = (currentDict, currentEn, currentId) => {
    for (const key in currentDict) {
      if (currentDict[key].en !== undefined && currentDict[key].id !== undefined) {
        currentEn[key] = currentDict[key].en;
        currentId[key] = currentDict[key].id;
      } else {
        currentEn[key] = {};
        currentId[key] = {};
        traverse(currentDict[key], currentEn[key], currentId[key]);
      }
    }
  };

  traverse(dict, enObj, idObj);
  return { enObj, idObj };
};

const { enObj: enTranslation, idObj: idTranslation } = buildTranslations(dictionary);

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      id: { translation: idTranslation }
    },
    lng: localStorage.getItem('language') || 'id',
    fallbackLng: 'id',
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
