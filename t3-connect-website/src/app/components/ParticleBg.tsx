'use client';

import { useEffect, useRef } from 'react';

const PARTICLES = [
  // T3 Connect - saffron/orange
  { text: 'T3 Connect', color: '#FF6B00', glow: 'rgba(255,107,0,0.8)', size: 22 },
  { text: 'T3 Connect', color: '#FF8C38', glow: 'rgba(255,140,56,0.6)', size: 14 },
  { text: 'T3 Connect', color: '#FF6B00', glow: 'rgba(255,107,0,0.5)', size: 32 },
  { text: 'T3 Connect', color: '#FF6B00', glow: 'rgba(255,107,0,0.4)', size: 11 },

  // RxDesk - green
  { text: 'RxDesk', color: '#25D366', glow: 'rgba(37,211,102,0.8)', size: 26 },
  { text: 'RxDesk', color: '#2ecc71', glow: 'rgba(46,204,113,0.6)', size: 16 },
  { text: 'RxDesk', color: '#25D366', glow: 'rgba(37,211,102,0.5)', size: 13 },
  { text: 'RxDesk', color: '#25D366', glow: 'rgba(37,211,102,0.4)', size: 34 },

  // GstRecon - cyan
  { text: 'GstRecon', color: '#00E5FF', glow: 'rgba(0,229,255,0.8)', size: 20 },
  { text: 'GstRecon', color: '#7FFFFA', glow: 'rgba(127,255,250,0.6)', size: 30 },
  { text: 'GstRecon', color: '#00E5FF', glow: 'rgba(0,229,255,0.5)', size: 15 },
  { text: 'GstRecon', color: '#00E5FF', glow: 'rgba(0,229,255,0.4)', size: 12 },

  // Hisabpro ERP - yellow/gold
  { text: 'Hisabpro ERP', color: '#FFD600', glow: 'rgba(255,214,0,0.8)', size: 18 },
  { text: 'Hisabpro ERP', color: '#FFE566', glow: 'rgba(255,229,102,0.6)', size: 28 },
  { text: 'Hisabpro ERP', color: '#FFD600', glow: 'rgba(255,214,0,0.5)', size: 13 },
  { text: 'Hisabpro ERP', color: '#FFD600', glow: 'rgba(255,214,0,0.4)', size: 36 },
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
}

export default function ParticleBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<ParticleState[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    stateRef.current = PARTICLES.map((_, i) => ({
      index: i,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.1,
      angle: (Math.random() - 0.5) * 0.4,
      vAngle: (Math.random() - 0.5) * 0.002,
      opacityDir: Math.random() > 0.5 ? 1 : -1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stateRef.current.forEach((p) => {
        const particle = PARTICLES[p.index];

        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.vAngle;

        // Fade in/out
        p.opacity += p.opacityDir * 0.003;
        if (p.opacity > 0.65 || p.opacity < 0.06) p.opacityDir *= -1;

        // Wrap around edges
        if (p.x < -200) p.x = canvas.width + 100;
        if (p.x > canvas.width + 200) p.x = -100;
        if (p.y < -60) p.y = canvas.height + 30;
        if (p.y > canvas.height + 60) p.y = -30;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;

        // Glow effect
        ctx.shadowColor = particle.glow;
        ctx.shadowBlur = 18;

        ctx.font = `${particle.size}px 'Outfit', sans-serif`;
        ctx.fontWeight = '700';
        ctx.fillStyle = particle.color;
        ctx.fillText(particle.text, 0, 0);

        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
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
      }}
    />
  );
}
