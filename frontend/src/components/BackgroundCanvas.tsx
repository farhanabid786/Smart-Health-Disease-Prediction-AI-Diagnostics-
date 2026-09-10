import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export const BackgroundCanvas: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle splash cursor system
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
    }

    const particles: Particle[] = [];
    const colors = isDark 
      ? ['#14B8A6', '#6366F1', '#38BDF8', '#818CF8'] 
      : ['#C99A68', '#0D9488', '#E11D48', '#D97706'];

    const handleMouseMove = (e: MouseEvent) => {
      // Spawn 2-3 particles on cursor move
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.6,
          decay: Math.random() * 0.02 + 0.015,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render and update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 1. Shape Grid Overlay */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${
        isDark ? 'bg-grid-dark opacity-40' : 'bg-grid-light opacity-60'
      }`} />

      {/* 2. Liquid Chrome Glowing Fluid Orbs */}
      <div 
        className={`liquid-chrome-orb-1 absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-3xl opacity-30 transition-all duration-700 ${
          isDark 
            ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600' 
            : 'bg-gradient-to-r from-[#C99A68] via-amber-300 to-teal-400'
        }`}
      />

      <div 
        className={`liquid-chrome-orb-2 absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full blur-3xl opacity-25 transition-all duration-700 ${
          isDark 
            ? 'bg-gradient-to-tr from-indigo-600 via-teal-400 to-emerald-500' 
            : 'bg-gradient-to-tr from-rose-300 via-[#C99A68] to-emerald-400'
        }`}
      />

      {/* 3. Interactive Mouse Splash Particles Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  );
};
