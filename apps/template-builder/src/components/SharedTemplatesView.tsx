import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Checkbox, Icon, IconButton, Menu, MenuItem, Switch, TextArea } from "@ds/ui";
import { SelectDropdown } from "./SelectDropdown";
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
} from "../templateData";

// ── Shared primitives ────────────────────────────────────────────────────────

const STATUS_STYLES: Record<SubsectionStatus, { bg: string; text: string; label: string }> = {
  standard: { bg: "bg-[#edf7ee] hover:bg-[#e0f0e2]", text: "text-[#2f6a32]", label: "Standard" },
  optional: { bg: "bg-[#fef5d1] hover:bg-[#faedbc]", text: "text-[#645519]", label: "Optional" },
  disabled: { bg: "bg-[#f2f2f2] hover:bg-[#e8e8e8]", text: "text-[#666]", label: "Disabled" },
};

function StatusBadge({ status, options, onChange }: { status: SubsectionStatus; options: SubsectionStatus[]; onChange: (s: SubsectionStatus) => void }) {
  const s = STATUS_STYLES[status];
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function handleOpen() {
    if (open) { setOpen(false); return; }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleOpen}
        className={`h-[28px] flex items-center gap-[2px] pl-[8px] pr-[4px] rounded-[8px] shrink-0 text-[12px] font-bold tracking-[0.24px] transition-colors ${s.bg} ${s.text}`}
        style={{ fontFamily: "Lato" }}
      >
        {s.label}
        <Icon name="arrow_drop_down" size={16} />
      </button>
      {open && pos && createPortal(
        <div ref={menuRef} style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 300 }}>
          <Menu className="w-[160px]">
            {options.map((opt) => (
              <MenuItem
                key={opt}
                label={STATUS_STYLES[opt].label}
                selected={opt === status}
                onClick={() => { onChange(opt); setOpen(false); }}
              />
            ))}
          </Menu>
        </div>,
        document.body
      )}
    </>
  );
}

function FormatChip({ label, dimmed }: { label: string; dimmed?: boolean }) {
  return (
    <span
      className={`rounded-[6px] px-[8px] py-[4.5px] text-[12px] shrink-0 leading-[1.2] ${dimmed ? "bg-[#f2f2f2] text-[#999]" : "bg-[#f2f2f2] text-[#1a1a1a]"}`}
      style={{ fontFamily: "Lato" }}
    >
      {label}
    </span>
  );
}

// ── Macros expandable list ────────────────────────────────────────────────────

