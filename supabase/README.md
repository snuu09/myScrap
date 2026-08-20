# Supabase (Phase 3)

This is the standard Supabase CLI tree at the repo root (`migrations/`, `functions/`). The static client stays in `index.html`, `css/`, `js/`, `assets/`. How the layers connect: [ARCHITECTURE.md](../ARCHITECTURE.md).

Keys stay in [`js/config.js`](../js/config.js). This folder is schema and the Open Graph function only. The committed config file is empty so the app keeps the localStorage path until you paste values.

## Once you have a project

1. Copy [`js/config.example.js`](../js/config.example.js) over `js/config.js` if needed, then paste **Project URL** and the **anon / publishable** key. Never paste `service_role`.
2. Authentication → Providers: enable Google, Apple, and Anonymous. Add this site's origin as a redirect URL (`http://localhost:8080` and the production origin).
3. Run the SQL in `migrations/20260820140000_scraps_media_realtime.sql` (SQL editor or `supabase db push`).
4. Deploy the function: `supabase functions deploy og-preview`.
5. Reload the app. Apple / Google use OAuth. Browse uses anonymous auth. Scraps and media sync per signed-in user. Existing `myscrap.scraps` on this device copy once if the remote list is empty.

Until `js/config.js` has a real URL and key, the app keeps the on-device `localStorage` path. Placeholder strings that contain `YOUR_` also stay on the local path.
