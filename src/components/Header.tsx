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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [langToast, setLangToast] = useState<string | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
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
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
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
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Top Navigation Bar */}
      <div
        className={`transition-all duration-300 ${
          isScrolled
            ? 'bg-[#080B11]/95 backdrop-blur-md border-b border-[#1A2334] py-3 shadow-xl'
            : 'bg-[#080B11]/85 backdrop-blur-sm border-b border-[#1A2334]/50 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Strict 3-Zone Navigation Row */}
          <div className="flex items-center justify-between gap-6 xl:gap-8">
          
            {/* Zone 1: Single Brand Wordmark Element in Display Font */}
            <a
              href="#"
              className="font-cinzel text-base sm:text-lg md:text-xl font-bold tracking-wider text-white whitespace-nowrap shrink-0 hover:text-[#DFBE82] transition-colors flex items-center gap-2.5"
            >
              {/* Subtle heraldic crest seal */}
              <span className="w-7 h-7 rounded-md border border-[#C5A880]/50 bg-[#C5A880]/10 flex items-center justify-center text-[#C5A880] text-xs font-serif font-bold">
                P
              </span>
              <span>PETERSONS ANGWENYI &amp; ASSOCIATES</span>
            </a>

            {/* Zone 2: Navigation Links with Secure File Sharing */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs uppercase tracking-widest font-medium text-[#A6B2C4]">
              <a
                href="#practice"
                className="hover:text-[#DFBE82] transition-colors whitespace-nowrap shrink-0"
              >
                {t('nav.practice')}
              </a>
              <a
                href="#advocates"
                className="hover:text-[#DFBE82] transition-colors whitespace-nowrap shrink-0"
              >
                {t('nav.advocates')}
              </a>
              <a
                href="#cases"
                className="hover:text-[#DFBE82] transition-colors whitespace-nowrap shrink-0"
              >
                {t('nav.cases')}
              </a>
              <a
                href="#fee-calculator"
                className="hover:text-[#DFBE82] transition-colors whitespace-nowrap shrink-0"
              >
                {t('nav.feeCalculator')}
              </a>
              <a
                href="#insights"
                className="hover:text-[#DFBE82] transition-colors whitespace-nowrap shrink-0"
              >
                {t('nav.insights')}
              </a>
              <button
                onClick={onOpenPortal || onOpenVault}
                className="text-[#E4C999] hover:text-white transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer font-medium px-2.5 py-1 rounded-lg bg-[#121927] hover:bg-[#182338] border border-[#C5A880]/30 hover:border-[#C5A880]/60 shadow-sm relative group"
                title="Secure Client Portal Login (3 New Case Updates & Document Alerts)"
              >
                <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>{t('nav.clientPortal')}</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-0.5" />
              </button>
              <button
                onClick={onOpenVault}
                className="text-[#8C98AE] hover:text-[#DFBE82] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer font-medium"
                title={t('nav.secureFiles')}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>{t('nav.secureFiles')}</span>
              </button>
            </nav>

            {/* Zone 3: Search ⌘K + Language Switcher + 1 Primary Action */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Search Index Trigger Button (⌘K) */}
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#121824] hover:bg-[#1A2334] border border-[#222B3D] hover:border-[#C5A880]/50 text-xs text-[#8C98AE] hover:text-white transition-all group cursor-pointer whitespace-nowrap shrink-0"
                title="Search Chambers Index (⌘K / Ctrl+K)"
                aria-label="Search Chambers Index"
              >
                <Search className="w-3.5 h-3.5 text-[#C5A880] group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline font-sans text-xs font-medium">{t('search.triggerLabel')}</span>
                <kbd className="hidden lg:inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 bg-[#1A2334] text-[#A6B2C4] rounded border border-[#2D3B54]">
                  ⌘K
                </kbd>
              </button>

              {/* Language Switcher Component with Dropdown & Segmented Controls */}
              <div className="relative flex items-center" ref={langMenuRef}>
                <div className="flex items-center p-0.5 bg-[#121824] rounded-lg border border-[#222B3D] text-[11px] font-mono shadow-inner">
                  <button
                    onClick={() => handleSwitchLanguage('en')}
                    className={`px-2 py-1 rounded transition-all font-semibold flex items-center gap-1 ${
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
                    className={`px-2 py-1 rounded transition-all font-semibold flex items-center gap-1 ${
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

              {/* Secure Client Portal Quick Access Button with Notification Badge */}
              <button
                onClick={onOpenPortal || onOpenVault}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#121824] hover:bg-[#1A2538] border border-[#C5A880]/40 hover:border-[#C5A880] text-xs font-semibold text-[#E4C999] hover:text-white transition-all shadow-sm group whitespace-nowrap shrink-0 cursor-pointer relative"
                title="Access Secure Client Portal (3 New Case Updates & Document Alerts)"
              >
                <Lock className="w-3.5 h-3.5 text-[#C5A880] group-hover:scale-110 transition-transform" />
                <span>{t('nav.clientPortal')}</span>
                <span className="px-1.5 py-0.2 bg-red-600 text-white font-mono text-[9px] font-bold rounded-full ml-1 animate-pulse">
                  3 NEW
                </span>
              </button>

              {/* Primary Consultation Action CTA */}
              <button
                onClick={onOpenConsultation}
                className="hidden sm:inline-flex px-4 sm:px-5 py-2.5 text-xs uppercase tracking-wider font-semibold text-[#0A0E17] bg-gradient-to-r from-[#C5A880] to-[#DFBE82] rounded-lg hover:brightness-110 transition-all shadow-md shadow-[#C5A880]/20 whitespace-nowrap shrink-0"
              >
                {t('nav.scheduleConsultation')}
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-[#A6B2C4] hover:text-white"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-[#1C2537] bg-[#0A0E17] p-4 rounded-xl space-y-3">
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

              <a
                href="#practice"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-[#A6B2C4] hover:text-[#C5A880] py-1"
              >
                {t('nav.practice')}
              </a>
              <a
                href="#advocates"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-[#A6B2C4] hover:text-[#C5A880] py-1"
              >
                {t('nav.advocates')}
              </a>
              <a
                href="#cases"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-[#A6B2C4] hover:text-[#C5A880] py-1"
              >
                {t('nav.cases')}
              </a>
              <a
                href="#fee-calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-[#A6B2C4] hover:text-[#C5A880] py-1"
              >
                {t('nav.feeCalculator')}
              </a>
              <a
                href="#insights"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-[#A6B2C4] hover:text-[#C5A880] py-1"
              >
                {t('nav.insights')}
              </a>

              {/* Secure Client Portal Link with Alert Badge */}
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

              {/* Secure File Sharing & Client Vault */}
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

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConsultation();
                }}
                className="w-full mt-2 py-2.5 px-4 bg-[#C5A880] text-[#0A0E17] text-xs uppercase tracking-wider font-semibold rounded-lg text-center"
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
