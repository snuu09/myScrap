import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { useT } from "../lib/useT";
import { isBrowseUser, useAuth } from "../context/Auth";
import { usePlan } from "../context/Plan";
import { DraftCard } from "../components/DraftCard";
import { GuestNoticeSheet } from "../components/GuestNoticeSheet";
import { ScrapList } from "../components/ScrapList";
import { StickDock } from "../components/StickDock";
import { requestAnalyze } from "../lib/analyze";
import { fetchOgPreview } from "../lib/og";
import {
  deleteScrap,
  hydrateSignedMedia,
  loadScraps,
  saveScrap,
  uploadMedia,
  SCRAPS_CHANGED_EVENT,
  SCRAPS_CLEARED_EVENT,
} from "../lib/scraps";
import { GuestQuotaError, GUEST_FILE_LIMIT, guestNoticeSeen, markGuestNoticeSeen } from "../lib/localScraps";
import { filterScraps } from "../lib/scrapFilters";
import { useDialog } from "../lib/dialog";
import { getSupabase } from "../lib/supabase";
import { analyzeFile, analyzeText, uid } from "../lib/tagger";
import type { Scrap, ScrapType } from "../lib/types";

const REMIND_NOTIFIED_KEY = "mybrary.remind.notified";

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
    bookmarked: false,
    readAt: null,
    remindAt: null,
    og: null,
    ogStatus: "",
    ...partial,
  };
}

type Props = { onEnter?: () => void };

