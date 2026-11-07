import React from 'react';
import { Award, BookOpen, ShieldCheck, ArrowRight, Mail, Phone } from 'lucide-react';
import { ADVOCATES } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

interface ChambersLeadershipProps {
  onOpenConsultation: (practice?: string, estimate?: string, advocate?: string) => void;
}

export const ChambersLeadership: React.FC<ChambersLeadershipProps> = ({ onOpenConsultation }) => {
  const { t } = useLanguage();
  const managingPartner = ADVOCATES[0]; // Milton Angwenyi, SC
  const seniorPartner = ADVOCATES[1]; // Peterson K. Maina

  return (
    <section className="py-24 bg-[#080B11] border-b border-[#1A2334] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] mb-3 font-semibold">
            <span>{t('lead.kicker')}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-cinzel text-white tracking-tight">
            {t('lead.title')}
          </h2>
          <p className="mt-4 text-[#9BA5B7] leading-relaxed">
            {t('lead.subtitle')}
          </p>
        </div>

        {/* Managing Partner Spotlight Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[#0E1522] rounded-3xl border border-[#1E293E] overflow-hidden mb-16">
          
          {/* Portrait Column */}
          <div className="lg:col-span-5 relative min-h-[460px] lg:min-h-full">
            <img
              src={managingPartner.image || "/src/assets/images/portrait_managing_partner_1793735491956.jpg"}
              alt={managingPartner.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1522] via-transparent to-transparent lg:hidden" />
          </div>

          {/* Biography & Track Record Column */}
          <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] font-mono mb-2">
                <span>{managingPartner.rollNumber}</span>
                <span aria-hidden="true">·</span>
                <span>FCIArb</span>
                <span aria-hidden="true">·</span>
                <span>Senior Advocate</span>
              </div>

              <h3 className="text-2xl lg:text-3xl font-cinzel font-bold text-white">
                {managingPartner.name}
              </h3>
              <p className="text-sm font-medium text-[#DFBE82] mt-1">
                {managingPartner.title} &mdash; {managingPartner.role}
              </p>

              <blockquote className="my-6 pl-4 border-l-2 border-[#C5A880]/60 italic font-cormorant text-lg text-[#D0DBE8]">
                {t('lead.quote')}
              </blockquote>

              <p className="text-sm text-[#9BA5B7] leading-relaxed">
                {managingPartner.bio}
              </p>

              {/* Admissions and Specialties */}
              <div className="mt-6 pt-6 border-t border-[#1C2538] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-white block mb-2 uppercase tracking-wider text-[11px]">
                    {t('lead.admissionsHeader')}
                  </span>
                  <ul className="space-y-1.5 text-[#8C98AE]">
                    {managingPartner.admissions.map((adm, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#C5A880]">•</span>
                        <span>{adm}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-semibold text-white block mb-2 uppercase tracking-wider text-[11px]">
                    {t('lead.specialtiesHeader')}
                  </span>
                  <ul className="space-y-1.5 text-[#8C98AE]">
                    {managingPartner.specialties.map((spec, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#C5A880]">•</span>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-[#1C2538] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs text-[#8C98AE]">
                <a href={`mailto:${managingPartner.email}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{managingPartner.email}</span>
                </a>
              </div>

              <button
                onClick={() => onOpenConsultation(undefined, undefined, managingPartner.name)}
                className="px-5 py-2.5 bg-[#C5A880] hover:bg-[#DFBE82] text-[#0A0E17] font-semibold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center gap-2"
              >
                <span>{t('lead.instructSeniorCounsel')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Senior Partner & Chambers Philosophy Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Peterson K. Maina Spotlight */}
          <div className="p-8 bg-[#0E1522] rounded-3xl border border-[#1E293E] flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] font-mono mb-2">
                <span>{seniorPartner.rollNumber}</span>
                <span aria-hidden="true">·</span>
                <span>Founding Partner</span>
              </div>
              <h4 className="text-xl font-cinzel font-bold text-white">
                {seniorPartner.name}
              </h4>
              <p className="text-xs text-[#DFBE82] mt-0.5">
                {seniorPartner.role}
              </p>
              <p className="mt-4 text-sm text-[#9BA5B7] leading-relaxed">
                {seniorPartner.bio}
              </p>

              <div className="mt-6 pt-4 border-t border-[#1C2538] space-y-2 text-xs text-[#8C98AE]">
                <div>
                  <strong className="text-white">Credentials:</strong> {seniorPartner.credentials}
                </div>
                <div>
                  <strong className="text-white">Appellate Focus:</strong> Constitutional Petitions, Judicial Review, PPARB Procurement Appeals.
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1C2538] flex items-center justify-between">
              <span className="text-xs text-[#8C98AE]">{seniorPartner.email}</span>
              <button
                onClick={() => onOpenConsultation('Constitutional, Administrative & Appellate Law', undefined, seniorPartner.name)}
                className="text-xs text-[#C5A880] hover:text-[#DFBE82] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <span>{t('lead.requestBriefing')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Law Library & Chambers Standards Banner */}
          <div className="relative rounded-3xl border border-[#1E293E] overflow-hidden min-h-[340px] flex flex-col justify-end p-8 bg-[#0C121D]">
            <img
              src="/src/assets/images/firm_library_chambers_1793735492639.jpg"
              alt="Petersons Angwenyi and Associates Law Library and Jurisprudence Study"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-40 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C121D] via-[#0C121D]/80 to-transparent" />
            
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] font-semibold">
                <BookOpen className="w-4 h-4" />
                <span>{t('lead.libraryKicker')}</span>
              </div>
              <h4 className="text-xl font-cinzel text-white">
                {t('lead.libraryTitle')}
              </h4>
              <p className="text-xs text-[#B2BDCE] leading-relaxed">
                {t('lead.libraryDesc')}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
