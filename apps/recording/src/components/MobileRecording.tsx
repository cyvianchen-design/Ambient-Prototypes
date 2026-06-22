import React, { useRef, useState } from "react";
import { Waveform } from "./Waveform";
import { CondensedRecordingBar } from "./CondensedRecordingBar";
import { AssistantDrawer, type DrawerTab } from "./AssistantDrawer";
import { PatientInfo, RecordingStatus, ControlButtons } from "./RecordingParts";

const TABS: { id: DrawerTab; label: string }[] = [
  { id: "recording", label: "Recording" },
  { id: "previsit", label: "Previsit" },
  { id: "assistant", label: "Assistant" },
];

// Height reserved at the bottom for the condensed recording bar.
const BAR_REGION_H = 72;

// The mobile (<768px) recording experience — tabs + full recording, or the
// condensed bar + Assistant/Previsit drawer. Shared by the baseline and
// multi-panel directions (mobile is identical across both).
export function MobileRecording({ time, onEndVisit }: { time: string; onEndVisit?: () => void }) {
  const [tab, setTab] = useState<DrawerTab>("recording");
  const [inputValue, setInputValue] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const assistantOpen = tab !== "recording";

  if (assistantOpen) {
    return (
      <div className="relative h-full w-full">
        {!inputFocused && (
          <div className="absolute inset-x-0 bottom-0">
            <CondensedRecordingBar onEndVisit={onEndVisit} />
          </div>
        )}
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
    );
  }

  return (
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
  );
}
