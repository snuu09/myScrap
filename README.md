# myScrap

Personal capture box for things you saw on the web, photos, and files. Static HTML, CSS, and JS. No build step.

Shipped vs next: [ROADMAP.md](ROADMAP.md). Product and design: [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md).

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

## Use

1. Pick Apple ID, Google, or Browse. These are demo sign-ins. Nothing talks to Apple or Google.
2. Paste text or a URL, drop a file, or use **+** (clipboard, camera on phones, photo, file).
3. Confirm the type tags in the preview, then save. Items land newest-first. Search, type chips, and tag filters sit above the list.
4. KO / EN and light / system / dark in the header. Theme follows the system until you pick light or dark. You can return to system. Language and theme are remembered on this device.

## What is demo vs real

- **Auth:** demo only. Buttons enter the app and store a session in `localStorage`. Real Apple / Google and sync are Phase 3 (Supabase). See [ROADMAP.md](ROADMAP.md).
- **Tagging:** real, client-side (MIME, URL, file extension, Open Graph). No remote AI.
- **Open Graph:** real fetch through public proxies (microlink, then corsproxy / allorigins). If they fail, hostname and path still show.
- **Storage:** scraps persist in `localStorage` on this browser. Large video/audio may stay session-only if quota is tight.

## Limits

- No accounts, sync, or real OAuth (planned last, via Supabase).
- PDF first-page preview needs pdf.js from cdnjs and works best over `http://localhost`.
- Office files (docx, pptx, hwp, …) get extension tags and a filename slip, not a full page render.
- Some sites block OG images or proxy fetches (CORS).
- Camera appears on coarse pointers or viewports under 721px.
