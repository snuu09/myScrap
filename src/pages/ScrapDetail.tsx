import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  Bookmark,
  BookmarkCheck,
  Bell,
  BellOff,
  BookOpen,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Pencil,
  Share2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { typeLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useAuth } from "../context/Auth";
import { usePlan } from "../context/Plan";
import { RemindSheet } from "../components/RemindSheet";
import { AuthWaiting } from "../components/AuthWaiting";
import { BusyOverlay } from "../components/BusyOverlay";
import { ScrapMedia } from "../components/ScrapMedia";
import { DocPreview } from "../components/DocPreview";
import { requestAnalyze } from "../lib/analyze";
import { captureCover } from "../lib/captureCover";
import { deleteScrap, hydrateSignedMedia, isPagedPosterPath, loadScraps, saveScrap, uploadPosters } from "../lib/scraps";
import { fetchOgPreview, youtubeEmbedUrl } from "../lib/og";
import { needsOgCoverSnapshot, snapshotOgCover } from "../lib/ogCover";
import { useDialog } from "../lib/dialog";
import { useT } from "../lib/useT";
import { markSkipPageGenie, takeSkipPageGenie } from "../lib/pageGenie";
import { SiteIcon } from "../components/SiteIcon";
import { IconTip } from "../components/IconTip";
import { GlassCluster, TagCluster } from "../components/GlassCluster";
import { formatWhen } from "../lib/time";
import { formatBytes, isPdf, mediaKindOf } from "../lib/tagger";
import { isImeComposing } from "../lib/ime";
import { DocumentMark } from "../components/DocumentMark";
import { DetailHistory } from "../components/DetailHistory";
import { RelatedPages } from "../components/RelatedPages";
import { applyRevision, pushRevision } from "../lib/revisions";
import { looksLikeAddress, scrapCover, scrapFaceTitle, shelfTitle } from "../lib/scrapFace";
import { renderAiHighlight } from "../lib/aiHighlight";
import type { Scrap } from "../lib/types";

function neighborCover(scrap: Scrap) {
  return scrapCover(scrap);
}

function NeighborPeek({
  scrap,
  label,
  side,
  onClick,
}: {
  scrap: Scrap;
  label: string;
  side: "prev" | "next";
  onClick: () => void;
}) {
  const t = useT();
  const thumb = neighborCover(scrap);
  const Icon = side === "prev" ? ChevronLeft : ChevronRight;
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      className={"detail-peek detail-peek--" + side + (open ? " is-open" : "")}
      onClick={onClick}
      aria-label={label}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span className="detail-peek-flyout">
        {thumb ? <img src={thumb} alt="" className="detail-peek-cover" /> : <span className="detail-peek-cover" />}
        <span className="detail-peek-title face-title">{scrapFaceTitle(scrap, t("untitled"))}</span>
      </span>
      <span className="detail-peek-chevron" aria-hidden>
        <Icon className="size-[16px]" strokeWidth={2} />
      </span>
      <span className="detail-peek-label">{side === "prev" ? t("prevScrap") : t("nextScrap")}</span>
    </button>
  );
}

