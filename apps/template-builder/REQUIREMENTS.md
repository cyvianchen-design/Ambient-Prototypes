# template-builder — Requirements

Hard functional requirements that must survive any layout iteration. Each is written as something the user can do.

## Navigation
- Switch between "My Templates" and "Shared Templates" via the Customize secondary nav. Any provider can create and edit their own templates under My Templates (it is not admin-only); Shared Templates are provided to the user and are more read-oriented.
- Select among templates (SOAP Note, Progress Note, Initial Evaluation, Annual Wellness Exam) in each section.

## Subsections (both views)
- Reorder subsections within a section via drag-and-drop.
- Rename a subsection inline (click the title to edit).
- My Templates can add a subsection to a section, and delete a subsection (danger action).

Each subsection's settings are organized into two conceptual groups:

### Template instruction (what to capture + section behavior)
- Stands on its own, separate from formatting.
- Behavior / status is part of this group (it's section behavior, not presentation). My Templates: Standard / Optional. Shared Templates: Standard / Optional / Disabled. The status must be changeable wherever the subsection is edited.
- Instruction text — My Templates: directly editable. Shared Templates: hidden by default with a control to reveal/hide; read-only.

### Formatting (how it's presented)
Groups everything about presentation together:
- Format — from the full option set (Auto, Paragraph, Numbers by Diagnosis, Bullets by Diagnosis, Bullets by Body Systems, Flat Bullets), each with its description.
- Length (Auto, Standard, Concise, Detailed).
- Show title in note toggle.
- Macros — a subsection with macros shows a list with per-macro enable toggles. My Templates can add macros; a subsection with no macros shows only an "Add Macro" affordance (no empty container).
- Custom formatting — supplementary free text for anything the settings above don't cover.

## Preview
- A live preview of the rendered note is available on the screen.
- A "Save Template" action is present.
