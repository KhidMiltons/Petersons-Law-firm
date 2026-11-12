import React, { useState, useEffect, useRef } from 'react';
import { CASE_BRIEFS, CaseBrief } from '../data/firmData';
import {
  Printer,
  Clock,
  StickyNote,
  Highlighter,
  Download,
  Check,
  FileText,
  Sparkles,
  RefreshCw,
  Copy,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useReadingProgress } from '../context/ReadingProgressContext';
import { calculateCaseBriefReadingTime } from '../utils/readingTime';
import { PrintFriendlyModal } from './PrintFriendlyModal';
import {
  formatCaseBriefForPrint,
  formatAllCaseBriefsForPrint,
  PrintDocument,
} from '../utils/printFriendly';
import { downloadCaseBriefPdf } from '../utils/caseBriefPdf';
import { CaseBriefAnnotationModal } from './CaseBriefAnnotationModal';
import {
  CASE_ANNOTATIONS_UPDATED_EVENT,
  PrecedentAnnotation,
  getAnnotationsForBrief,
} from '../utils/caseAnnotations';

interface KeyTakeawayBullet {
  precedentTitle: string;
  summaryBullet: string;
  statutoryAnchor: string;
}

interface CaseKeyTakeawaysData {
  briefId: string;
  headline: string;
  takeaways: KeyTakeawayBullet[];
  generatedAt: string;
  model: string;
}

interface CaseBriefsProps {
  focusedCaseId?: string | null;
  onSelectCaseBrief?: (brief: CaseBrief | null) => void;
}

const TAKEAWAYS_STORAGE_KEY = 'paa_case_key_takeaways_v1';

function loadCachedTakeaways(): Record<string, CaseKeyTakeawaysData> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(TAKEAWAYS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CaseKeyTakeawaysData>) : {};
  } catch {
    return {};
  }
}

