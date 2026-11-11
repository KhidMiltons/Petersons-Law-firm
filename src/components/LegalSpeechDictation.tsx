import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  Globe, 
  AlertCircle, 
  Check, 
  RotateCcw, 
  Info, 
  Square,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LegalSpeechDictationProps {
  value: string;
  onChange: (newValue: string) => void;
  onAppendText: (appendedText: string) => void;
  disabled?: boolean;
}

// Common spoken punctuation patterns in English and Swahili legal dictations
const formatSpokenPunctuation = (rawText: string, lang: string): string => {
  let formatted = rawText;

  if (lang.startsWith('sw')) {
    // Swahili spoken punctuation
    formatted = formatted
      .replace(/\s+(kitone|nukta)\b/gi, '.')
      .replace(/\s+(koma|mkato)\b/gi, ',')
      .replace(/\s+(alama ya kuuliza)\b/gi, '?')
      .replace(/\s+(mstari mpya)\b/gi, '\n')
      .replace(/\s+(aya mpya)\b/gi, '\n\n')
      .replace(/\s+(nukta pacha|koloni)\b/gi, ':')
      .replace(/\s+(nusu koloni)\b/gi, ';');
  } else {
    // English spoken punctuation
    formatted = formatted
      .replace(/\s+(full stop|period)\b/gi, '.')
      .replace(/\s+(comma)\b/gi, ',')
      .replace(/\s+(question mark)\b/gi, '?')
      .replace(/\s+(exclamation mark|exclamation point)\b/gi, '!')
      .replace(/\s+(new line|next line)\b/gi, '\n')
      .replace(/\s+(new paragraph)\b/gi, '\n\n')
      .replace(/\s+(colon)\b/gi, ':')
      .replace(/\s+(semi colon|semicolon)\b/gi, ';');
  }

  // Ensure first character after sentence ending is capitalized
  formatted = formatted.replace(/([.?!]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());

  return formatted;
};

export const LegalSpeechDictation: React.FC<LegalSpeechDictationProps> = ({
  value,
  onChange,
  onAppendText,
  disabled = false
}) => {
  const { language, t } = useLanguage();
  
  // Speech recognition state
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [speechLang, setSpeechLang] = useState<'en-KE' | 'sw-KE' | 'en-GB'>(
    language === 'sw' ? 'sw-KE' : 'en-KE'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [formatPunctuation, setFormatPunctuation] = useState<boolean>(true);
  const [showTips, setShowTips] = useState<boolean>(false);
  const [justAddedCount, setJustAddedCount] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const userStoppedRef = useRef<boolean>(false);

  // Sync default speech recognition language when site language changes
  useEffect(() => {
    if (!isListening) {
      setSpeechLang(language === 'sw' ? 'sw-KE' : 'en-KE');
    }
  }, [language, isListening]);

  // Check Web Speech API browser support on mount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Timer counter when active
  useEffect(() => {
    if (isListening) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  // Clean up recognition instance on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          userStoppedRef.current = true;
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Handle starting voice recognition
  const handleStartListening = useCallback(() => {
    setErrorMessage(null);
    userStoppedRef.current = false;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage(t('consult.dictateUnsupported'));
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const transcriptChunk = item[0].transcript;

          if (item.isFinal) {
            finalTrans += transcriptChunk + ' ';
          } else {
            interim += transcriptChunk;
          }
        }

        if (finalTrans.trim().length > 0) {
          const processed = formatPunctuation
            ? formatSpokenPunctuation(finalTrans, speechLang)
            : finalTrans;

          onAppendText(processed);
          setJustAddedCount((prev) => prev + processed.trim().split(/\s+/).length);
          setTimeout(() => setJustAddedCount(0), 2500);
        }

        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage(t('consult.dictatePermissionDenied'));
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          // Continuous speech often triggers no-speech in silent pauses; keep alive unless user stopped
        } else if (event.error === 'network') {
          setErrorMessage('Speech network connectivity error. Please ensure you are online.');
          setIsListening(false);
        } else {
          setErrorMessage(`Speech recognition notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setInterimTranscript('');
        // If not explicitly stopped by the user, we can resume listening for uninterrupted dictation
        if (!userStoppedRef.current && isListening) {
          try {
            recognition.start();
            return;
          } catch {
            // ignore
          }
        }
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to initialize speech recognition:', err);
      setErrorMessage(err?.message || 'Could not start microphone dictation.');
      setIsListening(false);
    }
  }, [speechLang, formatPunctuation, onAppendText, t, isListening]);

  // Handle stopping dictation
  const handleStopListening = useCallback(() => {
    userStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const formatTimer = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      {/* Control Strip & Speech Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
        
        {/* Left: Primary Dictate Toggle Button & Status */}
        <div className="flex items-center gap-2 flex-wrap">
          {isListening ? (
            <button
              type="button"
              onClick={handleStopListening}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-900/30 transition-all border border-red-400 animate-pulse cursor-pointer"
              title="Stop speech dictation"
              aria-label="Stop speech dictation"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t('consult.dictateStop')}</span>
              <span className="font-mono text-[11px] bg-red-950/80 px-1.5 py-0.2 rounded border border-red-500/40">
                {formatTimer(recordingSeconds)}
              </span>
            </button>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={handleStartListening}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#151F32] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#E4C999] text-xs font-semibold border border-[#C5A880]/40 hover:border-[#C5A880] transition-all shadow-sm group cursor-pointer disabled:opacity-40"
              title="Click to dictate your legal inquiry using Web Speech API"
              aria-label="Start voice dictation"
            >
              <Mic className="w-3.5 h-3.5 text-[#C5A880] group-hover:text-[#0A0E17] group-hover:scale-110 transition-all" />
              <span>{t('consult.dictate')}</span>
              <span className="text-[10px] font-mono uppercase text-[#8899B0] group-hover:text-[#0A0E17] bg-[#0E1523] group-hover:bg-[#B39368] px-1.5 py-0.5 rounded border border-[#22314A] group-hover:border-[#A48255]">
                {speechLang}
              </span>
            </button>
          )}

          {/* Equalizer animation when listening */}
          {isListening && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-[#151D2A] rounded-lg border border-[#222E42] text-emerald-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-emerald-400 rounded-full animate-pulse" style={{ height: '60%' }} />
                <span className="w-0.5 bg-[#C5A880] rounded-full animate-pulse" style={{ height: '100%', animationDelay: '150ms' }} />
                <span className="w-0.5 bg-emerald-400 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '300ms' }} />
                <span className="w-0.5 bg-[#C5A880] rounded-full animate-pulse" style={{ height: '80%', animationDelay: '450ms' }} />
              </div>
              <span className="text-[11px] text-[#A6B5CC] ml-1 hidden sm:inline">
                {t('consult.dictateListening')}
              </span>
            </div>
          )}

          {justAddedCount > 0 && (
            <span className="text-[11px] text-emerald-400 font-mono animate-fadeIn flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>+{justAddedCount} words captured</span>
            </span>
          )}
        </div>

        {/* Right: Language Switcher, Punctuation Assistant & Tips */}
        <div className="flex items-center gap-2 text-xs">
          
          {/* Language Selector Dropdown */}
          <div className="flex items-center p-0.5 bg-[#101726] rounded-lg border border-[#202E44] text-[11px] font-mono">
            <button
              type="button"
              disabled={isListening}
              onClick={() => setSpeechLang('en-KE')}
              className={`px-2 py-0.5 rounded transition-all ${
                speechLang === 'en-KE'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white'
              } ${isListening ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              title="Dictate in English (Kenya / Commonwealth Legal Idioms)"
            >
              EN-KE
            </button>
            <button
              type="button"
              disabled={isListening}
              onClick={() => setSpeechLang('sw-KE')}
              className={`px-2 py-0.5 rounded transition-all ${
                speechLang === 'sw-KE'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white'
              } ${isListening ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              title="Tamka kwa Kiswahili (Mahakama na Sheria za Kenya)"
            >
              SW-KE
            </button>
            <button
              type="button"
              disabled={isListening}
              onClick={() => setSpeechLang('en-GB')}
              className={`px-2 py-0.5 rounded transition-all ${
                speechLang === 'en-GB'
                  ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-sm'
                  : 'text-[#8C98AE] hover:text-white'
              } ${isListening ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              title="Dictate in British English"
            >
              EN-GB
            </button>
          </div>

          {/* Quick Clear Narrative Button if has text */}
          {value.trim().length > 0 && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 text-[#7E8D9F] hover:text-red-400 hover:bg-[#1A2538] rounded-lg transition-colors"
              title={t('consult.dictateClear')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Dictation Punctuation & Spoken Commands Guide Toggle */}
          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showTips
                ? 'bg-[#C5A880]/20 text-[#E4C999] border-[#C5A880]/40'
                : 'text-[#7E8D9F] hover:text-white border-transparent hover:border-[#22314A]'
            }`}
            title="Speech Dictation & Punctuation Guide"
            aria-expanded={showTips}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#C5A880]" />
          </button>
        </div>
      </div>

      {/* Dictation Punctuation & Speech Commands Mini-Drawer */}
      {showTips && (
        <div className="p-3 bg-[#0F1625] rounded-xl border border-[#212E46] text-xs space-y-2 animate-fadeIn font-sans">
          <div className="flex items-center justify-between text-[#E4C999] font-medium border-b border-[#1E293E] pb-1.5">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Voice Dictation Commands Guide</span>
            </span>
            <span className="text-[10px] font-mono text-[#8C98AE]">Web Speech API</span>
          </div>

          <p className="text-[11px] text-[#A6B4CC] leading-relaxed">
            {t('consult.dictateHelper')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-1">
            <div className="p-2 bg-[#141C2B] rounded-lg border border-[#1E2B40] space-y-1">
              <div className="text-[#C5A880] font-semibold font-sans">English Voice Commands:</div>
              <ul className="text-[#8C9BBD] space-y-0.5">
                <li>• Say <span className="text-white">"comma"</span> → <span className="text-[#E4C999]">,</span></li>
                <li>• Say <span className="text-white">"full stop"</span> or <span className="text-white">"period"</span> → <span className="text-[#E4C999]">.</span></li>
                <li>• Say <span className="text-white">"new line"</span> → creates a new line</li>
                <li>• Say <span className="text-white">"new paragraph"</span> → line break</li>
              </ul>
            </div>

            <div className="p-2 bg-[#141C2B] rounded-lg border border-[#1E2B40] space-y-1">
              <div className="text-[#C5A880] font-semibold font-sans">Amri za Kiswahili:</div>
              <ul className="text-[#8C9BBD] space-y-0.5">
                <li>• Tamka <span className="text-white">"koma"</span> → <span className="text-[#E4C999]">,</span></li>
                <li>• Tamka <span className="text-white">"kitone"</span> au <span className="text-white">"nukta"</span> → <span className="text-[#E4C999]">.</span></li>
                <li>• Tamka <span className="text-white">"mstari mpya"</span> → mstari unaofuata</li>
                <li>• Tamka <span className="text-white">"aya mpya"</span> → nafasi ya aya</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Interim Live Preview Strip */}
      {isListening && interimTranscript && (
        <div className="p-2.5 bg-[#121B2B] rounded-xl border border-[#C5A880]/30 text-xs font-mono flex items-start gap-2 animate-fadeIn shadow-inner">
          <Volume2 className="w-3.5 h-3.5 text-[#C5A880] shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <span className="text-[10px] text-[#7E8FA7] uppercase tracking-wider block font-sans font-semibold">
              Live Transcript:
            </span>
            <p className="text-emerald-300 italic">
              "{interimTranscript}..."
            </p>
          </div>
        </div>
      )}

      {/* Error or Warning Banner */}
      {errorMessage && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block text-red-200">Speech Recognition Notice</span>
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-white p-0.5"
          >
            &times;
          </button>
        </div>
      )}

      {/* Unsupported Browser Notice */}
      {!isSupported && (
        <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#27354E] text-xs text-[#95A5BD] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#C5A880] shrink-0" />
          <span>{t('consult.dictateUnsupported')}</span>
        </div>
      )}
    </div>
  );
};
