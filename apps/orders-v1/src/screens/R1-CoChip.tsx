import React, { useState, useEffect } from "react";
import { Button, IconButton, Icon, Checkbox, Chip } from "@ds/ui";
import { ScribeLayout } from "../components/ScribeLayout";
import { CodeSearch, OrderSearch, SetOrOrderSearch } from "../components/CodeSearch";
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

export default function R2Inline() {
  const [activeTab, setActiveTab] = useState("diagnostics");
  const [icd10, setIcd10] = useState<CodeItem[]>(initialIcd10);
  const [cpt, setCpt] = useState<CodeItem[]>(initialCpt);
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [orderSets, setOrderSets] = useState<OrderSetItem[]>(initialOrderSets);
  const [popover, setPopover] = useState<PopoverTarget | null>(null);

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
    if (!icd10.find((c) => c.code === item.code)) setIcd10((prev) => [...prev, item]);
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
    if (!icd10.find((c) => c.code === item.code)) setIcd10((prev) => [...prev, item]);
    setPopover(null);
  }

  const adjacent =
    popover?.list === "icd10" && popover.code
      ? (icd10Adjacent[popover.code] ?? []).map((code) => icd10Pool.find((x) => x.code === code)!).filter(Boolean)
      : popover?.list === "cpt" && popover.code
      ? (cptAdjacent[popover.code] ?? []).map((code) => cptPool.find((x) => x.code === code)!).filter(Boolean)
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

  // For "order" popover (title click): exclude same-baseLabel items so we show
  // different orders, not the same order at a different vendor.
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
            <Button variant="tertiary" size="small" prefix={<Icon name="content_copy" size={16} />}>Copy Codes</Button>
          </div>
          <div className="flex flex-col gap-[2px] mb-[24px]">
            {icd10.map((c) => (
              <div key={c.code} className="group flex items-center gap-[4px]">
                <div
                  className="flex items-center h-[28px] px-[8px] gap-[8px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] cursor-pointer"
                  onClick={(e) => openPopover(e, "icd10", c.code)}
                >
                  <span className="w-[80px] shrink-0 t-title-sm text-[var(--foreground-brand,#1132ee)]">
                    {c.code}
                  </span>
                  <span className="t-body-md text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">
                    {c.description}
                  </span>
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

          {/* CPT */}
          <div className="flex items-center justify-between mb-[8px]">
            <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">CPT Codes</span>
            <Button variant="tertiary" size="small" prefix={<Icon name="content_copy" size={16} />}>Copy Codes</Button>
          </div>
          <div className="flex flex-col gap-[2px]">
            {cpt.map((c) => (
              <div key={c.code} className="group flex items-center gap-[4px]">
                <div
                  className="flex items-center h-[28px] px-[8px] gap-[8px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] cursor-pointer"
                  onClick={(e) => openPopover(e, "cpt", c.code)}
                >
                  <span className="w-[80px] shrink-0 t-title-sm text-[var(--foreground-brand,#1132ee)]">
                    {c.code}
                  </span>
                  <span className="t-body-md text-[var(--foreground-primary,#1a1a1a)] whitespace-nowrap">
                    {c.description}
                  </span>
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

        {/* ── Orders ───────────────────────────────────────────────── */}
        <section>
          <h2 className="t-title-lg text-[var(--foreground-primary,#1a1a1a)] mb-[16px]">
            Orders
          </h2>
          <div className="flex flex-col gap-[8px]">
            {/* Individual orders */}
            {orders.map((o) => (
              <div key={o.id} className="group flex items-center gap-[4px] min-h-[28px]">
                <button
                  onClick={(e) => openPopover(e, "order", o.id)}
                  className="flex items-center h-[28px] px-[8px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] text-left"
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
                <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <IconButton size="small" variant="tertiary-neutral" icon={<Icon name="close" size={16} />}
                    onClick={() => setOrders((prev) => prev.filter((x) => x.id !== o.id))} aria-label="Remove" />
                </div>
              </div>
            ))}

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

              return (
                <div key={set.id} className="flex flex-col gap-[4px]">
                  {/* Set header */}
                  <div className="group flex items-center gap-[4px] min-h-[28px]">
                    <button
                      onClick={(e) => openPopover(e, "set-title", set.id)}
                      className="flex items-center h-[28px] px-[8px] rounded-[6px] hover:bg-[var(--surface-1,#f7f7f7)] text-left"
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
                      <Chip label={set.relatedIcd} color="accent" size="XS" />
                    )}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <IconButton size="small" variant="tertiary-neutral" icon={<Icon name="close" size={16} />}
                        onClick={() => setOrderSets((prev) => prev.filter((s) => s.id !== set.id))} aria-label="Remove" />
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex flex-col gap-[4px]">
                    {set.children.map((child) => (
                      <div key={child.id} className="flex items-center gap-[4px] min-h-[28px]">
                        <Checkbox
                          className="ml-[3px]"
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
              adjacent={orderTitleAdjacent}
              exclude={orderTitleExclude}
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
                  Select vendor for {orders.find((o) => o.id === popover.code)?.baseLabel}
                </span>
              </div>
              <div className="py-[4px]">
                {companyVariants.map((variant) => (
                  <button
                    key={variant.id}
                    onMouseDown={(e) => { e.preventDefault(); handleCompanySelect(variant); }}
                    className="w-full flex items-center gap-[8px] px-[12px] py-[6px] hover:bg-[var(--surface-1,#f7f7f7)] text-left"
                  >
                    <span className="text-[13px] font-bold text-[var(--foreground-primary,#1a1a1a)] leading-[1.2] w-[80px] shrink-0">{variant.company}</span>
                    <span className="text-[12px] text-[var(--foreground-secondary,#666)] leading-[1.4]">{variant.detail}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : popover.list === "set-lab-company" ? (
            <div className="flex flex-col bg-white">
              <div className="flex items-center gap-[8px] px-[12px] py-[8px] border-b border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                <Icon name="science" size={16} className="text-[var(--foreground-tertiary,#808080)] shrink-0" />
                <span className="text-[13px] text-[var(--foreground-secondary,#666)] leading-[1.4]">
                  Select vendor for all labs in {orderSets.find((s) => s.id === popover.code)?.label}
                </span>
              </div>
              <div className="py-[4px]">
                {setLabCompanyOptions.map((company) => (
                  <button
                    key={company}
                    onMouseDown={(e) => { e.preventDefault(); handleSetLabCompanySelect(company); }}
                    className="w-full flex items-center px-[12px] py-[6px] hover:bg-[var(--surface-1,#f7f7f7)] text-left"
                  >
                    <span className="text-[13px] font-bold text-[var(--foreground-primary,#1a1a1a)] leading-[1.2]">{company}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : popover.list === "set-imaging-company" ? (
            <div className="flex flex-col bg-white">
              <div className="flex items-center gap-[8px] px-[12px] py-[8px] border-b border-[var(--shape-outline,rgba(0,0,0,0.1))]">
                <Icon name="radiology" size={16} className="text-[var(--foreground-tertiary,#808080)] shrink-0" />
                <span className="text-[13px] text-[var(--foreground-secondary,#666)] leading-[1.4]">
                  Select vendor for all imaging in {orderSets.find((s) => s.id === popover.code)?.label}
                </span>
              </div>
              <div className="py-[4px]">
                {setImagingCompanyOptions.map((company) => (
                  <button
                    key={company}
                    onMouseDown={(e) => { e.preventDefault(); handleSetImagingCompanySelect(company); }}
                    className="w-full flex items-center px-[12px] py-[6px] hover:bg-[var(--surface-1,#f7f7f7)] text-left"
                  >
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
                    return `Select vendor for ${child?.label}`;
                  })()}
                </span>
              </div>
              <div className="py-[4px]">
                {setChildCompanyVariants.map((variant) => (
                  <button
                    key={variant.id}
                    onMouseDown={(e) => { e.preventDefault(); handleSetChildCompanySelect(variant); }}
                    className="w-full flex items-center gap-[8px] px-[12px] py-[6px] hover:bg-[var(--surface-1,#f7f7f7)] text-left"
                  >
                    <span className="text-[13px] font-bold text-[var(--foreground-primary,#1a1a1a)] leading-[1.2] w-[80px] shrink-0">{variant.company}</span>
                    <span className="text-[12px] text-[var(--foreground-secondary,#666)] leading-[1.4]">{variant.detail}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : popover.list === "set-child-icd" ? (
            <CodeSearch
              pool={icd10Pool}
              adjacent={(() => {
                const set = orderSets.find((s) => s.id === popover.setId);
                const cur = set?.children.find((c) => c.id === popover.code)?.relatedIcd;
                return cur ? (icd10Adjacent[cur] ?? []).map((code) => icd10Pool.find((x) => x.code === code)!).filter(Boolean) : [];
              })()}
              exclude={[]}
              onSelect={handleSetChildIcdSelect}
              onClose={() => setPopover(null)}
              placeholder={(() => {
                const set = orderSets.find((s) => s.id === popover.setId);
                const cur = set?.children.find((c) => c.id === popover.code)?.relatedIcd;
                return cur ? `Replace ${cur}…` : "Link ICD-10 code…";
              })()}
            />
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
