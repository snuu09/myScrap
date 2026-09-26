import type { Scrap } from "./types";

function line(label: string, value: string) {
  return value ? `- ${label}: ${value}` : "";
}

/** One Markdown document, newest first, for a Markdown export of a user's scraps. */
export function scrapsToMarkdown(scraps: Scrap[], appName: string) {
  const ordered = [...scraps].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const out: string[] = [`# ${appName} export`, "", `${ordered.length} scraps · ${new Date().toISOString()}`, ""];
  for (const item of ordered) {
    const heading = item.title || item.filename || item.url || "Untitled";
    out.push(`## ${heading}`, "");
    for (const row of [
      line("Type", item.type),
      line("Created", item.createdAt ? new Date(item.createdAt).toISOString() : ""),
      line("Tags", item.tags.join(", ")),
      line("URL", item.url),
      line("File", item.filename),
    ]) {
      if (row) out.push(row);
    }
    out.push("");
    if (item.text) out.push(item.text.trim(), "");
    if (item.memo) out.push(`> ${item.memo.trim().replace(/\n+/g, "\n> ")}`, "");
    out.push("---", "");
  }
  return out.join("\n");
}
