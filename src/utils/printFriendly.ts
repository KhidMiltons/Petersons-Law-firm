import { CaseBrief, LegalArticle, LawFirmAward } from '../data/firmData';
import { RegionalLocation } from '../data/eastAfricaData';

export interface PrintDocumentMetadata {
  docRef: string;
  docType: 'Judicial Precedent Briefing' | 'Law Review & Regulatory Insight' | 'Law Firm Honors & Accreditations' | 'East Africa Cross-Border Advisory Dossier';
  title: string;
  subtitle: string;
  dateGenerated: string;
  category: string;
  jurisdiction: string;
  citation: string;
}

export interface PrintDocument {
  meta: PrintDocumentMetadata;
  sections: {
    heading?: string;
    content: string | string[];
    isHighlight?: boolean;
    callout?: {
      label: string;
      value: string;
    };
  }[];
  statutoryBasis?: string[];
  firmDetails: {
    name: string;
    chambers: string;
    address: string;
    telephone: string;
    email: string;
    rollNumber: string;
    lskRef: string;
  };
}

export function formatCaseBriefForPrint(brief: CaseBrief): PrintDocument {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return {
    meta: {
      docRef: `PAA/PRECEDENT/${brief.year}/${brief.id.toUpperCase()}`,
      docType: 'Judicial Precedent Briefing',
      title: brief.matterName,
      subtitle: `${brief.forum} · Precedent Year ${brief.year}`,
      dateGenerated: currentDate,
      category: brief.clientCategory,
      jurisdiction: 'Superior Courts of Kenya & Regional Commercial Tribunals',
      citation: `PAA Law Reports (Commercial Series), Precedent No. ${brief.year}-${brief.id.replace('case-', '0')}`
    },
    sections: [
      {
        heading: '1. MATTER IDENTIFICATION & CLIENT SECTOR',
        content: `Client Category: ${brief.clientCategory}\nJudicial Forum / Arbitral Seat: ${brief.forum}\nPrecedent Reporting Year: ${brief.year}\nMatter Exposure / Transaction Value: ${brief.value}`
      },
      {
        heading: '2. EXECUTIVE FACTUAL SUMMARY',
        content: brief.summary
      },
      {
        heading: '3. JUDICIAL DETERMINATION & PRECEDENTIAL IMPACT',
        content: brief.impact,
        isHighlight: true
      },
      {
        heading: '4. RELEVANCE TO CORPORATE CLIENTS',
        content: [
          'This case brief illustrates the tactical dispute resolution approach engineered by Petersons Angwenyi & Associates Advocates before Kenya\'s superior courts and arbitral forums.',
          'Parties negotiating commercial contracts or facing contested liabilities are advised to seek customized legal advice regarding governing choice-of-law clauses and expedited injunctive thresholds.'
        ]
      }
    ],
    statutoryBasis: [
      'Civil Procedure Act (Cap 21, Laws of Kenya)',
      'Arbitration Act 1995 (Act No. 4 of 1995)',
      'Constitution of Kenya 2010 (Article 159 - Judicial Authority)',
      'Advocates Act (Cap 16, Laws of Kenya)'
    ],
    firmDetails: {
      name: 'Petersons Angwenyi & Associates Advocates',
      chambers: 'Upper Hill Chambers, 8th Floor, Mara Road, Nairobi',
      address: 'P.O. Box 48920-00100 GPO, Nairobi, Republic of Kenya',
      telephone: '+254 (0) 20 271 8840 / +254 (0) 722 000 000',
      email: 'litigation@paalawkenya.com',
      rollNumber: 'Senior Counsel Milton Angwenyi (Roll: P.105/7412/95)',
      lskRef: 'LSK Firm Certificate No. PAA-1998-NRB'
    }
  };
}

