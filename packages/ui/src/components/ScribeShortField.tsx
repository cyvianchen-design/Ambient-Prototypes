import React, { useState, useRef, useEffect } from "react";
import { Icon } from "./Icon";
import { Chip } from "./Chip";
import { Menu, MenuItem } from "./Menu";

export type ScribeShortFieldInput = "text" | "single" | "multi";
export type ScribeShortFieldState = "default" | "active" | "alert";

export type ScribeShortFieldProps = {
  /** Field label (Title/S) shown above the field */
  title?: string;
  required?: boolean;
  /** "view" = read-only display, "edit" = editable text input */
  mode?: "view" | "edit";
  inputType?: ScribeShortFieldInput;
  state?: ScribeShortFieldState;

  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;

  // single-select — dropdown arrow + Menu popover
  options?: string[];
  onSelect?: (value: string) => void;

  // multiselect — removable Chips + Add
  chips?: string[];
  onRemoveChip?: (chip: string) => void;
  onAdd?: () => void;

  /** Opens an editor (used by multiselect / text affordances) */
  onClick?: () => void;

  helpText?: string;
  className?: string;
};

// Scribe short-field — short text, single select (dropdown → Menu), or multiselect (chips).
export function ScribeShortField({
  title,
  required = false,
  mode = "view",
  inputType = "text",
  state = "default",
  value = "",
  placeholder = "No info",
  onChange,
  options = [],
  onSelect,
  chips = [],
  onRemoveChip,
  onAdd,
  onClick,
  helpText,
  className = "",
}: ScribeShortFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const isEdit = mode === "edit";
  const active = state === "active" || (inputType === "single" && open);
  const border =
    state === "alert"
      ? "border border-[var(--foreground-semantic-danger,#bb1411)]"
      : active
        ? "border border-[var(--accent,#1132ee)]"
        : isEdit
          ? "border border-[var(--neutral-200,#ccc)] hover:border-[var(--neutral-400,#999)]"
          : "border border-transparent hover:bg-[var(--surface-1,#f7f7f7)]";

  return (
    <div className={`flex flex-col gap-[2px] w-full ${className}`}>
      {title && (
        <div className="flex items-end min-h-[24px] pl-[8px] pr-[12px]">
          <span className="t-title-sm text-[var(--foreground-secondary,#666)]">
            {title}
            {required && <span className="text-[var(--foreground-semantic-danger,#bb1411)] ml-[2px]">*</span>}
          </span>
        </div>
      )}

      <div ref={ref} className="relative">
        <div
          onClick={inputType === "single" ? () => setOpen((o) => !o) : onClick}
          className={`${inputType === "single" ? "inline-flex max-w-full gap-[4px]" : "flex gap-[8px]"} items-center min-h-[36px] px-[8px] rounded-[6px] transition-colors ${border} ${inputType === "single" || onClick ? "cursor-pointer" : ""}`}
        >
          {inputType === "single" ? (
            // Single select hugs its content: value with the dropdown arrow right beside it.
            <>
              <span className={`t-body-md truncate ${value ? "text-[var(--foreground-primary,#1a1a1a)]" : "text-[var(--foreground-tertiary,#808080)]"}`}>
                {value || placeholder}
              </span>
              <Icon name={open ? "arrow_drop_up" : "arrow_drop_down"} size={20} className="text-[var(--foreground-secondary,#666)] shrink-0" />
            </>
          ) : (
            <>
              <div className="flex-1 min-w-0 flex items-center gap-[4px] flex-wrap py-[4px]">
                {inputType === "text" && (
                  isEdit && onChange ? (
                    <input
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder={placeholder}
                      className="flex-1 min-w-0 bg-transparent outline-none border-none t-body-md text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[var(--foreground-tertiary,#808080)]"
                    />
                  ) : (
                    <span className={`t-body-md ${value ? "text-[var(--foreground-primary,#1a1a1a)]" : "text-[var(--foreground-tertiary,#808080)]"}`}>
                      {value || placeholder}
                    </span>
                  )
                )}

                {inputType === "multi" && (
                  <>
                    {chips.map((c) => (
                      <Chip key={c} label={c} color="neutral" size="XS" onDismiss={onRemoveChip ? (e) => { e.stopPropagation(); onRemoveChip(c); } : undefined} />
                    ))}
                    {onAdd && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onAdd(); }}
                        className="inline-flex items-center gap-[4px] h-[28px] px-[10px] rounded-[6px] t-title-sm text-[var(--accent,#1132ee)] hover:bg-[var(--accent-10,#1132ee1a)] transition-colors"
                      >
                        <Icon name="add" size={16} /> Add
                      </button>
                    )}
                  </>
                )}
              </div>

              {state === "alert" && (
                <Icon name="error" size={20} className="text-[var(--foreground-semantic-danger,#bb1411)] shrink-0" filled />
              )}
            </>
          )}
        </div>

        {inputType === "single" && open && (
          <div className="absolute left-0 top-full mt-[4px] z-20">
            <Menu className="min-w-[180px] w-max max-w-[320px] max-h-[260px] overflow-y-auto">
              {options.map((opt) => (
                <MenuItem key={opt} label={opt} selected={opt === value} onClick={() => { onSelect?.(opt); setOpen(false); }} />
              ))}
            </Menu>
          </div>
        )}
      </div>

      {helpText && (
        <div className="px-[8px] t-body-xs">
          <span className={state === "alert" ? "text-[var(--foreground-semantic-danger,#bb1411)]" : "text-[var(--foreground-secondary,#666)]"}>{helpText}</span>
        </div>
      )}
    </div>
  );
}
