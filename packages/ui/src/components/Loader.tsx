import React from "react";

// ─── Loader ───────────────────────────────────────────────────────────────────

export type LoaderSize = "XS" | "S" | "M" | "L";

const loaderSizes: Record<LoaderSize, { px: number; borderWidth: number }> = {
  XS: { px: 14, borderWidth: 2 },
  S:  { px: 20, borderWidth: 2 },
  M:  { px: 28, borderWidth: 3 },
  L:  { px: 40, borderWidth: 3 },
};

export type LoaderProps = {
  size?: LoaderSize;
  /** Color variant. Default "accent". */
  color?: "accent" | "white" | "neutral";
  label?: string;
  className?: string;
};

const colorMap = {
  accent:  { track: "border-[var(--litmus-100,#cfd6fc)]", spin: "border-t-[var(--accent,#1132ee)]" },
  white:   { track: "border-white/30",                    spin: "border-t-white" },
  neutral: { track: "border-[var(--surface-3,#eee)]",     spin: "border-t-[var(--foreground-secondary,#666)]" },
};

export function Loader({ size = "M", color = "accent", label, className = "" }: LoaderProps) {
  const { px, borderWidth } = loaderSizes[size];
  const { track, spin } = colorMap[color];

  return (
    <div className={`inline-flex flex-col items-center gap-[8px] ${className}`}>
      <div
        className={`rounded-full border animate-spin ${track} ${spin}`}
        style={{ width: px, height: px, borderWidth }}
        role="status"
        aria-label={label ?? "Loading"}
      />
      {label && (
        <span className="t-body-xs text-[var(--foreground-secondary,#666)]">{label}</span>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  rounded?: boolean;
  className?: string;
};

export function Skeleton({ width, height = 16, rounded = false, className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--surface-2,#f2f2f2)] ${rounded ? "rounded-full" : "rounded-[4px]"} ${className}`}
      style={{ width, height }}
      aria-hidden
    />
  );
}
