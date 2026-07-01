import React, { useEffect } from "react";

export type PopUpSize = "small" | "medium" | "large";

export type PopUpProps = {
  open: boolean;
  onClose?: () => void;
  title?: string;
  /** Optional illustration/image slot above the title */
  illustration?: React.ReactNode;
  children?: React.ReactNode;
  /** Buttons — stacked vertically, full-width, centered in the card */
  actions?: React.ReactNode;
  size?: PopUpSize;
  hideClose?: boolean;
  className?: string;
};

const sizeClass: Record<PopUpSize, string> = {
  small:  "w-[280px]",
  medium: "w-[360px]",
  large:  "w-[480px]",
};

export function PopUp({
  open,
  onClose,
  title,
  illustration,
  children,
  actions,
  size = "medium",
  hideClose = false,
  className = "",
}: PopUpProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "popup-title" : undefined}
        className={[
          "relative z-[201] bg-white rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.16)] flex flex-col items-center text-center max-h-[90vh] max-w-[90vw] overflow-y-auto px-[24px] pt-[24px] pb-[20px] gap-[12px]",
          sizeClass[size],
          className,
        ].join(" ")}
      >
        {/* Close button */}
        {!hideClose && onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-[12px] right-[12px] flex items-center justify-center w-[28px] h-[28px] rounded-[6px] text-[var(--foreground-secondary,#666)] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors"
          >
            <span className="material-symbols-rounded" style={{ fontSize: 18, lineHeight: 1 }}>close</span>
          </button>
        )}

        {/* Illustration */}
        {illustration && (
          <div className="flex items-center justify-center w-full">
            {illustration}
          </div>
        )}

        {/* Title */}
        {title && (
          <p
            id="popup-title"
            className="t-title-lg text-[var(--foreground-primary,#1a1a1a)] w-full"
          >
            {title}
          </p>
        )}

        {/* Body */}
        {children && (
          <div className="text-[14px] leading-[1.5] text-[var(--foreground-secondary,#666)] w-full">
            {children}
          </div>
        )}

        {/* Actions — stacked full-width buttons */}
        {actions && (
          <div className="flex flex-col gap-[8px] w-full mt-[4px]">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
