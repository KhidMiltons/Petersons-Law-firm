import React, { useState, useEffect } from 'react';
import { LEGAL_ARTICLES, LegalArticle } from '../data/firmData';
import { BookOpen, ArrowRight, X, BookmarkCheck, Printer, Clock, Download, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { PrintFriendlyModal } from './PrintFriendlyModal';
import { formatLegalInsightForPrint, formatAllLegalInsightsForPrint, PrintDocument } from '../utils/printFriendly';

interface LegalInsightsProps {
  onSelectArticle?: (article: LegalArticle | null) => void;
}

export const LegalInsights: React.FC<LegalInsightsProps> = ({ onSelectArticle }) => {
  const { t } = useLanguage();
  const [activeArticle, setActiveArticle] = useState<LegalArticle | null>(null);
  const [printDoc, setPrintDoc] = useState<PrintDocument | null>(null);

  const handleOpenArticle = (article: LegalArticle) => {
    setActiveArticle(article);
    if (onSelectArticle) onSelectArticle(article);
  };

  const handleCloseArticle = () => {
    setActiveArticle(null);
    if (onSelectArticle) onSelectArticle(null);
  };

  // Directly triggers browser print dialog targeting #printable-document via index.css @media print
  const handlePrintSummary = (article: LegalArticle) => {
    const doc = formatLegalInsightForPrint(article);
    setPrintDoc(doc);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Directly triggers browser print dialog for full legal insights compendium
  const handlePrintSummaryCompendium = () => {
    const doc = formatAllLegalInsightsForPrint(LEGAL_ARTICLES);
    setPrintDoc(doc);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Keyboard shortcut listener: Cmd+P / Ctrl+P while reading article opens print preview
  useEffect(() => {
    if (!activeArticle) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrintSummary(activeArticle);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeArticle]);

  return (
    <section id="insights" className="py-24 bg-[#080B11] border-b border-[#1E2536] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header with Dedicated Print Summary Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] mb-3 font-semibold">
              <span>{t('insights.kicker')}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-cinzel text-white tracking-tight">
              {t('insights.title')}
            </h2>
            <p className="mt-4 text-[#9BA5B7] leading-relaxed">
              {t('insights.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handlePrintSummaryCompendium}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#121927] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] text-xs font-semibold rounded-xl border border-[#C5A880]/40 hover:border-[#C5A880] transition-all shadow-sm group"
              title="Print Summary of all legal insight articles using established #printable-document print styles"
            >
              <Printer className="w-4 h-4 text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
              <span>Print Summary Compendium</span>
            </button>
          </div>
        </div>

        {/* 3-Column Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {LEGAL_ARTICLES.map((article) => (
            <article
              key={article.id}
              className="p-7 rounded-2xl bg-[#0E1522] border border-[#1C263A] hover:border-[#C5A880]/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Zero-Pill unboxed metadata & discreet print button */}
                <div className="flex items-center justify-between gap-2 text-xs text-[#8C98AE] mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[#C5A880] font-medium">{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-[#C5A880]">
                      <Clock className="w-3 h-3 text-[#C5A880]" />
                      <span>{article.readTime}</span>
                    </span>
                  </div>

                  {/* Dedicated Print Summary Quick Icon */}
                  <button
                    onClick={() => handlePrintSummary(article)}
                    title="Print Summary for this insight article (triggers browser print action with #printable-document styles)"
                    className="p-1.5 rounded-lg text-[#8C98AE] hover:text-[#DFBE82] hover:bg-[#161F2E] border border-transparent hover:border-[#C5A880]/30 transition-all flex items-center gap-1 text-[11px] font-sans group"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#C5A880] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] uppercase font-mono text-[#78869E] group-hover:text-[#E4C999]">Print</span>
                  </button>
                </div>

                <h3 className="text-lg font-cinzel text-white hover:text-[#DFBE82] transition-colors leading-snug">
                  {article.title}
                </h3>

                <p className="mt-4 text-xs text-[#9DAABF] leading-relaxed line-clamp-4">
                  {article.synopsis}
                </p>

                <div className="mt-4 text-[11px] font-mono text-[#6F7A8F]">
                  {t('insights.citation')}: {article.citation}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1C2436] flex items-center justify-between gap-2 flex-wrap">
                <button
                  onClick={() => handleOpenArticle(article)}
                  className="text-xs text-[#C5A880] hover:text-[#DFBE82] font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-colors"
                >
                  <span>{t('insights.readFull')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Dedicated Print Summary Button */}
                <button
                  onClick={() => handlePrintSummary(article)}
                  title="Print Summary using #printable-document print styles"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141D2C] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#E4C999] text-xs font-medium rounded-lg border border-[#C5A880]/30 hover:border-[#C5A880] transition-all shadow-sm group"
                >
                  <Printer className="w-3.5 h-3.5 text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
                  <span>Print Summary</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Section Print-Ready Export Dock */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-[#0D1422] border border-[#C5A880]/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block font-cinzel">
                Printer-Ready Legal Briefings &amp; Statutory Analysis
              </span>
              <p className="text-[11px] text-[#8C98AE] leading-tight mt-0.5">
                Formatted with Chambers letterhead, official KLR citations, ratio decidendi, and Section 134 privilege disclaimers.
              </p>
            </div>
          </div>

          <button
            onClick={handlePrintSummaryCompendium}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#141E2F] hover:bg-[#C5A880] text-[#E4C999] hover:text-[#0A0E17] text-xs font-semibold rounded-xl border border-[#C5A880]/40 hover:border-[#C5A880] transition-all shadow-md group cursor-pointer whitespace-nowrap"
            title="Export all legal briefing articles in a clean, professional print-ready format"
          >
            <Printer className="w-4 h-4 text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
            <span>Export Complete Digest (PDF)</span>
          </button>
        </div>

        {/* Full Article Reader Modal */}
        {activeArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-2xl bg-[#0D131F] border border-[#C5A880]/30 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              
              <div className="p-6 bg-[#121927] border-b border-[#222E46] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] font-semibold flex-wrap">
                    <span>{activeArticle.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeArticle.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-[#E4C999] normal-case tracking-normal">
                      <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>{activeArticle.readTime}</span>
                    </span>
                  </div>
                  <h3 className="text-xl font-cinzel text-white mt-1 leading-snug">{activeArticle.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintSummary(activeArticle)}
                    title="Print Summary (triggers browser print dialog with #printable-document)"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172132] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] text-xs font-semibold rounded-lg border border-[#C5A880]/40 transition-all shadow-sm group"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
                    <span>Print Summary</span>
                  </button>
                  <button
                    onClick={handleCloseArticle}
                    className="p-2 text-[#8C98AE] hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto space-y-4 text-sm text-[#BAC5D6] leading-relaxed relative">
                <div className="p-3 bg-[#131B29] rounded-xl border border-[#20293D] text-xs font-mono text-[#E4C999]">
                  Official Chambers Citation: {activeArticle.citation}
                </div>

                {activeArticle.content.map((paragraph, index) => (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}

                <div className="p-4 bg-[#111722] rounded-xl border border-[#1E2638] text-xs text-[#8C98AE] mt-6">
                  <strong className="text-white block mb-1">Legal Disclaimer:</strong>
                  This briefing is published for informational purposes under the auspices of Petersons Angwenyi &amp; Associates Advocates and does not constitute formal legal counsel. For actionable legal opinions on specific commercial transactions, contact chambers registry.
                </div>
              </div>

              {/* Floating Print-Ready Button for Clean PDF / Paper Exports during reading */}
              <div className="absolute bottom-20 right-6 z-20 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => handlePrintSummary(activeArticle)}
                  className="flex items-center gap-2 px-3.5 py-2.5 bg-[#0C1322]/95 hover:bg-[#C5A880] text-[#E4C999] hover:text-[#0A0E17] text-xs font-semibold rounded-xl border border-[#C5A880]/60 hover:border-[#C5A880] shadow-2xl backdrop-blur-md transition-all group cursor-pointer hover:scale-105 active:scale-95 ring-1 ring-black/50"
                  title="Floating Print-Ready Action: Trigger print media query stylesheet for clean, professional PDF or paper export"
                  aria-label="Floating Print Briefing Button"
                >
                  <Printer className="w-4 h-4 text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
                  <span>Print Briefing (PDF)</span>
                  <span className="hidden sm:inline font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#162134] group-hover:bg-[#8D7249] text-[#A6B4CD] group-hover:text-[#0A0E17]">
                    ⌘P
                  </span>
                </button>
              </div>

              <div className="p-4 bg-[#121927] border-t border-[#222E46] flex items-center justify-between">
                <button
                  onClick={() => handlePrintSummary(activeArticle)}
                  className="flex items-center gap-1.5 text-xs text-[#8C98AE] hover:text-[#DFBE82] transition-colors group"
                >
                  <Printer className="w-3.5 h-3.5 text-[#C5A880] group-hover:text-[#DFBE82] transition-colors" />
                  <span>Print Article Summary</span>
                </button>

                <button
                  onClick={handleCloseArticle}
                  className="px-5 py-2 bg-[#C5A880] text-[#0A0E17] font-semibold text-xs tracking-wider uppercase rounded-lg hover:brightness-110"
                >
                  {t('insights.close')}
                </button>
              </div>

            </div>
          </div>
        )}

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

