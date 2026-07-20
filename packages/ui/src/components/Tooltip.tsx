import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export type TooltipPosition = "top" | "bottom" | "left" | "right";
export type TooltipVariant = "info" | "neutral";

export type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  delay?: number;
  disabled?: boolean;
};

const opposite: Record<TooltipPosition, TooltipPosition> = {
  top: "bottom", bottom: "top", left: "right", right: "left",
};

export function Tooltip({
  content,
  children,
  position = "bottom",
  variant = "neutral",
  delay = 300,
  disabled = false,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ position: "fixed", opacity: 0, pointerEvents: "none", zIndex: 300 });
  const [resolvedPos, setResolvedPos] = useState<TooltipPosition>(position);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reposition = useCallback((pos: TooltipPosition, trigger: DOMRect, tooltip: DOMRect | null) => {
    const GAP = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tw = tooltip?.width ?? 0;
    const th = tooltip?.height ?? 36;
    let finalPos = pos;
    let top = 0, left = 0;

    if (pos === "bottom") {
      top = trigger.bottom + GAP;
      left = trigger.left + trigger.width / 2 - tw / 2;
      if (tooltip && top + th > vh) { finalPos = "top"; top = trigger.top - GAP - th; }
    } else if (pos === "top") {
      top = trigger.top - GAP - th;
      left = trigger.left + trigger.width / 2 - tw / 2;
      if (tooltip && top < 0) { finalPos = "bottom"; top = trigger.bottom + GAP; }
    } else if (pos === "right") {
      left = trigger.right + GAP;
      top = trigger.top + trigger.height / 2 - th / 2;
      if (tooltip && left + tw > vw) { finalPos = "left"; left = trigger.left - GAP - tw; }
    } else {
      left = trigger.left - GAP - tw;
      top = trigger.top + trigger.height / 2 - th / 2;
      if (tooltip && left < 0) { finalPos = "right"; left = trigger.right + GAP; }
    }

    // Keep within viewport bounds
    left = Math.max(8, Math.min(left, vw - tw - 8));
    top  = Math.max(8, Math.min(top,  vh - th - 8));

    return { top, left, finalPos };
  }, []);

  const show = () => {
    if (disabled) return;
    timer.current = setTimeout(() => {
      if (!wrapperRef.current) return;
      const trigger = wrapperRef.current.getBoundingClientRect();
      const { top, left, finalPos } = reposition(position, trigger, null);
      setResolvedPos(finalPos);
      // Render invisible first so we can measure actual size
      setTooltipStyle({ position: "fixed", top, left, opacity: 0, pointerEvents: "none", zIndex: 300 });
      setVisible(true);
    }, delay);
  };

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(false);
    setResolvedPos(position);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // Second pass: measure actual tooltip size and finalize position + opacity
  useEffect(() => {
    if (!visible || !tooltipRef.current || !wrapperRef.current) return;
    const trigger = wrapperRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const { top, left, finalPos } = reposition(position, trigger, tooltip);
    setResolvedPos(finalPos);
    setTooltipStyle({ position: "fixed", top, left, opacity: 1, pointerEvents: "none", zIndex: 300 });
  }, [visible, position, reposition]);

  const isInfo = variant === "info";
  const bg = isInfo ? "#f1f3fe" : "#ffffff";
  const textColor = isInfo ? "var(--accent,#1132ee)" : "var(--foreground-primary,#1a1a1a)";
  const shadowClass = isInfo ? "" : "drop-shadow-[0px_0px_12px_rgba(0,0,0,0.15)]";

  const flexDir: Record<TooltipPosition, string> = {
    top: "flex-col items-center", bottom: "flex-col items-center",
    left: "flex-row items-center", right: "flex-row items-center",
  };

  const arrowCss: Record<TooltipPosition, React.CSSProperties> = {
    top:    { width: 0, height: 0, flexShrink: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `6px solid ${bg}` },
    bottom: { width: 0, height: 0, flexShrink: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: `6px solid ${bg}` },
    left:   { width: 0, height: 0, flexShrink: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderLeft: `6px solid ${bg}` },
    right:  { width: 0, height: 0, flexShrink: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: `6px solid ${bg}` },
  };

  // Arrow comes before the body when the tooltip body is "after" the trigger
  const arrowFirst = resolvedPos === "bottom" || resolvedPos === "right";

  return (
    <span
      ref={wrapperRef}
      className="inline-flex self-start"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && createPortal(
        <div ref={tooltipRef} role="tooltip" style={tooltipStyle} className={`flex ${flexDir[resolvedPos]} ${shadowClass}`}>
          {arrowFirst  && <span style={arrowCss[resolvedPos]} />}
          <span className="block px-[12px] py-[8px] rounded-[4px] t-title-sm whitespace-nowrap" style={{ backgroundColor: bg, color: textColor }}>
            {content}
          </span>
          {!arrowFirst && <span style={arrowCss[resolvedPos]} />}
        </div>,
        document.body
      )}
    </span>
  );
}
