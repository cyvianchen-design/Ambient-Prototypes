import React, { useState } from "react";
import { Button, Icon, IconButton, Switch, Divider } from "@ds/ui";
import { SelectDropdown } from "./SelectDropdown";
import { useMacroDrawer, Macro } from "../macroContext";

type Props = {
  title: string;
  format?: string;
  length?: string;
  macros: Macro[];
  totalMacros: number;
  learnExamples?: number;
};

const formatOptions = [
  "Bullet by Diagnosis",
  "Narrative Paragraph",
  "Numbered List",
  "SOAP Format",
];

const lengthOptions = [
  "Standard",
  "Concise",
  "Detailed",
];

const MACROS_PER_PAGE = 10;

export function SectionCard({ title, format: initialFormat = "Bullet by Diagnosis", length: initialLength = "Standard", macros: initialMacros, totalMacros, learnExamples = 10 }: Props) {
  const [format, setFormat] = useState(initialFormat);
  const [length, setLength] = useState(initialLength);
  const [macros, setMacros] = useState(initialMacros);
  const [page, setPage] = useState(1);
  const [deactivated, setDeactivated] = useState(false);
  const { setOpenMacro } = useMacroDrawer();

  const totalPages = Math.ceil(totalMacros / MACROS_PER_PAGE);

  function toggleMacro(id: string) {
    setMacros((prev) => prev.map((m) => m.id === id ? { ...m, enabled: !m.enabled } : m));
  }

  if (deactivated) {
    return (
      <div className="bg-white rounded-[12px] shadow-[0px_4px_16px_2px_rgba(0,0,0,0.07)] w-full flex items-center gap-[8px] px-[16px] py-[16px] min-h-[28px]">
        <div className="flex-1 min-w-0 flex items-center gap-[8px]">
          <span
            className="shrink-0 t-title-md text-[var(--foreground-primary)]"
            style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07'" }}
          >
            {title}
          </span>
          <span
            className="t-body-sm text-[var(--foreground-tertiary)] truncate"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            (deactivated)
          </span>
        </div>
        <Button variant="tertiary" size="small" onClick={() => setDeactivated(false)}>
          Activate
        </Button>
      </div>
    );
  }

  return (
    <>
    <div className="bg-white rounded-[12px] shadow-[0px_4px_16px_2px_rgba(0,0,0,0.07)] w-full flex flex-col gap-[12px] px-[12px] py-[16px]">
      {/* Header */}
      <div className="flex items-center gap-[8px] px-[4px]">
        <span
          className="flex-1 min-w-0 t-title-lg text-[var(--foreground-primary)]"
          style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07'" }}
        >
          {title}
        </span>
        <Button variant="tertiary-neutral" size="small" onClick={() => setDeactivated(true)}>
          Deactivate
        </Button>
      </div>

      {/* Settings */}
      <div className="flex flex-col gap-[8px] px-[4px]">
        {/* Format */}
        <div className="flex items-center gap-[8px]">
          <span
            className="t-title-sm text-[var(--foreground-primary)] w-[48px] shrink-0"
            style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07'" }}
          >
            Format
          </span>
          <SelectDropdown value={format} options={formatOptions} onChange={setFormat} width="w-[180px]" />
          <span
            className="flex-1 min-w-0 t-body-sm text-[var(--foreground-secondary)]"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            List findings under each condition.
          </span>
        </div>

        {/* Length */}
        <div className="flex items-center gap-[8px]">
          <span
            className="t-title-sm text-[var(--foreground-primary)] w-[48px] shrink-0"
            style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07'" }}
          >
            Length
          </span>
          <SelectDropdown value={length} options={lengthOptions} onChange={setLength} width="w-[180px]" />
          <span
            className="flex-1 min-w-0 t-body-xs text-[var(--foreground-secondary)]"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            Full clinical picture, without minor or repetitive details.
          </span>
        </div>
      </div>

      <Divider />

      {/* Macros */}
      <div className="flex flex-col gap-[4px]">
        {/* Macros header */}
        <div className="flex items-center gap-[8px] px-[4px]">
          <span
            className="t-title-sm text-[var(--foreground-primary)]"
            style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07'" }}
          >
            Macros
          </span>
          <span
            className="t-body-xs text-[var(--foreground-secondary)]"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            {totalMacros} macros added
          </span>
          <button
            className="ml-auto t-title-sm text-[var(--accent)] flex items-center gap-[2px] hover:opacity-80 transition-opacity"
            style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07'" }}
          >
            <Icon name="add" size={14} />
            Add Macro
          </button>
        </div>

        {/* Macro list */}
        <div className="flex flex-col gap-[4px] px-[4px]">
          {macros.map((macro) => (
            <div
              key={macro.id}
              className="border border-[var(--shape-outline)] rounded-[6px] h-[28px] flex items-center gap-[16px] px-[8px] cursor-pointer transition-colors hover:bg-[var(--surface-1)] bg-white"
              onClick={() => setOpenMacro({ macro, sectionTitle: title })}
            >
              <span
                className="flex-1 min-w-0 t-body-sm text-[var(--foreground-primary)] truncate"
                style={{ fontFamily: "Lato, sans-serif" }}
              >
                {macro.name}
              </span>
              <span onClick={(e) => e.stopPropagation()}>
                <Switch
                  size="XS"
                  checked={macro.enabled}
                  onChange={() => toggleMacro(macro.id)}
                />
              </span>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-[4px] h-[28px] px-[4px]">
          <IconButton
            icon={<Icon name="keyboard_arrow_left" size={16} />}
            variant="tertiary-neutral"
            size="small"
            aria-label="Previous page"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          />
          <span
            className="t-title-xs text-[var(--foreground-primary)]"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            Page {page}/{totalPages}
          </span>
          <IconButton
            icon={<Icon name="keyboard_arrow_right" size={16} />}
            variant="tertiary-neutral"
            size="small"
            aria-label="Next page"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      </div>

      <Divider />

      {/* Learn Format */}
      <div className="flex items-center gap-[8px] px-[4px]">
        <span
          className="t-title-sm text-[var(--foreground-primary)]"
          style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07'" }}
        >
          Learn Format
        </span>
        <span
          className="t-body-xs text-[var(--foreground-secondary)]"
          style={{ fontFamily: "Lato, sans-serif" }}
        >
          {learnExamples} examples
        </span>
        <button
          className="ml-auto t-title-sm text-[var(--accent)] flex items-center gap-[2px] hover:opacity-80 transition-opacity"
          style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07'" }}
        >
          View
          <Icon name="arrow_forward" size={14} />
        </button>
      </div>
    </div>

    </>
  );
}