export function formatAllCaseBriefsForPrint(briefs: CaseBrief[]): PrintDocument {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const sections = briefs.flatMap((brief, idx) => [
    {
      heading: `${idx + 1}. ${brief.matterName.toUpperCase()}`,
      content: `Judicial Forum / Arbitral Seat: ${brief.forum}\nPrecedent Reporting Year: ${brief.year}\nInstructing Client Sector: ${brief.clientCategory}\nMatter Exposure / Transaction Value: ${brief.value}\n\nFactual Summary:\n${brief.summary}`,
      isHighlight: false
    },
    {
      heading: `JUDICIAL DETERMINATION & PRECEDENTIAL IMPACT (CASE ${idx + 1})`,
      content: brief.impact,
      isHighlight: true
    }
  ]);

  return {
    meta: {
      docRef: `PAA/PRECEDENTS/COMPENDIUM/${new Date().getFullYear()}`,
      docType: 'Judicial Precedent Briefing',
      title: 'Landmark Judicial Precedents & Milestone Transactions Compendium',
      subtitle: 'Official Law Reports & Arbitral Precedents Series · Petersons Angwenyi & Associates',
      dateGenerated: currentDate,
      category: 'Commercial Litigation, Arbitration, Energy & Sovereign Infrastructure',
      jurisdiction: 'Superior Courts of Kenya, Court of Appeal, Supreme Court & Regional Arbitral Tribunals',
      citation: `PAA Precedent Digest Vol. ${new Date().getFullYear()}`
    },
    sections,
    statutoryBasis: [
      'Civil Procedure Act (Cap 21, Laws of Kenya)',
      'Arbitration Act 1995 (Act No. 4 of 1995)',
      'Constitution of Kenya 2010 (Article 159 - Judicial Authority)',
      'Evidence Act (Cap 80, Laws of Kenya)',
      'Advocates Act (Cap 16, Laws of Kenya)'
    ],
    firmDetails: {
      name: 'Petersons Angwenyi & Associates Advocates',
      chambers: 'Upper Hill Chambers, 8th Floor, Mara Road, Nairobi',
      address: 'P.O. Box 48920-00100 GPO, Nairobi, Republic of Kenya',
      telephone: '+254 (0) 20 271 8840 / +254 (0) 722 000 000',
      email: 'litigation@paalawkenya.com',
      rollNumber: 'Senior Counsel Milton Angwenyi (Roll: P.105/7412/95)',
      lskRef: 'LSK Firm Certificate No. PAA-1998-NRB'
    }
  };
}

export function formatLegalInsightForPrint(article: LegalArticle): PrintDocument {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return {
    meta: {
      docRef: `PAA/INSIGHT/${article.id.toUpperCase()}`,
      docType: 'Law Review & Regulatory Insight',
      title: article.title,
      subtitle: `${article.category} · ${article.date}`,
      dateGenerated: currentDate,
      category: article.category,
      jurisdiction: 'Republic of Kenya & East African Community (EAC)',
      citation: article.citation
    },
    sections: [
      {
        heading: '1. EXECUTIVE SYNOPSIS',
        content: article.synopsis,
        isHighlight: true
      },
      {
        heading: '2. SUBSTANTIVE LEGAL ANALYSIS',
        content: article.content
      },
      {
        heading: '3. CHAMBERS STATUTORY GUIDANCE',
        content: [
          'The principles elucidated in this commentary reflect current statutory interpretations by the High Court, Court of Appeal, and sector regulators in Kenya.',
          'Clients executing corporate conversions, transactions, or filings should contact the designated practice partner to review specific structural considerations.'
        ]
      }
    ],
    statutoryBasis: [
      'Companies Act 2015 (Act No. 17 of 2015)',
      'Sectional Properties Act 2020 (Act No. 21 of 2020)',
      'Arbitration Act 1995 (Cap 49, Laws of Kenya)',
      'Evidence Act (Cap 80, Laws of Kenya)'
    ],
    firmDetails: {
      name: 'Petersons Angwenyi & Associates Advocates',
      chambers: 'Upper Hill Chambers, 8th Floor, Mara Road, Nairobi',
      address: 'P.O. Box 48920-00100 GPO, Nairobi, Republic of Kenya',
      telephone: '+254 (0) 20 271 8840 / +254 (0) 722 000 000',
      email: 'briefings@paalawkenya.com',
      rollNumber: 'Chambers Research & Knowledge Management Desk',
      lskRef: 'LSK Legal Education Commendation (2025)'
    }
  };
}

