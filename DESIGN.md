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

마이브러리 (Mybrary) is a personal capture box, not a knowledge base. The surface is a warm enamel fridge door: rubber gasket, stainless handle, Jeju tangerine (hallabong) disc magnets, and paper clippings of uneven size. You open the door (header 로그인, then Apple / Google / Browse), read the recency door, and stick from a bottom dock. What you stick snaps onto the door already tagged.

The product is Operate-mode. Brand lives in material details (gasket, magnets, clipping rotation) while controls stay familiar. Korean and English share one layout. Auth sits in a header sheet. Light is a peach porcelain kitchen; dark is a night kitchen. The pressable magnet is Jeju tangerine by default, or Jeju basalt when that palette is on.

**Key Characteristics:**
- Wordmark: MyBrary (KO and EN)
- Intro is the first public surface on porcelain peach / night kitchen (celadon if AI); peach kitchen shows before the door opens
- Header auth sheet is the white doorstep (light) or night enamel (dark)
- Centered capture column on every breakpoint
- Soft rounded clippings (18px), not razor-square paper and not identical SaaS cards
- Recency list to read; Stick docked at the thumb
- Personal voice: stick, peel, empty the door

## Colors

Restrained palette: one Jeju tangerine plus neutrals in the same hue family. Yellow-gray 미색 made the magnet look dirty. Complementary blue would pop the orange but would not be a kitchen.

