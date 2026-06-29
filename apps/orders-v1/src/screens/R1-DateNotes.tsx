import React, { useState, useEffect } from "react";
import { Button, IconButton, Icon, Checkbox, Chip, TextArea, MagicButton, TextField } from "@ds/ui";
import { ScribeLayout } from "../components/ScribeLayout";
import { CodeSearch, OrderSearch, SetOrOrderSearch } from "../components/CodeSearch";
import {
  icd10Pool, cptPool, ordersPool, ordersAdjacent,
  orderSetsPool, orderSetsAdjacent,
  icd10Adjacent, cptAdjacent,
  initialIcd10, initialCpt, initialOrders, initialOrderSets,
  type CodeItem, type OrderItem, type OrderSetItem, type OrderSetPoolItem,
} from "../data/mockCodes";

// ─── Constants ────────────────────────────────────────────────────────────────

const today = new Date();
const dateLabel = today.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const DEFAULT_DATE = `Today, ${dateLabel}`;

// Card shadow matching Figma spec: x=0 y=4 blur=16 spread=2 color=#000 at 7%
const CARD_SHADOW = "0px 4px 16px 2px rgba(0,0,0,0.07)";

// ─── Sample content ───────────────────────────────────────────────────────────

const ORDER_FACILITY: Record<string, string> = {
  "ecg-inhouse":    "12-lead ECG ordered to evaluate cardiac rhythm and screen for ischemic changes. In-office study.",
  "ecg-cardiology": "12-lead ECG ordered for cardiology referral. Results to be reviewed by cardiology team.",
  "cxr-inhouse":    "Chest X-ray (2-view) to assess pulmonary fields and cardiac silhouette. In-office imaging.",
  "cxr-radiology":  "Chest X-ray (2-view) ordered via radiology referral. PA and lateral views requested.",
};

const ORDER_INTERNAL: Record<string, string> = {
  "ecg-inhouse":    "Alert on any acute ST changes or significant arrhythmia. Results expected within 30 min.",
  "ecg-cardiology": "Refer to cardiology team for interpretation. Follow up scheduled.",
  "cxr-inhouse":    "Patient ambulatory and cooperative.",
  "cxr-radiology":  "Patient to go to radiology suite. Escort arranged.",
};

const CHILD_FACILITY: Record<string, string> = {
  "set-trop":    "High-sensitivity troponin ordered to rule out acute myocardial injury. Critical value protocol in place.",
  "set-trop-l":  "High-sensitivity troponin ordered to rule out acute myocardial injury. Critical value protocol in place.",
  "set-bmp":     "Basic metabolic panel to assess electrolytes, renal function, and glucose.",
  "set-bmp-l":   "Basic metabolic panel to assess electrolytes, renal function, and glucose.",
  "set-cbc":     "CBC with differential to evaluate for infection, anemia, or hematologic abnormalities.",
  "set-cbc-l":   "CBC with differential to evaluate for infection, anemia, or hematologic abnormalities.",
  "set-lipid":   "Lipid panel for cardiovascular risk stratification in this high-risk patient.",
  "set-lipid-l": "Lipid panel for cardiovascular risk stratification in this high-risk patient.",
};

const CHILD_INTERNAL: Record<string, string> = {
  "set-trop":    "Alert if troponin > 0.04 ng/mL.",
  "set-trop-l":  "Alert if troponin > 0.04 ng/mL.",
  "set-bmp":     "Watch for electrolyte imbalance.",
  "set-bmp-l":   "Watch for electrolyte imbalance.",
  "set-cbc":     "Alert on WBC > 12 or Hgb < 8.",
  "set-cbc-l":   "Alert on WBC > 12 or Hgb < 8.",
  "set-lipid":   "Discuss results at follow-up visit.",
  "set-lipid-l": "Discuss results at follow-up visit.",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type NoteMeta = { facilityNote: string; internalNote: string };
type CardMeta = { dateValue: string } & NoteMeta;

function makeCardMeta(): CardMeta { return { dateValue: DEFAULT_DATE, facilityNote: "", internalNote: "" }; }
function makeNoteMeta(): NoteMeta { return { facilityNote: "", internalNote: "" }; }

type PopoverTarget = {
  rect: DOMRect;
  list: "icd10" | "cpt" | "order" | "order-icd" | "order-company" | "set-title" | "set-company" | "set-child-company";
  code?: string;
  setId?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function GenerateBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="shrink-0 opacity-40 hover:opacity-100 transition-opacity flex items-center"
      title="Generate"
    >
      <MagicButton size={14} />
    </button>
  );
}

