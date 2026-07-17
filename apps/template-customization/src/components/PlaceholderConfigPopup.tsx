import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Badge, Button, Checkbox, Chip, Icon, Menu, MenuItem, Overlay, TextArea, TextField } from "@ds/ui";
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

const TYPE_META: Record<PlaceholderType, { label: string; subtitle: string; icon: string }> = {
  text:     { label: "Text Input",  subtitle: "Free-form text input",           icon: "text_fields" },
  dropdown: { label: "Dropdown",    subtitle: "Select from predefined options",  icon: "arrow_drop_down_circle" },
  number:   { label: "Number",      subtitle: "Numeric value input",             icon: "tag" },
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
  onConvertToPlainText,
}: Props) {
  const [localType, setLocalType] = useState<PlaceholderType>(initialType);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [defaultValue, setDefaultValue] = useState(initialDefaultValue);
  const [aiInstructions, setAiInstructions] = useState(initialAiInstructions);
  const [required, setRequired] = useState(initialRequired);
  const [newOption, setNewOption] = useState("");
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [selectedDefault, setSelectedDefault] = useState(initialDefaultValue);

  const meta = TYPE_META[localType];
  const defaultValueTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = defaultValueTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [defaultValue]);

  function isValidNumber(v: string) {
    return v.trim() !== "" && !isNaN(Number(v.trim()));
  }

  function switchType(next: PlaceholderType) {
    if (next === localType) return;
    if (next === "dropdown") {
      // Carry existing text/number default in as the first dropdown option
      if (defaultValue.trim() && !options.includes(defaultValue.trim())) {
        const seed = defaultValue.trim();
        setOptions([seed]);
        setSelectedDefault(seed);
      }
      setDefaultValue("");
    } else if (localType === "dropdown") {
      const candidate = selectedDefault || options[0] || "";
      setDefaultValue(next === "number" && !isValidNumber(candidate) ? "" : candidate);
      setOptions([]);
      setSelectedDefault("");
    } else if (next === "number" && localType === "text") {
      // Only keep text default if it's actually numeric
      if (!isValidNumber(defaultValue)) setDefaultValue("");
    }
    // number → text: any numeric string is a valid text value, transfer as-is
    setLocalType(next);
  }

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

          {/* Header — pl reduced by button px so net position is unchanged */}
          <div className="flex items-center justify-between pl-[16px] pr-[24px] pt-[16px] pb-[8px]">

            {/* Trigger button + popover anchor — min-w sized to longest option */}
            <div className="relative min-w-[280px]">
              <button
                className="flex items-center gap-[12px] text-left rounded-[10px] hover:bg-[var(--surface-1)] transition-colors cursor-pointer pl-[8px] pr-[12px] py-[8px] outline-none"
                onClick={() => setTypePickerOpen((v) => !v)}
              >
                <div className="w-[40px] h-[40px] rounded-[10px] bg-[var(--accent-10)] flex items-center justify-center shrink-0 text-[var(--accent)]">
                  <Icon name={meta.icon} size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-[4px]">
                    <p className="t-title-md text-[var(--foreground-primary)]">{meta.label}</p>
                    <span className="text-[var(--foreground-secondary)] flex items-center shrink-0">
                      <Icon name={typePickerOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={16} />
                    </span>
                  </div>
                  <p className="t-body-sm text-[var(--foreground-secondary)] mt-[2px] whitespace-nowrap">{meta.subtitle}</p>
                </div>
              </button>

              {/* Type picker — DS Menu popover */}
              {typePickerOpen && (
                <Menu className="absolute left-[0] right-[0] top-[calc(100%+6px)] z-[20]">
                  {(["text", "dropdown", "number"] as PlaceholderType[]).map((t) => (
                    <MenuItem
                      key={t}
                      icon={<Icon name={TYPE_META[t].icon} size={16} />}
                      label={TYPE_META[t].label}
                      description={TYPE_META[t].subtitle}
                      selected={localType === t}
                      onClick={() => { switchType(t); setTypePickerOpen(false); }}
                    />
                  ))}
                </Menu>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] hover:bg-[var(--surface-1)] transition-colors text-[var(--foreground-secondary)] shrink-0"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-[24px] py-[16px] flex flex-col gap-[16px]">

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
                <textarea
                  ref={defaultValueTextareaRef}
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  placeholder={localType === "number" ? 'e.g., "0"' : 'e.g., "No abnormalities noted"'}
                  rows={1}
                  className="w-full rounded-[8px] border border-[var(--border-default)] px-[12px] py-[8px] t-body-md text-[var(--foreground-primary)] placeholder:text-[var(--foreground-tertiary)] outline-none focus:border-[var(--accent)] resize-none overflow-hidden transition-colors"
                  style={{ fontFamily: "Lato, sans-serif" }}
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
            <div>
              {isEditing && (
                <Button variant="tertiary-danger" size="small" onClick={onConvertToPlainText}>
                  Convert to plain text
                </Button>
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
