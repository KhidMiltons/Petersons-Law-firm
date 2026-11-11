import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, Landmark, Home, Compass, ArrowLeft, 
  ChevronDown, ExternalLink, Scale, BookOpen, Building2, 
  FileText, ShieldCheck, Calculator, History, Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface BreadcrumbItem {
  id: string;
  label: string;
  type?: 'home' | 'section' | 'subitem';
  targetHash?: string;
  subTitle?: string;
}

interface GlobalBreadcrumbsProps {
  activeSection: string;
  subItem?: {
    type: 'practice' | 'case' | 'insight' | 'portal';
    title: string;
    parentSection: string;
  } | null;
  journeyHistory: string[];
  onNavigateSection: (sectionId: string) => void;
  onClearSubItem?: () => void;
}

const SECTION_CONFIG: Record<string, { en: string; sw: string; icon: string; hash: string }> = {
  hero: { en: 'Overview', sw: 'Muhtasari', icon: 'Landmark', hash: '#' },
  practice: { en: 'Practice Portfolios', sw: 'Nyanja za Kisheria', icon: 'Scale', hash: '#practice' },
  advocates: { en: 'Roll of Advocates', sw: 'Mawakili Wetu', icon: 'Building2', hash: '#advocates' },
  cases: { en: 'Landmark Precedents', sw: 'Maamuzi ya Mahakama', icon: 'FileText', hash: '#cases' },
  'fee-calculator': { en: 'ARO Fee Calculator', sw: 'Kikokotoo cha Ada', icon: 'Calculator', hash: '#fee-calculator' },
  insights: { en: 'Legal Insights & Review', sw: 'Uchambuzi wa Sheria', icon: 'BookOpen', hash: '#insights' },
  'east-africa-reach': { en: 'East Africa Reach', sw: 'Ufikiaji wa Afrika Mashariki', icon: 'Compass', hash: '#east-africa-reach' },
  awards: { en: 'Honors & Accreditations', sw: 'Tuzo na Heshima', icon: 'Trophy', hash: '#awards' },
  chambers: { en: 'Nairobi Chambers & Courts', sw: 'Ofisi za Nairobi', icon: 'Building2', hash: '#chambers' },
  faq: { en: 'Statutory FAQ', sw: 'Maswali ya Kisheria', icon: 'FileText', hash: '#faq' },
  portal: { en: 'Secure Client Portal', sw: 'Tovuti Salama ya Wateja', icon: 'ShieldCheck', hash: '#vault' }
};

