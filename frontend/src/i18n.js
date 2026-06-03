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
    loading: { en: 'Loading...', id: 'Memuat...' },
    scanFruit: { en: 'Scan Fruit', id: 'Scan Buah' }
  },

  // Date configuration
  date: {
    months: {
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    }
  },

  // Home
  home: {
    greeting: { en: 'Hello, {{name}}!', id: 'Halo, {{name}}!' },
    subtitle: { en: 'Keep track on your fruit freshness!', id: 'Pantau kualitas buahmu hari ini.' },
    notifications: { en: 'Notifications', id: 'Notifikasi' },
    monthlyPerformance: { en: 'Monthly Performance', id: 'Performa Bulan Ini' },
    viewStats: { en: 'View Analytics', id: 'Lihat Statistik' },
    consumed: { en: 'Consumed', id: 'Dikonsumsi' },
    discarded: { en: 'Discarded', id: 'Dibuang' },
    saved: { en: 'Saved', id: 'Disimpan' },
    successScore: { en: 'Save Score', id: 'Skor Keberhasilan' },
    emptyStats: { en: 'Start consuming or discarding items to generate your analytics.', id: 'Mulai konsumsi atau buang buah untuk melihat statistikmu!' },
    checkInventory: { en: 'Check Inventory', id: 'Cek Inventori' },
    monthPerformance: { en: 'This month\'s performance:', id: 'Performa bulan ini:' },
    distribution: { en: 'Fruit Distribution', id: 'Distribusi Buah' },
    topFruit: { en: 'Top Fruit', id: 'Buah Terfavorit' },
    times: { en: 'Times', id: 'Kali' },
    journeyRecap: { en: 'Journey Recap', id: 'Rekap Perjalanan' },
    allTimeFav: { en: 'All-Time Favorite', id: 'Favorit Sepanjang Masa' },
    bestScore: { en: 'Best Save Score', id: 'Skor Keberhasilan Terbaik' },
    seeMoreMonths: { en: 'See Other Months', id: 'Lihat Bulan Lainnya' },
    prideMsg: {
      excellent: { en: 'Excellent! You have successfully minimized food waste.', id: 'Luar biasa! Hampir semua buahmu terselamatkan. 🌟' },
      good: { en: 'Good progress. Continue to reduce your food waste.', id: 'Lumayan! Terus kurangi pemborosan ya. 👍' },
      bad: { en: 'High waste rate detected. Consider improving your consumption habits.', id: 'Masih banyak yang dibuang. Yuk lebih bijak! 😬' }
    },
    disclaimer: { en: 'Estimations are based on optimal conditions. Actual states may vary. Rescan to update data.', id: 'Estimasi berdasarkan skenario terbaik. Kondisi asli bisa berbeda. Foto ulang untuk update.' },
    // Extra home keys
    urgentConsume: { en: 'Consume Soon', id: 'Segera Konsumsi' },
    allFruitsSafe: { en: 'All your fruits are safe! 🌿', id: 'Semua buah masih aman! 🌿' },
    scanFruitNow: { en: 'Scan Fruit Now', id: 'Scan Buah Sekarang' },
    inboxNotif: { en: 'Notification Inbox', id: 'Inbox Notifikasi' },
    clearAll: { en: 'Clear All', id: 'Hapus Semua' },
    noNotif: { en: 'No notifications yet.', id: 'Belum ada notifikasi.' },
    today: { en: 'Today!', id: 'Hari ini!' },
    daysLeftShort: { en: '{{count}} days left', id: 'Sisa {{count}} hari' },
    scannedOn: { en: 'Scanned', id: 'Difoto' }
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
    emptyHistorySubtitle: { en: 'Consumed or discarded items will be documented here.', id: 'Buah yang kamu buang atau konsumsi akan muncul di sini.' },
    // Extra inventory keys
    tabInventory: { en: 'Inventory', id: 'Inventori' },
    tabHistory: { en: 'History', id: 'Riwayat' },
    emptyInventoryFull: { en: 'Your inventory is empty', id: 'Inventori kamu masih kosong' },
    emptyInventoryTip: { en: 'Save fruits to Inventory and the app will send you reminder notifications.', id: 'Kalau kamu simpan ke Inventori maka aplikasi akan bisa memberi kamu notifikasi pengingat.' },
    emptyHistoryFull: { en: 'No scan history yet', id: 'Belum ada riwayat scan' },
    emptyHistoryTip: { en: 'Every scan result will be saved here.', id: 'Setiap hasil scan buah yang dilakukan akan tersimpan ke sini.' },
    emptyByStatus: { en: 'No {{status}} fruits found', id: 'Buah status {{status}} tidak ditemukan' },
    tryFilter: { en: 'Try changing the filter or scan a new fruit.', id: 'Coba ganti filter atau scan buah baru.' },
    ripening: { en: 'Ripening: ', id: 'Matang: ' },
    spoiling: { en: 'Spoiling: ', id: 'Busuk: ' },
    groupToday: { en: 'Today', id: 'Hari Ini' },
    groupYesterday: { en: 'Yesterday', id: 'Kemarin' },
    groupLast7Days: { en: 'Last 7 Days', id: '7 Hari Terakhir' },
    imageNotFound: { en: 'Image not found', id: 'Gambar tidak ditemukan' }
  },

  // Details Modal
  details: {
    dateAdded: { en: 'Date Scanned', id: 'Tgl. Foto' },
    dateRipe: { en: 'Estimated Ripeness: ', id: 'Tgl. Matang: ' },
    dateExpire: { en: 'Estimated Expiry: ', id: 'Tgl. Batas Layak: ' },
    scanDetails: { en: 'Scan Analysis:', id: 'Detail Scan:' },
    updateFreshness: { en: 'Update Freshness Score:', id: 'Update Freshness Score:' },
    aiSuggestion: { en: 'Request AI Analysis', id: 'Minta Saran AI' },
    aiThinking: { en: 'AI is analyzing...', id: 'Scanora sedang berpikir...' },
    aiSuggestionTitle: { en: 'AI Recommendation', id: 'Saran Chef Scanora' },
    aiSuggestionLoading: { en: 'Chef Scanora is analyzing...', id: 'Chef Scanora sedang menganalisa...' },
    aiError: { en: 'Failed to get suggestion. Try again.', id: 'Gagal mendapatkan saran. Coba lagi.' },
    retryAI: { en: 'Try Again', id: 'Coba Lagi' },
    actionDiscarded: { en: 'Discarded', id: 'Dibuang' },
    actionConsumed: { en: 'Consumed', id: 'Dikonsumsi' },
    close: { en: 'Close', id: 'Tutup' },
    deleteFromHistory: { en: 'Delete from History', id: 'Hapus dari Riwayat' },
    countdown: {
      ready: { en: 'Ready to Ripe', id: 'Siap Matang' },
      notRipe: { en: 'Will not ripe', id: 'Tidak Akan Matang' },
      daysToRipe_one: { en: 'Ripe in {{count}} Day', id: 'Matang 1 Hari Lagi' },
      daysToRipe_other: { en: 'Ripe in {{count}} Days', id: 'Matang {{count}} Hari Lagi' },
      expired: { en: 'Expired', id: 'Kedaluwarsa' },
      today: { en: 'Today!', id: 'Hari ini!' },
      daysLeft_one: { en: '1 Day Left', id: 'Sisa 1 Hari Lagi' },
      daysLeft_other: { en: '{{count}} Days Left', id: 'Sisa {{count}} Hari Lagi' },
      unfit: { en: 'Unedible', id: 'Tidak Layak' }
    }
  },

  // Scanner Sheet
  scanner: {
    analyzing: { en: 'Analyzing with AI...', id: 'Menganalisis dengan AI...' },
    pointAtFruit: { en: 'Point at a fruit', id: 'Arahkan ke buah' },
    helpText: { en: 'Point an apple, orange, or banana at the viewfinder. Or pick from gallery.', id: 'Arahkan apel, jeruk, atau pisang ke bingkai pemindai. Atau pilih foto dari galeri.' },
    scanFailed: { en: 'Scan Failed', id: 'Gagal Memindai' },
    tryCamera: { en: 'Try Camera', id: 'Coba Kamera' },
    gallery: { en: 'Gallery', id: 'Galeri' },
    uploadGallery: { en: 'Upload from Gallery', id: 'Upload dari Galeri' },
    saveToInventory: { en: 'Save to Inventory', id: 'Simpan ke Inventori' },
    saving: { en: 'Saving...', id: 'Menyimpan...' },
    cannotSave: { en: 'Cannot Save', id: 'Tidak Bisa Disimpan' },
    close: { en: 'Close', id: 'Tutup' },
    aiChef: { en: 'AI Chef Scanora', id: 'AI Chef Scanora' },
    aiDisclaimer: { en: 'AI assesses visuals only and cannot be 100% accurate', id: 'AI hanya menilai visual dan tidak bisa 100% akurat' },
    rottenBlocked: { en: 'Fruit is rotten and cannot be saved to Inventory. Only Unripe or Ripe fruits can be saved.', id: 'Buah sudah busuk. Hanya buah Unripe atau Ripe yang dapat disimpan ke Inventori.' },
    unrecognized: { en: 'Object not recognized. Please try again.', id: 'Objek tidak dikenali, silakan coba lagi.' },
    savedSuccess: { en: 'Saved to Inventory!', id: 'Berhasil disimpan ke Inventori!' },
    cameraError: { en: 'Camera cannot be accessed. Try uploading a photo from gallery.', id: 'Kamera tidak dapat diakses. Coba upload foto dari galeri.' }
  },

  // Auth (Login / Register)
  auth: {
    loginTitle: { en: 'Sign In', id: 'Masuk' },
    loginSubtitle: { en: 'Welcome back to Scanora!', id: 'Selamat datang kembali di Scanora!' },
    registerTitle: { en: 'Create Account', id: 'Daftar Akun' },
    registerSubtitle: { en: 'Register and start tracking your fruits!', id: 'Yuk daftar dan mulai pantau buah kamu!' },
    email: { en: 'Email', id: 'Email' },
    password: { en: 'Password', id: 'Password' },
    name: { en: 'Nickname', id: 'Nama Panggilan' },
    forgotPassword: { en: 'Forgot Password?', id: 'Lupa Password?' },
    signingIn: { en: 'Processing...', id: 'Memproses...' },
    createAccount: { en: 'Create Account', id: 'Buat Akun' },
    continueGoogle: { en: 'Continue with Google', id: 'Lanjut dengan Google' },
    registerGoogle: { en: 'Register with Google', id: 'Daftar dengan Google' },
    noAccount: { en: "Don't have an account?", id: 'Belum punya akun?' },
    hasAccount: { en: 'Already have an account?', id: 'Sudah punya akun?' },
    registerHere: { en: 'Register here', id: 'Daftar di sini' },
    loginHere: { en: 'Sign in here', id: 'Masuk di sini' },
    passwordMinLength: { en: 'Password must be at least 8 characters', id: 'Password minimal 8 karakter' },
    passwordHelp: { en: 'Minimum 8 characters', id: 'Minimal 8 karakter' },
    orDivider: { en: 'Or', id: 'Atau' },
    connecting: { en: 'Connecting...', id: 'Menghubungkan...' }
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
    journeyRecap: { en: 'Journey Summary:', id: 'Rekap Perjalanan:' },
    allTimeFav: { en: 'Favorite Fruit of All Time', id: 'Buah Terfavorit' },
    bestScore: { en: 'Best Save Score', id: 'Skor Keberhasilan Terbaik' },
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
    madeWith: { en: 'Made with \u2764\uFE0F by Scanora Team', id: 'Dibuat dengan \u2764\uFE0F oleh Tim Scanora' },
    stats_desc: { en: 'View your fruit Journey Recap and Save Rate', id: 'Lihat rekap Perjalanan Buahmu dan Skor Keberhasilan' },
    install_pwa: { en: 'Install App (PWA)', id: 'Install Aplikasi (PWA)' },
    install_pwa_desc: { en: 'Add Scanora to Home Screen', id: 'Tambahkan Scanora ke Home Screen' },
    install_pwa_desc_modal: { en: 'Add Scanora to your home screen for a native app-like experience.', id: 'Tambahkan Scanora ke layar beranda untuk pengalaman seperti aplikasi native.' },
    member_since: { en: 'Scanora Buddy since {{date}}', id: 'Sobat Scanora sejak {{date}}' },
    back_to_home: { en: 'Back to Home', id: 'Kembali ke Beranda' }
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
