# Macros — Functional Requirements

Hard requirements that must survive any layout iteration. Add when functionality is confirmed working. Remove only when explicitly told to. Skip only after explicit confirmation in response to a warning.

## Navigation & Layout
- User can see a secondary nav styled like the Customize page (Global Settings + Template Settings sections)
- User can see template sections as cards with section type, length, macro list with toggles, and pagination
- User can see "(default)" label immediately after the template name, not aligned to the far right

## Macro List
- User can hover over a macro row and see the background change to surface/1
- User can click a macro row to open a detail drawer (with backdrop overlay behind it)
- User can see collapsed sections for deactivated/disabled items

## Macro Content Editor — Smart Fields
- User can type "/" to open a command menu offering text, dropdown, or number smart field types
- User can select a smart field type and get a popup to configure it
- User can click into an existing smart field to edit it — opens the same popup as "/", not a separate flow
- User can change the type of an existing smart field from the edit popup
- User can delete a smart field from the edit popup
- User can convert a smart field to plain text from the edit popup
- User can also delete a smart field by deleting its text directly in the editor
- User can trigger "/" even when typed directly after a letter (no preceding space required)
- User can have a space auto-inserted after a smart field when grammatically appropriate
- User can see dropdowns with more than 2 options displayed as "[first option] + N more"

## Drawer — Settings Panel
- User can see "Optional settings" as a collapsed section by default
- User can see settings that have been filled/applied move out of Optional settings into the main view
- User can see Update mode formatted like Optional settings, with the text field on the right side of the title

## Fields
- User can interact with Year and Gender dropdowns using the app's Menu component (not OS native dropdowns)

## Smart Field Visual Directions
- User can switch between three directions: Link, Chip, Token
- User can see hover states on all three directions
- User can see Token direction with accent outline (transparent/accent/10 default, transparent/20 on hover, litmus/50 background on hover)
- User can see Link direction following standard link hover behavior (not opacity-down)
