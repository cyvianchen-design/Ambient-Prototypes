import React from "react";
import { Icon } from "./Icon";

export type SelectChipSize = "S" | "XS";

/**
 * Controls the ON state appearance only.
 * OFF state is always the same regardless of color: outlined border + secondary text.
 *
 * - "neutral" on: black-5 bg + primary text
 * - "accent"  on: litmus-25 bg + accent text
 *
 * Do NOT use a neutral Chip to represent the off state of an accent SelectChip —
 * they look different. Use SelectChip with selected=false instead.
 */
export type SelectChipColor = "neutral" | "accent";

export type SelectChipProps = {
  label: string;
  selected: boolean;
  onChange: (selected: boolean) => void;
  /** Icon shown in the off state (replaced by checkmark when selected, unless chevronWhenSelected is set) */
  icon?: string;
  /** When true, shows a dropdown chevron in the on state instead of a checkmark — use when the on state has selectable options */
  chevronWhenSelected?: boolean;
  size?: SelectChipSize;
  color?: SelectChipColor;
  disabled?: boolean;
  className?: string;
};

export function SelectChip({
  label,
  selected,
  onChange,
  icon,
  chevronWhenSelected = false,
  size = "S",
  color = "neutral",
  disabled = false,
  className = "",
}: SelectChipProps) {
  const handleClick = () => {
    if (!disabled) onChange(!selected);
  };

  // Off state: always neutral outline + secondary text (shared across both colors)
  // On state: neutral → black-5 bg + primary text; accent → litmus-25 bg + accent text
  const offColors = disabled
    ? "bg-transparent border border-[#ddd] text-[#bbb]"
    : "bg-transparent border border-[var(--surface-3,#eee)] text-[var(--foreground-secondary,#666)] hover:bg-[var(--black-5,#0000000d)] hover:border-[var(--surface-3,#eee)]";

  const onColors = disabled
    ? "bg-[#e6e6e6] text-[#aaa]"
    : color === "accent"
    ? "bg-[var(--litmus-25,#f1f3fe)] text-[var(--accent,#1132ee)] hover:bg-[var(--litmus-50,#e7eafd)]"
    : "bg-[var(--black-5,#0000000d)] text-[var(--foreground-primary,#1a1a1a)] hover:bg-[#e6e6e6]";

  if (size === "XS") {
    const base = "inline-flex items-center h-[20px] rounded-[4px] gap-[3px] transition-colors duration-150";
    const paddingLeft = (icon && !selected) || (selected && chevronWhenSelected) ? "pl-[4px]" : "pl-[6px]";
    const paddingRight = selected && chevronWhenSelected ? "pr-[2px]" : "pr-[6px]";

    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`inline-flex items-center h-[28px] shrink-0 cursor-pointer disabled:cursor-default ${className}`}
        aria-pressed={selected}
      >
        <span className={`${base} ${paddingLeft} ${paddingRight} ${selected ? onColors : offColors}`}>
          {icon && !selected && <Icon name={icon} size={12} className="shrink-0 opacity-70" />}
          {selected && !chevronWhenSelected && <Icon name="check" size={12} className="shrink-0" />}
          <span
            className="t-body-xs leading-none whitespace-nowrap"
            style={{ fontFeatureSettings: "'ss07'" }}
          >
            {label}
          </span>
          {selected && chevronWhenSelected && <Icon name="arrow_drop_down" size={16} className="shrink-0 opacity-60" />}
        </span>
      </button>
    );
  }

  // S size (28px)
  const base = "inline-flex items-center h-[28px] rounded-[6px] gap-[4px] transition-colors duration-150";
  const paddingLeft = (icon && !selected) ? "pl-[6px]" : "pl-[8px]";
  const paddingRight = selected && chevronWhenSelected ? "pr-[4px]" : "pr-[8px]";

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center shrink-0 cursor-pointer disabled:cursor-default ${className}`}
      aria-pressed={selected}
    >
      <span className={`${base} ${paddingLeft} ${paddingRight} ${selected ? onColors : offColors}`}>
        {icon && !selected && <Icon name={icon} size={14} className="shrink-0 opacity-70" />}
        {selected && !chevronWhenSelected && <Icon name="check" size={14} className="shrink-0" />}
        <span
          className="t-body-sm leading-none whitespace-nowrap"
          style={{ fontFeatureSettings: "'ss07'" }}
        >
          {label}
        </span>
        {selected && chevronWhenSelected && <Icon name="arrow_drop_down" size={16} className="shrink-0 opacity-60" />}
      </span>
    </button>
  );
}
