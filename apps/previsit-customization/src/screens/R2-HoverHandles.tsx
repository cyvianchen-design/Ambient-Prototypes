import React, { useState, useRef, useEffect } from "react";
import { Icon, IconButton, Button, Checkbox, Tabs, Overlay, MagicEdit, Menu, MenuItem } from "@ds/ui";
import { VisitLayout } from "../components/VisitLayout";

// ─── Shared helpers ──────────────────────────────────────────────────────────

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

function SubHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-secondary,#666)] mb-[12px]" style={{ fontFeatureSettings: "'ss07' 1" }}>
      {children}
    </p>
  );
}

type SectionProps = {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
};

function Section({ title, subtitle, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-[4px] w-full">
      <div className="flex items-center gap-[4px]">
        <span className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap" style={{ fontFeatureSettings: "'ss07' 1" }}>
          {title}
        </span>
        {subtitle && (
          <span className="text-[12px] leading-[1.2] text-[var(--foreground-secondary,#666)]">{subtitle}</span>
        )}
      </div>
      <div className="text-[15px] leading-[1.4] tracking-[0.15px] text-[var(--foreground-primary,#1a1a1a)]">
        {children}
      </div>
    </div>
  );
}

// ─── Drawer components ───────────────────────────────────────────────────────

function TimeFrameDropdown({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center h-[24px] px-[8px] bg-[var(--surface-2,#f2f2f2)] rounded-[4px] text-[11px] text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-3,#ebebeb)] transition-colors whitespace-nowrap"
        style={{ fontFamily: "Lato, sans-serif" }}
      >
        {value}
        <Icon name="arrow_drop_down" size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[399]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[28px] z-[400]">
            <Menu className="w-[220px]">
              {options.map((opt) => (
                <MenuItem
                  key={opt}
                  label={opt}
                  selected={value === opt}
                  onClick={() => { onChange(opt); setOpen(false); }}
                />
              ))}
            </Menu>
          </div>
        </>
      )}
    </div>
  );
}

