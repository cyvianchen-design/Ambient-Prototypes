import React, { useState, useRef, useEffect } from "react";
import { Icon, IconButton, Button, Checkbox, Tabs, Menu, MenuItem, Switch, Chip } from "@ds/ui";
import { VisitLayout } from "../components/VisitLayout";

// ─── Section components ───────────────────────────────────────────────────────

type SectionProps = {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  onDragStart?: (e: React.DragEvent) => void;
  controls?: React.ReactNode;
};

function Section({ title, subtitle, children, onDragStart, controls }: SectionProps) {
  return (
    <div className="flex flex-col gap-[4px] w-full">
      <div
        className="flex items-center gap-[2px] h-[28px] ml-[-20px] pl-[2px] pr-[4px] rounded-[4px] group-hover:bg-[var(--surface-1,#f7f7f7)] cursor-grab active:cursor-grabbing select-none transition-colors duration-150"
        draggable={!!onDragStart}
        onDragStart={onDragStart}
      >
        {/* 16px drag icon */}
        <div className="shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[var(--foreground-secondary,#666)]">
          <Icon name="drag_indicator" size={16} />
        </div>
        {/* title + subtitle */}
        <div className="flex items-center gap-[4px] min-w-0">
          <span
            className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap"
            style={{ fontFeatureSettings: "'ss07' 1" }}
          >
            {title}
          </span>
          {subtitle && (
            <span className="text-[12px] leading-[1.2] text-[var(--foreground-secondary,#666)] whitespace-nowrap">
              {subtitle}
            </span>
          )}
        </div>
        {/* hover-reveal controls */}
        {controls && (
          <div
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-[6px] ml-auto pl-[8px]"
            draggable={false}
            onDragStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {controls}
          </div>
        )}
      </div>
      <div className="text-[15px] leading-[1.4] tracking-[0.15px] text-[var(--foreground-primary,#1a1a1a)]">
        {children}
      </div>
    </div>
  );
}

