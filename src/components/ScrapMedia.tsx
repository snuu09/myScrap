import { useState } from "react";

type Props = {
  src: string;
  className?: string;
  frameClassName?: string;
};

/** Image with enamel pulse skeleton until load (or hide on error). */
export function ScrapMedia({ src, className = "scrap-card-media", frameClassName = "scrap-card-media-frame" }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <div className={frameClassName}>
      {!loaded ? <div className="scrap-card-media-skeleton" aria-hidden /> : null}
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className={className + (loaded ? " is-loaded" : "")}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
