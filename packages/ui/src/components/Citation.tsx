import { Link } from "./Link";

export interface CitationProps {
  n: number;
  quote: string;
  source: string;
  href?: string;
}

export function Citation({ n, quote, source, href = "#" }: CitationProps) {
  return (
    <span className="relative inline-block group/cit">
      <span
        className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-[2px] bg-[var(--litmus-25,#f1f3fe)] text-[10px] font-bold leading-[1.2] tracking-[0.1px] text-[var(--accent,#1132ee)] mx-[2px] cursor-default align-middle select-none"
        style={{ fontFeatureSettings: "'ss07' 1", fontFamily: "Lato, sans-serif" }}
      >
        {n}
      </span>
      <span className="absolute bottom-[calc(100%+6px)] left-0 z-[100] w-[260px] rounded-[8px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-[12px] opacity-0 pointer-events-none group-hover/cit:opacity-100 transition-opacity duration-150 text-left">
        <p className="t-title-xs text-[var(--foreground-secondary,#666)] mb-[6px]">Citation</p>
        <p className="t-body-sm text-[var(--foreground-primary,#1a1a1a)] mb-[8px]">"{quote}"</p>
        <Link href={href}>{source}</Link>
      </span>
    </span>
  );
}
