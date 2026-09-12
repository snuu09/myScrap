import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@netlify/vite-plugin";

export default defineConfig(({ mode }) => {
  // Local Netlify functions run in workers that inherit process.env; Vite only
  // exposes VITE_* to the client, so load the full .env for /api/analyze.
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  return {
    plugins: [react(), tailwindcss(), netlify()],
  };
});
