import React from "react";
import { Icon } from "./Icon";

export type SpotMenuItemProps = {
  icon: string;
  label: string;
  description: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function SpotMenuItem({ icon, label, description, selected = false, disabled = false, onClick }: SpotMenuItemProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex items-center w-full h-[60px] pl-[12px] pr-[8px] py-[12px] gap-[12px] rounded-[6px] transition-colors text-left cursor-pointer ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-[var(--surface-1,#f7f7f7)]"} ${selected ? "bg-[#f1f3fe]" : ""}`}
    >
      <span className="flex items-center justify-center p-[4px] rounded-[4px] bg-[rgba(17,50,238,0.05)] shrink-0">
        <Icon name={icon} size={28} className="text-[var(--accent,#1132ee)]" />
      </span>
      <span className="flex flex-col gap-[2px] flex-1 min-w-0">
        <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFeatureSettings: '"ss07" 1' }}>
          {label}
        </span>
        <span className="t-body-sm text-[var(--foreground-secondary,#666)]">{description}</span>
      </span>
    </button>
  );
}
