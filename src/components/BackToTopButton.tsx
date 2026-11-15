import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useReadingProgress } from '../context/ReadingProgressContext';

export const BackToTopButton: React.FC = () => {
  const { language } = useLanguage();
  const { resolvedTheme } = useTheme();
  const { isLongFormActive } = useReadingProgress();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkScrollPastHero = () => {
      const heroEl = document.getElementById('hero');
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        setIsVisible(rect.bottom <= 96);
      } else {
        setIsVisible(window.scrollY > 640);
      }
    };

    checkScrollPastHero();
    window.addEventListener('scroll', checkScrollPastHero, { passive: true });
    window.addEventListener('resize', checkScrollPastHero, { passive: true });
    return () => {
      window.removeEventListener('scroll', checkScrollPastHero);
      window.removeEventListener('resize', checkScrollPastHero);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  const isLight = resolvedTheme === 'light';
  const label = language === 'sw' ? 'Rudi Juu' : 'Back to Top';

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      aria-label={label}
      title={label}
      className={`no-print fixed right-4 lg:right-6 z-40 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full border backdrop-blur-md transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 active:scale-95 ${
        isLongFormActive ? 'bottom-16' : 'bottom-5'
      } ${
        isLight
          ? 'bg-[#FFFFFF]/95 text-[#121A28] border-[#C5A880]/70 hover:border-[#8C6B32] shadow-[0_10px_28px_rgba(18,26,40,0.14)] hover:shadow-[0_12px_30px_rgba(197,168,128,0.28)]'
          : 'bg-[#0D131F]/95 text-[#E4C999] border-[#C5A880]/55 hover:border-[#DFBE82] hover:text-white shadow-[0_10px_28px_rgba(0,0,0,0.55)] hover:shadow-[0_12px_30px_rgba(197,168,128,0.25)]'
      }`}
    >
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${
          isLight
            ? 'bg-[#F1ECE1] text-[#8C6B32] group-hover:bg-[#C5A880] group-hover:text-[#0A0E17]'
            : 'bg-[#C5A880]/15 text-[#C5A880] group-hover:bg-[#C5A880] group-hover:text-[#0A0E17]'
        }`}
      >
        <ArrowUp className="w-3.5 h-3.5 stroke-[2.25]" />
      </span>
      <span className="hidden sm:inline font-mono text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">
        {label}
      </span>
    </button>
  );
};
