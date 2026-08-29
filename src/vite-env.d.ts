/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ADMOB_PUBLISHER_ID: string;
  readonly VITE_ADMOB_BANNER_SLOT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
