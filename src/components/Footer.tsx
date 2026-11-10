import React from 'react';
import { FIRM_DETAILS } from '../data/firmData';
import { Scale, Lock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LegalBriefingsNewsletter } from './LegalBriefingsNewsletter';

interface FooterProps {
  onOpenConsultation: () => void;
  onOpenVault: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenConsultation, onOpenVault }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#05080E] text-[#8C98AE] border-t border-[#161D2B] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Chambers Legal Briefings Monthly Digest Signup */}
        <LegalBriefingsNewsletter />

        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#161D2B]">
          
          {/* Brand info */}
          <div className="lg:col-span-5 space-y-4">
            <a href="#" className="font-cinzel text-lg font-bold tracking-wider text-white inline-block">
              PETERSONS ANGWENYI &amp; ASSOCIATES
            </a>
            <p className="text-xs text-[#8C98AE] leading-relaxed max-w-sm">
              {t('footer.desc')}
            </p>
            <div className="pt-2 text-xs font-mono text-[#C5A880]">
              {FIRM_DETAILS.lskRoll}
            </div>
          </div>

          {/* Practice Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-white font-semibold">
              {t('footer.practicePortfolios')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#practice" className="hover:text-white transition-colors">Corporate &amp; M&amp;A</a></li>
              <li><a href="#practice" className="hover:text-white transition-colors">Arbitration &amp; NCIA</a></li>
              <li><a href="#practice" className="hover:text-white transition-colors">Sectional Properties</a></li>
              <li><a href="#practice" className="hover:text-white transition-colors">Banking &amp; Project Finance</a></li>
              <li><a href="#practice" className="hover:text-white transition-colors">Technology &amp; KDPA 2019</a></li>
            </ul>
          </div>

          {/* Firm & Access Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-white font-semibold">
              {t('footer.chambersAndCounsel')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#advocates" className="hover:text-white transition-colors">Roll of Advocates</a></li>
              <li><a href="#cases" className="hover:text-white transition-colors">Landmark Precedents</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">Client Endorsements</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Corporate &amp; Consultations FAQ</a></li>
              <li><a href="#fee-calculator" className="hover:text-white transition-colors">ARO Fee Calculator</a></li>
              <li><a href="#insights" className="hover:text-white transition-colors">Kenya Law Commentary</a></li>
              <li><a href="#awards" className="hover:text-[#DFBE82] transition-colors">Law Firm Honors &amp; Awards</a></li>
              <li>
                <button onClick={onOpenVault} className="text-[#C5A880] hover:text-[#DFBE82] transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('nav.secureFiles')}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Nairobi Office */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <h4 className="text-xs uppercase tracking-widest text-white font-semibold">
              {t('footer.upperHill')}
            </h4>
            <p className="text-[#8C98AE] leading-relaxed">
              {FIRM_DETAILS.address}
            </p>
            <p className="font-mono text-white">
              Tel: {FIRM_DETAILS.phone}
            </p>
            <p className="font-mono text-[#DFBE82]">
              Injunction: {FIRM_DETAILS.emergencyInjunction}
            </p>
            <p className="text-[#8C98AE]">
              Email: {FIRM_DETAILS.email}
            </p>
          </div>

        </div>

        {/* Regulatory & Disclaimer Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#5D6B80]">
          <div className="text-center md:text-left">
            &copy; {new Date().getFullYear()} Petersons Angwenyi &amp; Associates Advocates. {t('footer.rights')}
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>LSK Code of Standards (2016)</span>
            <span aria-hidden="true">·</span>
            <span>{t('footer.privilege')}</span>
            <span aria-hidden="true">·</span>
            <span>Republic of Kenya</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
