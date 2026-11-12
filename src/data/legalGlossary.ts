export type GlossaryCategory =
  | 'Property & Conveyancing'
  | 'Arbitration & Procedure'
  | 'Corporate & Insolvency';

export interface LegalGlossaryTerm {
  id: string;
  term: string;
  termSw: string;
  patterns: string[];
  category: GlossaryCategory;
  categorySw: string;
  statuteRef: string;
  definition: string;
  definitionSw: string;
}

export const LEGAL_GLOSSARY_TERMS: LegalGlossaryTerm[] = [
  {
    id: 'sectional-properties-act',
    term: 'Sectional Properties Act, 2020',
    termSw: 'Sheria ya Umiliki wa Sehemu (Sectional Properties Act, 2020)',
    patterns: [
      'Sectional Properties Act, 2020',
      'Sectional Properties Act 2020',
      'Sectional Properties Act',
    ],
    category: 'Property & Conveyancing',
    categorySw: 'Ardhi na Uhamishaji Milki',
    statuteRef: 'Act No. 21 of 2020 (Laws of Kenya)',
    definition:
      'Kenyan statute governing the division of buildings into individual units owned with separate sectional title deeds and shared ownership of common property through a body corporate.',
    definitionSw:
      'Sheria ya Kenya inayodhibiti ugawaji wa majengo katika sehemu binafsi zenye hatimiliki huru na umiliki wa pamoja wa maeneo ya jumuiya kupitia shirika la wamiliki.',
  },
  {
    id: 'ardhisasa',
    term: 'ArdhiSasa',
    termSw: 'Mfumo wa ArdhiSasa',
    patterns: ['ArdhiSasa'],
    category: 'Property & Conveyancing',
    categorySw: 'Ardhi na Uhamishaji Milki',
    statuteRef: 'Ministry of Lands & Physical Planning NLIMS',
    definition:
      'Kenya’s official digital National Land Information Management System (NLIMS) through which electronic title searches, sectional conversions, caveats, and land charges are processed.',
    definitionSw:
      'Mfumo rasmi wa kidijitali wa Usimamizi wa Taarifa za Ardhi nchini Kenya (NLIMS) unaotumika kwa uchunguzi wa hati, ubadilishaji wa hatimiliki, na usajili wa dhamana.',
  },
  {
    id: 'sub-leases',
    term: 'Long-Term Sub-Leases',
    termSw: 'Mikataba ya Ukodishaji wa Muda Mrefu (Sub-Leases)',
    patterns: ['long-term sub-leases', 'sub-leases', 'sub-lease'],
    category: 'Property & Conveyancing',
    categorySw: 'Ardhi na Uhamishaji Milki',
    statuteRef: 'Section 13, Sectional Properties Act 2020',
    definition:
      'Leasehold interests carved out of a head lease for apartments or commercial suites exceeding 21 years—now mandatorily convertible into standalone sectional title deeds under Kenyan law.',
    definitionSw:
      'Haki za ukodishaji zilizotolewa kutoka kwenye hati mama kwa zaidi ya miaka 21 ambazo sasa zinapaswa kubadilishwa kuwa hatimiliki za sehemu chini ya sheria za Kenya.',
  },
  {
    id: 'sectional-title-deeds',
    term: 'Sectional Title Deeds',
    termSw: 'Hatimiliki za Sehemu (Sectional Title Deeds)',
    patterns: ['sectional title deeds', 'sectional plans', 'sectional conversion'],
    category: 'Property & Conveyancing',
    categorySw: 'Ardhi na Uhamishaji Milki',
    statuteRef: 'Land Registration Act 2012 & Sectional Properties Act 2020',
    definition:
      'Geo-referenced Certificates of Title or Lease issued for an individual unit within a multi-storey or gated development, conferring independent bankability and transferability.',
    definitionSw:
      'Hati rasmi za umiliki zilizopimwa kwa mfumo wa kijiografia kwa ajili ya nyumba au ofisi moja ndani ya jengo kubwa, zikimwezesha mmiliki kukopa au kuuza kwa uhuru.',
  },
  {
    id: 'mother-titles',
    term: 'Mother Titles',
    termSw: 'Hatimiliki Mama (Mother Titles)',
    patterns: ['mother titles', 'mother title'],
    category: 'Property & Conveyancing',
    categorySw: 'Ardhi na Uhamishaji Milki',
    statuteRef: 'Land Registration Act, Section 30',
    definition:
      'The parent freehold or leasehold title covering an entire land parcel prior to subdivision or sectional plan registration; surrendered upon issuance of individual unit titles.',
    definitionSw:
      'Hati kuu ya awali inayofunika kipande chote cha ardhi kabla ya kugawanywa katika vipande au sehemu ndogo; hukabidhiwa msajili hati mpya zinapotolewa.',
  },
  {
    id: 'bank-charge-registration',
    term: 'Charge Registration',
    termSw: 'Usajili wa Dhamana ya Benki (Charge)',
    patterns: ['charge registration', 'holding charges', 'charges'],
    category: 'Property & Conveyancing',
    categorySw: 'Ardhi na Uhamishaji Milki',
    statuteRef: 'Part V, Land Act 2012 (Sections 78–104)',
    definition:
      'A statutory security interest registered against a land title in favor of a financial lender to secure repayment of credit facilities, granting statutory power of sale upon default.',
    definitionSw:
      'Usajili rasmi wa dhamana ya kisheria kwenye hatimiliki ya ardhi kwa niaba ya benki au mkopeshaji ili kulinda mkopo uliotolewa.',
  },
  {
    id: 'cadastral-georeferencing',
    term: 'Cadastral Georeferencing',
    termSw: 'Upimaji wa Kijiografia (Cadastral Georeferencing)',
    patterns: ['cadastral georeferencing', 'georeferencing surveys'],
    category: 'Property & Conveyancing',
    categorySw: 'Ardhi na Uhamishaji Milki',
    statuteRef: 'Survey Act (Cap 299) & Sectional Properties Regulations 2021',
    definition:
      'High-precision boundary surveying anchored to Kenya’s national geodetic coordinate network, required before the Director of Surveys authenticates sectional plans for registration.',
    definitionSw:
      'Upimaji wa kina wa mipaka unaounganishwa na mtandao wa kitaifa wa kuratibu za kijiografia kabla ya mipango ya sehemu kuidhinishwa.',
  },
  {
    id: 'judicial-deference',
    term: 'Judicial Deference',
    termSw: 'Heshima ya Mahakama kwa Mabaraza ya Usuluhishi',
    patterns: ['judicial deference'],
    category: 'Arbitration & Procedure',
    categorySw: 'Usuluhishi na Taratibu za Mahakama',
    statuteRef: 'Article 159(2)(c), Constitution of Kenya & Sec. 10 Arbitration Act',
    definition:
      'The constitutional and statutory doctrine limiting court intervention in arbitral proceedings so that consensual tribunal findings remain final and insulated from merits-based appeals.',
    definitionSw:
      'Kanuni ya kikatiba inayozuia mahakama kuingilia maamuzi ya mabaraza ya usuluhishi ili kuhakikisha uthabiti na uharaka wa usuluhishi.',
  },
  {
    id: 'arbitral-awards',
    term: 'Arbitral Awards',
    termSw: 'Tuzo / Maamuzi ya Usuluhishi',
    patterns: ['arbitral awards', 'arbitral award'],
    category: 'Arbitration & Procedure',
    categorySw: 'Usuluhishi na Taratibu za Mahakama',
    statuteRef: 'Sections 32A & 36, Arbitration Act 1995; New York Convention 1958',
    definition:
      'Final, binding determinations rendered by an arbitral tribunal that carry the same legal enforceability as a High Court decree once recognized by a competent court.',
    definitionSw:
      'Uamuzi wa mwisho unaotolewa na baraza la usuluhishi ambao una nguvu sawa ya kisheria na hukumu ya Mahakama Kuu baada ya kutambuliwa.',
  },
  {
    id: 'public-policy',
    term: 'Public Policy Defense',
    termSw: 'Utetezi wa Sera ya Umma (Public Policy)',
    patterns: ['public policy'],
    category: 'Arbitration & Procedure',
    categorySw: 'Usuluhishi na Taratibu za Mahakama',
    statuteRef: 'Section 35(2)(b)(ii), Arbitration Act 1995 (Christ for All Nations)',
    definition:
      'A strictly narrow statutory ground allowing the High Court to vacate an arbitral award only if it offends Kenya’s fundamental morality, justice, or constitutional order.',
    definitionSw:
      'Sababu finyu ya kisheria inayoruhusu Mahakama Kuu kufuta tuzo ya usuluhishi endapo tu inakiuka misingi mikuu ya haki, maadili, au Katiba ya Kenya.',
  },
  {
    id: 'setting-aside-applications',
    term: 'Setting-Aside Applications',
    termSw: 'Maombi ya Kufuta Tuzo ya Usuluhishi',
    patterns: ['setting-aside applications', 'setting aside'],
    category: 'Arbitration & Procedure',
    categorySw: 'Usuluhishi na Taratibu za Mahakama',
    statuteRef: 'Section 35, Arbitration Act 1995',
    definition:
      'Time-bound High Court motions filed within 90 days of an award seeking annulment solely on jurisdictional, procedural fairness, or public-policy grounds rather than factual error.',
    definitionSw:
      'Maombi maalum katika Mahakama Kuu yanayowasilishwa ndani ya siku 90 ili kubatilisha uamuzi wa usuluhishi kwa misingi ya mamlaka au taratibu za haki.',
  },
  {
    id: 'ncia-lcia',
    term: 'NCIA & LCIA Rules',
    termSw: 'Kanuni za Usuluhishi za NCIA na LCIA',
    patterns: [
      'Nairobi Centre for International Arbitration (NCIA)',
      'NCIA',
      'LCIA',
    ],
    category: 'Arbitration & Procedure',
    categorySw: 'Usuluhishi na Taratibu za Mahakama',
    statuteRef: 'Nairobi Centre for Int’l Arbitration Act 2013',
    definition:
      'Institutional procedural rules administered respectively by the Nairobi Centre for International Arbitration and the London Court of International Arbitration for cross-border commercial disputes.',
    definitionSw:
      'Kanuni rasmi za kiutaratibu zinazosimamiwa na Kituo cha Usuluhishi cha Kimataifa cha Nairobi (NCIA) na Mahakama ya Usuluhishi ya London (LCIA).',
  },
  {
    id: 'seat-designations',
    term: 'Seat Designations',
    termSw: 'Uteuzi wa Kiti cha Kisheria cha Usuluhishi',
    patterns: ['seat designations', 'seat designation'],
    category: 'Arbitration & Procedure',
    categorySw: 'Usuluhishi na Taratibu za Mahakama',
    statuteRef: 'Section 21, Arbitration Act 1995',
    definition:
      'The contractual choice of the juridical home (lex arbitri) of an arbitration, which determines which national courts hold supervisory jurisdiction and the award’s nationality under the New York Convention.',
    definitionSw:
      'Uchaguzi wa kimkataba wa mamlaka ya kisheria ya usuluhishi ambao huamua ni mahakama gani zina mamlaka ya usimamizi juu ya shauri hilo.',
  },
  {
    id: 'wrongful-trading',
    term: 'Wrongful Trading',
    termSw: 'Biashara Isiyo Halali Wakati wa Ufilisi (Wrongful Trading)',
    patterns: ['wrongful trading liabilities', 'wrongful trading'],
    category: 'Corporate & Insolvency',
    categorySw: 'Mashirika na Ufilisi',
    statuteRef: 'Section 505, Insolvency Act 2015',
    definition:
      'Personal civil liability imposed on company directors who allow an enterprise to continue incurring credit after they knew or ought to have known insolvent liquidation was unavoidable.',
    definitionSw:
      'Uwajibikaji binafsi wa wakurugenzi wanaoendelea kuingiza kampuni kwenye madeni wakati wakijua au wakipaswa kujua kufilisika hakuepukiki.',
  },
  {
    id: 'administration-moratoria',
    term: 'Administration Moratoria',
    termSw: 'Kinga ya Muda ya Usimamizi wa Kampuni (Moratorium)',
    patterns: ['administration moratoria', 'administration procedures'],
    category: 'Corporate & Insolvency',
    categorySw: 'Mashirika na Ufilisi',
    statuteRef: 'Sections 558–562, Insolvency Act 2015',
    definition:
      'An automatic statutory freeze shielding a distressed company under court-appointed or out-of-court administration from creditor lawsuits, enforcement, or asset seizure while restructuring proceeds.',
    definitionSw:
      'Kuzuia kwa muda hatua za kisheria na ukamataji wa mali dhidi ya kampuni iliyo chini ya usimamizi maalum ili kuipa nafasi ya kufufuka kibiashara.',
  },
  {
    id: 'fiduciary-duties',
    term: 'Statutory Fiduciary Duties',
    termSw: 'Wajibu wa Uaminifu wa Kisheria (Fiduciary Duties)',
    patterns: ['statutory fiduciary duties', 'fiduciary duties'],
    category: 'Corporate & Insolvency',
    categorySw: 'Mashirika na Ufilisi',
    statuteRef: 'Sections 142–147, Companies Act 2015',
    definition:
      'Strict legal obligations requiring corporate directors to act within their powers, promote company success, exercise independent judgment, and avoid conflicts of interest.',
    definitionSw:
      'Majukumu mazito ya kisheria yanayowataka wakurugenzi kutenda kwa nia njema, kuepuka migongano ya kimaslahi, na kulinda ustawi wa kampuni.',
  },
  {
    id: 'creditor-pool',
    term: 'Collective Creditor Pool',
    termSw: 'Maslahi ya Pamoja ya Wadai (Creditor Pool)',
    patterns: ['collective creditor pool', 'insolvency'],
    category: 'Corporate & Insolvency',
    categorySw: 'Mashirika na Ufilisi',
    statuteRef: 'Companies Act 2015 & Insolvency Act 2015 (Sequana Principle)',
    definition:
      'Once a company becomes insolvent or borders insolvency, directors’ duties shift from maximizing shareholder returns toward preserving remaining assets equitably for all creditors.',
    definitionSw:
      'Kampuni inapokaribia ufilisi, wajibu wa wakurugenzi hubadilika kutoka kutafuta faida ya wanahisa pekee na kulinda mali kwa usawa kwa wadai wote.',
  },
  {
    id: 'going-concerns',
    term: 'Going Concerns',
    termSw: 'Biashara Endelevu (Going Concern)',
    patterns: ['going concerns', 'going concern'],
    category: 'Corporate & Insolvency',
    categorySw: 'Mashirika na Ufilisi',
    statuteRef: 'Section 522, Insolvency Act 2015',
    definition:
      'Rescuing an operational business as a functioning, revenue-generating enterprise rather than breaking it up for piece-meal liquidation—the primary statutory objective of administration.',
    definitionSw:
      'Kuokoa biashara iendelee kufanya kazi na kuzalisha mapato badala ya kuifunga na kuuza mali zake vipande vipande.',
  },
  {
    id: 'liquidation',
    term: 'Liquidation',
    termSw: 'Ufilisi wa Kufunga Kampuni (Liquidation)',
    patterns: ['liquidation'],
    category: 'Corporate & Insolvency',
    categorySw: 'Mashirika na Ufilisi',
    statuteRef: 'Part VI, Insolvency Act 2015',
    definition:
      'The formal winding-up procedure wherein a licensed insolvency practitioner realizes a company’s remaining assets, distributes proceeds in statutory priority, and dissolves the entity.',
    definitionSw:
      'Mchakato rasmi wa kufunga kampuni ambapo mali zote zinauzwa, madeni yanalipwa kwa mpangilio wa kisheria, na kampuni inafutwa kwenye daftari.',
  },
  {
    id: 'dividend-declarations',
    term: 'Dividend Declarations',
    termSw: 'Uidhinishaji wa Gawio (Dividends)',
    patterns: ['dividend declarations', 'asset disposals'],
    category: 'Corporate & Insolvency',
    categorySw: 'Mashirika na Ufilisi',
    statuteRef: 'Sections 486–491, Companies Act 2015',
    definition:
      'Board or shareholder resolutions distributing realized distributable profits; unlawful if declared without verified accumulated profits or when capital maintenance solvency fails.',
    definitionSw:
      'Maamuzi ya bodi kugawa faida kwa wanahisa ambayo ni batili kisheria endapo kampuni haina faida halisi au inakaribia kushindwa kulipa madeni.',
  },
];

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface GlossaryTextSegment {
  text: string;
  term: LegalGlossaryTerm | null;
}

