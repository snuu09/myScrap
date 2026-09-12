import { useEffect, useState } from "react";

type Props = {
  src: string;
  /** Extra URLs to try if `src` fails (poster → og → media). */
  fallbackSrcs?: string[];
  kind?: "image" | "video" | "audio";
  className?: string;
  frameClassName?: string;
  /** List cards omit controls so the parent hit target stays a single navigation action. */
  controls?: boolean;
  /** Called when every candidate URL fails to load. */
  onExhausted?: () => void;
  /** First-screen gallery cards should not wait on lazy loading. */
  priority?: boolean;
};

function uniqueSrcs(primary: string, fallbacks: string[] = []) {
  const out: string[] = [];
  for (const value of [primary, ...fallbacks]) {
    const src = String(value || "").trim();
    if (src && !out.includes(src)) out.push(src);
  }
  return out;
}

/** Image / video / audio with enamel pulse skeleton until ready (or hide on error). */
export function ScrapMedia({
  src,
  fallbackSrcs = [],
  kind = "image",
  className = "scrap-card-media",
  frameClassName = "scrap-card-media-frame",
  controls = true,
  onExhausted,
  priority = false,
}: Props) {
  const candidates = uniqueSrcs(src, fallbackSrcs);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const active = candidates[index] || "";

  useEffect(() => {
    setIndex(0);
    setLoaded(false);
    setFailed(false);
  }, [src, candidates.join("|")]);

  if (failed || !active) return null;

  function advance() {
    const next = index + 1;
    if (next < candidates.length) {
      setIndex(next);
      setLoaded(false);
      return;
    }
    setFailed(true);
    onExhausted?.();
  }

  return (
    <div className={frameClassName + (kind === "audio" ? " scrap-card-media-frame--audio" : "")}>
      {!loaded && !priority ? <div className="scrap-card-media-skeleton" aria-hidden /> : null}
      {kind === "video" ? (
        <video
          key={active}
          src={active}
          className={className + (loaded ? " is-loaded" : "")}
          controls={controls}
          muted={!controls}
          playsInline
          preload="metadata"
          onLoadedData={() => setLoaded(true)}
          onError={advance}
        />
      ) : kind === "audio" ? (
        <audio
          key={active}
          src={active}
          className={"scrap-card-audio" + (loaded ? " is-loaded" : "")}
          controls={controls}
          preload="metadata"
          onLoadedData={() => setLoaded(true)}
          onError={advance}
        />
      ) : (
        <img
          key={active}
          src={active}
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          referrerPolicy="no-referrer"
          className={className + (loaded || priority ? " is-loaded" : "")}
          onLoad={() => setLoaded(true)}
          onError={advance}
        />
      )}
    </div>
  );
}
