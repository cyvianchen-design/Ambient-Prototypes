import React from "react";

const base = "content-stretch flex items-center justify-center relative rounded-[6px] shrink-0 cursor-pointer transition-colors font-['Lato',sans-serif] font-bold leading-[1.2] not-italic outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--litmus-100,#cfd6fc)] disabled:opacity-40 disabled:cursor-not-allowed";

// Icon-side padding is nudged 4px inward (Figma visual compactness trick).
// All class strings must be static for Tailwind JIT.
const sizeTokens = {
  small: {
    gap: "gap-[4px]", py: "py-[6px]", h: "h-[28px]", text: "text-[13px] tracking-[0.13px]",
    pad: { nn: "px-[10px]", pn: "pl-[6px] pr-[10px]", np: "pl-[10px] pr-[6px]", pp: "px-[6px]" },
  },
  medium: {
    gap: "gap-[8px]", py: "py-[8px]", h: "h-[36px]", text: "text-[15px] tracking-[0.15px]",
    pad: { nn: "px-[16px]", pn: "pl-[12px] pr-[16px]", np: "pl-[16px] pr-[12px]", pp: "px-[12px]" },
  },
  large: {
    gap: "gap-[8px]", py: "py-[12px]", h: "h-[48px]", text: "text-[17px] tracking-[0.34px]",
    pad: { nn: "px-[20px]", pn: "pl-[16px] pr-[20px]", np: "pl-[20px] pr-[16px]", pp: "px-[16px]" },
  },
};

function padKey(hasPrefix: boolean, hasSuffix: boolean): "nn" | "pn" | "np" | "pp" {
  if (hasPrefix && hasSuffix) return "pp";
  if (hasPrefix) return "pn";
  if (hasSuffix) return "np";
  return "nn";
}

const variants = {
  primary:            "bg-[var(--foreground-primary,#1a1a1a)] text-[var(--foreground-oninverse,white)] hover:bg-[var(--neutral-800,#333)] active:bg-[var(--neutral-700,#4d4d4d)]",
  secondary:          "border border-[var(--neutral-1000,black)] border-solid bg-transparent text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)] active:bg-[var(--surface-2,#f2f2f2)]",
  tertiary:           "bg-transparent text-[var(--foreground-brand,#1132ee)] hover:bg-[var(--litmus-25,#f1f3fe)] active:bg-[var(--litmus-25,#f1f3fe)]",
  "tertiary-neutral": "bg-transparent text-[var(--foreground-secondary,#666)] hover:bg-[var(--surface-1,#f7f7f7)] active:bg-[var(--surface-2,#f2f2f2)]",
  danger:             "bg-[var(--foreground-semantic-danger,#bb1411)] text-white hover:bg-[var(--red-700,#8c0f0d)] active:bg-[var(--red-800,#5d0a09)]",
  "danger-secondary": "border border-[var(--foreground-semantic-danger,#bb1411)] border-solid bg-transparent text-[var(--foreground-semantic-danger,#bb1411)] hover:bg-[var(--red-25,#fef1f1)] active:bg-[var(--red-50,#fde8e8)]",
  // Inverse — for use on dark/colored backgrounds
  "primary-inverse":  "bg-white text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--neutral-100,#e6e6e6)] active:bg-[var(--neutral-200,#ccc)]",
  "secondary-inverse":"border border-white border-solid bg-transparent text-white hover:bg-white/10 active:bg-white/20",
  "tertiary-inverse": "bg-transparent text-white hover:bg-white/10 active:bg-white/20",
};

export type ButtonVariant = keyof typeof variants;
export type IconButtonVariant = keyof typeof iconVariants;

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: keyof typeof sizeTokens;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
};

export function Button({
  variant = "primary",
  size = "medium",
  prefix,
  suffix,
  children,
  onClick,
  disabled,
  className = "",
}: ButtonProps) {
  const { gap, pad, py, h, text } = sizeTokens[size];
  const pd = pad[padKey(!!prefix, !!suffix)];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${gap} ${pd} ${py} ${h} ${text} ${variants[variant]} ${className}`}
      style={{ fontFeatureSettings: "'ss07'" }}
    >
      {prefix && <span className="flex items-center justify-center shrink-0">{prefix}</span>}
      {children}
      {suffix && <span className="flex items-center justify-center shrink-0">{suffix}</span>}
    </button>
  );
}

const iconSizes = {
  small:  "size-[28px]",
  medium: "size-[36px]",
  large:  "size-[48px]",
};

const iconVariants = {
  primary:            "bg-[var(--foreground-primary,#1a1a1a)] text-[var(--foreground-oninverse,white)] hover:bg-[var(--neutral-800,#333)] active:bg-[var(--neutral-700,#4d4d4d)]",
  secondary:          "border border-[var(--neutral-1000,black)] border-solid bg-transparent text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)] active:bg-[var(--surface-2,#f2f2f2)]",
  tertiary:           "bg-transparent text-[var(--accent,#1132ee)] hover:bg-[var(--accent-10,#1132ee1a)] active:bg-[var(--accent-20,#1132ee33)]",
  "tertiary-neutral": "bg-transparent text-[var(--foreground-secondary,#666)] hover:bg-[var(--black-3,#00000008)] active:bg-[var(--black-5,#0000000d)]",
  accent:             "bg-[var(--accent,#1132ee)] text-white hover:bg-[var(--hover,#0d28bf)] active:bg-[var(--active,#0a1e8f)]",
  danger:             "bg-transparent text-[var(--foreground-semantic-danger,#bb1411)] hover:bg-[var(--red-25,#fef1f1)] active:bg-[var(--red-50,#fde8e8)]",
  inverse:            "bg-transparent text-white hover:bg-white/10 active:bg-white/20",
  magic:              "text-white hover:opacity-90 active:opacity-80",
};

export type IconButtonProps = {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: keyof typeof iconSizes;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function IconButton({
  icon,
  variant = "tertiary",
  size = "medium",
  onClick,
  disabled,
  className = "",
  "aria-label": ariaLabel,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`flex items-center justify-center rounded-[6px] transition-all cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--litmus-100,#cfd6fc)] disabled:opacity-40 disabled:cursor-not-allowed ${iconSizes[size]} ${iconVariants[variant]} ${className}`}
      style={variant === "magic" ? { backgroundImage: "linear-gradient(-89deg, #8044ff 2%, #4554e5 50%, #2670ff 98%)" } : undefined}
    >
      {icon}
    </button>
  );
}
