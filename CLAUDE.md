# Ambient Prototypes — Claude Instructions

## Session Start Behavior

When a new session starts, confirm the repo is set up (pull latest, check dependencies), then immediately ask:

> "What do you want to build? Give me a name for the prototype and share a description or Figma link. If you're sharing Figma, link to a single screen or a specific component — not a whole flow or a full component set, as too much context at once makes it hard to build accurately. Start focused and we can add more from there."

After the first screen is built, include a short note at the end of your response:

> "Whenever you're happy with this direction or want to explore a different approach, just say 'I want to create a new direction' and I'll branch off without touching what we've built."

Don't repeat this every message — just once after the initial screen is ready. Always guide the user to the next step rather than waiting for them to ask.

## Information Lookup Order

For any question about how this project works — what a "direction" is, what rounds exist, what ports are used, what components are available — always check the codebase first:
1. Read `CLAUDE.md`
2. Read `App.tsx` for the relevant app
3. Search `packages/ui` or `apps/<project>/src/`

Never use Notion, web search, or other external tools to answer questions about this project's own conventions. External tools are only for specs outside this repo (e.g. a third-party API or a Figma file link).

---

## Repo Structure

```
packages/ui/          # Shared design system — components, tokens, icons
apps/<project-name>/  # One folder per prototype app
templates/project/    # Template for new apps (do not edit directly)
scripts/new-project.sh
```

This is a **pnpm workspace monorepo**. Always run installs from the root with `pnpm install`.

---

## Creating a New App

Use the scaffold script — never copy an existing app manually:

```bash
pnpm new-project <project-name>
```

This copies `templates/project/` to `apps/<project-name>/`, replaces the `PROJECT_NAME` placeholder, and runs `pnpm install`. The template already has:

- **Fonts** loaded in `index.html`: Lato (body) + Material Symbols Rounded (icons) via Google Fonts
- **Design tokens** imported in `main.tsx`: `@ds/ui/src/styles/tokens.css`
- **Tailwind** configured to extend the shared config from `packages/ui`
- **VersionSwitcher** wired up in `App.tsx` for round/direction navigation

After scaffolding, add screen files under `src/screens/` and register them in `App.tsx`.

---

## Design System Figma File

**File:** https://www.figma.com/design/p8vIIGE9wPsJI9llj4luac/Scribe-Design-System (file key: `p8vIIGE9wPsJI9llj4luac`)

When a design or screenshot includes a component not yet in `packages/ui`, search for it in this Figma file using the Figma MCP tools (`search_design_system` → `get_design_context`) before building. Apply the token translation rules in the Design Tokens section when reading Figma specs. If the Figma component looks outdated or conflicts with what's in `packages/ui`, flag it and ask the user which is authoritative.

---

## Component Library (`packages/ui`)

### Available components (import from `@ds/ui`)
`Button`, `IconButton`, `Icon`, `Checkbox`, `Chip`, `Switch`, `TextField`, `TextArea`, `Tabs`, `Badge`, `VisitStatus`, `Link`, `PrimaryNav`, `SecondaryNavItem`, `Menu`, `MenuItem`, `MenuHeader`, `MenuSearch`, `Overlay`, `VersionSwitcher`, `Alert`, `Snackbar`, `AudioInputVolume`, `AudioPlayer`, `Avatar`, `ButtonGroup`, `SplitButton`, `RadioButton`, `RadioGroup`, `DatePicker`, `TimePicker`, `Divider`, `Loader`, `Skeleton`, `NotificationDot`, `Highlight`, `MobileHeader`, `StickyButtonBar`, `ListItem`, `ListSection`, `PopUp`, `ProgressBar`, `Pagination`, `StepIndicator`, `StarRating`, `Tooltip`, `PINInput`, `Table`, `TableCell`, `Citation`

### `Menu` / `MenuItem` / `MenuHeader` / `MenuSearch` — composable dropdown menus

```tsx
import { Menu, MenuItem, MenuHeader, MenuSearch } from "@ds/ui";

<Menu className="w-[220px]">
  <MenuSearch value={query} onChange={setQuery} placeholder="Search…" />
  <MenuHeader>Suggested</MenuHeader>
  <MenuItem label="ECG 12-lead" />
  <MenuItem icon={<Icon name="download" size={16} />} label="Download" />
  <MenuItem label="Quest Diagnostics" description="Lab · Standard turnaround" />
  <MenuItem label="Follow-up visit" trailing={<span>05/13/2026</span>} />
  <MenuItem label="Diagnosis" trailing={<Button variant="tertiary" size="small">Add</Button>} />
</Menu>
```

