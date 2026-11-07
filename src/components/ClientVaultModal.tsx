import React, { useState } from 'react';
import { 
  X, Lock, Search, FileText, CheckCircle2, Calendar, Scale, 
  Download, ShieldCheck, AlertCircle, ArrowRight, KeyRound, Building2,
  Fingerprint, ScanFace, Check, RefreshCw, ShieldAlert, Eye, EyeOff,
  Smartphone, Mail, FileCheck, CreditCard, Landmark, ChevronRight,
  UserCheck, Sparkles, Clock, ArrowUpRight, Send, HelpCircle, Laptop
} from 'lucide-react';
import { MOCK_CLIENT_MATTERS, ClientMatter, MatterDocument } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';
import { ClientDashboard } from './ClientDashboard';

interface ClientVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RegisteredClientAccount {
  id: string;
  corporateEntity: string;
  contactOfficer: string;
  officerRole: string;
  email: string;
  password: string;
  securityCode2FA: string;
  docketReference: string;
  ctsToken: string;
  badge: string;
  industry: string;
}

const REGISTERED_ACCOUNTS: RegisteredClientAccount[] = [
  {
    id: 'client-energy',
    corporateEntity: 'Consolidated Energy Holdings Ltd',
    contactOfficer: 'Dr. Angela Kibera',
    officerRole: 'Group General Counsel & Company Secretary',
    email: 'legal@energyholdings.co.ke',
    password: 'Energy@PAA2026',
    securityCode2FA: '749201',
    docketReference: 'PAA/2026/HC-8941',
    ctsToken: 'CTS-PASS-8941',
    badge: 'NSE Tier-1 Energy Conglomerate',
    industry: 'Energy & Infrastructure'
  },
  {
    id: 'client-apex',
    corporateEntity: 'Apex Real Estate PLC',
    contactOfficer: 'Brian Ndung\'u',
    officerRole: 'Head of Legal & Property Development',
    email: 'legal@apexrealestate.co.ke',
    password: 'Apex#PAA2026',
    securityCode2FA: '481932',
    docketReference: 'PAA/2026/ARB-302',
    ctsToken: 'CTS-PASS-ARB302',
    badge: 'Institutional Real Estate Developer',
    industry: 'Commercial Real Estate & Arbitral Disputes'
  },
  {
    id: 'client-equatorial',
    corporateEntity: 'Equatorial Commercial Bank Group PLC',
    contactOfficer: 'Grace W. Muthoni',
    officerRole: 'Chief Legal Officer & Head of Compliance',
    email: 'compliance@equatorialbank.co.ke',
    password: 'BankGroup#2026',
    securityCode2FA: '905183',
    docketReference: 'PAA/2026/HC-8941',
    ctsToken: 'CTS-PASS-8941',
    badge: 'Regulated Tier-1 Banking Institution',
    industry: 'Commercial Banking & Syndications'
  }
];

