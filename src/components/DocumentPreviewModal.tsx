import React, { useState, useEffect } from 'react';
import {
  X, FileText, Download, Printer, ScanText, PenTool, Highlighter,
  Clock, Sparkles, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Maximize2, RotateCcw, ShieldCheck, CheckCircle2, Lock, Eye,
  BookOpen, FileCheck, Landmark
} from 'lucide-react';
import { MatterDocument, ClientMatter } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: MatterDocument | null;
  matter: ClientMatter;
  onSign?: (doc: MatterDocument) => void;
  onAnnotate?: (doc: MatterDocument) => void;
  onOcr?: (doc: MatterDocument) => void;
  onSummary?: (doc: MatterDocument) => void;
  onDownload?: (doc: MatterDocument) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  matter,
  onSign,
  onAnnotate,
  onOcr,
  onSummary,
  onDownload
}) => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = document?.pages || 4;
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isIvoryTheme, setIsIvoryTheme] = useState<boolean>(true); // Ivory parchment vs dark mode reader

  // Keyboard navigation & Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentPage < totalPages) setCurrentPage(p => p + 1);
      if (e.key === 'ArrowLeft' && currentPage > 1) setCurrentPage(p => p - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, totalPages, onClose]);

  // Reset page when document changes
  useEffect(() => {
    setCurrentPage(1);
    setZoomLevel(100);
  }, [document]);

  if (!isOpen || !document) return null;

  // Calculate estimated reading time
  const readingTime = document.readTime || `${Math.max(2, Math.ceil(totalPages * 1.8))} min read`;

  // Handle Print Pleading
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${document.name} - Official Court Pleading</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 15px; margin-bottom: 25px; }
            .stamp { border: 2px solid #c00; color: #c00; padding: 10px; margin: 20px 0; font-family: monospace; }
            .content { font-size: 14px; text-align: justify; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>REPUBLIC OF KENYA - IN THE SUPERIOR COURTS</h3>
            <h4>${matter.forum.toUpperCase()}</h4>
            <p>DOCKET: ${matter.reference} | CTS REF: ${matter.ctsNumber}</p>
            <p>BETWEEN: ${matter.caseTitle}</p>
          </div>
          <div class="stamp">
            <strong>KENYA JUDICIARY CTS SEALED ELECTRONIC RECORD</strong><br/>
            DOCUMENT: ${document.name} | DATE: ${document.date}<br/>
            CTS HASH: ${document.ctsHash} | SIGNATORY: ${document.signatory}
          </div>
          <div class="content">
            <h4>IN THE MATTER OF: ${document.category.toUpperCase()}</h4>
            <p>${document.summary}</p>
            <p>TAKE NOTICE that the Applicant / Claimant moves this Honorable Court for conservatory orders under Order 51 Rule 1 of the Civil Procedure Rules.</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#090D15] border border-[#C5A880]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 bg-[#0D1420] border-b border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Document Title & Reading Time */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 text-[#C5A880] flex items-center justify-center border border-[#C5A880]/30 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-cinzel text-white font-semibold">
                  {document.name}
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#162135] text-[#E4C999] border border-[#233550] text-[10px] font-mono">
                  {document.category}
                </span>
                {document.isSigned && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Signed KICA § 83B</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-[#8C98AE] mt-0.5 font-mono">
                {/* Prominent Reading Time Badge */}
                <span className="flex items-center gap-1 text-[#E4C999] font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{readingTime}</span>
                </span>
                <span>·</span>
                <span>{totalPages} Pages</span>
                <span>·</span>
                <span>{document.size}</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline text-[#6A788E] truncate max-w-xs">{document.ctsHash}</span>
              </div>
            </div>
          </div>

          {/* Reader Navigation & Zoom Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {/* Page Navigation */}
            <div className="flex items-center bg-[#131A26] rounded-lg border border-[#222E42] px-2 py-1 text-xs font-mono text-[#A6B2C4]">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 hover:text-white disabled:opacity-30 disabled:hover:text-[#A6B2C4] transition-colors"
                title="Previous Page (←)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-white">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 hover:text-white disabled:opacity-30 disabled:hover:text-[#A6B2C4] transition-colors"
                title="Next Page (→)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-[#131A26] rounded-lg border border-[#222E42] text-xs font-mono text-[#A6B2C4]">
              <button
                type="button"
                onClick={() => setZoomLevel(z => Math.max(70, z - 15))}
                className="p-1.5 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[11px] text-[#C5A880]">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(z => Math.min(150, z + 15))}
                className="p-1.5 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Theme Toggle: Parchment vs Dark Reader */}
            <button
              type="button"
              onClick={() => setIsIvoryTheme(!isIvoryTheme)}
              className="px-2.5 py-1 rounded-lg bg-[#131A26] hover:bg-[#1E283C] text-[11px] font-mono text-[#A6B4CD] border border-[#222E42] transition-colors"
              title="Toggle Ivory Parchment vs Dark Mode"
            >
              {isIvoryTheme ? '📄 Parchment' : '🌙 Dark'}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#8C98AE] hover:text-white rounded-lg transition-colors ml-1"
              title="Close Preview (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Viewer Body (Scrollable Parchment Viewport) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#06080E] flex justify-center items-start">
          <div
            className={`w-full max-w-3xl rounded-xl shadow-2xl transition-all duration-200 border relative ${
              isIvoryTheme
                ? 'bg-[#FAF8F5] text-[#1A1A1A] border-[#D9D1C5]'
                : 'bg-[#0B0F19] text-[#D8E2EF] border-[#1E293B]'
            }`}
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center'
            }}
          >
            {/* Watermark Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-4 select-none">
              <span className="text-6xl sm:text-7xl font-cinzel font-bold text-center tracking-widest -rotate-45">
                CERTIFIED CTS RECORD
              </span>
            </div>

            {/* Document Header (Judicial Coat of Arms & Bench) */}
            <div className="p-8 sm:p-12 pb-6 border-b border-black/10 text-center space-y-2">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-full border border-[#C5A880]/80 bg-[#C5A880]/10 flex items-center justify-center text-[#8C6D3B] font-serif font-bold text-xl shadow-sm">
                  ⚖
                </div>
              </div>

              <span className="text-[11px] uppercase tracking-widest font-mono text-[#8C6D3B] font-bold block">
                REPUBLIC OF KENYA
              </span>

              <h2 className="text-base sm:text-lg font-cinzel font-bold uppercase tracking-wider">
                IN THE HIGH COURT OF KENYA AT NAIROBI
              </h2>

              <p className="text-xs uppercase font-serif tracking-wide text-slate-700">
                {matter.forum} · COMMERCIAL ADMIRALTY DIVISION
              </p>

              <div className="pt-2 text-xs font-mono text-slate-600">
                CAUSE DOCKET NO: <strong>{matter.reference}</strong> | JUDICIARY CTS NO: <strong>{matter.ctsNumber}</strong>
              </div>

              <div className="pt-3 text-xs font-serif italic text-slate-800">
                BETWEEN: <strong>{matter.caseTitle}</strong>
              </div>

              {/* Official Seal & Stamp Simulation */}
              <div className="mt-4 p-3 rounded-lg border-2 border-red-700 bg-red-500/5 text-red-900 font-mono text-[11px] flex items-center justify-between text-left">
                <div>
                  <span className="font-bold block tracking-wider uppercase">
                    HIGH COURT OF KENYA · E-FILING REGISTRY
                  </span>
                  <span className="text-[10px]">
                    SEALED &amp; ADMITTED UNDER ORDER 51 RULE 1
                  </span>
                </div>
                <div className="text-right text-[10px]">
                  <span>DATE: {document.date}</span><br />
                  <span>REF: {document.ctsHash.slice(0, 16)}</span>
                </div>
              </div>
            </div>

            {/* Multi-Page Dynamic Body Content */}
            <div className="p-8 sm:p-12 space-y-5 text-xs sm:text-sm font-serif leading-relaxed">
              {currentPage === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="font-bold text-center underline uppercase tracking-wider text-xs sm:text-sm">
                    {document.name.replace('.pdf', '')}
                  </div>

                  <p className="font-bold uppercase tracking-wide text-[11px]">
                    IN THE MATTER OF: {document.category.toUpperCase()} FILED PURSUANT TO SECTION 106B OF THE EVIDENCE ACT (CAP 80)
                  </p>

                  <p>
                    <strong>1. ORIGINATING APPLICATION:</strong> The Applicant / Claimant, <em>{matter.clientEntity}</em>, through its instructed Senior Counsel of <strong>Petersons Angwenyi &amp; Associates Advocates</strong>, moves this honorable forum seeking urgent conservatory orders preserving the contractual res.
                  </p>

                  <p>
                    <strong>2. JURISDICTIONAL STATEMENT:</strong> This Court and Tribunal is fully seised of territorial and subject-matter jurisdiction pursuant to Section 6 of the Civil Procedure Act (Cap 21) and the arbitration agreement executed between the parties.
                  </p>

                  <p className="p-3 bg-black/5 rounded-lg border border-black/10 font-sans text-xs">
                    <strong>EXECUTIVE SUMMARY OF PLEADING:</strong><br />
                    {document.summary}
                  </p>
                </div>
              )}

              {currentPage === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="font-bold text-center underline uppercase tracking-wider text-xs sm:text-sm">
                    GROUNDS IN SUPPORT &amp; FACTUAL MATRIX
                  </div>

                  <p>
                    <strong>3. FACTUAL MATRIX:</strong> On or about the relevant contractual commencement date, the parties entered into an engineering, procurement, and construction agreement governed by the FIDIC Conditions of Contract.
                  </p>

                  <p>
                    <strong>4. CONTRACTOR DEFAULT &amp; DELAY:</strong> The Respondent failed to adhere to the critical path construction timetable, resulting in an unexcused delay of 184 days. The Dispute Adjudication Board (DAB) determined full contractor culpability and dismissed the claims for extension of time.
                  </p>

                  <p>
                    <strong>5. EVIDENCE ACT SECTION 80:</strong> The facts deposed herein are true to the best of knowledge, information, and belief of the deponent, derived from certified commercial logs and electronic transmissions.
                  </p>
                </div>
              )}

              {currentPage === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="font-bold text-center underline uppercase tracking-wider text-xs sm:text-sm">
                    SCHEDULE OF DAMAGES &amp; FORENSIC EXHIBITS
                  </div>

                  <p>
                    <strong>6. LIQUIDATED DAMAGES COMPUTATION:</strong> Pursuant to contractual Sub-Clause 8.7, liquidated delay damages have accrued at the rate of USD $45,000 per calendar day, yielding a crystallized claim of USD $8,280,000.
                  </p>

                  <div className="overflow-x-auto my-3">
                    <table className="w-full border-collapse border border-black/20 text-xs font-mono">
                      <thead>
                        <tr className="bg-black/5">
                          <th className="border border-black/20 p-2 text-left">Pleading Item</th>
                          <th className="border border-black/20 p-2 text-left">Statutory Basis</th>
                          <th className="border border-black/20 p-2 text-right">Claimed Quantum</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-black/20 p-2">Delay Liquidated Damages</td>
                          <td className="border border-black/20 p-2">FIDIC Sub-Clause 8.7</td>
                          <td className="border border-black/20 p-2 text-right">USD $8,280,000</td>
                        </tr>
                        <tr>
                          <td className="border border-black/20 p-2">Structural Foundation Rectification</td>
                          <td className="border border-black/20 p-2">Bureau Veritas Audit</td>
                          <td className="border border-black/20 p-2 text-right">USD $5,970,000</td>
                        </tr>
                        <tr className="font-bold bg-black/5">
                          <td className="border border-black/20 p-2">Total Verified Claim</td>
                          <td className="border border-black/20 p-2">ARO Schedule VI</td>
                          <td className="border border-black/20 p-2 text-right">USD $14,250,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p>
                    <strong>7. PRESERVATION OF PERFORMANCE SECURITIES:</strong> Standard Chartered Bank Performance Guarantee No. SCB-NBI-2024-098 is in danger of unlawful encashment absent immediate judicial intervention.
                  </p>
                </div>
              )}

              {currentPage === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="font-bold text-center underline uppercase tracking-wider text-xs sm:text-sm">
                    PRAYERS FOR RELIEF &amp; STATUTORY CERTIFICATION
                  </div>

                  <p>
                    <strong>REASONS WHEREFORE</strong> the Applicant prays for orders that:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-2">
                    <li>An interim conservatory injunction do issue restraining unilateral encashment of performance bonds.</li>
                    <li>The Dispute Adjudication Board award be formally registered for enforcement.</li>
                    <li>Costs of this Application be provided for under the Advocates (Remuneration) Order.</li>
                  </ol>

                  {/* Signatures & Wax Seal Simulation */}
                  <div className="pt-8 border-t border-black/15 flex flex-col sm:flex-row sm:items-end justify-between gap-4 font-mono text-xs">
                    <div>
                      <span className="font-bold block text-slate-900">DRAWN &amp; FILED BY:</span>
                      <span className="font-serif font-bold text-sm block mt-0.5">
                        Petersons Angwenyi &amp; Associates Advocates
                      </span>
                      <span>Upper Hill Chambers, Mara Road, Nairobi</span><br />
                      <span className="text-[10px] text-slate-600">Email: litigation@paalawkenya.com</span>
                    </div>

                    <div className="text-right">
                      <div className="inline-block p-3 rounded-lg border border-dashed border-[#8C6D3B] bg-[#C5A880]/10 text-center min-w-[180px]">
                        <span className="text-[10px] uppercase font-bold text-[#8C6D3B] block">
                          HIGH COURT ADVOCATES SEAL
                        </span>
                        <span className="font-script text-lg text-slate-900 block my-1">
                          {document.signatory.split('(')[0].trim()}
                        </span>
                        <span className="text-[9px] text-slate-600 block">
                          LSK Practising Certificate Valid 2026
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Document Page Footer */}
            <div className="px-8 sm:px-12 py-4 border-t border-black/10 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Section 134 Kenya Evidence Act (Privilege Enforced)</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>
          </div>
        </div>

        {/* Bottom Workflow Actions Bar */}
        <div className="px-5 py-3.5 bg-[#0D1420] border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#8C98AE]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>KICA § 83B Digital Execution &amp; CTS Cryptographic Hash Certified</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Generate Legal Summary */}
            {onSummary && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSummary(document);
                }}
                className="px-3 py-1.5 bg-[#172236] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#E4C999] rounded-lg text-xs font-semibold border border-[#C5A880]/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Legal Summary</span>
              </button>
            )}

            {/* Run OCR */}
            {onOcr && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOcr(document);
                }}
                className="px-3 py-1.5 bg-[#141F30] hover:bg-[#1E2E46] text-[#C5A880] rounded-lg text-xs font-semibold border border-[#C5A880]/30 transition-all flex items-center gap-1.5"
              >
                <ScanText className="w-3.5 h-3.5" />
                <span>OCR</span>
              </button>
            )}

            {/* Annotate */}
            {onAnnotate && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAnnotate(document);
                }}
                className="px-3 py-1.5 bg-[#172338] hover:bg-[#202E48] text-[#A6B4CD] hover:text-white rounded-lg text-xs font-semibold border border-[#233148] transition-colors flex items-center gap-1.5"
              >
                <Highlighter className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Annotate</span>
              </button>
            )}

            {/* Digital Sign */}
            {onSign && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSign(document);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 shadow-sm ${
                  document.isSigned
                    ? 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40'
                    : 'bg-[#152336] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#E4C999] border-[#C5A880]/40'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>{document.isSigned ? 'Re-Sign Document' : 'Sign Document'}</span>
              </button>
            )}

            {/* Print Document */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 text-[#8C98AE] hover:text-white rounded-lg hover:bg-[#1A2538] transition-colors"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download File */}
            {onDownload && (
              <button
                type="button"
                onClick={() => {
                  onDownload(document);
                  onClose();
                }}
                className="px-4 py-1.5 bg-[#C5A880] text-[#0A0E17] font-semibold text-xs rounded-lg hover:brightness-110 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
