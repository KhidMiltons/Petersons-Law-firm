import React from 'react';
import { X, Printer, Download, Scale, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { PrintDocument, downloadOfflineTextCopy } from '../utils/printFriendly';
import { useLanguage } from '../context/LanguageContext';

interface PrintFriendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: PrintDocument | null;
}

export const PrintFriendlyModal: React.FC<PrintFriendlyModalProps> = ({
  isOpen,
  onClose,
  document
}) => {
  const { t } = useLanguage();

  if (!isOpen || !document) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadOffline = () => {
    downloadOfflineTextCopy(document);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      
      {/* Container Dialog */}
      <div className="relative w-full max-w-4xl bg-[#0B0F17] border border-[#C5A880]/40 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Control Bar (Hidden when printing via .no-print) */}
        <div className="no-print p-4 sm:p-5 bg-[#101724] border-b border-[#222E44] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C5A880]/15 flex items-center justify-center text-[#C5A880] border border-[#C5A880]/30 shadow-inner">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#C5A880] font-semibold">
                <span>Printer-Ready PDF Layout · Offline Certified Record</span>
              </div>
              <h3 className="text-base sm:text-lg font-cinzel text-white flex items-center gap-2">
                {document.meta.docType}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadOffline}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172132] hover:bg-[#202C42] text-[#A6B4CD] hover:text-white text-xs font-medium rounded-lg border border-[#24334C] transition-all"
              title="Download offline text document"
            >
              <Download className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="hidden sm:inline">Offline Copy (.txt)</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C5A880] to-[#E4C999] text-[#0A0E17] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg shadow-[#C5A880]/10 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#8C98AE] hover:text-white rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#070A10] flex justify-center">
          
          {/* THE PRINTABLE SHEET (White paper format on screen & printer) */}
          <div
            id="printable-document"
            className="w-full max-w-3xl bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-sm font-serif print:shadow-none print:p-0 print:m-0"
          >
            {/* Formal Chambers Letterhead */}
            <header className="border-b-2 border-slate-900 pb-5 mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Scale className="w-5 h-5 text-amber-800" />
                <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-amber-900">
                  Advocates · Commissioners for Oaths · Notaries Public
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight uppercase text-slate-950 font-serif">
                {document.firmDetails.name}
              </h1>
              <p className="text-xs text-slate-600 font-sans mt-1">
                {document.firmDetails.chambers} · {document.firmDetails.address}
              </p>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                Tel: {document.firmDetails.telephone} · Email: {document.firmDetails.email} · {document.firmDetails.lskRef}
              </p>
            </header>

            {/* Document Metadata Strip */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 mb-6 text-xs font-sans grid grid-cols-2 sm:grid-cols-4 gap-3 print:bg-slate-50">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">DOCUMENT REF:</span>
                <span className="font-mono font-semibold text-slate-900">{document.meta.docRef}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">GENERATION DATE:</span>
                <span className="font-semibold text-slate-900">{document.meta.dateGenerated}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">CLASSIFICATION:</span>
                <span className="font-semibold text-slate-900">{document.meta.category}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">SECURITY LEVEL:</span>
                <span className="font-semibold text-emerald-800">Section 134 Privileged</span>
              </div>
            </div>

            {/* Title & Official Subtitle */}
            <div className="mb-6 pb-4 border-b border-slate-200">
              <span className="text-[11px] font-sans uppercase font-bold tracking-wider text-amber-800 block mb-1">
                {document.meta.docType}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 leading-tight">
                {document.meta.title}
              </h2>
              <p className="text-xs font-sans text-slate-600 mt-1 italic">
                {document.meta.subtitle}
              </p>
              <p className="text-[11px] font-mono text-slate-500 mt-2">
                Official Citation: <strong>{document.meta.citation}</strong>
              </p>
            </div>

            {/* Main Sections Body */}
            <div className="space-y-6 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif">
              {document.sections.map((section, idx) => (
                <div 
                  key={idx} 
                  className={`break-inside-avoid ${
                    section.isHighlight 
                      ? 'p-4 bg-amber-50/50 border-l-4 border-amber-800 rounded-r text-slate-900' 
                      : ''
                  }`}
                >
                  {section.heading && (
                    <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                      {section.heading}
                    </h3>
                  )}
                  {Array.isArray(section.content) ? (
                    <div className="space-y-3">
                      {section.content.map((p, pIdx) => (
                        <p key={pIdx} className="leading-relaxed">
                          {p}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="whitespace-pre-line leading-relaxed">
                      {section.content}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Statutory Framework References */}
            {document.statutoryBasis && document.statutoryBasis.length > 0 && (
              <div className="mt-8 pt-4 border-t border-slate-200 break-inside-avoid">
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Governing Acts of Parliament & Judicial Authorities
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-sans text-slate-700">
                  {document.statutoryBasis.map((statute, sIdx) => (
                    <li key={sIdx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-800 shrink-0" />
                      <span>{statute}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formal Certificate & Stamp Seal Block */}
            <footer className="mt-10 pt-6 border-t-2 border-slate-900 break-inside-avoid">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                {/* Red Circular Seal Simulation */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full border-2 border-red-700 p-1 flex items-center justify-center text-center rotate-[-4deg]">
                    <div className="w-full h-full rounded-full border border-dashed border-red-700 flex flex-col items-center justify-center text-[7px] font-mono text-red-800 leading-none font-bold uppercase p-0.5">
                      <span>CHAMBERS OF</span>
                      <span className="text-[8px] my-0.5 text-red-900">PAA</span>
                      <span>CERTIFIED</span>
                    </div>
                  </div>
                  <div className="text-[11px] font-sans text-slate-600">
                    <span className="font-bold text-slate-900 block">CERTIFIED TRUE RECORD</span>
                    <span>Law Society of Kenya (LSK) Accredited</span>
                    <span className="block font-mono text-[10px] text-slate-500">
                      Ref: {document.meta.docRef}
                    </span>
                  </div>
                </div>

                {/* Advocate Signatory Block */}
                <div className="text-right text-xs font-sans">
                  <div className="italic text-slate-600 font-serif mb-1">
                    Certified for and on behalf of Chambers:
                  </div>
                  <div className="font-bold text-slate-950 font-serif">
                    {document.firmDetails.rollNumber}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Advocates of the High Court of Kenya
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Mara Road, Upper Hill, Nairobi
                  </div>
                </div>

              </div>

              {/* Disclaimer */}
              <div className="mt-4 pt-3 border-t border-slate-200 text-[9px] font-sans text-slate-500 leading-tight text-center">
                This document is prepared as a certified offline legal transcript. Unlawful alteration, extraction, or reproduction without written authorization of Petersons Angwenyi & Associates Advocates is strictly prohibited under the Advocates Act (Cap 16) and Copyright Act.
              </div>
            </footer>

          </div>
        </div>

        {/* Modal Bottom Action Bar (Hidden when printing via .no-print) */}
        <div className="no-print p-4 bg-[#101724] border-t border-[#222E44] flex items-center justify-between text-xs text-[#8C98AE]">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
            <span>Ready for standard A4 and US Letter printing or PDF export.</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#172132] hover:bg-[#202C42] text-white rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#C5A880] text-[#0A0E17] font-semibold rounded-lg hover:brightness-110 transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
