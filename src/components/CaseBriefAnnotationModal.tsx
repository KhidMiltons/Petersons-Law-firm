import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Highlighter, StickyNote, Plus, Trash2, Check, 
  Search, Printer, Download, Scale, FileText, Sparkles, 
  Clock, ShieldCheck, Filter, Tag, CheckCircle2, ChevronRight,
  BookOpen, Eye, RotateCcw, AlertCircle, Quote
} from 'lucide-react';
import { CaseBrief } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

export interface PrecedentClause {
  number: number;
  title: string;
  category: 'Coram & Forum' | 'Factual Matrix' | 'Legal Issues' | 'Ratio Decidendi' | 'Decree & Relief';
  text: string;
  statutoryBasis?: string;
}

export interface PrecedentAnnotation {
  id: string;
  briefId: string;
  clauseNumber: number;
  type: 'highlight' | 'sticky-note';
  color: 'amber' | 'emerald' | 'rose' | 'sky';
  title?: string;
  noteText?: string;
  highlightedText?: string;
  author: {
    name: string;
    role: string;
    affiliation: 'Senior Counsel' | 'Partner' | 'Instructing Client' | 'Associate';
  };
  timestamp: string;
  isResolved?: boolean;
}

interface CaseBriefAnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  brief: CaseBrief | null;
}

// Generate rich judicial clauses for each landmark precedent
const getClausesForCaseBrief = (brief: CaseBrief): PrecedentClause[] => {
  return [
    {
      number: 1,
      title: "Judicial Coram & Superior Courts Jurisdiction",
      category: "Coram & Forum",
      text: `Before the ${brief.forum}. Coram: Senior Counsel Milton Angwenyi leading chambers appellate team. Instructing Client Category: ${brief.clientCategory}. Cause Year: ${brief.year}. Matter Exposure / Financial Quantum: ${brief.value}. Admitted under the supervisory and appellate jurisdiction of the Republic of Kenya Superior Courts.`,
      statutoryBasis: "Constitution of Kenya 2010 Art. 165(3) & Civil Procedure Act (Cap 21)"
    },
    {
      number: 2,
      title: "Commercial Factual Matrix & Underlying Transaction",
      category: "Factual Matrix",
      text: `${brief.summary} The underlying dispute engaged cross-border commercial undertakings, sovereign guarantees, and performance security covenants executed under standard institutional contractual frameworks.`,
      statutoryBasis: "Law of Contract Act (Cap 23) & Evidence Act (Cap 80) § 106B"
    },
    {
      number: 3,
      title: "Substantive Statutory Issues for Judicial Determination",
      category: "Legal Issues",
      text: "WHETHER the ex-parte conservatory orders and emergency injunctions sought met the statutory threshold under Order 40 of the Civil Procedure Rules; and WHETHER the respondent's administrative notices satisfied the mandatory statutory notices and constitutional due process mandates under Article 47 of the Constitution of Kenya.",
      statutoryBasis: "Fair Administrative Action Act 2015 & Order 40 Civil Procedure Rules"
    },
    {
      number: 4,
      title: "Ratio Decidendi & Precedent Holding of the Court",
      category: "Ratio Decidendi",
      text: `THE COURT HELD: ${brief.impact} The bench affirmed that commercial contracts and statutory remuneration scales must be interpreted purposively to preserve transactional certainty and prohibit unilateral distress absent strict compliance with procedural cure notices.`,
      statutoryBasis: "Advocates (Remuneration) Order (ARO) & Precedent Suit Law"
    },
    {
      number: 5,
      title: "Final Decree, Operative Orders & Commercial Relief",
      category: "Decree & Relief",
      text: `FINAL DECREE: Permanent declaratory orders granted in terms of the Claimant's prayers. All disputed distress notices, penalty assessments, or unilateral security realizations quashed. Costs awarded to the Instructing Client on the Senior Counsel scale pursuant to Schedule VI of the Advocates Remuneration Order.`,
      statutoryBasis: "Civil Procedure Rules Order 21 & ARO Schedule VI"
    }
  ];
};

