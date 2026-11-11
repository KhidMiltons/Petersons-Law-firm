import React, { useState, useMemo } from 'react';
import { 
  X, Lock, ShieldCheck, FileText, CheckCircle2, Clock, 
  Download, Eye, ArrowRight, KeyRound, Building2, Fingerprint, 
  Check, AlertCircle, RefreshCw, Sparkles, Filter, Search, 
  LogOut, Scale, ChevronRight, PenTool, Highlighter, ScanText,
  Bell, BellRing, Calendar, CalendarClock, Activity, Layers,
  CheckCheck, Landmark, AlertTriangle, ExternalLink, ArrowUpRight,
  Key, Cpu, Usb, ScanFace, Trash2, Plus, Shield
} from 'lucide-react';
import { MOCK_CLIENT_MATTERS, ClientMatter, MatterDocument, MatterChronologyStep } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { BiometricVerificationModal } from './BiometricVerificationModal';
import { SecureDocumentAnnotationModal } from './SecureDocumentAnnotationModal';
import { WebAuthnRegistrationModal } from './WebAuthnRegistrationModal';
import { 
  WebAuthnPasskey, 
  getRegisteredPasskeys, 
  deleteRegisteredPasskey 
} from '../types/webauthn';

interface SecureClientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullDashboard?: (matter: ClientMatter) => void;
}

interface DemoAccount {
  id: string;
  entity: string;
  officer: string;
  role: string;
  email: string;
  password: string;
  code2FA: string;
  docket: string;
}

export interface PortalNotification {
  id: string;
  type: 'document_upload' | 'case_status' | 'hearing_scheduled';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  priority: 'Urgent' | 'High' | 'Normal';
  targetDocName?: string;
  courtRef?: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'energy',
    entity: 'Consolidated Energy Holdings Ltd',
    officer: 'Dr. Angela Kibera',
    role: 'Group General Counsel',
    email: 'legal@energyholdings.co.ke',
    password: 'Energy@PAA2026',
    code2FA: '749201',
    docket: 'PAA/2026/HC-8941'
  },
  {
    id: 'apex',
    entity: 'Apex Real Estate PLC',
    officer: 'Brian Ndung\'u',
    role: 'Head of Legal & Property',
    email: 'legal@apexrealestate.co.ke',
    password: 'Apex#PAA2026',
    code2FA: '481932',
    docket: 'PAA/2026/ARB-302'
  },
  {
    id: 'bank',
    entity: 'Equatorial Commercial Bank Group',
    officer: 'Grace W. Muthoni',
    role: 'Chief Legal Officer',
    email: 'compliance@equatorialbank.co.ke',
    password: 'BankGroup#2026',
    code2FA: '905183',
    docket: 'PAA/2026/HC-8941'
  }
];

const INITIAL_NOTIFICATIONS: PortalNotification[] = [
  {
    id: 'notif-1',
    type: 'document_upload',
    title: 'New Certified Document Uploaded',
    description: 'Lead Senior Counsel Milton Angwenyi uploaded "Originating Plaint & Conservatory Application.pdf" with SHA-256 CTS seal.',
    timestamp: '14 minutes ago',
    isRead: false,
    priority: 'Urgent',
    targetDocName: 'Originating Plaint & Conservatory Application.pdf',
    courtRef: 'REG-MIL-2026-1014'
  },
  {
    id: 'notif-2',
    type: 'case_status',
    title: 'Judiciary CTS Case Status Updated',
    description: 'Milimani Commercial Admiralty Court admitted Claimant\'s Certificate of Urgency. Interlocutory hearing confirmed.',
    timestamp: '2 hours ago',
    isRead: false,
    priority: 'High',
    courtRef: 'CTS-HC-COMM-8941'
  },
  {
    id: 'notif-3',
    type: 'hearing_scheduled',
    title: 'Bench Directions & Virtual Hearing Docket',
    description: 'Lady Justice Wambui scheduled Case Management Conference. Virtual court link generated and escrow security deposited.',
    timestamp: 'Yesterday at 16:45',
    isRead: false,
    priority: 'Normal',
    courtRef: 'CAUSE-LIST-441'
  },
  {
    id: 'notif-4',
    type: 'document_upload',
    title: 'FIDIC Sub-Clause Delay Matrix Admitted',
    description: 'Bureau Veritas Technical Assessment and Dispute Adjudication Board Exhibit D-01 signed under Section 106B Evidence Act.',
    timestamp: '03 Nov 2026',
    isRead: true,
    priority: 'Normal',
    targetDocName: 'FIDIC Contract Sub-Clause 8.7 Delay Quantum Assessment.pdf',
    courtRef: 'EXH-BV-2026-09'
  }
];

