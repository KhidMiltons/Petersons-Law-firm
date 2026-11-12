import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquareQuote, Edit3, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface ClientExperienceSurveyEntry {
  id: string;
  bookingReference: string;
  advocateName: string;
  practiceArea: string;
  clientName?: string;
  rating: number;
  feedback: string;
  highlights: string[];
  submittedAt: string;
}

export const CLIENT_SURVEYS_STORAGE_KEY = 'paa_client_experience_surveys';

export function getSavedClientSurveys(): Record<string, ClientExperienceSurveyEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CLIENT_SURVEYS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveClientSurvey(entry: ClientExperienceSurveyEntry): Record<string, ClientExperienceSurveyEntry> {
  const existing = getSavedClientSurveys();
  const next = {
    ...existing,
    [entry.bookingReference]: entry,
  };
  try {
    localStorage.setItem(CLIENT_SURVEYS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota errors cleanly
  }
  return next;
}

const EXPERIENCE_ASPECTS = [
  { id: 'scheduling', en: 'Scheduling Clarity', sw: 'Uwazi wa Ratiba' },
  { id: 'conflict-clearance', en: 'Conflict Clearance Speed', sw: 'Kasi ya Ukaguzi wa Migongano' },
  { id: 'counsel-match', en: 'Counsel Expertise Match', sw: 'Ulinganifu wa Wakili' },
  { id: 'confidentiality', en: 'Privileged Discretion', sw: 'Usiri wa Kihifadhi' },
];

interface ClientExperienceSurveyProps {
  bookingReference: string;
  advocateName: string;
  practiceArea: string;
  clientName?: string;
  onSubmitted?: (entry: ClientExperienceSurveyEntry) => void;
}

export const ClientExperienceSurvey: React.FC<ClientExperienceSurveyProps> = ({
  bookingReference,
  advocateName,
  practiceArea,
  clientName,
  onSubmitted,
}) => {
  const { language, t } = useLanguage();

  const existingEntry = getSavedClientSurveys()[bookingReference] || null;

  const [rating, setRating] = useState<number>(existingEntry?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(existingEntry?.feedback ?? '');
  const [selectedAspects, setSelectedAspects] = useState<string[]>(
    existingEntry?.highlights ?? []
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedEntry, setSubmittedEntry] = useState<ClientExperienceSurveyEntry | null>(
    existingEntry
  );
  const [isEditing, setIsEditing] = useState<boolean>(!existingEntry);

  const activeStarValue = hoverRating || rating;

  const getRatingDescriptor = (stars: number) => {
    switch (stars) {
      case 1:
        return t('survey.rating1');
      case 2:
        return t('survey.rating2');
      case 3:
        return t('survey.rating3');
      case 4:
        return t('survey.rating4');
      case 5:
        return t('survey.rating5');
      default:
        return t('survey.ratingPrompt');
    }
  };

  const toggleAspect = (aspectLabel: string) => {
    setSelectedAspects((prev) =>
      prev.includes(aspectLabel)
        ? prev.filter((item) => item !== aspectLabel)
        : [...prev, aspectLabel]
    );
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setValidationError(t('survey.ratingRequired'));
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    window.setTimeout(() => {
      const entry: ClientExperienceSurveyEntry = {
        id: submittedEntry?.id || `survey-${Date.now()}`,
        bookingReference,
        advocateName,
        practiceArea,
        clientName,
        rating,
        feedback: feedback.trim(),
        highlights: selectedAspects,
        submittedAt: new Date().toLocaleString('en-KE', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      };

      saveClientSurvey(entry);
      setSubmittedEntry(entry);
      setIsSubmitting(false);
      setIsEditing(false);
      if (onSubmitted) {
        onSubmitted(entry);
      }
    }, 320);
  };

  if (submittedEntry && !isEditing) {
    return (
      <div className="max-w-lg mx-auto p-5 bg-[#F6F1E6] dark:bg-[#0F1727] border border-[#DFD4C1] dark:border-[#C5A880]/40 rounded-xl text-left space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-semibold text-[#121A28] dark:text-white font-cinzel">
                {t('survey.thankYouTitle')}
              </h5>
              <p className="text-[11px] text-[#5C6A80] dark:text-[#8C98AE]">
                {t('survey.thankYouDesc')} · <span className="font-mono">{submittedEntry.bookingReference}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#8C6B32] dark:text-[#C5A880] hover:bg-[#E8E0D1] dark:hover:bg-[#172235] transition-colors cursor-pointer shrink-0"
          >
            <Edit3 className="w-3 h-3" />
            <span>{t('survey.edit')}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-1" aria-label={`Rated ${submittedEntry.rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= submittedEntry.rating
                    ? 'text-[#C5A880] fill-[#C5A880]'
                    : 'text-[#C8BFA8] dark:text-[#2D3B55]'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-mono font-semibold text-[#121A28] dark:text-white tabular-nums">
            {submittedEntry.rating}.0 / 5.0
          </span>
          <span className="text-[#9AA5B8] dark:text-[#4C5C78]" aria-hidden="true">
            ·
          </span>
          <span className="text-xs text-[#8C6B32] dark:text-[#E4C999] font-medium">
            {getRatingDescriptor(submittedEntry.rating)}
          </span>
        </div>

        {submittedEntry.highlights.length > 0 && (
          <div className="text-[11px] text-[#4A576D] dark:text-[#A6B4CD]">
            <span className="font-semibold text-[#121A28] dark:text-white">
              {t('survey.notedStrengths')}:{' '}
            </span>
            {submittedEntry.highlights.join(' · ')}
          </div>
        )}

        {submittedEntry.feedback && (
          <blockquote className="p-3 rounded-lg bg-white dark:bg-[#131C2E] border border-[#E4DCCF] dark:border-[#22304A] text-xs text-[#324056] dark:text-[#CBD5E1] italic leading-relaxed">
            “{submittedEntry.feedback}”
          </blockquote>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSurveySubmit}
      className="max-w-lg mx-auto p-5 bg-[#F6F1E6] dark:bg-[#0F1727] border border-[#DFD4C1] dark:border-[#C5A880]/35 rounded-xl text-left space-y-4"
      aria-labelledby="client-experience-survey-heading"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#E4DCCF] dark:border-[#1E2A40] pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#8C6B32] dark:text-[#C5A880] font-semibold">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>{t('survey.kicker')}</span>
          </div>
          <h5
            id="client-experience-survey-heading"
            className="text-sm font-cinzel font-semibold text-[#121A28] dark:text-white mt-0.5"
          >
            {t('survey.title')}
          </h5>
          <p className="text-[11px] text-[#5C6A80] dark:text-[#9BA5B7] mt-0.5">
            {t('survey.subtitle')}
          </p>
        </div>

        <span className="text-[11px] font-mono text-[#5C6A80] dark:text-[#8C98AE] tabular-nums shrink-0">
          {bookingReference}
        </span>
      </div>

      {/* Star Rating Control */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-[#121A28] dark:text-[#CBD5E1]">
          {t('survey.rateLabel')} *
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="radiogroup"
            aria-label={t('survey.rateLabel')}
            className="inline-flex items-center gap-1 bg-white dark:bg-[#131C2E] border border-[#E4DCCF] dark:border-[#23314B] rounded-xl px-2 py-1"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((starValue) => {
              const isFilled = starValue <= activeStarValue;
              return (
                <button
                  key={starValue}
                  type="button"
                  role="radio"
                  aria-checked={rating === starValue}
                  aria-label={`${starValue} ${starValue === 1 ? 'star' : 'stars'}`}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onFocus={() => setHoverRating(starValue)}
                  onBlur={() => setHoverRating(0)}
                  onClick={() => {
                    setRating(starValue);
                    setValidationError(null);
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg transition-transform duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 transition-colors duration-150 ${
                      isFilled
                        ? 'text-[#C5A880] fill-[#C5A880]'
                        : 'text-[#C8BFA8] dark:text-[#3A4A66] hover:text-[#C5A880]/70'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="text-xs">
            <span
              className={`font-medium ${
                activeStarValue > 0
                  ? 'text-[#8C6B32] dark:text-[#E4C999]'
                  : 'text-[#5C6A80] dark:text-[#8C98AE]'
              }`}
            >
              {activeStarValue > 0 && (
                <span className="font-mono font-semibold tabular-nums mr-1.5">
                  {activeStarValue}/5 ·
                </span>
              )}
              {getRatingDescriptor(activeStarValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Experience Highlights */}
      <div className="space-y-1.5">
        <span className="block text-[11px] font-medium text-[#4A576D] dark:text-[#9BA5B7]">
          {t('survey.aspectsLabel')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {EXPERIENCE_ASPECTS.map((aspect) => {
            const label = language === 'sw' ? aspect.sw : aspect.en;
            const isSelected = selectedAspects.includes(label);
            return (
              <button
                key={aspect.id}
                type="button"
                onClick={() => toggleAspect(label)}
                aria-pressed={isSelected}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#C5A880] text-[#0A0E17] border-[#C5A880] font-semibold'
                    : 'bg-white dark:bg-[#131C2E] text-[#4A576D] dark:text-[#9BA5B7] border-[#E4DCCF] dark:border-[#23314B] hover:border-[#C5A880]/60 hover:text-[#121A28] dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Feedback Area */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="client-survey-feedback"
            className="block text-xs font-medium text-[#121A28] dark:text-[#CBD5E1]"
          >
            {t('survey.feedbackLabel')}
          </label>
          <span className="text-[10px] font-mono text-[#6F7A8F] dark:text-[#78869E] tabular-nums">
            {feedback.length}/600
          </span>
        </div>

        <textarea
          id="client-survey-feedback"
          rows={3}
          maxLength={600}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={t('survey.feedbackPlaceholder')}
          className="w-full bg-white dark:bg-[#131C2E] border border-[#E4DCCF] dark:border-[#23314B] rounded-lg p-3 text-xs text-[#121A28] dark:text-white placeholder-[#7A869B] dark:placeholder-[#64748B] focus:outline-none focus:border-[#C5A880] transition-colors leading-relaxed resize-y"
        />
      </div>

      {validationError && (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium" role="alert">
          {validationError}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-[11px] text-[#5C6A80] dark:text-[#8C98AE]">
          {t('survey.confidentialNote')}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {submittedEntry && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-2 rounded-lg text-xs font-medium text-[#5C6A80] dark:text-[#94A3B8] hover:text-[#121A28] dark:hover:text-white transition-colors cursor-pointer"
            >
              {t('consult.cancel')}
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C5A880] text-[#0A0E17] font-semibold text-xs hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? t('survey.submitting') : t('survey.submit')}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
