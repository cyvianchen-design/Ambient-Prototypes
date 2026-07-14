import React, { useState, useRef, useEffect, useMemo } from "react";
import { Icon, MagicButton, MagicEdit, Button, IconButton, Tabs, Chip, Citation, RadioGroup, Checkbox, SplitButton, PopUp, Snackbar, NotificationDot, Divider, ScribeLongField, ScribeShortField, Menu, MenuItem } from "@ds/ui";
import { ScribeStatusBadge } from "../components/StatusBadges";
import { AssistantSidebar } from "../components/AssistantSidebar";
type ScribeItemStatus = "Draft" | "Incomplete" | "Generated" | "Syncing" | "Synced";

// ─── Sidebar scribes ──────────────────────────────────────────────────────────
type SidebarScribeEntry = { id: string; assessmentType: string; date: string; time: string; status: ScribeItemStatus };
type SidebarPatientGroup = { patientId: string; name: string; patientMeta: string; scribes: SidebarScribeEntry[] };

const SIDEBAR_STATUS_COLORS: Record<ScribeItemStatus, { color: string; icon: string }> = {
  "Draft":      { color: "#666666", icon: "edit_note" },
  "Incomplete": { color: "#cc7a00", icon: "warning" },
  "Generated":  { color: "#3f8d43", icon: "check" },
  "Syncing":    { color: "#1132ee", icon: "autorenew" },
  "Synced":     { color: "#3f8d43", icon: "cloud_done" },
};

const SIDEBAR_ALL_STATUSES: ScribeItemStatus[] = ["Draft", "Incomplete", "Generated", "Syncing", "Synced"];
const SIDEBAR_DATE_RANGE_OPTIONS = [
  { value: "today",   label: "Today" },
  { value: "past-7",  label: "Past 7 days" },
  { value: "past-30", label: "Past 30 days" },
  { value: "custom",  label: "Custom date range" },
];
const SIDEBAR_SORT_OPTIONS = [
  { value: "reverse-chron", label: "Reverse Chronological (Default)" },
  { value: "chron",         label: "Chronological" },
  { value: "name-az",       label: "Patient Name (A-Z)" },
  { value: "name-za",       label: "Patient Name (Z-A)" },
];
const SIDEBAR_DATE_INCLUDES: Record<string, string[]> = {
  "today":   ["Today"],
  "past-7":  ["Today", "Mon"],
  "past-30": ["Today", "Mon", "Sun"],
  "custom":  ["Today", "Mon", "Sun"],
};
const SIDEBAR_DATE_ORDER = ["Today", "Mon", "Sun"];
const SIDEBAR_ALL_NOTE_TYPES: string[] = ["Admission Assessment", "Shift Assessment", "Triage", "Handoff", "End of Shift Narrative", "Discharge Summary", "ED Assessment"];

// ─── Citations ────────────────────────────────────────────────────────────────
type CitationSource =
  | { type: "transcript"; num: number; quote: string }
  | { type: "manual"; by: string; time: string };

const SHIFT_CITATIONS: Record<string, CitationSource> = {
  "admitted-from":          { type: "transcript", num: 1, quote: '"She came up directly from the ED — no stops, straight to bed 4B."' },
  "vte-risk":               { type: "transcript", num: 2, quote: '"Patient is post-op day 2, limited mobility, so I flagged her as high risk for VTE on admission."' },
  "s-pain-present":         { type: "transcript", num: 3, quote: '"She is still reporting pain at the surgical site, rates it a 4 out of 10 this morning."' },
  "s-orientation":          { type: "transcript", num: 3, quote: '"She knew her name, where she was, what day it was, and why she was here."' },
  "s-gcs-eye":              { type: "transcript", num: 3, quote: '"Eyes open spontaneously when I walked in."' },
  "s-gcs-verbal":           { type: "transcript", num: 3, quote: '"She answered all my questions clearly and appropriately."' },
  "s-gcs-motor":            { type: "transcript", num: 3, quote: '"Following commands — squeezed my fingers bilaterally."' },
  "s-activity":             { type: "transcript", num: 4, quote: '"She ambulated to the bathroom with PT assist this morning — first time since surgery."' },
  "s-wound-appear":         { type: "transcript", num: 4, quote: '"Wound looked clean and dry on my assessment — no drainage, intact closure."' },
  "s-pain-quality":         { type: "transcript", num: 3, quote: '"She describes it as more of an aching feeling now, better than the sharp pain right after surgery."' },
  "Date of Arrival on Unit":  { type: "transcript", num: 1, quote: '"She came to the unit on June 22nd, early afternoon."' },
  "Time of Arrival on Unit":  { type: "transcript", num: 1, quote: '"She arrived around 14:30 — I noted it when I did the initial assessment."' },
  "Patient Stated Complaint": { type: "transcript", num: 5, quote: '"I was walking to the bathroom and slipped. Sharp pain in my right hip, I couldn\'t get up."' },
  "Location":                 { type: "transcript", num: 3, quote: '"Pain is right at the hip, right where they operated."' },
  "Response to Treatment":    { type: "transcript", num: 3, quote: '"The scheduled pain meds brought it down to about a 4, she said."' },
  "Drain output (last 4h)":   { type: "manual", by: "Sarah Chen, RN", time: "Today, 08:00" },
  "Dressing last changed":    { type: "manual", by: "Sarah Chen, RN", time: "Today, 08:00" },
  "Patient":                  { type: "transcript", num: 5, quote: '"She gave me her own history — very coherent and detailed."' },
  "Medical record":           { type: "transcript", num: 6, quote: '"Cross-referenced her history with the medical record on file — consistent."' },
  // Admission / Triage fields
  "mode-of-arrival":          { type: "transcript", num: 1, quote: '"They brought her in on a stretcher from the ambulance bay."' },
  "pain-present":             { type: "transcript", num: 3, quote: '"She reported pain right away — said it was about an 8 out of 10 when she arrived."' },
  "triage-esi":               { type: "transcript", num: 1, quote: '"Paramedics called ahead — hip fracture, hemodynamically stable, triaged as ESI 2."' },
  "triage-arrival":           { type: "transcript", num: 1, quote: '"EMS brought her in on a stretcher, direct from scene."' },
  "triage-pain-present":      { type: "transcript", num: 1, quote: '"She was clearly in pain when she arrived — facial grimacing, guarding the right hip."' },
  "Chief Complaint":          { type: "transcript", num: 1, quote: '"Right hip pain after a fall at home, unable to bear weight — that\'s what the paramedics handed off."' },
  // Handoff fields
  "Key update this shift":    { type: "manual", by: "Sarah Chen, RN", time: "Today, 19:30" },
  // Safety measures checkbox — multi-badge adjacent citations demo
  "Call light in reach":      { type: "transcript", num: 4, quote: '"Call light is clipped to the rail right where she can reach it."' },
  "Bed in low position":      { type: "transcript", num: 5, quote: '"Bed was in the lowest setting — I checked before I left the room."' },
  "Side rails up ×2":         { type: "transcript", num: 6, quote: '"Both side rails up, bilateral."' },
};

function getCitation(_template: string, key: string): CitationSource | null {
  return SHIFT_CITATIONS[key] ?? null;
}

function sameSource(a: CitationSource | null, b: CitationSource | null): boolean {
  if (!a || !b || a.type !== b.type) return false;
  if (a.type === "transcript" && b.type === "transcript") return a.num === b.num;
  return true;
}

// Scribes listed oldest → newest (clinical journey order: Triage first, Handoff last)
const sidebarPatients: SidebarPatientGroup[] = [
  {
    patientId: "p1", name: "Maria Santos", patientMeta: "Hip Fracture · 72 · F",
    scribes: [
      { id: "d_ds", assessmentType: "Discharge Summary",      date: "Today", time: "20:00", status: "Draft" },
      { id: "d_eo", assessmentType: "End of Shift Narrative", date: "Today", time: "19:30", status: "Generated" },
      { id: "d_ho", assessmentType: "Handoff",              date: "Today", time: "18:00", status: "Syncing" },
      { id: "d1",   assessmentType: "Shift Assessment",     date: "Today", time: "14:32", status: "Incomplete" },
      { id: "d_s1", assessmentType: "Shift Assessment",     date: "Mon",   time: "22:15", status: "Synced" },
      { id: "d6",   assessmentType: "Admission Assessment", date: "Sun",   time: "11:45", status: "Synced" },
      { id: "d_tr", assessmentType: "Triage",               date: "Sun",   time: "08:20", status: "Synced" },
    ],
  },
  {
    patientId: "p2", name: "James Vetrovs", patientMeta: "Pneumonia · 60 · M",
    scribes: [
      { id: "d7",  assessmentType: "End of Shift Narrative", date: "Mon", time: "21:10", status: "Synced" },
      { id: "d10", assessmentType: "Admission Assessment",   date: "Sun", time: "18:05", status: "Synced" },
      { id: "d11", assessmentType: "Triage",                 date: "Sun", time: "16:30", status: "Synced" },
    ],
  },
  {
    patientId: "p3", name: "Terry Philips", patientMeta: "DKA · 32 · F",
    scribes: [
      { id: "d8", assessmentType: "Admission Assessment", date: "Mon", time: "17:45", status: "Generated" },
      { id: "d9", assessmentType: "Triage",               date: "Mon", time: "14:20", status: "Synced" },
    ],
  },
  {
    patientId: "p4", name: "Robert Kim", patientMeta: "CHF · 67 · M",
    scribes: [
      { id: "d2", assessmentType: "Shift Assessment", date: "Today", time: "09:15", status: "Synced" },
    ],
  },
  {
    patientId: "p5", name: "Linda Torres", patientMeta: "Post-op Colectomy · 55 · F",
    scribes: [
      { id: "d3", assessmentType: "Triage", date: "Today", time: "08:45", status: "Draft" },
    ],
  },
  {
    patientId: "p6", name: "David Chen", patientMeta: "COPD Exacerbation · 45 · M",
    scribes: [
      { id: "d4", assessmentType: "ED Assessment", date: "Today", time: "07:30", status: "Incomplete" },
    ],
  },
  {
    patientId: "p7", name: "Sandra White", patientMeta: "Elective Hyst. · 38 · F",
    scribes: [
      { id: "d5", assessmentType: "Discharge Summary", date: "Today", time: "06:00", status: "Synced" },
    ],
  },
];

// Chronological (oldest → newest) comparator for the notes within a patient.
function chronoAscending(a: SidebarScribeEntry, b: SidebarScribeEntry) {
  const da = SIDEBAR_DATE_ORDER.indexOf(a.date);
  const db = SIDEBAR_DATE_ORDER.indexOf(b.date);
  if (da !== db) return db - da; // higher index = older date → comes first
  return a.time.localeCompare(b.time); // earlier time first
}

// Default landing note = the most recent (latest) note of the first patient.
const DEFAULT_SCRIBE_ID = (() => {
  const first = [...sidebarPatients[0].scribes].sort(chronoAscending);
  return first[first.length - 1]?.id ?? "d1";
})();

// Flat index of every note → its patient + entry, so any patient's note is selectable.
const NOTE_INDEX: Record<string, { patientId: string; name: string; meta: string; entry: SidebarScribeEntry }> = {};
sidebarPatients.forEach(pg => pg.scribes.forEach(entry => {
  NOTE_INDEX[entry.id] = { patientId: pg.patientId, name: pg.name, meta: pg.patientMeta, entry };
}));

// The newest (latest) note id for a given patient.
function newestNoteIdFor(patientId: string) {
  const pg = sidebarPatients.find(p => p.patientId === patientId);
  if (!pg) return "";
  return [...pg.scribes].sort(chronoAscending).slice(-1)[0]?.id ?? "";
}

// ─── Row types ───────────────────────────────────────────────────────────────
// radio    — single select: ALL options shown, selected highlighted, click any to change
// checkbox — multi select: ALL options shown with check state, click any to toggle
// grid     — label + value boxes (measurements, free text)
// score    — scored tool with bar
// narrative — paragraph, click to edit inline

type RadioRow     = { kind: "radio";     id: string; label: string; options: string[]; selected: string | null; required?: boolean };
type CheckboxRow  = { kind: "checkbox";  id: string; label: string; items: { text: string; checked: boolean }[]; required?: boolean };
type GridRow      = { kind: "grid";      cols?: 2 | 3; fields: { label: string; value: string; required?: boolean }[] };
type ScoreRow     = { kind: "score";     items: { label: string; value: number; max: number; risk?: string; riskColor?: string }[] };
type NarrativeRow = { kind: "narrative"; id: string; text: string };
type SectionRow   = RadioRow | CheckboxRow | GridRow | ScoreRow | NarrativeRow;

// Hierarchy: Section → SubSection → Row
type SubSection   = { title: string; rows: SectionRow[] };
type NurseSection = { id: string; title: string; subSections: SubSection[] };

