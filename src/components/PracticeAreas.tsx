import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Scale,
  Building2,
  ShieldCheck,
  Binary,
  Flame,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ScrollText,
  UserCheck,
  X,
} from 'lucide-react';
import { PRACTICE_AREAS, PracticeArea } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';
import { PracticeExpertiseRadar } from './PracticeExpertiseRadar';

interface PracticeAreasProps {
  onOpenConsultation: (practiceTitle: string) => void;
  focusedPracticeId?: string | null;
  onClearFocusedPractice?: () => void;
  onSelectPractice?: (practice: PracticeArea | null) => void;
}

export const PracticeAreas: React.FC<PracticeAreasProps> = ({
  onOpenConsultation,
  focusedPracticeId,
  onClearFocusedPractice,
  onSelectPractice,
}) => {
  const { t } = useLanguage();
  const [selectedPractice, setSelectedPractice] = useState<PracticeArea | null>(null);
  const [highlightedPracticeId, setHighlightedPracticeId] = useState<string | null>(null);

  useEffect(() => {
    if (focusedPracticeId) {
      const found = PRACTICE_AREAS.find((p) => p.id === focusedPracticeId);
      if (found) {
        setSelectedPractice(found);
        if (onSelectPractice) onSelectPractice(found);
      }
    }
  }, [focusedPracticeId, onSelectPractice]);

  const handleOpenPractice = (practice: PracticeArea) => {
    setSelectedPractice(practice);
    if (onSelectPractice) onSelectPractice(practice);
  };

  const getIcon = (iconName: string, className = 'w-5 h-5 text-[#8C6B32] dark:text-[#C5A880]') => {
    switch (iconName) {
      case 'Landmark':
        return <Landmark className={className} strokeWidth={1.6} />;
      case 'Scale':
        return <Scale className={className} strokeWidth={1.6} />;
      case 'Building2':
        return <Building2 className={className} strokeWidth={1.6} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} strokeWidth={1.6} />;
      case 'Binary':
        return <Binary className={className} strokeWidth={1.6} />;
      case 'Flame':
        return <Flame className={className} strokeWidth={1.6} />;
      default:
        return <Scale className={className} strokeWidth={1.6} />;
    }
  };

  return (
    <section
      id="practice"
      className="py-24 bg-[#FAF8F5] dark:bg-[#0A0E17] border-b border-[#E4DCCF] dark:border-[#1E2536] relative"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880] mb-3 font-semibold">
            <span>{t('practice.kicker')}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-cinzel text-[#121A28] dark:text-white tracking-tight">
            {t('practice.title')}
          </h2>
          <p className="mt-4 text-[#4A576D] dark:text-[#9BA5B7] leading-relaxed">
            {t('practice.subtitle')}
          </p>
        </div>

        {/* Interactive Animated D3 Expertise Radar Chart */}
        <PracticeExpertiseRadar
          activePracticeId={highlightedPracticeId}
          onHighlightPractice={setHighlightedPracticeId}
          onInspectPractice={handleOpenPractice}
        />

        {/* Bento Grid with Asymmetric Spans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRACTICE_AREAS.map((practice, index) => {
            const isFeatured = index === 0 || index === 1;
            const isRadarHighlighted = highlightedPracticeId === practice.id;

            return (
              <div
                key={practice.id}
                onMouseEnter={() => setHighlightedPracticeId(practice.id)}
                onMouseLeave={() => setHighlightedPracticeId(null)}
                onClick={() => handleOpenPractice(practice)}
                className={`relative overflow-hidden group p-8 rounded-2xl bg-white dark:bg-[#0E1522] border transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer transform hover:-translate-y-1.5 shadow-sm dark:shadow-none ${
                  isRadarHighlighted
                    ? 'border-[#C5A880] ring-1 ring-[#C5A880]/40 shadow-2xl shadow-[#C5A880]/15 -translate-y-1'
                    : 'border-[#E4DCCF] dark:border-[#1C263A] hover:border-[#C5A880]/60 dark:hover:border-[#C5A880]/50 hover:shadow-2xl hover:shadow-[#C5A880]/10 dark:hover:shadow-[#C5A880]/5'
                } ${isFeatured ? 'lg:col-span-1 border-t-2 border-t-[#C5A880]/60' : ''}`}
              >
                {/* Subtle SVG Watermark Iconography */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-5 -right-5 opacity-[0.045] dark:opacity-[0.055] group-hover:opacity-[0.09] group-hover:scale-105 transition-all duration-500 text-[#8C6B32] dark:text-[#C5A880]"
                >
                  {getIcon(practice.iconName, 'w-36 h-36')}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-[#F5EFE4] dark:bg-[#141D2D] border border-[#E4DCCF] dark:border-[#232F46] flex items-center justify-center group-hover:border-[#C5A880]/60 group-hover:scale-105 transition-all duration-300 shadow-xs">
                      {getIcon(practice.iconName)}
                    </div>
                    <span className="font-mono text-xs text-[#6F7A8F] dark:text-[#5D6B82] group-hover:text-[#8C6B32] dark:group-hover:text-[#C5A880] transition-colors">
                      {`0${index + 1}.`}
                    </span>
                  </div>

                  <h3 className="text-xl font-cinzel text-[#121A28] dark:text-white group-hover:text-[#8C6B32] dark:group-hover:text-[#DFBE82] transition-colors">
                    {practice.title}
                  </h3>
                  <p className="text-xs text-[#5C6A80] dark:text-[#8C98AE] mt-1 font-medium">
                    {practice.subtitle}
                  </p>

                  <p className="mt-4 text-xs text-[#4A576D] dark:text-[#9DAABF] leading-relaxed line-clamp-3">
                    {practice.description}
                  </p>

                  {/* Statutory framework tags */}
                  <div className="mt-5 pt-4 border-t border-[#EFE8DA] dark:border-[#1C2436] space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#6F7A8F] font-semibold flex items-center gap-1.5">
                      <ScrollText className="w-3 h-3 text-[#8C6B32] dark:text-[#C5A880] shrink-0" />
                      <span>{t('practice.governingStatutes')}</span>
                    </span>
                    <div className="text-xs text-[#8C6B32] dark:text-[#C5A880] font-mono line-clamp-1">
                      {practice.keyActs.join(' · ')}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-4 border-t border-[#EFE8DA] dark:border-[#1A2334] flex items-center justify-between text-xs gap-2">
                  <span className="text-[#5C6A80] dark:text-[#8C98AE] flex items-center gap-1.5 min-w-0">
                    <UserCheck className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880] shrink-0" />
                    <span className="truncate">
                      {t('practice.lead')}:{' '}
                      <strong className="text-[#121A28] dark:text-white">
                        {practice.leadAdvocate}
                      </strong>
                    </span>
                  </span>
                  <span className="text-[#8C6B32] dark:text-[#C5A880] flex items-center gap-1 group-hover:translate-x-1 transition-transform font-medium shrink-0">
                    <span>{t('practice.inspect')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Practice Detail Modal */}
        {selectedPractice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-2xl bg-white dark:bg-[#0D131F] border border-[#DFD4C1] dark:border-[#C5A880]/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

              <div className="relative overflow-hidden p-6 bg-[#F6F1E6] dark:bg-[#121927] border-b border-[#E4DCCF] dark:border-[#222E46] flex items-center justify-between gap-4">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-4 -top-4 opacity-[0.06] text-[#8C6B32] dark:text-[#C5A880]"
                >
                  {getIcon(selectedPractice.iconName, 'w-28 h-28')}
                </div>
                <div className="relative z-10 flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#0D131F] border border-[#DFD4C1] dark:border-[#C5A880]/30 flex items-center justify-center shrink-0 shadow-xs">
                    {getIcon(selectedPractice.iconName)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880] font-semibold">
                      PAA Advocates
                    </span>
                    <h3 className="text-xl sm:text-2xl font-cinzel text-[#121A28] dark:text-white mt-0.5 leading-snug">
                      {selectedPractice.title}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPractice(null);
                    if (onSelectPractice) onSelectPractice(null);
                    if (onClearFocusedPractice) onClearFocusedPractice();
                  }}
                  aria-label="Close practice modal"
                  className="p-2 text-[#5C6A80] dark:text-[#8C98AE] hover:text-[#121A28] dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#5C6A80] dark:text-[#8C98AE] font-semibold mb-2">
                    {t('practice.modalOverview')}
                  </h4>
                  <p className="text-sm text-[#324056] dark:text-[#BAC5D6] leading-relaxed">
                    {selectedPractice.description}
                  </p>
                </div>

                <div className="p-4 bg-[#FAF8F5] dark:bg-[#121824] rounded-xl border border-[#E4DCCF] dark:border-[#1E2638]">
                  <span className="text-xs uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880] font-semibold block mb-2">
                    {t('practice.modalPartner')}
                  </span>
                  <div className="text-sm font-semibold text-[#121A28] dark:text-white">
                    {selectedPractice.leadAdvocate}
                  </div>
                  <div className="text-xs text-[#5C6A80] dark:text-[#8C98AE] mt-0.5">
                    Advocate of the High Court of Kenya
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#5C6A80] dark:text-[#8C98AE] font-semibold mb-3">
                    {t('practice.modalStatutes')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedPractice.keyActs.map((act, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-[#FAF8F5] dark:bg-[#141B28] rounded-lg border border-[#E4DCCF] dark:border-[#20293D] text-[#8C6B32] dark:text-[#C5A880] font-mono"
                      >
                        {act}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#5C6A80] dark:text-[#8C98AE] font-semibold mb-3">
                    {t('practice.modalCapabilities')}
                  </h4>
                  <div className="space-y-2">
                    {selectedPractice.capabilities.map((cap, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-[#324056] dark:text-[#BAC5D6]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#8C6B32] dark:text-[#C5A880] shrink-0" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#5C6A80] dark:text-[#8C98AE] font-semibold mb-3">
                    {t('practice.modalMatters')}
                  </h4>
                  <div className="space-y-2">
                    {selectedPractice.highlights.map((h, i) => (
                      <div
                        key={i}
                        className="p-3 bg-[#FAF8F5] dark:bg-[#131B29] rounded-lg border border-[#E4DCCF] dark:border-[#202A3D] text-xs text-[#324056] dark:text-[#C5D0E0]"
                      >
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#F6F1E6] dark:bg-[#121927] border-t border-[#E4DCCF] dark:border-[#222E46] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPractice(null);
                    if (onSelectPractice) onSelectPractice(null);
                    if (onClearFocusedPractice) onClearFocusedPractice();
                  }}
                  className="px-4 py-2 text-xs text-[#5C6A80] dark:text-[#8C98AE] hover:text-[#121A28] dark:hover:text-white cursor-pointer"
                >
                  {t('practice.close')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const practice = selectedPractice.title;
                    setSelectedPractice(null);
                    onOpenConsultation(practice);
                  }}
                  className="px-5 py-2.5 bg-[#C5A880] text-[#0A0E17] font-semibold text-xs tracking-wider uppercase rounded-lg hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{t('practice.instructThis')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
