import React from "react";

export type ListItemProps = {
  title: string;
  description?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  disclosure?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

export function ListItem({
  title,
  description,
  leading,
  trailing,
  disclosure = false,
  selected = false,
  disabled = false,
  onClick,
  className = "",
}: ListItemProps) {
  const interactive = !!onClick && !disabled;
  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? (e) => (e.key === "Enter" || e.key === " ") && onClick?.() : undefined}
      aria-disabled={disabled || undefined}
      className={[
        "flex items-center gap-[12px] px-[16px] py-[12px] min-h-[52px]",
        selected ? "bg-[var(--litmus-25,#eef0fd)]" : "bg-white",
        interactive ? "cursor-pointer hover:bg-[var(--surface-1,#f7f7f7)] transition-colors" : "",
        disabled ? "opacity-40 pointer-events-none" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {leading && (
        <div className="flex items-center justify-center shrink-0 text-[var(--foreground-secondary,#666)]">
          {leading}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p
          className={`t-title-sm truncate ${
            selected ? "text-[var(--accent,#1132ee)]" : "text-[var(--foreground-primary,#1a1a1a)]"
          }`}
        >
          {title}
        </p>
        {description && (
          <p className="t-body-xs text-[var(--foreground-secondary,#666)] truncate mt-[1px]">
            {description}
          </p>
        )}
      </div>
      {trailing && (
        <div className="shrink-0 flex items-center text-[var(--foreground-secondary,#666)]">
          {trailing}
        </div>
      )}
      {disclosure && (
        <span
          className="material-symbols-rounded shrink-0 text-[var(--foreground-secondary,#666)]"
          style={{ fontSize: 18, lineHeight: 1 }}
        >
          chevron_right
        </span>
      )}
    </div>
  );
}

export type ListSectionProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function ListSection({ title, children, className = "" }: ListSectionProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {title && (
        <p className="px-[16px] pt-[16px] pb-[4px] text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--foreground-secondary,#666)]">
          {title}
        </p>
      )}
      <div className="flex flex-col divide-y divide-[var(--surface-3,#eee)]">{children}</div>
    </div>
  );
}
