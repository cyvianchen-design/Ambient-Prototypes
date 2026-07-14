import React, { useState, useRef, useEffect } from "react";
import { Tabs, Icon, IconButton, Link } from "@ds/ui";

export type SourceEntry = { title: string; detail: string };
// Markers guide the timeline by shift change or major patient event
// (admitted to ED, admitted to inpatient, shift started, discharged, now).
export type CourseItem =
  // Primary patient-event / shift markers. May carry a time + one-line description.
  | { type: "marker"; label: string; icon?: string; current?: boolean; day?: string; time?: string; detail?: string }
  // `time` is the clinical/shift anchor that drives the entry's position (shown on the
  // rail) — NOT when the note was saved. `documented` is the actual save time, shown as a
  // subtle secondary only when it differs from the anchor (e.g. a handoff written late, or
  // a shift assessment started early). Anchoring by clinical time keeps notes in the shift
  // they belong to instead of floating out of order.
  // `note` holds the authoring nurse's name (accent-highlighted); omit for non-note events.
  // `doc` links the entry to an openable EHR report (signed note, lab, imaging). When
  // present, the entry becomes a clickable source document.
  | { type: "event"; day: string; time: string; title: string; detail?: string; major?: boolean; note?: string; documented?: string; doc?: CourseDoc };

export type CourseDoc = { type: "Signed note" | "Lab result" | "Imaging report"; body: string };
const DOC_ICON: Record<CourseDoc["type"], string> = {
  "Signed note": "description",
  "Lab result": "labs",
  "Imaging report": "radiology",
};

type Suggestion = { icon: string; text: string };

type Props = {
  suggestions?: Suggestion[];
  sources?: SourceEntry[];
  course?: CourseItem[];
  /** Show the Course (stay timeline) tab. Defaults to true (previsit); scribe detail turns it off. */
  showCourse?: boolean;
};

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { icon: "ink_highlighter", text: "Summarize this patient's shift so far." },
  { icon: "fact_check",      text: "What required fields are still uncaptured?" },
  { icon: "chat_info",       text: "Any risks or concerns I should flag?" },
  { icon: "history",         text: "Draft the handoff for the next nurse." },
  { icon: "trending_up",     text: "Summarize trends in this patient's vitals." },
];

