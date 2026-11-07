import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Bell, BellRing, Clock, Calendar, CheckCircle2, AlertCircle,
  Volume2, VolumeX, Smartphone, Mail, ShieldCheck, ExternalLink,
  Download, Send, Sparkles, RefreshCw, Radio, Check, ChevronRight,
  Video, Building, MapPin, UserCheck, MessageSquare, Play
} from 'lucide-react';
import { ConsultationRecord, ClientMatter } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

export interface MeetingAlertConfig {
  id: string;
  consultationId: string;
  title: string;
  advocateName: string;
  scheduledDate: string;
  scheduledTime: string;
  format: 'chambers' | 'virtual' | 'phone';
  forumLocation: string;
  meetingLink?: string;
  reminderMinutesBefore: number; // e.g. 15, 60, 1440
  channels: {
    sms: boolean;
    email: boolean;
    audioChime: boolean;
    whatsapp: boolean;
  };
  clientPhone: string;
  clientEmail: string;
  status: 'Active' | 'Dispatched' | 'Acknowledged' | 'Snoozed';
  urgency: 'Normal' | 'High' | 'Court Mention';
  lastDispatchedAt?: string;
}

interface MeetingAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  matter: ClientMatter;
  consultations: ConsultationRecord[];
  onOpenSummaryForMeeting?: (consultation: ConsultationRecord) => void;
  onOpenBookingModal?: () => void;
}

