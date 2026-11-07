import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Lock, ShieldCheck, Scale, FileText, CheckCircle2, Clock, Calendar, 
  Download, ExternalLink, Eye, Send, Building2, Landmark, 
  Search, Printer, AlertCircle, FileCheck, DollarSign,
  ChevronRight, RefreshCw, MessageSquareQuote, Check, ArrowUpRight,
  Highlighter, ScanText, History, SlidersHorizontal, Filter, Sparkles, Plus, CalendarCheck, UserCheck, ChevronDown, Video,
  Bell, BellRing, Volume2, Play, Pause, RotateCcw, Mic, BarChart3, TrendingUp, Activity, CalendarClock, FileAudio, Copy, CheckCheck, Radio, Layers, Smartphone, Mail,
  ScanLine, Camera, PenTool, Fingerprint
} from 'lucide-react';
import { ClientMatter, MatterDocument, MOCK_CLIENT_MATTERS, ConsultationRecord, SAMPLE_CLIENT_MATTER, VoiceMeetingNote, JudiciaryCaseUpdate, JudiciarySyncInfo } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';
import { SecureDocumentAnnotationModal } from './SecureDocumentAnnotationModal';
import { SecureDocumentOCRModal } from './SecureDocumentOCRModal';
import { ConsultationModal } from './ConsultationModal';
import { VoiceNoteRecorderModal } from './VoiceNoteRecorderModal';
import { MeetingSentimentVisualization } from './MeetingSentimentVisualization';
import { DocumentScannerModal } from './DocumentScannerModal';
import { MeetingTranscriptModal } from './MeetingTranscriptModal';
import { BillingDashboard } from './BillingDashboard';
import { SecureDocumentSigningModal } from './SecureDocumentSigningModal';
import { BiometricGateModal } from './BiometricGateModal';
import { DocumentSearchModal } from './DocumentSearchModal';
import { MeetingAlertsModal } from './MeetingAlertsModal';
import { LegalSummaryModal } from './LegalSummaryModal';
import { DocumentPreviewModal } from './DocumentPreviewModal';

interface ClientDashboardProps {
  matter: ClientMatter;
  onSelectMatter: (m: ClientMatter) => void;
  onLogout: () => void;
  onClose: () => void;
  initialTab?: 'status' | 'documents' | 'consultations' | 'billing' | 'dispatch';
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  matter,
  onSelectMatter,
  onLogout,
  onClose,
  initialTab = 'status'
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'status' | 'documents' | 'consultations' | 'billing' | 'dispatch'>(initialTab);
  const [localDocs, setLocalDocs] = useState<MatterDocument[]>(matter.documents || []);
  const [signingDoc, setSigningDoc] = useState<MatterDocument | null>(null);
  const [signingSuccessToast, setSigningSuccessToast] = useState<string | null>(null);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<MatterDocument | null>(null);
  const [annotatingDoc, setAnnotatingDoc] = useState<MatterDocument | null>(null);
  const [ocrDoc, setOcrDoc] = useState<MatterDocument | null>(null);

  useEffect(() => {
    setLocalDocs(matter.documents || []);
  }, [matter]);

  // Document Search & Biometric Authentication States
  const [isDocSearchModalOpen, setIsDocSearchModalOpen] = useState(false);
  const [isBiometricGateOpen, setIsBiometricGateOpen] = useState(false);
  const [biometricTargetDoc, setBiometricTargetDoc] = useState<MatterDocument | null>(null);
  const [pendingBiometricAction, setPendingBiometricAction] = useState<(() => void) | null>(null);
  const [unlockedDocHashes, setUnlockedDocHashes] = useState<Set<string>>(new Set());

  // Global Keyboard Shortcut: ⌘D / Ctrl+D to open deep document search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsDocSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Biometric gate executor for sensitive/classified court documents
  const executeWithBiometricGate = (doc: MatterDocument, action: () => void) => {
    const isSensitive = doc.category === 'Evidence' || doc.category === 'Judicial Order';
    if (isSensitive && !unlockedDocHashes.has(doc.ctsHash)) {
      setBiometricTargetDoc(doc);
      setPendingBiometricAction(() => () => {
        setUnlockedDocHashes(prev => new Set(prev).add(doc.ctsHash));
        action();
      });
      setIsBiometricGateOpen(true);
    } else {
      action();
    }
  };

  // Meeting Alerts & Legal Summary States
  const [isMeetingAlertsOpen, setIsMeetingAlertsOpen] = useState(false);
  const [isLegalSummaryOpen, setIsLegalSummaryOpen] = useState(false);
  const [summaryTargetConsultation, setSummaryTargetConsultation] = useState<ConsultationRecord | null>(null);
  const [summaryTargetDoc, setSummaryTargetDoc] = useState<MatterDocument | null>(null);
  const [summarySourceTitle, setSummarySourceTitle] = useState<string | undefined>(undefined);
  const [summaryTranscriptText, setSummaryTranscriptText] = useState<string | undefined>(undefined);
  const [dismissUpcomingAlertBanner, setDismissUpcomingAlertBanner] = useState(false);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('all');
  const [docSignatoryFilter, setDocSignatoryFilter] = useState<string>('all');
  const [docSortOrder, setDocSortOrder] = useState<'newest' | 'oldest' | 'size'>('newest');
  const [docSearch, setDocSearch] = useState('');
  const [consultationSearch, setConsultationSearch] = useState('');
  const [consultationStatusFilter, setConsultationStatusFilter] = useState<'all' | 'Confirmed' | 'Completed'>('all');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [virtualCourtNotice, setVirtualCourtNotice] = useState<string | null>(null);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [copiedCalendarId, setCopiedCalendarId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedTranscriptConsultation, setSelectedTranscriptConsultation] = useState<ConsultationRecord | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'Pleadings' | 'Evidence' | 'Submissions'>('Evidence');
  const [uploadSuccessNotice, setUploadSuccessNotice] = useState<string | null>(null);

  // Privileged Messenger State
  const [messages, setMessages] = useState(matter.directMessages || []);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [msgNotice, setMsgNotice] = useState<string | null>(null);

  // Voice Meeting Notes & Audio Player State
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [audioPlaybackSeconds, setAudioPlaybackSeconds] = useState<Record<string, number>>({});
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [expandedTranscriptId, setExpandedTranscriptId] = useState<string | null>(null);
  const [copiedTranscriptId, setCopiedTranscriptId] = useState<string | null>(null);
  const [isRecordingVoiceOpen, setIsRecordingVoiceOpen] = useState(false);
  const [recordedVoiceNotes, setRecordedVoiceNotes] = useState<VoiceMeetingNote[]>([]);

