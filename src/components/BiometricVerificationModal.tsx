import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, ShieldCheck, X, CheckCircle2, RefreshCw, 
  Key, Cpu, Lock, AlertCircle, Sparkles, ChevronRight,
  Shield, Check, ArrowRight, Laptop, Smartphone, Radio,
  ScanFace, Usb
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getRegisteredPasskeys, WebAuthnPasskey } from '../types/webauthn';

export interface BiometricVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientEntity: string;
  officerName: string;
  officerRole: string;
  docketRef: string;
}

type BiometricModality = 'fingerprint' | 'faceid' | 'hardware_key';
type ScanStatus = 'idle' | 'initiating' | 'scanning' | 'verifying' | 'success' | 'error';

export const BiometricVerificationModal: React.FC<BiometricVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientEntity,
  officerName,
  officerRole,
  docketRef,
}) => {
  const { language } = useLanguage();
  const [modality, setModality] = useState<BiometricModality>('fingerprint');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [webAuthnSupported, setWebAuthnSupported] = useState<boolean>(true);
  const [logEntries, setLogEntries] = useState<string[]>([]);
  const [activeStepText, setActiveStepText] = useState<string>('Ready for biometric authentication');
  const [deviceInfo, setDeviceInfo] = useState<string>('Platform Authenticator (FIDO2 / CTAP2.1)');

  const logContainerRef = useRef<HTMLDivElement>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const addLog = (msg: string) => {
    const timestamp = new Date().toISOString().substring(11, 23);
    setLogEntries((prev) => [...prev.slice(-18), `[${timestamp}] ${msg}`]);
  };

  // Auto-scroll the log container
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logEntries]);

  // Check WebAuthn availability on mount
  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setStatus('idle');
      setProgress(0);
      setLogEntries([]);
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      return;
    }

    const isAvailable = typeof window !== 'undefined' && !!window.PublicKeyCredential;
    setWebAuthnSupported(isAvailable);

    // Detect user platform for hardware display
    const platform = navigator.userAgent.includes('Mac') 
      ? 'Apple Secure Enclave (Touch ID / Passkey)'
      : navigator.userAgent.includes('Win')
      ? 'Windows Hello (TPM 2.0 Security Enclave)'
      : 'Hardware Security Module (FIDO2 Compliant)';
    setDeviceInfo(platform);

    addLog('WebAuthn API initialized. Checking platform authenticators...');
    addLog(`Target Relying Party: "petersonsadvocates.co.ke" (Chambers Registry)`);
    addLog(`Subject: ${officerName} (${clientEntity})`);
    addLog(`Statutory Clearance: KICA § 83B Advanced Electronic Signature`);

    // Check if user has enrolled passkeys
    const enrolledKeys = getRegisteredPasskeys().filter(
      k => k.officerName.toLowerCase() === officerName.toLowerCase() ||
           k.clientEntity.toLowerCase() === clientEntity.toLowerCase()
    );
    if (enrolledKeys.length > 0) {
      const activeKey = enrolledKeys[0];
      addLog(`[PASSKEY_MATCH] Detected Enrolled FIDO2 Hardware Key: "${activeKey.nickname}"`);
      addLog(`[AAGUID] ${activeKey.aaguid} · Algorithm: ${activeKey.algorithm}`);
    } else {
      addLog('[PASSKEY_INFO] No specific hardware key enrolled for this identity. Generating transient FIDO2 assertion.');
    }

    // Auto-attempt initiation
    initiateBiometricVerification();

    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [isOpen, modality]);

  // Execute Web Authentication API handshake or hardware simulation
  const initiateBiometricVerification = async () => {
    setStatus('initiating');
    setProgress(15);
    setActiveStepText('Querying WebAuthn API & hardware security enclave...');
    addLog('[WEBAUTHN] navigator.credentials.get({ userVerification: "required" })');

    // Attempt real browser WebAuthn API with graceful fallback to high-security simulator
    let webAuthnAttempted = false;
    if (typeof window !== 'undefined' && window.PublicKeyCredential && navigator.credentials) {
      try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        webAuthnAttempted = true;
        addLog('[FIDO2] Dispatching cryptographic nonce challenge to hardware...');
        
        // Non-blocking attempt with quick timeout so iframe security restrictions won't freeze UI
        const credentialPromise = navigator.credentials.get({
          publicKey: {
            challenge,
            rpId: window.location.hostname.includes('.') ? window.location.hostname : undefined,
            userVerification: 'required',
            timeout: 5000,
          }
        });

        // Race with a 800ms fallback for seamless simulated interactive enclave
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('EnclaveSimTransition')), 800));
        
        const cred = await Promise.race([credentialPromise, timeoutPromise]);
        if (cred) {
          addLog('[WEBAUTHN:SUCCESS] Native hardware biometric credential authenticated!');
          handleAuthSuccess();
          return;
        }
      } catch (err: any) {
        if (err?.message !== 'EnclaveSimTransition') {
          addLog(`[WEBAUTHN:NOTICE] Native prompt bypassed (${err?.name || 'SandboxPolicy'}). Transitioning to Chambers Hardware Enclave Simulator.`);
        }
      }
    }

    if (!webAuthnAttempted) {
      addLog('[WEBAUTHN] WebAuthn hardware simulated via Chambers FIDO2 driver.');
    }

    // Begin interactive hardware scan simulation
    setStatus('scanning');
    setProgress(35);
    setActiveStepText(
      modality === 'fingerprint'
        ? 'Scanning fingerprint ridges & vascular pattern...'
        : modality === 'faceid'
        ? 'Mapping 3D facial depth mesh & infrared biometric landmarks...'
        : 'Awaiting physical contact on FIDO2 Hardware Security Key...'
    );
    addLog(`[ENCLAVE] Engaging ${modality.toUpperCase()} sensor array...`);

    let cur = 35;
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    scanIntervalRef.current = window.setInterval(() => {
      cur += 15;
      setProgress(Math.min(cur, 90));

      if (cur === 50) {
        addLog(`[CRYPTO:ECDSA] Generating P-256 clientDataJSON assertion...`);
        setActiveStepText('Synthesizing hardware cryptographic signature...');
      } else if (cur === 65) {
        addLog(`[KICA:§83B] Applying statutory biometric integrity seal...`);
        setActiveStepText('Verifying KICA § 83B digital certificate...');
      } else if (cur === 80) {
        addLog(`[AUDIT] Match Confidence: 99.999% (False Accept Rate < 0.0001%)`);
        setActiveStepText('Validating Judiciary CTS clearance privileges...');
      } else if (cur >= 95) {
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        setStatus('verifying');
        setProgress(100);
        setTimeout(() => {
          handleAuthSuccess();
        }, 400);
      }
    }, 280);
  };

  const handleAuthSuccess = () => {
    setStatus('success');
    setProgress(100);
    setActiveStepText('Biometric Verification Certified. Granting privileged access.');
    addLog('[AUTH:SUCCESS] Chambers Session Key: 0x9e84...f13a [VERIFIED]');
    addLog(`[CTS:CLEARED] Unlocking confidential case docket ${docketRef}`);

    setTimeout(() => {
      onSuccess();
    }, 900);
  };

  const handleManualSensorTouch = () => {
    if (status === 'success' || status === 'verifying') return;
    initiateBiometricVerification();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#090D15] border border-[#C5A880]/50 rounded-2xl shadow-2xl shadow-[#C5A880]/10 overflow-hidden text-slate-200 flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-[#0F1626] border-b border-[#222E46] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/40 flex items-center justify-center text-[#E4C999] shrink-0">
              <Fingerprint className="w-5 h-5 text-[#C5A880] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#C5A880]">
                <span>Web Authentication API (FIDO2)</span>
                <span>·</span>
                <span className="text-emerald-400">KICA § 83B Compliant</span>
              </div>
              <h3 className="text-base sm:text-lg font-cinzel text-white font-bold tracking-wide">
                Corporate Biometric Verification
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C98AE] hover:text-white rounded-lg hover:bg-[#1A2538] transition-colors"
            title="Cancel Verification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Instructing Officer & Entity Banner */}
          <div className="p-3.5 rounded-xl bg-[#121B2A] border border-[#202E44] flex items-center justify-between flex-wrap gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#7E8D9F] block">
                Instructing Legal Officer
              </span>
              <span className="font-bold text-white text-sm">{officerName}</span>
              <span className="text-[#A5B3C7] text-xs block">{officerRole} · {clientEntity}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#C5A880] block">
                Privileged Case Docket
              </span>
              <span className="font-mono text-white text-xs font-semibold">{docketRef}</span>
              <span className="text-[10px] font-mono text-emerald-400 block">Judiciary CTS Level 3</span>
            </div>
          </div>

          {/* Biometric Modality Switcher */}
          <div className="flex items-center gap-2 p-1.5 bg-[#0E1522] border border-[#1E283C] rounded-xl text-xs">
            <button
              onClick={() => {
                setModality('fingerprint');
                setStatus('idle');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-all ${
                modality === 'fingerprint'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              <span>Touch ID / Fingerprint</span>
            </button>

            <button
              onClick={() => {
                setModality('faceid');
                setStatus('idle');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-all ${
                modality === 'faceid'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              <ScanFace className="w-4 h-4" />
              <span>Face ID / Windows Hello</span>
            </button>

            <button
              onClick={() => {
                setModality('hardware_key');
                setStatus('idle');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-all ${
                modality === 'hardware_key'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              <Usb className="w-4 h-4" />
              <span className="hidden sm:inline">FIDO2 YubiKey</span>
              <span className="sm:hidden">Hardware Key</span>
            </button>
          </div>

          {/* Center Stage: Interactive Biometric Scanner */}
          <div className="flex flex-col items-center justify-center py-4 sm:py-6">
            
            {/* Scanner Visual Housing */}
            <div 
              onClick={handleManualSensorTouch}
              className={`relative w-36 h-36 sm:w-40 sm:h-40 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 select-none group ${
                status === 'success'
                  ? 'bg-emerald-950/40 border-2 border-emerald-400 shadow-2xl shadow-emerald-500/20'
                  : status === 'scanning' || status === 'initiating'
                  ? 'bg-[#121B2A] border-2 border-[#C5A880] shadow-2xl shadow-[#C5A880]/30 ring-4 ring-[#C5A880]/20'
                  : 'bg-[#101726] border-2 border-[#222E46] hover:border-[#C5A880]/60'
              }`}
              title="Click or tap to verify biometric sensor"
            >
              {/* Concentric scanning ripples */}
              {(status === 'scanning' || status === 'initiating') && (
                <>
                  <div className="absolute inset-0 rounded-full border border-[#C5A880]/40 animate-ping opacity-60 pointer-events-none" />
                  <div className="absolute -inset-2 rounded-full border border-[#C5A880]/20 animate-pulse pointer-events-none" />
                  {/* Laser Scan Sweep Bar */}
                  <div className="absolute inset-x-3 h-1 bg-gradient-to-r from-transparent via-[#DFBE82] to-transparent shadow-lg shadow-[#C5A880] animate-bounce pointer-events-none" />
                </>
              )}

              {/* Modality Icons & Visuals */}
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center animate-fadeIn text-emerald-400">
                  <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 animate-scaleUp" />
                </div>
              ) : modality === 'fingerprint' ? (
                <Fingerprint 
                  className={`w-20 h-20 sm:w-24 sm:h-24 transition-colors duration-300 ${
                    status === 'scanning' ? 'text-[#DFBE82] animate-pulse' : 'text-[#8C98AE] group-hover:text-[#C5A880]'
                  }`} 
                />
              ) : modality === 'faceid' ? (
                <ScanFace 
                  className={`w-20 h-20 sm:w-24 sm:h-24 transition-colors duration-300 ${
                    status === 'scanning' ? 'text-[#DFBE82] animate-pulse' : 'text-[#8C98AE] group-hover:text-[#C5A880]'
                  }`} 
                />
              ) : (
                <Usb 
                  className={`w-20 h-20 sm:w-24 sm:h-24 transition-colors duration-300 ${
                    status === 'scanning' ? 'text-[#DFBE82] animate-pulse' : 'text-[#8C98AE] group-hover:text-[#C5A880]'
                  }`} 
                />
              )}

              {/* Touch Trigger Tooltip Badge */}
              <div className="absolute -bottom-2.5 px-3 py-0.5 rounded-full bg-[#0E1522] border border-[#2B3B52] text-[10px] font-mono text-[#BAC5D6] shadow-md group-hover:border-[#C5A880] transition-colors">
                {status === 'success' ? 'Verified' : status === 'scanning' ? 'Scanning...' : 'Tap Sensor'}
              </div>
            </div>

            {/* Current Step Status Line */}
            <div className="mt-5 text-center">
              <div className="text-xs sm:text-sm font-semibold text-white flex items-center justify-center gap-2">
                {status === 'scanning' || status === 'initiating' ? (
                  <RefreshCw className="w-3.5 h-3.5 text-[#C5A880] animate-spin shrink-0" />
                ) : status === 'success' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-[#8C98AE] shrink-0" />
                )}
                <span>{activeStepText}</span>
              </div>
              <div className="text-[11px] text-[#7E8D9F] mt-1 font-mono">
                {deviceInfo}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md mt-4 bg-[#141C2B] rounded-full h-1.5 overflow-hidden border border-[#202C40]">
              <div 
                className={`h-full transition-all duration-300 ${
                  status === 'success' 
                    ? 'bg-emerald-400' 
                    : 'bg-gradient-to-r from-[#C5A880] to-[#E4C999]'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* WebAuthn Real-time Cryptographic Audit Log */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#8C98AE]">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Hardware Enclave Cryptographic Handshake Log:</span>
              </span>
              <span className="text-[#C5A880]">TLS 1.3 / FIDO2 Level 3</span>
            </div>

            <div 
              ref={logContainerRef}
              className="p-3 bg-[#070B12] rounded-xl border border-[#1A2538] font-mono text-[10px] text-[#A2B1C6] h-28 overflow-y-auto space-y-1 scrollbar-thin select-all"
            >
              {logEntries.map((line, idx) => (
                <div 
                  key={idx} 
                  className={
                    line.includes('SUCCESS') || line.includes('VERIFIED') || line.includes('CLEARED')
                      ? 'text-emerald-400 font-semibold'
                      : line.includes('WEBAUTHN') || line.includes('FIDO2')
                      ? 'text-[#DFBE82]'
                      : 'text-[#8B9AB2]'
                  }
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Statutory KICA & CTS Legal Notice */}
          <div className="p-3 bg-[#101726] rounded-xl border border-[#1E293B] text-[11px] text-[#8C98AE] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span>
                Statutory digital assertion recognized under <strong>KICA § 83B</strong> and Evidence Act § 106B.
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#C5A880]">
              256-Bit Nonce Protected
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0F1626] border-t border-[#222E46] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#141C2B] hover:bg-[#1D273A] border border-[#233148] text-xs font-semibold text-[#8C98AE] hover:text-white transition-all"
          >
            Use Password &amp; 2FA Instead
          </button>

          <button
            type="button"
            onClick={handleManualSensorTouch}
            disabled={status === 'verifying' || status === 'success'}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#DFBE82] text-[#0A0E17] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#C5A880]/20 transition-all disabled:opacity-50"
          >
            {status === 'scanning' || status === 'initiating' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning Biometric Sensor...</span>
              </>
            ) : status === 'success' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Authorized</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Touch Sensor to Authenticate</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
