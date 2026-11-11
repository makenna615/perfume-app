interface PerfumeLogoIconProps {
  className?: string;
}

/** Line-art flacon; inherits colour from `currentColor`. */
export default function PerfumeLogoIcon({ className = "w-8 h-8" }: PerfumeLogoIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
    >
      <rect x="13" y="3.5" width="6" height="4" rx="0.75" />
      <path d="M14.5 7.5v3M17.5 7.5v3" />
      <path d="M9.5 13.5c0-1.7 1.3-3 3-3h7c1.7 0 3 1.3 3 3V25c0 1.9-1.6 3.5-3.5 3.5h-6c-1.9 0-3.5-1.6-3.5-3.5V13.5z" />
      <path d="M9.5 19.5c2.2-1 4.3-1 6.5 0s4.3 1 6.5 0" strokeOpacity="0.55" />
    </svg>
  );
}
