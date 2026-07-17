import { createContext, useContext } from "react";

export type Macro = {
  id: string;
  name: string;
  enabled: boolean;
  content?: string;
  selectionCriteria?: string;
};

export type OpenMacroState = { macro: Macro; sectionTitle: string } | null;

export const MacroDrawerCtx = createContext<{
  openMacro: OpenMacroState;
  setOpenMacro: (m: OpenMacroState) => void;
} | null>(null);

export function useMacroDrawer() {
  const ctx = useContext(MacroDrawerCtx);
  if (!ctx) throw new Error("MacroDrawerCtx missing");
  return ctx;
}
