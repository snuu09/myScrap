# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

static HTML / CSS / JS (user-specified; no framework)

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

Confirmed from brief:

- Responsive HTML/CSS/JS; header, main, footer.
- i18n: Korean, English.
- Auto-tag pasted/dropped content by type: text, image, video, audio, link, document extension.
- Link: Open Graph preview and basic site info.
- Image: show the image.
- Video: thumbnail; play on hover.
- Audio: thumbnail; play on hover.
- Document: tag by extension; page preview.
- + menu: clipboard, camera (mobile), photo, file.
- Placeholder: "붙여넣기 할 내용이나 파일을 첨부해주세요."
- Drag-and-drop analyzes dropped files.
- Recency-sorted tagged list; empty state; scroll-to-top FAB.

[Inferred] This version runs tagging and previews in the browser (MIME, URL, Open Graph fetch, object URLs). No backend, auth provider, or paid AI API is specified; Apple/Google buttons are UI flows that enter the app (demo auth). Data persists in localStorage for the session device.

[Undecided] Real OAuth, server-side AI tagging, accounts, and multi-device sync.

## Brand Commitments

- Product name: myScrap (repository).
- Voice: personal capture box, not a team knowledge base or research lab. Functional Korean/English UI copy; user-supplied placeholder and empty-state strings are binding.
- Main color: Jeju tangerine (hallabong). Light and dark modes are required.

## Evidence on Hand

No real user content, brand assets, or Open Graph corpus. Demonstration scraps must be labeled synthetic. Do not invent customers, accuracy claims, or pricing.

## Product Principles

1. Capture first: the composer is the product, not a settings-heavy library.
2. Show the thing: every type gets a real preview, not a generic file icon if media can render.
3. Recency over folders: newest tagged items lead until the user asks otherwise.
4. Same job on phone and desktop: camera appears only where it exists; everything else stays reachable.
5. Language is a switch, not a fork: KO/EN share one layout.

## Accessibility & Inclusion

[Inferred] Keyboard access to composer, + menu, list, and language switch. Visible focus. WCAG AA contrast. Honor `prefers-reduced-motion` for hover-play and motion. Camera control is mobile-only and must not appear as a dead desktop action.
