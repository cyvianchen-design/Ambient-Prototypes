import React, { useRef, useEffect, useState } from "react";
import { Icon } from "./Icon";

// ─── Types ───────────────────────────────────────────────────────────────────

export type TextAreaFeedback = {
  type: "error";
  message?: string;
};

export type TextAreaProps = {
  /** Label shown above the field */
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Visual feedback state; message becomes the caption */
  feedback?: TextAreaFeedback;
  /** Helper text below field (overridden by feedback.message) */
  caption?: string;
  /** Extra slot at trailing top-right (replaces feedback icon) */
  suffix?: React.ReactNode;
  /** Minimum visible rows before auto-expand kicks in (default 3) */
  rows?: number;
  /** Show character counter "N / max" below the field */
  maxLength?: number;
  className?: string;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function TextArea({
  label,
  value = "",
  onChange,
  placeholder,
  disabled = false,
  feedback,
  caption,
  suffix,
  rows = 3,
  maxLength,
  className = "",
  onFocus,
  onBlur,
}: TextAreaProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize to hug content height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const ftype = feedback?.type;

  const borderCls = disabled
    ? "border-[var(--surface-3,#e0e0e0)]"
    : ftype === "error"
    ? "border-[var(--foreground-semantic-danger,#bb1411)]"
    : focused
    ? "border-[var(--accent,#1132ee)]"
    : hovered
    ? "border-[#aaa]"
    : "border-[var(--surface-3,#e0e0e0)]";

  const feedbackIcon =
    suffix ??
    (ftype === "error" ? (
      <Icon
        name="error"
        size={14}
        filled
        className="text-[var(--foreground-semantic-danger,#bb1411)]"
      />
    ) : null);

  const captionText = feedback?.message ?? caption;
  const captionColorCls =
    ftype === "error"
      ? "text-[var(--foreground-semantic-danger,#bb1411)]"
      : "text-[var(--foreground-secondary,#666)]";

  const charCount = value.length;
  const showBottomRow = !!(maxLength || feedbackIcon);

  return (
    <div
      className={`inline-flex flex-col gap-[4px] ${className}`}
    >
      {/* Label */}
      {label && (
        <span className="text-[12px] font-bold leading-[1.3] tracking-[0.07px] text-[var(--foreground-primary,#1a1a1a)]">
          {label}
        </span>
      )}

      {/* Textarea wrapper */}
      <div
        className={[
          "flex flex-col",
          "rounded-[6px] border",
          borderCls,
          "bg-white transition-colors",
          disabled ? "opacity-40 cursor-not-allowed" : "",
        ].join(" ")}
        onMouseEnter={() => !disabled && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Text row */}
        <div className="flex items-start gap-[4px] px-[10px] pt-[8px] pb-[4px]">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            className="flex-1 min-w-0 bg-transparent outline-none t-body-sm leading-[1.5] text-[var(--foreground-primary,#1a1a1a)] placeholder-[#999] disabled:cursor-not-allowed resize-none overflow-hidden"
          />
        </div>

        {/* Bottom row: feedback icon + char counter (inside border) */}
        {showBottomRow && (
          <div className="flex items-center justify-end gap-[6px] px-[10px] pb-[6px]">
            {feedbackIcon && (
              <span className="flex items-center">{feedbackIcon}</span>
            )}
            {maxLength && (
              <span
                className={`text-[11px] tabular-nums leading-[1] ${
                  ftype === "error"
                    ? "text-[var(--foreground-semantic-danger,#bb1411)]"
                    : "text-[var(--foreground-secondary,#666)]"
                }`}
              >
                {String(charCount).padStart(2, "0")}/{String(maxLength).padStart(2, "0")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Caption below field */}
      {captionText && (
        <p className={`text-[11px] leading-[1.3] ${captionColorCls}`}>
          {captionText}
        </p>
      )}
    </div>
  );
}
