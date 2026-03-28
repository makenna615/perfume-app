interface PerfumeLogoIconProps {
  className?: string;
}

export default function PerfumeLogoIcon({ className = "w-8 h-8" }: PerfumeLogoIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="24" y="6" width="16" height="8" rx="2" fill="url(#mipPerfumeGradient)" />
      <rect x="20" y="14" width="24" height="10" rx="3" fill="#173152" />
      <rect x="10" y="22" width="44" height="34" rx="10" fill="url(#mipBottleGradient)" />
      <rect x="14" y="26" width="36" height="26" rx="8" fill="url(#mipInnerGradient)" />
      <path d="M44 16H50C53.3137 16 56 18.6863 56 22V24H44V16Z" fill="#5A80D6" />
      <circle cx="30" cy="39" r="5" fill="#A4C8FF" fillOpacity="0.35" />
      <defs>
        <linearGradient id="mipBottleGradient" x1="10" y1="22" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C7EE7" />
          <stop offset="0.55" stopColor="#4F9DD8" />
          <stop offset="1" stopColor="#46A1A3" />
        </linearGradient>
        <linearGradient id="mipInnerGradient" x1="14" y1="26" x2="50" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F1A3A" stopOpacity="0.85" />
          <stop offset="1" stopColor="#162757" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="mipPerfumeGradient" x1="24" y1="6" x2="40" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#86E5C7" />
          <stop offset="1" stopColor="#7EC8FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
