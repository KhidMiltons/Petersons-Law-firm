export interface Advocate {
  id: string;
  name: string;
  title: string;
  role: string;
  credentials: string;
  admissions: string[];
  bio: string;
  specialties: string[];
  email: string;
  phone: string;
  image?: string;
  rollNumber: string;
}

export interface PracticeArea {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  description: string;
  keyActs: string[];
  leadAdvocate: string;
  highlights: string[];
  capabilities: string[];
}

export interface CaseBrief {
  id: string;
  matterName: string;
  clientCategory: string;
  forum: string;
  year: number;
  value: string;
  summary: string;
  impact: string;
  practiceAreaId: string;
  readTime?: string;
}

export interface LegalArticle {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  synopsis: string;
  content: string[];
  citation: string;
}

export interface ClientTestimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  organization: string;
  sector: string;
  matterContext: string;
  impactMetrics: string;
}

export interface FirmMilestone {
  id: string;
  metric: string;
  label: string;
  institution: string;
  description: string;
  badge: string;
}

export interface MatterDocument {
  name: string;
  date: string;
  size: string;
  category: 'Pleadings' | 'Judicial Order' | 'Submissions' | 'Evidence';
  ctsHash: string;
  signatory: string;
  summary: string;
  isSigned?: boolean;
  signedBy?: string;
  signedAt?: string;
  signatureHash?: string;
  certificateRef?: string;
  pages?: number;
  readTime?: string;
}

export interface MatterChronologyStep {
  stage: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming';
  notes: string;
  registryRef?: string;
}

export interface MatterInvoice {
  invoiceNo: string;
  date: string;
  description: string;
  statutoryScale: string;
  amount: string;
  taxVat: string;
  total: string;
  status: 'Paid / Reconciled' | 'Pending Escrow Clearance' | 'Disbursed';
}

export interface MatterDirectMessage {
  id: string;
  sender: string;
  role: string;
  timestamp: string;
  content: string;
  isOfficial: boolean;
}

export interface VoiceMeetingNote {
  id: string;
  duration: string;
  audioSeconds: number;
  durationSeconds?: number;
  recordedBy: string;
  recordedRole: string;
  recordedAt: string;
  title?: string;
  speaker?: string;
  role?: string;
  recordedDate?: string;
  waveform: number[];
  transcript: string;
  statutoryPrivilegeRef: string;
}

export interface ConsultationRecord {
  id: string;
  reference: string;
  clientName: string;
  corporateEntity?: string;
  advocateName: string;
  advocateRole: string;
  practiceArea: string;
  scheduledDate: string;
  scheduledTime: string;
  format: 'chambers' | 'virtual' | 'phone';
  status: 'Confirmed & Scheduled' | 'Completed / Minutes Filed' | 'In Session' | 'Rescheduled' | 'Completed - Voice Dictated';
  forumLocation: string;
  meetingLink?: string;
  dialInNumber?: string;
  matterDocket?: string;
  summaryNotes: string;
  actionItems: string[];
  attendees: string[];
  billableHours?: number;
  voiceNote?: VoiceMeetingNote;
}

export interface JudiciaryCaseUpdate {
  id: string;
  ctsDocket?: string;
  ctsReference?: string;
  timestamp: string;
  source?: 'Kenya Judiciary CTS Portal' | 'Commercial Division Registry' | 'Chambers Process Server' | string;
  type?: 'Hearing Cause List' | 'Filing Acceptance' | 'Bench Directions' | 'Service Return' | string;
  category?: string;
  priority?: 'Urgent' | 'Official Notice' | 'Registry Receipt' | 'Normal' | string;
  title: string;
  summary?: string;
  description?: string;
  isRead: boolean;
  isUnread?: boolean;
  judicialOfficer?: string;
  officialGazetteNotice?: string;
}

export interface JudiciarySyncInfo {
  ctsRegistryId: string;
  portalStatus: 'CONNECTED_REALTIME' | 'SYNCED_RECENTLY';
  lastVerifiedAt: string;
  lastSyncTimestamp?: string;
  digitalSignatureHash: string;
  verifiedCourt: string;
  nextHearingDate: string;
  nextHearingCountdownDays: number;
  courtRoomLocation: string;
}

export interface ClientMatter {
  reference: string;
  clientEntity: string;
  caseTitle: string;
  forum: string;
  ctsNumber: string;
  bench: string;
  leadAdvocate: string;
  currentStage: string;
  nextHearingDate: string;
  causeListNo: string;
  status: string;
  virtualCourtRoom: string;
  escrowDeposit: string;
  trustAccount: string;
  aroScale: string;
  financialSummary: {
    totalRetainer: string;
    settledToDate: string;
    heldInEscrow: string;
    statutoryDisbursements: string;
  };
  chronology: MatterChronologyStep[];
  documents: MatterDocument[];
  invoices: MatterInvoice[];
  directMessages: MatterDirectMessage[];
  consultations?: ConsultationRecord[];
  caseCompletionPercentage?: number;
  judiciarySync?: JudiciarySyncInfo;
  judiciaryUpdates?: JudiciaryCaseUpdate[];
}

export const FIRM_DETAILS = {
  name: "Petersons Angwenyi & Associates Advocates",
  shortName: "PAA Advocates",
  tagline: "Formidable Counsel. Enduring Precedent.",
  location: "Upper Hill, Nairobi, Kenya",
  address: "PAA Chambers, 9th Floor, Mara Square, Mara Road / Hospital Road Junction, Upper Hill, Nairobi",
  postalAddress: "P.O. Box 48921 - 00100 GPO, Nairobi, Kenya",
  phone: "+254 (0) 20 271 8840",
  mobile: "+254 (0) 722 849 900",
  emergencyInjunction: "+254 (0) 733 900 120",
  email: "counsel@paalawkenya.com",
  registryEmail: "registry@paalawkenya.com",
  hours: "Monday – Friday: 08:00 – 18:00 EAT (24/7 Urgent Injunction Duty Counsel)",
  lskRoll: "LSK Registered Law Firm Firm No. NRB/3892",
};

