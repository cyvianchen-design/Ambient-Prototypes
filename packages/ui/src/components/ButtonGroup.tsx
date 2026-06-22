import React from "react";

// ─── Button Group ─────────────────────────────────────────────────────────────

export type ButtonGroupSize = "small" | "medium" | "large";

type GroupItem = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

const groupSizeTokens: Record<ButtonGroupSize, { h: string; text: string; px: string; gap: string; radius: string; p: string }> = {
  small:  { h: "h-[24px]", text: "text-[13px] tracking-[0.13px]", px: "px-[8px]",  gap: "gap-[4px]",  radius: "rounded-[4px]", p: "p-[2px]" },
  medium: { h: "h-[32px]", text: "text-[13px] tracking-[0.13px]", px: "px-[12px]", gap: "gap-[6px]",  radius: "rounded-[6px]", p: "p-[3px]" },
  large:  { h: "h-[40px]", text: "text-[15px] tracking-[0.15px]", px: "px-[16px]", gap: "gap-[8px]",  radius: "rounded-[8px]", p: "p-[4px]" },
};

export type ButtonGroupTheme = "default" | "inverse";

export type ButtonGroupProps = {
  items: GroupItem[];
  value: string | string[];
  onChange: (value: string) => void;
  size?: ButtonGroupSize;
  multiSelect?: boolean;
  /** "inverse" for use on brand / dark gradient surfaces (white-on-translucent). */
  theme?: ButtonGroupTheme;
  className?: string;
};

