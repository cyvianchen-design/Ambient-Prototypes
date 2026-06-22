import React, { useState } from "react";
import { Icon } from "@ds/ui";
import { GradientBackground } from "../components/GradientBackground";
import { Waveform } from "../components/Waveform";
import { useTimer } from "../hooks/useTimer";
import { useContainerWidth } from "../components/useContainerWidth";
import { AssistantPanel } from "../components/AssistantPanel";
import { PatientInfo, RecordingStatus, ControlButtons } from "../components/RecordingParts";
import { MobileRecording } from "../components/MobileRecording";

const MOBILE_MAX = 768; // below this, render the mobile layout

export default function R1Baseline({ onEndVisit }: { onEndVisit?: () => void }) {
  const time = useTimer(true);
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const isMobile = width > 0 && width < MOBILE_MAX;

  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      <GradientBackground />

      {isMobile ? (
        /* ---------------- Mobile layout ---------------- */
        <MobileRecording time={time} onEndVisit={onEndVisit} />
      ) : (
        /* ---------------- Desktop layout ---------------- */
        <div className="relative flex h-full w-full">
          {/* Top-right entry point — only when the panel is collapsed.
              Previsit/Assistant open as a split-screen panel rather than tabs. */}
          {!panelOpen && (
            <button
              onClick={() => setPanelOpen(true)}
              className="absolute right-[48px] top-[40px] z-10 flex h-[36px] items-center gap-[6px] rounded-[6px] px-[12px] py-[8px] text-white"
            >
              <Icon name="magic_button" size={20} />
              <span className="font-['Lato'] text-[15px] font-bold leading-[1.2] tracking-[0.15px]">
                Assistant &amp; Previsit
              </span>
            </button>
          )}

          {/* Recording column — full width when collapsed, exact left half when split */}
          <div
            className={`flex min-w-0 items-center justify-center ${
              panelOpen ? "w-1/2" : "flex-1"
            }`}
          >
            <div className="flex h-full max-h-[760px] w-[335px] flex-col items-center justify-center gap-[120px] py-[48px]">
              <div className="flex w-full flex-col items-center gap-[48px]">
                <PatientInfo />
                <RecordingStatus time={time} />
                <Waveform maxWidth={335} height={101} />
              </div>
              <ControlButtons height={52} onEndVisit={onEndVisit} />
            </div>
          </div>

          {/* Copilot panel — exact right half when split */}
          {panelOpen && (
            <div className="flex h-full w-1/2 min-w-0 items-start justify-center px-[20px] py-[24px]">
              <AssistantPanel onCollapse={() => setPanelOpen(false)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
