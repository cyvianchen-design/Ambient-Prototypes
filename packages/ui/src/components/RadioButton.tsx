import React from "react";

export type RadioButtonProps = {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
};

export function RadioButton({
  checked = false,
  disabled = false,
  onChange,
  className = "",
}: RadioButtonProps) {
  function handleClick() {
    if (disabled || !onChange) return;
    onChange(!checked);
  }

  const circleBg = disabled && !checked ? "bg-[#f2f2f2]" : "bg-white";

  const circleBorder =
    checked && !disabled  ? "border-2 border-[var(--accent,#1132ee)]" :
    checked && disabled   ? "border-2 border-[#d9d9d9]" :
    disabled              ? "border border-[#b3b3b3]" :
                            "border border-[#b3b3b3] hover:border-[var(--foreground-primary,#1a1a1a)]";

  const dotColor = disabled ? "bg-[#d9d9d9]" : "bg-[var(--accent,#1132ee)]";

  return (
    <div
      onClick={handleClick}
      role="radio"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") handleClick(); }}
      className={`p-[4px] flex items-center justify-center shrink-0 ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      <div
        className={`size-[20px] rounded-full flex items-center justify-center transition-colors ${circleBg} ${circleBorder}`}
      >
        {checked && (
          <div className={`size-[10px] rounded-full ${dotColor}`} />
        )}
      </div>
    </div>
  );
}

// ─── Radio Group ──────────────────────────────────────────────────────────────

export type RadioGroupOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type RadioGroupProps = {
  options: RadioGroupOption[];
  value: string;
  onChange: (value: string) => void;
  /** Stack direction. Default "vertical". */
  direction?: "vertical" | "horizontal";
  className?: string;
};

export function RadioGroup({
  options,
  value,
  onChange,
  direction = "vertical",
  className = "",
}: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      className={`flex ${direction === "horizontal" ? "flex-row gap-[16px]" : "flex-col gap-[4px]"} ${className}`}
    >
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center gap-[6px] ${opt.disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <RadioButton
            checked={value === opt.value}
            disabled={opt.disabled}
            onChange={() => !opt.disabled && onChange(opt.value)}
          />
          <span className={`t-body-sm ${opt.disabled ? "text-[#999]" : "text-[var(--foreground-primary,#1a1a1a)]"}`}>
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
}
