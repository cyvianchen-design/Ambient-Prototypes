import React, { useState, useEffect } from "react";

export type Tab = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  notification?: number;
};

export type TabsProps = {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: "primary" | "secondary";
  className?: string;
};

export function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledTab,
  onTabChange,
  variant = "primary",
  className = "",
}: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultTab ?? tabs[0]?.id);
  const activeTab = controlledTab ?? internalTab;

  useEffect(() => {
    if (defaultTab) setInternalTab(defaultTab);
  }, [defaultTab]);

  const handleClick = (id: string) => {
    setInternalTab(id);
    onTabChange?.(id);
  };

  const isPrimary = variant === "primary";

  return (
    <div
      className={`flex gap-[8px] items-center ${
        isPrimary ? "border-b border-[var(--shape-outline,rgba(0,0,0,0.1))]" : "py-[4px]"
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => handleClick(tab.id)}
            className={`group flex items-center shrink-0 transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--litmus-100,#cfd6fc)]
              ${isPrimary
                ? `gap-[4px] px-[4px] py-[6px] border-b-2 ${isActive ? "border-[var(--foreground-brand,#1132ee)]" : "border-transparent"}`
                : `gap-[6px] h-[28px] px-[8px] rounded-[8px] ${isActive ? "bg-[var(--litmus-25,#f1f3fe)]" : "hover:bg-[var(--surface-1,#f7f7f7)]"}`
              }`}
            style={{ fontFeatureSettings: "'ss07'" }}
          >
            {tab.icon && <span className="flex items-center">{tab.icon}</span>}
            <span
              className={`whitespace-nowrap
                ${isPrimary
                  ? `t-title-sm ${isActive ? "text-[var(--foreground-brand,#1132ee)]" : "text-[var(--foreground-tertiary,#808080)] group-hover:text-[var(--foreground-brand,#1132ee)]"}`
                  : isActive
                    ? "t-title-sm text-[var(--foreground-brand,#1132ee)]"
                    : "t-body-sm text-[var(--foreground-secondary,#666)] group-hover:text-[var(--foreground-primary,#1a1a1a)]"
                }`}
            >
              {tab.label}
            </span>
            {tab.notification != null && tab.notification > 0 && (
              <span className="w-5 h-5 bg-[var(--foreground-semantic-danger,#bb1411)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {tab.notification}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
