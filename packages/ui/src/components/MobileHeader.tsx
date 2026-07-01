import React from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";

// ─── Mobile Title Bar ─────────────────────────────────────────────────────────

export type MobileHeaderProps = {
  title: string;
  subtitle?: string;
  /** If provided, shows a "< Back" text button in the left slot */
  onBack?: () => void;
  /** Custom left slot — overrides onBack if both are provided */
  leading?: React.ReactNode;
  /** Right slot actions */
  actions?: React.ReactNode;
  className?: string;
};

export function MobileHeader({
  title,
  subtitle,
  onBack,
  leading,
  actions,
  className = "",
}: MobileHeaderProps) {
  const leftSlot = leading ?? (onBack ? (
    <Button
      variant="tertiary-neutral"
      size="small"
      prefix={<Icon name="chevron_left" size={16} />}
      onClick={onBack}
    >
      Back
    </Button>
  ) : null);

  return (
    <div
      className={`relative flex items-center h-[52px] px-[4px] bg-white shrink-0 ${className}`}
    >
      {/* Left slot — absolute so it doesn't push title off-center */}
      {leftSlot && (
        <div className="absolute left-[4px] flex items-center">
          {leftSlot}
        </div>
      )}

      {/* Centered title */}
      <div className="flex-1 flex flex-col items-center justify-center px-[80px] min-w-0">
        <p className="t-title-lg text-[var(--foreground-primary,#1a1a1a)] truncate w-full text-center">
          {title}
        </p>
        {subtitle && (
          <p className="t-body-xs leading-[1.3] text-[var(--foreground-secondary,#666)] truncate w-full text-center mt-[1px]">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right slot */}
      {actions && (
        <div className="absolute right-[4px] flex items-center gap-[2px] shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

// ─── Sticky Button Bar ────────────────────────────────────────────────────────

export type StickyButtonBarProps = {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  /** Use `fixed` to pin to the bottom of the viewport. Default `sticky bottom-0`. */
  fixed?: boolean;
  className?: string;
};

export function StickyButtonBar({ primary, secondary, fixed = false, className = "" }: StickyButtonBarProps) {
  const positionCls = fixed ? "fixed bottom-0 left-0 right-0" : "sticky bottom-0";
  return (
    <div
      className={`${positionCls} bg-white px-[16px] py-[12px] flex flex-col gap-[8px] z-[100] ${className}`}
    >
      <div className="w-full">{primary}</div>
      {secondary && <div className="w-full">{secondary}</div>}
    </div>
  );
}
