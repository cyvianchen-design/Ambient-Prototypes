import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@ds/ui";
import type { CodeItem } from "../data/mockCodes";

// Minimal shape needed by SetOrOrderSearch — compatible with OrderSetPoolItem
type SetOption = {
  id: string;
  baseLabel: string;
  defaultLabCompany?: string;
  defaultImagingCompany?: string;
  relatedIcd?: string;
  children: { label: string; type?: "lab" | "imaging" }[];
};

type Props = {
  pool: CodeItem[];
  adjacent?: CodeItem[];
  exclude?: string[];           // codes already in the list
  onSelect: (item: CodeItem) => void;
  onClose: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
};

export function CodeSearch({
  pool,
  adjacent = [],
  exclude = [],
  onSelect,
  onClose,
  placeholder = "Search codes…",
  autoFocus = true,
  className = "",
}: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const q = query.toLowerCase();

  const matchesQuery = (c: CodeItem) =>
    c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);

  const filteredAdjacent = adjacent.filter(
    (c) => !exclude.includes(c.code) && (q === "" || matchesQuery(c))
  );
  const adjacentCodes = new Set(adjacent.map((c) => c.code));
  const filteredRest = pool.filter(
    (c) => !exclude.includes(c.code) && !adjacentCodes.has(c.code) && (q === "" || matchesQuery(c))
  );

  const isEmpty = filteredAdjacent.length === 0 && filteredRest.length === 0;

  return (
    <div className={`flex flex-col bg-white ${className}`}>
      {/* Input */}
      <div className="flex items-center gap-[8px] px-[12px] py-[8px] border-b border-[var(--shape-outline,rgba(0,0,0,0.1))]">
        <Icon name="search" size={16} className="text-[var(--foreground-tertiary,#808080)] shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          placeholder={placeholder}
          className="flex-1 min-w-0 text-[13px] leading-[1.4] text-[var(--foreground-primary,#1a1a1a)] placeholder-[var(--foreground-tertiary,#808080)] outline-none bg-transparent"
          style={{ fontFamily: "Lato, sans-serif" }}
        />
        {query && (
          <button onClick={() => setQuery("")} className="shrink-0 text-[var(--foreground-tertiary,#808080)] hover:text-[var(--foreground-primary,#1a1a1a)]">
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="overflow-y-auto max-h-[220px] py-[4px]" onMouseDown={(e) => e.stopPropagation()}>
        {filteredAdjacent.length > 0 && (
          <>
            <GroupLabel label="Suggested" />
            {filteredAdjacent.map((c) => <CodeRow key={c.code} item={c} onSelect={onSelect} />)}
            {filteredRest.length > 0 && <GroupLabel label="All Codes" />}
          </>
        )}
        {filteredRest.map((c) => <CodeRow key={c.code} item={c} onSelect={onSelect} />)}
        {isEmpty && (
          <p className="px-[12px] py-[8px] text-[13px] text-[var(--foreground-tertiary,#808080)]" style={{ fontFamily: "Lato, sans-serif" }}>
            No codes found
          </p>
        )}
      </div>
    </div>
  );
}

function GroupLabel({ label }: { label: string }) {
  return (
    <div className="px-[12px] pt-[6px] pb-[2px]">
      <span className="text-[11px] font-bold tracking-[0.13px] text-[var(--foreground-tertiary,#808080)]" style={{ fontFamily: "Lato, sans-serif" }}>
        {label}
      </span>
    </div>
  );
}

function CodeRow({ item, onSelect }: { item: CodeItem; onSelect: (item: CodeItem) => void }) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onSelect(item); }}
      className="w-full flex items-center gap-[8px] px-[12px] py-[6px] hover:bg-[var(--surface-1,#f7f7f7)] text-left transition-colors"
      style={{ fontFamily: "Lato, sans-serif" }}
    >
      <span className="text-[13px] font-bold text-[var(--foreground-brand,#1132ee)] w-[64px] shrink-0 leading-[1.2] tracking-[0.13px]" style={{ fontFeatureSettings: "'ss07'" }}>
        {item.code}
      </span>
      <span className="text-[13px] font-normal text-[var(--foreground-primary,#1a1a1a)] leading-[1.4] flex-1 min-w-0 truncate">
        {item.description}
      </span>
    </button>
  );
}

