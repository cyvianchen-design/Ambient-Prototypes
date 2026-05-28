import React from "react"; // v1
import { VersionSwitcher } from "@ds/ui";
import type { ScreenDef } from "@ds/ui";
import R1Baseline  from "./screens/R1-Baseline";
import R1CoChip    from "./screens/R1-CoChip";
import R1CoTitle   from "./screens/R1-CoTitle";
import R1EditMode  from "./screens/R1-EditMode";
import R2Cards     from "./screens/R2-Cards";
import R2CoChip    from "./screens/R2-CoChip";
import R2MultiCode  from "./screens/R2-MultiCode";

const screens: ScreenDef[] = [
  { round: "R1", direction: "Baseline",   component: R1Baseline },
  { round: "R1", direction: "Co. Chip",   component: R1CoChip },
  { round: "R1", direction: "Co. Title",  component: R1CoTitle },
  { round: "R1", direction: "Edit Mode",  component: R1EditMode },
  { round: "R1", direction: "Date&Notes", component: R2Cards },
  { round: "R2", direction: "Baseline",   component: R2CoChip },
  { round: "R2", direction: "Multi-code", component: R2MultiCode },
];

export default function App() {
  return <VersionSwitcher screens={screens} />;
}
