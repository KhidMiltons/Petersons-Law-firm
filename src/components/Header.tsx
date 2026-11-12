import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Search, ShieldCheck, Lock, Sun, BookOpen } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';
import { useReadingProgress } from '../context/ReadingProgressContext';
import { GlobalTimeClock } from './GlobalTimeClock';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  onOpenConsultation: () => void;
  onOpenVault: () => void;
  onOpenSearch: () => void;
  onOpenPortal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenConsultation, 
  onOpenVault, 
  onOpenSearch,
  onOpenPortal
}) => {
  const { language, t } = useLanguage();
  const { 
    progress: longFormProgress, 
    isLongFormActive, 
    sourceType, 
    readingMetrics 
  } = useReadingProgress();

  const [isScrolled, setIsScrolled] = useState(false);
  const [pageScrollProgress, setPageScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langToast, setLangToast] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Track scroll progress through the entire long-form page content
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (height > 0) {
        const scrolled = (winScroll / height) * 100;
        setPageScrollProgress(Math.min(100, Math.max(0, scrolled)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use long-form progress if reading long-form content, otherwise general page scroll
  const activeProgress = isLongFormActive ? longFormProgress : pageScrollProgress;

  // Automatically close the mobile drawer at xl (>= 1280px) or on Escape key press
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const showLanguageNotice = (newLang: Language) => {
    const notice = newLang === 'en'
      ? 'Language set to English (Official Judicial Language)'
      : 'Lugha imebadilishwa kuwa Kiswahili (Lugha ya Kitaifa ya Jamhuri)';
    setLangToast(notice);
    setTimeout(() => setLangToast(null), 3500);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full max-w-full overflow-x-clip transition-all duration-300">
      {/* Subtle Progress Bar at the Very Top of the Browser Window */}
      <div 
        className="w-full h-[2.5px] sm:h-[3px] bg-[#0A0E17]/90 overflow-hidden relative"
        role="progressbar"
        aria-valuenow={Math.round(activeProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading and scroll progress indicator"
      >
        <div
          className={`h-full transition-all duration-100 ease-out relative ${
            isLongFormActive
              ? 'bg-gradient-to-r from-[#DFBE82] via-[#C5A880] to-[#FFF0D4] shadow-[0_0_12px_rgba(223,190,130,0.95)]'
              : 'bg-gradient-to-r from-[#B38F5B] via-[#C5A880] to-[#F3E3C3] shadow-[0_0_8px_rgba(197,168,128,0.7)]'
          }`}
          style={{ width: `${activeProgress}%` }}
        >
          {/* Subtle luminous gold pip at the leading edge */}
          {activeProgress > 0 && (
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 rounded-full ${
              isLongFormActive 
                ? 'w-2.5 h-2.5 bg-[#FFFDF5] shadow-[0_0_10px_#DFBE82] ring-2 ring-[#C5A880]' 
                : 'w-2 h-2 bg-[#FFF8E7] shadow-[0_0_8px_#C5A880] ring-1 ring-[#C5A880]/50'
            }`} />
          )}
        </div>
      </div>

      {/* Floating Reading Progress Telemetry Badge (Viewport-Containment Safe) */}
      {isLongFormActive && (
        <div className="fixed right-4 lg:right-6 bottom-5 z-40 pointer-events-none max-w-[calc(100vw-2rem)]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0A0F1B]/95 border border-[#C5A880]/50 shadow-xl backdrop-blur-md text-[11px] font-mono text-[#E4C999] whitespace-nowrap max-w-full">
            <BookOpen className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
            <span className="text-[#C5A880] font-semibold uppercase tracking-wider truncate">
              {sourceType === 'insight'
                ? language === 'sw' ? 'Makala' : 'Reading Insight'
                : sourceType === 'case'
                  ? language === 'sw' ? 'Uamuzi' : 'Case Precedent'
                  : sourceType === 'section-insights'
                    ? t('nav.insights')
                    : t('nav.cases')}
            </span>
            {readingMetrics && (
              <>
                <span className="text-[#56657F] hidden sm:inline" aria-hidden="true">·</span>
                <span className="text-white font-medium hidden sm:inline whitespace-nowrap">
                  {readingMetrics.label}
                </span>
              </>
            )}
            <span className="text-[#56657F]" aria-hidden="true">·</span>
            <span className="text-[#DFBE82] font-bold tabular-nums shrink-0">
              {Math.round(activeProgress)}%
            </span>
          </div>
        </div>
      )}

      {/* Small, Elegant Global Time Clock Utility Bar */}
      <GlobalTimeClock
        variant="header-bar"
        onOpenConsultation={onOpenConsultation}
      />

      {/* Floating Language Switch Toast Feedback */}
      {langToast && (
        <div className="fixed top-20 right-4 lg:right-6 z-50 p-3 bg-[#0D1420]/95 border border-[#C5A880]/60 rounded-xl shadow-2xl text-xs text-[#E4C999] flex items-center gap-2.5 max-w-[calc(100vw-2rem)] backdrop-blur-md">
          <Globe className="w-4 h-4 text-[#C5A880] shrink-0" />
          <span className="font-medium truncate">{langToast}</span>
          <button
            type="button"
            onClick={() => setLangToast(null)}
            className="text-[#728299] hover:text-white p-0.5 shrink-0 cursor-pointer"
            aria-label="Dismiss language notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Top Navigation Bar */}
      <div
        className={`w-full max-w-full overflow-x-clip transition-all duration-300 ${
          isScrolled
            ? 'bg-[#080B11]/95 backdrop-blur-md border-b border-[#1A2334] py-2.5 shadow-xl'
            : 'bg-[#080B11]/90 backdrop-blur-sm border-b border-[#1A2334]/60 py-3'
        }`}
      >
        <div className="w-full max-w-full mx-auto px-4 lg:px-6">
          {/* Clean 3-Part Flexbox Navigation Row: Left (Brand), Center (Nav Links), Right (Utilities + Search + Menu) */}
          <div className="flex items-center justify-between gap-x-3 xl:gap-x-6 w-full max-w-full min-w-0">

            {/* PART 1 (LEFT): Brand Wordmark Element with Heraldic Seal */}
            <a
              href="#"
              className="font-cinzel text-xs 2xl:text-sm font-bold tracking-normal text-white whitespace-nowrap min-w-0 shrink xl:shrink-0 hover:text-[#DFBE82] transition-colors flex items-center gap-2 group"
            >
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-md border border-[#C5A880]/50 bg-[#C5A880]/10 flex items-center justify-center text-[#C5A880] text-[11px] sm:text-xs font-serif font-bold whitespace-nowrap shrink-0 group-hover:border-[#C5A880] transition-colors">
                P
              </span>
              <span className="truncate xl:overflow-visible whitespace-nowrap">
                PETERSONS ANGWENYI &amp; ASSOCIATES
              </span>
            </a>

            {/* PART 2 (CENTER): 6 Navigation Links (Hidden below 1280px / xl into hamburger drawer) */}
            <nav
              className="hidden xl:inline-flex items-center gap-x-3 xl:gap-x-6 text-xs uppercase tracking-normal font-medium text-[#A6B2C4] whitespace-nowrap shrink-0"
              aria-label="Primary Navigation"
            >
              <a
                href="#practice"
                className="text-xs hover:text-[#DFBE82] transition-colors whitespace-nowrap shrink-0 py-1"
              >
                {t('nav.practice')}
              </a>
              <a
                href="#advocates"
                className="text-xs hover:text-[#DFBE82] transition-colors whitespace-nowrap shrink-0 py-1"
              >
                {t('nav.advocates')}
              </a>
              <a
                href="#cases"
                className="text-xs hover:text-[#DFBE82] transition-colors whitespace-nowrap shrink-0 py-1"
              >
                {t('nav.cases')}
              </a>
              <a
                href="#fee-calculator"
                className="text-xs hover:text-[#DFBE82] transition-colors whitespace-nowrap shrink-0 py-1"
              >
                {t('nav.feeCalculator')}
              </a>
              <a
                href="#insights"
                className="text-xs hover:text-[#DFBE82] transition-colors whitespace-nowrap shrink-0 py-1"
              >
                {t('nav.insights')}
              </a>
              <a
                href="#awards"
                className="text-xs hover:text-[#DFBE82] transition-colors whitespace-nowrap shrink-0 py-1"
              >
                {t('nav.awards')}
              </a>
            </nav>

            {/* PART 3 (RIGHT): Compact Utilities, Portal, Tafuta/Search & Mobile Drawer Toggle */}
            <div className="flex items-center gap-x-3 xl:gap-x-6 shrink-0 whitespace-nowrap">
              <div className="flex items-center gap-x-1.5 sm:gap-x-2 shrink-0 whitespace-nowrap">
                {/* Language Switcher Segmented Control */}
                <LanguageSwitcher variant="compact" onLanguageChange={showLanguageNotice} />

                {/* Dark / Light Mode Toggle */}
                <ThemeToggle variant="compact" />

                {/* Secure Client Portal Compact Action (Full label on 2xl+, icon-only below so nav never clips) */}
                <button
                  type="button"
                  onClick={onOpenPortal || onOpenVault}
                  className="hidden sm:inline-flex items-center gap-1.5 p-1.5 2xl:px-2.5 2xl:py-1.5 rounded-lg bg-[#121927] hover:bg-[#182338] border border-[#C5A880]/40 hover:border-[#C5A880] text-xs font-semibold text-[#E4C999] hover:text-white transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
                  title={t('nav.clientPortal')}
                  aria-label={t('nav.clientPortal')}
                >
                  <Lock className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                  <span className="hidden 2xl:inline whitespace-nowrap">
                    {language === 'sw' ? 'Tovuti' : 'Portal'}
                  </span>
                </button>

                {/* Secure File Vault Compact Action (Icon button on lg+, full inside mobile drawer) */}
                <button
                  type="button"
                  onClick={onOpenVault}
                  className="hidden lg:inline-flex items-center gap-1.5 p-1.5 rounded-lg bg-[#101622] hover:bg-[#162030] border border-[#1E293E] hover:border-[#C5A880]/50 text-xs font-medium text-[#A6B4CD] hover:text-white transition-all whitespace-nowrap shrink-0 cursor-pointer"
                  title={t('nav.secureFiles')}
                  aria-label={t('nav.secureFiles')}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                </button>
              </div>

              {/* Search / "Tafuta" Trigger Button — cleanly positioned inside right edge with comfortable margin */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#121824] hover:bg-[#1A2334] border border-[#222B3D] hover:border-[#C5A880]/50 text-xs text-[#E4C999] hover:text-white transition-all group cursor-pointer whitespace-nowrap shrink-0"
                title={`${t('search.triggerLabel')} (⌘K / Ctrl+K)`}
                aria-label={t('search.triggerLabel')}
              >
                <Search className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                <span className="hidden sm:inline font-sans text-xs font-medium whitespace-nowrap">
                  {t('search.triggerLabel')}
                </span>
                <kbd className="hidden 2xl:inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 bg-[#1A2334] text-[#A6B2C4] rounded border border-[#2D3B54] whitespace-nowrap shrink-0">
                  ⌘K
                </kbd>
              </button>

              {/* Primary Consultation CTA (2xl+ only so 1280px Swahili bar has ample breathing room) */}
              <button
                type="button"
                onClick={onOpenConsultation}
                className="hidden 2xl:inline-flex px-3 py-1.5 text-xs uppercase tracking-wide font-semibold text-[#0A0E17] bg-gradient-to-r from-[#C5A880] to-[#DFBE82] rounded-lg hover:brightness-110 transition-all shadow-md shadow-[#C5A880]/20 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {language === 'sw' ? 'Mashauriano' : 'Consult'}
              </button>

              {/* Responsive Hamburger Menu Toggle Button (Visible below xl / 1280px) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="xl:hidden p-1.5 rounded-lg bg-[#121824] hover:bg-[#1A2334] border border-[#222B3D] hover:border-[#C5A880]/50 text-[#A6B2C4] hover:text-white transition-all shrink-0 cursor-pointer"
                aria-label="Toggle Navigation Menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#C5A880]" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile & Tablet Collapsible Drawer Menu (Triggers below 1280px / xl) */}
          {mobileMenuOpen && (
            <div
              id="mobile-navigation-drawer"
              className="xl:hidden relative w-full max-w-full mt-3 pt-4 border-t border-[#1C2537] bg-[#0A0E17]/98 backdrop-blur-lg p-4 sm:p-5 rounded-2xl shadow-2xl space-y-3.5 max-h-[calc(100vh-120px)] overflow-y-auto border border-[#222E44]/80 animate-fadeIn"
            >
              {/* Mobile Search Quick Trigger */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSearch();
                }}
                className="w-full flex items-center justify-between p-2.5 bg-[#121824] hover:bg-[#1A2334] border border-[#222B3D] rounded-lg text-xs text-[#A6B2C4] font-medium cursor-pointer"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Search className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span className="truncate">{t('search.placeholder')}</span>
                </span>
                <kbd className="font-mono text-[10px] text-[#718096] shrink-0 ml-2">⌘K</kbd>
              </button>

              {/* Dynamic LanguageSwitcher inside Mobile Drawer */}
              <LanguageSwitcher variant="drawer" onLanguageChange={showLanguageNotice} />

              {/* Mobile Display Theme Control (Dark / Light / Auto) */}
              <div className="flex items-center justify-between gap-2 p-2.5 bg-[#121824] rounded-xl border border-[#222B3D] text-xs">
                <span className="text-[#8C98AE] font-mono flex items-center gap-1.5 whitespace-nowrap">
                  <Sun className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                  <span className="whitespace-nowrap">Display Theme:</span>
                </span>
                <ThemeToggle variant="segmented" className="w-44 sm:w-48 shrink-0" />
              </div>

              {/* Vertical Navigation Links inside Drawer */}
              <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
                <a
                  href="#practice"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs uppercase tracking-wide font-medium text-[#A6B2C4] hover:text-[#C5A880] py-2.5 px-3 rounded-lg hover:bg-[#121824] transition-colors whitespace-nowrap"
                >
                  {t('nav.practice')}
                </a>
                <a
                  href="#advocates"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs uppercase tracking-wide font-medium text-[#A6B2C4] hover:text-[#C5A880] py-2.5 px-3 rounded-lg hover:bg-[#121824] transition-colors whitespace-nowrap"
                >
                  {t('nav.advocates')}
                </a>
                <a
                  href="#cases"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs uppercase tracking-wide font-medium text-[#A6B2C4] hover:text-[#C5A880] py-2.5 px-3 rounded-lg hover:bg-[#121824] transition-colors whitespace-nowrap"
                >
                  {t('nav.cases')}
                </a>
                <a
                  href="#fee-calculator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs uppercase tracking-wide font-medium text-[#A6B2C4] hover:text-[#C5A880] py-2.5 px-3 rounded-lg hover:bg-[#121824] transition-colors whitespace-nowrap"
                >
                  {t('nav.feeCalculator')}
                </a>
                <a
                  href="#insights"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs uppercase tracking-wide font-medium text-[#A6B2C4] hover:text-[#C5A880] py-2.5 px-3 rounded-lg hover:bg-[#121824] transition-colors whitespace-nowrap"
                >
                  {t('nav.insights')}
                </a>
                <a
                  href="#awards"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs uppercase tracking-wide font-medium text-[#A6B2C4] hover:text-[#C5A880] py-2.5 px-3 rounded-lg hover:bg-[#121824] transition-colors whitespace-nowrap"
                >
                  {t('nav.awards')}
                </a>
              </nav>

              {/* Secure Client Portal Link inside Drawer */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenPortal) onOpenPortal();
                  else onOpenVault();
                }}
                className="w-full flex items-center justify-between gap-2 p-2.5 bg-[#141F32] hover:bg-[#1A2842] border border-[#C5A880]/40 rounded-lg text-sm text-[#E4C999] font-medium shadow-sm cursor-pointer"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Lock className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span className="truncate whitespace-nowrap">{t('nav.clientPortal')}</span>
                </span>
                <span className="text-[10px] font-mono text-white bg-red-600 px-2 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0 animate-pulse">
                  3 ALERTS
                </span>
              </button>

              {/* Secure File Sharing & Client Vault inside Drawer */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenVault();
                }}
                className="w-full flex items-center justify-between gap-2 p-2.5 bg-[#121927] hover:bg-[#1A2438] border border-[#C5A880]/30 rounded-lg text-sm text-[#8C98AE] font-medium cursor-pointer"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span className="truncate whitespace-nowrap">{t('nav.secureFiles')}</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 whitespace-nowrap shrink-0">256-Bit SSL</span>
              </button>

              {/* Global Time Clock Hubs inside Mobile Menu */}
              <div className="pt-2">
                <GlobalTimeClock
                  variant="drawer"
                  onOpenConsultation={() => {
                    setMobileMenuOpen(false);
                    onOpenConsultation();
                  }}
                />
              </div>

              {/* Primary Consultation Action CTA inside Drawer */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConsultation();
                }}
                className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-[#C5A880] to-[#DFBE82] text-[#0A0E17] text-xs uppercase tracking-wider font-semibold rounded-lg text-center hover:brightness-110 transition-all shadow-md cursor-pointer"
              >
                {t('nav.scheduleConsultation')}
              </button>

              {/* Floating Search Icon Button (Pinned inside bottom-right of mobile drawer for one-tap access) */}
              <div className="sticky bottom-1 flex justify-end pointer-events-none z-20 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSearch();
                  }}
                  aria-label={`${t('search.triggerLabel')} — ${t('search.title')}`}
                  title={`${t('search.triggerLabel')} (⌘K / Ctrl+K)`}
                  className="pointer-events-auto w-11 h-11 rounded-full bg-gradient-to-br from-[#C5A880] to-[#DFBE82] text-[#0A0E17] shadow-[0_8px_24px_rgba(197,168,128,0.4)] ring-2 ring-[#0A0E17]/90 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  <Search className="w-5 h-5 stroke-[2.25]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
