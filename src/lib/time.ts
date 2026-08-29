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

/** Local calendar date for trial end display (YYYY-MM-DD). */
export function formatTrialEndDate(ms: number, _lang: "ko" | "en" = "ko") {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
