# myScrap

Personal capture box for things you saw on the web, photos, and files. Static HTML, CSS, and JS. No build step.

Shipped vs next: [ROADMAP.md](ROADMAP.md). Product and design: [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md). Folders and layers: [ARCHITECTURE.md](ARCHITECTURE.md).

## Open

Fastest:

```bash
open index.html
```

Or, from this folder, a local server (better for PDF.js and some Open Graph fetches):

```bash
python3 -m http.server 8080
```

Then visit [http://localhost:8080](http://localhost:8080).

## Project structure

Typical static web tree. No bundler, no `src/` vs `public/` split. See [ARCHITECTURE.md](ARCHITECTURE.md).

```
index.html     view
css/           styles
js/            config, backend, storage, services, app
assets/        favicon
supabase/      migrations, Edge Functions (optional until keys are set)
```

## Use

1. Pick Apple ID, Google, or Browse. With empty [`js/config.js`](js/config.js), these stay on this device (demo session). After you paste a project URL and anon key, Apple/Google use OAuth and Browse uses anonymous auth. See [`supabase/README.md`](supabase/README.md).
2. Paste text or a URL, drop a file, or use **+** (clipboard, camera on phones, photo, file).
3. Confirm the type tags in the preview, then save. Items land newest-first. Search, type chips, and tag filters sit above the list.
4. KO / EN and light / system / dark in the header. Theme follows the system until you pick light or dark. You can return to system. Language and theme are remembered on this device.

## What is demo vs real

- **Auth:** demo on this device until `js/config.js` has a real URL and anon key. Then Apple / Google are OAuth and Browse is anonymous. Never put `service_role` in the browser. Copy from [`js/config.example.js`](js/config.example.js).
- **Tagging:** real, client-side (MIME, URL, file extension, Open Graph). No remote AI.
- **Open Graph:** signed-in Supabase users try the `og-preview` Edge Function first. Otherwise microlink, then corsproxy / allorigins. If they fail, hostname and path still show.
- **Storage:** without keys, scraps persist in `localStorage` on this browser. Large video/audio may stay session-only if quota is tight. With keys and a signed-in user, rows go to `public.scraps` and files to private bucket `scrap-media`.

## Limits

- Filling API keys, enabling providers, and deploying the Edge Function are operator steps (see [`supabase/README.md`](supabase/README.md)). The committed `js/config.js` is empty on purpose.
- PDF first-page preview needs pdf.js from cdnjs and works best over `http://localhost`.
- Office files (docx, pptx, hwp, …) get extension tags and a filename slip, not a full page render.
- Some sites block OG images or proxy fetches (CORS).
- Camera appears on coarse pointers or viewports under 721px.
