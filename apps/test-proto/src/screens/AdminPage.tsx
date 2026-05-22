import React, { useState, useEffect, useRef } from "react";
import { PrimaryNav, Button, Icon, IconButton, Switch, TextField, MagicButton, Checkbox } from "@ds/ui";
import { CommureLogo } from "../components/CommureLogo";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminSection = "analytics" | "user-management" | "template-manager" | "site-dictionary" | "macros-library" | "single-sign-on" | "feedback-insights";

type User = {
  id: string;
  name: string;
  email: string;
  facility: string;
  lastScribe: string;
  role: "Provider" | "Admin" | "Staff";
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockUsers: User[] = [
  { id: "1",  name: "Vinay Kapadia",        email: "v.kapadia@mountainview.com",        facility: "Mountain View", lastScribe: "Mar 21st, 2025, 12:00pm", role: "Provider" },
  { id: "2",  name: "Harrison Rolins",      email: "h.rolins@mountainview.com",         facility: "Mountain View", lastScribe: "Mar 21st, 2025, 12:00pm", role: "Provider" },
  { id: "3",  name: "Marvin Depas",         email: "m.depas@mountainview.com",          facility: "Mountain View", lastScribe: "Mar 21st, 2025, 12:00pm", role: "Provider" },
  { id: "4",  name: "Samyukth Sreenivasan", email: "s.sreenivasan@mountainview.com",    facility: "Mountain View", lastScribe: "Mar 21st, 2025, 12:00pm", role: "Provider" },
  { id: "5",  name: "Arcot Premkumar",      email: "a.premkumar@mountainview.com",      facility: "Mountain View", lastScribe: "Mar 21st, 2025, 12:00pm", role: "Provider" },
  { id: "6",  name: "Sasi Ghanta",          email: "s.ghanta@mountainview.com",         facility: "Mountain View", lastScribe: "Mar 20th, 2025, 3:14pm",  role: "Provider" },
  { id: "7",  name: "Logan Henry",          email: "l.henry@mountainview.com",          facility: "Mountain View", lastScribe: "Mar 20th, 2025, 11:42am", role: "Provider" },
  { id: "8",  name: "Deanna Kraemer",       email: "d.kraemer@mountainview.com",        facility: "Mountain View", lastScribe: "Mar 19th, 2025, 9:05am",  role: "Provider" },
  { id: "9",  name: "Danisia Ellin",        email: "d.ellin@mountainview.com",          facility: "Mountain View", lastScribe: "Mar 19th, 2025, 2:30pm",  role: "Admin"    },
  { id: "10", name: "Terry Philips",        email: "t.philips@mountainview.com",        facility: "Mountain View", lastScribe: "Mar 18th, 2025, 10:00am", role: "Provider" },
  { id: "11", name: "Ashley Garcia",        email: "a.garcia@mountainview.com",         facility: "Mountain View", lastScribe: "Mar 18th, 2025, 4:45pm",  role: "Provider" },
  { id: "12", name: "Richard Seymore",      email: "r.seymore@mountainview.com",        facility: "Mountain View", lastScribe: "Mar 17th, 2025, 1:20pm",  role: "Provider" },
  { id: "13", name: "James Vetrovs",        email: "j.vetrovs@mountainview.com",        facility: "Mountain View", lastScribe: "Mar 17th, 2025, 8:55am",  role: "Provider" },
  { id: "14", name: "Danny Rivers",         email: "d.rivers@mountainview.com",         facility: "Mountain View", lastScribe: "Mar 16th, 2025, 3:00pm",  role: "Staff"    },
  { id: "15", name: "John Doe",             email: "j.doe@mountainview.com",            facility: "Mountain View", lastScribe: "Mar 16th, 2025, 12:30pm", role: "Provider" },
];

const PAGE_SIZE_OPTIONS = [15, 25, 50];
const DEFAULT_PAGE_SIZE = 15;
const TOTAL_RECORDS = 1113;
const TOTAL_PAGES = Math.ceil(TOTAL_RECORDS / DEFAULT_PAGE_SIZE);

// ─── Macro mock data ──────────────────────────────────────────────────────────

type Macro = {
  id: string;
  name: string;
  source: "Ambient" | "Athena" | "Admin";
  assignedTo: string;
  status: "Complete" | "Incomplete";
  providers: number;
  allProviders?: boolean;
  providerAccess: "locked" | "unlocked";
  assignedUserIds: string[];
};

const ALL_USER_IDS = mockUsers.map((u) => u.id);

const mockMacros: Macro[] = [
  { id: "1",  name: "Normal Physical Exam",          source: "Ambient", assignedTo: "SOAP: Objective",              status: "Complete",   providers: 250,                                providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5","6","7","8","9","10","11","12"] },
  { id: "2",  name: "Chest Pain ROS",                source: "Athena",  assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 312, allProviders: true, providerAccess: "locked",   assignedUserIds: ALL_USER_IDS },
  { id: "3",  name: "Diabetes Follow-up Note",       source: "Admin",   assignedTo: "Progress Note: Patient Name",  status: "Complete",   providers: 60,                                 providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5"] },
  { id: "4",  name: "Hypertension Management HPI",   source: "Ambient", assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 100,                                providerAccess: "locked",   assignedUserIds: ["1","2","3","4","5","6","7","8"] },
  { id: "5",  name: "Well Child Visit Summary",      source: "Athena",  assignedTo: "",                             status: "Incomplete", providers: 445, allProviders: true, providerAccess: "locked",   assignedUserIds: ALL_USER_IDS },
  { id: "6",  name: "Medication Reconciliation",     source: "Admin",   assignedTo: "SOAP: Assessment",             status: "Complete",   providers: 60,                                 providerAccess: "unlocked", assignedUserIds: ["2","4","6","8","10"] },
  { id: "7",  name: "Respiratory Exam Template",     source: "Ambient", assignedTo: "SOAP: Objective",              status: "Complete",   providers: 250,                                providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5","6","7","8","9","10","11","12"] },
  { id: "8",  name: "Neurological Exam",             source: "Athena",  assignedTo: "SOAP: Objective",              status: "Complete",   providers: 100,                                providerAccess: "locked",   assignedUserIds: ["3","5","7","9","11","13","15","1"] },
  { id: "9",  name: "Abdominal Exam",                source: "Admin",   assignedTo: "Progress Note: Patient Name",  status: "Complete",   providers: 178, allProviders: true, providerAccess: "unlocked", assignedUserIds: ALL_USER_IDS },
  { id: "10", name: "Lower Back Pain Assessment",    source: "Ambient", assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 60,                                 providerAccess: "unlocked", assignedUserIds: ["1","3","5","7","9"] },
  { id: "11", name: "Anxiety & Depression Screen",   source: "Athena",  assignedTo: "",                             status: "Incomplete", providers: 250,                                providerAccess: "locked",   assignedUserIds: ["1","2","3","4","5","6","7","8","9","10","11","12"] },
  { id: "12", name: "Post-Operative Follow-up",      source: "Admin",   assignedTo: "SOAP: Assessment",             status: "Complete",   providers: 100,                                providerAccess: "locked",   assignedUserIds: ["2","4","6","8","10","12","14"] },
  { id: "13", name: "Preventive Care Checklist",     source: "Ambient", assignedTo: "SOAP: Objective",              status: "Complete",   providers: 523, allProviders: true, providerAccess: "unlocked", assignedUserIds: ALL_USER_IDS },
  { id: "14", name: "GERD Assessment Note",          source: "Athena",  assignedTo: "",                             status: "Incomplete", providers: 250,                                providerAccess: "locked",   assignedUserIds: ["1","2","3","4","5","6","7","8","9","10","11","12"] },
  { id: "15", name: "Migraine & Headache HPI",       source: "Admin",   assignedTo: "Progress Note: Patient Name",  status: "Complete",   providers: 60,                                 providerAccess: "unlocked", assignedUserIds: ["1","5","9","13","15"] },
  { id: "16", name: "Thyroid Dysfunction Note",      source: "Ambient", assignedTo: "SOAP: Assessment",             status: "Complete",   providers: 88,                                 providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5","6","7","8"] },
  { id: "17", name: "UTI Assessment",                source: "Athena",  assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 120,                                providerAccess: "locked",   assignedUserIds: ["2","4","6","8","10","12"] },
  { id: "18", name: "Asthma Exacerbation HPI",       source: "Admin",   assignedTo: "SOAP: Subjective",             status: "Incomplete", providers: 1,                                  providerAccess: "unlocked", assignedUserIds: ["3"] },
  { id: "19", name: "Chronic Kidney Disease Note",   source: "Ambient", assignedTo: "Progress Note: History/Background", status: "Complete", providers: 75,                             providerAccess: "unlocked", assignedUserIds: ["1","3","5","7","9","11"] },
  { id: "20", name: "Allergic Rhinitis ROS",         source: "Athena",  assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 200, allProviders: false,           providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5","6","7","8","9","10"] },
  { id: "21", name: "Atrial Fibrillation HPI",       source: "Admin",   assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 45,                                 providerAccess: "locked",   assignedUserIds: ["1","2","3","4","5"] },
  { id: "22", name: "Obesity Counseling Note",       source: "Ambient", assignedTo: "Progress Note: Plan/Recommendations", status: "Complete", providers: 310, allProviders: true,      providerAccess: "unlocked", assignedUserIds: ALL_USER_IDS },
  { id: "23", name: "Osteoporosis Follow-up",        source: "Athena",  assignedTo: "",                             status: "Incomplete", providers: 1,                                  providerAccess: "unlocked", assignedUserIds: ["7"] },
  { id: "24", name: "Wound Care Assessment",         source: "Admin",   assignedTo: "SOAP: Objective",              status: "Complete",   providers: 55,                                 providerAccess: "unlocked", assignedUserIds: ["6","7","8","9","10"] },
  { id: "25", name: "Insomnia Evaluation",           source: "Ambient", assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 130,                                providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5","6","7","8","9","10","11","12"] },
  { id: "26", name: "Chronic Pain Management",       source: "Athena",  assignedTo: "SOAP: Assessment",             status: "Complete",   providers: 95,                                 providerAccess: "locked",   assignedUserIds: ["3","5","7","9","11","13","15"] },
  { id: "27", name: "Smoking Cessation Counseling",  source: "Admin",   assignedTo: "Progress Note: Plan/Recommendations", status: "Incomplete", providers: 1,                          providerAccess: "unlocked", assignedUserIds: ["11"] },
  { id: "28", name: "Pediatric Fever Assessment",    source: "Ambient", assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 180,                                providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5","6","7","8","9","10"] },
  { id: "29", name: "Syncope Evaluation",            source: "Athena",  assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 70,                                 providerAccess: "locked",   assignedUserIds: ["1","3","5","7","9","11","13"] },
  { id: "30", name: "Fall Risk Assessment",          source: "Admin",   assignedTo: "Progress Note: Clinical Observations", status: "Complete", providers: 420, allProviders: true,     providerAccess: "unlocked", assignedUserIds: ALL_USER_IDS },
  { id: "31", name: "Skin Lesion Exam",              source: "Ambient", assignedTo: "SOAP: Objective",              status: "Complete",   providers: 60,                                 providerAccess: "unlocked", assignedUserIds: ["2","4","6","8","10"] },
  { id: "32", name: "Erectile Dysfunction Note",     source: "Athena",  assignedTo: "",                             status: "Incomplete", providers: 1,                                  providerAccess: "unlocked", assignedUserIds: ["2"] },
  { id: "33", name: "Urinary Incontinence HPI",      source: "Admin",   assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 85,                                 providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5","6","7","8"] },
  { id: "34", name: "Shoulder Pain Exam",            source: "Ambient", assignedTo: "SOAP: Objective",              status: "Complete",   providers: 110,                                providerAccess: "locked",   assignedUserIds: ["1","3","5","7","9","11","13","15","2"] },
  { id: "35", name: "Hyperlipidemia Follow-up",      source: "Athena",  assignedTo: "SOAP: Assessment",             status: "Complete",   providers: 265,                                providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5","6","7","8","9","10","11","12"] },
  { id: "36", name: "Vertigo Assessment",            source: "Admin",   assignedTo: "SOAP: Subjective",             status: "Incomplete", providers: 1,                                  providerAccess: "unlocked", assignedUserIds: ["14"] },
  { id: "37", name: "Ear Infection Exam",            source: "Ambient", assignedTo: "SOAP: Objective",              status: "Complete",   providers: 50,                                 providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5"] },
  { id: "38", name: "Depression Follow-up Note",     source: "Athena",  assignedTo: "Progress Note: History/Background", status: "Complete", providers: 145,                            providerAccess: "locked",   assignedUserIds: ["1","2","3","4","5","6","7","8","9","10","11","12","13"] },
  { id: "39", name: "Knee Osteoarthritis Exam",      source: "Admin",   assignedTo: "SOAP: Objective",              status: "Complete",   providers: 90,                                 providerAccess: "unlocked", assignedUserIds: ["2","4","6","8","10","12","14"] },
  { id: "40", name: "Palpitations Workup HPI",       source: "Ambient", assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 175,                                providerAccess: "locked",   assignedUserIds: ["1","2","3","4","5","6","7","8","9","10"] },
];

const MACRO_TOTAL = 248;
const MACRO_TOTAL_PAGES = Math.ceil(MACRO_TOTAL / DEFAULT_PAGE_SIZE);

// ─── Sub-components ───────────────────────────────────────────────────────────

type SortDir = "asc" | "desc";

function SortableHeader({
  label,
  align = "left",
  stretch = false,
  sortKey,
  activeSortKey,
  sortDir,
  onSort,
}: {
  label: string;
  align?: "left" | "right";
  stretch?: boolean;
  sortKey?: string;
  activeSortKey?: string;
  sortDir?: SortDir;
  onSort?: (key: string) => void;
}) {
  const isActive = sortKey != null && sortKey === activeSortKey;
  const iconName = isActive && sortDir === "asc" ? "arrow_upward" : "arrow_downward";

  return (
    <th className={`bg-[var(--surface-1,#f7f7f7)] first:rounded-tl-[6px] first:rounded-bl-[6px] last:rounded-tr-[6px] last:rounded-br-[6px]${stretch ? " w-full" : ""} ${align === "right" ? "px-[16px] py-[10px] text-right" : "px-[16px] py-[10px] text-left"}`}>
      <button
        onClick={sortKey && onSort ? () => onSort(sortKey) : undefined}
        className={`flex items-center gap-[4px] text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap outline-none transition-colors${align === "right" ? " ml-auto" : ""}${sortKey ? " cursor-pointer" : " cursor-default"}`}
        style={{ fontFeatureSettings: "'ss07' 1" }}
      >
        {label}
        <span className="text-[var(--foreground-tertiary,#808080)]">
          <Icon name={iconName} size={14} />
        </span>
      </button>
    </th>
  );
}

function UserManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [sortKey, setSortKey] = useState<string>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: string) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  const filtered = mockUsers
    .filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let av: string = "";
      let bv: string = "";
      if (sortKey === "name")      { av = a.name;      bv = b.name; }
      if (sortKey === "email")     { av = a.email;     bv = b.email; }
      if (sortKey === "facility")  { av = a.facility;  bv = b.facility; }
      if (sortKey === "lastScribe"){ av = a.lastScribe; bv = b.lastScribe; }
      if (sortKey === "role")      { av = a.role;      bv = b.role; }
      const cmp = av.localeCompare(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedUsers = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col flex-1 min-h-0 px-[32px] py-[24px] overflow-y-auto scrollable">
      {/* Page title */}
      <h1 className="text-[24px] font-bold leading-[1.2] tracking-[0px] text-[var(--foreground-primary,#1a1a1a)] mb-[24px]">
        User Management
      </h1>

      {/* Toolbar */}
      <div className="flex items-center gap-[12px] mb-[16px]">
        {/* Search */}
        <div className="relative flex items-center w-[240px]">
          <span className="absolute left-[10px] text-[var(--foreground-secondary,#666)] flex items-center pointer-events-none">
            <Icon name="search" size={16} />
          </span>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-[36px] pl-[34px] pr-[12px] rounded-[6px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[var(--foreground-tertiary,#808080)] outline-none focus:border-[var(--accent,#1132ee)] bg-white"
            style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07' 1" }}
          />
        </div>

        {/* Filters */}
        <Button
          variant="tertiary-neutral"
          size="small"
          prefix={<Icon name="person" size={16} />}
        >
          All Roles
        </Button>
        <Button
          variant="tertiary-neutral"
          size="small"
          prefix={<Icon name="table_chart" size={16} />}
        >
          All Facilities
        </Button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* New User */}
        <Button
          variant="primary"
          size="medium"
          prefix={<Icon name="add" size={16} />}
        >
          New User
        </Button>
      </div>

      {/* Table */}
      <div className="flex flex-col">
        <table className="border-separate border-spacing-0">
          <thead>
            <tr>
              <SortableHeader label="Name"       sortKey="name"       activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Email"      sortKey="email"      activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Facility"   sortKey="facility"   activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Last Scribe" sortKey="lastScribe" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Role"       sortKey="role"       activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {pagedUsers.map((user) => (
              <tr
                key={user.id}
                className="group hover:bg-[var(--surface-1,#f7f7f7)] cursor-pointer transition-colors"
              >
                <td className="px-[16px] py-[10px] text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] border-b group-last:border-b-0 border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                  {user.name}
                </td>
                <td className="px-[16px] py-[10px] text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-secondary,#666)] whitespace-nowrap border-b group-last:border-b-0 border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                  {user.email}
                </td>
                <td className="px-[16px] py-[10px] text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap border-b group-last:border-b-0 border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                  {user.facility}
                </td>
                <td className="px-[16px] py-[10px] text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-secondary,#666)] whitespace-nowrap border-b group-last:border-b-0 border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                  {user.lastScribe}
                </td>
                <td className="px-[16px] py-[10px] whitespace-nowrap border-b group-last:border-b-0 border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                  <span className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-semantic-success,#3f8d43)]">
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-[12px] shrink-0">
        <div className="flex items-center gap-[8px]">
          <span
            className="text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-secondary,#666)]"
            style={{ fontFeatureSettings: "'ss07' 1" }}
          >
            {filtered.length.toLocaleString()} records
          </span>
          <div className="relative">
            <button
              onClick={() => setPageSizeOpen(o => !o)}
              className="flex items-center gap-[4px] h-[28px] px-[8px] rounded-[6px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors outline-none"
              style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07' 1" }}
            >
              {pageSize}/Page
              <Icon name="arrow_drop_down" size={16} />
            </button>
            {pageSizeOpen && (
              <>
                <div className="fixed inset-0 z-[30]" onClick={() => setPageSizeOpen(false)} />
                <div className="absolute bottom-full left-0 mb-[4px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[40] py-[4px] min-w-[100px]">
                  {PAGE_SIZE_OPTIONS.map(n => (
                    <button key={n} onClick={() => { setPageSize(n); setPage(1); setPageSizeOpen(false); }}
                      className={`flex items-center w-full px-[12px] py-[7px] text-[13px] font-normal transition-colors ${pageSize === n ? "bg-[var(--litmus-25,#f1f3fe)] font-bold text-[var(--foreground-primary,#1a1a1a)]" : "text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)]"}`}
                      style={{ fontFamily: "Lato, sans-serif" }}
                    >
                      {n}/Page
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-[8px]">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center justify-center w-[28px] h-[28px] rounded-[6px] text-[var(--foreground-secondary,#666)] hover:bg-[var(--surface-1,#f7f7f7)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors outline-none"
          >
            <Icon name="chevron_left" size={18} />
          </button>
          <span
            className="text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)]"
            style={{ fontFeatureSettings: "'ss07' 1" }}
          >
            Page {page}/{totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center justify-center w-[28px] h-[28px] rounded-[6px] text-[var(--foreground-secondary,#666)] hover:bg-[var(--surface-1,#f7f7f7)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors outline-none"
          >
            <Icon name="chevron_right" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Template / section data ──────────────────────────────────────────────────

const TEMPLATE_SECTIONS: Record<string, string[]> = {
  "SOAP":          ["Subjective", "Objective", "Assessment", "Plan"],
  "Progress Note": ["Patient Name", "History/Background", "Plan/Recommendations", "Clinical Observations"],
  "Meeting Note":  ["Meeting Details", "Summary of Meeting"],
  "BIRP Note":     ["Behavior", "Intervention", "Response", "Plan"],
};
const TEMPLATES = Object.keys(TEMPLATE_SECTIONS);

function parseAssignedTo(assignedTo: string): { template: string; section: string } {
  if (!assignedTo) return { template: "", section: "" };
  for (const tmpl of TEMPLATES) {
    if (assignedTo.startsWith(tmpl + ":")) {
      return { template: tmpl, section: assignedTo.slice(tmpl.length + 2) };
    }
  }
  return { template: "", section: "" };
}

const MACRO_CONTENT_MAP: Record<string, string> = {
  "Normal Physical Exam": "General: Patient appears well-developed, well-nourished, in no acute distress.\nHEENT: Normocephalic, atraumatic. Eyes PERRLA, EOMI. TMs clear bilaterally.\nNeck: Supple, no lymphadenopathy or thyromegaly.\nLungs: Clear to auscultation bilaterally, no wheezes, rales, or rhonchi.\nHeart: Regular rate and rhythm, no murmurs, rubs, or gallops.\nAbdomen: Soft, non-tender, non-distended, normal bowel sounds.\nExtremities: No clubbing, cyanosis, or edema. Pulses 2+ throughout.\nNeuro: Alert and oriented ×3, cranial nerves II–XII grossly intact.",
  "Chest Pain ROS": "Cardiovascular: Reports [/chest pain onset and character], denies palpitations, denies syncope.\nRespiratory: Reports [/shortness of breath], denies hemoptysis, denies pleuritic pain.\nConstitutional: Denies fever, chills, diaphoresis.\nGI: Denies nausea, vomiting, dyspepsia, or regurgitation.\nMusculoskeletal: Denies chest wall tenderness or recent trauma.",
  "Diabetes Follow-up Note": "Blood glucose: [/BG reading]. Last HbA1c: [/HbA1c value] on [/date].\nDietary compliance: [/dietary notes]. Medication adherence: [/adherence].\nFoot exam performed — no ulcerations, sensation intact bilaterally.\nBlood pressure: [/BP]. Current insulin regimen reviewed and adjusted as indicated.\nReferrals to ophthalmology and podiatry are up to date.",
  "Hypertension Management HPI": "Patient presents for hypertension follow-up. Reports [/compliance with medications]. BP today: [/BP reading].\nDenies headache, visual changes, chest pain, or dyspnea at rest.\nLast echocardiogram [/date]. Current medications include [/medications]. No adverse effects reported.",
  "Well Child Visit Summary": "Child appears well-developed and well-nourished, meeting developmental milestones for age [/age].\nImmunizations reviewed and updated per CDC schedule.\nGrowth chart: Weight [/percentile]%ile, Height [/percentile]%ile, BMI [/percentile]%ile.\nVision and hearing screening within normal limits.\nBehavioral and social development appropriate. Safety counseling and anticipatory guidance provided to caregiver.",
  "Medication Reconciliation": "Medications reviewed with patient at today's visit. Patient reports taking [/medication list] as prescribed.\nAdherence: [/adherence level]. No new medications added since last visit.\nNo OTC medications or supplements reported beyond [/supplements].\nAllergies confirmed: [/allergies]. No duplicate therapies or contraindications identified.",
  "Respiratory Exam Template": "Respiratory rate: [/RR]. O₂ saturation: [/SpO2]% on room air.\nBreath sounds: [/breath sounds — clear / wheezes / rales / rhonchi].\nNo accessory muscle use, no nasal flaring. Percussion resonant throughout.\nTactile fremitus [/normal/decreased/increased]. No tracheal deviation.",
  "Neurological Exam": "Alert and oriented ×3. Cranial nerves II–XII intact bilaterally.\nMotor: 5/5 strength in bilateral upper and lower extremities.\nSensation intact to light touch and pinprick throughout.\nCoordination: finger-nose-finger intact. Gait steady, no ataxia.\nReflexes 2+ throughout, symmetric. Babinski absent. No focal deficits.",
  "Abdominal Exam": "Abdomen soft, non-tender, non-distended. Bowel sounds present in all four quadrants.\nNo hepatosplenomegaly. No CVA tenderness. No masses palpated.\nNo hernias identified. Murphy's sign negative. McBurney's point non-tender.",
  "Lower Back Pain Assessment": "Pain severity: [/0–10]. Onset: [/onset date]. Character: [/sharp/dull/aching].\nRadiation to [/location]. Aggravated by [/aggravating factors]. Relieved by [/relieving factors].\nNo bowel or bladder dysfunction. No saddle anesthesia.\nStraight leg raise: [/positive/negative] bilaterally. ROM [/limited/full]. Paraspinal tenderness at [/level].",
  "Anxiety & Depression Screen": "PHQ-9: [/score] — [/severity]. GAD-7: [/score] — [/severity].\nPatient reports [/mood description] over the past two weeks.\nDenies suicidal ideation, homicidal ideation, or self-harm.\nSleep: [/sleep quality]. Appetite: [/appetite]. Current supports: [/therapy/medications/other].",
  "Post-Operative Follow-up": "Post-op day [/POD] following [/procedure]. Incision site: [/clean and intact/healing well/signs of infection].\nPain: [/0–10], managed with [/pain regimen]. Drains: [/drain status].\nAmbulation: [/status]. Appetite and bowel function [/returning to baseline/note changes].\nNo fever, chills, or signs of systemic infection.",
  "Preventive Care Checklist": "Colonoscopy: [/date or due]. Mammogram: [/date or due]. Pap smear: [/date or due]. DEXA: [/date or due].\nImmunizations: Flu [/date], Tdap [/date], Pneumococcal [/date], Zoster [/date].\nAspirin therapy: [/status]. Statin therapy: [/status].\nCounseling on diet, exercise, smoking cessation, and fall prevention provided.",
  "GERD Assessment Note": "Symptom frequency: [/daily/weekly/intermittent]. Heartburn and/or regurgitation present.\nTriggers: [/fatty foods/caffeine/alcohol/lying flat/other]. Nocturnal symptoms: [/yes/no].\nDysphagia: [/yes/no]. Unintentional weight loss: [/yes/no].\nCurrent PPI: [/medication and dose]. Response: [/full/partial/none]. No red-flag symptoms.",
  "Migraine & Headache HPI": "Headache type: [/migraine/tension/cluster]. Onset: [/date and circumstances]. Duration: [/hours].\nLocation: [/unilateral/bilateral/frontal/occipital]. Quality: [/throbbing/pressure/stabbing]. Severity: [/0–10].\nAssociated symptoms: [/nausea/vomiting/photophobia/phonophobia/aura].\nFrequency: [/per month]. Triggers: [/stress/hormonal/food/sleep]. Abortive therapy response: [/good/partial/poor].",
};

const SELECTION_CRITERIA_MAP: Record<string, string> = {
  "Normal Physical Exam": "Apply when documenting a comprehensive head-to-toe physical exam. Use for wellness visits, pre-operative assessments, annual physicals, or any encounter requiring a full exam section.",
  "Chest Pain ROS": "Use when the chief complaint involves chest pain, chest pressure, or chest tightness. Also applicable during dyspnea workup when cardiac etiology is being evaluated.",
  "Diabetes Follow-up Note": "Apply for established diabetic patients presenting for glucose management, HbA1c review, medication titration, or diabetic complication monitoring.",
  "Hypertension Management HPI": "Use when the patient presents specifically for blood pressure management, antihypertensive review, or hypertension-related symptom evaluation.",
  "Well Child Visit Summary": "Apply for all pediatric wellness encounters — newborn through 18-year-old well-child checks per AAP schedule.",
  "Medication Reconciliation": "Apply at every care transition: hospital discharge, new patient intake, post-ER follow-up, or any visit where medication accuracy is clinically significant.",
  "Respiratory Exam Template": "Use when the patient presents with respiratory complaints (cough, dyspnea, wheezing) or when a detailed pulmonary exam section is required.",
  "Neurological Exam": "Apply when neurological findings must be formally documented — new symptoms, known neurological condition follow-up, or any encounter requiring a structured neuro exam.",
  "Abdominal Exam": "Use for abdominal pain workup, GI complaints, surgical follow-up, or any encounter where a detailed abdominal exam is clinically indicated.",
  "Lower Back Pain Assessment": "Apply when the chief complaint is low back pain, lumbar strain, sciatica, or radiculopathy. Not appropriate for thoracic or cervical spine complaints.",
  "Anxiety & Depression Screen": "Use at annual wellness visits per USPSTF guidelines, or when the patient reports mood changes, sleep disturbance, anhedonia, or anxiety symptoms.",
  "Post-Operative Follow-up": "Apply for all post-surgical follow-up visits within 90 days of a procedure. Customize procedure name and POD timeline per patient record.",
  "Preventive Care Checklist": "Use during adult annual wellness visits. Verify screening dates against the patient's EMR before applying to avoid duplicate documentation.",
  "GERD Assessment Note": "Apply when the patient presents with heartburn, acid reflux, regurgitation, or dyspepsia. Also use when chest pain workup has ruled out cardiac etiology.",
  "Migraine & Headache HPI": "Use when the chief complaint is headache or migraine — both new presentations and established migraine follow-up. Not for headaches secondary to trauma.",
};

// ─── Macro Edit/Create Drawer ─────────────────────────────────────────────────

type MacroEditDrawerProps = {
  macro?: Macro;   // undefined → create mode
  onClose: () => void;
  onCreate?: (macro: Macro) => void;
  onSave?: (updatedMacro: Macro) => void;
};

function MacroEditDrawer({ macro, onClose, onCreate, onSave }: MacroEditDrawerProps) {
  const isCreate = !macro;
  const { template: initTemplate, section: initSection } = macro
    ? parseAssignedTo(macro.assignedTo)
    : { template: "", section: "" };

  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const [macroName, setMacroName]               = useState(macro?.name ?? "");
  const [template, setTemplate]                 = useState(initTemplate);
  const [section, setSection]                   = useState(initSection);
  const [macroContent, setMacroContent]         = useState(macro ? (MACRO_CONTENT_MAP[macro.name] ?? "") : "");
  const [selectionCriteria, setSelectionCriteria] = useState(macro ? (SELECTION_CRITERIA_MAP[macro.name] ?? "") : "");
  const [isActive, setIsActive]                 = useState(macro ? macro.status === "Complete" : true);
  const [templateOpen, setTemplateOpen]         = useState(false);
  const [sectionOpen, setSectionOpen]           = useState(false);
  const [additionalOpen, setAdditionalOpen]         = useState(false);
  const [contentAiDismissed, setContentAiDismissed] = useState(false);
  const [criteriaAiDismissed, setCriteriaAiDismissed] = useState(false);
  // Only show AI helpers when user has actually edited the field (not just from pre-fill)
  const [contentUserEdited, setContentUserEdited]   = useState(false);
  const [criteriaUserEdited, setCriteriaUserEdited] = useState(false);

  // Provider multi-select
  // selectedProviderIds tracks which of our 15 mock users are checked (for checkbox UI)
  // providerDisplayCount is the real count shown in the trigger and saved to the table
  // It starts from macro.providers and is updated ±1 as the user checks/unchecks
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>(
    macro ? macro.assignedUserIds : []
  );
  const [providerDisplayCount, setProviderDisplayCount] = useState<number>(
    macro ? macro.providers : 0
  );
  const [isLocked, setIsLocked] = useState<boolean>(
    macro ? macro.providerAccess === "locked" : false
  );
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [providerDropSearch, setProviderDropSearch] = useState("");

  const filteredDropProviders = mockUsers.filter((u) =>
    u.name.toLowerCase().includes(providerDropSearch.toLowerCase())
  );
  function toggleProvider(id: string) {
    setSelectedProviderIds((prev) => {
      const wasSelected = prev.includes(id);
      setProviderDisplayCount((c) => Math.max(0, wasSelected ? c - 1 : c + 1));
      return wasSelected ? prev.filter((x) => x !== id) : [...prev, id];
    });
  }

  // Debounced criteria — updates 1s after user stops typing
  const initCriteria = macro ? (SELECTION_CRITERIA_MAP[macro.name] ?? "") : "";
  const [debouncedCriteria, setDebouncedCriteria] = useState(initCriteria);
  useEffect(() => {
    if (!selectionCriteria.trim()) { setDebouncedCriteria(""); return; }
    const t = setTimeout(() => setDebouncedCriteria(selectionCriteria), 1000);
    return () => clearTimeout(t);
  }, [selectionCriteria]);

  // Derived AI states — only active when user has actually edited the field
  const showContentAi = contentUserEdited && macroContent.trim().length > 0 && !contentAiDismissed;
  const criteriaAiState: "none" | "not-enough" | "enough" =
    !criteriaUserEdited || !selectionCriteria.trim() || criteriaAiDismissed ? "none"
    : !debouncedCriteria.trim() ? "none"
    : debouncedCriteria.trim().length >= 50 ? "enough"
    : "not-enough";

  // AI suggestion for "enough" state
  function buildCriteriaSuggestion(text: string): string {
    if (macro && SELECTION_CRITERIA_MAP[macro.name]) return SELECTION_CRITERIA_MAP[macro.name];
    const t = text.trim();
    const cap = t.charAt(0).toUpperCase() + t.slice(1);
    const withDot = /[.!?]$/.test(cap) ? cap : cap + ".";
    return withDot + " Verify that the patient context and chief complaint match these criteria before applying this macro.";
  }
  const criteriaSuggestion = buildCriteriaSuggestion(debouncedCriteria);

  // Validation errors (create mode only)
  const [errors, setErrors] = useState({ template: false, macroName: false, macroContent: false, selectionCriteria: false });

  function handleCreate() {
    const newErrors = {
      template: !template || !section,
      macroName: !macroName.trim(),
      macroContent: !macroContent.trim(),
      selectionCriteria: !selectionCriteria.trim(),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
    const newMacro: Macro = {
      id: Date.now().toString(),
      name: macroName.trim(),
      source: "Admin",
      assignedTo: template && section ? `${template}: ${section}` : "",
      status: (macroName.trim() && template && section && macroContent.trim() && selectionCriteria.trim()) ? "Complete" : "Incomplete",
      providers: selectedProviderIds.length,
      allProviders: selectedProviderIds.length === mockUsers.length,
      providerAccess: isLocked ? "locked" : "unlocked",
      assignedUserIds: selectedProviderIds,
    };
    onCreate?.(newMacro);
    onClose();
  }

  function handleSave() {
    const newErrors = {
      template: !template || !section,
      macroName: !macroName.trim(),
      macroContent: false,
      selectionCriteria: false,
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
    const updatedMacro: Macro = {
      ...macro!,
      name: macroName.trim(),
      assignedTo: template && section ? `${template}: ${section}` : "",
      status: (macroName.trim() && template && section && macroContent.trim() && selectionCriteria.trim()) ? "Complete" : "Incomplete",
      providers: providerDisplayCount,
      allProviders: false,
      providerAccess: isLocked ? "locked" : "unlocked",
      assignedUserIds: selectedProviderIds,
    };
    onSave?.(updatedMacro);
    onClose();
  }

  const sections = TEMPLATE_SECTIONS[template] ?? [];

  // shared td style
  const fieldLabel = "text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)] mb-[2px]";
  const fieldHint  = "text-[13px] font-normal leading-[1.4] text-[var(--foreground-secondary,#666)] mb-[10px]";
  const inputBase  = "w-full h-[36px] px-[12px] rounded-[6px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] outline-none focus:border-[var(--accent,#1132ee)] bg-white transition-colors";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 bottom-0 w-[640px] z-50 bg-white flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollable px-[24px] py-[24px]">

          {/* Header row */}
          <div className="flex items-start justify-between mb-[24px]">
            <h2 className="text-[20px] font-bold leading-[1.2] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFamily: "Lato, sans-serif" }}>
              {isCreate ? "Create Macro" : macro!.name}
            </h2>
            <button
              onClick={onClose}
              className="flex items-center gap-[4px] h-[28px] px-[8px] rounded-[6px] text-[13px] font-bold text-[var(--foreground-secondary,#666)] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors outline-none shrink-0 ml-[16px] mt-[2px]"
              style={{ fontFamily: "Lato, sans-serif" }}
            >
              <Icon name="close" size={16} />
              Close
            </button>
          </div>

          {/* ── Assign to Template ── */}
          <div className="mb-[24px]">
            <p className={fieldLabel} style={{ fontFeatureSettings: "'ss07' 1" }}>Assign to Template</p>
            <p className={fieldHint}>Select which template and section this macro should be inserted</p>

            <div className="flex items-center gap-[8px] mb-[4px]">
              {/* Template dropdown */}
              <div className="relative flex-1">
                <button
                  onClick={() => { setTemplateOpen(o => !o); setSectionOpen(false); if (errors.template) setErrors(e => ({ ...e, template: false })); }}
                  className={`flex items-center justify-between w-full h-[36px] px-[12px] rounded-[6px] border bg-white text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] hover:border-[var(--foreground-secondary,#666)] outline-none transition-colors ${errors.template ? "border-[var(--foreground-semantic-danger,#bb1411)]" : "border-[var(--shape-outline,rgba(0,0,0,0.1))]"}`}
                  style={{ fontFamily: "Lato, sans-serif" }}
                >
                  <span className={template ? "" : "text-[var(--foreground-tertiary,#808080)]"}>{template || "Select Template"}</span>
                  <Icon name={templateOpen ? "arrow_drop_up" : "arrow_drop_down"} size={20} className="text-[var(--foreground-secondary,#666)] shrink-0" />
                </button>
                {templateOpen && (
                  <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setTemplateOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[70] py-[4px]">
                      {TEMPLATES.map((t) => (
                        <button key={t} onClick={() => { setTemplate(t); setSection(TEMPLATE_SECTIONS[t][0]); setTemplateOpen(false); }}
                          className={`flex items-center w-full px-[12px] py-[9px] text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] transition-colors ${template === t ? "bg-[var(--litmus-25,#f1f3fe)] font-bold" : "hover:bg-[var(--surface-1,#f7f7f7)]"}`}
                          style={{ fontFamily: "Lato, sans-serif" }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Section dropdown */}
              <div className="relative flex-1">
                <button
                  onClick={() => { setSectionOpen(o => !o); setTemplateOpen(false); if (errors.template) setErrors(e => ({ ...e, template: false })); }}
                  className={`flex items-center justify-between w-full h-[36px] px-[12px] rounded-[6px] border bg-white text-[13px] font-normal hover:border-[var(--foreground-secondary,#666)] outline-none transition-colors ${errors.template ? "border-[var(--foreground-semantic-danger,#bb1411)]" : "border-[var(--shape-outline,rgba(0,0,0,0.1))]"}`}
                  style={{ fontFamily: "Lato, sans-serif" }}
                >
                  <span className={section ? "text-[var(--foreground-primary,#1a1a1a)]" : "text-[var(--foreground-tertiary,#808080)]"}>{section || "Select Section"}</span>
                  <Icon name={sectionOpen ? "arrow_drop_up" : "arrow_drop_down"} size={20} className="text-[var(--foreground-secondary,#666)] shrink-0" />
                </button>
                {sectionOpen && (
                  <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setSectionOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[70] py-[4px]">
                      {sections.map((s) => (
                        <button key={s} onClick={() => { setSection(s); setSectionOpen(false); }}
                          className={`flex items-center w-full px-[12px] py-[9px] text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] transition-colors ${section === s ? "bg-[var(--litmus-25,#f1f3fe)] font-bold" : "hover:bg-[var(--surface-1,#f7f7f7)]"}`}
                          style={{ fontFamily: "Lato, sans-serif" }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Remove row */}
              <button className="flex items-center justify-center w-[28px] h-[36px] text-[var(--foreground-secondary,#666)] hover:text-[var(--foreground-primary,#1a1a1a)] transition-colors shrink-0 outline-none">
                <Icon name="close" size={18} />
              </button>
            </div>

            {errors.template && (
              <p className="text-[12px] font-normal text-[var(--foreground-semantic-danger,#bb1411)] mt-[4px] mb-[4px]" style={{ fontFamily: "Lato, sans-serif" }}>
                At least one template section assignment is required
              </p>
            )}

            <button className="flex items-center gap-[4px] text-[13px] font-bold text-[var(--accent,#1132ee)] hover:opacity-75 transition-opacity outline-none mt-[4px]" style={{ fontFamily: "Lato, sans-serif" }}>
              <Icon name="add" size={14} />
              Add
            </button>
          </div>

          {/* ── Assign to Provider ── */}
          <div className="mb-[24px]">
            <p className={fieldLabel} style={{ fontFeatureSettings: "'ss07' 1" }}>Assign to Provider</p>
            <p className={fieldHint}>Choose which providers can use this macro. Search and select one or more.</p>
            <div className="flex items-center gap-[10px]">
            <div className="relative flex-1">
              <button
                onClick={() => { setProviderDropdownOpen(o => !o); setProviderDropSearch(""); }}
                className="flex items-center justify-between w-full h-[36px] px-[12px] rounded-[6px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] bg-white text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] hover:border-[var(--foreground-secondary,#666)] outline-none transition-colors"
                style={{ fontFamily: "Lato, sans-serif" }}
              >
                <span className={providerDisplayCount === 0 ? "text-[var(--foreground-tertiary,#808080)]" : ""}>
                  {providerDisplayCount === 0
                    ? "Select providers"
                    : `Selected (${providerDisplayCount})`}
                </span>
                <Icon name={providerDropdownOpen ? "arrow_drop_up" : "arrow_drop_down"} size={20} className="text-[var(--foreground-secondary,#666)] shrink-0" />
              </button>

              {providerDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-[80]" onClick={() => { setProviderDropdownOpen(false); setProviderDropSearch(""); }} />
                  <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[90] py-[4px]">
                    {/* Search */}
                    <div className="px-[8px] pt-[4px] pb-[4px]">
                      <div className="relative flex items-center">
                        <span className="absolute left-[8px] text-[var(--foreground-secondary,#666)] pointer-events-none flex items-center">
                          <Icon name="search" size={14} />
                        </span>
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search providers"
                          value={providerDropSearch}
                          onChange={(e) => setProviderDropSearch(e.target.value)}
                          className="w-full h-[28px] pl-[28px] pr-[8px] rounded-[4px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[var(--foreground-tertiary,#808080)] outline-none focus:border-[var(--accent,#1132ee)] bg-white"
                          style={{ fontFamily: "Lato, sans-serif" }}
                        />
                      </div>
                    </div>
                    {/* Provider list with checkboxes */}
                    <div className="max-h-[200px] overflow-y-auto">
                      {filteredDropProviders.length === 0 ? (
                        <p className="px-[12px] py-[8px] text-[13px] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>No providers found</p>
                      ) : (
                        filteredDropProviders.map((u) => {
                          const checked = selectedProviderIds.includes(u.id);
                          return (
                            <button
                              key={u.id}
                              onClick={() => toggleProvider(u.id)}
                              className="flex items-center gap-[10px] w-full px-[12px] py-[7px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors text-left"
                            >
                              <Checkbox state={checked ? "selected" : "unselected"} />
                              <span className="text-[13px] font-normal leading-[1.4] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFamily: "Lato, sans-serif" }}>
                                {u.name}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* Lock/Unlock toggle */}
            <div className="flex items-center gap-[6px] shrink-0">
              <span
                className="text-[13px] font-normal leading-[1.4] text-[var(--foreground-secondary,#666)] w-[56px] text-right"
                style={{ fontFamily: "Lato, sans-serif" }}
              >
                {isLocked ? "Locked" : "Unlocked"}
              </span>
              <Switch checked={isLocked} onChange={setIsLocked} size="XS" />
            </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-[var(--shape-outline,rgba(0,0,0,0.1))] mb-[20px]" />

          {/* Macro Detail heading */}
          <p className="text-[15px] font-bold leading-[1.2] tracking-[0.15px] text-[var(--foreground-primary,#1a1a1a)] mb-[20px]" style={{ fontFeatureSettings: "'ss07' 1" }}>Macro Detail</p>

          {/* Macro Name + toggle */}
          <div className="mb-[24px]">
            <p className={fieldLabel} style={{ fontFeatureSettings: "'ss07' 1" }}>
              Macro Name <span className="font-normal text-[var(--foreground-secondary,#666)]">(Required)</span>
            </p>
            <p className={fieldHint}>A name to help you identify your macros.</p>
            <div className="flex items-center gap-[12px]">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={macroName}
                  onChange={(e) => { setMacroName(e.target.value); if (errors.macroName) setErrors(er => ({ ...er, macroName: false })); }}
                  placeholder={isCreate ? "Enter macro name" : ""}
                  className={`w-full h-[36px] px-[12px] ${errors.macroName ? "pr-[36px]" : ""} rounded-[6px] border text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[var(--foreground-tertiary,#808080)] outline-none bg-white transition-colors ${errors.macroName ? "border-[var(--foreground-semantic-danger,#bb1411)] focus:border-[var(--foreground-semantic-danger,#bb1411)]" : "border-[var(--shape-outline,rgba(0,0,0,0.1))] focus:border-[var(--accent,#1132ee)]"}`}
                  style={{ fontFamily: "Lato, sans-serif" }}
                />
                {errors.macroName && (
                  <span className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[var(--foreground-semantic-danger,#bb1411)] flex items-center">
                    <Icon name="error" size={16} filled />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-[8px] shrink-0">
                <span className="inline-block w-[52px] text-right text-[13px] font-normal leading-[1.4] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>
                  {isActive ? "Active" : "Disabled"}
                </span>
                <Switch checked={isActive} onChange={setIsActive} size="XS" />
              </div>
            </div>
            {errors.macroName && (
              <p className="text-[12px] font-normal text-[var(--foreground-semantic-danger,#bb1411)] mt-[4px]" style={{ fontFamily: "Lato, sans-serif" }}>
                Macro name is required
              </p>
            )}
          </div>

          {/* Macro Content */}
          <div className="mb-[24px]">
            <p className={fieldLabel} style={{ fontFeatureSettings: "'ss07' 1" }}>
              Macro Content <span className="font-normal text-[var(--foreground-secondary,#666)]">(Required)</span>
            </p>
            <p className={fieldHint}>Type your macro text and use "/" to insert dynamic placeholders. The AI will update the content in placeholders based on your patient conversation.</p>
            <div className={`w-full rounded-[6px] border overflow-hidden transition-colors ${errors.macroContent ? "border-[var(--foreground-semantic-danger,#bb1411)]" : "border-[var(--shape-outline,rgba(0,0,0,0.1))]"}`}>
              <textarea
                value={macroContent}
                onChange={(e) => { setMacroContent(e.target.value); setContentUserEdited(true); setContentAiDismissed(false); if (errors.macroContent) setErrors(er => ({ ...er, macroContent: false })); }}
                placeholder={isCreate ? "Type your macros content here. Use \"/\" to add placeholders." : ""}
                rows={6}
                className="w-full px-[12px] py-[10px] text-[13px] font-normal leading-[1.6] text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[var(--foreground-tertiary,#808080)] outline-none bg-white resize-none border-0 focus:ring-0"
                style={{ fontFamily: "Lato, sans-serif" }}
              />
              {showContentAi && (
                <div className="bg-[var(--litmus-25,#f1f3fe)] flex items-center gap-[8px] px-[12px] py-[8px] border-t border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                  <p className="flex-1 text-[13px] font-normal leading-[1.4] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFamily: "Lato, sans-serif" }}>
                    Convert plain text to macro placeholders with one click
                  </p>
                  <Button variant="primary" size="small" prefix={<MagicButton size={14} />} className="!bg-[var(--accent,#1132ee)] hover:!bg-[#0e29cc]">Generate</Button>
                </div>
              )}
            </div>
            {errors.macroContent && (
              <p className="text-[12px] font-normal text-[var(--foreground-semantic-danger,#bb1411)] mt-[4px]" style={{ fontFamily: "Lato, sans-serif" }}>
                Macro content is required
              </p>
            )}
          </div>

          {/* Selection Criteria */}
          <div className="mb-[24px]">
            <p className={fieldLabel} style={{ fontFeatureSettings: "'ss07' 1" }}>
              Selection Criteria <span className="font-normal text-[var(--foreground-secondary,#666)]">(Required)</span>
            </p>
            <p className={fieldHint}>Tell our AI under what condition this macro should be used.</p>
            <div className={`w-full rounded-[6px] border overflow-hidden transition-colors ${errors.selectionCriteria ? "border-[var(--foreground-semantic-danger,#bb1411)]" : "border-[var(--shape-outline,rgba(0,0,0,0.1))]"}`}>
              <textarea
                value={selectionCriteria}
                onChange={(e) => { setSelectionCriteria(e.target.value); setCriteriaUserEdited(true); setCriteriaAiDismissed(false); if (errors.selectionCriteria) setErrors(er => ({ ...er, selectionCriteria: false })); }}
                placeholder={isCreate ? "Describe when this macro should be used. For example: \"Use this macro when I say 'annual exam' for an adult patient.\"" : ""}
                rows={3}
                className="w-full px-[12px] py-[10px] text-[13px] font-normal leading-[1.6] text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[var(--foreground-tertiary,#808080)] outline-none bg-white resize-none border-0 focus:ring-0"
                style={{ fontFamily: "Lato, sans-serif" }}
              />
              {criteriaAiState !== "none" && (
                <div className="bg-[var(--litmus-25,#f1f3fe)] flex flex-col gap-[8px] px-[12px] py-[10px] border-t border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                  {/* AI Suggestion header */}
                  <div className="flex items-center gap-[6px]">
                    <MagicButton size={14} />
                    <span className="text-[12px] font-bold leading-[1.2] tracking-[0.24px] text-[var(--accent,#1132ee)]" style={{ fontFamily: "Lato, sans-serif" }}>
                      AI Suggestion
                    </span>
                  </div>
                  {/* Message */}
                  <p className="text-[13px] font-normal leading-[1.4] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFamily: "Lato, sans-serif" }}>
                    {criteriaAiState === "not-enough"
                      ? "Not enough information provided."
                      : criteriaSuggestion
                    }
                  </p>
                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-[8px]">
                    <Button variant="secondary" size="small" onClick={() => setCriteriaAiDismissed(true)}>Dismiss</Button>
                    {criteriaAiState === "enough" && (
                      <Button variant="primary" size="small" onClick={() => { setSelectionCriteria(criteriaSuggestion); setCriteriaAiDismissed(true); }}>Apply</Button>
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.selectionCriteria && (
              <p className="text-[12px] font-normal text-[var(--foreground-semantic-danger,#bb1411)] mt-[4px]" style={{ fontFamily: "Lato, sans-serif" }}>
                Selection criteria is required
              </p>
            )}
          </div>

          {/* Additional Settings */}
          <div className="rounded-[8px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] overflow-hidden">
            <button
              onClick={() => setAdditionalOpen(o => !o)}
              className="flex items-center justify-between w-full px-[16px] py-[12px] bg-[var(--surface-1,#f7f7f7)] hover:bg-[rgba(0,0,0,0.04)] transition-colors outline-none"
              style={{ fontFamily: "Lato, sans-serif" }}
            >
              <span className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFeatureSettings: "'ss07' 1" }}>
                Additional Settings
              </span>
              <Icon name={additionalOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={18} className="text-[var(--foreground-secondary,#666)]" />
            </button>
            {additionalOpen && (
              <div className="px-[16px] py-[16px] flex flex-col gap-[16px]">
                <p className="text-[13px] font-normal leading-[1.4] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>
                  No additional settings configured for this macro.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Sticky footer */}
        <div className="flex items-center justify-between px-[24px] py-[14px] border-t border-[var(--shape-outline,rgba(0,0,0,0.1))] shrink-0 bg-white">
          {isCreate ? (
            <div />
          ) : (
            <button
              className="flex items-center gap-[6px] h-[36px] px-[12px] rounded-[6px] text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-semantic-danger,#bb1411)] hover:bg-[rgba(187,20,17,0.06)] transition-colors outline-none"
              style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07' 1" }}
            >
              <Icon name="delete" size={16} />
              Delete
            </button>
          )}
          <div className="flex items-center gap-[8px]">
            <Button variant="tertiary" size="medium" onClick={onClose}>Cancel</Button>
            {isCreate ? (
              <Button variant="primary" size="medium" prefix={<Icon name="check" size={16} />} onClick={handleCreate}>
                Create
              </Button>
            ) : (
              <Button variant="primary" size="medium" onClick={handleSave}>Save</Button>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

// ─── Bulk Upload Modal ────────────────────────────────────────────────────────

type BulkUploadModalProps = {
  onClose: () => void;
  onImport: (macros: Macro[]) => void;
};

function BulkUploadModal({ onClose, onImport }: BulkUploadModalProps) {
  const [visible, setVisible]   = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile]     = useState<File | null>(null);
  const [parsedMacros, setParsedMacros]     = useState<Macro[]>([]);
  const [parseError, setParseError]         = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  // ── CSV line splitter (handles quoted fields) ──
  function splitCSVLine(line: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === ',' && !inQuotes) {
        result.push(cur); cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur);
    return result;
  }

  // ── Resolve providers string → ids + count ──
  function resolveProviders(provStr: string): { assignedUserIds: string[]; allProviders: boolean; providerCount: number } {
    const s = provStr.trim();
    if (s.toLowerCase() === "all") {
      return { assignedUserIds: ALL_USER_IDS, allProviders: true, providerCount: mockUsers.length };
    }
    const names = s.split(";").map(n => n.trim()).filter(Boolean);
    const ids: string[] = [];
    for (const n of names) {
      const user = mockUsers.find(u => u.name.toLowerCase() === n.toLowerCase());
      if (user) ids.push(user.id);
    }
    return { assignedUserIds: ids, allProviders: false, providerCount: ids.length };
  }

  // ── Build a Macro from raw field strings ──
  function buildMacro(fields: Record<string, string>): Macro {
    const { name, assignedTo, source, providers, providerAccess } = fields;
    const src = (["Ambient", "Athena", "Admin"].includes(source?.trim() ?? "")
      ? source.trim()
      : "Admin") as "Ambient" | "Athena" | "Admin";
    const { assignedUserIds, allProviders, providerCount } = resolveProviders(providers ?? "");
    return {
      id: `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name?.trim() || "Unnamed Macro",
      source: src,
      assignedTo: assignedTo?.trim() || "",
      status: "Incomplete",
      providers: providerCount,
      allProviders,
      providerAccess: providerAccess?.trim().toLowerCase() === "locked" ? "locked" : "unlocked",
      assignedUserIds,
    };
  }

  // ── Parse CSV ──
  function parseCSVContent(content: string): Macro[] {
    const lines = content.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    return lines.slice(1).map(line => {
      const [name, assignedTo, source, providers, providerAccess] = splitCSVLine(line);
      return buildMacro({ name, assignedTo, source, providers, providerAccess });
    }).filter(m => m.name !== "Unnamed Macro" || lines.length > 1);
  }

  // ── Parse XML ──
  function parseXMLContent(content: string): Macro[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "application/xml");
    if (doc.querySelector("parsererror")) throw new Error("Invalid XML");
    const macros: Macro[] = [];
    doc.querySelectorAll("macro").forEach(el => {
      const get = (tag: string) => el.querySelector(tag)?.textContent?.trim() ?? "";
      macros.push(buildMacro({
        name: get("name"), assignedTo: get("assignedTo"),
        source: get("source"), providers: get("providers"),
        providerAccess: get("providerAccess"),
      }));
    });
    return macros;
  }

  // ── Handle file selection ──
  function handleFile(file: File) {
    setUploadedFile(file);
    setParseError("");
    setParsedMacros([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const macros = file.name.endsWith(".csv") ? parseCSVContent(content) : parseXMLContent(content);
        if (macros.length === 0) {
          setParseError("No macros found. Make sure the file follows the template format.");
        } else {
          setParsedMacros(macros);
        }
      } catch {
        setParseError("Could not parse the file. Make sure it follows the template format.");
      }
    };
    reader.readAsText(file);
  }

  // ── Download template (CSV) ──
  function downloadTemplate() {
    const rows = [
      ["Macro Name", "Assigned To", "Source", "Providers", "Provider Access", "Selection Criteria", "Macro Content"],
      ["Normal Physical Exam", "SOAP: Objective", "Admin", "All", "unlocked", "Apply for comprehensive physical exams.", "General: Patient appears well-developed, well-nourished..."],
      ["Chest Pain ROS", "SOAP: Subjective", "Admin", "Vinay Kapadia; Harrison Rolins", "locked", "Use for chest pain workup.", "Cardiovascular: Reports chest pain..."],
    ];
    const csv = rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "macro-template.csv";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-[24px]">
        <div
          className="bg-white rounded-[12px] w-full max-w-[520px] shadow-[0_8px_40px_rgba(0,0,0,0.16)] transition-all duration-200"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.97)" }}
        >

          {/* Header */}
          <div className="flex items-start justify-between px-[24px] pt-[24px] pb-[6px]">
            <div>
              <h2 className="text-[17px] font-bold leading-[1.2] tracking-[0.34px] text-[var(--foreground-primary,#1a1a1a)] mb-[6px]" style={{ fontFamily: "Lato, sans-serif" }}>
                Import Macros
              </h2>
              <p className="text-[13px] font-normal leading-[1.4] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>
                Download a pre-formatted template to fill in, or upload a completed macro file to import directly.
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-[36px] h-[36px] rounded-[6px] text-[var(--foreground-secondary,#666)] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors outline-none shrink-0 ml-[16px]"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          <div className="px-[24px] pt-[20px] pb-[0px] flex flex-col gap-[16px]">

            {/* Upload zone — top, no title */}
            {!uploadedFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault(); setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file && (file.name.endsWith(".csv") || file.name.endsWith(".xml"))) {
                    handleFile(file);
                  } else {
                    setParseError("Only .csv and .xml files are supported.");
                    setUploadedFile(file);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-[10px] w-full py-[36px] px-[24px] rounded-[10px] border-2 border-dashed cursor-pointer transition-colors ${
                  dragOver
                    ? "border-[var(--accent,#1132ee)] bg-[var(--litmus-50,#e3e8fd)]"
                    : "border-[var(--litmus-100,#cfd6fc)] bg-[var(--litmus-25,#f1f3fe)] hover:border-[var(--accent,#1132ee)]"
                }`}
              >
                <Icon name="cloud_upload" size={32} className="text-[var(--accent,#1132ee)]" />
                <div className="text-center">
                  <p className="text-[13px] font-bold leading-[1.4] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>
                    Drag and drop your file here, or{" "}
                    <span className="text-[var(--accent,#1132ee)]">Browse</span>
                  </p>
                  <p className="text-[12px] text-[var(--foreground-tertiary,#808080)] mt-[2px]" style={{ fontFamily: "Lato, sans-serif" }}>
                    Accepted: .csv, .xml
                  </p>
                </div>
              </div>
            ) : (
              /* File selected state */
              <div className={`flex items-center gap-[10px] p-[14px] rounded-[10px] border-2 border-dashed ${parseError ? "border-[var(--foreground-semantic-danger,#bb1411)] bg-[#fff8f8]" : "border-[var(--litmus-100,#cfd6fc)] bg-[var(--litmus-25,#f1f3fe)]"}`}>
                <Icon name="description" size={20} className={parseError ? "text-[var(--foreground-semantic-danger,#bb1411)] shrink-0" : "text-[var(--accent,#1132ee)] shrink-0"} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold leading-[1.2] text-[var(--foreground-primary,#1a1a1a)] truncate" style={{ fontFamily: "Lato, sans-serif" }}>
                    {uploadedFile.name}
                  </p>
                  {!parseError && parsedMacros.length > 0 && (
                    <p className="text-[12px] font-normal text-[var(--foreground-secondary,#666)] mt-[2px]" style={{ fontFamily: "Lato, sans-serif" }}>
                      {parsedMacros.length} macro{parsedMacros.length !== 1 ? "s" : ""} ready to import
                    </p>
                  )}
                  {parseError && (
                    <p className="text-[12px] font-normal text-[var(--foreground-semantic-danger,#bb1411)] mt-[2px]" style={{ fontFamily: "Lato, sans-serif" }}>
                      {parseError}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => { setUploadedFile(null); setParsedMacros([]); setParseError(""); }}
                  className="flex items-center justify-center w-[24px] h-[24px] rounded-[4px] text-[var(--foreground-secondary,#666)] hover:bg-[rgba(0,0,0,0.06)] transition-colors shrink-0 outline-none"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />

            {/* Or divider */}
            <div className="flex items-center gap-[12px]">
              <div className="flex-1 h-px bg-[var(--shape-outline,rgba(0,0,0,0.1))]" />
              <span className="text-[12px] font-bold text-[var(--foreground-tertiary,#808080)]" style={{ fontFamily: "Lato, sans-serif" }}>or</span>
              <div className="flex-1 h-px bg-[var(--shape-outline,rgba(0,0,0,0.1))]" />
            </div>

            {/* Download template — clean row, no card */}
            <div className="flex flex-col gap-[6px] py-[4px]">
              <p className="text-[13px] font-bold leading-[1.2] tracking-[0.13px] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07' 1" }}>
                Download Template
              </p>
              <div className="flex items-center justify-between gap-[12px]">
                <p className="text-[12px] font-normal leading-[1.4] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>
                  Pre-formatted .csv with all required columns and sample rows
                </p>
                <Button variant="tertiary" size="small" prefix={<Icon name="download" size={14} />} onClick={downloadTemplate}>
                  Download
                </Button>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-[8px] px-[24px] py-[16px] mt-[20px] border-t border-[var(--shape-outline,rgba(0,0,0,0.1))]">
            <Button variant="secondary" size="medium" onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              size="medium"
              onClick={() => { if (parsedMacros.length > 0) { onImport(parsedMacros); onClose(); } }}
              className={parsedMacros.length === 0 ? "opacity-40 cursor-not-allowed" : ""}
            >
              {parsedMacros.length > 0
                ? `Import ${parsedMacros.length} Macro${parsedMacros.length !== 1 ? "s" : ""}`
                : "Import"}
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}

function SiteMacros() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<User | null>(null);
  const [providerSearch, setProviderSearch] = useState("");
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [editingMacro, setEditingMacro] = useState<Macro | null>(null);
  const [creatingMacro, setCreatingMacro] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [macros, setMacros] = useState<Macro[]>(mockMacros);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [sortKey, setSortKey] = useState<string>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: string) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  const filteredProviders = mockUsers.filter((u) =>
    u.name.toLowerCase().includes(providerSearch.toLowerCase())
  );

  const filtered = macros
    .filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.source.toLowerCase().includes(search.toLowerCase());
      const matchesProvider =
        selectedProvider === null || m.assignedUserIds.includes(selectedProvider.id);
      return matchesSearch && matchesProvider;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name")           cmp = a.name.localeCompare(b.name);
      if (sortKey === "assignedTo")     cmp = a.assignedTo.localeCompare(b.assignedTo);
      if (sortKey === "source")         cmp = a.source.localeCompare(b.source);
      if (sortKey === "providers")      cmp = a.providers - b.providers;
      if (sortKey === "providerAccess") cmp = a.providerAccess.localeCompare(b.providerAccess);
      if (sortKey === "status")         cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });

  return (
    <div className="flex flex-col flex-1 min-h-0 px-[32px] py-[24px] overflow-y-auto scrollable">
      {/* Page title */}
      <h1 className="text-[24px] font-bold leading-[1.2] tracking-[0px] text-[var(--foreground-primary,#1a1a1a)] mb-[24px]">
        Site Macros
      </h1>

      {/* Toolbar */}
      <div className="flex items-center gap-[12px] mb-[16px]">
        {/* Macro search */}
        <div className="relative flex items-center w-[240px]">
          <span className="absolute left-[10px] text-[var(--foreground-secondary,#666)] flex items-center pointer-events-none">
            <Icon name="search" size={16} />
          </span>
          <input
            type="text"
            placeholder="Search macros"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-[36px] pl-[34px] pr-[12px] rounded-[6px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[var(--foreground-tertiary,#808080)] outline-none focus:border-[var(--accent,#1132ee)] bg-white"
            style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07' 1" }}
          />
        </div>

        {/* Provider filter button */}
        <div className="relative">
          <button
            onClick={() => setProviderDropdownOpen((o) => !o)}
            className={`flex items-center gap-[6px] h-[28px] px-[8px] rounded-[6px] text-[13px] font-bold leading-[1.2] tracking-[0.13px] transition-colors outline-none
              ${selectedProvider
                ? "border border-[var(--accent,#1132ee)] bg-[var(--litmus-25,#f1f3fe)] text-[var(--accent,#1132ee)]"
                : "text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)]"}`}
            style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07' 1" }}
          >
            <Icon name="person" size={16} />
            {selectedProvider ? selectedProvider.name : "All Providers"}
            {selectedProvider ? (
              <span
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setSelectedProvider(null); setProviderSearch(""); setPage(1); }}
                className="flex items-center justify-center w-[14px] h-[14px] rounded-full hover:bg-[var(--litmus-100,#cfd6fc)] transition-colors"
              >
                <Icon name="close" size={12} />
              </span>
            ) : (
              <Icon name="arrow_drop_down" size={16} />
            )}
          </button>

          {providerDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => { setProviderDropdownOpen(false); setProviderSearch(""); }} />
              <div className="absolute top-full left-0 mt-[4px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-50 w-[240px] py-[4px]">
              {/* Search inside dropdown */}
              <div className="px-[8px] pt-[4px] pb-[6px]">
                <div className="relative flex items-center">
                  <span className="absolute left-[8px] text-[var(--foreground-secondary,#666)] pointer-events-none flex items-center">
                    <Icon name="search" size={14} />
                  </span>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search providers"
                    value={providerSearch}
                    onChange={(e) => setProviderSearch(e.target.value)}
                    className="w-full h-[28px] pl-[28px] pr-[8px] rounded-[4px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[var(--foreground-tertiary,#808080)] outline-none focus:border-[var(--accent,#1132ee)] bg-white"
                    style={{ fontFamily: "Lato, sans-serif" }}
                  />
                </div>
              </div>
              {/* Provider list */}
              <div className="max-h-[200px] overflow-y-auto">
                {filteredProviders.length === 0 ? (
                  <p className="px-[12px] py-[8px] text-[13px] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>
                    No providers found
                  </p>
                ) : (
                  filteredProviders.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { setSelectedProvider(u); setProviderSearch(""); setProviderDropdownOpen(false); setPage(1); }}
                      className={`flex items-center gap-[8px] w-full px-[12px] py-[7px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors ${selectedProvider?.id === u.id ? "bg-[var(--litmus-25,#f1f3fe)]" : ""}`}
                    >
                      <span className={`text-[13px] leading-[1.4] whitespace-nowrap flex-1 text-left ${selectedProvider?.id === u.id ? "font-bold text-[var(--accent,#1132ee)]" : "font-normal text-[var(--foreground-primary,#1a1a1a)]"}`} style={{ fontFamily: "Lato, sans-serif" }}>
                        {u.name}
                      </span>
                      {selectedProvider?.id === u.id && <Icon name="check" size={14} className="text-[var(--accent,#1132ee)]" />}
                    </button>
                  ))
                )}
              </div>
            </div>
            </>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Create Macro */}
        <Button
          variant="primary"
          size="medium"
          prefix={<Icon name="add" size={16} />}
          onClick={() => setCreatingMacro(true)}
        >
          Create Macro
        </Button>

        {/* Import Macros */}
        <Button
          variant="secondary"
          size="medium"
          prefix={<Icon name="upload" size={16} />}
          onClick={() => setBulkUploading(true)}
        >
          Import Macros
        </Button>
      </div>

      {/* Table */}
      <div className="flex flex-col">
        <table className="border-separate border-spacing-0">
          <thead>
            <tr>
              <SortableHeader label="Macro Name"  sortKey="name"           activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Assigned To" sortKey="assignedTo"     activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Source"      sortKey="source"         activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Providers"   sortKey="providers"      activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
              <SortableHeader label="Access"      sortKey="providerAccess" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Status"      sortKey="status"         activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <th className="bg-[var(--surface-1,#f7f7f7)] last:rounded-tr-[6px] last:rounded-br-[6px] w-[1px]" />
            </tr>
          </thead>
          <tbody>
            {filtered.slice((page - 1) * pageSize, page * pageSize).map((macro) => (
              <tr
                key={macro.id}
                className="group hover:bg-[var(--surface-1,#f7f7f7)] cursor-pointer transition-colors"
                onClick={() => setEditingMacro(macro)}
              >
                <td className="px-[16px] py-[10px] text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] border-b group-last:border-b-0 border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                  {macro.name}
                </td>
                <td className="px-[16px] py-[10px] text-[13px] leading-[1.4] tracking-[0.065px] whitespace-nowrap border-b group-last:border-b-0 border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                  {macro.assignedTo
                    ? <span className="font-normal text-[var(--foreground-primary,#1a1a1a)]">{macro.assignedTo}</span>
                    : <span className="italic font-normal text-[#999999]">Unassigned</span>
                  }
                </td>
                <td className="px-[16px] py-[10px] text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap border-b group-last:border-b-0 border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                  {macro.source}
                </td>
                <td className="px-[16px] py-[10px] text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap text-right border-b group-last:border-b-0 border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                  {(() => {
                    if (selectedProvider) return selectedProvider.name;
                    if (macro.allProviders) return `${macro.providers.toLocaleString()} (All)`;
                    if (macro.assignedUserIds.length === 1) {
                      const u = mockUsers.find(u => u.id === macro.assignedUserIds[0]);
                      return u ? u.name : macro.providers.toLocaleString();
                    }
                    return macro.providers.toLocaleString();
                  })()}
                </td>
                <td className="px-[16px] py-[10px] whitespace-nowrap border-b group-last:border-b-0 border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                  {macro.providerAccess === "unlocked"
                    ? <Icon name="lock_open" size={16} className="text-[var(--foreground-secondary,#666)]" />
                    : <Icon name="lock" size={16} filled className="text-[var(--foreground-primary,#1a1a1a)]" />
                  }
                </td>
                <td className="px-[16px] py-[10px] whitespace-nowrap border-b group-last:border-b-0 border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                  {macro.status === "Complete" ? (
                    <span className="inline-flex items-center px-[8px] py-[4px] rounded-[6px] text-[12px] font-bold leading-[1.2] tracking-[0.24px] bg-[var(--green-50,#edf7ee)] text-[var(--foreground-semantic-success,#3f8d43)]">
                      Complete
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-[8px] py-[4px] rounded-[6px] text-[12px] font-bold leading-[1.2] tracking-[0.24px] bg-[#fff5e5] text-[#995c00]">
                      Incomplete
                    </span>
                  )}
                </td>
                <td className="px-[8px] py-[6px] whitespace-nowrap border-b group-last:border-b-0 border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                  <IconButton
                    variant="tertiary-neutral"
                    size="small"
                    aria-label="Edit macro"
                    icon={<Icon name="edit" size={16} />}
                    onClick={(e) => { e.stopPropagation(); setEditingMacro(macro); }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Upload modal */}
      {bulkUploading && (
        <BulkUploadModal
          onClose={() => setBulkUploading(false)}
          onImport={(imported) => setMacros(prev => [...imported, ...prev])}
        />
      )}

      {/* Edit drawer */}
      {editingMacro && (
        <MacroEditDrawer
          macro={editingMacro}
          onClose={() => setEditingMacro(null)}
          onSave={(updated) => { setMacros(prev => prev.map(m => m.id === updated.id ? updated : m)); setEditingMacro(null); }}
        />
      )}

      {/* Create drawer */}
      {creatingMacro && (
        <MacroEditDrawer
          onClose={() => setCreatingMacro(false)}
          onCreate={(m) => { setMacros(prev => [m, ...prev]); setCreatingMacro(false); }}
        />
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-[12px] shrink-0">
        <div className="flex items-center gap-[8px]">
          <span
            className="text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-secondary,#666)]"
            style={{ fontFeatureSettings: "'ss07' 1" }}
          >
            {filtered.length.toLocaleString()} macros
          </span>
          <div className="relative">
            <button
              onClick={() => setPageSizeOpen(o => !o)}
              className="flex items-center gap-[4px] h-[28px] px-[8px] rounded-[6px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors outline-none"
              style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07' 1" }}
            >
              {pageSize}/Page
              <Icon name="arrow_drop_down" size={16} />
            </button>
            {pageSizeOpen && (
              <>
                <div className="fixed inset-0 z-[30]" onClick={() => setPageSizeOpen(false)} />
                <div className="absolute bottom-full left-0 mb-[4px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[40] py-[4px] min-w-[100px]">
                  {PAGE_SIZE_OPTIONS.map(n => (
                    <button key={n} onClick={() => { setPageSize(n); setPage(1); setPageSizeOpen(false); }}
                      className={`flex items-center w-full px-[12px] py-[7px] text-[13px] font-normal transition-colors ${pageSize === n ? "bg-[var(--litmus-25,#f1f3fe)] font-bold text-[var(--foreground-primary,#1a1a1a)]" : "text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)]"}`}
                      style={{ fontFamily: "Lato, sans-serif" }}
                    >
                      {n}/Page
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-[8px]">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center justify-center w-[28px] h-[28px] rounded-[6px] text-[var(--foreground-secondary,#666)] hover:bg-[var(--surface-1,#f7f7f7)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors outline-none"
          >
            <Icon name="chevron_left" size={18} />
          </button>
          <span
            className="text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-primary,#1a1a1a)]"
            style={{ fontFeatureSettings: "'ss07' 1" }}
          >
            Page {page}/{Math.max(1, Math.ceil(filtered.length / pageSize))}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(Math.max(1, Math.ceil(filtered.length / pageSize)), p + 1))}
            disabled={page === Math.max(1, Math.ceil(filtered.length / pageSize))}
            className="flex items-center justify-center w-[28px] h-[28px] rounded-[6px] text-[var(--foreground-secondary,#666)] hover:bg-[var(--surface-1,#f7f7f7)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors outline-none"
          >
            <Icon name="chevron_right" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex-1 flex items-center justify-center text-[var(--foreground-tertiary,#808080)] text-[15px]">
      {label} — coming soon
    </div>
  );
}

function Analytics() {
  return <Placeholder label="Analytics" />;
}

function TemplateManager() {
  return <Placeholder label="Template Manager" />;
}

// ─── Nav item ─────────────────────────────────────────────────────────────────

type AdminNavItemProps = {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function AdminNavItem({ icon, label, isActive, onClick }: AdminNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-[8px] w-full py-[12px] pl-[12px] pr-[8px] text-[13px] font-bold leading-[1.2] tracking-[0.13px] transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--litmus-100,#cfd6fc)] relative
        ${isActive
          ? "bg-[var(--litmus-25,#f1f3fe)]"
          : "hover:bg-[var(--surface-1,#f7f7f7)]"
        }`}
      style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07' 1" }}
    >
      {/* Active right border */}
      {isActive && (
        <span className="absolute right-0 top-0 bottom-0 w-[2px] bg-[var(--accent,#1132ee)] rounded-l-[2px]" />
      )}
      {/* Icon — always accent blue */}
      <span className="flex items-center shrink-0 text-[var(--accent,#1132ee)]">{icon}</span>
      {/* Label — always black */}
      <span className="text-[var(--foreground-primary,#1a1a1a)]">{label}</span>
    </button>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

type Props = {
  onNavClick: (id: string) => void;
};

export default function AdminPage({ onNavClick }: Props) {
  const [activeSection, setActiveSection] = useState<AdminSection>("user-management");

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* Primary Nav */}
      <PrimaryNav activeItem="admin" onItemClick={onNavClick} logo={<CommureLogo size={28} />} />

      {/* Admin secondary nav */}
      <div className="flex flex-col w-[240px] border-r border-[var(--shape-outline,rgba(0,0,0,0.1))] shrink-0 bg-white">
        <div className="flex items-center h-[48px] px-[16px] shrink-0">
          <h2
            className="text-[17px] font-bold leading-[1.2] tracking-[0.34px] text-[var(--foreground-primary,#1a1a1a)]"
            style={{ fontFeatureSettings: "'ss07' 1" }}
          >
            Admin
          </h2>
        </div>
        <div className="flex flex-col w-full">
          <AdminNavItem
            icon={<Icon name="bar_chart" size={20} filled />}
            label="Analytics"
            isActive={activeSection === "analytics"}
            onClick={() => setActiveSection("analytics")}
          />
          <AdminNavItem
            icon={<Icon name="supervised_user_circle" size={20} filled />}
            label="User Management"
            isActive={activeSection === "user-management"}
            onClick={() => setActiveSection("user-management")}
          />
          <AdminNavItem
            icon={<Icon name="dashboard" size={20} filled />}
            label="Template Manager"
            isActive={activeSection === "template-manager"}
            onClick={() => setActiveSection("template-manager")}
          />
          <AdminNavItem
            icon={<Icon name="book_4" size={20} filled />}
            label="Site Dictionary"
            isActive={activeSection === "site-dictionary"}
            onClick={() => setActiveSection("site-dictionary")}
          />
          <AdminNavItem
            icon={<Icon name="note_stack" size={20} filled />}
            label="Site Macros"
            isActive={activeSection === "macros-library"}
            onClick={() => setActiveSection("macros-library")}
          />
          <AdminNavItem
            icon={<Icon name="passkey" size={20} filled />}
            label="Single Sign-On"
            isActive={activeSection === "single-sign-on"}
            onClick={() => setActiveSection("single-sign-on")}
          />
          <AdminNavItem
            icon={<Icon name="thumbs_up_down" size={20} filled />}
            label="Feedback Insights"
            isActive={activeSection === "feedback-insights"}
            onClick={() => setActiveSection("feedback-insights")}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {activeSection === "analytics"         && <Analytics />}
        {activeSection === "user-management"   && <UserManagement />}
        {activeSection === "template-manager"  && <TemplateManager />}
        {activeSection === "site-dictionary"   && <Placeholder label="Site Dictionary" />}
        {activeSection === "macros-library"    && <SiteMacros />}
        {activeSection === "single-sign-on"    && <Placeholder label="Single Sign-On" />}
        {activeSection === "feedback-insights" && <Placeholder label="Feedback Insights" />}
      </div>

    </div>
  );
}
