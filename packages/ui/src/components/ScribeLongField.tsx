import React from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";

export type ScribeLongFieldMode =
  | "view"        // read-only; on hover reveals surface-1 bg + Dictate / Add macro / Copy
  | "edit"        // active outlined textarea; Dictate / Save / Cancel
  | "dictating"   // recording in progress
  | "processing"; // AI processing

export type ScribeLongFieldProps = {
  sectionTitle?: string;
  value?: string;
  onChange?: (v: string) => void;
  mode?: ScribeLongFieldMode;
  onEdit?: () => void;
  onDictate?: () => void;
  onAddMacro?: () => void;
  onCopy?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  /** Suppress the view-mode toolbar/overlay actions (host renders them, e.g. in a section header). */
  bare?: boolean;
};

// Scribe long-field — reads like the short field: no chrome by default; hover reveals a
// surface-1 background + action toolbar; click enters an active outlined textarea.
export function ScribeLongField({
  sectionTitle,
  value = "",
  onChange,
  mode = "view",
  onEdit,
  onDictate,
  onAddMacro,
  onCopy,
  onSave,
  onCancel,
  placeholder = "No relevant information documented in transcript",
  className = "",
  bare = false,
}: ScribeLongFieldProps) {
  const editing = mode === "edit" || mode === "dictating" || mode === "processing";
  const isEmpty = value.trim().length === 0;

  return (
    <div className={`group relative flex flex-col gap-[4px] ${className}`}>
      {/* Toolbar row — shown when editing (Dictate/Save/Cancel) or when a section title is present. */}
      {(editing || sectionTitle) && (
        <div className="flex items-center justify-between gap-[8px] min-h-[28px]">
          {sectionTitle ? (
            <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)] truncate min-w-0">{sectionTitle}</span>
          ) : (
            <span />
          )}
          <div className={`flex items-center gap-[2px] shrink-0 ${editing ? "" : "opacity-0 group-hover:opacity-100 transition-opacity"}`}>
            {editing ? (
              <>
                <Button variant="tertiary" size="small" prefix={<Icon name={mode === "processing" ? "sync" : "mic"} size={14} className={mode === "processing" ? "animate-spin" : ""} />} onClick={onDictate}>Dictate</Button>
                <Button variant="tertiary" size="small" onClick={onSave}>Save</Button>
                <Button variant="tertiary-neutral" size="small" onClick={onCancel}>Cancel</Button>
              </>
            ) : (
              <>
                <Button variant="tertiary" size="small" prefix={<Icon name="mic" size={14} />} onClick={onDictate}>Dictate</Button>
                <Button variant="tertiary" size="small" prefix={<Icon name="bolt" size={14} />} onClick={onAddMacro}>Add macro</Button>
                <Button variant="tertiary" size="small" prefix={<Icon name="content_copy" size={14} />} onClick={onCopy}>Copy</Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* No title row: reveal the view actions as an overlay so they don't reserve vertical space. */}
      {!editing && !sectionTitle && !bare && (
        <div className="absolute right-[4px] top-[2px] z-[1] flex items-center gap-[2px] rounded-[6px] bg-[var(--surface-1,#f7f7f7)] opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="tertiary" size="small" prefix={<Icon name="mic" size={14} />} onClick={onDictate}>Dictate</Button>
          <Button variant="tertiary" size="small" prefix={<Icon name="bolt" size={14} />} onClick={onAddMacro}>Add macro</Button>
          <Button variant="tertiary" size="small" prefix={<Icon name="content_copy" size={14} />} onClick={onCopy}>Copy</Button>
        </div>
      )}

      {/* Content */}
      {editing ? (
        <textarea
          autoFocus
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          rows={Math.max(3, value.split("\n").reduce((acc, l) => acc + Math.max(1, Math.ceil(l.length / 60)), 0))}
          className="w-full resize-none outline-none rounded-[6px] border border-[var(--accent,#1132ee)] px-[10px] py-[8px] t-body-md leading-[1.5] text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[var(--foreground-tertiary,#808080)] bg-white"
        />
      ) : (
        <div
          onClick={onEdit}
          className="rounded-[6px] px-[8px] py-[6px] cursor-text transition-colors group-hover:bg-[var(--surface-1,#f7f7f7)]"
        >
          <p className={`t-body-md leading-[1.5] whitespace-pre-wrap m-0 ${isEmpty ? "text-[var(--foreground-tertiary,#808080)]" : "text-[var(--foreground-primary,#1a1a1a)]"}`}>
            {isEmpty ? placeholder : value}
          </p>
        </div>
      )}
    </div>
  );
}
