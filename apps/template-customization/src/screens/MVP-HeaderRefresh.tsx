import React, { useEffect, useRef, useState } from "react";
import { Button, Checkbox, Chip, EditableTitle, SelectChip, Icon, IconButton, Menu, MenuHeader, MenuItem, MenuSearch, SpotMenuItem, Switch, Table, TextArea } from "@ds/ui";
import type { TableColumn } from "@ds/ui";
import { CustomizeLayout, NavSection } from "../components/CustomizeLayout";
import { DynamicPreviewSections } from "../components/LivePreviewPanel";
import {
  INITIAL_SECTIONS,
  LENGTH_OPTIONS,
  MacroItem,
  Subsection,
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

const MVP_FORMAT_OPTIONS = [
  { value: "Auto", label: "Auto format", description: "AI chooses the best format and grouping.", icon: "format_paint" },
  { value: "Paragraph", label: "Paragraph", description: "Narrative style with full sentences.", icon: "subject" },
  { value: "Numbers by Diagnosis", label: "Numbers by Diagnosis", description: "Numbered findings grouped by diagnosis.", icon: "format_list_numbered" },
  { value: "Bullets by Diagnosis", label: "Bullets by Diagnosis", description: "Bulleted findings grouped by diagnosis.", icon: "format_list_bulleted" },
  { value: "Bullets by Body Systems", label: "Bullets by Body Systems", description: "Bulleted findings grouped by body system.", icon: "format_list_bulleted" },
  { value: "Bullets", label: "Flat Bullets", description: "A single ungrouped list of findings.", icon: "format_list_bulleted" },
];

const TEMPLATE_NAMES: Record<string, string> = {
  "soap-note": "SOAP Note",
  "progress-note": "Progress Note",
  "initial-eval": "Initial Evaluation",
  "annual-wellness": "Annual Wellness Exam",
  "new-template": "New Template",
};

function OutlineRow({
  sub, active, isDragOver, onJump, onDragStart, onDragOver, onDrop, onDragEnd,
}: {
  sub: Subsection; active: boolean; isDragOver: boolean;
  onJump: () => void; onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void; onDrop: () => void; onDragEnd: () => void;
}) {
  const s = STATUS_STYLES[sub.status];
  return (
    <button
      draggable onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd} onClick={onJump}
      className={`group w-full flex items-center gap-[8px] h-[34px] pl-[8px] pr-[12px] rounded-[8px] text-left transition-colors ${active ? "bg-[var(--litmus-25,#f1f3fe)]" : "hover:bg-[var(--surface-1,#f7f7f7)]"}`}
    >
      <span className="shrink-0 text-[#ccc] group-hover:text-[#999] cursor-grab active:cursor-grabbing flex items-center"><Icon name="drag_indicator" size={14} /></span>
      <span className={`flex-1 min-w-0 truncate t-title-sm ${active ? "text-[var(--accent,#1132ee)]" : sub.status === "disabled" ? "text-[#999]" : "text-[var(--foreground-primary,#1a1a1a)]"}`} style={{ fontFeatureSettings: "'ss07'" }}>{sub.name}</span>
      <span className={`shrink-0 w-[6px] h-[6px] rounded-full ${s.dot} ${sub.status === "disabled" ? "opacity-60" : ""}`} />
    </button>
  );
}

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
        <Button variant="tertiary" size="small" prefix={<Icon name="add" size={14} />} onClick={addMacro}>Add Macro</Button>
        {trailingAction}
      </div>
    </div>
  );
}

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
const FROM_OPTIONS = ["Me", "Same specialty", "Any provider"];
const WITHIN_OPTIONS = ["Most recent", "Since last visit", "Last 7 days", "Last 30 days", "Last 90 days", "Last year"];

const DATA_ICONS: Record<string, string> = {
  "Lab results": "science",
  "Vitals": "monitor_heart",
  "Imaging": "radiology",
  "Orders": "assignment",
  "Referral letters": "forward_to_inbox",
};

type DataItem = { kind: "data"; type: string; timeRange: string };
type NoteItem = { kind: "note"; noteType: string; from: string; within: string; sections: string[] };
type IncludeItem = DataItem | NoteItem;

function SegmentMenu<T extends string>({ options, selected, onSelect, onClose }: {
  options: T[];
  selected: T;
  onSelect: (v: T) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-[4px] z-[100] bg-white rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-[rgba(0,0,0,0.08)] py-[6px] px-[4px] min-w-[160px]"
    >
      {options.map((opt) => (
        <MenuItem
          key={opt}
          label={opt}
          selected={opt === selected}
          onClick={() => { onSelect(opt); onClose(); }}
        />
      ))}
    </div>
  );
}

