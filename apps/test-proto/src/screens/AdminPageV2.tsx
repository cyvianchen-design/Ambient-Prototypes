import React, { useState, useEffect, useRef } from "react";
import { PrimaryNav, Button, Icon, IconButton, Switch, TextField, MagicButton, Checkbox } from "@ds/ui";
import { CommureLogo } from "../components/CommureLogo";
import { uploadStore } from "../uploadStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminSection = "analytics" | "user-management" | "template-manager" | "site-dictionary" | "macros-library" | "single-sign-on" | "feedback-insights";

type User = {
  id: string;
  name: string;
  email: string;
  facility: string;
  lastScribe: string;
  role: "Provider" | "Admin" | "Staff";
  providerType?: "MD" | "NP" | "PA" | "DO";
  specialty?: string;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockUsers: User[] = [
  { id: "1",  name: "Vinay Kapadia",        email: "v.kapadia@mountainview.com",        facility: "Mountain View",       lastScribe: "Mar 21st, 2025, 12:00pm", role: "Provider", providerType: "MD", specialty: "Cardiology" },
  { id: "2",  name: "Harrison Rolins",      email: "h.rolins@mountainview.com",         facility: "Mountain View",       lastScribe: "Mar 21st, 2025, 12:00pm", role: "Provider", providerType: "NP", specialty: "Internal Medicine" },
  { id: "3",  name: "Marvin Depas",         email: "m.depas@valleyhospital.com",        facility: "Valley Hospital",     lastScribe: "Mar 21st, 2025, 12:00pm", role: "Provider", providerType: "MD", specialty: "Neurology" },
  { id: "4",  name: "Samyukth Sreenivasan", email: "s.sreenivasan@valleyhospital.com",  facility: "Valley Hospital",     lastScribe: "Mar 21st, 2025, 12:00pm", role: "Provider", providerType: "PA", specialty: "Family Medicine" },
  { id: "5",  name: "Arcot Premkumar",      email: "a.premkumar@citymedical.com",       facility: "City Medical Center", lastScribe: "Mar 21st, 2025, 12:00pm", role: "Provider", providerType: "DO", specialty: "Pediatrics" },
  { id: "6",  name: "Sasi Ghanta",          email: "s.ghanta@citymedical.com",          facility: "City Medical Center", lastScribe: "Mar 20th, 2025, 3:14pm",  role: "Provider", providerType: "MD", specialty: "Internal Medicine" },
  { id: "7",  name: "Logan Henry",          email: "l.henry@mountainview.com",          facility: "Mountain View",       lastScribe: "Mar 20th, 2025, 11:42am", role: "Provider", providerType: "NP", specialty: "Family Medicine" },
  { id: "8",  name: "Deanna Kraemer",       email: "d.kraemer@valleyhospital.com",      facility: "Valley Hospital",     lastScribe: "Mar 19th, 2025, 9:05am",  role: "Provider", providerType: "MD", specialty: "Cardiology" },
  { id: "9",  name: "Danisia Ellin",        email: "d.ellin@mountainview.com",          facility: "Mountain View",       lastScribe: "Mar 19th, 2025, 2:30pm",  role: "Admin" },
  { id: "10", name: "Terry Philips",        email: "t.philips@citymedical.com",         facility: "City Medical Center", lastScribe: "Mar 18th, 2025, 10:00am", role: "Provider", providerType: "PA", specialty: "Neurology" },
  { id: "11", name: "Ashley Garcia",        email: "a.garcia@valleyhospital.com",       facility: "Valley Hospital",     lastScribe: "Mar 18th, 2025, 4:45pm",  role: "Provider", providerType: "MD", specialty: "Pediatrics" },
  { id: "12", name: "Richard Seymore",      email: "r.seymore@citymedical.com",         facility: "City Medical Center", lastScribe: "Mar 17th, 2025, 1:20pm",  role: "Provider", providerType: "DO", specialty: "Family Medicine" },
  { id: "13", name: "James Vetrovs",        email: "j.vetrovs@mountainview.com",        facility: "Mountain View",       lastScribe: "Mar 17th, 2025, 8:55am",  role: "Provider", providerType: "MD", specialty: "Internal Medicine" },
  { id: "14", name: "Danny Rivers",         email: "d.rivers@valleyhospital.com",       facility: "Valley Hospital",     lastScribe: "Mar 16th, 2025, 3:00pm",  role: "Staff" },
  { id: "15", name: "John Doe",             email: "j.doe@citymedical.com",             facility: "City Medical Center", lastScribe: "Mar 16th, 2025, 12:30pm", role: "Provider", providerType: "NP", specialty: "Cardiology" },
];

const PROVIDER_FACILITIES = [...new Set(mockUsers.map(u => u.facility))].sort();
const PROVIDER_TYPES = [...new Set(mockUsers.map(u => u.providerType).filter(Boolean) as string[])].sort();
const PROVIDER_SPECIALTIES = [...new Set(mockUsers.map(u => u.specialty).filter(Boolean) as string[])].sort();

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
  macroType?: "dictation" | "ambient" | "blended";
  triggerName?: string;
  dateAdded: string; // ISO date "YYYY-MM-DD"
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Middle-truncates a filename keeping more of the end so suffixes/extensions stay visible. */
function truncateMiddle(name: string, maxLen = 38): string {
  if (name.length <= maxLen) return name;
  const keep = maxLen - 1; // 1 char for the ellipsis
  const headLen = Math.floor(keep / 4);  // ~1/4 from the start
  const tailLen = keep - headLen;        // ~3/4 from the end
  return name.slice(0, headLen) + "…" + name.slice(name.length - tailLen);
}

const ALL_USER_IDS = mockUsers.map((u) => u.id);

const mockMacros: Macro[] = [
  { id: "t1", name: "Dictation only Macro", source: "Admin", assignedTo: "SOAP: Subjective", status: "Complete", providers: 5, providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5"], macroType: "dictation", triggerName: "dictation test macro", dateAdded: "2026-05-01" },
  { id: "t2", name: "Ambient only Macro",   source: "Admin", assignedTo: "SOAP: Subjective", status: "Complete", providers: 5, providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5"], macroType: "ambient", dateAdded: "2026-04-15" },
  { id: "t3", name: "Blended Macro",         source: "Admin", assignedTo: "SOAP: Subjective", status: "Complete", providers: 5, providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5"], macroType: "blended", triggerName: "blended test macro", dateAdded: "2026-04-01" },
  { id: "1",  name: "Normal Physical Exam",          source: "Ambient", assignedTo: "SOAP: Objective",              status: "Complete",   providers: 250,                                providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5","6","7","8","9","10","11","12"], dateAdded: "2025-11-12" },
  { id: "2",  name: "Chest Pain ROS",                source: "Athena",  assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 312, allProviders: true, providerAccess: "locked",   assignedUserIds: ALL_USER_IDS, dateAdded: "2024-03-08" },
  { id: "3",  name: "Diabetes Follow-up Note",       source: "Admin",   assignedTo: "Progress Note: Patient Name",  status: "Complete",   providers: 60,                                 providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5"], dateAdded: "2025-07-22" },
  { id: "4",  name: "Hypertension Management HPI",   source: "Ambient", assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 100,                                providerAccess: "locked",   assignedUserIds: ["1","2","3","4","5","6","7","8"], dateAdded: "2024-09-15" },
  { id: "5",  name: "Well Child Visit Summary",      source: "Athena",  assignedTo: "",                             status: "Incomplete", providers: 445, allProviders: true, providerAccess: "locked",   assignedUserIds: ALL_USER_IDS, dateAdded: "2023-12-03" },
  { id: "6",  name: "Medication Reconciliation",     source: "Admin",   assignedTo: "SOAP: Assessment",             status: "Complete",   providers: 60,                                 providerAccess: "unlocked", assignedUserIds: ["2","4","6","8","10"], dateAdded: "2025-02-18" },
  { id: "7",  name: "Respiratory Exam Template",     source: "Ambient", assignedTo: "SOAP: Objective",              status: "Complete",   providers: 250,                                providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5","6","7","8","9","10","11","12"], dateAdded: "2024-06-30" },
  { id: "8",  name: "Neurological Exam",             source: "Athena",  assignedTo: "SOAP: Objective",              status: "Complete",   providers: 100,                                providerAccess: "locked",   assignedUserIds: ["3","5","7","9","11","13","15","1"], dateAdded: "2025-08-11" },
  { id: "9",  name: "Abdominal Exam",                source: "Admin",   assignedTo: "Progress Note: Patient Name",  status: "Complete",   providers: 178, allProviders: true, providerAccess: "unlocked", assignedUserIds: ALL_USER_IDS, dateAdded: "2023-08-19" },
  { id: "10", name: "Lower Back Pain Assessment",    source: "Ambient", assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 60,                                 providerAccess: "unlocked", assignedUserIds: ["1","3","5","7","9"], dateAdded: "2024-01-27" },
  { id: "11", name: "Anxiety & Depression Screen",   source: "Athena",  assignedTo: "",                             status: "Incomplete", providers: 250,                                providerAccess: "locked",   assignedUserIds: ["1","2","3","4","5","6","7","8","9","10","11","12"], dateAdded: "2025-04-05" },
  { id: "12", name: "Post-Operative Follow-up",      source: "Admin",   assignedTo: "SOAP: Assessment",             status: "Complete",   providers: 100,                                providerAccess: "locked",   assignedUserIds: ["2","4","6","8","10","12","14"], dateAdded: "2024-11-14" },
  { id: "13", name: "Preventive Care Checklist",     source: "Ambient", assignedTo: "SOAP: Objective",              status: "Complete",   providers: 523, allProviders: true, providerAccess: "unlocked", assignedUserIds: ALL_USER_IDS, dateAdded: "2023-05-21" },
  { id: "14", name: "GERD Assessment Note",          source: "Athena",  assignedTo: "",                             status: "Incomplete", providers: 0,                                  providerAccess: "locked",   assignedUserIds: [], dateAdded: "2025-09-30" },
  { id: "15", name: "Migraine & Headache HPI",       source: "Admin",   assignedTo: "Progress Note: Patient Name",  status: "Complete",   providers: 60,                                 providerAccess: "unlocked", assignedUserIds: ["1","5","9","13","15"], dateAdded: "2024-07-08" },
  { id: "16", name: "Thyroid Dysfunction Note",      source: "Ambient", assignedTo: "SOAP: Assessment",             status: "Complete",   providers: 88,                                 providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5","6","7","8"], dateAdded: "2026-01-17" },
  { id: "17", name: "UTI Assessment",                source: "Athena",  assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 120,                                providerAccess: "locked",   assignedUserIds: ["2","4","6","8","10","12"], dateAdded: "2025-03-25" },
  { id: "18", name: "Asthma Exacerbation HPI",       source: "Admin",   assignedTo: "SOAP: Subjective",             status: "Incomplete", providers: 1,                                  providerAccess: "unlocked", assignedUserIds: ["3"], dateAdded: "2024-04-12" },
  { id: "19", name: "Chronic Kidney Disease Note",   source: "Ambient", assignedTo: "Progress Note: History/Background", status: "Complete", providers: 75,                             providerAccess: "unlocked", assignedUserIds: ["1","3","5","7","9","11"], dateAdded: "2023-10-09" },
  { id: "20", name: "Allergic Rhinitis ROS",         source: "Athena",  assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 200, allProviders: false,           providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5","6","7","8","9","10"], dateAdded: "2025-12-01" },
  { id: "21", name: "Atrial Fibrillation HPI",       source: "Admin",   assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 45,                                 providerAccess: "locked",   assignedUserIds: ["1","2","3","4","5"], dateAdded: "2024-08-23" },
  { id: "22", name: "Obesity Counseling Note",       source: "Ambient", assignedTo: "Progress Note: Plan/Recommendations", status: "Complete", providers: 310, allProviders: true,      providerAccess: "unlocked", assignedUserIds: ALL_USER_IDS, dateAdded: "2023-06-14" },
  { id: "23", name: "Osteoporosis Follow-up",        source: "Athena",  assignedTo: "",                             status: "Incomplete", providers: 0,                                  providerAccess: "unlocked", assignedUserIds: [], dateAdded: "2025-06-07" },
  { id: "24", name: "Wound Care Assessment",         source: "Admin",   assignedTo: "SOAP: Objective",              status: "Complete",   providers: 55,                                 providerAccess: "unlocked", assignedUserIds: ["6","7","8","9","10"], dateAdded: "2024-02-29" },
  { id: "25", name: "Insomnia Evaluation",           source: "Ambient", assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 130,                                providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5","6","7","8","9","10","11","12"], dateAdded: "2026-03-11" },
  { id: "26", name: "Chronic Pain Management",       source: "Athena",  assignedTo: "SOAP: Assessment",             status: "Complete",   providers: 95,                                 providerAccess: "locked",   assignedUserIds: ["3","5","7","9","11","13","15"], dateAdded: "2023-11-28" },
  { id: "27", name: "Smoking Cessation Counseling",  source: "Admin",   assignedTo: "Progress Note: Plan/Recommendations", status: "Incomplete", providers: 1,                          providerAccess: "unlocked", assignedUserIds: ["11"], dateAdded: "2025-01-09" },
  { id: "28", name: "Pediatric Fever Assessment",    source: "Ambient", assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 180,                                providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5","6","7","8","9","10"], dateAdded: "2024-10-18" },
  { id: "29", name: "Syncope Evaluation",            source: "Athena",  assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 70,                                 providerAccess: "locked",   assignedUserIds: ["1","3","5","7","9","11","13"], dateAdded: "2023-03-31" },
  { id: "30", name: "Fall Risk Assessment",          source: "Admin",   assignedTo: "Progress Note: Clinical Observations", status: "Complete", providers: 420, allProviders: true,     providerAccess: "unlocked", assignedUserIds: ALL_USER_IDS, dateAdded: "2025-05-14" },
  { id: "31", name: "Skin Lesion Exam",              source: "Ambient", assignedTo: "SOAP: Objective",              status: "Complete",   providers: 60,                                 providerAccess: "unlocked", assignedUserIds: ["2","4","6","8","10"], dateAdded: "2024-05-06" },
  { id: "32", name: "Erectile Dysfunction Note",     source: "Athena",  assignedTo: "",                             status: "Incomplete", providers: 0,                                  providerAccess: "unlocked", assignedUserIds: [], dateAdded: "2023-09-22" },
  { id: "33", name: "Urinary Incontinence HPI",      source: "Admin",   assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 85,                                 providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5","6","7","8"], dateAdded: "2026-02-03" },
  { id: "34", name: "Shoulder Pain Exam",            source: "Ambient", assignedTo: "SOAP: Objective",              status: "Complete",   providers: 110,                                providerAccess: "locked",   assignedUserIds: ["1","3","5","7","9","11","13","15","2"], dateAdded: "2025-10-28" },
  { id: "35", name: "Hyperlipidemia Follow-up",      source: "Athena",  assignedTo: "SOAP: Assessment",             status: "Complete",   providers: 265,                                providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5","6","7","8","9","10","11","12"], dateAdded: "2024-12-17" },
  { id: "36", name: "Vertigo Assessment",            source: "Admin",   assignedTo: "SOAP: Subjective",             status: "Incomplete", providers: 1,                                  providerAccess: "unlocked", assignedUserIds: ["14"], dateAdded: "2023-07-05" },
  { id: "37", name: "Ear Infection Exam",            source: "Ambient", assignedTo: "SOAP: Objective",              status: "Complete",   providers: 50,                                 providerAccess: "unlocked", assignedUserIds: ["1","2","3","4","5"], dateAdded: "2025-11-19" },
  { id: "38", name: "Depression Follow-up Note",     source: "Athena",  assignedTo: "Progress Note: History/Background", status: "Complete", providers: 145,                            providerAccess: "locked",   assignedUserIds: ["1","2","3","4","5","6","7","8","9","10","11","12","13"], dateAdded: "2024-03-25" },
  { id: "39", name: "Knee Osteoarthritis Exam",      source: "Admin",   assignedTo: "SOAP: Objective",              status: "Complete",   providers: 90,                                 providerAccess: "unlocked", assignedUserIds: ["2","4","6","8","10","12","14"], dateAdded: "2023-04-16" },
  { id: "40", name: "Palpitations Workup HPI",       source: "Ambient", assignedTo: "SOAP: Subjective",             status: "Complete",   providers: 175,                                providerAccess: "locked",   assignedUserIds: ["1","2","3","4","5","6","7","8","9","10"], dateAdded: "2026-04-08" },
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
  "Thyroid Dysfunction Note": "TSH: [/value] on [/date]. Free T4: [/value]. Free T3: [/value if checked].\nCurrent thyroid medication: [/medication and dose]. Adherence: [/adherence].\nSymptoms today: [/fatigue/weight change/cold or heat intolerance/palpitations/hair loss].\nNeck exam: No palpable goiter, no thyroid tenderness. Referral to endocrinology: [/pending/completed/not indicated].",
  "UTI Assessment": "Urinary symptoms: [/dysuria/frequency/urgency/hematuria]. Duration: [/days].\nFever: [/yes/no]. Flank pain or CVA tenderness: [/yes/no]. Vaginal discharge: [/yes/no].\nUrinalysis: [/results]. Urine culture: [/sent/pending/not indicated].\nAllergies: [/allergies]. Prescribed [/antibiotic and dose] for [/duration]. Patient instructed to increase fluid intake and follow up if symptoms persist.",
  "Chronic Kidney Disease Note": "CKD stage: [/stage] based on eGFR [/value] (baseline [/baseline]). Proteinuria: [/yes/no/value].\nBlood pressure today: [/BP]. ACE inhibitor or ARB: [/medication and dose]. Potassium: [/value]. Bicarbonate: [/value].\nAvoid NSAIDs and nephrotoxic agents. Dietary counseling reviewed: low-sodium, low-potassium diet as appropriate.\nNephrology referral: [/pending/completed/not indicated]. Next labs in [/interval].",
  "Allergic Rhinitis ROS": "Nasal congestion: [/intermittent/persistent]. Rhinorrhea: [/clear/purulent]. Sneezing: [/yes/no]. Post-nasal drip: [/yes/no].\nOcular symptoms: [/itching/tearing/redness]. Seasonal vs. perennial: [/seasonal/perennial/both].\nKnown triggers: [/pollen/dust mites/pet dander/mold/other]. Current therapy: [/antihistamine/nasal steroid/immunotherapy].\nAsthma comorbidity: [/yes/no]. Symptom control: [/well-controlled/partially controlled/uncontrolled].",
  "Atrial Fibrillation HPI": "AFib type: [/paroxysmal/persistent/permanent]. Duration of current episode: [/hours/days/unknown].\nPalpitations, dyspnea, or chest discomfort: [/present/absent]. Syncope or presyncope: [/yes/no].\nCurrent rate-control: [/medication and dose]. Anticoagulation: [/agent, dose, and indication — CHA₂DS₂-VASc score: /score].\nLast echo: [/date]. Last cardioversion: [/date or none]. Thyroid function: [/normal/pending].",
  "Obesity Counseling Note": "BMI today: [/value] — [/class I/II/III obesity]. Weight change since last visit: [/+/- lbs over interval].\nDietary review: [/summary of eating patterns]. Physical activity: [/frequency and type].\nComorbidities addressed: [/hypertension/diabetes/OSA/hyperlipidemia].\nGoal set with patient: [/target weight or behavior change]. Resources offered: [/dietitian referral/behavioral counseling/pharmacotherapy/bariatric surgery referral].",
  "Wound Care Assessment": "Wound location: [/location]. Size: [/length × width × depth] cm. Wound bed: [/granulating/sloughing/necrotic].\nDrainage: [/none/serous/serosanguineous/purulent]. Periwound skin: [/intact/macerated/erythema].\nOdor: [/none/present]. Signs of infection: [/yes/no].\nDebridement performed: [/yes/no]. Dressing applied: [/dressing type]. Next wound check in [/interval]. Patient and caregiver educated on home wound care.",
  "Insomnia Evaluation": "Sleep onset latency: [/minutes]. Total sleep time: [/hours]. Nighttime awakenings: [/number]. Early morning awakening: [/yes/no].\nDaytime impairment: [/fatigue/concentration/mood]. Duration of insomnia: [/weeks/months]. Precipitating events: [/stress/medical/medication].\nSleep hygiene reviewed. Caffeine, alcohol, and screen exposure discussed.\nPHQ-2: [/score]. Treatment plan: [/sleep hygiene/CBT-I referral/pharmacotherapy — agent and dose].",
  "Chronic Pain Management": "Pain location: [/location]. Duration: [/months/years]. Quality: [/burning/aching/stabbing/shooting]. Severity: [/0–10 average and worst].\nFunctional impact: [/work/ADLs/sleep/mood]. Current regimen: [/medications, doses, and frequency]. Side effects: [/none/noted].\nOpioid risk review completed: [/PDMP checked/urine drug screen/informed consent on file].\nGoals of care revisited. Non-pharmacologic therapies: [/PT/CBT/acupuncture/other]. Next review in [/interval].",
  "Pediatric Fever Assessment": "Age: [/age]. Temperature: [/value °F/°C] by [/route]. Duration of fever: [/days]. Maximum temperature at home: [/value].\nAssociated symptoms: [/cough/rhinorrhea/ear pain/vomiting/diarrhea/rash/dysuria].\nExam: [/well-appearing/ill-appearing]. Ears: [/TMs clear/bulging/erythema]. Throat: [/clear/erythema/exudates]. Lymphadenopathy: [/yes/no].\nRapid strep: [/positive/negative/not done]. Plan: [/antipyretics/antibiotics/watchful waiting]. Return precautions discussed with caregiver.",
  "Syncope Evaluation": "Episode description: [/sudden/prodrome — diaphoresis, lightheadedness, nausea]. Duration of LOC: [/seconds]. Witnessed: [/yes/no].\nRecovery: [/immediate/delayed confusion]. Precipitating factors: [/positional change/exertion/prolonged standing/emotional stress/none].\nPrior episodes: [/yes/no]. Cardiac history: [/relevant history]. Medications: [/relevant medications].\nECG today: [/results]. Orthostatic vitals: [/results]. Disposition: [/discharge with cardiology referral/admit for monitoring/further outpatient workup].",
  "Fall Risk Assessment": "Fall history: [/number of falls in past year]. Circumstances of most recent fall: [/description].\nGait assessment: [/steady/unsteady]. Assistive device: [/none/cane/walker]. Footwear: [/appropriate/concerning].\nMedication review for fall risk: [/polypharmacy/sedatives/antihypertensives]. Orthostatic hypotension: [/present/absent].\nVision: [/last exam date]. Home safety assessment: [/completed/recommended]. PT/OT referral: [/placed/declined]. Fall prevention counseling provided.",
  "Skin Lesion Exam": "Lesion location: [/location]. Size: [/diameter] mm. Shape: [/round/oval/irregular]. Border: [/well-demarcated/irregular]. Color: [/uniform/variegated].\nSurface: [/smooth/scaly/ulcerated/crusted]. Elevation: [/flat/raised/nodular]. Surrounding skin: [/normal/erythema/hyperpigmentation].\nABCDE criteria reviewed: [/findings]. Duration: [/weeks/months]. Change over time: [/stable/growing/bleeding].\nImpression: [/benign/suspicious]. Plan: [/reassurance/biopsy — excisional/shave/punch/dermatology referral].",
  "Urinary Incontinence HPI": "Type of incontinence: [/stress/urge/mixed/overflow]. Duration: [/months/years]. Frequency of episodes: [/daily/weekly].\nPrecipitating factors: [/coughing/sneezing/urgency/nocturia]. Pad use: [/none/number per day].\nBowel symptoms: [/constipation/fecal urgency]. Fluid and caffeine intake reviewed.\nPelvic floor PT: [/completed/recommended/declined]. Medications reviewed for contributing agents. Urology or urogynecology referral: [/placed/not indicated].",
  "Shoulder Pain Exam": "Pain location: [/anterior/lateral/posterior/diffuse]. Onset: [/acute/insidious]. Duration: [/weeks/months]. Severity: [/0–10].\nMechanism: [/trauma/overhead activity/no clear mechanism]. Range of motion: [/degrees — flexion/abduction/external rotation/internal rotation].\nSpecial tests: Neer sign [/+/-], Hawkins-Kennedy [/+/-], empty can [/+/-], Speed's test [/+/-], cross-body adduction [/+/-].\nImpression: [/rotator cuff pathology/AC joint/biceps tendinopathy/adhesive capsulitis/other]. Plan: [/imaging/PT/injection/orthopedic referral].",
  "Hyperlipidemia Follow-up": "Last lipid panel: [/date] — LDL [/value], HDL [/value], TG [/value], TC [/value].\nCurrent statin: [/medication and dose]. Adherence: [/adherence]. Myalgias or other side effects: [/none/noted].\nDietary and exercise counseling reinforced. 10-year ASCVD risk: [/value]%.\nLDL goal: [/value]. At goal: [/yes/no]. Plan: [/continue current therapy/uptitrate/add ezetimibe/add PCSK9 inhibitor]. Next labs in [/interval].",
  "Ear Infection Exam": "Ear complaints: [/right/left/bilateral] — [/pain/discharge/decreased hearing/pressure]. Duration: [/days].\nFever: [/yes/no]. Recent URI: [/yes/no]. Swimming history: [/yes/no].\nOtoscopy: [/TM erythema/bulging/perforation/effusion/normal]. Canal: [/clear/erythema/discharge/debris].\nDiagnosis: [/AOM/OME/otitis externa]. Antibiotic indicated: [/yes/no]. Prescribed [/medication, dose, duration]. Analgesics: [/recommended]. Follow-up in [/interval] if no improvement.",
  "Depression Follow-up Note": "PHQ-9 today: [/score] — [/severity]. Change from last visit [/date]: [/improved/worsened/stable].\nCurrent antidepressant: [/medication and dose] started [/date]. Side effects: [/none/noted].\nSuicidal ideation: [/denied/present — safety plan reviewed]. Sleep, energy, and concentration: [/improved/unchanged/worsened].\nTherapy: [/in therapy/referral placed/declined]. Next follow-up in [/interval]. Patient instructed to contact office if symptoms acutely worsen.",
  "Knee Osteoarthritis Exam": "Pain location: [/medial/lateral/anterior/diffuse]. Severity: [/0–10]. Duration: [/months/years]. Aggravated by: [/stairs/prolonged walking/kneeling].\nSwelling: [/present/absent]. Crepitus: [/yes/no]. Range of motion: [/degrees — flexion/extension]. Effusion: [/trace/moderate/large/none].\nSpecial tests: McMurray [/+/-], Lachman [/+/-], varus/valgus stress [/stable/laxity].\nPrior imaging: [/X-ray grade/MRI findings]. Plan: [/PT/NSAID/intra-articular injection/orthopedic referral for surgical evaluation].",
  "Palpitations Workup HPI": "Palpitation character: [/rapid/irregular/skipping/pounding]. Onset: [/abrupt/gradual]. Duration: [/seconds/minutes/hours].\nFrequency: [/daily/weekly/rare]. Associated symptoms: [/dyspnea/chest pain/presyncope/diaphoresis]. Triggers: [/exertion/caffeine/stress/positional/none].\nCurrent medications reviewed. Thyroid function: [/normal/pending]. ECG today: [/normal sinus rhythm/findings].\nEvent monitor ordered: [/yes/no]. Caffeine and stimulant counseling provided. Cardiology referral: [/placed/not indicated at this time].",
  "Dictation only Macro": "This is a sample macro for dictation-only licensed users.\nSpeak the trigger phrase to insert this content into the note automatically.\nCustomize this text with clinical content relevant to your workflow.",
  "Ambient only Macro": "This is a sample macro for Ambient-only licensed users.\nThis content is inserted based on AI-detected context during the ambient session.\nUse selection criteria to define when the AI should apply this macro.",
  "Blended Macro": "This is a sample macro for blended license users.\nCan be triggered by dictation via the trigger phrase, or applied by the AI based on selection criteria.\nSupports both workflow modalities.",
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
  "Thyroid Dysfunction Note": "Apply for patients with known hypothyroidism or hyperthyroidism presenting for lab review, medication adjustment, or symptom management. Not for new thyroid nodule workup.",
  "UTI Assessment": "Use when the patient presents with lower urinary tract symptoms suggestive of uncomplicated or complicated UTI. Not appropriate for pyelonephritis requiring inpatient evaluation.",
  "Chronic Kidney Disease Note": "Apply at CKD monitoring visits for any stage — focus on eGFR trend, proteinuria, blood pressure control, and medication safety. Not for acute kidney injury workup.",
  "Allergic Rhinitis ROS": "Use when the chief complaint is nasal congestion, rhinorrhea, sneezing, or nasal itching consistent with allergic rhinitis. Also applicable during asthma visits with concurrent nasal symptoms.",
  "Atrial Fibrillation HPI": "Apply for established AFib patients presenting for rate or rhythm management, anticoagulation review, or palpitation symptoms. Also use for new-onset AFib evaluation in the outpatient setting.",
  "Obesity Counseling Note": "Use at visits where obesity management is a primary focus — initial diagnosis, follow-up for weight loss, or comorbidity counseling. Append to wellness or chronic disease visits as appropriate.",
  "Wound Care Assessment": "Apply for any wound check visit — surgical, traumatic, or chronic wound (e.g., diabetic foot ulcer, venous stasis ulcer, pressure injury). Use at each scheduled wound care encounter.",
  "Insomnia Evaluation": "Use when the patient's chief complaint or a significant concern is difficulty falling or staying asleep, or non-restorative sleep affecting daytime function. Not for hypersomnia or suspected sleep apnea.",
  "Chronic Pain Management": "Apply at established chronic pain follow-up visits for musculoskeletal, neuropathic, or mixed-etiology pain lasting more than three months. Required when opioid medications are part of the treatment plan.",
  "Pediatric Fever Assessment": "Use for pediatric patients (0–18 years) presenting with fever as the chief complaint or a primary symptom. Adjust antibiotic thresholds per age-specific guidelines.",
  "Syncope Evaluation": "Apply when the chief complaint is transient loss of consciousness, near-syncope, or an unexplained fall with suspected cardiac or vasovagal etiology. Not for seizure-related events.",
  "Fall Risk Assessment": "Use for patients with a history of falls, identified as high fall-risk on screening, or presenting after a fall without significant injury. Incorporate into annual wellness visits for patients 65 and older.",
  "Skin Lesion Exam": "Apply when a skin lesion is the primary reason for the visit or a significant incidental finding requiring documentation and management decision. Use for both new and changing lesions.",
  "Urinary Incontinence HPI": "Use when urinary leakage or urgency is the chief complaint or a clinically significant reported symptom. Applicable for both stress and urge incontinence presentations.",
  "Shoulder Pain Exam": "Apply when shoulder pain is the primary musculoskeletal complaint. Use for both acute injury and chronic shoulder pathology requiring a structured orthopedic exam.",
  "Hyperlipidemia Follow-up": "Use at lipid management visits for patients on statin or non-statin therapy, or when reviewing a lipid panel result. Applicable for both primary and secondary cardiovascular prevention.",
  "Ear Infection Exam": "Apply when the chief complaint is ear pain, ear discharge, or decreased hearing consistent with otitis media or otitis externa. Use for both pediatric and adult presentations.",
  "Depression Follow-up Note": "Use for established patients on antidepressant therapy or in psychotherapy presenting for medication management follow-up. Include PHQ-9 score at every depression monitoring visit.",
  "Knee Osteoarthritis Exam": "Apply for patients with known or suspected knee osteoarthritis presenting for pain management, functional assessment, or treatment escalation. Not for acute knee trauma or ligament injury.",
  "Palpitations Workup HPI": "Use when palpitations are the chief complaint requiring cardiac workup. Applicable for both new presentations and recurrent palpitations under evaluation. Not for documented, rate-controlled arrhythmia follow-up.",
  "Dictation only Macro": "N/A — this macro is triggered by dictation only. Selection criteria is not used for dictation-only macros.",
  "Ambient only Macro": "Apply this macro during any Ambient session where the prototype test scenario is active. Used to demonstrate Ambient-only license behavior.",
  "Blended Macro": "Apply during sessions where both dictation trigger and ambient context are available. Demonstrates blended license behavior with both trigger name and selection criteria active.",
};

// ─── Macro Edit/Create Drawer ─────────────────────────────────────────────────

type MacroEditDrawerProps = {
  macro?: Macro;   // undefined → create mode
  onClose: () => void;
  onCreate?: (macro: Macro) => void;
  onSave?: (updatedMacro: Macro) => void;
  panelVariant?: "v1" | "v2" | "v3";
};

function MacroEditDrawer({ macro, onClose, onCreate, onSave, panelVariant = "v1" }: MacroEditDrawerProps) {
  const isCreate = !macro;
  const [macroType, setMacroType] = useState<"dictation" | "ambient" | "blended">(
    macro?.macroType ?? "blended"
  );
  const showTriggerName = macroType === "dictation" || macroType === "blended";
  const showSelectionCriteria = macroType === "ambient" || macroType === "blended";
  const showTemplateSection = macroType !== "dictation";
  type AssignEntry = { id: string; template: string; section: string; providerIds: string[]; providerCount: number; };
  const { template: initTemplate, section: initSection } = macro
    ? parseAssignedTo(macro.assignedTo)
    : { template: "", section: "" };

  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const [macroName, setMacroName]               = useState(macro?.name ?? "");
  const [assignments, setAssignments] = useState<AssignEntry[]>([
    { id: "a1", template: initTemplate, section: initSection, providerIds: macro ? macro.assignedUserIds : [], providerCount: macro ? macro.providers : 0 }
  ]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [providerSearches, setProviderSearches] = useState<Record<string, string>>({});
  const [providerFilters, setProviderFilters] = useState<Record<string, { facility: string; provType: string; specialty: string }>>({});
  const [openFilterMenu, setOpenFilterMenu] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(macro ? macro.providerAccess === "locked" : false);
  const [macroContent, setMacroContent]         = useState(macro ? (MACRO_CONTENT_MAP[macro.name] ?? "") : "");
  const [selectionCriteria, setSelectionCriteria] = useState(macro ? (SELECTION_CRITERIA_MAP[macro.name] ?? "") : "");
  const [isActive, setIsActive]                 = useState(macro ? macro.status === "Complete" : true);
  const [additionalOpen, setAdditionalOpen]         = useState(false);
  const [assignOpen, setAssignOpen]                 = useState(true);
  const [detailOpen, setDetailOpen]                 = useState(true);
  const [contentAiDismissed, setContentAiDismissed] = useState(false);
  const [criteriaAiDismissed, setCriteriaAiDismissed] = useState(false);
  // Only show AI helpers when user has actually edited the field (not just from pre-fill)
  const [contentUserEdited, setContentUserEdited]   = useState(false);
  const [criteriaUserEdited, setCriteriaUserEdited] = useState(false);
  const [triggerName, setTriggerName] = useState(macro?.triggerName ?? "");

  function addAssignment() {
    setAssignments(prev => [...prev, { id: Date.now().toString(), template: "", section: "", providerIds: [], providerCount: 0 }]);
  }
  function setProviderFilter(assignId: string, key: 'facility' | 'provType' | 'specialty', value: string) {
    setProviderFilters(prev => ({ ...prev, [assignId]: { ...(prev[assignId] ?? { facility: '', provType: '', specialty: '' }), [key]: value } }));
  }
  function clearProviderFilter(assignId: string, key: 'facility' | 'provType' | 'specialty') {
    setProviderFilters(prev => ({ ...prev, [assignId]: { ...(prev[assignId] ?? { facility: '', provType: '', specialty: '' }), [key]: '' } }));
  }
  function clearAllProviderFilters(assignId: string) {
    setProviderFilters(prev => ({ ...prev, [assignId]: { facility: '', provType: '', specialty: '' } }));
    setOpenFilterMenu(null);
  }
  function removeAssignment(id: string) {
    setAssignments(prev => {
      if (prev.length === 1) return [{ id: prev[0].id, template: "", section: "", providerIds: [], providerCount: 0 }];
      return prev.filter(a => a.id !== id);
    });
  }
  function updateAssignTemplate(id: string, tmpl: string) {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, template: tmpl, section: "" } : a));
  }
  function updateAssignSection(id: string, sec: string) {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, section: sec } : a));
  }
  function toggleProvider(assignId: string, userId: string) {
    setAssignments(prev => prev.map(a => {
      if (a.id !== assignId) return a;
      const was = a.providerIds.includes(userId);
      return { ...a, providerIds: was ? a.providerIds.filter(x => x !== userId) : [...a.providerIds, userId], providerCount: Math.max(0, was ? a.providerCount - 1 : a.providerCount + 1) };
    }));
  }
  function toggleAllProviders(assignId: string, filteredIds: string[]) {
    setAssignments(prev => prev.map(a => {
      if (a.id !== assignId) return a;
      const allSelected = filteredIds.every(id => a.providerIds.includes(id));
      const next = allSelected
        ? a.providerIds.filter(id => !filteredIds.includes(id))
        : [...new Set([...a.providerIds, ...filteredIds])];
      return { ...a, providerIds: next, providerCount: next.length };
    }));
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
  const [errors, setErrors] = useState({ template: false, macroName: false, macroContent: false, selectionCriteria: false, triggerName: false });

  function handleCreate() {
    const newErrors = {
      template: !assignments.some(a => a.template && a.section),
      macroName: !macroName.trim(),
      macroContent: !macroContent.trim(),
      selectionCriteria: showSelectionCriteria && !selectionCriteria.trim(),
      triggerName: showTriggerName && !triggerName.trim(),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
    const newMacro: Macro = {
      id: Date.now().toString(),
      name: macroName.trim(),
      source: "Admin",
      assignedTo: assignments[0].template && assignments[0].section ? `${assignments[0].template}: ${assignments[0].section}` : "",
      status: (macroName.trim() && assignments[0].template && assignments[0].section && macroContent.trim()
        && (!showSelectionCriteria || selectionCriteria.trim())
        && (!showTriggerName || triggerName.trim())) ? "Complete" : "Incomplete",
      providers: assignments[0].providerCount,
      allProviders: assignments[0].providerIds.length === mockUsers.length,
      providerAccess: isLocked ? "locked" : "unlocked",
      assignedUserIds: assignments[0].providerIds,
      macroType: macroType as "dictation" | "ambient" | "blended",
      triggerName: triggerName.trim() || undefined,
    };
    onCreate?.(newMacro);
    onClose();
  }

  function handleSave() {
    const newErrors = {
      template: !assignments.some(a => a.template && a.section),
      macroName: !macroName.trim(),
      macroContent: false,
      selectionCriteria: false,
      triggerName: false,
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
    const updatedMacro: Macro = {
      ...macro!,
      name: macroName.trim(),
      assignedTo: assignments[0].template && assignments[0].section ? `${assignments[0].template}: ${assignments[0].section}` : "",
      status: (macroName.trim() && assignments[0].template && assignments[0].section && macroContent.trim()
        && (!showSelectionCriteria || selectionCriteria.trim())
        && (!showTriggerName || triggerName.trim())) ? "Complete" : "Incomplete",
      providers: assignments[0].providerCount,
      allProviders: false,
      providerAccess: isLocked ? "locked" : "unlocked",
      assignedUserIds: assignments[0].providerIds,
      triggerName: triggerName.trim() || undefined,
    };
    onSave?.(updatedMacro);
    onClose();
  }

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


          {/* ── Assign section header ── */}
          <button onClick={() => setAssignOpen(o => !o)} className="flex items-center justify-between w-full mb-[20px] outline-none group">
            <span className="text-[15px] font-bold leading-[1.2] tracking-[0.15px] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFeatureSettings: "'ss07' 1" }}>Assign</span>
            <Icon name="expand_more" size={18} className={`text-[var(--foreground-secondary,#666)] transition-transform duration-200 ${assignOpen ? "rotate-0" : "-rotate-90"}`} />
          </button>

          {assignOpen && (<>
          {panelVariant === "v1" && (<>
          {assignments.map((assign, idx) => {
            const assignSections = TEMPLATE_SECTIONS[assign.template] ?? [];
            const provSearch = providerSearches[assign.id] ?? "";
            const filters = providerFilters[assign.id] ?? { facility: '', provType: '', specialty: '' };
            const filteredProv = mockUsers
              .filter(u => u.name.toLowerCase().includes(provSearch.toLowerCase()))
              .filter(u => !filters.facility || u.facility === filters.facility)
              .filter(u => !filters.provType || u.providerType === filters.provType)
              .filter(u => !filters.specialty || u.specialty === filters.specialty)
              .sort((a, b) => a.name.localeCompare(b.name));
            return (
              <div key={assign.id}>
                {/* Template — hidden for dictation-only macros */}
                {showTemplateSection && <div className="mb-[12px]">
                  <div className="flex items-center justify-between mb-[2px]">
                    <p className={fieldLabel} style={{ fontFeatureSettings: "'ss07' 1" }}>Template <span className="font-normal text-[var(--foreground-secondary,#666)]">*</span></p>
                    <button onClick={() => removeAssignment(assign.id)} className="flex items-center justify-center w-[20px] h-[20px] text-[var(--foreground-secondary,#666)] hover:text-[var(--foreground-semantic-danger,#bb1411)] transition-colors outline-none">
                      <Icon name="close" size={15} />
                    </button>
                  </div>
                  <p className={fieldHint}>Select which template and section this macro should be inserted</p>
                  <div className="flex items-center gap-[8px] mb-[4px]">
                    <div className="relative flex-1">
                      <button
                        onClick={() => { setOpenDropdown(openDropdown === `${assign.id}-template` ? null : `${assign.id}-template`); if (errors.template) setErrors(e => ({ ...e, template: false })); }}
                        className={`flex items-center justify-between w-full h-[36px] px-[12px] rounded-[6px] border bg-white text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] hover:border-[var(--foreground-secondary,#666)] outline-none transition-colors ${errors.template && idx === 0 ? "border-[var(--foreground-semantic-danger,#bb1411)]" : "border-[var(--shape-outline,rgba(0,0,0,0.1))]"}`}
                        style={{ fontFamily: "Lato, sans-serif" }}
                      >
                        <span className={assign.template ? "" : "text-[var(--foreground-tertiary,#808080)]"}>{assign.template || "Select Template"}</span>
                        <Icon name={openDropdown === `${assign.id}-template` ? "arrow_drop_up" : "arrow_drop_down"} size={20} className="text-[var(--foreground-secondary,#666)] shrink-0" />
                      </button>
                      {openDropdown === `${assign.id}-template` && (
                        <>
                          <div className="fixed inset-0 z-[60]" onClick={() => setOpenDropdown(null)} />
                          <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[70] py-[4px]">
                            {TEMPLATES.map((t) => (
                              <button key={t} onClick={() => { updateAssignTemplate(assign.id, t); setOpenDropdown(null); }}
                                className={`flex items-center w-full px-[12px] py-[9px] text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] transition-colors ${assign.template === t ? "bg-[var(--litmus-25,#f1f3fe)] font-bold" : "hover:bg-[var(--surface-1,#f7f7f7)]"}`}
                                style={{ fontFamily: "Lato, sans-serif" }}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="relative flex-1">
                      <button
                        onClick={() => { setOpenDropdown(openDropdown === `${assign.id}-section` ? null : `${assign.id}-section`); if (errors.template) setErrors(e => ({ ...e, template: false })); }}
                        className={`flex items-center justify-between w-full h-[36px] px-[12px] rounded-[6px] border bg-white text-[13px] font-normal hover:border-[var(--foreground-secondary,#666)] outline-none transition-colors ${errors.template && idx === 0 ? "border-[var(--foreground-semantic-danger,#bb1411)]" : "border-[var(--shape-outline,rgba(0,0,0,0.1))]"}`}
                        style={{ fontFamily: "Lato, sans-serif" }}
                      >
                        <span className={assign.section ? "text-[var(--foreground-primary,#1a1a1a)]" : "text-[var(--foreground-tertiary,#808080)]"}>{assign.section || "Select Section"}</span>
                        <Icon name={openDropdown === `${assign.id}-section` ? "arrow_drop_up" : "arrow_drop_down"} size={20} className="text-[var(--foreground-secondary,#666)] shrink-0" />
                      </button>
                      {openDropdown === `${assign.id}-section` && (
                        <>
                          <div className="fixed inset-0 z-[60]" onClick={() => setOpenDropdown(null)} />
                          <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[70] py-[4px]">
                            {assignSections.map((s) => (
                              <button key={s} onClick={() => { updateAssignSection(assign.id, s); setOpenDropdown(null); }}
                                className={`flex items-center w-full px-[12px] py-[9px] text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] transition-colors ${assign.section === s ? "bg-[var(--litmus-25,#f1f3fe)] font-bold" : "hover:bg-[var(--surface-1,#f7f7f7)]"}`}
                                style={{ fontFamily: "Lato, sans-serif" }}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {errors.template && idx === 0 && (
                    <p className="text-[12px] font-normal text-[var(--foreground-semantic-danger,#bb1411)] mt-[4px] mb-[4px]" style={{ fontFamily: "Lato, sans-serif" }}>
                      At least one template section assignment is required
                    </p>
                  )}
                </div>}

                {/* Provider */}
                <div className={idx < assignments.length - 1 ? "mb-[20px]" : "mb-[16px]"}>
                  <p className={fieldLabel} style={{ fontFeatureSettings: "'ss07' 1" }}>Provider</p>
                  <p className={fieldHint}>Choose which providers can use this macro. Search and select one or more.</p>
                  <div className="relative">
                    <button
                      onClick={() => { setOpenDropdown(openDropdown === `${assign.id}-provider` ? null : `${assign.id}-provider`); setProviderSearches(ps => ({ ...ps, [assign.id]: "" })); }}
                      className="flex items-center justify-between w-full h-[36px] px-[12px] rounded-[6px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] bg-white text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] hover:border-[var(--foreground-secondary,#666)] outline-none transition-colors"
                      style={{ fontFamily: "Lato, sans-serif" }}
                    >
                      <span className={assign.providerCount === 0 ? "text-[var(--foreground-tertiary,#808080)]" : ""}>
                        {assign.providerCount === 0 ? "Select providers" : `Selected (${assign.providerCount})`}
                      </span>
                      <Icon name={openDropdown === `${assign.id}-provider` ? "arrow_drop_up" : "arrow_drop_down"} size={20} className="text-[var(--foreground-secondary,#666)] shrink-0" />
                    </button>
                    {openDropdown === `${assign.id}-provider` && (
                      <>
                        <div className="fixed inset-0 z-[80]" onClick={() => { setOpenDropdown(null); setProviderSearches(ps => ({ ...ps, [assign.id]: "" })); }} />
                        <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[90] py-[4px]">
                          <div className="px-[8px] pt-[4px] pb-[4px]">
                            <div className="relative flex items-center">
                              <span className="absolute left-[8px] text-[var(--foreground-secondary,#666)] pointer-events-none flex items-center"><Icon name="search" size={14} /></span>
                              <input autoFocus type="text" placeholder="Search providers" value={provSearch}
                                onChange={(e) => setProviderSearches(ps => ({ ...ps, [assign.id]: e.target.value }))}
                                className="w-full h-[28px] pl-[28px] pr-[8px] rounded-[4px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[var(--foreground-tertiary,#808080)] outline-none focus:border-[var(--accent,#1132ee)] bg-white"
                                style={{ fontFamily: "Lato, sans-serif" }} />
                            </div>
                          </div>
                          {/* Filter row */}
                          <div className="px-[8px] pb-[6px]" onClick={e => e.stopPropagation()}>
                            <div className="grid grid-cols-2 gap-[4px]">
                              {(['facility', 'specialty', 'provType'] as const).map((key) => {
                                const label = key === 'facility' ? 'Facility' : key === 'specialty' ? 'Specialty' : 'Type';
                                const options = key === 'facility' ? PROVIDER_FACILITIES : key === 'specialty' ? PROVIDER_SPECIALTIES : PROVIDER_TYPES;
                                const active = filters[key];
                                const menuKey = `${assign.id}-${key}`;
                                return (
                                  <div key={key} className="relative">
                                    <button
                                      onClick={e => { e.stopPropagation(); setOpenFilterMenu(openFilterMenu === menuKey ? null : menuKey); }}
                                      className={`flex items-center justify-between gap-[3px] w-full h-[22px] px-[7px] rounded-[4px] text-[11px] font-normal border transition-colors ${active ? "border-[var(--accent,#1132ee)] text-[var(--accent,#1132ee)] bg-[var(--litmus-25,#f1f3fe)]" : "border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[var(--foreground-secondary,#666)] hover:border-[var(--foreground-secondary,#666)]"}`}
                                      style={{ fontFamily: "Lato, sans-serif" }}
                                    >
                                      <span className={active ? "truncate" : ""}>{active || label}</span>
                                      {active
                                        ? <span onClick={e => { e.stopPropagation(); clearProviderFilter(assign.id, key); setOpenFilterMenu(null); }} className="ml-[2px] leading-none shrink-0">×</span>
                                        : <Icon name="arrow_drop_down" size={14} className="shrink-0" />
                                      }
                                    </button>
                                    {openFilterMenu === menuKey && (
                                      <div className="absolute top-full left-0 mt-[2px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.12)] z-[100] py-[4px] min-w-[140px]" onClick={e => e.stopPropagation()}>
                                        {options.map(opt => (
                                          <button key={opt} onClick={e => { e.stopPropagation(); setProviderFilter(assign.id, key, opt); setOpenFilterMenu(null); }}
                                            className={`flex items-center w-full px-[10px] py-[6px] text-[12px] text-left transition-colors ${filters[key] === opt ? "bg-[var(--litmus-25,#f1f3fe)] font-bold text-[var(--accent,#1132ee)]" : "hover:bg-[var(--surface-1,#f7f7f7)] text-[var(--foreground-primary,#1a1a1a)]"}`}
                                            style={{ fontFamily: "Lato, sans-serif" }}>
                                            {opt}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {Object.values(filters).some(Boolean) && (
                              <button onClick={e => { e.stopPropagation(); clearAllProviderFilters(assign.id); }} className="mt-[4px] text-[11px] font-normal text-[var(--foreground-secondary,#666)] hover:text-[var(--foreground-primary,#1a1a1a)] transition-colors" style={{ fontFamily: "Lato, sans-serif" }}>Clear all</button>
                            )}
                          </div>
                          <div className="max-h-[200px] overflow-y-auto">
                            {filteredProv.length === 0 ? (
                              <p className="px-[12px] py-[8px] text-[13px] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>No providers found</p>
                            ) : (<>
                              <button onClick={() => toggleAllProviders(assign.id, filteredProv.map(u => u.id))}
                                className="flex items-center gap-[10px] w-full px-[12px] py-[7px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors text-left border-b border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                                <Checkbox state={filteredProv.every(u => assign.providerIds.includes(u.id)) ? "selected" : filteredProv.some(u => assign.providerIds.includes(u.id)) ? "indeterminate" : "unselected"} />
                                <span className="text-[13px] font-bold leading-[1.4] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFamily: "Lato, sans-serif" }}>Select all</span>
                              </button>
                              {filteredProv.map((u) => (
                                <button key={u.id} onClick={() => toggleProvider(assign.id, u.id)}
                                  className="flex items-center gap-[10px] w-full px-[12px] py-[7px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors text-left">
                                  <Checkbox state={assign.providerIds.includes(u.id) ? "selected" : "unselected"} />
                                  <span className="text-[13px] font-normal leading-[1.4] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFamily: "Lato, sans-serif" }}>{u.name}</span>
                                </button>
                              ))}
                            </>)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {idx < assignments.length - 1 && (
                  <div className="h-px w-full bg-[var(--shape-outline,rgba(0,0,0,0.1))] mt-[16px] mb-[20px]" />
                )}
              </div>
            );
          })}

          {/* Add — hidden for dictation-only macros */}
          {showTemplateSection && <button onClick={addAssignment} className="flex items-center gap-[4px] text-[13px] font-bold text-[var(--accent,#1132ee)] hover:opacity-80 transition-opacity mb-[4px] outline-none" style={{ fontFamily: "Lato, sans-serif" }}>
            <Icon name="add" size={16} />
            Add
          </button>}
          </>)}
          {panelVariant === "v2" && (<>
          {assignments.map((assign, idx) => {
            const assignSections = TEMPLATE_SECTIONS[assign.template] ?? [];
            const provSearch = providerSearches[assign.id] ?? "";
            const filters = providerFilters[assign.id] ?? { facility: '', provType: '', specialty: '' };
            const filteredProv = mockUsers
              .filter(u => u.name.toLowerCase().includes(provSearch.toLowerCase()))
              .filter(u => !filters.facility || u.facility === filters.facility)
              .filter(u => !filters.provType || u.providerType === filters.provType)
              .filter(u => !filters.specialty || u.specialty === filters.specialty)
              .sort((a, b) => a.name.localeCompare(b.name));
            return (
              <div key={assign.id}>
                <div className="flex items-center justify-between mb-[2px]">
                  <p className={fieldLabel} style={{ fontFeatureSettings: "'ss07' 1" }}>{showTemplateSection ? "Template & Provider" : "Provider"} <span className="font-normal text-[var(--foreground-secondary,#666)]">*</span></p>
                  <button onClick={() => removeAssignment(assign.id)} className="flex items-center justify-center w-[20px] h-[20px] text-[var(--foreground-secondary,#666)] hover:text-[var(--foreground-semantic-danger,#bb1411)] transition-colors outline-none">
                    <Icon name="close" size={15} />
                  </button>
                </div>
                <p className={fieldHint}>{showTemplateSection ? "Select the template, section, and providers this macro is assigned to." : "Choose which providers can use this macro."}</p>
                <div className="flex flex-row gap-[8px] mb-[4px]">
                  {/* Template — hidden for dictation-only macros */}
                  {showTemplateSection && <div className="relative flex-1">
                    <button
                      onClick={() => { setOpenDropdown(openDropdown === `${assign.id}-template` ? null : `${assign.id}-template`); if (errors.template) setErrors(e => ({ ...e, template: false })); }}
                      className={`flex items-center justify-between w-full h-[36px] px-[12px] rounded-[6px] border bg-white text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] hover:border-[var(--foreground-secondary,#666)] outline-none transition-colors ${errors.template && idx === 0 ? "border-[var(--foreground-semantic-danger,#bb1411)]" : "border-[var(--shape-outline,rgba(0,0,0,0.1))]"}`}
                      style={{ fontFamily: "Lato, sans-serif" }}
                    >
                      <span className={assign.template ? "" : "text-[var(--foreground-tertiary,#808080)]"}>{assign.template || "Select Template"}</span>
                      <Icon name={openDropdown === `${assign.id}-template` ? "arrow_drop_up" : "arrow_drop_down"} size={20} className="text-[var(--foreground-secondary,#666)] shrink-0" />
                    </button>
                    {openDropdown === `${assign.id}-template` && (
                      <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setOpenDropdown(null)} />
                        <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[70] py-[4px]">
                          {TEMPLATES.map((t) => (
                            <button key={t} onClick={() => { updateAssignTemplate(assign.id, t); setOpenDropdown(null); }}
                              className={`flex items-center w-full px-[12px] py-[9px] text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] transition-colors ${assign.template === t ? "bg-[var(--litmus-25,#f1f3fe)] font-bold" : "hover:bg-[var(--surface-1,#f7f7f7)]"}`}
                              style={{ fontFamily: "Lato, sans-serif" }}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>}
                  {/* Section — hidden for dictation-only macros */}
                  {showTemplateSection && <div className="relative flex-1">
                    <button
                      onClick={() => { setOpenDropdown(openDropdown === `${assign.id}-section` ? null : `${assign.id}-section`); if (errors.template) setErrors(e => ({ ...e, template: false })); }}
                      className={`flex items-center justify-between w-full h-[36px] px-[12px] rounded-[6px] border bg-white text-[13px] font-normal hover:border-[var(--foreground-secondary,#666)] outline-none transition-colors ${errors.template && idx === 0 ? "border-[var(--foreground-semantic-danger,#bb1411)]" : "border-[var(--shape-outline,rgba(0,0,0,0.1))]"}`}
                      style={{ fontFamily: "Lato, sans-serif" }}
                    >
                      <span className={assign.section ? "text-[var(--foreground-primary,#1a1a1a)]" : "text-[var(--foreground-tertiary,#808080)]"}>{assign.section || "Select Section"}</span>
                      <Icon name={openDropdown === `${assign.id}-section` ? "arrow_drop_up" : "arrow_drop_down"} size={20} className="text-[var(--foreground-secondary,#666)] shrink-0" />
                    </button>
                    {openDropdown === `${assign.id}-section` && (
                      <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setOpenDropdown(null)} />
                        <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[70] py-[4px]">
                          {assignSections.map((s) => (
                            <button key={s} onClick={() => { updateAssignSection(assign.id, s); setOpenDropdown(null); }}
                              className={`flex items-center w-full px-[12px] py-[9px] text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] transition-colors ${assign.section === s ? "bg-[var(--litmus-25,#f1f3fe)] font-bold" : "hover:bg-[var(--surface-1,#f7f7f7)]"}`}
                              style={{ fontFamily: "Lato, sans-serif" }}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>}
                  {/* Provider */}
                  <div className="relative flex-1">
                    <button
                      onClick={() => { setOpenDropdown(openDropdown === `${assign.id}-provider` ? null : `${assign.id}-provider`); setProviderSearches(ps => ({ ...ps, [assign.id]: "" })); }}
                      className="flex items-center justify-between w-full h-[36px] px-[12px] rounded-[6px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] bg-white text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] hover:border-[var(--foreground-secondary,#666)] outline-none transition-colors"
                      style={{ fontFamily: "Lato, sans-serif" }}
                    >
                      <span className={assign.providerCount === 0 ? "text-[var(--foreground-tertiary,#808080)]" : ""}>
                        {assign.providerCount === 0 ? "Select providers" : `Providers (${assign.providerCount})`}
                      </span>
                      <Icon name={openDropdown === `${assign.id}-provider` ? "arrow_drop_up" : "arrow_drop_down"} size={20} className="text-[var(--foreground-secondary,#666)] shrink-0" />
                    </button>
                    {openDropdown === `${assign.id}-provider` && (
                      <>
                        <div className="fixed inset-0 z-[80]" onClick={() => { setOpenDropdown(null); setProviderSearches(ps => ({ ...ps, [assign.id]: "" })); }} />
                        <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[90] py-[4px]">
                          <div className="px-[8px] pt-[4px] pb-[4px]">
                            <div className="relative flex items-center">
                              <span className="absolute left-[8px] text-[var(--foreground-secondary,#666)] pointer-events-none flex items-center"><Icon name="search" size={14} /></span>
                              <input autoFocus type="text" placeholder="Search providers" value={provSearch}
                                onChange={(e) => setProviderSearches(ps => ({ ...ps, [assign.id]: e.target.value }))}
                                className="w-full h-[28px] pl-[28px] pr-[8px] rounded-[4px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[var(--foreground-tertiary,#808080)] outline-none focus:border-[var(--accent,#1132ee)] bg-white"
                                style={{ fontFamily: "Lato, sans-serif" }} />
                            </div>
                          </div>
                          {/* Filter row */}
                          <div className="px-[8px] pb-[6px]" onClick={e => e.stopPropagation()}>
                            <div className="grid grid-cols-2 gap-[4px]">
                              {(['facility', 'specialty', 'provType'] as const).map((key) => {
                                const label = key === 'facility' ? 'Facility' : key === 'specialty' ? 'Specialty' : 'Type';
                                const options = key === 'facility' ? PROVIDER_FACILITIES : key === 'specialty' ? PROVIDER_SPECIALTIES : PROVIDER_TYPES;
                                const active = filters[key];
                                const menuKey = `${assign.id}-${key}`;
                                return (
                                  <div key={key} className="relative">
                                    <button
                                      onClick={e => { e.stopPropagation(); setOpenFilterMenu(openFilterMenu === menuKey ? null : menuKey); }}
                                      className={`flex items-center justify-between gap-[3px] w-full h-[22px] px-[7px] rounded-[4px] text-[11px] font-normal border transition-colors ${active ? "border-[var(--accent,#1132ee)] text-[var(--accent,#1132ee)] bg-[var(--litmus-25,#f1f3fe)]" : "border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[var(--foreground-secondary,#666)] hover:border-[var(--foreground-secondary,#666)]"}`}
                                      style={{ fontFamily: "Lato, sans-serif" }}
                                    >
                                      <span className={active ? "truncate" : ""}>{active || label}</span>
                                      {active
                                        ? <span onClick={e => { e.stopPropagation(); clearProviderFilter(assign.id, key); setOpenFilterMenu(null); }} className="ml-[2px] leading-none shrink-0">×</span>
                                        : <Icon name="arrow_drop_down" size={14} className="shrink-0" />
                                      }
                                    </button>
                                    {openFilterMenu === menuKey && (
                                      <div className="absolute top-full left-0 mt-[2px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.12)] z-[100] py-[4px] min-w-[140px]" onClick={e => e.stopPropagation()}>
                                        {options.map(opt => (
                                          <button key={opt} onClick={e => { e.stopPropagation(); setProviderFilter(assign.id, key, opt); setOpenFilterMenu(null); }}
                                            className={`flex items-center w-full px-[10px] py-[6px] text-[12px] text-left transition-colors ${filters[key] === opt ? "bg-[var(--litmus-25,#f1f3fe)] font-bold text-[var(--accent,#1132ee)]" : "hover:bg-[var(--surface-1,#f7f7f7)] text-[var(--foreground-primary,#1a1a1a)]"}`}
                                            style={{ fontFamily: "Lato, sans-serif" }}>
                                            {opt}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {Object.values(filters).some(Boolean) && (
                              <button onClick={e => { e.stopPropagation(); clearAllProviderFilters(assign.id); }} className="mt-[4px] text-[11px] font-normal text-[var(--foreground-secondary,#666)] hover:text-[var(--foreground-primary,#1a1a1a)] transition-colors" style={{ fontFamily: "Lato, sans-serif" }}>Clear all</button>
                            )}
                          </div>
                          <div className="max-h-[200px] overflow-y-auto">
                            {filteredProv.length === 0 ? (
                              <p className="px-[12px] py-[8px] text-[13px] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>No providers found</p>
                            ) : (<>
                              <button onClick={() => toggleAllProviders(assign.id, filteredProv.map(u => u.id))}
                                className="flex items-center gap-[10px] w-full px-[12px] py-[7px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors text-left border-b border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                                <Checkbox state={filteredProv.every(u => assign.providerIds.includes(u.id)) ? "selected" : filteredProv.some(u => assign.providerIds.includes(u.id)) ? "indeterminate" : "unselected"} />
                                <span className="text-[13px] font-bold leading-[1.4] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFamily: "Lato, sans-serif" }}>Select all</span>
                              </button>
                              {filteredProv.map((u) => (
                                <button key={u.id} onClick={() => toggleProvider(assign.id, u.id)}
                                  className="flex items-center gap-[10px] w-full px-[12px] py-[7px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors text-left">
                                  <Checkbox state={assign.providerIds.includes(u.id) ? "selected" : "unselected"} />
                                  <span className="text-[13px] font-normal leading-[1.4] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFamily: "Lato, sans-serif" }}>{u.name}</span>
                                </button>
                              ))}
                            </>)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {errors.template && idx === 0 && (
                  <p className="text-[12px] font-normal text-[var(--foreground-semantic-danger,#bb1411)] mt-[4px] mb-[4px]" style={{ fontFamily: "Lato, sans-serif" }}>
                    At least one template section assignment is required
                  </p>
                )}
                {idx < assignments.length - 1 && (
                  <div className="h-px w-full bg-[var(--shape-outline,rgba(0,0,0,0.1))] mt-[16px] mb-[20px]" />
                )}
              </div>
            );
          })}
          <button onClick={addAssignment} className="flex items-center gap-[4px] text-[13px] font-bold text-[var(--accent,#1132ee)] hover:opacity-80 transition-opacity mb-[4px] outline-none" style={{ fontFamily: "Lato, sans-serif" }}>
            <Icon name="add" size={16} />
            Add
          </button>
          </>)}
          {panelVariant === "v3" && (<>
          {assignments.map((assign, idx) => {
            const assignSections = TEMPLATE_SECTIONS[assign.template] ?? [];
            const provSearch = providerSearches[assign.id] ?? "";
            const filters = providerFilters[assign.id] ?? { facility: '', provType: '', specialty: '' };
            const filteredProv = mockUsers
              .filter(u => u.name.toLowerCase().includes(provSearch.toLowerCase()))
              .filter(u => !filters.facility || u.facility === filters.facility)
              .filter(u => !filters.provType || u.providerType === filters.provType)
              .filter(u => !filters.specialty || u.specialty === filters.specialty)
              .sort((a, b) => a.name.localeCompare(b.name));
            return (
              <div key={assign.id}>
                <div className="flex items-center justify-between mb-[2px]">
                  <p className={fieldLabel} style={{ fontFeatureSettings: "'ss07' 1" }}>{showTemplateSection ? "Template & Provider" : "Provider"} <span className="font-normal text-[var(--foreground-secondary,#666)]">*</span></p>
                  <button onClick={() => removeAssignment(assign.id)} className="flex items-center justify-center w-[20px] h-[20px] text-[var(--foreground-secondary,#666)] hover:text-[var(--foreground-semantic-danger,#bb1411)] transition-colors outline-none">
                    <Icon name="close" size={15} />
                  </button>
                </div>
                <p className={fieldHint}>{showTemplateSection ? "Select the template, section, and providers this macro is assigned to." : "Choose which providers can use this macro."}</p>
                {/* Template + Section in one row — hidden for dictation-only macros */}
                {showTemplateSection && <div className="flex flex-row gap-[8px] mb-[8px]">
                  {/* Template */}
                  <div className="relative flex-1">
                    <button
                      onClick={() => { setOpenDropdown(openDropdown === `${assign.id}-template` ? null : `${assign.id}-template`); if (errors.template) setErrors(e => ({ ...e, template: false })); }}
                      className={`flex items-center justify-between w-full h-[36px] px-[12px] rounded-[6px] border bg-white text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] hover:border-[var(--foreground-secondary,#666)] outline-none transition-colors ${errors.template && idx === 0 ? "border-[var(--foreground-semantic-danger,#bb1411)]" : "border-[var(--shape-outline,rgba(0,0,0,0.1))]"}`}
                      style={{ fontFamily: "Lato, sans-serif" }}
                    >
                      <span className={assign.template ? "" : "text-[var(--foreground-tertiary,#808080)]"}>{assign.template || "Select Template"}</span>
                      <Icon name={openDropdown === `${assign.id}-template` ? "arrow_drop_up" : "arrow_drop_down"} size={20} className="text-[var(--foreground-secondary,#666)] shrink-0" />
                    </button>
                    {openDropdown === `${assign.id}-template` && (
                      <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setOpenDropdown(null)} />
                        <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[70] py-[4px]">
                          {TEMPLATES.map((t) => (
                            <button key={t} onClick={() => { updateAssignTemplate(assign.id, t); setOpenDropdown(null); }}
                              className={`flex items-center w-full px-[12px] py-[9px] text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] transition-colors ${assign.template === t ? "bg-[var(--litmus-25,#f1f3fe)] font-bold" : "hover:bg-[var(--surface-1,#f7f7f7)]"}`}
                              style={{ fontFamily: "Lato, sans-serif" }}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  {/* Section */}
                  <div className="relative flex-1">
                    <button
                      onClick={() => { setOpenDropdown(openDropdown === `${assign.id}-section` ? null : `${assign.id}-section`); if (errors.template) setErrors(e => ({ ...e, template: false })); }}
                      className={`flex items-center justify-between w-full h-[36px] px-[12px] rounded-[6px] border bg-white text-[13px] font-normal hover:border-[var(--foreground-secondary,#666)] outline-none transition-colors ${errors.template && idx === 0 ? "border-[var(--foreground-semantic-danger,#bb1411)]" : "border-[var(--shape-outline,rgba(0,0,0,0.1))]"}`}
                      style={{ fontFamily: "Lato, sans-serif" }}
                    >
                      <span className={assign.section ? "text-[var(--foreground-primary,#1a1a1a)]" : "text-[var(--foreground-tertiary,#808080)]"}>{assign.section || "Select Section"}</span>
                      <Icon name={openDropdown === `${assign.id}-section` ? "arrow_drop_up" : "arrow_drop_down"} size={20} className="text-[var(--foreground-secondary,#666)] shrink-0" />
                    </button>
                    {openDropdown === `${assign.id}-section` && (
                      <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setOpenDropdown(null)} />
                        <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[70] py-[4px]">
                          {assignSections.map((s) => (
                            <button key={s} onClick={() => { updateAssignSection(assign.id, s); setOpenDropdown(null); }}
                              className={`flex items-center w-full px-[12px] py-[9px] text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] transition-colors ${assign.section === s ? "bg-[var(--litmus-25,#f1f3fe)] font-bold" : "hover:bg-[var(--surface-1,#f7f7f7)]"}`}
                              style={{ fontFamily: "Lato, sans-serif" }}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>}
                {/* Provider — stacked below */}
                <div className="relative mb-[4px]">
                  <button
                    onClick={() => { setOpenDropdown(openDropdown === `${assign.id}-provider` ? null : `${assign.id}-provider`); setProviderSearches(ps => ({ ...ps, [assign.id]: "" })); }}
                    className="flex items-center justify-between w-full h-[36px] px-[12px] rounded-[6px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] bg-white text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] hover:border-[var(--foreground-secondary,#666)] outline-none transition-colors"
                    style={{ fontFamily: "Lato, sans-serif" }}
                  >
                    <span className={assign.providerCount === 0 ? "text-[var(--foreground-tertiary,#808080)]" : ""}>
                      {assign.providerCount === 0 ? "Select providers" : `Providers (${assign.providerCount})`}
                    </span>
                    <Icon name={openDropdown === `${assign.id}-provider` ? "arrow_drop_up" : "arrow_drop_down"} size={20} className="text-[var(--foreground-secondary,#666)] shrink-0" />
                  </button>
                  {openDropdown === `${assign.id}-provider` && (
                    <>
                      <div className="fixed inset-0 z-[80]" onClick={() => { setOpenDropdown(null); setProviderSearches(ps => ({ ...ps, [assign.id]: "" })); }} />
                      <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[90] py-[4px]">
                        <div className="px-[8px] pt-[4px] pb-[4px]">
                          <div className="relative flex items-center">
                            <span className="absolute left-[8px] text-[var(--foreground-secondary,#666)] pointer-events-none flex items-center"><Icon name="search" size={14} /></span>
                            <input autoFocus type="text" placeholder="Search providers" value={provSearch}
                              onChange={(e) => setProviderSearches(ps => ({ ...ps, [assign.id]: e.target.value }))}
                              className="w-full h-[28px] pl-[28px] pr-[8px] rounded-[4px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[var(--foreground-tertiary,#808080)] outline-none focus:border-[var(--accent,#1132ee)] bg-white"
                              style={{ fontFamily: "Lato, sans-serif" }} />
                          </div>
                        </div>
                        {/* Filter row */}
                        <div className="flex gap-[4px] px-[8px] pb-[6px] flex-wrap" onClick={e => e.stopPropagation()}>
                          {(['facility', 'provType', 'specialty'] as const).map((key) => {
                            const label = key === 'facility' ? 'Facility' : key === 'provType' ? 'Type' : 'Specialty';
                            const options = key === 'facility' ? PROVIDER_FACILITIES : key === 'provType' ? PROVIDER_TYPES : PROVIDER_SPECIALTIES;
                            const active = filters[key];
                            const menuKey = `${assign.id}-${key}`;
                            return (
                              <div key={key} className="relative">
                                <button
                                  onClick={e => { e.stopPropagation(); setOpenFilterMenu(openFilterMenu === menuKey ? null : menuKey); }}
                                  className={`flex items-center gap-[3px] h-[22px] px-[7px] rounded-[4px] text-[11px] font-normal border transition-colors ${active ? "border-[var(--accent,#1132ee)] text-[var(--accent,#1132ee)] bg-[var(--litmus-25,#f1f3fe)]" : "border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[var(--foreground-secondary,#666)] hover:border-[var(--foreground-secondary,#666)]"}`}
                                  style={{ fontFamily: "Lato, sans-serif" }}
                                >
                                  {active || label}
                                  {active
                                    ? <span onClick={e => { e.stopPropagation(); clearProviderFilter(assign.id, key); setOpenFilterMenu(null); }} className="ml-[2px] leading-none">×</span>
                                    : <Icon name="arrow_drop_down" size={14} className="shrink-0" />
                                  }
                                </button>
                                {openFilterMenu === menuKey && (
                                  <div className="absolute top-full left-0 mt-[2px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.12)] z-[100] py-[4px] min-w-[140px]" onClick={e => e.stopPropagation()}>
                                    {options.map(opt => (
                                      <button key={opt} onClick={e => { e.stopPropagation(); setProviderFilter(assign.id, key, opt); setOpenFilterMenu(null); }}
                                        className={`flex items-center w-full px-[10px] py-[6px] text-[12px] text-left transition-colors ${filters[key] === opt ? "bg-[var(--litmus-25,#f1f3fe)] font-bold text-[var(--accent,#1132ee)]" : "hover:bg-[var(--surface-1,#f7f7f7)] text-[var(--foreground-primary,#1a1a1a)]"}`}
                                        style={{ fontFamily: "Lato, sans-serif" }}>
                                        {opt}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          {filteredProv.length === 0 ? (
                            <p className="px-[12px] py-[8px] text-[13px] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>No providers found</p>
                          ) : (<>
                            <button onClick={() => toggleAllProviders(assign.id, filteredProv.map(u => u.id))}
                              className="flex items-center gap-[10px] w-full px-[12px] py-[7px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors text-left border-b border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                              <Checkbox state={filteredProv.every(u => assign.providerIds.includes(u.id)) ? "selected" : filteredProv.some(u => assign.providerIds.includes(u.id)) ? "indeterminate" : "unselected"} />
                              <span className="text-[13px] font-bold leading-[1.4] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFamily: "Lato, sans-serif" }}>Select all</span>
                            </button>
                            {filteredProv.map((u) => (
                              <button key={u.id} onClick={() => toggleProvider(assign.id, u.id)}
                                className="flex items-center gap-[10px] w-full px-[12px] py-[7px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors text-left">
                                <Checkbox state={assign.providerIds.includes(u.id) ? "selected" : "unselected"} />
                                <span className="text-[13px] font-normal leading-[1.4] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFamily: "Lato, sans-serif" }}>{u.name}</span>
                              </button>
                            ))}
                          </>)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {errors.template && idx === 0 && (
                  <p className="text-[12px] font-normal text-[var(--foreground-semantic-danger,#bb1411)] mt-[4px] mb-[4px]" style={{ fontFamily: "Lato, sans-serif" }}>
                    At least one template section assignment is required
                  </p>
                )}
                {idx < assignments.length - 1 && (
                  <div className="h-px w-full bg-[var(--shape-outline,rgba(0,0,0,0.1))] mt-[16px] mb-[20px]" />
                )}
              </div>
            );
          })}
          <button onClick={addAssignment} className="flex items-center gap-[4px] text-[13px] font-bold text-[var(--accent,#1132ee)] hover:opacity-80 transition-opacity mb-[4px] outline-none" style={{ fontFamily: "Lato, sans-serif" }}>
            <Icon name="add" size={16} />
            Add
          </button>
          </>)}
          </>)}

          {/* Divider */}
          <div className="h-px w-full bg-[var(--shape-outline,rgba(0,0,0,0.1))] my-[20px]" />

          {/* Macro Detail heading */}
          <button onClick={() => setDetailOpen(o => !o)} className="flex items-center justify-between w-full mb-[20px] outline-none group">
            <span className="text-[15px] font-bold leading-[1.2] tracking-[0.15px] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFeatureSettings: "'ss07' 1" }}>Macro Detail</span>
            <Icon name="expand_more" size={18} className={`text-[var(--foreground-secondary,#666)] transition-transform duration-200 ${detailOpen ? "rotate-0" : "-rotate-90"}`} />
          </button>
          {detailOpen && (<>

          {/* Macro Name + toggle */}
          <div className="mb-[24px]">
            <p className={fieldLabel} style={{ fontFeatureSettings: "'ss07' 1" }}>
              Macro Name <span className="font-normal text-[var(--foreground-secondary,#666)]">*</span>
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
              Macro Content <span className="font-normal text-[var(--foreground-secondary,#666)]">*</span>
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
          {showSelectionCriteria && (
          <div className="mb-[24px]">
            <p className={`${fieldLabel} flex items-center gap-[6px]`} style={{ fontFeatureSettings: "'ss07' 1" }}>
              Selection Criteria
              <span className="font-normal text-[var(--foreground-secondary,#666)]">*</span>
            </p>
            <p className={fieldHint}>Tell our AI under what condition this macro should be used. Applicable to Ambient users only.</p>
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
          )}

          {/* Macro Trigger Name — dictation and blended only */}
          {showTriggerName && (
            <div className="mb-[24px]">
              <p className={fieldLabel} style={{ fontFeatureSettings: "'ss07' 1" }}>
                Macro Trigger Name <span className="font-normal text-[var(--foreground-secondary,#666)]">*</span>
              </p>
              <p className={fieldHint}>The phrase a provider dictates to automatically insert this macro. Applicable to Dictation app users only.</p>
              <input
                type="text"
                value={triggerName}
                onChange={(e) => { setTriggerName(e.target.value); if (errors.triggerName) setErrors(er => ({ ...er, triggerName: false })); }}
                placeholder='e.g., "normal physical exam"'
                className={`w-full h-[36px] px-[12px] rounded-[6px] border text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[var(--foreground-tertiary,#808080)] outline-none focus:border-[var(--accent,#1132ee)] bg-white transition-colors ${errors.triggerName ? "border-[var(--foreground-semantic-danger,#bb1411)]" : "border-[var(--shape-outline,rgba(0,0,0,0.1))]"}`}
                style={{ fontFamily: "Lato, sans-serif" }}
              />
              {errors.triggerName && (
                <p className="text-[12px] font-normal text-[var(--foreground-semantic-danger,#bb1411)] mt-[4px]" style={{ fontFamily: "Lato, sans-serif" }}>
                  Macro trigger name is required
                </p>
              )}
            </div>
          )}

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
          </>)}

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

// ─── File type icon ───────────────────────────────────────────────────────────

function FileTypeIcon({ name, error }: { name: string; error: boolean }) {
  const ext = (name.split(".").pop() ?? "file").toUpperCase().slice(0, 4);

  // Default (unknown type) — accent blue
  let pageColor   = "#eceffe";
  let foldColor   = "#c2cafc";
  let textColor   = "#1132ee";
  let strokeColor = "#bdc7fb";

  if (error) {
    // danger red
    pageColor  = "#ffeaea"; foldColor  = "#ffc5c5"; textColor  = "#bb1411"; strokeColor = "#f5b0b0";
  } else if (ext === "CSV") {
    // accent blue — brand primary
    pageColor  = "#eceffe"; foldColor  = "#c2cafc"; textColor  = "#1132ee"; strokeColor = "#bdc7fb";
  } else if (ext === "XML") {
    // litmus/accent blue — same brand family, slightly deeper fold
    pageColor  = "#eceffe"; foldColor  = "#99aafc"; textColor  = "#1132ee"; strokeColor = "#adbafb";
  }

  return (
    <div className="relative shrink-0" style={{ width: 32, height: 38 }}>
      <svg width="32" height="38" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Page body */}
        <path d="M3 0H20L32 12V35C32 36.6569 30.6569 38 29 38H3C1.34315 38 0 36.6569 0 35V3C0 1.34315 1.34315 0 3 0Z" fill={pageColor} stroke={strokeColor} strokeWidth="1" />
        {/* Fold triangle */}
        <path d="M20 0L32 12H23C21.3431 12 20 10.6569 20 9V0Z" fill={foldColor} />
        {/* Fold edge line */}
        <path d="M20 0L32 12" stroke={strokeColor} strokeWidth="1" />
      </svg>
      {/* Extension label */}
      <div className="absolute inset-0 flex items-end justify-center pb-[6px]">
        <span style={{ fontSize: 8, fontWeight: 800, color: textColor, fontFamily: "Lato, sans-serif", letterSpacing: "0.3px", lineHeight: 1 }}>
          {ext}
        </span>
      </div>
    </div>
  );
}

// ─── Bulk Upload Modal ────────────────────────────────────────────────────────

type FileEntry = {
  id: string;
  file: File;
  fileType: "csv" | "xml";
  macros: Macro[];
  error: string;
  extractedProviderIds: string[];
  selectedProviderIds: string[];
  providerDropSearch: string;
  providerDropOpen: boolean;
};

type BulkUploadModalProps = {
  onClose: () => void;
  onImport: (macros: Macro[]) => void;
};

function BulkUploadModal({ onClose, onImport }: BulkUploadModalProps) {
  // Skip entrance animation when restoring from shared state (direction switch)
  const [visible, setVisible]   = useState(() => uploadStore.getBulkOpen());
  const [dragOver, setDragOver] = useState(false);
  const [entries, setEntries]   = useState<FileEntry[]>(() => uploadStore.getEntries() as FileEntry[]);
  const [dropAnchor, setDropAnchor] = useState<{ entryId: string; top: number; left: number; width: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!visible) requestAnimationFrame(() => setVisible(true)); }, []);
  useEffect(() => { uploadStore.setEntries(entries); }, [entries]);

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

  function resolveProviders(provStr: string): { assignedUserIds: string[]; allProviders: boolean; providerCount: number } {
    const s = provStr.trim();
    if (s.toLowerCase() === "all") {
      return { assignedUserIds: ALL_USER_IDS, allProviders: true, providerCount: mockUsers.length };
    }
    const names = s.split(";").map(n => n.trim()).filter(Boolean);
    const ids: string[] = [];
    for (const n of names) {
      const user = mockUsers.find(u => u.name.toLowerCase() === n.toLowerCase() || u.email.toLowerCase() === n.toLowerCase());
      if (user) ids.push(user.id);
    }
    return { assignedUserIds: ids, allProviders: false, providerCount: ids.length };
  }

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

  function parseCSVContent(content: string): Macro[] {
    const lines = content.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    return lines.slice(1).map(line => {
      const [name, assignedTo, source, providers, providerAccess] = splitCSVLine(line);
      return buildMacro({ name, assignedTo, source, providers, providerAccess });
    }).filter(m => m.name !== "Unnamed Macro" || lines.length > 1);
  }

  function parseXMLContent(content: string): Macro[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "application/xml");
    if (doc.querySelector("parsererror")) throw new Error("Invalid XML");
    const macros: Macro[] = [];

    // ── Nuance Dragon Medical format (SpeechAutoTexts / SpeechAutoText) ──
    const nuanceEls = doc.getElementsByTagNameNS("*", "SpeechAutoText");
    if (nuanceEls.length > 0) {
      for (let i = 0; i < nuanceEls.length; i++) {
        const el = nuanceEls[i];
        const getTag = (tag: string) =>
          el.getElementsByTagNameNS("*", tag)[0]?.textContent?.trim() ?? "";
        const name = getTag("Name");
        if (!name) continue;
        macros.push(buildMacro({
          name,
          assignedTo: "",
          source: "Admin",
          providers: getTag("OwningObjectName"),
          providerAccess: "unlocked",
        }));
      }
      return macros;
    }

    // ── Our custom format (<macro> elements) ──
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

  function processFile(entryId: string, file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const macros = file.name.endsWith(".csv") ? parseCSVContent(content) : parseXMLContent(content);
        if (macros.length === 0) {
          setEntries(prev => prev.map(en => en.id === entryId
            ? { ...en, error: "No macros found. Make sure the file follows the template format." }
            : en));
        } else {
          const allIds = Array.from(new Set(macros.flatMap(m => m.assignedUserIds)));
          setEntries(prev => prev.map(en => en.id === entryId
            ? { ...en, macros, extractedProviderIds: allIds, selectedProviderIds: allIds }
            : en));
        }
      } catch {
        setEntries(prev => prev.map(en => en.id === entryId
          ? { ...en, error: "Could not parse the file. Make sure it follows the template format." }
          : en));
      }
    };
    reader.readAsText(file);
  }

  function addFiles(files: File[]) {
    const newEntries: FileEntry[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      fileType: file.name.endsWith(".xml") ? "xml" : "csv",
      macros: [],
      error: (file.name.endsWith(".csv") || file.name.endsWith(".xml")) ? "" : "Only .csv and .xml files are supported.",
      extractedProviderIds: [],
      selectedProviderIds: [],
      providerDropSearch: "",
      providerDropOpen: false,
    }));
    setEntries(prev => [...prev, ...newEntries]);
    newEntries.forEach(entry => { if (!entry.error) processFile(entry.id, entry.file); });
  }

  function toggleProvider(entryId: string, userId: string) {
    setEntries(prev => prev.map(e => {
      if (e.id !== entryId) return e;
      const was = e.selectedProviderIds.includes(userId);
      return { ...e, selectedProviderIds: was ? e.selectedProviderIds.filter(id => id !== userId) : [...e.selectedProviderIds, userId] };
    }));
  }
  function toggleAllBulkProviders(entryId: string, filteredIds: string[]) {
    setEntries(prev => prev.map(e => {
      if (e.id !== entryId) return e;
      const allSelected = filteredIds.every(id => e.selectedProviderIds.includes(id));
      const next = allSelected
        ? e.selectedProviderIds.filter(id => !filteredIds.includes(id))
        : [...new Set([...e.selectedProviderIds, ...filteredIds])];
      return { ...e, selectedProviderIds: next };
    }));
  }

  function applyProvidersToAll(sourceEntryId: string) {
    const source = entries.find(e => e.id === sourceEntryId);
    if (!source) return;
    const ids = source.selectedProviderIds;
    setEntries(prev => prev.map(e => ({ ...e, selectedProviderIds: ids })));
  }

  function removeEntry(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  function downloadTemplate() {
    const rows = [
      ["Macro Name", "Assigned To", "Source", "Providers", "Provider Access", "Selection Criteria", "Macro Content"],
      ["Normal Physical Exam", "SOAP: Objective", "Admin", "All", "unlocked", "Apply for comprehensive physical exams.", "General: Patient appears well-developed, well-nourished..."],
      ["Chest Pain ROS", "SOAP: Subjective", "Admin", "Vinay Kapadia; Harrison Rolins", "locked", "Use for chest pain workup.", "Cardiovascular: Reports chest pain..."],
    ];
    const csv = rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "macro-template.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    onClose();
  }

  const validEntries = entries.filter(e => !e.error && e.macros.length > 0);
  // CSV entries are ready as-is; XML entries require provider selection
  const allReady     = validEntries.length > 0 && validEntries.every(e => e.fileType === "csv" || e.selectedProviderIds.length > 0);
  const totalMacros  = validEntries.reduce((sum, e) => sum + e.macros.length, 0);

  function handleImport() {
    if (!allReady) return;
    const allMacros = validEntries.flatMap(e =>
      e.macros.map(m => ({
        ...m,
        // XML: override providers with user selection; CSV: keep providers from file
        ...(e.fileType === "xml" ? {
          assignedUserIds: e.selectedProviderIds,
          providers: e.selectedProviderIds.length,
          allProviders: e.selectedProviderIds.length === mockUsers.length,
        } : {}),
      }))
    );
    onImport(allMacros);
    onClose();
  }

  return (
    <>
      {/* Backdrop — no click-to-close so version switcher clicks pass through */}
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-[24px]">
        <div
          className="bg-white rounded-[12px] w-full max-w-[560px] shadow-[0_8px_40px_rgba(0,0,0,0.16)] transition-all duration-200 flex flex-col max-h-[85vh]"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "scale(0.97)" }}
        >

          {/* Header */}
          <div className="flex items-start justify-between px-[24px] pt-[24px] pb-[6px] shrink-0">
            <div>
              <h2 className="text-[17px] font-bold leading-[1.2] tracking-[0.34px] text-[var(--foreground-primary,#1a1a1a)] mb-[6px]" style={{ fontFamily: "Lato, sans-serif" }}>
                Import Macros
              </h2>
              <p className="text-[13px] font-normal leading-[1.4] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>
                Import macros from a file, or download the template to build one from scratch.
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-[36px] h-[36px] rounded-[6px] text-[var(--foreground-secondary,#666)] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors outline-none shrink-0 ml-[16px]"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto scrollable px-[24px] pt-[20px] pb-[4px] flex flex-col gap-[16px]">

            {/* Upload zone — compact when files present */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files)); }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-[8px] w-full cursor-pointer transition-colors rounded-[10px] border-2 border-dashed ${
                entries.length > 0 ? "py-[14px] px-[16px]" : "py-[36px] px-[24px]"
              } ${
                dragOver
                  ? "border-[var(--accent,#1132ee)] bg-[var(--litmus-50,#e3e8fd)]"
                  : "border-[var(--litmus-100,#cfd6fc)] bg-[var(--litmus-25,#f1f3fe)] hover:border-[var(--accent,#1132ee)]"
              }`}
            >
              <Icon name="cloud_upload" size={entries.length > 0 ? 22 : 32} className="text-[var(--accent,#1132ee)]" />
              <div className="text-center">
                <p className="text-[13px] font-bold leading-[1.4] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>
                  {entries.length > 0 ? (
                    <>Add more files, or <span className="text-[var(--accent,#1132ee)]">Browse</span></>
                  ) : (
                    <>Drag and drop your files here, or <span className="text-[var(--accent,#1132ee)]">Browse</span></>
                  )}
                </p>
                <p className="text-[12px] text-[var(--foreground-tertiary,#808080)] mt-[2px]" style={{ fontFamily: "Lato, sans-serif" }}>
                  Accepted: .csv, .xml
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xml"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length > 0) addFiles(files);
                e.target.value = "";
              }}
            />

            {/* File entries */}
            {entries.length > 0 && (
              <div className="flex flex-col gap-[10px]">
                {[...entries].sort((a, b) => (a.fileType === "csv" ? 0 : 1) - (b.fileType === "csv" ? 0 : 1)).map((entry) => {
                  const filteredProviders = mockUsers.filter(u =>
                    u.name.toLowerCase().includes(entry.providerDropSearch.toLowerCase())
                  );
                  return (
                    <div
                      key={entry.id}
                      className={`rounded-[10px] border px-[14px] py-[10px] flex flex-col gap-[5px] bg-white ${
                        entry.error
                          ? "border-[var(--foreground-semantic-danger,#bb1411)]"
                          : "border-[var(--shape-outline,rgba(0,0,0,0.12))]"
                      }`}
                    >
                      {/* Main row: icon · filename+count · inline provider dropdown · remove */}
                      <div className="flex items-center gap-[10px]">
                        <FileTypeIcon name={entry.file.name} error={!!entry.error} />
                        <div className="flex-1 min-w-0">
                          <div className="relative group/filename">
                            <p className="text-[13px] font-bold leading-[1.2] text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap overflow-hidden" style={{ fontFamily: "Lato, sans-serif" }}>
                              {truncateMiddle(entry.file.name)}
                            </p>
                            {entry.file.name.length > 38 && (
                              <div className="absolute bottom-full left-0 mb-[5px] px-[8px] py-[5px] bg-[var(--neutral-100,#e6e6e6)] text-[var(--foreground-primary,#1a1a1a)] text-[12px] leading-[1.4] rounded-[5px] whitespace-nowrap pointer-events-none opacity-0 group-hover/filename:opacity-100 transition-opacity duration-75 z-50 shadow-[0_2px_8px_rgba(0,0,0,0.12)]" style={{ fontFamily: "Lato, sans-serif" }}>
                                {entry.file.name}
                              </div>
                            )}
                          </div>
                          {!entry.error && entry.macros.length > 0 && (
                            <p className="text-[12px] font-normal leading-[1.3] text-[var(--foreground-secondary,#666)] mt-[2px]" style={{ fontFamily: "Lato, sans-serif" }}>
                              {entry.macros.length} macro{entry.macros.length !== 1 ? "s" : ""} found
                            </p>
                          )}
                          {entry.error && (
                            <p className="text-[12px] font-normal leading-[1.3] text-[var(--foreground-semantic-danger,#bb1411)] mt-[2px]" style={{ fontFamily: "Lato, sans-serif" }}>
                              {entry.error}
                            </p>
                          )}
                        </div>

                        {/* Inline provider dropdown — XML only */}
                        {!entry.error && entry.fileType === "xml" && (
                          <div className="relative shrink-0 w-[178px]">
                            <button
                              onClick={(ev) => {
                                const isOpening = !entry.providerDropOpen;
                                if (isOpening) {
                                  const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
                                  setDropAnchor({ entryId: entry.id, top: rect.bottom + 4, left: rect.left, width: rect.width });
                                } else {
                                  setDropAnchor(null);
                                }
                                setEntries(prev => prev.map(e => ({
                                  ...e,
                                  providerDropOpen: e.id === entry.id ? !e.providerDropOpen : false,
                                  providerDropSearch: e.id === entry.id ? e.providerDropSearch : "",
                                })));
                              }}
                              className="flex items-center justify-between w-full h-[32px] px-[10px] rounded-[6px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] bg-white text-[13px] font-normal hover:border-[var(--foreground-secondary,#666)] outline-none transition-colors"
                              style={{ fontFamily: "Lato, sans-serif" }}
                            >
                              <span className={`truncate ${entry.selectedProviderIds.length === 0 ? "text-[var(--foreground-tertiary,#808080)]" : "text-[var(--foreground-primary,#1a1a1a)]"}`}>
                                {entry.selectedProviderIds.length === 0
                                  ? "Assign providers *"
                                  : `Providers selected (${entry.selectedProviderIds.length})`}
                              </span>
                              <Icon name={entry.providerDropOpen ? "arrow_drop_up" : "arrow_drop_down"} size={18} className="text-[var(--foreground-secondary,#666)] shrink-0 ml-[2px]" />
                            </button>

                            {entry.providerDropOpen && dropAnchor?.entryId === entry.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-[80]"
                                  onClick={() => {
                                    setDropAnchor(null);
                                    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, providerDropOpen: false, providerDropSearch: "" } : e));
                                  }}
                                />
                                <div
                                  className="bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-[4px]"
                                  style={{ position: "fixed", top: dropAnchor.top, left: dropAnchor.left, width: dropAnchor.width, zIndex: 90 }}
                                >
                                  <div className="px-[8px] pt-[4px] pb-[4px]">
                                    <div className="relative flex items-center">
                                      <span className="absolute left-[8px] text-[var(--foreground-secondary,#666)] pointer-events-none flex items-center">
                                        <Icon name="search" size={14} />
                                      </span>
                                      <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search providers"
                                        value={entry.providerDropSearch}
                                        onChange={(evv) => setEntries(prev => prev.map(en => en.id === entry.id ? { ...en, providerDropSearch: evv.target.value } : en))}
                                        className="w-full h-[28px] pl-[28px] pr-[8px] rounded-[4px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[var(--foreground-tertiary,#808080)] outline-none focus:border-[var(--accent,#1132ee)] bg-white"
                                        style={{ fontFamily: "Lato, sans-serif" }}
                                      />
                                    </div>
                                  </div>
                                  <div className="max-h-[180px] overflow-y-auto">
                                    {filteredProviders.length === 0 ? (
                                      <p className="px-[12px] py-[8px] text-[13px] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>No providers found</p>
                                    ) : (<>
                                      <button
                                        onClick={() => toggleAllBulkProviders(entry.id, filteredProviders.map(u => u.id))}
                                        className="flex items-center gap-[10px] w-full px-[12px] py-[7px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors text-left border-b border-[var(--shape-outline,rgba(0,0,0,0.1))]"
                                      >
                                        <Checkbox state={filteredProviders.every(u => entry.selectedProviderIds.includes(u.id)) ? "selected" : filteredProviders.some(u => entry.selectedProviderIds.includes(u.id)) ? "indeterminate" : "unselected"} />
                                        <span className="text-[13px] font-bold leading-[1.4] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFamily: "Lato, sans-serif" }}>Select all</span>
                                      </button>
                                      {filteredProviders.map(u => {
                                        const checked = entry.selectedProviderIds.includes(u.id);
                                        return (
                                          <button
                                            key={u.id}
                                            onClick={() => toggleProvider(entry.id, u.id)}
                                            className="flex items-center gap-[10px] w-full px-[12px] py-[7px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors text-left"
                                          >
                                            <Checkbox state={checked ? "selected" : "unselected"} />
                                            <span className="text-[13px] font-normal leading-[1.4] text-[var(--foreground-primary,#1a1a1a)]" style={{ fontFamily: "Lato, sans-serif" }}>
                                              {u.name}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </>)}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* Delete button */}
                        <button
                          onClick={() => removeEntry(entry.id)}
                          className="shrink-0 flex items-center justify-center w-[28px] h-[28px] rounded-[6px] text-[var(--foreground-secondary,#666)] hover:text-[var(--foreground-semantic-danger,#bb1411)] hover:bg-[rgba(187,20,17,0.06)] transition-colors outline-none"
                        >
                          <Icon name="delete_outline" size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Or divider */}
            <div className="flex items-center gap-[12px]">
              <div className="flex-1 h-px bg-[var(--shape-outline,rgba(0,0,0,0.1))]" />
              <span className="text-[12px] font-bold text-[var(--foreground-tertiary,#808080)]" style={{ fontFamily: "Lato, sans-serif" }}>or</span>
              <div className="flex-1 h-px bg-[var(--shape-outline,rgba(0,0,0,0.1))]" />
            </div>

            {/* Download template */}
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
          <div className="flex items-center justify-end gap-[8px] px-[24px] py-[16px] mt-[8px] border-t border-[var(--shape-outline,rgba(0,0,0,0.1))] shrink-0">
            <Button variant="secondary" size="medium" onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              size="medium"
              onClick={handleImport}
              className={!allReady ? "opacity-40 cursor-not-allowed" : ""}
            >
              Import
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}

function SiteMacros({ panelVariant = "v1" }: { panelVariant?: "v1" | "v2" | "v3" }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<User | null>(null);
  const [providerSearch, setProviderSearch] = useState("");
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [tableProvFilters, setTableProvFilters] = useState({ facility: '', specialty: '', provType: '' });
  const [tableProvFilterMenu, setTableProvFilterMenu] = useState<string | null>(null);
  const [macros, setMacros] = useState<Macro[]>(mockMacros);
  const [editingMacro, setEditingMacro] = useState<Macro | null>(() => {
    const id = uploadStore.getEditingMacroId();
    return id ? (mockMacros.find(m => m.id === id) ?? null) : null;
  });
  const [creatingMacro, setCreatingMacro] = useState(() => uploadStore.getCreatingMacro());
  useEffect(() => { uploadStore.setEditingMacroId(editingMacro?.id ?? null); }, [editingMacro]);
  useEffect(() => { uploadStore.setCreatingMacro(creatingMacro); }, [creatingMacro]);
  const [bulkUploading, setBulkUploading] = useState(() => uploadStore.getBulkOpen());
  useEffect(() => { uploadStore.setBulkOpen(bulkUploading); }, [bulkUploading]);
  const [snackbar, setSnackbar] = useState<{ count: number; visible: boolean } | null>(null);

  function showImportSnackbar(count: number) {
    setSnackbar({ count, visible: true });
    setTimeout(() => setSnackbar(s => s ? { ...s, visible: false } : null), 3000);
    setTimeout(() => setSnackbar(null), 3400);
  }
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

  const filteredProviders = mockUsers
    .filter(u => u.name.toLowerCase().includes(providerSearch.toLowerCase()))
    .filter(u => !tableProvFilters.facility  || u.facility    === tableProvFilters.facility)
    .filter(u => !tableProvFilters.specialty || u.specialty   === tableProvFilters.specialty)
    .filter(u => !tableProvFilters.provType  || u.providerType === tableProvFilters.provType)
    .sort((a, b) => a.name.localeCompare(b.name));

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
      // Always pin the 3 test macros to the top
      const testIds = ["t1", "t2", "t3"];
      const aPin = testIds.indexOf(a.id);
      const bPin = testIds.indexOf(b.id);
      if (aPin !== -1 || bPin !== -1) return (aPin === -1 ? 99 : aPin) - (bPin === -1 ? 99 : bPin);
      let cmp = 0;
      if (sortKey === "name")           cmp = a.name.localeCompare(b.name);
      if (sortKey === "assignedTo")     cmp = a.assignedTo.localeCompare(b.assignedTo);
      if (sortKey === "source")         cmp = a.source.localeCompare(b.source);
      if (sortKey === "providers")      cmp = a.providers - b.providers;
      if (sortKey === "providerAccess") cmp = a.providerAccess.localeCompare(b.providerAccess);
      if (sortKey === "status")         cmp = a.status.localeCompare(b.status);
      if (sortKey === "dateAdded")      cmp = a.dateAdded.localeCompare(b.dateAdded);
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
              <div className="fixed inset-0 z-40" onClick={() => { setProviderDropdownOpen(false); setProviderSearch(""); setTableProvFilterMenu(null); }} />
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
              {/* Filter row */}
              <div className="px-[8px] pb-[6px] border-b border-[var(--shape-outline,rgba(0,0,0,0.06))]" onClick={e => e.stopPropagation()}>
                <div className="flex flex-wrap gap-[4px]">
                  {(['facility', 'specialty', 'provType'] as const).map((key) => {
                    const label = key === 'facility' ? 'Facility' : key === 'specialty' ? 'Specialty' : 'Type';
                    const options = key === 'facility' ? PROVIDER_FACILITIES : key === 'specialty' ? PROVIDER_SPECIALTIES : PROVIDER_TYPES;
                    const active = tableProvFilters[key];
                    return (
                      <div key={key} className="relative flex-1 min-w-[60px]">
                        <button
                          onClick={e => { e.stopPropagation(); setTableProvFilterMenu(tableProvFilterMenu === key ? null : key); }}
                          className={`flex items-center justify-between gap-[3px] w-full h-[22px] px-[7px] rounded-[4px] text-[11px] font-normal border transition-colors ${active ? "border-[var(--accent,#1132ee)] text-[var(--accent,#1132ee)] bg-[var(--litmus-25,#f1f3fe)]" : "border-[var(--shape-outline,rgba(0,0,0,0.1))] text-[var(--foreground-secondary,#666)] hover:border-[var(--foreground-secondary,#666)]"}`}
                          style={{ fontFamily: "Lato, sans-serif" }}
                        >
                          <span className={active ? "truncate" : ""}>{active || label}</span>
                          {active
                            ? <span onClick={e => { e.stopPropagation(); setTableProvFilters(f => ({ ...f, [key]: '' })); setTableProvFilterMenu(null); }} className="ml-[2px] leading-none shrink-0">×</span>
                            : <Icon name="arrow_drop_down" size={14} className="shrink-0" />
                          }
                        </button>
                        {tableProvFilterMenu === key && (
                          <div className="absolute top-full left-0 mt-[2px] bg-white border border-[var(--shape-outline,rgba(0,0,0,0.1))] rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.12)] z-[100] py-[4px] min-w-[140px]" onClick={e => e.stopPropagation()}>
                            {options.map(opt => (
                              <button key={opt} onClick={e => { e.stopPropagation(); setTableProvFilters(f => ({ ...f, [key]: f[key] === opt ? '' : opt })); setTableProvFilterMenu(null); }}
                                className={`flex items-center w-full px-[10px] py-[6px] text-[12px] text-left transition-colors ${tableProvFilters[key] === opt ? "bg-[var(--litmus-25,#f1f3fe)] font-bold text-[var(--accent,#1132ee)]" : "hover:bg-[var(--surface-1,#f7f7f7)] text-[var(--foreground-primary,#1a1a1a)]"}`}
                                style={{ fontFamily: "Lato, sans-serif" }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {Object.values(tableProvFilters).some(Boolean) && (
                  <button onClick={e => { e.stopPropagation(); setTableProvFilters({ facility: '', specialty: '', provType: '' }); setTableProvFilterMenu(null); }} className="mt-[4px] text-[11px] font-normal text-[var(--foreground-secondary,#666)] hover:text-[var(--foreground-primary,#1a1a1a)] transition-colors" style={{ fontFamily: "Lato, sans-serif" }}>Clear all</button>
                )}
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
              <SortableHeader label="Template"    sortKey="assignedTo"     activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Source"      sortKey="source"         activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Providers"   sortKey="providers"      activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
              <SortableHeader label="Status"      sortKey="status"         activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Date Added"  sortKey="dateAdded"      activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
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
                  <span className="flex items-center gap-[6px]">
                    {macro.name}
                    {["t1","t2","t3"].includes(macro.id) && (
                      <span className="inline-flex items-center px-[5px] py-[1px] rounded-[4px] text-[11px] font-bold bg-[var(--neutral-100,#e8e8e8)] text-[var(--foreground-secondary,#666)]" style={{ fontFamily: "Lato, sans-serif" }}>Test</span>
                    )}
                  </span>
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
                <td className="px-[16px] py-[10px] text-[13px] font-normal leading-[1.4] tracking-[0.065px] whitespace-nowrap text-right border-b group-last:border-b-0 border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                  {(() => {
                    if (macro.assignedUserIds.length === 0) return <span className="text-[var(--foreground-secondary,#666)] italic">Unassigned</span>;
                    if (selectedProvider) return <span className="text-[var(--foreground-primary,#1a1a1a)]">{selectedProvider.name}</span>;
                    if (macro.allProviders) return <span className="text-[var(--foreground-primary,#1a1a1a)]">{`${macro.providers.toLocaleString()} (All)`}</span>;
                    if (macro.assignedUserIds.length === 1) {
                      const u = mockUsers.find(u => u.id === macro.assignedUserIds[0]);
                      return <span className="text-[var(--foreground-primary,#1a1a1a)]">{u ? u.name : macro.providers.toLocaleString()}</span>;
                    }
                    return <span className="text-[var(--foreground-primary,#1a1a1a)]">{macro.providers.toLocaleString()}</span>;
                  })()}
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
                <td className="px-[16px] py-[10px] text-[13px] font-normal leading-[1.4] tracking-[0.065px] text-[var(--foreground-secondary,#666)] whitespace-nowrap border-b group-last:border-b-0 border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                  {formatDate(macro.dateAdded)}
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
          onClose={() => { setBulkUploading(false); uploadStore.setEntries([]); }}
          onImport={(imported) => {
            setMacros(prev => [...imported, ...prev]);
            setBulkUploading(false);
            uploadStore.setEntries([]);
            showImportSnackbar(imported.length);
          }}
        />
      )}

      {/* Edit drawer */}
      {editingMacro && (
        <MacroEditDrawer
          macro={editingMacro}
          onClose={() => setEditingMacro(null)}
          onSave={(updated) => { setMacros(prev => prev.map(m => m.id === updated.id ? updated : m)); setEditingMacro(null); }}
          panelVariant={panelVariant}
        />
      )}

      {/* Create drawer */}
      {creatingMacro && (
        <MacroEditDrawer
          onClose={() => setCreatingMacro(false)}
          onCreate={(m) => { setMacros(prev => [m, ...prev]); setCreatingMacro(false); }}
          panelVariant={panelVariant}
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

      {/* Import success snackbar */}
      {snackbar && (
        <div
          className="fixed top-[24px] left-1/2 -translate-x-1/2 z-[100] flex items-center gap-[10px] px-[16px] py-[12px] rounded-[10px] bg-[var(--green-600,#3f8d43)] text-white shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-all duration-300"
          style={{ opacity: snackbar.visible ? 1 : 0, transform: `translateX(-50%) translateY(${snackbar.visible ? 0 : -8}px)`, fontFamily: "Lato, sans-serif" }}
        >
          <Icon name="check_circle" size={18} className="shrink-0" />
          <span className="text-[13px] font-bold leading-[1.2]">
            {snackbar.count} macro{snackbar.count !== 1 ? "s" : ""} imported successfully
          </span>
        </div>
      )}
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
  panelVariant?: "v1" | "v2" | "v3";
};

export default function AdminPage({ onNavClick, panelVariant = "v1" }: Props) {
  const [activeSection, setActiveSection] = useState<AdminSection>("macros-library");

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
        {activeSection === "macros-library"    && <SiteMacros panelVariant={panelVariant} />}
        {activeSection === "single-sign-on"    && <Placeholder label="Single Sign-On" />}
        {activeSection === "feedback-insights" && <Placeholder label="Feedback Insights" />}
      </div>

    </div>
  );
}
