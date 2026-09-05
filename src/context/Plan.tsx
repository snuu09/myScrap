import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loadProfile } from "../lib/profiles";
import {
  canStickText,
  canUploadBytes,
  computeUsageBytes,
  showAdsForProfile,
  storageLimitBytes,
  trialDaysLeft,
  trialExpired,
  type Profile,
} from "../lib/plans";
import { isBrowseUser } from "../lib/guest";
import { GUEST_FILE_LIMIT, GUEST_TOTAL_LIMIT } from "../lib/localScraps";
import type { Scrap } from "../lib/types";
import { useAuth } from "./Auth";

type PlanState = {
  profile: Profile | null;
  ready: boolean;
  usageBytes: number;
  scrapCount: number;
  setScrapsForUsage: (scraps: Scrap[]) => void;
  setUsageSnapshot: (next: { count: number; bytes: number }) => void;
  canUpload: (addingBytes: number) => { ok: boolean; reason?: "trialExpired" | "quotaExceeded" };
  canStick: () => { ok: boolean; reason?: "trialExpired" };
  showAds: boolean;
  storageLimit: number | null;
  trialExpired: boolean;
  trialDaysLeft: number | null;
  refreshProfile: () => Promise<void>;
};

const PlanContext = createContext<PlanState | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const { user, configured } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(!configured);
  const [usageBytes, setUsageBytes] = useState(0);
  const [scrapCount, setScrapCount] = useState(0);

  const refreshProfile = useCallback(async () => {
    if (!user || !configured) {
      setProfile(null);
      setReady(true);
      return;
    }
    const row = await loadProfile(user.id);
    setProfile(row);
    setReady(true);
  }, [user, configured]);

  useEffect(() => {
    setReady(false);
    setUsageBytes(0);
    setScrapCount(0);
    void refreshProfile();
  }, [refreshProfile]);

  const guest = isBrowseUser(user);

  const value = useMemo<PlanState>(
    () => ({
      profile,
      ready,
      usageBytes,
      scrapCount,
      setScrapsForUsage: (scraps) => {
        setUsageBytes(computeUsageBytes(scraps));
        setScrapCount(scraps.length);
      },
      setUsageSnapshot: ({ count, bytes }) => {
        setScrapCount(count);
        setUsageBytes(bytes);
      },
      canUpload: (addingBytes) => {
        if (guest) {
          if (addingBytes > GUEST_FILE_LIMIT || usageBytes + addingBytes > GUEST_TOTAL_LIMIT) {
            return { ok: false, reason: "quotaExceeded" };
          }
          return { ok: true };
        }
        return canUploadBytes(profile, usageBytes, addingBytes);
      },
      canStick: () => (guest ? { ok: true } : canStickText(profile)),
      showAds: showAdsForProfile(profile),
      storageLimit: guest ? GUEST_TOTAL_LIMIT : storageLimitBytes(profile),
      trialExpired: guest ? false : trialExpired(profile),
      trialDaysLeft: guest ? null : trialDaysLeft(profile),
      refreshProfile,
    }),
    [profile, ready, usageBytes, scrapCount, refreshProfile, guest],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan");
  return ctx;
}