function SubHeader({ children, chip }: { children: React.ReactNode; chip?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[6px] mb-[12px]">
      <p
        className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-secondary,#666)]"
        style={{ fontFeatureSettings: "'ss07' 1" }}
      >
        {children}
      </p>
      {chip}
    </div>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc">
      {items.map((item, i) => (
        <li key={i} className={`ms-[22.5px] ${i < items.length - 1 ? "mb-0" : ""}`}>
          <span className="leading-[1.4]">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Citation({ n, quote, source }: { n: number; quote: string; source: string }) {
  return (
    <span className="relative inline-block group/cit">
      <span
        className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-[2px] bg-[var(--litmus-25,#f1f3fe)] text-[10px] font-bold leading-[1.2] tracking-[0.1px] text-[var(--accent,#1132ee)] mx-[2px] cursor-default align-middle select-none"
        style={{ fontFeatureSettings: "'ss07' 1", fontFamily: "Lato, sans-serif" }}
      >
        {n}
      </span>
      <span className="absolute bottom-[calc(100%+6px)] left-0 z-[100] w-[260px] rounded-[8px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-[12px] opacity-0 pointer-events-none group-hover/cit:opacity-100 transition-opacity duration-150 text-left">
        <p className="text-[11px] font-bold leading-[1.2] tracking-[0.11px] text-[var(--foreground-secondary,#666)] mb-[6px]" style={{ fontFamily: "Lato, sans-serif" }}>Citation</p>
        <p className="text-[13px] leading-[1.4] text-[var(--foreground-primary,#1a1a1a)] mb-[8px]" style={{ fontFamily: "Lato, sans-serif" }}>"{quote}"</p>
        <p className="text-[11px] leading-[1.2] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>{source}</p>
      </span>
    </span>
  );
}

// ─── Section metadata (timeframe options per section) ────────────────────────

type SectionMeta = {
  timeFrameOptions?: string[];
};

const sectionMeta: Record<string, SectionMeta> = {
  "at-a-glance":           {},
  "last-visit":            {},
  "vitals":                {},
  "active-problems":       {},
  "lab-results":           {},  // chips are inline after each sub-header
  "imaging":               {},  // chips are inline after each sub-header
  "historical-procedures": { timeFrameOptions: ["Past 6 months", "Past year", "Past 18 months", "All time"] },
  "active-meds":           {},
  "allergies":             {},
  "social-history":        {},
};

// ─── Section definitions (static content) ────────────────────────────────────

type SectionDef = {
  id: string;
  title: string;
  subtitle?: React.ReactNode;
  content: React.ReactNode;
};

const sectionDefs: SectionDef[] = [
  {
    id: "at-a-glance",
    title: "At a Glance",
    content: (
      <BulletList items={[
        <>Highly complex 74M with 10+ active chronic conditions including CKD G4, HFrEF (EF 30–35%), T2DM, AF on anticoagulation, and moderate COPD.<Citation n={1} quote="Active conditions: HFrEF (EF 30-35%), CKD G4, T2DM uncontrolled, AF permanent, COPD GOLD II, HTN Stage 2, anemia, hyperkalemia, PAD, OSA, depression, gout — 12 active problems." source="May 11, 2026 · Problem List" /> Frequent utilizer — 2 hospitalizations and 4 ED visits in the past 18 months.<Citation n={2} quote="Encounter summary since Nov 2024: 2 inpatient admissions (Oct 2025, Feb 2025), 4 ED visits." source="Jan 9, 2026 · Encounter History" /></>,
        <>Last hospitalized Oct 2025 for acute decompensated heart failure (7-day stay, IV diuresis);<Citation n={3} quote="Admitted 10/12/25 for ADHF. IV furosemide 80mg BID x7 days. Discharged 10/19 on furosemide 80mg BID (uptitrated from 40mg daily)." source="Oct 19, 2025 · Discharge Summary" /> discharged with uptitrated furosemide. Prior admission Feb 2025 for hyperkalemia requiring telemetry monitoring.<Citation n={4} quote="Admitted 2/3/25, K+ 6.4 on routine draw. Spironolactone and ACEi held, telemetry monitoring x3 days. Discharged 2/6/25." source="Feb 6, 2025 · Discharge Summary" /></>,
        <>Here today for routine follow-up and medication review. Patient reports increased lower extremity edema over the past 2 weeks and DOE with minimal exertion (walking room to room).<Citation n={5} quote="Patient called 5/8 reporting bilateral leg swelling worsening x2 weeks and new dyspnea on exertion — unable to walk more than one room without stopping." source="May 8, 2026 · Phone Triage Note" /></>,
      ]} />
    ),
  },
  {
    id: "last-visit",
    title: "Last Visit",
    subtitle: "Jan 9 · Athena signed note",
    content: (
      <p className="leading-[1.4]">
        Stable post-discharge follow-up after Oct 2025 HF admission. Weight down 11 lbs from admission peak.<Citation n={6} quote="Weight today 217 lbs, down from admission peak of 228 lbs. Patient reports strict fluid restriction compliance since discharge." source="Jan 9, 2026 · Office Visit Note" /> Spironolactone held due to K+ 5.6;<Citation n={7} quote="BMP Jan 9: K+ 5.6 mEq/L [H]. Spironolactone held pending K+ &lt;5.0. Patiromer continued at current dose." source="Jan 9, 2026 · Lab Results" /> plan to reintroduce at lower dose once K+ &lt;5.0. Carvedilol uptitrated to 12.5 mg BID. Discussed goals of care briefly; patient deferred formal conversation to future visit. HbA1c 8.9%<Citation n={8} quote="HbA1c 8.9% (Jan 9, 2026), up from 8.1% (Mar 2025). Insulin glargine increased to 24 units, diabetes educator follow-up scheduled." source="Jan 9, 2026 · Lab Results" /> — insulin regimen reviewed with diabetes educator same day. Repeat BMP and BNP ordered for today's visit.
      </p>
    ),
  },
  {
    id: "vitals",
    title: "Vitals",
    subtitle: "Today, 10:14am",
    content: (
      <BulletList items={[
        <>BP: 158/96<Citation n={9} quote="Manual BP x2: 162/98, then 154/94. Average 158/96 mmHg. No orthostatic changes documented." source="May 11, 2026 · Vitals Entry" /></>,
        <>O₂ Sat: 91% on room air<Citation n={10} quote="SpO2 91% on room air, repeat 90%. 2L nasal cannula applied per nursing protocol; repeat SpO2 94% on 2L." source="May 11, 2026 · Vitals Entry" /></>,
        "HR: 74 (irregular) | Temp: 98.2°F | RR: 20",
        <>Ht: 5'9" | Wt: 214 lbs | BMI: 31.6<Citation n={11} quote="Weight 214.0 lbs (97.1 kg). Height 69 in (175.3 cm). BMI 31.6 kg/m²." source="May 11, 2026 · Vitals Entry" /></>,
        <>Weight at last visit (Jan 9): 206 lbs. Today +8 lbs in 8 weeks.<Citation n={12} quote="Weight Jan 9, 2026: 206 lbs. Weight May 11, 2026: 214 lbs. Net gain +8 lbs over 18 weeks." source="Jan 9, 2026 · Vitals Entry" /></>,
      ]} />
    ),
  },
  {
    id: "active-problems",
    title: "Active Problems",
    content: (
      <BulletList items={[
        <>HFrEF, Severe (EF 30–35%): ischemic cardiomyopathy; NYHA Class III; recent ADHF admission Oct 2025<Citation n={13} quote="Echo Nov 2025: EF 30-35% (down from 40% in 2022), moderate MR, LV dilation, RVSP 48 mmHg. NYHA Class III by functional assessment." source="Nov 14, 2025 · Echocardiogram Report" /></>,
        <>CKD, Stage G4 (eGFR 18–22): progressive over 3 years; nephrology co-managing; approaching ESRD planning threshold<Citation n={14} quote="eGFR trend: 24 (Sep 2024) → 21 (Mar 2025) → 19 (Oct 2025) → 18 (Jan 2026) → 17 (today). Nephrology co-managing. ESRD planning conversation initiated." source="May 11, 2026 · Lab Results" /></>,
        <>T2DM, Uncontrolled: HbA1c 8.9%; on insulin glargine + metformin; dose adjustments ongoing<Citation n={15} quote="HbA1c trend: 8.1% (Mar 2025) → 8.6% (Jul 2025) → 8.9% (Oct 2025) → 9.1% (today). Insulin glargine 28u hs, metformin 500mg daily (renally dosed)." source="May 11, 2026 · Lab Results" /></>,
        "Atrial Fibrillation, Permanent: on apixaban; rate-controlled with carvedilol; last CHADS₂-VASc score 5",
        "COPD, Moderate (GOLD II): FEV1 ~52% predicted; managed with dual bronchodilator + ICS",
        "Hypertension, Stage 2: BP difficult to control in context of HF/CKD medication constraints",
        <>Anemia of Chronic Kidney Disease: Hgb trending 9.2–10.1; on darbepoetin alfa; iron studies suboptimal<Citation n={16} quote="Hgb 9.4 g/dL (today). Ferritin 68, TSAT 16% (Oct 2025) — suboptimal for ESA therapy. IV iron discussed at last visit." source="Oct 2025 · Lab Results" /></>,
        "Hyperkalemia, Recurrent: limits RAAS therapy; on patiromer; K+ unstable over past 6 months",
        "Peripheral Artery Disease: ABI 0.62 (R), 0.71 (L); vascular surgery follow-up q6 months",
        "OSA, Moderate-Severe: CPAP non-adherent; AHI 28 on last study (2024)",
        <>Depression: on sertraline; PHQ-9 score 11 at last screen (Oct 2025)<Citation n={17} quote="PHQ-9 completed Oct 14, 2025: score 11 (moderate). Patient attributes low mood to loss of independence. Sertraline 50mg continued." source="Oct 14, 2025 · Office Visit Note" /></>,
        "Gout: on allopurinol; 1 flare in past 12 months",
      ]} />
    ),
  },
  {
    id: "lab-results",
    title: "Lab Results",
    content: (
      <div>
        <SubHeader>Recent Labs</SubHeader>
        <ul className="list-disc mb-[12px]">
          {([
            <>BNP: 810 pg/mL [H], down from 1,240 at Oct admission peak, but re-elevated vs 740 at last visit; correlates with +8 lb weight gain<Citation n={18} quote="BNP 810 pg/mL (May 11). Prior: 740 (Jan 9), 1,240 (Oct 2025 admission). Trending up, correlates with +8 lb weight gain since Jan visit." source="May 11, 2026 · Lab Results" /></>,
            <>BMP, Potassium: 5.3 mEq/L [H], rising again vs 5.1 at last visit; spironolactone reintroduction on hold<Citation n={19} quote="K+ 5.3 mEq/L (May 11), up from 5.1 (Jan 9). Spironolactone reintroduction deferred. Patiromer continued." source="May 11, 2026 · Lab Results" /></>,
            <>BMP, Creatinine: 3.5 mg/dL [H], slight uptick from 3.4; consistent with CKD trajectory<Citation n={20} quote="Creatinine 3.5 mg/dL (May 11), up from 3.4 (Jan 9). Consistent with progressive CKD G4." source="May 11, 2026 · Lab Results" /></>,
            <>BMP, eGFR: 17 mL/min/1.73m² [H], first time below 18; nephrology to be notified<Citation n={21} quote="eGFR 17 mL/min/1.73m² — first documented value below 18. Nephrology notified per CKD care protocol." source="May 11, 2026 · Lab Results" /></>,
            "BMP, Bicarbonate: 19 mEq/L [L], mild metabolic acidosis, new vs last draw",
            "CBC, Hemoglobin: 9.4 g/dL [L], stable low; on darbepoetin",
            "CBC, WBC: 7.2 K/µL [nl]",
            "CBC, Platelets: 188 K/µL [nl]",
            <>HbA1c: 9.1% [H], worsening from 8.9% (Oct 2025); insulin dose review needed<Citation n={22} quote="HbA1c 9.1% (May 11), worsened from 8.9% (Oct 2025) and 8.1% (Mar 2025). Insulin glargine 28u hs — dose adjustment needed." source="May 11, 2026 · Lab Results" /></>,
            <>TSH: 5.9 mIU/L [H], persists elevated from 6.8 (Nov 2025); hypothyroidism workup warranted<Citation n={23} quote="TSH 5.9 mIU/L (May 11), down slightly from 6.8 (Nov 2025). Free T4 not yet ordered. Hypothyroidism workup recommended." source="May 11, 2026 · Lab Results" /></>,
            "uACR: 680 mg/g [H], worsening from 610 (Oct 2025)",
          ] as React.ReactNode[]).map((item, i, arr) => (
            <li key={i} className={`ms-[22.5px] ${i < arr.length - 1 ? "mb-0" : ""}`}>
              <span className="leading-[1.4] text-[15px]">{item}</span>
            </li>
          ))}
        </ul>
        <SubHeader>Historical trends and prior abnormals</SubHeader>
        <ul className="list-disc">
          {([
            <>BNP: ↑ 880 (Feb 2025) → 1,240 (Oct 2025) → 740 (Jan 2026) → 810 (today), persistently elevated; re-trending up<Citation n={24} quote="BNP history: 880 (Feb 2025), 1,240 (Oct 2025), 740 (Jan 2026), 810 (today). Persistently elevated, now re-trending upward." source="May 11, 2026 · Lab Results" /></>,
            "Potassium: unstable, 5.6 (Feb 2025) → 4.9 (Jun 2025) → 5.4 (Oct 2025) → 5.1 (Jan 2026) → 5.3 (today); patiromer added, spironolactone held",
            "eGFR: ↓ progressive, 24 (Sep 2024) → 21 (Mar 2025) → 19 (Oct 2025) → 18 (Jan 2026) → 17 (today)",
            "HbA1c: ↑ 8.1% (Mar 2025) → 8.6% (Jul 2025) → 8.9% (Oct 2025) → 9.1% (today), worsening despite insulin adjustment",
            "Hemoglobin: fluctuating 9.2–10.1 g/dL over 18 months; iron studies (Oct 2025): ferritin 68, TSAT 16%, suboptimal for ESA therapy; IV iron discussed",
            "uACR: ↑ 480 → 610 → 680 mg/g over 12 months, progressive albuminuria",
            "TSH: mildly elevated since Nov 2025 (6.8 → 5.9), not yet treated",
            "Uric acid: 8.4 mg/dL (Jul 2025), elevated despite allopurinol; dose review warranted",
          ] as React.ReactNode[]).map((item, i, arr) => (
            <li key={i} className={`ms-[22.5px] ${i < arr.length - 1 ? "mb-0" : ""}`}>
              <span className="leading-[1.4] text-[15px]">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "imaging",
    title: "Imaging & Diagnostics",
    content: (
      <div>
        <SubHeader>Recent Imaging Results</SubHeader>
        <ul className="list-disc mb-[12px]">
          <li className="ms-[22.5px]">
            <span className="leading-[1.4] text-[15px]">No new imaging since last visit.</span>
          </li>
        </ul>
        <SubHeader>Historical findings and prior abnormals</SubHeader>
        <ul className="list-disc">
          {([
            <>Echocardiogram (Nov 2025): EF 30–35%, down from 40% (2022). Moderate MR, new since prior echo. RVSP 48 mmHg, suggesting pulmonary hypertension. LV dilation present.<Citation n={25} quote="Echo 11/14/25: EF 30-35% (↓ from 40% in 2022). Mod MR — new finding. RVSP 48 mmHg, LV dilation. Cardiology notified of worsening EF." source="Nov 14, 2025 · Echocardiogram Report" /></>,
            <>Chest X-ray (Oct 2025): pulmonary vascular congestion, small bilateral pleural effusions during ADHF admission; resolved on discharge film.<Citation n={26} quote="CXR 10/12/25: pulmonary vascular congestion, bilateral small pleural effusions. Repeat 10/19/25 (discharge): effusions resolved, mild cardiomegaly persists." source="Oct 2025 · Radiology Report" /></>,
            "Renal ultrasound (Aug 2025): bilateral small echogenic kidneys (R: 9.1 cm, L: 9.4 cm), consistent with chronic parenchymal disease. No obstruction.",
            "Lower extremity arterial duplex (Jun 2025): severe stenosis R SFA; moderate stenosis L popliteal. Referred to vascular surgery.",
            "Spirometry (Mar 2025): FEV1 52% predicted, FEV1/FVC 0.64. Stable vs 2023.",
            "Nuclear stress test (2023): fixed inferior wall defect, prior MI; no new ischemia.",
          ] as React.ReactNode[]).map((item, i, arr) => (
            <li key={i} className={`ms-[22.5px] ${i < arr.length - 1 ? "mb-0" : ""}`}>
              <span className="leading-[1.4] text-[15px]">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "historical-procedures",
    title: "Historical Procedures",
    content: (
      <BulletList items={[
        "Oct 2025: inpatient admission, acute decompensated HF, 7-day stay, IV diuresis",
        "Feb 2025: inpatient admission, hyperkalemia with telemetry monitoring",
        "Nov 2024: ICD placement (primary prevention, EF <35%)",
        "Aug 2024: anticoagulation switched from warfarin to apixaban",
        "Jun 2024: lower extremity arterial duplex",
        "Jan 2024: polysomnography, AHI 28",
        "Mar 2023: nuclear stress test, fixed inferior wall defect, no active ischemia",
        "Sep 2022: left heart catheterization, 3-vessel CAD, not amenable to revascularization",
        "Apr 2021: colonoscopy, 1 tubular adenoma removed; repeat due 2026",
        "Dec 2019: right total knee arthroplasty",
      ]} />
    ),
  },
  {
    id: "active-meds",
    title: "Active Meds",
    content: (
      <BulletList items={[
        "Furosemide 80 mg: BID (uptitrated post Oct 2025 admission)",
        "Carvedilol 12.5 mg: BID (recently uptitrated)",
        "Apixaban 5 mg: BID",
        "Atorvastatin 80 mg: daily at bedtime",
        "Insulin glargine 28 units: subcutaneous at bedtime",
        "Metformin 500 mg: daily with dinner (renally dose-reduced)",
        "Allopurinol 300 mg: daily",
        "Sertraline 50 mg: daily",
        "Patiromer 8.4 g: daily with food (for hyperkalemia)",
        "Darbepoetin alfa 60 mcg: subcutaneous q2 weeks",
        "Fluticasone/Salmeterol (Advair) 250/50 mcg: 1 puff BID",
        "Tiotropium (Spiriva) 18 mcg: 1 cap daily",
        "Albuterol 90 mcg MDI: 1–2 puffs q4–6h PRN",
        "Pantoprazole 40 mg: daily",
        "Aspirin 81 mg: daily",
        "Spironolactone 25 mg: on hold since Feb 2025 due to recurrent hyperkalemia; reintroduction pending K+ stability",
      ]} />
    ),
  },
  {
    id: "allergies",
    title: "Allergies",
    content: (
      <BulletList items={[
        "Ibuprofen/NSAIDs (HIGH): acute kidney injury (2020)",
        "Contrast dye (MODERATE): urticaria; premedication protocol required for future contrast studies",
        "Lisinopril (MODERATE): severe dry cough, angioedema episode (2018)",
        "Sulfa drugs (LOW): rash",
      ]} />
    ),
  },
  {
    id: "social-history",
    title: "Social History",
    content: (
      <BulletList items={[
        "Lives with wife in a single-story home in Sacramento, CA. Retired electrician. Two adult children nearby; wife is primary caregiver.",
        "Former smoker: 45 pack-years, quit 2005. Occasional alcohol, 2–3 drinks/week. No illicit drug use.",
        "Severely limited functional status — ADL-dependent for bathing and dressing due to dyspnea and lower extremity weakness. Uses walker. No longer drives.",
        "Wife reports significant caregiver burden; social work referral placed Jan 2026.",
        "Depression screening positive (PHQ-9: 11). Patient attributes low mood to loss of independence.",
      ]} />
    ),
  },
];

// ─── Copilot suggestion chips ─────────────────────────────────────────────────

const suggestions = [
  { icon: "ink_highlighter",  text: "What should I know before this visit?" },
  { icon: "chat_info",        text: "Any risks or concerns I should be aware of?" },
  { icon: "fact_check",       text: "What should I make sure to cover today?" },
  { icon: "trending_up",      text: "Summarize trends in this patient's results." },
  { icon: "lightbulb",        text: "Explain Carry Forward and how to use it." },
  { icon: "history",          text: "Frequent question" },
  { icon: "history",          text: "Recent question" },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function R2DragDrop() {
  const [consentChecked, setConsentChecked] = useState(false);
  const [order, setOrder] = useState(() => sectionDefs.map(s => s.id));
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Per-section state
  const [timeFrames, setTimeFrames] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    Object.entries(sectionMeta).forEach(([id, meta]) => {
      if (meta.timeFrameOptions) init[id] = meta.timeFrameOptions[0];
    });
    return init;
  });
  const [informNote, setInformNote] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sectionDefs.map(s => [s.id, true]))
  );
  const [deleted, setDeleted] = useState<Set<string>>(new Set());
  const [chipMenuOpen, setChipMenuOpen] = useState<string | null>(null);
  const chipMenuRef = useRef<HTMLDivElement>(null);

  // Sub-section (inline) timeframe chips for lab-results and imaging
  const subTimeFrameOpts: Record<string, string[]> = {
    "lab-recent":      ["Since last visit", "Past 3 months", "Past 6 months", "Past year"],
    "lab-history":     ["Past 6 months", "Past 12 months", "Past 18 months", "All time"],
    "imaging-recent":  ["Since last visit", "Past 3 months", "Past 6 months", "Past year"],
    "imaging-history": ["Past 6 months", "Past 12 months", "Past 18 months", "All time"],
  };
  const [subTimeFrames, setSubTimeFrames] = useState<Record<string, string>>({
    "lab-recent":      "Since last visit",
    "lab-history":     "Past 18 months",
    "imaging-recent":  "Since last visit",
    "imaging-history": "Past 18 months",
  });
  const [subChipMenuOpen, setSubChipMenuOpen] = useState<string | null>(null);
  const subChipMenuRef = useRef<HTMLDivElement>(null);

  // Click-outside for the more menu
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Click-outside for chip timeframe menus
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (chipMenuRef.current && !chipMenuRef.current.contains(e.target as Node)) {
        setChipMenuOpen(null);
      }
    }
    if (chipMenuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [chipMenuOpen]);

  // Click-outside for inline sub-section chips
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (subChipMenuRef.current && !subChipMenuRef.current.contains(e.target as Node)) {
        setSubChipMenuOpen(null);
      }
    }
    if (subChipMenuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [subChipMenuOpen]);

  const activeOrder = order.filter(id => !deleted.has(id));
  const deletedOrder = order.filter(id => deleted.has(id));
  const orderedSections = activeOrder.map(id => sectionDefs.find(s => s.id === id)!).filter(Boolean);

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== draggedId) setDragOverId(id);
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    setOrder(prev => {
      const from = prev.indexOf(draggedId);
      const to = prev.indexOf(targetId);
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, draggedId);
      return next;
    });
    setDraggedId(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDragOverId(null);
  }

  // ── Inline sub-section timeframe chip factory ─────────────────────────────
  function makeSubChip(id: string) {
    return (
      <div className="relative inline-flex">
        <Chip
          size="XS"
          label={subTimeFrames[id]}
          onClick={(e) => {
            e.stopPropagation();
            setSubChipMenuOpen(prev => prev === id ? null : id);
          }}
        />
        {subChipMenuOpen === id && (
          <div ref={subChipMenuRef} className="absolute left-0 top-[30px] z-[300]">
            <Menu className="w-[200px]">
              {subTimeFrameOpts[id].map(opt => (
                <MenuItem
                  key={opt}
                  label={opt}
                  selected={subTimeFrames[id] === opt}
                  onClick={() => {
                    setSubTimeFrames(prev => ({ ...prev, [id]: opt }));
                    setSubChipMenuOpen(null);
                  }}
                />
              ))}
            </Menu>
          </div>
        )}
      </div>
    );
  }

  // ── Dynamic content for sections with per-sub-section timeframes ──────────
  const labContent = (
    <div>
      <SubHeader chip={makeSubChip("lab-recent")}>Recent Labs</SubHeader>
      <ul className="list-disc mb-[12px]">
        {([
          <>BNP: 810 pg/mL [H], down from 1,240 at Oct admission peak, but re-elevated vs 740 at last visit; correlates with +8 lb weight gain<Citation n={18} quote="BNP 810 pg/mL (May 11). Prior: 740 (Jan 9), 1,240 (Oct 2025 admission). Trending up, correlates with +8 lb weight gain since Jan visit." source="May 11, 2026 · Lab Results" /></>,
          <>BMP, Potassium: 5.3 mEq/L [H], rising again vs 5.1 at last visit; spironolactone reintroduction on hold<Citation n={19} quote="K+ 5.3 mEq/L (May 11), up from 5.1 (Jan 9). Spironolactone reintroduction deferred. Patiromer continued." source="May 11, 2026 · Lab Results" /></>,
          <>BMP, Creatinine: 3.5 mg/dL [H], slight uptick from 3.4; consistent with CKD trajectory<Citation n={20} quote="Creatinine 3.5 mg/dL (May 11), up from 3.4 (Jan 9). Consistent with progressive CKD G4." source="May 11, 2026 · Lab Results" /></>,
          <>BMP, eGFR: 17 mL/min/1.73m² [H], first time below 18; nephrology to be notified<Citation n={21} quote="eGFR 17 mL/min/1.73m² — first documented value below 18. Nephrology notified per CKD care protocol." source="May 11, 2026 · Lab Results" /></>,
          "BMP, Bicarbonate: 19 mEq/L [L], mild metabolic acidosis, new vs last draw",
          "CBC, Hemoglobin: 9.4 g/dL [L], stable low; on darbepoetin",
          "CBC, WBC: 7.2 K/µL [nl]",
          "CBC, Platelets: 188 K/µL [nl]",
          <>HbA1c: 9.1% [H], worsening from 8.9% (Oct 2025); insulin dose review needed<Citation n={22} quote="HbA1c 9.1% (May 11), worsened from 8.9% (Oct 2025) and 8.1% (Mar 2025). Insulin glargine 28u hs — dose adjustment needed." source="May 11, 2026 · Lab Results" /></>,
          <>TSH: 5.9 mIU/L [H], persists elevated from 6.8 (Nov 2025); hypothyroidism workup warranted<Citation n={23} quote="TSH 5.9 mIU/L (May 11), down slightly from 6.8 (Nov 2025). Free T4 not yet ordered. Hypothyroidism workup recommended." source="May 11, 2026 · Lab Results" /></>,
          "uACR: 680 mg/g [H], worsening from 610 (Oct 2025)",
        ] as React.ReactNode[]).map((item, i, arr) => (
          <li key={i} className={`ms-[22.5px] ${i < arr.length - 1 ? "mb-0" : ""}`}>
            <span className="leading-[1.4] text-[15px]">{item}</span>
          </li>
        ))}
      </ul>
      <SubHeader chip={makeSubChip("lab-history")}>Historical trends and prior abnormals</SubHeader>
      <ul className="list-disc">
        {([
          <>BNP: ↑ 880 (Feb 2025) → 1,240 (Oct 2025) → 740 (Jan 2026) → 810 (today), persistently elevated; re-trending up<Citation n={24} quote="BNP history: 880 (Feb 2025), 1,240 (Oct 2025), 740 (Jan 2026), 810 (today). Persistently elevated, now re-trending upward." source="May 11, 2026 · Lab Results" /></>,
          "Potassium: unstable, 5.6 (Feb 2025) → 4.9 (Jun 2025) → 5.4 (Oct 2025) → 5.1 (Jan 2026) → 5.3 (today); patiromer added, spironolactone held",
          "eGFR: ↓ progressive, 24 (Sep 2024) → 21 (Mar 2025) → 19 (Oct 2025) → 18 (Jan 2026) → 17 (today)",
          "HbA1c: ↑ 8.1% (Mar 2025) → 8.6% (Jul 2025) → 8.9% (Oct 2025) → 9.1% (today), worsening despite insulin adjustment",
          "Hemoglobin: fluctuating 9.2–10.1 g/dL over 18 months; iron studies (Oct 2025): ferritin 68, TSAT 16%, suboptimal for ESA therapy; IV iron discussed",
          "uACR: ↑ 480 → 610 → 680 mg/g over 12 months, progressive albuminuria",
          "TSH: mildly elevated since Nov 2025 (6.8 → 5.9), not yet treated",
          "Uric acid: 8.4 mg/dL (Jul 2025), elevated despite allopurinol; dose review warranted",
        ] as React.ReactNode[]).map((item, i, arr) => (
          <li key={i} className={`ms-[22.5px] ${i < arr.length - 1 ? "mb-0" : ""}`}>
            <span className="leading-[1.4] text-[15px]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const imagingContent = (
    <div>
      <SubHeader chip={makeSubChip("imaging-recent")}>Recent Imaging Results</SubHeader>
      <ul className="list-disc mb-[12px]">
        <li className="ms-[22.5px]">
          <span className="leading-[1.4] text-[15px]">No new imaging since last visit.</span>
        </li>
      </ul>
      <SubHeader chip={makeSubChip("imaging-history")}>Historical findings and prior abnormals</SubHeader>
      <ul className="list-disc">
        {([
          <>Echocardiogram (Nov 2025): EF 30–35%, down from 40% (2022). Moderate MR, new since prior echo. RVSP 48 mmHg, suggesting pulmonary hypertension. LV dilation present.<Citation n={25} quote="Echo 11/14/25: EF 30-35% (↓ from 40% in 2022). Mod MR — new finding. RVSP 48 mmHg, LV dilation. Cardiology notified of worsening EF." source="Nov 14, 2025 · Echocardiogram Report" /></>,
          <>Chest X-ray (Oct 2025): pulmonary vascular congestion, small bilateral pleural effusions during ADHF admission; resolved on discharge film.<Citation n={26} quote="CXR 10/12/25: pulmonary vascular congestion, bilateral small pleural effusions. Repeat 10/19/25 (discharge): effusions resolved, mild cardiomegaly persists." source="Oct 2025 · Radiology Report" /></>,
          "Renal ultrasound (Aug 2025): bilateral small echogenic kidneys (R: 9.1 cm, L: 9.4 cm), consistent with chronic parenchymal disease. No obstruction.",
          "Lower extremity arterial duplex (Jun 2025): severe stenosis R SFA; moderate stenosis L popliteal. Referred to vascular surgery.",
          "Spirometry (Mar 2025): FEV1 52% predicted, FEV1/FVC 0.64. Stable vs 2023.",
          "Nuclear stress test (2023): fixed inferior wall defect, prior MI; no new ischemia.",
        ] as React.ReactNode[]).map((item, i, arr) => (
          <li key={i} className={`ms-[22.5px] ${i < arr.length - 1 ? "mb-0" : ""}`}>
            <span className="leading-[1.4] text-[15px]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const sectionContent: Record<string, React.ReactNode> = {
    "lab-results": labContent,
    "imaging":     imagingContent,
  };

  return (
    <VisitLayout>
      <div className="flex flex-1 overflow-hidden min-w-0">

        {/* ── Main content column ── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Patient header */}
          <div className="flex items-end h-[60px] shrink-0 px-[20px] pb-[8px] pt-[12px] gap-[16px]">
            <div className="flex items-end gap-[16px] flex-1 min-w-0">
              <p className="text-[24px] font-bold leading-[1.2] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">
                Robert Mackenzie
              </p>
              <div className="flex items-center gap-[4px] text-[13px] leading-[1.4] tracking-[0.065px] text-[var(--foreground-secondary,#666)] pb-[2px] whitespace-nowrap">
                <span>74</span>
                <span>·</span>
                <span>M</span>
                <span>·</span>
                <span>Medication review</span>
              </div>
            </div>
            <div className="flex items-center gap-[16px] shrink-0">
              <div className="flex items-center gap-[4px]">
                <IconButton icon={<Icon name="refresh" size={16} />} size="small" aria-label="Refresh" />
                <span className="text-[13px] leading-[1.4] tracking-[0.065px] text-[var(--foreground-secondary,#666)] whitespace-nowrap">
                  Updated May 11, 9:42am
                </span>
              </div>
              <div className="flex items-center gap-[4px]">
                <IconButton icon={<Icon name="thumb_up" size={16} />} size="small" aria-label="Thumbs up" />
                <IconButton icon={<Icon name="thumb_down" size={16} />} size="small" aria-label="Thumbs down" />
              </div>
              <div className="relative" ref={menuRef}>
                <IconButton
                  icon={<Icon name="more_vert" size={16} />}
                  size="small"
                  aria-label="More options"
                  onClick={() => setMenuOpen((v) => !v)}
                />
                {menuOpen && (
                  <div className="absolute right-0 top-[32px] z-[200]">
                    <Menu className="w-[220px]">
                      <MenuItem icon={<Icon name="print" size={16} />} label="Print Previsit" onClick={() => setMenuOpen(false)} />
                    </Menu>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Previsit content — scrollable */}
          <div className="flex-1 overflow-y-auto pl-[24px] pr-[20px] pb-[8px] pt-[8px]">
            <div className="flex flex-col gap-[16px] max-w-[800px]">
              {orderedSections.map(section => {
                const meta = sectionMeta[section.id] ?? {};
                const hasChip = !!meta.timeFrameOptions;
                const controls = (
                  <>
                    {/* Timeframe chip */}
                    {hasChip && (
                      <div className="relative">
                        <Chip
                          size="XS"
                          label={timeFrames[section.id] ?? meta.timeFrameOptions![0]}
                          onClick={(e) => {
                            e.stopPropagation();
                            setChipMenuOpen(prev => prev === section.id ? null : section.id);
                          }}
                        />
                        {chipMenuOpen === section.id && (
                          <div ref={chipMenuRef} className="absolute left-0 top-[30px] z-[300]">
                            <Menu className="w-[200px]">
                              {meta.timeFrameOptions!.map(opt => (
                                <MenuItem
                                  key={opt}
                                  label={opt}
                                  selected={timeFrames[section.id] === opt}
                                  onClick={() => {
                                    setTimeFrames(prev => ({ ...prev, [section.id]: opt }));
                                    setChipMenuOpen(null);
                                  }}
                                />
                              ))}
                            </Menu>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Inform note switch */}
                    <span className="text-[11px] leading-[1.2] text-[var(--foreground-secondary,#666)] whitespace-nowrap">
                      Inform note
                    </span>
                    <Switch
                      size="XS"
                      checked={informNote[section.id] ?? true}
                      onChange={(v) => setInformNote(prev => ({ ...prev, [section.id]: v }))}
                    />
                    {/* Remove button */}
                    <IconButton
                      icon={<Icon name="close" size={14} />}
                      size="small"
                      aria-label="Remove section"
                      onClick={() => setDeleted(prev => new Set([...prev, section.id]))}
                    />
                  </>
                );
                return (
                  <div
                    key={section.id}
                    onDragOver={(e) => handleDragOver(e, section.id)}
                    onDrop={(e) => handleDrop(e, section.id)}
                    onDragEnd={handleDragEnd}
                    className={[
                      "group transition-opacity",
                      draggedId === section.id ? "opacity-40" : "opacity-100",
                      dragOverId === section.id && draggedId !== section.id
                        ? "border-t-2 border-[var(--accent,#1132ee)]"
                        : "border-t-2 border-transparent",
                    ].join(" ")}
                  >
                    <Section
                      title={section.title}
                      subtitle={section.subtitle}
                      onDragStart={(e) => handleDragStart(e, section.id)}
                      controls={controls}
                    >
                      {sectionContent[section.id] ?? section.content}
                    </Section>
                  </div>
                );
              })}

              {/* Not included */}
              {deletedOrder.length > 0 && (
                <div className="flex flex-col gap-[8px]">
                  <div className="flex items-center gap-[8px]">
                    <div className="flex-1 h-px bg-[var(--shape-outline,rgba(0,0,0,0.1))]" />
                    <span className="text-[11px] leading-[1.2] text-[var(--foreground-tertiary,#808080)] whitespace-nowrap">
                      Not included
                    </span>
                    <div className="flex-1 h-px bg-[var(--shape-outline,rgba(0,0,0,0.1))]" />
                  </div>
                  {deletedOrder.map(id => {
                    const section = sectionDefs.find(s => s.id === id)!;
                    return (
                      <div key={id} className="flex items-center justify-between h-[28px] ml-[-20px] pl-[18px] pr-[4px]">
                        <span className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-tertiary,#808080)]" style={{ fontFeatureSettings: "'ss07' 1" }}>
                          {section.title}
                        </span>
                        <Button
                          variant="tertiary"
                          size="small"
                          onClick={() => setDeleted(prev => { const next = new Set(prev); next.delete(id); return next; })}
                        >
                          Add
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sticky bottom bar */}
          <div className="shrink-0 bg-white border-t border-[var(--shape-outline,rgba(0,0,0,0.1))] flex items-center gap-[16px] px-[20px] pt-[8px] pb-[24px]">
            <div className="flex flex-1 items-center gap-[8px] min-w-0">
              <button
                className="flex items-center gap-[4px] h-[28px] px-[8px] border border-[var(--neutral-200,#ccc)] rounded-[6px] text-[13px] leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors min-w-0"
                style={{ fontFamily: "Lato, sans-serif" }}
              >
                <span className="truncate">Adult Annual Visit</span>
                <Icon name="arrow_drop_down" size={20} />
              </button>
              <button
                className="flex items-center gap-[4px] h-[28px] px-[8px] bg-[var(--surface-2,#f2f2f2)] rounded-[6px] text-[13px] leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-3,#ebebeb)] transition-colors shrink-0"
                style={{ fontFamily: "Lato, sans-serif" }}
              >
                In Person
                <Icon name="arrow_drop_down" size={16} />
              </button>
              <button
                className="flex items-center gap-[4px] h-[28px] px-[8px] bg-[var(--surface-2,#f2f2f2)] rounded-[6px] text-[13px] leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-3,#ebebeb)] transition-colors shrink-0"
                style={{ fontFamily: "Lato, sans-serif" }}
              >
                <Icon name="check" size={16} />
                Carry Forward
                <Icon name="arrow_drop_down" size={16} />
              </button>
            </div>
            <div className="flex items-center gap-[4px] shrink-0">
              <Checkbox
                state={consentChecked ? "selected" : "unselected"}
                onChange={(v) => setConsentChecked(v)}
              />
              <span
                className="text-[13px] leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap"
                style={{ fontFamily: "Lato, sans-serif" }}
              >
                Patient consent
              </span>
            </div>
            <Button
              variant="primary"
              size="large"
              prefix={<Icon name="mic" size={20} filled />}
            >
              Start Recording
            </Button>
          </div>
        </div>

        {/* ── Copilot panel ── */}
        <div className="w-[355px] shrink-0 border-l border-[var(--shape-outline,rgba(0,0,0,0.1))] flex flex-col bg-white overflow-hidden">
          <div className="h-[48px] px-[16px] flex items-center shrink-0">
            <Tabs
              variant="secondary"
              tabs={[
                { id: "assistant", label: "Assistant" },
                { id: "sources",   label: "Sources" },
              ]}
              defaultTab="assistant"
            />
          </div>
          <div className="flex-1 overflow-y-auto px-[20px] py-[8px]">
            <p
              className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)] mb-[12px]"
              style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07' 1" }}
            >
              Get Started
            </p>
            <div className="flex flex-col gap-[12px]">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="flex items-center gap-[8px] h-[28px] px-[8px] bg-[var(--surface-2,#f2f2f2)] rounded-[8px] shrink-0 text-left hover:bg-[var(--surface-3,#ebebeb)] transition-colors"
                >
                  <Icon name={s.icon} size={16} />
                  <span
                    className="text-[13px] leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap"
                    style={{ fontFamily: "Lato, sans-serif" }}
                  >
                    {s.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="shrink-0 px-[20px] pt-[8px] pb-[24px]">
            <div className="flex items-center h-[48px] px-[12px] border border-[#8044ff] rounded-[6px]">
              <span
                className="flex-1 text-[15px] leading-[1.4] tracking-[0.15px] text-[var(--foreground-tertiary,#808080)]"
                style={{ fontFamily: "Lato, sans-serif" }}
              >
                Ask assistant
              </span>
              <IconButton icon={<Icon name="mic" size={20} filled />} size="medium" aria-label="Voice input" />
              <IconButton icon={<Icon name="send" size={20} filled />} size="medium" aria-label="Send" />
            </div>
          </div>
        </div>

      </div>
    </VisitLayout>
  );
}