**MenuItem props:**
- `label` — always bold Title/S (13px). No font variants needed; use `description` for secondary text.
- `icon?` — left icon slot, rendered in accent blue
- `description?` — second line below label in 12px regular
- `trailing?` — arbitrary content anchored to the right (text label, action button, etc.). When trailing is present, right padding reduces to `pr-[4px]` so the button edge has balanced visual spacing.
- `selected?`, `disabled?`, `onClick?`

**MenuSearch** bleeds edge-to-edge inside Menu via `-mx-[6px] -mt-[6px]` negative margins with `rounded-t-[12px]`.

**MenuItem variants** (structural, not font-based):
- Label only · Icon + label · Label + description · Trailing label · Label + action · Visit item (custom, app-level)

### `Switch` — toggle control
```tsx
import { Switch } from "@ds/ui";
<Switch checked={true} onChange={(v) => setState(v)} size="XS" />
```
- `size`: `"XS"` (28×16px visual track, 28×28px button hitbox) or `"S"` (34×20px track, default)
- `checked`: controlled boolean
- `onChange`: `(checked: boolean) => void`
- `disabled`: optional boolean

### `Overlay` — scrim / backdrop
```tsx
import { Overlay } from "@ds/ui";
<Overlay variant="blur" fixed onClick={() => setOpen(false)} />
```
- `variant`: `"blur"` (backdrop-blur + dark tint, default) or `"dim"` (dark tint only)
- `fixed`: `true` covers the full viewport including navs (`fixed inset-0`). Defaults to `absolute inset-0`.
- `onClick`: optional dismiss handler
- Always pair `fixed` overlay with a `fixed`-positioned panel (e.g. a drawer) so both cover the full viewport
- Use `z-[150]` for the overlay and `z-[160]` for the panel sitting on top

### DS ownership
**`packages/ui` is owned by Cyvian only.** Contributors must never modify it.

Before any DS-related decision, check who is working by running `git config user.email`:
- `cyvian.chen@commure.com` → Cyvian (DS owner)
- Anything else → contributor

### Missing DS components
**If a needed component doesn't exist in `packages/ui`:**
- **If Cyvian** — stop and tell her before building anything. Ask for the Figma spec so it can be added to `packages/ui` properly.
- **If a contributor** — build the component as a standalone in `apps/<project>/src/components/`. Never touch `packages/ui`. The standalone stays local to that prototype forever; if the component is later added to the DS, future prototypes will use the DS version.

### `PrimaryNav` — shared primary navigation
Every prototype uses `<PrimaryNav activeItem="..." />`. The Ambient logo (28px), nav items, and bottom items are all baked in as defaults — the only thing that varies per prototype is which tab is active.

```tsx
import { PrimaryNav } from "@ds/ui";
// activeItem: "visits" | "scribes" | "customize" | "assistant" | "admin"
<PrimaryNav activeItem="visits" />
```

Never rebuild the nav item list from scratch in an app. To add a new top-level nav item or change defaults, update `PrimaryNav` in `packages/ui`. The `logo`, `items`, and `bottomItems` props are available to override defaults when needed.

**Collapsible sidebar:** Pass `onLogoClick` + `sidebarOpen` to `PrimaryNav` to enable the logo-as-collapse-toggle behavior. On hover, the logo swaps to a `left_panel_close`/`left_panel_open` icon. The layout component owns the `sidebarOpen` state and wires up the handler.

### `IconButton` variants
- `tertiary` (default) — brand accent blue icon (`--accent`), litmus-25 hover bg. Use for interactive actions (refresh, thumbs, overflow menus, etc.)
- `tertiary-neutral` — gray icon (`--foreground-secondary`), neutral hover bg. Use for utility/navigation controls (date arrows, secondary actions).

### `SecondaryNavItem` — patient list items
Shared component used in both scribes and visits secondary navs.
- **Scribes mode** (no `time` prop): left = chiefComplaint + age/gender, right = duration
- **Visits mode** (`time` prop set): left = age · gender · duration, right = appointment time

Patient name is always **Title/S** (13px bold, `tracking-[0.13px]`).

