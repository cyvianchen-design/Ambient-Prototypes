import React from "react";

export type DividerProps = {
  /** "horizontal" (default) or "vertical" */
  orientation?: "horizontal" | "vertical";
  /** Optional label centered on the divider */
  label?: string;
  className?: string;
};

export function Divider({
  orientation = "horizontal",
  label,
  className = "",
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        className={`w-[1px] self-stretch bg-[var(--surface-3,#eee)] shrink-0 ${className}`}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (label) {
    return (
      <div
        className={`flex items-center gap-[8px] ${className}`}
        role="separator"
      >
        <div className="flex-1 h-[1px] bg-[var(--surface-3,#eee)]" />
        <span className="text-[11px] font-bold tracking-[0.22px] text-[var(--foreground-secondary,#666)] shrink-0">
          {label}
        </span>
        <div className="flex-1 h-[1px] bg-[var(--surface-3,#eee)]" />
      </div>
    );
  }

  return (
    <div
      className={`h-[1px] w-full bg-[var(--surface-3,#eee)] ${className}`}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}
