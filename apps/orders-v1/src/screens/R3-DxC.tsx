import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button, IconButton, Icon, Checkbox, Chip, Badge, Menu, MenuItem, MenuHeader, MenuSearch } from "@ds/ui";
import { ScribeLayout } from "../components/ScribeLayout";
import type { CodeItem as CodeItemType } from "../data/mockCodes";
import {
  icd10Pool, ordersPool, ordersAdjacent, icd10Adjacent,
  initialIcd10, initialOrders, initialOrderSets,
  type CodeItem,
} from "../data/mockCodes";

function CodeMenuItem({ item, onSelect }: { item: CodeItemType; onSelect: (item: CodeItemType) => void }) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onSelect(item); }}
      className="flex items-center w-full gap-[8px] min-h-[36px] py-[4px] px-[8px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors text-left"
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
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type FlatOrder = {
  id: string; label: string; company?: string; relatedIcd?: string;
  checked: boolean; fromOrderSet?: string; confidence: "high" | "low"; precharted?: boolean;
};

type EvidenceItem =
  | { kind: "quote"; source: "note" | "transcript"; text: string }
  | { kind: "orderset"; setName: string }
  | { kind: "reason"; text: string };

type PopoverTarget = {
  rect: DOMRect; list: "icd10" | "order" | "reassign" | "order-company"; code?: string; orderId?: string;
};

// ─── Confidence ─────────────────────────────────────────────────────────────────

const highConfidenceCodes = new Set(["R07.9", "I10", "S93.401"]);
const highConfidenceLabels = new Set([
  "ECG 12-lead", "D-Dimer", "Troponin I, High-Sensitivity",
  "Chest X-ray, PA & Lateral", "Ankle X-ray, 3 views",
]);

// ─── Pre-charted mock ───────────────────────────────────────────────────────────

const preChartedOrders: FlatOrder[] = [
  { id: "lisinopril-refill", label: "Lisinopril 10mg refill", relatedIcd: "I10", checked: false, confidence: "high", precharted: true },
  { id: "lipid-panel-charted", label: "Lipid Panel", company: "Quest", relatedIcd: "E78.5", checked: false, confidence: "low", precharted: true },
];

// ─── Evidence data ───────────────────────────────────────────────────────────────

const codeEvidenceMap: Record<string, EvidenceItem[]> = {
  "R07.9": [
    { kind: "quote", source: "note", text: `"58-year-old male with 3-day history of pressure-like chest pain, 6/10, onset during yard work — radiating to the left arm, exertional, partially relieved by rest."` },
    { kind: "quote", source: "note", text: `"Associated palpitations noted. BP 148/92 on arrival. Positive family history of MI. ACS workup initiated."` },
  ],
  "I10": [
    { kind: "quote", source: "note", text: `"BP 148/92 mmHg on today's visit despite reported adherence to lisinopril 10 mg daily."` },
    { kind: "quote", source: "note", text: `"Patient admits to high-sodium diet. Medication compliance confirmed verbally."` },
  ],
  "E78.5": [
    { kind: "quote", source: "note", text: `"Total cholesterol 234 mg/dL, LDL 162 mg/dL on labs from last month."` },
  ],
  "Z82.49": [
    { kind: "quote", source: "note", text: `"Father had a myocardial infarction at age 52."` },
    { kind: "quote", source: "note", text: `"Maternal grandfather had coronary artery disease in his 60s."` },
  ],
  "S93.401": [
    { kind: "quote", source: "note", text: `"Patient twisted right ankle stepping off a curb yesterday — immediate swelling and inability to bear weight."` },
    { kind: "quote", source: "note", text: `"Ottawa ankle rules positive: posterior lateral malleolus tenderness confirmed on exam."` },
  ],
};

