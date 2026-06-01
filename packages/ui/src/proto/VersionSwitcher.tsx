import React, { useState, useRef, useEffect } from "react";

export type ScreenDef = {
  round: string;
  direction: string;
  component: React.ComponentType;
};

type Props = {
  screens: ScreenDef[];
  /** Default to this round on first load. Defaults to the last round. URL param ?round= takes precedence. */
  initialRound?: string;
  /** Default to this direction on first load. Defaults to first direction in the round. URL param ?direction= takes precedence. */
  initialDirection?: string;
};

function getInitialState(
  screens: ScreenDef[],
  initialRound?: string,
  initialDirection?: string,
): { round: string; direction: string } {
  const params = new URLSearchParams(window.location.search);
  const urlRound = params.get("round");
  const urlDirection = params.get("direction");

  const rounds = [...new Set(screens.map((s) => s.round))];
  const round =
    (urlRound && rounds.includes(urlRound) ? urlRound : null) ??
    initialRound ??
    rounds[rounds.length - 1];

  const directionsForRound = screens.filter((s) => s.round === round).map((s) => s.direction);
  const direction =
    (urlDirection && directionsForRound.includes(urlDirection) ? urlDirection : null) ??
    (initialDirection && directionsForRound.includes(initialDirection) ? initialDirection : null) ??
    directionsForRound[0];

  return { round, direction };
}

export function VersionSwitcher({ screens, initialRound, initialDirection }: Props) {
  const rounds = [...new Set(screens.map((s) => s.round))];
  const init = getInitialState(screens, initialRound, initialDirection);
  const [activeRound, setActiveRound] = useState(init.round);
  const [activeDirection, setActiveDirection] = useState(init.direction);

  // Keep URL in sync so any view is shareable
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("round", activeRound);
    params.set("direction", activeDirection);
    window.history.replaceState(null, "", "?" + params.toString());
  }, [activeRound, activeDirection]);

  const directionsForRound = screens.filter((s) => s.round === activeRound);

  const handleRoundClick = (round: string) => {
    setActiveRound(round);
    const first = screens.find((s) => s.round === round);
    setActiveDirection(first?.direction ?? "");
  };

  const active = screens.find(
    (s) => s.round === activeRound && s.direction === activeDirection
  );
  const ActiveScreen = active?.component ?? (() => null);

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragOffset = useRef<{ x: number; y: number } | null>(null);

  function onMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).tagName === "BUTTON") return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    function onMouseMove(ev: MouseEvent) {
      if (!dragOffset.current) return;
      setPos({ x: ev.clientX - dragOffset.current.x, y: ev.clientY - dragOffset.current.y });
    }
    function onMouseUp() {
      dragOffset.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  const floatStyle: React.CSSProperties = pos
    ? { position: "fixed", left: pos.x, top: pos.y, bottom: "auto", transform: "none" }
    : {};

  return (
    <div className="relative w-full h-full">
      <ActiveScreen />

      {/* Floating switcher */}
      <div
        onMouseDown={onMouseDown}
        style={floatStyle}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-[6px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[12px] shadow-lg px-[10px] py-[8px] select-none cursor-grab active:cursor-grabbing"
      >
        {/* Rounds */}
        <div className="flex items-center gap-[4px]">
          <span className="text-[11px] font-bold text-[#999] tracking-[0.5px] mr-[4px] shrink-0">Design Round</span>
          {rounds.map((round) => (
            <button
              key={round}
              onClick={() => handleRoundClick(round)}
              className={`h-[24px] px-[8px] rounded-[6px] text-[12px] font-bold tracking-[0.12px] transition-colors outline-none
                ${activeRound === round
                  ? "bg-[#1a1a1a] text-white"
                  : "text-[#666] hover:bg-[#f2f2f2]"
                }`}
              style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07'" }}
            >
              {round}
            </button>
          ))}
        </div>

        {/* Directions */}
        <div className="flex items-center gap-[4px]">
          <span className="text-[11px] font-bold text-[#999] tracking-[0.5px] mr-[4px] shrink-0">Direction</span>
          {directionsForRound.map((s) => (
            <button
              key={s.direction}
              onClick={() => setActiveDirection(s.direction)}
              className={`h-[24px] px-[8px] rounded-[6px] text-[12px] font-bold tracking-[0.12px] transition-colors outline-none
                ${activeDirection === s.direction
                  ? "bg-[#1132ee] text-white"
                  : "text-[#666] hover:bg-[#f2f2f2]"
                }`}
              style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07'" }}
            >
              {s.direction}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
