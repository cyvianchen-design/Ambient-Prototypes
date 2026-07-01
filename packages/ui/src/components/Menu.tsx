import React, { useRef, useEffect } from "react";
import { Icon } from "./Icon";

export interface MenuProps {
  children: React.ReactNode;
  className?: string;
}

export interface MenuHeaderProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export interface MenuSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
  placeholder?: string;
}

export interface MenuItemProps {
  icon?: React.ReactNode;
  label: string;
  /** Optional secondary line rendered below the label in Title/S + Body/XS styles. */
  description?: string;
  /** Optional content anchored to the right side of the row (trailing label, action button, etc.) */
  trailing?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function Menu({ children, className = "" }: MenuProps) {
  return (
    <div className={`rounded-[12px] p-[6px] shadow-[0_4px_16px_2px_rgba(0,0,0,0.07)] bg-white border border-[rgba(0,0,0,0.1)] ${className}`}>
      {children}
    </div>
  );
}

export function MenuHeader({ children, icon }: MenuHeaderProps) {
  return (
    <div className="flex items-center gap-[8px] px-[8px] pt-[6px] pb-[2px]">
      {icon && <span className="shrink-0 text-[var(--foreground-tertiary,#808080)]">{icon}</span>}
      <span
        className="text-[11px] font-bold leading-none tracking-[0.13px] text-[var(--foreground-tertiary,#808080)]"
      >
        {children}
      </span>
    </div>
  );
}

export function MenuSearch({ value, onChange, onClose, placeholder = "Search…" }: MenuSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return (
    <div className="-mx-[6px] -mt-[6px] flex items-center gap-[8px] px-[12px] py-[8px] border-b border-[rgba(0,0,0,0.1)] rounded-t-[12px] mb-[4px]">
      <Icon name="search" size={16} className="text-[var(--foreground-tertiary,#808080)] shrink-0" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Escape") onClose?.(); }}
        placeholder={placeholder}
        className="flex-1 min-w-0 t-body-sm text-[var(--foreground-primary,#1a1a1a)] placeholder-[var(--foreground-tertiary,#808080)] outline-none bg-transparent"
      />
      {value && (
        <button onClick={() => onChange("")} className="shrink-0 text-[var(--foreground-tertiary,#808080)] hover:text-[var(--foreground-primary,#1a1a1a)]">
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}

export function MenuItem({
  icon,
  label,
  description,
  trailing,
  selected = false,
  disabled = false,
  onClick,
}: MenuItemProps) {
  const hoverClass = !disabled ? "hover:bg-[var(--surface-1,#f7f7f7)]" : "";
  const selectedClass = selected ? "bg-[#f1f3fe]" : "";
  const height = description ? "min-h-[36px] py-[6px]" : "h-[36px]";
  const padding = trailing ? "pl-[8px] pr-[4px]" : "px-[8px]";

  return (
    <button
      className={`flex items-center w-full gap-[8px] ${height} ${padding} rounded-[6px] transition-colors text-left cursor-pointer ${hoverClass} ${selectedClass} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {icon && <span className="shrink-0 text-[var(--accent,#1132ee)]">{icon}</span>}
      {description ? (
        <span className="flex flex-col gap-[1px]">
          <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">
            {label}
          </span>
          <span className="t-body-xs text-[var(--foreground-secondary,#666)]">
            {description}
          </span>
        </span>
      ) : (
        <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">
          {label}
        </span>
      )}
      {trailing && <span className="ml-auto shrink-0 pl-[8px]">{trailing}</span>}
    </button>
  );
}
