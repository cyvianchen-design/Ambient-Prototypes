import React, { useState } from "react";
import {
  Button, IconButton, Icon, Checkbox, Chip, Switch, TextField, TextArea,
  Tabs, Badge, VisitStatus, Link, AmbientLogo, Spinner, Menu, MenuItem, MenuHeader, MenuSearch,
  Overlay, PrimaryNav, SecondaryNavItem,
  Dictation, Learn, MagicEdit, MagicButton, MagicDocument, MenuIcon, SmartSuggestion,
} from "@ds/ui";
import type { Tab } from "@ds/ui";

const tabs: Tab[] = [
  { id: "buttons", label: "Buttons" },
  { id: "form", label: "Form" },
  { id: "chips", label: "Chips & Badges" },
  { id: "icons", label: "Icons" },
  { id: "menu", label: "Menu" },
  { id: "nav", label: "Navigation" },
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
        <IconButton icon={<Icon name="auto_awesome" size={20} />} variant="magic" aria-label="Magic" />
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
  return (
    <div>
      <Row label="TextField — States">
        <TextField label="Default" placeholder="Enter value" onChange={() => {}} />
        <TextField label="With value" value="John Doe" onChange={() => {}} />
        <TextField label="Error" value="bad input" feedback={{ type: "error", message: "This is required" }} onChange={() => {}} />
        <TextField label="Disabled" value="Read only" disabled onChange={() => {}} />
      </Row>
      <Row label="TextArea">
        <TextArea label="Notes" placeholder="Enter notes..." rows={3} onChange={() => {}} />
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
      <Section title="Link">
        <Link href="#">Medium link (default)</Link>
        <Link href="#" size="small">Small link</Link>
        <Link href="#" size="large">Large link</Link>
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

export default function App() {
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(window.location.search).get("tab") || "buttons");

  function handleTabChange(tab: string) {
    window.history.replaceState({}, "", `?tab=${tab}`);
    setActiveTab(tab);
  }
  const tabComponents: Record<string, React.ComponentType> = {
    buttons: ButtonsTab, form: FormTab, chips: ChipsBadgesTab, icons: IconsTab,
    menu: MenuTab, nav: NavigationTab,
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
