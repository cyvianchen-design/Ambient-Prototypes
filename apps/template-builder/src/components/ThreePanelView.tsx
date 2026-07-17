import React, { useEffect, useRef, useState } from "react";
import { Button, Checkbox, Icon, IconButton, Switch, Tabs, TextArea } from "@ds/ui";
import { SelectDropdown } from "./SelectDropdown";
import { StatusBadge } from "./StatusBadge";
import { DynamicPreviewSections } from "./LivePreviewPanel";
import {
  FORMAT_OPTIONS,
  INITIAL_SECTIONS,
  LENGTH_OPTIONS,
  MacroItem,
  Subsection,
  SubsectionStatus,
  TemplateSection,
  formatDescription,
  makeMacros,
  newSubsection,
} from "../templateData";

type Mode = "my" | "shared";

const STATUS_STYLES: Record<SubsectionStatus, { dot: string; label: string }> = {
  standard: { dot: "bg-[#3f8d43]", label: "Standard" },
  optional: { dot: "bg-[#c99a1e]", label: "Optional" },
  disabled: { dot: "bg-[#999]", label: "Disabled" },
};

// ── Outline column (jump nav + scroll-spy) ───────────────────────────────────

function OutlineRow({
  sub,
  active,
  isDragOver,
  onJump,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  sub: Subsection;
  active: boolean;
  isDragOver: boolean;
  onJump: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}) {
  const s = STATUS_STYLES[sub.status];
  return (
    <button
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDrop}
      onClick={onJump}
      className={`group w-full flex items-center gap-[8px] h-[34px] pl-[8px] pr-[8px] rounded-[8px] text-left transition-colors ${
        active ? "bg-[var(--litmus-25,#f1f3fe)]" : "hover:bg-[var(--surface-1,#f7f7f7)]"
      } ${isDragOver ? "ring-1 ring-[var(--accent,#1132ee)]" : ""}`}
    >
      <span className="shrink-0 text-[#ccc] group-hover:text-[#999] cursor-grab active:cursor-grabbing flex items-center">
        <Icon name="drag_indicator" size={14} />
      </span>
      <span className={`flex-1 min-w-0 truncate t-title-sm ${active ? "text-[var(--accent,#1132ee)]" : sub.status === "disabled" ? "text-[#999]" : "text-[var(--foreground-primary,#1a1a1a)]"}`} style={{ fontFeatureSettings: "'ss07'" }}>
        {sub.name}
      </span>
      <span className={`shrink-0 w-[6px] h-[6px] rounded-full ${s.dot} ${sub.status === "disabled" ? "opacity-60" : ""}`} />
    </button>
  );
}

// ── Macros ────────────────────────────────────────────────────────────────────

function MacrosBlock({ mode, initialCount }: { mode: Mode; initialCount: number }) {
  const [macros, setMacros] = useState<MacroItem[]>(() => makeMacros(initialCount));
  function toggle(id: string) { setMacros((p) => p.map((m) => m.id === id ? { ...m, enabled: !m.enabled } : m)); }
  function addMacro() { setMacros((p) => makeMacros(p.length + 1)); }

  return (
    <div className="flex flex-col gap-[8px]">
      {macros.length === 0 ? (
        mode === "my" ? (
          <Button variant="tertiary" size="small" prefix={<Icon name="add" size={14} />} className="self-start" onClick={addMacro}>
            Add Macro
          </Button>
        ) : (
          <p className="t-body-sm text-[var(--foreground-secondary,#666)]">No macros attached.</p>
        )
      ) : (
        <>
          {macros.map((m) => (
            <div key={m.id} className="border border-[rgba(0,0,0,0.1)] rounded-[6px] h-[32px] flex items-center gap-[16px] px-[8px] hover:bg-[#f7f7f7] transition-colors">
              <span className="flex-1 min-w-0 truncate t-body-sm text-[var(--foreground-primary,#1a1a1a)]">{m.name}</span>
              <Switch size="XS" checked={m.enabled} onChange={() => toggle(m.id)} />
            </div>
          ))}
          {mode === "my" && (
            <Button variant="tertiary" size="small" prefix={<Icon name="add" size={14} />} className="self-start" onClick={addMacro}>
              Add Macro
            </Button>
          )}
        </>
      )}
    </div>
  );
}

// ── Subsection card (all settings visible) ───────────────────────────────────

