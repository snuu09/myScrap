import { Sparkles } from "lucide-react";

/** Sparkles with a left-to-right shimmer. Stays still when motion is reduced. */
export function AiProgress() {
  return (
    <span className="ai-progress" aria-hidden>
      <Sparkles className="ai-progress-icon" size={32} strokeWidth={1.6} />
    </span>
  );
}
