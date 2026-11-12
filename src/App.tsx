import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ReadingProgressProvider } from './context/ReadingProgressContext';
import { Header } from './components/Header';
import { GlobalBreadcrumbs } from './components/GlobalBreadcrumbs';
import { HeroSection } from './components/HeroSection';
import { ChambersLeadership } from './components/ChambersLeadership';
import { PracticeAreas } from './components/PracticeAreas';
import { AdvocatesTeam } from './components/AdvocatesTeam';
import { CaseBriefs } from './components/CaseBriefs';
import { FeeCalculator } from './components/FeeCalculator';
import { LegalInsights } from './components/LegalInsights';
import { EastAfricaReachMap } from './components/EastAfricaReachMap';
import { FirmAwards } from './components/FirmAwards';
import { NairobiChambers } from './components/NairobiChambers';
import { FAQ } from './components/FAQ';
import { ClientTestimonials } from './components/ClientTestimonials';
import { Footer } from './components/Footer';
import { ConsultationModal } from './components/ConsultationModal';
import { ClientVaultModal } from './components/ClientVaultModal';
import { SecureClientPortalModal } from './components/SecureClientPortalModal';
import { SearchIndexModal } from './components/SearchIndexModal';

export default function App() {
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isClientPortalOpen, setIsClientPortalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Active section & journey breadcrumb tracking
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [journeyHistory, setJourneyHistory] = useState<string[]>(['hero']);
  const [subItem, setSubItem] = useState<{
    type: 'practice' | 'case' | 'insight' | 'portal';
    title: string;
    parentSection: string;
  } | null>(null);

  const [focusedPracticeId, setFocusedPracticeId] = useState<string | null>(null);
  const [focusedCaseId, setFocusedCaseId] = useState<string | null>(null);
  const [focusedFaqId, setFocusedFaqId] = useState<string | null>(null);
  
  const [consultationParams, setConsultationParams] = useState<{
    practice?: string;
    estimate?: string;
    advocate?: string;
  }>({});

  // Smooth scroll and record journey step
  const handleNavigateSection = useCallback((sectionId: string) => {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection('hero');
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(sectionId);
      }
    }
    setJourneyHistory((prev) => {
      if (prev[prev.length - 1] === sectionId) return prev;
      return [...prev.slice(-12), sectionId];
    });
  }, []);

  // IntersectionObserver to auto-track section scroll position
  useEffect(() => {
    const trackedSections = [
      'hero', 'practice', 'advocates', 'cases', 
      'fee-calculator', 'insights', 'east-africa-reach', 'awards', 'chambers', 'faq'
    ];

    const elements = trackedSections
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
            const id = entry.target.id;
            setActiveSection(id);
            setJourneyHistory((prev) => {
              if (prev[prev.length - 1] === id) return prev;
              return [...prev.slice(-12), id];
            });
          }
        });
      },
      {
        threshold: [0.2, 0.4],
        rootMargin: '-80px 0px -40% 0px'
      }
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Global Cmd+K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleOpenConsultation = (practice?: string, estimate?: string, advocate?: string) => {
    setConsultationParams({ practice, estimate, advocate });
    setIsConsultationOpen(true);
  };

  const handleCloseConsultation = () => {
    setIsConsultationOpen(false);
    setConsultationParams({});
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ReadingProgressProvider>
          <div className="min-h-screen bg-[#080B11] text-[#E8EDF5] flex flex-col font-sans selection:bg-[#C5A880]/30 selection:text-[#E8EDF5] transition-colors duration-300">
        {/* Top Bar Navigation */}
      <Header
        onOpenConsultation={() => handleOpenConsultation()}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenPortal={() => {
          setIsClientPortalOpen(true);
          setSubItem({
            type: 'portal',
            title: 'Secure Client Portal',
            parentSection: 'portal'
          });
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Persistent Global Breadcrumb Navigation & Browsing Journey Tracker */}
      <GlobalBreadcrumbs
        activeSection={activeSection}
        subItem={subItem}
        journeyHistory={journeyHistory}
        onNavigateSection={handleNavigateSection}
        onClearSubItem={() => setSubItem(null)}
      />

      {/* Main Page Flow */}
      <main className="flex-grow">
        {/* Hero Section with High-Impact Imagery & Proof Strip */}
        <HeroSection
          onOpenConsultation={() => handleOpenConsultation()}
          onOpenVault={() => setIsVaultOpen(true)}
        />

        {/* Chambers Leadership & Senior Counsel Milton Angwenyi, SC */}
        <ChambersLeadership
          onOpenConsultation={handleOpenConsultation}
        />

        {/* Core Practice Areas Bento Grid */}
        <PracticeAreas
          onOpenConsultation={(practiceTitle) => handleOpenConsultation(practiceTitle)}
          focusedPracticeId={focusedPracticeId}
          onClearFocusedPractice={() => {
            setFocusedPracticeId(null);
            if (subItem?.type === 'practice') setSubItem(null);
          }}
          onSelectPractice={(practice) => {
            if (practice) {
              setSubItem({
                type: 'practice',
                title: practice.title,
                parentSection: 'practice'
              });
            } else if (subItem?.type === 'practice') {
              setSubItem(null);
            }
          }}
        />

        {/* Roll of Advocates & Legal Partners */}
        <AdvocatesTeam
          onOpenConsultation={handleOpenConsultation}
        />

        {/* Landmark Judicial Precedents & Milestone Transactions */}
        <CaseBriefs
          focusedCaseId={focusedCaseId}
          onSelectCaseBrief={(brief) => {
            if (brief) {
              setSubItem({
                type: 'case',
                title: brief.matterName,
                parentSection: 'cases'
              });
            } else if (subItem?.type === 'case') {
              setSubItem(null);
            }
          }}
        />

        {/* Advocates Remuneration Order (ARO) Legal Fee & Retainer Calculator */}
        <FeeCalculator
          onOpenConsultation={(practice, estimate) => handleOpenConsultation(practice, estimate)}
        />

        {/* Kenya Law Review & Legal Insights Articles */}
        <LegalInsights
          onSelectArticle={(article) => {
            if (article) {
              setSubItem({
                type: 'insight',
                title: article.title,
                parentSection: 'insights'
              });
            } else if (subItem?.type === 'insight') {
              setSubItem(null);
            }
          }}
        />

        {/* East Africa Regional Reach & Cross-Border Sovereign Practice Map (d3-geo) */}
        <EastAfricaReachMap
          onOpenConsultation={handleOpenConsultation}
        />

        {/* Prestigious Law Firm Awards, Honors & Accreditations Showcase */}
        <FirmAwards
          onOpenConsultation={handleOpenConsultation}
        />

        {/* Upper Hill Nairobi Chambers & Superior Courts Proximity */}
        <NairobiChambers
          onOpenConsultation={() => handleOpenConsultation()}
        />

        {/* Corporate Law & Consultations Statutory FAQ */}
        <FAQ
          onOpenConsultation={handleOpenConsultation}
          focusedFaqId={focusedFaqId}
        />

        {/* Client Endorsements & Reputable Firm Milestones Carousel */}
        <ClientTestimonials
          onOpenConsultation={handleOpenConsultation}
        />
      </main>

      {/* Chambers Quiet Footer */}
      <Footer
        onOpenConsultation={() => handleOpenConsultation()}
        onOpenVault={() => setIsVaultOpen(true)}
      />

      {/* Privileged Attorney-Client Consultation & Intake Modal */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={handleCloseConsultation}
        initialPractice={consultationParams.practice}
        initialEstimate={consultationParams.estimate}
        initialAdvocate={consultationParams.advocate}
      />

      {/* Chambers Client Docket & E-Filing Vault Modal */}
      <ClientVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
      />

      {/* Dedicated Secure Client Portal Login Modal with Biometric WebAuthn & Mock Auth Check */}
      <SecureClientPortalModal
        isOpen={isClientPortalOpen}
        onClose={() => {
          setIsClientPortalOpen(false);
          if (subItem?.type === 'portal') setSubItem(null);
        }}
        onOpenFullDashboard={(matter) => {
          setIsClientPortalOpen(false);
          if (subItem?.type === 'portal') setSubItem(null);
          setIsVaultOpen(true);
        }}
      />

      {/* Chambers Global Searchable Index & Command Palette (Cmd+K) */}
      <SearchIndexModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPractice={(id) => {
          setFocusedPracticeId(id);
          setTimeout(() => setFocusedPracticeId(null), 1000);
        }}
        onSelectCase={(id) => {
          setFocusedCaseId(id);
        }}
        onSelectFaq={(id) => {
          setFocusedFaqId(id);
        }}
        onOpenConsultation={(practice) => {
          handleOpenConsultation(practice);
        }}
        onOpenVault={() => setIsVaultOpen(true)}
      />
    </div>
        </ReadingProgressProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
