import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';

const ACCENT_COLOR = '#7FB77E';
const ACCENT_SHADOW = 'rgba(185,233,55,0.28)';
const MAIN_COLOR = '#437057';
const GRAY_COLOR = '#828282';

const slides = [
  {
    lead: 'Scan buahmu\n',
    pre: 'dengan ',
    highlight: 'mudah',
    trail: '',
    body: 'Cek tingkat kematangan buah hanya dalam beberapa detik dengan bantuan AI.',
  },
  {
    lead: 'Dapatkan hasil\n',
    pre: 'cepat dan\n',
    highlight: 'akurat',
    trail: '',
    body: 'AI kami akan menganalisis kondisi buah dan memberikan hasil secara instan.',
  },
  {
    lead: 'Rawat buahmu\n lebih ',
    pre: '',
    highlight: 'baik',
    trail: '\nsetiap hari',
    body: 'Dapatkan tips perawatan buah yang personal dan pantau kesegarannya setiap saat.',
  },
];

const waveShapes = [
  'M0,18 C35,10 75,30 115,54 C175,88 255,96 375,92 L375,220 L0,220 Z',
  'M0,90 C80,90 140,56 188,32 C236,56 296,90 375,90 L375,220 L0,220 Z',
  'M0,92 C120,96 200,88 260,54 C300,30 340,10 375,18 L375,220 L0,220 Z',
];

const Onboarding = () => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const slide = slides[index];

  const handleNext = () => {
    if (index < slides.length - 1) {
      setIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-[#eef6d2]" />

      <div className="relative z-10 px-6 pt-7 flex items-center justify-between">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-20 rounded-full transition-colors ${i === index ? '' : 'bg-gray-200'}`}
              style={i === index ? { backgroundColor: ACCENT_COLOR } : undefined}
            />
          ))}
        </div>
        <button
          onClick={() => navigate('/login')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 active:scale-95 transition-all"
          aria-label="Tutup onboarding"
        >
          <X size={22} />
        </button>
      </div>

      <div className="relative z-10 flex-1 px-6 pt-12">
        <div key={index} className="animate-page-in">
          <h1 className="text-[36px] font-extrabold text-gray-900 leading-[1.1] whitespace-pre-line">
            {slide.lead}
            {slide.pre}
            <span style={{ color: ACCENT_COLOR }}>{slide.highlight}</span>
            {slide.trail}
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed max-w-[260px]" style={{ color: GRAY_COLOR }}>
            {slide.body}
          </p>
        </div>
      </div>

      <div className="relative z-10 px-6 pb-12">
        {index < slides.length - 1 ? (
          <div className="flex items-center justify-center">
            <button
              onClick={handleNext}
              className="w-14 h-14 rounded-full bg-white text-xl font-bold flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 active:scale-90 active:rotate-6 animate-floaty"
              style={{ color: ACCENT_COLOR }}
              aria-label="Lanjut"
            >
              <ArrowRight size={24} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full min-h-[52px] bg-white rounded-full font-bold text-lg active:scale-95 transition-all animate-floaty"
              style={{ color: ACCENT_COLOR }}
            >
              mulai sekarang
            </button>
            <p className="text-xs text-white">
              <button
                onClick={() => navigate('/login')}
                className="font-bold text-white"
              >
                masuk
              </button>{' '}
              atau{' '}
              <button
                onClick={() => navigate('/register')}
                className="font-bold text-white"
              >
                daftar
              </button>{' '}
              untuk melanjutkan
            </p>
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[45%] pointer-events-none">
        <svg viewBox="0 0 375 220" preserveAspectRatio="none" className="w-full h-full">
          <path
            d={waveShapes[index]}
            fill={MAIN_COLOR}
          />
        </svg>
      </div>
    </div>
  );
};

export default Onboarding;
