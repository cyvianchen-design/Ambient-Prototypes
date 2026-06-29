import React, { useState, useEffect, useRef } from "react";
import { Button, IconButton, Icon, Checkbox, Chip, Menu, MenuItem, MenuHeader, MenuSearch } from "@ds/ui";
import { ScribeLayout } from "../components/ScribeLayout";
import type { CodeItem as CodeItemType } from "../data/mockCodes";

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
import {
  icd10Pool, cptPool, ordersPool, ordersAdjacent,
  orderSetsPool, orderSetsAdjacent,
  icd10Adjacent, cptAdjacent,
  initialIcd10, initialCpt, initialOrders, initialOrderSets,
  type CodeItem, type OrderItem, type OrderSetItem, type OrderSetPoolItem,
} from "../data/mockCodes";

type PopoverTarget = {
  rect: DOMRect;
  list: "icd10" | "cpt" | "order" | "order-icd" | "order-company" | "set-title" | "set-lab-company" | "set-imaging-company" | "set-child-company" | "set-child-icd";
  code?: string;
  setId?: string;
};

const ordersEvidenceMap: Record<string, string[]> = {
  "ecg-inhouse":    ["“Patient reports palpitations and exertional chest tightness — no EKG on file in the past 12 months.”"],
  "ecg-cardiology": ["“Patient reports palpitations and exertional chest tightness — no EKG on file in the past 12 months.”"],
  "ddimer-quest":   [
    "“Pleuritic chest pain and a recent 8-hour flight raise moderate concern for PE.”",
    "“Wells score 4 — D-dimer indicated prior to further imaging.”",
  ],
  "ddimer-labcorp": [
    "“Pleuritic chest pain and a recent 8-hour flight raise moderate concern for PE.”",
    "“Wells score 4 — D-dimer indicated prior to further imaging.”",
  ],
  "ankle-xr-3v-radnet": [
    "“Patient unable to bear weight immediately after twisting right ankle.”",
    "“Ottawa ankle rules positive: tenderness over the posterior lateral malleolus.”",
  ],
  "set-chest-pain-quest-radnet":   [
    "“New-onset chest pain with multiple cardiac risk factors — comprehensive workup indicated.”",
    "“Hypertension, hyperlipidemia, and family history of coronary artery disease present.”",
  ],
  "set-chest-pain-labcorp-radnet": [
    "“New-onset chest pain with multiple cardiac risk factors — comprehensive workup indicated.”",
    "“Hypertension, hyperlipidemia, and family history of coronary artery disease present.”",
  ],
};

const evidenceMap: Record<string, string[]> = {
  "R07.9":   [
    "“Patient presents with chest pain, 6/10 in severity, worse with exertion and relieved by rest.”",
    "“Pain radiating to the left arm, onset 3 days ago during yard work.”",
  ],
  "I10":     [
    "“Blood pressure 148/92 mmHg at today’s visit.”",
    "“Patient reports compliance with lisinopril 10 mg daily, but admits to high sodium diet.”",
  ],
  "E78.5":   [
    "“Total cholesterol 234 mg/dL, LDL 162 mg/dL on labs from last month.”",
  ],
  "Z82.49":  [
    "“Father had a myocardial infarction at age 52.”",
    "“Maternal grandfather also had coronary artery disease in his 60s.”",
  ],
  "S93.401": [
    "“Patient twisted right ankle stepping off a curb — immediate swelling and inability to bear weight.”",
    "“Lateral ankle tenderness with positive anterior drawer sign on exam.”",
  ],
};