function MacrosSection({ label, initialCount }: { label: string; initialCount: number }) {
  const [open, setOpen] = useState(false);
  const [macros, setMacros] = useState<MacroItem[]>(() => makeMacros(initialCount));

  function toggle(id: string) {
    setMacros((prev) => prev.map((m) => m.id === id ? { ...m, enabled: !m.enabled } : m));
  }

  // No macros attached — nothing to show in the provider view.
  if (macros.length === 0) return null;

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[6px] w-full">
      <div className="px-[8px] py-[4px] flex items-center">
        <span className="text-[13px] font-bold tracking-[0.13px] text-[#1a1a1a] mr-[8px] shrink-0" style={{ fontFamily: "Lato", fontFeatureSettings: "'ss07'" }}>
          {label}
        </span>
        <span className="text-[12px] text-[#666] flex-1 min-w-0" style={{ fontFamily: "Lato" }}>
          {macros.filter((m) => m.enabled).length} Macros added
        </span>
        <Button
          variant="tertiary"
          size="small"
          suffix={<Icon name={open ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={16} />}
          onClick={() => setOpen(!open)}
        >
          {open ? "Hide" : "Show"}
        </Button>
      </div>

      {open && (
        <div className="flex flex-col gap-[4px] px-[8px] pb-[8px]">
          {macros.map((m) => (
            <div
              key={m.id}
              className="border border-[rgba(0,0,0,0.1)] rounded-[6px] h-[28px] flex items-center gap-[16px] px-[8px] bg-white hover:bg-[#f7f7f7] transition-colors cursor-default"
            >
              <span className="flex-1 min-w-0 text-[13px] text-[#1a1a1a] truncate" style={{ fontFamily: "Lato" }}>
                {m.name}
              </span>
              <Switch size="XS" checked={m.enabled} onChange={() => toggle(m.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Subsection row ────────────────────────────────────────────────────────────

type RowProps = {
  sub: Subsection;
  isDragOver: boolean;
  onChange: (updated: Subsection) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
};

function SharedSubsectionRow({ sub, isDragOver, onChange, onDragStart, onDragOver, onDrop }: RowProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  function update(partial: Partial<Subsection>) { onChange({ ...sub, ...partial }); }

  function startEdit() {
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  }

  function commitEdit() { setEditingTitle(false); }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={() => onDrop()}
      className={`bg-white border rounded-[6px] flex flex-col py-[4px] w-full transition-colors ${
        isDragOver ? "border-[var(--accent,#1132ee)] border-t-2" : "border-[rgba(0,0,0,0.1)]"
      }`}
    >
      {/* Header */}
      <div className="flex gap-[4px] items-center pl-[4px] pr-[4px]">
        {/* Drag handle */}
        <div className="h-[28px] flex items-center shrink-0 cursor-grab active:cursor-grabbing text-[#ccc] hover:text-[#999] transition-colors">
          <Icon name="drag_indicator" size={16} />
        </div>

        {/* Editable title */}
        {editingTitle ? (
          <input
            ref={titleInputRef}
            className="flex-1 min-w-0 border border-[#ccc] rounded-[6px] h-[28px] px-[8px] text-[13px] font-bold text-[#1a1a1a] bg-white outline-none focus:border-[var(--accent,#1132ee)]"
            style={{ fontFamily: "Lato" }}
            value={sub.name}
            onChange={(e) => update({ name: e.target.value })}
            onBlur={commitEdit}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") commitEdit(); }}
            autoFocus
          />
        ) : (
          <span
            className="flex-1 min-w-0 h-[28px] flex items-center px-[8px] text-[13px] font-bold tracking-[0.13px] text-[#1a1a1a] cursor-text rounded-[6px] hover:bg-[#f2f2f2] transition-colors truncate"
            style={{ fontFamily: "Lato", fontFeatureSettings: "'ss07'" }}
            onClick={startEdit}
            title="Click to edit"
          >
            {sub.name}
          </span>
        )}

        {/* Interactive chips when collapsed */}
        {!expanded && (
          <div className="flex gap-[4px] shrink-0" onClick={(e) => e.stopPropagation()}>
            <SelectDropdown value={sub.format} options={FORMAT_OPTIONS} onChange={(v) => update({ format: v })} variant="chip" menuWidth={380} />
            <SelectDropdown value={sub.length} options={LENGTH_OPTIONS} onChange={(v) => update({ length: v })} variant="chip" />
          </div>
        )}

        {/* Title checkbox */}
        <div className="flex items-center gap-[4px] shrink-0 pr-[4px]">
          <Checkbox state={sub.showTitle ? "selected" : "unselected"} onChange={(v) => update({ showTitle: v })} />
          <span className="text-[13px] text-[#1a1a1a] leading-[1.4] tracking-[0.065px]" style={{ fontFamily: "Lato" }}>Title</span>
        </div>

        {/* Badge */}
        <StatusBadge
          status={sub.status}
          options={["standard", "optional", "disabled"]}
          onChange={(status) => update({ status })}
        />

        {/* Chevron at end */}
        <IconButton
          icon={<Icon name={expanded ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={16} />}
          variant="tertiary-neutral"
          size="small"
          aria-label={expanded ? "Collapse" : "Expand"}
          onClick={() => setExpanded(!expanded)}
        />
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="flex flex-col gap-[12px] pb-[8px] pl-[24px] pr-[8px] pt-[8px]">
          {/* Template Instructions — hidden by default */}
          {showInstructions ? (
            <div className="flex flex-col gap-[4px]">
              <p className="text-[13px] italic text-[#666] leading-[1.5]" style={{ fontFamily: "Lato" }}>
                {sub.templateInstruction || "No template instructions provided."}
              </p>
              <Button
                variant="tertiary"
                size="small"
                suffix={<Icon name="keyboard_arrow_up" size={14} />}
                onClick={() => setShowInstructions(false)}
                className="self-start"
              >
                Hide template instructions
              </Button>
            </div>
          ) : (
            <Button
              variant="tertiary"
              size="small"
              suffix={<Icon name="keyboard_arrow_down" size={14} />}
              onClick={() => setShowInstructions(true)}
              className="self-start"
            >
              Show template instructions
            </Button>
          )}

          <div className="h-px bg-[rgba(0,0,0,0.1)] w-full" />

          {/* Format + Length */}
          <div className="flex flex-col gap-[4px]">
            <div className="flex items-center gap-[8px] h-[28px]">
              <span className="w-[48px] shrink-0 text-[13px] font-bold tracking-[0.13px] text-[#666]" style={{ fontFamily: "Lato", fontFeatureSettings: "'ss07'" }}>Format</span>
              <SelectDropdown value={sub.format} options={FORMAT_OPTIONS} onChange={(v) => update({ format: v })} width="w-[180px]" menuWidth={380} />
              <span className="flex-1 min-w-0 text-[13px] text-[#666] leading-[1.4]" style={{ fontFamily: "Lato" }}>
                {formatDescription(sub.format)}
              </span>
            </div>
            <div className="flex items-center gap-[8px] h-[28px]">
              <span className="w-[48px] shrink-0 text-[13px] font-bold tracking-[0.13px] text-[#666]" style={{ fontFamily: "Lato", fontFeatureSettings: "'ss07'" }}>Length</span>
              <SelectDropdown value={sub.length} options={LENGTH_OPTIONS} onChange={(v) => update({ length: v })} width="w-[180px]" />
              <span className="flex-1 min-w-0 text-[12px] text-[#666] leading-[1.2]" style={{ fontFamily: "Lato" }}>
                {sub.length === "Standard" ? "Full clinical picture, without minor or repetitive details." : ""}
              </span>
            </div>
          </div>

          <TextArea
            label="Custom Formatting"
            value={sub.customFormatting}
            onChange={(v) => update({ customFormatting: v })}
            rows={3}
            placeholder="Enter custom formatting instructions…"
          />

          <MacrosSection label="Site-Macros" initialCount={sub.macroCount} />
        </div>
      )}
    </div>
  );
}

// ── Shared grouped section ────────────────────────────────────────────────────

type GroupedSectionProps = {
  section: TemplateSection;
  onChange: (updated: TemplateSection) => void;
};

function SharedGroupedSection({ section, onChange }: GroupedSectionProps) {
  const [active, setActive] = useState(true);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function updateSub(idx: number, updated: Subsection) {
    onChange({ ...section, subsections: section.subsections.map((s, i) => i === idx ? updated : s) });
  }

  function handleDrop(toIdx: number) {
    if (dragIndex === null || dragIndex === toIdx) {
      setDragIndex(null); setDragOverIndex(null); return;
    }
    const items = [...section.subsections];
    const [moved] = items.splice(dragIndex, 1);
    items.splice(toIdx, 0, moved);
    onChange({ ...section, subsections: items });
    setDragIndex(null); setDragOverIndex(null);
  }

  return (
    <div className="border border-[rgba(0,0,0,0.1)] rounded-[10px] px-[4px] pt-[4px] pb-[8px] w-full flex flex-col gap-[8px]">
      <div className="h-[36px] flex items-center px-[4px]">
        <span className="flex-1 text-[13px] font-bold tracking-[0.13px] text-[#1a1a1a] px-[8px] py-[4px]" style={{ fontFamily: "Lato", fontFeatureSettings: "'ss07'" }}>
          {section.name}
        </span>
        <Button
          variant="tertiary"
          size="small"
          onClick={() => setActive(!active)}
        >
          {active ? "Deactivate" : "Activate"}
        </Button>
      </div>

      <div className="flex flex-col gap-[4px] px-[24px]">
        {section.subsections.map((sub, idx) => (
          <SharedSubsectionRow
            key={sub.id}
            sub={sub}
            isDragOver={dragOverIndex === idx && dragIndex !== null && dragIndex !== idx}
            onChange={(updated) => updateSub(idx, updated)}
            onDragStart={() => setDragIndex(idx)}
            onDragOver={(e) => { e.preventDefault(); setDragOverIndex(idx); }}
            onDrop={() => handleDrop(idx)}
          />
        ))}
      </div>
    </div>
  );
}

// ── SharedTemplatesView ───────────────────────────────────────────────────────

export function SharedTemplatesView() {
  const [templateName] = useState("SOAP Note");
  const [sections, setSections] = useState<TemplateSection[]>(INITIAL_SECTIONS);

  function updateSection(idx: number, updated: TemplateSection) {
    setSections((prev) => prev.map((s, i) => i === idx ? updated : s));
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="px-[20px] pt-[32px] pb-[24px] flex flex-col gap-[24px] items-center">
          <div className="w-full max-w-[600px]">
            <div className="flex items-center gap-[8px]">
              <span className="text-[24px] font-bold text-[#1a1a1a] leading-[1.2] px-[12px] py-[12px]" style={{ fontFamily: "Lato" }}>
                {templateName}
              </span>
            </div>
          </div>
          <div className="w-full max-w-[600px] flex flex-col gap-[8px]">
            {sections.map((section, idx) => (
              <SharedGroupedSection key={section.id} section={section} onChange={(updated) => updateSection(idx, updated)} />
            ))}
          </div>
        </div>
      </div>
      <LivePreviewPanel templateName={templateName} />
    </div>
  );
}
