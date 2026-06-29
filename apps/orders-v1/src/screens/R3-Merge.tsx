import React, { useState, useRef, useMemo } from "react";
import { Button, IconButton, Icon, Checkbox, Chip } from "@ds/ui";
import { ScribeLayout } from "../components/ScribeLayout";
import {
  icd10Pool, ordersPool, icd10Adjacent,
  initialIcd10, initialOrders, initialOrderSets,
  type CodeItem,
} from "../data/mockCodes";

// ─── Types ────────────────────────────────────────────────────────────────────

type FlatOrder = {
  id: string;
  label: string;
  company?: string;
  relatedIcd?: string;
  checked: boolean;
  orderSetLabel?: string;
};

type PopoverTarget = {
  rect: DOMRect;
  list: "icd10" | "order-name" | "order-icd";
  code?: string;
};

// ─── Initial data ─────────────────────────────────────────────────────────────

function buildInitialFlatOrders(): FlatOrder[] {
  const out: FlatOrder[] = initialOrders.map((o) => ({
    id: o.id,
    label: o.baseLabel ?? o.label,
    company: o.company,
    relatedIcd: o.relatedIcd,
    checked: o.checked,
  }));
  for (const set of initialOrderSets) {
    for (const child of set.children) {
      out.push({
        id: `${set.id}__${child.id}`,
        label: child.label,
        company: child.company,
        relatedIcd: child.relatedIcd ?? set.relatedIcd,
        checked: child.checked,
        orderSetLabel: set.baseLabel ?? set.label,
      });
    }
  }
  return out;
}

// ─── Evidence ─────────────────────────────────────────────────────────────────

const evidenceMap: Record<string, string[]> = {
  "R07.9":   [
    "“Patient presents with chest pain, 6/10 in severity, worse with exertion and relieved by rest.”",
    "“Pain radiating to the left arm, onset 3 days ago during yard work.”",
  ],
  "I10":     [
    "“Blood pressure 148/92 mmHg at today’s visit.”",
    "“Patient reports compliance with lisinopril 10 mg daily, but admits to high sodium diet.”",
  ],
  "E78.5":   ["“Total cholesterol 234 mg/dL, LDL 162 mg/dL on labs from last month.”"],
  "Z82.49":  [
    "“Father had a myocardial infarction at age 52.”",
    "“Maternal grandfather also had coronary artery disease in his 60s.”",
  ],
  "S93.401": [
    "“Patient twisted right ankle stepping off a curb — immediate swelling and inability to bear weight.”",
    "“Lateral ankle tenderness with positive anterior drawer sign on exam.”",
  ],
};

