export function formatWhen(ts: number, lang: "ko" | "en") {
  const delta = Date.now() - ts;
  if (delta < 45_000) return lang === "en" ? "Just now" : "방금";
  if (delta < 3_600_000) {
    const n = Math.max(1, Math.round(delta / 60_000));
    return lang === "en" ? n + "m ago" : n + "분 전";
  }
  const d = new Date(ts);
  return d.toLocaleString(lang === "en" ? "en" : "ko", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
