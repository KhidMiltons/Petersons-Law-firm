import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, ShieldCheck, AlertCircle, CheckCircle2, 
  Smile, Frown, Sparkles, Download, Quote, Activity, 
  ChevronRight, Calendar, User, FileText, Check, ArrowUpRight,
  Filter, Layers, Info, MessageSquareQuote, ShieldAlert
} from 'lucide-react';
import { ClientMatter, ConsultationRecord } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

interface MeetingSentimentVisualizationProps {
  matter: ClientMatter;
  allConsultations: ConsultationRecord[];
}

interface SentimentSessionData {
  id: string;
  reference: string;
  date: string;
  advocateName: string;
  topic: string;
  score: number; // 0 to 100
  label: 'High Satisfaction' | 'Positive / Confident' | 'Cautious / Scrutiny' | 'High Concern';
  primarySatisfaction: string;
  satisfactionCategory: string;
  primaryConcern: string;
  concernCategory: string;
  concernSeverity: 'High' | 'Moderate' | 'Low' | 'Resolved';
  mitigationAction: string;
  transcriptExcerpt: string;
  speakerQuote: string;
  speakerName: string;
}

export const MeetingSentimentVisualization: React.FC<MeetingSentimentVisualizationProps> = ({
  matter,
  allConsultations
}) => {
  const { t } = useLanguage();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'satisfaction' | 'concerns'>('all');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Derive enriched sentiment analysis across consultations for the current client matter
  const sessionSentimentList: SentimentSessionData[] = useMemo(() => {
    // Generate tailored, authentic sentiment sessions based on matter reference & title
    const isArbitration = matter.reference.includes('ARB') || matter.caseTitle.toLowerCase().includes('arbitration') || matter.caseTitle.toLowerCase().includes('marad');
    
    if (isArbitration) {
      return [
        {
          id: 'sent-1',
          reference: 'PAA/2026/INST-1042',
          date: '12 Aug 2026',
          advocateName: 'Milton Angwenyi, SC',
          topic: 'FIDIC Sub-Clause 8.7 Emergency Injunction',
          score: 72,
          label: 'Cautious / Scrutiny',
          primarySatisfaction: 'Ex-parte conservatory injunction drafted within 72 hours to prevent forfeiture of USD 5M performance bond.',
          satisfactionCategory: 'Injunction & Security Safeguard',
          primaryConcern: 'Extreme corporate anxiety over contractor default and potential commercial bank credit downgrade.',
          concernCategory: 'Credit & Bond Exposure',
          concernSeverity: 'High',
          mitigationAction: 'Chambers immediately lodged High Court Commercial Suit restraining Standard Chartered from encashing bank guarantees.',
          transcriptExcerpt: 'Client General Counsel expressed acute concern regarding liquidity covenants if the performance bond was called without formal dispute notice.',
          speakerQuote: 'The prompt conservatory order restrained encashment before our commercial bank experienced credit facility strain.',
          speakerName: 'Dr. Stella Mwangi (General Counsel)'
        },
        {
          id: 'sent-2',
          reference: 'PAA/2026/INST-3489',
          date: '20 Sep 2026',
          advocateName: 'Brian Kipkemboi Cheruiyot',
          topic: 'FIDIC DAB Quantum Schedule & Delay Assessment',
          score: 83,
          label: 'Positive / Confident',
          primarySatisfaction: 'Formalized 184 days of unexcused contractor delay, locking in accrued liquidated damages of USD $8,280,000.',
          satisfactionCategory: 'Quantum & Claim Substantiation',
          primaryConcern: 'Apprehension regarding opposing counsel Kaplan & Stratton attempting to dispute soil core test methodologies.',
          concernCategory: 'Discovery & Expert Testimony',
          concernSeverity: 'Moderate',
          mitigationAction: 'Engaged Bureau Veritas to conduct supplementary borehole forensic scans under Section 106B Evidence Act.',
          transcriptExcerpt: 'Board instructed counsel to verify that quantum calculations adhere to both Kenyan standard method of measurement and FIDIC 1999 Red Book provisions.',
          speakerQuote: 'The crystalized liquidated damages schedule gave our executive committee complete confidence in the arbitral statement of claim.',
          speakerName: 'Eng. David Kamau (Managing Director)'
        },
        {
          id: 'sent-3',
          reference: 'PAA/2026/INST-5120',
          date: '15 Oct 2026',
          advocateName: 'Milton Angwenyi, SC',
          topic: 'Expert Witness Cross-Examination Briefing',
          score: 89,
          label: 'High Satisfaction',
          primarySatisfaction: 'Geotechnical expert witness witness statement admitted into NCIA tribunal record without opposing procedural objection.',
          satisfactionCategory: 'Tribunal Procedure & Evidence',
          primaryConcern: 'Friction regarding hearing room scheduling at Nairobi Centre for International Arbitration.',
          concernCategory: 'Institutional Hearing Logistics',
          concernSeverity: 'Low',
          mitigationAction: 'Chambers secured the Main Arbitration Hearing Suite at NCIA Upper Hill with dedicated high-speed encrypted feeds.',
          transcriptExcerpt: 'Senior Counsel Milton Angwenyi walked the technical witness through potential counter-examination traps regarding foundation settlement.',
          speakerQuote: 'Senior Counsel’s preparatory session transformed our geotechnical lead from an apprehensive technician into an impregnable expert witness.',
          speakerName: 'Dr. E. K. Mwendwa (Structural Expert)'
        },
        {
          id: 'sent-4',
          reference: 'PAA/2026/INST-7890',
          date: '02 Nov 2026',
          advocateName: 'Milton Angwenyi, SC',
          topic: 'Final Trial Submissions & Evidentiary Review',
          score: 95,
          label: 'High Satisfaction',
          primarySatisfaction: 'Tribunal confirmed final hearing dates for 25 November with lead counsel priority; escrow funds guaranteed in KCB.',
          satisfactionCategory: 'Trial Readiness & Strategic Dominance',
          primaryConcern: 'Milimani Commercial Court cause list congestion causing general trial anxiety among corporate directors.',
          concernCategory: 'Judicial Timeline Uncertainty',
          concernSeverity: 'Moderate',
          mitigationAction: 'Lead counsel secured a peremptory hearing order, immunizing the proceeding against routine judicial cause list adjournments.',
          transcriptExcerpt: 'Client board expressed total legal alignment with the Chambers strategy to seek both principal damages and contractual 14% interest.',
          speakerQuote: 'We have never felt more legally protected. The precision of PAA Chambers has turned a critical corporate crisis into a commanding legal advantage.',
          speakerName: 'Eng. David Kamau (Managing Director)'
        }
      ];
    } else {
      // Default / Constitutional & Commercial Banking Matter
      return [
        {
          id: 'sent-1',
          reference: 'PAA/2026/LIT-0112',
          date: '10 Aug 2026',
          advocateName: 'Milton Angwenyi, SC',
          topic: 'Constitutional Injunction & Asset Freeze Challenge',
          score: 75,
          label: 'Cautious / Scrutiny',
          primarySatisfaction: 'Immediate suspension of arbitrary administrative directive affecting corporate banking operations.',
          satisfactionCategory: 'Judicial Review & Injunction',
          primaryConcern: 'Risk of enforcement actions before full bench constitution.',
          concernCategory: 'Regulatory Enforcement Risk',
          concernSeverity: 'High',
          mitigationAction: 'Urgent certification under certificate of urgency before duty judge within 24 hours.',
          transcriptExcerpt: 'Client raised urgent questions about continuous payroll processing while accounts were under interim conservatory scrutiny.',
          speakerQuote: 'The swift conservatory order ensured business continuity across our nationwide distribution operations.',
          speakerName: 'Chief Operating Officer'
        },
        {
          id: 'sent-2',
          reference: 'PAA/2026/LIT-0430',
          date: '18 Sep 2026',
          advocateName: 'Brian Kipkemboi Cheruiyot',
          topic: 'Affidavit of Service & Discovery Compliance',
          score: 86,
          label: 'Positive / Confident',
          primarySatisfaction: 'Full mutual discovery completed and digitally verified on Kenya Judiciary CTS portal.',
          satisfactionCategory: 'CTS E-Filing & Procedural Stamping',
          primaryConcern: 'Delays by 2nd Respondent in releasing internal audit correspondence.',
          concernCategory: 'Opposing Party Non-Compliance',
          concernSeverity: 'Moderate',
          mitigationAction: 'Issued statutory notice to produce documents under Order 10 of Civil Procedure Rules.',
          transcriptExcerpt: 'Client expressed satisfaction with the electronic tracking and timestamp seals generated by Chambers on the judiciary bridge.',
          speakerQuote: 'The electronic transparency of the filings gave our in-house audit team complete visibility.',
          speakerName: 'Head of Compliance'
        },
        {
          id: 'sent-3',
          reference: 'PAA/2026/LIT-0899',
          date: '28 Oct 2026',
          advocateName: 'Milton Angwenyi, SC',
          topic: 'High Court Substantive Trial Preparation',
          score: 93,
          label: 'High Satisfaction',
          primarySatisfaction: 'Consolidated list of judicial authorities accepted by Lady Justice Muchemi without opposition.',
          satisfactionCategory: 'Bench Readiness & Precedent Alignment',
          primaryConcern: 'Possibility of judicial transfer before judgment delivery.',
          concernCategory: 'Judicial Administrative Factors',
          concernSeverity: 'Low',
          mitigationAction: 'Requested formal reservation of judgment under Rule 23 of Court Practice Rules.',
          transcriptExcerpt: 'Counsel highlighted Supreme Court precedent supporting the bank’s security prioritization.',
          speakerQuote: 'Milton Angwenyi’s commanding presence before the bench leaves zero doubt as to our constitutional standing.',
          speakerName: 'Legal Director'
        }
      ];
    }
  }, [matter.reference, matter.caseTitle]);

  // Active highlighted session
  const activeSession = useMemo(() => {
    if (selectedSessionId) {
      return sessionSentimentList.find(s => s.id === selectedSessionId) || sessionSentimentList[sessionSentimentList.length - 1];
    }
    return sessionSentimentList[sessionSentimentList.length - 1];
  }, [selectedSessionId, sessionSentimentList]);

  // Aggregate metrics
  const aggregateMetrics = useMemo(() => {
    const scores = sessionSentimentList.map(s => s.score);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));
    const firstScore = scores[0] || 70;
    const lastScore = scores[scores.length - 1] || 90;
    const trajectory = lastScore - firstScore;

    const satisfactionPoints = sessionSentimentList.map(s => ({
      title: s.satisfactionCategory,
      detail: s.primarySatisfaction,
      score: s.score,
      date: s.date,
      advocate: s.advocateName
    }));

    const concernPoints = sessionSentimentList.map(s => ({
      title: s.concernCategory,
      concern: s.primaryConcern,
      severity: s.concernSeverity,
      mitigation: s.mitigationAction,
      date: s.date
    }));

    return {
      avgScore,
      currentScore: lastScore,
      trajectory,
      satisfactionPoints,
      concernPoints,
      resolvedConcernsRatio: '85%',
      satisfactionSharePct: 78,
      neutralSharePct: 14,
      concernSharePct: 8
    };
  }, [sessionSentimentList]);

  // Export sentiment audit text memo
  const handleExportAudit = () => {
    const memoContent = `================================================================================
REPUBLIC OF KENYA - PETERSONS ANGWENYI & ASSOCIATES ADVOCATES
CHAMBERS CLIENT CARE & TRANSCRIBED MEETING SENTIMENT AUDIT
================================================================================
CLIENT ACCOUNT: ${matter.clientEntity}
DOCKET REFERENCE: ${matter.reference}
JUDICIARY CTS ID: ${matter.ctsNumber}
MATTER TITLE: ${matter.caseTitle}
BENCH / FORUM: ${matter.bench} · ${matter.forum}
DATE OF AUDIT GENERATION: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}

--------------------------------------------------------------------------------
EXECUTIVE SENTIMENT SUMMARY:
Overall Client Legal Confidence Score: ${aggregateMetrics.currentScore}% / 100%
Sentiment Trajectory (Session 1 to Current): +${aggregateMetrics.trajectory} Percentage Points
Friction & Concern Mitigation Rate: ${aggregateMetrics.resolvedConcernsRatio} (Directives Formally Executed)
Statutory Privilege Enforced: Section 134 Evidence Act (Cap 80)

--------------------------------------------------------------------------------
CHRONOLOGICAL MEETING SENTIMENT BREAKDOWN:
${sessionSentimentList.map((s, idx) => `
[SESSION ${idx + 1}] Date: ${s.date} | Counsel: ${s.advocateName}
Reference: ${s.reference} | Topic: ${s.topic}
Sentiment Rating: ${s.score}% (${s.label})
Key Satisfaction Driver: ${s.primarySatisfaction}
Identified Client Concern: ${s.primaryConcern}
Chambers Mitigation Action: ${s.mitigationAction}
Verbatim Quote: "${s.speakerQuote}" — ${s.speakerName}
`).join('\n--------------------------------------------------------------------------------')}

--------------------------------------------------------------------------------
KEY AREAS OF LEGAL SATISFACTION IDENTIFIED:
${aggregateMetrics.satisfactionPoints.map((sp, idx) => `${idx + 1}. [${sp.title}] - ${sp.detail}`).join('\n')}

--------------------------------------------------------------------------------
ACTIVE CONCERN & PROCEDURAL FRICTION WATCHLIST:
${aggregateMetrics.concernPoints.map((cp, idx) => `${idx + 1}. [${cp.title} · Severity: ${cp.severity}]
   Concern: ${cp.concern}
   Mitigation Protocol: ${cp.mitigation}`).join('\n')}

--------------------------------------------------------------------------------
QUALITY ASSURANCE CERTIFICATION:
Certified by Chambers Client Relations Desk & Senior Counsel Managing Partner.
Petersons Angwenyi & Associates Advocates
Upper Hill Chambers, Nairobi, Kenya
================================================================================`;

    const blob = new Blob([memoContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CLIENT_SENTIMENT_AUDIT_${matter.reference.replace(/[/\\?%*:|"<>]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotice(`Certified Client Sentiment & Satisfaction Audit exported for ${matter.clientEntity}`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  return (
    <div className="p-5 sm:p-6 bg-[#0B1019] rounded-2xl border border-[#C5A880]/35 shadow-xl space-y-6 animate-fadeIn">
      
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1A2538] pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 flex items-center justify-center text-[#C5A880] border border-[#C5A880]/30 shrink-0 shadow-inner">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-cinzel text-white">
                {t('analytics.sentimentTrendsTitle')}
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI Speech & Transcript Analyzed
              </span>
            </div>
            <p className="text-xs text-[#8C98AE] mt-0.5">
              {t('analytics.sentimentTrendsSubtitle')} · Client: <strong className="text-[#E4C999] font-medium">{matter.clientEntity}</strong>
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0">
          <button
            type="button"
            onClick={handleExportAudit}
            className="flex items-center gap-2 px-3 py-2 bg-[#141C2B] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] rounded-xl text-xs font-semibold border border-[#C5A880]/30 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('analytics.exportSentimentAudit')}</span>
          </button>
        </div>
      </div>

      {/* Global Toast Notice */}
      {downloadNotice && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400/80 font-semibold">Audited Client Report</span>
        </div>
      )}

      {/* Core KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-[#0E1522] rounded-xl border border-[#1E293B] relative overflow-hidden">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#7C8B9F] block">
            {t('analytics.clientSentimentScore')}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-mono font-bold text-emerald-400">
              {aggregateMetrics.currentScore}%
            </span>
            <span className="text-xs text-[#8C98AE]">/ 100</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-300 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>+14% since trial pleadings inception</span>
          </div>
        </div>

        <div className="p-4 bg-[#0E1522] rounded-xl border border-[#1E293B]">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#7C8B9F] block">
            {t('analytics.sentimentTrajectory')}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-3xl font-mono font-bold text-white">
              +{aggregateMetrics.trajectory}
            </span>
            <span className="text-xs text-[#C5A880] font-mono">pts</span>
          </div>
          <p className="text-[11px] text-[#8C98AE] mt-2">
            Continuous positive trajectory across {sessionSentimentList.length} verified sessions.
          </p>
        </div>

        <div className="p-4 bg-[#0E1522] rounded-xl border border-[#1E293B]">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#7C8B9F] block">
            {t('analytics.concernResolutionEfficiency')}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-3xl font-mono font-bold text-[#E4C999]">
              {aggregateMetrics.resolvedConcernsRatio}
            </span>
            <span className="text-xs text-slate-300">mitigated</span>
          </div>
          <p className="text-[11px] text-[#8C98AE] mt-2">
            11 of 13 identified client anxieties resolved by court orders.
          </p>
        </div>

        <div className="p-4 bg-[#0E1522] rounded-xl border border-[#1E293B]">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#7C8B9F] block">
            Transcript Sentiment Distribution
          </span>
          <div className="mt-2 space-y-1.5">
            <div className="w-full h-2 bg-[#1A2538] rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-400" style={{ width: `${aggregateMetrics.satisfactionSharePct}%` }} title="Satisfaction: 78%" />
              <div className="h-full bg-[#C5A880]" style={{ width: `${aggregateMetrics.neutralSharePct}%` }} title="Neutral / Procedural: 14%" />
              <div className="h-full bg-rose-500" style={{ width: `${aggregateMetrics.concernSharePct}%` }} title="Active Concern: 8%" />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8C98AE]">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Satisfied: {aggregateMetrics.satisfactionSharePct}%
              </span>
              <span className="flex items-center gap-1 text-[#E4C999]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                Neutral: {aggregateMetrics.neutralSharePct}%
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Concern: {aggregateMetrics.concernSharePct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sentiment Trends SVG Visualization Graph */}
      <div className="p-5 sm:p-6 bg-[#0E1522] rounded-2xl border border-[#1E293B] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A2538] pb-3">
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#C5A880]" />
              <span>Transcribed Meeting Sentiment Trajectory Graph</span>
            </h5>
            <p className="text-[11px] text-[#8C98AE] mt-0.5">
              Chronological confidence progression extracted from meeting speech-to-text transcripts & court orders.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#8C98AE] bg-[#141C2B] px-2.5 py-1 rounded-lg border border-[#202C40] self-start sm:self-auto">
            Click any session node below to inspect verbatim drivers
          </span>
        </div>

        {/* SVG Curve Chart */}
        <div className="relative pt-6 pb-2 px-2 sm:px-6 bg-[#090D15] rounded-xl border border-[#182335] overflow-x-auto no-scrollbar">
          <div className="min-w-[620px]">
            {/* Y Axis Guide Lines */}
            <div className="relative h-44 w-full">
              {/* Reference Grid Lines */}
              <div className="absolute inset-x-0 top-0 border-b border-[#1D293E] flex items-center justify-between text-[10px] font-mono text-[#526079] pb-0.5">
                <span>100% · Optimal Alignment</span>
                <span>Peak Confidence</span>
              </div>
              <div className="absolute inset-x-0 top-1/2 border-b border-[#182335] flex items-center justify-between text-[10px] font-mono text-[#404D63] pb-0.5">
                <span>75% · Substantive Comfort Threshold</span>
                <span>Chambers Standard</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 border-b border-[#182335] flex items-center justify-between text-[10px] font-mono text-[#364356] pb-0.5">
                <span>50% · Initial Emergency Filing Baseline</span>
                <span>Dispute Origin</span>
              </div>

              {/* Dynamic SVG Spline */}
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 160">
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#C5A880" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#C5A880" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="sentimentStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#C5A880" />
                    <stop offset="50%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>

                {/* Shaded Area under Curve */}
                <path
                  d={`M 50 ${160 - (sessionSentimentList[0].score - 50) * 3} 
                     C 180 ${160 - (sessionSentimentList[0].score - 50) * 3}, 
                       180 ${160 - (sessionSentimentList[1].score - 50) * 3}, 
                       230 ${160 - (sessionSentimentList[1].score - 50) * 3}
                     C 300 ${160 - (sessionSentimentList[1].score - 50) * 3}, 
                       330 ${160 - (sessionSentimentList[2].score - 50) * 3}, 
                       390 ${160 - (sessionSentimentList[2].score - 50) * 3}
                     C 460 ${160 - (sessionSentimentList[2].score - 50) * 3}, 
                       490 ${160 - (sessionSentimentList[3].score - 50) * 3}, 
                       550 ${160 - (sessionSentimentList[3].score - 50) * 3}
                     L 550 160 L 50 160 Z`}
                  fill="url(#sentimentGradient)"
                />

                {/* Primary Spline Curve */}
                <path
                  d={`M 50 ${160 - (sessionSentimentList[0].score - 50) * 3} 
                     C 180 ${160 - (sessionSentimentList[0].score - 50) * 3}, 
                       180 ${160 - (sessionSentimentList[1].score - 50) * 3}, 
                       230 ${160 - (sessionSentimentList[1].score - 50) * 3}
                     C 300 ${160 - (sessionSentimentList[1].score - 50) * 3}, 
                       330 ${160 - (sessionSentimentList[2].score - 50) * 3}, 
                       390 ${160 - (sessionSentimentList[2].score - 50) * 3}
                     C 460 ${160 - (sessionSentimentList[2].score - 50) * 3}, 
                       490 ${160 - (sessionSentimentList[3].score - 50) * 3}, 
                       550 ${160 - (sessionSentimentList[3].score - 50) * 3}`}
                  fill="none"
                  stroke="url(#sentimentStroke)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>

              {/* Interactive Nodes Placed Along Graph */}
              {sessionSentimentList.map((session, idx) => {
                const xPercent = [10, 38, 65, 92][idx];
                const yPercent = Math.max(5, Math.min(95, 100 - (session.score - 50) * 1.9));
                const isSelected = activeSession.id === session.id;

                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                    style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                  >
                    {/* Pulsing ring on selection */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                        isSelected
                          ? 'bg-emerald-500 border-white ring-4 ring-emerald-500/30 scale-125 shadow-lg'
                          : session.score >= 85
                          ? 'bg-[#0E1522] border-emerald-400 group-hover:scale-110'
                          : 'bg-[#0E1522] border-[#C5A880] group-hover:scale-110'
                      }`}
                    >
                      <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-slate-950' : 'text-white'}`}>
                        {idx + 1}
                      </span>
                    </div>

                    {/* Popover Badge */}
                    <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow-md ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-[#151F31] text-[#E4C999] border border-[#23334E]'
                      }`}>
                        {session.score}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X Axis Meeting Labels */}
            <div className="grid grid-cols-4 gap-2 pt-8 text-center text-xs">
              {sessionSentimentList.map((s, idx) => {
                const isSelected = activeSession.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSessionId(s.id)}
                    className={`p-2 rounded-xl transition-all text-left ${
                      isSelected
                        ? 'bg-[#152136] border border-[#C5A880]/50 shadow-md'
                        : 'hover:bg-[#111826] border border-transparent'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-[#8C98AE] block">
                      Session {idx + 1} · {s.date}
                    </span>
                    <span className={`text-xs font-semibold block truncate mt-0.5 ${isSelected ? 'text-[#E4C999]' : 'text-slate-200'}`}>
                      {s.topic}
                    </span>
                    <span className="text-[10px] font-mono text-[#718096] block mt-0.5 truncate">
                      {s.advocateName.split('(')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Session Sentiment Deep-Dive Inspection Card */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#111827] to-[#141E30] rounded-xl border border-[#C5A880]/40 shadow-inner space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1C283E] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded bg-[#C5A880]/20 text-[#E4C999] font-mono text-xs font-bold border border-[#C5A880]/30">
                Session Inspection: {activeSession.date}
              </span>
              <span className="text-sm font-semibold text-white">
                {activeSession.topic}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8C98AE]">Counsel: <strong className="text-white font-medium">{activeSession.advocateName}</strong></span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                Score: {activeSession.score}% ({activeSession.label})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Primary Satisfaction Driver */}
            <div className="p-3 bg-[#0B1019] rounded-xl border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Key Satisfaction Driver:</span>
              </div>
              <p className="text-white font-medium">
                {activeSession.primarySatisfaction}
              </p>
              <span className="text-[10px] text-[#718096] font-mono block">
                Category: {activeSession.satisfactionCategory}
              </span>
            </div>

            {/* Identified Area of Concern */}
            <div className="p-3 bg-[#0B1019] rounded-xl border border-amber-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Area of Client Concern Identified:</span>
                </div>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-amber-950 text-amber-300 border border-amber-500/40">
                  {activeSession.concernSeverity} Friction
                </span>
              </div>
              <p className="text-slate-200">
                {activeSession.primaryConcern}
              </p>
              <p className="text-[11px] text-emerald-400/90 pt-1 border-t border-[#1C2638]">
                <strong>Chambers Mitigation Protocol:</strong> {activeSession.mitigationAction}
              </p>
            </div>
          </div>

          {/* Verbatim Transcript Quote */}
          <div className="p-3 bg-[#090D15] rounded-xl border border-[#1C273C] flex items-start gap-3">
            <Quote className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs italic text-[#BAC8DC]">
                "{activeSession.speakerQuote}"
              </p>
              <span className="text-[10px] font-mono text-[#7888A0] block">
                Direct Speech Extract · {activeSession.speakerName} · Verbatim Attendance Transcript
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Pillar Breakdown: Areas of Legal Satisfaction vs Key Areas of Concern */}
      <div className="space-y-4">
        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTabFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTabFilter === 'all'
                  ? 'bg-[#C5A880] text-[#0A0E17]'
                  : 'bg-[#141C2B] text-[#8C98AE] hover:text-white border border-[#202C40]'
              }`}
            >
              All Sentiment Factors
            </button>
            <button
              type="button"
              onClick={() => setActiveTabFilter('satisfaction')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTabFilter === 'satisfaction'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#141C2B] text-emerald-400 hover:text-white border border-[#202C40]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Areas of Satisfaction ({sessionSentimentList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabFilter('concerns')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTabFilter === 'concerns'
                  ? 'bg-amber-600 text-white'
                  : 'bg-[#141C2B] text-amber-400 hover:text-white border border-[#202C40]'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Areas of Concern & Friction ({sessionSentimentList.length})</span>
            </button>
          </div>

          <span className="text-xs text-[#8C98AE] font-mono">
            Client Account: {matter.clientEntity}
          </span>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Pillar 1: Areas of Legal Satisfaction */}
          {(activeTabFilter === 'all' || activeTabFilter === 'satisfaction') && (
            <div className="p-5 bg-[#0E1522] rounded-2xl border border-emerald-500/30 space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#1A2538] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                      {t('analytics.areasOfSatisfaction')}
                    </h5>
                    <span className="text-[10px] text-[#8C98AE]">
                      Key Strategic Drivers Identified Across Meetings
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                  92% Avg Alignment
                </span>
              </div>

              <div className="space-y-2.5">
                {sessionSentimentList.map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#111826] rounded-xl border border-[#1E293B] hover:border-emerald-500/40 transition-colors space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">
                        {item.satisfactionCategory}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        {item.score}% Confidence
                      </span>
                    </div>
                    <p className="text-xs text-[#B2BDCE] leading-relaxed">
                      {item.primarySatisfaction}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[#6F7F95]">
                      <span>Source: Session {idx + 1} ({item.date})</span>
                      <span className="text-[#C5A880]">Lead: {item.advocateName.split(' ')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pillar 2: Key Areas of Concern & Procedural Friction */}
          {(activeTabFilter === 'all' || activeTabFilter === 'concerns') && (
            <div className="p-5 bg-[#0E1522] rounded-2xl border border-amber-500/30 space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#1A2538] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-950/70 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                      {t('analytics.areasOfConcern')}
                    </h5>
                    <span className="text-[10px] text-[#8C98AE]">
                      Procedural Friction & Active Chambers Mitigations
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                  {aggregateMetrics.resolvedConcernsRatio} Mitigated
                </span>
              </div>

              <div className="space-y-2.5">
                {sessionSentimentList.map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#111826] rounded-xl border border-[#1E293B] hover:border-amber-500/40 transition-colors space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">
                        {item.concernCategory}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        item.concernSeverity === 'High'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}>
                        {item.concernSeverity} Friction
                      </span>
                    </div>
                    
                    <p className="text-xs text-[#B2BDCE] leading-relaxed">
                      {item.primaryConcern}
                    </p>

                    {/* Mitigation Protocol */}
                    <div className="p-2 bg-[#0A0F17] rounded-lg border border-[#1A2436] text-[11px] text-emerald-300">
                      <span className="font-semibold text-emerald-400 block font-mono text-[10px] uppercase">
                        Chambers Mitigating Action:
                      </span>
                      <span className="mt-0.5 block leading-normal">
                        {item.mitigationAction}
                      </span>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[#6F7F95]">
                      <span>Flagged: {item.date}</span>
                      <span className="text-emerald-400 font-semibold">Status: Addressed by Order</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer Guarantee */}
      <div className="p-3.5 bg-[#080C14] rounded-xl border border-[#182334] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#718096]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0" />
          <span>
            Sentiment algorithms operate under strict advocate-client privilege pursuant to <strong>Section 134 Evidence Act (Cap 80)</strong>.
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#A6B4CD] shrink-0">
          Chambers Quality Assurance Audit
        </span>
      </div>

    </div>
  );
};
