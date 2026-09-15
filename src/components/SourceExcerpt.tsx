import { useState } from "react";
import { usePrefs } from "../context/Prefs";
import { t } from "../i18n";

const COLLAPSE_CHARS = 480;

type Props = {
  text: string;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
  /** Optional control row under the title (e.g. open-link). */
  aside?: React.ReactNode;
};

/** Readable source excerpt with a short collapse for long paste/page text. */
export function SourceExcerpt({ text, className, titleClassName, bodyClassName, aside }: Props) {
  const { lang } = usePrefs();
  const clean = text.trim();
  const [open, setOpen] = useState(false);
  if (!clean && !aside) return null;
  const long = clean.length > COLLAPSE_CHARS;
  const shown = !clean ? "" : long && !open ? clean.slice(0, COLLAPSE_CHARS).trimEnd() + "…" : clean;
  return (
    <div className={className || "draft-ai-block"}>
      <div className="source-excerpt-head">
        <p className={titleClassName || "list-tools-label"}>{t(lang, "aiOriginal")}</p>
        {aside}
      </div>
      {shown ? <p className={bodyClassName || "draft-ai-text"}>{shown}</p> : null}
      {long ? (
        <button type="button" className="source-excerpt-toggle auth-link-utility" onClick={() => setOpen((v) => !v)}>
          {t(lang, open ? "sourceShowLess" : "sourceShowMore")}
        </button>
      ) : null}
    </div>
  );
}
