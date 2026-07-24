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
import R2ClickEdit from "./screens/R2-ClickEdit";
import R2FilterTokens from "./screens/R2-FilterTokens";
import R3Baseline from "./screens/R3-Baseline";
import R3Table from "./screens/R3-Table";
import R3InlineDots from "./screens/R3-InlineDots";
import R3Inline from "./screens/R3-Inline";
import R3InlineChips from "./screens/R3-InlineChips";
import R3NewChips from "./screens/R3-NewChips";
import R3SChips from "./screens/R3-SChips";
import R3AccentChips from "./screens/R3-AccentChips";
import MVPBaseline from "./screens/MVP-Baseline";
import MVPSnackbar from "./screens/MVP-Snackbar";
import MVPHeaderRefresh from "./screens/MVP-HeaderRefresh";
import MVPStickyRefresh from "./screens/MVP-StickyRefresh";

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
  { round: "R2", direction: "Click-edit", component: R2ClickEdit },
  { round: "R2", direction: "Filter tokens", component: R2FilterTokens },
  { round: "R3", direction: "Baseline", component: R3Baseline },
  { round: "R3", direction: "Table", component: R3Table },
  { round: "R3", direction: "Inline w/ dots", component: R3InlineDots },
  { round: "R3", direction: "Inline", component: R3Inline },
  { round: "R3", direction: "Inline chips", component: R3InlineChips },
  { round: "R3", direction: "New chips", component: R3NewChips },
  { round: "R3", direction: "S Chips", component: R3SChips },
  { round: "R3", direction: "Accent Chips", component: R3AccentChips },
  { round: "MVP", direction: "Baseline", component: MVPBaseline },
  { round: "MVP", direction: "Snackbar", component: MVPSnackbar },
  { round: "MVP", direction: "Header Refresh", component: MVPHeaderRefresh },
  { round: "MVP", direction: "Sticky Refresh", component: MVPStickyRefresh },
];

export default function App() {
  return <VersionSwitcher screens={screens} initialRound="MVP" initialDirection="Sticky Refresh" />;
}
