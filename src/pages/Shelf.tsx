import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { useT } from "../lib/useT";
import { usePrefs } from "../context/Prefs";
import { isBrowseUser, useAuth } from "../context/Auth";
import { usePlan } from "../context/Plan";
import { DraftCard } from "../components/DraftCard";
import { FileBatch, type BatchItem } from "../components/FileBatch";
import { Footer } from "../components/Footer";
import { GuestNoticeSheet } from "../components/GuestNoticeSheet";
import { ScrapList } from "../components/ScrapList";
import { StickDock } from "../components/StickDock";
import { requestAnalyze } from "../lib/analyze";
import { fetchOgPreview } from "../lib/og";
import { needsOgCoverSnapshot, snapshotOgCover } from "../lib/ogCover";
import {
  hydrateSignedMedia,
  loadScraps,
  posterPagePath,
  removeMedia,
  saveScrap,
  uploadMedia,
  uploadPosters,
  SCRAPS_CHANGED_EVENT,
  SCRAPS_CLEARED_EVENT,
} from "../lib/scraps";
import { GuestQuotaError, GUEST_FILE_LIMIT, guestNoticeSeen, markGuestNoticeSeen } from "../lib/localScraps";
import { uploadIssue } from "../lib/uploadCheck";
import { filterScraps } from "../lib/scrapFilters";
import { usePagedSlice } from "../lib/usePagedSlice";
import { useDialog } from "../lib/dialog";
import { getSupabase } from "../lib/supabase";
import { analyzeFile, analyzeText, uid } from "../lib/tagger";
import { blobToObjectUrl, blobUrlToDataUrl, captureCover } from "../lib/captureCover";
import type { AnalyzeResult, Scrap, ScrapType } from "../lib/types";

const REMIND_NOTIFIED_KEY = "mybrary.remind.notified";

function classifyFlags(ai: AnalyzeResult | null): Pick<Scrap, "classifyFallback" | "classifyMiss"> {
  if (!ai) return { classifyFallback: false, classifyMiss: "" };
  return {
    classifyFallback: Boolean(ai.fallback),
    classifyMiss: ai.miss || "",
  };
}

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
    posterPath: "",
    posterUrl: "",
    posterUrls: [],
    pages: 0,
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

