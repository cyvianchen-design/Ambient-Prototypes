import React from "react";
import { Chip } from "./Chip";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc" | "none";

export type TableDensity = "M" | "S";

export type TableColumn<T> = {
  key: string;
  header: React.ReactNode;
  render: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string; // e.g. "120px" or "auto"
  align?: "left" | "center" | "right";
  sticky?: boolean; // sticky left column
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string | number;
  sortKey?: string;
  sortDirection?: SortDirection;
  onSort?: (key: string, direction: SortDirection) => void;
  selectedKeys?: Set<string | number>;
  onSelectRow?: (key: string | number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  selectable?: boolean;
  /** Custom footer — use <TableFooter> for the standard paginated footer */
  footer?: React.ReactNode;
  emptyState?: React.ReactNode;
  stickyHeader?: boolean;
  /** Row + header density. M = standard, S = compact. Default M. */
  density?: TableDensity;
  className?: string;
};

// ─── Density config ───────────────────────────────────────────────────────────

// [th-py, td-py]
const DENSITY: Record<TableDensity, [string, string]> = {
  M: ["py-[10px]", "py-[10px]"],
  S: ["py-[6px]",  "py-[7px]"],
};

// ─── Table ────────────────────────────────────────────────────────────────────

export function Table<T>({
  columns,
  rows,
  rowKey,
  sortKey,
  sortDirection = "none",
  onSort,
  selectedKeys,
  onSelectRow,
  onSelectAll,
  selectable = false,
  footer,
  emptyState,
  stickyHeader = false,
  density = "M",
  className = "",
}: TableProps<T>) {
  const allSelected =
    rows.length > 0 &&
    selectedKeys &&
    rows.every((r, i) => selectedKeys.has(rowKey(r, i)));
  const someSelected =
    selectedKeys &&
    !allSelected &&
    rows.some((r, i) => selectedKeys.has(rowKey(r, i)));

  const handleHeaderSort = (col: TableColumn<T>) => {
    if (!col.sortable || !onSort) return;
    const next: SortDirection =
      sortKey !== col.key
        ? "asc"
        : sortDirection === "asc"
        ? "desc"
        : "none";
    onSort(col.key, next);
  };

  const [thPy, tdPy] = DENSITY[density];

  // Header cell — title case, NO uppercase, normal weight with bold for sort labels
  const thBase = [
    "px-[12px]",
    thPy,
    "text-left",
    "text-[12px] font-bold tracking-[0.07px]",
    "text-[var(--foreground-primary,#1a1a1a)]",
    "bg-[var(--surface-1,#f7f7f7)]",
    "border-b border-[var(--surface-3,#eee)]",
    "whitespace-nowrap select-none",
  ].join(" ");

  const tdBase = [
    "px-[12px]",
    tdPy,
    "t-body-sm",
    "text-[var(--foreground-primary,#1a1a1a)]",
    "border-b border-[var(--surface-3,#eee)]",
  ].join(" ");

  return (
    <div
      className={`w-full overflow-x-auto ${className}`}
    >
      <table className="w-full border-collapse">
        <thead className={stickyHeader ? "sticky top-0 z-[10]" : ""}>
          <tr>
            {selectable && (
              <th className={`${thBase} w-[40px] pr-[0]`}>
                <input
                  type="checkbox"
                  checked={!!allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !!someSelected;
                  }}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="w-[14px] h-[14px] accent-[var(--accent,#1132ee)]"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={[
                  thBase,
                  col.sortable && onSort
                    ? "cursor-pointer hover:bg-[var(--surface-2,#f2f2f2)] transition-colors"
                    : "",
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right"
                    ? "text-right"
                    : "",
                  col.sticky ? "sticky left-0 z-[5]" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleHeaderSort(col)}
              >
                <span className="inline-flex items-center gap-[4px]">
                  {col.header}
                  {col.sortable && onSort && (
                    <span
                      className="material-symbols-rounded text-[var(--foreground-secondary,#666)]"
                      style={{
                        fontSize: 14,
                        lineHeight: 1,
                        opacity:
                          sortKey === col.key && sortDirection !== "none"
                            ? 1
                            : 0.35,
                        transform:
                          sortKey === col.key && sortDirection === "asc"
                            ? "rotate(180deg)"
                            : "none",
                        transition: "transform 0.15s, opacity 0.1s",
                      }}
                    >
                      south
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-[16px] py-[40px] text-center t-body-sm text-[var(--foreground-secondary,#666)]"
              >
                {emptyState ?? "No results"}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => {
              const key = rowKey(row, i);
              const isSelected = !!selectedKeys?.has(key);
              return (
                <tr
                  key={key}
                  className={[
                    "group transition-colors",
                    isSelected
                      ? "bg-[var(--litmus-25,#eef0fd)]"
                      : "hover:bg-[var(--surface-1,#f7f7f7)]",
                  ].join(" ")}
                >
                  {selectable && (
                    <td className={`${tdBase} w-[40px] pr-[0]`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          onSelectRow?.(key, e.target.checked)
                        }
                        className="w-[14px] h-[14px] accent-[var(--accent,#1132ee)]"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        tdBase,
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "",
                        col.sticky
                          ? "sticky left-0 bg-white group-hover:bg-[var(--surface-1,#f7f7f7)]"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {col.render(row, i)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
        {footer && (
          <tfoot>
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="border-t border-[var(--surface-3,#eee)]"
              >
                {footer}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

// ─── TableFooter ──────────────────────────────────────────────────────────────

export type TableFooterProps = {
  /** Total number of records (shown on left) */
  totalRecords: number;
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  onRowsPerPageChange?: (n: number) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
};

export function TableFooter({
  totalRecords,
  rowsPerPage = 15,
  rowsPerPageOptions = [10, 15, 25, 50],
  onRowsPerPageChange,
  page = 1,
  totalPages = 1,
  onPageChange,
  className = "",
}: TableFooterProps) {
  return (
    <div
      className={[
        "flex items-center justify-between",
        "px-[12px] py-[10px]",
        "bg-[var(--surface-2,#f2f2f2)]",
        "t-body-xs leading-[1.3]",
        "text-[var(--foreground-secondary,#666)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Left: record count + rows-per-page */}
      <div className="flex items-center gap-[8px]">
        <span>
          {totalRecords.toLocaleString()} record{totalRecords !== 1 ? "s" : ""}
        </span>
        <span>·</span>
        <label className="flex items-center gap-[2px] cursor-pointer">
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
            className="bg-transparent outline-none cursor-pointer t-body-xs text-[var(--foreground-secondary,#666)] appearance-none"
          >
            {rowsPerPageOptions.map((n) => (
              <option key={n} value={n}>
                {n}/Page
              </option>
            ))}
          </select>
          <span
            className="material-symbols-rounded text-[var(--foreground-secondary,#666)]"
            style={{ fontSize: 14, lineHeight: 1 }}
          >
            unfold_more
          </span>
        </label>
      </div>

      {/* Right: page navigation */}
      <div className="flex items-center gap-[4px]">
        <button
          onClick={() => onPageChange?.(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="flex items-center justify-center w-[24px] h-[24px] rounded-[4px] hover:bg-[var(--surface-2,#f2f2f2)] disabled:opacity-30 transition-colors"
          aria-label="Previous page"
        >
          <span
            className="material-symbols-rounded"
            style={{ fontSize: 16, lineHeight: 1 }}
          >
            chevron_left
          </span>
        </button>
        <span className="min-w-[72px] text-center tabular-nums">
          Page {page}/{totalPages}
        </span>
        <button
          onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="flex items-center justify-center w-[24px] h-[24px] rounded-[4px] hover:bg-[var(--surface-2,#f2f2f2)] disabled:opacity-30 transition-colors"
          aria-label="Next page"
        >
          <span
            className="material-symbols-rounded"
            style={{ fontSize: 16, lineHeight: 1 }}
          >
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── TableCell — Person layout (Avatar + name + detail) ───────────────────────

export type TableCellProps = {
  /** Primary text — name, main value */
  primary: React.ReactNode;
  /** Secondary text — detail, subtitle, email */
  secondary?: React.ReactNode;
  /** Left slot — Avatar, icon, etc. */
  leading?: React.ReactNode;
};

export function TableCell({ primary, secondary, leading }: TableCellProps) {
  return (
    <div className="flex items-center gap-[8px]">
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="min-w-0">
        <p className="t-title-sm leading-[1.3] text-[var(--foreground-primary,#1a1a1a)] truncate">
          {primary}
        </p>
        {secondary && (
          <p className="t-body-xs leading-[1.3] text-[var(--foreground-secondary,#666)] truncate mt-[1px]">
            {secondary}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── BadgesCell — row of chips ────────────────────────────────────────────────

export type BadgesCellProps = {
  labels: string[];
  max?: number; // truncate after N chips and show "+M more"
};

export function BadgesCell({ labels, max }: BadgesCellProps) {
  const shown = max ? labels.slice(0, max) : labels;
  const extra = max ? labels.length - max : 0;
  return (
    <div className="flex flex-wrap items-center gap-[4px]">
      {shown.map((label) => (
        <Chip key={label} label={label} color="neutral" size="XS" />
      ))}
      {extra > 0 && (
        <span className="text-[11px] text-[var(--foreground-secondary,#666)]">
          +{extra}
        </span>
      )}
    </div>
  );
}

// ─── StatusCell — colored dot + label ────────────────────────────────────────

export type StatusCellColor = "success" | "warning" | "danger" | "neutral" | "info";

export type StatusCellProps = {
  label: string;
  color?: StatusCellColor;
};

const STATUS_COLORS: Record<StatusCellColor, [string, string]> = {
  success: ["bg-[var(--green-500,#479e4c)]",  "text-[var(--green-600,#3f8d43)]"],
  warning: ["bg-[var(--orange-400,#e08c2e)]", "text-[var(--orange-500,#c47820)]"],
  danger:  ["bg-[var(--foreground-semantic-danger,#bb1411)]", "text-[var(--foreground-semantic-danger,#bb1411)]"],
  info:    ["bg-[var(--accent,#1132ee)]",     "text-[var(--accent,#1132ee)]"],
  neutral: ["bg-[var(--foreground-secondary,#666)]", "text-[var(--foreground-secondary,#666)]"],
};

export function StatusCell({ label, color = "neutral" }: StatusCellProps) {
  const [dotCls, textCls] = STATUS_COLORS[color];
  return (
    <div className="flex items-center gap-[6px]">
      <div className={`w-[6px] h-[6px] rounded-full shrink-0 ${dotCls}`} />
      <span className={`t-body-sm leading-[1.3] ${textCls}`}>
        {label}
      </span>
    </div>
  );
}