export const SecureClientPortalModal: React.FC<SecureClientPortalModalProps> = ({
  isOpen,
  onClose,
  onOpenFullDashboard
}) => {
  const { t } = useLanguage();

  // Authentication & WebAuthn Biometric State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [registeredPasskeys, setRegisteredPasskeys] = useState<WebAuthnPasskey[]>(() => getRegisteredPasskeys());
  const [email, setEmail] = useState<string>(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState<string>(DEMO_ACCOUNTS[0].password);
  const [code2FA, setCode2FA] = useState<string>(DEMO_ACCOUNTS[0].code2FA);
  const [selectedDemoId, setSelectedDemoId] = useState<string>(DEMO_ACCOUNTS[0].id);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState<string>('');

  const activeDemoAccount = useMemo(() => {
    return DEMO_ACCOUNTS.find(a => a.id === selectedDemoId) || DEMO_ACCOUNTS[0];
  }, [selectedDemoId]);

  // Enrolled passkeys for the selected officer
  const activeOfficerPasskeys = useMemo(() => {
    return registeredPasskeys.filter(
      k => k.userEmail.toLowerCase() === activeDemoAccount.email.toLowerCase() ||
           k.officerName.toLowerCase() === activeDemoAccount.officer.toLowerCase()
    );
  }, [registeredPasskeys, activeDemoAccount]);

  // Portal Navigation Tabs: 'documents' | 'timeline' | 'notifications' | 'security'
  const [activeTab, setActiveTab] = useState<'documents' | 'timeline' | 'notifications' | 'security'>('documents');

  // Selected Matter & Documents State
  const [activeMatter, setActiveMatter] = useState<ClientMatter>(() => {
    return MOCK_CLIENT_MATTERS.find(m => m.reference === DEMO_ACCOUNTS[0].docket) || MOCK_CLIENT_MATTERS[0];
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewDoc, setPreviewDoc] = useState<MatterDocument | null>(null);
  const [annotatingDoc, setAnnotatingDoc] = useState<MatterDocument | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Notification State
  const [notifications, setNotifications] = useState<PortalNotification[]>(INITIAL_NOTIFICATIONS);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'document_upload' | 'case_status'>('all');
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'completed' | 'active'>('all');

  // Compute Unread Notifications Count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  if (!isOpen) return null;

  // Handle Quick Fill of Demo Accounts
  const handleSelectDemo = (demo: DemoAccount) => {
    setSelectedDemoId(demo.id);
    setEmail(demo.email);
    setPassword(demo.password);
    setCode2FA(demo.code2FA);
    setAuthError(null);

    const match = MOCK_CLIENT_MATTERS.find(m => m.reference === demo.docket) || MOCK_CLIENT_MATTERS[0];
    setActiveMatter(match);
  };

  // Mock Authentication Check
  const handleAuthenticate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both your corporate legal email and password.');
      return;
    }

    setIsVerifying(true);
    setVerificationStep('Verifying Chambers Registry & Section 134 privilege credentials...');

    setTimeout(() => {
      setVerificationStep('Validating 2FA security token & cryptographic CTS keys...');
      setTimeout(() => {
        const matched = DEMO_ACCOUNTS.find(
          a => a.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (matched) {
          const m = MOCK_CLIENT_MATTERS.find(mat => mat.reference === matched.docket) || MOCK_CLIENT_MATTERS[0];
          setActiveMatter(m);
        }

        setIsVerifying(false);
        setIsAuthenticated(true);
        setVerificationStep('');
      }, 600);
    }, 500);
  };

  // High-Security Biometric Authenticator Simulation (WebAuthn API / Passkey)
  const handleBiometricAuth = () => {
    setAuthError(null);
    setIsBiometricModalOpen(true);
  };

  const handleBiometricSuccess = () => {
    setIsBiometricModalOpen(false);
    setIsAuthenticated(true);
    const matched = DEMO_ACCOUNTS.find(a => a.id === selectedDemoId) || DEMO_ACCOUNTS[0];
    const m = MOCK_CLIENT_MATTERS.find(mat => mat.reference === matched.docket) || MOCK_CLIENT_MATTERS[0];
    setActiveMatter(m);
  };

  // Logout / Lock
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPreviewDoc(null);
    setAuthError(null);
    setActiveTab('documents');
  };

  // Mark specific notification as read
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Simulate new document upload or status update alert
  const handleSimulateNewAlert = () => {
    const newAlert: PortalNotification = {
      id: `notif-${Date.now()}`,
      type: 'case_status',
      title: 'Real-Time CTS Filing Acceptance',
      description: `High Court Commercial Registry logged Affidavit of Service for Docket ${activeMatter.reference}. Judicial timestamp recorded.`,
      timestamp: 'Just now',
      isRead: false,
      priority: 'Urgent',
      courtRef: `CTS-${Date.now().toString(36).toUpperCase()}`
    };
    setNotifications(prev => [newAlert, ...prev]);
    setDownloadNotice('New court filing notification received and badge updated.');
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  // Filter sensitive documents
  const filteredDocs = (activeMatter.documents || []).filter(doc => {
    const matchesCat = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesQuery = !searchQuery.trim() || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.signatory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.ctsHash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Filter notifications list
  const filteredNotifs = notifications.filter(n => {
    if (notifFilter === 'unread') return !n.isRead;
    if (notifFilter === 'document_upload') return n.type === 'document_upload';
    if (notifFilter === 'case_status') return n.type === 'case_status' || n.type === 'hearing_scheduled';
    return true;
  });

  // Filter chronology timeline
  const chronologySteps = activeMatter.chronology || [];
  const filteredTimeline = chronologySteps.filter(step => {
    if (timelineFilter === 'completed') return step.status === 'completed';
    if (timelineFilter === 'active') return step.status === 'current' || step.status === 'upcoming';
    return true;
  });

  // Handle Mock Download
  const handleDownloadDoc = (doc: MatterDocument) => {
    setDownloadNotice(`Decrypted and downloaded certified copy: "${doc.name}"`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
        <div className="relative w-full max-w-5xl bg-[#090D15] border border-[#C5A880]/40 rounded-2xl shadow-2xl overflow-hidden my-3 sm:my-8 text-slate-200 flex flex-col max-h-[94vh]">
          
          {/* Institutional Top Control Bar */}
          <div className="p-4 sm:p-5 bg-[#0F1626] border-b border-[#222E46] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center text-[#E4C999] shrink-0">
                <Lock className="w-5 h-5 text-[#C5A880]" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#C5A880]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Judiciary CTS &amp; Arbitration Registry</span>
                  </span>
                  <span>·</span>
                  <span className="text-emerald-400">Section 134 Privileged</span>
                </div>
                <h3 className="text-base sm:text-lg font-cinzel text-white font-bold tracking-wide">
                  {isAuthenticated ? `Client Portal · ${activeMatter.clientEntity}` : 'Secure Client Portal Login'}
                </h3>
              </div>
            </div>

            {/* Top Bar Actions & Interactive Notification Bell */}
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <>
                  {/* Interactive Notification Bell with Badge */}
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`relative p-2 rounded-xl border transition-all ${
                      activeTab === 'notifications'
                        ? 'bg-[#C5A880] text-[#0A0E17] border-[#C5A880]'
                        : 'bg-[#141C2B] hover:bg-[#1D273A] text-[#C5A880] border-[#222F46]'
                    }`}
                    title={`${unreadCount} unread case updates & document alerts`}
                  >
                    {unreadCount > 0 ? (
                      <BellRing className="w-4 h-4 animate-bounce" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 border-2 border-[#090D15] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141C2B] hover:bg-red-950/50 hover:text-red-300 border border-[#233148] hover:border-red-500/40 text-xs text-[#8C98AE] transition-all"
                    title="Lock Portal Session"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span className="hidden sm:inline">Lock Portal</span>
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-[#8C98AE] hover:text-white rounded-lg hover:bg-[#1A2538] transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Download & Alert Toast Notification */}
          {downloadNotice && (
            <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-5 py-2.5 text-xs text-emerald-200 flex items-center justify-between animate-fadeIn font-mono">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{downloadNotice}</span>
              </span>
              <button onClick={() => setDownloadNotice(null)} className="text-emerald-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Modal Body: Login View vs. Authenticated Portal */}
          {!isAuthenticated ? (
            /* ================= VIEW 1: MOCK AUTHENTICATION CHECK ================= */
            <div className="p-5 sm:p-8 overflow-y-auto space-y-6">
              
              {/* Security Shield Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#121B2B] to-[#141F32] border border-[#22314A] flex items-center justify-between text-xs text-[#CBD5E1]">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#C5A880] shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">Statutory Advocate-Client Confidentiality Gate</span>
                    <span className="text-[#8C98AE] text-[11px]">
                      Access to unredacted court pleadings, arbitral memorials, timeline stages, and status notifications is restricted to instructed corporate counsel.
                    </span>
                  </div>
                </div>
                <span className="hidden md:inline font-mono text-[11px] text-[#C5A880] shrink-0">
                  FIDO2 / TLS 1.3
                </span>
              </div>

              {/* Dedicated High-Security Biometric Passkey Gate (Web Authentication API) */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#152033] via-[#10192A] to-[#152033] border border-[#C5A880]/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-[#C5A880]/5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/40 flex items-center justify-center text-[#DFBE82] shrink-0">
                    <Fingerprint className="w-6 h-6 text-[#C5A880] animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#C5A880]">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>Web Authentication API</span>
                      </span>
                      <span>·</span>
                      <span className="text-emerald-400">KICA § 83B Passkey</span>
                      {activeOfficerPasskeys.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-300 font-bold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/40">
                            {activeOfficerPasskeys.length} Key Enrolled
                          </span>
                        </>
                      )}
                    </div>
                    <span className="font-semibold text-white block text-sm">
                      {activeOfficerPasskeys.length > 0 
                        ? `Enrolled Passkey: ${activeOfficerPasskeys[0].nickname}`
                        : 'Corporate Biometric Verification Enclave'}
                    </span>
                    <span className="text-[#9BA9BE] text-xs block">
                      {activeOfficerPasskeys.length > 0
                        ? `1-Tap sign-in with ${activeOfficerPasskeys[0].deviceType === 'fingerprint' ? 'Fingerprint (Touch ID)' : activeOfficerPasskeys[0].deviceType === 'faceid' ? 'Facial Recognition' : 'FIDO2 Security Key'}.`
                        : 'High-security hardware authentication via Touch ID, Face ID, Windows Hello, or FIDO2 Security Token.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#121927] hover:bg-[#1A2538] text-[#C5A880] hover:text-white border border-[#C5A880]/40 hover:border-[#C5A880] text-xs font-semibold transition-all shadow-sm group"
                    title="Enroll a new hardware biometric key (Touch ID, Windows Hello, YubiKey) using WebAuthn API"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C5A880] group-hover:scale-110 transition-transform" />
                    <span>Register Key</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBiometricAuth}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#E4C999] hover:brightness-110 text-[#0A0E17] font-bold text-xs uppercase tracking-wider transition-all shadow-md group"
                    title="Authenticate instantly using hardware biometric enclave"
                  >
                    <Fingerprint className="w-4 h-4 text-[#0A0E17] group-hover:scale-110 transition-transform" />
                    <span>{activeOfficerPasskeys.length > 0 ? 'Sign In with Passkey' : 'Verify with Biometrics'}</span>
                  </button>
                </div>
              </div>

              {/* Quick-Fill Demo Accounts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#BAC5D6] font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Quick-Select Registered Corporate Client (Demo):</span>
                  </span>
                  <span className="text-[11px] text-[#7E8D9F]">1-Click Credential Autofill</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {DEMO_ACCOUNTS.map((demo) => {
                    const isSelected = selectedDemoId === demo.id;
                    return (
                      <button
                        key={demo.id}
                        type="button"
                        onClick={() => handleSelectDemo(demo)}
                        className={`p-3 rounded-xl border text-left transition-all text-xs relative ${
                          isSelected
                            ? 'bg-[#152136] border-[#C5A880] shadow-md shadow-[#C5A880]/10 text-white'
                            : 'bg-[#0E1522] border-[#1C2738] hover:border-[#2A3B54] text-[#8C98AE] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold truncate text-white">{demo.entity}</span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-[#C5A880] shrink-0" />}
                        </div>
                        <div className="text-[11px] text-[#C5A880] font-mono truncate">{demo.officer}</div>
                        <div className="text-[10px] text-[#697992] truncate">{demo.role}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mock Authentication Form */}
              <form onSubmit={handleAuthenticate} className="space-y-4 pt-2 border-t border-[#1C263A]">
                {authError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Corporate Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#BAC5D6] flex items-center justify-between">
                      <span>Instructing Officer Email</span>
                      <span className="text-[10px] font-mono text-[#7888A0]">Encrypted SSO</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. legal@energyholdings.co.ke"
                      className="w-full bg-[#111724] border border-[#232F46] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#5A6578] focus:outline-none focus:border-[#C5A880]"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#BAC5D6] flex items-center justify-between">
                      <span>Chambers Access Password</span>
                      <span className="text-[10px] font-mono text-[#7888A0]">KICA § 83B</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#111724] border border-[#232F46] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#5A6578] focus:outline-none focus:border-[#C5A880]"
                      required
                    />
                  </div>
                </div>

                {/* 2FA Token Strip */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#BAC5D6] flex items-center justify-between">
                    <span>2FA Hardware Security Passcode</span>
                    <span className="text-[10px] font-mono text-emerald-400">Active Token</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <KeyRound className="w-4 h-4 text-[#C5A880] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={code2FA}
                        onChange={(e) => setCode2FA(e.target.value)}
                        placeholder="6-digit verification token"
                        className="w-full bg-[#111724] border border-[#232F46] rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-mono text-white placeholder-[#5A6578] focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                    <span className="px-3 py-2 rounded-xl bg-[#131B2A] border border-[#212E44] text-[11px] font-mono text-[#A6B4CD]">
                      SMS: +254 (0) 722 •••
                    </span>
                  </div>
                </div>

                {/* Verification Spinner Feedback */}
                {isVerifying && (
                  <div className="p-3 bg-[#111A29] rounded-xl border border-[#C5A880]/30 text-xs text-[#E4C999] flex items-center gap-2.5 animate-fadeIn">
                    <RefreshCw className="w-4 h-4 text-[#C5A880] animate-spin shrink-0" />
                    <span>{verificationStep}</span>
                  </div>
                )}

                {/* Actions Row */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleBiometricAuth}
                      disabled={isVerifying}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#141C2B] hover:bg-[#1D273A] border border-[#C5A880]/40 hover:border-[#C5A880] text-xs font-semibold text-[#DFBE82] transition-all disabled:opacity-50 group shadow-sm"
                    >
                      <Fingerprint className="w-4 h-4 text-[#C5A880] group-hover:scale-110 transition-transform" />
                      <span>Biometric Passkey Sign-In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRegisterModalOpen(true)}
                      disabled={isVerifying}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#111724] hover:bg-[#182235] border border-[#232F46] hover:border-[#C5A880]/60 text-xs font-medium text-[#A6B4CD] hover:text-white transition-all"
                      title="Enroll a new hardware security key or biometric sensor"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Register Key</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#DFBE82] text-[#0A0E17] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#C5A880]/20 transition-all disabled:opacity-50"
                  >
                    <span>Authenticate &amp; Unlock Documents</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ================= VIEW 2: AUTHENTICATED PORTAL (DOCUMENTS, TIMELINE, NOTIFICATIONS) ================= */
            <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 animate-fadeIn">
              
              {/* Authenticated Matter Banner with Progress & Next Hearing */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0F1726] to-[#121B2F] border border-[#22314B] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs uppercase font-mono tracking-wider text-[#C5A880] font-semibold">
                      {activeMatter.reference}
                    </span>
                    <span className="text-[#8C98AE]">·</span>
                    <span className="text-xs text-white font-semibold">
                      {activeMatter.clientEntity}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                      CTS Verified
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#162134] text-[#E4C999] border border-[#273854] text-[10px] font-mono">
                      {activeMatter.currentStage}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-cinzel text-white font-bold">
                    {activeMatter.caseTitle}
                  </h4>

                  <div className="flex items-center gap-4 text-xs text-[#8C98AE] font-mono flex-wrap">
                    <span>Bench: {activeMatter.bench}</span>
                    <span>·</span>
                    <span>Forum: {activeMatter.forum}</span>
                    <span>·</span>
                    <span className="text-emerald-400">Next Hearing: {activeMatter.nextHearingDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap">
                  {/* Simulate Status Update Ping */}
                  <button
                    onClick={handleSimulateNewAlert}
                    className="px-3 py-1.5 bg-[#141C2B] hover:bg-[#1C273C] text-[#C5A880] text-xs font-mono rounded-lg border border-[#C5A880]/30 transition-all flex items-center gap-1.5"
                    title="Simulate incoming court status update"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Simulate Update</span>
                  </button>

                  {onOpenFullDashboard && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenFullDashboard(activeMatter);
                      }}
                      className="px-3.5 py-1.5 bg-[#172236] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#E4C999] text-xs font-semibold rounded-lg border border-[#C5A880]/40 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Full Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Portal Navigation Tabs with Badges */}
              <div className="flex items-center justify-between border-b border-[#1E293E] pb-3 gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Tab 1: Documents */}
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      activeTab === 'documents'
                        ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md shadow-[#C5A880]/15'
                        : 'bg-[#111724] text-[#A6B4CD] hover:text-white border border-[#1E2A3E]'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Sensitive Documents</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      activeTab === 'documents'
                        ? 'bg-[#0A0E17] text-[#E4C999]'
                        : 'bg-[#182338] text-[#8C98AE]'
                    }`}>
                      {filteredDocs.length}
                    </span>
                  </button>

                  {/* Tab 2: Matter Timeline & Milestones */}
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      activeTab === 'timeline'
                        ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md shadow-[#C5A880]/15'
                        : 'bg-[#111724] text-[#A6B4CD] hover:text-white border border-[#1E2A3E]'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Matter Timeline</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold ${
                      activeTab === 'timeline'
                        ? 'bg-[#0A0E17] text-[#C5A880]'
                        : 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      Stage Active
                    </span>
                  </button>

                  {/* Tab 3: Notifications & Case Alerts */}
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all relative ${
                      activeTab === 'notifications'
                        ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md shadow-[#C5A880]/15'
                        : 'bg-[#111724] text-[#A6B4CD] hover:text-white border border-[#1E2A3E]'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    <span>Alerts &amp; Updates</span>
                    {unreadCount > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                        activeTab === 'notifications'
                          ? 'bg-red-700 text-white'
                          : 'bg-red-600 text-white animate-pulse'
                      }`}>
                        {unreadCount} NEW
                      </span>
                    )}
                  </button>

                  {/* Tab 4: Biometric Passkeys (WebAuthn / FIDO2) */}
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      activeTab === 'security'
                        ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md shadow-[#C5A880]/15'
                        : 'bg-[#111724] text-[#A6B4CD] hover:text-white border border-[#1E2A3E]'
                    }`}
                  >
                    <Key className="w-4 h-4" />
                    <span>Biometric Passkeys</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      activeTab === 'security' ? 'bg-[#0A0E17] text-[#E4C999] font-bold' : 'bg-[#182338] text-[#8C98AE]'
                    }`}>
                      {activeOfficerPasskeys.length}
                    </span>
                  </button>
                </div>

                {activeTab === 'notifications' && unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-[#C5A880] hover:underline font-mono flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* ================= TAB 1: SENSITIVE DOCUMENTS ================= */}
              {activeTab === 'documents' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Controls Strip: Search & Filter Tabs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    
                    {/* Search in Documents */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search documents by title, hash, or signatory..."
                        className="w-full bg-[#111724] border border-[#212E44] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-[#5A6578] focus:outline-none focus:border-[#C5A880]"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {['all', 'Pleadings', 'Evidence', 'Judicial Order', 'Submissions'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all ${
                            categoryFilter === cat
                              ? 'bg-[#C5A880] text-[#0A0E17] font-semibold border-[#C5A880]'
                              : 'bg-[#111724] text-[#8C98AE] border-[#202C40] hover:text-white'
                          }`}
                        >
                          {cat === 'all' ? 'All Files' : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#8C98AE] px-1 font-mono">
                      <span>Showing {filteredDocs.length} certified judicial documents</span>
                      <span>Section 106B Evidence Act Admitted</span>
                    </div>

                    {filteredDocs.length === 0 ? (
                      <div className="p-8 text-center bg-[#0E1522] rounded-xl border border-[#1E293B] space-y-2">
                        <FileText className="w-8 h-8 text-[#54647C] mx-auto" />
                        <h5 className="text-sm font-semibold text-white">No documents matched your filter</h5>
                        <p className="text-xs text-[#8C98AE]">Clear your query or reset category filter.</p>
                      </div>
                    ) : (
                      filteredDocs.map((doc, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-[#0E1522] border border-[#1D2739] hover:border-[#C5A880]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs group"
                        >
                          {/* Left: Document Icon & Details */}
                          <div className="flex items-start gap-3.5 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-[#141E2F] border border-[#23314B] flex items-center justify-center text-[#C5A880] shrink-0 mt-0.5">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-sm font-semibold text-white group-hover:text-[#E4C999] transition-colors">
                                  {doc.name}
                                </h5>
                                {idx === 0 && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold animate-pulse">
                                    NEW UPLOAD
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded bg-[#162134] text-[10px] font-mono text-[#94A3B8] border border-[#253650]">
                                  {doc.category}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-mono text-[10px]">
                                  {doc.ctsHash.slice(0, 18)}...
                                </span>
                                {doc.isSigned && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Signed KICA § 83B</span>
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-[#BAC5D6] line-clamp-2 leading-relaxed">
                                {doc.summary}
                              </p>

                              {/* Unboxed Metadata Strip with Reading Time */}
                              <div className="text-[11px] text-[#697992] flex items-center gap-3 font-mono flex-wrap pt-0.5">
                                <span className="flex items-center gap-1 text-[#C5A880] font-sans font-medium">
                                  <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                                  <span>{doc.readTime || '6 min read'}</span>
                                </span>
                                <span>·</span>
                                <span>{doc.pages || 4} pages</span>
                                <span>·</span>
                                <span>Filed: {doc.date}</span>
                                <span>·</span>
                                <span>Size: {doc.size}</span>
                                <span>·</span>
                                <span>Signatory: {doc.signatory}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions Row */}
                          <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141C2B] hover:bg-[#1C283C] text-white text-xs font-medium rounded-lg border border-[#233148] transition-colors"
                              title="Preview Multi-Page Pleading"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
                              <span>Preview</span>
                            </button>

                            <button
                              onClick={() => setAnnotatingDoc(doc)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172338] hover:bg-[#223552] text-[#DFBE82] text-xs font-medium rounded-lg border border-[#C5A880]/30 hover:border-[#C5A880] transition-colors"
                              title="Annotate Clauses & Add Sticky Notes"
                            >
                              <Highlighter className="w-3.5 h-3.5 text-[#C5A880]" />
                              <span>Annotate</span>
                            </button>

                            <button
                              onClick={() => handleDownloadDoc(doc)}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C5A880] text-[#0A0E17] font-semibold text-xs rounded-lg hover:brightness-110 transition-all shadow-sm"
                              title="Download Decrypted Pleading"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download PDF</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ================= TAB 2: INTEGRATED MATTER TIMELINE ================= */}
              {activeTab === 'timeline' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Procedural Progress Milestone Banner */}
                  <div className="p-5 rounded-xl bg-gradient-to-r from-[#111929] via-[#141F33] to-[#111929] border border-[#22314B] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-[#C5A880]" />
                        <h5 className="font-cinzel text-white font-bold text-sm sm:text-base">
                          Judicial Progress &amp; Cause List Docket
                        </h5>
                      </div>
                      <span className="text-xs font-mono text-[#E4C999] bg-[#172338] px-2.5 py-1 rounded-lg border border-[#263752]">
                        Docket: {activeMatter.reference}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono text-[#8C98AE]">
                        <span>Procedural Case Completion</span>
                        <span className="text-emerald-400 font-semibold">{activeMatter.caseCompletionPercentage || 72}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1A2538] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#C5A880] to-emerald-400 transition-all duration-500"
                          style={{ width: `${activeMatter.caseCompletionPercentage || 72}%` }}
                        />
                      </div>
                    </div>

                    {/* Upcoming Hearing Notice */}
                    <div className="pt-2 border-t border-[#1C263B] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-[#CBD5E1]">
                        <CalendarClock className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Next Appearance: <strong>{activeMatter.nextHearingDate}</strong> before {activeMatter.bench}</span>
                      </div>
                      <a
                        href={activeMatter.virtualCourtRoom}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#C5A880] hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span>Join Virtual Courtroom</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Filter Controls for Timeline */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#8C98AE] mr-1">Filter Milestones:</span>
                      {[
                        { id: 'all', label: 'All Milestones' },
                        { id: 'completed', label: 'Completed Stages' },
                        { id: 'active', label: 'Active & Upcoming' }
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => setTimelineFilter(f.id as any)}
                          className={`px-3 py-1 rounded-lg border transition-colors ${
                            timelineFilter === f.id
                              ? 'bg-[#C5A880] text-[#0A0E17] font-semibold border-[#C5A880]'
                              : 'bg-[#121927] text-[#8C98AE] border-[#202C40] hover:text-white'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <span className="font-mono text-[11px] text-[#6A788F]">
                      Kenya Civil Procedure Rules Order 51
                    </span>
                  </div>

                  {/* Vertical Chronological Timeline */}
                  <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#202E46]">
                    {filteredTimeline.map((step, idx) => {
                      const isCompleted = step.status === 'completed';
                      const isCurrent = step.status === 'current';
                      return (
                        <div key={idx} className="relative group">
                          {/* Node Icon on Track */}
                          <div
                            className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                              isCompleted
                                ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                                : isCurrent
                                ? 'bg-[#172338] border-[#C5A880] text-[#E4C999] ring-4 ring-[#C5A880]/20 animate-pulse'
                                : 'bg-[#0E1522] border-[#293852] text-[#607086]'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : isCurrent ? (
                              <span className="w-2 h-2 rounded-full bg-[#C5A880]" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#607086]" />
                            )}
                          </div>

                          {/* Card Content */}
                          <div className={`p-4 rounded-xl border transition-all ${
                            isCurrent
                              ? 'bg-[#131D2E] border-[#C5A880]/60 shadow-lg shadow-[#C5A880]/5'
                              : 'bg-[#0E1522] border-[#1C263A] hover:border-[#283850]'
                          }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                              <div className="flex items-center gap-2">
                                <h6 className={`font-semibold ${isCurrent ? 'text-[#E4C999]' : 'text-white'}`}>
                                  {step.stage}
                                </h6>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                                  isCompleted
                                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                                    : isCurrent
                                    ? 'bg-[#C5A880]/20 text-[#E4C999] border border-[#C5A880]/40 font-bold'
                                    : 'bg-[#162134] text-[#8C98AE] border border-[#233148]'
                                }`}>
                                  {step.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 font-mono text-[11px] text-[#8C98AE]">
                                <Calendar className="w-3 h-3 text-[#C5A880]" />
                                <span>{step.date}</span>
                                {step.registryRef && (
                                  <>
                                    <span>·</span>
                                    <span className="text-[#C5A880]">{step.registryRef}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <p className="mt-2 text-xs text-[#BAC5D6] leading-relaxed">
                              {step.notes}
                            </p>

                            {/* Direct Action Link if related document exists */}
                            {activeMatter.documents && activeMatter.documents.length > 0 && (
                              <div className="mt-3 pt-2.5 border-t border-[#192336] flex items-center justify-between text-[11px]">
                                <span className="text-[#64748B]">Registry Certificate Admitted</span>
                                <button
                                  onClick={() => setPreviewDoc(activeMatter.documents[idx % activeMatter.documents.length])}
                                  className="text-[#C5A880] hover:text-[#DFBE82] font-semibold flex items-center gap-1 transition-colors"
                                >
                                  <span>View Stage Filing</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ================= TAB 3: CHAMBERS & CTS NOTIFICATIONS ================= */}
              {activeTab === 'notifications' && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Notification Filter Controls */}
                  <div className="flex items-center justify-between text-xs gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {[
                        { id: 'all', label: 'All Alerts' },
                        { id: 'unread', label: `Unread (${unreadCount})` },
                        { id: 'document_upload', label: 'New Documents' },
                        { id: 'case_status', label: 'Case Status' }
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => setNotifFilter(f.id as any)}
                          className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-colors ${
                            notifFilter === f.id
                              ? 'bg-[#C5A880] text-[#0A0E17] font-semibold border-[#C5A880]'
                              : 'bg-[#111724] text-[#8C98AE] border-[#202C40] hover:text-white'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#8C98AE]">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Real-time CTS Websocket Feed</span>
                    </div>
                  </div>

                  {/* Notification Items List */}
                  <div className="space-y-3">
                    {filteredNotifs.length === 0 ? (
                      <div className="p-8 text-center bg-[#0E1522] rounded-xl border border-[#1E293B] space-y-2">
                        <CheckCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                        <h5 className="text-sm font-semibold text-white">All Caught Up</h5>
                        <p className="text-xs text-[#8C98AE]">No unread alerts or status notifications in this category.</p>
                      </div>
                    ) : (
                      filteredNotifs.map((notif) => {
                        const isDocUpload = notif.type === 'document_upload';
                        return (
                          <div
                            key={notif.id}
                            onClick={() => handleMarkAsRead(notif.id)}
                            className={`p-4 rounded-xl border transition-all text-xs cursor-pointer flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                              !notif.isRead
                                ? 'bg-[#131D2E] border-[#C5A880]/60 shadow-md shadow-[#C5A880]/5'
                                : 'bg-[#0E1522] border-[#1C263A] hover:border-[#263750] opacity-80'
                            }`}
                          >
                            <div className="flex items-start gap-3 flex-1">
                              {/* Type Icon */}
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                                isDocUpload
                                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                                  : notif.priority === 'Urgent'
                                  ? 'bg-red-950/80 border-red-500/40 text-red-400'
                                  : 'bg-[#172338] border-[#C5A880]/40 text-[#E4C999]'
                              }`}>
                                {isDocUpload ? (
                                  <FileText className="w-4 h-4" />
                                ) : notif.priority === 'Urgent' ? (
                                  <AlertTriangle className="w-4 h-4" />
                                ) : (
                                  <Activity className="w-4 h-4" />
                                )}
                              </div>

                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h6 className={`font-semibold text-sm ${!notif.isRead ? 'text-white' : 'text-[#BAC5D6]'}`}>
                                    {notif.title}
                                  </h6>

                                  {/* Notification Badge Tags */}
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    isDocUpload
                                      ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
                                      : 'bg-amber-950/90 text-amber-300 border border-amber-500/50'
                                  }`}>
                                    {isDocUpload ? 'NEW UPLOAD' : 'CASE UPDATE'}
                                  </span>

                                  {!notif.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                  )}
                                </div>

                                <p className="text-xs text-[#BAC5D6] leading-relaxed">
                                  {notif.description}
                                </p>

                                <div className="flex items-center gap-3 font-mono text-[11px] text-[#718096] pt-1">
                                  <span>{notif.timestamp}</span>
                                  {notif.courtRef && (
                                    <>
                                      <span>·</span>
                                      <span className="text-[#C5A880]">{notif.courtRef}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Direct Action Link */}
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              {notif.targetDocName && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notif.id);
                                    const found = (activeMatter.documents || []).find(d => d.name === notif.targetDocName);
                                    if (found) setPreviewDoc(found);
                                  }}
                                  className="px-3 py-1.5 bg-[#172338] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#E4C999] rounded-lg border border-[#C5A880]/40 transition-all font-semibold flex items-center gap-1.5 text-xs shadow-sm"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Inspect File</span>
                                </button>
                              )}

                              {!notif.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notif.id);
                                  }}
                                  className="p-1.5 text-[#8C98AE] hover:text-white rounded-lg hover:bg-[#1D293E] transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: BIOMETRIC PASSKEYS & FIDO2 HARDWARE MANAGEMENT */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Security Overview & Action Header */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#111726] via-[#141C2E] to-[#111726] border border-[#233149] shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/30 text-[11px] font-mono font-semibold text-[#DFBE82]">
                            FIDO2 · WebAuthn Level 3
                          </span>
                          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Hardware TPM / Secure Enclave Enforced
                          </span>
                        </div>
                        <h4 className="text-lg font-cinzel text-white font-bold tracking-wide">
                          Biometric Hardware Keys &amp; Officer Passkeys
                        </h4>
                        <p className="text-xs text-[#A6B4CD] max-w-2xl leading-relaxed">
                          Cryptographic asymmetric credentials bound directly to physical biometric hardware sensors (Touch ID, Windows Hello, YubiKey 5 FIDO2). Registered under the Kenya Information and Communications Act (KICA) § 83B for Advanced Electronic Signature compliance.
                        </p>
                      </div>

                      <button
                        onClick={() => setIsRegisterModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#DFBE82] text-[#0A0E17] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#C5A880]/20 transition-all shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Enroll New Passkey</span>
                      </button>
                    </div>

                    {/* Officer Enclave Status Strip */}
                    <div className="mt-5 pt-4 border-t border-[#1F2C44] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-[#0B101A] p-2.5 rounded-xl border border-[#1A2538]">
                        <span className="text-[10px] uppercase font-mono text-[#7D8B9F] block">Resident Officer</span>
                        <span className="font-semibold text-white truncate block">{activeDemoAccount.officer}</span>
                      </div>
                      <div className="bg-[#0B101A] p-2.5 rounded-xl border border-[#1A2538]">
                        <span className="text-[10px] uppercase font-mono text-[#7D8B9F] block">Client Entity</span>
                        <span className="font-semibold text-[#DFBE82] truncate block">{activeDemoAccount.entity}</span>
                      </div>
                      <div className="bg-[#0B101A] p-2.5 rounded-xl border border-[#1A2538]">
                        <span className="text-[10px] uppercase font-mono text-[#7D8B9F] block">Enrolled Keys</span>
                        <span className="font-semibold text-emerald-400 font-mono block">
                          {activeOfficerPasskeys.length} Hardware {activeOfficerPasskeys.length === 1 ? 'Key' : 'Keys'}
                        </span>
                      </div>
                      <div className="bg-[#0B101A] p-2.5 rounded-xl border border-[#1A2538]">
                        <span className="text-[10px] uppercase font-mono text-[#7D8B9F] block">Attestation Standard</span>
                        <span className="font-semibold text-[#DFBE82] font-mono block">Direct FIDO2 / W3C</span>
                      </div>
                    </div>
                  </div>

                  {/* Registered Keys Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs uppercase font-mono tracking-wider text-[#A6B4CD] flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#C5A880]" />
                        <span>Active Hardware Credentials for {activeDemoAccount.officer}</span>
                      </h5>
                      <span className="text-[11px] font-mono text-[#7D8B9F]">
                        {activeOfficerPasskeys.length} of {registeredPasskeys.length} System Keys
                      </span>
                    </div>

                    {activeOfficerPasskeys.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-[#0D131F] border border-[#212D42] text-center space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#141C2B] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
                          <Key className="w-6 h-6" />
                        </div>
                        <h5 className="text-sm font-semibold text-white">No Hardware Passkeys Currently Enrolled</h5>
                        <p className="text-xs text-[#8C98AE] max-w-md mx-auto">
                          Enrolling a Touch ID, Windows Hello, or YubiKey passkey enables high-security biometric sign-ins without entering SMS tokens or passwords.
                        </p>
                        <button
                          onClick={() => setIsRegisterModalOpen(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C5A880] text-[#0A0E17] font-bold text-xs hover:brightness-110 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Enroll Passkey Now</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeOfficerPasskeys.map((passkey) => {
                          const isPlatform = passkey.authenticatorAttachment === 'platform';
                          const isUsb = passkey.deviceType === 'hardware_key';
                          const isFace = passkey.deviceType === 'faceid';

                          return (
                            <div
                              key={passkey.id}
                              className="p-4 sm:p-5 rounded-2xl bg-[#0D1422] border border-[#1E2C44] hover:border-[#C5A880]/50 transition-all space-y-4 flex flex-col justify-between group shadow-md"
                            >
                              <div className="space-y-3">
                                {/* Header Row */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                                      isFace
                                        ? 'bg-sky-950/40 border-sky-600/40 text-sky-400'
                                        : isUsb
                                        ? 'bg-amber-950/40 border-amber-600/40 text-[#DFBE82]'
                                        : 'bg-emerald-950/40 border-emerald-600/40 text-emerald-400'
                                    }`}>
                                      {isFace ? (
                                        <ScanFace className="w-6 h-6" />
                                      ) : isUsb ? (
                                        <Usb className="w-6 h-6" />
                                      ) : (
                                        <Fingerprint className="w-6 h-6" />
                                      )}
                                    </div>
                                    <div>
                                      <h6 className="text-sm font-semibold text-white group-hover:text-[#DFBE82] transition-colors">
                                        {passkey.nickname}
                                      </h6>
                                      <span className="text-[11px] font-mono text-[#8C98AE] flex items-center gap-1.5">
                                        <span>{passkey.officerName}</span>
                                        <span>·</span>
                                        <span className="text-[#C5A880]">{passkey.clientEntity}</span>
                                      </span>
                                    </div>
                                  </div>

                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold shrink-0 border ${
                                    isPlatform
                                      ? 'bg-emerald-950/50 border-emerald-700/50 text-emerald-300'
                                      : 'bg-indigo-950/50 border-indigo-700/50 text-indigo-300'
                                  }`}>
                                    {isPlatform ? 'Platform Biometric' : 'Roaming Security Key'}
                                  </span>
                                </div>

                                {/* Passkey Hardware Parameters */}
                                <div className="p-3 bg-[#090E17] rounded-xl border border-[#162133] space-y-1.5 text-xs font-mono">
                                  <div className="flex items-center justify-between text-[#8C98AE]">
                                    <span className="text-[10px] uppercase">Credential ID:</span>
                                    <span className="text-white text-[11px]">
                                      {passkey.id.slice(0, 14)}...{passkey.id.slice(-8)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[#8C98AE]">
                                    <span className="text-[10px] uppercase">Algorithm:</span>
                                    <span className="text-[#DFBE82] text-[11px] font-semibold">
                                      {passkey.algorithm}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[#8C98AE]">
                                    <span className="text-[10px] uppercase">Enclave AAGUID:</span>
                                    <span className="text-[#A6B4CD] text-[10px]">
                                      {passkey.aaguid}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[#8C98AE]">
                                    <span className="text-[10px] uppercase">Compliance:</span>
                                    <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>KICA § 83B Advanced e-Signature</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-[#7D8B9F] font-mono px-1">
                                  <span>Enrolled: {new Date(passkey.createdAt).toLocaleDateString()}</span>
                                  <span>Last Used: {passkey.lastUsedAt ? new Date(passkey.lastUsedAt).toLocaleDateString() : 'Active Session'}</span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="pt-2 border-t border-[#1A2538] flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsBiometricModalOpen(true);
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#141C2B] hover:bg-[#1D273A] border border-[#C5A880]/30 hover:border-[#C5A880] text-xs font-medium text-[#DFBE82] transition-all"
                                >
                                  <Fingerprint className="w-3.5 h-3.5 text-[#C5A880]" />
                                  <span>Test Verification</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to revoke "${passkey.nickname}"? This action cannot be undone.`)) {
                                      deleteRegisteredPasskey(passkey.id);
                                      setRegisteredPasskeys(getRegisteredPasskeys());
                                      setDownloadNotice(`Passkey "${passkey.nickname}" has been cryptographically revoked.`);
                                      setTimeout(() => setDownloadNotice(null), 4000);
                                    }
                                  }}
                                  className="p-2 rounded-xl bg-[#141C2B] hover:bg-red-950/40 border border-[#232F46] hover:border-red-600/50 text-[#8C98AE] hover:text-red-400 transition-all"
                                  title="Revoke passkey"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Technical & Legal Framework Advisory */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#090D16] border border-[#1E2A3E] space-y-2.5 text-xs text-[#8C98AE]">
                    <div className="flex items-center gap-2 text-[#DFBE82] font-semibold">
                      <Shield className="w-4 h-4 text-[#C5A880]" />
                      <span>Zero-Knowledge Hardware Enclave Architecture &amp; Legal Admissibility</span>
                    </div>
                    <p className="leading-relaxed text-[11px]">
                      Under the <strong>Kenya Information and Communications Act (Cap 411A § 83B)</strong> and <strong>Evidence Act (Cap 80 § 106B)</strong>, cryptographic asymmetric keys generated inside biometric hardware secure enclaves are legally admissible as Advanced Electronic Signatures. Biometric telemetry (fingerprint minutiae, facial depth maps) never leaves the physical silicon; authentication occurs strictly via public-key challenge-response signatures.
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-3 text-[10px] font-mono text-[#7D8B9F]">
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>FIDO Alliance Level 3 Certified</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Apple Secure Enclave / Windows TPM 2.0</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Yubico FIDO2 / CTAP2 Compliant</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Modal Footer */}
          <div className="p-3.5 sm:p-4 bg-[#0F1626] border-t border-[#1E293E] flex flex-wrap items-center justify-between gap-3 text-xs text-[#8C98AE] px-5 sm:px-7">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
              <span>Republic of Kenya Law Society of Kenya (LSK) Privileged Repository · Section 134 Evidence Act (Cap 80)</span>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#172132] hover:bg-[#1F2C42] text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>

        </div>
      </div>

      {/* Multi-Page Judicial Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          document={previewDoc}
          matter={activeMatter}
          onDownload={(doc) => handleDownloadDoc(doc)}
          onAnnotate={(doc) => {
            setPreviewDoc(null);
            setAnnotatingDoc(doc);
          }}
        />
      )}

      {/* Interactive Document Annotation Layer Modal (Clauses, Highlights & Sticky Notes) */}
      {annotatingDoc && (
        <SecureDocumentAnnotationModal
          isOpen={!!annotatingDoc}
          onClose={() => setAnnotatingDoc(null)}
          document={annotatingDoc}
          matter={activeMatter}
        />
      )}

      {/* High-Security Biometric Verification Modal (Web Authentication API) */}
      <BiometricVerificationModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        onSuccess={handleBiometricSuccess}
        clientEntity={activeDemoAccount.entity}
        officerName={activeDemoAccount.officer}
        officerRole={activeDemoAccount.role}
        docketRef={activeDemoAccount.docket}
      />

      {/* High-Security WebAuthn Biometric Registration Modal (FIDO2 / KICA § 83B) */}
      <WebAuthnRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={(newKey) => {
          setRegisteredPasskeys(getRegisteredPasskeys());
          setDownloadNotice(`Hardware passkey "${newKey.nickname}" successfully enrolled under KICA § 83B.`);
          setTimeout(() => setDownloadNotice(null), 5000);
          if (!isAuthenticated) {
            handleBiometricSuccess();
          }
        }}
        officerName={activeDemoAccount.officer}
        officerEmail={activeDemoAccount.email}
        clientEntity={activeDemoAccount.entity}
      />
    </>
  );
};
