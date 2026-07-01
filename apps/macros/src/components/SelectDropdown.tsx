import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon, Menu, MenuItem, TextField } from "@ds/ui";

export type SelectOption = string | { value: string; label: string; description?: string };

type MenuPos = { top?: number; bottom?: number; left: number; width: number };

export function SelectDropdown({
  value,
  options,
  onChange,
  width = "w-[100px]",
  menuWidth,
}: {
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  width?: string;
  menuWidth?: number;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o, description: undefined } : o
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
