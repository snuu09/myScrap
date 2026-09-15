import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Combine, Search, X } from "lucide-react";
import { usePrefs } from "../context/Prefs";
import { useT } from "../lib/useT";
import { sheetGenieClass, usePresence } from "../lib/presence";
import { blankScrap } from "../lib/blankScrap";
import { requestAnalyze } from "../lib/analyze";
import { fetchOgPreview } from "../lib/og";
import { linkScraps } from "../lib/links";
import { filterScraps } from "../lib/scrapFilters";
import { looksLikeAddress, scrapCover, scrapFaceTitle, shelfTitle } from "../lib/scrapFace";
import { analyzeFile, analyzeText } from "../lib/tagger";
import { saveScrap, uploadMedia } from "../lib/scraps";
import { FAVICON_HOLDER } from "../lib/audioCover";
import { StickDock } from "./StickDock";
import type { AnalyzeResult, Scrap } from "../lib/types";

type Mode = "create" | "search";

type Props = {
  open: boolean;
  user: User;
  item: Scrap;
  scraps: Scrap[];
  onDone: (nextItem: Scrap, extras: Scrap[]) => void;
  onClose: () => void;
};

function classifyFlags(ai: AnalyzeResult | null): Pick<Scrap, "classifyFallback" | "classifyMiss"> {
  if (!ai) return { classifyFallback: false, classifyMiss: "" };
  return {
    classifyFallback: Boolean(ai.fallback),
    classifyMiss: ai.miss || "",
  };
}

