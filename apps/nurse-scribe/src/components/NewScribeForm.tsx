import React, { useState, useRef, useEffect } from "react";
import { TextField, ButtonGroup, Button, Menu, MenuItem, Icon } from "@ds/ui";

const TEMPLATES = [
  "Admission Assessment",
  "Shift Assessment",
  "Handoff",
  "End of Shift Narrative",
  "Pre Admission Summary",
  "Discharge",
  "ED Gold Standard - HCA",
  "Progress Note",
  "Meeting Note",
];

export type NewScribeFormHandle = {
  fillName: (name: string) => void;
  clear: () => void;
};

type Props = {
  title: string;
  firstName: string;
  lastName: string;
  template: string;
  visitType: string;
  onFirstName: (v: string) => void;
  onLastName: (v: string) => void;
  onTemplate: (v: string) => void;
  onVisitType: (v: string) => void;
  onStart: () => void;
};

export function NewScribeForm({
  title, firstName, lastName, template, visitType,
  onFirstName, onLastName, onTemplate, onVisitType, onStart,
}: Props) {
  const [templateOpen, setTemplateOpen] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (templateRef.current && !templateRef.current.contains(e.target as Node)) {
        setTemplateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canStart = Boolean((firstName || lastName) && template);

  return (
    <div className="flex-1 flex flex-col items-center overflow-y-auto bg-white pt-[64px]">
      <div className="w-[480px]">
        <h1 className="t-title-xl text-center text-[var(--foreground-primary,#1a1a1a)] mb-[32px]">
          {title}
        </h1>

        <div className="flex flex-col gap-[16px]">
          <TextField
            label="First name"
            value={firstName}
            onChange={onFirstName}
            placeholder="Enter patient first name"
            size="L"
          />
          <TextField
            label="Last name"
            value={lastName}
            onChange={onLastName}
            placeholder="Enter patient last name"
            size="L"
          />

          <div className="flex gap-[12px]">
            <div ref={templateRef} className="flex flex-col flex-1 gap-[4px] relative">
              <TextField
                label="Template"
                value={template}
                placeholder="Select template"
                size="L"
                readOnly
                onClick={() => setTemplateOpen((o) => !o)}
                suffix={<Icon name={templateOpen ? "arrow_drop_up" : "arrow_drop_down"} size={20} />}
                className="cursor-pointer"
              />
              {templateOpen && (
                <div className="absolute left-0 right-0 top-full mt-[4px] z-20">
                  <Menu className="w-full max-h-[240px] overflow-y-auto">
                    {TEMPLATES.map((t) => (
                      <MenuItem
                        key={t}
                        label={t}
                        selected={template === t}
                        onClick={() => { onTemplate(t); setTemplateOpen(false); }}
                      />
                    ))}
                  </Menu>
                </div>
              )}
            </div>

            <div className="flex flex-col flex-1 gap-[4px]">
              <label className="t-title-xs text-[var(--foreground-primary,#1a1a1a)]">Visit type</label>
              <ButtonGroup
                size="large"
                value={visitType}
                onChange={onVisitType}
                className="w-full"
                items={[
                  { label: "In-person", value: "In-Person" },
                  { label: "Virtual", value: "Virtual" },
                ]}
              />
            </div>
          </div>

          <Button
            variant="primary"
            size="large"
            disabled={!canStart}
            onClick={onStart}
            prefix={<Icon name="mic" size={20} />}
            className="w-full mt-[8px]"
          >
            Start recording
          </Button>
        </div>
      </div>
    </div>
  );
}
