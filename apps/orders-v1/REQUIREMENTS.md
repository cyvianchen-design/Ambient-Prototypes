# Orders — Functional Requirements

Hard requirements that must survive any layout iteration. Add to this list when new functionality is confirmed working. Never remove entries — if something changes, update the description instead.

## Tabs & Navigation
- User can switch between Clinical Note, Diagnostics & Orders, and Transcript tabs
- User can switch between patients in the secondary nav

## ICD-10 Codes
- User can check / uncheck individual ICD-10 codes
- User can select all / deselect all ICD-10 codes (indeterminate state when partially selected)
- User can click an ICD-10 code to replace it via a searchable popover
- User can add a new ICD-10 code via "Add ICD-10 code" and a searchable popover
- User can remove an ICD-10 code via the X button (revealed on hover)
- User can open an inline evidence card for any ICD-10 code showing supporting transcript excerpts
- User can close the evidence card via its X button

## Individual Orders
- User can check / uncheck individual orders
- User can select all / deselect all orders (indeterminate state when partially selected)
- User can click an order name to replace it via a searchable popover
- User can link or replace the ICD-10 code on an order via a chip popover; linked ICD is auto-added to the list if not already present
- User can change the company/lab for an order via a chip popover
- User can add a new order via "Add order" and a searchable popover
- User can remove an individual order via the X button (revealed on hover)
- User can open an inline evidence card for any order showing supporting transcript excerpts

## Order Sets
- User can check / uncheck an entire order set (indeterminate state when partially selected)
- User can check / uncheck individual children within an order set
- User can click an order set name to replace it via a searchable popover
- User can convert an order set into a single individual order
- User can change the default lab company for an order set (cascades to all lab-type children)
- User can change the default imaging company for an order set (cascades to all imaging-type children)
- User can change the company for an individual child within an order set via a chip popover
- User can link or replace the ICD-10 code for a child within an order set; auto-adds ICD to list if not present
- User can remove an entire order set via the X button (revealed on hover)
- User can open an inline evidence card for any order set

## Popovers (shared)
- User can search/filter within any open popover via a text input
- Clicking outside or scrolling outside a popover closes it
