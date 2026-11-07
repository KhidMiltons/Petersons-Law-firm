import React, { useState, useEffect } from 'react';
import { Landmark, Scale, Building2, ShieldCheck, Binary, Flame, ArrowRight, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { PRACTICE_AREAS, PracticeArea } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

interface PracticeAreasProps {
  onOpenConsultation: (practiceTitle: string) => void;
  focusedPracticeId?: string | null;
  onClearFocusedPractice?: () => void;
}

export const PracticeAreas: React.FC<PracticeAreasProps> = ({
  onOpenConsultation,
  focusedPracticeId,
  onClearFocusedPractice,
}) => {
  const { t } = useLanguage();
  const [selectedPractice, setSelectedPractice] = useState<PracticeArea | null>(null);

  useEffect(() => {
    if (focusedPracticeId) {
      const found = PRACTICE_AREAS.find((p) => p.id === focusedPracticeId);
      if (found) {
        setSelectedPractice(found);
      }
    }
  }, [focusedPracticeId]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Landmark': return <Landmark className="w-5 h-5 text-[#C5A880]" />;
      case 'Scale': return <Scale className="w-5 h-5 text-[#C5A880]" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-[#C5A880]" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-[#C5A880]" />;
      case 'Binary': return <Binary className="w-5 h-5 text-[#C5A880]" />;
      case 'Flame': return <Flame className="w-5 h-5 text-[#C5A880]" />;
      default: return <Scale className="w-5 h-5 text-[#C5A880]" />;
    }
  };

  return (
    <section id="practice" className="py-24 bg-[#0A0E17] border-b border-[#1E2536] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] mb-3 font-semibold">
            <span>{t('practice.kicker')}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-cinzel text-white tracking-tight">
            {t('practice.title')}
          </h2>
          <p className="mt-4 text-[#9BA5B7] leading-relaxed">
            {t('practice.subtitle')}
          </p>
        </div>

        {/* Bento Grid with Asymmetric Spans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRACTICE_AREAS.map((practice, index) => {
            const isFeatured = index === 0 || index === 1; // marquee capabilities
            return (
              <div
                key={practice.id}
                onClick={() => setSelectedPractice(practice)}
                className={`group p-8 rounded-2xl bg-[#0E1522] border border-[#1C263A] hover:border-[#C5A880]/50 hover:shadow-2xl hover:shadow-[#C5A880]/5 transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1.5 will-change-transform ${
                  isFeatured ? 'lg:col-span-1 border-t-2 border-t-[#C5A880]/60' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#141D2D] border border-[#232F46] flex items-center justify-center group-hover:border-[#C5A880]/50 group-hover:scale-105 transition-all duration-300">
                      {getIcon(practice.iconName)}
                    </div>
                    {/* Natural editorial numbering */}
                    <span className="font-mono text-xs text-[#5D6B82] group-hover:text-[#C5A880] transition-colors">
                      {`0${index + 1}.`}
                    </span>
                  </div>

                  <h3 className="text-xl font-cinzel text-white group-hover:text-[#DFBE82] transition-colors">
                    {practice.title}
                  </h3>
                  <p className="text-xs text-[#8C98AE] mt-1 font-medium">
                    {practice.subtitle}
                  </p>

                  <p className="mt-4 text-xs text-[#9DAABF] leading-relaxed line-clamp-3">
                    {practice.description}
                  </p>

                  {/* Statutory framework tags */}
                  <div className="mt-5 pt-4 border-t border-[#1C2436] space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#6F7A8F] font-semibold block">
                      {t('practice.governingStatutes')}
                    </span>
                    <div className="text-xs text-[#C5A880] font-mono line-clamp-1">
                      {practice.keyActs.join(' · ')}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1A2334] flex items-center justify-between text-xs">
                  <span className="text-[#8C98AE]">{t('practice.lead')}: <strong className="text-white">{practice.leadAdvocate}</strong></span>
                  <span className="text-[#C5A880] flex items-center gap-1 group-hover:translate-x-1 transition-transform font-medium">
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
            <div className="relative w-full max-w-2xl bg-[#0D131F] border border-[#C5A880]/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              
              <div className="p-6 bg-[#121927] border-b border-[#222E46] flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#C5A880] font-semibold">PAA Advocates</span>
                  <h3 className="text-2xl font-cinzel text-white mt-1">{selectedPractice.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedPractice(null)}
                  className="p-2 text-[#8C98AE] hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#8C98AE] font-semibold mb-2">{t('practice.modalOverview')}</h4>
                  <p className="text-sm text-[#BAC5D6] leading-relaxed">
                    {selectedPractice.description}
                  </p>
                </div>

                <div className="p-4 bg-[#121824] rounded-xl border border-[#1E2638]">
                  <span className="text-xs uppercase tracking-widest text-[#C5A880] font-semibold block mb-2">{t('practice.modalPartner')}</span>
                  <div className="text-sm font-semibold text-white">{selectedPractice.leadAdvocate}</div>
                  <div className="text-xs text-[#8C98AE] mt-0.5">Advocate of the High Court of Kenya</div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#8C98AE] font-semibold mb-3">{t('practice.modalStatutes')}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedPractice.keyActs.map((act, i) => (
                      <div key={i} className="p-2.5 bg-[#141B28] rounded-lg border border-[#20293D] text-[#C5A880] font-mono">
                        {act}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#8C98AE] font-semibold mb-3">{t('practice.modalCapabilities')}</h4>
                  <div className="space-y-2">
                    {selectedPractice.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#BAC5D6]">
                        <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#8C98AE] font-semibold mb-3">{t('practice.modalMatters')}</h4>
                  <div className="space-y-2">
                    {selectedPractice.highlights.map((h, i) => (
                      <div key={i} className="p-3 bg-[#131B29] rounded-lg border border-[#202A3D] text-xs text-[#C5D0E0]">
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#121927] border-t border-[#222E46] flex items-center justify-between">
                <button
                  onClick={() => setSelectedPractice(null)}
                  className="px-4 py-2 text-xs text-[#8C98AE] hover:text-white"
                >
                  {t('practice.close')}
                </button>
                <button
                  onClick={() => {
                    const practice = selectedPractice.title;
                    setSelectedPractice(null);
                    onOpenConsultation(practice);
                  }}
                  className="px-5 py-2.5 bg-[#C5A880] text-[#0A0E17] font-semibold text-xs tracking-wider uppercase rounded-lg hover:brightness-110 transition-all flex items-center gap-2"
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