/**
 * Splits prose into plain text and matched glossary term segments.
 * Matches longest patterns first with boundary checks so nested words do not collide.
 */
export function segmentTextWithGlossary(text: string): GlossaryTextSegment[] {
  if (!text) return [];

  const patternEntries: Array<{ pattern: string; term: LegalGlossaryTerm }> = [];
  for (const term of LEGAL_GLOSSARY_TERMS) {
    for (const pattern of term.patterns) {
      patternEntries.push({ pattern, term });
    }
  }

  // Match longer phrases first to avoid partial substring shadowing
  patternEntries.sort((a, b) => b.pattern.length - a.pattern.length);

  const patternLookup = new Map<string, LegalGlossaryTerm>();
  for (const entry of patternEntries) {
    patternLookup.set(entry.pattern.toLowerCase(), entry.term);
  }

  const alternation = patternEntries.map((e) => escapeRegex(e.pattern)).join('|');
  const matcher = new RegExp(`\\b(${alternation})(?=\\b|[^A-Za-z0-9])`, 'gi');

  const segments: GlossaryTextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(text)) !== null) {
    const matchedText = match[0];
    const startIdx = match.index;
    const matchedTerm = patternLookup.get(matchedText.toLowerCase());
    if (!matchedTerm) continue;

    if (startIdx > lastIndex) {
      segments.push({ text: text.slice(lastIndex, startIdx), term: null });
    }
    segments.push({ text: matchedText, term: matchedTerm });
    lastIndex = startIdx + matchedText.length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), term: null });
  }

  return segments;
}

export function extractGlossaryTermsFromTexts(texts: string[]): LegalGlossaryTerm[] {
  const seen = new Set<string>();
  const ordered: LegalGlossaryTerm[] = [];

  for (const chunk of texts) {
    const segments = segmentTextWithGlossary(chunk);
    for (const seg of segments) {
      if (seg.term && !seen.has(seg.term.id)) {
        seen.add(seg.term.id);
        ordered.push(seg.term);
      }
    }
  }

  return ordered;
}
