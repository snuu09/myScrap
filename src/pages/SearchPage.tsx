import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { typeLabel } from "../i18n";
import { useAuth } from "../context/Auth";
import { usePrefs } from "../context/Prefs";
import { usePlan } from "../context/Plan";
import { useT } from "../lib/useT";
import { AuthWaiting } from "../components/AuthWaiting";
import { DocumentMark } from "../components/DocumentMark";
import { IconTip } from "../components/IconTip";
import { TypeBookCarousel } from "../components/TypeBookCarousel";
import { hydrateSignedMedia, loadScraps, SCRAPS_CHANGED_EVENT, SCRAPS_CLEARED_EVENT } from "../lib/scraps";
import { filterScraps } from "../lib/scrapFilters";
import { formatWhen } from "../lib/time";
import { formatBytes, mediaKindOf } from "../lib/tagger";
import type { Scrap, ScrapType } from "../lib/types";

const TYPES: ScrapType[] = ["text", "image", "video", "audio", "link", "document"];

export function SearchPage() {
  const t = useT();
  const { lang } = usePrefs();
  const { user, ready } = useAuth();
  const { setScrapsForUsage } = usePlan();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [typeFilter, setTypeFilter] = useState<ScrapType | "all">("all");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q != null && q !== query) setQuery(q);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const next = await loadScraps(user);
      setScraps(next);
      setScrapsForUsage(next);
      try {
        const hydrated = await hydrateSignedMedia(next);
        setScraps(hydrated);
        setScrapsForUsage(hydrated);
      } catch {
        /* metadata only */
      }
    } catch {
      setScraps([]);
    } finally {
      setLoading(false);
    }
  }, [user, setScrapsForUsage]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    function onChange() {
      void refresh();
    }
    window.addEventListener(SCRAPS_CHANGED_EVENT, onChange);
    window.addEventListener(SCRAPS_CLEARED_EVENT, onChange);
    return () => {
      window.removeEventListener(SCRAPS_CHANGED_EVENT, onChange);
      window.removeEventListener(SCRAPS_CLEARED_EVENT, onChange);
    };
  }, [refresh]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: scraps.length };
    for (const type of TYPES) counts[type] = 0;
    for (const item of scraps) counts[item.type] = (counts[item.type] || 0) + 1;
    return counts;
  }, [scraps]);

  const visibleTypes = loading ? TYPES : TYPES.filter((type) => (typeCounts[type] || 0) > 0);

  const visible = useMemo(
    () => filterScraps(scraps, { query, type: typeFilter, day: null }),
    [scraps, query, typeFilter],
  );

  function updateQuery(value: string) {
    setQuery(value);
    if (value) setSearchParams({ q: value }, { replace: true });
    else setSearchParams({}, { replace: true });
  }

  if (!ready) return <AuthWaiting />;
  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="search-page">
      <div className="search-page-bar">
        <IconTip label={t("backToShelf")}>
          <Link to="/" className="auth-back-btn no-underline" aria-label={t("backToShelf")}>
            <ArrowLeft className="size-[22px]" strokeWidth={1.8} />
          </Link>
        </IconTip>
        <div className="list-tools-search-wrap search-page-field">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="list-tools-search"
            aria-label={t("searchLabel")}
          />
          {query ? (
            <IconTip label={t("clearSearch")}>
              <button
                type="button"
                className="list-tools-search-clear"
                aria-label={t("clearSearch")}
                onClick={() => updateQuery("")}
              >
                <X className="size-[18px]" strokeWidth={1.8} />
              </button>
            </IconTip>
          ) : null}
        </div>
      </div>

      <p className="search-page-title list-tools-label">{t("searchPageTitle")}</p>

      <TypeBookCarousel
        types={visibleTypes}
        counts={typeCounts}
        active={typeFilter}
        loading={loading}
        onSelect={setTypeFilter}
      />

      <section className="list-body search-page-results" aria-live="polite">
        {loading ? (
          <p className="shelf-empty-hint">{t("shelfLoading")}</p>
        ) : !visible.length ? (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">{t("noMatches")}</p>
          </div>
        ) : (
          <ul className="scrap-list scrap-list--list">
            {visible.map((item) => {
              const title = item.title || item.og?.title || t("untitled");
              const showFileMark =
                item.type === "document" ||
                item.type === "image" ||
                item.type === "video" ||
                item.type === "audio";
              return (
                <li key={item.id} className="scrap-card">
                  <button
                    type="button"
                    className="scrap-card-hit"
                    onClick={() => navigate(`/scrap/${item.id}`)}
                  >
                    <div className="scrap-card-body">
                      <div className="scrap-card-head">
                        <div className="min-w-0 flex-1">
                          {showFileMark ? (
                            <div className="scrap-card-doc-row">
                              <DocumentMark
                                extension={item.extension}
                                mime={item.mime}
                                type={item.type}
                                filename={item.filename}
                                size="sm"
                              />
                              <p className="scrap-card-title">{title}</p>
                            </div>
                          ) : (
                            <p className="scrap-card-title">{title}</p>
                          )}
                          <p className="scrap-card-meta">
                            {typeLabel(lang, item.type)} · {formatWhen(item.createdAt, lang)}
                          </p>
                        </div>
                      </div>
                      {item.filename ? (
                        <p className="scrap-card-file">
                          {showFileMark ? (
                            <DocumentMark
                              extension={item.extension}
                              mime={item.mime}
                              type={item.type}
                              filename={item.filename}
                              size="sm"
                              className="scrap-card-file-mark"
                            />
                          ) : null}
                          {item.filename}
                          {item.size ? ` · ${formatBytes(item.size)}` : ""}
                        </p>
                      ) : null}
                      {mediaKindOf(item.type, item.mime) ? null : item.text ? (
                        <p className="scrap-card-text">{item.text}</p>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
