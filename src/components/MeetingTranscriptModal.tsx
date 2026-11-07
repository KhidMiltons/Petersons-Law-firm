import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, Search, Download, Copy, Check, Play, Pause, 
  RotateCcw, Volume2, ShieldCheck, Quote, Clock, 
  User, CheckCircle2, ChevronRight, FileText, Sparkles, 
  Share2, Bookmark, SlidersHorizontal
} from 'lucide-react';
import { ConsultationRecord, ClientMatter } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

interface MeetingTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: ConsultationRecord | null;
  matter: ClientMatter;
  onOpenLegalSummary?: (transcriptText: string, title: string) => void;
}

interface DialogueTurn {
  id: string;
  timestampSeconds: number;
  timestampFormatted: string;
  speaker: string;
  role: string;
  isLeadCounsel: boolean;
  content: string;
  sentiment: 'Confident' | 'Strategic Directive' | 'Procedural Friction' | 'Client Assurance';
}

export const MeetingTranscriptModal: React.FC<MeetingTranscriptModalProps> = ({
  isOpen,
  onClose,
  consultation,
  matter,
  onOpenLegalSummary
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1.0 | 1.5 | 2.0>(1.0);
  const [copiedTurnId, setCopiedTurnId] = useState<string | null>(null);
  const [copiedAllNotice, setCopiedAllNotice] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [selectedTurnId, setSelectedTurnId] = useState<string | null>(null);

  // Generate authentic dialogue turns based on consultation topic and matter
  const dialogueTurns: DialogueTurn[] = useMemo(() => {
    if (!consultation) return [];

    const isFIDIC = consultation.summaryNotes.toLowerCase().includes('fidic') || consultation.reference.includes('1042');
    const leadCounsel = consultation.advocateName || matter.leadAdvocate;

    if (isFIDIC) {
      return [
        {
          id: 'turn-1',
          timestampSeconds: 15,
          timestampFormatted: '00:00:15',
          speaker: leadCounsel,
          role: consultation.advocateRole || 'Senior Counsel & Managing Partner',
          isLeadCounsel: true,
          content: 'Good afternoon, colleagues and client counsel. We are convening this emergency strategy conference pursuant to urgent instructions regarding the Mara Towers project. As of 08:00 this morning, Pacific Continental Contractors served a purported notice of default threatening to trigger the performance securities.',
          sentiment: 'Strategic Directive'
        },
        {
          id: 'turn-2',
          timestampSeconds: 84,
          timestampFormatted: '00:01:24',
          speaker: 'Dr. Stella Mwangi',
          role: 'General Counsel, Consolidated Infrastructure Developers Ltd',
          isLeadCounsel: false,
          content: 'Thank you, Senior Counsel. Our primary commercial vulnerability is the USD 5,000,000 performance bond domiciled at Standard Chartered Bank. If the contractor encashes that bond, our credit covenants with international syndication partners will trigger automatic default. We require an immediate conservatory injunction before 09:00 AM tomorrow.',
          sentiment: 'Procedural Friction'
        },
        {
          id: 'turn-3',
          timestampSeconds: 182,
          timestampFormatted: '00:03:02',
          speaker: 'Brian Kipkemboi Cheruiyot',
          role: 'Partner & Head of Infrastructure Practice',
          isLeadCounsel: true,
          content: 'Dr. Mwangi, we have already drafted the Chamber Summons under Certificate of Urgency pursuant to Order 51 Rule 1. The supporting affidavit demonstrates that the 184-day delay is attributable solely to the contractor’s unapproved change of concrete batching supplier. The balance of convenience overwhelmingly favors granting the conservatory orders.',
          sentiment: 'Confident'
        },
        {
          id: 'turn-4',
          timestampSeconds: 295,
          timestampFormatted: '00:04:55',
          speaker: 'Eng. David Kamau',
          role: 'Managing Director, CID Ltd',
          isLeadCounsel: false,
          content: 'Bureau Veritas has finalized the borehole core extraction and ultrasonic pulse velocity telemetry. Their structural quantum report certifies that column foundation settlement resulted from defective pouring in water-saturated soil. Can this telemetry be entered directly into the court record without opposing counsel disputing admissibility?',
          sentiment: 'Client Assurance'
        },
        {
          id: 'turn-5',
          timestampSeconds: 410,
          timestampFormatted: '00:06:50',
          speaker: leadCounsel,
          role: consultation.advocateRole || 'Senior Counsel & Managing Partner',
          isLeadCounsel: true,
          content: 'Precisely. Under Section 106B of the Kenya Evidence Act (Cap 80), we will execute a Certificate of Electronic Records affirming the unbroken cryptographic chain of custody of the Bureau Veritas sensors. Furthermore, we are directing KCB Bank Upper Hill to ringfence our trust escrow ledger so the arbitrator sees total fiscal bona fides.',
          sentiment: 'Confident'
        },
        {
          id: 'turn-6',
          timestampSeconds: 560,
          timestampFormatted: '00:09:20',
          speaker: 'Dr. Stella Mwangi',
          role: 'General Counsel, CID Ltd',
          isLeadCounsel: false,
          content: 'That completely resolves the board’s anxiety. Once the ex-parte order is obtained and served on Standard Chartered and Pacific Continental, what is the timetable for filing the formal arbitral statement of claim before the NCIA Registrar?',
          sentiment: 'Client Assurance'
        },
        {
          id: 'turn-7',
          timestampSeconds: 685,
          timestampFormatted: '00:11:25',
          speaker: leadCounsel,
          role: consultation.advocateRole || 'Senior Counsel & Managing Partner',
          isLeadCounsel: true,
          content: 'We will file the substantive Statement of Claim within 14 days under NCIA Rule 19, claiming accrued liquidated damages of USD $8,280,000 plus contractual commercial interest at 14% per annum. Brian and I will lead the oral witness examination before the tribunal on 25 November.',
          sentiment: 'Strategic Directive'
        }
      ];
    } else {
      // Default / Standard Commercial Dispute Dialogue
      return [
        {
          id: 'turn-1',
          timestampSeconds: 10,
          timestampFormatted: '00:00:10',
          speaker: leadCounsel,
          role: consultation.advocateRole || 'Lead Counsel',
          isLeadCounsel: true,
          content: `Welcome, instructing legal officers. We are conducting our comprehensive hearing preparation conference for docket ${matter.reference}. Today we will confirm our trial witness readiness and review the digital pleadings on the judiciary CTS bridge.`,
          sentiment: 'Strategic Directive'
        },
        {
          id: 'turn-2',
          timestampSeconds: 75,
          timestampFormatted: '00:01:15',
          speaker: 'Instructing Legal Counsel',
          role: `Corporate Legal Representative, ${matter.clientEntity}`,
          isLeadCounsel: false,
          content: `Senior Counsel, the board has authorized full defense and instructed us to ensure that the interim conservatory stay remains strictly enforced. We want to verify that opposing counsel has filed their list of authorities on time.`,
          sentiment: 'Confident'
        },
        {
          id: 'turn-3',
          timestampSeconds: 190,
          timestampFormatted: '00:03:10',
          speaker: leadCounsel,
          role: consultation.advocateRole || 'Lead Counsel',
          isLeadCounsel: true,
          content: `Our litigation team inspected the Kenya Judiciary CTS portal at 09:14 this morning. The opposing party has failed to lodge supplementary affidavits within the statutory 7-day timeline. We have registered for priority mention before Lady Justice Muchemi to close discovery and enter substantive judgment.`,
          sentiment: 'Confident'
        },
        {
          id: 'turn-4',
          timestampSeconds: 310,
          timestampFormatted: '00:05:10',
          speaker: 'Instructing Legal Counsel',
          role: `Corporate Legal Representative, ${matter.clientEntity}`,
          isLeadCounsel: false,
          content: `That gives our executive leadership tremendous reassurance. Please ensure certified transcripts of this session are transmitted to our corporate secretary file under Section 134 privilege.`,
          sentiment: 'Client Assurance'
        }
      ];
    }
  }, [consultation, matter]);

  const totalDurationSeconds = useMemo(() => {
    if (dialogueTurns.length === 0) return 720;
    return dialogueTurns[dialogueTurns.length - 1].timestampSeconds + 45;
  }, [dialogueTurns]);

  // Audio timer simulation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSeconds(prev => {
        const next = prev + 1 * playbackSpeed;
        if (next >= totalDurationSeconds) {
          setIsPlaying(false);
          return totalDurationSeconds;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalDurationSeconds]);

  // Format mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Filter dialogue turns by search query
  const filteredTurns = useMemo(() => {
    if (!searchQuery.trim()) return dialogueTurns;
    const q = searchQuery.toLowerCase();
    return dialogueTurns.filter(turn => 
      turn.content.toLowerCase().includes(q) ||
      turn.speaker.toLowerCase().includes(q) ||
      turn.role.toLowerCase().includes(q)
    );
  }, [dialogueTurns, searchQuery]);

  // Highlight search matches
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-[#C5A880]/40 text-white font-bold px-1 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Copy single dialogue block with citation
  const handleCopyTurn = (turn: DialogueTurn) => {
    const citation = `[${turn.timestampFormatted}] ${turn.speaker} (${turn.role}):\n"${turn.content}"\n[Citation: PAA Chambers Meeting Transcript · Docket ${matter.reference} · Sec. 134 Evidence Act Privileged]`;
    navigator.clipboard.writeText(citation);
    setCopiedTurnId(turn.id);
    setTimeout(() => setCopiedTurnId(null), 3000);
  };

  // Copy all transcript
  const handleCopyAll = () => {
    const fullTranscript = `REPUBLIC OF KENYA - PETERSONS ANGWENYI & ASSOCIATES ADVOCATES
CHAMBERS PRIVILEGED MEETING TRANSCRIPT
DOCKET: ${matter.reference} | CTS ID: ${matter.ctsNumber}
MATTER TITLE: ${matter.caseTitle}
CONSULTATION REF: ${consultation?.reference || 'CONF-RECORD'}
DATE: ${consultation?.scheduledDate || 'Certified Session'} | COUNSEL: ${consultation?.advocateName || matter.leadAdvocate}
STATUTORY PRIVILEGE: Section 134 Evidence Act (Cap 80)

================================================================================
VERBATIM DIALOGUE TRANSCRIPT:
================================================================================
${dialogueTurns.map(t => `[${t.timestampFormatted}] ${t.speaker} (${t.role}):\n"${t.content}"\n`).join('\n')}
================================================================================
CERTIFIED ELECTRONIC TRANSCRIPT
Petersons Angwenyi & Associates Advocates, Upper Hill, Nairobi`;

    navigator.clipboard.writeText(fullTranscript);
    setCopiedAllNotice(true);
    setTimeout(() => setCopiedAllNotice(false), 3000);
  };

  // Download transcript memo (.txt)
  const handleDownloadTranscript = () => {
    const fullTranscript = `================================================================================
REPUBLIC OF KENYA - PETERSONS ANGWENYI & ASSOCIATES ADVOCATES
OFFICIAL PRIVILEGED MEETING TRANSCRIPT RECORD
================================================================================
Client Entity: ${matter.clientEntity}
Docket Reference: ${matter.reference}
Judiciary CTS E-Filing ID: ${matter.ctsNumber}
Matter Title: ${matter.caseTitle}
Consultation Reference: ${consultation?.reference || 'PAA-CONF'}
Date of Record: ${consultation?.scheduledDate || 'Certified Session'}
Location / Modality: ${consultation?.forumLocation || 'Chambers Boardroom Suite'}
Lead Counsel: ${consultation?.advocateName || matter.leadAdvocate}
Statutory Protection: Section 134 Kenya Evidence Act (Cap 80)

--------------------------------------------------------------------------------
VERBATIM SPEECH-TO-TEXT LOG:
--------------------------------------------------------------------------------
${dialogueTurns.map(t => `[${t.timestampFormatted}] ${t.speaker.toUpperCase()} (${t.role}):
${t.content}
`).join('\n')}
--------------------------------------------------------------------------------
CERTIFICATION OF ACCURACY:
I hereby certify under the Advocates Act (Cap 16) that this electronic transcript 
faithfully reproduces the verbatim oral deliberations recorded in the Chambers of 
Petersons Angwenyi & Associates Advocates on the date aforementioned.

Digitally Sealed: Chambers Litigation Stenography Desk
Petersons Angwenyi & Associates Advocates, Mara Road, Upper Hill, Nairobi
================================================================================`;

    const blob = new Blob([fullTranscript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VERBATIM_TRANSCRIPT_${consultation?.reference || 'MEETING'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotice('Official Certified Meeting Transcript downloaded (.txt)');
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  if (!isOpen || !consultation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#090D15] border border-[#C5A880]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0E1522] border-b border-[#1E293B] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 flex items-center justify-center text-[#C5A880] border border-[#C5A880]/30 shrink-0 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-cinzel text-white">
                  Verbatim Meeting Transcript & Speech Log
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-semibold">
                  Section 134 Privileged
                </span>
                <span className="text-xs text-[#526079] hidden sm:inline">|</span>
                <span className="text-xs text-[#C5A880] font-mono font-medium">
                  {consultation.reference}
                </span>
              </div>
              <p className="text-xs text-[#8C98AE] mt-0.5">
                Session: {consultation.scheduledDate} · Counsel: <strong className="text-white font-medium">{consultation.advocateName}</strong> · Venue: {consultation.forumLocation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-[#8C98AE] hover:text-white rounded-lg transition-colors"
              title="Close Transcript"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast */}
        {downloadNotice && (
          <div className="mx-6 mt-3 p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadNotice}</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400/80 font-semibold">Advocates Act Certified</span>
          </div>
        )}

        {/* Synchronized Audio Player Bar */}
        <div className="px-6 py-3 bg-[#0B1019] border-b border-[#1A2538] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center font-bold transition-all shadow-md shadow-emerald-500/25 shrink-0"
              title={isPlaying ? 'Pause Speech Stream' : 'Play Meeting Audio Synchronizer'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => setCurrentSeconds(0)}
              className="p-2 text-[#8C98AE] hover:text-white rounded-lg hover:bg-[#151F30] transition-colors"
              title="Restart from Beginning"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 font-mono text-xs text-[#C5A880]">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">{formatTime(currentSeconds)}</span>
              <span className="text-[#516075]">/ {formatTime(totalDurationSeconds)}</span>
            </div>

            {/* Playback speed multiplier */}
            <button
              type="button"
              onClick={() => setPlaybackSpeed(s => s === 1.0 ? 1.5 : s === 1.5 ? 2.0 : 1.0)}
              className="px-2 py-0.5 rounded bg-[#162134] text-[#E4C999] hover:bg-[#202E48] text-[11px] font-mono font-bold border border-[#273852]"
              title="Audio Speed"
            >
              {playbackSpeed.toFixed(1)}x
            </button>
          </div>

          {/* Quick Actions (Download, Copy, & Generate Legal Briefing) */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {onOpenLegalSummary && (
              <button
                type="button"
                onClick={() => {
                  const fullText = dialogueTurns.map(t => `[${t.timestampFormatted}] ${t.speaker} (${t.role}): "${t.content}"`).join('\n\n');
                  onOpenLegalSummary(fullText, `Verbatim Conference Transcript: ${consultation.reference}`);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C5A880]/15 hover:bg-[#C5A880] text-[#C5A880] hover:text-[#0A0E17] rounded-lg text-xs font-semibold border border-[#C5A880]/40 transition-all shadow-sm"
                title="Synthesize Executive Legal Summary with Gemini / Institutional Engine"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Legal Summary</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141C2B] hover:bg-[#1E293B] text-[#A6B4CD] hover:text-white rounded-lg text-xs border border-[#222E42] transition-colors"
            >
              {copiedAllNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#C5A880]" />}
              <span>{copiedAllNotice ? 'Copied Transcript' : 'Copy All'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTranscript}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172236] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] rounded-lg text-xs font-semibold border border-[#C5A880]/30 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.txt)</span>
            </button>
          </div>
        </div>

        {/* In-Transcript Keyword Search Bar */}
        <div className="px-6 py-2.5 bg-[#080C14] border-b border-[#182334] flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#637085] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transcript by keyword (e.g., 'injunction', 'escrow', 'delay', 'expert', 'bond')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111724] border border-[#202C40] rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-[#515D70] focus:outline-none focus:border-[#C5A880]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#718099] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-[11px] font-mono text-[#8C98AE] shrink-0">
            {filteredTurns.length} of {dialogueTurns.length} statements
          </span>
        </div>

        {/* Verbatim Turn-by-Turn Dialogue Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredTurns.length === 0 ? (
            <div className="text-center py-12 p-6 bg-[#0E1522] rounded-2xl border border-[#1E293B] space-y-2 text-xs text-[#8C98AE]">
              No statements found matching "{searchQuery}".
            </div>
          ) : (
            filteredTurns.map((turn) => {
              const isActiveAudio = currentSeconds >= turn.timestampSeconds && 
                (dialogueTurns[dialogueTurns.indexOf(turn) + 1] ? currentSeconds < dialogueTurns[dialogueTurns.indexOf(turn) + 1].timestampSeconds : true);
              const isSelected = selectedTurnId === turn.id;

              return (
                <div
                  key={turn.id}
                  onClick={() => setSelectedTurnId(turn.id)}
                  className={`p-4 rounded-xl border transition-all space-y-2 relative group ${
                    isActiveAudio && isPlaying
                      ? 'bg-[#152136] border-[#C5A880] ring-1 ring-[#C5A880]/40 shadow-lg shadow-[#C5A880]/5'
                      : turn.isLeadCounsel
                      ? 'bg-[#0E1522] border-[#1E2A3E]'
                      : 'bg-[#0B1019] border-[#172132]'
                  }`}
                >
                  {/* Speaker Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A2538] pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        turn.isLeadCounsel
                          ? 'bg-[#C5A880]/20 text-[#E4C999] border border-[#C5A880]/40'
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {turn.speaker.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-white">
                            {turn.speaker}
                          </span>
                          <span className="text-[10px] font-mono text-[#8C98AE] bg-[#141C2B] px-1.5 py-0.2 rounded border border-[#1E2A3E]">
                            {turn.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {/* Clickable Timestamp */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSeconds(turn.timestampSeconds);
                          setIsPlaying(true);
                        }}
                        className="px-2 py-0.5 rounded bg-[#131A26] hover:bg-[#1E2A3C] text-[10px] font-mono text-emerald-400 flex items-center gap-1 border border-[#1E293B] transition-colors"
                        title="Seek audio to this point"
                      >
                        <Clock className="w-3 h-3 text-[#C5A880]" />
                        <span>{turn.timestampFormatted}</span>
                      </button>

                      {/* Sentiment Tag */}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        turn.sentiment === 'Strategic Directive'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-600/40'
                          : turn.sentiment === 'Confident'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'
                          : 'bg-blue-950/60 text-blue-300 border-blue-600/40'
                      }`}>
                        {turn.sentiment}
                      </span>

                      {/* Copy Statement Citation */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyTurn(turn);
                        }}
                        className="p-1 text-[#718096] hover:text-white rounded hover:bg-[#182335] transition-colors"
                        title="Copy Quote with Citation"
                      >
                        {copiedTurnId === turn.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Verbatim Statement Text */}
                  <p className="text-xs sm:text-sm text-[#BAC8DC] leading-relaxed font-sans pl-1">
                    "{highlightMatch(turn.content, searchQuery)}"
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#0A0E17] border-t border-[#1E293B] flex items-center justify-between text-xs text-[#718096]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0" />
            <span>
              Transcript recorded and transcribed under the <strong>Advocates Act (Cap 16)</strong> and Law Society of Kenya Rules.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#172236] hover:bg-[#202E48] text-white text-xs font-semibold rounded-lg border border-[#23334E] transition-colors"
          >
            Close Transcript
          </button>
        </div>

      </div>
    </div>
  );
};
