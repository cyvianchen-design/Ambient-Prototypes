import React, { useState } from "react";
import { IconButton } from "./Button";
import { Icon } from "./Icon";

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function calendarDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: (Date | null)[] = Array(first.getDay()).fill(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

// ─── Date Picker ─────────────────────────────────────────────────────────────

export type DatePickerProps = {
  value?: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
};

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  className = "",
}: DatePickerProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? today.getMonth());

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const days = calendarDays(viewYear, viewMonth);

  return (
    <div
      className={`inline-block rounded-[12px] border border-[var(--surface-3,#eee)] bg-white shadow-sm p-[12px] select-none ${className}`}
      style={{ width: 252 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-[8px]">
        <IconButton icon={<Icon name="chevron_left" size={16} />} variant="tertiary-neutral" size="small" onClick={prevMonth} aria-label="Previous month" />
        <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)]">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <IconButton icon={<Icon name="chevron_right" size={16} />} variant="tertiary-neutral" size="small" onClick={nextMonth} aria-label="Next month" />
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 mb-[2px]">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="flex items-center justify-center h-[32px] text-[11px] font-bold text-[var(--foreground-secondary,#666)] tracking-[0.11px]">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells — square, 32×32px, centered in each grid column */}
      <div className="grid grid-cols-7">
        {days.map((date, i) => {
          if (!date) return <div key={i} className="h-[32px]" />;
          const isSelected = value ? isSameDay(date, value) : false;
          const isToday = isSameDay(date, today);
          const isDisabled =
            (minDate && date < minDate) ||
            (maxDate && date > maxDate);

          return (
            <div key={i} className="flex items-center justify-center h-[32px]">
              <button
                onClick={() => !isDisabled && onChange(date)}
                disabled={!!isDisabled}
                className={[
                  "flex items-center justify-center w-[28px] h-[28px] rounded-[4px] text-[13px] leading-[1] transition-colors",
                  isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer",
                  isSelected
                    // Selected: foreground-primary fill (dark), white text
                    ? "bg-[var(--foreground-primary,#1a1a1a)] text-white font-bold"
                    : isToday
                    // Today: dark outline square, dark text — no accent blue
                    ? "border border-[var(--foreground-primary,#1a1a1a)] text-[var(--foreground-primary,#1a1a1a)] font-bold hover:bg-[var(--surface-1,#f7f7f7)]"
                    : "text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)]",
                ].join(" ")}
              >
                {date.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Time Picker ─────────────────────────────────────────────────────────────
// Design notes:
//   - Active item: litmus-25 bg + accent text (not solid fill)
//   - am/pm in lowercase
//   - No colon separator (always pair with a TextField in the app)
//   - Columns are compact / narrow

export type TimeValue = { hour: number; minute: number; ampm: "am" | "pm" };

export type TimePickerProps = {
  value?: TimeValue;
  onChange: (time: TimeValue) => void;
  /** Minute increment. Default 15. */
  minuteStep?: number;
  className?: string;
};

export function TimePicker({
  value = { hour: 9, minute: 0, ampm: "am" },
  onChange,
  minuteStep = 15,
  className = "",
}: TimePickerProps) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);

  function setHour(h: number) { onChange({ ...value, hour: h }); }
  function setMinute(m: number) { onChange({ ...value, minute: m }); }
  function setAmpm(a: "am" | "pm") { onChange({ ...value, ampm: a }); }

  const colCls = "flex flex-col gap-[1px] overflow-y-auto max-h-[200px] scrollbar-none";

  // Active item: light litmus bg + accent text. Inactive: foreground-primary.
  const itemCls = (active: boolean) =>
    `w-[36px] py-[5px] text-[13px] rounded-[6px] cursor-pointer transition-colors text-center tabular-nums ${
      active
        ? "bg-[var(--litmus-25,#f1f3fe)] text-[var(--accent,#1132ee)] font-bold"
        : "font-normal text-[var(--foreground-primary,#1a1a1a)] hover:bg-[var(--surface-1,#f7f7f7)]"
    }`;

  return (
    <div
      className={`inline-flex gap-[2px] rounded-[12px] border border-[var(--surface-3,#eee)] bg-white shadow-sm p-[8px] ${className}`}
    >
      {/* Hours */}
      <div className={colCls}>
        {hours.map(h => (
          <button key={h} onClick={() => setHour(h)} className={itemCls(value.hour === h)}>
            {h}
          </button>
        ))}
      </div>

      {/* Minutes — no colon separator */}
      <div className={colCls}>
        {minutes.map(m => (
          <button key={m} onClick={() => setMinute(m)} className={itemCls(value.minute === m)}>
            {String(m).padStart(2, "0")}
          </button>
        ))}
      </div>

      {/* am / pm — lowercase */}
      <div className="flex flex-col gap-[1px]">
        {(["am", "pm"] as const).map(a => (
          <button
            key={a}
            onClick={() => setAmpm(a)}
            className={itemCls(value.ampm === a)}
          >
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}