### Layout components per page
Each prototype page that needs a secondary nav has its own layout component (app-level, not in `packages/ui`):
- `orders-v1`: `src/components/ScribeLayout.tsx` — scribes secondary nav, patient list with date groups, "Record New Scribe" CTA
- `previsit-customization`: `src/components/VisitLayout.tsx` — visits secondary nav, daily appointment list with date header + prev/next, "Start Instant Visit" CTA; collapsible sidebar (inline on ≥1024px, overlay on hover for 768–1023px)

### Available icons (import from `@ds/ui`)
`AmbientLogo`, `Dictation`, `Learn`, `MagicEdit`, `MagicButton`, `MagicDocument`, `MenuIcon`, `SmartSuggestion`, `Spinner`

### Material icons
Use the `<Icon name="..." size={N} filled? />` component for any Material Symbols Rounded icon.

### Rules
- **Before writing any UI element, scan the Available components list above.** If there is a DS component that serves the purpose — even partially — use it. Do not build inline versions of things that exist. This applies to every element: navigation, inputs, overlays, badges, loaders, lists, tables, pagination, tooltips, etc.
- **If a needed component doesn't exist in `packages/ui`**, stop immediately and tell the user — do not build a one-off inline version. Ask for the Figma spec so it can be added to the DS properly.
- **Never hardcode colors, font sizes, or spacing** that should come from design tokens
- **Never guess icon names or fill variants** — icons are chosen intentionally. Always get the exact icon name and filled/unfilled state from Figma (via the `data-name` on the icon node in `get_design_context`). If the Figma context isn't available, ask before using a guess. Secondary nav item icons are 20×20px and use the filled style wherever a filled variant exists.

### Hover state guidelines (extracted from DS components)
Hover states must be defined in CSS (not inline styles — `:hover` cannot override `style` attributes). Use a `data-*` attribute as a CSS selector hook when needed.

