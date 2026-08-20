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
  none: "0px"
  sm: "4px"
  door: "22px"
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
    rounded: "{rounded.sm}"
    padding: "10px 16px"
    height: "48px"
  button-google:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
    height: "48px"
  button-icon:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0px"
    size: "44px"
    height: "44px"
    width: "44px"
  input-composer:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
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
    rounded: "{rounded.none}"
    padding: "14px"
---

# Design System: myScrap

## Overview

**Creative North Star: "The Kitchen Fridge Door"**

myScrap is a personal capture box, not a knowledge base. The surface is a warm enamel fridge door: rubber gasket, stainless handle, Jeju tangerine (hallabong) disc magnets, and paper clippings of uneven size. You open the door (sign in or browse), stick something in the freezer-band composer, and it snaps onto the door already tagged.

The product is Operate-mode. Brand lives in material details (gasket, magnets, clipping rotation) while controls stay familiar. Korean and English share one layout. Light is a daytime kitchen; dark is a night kitchen. Both keep the same tangerine magnet.

**Key Characteristics:**
- Warm enamel ground, one Jeju tangerine magnet accent
- Centered capture column on every breakpoint
- Square clippings, not equal rounded cards
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

Hybrid: the door lifts off the kitchen wall with an offset shadow; clippings sit with a smaller offset shadow plus a physical magnet disc. No zero-offset glow.

### Shadow Vocabulary
- **Door** (`6px 10px 22px rgba(28, 35, 41, 0.18)`): The enamel slab.
- **Clipping** (`3px 5px 12px rgba(28, 35, 41, 0.16)`): Paper on the door.
- **FAB** (`3px 6px 14px` tangerine-tinted): Magnet floating off the wall.

### Named Rules
**The Offset Rule.** Shadows carry offset and blur. A colored halo is not depth.

## Shapes

Door radius 22px (16px mobile). Clippings and composer are square (0). Tags are pills. Magnets and FAB are discs. Auth buttons 4px, just enough to feel pressable without becoming cards.

Slight clipping rotation (±0.45deg) on every third scrap. That is the fridge, not decoration for its own sake.

## Components

- **Auth stack:** Apple, Google outlined, Browse tangerine. Vertical, not a three-up marketing row.
- **Theme switch:** Light and dark magnets in the header, next to KO/EN. Default follows the system until the user picks.
- **Composer:** Paper field, 44px + button, textarea, Stick. Drop overlay uses a dashed magnet outline.
- **+ menu:** Fixed overlay so the door's overflow cannot clip it. Keyboard: Escape, arrows, Enter.
- **Clipping:** Magnet disc, type pills, timestamp, peel control, type-specific preview.
- **FAB:** Disc, bottom-right, hidden at scroll top.
- **Language magnets:** Two-cell switch in the header.

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

North star above stays. These states and controls are specified or implied and not fully in the UI yet. Sequence and checkboxes: [ROADMAP.md](ROADMAP.md) Phase 2.

- **Disabled Stick.** CSS has `.send-btn:disabled`; the button does not disable when the composer is empty (Phase 1 wires the behavior).
- **Missing media.** Quota or ephemeral files can strip `dataUrl`. Show a filename slip, not a broken image or silent empty frame.
- **Unsaved draft.** Leave and empty-the-door can drop a draft with no warning.
- **Theme.** Light and dark magnets exist. After a pick, there is no way back to system.
- **Edit clipping.** Saved scraps only peel. Type, tags, and memo should reopen.
- **Composer grow.** Textarea stays `rows="1"` while paste can be longer.
- **Ask otherwise.** Recency is shipped. Type chips, tag click-to-filter, and a light search field are not.
- **Lightbox and file actions.** Photos have no enlarge. Links have no copy-URL control. Files have no save/open when media is stored.
- **Peel confirm.** Empty the door is two-step; a single peel is immediate.
