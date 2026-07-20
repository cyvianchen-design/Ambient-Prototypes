import React, { useRef, useEffect } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { IconButton } from "./Button";

export type ScribeLongFieldMode =
  | "view"
  | "edit"
  | "dictating"
  | "processing";

export type ScribeLongFieldProps = {
  sectionTitle?: string;
  value?: string;
  children?: React.ReactNode;
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
};

export function ScribeLongField({
  sectionTitle,
  value = "",
  children,
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
}: ScribeLongFieldProps) {
  const editing = mode === "edit" || mode === "dictating" || mode === "processing";
  const isEmpty = value.trim().length === 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [value, editing]);

  return (
    <div className={`flex flex-col gap-[4px] ${className}`}>

      {/* ── Title row: flush-left title + right-aligned actions ──── */}
      {sectionTitle && (
        <div className="flex items-center gap-[4px] min-h-[28px]">
          <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)] flex-1 min-w-0 truncate">
            {sectionTitle}
          </span>

          {editing ? (
            <div className="flex items-center gap-[2px] shrink-0">
              <Button
                variant="tertiary"
                size="small"
                prefix={
                  <Icon
                    name={mode === "processing" ? "sync" : "mic"}
                    size={14}
                    className={mode === "processing" ? "animate-spin" : ""}
                  />
                }
                onClick={onDictate}
              >
                Dictate
              </Button>
              <Button variant="tertiary" size="small" onClick={onSave}>Save</Button>
              <Button variant="tertiary-neutral" size="small" onClick={onCancel}>Cancel</Button>
            </div>
          ) : isEmpty ? (
            <div className="flex items-center gap-[2px] shrink-0">
              <IconButton size="small" variant="tertiary" icon={<Icon name="edit" size={16} />} aria-label="Edit" onClick={onEdit} />
              <IconButton size="small" variant="tertiary" icon={<Icon name="mic" size={16} />} aria-label="Dictate" onClick={onDictate} />
            </div>
          ) : (
            <div className="flex items-center gap-[2px] shrink-0">
              <IconButton size="small" variant="tertiary" icon={<Icon name="edit" size={16} />} aria-label="Edit" onClick={onEdit} />
              <IconButton size="small" variant="tertiary" icon={<Icon name="mic" size={16} />} aria-label="Dictate" onClick={onDictate} />
              <IconButton size="small" variant="tertiary" icon={<Icon name="note_stack_add" size={16} />} aria-label="Add macro" onClick={onAddMacro} />
              <Button variant="tertiary" size="small" prefix={<Icon name="content_copy" size={14} />} onClick={onCopy}>Copy</Button>
            </div>
          )}
        </div>
      )}

      {/* ── Content area ─────────────────────────────────────────── */}
      {editing ? (
        /*
         * Edit: use outline (not border) so the text stays at exactly the
         * same x position as in view mode — outline is painted outside the
         * box model and never shifts layout.
         */
        <div className="relative">
          <textarea
            ref={textareaRef}
            autoFocus
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="block w-full resize-none outline-none rounded-[6px] t-body-md leading-[1.4] text-[#111827] placeholder:text-[var(--foreground-tertiary,#808080)] bg-transparent"
            style={{
              minHeight: 60,
              outline: "1px solid var(--accent, #1132ee)",
              outlineOffset: 0,
              boxShadow: "0 0 0 3px rgba(17,50,238,0.12)",
            }}
          />
        </div>
      ) : (
        /*
         * View: text is flush-left. Hover adds a surface-1 background via
         * a negative-margin bleed — the container bleeds 6px left/right
         * beyond the text, so the rounded bg appears without moving the text.
         */
        <div
          onClick={onEdit}
          className={`mx-[-6px] px-[6px] py-[4px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors ${onEdit ? "cursor-text" : ""}`}
        >
          <p
            className={`t-body-md leading-[1.4] whitespace-pre-wrap m-0 ${
              isEmpty
                ? "text-[var(--foreground-tertiary,#808080)]"
                : "text-[#111827]"
            }`}
          >
            {isEmpty ? placeholder : (children ?? value)}
          </p>
        </div>
      )}
    </div>
  );
}