const individualOrderEvidence: Record<string, EvidenceItem[]> = {
  "ecg-inhouse": [
    { kind: "quote", source: "note", text: `"ECG ordered urgently — exertional chest pain with radiation to left arm, palpitations reported, and no EKG on file in the past 12 months."` },
    { kind: "quote", source: "transcript", text: `"I'm going to order an ECG right now — you mentioned the tightness gets worse when you exert yourself, and I want to check for any electrical changes."` },
  ],
  "ddimer-quest": [
    { kind: "quote", source: "note", text: `"D-dimer ordered: Wells score 4, pleuritic chest pain component, and recent 8-hour flight. CT-PA deferred pending D-dimer result."` },
    { kind: "quote", source: "transcript", text: `"Pleuritic chest pain and a recent 8-hour flight raise moderate concern for PE — Wells score 4, D-dimer indicated prior to further imaging."` },
  ],
  "ankle-xr-3v-radnet": [
    { kind: "quote", source: "note", text: `"Ottawa ankle rules positive: posterior lateral malleolus tenderness confirmed on exam. X-ray ordered to rule out fracture."` },
    { kind: "quote", source: "transcript", text: `"Ottawa ankle rules positive: tenderness over the posterior lateral malleolus."` },
  ],
  // Orderset children — Chest Pain Workup
  "set-chest-pain-quest-radnet__set-trop": [
    { kind: "quote", source: "note", text: `"Troponin I ordered to rule out ACS — exertional chest pain with radiation to left arm, positive family history, and 3-day onset constitute moderate-to-high pre-test probability."` },
  ],
  "set-chest-pain-quest-radnet__set-cxr-pa": [
    { kind: "quote", source: "note", text: `"Chest X-ray PA & Lateral ordered to evaluate for pneumothorax, aortic pathology, and cardiomegaly in the setting of acute chest pain."` },
  ],
  "set-chest-pain-quest-radnet__set-bmp": [
    { kind: "reason", text: "BMP is part of the Chest Pain Workup orderset. Not independently indicated today — electrolytes checked 4 months ago with no abnormalities, no diuretic use, and no known renal disease. Included for provider review." },
  ],
  "set-chest-pain-quest-radnet__set-cbc": [
    { kind: "reason", text: "CBC is part of the Chest Pain Workup orderset. No current signs of infection, anemia, or hematologic concern — CBC was within normal limits 4 months ago. Included for provider review." },
  ],
  // Standalone suggested orders
  "holter-mock": [
    { kind: "quote", source: "transcript", text: `"I also want to keep an eye on the heart rhythm over time — we'll set you up with a Holter monitor to wear for 24 hours."` },
    { kind: "reason", text: "Holter monitor requested by provider. Palpitations were incidental in the context of exertional chest pain — a primary rhythm disorder was not the dominant concern at today's visit. Placed under Suggested pending provider review." },
  ],
  "inr-mock": [
    { kind: "reason", text: "INR / Prothrombin Time not directly indicated by today's presentation. Patient is not on anticoagulation therapy and has no documented bleeding concern or coagulopathy. Placed under Suggested pending provider review." },
  ],
};

const orderSetQuotes: Record<string, Array<{ source: "note" | "transcript"; text: string }>> = {
  "set-chest-pain-quest-radnet": [
    { source: "transcript", text: `"Let's go ahead and get some standard tests and imaging for your chest pain — I want to make sure we're not missing anything."` },
    { source: "transcript", text: `"Given everything you've described and your history, I'd like to run a full chest pain workup today."` },
  ],
};

function getOrderEvidence(order: FlatOrder): EvidenceItem[] {
  if (order.fromOrderSet) {
    const setId = order.id.split("__")[0];
    const quotes = orderSetQuotes[setId] ?? [];
    const childExtra = individualOrderEvidence[order.id] ?? [];
    return [
      { kind: "orderset", setName: order.fromOrderSet },
      ...quotes.map((q): EvidenceItem => ({ kind: "quote", source: q.source, text: q.text })),
      ...childExtra,
    ];
  }
  return individualOrderEvidence[order.id] ?? [];
}

function buildInitialFlatOrders(): FlatOrder[] {
  const out: FlatOrder[] = initialOrders.map((o) => ({
    id: o.id, label: o.baseLabel ?? o.label, company: o.company, relatedIcd: o.relatedIcd,
    checked: false, confidence: highConfidenceLabels.has(o.baseLabel ?? o.label) ? "high" : "low",
  }));
  for (const set of initialOrderSets) {
    for (const child of set.children) {
      out.push({
        id: `${set.id}__${child.id}`, label: child.label, company: child.company,
        relatedIcd: child.relatedIcd ?? set.relatedIcd, checked: false,
        fromOrderSet: set.baseLabel ?? set.label,
        confidence: highConfidenceLabels.has(child.label) ? "high" : "low",
      });
    }
  }
  out.push(
    { id: "holter-mock", label: "Holter Monitor, 24-hr", company: "In-house", relatedIcd: "R07.9", checked: false, confidence: "low" as const },
    { id: "inr-mock", label: "INR / Prothrombin Time", company: "Quest", relatedIcd: "I10", checked: false, confidence: "low" as const },
  );
  out.push(...preChartedOrders);
  return out;
}

// ─── Component ──────────────────────────────────────────────────────────────────
// Direction C: Confidence tiers within each Dx group.
// Within each group: high-confidence orders (no label, clean rows) → divider →
// "needs review" orders (small "Review" tag) → (if any) pre-charted (disabled, "In chart").

