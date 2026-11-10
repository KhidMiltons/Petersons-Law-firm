import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeroSectionProps {
  onOpenConsultation: () => void;
  onOpenVault: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenConsultation, onOpenVault }) => {
  const { t } = useLanguage();

  return (
    <section id="hero" className="relative min-h-[92vh] flex flex-col justify-between pt-36 sm:pt-40 pb-12 overflow-hidden bg-[#080B11]">
      {/* Background Hero Image with Measured Gradient Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_law_chambers_1793735491210.jpg"
          alt="Petersons Angwenyi &amp; Associates Advocates Chambers Boardroom Nairobi"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 animate-subtleZoom opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B11] via-[#080B11]/85 to-[#080B11]/55" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#080B11]/90" />
      </div>

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full my-auto py-10">
        <div className="max-w-3xl">
          {/* Institutional Trust Kicker */}
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] mb-5 font-semibold">
            <span>{t('hero.kicker')}</span>
          </div>

          {/* Primary Headline with text-wrap: balance */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-cinzel font-bold text-white tracking-tight leading-[1.12] text-balance">
            {t('hero.titleLine1')} <br />
            <span className="gold-gradient-text">{t('hero.titleLine2')}</span>
          </h1>

          {/* Value Proposition */}
          <p className="mt-6 text-base sm:text-lg text-[#B0BCCC] leading-relaxed max-w-2xl font-normal">
            {t('hero.description')}
          </p>

          {/* Single Primary Action + Secondary Anchor */}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenConsultation}
              className="px-7 py-3.5 bg-gradient-to-r from-[#C5A880] via-[#D4AF37] to-[#B89047] text-[#080B11] font-semibold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-xl shadow-[#C5A880]/20 flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{t('hero.ctaConsultation')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#practice"
              className="px-6 py-3.5 bg-[#121927]/90 hover:bg-[#1A2438] text-white border border-[#25324A] hover:border-[#C5A880]/40 font-medium text-xs uppercase tracking-widest rounded-xl transition-all whitespace-nowrap shrink-0"
            >
              {t('hero.ctaPractice')}
            </a>

            <button
              onClick={onOpenVault}
              className="px-4 py-3.5 text-xs text-[#9DAABF] hover:text-[#C5A880] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
              <span>{t('hero.ctaVault')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Proof Strip Directly Adjacent Below Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#0E1522]/90 backdrop-blur-md rounded-2xl border border-[#1E293E]">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-mono text-white font-bold tabular-nums">
              {t('hero.stat1Val')}
            </div>
            <div className="text-xs text-[#8C98AE]">
              {t('hero.stat1Label')}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-mono text-white font-bold tabular-nums">
              {t('hero.stat2Val')}
            </div>
            <div className="text-xs text-[#8C98AE]">
              {t('hero.stat2Label')}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-mono text-white font-bold tabular-nums">
              {t('hero.stat3Val')}
            </div>
            <div className="text-xs text-[#8C98AE]">
              {t('hero.stat3Label')}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-mono text-[#E4C999] font-bold tabular-nums">
              {t('hero.stat4Val')}
            </div>
            <div className="text-xs text-[#8C98AE]">
              {t('hero.stat4Label')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
