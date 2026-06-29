import React, { useState } from "react";
import {
  PrimaryNav, NavItem,
  Tabs,
  SecondaryNavItem,
  Button, IconButton,
  Link,
  Icon,
  VisitStatus,
  MagicButton,
  MagicDocument,
  MagicEdit,
  AmbientLogo,
  Checkbox,
} from "@ds/ui";

// ─── Mock data ────────────────────────────────────────────────────────────────

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
  { id: "1", name: "James Vetrovs", chiefComplaint: "Headache", age: 72, gender: "M" as const, status: "Generated" as const, duration: "355" },
  { id: "2", name: "John Doe",      chiefComplaint: "Headache", age: 72, gender: "M" as const, status: "Generated" as const, duration: "355" },
  { id: "3", name: "Richard Seymore", chiefComplaint: "Headache", age: 72, gender: "M" as const, status: "Generated" as const, duration: "355" },
  { id: "4", name: "Danny Rivers",  chiefComplaint: "Headache", age: 72, gender: "M" as const, status: "Generated" as const, duration: "355" },
  { id: "5", name: "Ashley Garcia", chiefComplaint: "Headache", age: 72, gender: "M" as const, status: "Generated" as const, duration: "355" },
];

const yesterdayPatients = [
  { id: "6", name: "James Vetrovs", chiefComplaint: "Headache", age: 72, gender: "M" as const, status: "Generated" as const, duration: "355" },
  { id: "7", name: "Terry Philips", chiefComplaint: "Headache", age: 72, gender: "M" as const, status: "Generated" as const, duration: "355" },
];

const icd10Codes = [
  { code: "R07.9",  description: "Chest pain, unspecified" },
  { code: "I10",    description: "Essential (primary) hypertension" },
  { code: "E78.5",  description: "Hyperlipidemia, unspecified" },
  { code: "Z82.49", description: "Family history of ischemic heart disease" },
];

const cptCodes = [
  { code: "99214", description: "Office visit, moderate medical decision making" },
  { code: "93000", description: "Electrocardiogram, routine ECG with interpretation" },
];

const initialOrders = [
  { id: "ecg-inhouse",  label: "ECG 12-lead", detail: "In-house", icd: "R07.9", checked: true  },
  { id: "ddimer-quest", label: "D-Dimer",     detail: "Quest",    icd: "R07.9", checked: true  },
];

type OrderSetChild = { id: string; label: string; type: "lab" | "imaging"; detail: string; checked: boolean };
type OrderSetItem  = { id: string; label: string; icd: string; labDetail?: string; imagingDetail?: string; children: OrderSetChild[] };

const initialOrderSets: OrderSetItem[] = [
  {
    id: "set-1",
    label: "Chest Pain Workup",
    icd: "R07.9",
    labDetail: "Quest",
    imagingDetail: "RadNet",
    children: [
      { id: "s1", label: "Troponin I, High-Sensitivity", type: "lab",     detail: "Quest",  checked: true },
      { id: "s2", label: "Basic Metabolic Panel",        type: "lab",     detail: "Quest",  checked: true },
      { id: "s3", label: "CBC with Differential",        type: "lab",     detail: "Quest",  checked: true },
      { id: "s4", label: "Chest X-ray, PA & Lateral",   type: "imaging", detail: "RadNet", checked: true },
    ],
  },
];

