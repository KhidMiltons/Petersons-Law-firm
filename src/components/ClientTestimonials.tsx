import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Award, ShieldCheck, Quote, ArrowRight, Building, CheckCircle2 } from 'lucide-react';
import { CLIENT_TESTIMONIALS, FIRM_MILESTONES, ClientTestimonial } from '../data/firmData';
import { useLanguage } from '../context/LanguageContext';

interface ClientTestimonialsProps {
  onOpenConsultation: (practice?: string, estimate?: string) => void;
}

export const ClientTestimonials: React.FC<ClientTestimonialsProps> = ({ onOpenConsultation }) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const testimonialsCount = CLIENT_TESTIMONIALS.length;

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonialsCount);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonialsCount) % testimonialsCount);
  };

  // Auto-advance every 6.5 seconds when not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextTestimonial();
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused, testimonialsCount]);

  const activeTestimonial: ClientTestimonial = CLIENT_TESTIMONIALS[currentIndex];

  return (
    <section
      id="testimonials"
      className="py-24 bg-[#080B11] border-b border-[#1E2536] relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] mb-3 font-semibold">
            <span>{t('testimonials.kicker')}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-cinzel text-white tracking-tight">
            {t('testimonials.title')}
          </h2>
          <p className="mt-4 text-[#9BA5B7] leading-relaxed">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Full-Width Split Carousel & Milestone Wall */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Wing (7 Cols): Dynamic Carousel */}
          <div
            className="lg:col-span-7 bg-[#0E1522] rounded-3xl border border-[#1E293E] p-8 md:p-12 flex flex-col justify-between relative shadow-xl hover:border-[#C5A880]/30 transition-all duration-300"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Top Row: Context & Quote Mark */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2 text-xs text-[#8C98AE] font-mono">
                  <span className="text-[#C5A880] font-semibold">{activeTestimonial.sector}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeTestimonial.matterContext}</span>
                </div>
                <Quote className="w-8 h-8 text-[#C5A880]/30 shrink-0" />
              </div>

              {/* Quote Body with smooth transition */}
              <div className="min-h-[160px] md:min-h-[180px] flex items-center">
                <blockquote className="font-cormorant text-xl md:text-2xl text-[#E2EAF5] italic leading-relaxed">
                  &ldquo;{activeTestimonial.quote}&rdquo;
                </blockquote>
              </div>

              {/* Impact Callout */}
              <div className="mt-4 p-3 bg-[#131B29] rounded-xl border border-[#20293D] flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span className="text-[#8C98AE]">{t('testimonials.impact')}</span>
                <span className="font-mono text-white font-semibold">{activeTestimonial.impactMetrics}</span>
              </div>
            </div>

            {/* Bottom Row: Author attribution, slider controls, and action */}
            <div className="mt-8 pt-6 border-t border-[#1C2538] flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <h4 className="text-base font-cinzel text-white font-bold">
                  {activeTestimonial.author}
                </h4>
                <div className="text-xs text-[#DFBE82] font-medium mt-0.5">
                  {activeTestimonial.role}
                </div>
                <div className="text-xs text-[#8C98AE] mt-0.5">
                  {activeTestimonial.organization}
                </div>
              </div>

              {/* Controls and Pagination */}
              <div className="flex items-center gap-4">
                {/* Dot indicators */}
                <div className="flex items-center gap-1.5">
                  {CLIENT_TESTIMONIALS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        currentIndex === idx
                          ? 'w-6 bg-[#C5A880]'
                          : 'w-2 bg-[#202A3D] hover:bg-[#344460]'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Arrow navigation buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={prevTestimonial}
                    className="w-9 h-9 rounded-xl bg-[#141C2B] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] border border-[#202B3E] flex items-center justify-center transition-colors"
                    aria-label="Previous Endorsement"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    className="w-9 h-9 rounded-xl bg-[#141C2B] hover:bg-[#C5A880] hover:text-[#0A0E17] text-[#C5A880] border border-[#202B3E] flex items-center justify-center transition-colors"
                    aria-label="Next Endorsement"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Wing (5 Cols): Reputable Firm Milestones Wall */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            {FIRM_MILESTONES.map((milestone) => (
              <div
                key={milestone.id}
                className="p-5 bg-[#0E1522] rounded-2xl border border-[#1C263A] hover:border-[#C5A880]/40 transition-all flex flex-col justify-between space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#C5A880]" />
                    <span className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">
                      {milestone.institution}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#8C98AE]">
                    {milestone.badge}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-3 pt-1">
                  <h4 className="text-sm font-cinzel text-white font-bold group-hover:text-[#DFBE82] transition-colors">
                    {milestone.label}
                  </h4>
                  <span className="text-lg font-mono text-[#E4C999] font-bold shrink-0 tabular-nums">
                    {milestone.metric}
                  </span>
                </div>

                <p className="text-xs text-[#8C98AE] leading-relaxed">
                  {milestone.description}
                </p>
              </div>
            ))}

            {/* Quick action strip */}
            <div className="p-4 bg-gradient-to-r from-[#121927] to-[#162134] rounded-2xl border border-[#222E46] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#DFBE82] font-semibold block">{t('testimonials.needCounsel')}</span>
                <span className="text-[11px] text-[#8C98AE]">{t('testimonials.screening')}</span>
              </div>
              <button
                onClick={() => onOpenConsultation()}
                className="px-3.5 py-2 bg-[#C5A880] hover:bg-[#DFBE82] text-[#0A0E17] font-semibold text-xs tracking-wider uppercase rounded-lg transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>{t('testimonials.instructBtn')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
