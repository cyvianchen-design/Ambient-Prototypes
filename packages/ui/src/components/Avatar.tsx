import React from "react";

export type AvatarSize = "XS" | "S" | "M" | "L" | "XL";
export type AvatarStatus = "online" | "busy" | "away" | "offline";

const sizeConfig: Record<AvatarSize, { px: number; text: string; statusPx: number }> = {
  XS: { px: 20, text: "text-[9px]",    statusPx: 6  },
  S:  { px: 24, text: "text-[10px]",   statusPx: 7  },
  M:  { px: 32, text: "t-title-sm",    statusPx: 9  },
  L:  { px: 40, text: "t-title-md",    statusPx: 10 },
  XL: { px: 48, text: "t-title-lg",    statusPx: 12 },
};

const statusColor: Record<AvatarStatus, string> = {
  online:  "bg-[var(--foreground-semantic-success,#3f8d43)]",
  busy:    "bg-[var(--foreground-semantic-danger,#bb1411)]",
  away:    "bg-[var(--foreground-semantic-warning,#cc7a00)]",
  offline: "bg-[var(--foreground-secondary,#666)]",
};

// Deterministic background color from name — always uses --foreground-primary text
const BG_COLORS = [
  "bg-[var(--orange-100,#ffebcc)]",
  "bg-[var(--blue-100,#d1e6fa)]",
  "bg-[var(--red-100,#fbd1d0)]",
  "bg-[var(--purple-100,#e2daef)]",
  "bg-[var(--litmus-100,#cfd6fc)]",
  "bg-[var(--green-100,#dcefdd)]",
  "bg-[var(--cyan-100,#d9f2f7)]",
];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return BG_COLORS[Math.abs(hash) % BG_COLORS.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export type AvatarProps = {
  name: string;
  src?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
};

export function Avatar({
  name,
  src,
  size = "M",
  status,
  className = "",
}: AvatarProps) {
  const { px, text, statusPx } = sizeConfig[size];
  const color = colorForName(name);

  return (
    <div
      className={`relative inline-flex shrink-0 ${className}`}
      style={{ width: px, height: px }}
      title={name}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div
          className={`w-full h-full rounded-full flex items-center justify-center leading-none select-none text-[var(--foreground-primary,#1a1a1a)] ${color} ${text}`}
        >
          {initials(name)}
        </div>
      )}

      {status && (
        <span
          className={`absolute top-0 right-0 rounded-full border-[1.5px] border-white ${statusColor[status]}`}
          style={{ width: statusPx, height: statusPx }}
          aria-label={status}
        />
      )}
    </div>
  );
}
