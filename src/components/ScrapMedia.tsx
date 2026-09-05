import { useState } from "react";

type Props = {
  src: string;
  kind?: "image" | "video" | "audio";
  className?: string;
  frameClassName?: string;
  /** List cards omit controls so the parent hit target stays a single navigation action. */
  controls?: boolean;
};

/** Image / video / audio with enamel pulse skeleton until ready (or hide on error). */
export function ScrapMedia({
  src,
  kind = "image",
  className = "scrap-card-media",
  frameClassName = "scrap-card-media-frame",
  controls = true,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <div className={frameClassName + (kind === "audio" ? " scrap-card-media-frame--audio" : "")}>
      {!loaded ? <div className="scrap-card-media-skeleton" aria-hidden /> : null}
      {kind === "video" ? (
        <video
          src={src}
          className={className + (loaded ? " is-loaded" : "")}
          controls={controls}
          muted={!controls}
          playsInline
          preload="metadata"
          onLoadedData={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : kind === "audio" ? (
        <audio
          src={src}
          className={"scrap-card-audio" + (loaded ? " is-loaded" : "")}
          controls={controls}
          preload="metadata"
          onLoadedData={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className={className + (loaded ? " is-loaded" : "")}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
