import React from "react";
import { Icon } from "@ds/ui";

// Shared recording UI pieces used by both the baseline and multi-panel
// recording layouts.

export function PatientInfo() {
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

export function RecordingStatus({ time }: { time: string }) {
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

export function ControlButtons({ height, onEndVisit }: { height: number; onEndVisit?: () => void }) {
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
