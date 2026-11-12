import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search,
  X,
  Scale,
  Landmark,
  HelpCircle,
  ArrowRight,
  CornerDownLeft,
  ShieldCheck,
  FileText,
  Mic,
  MicOff,
  Volume2,
} from 'lucide-react';
import {
  PRACTICE_AREAS,
  CASE_BRIEFS,
  SAMPLE_CLIENT_MATTER,
  MatterDocument,
} from '../data/firmData';
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

// Browser Web Speech API declarations
interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
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

  // SpeechRecognition state
  const [isSpeechSupported] = useState<boolean>(() =>
    Boolean(getSpeechRecognitionConstructor())
  );
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const [voiceError, setVoiceError] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const stopVoiceRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors if already stopped
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Focus input automatically on open & stop recognition on close
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
      setVoiceError('');
    } else {
      stopVoiceRecognition();
      setQuery('');
      setSelectedCategory('all');
      setVoiceStatus('');
      setVoiceError('');
    }
  }, [isOpen, stopVoiceRecognition]);

  useEffect(() => {
    return () => {
      stopVoiceRecognition();
    };
  }, [stopVoiceRecognition]);

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

  const filterCatalog = useCallback(
    (searchText: string, category: SearchCategory): SearchResultItem[] => {
      return allItems.filter((item) => {
        if (category !== 'all' && item.type !== category) {
          return false;
        }
        if (!searchText.trim()) return true;

        const q = searchText.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(q);
        const subtitleMatch = item.subtitle ? item.subtitle.toLowerCase().includes(q) : false;
        const snippetMatch = item.snippet.toLowerCase().includes(q);
        const metaMatch = item.meta.toLowerCase().includes(q);
        const statutesMatch = item.statutes
          ? item.statutes.some((s) => s.toLowerCase().includes(q))
          : false;

        return titleMatch || subtitleMatch || snippetMatch || metaMatch || statutesMatch;
      });
    },
    [allItems]
  );

  // Filter items based on query & category
  const filteredResults = useMemo(
    () => filterCatalog(query, selectedCategory),
    [filterCatalog, query, selectedCategory]
  );

  // Keep selection bounded
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  const executeSelection = useCallback(
    (item: SearchResultItem) => {
      stopVoiceRecognition();
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
    },
    [onClose, onOpenVault, onSelectCase, onSelectFaq, onSelectPractice, stopVoiceRecognition]
  );

  // Interpret spoken voice commands & queries for hands-free navigation
  const processFinalVoiceTranscript = useCallback(
    (rawTranscript: string) => {
      const cleaned = rawTranscript.trim();
      const lower = cleaned.toLowerCase();

      if (!cleaned) return;

      // Close / dismiss command
      if (/^(close|cancel|dismiss|exit)(\s+search)?$/.test(lower)) {
        setVoiceStatus('Voice command: Closing search');
        stopVoiceRecognition();
        onClose();
        return;
      }

      // Reset / Clear command
      if (/^(reset|clear|show all|view all)(\s+search|\s+results)?$/.test(lower)) {
        setSelectedCategory('all');
        setQuery('');
        setVoiceStatus('Voice command: Showing all indexed legal records');
        return;
      }

      // Category switching voice commands (supports trailing query e.g. "show cases energy")
      const categoryPatterns: Array<{
        regex: RegExp;
        category: SearchCategory;
        label: string;
      }> = [
        {
          regex: /^(?:show|filter|view|search)\s+(?:practice\s*areas?|portfolios?|practice)\s*(.*)$/i,
          category: 'practice',
          label: 'Practice Portfolios',
        },
        {
          regex: /^(?:show|filter|view|search)\s+(?:cases?|case\s*briefs?|precedents?)\s*(.*)$/i,
          category: 'case',
          label: 'Judicial Precedents',
        },
        {
          regex: /^(?:show|filter|view|search)\s+(?:f\.?a\.?q\.?s?|questions?|inquiries)\s*(.*)$/i,
          category: 'faq',
          label: 'Statutory FAQs',
        },
        {
          regex: /^(?:show|filter|view|search)\s+(?:documents?|court\s*documents?|filings?)\s*(.*)$/i,
          category: 'document',
          label: 'Court Documents',
        },
      ];

      for (const pat of categoryPatterns) {
        const match = cleaned.match(pat.regex);
        if (match) {
          const remainder = (match[1] || '').trim();
          setSelectedCategory(pat.category);
          setQuery(remainder);
          setVoiceStatus(
            remainder
              ? `Voice filter: ${pat.label} matching "${remainder}"`
              : `Voice filter: ${pat.label}`
          );
          return;
        }
      }

      // Open current top / first result
      if (/^(open|select|go to|view)\s+(first|top|this)(\s+result|\s+item)?$/.test(lower)) {
        const currentMatches = filterCatalog(query, selectedCategory);
        const top = currentMatches[selectedIndex] || currentMatches[0];
        if (top) {
          setVoiceStatus(`Navigating to: ${top.title}`);
          executeSelection(top);
        } else {
          setVoiceStatus('No matching entry available to open');
        }
        return;
      }

      // Direct "open <topic>" / "go to <topic>" / "navigate to <topic>" navigation command
      const navMatch = cleaned.match(
        /^(?:open|go to|navigate to|find and open)\s+(.+)$/i
      );
      if (navMatch && navMatch[1]) {
        const targetTopic = navMatch[1].trim();
        setSelectedCategory('all');
        setQuery(targetTopic);
        const matches = filterCatalog(targetTopic, 'all');
        if (matches.length > 0) {
          setVoiceStatus(`Voice navigation: Opening "${matches[0].title}"`);
          executeSelection(matches[0]);
        } else {
          setVoiceStatus(`No exact match to open for "${targetTopic}"`);
        }
        return;
      }

      // Standard spoken search query (filters topics, cases, FAQs, documents)
      setQuery(cleaned);
      const resultCount = filterCatalog(cleaned, selectedCategory).length;
      setVoiceStatus(
        language === 'sw'
          ? `Utafutaji wa sauti: "${cleaned}" (${resultCount})`
          : `Voice search: "${cleaned}" (${resultCount} ${resultCount === 1 ? 'match' : 'matches'})`
      );
    },
    [
      executeSelection,
      filterCatalog,
      language,
      onClose,
      query,
      selectedCategory,
      selectedIndex,
      stopVoiceRecognition,
    ]
  );

  const toggleVoiceSearch = () => {
    if (isListening) {
      stopVoiceRecognition();
      setVoiceStatus(language === 'sw' ? 'Kusikiliza kumesimamishwa' : 'Voice search paused');
      return;
    }

    const SpeechRec = getSpeechRecognitionConstructor();
    if (!SpeechRec) {
      setVoiceError(
        language === 'sw'
          ? 'Kivinjari hiki hakiungi mkono utafutaji wa sauti (SpeechRecognition).'
          : 'SpeechRecognition API is not supported in this browser.'
      );
      return;
    }

    setVoiceError('');
    setVoiceStatus(
      language === 'sw'
        ? 'Inasikiliza... Sema mada, kesi, au swali la kisheria.'
        : 'Listening... Speak a legal topic, case, FAQ, or command (e.g., "open arbitration").'
    );

    try {
      const recognition = new SpeechRec();
      recognition.lang = language === 'sw' ? 'sw-KE' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interim = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
            finalText += text;
          } else {
            interim += text;
          }
        }

        if (interim.trim()) {
          setQuery(interim.trim());
        }

        if (finalText.trim()) {
          processFinalVoiceTranscript(finalText);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceError(
            language === 'sw'
              ? 'Ruhusa ya maikrofoni imekataliwa. Tafadhali ruhusu maikrofoni kwenye kivinjari chako.'
              : 'Microphone permission was denied. Enable microphone access in browser settings to use voice search.'
          );
        } else if (event.error === 'no-speech') {
          setVoiceError(
            language === 'sw'
              ? 'Hakuna sauti iliyosikika. Bofya maikrofoni na ujaribu tena.'
              : 'No speech detected. Click the microphone icon and try again.'
          );
        } else if (event.error !== 'aborted') {
          setVoiceError(
            language === 'sw'
              ? 'Hitilafu ya utambuzi wa sauti imetokea.'
              : `Voice recognition error (${event.error}).`
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceError(
        language === 'sw'
          ? 'Imeshindwa kuanzisha utambuzi wa sauti.'
          : 'Unable to start browser voice recognition.'
      );
    }
  };

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
  }, [isOpen, filteredResults, selectedIndex, onClose, executeSelection]);

  // Ensure active element scrolls into view in list
  useEffect(() => {
    const container = listContainerRef.current;
    if (!container) return;
    const activeEl = container.querySelector(
      `[data-index="${selectedIndex}"]`
    ) as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

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
        {/* Search Input Bar with SpeechRecognition Voice Trigger */}
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
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 rounded-lg text-[#718096] hover:text-white hover:bg-[#172132] transition-colors cursor-pointer"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Browser SpeechRecognition Microphone Button */}
          <button
            type="button"
            onClick={toggleVoiceSearch}
            disabled={!isSpeechSupported}
            aria-label={
              isListening ? 'Stop voice search' : 'Start hands-free voice search'
            }
            aria-pressed={isListening}
            title={
              !isSpeechSupported
                ? 'SpeechRecognition API unavailable in this browser'
                : isListening
                  ? 'Stop listening'
                  : 'Voice search & hands-free commands (SpeechRecognition)'
            }
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              !isSpeechSupported
                ? 'bg-[#121927] border-[#1E2A3E] text-[#4E5D78] cursor-not-allowed'
                : isListening
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-lg shadow-rose-500/20'
                  : 'bg-[#172132] hover:bg-[#C5A880] border-[#26344E] hover:border-[#C5A880] text-[#C5A880] hover:text-[#0A0E17]'
            }`}
          >
            {isListening ? (
              <>
                <span
                  className="w-2 h-2 rounded-full bg-rose-400 animate-ping"
                  aria-hidden="true"
                />
                <MicOff className="w-4 h-4" />
                <span className="hidden sm:inline">Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {language === 'sw' ? 'Sauti' : 'Voice'}
                </span>
              </>
            )}
          </button>

          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#172132] text-[#8C98AE] rounded border border-[#24334C]">
            ESC
          </kbd>
        </div>

        {/* Live Voice Recognition Status & Hands-Free Command Feedback Strip */}
        {(isListening || voiceStatus || voiceError) && (
          <div
            role="status"
            aria-live="polite"
            className={`px-5 py-2 border-b text-xs flex items-center justify-between gap-3 flex-wrap ${
              voiceError
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : isListening
                  ? 'bg-[#C5A880]/15 border-[#C5A880]/40 text-[#F3E2C8]'
                  : 'bg-[#0C121E] border-[#1A2538] text-[#A6B4CD]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Volume2
                className={`w-3.5 h-3.5 shrink-0 ${
                  voiceError
                    ? 'text-rose-400'
                    : isListening
                      ? 'text-[#C5A880] animate-pulse'
                      : 'text-[#C5A880]'
                }`}
              />
              <span>{voiceError || voiceStatus}</span>
            </div>

            {isListening && (
              <span className="text-[10px] font-mono text-[#DFBE82]">
                Try: &ldquo;show cases&rdquo; · &ldquo;open arbitration&rdquo; · &ldquo;beneficial ownership&rdquo;
              </span>
            )}
          </div>
        )}

        {/* Filter Category Tabs & Result Count */}
        <div className="px-5 py-3 border-b border-[#172132] bg-[#0A0F1A] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1 p-0.5 bg-[#121A28] rounded-lg border border-[#1E2B3E] text-xs flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              {t('search.all')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('practice')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                selectedCategory === 'practice'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              {t('search.practice')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('case')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                selectedCategory === 'case'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              {t('search.precedents')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('faq')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                selectedCategory === 'faq'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              {t('search.faqs')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('document')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                selectedCategory === 'document'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-semibold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white'
              }`}
            >
              {language === 'sw' ? 'Nyaraka za Kesi' : 'Court Documents'}
            </button>
          </div>

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
                type="button"
                onClick={() => setQuery(topic.query)}
                className="px-2.5 py-0.5 rounded bg-[#121927] hover:bg-[#1A2438] text-[#A6B2C4] hover:text-[#DFBE82] border border-[#212E44] text-[11px] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-3 text-xs text-[#C5A880] hover:underline cursor-pointer"
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

                      <h4
                        className={`text-sm sm:text-base font-serif font-bold transition-colors ${
                          isSelected ? 'text-[#DFBE82]' : 'text-white'
                        }`}
                      >
                        {item.title}
                      </h4>

                      <p className="text-xs text-[#9BA5B7] line-clamp-2 mt-1 leading-relaxed">
                        {item.snippet}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#718096] font-mono mt-2">
                        <span>{item.meta}</span>
                      </div>
                    </div>
                  </div>

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
          <div className="flex items-center gap-4 flex-wrap">
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px]">
              <kbd className="px-1.5 py-0.5 bg-[#172132] text-[#A6B2C4] rounded border border-[#24334C]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-[#172132] text-[#A6B2C4] rounded border border-[#24334C]">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px]">
              <kbd className="px-1.5 py-0.5 bg-[#172132] text-[#A6B2C4] rounded border border-[#24334C]">
                ↵
              </kbd>
              <span>to open</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#A6B2C4]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Privileged Chambers Index · Voice Ready</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              stopVoiceRecognition();
              onClose();
              onOpenConsultation(query || 'Search Inquiry');
            }}
            className="px-4 py-1.5 bg-[#C5A880]/15 hover:bg-[#C5A880]/25 text-[#DFBE82] border border-[#C5A880]/40 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t('search.instructItem')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
