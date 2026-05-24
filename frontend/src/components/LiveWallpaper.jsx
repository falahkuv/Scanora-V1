/**
 * LiveWallpaper.jsx
 *
 * Animated live wallpaper for Compact mode.
 * Supports 3 themes switchable via keys 1, 2, 3:
 * 1. Emerald Aurora (Default)
 * 2. Soft Pastel + Fruits
 * 4. Soft White Clouds + Lucide Fruits
 */

import { useEffect, useRef, useState } from 'react';
import { Apple, Banana, Citrus } from 'lucide-react';

const LiveWallpaper = () => {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const [themeId, setThemeId] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '1') setThemeId(1);
      if (e.key === '2') setThemeId(2);
      if (e.key === '3') setThemeId(3);
      if (e.key === '4') setThemeId(4);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W = (canvas.width  = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    let t = 0;

    // --- Data Setup based on Theme ---
    const blobs = [
      { x: 0.15, y: 0.20, r: 0.52, speed: 0.00028, phase: 0.00 },
      { x: 0.82, y: 0.15, r: 0.45, speed: 0.00022, phase: 1.05 },
      { x: 0.50, y: 0.65, r: 0.60, speed: 0.00035, phase: 2.10 },
      { x: 0.10, y: 0.80, r: 0.38, speed: 0.00018, phase: 3.50 },
      { x: 0.90, y: 0.72, r: 0.42, speed: 0.00030, phase: 4.80 },
    ];

    const PARTICLE_COUNT = 30;
    // Store particles on the canvas element so DOM loop can access them if needed, 
    // but here we just keep them in the closure. We also need to expose them to the outer scope for refs.
    if (!canvas._particles) {
      canvas._particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     Math.random() * 3 + 1.5,
        speed: Math.random() * 0.5 + 0.15,
        drift: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.2,
        type:  Math.floor(Math.random() * 3), // for icons
        rot:   Math.random() * Math.PI * 2,
        rSpeed:(Math.random() - 0.5) * 0.02
      }));
    }
    const particles = canvas._particles;
    
    // Reset icon opacities if switching away
    if (themeId !== 4) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const el = document.getElementById(`lw-icon-${i}`);
        if (el) el.style.opacity = '0';
      }
    }

    const draw = () => {
      t++;

      if (themeId === 1) {
        // --- THEME 1: Emerald Aurora ---
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0,   'hsl(150, 60%, 8%)');
        bg.addColorStop(0.5, 'hsl(145, 55%, 10%)');
        bg.addColorStop(1,   'hsl(160, 50%, 7%)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        ctx.globalCompositeOperation = 'screen';
        blobs.forEach((b, i) => {
          const angle = b.phase + t * b.speed;
          const cx = (b.x + Math.sin(angle * 1.3) * 0.12) * W;
          const cy = (b.y + Math.cos(angle * 0.9) * 0.10) * H;
          const radius = b.r * Math.min(W, H) * 0.65;
          const hue = 140 + i * 8; // 140 to 172

          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          grad.addColorStop(0,   `hsla(${hue}, 80%, 45%, 0.28)`);
          grad.addColorStop(0.4, `hsla(${hue + 15}, 75%, 38%, 0.14)`);
          grad.addColorStop(1,   `hsla(${hue}, 70%, 30%, 0.00)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.globalCompositeOperation = 'source-over';
        particles.forEach((p) => {
          p.y -= p.speed;
          p.x += p.drift;
          if (p.y + p.r < 0) { p.y = H + p.r; p.x = Math.random() * W; }
          if (p.x < -p.r) p.x = W + p.r;
          if (p.x > W + p.r) p.x = -p.r;

          const pulse = 0.7 + 0.3 * Math.sin(t * 0.03 + p.alpha * 10);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(150, 85%, 70%, ${p.alpha * pulse})`;
          ctx.fill();
        });

        const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.9);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';

      } else if (themeId === 2) {
        // --- THEME 2: Soft Pastel + Fruits ---
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0,   '#fef3c7'); // yellow-100
        bg.addColorStop(0.5, '#ffedd5'); // orange-100
        bg.addColorStop(1,   '#d1fae5'); // green-100
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        ctx.globalCompositeOperation = 'multiply';
        blobs.forEach((b, i) => {
          const angle = b.phase + t * b.speed;
          const cx = (b.x + Math.sin(angle * 1.3) * 0.12) * W;
          const cy = (b.y + Math.cos(angle * 0.9) * 0.10) * H;
          const radius = b.r * Math.min(W, H) * 0.65;
          const hue = i % 2 === 0 ? 30 : 100; // Orange or green tint

          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          grad.addColorStop(0,   `hsla(${hue}, 80%, 85%, 0.5)`);
          grad.addColorStop(1,   `hsla(${hue}, 70%, 95%, 0.00)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.globalCompositeOperation = 'source-over';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const icons = ['🍊', '🍎', '🍌', '🍋'];
        particles.forEach((p) => {
          p.y -= p.speed * 0.8;
          p.x += p.drift * 1.5;
          p.rot += p.rSpeed;
          if (p.y + 30 < 0) { p.y = H + 30; p.x = Math.random() * W; }
          if (p.x < -30) p.x = W + 30;
          if (p.x > W + 30) p.x = -30;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = p.alpha * 0.6 + 0.1; // soft opacity
          ctx.fillText(icons[p.type % icons.length], 0, 0);
          ctx.restore();
        });

      } else if (themeId === 3) {
        // --- THEME 3: Nature Leaves ---
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0,   '#f0fdf4'); // green-50
        bg.addColorStop(1,   '#dcfce7'); // green-100
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        ctx.globalCompositeOperation = 'multiply';
        blobs.forEach((b) => {
          const angle = b.phase + t * b.speed * 0.5;
          const cx = (b.x + Math.sin(angle * 1.3) * 0.12) * W;
          const cy = (b.y + Math.cos(angle * 0.9) * 0.10) * H;
          const radius = b.r * Math.min(W, H) * 0.5;

          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          grad.addColorStop(0,   `rgba(134, 239, 172, 0.4)`); // green-300
          grad.addColorStop(1,   `rgba(220, 252, 231, 0.0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.globalCompositeOperation = 'source-over';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        particles.forEach((p) => {
          p.y += p.speed * 1.2; // leaves fall down
          p.x += Math.sin(t * 0.02 + p.phase) * 1.5;
          p.rot += p.rSpeed * 2;
          if (p.y - 30 > H) { p.y = -30; p.x = Math.random() * W; }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = p.alpha * 0.7;
          ctx.fillStyle = '#4ade80'; // green-400
          
          // Draw simple leaf shape
          ctx.beginPath();
          ctx.ellipse(0, 0, 6, 12, 0, 0, Math.PI*2);
          ctx.fill();
          ctx.restore();
        });

      } else if (themeId === 4) {
        // --- THEME 4: Cloudy White + Static Pattern ---
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0,   '#dcfce7'); // green-100
        bg.addColorStop(1,   '#bbf7d0'); // green-200
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        ctx.globalCompositeOperation = 'source-over';
        // Draw soft clouds
        blobs.forEach((b) => {
          const angle = b.phase + t * b.speed * 0.2; // very slow
          const cx = (b.x + Math.sin(angle * 1.3) * 0.15) * W;
          const cy = (b.y + Math.cos(angle * 0.9) * 0.12) * H;
          const radius = b.r * Math.min(W, H) * 0.8;

          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          grad.addColorStop(0,   `rgba(241, 245, 249, 0.6)`); // slate-100
          grad.addColorStop(1,   `rgba(255, 255, 255, 0.0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [themeId]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full transition-opacity duration-1000"
        style={{ zIndex: 0, display: 'block' }}
        aria-hidden="true"
      />
      {/* Theme 4 DOM Overlay (Static Pattern) */}
      <div className={`fixed inset-0 pointer-events-none overflow-hidden transition-opacity duration-700 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-y-16 gap-x-8 p-4 justify-items-center items-center ${themeId === 4 ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}>
        {Array.from({ length: 60 }).map((_, i) => {
          const IconComponent = [Apple, Banana, Citrus][i % 3];
          const colorClass = ['text-red-main', 'text-yellow-main', 'text-orange-main'][i % 3];
          return (
            <div
              key={i}
              className={`${colorClass} opacity-[0.15]`}
              style={{ transform: i % 2 === 0 ? 'translateY(40px)' : 'none' }}
            >
              <IconComponent size={56} strokeWidth={1.5} />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default LiveWallpaper;
