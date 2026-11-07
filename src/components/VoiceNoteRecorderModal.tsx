import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Square, Play, Pause, Save, AlertCircle, ShieldCheck, Check, RotateCcw } from 'lucide-react';
import { VoiceMeetingNote, ClientMatter } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

interface VoiceNoteRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  matter: ClientMatter;
  onSaveNote: (note: VoiceMeetingNote) => void;
  counselName?: string;
}

export const VoiceNoteRecorderModal: React.FC<VoiceNoteRecorderModalProps> = ({
  isOpen,
  onClose,
  matter,
  onSaveNote,
  counselName = 'Milton Angwenyi, SC',
}) => {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dictationTranscript, setDictationTranscript] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedSeconds(0);
    setAudioBlobUrl(null);
    setIsSaved(false);
    setDictationTranscript('Listening to privileged oral dictation...');

    // Simulate real-time stream speech-to-text transcription
    setTimeout(() => {
      setDictationTranscript(
        `Privileged Counsel Dictation: Conference held with in-house legal counsel for ${matter.clientEntity}. Regarding ${matter.caseTitle}: We have reviewed the latest filings on the Kenya Judiciary CTS portal. Opposing party's preliminary objection lacks evidentiary merit under Section 6 of the Arbitration Act. Cross-examination of the geotechnical expert witness will proceed as scheduled on the next court appearance date. All discovery documents are certified under Section 106B of the Evidence Act.`
      );
    }, 3000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setAudioBlobUrl('simulated_audio_track');
  };

  const handleSave = () => {
    const finalSeconds = Math.max(12, recordedSeconds);
    const newNote: VoiceMeetingNote = {
      id: `vn-${Date.now()}`,
      duration: formatTime(finalSeconds),
      audioSeconds: finalSeconds,
      recordedBy: counselName,
      recordedRole: 'Privileged Counsel Dictation Memo',
      recordedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' EAT',
      waveform: [25, 45, 60, 80, 95, 85, 70, 50, 65, 85, 100, 75, 60, 40, 55, 75, 90, 65, 40, 20],
      transcript: dictationTranscript || `Oral strategy briefing recorded by ${counselName} regarding ${matter.caseTitle}. Privileged communication under Section 134 of the Evidence Act (Cap 80).`,
      statutoryPrivilegeRef: 'Section 134 Kenya Evidence Act (Cap 80) Privileged Dictation'
    };

    onSaveNote(newNote);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0C121D] border border-[#C5A880]/50 rounded-2xl shadow-2xl p-6 space-y-5 text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F2C42] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C5A880]/20 flex items-center justify-center text-[#C5A880]">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-cinzel text-white font-semibold">
                Record Counsel Voice Dictation
              </h3>
              <span className="text-[10px] text-[#C5A880] font-mono block">
                Privileged &amp; Confidential · Evidence Act Cap 80 S. 134
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8C98AE] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recorder Animation & Visualizer */}
        <div className="p-6 bg-[#080C14] rounded-xl border border-[#1A2538] text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            {isRecording && (
              <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
            )}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40'
                  : audioBlobUrl
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#151F32] text-[#C5A880] border border-[#263753]'
              }`}
            >
              <Mic className={`w-7 h-7 ${isRecording ? 'animate-pulse' : ''}`} />
            </div>
          </div>

          <div>
            <div className="text-2xl font-mono font-bold text-white tracking-widest">
              {formatTime(recordedSeconds)}
            </div>
            <span className="text-xs text-[#8C98AE] mt-1 block">
              {isRecording
                ? 'Recording oral dictation in 256-bit encrypted audio format...'
                : audioBlobUrl
                ? 'Dictation recorded & transcribed'
                : 'Click Start to record privileged counsel meeting notes'}
            </span>
          </div>

          {/* Simulated Waveform during recording */}
          {isRecording && (
            <div className="flex items-center justify-center gap-1 h-8">
              {[40, 70, 95, 60, 85, 100, 50, 75, 90, 65, 45, 80, 95, 60, 40].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#C5A880] rounded-full animate-pulse"
                  style={{
                    height: `${Math.max(15, Math.round(h * Math.random()))}%`,
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Recorder Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {!isRecording && !audioBlobUrl && (
              <button
                type="button"
                onClick={handleStartRecording}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Start Dictation</span>
              </button>
            )}

            {isRecording && (
              <button
                type="button"
                onClick={handleStopRecording}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg transition-all"
              >
                <Square className="w-4 h-4 text-rose-400" />
                <span>Stop Recording</span>
              </button>
            )}

            {!isRecording && audioBlobUrl && (
              <button
                type="button"
                onClick={handleStartRecording}
                className="px-3.5 py-2 bg-[#141E2F] hover:bg-[#1E2B42] text-[#8C98AE] hover:text-white rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-Record</span>
              </button>
            )}
          </div>
        </div>

        {/* Verbatim Transcription Preview */}
        {dictationTranscript && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#C5A880] font-semibold block">
              Real-Time Verbatim Speech Transcription:
            </span>
            <div className="p-3 bg-[#0A0E17] rounded-xl border border-[#1E2B40] text-xs text-[#C7D3E5] leading-relaxed max-h-32 overflow-y-auto font-mono">
              {dictationTranscript}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-[#1C283C] pt-4">
          <span className="text-[10px] text-[#637288] font-mono">
            Speaker: {counselName}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-[#8C98AE] hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!audioBlobUrl || isSaved}
              onClick={handleSave}
              className="px-4 py-2 bg-[#C5A880] text-[#0A0E17] rounded-xl text-xs font-semibold hover:brightness-110 disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved to File!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save to Consultation Record</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
