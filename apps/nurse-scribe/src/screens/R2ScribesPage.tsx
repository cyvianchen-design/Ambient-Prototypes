import React, { useState, useRef, useEffect, useMemo, useContext } from "react";
import { Icon, Button, IconButton, Checkbox, RadioGroup, NotificationDot, Menu, MenuItem, MenuHeader } from "@ds/ui";
import { ScribeStatusBadge } from "../components/StatusBadges";
import { NewScribeForm } from "../components/NewScribeForm";
import { RecordingContext } from "../context/RecordingContext";

type ScribeItemStatus = "Draft" | "Incomplete" | "Generated" | "Syncing" | "Synced";

type ScribeEntry = {
  id: string;
  assessmentType: string;
  date: string;
  time: string;
  status: ScribeItemStatus;
};

type PatientGroup = {
  patientId: string;
  name: string;
  patientMeta: string;
  scribes: ScribeEntry[];
};

const ALL_STATUSES: ScribeItemStatus[] = ["Draft", "Incomplete", "Generated", "Syncing", "Synced"];

const DATE_RANGE_OPTIONS = [
  { value: "today",   label: "Today" },
  { value: "past-7",  label: "Past 7 days" },
  { value: "past-30", label: "Past 30 days" },
  { value: "custom",  label: "Custom date range" },
];

const SORT_OPTIONS = [
  { value: "reverse-chron", label: "Reverse chronological (default)" },
  { value: "chron",         label: "Chronological" },
  { value: "name-az",       label: "Patient name (A–Z)" },
  { value: "name-za",       label: "Patient name (Z–A)" },
];

const DATE_INCLUDES: Record<string, string[]> = {
  "today":   ["Today"],
  "past-7":  ["Today", "Mon"],
  "past-30": ["Today", "Mon", "Sun"],
  "custom":  ["Today", "Mon", "Sun"],
};

const ALL_NOTE_TYPES: string[] = ["Admission Assessment", "Shift Assessment", "Triage", "Handoff", "End of Shift Narrative", "Discharge Summary", "ED Assessment"];

const patientGroups: PatientGroup[] = [
  {
    patientId: "p1", name: "Maria Santos", patientMeta: "Hip Fracture · 72 · F",
    scribes: [
      { id: "s_ds", assessmentType: "Discharge Summary",      date: "Today", time: "20:00", status: "Draft" },
      { id: "s_eo", assessmentType: "End of Shift Narrative", date: "Today", time: "19:30", status: "Generated" },
      { id: "s_ho", assessmentType: "Handoff",              date: "Today", time: "18:00", status: "Syncing" },
      { id: "s1",   assessmentType: "Shift Assessment",     date: "Today", time: "14:32", status: "Incomplete" },
      { id: "s_s1", assessmentType: "Shift Assessment",     date: "Mon",   time: "22:15", status: "Synced" },
      { id: "s6",   assessmentType: "Admission Assessment", date: "Sun",   time: "11:45", status: "Synced" },
      { id: "s_tr", assessmentType: "Triage",               date: "Sun",   time: "08:20", status: "Synced" },
    ],
  },
  {
    patientId: "p2", name: "James Vetrovs", patientMeta: "Pneumonia · 60 · M",
    scribes: [
      { id: "s7",  assessmentType: "End of Shift Narrative", date: "Mon", time: "21:10", status: "Synced" },
      { id: "s10", assessmentType: "Admission Assessment",   date: "Sun", time: "18:05", status: "Synced" },
      { id: "s11", assessmentType: "Triage",                 date: "Sun", time: "16:30", status: "Synced" },
    ],
  },
  {
    patientId: "p3", name: "Terry Philips", patientMeta: "DKA · 32 · F",
    scribes: [
      { id: "s8", assessmentType: "Admission Assessment", date: "Mon", time: "17:45", status: "Generated" },
      { id: "s9", assessmentType: "Triage",               date: "Mon", time: "14:20", status: "Synced" },
    ],
  },
  {
    patientId: "p4", name: "Robert Kim", patientMeta: "CHF · 67 · M",
    scribes: [
      { id: "s2", assessmentType: "Shift Assessment", date: "Today", time: "09:15", status: "Synced" },
    ],
  },
  {
    patientId: "p5", name: "Linda Torres", patientMeta: "Post-op Colectomy · 55 · F",
    scribes: [
      { id: "s3", assessmentType: "Triage", date: "Today", time: "08:45", status: "Draft" },
    ],
  },
  {
    patientId: "p6", name: "David Chen", patientMeta: "COPD Exacerbation · 45 · M",
    scribes: [
      { id: "s4", assessmentType: "ED Assessment", date: "Today", time: "07:30", status: "Incomplete" },
    ],
  },
  {
    patientId: "p7", name: "Sandra White", patientMeta: "Elective Hyst. · 38 · F",
    scribes: [
      { id: "s5", assessmentType: "Discharge Summary", date: "Today", time: "06:00", status: "Synced" },
    ],
  },
];

