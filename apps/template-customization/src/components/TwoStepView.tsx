import React, { useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, Checkbox, Chip, Icon, IconButton, Menu, MenuHeader, MenuItem, Switch, TextArea } from "@ds/ui";
import { SelectDropdown } from "./SelectDropdown";
import { DynamicPreviewSections } from "./LivePreviewPanel";
import {
  FORMAT_OPTIONS,
  INITIAL_SECTIONS,
  LENGTH_OPTIONS,
  MacroItem,
  Subsection,
  GenerateWhen,
  SubsectionStatus,
  TemplateSection,
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
      className={`group w-full flex items-center gap-[8px] h-[34px] pl-[8px] pr-[12px] rounded-[8px] text-left transition-colors ${
        active ? "bg-[var(--litmus-25,#f1f3fe)]" : "hover:bg-[var(--surface-1,#f7f7f7)]"
      }`}
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

function MacrosBlock({ mode, initialCount, trailingAction }: { mode: Mode; initialCount: number; trailingAction?: React.ReactNode }) {
  const [macros, setMacros] = useState<MacroItem[]>(() => makeMacros(initialCount));
  function toggle(id: string) { setMacros((p) => p.map((m) => m.id === id ? { ...m, enabled: !m.enabled } : m)); }
  function addMacro() { setMacros((p) => makeMacros(p.length + 1)); }

  return (
    <div className="flex flex-col gap-[8px]">
      {macros.map((m) => (
        <div key={m.id} className="border border-[rgba(0,0,0,0.1)] rounded-[6px] h-[32px] flex items-center gap-[16px] px-[8px] hover:bg-[#f7f7f7] transition-colors">
          <span className="flex-1 min-w-0 truncate t-body-sm text-[var(--foreground-primary,#1a1a1a)]">{m.name}</span>
          <Switch size="XS" checked={m.enabled} onChange={() => toggle(m.id)} />
        </div>
      ))}
      <div className="flex items-center justify-between">
        <Button variant="tertiary" size="small" prefix={<Icon name="add" size={14} />} onClick={addMacro}>
          Add Macro
        </Button>
        {trailingAction}
      </div>
    </div>
  );
}

// ── Include data from (two-step modal) ───────────────────────────────────────

const NOTE_TYPES = ["H&P", "Progress note", "Discharge summary", "Consult note", "Operative note"];

const NOTE_SUBSECTIONS: Record<string, string[]> = {
  "H&P": ["Chief complaint", "HPI", "Past medical history", "Surgical history", "Medications", "Allergies", "Family history", "Social history", "Review of systems", "Physical exam", "Assessment & plan"],
  "Progress note": ["HPI update", "Vitals", "Review of systems", "Physical exam", "Active problems", "Assessment & plan", "Medication changes", "Orders & referrals", "Follow-up plan"],
  "Discharge summary": ["Admission diagnosis", "Hospital course", "Procedures performed", "Discharge medications", "Discharge condition", "Pending results", "Follow-up instructions"],
  "Consult note": ["Reason for consult", "History of present illness", "Past medical history", "Medications", "Examination", "Assessment", "Recommendations"],
  "Operative note": ["Preoperative diagnosis", "Postoperative diagnosis", "Procedure performed", "Anesthesia", "Intraoperative findings", "Specimens", "Complications", "Disposition"],
};

const OTHER_DATA_SOURCES = ["Lab results", "Vitals", "Imaging", "Orders", "Referral letters"];

const TIME_RANGE_OPTIONS = ["Since last visit", "Last 24 hrs", "Last 7 days", "Last 30 days", "All time"];
const TIME_RANGE_ABBREV: Record<string, string> = {
  "Since last visit": "since last visit",
  "Last 24 hrs": "24h",
  "Last 7 days": "7d",
  "Last 30 days": "30d",
  "All time": "all time",
};

const FROM_OPTIONS = ["Me", "Same specialty", "Any provider"];
const WITHIN_OPTIONS = ["Most recent", "Last 24 hrs", "Last 7 days", "Last 30 days"];

const FROM_ABBREV: Record<string, string> = { "Me": "me", "Same specialty": "same specialty", "Any provider": "any" };
const WITHIN_ABBREV: Record<string, string> = { "Most recent": "", "Last 24 hrs": "24h", "Last 7 days": "7d", "Last 30 days": "30d" };

type DataItem = { kind: "data"; type: string; timeRange: string };
type NoteItem = { kind: "note"; noteType: string; from: string; within: string; sections: string[] };
type IncludeItem = DataItem | NoteItem;

function includeChipLabel(item: IncludeItem): string {
  if (item.kind === "data") {
    const abbrev = TIME_RANGE_ABBREV[item.timeRange] ?? item.timeRange;
    return `${item.type} · ${abbrev}`;
  }
  const meta = [FROM_ABBREV[item.from] ?? item.from, WITHIN_ABBREV[item.within] ?? item.within].filter(Boolean).join(" · ");
  if (item.sections.length === 0) return `${item.noteType}${meta ? " · " + meta : ""}`;
  const preview = item.sections.slice(0, 2).join(", ") + (item.sections.length > 2 ? ` +${item.sections.length - 2}` : "");
  return `${item.noteType} — ${preview}${meta ? " · " + meta : ""}`;
}

const SHARED_INCLUDE_SOURCES = ["Last note", "Patient profile", "Scheduler's note"];

function IncludeDataField({ mode }: { mode: Mode }) {
  if (mode === "shared") {
    return (
      <div className="flex flex-wrap gap-[6px] items-center">
        <span className="shrink-0 t-title-sm text-[var(--foreground-secondary,#666)]">Include data from</span>
        {SHARED_INCLUDE_SOURCES.map((s) => (
          <Chip key={s} label={s} color="neutral" size="XS" />
        ))}
      </div>
    );
  }

  const [selected, setSelected] = useState<IncludeItem[]>([]);
  const [open, setOpen] = useState(false);
  const [modalNote, setModalNote] = useState<string | null>(null);
  const [modalData, setModalData] = useState<string | null>(null);
  const [pendingFrom, setPendingFrom] = useState("Me");
  const [pendingWithin, setPendingWithin] = useState("Most recent");
  const [pendingSections, setPendingSections] = useState<Set<string>>(new Set());
  const [pendingTimeRange, setPendingTimeRange] = useState("Since last visit");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const t = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(t) && !(t as Element).closest?.("[data-select-menu]")) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function openNoteModal(noteType: string) {
    setOpen(false);
    setModalNote(noteType);
    setPendingFrom("Me");
    setPendingWithin("Most recent");
    setPendingSections(new Set());
  }

  function confirmModal() {
    if (!modalNote) return;
    setSelected((p) => [...p, { kind: "note", noteType: modalNote, from: pendingFrom, within: pendingWithin, sections: Array.from(pendingSections) }]);
    setModalNote(null);
  }

  function openDataModal(type: string) {
    setOpen(false);
    setModalData(type);
    setPendingTimeRange("Since last visit");
  }

  function confirmDataModal() {
    if (!modalData) return;
    setSelected((p) => [...p, { kind: "data", type: modalData, timeRange: pendingTimeRange }]);
    setModalData(null);
  }

  function toggleSection(sec: string) {
    setPendingSections((p) => { const n = new Set(p); n.has(sec) ? n.delete(sec) : n.add(sec); return n; });
  }

  const selectedNoteTypes = selected.filter((s) => s.kind === "note").map((s) => (s as NoteItem).noteType);
  const selectedDataTypes = selected.filter((s) => s.kind === "data").map((s) => (s as DataItem).type);
  const availableNotes = NOTE_TYPES.filter((n) => !selectedNoteTypes.includes(n));
  const availableData = OTHER_DATA_SOURCES.filter((d) => !selectedDataTypes.includes(d));

  return (
    <>
      <div className="flex flex-wrap gap-[6px] items-center">
        <span className="shrink-0 t-title-sm text-[var(--foreground-secondary,#666)]">Include data from</span>
          {selected.map((item, i) => (
            <Chip key={i} label={includeChipLabel(item)} color="neutral" size="XS" onDismiss={() => setSelected((p) => p.filter((_, j) => j !== i))} />
          ))}
          {(availableNotes.length > 0 || availableData.length > 0) && (
            <div ref={containerRef} className="relative">
              <Button variant="tertiary" size="small" prefix={<Icon name="add" size={14} />} onClick={() => setOpen((o) => !o)}>
                Add
              </Button>
              {open && (
                <div className="absolute top-full left-0 mt-[4px] z-50 bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-[rgba(0,0,0,0.08)] w-[240px] overflow-hidden">
                  {availableNotes.length > 0 && (
                    <div className="px-[6px] pt-[6px]">
                      <MenuHeader>Notes</MenuHeader>
                      {availableNotes.map((n) => (
                        <MenuItem key={n} label={n} trailing={<Icon name="arrow_forward" size={14} />} onClick={() => openNoteModal(n)} />
                      ))}
                    </div>
                  )}
                  {availableData.length > 0 && (
                    <div className="px-[6px] pb-[6px]">
                      <MenuHeader>Other data</MenuHeader>
                      {availableData.map((d) => (
                        <MenuItem key={d} label={d} trailing={<Icon name="arrow_forward" size={14} />} onClick={() => openDataModal(d)} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
      </div>

      {/* Notes config modal */}
      {modalNote && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20" onClick={() => setModalNote(null)} />
          <div className="relative z-[160] bg-white rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.16)] w-[440px] max-h-[80vh] flex flex-col overflow-hidden">
            <div className="shrink-0 px-[24px] pt-[20px] pb-[16px]">
              <span className="t-title-lg text-[var(--foreground-primary,#1a1a1a)]">Add from {modalNote}</span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-[24px] pb-[8px] flex flex-col gap-[16px]">
              {/* From */}
              <div className="flex items-center gap-[12px]">
                <span className="w-[56px] shrink-0 t-title-sm text-[var(--foreground-secondary,#666)]">From</span>
                <SelectDropdown value={pendingFrom} options={FROM_OPTIONS} onChange={setPendingFrom} width="w-[200px]" />
              </div>
              {/* Within */}
              <div className="flex items-center gap-[12px]">
                <span className="w-[56px] shrink-0 t-title-sm text-[var(--foreground-secondary,#666)]">Within</span>
                <SelectDropdown value={pendingWithin} options={WITHIN_OPTIONS} onChange={setPendingWithin} width="w-[200px]" />
              </div>
              {/* Subsections */}
              <div className="flex flex-col gap-[10px]">
                <span className="t-title-sm text-[var(--foreground-secondary,#666)]">Subsections</span>
                {(NOTE_SUBSECTIONS[modalNote] || []).map((sec) => (
                  <label key={sec} className="flex items-center gap-[10px] cursor-pointer select-none">
                    <Checkbox state={pendingSections.has(sec) ? "selected" : "unselected"} onChange={() => toggleSection(sec)} />
                    <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)]">{sec}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="shrink-0 px-[24px] py-[16px] flex justify-end gap-[8px]">
              <Button variant="secondary" size="medium" onClick={() => setModalNote(null)}>Cancel</Button>
              <Button variant="primary" size="medium" onClick={confirmModal}>Add</Button>
            </div>
          </div>
        </div>
      )}

      {/* Data time range modal */}
      {modalData && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20" onClick={() => setModalData(null)} />
          <div className="relative z-[160] bg-white rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.16)] w-[360px] flex flex-col overflow-hidden">
            <div className="shrink-0 px-[24px] pt-[20px] pb-[16px]">
              <span className="t-title-lg text-[var(--foreground-primary,#1a1a1a)]">Add {modalData}</span>
            </div>
            <div className="px-[24px] pb-[8px] flex flex-col gap-[16px]">
              <div className="flex items-center gap-[12px]">
                <span className="w-[80px] shrink-0 t-title-sm text-[var(--foreground-secondary,#666)]">Time range</span>
                <SelectDropdown value={pendingTimeRange} options={TIME_RANGE_OPTIONS} onChange={setPendingTimeRange} width="w-[200px]" />
              </div>
            </div>
            <div className="shrink-0 px-[24px] py-[16px] flex justify-end gap-[8px]">
              <Button variant="secondary" size="medium" onClick={() => setModalData(null)}>Cancel</Button>
              <Button variant="primary" size="medium" onClick={confirmDataModal}>Add</Button>
            </div>
          </div>
        </div>
      )}
    </>
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
  const [showInstructions, setShowInstructions] = useState(false);
  function update(p: Partial<Subsection>) { onChange({ ...sub, ...p }); }
  const whenEmpty = sub.generateWhen ?? "hide";
  const enabled = sub.status !== "disabled";

  return (
    <div ref={registerRef} data-subid={sub.id} className="scroll-mt-[16px] border border-[rgba(0,0,0,0.1)] rounded-[10px] pt-[8px] px-[16px] pb-[16px] flex flex-col gap-[16px]">
      {/* Header */}
      <div className="flex items-center gap-[12px]">
        <input
          className="flex-1 min-w-0 t-title-lg text-[var(--foreground-primary,#1a1a1a)] bg-transparent outline-none h-[36px] rounded-[8px] px-[10px] -ml-[10px] hover:bg-[#f2f2f2] focus:bg-white focus:ring-1 focus:ring-[var(--accent,#1132ee)]"
          value={sub.name}
          onChange={(e) => update({ name: e.target.value })}
        />
        <div className="flex items-center gap-[6px] shrink-0">
          <span className={`t-body-xs ${enabled ? "text-[var(--foreground-secondary,#666)]" : "text-[#999]"}`}>{enabled ? "Active" : "Deactivated"}</span>
          <Switch size="XS" checked={enabled} onChange={(v) => update({ status: v ? "standard" : "disabled" })} />
        </div>
      </div>

      <div className={`flex flex-col gap-[16px]${!enabled ? " opacity-50" : ""}`}>

      {/* ── Template instruction (what to capture + section behavior) ── */}
      <div className="flex flex-col gap-[10px] -mt-[8px]">
        <div className="flex items-center justify-between">
          <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">Template instruction</span>
          {mode === "shared" && (
            <Button variant="tertiary" size="small" suffix={<Icon name={showInstructions ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={14} />} onClick={() => setShowInstructions((v) => !v)}>
              {showInstructions ? "Hide" : "Show"}
            </Button>
          )}
        </div>

        {mode === "shared" ? (
          showInstructions && (
            <>
              <IncludeDataField mode={mode} />
              <p className="t-body-sm text-[var(--foreground-secondary,#666)] leading-[1.5]">{sub.templateInstruction || "No template instruction provided."}</p>
            </>
          )
        ) : (
          <>
            <IncludeDataField mode={mode} />
            <TextArea value={sub.templateInstruction} onChange={(v) => update({ templateInstruction: v })} rows={4} placeholder="Describe what this subsection should capture…" />
          </>
        )}
      </div>

      {/* ── Formatting (how it's presented) ── */}
      <div className="h-px bg-[rgba(0,0,0,0.1)]" />
      <div className="flex flex-col gap-[12px]">
        <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">Formatting</span>

        <div className="flex items-center gap-[12px]">
          <span className="w-[64px] shrink-0 t-title-sm text-[var(--foreground-secondary,#666)]">Title</span>
          <Switch size="XS" checked={sub.showTitle} onChange={(v) => update({ showTitle: v })} />
          <span className="t-body-sm text-[var(--foreground-secondary,#666)]">{sub.showTitle ? "Show" : "Hide"}</span>
        </div>
        <div className="flex items-center gap-[12px]">
          <span className="w-[64px] shrink-0 t-title-sm text-[var(--foreground-secondary,#666)]">Format</span>
          <SelectDropdown value={sub.format} options={FORMAT_OPTIONS} onChange={(v) => update({ format: v })} width="w-[200px]" menuWidth={380} />
        </div>
        <div className="flex items-center gap-[12px]">
          <span className="w-[64px] shrink-0 t-title-sm text-[var(--foreground-secondary,#666)]">Length</span>
          <SelectDropdown value={sub.length} options={LENGTH_OPTIONS} onChange={(v) => update({ length: v })} width="w-[200px]" />
        </div>

        <div className="flex items-center gap-[12px]">
          <span className="shrink-0 t-title-sm text-[var(--foreground-secondary,#666)]">When empty</span>
          <Switch size="XS" checked={whenEmpty === "show"} onChange={(v) => update({ generateWhen: v ? "show" : "hide" })} />
          <span className="t-body-sm text-[var(--foreground-secondary,#666)]">{whenEmpty === "show" ? "Show empty state" : "Hide subsection"}</span>
        </div>
        {whenEmpty === "show" && mode === "my" && (
          <div className="flex flex-col gap-[6px]">
            <span className="t-title-sm text-[var(--foreground-secondary,#666)]">Empty state</span>
            <p className="t-body-xs text-[var(--foreground-secondary,#666)]">What to show when there's no relevant content to pull from.</p>
            <TextArea value={sub.emptyState ?? ""} onChange={(v) => update({ emptyState: v })} rows={2} maxRows={4} placeholder="e.g. No significant findings documented." />
          </div>
        )}

        {/* Custom formatting — supplementary */}
        <div className="flex flex-col gap-[6px] pt-[4px]">
          <span className="t-title-sm text-[var(--foreground-secondary,#666)]">Custom formatting</span>
          <p className="t-body-xs text-[var(--foreground-secondary,#666)]">Anything the settings above don't cover — supplementary formatting instructions.</p>
          <TextArea value={sub.customFormatting} onChange={(v) => update({ customFormatting: v })} rows={3} maxRows={6} placeholder="e.g. bold abnormal values, group by laterality…" />
        </div>
      </div>

      {/* ── Macros + delete ── */}
      <div className="h-px bg-[rgba(0,0,0,0.1)]" />
      <div className="flex flex-col gap-[8px]">
        <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">Macros</span>
        <MacrosBlock
          mode={mode}
          initialCount={sub.macroCount}
          trailingAction={mode === "my" ? (
            <Button variant="tertiary-danger" size="small" prefix={<Icon name="delete" size={16} />} onClick={onDelete}>
              Delete subsection
            </Button>
          ) : undefined}
        />
      </div>
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

// Assistant as an edit mode filling the middle panel.
function AssistantContent() {
  return (
    <div className="flex-1 min-h-0 flex flex-col gap-[8px] px-[24px] pb-[16px]">
      <div className="flex-1 min-h-0 overflow-y-auto py-[8px] flex flex-col gap-[12px] w-full max-w-[640px] mx-auto">
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
      <div className="shrink-0 w-full max-w-[640px] mx-auto flex min-h-[48px] items-center gap-[4px] rounded-[6px] border border-[#8044ff] px-[12px] py-[8px]">
        <input
          placeholder="Ask assistant"
          className="min-w-px flex-1 bg-transparent font-['Lato'] text-[15px] leading-[1.4] tracking-[0.15px] text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[#808080] focus:outline-none"
        />
        <IconButton variant="tertiary" size="medium" aria-label="Voice input" icon={<Icon name="mic" size={20} filled />} />
        <IconButton variant="tertiary" size="medium" aria-label="Send" icon={<Icon name="send" size={20} filled />} />
      </div>
    </div>
  );
}

// Preview is the always-visible output on the right, resizable via the left edge.
function PreviewSidebar({ sections, width, onResizeStart }: { sections: TemplateSection[]; width: number; onResizeStart: (e: React.MouseEvent) => void }) {
  return (
    <div className="relative shrink-0 h-full bg-white border-l border-[var(--shape-outline,rgba(0,0,0,0.1))] flex flex-col" style={{ width }}>
      {/* Resize handle */}
      <div
        onMouseDown={onResizeStart}
        className="group absolute left-0 top-0 h-full w-[20px] -ml-[10px] cursor-col-resize z-10 flex items-center justify-center"
      >
        <div className="h-[40px] w-[3px] rounded-full bg-transparent group-hover:bg-[rgba(0,0,0,0.2)] transition-colors" />
      </div>
      <div className="shrink-0 h-[56px] flex items-center px-[24px]">
        <span className="t-title-sm text-[var(--foreground-secondary,#666)]">Preview</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-[24px] pb-[24px]">
        <DynamicPreviewSections sections={sections} />
      </div>
      {/* Sticky Save bar at the bottom of the preview panel */}
      <div className="shrink-0 px-[24px] py-[12px] flex justify-end bg-white">
        <Button variant="primary" size="medium" prefix={<Icon name="save" size={18} />}>
          Save Template
        </Button>
      </div>
    </div>
  );
}

// ── Main view ────────────────────────────────────────────────────────────────

export function TwoStepView({ mode }: { mode: Mode }) {
  const templateName = "SOAP Note";
  const [sections, setSections] = useState<TemplateSection[]>(INITIAL_SECTIONS);
  const [activeId, setActiveId] = useState<string>(INITIAL_SECTIONS[0].subsections[0].id);
  const [centerTab, setCenterTab] = useState<string>("settings");
  const [drag, setDrag] = useState<{ sectionId: string; index: number } | null>(null);
  const [dragOver, setDragOver] = useState<{ sectionId: string; index: number } | null>(null);
  const [previewWidth, setPreviewWidth] = useState(440);
  const resizing = useRef(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isJumping = useRef(false);

  // Drag-to-resize the preview sidebar (measured from the viewport's right edge).
  useEffect(() => {
    function move(e: MouseEvent) {
      if (!resizing.current) return;
      setPreviewWidth(Math.min(720, Math.max(320, window.innerWidth - e.clientX)));
    }
    function up() {
      resizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, []);

  function startResize(e: React.MouseEvent) {
    e.preventDefault();
    resizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

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
        {/* Universal header bar: template name + Settings/Assistant mode switcher */}
        <div className="shrink-0 h-[56px] flex items-center gap-[24px] px-[24px]">
          <span className="flex-1 t-title-md text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFeatureSettings: "'ss07'" }}>{templateName}</span>
          <ButtonGroup
            size="small"
            value={centerTab}
            onChange={setCenterTab}
            items={[{ label: "Settings", value: "settings" }, { label: "Assistant", value: "assistant" }]}
          />
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 flex">
          {centerTab === "settings" ? (
            <>
              {/* Master list (drag & drop) — part of the settings page, on the left */}
              <div className="w-[200px] shrink-0 h-full overflow-y-auto py-[8px]">
                {sections.map((sec) => (
                  <div key={sec.id} className="mb-[8px]">
                    <div className="px-[16px] h-[28px] flex items-center">
                      <span className="t-title-xs text-[var(--foreground-secondary,#666)]">{sec.name}</span>
                    </div>
                    <div className="px-[8px] flex flex-col gap-[2px]">
                      {sec.subsections.map((sub, idx) => {
                        const showDropLine = !!dragOver && dragOver.sectionId === sec.id && dragOver.index === idx && !!drag && drag.index !== idx;
                        return (
                          <div key={sub.id} className="relative">
                            {showDropLine && <div className="absolute -top-[1px] left-[4px] right-[4px] h-[2px] rounded-full bg-[var(--accent,#1132ee)] z-10" />}
                            <OutlineRow
                              sub={sub}
                              active={sub.id === activeId}
                              isDragOver={false}
                              onJump={() => jumpTo(sub.id)}
                              onDragStart={() => setDrag({ sectionId: sec.id, index: idx })}
                              onDragOver={(e) => { e.preventDefault(); setDragOver({ sectionId: sec.id, index: idx }); }}
                              onDrop={() => handleDrop(sec.id, idx)}
                            />
                          </div>
                        );
                      })}
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
              <div ref={scrollRef} className="flex-1 min-w-0 overflow-y-auto">
                <div className="px-[24px] py-[24px] flex flex-col gap-[32px] max-w-[720px]">
                  {sections.map((sec) => (
                    <div key={sec.id} className="flex flex-col gap-[12px]">
                      <div className="flex items-center gap-[8px]">
                        <span className="t-title-lg text-[var(--foreground-primary,#1a1a1a)]">{sec.name}</span>
                      </div>
                      {sec.subsections.map((sub) => (
                        <SubsectionCard
                          key={sub.id}
                          mode={mode}
                          sub={sub}
                          onChange={updateSub}
                          onDelete={() => deleteSub(sec.id, sub.id)}
                          registerRef={(el) => { if (el) cardRefs.current.set(sub.id, el); else cardRefs.current.delete(sub.id); }}
                        />
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
            /* Assistant mode — an alternative way to edit the template */
            <AssistantContent />
          )}
        </div>
      </div>

      {/* Preview — the output, always visible on the right */}
      <PreviewSidebar sections={sections} width={previewWidth} onResizeStart={startResize} />
    </div>
  );
}
