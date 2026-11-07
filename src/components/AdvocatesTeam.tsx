import React, { useState } from 'react';
import { ADVOCATES, Advocate } from '../data/firmData';
import { Mail, Phone, ArrowRight, ShieldCheck, Award, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AdvocatesTeamProps {
  onOpenConsultation: (practice?: string, estimate?: string, advocate?: string) => void;
}

export const AdvocatesTeam: React.FC<AdvocatesTeamProps> = ({ onOpenConsultation }) => {
  const { t } = useLanguage();
  const [activeAdvocate, setActiveAdvocate] = useState<Advocate | null>(null);

  return (
    <section id="advocates" className="py-24 bg-[#080B11] border-b border-[#1E2536] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] mb-3 font-semibold">
            <span>{t('advocates.kicker')}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-cinzel text-white tracking-tight">
            {t('advocates.title')}
          </h2>
          <p className="mt-4 text-[#9BA5B7] leading-relaxed">
            {t('advocates.subtitle')}
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ADVOCATES.map((advocate) => (
            <div
              key={advocate.id}
              className="group p-6 rounded-2xl bg-[#0E1522] border border-[#1C263A] hover:border-[#C5A880]/60 hover:shadow-2xl hover:shadow-[#C5A880]/5 transition-all duration-300 ease-out flex flex-col justify-between transform hover:scale-[1.02] hover:-translate-y-1.5 will-change-transform cursor-pointer"
            >
              <div>
                {/* Roll Number & Credentials kicker */}
                <div className="flex items-center justify-between text-xs font-mono text-[#C5A880] mb-3">
                  <span>{advocate.rollNumber}</span>
                  <span className="text-[#6F7A8F]">{advocate.title.split('&')[0]}</span>
                </div>

                <h3 className="text-xl font-cinzel text-white group-hover:text-[#DFBE82] transition-colors">
                  {advocate.name}
                </h3>
                <p className="text-xs text-[#8C98AE] mt-0.5 font-medium">
                  {advocate.role}
                </p>

                <p className="mt-3 text-xs text-[#BAC5D6] line-clamp-3 leading-relaxed">
                  {advocate.bio}
                </p>

                <div className="mt-4 pt-3 border-t border-[#1C2436] space-y-1.5">
                  <div className="text-[11px] text-[#8C98AE]">
                    <strong className="text-white">{t('advocates.credentials')}:</strong> {advocate.credentials}
                  </div>
                  <div className="text-[11px] text-[#C5A880]">
                    {advocate.specialties.slice(0, 2).join(' · ')}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1C2436] flex items-center justify-between">
                <button
                  onClick={() => setActiveAdvocate(advocate)}
                  className="text-xs text-[#8C98AE] hover:text-white transition-colors"
                >
                  {t('advocates.viewBio')}
                </button>
                <button
                  onClick={() => onOpenConsultation(undefined, undefined, advocate.name)}
                  className="px-3.5 py-1.5 bg-[#141C2B] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                >
                  <span>{t('advocates.instruct')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Advocate Bio Modal */}
        {activeAdvocate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-xl bg-[#0D131F] border border-[#C5A880]/30 rounded-2xl shadow-2xl overflow-hidden">
              
              <div className="p-6 bg-[#121927] border-b border-[#222E46] flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#C5A880] font-mono">{activeAdvocate.rollNumber}</span>
                  <h3 className="text-xl font-cinzel text-white mt-0.5">{activeAdvocate.name}</h3>
                  <p className="text-xs text-[#8C98AE]">{activeAdvocate.title} &mdash; {activeAdvocate.role}</p>
                </div>
                <button
                  onClick={() => setActiveAdvocate(null)}
                  className="p-2 text-[#8C98AE] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-5 text-xs text-[#B2BDCE] leading-relaxed">
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-white font-semibold mb-1.5">Academic &amp; Professional Qualifications</h4>
                  <p className="font-mono text-[#C5A880]">{activeAdvocate.credentials}</p>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest text-white font-semibold mb-1.5">Bar Admissions &amp; Fellowships</h4>
                  <ul className="space-y-1 text-[#8C98AE]">
                    {activeAdvocate.admissions.map((adm, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#C5A880]">•</span>
                        <span>{adm}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest text-white font-semibold mb-1.5">Legal Practice Profile</h4>
                  <p>{activeAdvocate.bio}</p>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest text-white font-semibold mb-1.5">Key Areas of Advisory</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeAdvocate.specialties.map((spec, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[#141B28] rounded border border-[#222B3E] text-[11px] text-[#E4C999]">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#121927] border-t border-[#222E46] flex items-center justify-between">
                <a href={`mailto:${activeAdvocate.email}`} className="text-xs text-[#8C98AE] hover:text-white flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{activeAdvocate.email}</span>
                </a>
                <button
                  onClick={() => {
                    const advName = activeAdvocate.name;
                    setActiveAdvocate(null);
                    onOpenConsultation(undefined, undefined, advName);
                  }}
                  className="px-4 py-2 bg-[#C5A880] text-[#0A0E17] font-semibold text-xs tracking-wider uppercase rounded-lg hover:brightness-110"
                >
                  {t('advocates.modalSchedule')}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
