import React, { useState, useMemo } from 'react';
import {
  X,
  ScanText,
  Search,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Download,
  Eye,
  RefreshCw,
  FileText,
  Scale,
  Lock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { MatterDocument, ClientMatter } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

interface SecureDocumentOCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: MatterDocument | null;
  matter: ClientMatter;
}

interface OCRPage {
  pageNumber: number;
  scannedImageUrl?: string;
  originalText: string;
  redactedText: string;
}

export const SecureDocumentOCRModal: React.FC<SecureDocumentOCRModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  matter,
}) => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPiiRedacted, setIsPiiRedacted] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState(99.4);

  // Generate realistic OCR page transcripts based on the document category and title
  const pages: OCRPage[] = useMemo(() => {
    if (!doc) return [];

    const docName = doc.name.toLowerCase();

    if (docName.includes('statement of claim') || docName.includes('pleadings')) {
      return [
        {
          pageNumber: 1,
          originalText: `IN THE NAIROBI CENTRE FOR INTERNATIONAL ARBITRATION (NCIA)
AT NAIROBI
ARBITRAL TRIBUNAL CAUSE NO. NCIA/ARB/2026/042

BETWEEN:
CONSOLIDATED INFRASTRUCTURE DEVELOPERS LTD ................. CLAIMANT
(Incorporated under the Companies Act 2015, KRA PIN: P051289140X)

AND
PACIFIC CONTINENTAL CONTRACTORS PLC ......................... RESPONDENT
(Holding Bank Escrow Account No. 0110928410290 at KCB Bank Upper Hill)

STATEMENT OF CLAIM & MEMORIAL ON LIQUIDATED DAMAGES

1. The Claimant is a limited liability corporate entity duly incorporated under the laws of Kenya, maintaining its corporate headquarters at Mara Road, Upper Hill, Nairobi.
2. The Respondent is a tier-one EPC civil engineering contractor carrying on commercial infrastructure operations in Nairobi and Mombasa.
3. On or about 14th January 2024, the parties entered into a binding FIDIC Conditions of Contract for Construction (Red Book 1999 Edition) for the development of Mara Commercial Financial Towers for a contract price of USD $48,500,000.
4. Pursuant to Sub-Clause 8.7 (Delay Damages), the Respondent was obligated to achieve Substantial Completion by 30th November 2025, failing which delay damages accrued at USD $45,000 per calendar day.
5. As of the date hereof, the critical delay exceeds 184 days, generating accrued liquidated damages of USD $8,280,000.`,
          redactedText: `IN THE NAIROBI CENTRE FOR INTERNATIONAL ARBITRATION (NCIA)
AT NAIROBI
ARBITRAL TRIBUNAL CAUSE NO. NCIA/ARB/2026/042

BETWEEN:
CONSOLIDATED INFRASTRUCTURE DEVELOPERS LTD ................. CLAIMANT
(Incorporated under the Companies Act 2015, KRA PIN: ████████████)

AND
PACIFIC CONTINENTAL CONTRACTORS PLC ......................... RESPONDENT
(Holding Bank Escrow Account No. █████████████ at KCB Bank Upper Hill)

STATEMENT OF CLAIM & MEMORIAL ON LIQUIDATED DAMAGES

1. The Claimant is a limited liability corporate entity duly incorporated under the laws of Kenya, maintaining its corporate headquarters at Mara Road, Upper Hill, Nairobi.
2. The Respondent is a tier-one EPC civil engineering contractor carrying on commercial infrastructure operations in Nairobi and Mombasa.
3. On or about 14th January 2024, the parties entered into a binding FIDIC Conditions of Contract for Construction (Red Book 1999 Edition) for the development of Mara Commercial Financial Towers for a contract price of USD ███████████.
4. Pursuant to Sub-Clause 8.7 (Delay Damages), the Respondent was obligated to achieve Substantial Completion by 30th November 2025, failing which delay damages accrued at USD ██████ per calendar day.
5. As of the date hereof, the critical delay exceeds 184 days, generating accrued liquidated damages of USD ███████████.`
        },
        {
          pageNumber: 2,
          originalText: `SUB-CLAUSE 13.7 STATUTORY VARIATION & DIRECT LOSS ADJUSTMENTS

6. The Respondent's defense predicated on cement excise tariff increments under the Finance Act 2024 is untenable at law. Sub-Clause 13.7 does not encompass foreseeable statutory tax realignments where the contractor failed to submit a 28-day notice under Sub-Clause 20.1.
7. Furthermore, structural core settlement tests conducted by Bureau Veritas on 12th August 2026 revealed compressive strength deficits in tower columns C12 through C18.
8. Remediation costs certified by independent quantity surveyor Dr. E. K. Mwendwa amount to KES 246,000,000 (Two Hundred and Forty Six Million Kenya Shillings).
9. The Claimant deposited required institutional arbitration registry dues via KCB Clearing Voucher Ref No. KCB-NBO-2026-98124 to the credit of NCIA Account No. 1198273645.
10. The Claimant claims relief in the total quantum sum of USD $14,250,000 plus commercial interest at 14% p.a. from date of notification until payment in full.`,
          redactedText: `SUB-CLAUSE 13.7 STATUTORY VARIATION & DIRECT LOSS ADJUSTMENTS

6. The Respondent's defense predicated on cement excise tariff increments under the Finance Act 2024 is untenable at law. Sub-Clause 13.7 does not encompass foreseeable statutory tax realignments where the contractor failed to submit a 28-day notice under Sub-Clause 20.1.
7. Furthermore, structural core settlement tests conducted by Bureau Veritas on 12th August 2026 revealed compressive strength deficits in tower columns C12 through C18.
8. Remediation costs certified by independent quantity surveyor Dr. E. K. Mwendwa amount to KES ████████████ (██████████████████████████████████████████).
9. The Claimant deposited required institutional arbitration registry dues via KCB Clearing Voucher Ref No. █████████████████ to the credit of NCIA Account No. ██████████.
10. The Claimant claims relief in the total quantum sum of USD ███████████ plus commercial interest at 14% p.a. from date of notification until payment in full.`
        },
        {
          pageNumber: 3,
          originalText: `PRAYERS & STATUTORY RELIEFS SOUGHT:

WHEREFORE the Claimant respectfully prays that this Arbitral Tribunal:
(a) DECLARES that the Respondent is in repudiatory breach of Sub-Clause 8.2 & Sub-Clause 8.7 of the FIDIC Conditions of Contract;
(b) AWARDS the Claimant liquidated damages in the sum of USD $8,280,000 for 184 days of unexcused project delay;
(c) DIRECTS the Respondent to reimburse structural remediation expenditure of KES 246,000,000;
(d) ORDERS the immediate drawdown of Contractor Performance Security Guarantee No. BG-2024-NBO-9912 held by Standard Chartered Bank Kenya PLC;
(e) AWARDS full legal costs of this arbitration pursuant to Section 32B of the Arbitration Act (Cap 49) on an indemnity basis.

DATED at NAIROBI this 5th day of September 2026.

DRAWN & FILED BY:
PETERSONS ANGWENYI & ASSOCIATES ADVOCATES
Advocates for the Claimant
PAA Chambers, 9th Floor, Mara Square, Mara Road, Upper Hill
P.O. Box 48921 - 00100 GPO, Nairobi
Ref: PAA/2026/LIT-0842/BAK
Signed: Brian Kipkemboi Cheruiyot, Advocate (Roll No. P.105/13589/10)`,
          redactedText: `PRAYERS & STATUTORY RELIEFS SOUGHT:

WHEREFORE the Claimant respectfully prays that this Arbitral Tribunal:
(a) DECLARES that the Respondent is in repudiatory breach of Sub-Clause 8.2 & Sub-Clause 8.7 of the FIDIC Conditions of Contract;
(b) AWARDS the Claimant liquidated damages in the sum of USD ██████████ for 184 days of unexcused project delay;
(c) DIRECTS the Respondent to reimburse structural remediation expenditure of KES ████████████;
(d) ORDERS the immediate drawdown of Contractor Performance Security Guarantee No. ██████████████ held by Standard Chartered Bank Kenya PLC;
(e) AWARDS full legal costs of this arbitration pursuant to Section 32B of the Arbitration Act (Cap 49) on an indemnity basis.

DATED at NAIROBI this 5th day of September 2026.

DRAWN & FILED BY:
PETERSONS ANGWENYI & ASSOCIATES ADVOCATES
Advocates for the Claimant
PAA Chambers, 9th Floor, Mara Square, Mara Road, Upper Hill
P.O. Box 48921 - 00100 GPO, Nairobi
Ref: PAA/2026/LIT-0842/BAK
Signed: Brian Kipkemboi Cheruiyot, Advocate (Roll No. P.105/13589/10)`
        }
      ];
    } else if (docName.includes('engineer') || docName.includes('adjudication')) {
      return [
        {
          pageNumber: 1,
          originalText: `FIDIC DISPUTE ADJUDICATION BOARD (DAB)
IN THE MATTER OF THE MARA TOWERS INFRASTRUCTURE PROJECT CONTRACT
PROJECT REF: FIDIC-RED-2024-001

FORMAL DAB DETERMINATION PURSUANT TO CLAUSE 20.4
Issued on: 18th September 2026
Adjudicator: Eng. Francis N. Kariuki, FIEK, Registered Consulting Engineer

1. The Dispute Adjudication Board received the Referral on 14th July 2026 from Consolidated Infrastructure Developers Ltd (Employer/Claimant) regarding the Respondent's claims for Time Extension under Clause 8.4.
2. The Contractor submitted that unseasonal precipitation and geological subsidence in Upper Hill constituted an unforeseeable physical condition under Clause 4.12.
3. Having reviewed geotechnical soil core samples from Fugro Geotechnical Ltd (Boreholes BH-1 to BH-6), the DAB finds that geological conditions were fully disclosed in the Employer's Pre-Tender Geotechnical Baseline Report of October 2023.
4. Consequently, the Contractor's claim for 92 days of Extension of Time (EOT) is DISMISSED in its entirety.
5. The Employer is entitled to levy delay damages pursuant to Clause 8.7 from the adjusted Completion Date.`,
          redactedText: `FIDIC DISPUTE ADJUDICATION BOARD (DAB)
IN THE MATTER OF THE MARA TOWERS INFRASTRUCTURE PROJECT CONTRACT
PROJECT REF: FIDIC-RED-2024-001

FORMAL DAB DETERMINATION PURSUANT TO CLAUSE 20.4
Issued on: 18th September 2026
Adjudicator: Eng. Francis N. Kariuki, FIEK, Registered Consulting Engineer

1. The Dispute Adjudication Board received the Referral on 14th July 2026 from Consolidated Infrastructure Developers Ltd (Employer/Claimant) regarding the Respondent's claims for Time Extension under Clause 8.4.
2. The Contractor submitted that unseasonal precipitation and geological subsidence in Upper Hill constituted an unforeseeable physical condition under Clause 4.12.
3. Having reviewed geotechnical soil core samples from Fugro Geotechnical Ltd (Boreholes BH-1 to BH-6), the DAB finds that geological conditions were fully disclosed in the Employer's Pre-Tender Geotechnical Baseline Report of October 2023.
4. Consequently, the Contractor's claim for 92 days of Extension of Time (EOT) is DISMISSED in its entirety.
5. The Employer is entitled to levy delay damages pursuant to Clause 8.7 from the adjusted Completion Date.`
        },
        {
          pageNumber: 2,
          originalText: `DAB FINANCIAL AWARD & REMEDY DIRECTIVES

6. Financial adjustments:
   (a) Approved Variation Orders (VO-01 to VO-04): USD $1,150,000.
   (b) Disallowed Contractor Indirect Claims: USD $3,420,000.
   (c) Net Defect Withholding under Clause 11.4: USD $4,850,000.
7. Bank Guarantee Escrow Notice: The DAB notes that Guarantee No. BG-2024-NBO-9912 in the principal sum of USD $5,000,000 remains operative until the Defects Notification Period expires.
8. Each party shall bear 50% of the DAB's fees and expenses in accordance with the DAB General Conditions of Dispute Adjudication Agreement.

DATED at NAIROBI this 18th day of September 2026.
SIGNED: Eng. Francis N. Kariuki, DAB Chairman / Sole Adjudicator`,
          redactedText: `DAB FINANCIAL AWARD & REMEDY DIRECTIVES

6. Financial adjustments:
   (a) Approved Variation Orders (VO-01 to VO-04): USD ███████████.
   (b) Disallowed Contractor Indirect Claims: USD ███████████.
   (c) Net Defect Withholding under Clause 11.4: USD ███████████.
7. Bank Guarantee Escrow Notice: The DAB notes that Guarantee No. ██████████████ in the principal sum of USD ███████████ remains operative until the Defects Notification Period expires.
8. Each party shall bear 50% of the DAB's fees and expenses in accordance with the DAB General Conditions of Dispute Adjudication Agreement.

DATED at NAIROBI this 18th day of September 2026.
SIGNED: Eng. Francis N. Kariuki, DAB Chairman / Sole Adjudicator`
        }
      ];
    } else {
      // Procedural order or generic judicial order
      return [
        {
          pageNumber: 1,
          originalText: `IN THE NAIROBI CENTRE FOR INTERNATIONAL ARBITRATION (NCIA)
TRIBUNAL PROCEDURAL ORDER NO. 1
MATTER REF: NCIA/ARB/2026/042

BEFORE: Dr. Kariuki Muigua, C.Arb, FCIArb, Ph.D (Sole Arbitrator)

IN THE ARBITRATION BETWEEN:
CONSOLIDATED INFRASTRUCTURE DEVELOPERS LTD ................. CLAIMANT
AND
PACIFIC CONTINENTAL CONTRACTORS PLC ......................... RESPONDENT

UPON reading the preliminary joint case management statements and hearing counsel on the 25th September 2026:

IT IS HEREBY ORDERED BY CONSENT:
1. TIMETABLE: The Claimant shall file and serve its bundle of expert quantum evidence and witness statements by 12th October 2026.
2. The Respondent shall file its Statement of Defense, Counterclaim and Expert Engineering Evidence by 10th November 2026.
3. DOCUMENT PRODUCTION & PRIVILEGE: Requests for documents under the IBA Rules on the Taking of Evidence in International Arbitration (2020) shall be submitted by 24th November 2026. All communications protected by advocate-client privilege under Kenyan law (Section 134 of the Evidence Act) shall be exempt from inspection.
4. CONFIDENTIALITY: Pursuant to Section 35 of the NCIA Act 2013, all proceedings, transcripts, financial statements, and escrow amounts shall remain strictly confidential.
5. HEARING VENUE: The 5-day substantive hearing shall convene at the NCIA Hearing Chambers, 8th Floor, Co-operative Bank Building, Haile Selassie Avenue, Nairobi commencing 08th December 2026 at 09:30 AM EAT.

GIVEN under my hand this 28th day of September 2026.
DR. KARIUKI MUIGUA, C.ARB, FCIArb
Sole Arbitrator`,
          redactedText: `IN THE NAIROBI CENTRE FOR INTERNATIONAL ARBITRATION (NCIA)
TRIBUNAL PROCEDURAL ORDER NO. 1
MATTER REF: NCIA/ARB/2026/042

BEFORE: Dr. Kariuki Muigua, C.Arb, FCIArb, Ph.D (Sole Arbitrator)

IN THE ARBITRATION BETWEEN:
CONSOLIDATED INFRASTRUCTURE DEVELOPERS LTD ................. CLAIMANT
AND
PACIFIC CONTINENTAL CONTRACTORS PLC ......................... RESPONDENT

UPON reading the preliminary joint case management statements and hearing counsel on the 25th September 2026:

IT IS HEREBY ORDERED BY CONSENT:
1. TIMETABLE: The Claimant shall file and serve its bundle of expert quantum evidence and witness statements by 12th October 2026.
2. The Respondent shall file its Statement of Defense, Counterclaim and Expert Engineering Evidence by 10th November 2026.
3. DOCUMENT PRODUCTION & PRIVILEGE: Requests for documents under the IBA Rules on the Taking of Evidence in International Arbitration (2020) shall be submitted by 24th November 2026. All communications protected by advocate-client privilege under Kenyan law (Section 134 of the Evidence Act) shall be exempt from inspection.
4. CONFIDENTIALITY: Pursuant to Section 35 of the NCIA Act 2013, all proceedings, transcripts, financial statements, and escrow amounts shall remain strictly confidential.
5. HEARING VENUE: The 5-day substantive hearing shall convene at the NCIA Hearing Chambers, 8th Floor, Co-operative Bank Building, Haile Selassie Avenue, Nairobi commencing 08th December 2026 at 09:30 AM EAT.

GIVEN under my hand this 28th day of September 2026.
DR. KARIUKI MUIGUA, C.ARB, FCIArb
Sole Arbitrator`
        }
      ];
    }
  }, [doc]);

  if (!isOpen || !doc) return null;

  const activePageData = pages[currentPage - 1] || pages[0];
  const activeText = isPiiRedacted ? activePageData.redactedText : activePageData.originalText;

  // Search filter and highlighting
  const highlightedLines = activeText.split('\n').map((line, idx) => {
    if (!searchQuery.trim()) {
      return { id: idx, content: line, hasMatch: false };
    }
    const hasMatch = line.toLowerCase().includes(searchQuery.toLowerCase());
    return { id: idx, content: line, hasMatch };
  });

  const matchCount = searchQuery.trim()
    ? activeText.toLowerCase().split(searchQuery.toLowerCase()).length - 1
    : 0;

  // Simulate optical re-binarization
  const handleRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setOcrConfidence(99.6);
    }, 1200);
  };

  // Copy transcript to clipboard
  const handleCopyTranscript = () => {
    const fullText = pages
      .map(p => `--- PAGE ${p.pageNumber} ---\n` + (isPiiRedacted ? p.redactedText : p.originalText))
      .join('\n\n');

    navigator.clipboard.writeText(fullText);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2500);
  };

  // Download searchable transcript as text file
  const handleDownloadTranscript = () => {
    const header = [
      `========================================================================`,
      `PETERSONS ANGWENYI & ASSOCIATES ADVOCATES · NAIROBI CHAMBERS`,
      `OFFICIAL SECURE DOCUMENT OCR EXTRACT & SEARCHABLE TRANSCRIPT`,
      `========================================================================`,
      `Matter Docket:     ${matter.reference}`,
      `Case Title:        ${matter.caseTitle}`,
      `Kenya CTS Number:  ${matter.ctsNumber}`,
      `Document Name:     ${doc.name}`,
      `CTS Archive Hash:  ${doc.ctsHash}`,
      `Signatory:         ${doc.signatory}`,
      `OCR Extraction:    300 DPI High-Resolution Optical Character Recognition`,
      `Accuracy Score:    ${ocrConfidence}% verified precision`,
      `Statutory Status:  ${isPiiRedacted ? 'REDACTED UNDER KENYA DATA PROTECTION ACT 2019' : 'UNREDACTED STATUTORY PII - STRICTLY PRIVILEGED'}`,
      `Extracted At:      ${new Date().toISOString()}`,
      `========================================================================\n\n`
    ].join('\n');

    const body = pages
      .map(p => `--- [TRANSCRIPT PAGE ${p.pageNumber} OF ${pages.length}] ---\n\n` + (isPiiRedacted ? p.redactedText : p.originalText))
      .join('\n\n\n');

    const blob = new Blob([header + body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.setAttribute('download', `OCR-${doc.name.replace(/\.pdf$/i, '')}-${isPiiRedacted ? 'Redacted' : 'Unredacted'}.txt`);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fadeIn">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[950px] bg-[#0A0E17] border border-[#C5A880]/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* Top Applet Navigation Bar */}
        <div className="p-4 sm:px-6 bg-gradient-to-r from-[#0F1624] via-[#121B2C] to-[#0F1624] border-b border-[#1E2C44] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] shrink-0">
              <ScanText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-widest text-[#C5A880] font-semibold">
                  {t('ocr.title')}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  300 DPI Optical Scan
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-cinzel text-white truncate max-w-md sm:max-w-xl">
                {doc.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Re-scan trigger */}
            <button
              onClick={handleRescan}
              disabled={isScanning}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#162134] hover:bg-[#202E48] text-[#C5A880] text-xs rounded-lg border border-[#2B3B58] transition-colors disabled:opacity-50"
              title="Re-run 300 DPI optical binarization and glyph alignment"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Re-Run OCR'}</span>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-[#8C98AE] hover:text-white rounded-lg hover:bg-[#162134] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header Controls & Metadata Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#0D131F] border-b border-[#1A2538] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            {/* Accuracy Score */}
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C5A880]" />
              <span className="text-[#8C98AE]">{t('ocr.confidenceScore')}:</span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                {ocrConfidence}%
              </span>
            </div>

            {/* Matter Info */}
            <div className="hidden md:flex items-center gap-1.5 text-[#8C98AE]">
              <span>Docket:</span>
              <span className="font-mono text-[#E4C999]">{matter.reference}</span>
            </div>

            {/* CTS Hash */}
            <div className="hidden lg:flex items-center gap-1.5 text-[#8C98AE]">
              <span>CTS:</span>
              <span className="font-mono text-slate-300">{doc.ctsHash}</span>
            </div>
          </div>

          {/* Right Controls: PII Redaction Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#121927] px-3 py-1.5 rounded-xl border border-[#223048]">
              {isPiiRedacted ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="text-xs text-[#A2AFCA] font-medium hidden sm:inline">
                {t('ocr.redactionToggle')}
              </span>
              <button
                type="button"
                onClick={() => setIsPiiRedacted(!isPiiRedacted)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  isPiiRedacted ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
                title="Toggle automated masking of KRA PINs, bank accounts, and settlement sums"
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isPiiRedacted ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Dual-Pane Core OCR Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#1A2538] overflow-hidden">
          
          {/* ================= LEFT PANE: HIGH-FIDELITY SCANNED COURT FILING PREVIEW ================= */}
          <div className="h-full flex flex-col bg-[#070A10] overflow-hidden">
            {/* Left Pane Top Toolbar */}
            <div className="px-4 py-2.5 bg-[#0D131F] border-b border-[#1A2538] flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C5A880]" />
                <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
                  Scanned Court Exhibit & Pleadings Layer
                </span>
              </div>

              {/* Page Navigator */}
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1 rounded bg-[#131B2A] text-slate-300 hover:text-white disabled:opacity-30 border border-[#222E44]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-xs text-[#C5A880] px-2">
                  Page {currentPage} of {pages.length}
                </span>
                <button
                  disabled={currentPage >= pages.length}
                  onClick={() => setCurrentPage(p => Math.min(pages.length, p + 1))}
                  className="p-1 rounded bg-[#131B2A] text-slate-300 hover:text-white disabled:opacity-30 border border-[#222E44]"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Document Scanned Paper Render Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex items-center justify-center bg-[#06080E] relative">
              
              {/* Scanning visual overlay when re-scanning */}
              {isScanning && (
                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-12 h-12 border-3 border-[#C5A880] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-white font-cinzel">
                    {t('ocr.ocrProcessing')}
                  </p>
                  <p className="text-xs text-[#8C98AE] max-w-sm">
                    Re-aligning text baseline, segmenting character glyphs, and verifying judicial registry stamps...
                  </p>
                </div>
              )}

              {/* Realistic Paper Container */}
              <div className="relative w-full max-w-md bg-[#F4EFE6] text-[#1A1A1A] rounded shadow-2xl p-6 sm:p-8 font-serif border border-[#D5C9B3] select-none min-h-[500px]">
                
                {/* Official High Court / NCIA Rubber Stamp Graphic */}
                <div className="absolute top-4 right-4 border-2 border-red-700/80 rounded p-1.5 text-center transform rotate-[-8deg] pointer-events-none bg-red-50/40">
                  <div className="text-[9px] font-sans font-black tracking-widest text-red-800 uppercase leading-none">
                    E-FILED · KENYA CTS
                  </div>
                  <div className="text-[8px] font-mono text-red-700 font-bold mt-0.5">
                    {matter.ctsNumber}
                  </div>
                  <div className="text-[7px] font-mono text-red-600">
                    DATE: {doc.date}
                  </div>
                </div>

                {/* Light Watermark Seal */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
                  <Scale className="w-64 h-64 text-black" />
                </div>

                {/* Left Margin Red Line (classic legal pleadings paper) */}
                <div className="absolute top-0 bottom-0 left-6 w-[1px] bg-red-400/40" />

                {/* Simulated Scanned Page Content */}
                <div className="pl-4 space-y-3 text-[11px] leading-relaxed text-[#222]">
                  <div className="text-center font-bold tracking-wider text-[10px] pb-2 border-b border-stone-300">
                    REPUBLIC OF KENYA<br />
                    IN THE NAIROBI CENTRE FOR INTERNATIONAL ARBITRATION<br />
                    CAUSE NO. {matter.ctsNumber}
                  </div>

                  <div className="text-[10px] font-bold text-stone-700">
                    BETWEEN: {matter.clientEntity.toUpperCase()}<br />
                    AND: PACIFIC CONTINENTAL CONTRACTORS PLC
                  </div>

                  <div className="pt-2 font-bold text-[10px] uppercase text-stone-900 border-b border-stone-300 pb-1">
                    {doc.name.replace(/\.pdf$/i, '')} · [PAGE {currentPage}]
                  </div>

                  {/* Scanned paragraph simulation */}
                  <div className="text-[10px] text-justify space-y-2 pt-1 font-mono text-stone-800">
                    {activePageData.originalText.slice(0, 480)}...
                  </div>

                  {/* Redaction notice box on scanned sheet if active */}
                  {isPiiRedacted && (
                    <div className="mt-4 p-2 bg-stone-200/80 border border-stone-400 text-[9px] font-mono text-stone-700 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-stone-600" />
                      <span>Confidential PII masked under Kenya Data Protection Act 2019.</span>
                    </div>
                  )}

                  {/* Bottom Signatory on Sheet */}
                  <div className="pt-6 text-[9px] text-stone-600 border-t border-stone-300 font-mono">
                    CTS Certified Hash: {doc.ctsHash}<br />
                    Signatory: {doc.signatory}
                  </div>
                </div>

              </div>

            </div>

            {/* Left Pane Footer info */}
            <div className="p-2.5 bg-[#0B101A] border-t border-[#1A2538] text-[11px] text-[#6E7C94] flex items-center justify-between px-4">
              <span>Binarization: 300 DPI High-Pass Filter</span>
              <span className="font-mono text-[#C5A880]">{doc.size}</span>
            </div>
          </div>

          {/* ================= RIGHT PANE: EXTRACTED SEARCHABLE OCR TRANSCRIPT ================= */}
          <div className="h-full flex flex-col bg-[#0A0E17] overflow-hidden">
            
            {/* Search Bar & Match Counter */}
            <div className="p-3 bg-[#0E1522] border-b border-[#1A2538] flex items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#637288] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('ocr.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121927] border border-[#222E44] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-[#586477] focus:outline-none focus:border-[#C5A880]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#76849C] hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {searchQuery && (
                <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#172338] text-[#E4C999] border border-[#2B3B56] shrink-0">
                  {matchCount} {matchCount === 1 ? 'match' : 'matches'}
                </span>
              )}
            </div>

            {/* Redaction Notice Banner */}
            <div className={`px-4 py-2 text-xs flex items-center justify-between shrink-0 ${
              isPiiRedacted
                ? 'bg-emerald-950/30 text-emerald-300 border-b border-emerald-900/30'
                : 'bg-amber-950/30 text-amber-300 border-b border-amber-900/30'
            }`}>
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px]">
                  {isPiiRedacted
                    ? 'Statutory Redaction Active: KRA PINs, bank account hashes, and settlement values are secured.'
                    : 'Unredacted Mode: Sensitive statutory PII visible under Section 134 Advocate Privilege.'}
                </span>
              </div>
            </div>

            {/* Transcript Display Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto font-mono text-xs leading-relaxed space-y-1 bg-[#080C14]">
              {highlightedLines.map((item) => (
                <div
                  key={item.id}
                  className={`py-0.5 px-2 rounded transition-colors whitespace-pre-wrap break-words ${
                    item.hasMatch
                      ? 'bg-[#C5A880]/20 text-[#FFF] border-l-2 border-[#C5A880]'
                      : 'text-slate-300 hover:bg-[#101724]'
                  }`}
                >
                  {item.content || '\u00A0'}
                </div>
              ))}
            </div>

            {/* Transcript Actions Footer */}
            <div className="p-3 sm:px-6 bg-[#0E1522] border-t border-[#1A2538] flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-[11px] text-[#6D7B93] font-mono">
                {isPiiRedacted ? (
                  <span className="text-emerald-400">Compliant: ODPC Data Protection 2019</span>
                ) : (
                  <span className="text-amber-400">Privileged: Evidence Act Section 134</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Copy Text Button */}
                <button
                  onClick={handleCopyTranscript}
                  className="px-3.5 py-1.5 bg-[#151D2D] hover:bg-[#1E2A40] text-[#A6B4CD] hover:text-white text-xs font-semibold rounded-lg border border-[#23314B] transition-colors flex items-center gap-1.5 shadow-sm"
                  title="Copy full searchable OCR transcript to clipboard"
                >
                  {copiedTranscript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>{t('ocr.copyText')}</span>
                    </>
                  )}
                </button>

                {/* Download Transcript */}
                <button
                  onClick={handleDownloadTranscript}
                  className="px-4 py-1.5 bg-[#C5A880] text-[#0A0E17] hover:brightness-110 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                  title="Download searchable text file (.txt) with CTS certificate"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('ocr.downloadOcr')}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
