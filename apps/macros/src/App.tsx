import React from "react";
import { VersionSwitcher } from "@ds/ui";
import type { ScreenDef } from "@ds/ui";

// Import your screens here
// import R1Baseline from "./screens/R1-Baseline";

// Define rounds and directions — the switcher copy is whatever you put here
const screens: ScreenDef[] = [
  // { round: "R1", direction: "Baseline", component: R1Baseline },
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
