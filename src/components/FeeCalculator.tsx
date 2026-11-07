import React, { useState } from 'react';
import { Calculator, ArrowRight, ShieldCheck, FileText, CheckCircle2, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FeeCalculatorProps {
  onOpenConsultation: (initialPractice?: string, estimatedFee?: string) => void;
}

export const FeeCalculator: React.FC<FeeCalculatorProps> = ({ onOpenConsultation }) => {
  const { t } = useLanguage();
  const [serviceType, setServiceType] = useState<'conveyancing' | 'litigation' | 'corporate' | 'ip'>('conveyancing');
  
  // Conveyancing state
  const [propertyValue, setPropertyValue] = useState<number>(35000000); // 35M KES
  const [isNairobiMunicipality, setIsNairobiMunicipality] = useState<boolean>(true);

  // Litigation state
  const [claimValue, setClaimValue] = useState<number>(50000000); // 50M KES
  const [courtLevel, setCourtLevel] = useState<'high_court' | 'court_of_appeal' | 'arbitration'>('high_court');

  // Corporate state
  const [retainerTier, setRetainerTier] = useState<'growth' | 'enterprise' | 'transactional'>('enterprise');

  // IP state
  const [ipClassCount, setIpClassCount] = useState<number>(2);

  // Calculation helpers
  const calculateConveyancingFee = (val: number) => {
    // ARO Schedule 1 scale (approximate statutory guidance):
    // First 5M @ 2%, next 15M @ 1.5%, next 80M @ 1.0%, balance @ 0.75%
    let fees = 0;
    if (val <= 5000000) {
      fees = Math.max(val * 0.02, 60000);
    } else if (val <= 20000000) {
      fees = 5000000 * 0.02 + (val - 5000000) * 0.015;
    } else if (val <= 100000000) {
      fees = 5000000 * 0.02 + 15000000 * 0.015 + (val - 20000000) * 0.01;
    } else {
      fees = 5000000 * 0.02 + 15000000 * 0.015 + 80000000 * 0.01 + (val - 100000000) * 0.0075;
    }
    const stampDuty = isNairobiMunicipality ? val * 0.04 : val * 0.02;
    const vat = fees * 0.16;
    const disbursements = 35000; // Searches, rates clearance, registration fees
    return {
      advocateFee: Math.round(fees),
      vat: Math.round(vat),
      stampDuty: Math.round(stampDuty),
      disbursements,
      total: Math.round(fees + vat + stampDuty + disbursements)
    };
  };

  const calculateLitigationFee = (val: number, forum: string) => {
    // Schedule 6 instruction fee calculation
    let base = 250000;
    if (forum === 'court_of_appeal') base = 500000;
    if (forum === 'arbitration') base = 650000;

    let variable = 0;
    if (val <= 10000000) {
      variable = val * 0.025;
    } else if (val <= 50000000) {
      variable = 10000000 * 0.025 + (val - 10000000) * 0.018;
    } else {
      variable = 10000000 * 0.025 + 40000000 * 0.018 + (val - 50000000) * 0.012;
    }
    const instructionFee = Math.round(base + variable);
    const vat = Math.round(instructionFee * 0.16);
    return {
      instructionFee,
      vat,
      total: instructionFee + vat
    };
  };

  const getCorporateEstimate = () => {
    switch (retainerTier) {
      case 'growth':
        return { monthlyRetainer: 250000, scope: "Up to 20 hours monthly advisory, contract vetting, board resolutions & LSK compliance.", vat: 40000 };
      case 'enterprise':
        return { monthlyRetainer: 600000, scope: "Up to 50 hours dedicated partner advisory, CBK/ODPC filings, employment counsel, and priority injunction standby.", vat: 96000 };
      case 'transactional':
        return { monthlyRetainer: 1500000, scope: "Full-scale M&A, cross-border due diligence, antitrust approval with CAK, and consortium negotiations.", vat: 240000 };
    }
  };

  const getIpEstimate = () => {
    const kipiOfficialFees = ipClassCount * 15000;
    const advocateProsecutionFee = 75000 + (ipClassCount - 1) * 35000;
    const vat = advocateProsecutionFee * 0.16;
    return {
      officialFees: kipiOfficialFees,
      advocateFee: advocateProsecutionFee,
      vat: Math.round(vat),
      total: Math.round(kipiOfficialFees + advocateProsecutionFee + vat)
    };
  };

  const convResult = calculateConveyancingFee(propertyValue);
  const litResult = calculateLitigationFee(claimValue, courtLevel);
  const corpResult = getCorporateEstimate();
  const ipResult = getIpEstimate();

  const formatKes = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE')}`;
  };

  return (
    <section id="fee-calculator" className="py-24 bg-[#0A0E17] border-y border-[#1E2536] relative">
      {/* Decorative architectural ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] mb-3 font-semibold">
            <span>{t('fee.kicker')}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-cinzel text-white tracking-tight">
            {t('fee.title')}
          </h2>
          <p className="mt-4 text-[#9BA5B7] leading-relaxed">
            {t('fee.subtitle')}
          </p>
        </div>

        {/* Service Selector Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-[#121824] rounded-xl border border-[#222B3D] max-w-2xl mb-10">
          <button
            onClick={() => setServiceType('conveyancing')}
            className={`px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              serviceType === 'conveyancing'
                ? 'bg-[#C5A880] text-[#0A0E17] font-semibold shadow-md'
                : 'text-[#9BA5B7] hover:text-white'
            }`}
          >
            {t('fee.tabConveyancing')}
          </button>
          <button
            onClick={() => setServiceType('litigation')}
            className={`px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              serviceType === 'litigation'
                ? 'bg-[#C5A880] text-[#0A0E17] font-semibold shadow-md'
                : 'text-[#9BA5B7] hover:text-white'
            }`}
          >
            {t('fee.tabLitigation')}
          </button>
          <button
            onClick={() => setServiceType('corporate')}
            className={`px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              serviceType === 'corporate'
                ? 'bg-[#C5A880] text-[#0A0E17] font-semibold shadow-md'
                : 'text-[#9BA5B7] hover:text-white'
            }`}
          >
            {t('fee.tabCorporate')}
          </button>
          <button
            onClick={() => setServiceType('ip')}
            className={`px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              serviceType === 'ip'
                ? 'bg-[#C5A880] text-[#0A0E17] font-semibold shadow-md'
                : 'text-[#9BA5B7] hover:text-white'
            }`}
          >
            {t('fee.tabIp')}
          </button>
        </div>

        {/* Calculator Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 bg-[#101622] p-8 rounded-2xl border border-[#1E2638] space-y-6">
            {serviceType === 'conveyancing' && (
              <>
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-sm font-medium text-white">
                      Purchase / Property Valuation
                    </label>
                    <span className="text-lg font-mono text-[#DFBE82] font-semibold tabular-nums">
                      {formatKes(propertyValue)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2000000"
                    max="300000000"
                    step="1000000"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(Number(e.target.value))}
                    className="w-full h-2 bg-[#1A2234] rounded-lg appearance-none cursor-pointer accent-[#C5A880]"
                  />
                  <div className="flex justify-between text-xs text-[#6F7A8F] mt-1 font-mono">
                    <span>KES 2M</span>
                    <span>KES 150M</span>
                    <span>KES 300M+</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1C2436]">
                  <label className="text-sm font-medium text-white block mb-2">
                    Property Location &amp; Stamp Duty Tier
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsNairobiMunicipality(true)}
                      className={`p-3 text-left rounded-xl border text-xs transition-all ${
                        isNairobiMunicipality
                          ? 'border-[#C5A880] bg-[#C5A880]/10 text-white'
                          : 'border-[#20293D] text-[#8C98AE] hover:border-[#313E5C]'
                      }`}
                    >
                      <div className="font-semibold text-white">Nairobi / Urban Municipality</div>
                      <div className="text-[11px] text-[#C5A880] mt-0.5">4% Statutory Stamp Duty</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNairobiMunicipality(false)}
                      className={`p-3 text-left rounded-xl border text-xs transition-all ${
                        !isNairobiMunicipality
                          ? 'border-[#C5A880] bg-[#C5A880]/10 text-white'
                          : 'border-[#20293D] text-[#8C98AE] hover:border-[#313E5C]'
                      }`}
                    >
                      <div className="font-semibold text-white">Rural / Agricultural Land</div>
                      <div className="text-[11px] text-[#C5A880] mt-0.5">2% Statutory Stamp Duty</div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {serviceType === 'litigation' && (
              <>
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-sm font-medium text-white">
                      Subject Matter / Claim Valuation
                    </label>
                    <span className="text-lg font-mono text-[#DFBE82] font-semibold tabular-nums">
                      {formatKes(claimValue)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5000000"
                    max="500000000"
                    step="5000000"
                    value={claimValue}
                    onChange={(e) => setClaimValue(Number(e.target.value))}
                    className="w-full h-2 bg-[#1A2234] rounded-lg appearance-none cursor-pointer accent-[#C5A880]"
                  />
                  <div className="flex justify-between text-xs text-[#6F7A8F] mt-1 font-mono">
                    <span>KES 5M</span>
                    <span>KES 250M</span>
                    <span>KES 500M+</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1C2436]">
                  <label className="text-sm font-medium text-white block mb-2">
                    Judicial Forum / Jurisdiction
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setCourtLevel('high_court')}
                      className={`p-3 rounded-xl border text-xs text-left transition-all ${
                        courtLevel === 'high_court'
                          ? 'border-[#C5A880] bg-[#C5A880]/10 text-white'
                          : 'border-[#20293D] text-[#8C98AE]'
                      }`}
                    >
                      <div className="font-semibold text-white">High Court</div>
                      <div className="text-[10px] text-[#9BA5B7] mt-0.5">Commercial Division</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourtLevel('court_of_appeal')}
                      className={`p-3 rounded-xl border text-xs text-left transition-all ${
                        courtLevel === 'court_of_appeal'
                          ? 'border-[#C5A880] bg-[#C5A880]/10 text-white'
                          : 'border-[#20293D] text-[#8C98AE]'
                      }`}
                    >
                      <div className="font-semibold text-white">Court of Appeal</div>
                      <div className="text-[10px] text-[#9BA5B7] mt-0.5">Appellate Bench</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourtLevel('arbitration')}
                      className={`p-3 rounded-xl border text-xs text-left transition-all ${
                        courtLevel === 'arbitration'
                          ? 'border-[#C5A880] bg-[#C5A880]/10 text-white'
                          : 'border-[#20293D] text-[#8C98AE]'
                      }`}
                    >
                      <div className="font-semibold text-white">NCIA / LCIA</div>
                      <div className="text-[10px] text-[#9BA5B7] mt-0.5">Arbitral Tribunal</div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {serviceType === 'corporate' && (
              <div className="space-y-4">
                <label className="text-sm font-medium text-white block">
                  Select Corporate Retainer Tier
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div
                    onClick={() => setRetainerTier('growth')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      retainerTier === 'growth'
                        ? 'border-[#C5A880] bg-[#C5A880]/10 text-white'
                        : 'border-[#20293D] bg-[#121824] text-[#8C98AE]'
                    }`}
                  >
                    <div className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">Growth Tier</div>
                    <div className="text-lg font-mono text-white mt-1 tabular-nums">KES 250k<span className="text-xs text-[#8C98AE]">/mo</span></div>
                    <p className="text-xs text-[#9BA5B7] mt-2">Up to 20 hrs monthly counsel &amp; secretarial maintenance.</p>
                  </div>

                  <div
                    onClick={() => setRetainerTier('enterprise')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      retainerTier === 'enterprise'
                        ? 'border-[#C5A880] bg-[#C5A880]/10 text-white ring-1 ring-[#C5A880]'
                        : 'border-[#20293D] bg-[#121824] text-[#8C98AE]'
                    }`}
                  >
                    <div className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">Enterprise Tier</div>
                    <div className="text-lg font-mono text-white mt-1 tabular-nums">KES 600k<span className="text-xs text-[#8C98AE]">/mo</span></div>
                    <p className="text-xs text-[#9BA5B7] mt-2">50 hrs dedicated partner advisory, CBK/ODPC filings &amp; injunction standby.</p>
                  </div>

                  <div
                    onClick={() => setRetainerTier('transactional')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      retainerTier === 'transactional'
                        ? 'border-[#C5A880] bg-[#C5A880]/10 text-white'
                        : 'border-[#20293D] bg-[#121824] text-[#8C98AE]'
                    }`}
                  >
                    <div className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">M&amp;A Consortium</div>
                    <div className="text-lg font-mono text-white mt-1 tabular-nums">KES 1.5M<span className="text-xs text-[#8C98AE]">/mo</span></div>
                    <p className="text-xs text-[#9BA5B7] mt-2">High-stakes deal structuring, CAK antitrust, and sovereign concessions.</p>
                  </div>
                </div>
              </div>
            )}

            {serviceType === 'ip' && (
              <div className="space-y-4">
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-sm font-medium text-white">
                    Trademark Nice Classification Classes
                  </label>
                  <span className="text-lg font-mono text-[#DFBE82] font-semibold tabular-nums">
                    {ipClassCount} {ipClassCount === 1 ? 'Class' : 'Classes'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={ipClassCount}
                  onChange={(e) => setIpClassCount(Number(e.target.value))}
                  className="w-full h-2 bg-[#1A2234] rounded-lg appearance-none cursor-pointer accent-[#C5A880]"
                />
                <p className="text-xs text-[#8C98AE]">
                  Covers official Kenya Industrial Property Institute (KIPI) filing, advertisement gazette fees, search clearance, and certificate issuance.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-[#141B28] rounded-lg border border-[#20293E] text-xs text-[#8C98AE]">
              <Info className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span>
                All fee calculations strictly reflect statutory guidelines under the Advocates (Remuneration) Order. Final terms are formalized via an executed Chamber Letter of Engagement.
              </span>
            </div>
          </div>

          {/* Breakdown / Fee Note Card */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#131B2A] to-[#0D131F] p-8 rounded-2xl border border-[#C5A880]/30 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#20293E]">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">{t('fee.officialEstimate')}</span>
                <h3 className="text-lg font-cinzel text-white">{t('fee.itemizedNote')}</h3>
              </div>
              <ShieldCheck className="w-6 h-6 text-[#C5A880]" />
            </div>

            <div className="py-6 space-y-3.5 text-sm">
              {serviceType === 'conveyancing' && (
                <>
                  <div className="flex justify-between text-[#B2BDCE]">
                    <span>Advocate Professional Scale (ARO)</span>
                    <span className="font-mono text-white font-medium tabular-nums">{formatKes(convResult.advocateFee)}</span>
                  </div>
                  <div className="flex justify-between text-[#B2BDCE]">
                    <span>Kenya Revenue Authority Stamp Duty</span>
                    <span className="font-mono text-white font-medium tabular-nums">{formatKes(convResult.stampDuty)}</span>
                  </div>
                  <div className="flex justify-between text-[#B2BDCE]">
                    <span>VAT (16% on Professional Fees)</span>
                    <span className="font-mono text-white font-medium tabular-nums">{formatKes(convResult.vat)}</span>
                  </div>
                  <div className="flex justify-between text-[#B2BDCE]">
                    <span>ArdhiSasa Search &amp; Registration Disbursements</span>
                    <span className="font-mono text-white font-medium tabular-nums">{formatKes(convResult.disbursements)}</span>
                  </div>
                  <div className="pt-4 border-t border-[#20293E] flex justify-between items-baseline">
                    <span className="text-base font-semibold text-white">{t('fee.total')}</span>
                    <span className="text-2xl font-mono text-[#E4C999] font-bold tabular-nums">
                      {formatKes(convResult.total)}
                    </span>
                  </div>
                </>
              )}

              {serviceType === 'litigation' && (
                <>
                  <div className="flex justify-between text-[#B2BDCE]">
                    <span>Instruction Fee (Schedule 6 Minimum)</span>
                    <span className="font-mono text-white font-medium tabular-nums">{formatKes(litResult.instructionFee)}</span>
                  </div>
                  <div className="flex justify-between text-[#B2BDCE]">
                    <span>VAT (16% Statutory)</span>
                    <span className="font-mono text-white font-medium tabular-nums">{formatKes(litResult.vat)}</span>
                  </div>
                  <div className="text-xs text-[#8C98AE] pt-2">
                    *Excludes court registry filing fees, process service, and party-and-party costs order awards.
                  </div>
                  <div className="pt-4 border-t border-[#20293E] flex justify-between items-baseline">
                    <span className="text-base font-semibold text-white">Total Instruction Retainer</span>
                    <span className="text-2xl font-mono text-[#E4C999] font-bold tabular-nums">
                      {formatKes(litResult.total)}
                    </span>
                  </div>
                </>
              )}

              {serviceType === 'corporate' && (
                <>
                  <div className="flex justify-between text-[#B2BDCE]">
                    <span>Monthly Retainer Fee</span>
                    <span className="font-mono text-white font-medium tabular-nums">{formatKes(corpResult.monthlyRetainer)}</span>
                  </div>
                  <div className="flex justify-between text-[#B2BDCE]">
                    <span>VAT (16%)</span>
                    <span className="font-mono text-white font-medium tabular-nums">{formatKes(corpResult.vat)}</span>
                  </div>
                  <div className="p-3 bg-[#161F2E] rounded-lg text-xs text-[#A8B4C7]">
                    {corpResult.scope}
                  </div>
                  <div className="pt-4 border-t border-[#20293E] flex justify-between items-baseline">
                    <span className="text-base font-semibold text-white">Monthly Inclusive Retainer</span>
                    <span className="text-2xl font-mono text-[#E4C999] font-bold tabular-nums">
                      {formatKes(corpResult.monthlyRetainer + corpResult.vat)}
                    </span>
                  </div>
                </>
              )}

              {serviceType === 'ip' && (
                <>
                  <div className="flex justify-between text-[#B2BDCE]">
                    <span>KIPI Statutory Official Registry Fees</span>
                    <span className="font-mono text-white font-medium tabular-nums">{formatKes(ipResult.officialFees)}</span>
                  </div>
                  <div className="flex justify-between text-[#B2BDCE]">
                    <span>Advocate Trademark Prosecution</span>
                    <span className="font-mono text-white font-medium tabular-nums">{formatKes(ipResult.advocateFee)}</span>
                  </div>
                  <div className="flex justify-between text-[#B2BDCE]">
                    <span>VAT (16%)</span>
                    <span className="font-mono text-white font-medium tabular-nums">{formatKes(ipResult.vat)}</span>
                  </div>
                  <div className="pt-4 border-t border-[#20293E] flex justify-between items-baseline">
                    <span className="text-base font-semibold text-white">Estimated Filing Total</span>
                    <span className="text-2xl font-mono text-[#E4C999] font-bold tabular-nums">
                      {formatKes(ipResult.total)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => onOpenConsultation(
                serviceType === 'conveyancing' ? 'Real Estate, Infrastructure & Conveyancing' :
                serviceType === 'litigation' ? 'Dispute Resolution & International Arbitration' :
                serviceType === 'corporate' ? 'Corporate, Banking & Structured Finance' : 'Technology, IP & Data Protection',
                serviceType === 'conveyancing' ? formatKes(convResult.total) :
                serviceType === 'litigation' ? formatKes(litResult.total) :
                serviceType === 'corporate' ? `${formatKes(corpResult.monthlyRetainer + corpResult.vat)} / mo` : formatKes(ipResult.total)
              )}
              className="w-full mt-6 py-3.5 px-6 bg-gradient-to-r from-[#C5A880] to-[#DFBE82] text-[#0A0E17] font-semibold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#C5A880]/20"
            >
              <span>Instruct Counsel on This Estimate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
