# Previsit Customization — Functional Requirements

Hard requirements that must survive any layout iteration. Add to this list when new functionality is confirmed working. Never remove entries — if something changes, update the description instead.

## Patient Header
- User can open a more-options dropdown menu via the overflow icon
- User can close the menu by clicking outside it
- User can open the Customize drawer via "Customize Previsit" in the menu

## Patient Consent
- User can toggle the patient consent checkbox

## Section Ordering
- User can reorder previsit sections by dragging
- A drop indicator (blue border or blue divider bar) shows the target position while dragging

## Section Visibility
- User can remove a section; it moves to a "Not included" area
- User can restore a removed section from the "Not included" area via an "Add" button

## Sub-section Visibility
- User can remove an individual sub-section within a section; it moves to a "Not included" area
- User can restore a removed sub-section from the "Not included" area

## Timeframe Selection
- User can change the timeframe for any section that supports it via a chip that opens a dropdown
- Timeframe can be changed independently per sub-section
- Fixed-label sections (Vitals, Active Meds, etc.) show a non-interactive timeframe chip

## Inform Note Toggle
- User can toggle the "Inform note" switch per section to include or exclude it from the clinical note

## Customize Drawer
- Drawer opens over the main content; body scroll locks while open
- User can close the drawer via X button, Cancel button, or clicking the backdrop overlay
- All drag, delete, restore, and timeframe interactions work inside the drawer
- Main previsit view is read-only while the drawer is open