export const ADVOCATES: Advocate[] = [
  {
    id: "milton-angwenyi",
    name: "Milton Angwenyi, SC",
    title: "Senior Counsel & Managing Partner",
    role: "Head of Dispute Resolution & Sovereign Advisory",
    credentials: "LL.B (First Class Hons, UoN), LL.M in Int'l Commercial Arbitration (LSE), FCIArb",
    admissions: ["Roll of Advocates, High Court of Kenya (1998)", "Fellow, Chartered Institute of Arbitrators (UK & Kenya)", "East Africa Law Society", "Commonwealth Lawyers Association"],
    bio: "Milton Angwenyi is the Managing Partner of Petersons Angwenyi & Associates Advocates. With over 26 years at the apex of the Kenyan Bar, he has advised multinational conglomerates, commercial banks, state corporations, and sovereign entities in high-stakes commercial disputes, international arbitrations, and regulatory reforms before the Supreme Court of Kenya and international tribunals.",
    specialties: ["International Commercial Arbitration", "Sovereign Debt & Cross-Border Disputes", "Banking & Structured Finance", "Constitutional Jurisprudence"],
    email: "m.angwenyi@paalawkenya.com",
    phone: "+254 (0) 20 271 8841",
    image: "/src/assets/images/portrait_managing_partner_1793735491956.jpg",
    rollNumber: "P.105/8941/98",
  },
  {
    id: "peterson-maina",
    name: "Peterson K. Maina",
    title: "Founding Partner",
    role: "Head of Appellate Practice & Public Law",
    credentials: "LL.B (Hons, UoN), Post-Graduate Dip. KSL, Member LSK",
    admissions: ["Roll of Advocates, High Court of Kenya (1995)", "East Africa Law Society", "International Commission of Jurists (ICJ-K)"],
    bio: "Co-founding partner Peterson K. Maina has shaped landmark appellate jurisprudence in Kenya across three decades. His practice focuses on constitutional petitions, judicial review applications, sovereign concession disputes, and land tenure regularizations before the Court of Appeal and the Supreme Court.",
    specialties: ["Appellate Litigation", "Judicial Review", "Constitutional Law", "Public Procurement Disputes"],
    email: "p.maina@paalawkenya.com",
    phone: "+254 (0) 20 271 8842",
    rollNumber: "P.105/7412/95",
  },
  {
    id: "patricia-omwamba",
    name: "Dr. Patricia Omwamba",
    title: "Partner",
    role: "Head of Banking, Capital Markets & Project Finance",
    credentials: "Ph.D in Financial Law (Cape Town), LL.M (Harvard Law School), LL.B (Hons)",
    admissions: ["Roll of Advocates, High Court of Kenya (2007)", "New York State Bar (2009)", "Institute of Certified Secretaries (ICS-K)"],
    bio: "Dr. Patricia Omwamba advises domestic and international lenders, multilateral development banks (AfDB, IFC), and infrastructure sponsors on syndicated credit facilities, bond issuances on the Nairobi Securities Exchange (NSE), and PPP energy projects across Eastern Africa.",
    specialties: ["Syndicated Lending", "Infrastructure PPPs & Geothermal Concessions", "Capital Markets & Derivatives", "CBK Regulatory Compliance"],
    email: "p.omwamba@paalawkenya.com",
    phone: "+254 (0) 20 271 8844",
    rollNumber: "P.105/11240/07",
  },
  {
    id: "brian-kipkemboi",
    name: "Brian Kipkemboi Cheruiyot",
    title: "Partner",
    role: "Head of Real Estate, Infrastructure & Conveyancing",
    credentials: "LL.B (Hons, Moi University), Dip. KSL, Registered Commissioner for Oaths",
    admissions: ["Roll of Advocates, High Court of Kenya (2010)", "Member, Law Society of Kenya Conveyancing Committee"],
    bio: "Brian Kipkemboi leads the chambers' real estate and infrastructure conveyancing department. He has represented top-tier tier real estate developers in commercial master developments, Sectional Properties Act 2020 conversions, and Ministry of Lands title digitizations via ArdhiSasa.",
    specialties: ["Sectional Properties Act Conversions", "Commercial Real Estate", "ArdhiSasa Land Registrations", "Construction Law (FIDIC)"],
    email: "b.kipkemboi@paalawkenya.com",
    phone: "+254 (0) 20 271 8845",
    rollNumber: "P.105/13589/10",
  },
  {
    id: "sharon-wanjiku",
    name: "Sharon Wanjiku Mutua",
    title: "Senior Associate",
    role: "Head of Technology, IP & Data Protection",
    credentials: "LL.B (Hons), LL.M (Intellectual Property & Digital Trade, Edinburgh), CIPP/E",
    admissions: ["Roll of Advocates, High Court of Kenya (2015)", "Certified Data Protection Practitioner (ODPC Kenya)"],
    bio: "Sharon counsels high-growth venture-backed tech companies, telecoms, and financial institutions on compliance with the Kenya Data Protection Act 2019, cross-border data transfer filings, AI governance policies, and trademark portfolio litigation before KIPI.",
    specialties: ["Kenya Data Protection Act Compliance", "Fintech Licensing & Central Bank Sandbox", "Trademarks & Patents (KIPI / ARIPO)", "Venture Capital Financings"],
    email: "s.wanjiku@paalawkenya.com",
    phone: "+254 (0) 20 271 8847",
    rollNumber: "P.105/16723/15",
  },
  {
    id: "david-otieno",
    name: "David Otieno",
    title: "Senior Associate",
    role: "Commercial Litigation & Court-Annexed Mediation",
    credentials: "LL.B (Hons), Dip. KSL, ACIArb",
    admissions: ["Roll of Advocates, High Court of Kenya (2016)", "Associate Member, CIArb (Kenya Branch)"],
    bio: "David represents corporate clients in contentious debt restructuring, corporate insolvency proceedings, enforcement of foreign arbitral awards, and expedited injunctive hearings in the Milimani Commercial and Admiralty Courts.",
    specialties: ["Insolvency & Corporate Turnaround", "Enforcement of Foreign Judgments", "Shareholder Disputes", "Admiralty & Maritime Claims"],
    email: "d.otieno@paalawkenya.com",
    phone: "+254 (0) 20 271 8848",
    rollNumber: "P.105/17490/16",
  }
];

