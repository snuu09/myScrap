---
name: MyBrary
description: Personal library from anything you save. Theme B Warm Integrated light system.
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

**Creative North Star: Theme B — Warm Integrated Library (서재)**

MyBrary is a personal **서재** (library) built from anything the user saves (text, links, video, files, images). Product voice stays on library language. Do not use door, fridge, or “책장을 연다” copy.

Light default follows **Warm Integrated (Theme B)**: warm paper ground (`#f5f1e9`), soft surfaces (`#fbfaf7`), charcoal ink (`#272521`), restrained warm accent (`#95704b`). Display type is **Newsreader**; UI type is **DM Sans** (SUIT remains a Hangul fallback). Radius centers on ~20px; shadows are soft and deep, not fridge enamel chrome.

Settings also ships **Minimal Editorial (Theme A)** as a compare palette (`data-palette="editorial"`): white ground, ink `#09090b`, Space Grotesk display + Inter UI, near-zero radius. Inter and Space Grotesk are allowed only under Editorial · A.

Product promise:

> 내가 모은 모든 것이 나만의 서재가 됩니다.

Auth stays in the header sheet. Stick / classify / find remain the live capture loop. Dark mode is Theme B night enamel (warm charcoal ground, lifted warm accent `#c4a07a`). Basalt palette still swaps only the accent magnet on warm paper (and the night magnet on dark).

## Colors

Warm paper neutrals plus one restrained accent.

