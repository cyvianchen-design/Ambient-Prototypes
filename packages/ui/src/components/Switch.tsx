import React from "react";

export type SwitchSize = "S" | "XS";

export type SwitchProps = {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: SwitchSize;
};

// XS track: 28×16px, hitbox 28×28px  |  S track: 34×20px, hitbox 34×20px
// Selected:   accent-blue bg, white thumb at right
// Unselected: white bg + 2px grey border, small grey thumb at left
export function Switch({ checked, onChange, disabled = false, size = "S" }: SwitchProps) {
  const xs = size === "XS";
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={[
        // XS: button is the 28×28 hitbox (transparent), visual track is a child element
        // S:  button IS the track (hitbox = visual size)
        "shrink-0 outline-none flex items-center justify-center",
        xs ? "w-[28px] h-[28px]" : "w-[34px] h-[20px]",
        xs
          ? ""
          : [
              "relative rounded-full transition-colors duration-150",
              disabled
                ? checked ? "bg-[var(--neutral-400,#999)]" : "bg-white border-2 border-[var(--neutral-400,#999)]"
                : checked ? "bg-[var(--accent,#1132ee)]"  : "bg-white border-2 border-[#b3b3b3]",
            ].join(" "),
        disabled ? "cursor-not-allowed" : "cursor-pointer",
      ].filter(Boolean).join(" ")}
    >
      {xs ? (
        // Visual track for XS — centered inside the larger hitbox
        <span
          className={[
            "relative w-[28px] h-[16px] rounded-full shrink-0 transition-colors duration-150",
            disabled
              ? checked ? "bg-[var(--neutral-400,#999)]" : "bg-white border-2 border-[var(--neutral-400,#999)]"
              : checked ? "bg-[var(--accent,#1132ee)]"  : "bg-white border-2 border-[#b3b3b3]",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-150",
              checked
                ? "w-[12px] h-[12px] left-[14px] bg-white"
                : "w-[8px]  h-[8px]  left-[2px]  bg-[#666]",
              disabled ? "bg-[var(--neutral-400,#999)]" : "",
            ].filter(Boolean).join(" ")}
          />
        </span>
      ) : (
        // S size thumb — positioned inside the button (which is the track)
        <span
          className={[
            "absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-150",
            checked
              ? "w-[16px] h-[16px] left-[16px] bg-white"
              : "w-[10px] h-[10px] left-[3px]  bg-[#666]",
            disabled ? "bg-[var(--neutral-400,#999)]" : "",
          ].filter(Boolean).join(" ")}
        />
      )}
    </button>
  );
}
