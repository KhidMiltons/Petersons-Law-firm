import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, ThemePreference, ResolvedTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'segmented';
  onThemeChange?: (nextResolved: ResolvedTheme) => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'compact',
  onThemeChange,
  className = '',
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const { language } = useLanguage();

  const handleSetTheme = (pref: ThemePreference) => {
    setTheme(pref);
    if (pref === 'light' || pref === 'dark') {
      onThemeChange?.(pref);
    }
  };

  const handleToggle = () => {
    const nextResolved: ResolvedTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    toggleTheme();
    onThemeChange?.(nextResolved);
  };

  if (variant === 'segmented') {
    const options: { id: ThemePreference; label: string; title: string; icon: React.ReactNode }[] = [
      {
        id: 'dark',
        label: language === 'sw' ? 'Giza' : 'Dark',
        title: 'Default Dark Theme (Chambers Obsidian)',
        icon: <Moon className="w-3.5 h-3.5 shrink-0" />,
      },
      {
        id: 'light',
        label: language === 'sw' ? 'Ngozi' : 'Parchment',
        title: 'Luxury Parchment Light Theme',
        icon: <Sun className="w-3.5 h-3.5 shrink-0" />,
      },
      {
        id: 'system',
        label: 'Auto',
        title: 'Follow System Preference',
        icon: <Monitor className="w-3.5 h-3.5 shrink-0" />,
      },
    ];

    return (
      <div
        className={`flex items-center p-0.5 rounded-lg border border-[#222B3D] dark:border-[#222B3D] bg-[#121824] dark:bg-[#121824] text-[11px] font-mono shadow-inner ${className}`}
        role="group"
        aria-label="Select display theme"
      >
        {options.map((opt) => {
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSetTheme(opt.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md transition-all font-semibold whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white dark:text-[#8C98AE] dark:hover:text-white'
              }`}
              title={opt.title}
              aria-label={opt.title}
              aria-pressed={isActive}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default: 'compact' (Dedicated Header toggle between Luxury Parchment Light Theme & Default Dark Theme)
  const isDark = resolvedTheme === 'dark';
  const actionLabel = isDark
    ? language === 'sw'
      ? 'Badilisha hadi Mandhari ya Luxury Parchment (Mwanga)'
      : 'Switch to Luxury Parchment Light Theme'
    : language === 'sw'
      ? 'Badilisha hadi Mandhari ya Giza (Chambers Obsidian)'
      : 'Switch to Default Dark Theme (Chambers Obsidian)';

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative p-1.5 sm:p-2 rounded-lg bg-[#121824] hover:bg-[#1A2334] border border-[#222B3D] hover:border-[#C5A880]/60 text-xs transition-all duration-300 group cursor-pointer shrink-0 shadow-sm ${className}`}
      title={actionLabel}
      aria-label={actionLabel}
      aria-pressed={!isDark}
    >
      <div className="relative w-4 h-4 flex items-center justify-center overflow-hidden">
        {/* Sun Icon (Luxury Parchment active) */}
        <Sun
          className={`w-4 h-4 text-[#C5A880] group-hover:scale-110 transition-all duration-300 absolute ${
            isDark
              ? 'opacity-0 rotate-90 scale-50 pointer-events-none'
              : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        {/* Moon Icon (Chambers Obsidian Dark active) */}
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
