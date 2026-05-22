# Ambient Prototypes — Claude Instructions

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
`Button`, `IconButton`, `Icon`, `Checkbox`, `Chip`, `Switch`, `TextField`, `TextArea`, `Tabs`, `Badge`, `VisitStatus`, `Link`, `PrimaryNav`, `SecondaryNavItem`, `Menu`, `MenuItem`, `VersionSwitcher`

### `Switch` — toggle control
```tsx
import { Switch } from "@ds/ui";
<Switch checked={true} onChange={(v) => setState(v)} size="XS" />
```
- `size`: `"XS"` (28×16px track) or `"S"` (34×20px track, default)
- `checked`: controlled boolean
- `onChange`: `(checked: boolean) => void`
- `disabled`: optional boolean

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
- **Always use existing components** — never recreate a button, checkbox, chip, etc. from scratch
- **If a needed component doesn't exist in `packages/ui`**, stop immediately and tell the user — do not build a one-off inline version. Ask for the Figma spec so it can be added to the DS properly.
- **Never hardcode colors, font sizes, or spacing** that should come from design tokens

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

## Tailwind Usage

- Tailwind JIT requires **static class strings** — never construct class names dynamically (e.g. no `"text-[" + size + "px]"`)
- Use Tailwind arbitrary values for one-off pixel values: `text-[13px]`, `gap-[8px]`, `h-[36px]`
- Use token values via arbitrary properties: `text-[var(--foreground-primary,#1a1a1a)]`
- The fallback value (e.g. `,#1a1a1a`) is required in arbitrary token references so the UI renders without the CSS file loaded

---

## Typography & Style Conventions

- **Never use all-caps text** in UI labels, buttons, or headings — use sentence case or title case only
- **Font**: Lato — loaded via Google Fonts in `index.html`, no local font files needed
- **Font sizes**: use `text-[NNpx]` Tailwind values matching Figma specs; do not use Tailwind's named scale (sm, base, lg, etc.)
- **Letter spacing**: always specify tracking to match Figma exactly (see type scale below)
- **Line height**: use `leading-[1.2]` or `leading-[N]` to match Figma; do not omit

### Type scale (from Figma DS)
| Name | Size | Weight | Tracking | Usage |
|---|---|---|---|---|
| Title/Nav | 12px | Bold | `tracking-[-0.36px]` | Primary nav labels |
| Title/S | 13px | Bold | `tracking-[0.13px]` | Secondary nav patient names, section headers |
| Title/M | 15px | Bold | `tracking-[0.15px]` | Secondary nav date header |
| Title/L | 17px | Bold | `tracking-[0.34px]` | Secondary nav section titles (e.g. "My Scribes") |

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

**Never modify an existing screen to add a new design idea.** Any time the user asks for a new direction, option, iteration, or variation — create a new screen file and register it as a new entry in `App.tsx`. Existing screens must stay untouched so all directions remain comparable side-by-side.

---

## Browser Verification

Always use **Claude in Chrome** MCP tools to verify UI changes in the browser — never use `preview_start` / `preview_*` tools. The preview tools spawn a node process that triggers a macOS system permission prompt ("node would like to access data from other apps"), which requires manual user interaction every time.

**Workflow:**
1. Start the dev server via Bash (background): `cd "/Users/cyvianchen/Desktop/Ambient Prototypes" && pnpm --filter <app-name> dev -- --port <port> &`
2. Use `mcp__Claude_in_Chrome__navigate` to open `http://localhost:<port>`
3. Use `mcp__Claude_in_Chrome__computer` or `mcp__Claude_in_Chrome__read_page` to take screenshots / inspect the UI

**Ports by app:**
- `orders-v1` → 5173
- `test-proto` → 5175
- `ds-preview` → 5175
- `test-proto` → 5175
- `previsit-customization` → 5174
- `test-proto` → 5175
- `ds-preview` → 5175
- `test-proto` → 5175

---

## Deploy

GitHub auto-deploy via Vercel is unreliable. To deploy manually:

```bash
cd "/Users/cyvianchen/Desktop/Ambient Prototypes"
npx vercel --prod
```

The project is linked to `cyvian-chens-projects/ambient-prototypes-orders-v1`. The user controls when to deploy — do not commit or push unless explicitly asked.