export default function R2Citation() {
  const [activeTab, setActiveTab] = useState("diagnostics");
  const [infoOpenCode, setInfoOpenCode] = useState<string | null>(null);
  const [infoOpenOrderId, setInfoOpenOrderId] = useState<string | null>(null);
  const [icd10, setIcd10] = useState<Array<CodeItem & { checked: boolean }>>(
    initialIcd10.map((c) => ({ ...c, checked: true }))
  );
  const [cpt, setCpt] = useState<CodeItem[]>(initialCpt);
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [orderSets, setOrderSets] = useState<OrderSetItem[]>(initialOrderSets);
  const [popover, setPopover] = useState<PopoverTarget | null>(null);
  const [popoverQuery, setPopoverQuery] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popover) return;
    setPopoverQuery("");
    const mousedownHandler = (e: MouseEvent) => {
      if (popoverRef.current?.contains(e.target as Node)) return;
      setPopover(null);
    };
    const scrollHandler = (e: Event) => {
      if (popoverRef.current?.contains(e.target as Node)) return;
      setPopover(null);
    };
    document.addEventListener("mousedown", mousedownHandler);
    window.addEventListener("scroll", scrollHandler, true);
    return () => {
      document.removeEventListener("mousedown", mousedownHandler);
      window.removeEventListener("scroll", scrollHandler, true);
    };
  }, [popover]);

  function openPopover(e: React.MouseEvent, list: PopoverTarget["list"], code?: string, setId?: string) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopover({ rect, list, code, setId });
  }

  function handleIcd10Select(item: CodeItem) {
    if (popover?.code) {
      const old = popover.code;
      setIcd10((prev) => prev.map((c) => (c.code === old ? { ...item, checked: c.checked } : c)));
      setOrders((prev) => prev.map((o) => o.relatedIcd === old ? { ...o, relatedIcd: item.code } : o));
      setOrderSets((prev) => prev.map((s) => ({
        ...s,
        relatedIcd: s.relatedIcd === old ? item.code : s.relatedIcd,
        children: s.children.map((c) => ({ ...c, relatedIcd: c.relatedIcd === old ? item.code : c.relatedIcd })),
      })));
    } else {
      setIcd10((prev) => [...prev, { ...item, checked: true }]);
    }
    setPopover(null);
  }

  function toggleIcd10(code: string) {
    setIcd10((prev) => prev.map((c) => c.code === code ? { ...c, checked: !c.checked } : c));
  }

  function handleCptSelect(item: CodeItem) {
    if (popover?.code) {
      setCpt((prev) => prev.map((c) => (c.code === popover.code ? item : c)));
    } else {
      setCpt((prev) => [...prev, item]);
    }
    setPopover(null);
  }

  function handleOrderSelect(opt: { id: string; label: string; baseLabel?: string; company?: string; detail: string; relatedIcd?: string }) {
    if (popover?.code) {
      const prevChecked = orders.find((o) => o.id === popover.code)?.checked ?? true;
      setOrders((prev) => prev.map((o) => o.id === popover.code ? { ...opt, checked: prevChecked } : o));
    } else {
      setOrders((prev) => [...prev, { ...opt, checked: true }]);
    }
    if (opt.relatedIcd && !icd10.find((c) => c.code === opt.relatedIcd)) {
      const match = icd10Pool.find((c) => c.code === opt.relatedIcd);
      if (match) setIcd10((prev) => [...prev, match]);
    }
    setPopover(null);
  }

  function handleOrderIcdSelect(item: CodeItem) {
    if (!popover?.code) return;
    setOrders((prev) => prev.map((o) => o.id === popover.code ? { ...o, relatedIcd: item.code } : o));
    if (!icd10.find((c) => c.code === item.code)) setIcd10((prev) => [...prev, { ...item, checked: true }]);
    setPopover(null);
  }

  function handleCompanySelect(opt: { id: string; label: string; baseLabel?: string; company?: string; detail: string; relatedIcd?: string }) {
    if (!popover?.code) return;
    const prevChecked = orders.find((o) => o.id === popover.code)?.checked ?? true;
    setOrders((prev) => prev.map((o) => o.id === popover.code ? { ...opt, checked: prevChecked } : o));
    if (opt.relatedIcd && !icd10.find((c) => c.code === opt.relatedIcd)) {
      const match = icd10Pool.find((c) => c.code === opt.relatedIcd);
      if (match) setIcd10((prev) => [...prev, match]);
    }
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
    setPopover(null);
  }

  function handleSetReplaceWithOrder(opt: typeof ordersPool[0]) {
    if (!popover?.code) return;
    setOrderSets((prev) => prev.filter((s) => s.id !== popover.code));
    setOrders((prev) => [...prev, { ...opt, checked: true }]);
    if (opt.relatedIcd && !icd10.find((c) => c.code === opt.relatedIcd)) {
      const match = icd10Pool.find((c) => c.code === opt.relatedIcd);
      if (match) setIcd10((prev) => [...prev, match]);
    }
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

  function handleSetLabCompanySelect(company: string) {
    if (!popover?.code) return;
    setOrderSets((prev) => prev.map((s) => s.id !== popover.code ? s : {
      ...s,
      defaultLabCompany: company,
      children: s.children.map((c) => c.type === "lab" ? { ...c, company } : c),
    }));
    setPopover(null);
  }

  function handleSetImagingCompanySelect(company: string) {
    if (!popover?.code) return;
    setOrderSets((prev) => prev.map((s) => s.id !== popover.code ? s : {
      ...s,
      defaultImagingCompany: company,
      children: s.children.map((c) => c.type === "imaging" ? { ...c, company } : c),
    }));
    setPopover(null);
  }

  function handleSetChildCompanySelect(variant: typeof ordersPool[0]) {
    if (!popover?.setId || !popover.code) return;
    setOrderSets((prev) => prev.map((s) => s.id !== popover.setId ? s : {
      ...s,
      children: s.children.map((c) => c.id !== popover.code ? c : {
        ...c,
        company: variant.company ?? c.company,
      }),
    }));
    setPopover(null);
  }

  function handleSetChildIcdSelect(item: CodeItem) {
    if (!popover?.setId || !popover.code) return;
    setOrderSets((prev) => prev.map((s) => s.id !== popover.setId ? s : {
      ...s,
      children: s.children.map((c) => c.id !== popover.code ? c : { ...c, relatedIcd: item.code }),
    }));
    if (!icd10.find((c) => c.code === item.code)) setIcd10((prev) => [...prev, { ...item, checked: true }]);
    setPopover(null);
  }

  function handleAddOrderSet(set: OrderSetPoolItem) {
    setOrderSets((prev) => [...prev, {
      id: set.id, label: set.baseLabel, baseLabel: set.baseLabel,
      defaultLabCompany: set.defaultLabCompany, defaultImagingCompany: set.defaultImagingCompany,
      relatedIcd: set.relatedIcd, children: set.children,
    }]);
    setPopover(null);
  }

  const adjacent =
    popover?.list === "icd10" && popover.code
      ? (icd10Adjacent[popover.code] ?? []).map((code) => icd10Pool.find((x) => x.code === code)!).filter(Boolean)
      : popover?.list === "icd10"
      ? [...new Set(icd10.flatMap((c) => icd10Adjacent[c.code] ?? []))]
          .filter((code) => !icd10.some((c) => c.code === code))
          .map((code) => icd10Pool.find((x) => x.code === code)!)
          .filter(Boolean)
      : popover?.list === "cpt" && popover.code
      ? (cptAdjacent[popover.code] ?? []).map((code) => cptPool.find((x) => x.code === code)!).filter(Boolean)
      : popover?.list === "cpt"
      ? [...new Set(cpt.flatMap((c) => cptAdjacent[c.code] ?? []))]
          .filter((code) => !cpt.some((c) => c.code === code))
          .map((code) => cptPool.find((x) => x.code === code)!)
          .filter(Boolean)
      : [];

  const companyVariants = popover?.list === "order-company" && popover.code
    ? ordersPool.filter((x) => {
        const current = orders.find((o) => o.id === popover.code);
        return current?.baseLabel && x.baseLabel === current.baseLabel && x.id !== popover.code;
      })
    : [];

  const setLabCompanyOptions: string[] = (() => {
    if (popover?.list !== "set-lab-company" || !popover.code) return [];
    const set = orderSets.find((s) => s.id === popover.code);
    if (!set) return [];
    const seen = new Set<string>();
    set.children.filter((c) => c.type === "lab").forEach((child) => {
      ordersPool.filter((x) => x.baseLabel === child.label && x.company).forEach((x) => seen.add(x.company!));
    });
    return Array.from(seen);
  })();

  const setImagingCompanyOptions: string[] = (() => {
    if (popover?.list !== "set-imaging-company" || !popover.code) return [];
    const set = orderSets.find((s) => s.id === popover.code);
    if (!set) return [];
    const seen = new Set<string>();
    set.children.filter((c) => c.type === "imaging").forEach((child) => {
      ordersPool.filter((x) => x.baseLabel === child.label && x.company).forEach((x) => seen.add(x.company!));
    });
    return Array.from(seen);
  })();

  const setChildCompanyVariants = (() => {
    if (popover?.list !== "set-child-company" || !popover.code || !popover.setId) return [];
    const set = orderSets.find((s) => s.id === popover.setId);
    const child = set?.children.find((c) => c.id === popover.code);
    if (!child) return [];
    return ordersPool.filter((x) => x.baseLabel === child.label && x.company !== child.company);
  })();

  const orderTitleSameBaseIds: Set<string> = (() => {
    if (popover?.list !== "order" || !popover.code) return new Set();
    const cur = orders.find((o) => o.id === popover.code);
    const bl = cur?.baseLabel ?? cur?.label;
    if (!bl) return new Set();
    return new Set(ordersPool.filter((x) => (x.baseLabel ?? x.label) === bl).map((x) => x.id));
  })();

  const orderTitleAdjacent = popover?.list === "order" && popover.code
    ? (ordersAdjacent[popover.code] ?? [])
        .filter((id) => !orderTitleSameBaseIds.has(id))
        .map((id) => ordersPool.find((x) => x.id === id)!)
        .filter(Boolean)
    : popover?.list === "order"
    ? [...new Set(orders.flatMap((o) => ordersAdjacent[o.id] ?? []))]
        .filter((id) => !orders.some((o) => o.id === id))
        .map((id) => ordersPool.find((x) => x.id === id)!)
        .filter(Boolean)
    : [];

  const orderTitleExclude = popover?.list === "order"
    ? [
        ...(popover.code
          ? orders.map((o) => o.id).filter((id) => id !== popover.code)
          : orders.map((o) => o.id)),
        ...Array.from(orderTitleSameBaseIds),
      ]
    : [];

  const POPOVER_MAX_H = 280;
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

        {/* ── Diagnostic Codes ─────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-[16px]">
            <h2 className="t-title-lg text-[var(--foreground-primary,#1a1a1a)]">
              Diagnostic Codes
            </h2>
          </div>

          {/* ICD-10 */}
          <div className="flex items-center justify-between mb-[8px]">
            <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">ICD10 Codes</span>
            {(() => {
              const allChecked = icd10.length > 0 && icd10.every((c) => c.checked);
              const someChecked = icd10.some((c) => c.checked);
              const state = allChecked ? "selected" : someChecked ? "indeterminate" : "unselected";
              function selectAll() {
                const next = !allChecked;
                setIcd10((prev) => prev.map((c) => ({ ...c, checked: next })));
              }
              return (
                <Button variant="tertiary" size="small" prefix={<Checkbox state={state} onChange={selectAll} />} onClick={selectAll}>
                  Select all
                </Button>
              );
            })()}
          </div>
          <div className="flex flex-col gap-[4px] mb-[24px]">
            {icd10.map((c) => {
              const evidence = evidenceMap[c.code] ?? [];
              const isInfoOpen = infoOpenCode === c.code;
              return (
                <div key={c.code} className="flex flex-col">
                  <div className="group flex items-start gap-[4px]">
                    <div className="flex items-center h-[28px] mt-[4px] shrink-0">
                      <Checkbox
                        state={c.checked ? "selected" : "unselected"}
                        onChange={() => toggleIcd10(c.code)}
                      />
                    </div>
                    <div
                      className="flex flex-col flex-1 px-[8px] py-[4px] rounded-[6px] group-hover:bg-[var(--surface-1,#f7f7f7)] cursor-pointer min-h-[28px] min-w-0"
                      onClick={(e) => openPopover(e, "icd10", c.code)}
                    >
                      <div className="flex items-center gap-[8px]">
                        <span className="shrink-0 w-[64px] t-title-sm text-[var(--foreground-brand,#1132ee)]">
                          {c.code}
                        </span>
                        <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">
                          {c.providerLabel ?? c.description}
                        </span>
                        <div className="shrink-0" onClick={(e) => { e.stopPropagation(); setInfoOpenCode((prev) => prev === c.code ? null : c.code); }}>
                          <IconButton size="small" variant="tertiary" icon={<Icon name="info" size={16} />} aria-label="Info" />
                        </div>
                      </div>
                      {c.providerLabel && (
                        <span className="t-body-sm text-[var(--foreground-secondary,#666)] ml-[72px]">
                          {c.description}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center h-[28px] mt-[4px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <IconButton size="small" variant="tertiary-neutral" icon={<Icon name="close" size={16} />}
                        onClick={(e) => { e.stopPropagation(); setIcd10((prev) => prev.filter((x) => x.code !== c.code)); }} aria-label="Remove" />
                    </div>
                  </div>
                  {isInfoOpen && evidence.length > 0 && (
                    <div className="mt-[4px] ml-[28px] bg-[var(--surface-1,#f7f7f7)] rounded-[12px] pl-[16px] pr-[12px] py-[12px] flex flex-col">
                      <div className="flex items-center justify-between mb-[10px]">
                        <span className="t-title-sm text-[var(--foreground-secondary,#666)]">
                          Evidence
                        </span>
                        <IconButton size="small" variant="tertiary-neutral" icon={<Icon name="close" size={16} />} onClick={() => setInfoOpenCode(null)} aria-label="Close evidence" />
                      </div>
                      {evidence.map((quote, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <div className="h-[1px] bg-[#e0e0e0] my-[10px]" />}
                          <div className="flex items-start justify-between gap-[12px]">
                            <span className="t-body-md text-[var(--foreground-primary,#1a1a1a)]">
                              {quote}
                            </span>
                            <span className="shrink-0 mt-[2px] text-[var(--foreground-secondary,#666)]">
                              <Icon name="chevron_right" size={16} />
                            </span>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <Button variant="tertiary" size="small" prefix={<Icon name="add" size={16} />}
              onClick={(e) => openPopover(e, "icd10")} className="self-start">Add ICD-10 code</Button>
          </div>
        </section>

        {/* ── Orders ───────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-[16px]">
            <h2 className="t-title-lg text-[var(--foreground-primary,#1a1a1a)]">
              Orders
            </h2>
            {(() => {
              const allItems = [
                ...orders.map((o) => o.checked),
                ...orderSets.flatMap((s) => s.children.map((c) => c.checked)),
              ];
              const allChecked = allItems.length > 0 && allItems.every(Boolean);
              const someChecked = allItems.some(Boolean);
              const state = allChecked ? "selected" : someChecked ? "indeterminate" : "unselected";
              function selectAll() {
                const next = !allChecked;
                setOrders((prev) => prev.map((o) => ({ ...o, checked: next })));
                setOrderSets((prev) => prev.map((s) => ({ ...s, children: s.children.map((c) => ({ ...c, checked: next })) })));
              }
              return (
                <Button variant="tertiary" size="small" prefix={<Checkbox state={state} onChange={selectAll} />} onClick={selectAll}>
                  Select all
                </Button>
              );
            })()}
          </div>
          <div className="flex flex-col gap-[8px]">
            {/* Individual orders */}
            {orders.map((o) => {
              const orderEvidence = ordersEvidenceMap[o.id] ?? [];
              const isOrderInfoOpen = infoOpenOrderId === o.id;
              return (
                <div key={o.id} className="flex flex-col">
                  <div className="group flex items-center gap-[4px] min-h-[28px]">
                    <Checkbox
                      state={o.checked ? "selected" : "unselected"}
                      onChange={() => toggleOrder(o.id)}
                    />
                    <div className="flex items-center gap-[4px] pr-[4px] group-hover:bg-[var(--surface-1,#f7f7f7)] rounded-[6px]">
                      <button
                        onClick={(e) => openPopover(e, "order", o.id)}
                        className="flex items-center h-[28px] px-[8px] text-left"
                      >
                        <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">
                          {o.baseLabel ?? o.label}
                        </span>
                      </button>
                      {o.company && (
                        <Chip label={o.company} color="neutral" size="XS" onClick={(e) => openPopover(e, "order-company", o.id)} />
                      )}
                      {o.relatedIcd ? (
                        <Chip label={o.relatedIcd} color="accent" size="XS" onClick={(e) => openPopover(e, "order-icd", o.id)} />
                      ) : (
                        <button
                          onClick={(e) => openPopover(e, "order-icd", o.id)}
                          className="text-[12px] text-[var(--foreground-tertiary,#808080)] hover:text-[var(--foreground-brand,#1132ee)] leading-[1.2] shrink-0 px-[2px]"
                        >
                          + link code
                        </button>
                      )}
                    </div>
                    <div className="shrink-0" onClick={(e) => { e.stopPropagation(); setInfoOpenOrderId((prev) => prev === o.id ? null : o.id); }}>
                      <IconButton size="small" variant="tertiary" icon={<Icon name="info" size={16} />} aria-label="Info" />
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <IconButton size="small" variant="tertiary-neutral" icon={<Icon name="close" size={16} />}
                        onClick={() => setOrders((prev) => prev.filter((x) => x.id !== o.id))} aria-label="Remove" />
                    </div>
                  </div>
                  {isOrderInfoOpen && orderEvidence.length > 0 && (
                    <div className="mt-[4px] ml-[28px] bg-[var(--surface-1,#f7f7f7)] rounded-[12px] pl-[16px] pr-[12px] py-[12px] flex flex-col">
                      <div className="flex items-center justify-between mb-[10px]">
                        <span className="t-title-sm text-[var(--foreground-secondary,#666)]">Evidence</span>
                        <IconButton size="small" variant="tertiary-neutral" icon={<Icon name="close" size={16} />} onClick={() => setInfoOpenOrderId(null)} aria-label="Close evidence" />
                      </div>
                      {orderEvidence.map((quote, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <div className="h-[1px] bg-[#e0e0e0] my-[10px]" />}
                          <div className="flex items-start justify-between gap-[12px]">
                            <span className="t-body-md text-[var(--foreground-primary,#1a1a1a)]">{quote}</span>
                            <span className="shrink-0 mt-[2px] text-[var(--foreground-secondary,#666)]"><Icon name="chevron_right" size={16} /></span>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Order sets */}
            {orderSets.map((set) => {
              const labChildren = set.children.filter((c) => c.type === "lab");
              const imagingChildren = set.children.filter((c) => c.type === "imaging");
              const labChipLabel = labChildren.length > 0
                ? (labChildren.every((c) => c.company === labChildren[0].company) ? labChildren[0].company : "Mixed labs")
                : null;
              const imagingChipLabel = imagingChildren.length > 0
                ? (imagingChildren.every((c) => c.company === imagingChildren[0].company) ? imagingChildren[0].company : "Mixed imaging")
                : null;
              const allChecked = set.children.every((c) => c.checked);
              const someChecked = set.children.some((c) => c.checked);
              const checkboxState = allChecked ? "selected" : someChecked ? "indeterminate" : "unselected";
              const setEvidence = ordersEvidenceMap[set.id] ?? [];
              const isSetInfoOpen = infoOpenOrderId === set.id;

              return (
                <div key={set.id} className="flex flex-col gap-[4px]">
                  {/* Set header */}
                  <div className="group flex items-center gap-[4px] min-h-[28px]">
                    <Checkbox
                      state={checkboxState}
                      onChange={() => toggleSet(set.id)}
                    />
                    <div className="flex items-center gap-[4px] pr-[4px] group-hover:bg-[var(--surface-1,#f7f7f7)] rounded-[6px]">
                      <button
                        onClick={(e) => openPopover(e, "set-title", set.id)}
                        className="flex items-center h-[28px] px-[8px] text-left"
                      >
                        <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">
                          {set.baseLabel ?? set.label}
                        </span>
                      </button>
                      {labChipLabel && (
                        <Chip label={labChipLabel} color="neutral" size="XS" onClick={(e) => openPopover(e, "set-lab-company", set.id)} />
                      )}
                      {imagingChipLabel && (
                        <Chip label={imagingChipLabel} color="neutral" size="XS" onClick={(e) => openPopover(e, "set-imaging-company", set.id)} />
                      )}
                      {set.relatedIcd && (
                        <Chip label={set.relatedIcd} color="accent" size="XS" onClick={(e) => openPopover(e, "icd10", set.relatedIcd)} />
                      )}
                    </div>
                    <div className="shrink-0" onClick={(e) => { e.stopPropagation(); setInfoOpenOrderId((prev) => prev === set.id ? null : set.id); }}>
                      <IconButton size="small" variant="tertiary" icon={<Icon name="info" size={16} />} aria-label="Info" />
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <IconButton size="small" variant="tertiary-neutral" icon={<Icon name="close" size={16} />}
                        onClick={() => setOrderSets((prev) => prev.filter((s) => s.id !== set.id))} aria-label="Remove" />
                    </div>
                  </div>

                  {/* Set evidence card */}
                  {isSetInfoOpen && setEvidence.length > 0 && (
                    <div className="ml-[28px] bg-[var(--surface-1,#f7f7f7)] rounded-[12px] pl-[16px] pr-[12px] py-[12px] flex flex-col">
                      <div className="flex items-center justify-between mb-[10px]">
                        <span className="t-title-sm text-[var(--foreground-secondary,#666)]">Evidence</span>
                        <IconButton size="small" variant="tertiary-neutral" icon={<Icon name="close" size={16} />} onClick={() => setInfoOpenOrderId(null)} aria-label="Close evidence" />
                      </div>
                      {setEvidence.map((quote, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <div className="h-[1px] bg-[#e0e0e0] my-[10px]" />}
                          <div className="flex items-start justify-between gap-[12px]">
                            <span className="t-body-md text-[var(--foreground-primary,#1a1a1a)]">{quote}</span>
                            <span className="shrink-0 mt-[2px] text-[var(--foreground-secondary,#666)]"><Icon name="chevron_right" size={16} /></span>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Children with vertical line */}
                  <div className="ml-[12px] pl-[12px] border-l-2 border-[#ebebeb] flex flex-col gap-[4px]">
                    {set.children.map((child) => (
                      <div key={child.id} className="flex items-center gap-[8px] min-h-[28px]">
                        <Checkbox
                          state={child.checked ? "selected" : "unselected"}
                          onChange={() => toggleSetChild(set.id, child.id)}
                        />
                        <span className="t-body-md text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">
                          {child.label}
                        </span>
                        <Chip
                          label={child.company}
                          color="neutral"
                          size="XS"
                          onClick={(e) => openPopover(e, "set-child-company", child.id, set.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <Button variant="tertiary" size="small" prefix={<Icon name="add" size={16} />}
              onClick={(e) => openPopover(e, "order")} className="self-start">Add order</Button>
          </div>
        </section>

      </div>

      {/* ── Floating popover ─────────────────────────────────────────── */}
      {popover && (
        <div
          ref={popoverRef}
          style={popoverStyle}
          onMouseDown={(e) => e.stopPropagation()}
          className=""
        >
          {popover.list === "set-title" ? (() => {
            const q = popoverQuery.toLowerCase();
            const matchesSet = (s: typeof orderSetsPool[0]) => {
              const co = [s.defaultLabCompany, s.defaultImagingCompany].filter(Boolean).join(" ").toLowerCase();
              return s.baseLabel.toLowerCase().includes(q) || co.includes(q);
            };
            const matchesOrder = (o: typeof ordersPool[0]) =>
              (o.baseLabel ?? o.label).toLowerCase().includes(q) || o.detail.toLowerCase().includes(q);
            const adjIdSet = new Set(popover.code ? (orderSetsAdjacent[popover.code] ?? []) : []);
            const adjSets = orderSetsPool.filter((s) => s.id !== popover.code && adjIdSet.has(s.id) && (q === "" || matchesSet(s)));
            // Children of current set as individual order alternatives
            const currentSet = orderSets.find((s) => s.id === popover.code);
            const seenChildLabels = new Set<string>();
            const childOrders = (currentSet?.children ?? [])
              .map((c) => ordersPool.find((o) => o.baseLabel === c.label && o.company === c.company))
              .filter((o): o is typeof ordersPool[0] => !!o)
              .filter((o) => {
                const key = o.baseLabel ?? o.label;
                if (seenChildLabels.has(key)) return false;
                seenChildLabels.add(key);
                return q === "" || matchesOrder(o);
              });
            const yourSets = orderSetsPool.filter((s) =>
              s.id !== popover.code &&
              !adjIdSet.has(s.id) &&
              !orderSets.some((os) => os.id === s.id) &&
              (q === "" || matchesSet(s))
            );
            const seenOrderLabels = new Set<string>();
            const filteredOrders = ordersPool.filter((o) => {
              if (q !== "" && !matchesOrder(o)) return false;
              const key = o.baseLabel ?? o.label;
              if (seenOrderLabels.has(key)) return false;
              seenOrderLabels.add(key);
              return true;
            });
            const hasSuggested = adjSets.length > 0 || childOrders.length > 0;
            const hasResults = hasSuggested || yourSets.length > 0 || filteredOrders.length > 0;
            return (
              <Menu>
                <MenuSearch value={popoverQuery} onChange={setPopoverQuery} onClose={() => setPopover(null)} placeholder="Search order sets & orders…" />
                <div className="overflow-y-auto max-h-[280px]">
                  {hasSuggested && (
                    <>
                      <MenuHeader>Suggested</MenuHeader>
                      {adjSets.map((s) => <MenuItem key={s.id} label={s.baseLabel} onClick={() => handleSetTitleSelect(s)} />)}
                      {childOrders.map((o) => <MenuItem key={o.id} label={o.baseLabel ?? o.label} onClick={() => handleSetReplaceWithOrder(o)} />)}
                    </>
                  )}
                  {yourSets.length > 0 && (
                    <>
                      <MenuHeader>Your Order Sets</MenuHeader>
                      {yourSets.map((s) => <MenuItem key={s.id} label={s.baseLabel} onClick={() => handleSetTitleSelect(s)} />)}
                    </>
                  )}
                  {filteredOrders.length > 0 && (
                    <>
                      <MenuHeader>All Orders</MenuHeader>
                      {filteredOrders.map((o) => <MenuItem key={o.id} label={o.baseLabel ?? o.label} onClick={() => handleSetReplaceWithOrder(o)} />)}
                    </>
                  )}
                  {!hasResults && <p className="px-[8px] py-[8px] text-[13px] text-[var(--foreground-tertiary,#808080)]">No results found</p>}
                </div>
              </Menu>
            );
          })() : popover.list === "order" ? (() => {
            const q = popoverQuery.toLowerCase();
            const matches = (o: typeof ordersPool[0]) =>
              (o.baseLabel ?? o.label).toLowerCase().includes(q) || o.detail.toLowerCase().includes(q);
            const adjSeenLabels = new Set<string>();
            const filteredAdj = orderTitleAdjacent.filter((o) => {
              if (q !== "" && !matches(o)) return false;
              const key = o.baseLabel ?? o.label;
              if (adjSeenLabels.has(key)) return false;
              adjSeenLabels.add(key);
              return true;
            });
            const adjIds = new Set(orderTitleAdjacent.map((o) => o.id));
            const adjBaseLabels = new Set(filteredAdj.map((o) => o.baseLabel ?? o.label));
            const seenLabels = new Set<string>();
            const filteredRest = ordersPool.filter((o) => {
              if (orderTitleExclude.includes(o.id) || adjIds.has(o.id)) return false;
              if (q !== "" && !matches(o)) return false;
              const key = o.baseLabel ?? o.label;
              if (seenLabels.has(key) || adjBaseLabels.has(key)) return false;
              seenLabels.add(key);
              return true;
            });
            const addableSets = !popover.code
              ? orderSetsPool.filter((s) => {
                  if (orderSets.some((os) => os.id === s.id)) return false;
                  if (q === "") return true;
                  const co = [s.defaultLabCompany, s.defaultImagingCompany].filter(Boolean).join(" ").toLowerCase();
                  return s.baseLabel.toLowerCase().includes(q) || co.includes(q);
                })
              : [];
            const isEmpty = filteredAdj.length === 0 && addableSets.length === 0 && filteredRest.length === 0;
            return (
              <Menu>
                <MenuSearch value={popoverQuery} onChange={setPopoverQuery} onClose={() => setPopover(null)} placeholder="Search orders…" />
                <div className="overflow-y-auto max-h-[280px]">
                  {filteredAdj.length > 0 && (
                    <>
                      <MenuHeader>Suggested</MenuHeader>
                      {filteredAdj.map((o) => <MenuItem key={o.id} label={o.baseLabel ?? o.label} onClick={() => handleOrderSelect(o)} />)}
                    </>
                  )}
                  {addableSets.length > 0 && (
                    <>
                      <MenuHeader>Your Order Sets</MenuHeader>
                      {addableSets.map((s) => {
                        const co = [s.defaultLabCompany, s.defaultImagingCompany].filter(Boolean).join(" · ");
                        return (
                          <MenuItem
                            key={s.id}
                            label={s.baseLabel + (co ? ` (${co})` : "")}
                            description={`${s.children.length} orders${s.relatedIcd ? ` · ${s.relatedIcd}` : ""}`}
                            onClick={() => handleAddOrderSet(s)}
                          />
                        );
                      })}
                    </>
                  )}
                  {filteredRest.length > 0 && (
                    <>
                      {(filteredAdj.length > 0 || addableSets.length > 0) && <MenuHeader>All Orders</MenuHeader>}
                      {filteredRest.map((o) => <MenuItem key={o.id} label={o.baseLabel ?? o.label} onClick={() => handleOrderSelect(o)} />)}
                    </>
                  )}
                  {isEmpty && <p className="px-[8px] py-[8px] text-[13px] text-[var(--foreground-tertiary,#808080)]">No orders found</p>}
                </div>
              </Menu>
            );
          })() : popover.list === "order-icd" ? (() => {
            const cur = orders.find((o) => o.id === popover.code)?.relatedIcd;
            const ph = cur ? `Replace ${cur}…` : "Link ICD-10 code…";
            const q = popoverQuery.toLowerCase();
            const mc = (c: CodeItemType) => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
            const visitCodes = icd10.filter((c) => c.code !== cur);
            const visitCodeSet = new Set(icd10.map((c) => c.code));
            const fVisit = visitCodes.filter((c) => q === "" || mc(c));
            const fRest = icd10Pool.filter((c) => !visitCodeSet.has(c.code) && c.code !== cur && (q === "" || mc(c)));
            return (
              <Menu>
                <MenuSearch value={popoverQuery} onChange={setPopoverQuery} onClose={() => setPopover(null)} placeholder={ph} />
                <div className="overflow-y-auto max-h-[220px]">
                  {fVisit.length > 0 && (<><MenuHeader>Your current codes</MenuHeader>{fVisit.map((c) => <CodeMenuItem key={c.code} item={c} onSelect={handleOrderIcdSelect} />)}{fRest.length > 0 && <MenuHeader>Add more codes</MenuHeader>}</>)}
                  {fRest.map((c) => <CodeMenuItem key={c.code} item={c} onSelect={handleOrderIcdSelect} />)}
                  {fVisit.length === 0 && fRest.length === 0 && <p className="px-[8px] py-[8px] text-[13px] text-[var(--foreground-tertiary,#808080)]">No codes found</p>}
                </div>
              </Menu>
            );
          })() : popover.list === "order-company" ? (
            <Menu>
              <MenuHeader>Select vendor</MenuHeader>
              {companyVariants.map((variant) => (
                <MenuItem key={variant.id} label={variant.company ?? ""} onClick={() => handleCompanySelect(variant)} />
              ))}
            </Menu>
          ) : popover.list === "set-lab-company" ? (
            <Menu>
              <MenuHeader>Select vendor</MenuHeader>
              {setLabCompanyOptions.map((company) => (
                <MenuItem key={company} label={company} onClick={() => handleSetLabCompanySelect(company)} />
              ))}
            </Menu>
          ) : popover.list === "set-imaging-company" ? (
            <Menu>
              <MenuHeader>Select vendor</MenuHeader>
              {setImagingCompanyOptions.map((company) => (
                <MenuItem key={company} label={company} onClick={() => handleSetImagingCompanySelect(company)} />
              ))}
            </Menu>
          ) : popover.list === "set-child-company" ? (
            <Menu>
              <MenuHeader>Select vendor</MenuHeader>
              {setChildCompanyVariants.map((variant) => (
                <MenuItem key={variant.id} label={variant.company ?? ""} onClick={() => handleSetChildCompanySelect(variant)} />
              ))}
            </Menu>
          ) : popover.list === "set-child-icd" ? (() => {
            const set = orderSets.find((s) => s.id === popover.setId);
            const cur = set?.children.find((c) => c.id === popover.code)?.relatedIcd;
            const ph = cur ? `Replace ${cur}…` : "Link ICD-10 code…";
            const q = popoverQuery.toLowerCase();
            const mc = (c: CodeItemType) => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
            const visitCodes = icd10.filter((c) => c.code !== cur);
            const visitCodeSet = new Set(icd10.map((c) => c.code));
            const fVisit = visitCodes.filter((c) => q === "" || mc(c));
            const fRest = icd10Pool.filter((c) => !visitCodeSet.has(c.code) && c.code !== cur && (q === "" || mc(c)));
            return (
              <Menu>
                <MenuSearch value={popoverQuery} onChange={setPopoverQuery} onClose={() => setPopover(null)} placeholder={ph} />
                <div className="overflow-y-auto max-h-[220px]">
                  {fVisit.length > 0 && (<><MenuHeader>Your current codes</MenuHeader>{fVisit.map((c) => <CodeMenuItem key={c.code} item={c} onSelect={handleSetChildIcdSelect} />)}{fRest.length > 0 && <MenuHeader>Add more codes</MenuHeader>}</>)}
                  {fRest.map((c) => <CodeMenuItem key={c.code} item={c} onSelect={handleSetChildIcdSelect} />)}
                  {fVisit.length === 0 && fRest.length === 0 && <p className="px-[8px] py-[8px] text-[13px] text-[var(--foreground-tertiary,#808080)]">No codes found</p>}
                </div>
              </Menu>
            );
          })() : (() => {
            const pool = popover.list === "icd10" ? icd10Pool : cptPool;
            const exclude = popover.list === "icd10"
              ? icd10.map((c) => c.code).filter((c) => c !== popover.code)
              : cpt.map((c) => c.code).filter((c) => c !== popover.code);
            const onSelect = popover.list === "icd10" ? handleIcd10Select : handleCptSelect;
            const ph = popover.code ? `Replace ${popover.code}…` : popover.list === "icd10" ? "Search ICD-10 codes…" : "Search CPT codes…";
            const q = popoverQuery.toLowerCase();
            const mc = (c: CodeItemType) => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
            const fAdj = adjacent.filter((c) => !exclude.includes(c.code) && (q === "" || mc(c)));
            const adjCodes = new Set(adjacent.map((c) => c.code));
            const fRest = pool.filter((c) => !exclude.includes(c.code) && !adjCodes.has(c.code) && (q === "" || mc(c)));
            return (
              <Menu>
                <MenuSearch value={popoverQuery} onChange={setPopoverQuery} onClose={() => setPopover(null)} placeholder={ph} />
                <div className="overflow-y-auto max-h-[220px]">
                  {fAdj.length > 0 && (<><MenuHeader>Suggested</MenuHeader>{fAdj.map((c) => <CodeMenuItem key={c.code} item={c} onSelect={onSelect} />)}</>)}
                  {fRest.length > 0 && <MenuHeader>All Codes</MenuHeader>}
                  {fRest.map((c) => <CodeMenuItem key={c.code} item={c} onSelect={onSelect} />)}
                  {fAdj.length === 0 && fRest.length === 0 && <p className="px-[8px] py-[8px] text-[13px] text-[var(--foreground-tertiary,#808080)]">No codes found</p>}
                </div>
              </Menu>
            );
          })()}
        </div>
      )}
    </ScribeLayout>
  );
}
