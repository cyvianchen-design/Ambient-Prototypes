import React, { useRef, useState } from "react";
import { Icon, ButtonGroup } from "@ds/ui";
import { GradientBackground } from "../components/GradientBackground";
import { Waveform } from "../components/Waveform";
import { useTimer } from "../hooks/useTimer";
import { useContainerWidth } from "../components/useContainerWidth";
import { RecordingStatus, ControlButtons } from "../components/RecordingParts";
import { MobileRecording } from "../components/MobileRecording";
import { PanelCard } from "../components/PanelCard";
import { PrevisitContent } from "../components/PrevisitContent";

const MOBILE_MAX = 768; // below this → mobile
const TWO_PANEL_MIN = 1024; // at/above this → up to 2 side panels; 768–1023 → 1

type PanelId = "previsit" | "assistant";
const PANEL_ORDER: PanelId[] = ["previsit", "assistant"];

const SUGGESTIONS: { icon: string; label: string }[] = [
  { icon: "ink_highlighter", label: "What should I know before this visit?" },
  { icon: "chat_info", label: "Any risks or concerns I should be aware of?" },
  { icon: "fact_check", label: "What should I make sure to cover today?" },
  { icon: "trending_up", label: "Summarize trends in this patient's results." },
  { icon: "lightbulb", label: "Explain Carry Forward and how to use it." },
  { icon: "history", label: "Frequent question" },
  { icon: "history", label: "Recent question" },
];

function TopBarPatientInfo() {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-[16px]">
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

function ChatInput() {
  return (
    <div className="flex min-h-[48px] w-full items-center gap-[4px] rounded-[6px] border border-[#8044ff] px-[12px] py-[8px]">
      <input
        placeholder="Ask assistant"
        className="min-w-px flex-1 bg-transparent font-['Lato'] text-[15px] leading-[1.4] tracking-[0.15px] text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[#808080] focus:outline-none"
      />
      <button className="flex size-[36px] items-center justify-center rounded-[6px] text-[var(--foreground-primary,#1a1a1a)]">
        <Icon name="mic" size={20} />
      </button>
      <button className="flex size-[36px] items-center justify-center rounded-[6px] text-[var(--accent,#1132ee)]">
        <Icon name="send" size={20} />
      </button>
    </div>
  );
}

function AssistantBody() {
  return (
    <div className="flex flex-col gap-[12px]">
      <span className="font-['Lato'] text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)]">
        Get Started
      </span>
      {SUGGESTIONS.map((s, i) => (
        <button
          key={i}
          className="flex h-[28px] shrink-0 items-center gap-[8px] self-start rounded-[8px] bg-[var(--surface-2,#f2f2f2)] px-[8px]"
        >
          <Icon name={s.icon} size={16} />
          <span className="font-['Lato'] text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">
            {s.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function MultiPanelRecording({ onEndVisit }: { onEndVisit?: () => void }) {
  const time = useTimer(true);
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const isMobile = width > 0 && width < MOBILE_MAX;
  const maxPanels = width >= TWO_PANEL_MIN ? 2 : 1;

  const [openPanels, setOpenPanels] = useState<PanelId[]>([]);
  // most-recently-opened panels win when the breakpoint allows fewer
  const visible = openPanels.slice(-maxPanels);
  const orderedVisible = PANEL_ORDER.filter((p) => visible.includes(p));

  const togglePanel = (id: PanelId) => {
    setOpenPanels((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Resizable columns: each visible column has a flex-grow weight; dragging a
  // divider transfers weight between the two adjacent columns.
  const cols: string[] = ["recording", ...orderedVisible];
  const rowRef = useRef<HTMLDivElement>(null);
  const [weights, setWeights] = useState<Record<string, number>>({
    recording: 1,
    previsit: 1,
    assistant: 1,
  });

  const startResize = (leftId: string, rightId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const totalG = cols.reduce((s, id) => s + weights[id], 0);
    const W = rowRef.current?.getBoundingClientRect().width ?? 1;
    const lw = weights[leftId];
    const rw = weights[rightId];
    const MIN = 0.3; // minimum grow weight per column
    const onMove = (ev: MouseEvent) => {
      let delta = ((ev.clientX - startX) / W) * totalG;
      delta = Math.max(MIN - lw, Math.min(rw - MIN, delta)); // clamp both sides
      setWeights((p) => ({ ...p, [leftId]: lw + delta, [rightId]: rw - delta }));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const renderColumn = (id: string) => {
    if (id === "recording") {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-[120px]">
          <div className="flex w-full max-w-[335px] flex-col items-center gap-[48px]">
            <RecordingStatus time={time} />
            <Waveform maxWidth={335} height={101} />
          </div>
          <ControlButtons height={52} onEndVisit={onEndVisit} />
        </div>
      );
    }
    if (id === "previsit") {
      return (
        <PanelCard icon="clinical_notes" title="Previsit Summary" onClose={() => togglePanel("previsit")}>
          <PrevisitContent />
        </PanelCard>
      );
    }
    return (
      <PanelCard icon="magic_button" title="Assistant" onClose={() => togglePanel("assistant")} footer={<ChatInput />}>
        <AssistantBody />
      </PanelCard>
    );
  };

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      <GradientBackground />

      {isMobile ? (
        <MobileRecording time={time} onEndVisit={onEndVisit} />
      ) : (
        <div className="relative flex h-full w-full flex-col">
          {/* Top bar: patient info + Previsit/Assistant toggle */}
          <div className="flex h-[48px] shrink-0 items-center px-[20px] py-[16px]">
            <TopBarPatientInfo />
            <ButtonGroup
              multiSelect
              theme="inverse"
              size="small"
              value={orderedVisible}
              onChange={(v) => togglePanel(v as PanelId)}
              items={[
                { label: "Previsit", value: "previsit" },
                { label: "Assistant", value: "assistant" },
              ]}
            />
          </div>

          {/* Content row: recording column + open panels, with resizable dividers */}
          <div ref={rowRef} className="flex min-h-px flex-1 items-stretch px-[20px] pb-[20px]">
            {cols.map((id, i) => (
              <React.Fragment key={id}>
                {/* divider acts as the inter-column gap + drag handle */}
                {i > 0 && (
                  <div
                    onMouseDown={startResize(cols[i - 1], id)}
                    className="group flex w-[20px] shrink-0 cursor-col-resize items-center justify-center"
                  >
                    <div className="h-[40px] w-[3px] rounded-full bg-white/0 transition-colors group-hover:bg-white/40" />
                  </div>
                )}
                <div
                  className="min-w-0"
                  style={{ flexGrow: weights[id], flexBasis: 0, minWidth: 320 }}
                >
                  {renderColumn(id)}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
