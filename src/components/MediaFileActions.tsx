import { useState } from "react";
import { Check, Download, ExternalLink, FolderOpen, LoaderCircle } from "lucide-react";
import { GlassCluster } from "./GlassCluster";
import { IconTip } from "./IconTip";
import { useT } from "../lib/useT";
import { isPdf } from "../lib/tagger";
import {
  canPickDirectory,
  fetchBlobWithProgress,
  openBlobInNewTab,
  reopenDirectory,
  saveBlobToPickedFolder,
  saveBlobWithPicker,
  triggerAnchorDownload,
} from "../lib/fileDownload";

type Props = {
  src: string;
  filename: string;
  mime?: string;
};

type Phase = "idle" | "busy" | "done";

export function MediaFileActions({ src, filename, mime = "" }: Props) {
  const t = useT();
  const pdf = isPdf(mime, filename);
  const [phase, setPhase] = useState<Phase>("idle");
  const [ratio, setRatio] = useState(0);
  const [folder, setFolder] = useState<FileSystemDirectoryHandle | null>(null);
  const [error, setError] = useState("");

  async function runDownload() {
    if (!src || phase === "busy") return;
    setError("");
    setPhase("busy");
    setRatio(0);
    try {
      const blob = await fetchBlobWithProgress(src, setRatio);
      if (!pdf && canPickDirectory()) {
        try {
          const dir = await saveBlobToPickedFolder(blob, filename || "download", folder || undefined);
          if (dir) {
            setFolder(dir);
            setPhase("done");
            return;
          }
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") {
            setPhase("idle");
            return;
          }
          /* fall through */
        }
      }
      if (!pdf) {
        try {
          if (await saveBlobWithPicker(blob, filename || "download")) {
            setPhase("done");
            return;
          }
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") {
            setPhase("idle");
            return;
          }
        }
      }
      triggerAnchorDownload(blob, filename || "download");
      setPhase("done");
    } catch {
      setError(t("downloadFailed"));
      setPhase("idle");
    }
  }

  async function openPdf() {
    if (!src || phase === "busy") return;
    setError("");
    setPhase("busy");
    setRatio(0);
    try {
      const blob = await fetchBlobWithProgress(src, setRatio);
      openBlobInNewTab(blob, "application/pdf");
      setPhase("idle");
      setRatio(0);
    } catch (err) {
      setError(err instanceof Error && err.message === "popup" ? t("popupBlocked") : t("downloadFailed"));
      setPhase("idle");
    }
  }

  async function openFolder() {
    if (!folder) return;
    try {
      await reopenDirectory(folder);
    } catch {
      setError(t("downloadFailed"));
    }
  }

  const busy = phase === "busy";
  const pct = Math.round(ratio * 100);
  const downloadLabel =
    busy ? t("downloadingPct", { n: pct }) : phase === "done" ? t("downloadDone") : t("downloadFile");

  return (
    <div className="media-file-actions">
      <GlassCluster className="liquid-hit">
        {pdf ? (
          <IconTip label={t("openInNewWindow")}>
            <button
              type="button"
              className={"inline-action" + (busy ? " is-progress" : "")}
              aria-label={t("openInNewWindow")}
              disabled={busy}
              onClick={() => void openPdf()}
            >
              {busy ? <LoaderCircle className="size-4 animate-spin" strokeWidth={1.8} /> : <ExternalLink className="size-4" strokeWidth={1.8} />}
            </button>
          </IconTip>
        ) : null}
        <IconTip label={downloadLabel}>
          <button
            type="button"
            className={
              "inline-action" +
              (busy ? " is-progress" : "") +
              (phase === "done" && !busy ? " is-done" : "")
            }
            aria-label={downloadLabel}
            aria-busy={busy}
            disabled={busy}
            onClick={() => void runDownload()}
          >
            {busy ? (
              <span className="inline-action-progress" aria-hidden>
                <LoaderCircle className="size-4 animate-spin" strokeWidth={1.8} />
                <span className="inline-action-pct">{pct}</span>
              </span>
            ) : phase === "done" ? (
              <Check className="size-4" strokeWidth={1.8} />
            ) : (
              <Download className="size-4" strokeWidth={1.8} />
            )}
          </button>
        </IconTip>
        {!pdf && phase === "done" && folder ? (
          <IconTip label={t("openDownloadFolder")}>
            <button
              type="button"
              className="inline-action"
              aria-label={t("openDownloadFolder")}
              onClick={() => void openFolder()}
            >
              <FolderOpen className="size-4" strokeWidth={1.8} />
            </button>
          </IconTip>
        ) : null}
      </GlassCluster>
      {error ? <p className="media-file-actions-error">{error}</p> : null}
    </div>
  );
}