### Primary
- **Jeju tangerine** (#e56f0a light, #f4a24a dark): Default magnet. Stick, Browse, KO/EN selected, tags, magnet discs, focus companion, FAB. Ink on tangerine is #2a1a08 so small type stays AA.
- **Jeju basalt** (#3a3936 light, #c8c6c1 dark): Test swap for that magnet. Same slots. Ink on dark stone is #f4f3f0; ink on light stone in dark mode is #1c1c1a. Does not retint the kitchen wall.
- **AI celadon** (#1f6b58 light, #7ecfb8 dark): Comparison theme. Magnet plus a cooler porcelain kitchen. Ink on celadon is #f4fbf8; ink on the light celadon in dark mode is #0e241c. Not zinc-blue SaaS and not purple.

### Neutral
- **Login white** (#ffffff): Light-mode header auth sheet only. No kitchen glow on that sheet. Intro and app sit on porcelain peach / night kitchen.
- **Porcelain peach** (#fff7f2 → #f3e7de): App kitchen wall. Same hue as hallabong (~28°), a few percent tangerine in white. Not yellow-beige #f5f1ea.
- **Warm enamel** (#fff6f0 / dark #302b26): Chrome fills on the door.
- **Deep enamel** (#f3e6dc / dark #27231f): Hover fills.
- **Hairline** (`color-mix(ink 12%, transparent)`): Switches, + button, menus. Not gasket charcoal.
- **Warm ink** (#322c26 / dark #f4eee6): Body and wordmark. Not near-black.
- **Kitchen mute** (#6e665c / dark #c5b8a8): Secondary copy. AA on peach and white (≥4.5:1).
- **Note paper** (#ffffff / dark #3c362f): Composer and clippings. White slips on a peach door.
- **Apple charcoal** (#3a342e): Auth Apple only. Warm, not #111.
- **Manila** (#ebc98a): Document slips.
- **Disc charcoal** (#3a342e): Audio clippings, one step up from void.

### Palettes

Header: brand plus a settings disc. Language, **기본** / **현무암** / **AI**, and light / system / dark live in that sheet, remembered on this device. Basalt keeps the peach kitchen wall. AI cools the wall and replaces the fridge main with one editorial feed.

- **Kitchen (default):** Magnet `#e56f0a` / dark `#f4a24a`. Fridge door. Stick dock at the bottom; magnets and tilted paper stay.
- **Jeju basalt:** Magnet `#3a3936` / dark `#c8c6c1`. Replaces the orange only. Ground stays porcelain peach / night kitchen. Same bottom Stick dock as kitchen.
- **AI celadon:** Magnet `#1f6b58` / dark `#7ecfb8`. Kitchen wall `#f4f6f5` → `#e8eeeb` / night `#1e2522` → `#161c1a`. Main is not the fridge door. Editorial magazine feed. Same bottom Stick dock. Same SUIT face. Same capture features.

### Named Rules
**The One Magnet Rule.** One accent at a time. It marks the thing you can press or the tag that names a type. It does not wash backgrounds.

**The Two Magnets Rule.** Default magnet is hallabong tangerine. 현무암 swaps that accent to Jeju basalt charcoal. Do not retint enamel, paper, or the kitchen wall when testing basalt. Sample photo SVGs must read `--magnet` (or the matching hex) at paint time; do not bake `#e56f0a`. The 견본 tag is hairline ink, not danger orange.

**The Stick Dock Rule.** After the door opens, Stick is a bottom dock on every palette (기본, 현무암, AI). Search and the recency list sit above it. Classify draft sits above the field, still in the dock. Intro has no dock. Do not put the composer back above the list.

**The AI Comparison Rule.** Header **AI** opens a second surface: celadon accent, cooler ground, and an editorial magazine feed. The bottom Stick dock is shared with the fridge palettes. Header and footer chrome stay. Fridge collage, magnet dots, and tilted paper do not. It is not a purple chat or zinc-blue SaaS skin. Switch back to 기본 or 현무암 to judge the incumbent fridge.

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
| sm | 18px | Theme glyphs, menu items, peel/edit, magnet disc, brand mark, Apple/Google auth |
| md | 22px | + button, lightbox close |
| lg | 24px | FAB |

The glyph is smaller than the hit target. Auth marks stay at the original 18px (`--icon-sm`) in a 48px control.

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

Header, door (main), footer. Compact header is brand, 로그인 when signed out, and settings. The door is the canvas. Intro, empty state, and clippings share a centered column. After entry, Stick is a fixed bottom dock on every palette; classify draft stacks above the field. AI editorial uses a wider magazine feed. Fridge clippings no longer stagger left; magnets sit on the center of each slip.

Intro is a full-bleed library still under the header, peach (or celadon) ground. The app capture column stays 36–40rem. Legal pages reuse the header/footer chrome.

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

- **Auth stack:** Apple charcoal, Google outlined, Browse tangerine. Vertical, in the header 로그인 sheet (32px radius). 48px controls, 18px marks, 15px label. Light sheet is `--login-wall` white.
- **Settings sheet:** One 40px disc in the header opens a 14px paper card (`role="dialog"`). After the title, the session chip (who is in, and where) sits at the top when a session exists. Then language, palette, appearance, and Leave. Escape, outside click, and the close disc dismiss it. Do not open it together with the 로그인 sheet. Not a purple modal and not a sidebar.
- **Palette switch:** Pill track, 40px cells. 기본 (tangerine swatch), 현무암 (basalt swatch), and AI (celadon swatch). Lives in the settings sheet. Default is tangerine.
- **Theme switch:** Light, system, and dark magnets in a pill track, 40px cells, 18px glyphs. Also in the settings sheet.
- **Composer:** Bottom dock after entry. 24px shell; 22px +; 15px field; Stick 48px / 14px. Focus ring follows the 24px shell (`:has(.composer-field:focus)`), not a square on the textarea and not a pill. AI uses `--radius-sm` on the same shell.
- **Classify draft:** A new Stick, paste, or drop replaces the open classify card in place. Editing a saved scrap still asks to save or cancel first.
- **+ menu:** 40px rows, 18px glyphs, hairline border.
- **Clipping:** Magnet 18px, caption tags 13px / `--control-tag` 26px tall, peel/edit 40px hits with 18px glyphs.
- **Search:** 48px capsule, 15px type. Type chips 34px / 13px. 일자별 chip in this row; month panel 18px radius under the tools, not a modal over the Stick dock.
- **Language magnets:** Pill switch, 40px cells, 13px KO/EN.
- **FAB:** 48px disc, 24px glyph.
- **Phish meter:** When Stick detects a web link, the draft shows an on-device URL-shape risk (낮음 / 주의 / 높음). Not a live blocklist and not a guarantee. Compact line on saved link scraps. Mid uses ink, not tangerine. High uses `--danger`.
- **Footer:** policy links (caption; privacy magnet/bold) then identity (micro). 비우기 is app-only. Empty operator fields read 표시 예정.

States required: hover, focus-visible, disabled (Stick), loading (OG skeleton), error (OG fallback copy), empty ("항목이 없습니다." / English equivalent), pressed (`:active` scale), enter/exit for views.

## Motion & interaction

These rules are binding for intro, header auth, capture, draft, list, calendar, menu, lightbox, and legal pages. Duration and easing live as CSS variables in [`css/styles.css`](css/styles.css): `--dur-fast` 140ms, `--dur-mid` 220ms, `--dur-slow` 320ms, `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`), `--ease-in` (`cubic-bezier(0.4, 0, 1, 1)`).

### Named rules

**The Quiet Door Rule.** Motion is short and decelerates. Nothing loops except the OG skeleton sheen. No bounce, no page-wide parallax, no confetti.

**The One Job Rule.** One transition at a time for a given surface: intro hands off to the app, the draft exits before the new clipping snaps on, the + menu and header sheets close before another overlay opens.

**The Reduced-Motion Rule.** `prefers-reduced-motion: reduce` turns off animation and transition, including hover-play on video/audio. Instant show/hide. Smooth scroll becomes `auto`. First paint after a saved session never plays the door-open motion.

### View changes

- **Open the door (intro → app):** current sheet exits down and fades (140ms in-ease). Capture view enters from 14px below (220ms out-ease). Settings Leave and footer Empty appear with the app. A returning session skips this and swaps instantly.
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
- **Two-step:** peel, Leave with a draft, and Empty the door arm for 4s, then revert. The second press does the work. No browser `confirm()`.
- **Drop:** composer background and dashed outline update on `--dur-fast`.

### Do not

- Animate width/height of the composer or list (use the existing auto-grow without a layout tween).
- Crossfade intro and app on top of each other (sequential handoff only).
- Persist `hidden` off during an exit; after the motion ends, `hidden` must go back on so the node leaves the accessibility tree.
- Loop intro demos while `prefers-reduced-motion: reduce` is on.

## Phase 4 — shipped surfaces

Binding against [ROADMAP.md](ROADMAP.md) Phase 4. Header stays brand + 로그인 + settings. Stick dock stays at the bottom.

### Named rules

**The Open Kitchen Rule.** First visit is an intro that shows the fridge job. Auth does not own the first viewport. Apple / Google / Browse live in the header. Browse and sign-in both open the door. A saved session still skips intro.

**The Demo Is The Product Rule.** Intro is a full-bleed library still (`assets/intro-hero.jpg`) filling below the header. Hero and **책장을 연다** sit on the photo. No 견본 / Sample on the still. Stick, classify, and find sit as hotspots on the matching objects: titles always visible, two short beats on hover or tap. App list samples stay labeled 견본 / Sample. Do not invent customers, download counts, testimonials, or AI claims. Do not build a purple SaaS landing, a phone farm of fake UI, or CSS widgets that impersonate the composer.

**The Day Magnet Rule.** 일자별 is a filter on the recency list, not a calendar product and not a second home. Counts are scraps stuck that local calendar day (`createdAt`). One selected day at a time. Combine with type, tag, and search. Inside a day, newest first.

**The Korean Footer Rule.** Intro and app show operator identity plus 이용약관 plus 개인정보처리방침. Privacy is easier to spot than the other links (bold or magnet). Placeholders until real operator data. Do not invent a 사업자등록번호 or 통신판매업 신고번호. 비우기 stays an app-only footer action.

### Intro

- Sticky compact header: brand, 로그인, settings (KO/EN, palette, theme live in the settings sheet).
- Hero uses `--text-display-hero` (clamp 2–3rem) once, overlaid top-left on the still with the magnet-fill CTA. A thin peach enamel gradient under the type. No glass blur. No kicker.
- The still is full-bleed under the header (`object-fit: cover`). No 4:3 card, no scrap radius. Titles sit on the catalog card, the linen book, and the holdings. The body is two short beats on hover or tap. No three-card stack. One job at a time.
- Primary CTA copy stays personal. Secondary is 둘러보기 if it is not already the primary.
- Ground: porcelain peach / night kitchen, kitchen glow allowed. AI intro follows celadon. Not a white marketing slab and not toner.

### Header auth

- 로그인 / Sign in is a 40–48px header control. Open state: paper sheet, `--radius-xl` 32px, Apple / Google / Browse stacked as today (48px, 18px marks).
- Light sheet: `--login-wall` white. Dark sheet: night enamel.
- Escape and click-outside close it. One Job: close the sheet before intro hands off to the app. Do not stack with settings.
- After session: chip + 나가기 in the settings sheet. Leave from the app returns to intro.

### 일자별 calendar

- Chip in `#list-tools` next to type chips. Open calendar is a paper panel under the tools, 18px radius, not a modal that covers the composer.
- Month grid. Days with scraps show a count in caption/micro. Empty days are muted. Selected day is magnet fill + magnet-ink. Today is a hairline ring, not magnet, unless it is also selected.
- Counts use local date of `createdAt`. Do not use UTC day if the user is in Korea (Asia/Seoul local).
- Coarse pointer: 40px day hits (`--control-sm`). Fine pointer may stay compact but not under 32px.

### Korean footer

- Two bands: policy links (caption) then identity (micro). Privacy link is distinct.
- Legal pages (`legal/terms.html`, `legal/privacy.html`) reuse header/footer chrome and SUIT. No new typeface.
- Identity values come from placeholders; empty looks like "표시 예정", never a made-up number.

## Do's and Don'ts

**Do**
- Speak like a personal box: stick, peel, empty the door, this device.
- Show the media itself (image, hover-play, OG, PDF first page).
- Label synthetic scraps as Sample / 견본.
- Keep KO and EN on one layout.
- Use the type / icon / control scale. Do not invent a one-off size.
- Keep fills inside the Cave Check. Porcelain peach kitchen, night kitchen, not toner. The header auth sheet is white in light mode.
- Honor `prefers-reduced-motion`.
- Keep two-step confirms for peel, Leave-with-draft, and Empty.
- Put auth in the header and counts on the day grid, not in a new information architecture.

**Don't**
- Build a Notion sidebar of equal cards, or a purple AI chat on cream.
- Use Inter, Space Grotesk, IBM Plex, Outfit, Plus Jakarta, DM Sans, or Instrument Sans as the UI face.
- Put camera on fine-pointer desktop as a dead control.
- Invent team, workspace, or research-lab language.
- Use em-dashes in product copy.
- Turn 일자별 into a scheduling calendar, heatmap product, or folders-by-month.
- Ship a login wall as the first page.

## Open UX gaps

Phases 1–4 of [ROADMAP.md](ROADMAP.md) are in the client. Phase 3 stays dormant until [`js/config.js`](js/config.js) has a project URL and anon key.

Fill operator identity in `js/config.js` `legal` when real. Do not reopen a Notion sidebar, folder tree, or AI chat on cream.

Code folders and layers: [ARCHITECTURE.md](ARCHITECTURE.md). Visual tokens, motion, and interaction rules stay in this file.
