import { useState } from "react";
import { usePrefs } from "../context/Prefs";
import { t } from "../i18n";

const COLLAPSE_CHARS = 480;

type Props = {
  text: string;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
};

/** Readable source excerpt with a short collapse for long paste/page text. */
export function SourceExcerpt({ text, className, titleClassName, bodyClassName }: Props) {
  const { lang } = usePrefs();
  const clean = text.trim();
  const [open, setOpen] = useState(false);
  if (!clean) return null;
  const long = clean.length > COLLAPSE_CHARS;
  const shown = long && !open ? clean.slice(0, COLLAPSE_CHARS).trimEnd() + "…" : clean;
  return (
    <div className={className || "draft-ai-block"}>
      <p className={titleClassName || "list-tools-label"}>{t(lang, "aiOriginal")}</p>
      <p className={bodyClassName || "draft-ai-text"}>{shown}</p>
      {long ? (
        <button type="button" className="source-excerpt-toggle auth-link-utility" onClick={() => setOpen((v) => !v)}>
          {t(lang, open ? "sourceShowLess" : "sourceShowMore")}
        </button>
      ) : null}
    </div>
  );
}
