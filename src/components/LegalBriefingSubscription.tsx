import React, { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle2,
  Printer,
  Download,
  ArrowRight,
  BookOpen,
  AlertCircle,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { FIRM_DETAILS } from '../data/firmData';

export interface BriefingTopic {
  id: string;
  label: string;
  badge: string;
}

export const BRIEFING_TOPICS: BriefingTopic[] = [
  { id: 'corporate', label: 'Corporate Law & Governance', badge: 'Companies Act 2015' },
  { id: 'precedents', label: 'Landmark Judicial Precedents', badge: 'Superior Courts' },
  { id: 'arbitration', label: 'Commercial Arbitration', badge: 'NCIA & LCIA' },
  { id: 'finance', label: 'Banking & Securities', badge: 'ARO Escrows' },
];

const STORAGE_KEY_EMAIL = 'paa_briefing_sub_email';
const STORAGE_KEY_REF = 'paa_briefing_sub_ref';
const STORAGE_KEY_TOPICS = 'paa_briefing_sub_topics';

export const LegalBriefingSubscription: React.FC = () => {
  const { language, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'corporate',
    'precedents',
    'arbitration',
    'finance'
  ]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [subscriptionRef, setSubscriptionRef] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Restore persisted mock subscription if user previously subscribed
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(STORAGE_KEY_EMAIL) || localStorage.getItem('paa_newsletter_email');
      const savedRef = localStorage.getItem(STORAGE_KEY_REF) || localStorage.getItem('paa_newsletter_ref');
      const savedTopics = localStorage.getItem(STORAGE_KEY_TOPICS) || localStorage.getItem('paa_newsletter_topics');
      if (savedEmail && savedRef) {
        setIsSubscribed(true);
        setSubscribedEmail(savedEmail);
        setSubscriptionRef(savedRef);
        if (savedTopics) {
          const parsed = JSON.parse(savedTopics);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedTopics(parsed);
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleTopic = (id: string) => {
    if (isSubscribed || isSubmitting) return;
    setSelectedTopics((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least 1 selected
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const validateEmail = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return language === 'sw'
        ? 'Tafadhali weka anwani ya barua pepe ili kujiunga.'
        : 'Please enter your email address to subscribe.';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return language === 'sw'
        ? 'Tafadhali weka anwani sahihi ya barua pepe (mfano: mshauri@kampuni.co.ke).'
        : 'Please enter a valid email address (e.g. counsel@enterprise.com).';
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateEmail(email);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    const cleanEmail = email.trim();

    // Mock asynchronous API registration delay
    setTimeout(() => {
      const generatedRef = `PAA-BRF-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setIsSubmitting(false);
      setIsSubscribed(true);
      setSubscribedEmail(cleanEmail);
      setSubscriptionRef(generatedRef);
      setEmail('');

      try {
        localStorage.setItem(STORAGE_KEY_EMAIL, cleanEmail);
        localStorage.setItem(STORAGE_KEY_REF, generatedRef);
        localStorage.setItem(STORAGE_KEY_TOPICS, JSON.stringify(selectedTopics));
      } catch {
        // Ignore storage errors
      }
    }, 650);
  };

  const handleResetSubscription = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_EMAIL);
      localStorage.removeItem(STORAGE_KEY_REF);
      localStorage.removeItem(STORAGE_KEY_TOPICS);
      localStorage.removeItem('paa_newsletter_email');
      localStorage.removeItem('paa_newsletter_ref');
      localStorage.removeItem('paa_newsletter_topics');
    } catch {
      // Ignore storage errors
    }
    setIsSubscribed(false);
    setSubscribedEmail('');
    setSubscriptionRef('');
    setErrorMessage(null);
  };

  const handlePrintBriefing = () => {
    window.print();
  };

  const handleDownloadOfflineBriefing = () => {
    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const topicLabels = BRIEFING_TOPICS
      .filter((topic) => selectedTopics.includes(topic.id))
      .map((topic) => topic.label)
      .join(', ');

    const content = `================================================================================
PETERSONS ANGWENYI & ASSOCIATES ADVOCATES
UPPER HILL CHAMBERS, 8TH FLOOR, MARA ROAD, NAIROBI
LEGAL BRIEFING SUBSCRIPTION · MONTHLY CORPORATE LAW DIGEST
================================================================================

SUBSCRIPTION REF:    ${subscriptionRef || 'PAA-BRF-2026-ED11'}
EDITION:             VOL. XXVII · NOVEMBER 2026
SUBSCRIBED TOPICS:   ${topicLabels || 'Corporate Law & Landmark Judicial Precedents'}
DISPATCH DATE:       ${today}
ADVOCATE ROLL:       ${FIRM_DETAILS.lskRoll}
PRIVILEGE STATUS:    Section 134 Evidence Act (Cap 80) Privilege Enforced

--------------------------------------------------------------------------------
MONTHLY LEGAL UPDATES SUMMARY (NOVEMBER 2026)
--------------------------------------------------------------------------------

1. COMPANIES ACT 2015: BENEFICIAL OWNERSHIP REGISTRATION (BRS)
   The Business Registration Service has escalated enforcement on Ultimate
   Beneficial Ownership (UBO) filings under Section 93A of the Companies Act.

2. SECTIONAL PROPERTIES ACT 2020: CONVERSION OF LONG-TERM LEASES
   The High Court (Environment & Land Division) has upheld the mandatory
   conversion of long-term architectural sub-leases to sectional titles under
   ArdhiSasa.

3. COMMERCIAL ARBITRATION: EMERGENCY ARBITRATOR AWARDS (NCIA RULES)
   Conservatory orders granted by emergency arbitrators seated under NCIA Rules
   2015 are enforceable by the High Court under Section 36 of the Arbitration Act.

4. ESCROW COMPLIANCE UNDER ADVOCATES (REMUNERATION) ORDER (ARO)
   Institutional client accounts and designated bank escrow facilities remain
   strictly segregated under the Advocates (Accounts) Rules.

--------------------------------------------------------------------------------
SUBSCRIBER RECORD:   ${subscribedEmail || 'Institutional Counsel'}
STATUS:              ACTIVE · MONTHLY DISPATCH CONFIRMED
CONTACT:             ${FIRM_DETAILS.email} | Tel: ${FIRM_DETAILS.phone}
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PAA_Legal_Briefing_Subscription_Nov_2026.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <section
        aria-labelledby="legal-briefing-subscription-heading"
        className="h-full p-6 sm:p-8 rounded-2xl bg-[#FBF9F4] dark:bg-[#090E17] border border-[#DFD4C1] dark:border-[#C5A880]/30 shadow-2xl relative overflow-hidden flex flex-col justify-between"
      >
        {/* Subtle Decorative Gold Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#C5A880]/10 dark:bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 xl:grid-cols-1 gap-6 items-start">
          {/* Top / Left Block: Title, Editorial Context & Briefing Focus Areas */}
          <div className="md:col-span-6 xl:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C5A880]/15 border border-[#C5A880]/40 flex items-center justify-center text-[#8C6D3B] dark:text-[#C5A880] shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C6D3B] dark:text-[#C5A880] font-semibold">
                {language === 'sw'
                  ? 'Taarifa za Kisheria za Kila Mwezi · Dawati la Utafiti'
                  : 'Monthly Legal Updates · Chambers Research Desk'}
              </span>
            </div>

            <div>
              <h3
                id="legal-briefing-subscription-heading"
                className="text-xl sm:text-2xl font-cinzel text-[#121A28] dark:text-white font-bold tracking-wide"
              >
                {language === 'sw' ? 'Usajili wa Taarifa za Kisheria' : 'Legal Briefing Subscription'}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A576D] dark:text-[#93A1B8] leading-relaxed max-w-xl font-sans mt-1.5">
                {t('briefings.subtitle')}
              </p>
            </div>

            {/* Topic Focus Preferences */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-mono uppercase text-[#5C6A80] dark:text-[#718096] block tracking-wider">
                {language === 'sw' ? 'Chagua Mada za Taarifa:' : 'Briefing Focus Areas:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BRIEFING_TOPICS.map((topic) => {
                  const isChecked = selectedTopics.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => toggleTopic(topic.id)}
                      disabled={isSubscribed || isSubmitting}
                      className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between text-xs ${
                        isSubscribed ? 'opacity-80 cursor-default' : 'cursor-pointer'
                      } ${
                        isChecked
                          ? 'bg-white dark:bg-[#141C2B] border-[#C5A880]/60 text-[#121A28] dark:text-white shadow-sm'
                          : 'bg-[#F4EFE4] dark:bg-[#0B1019] border-[#E4DCCF] dark:border-[#1C273B] text-[#5C6A80] dark:text-[#718096] hover:border-[#C5A880]/40'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold block truncate text-[11px] sm:text-xs">
                          {topic.label}
                        </span>
                        <span className="text-[9px] font-mono text-[#8C6D3B] dark:text-[#C5A880]">
                          {topic.badge}
                        </span>
                      </div>
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border text-[10px] ${
                          isChecked
                            ? 'bg-[#C5A880] border-[#C5A880] text-[#0A0E17] font-bold'
                            : 'border-[#B8B0A0] dark:border-[#2D3E5B] bg-transparent'
                        }`}
                      >
                        {isChecked && '✓'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Metadata Strip & Synopsis Preview Toggle */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E4DCCF] dark:border-[#1C263A]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#5C6A80] dark:text-[#718096] font-mono">
                <span className="text-[#8C6D3B] dark:text-[#C5A880] font-semibold">Monthly Dispatch</span>
                <span aria-hidden="true">·</span>
                <span>Cap 80 § 134 Privileged</span>
                <span aria-hidden="true">·</span>
                <span>Unsubscribe Anytime</span>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewOpen((prev) => !prev)}
                className="text-xs text-[#8C6D3B] dark:text-[#C5A880] hover:underline font-mono flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{isPreviewOpen ? 'Hide Issue Preview' : 'Preview Vol. XXVII'}</span>
                <span className="text-[10px]">{isPreviewOpen ? '▲' : '▼'}</span>
              </button>
            </div>
          </div>

          {/* Bottom / Right Block: Email Sign-up Form with Validation OR Mock Success State */}
          <div className="md:col-span-6 xl:col-span-1">
            {!isSubscribed ? (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-4 bg-white dark:bg-[#0C121E] p-5 sm:p-6 rounded-xl border border-[#E4DCCF] dark:border-[#1E2B40] shadow-lg"
              >
                <div className="space-y-1">
                  <label
                    htmlFor="briefing-subscription-email"
                    className="text-xs sm:text-sm font-semibold text-[#121A28] dark:text-white block"
                  >
                    {language === 'sw'
                      ? 'Pokea Taarifa za Kisheria za Kila Mwezi'
                      : 'Sign Up for Monthly Legal Updates'}
                  </label>
                  <p className="text-[11px] text-[#5C6A80] dark:text-[#8C98AE]">
                    Dispatched on the first Tuesday of every month to general counsels, legal teams, and executives.
                  </p>
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className={`w-4 h-4 ${errorMessage ? 'text-rose-500' : 'text-[#8C6D3B] dark:text-[#C5A880]'}`} />
                    </div>
                    <input
                      id="briefing-subscription-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      disabled={isSubmitting}
                      aria-invalid={!!errorMessage}
                      aria-describedby={errorMessage ? 'briefing-email-error' : undefined}
                      placeholder={t('briefings.placeholder')}
                      className={`w-full pl-10 pr-4 py-3 bg-[#FAF8F5] dark:bg-[#080D16] border rounded-xl text-xs sm:text-sm text-[#121A28] dark:text-white placeholder-[#7A8699] dark:placeholder-[#5A677E] outline-none transition-all shadow-inner disabled:opacity-50 ${
                        errorMessage
                          ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/30'
                          : 'border-[#D9CEBC] dark:border-[#223048] focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]'
                      }`}
                    />
                  </div>

                  {/* Validation Feedback */}
                  {errorMessage && (
                    <div
                      id="briefing-email-error"
                      role="alert"
                      className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium animate-fadeIn"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </div>

                {/* Submit & Quick Print Row */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#DFBE82] hover:brightness-105 text-[#0A0E17] text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#C5A880]/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#0A0E17]" />
                        <span>{t('briefings.subscribing')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('briefings.subscribe')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintBriefing}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-[#F4EFE4] dark:bg-[#121B2B] hover:bg-[#EAE2D2] dark:hover:bg-[#1A263C] text-[#8C6D3B] dark:text-[#C5A880] border border-[#DFD4C1] dark:border-[#C5A880]/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
                    title="Print current Legal Briefing using clean A4 print styles"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Legal Briefing</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-[#5C6A80] dark:text-[#5D6B80]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8C6D3B] dark:text-[#C5A880] shrink-0" />
                  <span>{t('briefings.frequency')}</span>
                </div>
              </form>
            ) : (
              /* Mock Success State Confirmation Card */
              <div
                role="status"
                aria-live="polite"
                className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0C1522] border border-emerald-500/50 space-y-4 animate-fadeIn text-xs shadow-xl"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/90 border border-emerald-500/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-[#121A28] dark:text-white font-semibold text-sm">
                        {t('briefings.successTitle')}
                      </h4>
                      <p className="text-[#5C6A80] dark:text-[#8C98AE] text-[11px] font-mono">
                        {subscriptionRef} · Chambers Distribution List
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500/40 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-bold">
                    Subscribed
                  </span>
                </div>

                <p className="text-xs text-[#4A576D] dark:text-[#BAC5D6] leading-relaxed">
                  {t('briefings.successDesc')}
                </p>

                <div className="p-3.5 rounded-lg bg-[#FAF8F5] dark:bg-[#070B12] border border-[#E4DCCF] dark:border-[#1C283C] text-[11px] font-mono text-[#4A576D] dark:text-[#BAC5D6] space-y-1.5">
                  <div className="truncate">
                    <span className="text-[#718096]">Subscriber Email: </span>
                    <strong className="text-[#8C6D3B] dark:text-[#E4C999]">{subscribedEmail}</strong>
                  </div>
                  <div>
                    <span className="text-[#718096]">Selected Portfolios: </span>
                    <span className="text-[#121A28] dark:text-white font-semibold">
                      {selectedTopics.length} Legal Practice Desks
                    </span>
                  </div>
                  <div>
                    <span className="text-[#718096]">Next Issue: </span>
                    <span className="text-[#121A28] dark:text-white">
                      Vol. XXVIII — December 2026 (Tax Procedures &amp; eTIMS Compliance)
                    </span>
                  </div>
                </div>

                {/* Post-Subscription Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handlePrintBriefing}
                    className="flex-1 py-2.5 px-3 bg-[#F4EFE4] dark:bg-[#162235] hover:bg-[#C5A880] text-[#8C6D3B] dark:text-[#C5A880] hover:text-[#0A0E17] font-semibold rounded-lg border border-[#C5A880]/40 transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm cursor-pointer whitespace-nowrap"
                    title="Print subscription materials & briefing on clean A4 paper"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Legal Briefing</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadOfflineBriefing}
                    className="py-2.5 px-3 bg-[#FAF8F5] dark:bg-[#111A28] hover:bg-[#EAE2D2] dark:hover:bg-[#18253A] text-[#4A576D] dark:text-[#8C98AE] hover:text-[#121A28] dark:hover:text-white rounded-lg border border-[#E4DCCF] dark:border-[#202E44] transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#8C6D3B] dark:text-[#C5A880]" />
                    <span className="hidden sm:inline">Offline Copy (.txt)</span>
                  </button>
                </div>

                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={handleResetSubscription}
                    className="text-[11px] text-[#5C6A80] dark:text-[#718096] hover:text-[#8C6D3B] dark:hover:text-[#C5A880] underline transition-colors cursor-pointer"
                  >
                    {t('briefings.subAnother')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Current Issue Synopsis */}
        {isPreviewOpen && (
          <div className="mt-6 pt-6 border-t border-[#E4DCCF] dark:border-[#1C263A] space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-[#8C6D3B] dark:text-[#C5A880] font-semibold">
                Vol. XXVII (November 2026) · Executive Intelligence Synopsis
              </span>
              <span className="text-[10px] font-mono text-[#5C6A80] dark:text-[#718096]">
                4 In-Depth Briefings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-white dark:bg-[#070B12] rounded-xl border border-[#E4DCCF] dark:border-[#1A2538] space-y-1">
                <span className="text-[10px] font-mono text-[#8C6D3B] dark:text-[#C5A880] block font-semibold">
                  1. COMPANIES ACT 2015
                </span>
                <h5 className="text-xs font-semibold text-[#121A28] dark:text-white">
                  BRS Beneficial Ownership
                </h5>
                <p className="text-[11px] text-[#4A576D] dark:text-[#8C98AE] leading-relaxed">
                  Strict enforcement under Section 93A; statutory penalties for undisclosed nominee trusts.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-[#070B12] rounded-xl border border-[#E4DCCF] dark:border-[#1A2538] space-y-1">
                <span className="text-[10px] font-mono text-[#8C6D3B] dark:text-[#C5A880] block font-semibold">
                  2. SECTIONAL PROPERTIES
                </span>
                <h5 className="text-xs font-semibold text-[#121A28] dark:text-white">
                  ArdhiSasa Lease Conversions
                </h5>
                <p className="text-[11px] text-[#4A576D] dark:text-[#8C98AE] leading-relaxed">
                  High Court upholds mandatory conversion of long-term commercial sub-leases to sectional titles.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-[#070B12] rounded-xl border border-[#E4DCCF] dark:border-[#1A2538] space-y-1">
                <span className="text-[10px] font-mono text-[#8C6D3B] dark:text-[#C5A880] block font-semibold">
                  3. COMMERCIAL ARBITRATION
                </span>
                <h5 className="text-xs font-semibold text-[#121A28] dark:text-white">
                  Emergency Arbitrator Relief
                </h5>
                <p className="text-[11px] text-[#4A576D] dark:text-[#8C98AE] leading-relaxed">
                  Direct judicial enforcement of NCIA conservatory awards under Section 36 of Arbitration Act.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-[#070B12] rounded-xl border border-[#E4DCCF] dark:border-[#1A2538] space-y-1">
                <span className="text-[10px] font-mono text-[#8C6D3B] dark:text-[#C5A880] block font-semibold">
                  4. STATUTORY REMUNERATION
                </span>
                <h5 className="text-xs font-semibold text-[#121A28] dark:text-white">
                  ARO Escrow Protection
                </h5>
                <p className="text-[11px] text-[#4A576D] dark:text-[#8C98AE] leading-relaxed">
                  Segregation of advance project deposits at institutional trust facilities in Upper Hill.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Print-ready A4 briefing document */}
      <div id="printable-briefing" className="hidden font-serif text-black p-4 text-xs leading-relaxed">
        <div className="border-b-2 border-black pb-4 mb-4 text-center space-y-1 font-sans">
          <div className="text-[10px] uppercase tracking-widest font-mono text-slate-800 font-bold">
            REPUBLIC OF KENYA · THE SENIOR COUNSEL &amp; APPELLATE BAR
          </div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-black">
            PETERSONS ANGWENYI &amp; ASSOCIATES ADVOCATES
          </h1>
          <p className="text-xs text-slate-700 font-serif">
            Upper Hill Chambers, 8th Floor, Mara Road, Nairobi · P.O. Box 48920-00100 GPO, Nairobi
          </p>
          <div className="text-[10px] font-mono text-slate-600 pt-1">
            TEL: {FIRM_DETAILS.phone} · EMAIL: {FIRM_DETAILS.email} · {FIRM_DETAILS.lskRoll}
          </div>
        </div>

        <div className="border border-black p-3 mb-4 bg-slate-50 flex items-center justify-between font-sans text-xs">
          <div>
            <span className="font-bold uppercase tracking-wider block text-black">
              MONTHLY CORPORATE LEGAL BRIEFING · VOL. XXVII
            </span>
            <span className="text-[10px] text-slate-700">
              Official Law Review Series &amp; Subscription Materials for General Counsels &amp; Executive Boards
            </span>
          </div>
          <div className="text-right text-[10px] font-mono">
            <span>ISSUE DATE: NOVEMBER 2026</span>
            <br />
            <span>REF: {subscriptionRef || 'PAA/BRF/2026/ED-11'}</span>
          </div>
        </div>

        <div className="border border-dashed border-slate-600 p-2.5 mb-4 text-[10px] font-mono bg-slate-100 flex flex-wrap items-center justify-between gap-2">
          <span>
            SUBSCRIBER RECORD: <strong>{subscribedEmail || 'Institutional Counsel / Corporate Board Subscriber'}</strong>
          </span>
          <span>
            PORTFOLIOS: <strong>{BRIEFING_TOPICS.filter((topic) => selectedTopics.includes(topic.id)).map((topic) => topic.label).join(', ')}</strong>
          </span>
          <span>CAP 80 S. 134 PRIVILEGE ENFORCED</span>
        </div>

        <div className="mb-4 text-justify italic text-[11px] text-slate-800 border-l-2 border-slate-800 pl-3">
          "This monthly digest is formulated by the Chambers Research &amp; Knowledge Management Desk under the direction of Senior Counsel Milton Angwenyi, summarizing key legislative enactments, superior court holdings, and regulatory guidelines impacting enterprise risk across Eastern Africa."
        </div>

        <div className="space-y-4 pt-1">
          <div className="border-t border-slate-300 pt-2">
            <h3 className="font-bold text-sm uppercase text-black font-sans mb-1">
              1. COMPANIES ACT 2015: BENEFICIAL OWNERSHIP DISCLOSURE &amp; BRS ENFORCEMENT
            </h3>
            <p className="text-[11px] text-justify">
              The Business Registration Service (BRS) has initiated strict enforcement proceedings under Section 93A of the Companies Act 2015. Companies failing to maintain an updated Register of Ultimate Beneficial Owners (UBO) face statutory compliance penalties. Nominee arrangements, offshore parent holdings, and trust structures exceeding the 10% threshold must be logged via the BRS registry portal.
            </p>
          </div>
          <div className="border-t border-slate-300 pt-2">
            <h3 className="font-bold text-sm uppercase text-black font-sans mb-1">
              2. SECTIONAL PROPERTIES ACT 2020: CONVERSION OF SUB-LEASES UNDER ARDHISASA
            </h3>
            <p className="text-[11px] text-justify">
              Developers and management corporations are mandated under Section 13(2) of the Sectional Properties Act 2020 to surrender long-term architectural sub-leases and register geo-referenced sectional title plans on ArdhiSasa to preserve chargeability and title transferability.
            </p>
          </div>
          <div className="border-t border-slate-300 pt-2">
            <h3 className="font-bold text-sm uppercase text-black font-sans mb-1">
              3. COMMERCIAL ARBITRATION: EMERGENCY ARBITRATOR INTERIM RELIEF (NCIA)
            </h3>
            <p className="text-[11px] text-justify">
              The High Court (Commercial Division) in Nairobi has reaffirmed that conservatory orders granted by emergency arbitrators under the Nairobi Centre for International Arbitration (NCIA) Rules 2015 are enforceable under Section 36 of the Arbitration Act 1995.
            </p>
          </div>
          <div className="border-t border-slate-300 pt-2">
            <h3 className="font-bold text-sm uppercase text-black font-sans mb-1">
              4. ADVOCATES (REMUNERATION) ORDER: CLIENT ESCROW SEGREGATION
            </h3>
            <p className="text-[11px] text-justify">
              All stakeholder deposits and advance retainers tendered under Cap 16 Schedule VI remain segregated in designated institutional trust facilities under the Advocates (Accounts) Rules.
            </p>
          </div>
        </div>

        <div className="border-t-2 border-black pt-4 mt-6 flex items-end justify-between text-[10px] font-mono">
          <div>
            <span className="font-bold block uppercase">CERTIFIED BY CHAMBERS REGISTRAR:</span>
            <span>Milton Angwenyi, SC &amp; Lead Advocates</span>
            <br />
            <span>Petersons Angwenyi &amp; Associates Advocates · Nairobi</span>
          </div>
          <div className="text-right">
            <div className="border border-black p-2 inline-block text-center min-w-[160px]">
              <span className="font-bold block uppercase text-[9px]">HIGH COURT ADVOCATES SEAL</span>
              <span className="italic font-serif block my-0.5">M. Angwenyi, SC</span>
              <span className="text-[8px] block">LSK Practising Certificate 2026</span>
            </div>
          </div>
        </div>

        <div className="pt-3 text-center text-[9px] text-slate-600 font-mono">
          Section 134 Evidence Act (Cap 80) Privilege Enforced · A4 Printer-Ready Edition · Official Chambers Publication
        </div>
      </div>
    </>
  );
};