export const PRACTICE_AREAS: PracticeArea[] = [
  {
    id: "corporate-finance",
    title: "Corporate, Banking & Structured Finance",
    subtitle: "Sophisticated transactional advisory for institutional capital",
    iconName: "Landmark",
    description: "We act for leading Tier-1 commercial banks, asset managers, private equity funds, and sovereign issuers in complex cross-border facilities, equity syndications, and restructuring under the CBK Prudential Guidelines.",
    keyActs: ["Banking Act (Cap 488)", "Companies Act 2015", "Capital Markets Act (Cap 485A)", "Insolvency Act 2015"],
    leadAdvocate: "Dr. Patricia Omwamba",
    highlights: [
      "KES 14.8B Syndicated loan facility for renewable energy infrastructure",
      "Regulatory advisory on CBK digital lender licensing regulations",
      "Restructuring of distressed manufacturing conglomerates under administration"
    ],
    capabilities: [
      "Syndicated Credit & Collateral Securities Creation",
      "Securities Exchange Listing & Corporate Bonds",
      "Cross-Border Mergers, Acquisitions & Due Diligence",
      "Central Bank of Kenya Regulatory Compliance"
    ]
  },
  {
    id: "dispute-resolution",
    title: "Dispute Resolution & International Arbitration",
    subtitle: "High-stakes commercial litigation and arbitral tribunals",
    iconName: "Scale",
    description: "Our advocates are widely recognized for courtroom excellence across the Supreme Court of Kenya, Court of Appeal, High Court Commercial Division, and international arbitration centers under NCIA, LCIA, and ICC rules.",
    keyActs: ["Arbitration Act 1995", "Civil Procedure Act (Cap 21)", "Appellate Jurisdiction Act", "Nairobi Centre for Int'l Arbitration Act 2013"],
    leadAdvocate: "Milton Angwenyi, SC",
    highlights: [
      "Lead counsel in USD $42M petroleum terminal infrastructure dispute",
      "Enforcement of LCIA arbitral award exceeding KES 4.5 Billion",
      "Defense of financial institutions in contested mortgage realization injunctions"
    ],
    capabilities: [
      "International Commercial & Investment Arbitration",
      "Supreme Court & Court of Appeal Strategic Advocacy",
      "Emergency Injunctions & Mareva Asset Freezing Orders",
      "Shareholder Derivative Actions & Boardroom Deadlocks"
    ]
  },
  {
    id: "real-estate",
    title: "Real Estate, Infrastructure & Conveyancing",
    subtitle: "Pioneering title security, Sectional Properties transitions, and master developments",
    iconName: "Building2",
    description: "Comprehensive conveyancing counsel protecting land rights, structuring multi-billion shilling master-planned developments, negotiating FIDIC engineering contracts, and executing seamless ArdhiSasa electronic registrations.",
    keyActs: ["Land Registration Act 2012", "Sectional Properties Act 2020", "Physical and Land Use Planning Act 2019", "National Land Commission Act"],
    leadAdvocate: "Brian Kipkemboi Cheruiyot",
    highlights: [
      "Structuring 1,200-unit residential mixed-use sectional property in Nairobi",
      "Title regularizations across 4,500 acres of prime commercial tea estates",
      "ArdhiSasa Ministry of Lands transition strategy for institutional portfolios"
    ],
    capabilities: [
      "Sectional Properties Conversion of 99-Year Leases",
      "Large-Scale Master Development Conveyancing",
      "ArdhiSasa Digitized Search, Stamp Duty & Registration",
      "FIDIC EPC Construction Contracts & Dispute Adjudication"
    ]
  },
  {
    id: "constitutional-public-law",
    title: "Constitutional, Administrative & Appellate Law",
    subtitle: "Defending institutional autonomy, statutory review, and public policy",
    iconName: "ShieldCheck",
    description: "Formidable representation in constitutional petitions, administrative fair administrative action challenges, judicial reviews of ministerial directives, and public procurement administrative review board (PPARB) appeals.",
    keyActs: ["Constitution of Kenya 2010", "Fair Administrative Action Act 2015", "Public Procurement and Asset Disposal Act 2015"],
    leadAdvocate: "Peterson K. Maina",
    highlights: [
      "Secured constitutional annulment of unprocedural statutory tax levies",
      "Represented county government consortium in revenue sharing formula litigation",
      "Overturned KES 6.4B cancelled state procurement tender before the High Court"
    ],
    capabilities: [
      "Constitutional Petitions & Human Rights Injunctions",
      "Judicial Review of Executive Directives & Circulars",
      "Public Procurement Administrative Review Board (PPARB) Appeals",
      "Devolution & Intergovernmental Relations Disputes"
    ]
  },
  {
    id: "tech-ip",
    title: "Technology, IP & Data Protection",
    subtitle: "Shielding digital frontiers, data sovereignty, and proprietary innovation",
    iconName: "Binary",
    description: "Strategic counsel for global technology companies, telecom providers, fintech innovators, and enterprise institutions navigating the Kenya Data Protection Act 2019, ODPC statutory audits, IP licensing, and cybersecurity governance.",
    keyActs: ["Data Protection Act 2019", "Industrial Property Act 2001", "Copyright Act 2001", "Kenya Information and Communications Act"],
    leadAdvocate: "Sharon Wanjiku Mutua",
    highlights: [
      "Conducted statutory Data Protection Impact Assessments (DPIA) for 3 commercial banks",
      "Successfully defended trademark infringement claim for international streaming brand",
      "Negotiated core software license and cloud infrastructure agreement for telecom consortium"
    ],
    capabilities: [
      "Office of Data Protection Commissioner (ODPC) Audit & Registration",
      "Cross-Border Data Transfer Agreements & Privacy Policies",
      "KIPI & ARIPO Trademark, Patent & Copyright Prosecution",
      "Fintech Regulatory Sandbox Application & Compliance"
    ]
  },
  {
    id: "energy-environment",
    title: "Energy, Oil & Natural Resources",
    subtitle: "Navigating power purchase agreements, mining concessions, and carbon markets",
    iconName: "Flame",
    description: "Advising energy developers, mining concessionaires, and international financiers on Kenya's renewable energy feed-in-tariffs, EPRA regulatory licensing, geothermal royalties, and Climate Change Act carbon credit frameworks.",
    keyActs: ["Energy Act 2019", "Mining Act 2016", "Climate Change (Amendment) Act 2023", "Environmental Management and Co-ordination Act"],
    leadAdvocate: "Dr. Patricia Omwamba",
    highlights: [
      "Advising on 40MW solar PV grid-tied power purchase agreement with Kenya Power (KPLC)",
      "Environmental impact assessment litigation defense before the National Environment Tribunal",
      "Structuring carbon project development agreements under Article 6 Paris Agreement rules"
    ],
    capabilities: [
      "Power Purchase Agreements (PPA) with KPLC & KenGen",
      "EPRA Energy Regulatory Licensing & Compliance",
      "Mining Concessions & Community Development Agreements",
      "Carbon Offset Project Structuring & Trading Documentation"
    ]
  }
];

export const CASE_BRIEFS: CaseBrief[] = [
  {
    id: "case-1",
    matterName: "Kenya Commercial Consortium v. Regional Energy Transmission Ltd",
    clientCategory: "Energy Sector Syndicate",
    forum: "Nairobi Centre for International Arbitration (NCIA)",
    year: 2025,
    value: "USD $42,000,000",
    readTime: "5 min read",
    summary: "Lead arbitration counsel representing an international syndicate of institutional lenders in an EPC default claim arising from cross-border transmission corridor construction.",
    impact: "Secured unanimous arbitral award upholding liquidated damages and sovereign indemnity enforcement.",
    practiceAreaId: "dispute-resolution"
  },
  {
    id: "case-2",
    matterName: "In the Matter of Sectional Properties Act Regularization for Mara Park Estates",
    clientCategory: "Prime Commercial Developer",
    forum: "Supreme Court of Kenya & High Court Environment & Land Court",
    year: 2024,
    value: "KES 11,500,000,000",
    readTime: "4 min read",
    summary: "Pioneering litigation on the constitutional validity of transitional provisions under the Sectional Properties Act 2020 and ArdhiSasa electronic title registrations.",
    impact: "Established binding precedent safeguarding corporate leaseholders from retroactive titling nullification.",
    practiceAreaId: "real-estate"
  },
  {
    id: "case-3",
    matterName: "Tier-1 Commercial Bank v. Heavy Industrial Group (In Administration)",
    clientCategory: "Banking & Financial Services",
    forum: "Court of Appeal at Nairobi",
    year: 2025,
    value: "KES 6,200,000,000",
    readTime: "4 min read",
    summary: "Successfully defended secured lenders against an ex-parte injunction seeking to restrain the realization of charge securities over prime industrial real estate in Nairobi.",
    impact: "Clarified the threshold of statutory notice and receiver powers under the Insolvency Act 2015.",
    practiceAreaId: "corporate-finance"
  },
  {
    id: "case-4",
    matterName: "National Manufacturers Association v. Cabinet Secretary, National Treasury",
    clientCategory: "Industry Apex Chamber",
    forum: "High Court of Kenya (Constitutional & Human Rights Division)",
    year: 2024,
    value: "KES 18,000,000,000",
    readTime: "6 min read",
    summary: "Constitutional petition challenging retroactive statutory levies and administrative discretion exerted without meaningful public participation under Article 118 of the Constitution.",
    impact: "Court declared the disputed regulations unconstitutional, preserving manufacturing industry margins.",
    practiceAreaId: "constitutional-public-law"
  },
  {
    id: "case-5",
    matterName: "Multinational Cloud Provider v. Data Protection Regulatory Authority",
    clientCategory: "Global Technology Corporation",
    forum: "High Court Commercial Division & Administrative Tribunal",
    year: 2025,
    value: "KES 850,000,000",
    readTime: "3 min read",
    summary: "Challenged statutory penalty notice issued by the Office of the Data Protection Commissioner regarding automated profiling and sovereign cloud localization mandates.",
    impact: "First judicial review decision clarifying statutory exemptions for encrypted telemetry under Section 48 of the KDPA.",
    practiceAreaId: "tech-ip"
  }
];

