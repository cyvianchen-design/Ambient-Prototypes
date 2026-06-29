import React from "react";

const variantStyles = {
  success: "text-[var(--foreground-semantic-success,#479e4c)]",
  info:    "text-[var(--foreground-semantic-info,#1132ee)]",
  warning: "text-[var(--foreground-semantic-warning,#cc7a00)]",
  error:   "text-[var(--foreground-semantic-danger,#bb1411)]",
  default: "text-[var(--foreground-secondary,#666)]",
};

const filledBg = {
  success: "bg-[var(--green-50,#edf7ee)]",
  info:    "bg-[var(--accent-10,#1132ee1a)]",
  warning: "bg-[var(--orange-50,#fff3e0)]",
  error:   "bg-[var(--red-50,#fdecea)]",
  default: "bg-[var(--black-5,#0000000d)]",
};

export type BadgeProps = {
  label: string;
  variant?: keyof typeof variantStyles;
  icon?: React.ReactNode;
  size?: "small" | "medium";
  filled?: boolean;
  className?: string;
};

export function Badge({
  label,
  variant = "default",
  icon,
  size = "small",
  filled = false,
  className = "",
}: BadgeProps) {
  return (
    <div
      className={`self-start inline-flex items-center gap-[4px]
        ${size === "small" ? "t-title-xs" : "t-title-sm"}
        ${filled ? `${filledBg[variant]} px-[6px] py-[2px] rounded-[4px]` : ""}
        ${variantStyles[variant]} ${className}`}
      style={{ fontFeatureSettings: "'ss07'" }}
    >
      {icon && <span className="flex items-center shrink-0">{icon}</span>}
      <span>{label}</span>
    </div>
  );
}

const visitStatusConfig = {
  Generated:  { variant: "success" as const, icon: "check" },
  Uploading:  { variant: "default" as const, icon: "upload" },
  Processing: { variant: "info" as const,    icon: "autorenew" },
  Error:      { variant: "error" as const,   icon: "error" },
  "In Queue": { variant: "warning" as const, icon: "more_horiz" },
};

export type VisitStatusValue = keyof typeof visitStatusConfig;

export type VisitStatusProps = {
  status: VisitStatusValue;
  className?: string;
};

export function VisitStatus({ status, className = "" }: VisitStatusProps) {
  const { variant, icon } = visitStatusConfig[status];
  return (
    <Badge
      label={status}
      variant={variant}
      icon={
        <span
          className="material-symbols-rounded"
          style={{ fontSize: 14, fontVariationSettings: "'FILL' 1", lineHeight: 1 }}
        >
          {icon}
        </span>
      }
      className={className}
    />
  );
}
