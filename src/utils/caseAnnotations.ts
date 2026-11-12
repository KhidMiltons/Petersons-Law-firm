export interface PrecedentAnnotation {
  id: string;
  briefId: string;
  clauseNumber: number;
  type: 'highlight' | 'sticky-note';
  color: 'amber' | 'emerald' | 'rose' | 'sky';
  title?: string;
  noteText?: string;
  highlightedText?: string;
  author: {
    name: string;
    role: string;
    affiliation: 'Senior Counsel' | 'Partner' | 'Instructing Client' | 'Associate';
  };
  timestamp: string;
  isResolved?: boolean;
}

export const CASE_ANNOTATIONS_UPDATED_EVENT = 'paa:case-annotations-updated';

export function getInitialAnnotations(briefId: string): PrecedentAnnotation[] {
  return [
    {
      id: `ann-${briefId}-1`,
      briefId,
      clauseNumber: 4,
      type: 'sticky-note',
      color: 'amber',
      title: 'Senior Counsel Strategic Ratio',
      noteText:
        'Landmark judicial holding: Lady Justice Wambui reaffirmed that contractual cure notices are mandatory conditions precedent before calling in bank guarantees.',
      author: {
        name: 'Milton Angwenyi, SC',
        role: 'Senior Counsel & Chambers Head',
        affiliation: 'Senior Counsel',
      },
      timestamp: 'Today at 09:30 AM',
      isResolved: false,
    },
    {
      id: `ann-${briefId}-2`,
      briefId,
      clauseNumber: 2,
      type: 'highlight',
      color: 'emerald',
      title: 'Electronic Evidence Admissibility',
      highlightedText: 'cross-border commercial undertakings, sovereign guarantees',
      noteText:
        'All electronic telemetry and logs were admitted under Section 106B without objection.',
      author: {
        name: 'David Otieno',
        role: 'Senior Associate (Dispute Resolution)',
        affiliation: 'Partner',
      },
      timestamp: 'Yesterday at 15:45',
      isResolved: false,
    },
    {
      id: `ann-${briefId}-3`,
      briefId,
      clauseNumber: 5,
      type: 'sticky-note',
      color: 'rose',
      title: 'Client Action Item: Costs Taxation',
      noteText:
        'Prepare party-and-party bill of costs under Schedule VI. Commercial quantum entitles chambers to maximum instruction fees.',
      author: {
        name: 'Sharon Wanjiku Mutua',
        role: 'Senior Associate',
        affiliation: 'Associate',
      },
      timestamp: '02 Nov 2026',
      isResolved: true,
    },
  ];
}

export function getAnnotationsForBrief(briefId: string): PrecedentAnnotation[] {
  if (typeof window === 'undefined') {
    return getInitialAnnotations(briefId);
  }
  const storageKey = `paa_case_brief_annotations_${briefId}`;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as PrecedentAnnotation[];
      }
    }
  } catch {
    // Fallback to initial annotations
  }
  return getInitialAnnotations(briefId);
}

export function saveAnnotationsForBrief(
  briefId: string,
  annotations: PrecedentAnnotation[]
): void {
  if (typeof window === 'undefined') return;
  const storageKey = `paa_case_brief_annotations_${briefId}`;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(annotations));
  } catch {
    // Ignore storage write errors
  }

  window.dispatchEvent(
    new CustomEvent<{ briefId: string; annotations: PrecedentAnnotation[] }>(
      CASE_ANNOTATIONS_UPDATED_EVENT,
      {
        detail: { briefId, annotations },
      }
    )
  );
}
