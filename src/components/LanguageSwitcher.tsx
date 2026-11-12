import React, { useState, useEffect, useRef } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'drawer';
  onLanguageChange?: (newLang: Language) => void;
  closeOnSelect?: () => void;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'compact',
  onLanguageChange,
  closeOnSelect,
  className = '',
}) => {
  const { language, setLanguage } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleSelect = (newLang: Language) => {
    setDropdownOpen(false);
    if (newLang !== language) {
      setLanguage(newLang);
      onLanguageChange?.(newLang);
    }
    closeOnSelect?.();
  };

  if (variant === 'drawer') {
    return (
      <div className={`flex flex-col gap-2 pb-3 border-b border-[#1C2537] ${className}`}>
        <div className="flex items-center justify-between gap-2 text-xs text-[#8C98AE]">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Globe className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
            <span className="font-medium">
              {language === 'sw' ? 'Chagua Lugha / Language' : 'Language / Lugha'}
            </span>
          </span>
          <span className="text-[10px] font-mono text-[#C5A880] whitespace-nowrap">
            {language === 'en' ? 'English Active' : 'Kiswahili Imewashwa'}
          </span>
        </div>

        <div
          className="grid grid-cols-2 gap-2 text-xs font-mono"
          role="group"
          aria-label="Language switcher"
        >
          <button
            type="button"
            onClick={() => handleSelect('en')}
            aria-pressed={language === 'en'}
            className={`py-2 px-3 rounded-lg border text-left transition-all flex items-center justify-between gap-1.5 cursor-pointer whitespace-nowrap ${
              language === 'en'
                ? 'bg-[#C5A880] text-[#0A0E17] font-bold border-[#C5A880] shadow-sm'
                : 'bg-[#121824] text-[#8C98AE] border-[#222B3D] hover:text-white hover:border-[#C5A880]/40'
            }`}
          >
            <span className="flex flex-col leading-tight">
              <span className="font-bold">English (EN)</span>
              <span
                className={`text-[10px] font-sans ${
                  language === 'en' ? 'text-[#0A0E17]/80' : 'text-[#697992]'
                }`}
              >
                Judicial Standard
              </span>
            </span>
            {language === 'en' && <Check className="w-3.5 h-3.5 shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => handleSelect('sw')}
            aria-pressed={language === 'sw'}
            className={`py-2 px-3 rounded-lg border text-left transition-all flex items-center justify-between gap-1.5 cursor-pointer whitespace-nowrap ${
              language === 'sw'
                ? 'bg-[#C5A880] text-[#0A0E17] font-bold border-[#C5A880] shadow-sm'
                : 'bg-[#121824] text-[#8C98AE] border-[#222B3D] hover:text-white hover:border-[#C5A880]/40'
            }`}
          >
            <span className="flex flex-col leading-tight">
              <span className="font-bold">Kiswahili (SW)</span>
              <span
                className={`text-[10px] font-sans ${
                  language === 'sw' ? 'text-[#0A0E17]/80' : 'text-[#697992]'
                }`}
              >
                Lugha ya Kitaifa
              </span>
            </span>
            {language === 'sw' && <Check className="w-3.5 h-3.5 shrink-0" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center shrink-0 ${className}`} ref={menuRef}>
      <div className="flex items-center p-0.5 bg-[#121824] rounded-lg border border-[#222B3D] text-[11px] font-mono shadow-inner whitespace-nowrap">
        <button
          type="button"
          onClick={() => handleSelect('en')}
          className={`px-1.5 py-1 rounded transition-all font-semibold whitespace-nowrap cursor-pointer ${
            language === 'en'
              ? 'bg-[#C5A880] text-[#0A0E17] shadow-sm font-bold'
              : 'text-[#8C98AE] hover:text-white'
          }`}
          aria-label="Switch to English (Official Court Language)"
          title="English (Official Court Language)"
          aria-pressed={language === 'en'}
        >
          EN
        </button>

        <button
          type="button"
          onClick={() => handleSelect('sw')}
          className={`px-1.5 py-1 rounded transition-all font-semibold whitespace-nowrap cursor-pointer ${
            language === 'sw'
              ? 'bg-[#C5A880] text-[#0A0E17] shadow-sm font-bold'
              : 'text-[#8C98AE] hover:text-white'
          }`}
          aria-label="Badilisha kwa Kiswahili (Lugha ya Kitaifa)"
          title="Kiswahili (Lugha ya Kitaifa)"
          aria-pressed={language === 'sw'}
        >
          SW
        </button>

        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="px-1 py-1 text-[#66768E] hover:text-white transition-colors border-l border-[#1D273B] ml-0.5 cursor-pointer"
          aria-label="Expand language options"
          aria-expanded={dropdownOpen}
          title="Language options"
        >
          <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Popover Language Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#0D131F] border border-[#C5A880]/40 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
          <div className="px-3 py-1.5 border-b border-[#1A2538] flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-[#697992]">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-[#C5A880]" />
              <span>Lugha / Language</span>
            </span>
            <span className="text-emerald-400 font-bold">LSK Cap 16</span>
          </div>

          <button
            type="button"
            onClick={() => handleSelect('en')}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors cursor-pointer ${
              language === 'en'
                ? 'bg-[#C5A880]/15 text-[#E4C999] font-semibold'
                : 'text-[#A6B4CD] hover:bg-[#151F32] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 font-mono text-xs text-[#C5A880] font-bold">EN</span>
              <div>
                <div className="font-semibold text-white">English</div>
                <div className="text-[10px] text-[#7888A0]">Official Court Language</div>
              </div>
            </div>
            {language === 'en' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => handleSelect('sw')}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors cursor-pointer ${
              language === 'sw'
                ? 'bg-[#C5A880]/15 text-[#E4C999] font-semibold'
                : 'text-[#A6B4CD] hover:bg-[#151F32] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 font-mono text-xs text-[#C5A880] font-bold">SW</span>
              <div>
                <div className="font-semibold text-white">Kiswahili</div>
                <div className="text-[10px] text-[#7888A0]">Lugha ya Kitaifa ya Jamhuri</div>
              </div>
            </div>
            {language === 'sw' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
          </button>
        </div>
      )}
    </div>
  );
};
