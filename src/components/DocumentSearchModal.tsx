import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, X, FileText, Eye, Download, Highlighter, 
  ScanText, PenTool, CheckCircle2, ShieldCheck, Filter, 
  ChevronRight, AlertCircle, ArrowUpRight, Scale, Clock, 
  Building2, Lock, Fingerprint, Sparkles
} from 'lucide-react';
import { MatterDocument, ClientMatter } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

interface DocumentSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: MatterDocument[];
  matter: ClientMatter;
  onPreview: (doc: MatterDocument) => void;
  onAnnotate: (doc: MatterDocument) => void;
  onOcr: (doc: MatterDocument) => void;
  onSign: (doc: MatterDocument) => void;
  onDownload: (doc: MatterDocument) => void;
  onSummary?: (doc: MatterDocument) => void;
}

const QUICK_SEARCH_TOPICS = [
  'Injunction',
  'Verifying Affidavit',
  'Geotechnical',
  'Performance Bond',
  'FIDIC',
  'Milton Angwenyi',
  'Section 134',
  'Lady Justice Wambui',
  'Jurisdiction'
];

export const DocumentSearchModal: React.FC<DocumentSearchModalProps> = ({
  isOpen,
  onClose,
  documents,
  matter,
  onPreview,
  onAnnotate,
  onOcr,
  onSign,
  onDownload,
  onSummary
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlySigned, setOnlySigned] = useState(false);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Highlight matched terms
  const highlightMatch = (text: string, term: string) => {
    if (!term.trim()) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-[#C5A880]/35 text-[#FFE8C2] font-semibold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Filtered documents
  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    return documents.filter((doc) => {
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesSigned = !onlySigned || doc.isSigned;
      
      if (!matchesCategory || !matchesSigned) return false;

      if (!q) return true;

      return (
        doc.name.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q) ||
        doc.signatory.toLowerCase().includes(q) ||
        doc.ctsHash.toLowerCase().includes(q) ||
        doc.date.toLowerCase().includes(q)
      );
    });
  }, [documents, query, selectedCategory, onlySigned]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0A0E17] border border-[#C5A880]/50 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-200 space-y-4">
        
        {/* Search Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F1626] via-[#121B2F] to-[#0F1626] border-b border-[#222E46] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center text-[#E4C999] shrink-0">
              <Search className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#C5A880] uppercase tracking-wider">
                <span>Chambers Case Repository Search</span>
                <span>·</span>
                <span className="text-emerald-400">Section 134 Privileged</span>
              </div>
              <h3 className="text-base sm:text-lg font-cinzel text-white font-bold">
                E-Discovery & Document Full-Text Search
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#162136] text-[10px] font-mono text-[#8C98AE]">
              ESC to close
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8C98AE] hover:text-white rounded-lg hover:bg-[#1A2436] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Controls */}
        <div className="px-5 space-y-3">
          
          {/* Main Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keywords (e.g., Injunction, Performance Bond, FIDIC, Affidavit, Lady Justice Wambui)..."
              className="w-full bg-[#121927] border border-[#232F46] rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-[#5A6578] focus:outline-none focus:border-[#C5A880] shadow-inner"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Query Suggestion Tags */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-[#8C98AE]">
            <span className="text-[11px] mr-1">Quick Topics:</span>
            {QUICK_SEARCH_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setQuery(topic)}
                className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border transition-colors ${
                  query.toLowerCase() === topic.toLowerCase()
                    ? 'border-[#C5A880] bg-[#C5A880]/15 text-[#E4C999]'
                    : 'border-[#1E293B] bg-[#0E1522] hover:border-[#2C3B57] text-[#94A3B8] hover:text-white'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Category & Signed Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[#1C2638] text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[#8C98AE] mr-1">Category:</span>
              {['all', 'Pleadings', 'Judicial Order', 'Submissions', 'Evidence'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg border text-xs transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'border-[#C5A880] bg-[#C5A880]/15 text-[#E4C999] font-semibold'
                      : 'border-[#1E2A3E] bg-[#121927] text-[#8C98AE] hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#8C98AE] select-none shrink-0">
              <input
                type="checkbox"
                checked={onlySigned}
                onChange={(e) => setOnlySigned(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#232F46] text-[#C5A880] bg-[#121927] focus:ring-0"
              />
              <span>Digitally Signed Only</span>
            </label>
          </div>

        </div>

        {/* Results List */}
        <div className="px-5 pb-5 space-y-3 max-h-[460px] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-[#8C98AE] px-1">
            <span>Showing {filteredResults.length} indexed legal documents</span>
            <span className="font-mono text-[11px]">Matter: {matter.reference}</span>
          </div>

          {filteredResults.length === 0 ? (
            <div className="text-center py-10 bg-[#0E1522] rounded-xl border border-[#1E293B] space-y-2">
              <AlertCircle className="w-8 h-8 text-[#64748B] mx-auto" />
              <h5 className="text-sm font-semibold text-white">No documents matched "{query}"</h5>
              <p className="text-xs text-[#8C98AE] max-w-sm mx-auto">
                Try searching for related legal terms, judicial cause list numbers, or advocate signatories.
              </p>
              <button
                onClick={() => { setQuery(''); setSelectedCategory('all'); setOnlySigned(false); }}
                className="mt-2 text-xs text-[#C5A880] hover:underline"
              >
                Reset all search filters
              </button>
            </div>
          ) : (
            filteredResults.map((doc, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#0E1522] rounded-xl border border-[#1E293B] hover:border-[#C5A880]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs group"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-[#141F30] border border-[#23334E] flex items-center justify-center text-[#C5A880] shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm group-hover:text-[#E4C999] transition-colors">
                        {highlightMatch(doc.name, query)}
                      </span>
                      <span className="px-2 py-0.5 bg-[#172235] text-[10px] font-mono text-[#94A3B8] rounded border border-[#253654]">
                        {doc.category}
                      </span>
                      <span className="px-1.5 py-0.5 bg-emerald-950/60 text-[10px] font-mono text-emerald-400 rounded border border-emerald-800/40">
                        {doc.ctsHash}
                      </span>
                      {doc.isSigned && (
                        <span className="px-1.5 py-0.5 bg-emerald-950/80 text-[10px] font-mono text-emerald-300 rounded border border-emerald-500/50 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Digitally Signed</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#CBD5E1] line-clamp-2 leading-relaxed">
                      {highlightMatch(doc.summary, query)}
                    </p>

                    <div className="text-[11px] text-[#64748B] flex items-center gap-3 font-mono flex-wrap pt-0.5">
                      <span className="flex items-center gap-1 text-[#C5A880] font-sans font-medium">
                        <Clock className="w-3 h-3 text-[#C5A880]" />
                        <span>{doc.readTime || '6 min read'}</span>
                      </span>
                      <span>·</span>
                      <span>{doc.pages || 4} pages</span>
                      <span>·</span>
                      <span>Date: {doc.date}</span>
                      <span>·</span>
                      <span>Size: {doc.size}</span>
                      <span>·</span>
                      <span>Signatory: {highlightMatch(doc.signatory, query)}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action CTAs */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                  {onSummary && (
                    <button
                      onClick={() => { onClose(); onSummary(doc); }}
                      className="px-2.5 py-1.5 bg-[#172236] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#E4C999] rounded-lg border border-[#C5A880]/40 transition-all flex items-center gap-1 text-[11px]"
                      title="Generate Legal Executive Summary"
                    >
                      <Sparkles className="w-3 h-3 text-[#C5A880]" />
                      <span>Summary</span>
                    </button>
                  )}

                  <button
                    onClick={() => { onClose(); onSign(doc); }}
                    className="px-2.5 py-1.5 bg-[#152336] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#E4C999] font-medium rounded-lg border border-[#C5A880]/40 transition-all flex items-center gap-1 text-[11px]"
                    title="Digitally Sign Document"
                  >
                    <PenTool className="w-3 h-3" />
                    <span>Sign</span>
                  </button>

                  <button
                    onClick={() => { onClose(); onAnnotate(doc); }}
                    className="px-2.5 py-1.5 bg-[#172338] hover:bg-[#22334E] text-[#C5A880] rounded-lg border border-[#C5A880]/30 transition-all flex items-center gap-1 text-[11px]"
                    title="Review & Annotate"
                  >
                    <Highlighter className="w-3 h-3" />
                    <span>Annotate</span>
                  </button>

                  <button
                    onClick={() => { onClose(); onPreview(doc); }}
                    className="px-2.5 py-1.5 bg-[#121927] hover:bg-[#1C2638] text-white rounded-lg border border-[#232F46] transition-all flex items-center gap-1 text-[11px]"
                    title="Preview Document"
                  >
                    <Eye className="w-3 h-3 text-[#C5A880]" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => { onClose(); onDownload(doc); }}
                    className="px-2.5 py-1.5 bg-[#C5A880] text-[#0A0E17] font-semibold rounded-lg hover:brightness-110 transition-all flex items-center gap-1 text-[11px]"
                    title="Download File"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-[#0F1626] border-t border-[#1E293E] flex items-center justify-between text-xs text-[#8C98AE] px-5">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Advocate-Client transmission strictly protected under Section 134 Evidence Act (Cap 80).</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#172235] hover:bg-[#202E46] text-white rounded-lg transition-colors"
          >
            Close Search
          </button>
        </div>

      </div>
    </div>
  );
};