// ─── Order search variant ─────────────────────────────────────────────────────

type OrderOption = { id: string; label: string; baseLabel?: string; detail: string; relatedIcd?: string };

type OrderSearchProps = {
  pool: OrderOption[];
  adjacent?: OrderOption[];
  exclude?: string[];
  onSelect: (item: OrderOption) => void;
  onClose: () => void;
  autoFocus?: boolean;
  className?: string;
};

export function OrderSearch({
  pool,
  adjacent = [],
  exclude = [],
  onSelect,
  onClose,
  autoFocus = true,
  className = "",
}: OrderSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const q = query.toLowerCase();
  const matches = (o: OrderOption) =>
    o.label.toLowerCase().includes(q) || o.detail.toLowerCase().includes(q);

  const filteredAdjacent = adjacent.filter(
    (o) => !exclude.includes(o.id) && (q === "" || matches(o))
  );
  const adjacentIds = new Set(adjacent.map((o) => o.id));
  const filteredRest = pool.filter(
    (o) => !exclude.includes(o.id) && !adjacentIds.has(o.id) && (q === "" || matches(o))
  );
  const isEmpty = filteredAdjacent.length === 0 && filteredRest.length === 0;

  return (
    <div className={`flex flex-col bg-white ${className}`}>
      <div className="flex items-center gap-[8px] px-[12px] py-[8px] border-b border-[var(--shape-outline,rgba(0,0,0,0.1))]">
        <Icon name="search" size={16} className="text-[var(--foreground-tertiary,#808080)] shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          placeholder="Search orders…"
          className="flex-1 min-w-0 text-[13px] leading-[1.4] text-[var(--foreground-primary,#1a1a1a)] placeholder-[var(--foreground-tertiary,#808080)] outline-none bg-transparent"
          style={{ fontFamily: "Lato, sans-serif" }}
        />
        {query && (
          <button onClick={() => setQuery("")} className="shrink-0 text-[var(--foreground-tertiary,#808080)]">
            <Icon name="close" size={14} />
          </button>
        )}
      </div>
      <div className="overflow-y-auto max-h-[220px] py-[4px]" onMouseDown={(e) => e.stopPropagation()}>
        {filteredAdjacent.length > 0 && (
          <>
            <GroupLabel label="Suggested" />
            {filteredAdjacent.map((o) => <OrderRow key={o.id} item={o} onSelect={onSelect} />)}
            {filteredRest.length > 0 && <GroupLabel label="All Orders" />}
          </>
        )}
        {filteredRest.map((o) => <OrderRow key={o.id} item={o} onSelect={onSelect} />)}
        {isEmpty && (
          <p className="px-[12px] py-[8px] text-[13px] text-[var(--foreground-tertiary,#808080)]" style={{ fontFamily: "Lato, sans-serif" }}>No orders found</p>
        )}
      </div>
    </div>
  );
}

function OrderRow({ item, onSelect }: { item: OrderOption; onSelect: (item: OrderOption) => void }) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onSelect(item); }}
      className="w-full flex flex-col gap-[2px] px-[12px] py-[6px] hover:bg-[var(--surface-1,#f7f7f7)] text-left transition-colors"
      style={{ fontFamily: "Lato, sans-serif" }}
    >
      <span className="text-[13px] font-bold text-[var(--foreground-primary,#1a1a1a)] leading-[1.2] tracking-[0.13px]" style={{ fontFeatureSettings: "'ss07'" }}>
        {item.baseLabel ?? item.label}
      </span>
      <span className="text-[12px] font-normal text-[var(--foreground-secondary,#666)] leading-[1.4]">{item.detail}</span>
    </button>
  );
}

// ─── Set-or-order picker ──────────────────────────────────────────────────────
// Used when clicking an order-set title to switch to a different set or a single order.

type SetOrOrderSearchProps = {
  setPool: SetOption[];
  orderPool: OrderOption[];
  adjacentSetIds?: string[];
  currentSetId?: string;
  onSelectSet: (item: SetOption) => void;
  onSelectOrder: (item: OrderOption) => void;
  onClose: () => void;
  className?: string;
};

