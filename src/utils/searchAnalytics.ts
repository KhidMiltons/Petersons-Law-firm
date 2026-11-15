import { Language } from '../context/LanguageContext';

export type SearchQuerySource =
  | 'typed'
  | 'voice'
  | 'quick-topic'
  | 'result-select'
  | 'consultation-cta';

export interface SearchQueryAnalyticsPayload {
  query: string;
  category: string;
  resultCount: number;
  source: SearchQuerySource;
  language: Language;
  selectedItemId?: string;
  selectedItemTitle?: string;
  selectedItemType?: 'practice' | 'case' | 'faq' | 'document';
}

export interface SearchQueryAnalyticsEvent extends SearchQueryAnalyticsPayload {
  id: string;
  normalizedTopic: string;
  timestamp: string;
}

export interface TopicFrequencyEntry {
  topic: string;
  query: string;
  count: number;
  lastSearchedAt: string;
}

const EVENTS_STORAGE_KEY = 'paa_search_analytics_events_v1';
const TOPIC_COUNTS_STORAGE_KEY = 'paa_search_topic_counts_v1';
export const SEARCH_ANALYTICS_UPDATED_EVENT = 'paa:search-analytics-updated';

const BASELINE_TOPICS: TopicFrequencyEntry[] = [
  { topic: 'Arbitration', query: 'Arbitration', count: 14, lastSearchedAt: '' },
  { topic: 'ArdhiSasa', query: 'ArdhiSasa', count: 11, lastSearchedAt: '' },
  { topic: 'Beneficial Ownership', query: 'Beneficial Ownership', count: 9, lastSearchedAt: '' },
  { topic: 'Supreme Court', query: 'Supreme Court', count: 8, lastSearchedAt: '' },
  { topic: 'Section 134 Privilege', query: 'Section 134', count: 7, lastSearchedAt: '' },
  { topic: 'ARO Legal Fees', query: 'ARO', count: 6, lastSearchedAt: '' },
  { topic: 'Injunctions', query: 'Injunction', count: 5, lastSearchedAt: '' },
];

const TOPIC_NORMALIZERS: Array<{ pattern: RegExp; topic: string; query: string }> = [
  { pattern: /\b(arbitrat|ncia|lcia|usuluhishi)\b/i, topic: 'Arbitration', query: 'Arbitration' },
  { pattern: /\b(ardhisasa|land|sectional|conveyanc|title|ardhi)\b/i, topic: 'ArdhiSasa', query: 'ArdhiSasa' },
  { pattern: /\b(beneficial|ownership|companies\s*act|director)\b/i, topic: 'Beneficial Ownership', query: 'Beneficial Ownership' },
  { pattern: /\b(supreme\s*court|appellate|court\s*of\s*appeal|mahakama)\b/i, topic: 'Supreme Court', query: 'Supreme Court' },
  { pattern: /\b(134|privilege|confidential|evidence\s*act|usiri)\b/i, topic: 'Section 134 Privilege', query: 'Section 134' },
  { pattern: /\b(aro|remuneration|fee|retainer|ada)\b/i, topic: 'ARO Legal Fees', query: 'ARO' },
  { pattern: /\b(injunct|stay\s*of\s*execution|conservatory|zuio)\b/i, topic: 'Injunctions', query: 'Injunction' },
  { pattern: /\b(tax|kra|vat|revenue|duty)\b/i, topic: 'Tax & Revenue', query: 'Tax' },
  { pattern: /\b(insolvenc|receivership|administrat|bank|kcb|ufilisi)\b/i, topic: 'Banking & Insolvency', query: 'Insolvency' },
  { pattern: /\b(energy|ppp|concession|sovereign|infrastructure)\b/i, topic: 'Energy & Infrastructure', query: 'Energy' },
];

function toTitleCase(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function normalizeLegalTopic(rawQuery: string): { topic: string; query: string } {
  const cleaned = rawQuery.trim();
  for (const rule of TOPIC_NORMALIZERS) {
    if (rule.pattern.test(cleaned)) {
      return { topic: rule.topic, query: rule.query };
    }
  }
  const formatted = toTitleCase(cleaned);
  return { topic: formatted, query: cleaned };
}

function readStoredTopicCounts(): Record<string, TopicFrequencyEntry> {
  const map: Record<string, TopicFrequencyEntry> = {};
  for (const base of BASELINE_TOPICS) {
    map[base.topic] = { ...base };
  }

  if (typeof window === 'undefined') {
    return map;
  }

  try {
    const raw = window.localStorage.getItem(TOPIC_COUNTS_STORAGE_KEY);
    if (!raw) return map;
    const parsed = JSON.parse(raw) as Record<string, TopicFrequencyEntry>;
    for (const [key, entry] of Object.entries(parsed)) {
      if (entry && typeof entry.count === 'number' && typeof entry.query === 'string') {
        map[key] = entry;
      }
    }
  } catch {
    // Ignore storage read errors
  }

  return map;
}

function readStoredEvents(): SearchQueryAnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getTopLegalTopics(limit = 7): TopicFrequencyEntry[] {
  const countsMap = readStoredTopicCounts();
  return Object.values(countsMap)
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.lastSearchedAt.localeCompare(a.lastSearchedAt);
    })
    .slice(0, limit);
}

export function getSearchAnalyticsLog(): SearchQueryAnalyticsEvent[] {
  return readStoredEvents();
}

/**
 * Mock analytics service for Chambers legal index queries.
 * Normalizes query terms into legal topic buckets, records event metadata,
 * and persists frequency tallies to highlight common legal topics.
 */
export const searchAnalyticsService = {
  async logSearchQuery(
    payload: SearchQueryAnalyticsPayload
  ): Promise<SearchQueryAnalyticsEvent | null> {
    const cleanedQuery = payload.query.trim();
    if (cleanedQuery.length < 2 && !payload.selectedItemId) {
      return null;
    }

    const topicSource = cleanedQuery || payload.selectedItemTitle || '';
    if (!topicSource) return null;

    const normalized = normalizeLegalTopic(topicSource);
    const timestamp = new Date().toISOString();

    const event: SearchQueryAnalyticsEvent = {
      ...payload,
      query: cleanedQuery || topicSource,
      normalizedTopic: normalized.topic,
      id: `sq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp,
    };

    // Persist asynchronously as a non-blocking mock analytics dispatch
    await Promise.resolve();

    if (typeof window !== 'undefined') {
      try {
        const existingEvents = readStoredEvents();
        const nextEvents = [event, ...existingEvents].slice(0, 100);
        window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(nextEvents));

        const countsMap = readStoredTopicCounts();
        const currentEntry = countsMap[normalized.topic];
        countsMap[normalized.topic] = {
          topic: normalized.topic,
          query: currentEntry?.query || normalized.query,
          count: (currentEntry?.count ?? 0) + 1,
          lastSearchedAt: timestamp,
        };
        window.localStorage.setItem(TOPIC_COUNTS_STORAGE_KEY, JSON.stringify(countsMap));

        window.dispatchEvent(
          new CustomEvent<SearchQueryAnalyticsEvent>(SEARCH_ANALYTICS_UPDATED_EVENT, {
            detail: event,
          })
        );
      } catch {
        // Ignore storage write errors in restricted browsing contexts
      }
    }

    return event;
  },
};