export const LEGAL_ARTICLES: LegalArticle[] = [
  {
    id: "article-1",
    title: "The Shifting Landscape of Sectional Properties in Kenya: Mandatory Deadlines and Title Safeguards",
    category: "Real Estate & Conveyancing",
    date: "January 2026",
    readTime: "6 min read",
    synopsis: "An in-depth analysis of the Sectional Properties Act 2020 transition requirements for corporate developments, sectional plans approval, and title migration onto ArdhiSasa.",
    citation: "PAA Law Review, Vol. XII, Issue 1",
    content: [
      "The enactment of the Sectional Properties Act, 2020 radically reformed Kenya's residential and commercial multi-unit property regime. It mandated the conversion of all long-term sub-leases registered under repealed land statutes into sectional title deeds.",
      "For institutional investors, commercial developers, and financial institutions holding charges over mother titles, the practical implications are significant. We examine recent court decisions affirming that lack of sectional conversion does not void underlying ownership, yet strictly curtails subsequent bank charge registration.",
      "Chambers recommends corporate property owners conduct immediate title audits and commission cadastral georeferencing surveys to prevent transactional bottlenecks at the Ministry of Lands registry."
    ]
  },
  {
    id: "article-2",
    title: "Navigating Enforcement of International Arbitral Awards in Kenya: NCIA and The New York Convention",
    category: "Dispute Resolution & Arbitration",
    date: "December 2025",
    readTime: "8 min read",
    synopsis: "Examining the judicial deference given to arbitral awards by the High Court of Kenya and recent appellate boundaries on the 'public policy' defense.",
    citation: "Kenya Commercial Law Commentary, 2025",
    content: [
      "The Kenyan Judiciary has progressively solidified Nairobi's status as the pre-eminent arbitration hub of Sub-Saharan Africa. Guided by Section 35 of the Arbitration Act 1995, courts have repeatedly restrained parties from using setting-aside applications as disguised appeals.",
      "In a decisive recent Court of Appeal judgment argued by our chambers, the court reiterated that 'public policy' is an exceptional standard requiring proof of fundamental corruption, illegality, or clear violation of the Constitution of Kenya 2010.",
      "Commercial entities drafting cross-border joint venture agreements are strongly advised to select Nairobi Centre for International Arbitration (NCIA) or LCIA rules with express seat designations."
    ]
  },
  {
    id: "article-3",
    title: "Director Fiduciary Liabilities and Insolvency Triggers under Companies Act 2015: An Executive Advisory",
    category: "Corporate Governance",
    date: "October 2025",
    readTime: "5 min read",
    synopsis: "Guidance for corporate boards on avoiding wrongful trading liabilities during liquidity distress and leveraging administration moratoria.",
    citation: "PAA Executive Briefing No. 44",
    content: [
      "Under Section 143 of the Companies Act 2015, directors owe statutory fiduciary duties directly to the company. When an enterprise approaches insolvency, however, the target of these duties pivots significantly toward safeguarding the collective creditor pool.",
      "The Insolvency Act 2015 introduced progressive administration procedures designed to rescue viable companies as going concerns rather than defaulting straight to liquidation. We outline key precautions required when approving dividend declarations or asset disposals under contested financial conditions."
    ]
  }
];