// ─── Admission Assessment ────────────────────────────────────────────────────
const admissionSections: NurseSection[] = [
  {
    id: "gen", title: "Admission Information",
    subSections: [
      {
        title: "General",
        rows: [
          { kind: "grid", cols: 2, fields: [
            { label: "Date of Arrival on Unit", value: "Jun 22, 2026", required: true },
            { label: "Time of Arrival on Unit", value: "14:32", required: true },
          ]},
          { kind: "radio", id: "admitted-from", label: "Admitted From", required: true,
            options: ["Home", "Emergency Dept", "Direct Admit", "Intrahospital Transfer", "Hospital to Hospital Transfer", "Long-term Nursing Facility"],
            selected: "Emergency Dept" },
          { kind: "radio", id: "mode-of-arrival", label: "Mode of Arrival", required: true,
            options: ["Ambulatory", "Stretcher", "Wheelchair", "Bed", "Portable"],
            selected: null },
          { kind: "grid", cols: 1, fields: [
            { label: "Patient Stated Complaint", value: "\"I was walking to the bathroom and slipped on the wet floor. I felt a sharp pain in my right hip and couldn't get up. My neighbor heard me fall and called 911. The pain is about an 8 out of 10, it's constant, and my leg feels like it's turning inward.\"", required: true },
          ]},
          { kind: "grid", cols: 2, fields: [
            { label: "Onset of Chief Complaint", value: "This morning, ~08:00" },
            { label: "Self Treatment of Chief Complaint", value: "None" },
          ]},
          { kind: "grid", cols: 2, fields: [
            { label: "Language", value: "English" },
          ]},
          { kind: "checkbox", id: "history-by", label: "History Provided By", required: true,
            items: [
              { text: "Patient", checked: true },
              { text: "Family member", checked: false },
              { text: "Friend", checked: false },
              { text: "Significant other", checked: false },
              { text: "Medical record", checked: true },
              { text: "Unable to obtain history", checked: false },
            ]},
          { kind: "radio", id: "clinical-trial", label: "Clinical Trial Participant",
            options: ["Yes", "No"], selected: "No" },
        ],
      },
      {
        title: "VTE Admission Information",
        rows: [
          { kind: "radio", id: "vte-risk", label: "VTE Risk Level", required: true,
            options: ["High", "Medium", "Low"], selected: "Medium" },
          { kind: "radio", id: "vte-prior", label: "VTE Prior to Admission?",
            options: ["Yes", "No"], selected: "No" },
        ],
      },
    ],
  },
  {
    id: "neuro", title: "Neurological Assessment",
    subSections: [
      {
        title: "Signs and Symptoms",
        rows: [
          { kind: "checkbox", id: "neuro-sx", label: "Neurological Symptoms",
            items: [
              { text: "None", checked: false },
              { text: "Dizziness", checked: false },
              { text: "Focal Weakness", checked: false },
              { text: "Tingling", checked: false },
              { text: "Paresthesias", checked: false },
              { text: "Convulsions", checked: false },
              { text: "Loss of Vision", checked: false },
              { text: "Abnormal Movements", checked: false },
              { text: "Vertigo", checked: false },
              { text: "Weakness", checked: false },
              { text: "Numbness", checked: false },
              { text: "Sensory Deficit", checked: false },
              { text: "Abnormal Hearing", checked: false },
              { text: "Tremors", checked: false },
              { text: "Disequilibrium", checked: false },
              { text: "Abnormal Gait", checked: false },
              { text: "Burning Sensation", checked: false },
              { text: "Restless Legs", checked: false },
              { text: "Behavioral Changes", checked: false },
              { text: "Abnormal Speech", checked: false },
              { text: "Lack of Coordination", checked: false },
              { text: "Syncope", checked: false },
              { text: "Frequent Falls", checked: true },
              { text: "Radicular Pain", checked: false },
              { text: "Seizure", checked: false },
              { text: "Memory Loss", checked: false },
            ]},
        ],
      },
      {
        title: "Glasgow Coma Scale",
        rows: [
          { kind: "radio", id: "gcs-eye", label: "Eye Opening",
            options: ["Spontaneous", "To sound", "To pressure", "None"], selected: "Spontaneous" },
          { kind: "radio", id: "gcs-verbal", label: "Verbal Response",
            options: ["Oriented", "Confused", "Words", "Sounds", "None"], selected: "Oriented" },
          { kind: "radio", id: "gcs-motor", label: "Motor Response",
            options: ["Obey commands", "Localizing", "Normal flexion", "Abnormal flexion", "Extension", "None"],
            selected: "Obey commands" },
          { kind: "score", items: [{ label: "Glasgow Coma Scale Total", value: 15, max: 15, risk: "Normal", riskColor: "#3f8d43" }] },
        ],
      },
      {
        title: "Orientation",
        rows: [
          { kind: "radio", id: "orientation", label: "Patient Orientation",
            options: ["Person", "Time", "Age", "Day of week", "Month", "Normal for Patient", "Understands concepts"],
            selected: "Normal for Patient" },
          { kind: "checkbox", id: "aroused-to", label: "Aroused To",
            items: [
              { text: "Normal for Patient", checked: true },
              { text: "Name", checked: false },
              { text: "Shaking", checked: false },
              { text: "Light Pain", checked: false },
              { text: "Deep Pain", checked: false },
              { text: "Sternal Rub", checked: false },
            ]},
        ],
      },
      {
        title: "Cognitive",
        rows: [
          { kind: "radio", id: "comprehension", label: "Comprehension Ability",
            options: ["No Impairment", "Understands Concepts", "Mild Impairment", "Moderate Impairment", "Severe Impairment", "Unable to Comprehend"],
            selected: "No Impairment" },
          { kind: "radio", id: "memory", label: "Memory Description",
            options: ["Normal for Patient", "Intact", "Recent Intact", "Recent Impaired", "Remote Impaired", "Impaired"],
            selected: "Normal for Patient" },
          { kind: "checkbox", id: "speech-pattern", label: "Speech Pattern",
            items: [
              { text: "Clear", checked: true },
              { text: "Normal Speed", checked: true },
              { text: "Normal Intonation", checked: true },
              { text: "Normal Volume", checked: true },
              { text: "Coherent", checked: true },
              { text: "Appropriate", checked: true },
              { text: "Slurred", checked: false },
              { text: "Rambling", checked: false },
              { text: "Soft Spoken", checked: false },
              { text: "Garbled", checked: false },
              { text: "Excessive", checked: false },
              { text: "Stuttering", checked: false },
              { text: "Difficulty Finding Words", checked: false },
              { text: "No Speech", checked: false },
              { text: "Poor Articulation", checked: false },
              { text: "Artificially Ventilated", checked: false },
            ]},
          { kind: "radio", id: "neuro-level", label: "Level of Consciousness",
            options: ["Alert", "Drowsy", "Obtunded", "Stuporous", "Comatose"],
            selected: null },
          { kind: "radio", id: "neuro-pupils", label: "Pupils",
            options: ["PERRL", "Unequal", "Dilated", "Constricted", "Non-reactive"],
            selected: null },
          { kind: "radio", id: "neuro-grip", label: "Grip Strength",
            options: ["Strong bilaterally", "Weak left", "Weak right", "Weak bilaterally", "Absent"],
            selected: null },
          { kind: "checkbox", id: "patient-behavior", label: "Patient Behavior",
            items: [
              { text: "Normal for Patient", checked: true },
              { text: "Appropriate", checked: true },
              { text: "Aggressive", checked: false },
              { text: "Crying", checked: false },
              { text: "Restless", checked: false },
              { text: "Uncooperative", checked: false },
              { text: "Belligerent", checked: false },
              { text: "Impulsive", checked: false },
              { text: "Wandering", checked: false },
              { text: "Anxious", checked: false },
              { text: "Dependent", checked: false },
              { text: "Guarded", checked: false },
              { text: "Distractible", checked: false },
              { text: "Talkative", checked: false },
              { text: "Resistive to Care", checked: false },
              { text: "Combative", checked: false },
              { text: "Confused", checked: false },
            ]},
          { kind: "checkbox", id: "mood", label: "Mood Description",
            items: [
              { text: "Calm", checked: true },
              { text: "Appropriate", checked: true },
              { text: "Cooperative", checked: true },
              { text: "Anxious", checked: false },
              { text: "Fearful", checked: false },
              { text: "Depressed", checked: false },
              { text: "Hostile", checked: false },
              { text: "Euphoric", checked: false },
              { text: "Flat", checked: false },
              { text: "Suspicious", checked: false },
              { text: "Nervous", checked: false },
              { text: "Expansive", checked: false },
              { text: "Blunted", checked: false },
              { text: "Relaxed", checked: false },
              { text: "Sad", checked: false },
              { text: "Withdrawn", checked: false },
              { text: "Labile", checked: false },
            ]},
        ],
      },
    ],
  },
  {
    id: "cardio", title: "Cardiovascular Assessment",
    subSections: [
      {
        title: "Chest Pain",
        rows: [
          { kind: "radio", id: "chest-pain", label: "Chest Pain Complaint",
            options: ["Yes", "No"], selected: "No" },
          { kind: "grid", cols: 3, fields: [
            { label: "Heart Rate", value: "82 bpm" },
            { label: "Blood Pressure", value: "148 / 86 mmHg" },
            { label: "Cap Refill", value: "< 2 seconds" },
          ]},
        ],
      },
      {
        title: "Cardiac Monitoring",
        rows: [
          { kind: "radio", id: "monitoring-method", label: "Monitoring Method",
            options: ["Telemetry", "Bedside", "12 Lead"], selected: "Telemetry" },
          { kind: "checkbox", id: "ecg-rhythm", label: "ECG Rhythm",
            items: [
              { text: "Normal Sinus", checked: true },
              { text: "Sinus Bradycardia", checked: false },
              { text: "Sinus Tachycardia", checked: false },
              { text: "Atrial Flutter", checked: false },
              { text: "Atrial Fibrillation", checked: false },
              { text: "SVT", checked: false },
              { text: "V-Tachycardia", checked: false },
              { text: "V-Fibrillation", checked: false },
              { text: "1st Degree HB", checked: false },
              { text: "2nd Degree HB", checked: false },
              { text: "3rd Degree HB", checked: false },
              { text: "PSVT", checked: false },
              { text: "Wenckebach", checked: false },
              { text: "Paced", checked: false },
              { text: "PAC", checked: false },
              { text: "None", checked: false },
            ]},
        ],
      },
      {
        title: "Peripheral Vascular",
        rows: [
          { kind: "radio", id: "pedal-pulses", label: "Pedal Pulses",
            options: ["+2 bilaterally", "+1 bilaterally", "Absent", "Doppler required"],
            selected: "+2 bilaterally" },
          { kind: "radio", id: "edema", label: "Edema",
            options: ["None", "Trace", "1+", "2+", "3+", "4+"], selected: "None" },
        ],
      },
    ],
  },
  {
    id: "resp", title: "Respiratory Assessment",
    subSections: [
      {
        title: "Signs and Symptoms",
        rows: [
          { kind: "checkbox", id: "resp-sx", label: "Respiratory Symptoms",
            items: [
              { text: "None", checked: true },
              { text: "Unable to Lie Flat", checked: false },
              { text: "Pain with Cough", checked: false },
              { text: "Chest Congestion", checked: false },
              { text: "Mouth Breathing", checked: false },
              { text: "Change in Mental Status", checked: false },
              { text: "Shortness of Breath at Rest", checked: false },
              { text: "Difficulty Clearing Secretions", checked: false },
              { text: "Hemoptysis", checked: false },
              { text: "Restlessness", checked: false },
              { text: "Shortness of Breath on Exertion", checked: false },
              { text: "Productive Cough", checked: false },
              { text: "Dry Cough", checked: false },
              { text: "Dyspnea", checked: false },
              { text: "Wheezing", checked: false },
              { text: "Difficulty Coughing", checked: false },
              { text: "Dyspnea on Exertion", checked: false },
              { text: "Snoring", checked: false },
              { text: "Chest Pain", checked: false },
            ]},
        ],
      },
      {
        title: "Observation",
        rows: [
          { kind: "grid", cols: 3, fields: [
            { label: "Respiratory Rate", value: "18 / min" },
            { label: "SpO₂", value: "98%" },
            { label: "O₂ Delivery", value: "Room air" },
          ]},
          { kind: "radio", id: "resp-effort", label: "Respiratory Effort",
            options: ["Normal for patient", "Non-labored", "Short of breath", "Nasal flaring", "Labored", "Accessory muscle use", "Retracting", "Mechanically ventilated"],
            selected: "Normal for patient" },
          { kind: "radio", id: "resp-pattern", label: "Respiratory Pattern",
            options: ["Normal", "Irregular", "Bradypnea", "Tachypnea", "Apnea", "Gasping", "Kussmaul", "Cheyne-Stokes"],
            selected: "Normal" },
        ],
      },
      {
        title: "Auscultation",
        rows: [
          { kind: "checkbox", id: "breath-sounds", label: "Breath Sounds — Bilateral",
            items: [
              { text: "Normal for patient", checked: true },
              { text: "Vesicular", checked: false },
              { text: "Broncho-vesicular", checked: false },
              { text: "Fine crackles", checked: false },
              { text: "Coarse crackles", checked: false },
              { text: "Inspiratory wheezing", checked: false },
              { text: "Expiratory wheezing", checked: false },
              { text: "Inspiratory rhonchi", checked: false },
              { text: "Expiratory rhonchi", checked: false },
              { text: "Pleural rub", checked: false },
              { text: "Stridor", checked: false },
              { text: "Diminished", checked: false },
              { text: "Absent", checked: false },
            ]},
        ],
      },
    ],
  },
  {
    id: "pain", title: "Pain Assessment",
    subSections: [{
      title: "Pain",
      rows: [
        { kind: "radio", id: "pain-present", label: "Pain Complaint", required: true,
          options: ["Yes", "No"], selected: null },
        { kind: "score", items: [{ label: "Pain Score (0–10)", value: 8, max: 10, risk: "Severe", riskColor: "#bb1411" }] },
        { kind: "grid", cols: 2, fields: [
          { label: "Pain Location", value: "Right hip" },
          { label: "Onset", value: "Acute — this morning" },
        ]},
        { kind: "radio", id: "pain-quality", label: "Pain Quality",
          options: ["Sharp", "Dull", "Burning", "Aching", "Pressure", "Tightness", "Stabbing", "Cramping", "Throbbing"],
          selected: null },
        { kind: "radio", id: "pain-pattern", label: "Pain Pattern",
          options: ["Constant", "Intermittent", "Episodic"], selected: null },
        { kind: "checkbox", id: "pain-radiation", label: "Radiation",
          items: [
            { text: "None", checked: false },
            { text: "Left Arm", checked: false },
            { text: "Right Arm", checked: false },
            { text: "Left Shoulder", checked: false },
            { text: "Right Shoulder", checked: false },
            { text: "Back", checked: false },
            { text: "Neck", checked: false },
            { text: "Abdomen", checked: false },
          ]},
        { kind: "radio", id: "pain-scale", label: "Scale Used",
          options: ["Numeric Rating Scale", "FACES Scale", "FLACC Scale", "CPOT Scale", "Non-verbal"],
          selected: null },
      ],
    }],
  },
  {
    id: "fall", title: "Fall Risk Assessment",
    subSections: [{
      title: "Morse Fall Scale",
      rows: [
        { kind: "radio", id: "fall-hx", label: "History of Falls (past 3 months)",
          options: ["Yes", "No"], selected: "No" },
        { kind: "radio", id: "fall-secondary", label: "Secondary Diagnosis",
          options: ["Yes", "No"], selected: "Yes" },
        { kind: "radio", id: "fall-aid", label: "Ambulatory Aid",
          options: ["None / Bedrest / Nurse assist", "Crutches / Cane / Walker", "Furniture"],
          selected: "Crutches / Cane / Walker" },
        { kind: "radio", id: "fall-iv", label: "IV or Heparin Lock",
          options: ["Yes", "No"], selected: "No" },
        { kind: "radio", id: "fall-gait", label: "Gait / Transferring",
          options: ["Normal / Bedrest / Immobile", "Weak", "Impaired"], selected: "Impaired" },
        { kind: "radio", id: "fall-mental", label: "Mental Status",
          options: ["Oriented to own ability", "Overestimates / Forgets limitations"],
          selected: "Oriented to own ability" },
        { kind: "score", items: [{ label: "Morse Fall Scale Total", value: 55, max: 125, risk: "High Risk", riskColor: "#b45309" }] },
      ],
    }],
  },
  {
    id: "skin", title: "Skin Integrity",
    subSections: [
      {
        title: "Braden Scale",
        rows: [
          { kind: "radio", id: "braden-sensory", label: "Sensory Perception",
            options: ["Completely Limited", "Very Limited", "Slightly Limited", "No Impairment"],
            selected: "Slightly Limited" },
          { kind: "radio", id: "braden-moisture", label: "Moisture",
            options: ["Constantly Moist", "Very Moist", "Occasionally Moist", "Rarely Moist"],
            selected: "Rarely Moist" },
          { kind: "radio", id: "braden-activity", label: "Activity",
            options: ["Bedfast", "Chairfast", "Walks Occasionally", "Walks Frequently"],
            selected: "Chairfast" },
          { kind: "radio", id: "braden-mobility", label: "Mobility",
            options: ["Completely Immobile", "Very Limited", "Slightly Limited", "No Limitation"],
            selected: "Slightly Limited" },
          { kind: "radio", id: "braden-nutrition", label: "Nutrition",
            options: ["Very Poor", "Probably Inadequate", "Adequate", "Excellent"],
            selected: "Adequate" },
          { kind: "radio", id: "braden-friction", label: "Friction & Shear",
            options: ["Problem", "Potential Problem", "No Apparent Problem"],
            selected: "Potential Problem" },
          { kind: "score", items: [{ label: "Braden Score", value: 17, max: 23, risk: "Low Risk", riskColor: "#3f8d43" }] },
        ],
      },
      {
        title: "Skin Assessment",
        rows: [
          { kind: "radio", id: "skin-condition", label: "Skin Condition",
            options: ["Warm, dry, intact", "Warm, moist", "Cool, dry", "Cool, moist", "Diaphoretic"],
            selected: "Warm, dry, intact" },
          { kind: "radio", id: "skin-breakdown", label: "Skin Breakdown",
            options: ["None", "Stage 1", "Stage 2", "Stage 3", "Stage 4", "Unstageable", "DTPI"],
            selected: "None" },
          { kind: "radio", id: "wound-present", label: "Wound Present",
            options: ["Yes", "No"], selected: "No" },
        ],
      },
    ],
  },
  {
    id: "functional", title: "Functional Status",
    subSections: [
      {
        title: "Activities of Daily Living — Prior to Admission",
        rows: [
          { kind: "radio", id: "adl-bathing", label: "Bathing",
            options: ["Independent", "Assistance Required", "Total Care", "Not Applicable"],
            selected: "Independent" },
          { kind: "radio", id: "adl-dressing", label: "Dressing",
            options: ["Independent", "Assistance Required", "Total Care", "Not Applicable"],
            selected: "Independent" },
          { kind: "radio", id: "adl-grooming", label: "Grooming",
            options: ["Independent", "Assistance Required", "Total Care", "Not Applicable"],
            selected: "Independent" },
          { kind: "radio", id: "adl-feeding", label: "Feeding",
            options: ["Independent", "Assistance Required", "Total Care", "Not Applicable"],
            selected: "Independent" },
          { kind: "radio", id: "adl-toileting", label: "Toileting",
            options: ["Independent", "Assistance Required", "Total Care", "Not Applicable"],
            selected: "Independent" },
          { kind: "radio", id: "adl-transfer", label: "Transferring",
            options: ["Independent", "Assistance Required", "Total Care", "Not Applicable"],
            selected: "Assistance Required" },
          { kind: "radio", id: "adl-ambulation", label: "Ambulation",
            options: ["Independent", "Assistance Required", "Total Care", "Not Applicable"],
            selected: "Assistance Required" },
        ],
      },
      {
        title: "Living Situation",
        rows: [
          { kind: "radio", id: "living", label: "Living Situation",
            options: ["Alone", "With spouse / partner", "With family", "Assisted living", "Skilled nursing facility", "Homeless"],
            selected: "Alone" },
          { kind: "grid", cols: 2, fields: [
            { label: "Home Support", value: "Home health aide 3×/week" },
            { label: "Caregiver", value: "None at home" },
          ]},
        ],
      },
    ],
  },
  {
    id: "pmh", title: "Medical & Surgical History",
    subSections: [
      {
        title: "Medical History",
        rows: [
          { kind: "checkbox", id: "medical-hx", label: "Medical Conditions",
            items: [
              { text: "Hypertension", checked: true },
              { text: "Diabetes — Type 1", checked: false },
              { text: "Diabetes — Type 2 (diet controlled)", checked: true },
              { text: "COPD", checked: false },
              { text: "Asthma", checked: false },
              { text: "CAD", checked: false },
              { text: "CHF", checked: false },
              { text: "CKD", checked: false },
              { text: "Atrial Fibrillation", checked: false },
              { text: "Stroke / CVA", checked: false },
              { text: "Cancer", checked: false },
              { text: "Dementia", checked: false },
              { text: "Depression", checked: false },
              { text: "Anxiety", checked: false },
              { text: "GERD", checked: false },
              { text: "Hypothyroidism", checked: false },
              { text: "Osteoporosis", checked: true },
              { text: "Arthritis", checked: false },
              { text: "None known", checked: false },
            ]},
        ],
      },
      {
        title: "Surgical History",
        rows: [
          { kind: "checkbox", id: "surgical-hx", label: "Prior Surgeries",
            items: [
              { text: "No prior surgeries", checked: false },
              { text: "Appendectomy", checked: true },
              { text: "Cholecystectomy", checked: false },
              { text: "Hernia repair", checked: false },
              { text: "Total knee replacement", checked: false },
              { text: "Total hip replacement", checked: false },
              { text: "L knee arthroscopy", checked: true },
              { text: "CABG", checked: false },
              { text: "Cardiac procedure", checked: false },
              { text: "Hysterectomy", checked: false },
              { text: "C-section", checked: false },
              { text: "Colostomy / Ileostomy", checked: false },
            ]},
        ],
      },
      {
        title: "Allergies",
        rows: [
          { kind: "checkbox", id: "allergies", label: "Known Allergies",
            items: [
              { text: "NKDA", checked: false },
              { text: "Penicillin — rash", checked: true },
              { text: "Sulfa drugs — anaphylaxis", checked: true },
              { text: "Aspirin", checked: false },
              { text: "NSAIDs", checked: false },
              { text: "Iodine contrast", checked: false },
              { text: "Latex", checked: false },
              { text: "Codeine", checked: false },
            ]},
        ],
      },
      {
        title: "Home Medications",
        rows: [
          { kind: "grid", cols: 2, fields: [
            { label: "Medication 1", value: "Amlodipine 5mg — daily" },
            { label: "Medication 2", value: "Calcium + Vitamin D — daily" },
            { label: "Medication 3", value: "ASA 81mg — daily" },
          ]},
        ],
      },
    ],
  },
  {
    id: "history", title: "Patient History",
    subSections: [{
      title: "",
      rows: [
        { kind: "narrative", id: "patient-history-text",
          text: "Patient reports slipping on a wet bathroom floor this morning. Denies loss of consciousness before or after fall. Immediate right hip pain 8/10, unable to bear weight. EMS called by neighbor. Denies chest pain, dyspnea, or head strike. No prior falls in the past 6 months." },
      ],
    }],
  },
  {
    id: "careplan", title: "Nursing Care Plan",
    subSections: [{
      title: "",
      rows: [
        { kind: "narrative", id: "care-plan-text",
          text: "1. Acute pain — Scheduled acetaminophen 650mg q6h + PRN opioids per order. Reposition q2h.\n2. Impaired mobility — PT/OT consult placed. Hip precautions per surgical protocol.\n3. High fall risk — Bed alarm active, call light in reach, non-skid socks applied, side rails up ×2.\n4. DVT prophylaxis — SCDs applied bilaterally. Pharmacy to dose Lovenox per weight post-op.\n5. Nutrition — Dietitian consult placed given surgical intervention and osteoporosis." },
      ],
    }],
  },
  {
    id: "neurovascular", title: "Neurovascular Assessment",
    subSections: [{
      title: "Extremity Checks",
      rows: [
        { kind: "radio", id: "nv-cap-refill", label: "Capillary Refill — Operative Extremity",
          options: ["< 2 seconds", "2–3 seconds", "> 3 seconds"], selected: null },
        { kind: "radio", id: "nv-sensation", label: "Sensation — Operative Extremity",
          options: ["Intact", "Reduced", "Absent", "Paresthesias"], selected: null },
        { kind: "radio", id: "nv-movement", label: "Movement — Operative Extremity",
          options: ["Full ROM", "Limited", "No movement"], selected: null },
        { kind: "radio", id: "nv-skin-temp", label: "Skin Temperature — Operative Extremity",
          options: ["Warm", "Cool", "Cold"], selected: null },
        { kind: "radio", id: "nv-pain-movement", label: "Pain on Passive Movement",
          options: ["None", "Mild", "Moderate", "Severe"], selected: null },
      ],
    }],
  },
];

