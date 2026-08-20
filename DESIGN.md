---
name: myScrap
description: Personal fridge-door capture box for web clippings, photos, and files.
colors:
  magnet: "#e56f0a"
  magnet-deep: "#c85c08"
  magnet-ink: "#1a1208"
  enamel: "#f3eee6"
  enamel-deep: "#e7dfd2"
  enamel-ink: "#d4cbbd"
  gasket: "#2a2622"
  gasket-soft: "#4a433c"
  ink: "#1c1610"
  ink-soft: "#3d342c"
  muted: "#5c5349"
  paper: "#fff8ef"
  photo-mat: "#f7f3ec"
  manila: "#e8c57a"
  manila-ink: "#5a4318"
  disc: "#2c2722"
  danger: "#9b2c1a"
  kitchen-wall: "#e4ddd3"
  dark-magnet: "#f3993a"
  dark-enamel: "#221e1a"
  dark-ink: "#f6efe6"
typography:
  display:
    fontFamily: "SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 750
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: "SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.01em"
  label:
    fontFamily: "SUIT, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.01em"
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
    padding: "10px 16px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.magnet-deep}"
    textColor: "{colors.magnet-ink}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
    height: "48px"
  button-apple:
    backgroundColor: "#111417"
    textColor: "{colors.magnet-ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "48px"
  button-google:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "48px"
  button-icon:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0px"
    size: "44px"
    height: "44px"
    width: "44px"
  input-composer:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "10px 8px"
  chip-tag:
    backgroundColor: "{colors.magnet}"
    textColor: "{colors.magnet-ink}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "22px"
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

The product is Operate-mode. Brand lives in material details (gasket, magnets, clipping rotation) while controls stay familiar. Korean and English share one layout. Light is a daytime kitchen; dark is a night kitchen. Both keep the same tangerine magnet.

**Key Characteristics:**
- Warm enamel ground, one Jeju tangerine magnet accent
- Centered capture column on every breakpoint
- Soft rounded clippings (18px), not razor-square paper and not identical SaaS cards
- Capture composer first; recency list second
- Personal voice: stick, peel, empty the door

## Colors

Restrained palette: warm kitchen neutrals plus one Jeju tangerine. Accent is for primary actions, selected language, theme switch, type tags, and magnet discs.

