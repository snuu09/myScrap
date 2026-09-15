import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { useT } from "../lib/useT";
import { usePrefs } from "../context/Prefs";
import { isBrowseUser, useAuth } from "../context/Auth";
import { usePlan } from "../context/Plan";
import { DraftCard } from "../components/DraftCard";
import { FileBatch, type BatchItem } from "../components/FileBatch";
import { GuestNoticeSheet } from "../components/GuestNoticeSheet";
import { ScrapList } from "../components/ScrapList";
import { StickDock } from "../components/StickDock";
import { requestAnalyze } from "../lib/analyze";
import { sheetGenieClass, usePresence } from "../lib/presence";
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
import { looksLikeAddress, shelfTitle } from "../lib/scrapFace";
import { usePagedSlice } from "../lib/usePagedSlice";
import { useDialog } from "../lib/dialog";
import { getSupabase } from "../lib/supabase";
import { analyzeFile, analyzeText, uid } from "../lib/tagger";
import { blobToObjectUrl, blobUrlToDataUrl, captureCover } from "../lib/captureCover";
import type { AnalyzeResult, Scrap } from "../lib/types";

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
  const [pendingDrafts, setPendingDrafts] = useState<Scrap[]>([]);
  const [batch, setBatch] = useState<BatchItem[]>([]);
  const [queueLabel, setQueueLabel] = useState("");
  const [savingBatch, setSavingBatch] = useState(false);
  const [saveRatio, setSaveRatio] = useState<number | null>(null);
  const queueRef = useRef<{ file: File; analyze: boolean }[]>([]);
  const queueMetaRef = useRef({ n: 0, total: 0 });
  const draftRef = useRef<Scrap | null>(null);
  const pendingRef = useRef<Scrap[]>([]);
  const [uploadRatio, setUploadRatio] = useState<number | null>(null);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    pendingRef.current = pendingDrafts;
  }, [pendingDrafts]);

  useEffect(() => {
    const reviewing = Boolean(draft) || pendingDrafts.length > 0;
    if (reviewing && location.pathname !== "/stick") {
      navigate("/stick", { replace: true });
      return;
    }
    if (!reviewing && location.pathname === "/stick" && !queueRef.current.length) {
      navigate("/", { replace: true });
    }
  }, [draft, pendingDrafts.length, location.pathname, navigate]);
  const [composer, setComposer] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
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
      setScraps([]);
      setScrapsForUsage([]);
      setDraft(null);
      pendingRef.current = [];
      setPendingDrafts([]);
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
    const pending = [...pendingRef.current];
    if (!doomed && !pending.length) return;
    setUploadRatio(null);
    draftRef.current = null;
    setDraft(null);
    pendingRef.current = [];
    setPendingDrafts([]);
    if (doomed) await revokeDraftMedia(doomed);
    for (const item of pending) await revokeDraftMedia(item);
  }

  async function busyGuard() {
    if (draft || pendingRef.current.length) await replaceOpenDraft();
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
    let ogPatch: Pick<Scrap, "og" | "ogStatus"> = { og: null, ogStatus: "" };
    if (url) {
      const ogResult = await fetchOgPreview(url);
      ogPatch = { og: ogResult.og, ogStatus: ogResult.ogStatus };
      setDraft((cur) =>
        cur && cur.id === next.id && cur.analyzing
          ? {
              ...cur,
              og: ogPatch.og || cur.og,
              ogStatus: ogPatch.ogStatus || cur.ogStatus,
              domain: cur.domain || ogPatch.og?.siteName || cur.domain,
            }
          : cur,
      );
    }
    const ai = await requestAnalyze({
      kind: "text",
      text,
      lang,
      ogTitle: ogPatch.og?.title,
      ogDescription: ogPatch.og?.description,
    });
    const resolvedUrl = ai.url || url || "";
    if (!ogPatch.og && resolvedUrl) {
      const ogResult = await fetchOgPreview(resolvedUrl);
      ogPatch = { og: ogResult.og, ogStatus: ogResult.ogStatus };
    }
    const title = shelfTitle({
      aiTitle: ai.miss ? "" : ai.title,
      ogTitle: ogPatch.og?.title,
      ogDescription: ogPatch.og?.description,
      domain: ai.domain || ogPatch.og?.siteName || hint.domain,
      url: resolvedUrl,
      fallback: "",
    });
    setDraft((cur) =>
      cur && cur.id === next.id
        ? {
            ...cur,
            analyzing: false,
            type: ai.type,
            tags: ai.tags,
            title: title || cur.title,
            text: ai.summary || ai.body || ogPatch.og?.description || cur.text,
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
    if (files.length === 1 && batch.length === 0 && !draftRef.current && !pendingRef.current.length) {
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

  /** After a file analyze finishes: stash into review list when batching, else keep the draft open. */
  function settleAnalyzedDraft(scrap: Scrap) {
    const hasMore = queueRef.current.length > 0;
    const batchMode = queueMetaRef.current.total > 1 || pendingRef.current.length > 0 || hasMore;
    if (!batchMode) {
      setDraft(scrap);
      return;
    }
    const nextPending = [...pendingRef.current, scrap];
    pendingRef.current = nextPending;
    setPendingDrafts(nextPending);
    draftRef.current = null;
    setDraft(null);
    setUploadRatio(null);
    if (hasMore) advanceQueue();
    else {
      queueMetaRef.current = { n: 0, total: 0 };
      setQueueLabel("");
    }
  }

  function confirmBatch() {
    const ready = validBatchItems(batch);
    if (!ready.length) return;
    if (needsGuestNotice(() => confirmBatch())) return;
    setBatch([]);
    if (pendingRef.current.length && !draftRef.current) {
      void (async () => {
        await replaceOpenDraft();
        beginQueue(ready);
      })();
      return;
    }
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
      const settled: Scrap = {
        ...next,
        analyzing: false,
        type: ai?.type || next.type,
        tags: ai?.tags || next.tags,
        title:
          shelfTitle({
            aiTitle: ai?.miss ? "" : ai?.title,
            domain: next.domain,
            url: next.url,
            fallback: looksLikeAddress(next.title, next.domain, next.url) ? "" : next.title,
          }) || next.title,
        text: ai?.summary || ai?.body || next.text,
        previewText: ai?.analysis || next.previewText,
        ...classifyFlags(ai),
        storedMedia: uploaded.storedMedia,
        mediaPath: uploaded.mediaPath,
        dataUrl: uploaded.dataUrl || next.dataUrl,
        posterPath: next.posterPath,
        posterUrl: next.posterUrl,
        posterUrls: next.posterUrls.length ? next.posterUrls : next.posterUrl ? [next.posterUrl] : [],
        pages: next.pages,
      };
      setUploadRatio(null);
      settleAnalyzedDraft(settled);
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

  async function persistOne(source: Scrap): Promise<void> {
    if (!user) return;
    let nextDraft = source;
    if (needsOgCoverSnapshot(source)) {
      try {
        const poster = await snapshotOgCover(user, source);
        if (poster) nextDraft = { ...source, ...poster };
      } catch {
        /* keep the remote og image if the copy fails */
      }
    }
    const previewBlob = nextDraft.dataUrl.startsWith("blob:") ? nextDraft.dataUrl : "";
    const posterBlobs = [...new Set([nextDraft.posterUrl, ...nextDraft.posterUrls].filter((url) => url.startsWith("blob:")))];
    let dataUrl = nextDraft.dataUrl;
    let posterUrl = nextDraft.posterUrl;
    let posterUrls = nextDraft.posterUrls.length ? nextDraft.posterUrls : posterUrl ? [posterUrl] : [];

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

    const savedTitle = shelfTitle({
      aiTitle: looksLikeAddress(nextDraft.title, nextDraft.domain, nextDraft.url) ? "" : nextDraft.title,
      ogTitle: nextDraft.og?.title,
      ogDescription: nextDraft.og?.description,
      domain: nextDraft.domain,
      url: nextDraft.url,
      fallback: nextDraft.title,
    });
    const saved = {
      ...nextDraft,
      title: savedTitle || nextDraft.title,
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
    if (previewBlob) URL.revokeObjectURL(previewBlob);
    posterBlobs.forEach((url) => URL.revokeObjectURL(url));
  }

  async function persist() {
    if (!user || !draft || draft.analyzing) return;
    if (!getSupabase()) {
      setError(t("syncError"));
      await alert(t("syncError"));
      return;
    }
    if (needsGuestNotice(() => void persist())) return;
    try {
      await persistOne(draft);
      draftRef.current = null;
      setDraft(null);
      await refresh();
      advanceQueue();
    } catch (err) {
      const message = err instanceof GuestQuotaError ? t("guestQuotaMsg") : t("syncError");
      setError(message);
      await alert(message);
    }
  }

  async function persistPendingAll() {
    if (!user || !pendingDrafts.length || savingBatch) return;
    if (!getSupabase()) {
      setError(t("syncError"));
      await alert(t("syncError"));
      return;
    }
    if (needsGuestNotice(() => void persistPendingAll())) return;
    const queue = [...pendingDrafts];
    setSavingBatch(true);
    setSaveRatio(0);
    try {
      for (let i = 0; i < queue.length; i++) {
        await persistOne(queue[i]);
        const left = queue.slice(i + 1);
        pendingRef.current = left;
        setPendingDrafts(left);
        setSaveRatio((i + 1) / queue.length);
      }
      await refresh();
    } catch (err) {
      const message = err instanceof GuestQuotaError ? t("guestQuotaMsg") : t("syncError");
      setError(message);
      await alert(message);
    } finally {
      setSavingBatch(false);
      setSaveRatio(null);
    }
  }

  async function revokeDraftMedia(doomed: Scrap) {
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
    await revokeDraftMedia(doomed);
    advanceQueue();
  }

  async function discardPendingAll() {
    if (!pendingDrafts.length || savingBatch) return;
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
    const doomed = [...pendingDrafts];
    pendingRef.current = [];
    setPendingDrafts([]);
    for (const item of doomed) await revokeDraftMedia(item);
  }

  const stickDisabled = !canStick().ok || !getSupabase();
  const reviewingBatch = pendingDrafts.length > 0 && !draft;
  const draftPresence = usePresence(Boolean(draft) || reviewingBatch);
  const batchPresence = usePresence(batch.length > 0);
  const draftHeld = useRef<ReactNode>(null);
  const batchHeld = useRef<ReactNode>(null);
  const composing = draftPresence.shown || location.pathname === "/stick";

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

  const reviewPanel =
    reviewingBatch ? (
      <div className="classify-batch-review">
        <div className="list-tools-head">
          <p className="list-tools-label">{t("classifyDone")}</p>
          <p className="list-tools-label">{t("batchProgress", { n: pendingDrafts.length, total: pendingDrafts.length })}</p>
        </div>
        {pendingDrafts.map((item) => (
          <div key={item.id} className="classify-batch-review-item">
            <DraftCard
              draft={item}
              hideActions
              saving={savingBatch}
              onChange={(patch) =>
                setPendingDrafts((cur) => cur.map((row) => (row.id === item.id ? { ...row, ...patch } : row)))
              }
              onSave={() => void persistPendingAll()}
              onCancel={() => void discardPendingAll()}
            />
          </div>
        ))}
        <div className="classify-draft-actions">
          <button type="button" className="auth-link-utility" onClick={() => void discardPendingAll()} disabled={savingBatch}>
            {t("cancel")}
          </button>
          <button
            type="button"
            className={"auth-btn-primary classify-save-btn px-4" + (savingBatch ? " is-saving" : "")}
            disabled={savingBatch}
            onClick={() => void persistPendingAll()}
          >
            {savingBatch && saveRatio != null ? (
              <span className="classify-save-ring" aria-hidden>
                <svg viewBox="0 0 36 36">
                  <circle className="classify-save-ring-track" cx="18" cy="18" r="15" fill="none" />
                  <circle
                    className="classify-save-ring-fill"
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    style={{ strokeDashoffset: `${94.2 * (1 - Math.min(1, Math.max(0, saveRatio)))}` }}
                  />
                </svg>
              </span>
            ) : null}
            <span>{t("save")}</span>
          </button>
        </div>
      </div>
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
  ) : (
    reviewPanel
  );
  if (draftPanel) draftHeld.current = draftPanel;
  if (batchPanel) batchHeld.current = batchPanel;

  return (
    <div
      className={
        "relative flex min-h-0 flex-1 flex-col" +
        (composing ? "" : " pb-[calc(7.5rem+env(safe-area-inset-bottom))]")
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
          {batchPresence.shown ? (
            <section
              className={"classify-draft" + sheetGenieClass(batchPresence.closing)}
              onAnimationEnd={(event) => batchPresence.onEnd(event, "sheet-genie-out")}
            >
              {batchPanel ?? batchHeld.current}
            </section>
          ) : null}
          {draftPresence.shown ? (
            <section
              className={"classify-draft" + sheetGenieClass(draftPresence.closing)}
              aria-label={t("classifyTitle")}
              onAnimationEnd={(event) => draftPresence.onEnd(event, "sheet-genie-out")}
            >
              {draftPanel ?? draftHeld.current}
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
        draftSlot={batchPanel}
      />
      )}
      {top && !composing ? (
        <button
          type="button"
          className="fixed right-[var(--gutter)] bottom-[calc(7.75rem+env(safe-area-inset-bottom))] z-20 grid size-12 place-items-center rounded-full bg-magnet text-magnet-ink shadow-[0_10px_22px_rgb(208_102_18/0.26)]"
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
