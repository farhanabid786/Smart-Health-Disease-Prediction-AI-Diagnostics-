import React, { useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor,
  ...props
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  const defaultSpotlight = isDark 
    ? 'rgba(20, 184, 166, 0.15)' 
    : 'rgba(201, 154, 104, 0.20)';

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${
        isDark 
          ? 'bg-slate-900/70 border-slate-800 text-slate-100 shadow-xl' 
          : 'bg-white/95 border-[#E5DDD2] text-[#2B2723] shadow-stone-300/40'
      } ${className}`}
      {...props}
    >
      {/* Dynamic Radial Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${
            spotlightColor || defaultSpotlight
          }, transparent 40%)`,
        }}
      />

      {/* Card Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
