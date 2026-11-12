import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, ThemePreference } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'compact',
  className = '' 
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'segmented') {
    const options: { id: ThemePreference; label: string; icon: React.ReactNode }[] = [
      { id: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
      { id: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
      { id: 'system', label: 'Auto', icon: <Monitor className="w-3.5 h-3.5" /> },
    ];

    return (
      <div className={`flex items-center p-0.5 rounded-lg border border-[#222B3D] dark:border-[#222B3D] bg-[#121824] dark:bg-[#121824] text-[11px] font-mono shadow-inner ${className}`}>
        {options.map((opt) => {
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all font-semibold cursor-pointer ${
                isActive
                  ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white dark:text-[#8C98AE] dark:hover:text-white'
              }`}
              title={`Select ${opt.label} Mode`}
              aria-label={`Select ${opt.label} Mode`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default: 'compact' (Header button with smooth rotation & glowing accents)
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-1.5 sm:p-2 rounded-lg bg-[#121824] hover:bg-[#1A2334] border border-[#222B3D] hover:border-[#C5A880]/60 text-xs transition-all duration-300 group cursor-pointer shrink-0 shadow-sm ${className}`}
      title={isDark ? 'Switch to Light Mode (Parchment & Ivory)' : 'Switch to Dark Mode (Chambers Obsidian)'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-pressed={!isDark}
    >
      <div className="relative w-4 h-4 flex items-center justify-center overflow-hidden">
        {/* Sun Icon (Rotates and scales in light mode) */}
        <Sun
          className={`w-4 h-4 text-[#C5A880] group-hover:scale-110 transition-all duration-300 absolute ${
            isDark 
              ? 'opacity-0 rotate-90 scale-50 pointer-events-none' 
              : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        {/* Moon Icon (Rotates and scales in dark mode) */}
        <Moon
          className={`w-4 h-4 text-[#C5A880] group-hover:scale-110 transition-all duration-300 absolute ${
            isDark 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-50 pointer-events-none'
          }`}
        />
      </div>
    </button>
  );
};