export default function R3DxC() {
  const [activeTab, setActiveTab] = useState("diagnostics");
  const [infoOpenCode, setInfoOpenCode] = useState<string | null>(null);
  const [infoOpenOrderId, setInfoOpenOrderId] = useState<string | null>(null);
  const [icd10, setIcd10] = useState<Array<CodeItem & { checked: boolean }>>(
    initialIcd10.map((c) => ({ ...c, checked: false }))
  );
  const [flatOrders, setFlatOrders] = useState<FlatOrder[]>(buildInitialFlatOrders);
  const [leavingOrders, setLeavingOrders] = useState<FlatOrder[]>([]);
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);
  const [popover, setPopover] = useState<PopoverTarget | null>(null);
  const [popoverQuery, setPopoverQuery] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popover) return;
    setPopoverQuery("");
    const onMouseDown = (e: MouseEvent) => { if (!popoverRef.current?.contains(e.target as Node)) setPopover(null); };
    const onScroll = (e: Event) => { if (!popoverRef.current?.contains(e.target as Node)) setPopover(null); };
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", onScroll, true);
    return () => { document.removeEventListener("mousedown", onMouseDown); window.removeEventListener("scroll", onScroll, true); };
  }, [popover]);

  function openPopover(e: React.MouseEvent, list: PopoverTarget["list"], code?: string, orderId?: string) {
    e.stopPropagation();
    setPopover({ rect: (e.currentTarget as HTMLElement).getBoundingClientRect(), list, code, orderId });
  }

  // ── ICD-10 handlers ──────────────────────────────────────────────────────────

  function handleIcd10Select(item: CodeItem) {
    if (popover?.list === "reassign" && popover.orderId) {
      setFlatOrders((prev) => prev.map((o) => o.id === popover.orderId ? { ...o, relatedIcd: item.code } : o));
      if (!icd10.find((c) => c.code === item.code))
        setIcd10((prev) => [...prev, { ...item, checked: false }]);
    } else if (popover?.code) {
      const old = popover.code;
      setIcd10((prev) => prev.map((c) => c.code === old ? { ...item, checked: c.checked } : c));
      setFlatOrders((prev) => prev.map((o) => o.relatedIcd === old ? { ...o, relatedIcd: item.code } : o));
    } else {
      setIcd10((prev) => [...prev, { ...item, checked: false }]);
    }
    setPopover(null);
  }

  function toggleIcd10(code: string) {
    setIcd10((prev) => prev.map((c) => c.code === code ? { ...c, checked: !c.checked } : c));
  }

  // ── Order handlers ────────────────────────────────────────────────────────────

  function handleOrderSelect(opt: typeof ordersPool[0]) {
    const newOrder: FlatOrder = {
      id: opt.id, label: opt.baseLabel ?? opt.label, company: opt.company,
      relatedIcd: opt.relatedIcd, checked: false,
      confidence: highConfidenceLabels.has(opt.baseLabel ?? opt.label) ? "high" : "low",
    };
    if (popover?.orderId) {
      const existingOrder = flatOrders.find((o) => o.id === popover.orderId);
      const oldIcd = existingOrder?.relatedIcd;
      setFlatOrders((prev) => prev.map((o) => o.id === popover.orderId ? { ...newOrder, checked: o.checked } : o));
      if (existingOrder && oldIcd && oldIcd !== opt.relatedIcd) {
        const ghost = { ...existingOrder };
        setLeavingOrders((prev) => [...prev, ghost]);
        setHighlightedOrderId(newOrder.id);
        setTimeout(() => setLeavingOrders((prev) => prev.filter((o) => o.id !== ghost.id)), 450);
        setTimeout(() => setHighlightedOrderId(null), 900);
      }
    } else {
      setFlatOrders((prev) => [...prev, newOrder]);
    }
    if (opt.relatedIcd && !icd10.find((c) => c.code === opt.relatedIcd)) {
      const match = icd10Pool.find((c) => c.code === opt.relatedIcd);
      if (match) setIcd10((prev) => [...prev, { ...match, checked: false }]);
    }
    setPopover(null);
  }

  function handleOrderVariantSelect(variant: typeof ordersPool[0]) {
    if (!popover?.orderId) return;
    setFlatOrders((prev) => prev.map((o) =>
      o.id === popover.orderId
        ? { ...o, id: variant.id, label: variant.baseLabel ?? variant.label, company: variant.company ?? o.company }
        : o
    ));
    setPopover(null);
  }

  function toggleOrder(id: string) {
    const order = flatOrders.find((o) => o.id === id);
    if (!order || order.precharted) return;
    const newChecked = !order.checked;
    setFlatOrders((prev) => prev.map((o) => o.id === id ? { ...o, checked: newChecked } : o));
    if (newChecked && order.relatedIcd) {
      const code = order.relatedIcd;
      setIcd10((prev) => prev.map((c) => c.code === code ? { ...c, checked: true } : c));
    }
  }

  function selectConfidentOrders() {
    const confidents = flatOrders.filter((o) => !o.precharted && o.confidence === "high");
    const allChecked = confidents.length > 0 && confidents.every((o) => o.checked);
    const newChecked = !allChecked;
    setFlatOrders((prev) => prev.map((o) => !o.precharted && o.confidence === "high" ? { ...o, checked: newChecked } : o));
    if (newChecked) {
      const codes = new Set(confidents.map((o) => o.relatedIcd).filter(Boolean) as string[]);
      setIcd10((prev) => prev.map((c) => codes.has(c.code) ? { ...c, checked: true } : c));
    }
  }

  function selectAllOrders() {
    const active = flatOrders.filter((o) => !o.precharted);
    const next = !active.every((o) => o.checked);
    setFlatOrders((prev) => prev.map((o) => o.precharted ? o : { ...o, checked: next }));
    if (next) {
      const codes = new Set(active.map((o) => o.relatedIcd).filter(Boolean) as string[]);
      setIcd10((prev) => prev.map((c) => codes.has(c.code) ? { ...c, checked: true } : c));
    }
  }

  function selectConfidentCodes() {
    setIcd10((prev) => {
      const confidents = prev.filter((c) => highConfidenceCodes.has(c.code));
      const allChecked = confidents.length > 0 && confidents.every((c) => c.checked);
      return prev.map((c) => highConfidenceCodes.has(c.code) ? { ...c, checked: !allChecked } : c);
    });
  }

  // ── Derived: orders grouped by ICD ────────────────────────────────────────────

  const { ordersGroups, unlinkedOrders } = useMemo(() => {
    const map = new Map<string, FlatOrder[]>();
    const unlinked: FlatOrder[] = [];
    for (const o of flatOrders) {
      if (o.relatedIcd) {
        if (!map.has(o.relatedIcd)) map.set(o.relatedIcd, []);
        map.get(o.relatedIcd)!.push(o);
      } else {
        unlinked.push(o);
      }
    }
    const groups: Array<{ code: string; label: string; orders: FlatOrder[] }> = [];
    for (const c of icd10) {
      const ords = map.get(c.code);
      if (ords?.length) groups.push({ code: c.code, label: c.providerLabel ?? c.description, orders: ords });
    }
    for (const [code, ords] of map) {
      if (!icd10.find((c) => c.code === code)) {
        const e = icd10Pool.find((c) => c.code === code);
        groups.push({ code, label: e?.providerLabel ?? e?.description ?? code, orders: ords });
      }
    }
    return { ordersGroups: groups, unlinkedOrders: unlinked };
  }, [flatOrders, icd10]);

  // ── Select states ─────────────────────────────────────────────────────────────

  const allCodesChecked = icd10.length > 0 && icd10.every((c) => c.checked);
  const someCodesChecked = icd10.some((c) => c.checked);
  const codesState = allCodesChecked ? "selected" : someCodesChecked ? "indeterminate" : "unselected";
  const toggleAllCodes = () => { const next = !allCodesChecked; setIcd10((p) => p.map((c) => ({ ...c, checked: next }))); };

  const activeOrders = flatOrders.filter((o) => !o.precharted);
  const allOrdersChecked = activeOrders.length > 0 && activeOrders.every((o) => o.checked);
  const someOrdersChecked = activeOrders.some((o) => o.checked);
  const ordersState = allOrdersChecked ? "selected" : someOrdersChecked ? "indeterminate" : "unselected";

  const confidentCodes = icd10.filter((c) => highConfidenceCodes.has(c.code));
  const confidentCodesState: "selected" | "indeterminate" | "unselected" =
    confidentCodes.length > 0 && confidentCodes.every((c) => c.checked) ? "selected" :
    confidentCodes.some((c) => c.checked) ? "indeterminate" : "unselected";

  const confidentOrders = activeOrders.filter((o) => o.confidence === "high");
  const confidentOrdersState: "selected" | "indeterminate" | "unselected" =
    confidentOrders.length > 0 && confidentOrders.every((o) => o.checked) ? "selected" :
    confidentOrders.some((o) => o.checked) ? "indeterminate" : "unselected";

  // ── Popover suggestions ────────────────────────────────────────────────────────

  const icd10Suggestions = useMemo(() => {
    if (popover?.list === "reassign") return icd10.map((c) => icd10Pool.find((x) => x.code === c.code)!).filter(Boolean);
    if (!popover || popover.list !== "icd10") return [];
    if (popover.code) return (icd10Adjacent[popover.code] ?? []).map((code) => icd10Pool.find((x) => x.code === code)!).filter(Boolean);
    return [...new Set(icd10.flatMap((c) => icd10Adjacent[c.code] ?? []))]
      .filter((code) => !icd10.some((c) => c.code === code))
      .map((code) => icd10Pool.find((x) => x.code === code)!).filter(Boolean);
  }, [popover, icd10]);

  const orderSuggestions = useMemo(() => {
    if (popover?.list !== "order") return [];
    return [...new Set(flatOrders.flatMap((o) => ordersAdjacent[o.id] ?? []))]
      .filter((id) => !flatOrders.some((o) => o.id === id))
      .map((id) => ordersPool.find((x) => x.id === id)!).filter(Boolean);
  }, [popover, flatOrders]);

  const companyVariants = useMemo(() => {
    if (popover?.list !== "order-company" || !popover.orderId) return [];
    const current = flatOrders.find((o) => o.id === popover.orderId);
    if (!current) return [];
    return ordersPool.filter((x) => x.baseLabel === current.label && x.id !== current.id);
  }, [popover, flatOrders]);

  const POPOVER_MAX_H = 280;
  const popoverStyle: React.CSSProperties = popover ? (() => {
    const spaceBelow = window.innerHeight - popover.rect.bottom - 4;
    const above = spaceBelow < POPOVER_MAX_H && popover.rect.top - 4 > spaceBelow;
    return { position: "fixed", ...(above ? { bottom: window.innerHeight - popover.rect.top + 4 } : { top: popover.rect.bottom + 4 }), left: popover.rect.left, width: Math.max(popover.rect.width, 320), zIndex: 200 };
  })() : {};

  // ── Render helpers ────────────────────────────────────────────────────────────

  function renderOrderEvidence(items: EvidenceItem[], onClose: () => void) {
    const setItem = items.find((i): i is Extract<EvidenceItem, { kind: "orderset" }> => i.kind === "orderset");
    const quotes = items.filter((i): i is Extract<EvidenceItem, { kind: "quote" }> => i.kind === "quote");
    const reasons = items.filter((i): i is Extract<EvidenceItem, { kind: "reason" }> => i.kind === "reason");
    return (
      <div className="bg-[var(--surface-1,#f7f7f7)] rounded-[12px] pl-[16px] pr-[12px] py-[12px] flex flex-col">
        <div className="flex items-center justify-between mb-[10px]">
          <div className="flex items-center gap-[8px]">
            <span className="t-title-sm text-[var(--foreground-secondary,#666)]">Evidence</span>
            {setItem && <Chip label={setItem.setName} color="neutral" size="XS" />}
          </div>
          <IconButton size="small" variant="tertiary-neutral" icon={<Icon name="close" size={16} />} onClick={onClose} aria-label="Close" />
        </div>
        {quotes.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="h-[1px] bg-[#e0e0e0] my-[10px]" />}
            <div className="flex flex-col gap-[2px]">
              <span className="text-[11px] font-bold leading-[1.2] text-[var(--foreground-secondary,#666)]">
                {item.source === "note" ? "Note" : "Transcript"}
              </span>
              <div className="flex items-start justify-between gap-[12px]">
                <span className="t-body-md text-[var(--foreground-primary,#1a1a1a)]">{item.text}</span>
                <span className="shrink-0 mt-[2px] text-[var(--foreground-secondary,#666)]"><Icon name="chevron_right" size={16} /></span>
              </div>
            </div>
          </React.Fragment>
        ))}
        {reasons.map((item, i) => (
          <React.Fragment key={`reason-${i}`}>
            {(quotes.length > 0 || i > 0) && <div className="h-[1px] bg-[#e0e0e0] my-[10px]" />}
            <span className="t-body-sm text-[var(--foreground-secondary,#666)] italic">{item.text}</span>
          </React.Fragment>
        ))}
      </div>
    );
  }

  function renderGhostOrderRow(order: FlatOrder) {
    return (
      <div key={`ghost-${order.id}`}
        className="flex items-center gap-[2px] min-h-[28px] rounded-[6px] pointer-events-none overflow-hidden"
        style={{ animation: "fadeCollapse 400ms ease forwards" }}>
        <Checkbox state={order.checked ? "selected" : "unselected"} onChange={() => {}} />
        <div className="flex items-center gap-[4px] flex-1 min-w-0 px-[6px]">
          <span className="t-title-md text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">{order.label}</span>
          {order.company && <Chip label={order.company} color="neutral" size="XS" />}
        </div>
      </div>
    );
  }

  function renderOrderRow(order: FlatOrder) {
    const items = getOrderEvidence(order);
    const isInfoOpen = infoOpenOrderId === order.id;
    return (
      <div key={order.id} className="flex flex-col">
        <div className={`group flex items-center gap-[2px] min-h-[28px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] cursor-pointer transition-colors duration-[600ms] ${highlightedOrderId === order.id ? "bg-[var(--litmus-25,#eef0fd)]" : ""}`} onClick={() => toggleOrder(order.id)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox state={order.checked ? "selected" : "unselected"} onChange={() => toggleOrder(order.id)} />
          </div>
          <div className="flex items-center gap-[4px] flex-1 min-w-0 h-[28px] px-[6px] cursor-pointer"
            onClick={(e) => { e.stopPropagation(); openPopover(e, "order", undefined, order.id); }}>
            <span className="t-title-md text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">{order.label}</span>
            {order.company && (
              <Chip label={order.company} color="neutral" size="XS"
                onClick={(e) => { e.stopPropagation(); openPopover(e, "order-company", undefined, order.id); }} />
            )}
          </div>
          {order.relatedIcd && (
            <Chip
              label={order.relatedIcd}
              color="neutral"
              size="XS"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => openPopover(e, "reassign", undefined, order.id)}
            />
          )}
          {items.length > 0 && (
            <div className="shrink-0" onClick={(e) => { e.stopPropagation(); setInfoOpenOrderId((p) => p === order.id ? null : order.id); }}>
              <IconButton size="small" variant="tertiary" icon={<Icon name="info" size={16} />} aria-label="Info" />
            </div>
          )}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <IconButton size="small" variant="tertiary-neutral" icon={<Icon name="close" size={16} />}
              onClick={(e) => { e.stopPropagation(); setFlatOrders((p) => p.filter((x) => x.id !== order.id)); }} aria-label="Remove" />
          </div>
        </div>
        {isInfoOpen && items.length > 0 && (
          <div className="mt-[4px]">{renderOrderEvidence(items, () => setInfoOpenOrderId(null))}</div>
        )}
      </div>
    );
  }

  function renderEHROrderRow(order: FlatOrder) {
    const items = getOrderEvidence(order);
    const isInfoOpen = infoOpenOrderId === order.id;
    return (
      <div key={order.id} className="flex flex-col">
        <div className="flex items-center gap-[2px] min-h-[28px]">
          <Checkbox state="selected" disabled />
          <div className="flex items-center gap-[4px] flex-1 min-w-0 h-[28px] px-[6px]">
            <span className="t-title-md text-[var(--foreground-secondary,#666)] whitespace-nowrap">{order.label}</span>
            {order.company && (
              <Chip label={order.company} color="neutral" size="XS" disabled />
            )}
          </div>
          {items.length > 0 && (
            <div className="shrink-0" onClick={(e) => { e.stopPropagation(); setInfoOpenOrderId((p) => p === order.id ? null : order.id); }}>
              <IconButton size="small" variant="tertiary" icon={<Icon name="info" size={16} />} aria-label="Info" />
            </div>
          )}
        </div>
        {isInfoOpen && items.length > 0 && (
          <div className="mt-[4px]">{renderOrderEvidence(items, () => setInfoOpenOrderId(null))}</div>
        )}
      </div>
    );
  }

  return (
    <ScribeLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <style>{`
        @keyframes fadeCollapse {
          from { opacity: 1; max-height: 40px; margin-bottom: 0; }
          to   { opacity: 0; max-height: 0;    margin-bottom: 0; }
        }
      `}</style>
      <div className="max-w-[640px] w-full px-[20px] py-[32px] flex flex-col gap-[24px]">

        {/* ── Diagnostic Codes ─────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-[16px]">
            <h2 className="t-title-lg text-[var(--foreground-primary,#1a1a1a)]">Diagnostic Codes</h2>
          </div>
          <div className="flex items-center justify-between mb-[8px]">
            <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">ICD-10 Codes</span>
            <div className="flex items-center gap-[2px]">
              <div className="flex items-center rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] cursor-pointer pr-[8px]" onClick={selectConfidentCodes}>
                <div onClick={(e) => e.stopPropagation()}><Checkbox state={confidentCodesState} onChange={selectConfidentCodes} /></div>
                <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)]">Select confident</span>
              </div>
              <div className="flex items-center rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] cursor-pointer pr-[8px]" onClick={toggleAllCodes}>
                <div onClick={(e) => e.stopPropagation()}><Checkbox state={codesState} onChange={toggleAllCodes} /></div>
                <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)]">Select all</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[4px] mb-[24px]">
            {icd10.map((c) => {
              const evidence = codeEvidenceMap[c.code] ?? [];
              const isInfoOpen = infoOpenCode === c.code;
              const hasPrecharted = flatOrders.some((o) => o.precharted && o.relatedIcd === c.code);
              return (
                <div key={c.code} className="flex flex-col">
                  <div className="group flex items-start gap-[4px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)]">
                    <div className="h-[28px] flex items-center shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Checkbox state={hasPrecharted ? "selected" : (c.checked ? "selected" : "unselected")} disabled={hasPrecharted} onChange={hasPrecharted ? undefined : () => toggleIcd10(c.code)} />
                    </div>
                    <div className="flex flex-col flex-1 px-[4px] py-[4px] cursor-pointer min-h-[28px] min-w-0"
                      onClick={(e) => openPopover(e, "icd10", c.code)}>
                      <div className="flex items-center gap-[8px]">
                        <span className="shrink-0 w-[72px] t-title-md text-[var(--accent,#1132ee)]">{c.code}</span>
                        <span className="t-title-md text-[var(--foreground-primary,#1a1a1a)]">{c.providerLabel ?? c.description}</span>
                      </div>
                      {c.providerLabel && (
                        <span className="t-body-sm text-[var(--foreground-secondary,#666)] ml-[80px]">{c.description}</span>
                      )}
                    </div>
                    {evidence.length > 0 && (
                      <div className="h-[28px] flex items-center shrink-0" onClick={(e) => { e.stopPropagation(); setInfoOpenCode((p) => p === c.code ? null : c.code); }}>
                        <IconButton size="small" variant="tertiary" icon={<Icon name="info" size={16} />} aria-label="Info" />
                      </div>
                    )}
                    <div className="h-[28px] flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <IconButton size="small" variant="tertiary-neutral" icon={<Icon name="close" size={16} />}
                        onClick={(e) => { e.stopPropagation(); setIcd10((p) => p.filter((x) => x.code !== c.code)); }} aria-label="Remove" />
                    </div>
                  </div>
                  {isInfoOpen && evidence.length > 0 && (
                    <div className="mt-[4px]">{renderOrderEvidence(evidence, () => setInfoOpenCode(null))}</div>
                  )}
                </div>
              );
            })}
            <Button variant="tertiary" size="medium" prefix={<Icon name="add" size={20} />}
              onClick={(e) => openPopover(e, "icd10")} className="self-start">Add ICD-10 code</Button>
          </div>
        </section>

        {/* ── Orders ───────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-[12px]">
            <h2 className="t-title-lg text-[var(--foreground-primary,#1a1a1a)]">Orders</h2>
            <div className="flex items-center gap-[2px]">
              <div className="flex items-center rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] cursor-pointer pr-[8px]" onClick={selectConfidentOrders}>
                <div onClick={(e) => e.stopPropagation()}><Checkbox state={confidentOrdersState} onChange={selectConfidentOrders} /></div>
                <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)]">Select confident</span>
              </div>
              <div className="flex items-center rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] cursor-pointer pr-[8px]" onClick={selectAllOrders}>
                <div onClick={(e) => e.stopPropagation()}><Checkbox state={ordersState} onChange={selectAllOrders} /></div>
                <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)]">Select all</span>
              </div>
            </div>
          </div>

          {/* Orders grouped by Dx, each group has confidence tiers */}
          <div className="flex flex-col">
            {ordersGroups.map(({ code, label, orders }, index) => {
              const highOrders = orders.filter((o) => !o.precharted && o.confidence === "high");
              const lowOrders  = orders.filter((o) => !o.precharted && o.confidence === "low");
              const charted    = orders.filter((o) => o.precharted);
              const leavingHigh = leavingOrders.filter((o) => o.relatedIcd === code && !o.precharted && o.confidence === "high");
              const leavingLow  = leavingOrders.filter((o) => o.relatedIcd === code && !o.precharted && o.confidence === "low");
              return (
                <div key={code} className="flex flex-col">
                  {index > 0 && <div className="h-[1px] bg-[#e0e0e0] mt-[20px] mb-[20px]" />}

                  <div className="flex items-center gap-[6px] mb-[6px]">
                    <span className="t-title-sm text-[var(--accent,#1132ee)]">{code}</span>
                    <span className="t-body-sm text-[var(--foreground-secondary,#666)]">{label}</span>
                  </div>

                  <div className="flex flex-col gap-[8px]">
                    {(highOrders.length > 0 || leavingHigh.length > 0) && (
                      <div className="flex flex-col gap-[2px]">
                        <Badge label="Confident" variant="success" filled />
                        {highOrders.map((o) => renderOrderRow(o))}
                        {leavingHigh.map((o) => renderGhostOrderRow(o))}
                      </div>
                    )}
                    {(lowOrders.length > 0 || leavingLow.length > 0) && (
                      <div className="flex flex-col gap-[2px]">
                        <Badge label="Suggested" variant="default" filled />
                        {lowOrders.map((o) => renderOrderRow(o))}
                        {leavingLow.map((o) => renderGhostOrderRow(o))}
                      </div>
                    )}
                    {charted.length > 0 && (
                      <div className="flex flex-col gap-[2px]">
                        <Badge label="In EHR" variant="default" filled />
                        {charted.map((o) => renderEHROrderRow(o))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Unlinked orders (no Dx association) */}
            {unlinkedOrders.filter((o) => !o.precharted).length > 0 && (
              <div className="h-[1px] bg-[#e0e0e0] mt-[20px] mb-[20px]" />
            )}
            {unlinkedOrders.filter((o) => !o.precharted).length > 0 && (
              <div className="flex flex-col gap-[8px]">
                <span className="t-title-sm text-[var(--foreground-secondary,#666)]">Unlinked</span>
                {unlinkedOrders.filter((o) => !o.precharted && o.confidence === "high").length > 0 && (
                  <div className="flex flex-col gap-[2px]">
                    <Chip label="Confident" color="success" size="XS" />
                    {unlinkedOrders.filter((o) => !o.precharted && o.confidence === "high").map((o) => renderOrderRow(o))}
                  </div>
                )}
                {unlinkedOrders.filter((o) => !o.precharted && o.confidence === "low").length > 0 && (
                  <div className="flex flex-col gap-[2px]">
                    <Chip label="Suggested" color="neutral" size="XS" />
                    {unlinkedOrders.filter((o) => !o.precharted && o.confidence === "low").map((o) => renderOrderRow(o))}
                  </div>
                )}
              </div>
            )}

            <Button variant="tertiary" size="medium" prefix={<Icon name="add" size={20} />}
              onClick={(e) => openPopover(e, "order")} className="self-start">Add order</Button>
          </div>
        </section>
      </div>

      {/* ── Floating popover ─────────────────────────────────────────── */}
      {popover && (
        <div ref={popoverRef} style={popoverStyle} onMouseDown={(e) => e.stopPropagation()}>
          {popover.list === "order-company" ? (
            <Menu>
              <MenuHeader>Change vendor</MenuHeader>
              {companyVariants.map((v) => (
                <MenuItem key={v.id} label={v.company ?? v.label} description={v.detail} onClick={() => handleOrderVariantSelect(v)} />
              ))}
              {companyVariants.length === 0 && (
                <p className="px-[8px] py-[8px] text-[13px] text-[var(--foreground-secondary,#666)]">No other vendors available</p>
              )}
            </Menu>
          ) : popover.list === "order" ? (() => {
            const q = popoverQuery.toLowerCase();
            const matches = (o: typeof ordersPool[0]) => (o.baseLabel ?? o.label).toLowerCase().includes(q) || o.detail.toLowerCase().includes(q);
            const existingIds = new Set(flatOrders.filter((o) => o.id !== popover.orderId).map((o) => o.id));
            const adjSeen = new Set<string>();
            const filteredAdj = orderSuggestions.filter((o) => {
              if (q !== "" && !matches(o)) return false;
              const k = o.baseLabel ?? o.label; if (adjSeen.has(k)) return false; adjSeen.add(k); return true;
            });
            const adjIds = new Set(orderSuggestions.map((o) => o.id));
            const adjLabels = new Set(filteredAdj.map((o) => o.baseLabel ?? o.label));
            const seen = new Set<string>();
            const filteredRest = ordersPool.filter((o) => {
              if (existingIds.has(o.id) || adjIds.has(o.id)) return false;
              if (q !== "" && !matches(o)) return false;
              const k = o.baseLabel ?? o.label; if (seen.has(k) || adjLabels.has(k)) return false; seen.add(k); return true;
            });
            return (
              <Menu>
                <MenuSearch value={popoverQuery} onChange={setPopoverQuery} onClose={() => setPopover(null)} placeholder="Search orders…" />
                <div className="overflow-y-auto max-h-[280px]">
                  {filteredAdj.length > 0 && (<><MenuHeader>Suggested</MenuHeader>{filteredAdj.map((o) => <MenuItem key={o.id} label={o.baseLabel ?? o.label} onClick={() => handleOrderSelect(o)} />)}</>)}
                  {filteredRest.length > 0 && (<>{filteredAdj.length > 0 && <MenuHeader>All Orders</MenuHeader>}{filteredRest.map((o) => <MenuItem key={o.id} label={o.baseLabel ?? o.label} onClick={() => handleOrderSelect(o)} />)}</>)}
                  {filteredAdj.length === 0 && filteredRest.length === 0 && <p className="px-[8px] py-[8px] text-[13px] text-[var(--foreground-secondary,#666)]">No orders found</p>}
                </div>
              </Menu>
            );
          })() : (() => {
            const isReassign = popover.list === "reassign";
            const exclude = isReassign ? [] : icd10.map((c) => c.code).filter((c) => c !== popover.code);
            const ph = isReassign ? "Change Dx association…" : popover.code ? `Replace ${popover.code}…` : "Search ICD-10 codes…";
            const q = popoverQuery.toLowerCase();
            const mc = (c: CodeItemType) => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
            const fAdj = icd10Suggestions.filter((c) => !exclude.includes(c.code) && (q === "" || mc(c)));
            const adjCodes = new Set(icd10Suggestions.map((c) => c.code));
            const fRest = isReassign ? [] : icd10Pool.filter((c) => !exclude.includes(c.code) && !adjCodes.has(c.code) && (q === "" || mc(c)));
            return (
              <Menu>
                <MenuSearch value={popoverQuery} onChange={setPopoverQuery} onClose={() => setPopover(null)} placeholder={ph} />
                <div className="overflow-y-auto max-h-[220px]">
                  {fAdj.length > 0 && (<><MenuHeader>{isReassign ? "Current codes" : "Suggested"}</MenuHeader>{fAdj.map((c) => <CodeMenuItem key={c.code} item={c} onSelect={handleIcd10Select} />)}</>)}
                  {fRest.length > 0 && <MenuHeader>All Codes</MenuHeader>}
                  {fRest.map((c) => <CodeMenuItem key={c.code} item={c} onSelect={handleIcd10Select} />)}
                  {fAdj.length === 0 && fRest.length === 0 && <p className="px-[8px] py-[8px] text-[13px] text-[var(--foreground-secondary,#666)]">No codes found</p>}
                </div>
              </Menu>
            );
          })()}
        </div>
      )}
    </ScribeLayout>
  );
}
