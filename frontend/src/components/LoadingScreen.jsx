import { useEffect, useState } from 'react';
import { Apple, Banana, Citrus } from 'lucide-react';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress dinamis
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90; // berhenti di 90%, sisanya diisi ketika auth selesai
        }
        // Percepat di awal, perlambat di akhir
        const increment = prev < 50 ? Math.random() * 8 + 4 : Math.random() * 3 + 1;
        return Math.min(90, prev + increment);
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-scanora-dark via-[#065f46] to-scanora-green overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 left-[-60px] w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-12 w-full">
        {/* Logo */}
        <div className="relative">
          <div className="w-28 h-28 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl shadow-black/40">
            <img
              src="/logo-square.png"
              alt="Scanora"
              className="w-20 h-20 object-contain drop-shadow-lg animate-[pulse_2s_ease-in-out_infinite]"
            />
          </div>
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-3xl border-2 border-white/30 animate-[ping_2s_ease-out_infinite] opacity-20" />
        </div>

        {/* App name + tagline */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
            Scanora
          </h1>
          <p className="text-white/70 text-sm mt-1.5 font-medium">
            Choose Better, Waste Less
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-full max-w-[260px]">
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(255,255,255,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/50 text-xs text-center mt-2.5 font-medium">
            Menyiapkan sesi...
          </p>
        </div>
      </div>

      {/* Footer — 3 bouncing fruits */}
      <div className="pb-14 flex items-end gap-6">
        {/* Apple — merah */}
        <div
          className="flex flex-col items-center gap-1.5"
          style={{ animation: 'bounce-fruit 1.2s ease-in-out infinite', animationDelay: '0ms' }}
        >
          <Apple
            size={36}
            className="text-red-main drop-shadow-lg"
            strokeWidth={1.5}
          />
          <div className="w-8 h-1 bg-black/20 rounded-full blur-sm" />
        </div>

        {/* Banana — kuning */}
        <div
          className="flex flex-col items-center gap-1.5"
          style={{ animation: 'bounce-fruit 1.2s ease-in-out infinite', animationDelay: '200ms' }}
        >
          <Banana
            size={36}
            className="text-yellow-main drop-shadow-lg"
            strokeWidth={1.5}
          />
          <div className="w-8 h-1 bg-black/20 rounded-full blur-sm" />
        </div>

        {/* Citrus — oranye */}
        <div
          className="flex flex-col items-center gap-1.5"
          style={{ animation: 'bounce-fruit 1.2s ease-in-out infinite', animationDelay: '400ms' }}
        >
          <Citrus
            size={36}
            className="text-orange-main drop-shadow-lg -scale-x-100"
            strokeWidth={1.5}
          />
          <div className="w-8 h-1 bg-black/20 rounded-full blur-sm" />
        </div>
      </div>

      {/* Keyframe injected via style tag */}
      <style>{`
        @keyframes bounce-fruit {
          0%, 100% { transform: translateY(0px); }
          40%       { transform: translateY(-18px); }
          60%       { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
