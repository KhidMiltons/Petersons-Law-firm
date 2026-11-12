import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Scale,
  Clock,
  Lock,
  Calendar,
  Video,
  Phone,
  Building,
  ExternalLink,
  Download,
  Check,
  MapPin,
  History,
  FileText,
  UserCheck,
  Search,
  Plus,
  Bell,
  BellRing,
  Star
} from 'lucide-react';
import { PRACTICE_AREAS, FIRM_DETAILS, ADVOCATES, ConsultationRecord, SAMPLE_CLIENT_MATTER } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';
import { LegalSpeechDictation } from './LegalSpeechDictation';
import {
  ClientExperienceSurvey,
  ClientExperienceSurveyEntry,
  getSavedClientSurveys,
} from './ClientExperienceSurvey';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPractice?: string;
  initialEstimate?: string;
  initialAdvocate?: string;
}

// Pre-configured court schedules for advocate availability
const ADVOCATE_SCHEDULES: Record<string, { diaryNotice: string; slots: string[] }> = {
  'Milton Angwenyi, SC': {
    diaryNotice: 'Appellate Cause List: Supreme Court & Court of Appeal morning list (09:00 - 13:00 EAT). Afternoon Chambers Slots Open.',
    slots: ['14:00 EAT (11:00 GMT)', '15:30 EAT (12:30 GMT)', '17:00 EAT (14:00 GMT)']
  },
  'Peterson K. Maina': {
    diaryNotice: 'Constitutional & Judicial Review Division hearing morning list. Chambers Slots Open.',
    slots: ['10:30 EAT (07:30 GMT)', '14:30 EAT (11:30 GMT)', '16:00 EAT (13:00 GMT)']
  },
  'Dr. Patricia Omwamba': {
    diaryNotice: 'Sovereign Debt Advisory & NSE Capital Markets briefing morning list. Chambers Slots Open.',
    slots: ['09:30 EAT (06:30 GMT)', '11:30 EAT (08:30 GMT)', '15:00 EAT (12:00 GMT)']
  },
  'Brian Kipkemboi Cheruiyot': {
    diaryNotice: 'ArdhiSasa Ministry of Lands title digitization & conveyancing list. Chambers Slots Open.',
    slots: ['11:00 EAT (08:00 GMT)', '14:00 EAT (11:00 GMT)', '16:30 EAT (13:30 GMT)']
  },
  'Sharon Wanjiku Mutua': {
    diaryNotice: 'ODPC Data Protection compliance & fintech regulatory sandbox diary. Chambers Slots Open.',
    slots: ['10:00 EAT (07:00 GMT)', '12:00 EAT (09:00 GMT)', '15:30 EAT (12:30 GMT)']
  },
  'David Otieno': {
    diaryNotice: 'Milimani Commercial Court & NCIA expedited arbitration standby list. Chambers Slots Open.',
    slots: ['10:30 EAT (07:30 GMT)', '14:00 EAT (11:00 GMT)', '16:00 EAT (13:00 GMT)']
  },
  'Any Senior Counsel / Managing Partner': {
    diaryNotice: 'Chambers Senior Duty Roster & Expedited Injunction Standby. Priority Chambers Conference.',
    slots: ['10:00 EAT (07:00 GMT)', '12:00 EAT (09:00 GMT)', '14:30 EAT (11:30 GMT)', '16:30 EAT (13:30 GMT)']
  }
};

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  initialPractice,
  initialEstimate,
  initialAdvocate
}) => {
  const { t } = useLanguage();

  // Mode: 'book' | 'history'
  const [modalView, setModalView] = useState<'book' | 'history'>('book');
  const [historySearch, setHistorySearch] = useState('');

  // Calculate default booking date: next business day (Monday-Friday)
  const getNextBusinessDay = (): string => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 6) d.setDate(d.getDate() + 2);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    fullName: '',
    corporateEntity: '',
    email: '',
    phone: '',
    practiceArea: initialPractice || 'Corporate, Banking & Structured Finance',
    urgency: 'standard',
    forum: 'High Court Commercial',
    preferredAdvocate: initialAdvocate || 'Milton Angwenyi, SC',
    briefNarrative: '',
    opposingParty: '',
    agreedToPrivilege: true,
    bookingDate: getNextBusinessDay(),
    bookingTimeSlot: '14:00 EAT (11:00 GMT)',
    bookingFormat: 'virtual' as 'chambers' | 'virtual' | 'phone'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);
  const [copiedIcs, setCopiedIcs] = useState(false);
  const [savedSurveys, setSavedSurveys] = useState<Record<string, ClientExperienceSurveyEntry>>(() =>
    getSavedClientSurveys()
  );

  // Load consultations from localStorage and SAMPLE_CLIENT_MATTER
  const [storedConsultations, setStoredConsultations] = useState<ConsultationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('paa_consultations');
      const parsed: ConsultationRecord[] = saved ? JSON.parse(saved) : [];
      const seeded = SAMPLE_CLIENT_MATTER.consultations || [];
      // Combine seeded and saved without duplicates
      const seen = new Set<string>();
      const combined: ConsultationRecord[] = [];
      [...parsed, ...seeded].forEach(item => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push(item);
        }
      });
      return combined;
    } catch {
      return SAMPLE_CLIENT_MATTER.consultations || [];
    }
  });

  useEffect(() => {
    if (initialPractice) {
      setFormData(prev => ({ ...prev, practiceArea: initialPractice }));
    }
    if (initialAdvocate) {
      setFormData(prev => ({ ...prev, preferredAdvocate: initialAdvocate }));
    }
  }, [initialPractice, initialAdvocate]);

  // Adjust time slot when preferred advocate changes
  useEffect(() => {
    const schedule = ADVOCATE_SCHEDULES[formData.preferredAdvocate] || ADVOCATE_SCHEDULES['Any Senior Counsel / Managing Partner'];
    if (!schedule.slots.includes(formData.bookingTimeSlot)) {
      setFormData(prev => ({ ...prev, bookingTimeSlot: schedule.slots[0] }));
    }
  }, [formData.preferredAdvocate]);

  if (!isOpen) return null;

  const getLocationString = (format = formData.bookingFormat) => {
    if (format === 'chambers') {
      return FIRM_DETAILS.address;
    } else if (format === 'virtual') {
      return 'PAA Encrypted Virtual Hearing Room (VIP Link will be dispatched to ' + (formData.email || 'client') + ')';
    } else {
      return 'Chambers Direct Line: ' + FIRM_DETAILS.phone;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const generatedRef = `PAA/2026/INST-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedReference(generatedRef);

      // Create new Consultation Record
      const newRecord: ConsultationRecord = {
        id: `conf-${Date.now()}`,
        reference: generatedRef,
        clientName: formData.fullName,
        corporateEntity: formData.corporateEntity || undefined,
        advocateName: formData.preferredAdvocate,
        advocateRole: ADVOCATES.find(a => a.name === formData.preferredAdvocate)?.role || 'Senior Counsel & Chamber Advocate',
        practiceArea: formData.practiceArea,
        scheduledDate: formData.bookingDate,
        scheduledTime: formData.bookingTimeSlot,
        format: formData.bookingFormat,
        status: 'Confirmed & Scheduled',
        forumLocation: getLocationString(formData.bookingFormat),
        meetingLink: formData.bookingFormat === 'virtual' ? 'https://teams.microsoft.com/l/meetup-join/paa-conf-' + Math.floor(1000 + Math.random() * 9000) : undefined,
        matterDocket: `PAA/2026/LIT-${Math.floor(1000 + Math.random() * 9000)}`,
        summaryNotes: formData.briefNarrative || 'Privileged initial conference & strategy briefing.',
        actionItems: [
          'Execute statutory conflict screening with Chambers Registrar',
          'Collate preliminary evidentiary documentation and authorities',
          'Review ARO statutory fee deposit under Advocates Act (Cap 16)'
        ],
        attendees: [
          `${formData.preferredAdvocate} (Counsel)`,
          `${formData.fullName} (Instructing Client)`
        ]
      };

      setStoredConsultations(prev => {
        const updated = [newRecord, ...prev];
        try {
          localStorage.setItem('paa_consultations', JSON.stringify(updated));

          // Also automatically register Meeting Alert for this newly scheduled consultation
          const existingAlerts = JSON.parse(localStorage.getItem('paa_meeting_alerts') || '[]');
          const newAlert = {
            id: `alert-${newRecord.id}`,
            consultationId: newRecord.id,
            title: `Chambers Consultation: ${newRecord.advocateName} (${newRecord.practiceArea})`,
            advocateName: newRecord.advocateName,
            scheduledDate: newRecord.scheduledDate,
            scheduledTime: newRecord.scheduledTime,
            format: newRecord.format,
            forumLocation: newRecord.forumLocation,
            meetingLink: newRecord.meetingLink,
            reminderMinutesBefore: 60,
            channels: { sms: true, email: true, audioChime: true, whatsapp: true },
            clientPhone: formData.phone || '+254 700 842 190',
            clientEmail: formData.email || 'client@corporation.com',
            status: 'Active',
            urgency: formData.urgency === 'emergency_injunction' ? 'High' : 'Normal'
          };
          localStorage.setItem('paa_meeting_alerts', JSON.stringify([newAlert, ...existingAlerts]));
        } catch (err) {
          console.error(err);
        }
        return updated;
      });
    }, 900);
  };

  const handleReset = () => {
    setSubmittedReference(null);
    onClose();
  };

  // Helper to format ISO dates for Google / Outlook / iCal
  const getBookingDateTimeStrings = (dateStr = formData.bookingDate, timeSlot = formData.bookingTimeSlot) => {
    const rawDate = dateStr || getNextBusinessDay();
    const timeMatch = timeSlot.match(/^(\d{2}):(\d{2})/);
    const hoursEat = timeMatch ? parseInt(timeMatch[1], 10) : 14;
    const minutesEat = timeMatch ? parseInt(timeMatch[2], 10) : 0;

    const dateUtc = new Date(`${rawDate}T00:00:00Z`);
    dateUtc.setUTCHours(hoursEat - 3, minutesEat, 0, 0);

    const endDateUtc = new Date(dateUtc.getTime() + 60 * 60 * 1000); // 1 hour consultation

    const formatCalIso = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    return {
      startIso: formatCalIso(dateUtc),
      endIso: formatCalIso(endDateUtc),
      startUtcIso: dateUtc.toISOString(),
      endUtcIso: endDateUtc.toISOString(),
      displayDate: rawDate,
      displayTime: timeSlot
    };
  };

  const getFormatLabel = (fmt: string) => {
    switch (fmt) {
      case 'chambers':
        return t('consult.formatChambers');
      case 'virtual':
        return t('consult.formatVirtual');
      case 'phone':
        return t('consult.formatPhone');
      default:
        return 'Chambers Conference';
    }
  };

  // 1. Google Calendar Link
  const handleAddToGoogleCalendar = (customRecord?: ConsultationRecord) => {
    const advocate = customRecord ? customRecord.advocateName : formData.preferredAdvocate;
    const practice = customRecord ? customRecord.practiceArea : formData.practiceArea;
    const ref = customRecord ? customRecord.reference : submittedReference;
    const client = customRecord ? customRecord.clientName : formData.fullName;
    const format = customRecord ? customRecord.format : formData.bookingFormat;
    const { startIso, endIso } = getBookingDateTimeStrings(
      customRecord ? customRecord.scheduledDate : formData.bookingDate,
      customRecord ? customRecord.scheduledTime : formData.bookingTimeSlot
    );

    const title = `Legal Consultation with ${advocate} · PAA Advocates`;
    const location = getLocationString(format);
    const details = `Formal Legal Consultation\nDocket Ref: ${ref}\nCounsel: ${advocate}\nPractice Area: ${practice}\nClient: ${client}\nFormat: ${getFormatLabel(format)}\nStrictly Privileged & Confidential under Section 134 Evidence Act (Cap 80).`;

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startIso}/${endIso}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 2. Outlook Calendar Link
  const handleAddToOutlookCalendar = (customRecord?: ConsultationRecord) => {
    const advocate = customRecord ? customRecord.advocateName : formData.preferredAdvocate;
    const practice = customRecord ? customRecord.practiceArea : formData.practiceArea;
    const ref = customRecord ? customRecord.reference : submittedReference;
    const client = customRecord ? customRecord.clientName : formData.fullName;
    const format = customRecord ? customRecord.format : formData.bookingFormat;
    const { startUtcIso, endUtcIso } = getBookingDateTimeStrings(
      customRecord ? customRecord.scheduledDate : formData.bookingDate,
      customRecord ? customRecord.scheduledTime : formData.bookingTimeSlot
    );

    const title = `Legal Consultation with ${advocate} · PAA Advocates`;
    const location = getLocationString(format);
    const details = `Formal Legal Consultation\nDocket Ref: ${ref}\nCounsel: ${advocate}\nPractice Area: ${practice}\nClient: ${client}\nFormat: ${getFormatLabel(format)}\nStrictly Privileged under Section 134 Evidence Act (Cap 80).`;

    const url = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${encodeURIComponent(startUtcIso)}&enddt=${encodeURIComponent(endUtcIso)}&body=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 3. Download iCal (.ics) file
  const handleDownloadIcs = (customRecord?: ConsultationRecord) => {
    const advocate = customRecord ? customRecord.advocateName : formData.preferredAdvocate;
    const practice = customRecord ? customRecord.practiceArea : formData.practiceArea;
    const ref = customRecord ? customRecord.reference : submittedReference;
    const client = customRecord ? customRecord.clientName : formData.fullName;
    const format = customRecord ? customRecord.format : formData.bookingFormat;
    const email = customRecord ? 'client@corporation.com' : formData.email;

    const { startIso, endIso } = getBookingDateTimeStrings(
      customRecord ? customRecord.scheduledDate : formData.bookingDate,
      customRecord ? customRecord.scheduledTime : formData.bookingTimeSlot
    );

    const title = `Legal Consultation with ${advocate} · PAA Advocates`;
    const location = getLocationString(format);
    const details = `Formal Legal Consultation\\nDocket Ref: ${ref}\\nCounsel: ${advocate}\\nPractice Area: ${practice}\\nClient: ${client}\\nFormat: ${getFormatLabel(format)}\\nStrictly Privileged under Section 134 Evidence Act.`;

    const nowIso = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Petersons Angwenyi & Associates//Chambers Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:PAA-CONF-${Date.now()}@paalawkenya.com`,
      `DTSTAMP:${nowIso}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${details}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'ORGANIZER;CN="PAA Chambers Registry":mailto:registry@paalawkenya.com',
      `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN="${client}":mailto:${email}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PAA-Consultation-${ref}.ics`);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCopiedIcs(true);
    setTimeout(() => setCopiedIcs(false), 3000);
  };

  const scheduleInfo = ADVOCATE_SCHEDULES[formData.preferredAdvocate] || ADVOCATE_SCHEDULES['Any Senior Counsel / Managing Partner'];

  // Filtered consultation history
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return storedConsultations;
    const q = historySearch.toLowerCase();
    return storedConsultations.filter(c =>
      c.advocateName.toLowerCase().includes(q) ||
      c.practiceArea.toLowerCase().includes(q) ||
      c.reference.toLowerCase().includes(q) ||
      c.summaryNotes.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  }, [storedConsultations, historySearch]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0D131F] border border-[#C5A880]/30 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#121927] to-[#162134] border-b border-[#222E46] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>{t('consult.badge')}</span>
            </div>
            <h3 className="text-xl font-cinzel text-white mt-1">
              {t('consult.title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8C98AE] hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal View Selector Tab Bar: Book vs Consultation History */}
        {!submittedReference && (
          <div className="flex border-b border-[#1E2C44] bg-[#0A0E17] px-4 sm:px-6">
            <button
              onClick={() => setModalView('book')}
              className={`py-3 px-4 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all flex items-center gap-2 ${
                modalView === 'book'
                  ? 'border-[#C5A880] text-[#E4C999]'
                  : 'border-transparent text-[#8C98AE] hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Privileged Consultation</span>
            </button>

            <button
              onClick={() => setModalView('history')}
              className={`py-3 px-4 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all flex items-center gap-2 ${
                modalView === 'history'
                  ? 'border-[#C5A880] text-[#E4C999]'
                  : 'border-transparent text-[#8C98AE] hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{t('dashboard.consultationHistory')}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#1A2538] text-[#C5A880] border border-[#2B3C58]">
                {storedConsultations.length}
              </span>
            </button>
          </div>
        )}

        {/* View 1: Submitted Reference Screen */}
        {submittedReference ? (
          <div className="p-6 md:p-8 text-center space-y-6 overflow-y-auto">
            <div className="w-16 h-16 bg-[#C5A880]/20 rounded-full flex items-center justify-center mx-auto text-[#C5A880]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-[#8C98AE]">Instruction Lodged & Confirmed</span>
              <h4 className="text-2xl font-cinzel text-white mt-1">Chambers Consultation Booked</h4>
              <p className="mt-2 text-sm text-[#9BA5B7] max-w-md mx-auto">
                Your consultation is synchronized with Chambers court calendar and logged in your consultation history.
              </p>
            </div>

            {/* Matter & Booking Summary Card */}
            <div className="p-4 bg-[#141B28] rounded-xl border border-[#222E46] max-w-lg mx-auto text-left font-mono text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-[#222E46]">
                <span className="text-[#6F7A8F]">Matter Docket Ref:</span>
                <span className="text-[#E4C999] font-bold text-sm">{submittedReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F7A8F]">Designated Counsel:</span>
                <span className="text-white font-semibold">{formData.preferredAdvocate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F7A8F]">Designated Practice:</span>
                <span className="text-white">{formData.practiceArea}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F7A8F]">Scheduled Date:</span>
                <span className="text-[#E4C999] font-semibold">{formData.bookingDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F7A8F]">Confirmed Time Slot:</span>
                <span className="text-emerald-400 font-semibold">{formData.bookingTimeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F7A8F]">Consultation Format:</span>
                <span className="text-white">{getFormatLabel(formData.bookingFormat)}</span>
              </div>
              {initialEstimate && (
                <div className="flex justify-between pt-2 border-t border-[#222E46]">
                  <span className="text-[#6F7A8F]">Estimated Remuneration:</span>
                  <span className="text-white">{initialEstimate}</span>
                </div>
              )}
            </div>

            {/* Calendar Integration Direct Sync Actions */}
            <div className="max-w-lg mx-auto p-4 bg-[#0F1624] border border-[#C5A880]/30 rounded-xl space-y-3 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#C5A880] uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>{t('consult.calendarTitle')}</span>
              </div>
              <p className="text-xs text-[#8C98AE]">
                Sync this scheduled conference directly with your calendar of choice to receive automated courtroom reminders and Chambers dial-in credentials:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleAddToGoogleCalendar()}
                  className="px-3 py-2.5 bg-[#172338] hover:bg-[#C5A880] hover:text-[#0A0E17] text-white rounded-lg text-xs font-semibold border border-[#2B3B56] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Calendar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddToOutlookCalendar()}
                  className="px-3 py-2.5 bg-[#172338] hover:bg-[#C5A880] hover:text-[#0A0E17] text-white rounded-lg text-xs font-semibold border border-[#2B3B56] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Outlook / 365</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadIcs()}
                  className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                    copiedIcs
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-[#C5A880] text-[#0A0E17] hover:brightness-110 border-[#C5A880]'
                  }`}
                >
                  {copiedIcs ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                  <span>{copiedIcs ? 'Downloaded!' : 'Download (.ics)'}</span>
                </button>
              </div>
            </div>

            {/* Meeting Alert Scheduled Confirmation */}
            <div className="max-w-lg mx-auto p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-center justify-between text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <BellRing className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Meeting Alerts Configured &amp; Active
                  </span>
                  <span className="text-[11px] text-[#A6B4CD]">
                    Automated SMS to {formData.phone || '+254 700 842 190'} &amp; Email reminder (60 min prior).
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-500/30 text-[10px] font-mono shrink-0">
                Active
              </span>
            </div>

            {/* Post-Booking Client Experience Survey */}
            <ClientExperienceSurvey
              bookingReference={submittedReference}
              advocateName={formData.preferredAdvocate}
              practiceArea={formData.practiceArea}
              clientName={formData.fullName}
              onSubmitted={(entry) => {
                setSavedSurveys((prev) => ({
                  ...prev,
                  [entry.bookingReference]: entry,
                }));
              }}
            />

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSubmittedReference(null);
                  setModalView('history');
                }}
                className="py-2.5 px-5 bg-[#162134] hover:bg-[#1E2D46] text-[#C5A880] font-semibold text-xs rounded-lg border border-[#263753] transition-all flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5" />
                <span>View In Consultation History</span>
              </button>

              <button
                onClick={handleReset}
                className="py-2.5 px-6 bg-[#C5A880] text-[#0A0E17] font-semibold text-xs tracking-wider uppercase rounded-lg hover:brightness-110 transition-all"
              >
                Done &amp; Return to Chambers
              </button>
            </div>
          </div>
        ) : modalView === 'history' ? (
          /* View 2: Consultation History Screen */
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Search within consultation history */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#606E84] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search consultation history by counsel, docket, or topic..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-[#111826] border border-[#212E44] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#536177] focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <button
                onClick={() => setModalView('book')}
                className="px-3.5 py-2 bg-[#C5A880] text-[#0A0E17] text-xs font-semibold rounded-xl hover:brightness-110 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Booking</span>
              </button>
            </div>

            {/* List of Consultations */}
            <div className="space-y-3">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 p-6 bg-[#111724] rounded-2xl border border-[#1E293B]">
                  <AlertCircle className="w-8 h-8 text-[#616E83] mx-auto mb-2" />
                  <p className="text-sm text-[#8C98AE]">No consultation records found.</p>
                </div>
              ) : (
                filteredHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 bg-[#111824] rounded-xl border border-[#202C42] hover:border-[#C5A880]/40 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A263A] pb-2.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-[#E4C999] font-bold">
                            {rec.reference}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            rec.status.includes('Confirmed')
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                              : 'bg-[#182335] text-[#93A1B8] border-[#253650]'
                          }`}>
                            {rec.status}
                          </span>
                          {savedSurveys[rec.reference] && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#C5A880]/15 text-[#E4C999] border border-[#C5A880]/30 tabular-nums"
                              title={savedSurveys[rec.reference].feedback || 'Client experience rating recorded'}
                            >
                              <Star className="w-2.5 h-2.5 fill-[#C5A880] text-[#C5A880]" />
                              <span>{savedSurveys[rec.reference].rating}.0 / 5</span>
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-white mt-1">
                          {rec.advocateName} · <span className="text-[#C5A880]">{rec.practiceArea}</span>
                        </h4>
                      </div>

                      <div className="text-xs text-[#8C98AE] font-mono sm:text-right">
                        <div className="text-white font-medium">{rec.scheduledDate}</div>
                        <div className="text-emerald-400">{rec.scheduledTime}</div>
                      </div>
                    </div>

                    <p className="text-xs text-[#95A4BD] leading-relaxed">
                      {rec.summaryNotes}
                    </p>

                    {/* Action Items */}
                    {rec.actionItems && rec.actionItems.length > 0 && (
                      <div className="p-2.5 bg-[#0D1420] rounded-lg border border-[#1A2638] space-y-1">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#C5A880] font-semibold block">
                          Chambers Action Items &amp; Next Directives:
                        </span>
                        <ul className="text-[11px] text-[#8C98AE] space-y-0.5 list-disc list-inside">
                          {rec.actionItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                      <div className="flex items-center gap-1.5 text-[#6B798F]">
                        <Building className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span className="truncate max-w-xs">{rec.forumLocation}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddToGoogleCalendar(rec)}
                          className="px-2.5 py-1 bg-[#162134] hover:bg-[#202E48] text-[#A6B4CD] hover:text-white rounded text-[11px] border border-[#273854] transition-colors"
                        >
                          Google Cal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadIcs(rec)}
                          className="px-2.5 py-1 bg-[#C5A880]/15 hover:bg-[#C5A880] text-[#C5A880] hover:text-[#0A0E17] rounded text-[11px] border border-[#C5A880]/40 transition-all font-semibold flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>.ics</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* View 3: Consultation Booking Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 md:p-8 space-y-5 overflow-y-auto flex-1">
            {initialEstimate && (
              <div className="p-3 bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-xl flex items-center justify-between text-xs">
                <span className="text-[#C5A880] font-medium">Estimated ARO Fee Basis:</span>
                <span className="font-mono text-white font-bold">{initialEstimate}</span>
              </div>
            )}

            {/* Client Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#B2BDCE] mb-1">
                  {t('consult.name')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Kibera"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-[#131B2A] border border-[#202A3D] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B2BDCE] mb-1">
                  {t('consult.entity')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Sovereign Capital PLC"
                  value={formData.corporateEntity}
                  onChange={(e) => setFormData({ ...formData, corporateEntity: e.target.value })}
                  className="w-full bg-[#131B2A] border border-[#202A3D] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#B2BDCE] mb-1">
                  {t('consult.email')} *
                </label>
                <input
                  type="email"
                  required
                  placeholder="counsel@corporation.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#131B2A] border border-[#202A3D] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B2BDCE] mb-1">
                  {t('consult.phone')} *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+254 700 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#131B2A] border border-[#202A3D] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
                />
              </div>
            </div>

            {/* Counsel & Practice Area Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#B2BDCE] mb-1">
                  {t('consult.practice')}
                </label>
                <select
                  value={formData.practiceArea}
                  onChange={(e) => setFormData({ ...formData, practiceArea: e.target.value })}
                  className="w-full bg-[#131B2A] border border-[#202A3D] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
                >
                  {PRACTICE_AREAS.map(p => (
                    <option key={p.id} value={p.title}>{p.title}</option>
                  ))}
                  <option value="General Commercial Retainer">General Commercial Retainer</option>
                  <option value="Private Wealth & Trusts">Private Wealth &amp; Family Trusts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B2BDCE] mb-1">
                  Designated Advocate / Counsel
                </label>
                <select
                  value={formData.preferredAdvocate}
                  onChange={(e) => setFormData({ ...formData, preferredAdvocate: e.target.value })}
                  className="w-full bg-[#131B2A] border border-[#202A3D] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
                >
                  {ADVOCATES.map(a => (
                    <option key={a.id} value={a.name}>{a.name} ({a.title})</option>
                  ))}
                  <option value="Any Senior Counsel / Managing Partner">Any Senior Counsel / Managing Partner</option>
                </select>
              </div>
            </div>

            {/* Calendar & Slot Picker Section */}
            <div className="p-4 bg-[#111824] rounded-xl border border-[#C5A880]/30 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#C5A880] uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>{t('consult.calendarTitle')}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/50 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Court Diary Synced
                </span>
              </div>

              {/* Court Diary Status Indicator */}
              <div className="text-xs bg-[#0C121D] p-3 rounded-lg border border-[#1A263A] text-[#93A1B8] space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{formData.preferredAdvocate} · Court Diary Status:</span>
                </div>
                <p className="text-[11px] text-[#A2AFCA]">
                  {scheduleInfo.diaryNotice}
                </p>
                <div className="text-[10px] text-[#637288] font-mono pt-1">
                  {t('consult.courtDiaryNotice')}
                </div>
              </div>

              {/* Date & Time Slot Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#B2BDCE] mb-1">
                    {t('consult.selectDate')} *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.bookingDate}
                    onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                    className="w-full bg-[#131B2A] border border-[#202A3D] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#B2BDCE] mb-1">
                    {t('consult.selectTime')} *
                  </label>
                  <select
                    value={formData.bookingTimeSlot}
                    onChange={(e) => setFormData({ ...formData, bookingTimeSlot: e.target.value })}
                    className="w-full bg-[#131B2A] border border-[#202A3D] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
                  >
                    {scheduleInfo.slots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Consultation Format Selector */}
              <div>
                <label className="block text-xs font-medium text-[#B2BDCE] mb-2">
                  {t('consult.format')} *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bookingFormat: 'chambers' })}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                      formData.bookingFormat === 'chambers'
                        ? 'bg-[#1C273C] border-[#C5A880] text-white shadow-sm'
                        : 'bg-[#121926] border-[#1F2C42] text-[#8C98AE] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A880]">
                      <Building className="w-3.5 h-3.5" />
                      <span>Upper Hill</span>
                    </div>
                    <span className="text-[11px] leading-tight">Boardroom Chambers (Mara Square)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bookingFormat: 'virtual' })}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                      formData.bookingFormat === 'virtual'
                        ? 'bg-[#1C273C] border-[#C5A880] text-white shadow-sm'
                        : 'bg-[#121926] border-[#1F2C42] text-[#8C98AE] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A880]">
                      <Video className="w-3.5 h-3.5" />
                      <span>Virtual Video</span>
                    </div>
                    <span className="text-[11px] leading-tight">MS Teams / Webex VIP Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bookingFormat: 'phone' })}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                      formData.bookingFormat === 'phone'
                        ? 'bg-[#1C273C] border-[#C5A880] text-white shadow-sm'
                        : 'bg-[#121926] border-[#1F2C42] text-[#8C98AE] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A880]">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Direct Line</span>
                    </div>
                    <span className="text-[11px] leading-tight">Privileged Chambers Line</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Urgency & Conflict of Interest */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#B2BDCE] mb-1">
                  {t('consult.urgency')}
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full bg-[#131B2A] border border-[#202A3D] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
                >
                  <option value="standard">Standard Advisory (Within 48 Hours)</option>
                  <option value="urgent_24h">Urgent Review (Within 24 Hours)</option>
                  <option value="emergency_injunction">Emergency Injunction (Immediate Standby)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B2BDCE] mb-1">
                  {t('consult.adverse')}
                </label>
                <input
                  type="text"
                  placeholder="Names of opposing companies or banks"
                  value={formData.opposingParty}
                  onChange={(e) => setFormData({ ...formData, opposingParty: e.target.value })}
                  className="w-full bg-[#131B2A] border border-[#202A3D] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#B2BDCE]">
                  {t('consult.facts')} *
                </label>
                <span className="text-[10px] text-[#C5A880] font-mono flex items-center gap-1">
                  <span>Voice Dictation &amp; Accessibility Ready</span>
                </span>
              </div>

              {/* Web Speech API Voice Dictation Controller */}
              <LegalSpeechDictation
                value={formData.briefNarrative}
                onChange={(val) => setFormData((prev) => ({ ...prev, briefNarrative: val }))}
                onAppendText={(appended) =>
                  setFormData((prev) => {
                    const existing = prev.briefNarrative.trim();
                    const separator = existing.length > 0 ? (existing.endsWith('.') || existing.endsWith('\n') ? ' ' : ' ') : '';
                    return {
                      ...prev,
                      briefNarrative: existing ? `${existing}${separator}${appended.trimStart()}` : appended.trimStart()
                    };
                  })
                }
                disabled={isSubmitting}
              />

              <textarea
                required
                rows={4}
                placeholder="Provide a concise summary of the transaction, dispute background, relief sought, or existing court case number if any (Type or use the Voice Dictation feature above)."
                value={formData.briefNarrative}
                onChange={(e) => setFormData({ ...formData, briefNarrative: e.target.value })}
                className="w-full bg-[#131B2A] border border-[#202A3D] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="privilege"
                checked={formData.agreedToPrivilege}
                onChange={(e) => setFormData({ ...formData, agreedToPrivilege: e.target.checked })}
                className="w-4 h-4 rounded text-[#C5A880] bg-[#131B2A] border-[#202A3D] focus:ring-[#C5A880]"
              />
              <label htmlFor="privilege" className="text-xs text-[#8C98AE]">
                {t('consult.privilege')}
              </label>
            </div>

            <div className="pt-3 flex gap-3 justify-end border-t border-[#222E46]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-medium text-[#8C98AE] hover:text-white rounded-lg transition-colors"
              >
                {t('consult.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-[#C5A880] to-[#DFBE82] text-[#0A0E17] font-semibold text-xs tracking-wider uppercase rounded-lg hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#0A0E17] border-t-transparent rounded-full animate-spin" />
                    <span>{t('consult.clearing')}</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Confirm &amp; Book Consultation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
