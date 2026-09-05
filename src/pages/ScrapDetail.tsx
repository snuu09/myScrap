import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  Bookmark,
  BookmarkCheck,
  Bell,
  BellOff,
  BookOpen,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Share2,
} from "lucide-react";
import { t, typeLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useAuth } from "../context/Auth";
import { usePlan } from "../context/Plan";
import { RemindSheet } from "../components/RemindSheet";
import { deleteScrap, loadScraps, saveScrap } from "../lib/scraps";
import { SiteIcon } from "../components/SiteIcon";
import { fetchOgPreview } from "../lib/og";
import { formatWhen } from "../lib/time";
import { formatBytes } from "../lib/tagger";
import type { Scrap } from "../lib/types";

function NeighborPreview({ scrap, label, onClick, disabled }: { scrap: Scrap | null; label: string; onClick: () => void; disabled: boolean }) {
  const { lang } = usePrefs();
  if (!scrap) {
    return (
      <button type="button" className="neighbor-preview neighbor-preview--empty" disabled aria-label={label}>
        <span className="text-muted">{label}</span>
      </button>
    );
  }
  const thumb = scrap.og?.image || (scrap.dataUrl && scrap.type === "image" ? scrap.dataUrl : "");
  return (
    <button type="button" className="neighbor-preview" disabled={disabled} onClick={onClick} aria-label={label}>
      {thumb ? <img src={thumb} alt="" className="neighbor-preview-thumb" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /> : null}
      <span className="neighbor-preview-body">
        <span className="neighbor-preview-label">{label}</span>
        <span className="neighbor-preview-title">{scrap.title || t(lang, "untitled")}</span>
        {scrap.domain || scrap.og?.siteName ? (
          <span className="neighbor-preview-site">
            <SiteIcon domain={scrap.domain} favicon={scrap.og?.favicon} className="neighbor-preview-icon" size={12} />
            {scrap.og?.siteName || scrap.domain}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function ScrapDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = usePrefs();
  const { user } = useAuth();
  const { setScrapsForUsage } = usePlan();
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [remindOpen, setRemindOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const next = await loadScraps(user);
      setScraps(next);
      setScrapsForUsage(next);
    } catch {
      setError(t(lang, "syncError"));
    } finally {
      setReady(true);
    }
  }, [user, lang, setScrapsForUsage]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const index = id ? scraps.findIndex((item) => item.id === id) : -1;
  const scrap = index >= 0 ? scraps[index] : null;
  const prev = index > 0 ? scraps[index - 1] : null;
  const next = index >= 0 && index < scraps.length - 1 ? scraps[index + 1] : null;

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") {
        navigate("/");
        return;
      }
      if (index < 0) return;
      if (ev.key === "ArrowLeft" && index > 0) navigate(`/scrap/${scraps[index - 1].id}`);
      if (ev.key === "ArrowRight" && index < scraps.length - 1) navigate(`/scrap/${scraps[index + 1].id}`);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, index, scraps]);

  useEffect(() => {
    if (!user || !scrap?.url || scrap.ogStatus === "ready" || scrap.og) return;
    const scrapId = scrap.id;
    const scrapUrl = scrap.url;
    let cancelled = false;
    void fetchOgPreview(scrapUrl).then(async (result) => {
      if (cancelled || !result.og) return;
      const base = scraps.find((item) => item.id === scrapId);
      if (!base) return;
      const updated = { ...base, og: result.og, ogStatus: result.ogStatus, updatedAt: Date.now() };
      try {
        await saveScrap(user, updated);
        setScraps((list) => list.map((item) => (item.id === updated.id ? updated : item)));
      } catch {
        /* ignore backfill failure */
      }
    });
    return () => {
      cancelled = true;
    };
    // Backfill once per scrap id when OG is missing
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid loop on scrap object identity
  }, [user, scrap?.id, scrap?.url, scrap?.ogStatus, scrap?.og]);

  if (!user) return <Navigate to="/" replace />;

  if (!ready) {
    return <p className="px-[var(--gutter)] py-8 text-muted">{t(lang, "authWorking")}</p>;
  }

  if (!scrap) {
    return (
      <div className="dashboard-door">
        <p className="shelf-empty-title">{t(lang, "noMatches")}</p>
        <Link to="/" className="auth-link-toggle mt-3 inline-flex min-h-10 no-underline">
          {t(lang, "backToShelf")}
        </Link>
      </div>
    );
  }

  const item = scrap;

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
      setError(t(lang, "syncError"));
    } finally {
      setBusy(false);
    }
  }

  async function peel() {
    if (!user) return;
    if (!window.confirm(t(lang, "peelConfirm"))) return;
    try {
      await deleteScrap(user, item);
      navigate("/");
    } catch {
      setError(t(lang, "syncError"));
    }
  }

  async function share() {
    if (!item.url) {
      window.alert(t(lang, "shareLocalOnly"));
      return;
    }
    const title = item.title || t(lang, "untitled");
    try {
      if (navigator.share) {
        await navigator.share({ title, text: item.og?.description || item.memo || title, url: item.url });
        return;
      }
      await navigator.clipboard.writeText(item.url);
      window.alert(t(lang, "shareCopied"));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      window.alert(t(lang, "shareFailed"));
    }
  }

  const thumb = item.og?.image || (item.dataUrl && item.type === "image" ? item.dataUrl : "");
  const read = Boolean(item.readAt);
  const dueRemind = item.remindAt && item.remindAt <= Date.now();

  return (
    <div className="dashboard-door">
      <div className="dashboard-head">
        <Link to="/" className="auth-link-toggle min-h-10 no-underline">
          {t(lang, "backToShelf")}
        </Link>
        <div className="detail-actions">
          {item.url ? (
            <a href={item.url} className="detail-action" target="_blank" rel="noreferrer" aria-label={t(lang, "openLink")}>
              <ExternalLink className="size-5" strokeWidth={1.8} />
            </a>
          ) : null}
          <button type="button" className="detail-action" aria-label={t(lang, "share")} onClick={() => void share()} disabled={busy}>
            <Share2 className="size-5" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="detail-action"
            aria-pressed={item.bookmarked}
            aria-label={t(lang, "bookmark")}
            disabled={busy}
            onClick={() => void patch({ ...item, bookmarked: !item.bookmarked })}
          >
            {item.bookmarked ? <BookmarkCheck className="size-5" strokeWidth={1.8} /> : <Bookmark className="size-5" strokeWidth={1.8} />}
          </button>
          <button
            type="button"
            className="detail-action"
            aria-pressed={read}
            aria-label={t(lang, read ? "markUnread" : "markRead")}
            disabled={busy}
            onClick={() => void patch({ ...item, readAt: read ? null : Date.now() })}
          >
            {read ? <BookOpenCheck className="size-5" strokeWidth={1.8} /> : <BookOpen className="size-5" strokeWidth={1.8} />}
          </button>
          <button
            type="button"
            className={"detail-action" + (dueRemind ? " detail-action--alert" : "")}
            aria-label={t(lang, "remind")}
            disabled={busy}
            onClick={() => setRemindOpen(true)}
          >
            {item.remindAt ? <Bell className="size-5" strokeWidth={1.8} /> : <BellOff className="size-5" strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      <div className="neighbor-row">
        <NeighborPreview
          scrap={prev}
          label={t(lang, "prevScrap")}
          disabled={!prev}
          onClick={() => prev && navigate(`/scrap/${prev.id}`)}
        />
        <NeighborPreview
          scrap={next}
          label={t(lang, "nextScrap")}
          disabled={!next}
          onClick={() => next && navigate(`/scrap/${next.id}`)}
        />
      </div>

      {error ? <p className="m-0 text-[0.8125rem] text-danger">{error}</p> : null}

      <article className="dashboard-panel" aria-labelledby="scrap-detail-title">
        <h1 id="scrap-detail-title" className="dashboard-title m-0 truncate">
          {item.title || item.og?.title || t(lang, "untitled")}
        </h1>
        <p className="m-0 text-[0.75rem] text-muted">
          {typeLabel(lang, item.type)} · {formatWhen(item.createdAt, lang)} · {index + 1}/{scraps.length}
          {!read ? ` · ${t(lang, "unread")}` : ""}
        </p>
        {item.og?.siteName || item.domain ? (
          <p className="m-0 flex items-center gap-2 text-[0.8125rem] text-ink-soft">
            <SiteIcon domain={item.domain} favicon={item.og?.favicon} className="size-4 rounded-sm" size={16} />
            {item.og?.siteName || item.domain}
          </p>
        ) : null}
        {thumb ? (
          <img src={thumb} alt="" className="mt-1 max-h-96 w-full rounded-[14px] object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : null}
        {item.og?.description ? <p className="m-0 text-[0.9375rem] text-ink-soft">{item.og.description}</p> : null}
        {item.text && item.type !== "image" ? (
          <p className="m-0 whitespace-pre-wrap text-[0.9375rem] text-ink-soft">{item.text}</p>
        ) : null}
        {item.filename ? (
          <p className="scrap-card-file">
            {item.filename} · {formatBytes(item.size)}
          </p>
        ) : null}
        {item.memo ? <p className="m-0 text-[0.9375rem] text-ink">{item.memo}</p> : null}
        <p className="scrap-card-tags">
          {item.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="scrap-tag scrap-tag--btn"
              onClick={() => navigate(`/?q=${encodeURIComponent(tag)}`)}
            >
              {tag}
            </button>
          ))}
        </p>
        <div className="mt-2 flex items-center gap-2 max-[720px]:justify-between">
          <button type="button" className="auth-back-btn" disabled={!prev} aria-label={t(lang, "prevScrap")} onClick={() => prev && navigate(`/scrap/${prev.id}`)}>
            <ChevronLeft className="size-[22px]" strokeWidth={1.8} />
          </button>
          <button type="button" className="settings-btn-leave" onClick={() => void peel()}>
            {t(lang, "deleteItem")}
          </button>
          <button type="button" className="auth-back-btn" disabled={!next} aria-label={t(lang, "nextScrap")} onClick={() => next && navigate(`/scrap/${next.id}`)}>
            <ChevronRight className="size-[22px]" strokeWidth={1.8} />
          </button>
        </div>
      </article>

      <RemindSheet
        open={remindOpen}
        initial={item.remindAt}
        onClose={() => setRemindOpen(false)}
        onSave={(remindAt) => {
          setRemindOpen(false);
          void patch({ ...item, remindAt });
        }}
      />
    </div>
  );
}
