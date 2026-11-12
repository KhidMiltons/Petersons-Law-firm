import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Search,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  Scale,
  Landmark,
  Briefcase,
  Gavel,
  Layers,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type FAQCategory = 'general' | 'corporate' | 'litigation' | 'property';
export type FAQTabFilter = 'all' | FAQCategory;

export interface FAQItem {
  id: string;
  category: FAQCategory;
  questionEn: string;
  questionSw: string;
  answerEn: string;
  answerSw: string;
  statutes: string[];
  actionLabelEn?: string;
  actionLabelSw?: string;
}

export const FAQS_DATA: FAQItem[] = [
  {
    id: 'advocate-privilege',
    category: 'general',
    questionEn: 'How are confidential disclosures and proprietary corporate documents protected during preliminary consultations?',
    questionSw: 'Je, taarifa za siri na nyaraka za kibiashara zinalindwa vipi wakati wa mashauriano ya awali?',
    answerEn: 'Under Section 134 of the Evidence Act (Cap 80), all oral disclosures, draft contracts, financial models, and communications made by a prospective client to an Advocate of the High Court of Kenya are cloaked with statutory Advocate-Client Privilege. No court, tribunal, or law enforcement agency in the Republic of Kenya can compel disclosure of privileged communications without the client\'s explicit written waiver. Furthermore, chambers enforces ISO-standard confidentiality protocols and encrypted docket vaults in full adherence to the Kenya Data Protection Act 2019.',
    answerSw: 'Chini ya Kifungu cha 134 cha Sheria ya Ushahidi (Sura ya 80), taarifa zote za siri, mikataba, na maelezo anayopewa Wakili wa Mahakama Kuu ya Kenya yanalindwa na Usiri wa Kisheria wa Wakili na Mteja. Hakuna mahakama au chombo chochote cha serikali kinachoweza kulazimisha kutoa siri hizo bila idhini ya mteja. Zaidi ya hayo, ofisi zetu hufuata mifumo salama ya kidijitali kulingana na Sheria ya Kulinda Data ya 2019.',
    statutes: ['Section 134 Evidence Act (Cap 80)', 'Data Protection Act 2019', 'LSK Code of Conduct'],
    actionLabelEn: 'Book Privileged Assessment',
    actionLabelSw: 'Panga Tathmini ya Faragha',
  },
  {
    id: 'conflict-of-interest',
    category: 'general',
    questionEn: 'What is chambers\' protocol for clearing potential conflicts of interest before accepting a corporate brief?',
    questionSw: 'Je, ni utaratibu gani unaotumika kuchunguza mgongano wa kimaslahi kabla ya kupokea kesi au maagizo?',
    answerEn: 'Prior to reviewing adverse facts or accepting formal retainers, chambers Duty Registrar executes an algorithmic conflict clearance against our master docket of past and active clients, commercial banks, adverse boards, and state corporations. In strict accordance with the Law Society of Kenya (LSK) Code of Standards of Professional Practice, our advocates cannot act against a party where confidential information acquired during prior representation could be prejudiced. If an irreconcilable conflict is identified, we provide written notification immediately and decline representation.',
    answerSw: 'Kabla ya kupokea maagizo au kusoma ushahidi, Karani Mkuu wa masjala yetu hufanya uchunguzi rasmi kwenye daftari letu la kesi za zamani na zilizopo ili kuhakikisha hakuna mgongano wa kimaslahi. Chini ya Kanuni za Chama cha Wanasheria Kenya (LSK), hatuwezi kumwakilisha mteja iwapo kuna mgongano na mteja mwingine wa ofisi yetu. Iwapo kuna mgongano, tunatoa taarifa rasmi mara moja bila kupoteza muda.',
    statutes: ['LSK Code of Ethics 2016', 'Advocates Act (Cap 16)'],
    actionLabelEn: 'Initiate Conflict Screening',
    actionLabelSw: 'Anzisha Ukaguzi wa Mgongano',
  },
  {
    id: 'aro-fee-scale',
    category: 'general',
    questionEn: 'How are legal fees structured, and does Kenyan law permit fee negotiation below statutory guidelines?',
    questionSw: 'Je, ada za kisheria zinapangwa vipi, na je, sheria ya Kenya inaruhusu kutoza chini ya viwango rasmi vya serikali?',
    answerEn: 'Legal remuneration in Kenya is strictly governed by the Advocates (Remuneration) Order (ARO) promulgated under the Advocates Act. The ARO prescribes mandatory baseline fees for conveyancing, company formation, perfection of bank securities, and High Court commercial litigation based on the monetary value of the transaction or dispute (ad valorem scale). Under Section 36 of the Advocates Act, "undercutting" (charging below the statutory minimum) constitutes professional misconduct. For complex advisory and institutional retainers, chambers provides transparent, itemized fixed-retainer agreements with escrow reconciliation through tier-one commercial banks.',
    answerSw: 'Malipo ya mawakili nchini Kenya yanasimamiwa madhubuti na Mwongozo Rasmi wa Malipo ya Mawakili (ARO) chini ya Sheria ya Mawakili. Mwongozo huo unaweka viwango vya chini vya ada za ardhi, usajili wa makampuni, na kesi mahakamani kulingana na thamani ya mali au madai. Kutoza chini ya viwango hivyo kisheria ni kosa la kinidhamu. Hata hivyo, kwa ushauri wa kudumu wa mashirika, ofisi zetu huweka mikataba ya wazi yenye makadirio yaliyopangwa vizuri kupitia akaunti za amana za benki kuu.',
    statutes: ['Advocates (Remuneration) Order', 'Section 36 Advocates Act', 'LSK Remuneration Committee'],
    actionLabelEn: 'Calculate Statutory Fee Estimate',
    actionLabelSw: 'Kokotoa Makadirio ya Ada Rasmi',
  },
  {
    id: 'foreign-subsidiary',
    category: 'corporate',
    questionEn: 'What is the legal procedure and timeline for establishing a foreign-owned corporate subsidiary or branch office in Kenya?',
    questionSw: 'Je, ni utaratibu gani wa kisheria na muda unaohitajika kuanzisha tawi au kampuni tanzu ya kigeni nchini Kenya?',
    answerEn: 'Foreign corporations can register either a wholly-owned private limited subsidiary or a registered branch of a foreign company under Part XXX of the Companies Act 2015. Registration involves obtaining an eCitizen Business Registration Service (BRS) name reservation, drafting Articles of Association conforming to Kenyan statutory templates, filing Form CR1, CR2, CR8 (registered office in Kenya), and declaring ultimate beneficial owners under the Companies (Beneficial Ownership Information) Regulations 2020. Our chambers typically completes full statutory incorporation, KRA PIN issuance, and initial regulatory approvals within 5 to 7 business days.',
    answerSw: 'Mashirika ya kigeni yanaweza kusajili kampuni tanzu inayomilikiwa kikamilifu au tawi lililosajiliwa la kampuni ya kigeni chini ya Sehemu ya XXX ya Sheria ya Makampuni ya 2015. Usajili unajumuisha kuhifadhi jina kupitia mfumo wa BRS kwenye eCitizen, kuandaa Katiba ya Kampuni, kujaza Fomu CR1, CR2, CR8 (ofisi rasmi nchini Kenya), na kutangaza wamiliki halisi. Ofisi zetu hukamilisha usajili mzima wa kisheria, nambari ya ushuru ya KRA, na vibali vya awali ndani ya siku 5 hadi 7 za kazi.',
    statutes: ['Companies Act 2015', 'BRS Act 2015', 'Investment Promotion Act'],
    actionLabelEn: 'Inquire on Corporate Incorporation',
    actionLabelSw: 'Ulizia Usajili wa Kampuni',
  },
  {
    id: 'beneficial-ownership',
    category: 'corporate',
    questionEn: 'How does Kenya enforce the declaration of Ultimate Beneficial Owners (UBO), and what are the penalties for non-disclosure?',
    questionSw: 'Je, Kenya inasimamia vipi utangazaji wa Wamiliki Halisi wa Makampuni (UBO), na ni adhabu gani zilizowekwa kwa kutotii?',
    answerEn: 'Under Section 93A of the Companies Act 2015 and the Companies (Beneficial Ownership Information) Regulations 2020, every company incorporated in Kenya must maintain an accurate Register of Beneficial Owners and lodge a copy with the Registrar of Companies. A beneficial owner is an individual who directly or indirectly holds at least 10% of shares, controls 10% of voting rights, or exercises significant managerial control. Non-compliance exposes the company and every officer in default to a statutory fine of up to KES 500,000, continuing daily penalties, and risk of deregistration. Chambers conducts comprehensive compliance audits to safeguard directors against statutory exposure.',
    answerSw: 'Chini ya Kifungu cha 93A cha Sheria ya Makampuni ya 2015 na Kanuni za Umiliki Halisi za 2020, kila kampuni iliyosajiliwa nchini Kenya lazima iwe na Daftari sahihi la Wamiliki Halisi na kuwasilisha nakala kwa Msajili wa Makampuni. Mmiliki halisi ni mtu yeyote anayemiliki angalau asilimia 10 ya hisa, kura, au mwenye udhibiti mkubwa. Kutotii huleta faini ya hadi KES 500,000 kwa wakurugenzi na hatari ya kufutiwa usajili. Ofisi zetu hufanya ukaguzi wa kina wa kisheria kulinda uongozi wa kampuni.',
    statutes: ['Section 93A Companies Act', 'POCAMLA Cap 59B', 'BRS Regulations 2020'],
    actionLabelEn: 'Audit Beneficial Ownership Register',
    actionLabelSw: 'Kagua Daftari la Wamiliki Halisi',
  },
  {
    id: 'cak-merger-clearance',
    category: 'corporate',
    questionEn: 'When do cross-border M&A transactions or joint ventures require mandatory Competition Authority of Kenya (CAK) notification?',
    questionSw: 'Ni lini muungano wa makampuni (M&A) au ubia wa kibiashara unahitaji idhini ya lazima kutoka Mamlaka ya Ushindani Kenya (CAK)?',
    answerEn: 'Under the Competition Act (Cap 504) and the Competition (General) Rules 2019, any merger or acquisition resulting in a change of control where the combined turnover or assets of the acquirer and target in Kenya meet statutory thresholds (currently KES 1 billion for full notification, or KES 500 million–1 billion for exclusion applications) requires prior written clearance from CAK—and, for regional EAC/COMESA deals, parallel COMESA Competition Commission filing. Implementing a notifiable merger without CAK approval renders the transaction void and attracts administrative penalties of up to 10% of preceding year gross annual turnover.',
    answerSw: 'Chini ya Sheria ya Ushindani (Sura ya 504) na Kanuni za Ushindani za 2019, muungano au ununuzi wowote wa kampuni unaobadilisha udhibiti na kufikia viwango vya mapato au mali vya KES bilioni 1 nchini Kenya lazima upate kibali cha maandishi kutoka CAK kabla ya kukamilishwa. Kutekeleza muungano bila idhini hiyo hubatilisha mkataba na huleta faini ya hadi asilimia 10 ya mapato ya mwaka uliopita.',
    statutes: ['Competition Act (Cap 504)', 'Competition (General) Rules 2019', 'COMESA Competition Regulations'],
    actionLabelEn: 'Request Merger Threshold Review',
    actionLabelSw: 'Omba Tathmini ya Kibali cha CAK',
  },
  {
    id: 'commercial-litigation-vs-ncia',
    category: 'litigation',
    questionEn: 'When should a commercial agreement specify arbitration under the Nairobi Centre for International Arbitration (NCIA) instead of High Court litigation?',
    questionSw: 'Ni wakati gani mkataba wa kibiashara unapaswa kuelekeza usuluhishi wa NCIA badala ya kesi ya Mahakama Kuu?',
    answerEn: 'While the Milimani Commercial & Tax High Court benches possess specialized adjudicative competence, arbitration under the NCIA offers distinct commercial advantages: strict private confidentiality without public cause lists, party autonomy in selecting specialist arbitrators with deep sector expertise (e.g. cross-border energy, banking, fintech), procedural speed, and worldwide award enforceability across 170+ member states under the 1958 New York Convention. Our Senior Counsel routinely draft multi-tiered NCIA dispute clauses and serve as lead arbitral counsel in both domestic and international tribunals.',
    answerSw: 'Ijapokuwa Mahakama ya Kibiashara ya Milimani ina weledi mkubwa, usuluhishi wa NCIA unatoa faida kubwa za kibiashara: usiri kamili bila majalada kuwekwa hadharani, uhuru wa kuchagua msuluhishi mwenye ujuzi maalum wa sekta husika (kama vile nishati, benki, au teknolojia), na uwezo wa kutekeleza tuzo ya usuluhishi katika nchi zaidi ya 170 duniani chini ya Mkataba wa New York wa 1958. Mawakili wetu huongoza usuluhishi huo kwa umahiri mkubwa.',
    statutes: ['NCIA Act No. 26 of 2013', 'Arbitration Act 1995', 'New York Convention 1958'],
    actionLabelEn: 'Draft NCIA Dispute Clause',
    actionLabelSw: 'Andaa Kifungu cha Usuluhishi cha NCIA',
  },
  {
    id: 'emergency-injunctions',
    category: 'litigation',
    questionEn: 'In an urgent dispute involving imminent asset dissipation or illegal bank guarantee calls, how swiftly can chambers obtain an injunction?',
    questionSw: 'Kwenye mzozo wa dharura unaotishia mali kuuzwa au dhamana ya benki kutekelezwa, ofisi zenu huchukua muda gani kupata zuio la mahakama?',
    answerEn: 'For urgent commercial matters involving immediate distress of assets, hostile takeover moves, or wrongful realization of charged securities, chambers operates a 24/7 Rapid Injunction Desk. Our counsel draft Certificates of Urgency and substantive Chamber Summons under Order 40 of the Civil Procedure Rules, file instantaneously via the Judiciary Case Tracking System (CTS), and appear before the Duty Judge at the Milimani High Court within 2 to 4 hours to secure ex-parte preservative orders and maintain the commercial status quo.',
    answerSw: 'Katika masuala ya dharura yanayotishia uuzaji wa mali kinyume cha sheria au uvunjaji wa mikataba, ofisi zetu zina kitengo maalum cha dharura kinachofanya kazi saa 24/7. Mawakili wetu huandaa nyaraka za dharura chini ya Amri ya 40 ya Kanuni za Mahakama, kuwasilisha mara moja kupitia mfumo wa kielektroniki wa CTS, na kufika mbele ya Jaji wa Zamu wa Mahakama Kuu ya Milimani ndani ya saa 2 hadi 4 ili kupata amri ya muda ya kulinda mali.',
    statutes: ['Order 40 Civil Procedure Rules', 'Judiciary CTS Rules', 'High Court Practice Directions'],
    actionLabelEn: 'Request Emergency Injunction Assistance',
    actionLabelSw: 'Omba Msaada wa Amri ya Dharura',
  },
  {
    id: 'ardhisasa-conveyancing',
    category: 'property',
    questionEn: 'How does Kenya\'s ArdhiSasa digital platform affect commercial land transactions, sectional title conversions, and bank charges?',
    questionSw: 'Je, mfumo wa kidijitali wa ArdhiSasa unaathiri vipi ununuzi wa ardhi za biashara, ubadilishaji wa hatimiliki za ghorofa, na mikopo ya benki?',
    answerEn: 'The Ministry of Lands\' ArdhiSasa platform has fully digitized property searches, transfer applications, Land Control Board (LCB) consents, valuation requests, and stamp duty assessments for properties in Nairobi County. For commercial investors, chambers conducts comprehensive due diligence including physical ground beacon inspections, registry folio verifications, and sectional property conversions under the Sectional Properties Act 2020. Our conveyancing team interfaces daily with the ArdhiSasa digital portal, reducing standard transaction closing time from months to an average of 14 to 21 business days.',
    answerSw: 'Mfumo wa ArdhiSasa wa Wizara ya Ardhi umebadilisha utafutaji wa hatimiliki, vibali vya bodi ya ardhi (LCB), tathmini za kodi ya stempu, na usajili wa uhamishaji jijini Nairobi kuwa wa kidijitali. Timu yetu ya wataalamu wa ardhi hufanya ukaguzi wa kina wa mipaka ya ardhi, uchunguzi wa daftari la ardhi, na ubadilishaji wa hatimiliki za orofa chini ya Sheria ya Majengo ya Sehemu ya 2020, na kupunguza muda wa kukamilisha ununuzi kuwa siku 14 hadi 21.',
    statutes: ['Sectional Properties Act 2020', 'Land Registration Act 2012', 'Land Act 2012'],
    actionLabelEn: 'Consult on Conveyancing Brief',
    actionLabelSw: 'Shauriana Kuhusu Hatimiliki ya Ardhi',
  },
  {
    id: 'commercial-lease-registration',
    category: 'property',
    questionEn: 'Why must commercial leases exceeding two years be registered, and what are the stamp duty implications for corporate tenants?',
    questionSw: 'Kwa nini mikataba ya ukodishaji wa kibiashara inayozidi miaka miwili lazima isajiliwe, na ina athari gani za kodi ya stempu?',
    answerEn: 'Under Section 43 and Section 54 of the Land Registration Act 2012, any lease for a term exceeding two years—or containing an option to renew beyond two years—must be formally registered in the Land Registry to confer a legal leasehold estate enforceable against third parties and subsequent mortgagees. Unregistered long-term leases operate merely as equitable contracts for lease. Registration requires prior payment of ad valorem Stamp Duty (1% of annual rent for leases of 1–3 years, and 2% for terms exceeding 3 years) assessed via ArdhiSasa / KRA iTax alongside Land Rent and Rates clearance certificates.',
    answerSw: 'Chini ya Vifungu vya 43 na 54 vya Sheria ya Usajili wa Ardhi ya 2012, mkataba wowote wa upangaji wa kibiashara unaozidi miaka miwili lazima usajiliwe rasmi katika Masjala ya Ardhi ili kulinda haki za mpangaji kisheria dhidi ya wahusika wengine. Usajili huhitaji malipo ya awali ya Ushuru wa Stempu (asilimia 1 kwa miaka 1–3, na asilimia 2 kwa muda unaozidi miaka 3) kupitia ArdhiSasa na KRA iTax.',
    statutes: ['Land Registration Act 2012', 'Stamp Duty Act (Cap 480)', 'Landlord & Tenant (Shops, Hotels) Act'],
    actionLabelEn: 'Review Commercial Lease Instrument',
    actionLabelSw: 'Kagua Mkataba wa Upangaji Kibiashara',
  },
];

