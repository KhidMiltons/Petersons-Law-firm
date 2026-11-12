import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Globe, Search, ShieldCheck, Check, ChevronDown, Lock, Sun, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useReadingProgress } from '../context/ReadingProgressContext';
import { GlobalTimeClock } from './GlobalTimeClock';
import { ThemeToggle } from './ThemeToggle';

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
  const { language, setLanguage, t } = useLanguage();
  const { 
    progress: longFormProgress, 
    isLongFormActive, 
    activeTitle, 
    sourceType, 
    readingMetrics 
  } = useReadingProgress();

  const [isScrolled, setIsScrolled] = useState(false);
  const [pageScrollProgress, setPageScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [langToast, setLangToast] = useState<string | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

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

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSwitchLanguage = (newLang: 'en' | 'sw') => {
    if (newLang === language) {
      setLangDropdownOpen(false);
      return;
    }
    setLanguage(newLang);
    setLangDropdownOpen(false);
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
              className="font-cinzel text-xs 2xl:text-sm font-bold tracking-normal text-white whitespace-nowrap shrink-0 min-w-0 max-w-[58vw] sm:max-w-none hover:text-[#DFBE82] transition-colors flex items-center gap-2 group"
            >
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-md border border-[#C5A880]/50 bg-[#C5A880]/10 flex items-center justify-center text-[#C5A880] text-[11px] sm:text-xs font-serif font-bold whitespace-nowrap shrink-0 group-hover:border-[#C5A880] transition-colors">
                P
              </span>
              <span className="truncate sm:overflow-visible whitespace-nowrap">
                PETERSONS ANGWENYI &amp; ASSOCIATES
              </span>
            </a>

            {/* PART 2 (CENTER): 6 Navigation Links (Hidden below 1280px / xl into hamburger drawer) */}
            <nav
              className="hidden xl:flex items-center gap-x-3 xl:gap-x-6 text-xs uppercase tracking-normal font-medium text-[#A6B2C4] whitespace-nowrap shrink-0"
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
            <div className="flex items-center gap-x-2 xl:gap-x-3 shrink-0 whitespace-nowrap">
              {/* Language Switcher Segmented Control */}
              <div className="relative flex items-center shrink-0" ref={langMenuRef}>
                <div className="flex items-center p-0.5 bg-[#121824] rounded-lg border border-[#222B3D] text-[11px] font-mono shadow-inner whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSwitchLanguage('en')}
                    className={`px-1.5 py-1 rounded transition-all font-semibold whitespace-nowrap cursor-pointer ${
                      language === 'en'
                        ? 'bg-[#C5A880] text-[#0A0E17] shadow-sm font-bold'
                        : 'text-[#8C98AE] hover:text-white'
                    }`}
                    aria-label="Switch to English (Official Court Language)"
                    title="English (Official Court Language)"
                  >
                    EN
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchLanguage('sw')}
                    className={`px-1.5 py-1 rounded transition-all font-semibold whitespace-nowrap cursor-pointer ${
                      language === 'sw'
                        ? 'bg-[#C5A880] text-[#0A0E17] shadow-sm font-bold'
                        : 'text-[#8C98AE] hover:text-white'
                    }`}
                    aria-label="Badilisha kwa Kiswahili (Lugha ya Kitaifa)"
                    title="Kiswahili (Lugha ya Kitaifa)"
                  >
                    SW
                  </button>

                  <button
                    type="button"
                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                    className="px-1 py-1 text-[#66768E] hover:text-white transition-colors border-l border-[#1D273B] ml-0.5 cursor-pointer"
                    aria-label="Expand language options"
                    title="Language options"
                  >
                    <ChevronDown className={`w-3 h-3 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Popover Language Menu */}
                {langDropdownOpen && (
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
                      onClick={() => handleSwitchLanguage('en')}
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
                      onClick={() => handleSwitchLanguage('sw')}
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

              {/* Secure File Vault Compact Action (Icon button on xl+, full inside mobile drawer) */}
              <button
                type="button"
                onClick={onOpenVault}
                className="hidden lg:inline-flex items-center gap-1.5 p-1.5 rounded-lg bg-[#101622] hover:bg-[#162030] border border-[#1E293E] hover:border-[#C5A880]/50 text-xs font-medium text-[#A6B4CD] hover:text-white transition-all whitespace-nowrap shrink-0 cursor-pointer"
                title={t('nav.secureFiles')}
                aria-label={t('nav.secureFiles')}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
              </button>

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
                <kbd className="hidden 2xl:inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 bg-[#1A2334] text-[#A6B2C4] rounded border border-[#2D3B54] shrink-0">
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
              className="xl:hidden w-full max-w-full mt-3 pt-4 border-t border-[#1C2537] bg-[#0A0E17]/98 backdrop-blur-lg p-4 sm:p-5 rounded-2xl shadow-2xl space-y-3.5 max-h-[calc(100vh-120px)] overflow-y-auto border border-[#222E44]/80 animate-fadeIn"
            >
              {/* Mobile Search Quick Trigger */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSearch();
                }}
                className="w-full flex items-center justify-between p-2.5 bg-[#121824] hover:bg-[#1A2334] border border-[#222B3D] rounded-lg text-xs text-[#A6B2C4] font-medium"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#C5A880]" />
                  <span>{t('search.placeholder')}</span>
                </span>
                <kbd className="font-mono text-[10px] text-[#718096]">⌘K</kbd>
              </button>

              {/* Mobile Language Switcher */}
              <div className="flex flex-col gap-2 pb-2 border-b border-[#1C2537]">
                <div className="flex items-center justify-between text-xs text-[#8C98AE]">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Lugha / Language Switcher:</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#C5A880]">
                    {language === 'en' ? 'English Active' : 'Kiswahili Imewashwa'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <button
                    onClick={() => {
                      handleSwitchLanguage('en');
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 px-3 rounded-lg border text-center transition-all flex items-center justify-center gap-1.5 ${
                      language === 'en'
                        ? 'bg-[#C5A880] text-[#0A0E17] font-bold border-[#C5A880]'
                        : 'bg-[#121824] text-[#8C98AE] border-[#222B3D]'
                    }`}
                  >
                    <span>English (EN)</span>
                    {language === 'en' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => {
                      handleSwitchLanguage('sw');
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 px-3 rounded-lg border text-center transition-all flex items-center justify-center gap-1.5 ${
                      language === 'sw'
                        ? 'bg-[#C5A880] text-[#0A0E17] font-bold border-[#C5A880]'
                        : 'bg-[#121824] text-[#8C98AE] border-[#222B3D]'
                    }`}
                  >
                    <span>Kiswahili (SW)</span>
                    {language === 'sw' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Mobile Display Theme Control (Dark / Light / Auto) */}
              <div className="flex items-center justify-between p-2.5 bg-[#121824] rounded-xl border border-[#222B3D] text-xs">
                <span className="text-[#8C98AE] font-mono flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Display Theme:</span>
                </span>
                <ThemeToggle variant="segmented" className="w-48" />
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
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenPortal) onOpenPortal();
                  else onOpenVault();
                }}
                className="w-full flex items-center justify-between p-2.5 bg-[#141F32] hover:bg-[#1A2842] border border-[#C5A880]/40 rounded-lg text-sm text-[#E4C999] font-medium shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#C5A880]" />
                  <span>{t('nav.clientPortal')}</span>
                </span>
                <span className="text-[10px] font-mono text-white bg-red-600 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  3 ALERTS
                </span>
              </button>

              {/* Secure File Sharing & Client Vault inside Drawer */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenVault();
                }}
                className="w-full flex items-center justify-between p-2.5 bg-[#121927] hover:bg-[#1A2438] border border-[#C5A880]/30 rounded-lg text-sm text-[#8C98AE] font-medium"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                  <span>{t('nav.secureFiles')}</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">256-Bit SSL</span>
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
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConsultation();
                }}
                className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-[#C5A880] to-[#DFBE82] text-[#0A0E17] text-xs uppercase tracking-wider font-semibold rounded-lg text-center hover:brightness-110 transition-all shadow-md"
              >
                {t('nav.scheduleConsultation')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