export function formatAllLegalInsightsForPrint(articles: LegalArticle[]): PrintDocument {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const sections = articles.flatMap((article, idx) => [
    {
      heading: `${idx + 1}. ${article.title.toUpperCase()} (${article.category.toUpperCase()})`,
      content: article.synopsis,
      isHighlight: true
    },
    {
      heading: `SUBSTANTIVE ANALYSIS & CITATION: ${article.citation}`,
      content: article.content
    }
  ]);

  return {
    meta: {
      docRef: `PAA/COMPENDIUM/${new Date().getFullYear()}`,
      docType: 'Law Review & Regulatory Insight',
      title: 'Chambers Legal Insights & Regulatory Compendium',
      subtitle: 'Official Law Review Series · Published by Petersons Angwenyi & Associates',
      dateGenerated: currentDate,
      category: 'Corporate Finance, Dispute Resolution & Energy Practice',
      jurisdiction: 'Republic of Kenya & East African Community (EAC)',
      citation: 'PAA Law Review Annual Compendium Series 2026'
    },
    sections,
    statutoryBasis: [
      'Companies Act 2015 (Act No. 17 of 2015)',
      'Sectional Properties Act 2020 (Act No. 21 of 2020)',
      'Arbitration Act 1995 (Cap 49, Laws of Kenya)',
      'Evidence Act (Cap 80, Laws of Kenya)',
      'Civil Procedure Act (Cap 21, Laws of Kenya)'
    ],
    firmDetails: {
      name: 'Petersons Angwenyi & Associates Advocates',
      chambers: 'Upper Hill Chambers, 8th Floor, Mara Road, Nairobi',
      address: 'P.O. Box 48920-00100 GPO, Nairobi, Republic of Kenya',
      telephone: '+254 (0) 20 271 8840 / +254 (0) 722 000 000',
      email: 'briefings@paalawkenya.com',
      rollNumber: 'Chambers Research & Knowledge Management Desk',
      lskRef: 'LSK Legal Education Commendation (2025)'
    }
  };
}

export function formatSingleAwardForPrint(award: LawFirmAward): PrintDocument {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return {
    meta: {
      docRef: award.accreditationRef,
      docType: 'Law Firm Honors & Accreditations',
      title: `${award.title} (${award.year})`,
      subtitle: `${award.organization} · ${award.tier}`,
      dateGenerated: currentDate,
      category: award.category,
      jurisdiction: `Republic of Kenya, East Africa & Global Bar (${award.scope})`,
      citation: `${award.organization} Official Law Directory Rankings`
    },
    sections: [
      {
        heading: '1. CONFERRED HONORS & EDITORIAL CITATION',
        content: award.citation,
        isHighlight: true
      },
      {
        heading: '2. RECOGNITION TIER & STATUTORY COMPETENCE',
        content: `Awarding Body: ${award.organization}\nHonors Tier: ${award.tier}\nGeographic Scope: ${award.scope}\nSpecialization Category: ${award.category}\nAccreditation Docket Ref: ${award.accreditationRef}`
      },
      {
        heading: '3. INDEPENDENT DIRECTORY METHODOLOGY',
        content: [
          'Peer accreditations and directory rankings are established through rigorous peer interviews, general counsel client feedback, and verified courtroom/transaction audits across Eastern Africa.',
          'Petersons Angwenyi & Associates Advocates maintains active practising roll certificates pursuant to the Advocates Act (Cap 16) and Law Society of Kenya governance standards.'
        ]
      }
    ],
    statutoryBasis: [
      'Advocates Act (Cap 16, Laws of Kenya)',
      'Law Society of Kenya Act 2014',
      'Constitution of Kenya 2010 (Article 50 & 159)',
      'Evidence Act (Cap 80, Laws of Kenya) § 134'
    ],
    firmDetails: {
      name: 'Petersons Angwenyi & Associates Advocates',
      chambers: 'Upper Hill Chambers, 8th Floor, Mara Road, Nairobi',
      address: 'P.O. Box 48920-00100 GPO, Nairobi, Republic of Kenya',
      telephone: '+254 (0) 20 271 8840 / +254 (0) 722 000 000',
      email: 'litigation@paalawkenya.com',
      rollNumber: 'Senior Counsel Milton Angwenyi (Roll: P.105/7412/95)',
      lskRef: 'LSK Firm Certificate No. PAA-1998-NRB'
    }
  };
}

