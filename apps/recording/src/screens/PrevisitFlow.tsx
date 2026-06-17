import React, { useState } from "react";
import PrevisitScreen from "./PrevisitScreen";
import R1Baseline from "./R1-Baseline";

// Demonstrates the transition from the desktop Previsit screen into the
// recording interface: clicking "Start Recording" cross-fades into the
// recording UI; "End Visit" returns to Previsit.
export default function PrevisitFlow() {
  const [recording, setRecording] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {recording ? (
        <div key="recording" className="h-full w-full animate-[fadeIn_300ms_ease]">
          <R1Baseline onEndVisit={() => setRecording(false)} />
        </div>
      ) : (
        <div key="previsit" className="h-full w-full">
          <PrevisitScreen onStartRecording={() => setRecording(true)} />
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}