export const MOCK_CLIENT_MATTERS: ClientMatter[] = [
  {
    reference: "PAA/2026/HC-8941",
    clientEntity: "Consolidated Energy Holdings Ltd",
    caseTitle: "Consolidated Energy Holdings Ltd v. Grid Transmission Authority & Attorney General",
    forum: "High Court of Kenya (Milimani Commercial & Tax Division)",
    ctsNumber: "CTS/MIL/COMM/2026/08941",
    bench: "Hon. Lady Justice J. Wambui (Commercial Court 4)",
    leadAdvocate: "Milton Angwenyi, SC (Assisted by David Otieno)",
    currentStage: "Hearing of Preliminary Objection on Jurisdiction",
    nextHearingDate: "18 November 2026 at 09:30 AM",
    causeListNo: "Item No. 7 on Daily Commercial Cause List",
    status: "Active - Pleadings Closed & Discovery Exchanged",
    virtualCourtRoom: "https://judiciary-ke.webex.com/meet/milimani-comm-court4",
    escrowDeposit: "KES 50,000,000",
    trustAccount: "KCB Bank Kenya - Upper Hill Corporate Branch (A/C: 110-849-2091)",
    aroScale: "Advocates (Remuneration) Order Cap 16, Schedule 6 Part I (Commercial)",
    financialSummary: {
      totalRetainer: "KES 14,500,000",
      settledToDate: "KES 8,700,000",
      heldInEscrow: "KES 50,000,000",
      statutoryDisbursements: "KES 412,500",
    },
    chronology: [
      {
        stage: "Filing of Plaint & Urgent Injunction Motion",
        date: "12 Oct 2026",
        status: "completed",
        notes: "Electronic e-filing approved by Milimani Commercial Registrar; certificate of urgency granted.",
        registryRef: "REG-MIL-2026-1014"
      },
      {
        stage: "Interlocutory Asset Preservation Order",
        date: "24 Oct 2026",
        status: "completed",
        notes: "Court granted preservative stay restraining realization of bank guarantees pending hearing of main motion.",
        registryRef: "ORD-MIL-2026-3829"
      },
      {
        stage: "Exchange of Affidavits & Discovery Inspection",
        date: "04 Nov 2026",
        status: "completed",
        notes: "Defendant filed Replying Affidavit; inspection of original substation supply contracts concluded at chambers.",
        registryRef: "NOT-MIL-2026-4401"
      },
      {
        stage: "Hearing of Preliminary Objection on Jurisdiction",
        date: "18 Nov 2026",
        status: "current",
        notes: "Scheduled for oral submissions before Lady Justice Wambui. Lead Counsel Milton Angwenyi, SC appearing.",
        registryRef: "CAUSE-LIST-ITEM-7"
      },
      {
        stage: "Pre-Trial Case Management & Settlement Conference",
        date: "08 Dec 2026",
        status: "upcoming",
        notes: "Rule 11 Directions on witness bundles, agreed issues, and expedited trial scheduling."
      },
      {
        stage: "Judicial Determination / Full Hearing",
        date: "January 2027",
        status: "upcoming",
        notes: "Substantive trial on contractual indemnity and sovereign performance guarantee."
      }
    ],
    documents: [
      {
        name: "Plaint & Verifying Affidavit.pdf",
        date: "12 Oct 2026",
        size: "3.4 MB",
        pages: 18,
        readTime: "8 min read",
        category: "Pleadings",
        ctsHash: "SHA256:7f9a2b8e...3c11",
        signatory: "Milton Angwenyi, SC & Commissioned Oaths",
        summary: "Originating plaint pleading breach of power concession agreement and claiming declaratory injunctive relief against unilateral encashment of performance bonds."
      },
      {
        name: "Chambers Ruling on Preservation of Assets.pdf",
        date: "24 Oct 2026",
        size: "1.8 MB",
        pages: 12,
        readTime: "5 min read",
        category: "Judicial Order",
        ctsHash: "SHA256:9a41c21d...00fa",
        signatory: "Hon. Lady Justice J. Wambui (Certified Stamp)",
        summary: "Formal extracted court order preserving status quo and enjoining commercial banks from honoring disputed transmission letters of credit."
      },
      {
        name: "Written Submissions of Senior Counsel on Preliminary Objection.pdf",
        date: "02 Nov 2026",
        size: "2.1 MB",
        pages: 24,
        readTime: "11 min read",
        category: "Submissions",
        ctsHash: "SHA256:4b10fa72...89ee",
        signatory: "Milton Angwenyi, SC",
        summary: "Authoritative jurisprudential submissions refuting defendant's jurisdictional challenge with reference to Section 6 of the Civil Procedure Act."
      },
      {
        name: "Joint Engineering Audit & Power Grid Telemetry Report.pdf",
        date: "08 Nov 2026",
        size: "5.7 MB",
        pages: 42,
        readTime: "19 min read",
        category: "Evidence",
        ctsHash: "SHA256:1a84f391...67cc",
        signatory: "Eng. M. Karani, REng & Technical Expert Witness",
        summary: "Independent certified technical verification confirming grid completion milestones and force majeure grid synchronization delays."
      }
    ],
    invoices: [
      {
        invoiceNo: "INV-2026-PAA-0418",
        date: "14 Oct 2026",
        description: "Initial Professional Retainer & Settling of Originating Plaint (ARO Sched. 6 Part I)",
        statutoryScale: "Advocates Remuneration Order Scale A",
        amount: "KES 5,000,000",
        taxVat: "KES 800,000 (16% VAT)",
        total: "KES 5,800,000",
        status: "Paid / Reconciled"
      },
      {
        invoiceNo: "INV-2026-PAA-0462",
        date: "26 Oct 2026",
        description: "Chambers Appearance on Emergency Injunction & Drafting Extracted Court Order",
        statutoryScale: "Advocates Remuneration Order Scale B",
        amount: "KES 2,500,000",
        taxVat: "KES 400,000 (16% VAT)",
        total: "KES 2,900,000",
        status: "Paid / Reconciled"
      },
      {
        invoiceNo: "INV-2026-PAA-0504",
        date: "05 Nov 2026",
        description: "Preparation of Senior Counsel Submissions & Senior Counsel Briefing Fee",
        statutoryScale: "Advocates Remuneration Order Senior Counsel Scale",
        amount: "KES 5,000,000",
        taxVat: "KES 800,000 (16% VAT)",
        total: "KES 5,800,000",
        status: "Pending Escrow Clearance"
      }
    ],
    directMessages: [
      {
        id: "msg-1",
        sender: "Senior Counsel Milton Angwenyi",
        role: "Lead Counsel & Head of Chambers",
        timestamp: "03 Nov 2026, 14:20 EAT",
        content: "We have finalized our submissions refuting the Defendant's preliminary objection. Lady Justice Wambui is known for rigorous adherence to timetable, so we expect the bench will reserve ruling within 14 days of hearing.",
        isOfficial: true
      },
      {
        id: "msg-2",
        sender: "Chambers Registrar (Court Filings Desk)",
        role: "Judicial E-Filing Clerk",
        timestamp: "08 Nov 2026, 11:05 EAT",
        content: "Joint Engineering Audit Report successfully uploaded to Kenya Judiciary CTS e-filing portal under CTS Reference CTS/MIL/COMM/2026/08941. Hearing confirmation notice served on opposing counsel.",
        isOfficial: true
      }
    ],
    caseCompletionPercentage: 45,
    judiciarySync: {
      ctsRegistryId: "CTS/MIL/COMM/2026/08941",
      portalStatus: "CONNECTED_REALTIME",
      lastVerifiedAt: "04 Nov 2026, 09:45 EAT",
      digitalSignatureHash: "SHA256:3d91ca80...9102/MILIMANI-HIGH-COURT",
      verifiedCourt: "High Court of Kenya (Milimani Commercial Court 4)",
      nextHearingDate: "18 November 2026 at 09:30 AM EAT",
      nextHearingCountdownDays: 14,
      courtRoomLocation: "Milimani Law Courts, 3rd Floor Commercial Division Courtroom 4"
    },
    judiciaryUpdates: [
      {
        id: "upd-hc-1",
        ctsDocket: "CTS/MIL/COMM/2026/08941",
        timestamp: "03 Nov 2026, 11:30 EAT",
        source: "Kenya Judiciary CTS Portal",
        type: "Hearing Cause List",
        title: "Item 7 on Daily Commercial List Confirmed by Deputy Registrar",
        summary: "Hearing of Defendant's preliminary objection on jurisdiction listed before Hon. Lady Justice J. Wambui.",
        isRead: false,
        judicialOfficer: "Hon. Lady Justice J. Wambui"
      },
      {
        id: "upd-hc-2",
        ctsDocket: "REG-MIL-2026-1014",
        timestamp: "24 Oct 2026, 15:20 EAT",
        source: "Commercial Division Registry",
        type: "Bench Directions",
        title: "Interim Asset Preservation Injunction Extracted and Signed",
        summary: "Formal sealed court order restraining unilateral realization of security guarantees pending inter-partes hearing.",
        isRead: true,
        judicialOfficer: "Deputy Registrar Milimani Commercial"
      }
    ]
  },
  {
    reference: "PAA/2026/ARB-302",
    clientEntity: "Apex Real Estate PLC",
    caseTitle: "Apex Real Estate PLC v. Regional General Contractors & Civil Engineers Ltd",
    forum: "Nairobi Centre for International Arbitration (Tribunal Room 3)",
    ctsNumber: "NCIA/ARB/REG/2026/0302",
    bench: "Dr. Kariuki Muigua, C.Arb (Presiding Sole Arbitrator)",
    leadAdvocate: "Brian Kipkemboi Cheruiyot & David Otieno, ACIArb",
    currentStage: "Tribunal Evidentiary Hearing & Cross-Examination",
    nextHearingDate: "25 November 2026 at 10:00 AM",
    causeListNo: "Tribunal Hearing Docket NCIA/2026/Day-4",
    status: "In Progress - Evidentiary Hearing",
    virtualCourtRoom: "https://ncia.or.ke/virtual-tribunals/room-3-secure",
    escrowDeposit: "USD $250,000",
    trustAccount: "KCB Bank Kenya - Institutional Escrow (USD A/C: 110-928-4011)",
    aroScale: "Arbitration Act 1995 & NCIA Institutional Fee Schedule (Scale IV)",
    financialSummary: {
      totalRetainer: "USD $85,000",
      settledToDate: "USD $55,000",
      heldInEscrow: "USD $250,000",
      statutoryDisbursements: "USD $14,200",
    },
    chronology: [
      {
        stage: "Notice of Arbitration & Arbitrator Appointment",
        date: "14 Jul 2026",
        status: "completed",
        notes: "NCIA Registrar confirmed appointment of Sole Arbitrator pursuant to clause 20 of FIDIC Red Book.",
        registryRef: "NCIA-NOT-2026-081"
      },
      {
        stage: "Statement of Claim & Expert Quantum Report",
        date: "05 Sep 2026",
        status: "completed",
        notes: "Claimant submitted comprehensive expert delay analysis and defect remediation claims.",
        registryRef: "SOC-ARB-2026-11"
      },
      {
        stage: "Preliminary Procedural Hearing & Directions",
        date: "28 Sep 2026",
        status: "completed",
        notes: "Procedural Order No. 1 established timetable for expert evidence and hearing bundles.",
        registryRef: "PO-1-NCIA-302"
      },
      {
        stage: "Tribunal Evidentiary Hearing & Cross-Examination",
        date: "25 Nov 2026",
        status: "current",
        notes: "Cross-examination of respondent's structural engineering expert witness.",
        registryRef: "DOCKET-NCIA-DAY4"
      },
      {
        stage: "Closing Memorials & Legal Submissions",
        date: "15 Dec 2026",
        status: "upcoming",
        notes: "Concurrent filing of post-hearing legal briefs."
      },
      {
        stage: "Final Arbitral Award Delivery",
        date: "February 2027",
        status: "upcoming",
        notes: "Tribunal award binding under Section 32A of the Arbitration Act."
      }
    ],
    documents: [
      {
        name: "Statement of Claim & Expert Delay Report.pdf",
        date: "05 Sep 2026",
        size: "8.2 MB",
        pages: 36,
        readTime: "16 min read",
        category: "Pleadings",
        ctsHash: "SHA256:3d91ca80...4182",
        signatory: "Brian Kipkemboi Cheruiyot (Advocate for Claimant)",
        summary: "Detailed memorial substantiating liquidated damages under FIDIC Clause 8.7 and structural defect remediation costs."
      },
      {
        name: "FIDIC Engineer Adjudication Determination.pdf",
        date: "18 Sep 2026",
        size: "2.6 MB",
        pages: 22,
        readTime: "10 min read",
        category: "Evidence",
        ctsHash: "SHA256:88fa10be...9290",
        signatory: "FIDIC Dispute Adjudication Board (DAB)",
        summary: "Certified engineer assessment establishing contractor liability for foundation settlement and structural non-compliance."
      },
      {
        name: "Tribunal Procedural Order No 1.pdf",
        date: "28 Sep 2026",
        size: "1.4 MB",
        pages: 8,
        readTime: "4 min read",
        category: "Judicial Order",
        ctsHash: "SHA256:55ab83cd...114a",
        signatory: "Dr. Kariuki Muigua, C.Arb (Sole Arbitrator)",
        summary: "Binding procedural schedule governing document production, witness testimony, and confidentiality orders."
      },
      {
        name: "Geotechnical Soil Core Analysis & Column Test.pdf",
        date: "12 Aug 2026",
        size: "4.1 MB",
        pages: 28,
        readTime: "13 min read",
        category: "Evidence",
        ctsHash: "SHA256:92cb71ef...8810",
        signatory: "Bureau Veritas Geotechnical Laboratory (Eng. R. Nderitu)",
        summary: "Certified forensic core sample borehole tests confirming differential column settlement across foundation Grid C12-C18."
      },
      {
        name: "Contractor Irrevocable Performance Guarantee Bond.pdf",
        date: "14 Jan 2024",
        size: "850 KB",
        pages: 4,
        readTime: "2 min read",
        category: "Evidence",
        ctsHash: "SHA256:66ba4409...3129",
        signatory: "Standard Chartered Bank Kenya PLC (Trade Finance Dept)",
        summary: "Original irrevocable on-demand performance security bond for USD $5,000,000 securing contractor compliance."
      },
      {
        name: "Legal Submissions on Arbitral Jurisdiction & Sec 6.pdf",
        date: "22 Sep 2026",
        size: "3.2 MB",
        pages: 32,
        readTime: "15 min read",
        category: "Submissions",
        ctsHash: "SHA256:41ee29aa...7019",
        signatory: "Milton Angwenyi, SC & Brian Kipkemboi Cheruiyot",
        summary: "Skeleton legal argument with reported East African appellate authorities refuting contractor's preliminary jurisdictional challenge."
      }
    ],
    invoices: [
      {
        invoiceNo: "INV-2026-ARB-0112",
        date: "18 Jul 2026",
        description: "Arbitration Commencement Fee & NCIA Institutional Administrative Registry Dues",
        statutoryScale: "NCIA Rules Schedule 1",
        amount: "USD $20,000",
        taxVat: "USD $3,200",
        total: "USD $23,200",
        status: "Paid / Reconciled"
      },
      {
        invoiceNo: "INV-2026-ARB-0145",
        date: "10 Sep 2026",
        description: "Drafting Statement of Claim & Briefing Structural Quantum Expert Witness",
        statutoryScale: "ARO Cap 16 Schedule 5",
        amount: "USD $35,000",
        taxVat: "USD $5,600",
        total: "USD $40,600",
        status: "Paid / Reconciled"
      },
      {
        invoiceNo: "INV-2026-ARB-0199",
        date: "01 Nov 2026",
        description: "Evidentiary Hearing Days 1-5 Retainer & Senior Counsel Daily Refresher",
        statutoryScale: "ARO Daily Refresher Scale",
        amount: "USD $30,000",
        taxVat: "USD $4,800",
        total: "USD $34,800",
        status: "Pending Escrow Clearance"
      }
    ],
    directMessages: [
      {
        id: "msg-arb-1",
        sender: "Brian Kipkemboi Cheruiyot",
        role: "Partner & Head of Real Estate Conveyancing",
        timestamp: "02 Nov 2026, 09:15 EAT",
        content: "The expert witness report on foundation settlement has been admitted into the arbitral record without reservation. The arbitrator has directed that cross-examination proceed promptly on 25 November.",
        isOfficial: true
      }
    ],
    consultations: [
      {
        id: "conf-2026-001",
        reference: "PAA/2026/INST-1042",
        clientName: "Consolidated Infrastructure Developers Ltd",
        corporateEntity: "Consolidated Infrastructure Developers Ltd",
        advocateName: "Milton Angwenyi, SC",
        advocateRole: "Senior Counsel & Managing Partner",
        practiceArea: "International Commercial Arbitration & Construction",
        scheduledDate: "12 Aug 2026",
        scheduledTime: "14:00 EAT (11:00 GMT)",
        format: "chambers",
        status: "Completed / Minutes Filed",
        billableHours: 2.5,
        forumLocation: "PAA Chambers, 9th Floor, Mara Square, Upper Hill, Nairobi",
        matterDocket: "PAA/2026/LIT-0842/BAK",
        summaryNotes: "Emergency strategy conference convened to evaluate contractor default under FIDIC Sub-Clause 8.7. Advised on ex-parte conservatory injunction to restrain encashment of subcontractor securities and served statutory notice of dispute.",
        actionItems: [
          "Serve formal Notice of Dispute under FIDIC Sub-Clause 20.1",
          "Brief Bureau Veritas for independent geotechnical column settlement report",
          "Open institutional escrow trust ledger with KCB Bank Upper Hill Branch"
        ],
        attendees: [
          "Milton Angwenyi, SC (Lead Counsel)",
          "Brian Kipkemboi Cheruiyot (Partner)",
          "Eng. David Kamau (Managing Director, CID Ltd)",
          "Dr. Stella Mwangi (General Counsel, CID Ltd)"
        ],
        voiceNote: {
          id: "vn-001",
          duration: "03:42",
          audioSeconds: 222,
          recordedBy: "Milton Angwenyi, SC",
          recordedRole: "Senior Counsel Dictation Note",
          recordedAt: "12 Aug 2026, 16:30 EAT",
          waveform: [15, 30, 65, 40, 85, 95, 70, 50, 80, 60, 45, 90, 100, 75, 55, 40, 65, 80, 50, 30],
          transcript: "Dictation memo by Milton Angwenyi, Senior Counsel. Regarding Mara Towers dispute FIDIC Sub-Clause 8.7: We have satisfied ourselves that the delay of 184 days is attributable exclusively to the contractor's defective column foundation pouring. Our ex-parte motion before Lady Justice Wambui will seek preservation of the USD 5 Million Standard Chartered performance bond. Instruct Brian to coordinate with Bureau Veritas on borehole core evidence immediately.",
          statutoryPrivilegeRef: "Section 134 Kenya Evidence Act (Cap 80) Privileged Counsel Dictation"
        }
      },
      {
        id: "conf-2026-002",
        reference: "PAA/2026/INST-3489",
        clientName: "Consolidated Infrastructure Developers Ltd",
        corporateEntity: "Consolidated Infrastructure Developers Ltd",
        advocateName: "Brian Kipkemboi Cheruiyot",
        advocateRole: "Partner & Head of Infrastructure",
        practiceArea: "Commercial Real Estate & Infrastructure (FIDIC)",
        scheduledDate: "20 Sep 2026",
        scheduledTime: "15:30 EAT (12:30 GMT)",
        format: "virtual",
        status: "Completed / Minutes Filed",
        billableHours: 1.8,
        forumLocation: "Encrypted Chambers Virtual Video Suite (MS Teams VIP)",
        meetingLink: "https://teams.microsoft.com/l/meetup-join/paa-arb-conf-2026",
        matterDocket: "PAA/2026/LIT-0842/BAK",
        summaryNotes: "Comprehensive review of FIDIC Engineer DAB Determination. Finalized quantum schedules establishing unexcused delay of 184 days and verified total accrued liquidated damages of USD $8,280,000.",
        actionItems: [
          "Lodge formal Statement of Claim with NCIA Registrar",
          "Serve certified electronic copies on Respondent's advocates Kaplan & Stratton",
          "File Certificate of Electronic Records under Section 106B of Evidence Act"
        ],
        attendees: [
          "Brian Kipkemboi Cheruiyot (Partner)",
          "David Otieno (Senior Associate)",
          "Dr. E. K. Mwendwa (Quantum Quantity Surveyor)",
          "Eng. David Kamau (Managing Director, CID Ltd)"
        ],
        voiceNote: {
          id: "vn-002",
          duration: "02:15",
          audioSeconds: 135,
          recordedBy: "Brian Kipkemboi Cheruiyot",
          recordedRole: "Partner Chambers Debrief",
          recordedAt: "20 Sep 2026, 17:10 EAT",
          waveform: [20, 45, 30, 60, 75, 90, 80, 50, 40, 70, 85, 95, 60, 40, 35, 55, 70, 45, 25, 20],
          transcript: "Conference debrief with Dr. Mwendwa and Claimant executives. The Dispute Adjudication Board has confirmed contractor liability. The DAB dismissed the 92-day weather extension claim in its entirety. Statement of Claim quantum stands verified at USD 14.25 Million. Filing electronically on Judiciary CTS portal this evening.",
          statutoryPrivilegeRef: "Section 134 Kenya Evidence Act (Cap 80) Privileged Partner Debrief"
        }
      },
      {
        id: "conf-2026-003",
        reference: "PAA/2026/INST-7891",
        clientName: "Consolidated Infrastructure Developers Ltd",
        corporateEntity: "Consolidated Infrastructure Developers Ltd",
        advocateName: "Milton Angwenyi, SC",
        advocateRole: "Senior Counsel & Managing Partner",
        practiceArea: "International Commercial Arbitration & Construction",
        scheduledDate: "25 Nov 2026",
        scheduledTime: "14:00 EAT (11:00 GMT)",
        format: "chambers",
        status: "Confirmed & Scheduled",
        billableHours: 2.0,
        forumLocation: "PAA Chambers, 9th Floor, Mara Square, Upper Hill, Nairobi",
        matterDocket: "PAA/2026/LIT-0842/BAK",
        summaryNotes: "Pre-Evidentiary Hearing Strategy Conference. Pre-hearing mock examination of principal witness and alignment of cross-examination strategy against respondent's structural expert witness.",
        actionItems: [
          "Collate cross-examination authorities bundle for Tribunal submission",
          "Prepare witness attendance subpoenas under Section 24 NCIA Act",
          "Reconcile daily refresher disbursements ledger"
        ],
        attendees: [
          "Milton Angwenyi, SC (Lead Counsel)",
          "Brian Kipkemboi Cheruiyot (Partner)",
          "Eng. David Kamau (Managing Director, CID Ltd)"
        ],
        voiceNote: {
          id: "vn-003",
          duration: "01:50",
          audioSeconds: 110,
          recordedBy: "Milton Angwenyi, SC",
          recordedRole: "Hearing Preparation Pre-Brief",
          recordedAt: "03 Nov 2026, 10:00 EAT",
          waveform: [30, 50, 70, 85, 90, 60, 40, 65, 80, 95, 85, 70, 55, 45, 60, 75, 60, 40, 30, 20],
          transcript: "Pre-hearing alignment notes: Cross-examination will concentrate on the contractor's failure to give timely 28-day notice under Sub-Clause 20.1. Ensure all electronic certificates under Section 106B of Evidence Act are stamped by Chambers Registrar before hearing date.",
          statutoryPrivilegeRef: "Section 134 Kenya Evidence Act (Cap 80)"
        }
      }
    ],
    caseCompletionPercentage: 68,
    judiciarySync: {
      ctsRegistryId: "CTS/MIL/COMM/2026/08941",
      portalStatus: "CONNECTED_REALTIME",
      lastVerifiedAt: "04 Nov 2026, 11:20 EAT",
      digitalSignatureHash: "SHA256:7f9a2b8e...3c11/REG-JUDICIARY-KE",
      verifiedCourt: "High Court of Kenya (Commercial & Tax Division) & NCIA Arbitral Registry",
      nextHearingDate: "25 Nov 2026 at 09:30 AM EAT",
      nextHearingCountdownDays: 21,
      courtRoomLocation: "Milimani Commercial Courtroom 4 & NCIA Arbitral Suite 3"
    },
    judiciaryUpdates: [
      {
        id: "upd-001",
        ctsDocket: "CTS/MIL/COMM/2026/08941",
        timestamp: "04 Nov 2026, 08:30 EAT",
        source: "Kenya Judiciary CTS Portal",
        type: "Hearing Cause List",
        title: "Tribunal Evidentiary Hearing Confirmed on Judiciary Cause List",
        summary: "Hon. Sole Arbitrator Dr. Kariuki Muigua confirmed Day 1 through Day 5 hearing dates (25-30 Nov 2026). Electronic courtroom links activated.",
        isRead: false,
        judicialOfficer: "Dr. Kariuki Muigua, C.Arb (Sole Arbitrator)"
      },
      {
        id: "upd-002",
        ctsDocket: "SOC-ARB-2026-11",
        timestamp: "02 Nov 2026, 14:15 EAT",
        source: "Commercial Division Registry",
        type: "Filing Acceptance",
        title: "Supplemental Expert Quantum Affidavit Formally Accepted",
        summary: "Kenya Judiciary e-filing registry seal affixed to Bureau Veritas geotechnical borehole survey under Section 106B Evidence Act.",
        isRead: false,
        judicialOfficer: "Milimani Commercial Deputy Registrar"
      },
      {
        id: "upd-003",
        ctsDocket: "PO-1-NCIA-302",
        timestamp: "28 Sep 2026, 16:45 EAT",
        source: "Chambers Process Server",
        type: "Service Return",
        title: "Affidavit of Service Filed for Procedural Order No. 1",
        summary: "Certified service effected upon Respondent's counsel Kaplan & Stratton Advocates via encrypted CTS secure registry link.",
        isRead: true,
        judicialOfficer: "Senior Process Server J. Mutisya"
      }
    ]
  }
];