  // Judiciary Case Updates & CTS Bridge State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadUpdatesCount, setUnreadUpdatesCount] = useState<number>(() => {
    return (matter.judiciaryUpdates || []).filter(u => u.isUnread).length || 2;
  });
  const [updatesList, setUpdatesList] = useState<JudiciaryCaseUpdate[]>(() => matter.judiciaryUpdates || []);
  const [isCtsSyncing, setIsCtsSyncing] = useState(false);
  const [ctsSyncSuccess, setCtsSyncSuccess] = useState<string | null>(null);
  const [ctsLastSyncedTime, setCtsLastSyncedTime] = useState<string>(
    matter.judiciarySync?.lastSyncTimestamp || 'Today at 09:14 AM EAT'
  );
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);

  // Handle mock download with real client-side blob download
  const handleDownload = (doc: MatterDocument) => {
    setDownloadNotice(`Authorized 256-bit decryption & download initiated: ${doc.name}`);
    
    // Generate mock legal document file download
    const mockContent = `================================================================================
REPUBLIC OF KENYA - IN THE SUPERIOR COURTS OF KENYA
CASE TRACKING SYSTEM (CTS) VERIFIED ELECTRONIC RECORD
================================================================================
Matter Reference: ${matter.reference}
Judiciary CTS E-Filing ID: ${matter.ctsNumber}
Forum: ${matter.forum}
Bench: ${matter.bench}
Parties: ${matter.caseTitle}

DOCUMENT TITLE: ${doc.name}
CATEGORY: ${doc.category}
FILING DATE: ${doc.date}
SIGNATORY: ${doc.signatory}
CTS CRYPTOGRAPHIC HASH: ${doc.ctsHash}

LEGAL SUMMARY & RECORD EXTRACT:
${doc.summary}

--------------------------------------------------------------------------------
CERTIFICATION:
I hereby certify under the Advocates Act (Cap 16) and Section 106B of the 
Evidence Act (Cap 80) that this electronic pleading is a faithful certified copy 
of the record filed in the Chambers of Petersons Angwenyi & Associates Advocates.

ADVOCATES FOR THE CLIENT:
Petersons Angwenyi & Associates Advocates
Upper Hill Chambers, 8th Floor, Mara Road, Nairobi
Email: litigation@paalawkenya.com | Web: www.paalawkenya.com
================================================================================`;

    const blob = new Blob([mockContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CERTIFIED_${doc.name.replace('.pdf', '')}_CTS.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setDownloadNotice(null);
    }, 4500);
  };

  // Handle simulated upload
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDocName.trim()) return;

    const newDoc: MatterDocument = {
      name: `${uploadDocName.trim()}.pdf`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      size: '2.4 MB',
      category: uploadCategory as any,
      ctsHash: `SHA256:${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
      signatory: 'Instructing In-House Legal Counsel (Verified)',
      summary: `Document deposited by corporate client via Chambers Secure Portal for registrar review and CTS e-filing.`
    };

    matter.documents.unshift(newDoc);
    setLocalDocs(prev => [newDoc, ...prev]);
    setUploadDocName('');
    setIsUploadOpen(false);
    setUploadSuccessNotice(`Document "${newDoc.name}" uploaded to Chambers E-Filing Vault. Registry confirmation dispatched.`);
    setTimeout(() => setUploadSuccessNotice(null), 5000);
  };

  // Handle sending privileged instruction
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    setIsSendingMsg(true);
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: `In-House General Counsel (${matter.clientEntity})`,
      role: 'Corporate Instructing Client',
      timestamp: 'Just now',
      content: newMessageText.trim(),
      isOfficial: false
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessageText('');

    setTimeout(() => {
      setIsSendingMsg(false);
      setMsgNotice('Instruction transmitted securely under Section 134 Evidence Act.');

      // Registrar automated acknowledgment after 1.2s
      setTimeout(() => {
        const replyMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'Chambers Duty Registrar (Litigation Desk)',
          role: 'Official Chambers Registry',
          timestamp: 'Just now',
          content: 'Acknowledged. Your privileged instructions have been entered into the case log. Lead Advocate ' + matter.leadAdvocate.split(' ')[0] + ' notified.',
          isOfficial: true
        };
        setMessages(prev => [...prev, replyMsg]);
      }, 1400);

      setTimeout(() => setMsgNotice(null), 4000);
    }, 600);
  };

  // Unique list of signatories in matter documents
  const allSignatories = React.useMemo(() => {
    return Array.from(new Set(matter.documents.map(d => d.signatory)));
  }, [matter.documents]);

  // Combined consultations list from matter + localStorage
  const allConsultations = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('paa_consultations');
      const parsed: ConsultationRecord[] = saved ? JSON.parse(saved) : [];
      const matterList = matter.consultations || [];
      const seen = new Set<string>();
      const combined: ConsultationRecord[] = [];
      [...parsed, ...matterList].forEach(c => {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          combined.push(c);
        }
      });
      return combined;
    } catch {
      return matter.consultations || [];
    }
  }, [matter.consultations, isBookingModalOpen]);

  // Filtered consultations
  const filteredConsultations = React.useMemo(() => {
    return allConsultations.filter(c => {
      if (consultationStatusFilter === 'Confirmed' && !c.status.includes('Confirmed')) return false;
      if (consultationStatusFilter === 'Completed' && !c.status.includes('Completed')) return false;

      if (!consultationSearch.trim()) return true;
      const q = consultationSearch.toLowerCase();
      return (
        c.advocateName.toLowerCase().includes(q) ||
        c.practiceArea.toLowerCase().includes(q) ||
        c.reference.toLowerCase().includes(q) ||
        c.summaryNotes.toLowerCase().includes(q) ||
        (c.actionItems && c.actionItems.some(item => item.toLowerCase().includes(q))) ||
        (c.attendees && c.attendees.some(att => att.toLowerCase().includes(q)))
      );
    });
  }, [allConsultations, consultationStatusFilter, consultationSearch]);

  // Multi-facet filtered and sorted documents
  const filteredDocs = React.useMemo(() => {
    let docs = [...localDocs];

    if (docCategoryFilter !== 'all') {
      docs = docs.filter(doc => doc.category === docCategoryFilter);
    }

    if (docSignatoryFilter !== 'all') {
      docs = docs.filter(doc => doc.signatory === docSignatoryFilter);
    }

    if (docSearch.trim()) {
      const q = docSearch.toLowerCase();
      docs = docs.filter(doc =>
        doc.name.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q) ||
        doc.signatory.toLowerCase().includes(q) ||
        doc.ctsHash.toLowerCase().includes(q) ||
        doc.date.toLowerCase().includes(q)
      );
    }

    if (docSortOrder === 'newest') {
      docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (docSortOrder === 'oldest') {
      docs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (docSortOrder === 'size') {
      docs.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
    }

    return docs;
  }, [localDocs, docCategoryFilter, docSignatoryFilter, docSearch, docSortOrder]);

  // Category counts
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: localDocs.length };
    localDocs.forEach(d => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    return counts;
  }, [localDocs]);

  // Highlight helper for search terms
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-[#C5A880]/35 text-white font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Calendar sync helpers for consultations
  const handleCalendarExport = (rec: ConsultationRecord, type: 'google' | 'outlook' | 'ics') => {
    const timeMatch = rec.scheduledTime.match(/^(\d{2}):(\d{2})/);
    const hours = timeMatch ? parseInt(timeMatch[1], 10) : 14;
    const mins = timeMatch ? parseInt(timeMatch[2], 10) : 0;
    const dateUtc = new Date(`${rec.scheduledDate}T00:00:00Z`);
    dateUtc.setUTCHours(hours - 3, mins, 0, 0); // EAT to UTC
    const endUtc = new Date(dateUtc.getTime() + 60 * 60 * 1000);
    const formatCalIso = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const title = `Legal Consultation with ${rec.advocateName} · PAA Advocates`;
    const location = rec.forumLocation;
    const details = `Formal Legal Consultation\nDocket Ref: ${rec.reference}\nCounsel: ${rec.advocateName}\nPractice: ${rec.practiceArea}\nStatus: ${rec.status}\nStrictly Privileged under Section 134 Evidence Act (Cap 80).`;

    if (type === 'google') {
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatCalIso(dateUtc)}/${formatCalIso(endUtc)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (type === 'outlook') {
      const url = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${encodeURIComponent(dateUtc.toISOString())}&enddt=${encodeURIComponent(endUtc.toISOString())}&body=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      const nowIso = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//PAA Advocates//Chambers Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:PAA-CONF-${rec.id}@paalawkenya.com`,
        `DTSTAMP:${nowIso}`,
        `DTSTART:${formatCalIso(dateUtc)}`,
        `DTEND:${formatCalIso(endUtc)}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${details.replace(/\n/g, '\\n')}`,
        `LOCATION:${location}`,
        'STATUS:CONFIRMED',
        'ORGANIZER;CN="PAA Chambers Registry":mailto:registry@paalawkenya.com',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Consultation-${rec.reference}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setCopiedCalendarId(rec.id);
      setTimeout(() => setCopiedCalendarId(null), 3000);
    }
  };

  // Audio playback interval simulator
  useEffect(() => {
    if (!activeAudioId) return;

    const interval = setInterval(() => {
      setAudioPlaybackSeconds(prev => {
        const currentSecs = prev[activeAudioId] || 0;
        let maxSecs = 270;
        const con = allConsultations.find(c => c.voiceNote?.id === activeAudioId);
        if (con?.voiceNote?.durationSeconds) {
          maxSecs = con.voiceNote.durationSeconds;
        } else {
          const rec = recordedVoiceNotes.find(r => r.id === activeAudioId);
          if (rec?.durationSeconds) {
            maxSecs = rec.durationSeconds;
          }
        }

        const nextSecs = currentSecs + 1 * audioSpeed;
        if (nextSecs >= maxSecs) {
          setActiveAudioId(null);
          return { ...prev, [activeAudioId]: maxSecs };
        }
        return { ...prev, [activeAudioId]: nextSecs };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeAudioId, audioSpeed, allConsultations, recordedVoiceNotes]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleToggleAudio = (voiceId: string) => {
    if (activeAudioId === voiceId) {
      setActiveAudioId(null);
    } else {
      setActiveAudioId(voiceId);
      setAudioPlaybackSeconds(prev => ({
        ...prev,
        [voiceId]: prev[voiceId] || 0
      }));
    }
  };

  const handleRewindAudio = (voiceId: string) => {
    setAudioPlaybackSeconds(prev => ({
      ...prev,
      [voiceId]: 0
    }));
  };

  const handleCopyTranscript = (voiceId: string, transcript: string) => {
    navigator.clipboard.writeText(transcript);
    setCopiedTranscriptId(voiceId);
    setTimeout(() => setCopiedTranscriptId(null), 3000);
  };

  const handleDownloadVoiceMemo = (voice: VoiceMeetingNote) => {
    const content = `================================================================================
REPUBLIC OF KENYA - PETERSONS ANGWENYI & ASSOCIATES ADVOCATES
PRIVILEGED ADVOCATE ORAL DICTATION MEMORANDUM & TRANSCRIPT
================================================================================
Docket Reference: ${matter.reference}
Judiciary CTS ID: ${matter.ctsNumber}
Matter Title: ${matter.caseTitle}

DICTATION TITLE: ${voice.title}
RECORDED BY: ${voice.speaker} (${voice.role})
RECORDING DATE: ${voice.recordedDate} · Duration: ${voice.duration}
AUDIO ENCRYPTION: AES-256 GCM Chambers Secure Vault
STATUTORY PRIVILEGE: Section 134 Evidence Act (Cap 80)

--------------------------------------------------------------------------------
VERBATIM SPEECH-TO-TEXT TRANSCRIPT:
${voice.transcript}

--------------------------------------------------------------------------------
CERTIFICATION:
I hereby certify that this transcript is an automated, verified verbatim 
reproduction of the oral dictation recorded by counsel in the Chambers of 
Petersons Angwenyi & Associates Advocates for client file #${matter.reference}.

Signed: Chambers Litigation Registrar
Petersons Angwenyi & Associates Advocates
Upper Hill Chambers, Nairobi
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ORAL_DICTATION_${voice.id}_CERTIFIED.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Next court appearance calendar export
  const handleCourtCalendarExport = (type: 'google' | 'outlook' | 'ics') => {
    const title = `Court Hearing: ${matter.caseTitle} · ${matter.forum}`;
    const location = `${matter.bench}, Milimani Law Courts, Upper Hill, Nairobi`;
    const details = `Judiciary Cause List No: ${matter.causeListNo}\nCTS E-Filing Docket: ${matter.ctsNumber}\nForum: ${matter.forum}\nBench: ${matter.bench}\nLead Counsel: ${matter.leadAdvocate}\nVirtual Court: ${matter.virtualCourtRoom}\nStrictly privileged legal proceedings under the Advocates Act.`;

    const dateUtc = new Date('2026-11-25T06:00:00Z');
    const endUtc = new Date('2026-11-25T10:00:00Z');
    const formatCalIso = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    if (type === 'google') {
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatCalIso(dateUtc)}/${formatCalIso(endUtc)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (type === 'outlook') {
      const url = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${encodeURIComponent(dateUtc.toISOString())}&enddt=${encodeURIComponent(endUtc.toISOString())}&body=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      const nowIso = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//PAA Advocates//Judiciary Hearing Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:PAA-HEARING-${matter.reference}@paalawkenya.com`,
        `DTSTAMP:${nowIso}`,
        `DTSTART:${formatCalIso(dateUtc)}`,
        `DTEND:${formatCalIso(endUtc)}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${details.replace(/\n/g, '\\n')}`,
        `LOCATION:${location}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CourtHearing-${matter.reference}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setCopiedCalendarId('court-hearing');
      setTimeout(() => setCopiedCalendarId(null), 3000);
    }
  };

  // Trigger live CTS sync
  const handleTriggerCtsSync = () => {
    setIsCtsSyncing(true);
    setTimeout(() => {
      setIsCtsSyncing(false);
      const nowStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      setCtsLastSyncedTime(`Today at ${nowStr} EAT`);
      setCtsSyncSuccess(`Kenya Judiciary CTS Electronic Bridge Synchronized: Docket ${matter.ctsNumber} verified with Milimani Registry.`);
      
      const newUpdate: JudiciaryCaseUpdate = {
        id: `cts-sync-${Date.now()}`,
        timestamp: 'Just now',
        title: 'CTS Live Electronic Bridge Polled',
        description: `Verified no pending cause list amendments or requisitions for docket ${matter.ctsNumber}. Official court seal authenticated.`,
        summary: `Verified no pending cause list amendments or requisitions for docket ${matter.ctsNumber}.`,
        category: 'e-filing',
        priority: 'Normal',
        ctsReference: matter.ctsNumber,
        isRead: true,
        isUnread: false
      };
      setUpdatesList(prev => [newUpdate, ...prev]);

      setTimeout(() => {
        setCtsSyncSuccess(null);
      }, 5000);
    }, 1200);
  };

  // Consultation analytics metrics
  const consultationAnalytics = useMemo(() => {
    let totalBillableHours = 0;
    let resolvedActionsCount = 0;
    let totalActionsCount = 0;
    let miltonHours = 0;
    let brianHours = 0;
    let chambersCount = 0;
    let virtualCount = 0;

    allConsultations.forEach(c => {
      const hrs = c.billableHours || 1.5;
      totalBillableHours += hrs;
      if (c.advocateName.toLowerCase().includes('milton')) {
        miltonHours += hrs;
      } else {
        brianHours += hrs;
      }
      if (c.actionItems) {
        totalActionsCount += c.actionItems.length;
        resolvedActionsCount += Math.max(1, c.actionItems.length - 1);
      }
      if (c.forumLocation?.toLowerCase().includes('boardroom') || c.forumLocation?.toLowerCase().includes('chambers')) {
        chambersCount++;
      } else {
        virtualCount++;
      }
    });

    if (totalActionsCount === 0) {
      totalActionsCount = 12;
      resolvedActionsCount = 11;
    }

    const actionRate = Math.round((resolvedActionsCount / totalActionsCount) * 100);
    const miltonPct = Math.round((miltonHours / (totalBillableHours || 1)) * 100);
    const brianPct = 100 - miltonPct;

    return {
      totalBillableHours: parseFloat(totalBillableHours.toFixed(1)),
      retainerConsumptionPct: 64,
      actionResolutionPct: actionRate || 88,
      miltonHours: parseFloat(miltonHours.toFixed(1)),
      miltonPct,
      brianHours: parseFloat(brianHours.toFixed(1)),
      brianPct,
      chambersCount,
      virtualCount,
      aroAssessedFee: `KES ${(totalBillableHours * 35000).toLocaleString()}`
    };
  }, [allConsultations]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#090D15] border border-[#C5A880]/40 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-[#0E1522] border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 flex items-center justify-center text-[#C5A880] border border-[#C5A880]/30 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#C5A880] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t('dashboard.ctsSync')}</span>
                <span className="text-[#4E5A70]">·</span>
                <span className="text-[#8C98AE] font-mono">{matter.ctsNumber}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-cinzel text-white flex items-center gap-2">
                {t('dashboard.title')}
              </h3>
            </div>
          </div>

          {/* Quick Matter Switcher & Top Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center bg-[#131B29] border border-[#232E43] rounded-lg px-2.5 py-1 text-xs">
              <span className="text-[#8C98AE] mr-2 hidden sm:inline">{t('dashboard.switchMatter')}:</span>
              <select
                aria-label={t('dashboard.switchMatter')}
                value={matter.reference}
                onChange={(e) => {
                  const found = MOCK_CLIENT_MATTERS.find(m => m.reference === e.target.value);
                  if (found) onSelectMatter(found);
                }}
                className="bg-transparent text-[#E4C999] font-mono text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {MOCK_CLIENT_MATTERS.map(m => (
                  <option key={m.reference} value={m.reference} className="bg-[#0E1522] text-white">
                    {m.reference} - {m.clientEntity}
                  </option>
                ))}
              </select>
            </div>

            {/* Judiciary Updates Notification Bell */}
            <button
              onClick={() => {
                setIsNotificationsOpen(true);
                setUnreadUpdatesCount(0);
              }}
              className="relative p-2 bg-[#172132] hover:bg-[#1F2C44] text-[#C5A880] rounded-lg border border-[#C5A880]/30 transition-all flex items-center justify-center"
              title={t('judiciary.updatesTitle')}
              aria-label="Judiciary Case Updates"
            >
              <Bell className="w-4 h-4" />
              {unreadUpdatesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-md">
                  {unreadUpdatesCount}
                </span>
              )}
            </button>

            {/* Deep Document Search Button */}
            <button
              onClick={() => setIsDocSearchModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172132] hover:bg-[#1F2C44] text-[#E4C999] text-xs font-medium rounded-lg border border-[#C5A880]/30 transition-all shadow-sm"
              title="Full-Text Document Discovery (⌘D)"
            >
              <Search className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="hidden sm:inline">Search Docs</span>
              <span className="text-[10px] font-mono text-[#8C98AE]">⌘D</span>
            </button>

            {/* Biometric Enclave Status / Challenge */}
            <button
              onClick={() => {
                setBiometricTargetDoc(null);
                setPendingBiometricAction(null);
                setIsBiometricGateOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 text-xs font-medium rounded-lg border border-emerald-500/40 transition-all shadow-sm"
              title="FIDO2 Level 3 Hardware Enclave - Click to Verify"
            >
              <Fingerprint className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden md:inline">Biometrics Active</span>
            </button>

            {/* Meeting Alerts & Hearing Reminders Trigger */}
            <button
              onClick={() => setIsMeetingAlertsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 text-xs font-medium rounded-lg border border-amber-500/40 transition-all shadow-sm"
              title="Open Meeting Alerts & Court Hearing Reminders"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Meeting Alerts</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-900/80 text-[10px] font-mono text-amber-300 font-bold border border-amber-500/30">3</span>
            </button>

            {/* AI / Institutional Legal Summary Trigger */}
            <button
              onClick={() => {
                setSummaryTargetDoc(null);
                setSummaryTargetConsultation(null);
                setSummarySourceTitle(`Matter Docket ${matter.reference} - Comprehensive Legal Summary`);
                setSummaryTranscriptText(undefined);
                setIsLegalSummaryOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C5A880]/15 hover:bg-[#C5A880] text-[#E4C999] hover:text-[#0A0E17] text-xs font-semibold rounded-lg border border-[#C5A880]/40 transition-all shadow-sm"
              title="Generate Legal Executive Summary & Boardroom Briefing"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Legal Summary</span>
            </button>

            <button
              onClick={() => setIsStatementModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172132] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] text-xs font-medium rounded-lg border border-[#C5A880]/30 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('dashboard.exportStatement')}</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#20181A] hover:bg-[#341F24] text-rose-300 text-xs font-medium rounded-lg border border-rose-500/30 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t('dashboard.logout')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8C98AE] hover:text-white rounded-lg transition-colors"
              title="Close Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Client Entity Banner & Quick Metrics */}
        <div className="bg-[#0B101A] px-6 py-4 border-b border-[#1A2334]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#C5A880]">
                <span>{matter.clientEntity}</span>
                <span className="text-[#3E4A5E]">|</span>
                <span className="text-[#9BA5B7]">{matter.forum}</span>
              </div>
              <h4 className="text-base sm:text-lg font-cinzel text-white mt-0.5 leading-snug">
                {matter.caseTitle}
              </h4>
              <p className="text-xs text-[#8C98AE] mt-1 flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                <span>Bench: <strong className="text-slate-200 font-medium">{matter.bench}</strong></span>
              </p>
            </div>

            {/* Status Pills Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div className="p-2.5 bg-[#101724] border border-[#1F2B3E] rounded-xl">
                <span className="text-[10px] uppercase tracking-wider text-[#7E8B9F] block font-medium">
                  {t('dashboard.currentStage')}
                </span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-0.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {matter.status.split('-')[0]}
                </span>
              </div>

              <div className="p-2.5 bg-[#101724] border border-[#1F2B3E] rounded-xl">
                <span className="text-[10px] uppercase tracking-wider text-[#7E8B9F] block font-medium">
                  {t('dashboard.nextHearing')}
                </span>
                <span className="text-xs font-semibold text-white mt-0.5 block truncate">
                  {matter.nextHearingDate.split(' at ')[0]}
                </span>
              </div>

              <div className="p-2.5 bg-[#101724] border border-[#1F2B3E] rounded-xl">
                <span className="text-[10px] uppercase tracking-wider text-[#7E8B9F] block font-medium">
                  {t('dashboard.leadCounsel')}
                </span>
                <span className="text-xs font-semibold text-[#E4C999] mt-0.5 block truncate">
                  {matter.leadAdvocate.split('(')[0]}
                </span>
              </div>

              <div className="p-2.5 bg-[#101724] border border-[#1F2B3E] rounded-xl">
                <span className="text-[10px] uppercase tracking-wider text-[#7E8B9F] block font-medium">
                  {t('dashboard.escrowBalance')}
                </span>
                <span className="text-xs font-mono font-bold text-white mt-0.5 block truncate">
                  {matter.escrowDeposit.split(' ')[0]} {matter.escrowDeposit.split(' ')[1]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Notifications & Toasts */}
        {downloadNotice && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{downloadNotice}</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400/80">SHA-256 Validated</span>
          </div>
        )}

        {uploadSuccessNotice && (
          <div className="mx-6 mt-4 p-3 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-cyan-200 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>{uploadSuccessNotice}</span>
          </div>
        )}

        {virtualCourtNotice && (
          <div className="mx-6 mt-4 p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{virtualCourtNotice}</span>
            </div>
            <button 
              onClick={() => setVirtualCourtNotice(null)}
              className="text-amber-400 text-xs font-mono hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {ctsSyncSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{ctsSyncSuccess}</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400/90 font-semibold">CTS Registry Reconciled</span>
          </div>
        )}

        {/* Navigation Tabs Header */}
        <div className="px-6 border-b border-[#1E293B] bg-[#0C121D] flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-3 text-xs font-medium tracking-wide border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'status'
                ? 'border-[#C5A880] text-[#E4C999] bg-[#C5A880]/10 font-semibold'
                : 'border-transparent text-[#8C98AE] hover:text-white hover:bg-[#131A26]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t('dashboard.tabStatus')}</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-3 text-xs font-medium tracking-wide border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-[#C5A880] text-[#E4C999] bg-[#C5A880]/10 font-semibold'
                : 'border-transparent text-[#8C98AE] hover:text-white hover:bg-[#131A26]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('dashboard.tabDocuments')}</span>
            <span className="px-1.5 py-0.2 bg-[#1A2436] rounded-full text-[10px] text-[#A6B2C8]">
              {matter.documents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('consultations')}
            className={`px-4 py-3 text-xs font-medium tracking-wide border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'consultations'
                ? 'border-[#C5A880] text-[#E4C999] bg-[#C5A880]/10 font-semibold'
                : 'border-transparent text-[#8C98AE] hover:text-white hover:bg-[#131A26]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t('dashboard.tabConsultations')}</span>
            <span className="px-1.5 py-0.2 bg-[#1A2436] rounded-full text-[10px] text-[#A6B2C8]">
              {allConsultations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-3 text-xs font-medium tracking-wide border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'billing'
                ? 'border-[#C5A880] text-[#E4C999] bg-[#C5A880]/10 font-semibold'
                : 'border-transparent text-[#8C98AE] hover:text-white hover:bg-[#131A26]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{t('dashboard.tabBilling')}</span>
          </button>

          <button
            onClick={() => setActiveTab('dispatch')}
            className={`px-4 py-3 text-xs font-medium tracking-wide border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dispatch'
                ? 'border-[#C5A880] text-[#E4C999] bg-[#C5A880]/10 font-semibold'
                : 'border-transparent text-[#8C98AE] hover:text-white hover:bg-[#131A26]'
            }`}
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>{t('dashboard.tabDispatch')}</span>
            <span className="w-2 h-2 rounded-full bg-[#C5A880]" />
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Urgent Upcoming Meeting & Court Hearing Alert Banner */}
          {!dismissUpcomingAlertBanner && (
            <div className="p-4 bg-gradient-to-r from-[#17130F] via-[#1A1612] to-[#141822] rounded-2xl border border-amber-500/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40 shadow-inner">
                  <BellRing className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold">
                      Upcoming Hearing Alert · In 19 Days
                    </span>
                    <span className="text-xs text-[#6F7B91] hidden sm:inline">|</span>
                    <span className="text-xs font-mono text-[#E4C999]">
                      25 Nov 2026 · 14:00 EAT
                    </span>
                  </div>
                  <h4 className="text-sm font-cinzel text-white mt-0.5">
                    Pre-Evidentiary Hearing Strategy Conference (Senior Counsel Milton Angwenyi)
                  </h4>
                  <p className="text-xs text-[#9AA7BC] mt-0.5">
                    Automated SMS alerts active for +254 700 842 190. Standard Chartered USD $5M bond injunction preparation.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsMeetingAlertsOpen(true)}
                  className="px-3 py-1.5 bg-[#251D14] hover:bg-amber-500 hover:text-slate-950 text-amber-300 rounded-lg text-xs font-semibold border border-amber-500/40 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Alert Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const upcomingConf = allConsultations.find(c => c.status === 'Confirmed & Scheduled') || allConsultations[0];
                    setSummaryTargetDoc(null);
                    setSummaryTargetConsultation(upcomingConf);
                    setSummarySourceTitle(`Upcoming Hearing Executive Briefing: ${upcomingConf.reference}`);
                    setIsLegalSummaryOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#C5A880]/15 hover:bg-[#C5A880] text-[#E4C999] hover:text-[#0A0E17] rounded-lg text-xs font-semibold border border-[#C5A880]/40 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Briefing</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDismissUpcomingAlertBanner(true)}
                  className="p-1.5 text-[#738299] hover:text-white rounded-lg transition-colors"
                  title="Dismiss Alert Banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* ================= TAB 1: MATTER STATUS & CHRONOLOGY ================= */}
          {activeTab === 'status' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Kenya Judiciary Case Filing System (CTS) Live Electronic Bridge */}
              <div className="p-5 sm:p-6 bg-[#0E1522] rounded-2xl border border-[#C5A880]/30 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1A2538] pb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-white tracking-wide uppercase">
                          {t('judiciary.bridgeTitle')}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {t('judiciary.connected')}
                        </span>
                        <span className="text-xs text-[#526079] hidden sm:inline">|</span>
                        <span className="text-xs text-[#8C98AE] font-mono">Milimani Commercial & Tax Division</span>
                      </div>
                      <p className="text-xs text-[#9BA7BA] mt-1">
                        {t('judiciary.bridgeDesc')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleTriggerCtsSync}
                      disabled={isCtsSyncing}
                      className="flex items-center gap-2 px-3.5 py-2 bg-[#172236] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] rounded-xl text-xs font-semibold border border-[#C5A880]/40 transition-all shadow-sm disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCtsSyncing ? 'animate-spin' : ''}`} />
                      <span>{isCtsSyncing ? t('judiciary.syncing') : t('judiciary.syncNow')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#111724] hover:bg-[#1A2336] text-white rounded-xl text-xs border border-[#202C40] transition-colors"
                    >
                      <Bell className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span className="hidden sm:inline">Case Alerts</span>
                      {unreadUpdatesCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                          {unreadUpdatesCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4 text-xs">
                  <div className="p-3 bg-[#111826] rounded-xl border border-[#1A2538]">
                    <span className="text-[10px] uppercase font-mono text-[#718097] block">
                      {t('judiciary.docketId')}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#E4C999] mt-0.5 block truncate">
                      {matter.ctsNumber}
                    </span>
                    <span className="text-[10px] text-[#4E5C73] mt-0.5 block">High Court Electronic Registry</span>
                  </div>

                  <div className="p-3 bg-[#111826] rounded-xl border border-[#1A2538]">
                    <span className="text-[10px] uppercase font-mono text-[#718097] block">
                      {t('judiciary.lastSync')}
                    </span>
                    <span className="font-mono text-xs font-medium text-emerald-400 mt-0.5 block truncate">
                      {ctsLastSyncedTime}
                    </span>
                    <span className="text-[10px] text-[#4E5C73] mt-0.5 block">256-Bit SSL CTS Gateway</span>
                  </div>

                  <div className="p-3 bg-[#111826] rounded-xl border border-[#1A2538]">
                    <span className="text-[10px] uppercase font-mono text-[#718097] block">
                      Electronic Seal Hash
                    </span>
                    <span className="font-mono text-[11px] text-[#8C98AE] mt-0.5 block truncate" title="SHA256:7a9f4c3b28e1dc4a9041bf63d08e174b8f09">
                      SHA256:7a9f4c3b...8f09
                    </span>
                    <span className="text-[10px] text-emerald-400/80 mt-0.5 block">Legally Authenticated</span>
                  </div>

                  <div className="p-3 bg-[#111826] rounded-xl border border-[#1A2538]">
                    <span className="text-[10px] uppercase font-mono text-[#718097] block">
                      Dispatch Protocols
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-[11px]">
                      <span className={`flex items-center gap-1 ${smsAlertsEnabled ? 'text-emerald-400' : 'text-[#637288]'}`}>
                        <Smartphone className="w-3 h-3" /> SMS {smsAlertsEnabled ? 'On' : 'Off'}
                      </span>
                      <span className="text-[#364254]">·</span>
                      <span className={`flex items-center gap-1 ${emailAlertsEnabled ? 'text-emerald-400' : 'text-[#637288]'}`}>
                        <Mail className="w-3 h-3" /> Email {emailAlertsEnabled ? 'On' : 'Off'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#4E5C73] mt-0.5 block">Immediate Registry Alerts</span>
                  </div>
                </div>
              </div>

              {/* Case Progress Meter & Milestones */}
              <div className="p-5 sm:p-6 bg-[#0E1522] rounded-2xl border border-[#1E293B] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-[#C5A880] flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#C5A880]" />
                      <span>{t('analytics.caseProgressTitle')}</span>
                    </h4>
                    <p className="text-xs text-[#8C98AE] mt-0.5">
                      {t('analytics.overallMilestone')}: <span className="text-white font-medium">Phase 4 of 6 · Trial Submissions & Expert Witness Examination</span>
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1 self-start sm:self-auto bg-[#131B2A] px-3.5 py-1.5 rounded-xl border border-[#212D42]">
                    <span className="text-2xl font-mono font-bold text-white">
                      {matter.caseCompletionPercentage || 68}
                    </span>
                    <span className="text-sm font-mono text-[#C5A880] font-semibold">%</span>
                    <span className="text-[10px] text-[#718096] uppercase ml-1 font-mono tracking-wider">Completed</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full h-3 bg-[#131B2A] rounded-full overflow-hidden p-0.5 border border-[#222E44]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-[#C5A880] to-[#E4C999] transition-all duration-1000 shadow-md"
                      style={{ width: `${matter.caseCompletionPercentage || 68}%` }}
                    />
                  </div>

                  {/* 6 Procedural Milestones Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
                    {[
                      { step: '1. Injunction & Plaint', status: 'Completed', pct: '100%' },
                      { step: '2. Mutual Discovery', status: 'Completed', pct: '100%' },
                      { step: '3. Pre-Trial Conf.', status: 'Completed', pct: '100%' },
                      { step: '4. Expert Cross-Exam', status: 'Active Stage', pct: '68%', active: true },
                      { step: '5. Submissions & Ruling', status: 'Upcoming', pct: 'Scheduled' },
                      { step: '6. Decree Execution', status: 'Pending', pct: 'Future' },
                    ].map((st, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          st.active
                            ? 'bg-[#152136] border-[#C5A880]/60 ring-1 ring-[#C5A880]/30 shadow-sm'
                            : st.status === 'Completed'
                            ? 'bg-[#101724] border-emerald-500/30'
                            : 'bg-[#0B1019] border-[#1C2536] opacity-75'
                        }`}
                      >
                        <span className={`text-[10px] font-semibold block truncate ${st.active ? 'text-[#E4C999]' : st.status === 'Completed' ? 'text-emerald-400' : 'text-[#8C98AE]'}`}>
                          {st.step}
                        </span>
                        <div className="flex items-center justify-center gap-1 mt-1 text-[10px] font-mono">
                          {st.status === 'Completed' && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                          {st.active && <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-ping" />}
                          <span className={st.active ? 'text-[#C5A880] font-bold' : st.status === 'Completed' ? 'text-emerald-300' : 'text-[#637288]'}>
                            {st.pct}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upcoming Court Appearance & Cause List Spotlight */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#121927] to-[#151F33] rounded-2xl border border-[#23314B] shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-[11px] font-mono text-amber-300 font-bold flex items-center gap-1.5">
                      <CalendarClock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('analytics.upcomingCaseCountdown')}</span>
                    </span>
                    <span className="text-xs text-[#526079]">·</span>
                    <span className="text-xs text-[#C5A880] font-mono font-medium">Cause List Ref: {matter.causeListNo}</span>
                  </div>

                  <h4 className="text-lg font-cinzel text-white leading-snug">
                    Next Hearing: {matter.nextHearingDate}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#95A3B8]">
                    <p className="flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                      <span>Bench: <strong className="text-white font-medium">{matter.bench}</strong></span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                      <span>Courtroom 4B, Milimani Law Courts, Nairobi</span>
                    </p>
                    <p className="flex items-center gap-1.5 sm:col-span-2 text-slate-300">
                      <Scale className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                      <span>Subject: Substantive Trial Hearing - Cross-examination of Expert Hydrology Witness</span>
                    </p>
                  </div>
                </div>

                {/* Calendar Sync & Virtual Courtroom Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCourtCalendarExport('google')}
                    className="px-3 py-2 bg-[#172236] hover:bg-[#202E48] text-[#A6B4CD] hover:text-white rounded-xl text-xs border border-[#23334E] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3 h-3 text-[#C5A880]" />
                    <span>Google Cal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCourtCalendarExport('outlook')}
                    className="px-3 py-2 bg-[#172236] hover:bg-[#202E48] text-[#A6B4CD] hover:text-white rounded-xl text-xs border border-[#23334E] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3 h-3 text-[#C5A880]" />
                    <span>Outlook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCourtCalendarExport('ics')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                      copiedCalendarId === 'court-hearing'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-[#1C2638] text-[#E4C999] hover:bg-[#27344D] border-[#C5A880]/30'
                    }`}
                  >
                    {copiedCalendarId === 'court-hearing' ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{copiedCalendarId === 'court-hearing' ? 'Calendar Saved' : '.ics Sync'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVirtualCourtNotice(`Judiciary Virtual Court Session Link: ${matter.virtualCourtRoom} (Passcode: CTS-MIL-2026). Counsel robed protocol applies.`);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#C5A880] text-[#0A0E17] font-semibold text-xs tracking-wider uppercase rounded-xl hover:brightness-110 shadow-lg shadow-[#C5A880]/15 transition-all whitespace-nowrap"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{t('dashboard.joinVirtual')}</span>
                  </button>
                </div>
              </div>

              {/* Procedural Chronology Timeline */}
              <div className="p-5 sm:p-6 bg-[#0E1522] rounded-2xl border border-[#1E293B]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-[#C5A880] font-semibold">
                      Judicial Procedural Chronology & Milestone Progress
                    </h4>
                    <p className="text-xs text-[#8C98AE] mt-0.5">
                      Verified real-time Milestones under Civil Procedure Rules 2010 & NCIA Arbitral Timetable
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#8C98AE] bg-[#141C2B] px-2.5 py-1 rounded-lg border border-[#222E46]">
                    Docket: {matter.reference}
                  </span>
                </div>

                {/* Vertical Timeline */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-emerald-500 before:via-[#C5A880] before:to-[#222E46]">
                  {matter.chronology.map((step, idx) => (
                    <div key={idx} className="relative group">
                      {/* Node Circle */}
                      <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                        step.status === 'completed'
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                          : step.status === 'current'
                          ? 'bg-[#C5A880]/20 border-[#C5A880] text-[#C5A880] ring-4 ring-[#C5A880]/15 animate-pulse'
                          : 'bg-[#121824] border-[#2C384E] text-[#5A667A]'
                      }`}>
                        {step.status === 'completed' ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : step.status === 'current' ? (
                          <span className="w-2 h-2 rounded-full bg-[#C5A880]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4A5568]" />
                        )}
                      </div>

                      {/* Content Card */}
                      <div className={`p-4 rounded-xl border transition-all ${
                        step.status === 'current'
                          ? 'bg-[#141E2F] border-[#C5A880]/50 shadow-lg shadow-[#C5A880]/5'
                          : 'bg-[#111723] border-[#1D2739]'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              {step.stage}
                            </span>
                            {step.status === 'current' && (
                              <span className="px-2 py-0.5 rounded-full bg-[#C5A880]/20 text-[#E4C999] text-[10px] font-medium border border-[#C5A880]/40">
                                ACTIVE STAGE
                              </span>
                            )}
                            {step.status === 'completed' && (
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                                COMPLETED
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-[#8C98AE] shrink-0">
                            {step.date}
                          </span>
                        </div>

                        <p className="text-xs text-[#9BA7BA] mt-2 leading-relaxed">
                          {step.notes}
                        </p>

                        {step.registryRef && (
                          <div className="mt-2.5 pt-2 border-t border-[#1C2537] flex items-center justify-between text-[11px] text-[#717E94] font-mono">
                            <span>Registry Ref: {step.registryRef}</span>
                            <span className="text-[#C5A880]">Certified Record</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Counsel & Bench Summary Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0E1522] rounded-xl border border-[#1E293B] space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#C5A880] font-semibold uppercase tracking-wider">
                    <Scale className="w-4 h-4" />
                    <span>Lead Counsel on Record</span>
                  </div>
                  <div className="text-sm font-semibold text-white">{matter.leadAdvocate}</div>
                  <p className="text-xs text-[#8C98AE]">
                    Senior Counsel Chamber Advocates admitted to the Roll of Advocates of the High Court of Kenya.
                  </p>
                </div>

                <div className="p-4 bg-[#0E1522] rounded-xl border border-[#1E293B] space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#C5A880] font-semibold uppercase tracking-wider">
                    <Building2 className="w-4 h-4" />
                    <span>Statutory Legal Framework</span>
                  </div>
                  <div className="text-sm font-semibold text-white">{matter.aroScale}</div>
                  <p className="text-xs text-[#8C98AE]">
                    Governed by the Advocates Act (Cap 16) and High Court Commercial Court Practice Directions.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 2: DOCUMENT REPOSITORY & ADVANCED E-DISCOVERY SEARCH ================= */}
          {activeTab === 'documents' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Repository Controls Bar with Advanced Search */}
              <div className="p-4 bg-[#0E1522] rounded-2xl border border-[#1E293B] space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  {/* Search Input with Clear Button */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#637085] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t('dashboard.searchDocsPlaceholder')}
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      className="w-full bg-[#121927] border border-[#222E44] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-[#5A6579] focus:outline-none focus:border-[#C5A880]"
                    />
                    {docSearch && (
                      <button
                        onClick={() => setDocSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#718099] hover:text-white"
                        title="Clear Search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Signatory Filter */}
                  <div className="flex items-center gap-2">
                    <select
                      aria-label="Filter documents by signatory"
                      value={docSignatoryFilter}
                      onChange={(e) => setDocSignatoryFilter(e.target.value)}
                      className="bg-[#121927] border border-[#222E44] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880] cursor-pointer"
                    >
                      <option value="all">{t('dashboard.filterBySignatory')}</option>
                      {allSignatories.map((sig) => (
                        <option key={sig} value={sig}>
                          {sig}
                        </option>
                      ))}
                    </select>

                    {/* Sort Order */}
                    <select
                      aria-label="Sort documents"
                      value={docSortOrder}
                      onChange={(e) => setDocSortOrder(e.target.value as any)}
                      className="bg-[#121927] border border-[#222E44] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880] cursor-pointer"
                    >
                      <option value="newest">{t('dashboard.sortByDate')}</option>
                      <option value="oldest">{t('dashboard.sortByDateOld')}</option>
                      <option value="size">{t('dashboard.sortBySize')}</option>
                    </select>

                    {/* Deep Document Search Action */}
                    <button
                      onClick={() => setIsDocSearchModalOpen(true)}
                      className="px-3.5 py-2 bg-[#1A2538] hover:bg-[#253652] text-[#E4C999] rounded-xl text-xs font-semibold border border-[#C5A880]/40 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
                      title="Full-Text Legal Search Across Pleadings & Exhibits (⌘D)"
                    >
                      <Search className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Deep Search (⌘D)</span>
                    </button>

                    {/* Document Scanner Action */}
                    <button
                      onClick={() => setIsScannerOpen(true)}
                      className="px-3.5 py-2 bg-[#101F1B] hover:bg-emerald-600 hover:text-slate-950 text-emerald-400 rounded-xl text-xs font-semibold border border-emerald-500/40 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
                    >
                      <ScanLine className="w-3.5 h-3.5" />
                      <span>Scan Document</span>
                    </button>

                    {/* Upload action */}
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="px-3.5 py-2 bg-[#1A2538] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] rounded-xl text-xs font-semibold border border-[#C5A880]/30 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{t('dashboard.uploadExhibit')}</span>
                    </button>
                  </div>
                </div>

                {/* Category Filters with Counters */}
                <div className="flex items-center justify-between gap-2 border-t border-[#182335] pt-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {['all', 'Pleadings', 'Judicial Order', 'Submissions', 'Evidence'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setDocCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                          docCategoryFilter === cat
                            ? 'bg-[#C5A880] text-[#0A0E17] font-semibold shadow-sm'
                            : 'bg-[#121927] text-[#8C98AE] hover:text-white border border-[#202C40]'
                        }`}
                      >
                        <span>{cat === 'all' ? 'All Files' : cat}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                          docCategoryFilter === cat
                            ? 'bg-[#0A0E17]/25 text-[#0A0E17] font-bold'
                            : 'bg-[#182335] text-[#718099]'
                        }`}>
                          {categoryCounts[cat] || 0}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Search match stats */}
                  <span className="text-[11px] font-mono text-[#8C98AE]">
                    {filteredDocs.length} {filteredDocs.length === 1 ? 'filing matched' : 'filings matched'} (Docket: {matter.reference})
                  </span>
                </div>
              </div>

              {/* Document Cards List with Highlighting */}
              <div className="space-y-3">
                {filteredDocs.length === 0 ? (
                  <div className="text-center py-12 p-6 bg-[#0E1522] rounded-2xl border border-[#1E293B] space-y-2">
                    <AlertCircle className="w-8 h-8 text-[#616E83] mx-auto" />
                    <p className="text-sm text-white font-medium">No documents found matching "{docSearch}"</p>
                    <p className="text-xs text-[#8C98AE]">
                      Try clearing filters or search by judicial docket hash, signatory advocate, or pleadings caption.
                    </p>
                    <button
                      onClick={() => {
                        setDocSearch('');
                        setDocCategoryFilter('all');
                        setDocSignatoryFilter('all');
                      }}
                      className="px-3.5 py-1.5 bg-[#172338] text-[#C5A880] text-xs font-semibold rounded-lg border border-[#243754] hover:bg-[#C5A880] hover:text-[#0A0E17] transition-all"
                    >
                      Reset Document Filters
                    </button>
                  </div>
                ) : (
                  filteredDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-[#0E1522] rounded-xl border border-[#1E293B] hover:border-[#C5A880]/40 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-[#141D2D] border border-[#223048] flex items-center justify-center text-[#C5A880] shrink-0 group-hover:border-[#C5A880]/50 transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white group-hover:text-[#E4C999] transition-colors">
                              {highlightMatch(doc.name, docSearch)}
                            </span>
                            <span className="px-2 py-0.5 bg-[#172235] text-[10px] font-medium text-[#A2AFCA] rounded border border-[#273854]">
                              {doc.category}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40">
                              {doc.ctsHash}
                            </span>
                            {doc.isSigned && (
                              <span className="px-2 py-0.5 bg-emerald-950/80 text-[10px] font-mono text-emerald-300 rounded border border-emerald-500/50 flex items-center gap-1 shadow-sm">
                                <Check className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
                                <span>Digitally Signed</span>
                              </span>
                            )}
                            {(doc.category === 'Evidence' || doc.category === 'Judicial Order') && (
                              <span className="px-2 py-0.5 bg-[#121B2B] text-[10px] font-mono text-amber-300 rounded border border-amber-500/40 flex items-center gap-1 shadow-sm">
                                <Fingerprint className="w-3 h-3 text-amber-400" />
                                <span>Biometric Protected</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#8C98AE] line-clamp-2">
                            {highlightMatch(doc.summary, docSearch)}
                          </p>
                          <div className="text-[11px] text-[#637288] flex items-center gap-3 font-mono flex-wrap">
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
                            <span className="truncate">Signatory: {highlightMatch(doc.signatory, docSearch)}</span>
                            {doc.isSigned && doc.signedAt && (
                              <>
                                <span>·</span>
                                <span className="text-emerald-400 font-semibold">Executed: {doc.signedAt}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                        
                        {/* Digital Signing Action */}
                        <button
                          onClick={() => executeWithBiometricGate(doc, () => {
                            setSummaryTargetConsultation(null);
                            setSummaryTargetDoc(doc);
                            setSummarySourceTitle(doc.name);
                            setSummaryTranscriptText(undefined);
                            setIsLegalSummaryOpen(true);
                          })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172236] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#E4C999] text-xs font-semibold rounded-lg border border-[#C5A880]/40 transition-all shadow-sm"
                          title="Generate Legal Executive Summary & Boardroom Briefing"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Legal Summary</span>
                        </button>

                        <button
                          onClick={() => executeWithBiometricGate(doc, () => setSigningDoc(doc))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all shadow-sm ${
                            doc.isSigned
                              ? 'bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border-emerald-500/50'
                              : 'bg-[#152336] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#E4C999] border-[#C5A880]/50'
                          }`}
                          title={doc.isSigned ? `Digitally Signed by ${doc.signedBy} · Click to Re-sign or View Seal` : "Digitally Sign Document under KICA § 83B"}
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>{doc.isSigned ? t('dashboard.signedDoc') : t('dashboard.signDoc')}</span>
                        </button>

                        <button
                          onClick={() => executeWithBiometricGate(doc, () => setOcrDoc(doc))}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141F30] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] text-xs font-semibold rounded-lg border border-[#C5A880]/40 transition-all shadow-sm"
                          title="Run Secure OCR with PII Redaction"
                        >
                          <ScanText className="w-3.5 h-3.5" />
                          <span>{t('ocr.runOcr')}</span>
                        </button>

                        <button
                          onClick={() => executeWithBiometricGate(doc, () => setAnnotatingDoc(doc))}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172338] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] text-xs font-semibold rounded-lg border border-[#C5A880]/40 transition-all shadow-sm"
                          title="Open Secure Annotation & Collaborative Review"
                        >
                          <Highlighter className="w-3.5 h-3.5" />
                          <span>{t('dashboard.annotateDoc')}</span>
                        </button>

                        <button
                          onClick={() => executeWithBiometricGate(doc, () => setSelectedDocForPreview(doc))}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151D2D] hover:bg-[#1E2A40] text-[#A6B4CD] hover:text-white text-xs font-medium rounded-lg border border-[#23314B] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>{t('dashboard.previewDoc')}</span>
                        </button>

                        <button
                          onClick={() => executeWithBiometricGate(doc, () => handleDownload(doc))}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C5A880] text-[#0A0E17] hover:brightness-110 text-xs font-semibold rounded-lg shadow-sm transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{t('dashboard.downloadDoc')}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: CONSULTATIONS & HEARINGS HISTORY ================= */}
          {activeTab === 'consultations' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Consultation History Banner with Direct Schedule Trigger */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#121927] to-[#151F33] rounded-2xl border border-[#23314B] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono text-emerald-400 font-medium">
                      ADVOCATE-CLIENT PRIVILEGED RECORD
                    </span>
                    <span className="text-xs text-[#8C98AE]">·</span>
                    <span className="text-xs text-[#C5A880] font-mono">Sec. 134 Evidence Act</span>
                  </div>
                  <h4 className="text-lg font-cinzel text-white">
                    {t('dashboard.consultationHistory')}
                  </h4>
                  <p className="text-xs text-[#95A3B8]">
                    Verbatim Attendance Minutes, Hearing Agendas, Directives, and Direct Calendar Synchronization.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap self-start md:self-center">
                  <button
                    onClick={() => setIsMeetingAlertsOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2.5 bg-[#201A12] hover:bg-amber-950/70 text-amber-300 font-medium text-xs rounded-xl border border-amber-500/40 transition-all shadow-sm"
                  >
                    <BellRing className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Meeting Alerts Center</span>
                  </button>

                  <button
                    onClick={() => {
                      setSummaryTargetDoc(null);
                      setSummaryTargetConsultation(null);
                      setSummarySourceTitle('Consultations & Hearings Strategic Briefing');
                      setIsLegalSummaryOpen(true);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2.5 bg-[#172236] hover:bg-[#1E2E4A] text-[#E4C999] font-medium text-xs rounded-xl border border-[#C5A880]/30 transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Legal Summary</span>
                  </button>

                  <button
                    onClick={() => setIsRecordingVoiceOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2.5 bg-[#172236] hover:bg-[#1E2E4A] text-[#E4C999] font-medium text-xs rounded-xl border border-[#C5A880]/30 transition-all shadow-sm"
                  >
                    <Mic className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>{t('analytics.dictateVoiceNote')}</span>
                  </button>

                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#C5A880] text-[#0A0E17] font-semibold text-xs tracking-wider uppercase rounded-xl hover:brightness-110 shadow-lg shadow-[#C5A880]/10 transition-all whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('dashboard.bookNewConsultation')}</span>
                  </button>
                </div>
              </div>

              {/* Consultation & Strategic Advocacy Analytics Dashboard */}
              <div className="p-5 sm:p-6 bg-[#0E1522] rounded-2xl border border-[#1E293B] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A2538] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#C5A880]/15 flex items-center justify-center text-[#C5A880] border border-[#C5A880]/30">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                        {t('analytics.title')}
                      </h4>
                      <p className="text-xs text-[#8C98AE]">
                        {t('analytics.subtitle')}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-800/40 self-start sm:self-auto">
                    ARO Schedule VI Compliant
                  </span>
                </div>

                {/* 4 Core Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-3.5 bg-[#111826] rounded-xl border border-[#1E2A3E]">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#7C8B9F] block">
                      {t('analytics.totalBillableHours')}
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl font-mono font-bold text-white">
                        {consultationAnalytics.totalBillableHours}
                      </span>
                      <span className="text-xs text-[#C5A880] font-mono">hrs</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
                      ARO Assessed: {consultationAnalytics.aroAssessedFee}
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#111826] rounded-xl border border-[#1E2A3E]">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#7C8B9F] block">
                      {t('analytics.retainerConsumption')}
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl font-mono font-bold text-white">
                        {consultationAnalytics.retainerConsumptionPct}%
                      </span>
                      <span className="text-xs text-[#8C98AE]">utilized</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1A2538] rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-[#C5A880] rounded-full" style={{ width: `${consultationAnalytics.retainerConsumptionPct}%` }} />
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#111826] rounded-xl border border-[#1E2A3E]">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#7C8B9F] block">
                      {t('analytics.directivesResolutionRate')}
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl font-mono font-bold text-emerald-400">
                        {consultationAnalytics.actionResolutionPct}%
                      </span>
                      <span className="text-xs text-[#8C98AE]">completed</span>
                    </div>
                    <span className="text-[11px] text-[#718096] mt-1 block">
                      Directives Executed to Court Record
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#111826] rounded-xl border border-[#1E2A3E]">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#7C8B9F] block">
                      {t('analytics.counselAllocation')}
                    </span>
                    <div className="mt-1.5 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-white truncate">Milton Angwenyi, SC:</span>
                        <span className="text-[#E4C999] font-mono font-bold">{consultationAnalytics.miltonPct}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#8C98AE] truncate">Brian Kipkemboi:</span>
                        <span className="text-slate-300 font-mono font-bold">{consultationAnalytics.brianPct}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modality & Allocation Visual Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  <div className="p-3 bg-[#111724] rounded-xl border border-[#1D273A] flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[#8C98AE] text-[11px] block">{t('analytics.sessionModality')}:</span>
                      <div className="flex items-center gap-3 mt-1 text-xs font-medium">
                        <span className="text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#C5A880]" />
                          Boardroom: {consultationAnalytics.chambersCount}
                        </span>
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-emerald-400" />
                          Virtual: {consultationAnalytics.virtualCount}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#718096] bg-[#161F2E] px-2 py-1 rounded">
                      Encrypted Audio / Video
                    </span>
                  </div>

                  <div className="p-3 bg-[#111724] rounded-xl border border-[#1D273A] flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[#8C98AE] text-[11px] block">Statutory Privilege Guarantee:</span>
                      <span className="text-emerald-400 font-medium text-xs block mt-0.5">
                        Sec. 134 Evidence Act (Cap 80) Absolute Protection
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/40 border border-emerald-800/40 px-2 py-1 rounded">
                      Enforced
                    </span>
                  </div>
                </div>
              </div>

              {/* Transcribed Meeting Sentiment Trends & Client Satisfaction Visualization */}
              <MeetingSentimentVisualization matter={matter} allConsultations={allConsultations} />

              {/* Consultation Search & Status Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-[#0E1522] rounded-xl border border-[#1E293B]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#637085] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search consultations by counsel, docket reference, directives..."
                    value={consultationSearch}
                    onChange={(e) => setConsultationSearch(e.target.value)}
                    className="w-full bg-[#121927] border border-[#222E44] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#5A6579] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {(['all', 'Confirmed', 'Completed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setConsultationStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        consultationStatusFilter === st
                          ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                          : 'bg-[#121927] text-[#8C98AE] hover:text-white border border-[#202C40]'
                      }`}
                    >
                      {st === 'all' ? 'All Sessions' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consultation History Cards List */}
              <div className="space-y-4">
                {filteredConsultations.length === 0 ? (
                  <div className="text-center py-12 p-6 bg-[#0E1522] rounded-2xl border border-[#1E293B] space-y-2">
                    <AlertCircle className="w-8 h-8 text-[#616E83] mx-auto" />
                    <p className="text-sm text-white font-medium">No consultation records match your filter.</p>
                    <button
                      onClick={() => {
                        setConsultationSearch('');
                        setConsultationStatusFilter('all');
                      }}
                      className="px-3 py-1.5 bg-[#172338] text-[#C5A880] text-xs rounded-lg border border-[#243754]"
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : (
                  filteredConsultations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-5 bg-[#0E1522] rounded-2xl border border-[#1E293B] hover:border-[#C5A880]/50 transition-all space-y-4 group"
                    >
                      {/* Top Header of Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A2538] pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-[#E4C999]">
                              {rec.reference}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                              rec.status.includes('Confirmed')
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                                : 'bg-[#182335] text-[#93A1B8] border-[#253650]'
                            }`}>
                              {rec.status}
                            </span>
                            <span className="text-[10px] text-[#637288] font-mono">
                              Docket: {rec.matterDocket || matter.reference}
                            </span>
                          </div>
                          <h4 className="text-base font-cinzel text-white mt-1 group-hover:text-[#E4C999] transition-colors">
                            {rec.advocateName} · <span className="text-xs font-sans font-medium text-[#8C98AE]">{rec.advocateRole}</span>
                          </h4>
                          <span className="text-xs text-[#C5A880] block mt-0.5">
                            Practice: {rec.practiceArea}
                          </span>
                        </div>

                        <div className="text-xs text-[#8C98AE] font-mono sm:text-right bg-[#121927] p-2.5 rounded-xl border border-[#1E2A3E]">
                          <div className="text-white font-semibold flex items-center sm:justify-end gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
                            <span>{rec.scheduledDate}</span>
                          </div>
                          <div className="text-emerald-400 font-semibold mt-0.5">
                            {rec.scheduledTime}
                          </div>
                        </div>
                      </div>

                      {/* Minutes & Legal Summary */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] uppercase tracking-wider font-mono text-[#C5A880] font-semibold block">
                          {t('dashboard.consultationMinutes')}:
                        </span>
                        <p className="text-xs text-[#B2BDCE] leading-relaxed bg-[#111826] p-3.5 rounded-xl border border-[#1D2A3E]">
                          {rec.summaryNotes}
                        </p>
                      </div>

                      {/* Action Items List */}
                      {rec.actionItems && rec.actionItems.length > 0 && (
                        <div className="p-3 bg-[#0C121D] rounded-xl border border-[#1A2538] space-y-1.5">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-[#C5A880] font-semibold block">
                            {t('dashboard.actionItems')}:
                          </span>
                          <ul className="text-xs text-[#8C98AE] space-y-1">
                            {rec.actionItems.map((item, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] shrink-0 mt-1.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Privileged Counsel Voice Dictation Player */}
                      {rec.voiceNote && (
                        <div className="p-4 bg-[#0A0E17] rounded-xl border border-[#C5A880]/35 shadow-inner space-y-3">
                          {/* Player Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A2336] pb-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-[#C5A880]/20 flex items-center justify-center text-[#C5A880] border border-[#C5A880]/40">
                                <Volume2 className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-semibold text-white">
                                    {rec.voiceNote.title}
                                  </span>
                                  <span className="text-[10px] font-mono text-[#E4C999] bg-[#162135] px-2 py-0.5 rounded border border-[#233552]">
                                    {rec.voiceNote.speaker}
                                  </span>
                                </div>
                                <span className="text-[10px] text-[#7888A0] block mt-0.5">
                                  {rec.voiceNote.role} · Recorded: {rec.voiceNote.recordedDate}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto text-[11px] font-mono text-[#8C98AE]">
                              <span className="px-2 py-0.5 rounded bg-[#131A26] border border-[#1E293B] text-[10px] text-emerald-400">
                                256-Bit Encrypted Audio
                              </span>
                              <span className="text-white font-bold">{rec.voiceNote.duration}</span>
                            </div>
                          </div>

                          {/* Interactive Player Controls & Waveform */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#111724] p-3 rounded-xl border border-[#1B2538]">
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleAudio(rec.voiceNote!.id)}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                  activeAudioId === rec.voiceNote!.id
                                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                                    : 'bg-[#C5A880] text-[#0A0E17] hover:brightness-110 shadow-md shadow-[#C5A880]/20'
                                }`}
                                title={activeAudioId === rec.voiceNote!.id ? 'Pause Dictation' : 'Play Counsel Dictation'}
                              >
                                {activeAudioId === rec.voiceNote!.id ? (
                                  <Pause className="w-4 h-4 fill-current" />
                                ) : (
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRewindAudio(rec.voiceNote!.id)}
                                className="p-2 text-[#8C98AE] hover:text-white rounded-lg hover:bg-[#1A2436] transition-colors"
                                title="Rewind to Start"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Animated Equalizer Waveform */}
                            <div className="flex-1 flex items-center gap-1 h-8 px-2 bg-[#090D15] rounded-lg border border-[#182334] overflow-hidden">
                              {[
                                35, 60, 45, 80, 65, 95, 40, 75, 55, 90, 70, 85, 30, 65, 80, 50, 90, 75, 60, 85, 40, 95, 70, 50, 80, 65, 45, 70
                              ].map((baseH, idx) => {
                                const isPlaying = activeAudioId === rec.voiceNote!.id;
                                const barElapsed = ((audioPlaybackSeconds[rec.voiceNote!.id] || 0) / (rec.voiceNote!.durationSeconds || 270));
                                const barPos = idx / 28;
                                const isPassed = barPos <= barElapsed;

                                return (
                                  <div
                                    key={idx}
                                    className={`w-1 rounded-full transition-all duration-300 ${
                                      isPassed
                                        ? 'bg-[#C5A880]'
                                        : 'bg-[#253248]'
                                    }`}
                                    style={{
                                      height: isPlaying
                                        ? `${Math.max(20, (baseH * (0.6 + 0.4 * Math.sin((idx + Date.now() / 200) % 10))))}%`
                                        : `${baseH * 0.4}%`,
                                    }}
                                  />
                                );
                              })}
                            </div>

                            {/* Scrubber Time & Speed */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs font-mono">
                              <span className="text-[#C5A880] font-semibold">
                                {formatSeconds(audioPlaybackSeconds[rec.voiceNote!.id] || 0)}
                                <span className="text-[#56657C]"> / {rec.voiceNote.duration}</span>
                              </span>

                              <button
                                type="button"
                                onClick={() => {
                                  setAudioSpeed(s => (s === 1.0 ? 1.5 : s === 1.5 ? 2.0 : 1.0));
                                }}
                                className="px-2 py-1 bg-[#1A2538] hover:bg-[#24334C] text-[#E4C999] rounded text-[11px] font-bold border border-[#2B3B54] transition-colors"
                                title="Playback Speed"
                              >
                                {audioSpeed.toFixed(1)}x
                              </button>
                            </div>
                          </div>

                          {/* Verbatim Transcript Accordion & Memo Download */}
                          <div className="pt-1">
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedTranscriptId(
                                    expandedTranscriptId === rec.voiceNote!.id ? null : rec.voiceNote!.id
                                  );
                                }}
                                className="text-xs font-medium text-[#C5A880] hover:text-[#E4C999] flex items-center gap-1.5 transition-colors"
                              >
                                <FileAudio className="w-3.5 h-3.5" />
                                <span>
                                  {expandedTranscriptId === rec.voiceNote!.id
                                    ? t('analytics.hideTranscript')
                                    : t('analytics.viewTranscript')}
                                </span>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 transition-transform ${
                                    expandedTranscriptId === rec.voiceNote!.id ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleCopyTranscript(rec.voiceNote!.id, rec.voiceNote!.transcript)}
                                  className="text-[11px] font-mono text-[#8C98AE] hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-[#131B2A] border border-[#1E293B] transition-colors"
                                  title="Copy Verbatim Transcript"
                                >
                                  {copiedTranscriptId === rec.voiceNote!.id ? (
                                    <>
                                      <CheckCheck className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-[#C5A880]" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadVoiceMemo(rec.voiceNote!)}
                                  className="text-[11px] font-mono text-[#C5A880] hover:text-white flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#172338] border border-[#C5A880]/30 transition-colors"
                                  title="Download Certified Memo"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Memo (.txt)</span>
                                </button>
                              </div>
                            </div>

                            {expandedTranscriptId === rec.voiceNote!.id && (
                              <div className="mt-2.5 p-3.5 bg-[#080C14] rounded-xl border border-[#1E293B] text-xs text-[#CBD5E1] font-sans leading-relaxed animate-fadeIn">
                                <div className="flex items-center justify-between text-[10px] font-mono text-[#6A7B93] border-b border-[#182335] pb-1.5 mb-2">
                                  <span>VERBATIM SPEECH-TO-TEXT LOG · SECTION 134 PRIVILEGED</span>
                                  <span>ACCURACY CONFIRMED 99.4%</span>
                                </div>
                                <p className="italic text-[#BAC7DC] whitespace-pre-wrap">
                                  "{rec.voiceNote.transcript}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Attendees Row & Calendar Sync Action Buttons */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-[#182335]">
                        <div className="flex items-center gap-1.5 text-xs text-[#718099] flex-wrap">
                          <UserCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span className="text-white font-medium">Attendees:</span>
                          <span>{rec.attendees ? rec.attendees.join(', ') : `${rec.advocateName}, CID Ltd Counsel`}</span>
                        </div>

                        {/* Meeting Alert, Legal Summary, Transcript & Calendar Sync Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setIsMeetingAlertsOpen(true)}
                            className="px-2.5 py-1.5 bg-[#221B12] hover:bg-amber-950 text-amber-300 rounded-lg text-xs font-semibold border border-amber-500/40 transition-all flex items-center gap-1.5 shadow-sm"
                            title="Configure SMS & Email Alert for this session"
                          >
                            <Bell className="w-3.5 h-3.5 text-amber-400" />
                            <span>Set Alert</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSummaryTargetDoc(null);
                              setSummaryTargetConsultation(rec);
                              setSummarySourceTitle(`Consultation Briefing: ${rec.reference} (${rec.advocateName})`);
                              setSummaryTranscriptText(rec.voiceNote?.transcript);
                              setIsLegalSummaryOpen(true);
                            }}
                            className="px-2.5 py-1.5 bg-[#172236] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#E4C999] rounded-lg text-xs font-semibold border border-[#C5A880]/30 transition-all flex items-center gap-1.5 shadow-sm"
                            title="Synthesize Executive Legal Summary for this session"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Legal Summary</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedTranscriptConsultation(rec)}
                            className="px-2.5 py-1.5 bg-[#172236] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] rounded-lg text-xs font-semibold border border-[#C5A880]/30 transition-all flex items-center gap-1.5 shadow-sm"
                            title="View Full Verbatim Meeting Transcript"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Meeting Transcript</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCalendarExport(rec, 'google')}
                            className="px-2.5 py-1.5 bg-[#141C2B] hover:bg-[#1E2B42] text-[#A6B4CD] hover:text-white rounded-lg text-xs border border-[#24344E] transition-colors flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Google Cal</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCalendarExport(rec, 'outlook')}
                            className="px-2.5 py-1.5 bg-[#141C2B] hover:bg-[#1E2B42] text-[#A6B4CD] hover:text-white rounded-lg text-xs border border-[#24344E] transition-colors flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Outlook</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCalendarExport(rec, 'ics')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              copiedCalendarId === rec.id
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-[#C5A880] text-[#0A0E17] hover:brightness-110 border-[#C5A880]'
                            }`}
                          >
                            {copiedCalendarId === rec.id ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                            <span>{copiedCalendarId === rec.id ? 'Saved' : 'Download .ics'}</span>
                          </button>

                          {rec.meetingLink && (
                            <a
                              href={rec.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-[#1E283A] hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg text-xs font-semibold border border-emerald-600/40 transition-all flex items-center gap-1"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Virtual Room</span>
                            </a>
                          )}
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* ================= TAB 3: BILLING DASHBOARD & ESCROW TRUST LEDGER ================= */}
          {activeTab === 'billing' && (
            <BillingDashboard matter={matter} />
          )}

          {/* ================= TAB 4: PRIVILEGED COUNSEL MESSENGER ================= */}
          {activeTab === 'dispatch' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Privilege Banner */}
              <div className="p-3.5 bg-[#121927] border border-[#212E46] rounded-xl flex items-center justify-between text-xs text-[#8C98AE]">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>
                    Advocate-Client Privileged Channel under <strong>Section 134 Evidence Act (Cap 80)</strong>
                  </span>
                </div>
                <span className="font-mono text-emerald-400 text-[11px]">End-to-End Chambers Protected</span>
              </div>

              {/* Message History Thread */}
              <div className="p-4 sm:p-5 bg-[#0E1522] rounded-2xl border border-[#1E293B] space-y-4 max-h-[380px] overflow-y-auto">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl border max-w-2xl ${
                      m.isOfficial
                        ? 'bg-[#121A28] border-[#202E46] mr-auto'
                        : 'bg-[#182335] border-[#C5A880]/30 ml-auto'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                        {m.isOfficial && <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />}
                        {m.sender}
                      </span>
                      <span className="text-[10px] font-mono text-[#8C98AE]">{m.timestamp}</span>
                    </div>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed">{m.content}</p>
                    <div className="mt-1 text-[10px] font-mono text-[#6C7B93]">
                      Role: {m.role}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Transmit urgent instructions or notice to Chambers Registrar & Lead Advocate..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 bg-[#121927] border border-[#232F46] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#5A667C] focus:outline-none focus:border-[#C5A880]"
                />
                <button
                  type="submit"
                  disabled={isSendingMsg || !newMessageText.trim()}
                  className="px-4 py-2.5 bg-[#C5A880] text-[#0A0E17] font-semibold text-xs tracking-wider uppercase rounded-xl hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingMsg ? 'Sending...' : 'Transmit'}</span>
                </button>
              </form>

              {msgNotice && (
                <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{msgNotice}</span>
                </p>
              )}

            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3.5 bg-[#0B101A] border-t border-[#1C2638] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7E8B9F]">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Encrypted Session: TLS 1.3 · Kenya Law Reports & Judiciary CTS Bridge Active</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-[#A6B2C8]">
              Chambers of Petersons Angwenyi & Associates Advocates
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-[#151D2C] hover:bg-[#202B40] text-white rounded-lg transition-colors text-xs"
            >
              Close
            </button>
          </div>
        </div>

      </div>

      {/* ================= DOCUMENT PREVIEW MODAL ================= */}
      <DocumentPreviewModal
        isOpen={!!selectedDocForPreview}
        onClose={() => setSelectedDocForPreview(null)}
        document={selectedDocForPreview}
        matter={matter}
        onSign={(doc) => executeWithBiometricGate(doc, () => setSigningDoc(doc))}
        onAnnotate={(doc) => executeWithBiometricGate(doc, () => setAnnotatingDoc(doc))}
        onOcr={(doc) => executeWithBiometricGate(doc, () => setOcrDoc(doc))}
        onSummary={(doc) => executeWithBiometricGate(doc, () => {
          setSummaryTargetDoc(doc);
          setSummaryTargetConsultation(null);
          setSummarySourceTitle(doc.name);
          setSummaryTranscriptText(undefined);
          setIsLegalSummaryOpen(true);
        })}
        onDownload={(doc) => executeWithBiometricGate(doc, () => handleDownload(doc))}
      />

      {/* ================= UPLOAD EXHIBIT MODAL ================= */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0D131F] border border-[#C5A880]/50 rounded-2xl shadow-2xl overflow-hidden p-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
              <div className="flex items-center gap-2 text-white font-cinzel text-base">
                <FileCheck className="w-5 h-5 text-[#C5A880]" />
                <span>Submit Supplemental Document</span>
              </div>
              <button onClick={() => setIsUploadOpen(false)} className="text-[#8C98AE] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-[#8C98AE] block mb-1">Document Title / Pleadings Caption *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supplemental Affidavit of Managing Director"
                  value={uploadDocName}
                  onChange={(e) => setUploadDocName(e.target.value)}
                  className="w-full bg-[#121927] border border-[#232F46] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#586477] focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="text-xs text-[#8C98AE] block mb-1">Document Classification *</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full bg-[#121927] border border-[#232F46] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                >
                  <option value="Evidence">Evidence & Annexures</option>
                  <option value="Pleadings">Court Pleadings & Summons</option>
                  <option value="Submissions">Legal Submissions & Authorities</option>
                </select>
              </div>

              <div className="p-3 bg-[#121A28] border border-dashed border-[#283854] rounded-xl text-center">
                <FileText className="w-6 h-6 text-[#C5A880] mx-auto mb-1" />
                <span className="text-xs text-[#A6B4CD] block font-medium">Select PDF / Exhibit Bundle</span>
                <span className="text-[10px] text-[#6B7A91] block mt-0.5">Maximum file size: 50MB (AES-256 encrypted)</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3.5 py-2 bg-[#172132] hover:bg-[#202D44] text-white text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C5A880] text-[#0A0E17] font-semibold text-xs rounded-xl hover:brightness-110 transition-all"
                >
                  Submit to Chambers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= OFFICIAL ARO CERTIFIED STATEMENT MODAL ================= */}
      {isStatementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#0B0F17] border border-[#C5A880]/60 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-8 text-slate-200">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#222E46] pb-5">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#C5A880] font-mono block">
                  ADVOCATES (REMUNERATION) ORDER · STATUTORY STATEMENT OF ACCOUNT
                </span>
                <h3 className="text-xl font-cinzel text-white mt-1">
                  Petersons Angwenyi & Associates Advocates
                </h3>
                <p className="text-xs text-[#8C98AE] mt-0.5">
                  Upper Hill Chambers, Mara Road, Nairobi · Roll of Advocates Law Society of Kenya
                </p>
              </div>
              <button
                onClick={() => setIsStatementModalOpen(false)}
                className="text-[#8C98AE] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Matter Statement Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-[#101724] p-4 rounded-xl border border-[#1E293B]">
              <div>
                <span className="text-[#8C98AE] block">Client / Corporate Account:</span>
                <span className="font-semibold text-white">{matter.clientEntity}</span>
                <span className="text-[#8C98AE] block mt-2">Matter Docket:</span>
                <span className="font-mono text-[#C5A880]">{matter.reference}</span>
              </div>
              <div>
                <span className="text-[#8C98AE] block">Kenya Judiciary CTS Number:</span>
                <span className="font-mono text-white">{matter.ctsNumber}</span>
                <span className="text-[#8C98AE] block mt-2">Escrow Bank Trust Account:</span>
                <span className="font-mono text-emerald-400">{matter.trustAccount}</span>
              </div>
            </div>

            {/* Itemized Invoices */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-[#C5A880] uppercase tracking-wider">
                Audited Fee Notes & Statutory Disbursements
              </h5>
              <div className="border border-[#1E293B] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#131A26] text-[#8C98AE] font-mono">
                    <tr>
                      <th className="p-2.5">INVOICE NO</th>
                      <th className="p-2.5">DATE</th>
                      <th className="p-2.5">DESCRIPTION</th>
                      <th className="p-2.5 text-right">TOTAL</th>
                      <th className="p-2.5 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#172132]">
                    {matter.invoices.map((inv) => (
                      <tr key={inv.invoiceNo}>
                        <td className="p-2.5 font-mono text-white">{inv.invoiceNo}</td>
                        <td className="p-2.5 text-[#8C98AE]">{inv.date}</td>
                        <td className="p-2.5 text-slate-300">{inv.description}</td>
                        <td className="p-2.5 text-right font-mono font-semibold text-white">{inv.total}</td>
                        <td className="p-2.5 text-right font-mono text-emerald-400">{inv.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Totals */}
            <div className="p-4 bg-[#121927] rounded-xl border border-[#212E46] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
              <div>
                <span className="text-[#8C98AE] block">Funds Maintained in KCB Escrow:</span>
                <span className="text-base text-[#E4C999] font-bold">{matter.escrowDeposit}</span>
              </div>
              <div className="text-right">
                <span className="text-[#8C98AE] block">Total Settled Fees (Gross):</span>
                <span className="text-base text-emerald-400 font-bold">{matter.financialSummary.settledToDate}</span>
              </div>
            </div>

            {/* Legal Certificate Footer */}
            <div className="text-[11px] text-[#717F96] border-t border-[#1C2638] pt-4 space-y-1">
              <p>
                <strong>CERTIFICATE:</strong> Certified by Lead Counsel {matter.leadAdvocate} under the Advocates Remuneration Order (Cap 16) and Advocates (Accounts) Rules. Reconciled with Kenya Commercial Bank (KCB) Escrow Trust Facility.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsStatementModalOpen(false)}
                className="px-4 py-2 bg-[#161F2E] hover:bg-[#202C42] text-white text-xs rounded-xl transition-colors"
              >
                Close Statement
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-[#C5A880] text-[#0A0E17] font-semibold text-xs rounded-xl hover:brightness-110 transition-all flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certified Statement</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= SECURE DOCUMENT ANNOTATION WORKSPACE & AUDIT TRAIL ================= */}
      {annotatingDoc && (
        <SecureDocumentAnnotationModal
          isOpen={!!annotatingDoc}
          onClose={() => setAnnotatingDoc(null)}
          document={annotatingDoc}
          matter={matter}
        />
      )}

      {/* ================= SECURE DOCUMENT OCR & SEARCHABLE TRANSCRIPT ================= */}
      {ocrDoc && (
        <SecureDocumentOCRModal
          isOpen={!!ocrDoc}
          onClose={() => setOcrDoc(null)}
          document={ocrDoc}
          matter={matter}
        />
      )}

      {/* ================= SCHEDULE PRIVILEGED CONSULTATION MODAL ================= */}
      {isBookingModalOpen && (
        <ConsultationModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          initialPractice="Corporate, Banking & Structured Finance"
          initialAdvocate={matter.leadAdvocate}
        />
      )}

      {/* ================= VOICE NOTE RECORDER MODAL ================= */}
      {isRecordingVoiceOpen && (
        <VoiceNoteRecorderModal
          isOpen={isRecordingVoiceOpen}
          onClose={() => setIsRecordingVoiceOpen(false)}
          matter={matter}
          onSaveNote={(note) => {
            setRecordedVoiceNotes(prev => [note, ...prev]);
            const newRecord: ConsultationRecord = {
              id: `rec-voice-${Date.now()}`,
              reference: `CONF-${Date.now().toString().slice(-4)}`,
              clientName: matter.clientEntity,
              corporateEntity: matter.clientEntity,
              format: 'chambers',
              matterDocket: matter.reference,
              advocateName: note.speaker || note.recordedBy || matter.leadAdvocate,
              advocateRole: note.role || note.recordedRole || 'Lead Counsel',
              practiceArea: 'Dispute Resolution & Constitutional Litigation',
              scheduledDate: note.recordedDate || note.recordedAt || 'Today',
              scheduledTime: 'Dictation Archive',
              status: 'Completed - Voice Dictated',
              summaryNotes: `Privileged Oral Dictation: "${note.title || 'Counsel Oral Memo'}". Verbatim transcription preserved with SHA-256 integrity stamp.`,
              forumLocation: 'Chambers Oral Dictation Suite',
              billableHours: 0.5,
              actionItems: [
                'Registry to extract dictation directives into formal court submissions.',
                'Opposing counsel to be served once signed by Lead Counsel.'
              ],
              attendees: [note.speaker || note.recordedBy || matter.leadAdvocate, 'Litigation Stenographer'],
              voiceNote: note
            };
            try {
              const saved = localStorage.getItem('paa_consultations');
              const parsed: ConsultationRecord[] = saved ? JSON.parse(saved) : [];
              localStorage.setItem('paa_consultations', JSON.stringify([newRecord, ...parsed]));
            } catch {
              // fallback
            }
          }}
        />
      )}

      {/* ================= JUDICIARY CASE UPDATES & CTS LIVE NOTIFICATIONS ================= */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#0B1019] border border-[#C5A880]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="px-6 py-4 bg-[#0F1624] border-b border-[#1E293B] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C5A880]/15 flex items-center justify-center text-[#C5A880] border border-[#C5A880]/30 shadow-inner">
                  <BellRing className="w-5 h-5 text-[#C5A880]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white">
                      {t('judiciary.updatesTitle')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[10px] font-mono text-emerald-400">
                      Live Bridge Active
                    </span>
                  </div>
                  <p className="text-xs text-[#8C98AE] mt-0.5">
                    {t('judiciary.updatesSubtitle')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1.5 text-[#8C98AE] hover:text-white rounded-lg transition-colors"
                title="Close Alerts"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Delivery Protocol Controls */}
            <div className="p-4 bg-[#111827] border-b border-[#1A2538] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] uppercase font-mono tracking-wider text-[#C5A880] font-semibold">
                  Automated Registry Dispatch Protocols:
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={smsAlertsEnabled}
                      onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                      className="accent-[#C5A880] rounded"
                    />
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SMS Alerts (+254 700 000 000)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={emailAlertsEnabled}
                      onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                      className="accent-[#C5A880] rounded"
                    />
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Encrypted Email (legal@corp.co.ke)</span>
                  </label>
                </div>
              </div>
              <p className="text-[11px] text-[#718096]">
                Instant push alerts dispatched to in-house counsel and corporate secretary desks upon each CTS filing timestamp.
              </p>
            </div>

            {/* Action Bar */}
            <div className="px-6 py-2.5 bg-[#0E1420] border-b border-[#172132] flex items-center justify-between text-xs">
              <span className="font-mono text-[#8C98AE]">
                Showing {updatesList.length} verified registry updates
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUpdatesList(prev => prev.map(u => ({ ...u, isUnread: false })));
                    setUnreadUpdatesCount(0);
                  }}
                  className="text-xs text-[#C5A880] hover:text-white transition-colors"
                >
                  Mark All Read
                </button>
                <span className="text-[#364356]">·</span>
                <button
                  type="button"
                  onClick={handleTriggerCtsSync}
                  disabled={isCtsSyncing}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isCtsSyncing ? 'animate-spin' : ''}`} />
                  <span>Poll Registry</span>
                </button>
              </div>
            </div>

            {/* Updates Scrollable List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {updatesList.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#8C98AE]">
                  No updates found. All records synchronized.
                </div>
              ) : (
                updatesList.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      item.isUnread
                        ? 'bg-[#141E2F] border-[#C5A880]/50 shadow-md shadow-[#C5A880]/5'
                        : 'bg-[#0E1522] border-[#1C2638]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#1A2538] pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            item.priority === 'Urgent'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                              : item.priority === 'Official Notice'
                              ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {item.priority}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {item.title}
                        </span>
                        {item.isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse" title="Unread Update" />
                        )}
                      </div>

                      <span className="text-[11px] font-mono text-[#8C98AE]">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-[#B2BDCE] mt-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-[#182335] flex items-center justify-between text-[11px] font-mono text-[#6A7B93]">
                      <span>CTS Ref: {item.ctsReference || matter.ctsNumber}</span>
                      <span className="text-emerald-400/90">Verified Court Docket</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-[#0D131F] border-t border-[#1E293B] flex items-center justify-between">
              <span className="text-[11px] text-[#718096] font-mono">
                Kenya Judiciary Integrated Court Management System
              </span>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(false)}
                className="px-4 py-1.5 bg-[#172236] hover:bg-[#202E48] text-white text-xs font-semibold rounded-lg border border-[#23334E] transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= CHAMBERS SECURE DOCUMENT SCANNER MODAL ================= */}
      {isScannerOpen && (
        <DocumentScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          matter={matter}
          onDocumentScanned={(newDoc) => {
            matter.documents.unshift(newDoc);
            setLocalDocs(prev => [newDoc, ...prev]);
            setDownloadNotice(`Document "${newDoc.name}" scanned, CTS-sealed, and deposited into Vault.`);
            setTimeout(() => setDownloadNotice(null), 4500);
          }}
        />
      )}

      {/* ================= VERBATIM MEETING TRANSCRIPT MODAL ================= */}
      {selectedTranscriptConsultation && (
        <MeetingTranscriptModal
          isOpen={!!selectedTranscriptConsultation}
          onClose={() => setSelectedTranscriptConsultation(null)}
          consultation={selectedTranscriptConsultation}
          matter={matter}
          onOpenLegalSummary={(transcriptText, title) => {
            setSummaryTargetDoc(null);
            setSummaryTargetConsultation(selectedTranscriptConsultation);
            setSummarySourceTitle(title);
            setSummaryTranscriptText(transcriptText);
            setIsLegalSummaryOpen(true);
          }}
        />
      )}

      {/* ================= SECURE DOCUMENT DIGITAL SIGNING MODAL ================= */}
      {signingDoc && (
        <SecureDocumentSigningModal
          isOpen={!!signingDoc}
          onClose={() => setSigningDoc(null)}
          document={signingDoc}
          matter={matter}
          onSignedDocument={(signed) => {
            setLocalDocs(prev => prev.map(d => d.name === signed.name ? signed : d));
            const docIdx = matter.documents.findIndex(d => d.name === signed.name);
            if (docIdx !== -1) {
              matter.documents[docIdx] = signed;
            }
            setSigningSuccessToast(`Document "${signed.name}" digitally signed & sealed under KICA § 83B!`);
            setTimeout(() => setSigningSuccessToast(null), 6000);
          }}
        />
      )}

      {/* Signing Success Floating Toast */}
      {signingSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-950/90 border border-emerald-500/60 rounded-2xl shadow-2xl text-emerald-200 text-xs font-medium flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{signingSuccessToast}</span>
          <button onClick={() => setSigningSuccessToast(null)} className="text-emerald-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= GLOBAL DOCUMENT E-DISCOVERY SEARCH MODAL ================= */}
      {isDocSearchModalOpen && (
        <DocumentSearchModal
          isOpen={isDocSearchModalOpen}
          onClose={() => setIsDocSearchModalOpen(false)}
          documents={localDocs}
          matter={matter}
          onPreview={(doc) => executeWithBiometricGate(doc, () => setSelectedDocForPreview(doc))}
          onAnnotate={(doc) => executeWithBiometricGate(doc, () => setAnnotatingDoc(doc))}
          onOcr={(doc) => executeWithBiometricGate(doc, () => setOcrDoc(doc))}
          onSign={(doc) => executeWithBiometricGate(doc, () => setSigningDoc(doc))}
          onDownload={(doc) => executeWithBiometricGate(doc, () => handleDownload(doc))}
          onSummary={(doc) => executeWithBiometricGate(doc, () => {
            setSummaryTargetConsultation(null);
            setSummaryTargetDoc(doc);
            setSummarySourceTitle(doc.name);
            setSummaryTranscriptText(undefined);
            setIsLegalSummaryOpen(true);
          })}
        />
      )}

      {/* ================= BIOMETRIC HARDWARE ENCLAVE GATE MODAL ================= */}
      {isBiometricGateOpen && (
        <BiometricGateModal
          isOpen={isBiometricGateOpen}
          onClose={() => {
            setIsBiometricGateOpen(false);
            setPendingBiometricAction(null);
          }}
          onSuccess={() => {
            if (pendingBiometricAction) {
              pendingBiometricAction();
            } else {
              setDownloadNotice('Biometric Enclave Authenticated. Privileged Session Verified.');
              setTimeout(() => setDownloadNotice(null), 4000);
            }
          }}
          documentTitle={biometricTargetDoc?.name || 'Chambers Privileged Litigation Repository'}
          reason={
            biometricTargetDoc
              ? `Restricted ${biometricTargetDoc.category} under Section 134 Evidence Act (Cap 80)`
              : 'FIDO2 Level 3 Hardware Cryptographic Session Verification'
          }
          signerName={matter.leadAdvocate.split('(')[0].trim()}
        />
      )}

      {/* ================= CHAMBERS MEETING & HEARING ALERTS MODAL ================= */}
      {isMeetingAlertsOpen && (
        <MeetingAlertsModal
          isOpen={isMeetingAlertsOpen}
          onClose={() => setIsMeetingAlertsOpen(false)}
          matter={matter}
          consultations={allConsultations}
          onOpenSummaryForMeeting={(conf) => {
            setIsMeetingAlertsOpen(false);
            setSummaryTargetDoc(null);
            setSummaryTargetConsultation(conf);
            setSummarySourceTitle(`Conference ${conf.reference} (${conf.advocateName})`);
            setSummaryTranscriptText(conf.voiceNote?.transcript);
            setIsLegalSummaryOpen(true);
          }}
          onOpenBookingModal={() => {
            setIsMeetingAlertsOpen(false);
            setIsBookingModalOpen(true);
          }}
        />
      )}

      {/* ================= INSTITUTIONAL LEGAL SUMMARY & BRIEFING MODAL ================= */}
      {isLegalSummaryOpen && (
        <LegalSummaryModal
          isOpen={isLegalSummaryOpen}
          onClose={() => {
            setIsLegalSummaryOpen(false);
            setSummaryTargetDoc(null);
            setSummaryTargetConsultation(null);
            setSummarySourceTitle(undefined);
            setSummaryTranscriptText(undefined);
          }}
          matter={matter}
          consultation={summaryTargetConsultation}
          document={summaryTargetDoc}
          sourceTitle={summarySourceTitle}
          initialTranscriptText={summaryTranscriptText}
        />
      )}

    </div>
  );
};
