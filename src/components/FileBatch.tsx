import { useEffect, useMemo } from "react";
import { Sparkles, X } from "lucide-react";
import { useT } from "../lib/useT";
import { formatBytes } from "../lib/tagger";
import { uploadIssue, type UploadIssue } from "../lib/uploadCheck";

export type BatchItem = {
  id: string;
  file: File;
  analyze: boolean;
};

type Props = {
  items: BatchItem[];
  guest: boolean;
  canUpload: (addingBytes: number) => { ok: boolean; reason?: "trialExpired" | "quotaExceeded" };
  onToggleAnalyze: (id: string) => void;
  onRemove: (id: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  saving?: boolean;
};

function issueText(t: (key: string) => string, issue: UploadIssue, guest: boolean) {
  if (issue === "empty") return t("fileEmpty");
  if (issue === "tooLarge") return t("fileTooLarge");
  if (issue === "guestFile") return t("fileGuestLimit");
  if (issue === "trial") return t("trialExpiredMsg");
  return t(guest ? "guestQuotaMsg" : "quotaExceededMsg");
}

function BatchThumb({ file }: { file: File }) {
  const url = useMemo(() => (file.type.startsWith("image/") ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);
  if (!url) return <span className="file-batch-thumb file-batch-thumb--empty" aria-hidden />;
  return <img src={url} alt="" className="file-batch-thumb" />;
}

export function FileBatch({
  items,
  guest,
  canUpload,
  onToggleAnalyze,
  onRemove,
  onConfirm,
  onCancel,
  saving = false,
}: Props) {
  const t = useT();
  let reserved = 0;
  const rows = items.map((item) => {
    const issue = uploadIssue(item.file, { guest, reservedBytes: reserved, canUpload });
    if (!issue) reserved += item.file.size;
    return { item, issue };
  });
  const ready = rows.some((row) => !row.issue);

  return (
    <div className="file-batch">
      <div className="list-tools-head">
        <p className="list-tools-label">{t("batchTitle")}</p>
        <button type="button" className="auth-link-utility" onClick={onCancel} disabled={saving}>
          {t("cancel")}
        </button>
      </div>
      <ul className="file-batch-list">
        {rows.map(({ item, issue }) => (
          <li key={item.id} className={"file-batch-row" + (issue ? " file-batch-row--bad" : "")}>
            <BatchThumb file={item.file} />
            <label className="file-batch-analyze" aria-label={t("batchAnalyze")}>
              <span className={"file-batch-check" + (!issue && item.analyze ? " is-on" : "")}>
                <input
                  type="checkbox"
                  checked={!issue && item.analyze}
                  disabled={Boolean(issue) || saving}
                  onChange={() => onToggleAnalyze(item.id)}
                />
              </span>
              <Sparkles className="size-3.5 shrink-0" strokeWidth={1.8} aria-hidden />
              <span>{t("batchAnalyze")}</span>
            </label>
            <div className="file-batch-meta min-w-0 flex-1">
              <p className="file-batch-name">{item.file.name || t("file")}</p>
              <p className="file-batch-size">
                {formatBytes(item.file.size)}
                {issue ? ` · ${issueText(t, issue, guest)}` : ""}
              </p>
            </div>
            <button
              type="button"
              className="file-batch-remove"
              aria-label={t("batchRemove")}
              disabled={saving}
              onClick={() => onRemove(item.id)}
            >
              <X className="size-4" strokeWidth={1.8} />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={"auth-btn-primary px-4" + (saving ? " is-progress" : "")}
        disabled={!ready || saving}
        onClick={onConfirm}
      >
        {t("batchUpload")}
      </button>
    </div>
  );
}
