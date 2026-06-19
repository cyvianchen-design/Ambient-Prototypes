/**
 * Shared upload state between Modal V1 and Modal V2.
 * Module-level (not React state) so it survives VersionSwitcher direction switches.
 * Both directions are never mounted simultaneously, so plain mutable vars are safe.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _entries: any[] = [];
let _bulkOpen = false;

// Side-panel state — persists when switching between Side Panel V1 / V2 / V3
let _editingMacroId: string | null = null;
let _creatingMacro = false;

export const uploadStore = {
  getEntries: (): any[] => _entries,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setEntries: (e: any[]): void => { _entries = e; },
  getBulkOpen: (): boolean => _bulkOpen,
  setBulkOpen: (v: boolean): void => { _bulkOpen = v; },

  getEditingMacroId: (): string | null => _editingMacroId,
  setEditingMacroId: (v: string | null): void => { _editingMacroId = v; },
  getCreatingMacro: (): boolean => _creatingMacro,
  setCreatingMacro: (v: boolean): void => { _creatingMacro = v; },
};
