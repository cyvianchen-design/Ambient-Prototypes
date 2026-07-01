import React from "react";

export type AlertVariant = "neutral" | "info" | "success" | "warning" | "danger";

// ─── Token maps ───────────────────────────────────────────────────────────────

const variantTokens: Record<AlertVariant, {
  border: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}> = {
  neutral: {
    border:   "border-[var(--neutral-300,#b3b3b3)]",
    icon:     "info",
    iconColor:"text-[var(--foreground-secondary,#666)]",
    iconBg:   "bg-[var(--neutral-100,#e6e6e6)]",
  },
  info: {
    border:   "border-[var(--accent,#1132ee)]",
    icon:     "info",
    iconColor:"text-[var(--accent,#1132ee)]",
    iconBg:   "bg-[var(--litmus-25,#f1f3fe)]",
  },
  success: {
    border:   "border-[var(--green-600,#3f8d43)]",
    icon:     "check_circle",
    iconColor:"text-[var(--green-600,#3f8d43)]",
    iconBg:   "bg-[var(--green-100,#dcefdd)]",
  },
  warning: {
    border:   "border-[var(--orange-500,#ff9900)]",
    icon:     "warning",
    iconColor:"text-[var(--orange-500,#ff9900)]",
    iconBg:   "bg-[var(--orange-100,#ffebcc)]",
  },
  danger: {
    border:   "border-[var(--foreground-semantic-danger,#bb1411)]",
    icon:     "error",
    iconColor:"text-[var(--foreground-semantic-danger,#bb1411)]",
    iconBg:   "bg-[var(--red-100,#fbd1d0)]",
  },
};

// ─── Icon chip — colored square background ────────────────────────────────────

function AlertIcon({ iconBg, iconColor, icon, size = 28 }: {
  iconBg: string; iconColor: string; icon: string; size?: number;
}) {
  const iconPx = Math.round(size * 0.57); // ~57% of container
  return (
    <div
      className={`flex items-center justify-center shrink-0 rounded-[6px] ${iconBg}`}
      style={{ width: size, height: size }}
    >
      <span
        className={`material-symbols-rounded ${iconColor}`}
        style={{ fontSize: iconPx, lineHeight: 1, fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
    </div>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────
// Optional dismiss (×) only — no inline action. Use Snackbar for action+dismiss.

export type AlertProps = {
  variant?: AlertVariant;
  title: string;
  body?: string;
  onDismiss?: () => void;
  className?: string;
};

export function Alert({
  variant = "neutral",
  title,
  body,
  onDismiss,
  className = "",
}: AlertProps) {
  const { border, icon, iconColor, iconBg } = variantTokens[variant];

  return (
    <div
      role="alert"
      className={[
        "flex items-start gap-[8px] rounded-[8px] border bg-white p-[8px]",
        border,
        className,
      ].join(" ")}
    >
      <AlertIcon iconBg={iconBg} iconColor={iconColor} icon={icon} />

      <div className="flex-1 min-w-0 mt-[4px]">
        <p className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">
          {title}
        </p>
        {body && (
          <p className="t-body-xs text-[var(--foreground-secondary,#666)] mt-[3px]">
            {body}
          </p>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex items-center justify-center w-[20px] h-[20px] shrink-0 mt-[4px] rounded-[4px] text-[var(--foreground-secondary,#666)] hover:text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors"
        >
          <span className="material-symbols-rounded" style={{ fontSize: 16, lineHeight: 1 }}>close</span>
        </button>
      )}
    </div>
  );
}

// ─── Notification ─────────────────────────────────────────────────────────────
// Alert with up to 2 CTA buttons stacked vertically on the right.
// No dismiss — use Snackbar if you also need an action + dismiss combo.

export type NotificationProps = {
  variant?: AlertVariant;
  title: string;
  body?: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
};

export function Notification({
  variant = "neutral",
  title,
  body,
  primaryAction,
  secondaryAction,
  className = "",
}: NotificationProps) {
  const { border } = variantTokens[variant];

  return (
    <div
      role="status"
      className={[
        "flex items-center gap-[8px] rounded-[8px] border bg-white p-[8px]",
        border,
        className,
      ].join(" ")}
    >
      {/* Text — fills remaining horizontal space */}
      <div className="flex-1 min-w-0">
        <p className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">
          {title}
        </p>
        {body && (
          <p className="t-body-xs text-[var(--foreground-secondary,#666)] mt-[3px]">
            {body}
          </p>
        )}
      </div>

      {/* CTA buttons — stacked vertically on the right side */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col items-stretch gap-[4px] shrink-0">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="h-[28px] px-[12px] rounded-[6px] t-title-sm bg-[var(--foreground-primary,#1a1a1a)] text-white hover:bg-[var(--neutral-800,#333)] transition-colors whitespace-nowrap"
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="h-[28px] px-[12px] rounded-[6px] t-title-sm border border-[var(--foreground-primary,#1a1a1a)] text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors whitespace-nowrap"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Snackbar — single-line, action + optional dismiss ────────────────────────

export type SnackbarProps = {
  variant?: AlertVariant;
  message: string;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
  className?: string;
};

export function Snackbar({
  variant = "neutral",
  message,
  action,
  onDismiss,
  className = "",
}: SnackbarProps) {
  const { border, icon, iconColor, iconBg } = variantTokens[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "inline-flex items-center gap-[8px] rounded-[8px] border bg-white p-[8px]",
        border,
        className,
      ].join(" ")}
    >
      {/* Smaller icon chip for single-line snackbar */}
      <div
        className={`flex items-center justify-center shrink-0 rounded-[4px] ${iconBg}`}
        style={{ width: 22, height: 22 }}
      >
        <span
          className={`material-symbols-rounded ${iconColor}`}
          style={{ fontSize: 13, lineHeight: 1, fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>

      <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)] flex-1">
        {message}
      </span>

      {action && (
        <button
          onClick={action.onClick}
          className="t-title-sm text-[var(--accent,#1132ee)] hover:underline shrink-0 ml-[4px]"
        >
          {action.label}
        </button>
      )}

      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex items-center justify-center w-[20px] h-[20px] shrink-0 rounded-[4px] text-[var(--foreground-secondary,#666)] hover:text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors ml-[2px]"
        >
          <span className="material-symbols-rounded" style={{ fontSize: 16, lineHeight: 1 }}>close</span>
        </button>
      )}
    </div>
  );
}
