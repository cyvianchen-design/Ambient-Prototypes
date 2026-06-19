import React, { useState } from "react";
import {
  PrimaryNav,
  Tabs,
  SecondaryNavItem,
  Button,
  IconButton,
  Icon,
  MagicButton,
  Dictation,
  Learn,
} from "@ds/ui";
import { CommureLogo } from "../components/CommureLogo";

const todayPatients = [
  { id: "1", name: "James Vetrovs",   chiefComplaint: "Headache",   age: 72, gender: "M" as const, status: "Generated" as const, duration: "355" },
  { id: "2", name: "John Doe",        chiefComplaint: "Chest Pain", age: 42, gender: "M" as const, status: "Generated" as const, duration: "936" },
  { id: "3", name: "Richard Seymore", chiefComplaint: "Back Pain",  age: 55, gender: "M" as const, status: "Generated" as const, duration: "482" },
  { id: "4", name: "Danny Rivers",    chiefComplaint: "Fatigue",    age: 61, gender: "M" as const, status: "Generated" as const, duration: "271" },
  { id: "5", name: "Ashley Garcia",   chiefComplaint: "Knee pain",  age: 48, gender: "M" as const, status: "Generated" as const, duration: "318" },
];

const yesterdayPatients = [
  { id: "6", name: "James Vetrovs", chiefComplaint: "Headache",   age: 72, gender: "M" as const, status: "Generated" as const, duration: "355" },
  { id: "7", name: "Terry Philips", chiefComplaint: "Chest Pain", age: 58, gender: "M" as const, status: "Generated" as const, duration: "609" },
];

const tabs = [
  { id: "clinical",  label: "Clinical Note" },
  { id: "avs",       label: "After Visit Summary" },
  { id: "icd",       label: "ICD10/CPT Codes" },
  { id: "rx",        label: "Prescription" },
  { id: "labs",      label: "Lab Order" },
  { id: "referral",  label: "Referral Response" },
];

const sections = [
  {
    id: "hpi",
    title: "HPI",
    content: "33-year old male presenting with back pain for the past few weeks. He reports sharp pain that worsens with deep breaths and is generalized across the lower back on the left side. The pain was described as 8/10.",
  },
  {
    id: "ros",
    title: "ROS",
    content: `Cardiovascular: Patient reports swollen leg, chest pain.
Respiratory: Patient reports shortness of breath.
Constitutional: Denies fever, chills, fatigue.
ENT: Denies nose bleeds, congestion, throat pain.
Respiratory: Denies shortness of breath, cough.
GI: Denies nausea, vomiting, diarrhea or abdominal pain.
GU: Denies dysuria, hematuria, flank pain, pelvic pain.
Neurologic: Denies numbness, tingling, weakness, headache, speech changes or lightheadedness.
Skin: Denies rash, bruising, skin lesions.
Musculoskeletal: Denies extremity pain, neck pain, back pain.`,
  },
  {
    id: "pe",
    title: "PE",
    content: `General: No acute distress, nontoxic.
Head: Atraumatic, normocephalic.
Eyes: EOMI, PERRLA.
Neck: Supple, atraumatic, no meningeal signs.
ENT: No stridor, posterior oropharynx clear, airway patent.
Heart: Regular rate and rhythm, no murmurs, distal pulses equal throughout.
Respiratory: Clear to auscultation bilaterally, no wheezes, rales or rhonchi.
Abdomen: Soft, nontender nondistended. No guarding or rebound.
Skin: No lesions, abrasions or ecchymosis. Skin is warm.
Musculoskeletal: Noted strain and sprain on the left side with tension around the L4.
Neurological: No focal neurological deficits. Normal speech.
Psychiatric: Normal mood and affect.`,
  },
  {
    id: "mdm",
    title: "MDM",
    content: `Back pain
Ordered X-ray, complete metabolic panel, and CBC to evaluate heart, kidney, liver function, and look for signs of infection and anemia. Over the counter ibuprofen for pain management.`,
  },
];

function NoteSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="flex flex-col gap-[4px] w-full">
      {/* Section header */}
      <div className="flex gap-[4px] items-center pl-[8px] w-full">
        <span
          className="flex-1 min-w-0 text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)]"
          style={{ fontFeatureSettings: "'ss07' 1" }}
        >
          {title}
        </span>
        <IconButton variant="tertiary-neutral" size="small" aria-label="Edit" icon={<Icon name="edit" size={16} />} />
        <IconButton variant="tertiary-neutral" size="small" aria-label="Dictate" icon={<Dictation size={16} />} />
        <IconButton variant="tertiary-neutral" size="small" aria-label="Learn" icon={<Learn size={16} />} />
        <IconButton variant="tertiary-neutral" size="small" aria-label="Add note" icon={<Icon name="docs_add_on" size={16} />} />
        <Button variant="tertiary" size="small" prefix={<Icon name="content_copy" size={16} />}>
          Copy
        </Button>
      </div>
      {/* Content */}
      <div className="p-[8px] rounded-[6px] w-full">
        <p className="text-[15px] font-normal leading-[1.4] tracking-[0.15px] text-[#111827] whitespace-pre-wrap w-full">
          {content}
        </p>
      </div>
    </div>
  );
}

type Props = {
  onNavClick?: (id: string) => void;
};

