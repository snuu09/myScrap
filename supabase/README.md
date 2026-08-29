# Supabase

This is the standard Supabase CLI tree (`migrations/`, `functions/`). The web client is the Vite app at the repo root. How the layers connect: [ARCHITECTURE.md](../ARCHITECTURE.md).

Keys stay in `.env` (and `functions/.env` for the Cloud Function), never in git. See [`.env.example`](../.env.example).

## Once you have a project

1. Paste **Project URL** and the **anon / publishable** key into `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never paste `service_role`.
2. Authentication → Providers: enable **Email**. Add this site's origin as a redirect URL (`http://localhost:5173`, `https://mybrary-snuu09.web.app`, and `https://mybrary-snuu09.firebaseapp.com`).
3. Run the SQL in `migrations/20260820140000_scraps_media_realtime.sql` (SQL editor or `supabase db push`). Schema is still `public.scraps` + private bucket `scrap-media` with `auth.uid()` RLS. No new product tables.
4. Optional: `supabase functions deploy og-preview`.
5. Reload. Email sign up / sign in. Scraps and media sync per signed-in user.

Until Vite env vars are set, the intro stays public and the shelf cannot write.

## Claude

Image/link classify is not in this folder. On Firebase it is [functions/src/index.ts](../functions/src/index.ts) (Hosting rewrite `/api/analyze`). On Netlify it is [netlify/functions/analyze.ts](../netlify/functions/analyze.ts). Both verify the user JWT with the anon key, then call Anthropic (`claude-sonnet-4-5`).
