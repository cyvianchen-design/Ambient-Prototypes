import React from "react";

export type OverlayVariant = "blur" | "dim";

export type OverlayProps = {
  /** "blur" — backdrop-blur + dark tint (default). "dim" — dark tint only, no blur. */
  variant?: OverlayVariant;
  /** Use fixed to cover the entire viewport including navs. Defaults to absolute. */
  fixed?: boolean;
  onClick?: () => void;
  className?: string;
};

export function Overlay({ variant = "blur", fixed = false, onClick, className }: OverlayProps) {
  return (
    <div
      className={[
        fixed ? "fixed inset-0" : "absolute inset-0",
        variant === "blur"
          ? "backdrop-blur-[10px] bg-[rgba(26,26,26,0.3)]"
          : "bg-[rgba(0,0,0,0.2)]",
        className,
      ].filter(Boolean).join(" ")}
      onClick={onClick}
    />
  );
}