export function ScrapDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = usePrefs();
  const t = useT();
  const { user } = useAuth();
  const { setScrapsForUsage } = usePlan();
  const { alert, confirm } = useDialog();
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [remindOpen, setRemindOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const aiAbortRef = useRef<AbortController | null>(null);
  const aiBusyRef = useRef(false);
  const pageBackfillTried = useRef(new Set<string>());
  const ogImageTried = useRef(new Set<string>());
  const coverSnapTried = useRef(new Set<string>());
  const [turning, setTurning] = useState<"" | "prev" | "next">("");
  const turnTimer = useRef(0);
  const turnOutRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    takeSkipPageGenie();
  }, [id]);

  const turnTo = useCallback(
    (targetId: string, side: "prev" | "next") => {
      if (!targetId || turning) return;
      markSkipPageGenie();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        navigate(`/scrap/${targetId}`);
        return;
      }
      const node = turnOutRef.current;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        navigate(`/scrap/${targetId}`);
      };
      node?.addEventListener(
        "animationend",
        (event) => {
          if (event.target !== node || event.animationName.indexOf("detail-flip-out") !== 0) return;
          finish();
        },
        { once: true },
      );
      window.clearTimeout(turnTimer.current);
      flushSync(() => setTurning(side));
      turnTimer.current = window.setTimeout(finish, 520);
    },
    [navigate, turning],
  );

  useEffect(() => {
    return () => window.clearTimeout(turnTimer.current);
  }, []);

  useEffect(() => {
    setTurning("");
  }, [id]);

  const cancelAiAnalyze = useCallback(() => {
    aiAbortRef.current?.abort();
    aiAbortRef.current = null;
    aiBusyRef.current = false;
    setAiBusy(false);
    setBusy(false);
  }, []);

  useEffect(() => {
    aiBusyRef.current = aiBusy;
  }, [aiBusy]);

  useEffect(() => {
    if (!aiBusy) return;
    const marker = window.location.href;
    const onPop = () => {
      if (!aiBusyRef.current) return;
      window.history.pushState(null, "", marker);
    };
    window.history.pushState(null, "", marker);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [aiBusy]);

  useEffect(() => {
    return () => {
      aiAbortRef.current?.abort();
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const next = await loadScraps(user);
      setScraps(next);
      setScrapsForUsage(next);
      setReady(true);
      void hydrateSignedMedia(next)
        .then((hydrated) => {
          setScraps(hydrated);
          setScrapsForUsage(hydrated);
        })
        .catch(() => {
          /* keep metadata-only list */
        });
    } catch {
      setError(t("syncError"));
      setReady(true);
    }
  }, [user, t, setScrapsForUsage]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const index = id ? scraps.findIndex((item) => item.id === id) : -1;
  const scrap = index >= 0 ? scraps[index] : null;
  const prev = index > 0 ? scraps[index - 1] : null;
  const next = index >= 0 && index < scraps.length - 1 ? scraps[index + 1] : null;

  useEffect(() => {
    if (!user || !scrap?.dataUrl) return;
    if (!isPdf(scrap.mime, scrap.filename)) return;
    if (pageBackfillTried.current.has(scrap.id)) return;
    const stored = scrap.pages || 0;
    const paged = isPagedPosterPath(scrap.posterPath);
    if (paged && stored > 4) return;
    if (paged && stored > 0 && stored < 4) return;
    pageBackfillTried.current.add(scrap.id);
    const target = scrap;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(target.dataUrl);
        if (!res.ok || cancelled) return;
        const blob = await res.blob();
        const file = new File([blob], target.filename || "file.pdf", { type: target.mime || "application/pdf" });
        const covers = await captureCover(file);
        if (cancelled || !covers.length) return;
        if (paged && covers.length <= stored) return;
        const uploaded = await uploadPosters(user, target.id, covers);
        if (cancelled) return;
        const nextScrap: Scrap = {
          ...target,
          posterPath: uploaded.posterPath || target.posterPath,
          posterUrl: uploaded.posterUrl || target.posterUrl,
          posterUrls: uploaded.posterUrls.length ? uploaded.posterUrls : target.posterUrls,
          pages: uploaded.pages || covers.length,
          updatedAt: Date.now(),
        };
        await saveScrap(user, nextScrap);
        if (cancelled) return;
        setScraps((list) => {
          const updated = list.map((row) => (row.id === nextScrap.id ? nextScrap : row));
          setScrapsForUsage(updated);
          return updated;
        });
      } catch {
        /* keep the existing cover */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, scrap, setScrapsForUsage]);

  useEffect(() => {
    setEditing(false);
    setTagDraft("");
    setTurning("");
  }, [id]);

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") {
        if (editing) {
          setEditing(false);
          return;
        }
        navigate("/");
        return;
      }
      if (editing || index < 0) return;
      if (ev.key === "ArrowLeft" && index > 0) turnTo(scraps[index - 1].id, "prev");
      if (ev.key === "ArrowRight" && index < scraps.length - 1) turnTo(scraps[index + 1].id, "next");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, index, scraps, editing, turnTo]);

  useEffect(() => {
    if (!user || !scrap?.url || scrap.og?.image) return;
    if (ogImageTried.current.has(scrap.id)) return;
    ogImageTried.current.add(scrap.id);
    const scrapId = scrap.id;
    const scrapUrl = scrap.url;
    void fetchOgPreview(scrapUrl).then(async (result) => {
      if (!result.og) return;
      const base = scraps.find((item) => item.id === scrapId);
      if (!base || base.og?.image) return;
      const updated = { ...base, og: result.og, ogStatus: result.ogStatus, updatedAt: Date.now() };
      try {
        await saveScrap(user, updated);
        setScraps((list) =>
          list.map((item) =>
            item.id === updated.id && !item.og?.image
              ? { ...item, og: updated.og, ogStatus: updated.ogStatus, updatedAt: updated.updatedAt }
              : item,
          ),
        );
      } catch {
        /* ignore backfill failure */
      }
    });
    // one attempt per scrap; do not cancel on identity churn or the retry never lands
  }, [user, scrap?.id, scrap?.url, scrap?.og?.image]);

  useEffect(() => {
    if (!user || !scrap || !needsOgCoverSnapshot(scrap)) return;
    if (coverSnapTried.current.has(scrap.id)) return;
    coverSnapTried.current.add(scrap.id);
    const target = scrap;
    void snapshotOgCover(user, target).then(async (poster) => {
      if (!poster?.posterUrl && !poster?.posterPath) return;
      const nextScrap = { ...target, ...poster, updatedAt: Date.now() };
      try {
        await saveScrap(user, nextScrap);
        setScraps((list) => {
          const updated = list.map((row) =>
            row.id === nextScrap.id && !row.posterUrl && !row.posterPath ? { ...row, ...poster, updatedAt: nextScrap.updatedAt } : row,
          );
          setScrapsForUsage(updated);
          return updated;
        });
      } catch {
        coverSnapTried.current.delete(target.id);
      }
    });
  }, [user, scrap, setScrapsForUsage]);

  if (!user) return <Navigate to="/" replace />;

  if (!ready) {
    return <AuthWaiting />;
  }

  if (!scrap) {
    return (
      <div className="dashboard-door">
        <p className="shelf-empty-title">{t("noMatches")}</p>
      </div>
    );
  }

  const item = scrap;

  function beginEdit() {
    setEditTitle(item.title || item.og?.title || "");
    setEditMemo(item.memo || "");
    setEditTags([...item.tags]);
    setTagDraft("");
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setTagDraft("");
  }

  function commitTagDraft() {
    const next = tagDraft
      .split(/[,，]/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (!next.length) return;
    setEditTags((tags) => {
      const merged = [...tags];
      for (const tag of next) {
        if (!merged.includes(tag)) merged.push(tag);
      }
      return merged;
    });
    setTagDraft("");
  }

  async function patch(next: Scrap) {
    if (!user) return;
    setBusy(true);
    try {
      const saved = { ...next, updatedAt: Date.now() };
      await saveScrap(user, saved);
      setScraps((list) => {
        const updated = list.map((row) => (row.id === saved.id ? saved : row));
        setScrapsForUsage(updated);
        return updated;
      });
    } catch {
      setError(t("syncError"));
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    const tags = editTags.length ? editTags : [item.type];
    await patch({
      ...item,
      title: editTitle.trim(),
      memo: editMemo,
      tags,
      revisions: pushRevision(item, "edit"),
    });
    setEditing(false);
    setTagDraft("");
  }

  async function peel() {
    if (!user) return;
    if (!(await confirm({ body: t("peelConfirm"), danger: true, confirmLabel: t("deleteItem") }))) return;
    try {
      await deleteScrap(user, item);
      navigate("/");
    } catch {
      setError(t("syncError"));
    }
  }

  async function runAiAnalyze() {
    if (!user || busy || aiBusy) return;
    const ac = new AbortController();
    aiAbortRef.current = ac;
    aiBusyRef.current = true;
    setAiBusy(true);
    setBusy(true);
    setError("");
    try {
      const blob = [item.title, item.memo, item.text, item.previewText, item.url].filter(Boolean).join("\n");
      const ai =
        item.mediaPath
          ? await requestAnalyze({
              kind: "file",
              mediaPath: item.mediaPath,
              mime: item.mime,
              filename: item.filename,
              lang,
              signal: ac.signal,
            })
          : await requestAnalyze({
              kind: "text",
              text: blob || item.title || item.filename,
              lang,
              ogTitle: item.og?.title,
              ogDescription: item.og?.description,
              signal: ac.signal,
            });
      if (ac.signal.aborted) return;
      if (ai.fallback) {
        await alert(t("aiAnalyzeFailed"));
        return;
      }
      let next: Scrap = {
        ...item,
        type: ai.type || item.type,
        tags: ai.tags?.length ? ai.tags : item.tags,
        title: looksLikeAddress(item.title, item.domain, item.url)
          ? shelfTitle({
              aiTitle: ai.miss ? "" : ai.title,
              ogTitle: item.og?.title,
              ogDescription: item.og?.description,
              domain: item.domain || ai.domain,
              url: item.url,
              fallback: item.title,
            }) || item.title
          : item.title,
        text: ai.summary || ai.body || item.text,
        previewText: ai.analysis || item.previewText,
        revisions: pushRevision(item, "ai"),
        updatedAt: Date.now(),
      };
      const linkUrl = next.url || item.url;
      if (linkUrl && !next.og) {
        try {
          const ogResult = await fetchOgPreview(linkUrl);
          if (ac.signal.aborted) return;
          if (ogResult.og) {
            next = { ...next, og: ogResult.og, ogStatus: ogResult.ogStatus };
          }
        } catch {
          /* keep analyze result without OG */
        }
      }
      if (ac.signal.aborted) return;
      await saveScrap(user, next);
      if (ac.signal.aborted) return;
      setScraps((list) => {
        const updated = list.map((row) => (row.id === next.id ? next : row));
        setScrapsForUsage(updated);
        return updated;
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (err instanceof Error && err.name === "AbortError") return;
      await alert(t("aiAnalyzeFailed"));
    } finally {
      if (aiAbortRef.current === ac) aiAbortRef.current = null;
      if (!ac.signal.aborted) {
        aiBusyRef.current = false;
        setAiBusy(false);
        setBusy(false);
      }
    }
  }

  async function share() {
    if (!item.url) return;
    const title = item.title || t("untitled");
    if (navigator.share) {
      try {
        await navigator.share({ title, text: item.og?.description || item.memo || title, url: item.url });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(item.url);
      await alert(t("shareCopied"));
    } catch {
      await alert(t("shareFailed"));
    }
  }

  const mediaKind = mediaKindOf(item.type, item.mime);
  const playable = Boolean(
    item.dataUrl && (mediaKind === "image" || mediaKind === "video" || mediaKind === "audio"),
  );
  const read = Boolean(item.readAt);
  const dueRemind = item.remindAt && item.remindAt <= Date.now();
  const showOgCard = Boolean(item.url && (item.og || item.domain));
  const coverPages = item.posterUrls.length ? item.posterUrls : item.posterUrl ? [item.posterUrl] : [];
  const hasFileMedia = Boolean(item.dataUrl || item.mediaPath);
  /** Link posters are the stored OG snapshot, not a document page set. */
  const ogSnapshotOnly = Boolean(item.url && !hasFileMedia);
  const youtubeEmbed = ogSnapshotOnly && item.url ? youtubeEmbedUrl(item.url) : "";
  /** Docs/audio always use poster; image/video use poster only when media URL is missing. */
  const showDocCover =
    coverPages.length > 0 &&
    !ogSnapshotOnly &&
    (mediaKind === "audio" || mediaKind === null || (!playable && (mediaKind === "image" || mediaKind === "video")));
  const showPlayable = playable;

  const incoming = turning === "next" ? next : turning === "prev" ? prev : null;
  const incomingCover = incoming ? neighborCover(incoming) : "";

  return (
    <div className="dashboard-door dashboard-door--detail">
      {error ? <p className="m-0 text-[0.8125rem] text-danger">{error}</p> : null}

      <div className={"detail-stage" + (turning ? " detail-stage--turn-" + turning : "")}>
        <div className="detail-peek-slot detail-peek-slot--prev">
          {!editing && prev ? (
            <NeighborPeek scrap={prev} side="prev" label={t("prevScrap")} onClick={() => turnTo(prev.id, "prev")} />
          ) : null}
        </div>
      <div className="detail-page-slot">
        {incoming ? (
          <div className="detail-turn-in" aria-hidden>
            <h2 className="dashboard-title m-0 truncate">{scrapFaceTitle(incoming, t("untitled"))}</h2>
            <p className="m-0 text-[0.75rem] text-muted">
              {typeLabel(lang, incoming.type)} · {formatWhen(incoming.createdAt, lang)}
            </p>
            <div className="detail-actions detail-actions--in-card" />
            {incomingCover ? (
              <img src={incomingCover} alt="" className="detail-turn-cover" />
            ) : (
              <span className="detail-turn-cover detail-turn-cover--empty" />
            )}
          </div>
        ) : null}
      <article ref={turnOutRef} className="dashboard-panel detail-turn-out" aria-labelledby="scrap-detail-title">
        {editing ? (
          <label className="grid gap-1">
            <span className="list-tools-label">{t("untitled")}</span>
            <input
              id="scrap-detail-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="list-tools-search"
              disabled={busy}
            />
          </label>
        ) : (
          <h1 id="scrap-detail-title" className="dashboard-title m-0 truncate">
            {item.title || item.og?.title || t("untitled")}
          </h1>
        )}
        <p className="m-0 text-[0.75rem] text-muted">
          {typeLabel(lang, item.type)} · {formatWhen(item.createdAt, lang)} · {index + 1}/{scraps.length}
          {!read ? ` · ${t("unread")}` : ""}
        </p>
        {!editing ? (
          <div className="detail-actions detail-actions--in-card">
            <GlassCluster className="detail-action-group">
            <IconTip label={t("editItem")}>
              <button type="button" className="detail-action" aria-label={t("editItem")} disabled={busy} onClick={beginEdit}>
                <Pencil className="size-[18px]" strokeWidth={1.8} />
              </button>
            </IconTip>
            <IconTip label={t("deleteItem")}>
              <button type="button" className="detail-action" aria-label={t("deleteItem")} disabled={busy} onClick={() => void peel()}>
                <Trash2 className="size-[18px]" strokeWidth={1.8} />
              </button>
            </IconTip>
            </GlassCluster>
            <GlassCluster className="detail-action-group">
            <IconTip label={aiBusy ? t("aiAnalyzing") : t("aiAnalyze")}>
              <button
                type="button"
                className={"detail-action" + (aiBusy ? " detail-action--busy" : "")}
                aria-label={aiBusy ? t("aiAnalyzing") : t("aiAnalyze")}
                disabled={busy || aiBusy}
                onClick={() => void runAiAnalyze()}
              >
                <Sparkles className="size-[18px]" strokeWidth={1.8} />
              </button>
            </IconTip>
            {item.url ? (
              <IconTip label={t("share")}>
                <button type="button" className="detail-action" aria-label={t("share")} onClick={() => void share()} disabled={busy}>
                  <Share2 className="size-[18px]" strokeWidth={1.8} />
                </button>
              </IconTip>
            ) : null}
            </GlassCluster>
            <GlassCluster className="detail-action-group">
            <IconTip label={t("bookmark")}>
              <button
                type="button"
                className="detail-action"
                aria-pressed={item.bookmarked}
                aria-label={t("bookmark")}
                disabled={busy}
                onClick={() => void patch({ ...item, bookmarked: !item.bookmarked })}
              >
                {item.bookmarked ? <BookmarkCheck className="size-[18px]" strokeWidth={1.8} /> : <Bookmark className="size-[18px]" strokeWidth={1.8} />}
              </button>
            </IconTip>
            <IconTip label={t(read ? "markUnread" : "markRead")}>
              <button
                type="button"
                className="detail-action"
                aria-pressed={read}
                aria-label={t(read ? "markUnread" : "markRead")}
                disabled={busy}
                onClick={() => void patch({ ...item, readAt: read ? null : Date.now() })}
              >
                {read ? <BookOpenCheck className="size-[18px]" strokeWidth={1.8} /> : <BookOpen className="size-[18px]" strokeWidth={1.8} />}
              </button>
            </IconTip>
            <IconTip label={t("remind")}>
              <button
                type="button"
                className={"detail-action" + (dueRemind ? " detail-action--alert" : "")}
                aria-label={t("remind")}
                disabled={busy}
                onClick={() => setRemindOpen(true)}
              >
                {item.remindAt ? <Bell className="size-[18px]" strokeWidth={1.8} /> : <BellOff className="size-[18px]" strokeWidth={1.8} />}
              </button>
            </IconTip>
            </GlassCluster>
          </div>
        ) : null}
        {item.url ? (
          <div className="inline-action-row">
            <a href={item.url} className="scrap-card-link scrap-card-link--full min-w-0 flex-1" target="_blank" rel="noreferrer">
              {item.url}
            </a>
            <GlassCluster className="liquid-hit">
              <a href={item.url} className="inline-action" target="_blank" rel="noreferrer" aria-label={t("openLink")}>
                <ExternalLink className="size-4" strokeWidth={1.8} />
              </a>
            </GlassCluster>
          </div>
        ) : null}
        {showOgCard ? (
          <div className="detail-og-card">
            {item.og?.siteName || item.domain ? (
              <p className="og-card-site">
                <SiteIcon domain={item.domain} favicon={item.og?.favicon} className="og-card-icon" size={14} />
                {item.og?.siteName || item.domain}
              </p>
            ) : null}
            {youtubeEmbed ? (
              <div className="detail-media-frame detail-media-frame--bordered detail-media-frame--embed">
                <iframe
                  className="detail-embed"
                  src={youtubeEmbed}
                  title={item.og?.title || item.title || item.domain || ""}
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : item.posterUrl || item.og?.image ? (
              <ScrapMedia
                key={item.posterUrl || item.og?.image}
                src={item.posterUrl || item.og?.image || ""}
                fallbackSrcs={item.posterUrl && item.og?.image ? [item.og.image] : []}
                kind="image"
                priority
                className="detail-media-img"
                frameClassName="detail-media-frame detail-media-frame--bordered"
              />
            ) : null}
            {item.og?.description ? <p className="og-card-desc">{item.og.description}</p> : null}
          </div>
        ) : null}
        {showDocCover ? (
          <DocPreview
            src={coverPages[0]}
            pages={coverPages}
            filename={item.filename}
            limitedNote={!isPdf(item.mime, item.filename) && item.type === "document" ? t("previewPagesLimited") : ""}
          />
        ) : null}
        {showPlayable ? (
          <ScrapMedia
            key={item.dataUrl}
            src={item.dataUrl}
            fallbackSrcs={mediaKind === "image" || mediaKind === "video" ? [item.posterUrl].filter(Boolean) : []}
            kind={mediaKind || "image"}
            className="detail-media-img"
            frameClassName="detail-media-frame"
          />
        ) : null}
        {item.text ? (
          <div className="detail-ai-block">
            <p className="detail-section-title">{t("aiSummary")}</p>
            <p className="detail-ai-text">{renderAiHighlight(item.text)}</p>
          </div>
        ) : null}
        {item.previewText ? (
          <div className="detail-ai-block">
            <p className="detail-section-title">{t("aiAnalysis")}</p>
            <p className="detail-ai-text">{renderAiHighlight(item.previewText)}</p>
          </div>
        ) : null}
        {item.filename ? (
          <div className="inline-action-row">
            <p className="scrap-card-file min-w-0 flex-1">
              <DocumentMark
                extension={item.extension}
                mime={item.mime}
                type={item.type}
                filename={item.filename}
                size="sm"
                className="scrap-card-file-mark"
              />
              <span className="scrap-source-full">
                {item.filename}
                {item.size ? ` · ${formatBytes(item.size)}` : ""}
              </span>
            </p>
            {item.dataUrl ? (
              <GlassCluster className="liquid-hit">
                <a
                  href={item.dataUrl}
                  className="inline-action"
                  download={item.filename || undefined}
                  aria-label={t("downloadFile")}
                >
                  <Download className="size-4" strokeWidth={1.8} />
                </a>
              </GlassCluster>
            ) : null}
          </div>
        ) : null}
        {editing ? (
          <>
            <textarea
              value={editMemo}
              onChange={(e) => setEditMemo(e.target.value)}
              placeholder={t("memoPlaceholder")}
              rows={3}
              className="classify-draft-memo"
              disabled={busy}
            />
            <div className="scrap-card-tags">
              {editTags.length ? <TagCluster>
              {editTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="scrap-tag scrap-tag--btn detail-tag-chip"
                  disabled={busy}
                  onClick={() => setEditTags((tags) => tags.filter((row) => row !== tag))}
                >
                  {tag}
                  <X className="ml-1 inline size-3" strokeWidth={2} />
                </button>
              ))}
              </TagCluster> : null}
            </div>
            <input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (isImeComposing(e)) return;
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  commitTagDraft();
                }
              }}
              onBlur={() => commitTagDraft()}
              placeholder={t("addTag")}
              className="list-tools-search"
              disabled={busy}
              aria-label={t("addTag")}
            />
            <div className="classify-draft-actions">
              <button type="button" className="auth-link-utility" onClick={cancelEdit} disabled={busy}>
                {t("cancel")}
              </button>
              <button type="button" className="auth-btn-primary px-4" onClick={() => void saveEdit()} disabled={busy}>
                {t("save")}
              </button>
            </div>
          </>
        ) : (
          <>
            {item.memo ? <p className="m-0 text-[0.9375rem] text-ink">{item.memo}</p> : null}
            <p className="scrap-card-tags">
              {item.tags.length ? <TagCluster>
              {item.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="scrap-tag scrap-tag--btn detail-tag-chip"
                  onClick={() => navigate(`/search?tag=${encodeURIComponent(tag)}`)}
                >
                  {tag}
                  <span className="search-tag-count">{scraps.filter((row) => row.tags.includes(tag)).length}</span>
                </button>
              ))}
              </TagCluster> : null}
            </p>
          </>
        )}
      </article>
      {!editing ? (
        <>
          <DetailHistory
            item={item}
            busy={busy}
            onRevert={(revision) => void patch(applyRevision(item, revision))}
            onDelete={(revision) =>
              void patch({
                ...item,
                revisions: (item.revisions || []).filter((row) => row.id !== revision.id),
              })
            }
          />
          <RelatedPages item={item} scraps={scraps} />
        </>
      ) : null}
      </div>
        <div className="detail-peek-slot detail-peek-slot--next">
          {!editing && next ? (
            <NeighborPeek scrap={next} side="next" label={t("nextScrap")} onClick={() => turnTo(next.id, "next")} />
          ) : null}
        </div>
      </div>

      <RemindSheet
        open={remindOpen}
        initial={item.remindAt}
        onClose={() => setRemindOpen(false)}
        onSave={(remindAt) => {
          setRemindOpen(false);
          void patch({ ...item, remindAt });
        }}
      />

      <BusyOverlay open={aiBusy} label={t("aiAnalyzingBusy")} onCancel={cancelAiAnalyze} />
    </div>
  );
}
