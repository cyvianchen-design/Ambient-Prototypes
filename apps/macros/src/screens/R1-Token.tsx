import React, { useState } from "react";
import { Button, TextArea } from "@ds/ui";
import { CustomizeLayout } from "../components/CustomizeLayout";
import { SectionCard } from "../components/SectionCard";

const subjectiveMacros = [
  { id: "s1", name: "Complete Health Screening", enabled: true,
    content: "Annual wellness exam. Chief complaint: [chief complaint]. Vitals: BP [blood pressure] mmHg, HR [heart rate] BPM. Physical exam: [physical exam findings]. Assessment: [assessment and plan].",
    selectionCriteria: "Use for annual wellness exams in adult patients presenting for routine health screening." },
  { id: "s2",  name: "Teenage Wellness Check",     enabled: true },
  { id: "s3",  name: "General Physical Exam",      enabled: true },
  { id: "s4",  name: "Infant Wellness Checkup",    enabled: true },
  { id: "s5",  name: "Youth Health Assessment",    enabled: true },
  { id: "s6",  name: "Hearing and Vision Test",    enabled: true },
  { id: "s7",  name: "Immunization Status Check",  enabled: false },
  { id: "s8",  name: "Cognitive Skills Evaluation",enabled: false },
  { id: "s9",  name: "Height and Weight Check",    enabled: true },
  { id: "s10", name: "Pre-K Assessment",           enabled: true },
];

const objectiveMacros = [
  { id: "o1", name: "Vital Signs Template", enabled: true,
    content: "BP: [blood pressure] mmHg · HR: [heart rate] BPM · Temp: [temperature]°F · SpO2: [oxygen saturation]% · Weight: [weight] lbs.",
    selectionCriteria: "Use for all visits requiring vital signs documentation." },
  { id: "o2",  name: "Physical Exam Normal",       enabled: true },
  { id: "o3",  name: "Cardiovascular Exam",        enabled: true },
  { id: "o4",  name: "Respiratory Exam",           enabled: true },
  { id: "o5",  name: "Abdominal Exam",             enabled: false },
  { id: "o6",  name: "Neurological Exam",          enabled: true },
  { id: "o7",  name: "Musculoskeletal Exam",       enabled: false },
  { id: "o8",  name: "Skin Assessment",            enabled: true },
  { id: "o9",  name: "HEENT Exam",                 enabled: true },
  { id: "o10", name: "Lab Results Review",         enabled: false },
];

const assessmentMacros = [
  { id: "a1", name: "Hypertension Management", enabled: true,
    content: "Patient with [diagnosis]. Current BP: [blood pressure]. Medications: [current medications]. Lifestyle modifications discussed. Plan: [management plan]. Follow-up in [follow-up timeframe].",
    selectionCriteria: "Use for patients with hypertension requiring medication management or lifestyle counseling." },
  { id: "a2",  name: "Diabetes Follow-up",        enabled: true },
  { id: "a3",  name: "Preventive Care Plan",      enabled: true },
  { id: "a4",  name: "Medication Reconciliation", enabled: true },
  { id: "a5",  name: "Referral Template",         enabled: false },
  { id: "a6",  name: "Follow-up Instructions",    enabled: true },
  { id: "a7",  name: "Patient Education Points",  enabled: false },
  { id: "a8",  name: "Chronic Disease Monitoring",enabled: true },
  { id: "a9",  name: "Discharge Summary",         enabled: false },
  { id: "a10", name: "Post-Procedure Care",       enabled: true },
];

const suggestedRules = ["Standard Medical Terminology", "Avoid Medical Jargon", "Include CPT Codes", "Metric Units"];

export default function R1Token() {
  const [customRules, setCustomRules] = useState("");
  return (
    <CustomizeLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-[24px] px-[20px] py-[24px]">
          <div className="w-full max-w-[600px] shrink-0">
            <h1 className="t-title-xl text-[var(--foreground-primary)]" style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07'" }}>
              SOAP Note
            </h1>
          </div>
          <div className="w-full max-w-[600px] flex flex-col gap-[16px] shrink-0">
            <h2 className="t-title-lg text-[var(--foreground-primary)]" style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07'" }}>
              Section Rules
            </h2>
            <SectionCard title="Subjective" format="Bullet by Diagnosis" length="Standard" macros={subjectiveMacros} totalMacros={30} learnExamples={10} />
            <SectionCard title="Objective" format="Narrative Paragraph" length="Concise" macros={objectiveMacros} totalMacros={24} learnExamples={8} />
            <SectionCard title="Assessment & Plan" format="Bullet by Diagnosis" length="Detailed" macros={assessmentMacros} totalMacros={18} learnExamples={12} />
          </div>
          <div className="w-full max-w-[600px] h-px bg-[rgba(0,0,0,0.1)] shrink-0" />
          <div className="w-full max-w-[600px] flex flex-col gap-[16px] shrink-0 pb-[8px]">
            <div className="flex items-center justify-between">
              <h2 className="t-title-lg text-[var(--foreground-primary)]" style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07'" }}>Overall Rules</h2>
              <button className="t-body-sm text-[var(--accent)] hover:opacity-80 transition-opacity" style={{ fontFamily: "Lato, sans-serif" }}>Apply to all sections</button>
            </div>
            <div className="flex flex-wrap gap-[8px]">
              {suggestedRules.map((rule) => <Button key={rule} variant="secondary" size="small">{rule}</Button>)}
            </div>
            <TextArea value={customRules} onChange={setCustomRules} placeholder="Enter custom formatting rules…" rows={5} />
            <p className="t-body-xs text-[var(--foreground-secondary)]" style={{ fontFamily: "Lato, sans-serif" }}>
              You can enter custom formatting rules as if you're giving instructions to a human scribe. New rules will only apply to future scribes.
            </p>
          </div>
        </div>
      </div>
      <div className="shrink-0 border-t border-[rgba(0,0,0,0.1)] bg-white px-[20px] py-[16px] flex justify-center">
        <div className="w-full max-w-[640px] flex items-center justify-end gap-[8px]">
          <Button variant="tertiary-neutral" size="medium">Cancel</Button>
          <Button variant="primary" size="medium">Save changes</Button>
        </div>
      </div>
    </CustomizeLayout>
  );
}
