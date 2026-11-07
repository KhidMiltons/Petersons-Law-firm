import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ChambersLeadership } from './components/ChambersLeadership';
import { PracticeAreas } from './components/PracticeAreas';
import { AdvocatesTeam } from './components/AdvocatesTeam';
import { CaseBriefs } from './components/CaseBriefs';
import { FeeCalculator } from './components/FeeCalculator';
import { LegalInsights } from './components/LegalInsights';
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

  const [focusedPracticeId, setFocusedPracticeId] = useState<string | null>(null);
  const [focusedCaseId, setFocusedCaseId] = useState<string | null>(null);
  const [focusedFaqId, setFocusedFaqId] = useState<string | null>(null);
  
  const [consultationParams, setConsultationParams] = useState<{
    practice?: string;
    estimate?: string;
    advocate?: string;
  }>({});

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
    <LanguageProvider>
      <div className="min-h-screen bg-[#080B11] text-[#E8EDF5] flex flex-col font-sans selection:bg-[#C5A880]/30 selection:text-[#E8EDF5]">
      {/* Top Bar Navigation */}
      <Header
        onOpenConsultation={() => handleOpenConsultation()}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenPortal={() => setIsClientPortalOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
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
          onClearFocusedPractice={() => setFocusedPracticeId(null)}
        />

        {/* Roll of Advocates & Legal Partners */}
        <AdvocatesTeam
          onOpenConsultation={handleOpenConsultation}
        />

        {/* Landmark Judicial Precedents & Milestone Transactions */}
        <CaseBriefs
          focusedCaseId={focusedCaseId}
        />

        {/* Advocates Remuneration Order (ARO) Legal Fee & Retainer Calculator */}
        <FeeCalculator
          onOpenConsultation={(practice, estimate) => handleOpenConsultation(practice, estimate)}
        />

        {/* Kenya Law Review & Legal Insights Articles */}
        <LegalInsights />

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

      {/* Dedicated Secure Client Portal Login Modal with Mock Auth Check */}
      <SecureClientPortalModal
        isOpen={isClientPortalOpen}
        onClose={() => setIsClientPortalOpen(false)}
        onOpenFullDashboard={(matter) => {
          setIsClientPortalOpen(false);
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
    </LanguageProvider>
  );
}
