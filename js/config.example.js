/**
 * Copy to js/config.js and paste the project URL plus the publishable (anon) key.
 * Never put the service_role secret in this file or in the browser.
 *
 * Dashboard: Project Settings → Data API (URL) and API Keys (anon / publishable).
 * Also enable Google, Apple, and Anonymous under Authentication → Providers,
 * then apply supabase/migrations and deploy supabase/functions/og-preview.
 */
(function (global) {
  global.MyScrapConfig = {
    supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
    supabaseAnonKey: "YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY",
  };
})(window);
