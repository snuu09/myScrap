---
name: MyBrary
description: Personal library from anything you save. Soft Deckle light default; Editorial compare palette.
colors:
  magnet: "#95704b"
  magnet-deep: "#7a5a3c"
  magnet-ink: "#fbfaf7"
  enamel: "#f5f1e9"
  enamel-deep: "#f2eee7"
  enamel-ink: "#e9dfd1"
  gasket: "#777168"
  gasket-soft: "#d9d1c5"
  ink: "#272521"
  ink-soft: "#4a4640"
  muted: "#777168"
  paper: "#fbfaf7"
  photo-mat: "#fbfaf7"
  manila: "#d8c7ad"
  manila-ink: "#5c4520"
  disc: "#272521"
  danger: "#b44532"
  login-wall: "#fbfaf7"
  kitchen-wall: "#f5f1e9"
  kitchen-lo: "#f2eee7"
  hairline: "color-mix(in srgb, var(--ink) 12%, transparent)"
  dark-magnet: "#c4a07a"
  dark-enamel: "#302b26"
  dark-kitchen: "#2a2622"
  dark-kitchen-lo: "#1f1c19"
  dark-muted: "#c5b8a8"
  dark-ink: "#f4eee6"
  basalt: "#3a3936"
  basalt-deep: "#2a2a28"
  basalt-ink: "#f4f3f0"
  dark-basalt: "#c8c6c1"
  dark-basalt-deep: "#dddcd8"
  dark-basalt-ink: "#1c1c1a"
  celadon: "#1f6b58"
  celadon-deep: "#175446"
  celadon-ink: "#f4fbf8"
  celadon-wall: "#f4f6f5"
  celadon-wall-lo: "#e8eeeb"
  dark-celadon: "#7ecfb8"
  dark-celadon-deep: "#a6e0d0"
  dark-celadon-ink: "#0e241c"
  dark-celadon-wall: "#1e2522"
  dark-celadon-wall-lo: "#161c1a"
typography:
  display:
    fontFamily: "Newsreader, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.5rem, 1.15rem + 1.5vw, 1.75rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  display-hero:
    fontFamily: "Newsreader, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2rem, 1.4rem + 3vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Newsreader, Georgia, 'Times New Roman', serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "DM Sans, SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "DM Sans, SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  ui:
    fontFamily: "DM Sans, SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  caption:
    fontFamily: "DM Sans, SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.01em"
  micro:
    fontFamily: "DM Sans, SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.01em"
icons:
  sm: "18px"
  md: "22px"
  lg: "24px"
controls:
  tag: "26px"
  chip: "34px"
  sm: "40px"
  md: "48px"
rounded:
  xs: "10px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  pill: "999px"
  full: "50%"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "22px"
  gutter: "clamp(16px, 4vw, 40px)"
components:
  button-primary:
    backgroundColor: "{colors.magnet}"
    textColor: "{colors.magnet-ink}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
    height: "{controls.md}"
    fontSize: "{typography.ui.fontSize}"
  button-primary-hover:
    backgroundColor: "{colors.magnet-deep}"
    textColor: "{colors.magnet-ink}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
    height: "{controls.md}"
  button-cta:
    backgroundColor: "{colors.magnet}"
    textColor: "{colors.magnet-ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "{controls.md}"
    fontSize: "{typography.ui.fontSize}"
  button-cta-hover:
    backgroundColor: "{colors.magnet-deep}"
    textColor: "{colors.magnet-ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "{controls.md}"
  button-apple:
    backgroundColor: "#3a342e"
    textColor: "#faf6f0"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "{controls.md}"
  button-google:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "{controls.md}"
  button-icon:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0px"
    size: "{controls.md}"
    height: "{controls.md}"
    width: "{controls.md}"
    icon: "{icons.md}"
  input-composer:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "12px 10px"
    height: "{controls.md}"
    fontSize: "{typography.ui.fontSize}"
  chip-tag:
    backgroundColor: "{colors.magnet}"
    textColor: "{colors.magnet-ink}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "{controls.tag}"
    fontSize: "{typography.caption.fontSize}"
  chip-filter:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "{controls.chip}"
    fontSize: "{typography.caption.fontSize}"
  scrap-clipping:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px"
---

# Design System: MyBrary

## Overview

**Creative North Star: Soft Deckle archival library (서재)**

MyBrary is a personal **서재** (library) built from anything the user saves (text, links, video, files, images). Product voice stays on library language. Do not use door, fridge, or “책장을 연다” copy.

Light default follows **Soft Deckle** (`data-palette="deckle"`): zero-hue archival paper, near-black ink-only magnet, **Newsreader** display + **DM Sans** UI (SUIT Hangul fallback), **JetBrains Mono** for spine labels, near-flat radius (6–8px). Dark Soft Deckle is near-black paper (`#121214`). `/login` folio uses mono **AI BOOKSHELF**; the signed-in header wordmark has no subtitle.

Settings also ships **에디토리얼** / Minimal Editorial (`data-palette="editorial"`): white ground, ink `#09090b`, Space Grotesk display + Inter UI, near-zero radius. Inter and Space Grotesk are allowed only under Editorial.

Warm · B and 현무암 are retired from the Settings theme picker; stored `warm` / `kitchen` / `basalt` migrate to Soft Deckle.

Product promise:

> 내가 모은 모든 것이 나만의 서재가 됩니다.

