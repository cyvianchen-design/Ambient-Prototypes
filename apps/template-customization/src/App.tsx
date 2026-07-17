import React from "react";
import { VersionSwitcher } from "@ds/ui";
import type { ScreenDef } from "@ds/ui";
import R1Baseline from "./screens/R1-Baseline";
import R1Flat from "./screens/R1-Flat";
import R1MasterDetail from "./screens/R1-MasterDetail";
import R1MasterFlat from "./screens/R1-MasterFlat";
import R1WithAssistant from "./screens/R1-WithAssistant";
import R1ThreePanel from "./screens/R1-ThreePanel";
import R2Baseline from "./screens/R2-Baseline";
import R2Outlined from "./screens/R2-Outlined";
import R2Inline from "./screens/R2-Inline";
import R2TwoStep from "./screens/R2-TwoStep";

const screens: ScreenDef[] = [
  { round: "R1", direction: "Baseline", component: R1Baseline },
  { round: "R1", direction: "Flat", component: R1Flat },
  { round: "R1", direction: "Master-Detail", component: R1MasterDetail },
  { round: "R1", direction: "Master - Flat", component: R1MasterFlat },
  { round: "R1", direction: "w/ Assistant", component: R1WithAssistant },
  { round: "R1", direction: "3-panel", component: R1ThreePanel },
  { round: "R2", direction: "Baseline", component: R2Baseline },
  { round: "R2", direction: "Outlined", component: R2Outlined },
  { round: "R2", direction: "Inline", component: R2Inline },
  { round: "R2", direction: "Two-step", component: R2TwoStep },
];

export default function App() {
  return <VersionSwitcher screens={screens} initialRound="R2" />;
}