export const SAMPLE_CLIENT_MATTER: ClientMatter = MOCK_CLIENT_MATTERS[1];


export const CLIENT_TESTIMONIALS: ClientTestimonial[] = [
  {
    id: "testimonial-banking",
    quote: "When an adverse consortium sought an ex-parte injunction over KES 6.2 Billion in charged security assets, Senior Counsel Milton Angwenyi and his team dismantled the adverse application in the Court of Appeal within 72 hours. Their grasp of commercial insolvency and judicial temperament is peerless in Eastern Africa.",
    author: "Dr. Arthur Kibera",
    role: "Group General Counsel & Company Secretary",
    organization: "Equatorial Commercial Bank Group PLC",
    sector: "Banking & Financial Services",
    matterContext: "High Court & Court of Appeal Security Realization Defense",
    impactMetrics: "Protected KES 6.2B in Secured Assets"
  },
  {
    id: "testimonial-tech",
    quote: "Petersons Angwenyi & Associates navigated our Central Bank regulatory sandbox clearance and cross-border IP structuring across five African jurisdictions. Their counsel is simultaneously commercially proactive and constitutionally unassailable.",
    author: "Wangari Mwangi",
    role: "Chief Executive Officer & Co-Founder",
    organization: "LipaCore Global Payments Inc.",
    sector: "Fintech & Digital Infrastructure",
    matterContext: "CBK Regulatory Licensing & Data Protection Sovereign Audit",
    impactMetrics: "Secured Full CBK Digital Lender License"
  },
  {
    id: "testimonial-energy",
    quote: "In negotiating our 120MW geothermal power purchase agreement with Kenya Power and subsequently prevailing in a multi-million dollar LCIA arbitration, PAA Advocates demonstrated unmatched tenacity. Their strategic precision protected over USD $42 Million in infrastructure capital.",
    author: "Eng. Jean-Claude Murangira",
    role: "Managing Director",
    organization: "Rift Valley Geothermal Power Consortium",
    sector: "Renewable Energy & Infrastructure",
    matterContext: "LCIA International Arbitration & PPA Concession",
    impactMetrics: "Enforced USD $42M Arbitral Award"
  },
  {
    id: "testimonial-realestate",
    quote: "The chambers led our transitional conversion of 1,200 commercial and residential leases under the Sectional Properties Act 2020 onto ArdhiSasa without a single transactional dispute. Brian Kipkemboi is Kenya's definitive authority on institutional property conveyancing.",
    author: "Nicholas K. Sang",
    role: "Executive Chairman",
    organization: "Mara Heights Urban Developments Ltd",
    sector: "Commercial Real Estate",
    matterContext: "Sectional Properties Act 2020 Master Conversion",
    impactMetrics: "1,200 Sectional Titles Regularized"
  }
];

