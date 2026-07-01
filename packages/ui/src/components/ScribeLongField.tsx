import React from "react";
import { Button } from "./Button";
import { IconButton } from "./Button";
import { Icon } from "./Icon";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ScribeLongFieldMode =
  | "view"        // read-only; edit + dictate icons in header
  | "edit"        // editable textarea; edit + dictate + copy actions
  | "dictating"   // recording in progress; mic "Dictate" + Save + Cancel
  | "processing"; // AI processing; spinner "Dictate" + Save + Cancel

export type ScribeLongFieldProps = {
  sectionTitle: string;
  value?: string;
  onChange?: (v: string) => void;
  mode?: ScribeLongFieldMode;
  onEdit?: () => void;
  onDictate?: () => void;
  onCopy?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  /** Shown when value is empty in view/edit mode */
  placeholder?: string;
  className?: string;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function ScribeLongField({
  sectionTitle,
  value = "",
  onChange,
  mode = "view",
  onEdit,
  onDictate,
  onCopy,
  onSave,
  onCancel,
  placeholder = "No relevant information documented in transcript",
  className = "",
}: ScribeLongFieldProps) {
  const isEditable = mode === "edit";
  const isDictating = mode === "dictating";
  const isProcessing = mode === "processing";
  const isEmpty = value.trim().length === 0;

  // Border accent in active modes
  // Use a clearly-visible border in all modes; accent in active recording/processing
  const borderCls =
    isDictating || isProcessing
      ? "border-[var(--accent,#1132ee)]"
      : "border-[#d0d0d0]";

  return (
    <div
      className={[
        "flex flex-col rounded-[8px] border bg-white",
        borderCls,
        "overflow-hidden",
        className,
      ].join(" ")}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-[8px] px-[12px] py-[8px] border-b border-[var(--surface-3,#f0f0f0)]">
        <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)] truncate min-w-0">
          {sectionTitle}
        </span>

        <div className="flex items-center gap-[2px] shrink-0">
          {/* View / Edit mode: icon buttons */}
          {(mode === "view" || mode === "edit") && (
            <>
              <IconButton
                icon={<Icon name="edit" size={16} />}
                variant="tertiary-neutral"
                size="small"
                onClick={onEdit}
                aria-label="Edit"
              />
              <IconButton
                icon={<Icon name="mic" size={16} />}
                variant="tertiary-neutral"
                size="small"
                onClick={onDictate}
                aria-label="Dictate"
              />
              {mode === "edit" && (
                <Button
                  variant="tertiary"
                  size="small"
                  prefix={<Icon name="content_copy" size={14} />}
                  onClick={onCopy}
                >
                  Copy
                </Button>
              )}
            </>
          )}

          {/* Dictating / Processing mode: inline action bar */}
          {(isDictating || isProcessing) && (
            <>
              <span className="flex items-center gap-[4px] mr-[4px]">
                {isProcessing ? (
                  <span className="material-symbols-rounded animate-spin text-[var(--foreground-secondary,#666)]" style={{ fontSize: 16, lineHeight: 1 }}>
                    sync
                  </span>
                ) : (
                  <Icon
                    name="mic"
                    size={16}
                    className="text-[var(--accent,#1132ee)]"
                  />
                )}
                <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">
                  Dictate
                </span>
              </span>
              <Button variant="tertiary" size="small" onClick={onSave}>
                Save
              </Button>
              <Button variant="tertiary-neutral" size="small" onClick={onCancel}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-[12px] py-[10px] flex-1 min-h-[80px]">
        {isEditable ? (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[80px] outline-none resize-none t-body-sm leading-[1.5] text-[var(--foreground-primary,#1a1a1a)] placeholder-[#999] bg-transparent"
          />
        ) : (
          <p
            className={`t-body-sm leading-[1.5] ${
              isEmpty
                ? "text-[var(--foreground-tertiary,#999)]"
                : "text-[var(--foreground-primary,#1a1a1a)]"
            }`}
          >
            {isEmpty ? placeholder : value}
          </p>
        )}
      </div>
    </div>
  );
}
