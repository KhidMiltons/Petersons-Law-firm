import React, { useState, useEffect } from 'react';
import { ADVOCATES, Advocate } from '../data/firmData';
import { Mail, ArrowRight, X, Camera, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ProfilePhotoCaptureModal } from './ProfilePhotoCaptureModal';

const ADVOCATE_PHOTOS_STORAGE_KEY = 'paa_advocate_headshots_v1';

interface AdvocatesTeamProps {
  onOpenConsultation: (practice?: string, estimate?: string, advocate?: string) => void;
}

function getInitials(name: string): string {
  return name
    .replace(/,.*$/, '')
    .replace(/^Dr\.\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function loadSavedHeadshots(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(ADVOCATE_PHOTOS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const valid: Record<string, string> = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (typeof val === 'string' && val.startsWith('data:image/')) {
        valid[key] = val;
      }
    }
    return valid;
  } catch {
    return {};
  }
}

export const AdvocatesTeam: React.FC<AdvocatesTeamProps> = ({ onOpenConsultation }) => {
  const { language, t } = useLanguage();
  const [activeAdvocate, setActiveAdvocate] = useState<Advocate | null>(null);
  const [capturingAdvocate, setCapturingAdvocate] = useState<Advocate | null>(null);
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>(() =>
    loadSavedHeadshots()
  );
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [savedNoticeId, setSavedNoticeId] = useState<string | null>(null);

  useEffect(() => {
    if (!savedNoticeId) return;
    const timer = window.setTimeout(() => setSavedNoticeId(null), 3000);
    return () => window.clearTimeout(timer);
  }, [savedNoticeId]);

  const handleSavePhoto = (advocateId: string, dataUrl: string) => {
    const next = { ...customPhotos, [advocateId]: dataUrl };
    setCustomPhotos(next);
    setFailedImages((prev) => ({ ...prev, [advocateId]: false }));
    try {
      window.localStorage.setItem(ADVOCATE_PHOTOS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors cleanly
    }
    setCapturingAdvocate(null);
    setSavedNoticeId(advocateId);
  };

  const handleResetPhoto = (advocateId: string) => {
    const next = { ...customPhotos };
    delete next[advocateId];
    setCustomPhotos(next);
    try {
      window.localStorage.setItem(ADVOCATE_PHOTOS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  };

  const getPortraitUrl = (advocate: Advocate): string | undefined => {
    if (customPhotos[advocate.id]) return customPhotos[advocate.id];
    if (advocate.image && !failedImages[advocate.id]) return advocate.image;
    return undefined;
  };

  return (
    <section
      id="advocates"
      className="py-24 bg-[#FAF8F5] dark:bg-[#080B11] border-b border-[#E4DCCF] dark:border-[#1E2536] relative"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880] mb-3 font-semibold">
            <span>{t('advocates.kicker')}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-cinzel text-[#121A28] dark:text-white tracking-tight">
            {t('advocates.title')}
          </h2>
          <p className="mt-4 text-[#4A576D] dark:text-[#9BA5B7] leading-relaxed">
            {t('advocates.subtitle')}
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ADVOCATES.map((advocate) => {
            const portraitUrl = getPortraitUrl(advocate);
            const hasCustomPhoto = Boolean(customPhotos[advocate.id]);
            const justSaved = savedNoticeId === advocate.id;

            return (
              <div
                key={advocate.id}
                className="group p-6 rounded-2xl bg-white dark:bg-[#0E1522] border border-[#E4DCCF] dark:border-[#1C263A] hover:border-[#C5A880]/70 dark:hover:border-[#C5A880]/60 hover:shadow-2xl hover:shadow-[#C5A880]/10 dark:hover:shadow-[#C5A880]/5 transition-all duration-300 ease-out flex flex-col justify-between transform hover:-translate-y-1 shadow-sm dark:shadow-none"
              >
                <div>
                  {/* Roll Number & Rank Kicker */}
                  <div className="flex items-center justify-between text-xs font-mono text-[#8C6B32] dark:text-[#C5A880] mb-4">
                    <span>{advocate.rollNumber}</span>
                    <span className="text-[#5C6A80] dark:text-[#6F7A8F] truncate max-w-[180px]">
                      {advocate.title.split('&')[0].trim()}
                    </span>
                  </div>

                  {/* Headshot Portrait + Take Profile Photo Trigger */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#F1ECE1] dark:bg-[#141D2D] border border-[#C5A880]/45 flex items-center justify-center shadow-inner">
                        {portraitUrl ? (
                          <img
                            src={portraitUrl}
                            alt={`Headshot portrait of ${advocate.name}`}
                            onError={() =>
                              setFailedImages((prev) => ({
                                ...prev,
                                [advocate.id]: true,
                              }))
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-cinzel font-bold text-lg text-[#8C6B32] dark:text-[#C5A880] tracking-wider">
                            {getInitials(advocate.name)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setCapturingAdvocate(advocate)}
                        title={`${t('advocates.takePhoto')} — ${advocate.name}`}
                        aria-label={`${t('advocates.takePhoto')} for ${advocate.name}`}
                        className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#C5A880] hover:bg-[#DFBE82] text-[#080B11] border-2 border-white dark:border-[#0E1522] flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-cinzel font-bold text-[#121A28] dark:text-white group-hover:text-[#8C6B32] dark:group-hover:text-[#DFBE82] transition-colors leading-snug">
                        {advocate.name}
                      </h3>
                      <p className="text-xs text-[#5C6A80] dark:text-[#8C98AE] mt-0.5 font-medium line-clamp-2">
                        {advocate.role}
                      </p>

                      {/* Inline Camera Update / Reset Controls */}
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setCapturingAdvocate(advocate)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8C6B32] dark:text-[#C5A880] hover:underline cursor-pointer"
                        >
                          <Camera className="w-3 h-3" />
                          <span>
                            {hasCustomPhoto || portraitUrl
                              ? t('advocates.updatePhoto')
                              : t('advocates.takePhoto')}
                          </span>
                        </button>

                        {hasCustomPhoto && (
                          <button
                            type="button"
                            onClick={() => handleResetPhoto(advocate.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-[#6F7A8F] dark:text-[#78869E] hover:text-rose-500 transition-colors cursor-pointer"
                            title="Revert to default chambers headshot"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>{t('advocates.resetPhoto')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {justSaved && (
                    <div className="mb-3 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {language === 'sw'
                          ? 'Picha mpya ya wasifu imehifadhiwa.'
                          : 'Profile headshot updated.'}
                      </span>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-[#4A576D] dark:text-[#BAC5D6] line-clamp-3 leading-relaxed">
                    {advocate.bio}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#EFE8DA] dark:border-[#1C2436] space-y-1.5">
                    <div className="text-[11px] text-[#5C6A80] dark:text-[#8C98AE]">
                      <strong className="text-[#121A28] dark:text-white">
                        {t('advocates.credentials')}:
                      </strong>{' '}
                      {advocate.credentials}
                    </div>
                    <div className="text-[11px] text-[#8C6B32] dark:text-[#C5A880]">
                      {advocate.specialties.slice(0, 2).join(' · ')}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#EFE8DA] dark:border-[#1C2436] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveAdvocate(advocate)}
                    className="text-xs text-[#5C6A80] dark:text-[#8C98AE] hover:text-[#121A28] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {t('advocates.viewBio')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenConsultation(undefined, undefined, advocate.name)}
                    className="px-3.5 py-1.5 bg-[#F5EFE4] dark:bg-[#141C2B] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#8C6B32] dark:text-[#C5A880] text-xs font-semibold rounded-lg border border-[#C5A880]/40 dark:border-transparent transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{t('advocates.instruct')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Advocate Bio Modal */}
        {activeAdvocate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-xl bg-white dark:bg-[#0D131F] border border-[#DFD4C1] dark:border-[#C5A880]/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

              <div className="p-6 bg-[#F6F1E6] dark:bg-[#121927] border-b border-[#E4DCCF] dark:border-[#222E46] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#E8E0D1] dark:bg-[#172235] border border-[#C5A880]/50 flex items-center justify-center shrink-0">
                    {getPortraitUrl(activeAdvocate) ? (
                      <img
                        src={getPortraitUrl(activeAdvocate)}
                        alt={activeAdvocate.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-cinzel font-bold text-base text-[#8C6B32] dark:text-[#C5A880]">
                        {getInitials(activeAdvocate.name)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880] font-mono block">
                      {activeAdvocate.rollNumber}
                    </span>
                    <h3 className="text-xl font-cinzel text-[#121A28] dark:text-white mt-0.5 truncate">
                      {activeAdvocate.name}
                    </h3>
                    <p className="text-xs text-[#5C6A80] dark:text-[#8C98AE] truncate">
                      {activeAdvocate.title} &mdash; {activeAdvocate.role}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAdvocate(null)}
                  aria-label="Close advocate bio"
                  className="p-2 text-[#5C6A80] dark:text-[#8C98AE] hover:text-[#121A28] dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-5 text-xs text-[#324056] dark:text-[#B2BDCE] leading-relaxed overflow-y-auto">
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#121927] border border-[#E4DCCF] dark:border-[#1E283A] flex-wrap">
                  <span className="text-xs text-[#5C6A80] dark:text-[#8C98AE]">
                    {language === 'sw'
                      ? 'Picha rasmi ya wasifu wa wakili:'
                      : 'Official Chambers Headshot:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCapturingAdvocate(activeAdvocate)}
                    className="px-3 py-1.5 rounded-lg bg-[#C5A880]/15 hover:bg-[#C5A880] text-[#8C6B32] dark:text-[#E4C999] hover:text-[#0A0E17] border border-[#C5A880]/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{t('advocates.takePhoto')}</span>
                  </button>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#121A28] dark:text-white font-semibold mb-1.5">
                    Academic &amp; Professional Qualifications
                  </h4>
                  <p className="font-mono text-[#8C6B32] dark:text-[#C5A880]">
                    {activeAdvocate.credentials}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#121A28] dark:text-white font-semibold mb-1.5">
                    Bar Admissions &amp; Fellowships
                  </h4>
                  <ul className="space-y-1 text-[#4A576D] dark:text-[#8C98AE]">
                    {activeAdvocate.admissions.map((adm, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#C5A880]">•</span>
                        <span>{adm}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#121A28] dark:text-white font-semibold mb-1.5">
                    Legal Practice Profile
                  </h4>
                  <p>{activeAdvocate.bio}</p>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#121A28] dark:text-white font-semibold mb-1.5">
                    Key Areas of Advisory
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeAdvocate.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-[#F5EFE4] dark:bg-[#141B28] rounded border border-[#E4DCCF] dark:border-[#222B3E] text-[11px] text-[#8C6B32] dark:text-[#E4C999]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#F6F1E6] dark:bg-[#121927] border-t border-[#E4DCCF] dark:border-[#222E46] flex items-center justify-between gap-3 flex-wrap">
                <a
                  href={`mailto:${activeAdvocate.email}`}
                  className="text-xs text-[#4A576D] dark:text-[#8C98AE] hover:text-[#121A28] dark:hover:text-white flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880]" />
                  <span>{activeAdvocate.email}</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const advName = activeAdvocate.name;
                    setActiveAdvocate(null);
                    onOpenConsultation(undefined, undefined, advName);
                  }}
                  className="px-4 py-2 bg-[#C5A880] text-[#0A0E17] font-semibold text-xs tracking-wider uppercase rounded-lg hover:brightness-110 cursor-pointer"
                >
                  {t('advocates.modalSchedule')}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Camera Headshot Capture Modal */}
        {capturingAdvocate && (
          <ProfilePhotoCaptureModal
            advocate={capturingAdvocate}
            currentPhotoUrl={getPortraitUrl(capturingAdvocate)}
            onSavePhoto={handleSavePhoto}
            onClose={() => setCapturingAdvocate(null)}
          />
        )}

      </div>
    </section>
  );
};