export function SetOrOrderSearch({
  setPool,
  orderPool,
  adjacentSetIds = [],
  currentSetId,
  onSelectSet,
  onSelectOrder,
  onClose,
  className = "",
}: SetOrOrderSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const q = query.toLowerCase();
  const matchesSet = (s: SetOption) => {
    const companies = [s.defaultLabCompany, s.defaultImagingCompany].filter(Boolean).join(" ").toLowerCase();
    return s.baseLabel.toLowerCase().includes(q) || companies.includes(q);
  };
  const matchesOrder = (o: OrderOption) =>
    o.label.toLowerCase().includes(q) || o.detail.toLowerCase().includes(q);

  const adjIdSet = new Set(adjacentSetIds);
  const adjacentSets = setPool.filter((s) => s.id !== currentSetId && adjIdSet.has(s.id) && (q === "" || matchesSet(s)));
  const otherSets    = setPool.filter((s) => s.id !== currentSetId && !adjIdSet.has(s.id) && (q === "" || matchesSet(s)));
  const filteredOrders = orderPool.filter((o) => q === "" || matchesOrder(o));
  const hasResults = adjacentSets.length > 0 || otherSets.length > 0 || filteredOrders.length > 0;

  return (
    <div className={`flex flex-col bg-white ${className}`}>
      <div className="flex items-center gap-[8px] px-[12px] py-[8px] border-b border-[var(--shape-outline,rgba(0,0,0,0.1))]">
        <Icon name="search" size={16} className="text-[var(--foreground-tertiary,#808080)] shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          placeholder="Search order sets & orders…"
          className="flex-1 min-w-0 text-[13px] leading-[1.4] text-[var(--foreground-primary,#1a1a1a)] placeholder-[var(--foreground-tertiary,#808080)] outline-none bg-transparent"
          style={{ fontFamily: "Lato, sans-serif" }}
        />
        {query && (
          <button onClick={() => setQuery("")} className="shrink-0 text-[var(--foreground-tertiary,#808080)]">
            <Icon name="close" size={14} />
          </button>
        )}
      </div>
      <div className="overflow-y-auto max-h-[280px] py-[4px]" onMouseDown={(e) => e.stopPropagation()}>
        {adjacentSets.length > 0 && (
          <>
            <GroupLabel label="Suggested" />
            {adjacentSets.map((s) => <SetRow key={s.id} item={s} onSelect={onSelectSet} />)}
          </>
        )}
        {otherSets.length > 0 && (
          <>
            {(adjacentSets.length > 0 || filteredOrders.length > 0) && <GroupLabel label="Order Sets" />}
            {otherSets.map((s) => <SetRow key={s.id} item={s} onSelect={onSelectSet} />)}
          </>
        )}
        {filteredOrders.length > 0 && (
          <>
            {(adjacentSets.length > 0 || otherSets.length > 0) && <GroupLabel label="Individual Orders" />}
            {filteredOrders.map((o) => <OrderRow key={o.id} item={o} onSelect={onSelectOrder} />)}
          </>
        )}
        {!hasResults && (
          <p className="px-[12px] py-[8px] text-[13px] text-[var(--foreground-tertiary,#808080)]" style={{ fontFamily: "Lato, sans-serif" }}>
            No results found
          </p>
        )}
      </div>
    </div>
  );
}

function SetRow({ item, onSelect }: { item: SetOption; onSelect: (item: SetOption) => void }) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onSelect(item); }}
      className="w-full flex flex-col gap-[2px] px-[12px] py-[6px] hover:bg-[var(--surface-1,#f7f7f7)] text-left transition-colors"
      style={{ fontFamily: "Lato, sans-serif" }}
    >
      <span className="text-[13px] font-bold text-[var(--foreground-primary,#1a1a1a)] leading-[1.2] tracking-[0.13px]">
        {item.baseLabel}{[item.defaultLabCompany, item.defaultImagingCompany].filter(Boolean).length > 0 ? ` (${[item.defaultLabCompany, item.defaultImagingCompany].filter(Boolean).join(" · ")})` : ""}
      </span>
      <span className="text-[12px] font-normal text-[var(--foreground-secondary,#666)] leading-[1.4]">
        {item.children.length} orders{item.relatedIcd ? ` · ${item.relatedIcd}` : ""}
      </span>
    </button>
  );
}
