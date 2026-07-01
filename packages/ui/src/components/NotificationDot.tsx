import React from "react";

export type NotificationDotProps = {
  /** Count to display. 0 shows a plain dot. Values > 9 show "9+". */
  count?: number;
  /** Color variant. Default "error" (red). */
  variant?: "error" | "accent";
  className?: string;
};

export function NotificationDot({ count, variant = "error", className = "" }: NotificationDotProps) {
  const hasCount = count !== undefined && count > 0;
  const label = count === undefined ? "" : count > 9 ? "9+" : String(count);

  const bg = variant === "error"
    ? "bg-[var(--foreground-semantic-danger,#bb1411)]"
    : "bg-[var(--accent,#1132ee)]";

  if (!hasCount) {
    // Plain dot — no count
    return (
      <span
        className={`inline-block w-[8px] h-[8px] rounded-full ${bg} ${className}`}
        aria-label="Notification"
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${bg} text-white font-bold leading-none ${className}`}
      style={{
        minWidth: label.length > 1 ? 18 : 16,
        height: 16,
        fontSize: 10,
        padding: label.length > 1 ? "0 4px" : 0,
      }}
      aria-label={`${count} notifications`}
    >
      {label}
    </span>
  );
}