export const CaseBriefs: React.FC<CaseBriefsProps> = ({
  focusedCaseId,
  onSelectCaseBrief,
}) => {
  const { language, t } = useLanguage();
  const { setLongFormProgress } = useReadingProgress();
  const [filter, setFilter] = useState<string>('all');
  const [selectedBrief, setSelectedBrief] = useState<CaseBrief>(CASE_BRIEFS[0]);
  const [downloadedPdfId, setDownloadedPdfId] = useState<string | null>(null);
  const [downloadedFileName, setDownloadedFileName] = useState<string>('');
  const [printDoc, setPrintDoc] = useState<PrintDocument | null>(null);
  const [annotatingBrief, setAnnotatingBrief] = useState<CaseBrief | null>(null);

  // Real-time annotations index synced across CaseBriefs cards & annotation modal
  const [annotationsByBrief, setAnnotationsByBrief] = useState<
    Record<string, PrecedentAnnotation[]>
  >(() => {
    const initial: Record<string, PrecedentAnnotation[]> = {};
    for (const brief of CASE_BRIEFS) {
      initial[brief.id] = getAnnotationsForBrief(brief.id);
    }
    return initial;
  });

  // Gemini Key Takeaways state per landmark case
  const [takeawaysByBrief, setTakeawaysByBrief] = useState<
    Record<string, CaseKeyTakeawaysData>
  >(() => loadCachedTakeaways());
  const [loadingTakeawaysId, setLoadingTakeawaysId] = useState<string | null>(null);
  const [takeawaysError, setTakeawaysError] = useState<string | null>(null);
  const [copiedTakeaways, setCopiedTakeaways] = useState<boolean>(false);

  const sectionRef = useRef<HTMLElement>(null);
  const pdfTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleAnnotationsUpdated = (e: Event) => {
      const custom = e as CustomEvent<{
        briefId: string;
        annotations: PrecedentAnnotation[];
      }>;
      if (custom.detail?.briefId) {
        setAnnotationsByBrief((prev) => ({
          ...prev,
          [custom.detail.briefId]: custom.detail.annotations,
        }));
      }
    };

    const handleStorageSync = () => {
      const refreshed: Record<string, PrecedentAnnotation[]> = {};
      for (const brief of CASE_BRIEFS) {
        refreshed[brief.id] = getAnnotationsForBrief(brief.id);
      }
      setAnnotationsByBrief(refreshed);
    };

    window.addEventListener(CASE_ANNOTATIONS_UPDATED_EVENT, handleAnnotationsUpdated);
    window.addEventListener('storage', handleStorageSync);
    return () => {
      window.removeEventListener(CASE_ANNOTATIONS_UPDATED_EVENT, handleAnnotationsUpdated);
      window.removeEventListener('storage', handleStorageSync);
      if (pdfTimerRef.current) {
        window.clearTimeout(pdfTimerRef.current);
      }
    };
  }, []);

  const handleDownloadPdf = (brief: CaseBrief) => {
    setSelectedBrief(brief);
    if (onSelectCaseBrief) onSelectCaseBrief(brief);
    const fileName = downloadCaseBriefPdf(brief);
    setDownloadedPdfId(brief.id);
    setDownloadedFileName(fileName);
    if (pdfTimerRef.current) {
      window.clearTimeout(pdfTimerRef.current);
    }
    pdfTimerRef.current = window.setTimeout(() => {
      setDownloadedPdfId(null);
      setDownloadedFileName('');
    }, 3200);
  };

  // Call server-side Gemini API (/api/case-takeaways) for concise bulleted precedents
  const handleGenerateKeyTakeaways = async (brief: CaseBrief) => {
    setSelectedBrief(brief);
    if (onSelectCaseBrief) onSelectCaseBrief(brief);
    setTakeawaysError(null);
    setLoadingTakeawaysId(brief.id);

    try {
      const response = await fetch('/api/case-takeaways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, language }),
      });

      const payload = (await response.json()) as CaseKeyTakeawaysData & {
        error?: string;
      };

      if (!response.ok || payload.error) {
        throw new Error(
          payload.error || 'Failed to generate Key Takeaways from Gemini API.'
        );
      }

      setTakeawaysByBrief((prev) => {
        const next = { ...prev, [brief.id]: payload };
        try {
          window.localStorage.setItem(TAKEAWAYS_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignore storage errors
        }
        return next;
      });
    } catch (err) {
      setTakeawaysError(
        err instanceof Error
          ? err.message
          : 'Unable to generate Key Takeaways at this time.'
      );
    } finally {
      setLoadingTakeawaysId(null);
    }
  };

  const handleCopyTakeaways = async (data: CaseKeyTakeawaysData, brief: CaseBrief) => {
    const lines = [
      `${brief.matterName} (${brief.forum}, ${brief.year})`,
      data.headline,
      '',
      ...data.takeaways.map(
        (item, i) =>
          `${i + 1}. ${item.precedentTitle}: ${item.summaryBullet} [${item.statutoryAnchor}]`
      ),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(lines);
    } catch {
      // Clipboard blocked in restricted context
    }
    setCopiedTakeaways(true);
    window.setTimeout(() => setCopiedTakeaways(false), 2200);
  };

  // Directly triggers browser print dialog targeting #printable-document via index.css @media print
  const handlePrintSummary = (brief: CaseBrief) => {
    setSelectedBrief(brief);
    const doc = formatCaseBriefForPrint(brief);
    setPrintDoc(doc);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Directly triggers browser print dialog for full judicial precedents compendium
  const handlePrintSummaryCompendium = () => {
    const doc = formatAllCaseBriefsForPrint(CASE_BRIEFS);
    setPrintDoc(doc);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Track page scroll through the #cases section when modal is closed
  useEffect(() => {
    if (annotatingBrief) return;

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight && rect.bottom > 0) {
        const totalHeight = rect.height + windowHeight;
        const progressDist = windowHeight - rect.top;
        const pct = Math.min(100, Math.max(0, (progressDist / totalHeight) * 100));

        if (pct >= 5 && pct <= 98) {
          setLongFormProgress(
            pct,
            'section-cases',
            'Judicial Precedents & Milestone Transactions'
          );
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [annotatingBrief, setLongFormProgress]);

  useEffect(() => {
    if (focusedCaseId) {
      setFilter('all');
      const found = CASE_BRIEFS.find((b) => b.id === focusedCaseId);
      if (found) {
        setSelectedBrief(found);
        setTakeawaysError(null);
        if (onSelectCaseBrief) {
          onSelectCaseBrief(found);
        }
      }
    }
  }, [focusedCaseId, onSelectCaseBrief]);

  const filteredBriefs = CASE_BRIEFS.filter((brief) => {
    if (filter === 'all') return true;
    return brief.practiceAreaId === filter;
  });

  const handleFilterChange = (nextFilter: string) => {
    setFilter(nextFilter);
    const matching = CASE_BRIEFS.filter(
      (b) => nextFilter === 'all' || b.practiceAreaId === nextFilter
    );
    if (matching.length > 0 && !matching.some((b) => b.id === selectedBrief.id)) {
      setSelectedBrief(matching[0]);
      setTakeawaysError(null);
    }
  };

  const selectedAnnotations = annotationsByBrief[selectedBrief.id] || [];
  const selectedStickyCount = selectedAnnotations.filter(
    (a) => a.type === 'sticky-note'
  ).length;
  const selectedHighlightCount = selectedAnnotations.filter(
    (a) => a.type === 'highlight'
  ).length;
  const activeTakeaways = takeawaysByBrief[selectedBrief.id];
  const isGeneratingForSelected = loadingTakeawaysId === selectedBrief.id;

  return (
    <section
      id="cases"
      ref={sectionRef}
      className="py-24 bg-[#FAF8F5] dark:bg-[#0A0E17] border-b border-[#E4DCCF] dark:border-[#1E2536] relative"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section Header with Dedicated Print Summary Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880] mb-3 font-semibold">
              <span>{t('cases.kicker')}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-cinzel text-[#121A28] dark:text-white tracking-tight">
              {t('cases.title')}
            </h2>
            <p className="mt-4 text-[#4A576D] dark:text-[#9BA5B7] leading-relaxed">
              {t('cases.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handlePrintSummaryCompendium}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#121927] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#8C6B32] dark:text-[#C5A880] text-xs font-semibold rounded-xl border border-[#C5A880]/50 dark:border-[#C5A880]/40 hover:border-[#C5A880] transition-all shadow-sm group cursor-pointer"
              title="Print Executive Precedent Summaries Compendium"
            >
              <Printer className="w-4 h-4 text-[#8C6B32] dark:text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
              <span>Print Summary Compendium</span>
            </button>
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#EFE8DA] dark:bg-[#121824] rounded-xl border border-[#DFD4C1] dark:border-[#222B3D] max-w-xl mb-8">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'all'
                ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                : 'text-[#5C6A80] dark:text-[#8C98AE] hover:text-[#121A28] dark:hover:text-white'
            }`}
          >
            {t('cases.filterAll')}
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('dispute-resolution')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'dispute-resolution'
                ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                : 'text-[#5C6A80] dark:text-[#8C98AE] hover:text-[#121A28] dark:hover:text-white'
            }`}
          >
            {t('cases.filterArb')}
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('real-estate')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'real-estate'
                ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                : 'text-[#5C6A80] dark:text-[#8C98AE] hover:text-[#121A28] dark:hover:text-white'
            }`}
          >
            {t('cases.filterRealEstate')}
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('corporate-finance')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'corporate-finance'
                ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                : 'text-[#5C6A80] dark:text-[#8C98AE] hover:text-[#121A28] dark:hover:text-white'
            }`}
          >
            {t('cases.filterCorp')}
          </button>
        </div>

        {/* Selected Landmark Precedent Workbench: Stationery PDF, Real-Time Annotation & Gemini Key Takeaways */}
        <div className="mb-8 rounded-2xl bg-white dark:bg-[#0E1522] border border-[#C5A880]/55 shadow-xl overflow-hidden">
          <div className="p-5 sm:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/40 flex items-center justify-center text-[#8C6B32] dark:text-[#C5A880] shrink-0 mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880] font-semibold flex-wrap">
                  <span>
                    {language === 'sw'
                      ? 'Kesi Iliyochaguliwa Kwa Sasa'
                      : 'Selected Landmark Precedent'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedBrief.year}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedBrief.value}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {selectedHighlightCount} highlights · {selectedStickyCount} sticky notes
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-cinzel font-bold text-[#121A28] dark:text-white mt-0.5 leading-snug">
                  {selectedBrief.matterName}
                </h3>
                <p className="text-xs text-[#5C6A80] dark:text-[#8C98AE] mt-0.5">
                  {selectedBrief.forum}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                type="button"
                onClick={() => handleGenerateKeyTakeaways(selectedBrief)}
                disabled={isGeneratingForSelected}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#121927] dark:bg-[#172135] hover:bg-[#1E2A42] text-[#E4C999] text-xs font-bold uppercase tracking-wider rounded-xl border border-[#C5A880]/50 transition-all shadow-sm cursor-pointer whitespace-nowrap disabled:opacity-60"
                title="Generate AI-powered bulleted Key Takeaways of legal precedents established"
              >
                {isGeneratingForSelected ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                    <span>
                      {language === 'sw' ? 'Inachambua...' : 'Synthesizing...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>
                      {activeTakeaways
                        ? language === 'sw'
                          ? 'Sasisha Mambo Muhimu'
                          : 'Regenerate Key Takeaways'
                        : language === 'sw'
                          ? 'Tengeneza Key Takeaways'
                          : 'Key Takeaways'}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setAnnotatingBrief(selectedBrief)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#F5EFE4] dark:bg-[#141D2C] hover:bg-[#EAE1CE] dark:hover:bg-[#1C283C] text-[#8C6B32] dark:text-[#E4C999] text-xs font-semibold rounded-xl border border-[#DFD4C1] dark:border-[#24324A] transition-all cursor-pointer whitespace-nowrap"
                title="Highlight clauses and pin digital sticky notes in real time"
              >
                <Highlighter className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880]" />
                <span>Annotate Document</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadPdf(selectedBrief)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C5A880] via-[#D4AF37] to-[#B89047] text-[#080B11] text-xs font-bold uppercase tracking-wider rounded-xl hover:brightness-110 transition-all shadow-md shadow-[#C5A880]/20 cursor-pointer whitespace-nowrap"
                title="Generate and download formatted Chambers stationery PDF"
              >
                {downloadedPdfId === selectedBrief.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      {language === 'sw' ? 'PDF Imepakuliwa' : 'PDF Downloaded'}
                    </span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download as PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handlePrintSummary(selectedBrief)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#F5EFE4] dark:bg-[#141D2C] hover:bg-[#EAE1CE] dark:hover:bg-[#1C283C] text-[#8C6B32] dark:text-[#E4C999] text-xs font-semibold rounded-xl border border-[#DFD4C1] dark:border-[#24324A] transition-all cursor-pointer whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880]" />
                <span>Stationery Preview</span>
              </button>
            </div>
          </div>

          {/* Gemini Key Takeaways Summary Panel */}
          {(isGeneratingForSelected || takeawaysError || activeTakeaways) && (
            <div className="px-5 sm:px-6 pb-6 pt-4 border-t border-[#EFE8DA] dark:border-[#1B2538] bg-[#FAF8F5] dark:bg-[#0B111C]">
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#8C6B32] dark:text-[#C5A880] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>
                    {language === 'sw'
                      ? 'Mambo Muhimu ya Kisheria (Gemini Precedent Brief)'
                      : 'Key Takeaways — Legal Precedents Established'}
                  </span>
                </div>

                {activeTakeaways && !isGeneratingForSelected && (
                  <button
                    type="button"
                    onClick={() => handleCopyTakeaways(activeTakeaways, selectedBrief)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#121927] border border-[#DFD4C1] dark:border-[#223048] text-[11px] font-mono text-[#4A576D] dark:text-[#A6B4CD] hover:text-[#121A28] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedTakeaways ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Copied
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[#8C6B32] dark:text-[#C5A880]" />
                        <span>Copy Takeaways</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {isGeneratingForSelected && (
                <div className="space-y-2.5 py-2 animate-pulse">
                  <div className="h-3.5 w-3/4 rounded bg-[#E4DCCF] dark:bg-[#172235]" />
                  <div className="h-3 w-full rounded bg-[#EFE8DA] dark:bg-[#141D2D]" />
                  <div className="h-3 w-11/12 rounded bg-[#EFE8DA] dark:bg-[#141D2D]" />
                  <div className="h-3 w-5/6 rounded bg-[#EFE8DA] dark:bg-[#141D2D]" />
                </div>
              )}

              {takeawaysError && !isGeneratingForSelected && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{takeawaysError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGenerateKeyTakeaways(selectedBrief)}
                    className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs font-semibold cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {activeTakeaways && !isGeneratingForSelected && !takeawaysError && (
                <div className="space-y-3">
                  <p className="text-sm font-serif font-semibold text-[#121A28] dark:text-[#F3E2C8] leading-snug">
                    {activeTakeaways.headline}
                  </p>

                  <ul className="space-y-2.5">
                    {activeTakeaways.takeaways.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#0F1726] border border-[#E4DCCF] dark:border-[#1E2A40]"
                      >
                        <span className="mt-0.5 w-5 h-5 rounded-md bg-[#C5A880]/20 text-[#8C6B32] dark:text-[#C5A880] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-xs font-semibold text-[#121A28] dark:text-white">
                              {item.precedentTitle}
                            </strong>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5EFE4] dark:bg-[#162033] text-[#8C6B32] dark:text-[#C5A880] border border-[#E4DCCF] dark:border-[#24324A]">
                              {item.statutoryAnchor}
                            </span>
                          </div>
                          <p className="text-xs text-[#4A576D] dark:text-[#BAC5D6] leading-relaxed">
                            {item.summaryBullet}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {downloadedFileName && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-mono"
          >
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Chambers Stationery PDF generated: <strong>{downloadedFileName}</strong>
            </span>
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBriefs.map((brief) => {
            const briefStats = calculateCaseBriefReadingTime(brief);
            const isSelected = selectedBrief.id === brief.id || focusedCaseId === brief.id;
            const briefAnnotations = annotationsByBrief[brief.id] || [];
            const stickyNotes = briefAnnotations.filter((a) => a.type === 'sticky-note');
            const highlightsCount = briefAnnotations.filter(
              (a) => a.type === 'highlight'
            ).length;
            const latestSticky = stickyNotes[0];

            return (
              <div
                key={brief.id}
                id={`case-${brief.id}`}
                onClick={() => {
                  setSelectedBrief(brief);
                  setTakeawaysError(null);
                  if (onSelectCaseBrief) onSelectCaseBrief(brief);
                }}
                className={`p-7 rounded-2xl bg-white dark:bg-[#0E1522] border transition-all flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 shadow-sm dark:shadow-none ${
                  isSelected
                    ? 'border-[#C5A880] ring-2 ring-[#C5A880]/30 shadow-lg shadow-[#C5A880]/15'
                    : 'border-[#E4DCCF] dark:border-[#1C263A] hover:border-[#C5A880]/50'
                }`}
              >
                <div>
                  {/* Metadata & Quick Tools */}
                  <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#5C6A80] dark:text-[#8C98AE] mb-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[#8C6B32] dark:text-[#C5A880] font-semibold">
                        {brief.year}
                      </span>
                      <span aria-hidden="true" className="text-[#C8BFA8] dark:text-[#3D4C63]">
                        ·
                      </span>
                      <span>{brief.clientCategory}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateKeyTakeaways(brief);
                        }}
                        title="Generate Key Takeaways with Gemini"
                        className="p-1.5 rounded-lg text-[#5C6A80] dark:text-[#8C98AE] hover:text-[#8C6B32] dark:hover:text-[#DFBE82] hover:bg-[#F5EFE4] dark:hover:bg-[#161F2E] border border-transparent hover:border-[#C5A880]/30 transition-all flex items-center gap-1 text-[11px] font-sans cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880]" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPdf(brief);
                        }}
                        title="Download formatted Chambers stationery PDF"
                        className="p-1.5 rounded-lg text-[#5C6A80] dark:text-[#8C98AE] hover:text-[#8C6B32] dark:hover:text-[#DFBE82] hover:bg-[#F5EFE4] dark:hover:bg-[#161F2E] border border-transparent hover:border-[#C5A880]/30 transition-all flex items-center gap-1 text-[11px] font-sans cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880]" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBrief(brief);
                          setAnnotatingBrief(brief);
                        }}
                        title="Open Real-Time Document Annotation & Sticky Notes"
                        className="p-1.5 rounded-lg text-[#5C6A80] dark:text-[#8C98AE] hover:text-[#8C6B32] dark:hover:text-[#DFBE82] hover:bg-[#F5EFE4] dark:hover:bg-[#161F2E] border border-transparent hover:border-[#C5A880]/30 transition-all flex items-center gap-1 text-[11px] font-sans cursor-pointer"
                      >
                        <Highlighter className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880]" />
                        <span className="text-[10px] uppercase font-mono">Annotate</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Estimated Reading Time Indicator Badge */}
                  <div className="mb-4 flex items-center gap-2 flex-wrap">
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5EFE4] dark:bg-[#141C2B] border border-[#E4DCCF] dark:border-[#233148] hover:border-[#C5A880]/40 text-xs font-mono text-[#8C6B32] dark:text-[#E4C999] shadow-sm transition-colors"
                      title={`Estimated reading duration: ${briefStats.detailedLabel} (${briefStats.readingPaceNote})`}
                    >
                      <Clock className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880]" />
                      <span className="font-semibold text-[#121A28] dark:text-white">
                        {briefStats.label}
                      </span>
                      <span className="text-[#9AA5B8] dark:text-[#7B8B9F]">·</span>
                      <span className="text-[#4A576D] dark:text-[#A2B1C6] text-[11px] tabular-nums">
                        {briefStats.wordCount.toLocaleString()} words
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${briefStats.depthColor} ${briefStats.depthBg} tracking-wide uppercase font-semibold`}
                      title="Precedent depth tier"
                    >
                      {briefStats.depthTier}
                    </span>
                  </div>

                  <h3 className="text-lg font-cinzel text-[#121A28] dark:text-white leading-snug">
                    {brief.matterName}
                  </h3>

                  <div className="text-xs font-medium text-[#5C6A80] dark:text-[#A6B3C6] mt-2 font-mono">
                    {brief.forum}
                  </div>

                  <p className="mt-4 text-xs text-[#4A576D] dark:text-[#9DAABF] leading-relaxed">
                    {brief.summary}
                  </p>

                  <div className="mt-5 p-3.5 bg-[#FAF8F5] dark:bg-[#121A28] rounded-xl border border-[#E4DCCF] dark:border-[#1E283C] space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#8C6B32] dark:text-[#C5A880] font-semibold block">
                      {t('cases.outcome')}
                    </span>
                    <p className="text-xs text-[#1D283A] dark:text-[#D8E2EF] leading-relaxed font-medium">
                      {brief.impact}
                    </p>
                  </div>

                  {/* Live Real-Time Advocate Annotation Summary Pill */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBrief(brief);
                      setAnnotatingBrief(brief);
                    }}
                    className="mt-3 w-full text-left p-2.5 rounded-xl bg-[#F8F4EC] dark:bg-[#101828] border border-[#E4DCCF] dark:border-[#1F2C44] hover:border-[#C5A880]/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8C6B32] dark:text-[#C5A880]">
                      <span className="flex items-center gap-1 font-semibold">
                        <BookOpen className="w-3 h-3" />
                        <span>Live Counsel Annotations</span>
                      </span>
                      <span className="tabular-nums">
                        {highlightsCount} highlights · {stickyNotes.length} notes
                      </span>
                    </div>
                    {latestSticky && (
                      <p className="mt-1 text-[11px] text-[#4A576D] dark:text-[#94A3B8] truncate">
                        📌 {latestSticky.title}: {latestSticky.noteText}
                      </p>
                    )}
                  </button>
                </div>

                {/* Card Footer with Exposure, Download as PDF & Annotation Trigger */}
                <div className="mt-6 pt-4 border-t border-[#EFE8DA] dark:border-[#1C2436] flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#6F7A8F] block">
                      {t('cases.exposure')}
                    </span>
                    <span className="text-sm font-mono text-[#8C6B32] dark:text-[#DFBE82] font-bold tabular-nums">
                      {brief.value}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPdf(brief);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5EFE4] dark:bg-[#141D2C] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#8C6B32] dark:text-[#E4C999] text-xs font-semibold border border-[#C5A880]/40 dark:border-[#C5A880]/30 hover:border-[#C5A880] transition-all shadow-sm group cursor-pointer"
                      title="Download formatted stationery PDF for this landmark case"
                    >
                      <Download className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
                      <span>Download as PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBrief(brief);
                        setAnnotatingBrief(brief);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#131B2A] hover:bg-[#EFE8DA] dark:hover:bg-[#1C283C] text-[#4A576D] dark:text-[#A6B4CD] hover:text-[#121A28] dark:hover:text-white border border-[#E4DCCF] dark:border-[#202E44] text-xs font-medium transition-all shadow-sm cursor-pointer"
                      title="Study Precedent, Highlight Clauses & Add Sticky Notes"
                    >
                      <StickyNote className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880]" />
                      <span>Annotate</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Printer-Ready PDF Layout Modal */}
      <PrintFriendlyModal
        isOpen={!!printDoc}
        onClose={() => setPrintDoc(null)}
        document={printDoc}
      />

      {/* Interactive Case Brief Precedent Annotation Layer Modal */}
      <CaseBriefAnnotationModal
        isOpen={!!annotatingBrief}
        onClose={() => setAnnotatingBrief(null)}
        brief={annotatingBrief}
      />
    </section>
  );
};
