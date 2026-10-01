# Meridian

Meridian is a What Framework starter for a fictional coastal travel planner. It combines build-time rendered guide pages with a client-mounted itinerary island for trip reordering, timezone display, local saved trips and JSON export.

Requires Node.js 22.

```sh
npm ci
npm run dev
```

Build and test the deployable artifact:

```sh
npm run build
npm run test
```

Preview the production artifact exactly as a static host will serve it:

```sh
npm run build
npm run preview
# Open http://127.0.0.1:4173
```

## Routes

- `/` — coastal guide front
- `/guides` — all fictional destination guides
- `/guides/:slug` — build-time rendered guide detail pages
- `/planner` — client-mounted itinerary planner
- `/build` — public build journal and source guide
- `/404` — not-found preview; unknown paths are served from root `404.html` with HTTP 404

## Vura deployment

After creating or linking the Vura project, run:

```sh
npm ci
npx vura-platform login
npx vura-platform projects create meridian --team <team-id>
# or: npx vura-platform projects link <project-id>
SITE_URL=https://what-starter-meridian-fae244da.vura.app npm run build
npx vura-platform deploy --prod
```

`SITE_URL` must be an absolute `http` or `https` origin with no path, query or hash. Local builds default to `http://localhost:4173`; production builds should set the deployed Vura origin so canonical, sitemap and robots URLs are correct.

This starter has no secrets, no remote assets, no tracking and no paid services.

## Source

Planned public repository: <https://github.com/CelsianJs/what-starter-meridian>

## What this demonstrates

- Static server rendering with `what-framework/server`
- Dataset-generated direct guide routes and genuine static 404
- Client-mounted islands with `mount`, `useSignal`, `useComputed` and `useEffect`
- Local state with corrupt-storage and denied-storage fallbacks
- Vura CLI-prebuilt static deployment shape

See [BUILD.md](./BUILD.md) and `/build` for implementation notes, verification and limitations.