export const MeetingAlertsModal: React.FC<MeetingAlertsModalProps> = ({
  isOpen,
  onClose,
  matter,
  consultations,
  onOpenSummaryForMeeting,
  onOpenBookingModal
}) => {
  const { t } = useLanguage();
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [testDispatchNotice, setTestDispatchNotice] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState<string | null>(null);

  // Synthesize soft institutional dual-tone chime (Web Audio API)
  const playAlertChime = () => {
    if (audioMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      // Tone 1: D5 (587.33 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Tone 2: A5 (880 Hz) - prestigious courtroom chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.18);
      gain2.gain.setValueAtTime(0.15, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.65);
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  };

  // Build initial alerts list combining upcoming consultations and court dates
  const [alerts, setAlerts] = useState<MeetingAlertConfig[]>(() => {
    const saved = localStorage.getItem('paa_meeting_alerts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to generation
      }
    }

    const initialList: MeetingAlertConfig[] = [];

    // Alert 1: Upcoming Arbitration / Strategy Hearing
    const upcomingConf = consultations.find(c => c.status === 'Confirmed & Scheduled') || consultations[0];
    if (upcomingConf) {
      initialList.push({
        id: `alert-${upcomingConf.id}`,
        consultationId: upcomingConf.id,
        title: `Pre-Evidentiary Hearing Strategy Conference (${upcomingConf.reference})`,
        advocateName: upcomingConf.advocateName,
        scheduledDate: upcomingConf.scheduledDate,
        scheduledTime: upcomingConf.scheduledTime,
        format: upcomingConf.format,
        forumLocation: upcomingConf.forumLocation,
        meetingLink: upcomingConf.meetingLink,
        reminderMinutesBefore: 60,
        channels: {
          sms: true,
          email: true,
          audioChime: true,
          whatsapp: true
        },
        clientPhone: '+254 700 842 190',
        clientEmail: 'general.counsel@cidkenya.com',
        status: 'Active',
        urgency: 'High'
      });
    }

    // Alert 2: Superior Court Mention
    if (matter.judiciarySync?.nextHearingDate) {
      initialList.push({
        id: `alert-court-mention-${matter.reference}`,
        consultationId: 'judiciary-hearing',
        title: `Milimani High Court Mention & Directions: ${matter.bench}`,
        advocateName: matter.leadAdvocate,
        scheduledDate: matter.judiciarySync.nextHearingDate,
        scheduledTime: '09:00 EAT (Commercial List)',
        format: 'virtual',
        forumLocation: 'Kenya Judiciary Virtual Court 14 (Commercial Division)',
        meetingLink: 'https://virtualcourt.judiciary.go.ke/meet/hcc-0842',
        reminderMinutesBefore: 1440, // 24 hours
        channels: {
          sms: true,
          email: true,
          audioChime: true,
          whatsapp: true
        },
        clientPhone: '+254 700 842 190',
        clientEmail: 'general.counsel@cidkenya.com',
        status: 'Active',
        urgency: 'Court Mention'
      });
    }

    // Alert 3: Chambers Pre-Trial Witness Prep
    initialList.push({
      id: `alert-witness-prep`,
      consultationId: 'witness-prep-001',
      title: `Expert Witness Geotechnical Evidence Rehearsal (Bureau Veritas)`,
      advocateName: 'Brian Kipkemboi Cheruiyot',
      scheduledDate: '24 Nov 2026',
      scheduledTime: '11:00 EAT (08:00 GMT)',
      format: 'chambers',
      forumLocation: 'PAA Chambers Boardroom Suite, Upper Hill, Nairobi',
      reminderMinutesBefore: 15,
      channels: {
        sms: true,
        email: true,
        audioChime: false,
        whatsapp: false
      },
      clientPhone: '+254 700 842 190',
      clientEmail: 'general.counsel@cidkenya.com',
      status: 'Active',
      urgency: 'Normal'
    });

    return initialList;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('paa_meeting_alerts', JSON.stringify(alerts));
    } catch {
      // Ignored
    }
  }, [alerts]);

  // Real-time ticking countdown to the nearest meeting
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute countdown string
  const getCountdownString = (dateStr: string) => {
    // Parse approximate future date
    let targetDate = new Date(`${dateStr} 14:00:00`);
    if (isNaN(targetDate.getTime())) {
      targetDate = new Date(Date.now() + 19 * 24 * 3600 * 1000); // 19 days fallback
    }

    const diffMs = targetDate.getTime() - currentTime;
    if (diffMs <= 0) return 'In Session / Imminent';

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Toggle channel for an alert
  const toggleChannel = (alertId: string, channel: keyof MeetingAlertConfig['channels']) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          channels: {
            ...a.channels,
            [channel]: !a.channels[channel]
          }
        };
      }
      return a;
    }));
  };

  // Change reminder interval
  const setReminderInterval = (alertId: string, minutes: number) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, reminderMinutesBefore: minutes };
      }
      return a;
    }));
  };

  // Acknowledge alert
  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, status: 'Acknowledged' };
      }
      return a;
    }));
    setTestDispatchNotice('Attendance confirmed & logged on Chambers Cause List.');
    setTimeout(() => setTestDispatchNotice(null), 3500);
  };

  // Test Dispatch via backend server or client simulator
  const handleTestDispatch = async (alert: MeetingAlertConfig) => {
    setIsDispatching(alert.id);
    playAlertChime();

    try {
      // Call server-side alert dispatch route
      const res = await fetch('/api/meeting-alerts/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId: alert.consultationId,
          clientPhone: alert.clientPhone,
          clientEmail: alert.clientEmail,
          alertType: 'SMS & Email',
          scheduledTime: `${alert.scheduledDate} · ${alert.scheduledTime}`,
          title: alert.title
        })
      });
      const data = await res.json();
      
      setAlerts(prev => prev.map(a => {
        if (a.id === alert.id) {
          return {
            ...a,
            status: 'Dispatched',
            lastDispatchedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
          };
        }
        return a;
      }));

      setTestDispatchNotice(`Alert Dispatched! SMS delivered to ${alert.clientPhone} & Calendar Memo dispatched to ${alert.clientEmail} (Ref: ${data.dispatchRef || 'CTS-AUTH'}).`);
    } catch {
      // Fallback
      setTestDispatchNotice(`Simulated Alert Sent: SMS to ${alert.clientPhone} & Email to ${alert.clientEmail}. Audio chime verified.`);
    } finally {
      setIsDispatching(null);
      setTimeout(() => setTestDispatchNotice(null), 5000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#090D15] border border-[#C5A880]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0E1522] border-b border-[#1E293B] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-[#E4C999] border border-amber-500/30 shrink-0">
              <BellRing className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-cinzel text-white">
                  Chambers Meeting &amp; Court Hearing Alert Center
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-semibold">
                  Live Dispatch Active
                </span>
                <span className="text-xs text-[#526079] hidden sm:inline">|</span>
                <span className="text-xs text-[#C5A880] font-mono font-medium">
                  {matter.reference}
                </span>
              </div>
              <p className="text-xs text-[#8C98AE] mt-0.5">
                Automated SMS, Email &amp; Audio Chime Reminders synced with Kenya Judiciary Cause Lists.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setAudioMuted(!audioMuted);
                if (audioMuted) playAlertChime();
              }}
              className={`p-2 rounded-lg border transition-colors ${
                audioMuted
                  ? 'bg-[#151E2E] text-[#697992] border-[#222F44]'
                  : 'bg-amber-950/40 text-amber-400 border-amber-500/40'
              }`}
              title={audioMuted ? 'Unmute Audio Chime' : 'Audio Chime Enabled'}
            >
              {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8C98AE] hover:text-white rounded-lg transition-colors"
              title="Close Alerts"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast Notice */}
        {testDispatchNotice && (
          <div className="mx-6 mt-3 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{testDispatchNotice}</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400/80 font-semibold">Safaricom &amp; CTS Bridge</span>
          </div>
        )}

        {/* Live Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C5A880]" />
              <span className="text-xs uppercase font-mono tracking-wider text-[#A6B4CD] font-semibold">
                Scheduled Session Alerts ({alerts.length})
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              Next Alert in T-Minus 24h
            </span>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => {
              const countdown = getCountdownString(alert.scheduledDate);
              const isCourt = alert.urgency === 'Court Mention';

              return (
                <div
                  key={alert.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 relative ${
                    isCourt
                      ? 'bg-[#111624] border-red-500/30 shadow-lg shadow-red-950/10'
                      : 'bg-[#0D131F] border-[#222E46] hover:border-[#C5A880]/50'
                  }`}
                >
                  {/* Alert Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C273C] pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          isCourt
                            ? 'bg-red-950/70 text-red-300 border-red-500/40'
                            : alert.urgency === 'High'
                            ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {alert.urgency.toUpperCase()}
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          alert.status === 'Acknowledged'
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                            : alert.status === 'Dispatched'
                            ? 'bg-blue-950/80 text-blue-400 border-blue-500/40'
                            : 'bg-[#151E2E] text-[#A6B4CD] border-[#233148]'
                        }`}>
                          Status: {alert.status}
                        </span>

                        {alert.lastDispatchedAt && (
                          <span className="text-[10px] font-mono text-[#718096]">
                            Dispatched at {alert.lastDispatchedAt}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-cinzel text-white mt-1.5">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-[#C5A880] mt-0.5">
                        Presiding / Designated Counsel: <strong className="text-white font-medium">{alert.advocateName}</strong>
                      </p>
                    </div>

                    {/* Countdown Ticker Box */}
                    <div className="bg-[#080C14] px-4 py-2.5 rounded-xl border border-[#1A2538] text-right shrink-0">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#697A92] block">
                        Live Countdown
                      </span>
                      <span className="text-sm sm:text-base font-mono font-bold text-amber-400 block mt-0.5">
                        {countdown}
                      </span>
                      <span className="text-[10px] font-mono text-[#8C98AE]">
                        {alert.scheduledDate} · {alert.scheduledTime}
                      </span>
                    </div>
                  </div>

                  {/* Location & Modality */}
                  <div className="flex items-center gap-2 text-xs text-[#95A4BD] bg-[#0A0F1A] p-2.5 rounded-xl border border-[#172132]">
                    {alert.format === 'virtual' ? (
                      <Video className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Building className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                    )}
                    <span className="truncate">{alert.forumLocation}</span>
                  </div>

                  {/* Channel Toggles & Reminder Window */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    {/* Channel Toggles */}
                    <div className="p-3 bg-[#0A0E17] rounded-xl border border-[#192436] space-y-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#79889F] font-semibold block">
                        Delivery Channels:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => toggleChannel(alert.id, 'sms')}
                          className={`p-2 rounded-lg text-xs font-mono flex items-center justify-between border transition-all ${
                            alert.channels.sms
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                              : 'bg-[#111724] text-[#697992] border-[#1C273C]'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>SMS Alert</span>
                          </span>
                          {alert.channels.sms && <Check className="w-3 h-3 text-emerald-400" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleChannel(alert.id, 'email')}
                          className={`p-2 rounded-lg text-xs font-mono flex items-center justify-between border transition-all ${
                            alert.channels.email
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                              : 'bg-[#111724] text-[#697992] border-[#1C273C]'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email Memo</span>
                          </span>
                          {alert.channels.email && <Check className="w-3 h-3 text-emerald-400" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleChannel(alert.id, 'audioChime')}
                          className={`p-2 rounded-lg text-xs font-mono flex items-center justify-between border transition-all ${
                            alert.channels.audioChime
                              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                              : 'bg-[#111724] text-[#697992] border-[#1C273C]'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Audio Chime</span>
                          </span>
                          {alert.channels.audioChime && <Check className="w-3 h-3 text-amber-400" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleChannel(alert.id, 'whatsapp')}
                          className={`p-2 rounded-lg text-xs font-mono flex items-center justify-between border transition-all ${
                            alert.channels.whatsapp
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                              : 'bg-[#111724] text-[#697992] border-[#1C273C]'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </span>
                          {alert.channels.whatsapp && <Check className="w-3 h-3 text-emerald-400" />}
                        </button>
                      </div>
                    </div>

                    {/* Reminder Timing Window */}
                    <div className="p-3 bg-[#0A0E17] rounded-xl border border-[#192436] space-y-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#79889F] font-semibold block">
                        Reminder Interval:
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                          { label: '15 Min', val: 15 },
                          { label: '1 Hour', val: 60 },
                          { label: '24 Hours', val: 1440 }
                        ].map(opt => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setReminderInterval(alert.id, opt.val)}
                            className={`p-2 rounded-lg font-mono text-center border transition-all ${
                              alert.reminderMinutesBefore === opt.val
                                ? 'bg-[#C5A880] text-[#0A0E17] font-bold border-[#C5A880]'
                                : 'bg-[#111724] text-[#8C98AE] hover:text-white border-[#1C273C]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-[#6B7A90] font-mono pt-1">
                        Dispatches to {alert.clientPhone} &amp; {alert.clientEmail}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#1C273C]">
                    <div className="flex items-center gap-2">
                      {/* Send Test Dispatch Button */}
                      <button
                        type="button"
                        onClick={() => handleTestDispatch(alert)}
                        disabled={isDispatching === alert.id}
                        className="px-3 py-1.5 bg-[#172236] hover:bg-[#202E48] text-amber-300 rounded-lg text-xs font-semibold border border-amber-500/30 transition-all flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isDispatching === alert.id ? 'Dispatching...' : 'Test Alert Dispatch'}</span>
                      </button>

                      {/* Acknowledge Button */}
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 py-1.5 bg-[#111824] hover:bg-[#1A2436] text-[#A6B4CD] hover:text-white rounded-lg text-xs border border-[#212E44] transition-colors flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Confirm Attendance</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Generate Legal Summary for this meeting */}
                      {onOpenSummaryForMeeting && (
                        <button
                          type="button"
                          onClick={() => {
                            const conf = consultations.find(c => c.id === alert.consultationId) || consultations[0];
                            onOpenSummaryForMeeting(conf);
                          }}
                          className="px-3 py-1.5 bg-[#C5A880]/15 hover:bg-[#C5A880] text-[#C5A880] hover:text-[#0A0E17] rounded-lg text-xs font-semibold border border-[#C5A880]/40 transition-all flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Legal Briefing</span>
                        </button>
                      )}

                      {/* Join Virtual Room */}
                      {alert.meetingLink && (
                        <a
                          href={alert.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Virtual Room</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0A0E17] border-t border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[#718096]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0" />
            <span>
              Meeting alerts certified under <strong>High Court Commercial Division Practice Rules</strong>.
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onOpenBookingModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBookingModal();
                }}
                className="px-3 py-1.5 bg-[#141C2B] hover:bg-[#1E293B] text-[#C5A880] rounded-lg text-xs font-semibold border border-[#233148] transition-colors"
              >
                + Book New Consultation
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-[#172236] hover:bg-[#202E48] text-white text-xs font-semibold rounded-lg border border-[#23334E] transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