function SectionsMenu({ noteType, selected, onUpdate, onClose }: {
  noteType: string; selected: string[];
  onUpdate: (secs: string[]) => void; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const subs = NOTE_SUBSECTIONS[noteType] ?? [];
  const set = new Set(selected);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  function toggle(sec: string) {
    const next = new Set(set);
    next.has(sec) ? next.delete(sec) : next.add(sec);
    onUpdate(Array.from(next));
  }

  return (
    <div ref={ref} className="absolute top-full left-0 mt-[4px] z-[100] bg-white rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-[rgba(0,0,0,0.08)] w-[220px] max-h-[280px] overflow-y-auto py-[8px] px-[12px] flex flex-col gap-[8px]">
      {subs.map((sec) => (
        <label key={sec} className="flex items-center gap-[8px] cursor-pointer select-none">
          <Checkbox state={set.has(sec) ? "selected" : "unselected"} onChange={() => toggle(sec)} />
          <span className="t-body-xs text-[var(--foreground-primary,#1a1a1a)]">{sec}</span>
        </label>
      ))}
    </div>
  );
}

function EditableCell({ value, children, onClick }: { value: string; children?: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-[4px] t-body-sm text-[var(--foreground-primary,#1a1a1a)] hover:text-[var(--accent,#1132ee)] transition-colors group"
    >
      {children ?? value}
      <span className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity text-[var(--foreground-secondary,#666)]">
        <Icon name="keyboard_arrow_down" size={14} />
      </span>
    </button>
  );
}

function DataTypeCell({ item }: { item: IncludeItem }) {
  const iconName = item.kind === "note" ? "description" : (DATA_ICONS[item.type] ?? "attach_file");
  const typeName = item.kind === "note" ? item.noteType : item.type;
  return (
    <div className="flex items-center gap-[6px]">
      <span className="flex items-center text-[var(--foreground-secondary,#666)] shrink-0"><Icon name={iconName} size={14} /></span>
      <span>{typeName}</span>
    </div>
  );
}

function TimeFrameCell({ item, onUpdate }: { item: IncludeItem; onUpdate: (u: IncludeItem) => void }) {
  const [open, setOpen] = useState(false);
  const value = item.kind === "data" ? item.timeRange : item.within;
  return (
    <div className="relative">
      <EditableCell value={value} onClick={() => setOpen((p) => !p)} />
      {open && item.kind === "data" && (
        <SegmentMenu options={TIME_RANGE_OPTIONS as any} selected={item.timeRange}
          onSelect={(v) => { onUpdate({ ...item, timeRange: v }); setOpen(false); }}
          onClose={() => setOpen(false)} />
      )}
      {open && item.kind === "note" && (
        <SegmentMenu options={WITHIN_OPTIONS as any} selected={item.within}
          onSelect={(v) => { onUpdate({ ...item, within: v } as NoteItem); setOpen(false); }}
          onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

function AuthorCell({ item, onUpdate }: { item: IncludeItem; onUpdate: (u: IncludeItem) => void }) {
  const [open, setOpen] = useState(false);
  if (item.kind === "data") return <span className="text-[var(--foreground-secondary,#666)] opacity-40">—</span>;
  const noteItem = item as NoteItem;
  return (
    <div className="relative">
      <EditableCell value={noteItem.from} onClick={() => setOpen((p) => !p)} />
      {open && (
        <SegmentMenu options={FROM_OPTIONS as any} selected={noteItem.from}
          onSelect={(v) => { onUpdate({ ...item, from: v } as NoteItem); setOpen(false); }}
          onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

function DetailCell({ item, onUpdate }: { item: IncludeItem; onUpdate: (u: IncludeItem) => void }) {
  const [open, setOpen] = useState(false);
  if (item.kind === "data") return <span className="text-[var(--foreground-secondary,#666)] opacity-40">—</span>;
  const noteItem = item as NoteItem;
  const detailValue = noteItem.sections.length > 0
    ? `${noteItem.sections.length} section${noteItem.sections.length !== 1 ? "s" : ""}`
    : "All sections";
  return (
    <div className="relative">
      <EditableCell value={detailValue} onClick={() => setOpen((p) => !p)} />
      {open && (
        <SectionsMenu noteType={noteItem.noteType} selected={noteItem.sections}
          onUpdate={(secs) => { onUpdate({ ...item, sections: secs } as NoteItem); }}
          onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

const SHARED_INCLUDE_SOURCES = ["Last note", "Patient profile", "Scheduler's note"];

const SUBSECTION_INCLUDE_DEFAULTS: Record<string, IncludeItem[]> = {
  "Summary": [
    { kind: "note", noteType: "H&P", from: "Me", within: "Most recent", sections: [] },
    { kind: "note", noteType: "Progress note", from: "Me", within: "Most recent", sections: [] },
  ],
  "PMH": [
    { kind: "note", noteType: "H&P", from: "Any provider", within: "Most recent", sections: ["Past medical history"] },
    { kind: "data", type: "Lab results", timeRange: "Last 30 days" },
  ],
  "Surgical History": [
    { kind: "note", noteType: "Operative note", from: "Any provider", within: "Last 30 days", sections: [] },
  ],
  "Social History": [
    { kind: "note", noteType: "H&P", from: "Any provider", within: "Most recent", sections: ["Social history"] },
  ],
  "Family History": [],
  "ROS": [
    { kind: "note", noteType: "Progress note", from: "Me", within: "Last 7 days", sections: ["Review of systems"] },
  ],
  "PE": [
    { kind: "data", type: "Vitals", timeRange: "Last 24 hrs" },
    { kind: "note", noteType: "Progress note", from: "Me", within: "Last 7 days", sections: ["Physical exam"] },
  ],
  "MDM": [
    { kind: "data", type: "Lab results", timeRange: "Since last visit" },
    { kind: "data", type: "Imaging", timeRange: "Since last visit" },
    { kind: "note", noteType: "Progress note", from: "Me", within: "Most recent", sections: ["Assessment & plan"] },
  ],
};

type EditableRow = { item: IncludeItem; onUpdate: (u: IncludeItem) => void; onRemove: () => void };
type SharedRow = { label: string };

const EDITABLE_COLUMNS: TableColumn<EditableRow>[] = [
  {
    key: "type", header: "Data type", width: "200px",
    render: ({ item }) => <DataTypeCell item={item} />,
  },
  {
    key: "timeframe", header: "Time frame", width: "160px",
    render: ({ item, onUpdate }) => <TimeFrameCell item={item} onUpdate={onUpdate} />,
  },
  {
    key: "author", header: "Author", width: "160px",
    render: ({ item, onUpdate }) => <AuthorCell item={item} onUpdate={onUpdate} />,
  },
  {
    key: "detail", header: "Detail",
    render: ({ item, onUpdate }) => <DetailCell item={item} onUpdate={onUpdate} />,
  },
  {
    key: "remove", header: "", width: "32px",
    render: ({ onRemove }) => (
      <button onClick={onRemove}
        className="flex items-center justify-center w-[24px] h-[24px] rounded-[4px] text-[var(--foreground-secondary,#666)] opacity-0 group-hover:opacity-100 hover:bg-[rgba(0,0,0,0.06)] transition-all">
        <Icon name="close" size={12} />
      </button>
    ),
  },
];

const SHARED_COLUMNS: TableColumn<SharedRow>[] = [
  { key: "type", header: "Data type", width: "200px", render: ({ label }) => label },
  { key: "timeframe", header: "Time frame", width: "160px", render: () => <span className="text-[var(--foreground-secondary,#666)] opacity-40">—</span> },
  { key: "author", header: "Author", width: "160px", render: () => <span className="text-[var(--foreground-secondary,#666)] opacity-40">—</span> },
  { key: "detail", header: "Detail", render: () => <span className="text-[var(--foreground-secondary,#666)] opacity-40">—</span> },
];

function IncludeDataTable({ mode, initialItems = [] }: { mode: Mode; initialItems?: IncludeItem[] }) {
  const [selected, setSelected] = useState<IncludeItem[]>(initialItems);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function addNote(noteType: string) {
    setOpen(false);
    setSelected((p) => [...p, { kind: "note", noteType, from: "Me", within: "Most recent", sections: [] }]);
  }

  function addData(type: string) {
    setOpen(false);
    setSelected((p) => [...p, { kind: "data", type, timeRange: "Since last visit" }]);
  }

  function updateItem(index: number, updated: IncludeItem) {
    setSelected((p) => p.map((item, i) => i === index ? updated : item));
  }

  const selectedNoteTypes = selected.filter((s) => s.kind === "note").map((s) => (s as NoteItem).noteType);
  const selectedDataTypes = selected.filter((s) => s.kind === "data").map((s) => (s as DataItem).type);
  const availableNotes = NOTE_TYPES.filter((n) => !selectedNoteTypes.includes(n));
  const availableData = OTHER_DATA_SOURCES.filter((d) => !selectedDataTypes.includes(d));

  const editableRows: EditableRow[] = selected.map((item, i) => ({
    item,
    onUpdate: (updated) => updateItem(i, updated),
    onRemove: () => setSelected((p) => p.filter((_, j) => j !== i)),
  }));
  const sharedRows: SharedRow[] = SHARED_INCLUDE_SOURCES.map((label) => ({ label }));

  return (
    <div className="flex flex-col gap-[8px]">
      {mode === "shared" ? (
        <Table columns={SHARED_COLUMNS} rows={sharedRows} rowKey={(r) => r.label} />
      ) : selected.length > 0 && (
        <Table columns={EDITABLE_COLUMNS} rows={editableRows} rowKey={(_, i) => i} />
      )}

      {mode === "my" && (availableNotes.length > 0 || availableData.length > 0) && (
        <div ref={containerRef} className="relative self-start">
          <Button variant="tertiary" size="small" prefix={<Icon name="add" size={14} />} onClick={() => setOpen((o) => !o)}>
            Add
          </Button>
          {open && (
            <div className="absolute top-full left-0 mt-[4px] z-50 bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-[rgba(0,0,0,0.08)] w-[240px] overflow-hidden">
              {availableNotes.length > 0 && (
                <div className="px-[6px] pt-[6px]">
                  <MenuHeader>Past notes</MenuHeader>
                  {availableNotes.map((n) => (
                    <MenuItem key={n} label={n} onClick={() => addNote(n)} />
                  ))}
                </div>
              )}
              {availableData.length > 0 && (
                <div className="px-[6px] pb-[6px]">
                  <MenuHeader>Patient data</MenuHeader>
                  {availableData.map((d) => (
                    <MenuItem key={d} label={d} onClick={() => addData(d)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InlineEditRow({ item, onUpdate, onRemove, dots = true }: {
  item: IncludeItem;
  onUpdate: (u: IncludeItem) => void;
  onRemove: () => void;
  dots?: boolean;
}) {
  const [openSeg, setOpenSeg] = useState<string | null>(null);
  function toggle(seg: string) { setOpenSeg((p) => (p === seg ? null : seg)); }

  const icon = item.kind === "note" ? "description" : (DATA_ICONS[item.type] ?? "attach_file");
  const label = item.kind === "note" ? item.noteType : item.type;
  const timeValue = item.kind === "data" ? item.timeRange : item.within;

  const fromLabel = (from: string) =>
    from === "Me" ? "by me" : from === "Same specialty" ? "same specialty" : "any provider";

  return (
    <div className="group flex items-center gap-[6px] h-[30px] px-[8px] rounded-[6px]">
      <span className="flex items-center shrink-0 text-[var(--foreground-secondary,#666)]"><Icon name={icon} size={14} /></span>
      <span className="t-title-xs text-[var(--foreground-primary,#1a1a1a)] shrink-0">{label}</span>
      {dots && <span className="text-[var(--foreground-secondary,#666)] t-body-xs shrink-0">·</span>}

      <div className="relative shrink-0">
        <button onClick={() => toggle("time")}
          className="inline-flex items-center h-[20px] pl-[6px] pr-[2px] gap-[1px] rounded-[4px] t-body-xs text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--black-5,#0000000d)] transition-colors">
          {timeValue}
          <Icon name="arrow_drop_down" size={16} className="shrink-0 opacity-60" />
        </button>
        {openSeg === "time" && item.kind === "data" && (
          <SegmentMenu options={TIME_RANGE_OPTIONS as any} selected={item.timeRange}
            onSelect={(v) => { onUpdate({ ...item, timeRange: v }); setOpenSeg(null); }}
            onClose={() => setOpenSeg(null)} />
        )}
        {openSeg === "time" && item.kind === "note" && (
          <SegmentMenu options={WITHIN_OPTIONS as any} selected={item.within}
            onSelect={(v) => { onUpdate({ ...item, within: v } as NoteItem); setOpenSeg(null); }}
            onClose={() => setOpenSeg(null)} />
        )}
      </div>

      {item.kind === "note" && (
        <>
          {dots && <span className="text-[var(--foreground-secondary,#666)] t-body-xs shrink-0">·</span>}
          <div className="relative shrink-0">
            <button onClick={() => toggle("from")}
              className="inline-flex items-center h-[20px] pl-[6px] pr-[2px] gap-[1px] rounded-[4px] t-body-xs text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--black-5,#0000000d)] transition-colors">
              {fromLabel((item as NoteItem).from)}
              <Icon name="arrow_drop_down" size={16} className="shrink-0 opacity-60" />
            </button>
            {openSeg === "from" && (
              <SegmentMenu options={FROM_OPTIONS as any} selected={(item as NoteItem).from}
                onSelect={(v) => { onUpdate({ ...item, from: v } as NoteItem); setOpenSeg(null); }}
                onClose={() => setOpenSeg(null)} />
            )}
          </div>
        </>
      )}

      <span className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <IconButton variant="tertiary-neutral" size="small" aria-label="Remove" icon={<Icon name="close" size={14} />} onClick={onRemove} />
      </span>
    </div>
  );
}

function IncludeInlineRows({ mode, initialItems = [], dots = true }: { mode: Mode; initialItems?: IncludeItem[]; dots?: boolean }) {
  const [selected, setSelected] = useState<IncludeItem[]>(initialItems);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function addNote(noteType: string) { setOpen(false); setSelected((p) => [...p, { kind: "note", noteType, from: "Me", within: "Most recent", sections: [] }]); }
  function addData(type: string) { setOpen(false); setSelected((p) => [...p, { kind: "data", type, timeRange: "Since last visit" }]); }
  function updateItem(i: number, updated: IncludeItem) { setSelected((p) => p.map((item, j) => j === i ? updated : item)); }

  const selectedNoteTypes = selected.filter((s) => s.kind === "note").map((s) => (s as NoteItem).noteType);
  const selectedDataTypes = selected.filter((s) => s.kind === "data").map((s) => (s as DataItem).type);
  const availableNotes = NOTE_TYPES.filter((n) => !selectedNoteTypes.includes(n));
  const availableData = OTHER_DATA_SOURCES.filter((d) => !selectedDataTypes.includes(d));

  return (
    <div className="flex flex-col gap-[2px]">
      {mode === "shared" ? (
        SHARED_INCLUDE_SOURCES.map((label) => (
          <div key={label} className="flex items-center gap-[8px] h-[32px] px-[8px] rounded-[6px]">
            <span className="flex items-center shrink-0 text-[var(--foreground-secondary,#666)]"><Icon name="description" size={14} /></span>
            <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)]">{label}</span>
          </div>
        ))
      ) : (
        <>
          {selected.map((item, i) => (
            <InlineEditRow key={i} item={item} dots={dots}
              onUpdate={(u) => updateItem(i, u)}
              onRemove={() => setSelected((p) => p.filter((_, j) => j !== i))} />
          ))}
          {selected.length === 0 && availableNotes.length === 0 && availableData.length === 0 && (
            <span className="t-body-sm text-[var(--foreground-secondary,#666)] px-[8px]">None</span>
          )}
          {(availableNotes.length > 0 || availableData.length > 0) && (
            <div ref={containerRef} className="relative self-start mt-[2px]">
              <Button variant="tertiary" size="small" prefix={<Icon name="add" size={14} />} onClick={() => setOpen((o) => !o)}>Add</Button>
              {open && (
                <div className="absolute top-full left-0 mt-[4px] z-50 bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-[rgba(0,0,0,0.08)] w-[240px] overflow-hidden">
                  {availableNotes.length > 0 && <div className="px-[6px] pt-[6px]"><MenuHeader>Past notes</MenuHeader>{availableNotes.map((n) => <MenuItem key={n} label={n} onClick={() => addNote(n)} />)}</div>}
                  {availableData.length > 0 && <div className="px-[6px] pb-[6px]"><MenuHeader>Patient data</MenuHeader>{availableData.map((d) => <MenuItem key={d} label={d} onClick={() => addData(d)} />)}</div>}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function IncludeSummary({ mode, initialItems = [] }: { mode: Mode; initialItems?: IncludeItem[] }) {
  const [selected, setSelected] = useState<IncludeItem[]>(initialItems);
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function addNote(noteType: string) { setOpen(false); setSelected((p) => [...p, { kind: "note", noteType, from: "Me", within: "Most recent", sections: [] }]); }
  function addData(type: string) { setOpen(false); setSelected((p) => [...p, { kind: "data", type, timeRange: "Since last visit" }]); }

  const selectedNoteTypes = selected.filter((s) => s.kind === "note").map((s) => (s as NoteItem).noteType);
  const selectedDataTypes = selected.filter((s) => s.kind === "data").map((s) => (s as DataItem).type);
  const availableNotes = NOTE_TYPES.filter((n) => !selectedNoteTypes.includes(n));
  const availableData = OTHER_DATA_SOURCES.filter((d) => !selectedDataTypes.includes(d));

  const displayItems = mode === "shared"
    ? SHARED_INCLUDE_SOURCES
    : selected.map((item) => item.kind === "note" ? item.noteType : item.type);

  const MAX_SHOWN = 3;
  const summaryText = displayItems.length === 0
    ? "None"
    : displayItems.slice(0, MAX_SHOWN).join(", ") + (displayItems.length > MAX_SHOWN ? ` +${displayItems.length - MAX_SHOWN} more` : "");

  if (!expanded || mode === "shared") {
    return (
      <div className="group flex items-center gap-[8px] min-h-[28px]">
        <span className={`flex-1 t-body-sm ${displayItems.length === 0 ? "text-[var(--foreground-secondary,#666)]" : "text-[var(--foreground-primary,#1a1a1a)]"}`}>
          {summaryText}
        </span>
        {mode === "my" && (
          <button onClick={() => setExpanded(true)}
            className="shrink-0 opacity-0 group-hover:opacity-100 flex items-center gap-[4px] t-body-sm text-[var(--accent,#1132ee)] hover:underline transition-opacity">
            Edit
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[2px]">
      {selected.map((item, i) => {
        const icon = item.kind === "note" ? "description" : (DATA_ICONS[item.type] ?? "attach_file");
        const label = item.kind === "note" ? item.noteType : item.type;
        const meta = item.kind === "note" ? `${item.within} · ${item.from}` : item.timeRange;
        return (
          <div key={i} className="group/row flex items-center gap-[8px] h-[32px] px-[8px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors">
            <span className="flex items-center shrink-0 text-[var(--foreground-secondary,#666)]"><Icon name={icon} size={14} /></span>
            <span className="flex-1 min-w-0 t-body-sm text-[var(--foreground-primary,#1a1a1a)] truncate">
              {label}<span className="text-[var(--foreground-secondary,#666)]"> · {meta}</span>
            </span>
            <button onClick={() => setSelected((p) => p.filter((_, j) => j !== i))}
              className="flex items-center justify-center w-[20px] h-[20px] rounded-[4px] text-[var(--foreground-secondary,#666)] opacity-0 group-hover/row:opacity-100 hover:bg-[rgba(0,0,0,0.06)] transition-all shrink-0">
              <Icon name="close" size={12} />
            </button>
          </div>
        );
      })}
      <div className="flex items-center gap-[8px] mt-[2px]">
        {(availableNotes.length > 0 || availableData.length > 0) && (
          <div ref={containerRef} className="relative">
            <Button variant="tertiary" size="small" prefix={<Icon name="add" size={14} />} onClick={() => setOpen((o) => !o)}>Add</Button>
            {open && (
              <div className="absolute top-full left-0 mt-[4px] z-50 bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-[rgba(0,0,0,0.08)] w-[240px] overflow-hidden">
                {availableNotes.length > 0 && <div className="px-[6px] pt-[6px]"><MenuHeader>Past notes</MenuHeader>{availableNotes.map((n) => <MenuItem key={n} label={n} onClick={() => addNote(n)} />)}</div>}
                {availableData.length > 0 && <div className="px-[6px] pb-[6px]"><MenuHeader>Patient data</MenuHeader>{availableData.map((d) => <MenuItem key={d} label={d} onClick={() => addData(d)} />)}</div>}
              </div>
            )}
          </div>
        )}
        <button onClick={() => setExpanded(false)} className="t-body-sm text-[var(--foreground-secondary,#666)] hover:text-[var(--foreground-primary,#1a1a1a)] transition-colors">Done</button>
      </div>
    </div>
  );
}

function InlineChipsRow({ item, onUpdate, onRemove, chipSize = "XS", labelStyle = "title" }: {
  item: IncludeItem;
  onUpdate: (u: IncludeItem) => void;
  onRemove: () => void;
  chipSize?: "S" | "XS";
  labelStyle?: "title" | "body";
}) {
  const [openSeg, setOpenSeg] = useState<string | null>(null);
  function toggle(seg: string) { setOpenSeg((p) => (p === seg ? null : seg)); }

  const icon = item.kind === "note" ? "description" : (DATA_ICONS[item.type] ?? "attach_file");
  const label = item.kind === "note" ? item.noteType : item.type;
  const timeValue = item.kind === "data" ? item.timeRange : item.within;
  const fromLabel = (from: string) =>
    from === "Me" ? "by me" : from === "Same specialty" ? "same specialty" : "any provider";

  return (
    <div className="group flex items-center gap-[6px] h-[30px] px-[8px] rounded-[6px]">
      <span className="flex items-center shrink-0 text-[var(--foreground-secondary,#666)]"><Icon name={icon} size={14} /></span>
      <span className={`${labelStyle === "body" ? "t-body-md mr-[4px]" : "t-title-xs"} text-[var(--foreground-primary,#1a1a1a)] shrink-0`}>{label}</span>

      <div className="relative shrink-0">
        <Chip size={chipSize} color="neutral" label={timeValue} onClick={() => toggle("time")} />
        {openSeg === "time" && item.kind === "data" && (
          <SegmentMenu options={TIME_RANGE_OPTIONS as any} selected={item.timeRange}
            onSelect={(v) => { onUpdate({ ...item, timeRange: v }); setOpenSeg(null); }}
            onClose={() => setOpenSeg(null)} />
        )}
        {openSeg === "time" && item.kind === "note" && (
          <SegmentMenu options={WITHIN_OPTIONS as any} selected={item.within}
            onSelect={(v) => { onUpdate({ ...item, within: v } as NoteItem); setOpenSeg(null); }}
            onClose={() => setOpenSeg(null)} />
        )}
      </div>

      {item.kind === "note" && (
        <div className="relative shrink-0">
          <Chip size={chipSize} color="neutral" label={fromLabel((item as NoteItem).from)} onClick={() => toggle("from")} />
          {openSeg === "from" && (
            <SegmentMenu options={FROM_OPTIONS as any} selected={(item as NoteItem).from}
              onSelect={(v) => { onUpdate({ ...item, from: v } as NoteItem); setOpenSeg(null); }}
              onClose={() => setOpenSeg(null)} />
          )}
        </div>
      )}

      <span className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <IconButton variant="tertiary-neutral" size="small" aria-label="Remove" icon={<Icon name="close" size={14} />} onClick={onRemove} />
      </span>
    </div>
  );
}

function IncludeInlineChips({ mode, initialItems = [], chipSize = "XS", labelStyle = "title" }: { mode: Mode; initialItems?: IncludeItem[]; chipSize?: "S" | "XS"; labelStyle?: "title" | "body" }) {
  const [selected, setSelected] = useState<IncludeItem[]>(initialItems);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function addNote(noteType: string) { setOpen(false); setSelected((p) => [...p, { kind: "note", noteType, from: "Me", within: "Most recent", sections: [] }]); }
  function addData(type: string) { setOpen(false); setSelected((p) => [...p, { kind: "data", type, timeRange: "Since last visit" }]); }
  function updateItem(i: number, updated: IncludeItem) { setSelected((p) => p.map((item, j) => j === i ? updated : item)); }

  const selectedNoteTypes = selected.filter((s) => s.kind === "note").map((s) => (s as NoteItem).noteType);
  const selectedDataTypes = selected.filter((s) => s.kind === "data").map((s) => (s as DataItem).type);
  const availableNotes = NOTE_TYPES.filter((n) => !selectedNoteTypes.includes(n));
  const availableData = OTHER_DATA_SOURCES.filter((d) => !selectedDataTypes.includes(d));

  return (
    <div className="flex flex-col gap-[2px]">
      {mode === "shared" ? (
        SHARED_INCLUDE_SOURCES.map((label) => (
          <div key={label} className="flex items-center gap-[8px] h-[30px] px-[8px]">
            <span className="flex items-center shrink-0 text-[var(--foreground-secondary,#666)]"><Icon name="description" size={14} /></span>
            <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)]">{label}</span>
          </div>
        ))
      ) : (
        <>
          {selected.map((item, i) => (
            <InlineChipsRow key={i} item={item} chipSize={chipSize} labelStyle={labelStyle}
              onUpdate={(u) => updateItem(i, u)}
              onRemove={() => setSelected((p) => p.filter((_, j) => j !== i))} />
          ))}
          {selected.length === 0 && availableNotes.length === 0 && availableData.length === 0 && (
            <span className="t-body-sm text-[var(--foreground-secondary,#666)] px-[8px]">None</span>
          )}
          {(availableNotes.length > 0 || availableData.length > 0) && (
            <div ref={containerRef} className="relative self-start mt-[2px]">
              <Button variant="tertiary" size="small" prefix={<Icon name="add" size={14} />} onClick={() => setOpen((o) => !o)}>Add</Button>
              {open && (
                <div className="absolute top-full left-0 mt-[4px] z-50 bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-[rgba(0,0,0,0.08)] w-[240px] overflow-hidden">
                  {availableNotes.length > 0 && <div className="px-[6px] pt-[6px]"><MenuHeader>Past notes</MenuHeader>{availableNotes.map((n) => <MenuItem key={n} label={n} onClick={() => addNote(n)} />)}</div>}
                  {availableData.length > 0 && <div className="px-[6px] pb-[6px]"><MenuHeader>Patient data</MenuHeader>{availableData.map((d) => <MenuItem key={d} label={d} onClick={() => addData(d)} />)}</div>}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SubsectionCard({ mode, sub, onChange, onDelete, registerRef }: {
  mode: Mode; sub: Subsection; onChange: (s: Subsection) => void;
  onDelete: () => void; registerRef: (el: HTMLDivElement | null) => void;
}) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [chipFormatOpen, setChipFormatOpen] = useState(false);
  const [chipLengthOpen, setChipLengthOpen] = useState(false);
  const [chipWhenEmptyOpen, setChipWhenEmptyOpen] = useState(false);
  const defaultSub = useRef<Subsection>(sub);
  function update(p: Partial<Subsection>) { onChange({ ...sub, ...p }); }
  const subsectionFields: (keyof Subsection)[] = ["name", "showTitle", "status", "generateWhen", "emptyState", "templateInstruction", "format", "length", "customFormatting"];
  const hasChanges = subsectionFields.some((k) => sub[k] !== defaultSub.current[k]);
  const whenEmpty = sub.generateWhen ?? "hide";
  const enabled = sub.status !== "disabled";
  const formatLabel = MVP_FORMAT_OPTIONS.find((option) => option.value === sub.format)?.label ?? sub.format;

  return (
    <div ref={registerRef} data-subid={sub.id} className="scroll-mt-[16px] border border-[rgba(0,0,0,0.1)] rounded-[10px] pt-[8px] px-[16px] pb-[16px] flex flex-col gap-[16px]">
      <div className="flex items-center gap-[12px]">
        <div className="flex-1 min-w-0">
          <EditableTitle value={sub.name} onChange={(v) => update({ name: v })} size="sm" />
        </div>
        <div className="flex items-center gap-[6px] shrink-0">
          <span className={`t-body-xs ${enabled ? "text-[var(--foreground-secondary,#666)]" : "text-[#999]"}`}>{enabled ? "Active" : "Deactivated"}</span>
          <Switch size="XS" checked={enabled} onChange={(v) => update({ status: v ? "standard" : "disabled" })} />
        </div>
      </div>

      <div className={`flex flex-col gap-[16px]${!enabled ? " opacity-50" : ""}`}>

        {/* ── Instruction ── */}
        <div className={`flex flex-col gap-[4px] ${mode === "shared" ? "-mt-[14px]" : "-mt-[8px]"}${mode === "shared" && !showInstructions ? " -mb-[8px]" : ""}`}>
          <div className="flex items-center justify-between">
            <p className="t-title-sm text-[var(--foreground-secondary,#666)]">Instruction <span className="t-body-xs font-normal ml-[8px]">What this subsection should cover.</span></p>
            {mode === "shared" && (
              <Button variant="tertiary" size="small" suffix={<Icon name={showInstructions ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={14} />} onClick={() => setShowInstructions((v) => !v)}>
                {showInstructions ? "Hide" : "Show"}
              </Button>
            )}
          </div>
          {mode === "shared" ? (
            showInstructions && (
              <p className="t-body-sm text-[var(--foreground-secondary,#666)] leading-[1.5] -mt-[4px]">{sub.templateInstruction || "No template instruction provided."}</p>
            )
          ) : (
            <TextArea value={sub.templateInstruction} onChange={(v) => update({ templateInstruction: v })} rows={4} placeholder="Describe what this subsection should capture…" />
          )}
        </div>

        {/* ── Patient context ── */}
        <div className="h-px bg-[rgba(0,0,0,0.1)]" />
        <div className="flex flex-col gap-[8px]">
          <p className="t-title-sm text-[var(--foreground-secondary,#666)]">Patient context <span className="t-body-xs font-normal ml-[8px]">Where to pull information from, beyond the recording.</span></p>
          <IncludeInlineChips mode="my" initialItems={SUBSECTION_INCLUDE_DEFAULTS[sub.name] ?? []} labelStyle="body" />
        </div>

        {/* ── Formatting ── */}
        <div className="h-px bg-[rgba(0,0,0,0.1)]" />
        <div className="flex flex-col gap-[12px]">
          <p className="t-title-sm text-[var(--foreground-secondary,#666)]">Formatting <span className="t-body-xs font-normal ml-[8px]">How Ambient should write this section.</span></p>

          <div className="flex items-center flex-wrap gap-[8px]">
            <SelectChip size="S" color="accent" label={sub.showTitle ? "Show title" : "Hide title"} selected={sub.showTitle} onChange={(v) => update({ showTitle: v })} />

            <div className="relative">
              <SelectChip
                size="S" color="accent"
                label={formatLabel}
                selected={sub.format !== "Auto"}
                chevronWhenSelected
                onChange={() => setChipFormatOpen((o) => !o)}
              />
              {chipFormatOpen && (
                <>
                  <div className="fixed inset-0 z-[9]" onClick={() => setChipFormatOpen(false)} />
                  <div className="absolute top-full left-0 mt-[4px] z-10" onClick={(e) => e.stopPropagation()}>
                    <Menu className="w-[380px]">
                      {MVP_FORMAT_OPTIONS.map((o) => (
                        <SpotMenuItem
                          key={o.value}
                          icon={o.icon}
                          label={o.label}
                          description={o.description}
                          selected={sub.format === o.value}
                          onClick={() => { update({ format: o.value }); setChipFormatOpen(false); }}
                        />
                      ))}
                    </Menu>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <SelectChip
                size="S" color="accent"
                label={sub.length === "Standard" ? "Standard length" : sub.length}
                selected={sub.length !== "Standard"}
                chevronWhenSelected
                onChange={() => setChipLengthOpen((o) => !o)}
              />
              {chipLengthOpen && (
                <SegmentMenu
                  options={LENGTH_OPTIONS as any}
                  selected={sub.length}
                  onSelect={(v) => { update({ length: v }); setChipLengthOpen(false); }}
                  onClose={() => setChipLengthOpen(false)} />
              )}
            </div>

            <SelectChip size="S" color="accent" label={whenEmpty === "show" ? "Show empty state" : "Skip when empty"} selected={whenEmpty === "show"} onChange={(v) => update({ generateWhen: v ? "show" : "hide" })} />
          </div>

          {whenEmpty === "show" && mode === "my" && (
            <div className="flex flex-col gap-[8px]">
              <span className="t-title-sm text-[var(--foreground-secondary,#666)]">Empty state</span>
              <p className="t-body-xs text-[var(--foreground-secondary,#666)]">What to show when there's no relevant content to pull from.</p>
              <TextArea value={sub.emptyState ?? ""} onChange={(v) => update({ emptyState: v })} rows={2} maxRows={4} placeholder="e.g. No significant findings documented." />
            </div>
          )}
          <div className="flex flex-col gap-[8px] pt-[4px]">
            <p className="t-body-xs text-[var(--foreground-secondary,#666)]">Other specific formatting preferences and instructions</p>
            <TextArea value={sub.customFormatting} onChange={(v) => update({ customFormatting: v })} rows={3} maxRows={6} placeholder="e.g. bold abnormal values, group by laterality…" />
          </div>
        </div>

        {/* ── Macros ── */}
        <div className="h-px bg-[rgba(0,0,0,0.1)]" />
        <div className="flex flex-col gap-[8px]">
          <p className="t-title-sm text-[var(--foreground-secondary,#666)]">Macros <span className="t-body-xs font-normal ml-[8px]">Pre-set content structure for Ambient to follow.</span></p>
          <MacrosBlock
            mode={mode}
            initialCount={sub.macroCount}
            trailingAction={mode === "my" ? (
              <Button variant="tertiary-danger" size="small" prefix={<Icon name="delete" size={16} />} onClick={onDelete}>Delete subsection</Button>
            ) : (
              <Button variant="tertiary" size="small" prefix={<Icon name="restart_alt" size={16} />} disabled={!hasChanges} onClick={() => onChange({ ...defaultSub.current })}>Reset to default</Button>
            )}
          />
        </div>
      </div>
    </div>
  );
}


const SAMPLE_PREVIEW_SOURCES = [
  { id: "example", label: "Example patient" },
  { id: "scribe-1", label: "Alex Morgan", description: "Today at 1:42 PM · Chest pain" },
  { id: "scribe-2", label: "Jordan Lee", description: "Today at 11:18 AM · Follow-up" },
  { id: "scribe-3", label: "Taylor Reed", description: "Today at 9:06 AM · Shortness of breath" },
  { id: "scribe-4", label: "Casey Rivera", description: "Yesterday at 4:32 PM · Abdominal pain" },
  { id: "scribe-5", label: "Riley Chen", description: "Yesterday at 2:15 PM · Medication review" },
  { id: "scribe-6", label: "Cameron Ellis", description: "Yesterday at 10:48 AM · Annual wellness visit" },
  { id: "scribe-7", label: "Morgan Blake", description: "Monday at 3:20 PM · Headache" },
  { id: "scribe-8", label: "Jamie Brooks", description: "Monday at 1:05 PM · Post-op follow-up" },
  { id: "scribe-9", label: "Avery Patel", description: "Monday at 9:36 AM · Back pain" },
  { id: "scribe-10", label: "Quinn Harper", description: "Friday at 4:10 PM · Diabetes follow-up" },
  { id: "scribe-11", label: "Parker James", description: "Friday at 11:22 AM · Cough" },
  { id: "scribe-12", label: "Drew Sullivan", description: "Thursday at 2:54 PM · Lab review" },
];

function PreviewSourceDropdown({ onSourceChange }: { onSourceChange: () => void }) {
  const [selectedId, setSelectedId] = useState("example");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = SAMPLE_PREVIEW_SOURCES.find((source) => source.id === selectedId) ?? SAMPLE_PREVIEW_SOURCES[0];
  const normalizedQuery = query.trim().toLowerCase();
  const allScribes = SAMPLE_PREVIEW_SOURCES.slice(1);
  const matchingScribes = allScribes.filter((source) =>
    `${source.label} ${source.description}`.toLowerCase().includes(normalizedQuery)
  );
  const displayedScribes = normalizedQuery ? matchingScribes : matchingScribes.slice(0, visibleCount);

  function closeMenu() {
    setOpen(false);
    setQuery("");
    setVisibleCount(6);
  }

  function selectSource(id: string) {
    if (id !== selectedId) onSourceChange();
    setSelectedId(id);
    closeMenu();
  }

  function handleResultsScroll(event: React.UIEvent<HTMLDivElement>) {
    if (normalizedQuery) return;
    const list = event.currentTarget;
    if (list.scrollHeight - list.scrollTop - list.clientHeight < 24) {
      setVisibleCount((count) => Math.min(count + 5, allScribes.length));
    }
  }

  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) closeMenu();
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <SelectChip
        size="S"
        color="accent"
        label={selected.label}
        selected={selectedId !== "example"}
        chevronWhenSelected
        onChange={() => open ? closeMenu() : setOpen(true)}
      />
      {open && (
        <div className="absolute right-0 top-full mt-[4px] z-[100]">
          <Menu className="w-[260px]">
            <MenuSearch value={query} onChange={setQuery} onClose={closeMenu} placeholder="Search scribes…" />
            <MenuItem
              label="Example patient"
              selected={selectedId === "example"}
              onClick={() => selectSource("example")}
            />
            <MenuHeader>Recent scribes</MenuHeader>
            <div className="max-h-[220px] overflow-y-auto" onScroll={handleResultsScroll}>
              {displayedScribes.map((source) => (
                <MenuItem
                  key={source.id}
                  label={source.label}
                  description={source.description}
                  selected={source.id === selectedId}
                  onClick={() => selectSource(source.id)}
                />
              ))}
              {displayedScribes.length === 0 && (
                <p className="t-body-sm text-[var(--foreground-secondary,#666)] px-[8px] py-[8px]">No scribes found</p>
              )}
            </div>
          </Menu>
        </div>
      )}
    </div>
  );
}

function PreviewSidebar({ sections, width, needsRefresh, onRefresh, onSourceChange, onResizeStart }: {
  sections: TemplateSection[];
  width: number;
  needsRefresh: boolean;
  onRefresh: () => void;
  onSourceChange: () => void;
  onResizeStart: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="relative shrink-0 h-full bg-white border-l border-[var(--shape-outline,rgba(0,0,0,0.1))] flex flex-col" style={{ width }}>
      <div onMouseDown={onResizeStart} className="group absolute left-0 top-0 h-full w-[20px] -ml-[10px] cursor-col-resize z-10 flex items-center justify-center">
        <div className="h-[40px] w-[3px] rounded-full bg-transparent group-hover:bg-[rgba(0,0,0,0.2)] transition-colors" />
      </div>
      <div className="shrink-0 h-[56px] flex items-center justify-between gap-[12px] px-[24px]">
        <div className="flex items-center gap-[4px]">
          <span className="t-title-sm text-[var(--foreground-secondary,#666)]">Preview</span>
          {needsRefresh && (
            <Button
              variant="tertiary"
              size="small"
              prefix={<Icon name="refresh" size={16} />}
              onClick={onRefresh}
            >
              Refresh
            </Button>
          )}
        </div>
        <PreviewSourceDropdown onSourceChange={onSourceChange} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-[24px] pb-[24px]">
        <DynamicPreviewSections sections={sections} />
      </div>
      <div className="shrink-0 px-[24px] py-[12px] flex justify-end bg-white">
        <Button variant="primary" size="medium" prefix={<Icon name="save" size={18} />}>Save Template</Button>
      </div>
    </div>
  );
}

function MVPView({ mode, selectedTemplate }: { mode: Mode; selectedTemplate: string }) {
  const [templateName, setTemplateName] = useState("SOAP Note");
  const [sections, setSections] = useState<TemplateSection[]>(INITIAL_SECTIONS);
  const [activeId, setActiveId] = useState<string>(INITIAL_SECTIONS[0].subsections[0].id);
  const [drag, setDrag] = useState<{ sectionId: string; index: number } | null>(null);
  const [dragOver, setDragOver] = useState<{ sectionId: string; index: number } | null>(null);
  const [previewWidth, setPreviewWidth] = useState(440);
  const [previewNeedsRefresh, setPreviewNeedsRefresh] = useState(false);
  const resizing = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isJumping = useRef(false);

  useEffect(() => {
    const nextSections = selectedTemplate === "new-template"
      ? [
          { id: "hpi", name: "HPI", subsections: [] },
          { id: "ros", name: "ROS", subsections: [] },
          { id: "pe", name: "PE", subsections: [] },
          { id: "assessment-plan", name: "A&P", subsections: [] },
        ]
      : INITIAL_SECTIONS;
    setTemplateName(TEMPLATE_NAMES[selectedTemplate] ?? "SOAP Note");
    setSections(nextSections);
    setActiveId(nextSections[0]?.subsections[0]?.id ?? "");
    setPreviewNeedsRefresh(false);
  }, [selectedTemplate]);

  useEffect(() => {
    function move(e: MouseEvent) { if (!resizing.current) return; setPreviewWidth(Math.min(720, Math.max(320, window.innerWidth - e.clientX))); }
    function up() { resizing.current = false; document.body.style.cursor = ""; document.body.style.userSelect = ""; }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, []);

  function startResize(e: React.MouseEvent) { e.preventDefault(); resizing.current = true; document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; }

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isJumping.current) return;
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) { const id = (visible[0].target as HTMLElement).dataset.subid; if (id) setActiveId(id); }
      },
      { root, rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );
    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  function jumpTo(id: string) { setActiveId(id); isJumping.current = true; cardRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); window.setTimeout(() => { isJumping.current = false; }, 600); }
  function updateSub(updated: Subsection) {
    const current = sections.flatMap((section) => section.subsections).find((subsection) => subsection.id === updated.id);
    if (
      current &&
      (
        current.templateInstruction !== updated.templateInstruction ||
        current.customFormatting !== updated.customFormatting ||
        current.emptyState !== updated.emptyState
      )
    ) {
      setPreviewNeedsRefresh(true);
    }
    setSections((prev) => prev.map((sec) => ({ ...sec, subsections: sec.subsections.map((s) => s.id === updated.id ? updated : s) })));
  }
  function deleteSub(sectionId: string, id: string) { setSections((prev) => prev.map((sec) => sec.id === sectionId ? { ...sec, subsections: sec.subsections.filter((s) => s.id !== id) } : sec)); }
  function addSub(sectionId: string) {
    const sub = newSubsection();
    setPreviewNeedsRefresh(true);
    setSections((prev) => prev.map((sec) => sec.id === sectionId ? { ...sec, subsections: [...sec.subsections, sub] } : sec));
    window.setTimeout(() => jumpTo(sub.id), 50);
  }

  function handleDrop(sectionId: string, toIdx: number) {
    if (!drag) { setDragOver(null); return; }
    setSections((prev) => {
      let moved: Subsection | undefined;
      const withoutMoved = prev.map((sec) => {
        if (sec.id !== drag.sectionId) return sec;
        const subsections = [...sec.subsections];
        [moved] = subsections.splice(drag.index, 1);
        return { ...sec, subsections };
      });
      if (!moved) return prev;
      return withoutMoved.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const subsections = [...sec.subsections];
        subsections.splice(toIdx, 0, moved!);
        return { ...sec, subsections };
      });
    });
    setDrag(null); setDragOver(null);
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="shrink-0 h-[56px] flex items-center gap-[24px] pl-[16px] pr-[24px]">
          <EditableTitle value={templateName} onChange={setTemplateName} size="lg" />
        </div>
        <div className="flex-1 min-h-0 flex">
          <>
            <div className="w-[200px] shrink-0 h-full overflow-y-auto py-[8px]">
                {sections.map((sec) => (
                  <div key={sec.id} className="mb-[8px]">
                    <div
                      className="px-[16px] h-[28px] flex items-center"
                      onDragOver={(e) => { if (drag && sec.subsections.length === 0) { e.preventDefault(); setDragOver({ sectionId: sec.id, index: 0 }); } }}
                      onDrop={() => { if (sec.subsections.length === 0) handleDrop(sec.id, 0); }}
                    >
                      <span className="t-title-xs text-[var(--foreground-secondary,#666)]">{sec.name}</span>
                    </div>
                    <div className="relative px-[8px] flex flex-col gap-[2px]">
                      {sec.subsections.map((sub, idx) => {
                        const showDropLine = !!dragOver && dragOver.sectionId === sec.id && dragOver.index === idx && !!drag && (drag.sectionId !== sec.id || drag.index !== idx);
                        return (
                          <div key={sub.id} className="relative">
                            {showDropLine && <div className="absolute -top-[1px] left-[4px] right-[4px] h-[2px] rounded-full bg-[var(--accent,#1132ee)] z-10" />}
                            <OutlineRow sub={sub} active={sub.id === activeId} isDragOver={false} onJump={() => jumpTo(sub.id)}
                              onDragStart={() => setDrag({ sectionId: sec.id, index: idx })}
                              onDragOver={(e) => { e.preventDefault(); setDragOver({ sectionId: sec.id, index: idx }); }}
                              onDrop={() => handleDrop(sec.id, idx)}
                              onDragEnd={() => { setDrag(null); setDragOver(null); }} />
                          </div>
                        );
                      })}
                      {sec.subsections.length === 0 && drag && dragOver?.sectionId === sec.id && (
                        <div
                          className="absolute -top-[4px] left-[12px] right-[12px] h-[8px] z-10 flex items-center"
                          onDragOver={(e) => { e.preventDefault(); setDragOver({ sectionId: sec.id, index: 0 }); }}
                          onDrop={() => handleDrop(sec.id, 0)}
                        >
                          <div className="w-full h-[2px] rounded-full bg-[var(--accent,#1132ee)]" />
                        </div>
                      )}
                      {mode === "my" && (
                        <div
                          className="relative"
                          onDragOver={(e) => { if (drag && sec.subsections.length > 0) { e.preventDefault(); setDragOver({ sectionId: sec.id, index: sec.subsections.length }); } }}
                          onDrop={() => { if (sec.subsections.length > 0) handleDrop(sec.id, sec.subsections.length); }}
                        >
                          {drag && sec.subsections.length > 0 && dragOver?.sectionId === sec.id && dragOver.index === sec.subsections.length && (drag.sectionId !== sec.id || drag.index !== sec.subsections.length - 1) && (
                            <div className="absolute -top-[4px] left-[4px] right-[4px] h-[8px] z-10 flex items-center">
                              <div className="w-full h-[2px] rounded-full bg-[var(--accent,#1132ee)]" />
                            </div>
                          )}
                          <button onClick={() => addSub(sec.id)} className="w-full flex items-center gap-[8px] h-[30px] pl-[8px] rounded-[8px] text-left text-[var(--accent,#1132ee)] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors">
                            <Icon name="add" size={14} />
                            <span className="t-title-sm">Add subsection</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div ref={scrollRef} className="flex-1 min-w-0 overflow-y-auto">
                <div className="px-[24px] py-[24px] flex flex-col gap-[32px] max-w-[720px]">
                  {sections.map((sec) => (
                    <div key={sec.id} className="flex flex-col gap-[12px]">
                      <div className="flex items-center gap-[8px]">
                        <span className="t-title-lg text-[var(--foreground-primary,#1a1a1a)]">{sec.name}</span>
                      </div>
                      {sec.subsections.map((sub) => (
                        <SubsectionCard key={sub.id} mode={mode} sub={sub} onChange={updateSub} onDelete={() => deleteSub(sec.id, sub.id)}
                          registerRef={(el) => { if (el) cardRefs.current.set(sub.id, el); else cardRefs.current.delete(sub.id); }} />
                      ))}
                      {mode === "my" && (
                        <Button variant="tertiary" size="small" prefix={<Icon name="add" size={14} />} className="self-start" onClick={() => addSub(sec.id)}>Add subsection</Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
        </div>
      </div>
      <PreviewSidebar
        sections={sections}
        width={previewWidth}
        needsRefresh={previewNeedsRefresh}
        onRefresh={() => setPreviewNeedsRefresh(false)}
        onSourceChange={() => setPreviewNeedsRefresh(true)}
        onResizeStart={startResize}
      />
    </div>
  );
}

export default function MVPHeaderRefresh() {
  const [activeSection, setActiveSection] = useState<NavSection>("my-templates");
  const [selectedTemplate, setSelectedTemplate] = useState("soap-note");
  return (
    <CustomizeLayout activeSection={activeSection} selectedTemplate={selectedTemplate}
      onSectionChange={setActiveSection} onTemplateChange={setSelectedTemplate}>
      <MVPView mode={activeSection === "my-templates" ? "my" : "shared"} selectedTemplate={selectedTemplate} />
    </CustomizeLayout>
  );
}
