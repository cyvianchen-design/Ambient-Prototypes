import React, { useState } from "react";
import {
  PrimaryNav, NavItem,
  Tabs,
  SecondaryNavItem,
  Button,
  Icon,
  MagicButton,
  MagicDocument,
  MagicEdit,
  AmbientLogo,
} from "@ds/ui";

const navItems: NavItem[] = [
  { id: "visits",    label: "Visits",    icon: <Icon name="stethoscope" size={20} filled /> },
  { id: "scribes",   label: "Scribes",   icon: <MagicDocument size={20} />, isActive: true },
  { id: "customize", label: "Customize", icon: <MagicEdit size={20} /> },
  { id: "assistant", label: "Assistant", icon: <MagicButton size={20} /> },
  { id: "admin",     label: "Admin",     icon: <Icon name="analytics" size={20} filled /> },
];

const bottomNavItems: NavItem[] = [
  { id: "help",     label: "Help",     icon: <Icon name="help" size={20} /> },
  { id: "settings", label: "Settings", icon: <Icon name="settings" size={20} /> },
];

const todayPatients = [
  { id: "1", name: "James Vetrovs",   chiefComplaint: "Headache",   age: 72, gender: "M" as const, status: "Generated" as const, duration: "355" },
  { id: "2", name: "John Doe",        chiefComplaint: "Chest Pain", age: 42, gender: "M" as const, status: "Generated" as const, duration: "936" },
  { id: "3", name: "Richard Seymore", chiefComplaint: "Back Pain",  age: 55, gender: "M" as const, status: "Generated" as const, duration: "482" },
  { id: "4", name: "Danny Rivers",    chiefComplaint: "Fatigue",    age: 61, gender: "M" as const, status: "Generated" as const, duration: "271" },
  { id: "5", name: "Ashley Garcia",   chiefComplaint: "Knee pain",  age: 48, gender: "M" as const, status: "Generated" as const, duration: "318" },
];

const yesterdayPatients = [
  { id: "6", name: "James Vetrovs", chiefComplaint: "Headache",    age: 72, gender: "M" as const, status: "Generated" as const, duration: "355" },
  { id: "7", name: "Terry Philips", chiefComplaint: "Chest Pain",  age: 58, gender: "M" as const, status: "Generated" as const, duration: "609" },
];

const tabs = [
  { id: "clinical",    label: "Clinical Note" },
  { id: "diagnostics", label: "Diagnostics & Orders" },
  { id: "transcript",  label: "Transcript" },
];

type Props = {
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
};

export function ScribeLayout({ activeTab, onTabChange, children }: Props) {
  const [selectedPatient, setSelectedPatient] = useState("2");

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      <PrimaryNav
        logo={<AmbientLogo size={28} />}
        items={navItems}
        bottomItems={bottomNavItems}
        userInitial="A"
      />

      {/* Secondary nav */}
      <div className="flex flex-col w-[220px] border-r border-[var(--shape-outline,rgba(0,0,0,0.1))] shrink-0 bg-white">
        <div className="flex items-center h-[48px] px-[8px] py-[12px] shrink-0">
          <div className="flex items-center h-[28px] px-[4px] rounded-[6px]">
            <h2 className="text-[17px] font-bold leading-[1.2] tracking-[0.34px] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">
              My Scribes
            </h2>
          </div>
        </div>
        <div className="flex gap-[4px] items-center px-[4px] pb-[4px] shrink-0">
          <Button variant="tertiary" size="small" prefix={<Icon name="search" size={16} />}>Search</Button>
          <Button variant="tertiary" size="small" prefix={<Icon name="filter_list" size={16} />}>Filter</Button>
        </div>
        <div className="flex-1 overflow-y-auto scrollable">
          <div className="px-[12px] py-[8px]">
            <span className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-secondary,#666)]" style={{ fontFeatureSettings: "'ss07' 1" }}>
              Thu, Dec 19th (Today)
            </span>
          </div>
          {todayPatients.map((p) => (
            <SecondaryNavItem key={p.id} {...p} isSelected={selectedPatient === p.id} onClick={() => setSelectedPatient(p.id)} />
          ))}
          <div className="px-[12px] py-[8px]">
            <span className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-secondary,#666)]" style={{ fontFeatureSettings: "'ss07' 1" }}>
              Wed, Dec 18th
            </span>
          </div>
          {yesterdayPatients.map((p) => (
            <SecondaryNavItem key={p.id} {...p} isSelected={selectedPatient === p.id} onClick={() => setSelectedPatient(p.id)} />
          ))}
        </div>
        <div className="p-[12px]">
          <Button variant="primary" size="medium" prefix={<Icon name="mic" size={16} filled />} className="w-full whitespace-nowrap">
            Record New Scribe
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 items-center overflow-hidden">

        {/* Patient header */}
        <div className="flex flex-col gap-[4px] max-w-[640px] w-full px-[8px] pt-[24px] pb-[12px] shrink-0">
          <div className="flex gap-[8px] items-center w-full">
            <div className="flex flex-1 items-center h-[48px] p-[12px]">
              <h1 className="text-[24px] font-bold leading-[1.2] tracking-[0px] text-[var(--foreground-primary,#1a1a1a)]">
                John Doe
              </h1>
            </div>
            <Button variant="tertiary-neutral" size="small" prefix={<Icon name="more_horiz" size={16} />}>
              Menu
            </Button>
          </div>
          <p className="px-[12px] text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-secondary,#666)]">
            Chest Pain · 42 · M · 15m 36s
          </p>
        </div>

        {/* Tabs */}
        <div className="max-w-[640px] w-full px-[20px] shrink-0">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
        </div>

        {/* Scrollable content — injected by each screen */}
        <div className="flex-1 overflow-y-auto scrollable w-full flex flex-col items-center">
          {children}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between max-w-[640px] w-full px-[12px] pt-[8px] pb-[12px] shrink-0">
          <Button variant="primary" size="medium" prefix={<Icon name="cloud_upload" size={16} filled />}>
            Sync to EHR
          </Button>
          <Button variant="tertiary" size="medium" prefix={<MagicButton size={16} />}>
            Assistant
          </Button>
        </div>

      </div>
    </div>
  );
}
