import React, { useState } from "react";
import {
  Button, IconButton, Icon, Checkbox, Chip, Switch, TextField, TextArea,
  Tabs, Badge, VisitStatus, Link, AmbientLogo, Spinner, Menu, MenuItem, MenuHeader, MenuSearch,
  Overlay, PrimaryNav, SecondaryNavItem,
  Dictation, Learn, MagicEdit, MagicButton, MagicDocument, MenuIcon, SmartSuggestion,
  Alert, Snackbar, Notification, AudioInputVolume, AudioPlayer, Avatar,
  ButtonGroup, SplitButton,
  RadioButton, RadioGroup,
  DatePicker, TimePicker,
  Divider, Loader, Skeleton, NotificationDot, Highlight,
  MobileHeader, StickyButtonBar,
  ListItem, ListSection,
  PopUp,
  PageIndicator, StepIndicator,
  Tooltip,
  PINInput,
  Table, TableCell, TableFooter, BadgesCell, StatusCell,
} from "@ds/ui";
import type { TimeValue, TableColumn } from "@ds/ui";
import type { Tab } from "@ds/ui";

const tabs: Tab[] = [
  { id: "buttons", label: "Buttons" },
  { id: "form", label: "Form" },
  { id: "chips", label: "Chips & Badges" },
  { id: "icons", label: "Icons" },
  { id: "menu", label: "Menu" },
  { id: "nav", label: "Navigation" },
  { id: "alerts", label: "Alerts" },
  { id: "audio", label: "Audio" },
  { id: "avatar", label: "Avatar" },
  { id: "datetime", label: "Date & Time" },
  { id: "misc", label: "Misc" },
  { id: "lists", label: "Lists & Tables" },
  { id: "interactive", label: "Interactive" },
];

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="text-[11px] font-bold tracking-[0.22px] text-[var(--foreground-secondary,#666)] mb-4">{title}</h2>
    <div className="flex flex-wrap gap-3 items-center">{children}</div>
  </div>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="w-full mb-6">
    <p className="text-[11px] text-[var(--foreground-secondary,#666)] mb-2">{label}</p>
    <div className="flex flex-wrap gap-3 items-center">{children}</div>
  </div>
);

function ButtonsTab() {
  return (
    <div>
      <Section title="Button — Variants">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="tertiary">Tertiary</Button>
        <Button variant="tertiary-neutral">Tertiary Neutral</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="danger-secondary">Danger Secondary</Button>
      </Section>
      <Section title="Button — Inverse (on dark bg)">
        <div className="flex items-center gap-[8px] bg-[var(--foreground-primary,#1a1a1a)] rounded-[8px] px-[16px] py-[12px]">
          <Button variant="primary-inverse">Primary</Button>
          <Button variant="secondary-inverse">Secondary</Button>
          <Button variant="tertiary-inverse">Tertiary</Button>
        </div>
      </Section>
      <Section title="Button — Sizes">
        <Button variant="primary" size="large">Large</Button>
        <Button variant="primary" size="medium">Medium</Button>
        <Button variant="primary" size="small">Small</Button>
      </Section>
      <Section title="Button — Disabled">
        <Button variant="primary" disabled>Primary</Button>
        <Button variant="secondary" disabled>Secondary</Button>
        <Button variant="tertiary" disabled>Tertiary</Button>
      </Section>
      <Section title="Button — With Prefix / Suffix">
        <Button variant="primary" prefix={<Icon name="add" size={16} />}>Add item</Button>
        <Button variant="secondary" suffix={<Icon name="arrow_forward" size={16} />}>Next</Button>
        <Button variant="tertiary" prefix={<Icon name="download" size={16} />}>Download</Button>
      </Section>
      <Section title="Icon Button — Variants">
        <IconButton icon={<Icon name="edit" size={20} />} variant="tertiary" aria-label="Tertiary" />
        <IconButton icon={<Icon name="edit" size={20} />} variant="tertiary-neutral" aria-label="Tertiary Neutral" />
        <IconButton icon={<Icon name="edit" size={20} />} variant="accent" aria-label="Accent" />
        <IconButton icon={<Icon name="delete" size={20} />} variant="danger" aria-label="Danger" />
        <IconButton icon={<Icon name="auto_awesome" size={20} />} variant="magic" aria-label="Magic" />
        <div className="flex items-center gap-[4px] bg-[var(--foreground-primary,#1a1a1a)] rounded-[8px] p-[8px]">
          <IconButton icon={<Icon name="close" size={20} />} variant="inverse" aria-label="Inverse" />
        </div>
      </Section>
      <Section title="Button Group — Single select">
        <ButtonGroup
          items={[{ label: "Day", value: "day" }, { label: "Week", value: "week" }, { label: "Month", value: "month" }]}
          value="week"
          onChange={() => {}}
        />
        <ButtonGroup
          size="small"
          items={[{ label: "List", value: "list" }, { label: "Grid", value: "grid" }]}
          value="list"
          onChange={() => {}}
        />
      </Section>
      <Section title="Button Group — Multi select">
        <ButtonGroup
          multiSelect
          items={[{ label: "Bold", value: "bold" }, { label: "Italic", value: "italic" }, { label: "Underline", value: "underline" }]}
          value={["bold", "underline"]}
          onChange={() => {}}
        />
      </Section>
      <Section title="Button Group — Multi select, inverse (on brand surface)">
        <div className="flex items-center bg-gradient-to-br from-[var(--litmus-500,#1132ee)] to-[var(--litmus-300,#7084f5)] rounded-[8px] px-[16px] py-[12px]">
          <ButtonGroup
            multiSelect
            theme="inverse"
            items={[{ label: "Bold", value: "bold" }, { label: "Italic", value: "italic" }, { label: "Underline", value: "underline" }]}
            value={["bold", "underline"]}
            onChange={() => {}}
          />
        </div>
      </Section>
      <Section title="Split Button">
        <SplitButton label="Save" onClick={() => {}} onMenuOpen={() => {}} variant="primary" />
        <SplitButton label="Save" onClick={() => {}} onMenuOpen={() => {}} variant="secondary" />
        <SplitButton label="Save" onClick={() => {}} onMenuOpen={() => {}} variant="primary" size="small" />
        <SplitButton label="Disabled" onClick={() => {}} onMenuOpen={() => {}} disabled />
      </Section>
      <Section title="Icon Button — Sizes">
        <IconButton icon={<Icon name="home" size={14} />} size="small" variant="tertiary" aria-label="Small" />
        <IconButton icon={<Icon name="home" size={20} />} size="medium" variant="tertiary" aria-label="Medium" />
        <IconButton icon={<Icon name="home" size={24} />} size="large" variant="tertiary" aria-label="Large" />
      </Section>
    </div>
  );
}

