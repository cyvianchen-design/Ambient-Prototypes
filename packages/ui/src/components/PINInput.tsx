import React, { useRef, useState, useEffect } from "react";

export type PINInputProps = {
  length?: number; // default 6
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  masked?: boolean;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  className?: string;
};

export function PINInput({
  length = 6,
  value: controlledValue,
  onChange,
  onComplete,
  masked = true,
  disabled = false,
  error = false,
  autoFocus = false,
  className = "",
}: PINInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) inputRefs.current[0]?.focus();
  }, [autoFocus]);

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    const arr = value.split("");
    arr[index] = digit;
    const next = arr.join("").slice(0, length);
    if (controlledValue === undefined) setInternalValue(next);
    onChange?.(next);
    if (next.length === length) onComplete?.(next);
    if (digit && index < length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (value[index]) {
        const arr = value.split("");
        arr[index] = "";
        const next = arr.join("");
        if (controlledValue === undefined) setInternalValue(next);
        onChange?.(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (controlledValue === undefined) setInternalValue(pasted);
    onChange?.(pasted);
    if (pasted.length === length) onComplete?.(pasted);
    const focusIdx = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const borderColor = error
    ? "border-[var(--foreground-semantic-danger,#bb1411)]"
    : "border-[var(--surface-3,#eee)] focus:border-[var(--accent,#1132ee)]";

  return (
    <div
      className={`flex items-center gap-[8px] ${className}`}
      onPaste={handlePaste}
    >
      {Array.from({ length }, (_, i) => {
        const filled = i < value.length;
        const displayVal = filled ? (masked ? "•" : value[i]) : "";
        return (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={displayVal}
            disabled={disabled}
            aria-label={`PIN digit ${i + 1}`}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            className={[
              "w-[44px] h-[52px] rounded-[8px] border-[1.5px] bg-white text-center",
              "text-[20px] font-bold leading-none text-[var(--foreground-primary,#1a1a1a)]",
              "outline-none transition-colors",
              borderColor,
              disabled ? "opacity-40 cursor-not-allowed" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        );
      })}
    </div>
  );
}
