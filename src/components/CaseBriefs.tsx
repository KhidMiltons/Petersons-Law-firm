import React, { useState, useEffect } from 'react';
import { CASE_BRIEFS, CaseBrief } from '../data/firmData';
import { Scale, ArrowUpRight, Award, Shield, Printer, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { PrintFriendlyModal } from './PrintFriendlyModal';
import { formatCaseBriefForPrint, PrintDocument } from '../utils/printFriendly';

interface CaseBriefsProps {
  focusedCaseId?: string | null;
}

export const CaseBriefs: React.FC<CaseBriefsProps> = ({ focusedCaseId }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<string>('all');
  const [printDoc, setPrintDoc] = useState<PrintDocument | null>(null);

  useEffect(() => {
    if (focusedCaseId) {
      setFilter('all');
    }
  }, [focusedCaseId]);

  const filteredBriefs = CASE_BRIEFS.filter((brief) => {
    if (filter === 'all') return true;
    return brief.practiceAreaId === filter;
  });

  return (
    <section id="cases" className="py-24 bg-[#0A0E17] border-b border-[#1E2536] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
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
              className={`p-7 rounded-2xl bg-[#0E1522] border transition-all flex flex-col justify-between ${
                focusedCaseId === brief.id
                  ? 'border-[#C5A880] ring-2 ring-[#C5A880]/30 shadow-lg shadow-[#C5A880]/15'
                  : 'border-[#1C263A] hover:border-[#C5A880]/40'
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
                  
                  {/* Discreet Print Icon */}
                  <button
                    onClick={() => setPrintDoc(formatCaseBriefForPrint(brief))}
                    title="Print Case Brief / Save Offline PDF"
                    className="p-1.5 rounded-lg text-[#8C98AE] hover:text-[#DFBE82] hover:bg-[#161F2E] border border-transparent hover:border-[#C5A880]/30 transition-all flex items-center gap-1 text-[11px] font-sans group"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#8C98AE] group-hover:text-[#C5A880] transition-colors" />
                    <span className="text-[10px] uppercase font-mono text-[#78869E] group-hover:text-[#E4C999]">Print</span>
                  </button>
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

              <div className="mt-6 pt-4 border-t border-[#1C2436] flex items-center justify-between">
                <span className="text-xs text-[#6F7A8F]">{t('cases.exposure')}</span>
                <span className="text-sm font-mono text-[#DFBE82] font-bold tabular-nums">
                  {brief.value}
                </span>
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
    </section>
  );
};

