import { useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { usePrefs } from "../context/Prefs";
import { t } from "../i18n";

const COLLAPSE_CHARS = 480;

type Props = {
  text: string;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
  /** Optional control row under the title (e.g. open-link). */
  aside?: ReactNode;
};

/** Readable source excerpt with a short collapse for long paste/page text. */
export function SourceExcerpt({ text, className, titleClassName, bodyClassName, aside }: Props) {
  const { lang } = usePrefs();
  const clean = text.trim();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  if (!clean && !aside) return null;
  const long = clean.length > COLLAPSE_CHARS;
  const shown = !clean ? "" : long && !open ? clean.slice(0, COLLAPSE_CHARS).trimEnd() + "…" : clean;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (!next) {
      requestAnimationFrame(() => {
        toggleRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  }

  return (
    <div className={className || "draft-ai-block"}>
      <div className="source-excerpt-head">
        <p className={titleClassName || "list-tools-label"}>{t(lang, "aiOriginal")}</p>
        {aside}
      </div>
      {shown ? <p className={bodyClassName || "draft-ai-text"}>{shown}</p> : null}
      {long ? (
        <button
          ref={toggleRef}
          type="button"
          className="source-excerpt-toggle"
          aria-expanded={open}
          aria-label={t(lang, open ? "sourceShowLess" : "sourceShowMore")}
          onClick={toggle}
        >
          {open ? <ChevronUp className="size-4" strokeWidth={1.8} /> : <ChevronDown className="size-4" strokeWidth={1.8} />}
        </button>
      ) : null}
    </div>
  );
}
