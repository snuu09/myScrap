---
name: MyBrary
description: Personal fridge-door capture box for web clippings, photos, and files.
colors:
  magnet: "#e56f0a"
  magnet-deep: "#d06612"
  magnet-ink: "#2a1a08"
  enamel: "#fff6f0"
  enamel-deep: "#f3e6dc"
  enamel-ink: "#e4d2c6"
  gasket: "#5a524a"
  gasket-soft: "#cbbfaf"
  ink: "#322c26"
  ink-soft: "#524940"
  muted: "#6e665c"
  paper: "#ffffff"
  photo-mat: "#fffaf6"
  manila: "#ebc98a"
  manila-ink: "#5c4520"
  disc: "#3a342e"
  danger: "#b44532"
  login-wall: "#ffffff"
  kitchen-wall: "#fff7f2"
  kitchen-lo: "#f3e7de"
  hairline: "color-mix(in srgb, var(--ink) 12%, transparent)"
  dark-magnet: "#f4a24a"
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
    fontFamily: "SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "clamp(1.5rem, 1.15rem + 1.5vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  display-hero:
    fontFamily: "SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "clamp(2rem, 1.4rem + 3vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 750
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: "SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  ui:
    fontFamily: "SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  caption:
    fontFamily: "SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.01em"
  micro:
    fontFamily: "SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
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
  sm: "14px"
  md: "18px"
  lg: "24px"
  xl: "32px"
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

**Creative North Star: "The Kitchen Fridge Door"**

마이브러리 (Mybrary) is a personal capture box, not a knowledge base. The surface is a warm enamel fridge door: rubber gasket, stainless handle, Jeju tangerine (hallabong) disc magnets, and paper clippings of uneven size. You open the door (header 로그인, email), read the recency door, and stick from a bottom dock. What you stick snaps onto the door already tagged.

The product is Operate-mode. Brand lives in material details (gasket, magnets, clipping rotation) while controls stay familiar. Korean and English share one layout. Auth sits in a header sheet. Light is a peach porcelain kitchen; dark is a night kitchen. The pressable magnet is Jeju tangerine by default, or Jeju basalt when that palette is on.

**Key Characteristics:**
- Wordmark: MyBrary (KO and EN)
- Intro is the first public surface on porcelain peach / night kitchen; peach kitchen shows before the door opens
- Header auth sheet is the white doorstep (light) or night enamel (dark)
- Centered capture column on every breakpoint
- Soft rounded clippings (18px), not razor-square paper and not identical SaaS cards
- Recency list to read; Stick docked at the thumb
- Personal voice: stick, peel, empty the door

## Colors

Restrained palette: one Jeju tangerine plus neutrals in the same hue family. Yellow-gray 미색 made the magnet look dirty. Complementary blue would pop the orange but would not be a kitchen.

### Primary
- **Jeju tangerine** (#e56f0a light, #f4a24a dark): Default magnet. Stick, KO/EN selected, tags, magnet discs, focus companion, FAB. Ink on tangerine is #2a1a08 so small type stays AA.
- **Jeju basalt** (#3a3936 light, #c8c6c1 dark): Test swap for that magnet. Same slots. Ink on dark stone is #f4f3f0; ink on light stone in dark mode is #1c1c1a. Does not retint the kitchen wall.
- **AI celadon** (#1f6b58 light, #7ecfb8 dark): Reserved token only. Not a shipped palette in this SPA.

### Neutral
- **Login white** (#ffffff): Light-mode header auth sheet only. No kitchen glow on that sheet. Intro and app sit on porcelain peach / night kitchen.
- **Porcelain peach** (#fff7f2 → #f3e7de): App kitchen wall. Same hue as hallabong (~28°), a few percent tangerine in white. Not yellow-beige #f5f1ea.
- **Warm enamel** (#fff6f0 / dark #302b26): Chrome fills on the door.
- **Deep enamel** (#f3e6dc / dark #27231f): Hover fills.
- **Hairline** (`color-mix(ink 12%, transparent)`): Switches, + button, menus. Not gasket charcoal.
- **Warm ink** (#322c26 / dark #f4eee6): Body and wordmark. Not near-black.
- **Kitchen mute** (#6e665c / dark #c5b8a8): Secondary copy. AA on peach and white (≥4.5:1).
- **Note paper** (#ffffff / dark #3c362f): Composer and clippings. White slips on a peach door.
- **Apple charcoal** (#3a342e): Disc / audio. Not an Apple Sign-In button in this SPA.
- **Manila** (#ebc98a): Document slips.
- **Disc charcoal** (#3a342e): Audio clippings, one step up from void.

### Palettes

Header: brand plus a settings disc. Language, **Look** (기본 / 책장), **기본** / **현무암**, and light / system / dark live in that sheet, remembered on this device. Basalt keeps the peach kitchen wall.

- **Kitchen (default):** Magnet `#e56f0a` / dark `#f4a24a`. Fridge door. Stick dock at the bottom; magnets and tilted paper stay.
- **Jeju basalt:** Magnet `#3a3936` / dark `#c8c6c1`. Replaces the orange only. Ground stays porcelain peach / night kitchen. Same bottom Stick dock as kitchen.
- **AI celadon:** Not in this SPA. Do not add a third header swatch unless PRODUCT asks.

### Named Rules
**The One Magnet Rule.** One accent at a time. It marks the thing you can press or the tag that names a type. It does not wash backgrounds.

**The Two Magnets Rule.** Default magnet is hallabong tangerine. 현무암 swaps that accent to Jeju basalt charcoal. Do not retint enamel, paper, or the kitchen wall when testing basalt. Sample photo SVGs must read `--magnet` (or the matching hex) at paint time; do not bake `#e56f0a`. The 견본 tag is hairline ink, not danger orange.

**The Look Axis Rule.** A third prefs axis `data-look` = `fridge` | `library` (default fridge). Library remaps the same CSS tokens (`--color-enamel`, `--color-paper`, shadows) toward a warmer shelf tone. It does not replace palette (magnets) or invent a second component kit. No 3D bookcase mesh; at most a soft binding edge on cards.

**The Stick Dock Rule.** After the door opens, Stick is a **fixed floating composer** over the shelf (ChatGPT-style), not part of the legal Footer. Shelf route hides Footer; intro/legal/dashboard keep Footer. Default layout is one compact row `[+][textarea][send]` (`composer-chat-row`); the field grows downward on focus or multiline (cap 160px) with the bar pinned under it. **+** opens an attached menu with ink 40% viewport scrim; ESC / scrim closes it. Opening Auth or Settings dispatches `mybrary:close-overlays` so only one job is open. Classify draft stacks **above** the pill inside the float. Soft enamel fade sits behind the float. Do not put the composer back above the list or glue it to the footer chrome.

**The AI Comparison Rule.** Celadon editorial is not shipped. Do not add header **AI** in this client unless PRODUCT asks. It must not become a purple chat or zinc-blue SaaS skin.

**The White Doorstep.** The doorstep is a **header auth sheet** (light: white; dark: night enamel). The intro sits on porcelain peach / night kitchen. Dark intro is not a white flash.

**The Cave Check.** Light kitchen wall stays porcelain peach (#fff7f2 → #f3e7de). Dark mode is a night kitchen (#2a2622 → #1f1c19), not #0c0b0a. If a fill looks like printer toner, lift it. Muted copy must stay AA on enamel (≥4.5:1): light #6e665c on #fff7f2 (~5.4:1); dark #c5b8a8 on #302b26 (~7.2:1).

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

**Display Font:** SUIT (with Apple SD Gothic Neo, Noto Sans KR)
**Body Font:** SUIT
**Label/Mono Font:** ui-monospace for file excerpts only

**Character:** A Korean-first grotesque that can hold both Hangul and Latin at UI sizes. One family for wordmark, buttons, tags, and body. Tight tracking on the intro hero, not a display serif.

### Named Rules
**The One Face Rule.** Do not pair a Latin display serif or Inter-like default with SUIT. Hangul and English share the same cuts.

## Layout

Header, door (main), footer. Compact header is brand, 로그인 when signed out, and settings. The door is the canvas. Intro, empty state, and clippings share a centered column. After entry, Stick is a fixed bottom dock; classify draft stacks above the field.

Intro is a full-bleed library still under the header, peach ground. The app capture column stays 36–40rem. Legal routes `/terms` and `/privacy` reuse the header/footer chrome.

Gutter is fluid (`clamp(16px, 4vw, 40px)`). Door padding is fluid so resize does not jump. Composer becomes two-row when the door is under 560px (container query). Fridge handle hides under 640px door width. Camera control appears under 721px or coarse pointer, including DevTools width resize.

## Elevation & Depth

Hybrid: the header auth sheet and clippings lift off the kitchen wall with a soft, diffuse shadow plus a physical magnet disc. No neon glow.

### Shadow Vocabulary
- **Sheet** (`0 18px 40px rgba(50, 44, 38, 0.08)`): Header auth sheet and menus. Dark uses `rgba(0, 0, 0, 0.28)`.
- **Clipping** (`0 10px 28px rgba(50, 44, 38, 0.06)`): Paper on the door.
- **FAB** (`0 10px 22px` magnet-tinted): Magnet floating off the wall.

### Named Rules
**The Offset Rule.** Shadows carry offset and blur. A colored halo is not depth.

**The Focus Follows Form Rule.** Every focusable control has a radius from the scale. The tangerine companion ring is `box-shadow` so it follows that radius. Composer shell stays `--radius-lg` (24px) so it sits with the 14px + and Stick. Focus is that shell, not a square on the textarea, and not a pill that fights the inner buttons.

## Shapes

Soft squircles, not 90-degree stamps. Scale: 10 / 14 / 18 / 24 / 32, pills 999, discs 50%. Header auth sheet 32px. Composer 24px. Clippings and auth 18px. Stick and + 14px. Language, palette, and theme switches, search, and tags are pills. Magnets, FAB, and the header settings disc stay discs.

Slight clipping rotation (±0.45deg) on every third scrap. That is the fridge, not decoration for its own sake.

## Components

- **Auth stack:** Email and password in the header 로그인 sheet (32px radius). 48px controls, 15px label. Light sheet is `--login-wall` white. Inline validation under fields. Vertical order follows **The Auth Ladder Rule** (fields → primary → feedback → divider → Google → browse → toggle → find links). **Google로 계속** is tertiary (1px outline). **둘러보기** is secondary (2px magnet outline) on the sheet only. **회원가입** label (not 가입). No Apple. Reusable classes: `auth-btn-*`, `auth-link-*`, `auth-divider`, `auth-callout`, `auth-feedback-*` in [`src/index.css`](src/index.css).
- **Settings sheet:** 32px radius login-wall sheet (same chrome as auth). Follow **The Settings Ladder Rule**. Reusable classes: `settings-section-*`, `settings-seg-*`, `settings-session-chip`, `settings-btn-leave` in [`src/index.css`](src/index.css). Do not open together with the 로그인 sheet.
- **Palette switch:** Pill track, 40px cells. 기본 (tangerine swatch) and 현무암 (basalt swatch). Lives in the settings sheet. Default is tangerine.
- **Theme switch:** Light, system, and dark magnets in a pill track, 40px cells, 18px glyphs. Also in the settings sheet.
- **Composer:** Bottom dock after entry. 24px shell; 22px +; 15px field; Stick 48px / 14px. Focus ring follows the 24px shell, not a square on the textarea and not a pill.
- **Classify draft:** A new Stick, paste, or drop replaces the open classify card in place.
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

### Settings sheet hierarchy

Binding for [`src/components/SettingsSheet.tsx`](src/components/SettingsSheet.tsx).

**The Settings Ladder Rule.** (1) sheet title and close (same header row as auth), (2) **session chip** when a session exists, (3) **plan block** (tier name, trial D-day, storage used/limit bar, ad note, operator upgrade hint), (4) language, (5) palette, (6) appearance (theme), (7) **저장 사용량** panel (Supabase scrap count + media bytes + gauge; empty state says reset not needed) with **DB 초기화** danger-outline (disabled when empty; own scraps + media only; profiles stay), (8) **Leave** full-width tertiary when signed in. No auth fields. Escape and backdrop close the sheet.

**The Settings Section Rule.** Each block: caption label (13px muted) then control row. Section gap 12px (`gap-3`). Labels use `settings-section-label`.

**The Settings Seg Rule.** Language, palette, and theme share one pattern: pill **track** (enamel fill, paper-line border, 4px inset padding) with **40px** segment cells, caption 13px semibold. Selected cell: magnet fill, magnet-ink text. Unselected: transparent on track, ink text. All three switches use the same track shape (no mixed circle-only vs pill-only styles).

**The Settings Leave Rule.** **나가기** is one full-width **tertiary** button (48px, 1px paper-line, paper fill, 15px semibold ink). It sits below all preference rows with `mt-1` separation. Not magnet fill.

**The Settings Session Rule.** When signed in, show `settings-session-chip` directly under the header: enamel/paper pill, caption size, ink-soft label plus ink value (email or **둘러보기** for anonymous browse). Truncate long emails.

**The Guest Storage Notice Rule.** Centered overlays share one shell ([`GuestNoticeSheet`](src/components/GuestNoticeSheet.tsx), [`GuestMigrateSheet`](src/components/GuestMigrateSheet.tsx), [`AppDialog`](src/components/AppDialog.tsx), [`RemindSheet`](src/components/RemindSheet.tsx)): 32px `--login-wall` panel, ink scrim, true screen center. Guest notice/migrate fire once per device (`mybrary.guest.notice`, `mybrary.guest.migrateAsked`). AppDialog replaces browser `alert` / `confirm`. On the shelf, browse mode keeps one quiet caption line above the list (ink-soft, `auth-link-utility` for 계정 만들기), not a colored alert bar.

## Motion & interaction

These rules are binding for intro, header auth, capture, draft, list, menu, and legal routes. Duration and easing belong in [`src/index.css`](src/index.css) (`--ease-out` `cubic-bezier(0.16, 1, 0.3, 1)`). Prefer `--dur-fast` 140ms, `--dur-mid` 220ms, `--dur-slow` 320ms when adding motion.

### Named rules

**The Quiet Door Rule.** Motion is short and decelerates. Nothing loops except the OG skeleton sheen. No bounce, no page-wide parallax, no confetti.

**The One Job Rule.** One transition at a time for a given surface: intro hands off to the app, the draft exits before the new clipping snaps on, the + menu and header sheets close before another overlay opens.

**The Reduced-Motion Rule.** `prefers-reduced-motion: reduce` turns off animation and transition, including hover-play on video/audio. Instant show/hide. Smooth scroll becomes `auto`. First paint after a saved session never plays the door-open motion.

### View changes

- **Open the door (intro → app):** `ShelfReveal` splits enamel panels for 220–320ms once per session (`sessionStorage`). Returning sessions and `prefers-reduced-motion` swap instantly. Direct `/dashboard` skips the reveal.
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

**The Open Kitchen Rule.** First visit is an intro that shows the fridge job. Auth does not own the first viewport. Email sign in / sign up live in the header sheet. A saved session skips intro.

**The Demo Is The Product Rule.** Intro is a full-bleed library still (`public/assets/intro-hero.jpg`) filling below the header. Hero and **책장을 연다** sit on the photo. No 견본 / Sample on the still. Stick, classify, and find sit as hotspots on the matching objects: titles always visible, two short beats on hover or tap. Do not invent customers, download counts, testimonials, or AI claims. Do not build a purple SaaS landing, a phone farm of fake UI, or CSS widgets that impersonate the composer.

**The Day Magnet Rule.** 일자별 is a filter on the recency list, not a calendar product and not a second home. Type chips and **일자별** share one chip row inside **list-tools**; toggling opens a month panel under the chips (18px radius, paper). Selected day uses magnet fill. Prev/next month, Escape closes. Day + type + search are AND. Do not persist day in localStorage.

**The List Tools Rule.** Search, type chips, and day chip live in one **list-tools** paper panel (18px radius, scrap shadow). Label is caption/muted. Search is a 48px capsule. Chips are 34px enamel pills; active chip is magnet fill. Clear-filters link sits in the panel header when any filter is on. Ad slot and list body are separate sections below.

**The Classify Draft Rule.** Classify-then-save lives in the floating Stick dock, **above** the composer pill. The outer `.classify-draft` panel reuses list-tools chrome (18px, paper, scrap shadow) with max-height scroll when tall. Cancel is auth utility ghost; Save is auth primary (48px magnet). Do not place the draft in shelf-door above list-tools.

**The Detail Page Rule.** Row tap navigates to [`/scrap/:id`](src/pages/ScrapDetail.tsx). Full page in the app chrome (Header/Footer), not an auth/settings sheet. Back link **책장으로**. Share / bookmark / read / remind sit **inside** `dashboard-panel` under the title meta. Prev/next over newest-first shelf list; Arrow keys and Escape return to shelf. Peel uses the centered AppDialog, then deletes and returns home. Use dashboard-door / dashboard-panel paper language — never login-wall floating sheet.

**The Ad Slot Rule.** When `showAds` is true (free / standard tiers), one AdMob banner (`AdSlot` via `adsbygoogle`) sits below **list-tools** and above the recency list. Env: `VITE_ADMOB_PUBLISHER_ID` (ca-pub-…) and `VITE_ADMOB_BANNER_SLOT`. Premium and admin hide it. Browser SPAs use the AdSense tag; native Android/iOS shells can overlay native AdMob separately.

**The Dashboard Rule.** Route `/dashboard`, header caption **통계** / Stats when signed in. Centered **dashboard-door** column max 40rem with **dashboard-panel** paper cards (same tokens as list-tools): plan via `PlanUsageBlock` (tier, D-day, **trial end date**, storage text + linear gauge), type/tag chips, recent 10 timeline, top-7 days. Empty sections use compact shelf-empty. Link back to shelf. Not a second home.

**The Plan Usage Rule.** Settings and Dashboard share [`PlanUsageBlock`](src/components/PlanUsageBlock.tsx): tier name, trial D-day, local end date (`YYYY-MM-DD`), storage used/limit + 8px magnet progress bar (`StorageGauge`). Unlimited tiers omit the bar. Settings may show an ads note.

**The Korean Footer Rule.** Intro and app show operator identity plus 이용약관 plus 개인정보처리방침. Privacy is easier to spot than the other links (bold or magnet). Placeholders until real operator data. Do not invent a 사업자등록번호 or 통신판매업 신고번호.

### Intro

- Sticky compact header: brand, 로그인, settings (KO/EN, palette, theme live in the settings sheet).
- Hero uses `--text-display-hero` (clamp 2–3rem) once, overlaid top-left on the still with the magnet-fill CTA. A thin peach enamel gradient under the type. No glass blur. No kicker.
- The still is full-bleed under the header (`object-fit: cover`). No 4:3 card, no scrap radius. Titles sit on the catalog card, the linen book, and the holdings. The body is two short beats on hover or tap. No three-card stack. One job at a time.
- Primary CTA copy stays personal (**책장을 연다**). **둘러보기** lives in the 로그인 sheet as a magnet-outline pill, not beside the hero CTA.
- Ground: porcelain peach / night kitchen, kitchen glow allowed. Not a white marketing slab and not toner.

### Header auth

- 로그인 / Sign in is a 40–48px header control. Open state: paper sheet, `--radius-xl` 32px, email and password. Light sheet is white. Dark sheet is night enamel.
- Light sheet: `--login-wall` white. Dark sheet: night enamel.
- Escape and click-outside close it. One Job: close the sheet before intro hands off to the app. Do not stack with settings.
- After session: chip + 나가기 in the settings sheet. Leave from the app returns to intro.

### 일자별 filter

Shipped in [`src/components/DayFilter.tsx`](src/components/DayFilter.tsx). Chip next to type chips, paper panel under the tools, local `createdAt` day, magnet for the selected day. Not a scheduling calendar.

### Korean footer

- Two bands: policy links (caption) then identity (micro). Privacy link is distinct.
- Legal routes `/terms` and `/privacy` ([`src/pages/Legal.tsx`](src/pages/Legal.tsx)) reuse header/footer chrome and SUIT. No new typeface.
- Identity values come from placeholders; empty looks like "표시 예정", never a made-up number.

## Do's and Don'ts

**Do**
- Speak like a personal box: stick, peel, 나가기.
- Show the media itself when a preview URL exists.
- Keep KO and EN on one layout.
- Use the type / icon / control scale. Do not invent a one-off size.
- Keep fills inside the Cave Check. Porcelain peach kitchen, night kitchen, not toner. The header auth sheet is white in light mode.
- Honor `prefers-reduced-motion`.
- Put auth in the header, not in a new information architecture.

**Don't**
- Build a Notion sidebar of equal cards, or a purple AI chat on cream.
- Use Inter, Space Grotesk, IBM Plex, Outfit, Plus Jakarta, DM Sans, or Instrument Sans as the UI face.
- Put camera on fine-pointer desktop as a dead control.
- Invent team, workspace, or research-lab language.
- Use em-dashes in product copy.
- Turn 일자별 into a scheduling calendar, heatmap product, or folders-by-month.
- Ship a login wall as the first page.

## Open UX gaps

Phases 1–4 of the old static client plus the Vite SPA live in this repo. Hosting is [https://mybrary-snuu09.web.app](https://mybrary-snuu09.web.app). The shelf writes only after Vite env vars are set and the user signs in with email.

Fill operator identity when real. Do not reopen a Notion sidebar, folder tree, or AI chat on cream.

Code folders and layers: [ARCHITECTURE.md](ARCHITECTURE.md). Visual tokens, motion, and interaction rules stay in this file.