// ─── Shift Assessment ─────────────────────────────────────────────────────────
const shiftSections: NurseSection[] = [
  {
    id: "vitals", title: "Vital Signs",
    subSections: [{
      title: "Current Vitals",
      rows: [
        { kind: "grid", cols: 3, fields: [
          { label: "Heart Rate", value: "78 bpm" },
          { label: "Blood Pressure", value: "132 / 80 mmHg" },
          { label: "Temperature", value: "98.6°F (37.0°C)" },
          { label: "Respiratory Rate", value: "16 / min" },
          { label: "SpO₂", value: "98% RA" },
          { label: "O₂ Delivery", value: "Room air" },
        ]},
        { kind: "score", items: [{ label: "SpO₂", value: 98, max: 100, risk: "Normal", riskColor: "#3f8d43" }] },
      ],
    }],
  },
  {
    id: "neuro-s", title: "Neurological Assessment",
    subSections: [
      {
        title: "Glasgow Coma Scale",
        rows: [
          { kind: "radio", id: "s-gcs-eye", label: "Eye Opening",
            options: ["Spontaneous", "To sound", "To pressure", "None"], selected: "Spontaneous" },
          { kind: "radio", id: "s-gcs-verbal", label: "Verbal Response",
            options: ["Oriented", "Confused", "Words", "Sounds", "None"], selected: "Oriented" },
          { kind: "radio", id: "s-gcs-motor", label: "Motor Response",
            options: ["Obey commands", "Localizing", "Normal flexion", "Abnormal flexion", "Extension", "None"],
            selected: "Obey commands" },
          { kind: "score", items: [{ label: "GCS Total", value: 15, max: 15, risk: "Normal", riskColor: "#3f8d43" }] },
        ],
      },
      {
        title: "Orientation",
        rows: [
          { kind: "radio", id: "s-orientation", label: "Patient Orientation",
            options: ["×1 — Person only", "×2 — Person + Place", "×3 — Person, Place, Time", "×4 — Person, Place, Time, Event"],
            selected: "×4 — Person, Place, Time, Event" },
          { kind: "radio", id: "s-loc", label: "Level of Consciousness", required: true,
            options: ["Alert", "Drowsy", "Obtunded", "Stuporous", "Comatose"], selected: null },
          { kind: "radio", id: "s-pupils", label: "Pupils",
            options: ["PERRL", "Unequal", "Dilated", "Constricted", "Non-reactive"], selected: null },
        ],
      },
    ],
  },
  {
    id: "resp-s", title: "Respiratory Assessment",
    subSections: [{
      title: "Observation & Auscultation",
      rows: [
        { kind: "radio", id: "s-resp-effort", label: "Respiratory Effort",
          options: ["Normal for patient", "Non-labored", "Short of breath", "Nasal flaring", "Labored", "Accessory muscle use"],
          selected: "Non-labored" },
        { kind: "checkbox", id: "s-breath-sounds", label: "Breath Sounds — Bilateral",
          items: [
            { text: "Normal for patient", checked: false },
            { text: "Clear bilaterally", checked: true },
            { text: "Fine crackles", checked: false },
            { text: "Coarse crackles", checked: false },
            { text: "Expiratory wheezing", checked: false },
            { text: "Diminished", checked: false },
          ]},
      ],
    }],
  },
  {
    id: "pain-s", title: "Pain Assessment",
    subSections: [{
      title: "Pain",
      rows: [
        { kind: "radio", id: "s-pain-present", label: "Pain Complaint", required: true, options: ["Yes", "No"], selected: "Yes" },
        { kind: "score", items: [{ label: "Pain Score", value: 4, max: 10, risk: "Moderate", riskColor: "#b45309" }] },
        { kind: "grid", cols: 2, fields: [
          { label: "Location", value: "Right hip — surgical site" },
          { label: "Response to Treatment", value: "Improved to 4/10 after scheduled analgesics" },
        ]},
        { kind: "radio", id: "s-pain-quality", label: "Pain Quality",
          options: ["Sharp", "Dull", "Burning", "Aching", "Pressure", "Tightness", "Stabbing"], selected: "Aching" },
        { kind: "radio", id: "s-pain-pattern", label: "Pain Pattern", required: true,
          options: ["Constant", "Intermittent", "Episodic"], selected: null },
        { kind: "radio", id: "s-pain-interv", label: "Non-Pharmacological Interventions",
          options: ["Ice", "Heat", "Positioning", "Distraction", "Relaxation", "None"], selected: null },
      ],
    }],
  },
  {
    id: "mobility-s", title: "Mobility & Safety",
    subSections: [{
      title: "",
      rows: [
        { kind: "radio", id: "s-activity", label: "Activity Level",
          options: ["Ambulatory — independent", "Ambulatory with assist", "Bed rest", "Chair rest", "Non-weight bearing"],
          selected: "Ambulatory with assist" },
        { kind: "checkbox", id: "s-safety", label: "Safety Measures in Place",
          items: [
            { text: "Call light in reach", checked: true },
            { text: "Bed in low position", checked: true },
            { text: "Side rails up ×2", checked: true },
            { text: "Fall precaution band", checked: true },
            { text: "Non-slip socks", checked: true },
            { text: "Walker at bedside", checked: false },
          ]},
      ],
    }],
  },
  {
    id: "wound-s", title: "Wound Assessment",
    subSections: [{
      title: "Right Hip Surgical Incision",
      rows: [
        { kind: "radio", id: "s-wound-appear", label: "Wound Appearance",
          options: ["Clean, dry, intact", "Mild drainage", "Moderate drainage", "Erythema", "Signs of infection"],
          selected: "Clean, dry, intact" },
        { kind: "grid", cols: 2, fields: [
          { label: "Drain output (last 4h)", value: "35 mL serosanguineous" },
          { label: "Dressing last changed", value: "Today 08:00" },
        ]},
      ],
    }],
  },
  {
    id: "goals-s", title: "Patient Goals for Shift",
    subSections: [{
      title: "",
      rows: [
        { kind: "narrative", id: "shift-goals",
          text: "Patient verbalized: \"I want to walk to the end of the hallway with PT today and keep my pain under control.\"\n\nPlan: PT session at 1500 — ambulate ×2 today. Continue scheduled pain protocol. Surgical drain to be assessed at 1900 — notify Dr. Alvarez if output >50 mL/2h. Discharge planning in progress, targeting Jun 26." },
      ],
    }],
  },
  {
    id: "nutrition-s", title: "Nutrition & GI Assessment",
    subSections: [{
      title: "Nutrition",
      rows: [
        { kind: "radio", id: "s-diet", label: "Diet Type", required: true, options: ["Regular", "Low sodium", "Diabetic", "Mechanical soft", "Pureed", "NPO"], selected: null },
        { kind: "radio", id: "s-appetite", label: "Appetite", options: ["Good", "Fair", "Poor", "Refused"], selected: null },
        { kind: "radio", id: "s-nausea", label: "Nausea / Vomiting", options: ["None", "Nausea only", "Vomiting"], selected: null },
      ],
    }, {
      title: "GI",
      rows: [
        { kind: "radio", id: "s-bowel", label: "Bowel Sounds", options: ["Active ×4", "Hypoactive", "Hyperactive", "Absent"], selected: null },
        { kind: "radio", id: "s-last-bm", label: "Last BM", options: ["Today", "Yesterday", ">2 days ago", "Unknown"], selected: null },
      ],
    }],
  },
];