export const GlobalBreadcrumbs: React.FC<GlobalBreadcrumbsProps> = ({
  activeSection,
  subItem,
  journeyHistory,
  onNavigateSection,
  onClearSubItem
}) => {
  const { language, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [journeyPopoverOpen, setJourneyPopoverOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (journeyRef.current && !journeyRef.current.contains(e.target as Node)) {
        setJourneyPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getSectionLabel = (sectionId: string) => {
    const config = SECTION_CONFIG[sectionId];
    if (!config) return sectionId;
    return language === 'sw' ? config.sw : config.en;
  };

  const currentSectionKey = subItem ? subItem.parentSection : (activeSection || 'practice');
  const currentSectionLabel = getSectionLabel(currentSectionKey);

  // Don't show redundant crumbs when at very top of hero without any sub-item
  const isAtRootHero = activeSection === 'hero' && !subItem;

  return (
    <nav
      aria-label="Chambers Breadcrumb Navigation"
      className="sticky top-[108px] sm:top-[116px] z-30 bg-[#090D15]/95 backdrop-blur-md border-b border-[#1C263A]/80 shadow-md text-xs transition-all duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
        
        {/* Left: Interactive Breadcrumb Chain */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 flex-1">
          
          {/* Level 1: Root Chambers Home */}
          <button
            onClick={() => {
              if (onClearSubItem) onClearSubItem();
              onNavigateSection('hero');
            }}
            className="flex items-center gap-1.5 text-[#8C98AE] hover:text-[#DFBE82] transition-colors shrink-0 group focus:outline-none"
            title="Return to Chambers Overview (Top)"
          >
            <Landmark className="w-3.5 h-3.5 text-[#C5A880] group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-white group-hover:text-[#DFBE82]">
              {language === 'sw' ? 'Mwanzo' : 'PAA Chambers'}
            </span>
          </button>

          {/* Separator */}
          <ChevronRight className="w-3.5 h-3.5 text-[#C5A880]/60 shrink-0" />

          {/* Level 2: Section Crumb with Quick-Jump Dropdown */}
          <div className="relative inline-flex items-center shrink-0" ref={dropdownRef}>
            <button
              onClick={() => {
                if (subItem && onClearSubItem) {
                  onClearSubItem();
                }
                onNavigateSection(currentSectionKey);
              }}
              className={`flex items-center gap-1.5 transition-colors focus:outline-none ${
                !subItem
                  ? 'text-[#C5A880] font-bold'
                  : 'text-[#8C98AE] hover:text-[#DFBE82]'
              }`}
              title={`Jump to ${currentSectionLabel}`}
            >
              <span>{currentSectionLabel}</span>
            </button>

            {/* Quick-Jump Section Dropdown Trigger */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-1 text-[#6F7E94] hover:text-white transition-colors ml-0.5 rounded"
              title="Jump to another chambers department"
              aria-label="Browse chambers sections"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Section Quick Jump Popover */}
            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-[#0E1522] border border-[#C5A880]/40 rounded-xl shadow-2xl py-1.5 z-50 animate-fadeIn text-xs font-sans">
                <div className="px-3 py-1.5 border-b border-[#1E293B] text-[10px] uppercase font-mono tracking-wider text-[#64748B]">
                  {language === 'sw' ? 'Nenda Sehemu ya Tovuti' : 'Teleport to Chambers Section'}
                </div>
                {Object.entries(SECTION_CONFIG).filter(([id]) => id !== 'hero').map(([secId, cfg]) => (
                  <button
                    key={secId}
                    onClick={() => {
                      if (onClearSubItem) onClearSubItem();
                      onNavigateSection(secId);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                      currentSectionKey === secId
                        ? 'bg-[#152136] text-[#E4C999] font-semibold'
                        : 'text-[#A6B2C4] hover:bg-[#121927] hover:text-white'
                    }`}
                  >
                    <span>{language === 'sw' ? cfg.sw : cfg.en}</span>
                    {currentSectionKey === secId && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Level 3: Active Sub-Item (Practice Area / Precedent / Insight Article) */}
          {subItem && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#C5A880]/60 shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0 max-w-[200px] sm:max-w-md truncate">
                <span className="text-[#E4C999] font-semibold truncate" title={subItem.title}>
                  {subItem.title}
                </span>
                {onClearSubItem && (
                  <button
                    onClick={onClearSubItem}
                    className="p-0.5 text-[#6F7E94] hover:text-white rounded hover:bg-[#1C273A] transition-colors"
                    title="Close item focus"
                  >
                    &times;
                  </button>
                )}
              </div>
            </>
          )}

        </div>

        {/* Right: User Journey History Tracker & Quick Orientation */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Journey History Tracker Popover */}
          <div className="relative inline-block" ref={journeyRef}>
            <button
              onClick={() => setJourneyPopoverOpen(!journeyPopoverOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111724] hover:bg-[#192336] border border-[#202E44] hover:border-[#C5A880]/40 text-[#8C98AE] hover:text-white transition-all text-[11px] font-mono group"
              title="View your browsing journey through chambers"
            >
              <History className="w-3.5 h-3.5 text-[#C5A880] group-hover:rotate-45 transition-transform" />
              <span className="hidden md:inline">
                {language === 'sw' ? 'Historia' : 'Journey'}: {journeyHistory.length}
              </span>
            </button>

            {journeyPopoverOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#0E1522] border border-[#C5A880]/40 rounded-xl shadow-2xl p-3 z-50 animate-fadeIn text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1C263A] text-[10px] uppercase font-mono tracking-wider text-[#64748B]">
                  <span>{language === 'sw' ? 'Mfululizo wa Safari Yako' : 'Your Chambers Journey Track'}</span>
                  <span className="text-[#C5A880]">{journeyHistory.length} Steps</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px]">
                  {journeyHistory.length === 0 ? (
                    <div className="text-slate-500 py-2 text-center italic">
                      Browsing history begins as you scroll.
                    </div>
                  ) : (
                    journeyHistory.slice(-6).map((stepId, idx) => {
                      const isLatest = idx === Math.min(5, journeyHistory.length - 1);
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (onClearSubItem) onClearSubItem();
                            onNavigateSection(stepId);
                            setJourneyPopoverOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left transition-colors ${
                            isLatest
                              ? 'bg-[#152136] text-[#E4C999] font-bold border border-[#C5A880]/30'
                              : 'text-[#9DAABF] hover:bg-[#141C2B] hover:text-white'
                          }`}
                        >
                          <span className="truncate">{getSectionLabel(stepId)}</span>
                          <span className="text-[10px] text-[#607086] shrink-0 font-sans">
                            {idx + 1}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-[#1C263A] text-[10px] text-slate-500 font-sans">
                  Click any milestone above to smoothly orient back to that section.
                </div>
              </div>
            )}
          </div>

          {/* Quick Back Up 1 Section */}
          <button
            onClick={() => {
              if (subItem && onClearSubItem) {
                onClearSubItem();
              } else {
                onNavigateSection('hero');
              }
            }}
            className="p-1 rounded-lg text-[#8C98AE] hover:text-white hover:bg-[#151F32] transition-colors"
            title="Step Back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </nav>
  );
};