const ordersEvidenceMap: Record<string, string[]> = {
  "ecg-inhouse":    ["“Patient reports palpitations and exertional chest tightness — no EKG on file in the past 12 months.”"],
  "ddimer-quest":   [
    "“Pleuritic chest pain and a recent 8-hour flight raise moderate concern for PE.”",
    "“Wells score 4 — D-dimer indicated prior to further imaging.”",
  ],
  "ankle-xr-3v-radnet": [
    "“Patient unable to bear weight immediately after twisting right ankle.”",
    "“Ottawa ankle rules positive: tenderness over the posterior lateral malleolus.”",
  ],
  "set-chest-pain-quest-radnet__set-trop": [
    "“New-onset chest pain with multiple cardiac risk factors — comprehensive workup indicated.”",
    "“Hypertension, hyperlipidemia, and family history of coronary artery disease present.”",
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function R3Merge() {
  const [activeTab, setActiveTab] = useState("diagnostics");
  const [codes, setCodes] = useState<Array<CodeItem & { checked: boolean }>>(
    initialIcd10.map((c) => ({ ...c, checked: true }))
  );
  const [flatOrders, setFlatOrders] = useState<FlatOrder[]>(buildInitialFlatOrders);
  const [infoOpenCode, setInfoOpenCode] = useState<string | null>(null);
  const [infoOpenOrderId, setInfoOpenOrderId] = useState<string | null>(null);
  const [popover, setPopover] = useState<PopoverTarget | null>(null);
  const [popoverQuery, setPopoverQuery] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [dragItem, setDragItem] = useState<{ type: "code" | "order"; id: string } | null>(null);
  const [dragOverCode, setDragOverCode] = useState<string | null>(null);       // order→code drop target
  const [insertBeforeCode, setInsertBeforeCode] = useState<string | "end" | null>(null); // code reorder divider

  // Close popover on outside click
  React.useEffect(() => {
    if (!popover) return;
    function handler(e: MouseEvent | TouchEvent) {
      if (popoverRef.current?.contains(e.target as Node)) return;
      setPopover(null);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [popover]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const ordersByCode = useMemo(() => {
    const map: Record<string, FlatOrder[]> = {};
    for (const c of codes) map[c.code] = [];
    for (const o of flatOrders) {
      if (o.relatedIcd && map[o.relatedIcd]) map[o.relatedIcd].push(o);
    }
    return map;
  }, [codes, flatOrders]);

  const unlinkedOrders = useMemo(
    () => flatOrders.filter((o) => !o.relatedIcd || !codes.find((c) => c.code === o.relatedIcd)),
    [codes, flatOrders]
  );

  // ── Toggles ────────────────────────────────────────────────────────────────

  function toggleCode(code: string) {
    setCodes((prev) => prev.map((c) => c.code === code ? { ...c, checked: !c.checked } : c));
  }
  function toggleOrder(id: string) {
    setFlatOrders((prev) => prev.map((o) => o.id === id ? { ...o, checked: !o.checked } : o));
  }

  // ── Popover helpers ────────────────────────────────────────────────────────

  function openPopover(e: React.MouseEvent, list: PopoverTarget["list"], code?: string) {
    e.stopPropagation();
    setPopoverQuery("");
    setPopover({ rect: (e.currentTarget as HTMLElement).getBoundingClientRect(), list, code });
  }

  // ICD-10 code change
  function handleCodeSelect(item: CodeItem) {
    if (popover?.code) {
      // Replace existing code
      const oldCode = popover.code;
      setCodes((prev) => prev.map((c) => c.code === oldCode ? { ...c, ...item } : c));
      // Update any orders linked to old code
      setFlatOrders((prev) => prev.map((o) => o.relatedIcd === oldCode ? { ...o, relatedIcd: item.code } : o));
    } else {
      // Add new code
      if (!codes.find((c) => c.code === item.code))
        setCodes((prev) => [...prev, { ...item, checked: true }]);
    }
    setPopover(null);
  }

  // ── Drag & drop ────────────────────────────────────────────────────────────

  function onCodeDragStart(e: React.DragEvent, code: string) {
    e.dataTransfer.effectAllowed = "move";
    setDragItem({ type: "code", id: code });
  }

  function onOrderDragStart(e: React.DragEvent, orderId: string) {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    setDragItem({ type: "order", id: orderId });
  }


  function onCodeDrop(e: React.DragEvent, targetCode: string | null) {
    e.preventDefault();
    e.stopPropagation();
    if (!dragItem) return;

    if (dragItem.type === "code") {
      setCodes((prev) => {
        const from = prev.findIndex((c) => c.code === dragItem.id);
        if (from === -1) return prev;
        const next = [...prev];
        const [item] = next.splice(from, 1);
        if (targetCode === null) {
          next.push(item);
        } else {
          const to = next.findIndex((c) => c.code === targetCode);
          next.splice(to === -1 ? next.length : to, 0, item);
        }
        return next;
      });
    } else if (dragItem.type === "order" && targetCode) {
      setFlatOrders((prev) => prev.map((o) => o.id === dragItem.id ? { ...o, relatedIcd: targetCode } : o));
    }

    setDragItem(null);
    setDragOverCode(null);
    setInsertBeforeCode(null);
  }

  function onDragEnd() {
    setDragItem(null);
    setDragOverCode(null);
    setInsertBeforeCode(null);
  }

  // ── Popover content ────────────────────────────────────────────────────────

  const allChecked = codes.every((c) => c.checked) && flatOrders.every((o) => o.checked);
  const someChecked = codes.some((c) => c.checked) || flatOrders.some((o) => o.checked);
  const selectAllState = allChecked ? "selected" : someChecked ? "indeterminate" : "unselected";

  function selectAll() {
    const next = !allChecked;
    setCodes((prev) => prev.map((c) => ({ ...c, checked: next })));
    setFlatOrders((prev) => prev.map((o) => ({ ...o, checked: next })));
  }

  // ── Popover position ───────────────────────────────────────────────────────

  const popoverStyle = popover ? {
    position: "fixed" as const,
    top: popover.rect.bottom + 4,
    left: popover.rect.left,
    zIndex: 200,
  } : undefined;

  // Popover filter
  const icd10Candidates = (() => {
    const q = popoverQuery.toLowerCase();
    const pool = popover?.code
      ? icd10Pool.filter((c) => c.code !== popover.code && !codes.find((x) => x.code === c.code && x.code !== popover.code))
      : icd10Pool.filter((c) => !codes.find((x) => x.code === c.code));
    if (!q) {
      const adj = icd10Adjacent[popover?.code ?? ""] ?? [];
      const adjItems = adj.flatMap((a) => pool.filter((c) => c.code === a));
      const rest = pool.filter((c) => !adj.includes(c.code)).slice(0, 6);
      return [...adjItems, ...rest].slice(0, 8);
    }
    return pool.filter((c) => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || (c.providerLabel ?? "").toLowerCase().includes(q)).slice(0, 8);
  })();

  // ── Render helpers ─────────────────────────────────────────────────────────

  function renderDragHandle(type: "code" | "order") {
    const size = type === "code" ? "h-[28px] mt-[4px]" : "h-[28px]";
    return (
      <div className={`opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-[20px] ${size} flex items-center justify-center cursor-grab text-[var(--foreground-secondary,#666)]`}>
        <Icon name="drag_indicator" size={16} />
      </div>
    );
  }

  function renderEvidenceCard(quotes: string[], onClose: () => void) {
    return (
      <div className="bg-[var(--surface-1,#f7f7f7)] rounded-[12px] pl-[16px] pr-[12px] py-[12px] flex flex-col">
        <div className="flex items-center justify-between mb-[10px]">
          <span className="t-title-sm text-[var(--foreground-secondary,#666)]">Evidence</span>
          <IconButton size="small" variant="tertiary-neutral" icon={<Icon name="close" size={16} />} onClick={onClose} aria-label="Close evidence" />
        </div>
        {quotes.map((q, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="h-[1px] bg-[#e0e0e0] my-[10px]" />}
            <div className="flex items-start justify-between gap-[12px]">
              <span className="t-body-md text-[var(--foreground-primary,#1a1a1a)]">{q}</span>
              <span className="shrink-0 mt-[2px] text-[var(--foreground-secondary,#666)]"><Icon name="chevron_right" size={16} /></span>
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  }

  function renderOrderRow(order: FlatOrder) {
    const evidence = ordersEvidenceMap[order.id] ?? [];
    const isInfoOpen = infoOpenOrderId === order.id;
    const isDragging = dragItem?.id === order.id;

    return (
      <div key={order.id} className="flex flex-col">
        <div
          draggable
          onDragStart={(e) => onOrderDragStart(e, order.id)}
          onDragEnd={onDragEnd}
          className={`group flex items-center gap-[4px] min-h-[28px] transition-opacity ${isDragging ? "opacity-40" : ""}`}
        >
          {renderDragHandle("order")}
          <Checkbox
            state={order.checked ? "selected" : "unselected"}
            onChange={() => toggleOrder(order.id)}
          />
          <div className="flex items-center gap-[4px] pr-[4px] group-hover:bg-[var(--surface-1,#f7f7f7)] rounded-[6px]">
            {order.orderSetLabel && (
              <Chip label={order.orderSetLabel} color="neutral" size="XS" />
            )}
            <button
              className="flex items-center h-[28px] px-[8px] text-left"
            >
              <span className="t-title-md text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">
                {order.label}
              </span>
            </button>
            {order.company && (
              <Chip label={order.company} color="neutral" size="XS" />
            )}
          </div>
          <div
            className="shrink-0"
            onClick={(e) => { e.stopPropagation(); setInfoOpenOrderId((prev) => prev === order.id ? null : order.id); }}
          >
            <IconButton size="small" variant="tertiary" icon={<Icon name="info" size={16} />} aria-label="Info" />
          </div>
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <IconButton
              size="small"
              variant="tertiary-neutral"
              icon={<Icon name="close" size={16} />}
              onClick={() => setFlatOrders((prev) => prev.filter((x) => x.id !== order.id))}
              aria-label="Remove"
            />
          </div>
        </div>
        {isInfoOpen && evidence.length > 0 && (
          <div className="mt-[4px] ml-[48px]">
            {renderEvidenceCard(evidence, () => setInfoOpenOrderId(null))}
          </div>
        )}
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <ScribeLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="max-w-[640px] w-full px-[20px] py-[32px] flex flex-col gap-[24px]">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h2 className="t-title-lg text-[var(--foreground-primary,#1a1a1a)]">
            Diagnostics &amp; Orders
          </h2>
          <Button
            variant="tertiary"
            size="small"
            prefix={<Checkbox state={selectAllState} onChange={selectAll} />}
            onClick={selectAll}
          >
            Select all
          </Button>
        </div>

        {/* ── Code groups ────────────────────────────────────────────────── */}
        <div className="flex flex-col">
          {codes.map((c, i) => {
            const codeEvidence = evidenceMap[c.code] ?? [];
            const isInfoOpen = infoOpenCode === c.code;
            const codeOrders = ordersByCode[c.code] ?? [];
            const isDragTarget = dragOverCode === c.code && dragItem?.type === "order";
            const isDraggingThis = dragItem?.type === "code" && dragItem.id === c.code;

            const isInsertTarget = insertBeforeCode === c.code;

            return (
              <React.Fragment key={c.code}>
                {i > 0 && (
                  <div
                    className="h-[16px] flex items-center"
                    onDragOver={(e) => {
                      if (!dragItem || dragItem.type !== "code" || dragItem.id === c.code) return;
                      e.preventDefault();
                      e.stopPropagation();
                      setInsertBeforeCode(c.code);
                      setDragOverCode(null);
                    }}
                    onDrop={(e) => onCodeDrop(e, c.code)}
                  >
                    <div className={`w-full h-[2px] rounded-full transition-colors ${isInsertTarget ? "bg-[var(--accent,#1132ee)]" : "bg-transparent"}`} />
                  </div>
                )}
                <div
                  className={`flex flex-col gap-[4px] rounded-[8px] transition-all ${isDragTarget ? "ring-[1px] ring-[var(--accent,#1132ee)] p-[4px] -m-[4px]" : ""}`}
                  onDragOver={(e) => {
                    if (!dragItem) return;
                    e.preventDefault();
                    e.stopPropagation();
                    if (dragItem.type === "order") {
                      setDragOverCode(c.code);
                      setInsertBeforeCode(null);
                    } else if (dragItem.id !== c.code) {
                      setInsertBeforeCode(c.code);
                      setDragOverCode(null);
                    }
                  }}
                  onDrop={(e) => onCodeDrop(e, c.code)}
                >
                {/* Code header row */}
                <div
                  draggable
                  onDragStart={(e) => onCodeDragStart(e, c.code)}
                  onDragEnd={onDragEnd}
                  className={`group flex items-start gap-[4px] transition-opacity ${isDraggingThis ? "opacity-40" : ""}`}
                >
                  {renderDragHandle("code")}
                  <div className="flex items-center h-[28px] mt-[4px] shrink-0">
                    <Checkbox
                      state={c.checked ? "selected" : "unselected"}
                      onChange={() => toggleCode(c.code)}
                    />
                  </div>
                  <div
                    className="flex flex-col flex-1 px-[8px] py-[4px] rounded-[6px] group-hover:bg-[var(--surface-1,#f7f7f7)] cursor-pointer min-h-[28px] min-w-0"
                    onClick={(e) => openPopover(e, "icd10", c.code)}
                  >
                    <div className="flex items-center gap-[8px]">
                      <span
                        className="shrink-0 w-[72px] t-title-md text-[var(--foreground-brand,#1132ee)]"
                      >
                        {c.code}
                      </span>
                      <span className="t-title-md text-[var(--foreground-primary,#1a1a1a)]">
                        {c.providerLabel ?? c.description}
                      </span>
                      <div
                        className="shrink-0"
                        onClick={(e) => { e.stopPropagation(); setInfoOpenCode((prev) => prev === c.code ? null : c.code); }}
                      >
                        <IconButton size="small" variant="tertiary" icon={<Icon name="info" size={16} />} aria-label="Info" />
                      </div>
                    </div>
                    {c.providerLabel && (
                      <span className="t-body-sm text-[var(--foreground-secondary,#666)] ml-[80px]">
                        {c.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center h-[28px] mt-[4px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <IconButton
                      size="small"
                      variant="tertiary-neutral"
                      icon={<Icon name="close" size={16} />}
                      onClick={(e) => { e.stopPropagation(); setCodes((prev) => prev.filter((x) => x.code !== c.code)); }}
                      aria-label="Remove"
                    />
                  </div>
                </div>

                {/* Code evidence card */}
                {isInfoOpen && codeEvidence.length > 0 && (
                  <div className="ml-[48px] mt-[4px]">
                    {renderEvidenceCard(codeEvidence, () => setInfoOpenCode(null))}
                  </div>
                )}

                {/* Orders under this code */}
                {codeOrders.length > 0 && (
                  <div className="ml-[48px] flex flex-col gap-[4px]">
                    {codeOrders.map((order) => renderOrderRow(order))}
                  </div>
                )}
                </div>
              </React.Fragment>
            );
          })}
          {/* End drop zone */}
          <div
            className="h-[16px] flex items-center"
            onDragOver={(e) => {
              if (!dragItem || dragItem.type !== "code") return;
              e.preventDefault();
              e.stopPropagation();
              setInsertBeforeCode("end");
              setDragOverCode(null);
            }}
            onDrop={(e) => onCodeDrop(e, null)}
          >
            <div className={`w-full h-[2px] rounded-full transition-colors ${insertBeforeCode === "end" ? "bg-[var(--accent,#1132ee)]" : "bg-transparent"}`} />
          </div>
        </div>

        {/* ── Unlinked orders ─────────────────────────────────────────────── */}
        {unlinkedOrders.length > 0 && (
          <div className="flex flex-col gap-[4px]">
            <span className="t-title-sm text-[var(--foreground-secondary,#666)] mb-[4px]">
              Other orders
            </span>
            {unlinkedOrders.map((order) => renderOrderRow(order))}
          </div>
        )}

        {/* ── Actions ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-[8px]">
          <Button
            variant="tertiary"
            size="medium"
            prefix={<Icon name="add" size={20} />}
            onClick={(e) => openPopover(e, "icd10")}
            className="self-start"
          >
            Add ICD-10 code
          </Button>
          <Button
            variant="tertiary"
            size="medium"
            prefix={<Icon name="add" size={20} />}
            className="self-start"
          >
            Add order
          </Button>
        </div>
      </div>

      {/* ── Popover ──────────────────────────────────────────────────────── */}
      {popover && popover.list === "icd10" && (
        <div
          ref={popoverRef}
          style={popoverStyle}
          className="bg-white rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.12)] p-[6px] w-[320px] flex flex-col gap-[2px]"
        >
          <div className="px-[8px] py-[6px]">
            <input
              autoFocus
              value={popoverQuery}
              onChange={(e) => setPopoverQuery(e.target.value)}
              placeholder="Search ICD-10…"
              className="w-full text-[13px] outline-none bg-transparent placeholder:text-[var(--foreground-tertiary,#808080)]"
            />
          </div>
          <div className="h-[1px] bg-[var(--neutral-100,#e6e6e6)] mx-[6px]" />
          {icd10Candidates.map((item) => (
            <button
              key={item.code}
              onMouseDown={(e) => { e.preventDefault(); handleCodeSelect(item); }}
              className="flex items-center gap-[8px] min-h-[36px] py-[4px] px-[8px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] text-left"
            >
              <span className="shrink-0 w-[64px] text-[13px] font-bold leading-none tracking-[0.13px] text-[var(--accent,#1132ee)]">
                {item.code}
              </span>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)] truncate">
                  {item.providerLabel ?? item.description}
                </span>
                {item.providerLabel && (
                  <span className="t-body-xs text-[var(--foreground-secondary,#666)] truncate">
                    {item.description}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </ScribeLayout>
  );
}
