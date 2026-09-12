import type { ScrapType } from "../lib/types";

type MarkStyle = { letter: string; bg: string; fg: string };

function markForExt(extension: string, mime = ""): MarkStyle {
  const ext = String(extension || "")
    .toLowerCase()
    .replace(/^\./, "");
  const m = String(mime || "").toLowerCase();
  if (ext === "pdf" || m === "application/pdf") return { letter: "PDF", bg: "#c45c4a", fg: "#fff8f5" };
  if (["doc", "docx"].includes(ext) || m.includes("msword") || m.includes("wordprocessingml")) {
    return { letter: "W", bg: "#2b579a", fg: "#f4f8ff" };
  }
  if (["xls", "xlsx"].includes(ext) || m.includes("spreadsheet") || m.includes("ms-excel")) {
    return { letter: "X", bg: "#217346", fg: "#f2faf5" };
  }
  if (["ppt", "pptx"].includes(ext) || m.includes("presentation") || m.includes("ms-powerpoint")) {
    return { letter: "P", bg: "#c43e1c", fg: "#fff6f2" };
  }
  if (["hwp", "hwpx"].includes(ext) || m.includes("haansoft")) {
    return { letter: "H", bg: "#5a6570", fg: "#f5f6f7" };
  }
  if (["txt", "md", "rtf", "csv"].includes(ext) || m.startsWith("text/")) {
    return { letter: "T", bg: "#6e665c", fg: "#f7f3ee" };
  }
  return { letter: "DOC", bg: "#8a7a68", fg: "#faf6ef" };
}

type Props = {
  extension?: string;
  mime?: string;
  type?: ScrapType;
  className?: string;
  size?: "sm" | "md" | "lg";
};

/** Extension-colored cover mark (no trademark logos). */
export function DocumentMark({ extension = "", mime = "", type, className = "", size = "md" }: Props) {
  if (type && type !== "document" && !extension && !mime) return null;
  const { letter, bg, fg } = markForExt(extension, mime);
  const sizeClass = size === "sm" ? "doc-mark--sm" : size === "lg" ? "doc-mark--lg" : "doc-mark--md";
  return (
    <span
      className={"doc-mark " + sizeClass + (className ? " " + className : "")}
      style={{ background: bg, color: fg }}
      aria-hidden
    >
      {letter}
    </span>
  );
}
