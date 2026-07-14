import React, { useState } from "react";
import { VersionSwitcher } from "@ds/ui";
import type { ScreenDef } from "@ds/ui";
import NurseScribeApp from "./screens/NurseScribeApp";
import RecordingCuePage from "./screens/RecordingCuePage";
import R2NurseScribeApp from "./screens/R2NurseScribeApp";
import { RecordingContext, type RecordingInfo } from "./context/RecordingContext";

function NurseScribeScreen() {
  return <NurseScribeApp />;
}

const screens: ScreenDef[] = [
  { round: "R1", direction: "Review & Edit", component: NurseScribeScreen },
  { round: "R1", direction: "Recording Cue", component: RecordingCuePage },
  { round: "R2", direction: "Baseline", component: R2NurseScribeApp },
];

export default function App() {
  const [recording, setRecording] = useState<RecordingInfo | null>(null);

  return (
    <RecordingContext.Provider value={{ startRecording: (info) => setRecording(info) }}>
      {recording
        ? <RecordingCuePage patientName={recording.patientName} template={recording.template} visitType={recording.visitType} onEnd={() => setRecording(null)} />
        : <VersionSwitcher screens={screens} initialRound="R2" initialDirection="Baseline" />
      }
    </RecordingContext.Provider>
  );
}
