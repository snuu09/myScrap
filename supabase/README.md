# Supabase

This is the standard Supabase CLI tree (`migrations/`, `functions/`). The web client is the Vite app at the repo root. How the layers connect: [ARCHITECTURE.md](../ARCHITECTURE.md).

Keys stay in `.env` (and `functions/.env` for the Cloud Function), never in git. See [`.env.example`](../.env.example).

## Once you have a project

1. Paste **Project URL** and the **anon / publishable** key into `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never paste `service_role`.
2. Authentication → Providers: enable **Email**, **Google** (Web client ID/secret; authorized redirect `https://vrayhcfbpgyazrxlblbj.supabase.co/auth/v1/callback`), and **Anonymous**. Site URL `https://mybrary-snuu09.web.app`. Redirect URLs: `http://localhost:5173`, `https://mybrary-snuu09.web.app`, `https://mybrary-snuu09.firebaseapp.com`. Until Anonymous is on, 둘러보기 still opens the shelf as a one-shot Auth user (same `auth.uid()` RLS) and settings still say 둘러보기.
3. Run migrations in order: `20260820140000_scraps_media_realtime.sql`, then `20260829143000_profiles_plans.sql` (SQL editor or `supabase db push`). Schema is `public.scraps` + `public.profiles` + private bucket `scrap-media` with `auth.uid()` RLS.
4. **Plan tiers (MVP, no payment):** default signup is `free` with `trial_ends_at = now() + 14 days`. Change tier in Table Editor → `profiles.plan_tier` (`standard`, `premium`, `admin`). Admin is manual only; never expose `service_role` in Vite.
5. Optional: `supabase functions deploy og-preview`.
6. **AdMob (web):** In AdMob / AdSense console create a display banner unit. Set `VITE_ADMOB_PUBLISHER_ID` (`ca-pub-…`) and `VITE_ADMOB_BANNER_SLOT` in `.env`, rebuild. Add `ads.txt` on Hosting when going live.
7. Reload. Email sign up / sign in, or **둘러보기**. Scraps and media sync per that Auth user. 둘러보기 is lost if the browser session is cleared.

This app’s project is **MyBrary** (`vrayhcfbpgyazrxlblbj`, `https://vrayhcfbpgyazrxlblbj.supabase.co`). A third Free project could not be created (two-project cap); the existing `test` project received the scraps schema. Rename it to MyBrary in the dashboard if the label still says test.

## Claude

Image/link classify is not in this folder. On Firebase it is [functions/src/index.ts](../functions/src/index.ts) (Hosting rewrite `/api/analyze`). On Netlify it is [netlify/functions/analyze.ts](../netlify/functions/analyze.ts). Both verify the user JWT with the anon key, then call Anthropic (`claude-sonnet-4-5`).
