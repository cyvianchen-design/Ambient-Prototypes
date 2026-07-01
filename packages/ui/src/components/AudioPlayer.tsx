import React from "react";
import { IconButton } from "./Button";
import { Icon } from "./Icon";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const PLAYBACK_RATES = [0.5, 1, 1.25, 1.5, 2];

export type AudioPlayerProps = {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  playbackRate?: number;
  onPlaybackRateChange?: (rate: number) => void;
  /** Show skip ±15s buttons. Default true. */
  showSkip?: boolean;
  className?: string;
};

export function AudioPlayer({
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onSeek,
  playbackRate = 1,
  onPlaybackRateChange,
  showSkip = true,
  className = "",
}: AudioPlayerProps) {
  const progress = duration > 0 ? currentTime / duration : 0;

  function handleSeekChange(e: React.ChangeEvent<HTMLInputElement>) {
    onSeek(Number(e.target.value) * duration);
  }

  function cyclePlaybackRate() {
    if (!onPlaybackRateChange) return;
    const idx = PLAYBACK_RATES.indexOf(playbackRate);
    const next = PLAYBACK_RATES[(idx + 1) % PLAYBACK_RATES.length];
    onPlaybackRateChange(next);
  }

  const rateLabel = playbackRate === 1 ? "1×" : `${playbackRate}×`;

  return (
    <div
      className={`flex items-center gap-[8px] rounded-[10px] bg-[var(--surface-1,#f7f7f7)] px-[12px] py-[8px] ${className}`}
    >
      {/* Skip back */}
      {showSkip && (
        <IconButton
          icon={<Icon name="replay_10" size={18} />}
          variant="tertiary-neutral"
          size="small"
          onClick={() => onSeek(Math.max(0, currentTime - 15))}
          aria-label="Skip back 15 seconds"
        />
      )}

      {/* Play / Pause */}
      <IconButton
        icon={<Icon name={isPlaying ? "pause" : "play_arrow"} size={18} filled />}
        variant="accent"
        size="medium"
        onClick={onPlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
      />

      {/* Skip forward */}
      {showSkip && (
        <IconButton
          icon={<Icon name="forward_10" size={18} />}
          variant="tertiary-neutral"
          size="small"
          onClick={() => onSeek(Math.min(duration, currentTime + 15))}
          aria-label="Skip forward 15 seconds"
        />
      )}

      {/* Current time */}
      <span className="t-body-xs text-[var(--foreground-secondary,#666)] tabular-nums shrink-0 w-[32px] text-right">
        {formatTime(currentTime)}
      </span>

      {/* Seek bar */}
      <div className="flex-1 relative flex items-center min-w-0">
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className="w-full h-[3px] rounded-full bg-[var(--surface-3,#eee)]">
            <div
              className="h-full rounded-full bg-[var(--accent,#1132ee)] transition-all duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={progress}
          onChange={handleSeekChange}
          aria-label="Seek"
          className="w-full h-[3px] opacity-0 cursor-pointer relative z-10"
        />
      </div>

      {/* Duration */}
      <span className="t-body-xs text-[var(--foreground-secondary,#666)] tabular-nums shrink-0 w-[32px]">
        {formatTime(duration)}
      </span>

      {/* Playback rate */}
      {onPlaybackRateChange && (
        <button
          onClick={cyclePlaybackRate}
          aria-label={`Playback speed: ${rateLabel}`}
          className="shrink-0 t-title-xs text-[var(--foreground-secondary,#666)] hover:text-[var(--foreground-primary,#1a1a1a)] transition-colors w-[28px] text-center"
        >
          {rateLabel}
        </button>
      )}
    </div>
  );
}