function DisabledChip({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center h-[24px] px-[8px] rounded-[4px] bg-[var(--surface-2,#f2f2f2)] text-[11px] text-[var(--foreground-secondary,#666)] cursor-default select-none whitespace-nowrap shrink-0"
      style={{ fontFamily: "Lato, sans-serif" }}
    >
      {label}
    </span>
  );
}

function DragDivider() {
  return <div className="shrink-0 h-[2px] rounded-full bg-[var(--accent,#1132ee)] mx-[4px]" />;
}

type DrawerRow = {
  id: string;
  label: string;
  fixedLabel?: string;
  timeFrameKey?: string;
  options?: string[];
  children?: DrawerRow[];
};

const drawerGroups: DrawerRow[] = [
  { id: "at-a-glance", label: "At a Glance", fixedLabel: "Current", children: [
    { id: "at-a-glance-baseline", label: "Stable baseline" },
    { id: "at-a-glance-current",  label: "Current clinical picture" },
  ]},
  { id: "today-focus", label: "Today's Focus", fixedLabel: "Current", children: [
    { id: "focus-orders",   label: "Orders" },
    { id: "focus-adjust",   label: "Adjust" },
    { id: "focus-followup", label: "Follow up" },
    { id: "focus-review",   label: "Review" },
  ]},
  { id: "last-visit", label: "Last Visit", timeFrameKey: "last-visit-source", options: [
    "Any provider, any note",
    "Any provider, follow-up only",
    "My notes only",
    "My follow-ups only",
  ]},
  { id: "vitals",                label: "Vitals",                fixedLabel: "Current" },
  { id: "active-problems",       label: "Active Problems",       fixedLabel: "Current" },
  { id: "lab-results", label: "Lab Results", children: [
    { id: "lab-recent",  label: "Recent Labs",       timeFrameKey: "lab-recent",  options: ["Since last visit", "Past 3 months", "Past 6 months", "Past year"] },
    { id: "lab-history", label: "Historical trends", timeFrameKey: "lab-history", options: ["Past 6 months", "Past 12 months", "Past 18 months", "Past 5 years"] },
  ]},
  { id: "imaging", label: "Imaging & Diagnostics", children: [
    { id: "imaging-recent",  label: "Recent imaging",      timeFrameKey: "imaging-recent",  options: ["Since last visit", "Past 3 months", "Past 6 months", "Past year"] },
    { id: "imaging-history", label: "Historical findings", timeFrameKey: "imaging-history", options: ["Past 6 months", "Past 12 months", "Past 18 months", "Past 5 years"] },
  ]},
  { id: "historical-procedures", label: "Historical Procedures", timeFrameKey: "historical-procedures",  options: ["Past year", "Past 3 years", "Past 5 years"] },
  { id: "active-meds",           label: "Active Meds",           fixedLabel: "Current" },
  { id: "allergies",             label: "Allergies",             fixedLabel: "Current" },
  { id: "social-history",        label: "Social History",        fixedLabel: "Current" },
];

// ─── Section content ─────────────────────────────────────────────────────────

type SectionDef = { id: string; title: string; subtitle?: React.ReactNode; content: React.ReactNode };

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
    id: "today-focus",
    title: "Today's Focus",
    content: (
      <div className="flex flex-col gap-[12px]">
        <div>
          <SubHeader>Orders</SubHeader>
          <BulletList items={[
            "BMP and BNP — ordered at last visit, results available today",
            "Free T4 — work up persistently elevated TSH (6.8 → 5.9 mIU/L)",
            "IV iron — ferritin 68, TSAT 16%, suboptimal for ESA therapy; IV iron discussed at last visit",
            "Nephrology referral for ESRD planning — eGFR now 17, first time below 18",
          ]} />
        </div>
        <div>
          <SubHeader>Adjust</SubHeader>
          <BulletList items={[
            "Furosemide — consider uptitration; +8 lbs since Jan, BNP re-elevated at 810",
            "Insulin glargine — dose review needed; HbA1c worsening to 9.1%",
            "Spironolactone — reintroduction still on hold; K+ 5.3, not yet at target <5.0",
          ]} />
        </div>
        <div>
          <SubHeader>Follow up</SubHeader>
          <BulletList items={[
            "Nephrology — notify re: eGFR 17 per CKD care protocol",
            "Cardiology — worsening EF (30–35%), re-elevated BNP",
            "Vascular surgery — PAD q6-month follow-up due",
            "Social work — referral placed Jan 2026, status unknown",
          ]} />
        </div>
        <div>
          <SubHeader>Review</SubHeader>
          <BulletList items={[
            "Goals of care — deferred by patient at last visit",
            "CPAP adherence — OSA, AHI 28, non-adherent",
            "Depression — PHQ-9 score 11 at last screen (Oct 2025), on sertraline",
            "Colonoscopy — due 2026 (tubular adenoma removed Apr 2021)",
          ]} />
        </div>
      </div>
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
        <SubHeader>Recent Labs (since last visit, Jan 9, 2026)</SubHeader>
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
        <SubHeader>Historical trends and prior abnormals (18 months)</SubHeader>
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
        <SubHeader>Recent Imaging Results (since last visit, Jan 9, 2026)</SubHeader>
        <ul className="list-disc mb-[12px]">
          <li className="ms-[22.5px]">
            <span className="leading-[1.4] text-[15px]">No new imaging since last visit.</span>
          </li>
        </ul>
        <SubHeader>Historical findings and prior abnormals (18 months)</SubHeader>
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

export default function R2HoverHandles() {
  const [consentChecked, setConsentChecked] = useState(false);
  const [order, setOrder] = useState(() => sectionDefs.map((s) => s.id));
  const [pointerDragId, setPointerDragId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const drawerListRef = useRef<HTMLDivElement>(null);

  const [deleted, setDeleted] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [deletedChildren, setDeletedChildren] = useState<Set<string>>(new Set());
  const [timeFrames, setTimeFrames] = useState<Record<string, string>>({
    "lab-recent":            "Since last visit",
    "lab-history":           "Past 18 months",
    "imaging-recent":        "Since last visit",
    "imaging-history":       "Past 18 months",
    "historical-procedures": "Past 5 years",
    "last-visit-source":     "Any provider, any note",
  });

  // Per-section child ordering (full child list — deleted children stay in their positions)
  const [childOrder, setChildOrder] = useState<Record<string, string[]>>(() => {
    const result: Record<string, string[]> = {};
    drawerGroups.forEach((g) => {
      if (g.children) result[g.id] = g.children.map((c) => c.id);
    });
    return result;
  });

  // Subsection drag state
  const [subDragChildId, setSubDragChildId] = useState<string | null>(null);
  const [subDragParentId, setSubDragParentId] = useState<string | null>(null);
  const [subDropIndex, setSubDropIndex] = useState<number | null>(null);

  // Floating ghost state — mounted/unmounted via state, position driven directly via refs for zero-lag updates
  const [sectionGhost, setSectionGhost] = useState<{ label: string; w: number; x: number; y: number } | null>(null);
  const sectionGhostRef = useRef<HTMLDivElement>(null);
  const sectionOffsetRef = useRef({ x: 0, y: 0 });

  const [subGhost, setSubGhost] = useState<{ label: string; w: number; x: number; y: number } | null>(null);
  const subGhostRef = useRef<HTMLDivElement>(null);
  const subOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const activeOrder = order.filter((id) => !deleted.has(id));
  const deletedOrder = order.filter((id) => deleted.has(id));

  function deleteSection(id: string) {
    setDeleted((prev) => new Set([...prev, id]));
  }
  function restoreSection(id: string) {
    setDeleted((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }
  function deleteChild(id: string) {
    setDeletedChildren((prev) => new Set([...prev, id]));
  }
  function restoreChild(id: string) {
    setDeletedChildren((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  // Returns visible children in their custom order
  function getActiveChildren(group: DrawerRow): DrawerRow[] {
    if (!group.children) return [];
    const order = childOrder[group.id] ?? group.children.map((c) => c.id);
    return order
      .filter((cid) => !deletedChildren.has(cid))
      .map((cid) => group.children!.find((c) => c.id === cid)!)
      .filter((c): c is DrawerRow => c !== undefined);
  }

  const orderedSections = activeOrder.map((id) => sectionDefs.find((s) => s.id === id)!).filter(Boolean);

  return (
    <VisitLayout>
      <div className="relative flex flex-1 overflow-hidden min-w-0">

        {/* ── Main content column ── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Patient header */}
          <div className="flex items-end h-[60px] shrink-0 px-[20px] pb-[8px] pt-[12px] gap-[16px]">
            <div className="flex items-end gap-[16px] flex-1 min-w-0">
              <p className="text-[24px] font-bold leading-[1.2] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">Robert Mackenzie</p>
              <div className="flex items-center gap-[4px] text-[13px] leading-[1.4] tracking-[0.065px] text-[var(--foreground-secondary,#666)] pb-[2px] whitespace-nowrap">
                <span>74</span><span>·</span><span>M</span><span>·</span><span>Medication review</span>
              </div>
            </div>
            <div className="flex items-center gap-[16px] shrink-0">
              <div className="flex items-center gap-[4px]">
                <IconButton icon={<Icon name="refresh" size={16} />} size="small" aria-label="Refresh" />
                <span className="text-[13px] leading-[1.4] tracking-[0.065px] text-[var(--foreground-secondary,#666)] whitespace-nowrap">Updated May 11, 9:42am</span>
              </div>
              <div className="flex items-center gap-[4px]">
                <IconButton icon={<Icon name="thumb_up" size={16} />} size="small" aria-label="Thumbs up" />
                <IconButton icon={<Icon name="thumb_down" size={16} />} size="small" aria-label="Thumbs down" />
              </div>
              {/* More menu */}
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
                      <MenuItem icon={<MagicEdit className="w-[16px] h-[16px]" />} label="Customize Previsit" onClick={() => { setMenuOpen(false); setDrawerOpen(true); }} />
                      <MenuItem icon={<Icon name="print" size={16} />} label="Print Previsit" />
                    </Menu>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Previsit content */}
          <div className="flex-1 overflow-y-auto pl-[24px] pr-[20px] pb-[8px] pt-[8px]">
            <div className="flex flex-col gap-[16px] max-w-[800px]">
              {orderedSections.map((section) => (
                <div key={section.id}>
                  <Section title={section.title} subtitle={section.subtitle}>
                    {section.content}
                  </Section>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="shrink-0 bg-white border-t border-[var(--shape-outline,rgba(0,0,0,0.1))] flex items-center gap-[16px] px-[20px] pt-[8px] pb-[24px]">
            <div className="flex flex-1 items-center gap-[8px] min-w-0">
              <button className="flex items-center gap-[4px] h-[28px] px-[8px] border border-[var(--neutral-200,#ccc)] rounded-[6px] text-[13px] leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors min-w-0" style={{ fontFamily: "Lato, sans-serif" }}>
                <span className="truncate">Adult Annual Visit</span>
                <Icon name="arrow_drop_down" size={20} />
              </button>
              <button className="flex items-center gap-[4px] h-[28px] px-[8px] bg-[var(--surface-2,#f2f2f2)] rounded-[6px] text-[13px] leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-3,#ebebeb)] transition-colors shrink-0" style={{ fontFamily: "Lato, sans-serif" }}>
                In Person<Icon name="arrow_drop_down" size={16} />
              </button>
              <button className="flex items-center gap-[4px] h-[28px] px-[8px] bg-[var(--surface-2,#f2f2f2)] rounded-[6px] text-[13px] leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-3,#ebebeb)] transition-colors shrink-0" style={{ fontFamily: "Lato, sans-serif" }}>
                <Icon name="check" size={16} />Carry Forward<Icon name="arrow_drop_down" size={16} />
              </button>
            </div>
            <div className="flex items-center gap-[4px] shrink-0">
              <Checkbox state={consentChecked ? "selected" : "unselected"} onChange={(v) => setConsentChecked(v)} />
              <span className="text-[13px] leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap" style={{ fontFamily: "Lato, sans-serif" }}>Patient consent</span>
            </div>
            <Button variant="primary" size="large" prefix={<Icon name="mic" size={20} filled />}>Start Recording</Button>
          </div>
        </div>

        {/* ── Copilot panel ── */}
        <div className="w-[355px] shrink-0 border-l border-[var(--shape-outline,rgba(0,0,0,0.1))] flex flex-col bg-white overflow-hidden">
          <div className="h-[48px] px-[16px] flex items-center shrink-0">
            <Tabs variant="secondary" tabs={[{ id: "assistant", label: "Assistant" }, { id: "sources", label: "Sources" }]} defaultTab="assistant" />
          </div>
          <div className="flex-1 overflow-y-auto px-[20px] py-[8px]">
            <p className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)] mb-[12px]" style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07' 1" }}>Get Started</p>
            <div className="flex flex-col gap-[12px]">
              {suggestions.map((s, i) => (
                <button key={i} className="flex items-center gap-[8px] h-[28px] px-[8px] bg-[var(--surface-2,#f2f2f2)] rounded-[8px] shrink-0 text-left hover:bg-[var(--surface-3,#ebebeb)] transition-colors">
                  <Icon name={s.icon} size={16} />
                  <span className="text-[13px] leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap" style={{ fontFamily: "Lato, sans-serif" }}>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="shrink-0 px-[20px] pt-[8px] pb-[24px]">
            <div className="flex items-center h-[48px] px-[12px] border border-[#8044ff] rounded-[6px]">
              <span className="flex-1 text-[15px] leading-[1.4] tracking-[0.15px] text-[var(--foreground-tertiary,#808080)]" style={{ fontFamily: "Lato, sans-serif" }}>Ask assistant</span>
              <IconButton icon={<Icon name="mic" size={20} filled />} size="medium" aria-label="Voice input" />
              <IconButton icon={<Icon name="send" size={20} filled />} size="medium" aria-label="Send" />
            </div>
          </div>
        </div>

        {/* ── Customize drawer ── */}
        {drawerOpen && (
          <>
            {/* Scrim — full-viewport blur overlay per DS */}
            <Overlay variant="blur" fixed className="z-[150] cursor-default" onClick={() => setDrawerOpen(false)} />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full md:w-[640px] z-[160] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.1)] flex flex-col">
              {/* Header */}
              <div className="flex items-center h-[52px] px-[16px] shrink-0">
                <p className="flex-1 text-[15px] font-bold leading-[1.2] tracking-[0.15px] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07' 1" }}>
                  Previsit Summary
                </p>
                <IconButton icon={<Icon name="close" size={16} />} variant="tertiary-neutral" size="small" aria-label="Close" onClick={() => setDrawerOpen(false)} />
              </div>

              {/* Section list */}
              <div ref={drawerListRef} className="flex-1 overflow-y-auto flex flex-col gap-[8px] px-[20px] py-[8px]">

                {/* ── Active sections ── */}
                {activeOrder.map((id, index) => {
                  const group = drawerGroups.find((g) => g.id === id);
                  if (!group) return null;
                  const isDragging = pointerDragId === id;
                  const activeChildren = getActiveChildren(group);
                  const showDivider = dropIndex === index && pointerDragId !== null && pointerDragId !== id;
                  return (
                    <React.Fragment key={id}>
                      {showDivider && <DragDivider />}
                      <div
                        data-drag-id={id}
                        className={[
                          "shrink-0 bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[6px] p-[4px] flex flex-col gap-[8px] transition-opacity",
                          isDragging ? "opacity-40" : "opacity-100",
                        ].join(" ")}
                      >
                        {/* Top-level row */}
                        <div className="flex items-center gap-[8px] h-[28px] px-[4px]">
                          <div
                            className="shrink-0 leading-[0] text-[var(--foreground-secondary,#666)] cursor-grab touch-none select-none"
                            onPointerDown={(e) => {
                              e.currentTarget.setPointerCapture(e.pointerId);
                              const card = drawerListRef.current?.querySelector(`[data-drag-id="${id}"]`) as HTMLElement;
                              if (card) {
                                const r = card.getBoundingClientRect();
                                sectionOffsetRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
                                setSectionGhost({ label: group.label, w: r.width, x: r.left, y: r.top });
                              }
                              setPointerDragId(id);
                              setDropIndex(activeOrder.indexOf(id));
                            }}
                            onPointerMove={(e) => {
                              if (pointerDragId !== id) return;
                              if (sectionGhostRef.current) {
                                sectionGhostRef.current.style.transform = `translate(${e.clientX - sectionOffsetRef.current.x}px, ${e.clientY - sectionOffsetRef.current.y}px)`;
                              }
                              if (!drawerListRef.current) return;
                              const cards = Array.from(drawerListRef.current.querySelectorAll('[data-drag-id]')) as HTMLElement[];
                              let newIdx = activeOrder.length;
                              for (let i = 0; i < cards.length; i++) {
                                const rect = cards[i].getBoundingClientRect();
                                if (e.clientY < rect.top + rect.height / 2) { newIdx = i; break; }
                              }
                              setDropIndex(newIdx);
                            }}
                            onPointerUp={() => {
                              setSectionGhost(null);
                              if (pointerDragId !== id || dropIndex === null) { setPointerDragId(null); setDropIndex(null); return; }
                              setOrder((prev) => {
                                const next = [...prev];
                                const from = next.indexOf(id);
                                next.splice(from, 1);
                                const to = dropIndex > from ? dropIndex - 1 : dropIndex;
                                next.splice(to, 0, id);
                                return next;
                              });
                              setPointerDragId(null);
                              setDropIndex(null);
                            }}
                            onPointerCancel={() => { setSectionGhost(null); setPointerDragId(null); setDropIndex(null); }}
                          >
                            <Icon name="drag_indicator" size={16} />
                          </div>
                          <span
                            className="flex-1 text-[13px] font-bold tracking-[0.13px] leading-[1.2] text-[var(--foreground-primary,#1a1a1a)] truncate"
                            style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07' 1" }}
                          >
                            {group.label}
                          </span>
                          {group.timeFrameKey && group.options ? (
                            <TimeFrameDropdown
                              value={timeFrames[group.timeFrameKey]}
                              options={group.options}
                              onChange={(v) => setTimeFrames((prev) => ({ ...prev, [group.timeFrameKey!]: v }))}
                            />
                          ) : group.fixedLabel ? (
                            <DisabledChip label={group.fixedLabel} />
                          ) : null}
                          <IconButton
                            icon={<Icon name="close" size={14} />}
                            variant="tertiary-neutral"
                            size="small"
                            aria-label="Remove section"
                            onClick={() => deleteSection(id)}
                          />
                        </div>

                        {/* Child rows — draggable within their section */}
                        {activeChildren.length > 0 && (
                          <div data-children-of={id} className="flex flex-col">
                            {activeChildren.map((child, ci) => {
                              const isSubDragging = subDragChildId === child.id;
                              const showSubDivider =
                                subDragParentId === id &&
                                subDropIndex === ci &&
                                subDragChildId !== null &&
                                subDragChildId !== child.id;
                              return (
                                <React.Fragment key={child.id}>
                                  {showSubDivider && <DragDivider />}
                                  <div
                                    data-child-id={child.id}
                                    className={[
                                      "group/child-row flex items-center gap-[8px] h-[28px] px-[4px] transition-opacity",
                                      isSubDragging ? "opacity-40" : "opacity-100",
                                    ].join(" ")}
                                  >
                                    {/* Sub-row drag handle — visible only on hover */}
                                    <div
                                      className="shrink-0 leading-[0] text-[var(--foreground-secondary,#666)] cursor-grab touch-none select-none opacity-0 group-hover/child-row:opacity-100 transition-opacity"
                                      onPointerDown={(e) => {
                                        e.currentTarget.setPointerCapture(e.pointerId);
                                        const row = e.currentTarget.closest('[data-child-id]') as HTMLElement;
                                        if (row) {
                                          const r = row.getBoundingClientRect();
                                          subOffsetRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
                                          setSubGhost({ label: child.label, w: r.width, x: r.left, y: r.top });
                                        }
                                        setSubDragChildId(child.id);
                                        setSubDragParentId(id);
                                        setSubDropIndex(ci);
                                      }}
                                      onPointerMove={(e) => {
                                        if (subDragChildId !== child.id) return;
                                        if (subGhostRef.current) {
                                          subGhostRef.current.style.transform = `translate(${e.clientX - subOffsetRef.current.x}px, ${e.clientY - subOffsetRef.current.y}px)`;
                                        }
                                        const container = drawerListRef.current?.querySelector(`[data-children-of="${id}"]`);
                                        if (!container) return;
                                        const childEls = Array.from(container.querySelectorAll('[data-child-id]')) as HTMLElement[];
                                        let newIdx = childEls.length;
                                        for (let i = 0; i < childEls.length; i++) {
                                          const rect = childEls[i].getBoundingClientRect();
                                          if (e.clientY < rect.top + rect.height / 2) { newIdx = i; break; }
                                        }
                                        setSubDropIndex(newIdx);
                                      }}
                                      onPointerUp={() => {
                                        setSubGhost(null);
                                        if (subDragChildId !== child.id || subDropIndex === null) {
                                          setSubDragChildId(null); setSubDragParentId(null); setSubDropIndex(null); return;
                                        }
                                        setChildOrder((prev) => {
                                          const g = drawerGroups.find((g) => g.id === id);
                                          if (!g?.children) return prev;
                                          const current = prev[id] ?? g.children.map((c) => c.id);
                                          const activeIds = current.filter((cid) => !deletedChildren.has(cid));
                                          const from = activeIds.indexOf(child.id);
                                          if (from === -1) return prev;
                                          const newActive = [...activeIds];
                                          newActive.splice(from, 1);
                                          const to = subDropIndex > from ? subDropIndex - 1 : subDropIndex;
                                          newActive.splice(to, 0, child.id);
                                          let activeIdx = 0;
                                          const result = current.map((cid) =>
                                            deletedChildren.has(cid) ? cid : newActive[activeIdx++]
                                          );
                                          return { ...prev, [id]: result };
                                        });
                                        setSubDragChildId(null); setSubDragParentId(null); setSubDropIndex(null);
                                      }}
                                      onPointerCancel={() => { setSubGhost(null); setSubDragChildId(null); setSubDragParentId(null); setSubDropIndex(null); }}
                                    >
                                      <Icon name="drag_indicator" size={16} />
                                    </div>
                                    <span
                                      className="flex-1 text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-secondary,#666)] truncate"
                                      style={{ fontFamily: "Lato, sans-serif" }}
                                    >
                                      {child.label}
                                    </span>
                                    {child.timeFrameKey && child.options ? (
                                      <TimeFrameDropdown
                                        value={timeFrames[child.timeFrameKey]}
                                        options={child.options}
                                        onChange={(v) => setTimeFrames((prev) => ({ ...prev, [child.timeFrameKey!]: v }))}
                                      />
                                    ) : child.fixedLabel ? (
                                      <DisabledChip label={child.fixedLabel} />
                                    ) : null}
                                    <IconButton
                                      icon={<Icon name="close" size={14} />}
                                      variant="tertiary-neutral"
                                      size="small"
                                      aria-label="Remove subsection"
                                      onClick={() => deleteChild(child.id)}
                                    />
                                  </div>
                                </React.Fragment>
                              );
                            })}
                            {/* End-of-list divider for sub-drag */}
                            {subDragParentId === id && subDropIndex === activeChildren.length && subDragChildId !== null && (
                              <DragDivider />
                            )}
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
                {dropIndex === activeOrder.length && pointerDragId !== null && <DragDivider />}

                {/* ── Divider + deleted sections ── */}
                {(deletedOrder.length > 0 || deletedChildren.size > 0) && (
                  <>
                    <div className="flex items-center gap-[8px] py-[4px]">
                      <div className="flex-1 h-px bg-[var(--shape-outline,rgba(0,0,0,0.1))]" />
                      <span className="text-[11px] leading-[1.2] text-[var(--foreground-secondary,#666)] whitespace-nowrap" style={{ fontFamily: "Lato, sans-serif" }}>
                        Not included
                      </span>
                      <div className="flex-1 h-px bg-[var(--shape-outline,rgba(0,0,0,0.1))]" />
                    </div>

                    {/* Deleted top-level sections */}
                    {deletedOrder.map((id) => {
                      const group = drawerGroups.find((g) => g.id === id);
                      if (!group) return null;
                      return (
                        <div key={id} className="shrink-0 bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[6px] p-[4px] flex flex-col gap-[8px] opacity-60">
                          <div className="flex items-center gap-[8px] h-[28px] px-[4px]">
                            <span
                              className="flex-1 text-[13px] font-bold tracking-[0.13px] leading-[1.2] text-[var(--foreground-secondary,#666)] truncate"
                              style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07' 1" }}
                            >
                              {group.label}
                            </span>
                            {group.timeFrameKey && group.options ? (
                              <DisabledChip label={timeFrames[group.timeFrameKey] ?? group.options[0]} />
                            ) : group.fixedLabel ? (
                              <DisabledChip label={group.fixedLabel} />
                            ) : null}
                            <Button variant="tertiary" size="small" onClick={() => restoreSection(id)}>Add</Button>
                          </div>
                          {group.children?.map((child) => (
                            <div key={child.id} className="flex items-center gap-[8px] h-[28px] pl-[20px] pr-[4px]">
                              <span
                                className="flex-1 text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-secondary,#666)] truncate"
                                style={{ fontFamily: "Lato, sans-serif" }}
                              >
                                {child.label}
                              </span>
                              {child.timeFrameKey && child.options ? (
                                <DisabledChip label={timeFrames[child.timeFrameKey] ?? child.options[0]} />
                              ) : child.fixedLabel ? (
                                <DisabledChip label={child.fixedLabel} />
                              ) : null}
                            </div>
                          ))}
                        </div>
                      );
                    })}

                    {/* Active sections with deleted children */}
                    {activeOrder.map((id) => {
                      const group = drawerGroups.find((g) => g.id === id);
                      if (!group?.children) return null;
                      const removedKids = group.children.filter((c) => deletedChildren.has(c.id));
                      if (removedKids.length === 0) return null;
                      return (
                        <div key={id} className="shrink-0 bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[6px] p-[4px] flex flex-col gap-[8px] opacity-60">
                          <div className="flex items-center h-[28px] px-[4px]">
                            <span
                              className="flex-1 text-[13px] font-bold tracking-[0.13px] leading-[1.2] text-[var(--foreground-secondary,#666)] truncate"
                              style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07' 1" }}
                            >
                              {group.label}
                            </span>
                          </div>
                          {removedKids.map((child) => (
                            <div key={child.id} className="flex items-center gap-[8px] h-[28px] pl-[20px] pr-[4px]">
                              <span
                                className="flex-1 text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-secondary,#666)] truncate"
                                style={{ fontFamily: "Lato, sans-serif" }}
                              >
                                {child.label}
                              </span>
                              {child.timeFrameKey && child.options ? (
                                <DisabledChip label={timeFrames[child.timeFrameKey] ?? child.options[0]} />
                              ) : child.fixedLabel ? (
                                <DisabledChip label={child.fixedLabel} />
                              ) : null}
                              <Button variant="tertiary" size="small" onClick={() => restoreChild(child.id)}>Add</Button>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="shrink-0 px-[16px] py-[12px] flex justify-end gap-[8px]">
                <Button variant="secondary" size="medium" onClick={() => setDrawerOpen(false)}>Cancel</Button>
                <Button variant="primary" size="medium" prefix={<Icon name="save" size={16} />}>Save</Button>
              </div>

              {/* ── Floating ghosts (fixed, follow cursor, bypass overflow clipping) ── */}
              {sectionGhost && (
                <div
                  ref={sectionGhostRef}
                  className="fixed top-0 left-0 z-[300] pointer-events-none"
                  style={{ width: sectionGhost.w, transform: `translate(${sectionGhost.x}px, ${sectionGhost.y}px)` }}
                >
                  <div className="bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[6px] p-[4px] flex items-center gap-[8px] h-[36px] px-[4px] shadow-[0_8px_28px_rgba(0,0,0,0.18)]">
                    <div className="shrink-0 leading-[0] text-[var(--foreground-secondary,#666)]">
                      <Icon name="drag_indicator" size={16} />
                    </div>
                    <span className="flex-1 text-[13px] font-bold tracking-[0.13px] leading-[1.2] text-[var(--foreground-primary,#1a1a1a)] truncate"
                      style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07' 1" }}>
                      {sectionGhost.label}
                    </span>
                  </div>
                </div>
              )}
              {subGhost && (
                <div
                  ref={subGhostRef}
                  className="fixed top-0 left-0 z-[300] pointer-events-none"
                  style={{ width: subGhost.w, transform: `translate(${subGhost.x}px, ${subGhost.y}px)` }}
                >
                  <div className="bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[6px] p-[4px] flex items-center gap-[8px] h-[28px] px-[4px] shadow-[0_4px_16px_rgba(0,0,0,0.14)]">
                    <div className="shrink-0 leading-[0] text-[var(--foreground-secondary,#666)]">
                      <Icon name="drag_indicator" size={16} />
                    </div>
                    <span className="flex-1 text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-secondary,#666)] truncate"
                      style={{ fontFamily: "Lato, sans-serif" }}>
                      {subGhost.label}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </VisitLayout>
  );
}
