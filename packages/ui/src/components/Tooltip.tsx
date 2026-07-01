import React, { useState, useRef, useEffect } from "react";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: TooltipPosition;
  delay?: number; // ms, default 300
  disabled?: boolean;
};

export function Tooltip({ content, children, position = "top", delay = 300, disabled = false }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (disabled) return;
    timer.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(false);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const posStyles: Record<TooltipPosition, { container: string; arrow: string }> = {
    top: {
      container: "bottom-full left-1/2 -translate-x-1/2 mb-[6px]",
      arrow: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-[var(--foreground-primary,#1a1a1a)]",
    },
    bottom: {
      container: "top-full left-1/2 -translate-x-1/2 mt-[6px]",
      arrow: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-[var(--foreground-primary,#1a1a1a)]",
    },
    left: {
      container: "right-full top-1/2 -translate-y-1/2 mr-[6px]",
      arrow: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-[var(--foreground-primary,#1a1a1a)]",
    },
    right: {
      container: "left-full top-1/2 -translate-y-1/2 ml-[6px]",
      arrow: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-[var(--foreground-primary,#1a1a1a)]",
    },
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={`absolute z-[300] pointer-events-none ${posStyles[position].container}`}
        >
          <span className="block px-[8px] py-[5px] rounded-[6px] bg-[var(--foreground-primary,#1a1a1a)] text-white t-body-xs whitespace-nowrap shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
            {content}
          </span>
          <span
            className={`absolute w-0 h-0 border-[5px] border-solid ${posStyles[position].arrow}`}
          />
        </span>
      )}
    </span>
  );
}
