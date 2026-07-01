import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Checkbox, Icon, Menu, MenuHeader, Overlay, Switch, TextArea, TextField } from "@ds/ui";
import { SelectDropdown } from "./SelectDropdown";
import { PlaceholderConfigPopup, PlaceholderType } from "./PlaceholderConfigPopup";
import { MacroContentEditor, MacroContentEditorHandle, TokenStyle } from "./MacroContentEditor";
import type { Macro } from "../macroContext";

type Props = {
  macro: Macro;
  sectionTitle: string;
  templateName?: string;
  tokenStyle?: TokenStyle;
  onClose: () => void;
};

const UPDATE_MODE_OPTIONS: { value: string; label: string; description: string }[] = [
  { value: "replace", label: "Replace", description: "Replace the entire section with this macro content." },
  { value: "prepend", label: "Prepend", description: "Insert this macro content before the section." },
  { value: "append",  label: "Append",  description: "Insert this macro content after the section." },
  { value: "blend",   label: "Blend",   description: "Merge this macro content with the existing section." },
];

const SLASH_ITEMS: { type: PlaceholderType; description: string; shortcut: string; icon: string }[] = [
  { type: "text",     description: "Add a text input placeholder",   shortcut: "/text",     icon: "text_fields" },
  { type: "dropdown", description: "Add a dropdown with options",    shortcut: "/dropdown", icon: "arrow_drop_down_circle" },
  { type: "number",   description: "Add a numeric input",             shortcut: "/number",   icon: "tag" },
];

