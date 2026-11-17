import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  Scale,
  ShieldCheck,
  Clock,
  FileCheck2,
  Bookmark,
} from 'lucide-react';
import { CaseBrief, FIRM_DETAILS, PRACTICE_AREAS } from '../data/firmData';
import { PrecedentAnnotation } from '../utils/caseAnnotations';
import { calculateCaseBriefReadingTime } from '../utils/readingTime';
import { useLanguage } from '../context/LanguageContext';

export interface PrintDocumentProps {
  isOpen: boolean;
  onClose: () => void;
  caseBrief: CaseBrief | null;
  annotations?: PrecedentAnnotation[];
}

const STATUTORY_AUTHORITIES_BY_PRACTICE: Record<string, string[]> = {
  'dispute-resolution': [
    'Arbitration Act 1995 (Act No. 4 of 1995, Laws of Kenya)',
    'Nairobi Centre for International Arbitration (NCIA) Rules 2015',
    'Civil Procedure Act (Cap 21) & Civil Procedure Rules 2010',
    'Constitution of Kenya 2010 (Article 159 — Judicial Authority)',
  ],
  'real-estate': [
    'Sectional Properties Act 2020 (Act No. 21 of 2020)',
    'Land Registration Act 2012 (Act No. 3 of 2012)',
    'Physical and Land Use Planning Act 2019',
    'Advocates (Remuneration) Order (Cap 16, Schedule 1)',
  ],
  'corporate-finance': [
    'Companies Act 2015 (Act No. 17 of 2015)',
    'Insolvency Act 2015 (Act No. 18 of 2015)',
    'Banking Act (Cap 488) & CBK Prudential Guidelines',
    'Capital Markets Act (Cap 485A, Laws of Kenya)',
  ],
  'constitutional-public-law': [
    'Constitution of Kenya 2010 (Articles 47, 50 & 118)',
    'Fair Administrative Action Act 2015',
    'Statutory Instruments Act 2013',
    'Public Finance Management Act 2012',
  ],
  'tech-ip': [
    'Data Protection Act 2019 (Act No. 24 of 2019)',
    'ODPC Data Protection (General) Regulations 2021',
    'Trade Marks Act (Cap 506, Laws of Kenya)',
    'Computer Misuse and Cybercrimes Act 2018',
  ],
};

