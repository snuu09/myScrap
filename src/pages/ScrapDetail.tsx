import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  Bookmark,
  BookmarkCheck,
  Bell,
  BellOff,
  BookOpen,
  BookOpenCheck,
  ExternalLink,
  Library,
  Pencil,
  Share2,
  X,
} from "lucide-react";
import { typeLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useAuth } from "../context/Auth";
import { usePlan } from "../context/Plan";
import { RemindSheet } from "../components/RemindSheet";
import { AuthWaiting } from "../components/AuthWaiting";
import { ScrapMedia } from "../components/ScrapMedia";
import { deleteScrap, hydrateSignedMedia, loadScraps, saveScrap } from "../lib/scraps";
import { fetchOgPreview } from "../lib/og";
import { useDialog } from "../lib/dialog";
import { useT } from "../lib/useT";
import { SiteIcon } from "../components/SiteIcon";
import { IconTip } from "../components/IconTip";
import { formatWhen } from "../lib/time";
import { formatBytes } from "../lib/tagger";
import type { Scrap } from "../lib/types";

function NeighborPreview({ scrap, label, onClick, disabled }: { scrap: Scrap | null; label: string; onClick: () => void; disabled: boolean }) {
  const t = useT();
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
        <span className="neighbor-preview-title">{scrap.title || t("untitled")}</span>
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

function BackToShelf() {
  const t = useT();
  return (
    <IconTip label={t("backToShelf")}>
      <Link to="/" className="auth-back-btn no-underline" aria-label={t("backToShelf")}>
        <Library className="size-[22px]" strokeWidth={1.8} />
      </Link>
    </IconTip>
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
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");

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
    setEditing(false);
    setTagDraft("");
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
      if (ev.key === "ArrowLeft" && index > 0) navigate(`/scrap/${scraps[index - 1].id}`);
      if (ev.key === "ArrowRight" && index < scraps.length - 1) navigate(`/scrap/${scraps[index + 1].id}`);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, index, scraps, editing]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid loop on scrap object identity
  }, [user, scrap?.id, scrap?.url, scrap?.ogStatus, scrap?.og]);

  if (!user) return <Navigate to="/" replace />;

  if (!ready) {
    return <AuthWaiting />;
  }

  if (!scrap) {
    return (
      <div className="dashboard-door">
        <p className="shelf-empty-title">{t("noMatches")}</p>
        <div className="mt-3">
          <BackToShelf />
        </div>
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
    await patch({ ...item, title: editTitle.trim(), memo: editMemo, tags });
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

  async function share() {
    if (!item.url) return;
    const title = item.title || t("untitled");
    try {
      if (navigator.share) {
        await navigator.share({ title, text: item.og?.description || item.memo || title, url: item.url });
        return;
      }
      await navigator.clipboard.writeText(item.url);
      await alert(t("shareCopied"));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      await alert(t("shareFailed"));
    }
  }

  const thumb = item.og?.image || (item.dataUrl && item.type === "image" ? item.dataUrl : "");
  const read = Boolean(item.readAt);
  const dueRemind = item.remindAt && item.remindAt <= Date.now();

  return (
    <div className="dashboard-door">
      <div className="dashboard-head">
        <BackToShelf />
      </div>

      {error ? <p className="m-0 text-[0.8125rem] text-danger">{error}</p> : null}

      <article className="dashboard-panel" aria-labelledby="scrap-detail-title">
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
            <IconTip label={t("editItem")}>
              <button type="button" className="detail-action" aria-label={t("editItem")} disabled={busy} onClick={beginEdit}>
                <Pencil className="size-5" strokeWidth={1.8} />
              </button>
            </IconTip>
            {item.url ? (
              <IconTip label={t("openLink")}>
                <a href={item.url} className="detail-action" target="_blank" rel="noreferrer" aria-label={t("openLink")}>
                  <ExternalLink className="size-5" strokeWidth={1.8} />
                </a>
              </IconTip>
            ) : null}
            {item.url ? (
              <IconTip label={t("share")}>
                <button type="button" className="detail-action" aria-label={t("share")} onClick={() => void share()} disabled={busy}>
                  <Share2 className="size-5" strokeWidth={1.8} />
                </button>
              </IconTip>
            ) : null}
            <IconTip label={t("deleteItem")}>
              <button type="button" className="detail-action" aria-label={t("deleteItem")} disabled={busy} onClick={() => void peel()}>
                <X className="size-5" strokeWidth={1.8} />
              </button>
            </IconTip>
            <IconTip label={t("bookmark")}>
              <button
                type="button"
                className="detail-action"
                aria-pressed={item.bookmarked}
                aria-label={t("bookmark")}
                disabled={busy}
                onClick={() => void patch({ ...item, bookmarked: !item.bookmarked })}
              >
                {item.bookmarked ? <BookmarkCheck className="size-5" strokeWidth={1.8} /> : <Bookmark className="size-5" strokeWidth={1.8} />}
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
                {read ? <BookOpenCheck className="size-5" strokeWidth={1.8} /> : <BookOpen className="size-5" strokeWidth={1.8} />}
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
                {item.remindAt ? <Bell className="size-5" strokeWidth={1.8} /> : <BellOff className="size-5" strokeWidth={1.8} />}
              </button>
            </IconTip>
          </div>
        ) : null}
        {item.og?.siteName || item.domain ? (
          <p className="m-0 flex items-center gap-2 text-[0.8125rem] text-ink-soft">
            <SiteIcon domain={item.domain} favicon={item.og?.favicon} className="size-4 rounded-sm" size={16} />
            {item.og?.siteName || item.domain}
          </p>
        ) : null}
        {thumb ? (
          <ScrapMedia key={thumb} src={thumb} className="detail-media-img" frameClassName="detail-media-frame" />
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
              {editTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="scrap-tag scrap-tag--btn"
                  disabled={busy}
                  onClick={() => setEditTags((tags) => tags.filter((row) => row !== tag))}
                >
                  {tag}
                  <X className="ml-1 inline size-3" strokeWidth={2} />
                </button>
              ))}
            </div>
            <input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
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
          </>
        )}
      </article>

      {!editing ? (
        <div className="neighbor-row neighbor-row--below">
          <NeighborPreview
            scrap={prev}
            label={t("prevScrap")}
            disabled={!prev}
            onClick={() => prev && navigate(`/scrap/${prev.id}`)}
          />
          <NeighborPreview
            scrap={next}
            label={t("nextScrap")}
            disabled={!next}
            onClick={() => next && navigate(`/scrap/${next.id}`)}
          />
        </div>
      ) : null}

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
