import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Scale, Landmark, HelpCircle, ArrowRight, CornerDownLeft, Sparkles, Building2, ShieldCheck, FileText } from 'lucide-react';
import { PRACTICE_AREAS, CASE_BRIEFS, SAMPLE_CLIENT_MATTER, MatterDocument } from '../data/firmData';
import { FAQS_DATA } from './FAQ';
import { useLanguage } from '../context/LanguageContext';

export type SearchCategory = 'all' | 'practice' | 'case' | 'faq' | 'document';

export interface SearchResultItem {
  id: string;
  type: 'practice' | 'case' | 'faq' | 'document';
  title: string;
  subtitle?: string;
  snippet: string;
  meta: string;
  statutes?: string[];
  actionType: 'open-practice' | 'open-case' | 'open-faq' | 'open-document';
  rawId: string;
}

interface SearchIndexModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPractice: (practiceId: string) => void;
  onSelectCase: (caseId: string) => void;
  onSelectFaq: (faqId: string) => void;
  onOpenConsultation: (practice?: string, estimate?: string, advocate?: string) => void;
  onOpenVault?: () => void;
}

export const SearchIndexModal: React.FC<SearchIndexModalProps> = ({
  isOpen,
  onClose,
  onSelectPractice,
  onSelectCase,
  onSelectFaq,
  onOpenConsultation,
  onOpenVault,
}) => {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Focus input automatically on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // Construct search items catalog
  const allItems: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [];

    // Practice Areas
    PRACTICE_AREAS.forEach((p) => {
      items.push({
        id: `practice-${p.id}`,
        type: 'practice',
        title: p.title,
        subtitle: p.subtitle,
        snippet: p.description,
        meta: `Lead: ${p.leadAdvocate} · ${p.capabilities.slice(0, 3).join(', ')}`,
        statutes: p.keyActs,
        actionType: 'open-practice',
        rawId: p.id,
      });
    });

    // Case Precedents
    CASE_BRIEFS.forEach((c) => {
      items.push({
        id: `case-${c.id}`,
        type: 'case',
        title: c.matterName,
        subtitle: `${c.forum} · ${c.year}`,
        snippet: c.summary,
        meta: `Matter Value: ${c.value} · Impact: ${c.impact}`,
        actionType: 'open-case',
        rawId: c.id,
      });
    });

    // Statutory FAQs
    FAQS_DATA.forEach((f) => {
      items.push({
        id: `faq-${f.id}`,
        type: 'faq',
        title: language === 'sw' ? f.questionSw : f.questionEn,
        snippet: language === 'sw' ? f.answerSw : f.answerEn,
        meta: `Statutory Guidance · ${f.statutes.join(' · ')}`,
        statutes: f.statutes,
        actionType: 'open-faq',
        rawId: f.id,
      });
    });

    // Certified Court Documents & Pleadings
    SAMPLE_CLIENT_MATTER.documents.forEach((d: MatterDocument) => {
      items.push({
        id: `doc-${d.name}`,
        type: 'document',
        title: d.name,
        subtitle: `${d.category} · ${d.date} · Signatory: ${d.signatory}`,
        snippet: d.summary,
        meta: `CTS Hash: ${d.ctsHash} · File Size: ${d.size}`,
        statutes: ['Evidence Act (Cap 80 S. 106B)', 'Civil Procedure Rules'],
        actionType: 'open-document',
        rawId: d.name,
      });
    });

    return items;
  }, [language]);

  // Filter items based on query & category
  const filteredResults = useMemo(() => {
    return allItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.type !== selectedCategory) {
        return false;
      }

      if (!query.trim()) return true;

      const q = query.toLowerCase();
      const titleMatch = item.title.toLowerCase().includes(q);
      const subtitleMatch = item.subtitle ? item.subtitle.toLowerCase().includes(q) : false;
      const snippetMatch = item.snippet.toLowerCase().includes(q);
      const metaMatch = item.meta.toLowerCase().includes(q);
      const statutesMatch = item.statutes ? item.statutes.some(s => s.toLowerCase().includes(q)) : false;

      return titleMatch || subtitleMatch || snippetMatch || metaMatch || statutesMatch;
    });
  }, [allItems, query, selectedCategory]);

  // Keep selection bounded
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredResults.length ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredResults[selectedIndex];
        if (selected) {
          executeSelection(selected);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex]);

  // Ensure active element scrolls into view in list
  useEffect(() => {
    const container = listContainerRef.current;
    if (!container) return;
    const activeEl = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const executeSelection = (item: SearchResultItem) => {
    onClose();
    if (item.actionType === 'open-practice') {
      const section = document.getElementById('practice');
      section?.scrollIntoView({ behavior: 'smooth' });
      onSelectPractice(item.rawId);
    } else if (item.actionType === 'open-case') {
      const section = document.getElementById('cases');
      section?.scrollIntoView({ behavior: 'smooth' });
      onSelectCase(item.rawId);
    } else if (item.actionType === 'open-faq') {
      const section = document.getElementById('faq');
      section?.scrollIntoView({ behavior: 'smooth' });
      onSelectFaq(item.rawId);
    } else if (item.actionType === 'open-document') {
      if (onOpenVault) {
        onOpenVault();
      }
    }
  };

  const quickTopics = [
    { label: 'Arbitration', query: 'Arbitration' },
    { label: 'ArdhiSasa', query: 'ArdhiSasa' },
    { label: 'Beneficial Ownership', query: 'Beneficial Ownership' },
    { label: 'Supreme Court', query: 'Supreme Court' },
    { label: 'Section 134 Privilege', query: 'Section 134' },
    { label: 'ARO Legal Fees', query: 'ARO' },
    { label: 'Injunctions', query: 'Injunction' },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#090D16] border border-[#222E42] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Chambers Legal Index Search"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-[#1C263A] bg-[#0E1522] gap-3">
          <Search className="w-5 h-5 text-[#C5A880] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-[#64748B] focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-[#718096] hover:text-white"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#172132] text-[#8C98AE] rounded border border-[#24334C]">
            ESC
          </kbd>
        </div>

        {/* Filter Category Tabs & Quick Suggestions */}
        <div className="px-5 py-3 border-b border-[#172132] bg-[#0A0F1A] flex flex-wrap items-center justify-between gap-2.5">
          {/* Segmented Category Buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-[#121A28] rounded-lg border border-[#1E2B3E] text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              {t('search.all')}
            </button>
            <button
              onClick={() => setSelectedCategory('practice')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedCategory === 'practice'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              {t('search.practice')}
            </button>
            <button
              onClick={() => setSelectedCategory('case')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedCategory === 'case'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              {t('search.precedents')}
            </button>
            <button
              onClick={() => setSelectedCategory('faq')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedCategory === 'faq'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              {t('search.faqs')}
            </button>
            <button
              onClick={() => setSelectedCategory('document')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedCategory === 'document'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              {language === 'sw' ? 'Nyaraka za Kesi' : 'Court Documents'}
            </button>
          </div>

          {/* Result Count Indicator */}
          <span className="text-[11px] font-mono text-[#718096]">
            {filteredResults.length} {filteredResults.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* Quick Topics Tag Bar (when query is empty) */}
        {!query && (
          <div className="px-5 py-2.5 border-b border-[#141E2D] bg-[#070B13] flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C5A880] shrink-0">
              {t('search.quickSuggestions')}
            </span>
            {quickTopics.map((topic) => (
              <button
                key={topic.label}
                onClick={() => setQuery(topic.query)}
                className="px-2.5 py-0.5 rounded bg-[#121927] hover:bg-[#1A2438] text-[#A6B2C4] hover:text-[#DFBE82] border border-[#212E44] text-[11px] transition-colors whitespace-nowrap shrink-0"
              >
                {topic.label}
              </button>
            ))}
          </div>
        )}

        {/* Results Scrollable List */}
        <div
          ref={listContainerRef}
          className="flex-1 overflow-y-auto divide-y divide-[#151F2F] p-2 space-y-1"
        >
          {filteredResults.length === 0 ? (
            <div className="p-12 text-center">
              <Search className="w-8 h-8 text-[#475569] mx-auto mb-3" />
              <p className="text-sm text-[#8C98AE]">{t('search.noResults')}</p>
              <button
                onClick={() => {
                  setQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-3 text-xs text-[#C5A880] hover:underline"
              >
                Clear search and view all indexed matters
              </button>
            </div>
          ) : (
            filteredResults.map((item, index) => {
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id}
                  data-index={index}
                  onClick={() => executeSelection(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-4 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-4 ${
                    isSelected
                      ? 'bg-[#121B2A] border border-[#C5A880]/50 shadow-md ring-1 ring-[#C5A880]/20'
                      : 'hover:bg-[#0E1522] border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Category Icon */}
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        item.type === 'practice'
                          ? 'bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30'
                          : item.type === 'case'
                          ? 'bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/30'
                          : item.type === 'faq'
                          ? 'bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30'
                          : 'bg-[#C5A880]/20 text-[#E4C999] border border-[#C5A880]/40'
                      }`}
                    >
                      {item.type === 'practice' && <Landmark className="w-4 h-4" />}
                      {item.type === 'case' && <Scale className="w-4 h-4" />}
                      {item.type === 'faq' && <HelpCircle className="w-4 h-4" />}
                      {item.type === 'document' && <FileText className="w-4 h-4" />}
                    </div>

                    <div>
                      {/* Category Label + Subtitle */}
                      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider mb-1">
                        <span
                          className={`font-semibold ${
                            item.type === 'practice'
                              ? 'text-[#C5A880]'
                              : item.type === 'case'
                              ? 'text-[#60A5FA]'
                              : item.type === 'faq'
                              ? 'text-[#34D399]'
                              : 'text-[#E4C999]'
                          }`}
                        >
                          {item.type === 'practice'
                            ? 'Practice Portfolio'
                            : item.type === 'case'
                            ? 'Judicial Precedent'
                            : item.type === 'faq'
                            ? 'Statutory FAQ'
                            : 'Court Filing & Exhibit'}
                        </span>
                        {item.subtitle && (
                          <>
                            <span className="text-[#3B4861]">·</span>
                            <span className="text-[#8C98AE]">{item.subtitle}</span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h4
                        className={`text-sm sm:text-base font-serif font-bold transition-colors ${
                          isSelected ? 'text-[#DFBE82]' : 'text-white'
                        }`}
                      >
                        {item.title}
                      </h4>

                      {/* Excerpt Snippet */}
                      <p className="text-xs text-[#9BA5B7] line-clamp-2 mt-1 leading-relaxed">
                        {item.snippet}
                      </p>

                      {/* Unboxed Meta / Statutes */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#718096] font-mono mt-2">
                        <span>{item.meta}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Hint */}
                  <div className="hidden sm:flex items-center gap-2 text-xs text-[#C5A880] shrink-0 mt-1">
                    <span className="text-[11px] font-medium">{t('search.viewItem')}</span>
                    <CornerDownLeft className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-5 py-3 border-t border-[#1C263A] bg-[#0A0D15] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#718096]">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px]">
              <kbd className="px-1.5 py-0.5 bg-[#172132] text-[#A6B2C4] rounded border border-[#24334C]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-[#172132] text-[#A6B2C4] rounded border border-[#24334C]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px]">
              <kbd className="px-1.5 py-0.5 bg-[#172132] text-[#A6B2C4] rounded border border-[#24334C]">↵</kbd>
              <span>to open</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#A6B2C4]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Privileged Chambers Index</span>
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenConsultation(query || 'Search Inquiry');
            }}
            className="px-4 py-1.5 bg-[#C5A880]/15 hover:bg-[#C5A880]/25 text-[#DFBE82] border border-[#C5A880]/40 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>{t('search.instructItem')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
