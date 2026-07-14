import React, { useState } from "react";
import { PrimaryNav, Icon, MagicDocument, MagicEdit, MagicButton } from "@ds/ui";
import { NurseScribeLogo } from "../components/NurseScribeLogo";
import { FeedbackIcon } from "../components/FeedbackIcon";
import R2VisitsPage from "./R2VisitsPage";
import R2ScribesPage from "./R2ScribesPage";
import R2ScribeDetailPage from "./R2ScribeDetailPage";
import R2RecordingCuePage from "./R2RecordingCuePage";
import { RecordingContext, type RecordingInfo } from "../context/RecordingContext";

type Page = "visits" | "scribes" | "detail";

export default function R2NurseScribeApp() {
  const [page, setPage] = useState<Page>("visits");
  const [selectedScribeId, setSelectedScribeId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [recording, setRecording] = useState<RecordingInfo | null>(null);

  function handleNav(id: string) {
    if (id === "visits") setPage("visits");
    // Scribes lands directly on the most recent note of the first patient
    // (sentinel — the detail view resolves it to its own default).
    if (id === "scribes") { setSelectedScribeId("__recent__"); setPage("detail"); }
  }

  function handleSelectScribe(id: string, template: string) {
    setSelectedScribeId(id);
    setSelectedTemplate(template);
    setPage("detail");
  }

  // Self-contained recording overlay — no App-level context needed for R2.
  if (recording) {
    return (
      <R2RecordingCuePage
        patientName={recording.patientName}
        template={recording.template}
        visitType={recording.visitType}
        onEnd={() => setRecording(null)}
      />
    );
  }

  return (
    <RecordingContext.Provider value={{ startRecording: (info) => setRecording(info) }}>
      <div className="flex h-screen overflow-hidden bg-white">
        <PrimaryNav
          onItemClick={handleNav}
          logo={<NurseScribeLogo size={36} />}
          items={[
            { id: "visits",    label: "Patients",  icon: <Icon name="stethoscope" size={20} filled />, isActive: page === "visits" },
            { id: "scribes",   label: "Scribes",   icon: <MagicDocument size={20} />,                  isActive: page !== "visits" },
            { id: "customize", label: "Customize", icon: <MagicEdit size={20} />,                      isActive: false },
            { id: "assistant", label: "Assistant", icon: <MagicButton size={20} />,                    isActive: false },
            { id: "admin",     label: "Admin",     icon: <Icon name="analytics" size={20} filled />,   isActive: false },
          ]}
          bottomItems={[
            { id: "help", label: "Help", icon: <Icon name="help" size={20} /> },
            { id: "settings", label: "Feedback", icon: <FeedbackIcon size={20} color="var(--foreground-secondary,#666)" /> },
          ]}
        />
        {page === "visits" && <R2VisitsPage />}
        {page === "scribes" && <R2ScribesPage onSelectScribe={handleSelectScribe} />}
        {page === "detail" && selectedScribeId && (
          <R2ScribeDetailPage scribeId={selectedScribeId} template={selectedTemplate} onRecordNew={() => setPage("scribes")} />
        )}
      </div>
    </RecordingContext.Provider>
  );
}
