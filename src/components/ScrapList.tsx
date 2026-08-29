import { X } from "lucide-react";
import { t, typeLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import type { Scrap, ScrapType } from "../lib/types";
import { formatWhen } from "../lib/time";
import { formatBytes } from "../lib/tagger";

const TYPES: ScrapType[] = ["text", "image", "video", "audio", "link", "document"];

type Props = {
  scraps: Scrap[];
  query: string;
  typeFilter: ScrapType | "all";
  onQuery: (value: string) => void;
  onType: (value: ScrapType | "all") => void;
  onPeel: (scrap: Scrap) => void;
};

export function ScrapList({ scraps, query, typeFilter, onQuery, onType, onPeel }: Props) {
  const { lang } = usePrefs();
  const q = query.trim().toLowerCase();
  const visible = scraps.filter((item) => {
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (!q) return true;
    const blob = [item.title, item.text, item.memo, item.url, item.filename, item.tags.join(" ")]
      .join(" ")
      .toLowerCase();
    return blob.includes(q);
  });

  return (
    <div className="mx-auto flex w-full max-w-[40rem] flex-col gap-4 px-[var(--gutter)] py-4">
      <label className="grid gap-1 text-[0.8125rem] text-muted">
        {t(lang, "searchLabel")}
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={t(lang, "searchPlaceholder")}
          className="min-h-10 rounded-full border border-paper-line bg-paper px-4 text-[0.9375rem] text-ink"
        />
      </label>
      <div className="flex flex-wrap gap-1.5" role="group">
        <button
          type="button"
          className={"min-h-[34px] rounded-full px-3 text-[0.8125rem] " + (typeFilter === "all" ? "bg-magnet text-magnet-ink" : "bg-paper")}
          onClick={() => onType("all")}
        >
          {t(lang, "filterAll")}
        </button>
        {TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className={"min-h-[34px] rounded-full px-3 text-[0.8125rem] " + (typeFilter === type ? "bg-magnet text-magnet-ink" : "bg-paper")}
            onClick={() => onType(type)}
          >
            {typeLabel(lang, type)}
          </button>
        ))}
      </div>
      {!scraps.length ? (
        <div>
          <p className="m-0 text-[1.0625rem] font-semibold">{t(lang, "empty")}</p>
          <p className="mt-1 text-[0.9375rem] text-muted">{t(lang, "emptyHint")}</p>
        </div>
      ) : !visible.length ? (
        <p className="text-muted">{t(lang, "noMatches")}</p>
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0">
          {visible.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-[18px] border border-paper-line bg-paper shadow-[var(--shadow-scrap)]">
              {item.dataUrl && item.type === "image" ? (
                <img src={item.dataUrl} alt="" className="max-h-64 w-full object-cover" />
              ) : null}
              <div className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="m-0 text-[1.0625rem] font-semibold">{item.title || t(lang, "untitled")}</p>
                    <p className="m-0 text-[0.75rem] text-muted">
                      {typeLabel(lang, item.type)} · {formatWhen(item.createdAt, lang)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="grid size-10 place-items-center text-muted"
                    aria-label={t(lang, "deleteItem")}
                    onClick={() => {
                      if (window.confirm(t(lang, "peelConfirm"))) onPeel(item);
                    }}
                  >
                    <X className="size-4" strokeWidth={1.8} />
                  </button>
                </div>
                {item.text && item.type !== "image" ? (
                  <p className="m-0 whitespace-pre-wrap text-[0.9375rem] text-ink-soft">{item.text}</p>
                ) : null}
                {item.url ? (
                  <a href={item.url} className="break-all text-[0.8125rem] text-magnet" target="_blank" rel="noreferrer">
                    {t(lang, "openLink")}
                  </a>
                ) : null}
                {item.filename ? (
                  <p className="m-0 text-[0.75rem] text-muted">
                    {item.filename} · {formatBytes(item.size)}
                  </p>
                ) : null}
                {item.memo ? <p className="m-0 text-[0.9375rem]">{item.memo}</p> : null}
                <p className="m-0 flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-enamel px-2 py-0.5 text-[0.75rem] text-muted">
                      {tag}
                    </span>
                  ))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
