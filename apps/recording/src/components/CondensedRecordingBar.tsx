import React from "react";
import { Icon } from "@ds/ui";
import { Waveform } from "./Waveform";

// The full recording interface condensed into a single bottom bar, shown
// when the user is on the Assistant/Previsit tab. Sits over the gradient
// below the drawer.
export function CondensedRecordingBar({ onEndVisit }: { onEndVisit?: () => void }) {
  return (
    <div className="flex w-full items-center justify-end gap-[8px] px-[20px] py-[16px]">
      {/* mic source */}
      <button className="flex h-[28px] shrink-0 items-center gap-[4px] rounded-[6px] px-[10px] py-[6px] text-white">
        <Icon name="mic" size={16} />
        <span className="font-['Lato'] text-[13px] font-bold leading-[1.2] tracking-[0.13px] whitespace-nowrap">
          iPhone Mic
        </span>
        <Icon name="arrow_drop_down" size={16} />
      </button>

      {/* compact waveform fills the middle */}
      <div className="flex h-[32px] min-w-px flex-1 items-center justify-center">
        <Waveform maxWidth={9999} height={32} minBarHeight={8} maxBarHeight={28} />
      </div>

      {/* pause + stop icon buttons */}
      <button className="flex size-[36px] shrink-0 items-center justify-center rounded-[6px] border border-white text-white">
        <Icon name="pause" size={20} filled />
      </button>
      <button
        onClick={onEndVisit}
        className="flex size-[36px] shrink-0 items-center justify-center rounded-[6px] border border-white text-white"
      >
        <Icon name="stop" size={20} filled />
      </button>
    </div>
  );
}
