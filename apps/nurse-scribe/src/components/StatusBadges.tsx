import React from "react";
import { Badge, Icon } from "@ds/ui";

// Clinical patient statuses shown in the Visits list.
// DS Badge variants: success | info | warning | error | default
const PATIENT_STATUS: Record<string, { variant: "success" | "info" | "warning" | "error" | "default"; icon: string }> = {
  "In Queue":          { variant: "default", icon: "schedule" },
  "Admitted":          { variant: "info",    icon: "check_circle" },
  "Observation":       { variant: "info",    icon: "visibility" },
  "Discharge Pending": { variant: "warning", icon: "pending" },
  "Post-Op":           { variant: "success", icon: "healing" },
  "Critical":          { variant: "error",   icon: "error" },
};

export function PatientStatusBadge({ status }: { status: string }) {
  const cfg = PATIENT_STATUS[status] ?? { variant: "default" as const, icon: "circle" };
  return <Badge label={status} variant={cfg.variant} icon={<Icon name={cfg.icon} size={13} />} className="shrink-0 whitespace-nowrap" />;
}

// Scribe sync statuses shown in the Scribes list.
// Reduced to four states that mirror the DS VisitStatus vocabulary (variant + filled icon):
// Draft → Syncing (queued or in flight) → Synced, with Error off the happy path.
const SCRIBE_STATUS: Record<string, { variant: "success" | "info" | "warning" | "error" | "default"; icon: string }> = {
  "Draft":      { variant: "default", icon: "edit_note" },
  "Incomplete": { variant: "warning", icon: "warning" },
  "Generated":  { variant: "success", icon: "check" },
  "Syncing":    { variant: "info",    icon: "autorenew" },
  "Synced":     { variant: "success", icon: "cloud_done" },
};

export function ScribeStatusBadge({ status }: { status: string }) {
  const cfg = SCRIBE_STATUS[status] ?? { variant: "default" as const, icon: "circle" };
  return (
    <Badge
      label={status}
      variant={cfg.variant}
      icon={
        <span
          className="material-symbols-rounded"
          style={{ fontSize: 14, fontVariationSettings: "'FILL' 1", lineHeight: 1 }}
        >
          {cfg.icon}
        </span>
      }
      className="shrink-0 whitespace-nowrap"
    />
  );
}