export function formatAwardsCompendiumForPrint(awards: LawFirmAward[]): PrintDocument {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const sections = awards.flatMap((award, idx) => [
    {
      heading: `${idx + 1}. ${award.organization.toUpperCase()} (${award.year}) - ${award.tier.toUpperCase()}`,
      content: `Title: ${award.title}\nCategory: ${award.category}\nScope: ${award.scope}\nVerification Docket: ${award.accreditationRef}\n\nEditorial Citation:\n"${award.citation}"`,
      isHighlight: idx === 0
    }
  ]);

  return {
    meta: {
      docRef: `PAA/AWARDS/COMPENDIUM/${new Date().getFullYear()}`,
      docType: 'Law Firm Honors & Accreditations',
      title: 'Law Firm Honors, Directory Accreditations & Benchmark Rankings',
      subtitle: 'Official Chambers Honors Compendium · Chambers Global, The Legal 500, IFLR1000 & LSK',
      dateGenerated: currentDate,
      category: 'Commercial Litigation, Arbitration, Corporate Finance & M&A',
      jurisdiction: 'Republic of Kenya, East African Community (EAC) & Commonwealth Jurisdiction',
      citation: `PAA Institutional Honors & Peer Review Digest Vol. ${new Date().getFullYear()}`
    },
    sections,
    statutoryBasis: [
      'Advocates Act (Cap 16, Laws of Kenya)',
      'Law Society of Kenya Act 2014',
      'Arbitration Act 1995 (Cap 49, Laws of Kenya)',
      'Evidence Act (Cap 80, Laws of Kenya)'
    ],
    firmDetails: {
      name: 'Petersons Angwenyi & Associates Advocates',
      chambers: 'Upper Hill Chambers, 8th Floor, Mara Road, Nairobi',
      address: 'P.O. Box 48920-00100 GPO, Nairobi, Republic of Kenya',
      telephone: '+254 (0) 20 271 8840 / +254 (0) 722 000 000',
      email: 'litigation@paalawkenya.com',
      rollNumber: 'Senior Counsel Milton Angwenyi (Roll: P.105/7412/95)',
      lskRef: 'LSK Firm Certificate No. PAA-1998-NRB'
    }
  };
}

