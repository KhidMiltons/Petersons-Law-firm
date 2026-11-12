import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LEGAL_ARTICLES, LegalArticle } from '../data/firmData';
import {
  ArrowRight,
  X,
  Printer,
  Clock,
  Share2,
  Check,
  Copy,
  ExternalLink,
  Search,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useReadingProgress } from '../context/ReadingProgressContext';
import { calculateArticleReadingTime } from '../utils/readingTime';
import { PrintFriendlyModal } from './PrintFriendlyModal';
import {
  formatLegalInsightForPrint,
  formatAllLegalInsightsForPrint,
  PrintDocument,
} from '../utils/printFriendly';
import {
  ARTICLE_SHARED_EVENT,
  getInitialShareCounts,
  incrementArticleShareCount,
} from '../utils/shareCounter';
import { GlossaryAnnotatedText, LegalGlossaryPanel } from './LegalGlossary';
import {
  extractGlossaryTermsFromTexts,
  LEGAL_GLOSSARY_TERMS,
  LegalGlossaryTerm,
} from '../data/legalGlossary';

interface LegalInsightsProps {
  onSelectArticle?: (article: LegalArticle | null) => void;
}

export const LegalInsights: React.FC<LegalInsightsProps> = ({ onSelectArticle }) => {
  const { language, t } = useLanguage();
  const { setLongFormProgress, clearLongFormProgress } = useReadingProgress();
  const [activeArticle, setActiveArticle] = useState<LegalArticle | null>(null);
  const [printDoc, setPrintDoc] = useState<PrintDocument | null>(null);
  const [modalScrollPct, setModalScrollPct] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [shareCounts, setShareCounts] = useState<Record<string, number>>(() =>
    getInitialShareCounts()
  );
  const [openShareMenuId, setOpenShareMenuId] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<{
    articleId: string;
    label: string;
  } | null>(null);
  const [glossaryEnabled, setGlossaryEnabled] = useState<boolean>(true);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [focusedGlossaryTermId, setFocusedGlossaryTermId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  const articleCategories = useMemo(
    () => Array.from(new Set(LEGAL_ARTICLES.map((a) => a.category))),
    []
  );

  const filteredArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return LEGAL_ARTICLES.filter((article) => {
      const categoryMatch =
        selectedCategory === 'all' || article.category === selectedCategory;
      if (!categoryMatch) return false;

      if (!query) return true;

      const haystack = [
        article.title,
        article.synopsis,
        article.category,
        article.citation,
        ...(article.content || []),
      ]
        .join(' ')
        .toLowerCase();

      return query
        .split(/\s+/)
        .filter(Boolean)
        .every((token) => haystack.includes(token));
    });
  }, [searchQuery, selectedCategory]);

  // Keep share counters synced across components & browser tabs
  useEffect(() => {
    const handleArticleShared = (e: Event) => {
      const customEvent = e as CustomEvent<{
        articleId: string;
        counts: Record<string, number>;
      }>;
      if (customEvent.detail?.counts) {
        setShareCounts(customEvent.detail.counts);
      }
    };

    const handleStorageSync = () => {
      setShareCounts(getInitialShareCounts());
    };

    window.addEventListener(ARTICLE_SHARED_EVENT, handleArticleShared);
    window.addEventListener('storage', handleStorageSync);
    return () => {
      window.removeEventListener(ARTICLE_SHARED_EVENT, handleArticleShared);
      window.removeEventListener('storage', handleStorageSync);
      if (feedbackTimerRef.current) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  // Close inline quick-share popover when clicking outside
  useEffect(() => {
    if (!openShareMenuId) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest('[data-share-popover]')) {
        setOpenShareMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [openShareMenuId]);

  const getArticleShareUrl = (articleId: string) => {
    if (typeof window === 'undefined') {
      return `https://paalawkenya.com/#insights?article=${articleId}`;
    }
    return `${window.location.origin}${window.location.pathname}#insights`;
  };

  const getLinkedInShareHref = (article: LegalArticle) => {
    const url = encodeURIComponent(getArticleShareUrl(article.id));
    return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  };

  const getXShareHref = (article: LegalArticle) => {
    const params = new URLSearchParams({
      text: `${article.title} — ${article.citation} | Petersons Angwenyi & Associates`,
      url: getArticleShareUrl(article.id),
      hashtags: 'KenyaLaw,CorporateLaw,LegalInsights',
    });
    return `https://twitter.com/intent/tweet?${params.toString()}`;
  };

  const triggerShareFeedback = (articleId: string, label: string) => {
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    setShareFeedback({ articleId, label });
    feedbackTimerRef.current = window.setTimeout(() => {
      setShareFeedback(null);
    }, 2400);
  };

  const recordArticleShare = (articleId: string, feedbackLabel: string) => {
    const next = incrementArticleShareCount(articleId);
    setShareCounts(next);
    setOpenShareMenuId(null);
    triggerShareFeedback(articleId, feedbackLabel);
  };

  const handleCopyArticleLink = async (article: LegalArticle) => {
    const shareUrl = getArticleShareUrl(article.id);
    const payload = `${article.title} (${article.citation})\n${shareUrl}`;
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      // Clipboard restricted in sandboxed frame; still confirm action gracefully
    }
    recordArticleShare(
      article.id,
      language === 'sw' ? '+1 · Kiungo kimenakiliwa' : '+1 · Link copied'
    );
  };

  const handleOpenArticle = (article: LegalArticle) => {
    setActiveArticle(article);
    const stats = calculateArticleReadingTime(article);
    setLongFormProgress(0, 'insight', article.title, stats);
    setModalScrollPct(0);
    if (onSelectArticle) onSelectArticle(article);
  };

  const handleCloseArticle = () => {
    setActiveArticle(null);
    clearLongFormProgress();
    setModalScrollPct(0);
    if (onSelectArticle) onSelectArticle(null);
  };

  // Directly triggers browser print dialog targeting #printable-document via index.css @media print
  const handlePrintSummary = (article: LegalArticle) => {
    const doc = formatLegalInsightForPrint(article);
    setPrintDoc(doc);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Directly triggers browser print dialog for full legal insights compendium
  const handlePrintSummaryCompendium = () => {
    const doc = formatAllLegalInsightsForPrint(LEGAL_ARTICLES);
    setPrintDoc(doc);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Keyboard shortcut listener: Cmd+P / Ctrl+P while reading article opens print preview
  useEffect(() => {
    if (!activeArticle) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrintSummary(activeArticle);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeArticle]);

  // Track page scroll through the #insights section when modal is closed
  useEffect(() => {
    if (activeArticle) return;

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight && rect.bottom > 0) {
        const totalHeight = rect.height + windowHeight;
        const progressDist = windowHeight - rect.top;
        const pct = Math.min(100, Math.max(0, (progressDist / totalHeight) * 100));

        if (pct >= 5 && pct <= 98) {
          setLongFormProgress(pct, 'section-insights', 'Legal Insights & Statutory Briefings');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeArticle, setLongFormProgress]);

  // Modal reader scroll tracker
  const handleModalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!activeArticle) return;
    const target = e.currentTarget;
    const maxScroll = target.scrollHeight - target.clientHeight;
    if (maxScroll <= 0) return;

    const pct = Math.min(100, Math.max(0, (target.scrollTop / maxScroll) * 100));
    setModalScrollPct(pct);
    const stats = calculateArticleReadingTime(activeArticle);
    setLongFormProgress(pct, 'insight', activeArticle.title, stats);
  };

  return (
    <section
      id="insights"
      ref={sectionRef}
      className="py-24 bg-[#FAF8F5] dark:bg-[#080B11] border-b border-[#E4DCCF] dark:border-[#1E2536] relative"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section Header with Dedicated Print Summary Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880] mb-3 font-semibold">
              <span>{t('insights.kicker')}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-cinzel text-[#121A28] dark:text-white tracking-tight">
              {t('insights.title')}
            </h2>
            <p className="mt-4 text-[#4A576D] dark:text-[#9BA5B7] leading-relaxed">
              {t('insights.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setGlossaryEnabled((prev) => !prev)}
              aria-pressed={glossaryEnabled}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                glossaryEnabled
                  ? 'bg-[#F5EFE4] dark:bg-[#141D2C] text-[#8C6B32] dark:text-[#E4C999] border-[#C5A880]/60'
                  : 'bg-white dark:bg-[#121927] text-[#5C6A80] dark:text-[#8C98AE] border-[#E4DCCF] dark:border-[#1C263A] hover:text-[#121A28] dark:hover:text-white'
              }`}
              title="Toggle inline Legal Glossary highlights and hover tooltip definitions"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>
                {glossaryEnabled ? t('glossary.toggleOn') : t('glossary.toggleOff')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsGlossaryOpen((prev) => !prev)}
              aria-expanded={isGlossaryOpen}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isGlossaryOpen
                  ? 'bg-[#C5A880] text-[#0A0E17] border-[#C5A880] shadow-sm'
                  : 'bg-white dark:bg-[#121927] hover:bg-[#F5EFE4] dark:hover:bg-[#162033] text-[#8C6B32] dark:text-[#C5A880] border-[#E4DCCF] dark:border-[#1C263A]'
              }`}
            >
              <span>
                {t('glossary.browse')} ({LEGAL_GLOSSARY_TERMS.length})
              </span>
            </button>

            <button
              type="button"
              onClick={handlePrintSummaryCompendium}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#121927] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#8C6B32] dark:text-[#C5A880] text-xs font-semibold rounded-xl border border-[#C5A880]/50 dark:border-[#C5A880]/40 hover:border-[#C5A880] transition-all shadow-sm group cursor-pointer whitespace-nowrap shrink-0"
              title="Print Summary of all legal insight articles using established #printable-document print styles"
            >
              <Printer className="w-4 h-4 text-[#8C6B32] dark:text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
              <span>Print Summary Compendium</span>
            </button>
          </div>
        </div>

        {/* Local Search & Topic Filter Toolbar */}
        <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E4DCCF] dark:border-[#1C263A]">
          {/* Topic Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                selectedCategory === 'all'
                  ? 'bg-[#C5A880] text-[#0A0E17] border-[#C5A880] shadow-sm'
                  : 'bg-white dark:bg-[#0E1522] text-[#5C6A80] dark:text-[#8C98AE] border-[#E4DCCF] dark:border-[#1C263A] hover:text-[#121A28] dark:hover:text-white hover:border-[#C5A880]/50'
              }`}
            >
              {t('insights.allTopics')} ({LEGAL_ARTICLES.length})
            </button>

            {articleCategories.map((category) => {
              const count = LEGAL_ARTICLES.filter((a) => a.category === category).length;
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#C5A880] text-[#0A0E17] border-[#C5A880] shadow-sm'
                      : 'bg-white dark:bg-[#0E1522] text-[#5C6A80] dark:text-[#8C98AE] border-[#E4DCCF] dark:border-[#1C263A] hover:text-[#121A28] dark:hover:text-white hover:border-[#C5A880]/50'
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>

          {/* Local Keyword Search Input */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('insights.searchPlaceholder')}
                aria-label={t('insights.searchPlaceholder')}
                className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-[#0E1522] border border-[#E4DCCF] dark:border-[#1C263A] rounded-xl text-xs text-[#121A28] dark:text-white placeholder-[#7A869B] dark:placeholder-[#64748B] focus:outline-none focus:border-[#C5A880] transition-colors shadow-sm dark:shadow-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear legal insights search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#8C98AE] hover:text-[#121A28] dark:hover:text-white cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            <span className="text-[11px] font-mono text-[#5C6A80] dark:text-[#8C98AE] whitespace-nowrap tabular-nums">
              {language === 'sw'
                ? `${filteredArticles.length} kati ya ${LEGAL_ARTICLES.length}`
                : `${filteredArticles.length} of ${LEGAL_ARTICLES.length} articles`}
            </span>
          </div>
        </div>

        {/* Interactive Legal Glossary Directory Panel */}
        <LegalGlossaryPanel
          isOpen={isGlossaryOpen}
          onClose={() => {
            setIsGlossaryOpen(false);
            setFocusedGlossaryTermId(null);
          }}
          highlightedTermId={focusedGlossaryTermId}
        />

        {/* 3-Column Editorial Grid or Empty State */}
        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0E1522] border border-[#E4DCCF] dark:border-[#1C263A]">
            <BookOpen className="w-8 h-8 text-[#8C6B32] dark:text-[#C5A880] mx-auto mb-3 opacity-80" />
            <p className="text-sm text-[#4A576D] dark:text-[#94A3B8]">
              {t('insights.noResults')}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 text-xs font-semibold text-[#8C6B32] dark:text-[#C5A880] hover:underline cursor-pointer"
            >
              {t('insights.clearFilter')}
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredArticles.map((article) => {
            const readingStats = calculateArticleReadingTime(article);
            const currentShares = shareCounts[article.id] ?? article.shareCount;
            const isShareMenuOpen = openShareMenuId === article.id;
            const activeFeedback =
              shareFeedback?.articleId === article.id ? shareFeedback.label : null;

            return (
              <article
                key={article.id}
                className="p-7 rounded-2xl bg-white dark:bg-[#0E1522] border border-[#E4DCCF] dark:border-[#1C263A] hover:border-[#C5A880]/60 dark:hover:border-[#C5A880]/40 transition-all flex flex-col justify-between shadow-sm dark:shadow-none relative"
              >
                <div>
                  {/* Category, Date & Quick Print Header */}
                  <div className="flex items-center justify-between gap-2 text-xs text-[#5C6A80] dark:text-[#8C98AE] mb-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[#8C6B32] dark:text-[#C5A880] font-medium">
                        {article.category}
                      </span>
                      <span aria-hidden="true" className="text-[#C8BFA8] dark:text-[#3D4C63]">
                        ·
                      </span>
                      <span>{article.date}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePrintSummary(article)}
                      title="Print Summary for this insight article"
                      className="p-1.5 rounded-lg text-[#5C6A80] dark:text-[#8C98AE] hover:text-[#8C6B32] dark:hover:text-[#DFBE82] hover:bg-[#F1ECE1] dark:hover:bg-[#161F2E] border border-transparent hover:border-[#C5A880]/30 transition-all flex items-center gap-1 text-[11px] font-sans group cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880] group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] uppercase font-mono text-[#5C6A80] dark:text-[#78869E] group-hover:text-[#8C6B32] dark:group-hover:text-[#E4C999]">
                        Print
                      </span>
                    </button>
                  </div>

                  {/* Dynamic Estimated Read Time Indicator Badge (Word-Count Calculated) */}
                  <div className="mb-4 flex items-center gap-2 flex-wrap">
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5EFE4] dark:bg-[#141C2B] border border-[#E4DCCF] dark:border-[#233148] hover:border-[#C5A880]/40 text-xs font-mono text-[#8C6B32] dark:text-[#E4C999] shadow-sm transition-colors"
                      title={`Calculated from ${readingStats.wordCount.toLocaleString()} words (${readingStats.readingPaceNote})`}
                    >
                      <Clock className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880] shrink-0" />
                      <span className="text-[10px] uppercase tracking-wider text-[#6F7A8F] dark:text-[#8C98AE]">
                        {t('insights.readTimePrefix')}:
                      </span>
                      <span className="font-semibold text-[#121A28] dark:text-white">
                        {readingStats.label}
                      </span>
                      <span className="text-[#9AA5B8] dark:text-[#7B8B9F]">·</span>
                      <span className="text-[#4A576D] dark:text-[#A2B1C6] text-[11px] tabular-nums">
                        {readingStats.wordCount.toLocaleString()} {t('insights.words')}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${readingStats.depthColor} ${readingStats.depthBg} tracking-wide uppercase font-semibold`}
                      title="Content depth classification"
                    >
                      {language === 'sw' ? readingStats.depthTierSw : readingStats.depthTier}
                    </span>
                  </div>

                  <h3 className="text-lg font-cinzel text-[#121A28] dark:text-white hover:text-[#8C6B32] dark:hover:text-[#DFBE82] transition-colors leading-snug">
                    {article.title}
                  </h3>

                  <p className="mt-4 text-xs text-[#4A576D] dark:text-[#9DAABF] leading-relaxed line-clamp-4">
                    <GlossaryAnnotatedText
                      text={article.synopsis}
                      enabled={glossaryEnabled}
                      onSelectTerm={(term) => {
                        setFocusedGlossaryTermId(term.id);
                        setIsGlossaryOpen(true);
                      }}
                    />
                  </p>

                  {/* Citation & Subtle Share Counter Social Proof Strip */}
                  <div className="mt-4 pt-3 border-t border-[#EFE8DA] dark:border-[#182234] flex items-center justify-between gap-3 flex-wrap">
                    <div className="text-[11px] font-mono text-[#5C6A80] dark:text-[#6F7A8F] truncate">
                      {t('insights.citation')}: {article.citation}
                    </div>

                    {/* Subtle Share Counter + Quick Share Menu */}
                    <div className="relative shrink-0" data-share-popover>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenShareMenuId((prev) =>
                            prev === article.id ? null : article.id
                          )
                        }
                        aria-expanded={isShareMenuOpen}
                        aria-label={`${currentShares} shares — Share "${article.title}"`}
                        title={
                          language === 'sw'
                            ? 'Shiriki makala haya na kuongeza idadi'
                            : 'Share article · Social circulation counter'
                        }
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                          activeFeedback
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-[#F8F4EC] dark:bg-[#121A2A] border-[#E4DCCF] dark:border-[#1F2B40] text-[#5C6A80] dark:text-[#94A3B8] hover:text-[#8C6B32] dark:hover:text-[#E4C999] hover:border-[#C5A880]/40'
                        }`}
                      >
                        {activeFeedback ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="font-semibold tabular-nums">
                              {currentShares.toLocaleString()}
                            </span>
                            <span className="text-[10px]">{activeFeedback}</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3 h-3 text-[#8C6B32] dark:text-[#C5A880] shrink-0" />
                            <span className="font-semibold text-[#121A28] dark:text-[#E2E8F0] tabular-nums">
                              {currentShares.toLocaleString()}
                            </span>
                            <span className="text-[#6F7A8F] dark:text-[#78869E]">
                              {t('insights.shares')}
                            </span>
                          </>
                        )}
                      </button>

                      {/* Compact Quick-Share Popover */}
                      {isShareMenuOpen && (
                        <div
                          className="absolute right-0 bottom-full mb-2 w-48 p-1.5 rounded-xl bg-white dark:bg-[#101827] border border-[#DFD4C1] dark:border-[#C5A880]/40 shadow-2xl z-30 space-y-1"
                          role="menu"
                          aria-label={t('insights.shareArticle')}
                        >
                          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#8C6B32] dark:text-[#C5A880] border-b border-[#EFE8DA] dark:border-[#1E293D]">
                            {t('insights.shareArticle')}
                          </div>

                          <a
                            href={getLinkedInShareHref(article)}
                            target="_blank"
                            rel="noopener noreferrer"
                            role="menuitem"
                            onClick={() =>
                              recordArticleShare(
                                article.id,
                                language === 'sw' ? '+1 · LinkedIn' : '+1 · Shared'
                              )
                            }
                            className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#121A28] dark:text-[#E2E8F0] hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] dark:hover:text-[#5BA4EE] transition-colors"
                          >
                            <span className="font-medium">LinkedIn</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>

                          <a
                            href={getXShareHref(article)}
                            target="_blank"
                            rel="noopener noreferrer"
                            role="menuitem"
                            onClick={() =>
                              recordArticleShare(
                                article.id,
                                language === 'sw' ? '+1 · X' : '+1 · Shared'
                              )
                            }
                            className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#121A28] dark:text-[#E2E8F0] hover:bg-[#C5A880]/15 hover:text-[#8C6B32] dark:hover:text-[#DFBE82] transition-colors"
                          >
                            <span className="font-medium">X (Twitter)</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>

                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => handleCopyArticleLink(article)}
                            className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#121A28] dark:text-[#E2E8F0] hover:bg-[#C5A880]/15 hover:text-[#8C6B32] dark:hover:text-[#DFBE82] transition-colors cursor-pointer text-left"
                          >
                            <span className="font-medium">
                              {language === 'sw' ? 'Nakili Kiungo' : 'Copy Link'}
                            </span>
                            <Copy className="w-3 h-3 opacity-70" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E4DCCF] dark:border-[#1C2436] flex items-center justify-between gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleOpenArticle(article)}
                    className="text-xs text-[#8C6B32] dark:text-[#C5A880] hover:text-[#6B4F1F] dark:hover:text-[#DFBE82] font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{t('insights.readFull')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Dedicated Print Summary Button */}
                  <button
                    type="button"
                    onClick={() => handlePrintSummary(article)}
                    title="Print Summary using #printable-document print styles"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5EFE4] dark:bg-[#141D2C] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#8C6B32] dark:text-[#E4C999] text-xs font-medium rounded-lg border border-[#C5A880]/40 dark:border-[#C5A880]/30 hover:border-[#C5A880] transition-all shadow-sm group cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
                    <span>Print Summary</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        )}

        {/* Section Print-Ready Export Dock */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D1422] border border-[#DFD4C1] dark:border-[#C5A880]/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center text-[#8C6B32] dark:text-[#C5A880] shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#121A28] dark:text-white block font-cinzel">
                Printer-Ready Legal Briefings &amp; Statutory Analysis
              </span>
              <p className="text-[11px] text-[#5C6A80] dark:text-[#8C98AE] leading-tight mt-0.5">
                Formatted with Chambers letterhead, official KLR citations, ratio decidendi, and Section 134 privilege disclaimers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrintSummaryCompendium}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F5EFE4] dark:bg-[#141E2F] hover:bg-[#C5A880] text-[#8C6B32] dark:text-[#E4C999] hover:text-[#0A0E17] text-xs font-semibold rounded-xl border border-[#C5A880]/50 dark:border-[#C5A880]/40 hover:border-[#C5A880] transition-all shadow-md group cursor-pointer whitespace-nowrap"
            title="Export all legal briefing articles in a clean, professional print-ready format"
          >
            <Printer className="w-4 h-4 text-[#8C6B32] dark:text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
            <span>Export Complete Digest (PDF)</span>
          </button>
        </div>

        {/* Full Article Reader Modal with Dynamic Estimated Reading Time, Scroll Tracker & Share Counter */}
        {activeArticle && (() => {
          const modalStats = calculateArticleReadingTime(activeArticle);
          const modalShares = shareCounts[activeArticle.id] ?? activeArticle.shareCount;
          const modalFeedback =
            shareFeedback?.articleId === activeArticle.id ? shareFeedback.label : null;
          const modalGlossaryTerms: LegalGlossaryTerm[] = extractGlossaryTermsFromTexts([
            activeArticle.synopsis,
            ...activeArticle.content,
          ]);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <div className="relative w-full max-w-2xl bg-white dark:bg-[#0D131F] border border-[#DFD4C1] dark:border-[#C5A880]/40 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">

                {/* Modal Top Reading Progress Sub-Bar */}
                <div
                  className="w-full h-[2.5px] bg-[#E8E0D1] dark:bg-[#162030] overflow-hidden"
                  role="progressbar"
                  aria-valuenow={Math.round(modalScrollPct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#B38F5B] via-[#C5A880] to-[#F3E3C3] shadow-[0_0_8px_#C5A880] transition-all duration-75"
                    style={{ width: `${modalScrollPct}%` }}
                  />
                </div>

                {/* Modal Header with Dynamic Reading Depth Indicator */}
                <div className="p-6 bg-[#F6F1E6] dark:bg-[#121927] border-b border-[#E4DCCF] dark:border-[#222E46] flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880] font-semibold flex-wrap mb-1.5">
                      <span>{activeArticle.category}</span>
                      <span aria-hidden="true" className="text-[#C8BFA8] dark:text-[#3D4C63]">
                        ·
                      </span>
                      <span>{activeArticle.date}</span>
                    </div>

                    {/* Dynamic Estimated Read Time + Subtle Share Counter */}
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-[#172235] border border-[#C5A880]/50 rounded-lg text-xs font-mono text-[#8C6B32] dark:text-[#E4C999] shadow-inner"
                        title={`Calculated from ${modalStats.wordCount.toLocaleString()} words (${modalStats.readingPaceNote})`}
                      >
                        <Clock className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880] animate-pulse shrink-0" />
                        <span className="text-[10px] uppercase tracking-wider text-[#6F7A8F] dark:text-[#8C98AE]">
                          {t('insights.readTimePrefix')}:
                        </span>
                        <span className="font-bold text-[#121A28] dark:text-white">
                          {modalStats.label}
                        </span>
                        <span className="text-[#9AA5B8] dark:text-[#5B6B82]">·</span>
                        <span className="text-[#4A576D] dark:text-[#BAC5D6] tabular-nums">
                          {modalStats.wordCount.toLocaleString()} {t('insights.words')}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${modalStats.depthColor} ${modalStats.depthBg} font-semibold uppercase tracking-wider`}
                      >
                        {language === 'sw' ? modalStats.depthTierSw : modalStats.depthTier}
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/80 dark:bg-[#172235] border border-[#E4DCCF] dark:border-[#233148] text-[11px] font-mono text-[#4A576D] dark:text-[#A6B4CD] tabular-nums">
                        <Share2 className="w-3 h-3 text-[#8C6B32] dark:text-[#C5A880]" />
                        <span>
                          {modalShares.toLocaleString()} {t('insights.shares')}
                        </span>
                      </span>
                    </div>

                    <h3 className="text-xl font-cinzel text-[#121A28] dark:text-white mt-1 leading-snug">
                      {activeArticle.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handlePrintSummary(activeArticle)}
                      title="Print Summary (triggers browser print dialog with #printable-document)"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#172132] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#8C6B32] dark:text-[#C5A880] text-xs font-semibold rounded-lg border border-[#C5A880]/40 transition-all shadow-sm group cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
                      <span className="hidden sm:inline">Print Summary</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseArticle}
                      className="p-2 text-[#5C6A80] dark:text-[#8C98AE] hover:text-[#121A28] dark:hover:text-white rounded-lg hover:bg-[#E8E0D1] dark:hover:bg-[#1A2538] transition-colors cursor-pointer"
                      aria-label="Close article reader"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Long-Form Reading Body with Scroll Tracking */}
                <div
                  onScroll={handleModalScroll}
                  className="p-6 md:p-8 overflow-y-auto space-y-4 text-sm text-[#324056] dark:text-[#BAC5D6] leading-relaxed relative scroll-smooth"
                >
                  <div className="p-3 bg-[#F6F1E6] dark:bg-[#131B29] rounded-xl border border-[#E4DCCF] dark:border-[#20293D] text-xs font-mono text-[#8C6B32] dark:text-[#E4C999] flex items-center justify-between flex-wrap gap-2">
                    <span>Official Chambers Citation: {activeArticle.citation}</span>
                    <span className="text-[11px] text-[#5C6A80] dark:text-[#8C98AE]">
                      Scroll to read · {Math.round(modalScrollPct)}% completed
                    </span>
                  </div>

                  {modalGlossaryTerms.length > 0 && glossaryEnabled && (
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#111928] border border-[#E4DCCF] dark:border-[#1E2A40] space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8C6B32] dark:text-[#C5A880]">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>
                            {t('glossary.articleTermsHeader')} ({modalGlossaryTerms.length})
                          </span>
                        </div>
                        <span className="text-[11px] text-[#5C6A80] dark:text-[#8C98AE]">
                          {t('glossary.hoverHint')}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#4A576D] dark:text-[#9BA5B7] leading-relaxed">
                        {modalGlossaryTerms.map((term, idx) => (
                          <React.Fragment key={term.id}>
                            {idx > 0 && (
                              <span aria-hidden="true" className="mx-1.5 text-[#C8BFA8] dark:text-[#3D4C63]">
                                ·
                              </span>
                            )}
                            <span className="text-[#121A28] dark:text-[#E2E8F0] font-medium">
                              {language === 'sw' ? term.termSw : term.term}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeArticle.content.map((paragraph, index) => (
                    <p
                      key={index}
                      className="leading-relaxed font-serif text-[15px] text-[#1D283A] dark:text-[#CFD9E8]"
                    >
                      <GlossaryAnnotatedText
                        text={paragraph}
                        enabled={glossaryEnabled}
                        onSelectTerm={(term) => {
                          handleCloseArticle();
                          setFocusedGlossaryTermId(term.id);
                          setIsGlossaryOpen(true);
                        }}
                      />
                    </p>
                  ))}

                  <div className="p-4 bg-[#F6F1E6] dark:bg-[#111722] rounded-xl border border-[#E4DCCF] dark:border-[#1E2638] text-xs text-[#4A576D] dark:text-[#8C98AE] mt-6">
                    <strong className="text-[#121A28] dark:text-white block mb-1">
                      Legal Disclaimer:
                    </strong>
                    This briefing is published for informational purposes under the auspices of Petersons Angwenyi &amp; Associates Advocates and does not constitute formal legal counsel. For actionable legal opinions on specific commercial transactions, contact chambers registry.
                  </div>
                </div>

                {/* Floating Print-Ready Button for Clean PDF / Paper Exports during reading */}
                <div className="absolute bottom-20 right-6 z-20 pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => handlePrintSummary(activeArticle)}
                    className="flex items-center gap-2 px-3.5 py-2.5 bg-[#0C1322]/95 hover:bg-[#C5A880] text-[#E4C999] hover:text-[#0A0E17] text-xs font-semibold rounded-xl border border-[#C5A880]/60 hover:border-[#C5A880] shadow-2xl backdrop-blur-md transition-all group cursor-pointer hover:scale-105 active:scale-95 ring-1 ring-black/50"
                    title="Floating Print-Ready Action: Trigger print media query stylesheet for clean, professional PDF or paper export"
                    aria-label="Floating Print Briefing Button"
                  >
                    <Printer className="w-4 h-4 text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
                    <span>Print Briefing (PDF)</span>
                    <span className="hidden sm:inline font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#162134] group-hover:bg-[#8D7249] text-[#A6B4CD] group-hover:text-[#0A0E17]">
                      ⌘P
                    </span>
                  </button>
                </div>

                {/* Modal Footer with Print & Interactive Share Counter */}
                <div className="p-4 bg-[#F6F1E6] dark:bg-[#121927] border-t border-[#E4DCCF] dark:border-[#222E46] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handlePrintSummary(activeArticle)}
                      className="flex items-center gap-1.5 text-xs text-[#4A576D] dark:text-[#8C98AE] hover:text-[#8C6B32] dark:hover:text-[#DFBE82] transition-colors group cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#8C6B32] dark:text-[#C5A880]" />
                      <span>Print Summary</span>
                    </button>

                    <span className="text-[#C8BFA8] dark:text-[#2D3B55]" aria-hidden="true">
                      |
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#5C6A80] dark:text-[#94A3B8] tabular-nums mr-1">
                        <Share2 className="w-3 h-3 text-[#8C6B32] dark:text-[#C5A880]" />
                        <span>{modalShares.toLocaleString()}</span>
                      </span>

                      <a
                        href={getLinkedInShareHref(activeArticle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          recordArticleShare(
                            activeArticle.id,
                            language === 'sw' ? '+1 · LinkedIn' : '+1 · Shared'
                          )
                        }
                        className="px-2 py-1 rounded-md bg-white dark:bg-[#172132] border border-[#DFD4C1] dark:border-[#24324A] hover:border-[#0A66C2] text-[11px] font-medium text-[#0A66C2] dark:text-[#5BA4EE] transition-colors"
                      >
                        LinkedIn
                      </a>

                      <a
                        href={getXShareHref(activeArticle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          recordArticleShare(
                            activeArticle.id,
                            language === 'sw' ? '+1 · X' : '+1 · Shared'
                          )
                        }
                        className="px-2 py-1 rounded-md bg-white dark:bg-[#172132] border border-[#DFD4C1] dark:border-[#24324A] hover:border-[#C5A880] text-[11px] font-medium text-[#121A28] dark:text-white transition-colors"
                      >
                        X
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopyArticleLink(activeArticle)}
                        className="px-2 py-1 rounded-md bg-white dark:bg-[#172132] border border-[#DFD4C1] dark:border-[#24324A] hover:border-[#C5A880] text-[11px] font-medium text-[#4A576D] dark:text-[#CBD5E1] transition-colors cursor-pointer"
                      >
                        {modalFeedback || (language === 'sw' ? 'Nakili' : 'Copy')}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseArticle}
                    className="px-5 py-2 bg-[#C5A880] text-[#0A0E17] font-semibold text-xs tracking-wider uppercase rounded-lg hover:brightness-110 cursor-pointer"
                  >
                    {t('insights.close')}
                  </button>
                </div>

              </div>
            </div>
          );
        })()}

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
