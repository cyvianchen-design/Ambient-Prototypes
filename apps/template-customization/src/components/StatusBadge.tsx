import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon, Menu, MenuItem } from "@ds/ui";
import { SubsectionStatus } from "../templateData";

const STATUS_STYLES: Record<SubsectionStatus, { bg: string; text: string; label: string }> = {
  standard: { bg: "bg-[#edf7ee] hover:bg-[#e0f0e2]", text: "text-[#2f6a32]", label: "Standard" },
  optional: { bg: "bg-[#fef5d1] hover:bg-[#faedbc]", text: "text-[#645519]", label: "Optional" },
  disabled: { bg: "bg-[#f2f2f2] hover:bg-[#e8e8e8]", text: "text-[#666]", label: "Disabled" },
};

export function StatusBadge({
  status,
  options,
  onChange,
}: {
  status: SubsectionStatus;
  options: SubsectionStatus[];
  onChange: (s: SubsectionStatus) => void;
}) {
  const s = STATUS_STYLES[status];
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    if (open) { setOpen(false); return; }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ top: rect.bottom + 4, left: rect.left });
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
    <>
      <button
        ref={triggerRef}
        onClick={handleOpen}
        className={`h-[24px] flex items-center gap-[2px] pl-[8px] pr-[4px] rounded-[8px] shrink-0 text-[12px] font-bold tracking-[0.24px] transition-colors ${s.bg} ${s.text}`}
        style={{ fontFamily: "Lato" }}
      >
        {s.label}
        <Icon name="arrow_drop_down" size={16} />
      </button>
      {open && pos && createPortal(
        <div ref={menuRef} style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 300 }}>
          <Menu className="w-[160px]">
            {options.map((opt) => (
              <MenuItem
                key={opt}
                label={STATUS_STYLES[opt].label}
                selected={opt === status}
                onClick={() => { onChange(opt); setOpen(false); }}
              />
            ))}
          </Menu>
        </div>,
        document.body
      )}
    </>
  );
}
