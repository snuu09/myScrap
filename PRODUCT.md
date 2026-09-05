# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React (TypeScript), Tailwind, Lucide. Firebase Hosting serves the SPA; `/api/analyze` is a Cloud Function (Netlify Function still exists as a twin). Supabase is Auth (email/password, Google, and 둘러보기), Postgres `public.scraps`, and private Storage `scrap-media`. Layers: [ARCHITECTURE.md](ARCHITECTURE.md).

## Users

[Confirmed] Knowledge workers, creators/students, and personal users can all use it. Primary target is personal users: people collecting things they saw on the web, photos, and files into one place. Voice, empty states, login, and list should feel like a personal capture box, not a team knowledge base or research lab. Primary scene: a phone or laptop, paste-or-drop into one capture box, then scan a recency-sorted list.

## Product Purpose

MyBrary is a web service that automatically tags and categorizes scraps. Success is: paste or attach anything once, see the right media-type tags and a usable preview, then find it again in a recency list. Korean and English are first-class.

## Positioning

One capture surface that inspects what you pasted (text, image, video, audio, URL, document) and returns type tags plus a usable preview when the media can render. Neighboring notes apps store blobs; this product classifies and shows them.

## Operating Context

Today (shipped):

- First visit: intro on porcelain peach / night kitchen. Hero plus stick / classify / find hotspots. Header **로그인** opens the auth sheet on a **chooser** (Google / email / 둘러보기); email path keeps Auth Ladder fields, **회원가입** confirm password, and Auth Recovery. Intro hero keeps **책장을 연다** only. Settings stay a sheet (language, Look fridge|library, palette, theme, Leave).
- A saved session skips intro and opens the door (`ShelfReveal` once per session). Leave returns to intro.
- After entry: recency list and search; Stick is a **floating** compact composer (not in the legal Footer). Composer has a + menu with scrim (clipboard, camera on mobile, photo pick, file attach) and drag-and-drop. Classify draft appears **above** the composer pill, with a skeleton while Claude (or the MIME fallback) runs; URL scraps also fetch OG. List metadata paints before image signed URLs hydrate in batch. Header **통계** opens the scrap dashboard. **일자별** chip filters the list by local day. Type chips omit zero-count types. Shelf layout toggle: **리스트 / 갤러리** (device preference). Row tap opens **`/scrap/:id`** detail (Library back icon, edit title/memo/tags, share only when URL exists, bookmark, read, remind, tags → `/?q=`, neighbor previews **below** peel). Bookmarked rows show a corner ribbon. Look **책장** (default) swaps scrap/peel copy to page / take-off-shelf wording. Free and standard tiers see an ad slot below list-tools.
- Footer on intro and app: 이용약관, 개인정보처리방침, operator placeholders (표시 예정 until filled).
- Empty list copy: "항목이 없습니다."
- List order: newest first.
- Scroll-to-top FAB when not at the top.

## Capabilities and Constraints

Work order and checkboxes: [ROADMAP.md](ROADMAP.md). Env vars live in `.env` locally and are baked into the Hosting build. Empty Vite keys keep the intro, but scraps cannot be written.

### Shipped

Confirmed from brief and implemented in the Vite SPA:

- Responsive React UI; header, main, footer.
- i18n: Korean, English.
- Auto-tag pasted/dropped content by type: text, image, video, audio, link, document extension (Claude at `/api/analyze`, MIME/URL fallback).
- Classify-then-save draft (type, tags, memo, preview) before the item hits the recency list. Account file drafts upload to Storage for Claude, then remove that object if the draft is cancelled.
- A new Stick, paste, or drop replaces an open classify draft.
- Image: show the image when a signed URL exists.
- + menu: clipboard, camera (mobile), photo, file.
- Placeholder: "붙여넣기 할 내용이나 파일을 첨부해주세요."
- Drag-and-drop analyzes dropped files.
- Recency-sorted tagged list; empty state; scroll-to-top FAB.
- Header color theme: 기본 (tangerine magnet), 현무암 (basalt magnet). Look fridge|library (default library) remaps enamel tokens. Language, Look, palette, appearance, and Leave sit in a header settings sheet.
- Type chips, search, and **일자별** day filter (AND). Zero-count type chips are hidden. Peel from the list or detail page. Detail actions: open link, share (URL only), edit (title/memo/tags), bookmark, read/unread, remind (foreground Notification once). List bookmark is a corner ribbon; unread stays a magnet dot.
- Plan tiers (policy only, no payment): free (14-day trial, 100MB, ads), standard (1GB, ads), premium/admin (unlimited, no ads). Settings shows tier, trial D-day, storage bar (layout reserved while loading). Upload blocked after trial or over quota. Settings **DB 초기화** clears that account’s scraps and media only (profiles stay); for 둘러보기 it clears this device instead.
- Supabase: email/password Auth, **Google**, **둘러보기** (anonymous Auth), `scraps` (engagement + og) + `profiles` + private media bucket. Claude classify via `/api/analyze` (MIME fallback if the function is down). URL OG via `og-preview`.
- **둘러보기 saves to this device.** Browse scraps go to `localStorage`, not `scraps`, and media stays inline as a data URL (1.5MB a file, about 4MB in total). The first local save opens a one-time notice sheet that says so. The shelf keeps a quiet banner with a 계정 만들기 link.
- Browse data belongs to the browser, not the anonymous session: a new browse session on the same browser picks the same shelf back up, another browser or cleared history starts empty, and signing into a real account asks once whether to move the device's scraps over (per-plan quota applies; anything it cannot take stays local).

[Inferred] Language, Look, theme, and palette stay local. Account scraps never write without a signed-in user (email or Google); 둘러보기 writes to this device only.

See [ROADMAP.md](ROADMAP.md) and [supabase/README.md](supabase/README.md).

### Operator follow-up (keys, not code)

Create a Supabase project, enable Email and Google auth, apply `supabase/migrations`, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` before `npm run build`. Set `ANTHROPIC_API_KEY` (and `SUPABASE_URL` / `SUPABASE_ANON_KEY`) on the Cloud Function or Netlify. Never put `service_role` in Vite.

### Operator identity (not code)

Empty operator fields render as 표시 예정 / To be shown. Do not invent a 사업자등록번호.

### Later (not a numbered phase yet)

Folder tree, share/export, account settings beyond 나가기, payment integration (Stripe/PG), Apple OAuth, celadon AI palette.

## Brand Commitments

- Product name: MyBrary (repository folder may still be myScrap).
- Voice: personal capture box, not a team knowledge base or research lab. Functional Korean/English UI copy; user-supplied placeholder and empty-state strings are binding.
- Main color: Jeju tangerine (hallabong) magnet by default. 현무암 swaps that accent to Jeju basalt. Light and dark modes are required. A celadon AI surface is not in this SPA.

## Evidence on Hand

No real user content, brand assets, or Open Graph corpus. Demonstration scraps must be labeled synthetic. Do not invent customers, accuracy claims, or pricing.

## Product Principles

1. Capture first: the composer is the product, not a settings-heavy library.
2. Show the thing: every type gets a real preview, not a generic file icon if media can render.
3. Recency over folders: newest tagged items lead until the user asks otherwise (type, tag, search, and a day on the calendar).
4. Same job on phone and desktop: camera appears only where it exists; everything else stays reachable.
5. Language is a switch, not a fork: KO/EN share one layout.

## Accessibility & Inclusion

[Inferred] Keyboard access to composer, + menu, settings sheet, 로그인 sheet, list, and language switch. Visible focus. WCAG AA contrast. Honor `prefers-reduced-motion`. Camera control is mobile-only and must not appear as a dead desktop action. Motion and pointer rules: [DESIGN.md](DESIGN.md).