function SubsectionCard({
  mode,
  sub,
  onChange,
  onDelete,
  registerRef,
}: {
  mode: Mode;
  sub: Subsection;
  onChange: (s: Subsection) => void;
  onDelete: () => void;
  registerRef: (el: HTMLDivElement | null) => void;
}) {
  const [showInstructions, setShowInstructions] = useState(mode === "my");
  function update(p: Partial<Subsection>) { onChange({ ...sub, ...p }); }
  const statusOptions: SubsectionStatus[] = mode === "my" ? ["standard", "optional"] : ["standard", "optional", "disabled"];

  return (
    <div ref={registerRef} data-subid={sub.id} className="scroll-mt-[16px] flex flex-col gap-[16px]">
      {/* Header */}
      <div className="flex items-center gap-[12px]">
        <input
          className="flex-1 min-w-0 t-title-lg text-[var(--foreground-primary,#1a1a1a)] bg-transparent outline-none h-[36px] rounded-[8px] px-[10px] -ml-[10px] hover:bg-[#f2f2f2] focus:bg-white focus:ring-1 focus:ring-[var(--accent,#1132ee)]"
          value={sub.name}
          onChange={(e) => update({ name: e.target.value })}
        />
      </div>

      {/* ── Template instruction (what to capture + section behavior) ── */}
      <div className="flex flex-col gap-[10px] -mt-[8px]">
        <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">Template instruction</span>

        <div className="flex items-center gap-[12px]">
          <span className="w-[64px] shrink-0 t-title-sm text-[var(--foreground-secondary,#666)]">Behavior</span>
          <StatusBadge status={sub.status} options={statusOptions} onChange={(status) => update({ status })} />
        </div>

        {mode === "shared" && !showInstructions ? (
          <Button variant="tertiary" size="small" suffix={<Icon name="keyboard_arrow_down" size={16} />} className="self-start" onClick={() => setShowInstructions(true)}>
            Show template instruction
          </Button>
        ) : mode === "shared" ? (
          <div className="flex flex-col gap-[8px]">
            <p className="t-body-sm text-[var(--foreground-secondary,#666)] italic leading-[1.5]">{sub.templateInstruction || "No template instruction provided."}</p>
            <Button variant="tertiary" size="small" suffix={<Icon name="keyboard_arrow_up" size={16} />} className="self-start" onClick={() => setShowInstructions(false)}>
              Hide template instruction
            </Button>
          </div>
        ) : (
          <TextArea value={sub.templateInstruction} onChange={(v) => update({ templateInstruction: v })} rows={4} placeholder="Describe what this subsection should capture…" />
        )}
      </div>

      {/* ── Formatting (how it's presented) ── */}
      <div className="flex flex-col gap-[12px]">
        <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">Formatting</span>

        <div className="flex items-center gap-[12px]">
          <span className="w-[64px] shrink-0 t-title-sm text-[var(--foreground-secondary,#666)]">Format</span>
          <SelectDropdown value={sub.format} options={FORMAT_OPTIONS} onChange={(v) => update({ format: v })} width="w-[200px]" menuWidth={380} />
        </div>
        <div className="flex items-center gap-[12px]">
          <span className="w-[64px] shrink-0 t-title-sm text-[var(--foreground-secondary,#666)]">Length</span>
          <SelectDropdown value={sub.length} options={LENGTH_OPTIONS} onChange={(v) => update({ length: v })} width="w-[200px]" />
        </div>
        <div className="flex items-center gap-[12px]">
          <span className="w-[64px] shrink-0 t-title-sm text-[var(--foreground-secondary,#666)]">Title</span>
          <Switch checked={sub.showTitle} onChange={(v) => update({ showTitle: v })} />
          <span className="t-body-sm text-[var(--foreground-secondary,#666)]">{sub.showTitle ? "Show" : "Hide"}</span>
        </div>

        {/* Custom formatting — supplementary */}
        <div className="flex flex-col gap-[6px] pt-[4px]">
          <span className="t-title-sm text-[var(--foreground-secondary,#666)]">Custom formatting</span>
          <p className="t-body-xs text-[var(--foreground-secondary,#666)]">Anything the settings above don't cover — supplementary formatting instructions.</p>
          <TextArea value={sub.customFormatting} onChange={(v) => update({ customFormatting: v })} rows={3} maxRows={6} placeholder="e.g. bold abnormal values, group by laterality…" />
        </div>
      </div>

      {/* ── Macros + delete (same row) ── */}
      <div className="flex items-end justify-between gap-[16px]">
        <div className="flex flex-col gap-[8px] flex-1 min-w-0">
          <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">Macros</span>
          <MacrosBlock mode={mode} initialCount={sub.macroCount} />
        </div>
        {mode === "my" && (
          <Button variant="tertiary-danger" size="small" prefix={<Icon name="delete" size={16} />} onClick={onDelete} className="shrink-0">
            Delete subsection
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Assistant panel (always available, far right) ────────────────────────────
// Matches the assistant from the recording / previsit prototypes.

const ASSISTANT_SUGGESTIONS: { icon: string; label: string }[] = [
  { icon: "add", label: "Add a Vitals subsection to this template" },
  { icon: "swap_vert", label: "Reorder subsections by clinical priority" },
  { icon: "library_add", label: "Import a subsection from another template" },
  { icon: "ink_highlighter", label: "Tighten the HPI instruction to be more concise" },
  { icon: "tune", label: "Suggest formatting for the Physical Exam" },
];

function AssistantPanel() {
  return (
    <div className="w-[360px] shrink-0 h-full bg-white border-l border-[var(--shape-outline,rgba(0,0,0,0.1))] flex flex-col">
      {/* Header */}
      <div className="shrink-0 h-[56px] flex items-center px-[20px]">
        <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFeatureSettings: "'ss07'" }}>Assistant</span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-[8px] px-[20px] pb-[16px]">
        <div className="flex-1 min-h-0 overflow-y-auto py-[8px] flex flex-col gap-[12px]">
          <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFeatureSettings: "'ss07'" }}>Get Started</span>
          {ASSISTANT_SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              className="flex w-full items-center gap-[8px] rounded-[8px] bg-[var(--surface-2,#f2f2f2)] px-[12px] py-[10px] text-left hover:bg-[#eaeaea] transition-colors"
            >
              <span className="shrink-0 flex items-center text-[var(--foreground-primary,#1a1a1a)]"><Icon name={s.icon} size={16} /></span>
              <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)]">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Chat input */}
        <div className="shrink-0 flex min-h-[48px] w-full items-center gap-[4px] rounded-[6px] border border-[#8044ff] px-[12px] py-[8px]">
          <input
            placeholder="Ask assistant"
            className="min-w-px flex-1 bg-transparent font-['Lato'] text-[15px] leading-[1.4] tracking-[0.15px] text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[#808080] focus:outline-none"
          />
          <IconButton variant="tertiary" size="medium" aria-label="Voice input" icon={<Icon name="mic" size={20} filled />} />
          <IconButton variant="tertiary" size="medium" aria-label="Send" icon={<Icon name="send" size={20} filled />} />
        </div>
      </div>
    </div>
  );
}

