import React, { useState } from "react";
import { VersionSwitcher } from "@ds/ui";
import type { ScreenDef } from "@ds/ui";
import R1Link from "./screens/R1-Link";
import R1Chip from "./screens/R1-Chip";
import R1Token from "./screens/R1-Token";
import { MacroDrawer } from "./components/MacroDrawer";
import { MacroDrawerCtx, OpenMacroState } from "./macroContext";
import type { TokenStyle } from "./components/MacroContentEditor";

const screens: ScreenDef[] = [
  { round: "R1", direction: "Link",  component: R1Link },
  { round: "R1", direction: "Chip",  component: R1Chip },
  { round: "R1", direction: "Token", component: R1Token },
];

const DIRECTION_TOKEN_STYLE: Record<string, TokenStyle> = {
  Link:  "link",
  Chip:  "chip",
  Token: "field",
};

export default function App() {
  const [openMacro, setOpenMacro] = useState<OpenMacroState>(null);
  const [activeDirection, setActiveDirection] = useState("Link");

  const tokenStyle = DIRECTION_TOKEN_STYLE[activeDirection] ?? "link";

  return (
    <MacroDrawerCtx.Provider value={{ openMacro, setOpenMacro }}>
      <VersionSwitcher
        screens={screens}
        initialRound="R1"
        onDirectionChange={(_, direction) => setActiveDirection(direction)}
      />
      {openMacro && (
        <MacroDrawer
          macro={openMacro.macro}
          sectionTitle={openMacro.sectionTitle}
          tokenStyle={tokenStyle}
          onClose={() => setOpenMacro(null)}
        />
      )}
    </MacroDrawerCtx.Provider>
  );
}
