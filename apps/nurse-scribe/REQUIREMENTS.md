# nurse-scribe — Requirements

Hard functional requirements that must survive any layout iteration. This is a nurse/hospitalist ambient-scribe app.

## Design system
- Every interactive/display element uses a `@ds/ui` component — no raw form controls or inline re-implementations of existing components.
- Use `.t-*` type utilities and design tokens (`var(--…)`); no hardcoded hex, font sizes, or all-caps text.

## Primary navigation
- The visits tab is labelled **Patients**.

## Patients tab (previsit)
- The secondary nav follows the visit-tab pattern: a date-label header with prev/next day arrows, the patient list, and a single **Start Instant Visit** primary CTA.
- Patient rows use the shared `SecondaryNavItem` (visits pattern): line 1 is the patient name with a **clinical status badge** (Admitted, Observation, Critical, etc.); line 2 is `age · gender · chief complaint` with the bed/room location in the right slot.
- Selecting a patient opens their **previsit (P360)** page. The header shows the patient name + `age · gender · chief complaint · bed`, and on the right: a refresh control with an "Updated …" timestamp, thumbs up/down, and an overflow (⋮) menu.
- The previsit body is a comprehensive, **nurse-focused** patient story: at a glance, alerts & precautions (code status, isolation, fall risk, allergies, VTE prophylaxis), pending tasks this shift, lines/drains/airways, activity & mobility, pain, skin & wounds, diet & elimination, recent vitals, active problems, medications, labs, imaging, hospitalist & specialist note summaries, and discharge planning — with inline citation source chips.
- Section timeframes are **timestamps** (e.g. "Last recorded Jun 22, 14:32"), not "since last visit" — these are ED/hospitalized patients with no discrete outpatient visit.
- A right-hand side panel with **Course / Assistant / Sources** tabs and a pinned "Ask assistant" composer that stays across tabs. **Course** (the default) is a chronological timeline of the patient's stay — including all nurse notes, highlighted — auto-scrolled to the bottom ("now"). It is guided by **markers** (flush-left headers with an icon) at shift changes or major patient events — e.g. admitted to ED, admitted to inpatient unit, shift started for a nurse, your shift started (highlighted), through to now / discharged. The line is **continuous within a marker's group and breaks at each marker**. **Major events** (nurse notes, key milestones, "now") get a filled dot; **minor events** have no dot and ride the line. Each event shows its date grouped with the time (e.g. "Today · 09:15") in **24-hour** time. Entries positioned by their **clinical/shift time**, not their save time; when a note was documented at a different time (written late / started early) it shows a subtle "documented HH:MM". Entries backed by an **EHR report** (signed note, lab result, imaging) are **clickable** — surface/1 on hover — and open the **source document** in the panel (back to return). **Assistant** has suggested prompts; **Sources** lists the record sources.
- A bottom bar with a template selector and **Start recording** (filled mic icon; opens the full-screen recording view). No visit-type toggle — all patients are in-person.

## Recording
- Full-screen recording view: gradient background, Recording/Paused label, live timer, mic-source selector, animated waveform, and **Pause recording** + **End visit** controls. End visit returns to the app.
- A **Cue Sheet** panel lists condition-aware cues in three tiers: **Required** (red), condition-tagged **"Also relevant for this patient"**, and **Captured** (checked, struck-through, and kept visible — never removed).
- The Cue Sheet shows a live transcript feed and a header status (`N required missing` / `Required done` / `All clear`).

## Scribes tab
- Opening the Scribes tab lands directly on the **most recent note of the first patient** (the review/edit view) — not an empty "new scribe" form.
- The secondary nav groups scribes by patient. Within a patient, notes are ordered **chronologically** — earliest at the top, most recent at the bottom.
- When a patient has more than two notes, the earlier ones are **collapsed by default** behind an expandable "N earlier notes" toggle, leaving the two most recent notes visible; the currently selected note is always shown even if it is an earlier one.
- Each scribe is a **one-line row**: the timestamp leads, followed by the note type, with its sync-status badge in the right slot; the note title reads as indented under the patient name.
- Sync-status badges use a reduced, DS-aligned set: **Draft**, **Syncing**, **Synced**, **Error**.
- Hovering or clicking a patient opens a **floating menu** of all their documentation types, each with its sync-status badge, to open.
- A filter panel (date range / sort / status / note type) with apply + reset.

## Scribe detail (review & edit)
- Tab switcher: template tab + **Transcripts**; the Transcripts tab is non-clickable when the scribe has no transcript.
- A **Citation** toggle reveals citation badges; hovering a badge shows the source transcript quote.
- Short fields use the **scribe short-field** component; its field label is a Title/S. Single-select shows the value with a dropdown-arrow suffix and opens a **Menu popover** (no radio buttons). Multiselect uses removable chips with an "add" affordance.
- Long/narrative fields use the **scribe long-field** component, which reads like the short field: no chrome by default; hovering reveals a surface-1 background and a Dictate / Add macro / Copy toolbar; clicking enters an active outlined textarea with Dictate / Save / Cancel.
- Multiselect chip removal shows an undo snackbar.
- Required fields show a "Required — tap to fill" state, with a top pager to jump between missing fields.
- Section headers have **no divider beneath them**; a **divider separates sections**; there is **no horizontal section jump-nav**.
- While scrolling the form, the **current section name stays pinned** at the top of the content area; clicking it opens a Menu of all sections to jump to any one.
- Per-section Copy; **Sync to EHR** (with a sign-&-sync confirmation for End of Shift Narrative).
- A right-hand side panel with **Assistant** and **Sources** tabs (no Course tab — the stay timeline is previsit-only) and the same pinned "Ask assistant" composer.
