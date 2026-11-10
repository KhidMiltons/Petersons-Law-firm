import React, { useState, useEffect } from 'react';
import { 
  Mail, CheckCircle2, Printer, Download, Sparkles, 
  ShieldCheck, ArrowRight, BookOpen, AlertCircle, RefreshCw, FileText
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { FIRM_DETAILS } from '../data/firmData';

export const LegalBriefingsNewsletter: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [subscriptionRef, setSubscriptionRef] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Restore stored subscription from localStorage if available
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('paa_newsletter_email');
      const savedRef = localStorage.getItem('paa_newsletter_ref');
      if (savedEmail && savedRef) {
        setIsSubscribed(true);
        setSubscribedEmail(savedEmail);
        setSubscriptionRef(savedRef);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const validateEmail = (val: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter an official corporate email address.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid corporate or institutional email address.');
      return;
    }

    setIsSubmitting(true);

    // Simulate realistic chambers registry processing
    setTimeout(() => {
      const generatedRef = `PAA-NL-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setIsSubmitting(false);
      setIsSubscribed(true);
      setSubscribedEmail(cleanEmail);
      setSubscriptionRef(generatedRef);
      setEmail('');

      try {
        localStorage.setItem('paa_newsletter_email', cleanEmail);
        localStorage.setItem('paa_newsletter_ref', generatedRef);
      } catch {
        // Ignore storage errors
      }
    }, 600);
  };

  // Directly triggers browser print dialog targeting #printable-briefing via index.css @media print
  const handlePrintBriefing = () => {
    window.print();
  };

  // Download certified offline text briefing
  const handleDownloadOfflineBriefing = () => {
    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const content = `================================================================================
PETERSONS ANGWENYI & ASSOCIATES ADVOCATES
UPPER HILL CHAMBERS, 8TH FLOOR, MARA ROAD, NAIROBI
OFFICIAL LEGAL BRIEFINGS · MONTHLY CORPORATE LAW DIGEST
================================================================================

DOCUMENT REF:        ${subscriptionRef || 'PAA-NL-2026-ED11'}
ISSUE:               VOL. XXVII · NOVEMBER 2026 EDITION
TARGET AUDIENCE:     General Counsels, Corporate Secretaries & Executive Boards
DISPATCH DATE:       ${today}
STATUTORY CITATION:  PAA Monthly Law Review (Corporate Series) 2026
ADVOCATE ROLL:       ${FIRM_DETAILS.lskRoll}
PRIVILEGE STATUS:    Section 134 Evidence Act (Cap 80) Privilege Enforced

--------------------------------------------------------------------------------
EXECUTIVE LEGAL INTELLIGENCE (NOVEMBER 2026)
--------------------------------------------------------------------------------

1. COMPANIES ACT 2015: BENEFICIAL OWNERSHIP REGISTRATION (BRS)
   The Business Registration Service has escalated enforcement on Ultimate
   Beneficial Ownership (UBO) filings under Section 93A of the Companies Act.
   Corporate clients must ensure their registers reflect all shareholding 
   thresholds exceeding 10%, including nominee trust structures.

2. SECTIONAL PROPERTIES ACT 2020: CONVERSION OF LONG-TERM LEASES
   The High Court (Environment & Land Division) has upheld the mandatory
   conversion of long-term architectural sub-leases to sectional titles under
   ArdhiSasa. Chambers conveyancing department recommends immediate geo-referencing
   of mother titles to avoid transactional freezes.

3. COMMERCIAL ARBITRATION: EMERGENCY ARBITRATOR AWARDS (NCIA RULES)
   Recent rulings confirm that conservatory orders granted by emergency
   arbitrators seated under Nairobi Centre for International Arbitration (NCIA)
   Rules 2015 are directly enforceable by the High Court under Section 36 of 
   the Arbitration Act 1995.

4. ESCROW COMPLIANCE UNDER ADVOCATES (REMUNERATION) ORDER (ARO)
   Review of institutional client accounts and designated bank escrow facilities
   held at KCB Bank Kenya Upper Hill. Strict reconciliation standards apply to
   all advance security deposits and stakeholder guarantees.

--------------------------------------------------------------------------------
CERTIFIED SUBSCRIPTION RECORD
--------------------------------------------------------------------------------
SUBSCRIBER:          ${subscribedEmail || 'Institutional Counsel'}
STATUS:              ACTIVE · MONTHLY DISPATCH SCHEDULED
NEXT EDITION:        DECEMBER 2026 (Focus: Tax Procedures Act & eTIMS)
CHAMBERS CONTACT:    litigation@paalawkenya.com | Tel: ${FIRM_DETAILS.phone}

(c) ${new Date().getFullYear()} Petersons Angwenyi & Associates Advocates. All Rights Reserved.
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PAA_Legal_Briefings_Nov_2026.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetSubscription = () => {
    try {
      localStorage.removeItem('paa_newsletter_email');
      localStorage.removeItem('paa_newsletter_ref');
    } catch {
      // Ignore
    }
    setIsSubscribed(false);
    setSubscribedEmail('');
    setSubscriptionRef('');
  };

  return (
    <>
      {/* ================= ON-SCREEN FOOTER NEWSLETTER WIDGET ================= */}
      <div className="mb-14 p-6 sm:p-8 lg:p-10 rounded-2xl bg-[#090E17] border border-[#C5A880]/30 shadow-2xl relative overflow-hidden group">
        
        {/* Subtle decorative gold ambient glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Editorial Kicker & Description */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#C5A880] font-semibold">
                {t('briefings.kicker')}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-cinzel text-white font-bold tracking-wide">
              {t('briefings.title')}
            </h3>

            <p className="text-xs sm:text-sm text-[#93A1B8] leading-relaxed max-w-2xl font-sans">
              {t('briefings.subtitle')}
            </p>

            {/* Zero-Pill Unboxed Key Feature Indicators */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-[#718096] font-mono">
              <span className="text-[#C5A880]">Monthly Frequency</span>
              <span aria-hidden="true">·</span>
              <span>First Tuesday of Month</span>
              <span aria-hidden="true">·</span>
              <span>Cap 80 § 134 Privileged</span>
              <span aria-hidden="true">·</span>
              <span>Zero Third-Party Disclosures</span>
            </div>
          </div>

          {/* Right Column: Interactive Subscription Form or Subscribed Badge */}
          <div className="lg:col-span-5">
            {!isSubscribed ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#75849E]">
                    <Mail className="w-4 h-4 text-[#C5A880]" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    disabled={isSubmitting}
                    placeholder={t('briefings.placeholder')}
                    className="w-full pl-10 pr-4 py-3 bg-[#0D1420] border border-[#223048] focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] rounded-xl text-xs sm:text-sm text-white placeholder-[#5A677E] outline-none transition-all shadow-inner disabled:opacity-50"
                    required
                  />
                </div>

                {/* Validation Error Message */}
                {errorMessage && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-sans animate-fadeIn">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#DFBE82] hover:brightness-110 text-[#0A0E17] text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#C5A880]/15 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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

                  {/* Print Latest Briefing Quick Action */}
                  <button
                    type="button"
                    onClick={handlePrintBriefing}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-[#121B2B] hover:bg-[#1A263C] text-[#C5A880] hover:text-[#DFBE82] border border-[#C5A880]/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0"
                    title="Print November 2026 Legal Briefing directly using print styles"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print Nov 2026 Briefing</span>
                    <span className="sm:hidden">Print Briefing</span>
                  </button>
                </div>

                <p className="text-[10px] text-[#5D6B80] leading-tight">
                  {t('briefings.frequency')}
                </p>
              </form>
            ) : (
              /* Subscribed Confirmation Card */
              <div className="p-4 sm:p-5 rounded-xl bg-[#0D1624] border border-emerald-500/40 space-y-3 animate-fadeIn text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-950/90 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-white font-semibold text-xs sm:text-sm">
                        {t('briefings.successTitle')}
                      </h4>
                      <p className="text-[#8C98AE] text-[11px] font-mono">
                        {subscriptionRef} · Enrolled Active
                      </p>
                    </div>
                  </div>
                  
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 uppercase">
                    Confirmed
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#070B12] border border-[#1C283C] text-[11px] font-mono text-[#BAC5D6] space-y-0.5">
                  <div className="truncate">
                    <span className="text-[#718096]">Registered Email: </span>
                    <strong className="text-[#E4C999]">{subscribedEmail}</strong>
                  </div>
                  <div className="text-[10px] text-[#718096]">
                    Next Edition: <span className="text-white">Vol. XXVIII - December 2026 (eTIMS &amp; Tax Review)</span>
                  </div>
                </div>

                {/* Post-Subscription Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handlePrintBriefing}
                    className="flex-1 py-2 px-3 bg-[#162235] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] font-semibold rounded-lg border border-[#C5A880]/40 transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm"
                    title="Print November 2026 Legal Briefing & Subscription Certificate"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t('briefings.printConfirm')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadOfflineBriefing}
                    className="py-2 px-3 bg-[#111A28] hover:bg-[#18253A] text-[#8C98AE] hover:text-white rounded-lg border border-[#202E44] transition-all flex items-center justify-center gap-1.5 text-xs"
                    title="Download offline plain text briefing"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span className="hidden sm:inline">Offline Copy (.txt)</span>
                  </button>
                </div>

                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={handleResetSubscription}
                    className="text-[10px] text-[#718096] hover:text-[#C5A880] underline transition-colors"
                  >
                    {t('briefings.subAnother')}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ================= PRINT-READY LEGAL BRIEFING BULLETIN (#printable-briefing) ================= */}
      {/* This element is invisible on screen but renders crisp, high-contrast, double-column legal publication in print mode */}
      <div id="printable-briefing" className="hidden font-serif text-black p-4 text-xs leading-relaxed">
        
        {/* Chambers Official Letterhead */}
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

        {/* Briefing Title Bar */}
        <div className="border border-black p-2.5 mb-4 bg-slate-50 flex items-center justify-between font-sans text-xs">
          <div>
            <span className="font-bold uppercase tracking-wider block text-black">
              MONTHLY CORPORATE LEGAL BRIEFING · VOL. XXVII
            </span>
            <span className="text-[10px] text-slate-700">
              Official Law Review Series for General Counsels &amp; Corporate Boards
            </span>
          </div>
          <div className="text-right text-[10px] font-mono">
            <span>ISSUE DATE: NOVEMBER 2026</span><br />
            <span>REF: {subscriptionRef || 'PAA/NL/2026/ED-11'}</span>
          </div>
        </div>

        {/* Subscriber Attestation Box */}
        <div className="border border-dashed border-slate-600 p-2 mb-4 text-[10px] font-mono bg-slate-100 flex items-center justify-between">
          <span>
            SUBSCRIBER RECORD: <strong>{subscribedEmail || 'Institutional Counsel / Corporate Board Subscriber'}</strong>
          </span>
          <span>CAP 80 S. 134 PRIVILEGE ENFORCED</span>
        </div>

        {/* Executive Synopsis & Editorial Note */}
        <div className="mb-4 text-justify space-y-2">
          <p className="italic font-bold">
            "This monthly digest is formulated by the Chambers Research &amp; Knowledge Management Desk under the direction of Senior Counsel Milton Angwenyi, summarizing key legislative enactments, superior court holdings, and regulatory guidelines impacting enterprise risk across Eastern Africa."
          </p>
        </div>

        {/* Substantive Legal Briefings Articles */}
        <div className="space-y-4 pt-1">
          
          {/* Article 1 */}
          <div className="border-t border-slate-300 pt-2">
            <h3 className="font-bold text-sm uppercase text-black font-sans mb-1">
              1. COMPANIES ACT 2015: BENEFICIAL OWNERSHIP DISCLOSURE &amp; BRS ENFORCEMENT
            </h3>
            <p className="text-[11px] text-justify">
              The Business Registration Service (BRS) has initiated strict enforcement proceedings under Section 93A of the Companies Act 2015. Companies failing to maintain an updated Register of Ultimate Beneficial Owners (UBO) face immediate corporate deregistration and statutory fines of KES 500,000 for every officer in default. Nominee arrangements, offshore parent holdings, and trust agreements must be unbundled and logged via the e-Citizen BRS portal with verified national identification or foreign passports.
            </p>
          </div>

          {/* Article 2 */}
          <div className="border-t border-slate-300 pt-2">
            <h3 className="font-bold text-sm uppercase text-black font-sans mb-1">
              2. SECTIONAL PROPERTIES ACT 2020: CONVERSION OF SUB-LEASES UNDER ARDHISASA
            </h3>
            <p className="text-[11px] text-justify">
              The Ministry of Lands and Physical Planning has reaffirmed that long-term architectural sub-leases executed over commercial towers, mixed-use parks, and residential units must be converted to sectional titles. Pursuant to Section 13(2) of the Sectional Properties Act, developers and management corporations are mandated to surrender mother titles and submit cadastral geo-referenced plans. Failure to transition halts all bank charge registrations and leasehold encumbrances on ArdhiSasa.
            </p>
          </div>

          {/* Article 3 */}
          <div className="border-t border-slate-300 pt-2">
            <h3 className="font-bold text-sm uppercase text-black font-sans mb-1">
              3. COMMERCIAL ARBITRATION: EXPEDITED ENFORCEMENT OF EMERGENCY ARBITRATOR AWARDS
            </h3>
            <p className="text-[11px] text-justify">
              The High Court (Commercial &amp; Admiralty Division) in Nairobi has solidified judicial policy recognizing emergency arbitrator interim relief issued under the Nairobi Centre for International Arbitration (NCIA) Rules 2015. Section 36 of the Arbitration Act 1995 empowers the court to recognize and enforce such interim measures with the same force as a formal judicial injunction, providing commercial claimants with decisive pre-tribunal asset preservation.
            </p>
          </div>

          {/* Article 4 */}
          <div className="border-t border-slate-300 pt-2">
            <h3 className="font-bold text-sm uppercase text-black font-sans mb-1">
              4. ARO ESCROW ACCOUNTS &amp; STATUTORY SCALE REMUNERATION
            </h3>
            <p className="text-[11px] text-justify">
              All financial escrows and stakeholder security deposits tendered pursuant to the Advocates (Remuneration) Order (ARO) Cap 16 must adhere to the Advocates (Accounts) Rules. Chambers confirms that all project funds remain segregated in designated institutional trust accounts at KCB Bank Kenya Upper Hill Branch, fully shielded from commercial distress or unilateral bank set-off.
            </p>
          </div>

        </div>

        {/* Chambers Official Certification Footer */}
        <div className="border-t-2 border-black pt-4 mt-6 flex items-end justify-between text-[10px] font-mono">
          <div>
            <span className="font-bold block uppercase">CERTIFIED BY CHAMBERS REGISTRAR:</span>
            <span>Milton Angwenyi, SC &amp; Lead Advocates</span><br />
            <span>Petersons Angwenyi &amp; Associates Advocates · Nairobi</span>
          </div>
          <div className="text-right">
            <div className="border border-black p-2 inline-block text-center min-w-[150px]">
              <span className="font-bold block uppercase text-[9px]">HIGH COURT ADVOCATES SEAL</span>
              <span className="italic font-serif block my-0.5">M. Angwenyi, SC</span>
              <span className="text-[8px] block">LSK Practising Certificate 2026</span>
            </div>
          </div>
        </div>

        <div className="pt-2 text-center text-[9px] text-slate-500 font-mono">
          Section 134 Evidence Act (Cap 80) Privilege Enforced · Page 1 of 1 · Official Chambers Publication
        </div>

      </div>
    </>
  );
};
