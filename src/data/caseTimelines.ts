export interface CaseTimelineMilestone {
  id: string;
  date: string;
  stageTag: string;
  stageTagSw: string;
  courtOrForum: string;
  title: string;
  titleSw: string;
  description: string;
  descriptionSw: string;
  docketRef: string;
  status: 'filed' | 'ruling' | 'appeal' | 'precedent';
}

export const CASE_TIMELINES: Record<string, CaseTimelineMilestone[]> = {
  'case-1': [
    {
      id: 'c1-m1',
      date: '14 Mar 2023',
      stageTag: 'Notice of Dispute & FIDIC Referral',
      stageTagSw: 'Ilani ya Mzozo & Rufaa ya FIDIC',
      courtOrForum: 'Dispute Adjudication Board (DAB) · Nairobi',
      title: 'Substation Commissioning Failure & Liquidated Damages Notice',
      titleSw: 'Kuchelewa kwa Mradi wa Umeme & Ilani ya Fidia',
      description:
        'Syndicated lenders issued formal notice of EPC contractor delay exceeding 180 days on the 220kV cross-border transmission corridor and triggered security preservation.',
      descriptionSw:
        'Wakopeshaji walitoa ilani rasmi ya kuchelewa kwa mkandarasi kwa zaidi ya siku 180 katika njia ya usafirishaji wa umeme wa mipakani.',
      docketRef: 'DAB/2023/EPC-09',
      status: 'filed',
    },
    {
      id: 'c1-m2',
      date: '08 Aug 2023',
      stageTag: 'Interim Conservatory Relief',
      stageTagSw: 'Amri ya Muda ya Kuhifadhi Dhamana',
      courtOrForum: 'High Court of Kenya (Milimani Commercial Division)',
      title: 'Ex-Parte Injunction Preserving USD $14M Performance Bonds',
      titleSw: 'Zuio la Muda Kulinda Dhamana ya Dola Milioni 14',
      description:
        'Under Section 7 of the Arbitration Act 1995, Chambers obtained urgent interim orders restraining unilateral encashment of counter-guarantees pending constitution of the arbitral tribunal.',
      descriptionSw:
        'Chini ya Kifungu cha 7 cha Sheria ya Usuluhishi ya 1995, ofisi ilipata amri ya dharura kuzuia utumiaji wa dhamana za benki kabla ya jopo kuundwa.',
      docketRef: 'HC/COMM/E312/2023',
      status: 'ruling',
    },
    {
      id: 'c1-m3',
      date: '19 Jan 2024',
      stageTag: 'Tribunal Constitution & Procedural Order No. 1',
      stageTagSw: 'Kuundwa kwa Baraza la Usuluhishi',
      courtOrForum: 'Nairobi Centre for International Arbitration (NCIA)',
      title: 'Three-Member Arbitral Panel Seated in Nairobi',
      titleSw: 'Jopo la Wasuluhishi Watatu Laanza Kazi Nairobi',
      description:
        'NCIA Court confirmed appointment of the presiding arbitrator and adopted a fast-track evidentiary schedule governing forensic engineering telemetry and delay quantum audits.',
      descriptionSw:
        'Kituo cha NCIA kiliidhinisha jopo la usuluhishi na kuweka ratiba ya haraka ya kuwasilisha ushahidi wa kitaalamu wa uhandisi.',
      docketRef: 'NCIA/ARB/2023/041',
      status: 'filed',
    },
    {
      id: 'c1-m4',
      date: '11 Oct 2024',
      stageTag: 'Evidentiary Hearing & Cross-Examination',
      stageTagSw: 'Usikilizaji wa Ushahidi wa Wataalamu',
      courtOrForum: 'NCIA Hearing Suite 1 · Upper Hill',
      title: 'Cross-Examination of Grid Synchronization Experts',
      titleSw: 'Mahojiano ya Wataalamu wa Mfumo wa Umeme',
      description:
        'Five-day evidentiary hearing established concurrent grid readiness by the Employer and refuted the contractor’s force majeure defense through certified SCADA telemetry logs.',
      descriptionSw:
        'Usikilizaji wa siku tano ulithibitisha kuwa mteja alikamilisha sehemu yake kwa wakati na kukanusha hoja ya nguvu za dharura (force majeure).',
      docketRef: 'NCIA/2024/DAY-05',
      status: 'appeal',
    },
    {
      id: 'c1-m5',
      date: '18 Feb 2025',
      stageTag: 'Final Arbitral Award & Recognition',
      stageTagSw: 'Tuzo ya Mwisho ya Usuluhishi',
      courtOrForum: 'NCIA & High Court of Kenya (Enforcement)',
      title: 'Unanimous USD $42M Award & Sovereign Indemnity Upheld',
      titleSw: 'Ushindi wa Tuzo ya Dola Milioni 42 na Dhamana',
      description:
        'Tribunal awarded full liquidated damages, default interest, and indemnity costs; High Court subsequently recognized the award as a binding decree under Section 36.',
      descriptionSw:
        'Baraza liliamuru malipo kamili ya fidia na riba; Mahakama Kuu baadaye ilitambua tuzo hiyo kama hukumu rasmi chini ya Kifungu cha 36.',
      docketRef: 'HC/MISC/E094/2025',
      status: 'precedent',
    },
  ],
  'case-2': [
    {
      id: 'c2-m1',
      date: '10 May 2021',
      stageTag: 'Statutory Enactment & Transition Directive',
      stageTagSw: 'Kuanza kwa Sheria ya Umiliki wa Sehemu',
      courtOrForum: 'Ministry of Lands & Physical Planning',
      title: 'Sectional Properties Act, 2020 Gazette Notice & Conversion Mandate',
      titleSw: 'Agizo la Kubadilisha Hatimiliki za Sub-Lease',
      description:
        'Public directive required conversion of all long-term sub-leases registered on mother titles onto geo-referenced ArdhiSasa sectional titles within a compressed statutory window.',
      descriptionSw:
        'Tangazo la serikali liliagiza ubadilishaji wa mikataba ya muda mrefu kuwa hatimiliki za sehemu kupitia mfumo wa ArdhiSasa.',
      docketRef: 'GAZETTE/VOL.CXXIII',
      status: 'filed',
    },
    {
      id: 'c2-m2',
      date: '24 Mar 2022',
      stageTag: 'Constitutional Petition Filed',
      stageTagSw: 'Ombi la Kikatiba Mahakama Kuu',
      courtOrForum: 'Environment and Land Court (ELC) · Nairobi',
      title: 'Challenge to Summary Registry Freeze on Existing Charges',
      titleSw: 'Pingamizi Dhidi ya Kusimamishwa Usajili wa Dhamana',
      description:
        'Chambers petitioned the ELC on behalf of Mara Park Estates and institutional chargees after registry rejections threatened KES 11.5B in pre-existing leasehold securities.',
      descriptionSw:
        'Ofisi iliwasilisha kesi katika Mahakama ya Mazingira na Ardhi kulinda dhamana za mikopo ya thamani ya KES 11.5B.',
      docketRef: 'ELC/PET/E021/2022',
      status: 'filed',
    },
    {
      id: 'c2-m3',
      date: '16 Nov 2022',
      stageTag: 'ELC Conservatory Orders',
      stageTagSw: 'Amri ya Kulinda Haki za Wamiliki',
      courtOrForum: 'Environment and Land Court · Milimani',
      title: 'Preservation of Existing Registered Sub-Leases During Georeferencing',
      titleSw: 'Uhalali wa Hatimiliki za Awali Wakati wa Upimaji',
      description:
        'Court issued conservatory declarations preventing cancellation of valid 99-year leases where cadastral sectional plans remained pending Director of Surveys verification.',
      descriptionSw:
        'Mahakama ilizuia kufutwa kwa mikataba halali ya miaka 99 wakati mipango ya upimaji ikiendelea kukaguliwa.',
      docketRef: 'ELC/RULING/112022',
      status: 'ruling',
    },
    {
      id: 'c2-m4',
      date: '04 Sep 2023',
      stageTag: 'Court of Appeal Reference',
      stageTagSw: 'Rufaa Kuhusu Mamlaka ya Usajili',
      courtOrForum: 'Court of Appeal at Nairobi',
      title: 'Clarification on Retroactive Nullification & Article 40 Property Rights',
      titleSw: 'Ufafanuzi wa Haki za Mali Chini ya Ibara ya 40',
      description:
        'Appellate bench heard consolidated submissions from financial institutions and developers regarding constitutional protection of vested property interests under Article 40.',
      descriptionSw:
        'Mahakama ya Rufaa ilisikiliza hoja kuhusu ulinzi wa kikatiba wa haki za umiliki wa mali chini ya Ibara ya 40.',
      docketRef: 'COA/CIV/E408/2023',
      status: 'appeal',
    },
    {
      id: 'c2-m5',
      date: '29 Jul 2024',
      stageTag: 'Supreme Court Binding Precedent',
      stageTagSw: 'Uamuzi wa Mwisho wa Mahakama ya Juu',
      courtOrForum: 'Supreme Court of Kenya',
      title: 'Safeguarding Corporate Leaseholders From Retroactive Nullification',
      titleSw: 'Uamuzi wa Kulinda Wamiliki Dhidi ya Kufutwa Hatimiliki',
      description:
        'Apex court affirmed that non-completion of administrative ArdhiSasa migration does not extinguish substantive ownership, establishing nationwide conveyancing certainty.',
      descriptionSw:
        'Mahakama ya Juu ilithibitisha kuwa kuchelewa kwa uhamishaji wa ArdhiSasa hakufuti umiliki halali wa kisheria.',
      docketRef: 'SC/PET/E018/2024',
      status: 'precedent',
    },
  ],
  'case-3': [
    {
      id: 'c3-m1',
      date: '15 Jun 2023',
      stageTag: 'Statutory Default & Demand Notice',
      stageTagSw: 'Ilani ya Kisheria ya Kukosekana Malipo',
      courtOrForum: 'Land Act Section 90 Statutory Process',
      title: 'Issuance of 90-Day & 40-Day Notices to Sell Over KES 6.2B Facility',
      titleSw: 'Kutolewa kwa Ilani za Siku 90 na 40 Chini ya Sheria ya Ardhi',
      description:
        'Following persistent default across syndicated industrial debentures, secured lenders served statutory Section 90(1) and Section 96(2) notices in strict compliance with the Land Act.',
      descriptionSw:
        'Baada ya kuchelewa kwa malipo ya mkopo wa viwanda, benki ziliwasilisha ilani za kisheria chini ya Vifungu vya 90 na 96.',
      docketRef: 'SEC/90/96-2023',
      status: 'filed',
    },
    {
      id: 'c3-m2',
      date: '03 Nov 2023',
      stageTag: 'Administration Moratorium & Receiver Appointment',
      stageTagSw: 'Uteuzi wa Msimamizi Chini ya Sheria ya Ufilisi',
      courtOrForum: 'Insolvency Act 2015 Filing',
      title: 'Debtor Placed in Administration; Ex-Parte Restraining Motion Filed',
      titleSw: 'Maombi ya Dharura ya Kuzuia Uuzaji wa Mali za Dhamana',
      description:
        'Heavy Industrial Group obtained temporary ex-parte status quo orders citing the Insolvency Act administration moratorium to halt scheduled realization auctions.',
      descriptionSw:
        'Kampuni ya viwanda ilipata amri ya muda ya kuzuia mnada ikitumia hoja ya ulinzi wa usimamizi wa ufilisi.',
      docketRef: 'HC/IP/E088/2023',
      status: 'ruling',
    },
    {
      id: 'c3-m3',
      date: '14 May 2024',
      stageTag: 'High Court Inter-Partes Ruling',
      stageTagSw: 'Uamuzi wa Mahakama Kuu Baada ya Hoja',
      courtOrForum: 'High Court (Commercial & Insolvency Division)',
      title: 'Discharge of Ex-Parte Injunction & Validation of Chargee Priority',
      titleSw: 'Kufutwa kwa Zuio la Muda & Kuthibitishwa kwa Haki ya Benki',
      description:
        'Chambers demonstrated full compliance with statutory valuation thresholds and established that administration does not extinguish prior fixed security enforcement rights.',
      descriptionSw:
        'Ofisi ilithibitisha uzingatiaji wa tathmini za kisheria na haki ya kipaumbele ya mkopeshaji mwenye dhamana.',
      docketRef: 'HC/IP/RUL-2024',
      status: 'ruling',
    },
    {
      id: 'c3-m4',
      date: '22 Jan 2025',
      stageTag: 'Court of Appeal Precedent Ruling',
      stageTagSw: 'Uamuzi Elekezi wa Mahakama ya Rufaa',
      courtOrForum: 'Court of Appeal at Nairobi',
      title: 'Rule 5(2)(b) Stay Denied; Insolvency Receiver Threshold Clarified',
      titleSw: 'Kanuni ya Kazi za Msimamizi na Mamlaka ya Wadai Yabainishwa',
      description:
        'Appellate bench dismissed the stay application, setting authoritative precedent on statutory notice validity and secured lender remedies under the Insolvency Act 2015.',
      descriptionSw:
        'Mahakama ya Rufaa ilitupilia mbali ombi la kusitisha utekelezaji na kuweka msingi imara wa tafsiri ya Sheria ya Ufilisi ya 2015.',
      docketRef: 'COA/CIV/E014/2025',
      status: 'precedent',
    },
  ],
  'case-4': [
    {
      id: 'c4-m1',
      date: '02 Feb 2023',
      stageTag: 'Promulgation of Statutory Levy Regulations',
      stageTagSw: 'Kutangazwa kwa Kanuni Mpya za Ushuru',
      courtOrForum: 'Kenya Gazette Legal Notice',
      title: 'Publication of Retroactive Industrial Excise & Regulatory Levy',
      titleSw: 'Ushuru Mpya wa Kiserikali Bila Mashauriano ya Umma',
      description:
        'National Treasury gazetted new manufacturing levies taking effect retroactively without publishing regulatory impact statements or conducting sector public participation.',
      descriptionSw:
        'Hazina ya Taifa ilichapisha kanuni mpya za ushuru kwa viwanda bila kukusanya maoni ya wadau kama katiba inavyotaka.',
      docketRef: 'LN/2023/REV-14',
      status: 'filed',
    },
    {
      id: 'c4-m2',
      date: '28 Feb 2023',
      stageTag: 'Constitutional Petition & Stay Application',
      stageTagSw: 'Ombi la Kikatiba & Amri ya Kusitisha Ushuru',
      courtOrForum: 'High Court (Constitutional & Human Rights Division)',
      title: 'Urgent Conservatory Suspension Protecting KES 18B Sector Liquidity',
      titleSw: 'Amri ya Kusitisha Ukusanyaji wa Ushuru wa KES 18B',
      description:
        'Chambers instituted Petition E061/2023 invoking Articles 10, 47, and 118 of the Constitution, securing an immediate conservatory freeze on levy collection.',
      descriptionSw:
        'Kwa kutumia Ibara ya 10, 47 na 118 za Katiba, ofisi ilipata amri ya kuzuia utozaji wa ushuru huo mara moja.',
      docketRef: 'HC/CHRP/E061/2023',
      status: 'ruling',
    },
    {
      id: 'c4-m3',
      date: '19 Oct 2023',
      stageTag: 'Three-Judge Bench Certification',
      stageTagSw: 'Jopo la Majaji Watatu Laamriwa',
      courtOrForum: 'Milimani Constitutional Division (Chief Justice Embankment)',
      title: 'Embankment Under Article 165(4) for Substantial Constitutional Question',
      titleSw: 'Kesi Yapewa Uzito wa Kikatiba Chini ya Ibara ya 165(4)',
      description:
        'Due to macro-economic ramifications exceeding KES 18 Billion, the Chief Justice constituted an expanded bench to determine legislative delegation boundaries.',
      descriptionSw:
        'Kutokana na athari kubwa za kiuchumi, Jaji Mkuu aliteua jopo la majaji watatu kusikiliza shauri hilo.',
      docketRef: 'HC/CONST/BENCH-3',
      status: 'appeal',
    },
    {
      id: 'c4-m4',
      date: '12 Aug 2024',
      stageTag: 'Final Constitutional Declaration',
      stageTagSw: 'Uamuzi wa Mwisho wa Kikatiba',
      courtOrForum: 'High Court of Kenya (Constitutional Division)',
      title: 'Regulations Declared Null and Void Ab Initio for Want of Participation',
      titleSw: 'Kanuni Zabatilishwa Kabisa kwa Kukosa Ushirikishwaji wa Umma',
      description:
        'Bench invalidated the impugned statutory instruments in full, reaffirming mandatory meaningful public participation and strict Fair Administrative Action Act compliance.',
      descriptionSw:
        'Mahakama ilibatilisha kanuni hizo kikamilifu na kusisitiza ulazima wa ushirikishwaji wa kweli wa wananchi.',
      docketRef: 'HC/CHRP/JUDG-2024',
      status: 'precedent',
    },
  ],
  'case-5': [
    {
      id: 'c5-m1',
      date: '11 Apr 2024',
      stageTag: 'Enforcement & Penalty Notice',
      stageTagSw: 'Ilani ya Adhabu Chini ya Sheria ya Data',
      courtOrForum: 'Office of the Data Protection Commissioner (ODPC)',
      title: 'KES 850M Cross-Border Cloud Telemetry Localization Penalty',
      titleSw: 'Adhabu ya KES 850M Kuhusu Uhifadhi wa Data Nje ya Nchi',
      description:
        'Regulator issued an administrative penalty notice alleging unauthorized cross-border transfer of encrypted diagnostic telemetry without localization approval.',
      descriptionSw:
        'Mamlaka ya Ulinzi wa Data ilitoa ilani ya adhabu ikidai uhamishaji wa data zilizosimbwa nje ya mipaka bila kibali.',
      docketRef: 'ODPC/ENF/2024/039',
      status: 'filed',
    },
    {
      id: 'c5-m2',
      date: '07 Jun 2024',
      stageTag: 'Leave for Judicial Review',
      stageTagSw: 'Ruhusa ya Mapitio ya Kimahakama (Judicial Review)',
      courtOrForum: 'High Court (Commercial & Tax / JR Division)',
      title: 'Stay Operating as Prohibition Against Penalty Execution',
      titleSw: 'Amri ya Kusitisha Utekelezaji wa Adhabu ya Mamlaka',
      description:
        'Chambers demonstrated prima facie statutory misinterpretation of Section 48 of the Data Protection Act 2019 and secured leave with stay of enforcement.',
      descriptionSw:
        'Ofisi ilionyesha tafsiri potofu ya Kifungu cha 48 cha Sheria ya Ulinzi wa Data ya 2019 na kupata amri ya kusitisha adhabu.',
      docketRef: 'HC/JR/E044/2024',
      status: 'ruling',
    },
    {
      id: 'c5-m3',
      date: '21 Nov 2024',
      stageTag: 'Expert Cryptographic Demonstrations',
      stageTagSw: 'Ushahidi wa Kitaalamu wa Usimbaji wa Data',
      courtOrForum: 'High Court Commercial Division',
      title: 'Zero-Knowledge Telemetry Verification Before the Bench',
      titleSw: 'Uthibitisho wa Kutokuwepo Data Binafsi Kwenye Mfumo',
      description:
        'Independent cryptography experts testified that hashed infrastructure telemetry cannot re-identify natural persons, removing the dataset from personal data scope.',
      descriptionSw:
        'Wataalamu wa usalama wa mtandao walithibitisha kuwa taarifa hizo zilizosimbwa haziwezi kumtambulisha mtu yeyote binafsi.',
      docketRef: 'HC/JR/EXH-TECH-24',
      status: 'appeal',
    },
    {
      id: 'c5-m4',
      date: '06 Mar 2025',
      stageTag: 'Landmark Digital Governance Precedent',
      stageTagSw: 'Uamuzi wa Kihistoria Kuhusu Sheria ya Data',
      courtOrForum: 'High Court of Kenya',
      title: 'Order of Certiorari Quashing Notice; Section 48 Exemptions Clarified',
      titleSw: 'Adhabu Yafutwa; Msingi Mpya wa Uhamishaji Data Uliowekwa',
      description:
        'First reported Kenyan judgment defining statutory exemptions for encrypted telemetry under Section 48 KDPA, shielding cloud operators from disproportionate penalties.',
      descriptionSw:
        'Hukumu ya kwanza nchini Kenya kufafanua misamaha ya kisheria kwa data zilizosimbwa chini ya Kifungu cha 48 KDPA.',
      docketRef: 'HC/JR/JUDG-2025',
      status: 'precedent',
    },
  ],
};
