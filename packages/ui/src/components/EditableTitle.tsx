import React from "react";

export type EditableTitleSize = "sm" | "md" | "lg";

export type EditableTitleProps = {
  value: string;
  onChange: (value: string) => void;
  size?: EditableTitleSize;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const SIZE_CLASSES: Record<EditableTitleSize, { text: string; height: string; px: string; nml: string }> = {
  sm: { text: "t-title-sm", height: "h-[28px]", px: "px-[8px]",  nml: "-ml-[8px]" },
  md: { text: "t-title-md", height: "h-[36px]", px: "px-[10px]", nml: "-ml-[10px]" },
  lg: { text: "t-title-lg", height: "h-[36px]", px: "px-[12px]", nml: "-ml-[12px]" },
};

export function EditableTitle({
  value,
  onChange,
  size = "md",
  placeholder = "Untitled",
  disabled = false,
  className = "",
}: EditableTitleProps) {
  const { text, height, px, nml } = SIZE_CLASSES[size];
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      size={Math.max(value.length, placeholder.length, 4)}
      style={{ fontFeatureSettings: "'ss07'" }}
      className={`max-w-full ${text} ${height} ${px} ${nml} text-[var(--foreground-primary,#1a1a1a)] bg-transparent outline-none rounded-[6px] hover:bg-[#f2f2f2] focus:bg-white focus:ring-1 focus:ring-[var(--accent,#1132ee)] disabled:pointer-events-none placeholder:text-[var(--foreground-tertiary,#808080)] ${className}`}
    />
  );
}
