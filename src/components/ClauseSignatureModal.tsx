import React, { useState, useRef, useEffect } from 'react';
import { 
  X, PenTool, CheckCircle2, ShieldCheck, RotateCcw, 
  UserCheck, Sparkles, Fingerprint, Lock, Check,
  AlertCircle, Scale, Copy, Landmark, FileText, Stamp
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface ClauseSignatureData {
  clauseNumber: number;
  clauseTitle: string;
  clauseText: string;
  signerName: string;
  signerRole: string;
  signerEntity: string;
  signatureType: 'pad' | 'profile' | 'biometric';
  signatureDataUrl?: string;
  typedSignature?: string;
  signatureStyle?: string;
  timestamp: string;
  isoTime: string;
  kicaHash: string;
}

export interface StoredProfileSignature {
  id: string;
  name: string;
  role: string;
  entity: string;
  defaultStyle: 'cursive' | 'formal' | 'executive';
  sampleInitials: string;
  verifiedDate: string;
}

export const STORED_PROFILES: StoredProfileSignature[] = [
  {
    id: 'kibera',
    name: 'Dr. Angela Kibera',
    role: 'Group General Counsel & Company Secretary',
    entity: 'Consolidated Energy Holdings Ltd',
    defaultStyle: 'cursive',
    sampleInitials: 'AK',
    verifiedDate: 'Active CTS On-File'
  },
  {
    id: 'ndungu',
    name: 'Brian Ndung\'u',
    role: 'Head of Legal & Commercial Development',
    entity: 'Apex Real Estate PLC',
    defaultStyle: 'formal',
    sampleInitials: 'BN',
    verifiedDate: 'Active CTS On-File'
  },
  {
    id: 'angwenyi',
    name: 'Milton Angwenyi, SC',
    role: 'Lead Senior Counsel & Managing Partner',
    entity: 'Petersons Angwenyi & Associates Advocates',
    defaultStyle: 'executive',
    sampleInitials: 'MA',
    verifiedDate: 'LSK Roll No. P.105/7412/95'
  }
];

interface ClauseSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  clauseNumber: number;
  clauseTitle: string;
  clauseText: string;
  documentTitle?: string;
  defaultSignerName?: string;
  defaultSignerRole?: string;
  defaultSignerEntity?: string;
  onSignatureComplete: (sig: ClauseSignatureData) => void;
}

