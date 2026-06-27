import React from "react"; // v1
import { VersionSwitcher } from "@ds/ui";
import type { ScreenDef } from "@ds/ui";
import R1Baseline  from "./screens/R1-Baseline";
import R1CoChip    from "./screens/R1-CoChip";
import R1CoTitle   from "./screens/R1-CoTitle";
import R1EditMode  from "./screens/R1-EditMode";
import R1DateNotes from "./screens/R1-DateNotes";
import R2Baseline   from "./screens/R2-Baseline";
import R2CheckCodes from "./screens/R2-CheckCodes";
import R2MultiCode  from "./screens/R2-MultiCode";
import R2Citation   from "./screens/R2-Citation";
import R2TitleM     from "./screens/R2-TitleM";
import R3Baseline   from "./screens/R3-Baseline";
import R3GroupByDx  from "./screens/R3-GroupByDx";
import R3Merge      from "./screens/R3-Merge";
import R3DxA        from "./screens/R3-DxA";
import R3DxC        from "./screens/R3-DxC";

const screens: ScreenDef[] = [
  { round: "R1", direction: "Baseline",   component: R1Baseline },
  { round: "R1", direction: "Co. Chip",   component: R1CoChip },
  { round: "R1", direction: "Co. Title",  component: R1CoTitle },
  { round: "R1", direction: "Edit Mode",  component: R1EditMode },
  { round: "R1", direction: "Date&Notes", component: R1DateNotes },
  { round: "R2", direction: "Baseline",    component: R2Baseline },
  { round: "R2", direction: "Multi-code",  component: R2MultiCode },
  { round: "R2", direction: "Check codes", component: R2CheckCodes },
  { round: "R2", direction: "Citation",    component: R2Citation },
  { round: "R2", direction: "Title M",     component: R2TitleM },
  { round: "R3", direction: "Baseline",    component: R3Baseline },
  { round: "R3", direction: "Group by Dx",   component: R3GroupByDx },
  { round: "R3", direction: "Merge",        component: R3Merge },
  { round: "R3", direction: "Two zones",    component: R3DxA },
  { round: "R3", direction: "Conf. tiers",  component: R3DxC },
];

export default function App() {
  return <VersionSwitcher screens={screens} initialDirection="Conf. tiers" />;
}