export default function R1Baseline({ onNavClick }: Props) {
  const [selectedPatient, setSelectedPatient] = useState("2");
  const [activeTab, setActiveTab] = useState("clinical");

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* Primary Nav */}
      <PrimaryNav activeItem="scribes" onItemClick={onNavClick} logo={<CommureLogo size={28} />} />

      {/* Secondary nav */}
      <div className="flex flex-col w-[240px] border-r border-[var(--shape-outline,rgba(0,0,0,0.1))] shrink-0 bg-white relative">
        {/* Header */}
        <div className="flex items-center h-[48px] px-[12px] shrink-0">
          <div className="flex items-center h-[28px] px-[4px] rounded-[6px]">
            <h2
              className="text-[15px] font-bold leading-[1.2] tracking-[0.15px] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap"
              style={{ fontFeatureSettings: "'ss07' 1" }}
            >
              My Scribes
            </h2>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-[8px] pb-[4px] pl-[8px] shrink-0">
          <div className="flex gap-[4px] items-center">
            <Button variant="tertiary" size="small" prefix={<Icon name="search" size={16} />}>
              Search
            </Button>
            <Button variant="tertiary" size="small" prefix={<Icon name="filter_list" size={16} />}>
              Filter
            </Button>
          </div>
          <Button
            variant="tertiary-neutral"
            size="small"
            prefix={<Icon name="calendar_month" size={16} />}
          >
            Thu, Dec 19 (Today)
          </Button>
        </div>

        {/* Patient list */}
        <div className="flex-1 overflow-y-auto scrollable">
          {todayPatients.map((p) => (
            <SecondaryNavItem
              key={p.id}
              {...p}
              isSelected={selectedPatient === p.id}
              onClick={() => setSelectedPatient(p.id)}
            />
          ))}
          <div className="px-[12px] py-[8px]">
            <span
              className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-secondary,#666)]"
              style={{ fontFeatureSettings: "'ss07' 1" }}
            >
              Wed, Dec 18th
            </span>
          </div>
          {yesterdayPatients.map((p) => (
            <SecondaryNavItem
              key={p.id}
              {...p}
              isSelected={selectedPatient === p.id}
              onClick={() => setSelectedPatient(p.id)}
            />
          ))}
        </div>

        {/* Record New Scribe CTA */}
        <div className="p-[12px] shrink-0">
          <Button
            variant="primary"
            size="medium"
            prefix={<Icon name="mic" size={16} filled />}
            className="w-full whitespace-nowrap"
          >
            Record New Scribe
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 items-center overflow-hidden">

        {/* Patient header */}
        <div className="flex flex-col gap-[4px] max-w-[640px] w-full px-[8px] pt-[24px] pb-[12px] shrink-0">
          <div className="flex gap-[8px] items-center w-full">
            <div className="flex flex-1 items-center h-[48px] px-[8px] py-[12px] rounded-[6px]">
              <h1 className="text-[24px] font-bold leading-[1.2] tracking-[0px] text-[var(--foreground-primary,#1a1a1a)]">
                John Doe
              </h1>
            </div>
            <Button
              variant="tertiary"
              size="small"
              prefix={<Icon name="more_horiz" size={16} />}
            >
              Menu
            </Button>
          </div>
          <p className="px-[8px] text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-secondary,#666)]">
            Chest Pain · Age 42 · Sex M · Room 389 · 15m 36s
          </p>
        </div>

        {/* Tabs */}
        <div className="max-w-[640px] w-full px-[8px] shrink-0">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollable w-full flex flex-col items-center">

          {/* Toggle button group */}
          <div className="flex gap-[4px] items-center max-w-[640px] w-full p-[8px] shrink-0">
            <button className="flex gap-[8px] h-[28px] items-center justify-center px-[8px] rounded-[6px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-secondary,#666)]" style={{ fontFeatureSettings: "'ss07' 1" }}>
              <Icon name="format_ink_highlighter" size={16} />
              Highlight Off
            </button>
            <button className="flex gap-[8px] h-[28px] items-center justify-center px-[8px] rounded-[6px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-secondary,#666)]" style={{ fontFeatureSettings: "'ss07' 1" }}>
              <Icon name="lightbulb" size={16} />
              Citation Off
            </button>
            <button className="flex gap-[8px] h-[28px] items-center justify-center px-[8px] rounded-[6px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-secondary,#666)]" style={{ fontFeatureSettings: "'ss07' 1" }}>
              <Icon name="compare" size={16} />
              Compare View Off
            </button>
          </div>

          {/* Clinical note content */}
          <div className="max-w-[640px] w-full px-[8px] py-[24px] flex flex-col gap-[24px]">

            {/* Note heading */}
            <div className="flex items-center px-[8px]">
              <h2 className="flex-1 min-w-0 text-[17px] font-bold leading-[1.2] tracking-[0.34px] text-[var(--foreground-primary,#1a1a1a)]">
                Clinical Note
              </h2>
            </div>

            {sections.map((s) => (
              <NoteSection key={s.id} title={s.title} content={s.content} />
            ))}

            {/* Rate this Scribe */}
            <div className="flex items-center justify-end px-[12px]">
              <Button
                variant="tertiary"
                size="small"
                prefix={<Icon name="star" size={16} />}
              >
                Rate this Scribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between max-w-[640px] w-full px-[8px] pt-[8px] pb-[24px] shrink-0">
          <div className="flex gap-[8px] items-center">
            {/* AI Actions */}
            <Button
              variant="secondary"
              size="medium"
              prefix={<MagicButton size={16} />}
            >
              AI Actions
            </Button>
            {/* EHR split button */}
            <div className="flex items-center">
              <Button
                variant="primary"
                size="medium"
                prefix={<Icon name="cloud_upload" size={16} filled />}
                className="rounded-r-none"
              >
                EHR
              </Button>
              <button className="flex items-center justify-center h-[36px] w-[28px] bg-[var(--foreground-primary,#1a1a1a)] rounded-l-none rounded-r-[6px] border-l border-white/20 hover:bg-[var(--neutral-800,#333)] transition-colors">
                <Icon name="keyboard_arrow_up" size={20} className="text-white" />
              </button>
            </div>
          </div>
          <Button
            variant="tertiary"
            size="medium"
            prefix={<MagicButton size={16} />}
          >
            Assistant
          </Button>
        </div>

      </div>
    </div>
  );
}