interface FAQProps {
  onOpenConsultation: (practice?: string, estimate?: string, advocate?: string) => void;
  focusedFaqId?: string | null;
}

export const FAQ: React.FC<FAQProps> = ({ onOpenConsultation, focusedFaqId }) => {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<FAQTabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('advocate-privilege');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (focusedFaqId) {
      setOpenFaqId(focusedFaqId);
      setActiveCategory('all');
      setSearchQuery('');
    }
  }, [focusedFaqId]);

  const categoryCounts = useMemo(() => {
    const counts: Record<FAQTabFilter, number> = {
      all: FAQS_DATA.length,
      general: 0,
      corporate: 0,
      litigation: 0,
      property: 0,
    };
    for (const item of FAQS_DATA) {
      counts[item.category] += 1;
    }
    return counts;
  }, []);

  const tabs: Array<{
    id: FAQTabFilter;
    label: string;
    subtitleEn: string;
    subtitleSw: string;
    icon: React.ReactNode;
    count: number;
  }> = useMemo(
    () => [
      {
        id: 'all',
        label: t('faq.filterAll'),
        subtitleEn: 'Full Statutory Index',
        subtitleSw: 'Faharasa Yote',
        icon: <Layers className="w-3.5 h-3.5" />,
        count: categoryCounts.all,
      },
      {
        id: 'general',
        label: t('faq.filterGeneral'),
        subtitleEn: 'Privilege, Conflicts & ARO Fees',
        subtitleSw: 'Usiri, Migongano & Ada',
        icon: <HelpCircle className="w-3.5 h-3.5" />,
        count: categoryCounts.general,
      },
      {
        id: 'corporate',
        label: t('faq.filterCorporate'),
        subtitleEn: 'Incorporation, UBO & M&A',
        subtitleSw: 'Usajili, UBO & Miungano',
        icon: <Briefcase className="w-3.5 h-3.5" />,
        count: categoryCounts.corporate,
      },
      {
        id: 'litigation',
        label: t('faq.filterLitigation'),
        subtitleEn: 'High Court & NCIA Arbitration',
        subtitleSw: 'Mahakama Kuu & Usuluhishi',
        icon: <Gavel className="w-3.5 h-3.5" />,
        count: categoryCounts.litigation,
      },
      {
        id: 'property',
        label: t('faq.filterProperty'),
        subtitleEn: 'ArdhiSasa & Commercial Leases',
        subtitleSw: 'ArdhiSasa & Hatimiliki',
        icon: <Landmark className="w-3.5 h-3.5" />,
        count: categoryCounts.property,
      },
    ],
    [t, categoryCounts]
  );

  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter((faq) => {
      const categoryMatch = activeCategory === 'all' || faq.category === activeCategory;
      if (!categoryMatch) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const question = (language === 'sw' ? faq.questionSw : faq.questionEn).toLowerCase();
      const answer = (language === 'sw' ? faq.answerSw : faq.answerEn).toLowerCase();
      const statutes = faq.statutes.join(' ').toLowerCase();
      return question.includes(q) || answer.includes(q) || statutes.includes(q);
    });
  }, [activeCategory, searchQuery, language]);

  const handleSelectCategory = (category: FAQTabFilter) => {
    setActiveCategory(category);
    const matching = FAQS_DATA.filter((f) => category === 'all' || f.category === category);
    if (matching.length > 0 && !matching.some((f) => f.id === openFaqId)) {
      setOpenFaqId(matching[0].id);
    } else if (matching.length === 0) {
      setOpenFaqId(null);
    }
  };

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (index + 1) % tabs.length;
      tabRefs.current[next]?.focus();
      handleSelectCategory(tabs[next].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (index - 1 + tabs.length) % tabs.length;
      tabRefs.current[prev]?.focus();
      handleSelectCategory(tabs[prev].id);
    } else if (e.key === 'Home') {
      e.preventDefault();
      tabRefs.current[0]?.focus();
      handleSelectCategory(tabs[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      const last = tabs.length - 1;
      tabRefs.current[last]?.focus();
      handleSelectCategory(tabs[last].id);
    }
  };

  const toggleAccordion = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const getCategoryLabel = (category: FAQCategory): string => {
    switch (category) {
      case 'general':
        return t('faq.filterGeneral');
      case 'corporate':
        return t('faq.filterCorporate');
      case 'litigation':
        return t('faq.filterLitigation');
      case 'property':
        return t('faq.filterProperty');
    }
  };

  const activeTabMeta = tabs.find((tab) => tab.id === activeCategory) ?? tabs[0];

  return (
    <section
      id="faq"
      className="py-24 bg-[#FAF8F5] dark:bg-[#080B11] border-b border-[#E4DCCF] dark:border-[#1A2334] relative"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880] mb-3 font-semibold">
            <HelpCircle className="w-4 h-4 text-[#C5A880]" />
            <span>{t('faq.kicker')}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-cinzel font-bold text-[#121A28] dark:text-white tracking-tight">
            {t('faq.title')}
          </h2>
          <p className="mt-4 text-[#4A576D] dark:text-[#9BA5B7] leading-relaxed text-base">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* Categorized Tabs + Search Control Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#E4DCCF] dark:border-[#1C263A]">

            {/* Accessible Categorized Tab Strip */}
            <div
              role="tablist"
              aria-label={language === 'sw' ? 'Kategoria za Maswali ya Kisheria' : 'FAQ Practice Categories'}
              className="flex items-stretch gap-1 overflow-x-auto pb-0 -mb-px scrollbar-none"
            >
              {tabs.map((tab, idx) => {
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabRefs.current[idx] = el;
                    }}
                    id={`faq-tab-${tab.id}`}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    aria-controls="faq-tabpanel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => handleSelectCategory(tab.id)}
                    onKeyDown={(e) => handleTabKeyDown(e, idx)}
                    className={`group relative flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880]/60 rounded-t-lg ${
                      isActive
                        ? 'border-[#C5A880] bg-white dark:bg-[#0E1522] text-[#121A28] dark:text-[#F3E2C8] shadow-sm'
                        : 'border-transparent text-[#5C6A80] dark:text-[#8C98AE] hover:text-[#121A28] dark:hover:text-white hover:bg-[#F1ECE1]/60 dark:hover:bg-[#0E1522]/50'
                    }`}
                  >
                    <span
                      className={`transition-colors ${
                        isActive
                          ? 'text-[#8C6B32] dark:text-[#C5A880]'
                          : 'text-[#8C98AE] dark:text-[#64748B] group-hover:text-[#8C6B32] dark:group-hover:text-[#C5A880]'
                      }`}
                    >
                      {tab.icon}
                    </span>
                    <span className="tracking-wide">{tab.label}</span>
                    <span
                      className={`font-mono text-[10px] tabular-nums px-1.5 py-0.5 rounded transition-colors ${
                        isActive
                          ? 'bg-[#C5A880]/20 text-[#8C6B32] dark:text-[#E4C999] font-bold'
                          : 'bg-[#EDE6D8] dark:bg-[#141D2D] text-[#5C6A80] dark:text-[#78869E]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80 pb-2.5">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-[calc(50%-5px)] -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('faq.searchPlaceholder')}
                aria-label={t('faq.searchPlaceholder')}
                className="w-full pl-10 pr-8 py-2 bg-white dark:bg-[#0E1522] border border-[#E4DCCF] dark:border-[#1C263A] rounded-xl text-xs text-[#121A28] dark:text-white placeholder-[#7A869B] dark:placeholder-[#64748B] focus:outline-none focus:border-[#C5A880] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear FAQ search"
                  className="absolute right-3 top-[calc(50%-5px)] -translate-y-1/2 text-sm text-[#8C98AE] hover:text-[#121A28] dark:hover:text-white cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Active Category Context Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C6A80] dark:text-[#8C98AE]">
            <div className="flex items-center gap-2">
              <span className="font-mono uppercase tracking-wider text-[11px] text-[#8C6B32] dark:text-[#C5A880] font-semibold">
                {activeTabMeta.label}
              </span>
              <span aria-hidden="true">·</span>
              <span>{language === 'sw' ? activeTabMeta.subtitleSw : activeTabMeta.subtitleEn}</span>
            </div>
            <span className="font-mono text-[11px] tabular-nums">
              {language === 'sw'
                ? `Inaonyesha maswali ${filteredFaqs.length} kati ya ${FAQS_DATA.length}`
                : `Showing ${filteredFaqs.length} of ${FAQS_DATA.length} advisories`}
            </span>
          </div>
        </div>

        {/* Accordion Panel */}
        <div
          id="faq-tabpanel"
          role="tabpanel"
          aria-labelledby={`faq-tab-${activeCategory}`}
          className="space-y-4"
        >
          {filteredFaqs.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0E1522] rounded-2xl border border-[#E4DCCF] dark:border-[#1C263A]">
              <HelpCircle className="w-8 h-8 text-[#64748B] mx-auto mb-3" />
              <p className="text-sm text-[#4A576D] dark:text-[#94A3B8]">
                {language === 'sw'
                  ? 'Hakuna maswali yaliyopatikana yanayolingana na utafutaji wako.'
                  : 'No legal inquiries matched your search criteria in this category.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-3 text-xs font-semibold text-[#8C6B32] dark:text-[#C5A880] hover:underline cursor-pointer"
              >
                {language === 'sw' ? 'Onyesha maswali yote' : 'Reset search & view all inquiries'}
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openFaqId === faq.id;
              const question = language === 'sw' ? faq.questionSw : faq.questionEn;
              const answer = language === 'sw' ? faq.answerSw : faq.answerEn;
              const actionLabel =
                language === 'sw'
                  ? faq.actionLabelSw || 'Shauriana Nasi'
                  : faq.actionLabelEn || 'Instruct Counsel';

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-white dark:bg-[#0E1522] border-[#C5A880]/70 dark:border-[#C5A880]/50 shadow-lg shadow-[#121A28]/5 dark:shadow-[#000000]/40'
                      : 'bg-[#FBF9F4] dark:bg-[#0A0F19] border-[#E4DCCF] dark:border-[#1C263A] hover:border-[#C5A880]/50 dark:hover:border-[#2A374F]'
                  }`}
                >
                  {/* Accordion Trigger Header */}
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full px-6 py-5 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="font-mono text-xs font-semibold text-[#8C6B32] dark:text-[#C5A880] mt-0.5 shrink-0 tabular-nums">
                        {String(index + 1).padStart(2, '0')}.
                      </span>
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880]">
                          <span>{getCategoryLabel(faq.category)}</span>
                        </div>
                        <h3
                          className={`text-base sm:text-lg font-serif font-bold transition-colors ${
                            isOpen
                              ? 'text-[#8C6B32] dark:text-[#DFBE82]'
                              : 'text-[#121A28] dark:text-white'
                          }`}
                        >
                          {question}
                        </h3>

                        {/* Unboxed Statutory Citations */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#5C6A80] dark:text-[#718096] mt-1.5 font-mono">
                          {faq.statutes.map((statute, sIdx) => (
                            <React.Fragment key={statute}>
                              <span className="text-[#4A576D] dark:text-[#8C98AE]">{statute}</span>
                              {sIdx < faq.statutes.length - 1 && (
                                <span className="text-[#B8B0A0] dark:text-[#4E5D78]" aria-hidden="true">
                                  ·
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`p-2 rounded-lg bg-[#F1ECE1] dark:bg-[#141D2D] border border-[#E4DCCF] dark:border-[#232F46] text-[#8C6B32] dark:text-[#C5A880] shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 bg-[#C5A880]/20 border-[#C5A880]/50' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Accordion Expanded Body */}
                  {isOpen && (
                    <div className="px-6 pb-6 pt-3 border-t border-[#E4DCCF]/70 dark:border-[#1C263A]/60 animate-in fade-in duration-200">
                      <div className="text-sm text-[#324056] dark:text-[#B0BCCC] leading-relaxed max-w-4xl space-y-4">
                        <p>{answer}</p>
                      </div>

                      {/* Action Bar */}
                      <div className="mt-5 pt-4 border-t border-[#E4DCCF]/60 dark:border-[#172132] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-[#5C6A80] dark:text-[#718096]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880]" />
                          <span>
                            {language === 'sw'
                              ? 'Usiri wa Wakili na Mteja Unatumika'
                              : 'Advocate-Client Privilege Applies'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onOpenConsultation(faq.questionEn)}
                          className="px-4 py-2 text-xs font-semibold text-[#0A0E17] bg-gradient-to-r from-[#C5A880] to-[#DFBE82] rounded-lg hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md shadow-[#C5A880]/15 cursor-pointer"
                        >
                          <span>{actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Privileged Consultation Card */}
        <div className="mt-14 p-8 rounded-2xl bg-gradient-to-r from-[#F6F1E6] to-[#FFFFFF] dark:from-[#0F1626] dark:to-[#0A0E17] border border-[#DFD4C1] dark:border-[#222E42] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center text-[#8C6B32] dark:text-[#C5A880] shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-serif font-bold text-[#121A28] dark:text-white">
                {t('faq.stillHaveQuestions')}
              </h4>
              <p className="text-xs sm:text-sm text-[#4A576D] dark:text-[#8C98AE] mt-1 max-w-xl">
                {t('faq.promptConfidential')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenConsultation('General Corporate Brief')}
            className="px-6 py-3.5 bg-gradient-to-r from-[#C5A880] via-[#D4AF37] to-[#B89047] text-[#080B11] font-semibold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-xl shadow-[#C5A880]/20 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('faq.scheduleConsultation')}
          </button>
        </div>

      </div>
    </section>
  );
};