export function formatEastAfricaReachForPrint(locations: RegionalLocation[]): PrintDocument {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return {
    meta: {
      docRef: 'PAA/EAC/2026/REG-REACH',
      docType: 'East Africa Cross-Border Advisory Dossier',
      title: 'East African Cross-Border Advisory & Sovereign Project Concessions',
      subtitle: 'Regional Jurisdictional Footprint · EAC & COMESA Corridors',
      dateGenerated: currentDate,
      category: 'Cross-Border Advisory & Regional Chambers',
      jurisdiction: 'East African Community (EAC) & COMESA Member States',
      citation: 'PAA Regional Practice Compendium (2026 Edition)'
    },
    sections: [
      {
        heading: '1. EXECUTIVE SUMMARY & REGIONAL JURISDICTION',
        content: [
          'With principal headquarters at Upper Hill Nairobi and specialized regional circuits in Mombasa and Kisumu, Petersons Angwenyi & Associates Advocates maintains an apex cross-border practice covering Kenya, Uganda, Tanzania, Rwanda, Burundi, South Sudan, Ethiopia, and the Democratic Republic of Congo.',
          'Advocates of the firm represent sovereign ministries, multinational corporations, commercial banking syndicates, and concessionaires before the East African Court of Justice (EACJ, Arusha), the COMESA Court of Justice, the Nairobi Centre for International Arbitration (NCIA), and international arbitral tribunals in London and Dubai.'
        ]
      },
      {
        heading: '2. REGIONAL OFFICES & STRATEGIC PROJECT HUBS',
        content: locations.map(loc => 
          `• ${loc.name.toUpperCase()} (${loc.country}): ${loc.title}\n  Scope: ${loc.description}\n  Exposure / Value: ${loc.valueKes} (${loc.valueUsd}) | Status: ${loc.status}\n  Governing Forum: ${loc.tribunalOrForum}\n  Lead Counsel: ${loc.leadCounsel}`
        )
      },
      {
        heading: '3. CORE STATUTORY CODES & MULTILATERAL TREATIES',
        content: [
          'All cross-border transactional advisory, sovereign guarantees, and trans-boundary disputes are governed under the Treaty for the Establishment of the East African Community (EAC), the COMESA Treaty, the New York Convention on the Recognition and Enforcement of Foreign Arbitral Awards (1958), and Kenya\'s Advocates Remuneration Order.'
        ]
      }
    ],
    statutoryBasis: [
      'Treaty for the Establishment of the East African Community (EAC)',
      'COMESA Treaty & Common Market Protocols',
      'New York Convention on the Recognition and Enforcement of Foreign Arbitral Awards (1958)',
      'Kenya Evidence Act (Cap 80) § 134 (Advocate-Client Privilege)',
      'Advocates Act (Cap 16, Laws of Kenya)'
    ],
    firmDetails: {
      name: 'Petersons Angwenyi & Associates Advocates',
      chambers: 'Upper Hill Chambers, 8th Floor, Mara Road, Nairobi',
      address: 'P.O. Box 48920-00100 GPO, Nairobi, Republic of Kenya',
      telephone: '+254 (0) 20 271 8840 / +254 (0) 722 000 000',
      email: 'litigation@paalawkenya.com',
      rollNumber: 'Senior Counsel Milton Angwenyi (Roll: P.105/7412/95)',
      lskRef: 'LSK Firm Certificate No. PAA-1998-NRB'
    }
  };
}

export function downloadOfflineTextCopy(doc: PrintDocument): void {
  const content = `================================================================================
${doc.firmDetails.name.toUpperCase()}
${doc.firmDetails.chambers.toUpperCase()}
${doc.firmDetails.address}
Tel: ${doc.firmDetails.telephone} | Email: ${doc.firmDetails.email}
${doc.firmDetails.lskRef}
================================================================================

DOCUMENT CLASSIFICATION: ${doc.meta.docType.toUpperCase()}
DOCUMENT REFERENCE:     ${doc.meta.docRef}
DATE OF GENERATION:     ${doc.meta.dateGenerated}
OFFICIAL CITATION:      ${doc.meta.citation}
JURISDICTION:           ${doc.meta.jurisdiction}

--------------------------------------------------------------------------------
TITLE: ${doc.meta.title.toUpperCase()}
SUBTITLE: ${doc.meta.subtitle}
CATEGORY: ${doc.meta.category}
--------------------------------------------------------------------------------

${doc.sections.map(s => {
  const headingStr = s.heading ? `\n--- ${s.heading} ---\n` : '';
  const bodyStr = Array.isArray(s.content) ? s.content.join('\n\n') : s.content;
  return `${headingStr}${bodyStr}\n`;
}).join('\n')}

================================================================================
STATUTORY ACTS & REGULATORY AUTHORITIES:
${(doc.statutoryBasis || []).map(b => `* ${b}`).join('\n')}

CERTIFICATION:
This document is a certified offline legal transcript prepared under the authority
of Petersons Angwenyi & Associates Advocates. It is protected by Section 134 of the
Evidence Act (Cap 80) and Kenyan copyright laws.

Authorized Chambers Signatory:
${doc.firmDetails.rollNumber}
Upper Hill Chambers, Nairobi, Kenya
================================================================================`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${doc.meta.docRef.replace(/\//g, '_')}_OFFLINE.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
