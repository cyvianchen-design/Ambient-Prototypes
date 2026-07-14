import React from "react";
import { Citation, Chip } from "@ds/ui";

function Section({ title, stamp, children }: { title: string; stamp?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[8px] w-full">
      <div className="flex items-center gap-[8px]">
        <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">{title}</span>
        {stamp && <Chip label={stamp} color="neutral" size="XS" disabled />}
      </div>
      <div className="t-body-md text-[var(--foreground-primary,#1a1a1a)]">{children}</div>
    </div>
  );
}

const Bullets = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="list-disc pl-[18px] flex flex-col gap-[4px]">
    {items.map((it, i) => <li key={i}>{it}</li>)}
  </ul>
);

// Small labeled row for status-style facts (code status, isolation, etc.)
const Fact = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex gap-[8px]">
    <span className="t-body-md text-[var(--foreground-secondary,#666)] w-[132px] shrink-0">{label}</span>
    <span className="t-body-md text-[var(--foreground-primary,#1a1a1a)] flex-1">{children}</span>
  </div>
);

export type PrevisitPatient = { name: string; age: number; gender: string; diagnosis: string; room: string };

// Nurse-focused P360 patient story for a hospitalized patient.
// Prioritizes what a nurse needs at handoff: precautions, LDAs, mobility/fall risk,
// pain, skin, diet/elimination, and pending tasks — with clinical context below.
export function PrevisitContent({ patient }: { patient: PrevisitPatient }) {
  const dx = patient.diagnosis.toLowerCase();
  const she = patient.gender === "F" ? "she" : "he";
  return (
    <div className="flex flex-col gap-[20px] max-w-[720px]">
      <Section title="At a glance" stamp="Current">
        <p className="m-0">
          {patient.age}-year-old {patient.gender === "F" ? "female" : "male"}, hospital day 2 for {dx} (s/p ORIF), in {patient.room}. Stable this shift, full code, high fall risk.
          <Citation n={1} quote={`Admitted 6/21 for ${patient.diagnosis}, s/p ORIF. Full code. Fall risk: high.`} source="Jun 21, 20:00 · Admission note" />
        </p>
      </Section>

      <Section title="Alerts & precautions">
        <div className="flex flex-col gap-[6px]">
          <Fact label="Code status">Full code</Fact>
          <Fact label="Isolation">None</Fact>
          <Fact label="Fall risk">High — bed alarm on, non-slip socks, call light in reach</Fact>
          <Fact label="Allergies">NKDA</Fact>
          <Fact label="VTE prophylaxis">Enoxaparin 40 mg SC daily</Fact>
        </div>
      </Section>

      <Section title="Pending this shift" stamp="This shift">
        <Bullets
          items={[
            "Enoxaparin 40 mg SC due 20:00",
            "Surgical incision dressing change",
            "PT ambulation trial + document distance/assist",
            "Strict intake & output",
            "Reassess pain after PT",
          ]}
        />
      </Section>

      <Section title="Lines, drains & airways">
        <Bullets
          items={[
            "PIV ×1 — 20g right forearm, placed 6/21, patent",
            "No central line, no surgical drain",
            "No urinary catheter — voiding independently",
            "Room air, no supplemental O₂",
          ]}
        />
      </Section>

      <Section title="Activity & mobility">
        <Bullets
          items={[
            <>Weight-bearing as tolerated on operative leg; ambulate with walker + 1 assist
              <Citation n={2} quote="WBAT operative leg, no ROM restrictions. Ambulate with front-wheel walker and 1-person assist." source="Jun 22, 10:00 · Orthopedics note" />
            </>,
            "Up to chair for meals; fall precautions in place",
          ]}
        />
      </Section>

      <Section title="Pain">
        <Bullets items={["4/10 at rest, 6/10 with movement — right hip incision", "Scheduled acetaminophen 650 mg q6h + PRN oxycodone 5 mg; last dose 12:00"]} />
      </Section>

      <Section title="Skin & wounds">
        <Bullets items={["Right hip surgical incision — dressing clean, dry, intact", "Braden 18 (mild risk); reposition q2h, heels floated"]} />
      </Section>

      <Section title="Diet & elimination">
        <Bullets items={["Regular diet, tolerating well", "Last BM 6/21; voiding without difficulty; I/O balanced"]} />
      </Section>

      <Section title="Recent vitals" stamp="Last recorded Jun 22, 14:32">
        <Bullets items={["BP 132/80 · HR 78 · RR 16 · Temp 98.6°F · SpO₂ 98% RA", "Trending stable this shift — no MEWS escalation"]} />
      </Section>

      <Section title="Active problems">
        <Bullets items={[`${patient.diagnosis} — s/p ORIF, post-op day 1`, "Hypertension — controlled", "Osteoporosis"]} />
      </Section>

      <Section title="Active medications">
        <Bullets items={["Enoxaparin 40 mg SC daily", "Acetaminophen 650 mg PO q6h", "Oxycodone 5 mg PO q6h PRN", "Lisinopril 10 mg PO daily"]} />
      </Section>

      <Section title="Lab results" stamp="Drawn Jun 22, 06:00">
        <Bullets
          items={[
            <>Hgb 10.4 (down from 11.8 pre-op) — stable, no active bleeding
              <Citation n={3} quote="Hgb 10.4 g/dL, stable post-op. No transfusion indicated." source="Jun 22, 06:00 · Lab results" />
            </>,
            "BMP within normal limits · INR 1.1",
          ]}
        />
      </Section>

      <Section title="Imaging & diagnostics" stamp="Jun 22, 09:15">
        <Bullets items={["Post-op hip X-ray: hardware well-positioned, no acute complication", "ECG: normal sinus rhythm"]} />
      </Section>

      <Section title="Hospitalist & specialist notes">
        <Bullets
          items={[
            <>Hospitalist: stable post-op course; continue current management, target discharge in 24–48h pending PT.
              <Citation n={4} quote="POD 1, tolerating PT, pain controlled. Continue enoxaparin, advance activity, target discharge home with PT." source="Jun 22, 11:30 · Hospitalist progress note" />
            </>,
            "Orthopedics: hardware stable, WBAT, follow up in clinic in 2 weeks",
          ]}
        />
      </Section>

      <Section title="Discharge planning">
        <Bullets items={["Anticipated discharge home in 24–48h once PT clears", "Lives with spouse, independent at baseline; home PT to be arranged"]} />
      </Section>
    </div>
  );
}
