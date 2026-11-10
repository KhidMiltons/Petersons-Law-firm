import React, { useState, useEffect } from 'react';
import { CASE_BRIEFS, CaseBrief } from '../data/firmData';
import { Scale, ArrowUpRight, Award, Shield, Printer, Clock, StickyNote, Highlighter, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { PrintFriendlyModal } from './PrintFriendlyModal';
import { formatCaseBriefForPrint, formatAllCaseBriefsForPrint, PrintDocument } from '../utils/printFriendly';
import { CaseBriefAnnotationModal } from './CaseBriefAnnotationModal';

interface CaseBriefsProps {
  focusedCaseId?: string | null;
  onSelectCaseBrief?: (brief: CaseBrief | null) => void;
}

export const CaseBriefs: React.FC<CaseBriefsProps> = ({ focusedCaseId, onSelectCaseBrief }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<string>('all');
  const [printDoc, setPrintDoc] = useState<PrintDocument | null>(null);
  const [annotatingBrief, setAnnotatingBrief] = useState<CaseBrief | null>(null);

  // Directly triggers browser print dialog targeting #printable-document via index.css @media print
  const handlePrintSummary = (brief: CaseBrief) => {
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

  useEffect(() => {
    if (focusedCaseId) {
      setFilter('all');
      const found = CASE_BRIEFS.find((b) => b.id === focusedCaseId);
      if (found && onSelectCaseBrief) {
        onSelectCaseBrief(found);
      }
    }
  }, [focusedCaseId, onSelectCaseBrief]);

  const filteredBriefs = CASE_BRIEFS.filter((brief) => {
    if (filter === 'all') return true;
    return brief.practiceAreaId === filter;
  });

  return (
    <section id="cases" className="py-24 bg-[#0A0E17] border-b border-[#1E2536] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header with Dedicated Print Summary Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] mb-3 font-semibold">
              <span>{t('cases.kicker')}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-cinzel text-white tracking-tight">
              {t('cases.title')}
            </h2>
            <p className="mt-4 text-[#9BA5B7] leading-relaxed">
              {t('cases.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handlePrintSummaryCompendium}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#121927] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] text-xs font-semibold rounded-xl border border-[#C5A880]/40 hover:border-[#C5A880] transition-all shadow-sm group"
              title="Print Executive Precedent Summaries Compendium (triggers browser print action with #printable-document)"
            >
              <Printer className="w-4 h-4 text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
              <span>Print Summary Compendium</span>
            </button>
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#121824] rounded-xl border border-[#222B3D] max-w-xl mb-10">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === 'all'
                ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                : 'text-[#8C98AE] hover:text-white'
            }`}
          >
            {t('cases.filterAll')}
          </button>
          <button
            onClick={() => setFilter('dispute-resolution')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === 'dispute-resolution'
                ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                : 'text-[#8C98AE] hover:text-white'
            }`}
          >
            {t('cases.filterArb')}
          </button>
          <button
            onClick={() => setFilter('real-estate')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === 'real-estate'
                ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                : 'text-[#8C98AE] hover:text-white'
            }`}
          >
            {t('cases.filterRealEstate')}
          </button>
          <button
            onClick={() => setFilter('corporate-finance')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === 'corporate-finance'
                ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                : 'text-[#8C98AE] hover:text-white'
            }`}
          >
            {t('cases.filterCorp')}
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBriefs.map((brief) => (
            <div
              key={brief.id}
              id={`case-${brief.id}`}
              onClick={() => {
                if (onSelectCaseBrief) onSelectCaseBrief(brief);
              }}
              className={`p-7 rounded-2xl bg-[#0E1522] border transition-all flex flex-col justify-between cursor-pointer group hover:scale-[1.01] ${
                focusedCaseId === brief.id
                  ? 'border-[#C5A880] ring-2 ring-[#C5A880]/30 shadow-lg shadow-[#C5A880]/15'
                  : 'border-[#1C263A] hover:border-[#C5A880]/50'
              }`}
            >
              <div>
                {/* Unboxed metadata with typographic separators & discreet print button */}
                <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#8C98AE] mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[#C5A880] font-semibold">{brief.year}</span>
                    <span aria-hidden="true">·</span>
                    <span>{brief.clientCategory}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-[#C5A880]">
                      <Clock className="w-3 h-3 text-[#C5A880]" />
                      <span>{brief.readTime || '4 min read'}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {/* Dedicated Print Summary Quick Trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrintSummary(brief);
                      }}
                      title="Print Summary for this case precedent (triggers browser print action with #printable-document styles)"
                      className="p-1.5 rounded-lg text-[#8C98AE] hover:text-[#DFBE82] hover:bg-[#161F2E] border border-transparent hover:border-[#C5A880]/30 transition-all flex items-center gap-1 text-[11px] font-sans group"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#C5A880] group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] uppercase font-mono text-[#78869E] group-hover:text-[#E4C999]">Print</span>
                    </button>

                    {/* Interactive Annotation Layer Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAnnotatingBrief(brief);
                      }}
                      title="Open Interactive Annotation Layer (Highlight Clauses & Add Sticky Notes)"
                      className="p-1.5 rounded-lg text-[#8C98AE] hover:text-[#DFBE82] hover:bg-[#161F2E] border border-transparent hover:border-[#C5A880]/30 transition-all flex items-center gap-1 text-[11px] font-sans group"
                    >
                      <Highlighter className="w-3.5 h-3.5 text-[#C5A880] group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] uppercase font-mono text-[#78869E] group-hover:text-[#E4C999]">Annotate</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-cinzel text-white leading-snug">
                  {brief.matterName}
                </h3>

                <div className="text-xs font-medium text-[#A6B3C6] mt-2 font-mono">
                  {brief.forum}
                </div>

                <p className="mt-4 text-xs text-[#9DAABF] leading-relaxed">
                  {brief.summary}
                </p>

                <div className="mt-5 p-3.5 bg-[#121A28] rounded-xl border border-[#1E283C] space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#C5A880] font-semibold block">
                    {t('cases.outcome')}
                  </span>
                  <p className="text-xs text-[#D8E2EF] leading-relaxed font-medium">
                    {brief.impact}
                  </p>
                </div>
              </div>

              {/* Card Footer with Exposure, Dedicated Download as PDF & Direct Annotation Trigger */}
              <div className="mt-6 pt-4 border-t border-[#1C2436] flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#6F7A8F] block">{t('cases.exposure')}</span>
                  <span className="text-sm font-mono text-[#DFBE82] font-bold tabular-nums">
                    {brief.value}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Dedicated Print Summary Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintSummary(brief);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141D2C] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#E4C999] text-xs font-semibold border border-[#C5A880]/30 hover:border-[#C5A880] transition-all shadow-sm group"
                    title="Print Summary for this precedent using established #printable-document print styles"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
                    <span>Print Summary</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAnnotatingBrief(brief);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131B2A] hover:bg-[#1C283C] text-[#A6B4CD] hover:text-white border border-[#202E44] text-xs font-medium transition-all group shadow-sm"
                    title="Study Precedent, Highlight Clauses & Add Sticky Notes"
                  >
                    <StickyNote className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Annotate</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
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

