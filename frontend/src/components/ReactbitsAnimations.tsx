import React, { useEffect, useRef, useState } from 'react';

// --- Reactbits: ShinyText Component ---
interface ShinyTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export const ShinyText: React.FC<ShinyTextProps> = ({ text, className = '', speed = 5 }) => {
  return (
    <span
      className={`relative inline-block overflow-hidden bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-white to-indigo-400 animate-shiny-text ${className}`}
      style={{
        backgroundSize: '200% 100%',
        animationDuration: `${speed}s`,
      }}
    >
      {text}
    </span>
  );
};

// --- Reactbits: SplitText Component ---
interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  cursiveAccent?: string;
}

export const SplitText: React.FC<SplitTextProps> = ({ 
  text, 
  className = '', 
  delay = 50,
  cursiveAccent 
}) => {
  const words = text.split(' ');

  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, wIdx) => (
        <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split('').map((char, cIdx) => (
            <span
              key={cIdx}
              className="inline-block transition-all duration-500 transform hover:-translate-y-1.5 hover:scale-110 hover:text-teal-400 cursor-default"
              style={{
                animation: `reactbitsFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                animationDelay: `${(wIdx * 4 + cIdx) * delay}ms`,
              }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
      {cursiveAccent && (
        <span 
          className="block font-cursive text-teal-400 text-3xl sm:text-4xl font-normal mt-2 italic animate-pulse"
          style={{ animationDuration: '3s' }}
        >
          {cursiveAccent}
        </span>
      )}
    </span>
  );
};

// --- Reactbits: TrueFocusCard (Spotlight Focus Ring & Tilt) ---
interface TrueFocusCardProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
}

export const TrueFocusCard: React.FC<TrueFocusCardProps> = ({ 
  children, 
  className = '',
  borderColor = 'rgba(20, 184, 166, 0.4)' 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-3xl transition-transform duration-300 transform hover:-translate-y-1.5 ${className}`}
    >
      {/* Reactbits Focus Radial Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(500px circle at ${position.x}px ${position.y}px, ${borderColor}, transparent 80%)`,
        }}
      />
      
      {/* Corner Focus Light Beam */}
      <div 
        className="pointer-events-none absolute inset-0 rounded-3xl border border-teal-500/20 transition-all duration-300" 
        style={{
          boxShadow: opacity ? `0 0 25px ${borderColor}` : 'none'
        }}
      />

      {children}
    </div>
  );
};

// --- Reactbits: NeuralNodeNetwork (Interactive Particle Web) ---
export const NeuralNodeNetwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const nodes = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2.5 + 1.5,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.save();
            ctx.strokeStyle = `rgba(20, 184, 166, ${0.25 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // Draw and move nodes
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.save();
        ctx.fillStyle = '#14B8A6';
        ctx.shadowColor = '#14B8A6';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 block w-full h-full opacity-60" />;
};
