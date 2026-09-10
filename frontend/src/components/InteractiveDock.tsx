import React, { useState } from 'react';
import { 
  Home, 
  Sliders, 
  Activity, 
  MessageSquare, 
  FileText, 
  User, 
  Sun, 
  Moon,
  Lock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface InteractiveDockProps {
  currentView: 'landing' | 'dashboard';
  onNavigate: (view: 'landing' | 'dashboard') => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onExportPDF?: () => void;
  user: any | null;
}

export const InteractiveDock: React.FC<InteractiveDockProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onExportPDF,
  user
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const dockItems = [
    {
      id: 'home',
      label: 'Landing Home',
      icon: Home,
      action: () => onNavigate('landing'),
      active: currentView === 'landing'
    },
    {
      id: 'dashboard',
      label: 'Vitals Command',
      icon: Sliders,
      action: () => onNavigate('dashboard'),
      active: currentView === 'dashboard'
    },
    {
      id: 'diagnostics',
      label: 'AI Risk Stratification',
      icon: Activity,
      action: () => onNavigate('dashboard'),
      active: false
    },
    {
      id: 'chat',
      label: 'Context AI Assistant',
      icon: MessageSquare,
      action: () => onNavigate('dashboard'),
      active: false
    },
    {
      id: 'pdf',
      label: 'Export PDF Report',
      icon: FileText,
      action: () => {
        if (!user) {
          onOpenAuth('login');
        } else if (onExportPDF) {
          onExportPDF();
        }
      },
      active: false
    },
    {
      id: 'theme',
      label: isDark ? 'Light Theme' : 'Dark Theme',
      icon: isDark ? Sun : Moon,
      action: toggleTheme,
      active: false
    },
    {
      id: 'account',
      label: user ? user.name.split(' ')[0] : 'Sign In / Register',
      icon: user ? User : Lock,
      action: () => {
        if (!user) {
          onOpenAuth('login');
        } else {
          onNavigate('dashboard');
        }
      },
      active: !!user
    }
  ];

  return (
    <aside aria-label="Quick Actions Navigation" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div 
        className={`flex items-center space-x-2 sm:space-x-3 px-4 py-2.5 rounded-full border shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          isDark 
            ? 'bg-slate-950/85 border-slate-800/80 shadow-slate-950/80 text-slate-200' 
            : 'bg-[#FAF7F2]/90 border-[#E5DDD2] shadow-stone-400/30 text-[#2B2723]'
        }`}
      >
        {dockItems.map((item, idx) => {
          const Icon = item.icon;
          const isHovered = hoveredIdx === idx;
          const isNeighbor = hoveredIdx !== null && Math.abs(hoveredIdx - idx) === 1;

          let scaleClass = 'scale-100';
          if (isHovered) scaleClass = 'scale-125 -translate-y-2';
          else if (isNeighbor) scaleClass = 'scale-110 -translate-y-1';

          return (
            <div key={item.id} className="relative group">
              <button
                onClick={item.action}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`p-2.5 sm:p-3 rounded-full border transition-all duration-300 transform cursor-pointer flex items-center justify-center ${scaleClass} ${
                  item.active
                    ? isDark 
                      ? 'bg-teal-500/20 border-teal-500/40 text-teal-300 shadow-md shadow-teal-500/20' 
                      : 'bg-[#C99A68]/20 border-[#C99A68]/40 text-[#C99A68] shadow-md shadow-[#C99A68]/20'
                    : isDark 
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800' 
                      : 'bg-white border-[#E8E2D9] text-stone-500 hover:text-stone-900 hover:bg-[#F5F0E8]'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Tooltip Label */}
              <div 
                className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-200 ${
                  isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                <span 
                  className={`px-3 py-1 text-[11px] font-extrabold whitespace-nowrap rounded-xl border shadow-lg ${
                    isDark 
                      ? 'bg-slate-900 border-slate-700 text-slate-100' 
                      : 'bg-white border-[#E5DDD2] text-[#2B2723]'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