export function LinkBundleSheet({ open, user, item, scraps, onDone, onClose }: Props) {
  const t = useT();
  const { lang } = usePrefs();
  const presence = usePresence(open);
  const [mode, setMode] = useState<Mode>("create");
  const [composer, setComposer] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setMode("create");
    setComposer("");
    setQuery("");
    setBusy(false);
    setError("");
  }, [open, item.id]);

  const linkedKey = (item.linkedIds || []).join(",");
  const candidates = useMemo(() => {
    const linked = new Set(linkedKey ? linkedKey.split(",") : []);
    return filterScraps(scraps, { query, type: "all", day: null }).filter(
      (row) => row.id !== item.id && !linked.has(row.id),
    );
  }, [scraps, query, item.id, linkedKey]);

  async function createFromText(raw?: string) {
    const text = (raw ?? composer).trim();
    if (!text || busy) return;
    setBusy(true);
    setError("");
    try {
      const hint = analyzeText(text);
      let next = blankScrap({
        type: hint.type,
        tags: hint.tags,
        title: hint.title,
        text: hint.body,
        url: hint.url,
        domain: hint.domain,
        sourceText: hint.url ? "" : text,
      });
      const url = hint.url || "";
      let ogPatch: Pick<Scrap, "og" | "ogStatus"> = { og: null, ogStatus: "" };
      let metaDescription = "";
      let pageExcerpt = "";
      if (url) {
        const ogResult = await fetchOgPreview(url);
        ogPatch = { og: ogResult.og, ogStatus: ogResult.ogStatus };
        metaDescription = ogResult.metaDescription || "";
        pageExcerpt = ogResult.excerpt || "";
      }
      const ai = await requestAnalyze({
        kind: "text",
        text,
        lang,
        ogTitle: ogPatch.og?.title,
        ogDescription: ogPatch.og?.description,
        metaDescription,
        pageExcerpt,
      });
      const resolvedUrl = ai.url || url || "";
      if ((!ogPatch.og || !pageExcerpt) && resolvedUrl) {
        const ogResult = await fetchOgPreview(resolvedUrl);
        if (ogResult.og) ogPatch = { og: ogResult.og, ogStatus: ogResult.ogStatus };
        if (ogResult.metaDescription) metaDescription = ogResult.metaDescription;
        if (ogResult.excerpt) pageExcerpt = ogResult.excerpt;
      }
      const sourceText = url
        ? pageExcerpt || metaDescription || ogPatch.og?.description || ""
        : text;
      const title =
        shelfTitle({
          aiTitle: ai.miss ? "" : ai.title,
          ogTitle: ogPatch.og?.title,
          ogDescription: ogPatch.og?.description,
          domain: ai.domain || ogPatch.og?.siteName || hint.domain,
          url: resolvedUrl,
          fallback: "",
          preferOg: Boolean(resolvedUrl),
        }) || next.title;
      next = {
        ...next,
        type: ai.type,
        tags: ai.tags,
        title,
        text: ai.summary || ai.body || metaDescription || ogPatch.og?.description || next.text,
        previewText: ai.analysis || "",
        sourceText: sourceText || next.sourceText,
        url: resolvedUrl || next.url,
        domain: ai.domain || next.domain,
        ...classifyFlags(ai),
        ...ogPatch,
      };
      await saveScrap(user, next);
      const linkedPair = await linkScraps(user, item, next);
      setComposer("");
      onDone(linkedPair.a, [linkedPair.b]);
      onClose();
    } catch {
      setError(t("syncError"));
    } finally {
      setBusy(false);
    }
  }

  async function createFromFile(file: File) {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    try {
      const hint = analyzeFile(file);
      let next = blankScrap({
        type: hint.type,
        tags: hint.tags,
        title: hint.title,
        filename: hint.filename,
        mime: hint.mime,
        extension: hint.extension,
        size: hint.size,
      });
      const uploaded = await uploadMedia(user, next, file);
      next = {
        ...next,
        mediaPath: uploaded.mediaPath,
        dataUrl: uploaded.dataUrl,
        storedMedia: uploaded.storedMedia,
      };
      const ai = await requestAnalyze({
        kind: "file",
        mediaPath: uploaded.mediaPath,
        mime: hint.mime,
        filename: hint.filename,
        lang,
      });
      next = {
        ...next,
        type: ai.type || next.type,
        tags: ai.tags?.length ? ai.tags : next.tags,
        title:
          shelfTitle({
            aiTitle: ai.miss ? "" : ai.title,
            domain: next.domain,
            url: next.url,
            fallback: looksLikeAddress(next.title, next.domain, next.url) ? "" : next.title,
          }) || next.title,
        text: ai.summary || ai.body || next.text,
        previewText: ai.analysis || "",
        sourceText:
          hint.type === "image" || file.type.startsWith("image/")
            ? ai.summary || ai.body || ""
            : [hint.filename, hint.mime].filter(Boolean).join(" · "),
        ...classifyFlags(ai),
      };
      await saveScrap(user, next);
      const linkedPair = await linkScraps(user, item, next);
      onDone(linkedPair.a, [linkedPair.b]);
      onClose();
    } catch {
      setError(t("syncError"));
    } finally {
      setBusy(false);
    }
  }

  async function linkExisting(peer: Scrap) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const linkedPair = await linkScraps(user, item, peer);
      onDone(linkedPair.a, [linkedPair.b]);
      onClose();
    } catch {
      setError(t("syncError"));
    } finally {
      setBusy(false);
    }
  }

  if (!presence.shown) return null;

  return (
    <div className="fixed inset-0 z-40 bg-[color-mix(in_srgb,var(--color-ink)_40%,transparent)]" onClick={onClose}>
      <div className="sheet-stage">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bundle-title"
          className={
            "sheet-panel w-[min(26rem,calc(100vw-24px))] max-h-[min(90vh,40rem)] overflow-y-auto rounded-[32px] border border-paper-line bg-login-wall p-3.5 shadow-[var(--shadow-sheet)]" +
            sheetGenieClass(presence.closing)
          }
          onAnimationEnd={(event) => presence.onEnd(event, "sheet-genie-out")}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-2 flex items-center justify-between gap-1">
            <h2 id="bundle-title" className="m-0 text-[1.0625rem] font-bold">
              {t("bundledAddTitle")}
            </h2>
            <button type="button" className="grid size-12 place-items-center" onClick={onClose} aria-label={t("close")}>
              <X className="size-[22px]" strokeWidth={1.8} />
            </button>
          </div>
          <p className="auth-lead">{t("bundledAddLead")}</p>
          <div className="bundle-mode-tabs liquid-glass" role="tablist" aria-label={t("bundledAddTitle")}>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "create"}
              className={"bundle-mode-tab" + (mode === "create" ? " is-active" : "")}
              onClick={() => setMode("create")}
              disabled={busy}
            >
              <Combine className="size-4" strokeWidth={1.8} />
              {t("bundledModeCreate")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "search"}
              className={"bundle-mode-tab" + (mode === "search" ? " is-active" : "")}
              onClick={() => setMode("search")}
              disabled={busy}
            >
              <Search className="size-4" strokeWidth={1.8} />
              {t("bundledModeSearch")}
            </button>
          </div>

          {mode === "create" ? (
            <div className={"mt-3" + (busy ? " pointer-events-none opacity-70" : "")}>
              <StickDock
                value={composer}
                onChange={setComposer}
                onSubmitText={() => void createFromText()}
                onFiles={(files) => {
                  const file = Array.from(files)[0];
                  if (file) void createFromFile(file);
                }}
                dropping={false}
                disabled={busy}
                embedded
              />
            </div>
          ) : (
            <div className="mt-3 grid gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="list-tools-search"
                placeholder={t("bundledSearchPlaceholder")}
                disabled={busy}
                aria-label={t("bundledSearchPlaceholder")}
                autoFocus
              />
              <div className="bundle-search-list">
                {candidates.length ? (
                  candidates.slice(0, 24).map((page) => {
                    const cover = scrapCover(page);
                    return (
                      <button
                        key={page.id}
                        type="button"
                        className="detail-related-card"
                        disabled={busy}
                        onClick={() => void linkExisting(page)}
                      >
                        {cover && cover !== FAVICON_HOLDER ? (
                          <img src={cover} alt="" className="detail-related-cover" />
                        ) : (
                          <span className="detail-related-cover detail-related-cover--holder">
                            <img src={FAVICON_HOLDER} alt="" />
                          </span>
                        )}
                        <span className="face-title">{scrapFaceTitle(page, t("untitled"))}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="shelf-empty shelf-empty--compact">
                    <p className="shelf-empty-title">{t("bundledSearchEmpty")}</p>
                    <p className="shelf-empty-hint">{t("bundledSearchPlaceholder")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {error ? <p className="mt-2 m-0 text-[0.8125rem] text-danger">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
