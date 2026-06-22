import React from "react";

// Shared previsit content body — rendered both in the full Previsit screen
// and in the desktop recording side-panel's "Previsit" tab.

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
          className="text-[17px] font-bold leading-[1.2] tracking-[0.34px] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap"
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
      className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-secondary,#666)] mb-[4px]"
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

export function PrevisitContent() {
  return (
    <div className="flex w-full flex-col gap-[24px]">
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
  );
}
