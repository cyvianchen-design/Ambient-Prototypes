import React from "react";
import { Button, Icon } from "@ds/ui";
import type { TemplateSection } from "../templateData";

type Props = {
  templateName: string;
};

// Canned preview body per subsection id — keeps the rendered note realistic
// while the structure (order, titles, which subsections show) is driven by state.
const PREVIEW_BODY: Record<string, React.ReactNode> = {
  summary: (
    <>
      <p className="mb-[12px]">Chief Complaint: chest pain — "My chest is suddenly hurting a lot so I want to get it checked out."</p>
      <p>The patient is a 67 year-old male with a history of HTN, HLD, and T2DM presenting to the ED for chest pain. Onset approximately 2 hours prior to arrival, sudden, substernal, pressure-like, 7/10 in severity, radiating to the left jaw and left arm. Associated with diaphoresis and mild dyspnea. Denies palpitations, syncope, nausea, vomiting, or pleuritic chest pain.</p>
    </>
  ),
  pmh: <ul className="list-disc pl-[22px]"><li>HTN</li><li>HLD</li><li>T2DM</li></ul>,
  "surgical-history": <ul className="list-disc pl-[22px]"><li>Appendectomy (remote)</li></ul>,
  "social-history": <ul className="list-disc pl-[22px]"><li>Former smoker, 20 pack-year history, quit 10 years ago</li><li>Denies alcohol, illicit drug use</li></ul>,
  "family-history": <ul className="list-disc pl-[22px]"><li>Father: MI at age 58</li></ul>,
  "ros-main": <p>Respiratory: Reports dyspnea, productive cough, increased albuterol use. No hemoptysis, wheezing. Constitutional: Reports fatigue, subjective fever. Cardiovascular: No chest pain, palpitations, lower extremity edema. GI: No nausea, vomiting, diarrhea. Neuro: No dizziness, headache, confusion.</p>,
  "pe-main": <p>Constitutional: Mild distress, diaphoretic. Respiratory: Decreased breath sounds bilaterally at bases; expiratory wheezes diffusely; accessory muscle use present. Cardiovascular: Regular rate and rhythm; no murmurs, rubs, or gallops; no JVD. Extremities: No peripheral edema; no cyanosis.</p>,
  "mdm-main": <p>67-year-old male with clinical picture concerning for acute coronary syndrome. Serial troponins and ECGs ordered; started on aspirin and heparin per protocol. Cardiology consulted. Monitoring on telemetry.</p>,
};

const SCRIBE_PREVIEW_SUMMARIES: Record<string, string> = {
  "scribe-1": "The patient presents with acute substernal chest pressure beginning this afternoon, associated with mild shortness of breath and diaphoresis. Symptoms improve with rest. Denies syncope, fever, or pleuritic pain.",
  "scribe-2": "The patient returns for follow-up and reports overall improvement since the previous visit. Medications are well tolerated, with no new adverse effects or acute concerns.",
  "scribe-3": "The patient presents with worsening shortness of breath over three days, most noticeable with exertion. Reports intermittent dry cough and fatigue. Denies chest pain or lower-extremity swelling.",
  "scribe-4": "The patient presents with intermittent lower abdominal discomfort beginning yesterday. Reports decreased appetite without vomiting, fever, or urinary symptoms.",
  "scribe-5": "The patient presents for medication review. Current medications, adherence, and potential side effects were discussed, with no urgent concerns identified.",
  "scribe-6": "The patient presents for an annual wellness visit. Preventive screenings, immunizations, functional status, and health maintenance priorities were reviewed.",
  "scribe-7": "The patient reports recurrent headaches over the past week without focal neurologic symptoms, vision loss, fever, or recent trauma.",
  "scribe-8": "The patient returns for postoperative follow-up and reports expected improvement in pain and mobility. Denies fever, drainage, or other wound concerns.",
  "scribe-9": "The patient presents with lower back pain after increased activity. Pain is worse with movement and without weakness, numbness, or bowel or bladder changes.",
  "scribe-10": "The patient presents for diabetes follow-up. Home glucose trends, medication adherence, nutrition, and activity goals were reviewed.",
  "scribe-11": "The patient presents with a persistent cough and congestion. Denies significant dyspnea, chest pain, hemoptysis, or prolonged fever.",
  "scribe-12": "The patient presents to review recent laboratory results. Findings and recommended follow-up were discussed, with no acute symptoms reported.",
};

function bodyFor(sub: { id: string; templateInstruction: string }, previewSourceId: string): React.ReactNode {
  const scribeSummary = SCRIBE_PREVIEW_SUMMARIES[previewSourceId];
  if (scribeSummary && sub.id === "summary") return <p>{scribeSummary}</p>;
  return PREVIEW_BODY[sub.id] ?? <p className="italic text-[#6b7280]">{sub.templateInstruction || "Generated content will appear here."}</p>;
}

