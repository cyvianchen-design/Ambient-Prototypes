import React, { useState, useEffect, useRef } from "react";
import { Icon, Badge, Chip, Divider } from "@ds/ui";
import { GradientBackground } from "../components/recording/GradientBackground";
import { Waveform } from "../components/recording/Waveform";

type GapPriority = "critical" | "confirm" | "optional";

type GapItem = {
  id: string;
  label: string;
  hint: string;
  priority: GapPriority;
  required: boolean;
  conditionTag?: string;
};

type TranscriptEvent = {
  text: string;
  atSecond: number;
  capturesIds: string[];
};

// Hip fracture · Shift Assessment — condition + template driven
const DEMO_GAPS: GapItem[] = [
  { id: "pain_score",      label: "Pain score",            hint: "Ask 0–10, location, and how it compares to baseline",         priority: "critical", required: true  },
  { id: "dvt_prophylaxis", label: "DVT prophylaxis",       hint: "Confirm Lovenox given or state clinical reason if held",       priority: "critical", required: true  },
  { id: "neurovascular",   label: "Neurovascular check",   hint: "Verbalize cap refill, sensation, and toe movement",            priority: "critical", required: true  },
  { id: "wound_dressing",  label: "Wound / dressing",      hint: "Describe appearance, drainage, and dressing integrity",        priority: "confirm",  required: false, conditionTag: "Surgical site"      },
  { id: "mobility",        label: "Mobility today",        hint: "PT visit — state distance walked and level of assist",         priority: "confirm",  required: false, conditionTag: "Ortho recovery"     },
  { id: "weight_bearing",  label: "Weight bearing status", hint: "State current WB order: TTWB / WBAT / FWB",                   priority: "confirm",  required: false, conditionTag: "Hip fracture"       },
  { id: "fall_risk",       label: "Fall risk",             hint: "Any changes this shift? State current precautions in place",   priority: "confirm",  required: false, conditionTag: "High risk post-op"  },
  { id: "patient_ed",      label: "Patient education",     hint: "What was taught and confirm patient understanding",            priority: "optional", required: true  },
  { id: "discharge_goal",  label: "Discharge goal",        hint: "State target date, destination, and any barriers identified",  priority: "optional", required: false, conditionTag: "Discharge planning" },
];

const DEMO_TRANSCRIPT: TranscriptEvent[] = [
  { text: "Starting shift assessment for Maria Santos, room 4B. Hip fracture, day 2 post-op.",          atSecond: 4,  capturesIds: [] },
  { text: "Vitals stable — BP 128 over 82, heart rate 74, temp 98.4, SpO₂ 96% on room air.",            atSecond: 9,  capturesIds: [] },
  { text: "Patient reports pain at 4 out of 10, right hip incision site.",                               atSecond: 14, capturesIds: ["pain_score"] },
  { text: "She describes it as a dull ache, manageable with current oral pain regimen.",                 atSecond: 19, capturesIds: [] },
  { text: "Wound is clean and dry, dressing intact, no signs of redness, swelling, or drainage.",       atSecond: 25, capturesIds: ["wound_dressing"] },
  { text: "Right lower extremity — cap refill under 2 seconds, sensation intact, patient can wiggle toes.", atSecond: 32, capturesIds: ["neurovascular"] },
  { text: "PT came by at 10 AM. Maria walked 20 feet with a walker, weight bearing as tolerated.",       atSecond: 39, capturesIds: ["mobility", "weight_bearing"] },
  { text: "Lovenox 40mg given subcutaneously at 0800 per DVT prophylaxis protocol.",                     atSecond: 45, capturesIds: ["dvt_prophylaxis"] },
  { text: "Fall risk remains moderate. Bed alarm on, call light within reach, non-slip socks on.",       atSecond: 52, capturesIds: ["fall_risk"] },
  { text: "Reviewed discharge expectations with patient and family — goal is home with PT follow-up.",   atSecond: 59, capturesIds: ["discharge_goal"] },
];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

type Props = {
  patientName?: string;
  template?: string;
  visitType?: string;
  onEnd?: () => void;
};

