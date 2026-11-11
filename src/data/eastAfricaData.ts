// Comprehensive East Africa Geographic & Cross-Border Advisory Project Data
import type { FeatureCollection, Geometry } from 'geojson';

export interface RegionalLocation {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: 'headquarters' | 'regional_office' | 'advisory_project';
  sector: 'Corporate Dispute' | 'Energy & Infrastructure' | 'Project Finance & Banking' | 'International Arbitration' | 'Conveyancing & Maritime';
  title: string;
  description: string;
  valueKes: string;
  valueUsd: string;
  status: 'Permanent Chambers' | 'Active Transaction' | 'Landmark Precedent' | 'Cross-Border Advisory';
  tribunalOrForum: string;
  leadCounsel: string;
  year: string;
  metrics: {
    statutes: string;
    institutions: string;
  };
}

export const NAIROBI_HQ_COORDS: [number, number] = [36.8172, -1.2921];

export const EAST_AFRICA_LOCATIONS: RegionalLocation[] = [
  {
    id: 'loc-nairobi',
    name: 'Nairobi',
    country: 'Kenya',
    countryCode: 'KE',
    coordinates: [36.8172, -1.2921],
    type: 'headquarters',
    sector: 'Corporate Dispute',
    title: 'Chambers Principal Headquarters · Upper Hill',
    description: 'Supreme Court of Kenya, Milimani Commercial Court, and Court of Appeal appellate advocacy command. Houses Senior Counsel chambers and arbitration hearing suites.',
    valueKes: 'KES 85B+',
    valueUsd: '$650M+',
    status: 'Permanent Chambers',
    tribunalOrForum: 'Supreme Court of Kenya · NCIA Apex Panel',
    leadCounsel: 'Milton Angwenyi, SC & Peterson K. Maina',
    year: 'Est. 1998',
    metrics: {
      statutes: 'Advocates Act (Cap 16) · Appellate Jurisdiction Act',
      institutions: 'Supreme Court · Court of Appeal · NCIA'
    }
  },
  {
    id: 'loc-mombasa',
    name: 'Mombasa',
    country: 'Kenya',
    countryCode: 'KE',
    coordinates: [39.6682, -4.0435],
    type: 'regional_office',
    sector: 'Conveyancing & Maritime',
    title: 'Coastal Admiralty & Port Maritime Chambers',
    description: 'Specialized admiralty jurisdiction, Kilindini Harbor vessel arrest proceedings, transshipment bill of lading disputes, and coastal sectional titles.',
    valueKes: 'KES 18.2B',
    valueUsd: '$140M',
    status: 'Permanent Chambers',
    tribunalOrForum: 'High Court Commercial & Admiralty Division (Mombasa)',
    leadCounsel: 'Brian Kipkemboi Cheruiyot, Partner',
    year: '2014',
    metrics: {
      statutes: 'Merchant Shipping Act · Sectional Properties Act 2020',
      institutions: 'Kenya Ports Authority (KPA) · Maritime Tribunal'
    }
  },
  {
    id: 'loc-kisumu',
    name: 'Kisumu',
    country: 'Kenya',
    countryCode: 'KE',
    coordinates: [34.7680, -0.0917],
    type: 'regional_office',
    sector: 'Energy & Infrastructure',
    title: 'Lake Victoria Basin Circuit Chambers',
    description: 'Serving Western Kenya Judicial Circuit, Lake Victoria basin cross-border conveyancing, and agro-industrial & geothermal energy restructuring.',
    valueKes: 'KES 9.4B',
    valueUsd: '$72M',
    status: 'Permanent Chambers',
    tribunalOrForum: 'Kisumu Court of Appeal & Environment and Land Court',
    leadCounsel: 'Sharon Wanjiku Mutua, Senior Partner',
    year: '2019',
    metrics: {
      statutes: 'Physical & Land Use Planning Act · Energy Act 2019',
      institutions: 'Lake Basin Development Authority · Western Bar Circuit'
    }
  },
  {
    id: 'loc-kampala',
    name: 'Kampala',
    country: 'Uganda',
    countryCode: 'UG',
    coordinates: [32.5825, 0.3476],
    type: 'advisory_project',
    sector: 'Energy & Infrastructure',
    title: 'EACOP Trans-Boundary Crude Oil Pipeline Advisory',
    description: 'Advising regional institutional lenders on trans-boundary sovereign host government agreements, wayleave statutory acquisitions, and environmental compliance.',
    valueKes: 'KES 585B',
    valueUsd: '$4.5B',
    status: 'Active Transaction',
    tribunalOrForum: 'East African Court of Justice (EACJ) · Arusha',
    leadCounsel: 'Dr. Patricia Omwamba, Sovereign Debt Lead',
    year: '2024 - 2026',
    metrics: {
      statutes: 'EAC Treaty · Petroleum Exploration Protocols',
      institutions: 'Uganda Ministry of Energy · EACOP Consortium'
    }
  },
  {
    id: 'loc-dar',
    name: 'Dar es Salaam',
    country: 'Tanzania',
    countryCode: 'TZ',
    coordinates: [39.2083, -6.7924],
    type: 'advisory_project',
    sector: 'International Arbitration',
    title: 'Standard Gauge Railway (SGR) Multi-Tier Arbitration',
    description: 'Representation in high-value FIDIC Yellow Book civil engineering disputes, AfCFTA tariff harmonisation, and cross-border transit demurrage claims.',
    valueKes: 'KES 286B',
    valueUsd: '$2.2B',
    status: 'Cross-Border Advisory',
    tribunalOrForum: 'NCIA & LCIA Joint Tribunal (Dar / London)',
    leadCounsel: 'Milton Angwenyi, SC (Chartered Arbitrator)',
    year: '2023 - 2025',
    metrics: {
      statutes: 'New York Convention 1958 · Arbitration Act 1995',
      institutions: 'Tanzania Railways Corporation · LCIA Panel'
    }
  },
  {
    id: 'loc-kigali',
    name: 'Kigali',
    country: 'Rwanda',
    countryCode: 'RW',
    coordinates: [30.0619, -1.9441],
    type: 'advisory_project',
    sector: 'Project Finance & Banking',
    title: 'Kigali International Financial Centre (KIFC) Sandbox',
    description: 'Pan-African fintech regulatory compliance, cross-border payments routing, and harmonisation of Kenya KDPA 2019 with Rwandan Privacy statutes.',
    valueKes: 'KES 110B',
    valueUsd: '$850M',
    status: 'Landmark Precedent',
    tribunalOrForum: 'Kigali International Arbitration Centre (KIAC)',
    leadCounsel: 'Sharon Wanjiku Mutua, Tech & IP Partner',
    year: '2025',
    metrics: {
      statutes: 'KDPA 2019 · Law No 058/2021 Data Protection Rwanda',
      institutions: 'Rwanda Financial Services Authority · KIFC'
    }
  },
  {
    id: 'loc-addis',
    name: 'Addis Ababa',
    country: 'Ethiopia',
    countryCode: 'ET',
    coordinates: [38.7578, 8.9806],
    type: 'advisory_project',
    sector: 'Energy & Infrastructure',
    title: 'Ethio-Kenya High-Voltage DC Interconnector PPA',
    description: 'Sovereign cross-border 2,000 MW high-voltage direct current power transmission agreement, national grid tariff pooling, and multi-lateral indemnities.',
    valueKes: 'KES 156B',
    valueUsd: '$1.2B',
    status: 'Active Transaction',
    tribunalOrForum: 'COMESA Court of Justice · Lusaka / Nairobi',
    leadCounsel: 'Dr. Patricia Omwamba & David Otieno',
    year: '2024',
    metrics: {
      statutes: 'COMESA Treaty · Public Private Partnerships Act 2021',
      institutions: 'Ethiopian Electric Power · Kenya Power (KPLC)'
    }
  },
  {
    id: 'loc-juba',
    name: 'Juba',
    country: 'South Sudan',
    countryCode: 'SS',
    coordinates: [31.5713, 4.8594],
    type: 'advisory_project',
    sector: 'Project Finance & Banking',
    title: 'Cross-Border Syndicated Sovereign Letter of Credit',
    description: 'Structuring sovereign letters of credit and trade finance collateral for major infrastructure development along the northern transit corridor.',
    valueKes: 'KES 88.4B',
    valueUsd: '$680M',
    status: 'Cross-Border Advisory',
    tribunalOrForum: 'ICSID / NCIA Sovereign Panel',
    leadCounsel: 'Peterson K. Maina, Managing Partner',
    year: '2023 - 2026',
    metrics: {
      statutes: 'Bilateral Investment Treaty · Uniform Customs & Practice UCP 600',
      institutions: 'Bank of South Sudan · Regional Commercial Banks'
    }
  },
  {
    id: 'loc-goma',
    name: 'Goma / Eastern DRC',
    country: 'DR Congo',
    countryCode: 'CD',
    coordinates: [29.2285, -1.6585],
    type: 'advisory_project',
    sector: 'Corporate Dispute',
    title: 'EAC Treaty Accession & Concession Structuring',
    description: 'Advising commercial mining joint ventures following DRC accession to the East African Community, customs tariff alignment, and asset protection.',
    valueKes: 'KES 234B',
    valueUsd: '$1.8B',
    status: 'Active Transaction',
    tribunalOrForum: 'East African Court of Justice (Appellate Division)',
    leadCounsel: 'Milton Angwenyi, SC',
    year: '2025 - 2026',
    metrics: {
      statutes: 'EAC Customs Union Protocol · OHADA Commercial Law',
      institutions: 'EAC Secretariat · DRC Mining Cadastre'
    }
  },
  {
    id: 'loc-lamu',
    name: 'Lamu Port (LAPSSET)',
    country: 'Kenya',
    countryCode: 'KE',
    coordinates: [40.9006, -2.2696],
    type: 'advisory_project',
    sector: 'Energy & Infrastructure',
    title: 'LAPSSET Strategic Corridor & Deep-Water Concessions',
    description: 'Special Economic Zone (SEZ) structuring, deep-water berth operations concessions, and community land acquisition statutory validation.',
    valueKes: 'KES 403B',
    valueUsd: '$3.1B',
    status: 'Landmark Precedent',
    tribunalOrForum: 'High Court Commercial Division & Public Procurement Board',
    leadCounsel: 'Brian Kipkemboi Cheruiyot & Peterson K. Maina',
    year: '2022 - 2026',
    metrics: {
      statutes: 'Special Economic Zones Act 2015 · Land Act 2012',
      institutions: 'LAPSSET Development Authority · National Land Commission'
    }
  },
  {
    id: 'loc-zanzibar',
    name: 'Zanzibar',
    country: 'Tanzania',
    countryCode: 'TZ',
    coordinates: [39.2026, -6.1659],
    type: 'advisory_project',
    sector: 'International Arbitration',
    title: 'Blue Economy Offshore Concession & Maritime Arbitration',
    description: 'Advising on offshore block production sharing contracts (PSC), environmental marine sanctuary covenants, and expedited arbitral hearings.',
    valueKes: 'KES 54.6B',
    valueUsd: '$420M',
    status: 'Cross-Border Advisory',
    tribunalOrForum: 'Tanzania Institute of Arbitrators & NCIA',
    leadCounsel: 'David Otieno, FCIArb',
    year: '2024 - 2025',
    metrics: {
      statutes: 'UNCLOS 1982 · Zanzibar Petroleum (Upstream) Act',
      institutions: 'Zanzibar Ministry of Blue Economy · TIArb'
    }
  }
];

