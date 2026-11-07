import React, { useState, useMemo } from 'react';
import { 
  X, ShieldCheck, Highlighter, StickyNote, MessageSquare, 
  History, UserCheck, Check, Trash2, Filter, 
  Download, Lock, Clock, ArrowRight, Eye, EyeOff, FileText, 
  Scale, Building2, GitBranch, Layers, GitCommit, Sparkles, 
  AlertCircle, CheckCircle2, Search, FileDiff
} from 'lucide-react';
import { MatterDocument, ClientMatter } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

export interface DocumentAnnotation {
  id: string;
  documentName: string;
  versionId: string;
  type: 'highlight' | 'comment' | 'sticky-note';
  color: 'amber' | 'emerald' | 'rose' | 'sky';
  clauseNumber: number;
  clauseTitle: string;
  targetExcerpt: string;
  commentText?: string;
  author: {
    name: string;
    role: string;
    affiliation: 'firm' | 'client';
    title: string;
  };
  timestamp: string;
  isoTime: string;
  status: 'active' | 'resolved';
  isPrivileged: boolean;
  checksum: string;
  replies?: {
    id: string;
    author: { name: string; role: string; affiliation: 'firm' | 'client' };
    content: string;
    timestamp: string;
  }[];
}

export interface DocumentClause {
  number: number;
  title: string;
  text: string;
  diffStatus?: 'unchanged' | 'amended' | 'added';
  amendmentSummary?: string;
}

export interface DocumentVersion {
  versionId: string; // 'v2.0', 'v1.1', 'v1.0'
  versionTag: string;
  statusBadge: string;
  date: string;
  drafter: string;
  ctsFilingHash: string;
  amendmentNotes: string;
  clauses: DocumentClause[];
  annotations: DocumentAnnotation[];
}

interface SecureDocumentAnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: MatterDocument;
  matter: ClientMatter;
}

