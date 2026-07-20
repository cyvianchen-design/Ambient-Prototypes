# Orders — Functional Requirements

Hard requirements that must survive any layout iteration. Add when functionality is confirmed working. Remove only when explicitly told to. Skip only after explicit confirmation in response to a warning.

## ICD-10 Code Rows
- User can see two lines per code: provider vernacular (Title/S, primary color) on line 1, system vernacular (Body/S, secondary color) on line 2
- User can check a checkbox in front of each code to select it for sync; checkbox and icon buttons are center-aligned with line 1 (not the whole container)
- User can select all / deselect all codes (indeterminate state when partially selected)
- User can click a code to replace it via a searchable popover
- User can add a new ICD-10 code via "Add ICD-10 code" and a searchable popover
- User can delete a code via an X icon button at the far right, revealed on hover; hover background fills the full row width
- User can click an info icon button to reveal an evidence card with clinical note quotes beneath the code row
- User can close the evidence card via a close button in the top-right of the card
- User can see a "Confident" green Badge on high-confidence codes; no badge on low-confidence
- User can see already-synced codes with a checked, disabled checkbox — cannot be unchecked
- User can reorder codes via drag-and-drop; a blue horizontal divider shows the drop target position

## Individual Orders
- User can check / uncheck individual orders (indeterminate state when partially selected on sets)
- User can select all / deselect all orders
- User can click an order name to replace it via a searchable popover
- User can link or replace the ICD-10 code on an order via a chip popover; linked ICD is auto-added to the list if not present
- User can change the vendor/lab for an order via a chip popover
- User can add a new order via "Add order" and a searchable popover
- User can delete an order via an X icon button at the far right (not immediately following the info button), revealed on hover
- User can hover anywhere on the row and see the row highlight — making clear which item the X will affect
- User can click an info icon button (right-aligned end of row) to open an evidence card citing both clinical note and transcript
- User can see evidence distinguishing note quotes from transcript quotes
- User can see a "Confident" green Badge on high-confidence orders; no badge on low-confidence
- User can see already-synced orders with: checked + disabled checkbox, everything greyed out, chip disabled, no delete button, info button still available

## Order Sets
- User can check / uncheck an entire order set (indeterminate when partially selected)
- User can check / uncheck individual children within an order set
- User can click an order set name to replace it via a searchable popover
- User can convert an order set into a single individual order
- User can change the default lab company for an order set (cascades to all lab-type children)
- User can change the default imaging company for an order set (cascades to all imaging-type children)
- User can change the company for an individual child within an order set via a chip popover
- User can link or replace the ICD-10 code for a child; auto-adds ICD to list if not present
- User can delete an entire order set via X, revealed on hover
- User can open an evidence card for any order set

## Popovers (shared)
- User can search/filter within any open popover via a text input
- User can scroll within a popover without it closing
- Clicking outside closes the popover; scrolling outside does not
- User can see the codes list split into "Suggested" and "All Codes" sections
- User can see the orders list split into "Suggested", "Your Order Sets", and "All Orders" sections

## Multi-code Direction
- User can click a "+" icon on an order row to add multiple codes to that order
- User can delete an individual code chip on an order via its dismiss "×" without affecting the row
- User can click a dismissable chip to switch the code (chip acts as both selector and dismissable)
- User can see chips that support click-only, dismiss-only, or both (split-button pattern); dropdown arrow is removed when both behaviors are active
- User can see multiple selected codes in one chip, separated by commas, truncated to "first code, +[x]" when more than 2

## Check Codes Direction
- User can click the code chip on an order to open a popover with checkboxes, letting them assign multiple codes to that order
- User can only see codes already attached to the current note in this popover (adding new codes happens in the codes section)
- User can see the Check codes direction placed to the right of Multi-code in the switcher

## Group by Dx / Confidence Tiers Direction
- User can see codes each with sub-sections: "Confident" orders, "Suggested" orders, "In EHR" orders — no dividers, no indentation
- User can use "Select all" as a checkbox item (not button) with checkbox hover state in the codes section
- User can use "Select all" and "Select confident" as checkbox items (not buttons), with checkbox hover states in the orders section
- User can reorder codes via drag-and-drop within the grouped view; drop commits the new order
- User can reassign which ICD code an order is associated with (must be present in Group by Dx directions)
