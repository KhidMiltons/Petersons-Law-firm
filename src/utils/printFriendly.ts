import { CaseBrief, LegalArticle } from '../data/firmData';

export interface PrintDocumentMetadata {
  docRef: string;
  docType: 'Judicial Precedent Briefing' | 'Law Review & Regulatory Insight';
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
