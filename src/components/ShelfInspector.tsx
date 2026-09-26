import { useNavigate } from "react-router-dom";
import { ArrowUpRight, X } from "lucide-react";
import { typeLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useT } from "../lib/useT";
import { ScrapMedia } from "./ScrapMedia";
import { DocumentMark } from "./DocumentMark";
import { formatWhen } from "../lib/time";
import { mediaKindOf } from "../lib/tagger";
import { scrapFaceTitle } from "../lib/scrapFace";
import type { Scrap } from "../lib/types";

type Props = {
  scrap: Scrap;
  onClose: () => void;
};

/** Deep-reading bullets: AI summary first, then the structured analysis, split on breaks. */
function bulletsFor(scrap: Scrap): string[] {
  const raw = [scrap.text, scrap.previewText].filter(Boolean).join("\n");
  return raw
    .split(/\n+/)
    .map((line) => line.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 6);
}

/** Desktop right-rail detail for the scrap selected on the shelf (≥960px only; see index.css). */
export function ShelfInspector({ scrap, onClose }: Props) {
  const { lang } = usePrefs();
  const t = useT();
  const navigate = useNavigate();

  const mediaKind = mediaKindOf(scrap.type, scrap.mime);
  const title = scrapFaceTitle(scrap, t("untitled"));
  const visual = mediaKind === "image" || mediaKind === "video";
  const thumb = scrap.posterUrl || scrap.og?.image || (visual ? scrap.dataUrl : "");
  const bullets = bulletsFor(scrap);

  return (
    <aside className="shelf-inspector" aria-label={title}>
      <div className="shelf-inspector-head">
        <div className="min-w-0">
          <h2 className="shelf-inspector-title">{title}</h2>
          <p className="shelf-inspector-meta">
            {typeLabel(lang, scrap.type)} · {formatWhen(scrap.createdAt, lang)}
          </p>
        </div>
        <button type="button" className="shelf-inspector-close" aria-label={t("close")} onClick={onClose}>
          <X className="size-[18px]" strokeWidth={1.8} />
        </button>
      </div>
      {thumb ? (
        <div className="shelf-inspector-media">
          <ScrapMedia
            key={thumb}
            src={thumb}
            kind={scrap.posterUrl || scrap.og?.image ? "image" : mediaKind || "image"}
            controls={false}
            className="detail-media-img"
            frameClassName="detail-media-frame"
          />
        </div>
      ) : scrap.filename ? (
        <DocumentMark
          extension={scrap.extension}
          mime={scrap.mime}
          type={scrap.type}
          filename={scrap.filename}
          size="lg"
        />
      ) : null}
      {bullets.length ? (
        <ul className="shelf-inspector-bullets">
          {bullets.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      ) : null}
      {scrap.memo ? <p className="shelf-inspector-memo">{scrap.memo}</p> : null}
      <button
        type="button"
        className="auth-link-utility shelf-inspector-open"
        onClick={() => navigate(`/scrap/${scrap.id}`)}
      >
        {t("scrapDetail")}
        <ArrowUpRight className="ml-1 inline size-4" strokeWidth={1.8} />
      </button>
    </aside>
  );
}
