import React, { useState, useMemo } from 'react';
import { 
  DollarSign, Landmark, Scale, FileText, CheckCircle2, Clock, 
  ArrowUpRight, ArrowDownRight, Download, Filter, Search, Printer, 
  AlertCircle, ShieldCheck, ChevronRight, X, Building2, CreditCard,
  Plus, Receipt, RefreshCw, Sparkles, Check, HelpCircle, FileCheck
} from 'lucide-react';
import { ClientMatter, MatterInvoice } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

interface BillingDashboardProps {
  matter: ClientMatter;
  onUpdateInvoices?: (invoices: MatterInvoice[]) => void;
}

interface EscrowTransaction {
  id: string;
  date: string;
  type: 'deposit' | 'disbursement' | 'fee_settlement';
  description: string;
  reference: string;
  amount: string;
  runningBalance: string;
  verifiedBy: string;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({ matter, onUpdateInvoices }) => {
  const { t } = useLanguage();

  // Active Billing View: 'invoices' | 'ledger' | 'disbursements' | 'aro_calculator'
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'ledger' | 'disbursements' | 'aro_calculator'>('invoices');

  // Invoices State (with real-time authorization support)
  const [invoices, setInvoices] = useState<MatterInvoice[]>(matter.invoices || []);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid / Reconciled' | 'Pending Escrow Clearance' | 'Disbursed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Invoice for Detailed ARO Tax Note Modal
  const [selectedInvoice, setSelectedInvoice] = useState<MatterInvoice | null>(null);

  // Escrow Settlement State
  const [settlingInvoiceNo, setSettlingInvoiceNo] = useState<string | null>(null);
  const [settlementSuccessNotice, setSettlementSuccessNotice] = useState<string | null>(null);

  // Escrow Top-Up Modal State
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('5,000,000');
  const [topUpRef, setTopUpRef] = useState('RTGS-KCB-2026-');
  const [topUpSuccessNotice, setTopUpSuccessNotice] = useState<string | null>(null);

  // Statement Export Modal
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  // Escrow Transactions Ledger
  const [escrowTransactions, setEscrowTransactions] = useState<EscrowTransaction[]>([
    {
      id: 'tx-1',
      date: '10 Oct 2026',
      type: 'deposit',
      description: 'Initial Institutional Escrow Deposit (RTGS Transfer from KCB Corporate Account)',
      reference: 'KCB-RTGS-992014-KE',
      amount: '+ KES 50,000,000',
      runningBalance: 'KES 50,000,000',
      verifiedBy: 'KCB Corporate Escrow Desk & PAA Finance Partner'
    },
    {
      id: 'tx-2',
      date: '12 Oct 2026',
      type: 'disbursement',
      description: 'Milimani Commercial Registry Electronic E-Filing Dues & Plaint Stamp Duty',
      reference: 'CTS-DISB-MIL-1014',
      amount: '- KES 145,000',
      runningBalance: 'KES 49,855,000',
      verifiedBy: 'Judiciary CTS Auto-Reconciliation'
    },
    {
      id: 'tx-3',
      date: '14 Oct 2026',
      type: 'fee_settlement',
      description: 'Settlement of Invoice INV-2026-PAA-0418 (Initial Professional Retainer ARO Sched 6)',
      reference: 'SETTLE-INV-0418',
      amount: '- KES 5,800,000',
      runningBalance: 'KES 44,055,000',
      verifiedBy: 'General Counsel Authorization Token'
    },
    {
      id: 'tx-4',
      date: '26 Oct 2026',
      type: 'fee_settlement',
      description: 'Settlement of Invoice INV-2026-PAA-0462 (Chambers Injunction Appearance)',
      reference: 'SETTLE-INV-0462',
      amount: '- KES 2,900,000',
      runningBalance: 'KES 41,155,000',
      verifiedBy: 'General Counsel Authorization Token'
    },
    {
      id: 'tx-5',
      date: '02 Nov 2026',
      type: 'disbursement',
      description: 'High Court Certified Orders Extraction & Commissioner for Oaths Attestation Fees',
      reference: 'CTS-DISB-ORD-3829',
      amount: '- KES 85,000',
      runningBalance: 'KES 41,070,000',
      verifiedBy: 'Chambers Process Server Certificate'
    }
  ]);

  // ARO Calculator Interactive State
  const [claimValueInput, setClaimValueInput] = useState<number>(350000000);
  const [selectedForumScale, setSelectedForumScale] = useState<'highCourt' | 'courtOfAppeal' | 'arbitration'>('highCourt');

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      const matchesSearch = 
        inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.statutoryScale.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [invoices, statusFilter, searchQuery]);

