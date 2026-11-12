import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { ArrowRight, Compass, Layers, Globe, ShieldCheck } from 'lucide-react';
import { PRACTICE_AREAS, PracticeArea } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

export type RadarMetricLens = 'depth' | 'volume' | 'reach';

interface SectorExpertiseDatum {
  practiceId: string;
  shortLabel: string;
  shortLabelSw: string;
  depth: number;
  volume: number;
  reach: number;
  benchmark: number;
  yearsExperience: string;
  landmarkMetric: string;
}

const SECTOR_EXPERTISE_METRICS: SectorExpertiseDatum[] = [
  {
    practiceId: 'corporate-finance',
    shortLabel: 'Corporate & Finance',
    shortLabelSw: 'Mashirika & Fedha',
    depth: 96,
    volume: 94,
    reach: 91,
    benchmark: 76,
    yearsExperience: '22+ Yrs',
    landmarkMetric: 'KES 48B+ Structured Facilities',
  },
  {
    practiceId: 'dispute-resolution',
    shortLabel: 'Disputes & Arbitration',
    shortLabelSw: 'Kesi & Usuluhishi',
    depth: 98,
    volume: 92,
    reach: 97,
    benchmark: 78,
    yearsExperience: '26+ Yrs',
    landmarkMetric: 'Supreme Court & NCIA / LCIA',
  },
  {
    practiceId: 'real-estate',
    shortLabel: 'Real Estate & Land',
    shortLabelSw: 'Ardhi & Majengo',
    depth: 92,
    volume: 86,
    reach: 79,
    benchmark: 74,
    yearsExperience: '18+ Yrs',
    landmarkMetric: 'ArdhiSasa & Sectional Titles',
  },
  {
    practiceId: 'constitutional-public-law',
    shortLabel: 'Constitutional & Public',
    shortLabelSw: 'Katiba & Umma',
    depth: 94,
    volume: 82,
    reach: 85,
    benchmark: 72,
    yearsExperience: '28+ Yrs',
    landmarkMetric: 'Appellate & PPARB Briefs',
  },
  {
    practiceId: 'tech-ip',
    shortLabel: 'Tech, IP & Data',
    shortLabelSw: 'Teknolojia & Data',
    depth: 88,
    volume: 84,
    reach: 92,
    benchmark: 70,
    yearsExperience: '12+ Yrs',
    landmarkMetric: 'ODPC & Fintech Sandboxes',
  },
  {
    practiceId: 'energy-environment',
    shortLabel: 'Energy & Resources',
    shortLabelSw: 'Nishati & Madini',
    depth: 90,
    volume: 88,
    reach: 95,
    benchmark: 73,
    yearsExperience: '15+ Yrs',
    landmarkMetric: 'EPRA PPAs & Carbon Credits',
  },
];

interface PracticeExpertiseRadarProps {
  activePracticeId: string | null;
  onHighlightPractice: (practiceId: string | null) => void;
  onInspectPractice: (practice: PracticeArea) => void;
}

