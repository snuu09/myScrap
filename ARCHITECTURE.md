# Architecture

Verdict: the tree is a **Vite + React SPA** on Firebase Hosting, with a Cloud Function (and a Netlify Function twin) for Claude classify, and the official **Supabase** folder for Auth, Postgres, and Storage.

Related: [README.md](README.md) · [PRODUCT.md](PRODUCT.md) · [ROADMAP.md](ROADMAP.md) · [supabase/README.md](supabase/README.md) · `.cursor/rules/`

## Why this shape

The product is still a personal capture box. The client is now bundled so TypeScript, Tailwind, and serverless classify can ship together.

```
index.html              Vite shell
src/                    React views, i18n, lib
public/assets/          favicon, intro still
firebase.json           Hosting public=dist, SPA + /api/analyze rewrite
functions/              Cloud Function /api/analyze
netlify/functions/      Netlify twin of the same classify
netlify.toml            Netlify build + SPA fallback
supabase/               migrations, optional og-preview
```

## Layers

```mermaid
flowchart TB
  view["View: src/pages + Tailwind"]
  app["App: src/App.tsx"]
  auth["Auth: Supabase email"]
  tagger["Tagger fallback: src/lib/tagger.ts"]
  fn["Function: /api/analyze"]
  persist["src/lib/scraps.ts"]
  baas["Supabase: Auth Postgres Storage"]
  claude["Anthropic Claude"]

  view --> app
  app --> auth
  app --> persist
  persist --> baas
  app --> fn
  fn --> claude
  fn --> baas
  app --> tagger
```

| Layer | Files | Role |
| --- | --- | --- |
| View | [`src/pages/`](src/pages/), [`src/components/`](src/components/), [`src/index.css`](src/index.css) | Intro, shelf, legal, DESIGN tokens |
| App | [`src/App.tsx`](src/App.tsx) | Routes, sheets, session gate |
| Prefs | [`src/context/Prefs.tsx`](src/context/Prefs.tsx) | Language, theme, palette on this device |
| Auth | [`src/context/Auth.tsx`](src/context/Auth.tsx), [`src/lib/supabase.ts`](src/lib/supabase.ts) | Email / password. No anonymous write path |
| Classify | [`functions/src/index.ts`](functions/src/index.ts), [`netlify/functions/analyze.ts`](netlify/functions/analyze.ts), [`src/lib/tagger.ts`](src/lib/tagger.ts) | Claude with JWT; MIME/URL fallback |
| Persist | [`src/lib/scraps.ts`](src/lib/scraps.ts) | `public.scraps` + `scrap-media/{userId}/{scrapId}/` |

## Data flow

1. **Entry.** Intro is public. **책장을 연다** opens email sign in / sign up. A session paints the shelf.
2. **Capture.** Paste/drop/`+`. Files upload first. `/api/analyze` gets the user JWT. Images may go to Claude vision. Failure uses the local tagger.
3. **Save.** Upsert the scrap row. List is newest first, RLS `auth.uid() = user_id`.
4. **Leave.** Sign out returns to intro. Scraps are not kept in `localStorage`.

`ANTHROPIC_API_KEY` is read in the function only (`process.env` on Firebase, `Netlify.env.get` on Netlify). Never in Vite.

## What this is not

- A second static `js/` client next to React.
- `service_role` in Vite.
- A recipe app. Claude classifies scraps, it does not invent meals.