### Primary
- **Jeju tangerine** (#e56f0a light, #f3993a dark): Stick button, Browse, KO/EN selected, tags, magnet discs, focus ring companion, FAB. Ink on tangerine is #1a1208 so small type stays readable.

### Neutral
- **Warm enamel** (#f3eee6 / dark #221e1a): Door field.
- **Deep enamel** (#e7dfd2 / dark #181512): Freezer band behind the composer.
- **Gasket charcoal** (#2a2622 / dark #0e0c0a): Door lip and menu borders.
- **Graphite ink** (#1c1610 / dark #f6efe6): Body text and wordmark.
- **Kitchen mute** (#5c5349 / dark #b7aa9c): Secondary copy, tinted toward the enamel.
- **Note paper** (#fff8ef / dark #2b261f): Composer and default clipping stock.
- **Manila** (#e8c57a): Document slips.
- **Disc charcoal** (#2c2722): Audio clippings.

### Named Rules
**The One Magnet Rule.** Tangerine is the only accent. It marks the thing you can press or the tag that names a type. It does not wash backgrounds or glow.

## Typography

**Display Font:** SUIT (with Apple SD Gothic Neo, Noto Sans KR)
**Body Font:** SUIT
**Label/Mono Font:** ui-monospace for file excerpts only

**Character:** A Korean-first grotesque that can hold both Hangul and Latin at UI sizes. One family for wordmark, buttons, tags, and body. Tight tracking on the login lead, not a display serif.

### Hierarchy
- **Display** (700, 1.75rem / 1.5rem mobile, 1.2): Login lead.
- **Headline** (750, 1.25rem, 1.2): Wordmark.
- **Title** (700, 1rem, 1.3): Link and document titles.
- **Body** (400, 15px, 1.45): UI copy and notes.
- **Label** (700, 0.75rem): Type tags and timestamps.

### Named Rules
**The One Face Rule.** Do not pair a Latin display serif or Inter-like default with SUIT. Hangul and English share the same cuts.

## Layout

Header, door (main), footer. The door is the canvas, centered in a 48rem frame. Login, composer, empty state, and clippings share a centered 36rem column. Clippings no longer stagger left; magnets sit on the center of each slip.

Gutter is fluid (`clamp(12px, 3.2vw, 24px)`). Door padding is fluid so resize does not jump. Composer becomes two-row when the door is under 560px (container query). Fridge handle hides under 640px door width. Camera control appears under 721px or coarse pointer, including DevTools width resize.

## Elevation & Depth

Hybrid: the login sheet and clippings lift off the kitchen wall with a soft, diffuse shadow plus a physical magnet disc. No neon glow.

### Shadow Vocabulary
- **Sheet** (`0 18px 40px rgba(28, 22, 16, 0.12)`): Login card and menus.
- **Clipping** (`0 10px 28px rgba(28, 22, 16, 0.08)`): Paper on the door.
- **FAB** (`0 10px 22px` tangerine-tinted): Magnet floating off the wall.

### Named Rules
**The Offset Rule.** Shadows carry offset and blur. A colored halo is not depth.

## Shapes

Soft squircles, not 90-degree stamps. Scale: 10 / 14 / 18 / 24 / 32, pills 999, discs 50%. Login sheet 32px. Composer 24px. Clippings and auth 18px. Fields and Stick 14px. Language and theme switches, search, and tags are pills. Magnets and FAB stay discs.

Slight clipping rotation (±0.45deg) on every third scrap. That is the fridge, not decoration for its own sake.

## Components

- **Auth stack:** Apple, Google outlined, Browse tangerine. Vertical, on a 32px login sheet. Not a three-up marketing row.
- **Theme switch:** Light, system, and dark magnets in a pill track in the header, next to KO/EN. Default follows the system until the user picks. System remains available after a pick.
- **Composer:** Rounded paper field (24px), 44px + button, textarea, Stick. Drop overlay uses a dashed magnet outline.
- **+ menu:** Rounded overlay so the door's overflow cannot clip it. Keyboard: Escape, arrows, Enter.
- **Clipping:** Magnet disc, type pills, timestamp, peel control, type-specific preview in an 18px sheet.
- **Search:** Capsule field above the list.
- **FAB:** Disc, bottom-right, hidden at scroll top.
- **Language magnets:** Pill switch in the header.

States required: hover, focus-visible, disabled (Stick), loading (OG skeleton), error (OG fallback copy), empty ("항목이 없습니다." / English equivalent).

## Do's and Don'ts

**Do**
- Speak like a personal box: stick, peel, empty the door, this device.
- Show the media itself (image, hover-play, OG, PDF first page).
- Label synthetic scraps as Sample / 견본.
- Keep KO and EN on one layout.

**Don't**
- Build a Notion sidebar of equal cards, or a purple AI chat on cream.
- Use Inter, Space Grotesk, IBM Plex, Outfit, Plus Jakarta, DM Sans, or Instrument Sans as the UI face.
- Put camera on fine-pointer desktop as a dead control.
- Invent team, workspace, or research-lab language.
- Use em-dashes in product copy.

## Open UX gaps

Phase 1, 2, and 3 of [ROADMAP.md](ROADMAP.md) are in the client. Phase 3 stays dormant until [`js/config.js`](js/config.js) has a project URL and anon key. Do not reopen a Notion sidebar, folder tree, or AI chat on cream.

Code folders and layers: [ARCHITECTURE.md](ARCHITECTURE.md). Visual tokens stay in this file.
