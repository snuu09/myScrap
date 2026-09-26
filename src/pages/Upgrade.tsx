import { Check, CheckCircle2, Minus } from "lucide-react";
import { useAuth } from "../context/Auth";
import { usePlan } from "../context/Plan";
import { PLAN_LIMITS, planDisplayName, type PlanTier } from "../lib/plans";
import { formatBytes } from "../lib/tagger";
import { useT } from "../lib/useT";

type Cell = { kind: "text" | "muted" | "yes" | "no"; value?: string };

type MatrixTier = "free" | "standard" | "premium";

const TIERS: MatrixTier[] = ["free", "standard", "premium"];

function mapCurrent(tier: PlanTier | undefined): MatrixTier | null {
  if (tier === "standard") return "standard";
  if (tier === "premium" || tier === "admin") return "premium";
  if (tier === "free") return "free";
  return null;
}

function storageCell(
  tier: MatrixTier,
  t: (key: string, vars?: Record<string, string | number>) => string,
): Cell {
  const limit = PLAN_LIMITS[tier].storageBytes;
  if (limit === null) return { kind: "text", value: t("storageUnlimited") };
  return { kind: "text", value: formatBytes(limit) };
}

function batchCell(tier: MatrixTier, t: (key: string, vars?: Record<string, string | number>) => string): Cell {
  const max = PLAN_LIMITS[tier].batchMaxFiles;
  if (max === null) return { kind: "text", value: t("upgradeBatchUnlimited") };
  return { kind: "text", value: t("upgradeBatchN", { n: max }) };
}

function CellView({ cell }: { cell: Cell }) {
  if (cell.kind === "yes") {
    return (
      <span className="plan-matrix-yes" aria-label="yes">
        <Check className="size-4" strokeWidth={2.4} aria-hidden />
      </span>
    );
  }
  if (cell.kind === "no") {
    return (
      <span className="plan-matrix-no" aria-label="no">
        <Minus className="size-4" strokeWidth={2.2} aria-hidden />
      </span>
    );
  }
  if (cell.kind === "muted") {
    return <span className="plan-matrix-muted">{cell.value ?? "—"}</span>;
  }
  return <span className="plan-matrix-text">{cell.value}</span>;
}

export function Upgrade() {
  const t = useT();
  const { user } = useAuth();
  const { profile } = usePlan();
  const current = mapCurrent(profile?.planTier);

  const rows: { feature: string; cells: Record<MatrixTier, Cell> }[] = [
    {
      feature: t("upgradeRowTrial"),
      cells: {
        free: { kind: "text", value: t("upgradeTrialFree") },
        standard: { kind: "muted", value: "—" },
        premium: { kind: "muted", value: "—" },
      },
    },
    {
      feature: t("upgradeRowStorage"),
      cells: {
        free: storageCell("free", t),
        standard: storageCell("standard", t),
        premium: storageCell("premium", t),
      },
    },
    {
      feature: t("upgradeRowAds"),
      cells: {
        free: PLAN_LIMITS.free.ads ? { kind: "yes" } : { kind: "no" },
        standard: PLAN_LIMITS.standard.ads ? { kind: "yes" } : { kind: "no" },
        premium: PLAN_LIMITS.premium.ads ? { kind: "yes" } : { kind: "no" },
      },
    },
    {
      feature: t("upgradeRowClassify"),
      cells: {
        free: { kind: "text", value: t("upgradeClassifyTrial") },
        standard: { kind: "text", value: t("upgradeClassifyAlways") },
        premium: { kind: "text", value: t("upgradeClassifyAlways") },
      },
    },
    {
      feature: t("upgradeRowBatch"),
      cells: {
        free: batchCell("free", t),
        standard: batchCell("standard", t),
        premium: batchCell("premium", t),
      },
    },
    {
      feature: t("upgradeRowRemind"),
      cells: {
        free: PLAN_LIMITS.free.remind ? { kind: "yes" } : { kind: "no" },
        standard: PLAN_LIMITS.standard.remind ? { kind: "yes" } : { kind: "no" },
        premium: PLAN_LIMITS.premium.remind ? { kind: "yes" } : { kind: "no" },
      },
    },
    {
      feature: t("upgradeRowBundle"),
      cells: {
        free: { kind: "no" },
        standard: { kind: "no" },
        premium: { kind: "yes" },
      },
    },
    {
      feature: t("upgradeRowHistory"),
      cells: {
        free: { kind: "no" },
        standard: { kind: "no" },
        premium: { kind: "yes" },
      },
    },
  ];

  return (
    <div className="dashboard-door dashboard-door--plans">
      <div className="dashboard-head">
        <div className="dashboard-head-title">
          <h1 className="dashboard-title">{t("upgradeTitle")}</h1>
          <span className="settings-coming-badge">{t("settingsComingSoonBadge")}</span>
        </div>
      </div>

      <section className="plan-matrix-card" aria-label={t("upgradeTitle")}>
        <div className="plan-matrix-scroll">
          <table className="plan-matrix">
            <thead>
              <tr>
                <th scope="col" className="plan-matrix-feature-head">
                  {t("upgradeColFeature")}
                </th>
                {TIERS.map((tier) => {
                  const isCurrent = Boolean(user && current === tier);
                  return (
                    <th
                      key={tier}
                      scope="col"
                      className={"plan-matrix-tier-head" + (isCurrent ? " is-current" : "")}
                    >
                      <span className="plan-matrix-tier-name">{planDisplayName(tier)}</span>
                      {isCurrent ? (
                        <CheckCircle2
                          className="plan-matrix-current-icon size-4"
                          strokeWidth={2}
                          aria-label={t("upgradeCurrent")}
                        />
                      ) : null}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature}>
                  <th scope="row" className="plan-matrix-feature">
                    {row.feature}
                  </th>
                  {TIERS.map((tier) => {
                    const isCurrent = Boolean(user && current === tier);
                    return (
                      <td key={tier} className={"plan-matrix-cell" + (isCurrent ? " is-current" : "")}>
                        <CellView cell={row.cells[tier]} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="plan-matrix-cta">
          <button type="button" className="protocol-modal-btn-primary" disabled>
            {t("upgradePayPending")}
          </button>
        </div>
      </section>
    </div>
  );
}
