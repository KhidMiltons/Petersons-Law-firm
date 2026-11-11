import React, { useState, useMemo, useRef } from 'react';
import { 
  geoMercator, 
  geoPath, 
  geoGraticule, 
  geoInterpolate 
} from 'd3-geo';
import { 
  Compass, 
  MapPin, 
  Building2, 
  Globe2, 
  ShieldCheck, 
  Scale, 
  ExternalLink, 
  Sparkles, 
  Printer, 
  ArrowRight, 
  Layers, 
  Info, 
  Award,
  Maximize2,
  RotateCcw,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { 
  EAST_AFRICA_LOCATIONS, 
  EAST_AFRICA_GEOJSON, 
  NAIROBI_HQ_COORDS, 
  RegionalLocation 
} from '../data/eastAfricaData';
import { useLanguage } from '../context/LanguageContext';
import { PrintFriendlyModal } from './PrintFriendlyModal';
import { PrintDocument, formatEastAfricaReachForPrint } from '../utils/printFriendly';

interface EastAfricaReachMapProps {
  onOpenConsultation?: (practice?: string, estimate?: string, advocate?: string) => void;
}

export const EastAfricaReachMap: React.FC<EastAfricaReachMapProps> = ({ onOpenConsultation }) => {
  const { t } = useLanguage();

  // State
  const [selectedLocation, setSelectedLocation] = useState<RegionalLocation>(EAST_AFRICA_LOCATIONS[0]);
  const [hoveredLocation, setHoveredLocation] = useState<RegionalLocation | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [showArcs, setShowArcs] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [printDoc, setPrintDoc] = useState<PrintDocument | null>(null);

  // SVG Dimensions & Projection calibration for East Africa
  const svgWidth = 860;
  const svgHeight = 620;

  // d3-geo projection centered around Kenya / East Africa
  const projection = useMemo(() => {
    return geoMercator()
      .center([36.2, -0.8]) // Centered around Kenya / Lake Victoria / East African Corridor
      .scale(2300 * zoomLevel)
      .translate([svgWidth / 2, svgHeight / 2]);
  }, [zoomLevel]);

  // Path generator
  const pathGenerator = useMemo(() => {
    return geoPath().projection(projection);
  }, [projection]);

  // Graticule lines generator
  const graticuleLines = useMemo(() => {
    const graticule = geoGraticule().step([2, 2]).extent([[27, -13], [44, 11]]);
    return pathGenerator(graticule()) || '';
  }, [pathGenerator]);

  // Filtered locations
  const filteredLocations = useMemo(() => {
    if (sectorFilter === 'all') return EAST_AFRICA_LOCATIONS;
    if (sectorFilter === 'offices') {
      return EAST_AFRICA_LOCATIONS.filter(l => l.type === 'headquarters' || l.type === 'regional_office');
    }
    return EAST_AFRICA_LOCATIONS.filter(l => l.sector === sectorFilter);
  }, [sectorFilter]);

  // Projected coordinates map
  const projectedLocations = useMemo(() => {
    return filteredLocations.map(loc => {
      const coords = projection(loc.coordinates);
      return {
        ...loc,
        x: coords ? coords[0] : 0,
        y: coords ? coords[1] : 0
      };
    });
  }, [filteredLocations, projection]);

  // Nairobi HQ projected point
  const nairobiProjected = useMemo(() => {
    const p = projection(NAIROBI_HQ_COORDS);
    return p ? { x: p[0], y: p[1] } : { x: svgWidth / 2, y: svgHeight / 2 };
  }, [projection]);

  // Geodesic transmission arcs from Nairobi to other locations
  const transmissionArcs = useMemo(() => {
    return filteredLocations
      .filter(loc => loc.id !== 'loc-nairobi')
      .map(loc => {
        // Interpolate 24 geodesic points between Nairobi and target
        const interpolator = geoInterpolate(NAIROBI_HQ_COORDS, loc.coordinates);
        const points: [number, number][] = [];
        const steps = 24;
        for (let i = 0; i <= steps; i++) {
          const pt = interpolator(i / steps);
          const projected = projection(pt);
          if (projected) {
            points.push([projected[0], projected[1]]);
          }
        }

        // Build SVG path
        let d = '';
        if (points.length > 0) {
          d = `M ${points[0][0]},${points[0][1]}`;
          for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i][0]},${points[i][1]}`;
          }
        }

        const isHighlighted = selectedLocation?.id === loc.id || hoveredLocation?.id === loc.id;

        return {
          id: `arc-${loc.id}`,
          d,
          targetLocation: loc,
          isHighlighted
        };
      });
  }, [filteredLocations, projection, selectedLocation, hoveredLocation]);

  // Format printable document for the East Africa Reach visualization
  const handlePrintReachDossier = () => {
    const doc = formatEastAfricaReachForPrint(EAST_AFRICA_LOCATIONS);
    setPrintDoc(doc);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <section id="east-africa-reach" className="py-24 bg-[#070A10] border-b border-[#1E2536] relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#162744]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] mb-3 font-semibold">
              <Compass className="w-3.5 h-3.5 text-[#C5A880] animate-spin" style={{ animationDuration: '24s' }} />
              <span>Pan-African Jurisdictional Reach · EAC &amp; COMESA Corridors</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-cinzel text-white tracking-tight">
              East Africa Regional Reach &amp; Cross-Border Advisory
            </h2>
            <p className="mt-4 text-[#9BA5B7] leading-relaxed">
              From our Upper Hill Chambers in Nairobi to the East African Court of Justice in Arusha and sovereign corridors in Kampala, Kigali, Dar es Salaam, Addis Ababa, and Juba, Petersons Angwenyi &amp; Associates orchestrates high-stakes cross-border project finance, multilateral treaties, and international arbitrations.
            </p>
          </div>

          {/* Section Action Strip */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handlePrintReachDossier}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#121927] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] text-xs font-semibold rounded-xl border border-[#C5A880]/40 hover:border-[#C5A880] transition-all shadow-sm group cursor-pointer"
              title="Print Summary Dossier of East African regional reach using established #printable-document print styles"
            >
              <Printer className="w-4 h-4 text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
              <span>Print Reach Dossier</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Segmented Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#111724] rounded-xl border border-[#202E44] max-w-2xl">
            <button
              onClick={() => setSectorFilter('all')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                sectorFilter === 'all'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              All Hubs ({EAST_AFRICA_LOCATIONS.length})
            </button>
            <button
              onClick={() => setSectorFilter('offices')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                sectorFilter === 'offices'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              Chambers Offices (3)
            </button>
            <button
              onClick={() => setSectorFilter('Energy & Infrastructure')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                sectorFilter === 'Energy & Infrastructure'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              Energy &amp; Infrastructure
            </button>
            <button
              onClick={() => setSectorFilter('International Arbitration')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                sectorFilter === 'International Arbitration'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              International Arbitration
            </button>
            <button
              onClick={() => setSectorFilter('Project Finance & Banking')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                sectorFilter === 'Project Finance & Banking'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              Banking &amp; Sovereign Finance
            </button>
          </div>

          {/* Map Controls */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setShowArcs(!showArcs)}
              className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                showArcs
                  ? 'bg-[#162132] text-[#E4C999] border-[#C5A880]/40'
                  : 'bg-[#101622] text-[#7888A0] border-[#1E283C]'
              }`}
              title="Toggle geodesic transmission arcs from Nairobi HQ"
            >
              <Zap className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Corridors: {showArcs ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setZoomLevel(prev => (prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1))}
              className="p-1.5 rounded-lg bg-[#101622] text-[#8C98AE] hover:text-white border border-[#1E283C] hover:border-[#C5A880]/30 transition-colors"
              title="Toggle Zoom Level"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {zoomLevel !== 1 && (
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 rounded-lg bg-[#101622] text-[#8C98AE] hover:text-white border border-[#1E283C] hover:border-[#C5A880]/30 transition-colors"
                title="Reset Map Scale"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Grid: d3-geo Interactive Map (Left/Center) + Detail Inspection Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Map Container (8 cols on lg) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-[#0B0F17] rounded-2xl border border-[#1E283C] p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            
            {/* Top Bar inside Map with Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A2336] text-xs font-mono z-10 relative">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#E4C999] border border-white shadow-sm flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A0E17]" />
                  </span>
                  <span className="text-white font-medium">Nairobi HQ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 border border-teal-200" />
                  <span className="text-[#96A7C0]">Regional Circuits</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-200" />
                  <span className="text-[#96A7C0]">Advisory Project Hubs</span>
                </div>
              </div>

              <div className="text-[11px] text-[#697A92] flex items-center gap-1">
                <Globe2 className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>d3-geo Mercator · East Africa Bounding Box</span>
              </div>
            </div>

            {/* SVG Canvas for d3-geo Map */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] my-2 select-none">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full rounded-xl overflow-hidden"
                style={{ background: 'radial-gradient(circle at 50% 50%, #0F1726 0%, #080C14 100%)' }}
              >
                <defs>
                  {/* Subtle map graticule pattern */}
                  <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  {/* Linear gradient for geodesic arcs */}
                  <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DFBE82" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#C5A880" stopOpacity="0.3" />
                  </linearGradient>

                  {/* Highlight gradient */}
                  <linearGradient id="arc-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFE4A0" stopOpacity="1" />
                    <stop offset="100%" stopColor="#C5A880" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* 1. Graticule coordinate grid */}
                <path
                  d={graticuleLines}
                  fill="none"
                  stroke="#162338"
                  strokeWidth="0.7"
                  strokeDasharray="2 3"
                  opacity="0.6"
                />

                {/* 2. Country Polygons from GeoJSON */}
                <g className="countries-layer">
                  {EAST_AFRICA_GEOJSON.features.map((feature, idx) => {
                    const pathD = pathGenerator(feature);
                    const isLake = feature.properties.type === 'lake';
                    const isKenya = feature.properties.code === 'KE';

                    return (
                      <path
                        key={`geo-${idx}`}
                        d={pathD || ''}
                        fill={isLake ? '#091526' : isKenya ? '#121C2E' : '#0D1624'}
                        stroke={isLake ? '#1E3250' : isKenya ? '#334868' : '#223048'}
                        strokeWidth={isLake ? '1' : isKenya ? '1.5' : '1'}
                        className="transition-colors duration-200 hover:fill-[#17253D]"
                      >
                        <title>{feature.properties.name}</title>
                      </path>
                    );
                  })}
                </g>

                {/* 3. Country Labels */}
                <g className="labels-layer font-mono text-[10px] fill-[#62738E] uppercase tracking-wider select-none pointer-events-none">
                  <text x={projection([37.5, 0.5])?.[0] || 0} y={projection([37.5, 0.5])?.[1] || 0} fill="#8FA4C4" fontWeight="600">KENYA</text>
                  <text x={projection([32.0, 1.3])?.[0] || 0} y={projection([32.0, 1.3])?.[1] || 0}>UGANDA</text>
                  <text x={projection([34.5, -6.0])?.[0] || 0} y={projection([34.5, -6.0])?.[1] || 0}>TANZANIA</text>
                  <text x={projection([29.9, -2.1])?.[0] || 0} y={projection([29.9, -2.1])?.[1] || 0} fontSize="8">RWANDA</text>
                  <text x={projection([37.5, 7.5])?.[0] || 0} y={projection([37.5, 7.5])?.[1] || 0}>ETHIOPIA</text>
                  <text x={projection([31.5, 5.5])?.[0] || 0} y={projection([31.5, 5.5])?.[1] || 0}>SOUTH SUDAN</text>
                  <text x={projection([32.8, -1.0])?.[0] || 0} y={projection([32.8, -1.0])?.[1] || 0} fill="#354F75" fontSize="9" fontStyle="italic">L. Victoria</text>
                  <text x={projection([41.5, -3.5])?.[0] || 0} y={projection([41.5, -3.5])?.[1] || 0} fill="#243750" fontSize="9" fontStyle="italic">Indian Ocean</text>
                </g>

                {/* 4. Geodesic Flight & Transmission Arcs from Nairobi HQ */}
                {showArcs && (
                  <g className="arcs-layer">
                    {transmissionArcs.map(arc => (
                      <path
                        key={arc.id}
                        d={arc.d}
                        fill="none"
                        stroke={arc.isHighlighted ? 'url(#arc-highlight)' : 'url(#arc-gradient)'}
                        strokeWidth={arc.isHighlighted ? 2.5 : 1.2}
                        strokeDasharray={arc.isHighlighted ? 'none' : '4 3'}
                        opacity={arc.isHighlighted ? 1 : 0.65}
                        className="transition-all duration-200"
                      />
                    ))}
                  </g>
                )}

                {/* 5. Concentric Pulsing Sonar Rings around Nairobi HQ */}
                <g className="nairobi-sonar pointer-events-none" transform={`translate(${nairobiProjected.x}, ${nairobiProjected.y})`}>
                  <circle r="12" fill="none" stroke="#C5A880" strokeWidth="1" opacity="0.6">
                    <animate attributeName="r" values="8;24;36" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.3;0" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle r="6" fill="#C5A880" opacity="0.3" />
                </g>

                {/* 6. Interactive Location Pins */}
                <g className="pins-layer">
                  {projectedLocations.map(loc => {
                    const isSelected = selectedLocation?.id === loc.id;
                    const isHovered = hoveredLocation?.id === loc.id;
                    const isHq = loc.type === 'headquarters';
                    const isRegional = loc.type === 'regional_office';

                    const pinRadius = isHq ? 8 : isSelected ? 7 : 5;
                    const pinColor = isHq 
                      ? '#E4C999' 
                      : isRegional 
                      ? '#2DD4BF' 
                      : '#F59E0B';

                    return (
                      <g
                        key={loc.id}
                        transform={`translate(${loc.x}, ${loc.y})`}
                        onClick={() => setSelectedLocation(loc)}
                        onMouseEnter={() => setHoveredLocation(loc)}
                        onMouseLeave={() => setHoveredLocation(null)}
                        className="cursor-pointer group"
                      >
                        {/* Outer Glow Ring on Hover or Select */}
                        {(isSelected || isHovered) && (
                          <circle
                            r={pinRadius + 6}
                            fill="none"
                            stroke={pinColor}
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                            className="animate-spin"
                            style={{ animationDuration: '8s' }}
                          />
                        )}

                        {/* Core Pin Circle */}
                        <circle
                          r={pinRadius}
                          fill={pinColor}
                          stroke="#0B0F17"
                          strokeWidth="2"
                          className="transition-transform duration-150 group-hover:scale-125"
                        />

                        {/* Nairobi Star Marker */}
                        {isHq && (
                          <circle r="3" fill="#0A0E17" />
                        )}

                        {/* Pin City Label */}
                        <text
                          x={isHq ? 12 : 10}
                          y={isHq ? 4 : 3}
                          fill={isSelected ? '#FFE4A0' : isHovered ? '#FFFFFF' : '#B2C1D6'}
                          fontSize={isHq ? '12' : '10'}
                          fontWeight={isHq || isSelected ? '700' : '500'}
                          fontFamily="sans-serif"
                          className="drop-shadow-md select-none transition-colors"
                        >
                          {loc.name}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Bottom Proof Strip inside Map Box */}
            <div className="pt-3 border-t border-[#1A2336] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
              <div>
                <span className="text-[10px] text-[#6E7E96] uppercase block">Cumulative Value</span>
                <span className="text-sm font-bold text-[#E4C999]">KES 85B+</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6E7E96] uppercase block">Sovereign Nations</span>
                <span className="text-sm font-bold text-white">7 Member States</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6E7E96] uppercase block">Permanent Chambers</span>
                <span className="text-sm font-bold text-teal-400">3 Hub Circuits</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6E7E96] uppercase block">Appellate Bar</span>
                <span className="text-sm font-bold text-[#DFBE82]">EACJ &amp; COMESA</span>
              </div>
            </div>

          </div>

          {/* Right Column: Active Inspection Dossier Card (5 cols on lg) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-[#0E1522] rounded-2xl border border-[#C5A880]/40 p-6 shadow-2xl flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              
              {/* Badge & Scope */}
              <div className="flex items-center justify-between gap-2 border-b border-[#1C263A] pb-3">
                <span className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold flex items-center gap-1.5 font-mono">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedLocation.country} · {selectedLocation.status}</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#141F32] text-[#E4C999] border border-[#233550]">
                  {selectedLocation.year}
                </span>
              </div>

              {/* Title & Hub Name */}
              <div>
                <h3 className="text-2xl font-cinzel text-white leading-tight">
                  {selectedLocation.name}
                </h3>
                <h4 className="text-sm font-semibold text-[#C5A880] mt-1 font-sans">
                  {selectedLocation.title}
                </h4>
              </div>

              {/* Financial Exposure & Transaction Value */}
              <div className="p-3.5 bg-[#121A28] rounded-xl border border-[#1E293E] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#6F7A8F] block">
                    Financial Exposure / Project Size:
                  </span>
                  <span className="text-base font-mono text-emerald-400 font-bold">
                    {selectedLocation.valueKes}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#8C98AE] bg-[#162134] px-2.5 py-1 rounded-lg border border-[#263752]">
                  {selectedLocation.valueUsd}
                </span>
              </div>

              {/* Narrative Summary */}
              <p className="text-xs text-[#9DAABF] leading-relaxed">
                {selectedLocation.description}
              </p>

              {/* Governing Forum & Statutes */}
              <div className="p-3 bg-[#111724] rounded-xl border border-[#1C2638] space-y-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] uppercase text-[#6E7F98] block">Tribunal / Judicial Forum:</span>
                  <span className="text-white font-medium">{selectedLocation.tribunalOrForum}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#6E7F98] block">Statutory Framework:</span>
                  <span className="text-[#A6B5CC]">{selectedLocation.metrics.statutes}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#6E7F98] block">Designated Counsel in Charge:</span>
                  <span className="text-[#E4C999] font-semibold">{selectedLocation.leadCounsel}</span>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#1C263A] flex flex-col gap-2.5">
              {onOpenConsultation && (
                <button
                  type="button"
                  onClick={() => onOpenConsultation(selectedLocation.sector, selectedLocation.valueKes, selectedLocation.leadCounsel)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-[#C5A880] to-[#DFBE82] text-[#0A0E17] font-semibold text-xs tracking-wider uppercase rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md shadow-[#C5A880]/20"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Instruct Chambers in this Region</span>
                </button>
              )}

              <button
                type="button"
                onClick={handlePrintReachDossier}
                className="w-full py-2 px-3 bg-[#141B28] hover:bg-[#1A2538] text-[#A6B5CC] hover:text-white rounded-xl text-xs font-medium border border-[#222E42] transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Export Regional Reach Report (PDF)</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Printer-Ready PDF Layout Modal */}
      <PrintFriendlyModal
        isOpen={!!printDoc}
        onClose={() => setPrintDoc(null)}
        document={printDoc}
      />

    </section>
  );
};
