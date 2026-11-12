import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Search, X, Scale, ChevronRight } from 'lucide-react';
import {
  LEGAL_GLOSSARY_TERMS,
  LegalGlossaryTerm,
  GlossaryCategory,
  segmentTextWithGlossary,
} from '../data/legalGlossary';
import { useLanguage } from '../context/LanguageContext';

interface ActiveTooltipState {
  term: LegalGlossaryTerm;
  anchorRect: DOMRect;
  pinned: boolean;
}

interface GlossaryAnnotatedTextProps {
  text: string;
  enabled?: boolean;
  onSelectTerm?: (term: LegalGlossaryTerm) => void;
}

export const GlossaryAnnotatedText: React.FC<GlossaryAnnotatedTextProps> = ({
  text,
  enabled = true,
  onSelectTerm,
}) => {
  const { language, t } = useLanguage();
  const [tooltip, setTooltip] = useState<ActiveTooltipState | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const segments = useMemo(() => {
    if (!enabled) return [{ text, term: null }];
    return segmentTextWithGlossary(text);
  }, [text, enabled]);

  const clearCloseTimer = useCallback(() => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimeoutRef.current = window.setTimeout(() => {
      setTooltip((prev) => (prev && !prev.pinned ? null : prev));
    }, 140);
  }, [clearCloseTimer]);

  const showTooltipForElement = useCallback(
    (term: LegalGlossaryTerm, el: HTMLElement, pinned = false) => {
      clearCloseTimer();
      const rect = el.getBoundingClientRect();
      setTooltip({ term, anchorRect: rect, pinned });
    },
    [clearCloseTimer]
  );

  // Dismiss tooltip on scroll, Escape, or outside click when pinned
  useEffect(() => {
    if (!tooltip) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTooltip(null);
    };

    const handleScroll = () => {
      setTooltip(null);
    };

    const handleOutsidePointer = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        !target.closest('[data-glossary-tooltip]') &&
        !target.closest('[data-glossary-trigger]')
      ) {
        setTooltip(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('mousedown', handleOutsidePointer);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousedown', handleOutsidePointer);
    };
  }, [tooltip]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  const renderPortalTooltip = () => {
    if (!tooltip || typeof document === 'undefined') return null;

    const { term, anchorRect } = tooltip;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const tooltipWidth = Math.min(340, viewportW - 24);
    const centerX = anchorRect.left + anchorRect.width / 2;
    const clampedLeft = Math.max(
      12,
      Math.min(centerX - tooltipWidth / 2, viewportW - tooltipWidth - 12)
    );

    // Flip below if not enough vertical room above the term
    const showAbove = anchorRect.top > 210 || anchorRect.bottom + 200 > viewportH;
    const topPos = showAbove ? anchorRect.top - 10 : anchorRect.bottom + 10;

    const localizedTitle = language === 'sw' ? term.termSw : term.term;
    const localizedCategory = language === 'sw' ? term.categorySw : term.category;
    const localizedDef = language === 'sw' ? term.definitionSw : term.definition;

    return createPortal(
      <div
        data-glossary-tooltip
        role="tooltip"
        onMouseEnter={clearCloseTimer}
        onMouseLeave={scheduleClose}
        style={{
          position: 'fixed',
          left: `${clampedLeft}px`,
          top: `${topPos}px`,
          width: `${tooltipWidth}px`,
          transform: showAbove ? 'translateY(-100%)' : 'translateY(0)',
          zIndex: 80,
        }}
        className="rounded-xl bg-white dark:bg-[#0D1422] border border-[#D9CEB8] dark:border-[#C5A880]/45 shadow-2xl p-4 text-left pointer-events-auto transition-opacity duration-150"
      >
        <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-[#EFE8DA] dark:border-[#1E2A3F]">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#8C6B32] dark:text-[#C5A880] mb-0.5">
              <BookOpen className="w-3 h-3 shrink-0" />
              <span>{t('glossary.termLabel')}</span>
              <span aria-hidden="true" className="text-[#C8BFA8] dark:text-[#3D4C63]">
                ·
              </span>
              <span className="truncate">{localizedCategory}</span>
            </div>
            <h4 className="text-sm font-cinzel font-semibold text-[#121A28] dark:text-white leading-snug">
              {localizedTitle}
            </h4>
          </div>

          <button
            type="button"
            onClick={() => setTooltip(null)}
            aria-label="Close definition tooltip"
            className="p-1 text-[#6F7A8F] hover:text-[#121A28] dark:hover:text-white rounded-md transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-[#324056] dark:text-[#CBD5E1] leading-relaxed">
          {localizedDef}
        </p>

        <div className="mt-2.5 pt-2 border-t border-[#EFE8DA] dark:border-[#1B263B] flex items-center justify-between gap-2 text-[11px] font-mono text-[#5C6A80] dark:text-[#8C98AE]">
          <span className="truncate">{term.statuteRef}</span>
          {onSelectTerm && (
            <button
              type="button"
              onClick={() => {
                onSelectTerm(term);
                setTooltip(null);
              }}
              className="text-[#8C6B32] dark:text-[#E4C999] hover:underline font-sans font-semibold shrink-0 inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>{t('glossary.viewInIndex')}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>,
      document.body
    );
  };

  if (!enabled) {
    return <>{text}</>;
  }

  return (
    <>
      {segments.map((segment, index) => {
        if (!segment.term) {
          return <React.Fragment key={index}>{segment.text}</React.Fragment>;
        }

        const term = segment.term;
        const isCurrentlyActive = tooltip?.term.id === term.id;

        return (
          <span
            key={`${term.id}-${index}`}
            data-glossary-trigger
            role="button"
            tabIndex={0}
            aria-label={`${segment.text} — ${
              language === 'sw' ? term.definitionSw : term.definition
            }`}
            onMouseEnter={(e) => showTooltipForElement(term, e.currentTarget, false)}
            onMouseLeave={scheduleClose}
            onFocus={(e) => showTooltipForElement(term, e.currentTarget, false)}
            onBlur={scheduleClose}
            onClick={(e) => {
              e.stopPropagation();
              if (tooltip?.term.id === term.id && tooltip.pinned) {
                setTooltip(null);
              } else {
                showTooltipForElement(term, e.currentTarget, true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showTooltipForElement(term, e.currentTarget, true);
              }
            }}
            className={`inline cursor-help rounded-sm px-0.5 transition-colors underline decoration-dotted decoration-[#8C6B32] dark:decoration-[#C5A880] underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] ${
              isCurrentlyActive
                ? 'bg-[#C5A880]/30 dark:bg-[#C5A880]/25 text-[#5E4418] dark:text-[#FFF3DF]'
                : 'bg-[#C5A880]/12 dark:bg-[#C5A880]/14 hover:bg-[#C5A880]/25 text-[#5E4418] dark:text-[#F3E2C8]'
            }`}
          >
            {segment.text}
          </span>
        );
      })}
      {renderPortalTooltip()}
    </>
  );
};

interface LegalGlossaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  highlightedTermId?: string | null;
}

const GLOSSARY_CATEGORIES: Array<'all' | GlossaryCategory> = [
  'all',
  'Property & Conveyancing',
  'Arbitration & Procedure',
  'Corporate & Insolvency',
];

export const LegalGlossaryPanel: React.FC<LegalGlossaryDrawerProps> = ({
  isOpen,
  onClose,
  highlightedTermId,
}) => {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'all' | GlossaryCategory>('all');
  const [termQuery, setTermQuery] = useState('');

  useEffect(() => {
    if (!highlightedTermId || !isOpen) return;
    const match = LEGAL_GLOSSARY_TERMS.find((item) => item.id === highlightedTermId);
    if (match) {
      setActiveCategory('all');
      setTermQuery('');
    }
  }, [highlightedTermId, isOpen]);

  const filteredTerms = useMemo(() => {
    const q = termQuery.trim().toLowerCase();
    return LEGAL_GLOSSARY_TERMS.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (!q) return true;
      return (
        item.term.toLowerCase().includes(q) ||
        item.termSw.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.statuteRef.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, termQuery]);

  if (!isOpen) return null;

  return (
    <div
      id="legal-glossary-directory"
      className="mb-10 rounded-2xl bg-white dark:bg-[#0D1422] border border-[#D9CEB8] dark:border-[#C5A880]/35 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 sm:p-6 bg-[#F6F1E6] dark:bg-[#111928] border-b border-[#E4DCCF] dark:border-[#1E2A3F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880] font-semibold">
            <Scale className="w-3.5 h-3.5" />
            <span>{t('glossary.kicker')}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-cinzel text-[#121A28] dark:text-white mt-1">
            {t('glossary.title')}
          </h3>
          <p className="text-xs text-[#4A576D] dark:text-[#9BA5B7] mt-1">
            {t('glossary.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Legal Glossary panel"
          className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-[#172132] border border-[#E4DCCF] dark:border-[#24324A] text-xs font-medium text-[#4A576D] dark:text-[#CBD5E1] hover:text-[#121A28] dark:hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
          <span>{t('glossary.hidePanel')}</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="px-5 sm:px-6 py-4 border-b border-[#EFE8DA] dark:border-[#1A2436] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {GLOSSARY_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat;
            const label =
              cat === 'all'
                ? `${t('glossary.allTerms')} (${LEGAL_GLOSSARY_TERMS.length})`
                : cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-[#C5A880] text-[#0A0E17] border-[#C5A880] font-semibold'
                    : 'bg-[#FAF8F5] dark:bg-[#121A2A] text-[#5C6A80] dark:text-[#94A3B8] border-[#E4DCCF] dark:border-[#1F2B40] hover:text-[#121A28] dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={termQuery}
            onChange={(e) => setTermQuery(e.target.value)}
            placeholder={t('glossary.searchPlaceholder')}
            aria-label={t('glossary.searchPlaceholder')}
            className="w-full pl-8 pr-3 py-2 bg-[#FAF8F5] dark:bg-[#121A2A] border border-[#E4DCCF] dark:border-[#1F2B40] rounded-lg text-xs text-[#121A28] dark:text-white placeholder-[#7A869B] dark:placeholder-[#64748B] focus:outline-none focus:border-[#C5A880]"
          />
        </div>
      </div>

      {/* Terms Grid */}
      <div className="p-5 sm:p-6 max-h-[380px] overflow-y-auto">
        {filteredTerms.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#5C6A80] dark:text-[#8C98AE]">
            {t('glossary.noTerms')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTerms.map((item) => {
              const isFocused = highlightedTermId === item.id;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    isFocused
                      ? 'bg-[#F5EFE4] dark:bg-[#162135] border-[#C5A880]'
                      : 'bg-[#FAF8F5] dark:bg-[#101827] border-[#E4DCCF] dark:border-[#1C263A]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8C6B32] dark:text-[#C5A880] mb-1">
                    <span>{language === 'sw' ? item.categorySw : item.category}</span>
                  </div>
                  <h4 className="text-sm font-cinzel font-semibold text-[#121A28] dark:text-white">
                    {language === 'sw' ? item.termSw : item.term}
                  </h4>
                  <p className="mt-1.5 text-xs text-[#4A576D] dark:text-[#A6B4CD] leading-relaxed">
                    {language === 'sw' ? item.definitionSw : item.definition}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-[#E4DCCF] dark:border-[#1D283D] text-[11px] font-mono text-[#5C6A80] dark:text-[#78869E]">
                    {item.statuteRef}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
