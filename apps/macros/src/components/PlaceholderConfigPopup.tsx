import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Badge, Button, ButtonGroup, Checkbox, Chip, Icon, Overlay, TextArea, TextField } from "@ds/ui";
import { SelectDropdown } from "./SelectDropdown";

export type PlaceholderType = "text" | "dropdown" | "number";

type Props = {
  type: PlaceholderType;
  onClose: () => void;
  onAdd: (token: string, type: PlaceholderType) => void;
  // Edit mode
  isEditing?: boolean;
  initialDefaultValue?: string;
  initialAiInstructions?: string;
  initialRequired?: boolean;
  initialOptions?: string[];
  onDelete?: () => void;
  onConvertToPlainText?: () => void;
};

const TYPE_META: Record<PlaceholderType, { subtitle: string; icon: string }> = {
  text:     { subtitle: "Free-form text input",          icon: "text_fields" },
  dropdown: { subtitle: "Select from predefined options", icon: "arrow_drop_down_circle" },
  number:   { subtitle: "Numeric value input",            icon: "tag" },
};

export function PlaceholderConfigPopup({
  type: initialType,
  onClose,
  onAdd,
  isEditing = false,
  initialDefaultValue = "",
  initialAiInstructions = "",
  initialRequired = true,
  initialOptions = [],
  onDelete,
  onConvertToPlainText,
}: Props) {
  const [localType, setLocalType] = useState<PlaceholderType>(initialType);
  const [defaultValue, setDefaultValue] = useState(initialDefaultValue);
  const [aiInstructions, setAiInstructions] = useState(initialAiInstructions);
  const [required, setRequired] = useState(initialRequired);
  const [newOption, setNewOption] = useState("");
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [selectedDefault, setSelectedDefault] = useState(initialDefaultValue);

  const meta = TYPE_META[localType];

  function addOption() {
    const trimmed = newOption.trim();
    if (trimmed && !options.includes(trimmed)) {
      setOptions((prev) => [...prev, trimmed]);
      setNewOption("");
    }
  }

  function removeOption(opt: string) {
    setOptions((prev) => prev.filter((o) => o !== opt));
    if (selectedDefault === opt) setSelectedDefault("");
  }

  function handleSave() {
    let token: string;
    if (localType === "text") {
      token = `[${defaultValue || "text field"}]`;
    } else if (localType === "dropdown") {
      token = `[${options.join("/") || "dropdown"}]`;
    } else {
      token = `[${defaultValue || "number"}]`;
    }
    onAdd(token, localType);
  }

  return createPortal(
    <>
      <Overlay variant="blur" fixed onClick={onClose} className="z-[300]" />
      <div
        className="fixed inset-0 flex items-center justify-center z-[310] pointer-events-none"
        style={{ fontFamily: "Lato, sans-serif" }}
      >
        <div className="bg-white rounded-[16px] shadow-[0px_8px_32px_4px_rgba(0,0,0,0.16)] w-[480px] max-h-[80vh] flex flex-col pointer-events-auto">

          {/* Header */}
          <div className="flex items-start gap-[16px] px-[24px] pt-[24px] pb-[16px]">
            <div className="w-[52px] h-[52px] rounded-[12px] bg-[var(--litmus-25)] flex items-center justify-center shrink-0 text-[var(--accent)]">
              <Icon name={meta.icon} size={24} />
            </div>
            <div className="flex-1 min-w-0 pt-[4px]">
              <p className="t-title-md text-[var(--foreground-primary)]">
                {isEditing
                  ? "Edit Smart Field"
                  : `Configure ${localType === "text" ? "Text" : localType === "dropdown" ? "Dropdown" : "Number"} Placeholder`}
              </p>
              <p className="t-body-sm text-[var(--foreground-secondary)] mt-[2px]">
                {meta.subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] hover:bg-[var(--surface-1)] transition-colors text-[var(--foreground-secondary)] shrink-0 mt-[2px]"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-[24px] py-[16px] flex flex-col gap-[16px]">

            {/* Type selector — edit mode only */}
            {isEditing && (
              <div className="flex flex-col gap-[8px]">
                <p className="t-title-sm text-[var(--foreground-primary)]">
                  Field Type
                </p>
                <ButtonGroup
                  items={[
                    { label: "Text", value: "text" },
                    { label: "Dropdown", value: "dropdown" },
                    { label: "Number", value: "number" },
                  ]}
                  value={localType}
                  onChange={(v) => setLocalType(v as PlaceholderType)}
                  size="medium"
                />
              </div>
            )}

            {/* Dropdown options */}
            {localType === "dropdown" && (
              <div className="flex flex-col gap-[8px]">
                <p className="t-title-sm text-[var(--foreground-primary)]">
                  Dropdown Options
                </p>
                <div className="flex gap-[8px]">
                  <TextField
                    value={newOption}
                    onChange={setNewOption}
                    placeholder="Add an option"
                    size="M"
                    className="flex-1 min-w-0"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption(); } }}
                  />
                  <Button variant="secondary" size="medium" onClick={addOption}>Add</Button>
                </div>
                {options.length > 0 && (
                  <div className="flex flex-wrap gap-[6px]">
                    {options.map((opt) => (
                      <Chip key={opt} label={opt} color="neutral" size="S" onDismiss={() => removeOption(opt)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Default Value */}
            <div className="flex flex-col gap-[6px]">
              <p className="t-title-sm text-[var(--foreground-primary)]">
                Default Value
              </p>
              {localType === "dropdown" ? (
                <SelectDropdown
                  value={selectedDefault}
                  options={
                    options.length > 0
                      ? [{ value: "", label: "Select default option" }, ...options.map((o) => ({ value: o, label: o }))]
                      : [{ value: "", label: "Select default option" }]
                  }
                  onChange={setSelectedDefault}
                  width="w-full"
                />
              ) : (
                <TextField
                  value={defaultValue}
                  onChange={setDefaultValue}
                  placeholder={localType === "number" ? 'e.g., "0"' : 'e.g., "No abnormalities noted"'}
                  size="M"
                  className="w-full"
                />
              )}
              <p className="t-body-xs text-[var(--foreground-secondary)]">
                The AI will use this value if nothing specific is mentioned
              </p>
            </div>

            {/* AI Instructions */}
            <div className="flex flex-col gap-[6px]">
              <div className="flex items-center gap-[6px]">
                <p className="t-title-sm text-[var(--foreground-primary)]">
                  AI Instructions
                </p>
                <Badge label="Optional" variant="info" />
              </div>
              <p className="t-body-xs text-[var(--foreground-secondary)]">
                Share additional context to help fill this smart field correctly. For example, "extract the main symptom from the conversation" or "include content from the patient's history".
              </p>
              <TextArea value={aiInstructions} onChange={setAiInstructions} rows={3} className="w-full" />
            </div>

            {/* Required */}
            <div className="flex items-center gap-[8px]">
              <Checkbox state={required ? "selected" : "unselected"} onChange={setRequired} />
              <span
                className="t-title-sm text-[var(--foreground-primary)] cursor-pointer select-none"
                onClick={() => setRequired((v) => !v)}
              >
                Required field
              </span>
              <span className="t-body-sm text-[var(--foreground-secondary)]">
                (AI must fill this placeholder)
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center justify-between px-[24px] py-[16px]">
            <div className="flex items-center gap-[8px]">
              {isEditing && (
                <>
                  <Button variant="tertiary-neutral" size="small" onClick={onConvertToPlainText}>
                    Plain text
                  </Button>
                  <Button
                    variant="tertiary-danger"
                    size="small"
                    prefix={<Icon name="delete" size={14} />}
                    onClick={onDelete}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center gap-[8px]">
              <Button variant="secondary" size="small" onClick={onClose}>Cancel</Button>
              <Button variant="primary" size="small" onClick={handleSave}>
                {isEditing ? "Save changes" : "Add Placeholder"}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}
