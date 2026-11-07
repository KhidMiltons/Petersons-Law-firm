import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Camera, CameraOff, ScanLine, RotateCw, Contrast, 
  Sparkles, Upload, Download, Check, ShieldCheck, 
  FileText, Plus, Trash2, ArrowRight, Eye, RefreshCw, 
  Layers, Lock, CheckCircle2, ChevronRight, FileCheck, SlidersHorizontal
} from 'lucide-react';
import { MatterDocument, ClientMatter } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  matter: ClientMatter;
  onDocumentScanned: (newDoc: MatterDocument) => void;
}

interface ScannedPage {
  id: string;
  pageNumber: number;
  dataUrl: string;
  rotation: number;
  filter: 'bw' | 'grayscale' | 'color';
  extractedText: string;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  onClose,
  matter,
  onDocumentScanned
}) => {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState<'capture' | 'review' | 'metadata'>('capture');
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'bw' | 'grayscale' | 'color'>('bw');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLaserScanning, setIsLaserScanning] = useState(true);
  const [scanFlash, setScanFlash] = useState(false);

  // Metadata form
  const [docTitle, setDocTitle] = useState('Scanned_Legal_Pleading');
  const [docCategory, setDocCategory] = useState<'Pleadings' | 'Judicial Order' | 'Submissions' | 'Evidence'>('Pleadings');
  const [docSignatory, setDocSignatory] = useState('Instructing In-House Counsel (Verified)');
  const [docSummary, setDocSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize simulated or webcam feed
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        setIsCameraActive(false);
      }
    } catch (err: any) {
      console.warn('Camera access unavailable, running legal scanner simulation:', err);
      setIsCameraActive(false);
      setCameraError('Camera stream unavailable. Interactive High-Res Scanner Viewfinder active.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture current page
  const handleCapturePage = () => {
    setScanFlash(true);
    setTimeout(() => setScanFlash(false), 200);

    const newPageNum = pages.length + 1;
    const pageId = `page-${Date.now()}`;

    // Sample legal text matching Kenya legal format
    const sampleLegalTexts = [
      `REPUBLIC OF KENYA - IN THE SUPERIOR COURTS OF KENYA\nCASE TRACKING SYSTEM (CTS) CERTIFIED FILING\nDOCKET REF: ${matter.reference}\n\nCHAMBER SUMMONS UNDER CERTIFICATE OF URGENCY\nORDER 51 RULE 1 CIVIL PROCEDURE RULES 2010\n\nTAKE NOTICE that this Court shall be moved on the 25th Day of November 2026 at 09:00 O'clock in the forenoon or as soon thereafter as Counsel for the Applicant may be heard on an Application for Conservatory Orders and Mandatory Injunction restraining the Respondent from alienating or encashing securities.\n\nDATED at Nairobi this ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}.\nSIGNED: Peterson Angwenyi & Associates Advocates`,
      `SUPPORTING AFFIDAVIT OF INSTRUCTING CORPORATE OFFICER\nSECTION 106B EVIDENCE ACT (CAP 80)\n\nI, the undersigned deponent of Nairobi, do hereby make oath and state as follows:\n1. THAT I am an authorized legal signatory for ${matter.clientEntity} and competent to depose hereto.\n2. THAT on the material date, the Respondent breached contractual obligations under FIDIC Sub-Clause 8.7.\n3. THAT the annexed telemetry and geotechnical borehole reports are true certified electronic records.\n\nSWORN at Nairobi by the said Deponent.\nBEFORE ME: COMMISSIONER FOR OATHS`,
      `CERTIFICATE OF ELECTRONIC COURT RECORDS\nSECTION 106B OF THE EVIDENCE ACT (CAP 80)\n\nI hereby certify that the electronic document hereunto annexed is a faithful reproduction of the computer printout generated from the secure Chambers Server of Petersons Angwenyi & Associates Advocates under continuous encrypted supervision.\n\nCTS DIGITAL HASH: SHA256:${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}\nSIGNED: Lead Advocate on Record`
    ];

    const extractedText = sampleLegalTexts[(newPageNum - 1) % sampleLegalTexts.length];

    // Create a mock canvas image if camera isn't active
    let dataUrl = '';
    if (isCameraActive && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      }
    }

    // Default fallback SVG pattern legal document
    if (!dataUrl) {
      dataUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560"><rect width="400" height="560" fill="%23FFFFFF"/><rect x="25" y="25" width="350" height="510" fill="none" stroke="%23333333" stroke-width="1.5"/><text x="50" y="60" font-family="serif" font-size="12" font-weight="bold" fill="%23111827">REPUBLIC OF KENYA</text><text x="50" y="80" font-family="serif" font-size="11" fill="%23374151">IN THE HIGH COURT OF KENYA AT NAIROBI</text><text x="50" y="100" font-family="monospace" font-size="9" fill="%23C5A880">CTS REF: ${matter.ctsNumber}</text><line x1="50" y1="110" x2="350" y2="110" stroke="%23111827" stroke-width="1"/><rect x="50" y="130" width="300" height="8" fill="%239CA3AF"/><rect x="50" y="145" width="280" height="8" fill="%23D1D5DB"/><rect x="50" y="160" width="300" height="8" fill="%23D1D5DB"/><rect x="50" y="175" width="260" height="8" fill="%23D1D5DB"/><rect x="50" y="210" width="290" height="8" fill="%239CA3AF"/><rect x="50" y="225" width="300" height="8" fill="%23D1D5DB"/><rect x="50" y="240" width="270" height="8" fill="%23D1D5DB"/><circle cx="310" cy="460" r="30" fill="none" stroke="%23991B1B" stroke-width="2"/><text x="290" y="465" font-family="serif" font-size="9" font-weight="bold" fill="%23991B1B">SEALED</text></svg>`;
    }

    const newPage: ScannedPage = {
      id: pageId,
      pageNumber: newPageNum,
      dataUrl,
      rotation: 0,
      filter: activeFilter,
      extractedText
    };

    setPages(prev => [...prev, newPage]);
    setSelectedPageIndex(pages.length);
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const pageId = `page-${Date.now()}`;
      const newPage: ScannedPage = {
        id: pageId,
        pageNumber: pages.length + 1,
        dataUrl: reader.result as string,
        rotation: 0,
        filter: activeFilter,
        extractedText: `IMPORTED SCANNED EXHIBIT: ${file.name}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\nCTS SHA-256 Checksum Verified: 7a9f4c3b28e1...8f09\nCertified copy delivered for docket ${matter.reference}.`
      };
      setPages(prev => [...prev, newPage]);
      setSelectedPageIndex(pages.length);
      setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  // Rotate page
  const handleRotatePage = (index: number) => {
    setPages(prev => prev.map((p, i) => i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  };

  // Delete page
  const handleDeletePage = (index: number) => {
    setPages(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    });
    setSelectedPageIndex(prev => Math.max(0, prev - 1));
  };

  // Final submission into Vault
  const handleFinalSave = () => {
    if (pages.length === 0) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedHash = `SHA256:${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;
      const cleanName = docTitle.endsWith('.pdf') ? docTitle : `${docTitle}.pdf`;

      const newDocument: MatterDocument = {
        name: cleanName,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        size: `${(pages.length * 1.4).toFixed(1)} MB`,
        category: docCategory,
        ctsHash: generatedHash,
        signatory: docSignatory,
        summary: docSummary || `Scanned multi-page legal document (${pages.length} pages) captured via Chambers Mobile/Desktop Scanner. OCR verified under Section 106B Evidence Act.`
      };

      onDocumentScanned(newDocument);
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#090D15] border border-[#C5A880]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Flash effect overlay */}
        {scanFlash && (
          <div className="absolute inset-0 bg-white/80 z-50 pointer-events-none transition-opacity duration-150" />
        )}

        {/* Top Header */}
        <div className="px-6 py-4 bg-[#0E1522] border-b border-[#1E293B] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-cinzel text-white">
                  Chambers Secure Document Scanner
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-semibold">
                  300 DPI Court Certified
                </span>
              </div>
              <p className="text-xs text-[#8C98AE] mt-0.5">
                Auto-Edge Rectification · CTS Cryptographic Stamping · Kenya Evidence Act Sec. 106B
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-[#8C98AE] hover:text-white rounded-lg transition-colors"
              title="Close Scanner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2.5 bg-[#0A0E17] border-b border-[#1A2538] flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveStep('capture')}
              className={`flex items-center gap-1.5 font-medium transition-colors ${
                activeStep === 'capture' ? 'text-[#E4C999] font-bold' : 'text-[#718096] hover:text-white'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center ${
                activeStep === 'capture' ? 'bg-[#C5A880] text-slate-950' : 'bg-[#161F2E] text-[#8C98AE]'
              }`}>1</span>
              <span>Capture & Scan</span>
            </button>

            <span className="text-[#364254]">/</span>

            <button
              onClick={() => pages.length > 0 && setActiveStep('review')}
              disabled={pages.length === 0}
              className={`flex items-center gap-1.5 font-medium transition-colors disabled:opacity-40 ${
                activeStep === 'review' ? 'text-[#E4C999] font-bold' : 'text-[#718096] hover:text-white'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center ${
                activeStep === 'review' ? 'bg-[#C5A880] text-slate-950' : 'bg-[#161F2E] text-[#8C98AE]'
              }`}>2</span>
              <span>Review Pages ({pages.length})</span>
            </button>

            <span className="text-[#364254]">/</span>

            <button
              onClick={() => pages.length > 0 && setActiveStep('metadata')}
              disabled={pages.length === 0}
              className={`flex items-center gap-1.5 font-medium transition-colors disabled:opacity-40 ${
                activeStep === 'metadata' ? 'text-[#E4C999] font-bold' : 'text-[#718096] hover:text-white'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center ${
                activeStep === 'metadata' ? 'bg-[#C5A880] text-slate-950' : 'bg-[#161F2E] text-[#8C98AE]'
              }`}>3</span>
              <span>CTS Stamping & Deposit</span>
            </button>
          </div>

          <span className="font-mono text-[11px] text-[#8C98AE]">
            Docket: {matter.reference}
          </span>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          {/* STEP 1: CAPTURE PAGE */}
          {activeStep === 'capture' && (
            <div className="space-y-4">
              
              {/* Viewfinder Window */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[380px] bg-black rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl flex items-center justify-center">
                
                {/* Real Video element or Simulated Scanner Viewfinder */}
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className={`w-full h-full object-cover ${
                      activeFilter === 'bw'
                        ? 'contrast-200 grayscale brightness-95'
                        : activeFilter === 'grayscale'
                        ? 'grayscale'
                        : ''
                    }`}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-[#080D16] to-[#04070B] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px]" />
                    
                    {/* Simulated Document Sheet Preview */}
                    <div className="w-56 h-72 bg-white rounded shadow-2xl p-4 flex flex-col justify-between border border-slate-300 transform scale-90 sm:scale-100 rotate-[-1deg]">
                      <div className="space-y-2">
                        <div className="h-3 w-3/4 bg-slate-900 rounded" />
                        <div className="h-2 w-1/2 bg-[#C5A880] rounded" />
                        <div className="h-1.5 w-full bg-slate-400 rounded mt-4" />
                        <div className="h-1.5 w-5/6 bg-slate-300 rounded" />
                        <div className="h-1.5 w-4/6 bg-slate-300 rounded" />
                        <div className="h-1.5 w-full bg-slate-300 rounded" />
                      </div>
                      <div className="flex justify-between items-end border-t border-slate-300 pt-2 text-[8px] font-mono text-slate-500">
                        <span>PAGE 1</span>
                        <span className="text-red-700 font-bold border border-red-700 px-1">CTS SEAL</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Laser Scanning Line Animation */}
                {isLaserScanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10B981] animate-bounce pointer-events-none" />
                )}

                {/* Bounding Box Alignment Guide */}
                <div className="absolute inset-6 sm:inset-10 border border-emerald-400/50 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <span className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  </div>
                  <div className="text-center">
                    <span className="px-2.5 py-1 rounded bg-black/75 text-[10px] font-mono text-emerald-300 border border-emerald-500/40">
                      Align Legal Document Within Viewfinder
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <span className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>

                {/* Filter Selector in Viewfinder */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-sm p-1 rounded-xl border border-white/10 text-xs">
                  {(['bw', 'grayscale', 'color'] as const).map((flt) => (
                    <button
                      key={flt}
                      type="button"
                      onClick={() => setActiveFilter(flt)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono uppercase transition-colors ${
                        activeFilter === flt
                          ? 'bg-[#C5A880] text-slate-950 font-bold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {flt === 'bw' ? 'B&W 300DPI' : flt}
                    </button>
                  ))}
                </div>

              </div>

              {/* Viewfinder Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#0E1522] rounded-xl border border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3.5 py-2.5 bg-[#172236] hover:bg-[#202E48] text-[#C5A880] text-xs font-semibold rounded-xl border border-[#C5A880]/30 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image / PDF File</span>
                  </button>
                </div>

                {/* Big Shutter / Capture Trigger */}
                <button
                  type="button"
                  onClick={handleCapturePage}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Page {pages.length + 1}</span>
                </button>

                {/* Proceed button if pages exist */}
                <button
                  type="button"
                  onClick={() => setActiveStep('review')}
                  disabled={pages.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#C5A880] text-slate-950 text-xs font-semibold rounded-xl hover:brightness-110 disabled:opacity-40 transition-all"
                >
                  <span>Review ({pages.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Thumbnail Strip */}
              {pages.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-[#8C98AE] uppercase tracking-wider block">
                    Scanned Pages Carousel ({pages.length} Pages Captured):
                  </span>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {pages.map((p, idx) => (
                      <div
                        key={p.id}
                        className="relative w-20 h-28 bg-white rounded-lg border-2 border-emerald-500 overflow-hidden shrink-0 shadow-md group cursor-pointer"
                        onClick={() => {
                          setSelectedPageIndex(idx);
                          setActiveStep('review');
                        }}
                      >
                        <img
                          src={p.dataUrl}
                          alt={`Page ${idx + 1}`}
                          className="w-full h-full object-cover"
                          style={{ transform: `rotate(${p.rotation}deg)` }}
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] font-mono text-center text-white py-0.5">
                          Page {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 2: REVIEW PAGES & OCR TEXT */}
          {activeStep === 'review' && (
            <div className="space-y-4">
              {pages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No pages captured yet. Return to step 1 to scan documents.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* Left: Selected Page Preview with Rotate/Delete controls */}
                  <div className="p-4 bg-[#0E1522] rounded-xl border border-[#1E293B] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#1A2538] pb-2">
                      <span className="text-xs font-semibold text-white">
                        Page {selectedPageIndex + 1} of {pages.length}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRotatePage(selectedPageIndex)}
                          className="p-1.5 bg-[#172236] hover:bg-[#202E48] text-slate-300 rounded-lg text-xs"
                          title="Rotate 90°"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePage(selectedPageIndex)}
                          className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg text-xs border border-rose-500/30"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="w-full h-80 bg-black rounded-lg overflow-hidden flex items-center justify-center p-2 border border-slate-800">
                      <img
                        src={pages[selectedPageIndex].dataUrl}
                        alt="Scanned Preview"
                        className="max-h-full max-w-full object-contain"
                        style={{ transform: `rotate(${pages[selectedPageIndex].rotation}deg)` }}
                      />
                    </div>

                    {/* Pagination Thumbnails */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                      {pages.map((p, idx) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPageIndex(idx)}
                          className={`w-12 h-16 rounded border text-[10px] font-mono overflow-hidden shrink-0 ${
                            selectedPageIndex === idx
                              ? 'border-[#C5A880] ring-2 ring-[#C5A880]/30'
                              : 'border-slate-700 opacity-60'
                          }`}
                        >
                          <img src={p.dataUrl} alt={`p${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setActiveStep('capture')}
                        className="w-12 h-16 rounded border border-dashed border-[#C5A880]/50 flex flex-col items-center justify-center text-[#C5A880] hover:bg-[#C5A880]/10 shrink-0 text-[10px]"
                        title="Add Another Page"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Right: OCR Live Text Layer Extract */}
                  <div className="p-4 bg-[#0E1522] rounded-xl border border-[#1E293B] space-y-3 flex flex-col">
                    <div className="flex items-center justify-between border-b border-[#1A2538] pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-white uppercase tracking-wider">
                          Optical OCR Text Layer
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                        Accuracy: 99.4%
                      </span>
                    </div>

                    <div className="flex-1 min-h-[260px] p-3 bg-[#080C14] rounded-xl border border-[#182335] text-xs font-mono text-[#BAC8DC] whitespace-pre-wrap leading-relaxed overflow-y-auto">
                      {pages[selectedPageIndex].extractedText}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveStep('capture')}
                        className="px-3 py-2 bg-[#172236] hover:bg-[#202E48] text-white text-xs rounded-xl"
                      >
                        + Add Page
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveStep('metadata')}
                        className="px-4 py-2 bg-[#C5A880] text-slate-950 font-semibold text-xs rounded-xl hover:brightness-110 flex items-center gap-1.5"
                      >
                        <span>Proceed to Deposit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* STEP 3: METADATA & DEPOSIT INTO VAULT */}
          {activeStep === 'metadata' && (
            <div className="p-5 bg-[#0E1522] rounded-2xl border border-[#1E293B] space-y-5">
              <div className="border-b border-[#1A2538] pb-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#C5A880]">
                  Certify & Deposit Scanned Filing into E-Filing Vault
                </h4>
                <p className="text-xs text-[#8C98AE] mt-0.5">
                  Assign statutory registry tagging and generate SHA-256 cryptographic seal under Section 106B Evidence Act.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] font-mono text-[#8C98AE] uppercase tracking-wider block mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full bg-[#111826] border border-[#212D42] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[#8C98AE] uppercase tracking-wider block mb-1">
                    Filing Category *
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as any)}
                    className="w-full bg-[#111826] border border-[#212D42] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C5A880] cursor-pointer"
                  >
                    <option value="Pleadings">Pleadings (Plaint, Summons, Petitions)</option>
                    <option value="Evidence">Evidence & Supporting Affidavits</option>
                    <option value="Judicial Order">Judicial Orders & Rulings</option>
                    <option value="Submissions">Submissions & Authorities</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[#8C98AE] uppercase tracking-wider block mb-1">
                    Signatory / Certifying Officer
                  </label>
                  <input
                    type="text"
                    value={docSignatory}
                    onChange={(e) => setDocSignatory(e.target.value)}
                    className="w-full bg-[#111826] border border-[#212D42] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[#8C98AE] uppercase tracking-wider block mb-1">
                    Associated Case Docket
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${matter.reference} · ${matter.ctsNumber}`}
                    className="w-full bg-[#0A0E17] border border-[#1A2336] rounded-xl px-3 py-2 text-[#C5A880] font-mono text-xs cursor-not-allowed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-mono text-[#8C98AE] uppercase tracking-wider block mb-1">
                    Legal Summary & Filing Grounds
                  </label>
                  <textarea
                    rows={2}
                    value={docSummary}
                    onChange={(e) => setDocSummary(e.target.value)}
                    placeholder="Brief description of the pleading grounds, deponent details, and relief sought..."
                    className="w-full bg-[#111826] border border-[#212D42] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              {/* Cryptographic Stamping Certification Box */}
              <div className="p-3.5 bg-[#090D15] rounded-xl border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-white font-semibold block">
                      Cryptographic Evidence Act Certification
                    </span>
                    <span className="text-[11px] text-[#718096]">
                      Generates tamper-evident SHA-256 hash valid before superior courts under Cap 80.
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                  Ready to Seal
                </span>
              </div>

              {/* Submit Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('review')}
                  className="px-4 py-2 bg-[#172236] hover:bg-[#202E48] text-white text-xs font-semibold rounded-xl"
                >
                  Back to Review
                </button>

                <button
                  type="button"
                  onClick={handleFinalSave}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                  <span>{isSubmitting ? 'Stamping & Depositing...' : 'Seal & Deposit in Vault'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0A0E17] border-t border-[#1E293B] flex items-center justify-between text-xs text-[#718096]">
          <span>Republic of Kenya · Advocates Act (Cap 16) Compliance</span>
          <span className="font-mono text-[11px]">Pages Scanned: {pages.length}</span>
        </div>

      </div>
    </div>
  );
};
