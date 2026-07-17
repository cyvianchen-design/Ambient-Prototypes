import React, { useRef, useState } from "react";
import { Button, Checkbox, Icon, IconButton, Switch, TextArea } from "@ds/ui";
import { SelectDropdown } from "./SelectDropdown";
import { StatusBadge } from "./StatusBadge";
import { LivePreviewPanel } from "./LivePreviewPanel";
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

function MacrosBlock({ mode, initialCount }: { mode: Mode; initialCount: number }) {
  const [macros, setMacros] = useState<MacroItem[]>(() => makeMacros(initialCount));
  function toggle(id: string) { setMacros((p) => p.map((m) => m.id === id ? { ...m, enabled: !m.enabled } : m)); }
  function addMacro() { setMacros((p) => makeMacros(p.length + 1)); }

  return (
    <div className="flex flex-col gap-[8px]">
      {macros.length === 0 ? (
        <p className="t-body-sm text-[var(--foreground-secondary,#666)]">No macros attached.</p>
      ) : (
        macros.map((m) => (
          <div key={m.id} className="border border-[rgba(0,0,0,0.1)] rounded-[6px] h-[32px] flex items-center gap-[16px] px-[8px] hover:bg-[#f7f7f7] transition-colors">
            <span className="flex-1 min-w-0 truncate t-body-sm text-[var(--foreground-primary,#1a1a1a)]">{m.name}</span>
            <Switch size="XS" checked={m.enabled} onChange={() => toggle(m.id)} />
          </div>
        ))
      )}
      {mode === "my" && (
        <Button variant="tertiary" size="small" prefix={<Icon name="add" size={14} />} className="self-start" onClick={addMacro}>
          Add Macro
        </Button>
      )}
    </div>
  );
}

// ── Subsection row ────────────────────────────────────────────────────────────

