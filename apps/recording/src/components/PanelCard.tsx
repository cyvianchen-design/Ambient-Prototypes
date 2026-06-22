import React from "react";
import { Icon } from "@ds/ui";

// A floating white copilot card used in the desktop/tablet multi-panel layout:
// header (icon + title + close), scrollable body, optional pinned footer.
export function PanelCard({
  icon,
  title,
  onClose,
  footer,
  children,
}: {
  icon?: string;
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_4px_16px_2px_rgba(0,0,0,0.07)]">
      {/* header */}
      <div className="flex items-center gap-[8px] px-[20px] pb-[8px] pt-[16px]">
        {icon && (
          <span className="text-[var(--accent,#1132ee)]">
            <Icon name={icon} size={20} />
          </span>
        )}
        <p className="min-w-0 flex-1 font-['Lato'] text-[17px] font-bold leading-[1.2] tracking-[0.34px] text-[var(--foreground-primary,#1a1a1a)]">
          {title}
        </p>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="flex size-[28px] items-center justify-center rounded-[6px] text-[var(--foreground-secondary,#666)] hover:bg-[var(--surface-1,#f7f7f7)]"
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      {/* body */}
      <div className="flex min-h-px flex-1 flex-col overflow-y-auto px-[20px] py-[8px]">
        {children}
      </div>

      {footer && <div className="px-[20px] pb-[16px] pt-[8px]">{footer}</div>}
    </div>
  );
}