export const PrintDocument: React.FC<PrintDocumentProps> = ({
  isOpen,
  onClose,
  caseBrief,
  annotations = [],
}) => {
  const { language } = useLanguage();
  const [showWatermark, setShowWatermark] = useState(true);
  const [includeAnnotations, setIncludeAnnotations] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !caseBrief) return null;

  const docRef = `PAA/BRIEF/${caseBrief.year}/${caseBrief.id.toUpperCase()}`;
  const generatedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const practiceArea = PRACTICE_AREAS.find((p) => p.id === caseBrief.practiceAreaId);
  const readingStats = calculateCaseBriefReadingTime(
    caseBrief,
    annotations.map((a) => `${a.title} ${a.noteText}`)
  );
  const authorities =
    STATUTORY_AUTHORITIES_BY_PRACTICE[caseBrief.practiceAreaId] ?? [
      'Civil Procedure Act (Cap 21, Laws of Kenya)',
      'Arbitration Act 1995 (Act No. 4 of 1995)',
      'Evidence Act (Cap 80, Laws of Kenya) § 134',
      'Advocates Act (Cap 16, Laws of Kenya)',
    ];

  const stickyNotes = annotations.filter((a) => a.type === 'sticky-note');
  const highlights = annotations.filter((a) => a.type === 'highlight');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const content = `================================================================================
${FIRM_DETAILS.name.toUpperCase()}
${FIRM_DETAILS.address}
Tel: ${FIRM_DETAILS.phone} | Email: ${FIRM_DETAILS.email} | ${FIRM_DETAILS.lskRoll}
================================================================================

A4 JUDICIAL PRECEDENT DOSSIER
DOCUMENT REF:        ${docRef}
GENERATED ON:        ${generatedDate}
PRACTICE PORTFOLIO:  ${practiceArea?.title || 'Commercial Litigation & Advisory'}
PRECEDENT YEAR:      ${caseBrief.year}
FORUM / TRIBUNAL:    ${caseBrief.forum}
CLIENT SECTOR:       ${caseBrief.clientCategory}
MATTER EXPOSURE:     ${caseBrief.value}
ESTIMATED READ TIME: ${readingStats.label} (${readingStats.wordCount} words)

--------------------------------------------------------------------------------
CASE TITLE: ${caseBrief.matterName.toUpperCase()}
--------------------------------------------------------------------------------

1. EXECUTIVE FACTUAL SUMMARY
${caseBrief.summary}

2. JUDICIAL DETERMINATION & PRECEDENTIAL RATIO (OUTCOME)
${caseBrief.impact}

3. GOVERNING STATUTES & AUTHORITIES
${authorities.map((auth) => `• ${auth}`).join('\n')}
${
  includeAnnotations && annotations.length > 0
    ? `\n4. COUNSEL ANNOTATIONS & HIGHLIGHTS (${annotations.length})\n` +
      annotations
        .map(
          (ann, idx) =>
            `${idx + 1}. [${ann.type.toUpperCase()}] ${ann.title || 'Precedent Note'} — ${ann.author.name}\n` +
            (ann.highlightedText ? `   Excerpt: "${ann.highlightedText}"\n` : '') +
            `   Note: ${ann.noteText || ''}`
        )
        .join('\n\n')
    : ''
}

================================================================================
Section 134 Evidence Act (Cap 80) Privilege Enforced
Certified Chambers Record · Petersons Angwenyi & Associates Advocates
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docRef.replace(/\//g, '_')}_A4_BRIEF.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="a4-print-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto print:static print:block print:bg-white print:p-0 print:overflow-visible"
    >
      <div className="relative w-full max-w-5xl bg-[#0B0F17] border border-[#C5A880]/40 rounded-2xl shadow-2xl overflow-hidden my-3 sm:my-6 flex flex-col max-h-[94vh] print:static print:max-h-none print:border-0 print:rounded-none print:shadow-none print:bg-white print:overflow-visible">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print px-4 sm:px-6 py-4 bg-[#101724] border-b border-[#222E44] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#C5A880]/15 flex items-center justify-center text-[#C5A880] border border-[#C5A880]/35 shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#C5A880] font-semibold">
                <span>
                  {language === 'sw'
                    ? 'Mwonekano wa Uchapishaji wa A4 · Hati Rasmi ya Kesi'
                    : 'A4 Formatted Print Preview · Chambers Case Dossier'}
                </span>
              </div>
              <h3
                id="a4-print-preview-title"
                className="text-sm sm:text-base font-cinzel text-white truncate"
              >
                {caseBrief.matterName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowWatermark((prev) => !prev)}
              aria-pressed={showWatermark}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer ${
                showWatermark
                  ? 'bg-[#C5A880]/15 border-[#C5A880]/50 text-[#E4C999]'
                  : 'bg-[#172132] border-[#24334C] text-[#8C98AE] hover:text-white'
              }`}
            >
              {language === 'sw' ? 'Alama ya Maji' : 'Watermark'}
            </button>

            {annotations.length > 0 && (
              <button
                type="button"
                onClick={() => setIncludeAnnotations((prev) => !prev)}
                aria-pressed={includeAnnotations}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer ${
                  includeAnnotations
                    ? 'bg-[#C5A880]/15 border-[#C5A880]/50 text-[#E4C999]'
                    : 'bg-[#172132] border-[#24334C] text-[#8C98AE] hover:text-white'
                }`}
              >
                {language === 'sw'
                  ? `Maelezo (${annotations.length})`
                  : `Notes (${annotations.length})`}
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadText}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172132] hover:bg-[#202C42] text-[#A6B4CD] hover:text-white text-xs font-medium rounded-lg border border-[#24334C] transition-all cursor-pointer"
              title="Download plain-text dossier"
            >
              <Download className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="hidden sm:inline">.txt</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C5A880] to-[#E4C999] text-[#0A0E17] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg shadow-[#C5A880]/15 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'sw' ? 'Chapa / Hifadhi PDF (A4)' : 'Print A4 / Save PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close A4 print preview"
              className="p-2 text-[#8C98AE] hover:text-white rounded-lg hover:bg-[#1A2538] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable A4 Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#070A10] flex justify-center print:static print:overflow-visible print:p-0 print:bg-white">
          {/* A4 Portrait Sheet (210mm x 297mm proportions) */}
          <article
            id="printable-document"
            className="relative w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 px-7 py-9 sm:px-14 sm:py-12 shadow-2xl rounded-sm font-serif flex flex-col justify-between overflow-hidden print:shadow-none print:rounded-none print:max-w-none print:min-h-0 print:p-0"
          >
            {/* Subtle Diagonal Chambers Watermark */}
            {showWatermark && (
              <div
                aria-hidden="true"
                className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.045]"
              >
                <div className="rotate-[-32deg] text-center whitespace-nowrap">
                  <div className="text-4xl sm:text-5xl font-cinzel font-bold tracking-[0.25em] text-slate-900 uppercase">
                    PETERSONS ANGWENYI &amp; ASSOCIATES
                  </div>
                  <div className="text-xs font-mono tracking-[0.4em] text-slate-800 uppercase mt-2">
                    CHAMBERS CERTIFIED PRECEDENT RECORD · A4
                  </div>
                </div>
              </div>
            )}

            <div className="relative z-10">
              {/* Top Gold-Hairline Accent Bar */}
              <div className="h-1 w-full bg-gradient-to-r from-[#8C6B32] via-[#C5A880] to-[#8C6B32] mb-5" />

              {/* Formal Chambers Letterhead */}
              <header className="border-b-2 border-slate-900 pb-4 mb-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Scale className="w-4 h-4 text-[#8C6B32]" />
                  <span className="text-[10px] font-sans font-bold tracking-[0.22em] uppercase text-[#7A5B26]">
                    Advocates of the High Court of Kenya · Commissioners for Oaths
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-cinzel font-bold tracking-wide uppercase text-slate-950">
                  {FIRM_DETAILS.name}
                </h1>
                <p className="text-[11px] text-slate-600 font-sans mt-1">
                  {FIRM_DETAILS.address} · {FIRM_DETAILS.postalAddress}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Tel: {FIRM_DETAILS.phone} · Email: {FIRM_DETAILS.email} · {FIRM_DETAILS.lskRoll}
                </p>
              </header>

              {/* A4 Case Docket Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-300 p-3.5 mb-6 text-[11px] font-sans">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">
                    DOCKET REFERENCE
                  </span>
                  <span className="font-mono font-bold text-slate-900">{docRef}</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">
                    ISSUE / PRINT DATE
                  </span>
                  <span className="font-semibold text-slate-900">{generatedDate}</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">
                    REPORTED YEAR &amp; SECTOR
                  </span>
                  <span className="font-semibold text-slate-900">
                    {caseBrief.year} · {caseBrief.clientCategory}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">
                    PRIVILEGE STATUS
                  </span>
                  <span className="font-semibold text-emerald-800">Cap 80 § 134 Privileged</span>
                </div>
              </div>

              {/* Matter Title & Forum Header */}
              <div className="mb-6 pb-4 border-b border-slate-300">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#8C6B32]">
                    Judicial Precedent Case Brief · {practiceArea?.title || 'Commercial Law'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-600">
                    <Clock className="w-3 h-3 text-[#8C6B32]" />
                    <span>
                      {readingStats.label} · {readingStats.wordCount} words
                    </span>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950 leading-snug">
                  {caseBrief.matterName}
                </h2>
                <p className="text-xs font-sans text-slate-700 mt-1.5">
                  <strong>Judicial Forum / Tribunal:</strong> {caseBrief.forum}
                </p>
              </div>

              {/* Valuation & Forum Key Facts Table */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs font-sans">
                <div className="p-3 border border-slate-200 bg-slate-50/70">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">
                    MATTER EXPOSURE / VALUE
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-950">
                    {caseBrief.value}
                  </span>
                </div>
                <div className="p-3 border border-slate-200 bg-slate-50/70">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">
                    INSTRUCTING CLIENT SECTOR
                  </span>
                  <span className="font-semibold text-slate-900">
                    {caseBrief.clientCategory}
                  </span>
                </div>
                <div className="p-3 border border-slate-200 bg-slate-50/70">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">
                    LEAD PRACTICE PARTNER
                  </span>
                  <span className="font-semibold text-slate-900">
                    {practiceArea?.leadAdvocate || 'Milton Angwenyi, SC'}
                  </span>
                </div>
              </div>

              {/* Section 1: Executive Factual Summary */}
              <section className="mb-5 break-inside-avoid">
                <h3 className="font-sans text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
                  1. Executive Factual Summary &amp; Procedural Background
                </h3>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed text-justify">
                  {caseBrief.summary}
                </p>
              </section>

              {/* Section 2: Ratio Decidendi & Precedential Outcome (Highlighted Box) */}
              <section className="mb-5 p-4 bg-[#FAF6EE] border-l-4 border-[#8C6B32] break-inside-avoid">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FileCheck2 className="w-4 h-4 text-[#8C6B32]" />
                  <h3 className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#7A5B26]">
                    2. Judicial Determination &amp; Precedential Impact (Ratio Decidendi)
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-950 font-medium leading-relaxed">
                  {caseBrief.impact}
                </p>
              </section>

              {/* Section 3: Governing Statutory Authorities */}
              <section className="mb-5 break-inside-avoid">
                <h3 className="font-sans text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
                  3. Governing Statutory Framework &amp; Judicial Authorities
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-sans text-slate-700">
                  {authorities.map((statute, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8C6B32] mt-1.5 shrink-0" />
                      <span>{statute}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Optional Section 4: Counsel Annotations & Highlights Appendix */}
              {includeAnnotations && annotations.length > 0 && (
                <section className="mb-5 break-inside-avoid">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2.5">
                    <h3 className="font-sans text-[11px] font-bold uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-[#8C6B32]" />
                      <span>4. Chambers Counsel Annotations &amp; Marginalia</span>
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500">
                      {highlights.length} highlights · {stickyNotes.length} notes
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {annotations.map((ann) => (
                      <div
                        key={ann.id}
                        className="p-2.5 border border-slate-200 bg-slate-50/60 text-xs font-sans"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <strong className="text-slate-900">
                            [{ann.type === 'sticky-note' ? 'COUNSEL NOTE' : 'HIGHLIGHT'}]{' '}
                            {ann.title || `Clause ${ann.clauseNumber}`}
                          </strong>
                          <span className="text-[10px] font-mono text-slate-500">
                            {ann.author.name} · {ann.author.role}
                          </span>
                        </div>
                        {ann.highlightedText && (
                          <p className="italic text-slate-600 text-[11px] mb-1">
                            “{ann.highlightedText}”
                          </p>
                        )}
                        {ann.noteText && <p className="text-slate-800">{ann.noteText}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* A4 Footer Certification Seal & Statutory Disclaimer */}
            <footer className="relative z-10 mt-8 pt-5 border-t-2 border-slate-900 break-inside-avoid">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full border-2 border-red-800 p-1 flex items-center justify-center text-center rotate-[-4deg] shrink-0">
                    <div className="w-full h-full rounded-full border border-dashed border-red-800 flex flex-col items-center justify-center text-[7px] font-mono text-red-900 leading-none font-bold uppercase">
                      <span>CHAMBERS</span>
                      <span className="text-[9px] my-0.5">PAA</span>
                      <span>A4 SEAL</span>
                    </div>
                  </div>
                  <div className="text-[11px] font-sans text-slate-700">
                    <span className="font-bold text-slate-950 block uppercase tracking-wide">
                      Certified Chambers Precedent Dossier
                    </span>
                    <span>Law Society of Kenya Accredited Practice</span>
                    <span className="block font-mono text-[10px] text-slate-500">
                      Ref: {docRef} · A4 Standard Edition
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs font-sans">
                  <div className="italic text-slate-600 font-serif mb-0.5">
                    Certified for and on behalf of Chambers:
                  </div>
                  <div className="font-bold text-slate-950">
                    Senior Counsel Milton Angwenyi (Roll: P.105/8941/98)
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Upper Hill Chambers, Mara Road, Nairobi · Republic of Kenya
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200 text-[9px] font-sans text-slate-500 text-center leading-tight">
                Prepared under Section 134 of the Evidence Act (Cap 80, Laws of Kenya). Printed strictly for authorized legal review, arbitral reference, and executive board briefing.
              </div>
            </footer>
          </article>
        </div>

        {/* Bottom Status Bar (Hidden during print) */}
        <div className="no-print px-4 sm:px-6 py-3 bg-[#101724] border-t border-[#222E44] flex flex-wrap items-center justify-between gap-3 text-xs text-[#8C98AE]">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
            <span>
              {language === 'sw'
                ? 'Umbizo rasmi la karatasi ya A4 (210mm × 297mm) tayari kwa kuchapisha.'
                : 'Formatted to A4 Portrait dimensions (210mm × 297mm) · Cmd/Ctrl+P supported.'}
            </span>
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-[#172132] hover:bg-[#202C42] text-white rounded-lg transition-colors cursor-pointer"
            >
              {language === 'sw' ? 'Funga' : 'Close'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#C5A880] text-[#0A0E17] font-semibold rounded-lg hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'sw' ? 'Chapa A4' : 'Print A4'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