export function Shelf() {
  const t = useT();
  const { lang } = usePrefs();
  const { user } = useAuth();
  const { setScrapsForUsage, canUpload, canStick } = usePlan();
  const { alert, confirm } = useDialog();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const guest = isBrowseUser(user);
  const pendingWrite = useRef<(() => void) | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [listReady, setListReady] = useState(false);
  const [draft, setDraft] = useState<Scrap | null>(null);
  const [batch, setBatch] = useState<BatchItem[]>([]);
  const [queueLabel, setQueueLabel] = useState("");
  const queueRef = useRef<{ file: File; analyze: boolean }[]>([]);
  const queueMetaRef = useRef({ n: 0, total: 0 });
  const draftRef = useRef<Scrap | null>(null);
  const [uploadRatio, setUploadRatio] = useState<number | null>(null);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    if (draft && location.pathname !== "/stick") {
      navigate("/stick", { replace: true });
      return;
    }
    if (!draft && location.pathname === "/stick" && !queueRef.current.length) {
      navigate("/", { replace: true });
    }
  }, [draft, location.pathname, navigate]);
  const [composer, setComposer] = useState("");
  const [typeFilter, setTypeFilter] = useState<ScrapType | "all">("all");
  const [dropping, setDropping] = useState(false);
  const [error, setError] = useState("");
  const [top, setTop] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q == null) return;
    navigate("/search?q=" + encodeURIComponent(q), { replace: true });
  }, [searchParams, navigate]);

  const visible = useMemo(
    () => filterScraps(scraps, { query: "", type: typeFilter, day: null }),
    [scraps, typeFilter],
  );
  const paged = usePagedSlice(visible);
  const windowRef = useRef(paged.slice);
  windowRef.current = paged.slice;

  const ogFillTried = useRef(new Set<string>());
  const coverSnapTried = useRef(new Set<string>());

  useEffect(() => {
    if (!user || !listReady) return;
    const missing = windowRef.current.filter((item) => item.url && !item.og?.image && !ogFillTried.current.has(item.id));
    if (!missing.length) return;
    for (const item of missing.slice(0, 8)) {
      ogFillTried.current.add(item.id);
      void fetchOgPreview(item.url).then(async (result) => {
        if (!result.og?.image) return;
        const updated = {
          ...item,
          og: result.og,
          ogStatus: result.ogStatus,
          updatedAt: Date.now(),
        };
        try {
          await saveScrap(user, updated);
          setScraps((list) =>
            list.map((row) =>
              row.id === updated.id && !row.og?.image
                ? { ...row, og: updated.og, ogStatus: updated.ogStatus, updatedAt: updated.updatedAt }
                : row,
            ),
          );
        } catch {
          ogFillTried.current.delete(item.id);
        }
      });
    }
  }, [user, listReady, paged.shown, typeFilter]);

  useEffect(() => {
    if (!user || !listReady) return;
    const missing = windowRef.current.filter((item) => needsOgCoverSnapshot(item) && !coverSnapTried.current.has(item.id));
    if (!missing.length) return;
    for (const item of missing.slice(0, 4)) {
      coverSnapTried.current.add(item.id);
      void snapshotOgCover(user, item).then(async (poster) => {
        if (!poster?.posterUrl && !poster?.posterPath) return;
        const updated = { ...item, ...poster, updatedAt: Date.now() };
        try {
          await saveScrap(user, updated);
          setScraps((list) =>
            list.map((row) =>
              row.id === updated.id && !row.posterUrl && !row.posterPath
                ? {
                    ...row,
                    posterPath: updated.posterPath,
                    posterUrl: updated.posterUrl,
                    posterUrls: updated.posterUrls,
                    pages: updated.pages,
                    updatedAt: updated.updatedAt,
                  }
                : row,
            ),
          );
        } catch {
          coverSnapTried.current.delete(item.id);
        }
      });
    }
  }, [user, listReady, paged.shown, typeFilter]);

  useEffect(() => {
    if (!user || !listReady || !paged.slice.length) return;
    const windowItems = windowRef.current;
    let cancelled = false;
    void hydrateSignedMedia(windowItems, { posterPages: 1 })
      .then((hydrated) => {
        if (cancelled) return;
        const byId = new Map(hydrated.map((item) => [item.id, item]));
        setScraps((list) =>
          list.map((item) => {
            const signed = byId.get(item.id);
            if (!signed) return item;
            if (
              signed.dataUrl === item.dataUrl &&
              signed.posterUrl === item.posterUrl &&
              signed.posterUrls.length === item.posterUrls.length
            ) {
              return item;
            }
            return {
              ...item,
              dataUrl: signed.dataUrl || item.dataUrl,
              storedMedia: signed.storedMedia || item.storedMedia,
              posterUrl: signed.posterUrl || item.posterUrl,
              posterUrls: signed.posterUrls.length ? signed.posterUrls : item.posterUrls,
            };
          }),
        );
      })
      .catch(() => {
        /* metadata stays until the next window */
      });
    return () => {
      cancelled = true;
    };
  }, [user, listReady, paged.shown, typeFilter]);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const next = await loadScraps(user);
      setScraps(next);
      setScrapsForUsage(next);
      setListReady(true);
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
    if (!draftRef.current && queueRef.current.length) advanceQueue();
  }

  async function guardStick() {
    const msg = stickBlockedReason();
    if (msg) {
      await alert(msg);
      return true;
    }
    return false;
  }

  async function replaceOpenDraft() {
    const doomed = draft;
    if (!doomed) return;
    setUploadRatio(null);
    setDraft(null);
    if (doomed.dataUrl.startsWith("blob:")) URL.revokeObjectURL(doomed.dataUrl);
    if (user && doomed.mediaPath) {
      try {
        await removeMedia(user, doomed.mediaPath);
      } catch {
        /* best-effort before starting the next stick */
      }
    }
  }

  async function busyGuard() {
    if (draft) await replaceOpenDraft();
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
    const url = hint.url || "";
    const aiPromise = requestAnalyze({ kind: "text", text, lang });
    const ogPromise = url ? fetchOgPreview(url) : null;
    if (ogPromise) {
      void ogPromise.then((ogResult) => {
        setDraft((cur) =>
          cur && cur.id === next.id && cur.analyzing
            ? {
                ...cur,
                og: ogResult.og || cur.og,
                ogStatus: ogResult.ogStatus || cur.ogStatus,
                title: cur.title || ogResult.og?.title || cur.title,
                domain: cur.domain || ogResult.og?.siteName || cur.domain,
              }
            : cur,
        );
      });
    }
    const ai = await aiPromise;
    const resolvedUrl = ai.url || url || "";
    let ogPatch: Pick<Scrap, "og" | "ogStatus"> = { og: null, ogStatus: "" };
    if (ogPromise) {
      const ogResult = await ogPromise;
      ogPatch = { og: ogResult.og, ogStatus: ogResult.ogStatus };
    } else if (resolvedUrl) {
      const ogResult = await fetchOgPreview(resolvedUrl);
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
            text: ai.summary || ai.body || cur.text,
            previewText: ai.analysis || "",
            url: resolvedUrl || cur.url,
            domain: ai.domain || cur.domain,
            ...classifyFlags(ai),
            ...ogPatch,
          }
        : cur,
    );
  }

  function receiveFiles(list: FileList | File[]) {
    if (!getSupabase()) {
      void alert(t("syncError"));
      return;
    }
    const files = Array.from(list);
    if (!files.length) return;
    if (files.length === 1 && batch.length === 0 && !draftRef.current) {
      void startFromFile(files[0]);
      return;
    }
    setBatch((cur) => {
      const next = [...cur];
      for (const file of files) {
        const id = `${file.name}:${file.size}:${file.lastModified}`;
        if (next.some((item) => item.id === id)) continue;
        next.push({ id, file, analyze: true });
      }
      return next;
    });
  }

  function validBatchItems(items: BatchItem[]) {
    let reserved = 0;
    const ready: { file: File; analyze: boolean }[] = [];
    for (const item of items) {
      const issue = uploadIssue(item.file, { guest, reservedBytes: reserved, canUpload });
      if (issue) continue;
      reserved += item.file.size;
      ready.push({ file: item.file, analyze: item.analyze });
    }
    return ready;
  }

  function beginQueue(items: { file: File; analyze: boolean }[]) {
    const [first, ...rest] = items;
    if (!first) return;
    queueRef.current = rest;
    queueMetaRef.current = { n: 1, total: items.length };
    setQueueLabel(items.length > 1 ? t("batchProgress", { n: 1, total: items.length }) : "");
    void startFromFile(first.file, first.analyze);
  }

  function advanceQueue() {
    const next = queueRef.current.shift();
    if (!next) {
      queueMetaRef.current = { n: 0, total: 0 };
      setQueueLabel("");
      return;
    }
    const n = queueMetaRef.current.n + 1;
    queueMetaRef.current.n = n;
    const total = queueMetaRef.current.total || n;
    setQueueLabel(total > 1 ? t("batchProgress", { n, total }) : "");
    void startFromFile(next.file, next.analyze);
  }

  function confirmBatch() {
    const ready = validBatchItems(batch);
    if (!ready.length) return;
    if (needsGuestNotice(() => confirmBatch())) return;
    setBatch([]);
    if (draftRef.current) {
      queueRef.current.push(...ready);
      if (!queueMetaRef.current.total) queueMetaRef.current = { n: 0, total: ready.length };
      else {
        queueMetaRef.current.total += ready.length;
        setQueueLabel(t("batchProgress", { n: queueMetaRef.current.n, total: queueMetaRef.current.total }));
      }
      return;
    }
    beginQueue(ready);
  }

  async function startFromFile(file: File, analyze = true) {
    if (!user) return;
    if (draftRef.current) return;
    if (await guardStick()) return;
    if (!file) return;
    // Guest oversize sticks as metadata only (0 media bytes); attachLocalMedia skips the blob.
    const guestMetaOnly = guest && file.size > GUEST_FILE_LIMIT;
    const blocked = uploadBlockedReason(guestMetaOnly ? 0 : file.size);
    if (blocked) {
      await alert(blocked);
      advanceQueue();
      return;
    }
    if (needsGuestNotice(() => void startFromFile(file, analyze))) return;
    const hint = analyzeFile(file);
    const wantsBlob =
      hint.type === "image" ||
      hint.type === "video" ||
      hint.type === "audio" ||
      file.type.startsWith("image/") ||
      file.type.startsWith("video/") ||
      file.type.startsWith("audio/") ||
      file.type === "application/pdf" ||
      /\.pdf$/i.test(file.name);
    const localPreview = wantsBlob ? URL.createObjectURL(file) : "";
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
    const coverObjectUrls: string[] = [];
    try {
      const coverPromise = captureCover(file).then(async (blobs) => {
        if (!blobs.length) return null;
        blobs.forEach((blob) => coverObjectUrls.push(blobToObjectUrl(blob)));
        setDraft((cur) =>
          cur && cur.id === next.id
            ? {
                ...cur,
                posterUrl: coverObjectUrls[0] || "",
                posterUrls: coverObjectUrls,
                pages: coverObjectUrls.length,
              }
            : cur,
        );
        try {
          return await uploadPosters(user, next.id, blobs);
        } catch {
          return {
            posterPath: "",
            posterUrl: coverObjectUrls[0] || "",
            posterUrls: coverObjectUrls,
            pages: coverObjectUrls.length,
          };
        }
      });
      const uploaded = await uploadMedia(user, next, file, (ratio) => setUploadRatio(ratio));
      if (localPreview && uploaded.dataUrl && uploaded.dataUrl !== localPreview) {
        URL.revokeObjectURL(localPreview);
      }
      next.mediaPath = uploaded.mediaPath;
      next.dataUrl = uploaded.dataUrl || localPreview;
      next.storedMedia = uploaded.storedMedia;
      const poster = await coverPromise;
      if (poster) {
        next.posterPath = poster.posterPath;
        next.posterUrl = poster.posterUrl || coverObjectUrls[0] || next.posterUrl;
        next.posterUrls = poster.posterUrls?.length ? poster.posterUrls : coverObjectUrls;
        next.pages = poster.pages || next.posterUrls.length;
      }
      setDraft({ ...next, analyzing: analyze });
      const skipped = uploaded.skipped;
      const ai = analyze
        ? await requestAnalyze({
            kind: "file",
            mediaPath: uploaded.mediaPath,
            mime: hint.mime,
            filename: hint.filename,
            lang,
          })
        : null;
      setDraft((cur) =>
        cur && cur.id === next.id
          ? {
              ...cur,
              analyzing: false,
              type: ai?.type || cur.type,
              tags: ai?.tags || cur.tags,
              title: ai?.title || cur.title,
              text: ai?.summary || ai?.body || cur.text,
              previewText: ai?.analysis || cur.previewText,
              ...classifyFlags(ai),
              storedMedia: uploaded.storedMedia,
              mediaPath: uploaded.mediaPath,
              dataUrl: uploaded.dataUrl || cur.dataUrl,
              posterPath: next.posterPath || cur.posterPath,
              posterUrl: next.posterUrl || cur.posterUrl,
              posterUrls: next.posterUrls.length ? next.posterUrls : cur.posterUrls,
              pages: next.pages || cur.pages,
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
      coverObjectUrls.forEach((url) => URL.revokeObjectURL(url));
      setUploadRatio(null);
      const orphanPath = next.mediaPath;
      const orphanPoster = next.posterPath;
      setDraft((cur) =>
        cur && cur.id === next.id
          ? {
              ...cur,
              analyzing: false,
              error: "upload",
              dataUrl: "",
              mediaPath: "",
              posterPath: "",
              posterUrl: "",
              posterUrls: [],
              pages: 0,
            }
          : cur,
      );
      if (orphanPath) {
        try {
          await removeMedia(user, orphanPath);
        } catch {
          /* best-effort */
        }
      }
      if (orphanPoster) {
        try {
          await removeMedia(user, orphanPoster);
        } catch {
          /* best-effort */
        }
      }
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
    let nextDraft = draft;
    if (needsOgCoverSnapshot(draft)) {
      try {
        const poster = await snapshotOgCover(user, draft);
        if (poster) nextDraft = { ...draft, ...poster };
      } catch {
        /* keep the remote og image if the copy fails */
      }
    }
    const previewBlob = nextDraft.dataUrl.startsWith("blob:") ? nextDraft.dataUrl : "";
    const posterBlobs = [...new Set([nextDraft.posterUrl, ...nextDraft.posterUrls].filter((url) => url.startsWith("blob:")))];
    let dataUrl = nextDraft.dataUrl;
    let posterUrl = nextDraft.posterUrl;
    let posterUrls = nextDraft.posterUrls.length ? nextDraft.posterUrls : posterUrl ? [posterUrl] : [];
    try {
      if (nextDraft.mediaPath && dataUrl.startsWith("blob:")) dataUrl = "";
      else if (!nextDraft.mediaPath && dataUrl.startsWith("blob:")) dataUrl = await blobUrlToDataUrl(dataUrl);

      if (nextDraft.posterPath) {
        if (posterUrl.startsWith("blob:")) posterUrl = "";
        posterUrls = posterUrls.filter((url) => !url.startsWith("blob:"));
      } else {
        if (posterUrl.startsWith("blob:")) posterUrl = await blobUrlToDataUrl(posterUrl);
        posterUrls = await Promise.all(posterUrls.map((url) => (url.startsWith("blob:") ? blobUrlToDataUrl(url) : url)));
        if (!posterUrls.length && posterUrl) posterUrls = [posterUrl];
      }

      const saved = {
        ...nextDraft,
        dataUrl,
        posterUrl: posterUrl || posterUrls[0] || "",
        posterUrls,
        pages: nextDraft.pages || posterUrls.length,
        updatedAt: Date.now(),
        analyzing: false,
        classifyFallback: undefined,
        classifyMiss: undefined,
      };
      await saveScrap(user, saved);
      draftRef.current = null;
      setDraft(null);
      await refresh();
      if (previewBlob) URL.revokeObjectURL(previewBlob);
      posterBlobs.forEach((url) => URL.revokeObjectURL(url));
      advanceQueue();
    } catch (err) {
      const message = err instanceof GuestQuotaError ? t("guestQuotaMsg") : t("syncError");
      setError(message);
      await alert(message);
    }
  }

  /** Drop an unsaved draft and remove any Storage object uploaded for Claude classify. */
  async function discardDraft() {
    if (!draft) return;
    if (
      !(await confirm({
        title: t("leaveDraftTitle"),
        body: t("leaveDraftConfirm"),
        confirmLabel: t("leaveDraftDiscard"),
        cancelLabel: t("cancel"),
        danger: true,
      }))
    )
      return;
    const doomed = draft;
    setUploadRatio(null);
    draftRef.current = null;
    setDraft(null);
    if (doomed.dataUrl.startsWith("blob:")) URL.revokeObjectURL(doomed.dataUrl);
    for (const url of [doomed.posterUrl, ...doomed.posterUrls]) {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    }
    if (user && doomed.mediaPath) {
      try {
        await removeMedia(user, doomed.mediaPath);
      } catch {
        /* draft is already closed; orphan cleanup can wait for a later peel/clear */
      }
    }
    if (user && (doomed.posterPath || doomed.pages)) {
      const paths = new Set<string>();
      if (doomed.posterPath) paths.add(doomed.posterPath);
      for (let i = 1; i <= Math.max(doomed.pages, 4); i++) {
        paths.add(posterPagePath(user.id, doomed.id, i));
      }
      for (const path of paths) {
        try {
          await removeMedia(user, path);
        } catch {
          /* best-effort */
        }
      }
    }
    advanceQueue();
  }

  const stickDisabled = !canStick().ok || !getSupabase();
  const composing = Boolean(draft) || location.pathname === "/stick";

  const batchPanel = batch.length ? (
    <FileBatch
      items={batch}
      guest={guest}
      canUpload={canUpload}
      onToggleAnalyze={(id) =>
        setBatch((cur) => cur.map((item) => (item.id === id ? { ...item, analyze: !item.analyze } : item)))
      }
      onRemove={(id) => setBatch((cur) => cur.filter((item) => item.id !== id))}
      onConfirm={confirmBatch}
      onCancel={() => setBatch([])}
    />
  ) : null;

  const draftPanel = draft ? (
    <DraftCard
      draft={draft}
      uploadRatio={uploadRatio}
      queueLabel={queueLabel}
      onChange={(patch) => setDraft((cur) => (cur ? { ...cur, ...patch } : cur))}
      onSave={() => void persist()}
      onCancel={() => void discardDraft()}
    />
  ) : null;

  return (
    <div
      className={
        "relative flex min-h-0 flex-1 flex-col" +
        (composing ? "" : " pb-[calc(12.5rem+env(safe-area-inset-bottom))]")
      }
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
        if (e.dataTransfer.files.length) receiveFiles(e.dataTransfer.files);
        else {
          const text = e.dataTransfer.getData("text/plain");
          if (text) void startFromText(text);
        }
      }}
    >
      {composing ? (
        <div className="compose-page">
          {error ? <p className="m-0 text-[0.8125rem] text-danger">{error}</p> : null}
          {batchPanel ? <section className="classify-draft">{batchPanel}</section> : null}
          {draftPanel ? (
            <section className="classify-draft" aria-label={t("classifyTitle")}>
              {draftPanel}
            </section>
          ) : null}
        </div>
      ) : (
      <div className="shelf-column">
        {error ? <p className="mx-auto max-w-[40rem] px-[var(--gutter)] pt-3 text-[0.8125rem] text-danger">{error}</p> : null}
        <ScrapList
          scraps={scraps}
          loading={!listReady}
          typeFilter={typeFilter}
          onType={setTypeFilter}
          hasMore={paged.hasMore}
          onLoadMore={paged.loadMore}
          sentinelRef={paged.sentinelRef}
          visible={paged.slice}
        />
      </div>
      )}
      {composing ? null : (
      <StickDock
        value={composer}
        onChange={setComposer}
        onSubmitText={() => void startFromText(composer)}
        onFiles={receiveFiles}
        dropping={dropping}
        disabled={stickDisabled}
        disabledHint={stickBlockedReason()}
        below={<Footer />}
        draftSlot={batchPanel}
      />
      )}
      {top && !composing ? (
        <button
          type="button"
          className="fixed right-[var(--gutter)] bottom-[calc(13.25rem+env(safe-area-inset-bottom))] z-20 grid size-12 place-items-center rounded-full bg-magnet text-magnet-ink shadow-[0_10px_22px_rgb(208_102_18/0.26)]"
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