// State-driven preview: reflects subsection order, Title toggle, and disabled status.
export function DynamicPreviewSections({ sections, previewSourceId = "example" }: { sections: TemplateSection[]; previewSourceId?: string }) {
  return (
    <div className="flex flex-col gap-[16px]" style={{ fontFamily: "Lato, sans-serif" }}>
      {sections.map((sec) => {
        const visible = sec.subsections.filter((s) => s.status !== "disabled");
        if (visible.length === 0) return null;
        return (
          <div key={sec.id} className="flex flex-col gap-[8px]">
            <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFeatureSettings: "'ss07'" }}>{sec.name}</span>
            <div className="text-[var(--foreground-primary,#1a1a1a)] text-[15px] leading-[1.5] flex flex-col gap-[8px]">
              {visible.map((sub) => (
                <div key={sub.id}>
                  {sub.showTitle && <p className="t-body-md mb-[2px]">{sub.name}</p>}
                  {bodyFor(sub, previewSourceId)}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PreviewNoteSections() {
  return (
          <div className="flex flex-col gap-[16px]" style={{ fontFamily: "Lato, sans-serif" }}>
            {/* HPI */}
            <div>
              <div className="h-[28px] flex items-center pl-[8px]">
                <span className="text-[13px] font-bold tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFeatureSettings: "'ss07'" }}>HPI</span>
              </div>
              <div className="p-[8px] rounded-[6px] text-[#111827] text-[15px] leading-[1.4]">
                <p className="mb-[12px]">Chief Complaint: chest pain — "My chest is suddenly hurting a lot so I want to get it checked out."</p>
                <p className="mb-[12px]">The patient is a 67 year-old male with a history of HTN, HLD, and T2DM presenting to the ED for chest pain. Onset approximately 2 hours prior to arrival, sudden, substernal, pressure-like, 7/10 in severity, radiating to the left jaw and left arm. Associated with diaphoresis and mild dyspnea. Denies prior similar episodes. Reports compliance with home medications. Denies palpitations, syncope, near-syncope, nausea, vomiting, or pleuritic chest pain.</p>
                <p className="mb-[8px]">PMH:</p>
                <ul className="list-disc pl-[22px] mb-[8px]"><li>HTN</li><li>HLD</li><li>T2DM</li></ul>
                <p className="mb-[8px]">Surgical History:</p>
                <ul className="list-disc pl-[22px] mb-[8px]"><li>Appendectomy (remote)</li></ul>
                <p className="mb-[8px]">Social History:</p>
                <ul className="list-disc pl-[22px] mb-[8px]"><li>Former smoker, 20 pack-year history, quit 10 years ago</li><li>Denies alcohol, illicit drug use</li></ul>
                <p className="mb-[8px]">Family History:</p>
                <ul className="list-disc pl-[22px] mb-[8px]"><li>Father: MI at age 58</li></ul>
                <p className="mb-[8px]">Medications:</p>
                <ul className="list-disc pl-[22px] mb-[8px]">
                  <li>Lisinopril 10 mg po daily</li><li>Atorvastatin 40 mg po daily</li>
                  <li>Metformin 1000 mg po bid</li><li>Aspirin 81 mg po daily</li>
                </ul>
                <p>Primary Care Provider: Dr. Susan Park</p>
              </div>
            </div>

            {/* ROS */}
            <div>
              <div className="h-[28px] flex items-center pl-[8px]">
                <span className="text-[13px] font-bold tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFeatureSettings: "'ss07'" }}>ROS</span>
              </div>
              <div className="p-[8px] rounded-[6px]">
                <p className="text-[#111827] text-[15px] leading-[1.4]">Respiratory: Reports dyspnea, productive cough, increased albuterol use. No hemoptysis, wheezing. Constitutional: Reports fatigue, subjective fever. No chills, weight loss. Cardiovascular: No chest pain, palpitations, lower extremity edema. GI: No nausea, vomiting, diarrhea. Neuro: No dizziness, headache, confusion.</p>
              </div>
            </div>

            {/* PE */}
            <div>
              <div className="h-[28px] flex items-center pl-[8px]">
                <span className="text-[13px] font-bold tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFeatureSettings: "'ss07'" }}>PE</span>
              </div>
              <div className="p-[8px] rounded-[6px]">
                <p className="text-[#111827] text-[15px] leading-[1.4]">Constitutional: Mild distress, diaphoretic. Respiratory: Decreased breath sounds bilaterally at bases; expiratory wheezes diffusely; accessory muscle use present; no stridor. Cardiovascular: Regular rate and rhythm; no murmurs, rubs, or gallops; no JVD. Extremities: No peripheral edema; no cyanosis.</p>
              </div>
            </div>

            {/* MDM */}
            <div>
              <div className="h-[28px] flex items-center pl-[8px]">
                <span className="text-[13px] font-bold tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFeatureSettings: "'ss07'" }}>MDM</span>
              </div>
              <div className="p-[8px] rounded-[6px]">
                <p className="text-[#111827] text-[15px] leading-[1.4]">62-year-old male with known COPD presenting with clinical picture consistent with acute exacerbation, likely infectious given purulent sputum and recent sick contact. CXR ordered to evaluate for pneumonia; sputum culture sent. Started on systemic corticosteroids and azithromycin given severity of presentation. Albuterol nebulization initiated in department. Monitoring O2 saturation closely given home readings in low 90s; supplemental O2 applied to maintain &gt;92%.</p>
              </div>
            </div>
          </div>
  );
}

export function LivePreviewPanel({ templateName }: Props) {
  return (
    <div className="flex flex-col h-full overflow-hidden pt-[32px] px-[20px] flex-1 min-w-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div
          className="border-gradient-brand rounded-[12px] p-[16px] flex flex-col gap-[16px] mb-[16px]"
          style={{ boxShadow: "0px 4px 16px 2px rgba(0,0,0,0.07)", fontFamily: "Lato, sans-serif" }}
        >
          <div className="px-[8px]">
            <span className="text-[17px] font-bold tracking-[0.34px] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFeatureSettings: "'ss07'" }}>
              {templateName} (Preview)
            </span>
          </div>
          <PreviewNoteSections />
        </div>
      </div>

      <div className="shrink-0 pb-[24px] pt-[8px] flex justify-end">
        <Button variant="primary" size="large" prefix={<Icon name="save" size={20} />}>
          Save Template
        </Button>
      </div>
    </div>
  );
}
