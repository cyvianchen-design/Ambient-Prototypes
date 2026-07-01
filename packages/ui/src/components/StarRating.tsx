import React, { useState } from "react";

export type StarRatingProps = {
  value: number; // 0–5, supports 0.5 increments for display
  onChange?: (value: number) => void;
  max?: number;
  size?: number; // px, default 24
  readOnly?: boolean;
  label?: string;
  className?: string;
};

export function StarRating({
  value,
  onChange,
  max = 5,
  size = 24,
  readOnly = false,
  label,
  className = "",
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);

  const display = hover ?? value;

  return (
    <div
      className={`flex flex-col gap-[4px] ${className}`}
      aria-label={label ?? `Rating: ${value} out of ${max}`}
    >
      {label && (
        <span className="t-body-xs text-[var(--foreground-secondary,#666)]">{label}</span>
      )}
      <div className="flex items-center gap-[2px]">
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1;
          const filled = display >= starValue;
          const half = !filled && display >= starValue - 0.5;

          return (
            <button
              key={i}
              type="button"
              disabled={readOnly}
              aria-label={`${starValue} star${starValue !== 1 ? "s" : ""}`}
              onClick={() => !readOnly && onChange?.(starValue)}
              onMouseEnter={() => !readOnly && setHover(starValue)}
              onMouseLeave={() => !readOnly && setHover(null)}
              className={[
                "flex items-center justify-center transition-transform",
                readOnly ? "cursor-default" : "cursor-pointer hover:scale-110",
              ].join(" ")}
              style={{ width: size, height: size }}
            >
              <span
                className="material-symbols-rounded"
                style={{
                  fontSize: size,
                  lineHeight: 1,
                  color: filled || half ? "var(--orange-400,#f59e0b)" : "var(--surface-3,#eee)",
                  fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {half ? "star_half" : "star"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
