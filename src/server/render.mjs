import { h } from 'what-framework';
import { renderToString } from 'what-framework/server';
import { guides, routes, sampleStops, site } from '../content.mjs';

export function renderRoute(path, origin = 'http://localhost:4173') {
  const guide = guides.find((item) => path === `/guides/${item.slug}` || path === item.alias);
  let body;
  let title = site.name;
  let description = site.description;

  if (path === '/') body = Home();
  else if (path === '/guides') body = Guides();
  else if (guide) {
    title = `${guide.title} — ${site.name}`;
    description = guide.summary;
    body = GuideDetail(guide);
  } else if (path === '/planner') body = Planner();
  else if (path === '/build') body = Build();
  else if (path === '/404') {
    title = `Not found — ${site.name}`;
    body = NotFound();
  } else {
    title = `Not found — ${site.name}`;
    body = NotFound();
  }

  const html = renderToString(Layout({ path, title, description, origin, body }));
  return `<!doctype html>${html}`;
}

export function publicRoutes() {
  return routes.map((route) => route.path);
}

function Layout({ path, title, description, origin, body }) {
  const canonical = new URL(path === '/404' ? '/404' : path, origin).toString();
  const asset = '/assets/main.js';
  return h('html', { lang: 'en' },
    h('head', {},
      h('meta', { charset: 'utf-8' }),
      h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      h('title', {}, title),
      h('meta', { name: 'description', content: description }),
      h('link', { rel: 'canonical', href: canonical }),
      h('link', { rel: 'stylesheet', href: '/site.css' }),
      h('script', { type: 'module', src: asset, defer: true }),
    ),
    h('body', {},
      h('header', { class: 'shell mast' },
        h('a', { class: 'brand', href: '/' }, site.name),
        h('nav', { class: 'nav', 'aria-label': 'Primary' },
          h('a', { href: '/guides' }, 'Guides'),
          h('a', { href: '/planner' }, 'Planner'),
          h('a', { href: '/build' }, 'Build'),
        ),
      ),
      h('main', {}, body),
      h('footer', { class: 'shell footer' }, 'Fictional travel data. Local-only state. Built for Vura static deployment.'),
      h('script', { id: 'meridian-data', type: 'application/json' }, JSON.stringify({ guides, sampleStops })),
    ),
  );
}

function Home() {
  return h('div', { class: 'shell' },
    h('section', { class: 'hero compact-hero' },
      h('div', {},
        h('p', { class: 'eyeline' }, 'Blue-paper travel planning'),
        h('h1', {}, 'Chart a three-day coast.'),
        h('p', {}, site.description),
        h('a', { class: 'button', href: '/planner' }, 'Open planner'),
      ),
      h('div', { class: 'panel route-ledger', 'aria-label': 'Sample coastal itinerary' },
        h('p', { class: 'eyeline' }, 'Sample route'),
        ...sampleStops.slice(0, 4).map((stop) => h('div', { class: 'ledger-row' },
          h('span', {}, `D${stop.day}`),
          h('strong', {}, stop.time),
          h('a', { href: `/guides/${stop.guide}` }, stop.title),
        )),
      ),
    ),
    GuideGrid(),
  );
}

function Guides() {
  return h('div', { class: 'shell' },
    h('section', { class: 'hero' },
      h('div', {},
        h('p', { class: 'eyeline' }, 'Fictional guide index'),
        h('h1', {}, 'Three harbors, many ways through.'),
      ),
      h('p', {}, 'Every guide page is rendered at build time and can be opened directly from a static host. Alias routes like `/bay` are generated from the same content records.'),
    ),
    GuideGrid(),
  );
}

function GuideGrid() {
  return h('section', { class: 'grid', 'aria-label': 'Destination guides' },
    ...guides.map((guide) => h('a', { class: 'guide-card', href: `/guides/${guide.slug}`, style: `--guide:${guide.color}` },
      h('div', {},
        h('div', { class: 'swatch' }),
        h('p', { class: 'meta' }, `${guide.region} · ${guide.days} days`),
        h('h3', {}, guide.title),
        h('p', {}, guide.summary),
      ),
      h('span', { class: 'meta' }, guide.tide),
    )),
  );
}

