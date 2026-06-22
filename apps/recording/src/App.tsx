import React from "react";
import { VersionSwitcher } from "@ds/ui";
import type { ScreenDef } from "@ds/ui";

import PrevisitFlow from "./screens/PrevisitFlow";
import MultiPanelFlow from "./screens/MultiPanelFlow";

// Full flows render full-screen; layouts respond to their own container width,
// so use the browser's responsive/device tools to test breakpoints.
function Baseline() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <PrevisitFlow />
    </div>
  );
}

function MultiPanel() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <MultiPanelFlow />
    </div>
  );
}

const screens: ScreenDef[] = [
  { round: "R1", direction: "Baseline", component: Baseline },
  { round: "R1", direction: "Multi-panel", component: MultiPanel },
];

export default function App() {
  if (screens.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen font-sans text-[var(--foreground-secondary,#666)]">
        Add screens to App.tsx to get started.
      </div>
    );
  }
  return <VersionSwitcher screens={screens} initialRound="R1" initialDirection="Multi-panel" />;
}
