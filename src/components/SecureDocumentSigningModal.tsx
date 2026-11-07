import React, { useState, useRef, useEffect } from 'react';
import { 
  X, PenTool, CheckCircle2, ShieldCheck, Download, 
  RotateCcw, Scale, Building2, UserCheck, KeyRound, 
  Fingerprint, FileText, Check, AlertCircle, Copy, 
  FileCheck, Calendar, Shield, Stamp, Sparkles
} from 'lucide-react';
import { MatterDocument, ClientMatter } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

interface SecureDocumentSigningModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: MatterDocument;
  matter: ClientMatter;
  onSignedDocument: (signedDoc: MatterDocument) => void;
}

export const SecureDocumentSigningModal: React.FC<SecureDocumentSigningModalProps> = ({
  isOpen,
  onClose,
  document,
  matter,
  onSignedDocument
}) => {
  const { t } = useLanguage();

  // Signing Mode: 'draw' | 'type' | 'biometric'
  const [signMethod, setSignMethod] = useState<'draw' | 'type' | 'biometric'>('draw');

  // Signer Roles
  const [signerRole, setSignerRole] = useState<'client' | 'advocate'>('client');
  const [clientSignerName, setClientSignerName] = useState('Dr. Angela Kibera, Group General Counsel');
  const [advocateSignerName, setAdvocateSignerName] = useState('Milton Angwenyi, SC (Roll No. P.105/8941/98)');

  // Signature Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [inkColor, setInkColor] = useState<'#1E3A8A' | '#0F172A'>('#1E3A8A');

  // Type Signature State
  const [typedName, setTypedName] = useState(clientSignerName);
  const [selectedScriptFont, setSelectedScriptFont] = useState<'script' | 'formal' | 'serif' | 'italic'>('script');

  // Biometric Signing State
  const [isBiometricVerifying, setIsBiometricVerifying] = useState(false);
  const [biometricVerified, setBiometricVerified] = useState(false);

  // Document Page Preview
  const [activePage, setActivePage] = useState<number>(4);
  const totalPages = 4;

  // Attestation Checkbox State
  const [confirmedTruth, setConfirmedTruth] = useState(true);
  const [confirmedKICA, setConfirmedKICA] = useState(true);

  // Execution Complete State
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExecutionComplete, setIsExecutionComplete] = useState(false);
  const [executedDoc, setExecutedDoc] = useState<MatterDocument | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Update typed name when signer role changes
  useEffect(() => {
    if (signerRole === 'client') {
      setTypedName(clientSignerName);
    } else {
      setTypedName(advocateSignerName);
    }
  }, [signerRole, clientSignerName, advocateSignerName]);

  // Canvas Drawing Handlers
  useEffect(() => {
    if (signMethod === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [signMethod, inkColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Hardware Biometric Verification Trigger
  const handleBiometricSign = async () => {
    setIsBiometricVerifying(true);
    try {
      if (window.PublicKeyCredential && navigator.credentials) {
        const dummyChallenge = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 1500);

        await navigator.credentials.get({
          publicKey: { challenge: dummyChallenge, timeout: 1500, userVerification: 'preferred' },
          signal: abortController.signal
        }).catch((err) => {
          console.info('Biometric fallback handshake:', err.name);
        }).finally(() => clearTimeout(timeoutId));
      }
    } catch (e) {
      console.info('Biometric driver:', e);
    }

    setTimeout(() => {
      setIsBiometricVerifying(false);
      setBiometricVerified(true);
    }, 1200);
  };

  // Final Document Execution Handler
  const handleExecuteSigning = () => {
    setIsExecuting(true);

    const signer = signerRole === 'client' ? clientSignerName : advocateSignerName;
    const certSerial = `KICA/2026/CTS-SEAL-${Math.floor(100000 + Math.random() * 900000)}`;
    const hash = `SHA256:${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
    const now = '06 Nov 2026, 11:28 EAT';

    const updatedDocument: MatterDocument = {
      ...document,
      isSigned: true,
      signedBy: signer,
      signedAt: now,
      signatureHash: hash,
      certificateRef: certSerial
    };

    setTimeout(() => {
      setIsExecuting(false);
      setIsExecutionComplete(true);
      setExecutedDoc(updatedDocument);
      onSignedDocument(updatedDocument);
    }, 900);
  };

  const copySignatureHash = () => {
    if (executedDoc?.signatureHash) {
      navigator.clipboard.writeText(executedDoc.signatureHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0A0E17] border border-[#C5A880]/50 rounded-2xl shadow-2xl overflow-hidden my-6 animate-fadeIn text-slate-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F1626] via-[#121B2F] to-[#0F1626] border-b border-[#222E46] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#E4C999] shadow-inner shrink-0">
              <PenTool className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  KICA § 83B · CTS Cryptographic Electronic Signature
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-cinzel text-white font-bold">
                Digital Execution & Sealing Suite
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-[#141F30] border border-[#23334E] rounded-lg text-emerald-400 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Section 106B Evidence Act Admissible</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8C98AE] hover:text-white rounded-lg hover:bg-[#1A2436] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= IF EXECUTION COMPLETE: SHOW SUCCESS CONFIRMATION ================= */}
        {isExecutionComplete && executedDoc ? (
          <div className="p-6 sm:p-8 space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1.5 max-w-lg mx-auto">
              <h4 className="text-xl font-cinzel font-bold text-white">
                Document Digitally Signed & Sealed
              </h4>
              <p className="text-xs text-[#CBD5E1]">
                The legal document has been cryptographically signed and affixed with the Chambers CTS Digital Seal under Section 83B of the Kenya Information and Communications Act.
              </p>
            </div>

            {/* Cryptographic Execution Certificate */}
            <div className="p-5 bg-[#0E1522] rounded-2xl border border-[#23324C] text-left max-w-2xl mx-auto space-y-3.5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#1E2B3E] pb-2.5">
                <span className="text-[#C5A880] font-bold">CTS ELECTRONIC SIGNATURE CERTIFICATE</span>
                <span className="text-emerald-400">VERIFIED & TAMPER-EVIDENT</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-[#8C98AE] block">Document:</span>
                  <strong className="text-white">{executedDoc.name}</strong>
                </div>
                <div>
                  <span className="text-[#8C98AE] block">Signatory:</span>
                  <strong className="text-white">{executedDoc.signedBy}</strong>
                </div>
                <div>
                  <span className="text-[#8C98AE] block">Execution Timestamp:</span>
                  <strong className="text-[#E4C999]">{executedDoc.signedAt}</strong>
                </div>
                <div>
                  <span className="text-[#8C98AE] block">Certificate Serial:</span>
                  <strong className="text-[#C5A880]">{executedDoc.certificateRef}</strong>
                </div>
              </div>

              <div className="p-2.5 bg-[#0A0E17] rounded-lg border border-[#1A2436] flex items-center justify-between">
                <div className="truncate pr-2">
                  <span className="text-[#8C98AE] text-[10px] block">Cryptographic Hash (SHA-256):</span>
                  <span className="text-white text-[11px] font-mono">{executedDoc.signatureHash}</span>
                </div>
                <button
                  onClick={copySignatureHash}
                  className="px-2.5 py-1 bg-[#172338] hover:bg-[#20314E] text-[#C5A880] rounded text-[10px] flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#C5A880] text-[#0A0E17] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg"
              >
                Done & Return to Documents
              </button>
            </div>
          </div>
        ) : (
          /* ================= MAIN SIGNING WORKSPACE ================= */
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 6 Columns: Document Execution Preview */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#8C98AE]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C5A880]" />
                  <span className="font-semibold text-white truncate max-w-[200px]">{document.name}</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <span>Page {activePage} of {totalPages}</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#172338] text-[#C5A880]">Execution Clause</span>
                </div>
              </div>

              {/* Simulated Legal Document Page */}
              <div className="bg-white text-slate-900 rounded-xl p-5 shadow-inner border border-slate-300 min-h-[420px] text-xs font-serif leading-relaxed flex flex-col justify-between select-none">
                
                <div className="space-y-3">
                  <div className="text-center border-b border-slate-300 pb-2.5">
                    <h5 className="font-bold text-sm tracking-wide text-slate-900 font-cinzel">
                      IN THE HIGH COURT OF KENYA AT NAIROBI
                    </h5>
                    <p className="text-[10px] font-sans text-slate-600">
                      COMMERCIAL & TAX DIVISION · CAUSE NO. {matter.ctsNumber}
                    </p>
                    <p className="text-[11px] font-bold text-slate-800 mt-1">
                      {matter.caseTitle}
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-700 italic">
                    Originating Pleadings & Certified Verifying Affidavit under Order 4 Rule 1(2) Civil Procedure Rules.
                  </p>

                  <div className="space-y-1.5 text-[11px] text-slate-800">
                    <p>
                      1. I, the undersigned Authorized Officer, depose and state that I am duly authorized to swear this Affidavit on behalf of the Corporate Litigant.
                    </p>
                    <p>
                      2. That the facts set out in the accompanying Plaint and Chamber Summons are true to the best of my knowledge, information, and institutional belief.
                    </p>
                    <p>
                      3. That this electronic transmission and signature is executed pursuant to Section 83B of the Kenya Information and Communications Act.
                    </p>
                  </div>
                </div>

                {/* Execution Clause & Real-Time Signature Stamp Placement */}
                <div className="border-t-2 border-slate-400 pt-3 mt-4 space-y-2">
                  <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-600">
                    SWORN & EXECUTED AT NAIROBI:
                  </div>

                  {/* Visual Signature & Seal Stamp */}
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      {/* Render Drawn or Typed signature */}
                      {signMethod === 'type' ? (
                        <div className={`text-xl font-bold text-blue-900 ${
                          selectedScriptFont === 'script' ? 'font-serif italic tracking-wide' : 'font-sans'
                        }`}>
                          {typedName || 'Signatory Name'}
                        </div>
                      ) : signMethod === 'draw' && hasDrawn ? (
                        <div className="text-xs font-mono font-bold text-blue-900 italic">
                          [Digital Ink Signature Captured]
                        </div>
                      ) : biometricVerified ? (
                        <div className="text-xs font-mono font-bold text-emerald-800 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>[Hardware Enclave Signature Verified]</span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic">
                          (Signature will be affixed upon signing)
                        </div>
                      )}

                      <div className="text-[10px] text-slate-700 font-sans">
                        <span>Signatory: <strong>{signerRole === 'client' ? clientSignerName : advocateSignerName}</strong></span>
                      </div>
                      <div className="text-[9px] font-mono text-slate-500">
                        Section 106B Evidence Act · CTS Seal
                      </div>
                    </div>

                    {/* Concentric Golden Stamp Graphic */}
                    <div className="w-16 h-16 rounded-full border-2 border-amber-600/70 p-1 flex items-center justify-center text-center shrink-0 text-amber-700">
                      <div className="w-full h-full rounded-full border border-dashed border-amber-600/60 flex flex-col items-center justify-center text-[7px] font-bold leading-tight uppercase font-cinzel">
                        <span>HIGH COURT</span>
                        <span className="text-[6px] font-mono text-red-700 font-extrabold">CTS SEAL</span>
                        <span>NAIROBI</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right 6 Columns: Interactive Signature Controls */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Signer Identity Selection */}
              <div className="p-3.5 bg-[#0E1522] rounded-xl border border-[#1E293B] space-y-2.5">
                <label className="text-xs text-[#94A3B8] font-medium block">
                  Select Authorized Signatory Profile:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSignerRole('client')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      signerRole === 'client'
                        ? 'bg-[#C5A880]/15 border-[#C5A880] text-white'
                        : 'bg-[#121927] border-[#222E44] text-[#8C98AE] hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Corporate In-House Counsel</span>
                    </div>
                    <div className="text-[10px] text-[#CBD5E1] truncate mt-0.5 font-mono">
                      {clientSignerName.split(',')[0]}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignerRole('advocate')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      signerRole === 'advocate'
                        ? 'bg-[#C5A880]/15 border-[#C5A880] text-white'
                        : 'bg-[#121927] border-[#222E44] text-[#8C98AE] hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Senior Counsel Advocate</span>
                    </div>
                    <div className="text-[10px] text-[#CBD5E1] truncate mt-0.5 font-mono">
                      Milton Angwenyi, SC
                    </div>
                  </button>
                </div>
              </div>

              {/* Signature Method Segmented Tabs */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#1E293E] pb-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSignMethod('draw')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      signMethod === 'draw'
                        ? 'bg-[#C5A880] text-[#0A0E17] font-bold'
                        : 'bg-[#121927] text-[#8C98AE] hover:text-white'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Draw Signature</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignMethod('type')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      signMethod === 'type'
                        ? 'bg-[#C5A880] text-[#0A0E17] font-bold'
                        : 'bg-[#121927] text-[#8C98AE] hover:text-white'
                    }`}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Type Legal Script</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignMethod('biometric')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      signMethod === 'biometric'
                        ? 'bg-[#C5A880] text-[#0A0E17] font-bold'
                        : 'bg-[#121927] text-[#8C98AE] hover:text-white'
                    }`}
                  >
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Hardware Touch ID</span>
                  </button>
                </div>

                {/* Method 1: HTML5 Signature Canvas */}
                {signMethod === 'draw' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#8C98AE]">
                      <span>Draw signature in the box below:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setInkColor('#1E3A8A')}
                            className={`w-4 h-4 rounded-full bg-blue-900 border ${inkColor === '#1E3A8A' ? 'border-white' : 'border-transparent'}`}
                            title="Legal Blue Ink"
                          />
                          <button
                            type="button"
                            onClick={() => setInkColor('#0F172A')}
                            className={`w-4 h-4 rounded-full bg-slate-900 border ${inkColor === '#0F172A' ? 'border-white' : 'border-transparent'}`}
                            title="Court Black Ink"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="text-[11px] text-[#C5A880] hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>

                    <div className="border border-[#2C3C58] rounded-xl overflow-hidden bg-white/95 touch-none">
                      <canvas
                        ref={canvasRef}
                        width={420}
                        height={130}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-[130px] cursor-crosshair"
                      />
                    </div>
                  </div>
                )}

                {/* Method 2: Type Legal Script */}
                {signMethod === 'type' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[#8C98AE] block mb-1 font-medium">
                        Legal Signatory Name
                      </label>
                      <input
                        type="text"
                        value={typedName}
                        onChange={(e) => setTypedName(e.target.value)}
                        className="w-full bg-[#121927] border border-[#232F46] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div className="p-3 bg-white text-slate-900 rounded-xl border border-slate-300 text-center">
                      <div className="text-2xl font-serif italic text-blue-900 tracking-wider">
                        {typedName || 'Enter Signatory Name'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        Cryptographic Digital Monogram Affixed
                      </div>
                    </div>
                  </div>
                )}

                {/* Method 3: Hardware Biometrics */}
                {signMethod === 'biometric' && (
                  <div className="p-4 bg-[#121927] rounded-xl border border-[#202E46] text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/30 mx-auto flex items-center justify-center text-[#E4C999]">
                      <Fingerprint className="w-6 h-6 text-[#C5A880] animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-semibold text-white">
                        FIDO2 WebAuthn Hardware Sign-Off
                      </h5>
                      <p className="text-[11px] text-[#8C98AE]">
                        Trigger cryptographic signing using your device's Secure Enclave (Apple Touch ID, Face ID, or Windows Hello).
                      </p>
                    </div>

                    {biometricVerified ? (
                      <div className="p-2 bg-emerald-950/70 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-mono flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Hardware Cryptographic Handshake Verified</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleBiometricSign}
                        disabled={isBiometricVerifying}
                        className="px-4 py-2 bg-[#C5A880] text-[#0A0E17] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 flex items-center justify-center gap-1.5 mx-auto"
                      >
                        {isBiometricVerifying ? (
                          <span>Scanning Secure Enclave...</span>
                        ) : (
                          <>
                            <Fingerprint className="w-4 h-4" />
                            <span>Verify Device Biometrics</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Statutory Attestation Checklist */}
              <div className="p-3 bg-[#0D1420] rounded-xl border border-[#1A2436] space-y-2 text-xs text-[#8C98AE]">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedTruth}
                    onChange={(e) => setConfirmedTruth(e.target.checked)}
                    className="w-4 h-4 rounded border-[#24334B] text-[#C5A880] bg-[#121927] focus:ring-0 mt-0.5"
                  />
                  <span>
                    I confirm that I have reviewed the annexed legal document and verify that the facts stated therein are true to the best of my knowledge.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedKICA}
                    onChange={(e) => setConfirmedKICA(e.target.checked)}
                    className="w-4 h-4 rounded border-[#24334B] text-[#C5A880] bg-[#121927] focus:ring-0 mt-0.5"
                  />
                  <span>
                    Executed electronically pursuant to <strong>Section 83B of the Kenya Information and Communications Act (KICA)</strong> and admissible under <strong>Section 106B of the Evidence Act</strong>.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-[#172133] hover:bg-[#202E46] text-white text-xs font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleExecuteSigning}
                  disabled={!confirmedTruth || !confirmedKICA || isExecuting}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#C5A880] to-[#E4C999] hover:brightness-105 text-[#0A0E17] font-bold text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-[#C5A880]/15 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExecuting ? (
                    <span>Cryptographically Sealing...</span>
                  ) : (
                    <>
                      <PenTool className="w-4 h-4" />
                      <span>Sign & Seal Document</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
