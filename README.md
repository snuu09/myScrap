# MyBrary

Personal capture box for things you saw on the web, photos, and files. Vite + React (TypeScript) SPA on Firebase Hosting (`mybrary-snuu09`). Auth, Postgres, and Storage stay on Supabase. Image/link classify can call Claude through a Cloud Function at `/api/analyze` (Netlify Function still works on Netlify).

Shipped vs next: [ROADMAP.md](ROADMAP.md). Product and design: [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md). Folders: [ARCHITECTURE.md](ARCHITECTURE.md). Live: [https://mybrary-snuu09.web.app](https://mybrary-snuu09.web.app).

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
| `VITE_ADMOB_PUBLISHER_ID` | Vite (optional) | AdMob/AdSense `ca-pub-…` for free/standard banners |
| `VITE_ADMOB_BANNER_SLOT` | Vite (optional) | Banner unit slot id |
| `ANTHROPIC_API_KEY` | Cloud Function / Netlify Function | Direct Anthropic SDK. Not in the browser. |
| `SUPABASE_URL` | Cloud Function only | Same project URL; used to verify the user JWT |
| `SUPABASE_ANON_KEY` | Cloud Function only | Same anon key; never `service_role` |

## Use

1. Intro: **책장을 연다** / header **로그인** for email, Google, 회원가입, find/reset, or **둘러보기** in the sheet. Empty env vars show a config hint.
2. On the shelf, Stick is a **floating** ChatGPT-style composer (not the legal footer). Paste, drop, or use **+** (clipboard, camera on phones, photo, file). Classify runs Claude when the function is up, otherwise MIME/URL heuristics. The classify draft stacks above the composer pill.
3. Confirm tags, then save to Supabase `scraps` (+ private `scrap-media`). Newest first. Search, type chips, and **일자별** filter the list (AND). Row opens **`/scrap/:id`**. Header **통계** opens `/dashboard`.
4. Plans (policy only, no payment): free trial / standard / premium / admin in `profiles`. Settings shows tier, trial end date, storage gauge, and **DB 초기화** (own scraps + media only). Prefs (KO/EN, palette, theme) stay on this device. **나가기** returns to the intro.

## Deploy (Firebase Hosting)

Live: [https://mybrary-snuu09.web.app](https://mybrary-snuu09.web.app) (also [https://mybrary-snuu09.firebaseapp.com](https://mybrary-snuu09.firebaseapp.com)).

1. Put `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`, then `npm run deploy:hosting` (builds `dist` and deploys Hosting). Optional AdMob: `VITE_ADMOB_PUBLISHER_ID` + `VITE_ADMOB_BANNER_SLOT`.
2. Enable Email, Google (Web client ID/secret), and Anonymous in Supabase Auth. Apply migrations in order: [supabase/migrations/20260820140000_scraps_media_realtime.sql](supabase/migrations/20260820140000_scraps_media_realtime.sql), then [supabase/migrations/20260829143000_profiles_plans.sql](supabase/migrations/20260829143000_profiles_plans.sql). Add `https://mybrary-snuu09.web.app` and `https://mybrary-snuu09.firebaseapp.com` to Auth redirect URLs. See [supabase/README.md](supabase/README.md) for manual tier/admin changes.
3. Claude classify is [functions/src/index.ts](functions/src/index.ts), rewritten from `/api/analyze`. 2nd-gen Cloud Functions need a Blaze plan. Until that function is deployed, the client uses MIME/URL fallback. On Blaze: put `ANTHROPIC_API_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY` in `functions/.env` (gitignored), then `npx -y firebase-tools@latest deploy --only functions,hosting`.
4. Model id is `claude-sonnet-4-5` (the brief’s `claude-sonnet-5` is not a current id).

Netlify remains optional: build `npm run build`, publish `dist`, same Vite keys plus `ANTHROPIC_API_KEY` in site env. `/api/analyze` on Netlify is [netlify/functions/analyze.ts](netlify/functions/analyze.ts).

## Project structure

```
src/                   React UI, Plan context, scrap filters, AdMob slot, i18n
public/assets/         favicon, intro still
firebase.json          Hosting (dist) + /api/analyze rewrite
functions/             Cloud Function classify (JWT required)
netlify/functions/     Same classify for Netlify
supabase/              scraps RLS, profiles/plans, scrap-media, optional og-preview
```
