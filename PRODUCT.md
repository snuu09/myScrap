# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React (TypeScript), Tailwind, Lucide. Firebase Hosting serves the SPA. Claude classify is the Supabase Edge Function `analyze` (Firebase and Netlify `/api/analyze` twins stay unused on Spark). Supabase is Auth (email/password, Google, and 둘러보기), Postgres `public.scraps`, and private Storage `scrap-media`. Layers: [ARCHITECTURE.md](ARCHITECTURE.md).

## Users

[Confirmed] Knowledge workers, creators/students, and personal users can all use it. Primary target is personal users: people collecting things they saw on the web, photos, and files into one place. Voice, empty states, login, and list should feel like a personal capture box, not a team knowledge base or research lab. Primary scene: a phone or laptop, paste-or-drop into one capture box, then scan a recency-sorted list.

## Product Purpose

MyBrary is a web service that automatically tags and categorizes scraps. Success is: paste or attach anything once, see the right media-type tags and a usable preview, then find it again in a recency list. Korean and English are first-class.

## Positioning

One capture surface that inspects what you pasted (text, image, video, audio, URL, document) and returns type tags plus a usable preview when the media can render. Neighboring notes apps store blobs; this product classifies and shows them. The product concept is a personal **서재** (library), not a fridge, door, or “책장을 연다” metaphor.

## Operating Context

Today (shipped):

- First visit: intro on Theme B warm paper (or Editorial · A / 현무암 if chosen). Integrated hero demo: 담기 → AI 분석 → 정리 → 서재. Header **로그인** opens the auth sheet on a **chooser** (Google / email / 둘러보기); email path keeps Auth Ladder fields, **회원가입** confirm password, and Auth Recovery. Intro CTA is **내 서재로** / Enter my library. Settings are `/settings`, not a sheet: account, appearance, and storage as three paper cards. Leave sits at the bottom of the account card.
- A saved session skips intro and opens the library (`ShelfReveal` once per session). Leave returns to intro.
- After entry: recency list; Stick is a **floating** compact composer (not in the legal Footer). Composer send label is **분류하기**. Composer has a + menu with scrim (clipboard, camera on mobile, photo pick, file attach) and drag-and-drop. Classify draft is `/stick` (dock and + hidden) while Claude runs; a missing classify function is not the same message as a real MIME fallback. URL scraps also fetch OG. List metadata paints before image signed URLs hydrate in batch. Header **대시보드** opens the scrap dashboard. Header search capsule opens **`/search`**, and collapses to an icon on a narrow screen so the header stays one row. The logo stays on every screen; off the library an arrow sits to its left. Type filter is a horizontal **type book carousel**. Slim list-tools keeps gallery (default), list, and accordion (type groups) as layout options. **일자별** (calendar icon), query, and stored tag chips live on **`/search`**. A dashboard day opens `/search?day=`. The library and search lists page in (24, then more on scroll) instead of mounting every card. Zero-count types are hidden. Row tap opens **`/scrap/:id`** detail (arrow beside the logo, edit title/memo/tags, share only when URL exists, bookmark, read, remind, tags → `/search?q=`, faded neighbor peeks on the sides, history and related pages under the page, tag counts on detail chips). Bookmarked rows show a corner ribbon. Look **서재** (library) swaps scrap/peel copy to page / remove-from-library wording. Free and standard tiers see an ad slot below list-tools.
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
- Auto-tag pasted/dropped content by type: text, image, video, audio, link, document extension (Claude via Supabase function `analyze`, MIME/URL fallback).
- Classify-then-save draft (type, tags, Claude summary/analysis, memo, preview) before the item hits the recency list. Account file drafts upload to Storage for Claude, then remove that object if the draft is cancelled. Detail **AI 분석** re-runs classify and persists summary/analysis.
- A new **분류하기** (Stick send), paste, or drop replaces an open classify draft without confirm; only Cancel asks to discard.
- Image: show the image when a signed URL exists.
- + menu: clipboard, camera (mobile), photo, file.
- Placeholder: "붙여넣기 할 내용이나 파일을 첨부해주세요."
- Drag-and-drop analyzes dropped files.
- Recency-sorted tagged list; empty state; scroll-to-top FAB.
- Header color theme: **Warm · B** (Theme B warm paper + `#95704b`), **Editorial · A** (Theme A white/ink + Space Grotesk/Inter), **현무암** (basalt magnet on warm paper). Look glass|library (default glass; a stored fridge reads as glass) remaps enamel tokens only in library. Language, Look, palette, appearance, and Leave sit on `/settings`.
- Type book carousel on the library. **`/search`** finds by query, type, **일자별**, and stored tags (any selected tag matches). The list pages in as you scroll. Zero-count type books are hidden. Peel from the list or detail page. Detail actions: open link, share (URL only), edit (title/memo/tags), bookmark, read/unread, remind (foreground Notification once). List bookmark is a corner ribbon; unread stays a magnet dot.
- Plan tiers (policy only, no payment; UI labels Free / Middle / High): Free (14-day trial, 100MB, 1 file/stick, ads), Middle (500MB, 3 files/stick, ads, remind), High (1GB, unlimited batch, no ads, remind). Admin is unlimited storage. Bundle + history compare/revert are shown as High-only on `/upgrade` but not gated in product code yet. Trial expiry keeps the Stick composer open and sends classify attempts to `/upgrade`. Settings shows tier + link to `/upgrade`. Upload blocked after trial or over quota. Settings **DB 초기화** clears that account’s scraps and media only (profiles stay); for 둘러보기 it clears this device instead.
- Supabase: email/password Auth, **Google**, **둘러보기** (anonymous Auth), `scraps` (engagement + og) + `profiles` + private media bucket. Claude classify via the Supabase function `analyze` (MIME fallback if that function is down). URL OG via `og-preview`.
- **둘러보기 saves to this device.** Browse scraps go to `localStorage`, not `scraps`, and media stays inline as a data URL (1.5MB a file, about 4MB in total). The first local save opens a one-time notice sheet that says so. The library list does not repeat that line or a 계정 만들기 link.
- Browse data belongs to the browser, not the anonymous session: a new browse session on the same browser picks the same library back up, another browser or cleared history starts empty, and signing into a real account asks once whether to move the device's scraps over (per-plan quota applies; anything it cannot take stays local).

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
- Voice: personal 서재 / library, not a team knowledge base, research lab, fridge, or door. Functional Korean/English UI copy; user-supplied placeholder and empty-state strings are binding.
- Color themes: Warm · B (default), Editorial · A (compare), 현무암 (accent only). Light and dark modes are required. A celadon AI surface is not in this SPA.

## Evidence on Hand

No real user content, brand assets, or Open Graph corpus. Demonstration scraps must be labeled synthetic. Do not invent customers, accuracy claims, or pricing.

## Product Principles

1. Capture first: the composer is the product, not a settings-heavy library.
2. Show the thing: every type gets a real preview, not a generic file icon if media can render.
3. Recency over folders: newest tagged items lead until the user asks otherwise (type, tag, search, and a day on the calendar).
4. Same job on phone and desktop: camera appears only where it exists; everything else stays reachable.
5. Language is a switch, not a fork: KO/EN share one layout.

## Accessibility & Inclusion

[Inferred] Keyboard access to composer, + menu, `/settings`, 로그인 sheet, list, and language switch. Visible focus. WCAG AA contrast. Honor `prefers-reduced-motion`. Camera control is mobile-only and must not appear as a dead desktop action. Motion and pointer rules: [DESIGN.md](DESIGN.md).
