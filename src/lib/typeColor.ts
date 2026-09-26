/** Warm Theme B cover washes (aligned with intro hero c1–c6). */
const TYPE_SPINE: Record<string, string> = {
  text: "#8a6a3d",
  image: "#6a7a68",
  video: "#7a5a62",
  audio: "#5a7060",
  link: "#5c6a78",
  document: "#8a7a68",
  unknown: "#6e665c",
};

const TYPE_COVER: Record<string, string> = {
  text: "#d8c8b2",
  image: "#c9d0c4",
  video: "#d5c3bb",
  audio: "#c4cfd3",
  link: "#c8c3cf",
  document: "#d9c9a9",
  unknown: "#d4cdc2",
};

function hashHue(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash % 360;
}

/** Built-in names first, then custom names that already have scraps. */
export function typeBookIds(counts: Record<string, number>, builtIn: readonly string[], loading: boolean) {
  const shown = loading ? [...builtIn] : builtIn.filter((type) => (counts[type] || 0) > 0);
  const extras = Object.keys(counts)
    .filter((type) => type !== "all" && type !== "bookmarked" && !builtIn.includes(type) && (counts[type] || 0) > 0)
    .sort((a, b) => a.localeCompare(b));
  return [...shown, ...extras];
}

/** Category spine color. "all" is magnet. Custom names stay muted and stable. */
export function spineColor(type: string) {
  if (type === "all") return "var(--color-magnet)";
  if (type === "bookmarked") return "var(--color-magnet-ink)";
  if (TYPE_SPINE[type]) return TYPE_SPINE[type];
  return `hsl(${hashHue(type)} 18% 46%)`;
}

/** Soft manila cover wash for gallery books (Theme B). */
export function coverWash(type: string) {
  if (type === "all" || type === "bookmarked") return "var(--color-manila)";
  if (TYPE_COVER[type]) return TYPE_COVER[type];
  return `hsl(${hashHue(type)} 18% 78%)`;
}
