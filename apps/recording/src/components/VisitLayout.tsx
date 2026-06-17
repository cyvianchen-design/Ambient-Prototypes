import React, { useState } from "react";
import { Button, Icon, IconButton, PrimaryNav, SecondaryNavItem } from "@ds/ui";
import { useContainerWidth } from "./useContainerWidth";

type Props = { children: React.ReactNode };

const today = new Date(2026, 4, 11); // May 11, 2026

const patients = [
  { id: "1", name: "Jane Doe",         age: 38, gender: "M" as const, time: "9:00 am"  },
  { id: "2", name: "Linda Williams",   age: 53, gender: "F" as const, time: "9:30 am"  },
  { id: "3", name: "David Jones",      age: 67, gender: "M" as const, time: "10:00 am" },
  { id: "4", name: "Robert Mackenzie", age: 74, gender: "M" as const, time: "10:30 am" },
  { id: "5", name: "Richard Roe",      age: 24, gender: "M" as const, time: "11:00 am" },
  { id: "6", name: "Robert Davis",     age: 29, gender: "M" as const, time: "11:30 am" },
  { id: "7", name: "Michael Smith",    age: 41, gender: "M" as const, time: "12:00 pm" },
  { id: "8", name: "Barbara Brown",    age: 19, gender: "F" as const, time: "12:30 pm" },
];

export function VisitLayout({ children }: Props) {
  // Measure the layout's own width so the nav responds to the resizable frame
  // (container), not the browser window.
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const isOverlay = width > 0 && width < 1024;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("4");
  const [date, setDate] = useState(today);

  const isToday = date.toDateString() === today.toDateString();
  const dateLabel =
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    (isToday
      ? ", Today"
      : ", " + date.toLocaleDateString("en-US", { weekday: "short" }));

  const showNav = isOverlay ? hovering : sidebarOpen;

  // Secondary nav panel content
  const secondaryNavContent = (
    <>
      {/* Header */}
      <div className="flex items-center h-[48px] shrink-0 px-[8px] gap-[4px]">
        <button
          className="flex-1 text-left text-[15px] font-bold tracking-[0.15px] text-[var(--foreground-primary,#1a1a1a)] px-[8px] py-[4px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] outline-none"
          style={{ fontFamily: "Lato, sans-serif", fontFeatureSettings: "'ss07'" }}
        >
          {dateLabel}
        </button>
        <IconButton
          icon={<Icon name="keyboard_arrow_left" size={16} />}
          variant="tertiary-neutral"
          size="small"
          aria-label="Previous day"
          onClick={() => setDate((d) => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; })}
        />
        <IconButton
          icon={<Icon name="keyboard_arrow_right" size={16} />}
          variant="tertiary-neutral"
          size="small"
          aria-label="Next day"
          onClick={() => setDate((d) => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; })}
        />
      </div>

      {/* Patient list */}
      <div className="flex-1 overflow-y-auto">
        {patients.map((p) => (
          <SecondaryNavItem
            key={p.id}
            name={p.name}
            age={p.age}
            gender={p.gender}
            time={p.time}
            isSelected={selectedPatient === p.id}
            onClick={() => setSelectedPatient(p.id)}
          />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="shrink-0 p-[12px]">
        <Button
          variant="primary"
          size="medium"
          prefix={<Icon name="mic" size={16} filled />}
          className="w-full"
        >
          Start Instant Visit
        </Button>
      </div>
    </>
  );

  return (
    <div ref={ref} className="flex h-full overflow-hidden bg-white">
      {/* Hover wrapper — handles overlay show/hide */}
      <div
        className="shrink-0 relative flex"
        onMouseEnter={() => isOverlay && setHovering(true)}
        onMouseLeave={() => isOverlay && setHovering(false)}
      >
        {/* Primary nav */}
        <PrimaryNav
          activeItem="visits"
          onLogoClick={isOverlay ? undefined : () => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
        />

        {/* Secondary nav panel */}
        {isOverlay ? (
          // Overlay mode: absolute, fades in/out on hover
          <div
            className={`absolute left-[72px] top-0 h-full w-[220px] z-50 shadow-lg flex flex-col bg-white border-r border-[var(--shape-outline,rgba(0,0,0,0.1))] transition-opacity duration-150 ${
              showNav ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {secondaryNavContent}
          </div>
        ) : (
          // Large screen: inline, width animates open/closed
          <div
            className={`overflow-hidden bg-white border-r border-[var(--shape-outline,rgba(0,0,0,0.1))] transition-all duration-200 ${
              sidebarOpen ? "w-[220px]" : "w-0"
            }`}
          >
            <div className="flex flex-col h-full min-w-[220px]">
            {secondaryNavContent}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
