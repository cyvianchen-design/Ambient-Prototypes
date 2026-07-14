import React, { useEffect, useRef, useState } from "react";
import { useContainerWidth } from "./useContainerWidth";

const BAR_WIDTH = 5;
const GAP = 6;
const PITCH = BAR_WIDTH + GAP;
const STEP_MS = 90;

// Continuous right-to-left scrolling waveform (matches the recording prototype).
// New random-height bars enter from the right; the strip translates left one
// pitch per step, dropping the leftmost bar. Pauses (freezes) when active=false.
export function Waveform({
  maxWidth = 335,
  height = 101,
  minBarHeight = 8,
  maxBarHeight = 86,
  active = true,
}: {
  maxWidth?: number;
  height?: number;
  minBarHeight?: number;
  maxBarHeight?: number;
  active?: boolean;
}) {
  const randomHeight = () =>
    Math.round(minBarHeight + Math.random() * (maxBarHeight - minBarHeight));
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const visibleCount = width > 0 ? Math.ceil(width / PITCH) + 2 : 0;

  const [bars, setBars] = useState<number[]>([]);
  const [offset, setOffset] = useState(0);
  const barsRef = useRef(bars);
  barsRef.current = bars;

  useEffect(() => {
    if (visibleCount === 0) return;
    setBars((prev) => {
      if (prev.length === visibleCount) return prev;
      if (prev.length < visibleCount) {
        return [
          ...Array.from({ length: visibleCount - prev.length }, randomHeight),
          ...prev,
        ];
      }
      return prev.slice(prev.length - visibleCount);
    });
  }, [visibleCount]);

  useEffect(() => {
    if (visibleCount === 0 || !active) return;
    let raf = 0;
    let last = performance.now();
    let shift = 0;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      shift += (dt / STEP_MS) * PITCH;
      if (shift >= PITCH) {
        const steps = Math.floor(shift / PITCH);
        shift -= steps * PITCH;
        const drop = Math.min(steps, barsRef.current.length);
        const next = barsRef.current.slice(drop);
        for (let i = 0; i < drop; i++) next.push(randomHeight());
        setBars(next);
      }
      setOffset(-shift);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visibleCount, active]);

  return (
    <div ref={ref} className="relative w-full overflow-hidden" style={{ maxWidth, height }} aria-hidden>
      <div
        className="absolute left-0 top-1/2 flex items-center"
        style={{ gap: GAP, transform: `translate(${offset}px, -50%)`, opacity: active ? 1 : 0.4 }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            className="shrink-0 rounded-full bg-white"
            style={{ width: BAR_WIDTH, height: active ? h : 4 }}
          />
        ))}
      </div>
    </div>
  );
}
