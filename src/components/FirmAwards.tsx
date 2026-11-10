import React, { useState } from 'react';
import { 
  Trophy, Award, Medal, ShieldCheck, Printer, Download, 
  ExternalLink, CheckCircle2, Star, Sparkles, Scale, ArrowRight
} from 'lucide-react';
import { LAW_FIRM_AWARDS, LawFirmAward } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';
import { PrintFriendlyModal } from './PrintFriendlyModal';
import { 
  formatSingleAwardForPrint, 
  formatAwardsCompendiumForPrint, 
  PrintDocument 
} from '../utils/printFriendly';

interface FirmAwardsProps {
  onOpenConsultation?: (practice?: string) => void;
}

export const FirmAwards: React.FC<FirmAwardsProps> = ({ onOpenConsultation }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'global' | 'national' | 'finance'>('all');
  const [printDoc, setPrintDoc] = useState<PrintDocument | null>(null);

  const filteredAwards = LAW_FIRM_AWARDS.filter((award) => {
    if (filter === 'all') return true;
    return award.categoryGroup === filter;
  });

  // Directly triggers browser print dialog targeting #printable-document via index.css @media print
  const handlePrintSingleAward = (award: LawFirmAward) => {
    const doc = formatSingleAwardForPrint(award);
    setPrintDoc(doc);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintCompendium = () => {
    const doc = formatAwardsCompendiumForPrint(LAW_FIRM_AWARDS);
    setPrintDoc(doc);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <section id="awards" className="py-24 bg-[#080B11] border-b border-[#1E2536] relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Section Header with Dedicated Print Compendium Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] mb-3 font-semibold">
              <Trophy className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{t('awards.kicker')}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-cinzel text-white tracking-tight">
              {t('awards.title')}
            </h2>
            <p className="mt-4 text-[#9BA5B7] leading-relaxed">
              {t('awards.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handlePrintCompendium}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#121927] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] text-xs font-semibold rounded-xl border border-[#C5A880]/40 hover:border-[#C5A880] transition-all shadow-sm group cursor-pointer"
              title="Print Summary Compendium of all law firm awards using established #printable-document print styles"
            >
              <Printer className="w-4 h-4 text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
              <span>{t('awards.printCompendium')}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#121824] rounded-xl border border-[#222B3D] max-w-2xl mb-10">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === 'all'
                ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                : 'text-[#8C98AE] hover:text-white'
            }`}
          >
            {t('awards.filterAll')}
          </button>
          <button
            onClick={() => setFilter('global')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === 'global'
                ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                : 'text-[#8C98AE] hover:text-white'
            }`}
          >
            {t('awards.filterGlobal')}
          </button>
          <button
            onClick={() => setFilter('national')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === 'national'
                ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                : 'text-[#8C98AE] hover:text-white'
            }`}
          >
            {t('awards.filterNational')}
          </button>
          <button
            onClick={() => setFilter('finance')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === 'finance'
                ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                : 'text-[#8C98AE] hover:text-white'
            }`}
          >
            {t('awards.filterFinance')}
          </button>
        </div>

        {/* Awards Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAwards.map((award) => (
            <div
              key={award.id}
              className="p-7 rounded-2xl bg-[#0E1522] border border-[#1C263A] hover:border-[#C5A880]/50 transition-all flex flex-col justify-between group hover:scale-[1.01] shadow-lg shadow-black/20"
            >
              <div>
                {/* Unboxed Metadata Strip */}
                <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#8C98AE] mb-3">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[#C5A880] font-semibold">{award.year}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{award.scope}</span>
                  </div>

                  {/* Print Summary Quick Action */}
                  <button
                    onClick={() => handlePrintSingleAward(award)}
                    title="Print Summary for this accreditation (triggers browser print action with #printable-document)"
                    className="p-1.5 rounded-lg text-[#8C98AE] hover:text-[#DFBE82] hover:bg-[#161F2E] border border-transparent hover:border-[#C5A880]/30 transition-all flex items-center gap-1 text-[11px] font-sans group cursor-pointer shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#C5A880] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] uppercase font-mono text-[#78869E] group-hover:text-[#E4C999]">Print</span>
                  </button>
                </div>

                {/* Organization & Tier Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] shrink-0">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block font-sans">
                      {award.organization}
                    </span>
                    <span className="text-[10px] font-mono text-[#E4C999] font-medium">
                      {award.tier}
                    </span>
                  </div>
                </div>

                {/* Award Title */}
                <h3 className="text-base sm:text-lg font-cinzel text-white leading-snug mt-3">
                  {award.title}
                </h3>

                {/* Specialization Category */}
                <div className="text-xs font-medium text-[#A6B3C6] mt-2 font-mono">
                  {award.category}
                </div>

                {/* Editorial Citation Quote */}
                <div className="mt-4 p-3.5 bg-[#121A28] rounded-xl border border-[#1E283C] space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#C5A880] font-semibold block font-sans">
                    Directory Editorial Review:
                  </span>
                  <p className="text-xs text-[#D8E2EF] leading-relaxed italic font-serif">
                    "{award.citation}"
                  </p>
                </div>
              </div>

              {/* Card Footer with Accreditation Code & Print Summary CTA */}
              <div className="mt-6 pt-4 border-t border-[#1C2436] flex items-center justify-between gap-2 flex-wrap">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-mono text-[#6F7A8F] block">
                    {t('awards.verifiedRef')}
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{award.accreditationRef}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Dedicated Print Summary Button */}
                  <button
                    type="button"
                    onClick={() => handlePrintSingleAward(award)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141D2C] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#E4C999] text-xs font-semibold border border-[#C5A880]/30 hover:border-[#C5A880] transition-all shadow-sm group cursor-pointer"
                    title="Print Summary of this award using established #printable-document print styles"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
                    <span>Print Summary</span>
                  </button>

                  {onOpenConsultation && (
                    <button
                      type="button"
                      onClick={() => onOpenConsultation(award.category)}
                      className="p-1.5 rounded-xl bg-[#131B2A] hover:bg-[#1C283C] text-[#8C98AE] hover:text-white border border-[#202E44] transition-colors"
                      title="Instruct chambers in this practice"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Chambers Institutional Recognition Strip */}
        <div className="mt-14 p-6 rounded-2xl bg-[#0D131F] border border-[#222E44] grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-cinzel font-bold text-[#E4C999]">Band 1</div>
            <div className="text-xs text-[#8C98AE] font-mono">Chambers Global (2026)</div>
            <div className="text-[10px] text-[#5D6B80]">Commercial Dispute Resolution</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-cinzel font-bold text-[#E4C999]">Tier 1 Top Tier</div>
            <div className="text-xs text-[#8C98AE] font-mono">The Legal 500 EMEA</div>
            <div className="text-[10px] text-[#5D6B80]">Corporate &amp; Energy M&amp;A</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-cinzel font-bold text-[#E4C999]">Winner</div>
            <div className="text-xs text-[#8C98AE] font-mono">LSK Legal Excellence</div>
            <div className="text-[10px] text-[#5D6B80]">Litigation Law Firm of the Year</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-cinzel font-bold text-[#E4C999]">FCIArb</div>
            <div className="text-xs text-[#8C98AE] font-mono">Chartered Arbitrators</div>
            <div className="text-[10px] text-[#5D6B80]">NCIA &amp; LCIA Panels</div>
          </div>
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
