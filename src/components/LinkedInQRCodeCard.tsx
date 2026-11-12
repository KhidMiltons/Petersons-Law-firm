import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, ExternalLink, Smartphone } from 'lucide-react';
import { FIRM_DETAILS } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

export const LinkedInQRCodeCard: React.FC = () => {
  const { language } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrError, setQrError] = useState<boolean>(false);

  const linkedinUrl = FIRM_DETAILS.linkedinUrl;

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(linkedinUrl, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0A0E17',
        light: '#FFFFFF'
      }
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setQrError(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setQrError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [linkedinUrl]);

  return (
    <aside
      aria-labelledby="linkedin-qr-heading"
      className="h-full p-5 sm:p-6 rounded-2xl bg-[#FBF9F4] dark:bg-[#090E17] border border-[#DFD4C1] dark:border-[#C5A880]/30 shadow-2xl relative overflow-hidden flex flex-col justify-between"
    >
      {/* Subtle Decorative Gold Glow */}
      <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-[#C5A880]/10 dark:bg-[#C5A880]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0A66C2]/15 border border-[#0A66C2]/40 flex items-center justify-center text-[#0A66C2] dark:text-[#5BA4EE] shrink-0">
            <QrCode className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C6D3B] dark:text-[#C5A880] font-semibold">
            {language === 'sw' ? 'Uunganisho wa Simu' : 'Mobile Access'}
          </span>
        </div>

        <div>
          <h3
            id="linkedin-qr-heading"
            className="text-base sm:text-lg font-cinzel text-[#121A28] dark:text-white font-bold tracking-wide leading-snug"
          >
            {language === 'sw' ? 'LinkedIn ya Kampuni' : 'Firm LinkedIn QR'}
          </h3>
          <p className="text-[11px] text-[#4A576D] dark:text-[#93A1B8] leading-relaxed mt-1">
            {language === 'sw'
              ? 'Changanua msimbo wa QR kufungua wasifu rasmi wa LinkedIn.'
              : 'Scan with your mobile camera to open our official LinkedIn chambers profile.'}
          </p>
        </div>
      </div>

      {/* Scannable QR Code Container */}
      <div className="relative z-10 my-4 flex flex-col items-center justify-center">
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Scan QR code or click to visit Petersons Angwenyi & Associates Advocates on LinkedIn"
          className="p-2.5 bg-white rounded-xl border-2 border-[#C5A880]/50 hover:border-[#C5A880] shadow-lg transition-transform hover:scale-[1.03] group block"
        >
          {qrDataUrl && !qrError ? (
            <img
              src={qrDataUrl}
              alt="QR code linking to Petersons Angwenyi & Associates Advocates LinkedIn profile"
              className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded"
            />
          ) : (
            <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center bg-slate-100 text-slate-500 text-xs font-mono rounded">
              <QrCode className="w-8 h-8 animate-pulse text-[#8C6D3B]" />
            </div>
          )}
        </a>

        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-[#5C6A80] dark:text-[#8C98AE]">
          <Smartphone className="w-3 h-3 text-[#C5A880]" />
          <span>Point camera to scan</span>
        </div>
      </div>

      {/* Direct LinkedIn Link */}
      <div className="relative z-10 pt-3 border-t border-[#E4DCCF] dark:border-[#1C263A]">
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 px-3 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2] text-[#0A66C2] dark:text-[#5BA4EE] hover:text-white border border-[#0A66C2]/30 hover:border-[#0A66C2] text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5"
        >
          <svg
            className="w-3.5 h-3.5 fill-current shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
          </svg>
          <span>Firm LinkedIn</span>
          <ExternalLink className="w-3 h-3 opacity-75" />
        </a>
      </div>
    </aside>
  );
};
