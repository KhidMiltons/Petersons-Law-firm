import { LEGAL_ARTICLES } from '../data/firmData';

const SHARE_COUNTS_STORAGE_KEY = 'paa_insight_share_counts_v1';
export const ARTICLE_SHARED_EVENT = 'paa:article-shared';

export function getInitialShareCounts(): Record<string, number> {
  const baseline: Record<string, number> = {};
  for (const article of LEGAL_ARTICLES) {
    baseline[article.id] = article.shareCount;
  }

  if (typeof window === 'undefined') {
    return baseline;
  }

  try {
    const raw = window.localStorage.getItem(SHARE_COUNTS_STORAGE_KEY);
    if (!raw) return baseline;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const article of LEGAL_ARTICLES) {
      const saved = parsed[article.id];
      if (typeof saved === 'number' && Number.isFinite(saved) && saved >= article.shareCount) {
        baseline[article.id] = saved;
      }
    }
  } catch {
    // Ignore storage read errors in restricted environments
  }

  return baseline;
}

export function incrementArticleShareCount(articleId: string): Record<string, number> {
  const current = getInitialShareCounts();
  if (!(articleId in current)) {
    return current;
  }

  const next: Record<string, number> = {
    ...current,
    [articleId]: (current[articleId] ?? 0) + 1,
  };

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(SHARE_COUNTS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage write errors
    }

    window.dispatchEvent(
      new CustomEvent<{ articleId: string; counts: Record<string, number> }>(ARTICLE_SHARED_EVENT, {
        detail: { articleId, counts: next },
      })
    );
  }

  return next;
}