function SummaryRow({
  mode,
  sub,
  isDragOver,
  onChange,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  mode: Mode;
  sub: Subsection;
  isDragOver: boolean;
  onChange: (s: Subsection) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [showInstructions, setShowInstructions] = useState(mode === "my");
  const titleRef = useRef<HTMLInputElement>(null);
  function update(p: Partial<Subsection>) { onChange({ ...sub, ...p }); }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDrop}
      className={`bg-white border rounded-[8px] w-full transition-colors ${isDragOver ? "border-[var(--accent,#1132ee)] border-t-2" : "border-[rgba(0,0,0,0.1)]"}`}
    >
      {/* Collapsed header — baseline-style: name, quick chips, title, status */}
      <div className="flex items-center gap-[8px] h-[44px] pl-[8px] pr-[8px]">
        <span className="shrink-0 text-[#ccc] hover:text-[#999] cursor-grab active:cursor-grabbing flex items-center">
          <Icon name="drag_indicator" size={16} />
        </span>
        {editingTitle ? (
          <input
            ref={titleRef}
            autoFocus
            className="flex-1 min-w-0 border border-[#ccc] rounded-[6px] h-[28px] px-[8px] t-title-sm text-[var(--foreground-primary,#1a1a1a)] outline-none focus:border-[var(--accent,#1132ee)]"
            value={sub.name}
            onChange={(e) => update({ name: e.target.value })}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditingTitle(false); }}
          />
        ) : (
          <button
            className="flex-1 min-w-0 text-left truncate t-title-sm text-[var(--foreground-primary,#1a1a1a)] h-[28px] px-[8px] -ml-[8px] rounded-[6px] hover:bg-[#f2f2f2] transition-colors"
            style={{ fontFeatureSettings: "'ss07'" }}
            onClick={() => { setEditingTitle(true); setTimeout(() => titleRef.current?.select(), 0); }}
            title="Click to rename"
          >
            {sub.name}
          </button>
        )}

        {/* Quick format/length chips (collapsed only) */}
        {!expanded && (
          <div className="flex items-center gap-[4px] shrink-0" onClick={(e) => e.stopPropagation()}>
            <SelectDropdown value={sub.format} options={FORMAT_OPTIONS} onChange={(v) => update({ format: v })} variant="chip" menuWidth={380} />
            <SelectDropdown value={sub.length} options={LENGTH_OPTIONS} onChange={(v) => update({ length: v })} variant="chip" />
          </div>
        )}

        {/* Title toggle */}
        <div className="flex items-center gap-[4px] shrink-0">
          <Checkbox state={sub.showTitle ? "selected" : "unselected"} onChange={(v) => update({ showTitle: v })} />
          <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)]">Title</span>
        </div>

        <StatusBadge
          status={sub.status}
          options={mode === "my" ? ["standard", "optional"] : ["standard", "optional", "disabled"]}
          onChange={(status) => update({ status })}
        />
        <IconButton
          icon={<Icon name={expanded ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={18} />}
          variant="tertiary-neutral"
          size="small"
          aria-label={expanded ? "Collapse" : "Expand"}
          onClick={() => setExpanded(!expanded)}
        />
      </div>

      {/* Expanded — inline grouped (like Master-Detail), no tabs */}
      {expanded && (
        <div className="border-t border-[rgba(0,0,0,0.06)] px-[16px] pt-[16px] pb-[16px] flex flex-col gap-[16px]">
          {/* Template instruction */}
          <div className="flex flex-col gap-[8px]">
            <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">Template instruction</span>
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

          <div className="h-px bg-[rgba(0,0,0,0.08)]" />

          {/* Formatting */}
          <div className="flex flex-col gap-[12px]">
            <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">Formatting</span>
            <div className="flex items-center gap-[12px]">
              <span className="w-[64px] shrink-0 t-title-sm text-[var(--foreground-secondary,#666)]">Format</span>
              <SelectDropdown value={sub.format} options={FORMAT_OPTIONS} onChange={(v) => update({ format: v })} width="w-[200px]" menuWidth={380} />
              <span className="flex-1 min-w-0 t-body-sm text-[var(--foreground-secondary,#666)]">{formatDescription(sub.format)}</span>
            </div>
            <div className="flex items-center gap-[12px]">
              <span className="w-[64px] shrink-0 t-title-sm text-[var(--foreground-secondary,#666)]">Length</span>
              <SelectDropdown value={sub.length} options={LENGTH_OPTIONS} onChange={(v) => update({ length: v })} width="w-[200px]" />
            </div>

            <div className="flex flex-col gap-[8px] pt-[4px]">
              <span className="t-title-sm text-[var(--foreground-secondary,#666)]">Macros</span>
              <MacrosBlock mode={mode} initialCount={sub.macroCount} />
            </div>

            <div className="flex flex-col gap-[6px] pt-[4px]">
              <span className="t-title-sm text-[var(--foreground-secondary,#666)]">Custom formatting</span>
              <p className="t-body-xs text-[var(--foreground-secondary,#666)]">Anything the settings above don't cover — supplementary formatting instructions.</p>
              <TextArea value={sub.customFormatting} onChange={(v) => update({ customFormatting: v })} rows={3} maxRows={6} placeholder="e.g. bold abnormal values, group by laterality…" />
            </div>
          </div>

          {mode === "my" && (
            <div className="flex justify-end">
              <IconButton icon={<Icon name="delete" size={16} />} variant="danger" size="small" aria-label="Delete subsection" onClick={onDelete} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Section group ──────────────────────────────────────────────────────────────

function SectionGroup({ mode, section, onChange }: { mode: Mode; section: TemplateSection; onChange: (s: TemplateSection) => void }) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function updateSub(idx: number, updated: Subsection) {
    onChange({ ...section, subsections: section.subsections.map((s, i) => i === idx ? updated : s) });
  }
  function deleteSub(idx: number) {
    onChange({ ...section, subsections: section.subsections.filter((_, i) => i !== idx) });
  }
  function addSub() {
    onChange({ ...section, subsections: [...section.subsections, newSubsection()] });
  }
  function handleDrop(toIdx: number) {
    if (dragIndex === null || dragIndex === toIdx) { setDragIndex(null); setDragOverIndex(null); return; }
    const items = [...section.subsections];
    const [moved] = items.splice(dragIndex, 1);
    items.splice(toIdx, 0, moved);
    onChange({ ...section, subsections: items });
    setDragIndex(null); setDragOverIndex(null);
  }

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center h-[36px] px-[4px]">
        <span className="t-title-lg text-[var(--foreground-primary,#1a1a1a)] flex-1" style={{ fontFeatureSettings: "'ss07'" }}>{section.name}</span>
      </div>
      <div className="flex flex-col gap-[6px]">
        {section.subsections.map((sub, idx) => (
          <SummaryRow
            key={sub.id}
            mode={mode}
            sub={sub}
            isDragOver={dragOverIndex === idx && dragIndex !== null && dragIndex !== idx}
            onChange={(u) => updateSub(idx, u)}
            onDelete={() => deleteSub(idx)}
            onDragStart={() => setDragIndex(idx)}
            onDragOver={(e) => { e.preventDefault(); setDragOverIndex(idx); }}
            onDrop={() => handleDrop(idx)}
          />
        ))}
        {mode === "my" && (
          <Button variant="tertiary" size="small" prefix={<Icon name="add" size={14} />} className="self-start" onClick={addSub}>
            Add subsection
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Main view ────────────────────────────────────────────────────────────────

export function FlatView({ mode }: { mode: Mode }) {
  const templateName = "SOAP Note";
  const [sections, setSections] = useState<TemplateSection[]>(INITIAL_SECTIONS);
  function updateSection(idx: number, updated: TemplateSection) {
    setSections((prev) => prev.map((s, i) => i === idx ? updated : s));
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="px-[20px] pt-[32px] pb-[24px] flex flex-col items-center gap-[24px]">
          <div className="w-full max-w-[600px] flex items-center gap-[8px]">
            <span className="t-title-xl text-[var(--foreground-primary,#1a1a1a)] px-[4px]">{templateName}</span>
            <IconButton icon={<Icon name="edit" size={16} />} variant="tertiary" size="small" aria-label="Rename" />
          </div>
          <div className="w-full max-w-[600px] flex flex-col gap-[24px]">
            {sections.map((section, idx) => (
              <SectionGroup key={section.id} mode={mode} section={section} onChange={(u) => updateSection(idx, u)} />
            ))}
          </div>
        </div>
      </div>
      <LivePreviewPanel templateName={templateName} />
    </div>
  );
}
