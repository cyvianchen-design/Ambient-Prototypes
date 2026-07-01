import React, { useState, useRef, useEffect, useMemo } from "react";
import { Icon, MagicButton, MagicEdit } from "@ds/ui";
import { MicIcon } from "../components/MicIcon";
import type { ScribeItemStatus } from "../components/ScribeListItem";

// ─── Sidebar scribes ──────────────────────────────────────────────────────────
type SidebarScribeEntry = { id: string; assessmentType: string; date: string; time: string; status: ScribeItemStatus };
type SidebarPatientGroup = { patientId: string; name: string; patientMeta: string; scribes: SidebarScribeEntry[] };

const SIDEBAR_STATUS_COLORS: Record<ScribeItemStatus, { color: string; icon: string }> = {
  "In Progress":  { color: "#1132ee", icon: "pending" },
  "Pending Sync": { color: "#b45309", icon: "schedule" },
  "Syncing":      { color: "#6d28d9", icon: "sync" },
  "Resyncing":    { color: "#6d28d9", icon: "sync" },
  "Error":        { color: "#bb1411", icon: "error" },
  "Synced":       { color: "#3f8d43", icon: "check_circle" },
};

const SIDEBAR_ALL_STATUSES: ScribeItemStatus[] = ["In Progress", "Pending Sync", "Syncing", "Resyncing", "Error", "Synced"];
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
      { id: "d_ds", assessmentType: "Discharge Summary",      date: "Today", time: "20:00", status: "In Progress" },
      { id: "d_eo", assessmentType: "End of Shift Narrative", date: "Today", time: "19:30", status: "Pending Sync" },
      { id: "d_ho", assessmentType: "Handoff",              date: "Today", time: "18:00", status: "Syncing" },
      { id: "d1",   assessmentType: "Shift Assessment",     date: "Today", time: "14:32", status: "Error" },
      { id: "d_s1", assessmentType: "Shift Assessment",     date: "Mon",   time: "22:15", status: "Resyncing" },
      { id: "d6",   assessmentType: "Admission Assessment", date: "Sun",   time: "11:45", status: "Synced" },
      { id: "d_tr", assessmentType: "Triage",               date: "Sun",   time: "08:20", status: "Synced" },
    ],
  },
  {
    patientId: "p2", name: "James Vetrovs", patientMeta: "Pneumonia · 60 · M",
    scribes: [
      { id: "d7",  assessmentType: "End of Shift Narrative", date: "Mon", time: "21:10", status: "Pending Sync" },
      { id: "d10", assessmentType: "Admission Assessment",   date: "Sun", time: "18:05", status: "Synced" },
      { id: "d11", assessmentType: "Triage",                 date: "Sun", time: "16:30", status: "Synced" },
    ],
  },
  {
    patientId: "p3", name: "Terry Philips", patientMeta: "DKA · 32 · F",
    scribes: [
      { id: "d8", assessmentType: "Admission Assessment", date: "Mon", time: "17:45", status: "Pending Sync" },
      { id: "d9", assessmentType: "Triage",               date: "Mon", time: "14:20", status: "Synced" },
    ],
  },
  {
    patientId: "p4", name: "Robert Kim", patientMeta: "CHF · 67 · M",
    scribes: [
      { id: "d2", assessmentType: "Shift Assessment", date: "Today", time: "09:15", status: "Pending Sync" },
    ],
  },
  {
    patientId: "p5", name: "Linda Torres", patientMeta: "Post-op Colectomy · 55 · F",
    scribes: [
      { id: "d3", assessmentType: "Triage", date: "Today", time: "08:45", status: "In Progress" },
    ],
  },
  {
    patientId: "p6", name: "David Chen", patientMeta: "COPD Exacerbation · 45 · M",
    scribes: [
      { id: "d4", assessmentType: "ED Assessment", date: "Today", time: "07:30", status: "Error" },
    ],
  },
  {
    patientId: "p7", name: "Sandra White", patientMeta: "Elective Hyst. · 38 · F",
    scribes: [
      { id: "d5", assessmentType: "Discharge Summary", date: "Today", time: "06:00", status: "Pending Sync" },
    ],
  },
];

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
          text: "Patient verbalized: \"I want to walk to the end of the hallway with PT today and keep my pain under control.\"\n\nPlan: PT session at 1500 — ambulate ×2 today. Continue scheduled pain protocol. Surgical drain to be assessed at 1900 — notify Dr. Nguyen if output >50 mL/2h. Discharge planning in progress, targeting Jun 26." },
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
          text: "1. Surgical drain — check output at 1900. If >50 mL/2h, page Dr. Nguyen (beeper 4412).\n2. Pain protocol — continue scheduled analgesics. PRN available if needed.\n3. PT at 0900 tomorrow — morning ROM exercises before session.\n4. Discharge target Jun 26 — home health referral in progress. Family updated.\n5. Antihypertensives due at 2100 — lisinopril 10mg PO." },
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
          { label: "Patient", value: "Linda Torres — Bed 7C" },
          { label: "Diagnosis", value: "Post-op Day 2 — laparoscopic colectomy" },
          { label: "Surgeon", value: "Dr. Okonkwo" },
        ]},
        { kind: "radio", id: "eos-code", label: "Code Status",
          options: ["Full code", "DNR", "DNI", "DNR/DNI", "Comfort measures only"], selected: "Full code" },
        { kind: "radio", id: "eos-discharge", label: "Anticipated Discharge",
          options: ["Today", "Tomorrow", "2–3 days", "Unclear", "Transfer pending"], selected: "Tomorrow" },
        { kind: "score", items: [{ label: "Pain Score (end of shift)", value: 1, max: 10, risk: "Well-controlled", riskColor: "#3f8d43" }] },
      ],
    }],
  },
  {
    id: "eos-events", title: "Events During Shift",
    subSections: [{
      title: "",
      rows: [
        { kind: "narrative", id: "eos-events-text",
          text: "0730 — Dressing change: incision sites dry and intact, no dehiscence or infection.\n1130 — Patient reported nausea following oral oxycodone. Zofran 4mg IV given with good effect.\n1430 — PT visit: patient tolerated therapy. Ambulated 100 ft in hallway with assist ×1.\n1600 — Dr. Okonkwo rounded. Anticipates discharge tomorrow pending morning labs." },
      ],
    }],
  },
  {
    id: "eos-tasks", title: "Outstanding Tasks & Follow-Up",
    subSections: [{
      title: "",
      rows: [
        { kind: "narrative", id: "eos-tasks-text",
          text: "1. CBC ordered for 0600 — check results, notify MD if Hgb <8.\n2. Stoma care patient education not yet completed — wound care nurse requested for AM.\n3. Discharge paperwork pending Rx from surgeon.\n4. Patient's husband arriving 0800 — update on discharge plan." },
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
          options: ["Stable", "Improved", "Unchanged", "Declined"], selected: "Stable" },
        { kind: "radio", id: "d-transport", label: "Mode of Transport",
          options: ["Personal vehicle", "Family / friend driving", "Ambulance", "Medical transport", "Taxi / rideshare"],
          selected: "Personal vehicle" },
        { kind: "grid", cols: 3, fields: [
          { label: "Primary Diagnosis", value: "CAP — RLL" },
          { label: "Afebrile Since", value: "Jun 22 (48+ hours)" },
          { label: "SpO₂ on Room Air", value: "97%" },
        ]},
      ],
    }],
  },
  {
    id: "d-education", title: "Patient Education",
    subSections: [{
      title: "Topics Covered",
      rows: [
        { kind: "checkbox", id: "d-ed-topics", label: "Education Topics",
          items: [
            { text: "Pneumonia recovery and prevention", checked: true },
            { text: "Inhaler technique — Albuterol PRN", checked: true },
            { text: "Hand hygiene and respiratory precautions", checked: true },
            { text: "Return precautions (when to call / go to ED)", checked: true },
            { text: "Activity restrictions", checked: true },
            { text: "Medication adherence", checked: false },
            { text: "Dietary instructions", checked: false },
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
          text: "1. Complete full Azithromycin course (days 3–7 remaining — 5 tablets).\n2. Activity: Increase gradually. May shower. No strenuous exercise ×1 week.\n3. Diet: No restrictions. Push fluids — 8–10 glasses/day.\n4. Return to ED or call 911 if: fever >101.5°F, chest pain, worsening shortness of breath, or SpO₂ <92%." },
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
  "d_s1": { template: "Shift Assessment",        updated: "Resyncing, Mon 22:15", status: "Resyncing",     hasTranscript: true  },
  "d1":   { template: "Shift Assessment",        updated: "Updated today, 14:32", status: "Error",         hasTranscript: true  },
  "d_ho": { template: "Handoff",                 updated: "Syncing, 18:00",       status: "Syncing",       hasTranscript: false },
  "d_eo": { template: "End of Shift Narrative",  updated: "Updated today, 19:30", status: "Pending Sync",  hasTranscript: true  },
  "d_ds": { template: "Discharge Summary",       updated: "In progress, 20:00",   status: "In Progress",   hasTranscript: false },
  "d7":   { template: "End of Shift Narrative",  updated: "Updated Mon, 21:10",   status: "Pending Sync",  hasTranscript: true  },
};

// ─── Component ────────────────────────────────────────────────────────────────
type Props = { scribeId: string; template?: string };

export default function ScribeDetailPage({ scribeId }: Props) {
  const initialSidebarId = (() => {
    const mapped = scribeId.replace(/^s/, "d");
    return MARIA_SCRIBES[mapped] ? mapped : "d1";
  })();
  const [selectedSidebarId, setSelectedSidebarId] = useState<string>(initialSidebarId);
  const [activeTab, setActiveTab] = useState(MARIA_SCRIBES[initialSidebarId]?.template ?? "Shift Assessment");
  const [sections, setSections] = useState<NurseSection[]>(() => JSON.parse(JSON.stringify(getSections(MARIA_SCRIBES[initialSidebarId]?.template ?? "Shift Assessment"))));
  const [editingNarrativeId, setEditingNarrativeId] = useState<string | null>(null);
  const [popover, setPopover] = useState<{ rowId: string; rect: DOMRect; searchQuery: string } | null>(null);
  const [editingGridField, setEditingGridField] = useState<{ key: string; idx: number } | null>(null);
  const [showAllUncaptured, setShowAllUncaptured] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [citationPopover, setCitationPopover] = useState<{ source: CitationSource; x: number; y: number } | null>(null);
  const citationPopoverRef = useRef<HTMLDivElement>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [submitAttempted, setSubmitAttempted] = useState(MARIA_SCRIBES[initialSidebarId]?.status === "Error");
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [currentErrorIdx, setCurrentErrorIdx] = useState(0);
  const autoScrollRef = useRef(false);
  const [undoState, setUndoState] = useState<{ rowId: string; itemText: string } | null>(null);
  const [hoveredPopoverOption, setHoveredPopoverOption] = useState<string | null>(null);
  const [collapsedPatients, setCollapsedPatients] = useState<Set<string>>(new Set());
  const [activeSectionId, setActiveSectionId] = useState<string>("");
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
  const sidebarFilterBtnRef = useRef<HTMLButtonElement>(null);
  const sidebarFilterPanelRef = useRef<HTMLDivElement>(null);

  function togglePatient(patientId: string) {
    setCollapsedPatients(prev => {
      const next = new Set(prev);
      if (next.has(patientId)) next.delete(patientId);
      else next.add(patientId);
      return next;
    });
  }

  function toggleAllPatients() {
    const allIds = sidebarPatients.map(p => p.patientId);
    const allCollapsed = allIds.every(id => collapsedPatients.has(id));
    setCollapsedPatients(allCollapsed ? new Set() : new Set(allIds));
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
    const el = document.querySelector(`[data-section-id="${sectionId}"]`) as HTMLElement | null;
    if (!el) return;
    const container = el.closest(".overflow-y-auto") as HTMLElement | null;
    if (!container) return;
    const elRect = el.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    container.scrollTop = Math.max(0, container.scrollTop + elRect.top - cRect.top - 16);
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
    const container = document.querySelector(".overflow-y-auto") as HTMLElement | null;
    if (!container) return;
    function onScroll() {
      const cRect = container!.getBoundingClientRect();
      let best = "";
      let bestDist = Infinity;
      sections.forEach(s => {
        const el = container!.querySelector(`[data-section-id="${s.id}"]`) as HTMLElement | null;
        if (!el) return;
        const dist = Math.abs(el.getBoundingClientRect().top - cRect.top);
        if (dist < bestDist) { bestDist = dist; best = s.id; }
      });
      setActiveSectionId(best);
    }
    container.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => container.removeEventListener("scroll", onScroll);
  }, [sections]);

  const displaySidebarPatients = useMemo(() => {
    let groups = sidebarPatients.map(pg => {
      let scribes = [...pg.scribes];
      if (activeSidebarStatuses.size > 0) scribes = scribes.filter(s => activeSidebarStatuses.has(s.status));
      if (activeSidebarNoteTypes.size > 0) scribes = scribes.filter(s => activeSidebarNoteTypes.has(s.assessmentType));
      if (activeSidebarDateRange) {
        const allowed = SIDEBAR_DATE_INCLUDES[activeSidebarDateRange] || [];
        scribes = scribes.filter(s => allowed.includes(s.date));
      }
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
    const info = MARIA_SCRIBES[id];
    if (!info) return;
    setSelectedSidebarId(id);
    setSections(JSON.parse(JSON.stringify(getSections(info.template))));
    setActiveTab(info.template);
    autoScrollRef.current = info.status === "Error";
    setCurrentErrorIdx(0);
    setSubmitAttempted(info.status === "Error");
    setShowSyncModal(false);
    setExpandedSections(new Set());
    setShowAllUncaptured(false);
    setShowCitations(false);
    setCitationPopover(null);
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

  function renderRow(row: SectionRow) {
    // Radio — label small on top, value below. Click to open popover.
    if (row.kind === "radio") {
      const isMissing = submitAttempted && !!row.required && !row.selected;
      return (
        <div key={row.id} data-row-id={row.id} onClick={(e) => openFieldPopover(row.id, e)}
          className="rounded-[8px] hover:bg-[var(--surface-1,#f7f7f7)] cursor-pointer transition-colors"
          style={{ display: "flex", flexDirection: "column", padding: "6px 10px", gap: 2, ...(isMissing && { background: "rgba(187,20,17,0.05)", outline: "1px solid rgba(187,20,17,0.25)", borderRadius: 8 }) }}>
          <span style={{ fontSize: 11, color: "var(--foreground-secondary,#888)", fontFamily: "Lato, sans-serif", letterSpacing: "0.2px" }}>
            <span>{row.label}{row.required && <span style={{ color: "#e01010", fontWeight: 700, fontSize: 13, marginLeft: 2 }}>*</span>}</span>
          </span>
          <span style={{ fontSize: 13, color: isMissing ? "#bb1411" : (row.selected ? "var(--foreground-primary,#1a1a1a)" : "#ccc"), fontFamily: "Lato, sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
            {row.selected || (isMissing ? "Required — tap to fill" : "—")}
            {showCitations && row.selected && (() => {
              const cit = getCitation(activeTab, row.id);
              if (!cit || cit.type !== "transcript") return null;
              const label = String(cit.num);
              return <span onMouseEnter={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setCitationPopover({ source: cit, x: r.left, y: r.bottom + 6 }); }} onMouseLeave={() => setCitationPopover(null)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 5px", borderRadius: 4, background: "rgba(17,50,238,0.1)", color: "#1132ee", fontSize: 10, fontWeight: 700, cursor: "default", lineHeight: "18px", minWidth: 16 }}>{label}</span>;
            })()}
          </span>
        </div>
      );
    }

    // Checkbox — label on top, chips with × below for direct removal. Click + add to open popover.
    if (row.kind === "checkbox") {
      const checkedItems = row.items.filter(i => i.checked);
      const isMissing = submitAttempted && !!row.required && checkedItems.length === 0;
      return (
        <div key={row.id}
          style={{ display: "flex", flexDirection: "column", padding: "6px 10px", gap: 6, ...(isMissing && { background: "rgba(187,20,17,0.05)", outline: "1px solid rgba(187,20,17,0.25)", borderRadius: 8 }) }}>
          <span style={{ fontSize: 11, color: "var(--foreground-secondary,#888)", fontFamily: "Lato, sans-serif", letterSpacing: "0.2px" }}>
            {row.label}{row.required && <span style={{ color: "#e01010", fontWeight: 700, fontSize: 13, marginLeft: 2 }}>*</span>}
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
            {checkedItems.length > 0 ? checkedItems.map((item, idx) => {
              const cit = showCitations ? getCitation(activeTab, item.text) : null;
              const nextCit = showCitations ? getCitation(activeTab, checkedItems[idx + 1]?.text ?? "") : null;
              const showBadge = cit !== null && cit.type === "transcript" && !sameSource(cit, nextCit);
              const label = cit?.type === "transcript" ? String(cit.num) : "";
              return (
                <React.Fragment key={item.text}>
                  <span onClick={(e) => { e.stopPropagation(); removeCheck(row.id, item.text); }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--foreground-primary,#1a1a1a)", background: "#EEF1FD", borderRadius: 20, padding: "4px 10px", fontFamily: "Lato, sans-serif", cursor: "pointer" }}>
                    {item.text}
                    <span style={{ fontSize: 14, color: "#5567cc", lineHeight: 1, marginTop: -1 }}>×</span>
                  </span>
                  {showBadge && <span onMouseEnter={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setCitationPopover({ source: cit!, x: r.left, y: r.bottom + 6 }); }} onMouseLeave={() => setCitationPopover(null)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 5px", borderRadius: 4, background: "rgba(17,50,238,0.1)", color: "#1132ee", fontSize: 10, fontWeight: 700, cursor: "default", lineHeight: "18px", minWidth: 16 }}>{label}</span>}
                </React.Fragment>
              );
            }) : <span style={{ fontSize: 13, color: isMissing ? "#bb1411" : "#ccc", fontFamily: "Lato, sans-serif" }}>{isMissing ? "Required — tap to add" : "—"}</span>}
            <span onClick={(e) => openFieldPopover(row.id, e)}
              style={{ fontSize: 11, color: "var(--accent,#1132ee)", border: "0.5px solid var(--accent,#1132ee)", borderRadius: 20, padding: "4px 10px", fontFamily: "Lato, sans-serif", cursor: "pointer" }}>+ add</span>
          </div>
        </div>
      );
    }

    // Grid — label small on top, value below. Click to edit inline. Empty fields look like text inputs.
    if (row.kind === "grid") {
      const key = row.fields.map(f => f.label).join("|");
      return (
        <div key={"grid" + key} style={{ display: "flex", flexDirection: "column" }}>
          {row.fields.map((f, i) => {
            const isEditing = editingGridField?.key === key && editingGridField?.idx === i;
            const isEmpty = !f.value;
            const fieldMissing = submitAttempted && !!f.required && isEmpty;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", padding: "6px 10px", gap: 3, cursor: "text" }}
                onClick={() => setEditingGridField({ key, idx: i })}>
                <span style={{ fontSize: 11, color: "var(--foreground-secondary,#888)", fontFamily: "Lato, sans-serif", letterSpacing: "0.2px" }}>
                  <span>{f.label}{f.required && <span style={{ color: "#e01010", fontWeight: 700, fontSize: 13, marginLeft: 2 }}>*</span>}</span>
                </span>
                {isEditing ? (
                  row.cols === 1
                    ? <textarea autoFocus value={f.value}
                        onChange={e => updateGridField(key, i, e.target.value)}
                        onBlur={() => setEditingGridField(null)}
                        onClick={e => e.stopPropagation()}
                        rows={Math.max(2, f.value.split('\n').reduce((acc, line) => acc + Math.max(1, Math.ceil(line.length / 90)), 0))}
                        style={{ fontSize: 13, lineHeight: 1.55, color: "var(--foreground-primary,#1a1a1a)", fontFamily: "Lato, sans-serif", border: "1.5px solid #1132ee", borderRadius: 4, padding: "4px 8px", outline: "none", background: "transparent", width: "100%", boxSizing: "border-box", resize: "vertical" }}
                      />
                    : <input autoFocus value={f.value}
                        onChange={e => updateGridField(key, i, e.target.value)}
                        onBlur={() => setEditingGridField(null)}
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize: 13, color: "var(--foreground-primary,#1a1a1a)", fontFamily: "Lato, sans-serif", border: "1.5px solid #1132ee", borderRadius: 4, padding: "4px 8px", outline: "none", background: "transparent", width: "100%", boxSizing: "border-box", }}
                      />
                ) : isEmpty ? (
                  <span style={{ fontSize: 13, color: fieldMissing ? "#bb1411" : "#bbb", fontFamily: "Lato, sans-serif", background: fieldMissing ? "rgba(187,20,17,0.05)" : "var(--surface-1,#f7f7f7)", border: fieldMissing ? "1px solid rgba(187,20,17,0.25)" : "none", borderRadius: 4, padding: "4px 8px" }}>
                    {fieldMissing ? "Required — click to fill" : "Type here..."}
                  </span>
                ) : (
                  <span style={{ fontSize: 13, color: "var(--foreground-primary,#1a1a1a)", fontFamily: "Lato, sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                    {f.value}
                    {showCitations && !isEmpty && (() => {
                      const cit = getCitation(activeTab, f.label);
                      if (!cit || cit.type !== "transcript") return null;
                      const label = String(cit.num);
                      return <span onMouseEnter={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setCitationPopover({ source: cit, x: r.left, y: r.bottom + 6 }); }} onMouseLeave={() => setCitationPopover(null)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 5px", borderRadius: 4, background: "rgba(17,50,238,0.1)", color: "#1132ee", fontSize: 10, fontWeight: 700, cursor: "default", lineHeight: "18px", minWidth: 16 }}>{label}</span>;
                    })()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // Score — label small on top, score + risk below
    if (row.kind === "score") {
      return (
        <div key={"score" + row.items[0]?.label} style={{ display: "flex", flexDirection: "column" }}>
          {row.items.map((s, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", padding: "6px 10px", gap: 2 }}>
              <span style={{ fontSize: 11, color: "var(--foreground-secondary,#888)", fontFamily: "Lato, sans-serif", letterSpacing: "0.2px" }}>{s.label}</span>
              <span style={{ fontSize: 13, color: s.riskColor ?? "var(--foreground-primary,#1a1a1a)", fontFamily: "Lato, sans-serif" }}>
                {s.value} / {s.max}{s.risk ? ` — ${s.risk}` : ""}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // Narrative — click to edit inline (unchanged)
    if (row.kind === "narrative") {
      const isEditing = editingNarrativeId === row.id;
      return (
        <div key={row.id}>
          {isEditing ? (
            <textarea autoFocus value={row.text}
              onChange={e => updateNarrative(row.id, e.target.value)}
              onBlur={() => setEditingNarrativeId(null)}
              rows={Math.max(2, row.text.split('\n').reduce((acc, line) => acc + Math.max(1, Math.ceil(line.length / 90)), 0))}
              style={{ width: "100%", fontSize: 14, lineHeight: 1.55, color: "var(--foreground-primary,#1a1a1a)", fontFamily: "Lato, sans-serif", border: "1.5px solid #1132ee", borderRadius: 6, padding: 12, resize: "vertical", outline: "none", boxSizing: "border-box", }}
            />
          ) : (
            <p onClick={() => setEditingNarrativeId(row.id)}
              style={{ fontSize: 14, lineHeight: 1.55, color: "var(--foreground-primary,#1a1a1a)", margin: 0, whiteSpace: "pre-wrap", fontFamily: "Lato, sans-serif", cursor: "text", padding: "4px 0" }}>
              {row.text || <span style={{ color: "#bbb" }}>Click to add text…</span>}
            </p>
          )}
        </div>
      );
    }

    return null;
  }

  return (
    <>
    <div className="flex flex-1 overflow-hidden" style={{ fontFamily: "Lato, sans-serif" }}>

      {/* ── Sidebar ── */}
      <div className="shrink-0 flex flex-col bg-white relative overflow-hidden" style={{ width: 240, borderRight: "1px solid rgba(0,0,0,0.08)", height: "100vh" }}>
        <div className="flex items-center" style={{ padding: "0 12px", height: 56 }}>
          <span className="font-bold" style={{ fontSize: 17, letterSpacing: "0.34px", color: "var(--foreground-primary,#1a1a1a)" }}>My Scribes</span>
        </div>
        <div className="flex items-center justify-between" style={{ padding: "8px 12px" }}>
          <div className="flex items-center gap-[8px]">
            <button className="flex items-center gap-[4px] text-[13px] font-bold text-[var(--accent,#1132ee)]" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <Icon name="search" size={14} /> Search
            </button>
            <div style={{ position: "relative", display: "inline-flex" }}>
              <button
                ref={sidebarFilterBtnRef}
                onClick={handleSidebarFilterClick}
                className="flex items-center gap-[4px] text-[13px] font-bold text-[var(--accent,#1132ee)]"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <Icon name="filter_list" size={14} /> Filter
              </button>
              {hasSidebarActiveFilters && (
                <span style={{ position: "absolute", top: -2, right: -6, width: 6, height: 6, background: "#1132ee", borderRadius: "50%" }} />
              )}
            </div>
          </div>
          <button onClick={toggleAllPatients} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: "var(--accent,#1132ee)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "Lato, sans-serif" }}>
            <Icon name={sidebarPatients.every(p => collapsedPatients.has(p.patientId)) ? "unfold_more" : "unfold_less"} size={14} />
            {sidebarPatients.every(p => collapsedPatients.has(p.patientId)) ? "Expand All" : "Collapse All"}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 80 }}>
          {displaySidebarPatients.map((pg, i) => {
            const hasSelected = pg.scribes.some(s => selectedSidebarId === s.id);
            const isCollapsed = collapsedPatients.has(pg.patientId);
            return (
              <div key={pg.patientId} style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.06)" : "none", borderRight: hasSelected ? "3px solid var(--accent,#1132ee)" : "3px solid transparent" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "10px 12px 6px 16px" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground-primary,#1a1a1a)", letterSpacing: "0.14px" }}>{pg.name}</div>
                    <div style={{ fontSize: 12, color: "var(--foreground-secondary,#666)", marginTop: 1 }}>{pg.patientMeta}</div>
                  </div>
                  <button onClick={() => togglePatient(pg.patientId)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 0 0 4px", color: "var(--foreground-secondary,#666)", flexShrink: 0 }}>
                    <Icon name={isCollapsed ? "chevron_right" : "expand_more"} size={16} />
                  </button>
                </div>
                {!isCollapsed && (
                  <div style={{ marginBottom: 6 }}>
                    {pg.scribes.map(s => {
                      const cfg = SIDEBAR_STATUS_COLORS[s.status];
                      const isSel = selectedSidebarId === s.id;
                      const isClickable = pg.patientId === "p1";
                      return (
                        <div key={s.id}
                          onClick={isClickable ? () => switchScribe(s.id) : undefined}
                          style={{ padding: "8px 16px 8px 36px", cursor: isClickable ? "pointer" : "default", background: isSel ? "var(--litmus-25,#f1f3fe)" : "transparent" }}
                          className={isClickable ? "hover:bg-[var(--surface-1,#f7f7f7)]" : ""}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: isSel ? 700 : 400, color: "var(--foreground-primary,#1a1a1a)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {s.assessmentType}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color: cfg.color, whiteSpace: "nowrap", flexShrink: 0 }}>
                              <Icon name={cfg.icon} size={13} />
                              {s.status}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: "var(--foreground-tertiary,#808080)", marginTop: 2 }}>{s.time}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-0 bg-white" style={{ width: 240, padding: "8px 12px 24px", borderTop: "1px solid rgba(0,0,0,0.08)", boxSizing: "border-box" }}>
          <button className="flex items-center justify-center gap-[8px] font-bold rounded-[6px] w-full" style={{ height: 48, fontSize: 17, background: "white", border: "1px solid var(--foreground-primary,#1a1a1a)", color: "var(--foreground-primary,#1a1a1a)", cursor: "pointer", fontFamily: "Lato, sans-serif" }}>
            <MicIcon size={18} color="var(--foreground-primary,#1a1a1a)" /> Record New Scribe
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 80 }}>

          {/* Page-level required fields error — sticky so it stays visible while scrolling */}
          {submitAttempted && hasAnyRequiredEmpty() && (() => {
            const missing = getMissingRequiredFields();
            return (
              <div style={{ position: "sticky", top: 0, zIndex: 20, padding: "6px 24px", background: "white", display: "flex", justifyContent: "center" }}>
                <div onClick={() => { const m = getMissingRequiredFields(); if (m.length > 0) scrollToRow(m[Math.min(currentErrorIdx, m.length - 1)].id); }} style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #bb1411", borderRadius: 8, padding: "8px 12px", boxShadow: "0 4px 16px rgba(0,0,0,0.07)", width: "100%", maxWidth: 480, cursor: "pointer" }}>
                  <div style={{ flexShrink: 0, lineHeight: 1, color: "#bb1411" }}>
                    <Icon name="error" size={16} filled />
                  </div>
                  <div style={{ fontFamily: "Lato, sans-serif", flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 400, color: "#1a1a1a", lineHeight: 1.2, letterSpacing: "0.13px" }}>
                      Required fields missing
                    </div>
                  </div>
                  {missing.length === 1 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                      <button disabled style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, background: "none", border: "none", cursor: "default", color: "#ccc", borderRadius: 4 }}>
                        <Icon name="chevron_left" size={16} />
                      </button>
                      <span style={{ fontSize: 11, color: "#555", fontFamily: "Lato, sans-serif" }}>1</span>
                      <button onClick={(e) => { e.stopPropagation(); scrollToRow(missing[0].id); }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, background: "none", border: "none", cursor: "pointer", color: "#bb1411", borderRadius: 4 }}>
                        <Icon name="chevron_right" size={16} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                      <button onClick={(e) => { e.stopPropagation(); const p = (currentErrorIdx - 1 + missing.length) % missing.length; setCurrentErrorIdx(p); scrollToRow(missing[p].id); }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, background: "none", border: "none", cursor: "pointer", color: "#bb1411", borderRadius: 4 }}>
                        <Icon name="chevron_left" size={16} />
                      </button>
                      <span style={{ fontSize: 11, color: "#555", fontFamily: "Lato, sans-serif", whiteSpace: "nowrap" as const }}>{currentErrorIdx + 1} / {missing.length}</span>
                      <button onClick={(e) => { e.stopPropagation(); const n = (currentErrorIdx + 1) % missing.length; setCurrentErrorIdx(n); scrollToRow(missing[n].id); }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, background: "none", border: "none", cursor: "pointer", color: "#bb1411", borderRadius: 4 }}>
                        <Icon name="chevron_right" size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          <div style={{ maxWidth: 680, margin: "0 auto", paddingTop: 24, paddingLeft: 20, paddingRight: 20 }}>

            {/* Header */}
            <div style={{ padding: "0 8px", marginBottom: 4 }}>
              <div className="flex items-center justify-between">
                <h1 className="font-bold" style={{ fontSize: 24, margin: 0, color: "var(--foreground-primary,#1a1a1a)" }}>Maria Santos</h1>
                <button className="flex items-center gap-[4px] font-bold" style={{ fontSize: 13, color: "var(--foreground-secondary,#666)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", fontFamily: "Lato, sans-serif" }}>
                  <Icon name="more_horiz" size={16} /> Menu
                </button>
              </div>
              <div style={{ fontSize: 13, color: "var(--foreground-secondary,#666)", marginTop: 4, fontFamily: "Lato, sans-serif" }}>
                Hip Fracture · 72 · F · Bed 4B · Admitted Jun 22
              </div>
              <div style={{ fontSize: 12, color: "var(--foreground-tertiary,#808080)", marginTop: 3, fontFamily: "Lato, sans-serif" }}>
                Sarah Chen, RN · {MARIA_SCRIBES[selectedSidebarId]?.updated}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: "1px solid rgba(0,0,0,0.1)", display: "flex", gap: 8, padding: "0 8px" }}>
              {[MARIA_SCRIBES[selectedSidebarId]?.template ?? activeTab, "Transcripts"].map(tab => {
                const disabled = tab === "Transcripts" && !MARIA_SCRIBES[selectedSidebarId]?.hasTranscript;
                return (
                  <button key={tab} onClick={() => !disabled && setActiveTab(tab)} className="font-bold" style={{ fontSize: 13, padding: "6px 4px", background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid var(--accent,#1132ee)" : "2px solid transparent", color: activeTab === tab ? "var(--accent,#1132ee)" : "#808080", cursor: disabled ? "default" : "pointer", fontFamily: "Lato, sans-serif", marginBottom: -1 }}>
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Toggles */}
            <div style={{ display: "flex", gap: 4, padding: 8, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={() => setShowCitations(v => !v)} style={{ display: "flex", alignItems: "center", gap: 8, height: 28, padding: "0 8px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 6, fontSize: 13, fontWeight: 700, background: showCitations ? "var(--litmus-25,#f1f3fe)" : "white", cursor: "pointer", fontFamily: "Lato, sans-serif", color: showCitations ? "var(--accent,#1132ee)" : "var(--foreground-secondary,#666)" }}>
                <Icon name="lightbulb" size={16} /> Citation {showCitations ? "On" : "Off"}
              </button>
              <button
                onClick={() => setShowAllUncaptured(v => !v)}
                style={{ display: "flex", alignItems: "center", gap: 8, height: 28, padding: "0 8px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 6, fontSize: 13, fontWeight: 700, background: showAllUncaptured ? "var(--litmus-25,#f1f3fe)" : "white", cursor: "pointer", fontFamily: "Lato, sans-serif", color: showAllUncaptured ? "var(--accent,#1132ee)" : "var(--foreground-secondary,#666)" }}
              >
                <Icon name="checklist" size={16} /> Uncaptured Fields {showAllUncaptured ? "On" : "Off"}
              </button>
              <button style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--accent,#1132ee)", fontFamily: "Lato, sans-serif", padding: "0 4px" }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.66667 11.6667C1.20833 11.6667 0.815972 11.5035 0.489583 11.1771C0.163194 10.8507 0 10.4583 0 10V5C0 4.83333 0.0347222 4.67361 0.104167 4.52083C0.173611 4.36806 0.263889 4.23611 0.375 4.125L3 1.5C3.125 1.375 3.26389 1.28125 3.41667 1.21875C3.56944 1.15625 3.72222 1.125 3.875 1.125C4.23611 1.125 4.54861 1.26389 4.8125 1.54167C5.07639 1.81944 5.17361 2.17361 5.10417 2.60417L4.83333 4.16667H9.16667C9.40278 4.16667 9.60069 4.24653 9.76042 4.40625C9.92014 4.56597 10 4.76389 10 5V6.04167C10 6.125 9.99306 6.20486 9.97917 6.28125C9.96528 6.35764 9.94444 6.43056 9.91667 6.5L8.04167 10.9167C7.94444 11.1528 7.78819 11.3368 7.57292 11.4688C7.35764 11.6007 7.125 11.6667 6.875 11.6667H1.66667ZM6.625 10L8.33333 5.95833V5.83333H2.79167L3.29167 3.58333L1.66667 5.16667V10H6.625ZM10.8333 15.8333C10.5972 15.8333 10.3993 15.7535 10.2396 15.5938C10.0799 15.434 10 15.2361 10 15V13.9583C10 13.875 10.0069 13.7951 10.0208 13.7188C10.0347 13.6424 10.0556 13.5694 10.0833 13.5L11.9583 9.08333C12.0694 8.84722 12.2292 8.66319 12.4375 8.53125C12.6458 8.39931 12.875 8.33333 13.125 8.33333H18.3333C18.7917 8.33333 19.184 8.49653 19.5104 8.82292C19.8368 9.14931 20 9.54167 20 10V15C20 15.1667 19.9688 15.3229 19.9063 15.4688C19.8438 15.6146 19.75 15.75 19.625 15.875L17 18.5C16.875 18.625 16.7361 18.7188 16.5833 18.7813C16.4306 18.8438 16.2778 18.875 16.125 18.875C15.7639 18.875 15.4514 18.7361 15.1875 18.4583C14.9236 18.1806 14.8264 17.8264 14.8958 17.3958L15.1667 15.8333H10.8333ZM13.375 10L11.6667 14.0417V14.1667H17.2083L16.7083 16.4167L18.3333 14.8333V10H13.375Z" fill="currentColor"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Rate this Scribe</span>
              </button>
            </div>

            {/* Sections */}
            <div style={{ paddingTop: 16, paddingBottom: 40 }}>
              {sections.map((section) => {
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
                      <div style={{ display: "flex", alignItems: "center", padding: "16px 8px 6px", gap: 8 }}>
                        <span className="font-bold" style={{ fontSize: 13, letterSpacing: "0.13px", color: "var(--foreground-primary,#1a1a1a)", flex: 1 }}>{section.title}</span>
                      </div>
                      <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "0 8px" }} />
                      {isExpanded && section.subSections.map((sub, subi) => (
                        <div key={subi} style={{ padding: "0 8px" }}>
                          {sub.title && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: "var(--foreground-secondary,#888)", marginTop: 14, marginBottom: 10 }}>{sub.title}</div>}
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: sub.title ? 0 : 8, marginBottom: 4 }}>
                            {sub.rows.map((row, ri) => <div key={ri}>{renderRow(row)}</div>)}
                          </div>
                        </div>
                      ))}
                      <button onClick={toggleExpand} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 10px", margin: "4px 0 0", background: "var(--surface-1,#f7f7f7)", border: "none", cursor: "pointer", fontFamily: "Lato, sans-serif", width: "100%" }}>
                        <Icon name={isExpanded ? "expand_less" : "expand_more"} size={15} style={{ color: "#555" }} />
                        <span style={{ fontSize: 13, fontWeight: 400, color: "#555", letterSpacing: "0.065px" }}>
                          {isExpanded ? "Hide fields" : `${totalRows} fields not captured`}
                        </span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={section.id} data-section-id={section.id} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", padding: "16px 8px 6px", gap: 8 }}>
                      <span className="font-bold" style={{ fontSize: 13, letterSpacing: "0.13px", color: "var(--foreground-primary,#1a1a1a)", flex: 1 }}>{section.title}</span>
                      <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: "var(--accent,#1132ee)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", fontFamily: "Lato, sans-serif" }}>
                        <Icon name="content_copy" size={14} /> Copy
                      </button>
                    </div>
                    <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "0 8px 0" }} />

                    {section.subSections.map((sub, subi) => {
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
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: "var(--foreground-secondary,#888)", marginTop: 14, marginBottom: 10 }}>
                              {sub.title}
                            </div>
                          )}
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: sub.title ? 0 : 8, marginBottom: 4 }}>
                            {visibleRows.map((row, ri) => <div key={ri}>{renderRow(row)}</div>)}
                          </div>
                        </div>
                      );
                    })}

                    {uncapturedOptCount > 0 && !showAllUncaptured && (
                      <button onClick={toggleExpand} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", margin: "12px 0 0", background: "var(--surface-1,#f7f7f7)", border: "none", cursor: "pointer", fontFamily: "Lato, sans-serif", width: "100%" }}>
                        <Icon name={isExpanded ? "expand_less" : "expand_more"} size={15} style={{ color: "#555" }} />
                        <span style={{ fontSize: 13, fontWeight: 400, color: "#555", letterSpacing: "0.065px" }}>
                          {isExpanded ? "Hide optional fields" : `${uncapturedOptCount} optional field${uncapturedOptCount !== 1 ? "s" : ""} not filled in`}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        </div>

        {/* ── Section nav strip ── */}
        <div className="shrink-0 thin-scrollbar" style={{ background: "var(--surface-1,#f7f7f7)", borderTop: "1px solid rgba(0,0,0,0.08)", overflowX: "auto", whiteSpace: "nowrap", padding: "8px 20px 10px", display: "flex", alignItems: "center" }}
          onWheel={e => { e.currentTarget.scrollLeft += e.deltaY; }}>
          {sections.map((s, i) => {
            const isActive = activeSectionId === s.id;
            const isHovered = hoveredSectionId === s.id;
            const color = isActive ? "var(--accent,#1132ee)" : isHovered ? "var(--accent,#1132ee)" : "var(--foreground-secondary,#666)";
            const bg = isHovered && !isActive ? "rgba(17,50,238,0.07)" : "transparent";
            return (
              <span key={s.id} style={{ display: "inline-flex", alignItems: "center" }}>
                {i > 0 && <span style={{ color: "rgba(0,0,0,0.15)", margin: "0 8px", fontSize: 12 }}>|</span>}
                <button
                  onClick={() => scrollToSection(s.id)}
                  onMouseEnter={() => setHoveredSectionId(s.id)}
                  onMouseLeave={() => setHoveredSectionId("")}
                  style={{ background: bg, border: "none", cursor: "pointer", fontSize: 12, fontWeight: isActive ? 700 : 600, color, fontFamily: "Lato, sans-serif", whiteSpace: "nowrap", padding: "2px 6px", borderRadius: 4, borderBottom: isActive ? "1.5px solid var(--accent,#1132ee)" : "1.5px solid transparent", transition: "background 0.15s ease, color 0.15s ease" }}>
                  {s.title}
                </button>
              </span>
            );
          })}
        </div>

        {/* ── Bottom bar ── */}
        <div className="shrink-0 bg-white" style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 8px 24px" }}>
            {/* Left — AI Actions + Sync to EHR */}
            {(() => {
              const isEndOfShiftNarrative = MARIA_SCRIBES[selectedSidebarId]?.template === "End of Shift Narrative";
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button style={{ display: "flex", alignItems: "center", gap: 6, height: 44, padding: "0 16px", border: "1px solid var(--foreground-primary,#1a1a1a)", borderRadius: 6, fontSize: 15, fontWeight: 700, background: "white", cursor: "pointer", fontFamily: "Lato, sans-serif" }}>
                    <MagicEdit size={18} /> AI Actions
                  </button>
                  <div style={{ display: "flex" }}>
                    <button onClick={() => {
                      if (hasAnyRequiredEmpty()) { autoScrollRef.current = true; setCurrentErrorIdx(0); setSubmitAttempted(true); return; }
                      if (isEndOfShiftNarrative) { setShowSyncModal(true); return; }
                      setSubmitAttempted(false);
                    }} style={{ display: "flex", alignItems: "center", gap: 6, height: 44, padding: "0 20px", background: "var(--foreground-primary,#1a1a1a)", border: "none", borderRadius: "6px 0 0 6px", fontSize: 15, fontWeight: 700, color: "white", cursor: "pointer", fontFamily: "Lato, sans-serif" }}>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.41671 16.6663C4.15282 16.6663 3.07296 16.2288 2.17712 15.3538C1.28129 14.4788 0.833374 13.4094 0.833374 12.1455C0.833374 11.0622 1.15976 10.0969 1.81254 9.24967C2.46532 8.40245 3.31949 7.86079 4.37504 7.62467C4.72226 6.3469 5.41671 5.31217 6.45837 4.52051C7.50004 3.72884 8.6806 3.33301 10 3.33301C11.625 3.33301 13.0035 3.89898 14.1355 5.03092C15.2674 6.16287 15.8334 7.54134 15.8334 9.16634C16.7917 9.27745 17.5868 9.69065 18.2188 10.4059C18.8507 11.1212 19.1667 11.958 19.1667 12.9163C19.1667 13.958 18.8021 14.8434 18.073 15.5726C17.3438 16.3018 16.4584 16.6663 15.4167 16.6663H10.8334V10.708L11.5834 11.4372C11.7362 11.59 11.9271 11.6663 12.1563 11.6663C12.3855 11.6663 12.5834 11.583 12.75 11.4163C12.9028 11.2636 12.9792 11.0691 12.9792 10.833C12.9792 10.5969 12.9028 10.4025 12.75 10.2497L10.5834 8.08301C10.4167 7.91634 10.2223 7.83301 10 7.83301C9.77782 7.83301 9.58337 7.91634 9.41671 8.08301L7.25004 10.2497C7.09726 10.4025 7.0174 10.5934 7.01046 10.8226C7.00351 11.0518 7.08337 11.2497 7.25004 11.4163C7.40282 11.5691 7.59379 11.649 7.82296 11.6559C8.05212 11.6629 8.25004 11.59 8.41671 11.4372L9.16671 10.708V16.6663H5.41671Z" fill="white"/></svg>
                      EHR
                    </button>
                    <button style={{ height: 44, width: 36, background: "var(--foreground-primary,#1a1a1a)", border: "none", borderLeft: "1px solid rgba(255,255,255,0.2)", borderRadius: "0 6px 6px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="keyboard_arrow_up" size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              );
            })()}
            {/* Right — Assistant */}
            <button style={{ display: "flex", alignItems: "center", gap: 6, height: 44, padding: "0 16px", background: "none", border: "none", fontSize: 15, fontWeight: 700, color: "var(--accent,#1132ee)", cursor: "pointer", fontFamily: "Lato, sans-serif" }}>
              <MagicButton size={18} /> Assistant
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* ── Citation popover ── */}
      {citationPopover && (
        <div ref={citationPopoverRef} style={{ position: "fixed", top: citationPopover.y, left: Math.min(citationPopover.x, window.innerWidth - 320), zIndex: 1100, background: "white", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)", width: 300, padding: "16px 18px", fontFamily: "Lato, sans-serif" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#888", marginBottom: 10 }}>
            {citationPopover.source.type === "transcript" ? "Citation" : "Manually entered"}
          </div>
          {citationPopover.source.type === "transcript" ? (
            <>
              <p style={{ fontSize: 15, color: "#1a1a1a", lineHeight: 1.5, margin: "0 0 12px" }}>{citationPopover.source.quote}</p>
              <p style={{ fontSize: 13, color: "#aaa", margin: 0, cursor: "pointer" }}>Click to view in transcription</p>
            </>
          ) : (
            <p style={{ fontSize: 15, color: "#1a1a1a", lineHeight: 1.5, margin: 0 }}>{citationPopover.source.by} · {citationPopover.source.time}</p>
          )}
        </div>
      )}

      {/* ── Sidebar filter panel ── */}
      {sidebarFilterOpen && (
        <div ref={sidebarFilterPanelRef} style={{ position: "fixed", top: sidebarFilterPos.top, left: sidebarFilterPos.left, zIndex: 1000, background: "white", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)", width: 256, maxHeight: 480, overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "Lato, sans-serif" }}>
          <div style={{ overflowY: "auto", padding: "14px 14px 4px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground-primary,#1a1a1a)", marginBottom: 10 }}>All Filters</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--foreground-secondary,#666)", marginBottom: 4, letterSpacing: "0.2px" }}>Filter by date range</div>
              {SIDEBAR_DATE_RANGE_OPTIONS.map(opt => (
                <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", cursor: "pointer" }}>
                  <input type="radio" name="sidebarFilterDateRange" value={opt.value} checked={draftSidebarDateRange === opt.value} onChange={() => setDraftSidebarDateRange(opt.value)} style={{ accentColor: "#1132ee", width: 14, height: 14, cursor: "pointer", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--foreground-primary,#1a1a1a)" }}>{opt.label}</span>
                </label>
              ))}
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--foreground-secondary,#666)", marginBottom: 4, letterSpacing: "0.2px" }}>Sort by</div>
              {SIDEBAR_SORT_OPTIONS.map(opt => (
                <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", cursor: "pointer" }}>
                  <input type="radio" name="sidebarFilterSortBy" value={opt.value} checked={draftSidebarSortBy === opt.value} onChange={() => setDraftSidebarSortBy(opt.value)} style={{ accentColor: "#1132ee", width: 14, height: 14, cursor: "pointer", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--foreground-primary,#1a1a1a)" }}>{opt.label}</span>
                </label>
              ))}
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--foreground-secondary,#666)", marginBottom: 4, letterSpacing: "0.2px" }}>Filter by status</div>
              {SIDEBAR_ALL_STATUSES.map(status => (
                <label key={status} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", cursor: "pointer" }}>
                  <input type="checkbox" checked={draftSidebarStatuses.has(status)} onChange={() => toggleDraftSidebarStatus(status)} style={{ accentColor: "#1132ee", width: 14, height: 14, cursor: "pointer", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--foreground-primary,#1a1a1a)" }}>{status}</span>
                </label>
              ))}
            </div>
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--foreground-secondary,#666)", marginBottom: 4, letterSpacing: "0.2px" }}>Filter by note type</div>
              {SIDEBAR_ALL_NOTE_TYPES.map(noteType => (
                <label key={noteType} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", cursor: "pointer" }}>
                  <input type="checkbox" checked={draftSidebarNoteTypes.has(noteType)} onChange={() => toggleDraftSidebarNoteType(noteType)} style={{ accentColor: "#1132ee", width: 14, height: 14, cursor: "pointer", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--foreground-primary,#1a1a1a)" }}>{noteType}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px 14px", borderTop: "1px solid rgba(0,0,0,0.08)", background: "white", flexShrink: 0 }}>
            <button onClick={resetSidebarFilter} style={{ fontSize: 13, fontWeight: 700, color: "#1132ee", background: "none", border: "none", cursor: "pointer", fontFamily: "Lato, sans-serif", padding: 0 }}>Reset All</button>
            <button onClick={applySidebarFilter} style={{ fontSize: 13, fontWeight: 700, color: "white", background: "#1a1a1a", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "Lato, sans-serif", padding: "7px 20px" }}>Apply</button>
          </div>
        </div>
      )}

      {/* ── Sync confirmation modal (End of Shift Narrative) ── */}
      {showSyncModal && (
        <>
          <div onClick={() => setShowSyncModal(false)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.35)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 201, background: "white", borderRadius: 12, padding: "28px 24px 24px", width: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", fontFamily: "Lato, sans-serif" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--foreground-primary,#1a1a1a)", letterSpacing: "0.17px", marginBottom: 8 }}>
              Sign & Sync to EHR
            </div>
            <div style={{ fontSize: 14, color: "var(--foreground-secondary,#666)", lineHeight: 1.5, marginBottom: 24 }}>
              By signing, you confirm this end of shift narrative is accurate and complete. This will sync it to the patient's medical record.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowSyncModal(false)} style={{ height: 38, padding: "0 18px", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "white", color: "var(--foreground-primary,#1a1a1a)", cursor: "pointer", fontFamily: "Lato, sans-serif" }}>
                Cancel
              </button>
              <button onClick={() => { setShowSyncModal(false); setSubmitAttempted(false); }} style={{ height: 38, padding: "0 18px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "var(--foreground-primary,#1a1a1a)", color: "white", cursor: "pointer", fontFamily: "Lato, sans-serif" }}>
                Sign & Sync
              </button>
            </div>
          </div>
        </>
      )}

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
                <div style={{ padding: "11px 14px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <span style={{ fontSize: 11, color: "var(--foreground-secondary,#666)", letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "Lato, sans-serif" }}>{row.label}</span>
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
                      <span style={{ fontSize: 13, color: "var(--foreground-primary,#1a1a1a)", fontFamily: "Lato, sans-serif" }}>{sel}</span>
                    </button>
                  )}
                  <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "5px 8px" }} />
                  {others.map(opt => (
                    <button key={opt} onClick={() => { setRadio(row.id, opt); setPopover(null); }}
                      onMouseEnter={() => setHoveredPopoverOption(opt)}
                      onMouseLeave={() => setHoveredPopoverOption(null)}
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", background: hoveredPopoverOption === opt ? "var(--surface-1,#f7f7f7)" : "none", border: "none", borderRadius: 7, cursor: "pointer", fontFamily: "Lato, sans-serif", textAlign: "left" }}>
                      <div style={{ width: 13, height: 13, borderRadius: "50%", border: "1.5px solid rgba(0,0,0,0.2)", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "var(--foreground-primary,#1a1a1a)", fontFamily: "Lato, sans-serif" }}>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          );
        }

        if (row.kind === "checkbox") {
          const checked = row.items.filter(i => i.checked);
          const unchecked = row.items.filter(i => !i.checked);
          const q = popover.searchQuery.toLowerCase();
          const fChecked = q ? checked.filter(i => i.text.toLowerCase().includes(q)) : checked;
          const fUnchecked = q ? unchecked.filter(i => i.text.toLowerCase().includes(q)) : unchecked;
          const showSearch = row.items.length > 8;
          const pw = 288;
          const left = Math.max(8, Math.min(rect.left, window.innerWidth - pw - 8));
          const estH = 44 + (showSearch ? 48 : 0) + 260;
          const flipUp = rect.bottom + 4 + estH > window.innerHeight - 8;
          const vPos = flipUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 };
          return (
            <>
              <div onClick={() => setPopover(null)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
              <div style={{ position: "fixed", ...vPos, left, width: pw, zIndex: 100, background: "white", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <div style={{ padding: "11px 14px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--foreground-secondary,#666)", letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "Lato, sans-serif" }}>{row.label}</span>
                  <button onClick={() => setPopover(null)} style={{ fontSize: 12, color: "var(--accent,#1132ee)", background: "none", border: "none", cursor: "pointer", fontFamily: "Lato, sans-serif", fontWeight: 700 }}>Done</button>
                </div>
                {showSearch && (
                  <div style={{ padding: "8px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <input value={popover.searchQuery}
                      onChange={e => setPopover(prev => prev ? { ...prev, searchQuery: e.target.value } : null)}
                      placeholder="Search..."
                      style={{ width: "100%", fontSize: 13, border: "none", outline: "none", background: "transparent", fontFamily: "Lato, sans-serif", color: "var(--foreground-primary,#1a1a1a)" }}
                    />
                  </div>
                )}
                <div style={{ padding: "5px 5px 7px", maxHeight: 240, overflowY: "auto" }}>
                  {fChecked.length > 0 && !q && (
                    <div style={{ fontSize: 10, color: "var(--foreground-secondary,#666)", letterSpacing: "0.5px", textTransform: "uppercase", padding: "4px 12px 3px", fontFamily: "Lato, sans-serif" }}>Selected</div>
                  )}
                  {fChecked.map(item => (
                    <button key={item.text} onClick={() => toggleCheck(row.id, item.text)}
                      onMouseEnter={() => setHoveredPopoverOption(item.text)}
                      onMouseLeave={() => setHoveredPopoverOption(null)}
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", background: hoveredPopoverOption === item.text ? "#e4e8fc" : "#EEF1FD", border: "none", borderRadius: 7, cursor: "pointer", marginBottom: 1, fontFamily: "Lato, sans-serif", textAlign: "left" }}>
                      <div style={{ width: 13, height: 13, borderRadius: 3, background: "#1132ee", border: "1.5px solid #1132ee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon name="check" size={9} className="text-white" />
                      </div>
                      <span style={{ fontSize: 13, color: "var(--foreground-primary,#1a1a1a)", fontFamily: "Lato, sans-serif" }}>{item.text}</span>
                    </button>
                  ))}
                  {fChecked.length > 0 && fUnchecked.length > 0 && !q && (
                    <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "5px 8px" }} />
                  )}
                  {fUnchecked.map(item => (
                    <button key={item.text} onClick={() => toggleCheck(row.id, item.text)}
                      onMouseEnter={() => setHoveredPopoverOption(item.text)}
                      onMouseLeave={() => setHoveredPopoverOption(null)}
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", background: hoveredPopoverOption === item.text ? "var(--surface-1,#f7f7f7)" : "none", border: "none", borderRadius: 7, cursor: "pointer", marginBottom: 1, fontFamily: "Lato, sans-serif", textAlign: "left" }}>
                      <div style={{ width: 13, height: 13, borderRadius: 3, border: "1.5px solid rgba(0,0,0,0.2)", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "var(--foreground-primary,#1a1a1a)", fontFamily: "Lato, sans-serif" }}>{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          );
        }

        return null;
      })()}

      {/* ── Undo toast ── */}
      {undoState && (
        <div style={{ position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", color: "white", padding: "10px 16px", borderRadius: 8, display: "flex", alignItems: "center", gap: 12, zIndex: 200, fontFamily: "Lato, sans-serif", fontSize: 13, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", whiteSpace: "nowrap" }}>
          <span>Item removed</span>
          <button onClick={handleUndo} style={{ fontSize: 13, fontWeight: 700, color: "#7a8fff", background: "none", border: "none", cursor: "pointer", fontFamily: "Lato, sans-serif", padding: 0 }}>Undo</button>
        </div>
      )}
    </>
  );
}