function FormTab() {
  const [switchS, setSwitchS] = useState(false);
  const [switchXS, setSwitchXS] = useState(true);
  const [textareaValue, setTextareaValue] = useState("");

  return (
    <div>
      <Row label="TextField — Sizes (S / M / L)">
        <TextField size="S" placeholder="Small (S)" onChange={() => {}} />
        <TextField size="M" placeholder="Medium (M)" onChange={() => {}} />
        <TextField size="L" placeholder="Large (L)" onChange={() => {}} />
      </Row>
      <Row label="TextField — States (with label)">
        <TextField label="Default" placeholder="Placeholder" onChange={() => {}} />
        <TextField label="Filled" value="John Doe" onChange={() => {}} />
        <TextField label="Error" value="bad@email" feedback={{ type: "error", message: "Invalid email address" }} onChange={() => {}} />
        <TextField label="Disabled" value="Read only" disabled onChange={() => {}} />
      </Row>
      <Row label="TextField — Prefix / Suffix">
        <TextField
          label="Search"
          placeholder="Search patients…"
          prefix={<Icon name="search" size={16} />}
          onChange={() => {}}
        />
        <TextField
          label="Amount"
          placeholder="0.00"
          prefix={<span className="text-[13px] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>$</span>}
          suffix={<span className="text-[13px] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>USD</span>}
          onChange={() => {}}
        />
      </Row>
      <Row label="TextArea — Interactive (type to see it expand)">
        <TextArea
          label="Notes"
          value={textareaValue}
          onChange={setTextareaValue}
          placeholder="Start typing to see the text area grow…"
          rows={3}
          maxLength={200}
          className="w-[340px]"
        />
      </Row>
      <Row label="TextArea — States">
        <TextArea label="Default" placeholder="Enter text…" onChange={() => {}} rows={3} className="w-[200px]" />
        <TextArea label="Error" value="Too short." feedback={{ type: "error", message: "Minimum 50 characters required" }} onChange={() => {}} rows={3} className="w-[200px]" />
        <TextArea label="Disabled" value="Cannot edit this." disabled onChange={() => {}} rows={3} className="w-[200px]" />
      </Row>
      <Row label="Radio Button — States">
        <RadioButton checked={false} onChange={() => {}} />
        <RadioButton checked={true} onChange={() => {}} />
        <RadioButton checked={false} disabled onChange={() => {}} />
      </Row>
      <Row label="Radio Group — Vertical">
        <RadioGroup
          options={[
            { label: "Option A", value: "a" },
            { label: "Option B", value: "b" },
            { label: "Option C (disabled)", value: "c", disabled: true },
          ]}
          value="b"
          onChange={() => {}}
        />
      </Row>
      <Row label="Radio Group — Horizontal">
        <RadioGroup
          direction="horizontal"
          options={[{ label: "Male", value: "m" }, { label: "Female", value: "f" }, { label: "Other", value: "o" }]}
          value="f"
          onChange={() => {}}
        />
      </Row>
      <Row label="Checkbox — States">
        <Checkbox label="Unchecked" state="unchecked" onChange={() => {}} />
        <Checkbox label="Checked" state="checked" onChange={() => {}} />
        <Checkbox label="Indeterminate" state="indeterminate" onChange={() => {}} />
        <Checkbox label="Disabled" state="unchecked" disabled onChange={() => {}} />
      </Row>
      <Row label="Switch — Sizes & States">
        <Switch checked={false} onChange={() => {}} size="S" />
        <Switch checked={true} onChange={() => {}} size="S" />
        <Switch checked={switchS} onChange={setSwitchS} size="S" />
        <span className="text-[11px] text-[var(--foreground-secondary,#666)] mx-2">XS:</span>
        <Switch checked={false} onChange={() => {}} size="XS" />
        <Switch checked={true} onChange={() => {}} size="XS" />
        <Switch checked={switchXS} onChange={setSwitchXS} size="XS" />
      </Row>
      <Row label="Overlay — Variants">
        <div className="relative w-[240px] h-[120px] rounded-[8px] overflow-hidden border border-[var(--surface-3,#eee)]">
          <div className="absolute inset-0 p-[12px]">
            <p className="text-[13px] font-bold text-[var(--foreground-primary,#1a1a1a)]">Content behind overlay</p>
            <p className="text-[12px] text-[var(--foreground-secondary,#666)] mt-[4px]">This text is blurred by the overlay above it.</p>
          </div>
          <Overlay variant="blur" />
          <span className="absolute bottom-[8px] left-[8px] text-[11px] font-bold text-white" style={{ fontFamily: "Lato, sans-serif" }}>Blur</span>
        </div>
        <div className="relative w-[240px] h-[120px] rounded-[8px] overflow-hidden border border-[var(--surface-3,#eee)]">
          <div className="absolute inset-0 p-[12px]">
            <p className="text-[13px] font-bold text-[var(--foreground-primary,#1a1a1a)]">Content behind overlay</p>
            <p className="text-[12px] text-[var(--foreground-secondary,#666)] mt-[4px]">This text is dimmed by the overlay above it.</p>
          </div>
          <Overlay variant="dim" />
          <span className="absolute bottom-[8px] left-[8px] text-[11px] font-bold text-white" style={{ fontFamily: "Lato, sans-serif" }}>Dim</span>
        </div>
      </Row>
    </div>
  );
}

function ChipsBadgesTab() {
  return (
    <div>
      <Section title="Chip — S">
        <Chip label="Neutral" color="neutral" onClick={() => {}} />
        <Chip label="Accent" color="accent" onClick={() => {}} />
        <Chip label="Dismissible" color="neutral" onDismiss={() => {}} />
        <Chip label="Dismissible accent" color="accent" onDismiss={() => {}} />
        <Chip label="Disabled" color="neutral" disabled />
      </Section>
      <Section title="Chip — XS">
        <Chip label="Neutral" color="neutral" size="XS" onClick={() => {}} />
        <Chip label="Accent" color="accent" size="XS" onClick={() => {}} />
        <Chip label="Dismissible" color="neutral" size="XS" onDismiss={() => {}} />
        <Chip label="Dismissible accent" color="accent" size="XS" onDismiss={() => {}} />
        <Chip label="Disabled" color="neutral" size="XS" disabled />
      </Section>
      <Section title="Badge — Variants">
        <Badge label="Default" variant="default" />
        <Badge label="Success" variant="success" />
        <Badge label="Info" variant="info" />
        <Badge label="Warning" variant="warning" />
        <Badge label="Error" variant="error" />
      </Section>
      <Section title="Badge — With Icon">
        <Badge label="With icon" variant="success" icon={<Icon name="check_circle" size={14} filled />} />
        <Badge label="With icon" variant="warning" icon={<Icon name="warning" size={14} filled />} />
        <Badge label="With icon" variant="error" icon={<Icon name="error" size={14} filled />} />
      </Section>
      <Section title="Visit Status">
        <VisitStatus status="Generated" />
        <VisitStatus status="Uploading" />
        <VisitStatus status="Processing" />
        <VisitStatus status="Error" />
        <VisitStatus status="In Queue" />
      </Section>
      <Section title="Link — Accent (default intent)">
        <Link href="#" size="large">Large</Link>
        <Link href="#">Medium</Link>
        <Link href="#" size="small">Small</Link>
        <Link href="#" size="xsmall">XSmall</Link>
        <Link href="#" external>With external icon</Link>
        <Link href="#" disabled>Disabled</Link>
      </Section>
      <Section title="Link — Neutral intent">
        <Link href="#" intent="neutral" size="large">Large</Link>
        <Link href="#" intent="neutral">Medium</Link>
        <Link href="#" intent="neutral" size="small">Small</Link>
        <Link href="#" intent="neutral" disabled>Disabled</Link>
      </Section>
      <Section title="Link — Inline usage">
        <p className="text-[15px] leading-[1.6]" style={{ fontFamily: "Lato, sans-serif", color: "#1a1a1a" }}>
          The patient was referred to{" "}
          <Link href="#">Dr. Sarah Johnson</Link>
          {" "}for a follow-up. See{" "}
          <Link href="#" external>full lab results</Link>
          {" "}for details.
        </p>
      </Section>
    </div>
  );
}

function IconsTab() {
  const customIcons = [
    { label: "AmbientLogo", node: <AmbientLogo /> },
    { label: "Spinner", node: <Spinner /> },
    { label: "Dictation", node: <Dictation /> },
    { label: "Learn", node: <Learn /> },
    { label: "MagicEdit", node: <MagicEdit size={24} /> },
    { label: "MagicButton", node: <MagicButton size={24} /> },
    { label: "MagicDocument", node: <MagicDocument size={24} /> },
    { label: "MenuIcon", node: <MenuIcon size={24} /> },
    { label: "SmartSuggestion", node: <SmartSuggestion size={24} /> },
  ];
  const materialIcons = [
    "home", "search", "settings", "person", "add", "close", "arrow_back",
    "arrow_forward", "check", "edit", "delete", "refresh", "more_horiz",
    "calendar_today", "schedule", "warning", "info", "check_circle", "error",
  ];
  return (
    <div>
      <Section title="Custom Icons">
        <div className="flex flex-wrap gap-6 items-end">
          {customIcons.map(({ label, node }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              {node}
              <span className="text-[10px] text-[var(--foreground-secondary,#666)]">{label}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Icon — Sizes">
        {[14, 16, 20, 24, 32].map(size => (
          <div key={size} className="flex flex-col items-center gap-1">
            <Icon name="home" size={size} />
            <span className="text-[10px] text-[var(--foreground-secondary,#666)]">{size}</span>
          </div>
        ))}
      </Section>
      <Section title="Icon — Outlined vs Filled">
        {["favorite", "star", "bookmark", "check_circle"].map(name => (
          <div key={name} className="flex gap-2 items-center">
            <Icon name={name} size={24} />
            <Icon name={name} size={24} filled />
          </div>
        ))}
      </Section>
      <Section title="Material Symbols Rounded">
        <div className="flex flex-wrap gap-4">
          {materialIcons.map(name => (
            <div key={name} className="flex flex-col items-center gap-1 w-16">
              <Icon name={name} size={24} />
              <span className="text-[10px] text-[var(--foreground-secondary,#666)] text-center leading-tight">{name}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

const VariantRow = ({ name, children }: { name: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-[32px] w-full py-[2px]">
    <span className="w-[160px] shrink-0 text-[11px] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>{name}</span>
    <div className="w-[280px]">{children}</div>
  </div>
);

function MenuTab() {
  const [query, setQuery] = React.useState("");
  return (
    <div>
      <Section title="Menu — Default">
        <Menu className="w-[220px]">
          <MenuItem icon={<Icon name="print" size={16} />} label="Print" />
          <MenuItem icon={<Icon name="download" size={16} />} label="Download" />
          <MenuItem icon={<Icon name="share" size={16} />} label="Share" disabled />
        </Menu>
      </Section>
      <Section title="Menu — With header">
        <Menu className="w-[220px]">
          <MenuHeader>Actions</MenuHeader>
          <MenuItem icon={<Icon name="print" size={16} />} label="Print" />
          <MenuItem icon={<Icon name="download" size={16} />} label="Download" />
        </Menu>
      </Section>
      <Section title="Menu — With grouped headers">
        <Menu className="w-[220px]">
          <MenuHeader>Suggested</MenuHeader>
          <MenuItem label="ECG 12-lead" />
          <MenuItem label="D-Dimer" />
          <MenuHeader>All Orders</MenuHeader>
          <MenuItem label="Chest X-ray, PA & Lateral" />
          <MenuItem label="Stress Test" />
          <MenuItem label="Echocardiogram" />
        </Menu>
      </Section>
      <Section title="Menu — With search">
        <Menu className="w-[280px]">
          <MenuSearch value={query} onChange={setQuery} placeholder="Search orders…" />
          <MenuHeader>Suggested</MenuHeader>
          <MenuItem label="ECG 12-lead" />
          <MenuItem label="D-Dimer" />
          <MenuHeader>All Orders</MenuHeader>
          <MenuItem label="Chest X-ray, PA & Lateral" />
          <MenuItem label="Stress Test" />
        </Menu>
      </Section>
      <Section title="MenuItem">
        <VariantRow name="Label only">
          <MenuItem label="Clinical Note" />
        </VariantRow>
        <VariantRow name="Icon + label">
          <MenuItem icon={<Icon name="download" size={16} />} label="Download" />
        </VariantRow>
        <VariantRow name="Label + description">
          <MenuItem label="Quest Diagnostics" description="Lab · Standard turnaround" />
        </VariantRow>
        <VariantRow name="Trailing label">
          <MenuItem
            label="Follow-up visit"
            trailing={
              <span className="text-[13px] font-normal leading-[1.2] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>
                05/13/2026
              </span>
            }
          />
        </VariantRow>
        <VariantRow name="Label + action">
          <MenuItem
            label="Diagnosis"
            trailing={
              <Button variant="tertiary" size="small" prefix={<Icon name="add" size={14} />}>Add</Button>
            }
          />
        </VariantRow>
        <VariantRow name="Visit item">
          <button
            className="flex items-stretch w-full gap-[8px] px-[8px] py-[6px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors text-left"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            <span className="flex flex-col gap-[2px] flex-1 min-w-0">
              <span className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)] truncate">
                Jane Doe
              </span>
              <span className="text-[12px] font-normal leading-[1.2] text-[var(--foreground-secondary,#666)] truncate">
                Chest pain · 38 · F
              </span>
            </span>
            <span className="shrink-0 flex items-end">
              <span className="text-[12px] font-normal leading-[1.2] text-[var(--foreground-secondary,#666)]">
                9:00 am
              </span>
            </span>
          </button>
        </VariantRow>
        <VariantRow name="State: selected">
          <MenuItem label="Clinical Note" selected />
        </VariantRow>
        <VariantRow name="State: disabled">
          <MenuItem label="Clinical Note" disabled />
        </VariantRow>
      </Section>
    </div>
  );
}

function NavigationTab() {
  return (
    <div>
      <Section title="Primary Nav + Secondary Nav — Visits mode">
        <div className="flex h-[800px] border border-[var(--surface-3,#eee)] rounded-[8px] overflow-hidden">
          <PrimaryNav activeItem="visits" />
          <div className="w-[220px] flex flex-col border-r border-[rgba(0,0,0,0.1)] bg-white">
            <div className="flex items-center h-[48px] shrink-0 px-[8px] gap-[4px]">
              <span className="flex-1 text-[15px] font-bold tracking-[0.15px] text-[var(--foreground-primary,#1a1a1a)] px-[8px]" style={{ fontFamily: "Lato, sans-serif" }}>
                May 13, Today
              </span>
              <IconButton icon={<Icon name="keyboard_arrow_left" size={16} />} variant="tertiary-neutral" size="small" aria-label="Previous" />
              <IconButton icon={<Icon name="keyboard_arrow_right" size={16} />} variant="tertiary-neutral" size="small" aria-label="Next" />
            </div>
            <div className="flex gap-[4px] items-center px-[4px] pb-[4px] shrink-0">
              <Button variant="tertiary" size="small" prefix={<Icon name="search" size={16} />}>Search</Button>
              <Button variant="tertiary" size="small" prefix={<Icon name="filter_list" size={16} />}>Filter</Button>
            </div>
            <div className="flex-1">
              <SecondaryNavItem name="Jane Doe" age={38} gender="F" duration="12 min" time="9:00 am" status="Generated" isSelected />
              <SecondaryNavItem name="Linda Williams" age={53} gender="F" duration="20 min" time="9:30 am" status="In Queue" />
              <SecondaryNavItem name="David Jones" age={67} gender="M" duration="15 min" time="10:00 am" status="Processing" />
              <SecondaryNavItem name="Robert Mackenzie" age={74} gender="M" duration="30 min" time="10:30 am" status="Generated" />
              <SecondaryNavItem name="Richard Roe" age={24} gender="M" duration="10 min" time="11:00 am" />
            </div>
            <div className="shrink-0 p-[12px]">
              <Button variant="primary" size="medium" prefix={<Icon name="mic" size={16} filled />} className="w-full">
                Start Instant Visit
              </Button>
            </div>
          </div>
          <div className="flex-1 bg-[var(--surface-2,#fafafa)]" />
        </div>
      </Section>
      <Section title="Primary Nav + Secondary Nav — Scribes mode">
        <div className="flex h-[800px] border border-[var(--surface-3,#eee)] rounded-[8px] overflow-hidden">
          <PrimaryNav activeItem="scribes" />
          <div className="w-[220px] flex flex-col border-r border-[rgba(0,0,0,0.1)] bg-white">
            <div className="flex items-center h-[48px] shrink-0 px-[8px] py-[12px]">
              <div className="flex items-center h-[28px] px-[4px] rounded-[6px]">
                <span className="text-[17px] font-bold tracking-[0.34px] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFamily: "Lato, sans-serif" }}>
                  My Scribes
                </span>
              </div>
            </div>
            <div className="flex gap-[4px] items-center px-[4px] pb-[4px] shrink-0">
              <Button variant="tertiary" size="small" prefix={<Icon name="search" size={16} />}>Search</Button>
              <Button variant="tertiary" size="small" prefix={<Icon name="filter_list" size={16} />}>Filter</Button>
            </div>
            <div className="flex-1">
              <div className="px-[12px] py-[8px]">
                <span className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-secondary,#666)]" style={{ fontFeatureSettings: "'ss07' 1" }}>
                  Tue, May 13th (Today)
                </span>
              </div>
              <SecondaryNavItem name="Jane Doe" chiefComplaint="Chest pain" age={38} gender="F" duration="12 min" isSelected />
              <SecondaryNavItem name="Linda Williams" chiefComplaint="Follow-up" age={53} gender="F" duration="20 min" />
              <SecondaryNavItem name="David Jones" chiefComplaint="Hypertension check" age={67} gender="M" duration="15 min" />
              <div className="px-[12px] py-[8px]">
                <span className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-secondary,#666)]" style={{ fontFeatureSettings: "'ss07' 1" }}>
                  Mon, May 12th
                </span>
              </div>
              <SecondaryNavItem name="Robert Mackenzie" chiefComplaint="Medication review" age={74} gender="M" duration="30 min" />
              <SecondaryNavItem name="Richard Roe" chiefComplaint="Back pain" age={24} gender="M" duration="10 min" />
            </div>
            <div className="shrink-0 p-[12px]">
              <Button variant="primary" size="medium" prefix={<Icon name="mic" size={16} filled />} className="w-full">
                Record New Scribe
              </Button>
            </div>
          </div>
          <div className="flex-1 bg-[var(--surface-2,#fafafa)]" />
        </div>
      </Section>
    </div>
  );
}

function MiscTab() {
  return (
    <div>
      <Section title="Divider — Horizontal">
        <div className="w-full max-w-[400px] flex flex-col gap-[12px]">
          <Divider />
          <Divider label="or" />
          <Divider label="Today" />
        </div>
      </Section>
      <Section title="Divider — Vertical">
        <div className="flex items-center h-[40px] gap-[16px]">
          <span className="text-[13px]">Left</span>
          <Divider orientation="vertical" />
          <span className="text-[13px]">Right</span>
          <Divider orientation="vertical" />
          <span className="text-[13px]">Far right</span>
        </div>
      </Section>
      <Section title="Loader — Sizes">
        <Loader size="XS" />
        <Loader size="S" />
        <Loader size="M" />
        <Loader size="L" />
      </Section>
      <Section title="Loader — Colors">
        <Loader size="M" color="accent" />
        <div className="bg-[var(--foreground-primary,#1a1a1a)] p-[12px] rounded-[8px]">
          <Loader size="M" color="white" />
        </div>
        <Loader size="M" color="neutral" />
      </Section>
      <Section title="Loader — With label">
        <Loader size="M" label="Loading records…" />
      </Section>
      <Section title="Skeleton">
        <div className="flex flex-col gap-[8px] w-[240px]">
          <Skeleton height={16} width="60%" />
          <Skeleton height={12} width="100%" />
          <Skeleton height={12} width="80%" />
          <Skeleton height={32} width={32} rounded />
        </div>
      </Section>
      <Section title="Notification Dot — Plain">
        <NotificationDot />
        <NotificationDot variant="accent" />
      </Section>
      <Section title="Notification Dot — Counts">
        <NotificationDot count={1} />
        <NotificationDot count={5} />
        <NotificationDot count={9} />
        <NotificationDot count={12} />
        <NotificationDot count={1} variant="accent" />
      </Section>
      <Section title="Notification Dot — On icon">
        <div className="relative inline-block">
          <Icon name="notifications" size={24} />
          <NotificationDot count={3} className="absolute -top-[4px] -right-[4px]" />
        </div>
        <div className="relative inline-block">
          <Icon name="mail" size={24} />
          <NotificationDot className="absolute -top-[2px] -right-[2px]" />
        </div>
      </Section>
      <Section title="Highlight">
        <p className="text-[15px] font-['Lato',sans-serif] leading-[1.6]">
          The patient reported <Highlight color="danger">chest pain</Highlight> and <Highlight color="warning">shortness of breath</Highlight> starting yesterday evening.{" "}
          <Highlight color="success">Blood pressure was 130/85</Highlight>. History includes <Highlight color="info">hypertension</Highlight> and <Highlight color="history">prior cardiac event</Highlight>.
        </p>
      </Section>
    </div>
  );
}

function DateTimeTab() {
  const [date, setDate] = React.useState<Date | null>(new Date(2026, 5, 16));
  const [time, setTime] = React.useState<TimeValue>({ hour: 9, minute: 0, ampm: "am" });
  return (
    <div>
      <Section title="Date Picker">
        <DatePicker value={date} onChange={setDate} />
      </Section>
      <Section title="Date Picker — No selection">
        <DatePicker value={null} onChange={() => {}} />
      </Section>
      <Section title="Time Picker — 15 min steps">
        <TimePicker value={time} onChange={setTime} minuteStep={15} />
      </Section>
      <Section title="Time Picker — 30 min steps">
        <TimePicker value={{ hour: 2, minute: 30, ampm: "pm" }} onChange={() => {}} minuteStep={30} />
      </Section>
    </div>
  );
}

function AvatarTab() {
  return (
    <div>
      <Section title="Avatar — Sizes (initials)">
        <Avatar name="Jane Doe" size="XS" />
        <Avatar name="Jane Doe" size="S" />
        <Avatar name="Jane Doe" size="M" />
        <Avatar name="Jane Doe" size="L" />
        <Avatar name="Jane Doe" size="XL" />
      </Section>
      <Section title="Avatar — Color variation by name">
        <Avatar name="Jane Doe" size="M" />
        <Avatar name="Robert Mackenzie" size="M" />
        <Avatar name="Linda Williams" size="M" />
        <Avatar name="David Jones" size="M" />
        <Avatar name="Richard Roe" size="M" />
      </Section>
      <Section title="Avatar — With status">
        <Avatar name="Jane Doe" size="M" status="online" />
        <Avatar name="Robert M" size="M" status="busy" />
        <Avatar name="Linda W" size="M" status="away" />
        <Avatar name="David J" size="M" status="offline" />
      </Section>
      <Section title="Avatar — Single name">
        <Avatar name="Cyvian" size="M" />
        <Avatar name="Admin" size="M" />
      </Section>
    </div>
  );
}

function AudioTab() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(47);
  const [rate, setRate] = React.useState(1);
  return (
    <div>
      <Section title="Audio Player — Default">
        <div className="w-full max-w-[480px]">
          <AudioPlayer
            currentTime={currentTime}
            duration={183}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(v => !v)}
            onSeek={setCurrentTime}
            playbackRate={rate}
            onPlaybackRateChange={setRate}
          />
        </div>
      </Section>
      <Section title="Audio Player — No skip buttons">
        <div className="w-full max-w-[360px]">
          <AudioPlayer
            currentTime={12}
            duration={60}
            isPlaying={false}
            onPlayPause={() => {}}
            onSeek={() => {}}
            showSkip={false}
          />
        </div>
      </Section>
      <Section title="Audio Player — Near end">
        <div className="w-full max-w-[480px]">
          <AudioPlayer
            currentTime={178}
            duration={183}
            isPlaying={true}
            onPlayPause={() => {}}
            onSeek={() => {}}
          />
        </div>
      </Section>
    </div>
  );
}

function AlertsTab() {
  return (
    <div>
      <Section title="Alert — Variants">
        <div className="flex flex-col gap-[8px] w-full max-w-[480px]">
          <Alert variant="neutral" title="Neutral alert" body="General information with no particular urgency." />
          <Alert variant="info" title="Informational alert" body="This is additional detail about the message." />
          <Alert variant="success" title="Success — changes saved" body="Your updates have been applied." />
          <Alert variant="warning" title="Review required" body="Some fields need your attention before continuing." />
          <Alert variant="danger" title="Something went wrong" body="Please try again or contact support." />
        </div>
      </Section>
      <Section title="Alert — With dismiss">
        <div className="flex flex-col gap-[8px] w-full max-w-[480px]">
          <Alert variant="info" title="Dismissible alert" onDismiss={() => {}} />
          <Alert variant="warning" title="Warning — review before continuing" body="This action cannot be undone." onDismiss={() => {}} />
        </div>
      </Section>
      <Section title="Notification — Up to 2 CTAs, no dismiss">
        <div className="flex flex-col gap-[8px] w-full max-w-[480px]">
          <Notification variant="neutral" title="Submit final edits?" primaryAction={{ label: "Submit", onClick: () => {} }} secondaryAction={{ label: "Edit more", onClick: () => {} }} />
          <Notification variant="info" title="Apply auto-categorization?" body="Scribe will attempt to auto-categorize your notes based on historical data." primaryAction={{ label: "Auto-categorize", onClick: () => {} }} secondaryAction={{ label: "I'll do it myself", onClick: () => {} }} />
        </div>
      </Section>
      <Section title="Snackbar — Variants">
        <div className="flex flex-col gap-[8px]">
          <Snackbar variant="neutral" message="Note saved successfully" />
          <Snackbar variant="info" message="Syncing records…" />
          <Snackbar variant="success" message="Visit marked as complete" action={{ label: "Undo", onClick: () => {} }} />
          <Snackbar variant="warning" message="Connection unstable" onDismiss={() => {}} />
          <Snackbar variant="danger" message="Failed to save — please retry" onDismiss={() => {}} />
        </div>
      </Section>
      <Section title="Audio Input Volume — Pill bars">
        <div className="flex flex-col gap-[16px]">
          <Row label="Active — low / mid / high">
            <AudioInputVolume active level={0.2} barCount={10} />
            <AudioInputVolume active level={0.5} barCount={10} />
            <AudioInputVolume active level={0.9} barCount={10} />
          </Row>
          <Row label="Inactive">
            <AudioInputVolume active={false} level={0} barCount={10} />
          </Row>
          <Row label="No mic icon">
            <AudioInputVolume active level={0.6} barCount={8} showMic={false} />
          </Row>
        </div>
      </Section>
    </div>
  );
}

type SampleRow = { id: number; name: string; email: string; role: string; tags: string[]; status: "Active" | "Inactive" | "Pending"; date: string };
const sampleRows: SampleRow[] = [
  { id: 1, name: "Jane Doe",         email: "jane.doe@example.com",        role: "Physician",           tags: ["Internal Med", "Hospitalist"], status: "Active",   date: "2026-05-13" },
  { id: 2, name: "Robert Mackenzie", email: "robert.m@example.com",        role: "Nurse Practitioner",  tags: ["Cardiology"],                  status: "Active",   date: "2026-05-12" },
  { id: 3, name: "Linda Williams",   email: "linda.w@example.com",         role: "Medical Assistant",   tags: ["Pediatrics", "Oncology", "ED"], status: "Inactive", date: "2026-04-30" },
  { id: 4, name: "David Jones",      email: "david.jones@example.com",     role: "Physician",           tags: ["Surgery"],                     status: "Pending",  date: "2026-05-01" },
  { id: 5, name: "Maria Garcia",     email: "maria.garcia@example.com",    role: "Attending Physician", tags: ["Emergency Med"],                status: "Active",   date: "2026-05-14" },
];
const STATUS_COLOR_MAP: Record<SampleRow["status"], "success" | "neutral" | "warning"> = {
  Active: "success", Inactive: "neutral", Pending: "warning",
};
const sampleColumns: TableColumn<SampleRow>[] = [
  {
    key: "name", header: "Name", sortable: true,
    render: (r) => (
      <TableCell
        leading={<Avatar name={r.name} size="S" />}
        primary={r.name}
        secondary={r.email}
      />
    ),
  },
  {
    key: "role", header: "Role", sortable: true,
    render: (r) => r.role,
  },
  {
    key: "tags", header: "Specialties",
    render: (r) => <BadgesCell labels={r.tags} max={2} />,
  },
  {
    key: "status", header: "Status", sortable: true,
    render: (r) => <StatusCell label={r.status} color={STATUS_COLOR_MAP[r.status]} />,
  },
  {
    key: "date", header: "Last Active", sortable: true,
    render: (r) => r.date,
  },
];

function ListsTab() {
  const [sortKey, setSortKey] = React.useState("name");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc" | "none">("asc");
  const [selected, setSelected] = React.useState(new Set<string | number>());
  const [footerPage, setFooterPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(15);

  return (
    <div>
      <Section title="Table — Medium density (M) with sort + footer">
        <div className="w-full border border-[var(--surface-3,#eee)] rounded-[8px] overflow-hidden">
          <Table
            columns={sampleColumns}
            rows={sampleRows}
            rowKey={(r) => r.id}
            sortKey={sortKey}
            sortDirection={sortDir}
            onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
            stickyHeader
            density="M"
            footer={
              <TableFooter
                totalRecords={113}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={setRowsPerPage}
                page={footerPage}
                totalPages={8}
                onPageChange={setFooterPage}
              />
            }
          />
        </div>
      </Section>
      <Section title="Table — Small density (S) + selectable">
        <div className="w-full border border-[var(--surface-3,#eee)] rounded-[8px] overflow-hidden">
          <Table
            columns={sampleColumns}
            rows={sampleRows}
            rowKey={(r) => r.id}
            selectable
            selectedKeys={selected}
            density="S"
            onSelectRow={(k, v) => setSelected(prev => { const s = new Set(prev); v ? s.add(k) : s.delete(k); return s; })}
            onSelectAll={(v) => setSelected(v ? new Set(sampleRows.map(r => r.id)) : new Set())}
          />
        </div>
      </Section>
      <Section title="Table — Empty state">
        <div className="w-full border border-[var(--surface-3,#eee)] rounded-[8px] overflow-hidden">
          <Table columns={sampleColumns} rows={[]} rowKey={(r) => r.id} emptyState="No records found" />
        </div>
      </Section>
    </div>
  );
}

function InteractiveTab() {
  const [pinValue, setPinValue] = React.useState("");
  const [popupOpen, setPopupOpen] = React.useState(false);
  const [page, setPage] = React.useState(3);

  return (
    <div>
      <Section title="Tooltip — Positions">
        <Tooltip content="Top tooltip" position="top"><Button variant="secondary">Top</Button></Tooltip>
        <Tooltip content="Bottom tooltip" position="bottom"><Button variant="secondary">Bottom</Button></Tooltip>
        <Tooltip content="Left tooltip" position="left"><Button variant="secondary">Left</Button></Tooltip>
        <Tooltip content="Right tooltip" position="right"><Button variant="secondary">Right</Button></Tooltip>
      </Section>
      <Section title="Tooltip — On icon">
        <Tooltip content="Refresh data"><IconButton icon={<Icon name="refresh" size={20} />} variant="tertiary" aria-label="Refresh" /></Tooltip>
        <Tooltip content="Delete permanently"><IconButton icon={<Icon name="delete" size={20} />} variant="tertiary" aria-label="Delete" /></Tooltip>
      </Section>
      <Section title="Page Indicator">
        <div className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[6px]">
            <span className="text-[11px] text-[var(--foreground-secondary,#666)]">3 pages — page 1</span>
            <PageIndicator pages={3} current={1} onChange={setPage} />
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className="text-[11px] text-[var(--foreground-secondary,#666)]">5 pages — page {page}</span>
            <PageIndicator pages={5} current={page} onChange={setPage} />
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className="text-[11px] text-[var(--foreground-secondary,#666)]">7 pages — page 4</span>
            <PageIndicator pages={7} current={4} />
          </div>
        </div>
      </Section>
      <Section title="Step Indicator">
        <div className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[11px] text-[var(--foreground-secondary,#666)]">Step 1 of 4</span>
            <StepIndicator steps={4} current={1} />
          </div>
          <div className="flex flex-col gap-[4px]">
            <span className="text-[11px] text-[var(--foreground-secondary,#666)]">Step 2 of 4</span>
            <StepIndicator steps={4} current={2} />
          </div>
          <div className="flex flex-col gap-[4px]">
            <span className="text-[11px] text-[var(--foreground-secondary,#666)]">Step 4 of 4</span>
            <StepIndicator steps={4} current={4} />
          </div>
        </div>
      </Section>
      <Section title="PIN Input">
        <div className="flex flex-col gap-[16px]">
          <PINInput length={6} value={pinValue} onChange={setPinValue} autoFocus={false} />
          <PINInput length={4} value="12" masked={false} />
          <PINInput length={6} value="123456" error />
          <PINInput length={6} value="123" disabled />
        </div>
      </Section>
      <Section title="Mobile Header — Back + actions">
        <div className="w-full max-w-[360px] border border-[var(--surface-3,#eee)] rounded-[8px] overflow-hidden">
          <MobileHeader title="Patient Chart" onBack={() => {}} actions={<><IconButton icon={<Icon name="search" size={20} />} variant="tertiary" aria-label="Search" /><IconButton icon={<Icon name="more_horiz" size={20} />} variant="tertiary" aria-label="More" /></>} />
        </div>
      </Section>
      <Section title="Mobile Header — Title only">
        <div className="w-full max-w-[360px] border border-[var(--surface-3,#eee)] rounded-[8px] overflow-hidden">
          <MobileHeader title="Settings" />
        </div>
      </Section>
      <Section title="Mobile Header — With subtitle">
        <div className="w-full max-w-[360px] border border-[var(--surface-3,#eee)] rounded-[8px] overflow-hidden">
          <MobileHeader title="Visit" subtitle="Jane Doe · 38 · F" onBack={() => {}} />
        </div>
      </Section>
      <Section title="Sticky Button Bar">
        <div className="w-full max-w-[360px] border border-[var(--surface-3,#eee)] rounded-[8px] overflow-hidden relative">
          <div className="p-[16px] bg-[var(--surface-1,#f7f7f7)] h-[80px]" />
          <StickyButtonBar
            primary={<Button variant="primary" className="w-full">Continue</Button>}
            secondary={<Button variant="secondary" className="w-full">Cancel</Button>}
          />
        </div>
      </Section>
      <Section title="Pop-Up">
        <Button variant="secondary" onClick={() => setPopupOpen(true)}>Open Pop-Up</Button>
        <PopUp
          open={popupOpen}
          onClose={() => setPopupOpen(false)}
          title="Submit final edits?"
          actions={
            <>
              <Button variant="primary" className="w-full" onClick={() => setPopupOpen(false)}>Submit</Button>
              <Button variant="secondary" className="w-full" onClick={() => setPopupOpen(false)}>Edit more</Button>
            </>
          }
        />
      </Section>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(window.location.search).get("tab") || "buttons");

  function handleTabChange(tab: string) {
    window.history.replaceState({}, "", `?tab=${tab}`);
    setActiveTab(tab);
  }
  const tabComponents: Record<string, React.ComponentType> = {
    buttons: ButtonsTab, form: FormTab, chips: ChipsBadgesTab, icons: IconsTab,
    menu: MenuTab, nav: NavigationTab, alerts: AlertsTab, audio: AudioTab, avatar: AvatarTab, datetime: DateTimeTab, misc: MiscTab, lists: ListsTab, interactive: InteractiveTab,
  };
  const ActiveComponent = tabComponents[activeTab];

  return (
    <div className="min-h-screen bg-white font-['Lato',sans-serif]">
      <div className="border-b border-[var(--surface-3,#eee)] px-8 py-4 flex items-center gap-3">
        <AmbientLogo />
        <h1 className="text-[15px] font-bold text-[var(--foreground-primary,#1a1a1a)] tracking-[0.15px]">
          Design System Preview
        </h1>
      </div>
      <div className="px-8 pt-4 border-b border-[var(--surface-3,#eee)]">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      <div className="px-8 py-8 max-w-4xl">
        <ActiveComponent />
      </div>
    </div>
  );
}
