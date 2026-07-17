import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon, Menu, MenuItem, TextField } from "@ds/ui";

export type SelectOption = string | { value: string; label: string; description?: string; icon?: string };

type MenuPos = { top?: number; bottom?: number; left: number; width: number };

export function SelectDropdown({
  value,
  options,
  onChange,
  width = "w-[100px]",
  menuWidth,
  variant = "field",
  chipDimmed,
}: {
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  width?: string;
  menuWidth?: number;
  variant?: "field" | "chip";
  chipDimmed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o, description: undefined, icon: undefined } : o
  );
  const current = normalized.find((o) => o.value === value);

  function handleOpen() {
    if (open) { setOpen(false); return; }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Estimate menu height: each item is ~36px (44 with description), plus 12px padding
    const itemH = normalized.some((o) => o.description) ? 52 : 36;
    const menuH = normalized.length * itemH + 12;
    const spaceBelow = window.innerHeight - rect.bottom;
    setPos({
      left: rect.left,
      width: rect.width,
      ...(spaceBelow < menuH + 8
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  if (variant === "chip") {
    return (
      <>
        <button
          ref={triggerRef as React.RefObject<HTMLButtonElement>}
          onClick={handleOpen}
          className={`rounded-[6px] pl-[8px] pr-[4px] h-[24px] flex items-center gap-[2px] text-[12px] leading-[1.2] transition-colors ${
            chipDimmed ? "bg-[#f2f2f2] text-[#999] hover:bg-[#e8e8e8]" : "bg-[#f2f2f2] text-[#1a1a1a] hover:bg-[#e8e8e8]"
          }`}
          style={{ fontFamily: "Lato" }}
        >
          <span className="truncate">{current?.label ?? value}</span>
          <Icon name="arrow_drop_down" size={16} />
        </button>
        {open && pos && createPortal(
          <div
            ref={menuRef}
            data-select-menu="true" style={{ position: "fixed", top: pos.top, bottom: pos.bottom, left: pos.left, width: menuWidth ?? 180, zIndex: 300 }}
          >
            <Menu className="w-full">
              {normalized.map((opt) => (
                <MenuItem
                  key={opt.value}
                  label={opt.label}
                  description={opt.description}
                  icon={opt.icon ? <Icon name={opt.icon} size={16} /> : undefined}
                  selected={opt.value === value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                />
              ))}
            </Menu>
          </div>,
          document.body
        )}
      </>
    );
  }

  return (
    <div ref={triggerRef} className={width}>
      <TextField
        value={current?.label ?? value}
        readOnly
        size="S"
        suffix={
          <span className="text-[var(--foreground-secondary,#666)] flex items-center">
            <Icon name="arrow_drop_down" size={16} />
          </span>
        }
        onClick={handleOpen}
        className="w-full"
      />
      {open && pos && createPortal(
        <div
          ref={menuRef}
          data-select-menu="true"
          style={{
            position: "fixed",
            top: pos.top,
            bottom: pos.bottom,
            left: pos.left,
            width: menuWidth ?? pos.width,
            zIndex: 300,
          }}
        >
          <Menu className="w-full">
            {normalized.map((opt) => (
              <MenuItem
                key={opt.value}
                label={opt.label}
                description={opt.description}
                icon={opt.icon ? <Icon name={opt.icon} size={16} /> : undefined}
                selected={opt.value === value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              />
            ))}
          </Menu>
        </div>,
        document.body
      )}
    </div>
  );
}
