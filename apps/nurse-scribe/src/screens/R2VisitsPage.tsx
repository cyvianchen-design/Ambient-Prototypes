import React, { useState, useRef, useEffect, useContext } from "react";
import { IconButton, Button, TextField, Menu, MenuItem, Icon, SecondaryNavItem } from "@ds/ui";
import { PatientStatusBadge } from "../components/StatusBadges";
import { PrevisitContent } from "../components/PrevisitContent";
import { AssistantSidebar } from "../components/AssistantSidebar";
import { RecordingContext } from "../context/RecordingContext";

type Visit = {
  id: string;
  name: string;
  diagnosis: string;
  age: number;
  gender: "M" | "F" | "Other";
  room: string;
  status: string;
};

const visits: Visit[] = [
  { id: "v0", name: "Emily Park",    diagnosis: "Chest Pain",               age: 52, gender: "F", room: "—",      status: "In Queue" },
  { id: "v00", name: "Marcus Webb",  diagnosis: "Abdominal Pain",           age: 34, gender: "M", room: "—",      status: "In Queue" },
  { id: "v1", name: "Maria Santos",  diagnosis: "Hip Fracture",             age: 72, gender: "F", room: "Bed 4B", status: "Admitted" },
  { id: "v2", name: "Robert Kim",    diagnosis: "Congestive Heart Failure", age: 67, gender: "M", room: "Bed 3A", status: "Observation" },
  { id: "v3", name: "Linda Torres",  diagnosis: "Post-op Colectomy",        age: 55, gender: "F", room: "Bed 2C", status: "Discharge Pending" },
  { id: "v4", name: "David Chen",    diagnosis: "COPD Exacerbation",        age: 45, gender: "M", room: "ICU-7",  status: "Critical" },
  { id: "v5", name: "Sandra White",  diagnosis: "Elective Hysterectomy",    age: 38, gender: "F", room: "Bed 5D", status: "Post-Op" },
];

const TEMPLATES = [
  "Admission Assessment", "Shift Assessment", "Handoff", "End of Shift Narrative",
  "Pre Admission Summary", "Discharge", "ED Gold Standard - HCA", "Progress Note", "Meeting Note",
];