const FIELD_LABEL = "w-[80px] shrink-0 pl-[8px] text-[11px] font-bold tracking-[0.13px] text-[var(--foreground-secondary,#666)]";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className={FIELD_LABEL}>
      {children}
    </span>
  );
}

function NoteFields({ meta, onMetaChange, facilityGen, internalGen }: {
  meta: NoteMeta;
  onMetaChange: (patch: Partial<NoteMeta>) => void;
  facilityGen: string;
  internalGen: string;
}) {
  return (
    <>
      <div className="flex items-center gap-[8px]">
        <FieldLabel>Facility Note</FieldLabel>
        <TextArea
          value={meta.facilityNote}
          onChange={(v) => onMetaChange({ facilityNote: v })}
          placeholder="Add note..."
          suffix={<GenerateBtn onClick={() => onMetaChange({ facilityNote: facilityGen })} />}
          className="flex-1"
        />
      </div>
      <div className="flex items-center gap-[8px]">
        <FieldLabel>Internal Note</FieldLabel>
        <TextArea
          value={meta.internalNote}
          onChange={(v) => onMetaChange({ internalNote: v })}
          placeholder="Add note..."
          suffix={<GenerateBtn onClick={() => onMetaChange({ internalNote: internalGen })} />}
          className="flex-1"
        />
      </div>
    </>
  );
}

// ─── Order card ───────────────────────────────────────────────────────────────

type OrderCardProps = {
  order: OrderItem;
  meta: CardMeta;
  onMetaChange: (patch: Partial<CardMeta>) => void;
  onToggle: () => void;
  onTitleClick: (e: React.MouseEvent) => void;
  onCompanyClick: (e: React.MouseEvent) => void;
  onIcdClick: (e: React.MouseEvent) => void;
  onRemove: () => void;
};

function OrderCard({ order, meta, onMetaChange, onToggle, onTitleClick, onCompanyClick, onIcdClick, onRemove }: OrderCardProps) {
  return (
    <div
      className="flex flex-col gap-[8px] p-[12px] rounded-[10px] bg-white"
      style={{ boxShadow: CARD_SHADOW }}
    >
      {/* Header */}
      <div className="flex items-center gap-[4px]">
        <button
          onClick={onTitleClick}
          className="flex items-center h-[28px] px-[8px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] text-left"
        >
          <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">
            {order.baseLabel ?? order.label}
          </span>
        </button>
        {order.company && (
          <Chip label={order.company} color="neutral" size="XS" onClick={onCompanyClick} />
        )}
        {order.relatedIcd ? (
          <Chip label={order.relatedIcd} color="accent" size="XS" onClick={onIcdClick} />
        ) : (
          <button
            onClick={onIcdClick}
            className="text-[12px] text-[var(--foreground-tertiary,#808080)] hover:text-[var(--foreground-brand,#1132ee)] leading-[1.2] shrink-0 px-[2px]"
          >
            + link code
          </button>
        )}
        <div className="ml-auto">
          <IconButton size="small" variant="tertiary-neutral" icon={<Icon name="close" size={16} />}
            onClick={onRemove} aria-label="Remove" />
        </div>
      </div>

      {/* Collapsed when unchecked */}
      {order.checked && (
        <>
          <div className="flex items-center gap-[8px]">
            <FieldLabel>Order Date</FieldLabel>
            <TextField
              value={meta.dateValue}
              onChange={(v) => onMetaChange({ dateValue: v })}
              prefix={<Icon name="calendar_today" size={14} className="text-[var(--foreground-tertiary,#808080)]" />}
              className="flex-1"
            />
          </div>
          <NoteFields
            meta={meta}
            onMetaChange={onMetaChange}
            facilityGen={ORDER_FACILITY[order.id] ?? "Facility note generated."}
            internalGen={ORDER_INTERNAL[order.id] ?? "Internal note generated."}
          />
        </>
      )}
    </div>
  );
}

