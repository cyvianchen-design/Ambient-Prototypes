import React, { useState } from "react";
import { Button, Icon, PrimaryNav, SmartSuggestion } from "@ds/ui";

const globalItems: { id: string; label: string; icon?: string; iconEl?: React.ReactNode }[] = [
  { id: "note-prefs",    label: "Note Preferences",   icon: "tune" },
  { id: "summaries",     label: "Summaries & Letters", icon: "edit_document" },
  { id: "dot-phrases",   label: "Dot Phrases",         icon: "chat_paste_go" },
  { id: "macro-library", label: "Macro Library",       icon: "note_stack" },
  { id: "personal-dict", label: "Personal Dictionary", icon: "book_4" },
  { id: "carry-forward", label: "Carry Forward",       icon: "event_upcoming" },
  { id: "previsit",      label: "Pre-visit Summary",   icon: "admin_meds" },
  { id: "smart-suggest", label: "Smart Suggestions",   iconEl: <SmartSuggestion size={20} /> },
];

const templateItems = [
  { id: "soap-note",       label: "SOAP Note",            isDefault: true },
  { id: "progress-note",   label: "Progress Note" },
  { id: "initial-eval",    label: "Initial Evaluation" },
  { id: "annual-wellness", label: "Annual Wellness Exam" },
];

export type NavSection = "my-templates" | "shared-templates";

type Props = {
  children: React.ReactNode;
  activeSection: NavSection;
  selectedTemplate: string;
  onSectionChange: (section: NavSection) => void;
  onTemplateChange: (templateId: string) => void;
};

export function CustomizeLayout({
  children,
  activeSection,
  selectedTemplate,
  onSectionChange,
  onTemplateChange,
}: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-white font-['Lato',sans-serif]">
      <PrimaryNav activeItem="customize" />

      {/* Secondary nav */}
      <div className="w-[220px] shrink-0 h-full flex flex-col bg-white border-r border-[var(--shape-outline)]">
        {/* Header */}
        <div className="h-[48px] shrink-0 flex items-center px-[16px]">
          <span className="t-title-md text-[var(--foreground-primary)]" style={{ fontFeatureSettings: "'ss07'" }}>
            Customize
          </span>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Global Settings */}
          <div className="px-[12px] h-[30px] flex items-center">
            <span className="t-title-xs text-[var(--foreground-secondary)]">Global Settings</span>
          </div>
          {globalItems.map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center gap-[10px] px-[16px] h-[42px] hover:bg-[var(--surface-1)] cursor-pointer text-left transition-colors"
            >
              <span className="text-[var(--accent)] flex items-center shrink-0">
                {item.iconEl ?? <Icon name={item.icon!} size={20} filled />}
              </span>
              <span className="t-title-sm text-[var(--foreground-primary)]" style={{ fontFeatureSettings: "'ss07'" }}>
                {item.label}
              </span>
            </button>
          ))}

          {/* My Templates */}
          <div className="px-[12px] h-[30px] flex items-center mt-[8px]">
            <span className="t-title-xs text-[var(--foreground-secondary)]">My Templates</span>
          </div>
          {templateItems.map((item) => {
            const isSelected = activeSection === "my-templates" && selectedTemplate === item.id;
            return (
              <button
                key={`my-${item.id}`}
                onClick={() => { onSectionChange("my-templates"); onTemplateChange(item.id); }}
                className={`w-full flex items-center gap-[6px] h-[42px] cursor-pointer text-left transition-colors relative ${
                  isSelected
                    ? "bg-[var(--litmus-25)] border-r-[2px] border-r-[var(--accent)] pl-[16px] pr-[10px]"
                    : "px-[16px] hover:bg-[var(--surface-1)]"
                }`}
              >
                <div className="flex-1 min-w-0 flex items-center gap-[6px] overflow-hidden">
                  <span className="shrink-0 t-title-sm text-[var(--foreground-primary)]" style={{ fontFeatureSettings: "'ss07'" }}>
                    {item.label}
                  </span>
                  {item.isDefault && (
                    <span className="t-body-sm text-[var(--foreground-primary)] truncate">(default)</span>
                  )}
                </div>
                {isSelected && (
                  <span className="shrink-0 text-[var(--foreground-secondary)] flex items-center">
                    <Icon name="more_horiz" size={16} />
                  </span>
                )}
              </button>
            );
          })}

          {/* Shared Templates */}
          <div className="px-[12px] h-[30px] flex items-center mt-[8px]">
            <span className="t-title-xs text-[var(--foreground-secondary)]">Shared Templates</span>
          </div>
          {templateItems.map((item) => {
            const isSelected = activeSection === "shared-templates" && selectedTemplate === item.id;
            return (
              <button
                key={`shared-${item.id}`}
                onClick={() => { onSectionChange("shared-templates"); onTemplateChange(item.id); }}
                className={`w-full flex items-center gap-[6px] h-[42px] cursor-pointer text-left transition-colors relative ${
                  isSelected
                    ? "bg-[var(--litmus-25)] border-r-[2px] border-r-[var(--accent)] pl-[16px] pr-[10px]"
                    : "px-[16px] hover:bg-[var(--surface-1)]"
                }`}
              >
                <div className="flex-1 min-w-0 flex items-center gap-[6px] overflow-hidden">
                  <span className="shrink-0 t-title-sm text-[var(--foreground-primary)]" style={{ fontFeatureSettings: "'ss07'" }}>
                    {item.label}
                  </span>
                  {item.isDefault && (
                    <span className="t-body-sm text-[var(--foreground-primary)] truncate">(default)</span>
                  )}
                </div>
                {isSelected && (
                  <span className="shrink-0 text-[var(--foreground-secondary)] flex items-center">
                    <Icon name="more_horiz" size={16} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="shrink-0 p-[12px] border-t border-[var(--shape-outline)]">
          <Button variant="secondary" size="small" prefix={<Icon name="add" size={16} />} className="w-full">
            Add Template
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