Auth entry is the dedicated `/login` page. Stick / classify / find remain the live capture loop. Dark Soft Deckle stays near-black archival paper; Editorial dark is near-black ink ground.

## Colors

Archival Soft Deckle neutrals (ink-only magnet) plus Editorial white/ink as the compare palette. Legacy Theme B warm paper tokens may remain in CSS `@theme` as unused root fallbacks; the app always sets `data-palette` to `deckle` or `editorial`.

- **Soft Deckle magnet**: near-black ink on archival paper; no hue wash.
- **Editorial ink** (#09090b): Primary actions under Editorial.
- **Paper / surface**: Soft Deckle archival cream (`#faf9f6` family) or Editorial white.
- **Ink / muted**: Soft Deckle near-black / gray; Editorial zinc scale.

**Key Characteristics:**
- Wordmark: MyBrary (KO and EN)
- Soft Deckle light ground; Editorial white when that palette is on
- Header account avatar opens `/settings`
- Centered capture column on every breakpoint
- Soft Deckle near-flat radius; Editorial near-zero
- Recency list to read; Stick docked at the thumb
- Personal voice: stick, peel, 서재 / library

### Palettes

Header: brand, Find, notices bell (→ `/notices` history), account avatar. Language, **테마** (에디토리얼 / 소프트 데클), and light / system / dark live on `/settings` (appearance changes use a short View Transition / fade). No Look switcher and no AI-sensitivity control in Settings.

- Soft Deckle (default): Zero-hue archival paper, JetBrains Mono for spine/mono labels, near-flat radius. Login folio **AI BOOKSHELF**.
- Editorial: Theme A Minimal Editorial. White/ink, Space Grotesk + Inter, near-zero radius.
- Warm · B / 현무암 / AI celadon: Not offered in Settings.

### Named Rules
**The One Magnet Rule.** One accent at a time. It marks the thing you can press or the tag that names a type. It does not wash backgrounds.

**The Two Magnets Rule.** Soft Deckle and Editorial each own one ink magnet. Sample photo SVGs must read `--magnet` at paint time; do not bake old tangerine `#e56f0a`.

**The Look Axis Rule.** Prefs may still carry `data-look` = `glass` | `library` for CSS/copy (default glass). Settings no longer exposes a Look switcher. When Look is **library** (서재), UI copy swaps unit nouns (KO 조각→페이지, 떼어내기→서재에서 빼기; EN scrap→page, peel→remove from library) via `useT` / `t(..., look)`. Storage usage strings always use 페이지/pages.

**The Stick Dock Rule.** After sign-in, Stick is a **fixed floating composer** over the library list (ChatGPT-style), not part of the legal Footer. Library route hides Footer; intro/legal/dashboard keep Footer. Default layout is one compact row `[+][textarea][send]` (`composer-chat-row`); the field grows downward on focus or multiline (cap 160px) with the bar pinned under it. **+** opens an attached menu with a portaled ink+blur viewport scrim; ESC / scrim closes it. Opening Auth or Settings dispatches `mybrary:close-overlays` so only one job is open. Classify draft stacks **above** the pill inside the float. Soft enamel fade sits behind the float. Do not put the composer back above the list or glue it to the footer chrome.

**The AI Comparison Rule.** Celadon editorial is not shipped. Do not add header **AI** in this client unless PRODUCT asks. It must not become a purple chat or zinc-blue SaaS skin.

**The White Doorstep.** Auth is the dedicated `/login` page (Soft Deckle archival dossier; Editorial white when that palette is on). Dark intro is not a white flash.

**The Cave Check.** Soft Deckle light ground stays archival paper. Dark Soft Deckle is `#121214`, not toner-black UI chrome. Editorial uses white / near-black instead. Muted copy must stay AA on the ground (≥4.5:1).

## Type, icon, and control pattern

Closed scales. Do not invent a one-off size.

### Type (`--text-*`)

| Token | Size | Use |
| --- | --- | --- |
| display | clamp 1.5–1.75rem | Intro scene titles; empty title companion |
| display-hero | clamp 2–3rem | Intro hero only. Do not reuse in the app door. |
| headline | 1.125rem (18px) | Wordmark, empty title |
| title | 1.0625rem (17px) | Link/doc titles, draft detect |
| body | 1rem (16px) | Notes, page default |
| ui | 0.9375rem (15px) | Buttons, composer, search, hints |
| caption | 0.8125rem (13px) | Chips, tags, session, footer, labels |
| micro | 0.75rem (12px) | Timestamps, file excerpts, play badge |

Body is 16px / 1.5. UI copy on controls is 15px so Hangul still fits in 48px. 12px is timestamps only.

### Icons (`--icon-*`)

| Token | Size | Use |
| --- | --- | --- |
| sm | 18px | Theme glyphs, menu items, peel/edit, magnet disc, brand mark |
| md | 22px | + button, lightbox close |
| lg | 24px | FAB |

The glyph is smaller than the hit target.

### Controls (`--control-*`)

| Token | Height | Use |
| --- | --- | --- |
| tag | 26px | Clipping type tags |
| chip | 34px | Type chips, draft tags |
| sm | 40px | KO/EN, theme, + menu rows, peel/edit |
| md | 48px | Composer row, Stick, +, search, auth, FAB, draft save |

Auth, Stick, and + share 48px so the door and the header auth sheet feel like one system.

## Typography

**Display Font:** Newsreader (Georgia fallback)
**Body / UI Font:** DM Sans (SUIT / Apple SD Gothic Neo / Noto Sans KR fallback for Hangul)
**Label/Mono Font:** ui-monospace for file excerpts only

**Character:** Warm editorial display with a clean UI grotesque. Newsreader carries the hero promise; DM Sans carries chrome, buttons, tags, and body.

### Named Rules
**The Two Face Rule.** Under Soft Deckle: Newsreader for hero/display; DM Sans for UI and body. Under Editorial only: Space Grotesk for display; Inter for UI. Do not use Inter or Space Grotesk as the Soft Deckle face. Do not revive tangerine fridge enamel as the light ground.

## Layout

Header, door (main), footer. Signed out: compact header is brand and 로그인 (navigates to the dedicated `/login` page, not a sheet). Signed in: header carries two nav tabs — **나의 서재** `/`, **서재 통계** `/dashboard` (i18n `navLibrary`/`navStats`) — plus a Find icon (**장서 탐색** / `searchOpen`, also `Cmd/Ctrl+K` → `/search`), a personal notices bell (onboarding prefs tip once; Free/browse period; storage; browse always shows period + capacity; panel always links to `/notices` for history with icon-only mark-all / clear; unread outline+ink vs read muted; open state uses a blurred page scrim), and an account avatar that opens `/settings`. Appearance (light / system / dark) lives only on `/settings` and cross-fades on change. The door is the canvas. App content columns use **base `min(100%, 88rem)`** (shelf, dashboard, search, notices, settings, legal, upgrade). Exceptions: `/login`, scrap detail (`.dashboard-door--detail`), and the Stick floating composer (`.stick-float-inner`, `max-width: 40rem`). No 40rem content-column base. `PageChrome` is a `min-h-dvh` column with `#main { flex: 1 }` so short pages still pin the site footer to the viewport bottom. After entry, Stick is a fixed bottom dock; classify draft stacks above the field.

Intro is a Theme B integrated hero (담기 → AI 분석 → 정리 → 서재). The workspace loops as an in-page Soft Deckle promo film: longer stage dwells, crossfade/scale enters, per-stage micro-beats, and a stage scrubber under the step chips (no MP4). Legal routes `/terms` and `/privacy`, and plans route `/upgrade`, reuse the header/footer chrome with Newsreader titles and 서재 voice in the shared `min(100%, 88rem)` column.

Gutter is fluid (`clamp(16px, 4vw, 40px)`). Door padding is fluid so resize does not jump. Composer becomes two-row when the door is under 560px (container query). Fridge handle hides under 640px door width. Camera control appears under 721px or coarse pointer, including DevTools width resize.

## Elevation & Depth

Hybrid: the header auth sheet and clippings lift off warm paper with a soft, deep shadow. No neon glow.

### Shadow Vocabulary
- **Sheet** (`0 24px 70px rgba(55, 44, 31, 0.12)`): Header auth sheet and menus. Dark uses `rgba(0, 0, 0, 0.28)`.
- **Clipping** (`0 12px 32px rgba(55, 44, 31, 0.08)`): Paper on the shelf.
- **FAB** (`0 10px 22px` accent-tinted): Floating action.

### Named Rules
**The Offset Rule.** Shadows carry offset and blur. A colored halo is not depth.

**The Focus Follows Form Rule.** Every focusable control has a radius from the scale. The warm accent companion ring is `box-shadow` so it follows that radius. Composer shell stays `--radius-lg` (20px) so it sits with the control radius. Focus is that shell, not a square on the textarea, and not a pill that fights the inner buttons.

## Shapes

Soft squircles, not 90-degree stamps. Scale: 10 / 14 / 18 / 24 / 32, pills 999, discs 50%. Header auth sheet 32px. Composer 24px. Clippings and auth 18px. Stick and + 14px. Language, palette, and theme switches, search, and tags are pills. Magnets, FAB, and the header settings disc stay discs.

Slight clipping rotation (±0.45deg) on every third scrap is optional texture, not required fridge metaphor.

## Components

- **Auth stack:** Email and password in the header 로그인 sheet (32px radius). 48px controls, 15px label. Light sheet is `--login-wall` white. Inline validation under fields. Vertical order follows **The Auth Ladder Rule** (fields → primary → feedback → divider → Google → browse → toggle → find links). **Google로 계속** is tertiary (1px outline). **둘러보기** is secondary (2px magnet outline) on the sheet only. **회원가입** label (not 가입). No Apple. Reusable classes: `auth-btn-*`, `auth-link-*`, `auth-divider`, `auth-callout`, `auth-feedback-*` in [`src/index.css`](src/index.css).
- **Settings page:** `/settings`, not a header sheet. Follow **The Settings Ladder Rule**. Reusable classes: `.settings-arch-*`, `settings-section-*`, `settings-seg-*` in [`src/index.css`](src/index.css). Do not open together with the 로그인 sheet.
- **Palette switch:** Pill track for **에디토리얼** and **소프트 데클**. Lives on `/settings`. Default is Soft Deckle.
- **Theme switch:** Light, system, and dark magnets in a pill track, 40px cells, 18px glyphs. Also on `/settings`.
- **Composer:** Bottom dock after entry. 24px shell; 22px +; 15px field; Stick 48px / 14px. Focus ring follows the 24px shell, not a square on the textarea and not a pill.
- **Classify draft:** A new **분류하기**, paste, or drop replaces the open classify card in place (no confirm). Only Cancel asks to discard. Upload % sits inside the progress track.
- **+ menu:** 40px rows, 18px glyphs, hairline border.
- **Clipping:** Caption tags 13px / `--control-tag` 26px tall, peel 40px hits with 18px glyphs.
- **Search:** 48px capsule, 15px type. Type chips 34px / 13px.
- **Language magnets:** Pill switch, 40px cells, 13px KO/EN.
- **FAB:** 48px disc, 24px glyph.
- **Footer:** Soft Deckle multi-column site footer (brand lead + catalog / ops / support columns + copyright/legal pending line). Privacy stays easy to find in the ops column. Empty operator fields read 표시 예정.

States required: hover, focus-visible, disabled (Stick), loading (OG skeleton), error (OG fallback copy), empty ("항목이 없습니다." / English equivalent), pressed (`:active` scale), enter/exit for views.

### Auth sheet hierarchy

Binding for [`src/components/AuthSheet.tsx`](src/components/AuthSheet.tsx). One magnet-fill primary per screen.

**The Auth Ladder Rule.** Sheet opens on **chooser**: Google / email sign-in / browse (same `auth-btn-*` heights). Email path (`in` | `up`): (1) fields (signup adds confirm password), (2) primary submit, (3) success or error feedback directly under primary, (4) caption divider **또는** / **or**, (5) Google tertiary, (6) browse secondary when relevant, (7) ghost toggle (회원가입 ↔ 로그인), (8) ghost utility links (아이디 찾기 · 비밀번호 찾기). New password (`newPassword`): fields, primary save, feedback. No divider or OAuth on that screen.

**The Auth Recovery Rule.** 아이디 찾기 (`findId`) and 비밀번호 찾기 (`resetPassword`) share one layout. (1) sheet header: **auth-back-btn** (48px enamel square with ArrowLeft, aria **로그인으로**), title, close, (2) **Brief** block: lead then Google callout, (3) email field, (4) primary, (5) feedback under primary, (6) divider **또는** / **or**, (7) Google tertiary. No **로그인으로** text link. Back icon returns to login; X closes the sheet. No browse, no sign-up toggle on these screens. New password uses the same back control.

**The Recovery Brief Rule.** Lead is one ui line in ink-soft. Callout sits below lead with enamel fill and paper-line border so it reads as a notice, not an input. Body copy stays ink-soft at caption size. Only the **Google로 계속** phrase is magnet bold inside the sentence. Do not stack two magnet-fill buttons without the divider between email submit and Google.

**The Auth Button Tier Rule.**

| Tier | Height | Shape | Border | Font | Color |
| --- | --- | --- | --- | --- | --- |
| Primary | 48px | palette radius (`--radius-md`) | none | 15px bold | bg magnet, text magnet-ink; hover magnet-deep |
| Secondary | 48px | palette radius (`--radius-md`) | 2px magnet | 15px bold | bg paper, text ink |
| Tertiary | 48px | palette radius (`--radius-md`) | 1px paper-line | 15px semibold | bg paper, text ink |
| Ghost | min 40px hit | text | none | 13px caption | magnet (toggle) or ink-soft (utility / back) |

Disabled opacity 0.6. Pressed scale 0.98.

**The Auth Copy Rule.**

| Role | Token | Color |
| --- | --- | --- |
| Sheet title | title 17px bold | ink |
| Field label | caption 13px | muted |
| Field hint / inline error | micro 12px | muted / danger |
| Lead (find screens) | ui 15px | ink-soft |
| Google hint callout | caption 13px on enamel | ink-soft body; **Google로 계속** phrase magnet bold inline |
| Success feedback | caption 13px | ok |
| Error feedback | caption 13px | danger |
| Divider | caption 13px | muted |

12px is for hints and timestamps only. Leads use 15px for AA readability.

### Settings page hierarchy

Binding for [`src/components/SettingsSheet.tsx`](src/components/SettingsSheet.tsx).

**The Settings Ladder Rule.** Settings is the `/settings` page, opened from the header account avatar (not a nav tab). The arrow left of the logo returns to the previous screen (or `/` if there is none). The page hides the Stick dock and has no page-level settings title (section cards start immediately). Visiting Settings dismisses the one-time prefs onboarding notice. Logout uses Protocol Stamp `confirm`. Soft Deckle **archival section cards** (`.settings-arch-*`) with a display headline only (no `SECTION // 0N` stamp or EN side label). **01 Account:** one identity card — left: profile (session label above name; browse hides profile/password), trial gauge when applicable, combined usage `페이지 N개 (used / limit)` + gauge, action chips, logout pinned to the bottom of the account column; right: tier and upgrade CTA in one horizontal row, then two feature columns (지원 / 미지원 with Check/Minus). **02 Language & theme:** KO/EN and light·system·dark segs; theme paradigm cards for **소프트 데클** / **에디토리얼** only (dark is appearance mode, not a third palette) with fixed per-card swatches; live preview plate (spine label follows palette; plate uses live `data-theme`/`data-palette`). **03 Typography:** `readingScale` 13/15/17/19 (`mybrary.readingScale`, CSS `--reading-size`) for detail/memo/card blurbs; sample body binds inline to the selected px. **04 Storage:** browse = this-device local usage + reset; signed-in = account storage + reset; Middle+ only shows cloud sync/device **준비 중** stub (hidden for Free and browse). No Markdown export. **05 Security:** stub 2FA + recovery cards (future). No Look switcher, no invented live profile/Pro/device data, no auth fields on this page. Classes in [`src/index.css`](src/index.css).

**The Settings Section Rule.** Each block: caption label (13px muted) then control row. Section gap 12px (`gap-3`). Labels use `settings-section-label`.

**The Settings Seg Rule.** Language, palette, and theme share one pattern: pill **track** (enamel fill, paper-line border, 4px inset padding) with **40px** segment cells, caption 13px semibold. Selected cell: magnet fill, magnet-ink text. Unselected: transparent on track, ink text. All three switches use the same track shape (no mixed circle-only vs pill-only styles).

**The Settings Leave Rule.** **나가기** is one full-width **tertiary** button (48px, 1px paper-line, paper fill, 15px semibold ink). It sits below all preference rows with `mt-1` separation. Not magnet fill.

**The Settings Session Rule.** When signed in, show `settings-session-chip` directly under the header: enamel/paper pill, caption size, ink-soft label plus ink value (email or **둘러보기** for anonymous browse). Truncate long emails.

**The Protocol Stamp Modal Rule.** Centered overlays share one shell ([`AppDialog`](src/components/AppDialog.tsx), [`GuestNoticeSheet`](src/components/GuestNoticeSheet.tsx), [`GuestMigrateSheet`](src/components/GuestMigrateSheet.tsx), [`RemindSheet`](src/components/RemindSheet.tsx), [`LinkBundleSheet`](src/components/LinkBundleSheet.tsx)): ink scrim with light blur, `--login-wall` panel at `var(--radius-md)` (not 32px squircles), mono uppercase **protocol stamp** (warning glyph + label) above a display-face headline, soft body copy, then actions as secondary surface chip + solid primary (`--color-ink` fill, **white** label). Hover keeps dark fill + white text (slightly lifted ink mix only; never invert to light surface + dark ink). Danger confirms add a trash icon on the solid primary (leave-draft: **담기 취소 및 서재로 이동**). Classes: `.protocol-modal-*` in [`src/index.css`](src/index.css). Archival primary CTAs outside modals ([`Workbench`](src/components/Workbench.tsx) shelve, [`FileBatch`](src/components/FileBatch.tsx) classify) reuse `.protocol-modal-btn-primary` the same way; Auth Ladder magnet pills (`auth-btn-*`) stay separate. AppDialog replaces browser `alert` / `confirm`; optional `stamp` on `DialogConfirmOpts` (`""` hides stamp). Guest notice/migrate still fire once per device (`mybrary.guest.notice`, `mybrary.guest.migrateAsked`). Do not invent new centered confirms with pill `auth-btn-*` or browser `confirm()`. Do not repeat the guest notice as a shelf banner or 계정 만들기 link above the list.

## Motion & interaction

These rules are binding for intro, header auth, capture, draft, list, menu, and legal routes. Duration and easing belong in [`src/index.css`](src/index.css) (`--ease-out` `cubic-bezier(0.16, 1, 0.3, 1)`). Prefer `--dur-fast` 140ms, `--dur-mid` 220ms, `--dur-slow` 320ms when adding motion.

### Named rules

**The Quiet Door Rule.** Motion is short and decelerates. Nothing loops except the OG skeleton sheen. No bounce, no page-wide parallax, no confetti.

**The One Job Rule.** One transition at a time for a given surface: intro hands off to the app, the draft exits before the new clipping snaps on, the + menu and header sheets close before another overlay opens.

**The Reduced-Motion Rule.** `prefers-reduced-motion: reduce` turns off animation and transition, including hover-play on video/audio. Instant show/hide. Smooth scroll becomes `auto`. First paint after a saved session never plays the door-open motion.

### View changes

- **Open the door (intro → app):** `ShelfReveal` opens enamel panels like a book (~100ms hold + ~720ms `rotateY` hinge, once per session via `sessionStorage`). Returning sessions and `prefers-reduced-motion` swap instantly. Direct `/dashboard` skips the reveal.
- **Leave (app → intro):** reverse. Draft, lightbox, + menu, and header sheets dismiss first. Scraps clear after the app view has exited.
- **Draft:** classify-then-save panel uses the same sheet motion. Editing a saved scrap reuses the open panel (no second enter). Cancel and save wait for the exit before removing DOM.
- **+ menu:** pop from the plus control (140ms). Click outside, Escape, or picking an item closes it.
- **Lightbox:** dim fade plus a slight zoom on the photo. Backdrop, close control, and Escape share the same exit.
- **New clipping:** `magnet-snap` (220ms) as it sticks to the door. Filter/search only hide and show; they do not animate layout.
- **Back to top:** the FAB fades and rises when the app is scrolled. Hidden when the door is closed.

### Pointer and keys

- **Hover** (fine pointer only): clippings lift 3px; + and type chips darken or pick up a tangerine border. No hover lift on coarse pointers.
- **Pressed:** buttons scale to 0.98 (chips and FAB 0.96). Release returns on `--dur-fast`.
- **Focus-visible:** tangerine ring (`--focus`). The ring follows the control radius. Composer focus is the 24px shell, never a rectangle on the inner field and never a pill. Never rely on hover color alone for the focused control.
- **Disabled Stick:** opacity 0.45, `not-allowed`, no press scale that implies it will fire.
- **Two-step:** peel, Leave with a draft, and Empty the door use the centered AppDialog (or a second press where already designed). No browser `confirm()`.
- **Drop:** composer background and dashed outline update on `--dur-fast`.

### Do not

- Animate width/height of the composer or list (use the existing auto-grow without a layout tween).
- Crossfade intro and app on top of each other (sequential handoff only).
- Persist `hidden` off during an exit; after the motion ends, `hidden` must go back on so the node leaves the accessibility tree.
- Loop intro demos while `prefers-reduced-motion: reduce` is on.

## Phase 4 — shipped surfaces

Binding against [ROADMAP.md](ROADMAP.md) Phase 4. Header stays brand + 로그인 + settings. Stick dock stays at the bottom.

### Named rules

**The Open Kitchen Rule.** First visit is an intro that shows the product job. Auth does not own the first viewport. Email sign in / sign up live in the header sheet. A saved session skips intro.

**The Demo Is The Product Rule.** Intro is a single-viewport **integrated hero** (Theme B): value copy plus an embedded product demo (담기 → AI 분석 → 정리 → 서재). Header chrome uses the split wordmark (`My` + Newsreader `Brary`) and soft paper controls so intro and auth feel continuous. Do not invent customers, download counts, testimonials, or AI claims. Do not build a purple SaaS landing or Notion sidebar.

**The Day Magnet Rule.** 일자별 is a filter on find, not a calendar product and not a second home. **일자별** lives in the `/search` bar; type filtering is the horizontal **type book carousel** under it. Toggling day opens a month panel (18px radius, paper). Selected day uses magnet fill. Prev/next month, Escape closes. Day, type, query, and tags are AND except tags, which match any selected tag. Do not persist day in localStorage.

**The List Tools Rule.** Search is a header icon on the right (beside dashboard and settings) → `/search`. On that page the header is only back, the search field, and the calendar icon. Entering `/search` expands that field and lifts the page in about 220ms; reduced motion skips it. The month panel opens in the page under the header. Autofocus field, placeholder **검색어를 입력해주세요.**, type books, paper tag chips. More than eight tags collapse behind a chevron (`aria-label` keeps 펼치기/접기). **일자별** is a calendar icon in the search bar (magnet when a day is selected or the panel is open). Shelf opens with a **workbench strip** (`.shelf-toolbar`): BookOpen icon, **서재 워크벤치** title, mono `총 {n}건 보관 중` badge, and a labeled layout segment (**마이크로 썸네일** / **비주얼 갤러리**). **Gallery** (default) and **Micro** (`mybrary.shelfLayout`) are the two options; the accordion / row-list layout is retired. Gallery is a **4:3 visual poster grid**: media plate (or type placeholder), mono type badge, optional play overlay, Newsreader title, two-line blurb (`previewText` → `memo` → OG description → `text`), and a caption footer. Micro is a **horizontal media row**: ~11rem 3:2 thumb with left spine stripe, type/date/domain meta, title, two-line blurb, and up to three tag chips. Selected cards (desktop, via `ShelfInspector`) get a `.scrap-card--selected` magnet outline. Spine color matches the type mark: image, video, audio, text, link, document, unknown. **전체** uses magnet. A custom type name hashes to a stable muted color. The **type book carousel** (spine, `spineLabel` i18n) always shows its eight fixed sections when possible — 전체, 책갈피, 메모, 사진, 영상, 소리, 링크, 문서 — including zero-count ones, so the archival index reads as a stable spine, not a shrinking one. Section titles use `--font-mono` (JetBrains Mono) for the SEC 0N archival feel. Cards lift `-2px` on hover (fine pointer). On desktop the carousel goes **sticky** under the header past ~160px of scroll and compacts (`type-book-carousel--sticky.type-book-carousel--compact`); mobile keeps the plain horizontal ribbon, never sticky. They stay in the shelf column and center when the row fits; a wider row keeps the viewport scroll. Preference persists as `mybrary.shelfLayout`. Type books sit below the workbench strip. Ad slot and list body stay separate sections below. Lists mount a page of cards, then more when the sentinel nears the viewport. Do not mount the whole shelf at once.

**The Shelf Inspector Rule.** At ≥960px, selecting a Gallery or Micro card (`ScrapBookCard` `onSelect`) does not navigate; it sets `selectedId` and opens [`ShelfInspector`](src/components/ShelfInspector.tsx) as a sticky right-hand panel beside the list (`.shelf-with-inspector`) showing title, media, AI summary bullets, and memo, with a **조각 상세** link into `/scrap/:id` and a close control. Below 960px, the same tap navigates straight to `/scrap/:id`; there is no inspector panel on mobile. Card geometry and hover states stay identical whether or not the inspector is open.

**The Workbench Rule.** The single-draft classify review at `/stick` is [`Workbench`](src/components/Workbench.tsx), not a bare `DraftCard`. Soft Deckle shell: no breadcrumb or English kicker — segmented 3-step progress (`workbenchStep1-3` from `draft.analyzing`, no full-screen classify BusyOverlay), format chip, then a two-column body (≥960px). Left wraps `DraftCard` (`hideActions` + `quietBusy`) in white paper section cards (source / edit / AI / memo) with enamel-deep inner inputs; memo auto-grows with `resize: none`. Right is a sticky hardcover folio (enlarged `.workbench-cover` + type/source meta + **서재에 담기** + **다시 분석하기** / **담기 취소**). `BusyOverlay` covers batch save only. No fake KDC, countdown %, Whisper labels, or shelf-slot pickers. Batch review (`FileBatch`) keeps the plain hidden-actions `DraftCard`, not the Workbench.

**The Liquid Glass Rule.** Strong `.liquid-glass` is for button clusters: the shelf Micro/Gallery layout segment, the detail action groups, the settings choice tracks, and other control groups such as login and tag clusters. Do **not** wrap `/notices` page toolbar actions in liquid-glass (use plain `settings-arch-chip` icon buttons). Protocol Stamp modals use solid `.protocol-modal-btn-*` instead of liquid glass on confirms. It is enamel over paper, an ink-tinted border, and a light blur, visible on a paper panel. Glass look may lay a weaker blur on cards and bordered panels. Do not put that blur on the hero. It is not a purple glass SaaS kit.

**The Long List Rule.** Shelf and `/search` render 24 scraps, then the next page on scroll or **더 보기**. Signed media is hydrated for that window only. Document film images mount only within four pages of the current page. Offscreen cards use `content-visibility: auto`. Do not sign every file for search or stats.

**The Classify Draft Rule.** Classify-then-save is the `/stick` page, not a sheet over the composer. Opening a draft navigates to `/stick` and unmounts the Stick dock and +. Save and Cancel return to the shelf. The page uses the same `.classify-draft` paper panel (category pop menu under the trigger, editable tag chips, memo). Multi-file confirm stays in `FileBatch` on `/stick` with compact AI-analyze sparkle toggles, type-mark thumbs for non-images, and a **분류하기** confirm; after analyze, all drafts sit in one review list (each with **n / total** and filename; three or more get a sticky number nav) and **one Save** uploads them in order with the same Toss-style `is-progress` spinner as login. While analyze or batch save runs, a full-viewport `BusyOverlay` (ink dim so the page shows through) locks the Header; multi-file shows **n / total**, a progress bar, and percent; Cancel is the only exit. One file with an empty batch starts classify immediately. Upload progress shows **label + % inside** the progress track. Busy status also floats over the preview (not a separate block below); cancel sits inside the status card; the busy label shimmers slowly. A new **분류하기**, paste, or drop **replaces** an open draft in place with no confirm; only Cancel asks to discard (`아직 저장하지 않았습니다`). Cancel is auth utility ghost; Save is auth primary (48px magnet). Do not put the draft back on the dock or in shelf-door above list-tools.

**The Detail Page Rule.** Row tap navigates to [`/scrap/:id`](src/pages/ScrapDetail.tsx). Full page in the app chrome (Header/Footer), not an auth/settings sheet. The header keeps the logo. Off the library, an arrow sits immediately left of the logo and returns (`header-back` + IconTip **서재로**). The detail panel is Theme B paper (`radius-lg`, soft sheet shadow). The page title uses Newsreader (`.detail-title`). Actions sit **inside** `dashboard-panel` under the title meta, in three groups: edit and peel, then AI and share, then bookmark, read, and remind. Edit mode (pencil) changes title, memo, and tags only; Escape cancels edit. Share appears only when the scrap has an external URL. Tag chips show how many scraps use that tag. If a prior edit or AI write exists, a history list can compare **이전** / **현재** (Before / Current) as stacked detail-like snapshot cards with diff highlights (stacked on narrow screens, two columns from 720px), then restore or delete. Summary and analysis can use ==phrase== highlighter marks. Document pages turn with an under-strip icon pager, not stage chevrons; neighbor scrap peeks are small circular paper chevrons at mid-side (desktop keeps the side cover flyout). A peek click starts the spine-hinged turn in that same frame. The incoming layer is the next page's title, meta, and a fixed-ratio cover, not a stretched image. When the leaf has left, that preview continues in place and the next route does not fade in. Reduced motion skips the turn. The peek image preloads the neighbor cover. History and Related sit below the turn stage so they scroll clear of the Footer. Do not also show a neighbor row under the panel. Arrow keys and Escape return to shelf (Escape exits edit first). Peel uses the centered AppDialog, then deletes and returns home. List rows show a magnet **corner bookmark ribbon** when bookmarked (not an inline glyph). Type chips in list-tools hide types with count 0. Loading the detail list reuses `AuthWaiting` (circular spinner). Use dashboard-door / dashboard-panel paper language — never login-wall floating sheet.

**The Ad Slot Rule.** When `showAds` is true (Free / Middle tiers), one AdMob banner (`AdSlot` via `adsbygoogle`) sits below **list-tools** and above the recency list. Env: `VITE_ADMOB_PUBLISHER_ID` (ca-pub-…) and `VITE_ADMOB_BANNER_SLOT`. High and Admin hide it. Browser SPAs use the AdSense tag; native Android/iOS shells can overlay native AdMob separately.

**The Dashboard Rule.** Route `/dashboard`, page title **서재 통계** / Library stats (same as the nav tab) when signed in. Centered **dashboard-door** column `min(100%, 88rem)` with **dashboard-panel** Theme B paper cards (`radius-lg`, Newsreader panel labels): shelf storage summary + `StorageGauge`, type counts as an SVG bubble chart, tag counts as bars, recent 10 timeline, top-7 days. Chart taps open search. **유형 관리** / **태그 관리** link to `/dashboard/types` and `/dashboard/tags` for add, rename, delete, and search. A day row opens `/search?day=`. Empty sections use compact shelf-empty. The header logo stays; the arrow to its left returns to the shelf. Search (`/search`) uses the same header back. Not a second home.

**The Plan Usage Rule.** Settings shows Free / Middle / High via [`PlanUsageBlock`](src/components/PlanUsageBlock.tsx) / `PlanTierMeta` (tier + one trial line) and a chevron to `/upgrade`. Dashboard shows shelf storage only (`dbUsageSummary` + `StorageGauge`). Admin unlimited omits the bar. Settings may show an ads note. Limits: Free 100MB / 1 file / ads / no remind; Middle 500MB / 3 files / ads / remind; High 1GB / unlimited batch / no ads / remind.

**The Korean Footer Rule.** Intro and app use a Soft Deckle multi-column footer: MyBrary wordmark + lead, catalog/ops/support link columns (real routes only), then © year and operator placeholders (표시 예정). Do not invent a 사업자등록번호, ISO badge, or corporate entity name.

### Intro

- Sticky compact header: brand, 로그인, settings (KO/EN, palette, theme live on `/settings`).
- Hero uses `--text-display-hero` with Newsreader. Intro ships Theme B integrated demo.
- Ground: warm paper / night enamel. Not a white marketing slab and not toner.
- Primary CTA opens the existing auth sheet. **둘러보기** stays in the 로그인 sheet.

### Header auth

- 로그인 / Sign in navigates to the dedicated [`/login`](src/pages/Login.tsx) page (Header 로그인, Intro CTA, and the trial/upgrade prompts all `navigate("/login")`; nothing opens `AuthSheet` as a sheet for entry anymore). The page is an archival dossier entry: watermark grid, B.I. wordmark (header-logo My+Brary + mono **AI BOOKSHELF** + book-squircle mark / favicon), Newsreader headline, and a paper dossier card (`login-dossier`) with spine accent. Auth fields are full-width. Header back: on login root → `/`; on signup/recovery → return to login form (no in-card back). Soft Deckle card order is Google → **또는 이메일로 계속** → email/password → **서재 열기** → browse guest → signup, then **아이디 찾기 · 비밀번호 찾기**. Sheet variant of `AuthSheet` still follows **The Auth Ladder Rule**. No site Footer on `/login` (dossier foot holds terms/privacy). Redirects to `/` if already signed in and hides the header's own 로그인 button while on `/login`.
- Light panel: `--login-wall` surface. Dark panel: near-black Soft Deckle or Editorial night.
- Escape and click-outside still close `AuthSheet` when it is used as a sheet (password-recovery deep links can still surface it that way). One Job: close any open sheet before intro hands off to the app. Do not stack with settings.
- After session: chip + 나가기 on `/settings`. Leave from the app returns to intro.

### 일자별 filter

Shipped in [`src/components/DayFilter.tsx`](src/components/DayFilter.tsx). Chip in the `/search` bar, paper panel under it, local `createdAt` day, magnet for the selected day. Not a scheduling calendar.

### Korean footer

- Two bands: policy links (caption) then identity (micro). Privacy link is distinct. Plans link goes to `/upgrade`.
- Legal routes `/terms` and `/privacy` ([`src/pages/Legal.tsx`](src/pages/Legal.tsx)) and plans route `/upgrade` ([`src/pages/Upgrade.tsx`](src/pages/Upgrade.tsx)) reuse header/footer chrome and DM Sans / Newsreader. No Inter.
- Identity values come from placeholders; empty looks like "표시 예정", never a made-up number.

**The Upgrade Page Rule.** `/upgrade` is the Plans matrix (title **등급 안내** / Plans) in the shared content column (`.dashboard-door--plans`, `min(100%, 88rem)`): Free / Middle / High columns, feature rows (trial, storage, ads, classify, batch files, remind, bundle, history). Current tier marked with a CheckCircle2 icon (not “Current” text). Disabled **결제 준비 중** uses `.protocol-modal-btn-primary`. No footer “등급 · 용량 보기” line. Lead copy stays “서재 용량과 광고 여부는 등급에 따라 다릅니다. 결제는 아직 준비 중입니다.” Do not invent checkout or fake prices. Admin maps to the High column highlight only. Matrix cells read from `PLAN_LIMITS`. Bundle + compare/revert are High preview only until gated.

## Do's and Don'ts

**Do**
- Speak like a personal library: stick, peel, 나가기.
- Show the media itself when a preview URL exists.
- Keep KO and EN on one layout.
- Use the type / icon / control scale. Do not invent a one-off size.
- Keep fills inside the Cave Check. Warm paper ground, night enamel dark, not toner.
- Honor `prefers-reduced-motion`.
- Put auth in the header, not in a new information architecture.

**Don't**
- Build a Notion sidebar of equal cards, or a purple AI chat on cream.
- Use Inter or Space Grotesk as the UI face.
- Put camera on fine-pointer desktop as a dead control.
- Invent team, workspace, or research-lab language.
- Use em-dashes in product copy.
- Turn 일자별 into a scheduling calendar, heatmap product, or folders-by-month.
- Ship a login wall as the first page.
- Revive Jeju tangerine fridge enamel as the light default.

## Open UX gaps

Phases 1–4 of the old static client plus the Vite SPA live in this repo. Hosting is [https://mybrary-snuu09.web.app](https://mybrary-snuu09.web.app). The shelf writes only after Vite env vars are set and the user signs in with email.

Fill operator identity when real. Do not reopen a Notion sidebar, folder tree, or AI chat on cream.

Code folders and layers: [ARCHITECTURE.md](ARCHITECTURE.md). Visual tokens, motion, and interaction rules stay in this file.