export const ClauseSignatureModal: React.FC<ClauseSignatureModalProps> = ({
  isOpen,
  onClose,
  clauseNumber,
  clauseTitle,
  clauseText,
  documentTitle = 'Certified Legal Document',
  defaultSignerName = STORED_PROFILES[0].name,
  defaultSignerRole = STORED_PROFILES[0].role,
  defaultSignerEntity = STORED_PROFILES[0].entity,
  onSignatureComplete
}) => {
  const { t } = useLanguage();

  // Mode: 'pad' (Draw on canvas) | 'profile' (Stored profile signature) | 'biometric' (WebAuthn)
  const [activeMethod, setActiveMethod] = useState<'pad' | 'profile' | 'biometric'>('pad');

  // Signer Details
  const [selectedProfileId, setSelectedProfileId] = useState<string>(STORED_PROFILES[0].id);
  const [signerName, setSignerName] = useState<string>(defaultSignerName);
  const [signerRole, setSignerRole] = useState<string>(defaultSignerRole);
  const [signerEntity, setSignerEntity] = useState<string>(defaultSignerEntity);

  // Drawing Pad Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [inkColor, setInkColor] = useState<'#1E3A8A' | '#0F172A'>('#1E3A8A');

  // Stored Profile Signature Typography Style
  const [profileStyle, setProfileStyle] = useState<'cursive' | 'formal' | 'executive'>('cursive');

  // Biometric Attestation Simulation State
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [biometricVerified, setBiometricVerified] = useState(false);

  // Statutory Acknowledgment
  const [attestationAccepted, setAttestationAccepted] = useState(true);

  // Initialize Canvas
  useEffect(() => {
    if (activeMethod === 'pad' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeMethod, inkColor]);

  // Handle Profile Selection
  const handleSelectProfile = (profile: StoredProfileSignature) => {
    setSelectedProfileId(profile.id);
    setSignerName(profile.name);
    setSignerRole(profile.role);
    setSignerEntity(profile.entity);
    setProfileStyle(profile.defaultStyle);
  };

  // Drawing Handlers
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

  // Trigger Biometric Scan
  const handleTriggerBiometric = () => {
    setIsBiometricScanning(true);
    setTimeout(() => {
      setIsBiometricScanning(false);
      setBiometricVerified(true);
    }, 700);
  };

  // Execute Signature Submission
  const handleApplySignature = (e: React.FormEvent) => {
    e.preventDefault();

    let signatureDataUrl: string | undefined = undefined;
    let typedSignature: string | undefined = undefined;

    if (activeMethod === 'pad') {
      if (!hasDrawn) {
        alert('Please draw your signature on the pad before applying, or switch to Stored Profile Signature.');
        return;
      }
      if (canvasRef.current) {
        signatureDataUrl = canvasRef.current.toDataURL('image/png');
      }
    } else if (activeMethod === 'profile') {
      typedSignature = signerName;
    } else if (activeMethod === 'biometric') {
      if (!biometricVerified) {
        alert('Please complete hardware biometric touch verification before finalizing.');
        return;
      }
      typedSignature = `${signerName} [KICA § 83B Biometric Asserted]`;
    }

    const timestamp = new Date().toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }) + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' EAT';

    const kicaHash = `SHA256:${Math.random().toString(36).substring(2, 8).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const signatureData: ClauseSignatureData = {
      clauseNumber,
      clauseTitle,
      clauseText,
      signerName,
      signerRole,
      signerEntity,
      signatureType: activeMethod,
      signatureDataUrl,
      typedSignature,
      signatureStyle: profileStyle,
      timestamp,
      isoTime: new Date().toISOString(),
      kicaHash
    };

    onSignatureComplete(signatureData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#090D15] border border-[#C5A880]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-slate-200">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-[#0F1626] border-b border-[#222E46] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/40 flex items-center justify-center text-[#DFBE82] shrink-0">
              <PenTool className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#C5A880]">
                <span>e-Signature Request Workflow</span>
                <span>·</span>
                <span className="text-emerald-400">KICA § 83B Compliant</span>
              </div>
              <h3 className="text-base sm:text-lg font-cinzel text-white font-bold tracking-wide">
                Sign Highlighted Clause {clauseNumber}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C98AE] hover:text-white rounded-lg hover:bg-[#1A2538] transition-colors"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Target Clause Information Banner */}
          <div className="p-3.5 rounded-xl bg-[#121B2A] border border-[#202E44] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#C5A880] font-bold uppercase tracking-wider">
                Target Provision: Clause {clauseNumber}
              </span>
              <span className="text-[#7E8D9F]">{documentTitle}</span>
            </div>
            <h4 className="text-sm font-cinzel text-white font-semibold">
              {clauseTitle}
            </h4>
            <p className="text-xs text-[#BAC5D6] font-serif leading-relaxed line-clamp-3 bg-[#0A0F17] p-2.5 rounded-lg border border-[#1A2538] italic">
              "{clauseText}"
            </p>
          </div>

          {/* Signature Method Switcher Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-[#0E1522] border border-[#1E283C] rounded-xl text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveMethod('pad')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-all ${
                activeMethod === 'pad'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Signature Pad</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMethod('profile')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-all ${
                activeMethod === 'profile'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Stored Profile Signature</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMethod('biometric')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-all ${
                activeMethod === 'biometric'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Biometric Sign</span>
            </button>
          </div>

          {/* METHOD 1: INTERACTIVE DRAWING CANVAS PAD */}
          {activeMethod === 'pad' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#BAC5D6] font-medium flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Sign with touch or mouse inside the box:</span>
                </span>
                
                {/* Ink Color Selector */}
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-[#7888A0]">Ink:</span>
                  <button
                    type="button"
                    onClick={() => setInkColor('#1E3A8A')}
                    className={`w-4 h-4 rounded-full bg-[#1E3A8A] border ${inkColor === '#1E3A8A' ? 'ring-2 ring-[#C5A880] scale-110' : 'opacity-60'}`}
                    title="Royal Judicial Blue Ink"
                  />
                  <button
                    type="button"
                    onClick={() => setInkColor('#0F172A')}
                    className={`w-4 h-4 rounded-full bg-[#0F172A] border ${inkColor === '#0F172A' ? 'ring-2 ring-[#C5A880] scale-110' : 'opacity-60'}`}
                    title="Formal Black Ink"
                  />
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="ml-2 px-2 py-0.5 rounded bg-[#162132] hover:bg-[#202E44] text-[#A6B2C4] hover:text-white text-[10px] flex items-center gap-1"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* White Canvas Pad */}
              <div className="relative rounded-xl border-2 border-dashed border-[#C5A880]/50 bg-white shadow-inner overflow-hidden flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-mono">
                    <span className="flex items-center gap-2">
                      <PenTool className="w-4 h-4 opacity-50" />
                      <span>Draw signature here to execute clause</span>
                    </span>
                  </div>
                )}
                <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-400 pointer-events-none">
                  KICA § 83B Vector Enclave
                </div>
              </div>
            </div>
          )}

          {/* METHOD 2: STORED PROFILE SIGNATURE */}
          {activeMethod === 'profile' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#BAC5D6] font-medium flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Select Verified Officer Profile:</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400">CTS Keystore Certified</span>
              </div>

              {/* Profiles Selector Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {STORED_PROFILES.map((profile) => {
                  const isSelected = selectedProfileId === profile.id;
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => handleSelectProfile(profile)}
                      className={`p-3 rounded-xl border text-left transition-all text-xs relative ${
                        isSelected
                          ? 'bg-[#152136] border-[#C5A880] shadow-md shadow-[#C5A880]/10 text-white'
                          : 'bg-[#0E1522] border-[#1C2738] hover:border-[#2A3B54] text-[#8C98AE] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold truncate text-white">{profile.name}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#C5A880] shrink-0" />}
                      </div>
                      <div className="text-[11px] text-[#C5A880] font-mono truncate">{profile.role}</div>
                      <div className="text-[10px] text-[#697992] truncate">{profile.entity}</div>
                    </button>
                  );
                })}
              </div>

              {/* Calligraphy Style Selector */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#8C98AE] block">Signature Calligraphy Style:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setProfileStyle('cursive')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      profileStyle === 'cursive' ? 'bg-[#162132] border-[#C5A880] text-white' : 'bg-[#0E1522] border-[#1C2738] text-[#8C98AE]'
                    }`}
                  >
                    <span className="text-lg italic font-serif text-[#DFBE82] block tracking-wide">
                      {signerName}
                    </span>
                    <span className="text-[10px] font-mono text-[#7888A0]">Flowing Cursive</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileStyle('formal')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      profileStyle === 'formal' ? 'bg-[#162132] border-[#C5A880] text-white' : 'bg-[#0E1522] border-[#1C2738] text-[#8C98AE]'
                    }`}
                  >
                    <span className="text-lg font-cinzel text-white block tracking-widest uppercase">
                      {signerName.split(' ')[0]} {signerName.split(' ')[1]}
                    </span>
                    <span className="text-[10px] font-mono text-[#7888A0]">Formal Cinzel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileStyle('executive')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      profileStyle === 'executive' ? 'bg-[#162132] border-[#C5A880] text-white' : 'bg-[#0E1522] border-[#1C2738] text-[#8C98AE]'
                    }`}
                  >
                    <span className="text-lg font-mono font-bold text-[#E4C999] block tracking-normal">
                      // {signerName} //
                    </span>
                    <span className="text-[10px] font-mono text-[#7888A0]">Executive Digital</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* METHOD 3: BIOMETRIC WEBAUTHN SIGNING */}
          {activeMethod === 'biometric' && (
            <div className="p-4 rounded-xl bg-[#0E1524] border border-[#202E44] flex flex-col items-center justify-center text-center space-y-3 animate-fadeIn">
              <div 
                onClick={handleTriggerBiometric}
                className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                  biometricVerified 
                    ? 'bg-emerald-950/50 border-2 border-emerald-400 text-emerald-400' 
                    : isBiometricScanning
                    ? 'bg-[#141F32] border-2 border-[#C5A880] text-[#DFBE82] animate-pulse ring-4 ring-[#C5A880]/20'
                    : 'bg-[#121A28] border border-[#253348] text-[#8C98AE] hover:text-[#C5A880] hover:border-[#C5A880]/60'
                }`}
                title="Tap to verify biometric hardware token"
              >
                {biometricVerified ? (
                  <CheckCircle2 className="w-10 h-10" />
                ) : (
                  <Fingerprint className="w-10 h-10" />
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-white block">
                  {biometricVerified 
                    ? 'Biometric Enclave Signature Verified'
                    : isBiometricScanning
                    ? 'Contacting Touch ID / Secure Enclave...'
                    : 'Touch Biometric Sensor to Assert Signature'}
                </span>
                <span className="text-[11px] font-mono text-[#7E8D9F] mt-0.5 block">
                  {signerName} · {signerRole}
                </span>
              </div>
            </div>
          )}

          {/* Signer Customization Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1C263A] text-xs">
            <div className="space-y-1">
              <label className="text-[#BAC5D6] font-medium block">Executing Signer Name</label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full bg-[#111724] border border-[#232F46] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C5A880]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#BAC5D6] font-medium block">Title & Corporate Affiliation</label>
              <input
                type="text"
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value)}
                className="w-full bg-[#111724] border border-[#232F46] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C5A880]"
                required
              />
            </div>
          </div>

          {/* Statutory Attestation Acceptance Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0D1420] border border-[#1E293B] cursor-pointer text-xs text-[#9DAABF]">
            <input
              type="checkbox"
              checked={attestationAccepted}
              onChange={(e) => setAttestationAccepted(e.target.checked)}
              className="mt-0.5 rounded text-[#C5A880] focus:ring-[#C5A880]"
            />
            <span className="leading-relaxed">
              I acknowledge that this digital signature is affixed to <strong>Clause {clauseNumber}</strong> pursuant to Section 83B of the Kenya Information and Communications Act (Cap 411A) and constitutes a legally binding affirmation.
            </span>
          </label>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0F1626] border-t border-[#222E46] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#141C2B] hover:bg-[#1D273A] text-xs font-semibold text-[#8C98AE]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplySignature}
            disabled={!attestationAccepted}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#DFBE82] text-[#0A0E17] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#C5A880]/20 disabled:opacity-50 transition-all"
          >
            <Stamp className="w-4 h-4 text-[#0A0E17]" />
            <span>Apply Signature to Clause</span>
          </button>
        </div>

      </div>
    </div>
  );
};