| Element type | Normal | Hover | Transition |
|---|---|---|---|
| Accent-filled (chip, tag) | bg `--litmus-25` (#f1f3fe) | bg `--litmus-50` (#e7eafd) | `background 150ms` |
| Outlined accent (field token) | bg light tint + border `--accent/10` | bg `--litmus-50` + border `--accent/20` (#1132ee33) | `background 150ms, border-color 150ms` |
| Neutral surface row (menu item, list item) | transparent | bg `--surface-1` (#f7f7f7) | `background 150ms` |
| Primary/filled button | base color | one shade darker (darken token) | `background 150ms` |
| Tertiary text (brand) | transparent | bg `--accent-10` (#1132ee1a) | `background 150ms` |
| Tertiary text (neutral) | transparent | bg `--black-3` (#00000008) | `background 150ms` |
| Link / colored text | color `X-600` | color `X-700` (one step darker — never opacity) | `color 150ms` |

### Dialog / popup layout rules
- **No divider under the header.** No divider above the footer/sticky-button row. Dividers inside dialogs are not part of the DS pattern.
- **Always use `Chip` for removable option tags** — never build custom tag spans. Use `color="neutral"` for user-entered values; `color="accent"` for system/pre-set values.
- **Match `TextField` and `Button` heights.** Both components share the same size scale: `S`/`small` = 28px, `M`/`medium` = 36px, `L`/`large` = 48px (TextField only). Always use the same tier for adjacent field + button pairs (e.g. `TextField size="M"` + `Button size="medium"`).

---

## Design Tokens

Tokens are CSS custom properties defined in `packages/ui/src/styles/tokens.css`. Always use them via `var(--token-name)` in Tailwind arbitrary values or inline styles.

### Key tokens
- `--foreground-primary` (#1a1a1a) — body text
- `--foreground-secondary` (#666) — secondary/subheading text
- `--accent` (#1132ee) — brand blue, links, interactive
- `--foreground-semantic-danger` (#bb1411) — error/danger
- `--surface-1`, `--surface-2`, `--surface-3` — background layers
- `--litmus-25` through `--litmus-500` — brand/indigo color scale (never call this "indigo" — the product has a separate "Indigo" sub-brand; always use "litmus")

### Figma token name translation
Figma uses slash notation — our code uses hyphens:
- `--text/default` → `--foreground-primary`
- `--text/subheading` / `--shape/secondary` → `--foreground-secondary`
- `--text/brand` → `--accent`
- `--surface/3` → `--surface-3`
- `--orange/200` → `--orange-200`

### Corrected token values (differ from Figma)
- `--green-600`: `#3f8d43`
- `--cyan-800`: `#144852`
- `--magenta-300`: `#e27eb7`
- `--neutral-950`, `--neutral-975`: HSL-interpolated additions not in Figma

---

## Spacing

Two contexts with different rules:

**Inside a component** (`packages/ui` or a standalone app-level component)
Any value on the 2px grid is fine: `2`, `4`, `6`, `8`, `10`, `12`, `16`… These tighter increments exist to get component internals (icon padding, label gaps, input chrome) pixel-precise.

**Screen / interface level** (gaps between components, section padding, layout structure in a screen file)
Strict 4px grid only: `4`, `8`, `12`, `16`, `20`, `24`, `32`, `48`… Values like `6px`, `10px`, and `2px` must not appear as layout spacing between components or sections on a screen.

The quick test: if you're spacing two DS components apart, or padding a card/panel/section, use 4px multiples. If you're sizing something *inside* a single component, 2px increments are fine.

---

## Tailwind Usage

- Tailwind JIT requires **static class strings** — never construct class names dynamically (e.g. no `"text-[" + size + "px]"`)
- Use Tailwind arbitrary values for one-off pixel values: `text-[13px]`, `gap-[8px]`, `h-[36px]`
- Use token values via arbitrary properties: `text-[var(--foreground-primary,#1a1a1a)]`
- The fallback value (e.g. `,#1a1a1a`) is required in arbitrary token references so the UI renders without the CSS file loaded

---

## Typography & Style Conventions

- **Never use all-caps text** in UI labels, buttons, or headings — use sentence case or title case only
- **Font**: Lato — loaded via Google Fonts in `index.html`, no local font files needed

### Always use `.t-*` utility classes for text styling — never hardcode

Typography tokens are defined in `packages/ui/src/styles/tokens.css` as both CSS custom properties (`--t-title-sm-size` etc.) and utility classes. **Always use the utility classes directly — never write raw `text-[NNpx]`, `font-bold`, or `tracking-[...]` for type styling.**

```tsx
// Wrong
<span className="text-[13px] font-bold tracking-[0.13px]">Label</span>

// Right
<span className="t-title-sm">Label</span>
```

### Type scale

| Class | Size | Weight | Tracking | Usage |
|---|---|---|---|---|
| `t-title-xs` | 12px | Bold | 0.24px | Primary nav labels |
| `t-title-sm` | 13px | Bold | 0.13px | Section headers, patient names |
| `t-title-md` | 15px | Bold | 0.1px | Date headers |
| `t-title-lg` | 17px | Bold | 0.3px | Section titles |
| `t-title-xl` | 24px | Bold | 0px | Large headings |
| `t-body-xs` | 12px | Regular | 0px | Fine print, captions |
| `t-body-sm` | 13px | Regular | 0.07px | Body text, descriptions |
| `t-body-md` | 15px | Regular | 0.15px | Medium body |
| `t-body-lg` | 17px | Regular | 0.18px | Large body |

Line height is set per-token in tokens.css — do not override with `leading-[...]` unless explicitly asked.

---

## VersionSwitcher (Round/Direction Navigation)

Every app uses `VersionSwitcher` from `@ds/ui` as the top-level component. Screens are registered in `App.tsx`:

```tsx
const screens: ScreenDef[] = [
  { round: "R1", direction: "Baseline", component: R1Baseline },
  { round: "R1", direction: "Co. Chip",  component: R1CoChip },
];
```

Round labels (R1, R2…) and direction labels are arbitrary strings — use whatever matches the design brief.

`VersionSwitcher` defaults to the **last round** in the list. Pass `initialRound="R1"` to override.

**New design idea = new file. Feedback on an existing idea = edit in place.**

- **Create a new screen file** only when the user explicitly signals a new design direction to compare side-by-side: phrases like "new direction", "new option", "try a different approach", "explore another version", or "I want to compare."
- **Edit the existing screen file** for everything else: feedback, fixes, tweaks, refinements, copy changes, layout adjustments. If the user is reacting to what's on screen ("move this", "make it bigger", "change the color", "this doesn't feel right"), that's iteration on the current direction — update in place.
- When in doubt, ask: "Do you want this as a new direction to compare, or should I update the current one?"

Existing screens must stay untouched when branching to a new direction so all directions remain comparable side-by-side.

**Each app has a `REQUIREMENTS.md` at its root — read it before editing any screen.**

Every prototype app contains a `REQUIREMENTS.md` listing the hard functional requirements that must survive any layout iteration. Before making any structural or visual change to an existing screen:

1. Read `apps/<project>/REQUIREMENTS.md`
2. Treat every listed item as a non-negotiable constraint — the new layout must preserve all of them
3. If a proposed change would drop a requirement, stop and flag it explicitly rather than silently removing it

**Keep `REQUIREMENTS.md` up to date.** When the user confirms new functionality is working ("this is good", "approved", moving to a new round), add it to the list if it's not there yet. Use the same format: one line per requirement, written as what the user can *do*. Entries can be removed if something turns out not to be a real requirement — but only when the user explicitly says so.

**Skipping a requirement for a specific iteration.** If a proposed layout or form factor change would drop a requirement, stop and flag it before proceeding — name the specific requirement(s) that would be lost. Only skip them if the user explicitly confirms after the warning (e.g. "yes skip that", "that's fine", "ignore it for now"). A general "go ahead" counts as confirmation. Do not skip requirements silently or preemptively.

**Keep code and UI in sync.** When a direction or round is renamed, update everything together: the `direction`/`round` string in `App.tsx`, the screen filename, and the component's `export default function` name. The VersionSwitcher label is just display copy — the filename and export name must always reflect the same name so the codebase stays readable and unambiguous.

**New directions go at the end by default.** When adding a new screen, append it after the last existing entry for that round in `App.tsx`. Only insert it at a specific position if the user explicitly asks.

---

## Browser Verification

Always use **Claude in Chrome** MCP tools to verify UI changes in the browser — never use `preview_start` / `preview_*` tools. The preview tools spawn a node process that triggers a macOS system permission prompt ("node would like to access data from other apps"), which requires manual user interaction every time.

**Workflow:**
1. Start the dev server via Bash (background): `cd "/Users/cyvianchen/Desktop/Ambient Prototypes" && pnpm --filter <app-name> dev -- --port <port> &`
2. Use `mcp__Claude_in_Chrome__navigate` to open `http://localhost:<port>`
3. Use `mcp__Claude_in_Chrome__computer` or `mcp__Claude_in_Chrome__read_page` to take screenshots / inspect the UI

**Ports by app:**
- `orders-v1` → 5173
- `previsit-customization` → 5174
- `ds-preview` → 5175
- `macros` → 5176
- `recording` → 5177
- `nurse-scribe` → 5178
- `admin-macro-management` → 5179

**ds-preview tab navigation:** Navigate directly to a tab via query param — e.g. `http://localhost:5175/?tab=menu`. Valid tab IDs: `buttons`, `form`, `chips`, `icons`, `menu`, `nav`. This avoids the click-to-tab step during verification.

**ds-preview Navigation tab — secondary nav patterns:** Each mode of the app gets its own secondary nav panel shown side by side (flex-wrap, as many as fit per row). Always order panels to match the primary nav tab order: Visits → Scribes → Customize → Assistant → Admin. When adding a new secondary nav pattern, append it in this order.

---

## Deploy

GitHub auto-deploy via Vercel is unreliable. Deploy manually per app:

**orders-v1** → linked at repo root, deploys directly:
```bash
cd "/Users/cyvianchen/Desktop/Ambient Prototypes"
npx vercel --prod
```

**previsit-customization** → run from the app directory (has its own `.vercel/project.json`):
```bash
cd "/Users/cyvianchen/Desktop/Ambient Prototypes/apps/previsit-customization"
npx vercel build --yes --prod
npx vercel deploy --prebuilt --prod --no-wait
```

**ds-preview** → run from the app directory:
```bash
cd "/Users/cyvianchen/Desktop/Ambient Prototypes/apps/ds-preview"
npx vercel build --yes --prod
npx vercel deploy --prebuilt --prod
```

- **orders-v1**: `cyvian-chens-projects/ambient-prototypes-orders-v1` → `ambient-prototypes-orders-v1.vercel.app`
- **previsit-customization**: `cyvian-chens-projects/ambient-prototypes-previsit` → `ambient-prototypes-previsit.vercel.app`
- **ds-preview**: `cyvian-chens-projects/ambient-prototypes-ds-preview` → `ambient-prototypes-ds-preview.vercel.app`

The user controls when to deploy — do not commit or push unless explicitly asked.