export function Shelf({ onEnter }: Props) {
  const t = useT();
  const { user } = useAuth();
  const { setScrapsForUsage, canUpload, canStick } = usePlan();
  const { alert, confirm } = useDialog();
  const [searchParams, setSearchParams] = useSearchParams();
  const guest = isBrowseUser(user);
  const pendingWrite = useRef<(() => void) | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [listReady, setListReady] = useState(false);
  const [draft, setDraft] = useState<Scrap | null>(null);
  const [uploadRatio, setUploadRatio] = useState<number | null>(null);
  const [composer, setComposer] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ScrapType | "all">("all");
  const [dayFilter, setDayFilter] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [error, setError] = useState("");
  const [top, setTop] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q == null) return;
    setQuery(q);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const visible = useMemo(
    () => filterScraps(scraps, { query, type: typeFilter, day: dayFilter }),
    [scraps, query, typeFilter, dayFilter],
  );

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const next = await loadScraps(user);
      setScraps(next);
      setScrapsForUsage(next);
      setListReady(true);
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
      setListReady(true);
    }
  }, [user, t, setScrapsForUsage]);

  useEffect(() => {
    setListReady(false);
    setScraps([]);
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!scraps.length || typeof Notification === "undefined") return;
    const due = scraps.filter((item) => item.remindAt && item.remindAt <= Date.now());
    if (!due.length) return;
    let notified: string[] = [];
    try {
      notified = JSON.parse(sessionStorage.getItem(REMIND_NOTIFIED_KEY) || "[]") as string[];
    } catch {
      notified = [];
    }
    const fresh = due.filter((item) => !notified.includes(item.id));
    if (!fresh.length) return;
    const mark = () => {
      try {
        sessionStorage.setItem(REMIND_NOTIFIED_KEY, JSON.stringify([...notified, ...fresh.map((item) => item.id)]));
      } catch {
        /* ignore */
      }
    };
    if (Notification.permission === "granted") {
      fresh.forEach((item) => {
        new Notification(item.title || t("untitled"), {
          body: t("remind"),
          tag: "mybrary-remind-" + item.id,
        });
      });
      mark();
    } else if (Notification.permission === "default") {
      void Notification.requestPermission().then((perm) => {
        if (perm !== "granted") {
          mark();
          return;
        }
        fresh.forEach((item) => {
          new Notification(item.title || t("untitled"), {
            body: t("remind"),
            tag: "mybrary-remind-" + item.id,
          });
        });
        mark();
      });
    } else {
      mark();
    }
  }, [scraps, t]);

  useEffect(() => {
    function onCleared() {
      setScraps([]);      setScrapsForUsage([]);
      setDraft(null);
    }
    window.addEventListener(SCRAPS_CLEARED_EVENT, onCleared);
    return () => window.removeEventListener(SCRAPS_CLEARED_EVENT, onCleared);
  }, [setScrapsForUsage]);

  useEffect(() => {
    function onChanged() {
      void refresh();
    }
    window.addEventListener(SCRAPS_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(SCRAPS_CHANGED_EVENT, onChanged);
  }, [refresh]);

  useEffect(() => {
    function onScroll() {
      setTop(window.scrollY > 240);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function stickBlockedReason() {
    if (!getSupabase()) return t("syncError");
    const stick = canStick();
    if (!stick.ok) return t("trialExpiredMsg");
    return "";
  }

  function uploadBlockedReason(addingBytes: number) {
    const gate = canUpload(addingBytes);
    if (gate.ok) return "";
    if (gate.reason === "trialExpired") return t("trialExpiredMsg");
    return t(guest ? "guestQuotaMsg" : "quotaExceededMsg");
  }

  /** Guests learn where their scraps live before the first localStorage write. */
  function needsGuestNotice(run: () => void) {
    if (!guest || guestNoticeSeen()) return false;
    pendingWrite.current = run;
    setNoticeOpen(true);
    return true;
  }

  function confirmGuestNotice() {
    markGuestNoticeSeen();
    setNoticeOpen(false);
    const run = pendingWrite.current;
    pendingWrite.current = null;
    run?.();
  }

  function cancelGuestNotice() {
    pendingWrite.current = null;
    setNoticeOpen(false);
  }

  async function guardStick() {
    const msg = stickBlockedReason();
    if (msg) {
      await alert(msg);
      return true;
    }
    return false;
  }

  async function busyGuard() {
    if (draft) {
      await alert(t("draftBusy"));
      return true;
    }
    if (await guardStick()) return true;
    return false;
  }

  async function startFromText(raw: string) {
    const text = raw.trim();
    if (!text || !user) return;
    if (await busyGuard()) return;
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
    const url = ai.url || hint.url || "";
    let ogPatch: Pick<Scrap, "og" | "ogStatus"> = { og: null, ogStatus: "" };
    if (url) {
      const ogResult = await fetchOgPreview(url);
      ogPatch = { og: ogResult.og, ogStatus: ogResult.ogStatus };
    }
    setDraft((cur) =>
      cur && cur.id === next.id
        ? {
            ...cur,
            analyzing: false,
            type: ai.type,
            tags: ai.tags,
            title: ai.title || ogPatch.og?.title || cur.title,
            text: ai.body || cur.text,
            url: url || cur.url,
            domain: ai.domain || cur.domain,
            ...ogPatch,
          }
        : cur,
    );
  }

  async function startFromFiles(list: FileList | File[]) {
    if (!user) return;
    if (await busyGuard()) return;
    const file = Array.from(list)[0];
    if (!file) return;
    // Guest oversize sticks as metadata only (0 media bytes); attachLocalMedia skips the blob.
    const guestMetaOnly = guest && file.size > GUEST_FILE_LIMIT;
    const blocked = uploadBlockedReason(guestMetaOnly ? 0 : file.size);
    if (blocked) {
      await alert(blocked);
      return;
    }
    if (needsGuestNotice(() => void startFromFiles([file]))) return;
    const hint = analyzeFile(file);
    const localPreview = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
    const next = blankScrap({
      type: hint.type,
      tags: hint.tags,
      title: hint.title,
      filename: hint.filename,
      mime: hint.mime,
      extension: hint.extension,
      size: hint.size,
      dataUrl: localPreview,
      analyzing: true,
    });
    setDraft(next);
    setUploadRatio(0);
    try {
      const uploaded = await uploadMedia(user, next, file, (ratio) => setUploadRatio(ratio));
      if (localPreview && uploaded.dataUrl && uploaded.dataUrl !== localPreview) {
        URL.revokeObjectURL(localPreview);
      }
      next.mediaPath = uploaded.mediaPath;
      next.dataUrl = uploaded.dataUrl || localPreview;
      next.storedMedia = uploaded.storedMedia;
      setDraft({ ...next });
      const skipped = uploaded.skipped;
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
              dataUrl: uploaded.dataUrl || cur.dataUrl,
            }
          : cur,
      );
      setUploadRatio(null);
      if (skipped) {
        setError(t("guestMediaSkipped"));
        await alert(t("guestMediaSkipped"));
      }
    } catch (err) {
      if (localPreview) URL.revokeObjectURL(localPreview);
      setUploadRatio(null);
      setDraft((cur) => (cur && cur.id === next.id ? { ...cur, analyzing: false, error: "upload", dataUrl: "" } : cur));
      const detail = err instanceof Error && err.message ? err.message : "";
      const message = detail && detail !== "upload" ? `${t("errorFile")} (${detail})` : t("errorFile");
      setError(message);
      await alert(message);
    }
  }

  async function persist() {
    if (!user || !draft || draft.analyzing) return;
    if (!getSupabase()) {
      setError(t("syncError"));
      await alert(t("syncError"));
      return;
    }
    if (needsGuestNotice(() => void persist())) return;
    const preview = draft.dataUrl;
    const saved = { ...draft, updatedAt: Date.now(), analyzing: false };
    try {
      await saveScrap(user, saved);
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
      setDraft(null);
      await refresh();
    } catch (err) {
      const message = err instanceof GuestQuotaError ? t("guestQuotaMsg") : t("syncError");
      setError(message);
      await alert(message);
    }
  }

  async function peel(item: Scrap) {
    if (!user) return;
    try {
      await deleteScrap(user, item);
      await refresh();
    } catch {
      setError(t("syncError"));
    }
  }

  function clearFilters() {
    setQuery("");
    setTypeFilter("all");
    setDayFilter(null);
    setCalendarOpen(false);
  }

  const stickDisabled = !canStick().ok || !getSupabase();

  return (
    <div
      className="relative flex min-h-[calc(100dvh-60px)] flex-col pb-[calc(7.5rem+env(safe-area-inset-bottom))]"
      onDragOver={(e) => {
        e.preventDefault();
        setDropping(true);
      }}
      onDragLeave={() => setDropping(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropping(false);
        if (stickDisabled) {
          void alert(stickBlockedReason() || t("trialExpiredMsg"));
          return;
        }
        if (e.dataTransfer.files.length) void startFromFiles(e.dataTransfer.files);
        else {
          const text = e.dataTransfer.getData("text/plain");
          if (text) void startFromText(text);
        }
      }}
    >
      <div className="flex-1">
        {guest ? (
          <p className="mx-auto flex max-w-[40rem] flex-wrap items-center gap-x-2 gap-y-1 px-[var(--gutter)] pt-3 text-[0.8125rem] text-ink-soft">
            {t("guestBanner")}
            {onEnter ? (
              <button type="button" className="auth-link-utility" onClick={onEnter}>
                {t("guestBannerCta")}
              </button>
            ) : null}
          </p>
        ) : null}
        {error ? <p className="mx-auto max-w-[40rem] px-[var(--gutter)] pt-3 text-[0.8125rem] text-danger">{error}</p> : null}
        <ScrapList
          scraps={scraps}
          visible={visible}
          loading={!listReady}
          query={query}
          typeFilter={typeFilter}
          dayFilter={dayFilter}
          calendarOpen={calendarOpen}
          onQuery={setQuery}
          onType={setTypeFilter}
          onDayFilter={setDayFilter}
          onCalendarOpen={setCalendarOpen}
          onClearFilters={clearFilters}
          onPeel={(item) => void peel(item)}
        />
      </div>
      <StickDock
        value={composer}
        onChange={setComposer}
        onSubmitText={() => void startFromText(composer)}
        onFiles={(files) => void startFromFiles(files)}
        dropping={dropping}
        disabled={stickDisabled}
        disabledHint={stickBlockedReason()}
        draftSlot={
          draft ? (
            <DraftCard
              draft={draft}
              uploadRatio={uploadRatio}
              onChange={(patch) => setDraft((cur) => (cur ? { ...cur, ...patch } : cur))}
              onSave={() => void persist()}
              onCancel={() => {
                void (async () => {
                  if (!(await confirm(t("leaveDraftConfirm")))) return;
                  if (draft.dataUrl.startsWith("blob:")) URL.revokeObjectURL(draft.dataUrl);
                  setUploadRatio(null);
                  setDraft(null);
                })();
              }}
            />
          ) : null
        }
      />
      {top ? (
        <button
          type="button"
          className="fixed right-[var(--gutter)] bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-20 grid size-12 place-items-center rounded-full bg-magnet text-magnet-ink shadow-[0_10px_22px_rgb(208_102_18/0.26)]"
          aria-label={t("scrollTop")}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUp className="size-[22px]" strokeWidth={1.8} />
        </button>
      ) : null}
      <GuestNoticeSheet open={noticeOpen} onConfirm={confirmGuestNotice} onCancel={cancelGuestNotice} />
    </div>
  );
}
