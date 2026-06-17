import React from "react";
import { VersionSwitcher } from "@ds/ui";
import type { ScreenDef } from "@ds/ui";

import PrevisitFlow from "./screens/PrevisitFlow";

// The baseline is the full flow: Previsit → (Start Recording) → Recording →
// (End Visit) → Previsit. It renders full-screen; layouts respond to their
// own container width, so use the browser's responsive/device tools to test
// different breakpoints.
function Baseline() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <PrevisitFlow />
    </div>
  );
}

const screens: ScreenDef[] = [
  { round: "R1", direction: "Baseline", component: Baseline },
];

export default function App() {
  if (screens.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen font-sans text-[var(--foreground-secondary,#666)]">
        Add screens to App.tsx to get started.
      </div>
    );
  }
  return <VersionSwitcher screens={screens} />;
}
