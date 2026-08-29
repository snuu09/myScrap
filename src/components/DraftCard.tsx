import { t, typeLabel, detectedLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import type { Scrap } from "../lib/types";
import { formatBytes } from "../lib/tagger";

type Props = {
  draft: Scrap;
  onChange: (patch: Partial<Scrap>) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function AnalyzeSkeleton() {
  const { lang } = usePrefs();
  return (
    <div className="rounded-[18px] border border-paper-line bg-paper p-4 shadow-[var(--shadow-scrap)]" aria-busy="true">
      <p className="m-0 mb-3 text-[0.8125rem] text-muted">{t(lang, "analyzing")}</p>
      <div className="mb-2 h-4 w-2/5 animate-pulse rounded bg-enamel-ink" />
      <div className="mb-2 h-3 w-4/5 animate-pulse rounded bg-enamel-ink" />
      <div className="h-24 animate-pulse rounded-[14px] bg-enamel-deep" />
    </div>
  );
}

export function DraftCard({ draft, onChange, onSave, onCancel }: Props) {
  const { lang } = usePrefs();
  if (draft.analyzing) return <AnalyzeSkeleton />;

  return (
    <form
      className="flex flex-col gap-3 rounded-[18px] border border-paper-line bg-paper p-4 shadow-[var(--shadow-scrap)]"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <p className="m-0 text-[0.8125rem] font-semibold">{t(lang, "classifyTitle")}</p>
      <p className="m-0 text-[0.8125rem] text-muted">{detectedLabel(lang, draft.type)}</p>
      {draft.dataUrl && draft.type === "image" ? (
        <img src={draft.dataUrl} alt="" className="max-h-48 rounded-[14px] object-cover" />
      ) : null}
      {draft.url ? (
        <a href={draft.url} className="break-all text-[0.8125rem] text-magnet" target="_blank" rel="noreferrer">
          {draft.url}
        </a>
      ) : null}
      <label className="grid gap-1 text-[0.8125rem] text-muted">
        {t(lang, "untitled")}
        <input
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="min-h-10 rounded-[14px] border border-paper-line bg-enamel px-3 text-[1rem] text-ink"
        />
      </label>
      <p className="m-0 flex flex-wrap gap-1.5">
        {(draft.tags.length ? draft.tags : [draft.type]).map((tag) => (
          <span key={tag} className="rounded-full border border-paper-line px-2 py-0.5 text-[0.75rem]">
            {tag === draft.type ? typeLabel(lang, tag) : tag}
          </span>
        ))}
      </p>
      {draft.filename ? (
        <p className="m-0 text-[0.75rem] text-muted">
          {draft.filename} · {formatBytes(draft.size)}
        </p>
      ) : null}
      <textarea
        value={draft.memo}
        onChange={(e) => onChange({ memo: e.target.value })}
        placeholder={t(lang, "memoPlaceholder")}
        rows={2}
        className="rounded-[14px] border border-paper-line bg-enamel px-3 py-2 text-[0.9375rem] text-ink"
      />
      <div className="flex justify-end gap-2">
        <button type="button" className="min-h-10 px-3 text-[0.9375rem]" onClick={onCancel}>
          {t(lang, "cancel")}
        </button>
        <button type="submit" className="min-h-10 rounded-full bg-magnet px-4 font-bold text-magnet-ink">
          {t(lang, "save")}
        </button>
      </div>
    </form>
  );
}