const DATE_ORDER = ["Today", "Mon", "Sun"];
const DATE_LABELS: Record<string, string> = {
  "Today": "Today, Jun 29",
  "Mon":   "Mon, Jun 22",
  "Sun":   "Sun, Jun 21",
};

function mostRecentDate(scribes: ScribeEntry[]) {
  for (const d of DATE_ORDER) {
    if (scribes.some((s) => s.date === d)) return d;
  }
  return scribes[scribes.length - 1]?.date ?? "";
}

type Props = {
  onSelectScribe: (id: string, template: string) => void;
};

export default function R2ScribesPage({ onSelectScribe }: Props) {
  const { startRecording } = useContext(RecordingContext);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [template, setTemplate] = useState("");
  const [visitType, setVisitType] = useState("In-Person");
  const [menuFor, setMenuFor] = useState<{ pid: string; top: number; left: number } | null>(null);
  const menuCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter panel state
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterPanelPos, setFilterPanelPos] = useState({ top: 0, left: 0 });
  const [draftDateRange, setDraftDateRange] = useState<string>("");
  const [draftSortBy, setDraftSortBy] = useState("reverse-chron");
  const [draftStatuses, setDraftStatuses] = useState<Set<ScribeItemStatus>>(new Set());
  const [draftNoteTypes, setDraftNoteTypes] = useState<Set<string>>(new Set());
  const [activeDateRange, setActiveDateRange] = useState<string | null>(null);
  const [activeSortBy, setActiveSortBy] = useState("reverse-chron");
  const [activeStatuses, setActiveStatuses] = useState<Set<ScribeItemStatus>>(new Set());
  const [activeNoteTypes, setActiveNoteTypes] = useState<Set<string>>(new Set());

  const filterBtnRef = useRef<HTMLDivElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node) &&
        filterBtnRef.current && !filterBtnRef.current.contains(e.target as Node)
      ) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleFilterClick() {
    if (filterOpen) { setFilterOpen(false); return; }
    if (filterBtnRef.current) {
      const rect = filterBtnRef.current.getBoundingClientRect();
      setFilterPanelPos({ top: rect.bottom + 4, left: rect.left });
    }
    setDraftDateRange(activeDateRange ?? "");
    setDraftSortBy(activeSortBy);
    setDraftStatuses(new Set(activeStatuses));
    setDraftNoteTypes(new Set(activeNoteTypes));
    setFilterOpen(true);
  }

  function applyFilter() {
    setActiveDateRange(draftDateRange || null);
    setActiveSortBy(draftSortBy);
    setActiveStatuses(new Set(draftStatuses));
    setActiveNoteTypes(new Set(draftNoteTypes));
    setFilterOpen(false);
  }

  function resetFilter() {
    setDraftDateRange("");
    setDraftSortBy("reverse-chron");
    setDraftStatuses(new Set());
    setDraftNoteTypes(new Set());
  }

  function toggleDraftStatus(status: ScribeItemStatus) {
    setDraftStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status); else next.add(status);
      return next;
    });
  }

  function toggleDraftNoteType(noteType: string) {
    setDraftNoteTypes((prev) => {
      const next = new Set(prev);
      if (next.has(noteType)) next.delete(noteType); else next.add(noteType);
      return next;
    });
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    onSelectScribe(id, template);
  }

  function cancelMenuClose() {
    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current);
  }
  function scheduleMenuClose() {
    cancelMenuClose();
    menuCloseTimer.current = setTimeout(() => setMenuFor(null), 180);
  }
  function openPatientMenu(pid: string, anchor: HTMLElement) {
    cancelMenuClose();
    const r = anchor.getBoundingClientRect();
    setMenuFor({ pid, top: r.top, left: r.right + 4 });
  }

  const displayGroups = useMemo(() => {
    let groups = patientGroups.map((pg) => {
      let scribes = [...pg.scribes];
      if (activeStatuses.size > 0) scribes = scribes.filter((s) => activeStatuses.has(s.status));
      if (activeNoteTypes.size > 0) scribes = scribes.filter((s) => activeNoteTypes.has(s.assessmentType));
      if (activeDateRange) {
        const allowed = DATE_INCLUDES[activeDateRange] || [];
        scribes = scribes.filter((s) => allowed.includes(s.date));
      }
      return { ...pg, scribes };
    }).filter((pg) => pg.scribes.length > 0);

    if (activeSortBy === "name-az") {
      groups.sort((a, b) => a.name.localeCompare(b.name));
      return [{ label: null as string | null, patients: groups }];
    }
    if (activeSortBy === "name-za") {
      groups.sort((a, b) => b.name.localeCompare(a.name));
      return [{ label: null as string | null, patients: groups }];
    }
    const order = activeSortBy === "chron" ? [...DATE_ORDER].reverse() : DATE_ORDER;
    return order
      .map((label) => ({ label, patients: groups.filter((pg) => mostRecentDate(pg.scribes) === label) }))
      .filter((g) => g.patients.length > 0);
  }, [activeStatuses, activeDateRange, activeSortBy, activeNoteTypes]);

  const hasActiveFilters = activeDateRange !== null || activeStatuses.size > 0 || activeNoteTypes.size > 0;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Secondary sidebar */}
      <div className="shrink-0 flex flex-col bg-white overflow-hidden relative w-[240px] h-screen border-r border-[var(--surface-3,#eee)]">
        {/* Header */}
        <div className="flex items-center px-[12px] h-[56px]">
          <span className="t-title-lg text-[var(--foreground-primary,#1a1a1a)]">My scribes</span>
        </div>

        {/* Search + Filter + Collapse row */}
        <div className="flex items-center justify-between px-[12px] py-[8px]">
          <div className="flex items-center gap-[4px]">
            <Button variant="tertiary" size="small" prefix={<Icon name="search" size={14} />}>Search</Button>
            <div ref={filterBtnRef} className="relative inline-flex">
              <Button variant="tertiary" size="small" prefix={<Icon name="filter_list" size={14} />} onClick={handleFilterClick}>Filter</Button>
              {hasActiveFilters && <span className="absolute top-[2px] right-[2px]"><NotificationDot variant="accent" /></span>}
            </div>
          </div>
        </div>

        {/* Patient list */}
        <div className="flex-1 overflow-y-auto pb-[80px]">
          {displayGroups.map((dg) => (
            <div key={dg.label ?? "sorted"}>
              {dg.label && (
                <div className="px-[12px] pt-[10px] pb-[4px] t-title-xs text-[var(--foreground-secondary,#666)]">
                  {DATE_LABELS[dg.label] ?? dg.label}
                </div>
              )}
              {dg.patients.map((pg, i) => {
                const hasSelected = pg.scribes.some((s) => selectedId === s.id);
                const recent = pg.scribes[0];
                const isSel = selectedId === recent?.id;
                return (
                  <div
                    key={pg.patientId}
                    style={{
                      borderTop: i > 0 ? "1px solid var(--surface-3,#eee)" : "none",
                      borderRight: hasSelected ? "3px solid var(--accent,#1132ee)" : "3px solid transparent",
                    }}
                  >
                    {/* Patient header — hover/click reveals all documentation types */}
                    <div
                      className="flex items-center justify-between pl-[16px] pr-[12px] pt-[10px] pb-[4px] cursor-pointer hover:bg-[var(--surface-1,#f7f7f7)]"
                      onMouseEnter={(e) => openPatientMenu(pg.patientId, e.currentTarget)}
                      onMouseLeave={scheduleMenuClose}
                      onClick={(e) => {
                        openPatientMenu(pg.patientId, e.currentTarget);
                        const parts = pg.name.split(" ");
                        setFirstName(parts[0] ?? "");
                        setLastName(parts.slice(1).join(" "));
                      }}
                    >
                      <div className="min-w-0">
                        <div className="t-title-sm text-[var(--foreground-primary,#1a1a1a)] truncate">{pg.name}</div>
                        <div className="t-body-xs text-[var(--foreground-secondary,#666)] mt-[1px] truncate">{pg.patientMeta}</div>
                      </div>
                      <Icon name="expand_more" size={16} className="text-[var(--foreground-secondary,#666)] shrink-0" />
                    </div>
                    {/* Default: most recent scribe */}
                    {recent && (
                      <div
                        onClick={() => handleSelect(recent.id)}
                        className={`pl-[36px] pr-[16px] py-[8px] mb-[6px] cursor-pointer transition-colors ${isSel ? "bg-[var(--litmus-25,#f1f3fe)]" : "hover:bg-[var(--surface-1,#f7f7f7)]"}`}
                      >
                        <div className="flex items-center justify-between gap-[6px]">
                          <span className={`${isSel ? "t-title-sm" : "t-body-sm"} text-[var(--foreground-primary,#1a1a1a)] truncate`}>
                            {recent.assessmentType}
                          </span>
                          <ScribeStatusBadge status={recent.status} />
                        </div>
                        <div className="t-body-xs text-[var(--foreground-secondary,#666)] mt-[2px]">Most recent · {recent.time}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom sticky bar */}
        <div className="absolute bottom-0 bg-white w-[240px] px-[12px] pt-[8px] pb-[24px] border-t border-[var(--surface-3,#eee)] box-border">
          <Button
            variant="secondary"
            size="large"
            className="w-full"
            prefix={<Icon name="mic" size={18} />}
            onClick={() => { setFirstName(""); setLastName(""); setTemplate(""); setSelectedId(null); }}
          >
            Record new scribe
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div
          ref={filterPanelRef}
          className="fixed z-[1000] bg-white rounded-[10px] w-[256px] max-h-[480px] overflow-hidden flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.16),0_2px_8px_rgba(0,0,0,0.08)]"
          style={{ top: filterPanelPos.top, left: filterPanelPos.left }}
        >
          <div className="overflow-y-auto px-[14px] pt-[14px] pb-[4px]">
            <div className="t-title-sm text-[var(--foreground-primary,#1a1a1a)] mb-[10px]">All filters</div>

            <div className="mb-[12px]">
              <div className="t-title-xs text-[var(--foreground-secondary,#666)] mb-[6px]">Filter by date range</div>
              <RadioGroup options={DATE_RANGE_OPTIONS} value={draftDateRange} onChange={setDraftDateRange} />
            </div>

            <div className="mb-[12px]">
              <div className="t-title-xs text-[var(--foreground-secondary,#666)] mb-[6px]">Sort by</div>
              <RadioGroup options={SORT_OPTIONS} value={draftSortBy} onChange={setDraftSortBy} />
            </div>

            <div className="mb-[12px]">
              <div className="t-title-xs text-[var(--foreground-secondary,#666)] mb-[6px]">Filter by status</div>
              <div className="flex flex-col gap-[4px]">
                {ALL_STATUSES.map((status) => (
                  <label key={status} className="flex items-center gap-[6px] cursor-pointer">
                    <Checkbox state={draftStatuses.has(status) ? "selected" : "unselected"} onChange={() => toggleDraftStatus(status)} />
                    <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)]">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-[6px]">
              <div className="t-title-xs text-[var(--foreground-secondary,#666)] mb-[6px]">Filter by note type</div>
              <div className="flex flex-col gap-[4px]">
                {ALL_NOTE_TYPES.map((noteType) => (
                  <label key={noteType} className="flex items-center gap-[6px] cursor-pointer">
                    <Checkbox state={draftNoteTypes.has(noteType) ? "selected" : "unselected"} onChange={() => toggleDraftNoteType(noteType)} />
                    <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)]">{noteType}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-[14px] pt-[10px] pb-[14px] border-t border-[var(--surface-3,#eee)] bg-white shrink-0">
            <Button variant="tertiary" size="small" onClick={resetFilter}>Reset all</Button>
            <Button variant="primary" size="small" onClick={applyFilter}>Apply</Button>
          </div>
        </div>
      )}

      {/* Floating documentation-type menu (hover/click a patient) */}
      {menuFor && (() => {
        const pg = patientGroups.find((p) => p.patientId === menuFor.pid);
        if (!pg) return null;
        return (
          <div
            className="fixed z-[1000]"
            style={{ top: menuFor.top, left: menuFor.left }}
            onMouseEnter={cancelMenuClose}
            onMouseLeave={scheduleMenuClose}
          >
            <Menu className="w-[248px] max-h-[320px] overflow-y-auto">
              <MenuHeader>{pg.name} · documentation</MenuHeader>
              {pg.scribes.map((s) => (
                <MenuItem
                  key={s.id}
                  label={s.assessmentType}
                  description={s.time}
                  selected={selectedId === s.id}
                  trailing={<ScribeStatusBadge status={s.status} />}
                  onClick={() => { handleSelect(s.id); setMenuFor(null); }}
                />
              ))}
            </Menu>
          </div>
        );
      })()}

      {/* Main content */}
      <NewScribeForm
        title="New scribe"
        firstName={firstName}
        lastName={lastName}
        template={template}
        visitType={visitType}
        onFirstName={setFirstName}
        onLastName={setLastName}
        onTemplate={setTemplate}
        onVisitType={setVisitType}
        onStart={() => {
          const name = [firstName, lastName].filter(Boolean).join(" ");
          if (!name || !template) return;
          startRecording({ patientName: name, template, visitType });
        }}
      />
    </div>
  );
}