// ─── Triage Assessment ────────────────────────────────────────────────────────
const triageSections: NurseSection[] = [
  {
    id: "triage-chief", title: "Chief Complaint & Acuity",
    subSections: [{
      title: "",
      rows: [
        { kind: "grid", cols: 1, fields: [
          { label: "Chief Complaint", value: "Right hip pain following fall at home — unable to bear weight on right leg", required: true },
        ]},
        { kind: "radio", id: "triage-esi", label: "ESI Level", required: true,
          options: ["ESI 1 — Immediate", "ESI 2 — High urgency", "ESI 3 — Urgent", "ESI 4 — Less urgent", "ESI 5 — Non-urgent"],
          selected: "ESI 2 — High urgency" },
        { kind: "radio", id: "triage-arrival", label: "Mode of Arrival", required: true,
          options: ["Ambulatory", "Stretcher", "Wheelchair", "Ambulance — BLS", "Ambulance — ALS"],
          selected: "Ambulance — BLS" },
      ],
    }],
  },
  {
    id: "triage-vitals", title: "Triage Vitals",
    subSections: [{
      title: "",
      rows: [
        { kind: "grid", cols: 3, fields: [
          { label: "Heart Rate", value: "94 bpm" },
          { label: "Blood Pressure", value: "148 / 88 mmHg" },
          { label: "Respiratory Rate", value: "18 / min" },
          { label: "Temperature", value: "98.4°F" },
          { label: "SpO₂", value: "98% RA" },
          { label: "Weight", value: "65 kg" },
        ]},
        { kind: "radio", id: "triage-pain-present", label: "Pain Complaint", required: true,
          options: ["Yes", "No"], selected: "Yes" },
        { kind: "score", items: [{ label: "Pain Score (0–10)", value: 8, max: 10, risk: "Severe", riskColor: "#bb1411" }] },
        { kind: "grid", cols: 2, fields: [
          { label: "Pain Location", value: "Right hip" },
          { label: "Onset", value: "This morning, ~07:45" },
        ]},
      ],
    }],
  },
  {
    id: "triage-hx", title: "History",
    subSections: [{
      title: "",
      rows: [
        { kind: "radio", id: "triage-moi", label: "Mechanism of Injury",
          options: ["Fall from standing", "Fall from height", "Syncope before fall", "MVA", "Sports injury", "Unknown"],
          selected: "Fall from standing" },
        { kind: "checkbox", id: "triage-pmh", label: "Relevant Medical History",
          items: [
            { text: "Hypertension", checked: true },
            { text: "Osteoporosis", checked: true },
            { text: "Diabetes", checked: false },
            { text: "CAD", checked: false },
            { text: "Prior fracture", checked: false },
            { text: "Anticoagulation", checked: false },
          ]},
        { kind: "checkbox", id: "triage-allergies", label: "Allergies",
          items: [
            { text: "NKDA", checked: true },
            { text: "Penicillin", checked: false },
            { text: "NSAIDs", checked: false },
          ]},
      ],
    }],
  },
];

// ─── Handoff (SBAR) ───────────────────────────────────────────────────────────
const handoffSections: NurseSection[] = [
  {
    id: "situation", title: "Situation",
    subSections: [{
      title: "",
      rows: [
        { kind: "grid", cols: 2, fields: [
          { label: "Patient", value: "Maria Santos — Bed 4B", required: true },
          { label: "Primary Diagnosis", value: "Right hip fracture — s/p ORIF Jun 22" },
          { label: "Key update this shift", value: "Post-op day 2 — tolerated PT, pain improving to 4/10", required: true },
          { label: "Immediate action needed", value: "Surgical drain check at 1900 — output 35 mL/4h" },
        ]},
        { kind: "score", items: [{ label: "Pain Score (0–10)", value: 4, max: 10, risk: "Moderate — managed with analgesics", riskColor: "#b45309" }] },
      ],
    }],
  },
  {
    id: "background", title: "Background",
    subSections: [{
      title: "Admission & History",
      rows: [
        { kind: "grid", cols: 3, fields: [
          { label: "Admitted", value: "Jun 22, 2026" },
          { label: "Procedure", value: "ORIF right hip" },
          { label: "Code Status", value: "Full code" },
        ]},
        { kind: "radio", id: "h-isolation", label: "Isolation",
          options: ["None", "Contact", "Droplet", "Airborne", "Protective"], selected: "None" },
        { kind: "checkbox", id: "h-pmh", label: "Medical History",
          items: [
            { text: "Hypertension", checked: true },
            { text: "Osteoporosis", checked: true },
            { text: "Diabetes", checked: false },
            { text: "CAD", checked: false },
            { text: "Fall risk — high", checked: true },
          ]},
        { kind: "checkbox", id: "h-allergies", label: "Allergies",
          items: [
            { text: "NKDA", checked: true },
          ]},
      ],
    }],
  },
  {
    id: "assessment-h", title: "Assessment",
    subSections: [{
      title: "Current Status",
      rows: [
        { kind: "radio", id: "h-overall", label: "Overall Status",
          options: ["Stable", "Guarded", "Critical", "Comfort care"], selected: "Stable" },
        { kind: "grid", cols: 3, fields: [
          { label: "Vitals trend", value: "Stable — HR 78, BP 132/80" },
          { label: "Pain trend", value: "Improving — 8/10 on admit, 4/10 now" },
          { label: "Mobility", value: "Amb. with assist — PT ×2 today" },
          { label: "Wound", value: "Clean, dry, intact" },
          { label: "Drain output", value: "35 mL/4h serosanguineous" },
          { label: "I&O balance", value: "Adequate oral intake, voiding well" },
        ]},
        { kind: "checkbox", id: "h-concerns", label: "Active Concerns",
          items: [
            { text: "Pain management", checked: true },
            { text: "Fall prevention", checked: true },
            { text: "Drain monitoring", checked: true },
            { text: "DVT prophylaxis ongoing", checked: true },
            { text: "Discharge planning", checked: false },
          ]},
      ],
    }],
  },
  {
    id: "rec", title: "Recommendation & Plan",
    subSections: [{
      title: "",
      rows: [
        { kind: "narrative", id: "handoff-plan",
          text: "1. Surgical drain — check output at 1900. If >50 mL/2h, page Dr. Alvarez (Ortho, beeper 4412).\n2. Pain protocol — continue scheduled analgesics. PRN available if needed.\n3. PT at 0900 tomorrow — morning ROM exercises before session.\n4. Discharge target Jun 26 — home health referral in progress. Family updated.\n5. Antihypertensives due at 2100 — lisinopril 10mg PO." },
      ],
    }],
  },
];

