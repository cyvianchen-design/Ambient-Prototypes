import React from "react";
import { Icon } from "./Icon";

export type ChipColor = "accent" | "neutral";
export type ChipSize = "S" | "XS";

export type ChipProps = {
  label: string;
  color?: ChipColor;
  size?: ChipSize;
  /**
   * Renders a × dismiss button.
   * Can be combined with `onClick` for a split chip (click label to change, × to remove).
   */
  onDismiss?: React.MouseEventHandler<HTMLButtonElement>;
  /**
   * Makes the chip (or its label area) a clickable button with a dropdown arrow.
   * Can be combined with `onDismiss` for a split chip.
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
};

export function Chip({
  label,
  color = "neutral",
  size = "S",
  onDismiss,
  onClick,
  disabled = false,
  className = "",
}: ChipProps) {
  const bg        = color === "accent" ? "bg-[var(--accent-10,#1132ee1a)]" : "bg-[var(--black-5,#0000000d)]";
  const bgHover   = color === "accent" ? "hover:bg-[#e7eafd]" : "hover:bg-[#e6e6e6]";
  const textColor = color === "accent" ? "text-[#1132ee]" : "text-[#1a1a1a]";

  const colors = disabled ? "bg-[#f7f7f7] text-[#999]" : `${bg} ${textColor}`;
  const hover  = !disabled ? bgHover : "";

  const labelEl = (
    <span
      className="text-[13px] font-normal leading-none tracking-[0.065px] whitespace-nowrap"
      style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07'" }}
    >
      {label}
    </span>
  );

  // ── XS (20px visual pill, 28px hit-area wrapper) ───────────────────
  if (size === "XS") {

    // Mode 3 — split: click label to change, × to dismiss
    if (onClick && onDismiss) {
      return (
        <span className={`inline-flex items-center h-[28px] shrink-0 ${className}`}>
          <span className={`inline-flex items-center h-[20px] rounded-[4px] overflow-hidden ${colors}`}>
            <button
              onClick={onClick}
              disabled={disabled}
              className={`h-full pl-[6px] pr-[4px] inline-flex items-center ${hover}`}
            >
              {labelEl}
            </button>
            <button
              onClick={onDismiss}
              disabled={disabled}
              aria-label="Remove"
              className={`h-full pl-[2px] pr-[2px] inline-flex items-center justify-center opacity-60 hover:opacity-100 ${hover}`}
            >
              <Icon name="close" size={12} className="shrink-0" />
            </button>
          </span>
        </span>
      );
    }

    // Mode 1 — onClick only / Mode 2 — onDismiss only / static
    const pill = (
      <span className={`inline-flex items-center h-[20px] pl-[6px] ${(onClick || onDismiss) ? "pr-[2px]" : "pr-[6px]"} gap-[2px] rounded-[4px] ${colors} ${hover}`}>
        {labelEl}
        {onClick    && <Icon name="arrow_drop_down" size={16} className="shrink-0 opacity-60" />}
        {onDismiss  && (
          <button
            onClick={onDismiss}
            disabled={disabled}
            aria-label="Remove"
            className="shrink-0 inline-flex items-center justify-center size-[14px] opacity-60 hover:opacity-100"
          >
            <Icon name="close" size={12} />
          </button>
        )}
      </span>
    );

    if (onClick) {
      return (
        <button onClick={onClick} disabled={disabled} className={`inline-flex items-center h-[28px] shrink-0 cursor-pointer ${className}`}>
          {pill}
        </button>
      );
    }
    return (
      <span className={`inline-flex items-center h-[28px] shrink-0 ${className}`}>
        {pill}
      </span>
    );
  }

  // ── S (28px) ───────────────────────────────────────────────────────

  // Mode 3 — split: click label to change, × to dismiss
  if (onClick && onDismiss) {
    return (
      <span className={`inline-flex items-center h-[28px] rounded-[6px] overflow-hidden shrink-0 ${colors} ${className}`}>
        <button
          onClick={onClick}
          disabled={disabled}
          className={`h-full pl-[8px] pr-[6px] inline-flex items-center ${hover}`}
        >
          {labelEl}
        </button>
        <button
          onClick={onDismiss}
          disabled={disabled}
          aria-label="Remove"
          className={`h-full pl-[2px] pr-[6px] inline-flex items-center justify-center opacity-60 hover:opacity-100 ${hover}`}
        >
          <Icon name="close" size={14} className="shrink-0" />
        </button>
      </span>
    );
  }

  // Mode 1 — onClick only / Mode 2 — onDismiss only / static
  const base = `inline-flex items-center h-[28px] pl-[8px] ${onDismiss ? "pr-[6px]" : onClick ? "pr-[4px]" : "pr-[8px]"} gap-[4px] rounded-[6px] shrink-0`;

  if (onClick) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${base} ${colors} ${hover} cursor-pointer ${className}`}
      >
        {labelEl}
        <Icon name="arrow_drop_down" size={16} className="shrink-0 opacity-60" />
      </button>
    );
  }

  return (
    <span className={`${base} ${colors} ${className}`}>
      {labelEl}
      {onDismiss && (
        <button
          onClick={onDismiss}
          disabled={disabled}
          aria-label="Remove"
          className="shrink-0 flex items-center justify-center size-[16px] opacity-60 hover:opacity-100"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </span>
  );
}
