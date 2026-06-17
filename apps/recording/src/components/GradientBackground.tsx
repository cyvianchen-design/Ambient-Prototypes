import React from "react";

// Recreates the Figma "Recording Background" (node 869:29231) exactly:
// a #4c5ce6 base with three radial-gradient layers defined on a 1441×833
// reference canvas. Rendered as an inline SVG with `preserveAspectRatio
// ="xMidYMid slice"` so it scales proportionally to fill any viewport and
// crops the overflow on narrower screens (CSS background-cover behavior).
export function GradientBackground({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 1441 833"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        {/* Pink lobe — bottom center */}
        <radialGradient
          id="rec-grad-pink"
          gradientUnits="userSpaceOnUse"
          cx="0"
          cy="0"
          r="10"
          gradientTransform="matrix(33.703 -33.05 39.391 36.894 590.59 734)"
        >
          <stop stopColor="rgba(132,0,255,1)" offset="0" />
          <stop stopColor="rgba(134,22,255,0.5)" offset="0.5" />
          <stop stopColor="rgba(136,45,255,0)" offset="1" />
        </radialGradient>

        {/* Blue lobe — center right */}
        <radialGradient
          id="rec-grad-blue"
          gradientUnits="userSpaceOnUse"
          cx="0"
          cy="0"
          r="10"
          gradientTransform="matrix(54.364 30.75 -33.695 54.713 897.36 417)"
        >
          <stop stopColor="rgba(0,17,255,1)" offset="0" />
          <stop stopColor="rgba(11,24,255,0.875)" offset="0.125" />
          <stop stopColor="rgba(22,30,255,0.75)" offset="0.25" />
          <stop stopColor="rgba(43,43,255,0.5)" offset="0.5" />
          <stop stopColor="rgba(86,70,255,0)" offset="1" />
        </radialGradient>

        {/* Purple lobe — upper left */}
        <radialGradient
          id="rec-grad-purple"
          gradientUnits="userSpaceOnUse"
          cx="0"
          cy="0"
          r="10"
          gradientTransform="matrix(34.59 57.4 -65.955 36.505 548.85 222)"
        >
          <stop stopColor="rgba(57,0,155,1)" offset="0" />
          <stop stopColor="rgba(62,19,205,0.5)" offset="0.5" />
          <stop stopColor="rgba(68,39,255,0)" offset="1" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="1441" height="833" fill="#4c5ce6" />
      <rect x="0" y="0" width="1441" height="833" fill="url(#rec-grad-pink)" opacity="0.8" />
      <rect x="0" y="0" width="1441" height="833" fill="url(#rec-grad-blue)" opacity="0.8" />
      <rect x="0" y="0" width="1441" height="833" fill="url(#rec-grad-purple)" opacity="0.5" />
    </svg>
  );
}