const tabs = [
  { id: "clinical",     label: "Clinical Note" },
  { id: "diagnostics",  label: "Diagnostics & Orders" },
  { id: "transcript",   label: "Transcript" },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function R1Baseline() {
  const [selectedPatient, setSelectedPatient] = useState("2");
  const [activeTab, setActiveTab] = useState("diagnostics");
  const [orders, setOrders] = useState(initialOrders);
  const [orderSets, setOrderSets] = useState<OrderSetItem[]>(initialOrderSets);

  function toggleOrder(id: string) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, checked: !o.checked } : o));
  }

  function toggleSet(setId: string) {
    setOrderSets(prev => prev.map(s => {
      if (s.id !== setId) return s;
      const allChecked = s.children.every(c => c.checked);
      return { ...s, children: s.children.map(c => ({ ...c, checked: !allChecked })) };
    }));
  }

  function toggleSetChild(setId: string, childId: string) {
    setOrderSets(prev => prev.map(s => s.id !== setId ? s : {
      ...s,
      children: s.children.map(c => c.id !== childId ? c : { ...c, checked: !c.checked }),
    }));
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* Primary Nav */}
      <PrimaryNav
        logo={<AmbientLogo size={28} />}
        items={navItems}
        bottomItems={bottomNavItems}
        userInitial="A"
      />

      {/* Secondary nav panel */}
      <div className="flex flex-col w-[220px] border-r border-[var(--shape-outline,rgba(0,0,0,0.1))] shrink-0 bg-white">
        {/* Header */}
        <div className="flex items-center h-[48px] px-[8px] py-[12px] shrink-0">
          <div className="flex items-center h-[28px] px-[4px] rounded-[6px]">
            <h2 className="t-title-lg text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">
              My Scribes
            </h2>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-[4px] items-center px-[4px] pb-[4px] shrink-0">
          <Button
            variant="tertiary"
            size="small"
            prefix={<Icon name="search" size={16} />}
          >
            Search
          </Button>
          <Button
            variant="tertiary"
            size="small"
            prefix={<Icon name="filter_list" size={16} />}
          >
            Filter
          </Button>
        </div>

        {/* Patient list */}
        <div className="flex-1 overflow-y-auto scrollable">
          <div className="px-[12px] py-[8px]">
            <span className="t-title-sm text-[var(--foreground-secondary,#666)]">
              Thu, Dec 19th (Today)
            </span>
          </div>
          {todayPatients.map((p) => (
            <SecondaryNavItem
              key={p.id}
              name={p.name}
              chiefComplaint={p.chiefComplaint}
              age={p.age}
              gender={p.gender}
              status={p.status}
              duration={p.duration}
              isSelected={selectedPatient === p.id}
              onClick={() => setSelectedPatient(p.id)}
            />
          ))}
          <div className="px-[12px] py-[8px]">
            <span className="t-title-sm text-[var(--foreground-secondary,#666)]">
              Wed, Dec 18th
            </span>
          </div>
          {yesterdayPatients.map((p) => (
            <SecondaryNavItem
              key={p.id}
              name={p.name}
              chiefComplaint={p.chiefComplaint}
              age={p.age}
              gender={p.gender}
              status={p.status}
              duration={p.duration}
              isSelected={selectedPatient === p.id}
              onClick={() => setSelectedPatient(p.id)}
            />
          ))}
        </div>

        {/* Record new scribe */}
        <div className="p-[12px]">
          <Button
            variant="primary"
            size="medium"
            prefix={<Icon name="mic" size={16} filled />}
            className="w-full whitespace-nowrap"
          >
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
              <h1 className="t-title-xl text-[var(--foreground-primary,#1a1a1a)]">
                John Doe
              </h1>
            </div>
            <Button
              variant="tertiary-neutral"
              size="small"
              prefix={<Icon name="more_horiz" size={16} />}
            >
              Menu
            </Button>
          </div>
          <p className="px-[12px] t-body-sm text-[var(--foreground-secondary,#666)]">
            Chest Pain · 42 · M · 15m 36s
          </p>
        </div>

        {/* Tabs */}
        <div className="max-w-[640px] w-full px-[20px] shrink-0">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollable w-full flex flex-col items-center">
          <div className="max-w-[640px] w-full px-[20px] py-[32px] flex flex-col gap-[24px]">

          {/* Diagnostic Codes */}
          <section>
            <div className="flex items-center justify-between mb-[16px]">
              <h2 className="t-title-lg text-[var(--foreground-primary,#1a1a1a)]">
                Diagnostic Codes
              </h2>
            </div>

            {/* ICD10 */}
            <div className="flex items-center justify-between mb-[8px]">
              <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">
                ICD10 Codes
              </span>
              <Button
                variant="tertiary"
                size="small"
                prefix={<Icon name="content_copy" size={16} />}
              >
                Copy Codes
              </Button>
            </div>
            <div className="flex flex-col gap-[8px] mb-[24px]">
              {icd10Codes.map((c) => (
                <div key={c.code} className="flex items-center gap-[4px]">
                  <Link label={c.code} size="small" className="w-[80px] shrink-0" />
                  <span className="t-body-md text-[var(--foreground-primary,#1a1a1a)]">
                    {c.description}
                  </span>
                </div>
              ))}
            </div>

            {/* CPT */}
            <div className="flex items-center justify-between mb-[8px]">
              <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">
                CPT Codes
              </span>
              <Button
                variant="tertiary"
                size="small"
                prefix={<Icon name="content_copy" size={16} />}
              >
                Copy Codes
              </Button>
            </div>
            <div className="flex flex-col gap-[8px]">
              {cptCodes.map((c) => (
                <div key={c.code} className="flex items-center gap-[4px]">
                  <Link label={c.code} size="small" className="w-[80px] shrink-0" />
                  <span className="t-body-md text-[var(--foreground-primary,#1a1a1a)]">
                    {c.description}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Orders */}
          <section>
            <h2 className="t-title-lg text-[var(--foreground-primary,#1a1a1a)] mb-[16px]">
              Orders
            </h2>
            <div className="flex flex-col gap-[8px]">
              {/* Individual orders */}
              {orders.map((o) => (
                <div key={o.id} className="flex items-center gap-[8px]">
                  <Checkbox state={o.checked ? "selected" : "unselected"} onChange={() => toggleOrder(o.id)} />
                  <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">{o.label}</span>
                  <span className="text-[12px] text-[var(--foreground-tertiary,#b3b3b3)] leading-[1.2] shrink-0">·</span>
                  <span className="t-body-xs text-[var(--foreground-secondary,#666)] shrink-0">{o.detail}</span>
                  <span className="text-[12px] font-bold text-[var(--foreground-brand,#1132ee)] leading-[1.2] shrink-0">{o.icd}</span>
                </div>
              ))}

              {/* Order sets */}
              {orderSets.map((set) => {
                const allChecked = set.children.every(c => c.checked);
                const someChecked = set.children.some(c => c.checked);
                const checkboxState = allChecked ? "selected" : someChecked ? "indeterminate" : "unselected";
                return (
                  <div key={set.id} className="flex flex-col gap-[4px]">
                    {/* Set header */}
                    <div className="flex items-center gap-[8px]">
                      <Checkbox state={checkboxState} onChange={() => toggleSet(set.id)} />
                      <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">{set.label}</span>
                      {set.labDetail && <span className="text-[12px] text-[var(--foreground-tertiary,#b3b3b3)] leading-[1.2] shrink-0">·</span>}
                      {set.labDetail && <span className="t-body-xs text-[var(--foreground-secondary,#666)] shrink-0">{set.labDetail}</span>}
                      {set.imagingDetail && <span className="text-[12px] text-[var(--foreground-tertiary,#b3b3b3)] leading-[1.2] shrink-0">·</span>}
                      {set.imagingDetail && <span className="t-body-xs text-[var(--foreground-secondary,#666)] shrink-0">{set.imagingDetail}</span>}
                      <span className="text-[12px] font-bold text-[var(--foreground-brand,#1132ee)] leading-[1.2] shrink-0">{set.icd}</span>
                    </div>
                    {/* Children */}
                    <div className="ml-[12px] pl-[12px] border-l-2 border-[#ebebeb] flex flex-col gap-[4px]">
                      {set.children.map(child => (
                        <div key={child.id} className="flex items-center gap-[8px]">
                          <Checkbox state={child.checked ? "selected" : "unselected"} onChange={() => toggleSetChild(set.id, child.id)} />
                          <span className="t-body-md text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">{child.label}</span>
                          <span className="text-[12px] text-[var(--foreground-tertiary,#b3b3b3)] leading-[1.2] shrink-0">·</span>
                          <span className="t-body-xs text-[var(--foreground-secondary,#666)] shrink-0">{child.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between max-w-[640px] w-full px-[20px] pt-[8px] pb-[24px] shrink-0">
          <Button
            variant="primary"
            size="large"
            prefix={<Icon name="cloud_upload" size={20} />}
          >
            Sync to EHR
          </Button>
          <Link
            label="Assistant"
            size="medium"
            prefix={<MagicButton size={18} />}
          />
        </div>

      </div>
    </div>
  );
}