export const PracticeExpertiseRadar: React.FC<PracticeExpertiseRadarProps> = ({
  activePracticeId,
  onHighlightPractice,
  onInspectPractice,
}) => {
  const { language, t } = useLanguage();
  const [metricLens, setMetricLens] = useState<RadarMetricLens>('depth');
  const [selectedSectorId, setSelectedSectorId] = useState<string>(
    PRACTICE_AREAS[0]?.id || 'corporate-finance'
  );
  const [hasEnteredView, setHasEnteredView] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const effectiveSectorId = activePracticeId || selectedSectorId;

  // Trigger initial D3 sweep-out animation when chart scrolls into viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setHasEnteredView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasEnteredView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const radarItems = useMemo(() => {
    return SECTOR_EXPERTISE_METRICS.map((item) => {
      const score =
        metricLens === 'depth'
          ? item.depth
          : metricLens === 'volume'
            ? item.volume
            : item.reach;
      const practice = PRACTICE_AREAS.find((p) => p.id === item.practiceId);
      return {
        ...item,
        score,
        label: language === 'sw' ? item.shortLabelSw : item.shortLabel,
        practice,
      };
    });
  }, [metricLens, language]);

  const activeSector = useMemo(
    () => radarItems.find((r) => r.practiceId === effectiveSectorId) || radarItems[0],
    [radarItems, effectiveSectorId]
  );

  // D3 SVG rendering & animated transition
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const width = 540;
    const height = 430;
    const radius = 142;
    const centerX = width / 2;
    const centerY = height / 2;
    const totalAxes = radarItems.length;
    const angleSlice = (Math.PI * 2) / totalAxes;

    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

    const svg = d3.select(svgElement);
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Initialize static SVG scaffold once
    let defs = svg.select<SVGDefsElement>('defs');
    if (defs.empty()) {
      defs = svg.append('defs');

      const areaGrad = defs
        .append('radialGradient')
        .attr('id', 'paa-radar-fill')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '55%');
      areaGrad.append('stop').attr('offset', '0%').attr('stop-color', '#DFBE82').attr('stop-opacity', 0.42);
      areaGrad.append('stop').attr('offset', '100%').attr('stop-color', '#C5A880').attr('stop-opacity', 0.14);

      const glowFilter = defs
        .append('filter')
        .attr('id', 'paa-radar-glow')
        .attr('x', '-25%')
        .attr('y', '-25%')
        .attr('width', '150%')
        .attr('height', '150%');
      glowFilter.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'blur');
      const merge = glowFilter.append('feMerge');
      merge.append('feMergeNode').attr('in', 'blur');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');
    }

    let root = svg.select<SVGGElement>('g.radar-root');
    if (root.empty()) {
      root = svg
        .append('g')
        .attr('class', 'radar-root')
        .attr('transform', `translate(${centerX}, ${centerY})`);

      // Concentric web levels (hexagons)
      const gridGroup = root.append('g').attr('class', 'radar-grid');
      const levels = [20, 40, 60, 80, 100];

      levels.forEach((level) => {
        const levelRadius = rScale(level);
        const polyPoints = d3.range(totalAxes).map((i) => {
          const angle = i * angleSlice - Math.PI / 2;
          return [Math.cos(angle) * levelRadius, Math.sin(angle) * levelRadius] as [number, number];
        });

        gridGroup
          .append('polygon')
          .attr('points', polyPoints.map((p) => p.join(',')).join(' '))
          .attr('fill', level === 100 ? 'rgba(197, 168, 128, 0.03)' : 'none')
          .attr('stroke', 'currentColor')
          .attr('class', 'text-[#D6CCBA] dark:text-[#223047]')
          .attr('stroke-width', level === 100 ? 1.2 : 0.8)
          .attr('stroke-dasharray', level === 100 ? 'none' : '3,3');

        gridGroup
          .append('text')
          .attr('x', 5)
          .attr('y', -levelRadius + 4)
          .attr('font-size', '9px')
          .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace')
          .attr('class', 'fill-[#7A869B] dark:fill-[#687892]')
          .text(`${level}%`);
      });

      // Benchmark reference polygon (Industry baseline)
      const benchmarkLine = d3
        .lineRadial<typeof radarItems[number]>()
        .radius((d) => rScale(d.benchmark))
        .angle((_, i) => i * angleSlice)
        .curve(d3.curveLinearClosed);

      root
        .append('path')
        .datum(radarItems)
        .attr('class', 'radar-benchmark')
        .attr('d', benchmarkLine)
        .attr('fill', 'none')
        .attr('stroke', 'currentColor')
        .classed('text-[#94A3B8]/50 dark:text-[#4C5E7D]', true)
        .attr('stroke-width', 1.25)
        .attr('stroke-dasharray', '4,4');

      // Spoke axes
      const axesGroup = root.append('g').attr('class', 'radar-axes');
      axesGroup
        .selectAll('line.radar-spoke')
        .data(radarItems)
        .enter()
        .append('line')
        .attr('class', 'radar-spoke transition-colors duration-200')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (_, i) => Math.cos(i * angleSlice - Math.PI / 2) * radius)
        .attr('y2', (_, i) => Math.sin(i * angleSlice - Math.PI / 2) * radius)
        .attr('stroke', 'currentColor')
        .attr('stroke-width', 1);

      // Active radar polygon & outline
      root
        .append('path')
        .attr('class', 'radar-area')
        .attr('fill', 'url(#paa-radar-fill)')
        .attr('stroke', '#C5A880')
        .attr('stroke-width', 2.25)
        .attr('filter', 'url(#paa-radar-glow)');

      // Vertex marker layer
      root.append('g').attr('class', 'radar-nodes');

      // Perimeter labels layer
      root.append('g').attr('class', 'radar-labels');
    }

    // Update spoke styling for active sector
    root
      .selectAll<SVGLineElement, typeof radarItems[number]>('line.radar-spoke')
      .data(radarItems)
      .attr('class', (d) =>
        d.practiceId === effectiveSectorId
          ? 'radar-spoke text-[#C5A880] transition-colors duration-200'
          : 'radar-spoke text-[#D6CCBA] dark:text-[#23314A] transition-colors duration-200'
      )
      .attr('stroke-width', (d) => (d.practiceId === effectiveSectorId ? 1.8 : 1));

    // Radial path generator
    const radarLine = d3
      .lineRadial<typeof radarItems[number]>()
      .radius((d) => rScale(hasEnteredView ? d.score : 0))
      .angle((_, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    root
      .select<SVGPathElement>('path.radar-area')
      .datum(radarItems)
      .transition()
      .duration(hasEnteredView ? 700 : 0)
      .ease(d3.easeCubicOut)
      .attr('d', radarLine);

    // Update vertex nodes
    const nodesGroup = root.select<SVGGElement>('g.radar-nodes');
    const nodeGroups = nodesGroup
      .selectAll<SVGGElement, typeof radarItems[number]>('g.radar-node')
      .data(radarItems, (d) => d.practiceId);

    const nodeEnter = nodeGroups
      .enter()
      .append('g')
      .attr('class', 'radar-node cursor-pointer')
      .attr('transform', 'translate(0, 0)');

    nodeEnter
      .append('circle')
      .attr('class', 'node-halo')
      .attr('r', 12)
      .attr('fill', '#C5A880')
      .attr('fill-opacity', 0);

    nodeEnter
      .append('circle')
      .attr('class', 'node-dot')
      .attr('r', 5)
      .attr('stroke', '#080B11')
      .attr('stroke-width', 1.5);

    nodeEnter
      .append('circle')
      .attr('class', 'node-hit')
      .attr('r', 20)
      .attr('fill', 'transparent');

    const nodeMerged = nodeEnter.merge(nodeGroups);

    nodeMerged
      .on('mouseenter', (_, d) => {
        setSelectedSectorId(d.practiceId);
        onHighlightPractice(d.practiceId);
      })
      .on('mouseleave', () => {
        onHighlightPractice(null);
      })
      .on('click', (_, d) => {
        setSelectedSectorId(d.practiceId);
        if (d.practice) {
          onInspectPractice(d.practice);
        }
      });

    nodeMerged
      .transition()
      .duration(hasEnteredView ? 700 : 0)
      .ease(d3.easeCubicOut)
      .attr('transform', (d, i) => {
        const dist = rScale(hasEnteredView ? d.score : 0);
        const angle = i * angleSlice - Math.PI / 2;
        return `translate(${Math.cos(angle) * dist}, ${Math.sin(angle) * dist})`;
      });

    nodeMerged
      .select<SVGCircleElement>('circle.node-halo')
      .transition()
      .duration(220)
      .attr('r', (d) => (d.practiceId === effectiveSectorId ? 13 : 9))
      .attr('fill-opacity', (d) => (d.practiceId === effectiveSectorId ? 0.28 : 0));

    nodeMerged
      .select<SVGCircleElement>('circle.node-dot')
      .transition()
      .duration(220)
      .attr('r', (d) => (d.practiceId === effectiveSectorId ? 6.5 : 4.5))
      .attr('fill', (d) => (d.practiceId === effectiveSectorId ? '#F3E2C8' : '#C5A880'));

    // Update axis labels + numeric score chips around perimeter
    const labelsGroup = root.select<SVGGElement>('g.radar-labels');
    const labelGroups = labelsGroup
      .selectAll<SVGGElement, typeof radarItems[number]>('g.radar-label')
      .data(radarItems, (d) => d.practiceId);

    const labelEnter = labelGroups
      .enter()
      .append('g')
      .attr('class', 'radar-label cursor-pointer');

    labelEnter.append('text').attr('class', 'label-title');
    labelEnter.append('text').attr('class', 'label-score');

    const labelMerged = labelEnter.merge(labelGroups);

    labelMerged
      .on('mouseenter', (_, d) => {
        setSelectedSectorId(d.practiceId);
        onHighlightPractice(d.practiceId);
      })
      .on('mouseleave', () => {
        onHighlightPractice(null);
      })
      .on('click', (_, d) => {
        setSelectedSectorId(d.practiceId);
        if (d.practice) {
          onInspectPractice(d.practice);
        }
      });

    labelMerged.each(function (d, i) {
      const group = d3.select(this);
      const angle = i * angleSlice - Math.PI / 2;
      const labelRadius = radius + 24;
      const lx = Math.cos(angle) * labelRadius;
      const ly = Math.sin(angle) * labelRadius;

      const cosVal = Math.cos(angle);
      const textAnchor =
        Math.abs(cosVal) < 0.2 ? 'middle' : cosVal > 0 ? 'start' : 'end';

      const yOffset = Math.sin(angle) < -0.6 ? -6 : Math.sin(angle) > 0.6 ? 12 : 2;
      const isSelected = d.practiceId === effectiveSectorId;

      group
        .select('text.label-title')
        .attr('x', lx)
        .attr('y', ly + yOffset)
        .attr('text-anchor', textAnchor)
        .attr('font-size', '11px')
        .attr('font-weight', isSelected ? '700' : '600')
        .attr(
          'class',
          isSelected
            ? 'label-title fill-[#8C6B32] dark:fill-[#F3E2C8] transition-colors'
            : 'label-title fill-[#4A576D] dark:fill-[#9BA5B7] transition-colors'
        )
        .text(d.label);

      group
        .select('text.label-score')
        .attr('x', lx)
        .attr('y', ly + yOffset + 13)
        .attr('text-anchor', textAnchor)
        .attr('font-size', '10px')
        .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace')
        .attr(
          'class',
          isSelected
            ? 'label-score fill-[#C5A880] font-bold'
            : 'label-score fill-[#7A869B] dark:fill-[#687892]'
        )
        .text(`${d.score}/100`);
    });
  }, [radarItems, effectiveSectorId, hasEnteredView, onHighlightPractice, onInspectPractice]);

  const lensButtons: Array<{
    id: RadarMetricLens;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'depth',
      label: t('practice.radarLensDepth'),
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    {
      id: 'volume',
      label: t('practice.radarLensVolume'),
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'reach',
      label: t('practice.radarLensReach'),
      icon: <Globe className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div
      ref={containerRef}
      className="mb-14 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0D131F] border border-[#E4DCCF] dark:border-[#1E273B] shadow-xl"
    >
      {/* Radar Top Header & Lens Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-[#E4DCCF] dark:border-[#1C263A]">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880] font-semibold mb-1.5">
            <Compass className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>{language === 'sw' ? 'Tathmini ya Sekta Sita (D3)' : 'D3 Sector Capability Distribution'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-cinzel text-[#121A28] dark:text-white tracking-tight">
            {t('practice.radarTitle')}
          </h3>
          <p className="text-xs text-[#4A576D] dark:text-[#8C98AE] mt-1.5 leading-relaxed">
            {t('practice.radarSubtitle')}
          </p>
        </div>

        {/* Interactive D3 Metric Morph Controls */}
        <div
          role="group"
          aria-label="Radar Chart Metric Dimension"
          className="inline-flex flex-wrap items-center gap-1.5 p-1 bg-[#F5EFE4] dark:bg-[#121927] rounded-xl border border-[#E4DCCF] dark:border-[#222E44] shrink-0"
        >
          {lensButtons.map((lens) => {
            const isActive = metricLens === lens.id;
            return (
              <button
                key={lens.id}
                type="button"
                onClick={() => setMetricLens(lens.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#C5A880] text-[#0A0E17] shadow-sm'
                    : 'text-[#5C6A80] dark:text-[#8C98AE] hover:text-[#121A28] dark:hover:text-white'
                }`}
              >
                {lens.icon}
                <span>{lens.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Radar & Active Sector Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
        {/* Left: Interactive D3 SVG Radar Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[540px]">
            <svg
              ref={svgRef}
              className="w-full h-auto overflow-visible select-none"
              role="img"
              aria-label="Interactive D3 radar chart visualizing Petersons Angwenyi & Associates expertise across six Kenyan and international legal sectors"
            />
          </div>

          {/* Chart Legend */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-5 text-[11px] font-mono text-[#5C6A80] dark:text-[#8C98AE]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#C5A880]/40 border border-[#C5A880]" />
              <span>
                {language === 'sw' ? 'Kiwango cha PAA Chambers' : 'PAA Chambers Profile'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 border-t border-dashed border-[#94A3B8] dark:border-[#4C5E7D]" />
              <span>
                {language === 'sw' ? 'Kipimo cha Sekta Afrika Mashariki' : 'Regional Benchmark'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Synchronized Sector Inspector & Quick Sector Selector */}
        <div className="lg:col-span-5 space-y-4">
          {activeSector && activeSector.practice && (
            <div className="p-6 rounded-2xl bg-[#FAF8F5] dark:bg-[#111827] border border-[#DFD4C1] dark:border-[#233048] space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880] font-semibold">
                    {activeSector.yearsExperience} · {activeSector.landmarkMetric}
                  </span>
                  <h4 className="text-lg font-cinzel font-bold text-[#121A28] dark:text-white mt-1 leading-snug">
                    {activeSector.practice.title}
                  </h4>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/40 text-right shrink-0">
                  <span className="text-lg font-mono font-bold text-[#8C6B32] dark:text-[#F3E2C8] tabular-nums">
                    {activeSector.score}
                  </span>
                  <span className="text-[10px] font-mono text-[#6F7A8F] dark:text-[#8C98AE] block -mt-1">
                    / 100
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#4A576D] dark:text-[#BAC5D6] leading-relaxed">
                {activeSector.practice.description}
              </p>

              {/* Compact 3-Metric Score Breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#0B101B] border border-[#E4DCCF] dark:border-[#1E2A3E]">
                  <span className="text-[10px] font-mono text-[#6F7A8F] dark:text-[#7D8B9F] block">
                    {t('practice.radarLensDepth')}
                  </span>
                  <span className="text-sm font-mono font-bold text-[#121A28] dark:text-white tabular-nums">
                    {activeSector.depth}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#0B101B] border border-[#E4DCCF] dark:border-[#1E2A3E]">
                  <span className="text-[10px] font-mono text-[#6F7A8F] dark:text-[#7D8B9F] block">
                    {t('practice.radarLensVolume')}
                  </span>
                  <span className="text-sm font-mono font-bold text-[#121A28] dark:text-white tabular-nums">
                    {activeSector.volume}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#0B101B] border border-[#E4DCCF] dark:border-[#1E2A3E]">
                  <span className="text-[10px] font-mono text-[#6F7A8F] dark:text-[#7D8B9F] block">
                    {t('practice.radarLensReach')}
                  </span>
                  <span className="text-sm font-mono font-bold text-[#121A28] dark:text-white tabular-nums">
                    {activeSector.reach}%
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E4DCCF] dark:border-[#1E2A3E] flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs text-[#5C6A80] dark:text-[#8C98AE]">
                  {t('practice.lead')}:{' '}
                  <strong className="text-[#121A28] dark:text-white">
                    {activeSector.practice.leadAdvocate}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => onInspectPractice(activeSector.practice!)}
                  className="px-3.5 py-2 rounded-lg bg-[#C5A880] text-[#0A0E17] text-xs font-bold uppercase tracking-wider hover:brightness-110 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>{t('practice.inspect')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Keyboard-accessible sector selector row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
            {radarItems.map((item) => {
              const isSelected = item.practiceId === effectiveSectorId;
              return (
                <button
                  key={item.practiceId}
                  type="button"
                  onMouseEnter={() => {
                    setSelectedSectorId(item.practiceId);
                    onHighlightPractice(item.practiceId);
                  }}
                  onMouseLeave={() => onHighlightPractice(null)}
                  onClick={() => setSelectedSectorId(item.practiceId)}
                  className={`px-3 py-2 rounded-xl text-left text-[11px] font-medium border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#C5A880]/15 border-[#C5A880] text-[#8C6B32] dark:text-[#F3E2C8] font-semibold'
                      : 'bg-[#F8F4EC] dark:bg-[#111827] border-[#E4DCCF] dark:border-[#1E283A] text-[#4A576D] dark:text-[#8C98AE] hover:border-[#C5A880]/50'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  <span className="font-mono text-[10px] tabular-nums shrink-0 text-[#8C6B32] dark:text-[#C5A880]">
                    {item.score}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
