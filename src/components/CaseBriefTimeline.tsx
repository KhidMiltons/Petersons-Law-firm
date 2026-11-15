import React, { useState, useRef, useEffect } from 'react';
import {
  History,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Scale,
  FileCheck2,
  BookmarkCheck,
  Calendar,
} from 'lucide-react';
import { CaseBrief } from '../data/firmData';
import { CASE_TIMELINES, CaseTimelineMilestone } from '../data/caseTimelines';
import { useLanguage } from '../context/LanguageContext';

interface CaseBriefTimelineProps {
  brief: CaseBrief;
  caseIndex?: number;
  totalCases?: number;
  onNavigateCase?: (direction: 'prev' | 'next') => void;
}

export const CaseBriefTimeline: React.FC<CaseBriefTimelineProps> = ({
  brief,
  caseIndex = 0,
  totalCases = 1,
  onNavigateCase,
}) => {
  const { language } = useLanguage();
  const milestones: CaseTimelineMilestone[] = CASE_TIMELINES[brief.id] || [];
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [scrollPct, setScrollPct] = useState<number>(0);
  const timelineWrapperRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Reset active milestone and scroll position when switching landmark cases
  useEffect(() => {
    setActiveIndex(0);
    setScrollPct(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [brief.id]);

  // Global scoped arrow-key listener when CaseBriefTimeline is in view and no modal/input is focused
  useEffect(() => {
    if (!onNavigateCase || totalCases <= 1) return;

    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      // Skip if an open dialog/modal is currently overlaid
      if (document.querySelector('[role="dialog"]')) return;

      // Skip if the event was already handled directly by the timeline container
      if (timelineWrapperRef.current?.contains(activeEl)) return;

      const rect = timelineWrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      const isInView = rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15;
      if (!isInView) return;

      e.preventDefault();
      onNavigateCase(e.key === 'ArrowLeft' ? 'prev' : 'next');
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [onNavigateCase, totalCases]);

  if (milestones.length === 0) return null;

  const handleContainerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      setScrollPct(Math.min(100, Math.max(0, (el.scrollTop / maxScroll) * 100)));
    }
  };

  const scrollToMilestone = (idx: number) => {
    const clamped = Math.max(0, Math.min(milestones.length - 1, idx));
    setActiveIndex(clamped);
    const targetEl = itemRefs.current[clamped];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleTimelineKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' && onNavigateCase && totalCases > 1) {
      e.preventDefault();
      onNavigateCase('prev');
    } else if (e.key === 'ArrowRight' && onNavigateCase && totalCases > 1) {
      e.preventDefault();
      onNavigateCase('next');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      scrollToMilestone(activeIndex - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      scrollToMilestone(activeIndex + 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      scrollToMilestone(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollToMilestone(milestones.length - 1);
    }
  };

  const getStatusLabel = (status: CaseTimelineMilestone['status']) => {
    switch (status) {
      case 'filed':
        return language === 'sw' ? 'Kufunguliwa Kesi' : 'Filing';
      case 'ruling':
        return language === 'sw' ? 'Amri ya Muda' : 'Interim Ruling';
      case 'appeal':
        return language === 'sw' ? 'Hoja & Rufaa' : 'Appellate Stage';
      case 'precedent':
        return language === 'sw' ? 'Uamuzi wa Mwisho' : 'Final Precedent';
    }
  };

  const getStatusIcon = (status: CaseTimelineMilestone['status']) => {
    switch (status) {
      case 'filed':
        return <FileCheck2 className="w-3.5 h-3.5" />;
      case 'ruling':
        return <Gavel className="w-3.5 h-3.5" />;
      case 'appeal':
        return <Scale className="w-3.5 h-3.5" />;
      case 'precedent':
        return <BookmarkCheck className="w-3.5 h-3.5" />;
    }
  };

  const spanLabel =
    milestones.length >= 2
      ? `${milestones[0].date.split(' ').pop()} – ${milestones[milestones.length - 1].date.split(' ').pop()}`
      : String(brief.year);

  return (
    <div
      ref={timelineWrapperRef}
      tabIndex={0}
      onKeyDown={handleTimelineKeyDown}
      className="mb-10 rounded-2xl bg-white dark:bg-[#0D1422] border border-[#E4DCCF] dark:border-[#1E2A40] shadow-sm overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880]"
      aria-label="Historical Case Development Timeline — Use Left and Right arrow keys to switch landmark cases"
    >
      {/* Timeline Header Bar */}
      <div className="p-5 sm:px-6 bg-[#F6F1E6] dark:bg-[#111928] border-b border-[#E4DCCF] dark:border-[#1E2A40] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880] font-semibold flex-wrap">
            <History className="w-3.5 h-3.5 shrink-0" />
            <span>
              {language === 'sw'
                ? 'Mlolongo wa Historia ya Kesi na Tarehe za Mahakama'
                : 'Historical Case Chronology & Key Court Dates'}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-cinzel font-semibold text-[#121A28] dark:text-white mt-1 truncate">
            {brief.matterName}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-[#5C6A80] dark:text-[#8C98AE] font-mono tabular-nums flex-wrap">
            <span>
              {milestones.length}{' '}
              {language === 'sw' ? 'Hatua Muhimu' : 'Judicial Milestones'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {language === 'sw' ? 'Kipindi' : 'Timeline Span'}: {spanLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {language === 'sw' ? 'Hatua Iliyochaguliwa' : 'Stage'}: {activeIndex + 1}/
              {milestones.length}
            </span>
            {onNavigateCase && totalCases > 1 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#8C6B32] dark:text-[#C5A880]">
                  {language === 'sw' ? 'Tumia mishale ← → kubadili kesi' : '← / → Cases · ↑ / ↓ Stages'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Landmark Case & Milestone Step Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onNavigateCase && totalCases > 1 && (
            <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-white/80 dark:bg-[#0B111C] border border-[#E4DCCF] dark:border-[#24324A] mr-1">
              <button
                type="button"
                onClick={() => onNavigateCase('prev')}
                aria-label="Previous landmark case (ArrowLeft)"
                title="Previous landmark case (←)"
                className="p-1.5 rounded-md text-[#4A576D] dark:text-[#CBD5E1] hover:bg-[#F5EFE4] dark:hover:bg-[#172132] hover:text-[#121A28] dark:hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] font-semibold text-[#8C6B32] dark:text-[#E4C999] tabular-nums whitespace-nowrap">
                {language === 'sw' ? 'Kesi' : 'Case'} {caseIndex + 1}/{totalCases}
              </span>
              <button
                type="button"
                onClick={() => onNavigateCase('next')}
                aria-label="Next landmark case (ArrowRight)"
                title="Next landmark case (→)"
                className="p-1.5 rounded-md text-[#4A576D] dark:text-[#CBD5E1] hover:bg-[#F5EFE4] dark:hover:bg-[#172132] hover:text-[#121A28] dark:hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => scrollToMilestone(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#172132] border border-[#E4DCCF] dark:border-[#24324A] text-xs font-medium text-[#4A576D] dark:text-[#CBD5E1] hover:border-[#C5A880] hover:text-[#121A28] dark:hover:text-white disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Iliyotangulia' : 'Previous'}</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToMilestone(activeIndex + 1)}
            disabled={activeIndex === milestones.length - 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#C5A880] text-[#0A0E17] text-xs font-semibold hover:brightness-110 disabled:opacity-40 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>{language === 'sw' ? 'Inayofuata' : 'Next Milestone'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hairline Timeline Scroll Progress Track */}
      <div
        className="w-full h-[2px] bg-[#EFE8DA] dark:bg-[#172133] overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(scrollPct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Timeline scroll progress"
      >
        <div
          className="h-full bg-gradient-to-r from-[#B38F5B] to-[#E4C999] transition-all duration-150"
          style={{
            width: `${Math.max(
              scrollPct,
              ((activeIndex + 1) / milestones.length) * 100
            )}%`,
          }}
        />
      </div>

      {/* Scrollable Vertical Timeline Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleContainerScroll}
        className="max-h-[400px] overflow-y-auto px-5 sm:px-8 py-6 scroll-smooth"
      >
        <div className="relative pl-8 sm:pl-10 space-y-5">
          {/* Continuous Vertical Hairline Spine */}
          <div
            aria-hidden="true"
            className="absolute left-[13px] sm:left-[15px] top-3 bottom-3 w-px bg-gradient-to-b from-[#C5A880] via-[#D9CEB8] dark:via-[#26344D] to-[#C5A880]/40"
          />

          {milestones.map((item, idx) => {
            const isActive = idx === activeIndex;
            const localizedStage = language === 'sw' ? item.stageTagSw : item.stageTag;
            const localizedTitle = language === 'sw' ? item.titleSw : item.title;
            const localizedDesc = language === 'sw' ? item.descriptionSw : item.description;

            return (
              <div key={item.id} className="relative">
                {/* Timeline Axis Marker */}
                <div
                  aria-hidden="true"
                  className={`absolute -left-8 sm:-left-10 top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center font-mono text-[11px] font-bold tabular-nums transition-colors ${
                    isActive
                      ? 'bg-[#C5A880] border-[#C5A880] text-[#0A0E17] shadow-md shadow-[#C5A880]/25'
                      : 'bg-white dark:bg-[#0F1727] border-[#D9CEB8] dark:border-[#2A3954] text-[#8C6B32] dark:text-[#C5A880]'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </div>

                {/* Milestone Entry Button Card */}
                <button
                  type="button"
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  onClick={() => scrollToMilestone(idx)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FAF6EE] dark:bg-[#131C2E] border-[#C5A880] shadow-sm'
                      : 'bg-[#FAF8F5] dark:bg-[#0F1624] border-[#E4DCCF] dark:border-[#1B263B] hover:border-[#C5A880]/60'
                  }`}
                >
                  {/* Unboxed Metadata Line: Date · Stage · Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2 flex-wrap text-[#5C6A80] dark:text-[#8C98AE]">
                      <span className="inline-flex items-center gap-1 font-mono font-semibold text-[#8C6B32] dark:text-[#E4C999] tabular-nums">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{item.date}</span>
                      </span>
                      <span aria-hidden="true" className="text-[#C8BFA8] dark:text-[#3D4C63]">
                        ·
                      </span>
                      <span className="font-medium text-[#324056] dark:text-[#CBD5E1]">
                        {localizedStage}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#5C6A80] dark:text-[#94A3B8]">
                      <span className="text-[#8C6B32] dark:text-[#C5A880]">
                        {getStatusIcon(item.status)}
                      </span>
                      <span>{getStatusLabel(item.status)}</span>
                    </div>
                  </div>

                  {/* Milestone Title */}
                  <h4 className="mt-1.5 text-sm sm:text-base font-cinzel font-semibold text-[#121A28] dark:text-white leading-snug">
                    {localizedTitle}
                  </h4>

                  {/* Procedural Narrative */}
                  <p className="mt-1.5 text-xs text-[#4A576D] dark:text-[#A6B4CD] leading-relaxed">
                    {localizedDesc}
                  </p>

                  {/* Court Forum & Docket Footer */}
                  <div className="mt-3 pt-2.5 border-t border-[#EFE8DA] dark:border-[#1B263B] flex items-center justify-between gap-2 flex-wrap text-[11px] font-mono text-[#5C6A80] dark:text-[#78869E]">
                    <span>{item.courtOrForum}</span>
                    <span className="text-[#8C6B32] dark:text-[#C5A880] font-semibold">
                      {item.docketRef}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
