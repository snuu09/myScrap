import type { ReactNode } from "react";

const MARK = /==([^=][\s\S]*?)==/g;

/** Strip ==highlight== markers for plain-text uses (search, compare base). */
export function stripAiMarks(text: string): string {
  return text.replace(MARK, "$1");
}

/** Render AI summary/analysis, turning ==phrase== into highlighter marks. */
export function renderAiHighlight(text: string): ReactNode {
  if (!text) return null;
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(MARK.source, "g");
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(
      <mark key={`m-${match.index}`} className="ai-highlight">
        {match[1]}
      </mark>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  if (nodes.length === 1 && typeof nodes[0] === "string") return nodes[0];
  return nodes.length ? <>{nodes}</> : text;
}