export default function R2RecordingCuePage({
  patientName = "Maria Santos",
  template = "Shift Assessment",
  visitType = "In-Person",
  onEnd,
}: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [capturedIds, setCapturedIds] = useState<Set<string>>(new Set());
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const [transcriptLines, setTranscriptLines] = useState<string[]>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    const events = DEMO_TRANSCRIPT.filter((e) => e.atSecond === elapsed);
    if (events.length === 0) return;
    events.forEach((event) => {
      if (event.text) setTranscriptLines((prev) => [...prev, event.text]);
      if (event.capturesIds.length > 0) {
        const ids = new Set(event.capturesIds);
        setCapturedIds((prev) => new Set([...prev, ...ids]));
        setFlashIds((prev) => new Set([...prev, ...ids]));
        setTimeout(() => {
          setFlashIds((prev) => {
            const next = new Set(prev);
            ids.forEach((id) => next.delete(id));
            return next;
          });
        }, 1600);
      }
    });
  }, [elapsed]);

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [transcriptLines]);

  const requiredItems = DEMO_GAPS.filter((g) => g.required);
  const requiredDone = requiredItems.filter((g) => capturedIds.has(g.id)).length;
  const requiredMissing = requiredItems.length - requiredDone;
  const allRequiredDone = requiredMissing === 0;

  const sortedGaps = [...DEMO_GAPS].sort((a, b) => {
    const aCaptured = capturedIds.has(a.id);
    const bCaptured = capturedIds.has(b.id);
    if (aCaptured !== bCaptured) return aCaptured ? 1 : -1;
    if (a.required !== b.required) return a.required ? -1 : 1;
    const order: Record<GapPriority, number> = { critical: 0, confirm: 1, optional: 2 };
    return order[a.priority] - order[b.priority];
  });
  const firstCapturedIdx = sortedGaps.findIndex((g) => capturedIds.has(g.id));
  const firstContextualIdx = sortedGaps.findIndex((g) => !capturedIds.has(g.id) && !g.required);

  const labelCls = "t-title-lg";

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <GradientBackground />

      <div className="relative flex h-full w-full flex-col">
        {/* Top bar */}
        <div className="flex h-[48px] shrink-0 items-center px-[20px] py-[16px]">
          <div className="flex items-center gap-[8px] flex-1">
            <span className={`${labelCls} text-white`}>{patientName}</span>
            <span className="t-body-sm text-white/70">{template} · {visitType}</span>
          </div>
        </div>

        {/* Content row: recording column + cue sheet panel */}
        <div className="flex min-h-px flex-1 items-stretch gap-[20px] px-[20px] pb-[20px]">
          {/* Recording column */}
          <div className="flex flex-1 min-w-0 flex-col items-center justify-center gap-[120px]">
            <div className="flex w-full max-w-[335px] flex-col items-center gap-[48px]">
              <div className="flex flex-col items-center gap-[20px]">
                <span className={`${labelCls} text-white`}>{paused ? "Paused" : "Recording"}</span>
                <span
                  className="font-['Lato'] text-[44px] font-bold leading-[1.1] tracking-[0.44px] text-white tabular-nums"
                  style={{ fontFeatureSettings: '"ss07" 1' }}
                >
                  {formatTime(elapsed)}
                </span>
                <button className="flex h-[28px] items-center gap-[4px] rounded-[6px] px-[10px] py-[6px] text-white">
                  <Icon name="mic" size={16} />
                  <span className="t-title-sm">Macbook Mic</span>
                  <Icon name="arrow_drop_down" size={16} />
                </button>
              </div>
              <Waveform maxWidth={335} height={101} active={!paused} />
            </div>

            <div className="flex w-full max-w-[335px] flex-col items-center gap-[8px]">
              <button
                onClick={() => setPaused((p) => !p)}
                className="flex w-full items-center justify-center gap-[8px] rounded-[6px] border border-white text-white"
                style={{ height: 52 }}
              >
                <Icon name={paused ? "mic" : "pause"} size={24} filled />
                <span className={labelCls}>{paused ? "Resume recording" : "Pause recording"}</span>
              </button>
              <button
                onClick={onEnd}
                className="flex w-full items-center justify-center gap-[8px] rounded-[6px] bg-white text-[var(--foreground-primary,#1a1a1a)]"
                style={{ height: 52 }}
              >
                <Icon name="stop" size={24} filled />
                <span className={labelCls}>End visit</span>
              </button>
            </div>
          </div>

          {/* Cue sheet panel */}
          <div className="w-[min(540px,42%)] shrink-0 bg-white rounded-[12px] flex flex-col overflow-hidden shadow-[0_4px_16px_2px_rgba(0,0,0,0.07)]">
            <div className="px-[20px] pt-[14px] pb-[12px] border-b border-[var(--surface-3,#eee)] shrink-0">
              <div className="flex items-center gap-[8px]">
                <span className="t-title-lg text-[var(--foreground-primary,#1a1a1a)] flex-1">Cue Sheet</span>
                {requiredMissing > 0 && (
                  <Badge label={`${requiredMissing} required missing`} variant="error" filled icon={<Icon name="error" size={12} />} />
                )}
                {allRequiredDone && capturedIds.size < DEMO_GAPS.length && (
                  <Badge label="Required done" variant="success" filled icon={<Icon name="check_circle" size={12} />} />
                )}
                {capturedIds.size === DEMO_GAPS.length && (
                  <Badge label="All clear" variant="success" filled icon={<Icon name="check_circle" size={12} />} />
                )}
              </div>
            </div>

            {/* Live transcript */}
            <div ref={transcriptRef} className="shrink-0 max-h-[148px] overflow-y-auto px-[20px] py-[10px] border-b border-[var(--surface-3,#eee)] bg-[var(--surface-1,#f7f7f7)]">
              {transcriptLines.length === 0 ? (
                <p className="m-0 t-body-xs italic text-[var(--foreground-secondary,#666)]">Listening…</p>
              ) : (
                <div className="flex flex-col gap-[6px]">
                  {transcriptLines.map((line, i) => (
                    <p
                      key={i}
                      className="m-0 t-body-xs leading-[1.5] transition-colors duration-1000"
                      style={{ color: i === transcriptLines.length - 1 ? "var(--foreground-primary,#1a1a1a)" : "var(--foreground-secondary,#666)" }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Cue list */}
            <div className="flex-1 overflow-y-auto px-[16px] pt-[8px] pb-[32px]">
              <div className="flex flex-col gap-[2px]">
                {sortedGaps.map((g, idx) => {
                  const captured = capturedIds.has(g.id);
                  const flashing = flashIds.has(g.id);
                  const showCapturedDivider = idx === firstCapturedIdx && firstCapturedIdx > 0;
                  const showContextualDivider = !captured && idx === firstContextualIdx && firstContextualIdx > 0;
                  return (
                    <div key={g.id}>
                      {showContextualDivider && <div className="my-[8px]"><Divider label="Also relevant for this patient" /></div>}
                      {showCapturedDivider && <div className="my-[8px]"><Divider label="Captured" /></div>}
                      <div
                        className="flex items-start gap-[10px] px-[12px] py-[9px] rounded-[8px] transition-colors duration-500"
                        style={{
                          background: flashing ? "var(--green-50,#edf7ee)" : !captured && g.required ? "var(--red-25,#fef1f1)" : "transparent",
                          border: !captured && g.required ? "1px solid var(--red-50,#fde8e8)" : "1px solid transparent",
                        }}
                      >
                        {captured ? (
                          <Icon name="check_circle" size={16} className="text-[var(--green-600,#3f8d43)] shrink-0 mt-[1px]" />
                        ) : (
                          <div
                            className="w-[7px] h-[7px] rounded-full shrink-0 mt-[5px]"
                            style={{ background: g.required ? "var(--foreground-semantic-danger,#bb1411)" : g.priority === "confirm" ? "var(--foreground-semantic-warning,#cc7a00)" : "var(--neutral-400,#c8c8c8)" }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-[6px] flex-wrap">
                            <span
                              className={captured ? "t-body-sm" : "t-title-sm"}
                              style={{
                                color: captured ? "var(--foreground-secondary,#666)" : "var(--foreground-primary,#1a1a1a)",
                                textDecoration: captured ? "line-through" : "none",
                              }}
                            >
                              {g.label}
                            </span>
                            {g.required && <Badge label="Required" variant={captured ? "default" : "error"} filled />}
                            {!g.required && g.conditionTag && <Chip label={g.conditionTag} color={captured ? "neutral" : "accent"} size="XS" />}
                          </div>
                          {!captured && <div className="t-body-xs text-[var(--foreground-secondary,#666)] mt-[2px] leading-[1.4]">{g.hint}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