// ─── Order-set card ───────────────────────────────────────────────────────────

type SetCardProps = {
  set: OrderSetItem;
  dateValue: string;
  onDateChange: (v: string) => void;
  childMeta: Record<string, NoteMeta>;         // keyed by childId
  onChildMetaChange: (childId: string, patch: Partial<NoteMeta>) => void;
  onToggleSet: () => void;
  onToggleChild: (childId: string) => void;
  onTitleClick: (e: React.MouseEvent) => void;
  onCompanyClick: (e: React.MouseEvent) => void;
  onChildCompanyClick: (e: React.MouseEvent, childId: string) => void;
  onRemove: () => void;
};

function SetCard({
  set, dateValue, onDateChange,
  childMeta, onChildMetaChange,
  onToggleSet, onToggleChild,
  onTitleClick, onCompanyClick, onChildCompanyClick, onRemove,
}: SetCardProps) {
  const companies = [...new Set(set.children.map((c) => c.company))];
  const companyLabel = companies.length === 1 ? companies[0] : "Mixed";

  return (
    <div
      className="flex flex-col gap-[8px] p-[12px] rounded-[10px] bg-white"
      style={{ boxShadow: CARD_SHADOW }}
    >
      {/* Set header */}
      <div className="flex items-center gap-[4px]">
        <button
          onClick={onTitleClick}
          className="flex items-center h-[28px] px-[8px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] text-left"
        >
          <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">
            {set.baseLabel ?? set.label}
          </span>
        </button>
        <Chip label={companyLabel} color="neutral" size="XS" onClick={onCompanyClick} />
        {set.relatedIcd && <Chip label={set.relatedIcd} color="accent" size="XS" />}
        <div className="ml-auto">
          <IconButton size="small" variant="tertiary-neutral" icon={<Icon name="close" size={16} />}
            onClick={onRemove} aria-label="Remove" />
        </div>
      </div>

      {/* Date — set level, above individual orders */}
      <div className="flex items-center gap-[8px]">
        <FieldLabel>Order Date</FieldLabel>
        <TextField
          value={dateValue}
          onChange={onDateChange}
          prefix={<Icon name="calendar_today" size={14} className="text-[var(--foreground-tertiary,#808080)]" />}
          className="flex-1"
        />
      </div>

      {/* Children — each with its own notes when checked */}
      <div className="flex flex-col gap-[8px]">
        {set.children.map((child) => {
          const meta = childMeta[child.id] ?? makeNoteMeta();
          return (
            <div key={child.id} className="flex flex-col gap-[6px]">
              <div className="flex items-center gap-[8px] min-h-[28px]">
                <Checkbox
                  className="ml-[3px]"
                  state={child.checked ? "selected" : "unselected"}
                  onChange={() => onToggleChild(child.id)}
                />
                <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">
                  {child.label}
                </span>
                <Chip label={child.company} color="neutral" size="XS" onClick={(e) => onChildCompanyClick(e, child.id)} />
              </div>
              {child.checked && (
                <div className="ml-[29px] flex flex-col gap-[6px]">
                  <NoteFields
                    meta={meta}
                    onMetaChange={(patch) => onChildMetaChange(child.id, patch)}
                    facilityGen={CHILD_FACILITY[child.id] ?? "Facility note generated."}
                    internalGen={CHILD_INTERNAL[child.id] ?? "Internal note generated."}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function R1DateNotes() {
  const [activeTab, setActiveTab] = useState("diagnostics");
  const [icd10, setIcd10] = useState<CodeItem[]>(initialIcd10);
  const [cpt, setCpt] = useState<CodeItem[]>(initialCpt);
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [orderSets, setOrderSets] = useState<OrderSetItem[]>(initialOrderSets);
  const [popover, setPopover] = useState<PopoverTarget | null>(null);

  // Per-order card meta (date + notes for individual orders)
  const [cardMeta, setCardMeta] = useState<Record<string, CardMeta>>(() => {
    const m: Record<string, CardMeta> = {};
    initialOrders.forEach((o) => { m[o.id] = makeCardMeta(); });
    initialOrderSets.forEach((s) => { m[s.id] = makeCardMeta(); });
    return m;
  });

  // Per-set-child notes: keyed by "setId:childId"
  const [childMeta, setChildMeta] = useState<Record<string, NoteMeta>>(() => {
    const m: Record<string, NoteMeta> = {};
    initialOrderSets.forEach((s) => {
      s.children.forEach((c) => { m[`${s.id}:${c.id}`] = makeNoteMeta(); });
    });
    return m;
  });

  function updateCardMeta(id: string, patch: Partial<CardMeta>) {
    setCardMeta((prev) => ({ ...prev, [id]: { ...(prev[id] ?? makeCardMeta()), ...patch } }));
  }

  function updateChildMeta(setId: string, childId: string, patch: Partial<NoteMeta>) {
    const key = `${setId}:${childId}`;
    setChildMeta((prev) => ({ ...prev, [key]: { ...(prev[key] ?? makeNoteMeta()), ...patch } }));
  }

  function ensureCardMeta(id: string) {
    setCardMeta((prev) => prev[id] ? prev : { ...prev, [id]: makeCardMeta() });
  }

  function ensureChildrenMeta(set: OrderSetItem) {
    setChildMeta((prev) => {
      const next = { ...prev };
      set.children.forEach((c) => {
        const key = `${set.id}:${c.id}`;
        if (!next[key]) next[key] = makeNoteMeta();
      });
      return next;
    });
  }

  useEffect(() => {
    if (!popover) return;
    const handler = () => setPopover(null);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popover]);

  function openPopover(e: React.MouseEvent, list: PopoverTarget["list"], code?: string, setId?: string) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopover({ rect, list, code, setId });
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleIcd10Select(item: CodeItem) {
    if (popover?.code) {
      const old = popover.code;
      setIcd10((prev) => prev.map((c) => (c.code === old ? item : c)));
      setOrders((prev) => prev.map((o) => o.relatedIcd === old ? { ...o, relatedIcd: item.code } : o));
      setOrderSets((prev) => prev.map((s) => ({
        ...s,
        relatedIcd: s.relatedIcd === old ? item.code : s.relatedIcd,
        children: s.children.map((c) => ({ ...c, relatedIcd: c.relatedIcd === old ? item.code : c.relatedIcd })),
      })));
    } else {
      setIcd10((prev) => [...prev, item]);
    }
    setPopover(null);
  }

  function handleCptSelect(item: CodeItem) {
    if (popover?.code) {
      setCpt((prev) => prev.map((c) => (c.code === popover.code ? item : c)));
    } else {
      setCpt((prev) => [...prev, item]);
    }
    setPopover(null);
  }

  function handleOrderSelect(opt: typeof ordersPool[0]) {
    if (popover?.code) {
      const prevChecked = orders.find((o) => o.id === popover.code)?.checked ?? true;
      setOrders((prev) => prev.map((o) => o.id === popover.code ? { ...opt, checked: prevChecked } : o));
    } else {
      setOrders((prev) => [...prev, { ...opt, checked: true }]);
    }
    ensureCardMeta(opt.id);
    if (opt.relatedIcd && !icd10.find((c) => c.code === opt.relatedIcd)) {
      const match = icd10Pool.find((c) => c.code === opt.relatedIcd);
      if (match) setIcd10((prev) => [...prev, match]);
    }
    setPopover(null);
  }

  function handleOrderIcdSelect(item: CodeItem) {
    if (!popover?.code) return;
    setOrders((prev) => prev.map((o) => o.id === popover.code ? { ...o, relatedIcd: item.code } : o));
    if (!icd10.find((c) => c.code === item.code)) setIcd10((prev) => [...prev, item]);
    setPopover(null);
  }

  function handleCompanySelect(opt: typeof ordersPool[0]) {
    if (!popover?.code) return;
    const prevChecked = orders.find((o) => o.id === popover.code)?.checked ?? true;
    setOrders((prev) => prev.map((o) => o.id === popover.code ? { ...opt, checked: prevChecked } : o));
    setPopover(null);
  }

  function handleSetTitleSelect(poolItem: OrderSetPoolItem) {
    if (!popover?.code) return;
    setOrderSets((prev) => prev.map((s) => {
      if (s.id !== popover.code) return s;
      return {
        id: poolItem.id,
        label: poolItem.baseLabel,
        baseLabel: poolItem.baseLabel,
        defaultLabCompany: poolItem.defaultLabCompany,
        defaultImagingCompany: poolItem.defaultImagingCompany,
        relatedIcd: poolItem.relatedIcd,
        children: poolItem.children.map((c) => {
          const existing = s.children.find((sc) => sc.label === c.label);
          return { ...c, checked: existing?.checked ?? true };
        }),
      };
    }));
    ensureCardMeta(poolItem.id);
    ensureChildrenMeta({ ...poolItem, label: poolItem.baseLabel });
    setPopover(null);
  }

  function handleSetReplaceWithOrder(opt: typeof ordersPool[0]) {
    if (!popover?.code) return;
    setOrderSets((prev) => prev.filter((s) => s.id !== popover.code));
    setOrders((prev) => [...prev, { ...opt, checked: true }]);
    ensureCardMeta(opt.id);
    if (opt.relatedIcd && !icd10.find((c) => c.code === opt.relatedIcd)) {
      const match = icd10Pool.find((c) => c.code === opt.relatedIcd);
      if (match) setIcd10((prev) => [...prev, match]);
    }
    setPopover(null);
  }

  function handleSetChildCompanySelect(variant: typeof ordersPool[0]) {
    if (!popover?.setId || !popover.code) return;
    setOrderSets((prev) => prev.map((s) => s.id !== popover.setId ? s : {
      ...s,
      children: s.children.map((c) => c.id !== popover.code ? c : { ...c, company: variant.company ?? c.company }),
    }));
    setPopover(null);
  }

  function handleSetCompanySelect(company: string) {
    if (!popover?.code) return;
    setOrderSets((prev) => prev.map((s) => s.id !== popover.code ? s : {
      ...s,
      defaultLabCompany: company,
      defaultImagingCompany: company,
      children: s.children.map((c) => ({ ...c, company })),
    }));
    setPopover(null);
  }

  function toggleOrder(id: string) {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, checked: !o.checked } : o));
  }

  function toggleSet(setId: string) {
    setOrderSets((prev) => prev.map((s) => {
      if (s.id !== setId) return s;
      const allChecked = s.children.every((c) => c.checked);
      return { ...s, children: s.children.map((c) => ({ ...c, checked: !allChecked })) };
    }));
  }

  function toggleSetChild(setId: string, childId: string) {
    setOrderSets((prev) => prev.map((s) => s.id !== setId ? s : {
      ...s,
      children: s.children.map((c) => c.id !== childId ? c : { ...c, checked: !c.checked }),
    }));
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const adjacent =
    popover?.list === "icd10" && popover.code
      ? (icd10Adjacent[popover.code] ?? []).map((code) => icd10Pool.find((x) => x.code === code)!).filter(Boolean)
      : popover?.list === "cpt" && popover.code
      ? (cptAdjacent[popover.code] ?? []).map((code) => cptPool.find((x) => x.code === code)!).filter(Boolean)
      : [];

  const companyVariants = popover?.list === "order-company" && popover.code
    ? ordersPool.filter((x) => {
        const cur = orders.find((o) => o.id === popover.code);
        return cur?.baseLabel && x.baseLabel === cur.baseLabel && x.id !== popover.code;
      })
    : [];

  const setChildCompanyVariants = (() => {
    if (popover?.list !== "set-child-company" || !popover.code || !popover.setId) return [];
    const set = orderSets.find((s) => s.id === popover.setId);
    const child = set?.children.find((c) => c.id === popover.code);
    if (!child) return [];
    return ordersPool.filter((x) => x.baseLabel === child.label && x.company !== child.company);
  })();

  const setCompanyOptions: string[] = (() => {
    if (popover?.list !== "set-company" || !popover.code) return [];
    const set = orderSets.find((s) => s.id === popover.code);
    if (!set) return [];
    const seen = new Set<string>();
    set.children.forEach((child) => {
      ordersPool.filter((x) => x.baseLabel === child.label && x.company).forEach((x) => seen.add(x.company!));
    });
    return Array.from(seen);
  })();

  const POPOVER_MAX_H = 300;
  const popoverStyle: React.CSSProperties = popover
    ? (() => {
        const spaceBelow = window.innerHeight - popover.rect.bottom - 4;
        const showAbove = spaceBelow < POPOVER_MAX_H && popover.rect.top - 4 > spaceBelow;
        return {
          position: "fixed",
          ...(showAbove
            ? { bottom: window.innerHeight - popover.rect.top + 4 }
            : { top: popover.rect.bottom + 4 }),
          left: popover.rect.left,
          width: Math.max(popover.rect.width, 360),
          zIndex: 200,
        };
      })()
    : {};

  return (
    <ScribeLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="max-w-[640px] w-full px-[20px] py-[32px] flex flex-col gap-[24px]">

        {/* ── Diagnostic Codes ──────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-[16px]">
            <h2 className="t-title-lg text-[var(--foreground-primary,#1a1a1a)]">
              Diagnostic Codes
            </h2>
          </div>
          <div className="flex items-center justify-between mb-[8px]">
            <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">ICD10 Codes</span>
            <Button variant="tertiary" size="small" prefix={<Icon name="content_copy" size={16} />}>Copy Codes</Button>
          </div>
          <div className="flex flex-col gap-[2px] mb-[24px]">
            {icd10.map((c) => (
              <div key={c.code} className="group flex items-center gap-[4px]">
                <div className="flex items-center h-[28px] px-[8px] gap-[8px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] cursor-pointer"
                  onClick={(e) => openPopover(e, "icd10", c.code)}>
                  <span className="w-[80px] shrink-0 t-title-sm text-[var(--foreground-brand,#1132ee)]">{c.code}</span>
                  <span className="t-body-md text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">{c.description}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <IconButton size="small" variant="tertiary" icon={<Icon name="close" size={16} />}
                    onClick={(e) => { e.stopPropagation(); setIcd10((prev) => prev.filter((x) => x.code !== c.code)); }} aria-label="Remove" />
                </div>
              </div>
            ))}
            <Button variant="tertiary" size="small" prefix={<Icon name="add" size={16} />}
              onClick={(e) => openPopover(e, "icd10")} className="self-start">Add ICD-10 code</Button>
          </div>
          <div className="flex items-center justify-between mb-[8px]">
            <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">CPT Codes</span>
            <Button variant="tertiary" size="small" prefix={<Icon name="content_copy" size={16} />}>Copy Codes</Button>
          </div>
          <div className="flex flex-col gap-[2px]">
            {cpt.map((c) => (
              <div key={c.code} className="group flex items-center gap-[4px]">
                <div className="flex items-center h-[28px] px-[8px] gap-[8px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] cursor-pointer"
                  onClick={(e) => openPopover(e, "cpt", c.code)}>
                  <span className="w-[80px] shrink-0 t-title-sm text-[var(--foreground-brand,#1132ee)]">{c.code}</span>
                  <span className="t-body-md text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">{c.description}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <IconButton size="small" variant="tertiary" icon={<Icon name="close" size={16} />}
                    onClick={(e) => { e.stopPropagation(); setCpt((prev) => prev.filter((x) => x.code !== c.code)); }} aria-label="Remove" />
                </div>
              </div>
            ))}
            <Button variant="tertiary" size="small" prefix={<Icon name="add" size={16} />}
              onClick={(e) => openPopover(e, "cpt")} className="self-start">Add CPT code</Button>
          </div>
        </section>

        {/* ── Orders ────────────────────────────────────────────── */}
        <section>
          <h2 className="t-title-lg text-[var(--foreground-primary,#1a1a1a)] mb-[16px]">
            Orders
          </h2>
          <div className="flex flex-col gap-[10px]">
            {orders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                meta={cardMeta[o.id] ?? makeCardMeta()}
                onMetaChange={(patch) => updateCardMeta(o.id, patch)}
                onToggle={() => toggleOrder(o.id)}
                onTitleClick={(e) => openPopover(e, "order", o.id)}
                onCompanyClick={(e) => openPopover(e, "order-company", o.id)}
                onIcdClick={(e) => openPopover(e, "order-icd", o.id)}
                onRemove={() => setOrders((prev) => prev.filter((x) => x.id !== o.id))}
              />
            ))}

            {orderSets.map((set) => (
              <SetCard
                key={set.id}
                set={set}
                dateValue={(cardMeta[set.id] ?? makeCardMeta()).dateValue}
                onDateChange={(v) => updateCardMeta(set.id, { dateValue: v })}
                childMeta={Object.fromEntries(
                  set.children.map((c) => [c.id, childMeta[`${set.id}:${c.id}`] ?? makeNoteMeta()])
                )}
                onChildMetaChange={(childId, patch) => updateChildMeta(set.id, childId, patch)}
                onToggleSet={() => toggleSet(set.id)}
                onToggleChild={(childId) => toggleSetChild(set.id, childId)}
                onTitleClick={(e) => openPopover(e, "set-title", set.id)}
                onCompanyClick={(e) => openPopover(e, "set-company", set.id)}
                onChildCompanyClick={(e, childId) => openPopover(e, "set-child-company", childId, set.id)}
                onRemove={() => setOrderSets((prev) => prev.filter((s) => s.id !== set.id))}
              />
            ))}

            <Button variant="tertiary" size="small" prefix={<Icon name="add" size={16} />}
              onClick={(e) => openPopover(e, "order")} className="self-start">Add order</Button>
          </div>
        </section>
      </div>

      {/* ── Floating popover ───────────────────────────────────────── */}
      {popover && (
        <div
          style={popoverStyle}
          onMouseDown={(e) => e.stopPropagation()}
          className="rounded-[10px] border border-[var(--shape-outline,rgba(0,0,0,0.1))] overflow-hidden shadow-lg bg-white"
        >
          {popover.list === "set-title" ? (
            <SetOrOrderSearch
              setPool={orderSetsPool}
              orderPool={ordersPool}
              adjacentSetIds={popover.code ? (orderSetsAdjacent[popover.code] ?? []) : []}
              currentSetId={popover.code}
              onSelectSet={handleSetTitleSelect}
              onSelectOrder={handleSetReplaceWithOrder}
              onClose={() => setPopover(null)}
            />
          ) : popover.list === "order" ? (
            <OrderSearch
              pool={ordersPool}
              adjacent={popover.code
                ? (ordersAdjacent[popover.code] ?? []).map((id) => ordersPool.find((x) => x.id === id)!).filter(Boolean)
                : []}
              exclude={popover.code
                ? orders.map((o) => o.id).filter((id) => id !== popover.code)
                : orders.map((o) => o.id)}
              onSelect={handleOrderSelect}
              onClose={() => setPopover(null)}
            />
          ) : popover.list === "order-icd" ? (
            <CodeSearch
              pool={icd10Pool}
              adjacent={(() => {
                const cur = orders.find((o) => o.id === popover.code)?.relatedIcd;
                return cur ? (icd10Adjacent[cur] ?? []).map((code) => icd10Pool.find((x) => x.code === code)!).filter(Boolean) : [];
              })()}
              exclude={[]}
              onSelect={handleOrderIcdSelect}
              onClose={() => setPopover(null)}
              placeholder={(() => {
                const cur = orders.find((o) => o.id === popover.code)?.relatedIcd;
                return cur ? `Replace ${cur}…` : "Link ICD-10 code…";
              })()}
            />
          ) : popover.list === "order-company" ? (
            <div className="flex flex-col bg-white">
              <div className="flex items-center gap-[8px] px-[12px] py-[8px] border-b border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                <Icon name="business" size={16} className="text-[var(--foreground-tertiary,#808080)] shrink-0" />
                <span className="text-[13px] text-[var(--foreground-secondary,#666)] leading-[1.4]">
                  Select lab for {orders.find((o) => o.id === popover.code)?.baseLabel}
                </span>
              </div>
              <div className="py-[4px]">
                {companyVariants.map((variant) => (
                  <button key={variant.id} onMouseDown={(e) => { e.preventDefault(); handleCompanySelect(variant); }}
                    className="w-full flex items-center gap-[8px] px-[12px] py-[6px] hover:bg-[var(--surface-1,#f7f7f7)] text-left">
                    <span className="text-[13px] font-bold text-[var(--foreground-primary,#1a1a1a)] leading-[1.2] w-[80px] shrink-0">{variant.company}</span>
                    <span className="text-[12px] text-[var(--foreground-secondary,#666)] leading-[1.4]">{variant.detail}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : popover.list === "set-company" ? (
            <div className="flex flex-col bg-white">
              <div className="flex items-center gap-[8px] px-[12px] py-[8px] border-b border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                <Icon name="business" size={16} className="text-[var(--foreground-tertiary,#808080)] shrink-0" />
                <span className="text-[13px] text-[var(--foreground-secondary,#666)] leading-[1.4]">
                  Select lab for all orders in {orderSets.find((s) => s.id === popover.code)?.label}
                </span>
              </div>
              <div className="py-[4px]">
                {setCompanyOptions.map((company) => (
                  <button key={company} onMouseDown={(e) => { e.preventDefault(); handleSetCompanySelect(company); }}
                    className="w-full flex items-center px-[12px] py-[6px] hover:bg-[var(--surface-1,#f7f7f7)] text-left">
                    <span className="text-[13px] font-bold text-[var(--foreground-primary,#1a1a1a)] leading-[1.2]">{company}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : popover.list === "set-child-company" ? (
            <div className="flex flex-col bg-white">
              <div className="flex items-center gap-[8px] px-[12px] py-[8px] border-b border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                <Icon name="business" size={16} className="text-[var(--foreground-tertiary,#808080)] shrink-0" />
                <span className="text-[13px] text-[var(--foreground-secondary,#666)] leading-[1.4]">
                  {(() => {
                    const set = orderSets.find((s) => s.id === popover.setId);
                    const child = set?.children.find((c) => c.id === popover.code);
                    return `Select lab for ${child?.label}`;
                  })()}
                </span>
              </div>
              <div className="py-[4px]">
                {setChildCompanyVariants.map((variant) => (
                  <button key={variant.id} onMouseDown={(e) => { e.preventDefault(); handleSetChildCompanySelect(variant); }}
                    className="w-full flex items-center gap-[8px] px-[12px] py-[6px] hover:bg-[var(--surface-1,#f7f7f7)] text-left">
                    <span className="text-[13px] font-bold text-[var(--foreground-primary,#1a1a1a)] leading-[1.2] w-[80px] shrink-0">{variant.company}</span>
                    <span className="text-[12px] text-[var(--foreground-secondary,#666)] leading-[1.4]">{variant.detail}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <CodeSearch
              pool={popover.list === "icd10" ? icd10Pool : cptPool}
              adjacent={adjacent}
              exclude={popover.list === "icd10"
                ? icd10.map((c) => c.code).filter((c) => c !== popover.code)
                : cpt.map((c) => c.code).filter((c) => c !== popover.code)}
              onSelect={popover.list === "icd10" ? handleIcd10Select : handleCptSelect}
              onClose={() => setPopover(null)}
              placeholder={popover.code
                ? `Replace ${popover.code}…`
                : popover.list === "icd10" ? "Search ICD-10 codes…" : "Search CPT codes…"}
            />
          )}
        </div>
      )}
    </ScribeLayout>
  );
}