// Initial Document Versions Database simulating the evolution of an authentic Kenyan legal pleading
const createInitialVersions = (docName: string): DocumentVersion[] => [
  {
    versionId: 'v2.0',
    versionTag: 'v2.0 - Final Settled Pleading',
    statusBadge: 'Current Active CTS Record',
    date: '04 Nov 2026',
    drafter: 'Milton Angwenyi, SC & David Otieno',
    ctsFilingHash: 'SHA256:7f9a2b8e3c11',
    amendmentNotes: 'Substantive revisions settling jurisdictional objection, incorporating KCB escrow certificate and Rule 11 discovery schedule.',
    clauses: [
      {
        number: 1,
        title: "Parties & Sovereign Capacity",
        text: "The Plaintiff, Consolidated Energy Holdings Ltd, is a limited liability company incorporated in Kenya with vast infrastructural assets in geothermal and regional power transmission, operating under licenses issued pursuant to the Energy Act 2019.",
        diffStatus: 'unchanged'
      },
      {
        number: 2,
        title: "Commercial Concession Agreement",
        text: "On or about 14th June 2023, the Plaintiff and the 1st Defendant entered into a Master Concession and Power Offtake Agreement for the design, construction, and operation of a 120MW grid substation valued at KES 14,800,000,000.",
        diffStatus: 'unchanged'
      },
      {
        number: 3,
        title: "Jurisdictional Submission & Superior Courts",
        text: "This Honorable Court possesses original jurisdiction pursuant to Article 165(3) of the Constitution of Kenya 2010 and Section 6 of the Civil Procedure Act (Cap 21) to adjudicate disputes arising from commercial contracts and restrain unilateral encashment of performance securities, as affirmed in precedent Commercial Suit No. E041 of 2024.",
        diffStatus: 'amended',
        amendmentSummary: 'Amended to plead High Court precedent Commercial Suit No. E041 of 2024 upholding commercial division jurisdiction over energy concessions.'
      },
      {
        number: 4,
        title: "Breach of Contract & Unlawful Distress",
        text: "In flagrant breach of Clause 22.4 of the Agreement, the Defendants issued an unlawful demand upon the Plaintiff's bankers seeking immediate liquidation of Bank Guarantees totaling KES 50,000,000 without submitting the dispute to pre-litigation adjudication, in direct contempt of the Preservative Order extracted herein on 24th October 2026.",
        diffStatus: 'amended',
        amendmentSummary: 'Incorporated extracted High Court preservation order granted by Hon. Lady Justice Wambui on 24 October 2026.'
      },
      {
        number: 5,
        title: "Irreparable Harm & Balance of Convenience",
        text: "Unless restrained by an interlocutory injunction of this Court, the encashment of the disputed guarantees will irreparably compromise the financial liquidity of the project, disrupting electricity transmission across three East African borders and causing irreversible commercial insolvency.",
        diffStatus: 'unchanged'
      },
      {
        number: 6,
        title: "Compliance with ARO Statutory Scale & Escrow Deposit",
        text: "The Plaintiff has tendered the full statutory deposit and escrow security totaling KES 50,000,000 into the designated Chambers Escrow Account maintained at KCB Bank Kenya Upper Hill Corporate Branch (Certificate Ref: ESC-KCB-PAA-8841-KE) pursuant to the Advocates (Remuneration) Order (ARO) Cap 16.",
        diffStatus: 'amended',
        amendmentSummary: 'Updated with verified KCB Institutional Escrow certificate reference and account confirmation.'
      },
      {
        number: 7,
        title: "Prayers for Declaratory & Injunctive Relief",
        text: "WHEREFORE the Plaintiff prays for a permanent injunction restraining the Defendants from calling in, negotiating, or receiving proceeds of Letter of Credit Ref: LC/2026/KCB-8941 (extended to 31 March 2027) pending final judicial and arbitral determination.",
        diffStatus: 'amended',
        amendmentSummary: 'Updated prayer to reference extended Letter of Credit maturity date agreed by banks.'
      }
    ],
    annotations: [
      {
        id: 'ann-v2-1',
        documentName: docName,
        versionId: 'v2.0',
        type: 'highlight',
        color: 'amber',
        clauseNumber: 3,
        clauseTitle: 'Jurisdictional Submission & Superior Courts',
        targetExcerpt: 'Commercial Suit No. E041 of 2024 upholding commercial division jurisdiction',
        commentText: 'Precedent confirmed: Senior Counsel Milton Angwenyi added specific citation to lady Justice Wambui’s ruling affirming Commercial Court primacy.',
        author: {
          name: 'Milton Angwenyi, SC',
          role: 'Lead Counsel & Senior Counsel',
          affiliation: 'firm',
          title: 'PAA Advocates (Firm Member)'
        },
        timestamp: '04 Nov 2026, 09:12 AM EAT',
        isoTime: '2026-11-04T09:12:00',
        status: 'active',
        isPrivileged: true,
        checksum: 'SHA256:7f9a2b8e01',
        replies: [
          {
            id: 'rep-v2-1',
            author: { name: 'Dr. Arthur Kibera', role: 'Group General Counsel', affiliation: 'client' },
            content: 'Agreed. Our board will rely on this jurisdictional ratio in the upcoming cause list appearance.',
            timestamp: '04 Nov 2026, 09:40 AM EAT'
          }
        ]
      },
      {
        id: 'ann-v2-2',
        documentName: docName,
        versionId: 'v2.0',
        type: 'sticky-note',
        color: 'rose',
        clauseNumber: 4,
        clauseTitle: 'Breach of Contract & Unlawful Distress',
        targetExcerpt: 'in direct contempt of the Preservative Order extracted herein on 24th October 2026',
        commentText: 'CRITICAL AUDIT: Opposing counsel has not satisfied the mandatory 30-day cure notice under FIDIC / Concession Clause 22. This invalidates their notice of distress entirely.',
        author: {
          name: 'David Otieno',
          role: 'Senior Associate (Dispute Resolution)',
          affiliation: 'firm',
          title: 'PAA Advocates (Firm Member)'
        },
        timestamp: '04 Nov 2026, 10:05 AM EAT',
        isoTime: '2026-11-04T10:05:00',
        status: 'active',
        isPrivileged: true,
        checksum: 'SHA256:4a81c900fe'
      },
      {
        id: 'ann-v2-3',
        documentName: docName,
        versionId: 'v2.0',
        type: 'comment',
        color: 'emerald',
        clauseNumber: 6,
        clauseTitle: 'Compliance with ARO Statutory Scale & Escrow Deposit',
        targetExcerpt: 'Certificate Ref: ESC-KCB-PAA-8841-KE pursuant to the Advocates (Remuneration) Order',
        commentText: 'Client Confirmation: KCB Upper Hill confirmed receipt of the KES 50,000,000 security for costs. Escrow certificate ESC-KCB-PAA-8841-KE has been stamped.',
        author: {
          name: 'Dr. Arthur Kibera',
          role: 'Group General Counsel',
          affiliation: 'client',
          title: 'Corporate Client'
        },
        timestamp: '04 Nov 2026, 10:28 AM EAT',
        isoTime: '2026-11-04T10:28:00',
        status: 'resolved',
        isPrivileged: false,
        checksum: 'SHA256:99c43b22a1'
      },
      {
        id: 'ann-v2-4',
        documentName: docName,
        versionId: 'v2.0',
        type: 'sticky-note',
        color: 'sky',
        clauseNumber: 7,
        clauseTitle: 'Prayers for Declaratory & Injunctive Relief',
        targetExcerpt: 'Letter of Credit Ref: LC/2026/KCB-8941 (extended to 31 March 2027)',
        commentText: 'Technical Observation: The letter of credit expiry was successfully extended to 31 March 2027. Prayer 7 now correctly reflects this extension.',
        author: {
          name: 'Eng. M. Karani',
          role: 'Technical Witness & Infrastructure Director',
          affiliation: 'client',
          title: 'Corporate Client'
        },
        timestamp: '04 Nov 2026, 10:45 AM EAT',
        isoTime: '2026-11-04T10:45:00',
        status: 'active',
        isPrivileged: false,
        checksum: 'SHA256:11e9a3804d'
      }
    ]
  },
  {
    versionId: 'v1.1',
    versionTag: 'v1.1 - Interlocutory Amendment',
    statusBadge: 'Interlocutory Court Order Revision',
    date: '24 Oct 2026',
    drafter: 'David Otieno (Senior Associate)',
    ctsFilingHash: 'SHA256:9a41c21d00fa',
    amendmentNotes: 'Amended draft incorporating the ex-parte preservation of assets stay granted in chambers by Lady Justice Wambui.',
    clauses: [
      {
        number: 1,
        title: "Parties & Sovereign Capacity",
        text: "The Plaintiff, Consolidated Energy Holdings Ltd, is a limited liability company incorporated in Kenya with vast infrastructural assets in geothermal and regional power transmission, operating under licenses issued pursuant to the Energy Act 2019.",
        diffStatus: 'unchanged'
      },
      {
        number: 2,
        title: "Commercial Concession Agreement",
        text: "On or about 14th June 2023, the Plaintiff and the 1st Defendant entered into a Master Concession and Power Offtake Agreement for the design, construction, and operation of a 120MW grid substation valued at KES 14,800,000,000.",
        diffStatus: 'unchanged'
      },
      {
        number: 3,
        title: "Jurisdictional Submission & Superior Courts",
        text: "This Honorable Court possesses original jurisdiction pursuant to Article 165(3) of the Constitution of Kenya 2010 and Section 6 of the Civil Procedure Act (Cap 21) to adjudicate disputes arising from commercial contracts and restrain unilateral encashment of performance securities.",
        diffStatus: 'unchanged'
      },
      {
        number: 4,
        title: "Breach of Contract & Unlawful Distress",
        text: "In flagrant breach of Clause 22.4 of the Agreement, the Defendants issued an unlawful demand upon the Plaintiff's bankers seeking immediate liquidation of Bank Guarantees totaling KES 50,000,000 without submitting the dispute to pre-litigation adjudication.",
        diffStatus: 'amended',
        amendmentSummary: 'Initial amendment addressing imminent bank guarantee calls.'
      },
      {
        number: 5,
        title: "Irreparable Harm & Balance of Convenience",
        text: "Unless restrained by an interlocutory injunction of this Court, the encashment of the disputed guarantees will irreparably compromise the financial liquidity of the project, disrupting electricity transmission across three East African borders.",
        diffStatus: 'unchanged'
      },
      {
        number: 6,
        title: "Compliance with ARO Statutory Scale & Escrow Deposit",
        text: "The Plaintiff undertakes to deposit the sum of KES 50,000,000 into a joint escrow account pursuant to the directions of this Court and the Advocates (Remuneration) Order.",
        diffStatus: 'amended',
        amendmentSummary: 'Pledging escrow deposit pending formal KCB facility setup.'
      },
      {
        number: 7,
        title: "Prayers for Declaratory & Injunctive Relief",
        text: "WHEREFORE the Plaintiff prays for an interim injunction restraining the Defendants from calling in, negotiating, or receiving proceeds of Letter of Credit Ref: LC/2026/KCB-8941 pending inter-partes hearing.",
        diffStatus: 'unchanged'
      }
    ],
    annotations: [
      {
        id: 'ann-v1-1-1',
        documentName: docName,
        versionId: 'v1.1',
        type: 'comment',
        color: 'amber',
        clauseNumber: 4,
        clauseTitle: 'Breach of Contract & Unlawful Distress',
        targetExcerpt: 'seeking immediate liquidation of Bank Guarantees totaling KES 50,000,000',
        commentText: 'Drafting note from Senior Counsel: Ensure the extracted preservation order dated 24 Oct is specifically annexed as Exhibit PAA-04.',
        author: {
          name: 'Milton Angwenyi, SC',
          role: 'Lead Counsel & Senior Counsel',
          affiliation: 'firm',
          title: 'PAA Advocates (Firm Member)'
        },
        timestamp: '24 Oct 2026, 03:15 PM EAT',
        isoTime: '2026-10-24T15:15:00',
        status: 'resolved',
        isPrivileged: true,
        checksum: 'SHA256:88fa12c910'
      },
      {
        id: 'ann-v1-1-2',
        documentName: docName,
        versionId: 'v1.1',
        type: 'sticky-note',
        color: 'emerald',
        clauseNumber: 6,
        clauseTitle: 'Compliance with ARO Statutory Scale & Escrow Deposit',
        targetExcerpt: 'undertakes to deposit the sum of KES 50,000,000 into a joint escrow account',
        commentText: 'Client Note: KCB corporate legal desk requested a copy of the stamped extracted preservation order before finalizing escrow facility.',
        author: {
          name: 'Dr. Arthur Kibera',
          role: 'Group General Counsel',
          affiliation: 'client',
          title: 'Corporate Client'
        },
        timestamp: '24 Oct 2026, 04:30 PM EAT',
        isoTime: '2026-10-24T16:30:00',
        status: 'active',
        isPrivileged: false,
        checksum: 'SHA256:3d10ab78bc'
      }
    ]
  },
  {
    versionId: 'v1.0',
    versionTag: 'v1.0 - Initial CTS E-Filing',
    statusBadge: 'Initial Originating Motion (Superceded)',
    date: '12 Oct 2026',
    drafter: 'Milton Angwenyi, SC',
    ctsFilingHash: 'SHA256:4b10fa7289ee',
    amendmentNotes: 'Initial urgent certificate of urgency and originating plaint e-filed via Milimani Commercial electronic portal.',
    clauses: [
      {
        number: 1,
        title: "Parties & Sovereign Capacity",
        text: "The Plaintiff, Consolidated Energy Holdings Ltd, is a limited liability company incorporated in Kenya with vast infrastructural assets in geothermal and regional power transmission, operating under licenses issued pursuant to the Energy Act 2019.",
        diffStatus: 'unchanged'
      },
      {
        number: 2,
        title: "Commercial Concession Agreement",
        text: "On or about 14th June 2023, the Plaintiff and the 1st Defendant entered into a Master Concession and Power Offtake Agreement for the design, construction, and operation of a 120MW grid substation valued at KES 14,800,000,000.",
        diffStatus: 'unchanged'
      },
      {
        number: 3,
        title: "Jurisdictional Submission & Superior Courts",
        text: "This Honorable Court possesses original jurisdiction pursuant to Article 165(3) of the Constitution of Kenya 2010 and Section 6 of the Civil Procedure Act (Cap 21) to adjudicate disputes arising from commercial contracts and restrain unilateral encashment of performance securities.",
        diffStatus: 'unchanged'
      },
      {
        number: 4,
        title: "Breach of Contract & Unlawful Distress",
        text: "The Defendants have issued a demand upon Plaintiff's lenders threatening to encash performance securities prematurely.",
        diffStatus: 'amended',
        amendmentSummary: 'Original brief formulation before full discovery of letters of credit.'
      },
      {
        number: 5,
        title: "Irreparable Harm & Balance of Convenience",
        text: "Unless restrained by an interlocutory injunction of this Court, the encashment of the disputed guarantees will irreparably compromise the financial liquidity of the project, disrupting electricity transmission across three East African borders.",
        diffStatus: 'unchanged'
      },
      {
        number: 6,
        title: "Compliance with ARO Statutory Scale & Escrow Deposit",
        text: "The Plaintiff tenders statutory court fees pursuant to the Advocates Remuneration Order.",
        diffStatus: 'amended',
        amendmentSummary: 'Preliminary court fees before formal escrow undertaking.'
      },
      {
        number: 7,
        title: "Prayers for Declaratory & Injunctive Relief",
        text: "WHEREFORE the Plaintiff prays for urgent ex-parte ad-interim orders restraining the encashment of guarantees pending hearing of this application.",
        diffStatus: 'unchanged'
      }
    ],
    annotations: [
      {
        id: 'ann-v1-0-1',
        documentName: docName,
        versionId: 'v1.0',
        type: 'highlight',
        color: 'rose',
        clauseNumber: 4,
        clauseTitle: 'Breach of Contract & Unlawful Distress',
        targetExcerpt: 'threatening to encash performance securities prematurely',
        commentText: 'Initial filing note: Moving the duty judge on certificate of urgency tomorrow at 08:30 AM before Lady Justice Wambui.',
        author: {
          name: 'Milton Angwenyi, SC',
          role: 'Lead Counsel & Senior Counsel',
          affiliation: 'firm',
          title: 'PAA Advocates (Firm Member)'
        },
        timestamp: '12 Oct 2026, 11:20 AM EAT',
        isoTime: '2026-10-12T11:20:00',
        status: 'resolved',
        isPrivileged: true,
        checksum: 'SHA256:1a84f39167'
      },
      {
        id: 'ann-v1-0-2',
        documentName: docName,
        versionId: 'v1.0',
        type: 'comment',
        color: 'emerald',
        clauseNumber: 1,
        clauseTitle: 'Parties & Sovereign Capacity',
        targetExcerpt: 'Consolidated Energy Holdings Ltd, is a limited liability company incorporated in Kenya',
        commentText: 'Client Check: Certified CR12 corporate search from Business Registration Service (BRS) attached to verifying affidavit.',
        author: {
          name: 'Dr. Arthur Kibera',
          role: 'Group General Counsel',
          affiliation: 'client',
          title: 'Corporate Client'
        },
        timestamp: '12 Oct 2026, 01:15 PM EAT',
        isoTime: '2026-10-12T13:15:00',
        status: 'resolved',
        isPrivileged: false,
        checksum: 'SHA256:55ab83cd11'
      }
    ]
  }
];