// ── Main view ────────────────────────────────────────────────────────────────

export function ThreePanelView({ mode }: { mode: Mode }) {
  const templateName = "SOAP Note";
  const [sections, setSections] = useState<TemplateSection[]>(INITIAL_SECTIONS);
  const [activeId, setActiveId] = useState<string>(INITIAL_SECTIONS[0].subsections[0].id);
  const [centerTab, setCenterTab] = useState<string>("settings");
  const [drag, setDrag] = useState<{ sectionId: string; index: number } | null>(null);
  const [dragOver, setDragOver] = useState<{ sectionId: string; index: number } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isJumping = useRef(false);

  // Scroll-spy: highlight the outline row for whichever card is near the top.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isJumping.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = (visible[0].target as HTMLElement).dataset.subid;
          if (id) setActiveId(id);
        }
      },
      { root, rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );
    if (centerTab !== "settings") return;
    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections, centerTab]);

  function jumpTo(id: string) {
    setActiveId(id);
    isJumping.current = true;
    cardRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => { isJumping.current = false; }, 600);
  }

  function updateSub(updated: Subsection) {
    setSections((prev) => prev.map((sec) => ({
      ...sec,
      subsections: sec.subsections.map((s) => s.id === updated.id ? updated : s),
    })));
  }

  function deleteSub(sectionId: string, id: string) {
    setSections((prev) => prev.map((sec) => sec.id === sectionId ? { ...sec, subsections: sec.subsections.filter((s) => s.id !== id) } : sec));
  }

  function addSub(sectionId: string) {
    const sub = newSubsection();
    setSections((prev) => prev.map((sec) => sec.id === sectionId ? { ...sec, subsections: [...sec.subsections, sub] } : sec));
    window.setTimeout(() => jumpTo(sub.id), 50);
  }

  function handleDrop(sectionId: string, toIdx: number) {
    if (!drag || drag.sectionId !== sectionId) { setDrag(null); setDragOver(null); return; }
    setSections((prev) => prev.map((sec) => {
      if (sec.id !== sectionId) return sec;
      const items = [...sec.subsections];
      const [moved] = items.splice(drag.index, 1);
      items.splice(toIdx, 0, moved);
      return { ...sec, subsections: items };
    }));
    setDrag(null); setDragOver(null);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Middle panel */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Universal header bar: template name + tabs */}
        <div className="shrink-0 h-[56px] flex items-center gap-[24px] px-[24px]">
          <span className="t-title-md text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFeatureSettings: "'ss07'" }}>{templateName}</span>
          <Tabs
            variant="secondary"
            activeTab={centerTab}
            onTabChange={setCenterTab}
            tabs={[{ id: "settings", label: "Settings" }, { id: "preview", label: "Preview" }]}
          />
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 flex">
          {centerTab === "settings" ? (
            <>
              {/* Master list (drag & drop) — part of the settings page, on the right */}
              <div className="order-2 w-[200px] shrink-0 h-full overflow-y-auto py-[8px]">
                {sections.map((sec) => (
                  <div key={sec.id} className="mb-[8px]">
                    <div className="px-[16px] h-[28px] flex items-center">
                      <span className="t-title-xs text-[var(--foreground-secondary,#666)]">{sec.name}</span>
                    </div>
                    <div className="px-[8px] flex flex-col gap-[2px]">
                      {sec.subsections.map((sub, idx) => (
                        <OutlineRow
                          key={sub.id}
                          sub={sub}
                          active={sub.id === activeId}
                          isDragOver={!!dragOver && dragOver.sectionId === sec.id && dragOver.index === idx && !!drag && drag.index !== idx}
                          onJump={() => jumpTo(sub.id)}
                          onDragStart={() => setDrag({ sectionId: sec.id, index: idx })}
                          onDragOver={(e) => { e.preventDefault(); setDragOver({ sectionId: sec.id, index: idx }); }}
                          onDrop={() => handleDrop(sec.id, idx)}
                        />
                      ))}
                      {mode === "my" && (
                        <button
                          onClick={() => addSub(sec.id)}
                          className="w-full flex items-center gap-[8px] h-[30px] pl-[8px] rounded-[8px] text-left text-[var(--accent,#1132ee)] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors"
                        >
                          <Icon name="add" size={14} />
                          <span className="t-title-sm">Add subsection</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Editor */}
              <div ref={scrollRef} className="order-1 flex-1 min-w-0 overflow-y-auto">
                <div className="px-[24px] py-[24px] flex flex-col gap-[32px] max-w-[720px]">
                  {sections.map((sec) => (
                    <div key={sec.id} className="flex flex-col gap-[12px]">
                      <div className="flex items-center gap-[8px]">
                        <span className="t-title-lg text-[var(--foreground-primary,#1a1a1a)]">{sec.name}</span>
                      </div>
                      {sec.subsections.map((sub, i) => (
                        <React.Fragment key={sub.id}>
                          {i > 0 && <div className="h-px bg-[rgba(0,0,0,0.1)]" />}
                          <SubsectionCard
                            mode={mode}
                            sub={sub}
                            onChange={updateSub}
                            onDelete={() => deleteSub(sec.id, sub.id)}
                            registerRef={(el) => { if (el) cardRefs.current.set(sub.id, el); else cardRefs.current.delete(sub.id); }}
                          />
                        </React.Fragment>
                      ))}
                      {mode === "my" && (
                        <Button variant="tertiary" size="small" prefix={<Icon name="add" size={14} />} className="self-start" onClick={() => addSub(sec.id)}>
                          Add subsection
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Preview replaces the whole body (master list + settings) */
            <div className="flex-1 min-w-0 overflow-y-auto px-[24px] py-[24px]">
              <div className="max-w-[720px]">
                <DynamicPreviewSections sections={sections} />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Save bar across the middle panel */}
        <div className="shrink-0 px-[24px] py-[12px] flex justify-end bg-white">
          <Button variant="primary" size="medium" prefix={<Icon name="save" size={18} />}>
            Save Template
          </Button>
        </div>
      </div>

      {/* Assistant — always available, far right */}
      <AssistantPanel />
    </div>
  );
}