// Chronological, oldest → newest. Day dividers separate days (no per-item date);
// a shift marker shows when the current user's shift began. Auto-scrolls to the bottom ("now").
const DEFAULT_COURSE: CourseItem[] = [
  { type: "marker", label: "Admitted to ED", icon: "emergency", day: "Yesterday", time: "14:20", detail: "After mechanical fall at home, unable to bear weight" },
  { type: "event", day: "Yesterday", time: "14:35", title: "Triage assessment", detail: "ESI 2, right hip pain 8/10", note: "Alex Rivera, RN", doc: { type: "Signed note", body: "Chief complaint: Right hip pain after mechanical fall at home, unable to bear weight.\nESI 2 · arrived via EMS.\nVitals: BP 148/88, HR 96, RR 18, SpO₂ 98% RA, T 98.4 °F, pain 8/10.\nRight leg shortened and externally rotated; distal pulses and sensation intact.\nPMH: HTN, osteoporosis. Allergies: NKDA." } },
  { type: "event", day: "Yesterday", time: "15:00", title: "ED labs drawn", detail: "CBC, BMP, coags, type & screen", doc: { type: "Lab result", body: "CBC — WBC 8.2, Hgb 12.1, Hct 36%, Plt 240\nBMP — Na 139, K 4.1, Cl 103, CO₂ 25, BUN 18, Cr 0.9, Glu 112\nCoags — INR 1.0, PTT 30\nType & screen — A positive, antibody negative" } },
  { type: "event", day: "Yesterday", time: "15:20", title: "Pelvis X-ray", detail: "Right intertrochanteric hip fracture", doc: { type: "Imaging report", body: "Exam: X-ray pelvis and right hip, 2 views.\nFindings: Displaced right intertrochanteric femoral fracture. No pelvic ring disruption.\nImpression: Right intertrochanteric hip fracture. Orthopedic consultation advised." } },
  { type: "event", day: "Yesterday", time: "16:00", title: "Orthopedics consult", detail: "Recommend ORIF", note: "Dr. Alvarez", doc: { type: "Signed note", body: "Consulted for right intertrochanteric hip fracture.\nAssessment: Operative candidate, low surgical risk.\nPlan: ORIF with cephalomedullary nail. NPO after midnight, consent obtained, type & screen on file.\n— Dr. Alvarez, Orthopedic Surgery" } },
  { type: "marker", label: "To OR — ORIF right hip", icon: "medical_services", day: "Yesterday", time: "17:00" },
  { type: "event", day: "Yesterday", time: "18:30", title: "Operation note", detail: "Dr. Alvarez · uncomplicated, EBL 150 mL", major: true, note: "Dr. Alvarez", doc: { type: "Signed note", body: "Procedure: ORIF right hip — cephalomedullary nail.\nAnesthesia: Spinal. EBL 150 mL. No complications.\nFindings: Intertrochanteric fracture anatomically reduced; hardware in good position.\nDisposition: PACU then inpatient. Weight-bearing as tolerated on right leg.\n— Dr. Alvarez, Orthopedic Surgery" } },
  { type: "marker", label: "Admitted to inpatient unit", icon: "bed", day: "Yesterday", time: "19:30", detail: "Post-op to Bed 4B" },
  { type: "event", day: "Yesterday", time: "20:00", title: "Admission assessment", detail: "Baseline vitals, fall risk high, VTE prophylaxis started", note: "Sarah Chen, RN", doc: { type: "Signed note", body: "Post-op admission to Bed 4B, POD 0 s/p ORIF right hip.\nVitals stable, SpO₂ 95% on 2 L NC. Alert and oriented ×4.\nPain 6/10 right hip. Fall risk high — bed alarm on, non-slip socks, call light in reach.\nVTE: SCDs on; enoxaparin to start POD 1. Full code. NKDA.\n— Sarah Chen, RN" } },
  { type: "event", day: "Yesterday", time: "21:00", title: "Post-op vitals", detail: "T 37.1 °C, HR 84, BP 136/80, SpO₂ 95% on 2 L NC" },
  { type: "event", day: "Yesterday", time: "21:30", title: "Oxycodone 5 mg PO (PRN)", detail: "Right hip pain 7/10 → 3/10 after 40 min" },
  { type: "event", day: "Yesterday", time: "22:00", title: "Neurovascular check — right leg intact", detail: "Warm, cap refill <2 s, sensation & movement intact" },
  { type: "event", day: "Yesterday", time: "23:15", title: "Ondansetron 4 mg IV", detail: "Post-op nausea, resolved" },
  { type: "event", day: "Today", time: "00:30", title: "Weaned to room air", detail: "SpO₂ 96% on RA; SCDs on, repositioned for comfort" },
  { type: "event", day: "Today", time: "02:15", title: "Bladder scan — straight cath", detail: "Post-op urinary retention; 380 mL returned, patient comfortable" },
  { type: "event", day: "Today", time: "04:00", title: "Neurovascular check — right leg intact", detail: "No change; resting, afebrile" },
  { type: "event", day: "Today", time: "06:00", title: "Labs drawn", detail: "Hgb 10.4, stable", doc: { type: "Lab result", body: "CBC (AM, POD 1) — WBC 7.6, Hgb 10.4, Hct 31%, Plt 228\nBMP — Na 138, K 4.0, Cr 0.8, Glu 108\nImpression: Mild post-op anemia, hemodynamically stable. No transfusion indicated." } },
  { type: "marker", label: "Shift started — Beth Keller, RN", icon: "person", day: "Today", time: "07:00" },
  { type: "event", day: "Today", time: "08:00", title: "Enoxaparin 40 mg SC administered" },
  { type: "event", day: "Today", time: "09:15", title: "Post-op hip X-ray", detail: "Hardware well-positioned", doc: { type: "Imaging report", body: "Exam: X-ray right hip, post-op.\nFindings: Cephalomedullary nail in anatomic alignment. Fracture reduced. No hardware complication.\nImpression: Satisfactory post-op appearance." } },
  { type: "event", day: "Today", time: "10:00", title: "PT ambulation trial", detail: "Walked 20 ft with walker, WBAT" },
  { type: "event", day: "Today", time: "11:30", title: "Hospitalist progress note", detail: "Stable POD 1, advancing mobility; target discharge in 1–2 days", note: "Dr. Patel", doc: { type: "Signed note", body: "POD 1 s/p ORIF right hip. Hemodynamically stable, afebrile.\nHgb 10.4, stable. Pain controlled. Advancing mobility with PT.\nContinue enoxaparin, incentive spirometry, bowel regimen.\nAnticipate discharge in 1–2 days to home with services.\n— Dr. Patel, Hospital Medicine" } },
  { type: "event", day: "Today", time: "14:32", title: "Shift assessment", detail: "Pain 4/10, incision clean/dry/intact", note: "Beth Keller, RN", doc: { type: "Signed note", body: "Day shift, POD 1. Alert and oriented ×4.\nPain 4/10 right hip, controlled with scheduled acetaminophen + PRN oxycodone.\nIncision clean, dry, intact. Neurovascular intact to right leg.\nAmbulated 20 ft with walker, WBAT. Tolerating diet, voiding without difficulty.\n— Beth Keller, RN" } },
  // Handoff written late (saved 15:40) but anchored to the 15:00 shift-change it documents,
  // so it stays at the end of Beth's shift instead of floating into the next nurse's events.
  { type: "event", day: "Today", time: "15:00", title: "Handoff note", detail: "SBAR to oncoming RN — stable POD 1, pain controlled", note: "Beth Keller, RN", documented: "15:40", doc: { type: "Signed note", body: "S: 72F POD 1 s/p ORIF right hip, stable.\nB: Mechanical fall; intertrochanteric fracture. PMH HTN, osteoporosis.\nA: Pain controlled 4/10, incision intact, ambulating with walker, Hgb 10.4 stable.\nR: Continue enoxaparin & PT, monitor pain and Hgb, target discharge in 1–2 days.\n— Beth Keller, RN" } },
  { type: "marker", label: "Your shift started", icon: "login", current: true, day: "Today", time: "15:00" },
  { type: "event", day: "Today", time: "16:00", title: "PRN oxycodone administered", detail: "Pain 6/10 → 3/10 after 45 min" },
  { type: "event", day: "Today", time: "18:00", title: "Neurovascular check — intact", detail: "Cap refill <2s, sensation and movement intact" },
  { type: "event", day: "Today", time: "20:00", title: "Now", detail: "Recording new scribe", major: true },
];

