import type { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
  className?: string;
};

/** Hover/focus tip for icon-only controls. Keeps aria-label on the child. */
export function IconTip({ label, children, className = "" }: Props) {
  return (
    <span className={"icon-tip" + (className ? " " + className : "")} data-tip={label}>
      {children}
    </span>
  );
}