export default function R2VisitsPage() {
  const { startRecording } = useContext(RecordingContext);
  const [selectedId, setSelectedId] = useState<string>("v1");
  const [template, setTemplate] = useState("Shift Assessment");
  const [templateOpen, setTemplateOpen] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (templateRef.current && !templateRef.current.contains(e.target as Node)) setTemplateOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const patient = visits.find((v) => v.id === selectedId) ?? visits[0];

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Patient list sidebar — matches the visit-tab secondary nav */}
      <div className="shrink-0 flex flex-col bg-white overflow-hidden w-[240px] h-screen border-r border-[var(--surface-3,#eee)]">
        <div className="flex items-center h-[48px] shrink-0 px-[8px] gap-[4px]">
          <button className="flex-1 text-left t-title-md text-[var(--foreground-primary,#1a1a1a)] px-[8px] py-[4px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] outline-none">
            Jun 22nd, Today
          </button>
          <IconButton icon={<Icon name="keyboard_arrow_left" size={16} />} variant="tertiary-neutral" size="small" aria-label="Previous day" />
          <IconButton icon={<Icon name="keyboard_arrow_right" size={16} />} variant="tertiary-neutral" size="small" aria-label="Next day" />
        </div>
        <div className="flex items-center gap-[8px] px-[12px] py-[8px] shrink-0">
          <Button variant="tertiary" size="small" prefix={<Icon name="search" size={14} />}>Search</Button>
          <Button variant="tertiary" size="small" prefix={<Icon name="filter_list" size={14} />}>Filter</Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {visits.map((v) => (
            <SecondaryNavItem
              key={v.id}
              name={v.name}
              age={v.age}
              gender={v.gender}
              chiefComplaint={v.diagnosis}
              time={v.room}
              statusSlot={<PatientStatusBadge status={v.status} />}
              isSelected={selectedId === v.id}
              onClick={() => setSelectedId(v.id)}
            />
          ))}
        </div>
        <div className="shrink-0 p-[12px]">
          <Button variant="primary" size="medium" className="w-full" prefix={<Icon name="mic" size={16} filled />}>Start Instant Visit</Button>
        </div>
      </div>

      {/* Previsit main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        {/* Patient header */}
        <div className="flex items-end h-[60px] shrink-0 px-[24px] pb-[8px] pt-[12px] gap-[16px]">
          <div className="flex items-end gap-[16px] flex-1 min-w-0">
            <p className="t-title-xl text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap m-0">{patient.name}</p>
            <div className="t-body-sm text-[var(--foreground-secondary,#666)] pb-[2px] whitespace-nowrap truncate">
              {patient.age} · {patient.gender} · {patient.diagnosis} · {patient.room}
            </div>
          </div>
          <div className="flex items-center gap-[16px] shrink-0">
            <div className="flex items-center gap-[4px]">
              <IconButton icon={<Icon name="refresh" size={16} />} size="small" aria-label="Regenerate previsit" />
              <span className="t-body-sm text-[var(--foreground-secondary,#666)] whitespace-nowrap">Updated Jun 22, 14:32</span>
            </div>
            <div className="flex items-center gap-[4px]">
              <IconButton icon={<Icon name="thumb_up" size={16} />} size="small" aria-label="Thumbs up" />
              <IconButton icon={<Icon name="thumb_down" size={16} />} size="small" aria-label="Thumbs down" />
            </div>
            <IconButton icon={<Icon name="more_vert" size={16} />} variant="tertiary-neutral" size="small" aria-label="More options" />
          </div>
        </div>

        {/* Previsit content */}
        <div className="flex-1 overflow-y-auto px-[24px] pt-[8px] pb-[16px]">
          <PrevisitContent patient={patient} />
        </div>

        {/* Bottom bar: template + visit type + start recording */}
        <div className="shrink-0 bg-white px-[24px] py-[12px] flex items-center gap-[12px]">
          <div ref={templateRef} className="relative w-[220px]">
            <TextField
              value={template}
              placeholder="Select template"
              size="M"
              readOnly
              onClick={() => setTemplateOpen((o) => !o)}
              suffix={<Icon name={templateOpen ? "arrow_drop_up" : "arrow_drop_down"} size={20} />}
              className="cursor-pointer"
            />
            {templateOpen && (
              <div className="absolute left-0 right-0 bottom-full mb-[4px] z-20">
                <Menu className="w-full max-h-[240px] overflow-y-auto">
                  {TEMPLATES.map((t) => (
                    <MenuItem key={t} label={t} selected={template === t} onClick={() => { setTemplate(t); setTemplateOpen(false); }} />
                  ))}
                </Menu>
              </div>
            )}
          </div>
          <Button
            variant="primary"
            size="medium"
            className="ml-auto"
            prefix={<Icon name="mic" size={16} filled />}
            disabled={!template}
            onClick={() => startRecording({ patientName: patient.name, template, visitType: "In-Person" })}
          >
            Start recording
          </Button>
        </div>
      </div>

      {/* Assistant sidebar */}
      <AssistantSidebar
        suggestions={[
          { icon: "ink_highlighter", text: "What should I know before this visit?" },
          { icon: "fact_check", text: "What should I make sure to cover today?" },
          { icon: "chat_info", text: "Any risks or concerns I should be aware of?" },
          { icon: "trending_up", text: "Summarize trends in this patient's results." },
        ]}
        sources={[
          { title: "Admission note", detail: "Jun 22, 2026 · Physician 360" },
          { title: "Problem list", detail: "Jun 22 · Medical record" },
          { title: "Flowsheet — vitals", detail: "Today, 06:00" },
        ]}
      />
    </div>
  );
}
