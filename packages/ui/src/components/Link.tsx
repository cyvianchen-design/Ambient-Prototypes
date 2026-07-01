import React from "react";

// ─── Size config ─────────────────────────────────────────────────────────────

const sizeConfig = {
  large:  { text: "t-body-lg",  iconSize: 20, gap: "gap-[4px]" },
  medium: { text: "t-body-md",  iconSize: 18, gap: "gap-[4px]" },
  small:  { text: "t-body-sm",  iconSize: 16, gap: "gap-[4px]" },
  xsmall: { text: "t-body-xs",  iconSize: 14, gap: "gap-[2px]" },
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type LinkProps = {
  /** Link text or node */
  children: React.ReactNode;
  href?: string;
  size?: keyof typeof sizeConfig;
  /** "default" = accent blue (primary); "neutral" = secondary foreground */
  intent?: "default" | "neutral";
  /** Left slot — icon, avatar, etc. */
  prefix?: React.ReactNode;
  /** Right slot — defaults to external-link icon when href is external */
  suffix?: React.ReactNode;
  /** Show the external link (open_in_new) icon on the right. Default false. */
  external?: boolean;
  disabled?: boolean;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function Link({
  children,
  href = "#",
  size = "medium",
  intent = "default",
  prefix,
  suffix,
  external = false,
  disabled = false,
  target,
  rel,
  onClick,
  className = "",
}: LinkProps) {
  const { text, iconSize, gap } = sizeConfig[size];

  const colorCls =
    intent === "default"
      ? disabled
        ? "text-[var(--accent,#1132ee)] opacity-30"
        : "text-[var(--accent,#1132ee)] hover:text-[var(--litmus-600,#0d28c7)]"
      : disabled
      ? "text-[var(--foreground-secondary,#666)] opacity-30"
      : "text-[var(--foreground-secondary,#666)] hover:text-[var(--foreground-primary,#1a1a1a)]";

  const trailingIcon =
    suffix ??
    (external ? (
      <span
        className="material-symbols-rounded shrink-0"
        style={{ fontSize: iconSize, lineHeight: 1 }}
      >
        open_in_new
      </span>
    ) : null);

  return (
    <a
      href={disabled ? undefined : href}
      target={target}
      rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled || undefined}
      className={[
        "inline-flex flex-wrap items-center",
        gap,
        text,
        colorCls,
        "cursor-pointer transition-colors outline-none",
        "focus-visible:bg-[var(--litmus-25,#f1f3fe)] focus-visible:rounded-[4px] focus-visible:px-[2px] focus-visible:outline-none",
        disabled ? "cursor-not-allowed pointer-events-none" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {prefix && (
        <span className="flex items-center shrink-0">{prefix}</span>
      )}
      <span>{children}</span>
      {trailingIcon && (
        <span className="flex items-center shrink-0 no-underline">{trailingIcon}</span>
      )}
    </a>
  );
}