export const FIRM_MILESTONES: FirmMilestone[] = [
  {
    id: "milestone-chambers",
    metric: "Band 1",
    label: "Chambers Global Ranking",
    institution: "Chambers & Partners (2026)",
    description: "Ranked as premier counsel in High-Stakes Dispute Resolution, Appellate Advocacy, and Sovereign Concessions.",
    badge: "Tier-1 Excellence"
  },
  {
    id: "milestone-lsk",
    metric: "Law Society of Kenya",
    label: "Legal Practice Commendation",
    institution: "LSK Corporate Governance (2025)",
    description: "Awarded highest institutional integrity and excellence for fidelity to the Advocates Remuneration Order and Rule of Law.",
    badge: "Official LSK Accredited"
  },
  {
    id: "milestone-dealvolume",
    metric: "KES 85B+",
    label: "Verified Transaction Volume",
    institution: "Nairobi Superior Courts & Registries",
    description: "Advising on landmark syndicated loans, infrastructure PPPs, and reported Supreme Court precedents.",
    badge: "Capital Market Impact"
  },
  {
    id: "milestone-arbitration",
    metric: "FCIArb",
    label: "Chartered Arbitral Seat",
    institution: "NCIA & LCIA International Panels",
    description: "Advocates seated on premier domestic and international commercial arbitral tribunals in London, Dubai, and Nairobi.",
    badge: "Arbitral Supremacy"
  }
];