export const SecureDocumentAnnotationModal: React.FC<SecureDocumentAnnotationModalProps> = ({
  isOpen,
  onClose,
  document,
  matter
}) => {
  const { t } = useLanguage();

  // Master Document Versions State (initialized with 3 historical versions)
  const [versions, setVersions] = useState<DocumentVersion[]>(() => createInitialVersions(document.name));
  const [currentVersionId, setCurrentVersionId] = useState<string>('v2.0');
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
  const [showAmendmentDiffs, setShowAmendmentDiffs] = useState(true);

  // Current User Actor (can be toggled between Firm Counsel and Corporate Client)
  const [currentActor, setCurrentActor] = useState<'firm' | 'client'>('firm');

  // Active Tool Mode
  const [activeTool, setActiveTool] = useState<'highlight' | 'comment' | 'sticky' | 'cursor'>('cursor');
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<'amber' | 'emerald' | 'rose' | 'sky'>('amber');
  
  // Sidebar visibility
  const [showAuditSidebar, setShowAuditSidebar] = useState(true);
  const [maskPrivilegedNotes, setMaskPrivilegedNotes] = useState(false);
  const [sidebarFilterActor, setSidebarFilterActor] = useState<'all' | 'firm' | 'client'>('all');
  const [sidebarFilterType, setSidebarFilterType] = useState<'all' | 'highlight' | 'comment' | 'sticky-note'>('all');
  const [searchAuditQuery, setSearchAuditQuery] = useState('');
  
  // Interactive creation states
  const [targetClauseForNote, setTargetClauseForNote] = useState<number | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteType, setNewNoteType] = useState<'comment' | 'sticky-note'>('comment');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Currently active version object
  const currentVersion = useMemo(() => {
    return versions.find(v => v.versionId === currentVersionId) || versions[0];
  }, [versions, currentVersionId]);

  if (!isOpen) return null;

  // Active current user profile
  const userProfile = currentActor === 'firm' 
    ? {
        name: 'Milton Angwenyi, SC',
        role: 'Lead Counsel & Senior Counsel',
        affiliation: 'firm' as const,
        title: 'PAA Advocates (Firm Member)'
      }
    : {
        name: 'Dr. Arthur Kibera',
        role: 'Group General Counsel',
        affiliation: 'client' as const,
        title: `${matter.clientEntity} (Client Member)`
      };

  // Add a new annotation specifically to the CURRENT active version
  const handleAddAnnotation = (clauseNum: number, clauseTitle: string, excerpt: string) => {
    if (!newNoteText.trim()) return;

    const newAnn: DocumentAnnotation = {
      id: `ann-${currentVersion.versionId}-${Date.now()}`,
      documentName: document.name,
      versionId: currentVersion.versionId,
      type: newNoteType,
      color: selectedHighlightColor,
      clauseNumber: clauseNum,
      clauseTitle: clauseTitle,
      targetExcerpt: excerpt.slice(0, 100),
      commentText: newNoteText.trim(),
      author: userProfile,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
                 new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' EAT',
      isoTime: new Date().toISOString(),
      status: 'active',
      isPrivileged: currentActor === 'firm',
      checksum: `SHA256:${Math.random().toString(36).substring(2, 12)}`
    };

    setVersions(prev => prev.map(v => {
      if (v.versionId === currentVersion.versionId) {
        return {
          ...v,
          annotations: [newAnn, ...v.annotations]
        };
      }
      return v;
    }));

    setNewNoteText('');
    setTargetClauseForNote(null);
    setNotificationToast(`New ${newNoteType} logged in Version ${currentVersion.versionId} Audit Trail with hash ${newAnn.checksum}.`);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // Add quick highlight to the CURRENT active version
  const handleQuickHighlight = (clause: DocumentClause) => {
    const newAnn: DocumentAnnotation = {
      id: `ann-${currentVersion.versionId}-${Date.now()}`,
      documentName: document.name,
      versionId: currentVersion.versionId,
      type: 'highlight',
      color: selectedHighlightColor,
      clauseNumber: clause.number,
      clauseTitle: clause.title,
      targetExcerpt: clause.text.slice(0, 80) + '...',
      commentText: `${selectedHighlightColor.toUpperCase()} priority highlight added for legal review in ${currentVersion.versionId}.`,
      author: userProfile,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
                 new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' EAT',
      isoTime: new Date().toISOString(),
      status: 'active',
      isPrivileged: currentActor === 'firm',
      checksum: `SHA256:${Math.random().toString(36).substring(2, 12)}`
    };

    setVersions(prev => prev.map(v => {
      if (v.versionId === currentVersion.versionId) {
        return {
          ...v,
          annotations: [newAnn, ...v.annotations]
        };
      }
      return v;
    }));

    setNotificationToast(`Clause ${clause.number} highlighted and signed to Version ${currentVersion.versionId} Audit Trail.`);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Toggle resolve status on an annotation in the CURRENT version
  const handleToggleResolve = (id: string) => {
    setVersions(prev => prev.map(v => {
      if (v.versionId === currentVersion.versionId) {
        return {
          ...v,
          annotations: v.annotations.map(ann => {
            if (ann.id === id) {
              const nextStatus = ann.status === 'active' ? 'resolved' : 'active';
              return { ...ann, status: nextStatus };
            }
            return ann;
          })
        };
      }
      return v;
    }));
    setNotificationToast(`Annotation status updated in ${currentVersion.versionId} Audit Trail.`);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  // Add reply in current version
  const handleAddReply = (annotationId: string) => {
    if (!replyText.trim()) return;

    setVersions(prev => prev.map(v => {
      if (v.versionId === currentVersion.versionId) {
        return {
          ...v,
          annotations: v.annotations.map(ann => {
            if (ann.id === annotationId) {
              const replies = ann.replies || [];
              const newReply = {
                id: `rep-${Date.now()}`,
                author: { name: userProfile.name, role: userProfile.role, affiliation: userProfile.affiliation },
                content: replyText.trim(),
                timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' EAT'
              };
              return { ...ann, replies: [...replies, newReply] };
            }
            return ann;
          })
        };
      }
      return v;
    }));

    setReplyText('');
    setActiveReplyId(null);
    setNotificationToast(`Collaborative response appended to Version ${currentVersion.versionId} Audit Trail.`);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  // Delete annotation from current version
  const handleDeleteAnnotation = (id: string) => {
    setVersions(prev => prev.map(v => {
      if (v.versionId === currentVersion.versionId) {
        return {
          ...v,
          annotations: v.annotations.filter(a => a.id !== id)
        };
      }
      return v;
    }));
    setNotificationToast(`Annotation retracted from Version ${currentVersion.versionId}.`);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  // Export Versioned Audit Trail
  const handleExportAuditTrail = () => {
    const header = `================================================================================\n` +
                   `PETERSONS ANGWENYI & ASSOCIATES ADVOCATES - DOCUMENT AUDIT TRAIL CERTIFICATE\n` +
                   `================================================================================\n` +
                   `Matter: ${matter.caseTitle}\n` +
                   `Docket Ref: ${matter.reference} | CTS: ${matter.ctsNumber}\n` +
                   `Document Name: ${document.name}\n` +
                   `ACTIVE VERSION: ${currentVersion.versionTag} [Filing Date: ${currentVersion.date}]\n` +
                   `Version Drafter: ${currentVersion.drafter}\n` +
                   `Version CTS Hash: ${currentVersion.ctsFilingHash}\n` +
                   `Amendment Notes: ${currentVersion.amendmentNotes}\n` +
                   `Export Timestamp: ${new Date().toUTCString()}\n` +
                   `Evidence Act Cap 80 S. 106B Cryptographic Hash: SHA256:PAA-AUDIT-${currentVersion.versionId}-${Date.now()}\n\n` +
                   `CHRONOLOGICAL AUDIT TRAIL ENTRIES FOR VERSION ${currentVersion.versionId}:\n` +
                   `--------------------------------------------------------------------------------\n`;

    const entries = currentVersion.annotations.map((ann, i) => {
      return `[ENTRY #${i + 1} - VERSION ${ann.versionId}]\n` +
             `Timestamp: ${ann.timestamp}\n` +
             `User Identifier: ${ann.author.name} (${ann.author.role})\n` +
             `Affiliation: ${ann.author.affiliation.toUpperCase()} (${ann.author.title})\n` +
             `Action Type: ${ann.type.toUpperCase()} [Color: ${ann.color}]\n` +
             `Target: Clause ${ann.clauseNumber} - "${ann.clauseTitle}"\n` +
             `Excerpt: "${ann.targetExcerpt}"\n` +
             `Note / Comment: ${ann.commentText || 'N/A'}\n` +
             `Privilege Status: ${ann.isPrivileged ? 'CONFIDENTIAL ATTORNEY-CLIENT PRIVILEGE' : 'SHARED'}\n` +
             `Integrity Hash: ${ann.checksum}\n` +
             `Status: ${ann.status.toUpperCase()}\n` +
             `--------------------------------------------------------------------------------\n`;
    }).join('\n');

    const fullBlob = new Blob([header + entries], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(fullBlob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `AUDIT_TRAIL_${document.name.replace('.pdf', '')}_${currentVersion.versionId}_CERTIFIED.txt`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setNotificationToast(`Certified Audit Trail Certificate for Version ${currentVersion.versionId} downloaded.`);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // Filtered annotations for the audit sidebar (specific to active version)
  const filteredAnnotations = useMemo(() => {
    return currentVersion.annotations.filter(ann => {
      if (maskPrivilegedNotes && ann.isPrivileged && currentActor === 'client') {
        return false;
      }
      const matchActor = sidebarFilterActor === 'all' || ann.author.affiliation === sidebarFilterActor;
      const matchType = sidebarFilterType === 'all' || ann.type === sidebarFilterType;
      const matchSearch = searchAuditQuery === '' ||
        ann.author.name.toLowerCase().includes(searchAuditQuery.toLowerCase()) ||
        ann.clauseTitle.toLowerCase().includes(searchAuditQuery.toLowerCase()) ||
        (ann.commentText && ann.commentText.toLowerCase().includes(searchAuditQuery.toLowerCase()));
      return matchActor && matchType && matchSearch;
    });
  }, [currentVersion.annotations, sidebarFilterActor, sidebarFilterType, searchAuditQuery, maskPrivilegedNotes, currentActor]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-7xl h-[95vh] bg-[#0A0E17] border border-[#C5A880]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
        
        {/* ================= TOP APPLICATION BAR ================= */}
        <div className="px-5 py-3 bg-[#0E1522] border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-3">
          
          {/* Document & Security Information */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
              <Highlighter className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#C5A880] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SECURE DOCUMENT ANNOTATION & VERSIONING</span>
                <span className="text-[#4E5A70]">·</span>
                <span className="text-[#8C98AE]">{matter.reference}</span>
              </div>
              <h3 className="text-sm sm:text-base font-cinzel text-white flex items-center gap-2 truncate max-w-md">
                {document.name}
              </h3>
            </div>
          </div>

          {/* User Persona Switcher (Firm Member vs Corporate Client) */}
          <div className="flex items-center gap-2 bg-[#141C2B] p-1.5 rounded-xl border border-[#233148]">
            <span className="text-[11px] text-[#8C98AE] ml-1.5 hidden md:inline">Annotating as:</span>
            
            <button
              onClick={() => setCurrentActor('firm')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                currentActor === 'firm'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Firm Counsel (PAA)</span>
            </button>

            <button
              onClick={() => setCurrentActor('client')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                currentActor === 'client'
                  ? 'bg-cyan-500 text-[#0A0E17] font-semibold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Corporate Client</span>
            </button>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAuditTrail}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172235] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] text-xs font-medium rounded-lg border border-[#C5A880]/30 transition-all"
              title="Export complete chronological audit log for current version"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Audit Log ({currentVersion.versionId})</span>
            </button>

            <button
              onClick={() => setShowAuditSidebar(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                showAuditSidebar
                  ? 'bg-[#C5A880]/15 border-[#C5A880] text-[#E4C999]'
                  : 'bg-[#151D2C] border-[#222E44] text-[#8C98AE] hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Audit Trail</span>
              <span className="px-1.5 py-0.2 bg-[#1C273A] rounded-full text-[10px] text-white">
                {currentVersion.annotations.length}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8C98AE] hover:text-white rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* ================= VERSION SELECTOR & AMENDMENTS RIBBON ================= */}
        <div className="px-5 py-2.5 bg-[#121A28] border-b border-[#212E46] flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Version Pills Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[#C5A880] font-semibold uppercase tracking-wider text-[11px]">
              <GitBranch className="w-3.5 h-3.5" />
              <span>{t('dashboard.version')}:</span>
            </div>

            <div className="flex items-center bg-[#090D15] p-1 rounded-xl border border-[#233148] gap-1">
              {versions.map(v => (
                <button
                  key={v.versionId}
                  onClick={() => {
                    setCurrentVersionId(v.versionId);
                    setTargetClauseForNote(null);
                    setNotificationToast(`Switched to Document Version ${v.versionId}. Annotation context restored.`);
                    setTimeout(() => setNotificationToast(null), 3000);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                    currentVersionId === v.versionId
                      ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md shadow-[#C5A880]/10'
                      : 'text-[#8C98AE] hover:text-white hover:bg-[#151E2E]'
                  }`}
                >
                  <span>{v.versionId}</span>
                  {v.versionId === 'v2.0' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                  <span className="text-[10px] opacity-75 font-sans">
                    ({v.annotations.length})
                  </span>
                </button>
              ))}
            </div>

            {/* Version metadata badge */}
            <div className="hidden md:flex items-center gap-2 text-[11px] text-[#8C98AE] font-mono ml-2">
              <span className="text-white font-medium">{currentVersion.versionTag}</span>
              <span>·</span>
              <span>Date: {currentVersion.date}</span>
              <span>·</span>
              <span className="truncate max-w-[180px] text-[#C5A880]">CTS: {currentVersion.ctsFilingHash}</span>
            </div>
          </div>

          {/* Toggle Highlight Amendments / Diff */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAmendmentDiffs(prev => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-colors ${
                showAmendmentDiffs
                  ? 'bg-[#1C273A] border-[#C5A880]/50 text-[#E4C999]'
                  : 'bg-[#121927] border-[#222E44] text-[#8C98AE] hover:text-white'
              }`}
              title="Highlight clauses modified in this version"
            >
              <FileDiff className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{t('dashboard.compareVersions')}</span>
              {showAmendmentDiffs && <Check className="w-3 h-3 text-emerald-400" />}
            </button>
          </div>

        </div>

        {/* ================= SECONDARY TOOLBAR: ANNOTATION TOOLS & COLORS ================= */}
        <div className="px-5 py-2 bg-[#0C111C] border-b border-[#1A2334] flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Tool selector buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#7F8B9E] font-medium hidden sm:inline">Tool:</span>
            
            <button
              onClick={() => setActiveTool('cursor')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTool === 'cursor'
                  ? 'bg-[#1B263B] text-white font-semibold border border-[#2D3F5E]'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              Read / Select
            </button>

            <button
              onClick={() => setActiveTool('highlight')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                activeTool === 'highlight'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                  : 'text-[#8C98AE] hover:text-white hover:bg-[#151D2C]'
              }`}
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span>Highlight</span>
            </button>

            <button
              onClick={() => setActiveTool('comment')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                activeTool === 'comment'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                  : 'text-[#8C98AE] hover:text-white hover:bg-[#151D2C]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comment</span>
            </button>

            <button
              onClick={() => setActiveTool('sticky')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                activeTool === 'sticky'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                  : 'text-[#8C98AE] hover:text-white hover:bg-[#151D2C]'
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>Sticky Note</span>
            </button>

            {/* Color Picker for Highlights */}
            <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-[#222E42]">
              <span className="text-[10px] text-[#717E94] mr-1 hidden md:inline">Color:</span>
              <button
                onClick={() => setSelectedHighlightColor('amber')}
                className={`w-5 h-5 rounded-full bg-amber-400 border-2 transition-transform ${
                  selectedHighlightColor === 'amber' ? 'scale-125 border-white ring-2 ring-amber-400/30' : 'border-transparent'
                }`}
                title="Gold / Amber: Chambers Privileged"
              />
              <button
                onClick={() => setSelectedHighlightColor('emerald')}
                className={`w-5 h-5 rounded-full bg-emerald-400 border-2 transition-transform ${
                  selectedHighlightColor === 'emerald' ? 'scale-125 border-white ring-2 ring-emerald-400/30' : 'border-transparent'
                }`}
                title="Emerald: Agreed Position"
              />
              <button
                onClick={() => setSelectedHighlightColor('rose')}
                className={`w-5 h-5 rounded-full bg-rose-400 border-2 transition-transform ${
                  selectedHighlightColor === 'rose' ? 'scale-125 border-white ring-2 ring-rose-400/30' : 'border-transparent'
                }`}
                title="Rose: Adverse Claim / Contested"
              />
              <button
                onClick={() => setSelectedHighlightColor('sky')}
                className={`w-5 h-5 rounded-full bg-sky-400 border-2 transition-transform ${
                  selectedHighlightColor === 'sky' ? 'scale-125 border-white ring-2 ring-sky-400/30' : 'border-transparent'
                }`}
                title="Sky: Technical Observation"
              />
            </div>
          </div>

          {/* Privilege Mask Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMaskPrivilegedNotes(prev => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors ${
                maskPrivilegedNotes
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                  : 'bg-[#121927] border-[#222E44] text-[#8C98AE] hover:text-white'
              }`}
            >
              {maskPrivilegedNotes ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-[#C5A880]" />}
              <span>{maskPrivilegedNotes ? 'Privileged Remarks MASKED' : 'Privilege Layer ACTIVE'}</span>
            </button>
          </div>

        </div>

        {/* Global Toast Notification */}
        {notificationToast && (
          <div className="mx-6 mt-2 p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-fadeIn z-20">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{notificationToast}</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400/80">Tamper-Proof Audit Signed</span>
          </div>
        )}

        {/* ================= WORKSPACE BODY: DOCUMENT CANVAS + AUDIT SIDEBAR ================= */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* LEFT / CENTER: DOCUMENT REVIEW CANVAS */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#070A10] flex justify-center">
            
            {/* Judicial Parchment Sheet */}
            <div className="w-full max-w-3xl bg-[#0D121D] border border-[#1E293B] rounded-xl p-6 sm:p-10 shadow-2xl text-slate-200 space-y-6 font-serif">
              
              {/* Formal Pleading Header */}
              <div className="text-center pb-6 border-b border-[#202C40] space-y-1 font-sans">
                <span className="text-[11px] uppercase tracking-widest font-mono text-[#C5A880] block">
                  REPUBLIC OF KENYA · IN THE HIGH COURT OF KENYA AT NAIROBI
                </span>
                <h4 className="text-base sm:text-lg font-cinzel font-bold text-white uppercase tracking-wider">
                  {matter.forum}
                </h4>
                <p className="text-xs font-mono text-[#8C98AE]">
                  CAUSE NO: {matter.reference} · CTS FILING ID: {matter.ctsNumber}
                </p>
                <div className="pt-2 text-xs italic text-slate-300">
                  BETWEEN: <strong className="text-white">{matter.caseTitle}</strong>
                </div>
              </div>

              {/* Version & CTS Stamp Header Bar */}
              <div className="p-3 bg-[#111928] border border-[#212E44] rounded-lg text-xs font-sans flex flex-wrap items-center justify-between gap-2 text-[#8C98AE]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 font-bold uppercase">
                    {currentVersion.statusBadge}
                  </span>
                  <span className="text-white font-mono text-[11px]">{currentVersion.versionId}</span>
                </div>
                <span className="text-[11px] font-mono">Drafter: <strong className="text-slate-200">{currentVersion.drafter}</strong> · Filed: {currentVersion.date}</span>
              </div>

              {/* Version Amendment Banner (if previous versions exist) */}
              {currentVersion.amendmentNotes && (
                <div className="p-3 bg-[#131E2F] border-l-4 border-[#C5A880] rounded-r-lg text-xs font-sans text-slate-300 leading-relaxed">
                  <strong className="text-[#E4C999] block mb-0.5 font-semibold">
                    Version Revision Note ({currentVersion.versionId}):
                  </strong>
                  {currentVersion.amendmentNotes}
                </div>
              )}

              {/* Pleading Title */}
              <div className="text-center py-2 font-sans">
                <h5 className="text-sm font-bold uppercase tracking-widest text-[#E4C999]">
                  {document.name.replace('.pdf', '')} ({currentVersion.versionId})
                </h5>
                <p className="text-[11px] text-[#717E94] mt-0.5">
                  Chambers of Petersons Angwenyi &amp; Associates Advocates · Nairobi
                </p>
              </div>

              {/* Numbered Legal Clauses with Interactive Annotations for THIS VERSION */}
              <div className="space-y-6 pt-2">
                {currentVersion.clauses.map((clause) => {
                  // Find all annotations attached to this clause in THIS version
                  const clauseAnnotations = currentVersion.annotations.filter(
                    a => a.clauseNumber === clause.number && 
                    (!maskPrivilegedNotes || !a.isPrivileged || currentActor === 'firm')
                  );

                  const hasHighlights = clauseAnnotations.some(a => a.type === 'highlight');
                  const primaryHighlight = clauseAnnotations.find(a => a.type === 'highlight');

                  return (
                    <div 
                      key={clause.number}
                      id={`clause-${clause.number}`}
                      className={`relative p-4 rounded-xl border transition-all group ${
                        hasHighlights
                          ? primaryHighlight?.color === 'amber'
                            ? 'bg-amber-950/20 border-amber-500/40'
                            : primaryHighlight?.color === 'emerald'
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : primaryHighlight?.color === 'rose'
                            ? 'bg-rose-950/20 border-rose-500/40'
                            : 'bg-sky-950/20 border-sky-500/40'
                          : 'bg-[#101724]/60 border-[#1B2538] hover:border-[#C5A880]/30'
                      }`}
                    >
                      {/* Clause Title & Quick Action Hover Bar */}
                      <div className="flex items-center justify-between gap-2 mb-2 font-sans">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-5 h-5 rounded-full bg-[#182335] text-[#C5A880] text-[11px] font-mono font-bold flex items-center justify-center border border-[#253652]">
                            {clause.number}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                            {clause.title}
                          </span>

                          {/* Amendment Diff Badge if enabled */}
                          {showAmendmentDiffs && clause.diffStatus === 'amended' && (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-medium">
                              Amended in {currentVersion.versionId}
                            </span>
                          )}
                        </div>

                        {/* Inline Annotation Buttons */}
                        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleQuickHighlight(clause)}
                            title={`Highlight in Version ${currentVersion.versionId}`}
                            className="p-1 rounded bg-[#172235] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#A6B2C8] text-[10px] flex items-center gap-1 transition-colors"
                          >
                            <Highlighter className="w-3 h-3" />
                            <span className="hidden sm:inline">Highlight</span>
                          </button>

                          <button
                            onClick={() => {
                              setTargetClauseForNote(clause.number);
                              setNewNoteType('comment');
                            }}
                            title={`Add comment in Version ${currentVersion.versionId}`}
                            className="p-1 rounded bg-[#172235] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#A6B2C8] text-[10px] flex items-center gap-1 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span className="hidden sm:inline">Comment</span>
                          </button>

                          <button
                            onClick={() => {
                              setTargetClauseForNote(clause.number);
                              setNewNoteType('sticky-note');
                            }}
                            title={`Add sticky note in Version ${currentVersion.versionId}`}
                            className="p-1 rounded bg-[#172235] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#A6B2C8] text-[10px] flex items-center gap-1 transition-colors"
                          >
                            <StickyNote className="w-3 h-3" />
                            <span className="hidden sm:inline">Sticky Note</span>
                          </button>
                        </div>
                      </div>

                      {/* Amendment Summary callout if present and diffs enabled */}
                      {showAmendmentDiffs && clause.amendmentSummary && (
                        <div className="mb-2 p-2 bg-[#121E2C] border-l-2 border-cyan-400 rounded-r text-[11px] font-sans text-cyan-200">
                          <strong>Amendment Detail:</strong> {clause.amendmentSummary}
                        </div>
                      )}

                      {/* Substantive Pleading Text */}
                      <p className="text-sm leading-relaxed text-slate-200">
                        {clause.text}
                      </p>

                      {/* New Annotation Input Form (when active for this clause) */}
                      {targetClauseForNote === clause.number && (
                        <div className="mt-3 p-3 bg-[#131D2D] border border-[#C5A880]/50 rounded-xl space-y-2.5 font-sans animate-fadeIn">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#C5A880] font-semibold flex items-center gap-1.5">
                              {newNoteType === 'comment' ? <MessageSquare className="w-3.5 h-3.5" /> : <StickyNote className="w-3.5 h-3.5" />}
                              <span>Add {newNoteType === 'comment' ? 'Comment' : 'Sticky Note'} to Clause {clause.number} (Version {currentVersion.versionId})</span>
                            </span>
                            <button onClick={() => setTargetClauseForNote(null)} className="text-[#8C98AE] hover:text-white">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <textarea
                            rows={2}
                            placeholder={`Enter observation or instruction for Version ${currentVersion.versionId} as ${userProfile.name}...`}
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            className="w-full bg-[#0D1420] border border-[#222E44] rounded-lg p-2.5 text-xs text-white placeholder-[#5A667A] focus:outline-none focus:border-[#C5A880]"
                          />

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-[#717E94] font-mono">
                              Author: {userProfile.name} [{userProfile.affiliation.toUpperCase()}] · Version: {currentVersion.versionId}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setTargetClauseForNote(null)}
                                className="px-2.5 py-1 text-xs text-[#8C98AE] hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleAddAnnotation(clause.number, clause.title, clause.text)}
                                className="px-3 py-1 bg-[#C5A880] text-[#0A0E17] font-semibold text-xs rounded-lg hover:brightness-110 shadow-sm"
                              >
                                Save to {currentVersion.versionId}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Display Embedded Sticky Notes & Comments for this Clause in THIS VERSION */}
                      {clauseAnnotations.filter(a => a.type !== 'highlight').length > 0 && (
                        <div className="mt-3 space-y-2 font-sans">
                          {clauseAnnotations.filter(a => a.type !== 'highlight').map((ann) => (
                            <div 
                              key={ann.id}
                              className={`p-3 rounded-xl border text-xs transition-all ${
                                ann.type === 'sticky-note'
                                  ? ann.author.affiliation === 'firm'
                                    ? 'bg-[#1E1911] border-[#C5A880]/50 shadow-md shadow-[#C5A880]/5'
                                    : 'bg-[#0E1A24] border-cyan-500/40 shadow-md shadow-cyan-500/5'
                                  : 'bg-[#121A28] border-[#223048]'
                              }`}
                            >
                              {/* Header with Author Tag & Version Anchor */}
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                                    ann.author.affiliation === 'firm'
                                      ? 'bg-[#C5A880]/20 text-[#E4C999] border border-[#C5A880]/40'
                                      : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                                  }`}>
                                    {ann.author.affiliation === 'firm' ? 'PAA ADVOCATES' : 'CLIENT COUNSEL'}
                                  </span>
                                  <span className="font-semibold text-white">{ann.author.name}</span>
                                  <span className="text-[10px] font-mono text-[#C5A880] bg-[#161F2E] px-1.5 py-0.2 rounded border border-[#24334C]">
                                    {ann.versionId}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-[#8C98AE]">{ann.timestamp}</span>
                              </div>

                              {/* Comment Content */}
                              <p className="text-xs text-slate-200 leading-relaxed font-serif">
                                {ann.commentText}
                              </p>

                              {/* Replies thread */}
                              {ann.replies && ann.replies.length > 0 && (
                                <div className="mt-2 pl-3 border-l-2 border-[#24334C] space-y-1.5">
                                  {ann.replies.map(rep => (
                                    <div key={rep.id} className="text-[11px] bg-[#0E1420] p-2 rounded-lg border border-[#1F2C42]">
                                      <div className="flex items-center justify-between text-[#8C98AE] font-mono text-[10px] mb-0.5">
                                        <span className="text-white font-medium">{rep.author.name}</span>
                                        <span>{rep.timestamp}</span>
                                      </div>
                                      <p className="text-slate-300 font-serif">{rep.content}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reply Form */}
                              {activeReplyId === ann.id ? (
                                <div className="mt-2 flex gap-1.5">
                                  <input
                                    type="text"
                                    placeholder="Type collaborative reply..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="flex-1 bg-[#0E1420] border border-[#232F46] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                                  />
                                  <button
                                    onClick={() => handleAddReply(ann.id)}
                                    className="px-2.5 py-1 bg-[#C5A880] text-[#0A0E17] font-semibold text-xs rounded-lg"
                                  >
                                    Reply
                                  </button>
                                  <button
                                    onClick={() => setActiveReplyId(null)}
                                    className="px-2 py-1 text-xs text-[#8C98AE]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="mt-2 pt-2 border-t border-[#1C283B] flex items-center justify-between text-[11px] text-[#717E94] font-mono">
                                  <span className="truncate">Hash: {ann.checksum}</span>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => setActiveReplyId(ann.id)}
                                      className="text-[#C5A880] hover:underline"
                                    >
                                      Reply
                                    </button>
                                    <button
                                      onClick={() => handleToggleResolve(ann.id)}
                                      className="hover:text-white"
                                    >
                                      {ann.status === 'resolved' ? 'Reopen' : 'Resolve'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAnnotation(ann.id)}
                                      className="hover:text-rose-400"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* ================= RIGHT: CHRONOLOGICAL AUDIT TRAIL SIDEBAR ================= */}
          {showAuditSidebar && (
            <div className="w-full lg:w-96 bg-[#0B0F17] border-t lg:border-t-0 lg:border-l border-[#1E293B] flex flex-col h-full animate-fadeIn">
              
              {/* Sidebar Header with Version Context */}
              <div className="p-4 bg-[#0E1522] border-b border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-cinzel text-sm font-semibold">
                    <History className="w-4 h-4 text-[#C5A880]" />
                    <span>{t('dashboard.auditTrail')}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#E4C999] bg-[#162030] px-2 py-0.5 rounded border border-[#C5A880]/30">
                    Version: {currentVersion.versionId}
                  </span>
                </div>
                
                <p className="text-[11px] text-[#8C98AE] leading-tight">
                  Cryptographic audit log for <strong>{currentVersion.versionTag}</strong>. Context isolated per document version.
                </p>

                {/* Search in Audit Log */}
                <div className="relative pt-1">
                  <Search className="w-3.5 h-3.5 text-[#5F6D82] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by author, clause, or comment..."
                    value={searchAuditQuery}
                    onChange={(e) => setSearchAuditQuery(e.target.value)}
                    className="w-full bg-[#121927] border border-[#202C40] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#505D72] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="px-4 py-2 bg-[#090D15] border-b border-[#1A2436] flex items-center justify-between gap-1 text-[11px]">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setSidebarFilterActor('all')}
                    className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                      sidebarFilterActor === 'all'
                        ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                        : 'text-[#8C98AE] hover:text-white'
                    }`}
                  >
                    All Actors
                  </button>
                  <button
                    onClick={() => setSidebarFilterActor('firm')}
                    className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                      sidebarFilterActor === 'firm'
                        ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                        : 'text-[#8C98AE] hover:text-white'
                    }`}
                  >
                    Firm (PAA)
                  </button>
                  <button
                    onClick={() => setSidebarFilterActor('client')}
                    className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                      sidebarFilterActor === 'client'
                        ? 'bg-cyan-500 text-[#0A0E17] font-semibold'
                        : 'text-[#8C98AE] hover:text-white'
                    }`}
                  >
                    Client
                  </button>
                </div>

                <span className="font-mono text-[10px] text-[#717E94] shrink-0">
                  {filteredAnnotations.length} {filteredAnnotations.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              {/* Chronological Audit Log Entries List for Active Version */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredAnnotations.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#717E94] space-y-1">
                    <p>No audit records in Version {currentVersion.versionId} matching filter.</p>
                    <p className="text-[11px] text-[#556377]">Add highlights or notes above to sign new entries.</p>
                  </div>
                ) : (
                  filteredAnnotations.map((ann, idx) => (
                    <div
                      key={ann.id}
                      className={`p-3 rounded-xl border text-xs transition-all hover:border-[#C5A880]/50 ${
                        ann.author.affiliation === 'firm'
                          ? 'bg-[#0E1522] border-[#1F2B3E]'
                          : 'bg-[#0C1722] border-[#1C2C3D]'
                      }`}
                    >
                      {/* Top Bar: User & Affiliation */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            ann.author.affiliation === 'firm' ? 'bg-[#C5A880]' : 'bg-cyan-400'
                          }`} />
                          <span className="font-semibold text-white truncate">{ann.author.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono text-[#C5A880] bg-[#162030] px-1 rounded">
                            {ann.versionId}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                            ann.author.affiliation === 'firm'
                              ? 'bg-[#C5A880]/15 text-[#E4C999]'
                              : 'bg-cyan-950/60 text-cyan-300'
                          }`}>
                            {ann.author.affiliation === 'firm' ? 'PAA' : 'CLIENT'}
                          </span>
                        </div>
                      </div>

                      {/* Action summary & location */}
                      <div className="text-[11px] text-[#8C98AE] flex items-center justify-between gap-1 mb-1">
                        <span className="font-medium text-slate-300">
                          {ann.type === 'highlight' ? 'Highlighted Clause' : ann.type === 'sticky-note' ? 'Placed Sticky Note' : 'Added Comment'}
                        </span>
                        <a 
                          href={`#clause-${ann.clauseNumber}`} 
                          className="text-[#C5A880] font-mono hover:underline text-[10px]"
                        >
                          Clause {ann.clauseNumber} →
                        </a>
                      </div>

                      {/* Excerpt / Comment preview */}
                      <p className="text-xs text-slate-300 font-serif line-clamp-2 italic bg-[#090D15] p-2 rounded border border-[#1A2334] mb-2">
                        "{ann.commentText || ann.targetExcerpt}"
                      </p>

                      {/* Audit Verification Block */}
                      <div className="pt-1.5 border-t border-[#182233] flex items-center justify-between text-[10px] font-mono text-[#6C7B92]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#C5A880]" />
                          <span>{ann.timestamp.split(', ')[1] || ann.timestamp}</span>
                        </span>
                        <span className="text-emerald-400/90">{ann.checksum.slice(0, 15)}...</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Sidebar Footer Action */}
              <div className="p-3 bg-[#0E1522] border-t border-[#1E293B] flex items-center justify-between text-xs text-[#8C98AE]">
                <button
                  onClick={handleExportAuditTrail}
                  className="w-full py-2 bg-[#172235] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {currentVersion.versionId} Audit Log</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
