import type { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
  className?: string;
  placement?: "above" | "below";
};

/** Hover/focus tip for icon-only controls. Keeps aria-label on the child. */
export function IconTip({ label, children, className = "", placement = "above" }: Props) {
  const placeClass = placement === "below" ? " icon-tip--below" : "";
  return (
    <span className={"icon-tip" + placeClass + (className ? " " + className : "")} data-tip={label}>
      {children}
    </span>
  );
}
