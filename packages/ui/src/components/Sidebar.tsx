import React from "react";

export type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  notification?: number;
};

export type SidebarProps = {
  logo?: React.ReactNode;
  items: NavItem[];
  bottomItems?: NavItem[];
  userInitial?: string;
  userColor?: "Orange" | "Blue" | "Red" | "Indigo" | "Purple" | "Green" | "Teal";
  onItemClick?: (id: string) => void;
  className?: string;
};

const avatarBg: Record<string, string> = {
  Orange: "bg-[var(--orange-200,#ffd699)]",
  Blue:   "bg-[var(--blue-100,#d1e6fa)]",
  Red:    "bg-[var(--red-100,#fbd1d0)]",
  Indigo: "bg-[var(--litmus-100,#cfd6fc)]",
  Purple: "bg-[var(--purple-100,#e2daef)]",
  Green:  "bg-[var(--green-200,#b9dfbb)]",
  Teal:   "bg-[var(--cyan-200,#b6e6ee)]",
};

export function Sidebar({
  logo,
  items,
  bottomItems = [],
  userInitial = "A",
  userColor = "Orange",
  onItemClick,
  className = "",
}: SidebarProps) {
  const bg = avatarBg[userColor] ?? avatarBg.Orange;

  return (
    <div className={`flex flex-col w-[56px] bg-white border-r border-[var(--shape-outline,rgba(0,0,0,0.1))] h-full shrink-0 ${className}`}>
      {/* Logo */}
      <div className="flex items-center justify-center h-[56px] shrink-0 border-b border-[var(--shape-outline,rgba(0,0,0,0.1))]">
        {logo ?? <div className="w-[36px] h-[36px] rounded-[6px] bg-[var(--litmus-500,#1132ee)]" />}
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col flex-1 py-[4px] overflow-y-auto">
        {items.map((item) => (
          <NavButton key={item.id} item={item} onClick={() => onItemClick?.(item.id)} />
        ))}
      </nav>

      {/* Bottom nav + avatar */}
      <div className="flex flex-col py-[4px] border-t border-[var(--shape-outline,rgba(0,0,0,0.1))]">
        {bottomItems.map((item) => (
          <NavButton key={item.id} item={item} onClick={() => onItemClick?.(item.id)} />
        ))}
        <div className="flex items-center justify-center py-[8px]">
          <div className={`w-[36px] h-[36px] rounded-full ${bg} flex items-center justify-center t-title-lg text-[var(--foreground-primary,#1a1a1a)]`}>
            {userInitial}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavButton({ item, onClick }: { item: NavItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex flex-col items-center gap-[2px] py-[6px] transition-colors relative outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--litmus-100,#cfd6fc)]
        ${item.isActive ? "text-[var(--accent,#1132ee)]" : "text-[var(--foreground-secondary,#666)]"}`}
      style={{ fontFeatureSettings: "'ss07'" }}
    >
      {/* Icon container */}
      <div className={`w-[36px] h-[36px] rounded-[6px] flex items-center justify-center relative shrink-0 transition-colors
        ${item.isActive ? "bg-[rgba(17,50,238,0.12)]" : "group-hover:bg-[rgba(0,0,0,0.05)]"}`}>
        <div className="w-[20px] h-[20px] flex items-center justify-center overflow-hidden">
          {item.icon}
        </div>
        {item.notification != null && item.notification > 0 && (
          <span className="absolute -top-[3px] -right-[3px] min-w-[16px] h-[16px] bg-[var(--foreground-semantic-danger,#bb1411)] border border-white text-white text-[10px] font-bold rounded-full flex items-center justify-center px-[3px]">
            {item.notification}
          </span>
        )}
      </div>
      {/* Label */}
      <span className="text-[12px] font-bold leading-[1.2] tracking-[-0.36px] whitespace-nowrap">
        {item.label}
      </span>
    </button>
  );
}