// Curated high-precision GeoJSON geometries for East African Countries & Lakes
export const EAST_AFRICA_GEOJSON: FeatureCollection<Geometry, { name: string; type: string; code?: string }> = {
  type: 'FeatureCollection',
  features: [
    // 1. Kenya
    {
      type: 'Feature',
      properties: { name: 'Kenya', type: 'country', code: 'KE' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [34.0, 4.6], [35.5, 4.6], [36.0, 5.0], [37.5, 4.0], [39.0, 4.3],
          [41.0, 4.0], [41.9, 3.9], [41.0, 1.8], [41.6, 0.0], [41.0, -1.6],
          [40.8, -2.3], [40.2, -3.2], [39.6, -4.7], [39.2, -4.7], [37.7, -3.3],
          [36.5, -2.1], [35.5, -1.5], [34.5, -1.0], [33.9, -1.0], [34.0, 0.5],
          [34.9, 1.0], [34.9, 2.0], [35.0, 3.5], [34.0, 4.6]
        ]]
      }
    },
    // 2. Uganda
    {
      type: 'Feature',
      properties: { name: 'Uganda', type: 'country', code: 'UG' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [34.0, 4.6], [34.0, 3.5], [34.9, 2.0], [34.9, 1.0], [34.0, 0.5],
          [33.9, -1.0], [31.5, -1.4], [30.5, -1.4], [29.7, -1.3], [29.6, -0.5],
          [30.0, 0.5], [30.4, 1.3], [31.0, 2.0], [31.5, 2.5], [31.3, 3.5],
          [31.8, 3.6], [32.5, 3.8], [34.0, 4.6]
        ]]
      }
    },
    // 3. Tanzania
    {
      type: 'Feature',
      properties: { name: 'Tanzania', type: 'country', code: 'TZ' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [33.9, -1.0], [34.5, -1.0], [35.5, -1.5], [36.5, -2.1], [37.7, -3.3],
          [39.2, -4.7], [39.1, -5.2], [39.0, -6.8], [39.3, -8.0], [39.8, -10.0],
          [40.5, -10.5], [38.5, -11.5], [36.0, -11.7], [35.0, -11.0], [34.5, -9.5],
          [33.5, -9.3], [32.5, -8.5], [31.0, -8.0], [30.5, -7.0], [29.6, -5.0],
          [29.3, -4.5], [29.8, -3.5], [30.8, -2.5], [30.5, -1.4], [31.5, -1.4],
          [33.9, -1.0]
        ]]
      }
    },
    // 4. Rwanda
    {
      type: 'Feature',
      properties: { name: 'Rwanda', type: 'country', code: 'RW' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [29.7, -1.3], [30.5, -1.4], [30.8, -2.0], [30.8, -2.5], [30.3, -2.4],
          [29.8, -2.8], [29.0, -2.7], [28.9, -2.4], [29.0, -1.7], [29.7, -1.3]
        ]]
      }
    },
    // 5. Burundi
    {
      type: 'Feature',
      properties: { name: 'Burundi', type: 'country', code: 'BI' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [29.0, -2.7], [29.8, -2.8], [30.3, -2.4], [30.8, -2.5], [30.5, -3.5],
          [30.2, -4.2], [29.4, -4.4], [29.1, -4.0], [29.2, -3.2], [29.0, -2.7]
        ]]
      }
    },
    // 6. South Sudan (Southern / Eastern reach)
    {
      type: 'Feature',
      properties: { name: 'South Sudan', type: 'country', code: 'SS' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [31.3, 3.5], [31.5, 2.5], [31.0, 2.0], [30.0, 3.8], [29.5, 4.5],
          [29.8, 6.0], [31.5, 6.5], [33.5, 6.5], [35.0, 5.5], [35.5, 4.6],
          [34.0, 4.6], [32.5, 3.8], [31.8, 3.6], [31.3, 3.5]
        ]]
      }
    },
    // 7. Southern Ethiopia (Corridor reach)
    {
      type: 'Feature',
      properties: { name: 'Ethiopia', type: 'country', code: 'ET' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [35.0, 5.5], [35.5, 4.6], [36.0, 5.0], [37.5, 4.0], [39.0, 4.3],
          [41.0, 4.0], [41.9, 3.9], [42.5, 5.0], [42.0, 7.5], [39.5, 9.5],
          [38.0, 9.2], [36.5, 8.0], [35.5, 6.5], [35.0, 5.5]
        ]]
      }
    },
    // 8. Lake Victoria (Inland water body)
    {
      type: 'Feature',
      properties: { name: 'Lake Victoria', type: 'lake' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [32.2, 0.4], [33.2, 0.4], [34.0, -0.2], [34.4, -0.4], [34.3, -1.0],
          [34.0, -1.8], [33.5, -2.3], [32.8, -2.5], [31.8, -2.2], [31.6, -1.2],
          [31.8, -0.2], [32.2, 0.4]
        ]]
      }
    },
    // 9. Lake Turkana (Northern Kenya)
    {
      type: 'Feature',
      properties: { name: 'Lake Turkana', type: 'lake' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [35.9, 4.5], [36.2, 4.4], [36.5, 3.8], [36.7, 3.0], [36.5, 2.5],
          [36.0, 2.6], [35.8, 3.3], [35.7, 4.0], [35.9, 4.5]
        ]]
      }
    },
    // 10. Lake Tanganyika (Western flank)
    {
      type: 'Feature',
      properties: { name: 'Lake Tanganyika', type: 'lake' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [29.2, -3.3], [29.4, -3.8], [29.6, -5.0], [30.1, -6.5], [30.5, -7.2],
          [30.8, -8.0], [31.0, -8.5], [30.5, -8.6], [29.8, -7.5], [29.4, -6.0],
          [29.1, -4.5], [29.2, -3.3]
        ]]
      }
    }
  ]
};
