# Architecture

Verdict: the tree matches a typical **static web** layout (HTML / CSS / JS, no bundler) plus the official **Supabase** folder for optional backend. No folder move or framework rewrite is required.

Related: [README.md](README.md) · [PRODUCT.md](PRODUCT.md) · [ROADMAP.md](ROADMAP.md) · [supabase/README.md](supabase/README.md)

## Why this shape

The product constraint is a personal capture box that opens as files on disk or over `http://localhost`. There is no `package.json`, no `src/` vs `public/` split, and no React/Next app router. Those belong to a bundled SPA. This repo follows the classic site map instead:

```
index.html     entry markup (view)
css/           presentation
js/            behavior, split by layer
assets/        static files (favicon)
supabase/      schema, storage policies, Edge Functions
legal/         terms + privacy HTML (Phase 4)
```

That is the same layout used by GitHub Pages sites, MDN-style demos, and other no-build clients. `supabase/` at the repo root is the documented Supabase CLI layout (`migrations/`, `functions/`).

## Layers

```mermaid
flowchart TB
  view["View: index.html + css/styles.css"]
  app["App: js/app.js"]
  services["Services: i18n tagger og preview"]
  persist["Adapter: js/storage.js"]
  local["localStorage"]
  remote["js/backend.js"]
  baas["Supabase: auth Postgres Storage functions"]
  config["js/config.js"]

  view --> app
  app --> services
  app --> persist
  persist --> local
  persist --> remote
  config --> remote
  remote --> baas
```

| Layer | Files | Role |
| --- | --- | --- |
| View | [`index.html`](index.html), [`css/styles.css`](css/styles.css), [`assets/`](assets/) | Markup, chrome, fridge-door CSS. Semantic `header` / `main` / `footer`. Phase 4 adds intro markup and `legal/` policy pages. |
| Config | [`js/config.js`](js/config.js) | Project URL and anon key. Empty or `YOUR_*` keeps the local path. Never `service_role`. |
| App | [`js/app.js`](js/app.js) | Controller: events, draft, list, auth UI. Talks to storage and services only. |
| Services | [`js/i18n.js`](js/i18n.js), [`js/tagger.js`](js/tagger.js), [`js/phish.js`](js/phish.js), [`js/og.js`](js/og.js), [`js/preview.js`](js/preview.js) | Copy, classify, on-device URL-shape phishing check, Open Graph, media/document preview. |
| Persist adapter | [`js/storage.js`](js/storage.js) | The only persist API for the app. Lang/theme always local. Scraps local or remote. |
| Remote client | [`js/backend.js`](js/backend.js) | Supabase auth, upsert, signed URLs, migrate, realtime. Inactive until config is filled **and** a user is signed in. |
| Backend | [`supabase/`](supabase/) | `public.scraps` + RLS, private `scrap-media` bucket, `og-preview` function. |

Scripts are IIFE modules that hang a `MyScrap*` object on `window`. Load order in `index.html` is the dependency order: config → supabase-js CDN → backend → i18n → storage → tagger → phish → og → preview → app.

## Data flow

1. **Entry.** Login view (`#view-login`). Empty config: demo session in `myscrap.session`. Filled config: OAuth or anonymous auth via `MyScrapBackend`. Phase 4 replaces this full-page wall with an intro surface; auth moves to the header. A saved session still opens the app.
2. **Capture.** Composer paste/drop/`+` menu. `MyScrapTagger` sets type and tags. If the scrap is a web link, `MyScrapPhish.assess` scores the URL shape in the draft (not persisted). A new capture replaces an open classify draft. Draft stays in memory until save.
3. **Preview.** Images/video/audio/docs through `MyScrapPreview`. Links through `MyScrapOg` (Edge Function when signed in, else public proxies).
4. **Save.** `MyScrapStorage.saveScraps`. Local path: JSON in `myscrap.scraps` with a ~4.2MB budget. Remote path: row in `public.scraps`, bytes in `scrap-media/{userId}/{scrapId}/`.
5. **List.** Newest first in the client. Type, tag, and search filters are view-only. Phase 4 adds a 일자별 calendar filter on `createdAt` (still view-only). Remote tabs reload on visibility and on realtime.

Language, theme, and color palette stay on this device in both paths. The inline boot script in `index.html` reads `myscrap.theme` and `myscrap.palette` before CSS so the first paint does not flash. That is the one intentional bypass of `MyScrapStorage`.

## What this is not

These would be the wrong target for this product:

- `src/` + bundler + `dist/` (the constraint is no build step).
- Next.js / Vite app-router folders (`app/`, `pages/`, `components/`).
- A second database such as IndexedDB alongside Supabase.
- Putting `service_role` or secrets in the client.

## Optional later (not required)

The layout already matches typical static-web architecture. These are hygiene items if the client grows, not a reason to restructure now:

- Split `js/app.js` (UI chrome vs draft vs list) if it keeps growing past a single controller.
- ES modules (`type="module"`) if `file://` is dropped as a first-class open path.
- A root `.gitignore` for editor junk and accidental filled keys (committed `js/config.js` must stay empty placeholders).

Phase 4 layout notes (when that work starts): `data-surface` becomes `"intro"` | `"app"`. Header auth is a sheet, not a third surface. Policy pages stay static HTML next to `index.html`. Operator identity strings are placeholders in config or i18n, never invented registrations.