// ─── End of Shift ─────────────────────────────────────────────────────────────
const endOfShiftSections: NurseSection[] = [
  {
    id: "eos-summary", title: "Patient Summary",
    subSections: [{
      title: "",
      rows: [
        { kind: "grid", cols: 3, fields: [
          { label: "Patient", value: "Maria Santos — Bed 4B" },
          { label: "Diagnosis", value: "Post-op Day 2 — ORIF right hip" },
          { label: "Surgeon", value: "Dr. Alvarez (Orthopedics)" },
        ]},
        { kind: "radio", id: "eos-code", label: "Code Status",
          options: ["Full code", "DNR", "DNI", "DNR/DNI", "Comfort measures only"], selected: "Full code" },
        { kind: "radio", id: "eos-discharge", label: "Anticipated Discharge",
          options: ["Today", "Tomorrow", "2–3 days", "Unclear", "Transfer pending"], selected: "2–3 days" },
        { kind: "score", items: [{ label: "Pain Score (end of shift)", value: 3, max: 10, risk: "Well-controlled", riskColor: "#3f8d43" }] },
      ],
    }],
  },
  {
    id: "eos-events", title: "Events During Shift",
    subSections: [{
      title: "",
      rows: [
        { kind: "narrative", id: "eos-events-text",
          text: "0800 — Dressing to right hip incision changed: clean, dry, intact, no erythema. JP drain 30 mL serosanguineous emptied and recorded.\n0900 — Enoxaparin 40 mg SubQ given for VTE prophylaxis. SCDs on bilaterally when in bed.\n1000 — PT session: ambulated 75 ft in hallway with front-wheeled walker and contact-guard assist ×1. Weight-bearing as tolerated on right leg. Tolerated well.\n1330 — PRN oxycodone 5 mg PO for breakthrough pain (6/10 before, 3/10 after).\n1500 — Hospitalist rounded — stable POD 2, continue current plan. Foley discontinued; voided 250 mL within 4 hrs." },
      ],
    }],
  },
  {
    id: "eos-tasks", title: "Outstanding Tasks & Follow-Up",
    subSections: [{
      title: "",
      rows: [
        { kind: "narrative", id: "eos-tasks-text",
          text: "1. CBC ordered for 0600 — check Hgb (10.4 today), notify hospitalist if <8 or symptomatic.\n2. Continue neurovascular checks to right lower extremity q4h — distal pulses, cap refill, sensation, movement intact this shift.\n3. Reinforce hip precautions and home-safety teaching with patient and daughter — return demo pending.\n4. Case management to finalize home health PT referral and durable medical equipment (walker) before discharge." },
      ],
    }],
  },
];

// ─── Pre Admission Summary ────────────────────────────────────────────────────
const preAdmSections: NurseSection[] = [
  {
    id: "pre-procedure", title: "Procedure & Scheduling",
    subSections: [{
      title: "",
      rows: [
        { kind: "grid", cols: 2, fields: [
          { label: "Scheduled Procedure", value: "Laparoscopic hysterectomy" },
          { label: "Date / Time", value: "Jun 25, 2026 at 0730" },
          { label: "Surgeon", value: "Dr. Ahmad" },
          { label: "Anesthesia Type", value: "General (GETA)" },
          { label: "OR Suite", value: "Suite 4" },
          { label: "Indication", value: "Symptomatic uterine fibroids — menorrhagia" },
        ]},
      ],
    }],
  },
  {
    id: "pre-checklist", title: "Pre-Op Checklist",
    subSections: [{
      title: "Safety & Consent",
      rows: [
        { kind: "checkbox", id: "preop-checklist", label: "Pre-Op Checklist",
          items: [
            { text: "Surgical consent signed and witnessed", checked: true },
            { text: "Anesthesia consent signed", checked: true },
            { text: "NPO since midnight — confirmed", checked: true },
            { text: "Bowel prep completed", checked: true },
            { text: "Surgical site marking confirmed", checked: true },
            { text: "SCDs ordered for OR", checked: true },
            { text: "Latex-free OR notified", checked: true },
            { text: "RED latex allergy band applied", checked: true },
            { text: "IV access established", checked: true },
            { text: "Pre-op labs reviewed and within range", checked: true },
            { text: "Implant / prosthesis removed", checked: false },
            { text: "Patient identification confirmed ×2", checked: true },
          ]},
      ],
    }],
  },
  {
    id: "pre-history", title: "Patient History",
    subSections: [{
      title: "",
      rows: [
        { kind: "narrative", id: "preop-hx-text",
          text: "Patient reports anxiety about anesthesia. Reviewed process in detail — patient verbalized understanding and felt reassured. Latex allergy (hives) confirmed. OCP discontinued 30 days pre-op per surgeon instructions. Support person (husband) in waiting room. Ready for transport to pre-op holding at 0700." },
      ],
    }],
  },
];

// ─── Discharge ────────────────────────────────────────────────────────────────
const dischargeSections: NurseSection[] = [
  {
    id: "d-status", title: "Discharge Status",
    subSections: [{
      title: "",
      rows: [
        { kind: "radio", id: "d-condition", label: "Condition at Discharge",
          options: ["Stable", "Improved", "Unchanged", "Declined"], selected: "Improved" },
        { kind: "radio", id: "d-disposition", label: "Discharge Disposition",
          options: ["Home", "Home with home health", "Skilled nursing facility", "Acute rehab", "Long-term care"],
          selected: "Home with home health" },
        { kind: "radio", id: "d-transport", label: "Mode of Transport",
          options: ["Personal vehicle", "Family / friend driving", "Ambulance", "Medical transport", "Taxi / rideshare"],
          selected: "Family / friend driving" },
        { kind: "grid", cols: 3, fields: [
          { label: "Primary Diagnosis", value: "Right intertrochanteric hip fx — s/p ORIF" },
          { label: "Weight-Bearing Status", value: "WBAT right leg with walker" },
          { label: "Incision", value: "Clean, dry, intact — staples in place" },
        ]},
      ],
    }],
  },
  {
    id: "d-education", title: "Patient Education",
    subSections: [{
      title: "",
      rows: [
        { kind: "checkbox", id: "d-ed-topics", label: "Education Topics",
          items: [
            { text: "Hip precautions (no bending >90°, no crossing legs, no twisting)", checked: true },
            { text: "Assistive device use — front-wheeled walker", checked: true },
            { text: "Incision care and staple removal follow-up", checked: true },
            { text: "Enoxaparin self-injection for VTE prophylaxis", checked: true },
            { text: "Fall prevention and home safety", checked: true },
            { text: "Return precautions (when to call / go to ED)", checked: true },
            { text: "Pain medication and bowel regimen", checked: false },
          ]},
        { kind: "radio", id: "d-teachback", label: "Teach-Back",
          options: ["Satisfactory — return demo performed", "Partial understanding — reinforced", "Declined", "Unable to assess"],
          selected: "Satisfactory — return demo performed" },
        { kind: "radio", id: "d-ed-method", label: "Education Method",
          options: ["Verbal", "Written", "Verbal + written", "Video", "Interpreter used"],
          selected: "Verbal + written" },
      ],
    }],
  },
  {
    id: "d-instructions", title: "Discharge Instructions",
    subSections: [{
      title: "",
      rows: [
        { kind: "narrative", id: "discharge-text",
          text: "1. Maintain hip precautions at all times. Use front-wheeled walker for all ambulation; weight-bearing as tolerated on right leg.\n2. Continue enoxaparin 40 mg SubQ daily ×14 days for clot prevention. Take acetaminophen scheduled; oxycodone PRN for breakthrough pain, with docusate/senna to prevent constipation.\n3. Keep incision clean and dry. No soaking (tub, pool) until staples removed. Home health nurse to assess incision; orthopedic follow-up in 10–14 days for staple removal.\n4. Home health PT to continue in-home therapy. Daughter to assist with ADLs and medication.\n5. Call the clinic or return to ED for: fever >101°F, increasing redness/drainage or opening of the incision, calf pain or swelling, chest pain or shortness of breath, or a new fall." },
      ],
    }],
  },
];

// ─── Route template → sections ────────────────────────────────────────────────
function getSections(template: string): NurseSection[] {
  const t = template.toLowerCase();
  if (t.includes("triage"))                                        return triageSections;
  if (t.includes("admission assessment"))                          return admissionSections;
  if (t.includes("shift assessment"))                              return shiftSections;
  if (t.includes("handoff") || t.includes("hand off"))            return handoffSections;
  if (t.includes("end of shift"))                                  return endOfShiftSections;
  if (t.includes("pre admission") || t.includes("pre-admission")) return preAdmSections;
  if (t.includes("discharge"))                                     return dischargeSections;
  return admissionSections;
}

// ─── Scribe config for Maria Santos (the only clickable patient) ───────────────
const MARIA_SCRIBES: Record<string, { template: string; updated: string; status: ScribeItemStatus; hasTranscript: boolean }> = {
  "d_tr": { template: "Triage",                  updated: "Updated Sun, 08:20",   status: "Synced",        hasTranscript: true  },
  "d6":   { template: "Admission Assessment",    updated: "Updated Sun, 11:45",   status: "Synced",        hasTranscript: true  },
  "d_s1": { template: "Shift Assessment",        updated: "Synced Mon, 22:15",    status: "Synced",        hasTranscript: true  },
  "d1":   { template: "Shift Assessment",        updated: "Updated today, 14:32", status: "Incomplete",         hasTranscript: true  },
  "d_ho": { template: "Handoff",                 updated: "Syncing, 18:00",       status: "Syncing",       hasTranscript: false },
  "d_eo": { template: "End of Shift Narrative",  updated: "Generated today, 19:30", status: "Generated",   hasTranscript: true  },
  "d_ds": { template: "Discharge Summary",       updated: "Draft, 20:00",         status: "Draft",         hasTranscript: false },
  "d7":   { template: "End of Shift Narrative",  updated: "Synced Mon, 21:10",    status: "Synced",        hasTranscript: true  },
};

// ─── Component ────────────────────────────────────────────────────────────────
type Props = { scribeId: string; template?: string; onRecordNew?: () => void };

