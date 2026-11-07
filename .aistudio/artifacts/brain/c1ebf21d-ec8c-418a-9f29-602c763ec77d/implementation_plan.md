# Global Searchable Index & Command Palette (⌘K)

A high-performance, institutional command palette and searchable index integrated into the top navigation of **Petersons Angwenyi & Associates Advocates**, enabling corporate clients, general counsels, and foreign investors to instantaneously search and navigate across Practice Portfolios, Superior Court Precedents, and Statutory Corporate FAQs.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed via interactive user clarification:
> - **Interaction Model**: Command palette overlay modal activated via a top-right navigation trigger button (`Search ⌘K`) and global keyboard shortcut (`Cmd+K` / `Ctrl+K`).
> - **Result Categorization**: Grouped categories with quick filter tabs (`All`, `Practice Areas`, `Case Precedents`, `Statutory FAQs`).
> - **Selection Action**: Direct smooth scrolling to the target section with automatic accordion expansion or modal presentation, accompanied by a subtle golden focus pulse.

---

## 1. Overview & Core Concept

- **What It Does**: Provides an omni-search command palette that indexes all primary legal knowledge bases across the firm's digital chambers:
  1. **Practice Areas**: 6 core corporate, arbitral, conveyancing, banking, and IP disciplines.
  2. **Landmark Judicial Precedents**: High-stakes Supreme Court, Court of Appeal, and NCIA matters with financial exposure and legal impact.
  3. **Corporate Law & Consultations FAQs**: In-depth statutory queries under the Companies Act 2015, ARO fee scales, ArdhiSasa, and Section 134 privilege.
- **Target Audience**: Institutional general counsels, C-suite executives, foreign investors, bank legal officers, and litigants seeking immediate statutory answers and qualified advocate counsel.
- **Key Value**: Reduces information discovery friction from multiple minutes to instantaneous millisecond lookups, elevating the firm's perceived authority and responsive legal acumen.

---

## 2. User Experience & Visual Design

### User Interaction Flow
1. **Triggering Search**:
   - Desktop user clicks the compact `Search [⌘K]` button in Zone 3 of the Header, or presses `⌘K` / `Ctrl+K` anywhere on the site.
   - Mobile user taps the search icon in the top header or mobile drawer.
2. **Palette Presentation**:
   - A curated command palette modal appears with smooth backdrop blur (`bg-black/85 backdrop-blur-md`).
   - The search input receives automatic focus, displaying suggested quick searches (e.g. `"ArdhiSasa"`, `"Section 134"`, `"Arbitration"`, `"Foreign Company"`, `"Senior Counsel"`).
3. **Filtering & Browsing**:
   - Users type queries in real time with instant debounced matching across titles, statutes, summaries, and outcomes.
   - Segmented filter tabs allow toggling between `All`, `Practice`, `Precedents`, and `FAQs`.
   - Results display unboxed statutory metadata (e.g., `Supreme Court of Kenya · KES 28.5B`), clear category badges, and matched excerpt highlights.
4. **Result Selection & Dispatch**:
   - Selecting an item closes the palette, smoothly scrolls the viewport to the relevant component, and activates the specific item (e.g. opening the Practice Area detail modal, or expanding the FAQ accordion with an attention glow).

### Visual Identity & Curatorial Styling
- **Canvas & Surfaces**: Deep obsidian `#080B11` and navy card `#0E1522` matching the Chambers design constitution.
- **Typography**: Display titles in Cormorant Garamond / Cinzel with monospace metadata (`text-xs font-mono text-[#C5A880]`).
- **Zero-Pill Discipline**: Unboxed metadata with typographic separators (`·` and `/`), avoiding candy pill enclosures.
- **Bilingual Lexicon**: Indexes both English and Swahili terms seamlessly.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side Unified Index vs Dynamic API Query**:
  - *Chosen Approach*: Compile a pre-indexed in-memory search catalog derived directly from `PRACTICE_AREAS`, `CASE_BRIEFS`, and `FAQS_DATA`.
  - *Rationale*: Zero latency (<5ms response time), zero server roundtrips, works completely offline or on unstable networks, and ensures instantaneous typing feedback.
- **Decision 2: Keyboard Shortcut (⌘K / Ctrl+K)**:
  - *Chosen Approach*: Standard desktop OS-aware listener with clean cleanup on unmount, ignoring shortcut execution when input elements are actively focused.
  - *Rationale*: Familiar standard for executive dashboards and institutional search tools.
- **Decision 3: Header Placement**:
  - *Chosen Approach*: Integrated cleanly into Zone 3 of the Top Navigation Bar adjacent to the `EN | SW` language toggle and Primary Consultation CTA, strictly respecting the Top Bar single-line contract.

---

## 4. Technical Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TOP NAVIGATION HEADER                           │
│  [Zone 1: Wordmark]      [Zone 2: Nav Links]    [Zone 3: Search ⌘K]    │
└───────────────────────────────────────────────────────────┬────────────┘
                                                            │ Click / ⌘K
                                                            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     SEARCHABLE INDEX COMMAND PALETTE                   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 🔍 Search practice areas, precedents, statutes, FAQs...    [ESC] │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  [All (20)]  [Practice Areas (6)]  [Precedents (6)]  [Legal FAQs (8)]  │
│  ────────────────────────────────────────────────────────────────────  │
│  • PRACTICE: International Commercial Arbitration (NCIA / LCIA)        │
│    FCIArb Lead · Arbitration Act 1995 · New York Convention 1958       │
│                                                                        │
│  • PRECEDENT: Republic v. Capital Markets Authority (Supreme Court)   │
│    KES 28.5B · Landmark Judicial Review Precedent                      │
│                                                                        │
│  • FAQ: Ultimate Beneficial Owners (UBO) Registration under BRS        │
│    Companies Act 2015 · Form CR1 · Statutory Compliance               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Selection Event
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        VIEWPORT DISPATCH HANDLER                       │
│  ┌───────────────────────────┬───────────────────────────┐             │
│  │  Scroll to #practice /    │  Expand Target Accordion  │             │
│  │  Open Practice Modal      │  in FAQ with Gold Glow    │             │
│  └───────────────────────────┴───────────────────────────┘             │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Structure
1. `src/components/SearchIndexModal.tsx`:
   - Interactive command palette modal with search input, category filters, keyboard event listeners (`Cmd+K`, `Escape`, `ArrowUp`, `ArrowDown`, `Enter`), and categorized search list.
2. `src/components/Header.tsx`:
   - Zone 3 integration with compact `Search [⌘K]` button on desktop and search icon on mobile.
3. `src/App.tsx`:
   - Global search state handling and callback dispatching for opening practice area modals, selecting cases, and auto-expanding FAQs.
