import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { FIRM_DETAILS } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

interface NairobiChambersProps {
  onOpenConsultation: () => void;
}

export const NairobiChambers: React.FC<NairobiChambersProps> = ({ onOpenConsultation }) => {
  const { t } = useLanguage();

  return (
    <section id="chambers" className="py-24 bg-[#0A0E17] border-b border-[#1E2536] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Split grid: Chambers information + Nairobi Skyline Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Column: Chambers Details */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] mb-3 font-semibold">
                <span>{t('chambers.kicker')}</span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-cinzel text-white tracking-tight">
                {t('chambers.title')}
              </h2>

              <p className="mt-4 text-[#9BA5B7] leading-relaxed">
                {t('chambers.subtitle')}
              </p>

              {/* Contact information list */}
              <div className="mt-8 space-y-5 text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#141B28] border border-[#222C41] flex items-center justify-center text-[#C5A880] shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-medium">{t('chambers.addressTitle')}</strong>
                    <span className="text-[#9BA5B7] text-xs leading-relaxed">{FIRM_DETAILS.address}</span>
                    <span className="text-xs text-[#6F7A8F] block mt-0.5">{FIRM_DETAILS.postalAddress}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#141B28] border border-[#222C41] flex items-center justify-center text-[#C5A880] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-medium">{t('chambers.linesTitle')}</strong>
                    <div className="text-xs text-[#9BA5B7] space-y-0.5">
                      <div>{t('chambers.switchboard')}: <span className="font-mono text-white">{FIRM_DETAILS.phone}</span></div>
                      <div>{t('chambers.managingLine')}: <span className="font-mono text-white">{FIRM_DETAILS.mobile}</span></div>
                      <div>{t('chambers.emergencyLine')}: <span className="font-mono text-[#DFBE82]">{FIRM_DETAILS.emergencyInjunction}</span></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#141B28] border border-[#222C41] flex items-center justify-center text-[#C5A880] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-medium">{t('chambers.dispatchTitle')}</strong>
                    <div className="text-xs text-[#9BA5B7] space-y-0.5">
                      <div>Client Inquiries: <span className="text-white font-mono">{FIRM_DETAILS.email}</span></div>
                      <div>Court Pleadings &amp; Service: <span className="text-white font-mono">{FIRM_DETAILS.registryEmail}</span></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#141B28] border border-[#222C41] flex items-center justify-center text-[#C5A880] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-medium">{t('chambers.hoursTitle')}</strong>
                    <span className="text-xs text-[#9BA5B7]">{FIRM_DETAILS.hours}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#1C2538] flex flex-wrap gap-4 items-center">
              <button
                onClick={onOpenConsultation}
                className="px-6 py-3 bg-[#C5A880] hover:bg-[#DFBE82] text-[#0A0E17] font-semibold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center gap-2"
              >
                <span>{t('chambers.initiateInquiry')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-xs font-mono text-[#6F7A8F]">
                {FIRM_DETAILS.lskRoll}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Nairobi Skyline & Interactive Map Mock */}
          <div className="lg:col-span-6 relative rounded-3xl border border-[#1E293E] overflow-hidden min-h-[460px] flex flex-col justify-end p-8 bg-[#0D1420]">
            <img
              src="/src/assets/images/nairobi_commercial_skyline_1793735492873.jpg"
              alt="Nairobi Upper Hill Skyline and Financial District at Sunset"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090E18] via-[#090E18]/70 to-transparent" />

            {/* Overlaid location card */}
            <div className="relative z-10 p-6 bg-[#0E1523]/95 backdrop-blur-md rounded-2xl border border-[#C5A880]/30 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[#C5A880] font-semibold">{t('chambers.hq')}</span>
                <span className="text-[11px] font-mono text-[#8C98AE]">Upper Hill, Nairobi</span>
              </div>

              <h4 className="text-lg font-cinzel text-white">
                PAA Chambers, 9th Floor, Mara Square
              </h4>

              <p className="text-xs text-[#9BA5B7] leading-relaxed">
                {t('chambers.amenities')}
              </p>

              <div className="pt-3 border-t border-[#1E293E] flex items-center justify-between text-xs">
                <span className="text-[#DFBE82] font-medium">{t('chambers.courtDist1')}</span>
                <span className="text-[#8C98AE]">{t('chambers.courtDist2')}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