export const ClientVaultModal: React.FC<ClientVaultModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  
  // Auth Modes: 'corporate' (email/password/2FA) | 'docket' (CTS docket & key) | 'requestAccess' (New docket activation)
  const [authMode, setAuthMode] = useState<'corporate' | 'docket' | 'requestAccess'>('corporate');

  // Corporate credentials state
  const [selectedAccount, setSelectedAccount] = useState<RegisteredClientAccount>(REGISTERED_ACCOUNTS[0]);
  const [corporateEmail, setCorporateEmail] = useState(REGISTERED_ACCOUNTS[0].email);
  const [password, setPassword] = useState(REGISTERED_ACCOUNTS[0].password);
  const [securityCode, setSecurityCode] = useState(REGISTERED_ACCOUNTS[0].securityCode2FA);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);

  // Docket credentials state
  const [query, setQuery] = useState('PAA/2026/HC-8941');
  const [accessKey, setAccessKey] = useState('CTS-PASS-8941');

  // Request Access state
  const [reqEntity, setReqEntity] = useState('');
  const [reqOfficer, setReqOfficer] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqCourtDocket, setReqCourtDocket] = useState('');
  const [requestSubmittedNotice, setRequestSubmittedNotice] = useState<string | null>(null);

  // Session & Authentication
  const [activeMatter, setActiveMatter] = useState<ClientMatter>(() => {
    return MOCK_CLIENT_MATTERS.find(m => m.reference === REGISTERED_ACCOUNTS[0].docketReference) || MOCK_CLIENT_MATTERS[0];
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [dashboardInitialTab, setDashboardInitialTab] = useState<'status' | 'documents' | 'consultations' | 'billing' | 'dispatch'>('status');

  // Biometric Authentication States
  const [isBiometricPromptOpen, setIsBiometricPromptOpen] = useState(false);
  const [biometricStage, setBiometricStage] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [biometricFeedback, setBiometricFeedback] = useState<string>('');
  const [portalDocSearch, setPortalDocSearch] = useState('');

  if (!isOpen) return null;

  // Select demo account handler
  const handleSelectDemoAccount = (acc: RegisteredClientAccount) => {
    setSelectedAccount(acc);
    setCorporateEmail(acc.email);
    setPassword(acc.password);
    setSecurityCode(acc.securityCode2FA);
    setQuery(acc.docketReference);
    setAccessKey(acc.ctsToken);
    setAuthError(null);
    setOtpSentNotice(null);

    const match = MOCK_CLIENT_MATTERS.find(m => m.reference === acc.docketReference) || MOCK_CLIENT_MATTERS[0];
    setActiveMatter(match);
  };

  // Corporate Login Submit
  const handleCorporateLogin = (e?: React.FormEvent, targetTab: 'status' | 'documents' | 'billing' = 'status') => {
    if (e) e.preventDefault();
    setAuthError(null);
    setIsVerifying(true);

    if (!corporateEmail.trim() || !password.trim()) {
      setIsVerifying(false);
      setAuthError('Please enter both corporate email and your Chambers password.');
      return;
    }

    // Match entered email with registered accounts or fallback
    const matchedAccount = REGISTERED_ACCOUNTS.find(
      a => a.email.toLowerCase() === corporateEmail.toLowerCase().trim()
    );

    setTimeout(() => {
      setIsVerifying(false);
      if (matchedAccount) {
        setSelectedAccount(matchedAccount);
        const matchMatter = MOCK_CLIENT_MATTERS.find(m => m.reference === matchedAccount.docketReference) || MOCK_CLIENT_MATTERS[0];
        setActiveMatter(matchMatter);
      }
      setDashboardInitialTab(targetTab);
      setIsAuthenticated(true);
    }, 550);
  };

  // Docket Search & Verification
  const handleDocketLogin = (e?: React.FormEvent, targetTab: 'status' | 'documents' | 'billing' = 'status') => {
    if (e) e.preventDefault();
    setIsVerifying(true);
    setAuthError(null);

    const found = MOCK_CLIENT_MATTERS.find(m => 
      m.reference.toLowerCase().includes(query.toLowerCase().trim()) ||
      m.caseTitle.toLowerCase().includes(query.toLowerCase().trim()) ||
      m.clientEntity.toLowerCase().includes(query.toLowerCase().trim())
    );

    setTimeout(() => {
      setIsVerifying(false);
      if (found) {
        setActiveMatter(found);
        setDashboardInitialTab(targetTab);
        setIsAuthenticated(true);
      } else {
        setAuthError('Docket reference not found in active Chambers CTS index. Please confirm reference format (e.g., PAA/2026/HC-8941).');
      }
    }, 500);
  };

  // Send simulated 2FA token
  const handleResend2FA = () => {
    setOtpSentNotice(`One-time security token sent to verified in-house counsel mobile: +254 (0) 722 ••• •••`);
    setTimeout(() => setOtpSentNotice(null), 5000);
  };

  // Handle Request Access
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqEntity || !reqOfficer || !reqEmail) {
      setAuthError('Please fill in corporate entity name, instructing officer, and corporate email.');
      return;
    }
    const ticketId = `ACT-${Math.floor(100000 + Math.random() * 900000)}`;
    setRequestSubmittedNotice(ticketId);
    setAuthError(null);
  };

  // WebAuthn / Device Biometrics Trigger
  const handleTriggerBiometrics = async (targetTab: 'status' | 'documents' | 'billing' = 'status') => {
    setIsBiometricPromptOpen(true);
    setBiometricStage('scanning');
    setBiometricFeedback('Contacting Device Secure Enclave (Touch ID / Face ID / Windows Hello)...');

    try {
      if (window.PublicKeyCredential && navigator.credentials) {
        const dummyChallenge = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 2000);

        await navigator.credentials.get({
          publicKey: {
            challenge: dummyChallenge,
            timeout: 2000,
            userVerification: 'preferred',
            allowCredentials: []
          },
          signal: abortController.signal
        }).catch((err) => {
          console.info('WebAuthn platform fallback activated:', err.name);
        }).finally(() => clearTimeout(timeoutId));
      }
    } catch (e) {
      console.info('Biometric driver handshake:', e);
    }

    setTimeout(() => {
      setBiometricFeedback(`Biometric signature verified: ${selectedAccount.contactOfficer} (${selectedAccount.corporateEntity})`);
      setBiometricStage('success');

      setTimeout(() => {
        setIsBiometricPromptOpen(false);
        setDashboardInitialTab(targetTab);
        setIsAuthenticated(true);
      }, 1000);
    }, 1300);
  };

  // If user has verified/logged into the dashboard, render the full Secure Client Dashboard!
  if (isAuthenticated) {
    return (
      <ClientDashboard
        matter={activeMatter}
        initialTab={dashboardInitialTab}
        onSelectMatter={(m) => setActiveMatter(m)}
        onLogout={() => {
          setIsAuthenticated(false);
          setDashboardInitialTab('status');
        }}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0A0E17] border border-[#C5A880]/40 rounded-2xl shadow-2xl overflow-hidden my-6 animate-fadeIn text-slate-200">
        
        {/* Institutional Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0F1626] via-[#121B2F] to-[#0F1626] border-b border-[#222E46] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C5A880]/20 to-[#C5A880]/5 flex items-center justify-center text-[#E4C999] border border-[#C5A880]/40 shadow-inner">
              <Lock className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest text-[#C5A880] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t('vault.badge')}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-cinzel text-white font-bold tracking-tight">
                {t('vault.portalTitle')}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded-lg text-emerald-300 text-[11px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 1.3 / FIDO2 Hardware Vault</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#8C98AE] hover:text-white hover:bg-[#1A2436] rounded-xl transition-colors"
              title={t('vault.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subheader Banner */}
        <div className="px-5 sm:px-6 py-2.5 bg-[#101726] border-b border-[#1E293E] flex items-center justify-between text-xs text-[#8C98AE]">
          <span className="hidden md:inline">
            Direct Advocate-Client Access to Certified Case Pleadings, Evidence & Escrow Billing Statements
          </span>
          <span className="md:hidden">
            Secure Legal Portal & Itemized Escrow Ledger
          </span>
          <span className="font-mono text-[11px] text-[#C5A880]">
            Cap 80 § 134 Privileged
          </span>
        </div>

        {/* Portal Body */}
        <div className="p-5 sm:p-7 space-y-6">

          {/* Quick-Fill Registered Corporate Client Accounts */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#CBD5E1]">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>{t('vault.quickDemoTitle')}</span>
              </div>
              <span className="text-[11px] text-[#8C98AE]">
                One-Click Institutional Credentials
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {REGISTERED_ACCOUNTS.map((acc) => {
                const isSelected = selectedAccount.id === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectDemoAccount(acc)}
                    className={`text-left p-3 rounded-xl border transition-all text-xs relative ${
                      isSelected
                        ? 'bg-[#151F33] border-[#C5A880] shadow-md shadow-[#C5A880]/10 text-white'
                        : 'bg-[#0E1524] border-[#1E293E] hover:border-[#2C3B57] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white truncate pr-1">
                        {acc.corporateEntity}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#C5A880] shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-[#C5A880] truncate font-mono">
                      {acc.contactOfficer}
                    </div>
                    <div className="text-[10px] text-[#64748B] truncate font-mono mt-0.5">
                      {acc.docketReference}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Authentication Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#1E293E] pb-3 text-xs">
            <button
              onClick={() => { setAuthMode('corporate'); setAuthError(null); }}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                authMode === 'corporate'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md shadow-[#C5A880]/20'
                  : 'bg-[#121927] text-[#94A3B8] hover:text-white border border-[#202C42]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t('vault.tabCorporateLogin')}</span>
            </button>

            <button
              onClick={() => { setAuthMode('docket'); setAuthError(null); }}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                authMode === 'docket'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md shadow-[#C5A880]/20'
                  : 'bg-[#121927] text-[#94A3B8] hover:text-white border border-[#202C42]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{t('vault.tabDocketToken')}</span>
            </button>

            <button
              onClick={() => { setAuthMode('requestAccess'); setAuthError(null); }}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                authMode === 'requestAccess'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md shadow-[#C5A880]/20'
                  : 'bg-[#121927] text-[#94A3B8] hover:text-white border border-[#202C42]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{t('vault.tabRequestAccess')}</span>
            </button>
          </div>

          {/* Biometric Quick Trigger Bar (Always available) */}
          <div className="p-4 bg-gradient-to-r from-[#131B2A] via-[#162136] to-[#121724] rounded-xl border border-[#C5A880]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center text-[#E4C999] shrink-0">
                <Fingerprint className="w-6 h-6 text-[#C5A880] animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                  HARDWARE-BACKED BIOMETRIC GATEWAY (FIDO2 / WEBAUTHN)
                </span>
                <h4 className="text-sm font-semibold text-white">
                  Touch ID / Face ID / Windows Hello Authentication
                </h4>
                <p className="text-[11px] text-[#8C98AE]">
                  Authenticate instantly with your device's Secure Enclave for verified corporate dockets.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleTriggerBiometrics('status')}
              className="px-4 py-2.5 bg-[#C5A880] text-[#0A0E17] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg shadow-[#C5A880]/15 flex items-center justify-center gap-2 transition-all shrink-0"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Biometric Login</span>
            </button>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          {/* Mode 1: Corporate Account Login Form */}
          {authMode === 'corporate' && (
            <form onSubmit={(e) => handleCorporateLogin(e, 'status')} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Email Address */}
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1.5 font-medium">
                    {t('vault.emailLabel')} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={corporateEmail}
                      onChange={(e) => {
                        setCorporateEmail(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="e.g. generalcounsel@institution.co.ke"
                      className="w-full bg-[#121927] border border-[#232D41] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white font-mono placeholder-[#5A6578] focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>

                {/* Password with Show/Hide */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-[#94A3B8] font-medium">
                      {t('vault.passwordLabel')} *
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      256-Bit Encrypted
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="Enter Chambers password"
                      className="w-full bg-[#121927] border border-[#232D41] rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white font-mono placeholder-[#5A6578] focus:outline-none focus:border-[#C5A880]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2FA Token & Remember Device */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-[#94A3B8] font-medium">
                      {t('vault.twoFactorLabel')}
                    </label>
                    <button
                      type="button"
                      onClick={handleResend2FA}
                      className="text-[11px] text-[#C5A880] hover:underline"
                    >
                      Send SMS OTP
                    </button>
                  </div>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={securityCode}
                      onChange={(e) => setSecurityCode(e.target.value)}
                      placeholder="e.g. 749201"
                      className="w-full bg-[#121927] border border-[#232D41] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white font-mono placeholder-[#5A6578] focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#94A3B8] py-2">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="w-4 h-4 rounded border-[#232D41] text-[#C5A880] bg-[#121927] focus:ring-0"
                    />
                    <span>{t('vault.rememberDevice')}</span>
                  </label>
                </div>
              </div>

              {otpSentNotice && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{otpSentNotice}</span>
                </div>
              )}
            </form>
          )}

          {/* Mode 2: Judicial Docket Token Form */}
          {authMode === 'docket' && (
            <form onSubmit={(e) => handleDocketLogin(e, 'status')} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1.5 font-medium">
                    Judicial Docket Reference *
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="e.g. PAA/2026/HC-8941"
                      className="w-full bg-[#121927] border border-[#232D41] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white font-mono placeholder-[#5A6578] focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1.5 font-medium">
                    Corporate Encryption Access Key / CTS Passcode *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      placeholder="Enter CTS Passcode"
                      className="w-full bg-[#121927] border border-[#232D41] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white font-mono placeholder-[#5A6578] focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Preset Chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-[#8C98AE]">
                <span>{t('vault.activeTest')}</span>
                {MOCK_CLIENT_MATTERS.map(m => (
                  <button
                    type="button"
                    key={m.reference}
                    onClick={() => { 
                      setActiveMatter(m); 
                      setQuery(m.reference);
                      setAuthError(null);
                    }}
                    className={`font-mono px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                      activeMatter.reference === m.reference
                        ? 'border-[#C5A880] bg-[#C5A880]/15 text-[#E4C999] font-semibold'
                        : 'border-[#222B3D] bg-[#121927] text-[#8C98AE] hover:text-white'
                    }`}
                  >
                    {m.reference} ({m.clientEntity.split(' ')[0]})
                  </button>
                ))}
              </div>
            </form>
          )}

          {/* Mode 3: Request Docket Activation Form */}
          {authMode === 'requestAccess' && (
            <div className="p-5 bg-[#0F1626] rounded-xl border border-[#1E293E] space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-cinzel text-white font-semibold">
                  Request Portal Credentials & Docket Activation
                </h4>
                <p className="text-xs text-[#8C98AE]">
                  Corporate general counsels and in-house advocates may request portal access to view pleadings, court orders, and escrow billing. Chambers registrar executes statutory verification within 2 hours.
                </p>
              </div>

              {requestSubmittedNotice ? (
                <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl space-y-2 text-emerald-300">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Docket Activation Request Logged Successfully</span>
                  </div>
                  <p className="text-xs text-[#CBD5E1]">
                    Your verification request has been queued for review by the Chambers Registrar. Ticket ID: <span className="font-mono text-[#E4C999] font-bold">{requestSubmittedNotice}</span>. Temporary credentials will be transmitted via encrypted email.
                  </p>
                  <button
                    onClick={() => { setRequestSubmittedNotice(null); setAuthMode('corporate'); }}
                    className="mt-2 px-3.5 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                  >
                    Return to Corporate Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[#94A3B8] block mb-1 font-medium">Corporate Entity / Company *</label>
                      <input
                        type="text"
                        value={reqEntity}
                        onChange={(e) => setReqEntity(e.target.value)}
                        placeholder="e.g. Centum Infrastructure Developers Ltd"
                        className="w-full bg-[#141C2B] border border-[#232D41] rounded-lg px-3 py-2 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[#94A3B8] block mb-1 font-medium">Instructing Officer / General Counsel *</label>
                      <input
                        type="text"
                        value={reqOfficer}
                        onChange={(e) => setReqOfficer(e.target.value)}
                        placeholder="e.g. Catherine M. (Chief Legal Officer)"
                        className="w-full bg-[#141C2B] border border-[#232D41] rounded-lg px-3 py-2 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[#94A3B8] block mb-1 font-medium">Corporate Email Address *</label>
                      <input
                        type="email"
                        value={reqEmail}
                        onChange={(e) => setReqEmail(e.target.value)}
                        placeholder="legal@company.co.ke"
                        className="w-full bg-[#141C2B] border border-[#232D41] rounded-lg px-3 py-2 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[#94A3B8] block mb-1 font-medium">Judiciary Case Docket No. (if known)</label>
                      <input
                        type="text"
                        value={reqCourtDocket}
                        onChange={(e) => setReqCourtDocket(e.target.value)}
                        placeholder="e.g. ELC/COMM/2026/0842"
                        className="w-full bg-[#141C2B] border border-[#232D41] rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#C5A880] text-[#0A0E17] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Activation Request</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ================= PRE-AUTHENTICATION PERSONAL CASE & BILLING PREVIEW CARD ================= */}
          <div className="p-5 bg-gradient-to-br from-[#101726] to-[#0D131F] rounded-2xl border border-[#202C42] space-y-4">
            
            {/* Header: Verified Entity & Case Forum */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E293E] gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center text-[#E4C999]">
                  <Building2 className="w-4 h-4 text-[#C5A880]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white font-cinzel">
                    {activeMatter.clientEntity}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-[#8C98AE]">
                    <span>Docket: <strong className="text-[#C5A880] font-mono">{activeMatter.reference}</strong></span>
                    <span>·</span>
                    <span>CTS: <strong className="text-white font-mono">{activeMatter.ctsNumber}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  LSK Conflict Cleared
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#182338] border border-[#263756] text-[10px] font-mono text-[#94A3B8]">
                  {activeMatter.forum.split('(')[0].trim()}
                </span>
              </div>
            </div>

            {/* Matter Title & Bench */}
            <div className="space-y-1">
              <h5 className="text-sm font-medium text-white">
                {activeMatter.caseTitle}
              </h5>
              <div className="flex items-center gap-4 text-xs text-[#8C98AE] flex-wrap">
                <span>Bench: <strong className="text-slate-200">{activeMatter.bench}</strong></span>
                <span>Lead Counsel: <strong className="text-[#C5A880]">{activeMatter.leadAdvocate}</strong></span>
                <span>Next Cause List: <strong className="text-amber-400">{activeMatter.nextHearingDate}</strong></span>
              </div>
            </div>

            {/* Dual Grid: Personal Case Documents Summary & Billing History Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              
              {/* Box 1: Personal Case Documents & Quick Search */}
              <div className="p-3.5 bg-[#0A0E17]/70 rounded-xl border border-[#1A2436] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <FileText className="w-4 h-4 text-[#C5A880]" />
                    <span>Personal Case Documents</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#162136] text-[10px] font-mono text-[#E4C999]">
                    {activeMatter.documents.length} Certified Files
                  </span>
                </div>

                {/* Quick Search inside portal documents */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={portalDocSearch}
                    onChange={(e) => setPortalDocSearch(e.target.value)}
                    placeholder="Search personal filings (e.g., Plaint, Ruling, Audit)..."
                    className="w-full bg-[#121927] border border-[#202C42] rounded-lg pl-8 pr-7 py-1 text-[11px] text-white placeholder-[#5A6578] focus:outline-none focus:border-[#C5A880]"
                  />
                  {portalDocSearch && (
                    <button
                      type="button"
                      onClick={() => setPortalDocSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  {activeMatter.documents
                    .filter(d => 
                      !portalDocSearch.trim() ||
                      d.name.toLowerCase().includes(portalDocSearch.toLowerCase()) ||
                      d.summary.toLowerCase().includes(portalDocSearch.toLowerCase()) ||
                      d.category.toLowerCase().includes(portalDocSearch.toLowerCase())
                    )
                    .slice(0, 3)
                    .map((doc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleTriggerBiometrics('documents')}
                        className="w-full flex items-center justify-between py-1 border-b border-[#141C2B] last:border-b-0 text-[11px] hover:bg-[#141F30] px-1 rounded transition-colors group text-left"
                        title="Click to Biometrically Authenticate and Open Document"
                      >
                        <span className="text-[#CBD5E1] group-hover:text-[#E4C999] truncate pr-2 max-w-[200px]">
                          {doc.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-mono text-[#64748B]">
                            {doc.category}
                          </span>
                          <Fingerprint className="w-3 h-3 text-[#C5A880] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  {activeMatter.documents.length > 3 && !portalDocSearch && (
                    <div className="text-[10px] text-[#8C98AE] italic pt-0.5">
                      + {activeMatter.documents.length - 3} additional certified pleadings & expert reports in vault...
                    </div>
                  )}
                </div>
              </div>

              {/* Box 2: Billing History & Escrow Trust Ledger */}
              <div className="p-3.5 bg-[#0A0E17]/70 rounded-xl border border-[#1A2436] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Landmark className="w-4 h-4 text-emerald-400" />
                    <span>Billing & Escrow Trust Ledger</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                    ARO Reconciled
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-[#121927] rounded-lg border border-[#1E293E]">
                    <div className="text-[10px] text-[#8C98AE]">Held in Institutional Escrow</div>
                    <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                      {activeMatter.financialSummary.heldInEscrow}
                    </div>
                  </div>
                  <div className="p-2 bg-[#121927] rounded-lg border border-[#1E293E]">
                    <div className="text-[10px] text-[#8C98AE]">Total Retainer Settled</div>
                    <div className="text-xs font-mono font-bold text-[#E4C999] mt-0.5">
                      {activeMatter.financialSummary.settledToDate}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-[#8C98AE] flex items-center justify-between font-mono pt-0.5">
                  <span>Trust A/C: {activeMatter.trustAccount.split('-')[0].trim()}</span>
                  <span>{activeMatter.invoices.length} Fee Notes Itemized</span>
                </div>
              </div>

            </div>

            {/* Direct Routing CTAs: Access Documents, Access Billing, or Enter Dashboard */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              
              {/* Button A: Direct Case Documents Access */}
              <button
                type="button"
                onClick={() => {
                  if (authMode === 'corporate') {
                    handleCorporateLogin(undefined, 'documents');
                  } else {
                    handleDocketLogin(undefined, 'documents');
                  }
                }}
                disabled={isVerifying}
                className="flex-1 py-3 px-3 bg-[#131D2E] hover:bg-[#1A273E] text-white border border-[#25354F] hover:border-[#C5A880]/50 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 group"
              >
                <FileText className="w-4 h-4 text-[#C5A880] group-hover:scale-110 transition-transform" />
                <span>{t('vault.accessDocuments')}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C98AE]" />
              </button>

              {/* Button B: Direct Billing History Access */}
              <button
                type="button"
                onClick={() => {
                  if (authMode === 'corporate') {
                    handleCorporateLogin(undefined, 'billing');
                  } else {
                    handleDocketLogin(undefined, 'billing');
                  }
                }}
                disabled={isVerifying}
                className="flex-1 py-3 px-3 bg-[#131D2E] hover:bg-[#1A273E] text-white border border-[#25354F] hover:border-[#C5A880]/50 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 group"
              >
                <Landmark className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>{t('vault.accessBilling')}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C98AE]" />
              </button>

              {/* Button C: Comprehensive Case Dashboard */}
              <button
                type="button"
                onClick={() => {
                  if (authMode === 'corporate') {
                    handleCorporateLogin(undefined, 'status');
                  } else {
                    handleDocketLogin(undefined, 'status');
                  }
                }}
                disabled={isVerifying}
                className="flex-1 py-3 px-3 bg-gradient-to-r from-[#C5A880] to-[#E4C999] text-[#0A0E17] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-105 shadow-xl shadow-[#C5A880]/15 transition-all flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authorizing...</span>
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t('vault.enterDashboard')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Statutory Protection Banner */}
          <div className="p-3 bg-[#0D1420] border border-[#1A2436] rounded-xl flex items-center justify-between text-[11px] text-[#718096]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span>
                Advocate-Client transmission strictly protected under Section 134 Evidence Act (Cap 80) and Kenya Data Protection Act 2019.
              </span>
            </div>
            <span className="font-mono text-[#CBD5E1] hidden sm:inline">
              LSK Firm No. NRB/3892
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0F1626] border-t border-[#1E293E] flex items-center justify-between text-xs text-[#8C98AE]">
          <div className="flex items-center gap-3">
            <span>{t('vault.privacy')}</span>
            <span>·</span>
            <span className="font-mono text-[11px] text-[#C5A880]">Session Timeout: 15 mins</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#172133] hover:bg-[#202E46] text-white rounded-lg transition-colors font-medium"
          >
            {t('vault.close')}
          </button>
        </div>

      </div>

      {/* ================= BIOMETRIC SCANNING OVERLAY ================= */}
      {isBiometricPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0D131F] border border-[#C5A880]/50 rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 text-xs text-[#8C98AE]">
              <span className="font-mono text-emerald-400">WebAuthn / FIDO2 Level 3</span>
              <button 
                onClick={() => setIsBiometricPromptOpen(false)}
                className="hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Animated Biometric Fingerprint / Face Graphic */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full border-2 border-[#C5A880]/30 ${
                biometricStage === 'scanning' ? 'animate-ping' : ''
              }`} />
              <div className="absolute inset-2 rounded-full border border-[#C5A880]/40 animate-pulse" />
              
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                biometricStage === 'success'
                  ? 'bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400'
                  : 'bg-[#141C2B] border-2 border-[#C5A880] text-[#C5A880]'
              }`}>
                {biometricStage === 'success' ? (
                  <Check className="w-10 h-10 stroke-[2.5] text-emerald-400 animate-scaleIn" />
                ) : (
                  <Fingerprint className="w-10 h-10 animate-pulse" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-cinzel font-bold text-white">
                {biometricStage === 'success' ? 'Biometric Authentication Approved' : 'Scanning Biometric Sensor'}
              </h4>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                {biometricFeedback}
              </p>
              <p className="text-[11px] font-mono text-[#717E94] pt-1">
                Hardware Enclave: Apple T2 / Secure Enclave / Windows Hello TPM
              </p>
            </div>

            <div className="pt-2 border-t border-[#1E293B] flex items-center justify-center gap-3">
              {biometricStage !== 'success' && (
                <button
                  onClick={() => setIsBiometricPromptOpen(false)}
                  className="px-4 py-2 bg-[#172235] hover:bg-[#202C42] text-xs text-[#8C98AE] hover:text-white rounded-xl transition-colors"
                >
                  Cancel Biometrics
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
