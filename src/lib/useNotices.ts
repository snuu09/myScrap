import { useCallback, useEffect, useMemo, useState } from "react";
import { isBrowseUser, useAuth } from "../context/Auth";
import { usePlan } from "../context/Plan";
import {
  buildNotices,
  clearNoticeHistory,
  dismissNotice,
  dismissOnboardingPrefs,
  isNoticeUnread,
  markNoticesSeen,
  NOTICE_PANEL_MAX,
  readDismissedNoticeIds,
  readNoticeLog,
  readSeenNoticeIds,
  upsertNoticeLog,
  type NoticeItem,
  type NoticeLogEntry,
} from "./notices";

export function useNotices() {
  const { user } = useAuth();
  const { profile, trialDaysLeft, trialExpired, usageBytes, storageLimit } = usePlan();
  const [tick, setTick] = useState(0);
  const browse = isBrowseUser(user);
  const planTier = browse ? "free" : (profile?.planTier ?? "free");

  useEffect(() => {
    function onChange() {
      setTick((n) => n + 1);
    }
    window.addEventListener("mybrary:notices-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("mybrary:notices-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const live = useMemo(
    () =>
      buildNotices({
        browse,
        profile,
        planTier,
        trialDaysLeft,
        trialExpired: browse ? false : trialExpired,
        createdAtIso: user?.created_at,
        usageBytes,
        storageLimit,
      }),
    [
      browse,
      profile,
      planTier,
      trialDaysLeft,
      trialExpired,
      user?.created_at,
      usageBytes,
      storageLimit,
      tick,
    ],
  );

  useEffect(() => {
    if (upsertNoticeLog(live)) setTick((n) => n + 1);
  }, [live]);

  const dismissed = readDismissedNoticeIds();
  const notices = live.filter((item) => !dismissed.has(item.id));
  const history: NoticeLogEntry[] = readNoticeLog();

  const seen = readSeenNoticeIds();
  const unreadIds = notices.filter((item) => isNoticeUnread(item.id, seen)).map((item) => item.id);
  const unreadCount = unreadIds.length;
  const historyUnreadIds = history
    .filter((entry) => !entry.dismissed && isNoticeUnread(entry.id, seen))
    .map((entry) => entry.id);
  const historyUnreadCount = historyUnreadIds.length;

  const dismissOnboarding = useCallback(() => {
    dismissOnboardingPrefs();
    setTick((n) => n + 1);
  }, []);

  const onNoticeActivate = useCallback(
    (item: NoticeItem) => {
      markNoticesSeen([item.id]);
      if (item.kind === "onboardingPrefs") dismissOnboarding();
      setTick((n) => n + 1);
    },
    [dismissOnboarding],
  );

  const markAllSeen = useCallback(() => {
    const ids = [...new Set([...notices.map((item) => item.id), ...history.map((entry) => entry.id)])];
    markNoticesSeen(ids);
    setTick((n) => n + 1);
  }, [notices, history]);

  const onDismiss = useCallback((id: string) => {
    dismissNotice(id);
    setTick((n) => n + 1);
  }, []);

  const onClearHistory = useCallback(() => {
    clearNoticeHistory();
    setTick((n) => n + 1);
  }, []);

  return {
    notices,
    history,
    count: notices.length,
    historyCount: history.length,
    unreadCount,
    historyUnreadCount,
    isUnread: (id: string) => isNoticeUnread(id, seen),
    panelMax: NOTICE_PANEL_MAX,
    panelItems: notices.slice(0, NOTICE_PANEL_MAX),
    hasMore: notices.length > NOTICE_PANEL_MAX,
    dismissOnboarding,
    onNoticeActivate,
    markAllSeen,
    onDismiss,
    onClearHistory,
  };
}