export function MacroDrawer({
  macro,
  sectionTitle,
  templateName = "SOAP Note",
  tokenStyle = "link",
  onClose,
}: Props) {
  const [macroName, setMacroName] = useState(macro.name);
  const [active, setActive] = useState(macro.enabled);
  const [macroContent, setMacroContent] = useState(macro.content ?? "");
  const [selectionCriteria, setSelectionCriteria] = useState(macro.selectionCriteria ?? "");
  const [updateMode, setUpdateMode] = useState("replace");
  const [isDefault, setIsDefault] = useState(false);
  const [listedSystems, setListedSystems] = useState(false);
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [ageUnit, setAgeUnit] = useState("years");
  const [gender, setGender] = useState("all genders");
  const [formattingInstruction, setFormattingInstruction] = useState("");
  const [optionalExpanded, setOptionalExpanded] = useState(false);

  // Slash menu state
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashPos, setSlashPos] = useState<{ top: number; left: number } | null>(null);
  const [slashSelected, setSlashSelected] = useState(0);
  const [configType, setConfigType] = useState<PlaceholderType | null>(null);

  const editorRef = useRef<MacroContentEditorHandle>(null);
  const slashMenuRef = useRef<HTMLDivElement>(null);

  // Close slash menu on outside click
  useEffect(() => {
    if (!slashOpen) return;
    function handle(e: MouseEvent) {
      if (slashMenuRef.current?.contains(e.target as Node)) return;
      setSlashOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [slashOpen]);

  function handleSlashTrigger(pos: { top: number; left: number }) {
    setSlashPos(pos);
    setSlashOpen(true);
    setSlashSelected(0);
  }

  function handleEditorKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!slashOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSlashSelected((v) => Math.min(SLASH_ITEMS.length - 1, v + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSlashSelected((v) => Math.max(0, v - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      openConfig(slashSelected);
    } else if (e.key === "Escape") {
      setSlashOpen(false);
    }
  }

  function openConfig(index: number) {
    setSlashOpen(false);
    setConfigType(SLASH_ITEMS[index].type);
  }

  function handleAddPlaceholder(token: string, type?: PlaceholderType) {
    const name = token.slice(1, -1);
    editorRef.current?.insertToken(name, type);
    setConfigType(null);
  }

  return (
    <>
      <Overlay variant="blur" fixed onClick={onClose} />
      <div
        className="fixed top-0 right-0 h-full w-[640px] bg-white z-[160] flex flex-col shadow-[0px_4px_16px_2px_rgba(0,0,0,0.07)]"
        style={{ fontFamily: "Lato, sans-serif" }}
      >
        {/* Header */}
        <div className="shrink-0 flex flex-col pb-[8px] pt-[16px] px-[20px]">
          <div className="flex gap-[8px] items-center w-full">
            <div className="flex-1 min-w-0 flex flex-col gap-[8px]">
              <p className="t-title-xs text-[var(--foreground-secondary)]">
                {templateName}
              </p>
              <div className="flex gap-[4px] items-center">
                <p className="t-title-lg text-[var(--foreground-primary)] whitespace-nowrap">
                  {sectionTitle}
                </p>
                <button className="flex items-center justify-center w-[28px] h-[28px] rounded-[6px] hover:bg-[var(--surface-1)] transition-colors text-[var(--foreground-secondary)]">
                  <Icon name="info" size={16} />
                </button>
              </div>
            </div>
            <Button
              variant="tertiary-neutral"
              size="small"
              prefix={<Icon name="close" size={16} />}
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-[20px] py-[16px] flex flex-col gap-[20px]">

          {/* Macro Name */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex flex-col gap-[4px]">
              <p className="t-title-xs text-[var(--foreground-primary)]">
                Macro Name <span className="font-normal">(Required)</span>
              </p>
              <p className="t-body-xs text-[var(--foreground-secondary)]">
                A name to help you identify your macros.
              </p>
            </div>
            <div className="flex gap-[8px] items-center">
              <TextField
                value={macroName}
                onChange={setMacroName}
                placeholder="Enter macro name"
                size="M"
                className="flex-1 min-w-0"
              />
              <div className="flex items-center gap-[8px] h-[36px] shrink-0">
                <span
                  className="t-title-sm text-[var(--foreground-secondary)]"
                  style={{ fontFeatureSettings: "'ss07'" }}
                >
                  Active
                </span>
                <Switch size="XS" checked={active} onChange={setActive} />
              </div>
            </div>
          </div>

          {/* Macro Content */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex flex-col gap-[4px]">
              <p className="t-title-xs text-[var(--foreground-primary)]">
                Macro Content <span className="font-normal">(Required)</span>
              </p>
              <p className="t-body-xs text-[var(--foreground-secondary)]">
                Type your macro text and use "/" to insert smart fields. The AI will update the content in placeholders based on your patient conversation.
              </p>
            </div>
            <div className="flex flex-col overflow-hidden rounded-[6px] border border-[var(--neutral-200)] focus-within:border-[var(--accent)] transition-colors bg-white">
              <MacroContentEditor
                ref={editorRef}
                value={macroContent}
                onChange={setMacroContent}
                tokenStyle={tokenStyle}
                placeholder={'Type your macro content here. Use "/" to add smart fields.'}
                onSlashTrigger={handleSlashTrigger}
                onKeyDown={handleEditorKeyDown}
              />
              <div className="flex items-center gap-[8px] px-[12px] py-[8px] bg-[var(--litmus-25)]">
                <p className="flex-1 min-w-0 t-body-sm text-[var(--foreground-primary)]">
                  Convert plain text to macro placeholders with one click
                </p>
                <Button variant="accent" size="small" disabled prefix={<Icon name="sync" size={16} />}>
                  Convert
                </Button>
              </div>
            </div>
          </div>

          {/* Selection Criteria */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex flex-col gap-[4px]">
              <p className="t-title-xs text-[var(--foreground-primary)]">
                Selection Criteria <span className="font-normal">(Required)</span>
              </p>
              <p className="t-body-xs text-[var(--foreground-secondary)]">
                Tell our AI under what condition should this macro be used.
              </p>
            </div>
            <TextArea
              value={selectionCriteria}
              onChange={setSelectionCriteria}
              placeholder={"Describe when this macro should be used...\ne.g., \"Use for annual exams with cough complaints in adult patients\""}
              rows={3}
              className="w-full"
            />
          </div>

          {/* Update Mode — inline row */}
          <div className="flex items-center gap-[8px]">
            <span
              className="t-title-sm text-[var(--foreground-primary)] shrink-0"
              style={{ fontFeatureSettings: "'ss07'" }}
            >
              Update Mode
            </span>
            <span className="t-body-sm text-[var(--foreground-secondary)] shrink-0">
              (Required)
            </span>
            <SelectDropdown
              value={updateMode}
              options={UPDATE_MODE_OPTIONS}
              onChange={setUpdateMode}
              width="w-[140px]"
              menuWidth={300}
            />
            <span className="t-body-sm text-[var(--foreground-secondary)]">
              {UPDATE_MODE_OPTIONS.find((o) => o.value === updateMode)?.description}
            </span>
          </div>

          {/* Optional Settings */}
          {(() => {
            const demoApplied = ageMin !== "" || ageMax !== "";
            const formattingApplied = formattingInstruction !== "";

            const settingRow = (label: string, content: React.ReactNode) => (
              <div className="flex gap-[8px] items-center min-h-[28px]">
                <span
                  className="t-title-sm text-[var(--foreground-secondary)] w-[136px] shrink-0"
                  style={{ fontFeatureSettings: "'ss07'" }}
                >
                  {label}
                </span>
                {content}
              </div>
            );

            const defaultRow = settingRow("Set as Default",
              <div className="flex items-center gap-[4px]">
                <Checkbox state={isDefault ? "selected" : "unselected"} onChange={setIsDefault} />
                <span
                  className="t-body-sm text-[var(--foreground-primary)] cursor-pointer"
                  onClick={() => setIsDefault((v) => !v)}
                >
                  Use this macro when no other macros apply
                </span>
              </div>
            );

            const listedRow = settingRow("Listed Systems",
              <div className="flex items-center gap-[4px]">
                <Checkbox state={listedSystems ? "selected" : "unselected"} onChange={setListedSystems} />
                <span
                  className="t-body-sm text-[var(--foreground-primary)] cursor-pointer"
                  onClick={() => setListedSystems((v) => !v)}
                >
                  Include systems that are not listed in the macro, if discussed
                </span>
              </div>
            );

            const demoRow = settingRow("Patient Demographic",
              <div className="flex items-center gap-[4px] flex-wrap">
                <TextField value={ageMin} onChange={setAgeMin} placeholder="age" size="S" className="w-[52px]" />
                <span className="t-body-sm text-[var(--foreground-primary)]">to</span>
                <TextField value={ageMax} onChange={setAgeMax} placeholder="age" size="S" className="w-[52px]" />
                <SelectDropdown value={ageUnit} options={["years", "months"]} onChange={setAgeUnit} width="w-[100px]" />
                <span className="t-body-sm text-[var(--foreground-primary)]">and</span>
                <SelectDropdown value={gender} options={["all genders", "male", "female"]} onChange={setGender} width="w-[120px]" />
              </div>
            );

            const formattingRow = settingRow("Formatting Instruction",
              <TextField
                value={formattingInstruction}
                onChange={setFormattingInstruction}
                placeholder="Enter instruction"
                size="S"
                className="flex-1 min-w-0"
              />
            );

            const applied = [
              isDefault && defaultRow,
              listedSystems && listedRow,
              demoApplied && demoRow,
              formattingApplied && formattingRow,
            ].filter(Boolean) as React.ReactNode[];

            const unapplied = [
              !isDefault && defaultRow,
              !listedSystems && listedRow,
              !demoApplied && demoRow,
              !formattingApplied && formattingRow,
            ].filter(Boolean) as React.ReactNode[];

            return (
              <div className="flex flex-col gap-[8px]">
                {applied.length > 0 && (
                  <div className="flex flex-col gap-[8px]">
                    {applied.map((row, i) => <React.Fragment key={i}>{row}</React.Fragment>)}
                  </div>
                )}
                {unapplied.length > 0 && (
                  <div className="flex flex-col">
                    <Button
                      variant="tertiary"
                      size="small"
                      suffix={<Icon name={optionalExpanded ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={16} />}
                      onClick={() => setOptionalExpanded((v) => !v)}
                      className="self-start"
                    >
                      Optional Settings
                    </Button>
                    {optionalExpanded && (
                      <div className="flex flex-col gap-[8px] bg-[var(--surface-1)] rounded-[6px] pt-[8px] pb-[12px] px-[12px] mt-[4px]">
                        {unapplied.map((row, i) => <React.Fragment key={i}>{row}</React.Fragment>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-[20px] py-[16px]">
          <div className="flex gap-[8px]">
            <Button variant="secondary" size="small" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="small" prefix={<Icon name="save" size={16} />}>Save</Button>
          </div>
          <Button variant="tertiary-danger" size="small" prefix={<Icon name="delete" size={16} />}>Delete</Button>
        </div>
      </div>

      {/* Slash command menu */}
      {slashOpen && slashPos && createPortal(
        <div
          ref={slashMenuRef}
          style={{ position: "fixed", top: slashPos.top, left: slashPos.left, zIndex: 300 }}
        >
          <Menu className="w-[280px]">
            <MenuHeader>Insert placeholder</MenuHeader>
            {SLASH_ITEMS.map((item, i) => (
              <button
                key={item.type}
                className={[
                  "w-full flex items-start gap-[8px] px-[12px] py-[8px] rounded-[8px] transition-colors text-left",
                  slashSelected === i ? "bg-[var(--litmus-25)]" : "hover:bg-[var(--surface-1)]",
                ].join(" ")}
                style={{ fontFamily: "Lato, sans-serif" }}
                onClick={() => openConfig(i)}
              >
                <span className="shrink-0 text-[var(--accent)] mt-[2px]">
                  <Icon name={item.icon} size={16} />
                </span>
                <span className="flex-1 min-w-0 t-body-sm text-[var(--foreground-primary)]">
                  {item.description}
                </span>
                <span className="shrink-0 text-[12px] font-bold leading-[1.4] text-[var(--foreground-secondary)]">
                  {item.shortcut}
                </span>
              </button>
            ))}
            <div className="flex items-center gap-[12px] px-[12px] py-[8px] border-t border-[rgba(0,0,0,0.06)]">
              {[["↑↓", "navigate"], ["↵", "select"], ["esc", "dismiss"]].map(([key, label]) => (
                <span key={key} className="flex items-center gap-[4px] text-[11px] text-[var(--foreground-secondary)]" style={{ fontFamily: "Lato, sans-serif" }}>
                  <kbd className="px-[4px] py-[1px] rounded-[3px] border border-[rgba(0,0,0,0.15)] text-[10px] font-bold bg-white" style={{ fontFamily: "inherit" }}>{key}</kbd>
                  {label}
                </span>
              ))}
            </div>
          </Menu>
        </div>,
        document.body
      )}

      {/* Placeholder config popup */}
      {configType && (
        <PlaceholderConfigPopup
          type={configType}
          onClose={() => setConfigType(null)}
          onAdd={handleAddPlaceholder}
        />
      )}
    </>
  );
}