type MarkerHeader = Extract<CourseItem, { type: "marker" }>;
type EventItem = Extract<CourseItem, { type: "event" }>;

// Renders the stay timeline, guided by markers (shift changes / major patient
// events). The line is continuous within a marker's group and breaks at each
// marker. Major events get a filled dot; minor events have no dot — the line
// simply runs past them.
// One continuous timeline. Left gutter shows each entry's time (and, when the day
// changes, the new date above the first time of that day). The rail line runs
// top-to-bottom without breaking; markers are filled icon nodes, major events are
// dots, minor events have no node.
function CourseTimeline({ course, onOpenDoc }: { course: CourseItem[]; onOpenDoc?: (ev: EventItem) => void }) {
  const rows: React.ReactNode[] = [];
  let prevDay: string | undefined;

  course.forEach((item, i) => {
    const isFirst = i === 0;
    const isLast = i === course.length - 1;
    const isMarker = item.type === "marker";
    const dateChanged = item.day !== undefined && item.day !== prevDay;
    prevDay = item.day ?? prevDay;

    // Node/time center aligns to the first line's center, which depends on the header type:
    // markers (title/M) = 9px, clickable events (title/xs) = 7px, body events = 9px.
    const isClickableEvent = item.type === "event" && !!item.doc;
    const nodeTop = isClickableEvent ? "top-[7px]" : "top-[9px]";
    const lineClass = isFirst
      ? (isClickableEvent ? "top-[7px] bottom-0" : "top-[9px] bottom-0")
      : isLast
        ? (isClickableEvent ? "top-0 h-[7px]" : "top-0 h-[9px]")
        : "inset-y-0";

    // Date label sits above the first entry of a new day, in the time gutter.
    // The rail keeps the line continuous (except at the very top, which has nothing above it).
    if (dateChanged) {
      rows.push(
        <div key={`d${i}`} className="flex">
          <div className={`w-[42px] shrink-0 text-right pr-[4px] ${isFirst ? "pt-[2px]" : "pt-[16px]"}`}>
            <span className="t-body-xs text-[var(--foreground-secondary,#666)] whitespace-nowrap">{item.day}</span>
          </div>
          <div className="w-[20px] shrink-0 relative">
            {!isFirst && <div className="absolute left-1/2 -translate-x-1/2 w-[2px] inset-y-0 bg-[var(--surface-3,#eee)]" />}
          </div>
          <div className="flex-1 pl-[8px]" />
        </div>
      );
    }

    const ev = item.type === "event" ? item : null;
    const marker = item.type === "marker" ? item : null;
    const isNow = ev?.title === "Now";
    const dotColor = isNow
      ? "bg-[var(--foreground-semantic-success,#3f8d43)]"
      : "bg-[var(--foreground-secondary,#666)]";

    rows.push(
      <div key={i} className="flex">
        {/* Time gutter — time aligns with the entry's first line of text. Markers (primary
            events) show no time; event times sit close to the rail. */}
        <div className="w-[42px] shrink-0 relative">
          {!isMarker && item.time && (
            <span className={`absolute right-[4px] ${nodeTop} -translate-y-1/2 t-body-xs text-[var(--foreground-secondary,#666)] whitespace-nowrap`}>
              {item.time}
            </span>
          )}
        </div>
        {/* Rail */}
        <div className="w-[20px] shrink-0 relative">
          <div className={`absolute left-1/2 -translate-x-1/2 w-[2px] bg-[var(--surface-3,#eee)] ${lineClass}`} />
          {marker ? (
            <div className={`absolute left-1/2 ${nodeTop} -translate-x-1/2 -translate-y-1/2 z-[1] w-[20px] h-[20px] rounded-full flex items-center justify-center bg-[var(--surface-2,#f2f2f2)]`}>
              {marker.icon && <Icon name={marker.icon} size={13} className="text-[var(--foreground-secondary,#666)]" />}
            </div>
          ) : (ev!.major || ev!.doc) ? (
            <div className={`absolute left-1/2 ${nodeTop} -translate-x-1/2 -translate-y-1/2 z-[1] w-[8px] h-[8px] rounded-full ${dotColor}`} />
          ) : null}
        </div>
        {/* Content */}
        <div className={`min-w-0 flex-1 pl-[8px] ${isLast ? "pb-[4px]" : "pb-[16px]"}`}>
          {marker ? (
            <>
              {/* Wrap in a flex row so the first line starts at the content top
                  (matches the event rows), keeping the icon node aligned to it. */}
              <div className="flex items-baseline">
                <span className="t-title-md text-[var(--foreground-primary,#1a1a1a)]">{marker.label}</span>
              </div>
              {marker.detail && <div className="t-body-xs text-[var(--foreground-secondary,#666)] mt-[1px]">{marker.detail}</div>}
            </>
          ) : ev!.doc ? (
            // Entry backed by an EHR report — clickable, opens the source document.
            <button
              type="button"
              onClick={() => onOpenDoc?.(ev!)}
              className="group w-full text-left rounded-[6px] -mx-[6px] px-[6px] -my-[4px] py-[4px] hover:bg-[var(--surface-1,#f7f7f7)] transition-colors cursor-pointer"
            >
              <div className="flex items-baseline gap-[6px] flex-wrap">
                <span className="t-title-xs text-[var(--foreground-primary,#1a1a1a)]">{ev!.title}</span>
                {ev!.note && <span className="t-body-xs text-[var(--foreground-secondary,#666)]">· {ev!.note}</span>}
                {ev!.documented && ev!.documented !== ev!.time && (
                  <span className="t-body-xs text-[var(--foreground-tertiary,#808080)]">· documented {ev!.documented}</span>
                )}
              </div>
              {ev!.detail && <div className="t-body-xs text-[var(--foreground-secondary,#666)] mt-[1px]">{ev!.detail}</div>}
            </button>
          ) : (
            <>
              <div className="flex items-baseline gap-[6px] flex-wrap">
                <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)]">{ev!.title}</span>
                {ev!.note && <span className="t-body-xs text-[var(--foreground-secondary,#666)]">· {ev!.note}</span>}
                {ev!.documented && ev!.documented !== ev!.time && (
                  <span className="t-body-xs text-[var(--foreground-tertiary,#808080)]">· documented {ev!.documented}</span>
                )}
              </div>
              {ev!.detail && <div className="t-body-xs text-[var(--foreground-secondary,#666)] mt-[1px]">{ev!.detail}</div>}
            </>
          )}
        </div>
      </div>
    );
  });

  return <div className="flex flex-col">{rows}</div>;
}

