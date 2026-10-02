# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-10-01
- Primary product surfaces: Coastal travel guide index, guide detail pages, itinerary planner, build journal, not-found page.
- Evidence reviewed: Starter brief; existing What starter static-render pattern from sibling starters; local What/Vura package constraints.

## Brand
- Personality: Coastal, cartographic, useful, calm; more field notebook than luxury booking engine.
- Trust signals: Clear trip data boundaries, explicit local-only persistence, printable/exportable plans, real route aliases.
- Avoid: Generic resort photography, giant repeated H1 layouts, overclaiming booking/commerce features, private build-process language.

## Product goals
- Goals: Demonstrate static destination content plus reactive client itinerary planning; show local state, storage failure handling, reordering, JSON export, and timezone awareness.
- Non-goals: Real booking, maps API integration, user accounts, live inventory, analytics collection.
- Success signals: A visitor can browse guides, open a destination route directly, reorder a multi-day trip with keyboard-safe controls, save locally, and export JSON.

## Personas and jobs
- Primary personas: Framework evaluator, product designer, travel app prototype builder.
- User jobs: Learn the starter’s routing and island architecture; adapt a realistic planner flow; verify Vura-ready static output.
- Key contexts of use: Desktop review, mobile browsing, keyboard-only itinerary editing, locked-down storage contexts.

## Information architecture
- Primary navigation: Guides, Planner, Build.
- Core routes/screens: `/`, `/guides`, `/guides/:slug`, `/planner`, `/build`, `/404`.
- Content hierarchy: Current weatherless fictional story; guide cards; detailed guide pages; planner island with days, stops, timezone and export.

## Design principles
- Principle 1: Make the composition feel mapped and nautical without relying on map tiles or remote imagery.
- Principle 2: Client interactions must remain useful when persistence is unavailable.
- Tradeoffs: The planner is intentionally local-only and synthetic; no remote storage keeps the starter portable.

## Visual language
- Color: Blue paper, ink navy, fog, buoy red, sea-glass green accents.
- Typography: Georgia/Charter-like serif for guide texture; narrow uppercase labels for cartographic metadata.
- Spacing/layout rhythm: Broad ledger grids, route strips, inset panels, shoreline-like rules.
- Shape/radius/elevation: Low radius, hairline borders, paper shadows, no glossy cards.
- Motion: Subtle current-like fades and focus transitions; reduced-motion disables transforms.
- Imagery/iconography: data-backed inline SVG route lines, compass roses, tide marks; no external assets.

## Components
- Existing components to reuse: What signals/computed/effects, server `h()` renderer, Vura static artifact scripts from sibling starters.
- New/changed components: Guide card, itinerary day stack, move controls, timezone display, export panel, build journal.
- Variants and states: Empty saved plan, corrupt plan recovery, denied storage warning, selected timezone, export-ready state.
- Token/component ownership: CSS variables in `src/styles.css`; route data in `src/content.mjs`; client state in `src/client/main.jsx`.

## Accessibility
- Target standard: Practical WCAG AA.
- Keyboard/focus behavior: Reorder controls are buttons with clear labels; focus rings visible; no drag-only interaction.
- Contrast/readability: Navy-on-paper and red accents tested by design tokens.
- Screen-reader semantics: Lists, buttons, labels, live export status and route headings are explicit.
- Reduced motion and sensory considerations: Motion is subtle and disabled by `prefers-reduced-motion`.

## Responsive behavior
- Supported breakpoints/devices: 360px mobile through desktop.
- Layout adaptations: Ledger columns collapse into stacked cards; itinerary controls keep large touch targets.
- Touch/hover differences: Hover is decorative only; all actions work by click/tap/keyboard.

## Interaction states
- Loading: Static pages have immediate HTML fallback.
- Empty: Planner starts with a sample route and can restore after clearing.
- Error: Corrupt storage falls back to the sample route with a visible persistence boundary.
- Success: Export status reports generated JSON size.
- Disabled: Export is always available for current plan.
- Offline/slow network: No network dependencies after assets load.

## Content voice
- Tone: Field-guide precise, lightly fictional, practical.
- Terminology: “guide”, “leg”, “harbor”, “watch”, “local plan”.
- Microcopy rules: State local-only behavior and limitations plainly.

## Implementation constraints
- Framework/styling system: `what-framework@0.13.10`, `what-compiler@0.13.10`, Vite 6.4.3, CSS only.
- Design-token constraints: No remote assets, no paid services, no tracking.
- Performance constraints: SSG for every guide route and alias; small client bundle.
- Compatibility constraints: Node 22; client uses browser APIs only behind safe wrappers.
- Test/screenshot expectations: Desktop, mobile, direct route, 404, storage denial, corrupt storage, reorder and export flows.

## Open questions
- [ ] None for local starter review; live URL validation belongs to root after deployment.

## Refinement notes — 2026-10-01 style audit
- Replace the oversized serif hero posture with a denser chart-table lead: a compact headline, route ledger and itinerary preview should carry the first screen.
- Surface the planner as a usable object above the fold instead of making visitors click through a poster-like intro.
- Keep the blue-paper cartographic identity, but reduce empty hero scale and make guide/planner information feel operational.

## Refinement notes — 2026-10-02 Opus review
- Planner controls now opt out of grid stretch and stay compact/sticky at the top of the itinerary.
- The no-JS route explanation remains available as static fallback, but it is hidden when the planner island mounts so product screens do not show framework implementation copy.
- Day headings and stop time columns were tightened, and the decorative guide chart became a lightweight SVG route visualization from existing stops.
