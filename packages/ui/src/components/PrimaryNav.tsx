import React from "react";
import { AmbientLogo } from "../icons/AmbientLogo";
import { Icon } from "./Icon";
import { MagicDocument } from "../icons/MagicDocument";
import { MagicEdit } from "../icons/MagicEdit";
import { MagicButton } from "../icons/MagicButton";

export type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  notification?: number;
};

export type PrimaryNavActiveItem = "visits" | "scribes" | "customize" | "assistant" | "admin";

export type PrimaryNavProps = {
  activeItem?: PrimaryNavActiveItem;
  logo?: React.ReactNode;
  items?: NavItem[];
  bottomItems?: NavItem[];
  userInitial?: string;
  userColor?: "Orange" | "Blue" | "Red" | "Indigo" | "Purple" | "Green" | "Teal";
  onItemClick?: (id: string) => void;
  onLogoClick?: () => void;
  sidebarOpen?: boolean;
  className?: string;
};

const defaultBottomItems: NavItem[] = [
  { id: "help",     label: "Help",     icon: <Icon name="help" size={20} /> },
  { id: "settings", label: "Settings", icon: <Icon name="settings" size={20} /> },
];

const avatarBg: Record<string, string> = {
  Orange: "bg-[var(--orange-200,#ffd699)]",
  Blue:   "bg-[var(--blue-100,#d1e6fa)]",
  Red:    "bg-[var(--red-100,#fbd1d0)]",
  Indigo: "bg-[var(--litmus-100,#cfd6fc)]",
  Purple: "bg-[var(--purple-100,#e2daef)]",
  Green:  "bg-[var(--green-200,#b9dfbb)]",
  Teal:   "bg-[var(--cyan-200,#b6e6ee)]",
};

function buildDefaultItems(activeItem?: PrimaryNavActiveItem): NavItem[] {
  return [
    { id: "visits",    label: "Visits",    icon: <Icon name="stethoscope" size={20} filled />, isActive: activeItem === "visits" },
    { id: "scribes",   label: "Scribes",   icon: <MagicDocument size={20} />,                  isActive: activeItem === "scribes" },
    { id: "customize", label: "Customize", icon: <MagicEdit size={20} />,                      isActive: activeItem === "customize" },
    { id: "assistant", label: "Assistant", icon: <MagicButton size={20} />,                    isActive: activeItem === "assistant" },
    { id: "admin",     label: "Admin",     icon: <Icon name="analytics" size={20} filled />,   isActive: activeItem === "admin" },
  ];
}

export function PrimaryNav({
  activeItem,
  logo,
  items,
  bottomItems,
  userInitial = "A",
  userColor = "Orange",
  onItemClick,
  onLogoClick,
  sidebarOpen,
  className = "",
}: PrimaryNavProps) {
  const resolvedItems = items ?? buildDefaultItems(activeItem);
  const resolvedBottomItems = bottomItems ?? defaultBottomItems;
  const bg = avatarBg[userColor] ?? avatarBg.Orange;

  return (
    <div className={`flex flex-col w-[72px] bg-[var(--surface-1,#f7f7f7)] border-r border-[var(--shape-outline,rgba(0,0,0,0.1))] h-full shrink-0 ${className}`}>

      {/* Logo */}
      {onLogoClick ? (
        <button
          onClick={onLogoClick}
          className="group flex items-center justify-center h-[48px] shrink-0 px-[8px] w-full outline-none rounded-[6px] hover:bg-[rgba(0,0,0,0.03)]"
        >
          <span className="group-hover:hidden">
            {logo ?? <AmbientLogo size={28} />}
          </span>
          <span className="hidden group-hover:flex items-center justify-center text-[var(--foreground-secondary,#666)]">
            <Icon name={sidebarOpen === false ? "left_panel_open" : "left_panel_close"} size={20} />
          </span>
        </button>
      ) : (
        <div className="flex items-center justify-center h-[48px] shrink-0 px-[8px]">
          {logo ?? <AmbientLogo size={28} />}
        </div>
      )}

      {/* Divider */}
      <div className="h-px w-full bg-[var(--shape-outline,rgba(0,0,0,0.1))] shrink-0" />

      {/* Primary nav items */}
      <nav className="flex flex-col flex-1 gap-[24px] px-[4px] py-[16px] overflow-y-auto">
        {resolvedItems.map((item) => (
          <PrimaryNavButton key={item.id} item={item} onClick={() => onItemClick?.(item.id)} />
        ))}
      </nav>

      {/* Divider */}
      <div className="h-px w-full bg-[var(--shape-outline,rgba(0,0,0,0.1))] shrink-0" />

      {/* Footer: utility items + avatar */}
      <div className="flex flex-col items-center gap-[8px] pt-[16px] pb-[24px] shrink-0">
        {resolvedBottomItems.map((item) => (
          <UtilityNavButton key={item.id} item={item} onClick={() => onItemClick?.(item.id)} />
        ))}
        {/* Avatar — 40px touch target, 36px visual */}
        <button className="w-[40px] h-[40px] flex items-center justify-center rounded-[6px] outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--litmus-100,#cfd6fc)]">
          <div
            className={`w-[36px] h-[36px] shrink-0 rounded-full ${bg} flex items-center justify-center t-title-lg text-[var(--foreground-primary,#1a1a1a)] overflow-hidden`}
          >
            {userInitial}
          </div>
        </button>
      </div>

    </div>
  );
}

function PrimaryNavButton({ item, onClick }: { item: NavItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex flex-col items-center gap-[2px] transition-colors relative outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--litmus-100,#cfd6fc)]
        ${item.isActive ? "text-[var(--accent,#1132ee)]" : "text-[var(--foreground-secondary,#666)]"}`}
      style={{ fontFeatureSettings: "'ss07'" }}
    >
      <div className={`w-[36px] h-[36px] rounded-[6px] flex items-center justify-center relative shrink-0 transition-colors
        ${item.isActive ? "bg-[rgba(17,50,238,0.12)]" : "group-hover:bg-[rgba(0,0,0,0.05)]"}`}>
        {item.icon}
        {item.notification != null && item.notification > 0 && (
          <span className="absolute -top-[3px] -right-[3px] min-w-[16px] h-[16px] bg-[var(--foreground-semantic-danger,#bb1411)] border border-[var(--surface-1,#f7f7f7)] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-[3px] leading-none">
            {item.notification}
          </span>
        )}
      </div>
      <span className="text-[12px] font-bold leading-[1.2] tracking-[-0.36px] whitespace-nowrap">
        {item.label}
      </span>
    </button>
  );
}

function UtilityNavButton({ item, onClick }: { item: NavItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group w-[36px] h-[36px] flex items-center justify-center transition-colors relative outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--litmus-100,#cfd6fc)]
        ${item.isActive ? "text-[var(--accent,#1132ee)]" : "text-[var(--foreground-secondary,#666)]"}`}
    >
      <div className={`w-[28px] h-[28px] rounded-[6px] flex items-center justify-center transition-colors
        ${item.isActive ? "bg-[rgba(17,50,238,0.12)]" : "group-hover:bg-[rgba(0,0,0,0.05)]"}`}>
        {item.icon}
      </div>
    </button>
  );
}