- **Warm accent** (#95704b light): Primary actions, tags, selected segments, focus companion. Ink on accent is `#fbfaf7`.
- **Accent deep** (#7a5a3c): Hover / pressed accent.
- **Paper ground** (#f5f1e9): App background / enamel.
- **Surface** (#fbfaf7): Panels, cards, login sheet.
- **Raised / soft** (#f2eee7 / #e9dfd1): Nested fills and soft borders.
- **Line** (#d9d1c5): Borders and hairlines.
- **Ink / muted** (#272521 / #777168): Primary and secondary copy.
- **Basalt** (optional palette): Charcoal accent only; do not retint paper ground.

**Key Characteristics:**
- Wordmark: MyBrary (KO and EN)
- Light ground is warm paper (`#f5f1e9`); surfaces are soft cream (`#fbfaf7`)
- Header auth sheet uses surface cream (light) or night enamel (dark)
- Centered capture column on every breakpoint
- Soft radius (~20px family), restrained warm accent, soft deep shadows
- Recency list to read; Stick docked at the thumb
- Personal voice: stick, peel, 서재 / library

### Palettes

Header: brand plus settings. Language, **Look** (글라스 / 서재), color theme (**Warm · B** / **Editorial · A** / **현무암**), and light / system / dark live on `/settings`.

- Warm · B (default): Accent `#95704b`. Paper ground. Stick dock at the bottom.
- Editorial · A: Theme A Minimal Editorial. White/ink, Space Grotesk + Inter, near-zero radius. Compare-only until product confirms a single theme.
- Jeju basalt: Accent charcoal only. Ground stays warm paper.
- AI celadon: Not in this SPA.

### Named Rules
**The One Magnet Rule.** One accent at a time. It marks the thing you can press or the tag that names a type. It does not wash backgrounds.

**The Two Magnets Rule.** Default accent is warm brown `#95704b`. 현무암 swaps that accent to Jeju basalt charcoal. Do not retint paper ground when testing basalt. Sample photo SVGs must read `--magnet` at paint time; do not bake old tangerine `#e56f0a`.

**The Look Axis Rule.** A third prefs axis `data-look` = `glass` | `library` (default glass). A stored `fridge` value reads as glass. Glass keeps capture-box wording and lays a weaker glass than button clusters on cards and bordered panels. Library remaps the same CSS tokens toward library tone and does not get that surface glass. When Look is **library** (서재), UI copy swaps unit nouns (KO 조각→페이지, 떼어내기→서재에서 빼기; EN scrap→page, peel→remove from library) via `useT` / `t(..., look)`.

**The Stick Dock Rule.** After sign-in, Stick is a **fixed floating composer** over the library list (ChatGPT-style), not part of the legal Footer. Library route hides Footer; intro/legal/dashboard keep Footer. Default layout is one compact row `[+][textarea][send]` (`composer-chat-row`); the field grows downward on focus or multiline (cap 160px) with the bar pinned under it. **+** opens an attached menu with a portaled ink+blur viewport scrim; ESC / scrim closes it. Opening Auth or Settings dispatches `mybrary:close-overlays` so only one job is open. Classify draft stacks **above** the pill inside the float. Soft enamel fade sits behind the float. Do not put the composer back above the list or glue it to the footer chrome.

**The AI Comparison Rule.** Celadon editorial is not shipped. Do not add header **AI** in this client unless PRODUCT asks. It must not become a purple chat or zinc-blue SaaS skin.

**The White Doorstep.** Auth is a **header auth sheet** (light: surface cream; dark: night enamel). The intro sits on warm paper / night enamel (or Editorial white when that palette is on). Dark intro is not a white flash.

**The Cave Check.** Warm · B light ground stays warm paper `#f5f1e9`. Dark mode is Theme B night enamel (`#2a2622` ground → `#1f1c19` deep, surface `#302b26`, magnet `#c4a07a`), not toner black. Editorial · A uses white / near-black instead. Muted copy must stay AA on the ground (≥4.5:1).

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
**The Two Face Rule.** Under Warm · B: Newsreader for hero/display; DM Sans for UI and body. Under Editorial · A only: Space Grotesk for display; Inter for UI. Do not use Inter or Space Grotesk as the Warm · B face. Do not revive tangerine fridge enamel as the light ground.

## Layout

Header, door (main), footer. Compact header is brand, 로그인 when signed out, and settings. The door is the canvas. Intro, empty state, and clippings share a centered column. After entry, Stick is a fixed bottom dock; classify draft stacks above the field.

Intro is a Theme B integrated hero (담기 → AI 분석 → 정리 → 서재). The app capture column stays 36–40rem. Legal routes `/terms` and `/privacy`, and plans route `/upgrade`, reuse the header/footer chrome with Newsreader titles and 서재 voice.

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
- **Settings page:** `/settings`, not a header sheet. Follow **The Settings Ladder Rule**. Reusable classes: `settings-section-*`, `settings-seg-*`, `settings-session-chip`, `settings-btn-leave` in [`src/index.css`](src/index.css). Do not open together with the 로그인 sheet.
- **Palette switch:** Pill track, 40px cells. 기본 (warm accent swatch) and 현무암 (basalt swatch). Lives on `/settings`. Default is warm accent.
- **Theme switch:** Light, system, and dark magnets in a pill track, 40px cells, 18px glyphs. Also on `/settings`.
- **Composer:** Bottom dock after entry. 24px shell; 22px +; 15px field; Stick 48px / 14px. Focus ring follows the 24px shell, not a square on the textarea and not a pill.
- **Classify draft:** A new **분류하기**, paste, or drop replaces the open classify card in place (no confirm). Only Cancel asks to discard. Upload % sits inside the progress track.
- **+ menu:** 40px rows, 18px glyphs, hairline border.
- **Clipping:** Caption tags 13px / `--control-tag` 26px tall, peel 40px hits with 18px glyphs.
- **Search:** 48px capsule, 15px type. Type chips 34px / 13px.
- **Language magnets:** Pill switch, 40px cells, 13px KO/EN.
- **FAB:** 48px disc, 24px glyph.
- **Footer:** policy links (caption; privacy magnet/bold) then identity (micro). Empty operator fields read 표시 예정.

States required: hover, focus-visible, disabled (Stick), loading (OG skeleton), error (OG fallback copy), empty ("항목이 없습니다." / English equivalent), pressed (`:active` scale), enter/exit for views.

### Auth sheet hierarchy

Binding for [`src/components/AuthSheet.tsx`](src/components/AuthSheet.tsx). One magnet-fill primary per screen.

**The Auth Ladder Rule.** Sheet opens on **chooser**: Google / email sign-in / browse (same `auth-btn-*` heights). Email path (`in` | `up`): (1) fields (signup adds confirm password), (2) primary submit, (3) success or error feedback directly under primary, (4) caption divider **또는** / **or**, (5) Google tertiary, (6) browse secondary when relevant, (7) ghost toggle (회원가입 ↔ 로그인), (8) ghost utility links (아이디 찾기 · 비밀번호 찾기). New password (`newPassword`): fields, primary save, feedback. No divider or OAuth on that screen.

**The Auth Recovery Rule.** 아이디 찾기 (`findId`) and 비밀번호 찾기 (`resetPassword`) share one layout. (1) sheet header: **auth-back-btn** (48px enamel square with ArrowLeft, aria **로그인으로**), title, close, (2) **Brief** block: lead then Google callout, (3) email field, (4) primary, (5) feedback under primary, (6) divider **또는** / **or**, (7) Google tertiary. No **로그인으로** text link. Back icon returns to login; X closes the sheet. No browse, no sign-up toggle on these screens. New password uses the same back control.

**The Recovery Brief Rule.** Lead is one ui line in ink-soft. Callout sits below lead with enamel fill and paper-line border so it reads as a notice, not an input. Body copy stays ink-soft at caption size. Only the **Google로 계속** phrase is magnet bold inside the sentence. Do not stack two magnet-fill buttons without the divider between email submit and Google.

**The Auth Button Tier Rule.**

| Tier | Height | Shape | Border | Font | Color |
| --- | --- | --- | --- | --- | --- |
| Primary | 48px | pill | none | 15px bold | bg magnet, text magnet-ink |
| Secondary | 48px | pill | 2px magnet | 15px bold | bg paper, text ink |
| Tertiary | 48px | pill | 1px paper-line | 15px semibold | bg paper, text ink |
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

**The Settings Ladder Rule.** Settings is the `/settings` page, not a header sheet. Header menu navigates there; the arrow left of the logo returns to the previous screen (or `/` if there is none). The page hides the Stick dock. Three paper cards, not one stacked track. Account: session, plan (tier, trial D-day, storage bar, ad note, link to `/upgrade`), Leave at the bottom of that card. Appearance: language, palette, Look, and theme, each a label on the left and a pill track on the right. Storage: scrap count, media bytes, gauge, and **DB 초기화** last (disabled when empty; own scraps + media only; profiles stay). No auth fields.

**The Settings Section Rule.** Each block: caption label (13px muted) then control row. Section gap 12px (`gap-3`). Labels use `settings-section-label`.

**The Settings Seg Rule.** Language, palette, and theme share one pattern: pill **track** (enamel fill, paper-line border, 4px inset padding) with **40px** segment cells, caption 13px semibold. Selected cell: magnet fill, magnet-ink text. Unselected: transparent on track, ink text. All three switches use the same track shape (no mixed circle-only vs pill-only styles).

**The Settings Leave Rule.** **나가기** is one full-width **tertiary** button (48px, 1px paper-line, paper fill, 15px semibold ink). It sits below all preference rows with `mt-1` separation. Not magnet fill.

**The Settings Session Rule.** When signed in, show `settings-session-chip` directly under the header: enamel/paper pill, caption size, ink-soft label plus ink value (email or **둘러보기** for anonymous browse). Truncate long emails.

**The Guest Storage Notice Rule.** Centered overlays share one shell ([`GuestNoticeSheet`](src/components/GuestNoticeSheet.tsx), [`GuestMigrateSheet`](src/components/GuestMigrateSheet.tsx), [`AppDialog`](src/components/AppDialog.tsx), [`RemindSheet`](src/components/RemindSheet.tsx)): 32px `--login-wall` panel, ink scrim, true screen center. Guest notice/migrate fire once per device (`mybrary.guest.notice`, `mybrary.guest.migrateAsked`). AppDialog replaces browser `alert` / `confirm`. Do not repeat that notice as a shelf banner or 계정 만들기 link above the list.

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

**The List Tools Rule.** Search is a header icon on the right (beside dashboard and settings) → `/search`. On that page the header is only back, the search field, and the calendar icon. Entering `/search` expands that field and lifts the page in about 220ms; reduced motion skips it. The month panel opens in the page under the header. Autofocus field, placeholder **검색어를 입력해주세요.**, type books, paper tag chips. More than eight tags collapse behind a chevron (`aria-label` keeps 펼치기/접기). **일자별** is a calendar icon in the search bar (magnet when a day is selected or the panel is open). Shelf list-tools keeps the layout segment. Gallery is the default; list and accordion are options. Accordion groups the filtered window by scrap type (name and count). Several sections can be open at once, and they start closed. Gallery stays a grid of **Theme B library books**: asymmetric cover radius (`~3px / 9px`), manila cover wash by type, Newsreader title, category spine, type mark, and saved date. List, accordion, and search stay one row each, with that same small cover, spine, and type mark on the left, and the title plus saved date on the right. They do not tilt, and they do not show tags under the cover. Spine color matches the type mark: image, video, audio, text, link, document, unknown. **전체** uses magnet. A custom type name hashes to a stable muted color. Type books use that same full-height spine, type mark, name, and count. They stay in the shelf column and center when the row fits; a wider row keeps the viewport scroll. Cards inside a group reuse the book card. Preference persists as `mybrary.shelfLayout`. Type books sit above list-tools. Ad slot and list body stay separate sections below. Lists mount a page of cards, then more when the sentinel nears the viewport. Do not mount the whole shelf at once.

**The Liquid Glass Rule.** Strong `.liquid-glass` is for button clusters: the gallery / list / accordion pill, the detail action groups, the settings choice tracks, and other control groups such as login, dialog confirm, and tag clusters. It is enamel over paper, an ink-tinted border, and a light blur, visible on a paper panel. Glass look may lay a weaker blur on cards and bordered panels. Do not put that blur on the hero. It is not a purple glass SaaS kit.

**The Long List Rule.** Shelf and `/search` render 24 scraps, then the next page on scroll or **더 보기**. Signed media is hydrated for that window only. Document film images mount only within four pages of the current page. Offscreen cards use `content-visibility: auto`. Do not sign every file for search or stats.

**The Classify Draft Rule.** Classify-then-save is the `/stick` page, not a sheet over the composer. Opening a draft navigates to `/stick` and unmounts the Stick dock and +. Save and Cancel return to the shelf. The page uses the same `.classify-draft` paper panel (category pop menu under the trigger, editable tag chips, memo). Multi-file confirm stays in `FileBatch` on `/stick` with compact AI-analyze sparkle toggles, type-mark thumbs for non-images, and a **분류하기** confirm; after analyze, all drafts sit in one review list (each with **n / total** and filename; three or more get a sticky number nav) and **one Save** uploads them in order with the same Toss-style `is-progress` spinner as login. While analyze or batch save runs, a full-viewport `BusyOverlay` (ink dim so the page shows through) locks the Header; multi-file shows **n / total**, a progress bar, and percent; Cancel is the only exit. One file with an empty batch starts classify immediately. Upload progress shows **label + % inside** the progress track. Busy status also floats over the preview (not a separate block below); cancel sits inside the status card; the busy label shimmers slowly. A new **분류하기**, paste, or drop **replaces** an open draft in place with no confirm; only Cancel asks to discard (`아직 저장하지 않았습니다`). Cancel is auth utility ghost; Save is auth primary (48px magnet). Do not put the draft back on the dock or in shelf-door above list-tools.

**The Detail Page Rule.** Row tap navigates to [`/scrap/:id`](src/pages/ScrapDetail.tsx). Full page in the app chrome (Header/Footer), not an auth/settings sheet. The header keeps the logo. Off the library, an arrow sits immediately left of the logo and returns (`header-back` + IconTip **서재로**). The detail panel is Theme B paper (`radius-lg`, soft sheet shadow). The page title uses Newsreader (`.detail-title`). Actions sit **inside** `dashboard-panel` under the title meta, in three groups: edit and peel, then AI and share, then bookmark, read, and remind. Edit mode (pencil) changes title, memo, and tags only; Escape cancels edit. Share appears only when the scrap has an external URL. Tag chips show how many scraps use that tag. If a prior edit or AI write exists, a history list can compare **이전** / **현재** (Before / Current) as stacked detail-like snapshot cards with diff highlights (stacked on narrow screens, two columns from 720px), then restore or delete. Summary and analysis can use ==phrase== highlighter marks. Document pages turn with an under-strip icon pager, not stage chevrons; neighbor scrap peeks are small circular paper chevrons at mid-side (desktop keeps the side cover flyout). A peek click starts the spine-hinged turn in that same frame. The incoming layer is the next page's title, meta, and a fixed-ratio cover, not a stretched image. When the leaf has left, that preview continues in place and the next route does not fade in. Reduced motion skips the turn. The peek image preloads the neighbor cover. History and Related sit below the turn stage so they scroll clear of the Footer. Do not also show a neighbor row under the panel. Arrow keys and Escape return to shelf (Escape exits edit first). Peel uses the centered AppDialog, then deletes and returns home. List rows show a magnet **corner bookmark ribbon** when bookmarked (not an inline glyph). Type chips in list-tools hide types with count 0. Loading the detail list reuses `AuthWaiting` (circular spinner). Use dashboard-door / dashboard-panel paper language — never login-wall floating sheet.

**The Ad Slot Rule.** When `showAds` is true (Free / Middle tiers), one AdMob banner (`AdSlot` via `adsbygoogle`) sits below **list-tools** and above the recency list. Env: `VITE_ADMOB_PUBLISHER_ID` (ca-pub-…) and `VITE_ADMOB_BANNER_SLOT`. High and Admin hide it. Browser SPAs use the AdSense tag; native Android/iOS shells can overlay native AdMob separately.

**The Dashboard Rule.** Route `/dashboard`, header caption **대시보드** / Dashboard when signed in. Centered **dashboard-door** column max 40rem with **dashboard-panel** Theme B paper cards (`radius-lg`, Newsreader panel labels): shelf storage summary + `StorageGauge`, type counts as an SVG bubble chart, tag counts as bars, recent 10 timeline, top-7 days. Chart taps open search. **유형 관리** / **태그 관리** link to `/dashboard/types` and `/dashboard/tags` for add, rename, delete, and search. A day row opens `/search?day=`. Empty sections use compact shelf-empty. The header logo stays; the arrow to its left returns to the shelf. Not a second home.

**The Plan Usage Rule.** Settings shows Free / Middle / High via [`PlanUsageBlock`](src/components/PlanUsageBlock.tsx) / `PlanTierMeta` (tier + one trial line) and a chevron to `/upgrade`. Dashboard shows shelf storage only (`dbUsageSummary` + `StorageGauge`). Admin unlimited omits the bar. Settings may show an ads note. Limits: Free 100MB / 1 file / ads / no remind; Middle 500MB / 3 files / ads / remind; High 1GB / unlimited batch / no ads / remind.

**The Korean Footer Rule.** Intro and app show operator identity plus 이용약관 plus 개인정보처리방침. Privacy is easier to spot than the other links (bold or magnet). Placeholders until real operator data. Do not invent a 사업자등록번호 or 통신판매업 신고번호.

### Intro

- Sticky compact header: brand, 로그인, settings (KO/EN, palette, theme live on `/settings`).
- Hero uses `--text-display-hero` with Newsreader. Intro ships Theme B integrated demo.
- Ground: warm paper / night enamel. Not a white marketing slab and not toner.
- Primary CTA opens the existing auth sheet. **둘러보기** stays in the 로그인 sheet.

### Header auth

- 로그인 / Sign in is a 40–48px header control. Open state: paper sheet, `--radius-xl` 24px, email and password. Light sheet is surface cream. Dark sheet is night enamel.
- Light sheet: `--login-wall` surface. Dark sheet: night enamel.
- Escape and click-outside close it. One Job: close the sheet before intro hands off to the app. Do not stack with settings.
- After session: chip + 나가기 on `/settings`. Leave from the app returns to intro.

### 일자별 filter

Shipped in [`src/components/DayFilter.tsx`](src/components/DayFilter.tsx). Chip in the `/search` bar, paper panel under it, local `createdAt` day, magnet for the selected day. Not a scheduling calendar.

### Korean footer

- Two bands: policy links (caption) then identity (micro). Privacy link is distinct. Plans link goes to `/upgrade`.
- Legal routes `/terms` and `/privacy` ([`src/pages/Legal.tsx`](src/pages/Legal.tsx)) and plans route `/upgrade` ([`src/pages/Upgrade.tsx`](src/pages/Upgrade.tsx)) reuse header/footer chrome and DM Sans / Newsreader. No Inter.
- Identity values come from placeholders; empty looks like "표시 예정", never a made-up number.

**The Upgrade Page Rule.** `/upgrade` is the Plans matrix (title **등급 안내** / Plans): Free / Middle / High columns, feature rows (trial, storage, ads, classify, batch files, remind, bundle, history), disabled **결제 준비 중** CTA, and “등급 · 용량 보기” to `/settings`. Lead copy stays “서재 용량과 광고 여부는 등급에 따라 다릅니다. 결제는 아직 준비 중입니다.” Do not invent checkout or fake prices. Admin maps to the High column highlight only. Matrix cells read from `PLAN_LIMITS`. Bundle + compare/revert are High preview only until gated.

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
