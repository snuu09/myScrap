import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { t, typeLabel } from "../i18n";
import { usePrefs } from "../context/Prefs";
import { useAuth } from "../context/Auth";
import { usePlan } from "../context/Plan";
import { deleteScrap, loadScraps } from "../lib/scraps";
import { formatWhen } from "../lib/time";
import { formatBytes } from "../lib/tagger";
import type { Scrap } from "../lib/types";

export function ScrapDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = usePrefs();
  const { user } = useAuth();
  const { setScrapsForUsage } = usePlan();
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

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

  const atStart = index <= 0;
  const atEnd = index >= scraps.length - 1;

  async function peel() {
    if (!user || !scrap) return;
    if (!window.confirm(t(lang, "peelConfirm"))) return;
    try {
      await deleteScrap(user, scrap);
      navigate("/");
    } catch {
      setError(t(lang, "syncError"));
    }
  }

  return (
    <div className="dashboard-door">
      <div className="dashboard-head">
        <Link to="/" className="auth-link-toggle min-h-10 no-underline">
          {t(lang, "backToShelf")}
        </Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="auth-back-btn"
            disabled={atStart}
            aria-label={t(lang, "prevScrap")}
            onClick={() => navigate(`/scrap/${scraps[index - 1].id}`)}
          >
            <ChevronLeft className="size-[22px]" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="auth-back-btn"
            disabled={atEnd}
            aria-label={t(lang, "nextScrap")}
            onClick={() => navigate(`/scrap/${scraps[index + 1].id}`)}
          >
            <ChevronRight className="size-[22px]" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {error ? <p className="m-0 text-[0.8125rem] text-danger">{error}</p> : null}

      <article className="dashboard-panel" aria-labelledby="scrap-detail-title">
        <h1 id="scrap-detail-title" className="dashboard-title m-0 truncate">
          {scrap.title || t(lang, "untitled")}
        </h1>
        <p className="m-0 text-[0.75rem] text-muted">
          {typeLabel(lang, scrap.type)} · {formatWhen(scrap.createdAt, lang)} · {index + 1}/{scraps.length}
        </p>
        {scrap.dataUrl && scrap.type === "image" ? (
          <img src={scrap.dataUrl} alt="" className="mt-1 max-h-96 w-full rounded-[14px] object-contain" />
        ) : null}
        {scrap.text && scrap.type !== "image" ? (
          <p className="m-0 whitespace-pre-wrap text-[0.9375rem] text-ink-soft">{scrap.text}</p>
        ) : null}
        {scrap.url ? (
          <a href={scrap.url} className="scrap-card-link" target="_blank" rel="noreferrer">
            {t(lang, "openLink")}
          </a>
        ) : null}
        {scrap.filename ? (
          <p className="scrap-card-file">
            {scrap.filename} · {formatBytes(scrap.size)}
          </p>
        ) : null}
        {scrap.memo ? <p className="m-0 text-[0.9375rem] text-ink">{scrap.memo}</p> : null}
        <p className="scrap-card-tags">
          {scrap.tags.map((tag) => (
            <span key={tag} className="scrap-tag">
              {tag}
            </span>
          ))}
        </p>
        <button type="button" className="settings-btn-leave mt-2" onClick={() => void peel()}>
          {t(lang, "deleteItem")}
        </button>
      </article>
    </div>
  );
}
