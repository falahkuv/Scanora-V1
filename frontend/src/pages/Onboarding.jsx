import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ACCENT_COLOR = '#17b341';
const TEXT_MUTED = '#7a7a7a';
const DOT_INACTIVE = '#d8d8d8';
const BG_TOP = '#FAFAFA';
const BG_BOTTOM = '#FAFAFA';
const CARD_BASE = '#f3f3f3';
const CARD_ACCENT = '#e1ead8';
  const CARD_BG = '#FFF5E5';

const slides = [
  {
    title: 'Scan kualitas\nbuahmu dengan\nmudah',
    highlight: 'segar',
    tail: '',
    body: 'Cek tingkat kematangan buahmu dengan cepat dan akurat dengan bantuan AI',
    hasCard: true,
    image: '/images/obd1.png',
  },
  {
    title: 'Tau mana yang\nmasih segar',
    highlight: 'pintar',
    tail: '',
    body: 'Scanora membantu mendeteksi buah yang belum matang, siap dimakan, atau mulai membusuk.',
    hasCard: true,
    image: '/images/obd2.png',
  },
  {
    title: 'Atur stok\nbuahmu lebih pintar',
    highlight: 'Scanora',
    tail: '',
    body: 'Simpan hasil scan ke inventori, dan dapatkan pengingat sebelum buahmu terbuang sia-sia.',
    hasCard: true,
    image: '/images/obd3.png',
  },
  {
    title: 'Yuk pantau kualitas\nbuahmu dengan\nscanora',
    highlight: '',
    tail: '',
    body: '',
    hasCard: false,
  },
];

const Onboarding = () => {
  const [index, setIndex] = useState(0);
  const [hasSwiped, setHasSwiped] = useState(false);
  const navigate = useNavigate();
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  const handleNext = () => {
    if (index < slides.length - 1) {
      setIndex((prev) => prev + 1);
      setHasSwiped(true);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={
          isLast
            ? {
                backgroundImage: "url('/images/obd4.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center 140%',
              }
            : {
                background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_BOTTOM} 100%)`,
              }
        }
      />

      <div className="relative z-10 px-6 pt-7" />

      {isLast ? (
        <>
          <div
            className="absolute inset-x-0 bottom-0 h-[62%]"
            style={{ transform: 'translateY(-8%)' }}
          >
            <svg viewBox="0 0 375 220" preserveAspectRatio="none" className="w-full h-full">
              <path
                d="M0,130 C90,90 285,90 375,130 L375,220 L0,220 Z"
                fill="#FAFAFA"
              />
            </svg>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[22%] bg-white" />

          <div className="relative z-10 flex-1 flex flex-col items-center justify-end px-6 pb-16 text-center">
            <h1 className="text-[28px] font-extrabold text-gray-900 leading-tight whitespace-pre-line">
              {slide.title}
            </h1>
            <button
              onClick={() => navigate('/login')}
              className="mt-10 w-full min-h-[52px] rounded-2xl font-bold text-white active:scale-95 transition-all font-sans"
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              Get Started!
            </button>
          </div>
        </>
      ) : (
        <div className="relative z-10 flex-1 flex flex-col items-center px-6 pb-16">
          <div className="w-full mt-6">
            <div
              className="relative w-full h-[330px] rounded-[28px] overflow-hidden border border-gray-100"
              style={{ backgroundColor: CARD_BG }}
            >
              {slide.image ? (
                <img
                  src={slide.image}
                  alt="Onboarding"
                  className="relative w-full h-full object-cover"
                />
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 rounded-full transition-all"
                style={{
                  backgroundColor: i === index ? ACCENT_COLOR : DOT_INACTIVE,
                  width: i === index ? '16px' : '8px'
                }}
              />
            ))}
          </div>

          <div className="flex-[0.4]" />

          <div
            key={index}
            className={`text-center max-w-[280px] ${hasSwiped ? 'animate-swipe-swap' : ''}`}
          >
            <h1 className="text-[30px] font-extrabold text-black leading-tight whitespace-pre-line">
              {slide.title}
              {slide.tail}
            </h1>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>
              {slide.body}
            </p>
          </div>

          <button
            onClick={handleNext}
            className="mt-auto w-full min-h-[52px] rounded-2xl font-bold text-white active:scale-95 transition-all font-sans"
            style={{ backgroundColor: ACCENT_COLOR }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