// Default seed annotations for landmark case briefs
const getInitialAnnotations = (briefId: string): PrecedentAnnotation[] => {
  return [
    {
      id: `ann-${briefId}-1`,
      briefId,
      clauseNumber: 4,
      type: 'sticky-note',
      color: 'amber',
      title: 'Senior Counsel Strategic Ratio',
      noteText: 'Landmark judicial holding: Lady Justice Wambui reaffirmed that contractual cure notices are mandatory conditions precedent before calling in bank guarantees.',
      author: {
        name: 'Milton Angwenyi, SC',
        role: 'Senior Counsel & Chambers Head',
        affiliation: 'Senior Counsel'
      },
      timestamp: 'Today at 09:30 AM',
      isResolved: false
    },
    {
      id: `ann-${briefId}-2`,
      briefId,
      clauseNumber: 2,
      type: 'highlight',
      color: 'emerald',
      title: 'Electronic Evidence Admissibility',
      highlightedText: 'Evidence Act (Cap 80) § 106B electronic transmissions certificate',
      noteText: 'All electronic telemetry and logs were admitted under Section 106B without objection.',
      author: {
        name: 'David Otieno',
        role: 'Partner (Dispute Resolution)',
        affiliation: 'Partner'
      },
      timestamp: 'Yesterday at 15:45',
      isResolved: false
    },
    {
      id: `ann-${briefId}-3`,
      briefId,
      clauseNumber: 5,
      type: 'sticky-note',
      color: 'rose',
      title: 'Client Action Item: Costs Taxation',
      noteText: 'Prepare party-and-party bill of costs under Schedule VI. Commercial quantum entitles chambers to maximum instruction fees.',
      author: {
        name: 'Sharon Wanjiku Mutua',
        role: 'Partner & Company Secretary',
        affiliation: 'Partner'
      },
      timestamp: '02 Nov 2026',
      isResolved: true
    }
  ];
};

