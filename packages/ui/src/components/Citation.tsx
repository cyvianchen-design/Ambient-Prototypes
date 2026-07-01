import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "./Link";

export interface CitationProps {
  n: number;
  quote: string;
  source: string;
  href?: string;
}

const CARD_W = 260;
const CARD_EST_H = 160;
const GAP = 6;

export function Citation({ n, quote, source, href = "#" }: CitationProps) {
  const [visible, setVisible] = useState(false);
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLSpanElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = setTimeout(() => setVisible(false), 80);
  }, [cancelHide]);

  const show = useCallback(() => {
    cancelHide();
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Vertical: below by default; flip above if not enough space.
    // When above, anchor card's bottom edge to trigger top so height doesn't matter.
    const spaceBelow = vh - r.bottom - GAP;
    const vertStyle: React.CSSProperties =
      spaceBelow >= CARD_EST_H
        ? { top: r.bottom + GAP, bottom: "auto" }
        : { top: "auto", bottom: vh - r.top + GAP };

    // Horizontal: left-align to trigger by default; flip if card overflows right edge.
    let left = r.left;
    if (left + CARD_W > vw - 8) left = r.right - CARD_W;
    left = Math.max(8, left);

    setCardStyle({ ...vertStyle, left });
    setVisible(true);
  }, [cancelHide]);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  return (
    <span className="inline-block">
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
        className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-[2px] bg-[var(--litmus-25,#f1f3fe)] text-[10px] font-bold leading-[1.2] tracking-[0.1px] text-[var(--accent,#1132ee)] mx-[2px] cursor-default align-middle select-none"
        style={{ fontFeatureSettings: "'ss07' 1", fontFamily: "Lato, sans-serif" }}
      >
        {n}
      </span>
      {visible && createPortal(
        <div
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
          className="fixed z-[140] w-[260px] rounded-[8px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-[12px] text-left"
          style={{ ...cardStyle, fontFamily: "Lato, sans-serif" }}
        >
          <p className="t-title-xs text-[var(--foreground-secondary,#666)] mb-[6px]">Citation</p>
          <p className="t-body-sm text-[var(--foreground-primary,#1a1a1a)] mb-[8px]">"{quote}"</p>
          <Link href={href} size="xsmall" intent="neutral">{source}</Link>
        </div>,
        document.body
      )}
    </span>
  );
}