// Reusable side panel: Course (stay timeline) / Assistant / Sources, with a pinned composer.
export function AssistantSidebar({ suggestions = DEFAULT_SUGGESTIONS, sources = [], course = DEFAULT_COURSE, showCourse = true }: Props) {
  const [tab, setTab] = useState(showCourse ? "course" : "assistant");
  const [openDoc, setOpenDoc] = useState<EventItem | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Pinned composer, reused by the panel and the source-document view.
  const composer = (
    <div className="shrink-0 px-[20px] pt-[8px] pb-[24px]">
      <div className="flex items-center h-[48px] px-[12px] border border-[#8044ff] rounded-[6px]">
        <input
          className="flex-1 min-w-0 bg-transparent outline-none border-none t-body-md text-[var(--foreground-primary,#1a1a1a)] placeholder:text-[var(--foreground-tertiary,#808080)]"
          placeholder="Ask assistant"
        />
        <IconButton icon={<Icon name="mic" size={20} filled />} size="medium" aria-label="Voice input" />
        <IconButton icon={<Icon name="send" size={20} filled />} size="medium" aria-label="Send" />
      </div>
    </div>
  );

  // Auto-scroll the Course timeline to the bottom ("now") when it's shown.
  // Retry across several frames/ticks to catch late layout (fonts/reflow).
  useEffect(() => {
    if (tab !== "course") return;
    const toBottom = () => {
      const el = bodyRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    };
    const raf = requestAnimationFrame(toBottom);
    const ids = [0, 80, 200, 400, 700].map((ms) => setTimeout(toBottom, ms));
    return () => { cancelAnimationFrame(raf); ids.forEach(clearTimeout); };
  }, [tab, course]);

  return (
    <div className="w-[355px] shrink-0 border-l border-[var(--surface-3,#eee)] flex flex-col bg-white overflow-hidden relative">
      <div className="h-[48px] px-[16px] flex items-center shrink-0">
        <Tabs
          variant="secondary"
          tabs={[
            ...(showCourse ? [{ id: "course", label: "Course" }] : []),
            { id: "assistant", label: "Assistant" },
            { id: "sources", label: "Sources" },
          ]}
          activeTab={tab}
          onTabChange={setTab}
        />
      </div>

      <div ref={bodyRef} className="flex-1 overflow-y-auto px-[20px] py-[12px]">
        {tab === "course" && <CourseTimeline course={course} onOpenDoc={setOpenDoc} />}

        {tab === "assistant" && (
          <>
            <p className="t-title-sm text-[var(--foreground-primary,#1a1a1a)] mb-[12px]">Get started</p>
            <div className="flex flex-col gap-[12px]">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="flex items-center gap-[8px] min-h-[28px] px-[8px] py-[4px] bg-[var(--surface-2,#f2f2f2)] rounded-[8px] shrink-0 text-left hover:bg-[var(--surface-3,#ebebeb)] transition-colors"
                >
                  <Icon name={s.icon} size={16} className="text-[var(--foreground-secondary,#666)] shrink-0" />
                  <span className="t-body-sm text-[var(--foreground-primary,#1a1a1a)]">{s.text}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {tab === "sources" && (
          <>
            <p className="t-title-sm text-[var(--foreground-primary,#1a1a1a)] mb-[12px]">Sources</p>
            {sources.length === 0 ? (
              <p className="t-body-sm text-[var(--foreground-secondary,#666)]">
                No sources yet. Sources appear as the note is generated from the transcript and record.
              </p>
            ) : (
              <div className="flex flex-col gap-[12px]">
                {sources.map((src, i) => (
                  <div key={i} className="flex items-start gap-[8px]">
                    <span className="inline-flex items-center justify-center w-[16px] h-[16px] rounded-[4px] bg-[var(--accent-10,#1132ee1a)] text-[var(--accent,#1132ee)] t-title-xs shrink-0 mt-[1px]">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="t-body-sm text-[var(--foreground-primary,#1a1a1a)]">{src.title}</div>
                      <Link href="#" size="xsmall" intent="neutral">{src.detail}</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {composer}

      {/* Source-document view — opened from a linked Course entry (signed note, lab, imaging).
          Overlays the panel so the timeline's scroll position is preserved underneath. */}
      {openDoc && openDoc.doc && (
        <div className="absolute inset-0 z-20 bg-white flex flex-col">
          <div className="h-[48px] px-[8px] flex items-center gap-[4px] shrink-0">
            <IconButton icon={<Icon name="arrow_back" size={18} />} variant="tertiary-neutral" size="small" onClick={() => setOpenDoc(null)} aria-label="Back" />
            <span className="t-title-sm text-[var(--foreground-primary,#1a1a1a)] truncate">{openDoc.title}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-[20px] py-[16px]">
            <div className="flex items-center gap-[6px] mb-[8px]">
              <Icon name={DOC_ICON[openDoc.doc.type]} size={16} className="text-[var(--accent,#1132ee)]" />
              <span className="t-title-xs text-[var(--foreground-secondary,#666)]">{openDoc.doc.type}</span>
            </div>
            <div className="t-title-lg text-[var(--foreground-primary,#1a1a1a)]">{openDoc.title}</div>
            <div className="t-body-xs text-[var(--foreground-secondary,#666)] mt-[2px]">
              {openDoc.note ? `${openDoc.note} · ` : ""}{openDoc.day}, {openDoc.time}
              {openDoc.documented && openDoc.documented !== openDoc.time ? ` · documented ${openDoc.documented}` : ""}
            </div>
            <div className="mt-[16px]">
              <p className="t-body-sm text-[var(--foreground-primary,#1a1a1a)] whitespace-pre-wrap m-0">{openDoc.doc.body}</p>
            </div>
          </div>
          {composer}
        </div>
      )}
    </div>
  );
}
