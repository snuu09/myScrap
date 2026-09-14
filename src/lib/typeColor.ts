const TYPE_SPINE: Record<string, string> = {
  text: "#8a6a3d",
  image: "#3d6b8a",
  video: "#6b4a8a",
  audio: "#4a7a62",
  link: "#3d5c8a",
  document: "#8a7a68",
  unknown: "#6e665c",
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
    .filter((type) => type !== "all" && !builtIn.includes(type) && (counts[type] || 0) > 0)
    .sort((a, b) => a.localeCompare(b));
  return [...shown, ...extras];
}

/** Category spine color. "all" is magnet. Custom names stay muted and stable. */
export function spineColor(type: string) {
  if (type === "all") return "var(--color-magnet)";
  if (TYPE_SPINE[type]) return TYPE_SPINE[type];
  return `hsl(${hashHue(type)} 18% 46%)`;
}
