import React, { useState } from "react";
import { Icon } from "@ds/ui";
import { PrevisitContent } from "./PrevisitContent";

const SUGGESTIONS: { icon: string; label: string }[] = [
  { icon: "ink_highlighter", label: "What should I know before this visit?" },
  { icon: "chat_info", label: "Any risks or concerns I should be aware of?" },
  { icon: "fact_check", label: "What should I make sure to cover today?" },
  { icon: "trending_up", label: "Summarize trends in this patient's results." },
  { icon: "lightbulb", label: "Explain Carry Forward and how to use it." },
  { icon: "history", label: "Frequent question" },
  { icon: "history", label: "Recent question" },
];

const TABS = [
  { id: "assistant", label: "Assistant" },
  { id: "previsit", label: "Previsit" },
] as const;

type PanelTab = (typeof TABS)[number]["id"];

// The desktop split-screen copilot card: Assistant/Previsit tabs, a Collapse
// control, suggested questions, and the chat input.
export function AssistantPanel({ onCollapse }: { onCollapse: () => void }) {
  const [tab, setTab] = useState<PanelTab>("assistant");

  return (
    <div className="flex h-full w-full max-w-[640px] flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_4px_16px_2px_rgba(0,0,0,0.07)]">
      {/* Header: tabs + collapse */}
      <div className="flex items-center gap-[4px] px-[20px] pb-[8px] pt-[16px]">
        <div className="flex flex-1 items-center gap-[8px]">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-start px-[4px] py-[6px] ${
                  active ? "border-b-2 border-[var(--accent,#1132ee)]" : ""
                }`}
              >
                <span
                  className={`font-['Lato'] text-[13px] font-bold leading-[1.2] tracking-[0.13px] ${
                    active ? "text-[var(--accent,#1132ee)]" : "text-[#808080]"
                  }`}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={onCollapse}
          className="flex h-[28px] items-center gap-[4px] rounded-[6px] px-[10px] py-[6px] text-[var(--foreground-secondary,#666)]"
        >
          <span className="font-['Lato'] text-[13px] font-bold leading-[1.2] tracking-[0.13px]">
            Collapse
          </span>
          <Icon name="keyboard_double_arrow_down" size={16} />
        </button>
      </div>

      {/* Content + chat input */}
      <div className="flex min-h-px flex-1 flex-col gap-[8px] px-[20px] pb-[24px]">
        {tab === "assistant" ? (
          <>
            <div className="flex min-h-px flex-1 flex-col gap-[12px] overflow-y-auto py-[8px]">
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
          </>
        ) : (
          <div className="flex min-h-px flex-1 flex-col overflow-y-auto py-[8px]">
            <PrevisitContent />
          </div>
        )}
      </div>
    </div>
  );
}