  // Handle Authorize Escrow Release
  const handleAuthorizeEscrowRelease = (invoice: MatterInvoice) => {
    setSettlingInvoiceNo(invoice.invoiceNo);
    setSettlementSuccessNotice(null);

    setTimeout(() => {
      const updated = invoices.map(inv => {
        if (inv.invoiceNo === invoice.invoiceNo) {
          return { ...inv, status: 'Paid / Reconciled' as const };
        }
        return inv;
      });
      setInvoices(updated);
      if (onUpdateInvoices) onUpdateInvoices(updated);

      // Add debit to ledger
      const newTx: EscrowTransaction = {
        id: `tx-${Date.now()}`,
        date: 'Today, Just Now',
        type: 'fee_settlement',
        description: `Escrow Release Authorized for ${invoice.invoiceNo} (${invoice.description})`,
        reference: `ESC-AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: `- ${invoice.total}`,
        runningBalance: 'KES 35,270,000',
        verifiedBy: 'Corporate In-House Counsel Digital Signature'
      };
      setEscrowTransactions(prev => [newTx, ...prev]);

      setSettlingInvoiceNo(null);
      setSettlementSuccessNotice(`Payment Authorization Approved! Invoice ${invoice.invoiceNo} settled via Institutional Escrow.`);
      if (selectedInvoice && selectedInvoice.invoiceNo === invoice.invoiceNo) {
        setSelectedInvoice({ ...selectedInvoice, status: 'Paid / Reconciled' });
      }
    }, 700);
  };

  // Handle Escrow Top-Up Simulation
  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx: EscrowTransaction = {
      id: `tx-${Date.now()}`,
      date: 'Today, Real-Time RTGS',
      type: 'deposit',
      description: `Institutional Escrow Top-Up Deposit via KCB Bank Kenya`,
      reference: topUpRef + Math.floor(1000 + Math.random() * 9000),
      amount: `+ KES ${topUpAmount}`,
      runningBalance: 'KES 55,000,000',
      verifiedBy: 'KCB Corporate Treasury Desk'
    };
    setEscrowTransactions(prev => [newTx, ...prev]);
    setTopUpSuccessNotice(`RTGS Escrow Notice received! KES ${topUpAmount} credited to Trust Ledger.`);
    setTimeout(() => {
      setIsTopUpModalOpen(false);
      setTopUpSuccessNotice(null);
    }, 1800);
  };

  // ARO Calculator Formula
  const calculatedARO = useMemo(() => {
    let scaleBase = 2500000;
    let percentageRate = 0.015;
    if (selectedForumScale === 'courtOfAppeal') {
      scaleBase = 3500000;
      percentageRate = 0.02;
    } else if (selectedForumScale === 'arbitration') {
      scaleBase = 4000000;
      percentageRate = 0.025;
    }

    const valueFee = Math.round(claimValueInput * percentageRate);
    const instructionFee = Math.max(scaleBase, valueFee);
    const vat = Math.round(instructionFee * 0.16);
    const totalAssessed = instructionFee + vat;

    return {
      instructionFee: `KES ${instructionFee.toLocaleString()}`,
      vat: `KES ${vat.toLocaleString()}`,
      totalAssessed: `KES ${totalAssessed.toLocaleString()}`,
      rateDescription: `${(percentageRate * 100).toFixed(1)}% of Subject Valuation above statutory threshold`
    };
  }, [claimValueInput, selectedForumScale]);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ================= 1. STATUTORY NOTICE & ACTIONS HEADER ================= */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#101726] via-[#131D30] to-[#0F1626] border border-[#223048] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center text-[#E4C999] shrink-0">
            <Landmark className="w-5 h-5 text-[#C5A880]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-cinzel">
                Institutional Billing & Escrow Trust Accounting
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                LSK Trust Rules Cap 16
              </span>
            </div>
            <p className="text-xs text-[#8C98AE] mt-0.5">
              Strictly segregated institutional escrow held under KCB Bank Kenya. Fee notes rendered pursuant to the Advocates (Remuneration) Order (Cap 16).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => setIsTopUpModalOpen(true)}
            className="px-3.5 py-2 bg-[#1A2538] hover:bg-[#23334E] text-[#E4C999] border border-[#C5A880]/30 hover:border-[#C5A880] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Fund Escrow / Top-Up</span>
          </button>

          <button
            onClick={() => setIsStatementModalOpen(true)}
            className="px-3.5 py-2 bg-[#C5A880] text-[#0A0E17] hover:brightness-110 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-[#C5A880]/15"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Certified Statement</span>
          </button>
        </div>
      </div>

      {/* Global Success / Alert Banner */}
      {settlementSuccessNotice && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{settlementSuccessNotice}</span>
          </div>
          <button onClick={() => setSettlementSuccessNotice(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= 2. EXECUTIVE FINANCIAL METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Assessed Retainer */}
        <div className="p-4 bg-[#0E1522] rounded-xl border border-[#1E293B] relative overflow-hidden group hover:border-[#2C3B57] transition-all">
          <div className="flex items-center justify-between text-xs text-[#8C98AE]">
            <span>Agreed Retainer / Assessed Fee</span>
            <Scale className="w-3.5 h-3.5 text-[#C5A880]" />
          </div>
          <div className="text-xl font-mono font-bold text-white mt-1.5 tabular-nums">
            {matter.financialSummary.totalRetainer}
          </div>
          <div className="text-[11px] text-[#717E94] mt-1 flex items-center gap-1.5 font-mono">
            <span>ARO Cap 16 Schedule 6 Approved</span>
          </div>
        </div>

        {/* Metric 2: Settled Fees */}
        <div className="p-4 bg-[#0E1522] rounded-xl border border-[#1E293B] relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-[#8C98AE]">
            <span>Settled Fees to Date</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-1.5 tabular-nums">
            {matter.financialSummary.settledToDate}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1 font-mono">
            <ArrowUpRight className="w-3 h-3" />
            <span>Reconciled with Tax Invoices</span>
          </div>
        </div>

        {/* Metric 3: Institutional Escrow Balance */}
        <div className="p-4 bg-gradient-to-br from-[#121B2B] to-[#0E1522] rounded-xl border border-[#C5A880]/40 relative overflow-hidden group shadow-md shadow-[#C5A880]/5">
          <div className="flex items-center justify-between text-xs text-[#C5A880] font-medium">
            <span>Funds Held in Escrow</span>
            <Landmark className="w-3.5 h-3.5 text-[#E4C999]" />
          </div>
          <div className="text-xl font-mono font-bold text-[#E4C999] mt-1.5 tabular-nums">
            {matter.financialSummary.heldInEscrow}
          </div>
          <div className="text-[11px] text-[#8C98AE] mt-1 font-mono truncate">
            {matter.trustAccount.split('-')[0].trim()}
          </div>
        </div>

        {/* Metric 4: Statutory Court Disbursements */}
        <div className="p-4 bg-[#0E1522] rounded-xl border border-[#1E293B] relative overflow-hidden group hover:border-[#2C3B57] transition-all">
          <div className="flex items-center justify-between text-xs text-[#8C98AE]">
            <span>Statutory Disbursements</span>
            <Receipt className="w-3.5 h-3.5 text-[#8C98AE]" />
          </div>
          <div className="text-xl font-mono font-bold text-white mt-1.5 tabular-nums">
            {matter.financialSummary.statutoryDisbursements}
          </div>
          <div className="text-[11px] text-[#717E94] mt-1 font-mono">
            Court Registry Fees & Stamp Duty
          </div>
        </div>
      </div>

      {/* Retainer Burn Progression Bar */}
      <div className="p-4 bg-[#0E1522] rounded-xl border border-[#1E293B] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#8C98AE] font-medium">
            Professional Retainer Utilization: <strong className="text-white">60% Absorbed</strong>
          </span>
          <span className="font-mono text-[#C5A880] text-[11px]">
            Statutory Trust Buffer: Adequate for Trial Phase
          </span>
        </div>
        <div className="w-full h-2.5 bg-[#172133] rounded-full overflow-hidden flex">
          <div className="h-full bg-emerald-500 rounded-l-full transition-all duration-700" style={{ width: '60%' }} title="Settled to Date: 60%" />
          <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: '25%' }} title="Pending Escrow Clearance: 25%" />
          <div className="h-full bg-[#27364F] rounded-r-full" style={{ width: '15%' }} title="Available Retainer Cap: 15%" />
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#64748B] font-mono pt-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Settled Fees (60%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending Escrow Clearance (25%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#27364F]" /> Remaining Retainer Cap (15%)
          </span>
        </div>
      </div>

      {/* ================= 3. BILLING SUB-TABS NAVIGATION ================= */}
      <div className="flex items-center gap-2 border-b border-[#1E293E] pb-2 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('invoices')}
          className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'invoices'
              ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md shadow-[#C5A880]/20'
              : 'bg-[#121927] text-[#94A3B8] hover:text-white border border-[#202C42]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>ARO Fee Notes & Tax Invoices ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'ledger'
              ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md shadow-[#C5A880]/20'
              : 'bg-[#121927] text-[#94A3B8] hover:text-white border border-[#202C42]'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Escrow Trust Ledger Audit Trail</span>
        </button>

        <button
          onClick={() => setActiveSubTab('disbursements')}
          className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'disbursements'
              ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md shadow-[#C5A880]/20'
              : 'bg-[#121927] text-[#94A3B8] hover:text-white border border-[#202C42]'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Disbursements Breakdown</span>
        </button>

        <button
          onClick={() => setActiveSubTab('aro_calculator')}
          className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'aro_calculator'
              ? 'bg-[#C5A880] text-[#0A0E17] font-bold shadow-md shadow-[#C5A880]/20'
              : 'bg-[#121927] text-[#94A3B8] hover:text-white border border-[#202C42]'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>ARO Statutory Fee Scale Auditor</span>
        </button>
      </div>

      {/* ================= SUB-TAB 1: INVOICES & STATUTORY FEE NOTES ================= */}
      {activeSubTab === 'invoices' && (
        <div className="p-5 bg-[#0E1522] rounded-2xl border border-[#1E293B] space-y-4">
          
          {/* Controls: Search & Status Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by invoice number, legal description, or ARO scale..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121927] border border-[#232F46] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#5A6578] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[#8C98AE] mr-1 hidden md:inline">Status:</span>
              {(['all', 'Paid / Reconciled', 'Pending Escrow Clearance', 'Disbursed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? 'border-[#C5A880] bg-[#C5A880]/15 text-[#E4C999] font-semibold'
                      : 'border-[#202B3D] bg-[#121927] text-[#8C98AE] hover:text-white'
                  }`}
                >
                  {st === 'all' ? 'All Invoices' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Invoices Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1F2B3E] text-[#8C98AE] font-mono">
                  <th className="py-3 px-3">INVOICE NO</th>
                  <th className="py-3 px-3">DATE</th>
                  <th className="py-3 px-3">DESCRIPTION / LEGAL SERVICES</th>
                  <th className="py-3 px-3">STATUTORY ARO SCALE</th>
                  <th className="py-3 px-3 text-right">TOTAL (INC. VAT)</th>
                  <th className="py-3 px-3 text-center">STATUS</th>
                  <th className="py-3 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172132]">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#8C98AE]">
                      No fee notes match your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.invoiceNo} className="hover:bg-[#121927] transition-colors group">
                      
                      <td className="py-3.5 px-3 font-mono font-medium text-white">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="hover:text-[#C5A880] hover:underline flex items-center gap-1"
                        >
                          <span>{inv.invoiceNo}</span>
                          <ArrowUpRight className="w-3 h-3 text-[#64748B] group-hover:text-[#C5A880]" />
                        </button>
                      </td>

                      <td className="py-3.5 px-3 text-[#8C98AE] whitespace-nowrap font-mono text-[11px]">
                        {inv.date}
                      </td>

                      <td className="py-3.5 px-3 text-[#CBD5E1] max-w-xs">
                        <div className="font-medium text-white">{inv.description}</div>
                        <div className="text-[10px] text-[#6C7B93] mt-0.5">
                          Base: {inv.amount} · Tax: {inv.taxVat}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-[#8C98AE] font-mono text-[11px]">
                        {inv.statutoryScale}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-white whitespace-nowrap text-sm">
                        {inv.total}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-mono border ${
                          inv.status.includes('Paid')
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                            : 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                        }`}>
                          {inv.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.status.includes('Pending') ? (
                            <button
                              onClick={() => handleAuthorizeEscrowRelease(inv)}
                              disabled={settlingInvoiceNo === inv.invoiceNo}
                              className="px-3 py-1 bg-gradient-to-r from-[#C5A880] to-[#E4C999] hover:brightness-105 text-[#0A0E17] font-bold text-[11px] rounded-lg shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
                            >
                              {settlingInvoiceNo === inv.invoiceNo ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  <span>Authorizing...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                  <span>Authorize Release</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="px-2.5 py-1 bg-[#141F30] hover:bg-[#1E2E48] text-[#C5A880] text-[11px] font-medium rounded-lg border border-[#C5A880]/30 transition-all flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              <span>View Note</span>
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 2: ESCROW TRUST LEDGER AUDIT TRAIL ================= */}
      {activeSubTab === 'ledger' && (
        <div className="p-5 bg-[#0E1522] rounded-2xl border border-[#1E293B] space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1C2638] pb-4 gap-3">
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-cinzel">
                Institutional Escrow Trust Account Statement
              </h4>
              <p className="text-xs text-[#8C98AE] mt-0.5">
                Designated Client Trust Account: <strong>{matter.trustAccount}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40">
                Audited & Reconciled Daily
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {escrowTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 bg-[#121927] rounded-xl border border-[#1E2A3E] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:border-[#2D3E5C] transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    tx.type === 'deposit'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                      : 'bg-[#182335] text-[#C5A880] border border-[#2B3B54]'
                  }`}>
                    {tx.type === 'deposit' ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>{tx.description}</span>
                    </div>
                    <div className="text-[11px] text-[#8C98AE] font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>Date: {tx.date}</span>
                      <span>·</span>
                      <span>Ref: <strong className="text-[#E4C999]">{tx.reference}</strong></span>
                      <span>·</span>
                      <span>Verified: {tx.verifiedBy}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`font-mono font-bold text-sm ${
                    tx.type === 'deposit' ? 'text-emerald-400' : 'text-slate-200'
                  }`}>
                    {tx.amount}
                  </div>
                  <div className="text-[10px] font-mono text-[#64748B] mt-0.5">
                    Balance: <strong className="text-white">{tx.runningBalance}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#111928] rounded-xl border border-[#1E293B] text-[11px] text-[#8C98AE] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Governed by Advocates (Accounts) Rules & Cap 16 Section 83</span>
            </span>
            <span className="font-mono text-[#C5A880]">KCB Corporate Branch Routing</span>
          </div>

        </div>
      )}

      {/* ================= SUB-TAB 3: DISBURSEMENTS BREAKDOWN ================= */}
      {activeSubTab === 'disbursements' && (
        <div className="p-5 bg-[#0E1522] rounded-2xl border border-[#1E293B] space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-cinzel">
              Statutory Court Disbursements & Out-of-Pocket Expenses
            </h4>
            <p className="text-xs text-[#8C98AE]">
              All court filing registry receipts, stamp duty, expert witness expenses, and process service returns are charged strictly at cost without chambers markup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 bg-[#121927] rounded-xl border border-[#1E293E] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#8C98AE]">
                <span>Kenya Judiciary CTS E-Filing</span>
                <span className="font-mono text-white font-bold">KES 145,000</span>
              </div>
              <div className="text-[11px] text-[#CBD5E1]">
                Originating Plaint filing, Verifying Affidavit swearing, and daily commercial list extraction.
              </div>
              <div className="text-[10px] font-mono text-[#64748B]">Receipt: CTS-RECEIPT-2026-9014</div>
            </div>

            <div className="p-4 bg-[#121927] rounded-xl border border-[#1E293E] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#8C98AE]">
                <span>Court-Annexed Service of Process</span>
                <span className="font-mono text-white font-bold">KES 85,000</span>
              </div>
              <div className="text-[11px] text-[#CBD5E1]">
                Personal service on the Attorney General & State Law Office with statutory Affidavit of Service filed.
              </div>
              <div className="text-[10px] font-mono text-[#64748B]">Affidavit: AFF-SERV-MIL-3829</div>
            </div>

            <div className="p-4 bg-[#121927] rounded-xl border border-[#1E293E] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#8C98AE]">
                <span>Senior Counsel Brief Refresher</span>
                <span className="font-mono text-white font-bold">KES 182,500</span>
              </div>
              <div className="text-[11px] text-[#CBD5E1]">
                Bench research bundles, statutory gazette gazetting, and expedited hearing transcript generation.
              </div>
              <div className="text-[10px] font-mono text-[#64748B]">Chambers Ref: REF-SEN-0842</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 4: ARO STATUTORY FEE SCALE AUDITOR ================= */}
      {activeSubTab === 'aro_calculator' && (
        <div className="p-5 bg-[#0E1522] rounded-2xl border border-[#1E293B] space-y-5">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-cinzel">
              Advocates Remuneration Order (ARO) Statutory Scale Inspector
            </h4>
            <p className="text-xs text-[#8C98AE]">
              Under Cap 16 of the Laws of Kenya, legal fee notes in commercial disputes are strictly calibrated against the subject matter valuation and judicial forum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Input Controls */}
            <div className="p-4 bg-[#121927] rounded-xl border border-[#1E293E] space-y-4">
              <div>
                <label className="text-xs text-[#94A3B8] block mb-1.5 font-medium">
                  Matter / Claim Subject Valuation (KES)
                </label>
                <input
                  type="number"
                  value={claimValueInput}
                  onChange={(e) => setClaimValueInput(Number(e.target.value) || 0)}
                  className="w-full bg-[#151E2E] border border-[#232F46] rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#C5A880]"
                />
                <span className="text-[11px] text-[#64748B] font-mono mt-1 block">
                  Current Case Valuation: KES {claimValueInput.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="text-xs text-[#94A3B8] block mb-1.5 font-medium">
                  Judicial Forum & Statutory Scale
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedForumScale('highCourt')}
                    className={`py-2 px-2.5 rounded-lg border text-center transition-all ${
                      selectedForumScale === 'highCourt'
                        ? 'bg-[#C5A880] text-[#0A0E17] font-bold border-[#C5A880]'
                        : 'bg-[#151E2E] text-[#8C98AE] border-[#222E44] hover:text-white'
                    }`}
                  >
                    High Court (Sched 6)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedForumScale('courtOfAppeal')}
                    className={`py-2 px-2.5 rounded-lg border text-center transition-all ${
                      selectedForumScale === 'courtOfAppeal'
                        ? 'bg-[#C5A880] text-[#0A0E17] font-bold border-[#C5A880]'
                        : 'bg-[#151E2E] text-[#8C98AE] border-[#222E44] hover:text-white'
                    }`}
                  >
                    Court of Appeal
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedForumScale('arbitration')}
                    className={`py-2 px-2.5 rounded-lg border text-center transition-all ${
                      selectedForumScale === 'arbitration'
                        ? 'bg-[#C5A880] text-[#0A0E17] font-bold border-[#C5A880]'
                        : 'bg-[#151E2E] text-[#8C98AE] border-[#222E44] hover:text-white'
                    }`}
                  >
                    Arbitration (Scale IV)
                  </button>
                </div>
              </div>
            </div>

            {/* Calculated Output Inspector */}
            <div className="p-4 bg-gradient-to-br from-[#121B2B] to-[#0D131F] rounded-xl border border-[#C5A880]/30 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E293E] pb-2 text-xs">
                <span className="text-[#C5A880] font-bold uppercase tracking-wider">
                  Statutory Assessed Retainer Scale
                </span>
                <span className="font-mono text-emerald-400">ARO Compliant</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#8C98AE]">Minimum Statutory Instruction Fee:</span>
                  <span className="font-mono font-bold text-white text-sm">{calculatedARO.instructionFee}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8C98AE]">Kenya Revenue Authority VAT (16%):</span>
                  <span className="font-mono text-[#CBD5E1]">{calculatedARO.vat}</span>
                </div>
                <div className="border-t border-[#1E293E] pt-2 flex items-center justify-between">
                  <span className="text-[#E4C999] font-bold">Total Statutory Assessed:</span>
                  <span className="font-mono font-bold text-emerald-400 text-base">{calculatedARO.totalAssessed}</span>
                </div>
                <p className="text-[10px] text-[#64748B] pt-1">
                  Basis: {calculatedARO.rateDescription}. Conforms to Advocates Act (Cap 16) Schedule 6 Part I.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ARO TAX INVOICE & FEE NOTE INSPECTOR ================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#0D131F] border border-[#C5A880]/50 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-200 space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#1E293E] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C5A880]/20 text-[#C5A880] flex items-center justify-center font-bold">
                  §
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white font-cinzel">
                    Advocates Remuneration Order Statutory Fee Note
                  </h4>
                  <span className="text-[11px] font-mono text-[#C5A880]">
                    {selectedInvoice.invoiceNo} · Certified Tax Invoice
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-[#8C98AE] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#121927] rounded-xl border border-[#1E293E] space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#1E293E]">
                <div>
                  <span className="text-[#8C98AE] block">Instructing Client:</span>
                  <strong className="text-white">{matter.clientEntity}</strong>
                </div>
                <div>
                  <span className="text-[#8C98AE] block">Matter Reference:</span>
                  <strong className="text-[#C5A880] font-mono">{matter.reference}</strong>
                </div>
              </div>

              <div>
                <span className="text-[#8C98AE] block">Professional Service / Appearance:</span>
                <p className="text-white mt-0.5">{selectedInvoice.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div>Statutory Scale: <strong className="text-white">{selectedInvoice.statutoryScale}</strong></div>
                <div>Date Rendered: <strong className="text-white">{selectedInvoice.date}</strong></div>
              </div>

              <div className="p-3 bg-[#0A0E17] rounded-lg border border-[#1B2536] space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-[#8C98AE]">
                  <span>Net Legal Instruction Fee:</span>
                  <span className="text-white">{selectedInvoice.amount}</span>
                </div>
                <div className="flex items-center justify-between text-[#8C98AE]">
                  <span>Statutory Value Added Tax (16% VAT):</span>
                  <span className="text-white">{selectedInvoice.taxVat}</span>
                </div>
                <div className="border-t border-[#1C2638] pt-1.5 flex items-center justify-between font-bold text-sm text-[#E4C999]">
                  <span>Total Due (Inc. VAT):</span>
                  <span>{selectedInvoice.total}</span>
                </div>
              </div>

              <div className="text-[10px] text-[#64748B] flex items-center justify-between">
                <span>KRA PIN: P051284910Z · E-TIMS Validated</span>
                <span>Chambers Trust A/C: KCB Upper Hill</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className={`px-2.5 py-1 rounded text-xs font-mono border ${
                selectedInvoice.status.includes('Paid')
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/40'
              }`}>
                Status: {selectedInvoice.status}
              </span>

              <div className="flex items-center gap-2">
                {selectedInvoice.status.includes('Pending') && (
                  <button
                    onClick={() => handleAuthorizeEscrowRelease(selectedInvoice)}
                    disabled={settlingInvoiceNo === selectedInvoice.invoiceNo}
                    className="px-4 py-2 bg-gradient-to-r from-[#C5A880] to-[#E4C999] hover:brightness-105 text-[#0A0E17] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
                  >
                    {settlingInvoiceNo === selectedInvoice.invoiceNo ? (
                      <span>Authorizing...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Authorize Escrow Release</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-[#1A2436] hover:bg-[#23314A] text-white text-xs font-medium rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: ESCROW TOP-UP / DEPOSIT NOTICE ================= */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0D131F] border border-[#C5A880]/50 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#1E293E] pb-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#C5A880]" />
                <h4 className="text-sm font-semibold text-white font-cinzel">
                  Institutional Escrow Top-Up Notice
                </h4>
              </div>
              <button onClick={() => setIsTopUpModalOpen(false)} className="text-[#8C98AE] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {topUpSuccessNotice ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl space-y-2 text-emerald-300 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-xs font-semibold">{topUpSuccessNotice}</p>
              </div>
            ) : (
              <form onSubmit={handleTopUpSubmit} className="space-y-3.5 text-xs">
                <div className="p-3 bg-[#121927] rounded-xl border border-[#1E293E] space-y-1 text-[#8C98AE] font-mono text-[11px]">
                  <div>Bank: <strong className="text-white">KCB Bank Kenya PLC</strong></div>
                  <div>Branch: <strong className="text-white">Upper Hill Corporate Branch</strong></div>
                  <div>Account: <strong className="text-[#E4C999]">{matter.trustAccount}</strong></div>
                  <div>Swift / BIC: <strong className="text-white">KCBLKENX</strong></div>
                </div>

                <div>
                  <label className="text-[#94A3B8] block mb-1 font-medium">Top-Up Amount (KES) *</label>
                  <input
                    type="text"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="w-full bg-[#141C2B] border border-[#232D41] rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#94A3B8] block mb-1 font-medium">RTGS / Bank Reference Number *</label>
                  <input
                    type="text"
                    value={topUpRef}
                    onChange={(e) => setTopUpRef(e.target.value)}
                    className="w-full bg-[#141C2B] border border-[#232D41] rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTopUpModalOpen(false)}
                    className="px-4 py-2 bg-[#1A2436] text-white rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#C5A880] text-[#0A0E17] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110"
                  >
                    Confirm Transmission
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ================= MODAL: PRINT CERTIFIED STATEMENT OF ACCOUNT ================= */}
      {isStatementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-[#0D131F] border border-[#C5A880]/50 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#1E293E] pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#C5A880]" />
                <h4 className="text-sm font-semibold text-white font-cinzel">
                  Certified Client Trust Statement of Account
                </h4>
              </div>
              <button onClick={() => setIsStatementModalOpen(false)} className="text-[#8C98AE] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white text-slate-900 rounded-xl space-y-4 text-xs font-mono max-h-[450px] overflow-y-auto">
              <div className="text-center border-b pb-2">
                <h3 className="font-bold text-base">PETERSONS ANGWENYI & ASSOCIATES ADVOCATES</h3>
                <p className="text-[11px] text-slate-600">PAA Chambers, 9th Floor, Mara Square, Upper Hill, Nairobi</p>
                <p className="text-[11px] text-slate-600">CERTIFIED STATEMENT OF TRUST ACCOUNT & ESCROW LEDGER</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Client: <strong>{matter.clientEntity}</strong></div>
                <div>Matter Ref: <strong>{matter.reference}</strong></div>
                <div>Date: <strong>06 November 2026</strong></div>
                <div>Escrow Bank: <strong>KCB Bank Kenya</strong></div>
              </div>

              <table className="w-full text-left border-t border-b text-[11px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-1.5">Date</th>
                    <th className="p-1.5">Particulars</th>
                    <th className="p-1.5 text-right">Debit</th>
                    <th className="p-1.5 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {escrowTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="p-1.5 whitespace-nowrap">{tx.date.split(',')[0]}</td>
                      <td className="p-1.5">{tx.description}</td>
                      <td className="p-1.5 text-right font-bold text-rose-700">
                        {tx.type !== 'deposit' ? tx.amount.replace('-', '') : '-'}
                      </td>
                      <td className="p-1.5 text-right font-bold text-emerald-700">
                        {tx.type === 'deposit' ? tx.amount.replace('+', '') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center font-bold text-sm pt-1">
                <span>Closing Escrow Trust Balance:</span>
                <span className="text-emerald-800">{matter.financialSummary.heldInEscrow}</span>
              </div>

              <div className="text-[10px] text-slate-500 text-center border-t pt-2">
                Extracted pursuant to Section 83 Advocates Act (Cap 16) · Certified by Managing Partner Milton Angwenyi, SC
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#C5A880] text-[#0A0E17] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Statement</span>
              </button>
              <button
                onClick={() => setIsStatementModalOpen(false)}
                className="px-4 py-2 bg-[#1A2436] text-white text-xs rounded-xl"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
