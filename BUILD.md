# Build journal

## Product-depth patterns — 2026-10-07

`planForGuide(slug)` and `moveStop(items, index, delta)` are pure functions in `src/content.mjs`. Previously, reordering retained activity timestamps while hard-coding day reassignment, which could place 13:10 before 09:40. The corrected swap retains destination slot `day` and `time`: `{ ...items[target], day: items[index].day, time: items[index].time }`. The query parameter selects only a known guide. Existing saved plans win on initial load, and an explicit route button replaces them. The mounted SVG projects current stops through reactive accessors; the static sample chart remains only as a no-JS fallback. Timezone output is labeled as a fixed reference instant, not conversion of undated stop slots. Tests cover each guide plan, slot stability, exported guide ids and storage failure.

Verification: `npm test` runs content/model regressions, production artifact checks, contextual browser flows, desktop/mobile screenshots and the original smoke suite. Screenshot proof is under `.screenshots/`; no external services are required.

Last verified: 2026-10-07.

## Architecture

- `src/content.mjs` owns guide, route and starter metadata.
- `src/server/render.mjs` renders every public route with `what-framework/server`, including guide aliases and root `404.html`.
- `src/client/main.jsx` mounts the planner island on `/planner`; browser JSX is not imported by the Node renderer.
- `scripts/build.mjs` validates `SITE_URL` and writes static HTML, sitemap and robots output under `dist/static`.
- `scripts/check.mjs` validates the emitted Vura route manifest with `@celsian/vura-contract`.
- `scripts/serve-static.mjs` previews `dist/static` and returns real HTTP 404 for unknown paths.

## What Framework patterns

- Signals: `useSignal` stores itinerary stops, selected timezone, export status and storage mode.
- Computed values: `useComputed` groups stops by day and formats the local-time display.
- Effects: `useEffect` persists the current plan, dispatches cleanup-safe lifecycle work and updates export status.
- Global state: the planner reads/writes one local trip record, intentionally scoped to the browser.
- Routing/SSG: all guide pages and aliases are generated from the guide dataset; no runtime router is required for static hosting.

## Lessons and limitations

- `mount()` creates client-mounted islands over static fallbacks; it is not SSR-preserving hydration.
- Storage APIs can throw in private or locked-down contexts, so reads/writes use safe wrappers and a tab-local memory fallback instead of clearing user data.
- Server-rendered JSON inside a `<script type="application/json">` is escaped by the renderer. The client decodes entities before `JSON.parse`; otherwise the planner mounts with an empty itinerary.
- The static planner fallback is intentionally useful prose/route context, then `src/client/main.jsx` replaces only the planner island. Server guide pages remain readable without JavaScript.
- Refinement: the route fallback remains available without JavaScript, but `src/client/main.jsx` adds `.js-ready` so implementation copy is hidden once the interactive planner is mounted.
- The reorder UI uses buttons rather than drag-only gestures so it works with keyboard and touch.
- Refinement: `.controls` opts out of grid stretch with `align-self:start` and `align-content:start`, keeping export/reset controls compact beside tall itineraries.
- Refinement: route charts are inline SVG generated from `sampleStops`, not decorative CSS dots, so the guide visual is tied to the same data as the planner.
- Vura upload rejected the first handwritten static manifest because it lacked required `timestamp` and `pages[].filePath` fields. The starter now emits the full manifest contract and maps each route to its promoted public file via `config.staticKey`.
- Trip data is fictional and local-only; there is no account sync, booking, live map, weather or analytics service.

## Reference snippets

```js
const saved = normalizePlan(safeJson(safeGet(STORAGE, storageStatus)));
const stops = useSignal(saved.length ? saved : data.sampleStops);
const days = useComputed(() => groupByDay(stops()));
```

```js
function safeGet(key, status) {
  try { return window.localStorage.getItem(key); }
  catch { status('memory'); return fallback.get(key) || null; }
}
```

## Verification plan

The smoke suite builds production output, runs Chromium against the generated artifact, captures desktop/mobile screenshots, and checks:

- Desktop routes render without console errors.
- Guide detail routes are direct-loadable.
- Planner reorder, timezone switch and JSON export work.
- Corrupt persisted state recovers to a valid sample route.
- Denied storage keeps the planner usable with a visible boundary.
- Preview server returns genuine HTTP 404 for unknown paths.
