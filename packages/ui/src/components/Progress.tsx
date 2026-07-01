import React from "react";

// ─── Progress Bar — thin multi-segment stepper ────────────────────────────────
//
// Matches Figma "Progress Bar" component set.
// Renders N equal-width thin (3px) segments; segments 1..current are accent
// blue, remaining segments are surface-3 gray.
//
// For a large-count page navigation use TableFooter instead.

export type ProgressBarProps = {
  /** Total number of steps */
  steps: number;
  /** Active step, 1-indexed. Segments 1..current are filled blue. */
  current: number;
  className?: string;
};

export function ProgressBar({ steps, current, className = "" }: ProgressBarProps) {
  return (
    <div
      className={`flex items-center gap-[3px] w-full ${className}`}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={steps}
    >
      {Array.from({ length: steps }, (_, i) => {
        const n = i + 1;
        const filled = n <= current;
        return (
          <div
            key={n}
            className={[
              "flex-1 h-[3px] rounded-full transition-colors duration-300",
              filled
                ? "bg-[var(--accent,#1132ee)]"
                : "bg-[var(--surface-3,#e0e0e0)]",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}

// ─── Page Indicator — carousel dot indicator ──────────────────────────────────
//
// Matches Figma "Page Indicator" component set.
// Renders N dots; the current dot is 8 px and dark, others are 6 px and gray.
// For large page counts (table pagination) use TableFooter instead.

export type PageIndicatorProps = {
  /** Total number of pages */
  pages: number;
  /** Active page, 1-indexed */
  current: number;
  onChange?: (page: number) => void;
  className?: string;
};

export function PageIndicator({
  pages,
  current,
  onChange,
  className = "",
}: PageIndicatorProps) {
  return (
    <div
      className={`flex items-center gap-[6px] ${className}`}
      role="tablist"
      aria-label="Page indicator"
    >
      {Array.from({ length: pages }, (_, i) => {
        const n = i + 1;
        const dist = Math.abs(n - current);
        // Gradual size: 8px current, 6px adjacent, 5px far
        const sz = dist === 0 ? 8 : dist === 1 ? 6 : 5;
        const active = dist === 0;
        return (
          <button
            key={n}
            role="tab"
            aria-selected={active}
            aria-label={`Page ${n}`}
            onClick={() => onChange?.(n)}
            style={{ width: sz, height: sz }}
            className={[
              "rounded-full border-0 p-0 transition-all duration-200 shrink-0",
              "outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent,#1132ee)] focus-visible:ring-offset-1",
              onChange ? "cursor-pointer" : "cursor-default",
              active
                ? "bg-[var(--foreground-primary,#1a1a1a)]"
                : "bg-[var(--surface-3,#d4d4d4)] hover:bg-[var(--foreground-secondary,#999)]",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}

// ─── Pagination — numbered page navigation ────────────────────────────────────
//
// Kept for backward compatibility. For new work:
//   - Small page counts → use <PageIndicator> (dots)
//   - Table pagination  → use <TableFooter>

export type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** How many page buttons to show around current page */
  siblings?: number;
  className?: string;
};

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function Pagination({ page, totalPages, onChange, siblings = 1, className = "" }: PaginationProps) {
  const btnBase =
    "flex items-center justify-center w-[32px] h-[32px] rounded-[6px] t-title-sm leading-none transition-colors select-none";
  const btnActive = "bg-[var(--accent,#1132ee)] text-white";
  const btnIdle =
    "text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)] cursor-pointer";
  const btnDisabled = "text-[var(--foreground-secondary,#666)] opacity-40 cursor-default";

  const pages: (number | "…")[] = (() => {
    if (totalPages <= 7) return range(1, totalPages);
    const left = Math.max(2, page - siblings);
    const right = Math.min(totalPages - 1, page + siblings);
    const result: (number | "…")[] = [1];
    if (left > 2) result.push("…");
    result.push(...range(left, right));
    if (right < totalPages - 1) result.push("…");
    result.push(totalPages);
    return result;
  })();

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center gap-[4px] ${className}`}
    >
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={`${btnBase} ${page === 1 ? btnDisabled : btnIdle}`}
      >
        <span className="material-symbols-rounded" style={{ fontSize: 18, lineHeight: 1 }}>chevron_left</span>
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="flex items-center justify-center w-[32px] h-[32px] t-body-sm text-[var(--foreground-secondary,#666)]">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${btnBase} ${p === page ? btnActive : btnIdle}`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={`${btnBase} ${page === totalPages ? btnDisabled : btnIdle}`}
      >
        <span className="material-symbols-rounded" style={{ fontSize: 18, lineHeight: 1 }}>chevron_right</span>
      </button>
    </nav>
  );
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

export type StepIndicatorProps = {
  steps: number;
  current: number; // 1-indexed
  className?: string;
};

export function StepIndicator({ steps, current, className = "" }: StepIndicatorProps) {
  return (
    <div className={`flex items-center gap-[6px] ${className}`}>
      {Array.from({ length: steps }, (_, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div
            key={n}
            className={[
              "h-[4px] rounded-full transition-all duration-300",
              active ? "w-[24px] bg-[var(--accent,#1132ee)]" : "w-[8px]",
              done ? "bg-[var(--accent,#1132ee)] opacity-40" : !active ? "bg-[var(--surface-3,#eee)]" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        );
      })}
    </div>
  );
}
