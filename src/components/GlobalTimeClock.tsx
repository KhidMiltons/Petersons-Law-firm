import React, { useState, useEffect } from 'react';
import { Clock, Globe, ShieldCheck, X, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface HubTimeInfo {
  id: string;
  cityKey: string;
  country: string;
  timeZone: string;
  tzAbbr: string;
  offsetFromNairobi: string;
  role: string;
  roleSw: string;
  businessHours: string;
  businessHoursSw: string;
  isHQ?: boolean;
}

const HUBS: HubTimeInfo[] = [
  {
    id: 'nairobi',
    cityKey: 'Nairobi',
    country: 'Kenya',
    timeZone: 'Africa/Nairobi',
    tzAbbr: 'EAT',
    offsetFromNairobi: 'HQ (UTC+3)',
    role: 'Chambers Headquarters & Superior Courts of Kenya',
    roleSw: 'Makao Makuu ya Ofisi & Mahakama Kuu za Kenya',
    businessHours: '08:00 – 18:00 EAT (24/7 Injunction Standby)',
    businessHoursSw: 'Saa 2:00 Asubuhi – 12:00 Jioni (Dharura 24/7)',
    isHQ: true,
  },
  {
    id: 'london',
    cityKey: 'London',
    country: 'United Kingdom',
    timeZone: 'Europe/London',
    tzAbbr: 'GMT/BST',
    offsetFromNairobi: '-3 hrs from Nairobi (UTC+0/+1)',
    role: 'LCIA International Arbitration & Privy Council Precedents',
    roleSw: 'Usuluhishi wa Kimataifa (LCIA) & Sheria za Jumuiya ya Madola',
    businessHours: '09:00 – 17:30 GMT',
    businessHoursSw: 'Saa 3:00 Asubuhi – 11:30 Jioni GMT',
  },
  {
    id: 'newyork',
    cityKey: 'New York',
    country: 'United States',
    timeZone: 'America/New_York',
    tzAbbr: 'EST/EDT',
    offsetFromNairobi: '-8 hrs from Nairobi (UTC-5/-4)',
    role: 'Wall Street Syndicated Finance & Sovereign Bond Advisory',
    roleSw: 'Ufadhili wa Fedha za Kimataifa & Dhamana za Serikali',
    businessHours: '09:00 – 17:00 EST',
    businessHoursSw: 'Saa 3:00 Asubuhi – 11:00 Jioni EST',
  },
];

export const GlobalTimeClock: React.FC<{
  onOpenConsultation?: () => void;
  variant?: 'header-bar' | 'compact-trigger' | 'drawer';
}> = ({ onOpenConsultation, variant = 'header-bar' }) => {
  const { language } = useLanguage();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Update every second for fluid precision
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatHubTime = (timeZone: string, includeSeconds = true) => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: includeSeconds ? '2-digit' : undefined,
        hour12: false,
      }).format(currentTime);
    } catch {
      return '--:--:--';
    }
  };

  const formatHubDate = (timeZone: string) => {
    try {
      return new Intl.DateTimeFormat(language === 'sw' ? 'sw-KE' : 'en-GB', {
        timeZone,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(currentTime);
    } catch {
      return '';
    }
  };

  // Helper to determine if hub is within standard business hours (8am - 6pm local)
  const isBusinessHours = (timeZone: string) => {
    try {
      const hourStr = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        hour12: false,
      }).format(currentTime);
      const hour = parseInt(hourStr, 10);
      return hour >= 8 && hour < 18;
    } catch {
      return true;
    }
  };

  if (variant === 'compact-trigger') {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#121824]/90 hover:bg-[#1A2334] border border-[#222B3D] text-[11px] font-mono text-[#A6B2C4] hover:text-white transition-colors"
          title="Global Chambers & Financial Hub Clocks"
          aria-label="View global time zones for Nairobi, London, and New York"
        >
          <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
          <span className="text-[#C5A880] font-semibold">NBO {formatHubTime('Africa/Nairobi', false)}</span>
          <span className="text-[#4E5D78]">·</span>
          <span className="hidden xl:inline text-[#8C98AE]">LON {formatHubTime('Europe/London', false)}</span>
          <span className="hidden xl:inline text-[#4E5D78]">·</span>
          <span className="hidden xl:inline text-[#8C98AE]">NYC {formatHubTime('America/New_York', false)}</span>
        </button>

        {isModalOpen && (
          <GlobalHubsModal
            onClose={() => setIsModalOpen(false)}
            onOpenConsultation={onOpenConsultation}
            currentTime={currentTime}
            formatHubTime={formatHubTime}
            formatHubDate={formatHubDate}
            isBusinessHours={isBusinessHours}
            language={language}
          />
        )}
      </>
    );
  }

  if (variant === 'drawer') {
    return (
      <div className="rounded-xl border border-[#1C2537] bg-[#0E131E] p-4 text-xs font-mono space-y-3">
        <div className="flex items-center justify-between text-[#8C98AE] pb-2 border-b border-[#1C2537]">
          <span className="flex items-center gap-1.5 text-[#C5A880] font-semibold tracking-wider uppercase text-[11px]">
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Muda wa Kimataifa' : 'Global Chambers Clocks'}</span>
          </span>
          <span className="text-[10px] text-[#4E5D78]">EAT / GMT / EST</span>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-1">
          {HUBS.map((hub) => (
            <div
              key={hub.id}
              className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                hub.isHQ
                  ? 'bg-[#C5A880]/10 border-[#C5A880]/40 text-white'
                  : 'bg-[#121824] border-[#1E283A] text-[#A6B2C4]'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-semibold ${hub.isHQ ? 'text-[#DFBE82]' : 'text-white'}`}>
                    {hub.cityKey}
                  </span>
                  <span className="text-[10px] text-[#718096]">({hub.tzAbbr})</span>
                  {hub.isHQ && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#C5A880]/20 text-[#DFBE82] border border-[#C5A880]/40">
                      HQ
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[#8C98AE] mt-0.5">
                  {language === 'sw' ? hub.roleSw : hub.role}
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <div className="font-mono text-sm font-bold tracking-wider text-[#E8EDF5]">
                  {formatHubTime(hub.timeZone, false)}
                </div>
                <div className="text-[9px] text-[#718096]">
                  {formatHubDate(hub.timeZone).split(',')[0]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: 'header-bar' (Hairline top strip)
  return (
    <>
      <div className="border-b border-[#17202F] bg-[#06090E]/95 backdrop-blur-md px-6 lg:px-8 py-1.5 text-[11px] font-mono tracking-wider text-[#8C98AE]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Global Hubs Live Clocks */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2.5 sm:gap-3.5 hover:text-white transition-colors text-left group cursor-pointer"
            title="Click for full cross-border arbitral & financial hub details"
          >
            <div className="flex items-center gap-1.5 text-[#C5A880]">
              <Clock className="w-3.5 h-3.5 text-[#C5A880] group-hover:rotate-45 transition-transform duration-300" />
              <span className="font-semibold tracking-wider text-[#DFBE82]">
                {language === 'sw' ? 'MUDA WA KIMATAIFA' : 'GLOBAL HUBS'}:
              </span>
            </div>

            {/* Nairobi (HQ) */}
            <div className="flex items-center gap-1.5 text-white font-medium">
              <span className="text-[#C5A880] font-bold">NAIROBI</span>
              <span className="text-[#E8EDF5] font-mono">{formatHubTime('Africa/Nairobi')}</span>
              <span className="text-[#718096] text-[10px]">EAT</span>
            </div>

            <span className="text-[#2C3B52]" aria-hidden="true">·</span>

            {/* London */}
            <div className="hidden sm:flex items-center gap-1.5 text-[#A6B2C4]">
              <span className="text-white">LONDON</span>
              <span className="text-[#CBD5E1] font-mono">{formatHubTime('Europe/London')}</span>
              <span className="text-[#718096] text-[10px]">GMT</span>
            </div>

            <span className="hidden sm:inline text-[#2C3B52]" aria-hidden="true">·</span>

            {/* New York */}
            <div className="hidden md:flex items-center gap-1.5 text-[#A6B2C4]">
              <span className="text-white">NEW YORK</span>
              <span className="text-[#CBD5E1] font-mono">{formatHubTime('America/New_York')}</span>
              <span className="text-[#718096] text-[10px]">EST</span>
            </div>

            <span className="hidden lg:inline text-[#C5A880] group-hover:translate-x-0.5 transition-transform text-[10px]">
              [+]
            </span>
          </button>

          {/* Right: Chambers Registry & International Arbitration Standby */}
          <div className="flex items-center gap-3 shrink-0 text-[10px] text-[#718096]">
            <div className="hidden md:flex items-center gap-1.5 text-[#A6B2C4]">
              <ShieldCheck className="w-3 h-3 text-[#C5A880]" />
              <span>
                {language === 'sw'
                  ? 'Masjala ya Upper Hill: Wazi'
                  : 'Upper Hill Chambers: Active Registry'}
              </span>
            </div>

            <span className="hidden md:inline text-[#2C3B52]">·</span>

            <span className="text-[#8C98AE]">
              {language === 'sw'
                ? 'Usuluhishi wa Kimataifa (NCIA / LCIA)'
                : 'Arbitration Counsel (NCIA / LCIA)'}
            </span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <GlobalHubsModal
          onClose={() => setIsModalOpen(false)}
          onOpenConsultation={onOpenConsultation}
          currentTime={currentTime}
          formatHubTime={formatHubTime}
          formatHubDate={formatHubDate}
          isBusinessHours={isBusinessHours}
          language={language}
        />
      )}
    </>
  );
};

interface GlobalHubsModalProps {
  onClose: () => void;
  onOpenConsultation?: () => void;
  currentTime: Date;
  formatHubTime: (timeZone: string, includeSeconds?: boolean) => string;
  formatHubDate: (timeZone: string) => string;
  isBusinessHours: (timeZone: string) => boolean;
  language: 'en' | 'sw';
}

const GlobalHubsModal: React.FC<GlobalHubsModalProps> = ({
  onClose,
  onOpenConsultation,
  formatHubTime,
  formatHubDate,
  isBusinessHours,
  language,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div
        className="w-full max-w-2xl bg-[#0B0F19] border border-[#222B3D] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-clock-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1C2537] bg-gradient-to-r from-[#0F1626] to-[#0B0F19]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono tracking-widest uppercase text-[#C5A880]">
                {language === 'sw' ? 'Mtandao wa Kisheria Duniani' : 'Cross-Border Practice Network'}
              </div>
              <h2 id="global-clock-title" className="text-lg md:text-xl font-serif font-bold text-white">
                {language === 'sw'
                  ? 'Muda wa Kazi katika Vituo Vikuu vya Kifedha na Kisheria'
                  : 'Global Time & International Financial Hubs'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#718096] hover:text-white rounded-lg hover:bg-[#1A2334] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-xs md:text-sm text-[#A6B2C4] leading-relaxed">
            {language === 'sw'
              ? 'Petersons Angwenyi & Associates Advocates ina uwepo thabiti na mahusiano ya karibu ya uwakilishi katika vituo vikuu vya kifedha na usuluhishi duniani, ikihakikisha ufuatiliaji wa wakati halisi wa masuala ya kibiashara na mabaraza ya kimataifa.'
              : 'Petersons Angwenyi & Associates Advocates provides seamless representation across primary commercial court jurisdictions and arbitral tribunals. Our chambers coordinates cross-border instructions in real time across the African, European, and North American business days.'}
          </p>

          {/* Hub Cards */}
          <div className="grid grid-cols-1 gap-3.5">
            {HUBS.map((hub) => {
              const active = isBusinessHours(hub.timeZone);
              return (
                <div
                  key={hub.id}
                  className={`p-4 rounded-xl border transition-all ${
                    hub.isHQ
                      ? 'bg-[#121927] border-[#C5A880]/40 ring-1 ring-[#C5A880]/20'
                      : 'bg-[#0E131E] border-[#1C2537]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-base text-white">
                          {hub.cityKey}, {hub.country}
                        </span>
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#1A2334] text-[#C5A880] border border-[#222B3D]">
                          {hub.tzAbbr}
                        </span>
                        {hub.isHQ && (
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#C5A880]/20 text-[#DFBE82] border border-[#C5A880]/40 font-semibold">
                            CHAMBERS HQ
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#8C98AE] mt-1 font-sans">
                        {language === 'sw' ? hub.roleSw : hub.role}
                      </div>
                      <div className="text-[11px] text-[#64748B] font-mono mt-0.5">
                        {hub.offsetFromNairobi} · {language === 'sw' ? hub.businessHoursSw : hub.businessHours}
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1A2334]">
                      <div className="font-mono text-xl md:text-2xl font-bold tracking-wider text-[#DFBE82]">
                        {formatHubTime(hub.timeZone, true)}
                      </div>
                      <div className="text-xs text-[#8C98AE] font-mono mt-0.5">
                        {formatHubDate(hub.timeZone)}
                      </div>
                      <div className="text-[10px] font-mono mt-1 text-[#64748B]">
                        {active ? (
                          <span className="text-[#84CC16]">● Core Hours Active</span>
                        ) : (
                          <span className="text-[#94A3B8]">○ After Hours / Standby</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cross-border note */}
          <div className="p-3.5 rounded-xl bg-[#141A28] border border-[#222B3D] flex items-start gap-3 text-xs text-[#A6B2C4]">
            <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-white">
                {language === 'sw' ? 'Usimamizi wa Kesi za Kimataifa:' : 'Cross-Border Arbitration Protocol:'}
              </strong>{' '}
              {language === 'sw'
                ? 'Mawasiliano na nyaraka za dharura za mahakama (Injunctions / Stay of Execution) hushughulikiwa saa 24 kupitia nambari maalum ya dharura ya Mawakili Waandamizi.'
                : 'Urgent preservative relief, arbitral emergency injunctions, and anti-suit proceedings are coordinated 24/7 through our dedicated emergency litigation desk in Upper Hill.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-[#1C2537] bg-[#0A0D15] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#718096] font-mono text-center sm:text-left">
            Evidence Act Section 134 Protected
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-[#A6B2C4] hover:text-white rounded-lg border border-[#222B3D] hover:bg-[#151D2C] transition-colors"
            >
              {language === 'sw' ? 'Funga' : 'Close'}
            </button>
            {onOpenConsultation && (
              <button
                onClick={() => {
                  onClose();
                  onOpenConsultation();
                }}
                className="flex-1 sm:flex-initial px-5 py-2 text-xs font-semibold text-[#0A0E17] bg-gradient-to-r from-[#C5A880] to-[#DFBE82] rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#C5A880]/20"
              >
                <span>{language === 'sw' ? 'Wasilisha Maagizo' : 'Instruct Counsel'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
