import React from "react";
import { VersionSwitcher } from "@ds/ui";
import type { ScreenDef } from "@ds/ui";

import R1Baseline from "./screens/R1-Baseline";
import R1TitleM from "./screens/R1-TitleM";
import R1MFlipped from "./screens/R1-MFlipped";
import R1MAccent from "./screens/R1-MAccent";
import R1TitleL from "./screens/R1-TitleL";
import R1LFlipped from "./screens/R1-LFlipped";
import R2DragDrop from "./screens/R2-DragDrop";
import R2CustomizeDrawer from "./screens/R2-CustomizeDrawer";

const screens: ScreenDef[] = [
  { round: "R1", direction: "Baseline", component: R1Baseline },
  { round: "R1", direction: "Title M", component: R1TitleM },
  { round: "R1", direction: "M Flipped", component: R1MFlipped },
  { round: "R1", direction: "M Accent", component: R1MAccent },
  { round: "R1", direction: "Title L", component: R1TitleL },
  { round: "R1", direction: "L Flipped", component: R1LFlipped },
  { round: "R2", direction: "Drag & Drop", component: R2DragDrop },
  { round: "R2", direction: "Customize Drawer", component: R2CustomizeDrawer },
];

export default function App() {
  if (screens.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen font-sans text-[var(--foreground-secondary,#666)]">
        Add screens to App.tsx to get started.
      </div>
    );
  }
  return <VersionSwitcher screens={screens} initialRound="R1" initialDirection="Title L" />;
}
