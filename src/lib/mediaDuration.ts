/** Format seconds as m:ss or h:mm:ss for media duration badges. */
export function formatMediaDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "";
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

/**
 * Probe HTML media metadata duration for a playable URL.
 * Returns seconds, or null when unavailable / CORS / invalid.
 */
export function probeMediaDuration(src: string, kind: "video" | "audio"): Promise<number | null> {
  if (!src) return Promise.resolve(null);

  return new Promise((resolve) => {
    const el = document.createElement(kind);
    let settled = false;
    const finish = (value: number | null) => {
      if (settled) return;
      settled = true;
      el.removeAttribute("src");
      try {
        el.load();
      } catch {
        /* ignore */
      }
      resolve(value);
    };

    const timer = window.setTimeout(() => finish(null), 4000);
    el.preload = "metadata";
    if (kind === "video") {
      (el as HTMLVideoElement).muted = true;
      (el as HTMLVideoElement).playsInline = true;
    }
    el.onloadedmetadata = () => {
      window.clearTimeout(timer);
      const d = el.duration;
      finish(Number.isFinite(d) && d > 0 ? d : null);
    };
    el.onerror = () => {
      window.clearTimeout(timer);
      finish(null);
    };
    el.src = src;
  });
}