function GuideDetail(guide) {
  return h('div', { class: 'shell detail' },
    h('aside', { class: 'panel chart', style: `--guide:${guide.color}` },
      h('div', { class: 'route-line' }),
    ),
    h('article', {},
      h('p', { class: 'eyeline' }, guide.region),
      h('h1', {}, guide.title),
      h('p', {}, guide.summary),
      h('p', { class: 'meta' }, `${guide.timezone} · ${guide.tide}`),
      h('h2', {}, 'Suggested legs'),
      h('ul', { class: 'note-list' }, ...guide.legs.map((leg) => h('li', {}, leg))),
      h('h2', {}, 'Field notes'),
      h('ul', { class: 'note-list' }, ...guide.notes.map((note) => h('li', {}, note))),
      h('a', { class: 'button', href: '/planner' }, 'Use in planner'),
    ),
  );
}

function Planner() {
  return h('div', { class: 'shell' },
    h('section', { class: 'hero planner-lead' },
      h('div', {},
        h('p', { class: 'eyeline' }, 'Local itinerary island'),
        h('h1', {}, 'Move a stop. Export the route.'),
        h('p', {}, 'The planner is the lead object here: keyboard-safe move controls, local state, timezone preview and portable JSON export are all visible before the guide catalogue.'),
      ),
      h('div', { class: 'panel route-ledger' },
        h('p', { class: 'eyeline' }, 'Above-fold fallback'),
        h('p', {}, 'If JavaScript is unavailable, this route ledger still explains the trip shape. JavaScript replaces the planner region below with editable state.'),
      ),
    ),
    h('section', { id: 'planner-island', class: 'planner' },
      h('div', { class: 'panel' }, h('p', {}, 'Planner loading… If JavaScript is unavailable, the guide pages remain fully readable.')),
    ),
  );
}

function Build() {
  return h('div', { class: 'shell' },
    h('section', { class: 'hero' },
      h('div', {},
        h('p', { class: 'eyeline' }, 'Public build journal'),
        h('h1', {}, 'How Meridian is assembled.'),
      ),
      h('p', {}, 'This page is written for developers and agents adapting the starter. It records verified behavior and limitations without private task metadata.'),
    ),
    h('section', { class: 'build-card' },
      h('ul', { class: 'build-list' },
        h('li', {}, 'Signals: `src/client/main.jsx` stores stops, timezone, export status and storage mode.'),
        h('li', {}, 'Computed: day groups and local-time preview derive from the current stop list and timezone.'),
        h('li', {}, 'Effects: the current plan persists through safe storage wrappers and cleans up after itself.'),
        h('li', {}, 'Snippet: `safeGet(STORAGE, storageStatus)` catches `SecurityError`, switches the visible boundary to memory mode, and never clears existing browser storage.'),
        h('li', {}, 'Problem fixed during build: server-rendered JSON inside a script tag is HTML-escaped by the renderer, so the client decodes entities before `JSON.parse`.'),
        h('li', {}, 'Routing: `src/content.mjs` generates guide routes and aliases; `scripts/build.mjs` writes `path/index.html`.'),
        h('li', {}, 'Vura: `dist/manifest.json` is validated with the public manifest contract and maps each route to `config.staticKey` in `dist/static`.'),
        h('li', {}, 'Lesson: server pages use `h()` and `renderToString`; browser JSX stays in the client entry.'),
        h('li', {}, 'Lesson: `mount()` is client-mounted interactivity over static fallback HTML, not SSR-preserving hydration.'),
        h('li', {}, 'Limitation: fictional local-only planning; no bookings, accounts, live maps or analytics.'),
        h('li', {}, 'Verification target: Node 22, production build, browser route smoke, storage-denied and JSON-export regressions.'),
      ),
    ),
  );
}

function NotFound() {
  return h('div', { class: 'shell hero' },
    h('div', {},
      h('p', { class: 'eyeline' }, 'Off chart'),
      h('h1', {}, 'This channel is not on the chart.'),
      h('p', {}, 'Return to the guide index or open the planner to continue with the sample route.'),
      h('a', { class: 'button', href: '/guides' }, 'View guides'),
    ),
  );
}
