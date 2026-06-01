import React, { useState, useRef, useEffect } from "react";
import { Icon, IconButton, Button, Checkbox, Tabs, Menu, MenuItem } from "@ds/ui";
import { VisitLayout } from "../components/VisitLayout";

// ─── Section components ───────────────────────────────────────────────────────

type SectionProps = {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
};

function Section({ title, subtitle, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-[8px] w-full">
      <div className="flex items-center gap-[8px]">
        <span
          className="text-[17px] font-bold leading-[1.2] tracking-[0.34px] text-[var(--foreground-secondary,#666)] whitespace-nowrap"
          style={{ fontFeatureSettings: "'ss07' 1" }}
        >
          {title}
        </span>
        {subtitle && (
          <span className="text-[12px] leading-[1.2] text-[var(--foreground-secondary,#666)]">
            {subtitle}
          </span>
        )}
      </div>
      <div className="text-[15px] leading-[1.4] tracking-[0.15px] text-[var(--foreground-primary,#1a1a1a)]">
        {children}
      </div>
    </div>
  );
}

function SubHeader({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)] mb-[4px]"
      style={{ fontFeatureSettings: "'ss07' 1" }}
    >
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
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

export default function R1LFlipped() {
  const [consentChecked, setConsentChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

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
                      <MenuItem
                        icon={<Icon name="print" size={20} />}
                        label="Print Previsit"
                        onClick={() => setMenuOpen(false)}
                      />
                    </Menu>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Previsit content — scrollable */}
          <div className="flex-1 overflow-y-auto px-[20px] pb-[8px] pt-[8px]">
            <div className="flex flex-col gap-[24px] max-w-[800px]">

              <Section title="At a Glance">
                <div className="flex flex-col gap-[12px]">
                  <div>
                    <SubHeader>Stable baseline</SubHeader>
                    <BulletList items={[
                      "Highly complex 74M with 10+ active chronic conditions including CKD G4, HFrEF (EF 30–35%), T2DM, AF on anticoagulation, and moderate COPD. Frequent utilizer — 2 hospitalizations and 4 ED visits in the past 18 months.",
                      "Last hospitalized Oct 2025 for acute decompensated heart failure (7-day stay, IV diuresis); discharged with uptitrated furosemide. Prior admission Feb 2025 for hyperkalemia requiring telemetry monitoring.",
                    ]} />
                  </div>
                  <div>
                    <SubHeader>Current clinical picture</SubHeader>
                    <BulletList items={[
                      "Here today for routine follow-up and medication review. Patient reports increased lower extremity edema over the past 2 weeks and DOE with minimal exertion (walking room to room).",
                      "At last visit (Jan 9): stable post-discharge, weight down 11 lbs from admission peak, spironolactone held due to K+ 5.6, carvedilol uptitrated to 12.5 mg BID, HbA1c 8.9% — insulin reviewed with diabetes educator. Repeat BMP and BNP ordered for today.",
                    ]} />
                  </div>
                </div>
              </Section>

              <Section title="Today's Focus">
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
              </Section>

              <Section title="Vitals" subtitle="Today, 10:14am">
                <BulletList items={[
                  "BP: 158/96",
                  "O₂ Sat: 91% on room air",
                  "HR: 74 (irregular) | Temp: 98.2°F | RR: 20",
                  "Ht: 5'9\" | Wt: 214 lbs | BMI: 31.6",
                  "Weight at last visit (Jan 9): 206 lbs. Today +8 lbs in 8 weeks",
                ]} />
              </Section>

              <Section title="Active Problems">
                <BulletList items={[
                  "HFrEF, Severe (EF 30–35%): ischemic cardiomyopathy; NYHA Class III; recent ADHF admission Oct 2025",
                  "CKD, Stage G4 (eGFR 18–22): progressive over 3 years; nephrology co-managing; approaching ESRD planning threshold",
                  "T2DM, Uncontrolled: HbA1c 8.9%; on insulin glargine + metformin; dose adjustments ongoing",
                  "Atrial Fibrillation, Permanent: on apixaban; rate-controlled with carvedilol; last CHADS₂-VASc score 5",
                  "COPD, Moderate (GOLD II): FEV1 ~52% predicted; managed with dual bronchodilator + ICS",
                  "Hypertension, Stage 2: BP difficult to control in context of HF/CKD medication constraints",
                  "Anemia of Chronic Kidney Disease: Hgb trending 9.2–10.1; on darbepoetin alfa; iron studies suboptimal",
                  "Hyperkalemia, Recurrent: limits RAAS therapy; on patiromer; K+ unstable over past 6 months",
                  "Peripheral Artery Disease: ABI 0.62 (R), 0.71 (L); vascular surgery follow-up q6 months",
                  "OSA, Moderate-Severe: CPAP non-adherent; AHI 28 on last study (2024)",
                  "Depression: on sertraline; PHQ-9 score 11 at last screen (Oct 2025)",
                  "Gout: on allopurinol; 1 flare in past 12 months",
                ]} />
              </Section>

              <Section title="Lab Results">
                <div>
                  <SubHeader>Recent Labs (since last visit, Jan 9, 2026)</SubHeader>
                  <ul className="list-disc mb-[4px]">
                    {[
                      "BNP: 810 pg/mL [H], down from 1,240 at Oct admission peak, but re-elevated vs 740 at last visit; correlates with +8 lb weight gain",
                      "BMP, Potassium: 5.3 mEq/L [H], rising again vs 5.1 at last visit; spironolactone reintroduction on hold",
                      "BMP, Creatinine: 3.5 mg/dL [H], slight uptick from 3.4; consistent with CKD trajectory",
                      "BMP, eGFR: 17 mL/min/1.73m² [H], first time below 18; nephrology to be notified",
                      "BMP, Bicarbonate: 19 mEq/L [L], mild metabolic acidosis, new vs last draw",
                      "CBC, Hemoglobin: 9.4 g/dL [L], stable low; on darbepoetin",
                      "CBC, WBC: 7.2 K/µL [nl]",
                      "CBC, Platelets: 188 K/µL [nl]",
                      "HbA1c: 9.1% [H], worsening from 8.9% (Oct 2025); insulin dose review needed",
                      "TSH: 5.9 mIU/L [H], persists elevated from 6.8 (Nov 2025); hypothyroidism workup warranted",
                      "uACR: 680 mg/g [H], worsening from 610 (Oct 2025)",
                    ].map((item, i, arr) => (
                      <li key={i} className={`ms-[22.5px] ${i < arr.length - 1 ? "mb-0" : ""}`}>
                        <span className="leading-[1.4] text-[15px]">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <SubHeader>Historical trends and prior abnormals (18 months)</SubHeader>
                  <ul className="list-disc">
                    {[
                      "BNP: ↑ 880 (Feb 2025) → 1,240 (Oct 2025) → 740 (Jan 2026) → 810 (today), persistently elevated; re-trending up",
                      "Potassium: unstable, 5.6 (Feb 2025) → 4.9 (Jun 2025) → 5.4 (Oct 2025) → 5.1 (Jan 2026) → 5.3 (today); patiromer added, spironolactone held",
                      "eGFR: ↓ progressive, 24 (Sep 2024) → 21 (Mar 2025) → 19 (Oct 2025) → 18 (Jan 2026) → 17 (today)",
                      "HbA1c: ↑ 8.1% (Mar 2025) → 8.6% (Jul 2025) → 8.9% (Oct 2025) → 9.1% (today), worsening despite insulin adjustment",
                      "Hemoglobin: fluctuating 9.2–10.1 g/dL over 18 months; iron studies (Oct 2025): ferritin 68, TSAT 16%, suboptimal for ESA therapy; IV iron discussed",
                      "uACR: ↑ 480 → 610 → 680 mg/g over 12 months, progressive albuminuria",
                      "TSH: mildly elevated since Nov 2025 (6.8 → 5.9), not yet treated",
                      "Uric acid: 8.4 mg/dL (Jul 2025), elevated despite allopurinol; dose review warranted",
                    ].map((item, i, arr) => (
                      <li key={i} className={`ms-[22.5px] ${i < arr.length - 1 ? "mb-0" : ""}`}>
                        <span className="leading-[1.4] text-[15px]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Section>

              <Section title="Imaging & Diagnostics">
                <div>
                  <SubHeader>Recent Imaging Results (since last visit, Jan 9, 2026)</SubHeader>
                  <ul className="list-disc mb-[4px]">
                    <li className="ms-[22.5px]">
                      <span className="leading-[1.4] text-[15px]">No new imaging since last visit.</span>
                    </li>
                  </ul>
                  <SubHeader>Historical findings and prior abnormals (18 months)</SubHeader>
                  <ul className="list-disc">
                    {[
                      "Echocardiogram (Nov 2025): EF 30–35%, down from 40% (2022). Moderate MR, new since prior echo. RVSP 48 mmHg, suggesting pulmonary hypertension. LV dilation present.",
                      "Chest X-ray (Oct 2025): pulmonary vascular congestion, small bilateral pleural effusions during ADHF admission; resolved on discharge film.",
                      "Renal ultrasound (Aug 2025): bilateral small echogenic kidneys (R: 9.1 cm, L: 9.4 cm), consistent with chronic parenchymal disease. No obstruction.",
                      "Lower extremity arterial duplex (Jun 2025): severe stenosis R SFA; moderate stenosis L popliteal. Referred to vascular surgery.",
                      "Spirometry (Mar 2025): FEV1 52% predicted, FEV1/FVC 0.64. Stable vs 2023.",
                      "Nuclear stress test (2023): fixed inferior wall defect, prior MI; no new ischemia.",
                    ].map((item, i, arr) => (
                      <li key={i} className={`ms-[22.5px] ${i < arr.length - 1 ? "mb-0" : ""}`}>
                        <span className="leading-[1.4] text-[15px]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Section>

              <Section title="Historical Procedures">
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
              </Section>

              <Section title="Active Meds">
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
              </Section>

              <Section title="Allergies">
                <BulletList items={[
                  "Ibuprofen/NSAIDs (HIGH): acute kidney injury (2020)",
                  "Contrast dye (MODERATE): urticaria; premedication protocol required for future contrast studies",
                  "Lisinopril (MODERATE): severe dry cough, angioedema episode (2018)",
                  "Sulfa drugs (LOW): rash",
                ]} />
              </Section>

              <Section title="Social History">
                <BulletList items={[
                  "Lives with wife in a single-story home in Sacramento, CA. Retired electrician. Two adult children nearby; wife is primary caregiver.",
                  "Former smoker: 45 pack-years, quit 2005. Occasional alcohol, 2–3 drinks/week. No illicit drug use.",
                  "Severely limited functional status — ADL-dependent for bathing and dressing due to dyspnea and lower extremity weakness. Uses walker. No longer drives.",
                  "Wife reports significant caregiver burden; social work referral placed Jan 2026.",
                  "Depression screening positive (PHQ-9: 11). Patient attributes low mood to loss of independence.",
                ]} />
              </Section>

            </div>
          </div>

          {/* Sticky bottom bar */}
          <div className="shrink-0 bg-white border-t border-[var(--shape-outline,rgba(0,0,0,0.1))] flex items-center gap-[16px] px-[20px] pt-[8px] pb-[24px]">
            {/* Visit info selectors */}
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
            {/* Patient consent */}
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
            {/* Start Recording */}
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
          {/* Tab header */}
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

          {/* Suggestion chips — scrollable */}
          <div className="flex-1 overflow-y-auto px-[20px] py-[8px]">
            <p
              className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)] mb-[4px]"
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

          {/* Chat input */}
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
