import React, { useEffect, useRef, useState } from "react";
import { useContainerWidth } from "./useContainerWidth";

const BAR_WIDTH = 5;
const GAP = 6;
const PITCH = BAR_WIDTH + GAP; // 11px per bar
const STEP_MS = 90; // how often a new bar enters from the right

// A continuous right-to-left scrolling waveform. New bars with random
// heights enter from the right edge; the whole strip translates left by one
// pitch each step, then resets and drops the leftmost bar — giving a seamless
// scroll without unbounded growth.
//
// The component fills its container width (capped at `maxWidth`) and adapts
// the number of bars to whatever width it's rendered at, so on phones
// narrower than the max it shrinks to fit instead of overflowing.
export function Waveform({
  maxWidth = 335,
  height = 101,
  minBarHeight = 8,
  maxBarHeight = 86,
}: {
  maxWidth?: number;
  height?: number;
  minBarHeight?: number;
  maxBarHeight?: number;
}) {
  const randomHeight = () =>
    Math.round(minBarHeight + Math.random() * (maxBarHeight - minBarHeight));
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  // enough bars to cover the visible width plus one off-screen on each side
  const visibleCount = width > 0 ? Math.ceil(width / PITCH) + 2 : 0;

  const [bars, setBars] = useState<number[]>([]);
  const [offset, setOffset] = useState(0);
  const barsRef = useRef(bars);
  barsRef.current = bars;

  // keep the bar array sized to the current width
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
    if (visibleCount === 0) return;
    let raf = 0;
    let last = performance.now();
    let shift = 0;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      shift += (dt / STEP_MS) * PITCH;
      // consume whole pitches — guard against large dt (e.g. tab throttling)
      if (shift >= PITCH) {
        const steps = Math.floor(shift / PITCH);
        shift -= steps * PITCH; // always drain the full amount so offset stays bounded
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
  }, [visibleCount]);

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ maxWidth, height }}
      aria-hidden
    >
      <div
        className="absolute left-0 top-1/2 flex items-center"
        style={{ gap: GAP, transform: `translate(${offset}px, -50%)` }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            className="shrink-0 rounded-full bg-white"
            style={{ width: BAR_WIDTH, height: h }}
          />
        ))}
      </div>
    </div>
  );
}
