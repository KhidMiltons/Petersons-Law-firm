import React, { useState, useRef, useEffect } from 'react';
import { FIRM_DETAILS } from '../data/firmData';
import { ShieldCheck, Printer, Link2, Check, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LegalBriefingSubscription } from './LegalBriefingSubscription';
import { SocialShareWidget } from './SocialShareWidget';
import { LinkedInQRCodeCard } from './LinkedInQRCodeCard';

interface FooterProps {
  onOpenConsultation: () => void;
  onOpenVault: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenVault }) => {
  const { language, t } = useLanguage();
  const [urlCopied, setUrlCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handlePrintLegalBriefing = () => {
    window.print();
  };

  const handleCopyUrlToClipboard = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://paalawkenya.com';
    let copySucceeded = false;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl);
        copySucceeded = true;
      }
    } catch {
      copySucceeded = false;
    }

    // Fallback copy mechanism if Clipboard API is restricted in iframe
    if (!copySucceeded && typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = currentUrl;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        copySucceeded = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        copySucceeded = true;
      }
    }

    setUrlCopied(true);
    setToastMessage(
      language === 'sw'
        ? 'Kiungo cha tovuti kimenakiliwa kwenye ubao wa kunakili!'
        : `URL copied to clipboard: ${currentUrl}`
    );

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setUrlCopied(false);
      setToastMessage(null);
    }, 3500);
  };

  return (
    <footer className="bg-[#F4EFE4] dark:bg-[#05080E] text-[#4A576D] dark:text-[#8C98AE] border-t border-[#E4DCCF] dark:border-[#161D2B] pt-16 pb-12 transition-colors duration-300 relative">
      {/* Immediate Toast Notification for Copy URL to Clipboard */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-sm p-3.5 rounded-xl bg-[#0D1420]/95 dark:bg-[#0D1420]/95 border border-emerald-500/60 shadow-2xl backdrop-blur-md text-xs text-white flex items-center gap-3 animate-fadeIn no-print"
        >
          <span className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
            <Check className="w-4 h-4" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-emerald-300 block">
              {language === 'sw' ? 'Imenakiliwa!' : 'Copied to Clipboard'}
            </span>
            <p className="text-[11px] text-[#BAC5D6] truncate" title={toastMessage}>
              {toastMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 text-[#8C98AE] hover:text-white rounded transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss clipboard notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Top Footer Band: Legal Briefing Subscription + Social Media Sharing Widget + LinkedIn QR Code */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch mb-14">
          <div className="xl:col-span-6">
            <LegalBriefingSubscription />
          </div>
          <div className="xl:col-span-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            <div className="md:col-span-7">
              <SocialShareWidget />
            </div>
            <div className="md:col-span-5">
              <LinkedInQRCodeCard />
            </div>
          </div>
        </div>

        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#E4DCCF] dark:border-[#161D2B]">
          
          {/* Brand info */}
          <div className="lg:col-span-5 space-y-4">
            <a href="#" className="font-cinzel text-lg font-bold tracking-wider text-[#121A28] dark:text-white inline-block">
              PETERSONS ANGWENYI &amp; ASSOCIATES
            </a>
            <p className="text-xs text-[#4A576D] dark:text-[#8C98AE] leading-relaxed max-w-sm">
              {t('footer.desc')}
            </p>
            <div className="pt-2 text-xs font-mono text-[#8C6D3B] dark:text-[#C5A880]">
              {FIRM_DETAILS.lskRoll}
            </div>

            {/* Footer Action Buttons: Print Legal Briefing & Copy URL to Clipboard */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrintLegalBriefing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#0D1420] hover:bg-[#C5A880] text-[#8C6D3B] dark:text-[#C5A880] hover:text-[#0A0E17] border border-[#DFD4C1] dark:border-[#C5A880]/40 text-xs font-semibold transition-all shadow-sm cursor-pointer group whitespace-nowrap"
                title="Trigger clean A4 print output for subscription materials and monthly legal briefing"
              >
                <Printer className="w-3.5 h-3.5 text-[#8C6D3B] dark:text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
                <span>Print Legal Briefing</span>
              </button>

              <button
                type="button"
                onClick={handleCopyUrlToClipboard}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all shadow-sm cursor-pointer whitespace-nowrap ${
                  urlCopied
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-600 dark:text-emerald-400'
                    : 'bg-white dark:bg-[#0D1420] hover:bg-[#EAE2D2] dark:hover:bg-[#162033] text-[#121A28] dark:text-white border-[#DFD4C1] dark:border-[#223048] hover:border-[#C5A880]/60'
                }`}
                title="Copy current chambers page URL to clipboard"
              >
                {urlCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>URL Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 text-[#8C6D3B] dark:text-[#C5A880]" />
                    <span>Copy URL to Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Practice Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#121A28] dark:text-white font-semibold">
              {t('footer.practicePortfolios')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#practice" className="hover:text-[#121A28] dark:hover:text-white transition-colors">Corporate &amp; M&amp;A</a></li>
              <li><a href="#practice" className="hover:text-[#121A28] dark:hover:text-white transition-colors">Arbitration &amp; NCIA</a></li>
              <li><a href="#practice" className="hover:text-[#121A28] dark:hover:text-white transition-colors">Sectional Properties</a></li>
              <li><a href="#practice" className="hover:text-[#121A28] dark:hover:text-white transition-colors">Banking &amp; Project Finance</a></li>
              <li><a href="#practice" className="hover:text-[#121A28] dark:hover:text-white transition-colors">Technology &amp; KDPA 2019</a></li>
            </ul>
          </div>

          {/* Firm & Access Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#121A28] dark:text-white font-semibold">
              {t('footer.chambersAndCounsel')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#advocates" className="hover:text-[#121A28] dark:hover:text-white transition-colors">Roll of Advocates</a></li>
              <li><a href="#cases" className="hover:text-[#121A28] dark:hover:text-white transition-colors">Landmark Precedents</a></li>
              <li><a href="#testimonials" className="hover:text-[#121A28] dark:hover:text-white transition-colors">Client Endorsements</a></li>
              <li><a href="#faq" className="hover:text-[#121A28] dark:hover:text-white transition-colors">Corporate &amp; Consultations FAQ</a></li>
              <li><a href="#fee-calculator" className="hover:text-[#121A28] dark:hover:text-white transition-colors">ARO Fee Calculator</a></li>
              <li><a href="#insights" className="hover:text-[#121A28] dark:hover:text-white transition-colors">Kenya Law Commentary</a></li>
              <li><a href="#east-africa-reach" className="hover:text-[#8C6D3B] dark:hover:text-[#DFBE82] transition-colors">East Africa Regional Reach</a></li>
              <li><a href="#awards" className="hover:text-[#8C6D3B] dark:hover:text-[#DFBE82] transition-colors">Law Firm Honors &amp; Awards</a></li>
              <li>
                <button onClick={onOpenVault} className="text-[#8C6D3B] dark:text-[#C5A880] hover:text-[#121A28] dark:hover:text-[#DFBE82] transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('nav.secureFiles')}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Nairobi Office */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <h4 className="text-xs uppercase tracking-widest text-[#121A28] dark:text-white font-semibold">
              {t('footer.upperHill')}
            </h4>
            <p className="text-[#4A576D] dark:text-[#8C98AE] leading-relaxed">
              {FIRM_DETAILS.address}
            </p>
            <p className="font-mono text-[#121A28] dark:text-white">
              Tel: {FIRM_DETAILS.phone}
            </p>
            <p className="font-mono text-[#8C6D3B] dark:text-[#DFBE82]">
              Injunction: {FIRM_DETAILS.emergencyInjunction}
            </p>
            <p className="text-[#4A576D] dark:text-[#8C98AE]">
              Email: {FIRM_DETAILS.email}
            </p>
          </div>

        </div>

        {/* Regulatory & Disclaimer Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#5C6A80] dark:text-[#5D6B80]">
          <div className="text-center md:text-left">
            &copy; {new Date().getFullYear()} Petersons Angwenyi &amp; Associates Advocates. {t('footer.rights')}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
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
