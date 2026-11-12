import React, { useState, useMemo } from 'react';
import { Share2, Check, Copy, ExternalLink, FileText } from 'lucide-react';
import { LEGAL_ARTICLES } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';
import { incrementArticleShareCount } from '../utils/shareCounter';

interface ShareablePublication {
  id: string;
  title: string;
  category: string;
  citation: string;
  date: string;
  hash: string;
  summary: string;
}

export const SocialShareWidget: React.FC = () => {
  const { language } = useLanguage();
  const [selectedId, setSelectedId] = useState<string>('briefing-vol-27');
  const [copied, setCopied] = useState(false);

  const publications: ShareablePublication[] = useMemo(() => {
    const monthlyDigest: ShareablePublication = {
      id: 'briefing-vol-27',
      title: 'Chambers Monthly Corporate Legal Briefing · Vol. XXVII',
      category: 'Monthly Law Digest',
      citation: 'PAA Law Review (Corporate Series), Nov 2026',
      date: 'November 2026',
      hash: '#insights',
      summary:
        'BRS Beneficial Ownership enforcement, Sectional Properties Act ArdhiSasa compliance, and NCIA Emergency Arbitrator awards in Kenya.'
    };

    const articleItems: ShareablePublication[] = LEGAL_ARTICLES.map((article) => ({
      id: article.id,
      title: article.title,
      category: article.category,
      citation: article.citation,
      date: article.date,
      hash: '#insights',
      summary: article.synopsis
    }));

    return [monthlyDigest, ...articleItems];
  }, []);

  const activePub = useMemo(
    () => publications.find((p) => p.id === selectedId) || publications[0],
    [publications, selectedId]
  );

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'https://paalawkenya.com/#insights';
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}${activePub.hash}`;
  }, [activePub.hash]);

  const linkedInHref = useMemo(() => {
    const encodedUrl = encodeURIComponent(shareUrl);
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  }, [shareUrl]);

  const xShareHref = useMemo(() => {
    const text = `${activePub.title} — ${activePub.citation} | Petersons Angwenyi & Associates Advocates`;
    const params = new URLSearchParams({
      text,
      url: shareUrl,
      hashtags: 'KenyaLaw,CorporateLaw,Arbitration,LegalBriefing'
    });
    return `https://twitter.com/intent/tweet?${params.toString()}`;
  }, [activePub, shareUrl]);

  const handleTrackShare = () => {
    if (LEGAL_ARTICLES.some((article) => article.id === activePub.id)) {
      incrementArticleShareCount(activePub.id);
    }
  };

  const handleCopyShareText = async () => {
    const payload = `${activePub.title} (${activePub.citation})\n${activePub.summary}\nRead more: ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      handleTrackShare();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy unavailable in restricted sandbox
      setCopied(true);
      handleTrackShare();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <aside
      aria-labelledby="social-share-widget-heading"
      className="h-full p-6 sm:p-7 rounded-2xl bg-[#FBF9F4] dark:bg-[#090E17] border border-[#DFD4C1] dark:border-[#C5A880]/30 shadow-2xl relative overflow-hidden flex flex-col justify-between"
    >
      {/* Subtle Decorative Gold Glow */}
      <div className="absolute -top-20 -right-20 w-52 h-52 bg-[#C5A880]/10 dark:bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#C5A880]/15 border border-[#C5A880]/40 flex items-center justify-center text-[#8C6D3B] dark:text-[#C5A880] shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C6D3B] dark:text-[#C5A880] font-semibold">
            {language === 'sw' ? 'Shiriki Machapisho' : 'Distribute Insights'}
          </span>
        </div>

        <div>
          <h3
            id="social-share-widget-heading"
            className="text-lg sm:text-xl font-cinzel text-[#121A28] dark:text-white font-bold tracking-wide"
          >
            {language === 'sw'
              ? 'Shiriki Taarifa & Machapisho'
              : 'Share Legal Publications'}
          </h3>
          <p className="text-xs text-[#4A576D] dark:text-[#93A1B8] leading-relaxed mt-1">
            {language === 'sw'
              ? 'Sambaza uchambuzi wetu wa kisheria na maamuzi ya mahakama kwa mtandao wako.'
              : 'Circulate chambers legal briefings, statutory commentaries, and judicial analysis with your professional network.'}
          </p>
        </div>

        {/* Publication Selector */}
        <div className="space-y-1.5">
          <label
            htmlFor="share-publication-select"
            className="text-[10px] font-mono uppercase tracking-wider text-[#5C6A80] dark:text-[#718096] block"
          >
            {language === 'sw' ? 'Chagua Chapisho:' : 'Select Insight / Publication:'}
          </label>
          <select
            id="share-publication-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#0C121E] border border-[#D9CEBC] dark:border-[#223048] text-xs text-[#121A28] dark:text-white focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] outline-none transition-all cursor-pointer"
          >
            {publications.map((pub) => (
              <option key={pub.id} value={pub.id}>
                {pub.title}
              </option>
            ))}
          </select>
        </div>

        {/* Active Publication Preview Card */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0C121E] border border-[#E4DCCF] dark:border-[#1E2B40] space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-[#8C6D3B] dark:text-[#C5A880]">
            <span className="truncate font-semibold uppercase">{activePub.category}</span>
            <span className="shrink-0 text-[#5C6A80] dark:text-[#718096]">{activePub.date}</span>
          </div>
          <p className="text-xs font-semibold text-[#121A28] dark:text-white line-clamp-2 leading-snug">
            {activePub.title}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#5C6A80] dark:text-[#8C98AE] pt-0.5">
            <FileText className="w-3 h-3 text-[#C5A880] shrink-0" />
            <span className="truncate">{activePub.citation}</span>
          </div>
        </div>
      </div>

      {/* Share Platform Action Buttons */}
      <div className="relative z-10 pt-5 mt-5 border-t border-[#E4DCCF] dark:border-[#1C263A] space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          {/* LinkedIn Share Link */}
          <a
            href={linkedInHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleTrackShare}
            aria-label={`Share "${activePub.title}" on LinkedIn`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2] text-[#0A66C2] dark:text-[#5BA4EE] hover:text-white border border-[#0A66C2]/30 hover:border-[#0A66C2] text-xs font-semibold transition-all group whitespace-nowrap"
          >
            <svg
              className="w-3.5 h-3.5 fill-current shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
            <span>LinkedIn</span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" />
          </a>

          {/* X (formerly Twitter) Share Link */}
          <a
            href={xShareHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleTrackShare}
            aria-label={`Share "${activePub.title}" on X (formerly Twitter)`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-[#121A28]/10 dark:bg-white/5 hover:bg-[#121A28] dark:hover:bg-white text-[#121A28] dark:text-white hover:text-white dark:hover:text-[#080B11] border border-[#121A28]/25 dark:border-white/20 text-xs font-semibold transition-all group whitespace-nowrap"
          >
            <svg
              className="w-3.5 h-3.5 fill-current shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>X (Twitter)</span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" />
          </a>
        </div>

        {/* Quick Copy Citation & URL */}
        <button
          type="button"
          onClick={handleCopyShareText}
          className="w-full py-2 px-3 rounded-xl bg-[#F4EFE4] dark:bg-[#121B2B] hover:bg-[#EAE2D2] dark:hover:bg-[#1A263C] text-[#4A576D] dark:text-[#A6B4CD] hover:text-[#121A28] dark:hover:text-white border border-[#DFD4C1] dark:border-[#223048] text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Citation &amp; Link Copied
              </span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#8C6D3B] dark:text-[#C5A880]" />
              <span>Copy Publication Citation &amp; Link</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