export const CaseBriefAnnotationModal: React.FC<CaseBriefAnnotationModalProps> = ({
  isOpen,
  onClose,
  brief
}) => {
  const { language } = useLanguage();

  // Annotations state (with local storage backing)
  const [annotations, setAnnotations] = useState<PrecedentAnnotation[]>([]);
  const [activeClauseNumber, setActiveClauseNumber] = useState<number>(4);
  const [filterType, setFilterType] = useState<'all' | 'sticky-note' | 'highlight'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeColor, setActiveColor] = useState<'amber' | 'emerald' | 'rose' | 'sky'>('amber');
  const [isIvoryMode, setIsIvoryMode] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // New Note Composer state
  const [isComposingNote, setIsComposingNote] = useState<boolean>(false);
  const [composerClauseNum, setComposerClauseNum] = useState<number>(4);
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [newNoteType, setNewNoteType] = useState<'sticky-note' | 'highlight'>('sticky-note');
  const [newNoteAuthorAffiliation, setNewNoteAuthorAffiliation] = useState<'Senior Counsel' | 'Partner' | 'Instructing Client' | 'Associate'>('Senior Counsel');

  // Load annotations on brief change
  useEffect(() => {
    if (!brief) return;
    const storageKey = `paa_case_brief_annotations_${brief.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setAnnotations(JSON.parse(saved));
        return;
      } catch (e) {
        // Fallback to initial
      }
    }
    setAnnotations(getInitialAnnotations(brief.id));
  }, [brief]);

  // Save annotations to localStorage
  const saveAnnotations = (updated: PrecedentAnnotation[]) => {
    setAnnotations(updated);
    if (brief) {
      localStorage.setItem(`paa_case_brief_annotations_${brief.id}`, JSON.stringify(updated));
    }
  };

  // Clauses list
  const clauses = useMemo(() => {
    if (!brief) return [];
    return getClausesForCaseBrief(brief);
  }, [brief]);

  // Filtered annotations for sidebar
  const filteredAnnotations = useMemo(() => {
    return annotations.filter((ann) => {
      if (filterType !== 'all' && ann.type !== filterType) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = ann.title?.toLowerCase().includes(query);
        const textMatch = ann.noteText?.toLowerCase().includes(query);
        const authorMatch = ann.author.name.toLowerCase().includes(query);
        if (!titleMatch && !textMatch && !authorMatch) return false;
      }
      return true;
    });
  }, [annotations, filterType, searchQuery]);

  // Add new note / highlight
  const handleCreateAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !brief) return;

    const newAnn: PrecedentAnnotation = {
      id: `ann-${brief.id}-${Date.now()}`,
      briefId: brief.id,
      clauseNumber: composerClauseNum,
      type: newNoteType,
      color: activeColor,
      title: newNoteTitle.trim() || (newNoteType === 'sticky-note' ? 'Attorney Sticky Note' : 'Statutory Highlight'),
      noteText: newNoteContent.trim(),
      author: {
        name: newNoteAuthorAffiliation === 'Senior Counsel' ? 'Milton Angwenyi, SC' : newNoteAuthorAffiliation === 'Partner' ? 'David Otieno' : 'Corporate Legal Counsel',
        role: newNoteAuthorAffiliation === 'Senior Counsel' ? 'Lead Senior Counsel' : 'Instructing Advocate',
        affiliation: newNoteAuthorAffiliation
      },
      timestamp: 'Just now',
      isResolved: false
    };

    const updated = [newAnn, ...annotations];
    saveAnnotations(updated);

    // Reset composer
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsComposingNote(false);
  };

  // Toggle resolved state
  const handleToggleResolved = (id: string) => {
    const updated = annotations.map((ann) => 
      ann.id === id ? { ...ann, isResolved: !ann.isResolved } : ann
    );
    saveAnnotations(updated);
  };

  // Delete annotation
  const handleDeleteAnnotation = (id: string) => {
    const updated = annotations.filter((ann) => ann.id !== id);
    saveAnnotations(updated);
  };

  // Quick Highlight on clause
  const handleQuickHighlightClause = (clauseNum: number) => {
    if (!brief) return;
    const clause = clauses.find(c => c.number === clauseNum);
    if (!clause) return;

    const newHighlight: PrecedentAnnotation = {
      id: `ann-${brief.id}-${Date.now()}`,
      briefId: brief.id,
      clauseNumber: clauseNum,
      type: 'highlight',
      color: activeColor,
      title: `Highlighted: ${clause.title}`,
      highlightedText: clause.text.slice(0, 120) + '...',
      noteText: `Flagged for judicial authority review under ${clause.statutoryBasis || 'Chambers Precedents'}.`,
      author: {
        name: 'Milton Angwenyi, SC',
        role: 'Senior Counsel',
        affiliation: 'Senior Counsel'
      },
      timestamp: 'Just now',
      isResolved: false
    };

    saveAnnotations([newHighlight, ...annotations]);
  };

  // Print annotated precedent
  const handlePrintAnnotated = () => {
    window.print();
  };

  if (!isOpen || !brief) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-[#090D15] border border-[#C5A880]/50 rounded-2xl shadow-2xl shadow-[#C5A880]/10 overflow-hidden flex flex-col max-h-[94vh] text-slate-200">
        
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 bg-[#0D1420] border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center text-[#DFBE82] shrink-0">
              <Scale className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#C5A880]">
                <span>Judicial Precedent Study Suite</span>
                <span>·</span>
                <span className="text-emerald-400">Interactive Annotation Layer</span>
              </div>
              <h3 className="text-sm sm:text-base font-cinzel text-white font-bold tracking-wide truncate max-w-lg">
                {brief.matterName}
              </h3>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Color Palette Selector */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[#141C2B] border border-[#202E44]">
              <span className="text-[10px] font-mono text-[#8C98AE] mr-1 hidden sm:inline">Color:</span>
              {(['amber', 'emerald', 'rose', 'sky'] as const).map((c) => {
                const colorBg = 
                  c === 'amber' ? 'bg-amber-400' :
                  c === 'emerald' ? 'bg-emerald-400' :
                  c === 'rose' ? 'bg-rose-400' : 'bg-sky-400';
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveColor(c)}
                    className={`w-5 h-5 rounded-full ${colorBg} transition-transform ${
                      activeColor === c ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-60 hover:opacity-100'
                    }`}
                    title={`Select ${c} annotation color`}
                  />
                );
              })}
            </div>

            {/* Quick Add Sticky Note Button */}
            <button
              onClick={() => {
                setIsComposingNote(true);
                setNewNoteType('sticky-note');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C5A880] hover:brightness-110 text-[#0A0E17] font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Sticky-Note</span>
            </button>

            {/* Ivory Parchment / Dark Reader Toggle */}
            <button
              onClick={() => setIsIvoryMode(!isIvoryMode)}
              className="px-2.5 py-1.5 rounded-xl bg-[#141C2B] hover:bg-[#1D273A] border border-[#202E44] text-[11px] font-mono text-[#A6B2C4] transition-colors"
              title="Toggle Parchment vs Slate Viewer"
            >
              {isIvoryMode ? '📄 Parchment' : '🌙 Dark Slate'}
            </button>

            {/* Download as PDF Button */}
            <button
              onClick={handlePrintAnnotated}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141D2C] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] border border-[#C5A880]/30 hover:border-[#C5A880] text-xs font-semibold transition-all shadow-sm group"
              title="Download Annotated Legal Brief as PDF (triggers print dialog)"
            >
              <Download className="w-3.5 h-3.5 text-[#C5A880] group-hover:text-[#0A0E17] transition-colors" />
              <span>Download as PDF</span>
            </button>

            {/* Print Precedent */}
            <button
              onClick={handlePrintAnnotated}
              className="p-1.5 text-[#8C98AE] hover:text-white rounded-lg hover:bg-[#1A2538] transition-colors"
              title="Print Annotated Brief"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-[#8C98AE] hover:text-white rounded-lg hover:bg-[#1A2538] transition-colors ml-1"
              title="Close Annotation Suite"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Area: Split Screen between Precedent Clauses & Annotation Sidebar */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Main Legal Document Reader */}
          <div className={`flex-1 overflow-y-auto p-4 sm:p-8 transition-colors ${
            isIvoryMode ? 'bg-[#FAF8F5] text-[#1E2530]' : 'bg-[#06080E] text-slate-200'
          }`}>
            
            {/* Judicial Banner */}
            <div className={`p-6 rounded-2xl mb-8 border ${
              isIvoryMode 
                ? 'bg-[#F2ECE1] border-[#D9D1C2] text-[#2C3440]' 
                : 'bg-[#0E1524] border-[#1C273C] text-[#C5D0E0]'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-2 flex-wrap gap-2">
                <span className="text-[#8C6D3B] dark:text-[#C5A880] font-bold uppercase tracking-wider">
                  {brief.forum} · YEAR {brief.year}
                </span>
                <span className="text-[11px] font-mono text-[#8C98AE]">
                  Citation: PAA-{brief.year}-{brief.id.toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-cinzel font-bold leading-snug">
                {brief.matterName}
              </h2>
              <div className="mt-3 flex items-center gap-4 text-xs font-mono text-[#6A788E] flex-wrap">
                <span>Value: <strong className="text-[#C5A880]">{brief.value}</strong></span>
                <span>·</span>
                <span>Category: {brief.clientCategory}</span>
                <span>·</span>
                <span className="flex items-center gap-1 text-[#C5A880]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{brief.readTime || '4 min read'}</span>
                </span>
              </div>
            </div>

            {/* Precedent Clauses with Inline Sticky-Notes & Highlights */}
            <div className="space-y-6">
              {clauses.map((clause) => {
                const clauseAnnotations = annotations.filter(a => a.clauseNumber === clause.number);
                const hasHighlights = clauseAnnotations.some(a => a.type === 'highlight');
                const stickyNotes = clauseAnnotations.filter(a => a.type === 'sticky-note');

                // Determine border and highlight glow
                const activeHighlight = clauseAnnotations.find(a => a.type === 'highlight');
                const highlightBorder = 
                  activeHighlight?.color === 'amber' ? 'border-amber-400/60 bg-amber-500/5' :
                  activeHighlight?.color === 'emerald' ? 'border-emerald-400/60 bg-emerald-500/5' :
                  activeHighlight?.color === 'rose' ? 'border-rose-400/60 bg-rose-500/5' :
                  activeHighlight?.color === 'sky' ? 'border-sky-400/60 bg-sky-500/5' :
                  isIvoryMode ? 'border-[#E2D9CB] bg-white' : 'border-[#1A2438] bg-[#0C121E]';

                return (
                  <div 
                    key={clause.number}
                    className={`group relative p-5 sm:p-6 rounded-2xl border transition-all duration-200 shadow-sm ${highlightBorder}`}
                  >
                    {/* Clause Header & Annotation Toolstrip */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/5 dark:border-white/5 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#C5A880]/20 text-[#8C6D3B] dark:text-[#C5A880] font-mono text-xs font-bold flex items-center justify-center">
                          {clause.number}
                        </span>
                        <h4 className="text-xs uppercase tracking-wider font-mono font-bold text-[#8C6D3B] dark:text-[#DFBE82]">
                          {clause.title}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[#8C98AE]">
                          {clause.category}
                        </span>
                      </div>

                      {/* Clause Action Buttons */}
                      <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleQuickHighlightClause(clause.number)}
                          className="px-2.5 py-1 rounded-lg bg-[#141C2B] hover:bg-[#1E283C] text-[11px] font-mono text-[#C5A880] border border-[#222F46] flex items-center gap-1 transition-all"
                          title="Highlight clause with selected color"
                        >
                          <Highlighter className="w-3 h-3" />
                          <span className="hidden sm:inline">Highlight</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setComposerClauseNum(clause.number);
                            setNewNoteTitle(`Clause ${clause.number} Counsel Note`);
                            setIsComposingNote(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#C5A880]/20 hover:bg-[#C5A880] hover:text-[#0A0E17] text-[11px] font-mono text-[#E4C999] border border-[#C5A880]/40 flex items-center gap-1 transition-all"
                          title="Attach a sticky-note to this clause"
                        >
                          <StickyNote className="w-3 h-3" />
                          <span>Attach Note</span>
                        </button>
                      </div>
                    </div>

                    {/* Clause Text */}
                    <p className={`text-xs sm:text-sm font-serif leading-relaxed ${
                      isIvoryMode ? 'text-[#242A35]' : 'text-[#CFD9E8]'
                    }`}>
                      {clause.text}
                    </p>

                    {clause.statutoryBasis && (
                      <div className="mt-3 text-[11px] font-mono text-[#8C98AE] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                        <span>Statutory Framework: {clause.statutoryBasis}</span>
                      </div>
                    )}

                    {/* Pinned Sticky Notes Layer under or beside clause */}
                    {stickyNotes.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 space-y-2.5">
                        <div className="text-[10px] uppercase font-mono tracking-wider text-[#C5A880] flex items-center gap-1">
                          <StickyNote className="w-3 h-3 text-[#C5A880]" />
                          <span>Counsel Sticky Notes Pinned ({stickyNotes.length}):</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {stickyNotes.map((note) => {
                            const noteColor = 
                              note.color === 'amber' ? 'bg-[#2A2111] border-amber-500/50 text-amber-200' :
                              note.color === 'emerald' ? 'bg-[#0E261A] border-emerald-500/50 text-emerald-200' :
                              note.color === 'rose' ? 'bg-[#2A1116] border-rose-500/50 text-rose-200' :
                              'bg-[#102235] border-sky-500/50 text-sky-200';

                            return (
                              <div 
                                key={note.id}
                                className={`relative p-3.5 rounded-xl border shadow-lg transition-all ${noteColor} flex flex-col justify-between`}
                              >
                                {/* Tape / Tack Graphic decoration */}
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-white/20 backdrop-blur-sm rounded shadow-inner rotate-1" />

                                <div>
                                  <div className="flex items-center justify-between mb-1 text-[11px] font-bold">
                                    <span className="truncate pr-2">{note.title}</span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => handleToggleResolved(note.id)}
                                        className={`p-1 rounded hover:bg-black/20 ${
                                          note.isResolved ? 'text-emerald-400' : 'text-slate-400'
                                        }`}
                                        title={note.isResolved ? 'Mark as Active' : 'Mark as Settled / Resolved'}
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteAnnotation(note.id)}
                                        className="p-1 rounded hover:bg-black/20 text-slate-400 hover:text-red-400"
                                        title="Delete note"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <p className="text-xs leading-relaxed font-sans mb-3 text-slate-100">
                                    {note.noteText}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                                  <span>{note.author.name}</span>
                                  <span>{note.timestamp}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Annotation Drawer & Sticky Notes Index */}
          <div className="w-full lg:w-80 bg-[#0A0E17] border-t lg:border-t-0 lg:border-l border-[#1C263A] flex flex-col">
            
            {/* Drawer Header & Filter Tabs */}
            <div className="p-4 bg-[#0F1626] border-b border-[#222E46] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <StickyNote className="w-4 h-4 text-[#C5A880]" />
                  <span>Annotations Index ({annotations.length})</span>
                </span>
                <span className="text-[10px] text-emerald-400">
                  {annotations.filter(a => a.type === 'sticky-note').length} Notes Pinned
                </span>
              </div>

              {/* Search Notes */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#6E7D93] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter annotations..."
                  className="w-full bg-[#131B2A] border border-[#232F46] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#5A6578] focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              {/* Type Filter Buttons */}
              <div className="flex items-center gap-1 p-1 bg-[#131A26] border border-[#202E42] rounded-lg text-xs font-mono">
                <button
                  onClick={() => setFilterType('all')}
                  className={`flex-1 py-1 rounded text-center transition-colors ${
                    filterType === 'all' ? 'bg-[#C5A880] text-[#0A0E17] font-bold' : 'text-[#8C98AE]'
                  }`}
                >
                  All ({annotations.length})
                </button>
                <button
                  onClick={() => setFilterType('sticky-note')}
                  className={`flex-1 py-1 rounded text-center transition-colors ${
                    filterType === 'sticky-note' ? 'bg-[#C5A880] text-[#0A0E17] font-bold' : 'text-[#8C98AE]'
                  }`}
                >
                  Notes
                </button>
                <button
                  onClick={() => setFilterType('highlight')}
                  className={`flex-1 py-1 rounded text-center transition-colors ${
                    filterType === 'highlight' ? 'bg-[#C5A880] text-[#0A0E17] font-bold' : 'text-[#8C98AE]'
                  }`}
                >
                  Highlights
                </button>
              </div>
            </div>

            {/* Annotations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredAnnotations.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#6F7E94] italic font-mono space-y-2">
                  <StickyNote className="w-8 h-8 text-[#2A374E] mx-auto" />
                  <p>No annotations match your filter.</p>
                  <button
                    onClick={() => setIsComposingNote(true)}
                    className="text-[#C5A880] underline not-italic"
                  >
                    Create the first note
                  </button>
                </div>
              ) : (
                filteredAnnotations.map((ann) => {
                  const tagColor = 
                    ann.color === 'amber' ? 'border-amber-500/40 text-amber-300 bg-amber-500/10' :
                    ann.color === 'emerald' ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' :
                    ann.color === 'rose' ? 'border-rose-500/40 text-rose-300 bg-rose-500/10' :
                    'border-sky-500/40 text-sky-300 bg-sky-500/10';

                  return (
                    <div 
                      key={ann.id}
                      className={`p-3 rounded-xl bg-[#0E1524] border transition-all hover:border-[#C5A880]/50 space-y-2 ${
                        ann.isResolved ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${tagColor}`}>
                            Clause {ann.clauseNumber}
                          </span>
                          <span className="text-[10px] font-mono text-[#8C98AE]">
                            {ann.type === 'sticky-note' ? '📌 Note' : '🖍 Highlight'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleResolved(ann.id)}
                            className={`p-1 rounded ${ann.isResolved ? 'text-emerald-400' : 'text-slate-500 hover:text-white'}`}
                            title={ann.isResolved ? 'Mark active' : 'Mark resolved'}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnnotation(ann.id)}
                            className="p-1 rounded text-slate-500 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h5 className="text-xs font-bold text-white truncate">
                        {ann.title}
                      </h5>

                      {ann.noteText && (
                        <p className="text-xs text-[#A6B4C8] leading-relaxed line-clamp-3">
                          {ann.noteText}
                        </p>
                      )}

                      <div className="pt-2 border-t border-[#1C263A] flex items-center justify-between text-[10px] font-mono text-[#6A788E]">
                        <span>{ann.author.name}</span>
                        <span>{ann.timestamp}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary Strip */}
            <div className="p-3 bg-[#0F1626] border-t border-[#1E283C] text-[11px] font-mono text-[#8C98AE] flex items-center justify-between">
              <span>Section 134 Privileged</span>
              <span className="text-[#C5A880]">KICA § 83B Audit Log</span>
            </div>

          </div>

        </div>

        {/* Modal Popover for Composing a New Sticky Note */}
        {isComposingNote && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-lg bg-[#0E1524] border border-[#C5A880]/60 rounded-2xl p-6 shadow-2xl text-slate-200 space-y-4">
              
              <div className="flex items-center justify-between border-b border-[#202E44] pb-3">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-[#C5A880]" />
                  <h4 className="text-base font-cinzel text-white font-bold">
                    Add Precedent Sticky Note
                  </h4>
                </div>
                <button
                  onClick={() => setIsComposingNote(false)}
                  className="p-1 text-[#8C98AE] hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAnnotation} className="space-y-4">
                {/* Target Clause Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#BAC5D6] block">
                    Attach to Clause
                  </label>
                  <select
                    value={composerClauseNum}
                    onChange={(e) => setComposerClauseNum(Number(e.target.value))}
                    className="w-full bg-[#131B2A] border border-[#232F46] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  >
                    {clauses.map((c) => (
                      <option key={c.number} value={c.number}>
                        Clause {c.number}: {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Note Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#BAC5D6] block">
                    Sticky Note Heading
                  </label>
                  <input
                    type="text"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="e.g. Ratio Analysis / Counsel Strategy / Precedent Rule"
                    className="w-full bg-[#131B2A] border border-[#232F46] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    required
                  />
                </div>

                {/* Note Content */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#BAC5D6] block">
                    Counsel Observations / Statutory Note
                  </label>
                  <textarea
                    rows={4}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Enter actionable legal observations, ratio decidendi breakdown, or client advice..."
                    className="w-full bg-[#131B2A] border border-[#232F46] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C5A880] leading-relaxed"
                    required
                  />
                </div>

                {/* Color & Affiliation Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#BAC5D6] block">
                      Sticky Note Color
                    </label>
                    <div className="flex items-center gap-2">
                      {(['amber', 'emerald', 'rose', 'sky'] as const).map((c) => {
                        const bg = 
                          c === 'amber' ? 'bg-amber-400' :
                          c === 'emerald' ? 'bg-emerald-400' :
                          c === 'rose' ? 'bg-rose-400' : 'bg-sky-400';
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setActiveColor(c)}
                            className={`w-6 h-6 rounded-full ${bg} transition-all ${
                              activeColor === c ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-50 hover:opacity-100'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#BAC5D6] block">
                      Author Attribution
                    </label>
                    <select
                      value={newNoteAuthorAffiliation}
                      onChange={(e) => setNewNoteAuthorAffiliation(e.target.value as any)}
                      className="w-full bg-[#131B2A] border border-[#232F46] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    >
                      <option value="Senior Counsel">Senior Counsel (Milton Angwenyi, SC)</option>
                      <option value="Partner">Partner (David Otieno)</option>
                      <option value="Instructing Client">Instructing Corporate Counsel</option>
                      <option value="Associate">Chambers Associate</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#202E44] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsComposingNote(false)}
                    className="px-4 py-2 rounded-xl bg-[#141C2B] hover:bg-[#1D273A] text-xs font-semibold text-[#8C98AE]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#DFBE82] text-[#0A0E17] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#C5A880]/20"
                  >
                    Pin Sticky Note
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
