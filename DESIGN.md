---
name: myScrap
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
  hairline: "color-mix(ink 12%, transparent)"
  dark-magnet: "#f4a24a"
  dark-enamel: "#302b26"
  dark-kitchen: "#2a2622"
  dark-kitchen-lo: "#1f1c19"
  dark-muted: "#c5b8a8"
  dark-ink: "#f4eee6"
typography:
  display:
    fontFamily: "SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "clamp(1.5rem, 1.15rem + 1.5vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.035em"
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
  xs: "16px"
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
  gutter: "20px"
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
    rounded: "{rounded.pill}"
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

# Design System: myScrap

## Overview

**Creative North Star: "The Kitchen Fridge Door"**

myScrap is a personal capture box, not a knowledge base. The surface is a warm enamel fridge door: rubber gasket, stainless handle, Jeju tangerine (hallabong) disc magnets, and paper clippings of uneven size. You open the door (sign in or browse), stick something in the freezer-band composer, and it snaps onto the door already tagged.

The product is Operate-mode. Brand lives in material details (gasket, magnets, clipping rotation) while controls stay familiar. Korean and English share one layout. Login is a white doorstep. After you open the door, light is a peach porcelain kitchen in the same hue as the tangerine magnet; dark is a night kitchen.

**Key Characteristics:**
- White login ground; peach porcelain door after sign-in; one Jeju tangerine magnet accent
- Centered capture column on every breakpoint
- Soft rounded clippings (18px), not razor-square paper and not identical SaaS cards
- Capture composer first; recency list second
- Personal voice: stick, peel, empty the door

## Colors

Restrained palette: one Jeju tangerine plus neutrals in the same hue family. Yellow-gray 미색 made the magnet look dirty. Complementary blue would pop the orange but would not be a kitchen.

### Primary
- **Jeju tangerine** (#e56f0a light, #f4a24a dark): Stick, Browse, KO/EN selected, tags, magnet discs, focus companion, FAB. Ink on tangerine is #2a1a08 so small type stays AA.

### Neutral
- **Login white** (#ffffff): Light-mode login wall and login sheet. No kitchen glow on the doorstep.
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

### Named Rules
**The One Magnet Rule.** Tangerine is the only accent. It marks the thing you can press or the tag that names a type. It does not wash backgrounds or glow.

**The White Doorstep.** Light login is white. The peach kitchen starts after the door opens. Dark login stays a night kitchen, not a white flash.

**The Cave Check.** Light kitchen wall stays porcelain peach (#fff7f2 → #f3e7de). Dark mode is a night kitchen (#2a2622 → #1f1c19), not #0c0b0a. If a fill looks like printer toner, lift it. Muted copy must stay AA on enamel (≥4.5:1): light #6e665c on #fff7f2 (~5.4:1); dark #c5b8a8 on #302b26 (~7.2:1).

## Type, icon, and control pattern

Closed scales. Do not invent a one-off size.

### Type (`--text-*`)

| Token | Size | Use |
| --- | --- | --- |
| display | clamp 1.5–1.75rem | Login lead |
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
| xs | 16px | Apple/Google auth marks |
| sm | 18px | Theme glyphs, menu items, peel/edit, magnet disc, brand mark |
| md | 22px | + button, lightbox close |
| lg | 24px | FAB |

The glyph is smaller than the hit target. Auth marks are 16px in a 48px control so they sit with 15px labels. Do not size brand logos at `--icon-md`.

### Controls (`--control-*`)

| Token | Height | Use |
| --- | --- | --- |
| tag | 26px | Clipping type tags |
| chip | 34px | Type chips, draft tags |
| sm | 40px | KO/EN, theme, + menu rows, peel/edit |
| md | 48px | Composer row, Stick, +, search, auth, FAB, draft save |

Auth, Stick, and + share 48px so the door and the login sheet feel like one system.

## Typography

**Display Font:** SUIT (with Apple SD Gothic Neo, Noto Sans KR)
**Body Font:** SUIT
**Label/Mono Font:** ui-monospace for file excerpts only

**Character:** A Korean-first grotesque that can hold both Hangul and Latin at UI sizes. One family for wordmark, buttons, tags, and body. Tight tracking on the login lead, not a display serif.

### Named Rules
**The One Face Rule.** Do not pair a Latin display serif or Inter-like default with SUIT. Hangul and English share the same cuts.

## Layout

Header, door (main), footer. The door is the canvas, centered in a 48rem frame. Login, composer, empty state, and clippings share a centered 36rem column. Clippings no longer stagger left; magnets sit on the center of each slip.

Gutter is fluid (`clamp(12px, 3.2vw, 24px)`). Door padding is fluid so resize does not jump. Composer becomes two-row when the door is under 560px (container query). Fridge handle hides under 640px door width. Camera control appears under 721px or coarse pointer, including DevTools width resize.

## Elevation & Depth

Hybrid: the login sheet and clippings lift off the kitchen wall with a soft, diffuse shadow plus a physical magnet disc. No neon glow.

### Shadow Vocabulary
- **Sheet** (`0 18px 40px rgba(50, 44, 38, 0.08)`): Login card and menus. Dark uses `rgba(0, 0, 0, 0.28)`.
- **Clipping** (`0 10px 28px rgba(50, 44, 38, 0.06)`): Paper on the door.
- **FAB** (`0 10px 22px` tangerine-tinted): Magnet floating off the wall.

### Named Rules
**The Offset Rule.** Shadows carry offset and blur. A colored halo is not depth.

**The Focus Follows Form Rule.** Every focusable control has a radius from the scale. The tangerine companion ring is `box-shadow` so it follows that radius. Composer focus sits on the pill bar. Do not leave focus on a child that has no radius (the composer textarea).

## Shapes

Soft squircles, not 90-degree stamps. Scale: 10 / 14 / 18 / 24 / 32, pills 999, discs 50%. Login sheet 32px. Composer is a pill so the tangerine focus ring is a capsule, not a rounded rectangle. Clippings and auth 18px. Stick and + 14px. Language and theme switches, search, and tags are pills. Magnets and FAB stay discs.

Slight clipping rotation (±0.45deg) on every third scrap. That is the fridge, not decoration for its own sake.

## Components

- **Auth stack:** Apple warm charcoal (#3a342e), Google outlined, Browse tangerine. Vertical, on a 32px login sheet. 48px controls, 16px marks, 15px label. Light login wall is white.
- **Theme switch:** Light, system, and dark magnets in a pill track, 40px cells, 18px glyphs.
- **Composer:** Pill bar; 22px +; 15px field; Stick 48px. Focus ring follows the capsule (`:has(.composer-field:focus)`), not a square around the textarea.
- **+ menu:** 40px rows, 18px glyphs, hairline border.
- **Clipping:** Magnet 18px, caption tags 13px / `--control-tag` 26px tall, peel/edit 40px hits with 18px glyphs.
- **Search:** 48px capsule, 15px type. Type chips 34px / 13px.
- **Language magnets:** Pill switch, 40px cells, 13px KO/EN.
- **FAB:** 48px disc, 24px glyph.

States required: hover, focus-visible, disabled (Stick), loading (OG skeleton), error (OG fallback copy), empty ("항목이 없습니다." / English equivalent), pressed (`:active` scale), enter/exit for views.

## Motion & interaction

These rules are binding for login, capture, draft, list, menu, and lightbox. Duration and easing live as CSS variables in [`css/styles.css`](css/styles.css): `--dur-fast` 140ms, `--dur-mid` 220ms, `--dur-slow` 320ms, `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`), `--ease-in` (`cubic-bezier(0.4, 0, 1, 1)`).

### Named rules

**The Quiet Door Rule.** Motion is short and decelerates. Nothing loops except the OG skeleton sheen. No bounce, no page-wide parallax, no confetti.

**The One Job Rule.** One transition at a time for a given surface: login hands off to the app, the draft exits before the new clipping snaps on, the + menu closes before another overlay opens.

**The Reduced-Motion Rule.** `prefers-reduced-motion: reduce` turns off animation and transition, including hover-play on video/audio. Instant show/hide. Smooth scroll becomes `auto`. First paint after a saved session never plays the door-open motion.

### View changes

- **Open the door (login → app):** login sheet exits down and fades (140ms in-ease). Capture view enters from 14px below (220ms out-ease). Header Leave / Empty appear with the app. A returning session skips this and swaps instantly.
- **Leave (app → login):** reverse. Draft, lightbox, and + menu dismiss first. Scraps clear after the app view has exited.
- **Draft:** classify-then-save panel uses the same sheet motion. Editing a saved scrap reuses the open panel (no second enter). Cancel and save wait for the exit before removing DOM.
- **+ menu:** pop from the plus control (140ms). Click outside, Escape, or picking an item closes it.
- **Lightbox:** dim fade plus a slight zoom on the photo. Backdrop, close control, and Escape share the same exit.
- **New clipping:** `magnet-snap` (220ms) as it sticks to the door. Filter/search only hide and show; they do not animate layout.
- **Back to top:** the FAB fades and rises when the app is scrolled. Hidden when the door is closed.

### Pointer and keys

- **Hover** (fine pointer only): clippings lift 3px; + and type chips darken or pick up a tangerine border. No hover lift on coarse pointers.
- **Pressed:** buttons scale to 0.98 (chips and FAB 0.96). Release returns on `--dur-fast`.
- **Focus-visible:** tangerine ring (`--focus`). The ring follows the control radius. Composer focus is the rounded bar, never a rectangle on the inner field. Never rely on hover color alone for the focused control.
- **Disabled Stick:** opacity 0.45, `not-allowed`, no press scale that implies it will fire.
- **Two-step:** peel, Leave with a draft, and Empty the door arm for 4s, then revert. The second press does the work. No browser `confirm()`.
- **Drop:** composer background and dashed outline update on `--dur-fast`.

### Do not

- Animate width/height of the composer or list (use the existing auto-grow without a layout tween).
- Crossfade login and app on top of each other (sequential handoff only).
- Persist `hidden` off during an exit; after the motion ends, `hidden` must go back on so the node leaves the accessibility tree.

## Do's and Don'ts

**Do**
- Speak like a personal box: stick, peel, empty the door, this device.
- Show the media itself (image, hover-play, OG, PDF first page).
- Label synthetic scraps as Sample / 견본.
- Keep KO and EN on one layout.
- Use the type / icon / control scale. Do not invent a one-off size.
- Keep fills inside the Cave Check. Porcelain peach kitchen, night kitchen, not toner. Login is white.
- Honor `prefers-reduced-motion`.
- Keep two-step confirms for peel, Leave-with-draft, and Empty.

**Don't**
- Build a Notion sidebar of equal cards, or a purple AI chat on cream.
- Use Inter, Space Grotesk, IBM Plex, Outfit, Plus Jakarta, DM Sans, or Instrument Sans as the UI face.
- Put camera on fine-pointer desktop as a dead control.
- Invent team, workspace, or research-lab language.
- Use em-dashes in product copy.

## Open UX gaps

Phase 1, 2, and 3 of [ROADMAP.md](ROADMAP.md) are in the client. Phase 3 stays dormant until [`js/config.js`](js/config.js) has a project URL and anon key. Do not reopen a Notion sidebar, folder tree, or AI chat on cream.

Code folders and layers: [ARCHITECTURE.md](ARCHITECTURE.md). Visual tokens, motion, and interaction rules stay in this file.