export interface LawFirmAward {
  id: string;
  title: string;
  organization: string;
  year: string;
  tier: string;
  scope: 'Global' | 'Regional (East Africa)' | 'Kenya National' | 'Pan-African';
  category: string;
  citation: string;
  accreditationRef: string;
  badge: string;
  categoryGroup: 'global' | 'national' | 'finance';
}

export const LAW_FIRM_AWARDS: LawFirmAward[] = [
  {
    id: "award-chambers-2026",
    title: "Band 1 - Dispute Resolution & Commercial Litigation",
    organization: "Chambers & Partners Global",
    year: "2026",
    tier: "Band 1 (Highest Distinction)",
    scope: "Global",
    category: "Commercial Arbitration & Superior Courts Litigation",
    citation: "Petersons Angwenyi & Associates maintains an unshakeable reputation for decisive appellate strategy and high-stakes corporate disputes before Kenya's Supreme Court and Court of Appeal.",
    accreditationRef: "CHAMBERS-GLB-KEN-2026-B1",
    badge: "Band 1 Ranked",
    categoryGroup: "global"
  },
  {
    id: "award-legal500-2025",
    title: "Tier 1 Leading Firm - Commercial, Corporate and M&A",
    organization: "The Legal 500 Europe, Middle East & Africa (EMEA)",
    year: "2025/2026",
    tier: "Tier 1 Top Tier",
    scope: "Regional (East Africa)",
    category: "Corporate Finance, Cross-Border Concessions & Sovereign M&A",
    citation: "A powerhouse practice in Nairobi recognized for pioneering multi-billion shilling energy concessions, syndicated project finance, and regulatory sandbox licensing under the Central Bank of Kenya.",
    accreditationRef: "L500-EMEA-KEN-2025-T1",
    badge: "Top Tier 1",
    categoryGroup: "global"
  },
  {
    id: "award-lsk-2025",
    title: "Commercial Litigation & Dispute Resolution Law Firm of the Year",
    organization: "Law Society of Kenya (LSK) Legal Excellence Awards",
    year: "2025",
    tier: "Winner / Apex Award",
    scope: "Kenya National",
    category: "Constitutional & Commercial Advocacy",
    citation: "Conferred for exemplary fidelity to the rule of law, institutional integrity under the Advocates Remuneration Order (ARO), and benchmark jurisprudence advancing Kenya's commercial court precedents.",
    accreditationRef: "LSK-EXC-2025-WINNER-LIT",
    badge: "Law Firm of the Year",
    categoryGroup: "national"
  },
  {
    id: "award-iflr1000-2026",
    title: "Top Tier - Project Development & Banking Finance",
    organization: "IFLR1000 Financial and Corporate",
    year: "2026",
    tier: "Tier 1 Recognized",
    scope: "Global",
    category: "Infrastructure PPP, Energy & Sovereign Debt Structuring",
    citation: "The firm is widely applauded by financial institutions and multilateral lenders for navigating complex concession security agreements, escrow facilities, and cross-border offtake instruments.",
    accreditationRef: "IFLR-AFR-KEN-2026-T1",
    badge: "IFLR1000 Tier 1",
    categoryGroup: "finance"
  },
  {
    id: "award-africanlegal-2025",
    title: "Commercial Litigation Team of the Year",
    organization: "African Legal Awards (ALM / Law.com International)",
    year: "2025",
    tier: "Winner",
    scope: "Pan-African",
    category: "Cross-Border Commercial Dispute Resolution",
    citation: "Awarded for successful defense in multi-million dollar LCIA and NCIA arbitrations safeguarding regional power transmission grids and East African infrastructural assets.",
    accreditationRef: "ALA-PANAFR-2025-COMM",
    badge: "Pan-African Winner",
    categoryGroup: "national"
  },
  {
    id: "award-ciarb-2025",
    title: "Exemplary Arbitral Practice & ADR Leadership",
    organization: "Chartered Institute of Arbitrators (CIArb Kenya)",
    year: "2025",
    tier: "Institutional Commendation",
    scope: "Regional (East Africa)",
    category: "International Commercial Arbitration (NCIA & LCIA)",
    citation: "Celebrated for chambers partners' distinguished appointments as Fellows of the Chartered Institute of Arbitrators (FCIArb) and leading arbitral chairs across Eastern Africa.",
    accreditationRef: "CIARB-KE-2025-HONOR",
    badge: "FCIArb Accredited",
    categoryGroup: "finance"
  }
];


