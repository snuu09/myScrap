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
      canUpload: (addingBytes) => canUploadBytes(profile, usageBytes, addingBytes),
      canStick: () => canStickText(profile),
      showAds: showAdsForProfile(profile),
      storageLimit: storageLimitBytes(profile),
      trialExpired: trialExpired(profile),
      trialDaysLeft: trialDaysLeft(profile),
      refreshProfile,
    }),
    [profile, ready, usageBytes, scrapCount, refreshProfile],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan");
  return ctx;
}
