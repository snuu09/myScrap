# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

static HTML / CSS / JS (user-specified; no framework, no build step). Layout is a typical site tree: `index.html`, `css/`, `js/`, `assets/`, plus `supabase/` for optional auth, Postgres, Storage, and the OG function. Layers and load order: [ARCHITECTURE.md](ARCHITECTURE.md).

## Users

[Confirmed] Knowledge workers, creators/students, and personal users can all use it. Primary target is personal users: people collecting things they saw on the web, photos, and files into one place. Voice, empty states, login, and list should feel like a personal capture box, not a team knowledge base or research lab. Primary scene: a phone or laptop, paste-or-drop into one capture box, then scan a recency-sorted list.

## Product Purpose

myScrap is a web service that automatically tags and categorizes scraps. Success is: paste or attach anything once, see the right media-type tags and a usable preview, then find it again in a recency list. Korean and English are first-class.

## Positioning

One capture surface that inspects what you pasted (text, image, video, audio, URL, document) and returns type tags plus the matching preview (Open Graph for links, page preview for documents, hover-play for video/audio). Neighboring notes apps store blobs; this product classifies and shows them.

## Operating Context

- First visit: sign-in (Apple / Google) or browse without account.
- After entry: chat-like composer with + menu (clipboard, camera on mobile, photo pick, file attach), drag-and-drop on the input, tagged list below.
- Empty list copy: "항목이 없습니다."
- List order: newest first.
- Scroll-to-top FAB when not at the top.

## Capabilities and Constraints

Work order and checkboxes: [ROADMAP.md](ROADMAP.md). Phase 1 (tech debt), Phase 2 (UI/UX), and Phase 3 (Supabase wiring) are in the client. API keys are filled later in [`js/config.js`](js/config.js); empty config keeps the on-device path.

### Shipped

Confirmed from brief and implemented in this static client:

- Responsive HTML/CSS/JS; header, main, footer.
- i18n: Korean, English.
- Auto-tag pasted/dropped content by type: text, image, video, audio, link, document extension.
- Classify-then-save draft (type, tags, memo, preview) before the item hits the recency list.
- Link: Open Graph preview and basic site info.
- Link drafts show an on-device phishing-risk meter (URL shape only). Compact mark on saved link scraps.
- Image: show the image.
- Video: thumbnail; play on hover.
- Audio: thumbnail; play on hover.
- Document: tag by extension; page preview (PDF first page; text excerpt; Office/HWP filename slip).
- + menu: clipboard, camera (mobile), photo, file.
- Placeholder: "붙여넣기 할 내용이나 파일을 첨부해주세요."
- Drag-and-drop analyzes dropped files.
- Recency-sorted tagged list; empty state; scroll-to-top FAB.
- Missing-media slip when quota or session-only files lose bytes.
- Unsaved draft warning; composer auto-grow; light / system / dark.
- Edit a saved scrap (type, tags, memo).
- Type chips, tag click-to-filter, light search.
- Image lightbox; copy URL / save file when media is stored; two-step peel.
- Supabase adapter (`MyScrapBackend`): OAuth / anonymous auth, `scraps` + private media bucket, last-write-wins sync, one-time local migrate, OG Edge Function. Inactive until `js/config.js` has a real URL and anon key.

[Inferred] Tagging and previews still run in the browser (MIME, URL, Open Graph fetch, object URLs). No paid AI API. With empty config, Apple/Google buttons are UI flows that enter the app (demo auth) and data persists in localStorage on this device. After keys, the same UI talks to Supabase; language and theme stay local.

Phase 1 tech debt, Phase 2 UI/UX, and Phase 3 wiring are implemented. See [ROADMAP.md](ROADMAP.md) and [supabase/README.md](supabase/README.md).

### Operator follow-up (keys, not code)

Create a Supabase project, enable Google / Apple / Anonymous, apply `supabase/migrations`, deploy `og-preview`, paste URL + anon key into `js/config.js`. Never put `service_role` in the browser.

Server-side AI tagging stays optional.

## Brand Commitments

- Product name: myScrap (repository).
- Voice: personal capture box, not a team knowledge base or research lab. Functional Korean/English UI copy; user-supplied placeholder and empty-state strings are binding.
- Main color: Jeju tangerine (hallabong) magnet by default. 현무암 swaps that accent to Jeju basalt. Light and dark modes are required.

## Evidence on Hand

No real user content, brand assets, or Open Graph corpus. Demonstration scraps must be labeled synthetic. Do not invent customers, accuracy claims, or pricing.

## Product Principles

1. Capture first: the composer is the product, not a settings-heavy library.
2. Show the thing: every type gets a real preview, not a generic file icon if media can render.
3. Recency over folders: newest tagged items lead until the user asks otherwise.
4. Same job on phone and desktop: camera appears only where it exists; everything else stays reachable.
5. Language is a switch, not a fork: KO/EN share one layout.

## Accessibility & Inclusion

[Inferred] Keyboard access to composer, + menu, list, and language switch. Visible focus. WCAG AA contrast. Honor `prefers-reduced-motion` for hover-play and view motion. Camera control is mobile-only and must not appear as a dead desktop action. Motion and pointer rules: [DESIGN.md](DESIGN.md).
