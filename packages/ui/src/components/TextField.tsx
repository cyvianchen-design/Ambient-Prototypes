import React, { useState } from "react";
import { Icon } from "./Icon";

// ─── Types ───────────────────────────────────────────────────────────────────

export type TextFieldFeedback = {
  type: "error";
  message?: string;
};

export type TextFieldSize = "S" | "M" | "L";

export type TextFieldProps = {
  /** Label shown above the field */
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** Visual feedback state; message becomes the caption */
  feedback?: TextFieldFeedback;
  /** Helper text below field (overridden by feedback.message if both are set) */
  caption?: string;
  /** Left slot — icon, currency prefix, etc. */
  prefix?: React.ReactNode;
  /** Right slot — overrides built-in feedback icon when provided */
  suffix?: React.ReactNode;
  size?: TextFieldSize;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
};

// ─── Size config ─────────────────────────────────────────────────────────────

// [height, h-padding, icon-size, input-text-class, label-text-class]
const SIZES: Record<TextFieldSize, [string, string, number, string, string]> = {
  S: ["h-[28px]",  "px-[8px]",  12, "t-body-sm", "text-[11px]"],
  M: ["h-[36px]",  "px-[10px]", 14, "t-body-sm", "text-[12px]"],
  L: ["h-[44px]",  "px-[12px]", 16, "t-body-md", "text-[13px]"],
};

// ─── Component ───────────────────────────────────────────────────────────────

export function TextField({
  label,
  value,
  defaultValue,
  onChange,
  placeholder,
  disabled = false,
  readOnly = false,
  feedback,
  caption,
  prefix,
  suffix,
  size = "M",
  className = "",
  onClick,
  onFocus,
  onBlur,
  onKeyDown,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const [heightCls, pxCls, iconSz, inputTextCls, labelTextCls] = SIZES[size];
  const ftype = feedback?.type;

  // Border color by state
  const borderCls = disabled
    ? "border-[var(--surface-3,#e0e0e0)]"
    : ftype === "error"
    ? "border-[var(--foreground-semantic-danger,#bb1411)]"
    : focused
    ? "border-[var(--accent,#1132ee)]"
    : hovered
    ? "border-[#aaa]"
    : "border-[var(--surface-3,#e0e0e0)]";

  // Trailing icon (feedback icon, unless overridden by suffix prop)
  const trailNode =
    suffix ??
    (ftype === "error" ? (
      <Icon
        name="error"
        size={iconSz}
        filled
        className="text-[var(--foreground-semantic-danger,#bb1411)]"
      />
    ) : null);

  // Caption below field
  const captionText = feedback?.message ?? caption;
  const captionColorCls =
    ftype === "error"
      ? "text-[var(--foreground-semantic-danger,#bb1411)]"
      : "text-[var(--foreground-secondary,#666)]";

  return (
    <div
      className={`inline-flex flex-col gap-[4px] ${className}`}
    >
      {/* Label */}
      {label && (
        <span
          className={`${labelTextCls} font-bold leading-[1.3] tracking-[0.07px] text-[var(--foreground-primary,#1a1a1a)]`}
        >
          {label}
        </span>
      )}

      {/* Input wrapper */}
      <div
        className={[
          "flex items-center gap-[4px]",
          heightCls,
          pxCls,
          "rounded-[6px] border",
          borderCls,
          "bg-white transition-colors",
          disabled ? "opacity-40 cursor-not-allowed" : readOnly ? "cursor-pointer" : "cursor-text",
        ].join(" ")}
        onClick={onClick}
        onMouseEnter={() => !disabled && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {prefix && (
          <span className="shrink-0 flex items-center text-[var(--foreground-secondary,#666)]">
            {prefix}
          </span>
        )}
        <input
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onKeyDown={onKeyDown}
          className={[
            "flex-1 min-w-0 bg-transparent outline-none",
            inputTextCls,
            "text-[var(--foreground-primary,#1a1a1a)]",
            "placeholder-[#999]",
            "disabled:cursor-not-allowed",
            "read-only:cursor-pointer",
          ].join(" ")}
        />
        {trailNode && (
          <span className="shrink-0 flex items-center">{trailNode}</span>
        )}
      </div>

      {/* Caption */}
      {captionText && (
        <p className={`text-[11px] leading-[1.3] ${captionColorCls}`}>
          {captionText}
        </p>
      )}
    </div>
  );
}
