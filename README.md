# MyBrary

Personal capture box for things you saw on the web, photos, and files. Vite + React (TypeScript) SPA on Firebase Hosting (`mybrary-snuu09`). Auth, Postgres, and Storage stay on Supabase. Image/link classify can call Claude through a Cloud Function at `/api/analyze` (Netlify Function still works on Netlify).

Shipped vs next: [ROADMAP.md](ROADMAP.md). Product and design: [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md). Folders: [ARCHITECTURE.md](ARCHITECTURE.md).

## Open

```bash
cp .env.example .env
# paste VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Then visit the Vite URL (usually [http://localhost:5173](http://localhost:5173)). Functions are available in that same dev server via `@netlify/vite-plugin`.

```bash
npm run build
```

## Env

| Name | Where | Role |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Vite (baked into `dist`) | Project URL |
| `VITE_SUPABASE_ANON_KEY` | Vite (baked into `dist`) | Publishable / anon key (never `service_role`) |
| `ANTHROPIC_API_KEY` | Cloud Function / Netlify Function | Direct Anthropic SDK. Not in the browser. |
| `SUPABASE_URL` | Cloud Function only | Same project URL; used to verify the user JWT |
| `SUPABASE_ANON_KEY` | Cloud Function only | Same anon key; never `service_role` |

## Use

1. Intro: **책장을 연다** / **로그인**, then email sign up or sign in. Empty env vars show a config hint; scraps are not stored on the device without an account.
2. Paste, drop, or use **+** (clipboard, camera on phones, photo, file). Classify runs Claude when the function is up, otherwise MIME/URL heuristics. A skeleton sits on the draft while it looks.
3. Confirm tags, then save. Newest first. Search and type chips filter the list.
4. KO / EN, 기본 / 현무암, light / system / dark in settings. Those prefs stay on this device. **나가기** returns to the intro.

## Deploy (Firebase Hosting)

Live: [https://mybrary-snuu09.web.app](https://mybrary-snuu09.web.app) (also [https://mybrary-snuu09.firebaseapp.com](https://mybrary-snuu09.firebaseapp.com)).

1. Put `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`, then `npm run deploy:hosting` (builds `dist` and deploys Hosting).
2. Enable Email in Supabase Auth. Apply [supabase/migrations/20260820140000_scraps_media_realtime.sql](supabase/migrations/20260820140000_scraps_media_realtime.sql). Add `https://mybrary-snuu09.web.app` and `https://mybrary-snuu09.firebaseapp.com` to Auth redirect URLs.
3. Claude classify is [functions/src/index.ts](functions/src/index.ts), rewritten from `/api/analyze`. 2nd-gen Cloud Functions need a Blaze plan. Until that function is deployed, the client uses MIME/URL fallback. On Blaze: put `ANTHROPIC_API_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY` in `functions/.env` (gitignored), then `npx -y firebase-tools@latest deploy --only functions,hosting`.
4. Model id is `claude-sonnet-4-5` (the brief’s `claude-sonnet-5` is not a current id).

Netlify remains optional: build `npm run build`, publish `dist`, same Vite keys plus `ANTHROPIC_API_KEY` in site env. `/api/analyze` on Netlify is [netlify/functions/analyze.ts](netlify/functions/analyze.ts).

## Project structure

```
src/                   React UI, i18n, Supabase client, tagger fallback
public/assets/         favicon, intro still
firebase.json          Hosting (dist) + /api/analyze rewrite
functions/             Cloud Function classify (JWT required)
netlify/functions/     Same classify for Netlify
supabase/              Postgres RLS, scrap-media, optional og-preview
```
