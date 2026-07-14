import React from "react";

export type CheckboxState = "unselected" | "selected" | "indeterminate";
export type CheckboxSize = "M" | "S";

export type CheckboxProps = {
  state?: CheckboxState;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
  className?: string;
  /** M = 18px box (default); S = 16px box, tighter padding. */
  size?: CheckboxSize;
};

export function Checkbox({
  state = "unselected",
  disabled = false,
  onChange,
  className = "",
  size = "M",
}: CheckboxProps) {
  const filled = state === "selected" || state === "indeterminate";
  const wrap = size === "S" ? "p-[3px]" : "p-[5px]";
  const box = size === "S" ? "size-[16px]" : "size-[18px]";

  function handleClick() {
    if (disabled || !onChange) return;
    onChange(state !== "selected");
  }

  const boxBg =
    filled && !disabled ? "bg-[var(--accent,#1132ee)]" :
    filled && disabled  ? "bg-[#d9d9d9]" :
    disabled            ? "bg-[#f2f2f2]" :
                          "bg-white";

  const boxBorder =
    filled   ? "border-0" :
    disabled ? "border border-[#b3b3b3]" :
               "border border-[#b3b3b3] hover:border-[var(--foreground-primary,#1a1a1a)]";

  return (
    <div
      onClick={handleClick}
      className={`${wrap} flex items-center justify-center shrink-0 ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      <div
        className={`relative ${box} rounded-[2px] flex items-center justify-center transition-colors ${boxBg} ${boxBorder}`}
      >
        {state === "selected" && (
          <svg width="10" height="8" viewBox="0 0 11 9" fill="none">
            <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {state === "indeterminate" && (
          <svg width="9" height="2" viewBox="0 0 10 2" fill="none">
            <path d="M1 1H9" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
}