export default function ScribeDetailPage({ scribeId, onRecordNew }: Props) {
  const initialSidebarId = (() => {
    const mapped = scribeId.replace(/^s/, "d");
    return MARIA_SCRIBES[mapped] ? mapped : DEFAULT_SCRIBE_ID;
  })();
  const [selectedSidebarId, setSelectedSidebarId] = useState<string>(initialSidebarId);
  const [activeTab, setActiveTab] = useState(MARIA_SCRIBES[initialSidebarId]?.template ?? "Shift Assessment");
  const [sections, setSections] = useState<NurseSection[]>(() => JSON.parse(JSON.stringify(getSections(MARIA_SCRIBES[initialSidebarId]?.template ?? "Shift Assessment"))));
  const [editingNarrativeId, setEditingNarrativeId] = useState<string | null>(null);
  const [popover, setPopover] = useState<{ rowId: string; rect: DOMRect; searchQuery: string } | null>(null);
  const [editingGridField, setEditingGridField] = useState<{ key: string; idx: number } | null>(null);
  const [showAllUncaptured, setShowAllUncaptured] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [submitAttempted, setSubmitAttempted] = useState(MARIA_SCRIBES[initialSidebarId]?.status === "Incomplete");
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [currentErrorIdx, setCurrentErrorIdx] = useState(0);
  const autoScrollRef = useRef(false);
  const [undoState, setUndoState] = useState<{ rowId: string; itemText: string } | null>(null);
  const [hoveredPopoverOption, setHoveredPopoverOption] = useState<string | null>(null);
  // Patients expanded to show all notes; by default a patient shows only its most recent note.
  const [expandedPatients, setExpandedPatients] = useState<Set<string>>(new Set());
  const [hoveredSectionId, setHoveredSectionId] = useState<string>("");
  const [sidebarFilterOpen, setSidebarFilterOpen] = useState(false);
  const [sidebarFilterPos, setSidebarFilterPos] = useState({ top: 0, left: 0 });
  const [draftSidebarDateRange, setDraftSidebarDateRange] = useState<string | null>(null);
  const [draftSidebarSortBy, setDraftSidebarSortBy] = useState("reverse-chron");
  const [draftSidebarStatuses, setDraftSidebarStatuses] = useState<Set<ScribeItemStatus>>(new Set());
  const [activeSidebarDateRange, setActiveSidebarDateRange] = useState<string | null>(null);
  const [activeSidebarSortBy, setActiveSidebarSortBy] = useState("reverse-chron");
  const [activeSidebarStatuses, setActiveSidebarStatuses] = useState<Set<ScribeItemStatus>>(new Set());
  const [draftSidebarNoteTypes, setDraftSidebarNoteTypes] = useState<Set<string>>(new Set());
  const [activeSidebarNoteTypes, setActiveSidebarNoteTypes] = useState<Set<string>>(new Set());
  const sidebarFilterBtnRef = useRef<HTMLDivElement>(null);
  const sidebarFilterPanelRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  // Which section's jump menu is open (by section id), opened from its sticky header.
  const [openSectionMenu, setOpenSectionMenu] = useState<string | null>(null);
  // The section whose header is currently pinned at the top — only it shows the jump chevron.
  const [stuckSectionId, setStuckSectionId] = useState<string>("");
  function togglePatient(patientId: string) {
    setExpandedPatients(prev => {
      const next = new Set(prev);
      if (next.has(patientId)) next.delete(patientId);
      else next.add(patientId);
      return next;
    });
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        sidebarFilterPanelRef.current && !sidebarFilterPanelRef.current.contains(e.target as Node) &&
        sidebarFilterBtnRef.current && !sidebarFilterBtnRef.current.contains(e.target as Node)
      ) {
        setSidebarFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSidebarFilterClick() {
    if (sidebarFilterOpen) { setSidebarFilterOpen(false); return; }
    if (sidebarFilterBtnRef.current) {
      const rect = sidebarFilterBtnRef.current.getBoundingClientRect();
      setSidebarFilterPos({ top: rect.bottom + 4, left: rect.left });
    }
    setDraftSidebarDateRange(activeSidebarDateRange);
    setDraftSidebarSortBy(activeSidebarSortBy);
    setDraftSidebarStatuses(new Set(activeSidebarStatuses));
    setDraftSidebarNoteTypes(new Set(activeSidebarNoteTypes));
    setSidebarFilterOpen(true);
  }

  function applySidebarFilter() {
    setActiveSidebarDateRange(draftSidebarDateRange);
    setActiveSidebarSortBy(draftSidebarSortBy);
    setActiveSidebarStatuses(new Set(draftSidebarStatuses));
    setActiveSidebarNoteTypes(new Set(draftSidebarNoteTypes));
    setSidebarFilterOpen(false);
  }

  function resetSidebarFilter() {
    setDraftSidebarDateRange(null);
    setDraftSidebarSortBy("reverse-chron");
    setDraftSidebarStatuses(new Set());
    setDraftSidebarNoteTypes(new Set());
  }

  function toggleDraftSidebarStatus(status: ScribeItemStatus) {
    setDraftSidebarStatuses(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status); else next.add(status);
      return next;
    });
  }

  function toggleDraftSidebarNoteType(noteType: string) {
    setDraftSidebarNoteTypes(prev => {
      const next = new Set(prev);
      if (next.has(noteType)) next.delete(noteType); else next.add(noteType);
      return next;
    });
  }

  function scrollToSection(sectionId: string) {
    const container = mainScrollRef.current;
    if (!container) return;
    const sectionEl = container.querySelector(`[data-section-id="${sectionId}"]`) as HTMLElement | null;
    if (!sectionEl) return;
    // Land the section's (sticky) header at the top, below the error bar when it's shown.
    const target = (sectionEl.querySelector("[data-section-header]") as HTMLElement | null) ?? sectionEl;
    const offset = 0;
    const tRect = target.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    container.scrollTo({ top: Math.max(0, container.scrollTop + tRect.top - cRect.top - offset), behavior: "smooth" });
  }

  // Sticky section header — pins as you scroll through its section and is pushed up by the
  // next. Only the currently-pinned header shows the chevron / jump menu of all sections.
  function renderSectionHeader(section: NurseSection, trailing?: React.ReactNode) {
    const stickyTop = 0;
    const isStuck = section.id === stuckSectionId;
    return (
      <div
        data-section-header
        style={{ position: "sticky", top: stickyTop, zIndex: 15, background: "white", padding: "10px 8px 4px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
      >
        {isStuck ? (
          <div style={{ position: "relative", width: "max-content" }}>
            <button
              onClick={() => setOpenSectionMenu(o => (o === section.id ? null : section.id))}
              className="flex items-center gap-[2px] rounded-[6px] px-[8px] py-[2px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors"
              style={{ background: "transparent", border: "none", cursor: "pointer" }}
            >
              <span className="t-title-sm" style={{ color: "var(--foreground-primary,#1a1a1a)" }}>{section.title}</span>
              <Icon name={openSectionMenu === section.id ? "arrow_drop_up" : "arrow_drop_down"} size={20} className="text-[var(--foreground-secondary,#666)]" />
            </button>
            {openSectionMenu === section.id && (
              <div className="absolute left-0 top-full mt-[2px] z-30">
                <Menu className="w-[280px] max-h-[360px] overflow-y-auto">
                  {sections.map(s => (
                    <MenuItem key={s.id} label={s.title} selected={s.id === section.id} onClick={() => { scrollToSection(s.id); setOpenSectionMenu(null); }} />
                  ))}
                </Menu>
              </div>
            )}
          </div>
        ) : (
          <span className="t-title-sm inline-block" style={{ color: "var(--foreground-primary,#1a1a1a)", padding: "2px 8px" }}>{section.title}</span>
        )}
        {trailing}
      </div>
    );
  }

  function scrollToRow(rowId: string) {
    if (!rowId) return;
    setTimeout(() => {
      const el = document.querySelector(`[data-row-id="${rowId}"]`) as HTMLElement | null;
      if (!el) return;
      const container = el.closest(".overflow-y-auto") as HTMLElement | null;
      if (!container) return;
      const elRect = el.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      const target = container.scrollTop + elRect.top - cRect.top - (container.clientHeight - el.offsetHeight) / 2;
      container.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    }, 0);
  }

  const currentErrorIdxRef = useRef(0);
  currentErrorIdxRef.current = currentErrorIdx;
  const prevMissingLengthRef = useRef(0);

  useEffect(() => {
    if (!submitAttempted) return;
    const missing = getMissingRequiredFields();

    if (autoScrollRef.current) {
      autoScrollRef.current = false;
      prevMissingLengthRef.current = missing.length;
      if (missing.length > 0) { setCurrentErrorIdx(0); scrollToRow(missing[0].id); }
      return;
    }

    // A required field was just fixed — auto-scroll to next remaining error
    if (missing.length < prevMissingLengthRef.current && missing.length > 0) {
      const newIdx = Math.min(currentErrorIdxRef.current, missing.length - 1);
      setCurrentErrorIdx(newIdx);
      setTimeout(() => scrollToRow(missing[newIdx].id), 0);
    }
    prevMissingLengthRef.current = missing.length;
  }, [submitAttempted, sections]);

  useEffect(() => {
    if (!openSectionMenu) return;
    function handle(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest("[data-section-header]")) setOpenSectionMenu(null);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [openSectionMenu]);

  // Track which section's header is pinned at the top (only that one gets the jump chevron).
  useEffect(() => {
    const container = mainScrollRef.current;
    if (!container) return;
    function onScroll() {
      const cRect = container!.getBoundingClientRect();
      const anchor = cRect.top + 1;
      let stuck = sections[0]?.id ?? "";
      sections.forEach(s => {
        const el = container!.querySelector(`[data-section-id="${s.id}"]`) as HTMLElement | null;
        if (el && el.getBoundingClientRect().top <= anchor) stuck = s.id;
      });
      setStuckSectionId(stuck);
    }
    container.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => container.removeEventListener("scroll", onScroll);
  }, [sections, submitAttempted]);

  const displaySidebarPatients = useMemo(() => {
    let groups = sidebarPatients.map(pg => {
      let scribes = [...pg.scribes];
      if (activeSidebarStatuses.size > 0) scribes = scribes.filter(s => activeSidebarStatuses.has(s.status));
      if (activeSidebarNoteTypes.size > 0) scribes = scribes.filter(s => activeSidebarNoteTypes.has(s.assessmentType));
      if (activeSidebarDateRange) {
        const allowed = SIDEBAR_DATE_INCLUDES[activeSidebarDateRange] || [];
        scribes = scribes.filter(s => allowed.includes(s.date));
      }
      // Notes read chronologically within a patient: earliest at top, latest at bottom.
      scribes = scribes.sort(chronoAscending);
      return { ...pg, scribes };
    }).filter(pg => pg.scribes.length > 0);
    if (activeSidebarSortBy === "name-az") groups.sort((a, b) => a.name.localeCompare(b.name));
    if (activeSidebarSortBy === "name-za") groups.sort((a, b) => b.name.localeCompare(a.name));
    if (activeSidebarSortBy === "chron") groups = groups.slice().sort((a, b) => {
      const ai = SIDEBAR_DATE_ORDER.indexOf(a.scribes[0]?.date ?? "");
      const bi = SIDEBAR_DATE_ORDER.indexOf(b.scribes[0]?.date ?? "");
      return bi - ai;
    });
    return groups;
  }, [activeSidebarStatuses, activeSidebarDateRange, activeSidebarSortBy, activeSidebarNoteTypes]);

  const hasSidebarActiveFilters = activeSidebarDateRange !== null || activeSidebarStatuses.size > 0 || activeSidebarNoteTypes.size > 0;

  function switchScribe(id: string) {
    const idx = NOTE_INDEX[id];
    if (!idx) return;
    // Maria has rich per-note config; other patients derive template/status from the sidebar entry.
    const template = MARIA_SCRIBES[id]?.template ?? idx.entry.assessmentType;
    const status = MARIA_SCRIBES[id]?.status ?? idx.entry.status;
    setSelectedSidebarId(id);
    setSections(JSON.parse(JSON.stringify(getSections(template))));
    setActiveTab(template);
    autoScrollRef.current = status === "Incomplete";
    setCurrentErrorIdx(0);
    setSubmitAttempted(status === "Incomplete");
    setShowSyncModal(false);
    setExpandedSections(new Set());
    setShowAllUncaptured(false);
    setShowCitations(false);
    setEditingNarrativeId(null);
    setPopover(null);
  }
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setRadio = (rowId: string, value: string) =>
    setSections(prev => prev.map(s => ({
      ...s,
      subSections: s.subSections.map(sub => ({
        ...sub,
        rows: sub.rows.map(r => r.kind === "radio" && r.id === rowId ? { ...r, selected: value } : r),
      })),
    })));

  const toggleCheck = (rowId: string, itemText: string) =>
    setSections(prev => prev.map(s => ({
      ...s,
      subSections: s.subSections.map(sub => ({
        ...sub,
        rows: sub.rows.map(r =>
          r.kind === "checkbox" && r.id === rowId
            ? { ...r, items: r.items.map(it => it.text === itemText ? { ...it, checked: !it.checked } : it) }
            : r
        ),
      })),
    })));

  const updateGridField = (key: string, idx: number, value: string) =>
    setSections(prev => prev.map(s => ({
      ...s,
      subSections: s.subSections.map(sub => ({
        ...sub,
        rows: sub.rows.map(r => {
          if (r.kind !== "grid") return r;
          const k = r.fields.map(f => f.label).join();
          if (k !== key) return r;
          const fields = r.fields.map((f, i) => i === idx ? { ...f, value } : f);
          return { ...r, fields };
        }),
      })),
    })));

  const updateNarrative = (rowId: string, value: string) =>
    setSections(prev => prev.map(s => ({
      ...s,
      subSections: s.subSections.map(sub => ({
        ...sub,
        rows: sub.rows.map(r => r.kind === "narrative" && r.id === rowId ? { ...r, text: value } : r),
      })),
    })));

  function findRow(rowId: string): SectionRow | null {
    for (const s of sections) {
      for (const sub of s.subSections) {
        for (const r of sub.rows) {
          if (r.kind !== "grid" && r.kind !== "score" && r.id === rowId) return r;
        }
      }
    }
    return null;
  }

  function openFieldPopover(rowId: string, e: React.MouseEvent) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopover({ rowId, rect, searchQuery: "" });
  }

  function isRowCaptured(row: SectionRow): boolean {
    if (row.kind === "radio") return row.selected !== null;
    if (row.kind === "checkbox") return row.items.some(i => i.checked);
    if (row.kind === "grid") return row.fields.some(f => f.value !== "");
    return true;
  }

  function isRowRequired(row: SectionRow): boolean {
    if (row.kind === "radio") return !!row.required;
    if (row.kind === "checkbox") return !!row.required;
    if (row.kind === "grid") return row.fields.some(f => f.required);
    return false;
  }

  function isSectionAllEmpty(section: NurseSection): boolean {
    for (const sub of section.subSections) {
      for (const row of sub.rows) {
        if (row.kind === "score") return false;
        if (row.kind === "narrative" && row.text) return false;
        if (row.kind === "narrative") continue;
        if (isRowCaptured(row) || isRowRequired(row)) return false;
      }
    }
    return true;
  }

  function countUncapturedOptional(section: NurseSection): number {
    let count = 0;
    for (const sub of section.subSections) {
      for (const row of sub.rows) {
        if (row.kind === "score" || row.kind === "narrative") continue;
        if (!isRowCaptured(row) && !isRowRequired(row)) count++;
      }
    }
    return count;
  }

  function getMissingRequiredFields(): { id: string; label: string; section: string }[] {
    const missing: { id: string; label: string; section: string }[] = [];
    for (const section of sections) {
      for (const sub of section.subSections) {
        for (const row of sub.rows) {
          if (row.kind === "radio" && row.required && !row.selected)
            missing.push({ id: row.id, label: row.label, section: section.title });
          if (row.kind === "checkbox" && row.required && !row.items.some(i => i.checked))
            missing.push({ id: row.id ?? "", label: row.label, section: section.title });
          if (row.kind === "grid") {
            for (const f of row.fields) {
              if (f.required && !f.value)
                missing.push({ id: "", label: f.label, section: section.title });
            }
          }
        }
      }
    }
    return missing;
  }

  function hasAnyRequiredEmpty(): boolean {
    return getMissingRequiredFields().length > 0;
  }

  const removeCheck = (rowId: string, itemText: string) => {
    toggleCheck(rowId, itemText);
    setUndoState({ rowId, itemText });
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setUndoState(null), 4000);
  };

  const handleUndo = () => {
    if (undoState) {
      toggleCheck(undoState.rowId, undoState.itemText);
      setUndoState(null);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    }
  };

  function renderRow(row: SectionRow, sectionTitle = "") {
    // Single select — DS ScribeShortField (dropdown + Menu popover).
    if (row.kind === "radio") {
      const isMissing = submitAttempted && !!row.required && !row.selected;
      return (
        <div key={row.id} data-row-id={row.id}>
          <ScribeShortField
            title={row.label}
            required={row.required}
            inputType="single"
            state={isMissing ? "alert" : "default"}
            value={row.selected}
            placeholder={isMissing ? "Required — select" : "Select"}
            options={row.options}
            onSelect={(v) => setRadio(row.id, v)}
          />
        </div>
      );
    }

    // Checkbox — label on top, chips with × below for direct removal. Click + add to open popover.
    if (row.kind === "checkbox") {
      const checkedItems = row.items.filter(i => i.checked);
      const isMissing = submitAttempted && !!row.required && checkedItems.length === 0;
      return (
        <div key={row.id} data-row-id={row.id}
          style={{ display: "flex", flexDirection: "column", padding: "6px 8px", gap: 6, ...(isMissing && { background: "rgba(187,20,17,0.05)", outline: "1px solid rgba(187,20,17,0.25)", borderRadius: 8 }) }}>
          <span className="t-title-sm text-[var(--foreground-secondary,#666)]">
            {row.label}{row.required && <span className="text-[var(--foreground-semantic-danger,#bb1411)] ml-[2px]">*</span>}
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
            {checkedItems.length > 0 ? checkedItems.map((item, idx) => {
              const cit = showCitations ? getCitation(activeTab, item.text) : null;
              const nextCit = showCitations ? getCitation(activeTab, checkedItems[idx + 1]?.text ?? "") : null;
              const showBadge = cit !== null && cit.type === "transcript" && !sameSource(cit, nextCit);
              return (
                <React.Fragment key={item.text}>
                  <Chip
                    label={item.text}
                    color="neutral"
                    size="XS"
                    onDismiss={(e) => { e.stopPropagation(); removeCheck(row.id, item.text); }}
                  />
                  {showBadge && cit?.type === "transcript" && (
                    <Citation n={cit.num} quote={cit.quote} source="Transcript" />
                  )}
                </React.Fragment>
              );
            }) : <span className="t-body-sm" style={{ color: isMissing ? "#bb1411" : "#ccc" }}>{isMissing ? "Required — tap to add" : "—"}</span>}
            <Button variant="tertiary" size="small" prefix={<Icon name="add" size={14} />} onClick={(e) => openFieldPopover(row.id, e)}>add</Button>
          </div>
        </div>
      );
    }

    // Grid — DS ScribeShortField (text) per field; click to edit inline.
    if (row.kind === "grid") {
      const key = row.fields.map(f => f.label).join("|");
      return (
        <div key={"grid" + key} className="flex flex-col">
          {row.fields.map((f, i) => {
            const isEditing = editingGridField?.key === key && editingGridField?.idx === i;
            const isEmpty = !f.value;
            const fieldMissing = submitAttempted && !!f.required && isEmpty;
            return (
              <ScribeShortField
                key={i}
                title={f.label}
                required={f.required}
                inputType="text"
                mode={isEditing ? "edit" : "view"}
                state={fieldMissing ? "alert" : isEditing ? "active" : "default"}
                value={f.value}
                placeholder={fieldMissing ? "Required — click to fill" : "Type here…"}
                onChange={(v) => updateGridField(key, i, v)}
                onClick={() => setEditingGridField(isEditing ? null : { key, idx: i })}
              />
            );
          })}
        </div>
      );
    }

    // Score — rendered as a plain short text field (no colored risk highlight).
    if (row.kind === "score") {
      return (
        <div key={"score" + row.items[0]?.label} className="flex flex-col gap-[4px]">
          {row.items.map((s, i) => (
            <ScribeShortField
              key={i}
              title={s.label}
              inputType="text"
              mode="view"
              value={`${s.value} / ${s.max}${s.risk ? ` — ${s.risk}` : ""}`}
            />
          ))}
        </div>
      );
    }

    // Narrative — long field: DS ScribeLongField
    if (row.kind === "narrative") {
      const isEditing = editingNarrativeId === row.id;
      return (
        <ScribeLongField
          key={row.id}
          sectionTitle=""
          value={row.text}
          mode={isEditing ? "edit" : "view"}
          onEdit={() => setEditingNarrativeId(row.id)}
          onChange={(v) => updateNarrative(row.id, v)}
          onSave={() => setEditingNarrativeId(null)}
          onCancel={() => setEditingNarrativeId(null)}
          placeholder="Click to add text…"
        />
      );
    }

    return null;
  }

  return (
    <>
    <div className="flex flex-1 overflow-hidden" style={{ fontFamily: "Lato, sans-serif" }}>

      {/* ── Sidebar ── */}
      <div className="shrink-0 flex flex-col bg-white relative" style={{ width: 240, borderRight: "1px solid rgba(0,0,0,0.08)", height: "100vh" }}>
        <div className="flex items-center" style={{ padding: "0 12px", height: 56 }}>
          <span className="t-title-lg" style={{ color: "var(--foreground-primary,#1a1a1a)" }}>My Scribes</span>
        </div>
        <div className="flex items-center justify-between" style={{ padding: "8px 12px" }}>
          <div className="flex items-center gap-[4px]">
            <Button variant="tertiary" size="small" prefix={<Icon name="search" size={14} />}>Search</Button>
            <div ref={sidebarFilterBtnRef} className="relative inline-flex">
              <Button variant="tertiary" size="small" prefix={<Icon name="filter_list" size={14} />} onClick={handleSidebarFilterClick}>Filter</Button>
              {hasSidebarActiveFilters && <span className="absolute top-[2px] right-[2px]"><NotificationDot variant="accent" /></span>}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 80 }}>
          {displaySidebarPatients.map((pg, i) => {
            const hasSelected = pg.scribes.some(s => selectedSidebarId === s.id);
            // Auto-expand a patient if the selected note isn't its most recent one.
            const mostRecentId = pg.scribes[pg.scribes.length - 1]?.id;
            const forceExpand = pg.scribes.some(s => s.id === selectedSidebarId && s.id !== mostRecentId);
            const isExpanded = expandedPatients.has(pg.patientId) || forceExpand;
            const noteCount = pg.scribes.length;
            return (
              <div key={pg.patientId} style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.06)" : "none", borderRight: hasSelected ? "3px solid var(--accent,#1132ee)" : "3px solid transparent", ...(hasSelected && { marginRight: -1, position: "relative", zIndex: 1 }) }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "10px 12px 6px 16px" }}>
                  {/* Clicking the patient lands on their newest note. */}
                  <button
                    onClick={() => switchScribe(mostRecentId)}
                    className="text-left min-w-0 flex-1 rounded-[6px] pr-[4px] py-[2px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors cursor-pointer"
                  >
                    <div className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">{pg.name}</div>
                    <div className="t-body-xs text-[var(--foreground-secondary,#666)] mt-[1px]">{pg.patientMeta}</div>
                  </button>
                  {noteCount > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePatient(pg.patientId); }}
                      className="flex items-center gap-[2px] shrink-0 rounded-[6px] pl-[6px] pr-[2px] py-[2px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors cursor-pointer"
                      aria-label={isExpanded ? "Show fewer notes" : "Show all notes"}
                    >
                      <span className="t-body-xs text-[var(--foreground-secondary,#666)] whitespace-nowrap">{noteCount} notes</span>
                      <Icon name={isExpanded ? "expand_more" : "chevron_right"} size={16} className="text-[var(--foreground-secondary,#666)]" />
                    </button>
                  )}
                </div>
                {(() => {
                  const renderRow = (s: SidebarScribeEntry) => {
                    const isSel = selectedSidebarId === s.id;
                    return (
                      <div key={s.id}
                        onClick={() => switchScribe(s.id)}
                        className={`flex items-center gap-[8px] pl-[16px] pr-[12px] py-[6px] transition-colors cursor-pointer ${isSel ? "bg-[var(--litmus-25,#f1f3fe)]" : "hover:bg-[var(--surface-1,#f7f7f7)]"}`}
                      >
                        {/* timestamp gutter — indents the note title */}
                        <span className="t-body-xs text-[var(--foreground-secondary,#666)] shrink-0 w-[34px]">{s.time}</span>
                        <span className={`${isSel ? "t-title-sm" : "t-body-sm"} text-[var(--foreground-primary,#1a1a1a)] truncate flex-1`}>
                          {s.assessmentType}
                        </span>
                        <ScribeStatusBadge status={s.status} />
                      </div>
                    );
                  };

                  // Collapsed shows only the most recent note; expanded shows all.
                  const visible = isExpanded ? pg.scribes : pg.scribes.slice(-1);
                  return (
                    <div style={{ marginBottom: 6 }}>
                      {visible.map(renderRow)}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-0 bg-white" style={{ width: 240, padding: "8px 12px 24px", boxSizing: "border-box" }}>
          <Button variant="secondary" size="large" className="w-full" prefix={<Icon name="mic" size={18} />} onClick={onRecordNew}>Record new scribe</Button>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div ref={mainScrollRef} className="flex-1 overflow-y-auto" style={{ paddingBottom: 80 }}>


          <div style={{ maxWidth: 680, margin: "0 auto", paddingTop: 24, paddingLeft: 20, paddingRight: 20 }}>

            {/* Header */}
            <div style={{ padding: "0 8px", marginBottom: 4 }}>
              <div className="flex items-center justify-between">
                <h1 className="t-title-xl" style={{ margin: 0, color: "var(--foreground-primary,#1a1a1a)" }}>{NOTE_INDEX[selectedSidebarId]?.name ?? "Maria Santos"}</h1>
                <IconButton icon={<Icon name="more_horiz" size={18} />} variant="tertiary-neutral" size="small" aria-label="Menu" />
              </div>
              <div className="t-body-sm" style={{ color: "var(--foreground-secondary,#666)", marginTop: 4 }}>
                {NOTE_INDEX[selectedSidebarId]?.patientId === "p1"
                  ? "Hip Fracture · 72 · F · Bed 4B · Admitted Jun 22"
                  : (NOTE_INDEX[selectedSidebarId]?.meta ?? "")}
              </div>
              <div className="t-body-xs" style={{ color: "var(--foreground-tertiary,#808080)", marginTop: 3 }}>
                {NOTE_INDEX[selectedSidebarId]?.patientId === "p1" ? "Sarah Chen, RN · " : ""}
                {MARIA_SCRIBES[selectedSidebarId]?.updated
                  ?? (NOTE_INDEX[selectedSidebarId] ? `${NOTE_INDEX[selectedSidebarId].entry.date}, ${NOTE_INDEX[selectedSidebarId].entry.time}` : "")}
              </div>
            </div>

            {/* Tabs */}
            <div className="px-[8px]">
              {(() => {
                const tpl = MARIA_SCRIBES[selectedSidebarId]?.template ?? activeTab;
                const hasTranscript = !!MARIA_SCRIBES[selectedSidebarId]?.hasTranscript;
                return (
                  <Tabs
                    tabs={[{ id: tpl, label: tpl }, { id: "Transcripts", label: "Transcripts" }]}
                    activeTab={activeTab}
                    onTabChange={(id) => { if (id === "Transcripts" && !hasTranscript) return; setActiveTab(id); }}
                  />
                );
              })()}
            </div>

            {/* Toggles */}
            <div style={{ display: "flex", gap: 4, padding: 8, flexWrap: "wrap", alignItems: "center" }}>
              <Button
                variant={showCitations ? "accent" : "secondary"}
                size="small"
                prefix={<Icon name="lightbulb" size={16} />}
                onClick={() => setShowCitations(v => !v)}
              >
                Citation {showCitations ? "on" : "off"}
              </Button>
              <Button
                variant={showAllUncaptured ? "accent" : "secondary"}
                size="small"
                prefix={<Icon name="checklist" size={16} />}
                onClick={() => setShowAllUncaptured(v => !v)}
              >
                Uncaptured fields {showAllUncaptured ? "on" : "off"}
              </Button>
              <Button variant="tertiary" size="small" className="ml-auto" prefix={<Icon name="thumbs_up_down" size={16} />}>
                Rate this scribe
              </Button>
            </div>

            {/* Sections */}
            <div style={{ paddingTop: 16, paddingBottom: 40 }}>
              {sections.map((section, sIdx) => {
                const allEmpty = isSectionAllEmpty(section);
                const uncapturedOptCount = countUncapturedOptional(section);
                const isExpanded = expandedSections.has(section.id);
                const toggleExpand = () => setExpandedSections(prev => {
                  const s = new Set(prev);
                  if (s.has(section.id)) s.delete(section.id); else s.add(section.id);
                  return s;
                });

                if (allEmpty) {
                  const totalRows = section.subSections.reduce(
                    (acc, sub) => acc + sub.rows.filter(r => r.kind !== "score").length, 0
                  );
                  return (
                    <div key={section.id} data-section-id={section.id} style={{ marginBottom: 8 }}>
                      {sIdx > 0 && <div className="mx-[8px] my-[12px]"><Divider /></div>}
                      {renderSectionHeader(section)}
                      {isExpanded && section.subSections.map((sub, subi) => (
                        <div key={subi} style={{ padding: "0 8px" }}>
                          {sub.title && <div className="t-title-xs" style={{ color: "var(--foreground-secondary,#888)", paddingLeft: 8, marginTop: 14, marginBottom: 10 }}>{sub.title}</div>}
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: sub.title ? 0 : 4, marginBottom: 4 }}>
                            {sub.rows.map((row, ri) => <div key={ri}>{renderRow(row, section.title)}</div>)}
                          </div>
                        </div>
                      ))}
                      <div style={{ padding: "4px 8px 0" }}>
                        <Button variant="tertiary" size="small" suffix={<Icon name={isExpanded ? "expand_less" : "expand_more"} size={16} />} onClick={toggleExpand}>
                          {isExpanded ? "Hide fields" : `${totalRows} fields not captured`}
                        </Button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={section.id} data-section-id={section.id} className="group" style={{ marginBottom: 8 }}>
                    {sIdx > 0 && <div className="mx-[8px] my-[12px]"><Divider /></div>}
                    {(() => {
                      // Single-narrative section: the section name is the field label. Merge them —
                      // actions in the header, text right below (no separate field toolbar).
                      const only = section.subSections.length === 1 && !section.subSections[0].title
                        && section.subSections[0].rows.length === 1 && section.subSections[0].rows[0].kind === "narrative"
                        ? (section.subSections[0].rows[0] as Extract<SectionRow, { kind: "narrative" }>)
                        : null;
                      if (!only) return renderSectionHeader(section);
                      const editingThis = editingNarrativeId === only.id;
                      const actions = editingThis ? null : (
                        <div className="flex items-center gap-[2px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="tertiary" size="small" prefix={<Icon name="mic" size={14} />} onClick={() => setEditingNarrativeId(only.id)}>Dictate</Button>
                          <Button variant="tertiary" size="small" prefix={<Icon name="bolt" size={14} />}>Add macro</Button>
                          <Button variant="tertiary" size="small" prefix={<Icon name="content_copy" size={14} />}>Copy</Button>
                        </div>
                      );
                      return (
                        <>
                          {renderSectionHeader(section, actions)}
                          <div style={{ padding: "0 8px 4px" }}>
                            <ScribeLongField
                              bare
                              value={only.text}
                              mode={editingThis ? "edit" : "view"}
                              onEdit={() => setEditingNarrativeId(only.id)}
                              onChange={(v) => updateNarrative(only.id, v)}
                              onSave={() => setEditingNarrativeId(null)}
                              onCancel={() => setEditingNarrativeId(null)}
                              placeholder="Click to add text…"
                            />
                          </div>
                        </>
                      );
                    })()}

                    {section.subSections.map((sub, subi) => {
                      // Narrative-only sections render their field above (merged with the header).
                      if (section.subSections.length === 1 && !sub.title && sub.rows.length === 1 && sub.rows[0].kind === "narrative") return null;
                      const visibleRows = sub.rows.filter(row => {
                        if (row.kind === "score" || row.kind === "narrative") return true;
                        if (isRowCaptured(row)) return true;
                        if (isRowRequired(row)) return true;
                        return showAllUncaptured || isExpanded;
                      });
                      if (visibleRows.length === 0) return null;
                      return (
                        <div key={subi} style={{ padding: "0 8px" }}>
                          {sub.title && (
                            <div className="t-title-xs" style={{ color: "var(--foreground-secondary,#888)", paddingLeft: 8, marginTop: 14, marginBottom: 10 }}>
                              {sub.title}
                            </div>
                          )}
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: sub.title ? 0 : 4, marginBottom: 4 }}>
                            {visibleRows.map((row, ri) => <div key={ri}>{renderRow(row, section.title)}</div>)}
                          </div>
                        </div>
                      );
                    })}

                    {uncapturedOptCount > 0 && !showAllUncaptured && (
                      <div style={{ padding: "4px 8px 0" }}>
                        <Button variant="tertiary" size="small" suffix={<Icon name={isExpanded ? "expand_less" : "expand_more"} size={16} />} onClick={toggleExpand}>
                          {isExpanded ? "Hide optional fields" : `${uncapturedOptCount} optional field${uncapturedOptCount !== 1 ? "s" : ""} not filled in`}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="shrink-0 bg-white">
          <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 8px 24px" }}>
            {/* Left — required fields pager */}
            {submitAttempted && hasAnyRequiredEmpty() ? (() => {
              const missing = getMissingRequiredFields();
              const idx = Math.min(currentErrorIdx, missing.length - 1);
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                  <span className="t-title-sm whitespace-nowrap" style={{ color: "var(--foreground-semantic-danger,#bb1411)" }}>
                    Missing required fields
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <IconButton icon={<Icon name="chevron_left" size={16} />} variant="tertiary-neutral" size="small" aria-label="Previous field" onClick={() => { const p = (idx - 1 + missing.length) % missing.length; setCurrentErrorIdx(p); scrollToRow(missing[p].id); }} />
                    <span className="t-body-xs" style={{ color: "#555", whiteSpace: "nowrap" as const }}>{idx + 1} / {missing.length}</span>
                    <IconButton icon={<Icon name="chevron_right" size={16} />} variant="tertiary-neutral" size="small" aria-label="Next field" onClick={() => { const n = (idx + 1) % missing.length; setCurrentErrorIdx(n); scrollToRow(missing[n].id); }} />
                  </div>
                </div>
              );
            })() : <div />}
            {/* Right — AI Actions + Sync to EHR */}
            {(() => {
              const isEndOfShiftNarrative = activeTab === "End of Shift Narrative";
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Button variant="secondary" size="large" prefix={<MagicEdit size={18} />}>AI Actions</Button>
                  <SplitButton
                    label="Sync to EHR"
                    size="large"
                    variant="primary"
                    prefix={<Icon name="cloud_upload" size={18} />}
                    onClick={() => {
                      if (hasAnyRequiredEmpty()) { autoScrollRef.current = true; setCurrentErrorIdx(0); setSubmitAttempted(true); return; }
                      if (isEndOfShiftNarrative) { setShowSyncModal(true); return; }
                      setSubmitAttempted(false);
                    }}
                    onMenuOpen={() => {}}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── Assistant sidebar ── */}
      <AssistantSidebar
        showCourse={false}
        sources={[
          { title: "Live transcript", detail: "Today, 14:32 · Shift assessment" },
          { title: "Vitals — EMS handoff", detail: "Today, 08:00 · Flowsheet" },
          { title: "Problem list", detail: "Jun 22 · Medical record" },
        ]}
      />
    </div>

      {/* ── Sidebar filter panel ── */}
      {sidebarFilterOpen && (
        <div ref={sidebarFilterPanelRef} style={{ position: "fixed", top: sidebarFilterPos.top, left: sidebarFilterPos.left, zIndex: 1000, background: "white", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)", width: 256, maxHeight: 480, overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "Lato, sans-serif" }}>
          <div style={{ overflowY: "auto", padding: "14px 14px 4px" }}>
            <div className="t-title-sm text-[var(--foreground-primary,#1a1a1a)] mb-[10px]">All filters</div>
            <div className="mb-[12px]">
              <div className="t-title-xs text-[var(--foreground-secondary,#666)] mb-[6px]">Filter by date range</div>
              <RadioGroup options={SIDEBAR_DATE_RANGE_OPTIONS} value={draftSidebarDateRange ?? ""} onChange={setDraftSidebarDateRange} />
            </div>
            <div className="mb-[12px]">
              <div className="t-title-xs text-[var(--foreground-secondary,#666)] mb-[6px]">Sort by</div>
              <RadioGroup options={SIDEBAR_SORT_OPTIONS} value={draftSidebarSortBy} onChange={setDraftSidebarSortBy} />
            </div>
            <div className="mb-[12px]">
              <div className="t-title-xs text-[var(--foreground-secondary,#666)] mb-[6px]">Filter by status</div>
              <div className="flex flex-col gap-[4px]">
                {SIDEBAR_ALL_STATUSES.map(status => (
                  <label key={status} className="flex items-center gap-[6px] cursor-pointer">
                    <Checkbox state={draftSidebarStatuses.has(status) ? "selected" : "unselected"} onChange={() => toggleDraftSidebarStatus(status)} />
                    <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)]">{status}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-[6px]">
              <div className="t-title-xs text-[var(--foreground-secondary,#666)] mb-[6px]">Filter by note type</div>
              <div className="flex flex-col gap-[4px]">
                {SIDEBAR_ALL_NOTE_TYPES.map(noteType => (
                  <label key={noteType} className="flex items-center gap-[6px] cursor-pointer">
                    <Checkbox state={draftSidebarNoteTypes.has(noteType) ? "selected" : "unselected"} onChange={() => toggleDraftSidebarNoteType(noteType)} />
                    <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)]">{noteType}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-[14px] pt-[10px] pb-[14px] bg-white shrink-0">
            <Button variant="tertiary" size="small" onClick={resetSidebarFilter}>Reset all</Button>
            <Button variant="primary" size="small" onClick={applySidebarFilter}>Apply</Button>
          </div>
        </div>
      )}

      {/* ── Sync confirmation modal (End of Shift Narrative) ── */}
      <PopUp
        open={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        title="Sign & sync to EHR"
        size="large"
        actions={
          <>
            <Button variant="primary" size="large" className="w-full" onClick={() => { setShowSyncModal(false); setSubmitAttempted(false); }}>
              Sign & sync
            </Button>
            <Button variant="secondary" size="large" className="w-full" onClick={() => setShowSyncModal(false)}>
              Cancel
            </Button>
          </>
        }
      >
        <p className="t-body-md text-[var(--foreground-secondary,#666)] m-0">
          By signing, you confirm this end of shift narrative is accurate and complete. This will sync it to the patient's medical record.
        </p>
      </PopUp>

      {/* ── Field edit popover ── */}
      {popover && (() => {
        const row = findRow(popover.rowId);
        if (!row) return null;
        const { rect } = popover;

        if (row.kind === "radio") {
          const sel = row.selected;
          const others = row.options.filter(o => o !== sel);
          const pw = 256;
          const left = Math.max(8, Math.min(rect.left, window.innerWidth - pw - 8));
          const estH = 44 + 20 + (sel ? 44 : 0) + others.length * 38;
          const flipUp = rect.bottom + 4 + estH > window.innerHeight - 8;
          const vPos = flipUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 };
          return (
            <>
              <div onClick={() => setPopover(null)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
              <div style={{ position: "fixed", ...vPos, left, width: pw, zIndex: 100, background: "white", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <div style={{ padding: "11px 14px 8px" }}>
                  <span className="t-body-xs" style={{ color: "var(--foreground-secondary,#666)" }}>{row.label}</span>
                </div>
                <div style={{ padding: "5px 5px 7px" }}>
                  {sel && (
                    <button onClick={() => { setRadio(row.id, sel); setPopover(null); }}
                      onMouseEnter={() => setHoveredPopoverOption(sel)}
                      onMouseLeave={() => setHoveredPopoverOption(null)}
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", background: hoveredPopoverOption === sel ? "#e4e8fc" : "#EEF1FD", border: "none", borderRadius: 7, cursor: "pointer", fontFamily: "Lato, sans-serif", textAlign: "left" }}>
                      <div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid #1132ee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#1132ee" }} />
                      </div>
                      <span className="t-body-sm" style={{ color: "var(--foreground-primary,#1a1a1a)" }}>{sel}</span>
                    </button>
                  )}
                  <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "5px 8px" }} />
                  {others.map(opt => (
                    <button key={opt} onClick={() => { setRadio(row.id, opt); setPopover(null); }}
                      onMouseEnter={() => setHoveredPopoverOption(opt)}
                      onMouseLeave={() => setHoveredPopoverOption(null)}
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", background: hoveredPopoverOption === opt ? "var(--surface-1,#f7f7f7)" : "none", border: "none", borderRadius: 7, cursor: "pointer", fontFamily: "Lato, sans-serif", textAlign: "left" }}>
                      <div style={{ width: 13, height: 13, borderRadius: "50%", border: "1.5px solid rgba(0,0,0,0.2)", flexShrink: 0 }} />
                      <span className="t-body-sm" style={{ color: "var(--foreground-primary,#1a1a1a)" }}>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          );
        }

        if (row.kind === "checkbox") {
          const q = popover.searchQuery.toLowerCase();
          const items = q ? row.items.filter(i => i.text.toLowerCase().includes(q)) : row.items;
          const showSearch = row.items.length > 8;
          const pw = 300;
          const left = Math.max(8, Math.min(rect.left, window.innerWidth - pw - 8));
          const estH = 44 + (showSearch ? 48 : 0) + 260;
          const flipUp = rect.bottom + 4 + estH > window.innerHeight - 8;
          const vPos = flipUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 };
          return (
            <>
              <div onClick={() => setPopover(null)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
              <div style={{ position: "fixed", ...vPos, left, width: pw, zIndex: 100 }}>
                <Menu className="w-full flex flex-col">
                  <div className="px-[8px] pt-[2px] pb-[6px]">
                    <span className="t-title-xs text-[var(--foreground-tertiary,#808080)]">{row.label}</span>
                  </div>
                  {showSearch && (
                    <div className="flex items-center gap-[6px] px-[8px] pb-[6px]">
                      <Icon name="search" size={16} className="text-[var(--foreground-tertiary,#808080)] shrink-0" />
                      <input value={popover.searchQuery}
                        onChange={e => setPopover(prev => prev ? { ...prev, searchQuery: e.target.value } : null)}
                        placeholder="Search…"
                        className="t-body-sm flex-1 min-w-0 outline-none bg-transparent text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[var(--foreground-tertiary,#808080)]"
                      />
                    </div>
                  )}
                  <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
                    {items.map(item => (
                      <button key={item.text} onClick={() => toggleCheck(row.id, item.text)}
                        className="flex items-start gap-[4px] w-full px-[4px] py-[5px] rounded-[6px] text-left hover:bg-[var(--surface-1,#f7f7f7)] transition-colors cursor-pointer">
                        <Checkbox size="S" state={item.checked ? "selected" : "unselected"} className="-mt-[2px]" />
                        <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)] flex-1 min-w-0">{item.text}</span>
                      </button>
                    ))}
                  </div>
                </Menu>
              </div>
            </>
          );
        }

        return null;
      })()}

      {/* ── Undo toast ── */}
      {undoState && (
        <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-[200]">
          <Snackbar message="Item removed" action={{ label: "Undo", onClick: handleUndo }} onDismiss={() => setUndoState(null)} />
        </div>
      )}
    </>
  );
}
