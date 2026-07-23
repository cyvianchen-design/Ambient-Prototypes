export type SubsectionStatus = "standard" | "optional" | "disabled";

export type MacroItem = { id: string; name: string; enabled: boolean };

export type GenerateWhen = "hide" | "show";

export type Subsection = {
  id: string;
  name: string;
  showTitle: boolean;
  status: SubsectionStatus;
  generateWhen?: GenerateWhen;
  emptyState?: string;
  templateInstruction: string;
  format: string;
  length: string;
  customFormatting: string;
  macroCount: number;
};

export type TemplateSection = {
  id: string;
  name: string;
  subsections: Subsection[];
};

const MACRO_NAMES = [
  "Complete Health Screening", "Teenage Wellness Check", "General Physical Exam",
  "Infant Wellness Checkup", "Youth Health Assessment", "Hearing and Vision Test",
  "Immunization Status Check", "Cognitive Skills Evaluation", "Height and Weight Check",
  "Pre-K Assessment", "Vital Signs Template", "Physical Exam Normal",
  "Cardiovascular Exam", "Respiratory Exam", "Abdominal Exam",
  "Neurological Exam", "Musculoskeletal Exam", "Skin Assessment",
  "HEENT Exam", "Lab Results Review",
];

export function makeMacros(count: number, offset = 0): MacroItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `m-${offset + i}`,
    name: MACRO_NAMES[(offset + i) % MACRO_NAMES.length],
    enabled: i % 3 !== 2,
  }));
}

export type FormatOption = { value: string; label: string; description: string; icon: string };

export const FORMAT_OPTIONS: FormatOption[] = [
  { value: "Auto", label: "Auto format", description: "AI formats based on your template settings.", icon: "format_paint" },
  { value: "Paragraph", label: "Paragraph", description: "Narrative style with full sentences.", icon: "subject" },
  { value: "Bullets", label: "Bullets", description: "List findings in a running bullet list.", icon: "format_list_bulleted" },
  { value: "Numbered", label: "Numbered", description: "List findings in a numbered list.", icon: "format_list_numbered" },
];

export function formatDescription(value: string): string {
  return FORMAT_OPTIONS.find((o) => o.value === value)?.description ?? "";
}

export function newSubsection(): Subsection {
  return {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "New subsection",
    showTitle: true,
    status: "standard",
    templateInstruction: "",
    format: "Auto",
    length: "Standard",
    customFormatting: "",
    macroCount: 0,
  };
}

export const LENGTH_OPTIONS = ["Concise", "Standard", "Detailed"];

export const INITIAL_SECTIONS: TemplateSection[] = [
  {
    id: "hpi",
    name: "HPI",
    subsections: [
      {
        id: "summary",
        name: "Summary",
        showTitle: false,
        status: "standard",
        templateInstruction: `Chief complaint as reported by patient or EMS. Subjective/historical info only — no assessment, reasoning, provider education, or PE findings. EMS handoff vitals and medications included. Chronological order. Maintain subjective framing ("reports," "believes," "thinks"). End with pertinent denials.`,
        format: "Bullets",
        length: "Standard",
        customFormatting: `Open with: "The patient is a [age] year-old [gender] [with a history of [PMH]] presenting to the ED for [reason]." If no PMH, omit bracketed clause. Chief complaint must be symptoms/concern, not a diagnosis. End with "Denies [symptom list]."`,
        macroCount: 0,
      },
      {
        id: "pmh",
        name: "PMH",
        showTitle: true,
        status: "standard",
        templateInstruction: `Patient's explicitly stated past medical history. Diagnoses only. Do not infer from medications or context.`,
        format: "Bullets",
        length: "Standard",
        customFormatting: "",
        macroCount: 1,
      },
      {
        id: "surgical-history",
        name: "Surgical History",
        showTitle: true,
        status: "disabled",
        templateInstruction: "",
        format: "Bullets",
        length: "Concise",
        customFormatting: "",
        macroCount: 0,
      },
      {
        id: "social-history",
        name: "Social History",
        showTitle: true,
        status: "standard",
        templateInstruction:
          "Relevant social history (tobacco, alcohol, drugs, occupational exposure, living situation if clinically relevant).",
        format: "Bullets",
        length: "Concise",
        customFormatting: "",
        macroCount: 1,
      },
      {
        id: "family-history",
        name: "Family History",
        showTitle: true,
        status: "standard",
        templateInstruction: "",
        format: "Bullets",
        length: "Concise",
        customFormatting: "",
        macroCount: 0,
      },
    ],
  },
  {
    id: "ros",
    name: "ROS",
    subsections: [
      {
        id: "ros-main",
        name: "ROS",
        showTitle: false,
        status: "standard",
        templateInstruction: "",
        format: "Bullets",
        length: "Concise",
        customFormatting: "",
        macroCount: 2,
      },
    ],
  },
  {
    id: "pe",
    name: "PE",
    subsections: [
      {
        id: "pe-main",
        name: "PE",
        showTitle: false,
        status: "standard",
        templateInstruction: "",
        format: "Bullets",
        length: "Concise",
        customFormatting: "",
        macroCount: 5,
      },
    ],
  },
  {
    id: "mdm",
    name: "MDM",
    subsections: [
      {
        id: "mdm-main",
        name: "MDM",
        showTitle: false,
        status: "standard",
        templateInstruction: "",
        format: "Bullets",
        length: "Concise",
        customFormatting: "",
        macroCount: 5,
      },
    ],
  },
];
