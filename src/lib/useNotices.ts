import { useCallback, useEffect, useState } from "react";
import { isBrowseUser, useAuth } from "../context/Auth";
import { usePlan } from "../context/Plan";
import {
  buildNotices,
  dismissOnboardingPrefs,
  isNoticeUnread,
  markNoticesSeen,
  NOTICE_PANEL_MAX,
  readSeenNoticeIds,
  type NoticeItem,
} from "./notices";

export function useNotices() {
  const { user } = useAuth();
  const { profile, trialDaysLeft, trialExpired, usageBytes, storageLimit } = usePlan();
  const [, setTick] = useState(0);
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

  const notices: NoticeItem[] = buildNotices({
    browse,
    profile,
    planTier,
    trialDaysLeft,
    trialExpired: browse ? false : trialExpired,
    createdAtIso: user?.created_at,
    usageBytes,
    storageLimit,
  });

  const seen = readSeenNoticeIds();
  const unreadIds = notices.filter((item) => isNoticeUnread(item.id, seen)).map((item) => item.id);
  const unreadCount = unreadIds.length;

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
    markNoticesSeen(notices.map((item) => item.id));
    setTick((n) => n + 1);
  }, [notices]);

  return {
    notices,
    count: notices.length,
    unreadCount,
    isUnread: (id: string) => isNoticeUnread(id, seen),
    panelMax: NOTICE_PANEL_MAX,
    panelItems: notices.slice(0, NOTICE_PANEL_MAX),
    hasMore: notices.length > NOTICE_PANEL_MAX,
    dismissOnboarding,
    onNoticeActivate,
    markAllSeen,
  };
}
