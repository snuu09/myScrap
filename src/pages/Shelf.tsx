import { useCallback, useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useAuth } from "../context/Auth";
import { DraftCard } from "../components/DraftCard";
import { ScrapList } from "../components/ScrapList";
import { StickDock } from "../components/StickDock";
import { requestAnalyze } from "../lib/analyze";
import { deleteScrap, loadScraps, saveScrap, uploadMedia } from "../lib/scraps";
import { analyzeFile, analyzeText, uid } from "../lib/tagger";
import type { Scrap, ScrapType } from "../lib/types";

function blankScrap(partial: Partial<Scrap>): Scrap {
  const now = Date.now();
  return {
    id: uid(),
    createdAt: now,
    updatedAt: now,
    type: "text",
    tags: ["text"],
    title: "",
    text: "",
    url: "",
    filename: "",
    mime: "",
    extension: "",
    size: 0,
    dataUrl: "",
    previewText: "",
    sample: false,
    storedMedia: false,
    domain: "",
    error: "",
    memo: "",
    mediaPath: "",
    ...partial,
  };
}

export function Shelf() {
  const { lang } = usePrefs();
  const { user } = useAuth();
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [draft, setDraft] = useState<Scrap | null>(null);
  const [composer, setComposer] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ScrapType | "all">("all");
  const [dropping, setDropping] = useState(false);
  const [error, setError] = useState("");
  const [top, setTop] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      setScraps(await loadScraps(user));
    } catch {
      setError(t(lang, "syncError"));
    }
  }, [user, lang]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    function onScroll() {
      setTop(window.scrollY > 240);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function busyGuard() {
    if (draft) {
      window.alert(t(lang, "draftBusy"));
      return true;
    }
    return false;
  }

  async function startFromText(raw: string) {
    const text = raw.trim();
    if (!text || !user) return;
    if (busyGuard()) return;
    const hint = analyzeText(text);
    const next = blankScrap({
      type: hint.type,
      tags: hint.tags,
      title: hint.title,
      text: hint.body,
      url: hint.url,
      domain: hint.domain,
      analyzing: true,
    });
    setDraft(next);
    setComposer("");
    const ai = await requestAnalyze({ kind: "text", text });
    setDraft((cur) =>
      cur && cur.id === next.id
        ? {
            ...cur,
            analyzing: false,
            type: ai.type,
            tags: ai.tags,
            title: ai.title || cur.title,
            text: ai.body || cur.text,
            url: ai.url || cur.url,
            domain: ai.domain || cur.domain,
          }
        : cur,
    );
  }

  async function startFromFiles(list: FileList | File[]) {
    if (!user) return;
    if (busyGuard()) return;
    const file = Array.from(list)[0];
    if (!file) return;
    const hint = analyzeFile(file);
    const next = blankScrap({
      type: hint.type,
      tags: hint.tags,
      title: hint.title,
      filename: hint.filename,
      mime: hint.mime,
      extension: hint.extension,
      size: hint.size,
      analyzing: true,
    });
    setDraft(next);
    try {
      const uploaded = await uploadMedia(user, next, file);
      next.mediaPath = uploaded.mediaPath;
      next.dataUrl = uploaded.dataUrl;
      next.storedMedia = uploaded.storedMedia;
      setDraft({ ...next });
      const ai = await requestAnalyze({
        kind: "file",
        mediaPath: uploaded.mediaPath,
        mime: hint.mime,
        filename: hint.filename,
      });
      setDraft((cur) =>
        cur && cur.id === next.id
          ? {
              ...cur,
              analyzing: false,
              type: ai.type,
              tags: ai.tags,
              title: ai.title || cur.title,
              text: ai.body || cur.text,
              storedMedia: uploaded.storedMedia,
              mediaPath: uploaded.mediaPath,
              dataUrl: uploaded.dataUrl,
            }
          : cur,
      );
    } catch {
      setDraft((cur) => (cur && cur.id === next.id ? { ...cur, analyzing: false, error: "upload" } : cur));
      setError(t(lang, "errorFile"));
    }
  }

  async function persist() {
    if (!user || !draft || draft.analyzing) return;
    const saved = { ...draft, updatedAt: Date.now(), analyzing: false };
    try {
      await saveScrap(user, saved);
      setDraft(null);
      await refresh();
    } catch {
      setError(t(lang, "syncError"));
    }
  }

  async function peel(item: Scrap) {
    if (!user) return;
    try {
      await deleteScrap(user, item);
      await refresh();
    } catch {
      setError(t(lang, "syncError"));
    }
  }

  return (
    <div
      className="flex min-h-[calc(100dvh-60px-7.5rem)] flex-col"
      onDragOver={(e) => {
        e.preventDefault();
        setDropping(true);
      }}
      onDragLeave={() => setDropping(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropping(false);
        if (e.dataTransfer.files.length) void startFromFiles(e.dataTransfer.files);
        else {
          const text = e.dataTransfer.getData("text/plain");
          if (text) void startFromText(text);
        }
      }}
    >
      <div className="flex-1">
        {error ? <p className="mx-auto max-w-[40rem] px-[var(--gutter)] pt-3 text-[0.8125rem] text-danger">{error}</p> : null}
        {draft ? (
          <div className="mx-auto max-w-[40rem] px-[var(--gutter)] pt-4">
            <DraftCard
              draft={draft}
              onChange={(patch) => setDraft((cur) => (cur ? { ...cur, ...patch } : cur))}
              onSave={() => void persist()}
              onCancel={() => {
                if (window.confirm(t(lang, "leaveDraftConfirm"))) setDraft(null);
              }}
            />
          </div>
        ) : null}
        <ScrapList
          scraps={scraps}
          query={query}
          typeFilter={typeFilter}
          onQuery={setQuery}
          onType={setTypeFilter}
          onPeel={(item) => void peel(item)}
        />
      </div>
      <StickDock
        value={composer}
        onChange={setComposer}
        onSubmitText={() => void startFromText(composer)}
        onFiles={(files) => void startFromFiles(files)}
        dropping={dropping}
      />
      {top ? (
        <button
          type="button"
          className="fixed right-[var(--gutter)] bottom-28 grid size-12 place-items-center rounded-full bg-magnet text-magnet-ink shadow-[0_10px_22px_rgb(208_102_18/0.26)]"
          aria-label={t(lang, "scrollTop")}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUp className="size-[22px]" strokeWidth={1.8} />
        </button>
      ) : null}
    </div>
  );
}
