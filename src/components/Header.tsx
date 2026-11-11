import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Globe, Search, ShieldCheck, Check, ChevronDown, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { GlobalTimeClock } from './GlobalTimeClock';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
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
        setScrollProgress(Math.min(100, Math.max(0, scrolled)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className="fixed top-0 left-0 right-0 z-40 w-full max-w-full overflow-x-hidden transition-all duration-300">
      {/* Slim Gold Scroll Progress Indicator (Long-Form Content Reading Tracker) */}
      <div 
        className="w-full h-[2.5px] sm:h-[3px] bg-[#0A0E17]/80 overflow-hidden relative"
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading and scroll progress indicator"
      >
        <div
          className="h-full bg-gradient-to-r from-[#B38F5B] via-[#C5A880] to-[#F3E3C3] shadow-[0_0_10px_rgba(197,168,128,0.85)] transition-all duration-75 ease-out relative"
          style={{ width: `${scrollProgress}%` }}
        >
          {/* Subtle luminous gold pip at the leading edge */}
          {scrollProgress > 0 && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#FFF8E7] shadow-[0_0_8px_#C5A880] ring-1 ring-[#C5A880]/50" />
          )}
        </div>
      </div>

      {/* Small, Elegant Global Time Clock Component (Nairobi HQ, London, New York) */}
      <GlobalTimeClock
        variant="header-bar"
        onOpenConsultation={onOpenConsultation}
      />

      {/* Floating Language Switch Toast Feedback */}
      {langToast && (
        <div className="fixed top-20 right-6 z-50 p-3 bg-[#0D1420]/95 border border-[#C5A880]/60 rounded-xl shadow-2xl text-xs text-[#E4C999] flex items-center gap-2.5 animate-fadeIn backdrop-blur-md">
          <Globe className="w-4 h-4 text-[#C5A880] shrink-0 animate-spin" />
          <span className="font-medium">{langToast}</span>
          <button
            onClick={() => setLangToast(null)}
            className="text-[#728299] hover:text-white p-0.5"
            aria-label="Dismiss language notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Top Navigation Bar */}
      <div
        className={`w-full max-w-full overflow-x-hidden transition-all duration-300 ${
          isScrolled
            ? 'bg-[#080B11]/95 backdrop-blur-md border-b border-[#1A2334] py-2.5 sm:py-3 shadow-xl'
            : 'bg-[#080B11]/90 backdrop-blur-sm border-b border-[#1A2334]/60 py-3 sm:py-3.5'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Clean 3-Part Flexbox Navigation Row: Left (Brand), Center (Nav Links), Right (Action Buttons) */}
          <div className="flex items-center justify-between gap-3 sm:gap-4 xl:gap-6 w-full">
          
            {/* PART 1 (LEFT): Brand Wordmark Element with Heraldic Seal */}
            <a
              href="#"
              className="font-cinzel text-sm sm:text-base xl:text-lg font-bold tracking-wider text-white whitespace-nowrap shrink-0 hover:text-[#DFBE82] transition-colors flex items-center gap-2 sm:gap-2.5 group"
            >
              {/* Subtle heraldic crest seal */}
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-md border border-[#C5A880]/50 bg-[#C5A880]/10 flex items-center justify-center text-[#C5A880] text-[11px] sm:text-xs font-serif font-bold shrink-0 group-hover:border-[#C5A880] transition-colors">
                P
              </span>
              <span className="whitespace-nowrap tracking-wide">
                PETERSONS ANGWENYI &amp; ASSOCIATES
              </span>
            </a>

            {/* PART 2 (CENTER): 6 Navigation Links (Cleanly collapses below xl / 1280px into hamburger drawer) */}
            <nav
              className="hidden xl:flex items-center gap-3.5 2xl:gap-5 text-[11px] 2xl:text-xs uppercase tracking-wider font-medium text-[#A6B2C4] whitespace-nowrap shrink-0"
              aria-label="Primary Navigation"
            >
              <a
                href="#practice"
                className="hover:text-[#DFBE82] transition-colors whitespace-nowrap py-1"
              >
                {t('nav.practice')}
              </a>
              <a
                href="#advocates"
                className="hover:text-[#DFBE82] transition-colors whitespace-nowrap py-1"
              >
                {t('nav.advocates')}
              </a>
              <a
                href="#cases"
                className="hover:text-[#DFBE82] transition-colors whitespace-nowrap py-1"
              >
                {t('nav.cases')}
              </a>
              <a
                href="#fee-calculator"
                className="hover:text-[#DFBE82] transition-colors whitespace-nowrap py-1"
              >
                {t('nav.feeCalculator')}
              </a>
              <a
                href="#insights"
                className="hover:text-[#DFBE82] transition-colors whitespace-nowrap py-1"
              >
                {t('nav.insights')}
              </a>
              <a
                href="#awards"
                className="hover:text-[#DFBE82] transition-colors whitespace-nowrap py-1"
              >
                {t('nav.awards')}
              </a>
            </nav>

            {/* PART 3 (RIGHT): Action Buttons & Essential Utilities */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap">
              {/* Search Index Trigger Button (⌘K) */}
              <button
                onClick={onOpenSearch}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#121824] hover:bg-[#1A2334] border border-[#222B3D] hover:border-[#C5A880]/50 text-xs text-[#8C98AE] hover:text-white transition-all group cursor-pointer whitespace-nowrap shrink-0"
                title="Search Chambers Index (⌘K / Ctrl+K)"
                aria-label="Search Chambers Index"
              >
                <Search className="w-3.5 h-3.5 text-[#C5A880] group-hover:scale-110 transition-transform" />
                <span className="hidden 2xl:inline font-sans text-xs font-medium">{t('search.triggerLabel')}</span>
                <kbd className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 bg-[#1A2334] text-[#A6B2C4] rounded border border-[#2D3B54]">
                  ⌘K
                </kbd>
              </button>

              {/* Language Switcher Component with Segmented Controls & Dropdown */}
              <div className="relative flex items-center shrink-0" ref={langMenuRef}>
                <div className="flex items-center p-0.5 bg-[#121824] rounded-lg border border-[#222B3D] text-[11px] font-mono shadow-inner">
                  <button
                    onClick={() => handleSwitchLanguage('en')}
                    className={`px-1.5 sm:px-2 py-1 rounded transition-all font-semibold flex items-center gap-1 ${
                      language === 'en'
                        ? 'bg-[#C5A880] text-[#0A0E17] shadow-sm font-bold'
                        : 'text-[#8C98AE] hover:text-white'
                    }`}
                    aria-label="Switch to English (Official Court Language)"
                    title="English (Official Court Language)"
                  >
                    <span>EN</span>
                  </button>

                  <button
                    onClick={() => handleSwitchLanguage('sw')}
                    className={`px-1.5 sm:px-2 py-1 rounded transition-all font-semibold flex items-center gap-1 ${
                      language === 'sw'
                        ? 'bg-[#C5A880] text-[#0A0E17] shadow-sm font-bold'
                        : 'text-[#8C98AE] hover:text-white'
                    }`}
                    aria-label="Badilisha kwa Kiswahili (Lugha ya Kitaifa)"
                    title="Kiswahili (Lugha ya Kitaifa)"
                  >
                    <span>SW</span>
                  </button>

                  {/* Dropdown chevron button */}
                  <button
                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                    className="px-1 py-1 text-[#66768E] hover:text-white transition-colors border-l border-[#1D273B] ml-0.5"
                    aria-label="Expand language options"
                    title="Language options"
                  >
                    <ChevronDown className={`w-3 h-3 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Popover Language Menu */}
                {langDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#0D131F] border border-[#C5A880]/40 rounded-xl shadow-2xl py-1.5 z-50 animate-fadeIn text-xs">
                    <div className="px-3 py-1.5 border-b border-[#1A2538] flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-[#697992]">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-[#C5A880]" />
                        <span>Lugha / Language</span>
                      </span>
                      <span className="text-emerald-400 font-bold">LSK Cap 16</span>
                    </div>

                    <button
                      onClick={() => handleSwitchLanguage('en')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${
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
                      onClick={() => handleSwitchLanguage('sw')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${
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

              {/* Action Button 1: Secure Client Portal Button with Status Indicator */}
              <button
                onClick={onOpenPortal || onOpenVault}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-[#121927] hover:bg-[#182338] border border-[#C5A880]/40 hover:border-[#C5A880] text-xs font-semibold text-[#E4C999] hover:text-white transition-all shadow-sm group whitespace-nowrap shrink-0 cursor-pointer relative"
                title="Secure Client Portal Login (WebAuthn Passkey & CTS Vault)"
              >
                <Lock className="w-3.5 h-3.5 text-[#C5A880] group-hover:scale-110 transition-transform" />
                <span className="whitespace-nowrap">{t('nav.clientPortal')}</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-0.5" />
              </button>

              {/* Action Button 2: Secure File Sharing / Client Vault Button */}
              <button
                onClick={onOpenVault}
                className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-[#101622] hover:bg-[#162030] border border-[#1E293E] hover:border-[#C5A880]/50 text-xs font-medium text-[#A6B4CD] hover:text-white transition-all whitespace-nowrap shrink-0 cursor-pointer"
                title={t('nav.secureFiles')}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="whitespace-nowrap">{t('nav.secureFiles')}</span>
              </button>

              {/* Primary Consultation Action CTA (Shown on wider desktop screens) */}
              <button
                onClick={onOpenConsultation}
                className="hidden 2xl:inline-flex px-3.5 py-2 text-xs uppercase tracking-wider font-semibold text-[#0A0E17] bg-gradient-to-r from-[#C5A880] to-[#DFBE82] rounded-lg hover:brightness-110 transition-all shadow-md shadow-[#C5A880]/20 whitespace-nowrap shrink-0"
              >
                {t('nav.scheduleConsultation')}
              </button>

              {/* Responsive Hamburger Menu Toggle Button (Visible below xl / 1280px) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-1.5 sm:p-2 rounded-lg bg-[#121824] hover:bg-[#1A2334] border border-[#222B3D] hover:border-[#C5A880]/50 text-[#A6B2C4] hover:text-white transition-all shrink-0 cursor-pointer"
                aria-label="Toggle Navigation Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#C5A880]" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile & Tablet Collapsible Menu Drawer (Visible below xl / 1280px) */}
          {mobileMenuOpen && (
            <div className="xl:hidden mt-3 pt-4 border-t border-[#1C2537] bg-[#0A0E17]/98 backdrop-blur-lg p-4 sm:p-5 rounded-2xl shadow-2xl space-y-3.5 max-h-[calc(100vh-120px)] overflow-y-auto border border-[#222E44]/80 animate-fadeIn">
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

              {/* Navigation Links inside Drawer */}
              <div className="space-y-1">
                <a
                  href="#practice"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm text-[#A6B2C4] hover:text-[#C5A880] py-2 px-2 rounded-lg hover:bg-[#121824] transition-colors"
                >
                  {t('nav.practice')}
                </a>
                <a
                  href="#advocates"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm text-[#A6B2C4] hover:text-[#C5A880] py-2 px-2 rounded-lg hover:bg-[#121824] transition-colors"
                >
                  {t('nav.advocates')}
                </a>
                <a
                  href="#cases"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm text-[#A6B2C4] hover:text-[#C5A880] py-2 px-2 rounded-lg hover:bg-[#121824] transition-colors"
                >
                  {t('nav.cases')}
                </a>
                <a
                  href="#fee-calculator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm text-[#A6B2C4] hover:text-[#C5A880] py-2 px-2 rounded-lg hover:bg-[#121824] transition-colors"
                >
                  {t('nav.feeCalculator')}
                </a>
                <a
                  href="#insights"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm text-[#A6B2C4] hover:text-[#C5A880] py-2 px-2 rounded-lg hover:bg-[#121824] transition-colors"
                >
                  {t('nav.insights')}
                </a>
                <a
                  href="#awards"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm text-[#A6B2C4] hover:text-[#C5A880] py-2 px-2 rounded-lg hover:bg-[#121824] transition-colors"
                >
                  {t('nav.awards')}
                </a>
              </div>

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
