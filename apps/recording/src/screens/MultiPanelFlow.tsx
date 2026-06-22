import React, { useState } from "react";
import PrevisitScreen from "./PrevisitScreen";
import MultiPanelRecording from "./MultiPanelRecording";

// Multi-panel direction: Previsit → (Start Recording) → multi-panel Recording
// → (End Visit) → Previsit. On tablet/desktop the recording view can open
// Previsit and/or Assistant as side panels.
export default function MultiPanelFlow() {
  const [recording, setRecording] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {recording ? (
        <div key="recording" className="h-full w-full animate-[fadeIn_300ms_ease]">
          <MultiPanelRecording onEndVisit={() => setRecording(false)} />
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
