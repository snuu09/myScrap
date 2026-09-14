import type { LucideIcon } from "lucide-react";
import {
  CircleHelp,
  File,
  FileSpreadsheet,
  FileText,
  Film,
  ImageIcon,
  Link2,
  Music,
  Presentation,
  StickyNote,
} from "lucide-react";
import { extOf, mediaKindOf } from "../lib/tagger";

type MarkStyle = { Icon: LucideIcon; bg: string; fg: string };

const IMAGE_EXT = ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif", "avif", "svg", "bmp"];
const VIDEO_EXT = ["mp4", "mov", "webm", "m4v", "mkv", "ogv"];
const AUDIO_EXT = ["mp3", "wav", "m4a", "aac", "ogg", "flac"];

function markForMedia(type: string | undefined, mime: string, ext: string): MarkStyle | null {
  const kind = mediaKindOf(type || "", mime);
  if (kind === "image" || IMAGE_EXT.includes(ext)) {
    return { Icon: ImageIcon, bg: "#3d6b8a", fg: "#f2f8fc" };
  }
  if (kind === "video" || VIDEO_EXT.includes(ext)) {
    return { Icon: Film, bg: "#6b4a8a", fg: "#f8f3fc" };
  }
  if (kind === "audio" || AUDIO_EXT.includes(ext)) {
    return { Icon: Music, bg: "#4a7a62", fg: "#f2faf6" };
  }
  return null;
}

function markForType(type: string | undefined): MarkStyle | null {
  if (type === "text") return { Icon: StickyNote, bg: "#8a6a3d", fg: "#faf6ef" };
  if (type === "link") return { Icon: Link2, bg: "#3d5c8a", fg: "#f2f6fc" };
  if (type === "unknown") return { Icon: CircleHelp, bg: "#6e665c", fg: "#f7f3ee" };
  return null;
}

function markForExt(extension: string, mime = ""): MarkStyle {
  const ext = String(extension || "")
    .toLowerCase()
    .replace(/^\./, "");
  const m = String(mime || "").toLowerCase();
  if (ext === "pdf" || m === "application/pdf") {
    return { Icon: FileText, bg: "#c45c4a", fg: "#fff8f5" };
  }
  if (["doc", "docx"].includes(ext) || m.includes("msword") || m.includes("wordprocessingml")) {
    return { Icon: FileText, bg: "#2b579a", fg: "#f4f8ff" };
  }
  if (["xls", "xlsx"].includes(ext) || m.includes("spreadsheet") || m.includes("ms-excel")) {
    return { Icon: FileSpreadsheet, bg: "#217346", fg: "#f2faf5" };
  }
  if (["ppt", "pptx"].includes(ext) || m.includes("presentation") || m.includes("ms-powerpoint")) {
    return { Icon: Presentation, bg: "#c43e1c", fg: "#fff6f2" };
  }
  if (["hwp", "hwpx"].includes(ext) || m.includes("haansoft")) {
    return { Icon: File, bg: "#5a6570", fg: "#f5f6f7" };
  }
  if (["txt", "md", "rtf", "csv"].includes(ext) || m.startsWith("text/")) {
    return { Icon: FileText, bg: "#6e665c", fg: "#f7f3ee" };
  }
  return { Icon: File, bg: "#8a7a68", fg: "#faf6ef" };
}

type Props = {
  extension?: string;
  mime?: string;
  type?: string;
  filename?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const ICON_PX = { sm: 14, md: 16, lg: 22 } as const;

/** Colored cover mark with Lucide icons (no letter labels). */
export function DocumentMark({
  extension = "",
  mime = "",
  type,
  filename = "",
  className = "",
  size = "md",
}: Props) {
  const ext = String(extension || extOf(filename) || "")
    .toLowerCase()
    .replace(/^\./, "");
  const media = markForMedia(type, mime, ext);
  let mark: MarkStyle | null = media || markForType(type);
  if (!mark && (type === "document" || ext || mime)) mark = markForExt(ext, mime);
  if (!mark && type) mark = { Icon: StickyNote, bg: "#8a6a3d", fg: "#faf6ef" };
  if (!mark) return null;

  const { Icon } = mark;
  const sizeClass = size === "sm" ? "doc-mark--sm" : size === "lg" ? "doc-mark--lg" : "doc-mark--md";
  return (
    <span
      className={"doc-mark " + sizeClass + (className ? " " + className : "")}
      style={{ background: mark.bg, color: mark.fg }}
      aria-hidden
    >
      <Icon className="doc-mark-icon" size={ICON_PX[size]} strokeWidth={1.8} />
    </span>
  );
}
