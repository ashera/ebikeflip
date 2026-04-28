import type { SVGProps } from "react";

/**
 * Side-view ebike sketch. Use `currentColor` so the stroke picks up the
 * parent's text color — pair with a low opacity to keep it as a hint.
 */
export function EbikeSketch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 260 140"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {/* wheels */}
      <circle cx="60" cy="100" r="30" />
      <circle cx="60" cy="100" r="3" />
      <circle cx="200" cy="100" r="30" />
      <circle cx="200" cy="100" r="3" />

      {/* spokes (hint of detail) */}
      <path d="M40 100 L80 100 M60 80 L60 120" opacity="0.5" />
      <path d="M180 100 L220 100 M200 80 L200 120" opacity="0.5" />

      {/* frame */}
      <path d="M60 100 L110 55" />
      <path d="M110 55 L180 60" />
      <path d="M180 60 L200 100" />
      <path d="M130 100 L110 55" />
      <path d="M130 100 L180 60" />
      <path d="M60 100 L130 100" />

      {/* battery on down tube */}
      <rect x="138" y="78" width="40" height="12" rx="2" />
      <path d="M168 81 L168 87 M172 81 L172 87" opacity="0.5" />

      {/* crank */}
      <circle cx="130" cy="100" r="9" />
      <path d="M130 91 L130 109" opacity="0.5" />

      {/* seat */}
      <path d="M110 55 L108 38" />
      <path d="M96 36 L122 36" />

      {/* handlebars */}
      <path d="M180 60 L180 36" />
      <path d="M170 33 L190 33" />
      <path d="M170 33 L168 38" />
      <path d="M190 33 L192 38" />
    </svg>
  );
}

/** Small wavy beach-line motif, paired with bikes for the coastal accent. */
export function WaveSketch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      aria-hidden
      {...props}
    >
      <path d="M0 12 C 20 4, 40 4, 60 12 S 100 20, 120 12 S 160 4, 200 12" />
      <path
        d="M0 18 C 20 12, 40 12, 60 18 S 100 24, 120 18 S 160 12, 200 18"
        opacity="0.6"
      />
    </svg>
  );
}
