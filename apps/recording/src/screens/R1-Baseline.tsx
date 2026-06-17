import React, { useRef, useState } from "react";
import { Icon } from "@ds/ui";
import { GradientBackground } from "../components/GradientBackground";
import { Waveform } from "../components/Waveform";
import { useTimer } from "../hooks/useTimer";
import { useContainerWidth } from "../components/useContainerWidth";
import { CondensedRecordingBar } from "../components/CondensedRecordingBar";
import { AssistantDrawer, type DrawerTab } from "../components/AssistantDrawer";
import { AssistantPanel } from "../components/AssistantPanel";

const MOBILE_MAX = 768; // below this, render the mobile layout
const TABS: { id: DrawerTab; label: string }[] = [
  { id: "recording", label: "Recording" },
  { id: "previsit", label: "Previsit" },
  { id: "assistant", label: "Assistant" },
];

// Height reserved at the bottom for the condensed recording bar.
const BAR_REGION_H = 72;

function PatientInfo() {
  return (
    <div className="flex flex-col items-center gap-[8px]">
      <div className="flex h-[28px] items-center gap-[8px]">
        <span className="font-['Lato'] text-[17px] font-bold leading-[1.2] tracking-[0.34px] text-white">
          John Doe
        </span>
        <button className="flex size-[28px] items-center justify-center rounded-[6px] text-white">
          <Icon name="edit" size={16} />
        </button>
      </div>
      <div className="flex items-center gap-[4px] font-['Lato'] text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-white">
        <span>SOAP Note</span>
        <span>·</span>
        <span>Virtual</span>
      </div>
    </div>
  );
}

function RecordingStatus({ time }: { time: string }) {
  return (
    <div className="flex flex-col items-center gap-[20px]">
      <span className="font-['Lato'] text-[17px] font-bold leading-[1.2] tracking-[0.34px] text-white">
        Recording
      </span>
      <span
        className="font-['Lato'] text-[44px] font-bold leading-[1.1] tracking-[0.44px] text-white tabular-nums"
        style={{ fontFeatureSettings: '"ss07" 1' }}
      >
        {time}
      </span>
      <button className="flex h-[28px] items-center gap-[4px] rounded-[6px] px-[10px] py-[6px] text-white">
        <Icon name="mic" size={16} />
        <span className="font-['Lato'] text-[13px] font-bold leading-[1.2] tracking-[0.13px]">
          Macbook Mic
        </span>
        <Icon name="arrow_drop_down" size={16} />
      </button>
    </div>
  );
}

function ControlButtons({ height, onEndVisit }: { height: number; onEndVisit?: () => void }) {
  return (
    <div className="flex w-full max-w-[335px] flex-col items-center gap-[8px]">
      <button
        className="flex w-full items-center justify-center gap-[8px] rounded-[6px] border border-white text-white"
        style={{ height }}
      >
        <Icon name="pause" size={24} filled />
        <span className="font-['Lato'] text-[17px] font-bold leading-[1.2] tracking-[0.34px]">
          Pause Recording
        </span>
      </button>
      <button
        onClick={onEndVisit}
        className="flex w-full items-center justify-center gap-[8px] rounded-[6px] bg-white text-[var(--foreground-primary,#1a1a1a)]"
        style={{ height }}
      >
        <Icon name="stop" size={24} filled />
        <span className="font-['Lato'] text-[17px] font-bold leading-[1.2] tracking-[0.34px]">
          End Visit
        </span>
      </button>
    </div>
  );
}

export default function R1Baseline({ onEndVisit }: { onEndVisit?: () => void }) {
  const time = useTimer(true);
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const isMobile = width > 0 && width < MOBILE_MAX;

  const [tab, setTab] = useState<DrawerTab>("recording");
  const [inputValue, setInputValue] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const assistantOpen = tab !== "recording";

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      <GradientBackground />

      {isMobile ? (
        /* ---------------- Mobile layout ---------------- */
        assistantOpen ? (
          /* Assistant / Previsit: condensed recording bar + drawer */
          <div className="relative h-full w-full">
            {/* condensed recording bar over the gradient — hidden once the
                input is focused so the real keyboard takes the space */}
            {!inputFocused && (
              <div className="absolute inset-x-0 bottom-0">
                <CondensedRecordingBar onEndVisit={onEndVisit} />
              </div>
            )}

            {/* drawer — fills to the bottom when the input is focused so its
                chat input sits at the very bottom, just above the real
                keyboard (the viewport resizes the content) */}
            <div
              className="absolute inset-x-0 top-0"
              style={{ bottom: inputFocused ? 0 : BAR_REGION_H }}
            >
              <AssistantDrawer
                activeTab={tab}
                onTabChange={setTab}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onInputFocus={() => setInputFocused(true)}
                onInputBlur={() => setInputFocused(false)}
                inputRef={inputRef}
              />
            </div>
          </div>
        ) : (
          /* Recording: full interface */
          <div className="relative flex h-full w-full flex-col">
            <div className="flex items-center border-b border-white/10 px-[20px] pt-[12px]">
              <div className="flex items-center gap-[8px]">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-start px-[4px] py-[6px] ${
                      t.id === tab ? "border-b-2 border-white" : ""
                    }`}
                  >
                    <span
                      className={`font-['Lato'] text-[13px] font-bold leading-[1.2] tracking-[0.13px] ${
                        t.id === tab ? "text-white" : "text-white/70"
                      }`}
                    >
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center px-[20px] pb-[48px]">
              <div className="flex w-full max-w-[335px] flex-col items-center gap-[48px]">
                <PatientInfo />
                <RecordingStatus time={time} />
                <Waveform maxWidth={335} height={101} />
              </div>
            </div>

            <div className="flex w-full flex-col items-center px-[20px] pb-[24px] pt-[8px]">
              <ControlButtons height={48} onEndVisit={onEndVisit} />
            </div>
          </div>
        )
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