export function ButtonGroup({
  items,
  value,
  onChange,
  size = "medium",
  multiSelect = false,
  theme = "default",
  className = "",
}: ButtonGroupProps) {
  const { h, text, px, gap, radius, p } = groupSizeTokens[size];
  const selectedValues = Array.isArray(value) ? value : [value];

  if (multiSelect) {
    // Multi-select: bare flex row of outlined buttons — no container wrapper.
    // Default theme — unselected: white bg + surface-3 border; selected: litmus-25 + accent.
    // Inverse theme (brand surfaces) — unselected: translucent-white border + white/70 text;
    //   selected: white/30 fill + white text.
    const inverse = theme === "inverse";
    return (
      <div
        className={`inline-flex gap-[8px] font-['Lato',sans-serif] font-bold leading-[1.2] flex-wrap ${className}`}
        role="group"
      >
        {items.map((item) => {
          const isSelected = selectedValues.includes(item.value);
          const stateCls = inverse
            ? isSelected
              ? "bg-[rgba(255,255,255,0.3)] border-transparent text-white"
              : "bg-transparent border-[rgba(255,255,255,0.3)] text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white"
            : isSelected
              ? "bg-[var(--litmus-25,#f1f3fe)] border-[var(--accent,#1132ee)] text-[var(--accent,#1132ee)]"
              : "bg-white border-[var(--surface-3,#e6e6e6)] text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)]";
          const iconCls = inverse
            ? isSelected
              ? "text-white"
              : "text-[rgba(255,255,255,0.7)]"
            : isSelected
              ? "text-[var(--accent,#1132ee)]"
              : "text-[var(--foreground-secondary,#666)]";
          return (
            <button
              key={item.value}
              onClick={() => !item.disabled && onChange(item.value)}
              disabled={item.disabled}
              aria-pressed={isSelected}
              className={[
                `flex items-center justify-center ${gap} ${h} ${px} ${text} ${radius} border transition-all duration-150 outline-none`,
                inverse
                  ? "focus-visible:ring-[2px] focus-visible:ring-[rgba(255,255,255,0.5)]"
                  : "focus-visible:ring-[2px] focus-visible:ring-[var(--litmus-100,#cfd6fc)]",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                stateCls,
              ].join(" ")}
            >
              {item.icon && (
                <span className={`flex items-center shrink-0 ${iconCls}`}>{item.icon}</span>
              )}
              {item.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Single-select: pill container, white elevated card for the selected option.
  return (
    <div
      className={`inline-flex ${p} ${radius} bg-[var(--surface-2,#f2f2f2)] font-['Lato',sans-serif] font-bold leading-[1.2] gap-[2px] ${className}`}
      role="radiogroup"
    >
      {items.map((item) => {
        const isSelected = selectedValues.includes(item.value);
        return (
          <button
            key={item.value}
            onClick={() => !item.disabled && onChange(item.value)}
            disabled={item.disabled}
            aria-checked={isSelected}
            role="radio"
            className={[
              `flex items-center justify-center ${gap} ${h} ${px} ${text} ${radius} transition-all duration-150 outline-none`,
              "focus-visible:ring-[2px] focus-visible:ring-[var(--litmus-100,#cfd6fc)]",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              isSelected
                ? "bg-white text-[var(--foreground-primary,#1a1a1a)] shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                : "bg-transparent text-[var(--foreground-secondary,#666)] hover:text-[var(--foreground-primary,#1a1a1a)]",
            ].join(" ")}
          >
            {item.icon && (
              <span
                className={`flex items-center shrink-0 ${
                  isSelected
                    ? "text-[var(--foreground-primary,#1a1a1a)]"
                    : "text-[var(--foreground-secondary,#666)]"
                }`}
              >
                {item.icon}
              </span>
            )}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Split Button ─────────────────────────────────────────────────────────────
// Border lives on the wrapper; the divider is a border-l on the chevron button.
// This avoids the double-line artifact of having both a button border and a
// separate divider element.

export type SplitButtonVariant = "primary" | "secondary";

const splitVariants: Record<SplitButtonVariant, { wrapper: string; label: string; chevron: string }> = {
  primary: {
    wrapper: "bg-[var(--foreground-primary,#1a1a1a)]",
    label:   "text-white hover:bg-[var(--neutral-800,#333)]",
    chevron: "text-white hover:bg-[var(--neutral-800,#333)] border-l border-white/30",
  },
  secondary: {
    wrapper: "border border-[var(--foreground-primary,#1a1a1a)]",
    label:   "bg-transparent text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)]",
    chevron: "bg-transparent text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)] border-l border-[var(--foreground-primary,#1a1a1a)]",
  },
};

const splitSizeTokens: Record<ButtonGroupSize, { h: string; text: string; px: string; chevronW: string }> = {
  small:  { h: "h-[28px]", text: "text-[13px] tracking-[0.13px]", px: "px-[10px]", chevronW: "w-[28px]" },
  medium: { h: "h-[36px]", text: "text-[15px] tracking-[0.15px]", px: "px-[16px]", chevronW: "w-[32px]" },
  large:  { h: "h-[48px]", text: "text-[17px] tracking-[0.34px]", px: "px-[20px]", chevronW: "w-[40px]" },
};

export type SplitButtonProps = {
  label: string;
  onClick: () => void;
  onMenuOpen: () => void;
  variant?: SplitButtonVariant;
  size?: ButtonGroupSize;
  disabled?: boolean;
  prefix?: React.ReactNode;
  className?: string;
};

export function SplitButton({
  label,
  onClick,
  onMenuOpen,
  variant = "primary",
  size = "medium",
  disabled,
  prefix,
  className = "",
}: SplitButtonProps) {
  const { h, text, px, chevronW } = splitSizeTokens[size];
  const { wrapper, label: labelCls, chevron: chevronCls } = splitVariants[variant];

  return (
    <div
      className={[
        "inline-flex rounded-[6px] overflow-hidden font-['Lato',sans-serif] font-bold leading-[1.2]",
        wrapper,
        disabled ? "opacity-40" : "",
        className,
      ].filter(Boolean).join(" ")}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-[6px] ${h} ${px} ${text} ${labelCls} transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-[var(--litmus-100,#cfd6fc)] disabled:cursor-not-allowed`}
      >
        {prefix && <span className="flex items-center shrink-0">{prefix}</span>}
        {label}
      </button>

      <button
        onClick={onMenuOpen}
        disabled={disabled}
        aria-label="Open menu"
        className={`flex items-center justify-center ${h} ${chevronW} ${chevronCls} transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-[var(--litmus-100,#cfd6fc)] disabled:cursor-not-allowed`}
      >
        <span
          className="material-symbols-rounded"
          style={{ fontSize: 16, lineHeight: 1 }}
        >
          expand_more
        </span>
      </button>
    </div>
  );
}
