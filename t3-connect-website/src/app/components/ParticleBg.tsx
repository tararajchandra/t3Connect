'use client';

import { useEffect, useRef } from 'react';

const PARTICLES = [
  // T3 Connect - saffron/orange
  { text: 'T3 Connect', color: '#FF6B00', glow: 'rgba(255,107,0,0.9)', size: 22 },
  { text: 'T3 Connect', color: '#FF8C38', glow: 'rgba(255,140,56,0.7)', size: 14 },
  { text: 'T3 Connect', color: '#FF6B00', glow: 'rgba(255,107,0,0.6)', size: 30 },
  { text: 'T3 Connect', color: '#FF6B00', glow: 'rgba(255,107,0,0.5)', size: 11 },

  // RxDesk - green
  { text: 'RxDesk', color: '#25D366', glow: 'rgba(37,211,102,0.9)', size: 26 },
  { text: 'RxDesk', color: '#2ecc71', glow: 'rgba(46,204,113,0.7)', size: 16 },
  { text: 'RxDesk', color: '#25D366', glow: 'rgba(37,211,102,0.6)', size: 13 },
  { text: 'RxDesk', color: '#25D366', glow: 'rgba(37,211,102,0.5)', size: 32 },

  // GstRecon - cyan
  { text: 'GstRecon', color: '#00E5FF', glow: 'rgba(0,229,255,0.9)', size: 20 },
  { text: 'GstRecon', color: '#7FFFFA', glow: 'rgba(127,255,250,0.7)', size: 28 },
  { text: 'GstRecon', color: '#00E5FF', glow: 'rgba(0,229,255,0.6)', size: 15 },
  { text: 'GstRecon', color: '#00E5FF', glow: 'rgba(0,229,255,0.5)', size: 12 },

  // Hisabpro ERP - yellow/gold
  { text: 'Hisabpro ERP', color: '#FFD600', glow: 'rgba(255,214,0,0.9)', size: 20 },
  { text: 'Hisabpro ERP', color: '#FFE566', glow: 'rgba(255,229,102,0.7)', size: 14 },
  { text: 'Hisabpro ERP', color: '#FFD600', glow: 'rgba(255,214,0,0.6)', size: 26 },
  { text: 'Hisabpro ERP', color: '#FFD600', glow: 'rgba(255,214,0,0.5)', size: 11 },
];

interface ParticleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  angle: number;
  vAngle: number;
  opacityDir: number;
  index: number;
  initialized: boolean;
}

export default function ParticleBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<ParticleState[]>([]);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.offsetWidth : window.innerWidth;
      const h = parent ? parent.offsetHeight : window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      sizeRef.current = { w, h };
      return { w, h };
    };

    // Wait one frame for layout to settle, then measure
    const init = () => {
      const { w, h } = setSize();

      // Spread particles evenly in a grid-like pattern with randomness
      stateRef.current = PARTICLES.map((_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const totalRows = Math.ceil(PARTICLES.length / 4);

        // Grid-based initial position with random offset
        const baseX = (col / 4) * w + (w / 8);
        const baseY = (row / totalRows) * h + (h / (totalRows * 2));
        const jitterX = (Math.random() - 0.5) * (w / 5);
        const jitterY = (Math.random() - 0.5) * (h / (totalRows + 1));

        return {
          index: i,
          x: Math.min(Math.max(baseX + jitterX, 20), w - 20),
          y: Math.min(Math.max(baseY + jitterY, 20), h - 20),
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          opacity: Math.random() * 0.45 + 0.15,
          angle: (Math.random() - 0.5) * 0.35,
          vAngle: (Math.random() - 0.5) * 0.0015,
          opacityDir: Math.random() > 0.5 ? 1 : -1,
          initialized: true,
        };
      });
    };

    // Give DOM one frame to render before measuring
    requestAnimationFrame(() => {
      init();
    });

    const handleResize = () => {
      setSize();
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      stateRef.current.forEach((p) => {
        if (!p.initialized) return;
        const particle = PARTICLES[p.index];

        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.vAngle;

        // Fade in/out
        p.opacity += p.opacityDir * 0.004;
        if (p.opacity > 0.62 || p.opacity < 0.08) p.opacityDir *= -1;

        // Wrap around edges with margin for wide text
        const margin = 220;
        if (p.x < -margin) p.x = w + margin * 0.5;
        if (p.x > w + margin) p.x = -margin * 0.5;
        if (p.y < -40) p.y = h + 20;
        if (p.y > h + 40) p.y = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;

        ctx.shadowColor = particle.glow;
        ctx.shadowBlur = 20;

        ctx.font = `700 ${particle.size}px 'Outfit', sans-serif`;
        ctx.fillStyle = particle.color;
        ctx.fillText(particle.text, 0, 0);

        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        display: 'block',
      }}
    />
  );
}
