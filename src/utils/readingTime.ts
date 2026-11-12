import { LegalArticle, CaseBrief } from '../data/firmData';

export interface ReadingTimeResult {
  minutes: number;
  wordCount: number;
  label: string;
  detailedLabel: string;
  depthTier: 'Executive Brief' | 'Standard Advisory' | 'Comprehensive Dossier';
  depthTierSw: string;
  depthColor: string;
  depthBg: string;
  readingPaceNote: string;
}

/**
 * Standard judicial and professional legal reading speed benchmark:
 * 200 words per minute (factoring statutory citations, case citations, and Latin maxims).
 */
export const DEFAULT_WORDS_PER_MINUTE = 200;

/**
 * Counts words accurately across string or array of strings, stripping markdown / code characters.
 */
export function countWords(content: string | string[] | (string | undefined)[]): number {
  if (!content) return 0;
  
  const text = Array.isArray(content)
    ? content.filter(Boolean).join(' ')
    : content;

  if (!text || typeof text !== 'string') return 0;

  // Remove HTML tags if present, normalize multiple spaces, linebreaks
  const cleaned = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF'-]/g, ' ')
    .trim();

  if (!cleaned) return 0;
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

/**
 * Calculates dynamic reading time and content depth classification
 */
export function calculateReadingTime(
  content: string | string[] | (string | undefined)[],
  wordsPerMinute = DEFAULT_WORDS_PER_MINUTE
): ReadingTimeResult {
  const wordCount = countWords(content);
  // Guarantee at least 1 minute read time if there is any text
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

  // Determine content depth classification based on word count and analysis depth
  let depthTier: 'Executive Brief' | 'Standard Advisory' | 'Comprehensive Dossier';
  let depthTierSw: string;
  let depthColor: string;
  let depthBg: string;

  if (wordCount < 400) {
    depthTier = 'Executive Brief';
    depthTierSw = 'Muhtasari wa Kiutendaji';
    depthColor = 'text-amber-800 dark:text-amber-300 border-amber-500/40';
    depthBg = 'bg-amber-500/10';
  } else if (wordCount <= 850) {
    depthTier = 'Standard Advisory';
    depthTierSw = 'Ushauri wa Kawaida';
    depthColor = 'text-[#7A5B26] dark:text-[#DFBE82] border-[#C5A880]/50';
    depthBg = 'bg-[#C5A880]/15 dark:bg-[#C5A880]/10';
  } else {
    depthTier = 'Comprehensive Dossier';
    depthTierSw = 'Uchambuzi wa Kina wa Sheria';
    depthColor = 'text-emerald-800 dark:text-emerald-300 border-emerald-500/40';
    depthBg = 'bg-emerald-500/10';
  }

  const label = `${minutes} min read`;
  const detailedLabel = `${minutes} min read (${wordCount.toLocaleString()} words)`;
  const readingPaceNote = `@ ${wordsPerMinute} wpm legal benchmark`;

  return {
    minutes,
    wordCount,
    label,
    detailedLabel,
    depthTier,
    depthTierSw,
    depthColor,
    depthBg,
    readingPaceNote
  };
}

/**
 * Calculates dynamic reading metrics specifically for a Legal Article
 */
export function calculateArticleReadingTime(article: LegalArticle): ReadingTimeResult {
  const fullText = [
    article.title,
    article.category,
    article.synopsis,
    ...(article.content || []),
    article.citation,
    // Factor standard legal disclaimer attached to article readings
    "Legal Disclaimer: This briefing is published for informational purposes under the auspices of Petersons Angwenyi & Associates Advocates and does not constitute formal legal counsel."
  ];

  return calculateReadingTime(fullText);
}

/**
 * Calculates dynamic reading metrics for a Case Brief
 */
export function calculateCaseBriefReadingTime(
  brief: CaseBrief,
  additionalClausesText?: string[]
): ReadingTimeResult {
  const content = [
    brief.matterName,
    brief.forum,
    brief.clientCategory,
    brief.summary,
    brief.impact,
    brief.value,
    ...(additionalClausesText || [])
  ];

  return calculateReadingTime(content);
}
