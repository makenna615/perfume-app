import { useId } from "react";
import type { BottleShape, BottleSpec, CapShape, ShelfStatus } from "@/types";

// Drawn on a 60 × 100 canvas. Each body shape declares where its top edge sits so the
// neck and cap can be stacked above it.
interface BodyDef {
  top: number;
  node: (props: React.SVGProps<SVGElement>) => React.ReactNode;
}

const BODIES: Record<BottleShape | "vial" | "atomizer", BodyDef> = {
  rectangle: { top: 34, node: (p) => <rect x="10" y="34" width="40" height="62" rx="3" {...(p as React.SVGProps<SVGRectElement>)} /> },
  square: { top: 50, node: (p) => <rect x="7" y="50" width="46" height="46" rx="4" {...(p as React.SVGProps<SVGRectElement>)} /> },
  round: { top: 44, node: (p) => <circle cx="30" cy="70" r="26" {...(p as React.SVGProps<SVGCircleElement>)} /> },
  cylinder: { top: 34, node: (p) => <rect x="14" y="34" width="32" height="62" rx="7" {...(p as React.SVGProps<SVGRectElement>)} /> },
  oval: { top: 38, node: (p) => <ellipse cx="30" cy="67" rx="23" ry="29" {...(p as React.SVGProps<SVGEllipseElement>)} /> },
  faceted: {
    top: 38,
    node: (p) => <polygon points="15,38 45,38 53,52 53,88 45,96 15,96 7,88 7,52" {...(p as React.SVGProps<SVGPolygonElement>)} />,
  },
  flask: {
    top: 36,
    node: (p) => (
      <path d="M13 46 Q13 36 23 36 L37 36 Q47 36 47 46 L50 91 Q50 96 45 96 L15 96 Q10 96 10 91 Z" {...(p as React.SVGProps<SVGPathElement>)} />
    ),
  },
  tall: { top: 26, node: (p) => <rect x="17" y="26" width="26" height="70" rx="3" {...(p as React.SVGProps<SVGRectElement>)} /> },
  vial: { top: 46, node: (p) => <rect x="23" y="46" width="14" height="50" rx="5" {...(p as React.SVGProps<SVGRectElement>)} /> },
  atomizer: { top: 34, node: (p) => <rect x="19" y="34" width="22" height="62" rx="5" {...(p as React.SVGProps<SVGRectElement>)} /> },
};

function Cap({ shape, neckTop, fill }: { shape: CapShape; neckTop: number; fill: string }) {
  const y = (h: number) => neckTop - h;
  switch (shape) {
    case "cylinder":
      return <rect x="23" y={y(17)} width="14" height="17" rx="2" fill={fill} />;
    case "dome":
      return <path d={`M19 ${neckTop} Q19 ${y(14)} 30 ${y(14)} Q41 ${y(14)} 41 ${neckTop} Z`} fill={fill} />;
    case "tall":
      return <rect x="25" y={y(26)} width="10" height="26" rx="2" fill={fill} />;
    case "sphere":
      return <circle cx="30" cy={y(9)} r="9" fill={fill} />;
    case "faceted":
      return <polygon points={`22,${neckTop} 20,${y(8)} 25,${y(15)} 35,${y(15)} 40,${y(8)} 38,${neckTop}`} fill={fill} />;
    case "flat":
      return <rect x="20" y={y(6)} width="20" height="6" rx="1.5" fill={fill} />;
    case "cube":
    default:
      return <rect x="21" y={y(16)} width="18" height="16" rx="1.5" fill={fill} />;
  }
}

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 255) * (1 + amount));
  const g = clamp(((n >> 8) & 255) * (1 + amount));
  const b = clamp((n & 255) * (1 + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const GLASS_OPACITY = { clear: 0.28, frosted: 0.62, tinted: 0.55, opaque: 1 } as const;

interface BottleIllustrationProps {
  bottle: BottleSpec;
  status?: ShelfStatus;
  className?: string;
  title?: string;
}

export default function BottleIllustration({ bottle, status = "full", className = "h-28 w-auto", title }: BottleIllustrationProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const kind = status === "sample" ? "vial" : status === "decant" ? "atomizer" : bottle.shape;
  const body = BODIES[kind];
  const fillLevel = status === "finished" ? 0.06 : status === "wishlist" ? 0 : 0.72;
  const opaque = bottle.glassFinish === "opaque";
  const neckTop = body.top - 5;
  const capShape: CapShape = kind === "vial" ? "cylinder" : kind === "atomizer" ? "flat" : bottle.cap.shape;
  const capColor = kind === "atomizer" ? "#b9b4ac" : bottle.cap.color;
  // Every cap gets a cylindrical gradient; metallic ones are just more contrasty.
  const capFill = `url(#cap-${uid})`;
  const capContrast = bottle.cap.finish === "metallic" || kind === "atomizer" ? 1 : bottle.cap.finish === "glossy" ? 0.6 : 0.3;
  const stroke = shade(opaque ? bottle.glassColor : bottle.liquidColor, -0.45);
  const ghost = status === "wishlist";

  return (
    <svg viewBox="0 0 60 100" className={className} role="img" aria-label={title} style={ghost ? { opacity: 0.55 } : undefined}>
      {title && <title>{title}</title>}
      <defs>
        <clipPath id={`body-${uid}`}>{body.node({})}</clipPath>
        <linearGradient id={`cap-${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor={shade(capColor, -0.25 * capContrast)} />
          <stop offset="0.4" stopColor={shade(capColor, 0.35 * capContrast + 0.05)} />
          <stop offset="1" stopColor={shade(capColor, -0.32 * capContrast)} />
        </linearGradient>
        {/* curved-glass shading: darker edges, bright left highlight, soft right rim */}
        <linearGradient id={`glass-${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="0.16" stopColor="#000" stopOpacity="0.05" />
          <stop offset="0.24" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.32" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="0.78" stopColor="#000" stopOpacity="0.04" />
          <stop offset="0.9" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#000" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id={`depth-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.18" />
        </linearGradient>
      </defs>

      {/* soft shadow on the shelf */}
      <ellipse cx="30" cy="97.5" rx="20" ry="1.6" fill="#000" opacity="0.08" />

      {/* neck */}
      <rect x="26" y={neckTop} width="8" height="6" fill={shade(bottle.glassColor, -0.15)} opacity={ghost ? 0.4 : 0.9} />

      {/* glass body */}
      {body.node({
        fill: bottle.glassColor,
        fillOpacity: ghost ? 0.1 : GLASS_OPACITY[bottle.glassFinish],
        stroke,
        strokeOpacity: 0.35,
        strokeWidth: 0.8,
        strokeDasharray: ghost ? "2 2" : undefined,
      })}

      {/* juice, clipped to the body */}
      {!opaque && fillLevel > 0 && (
        <g clipPath={`url(#body-${uid})`}>
          <rect
            x="0"
            y={96 - (96 - body.top) * fillLevel}
            width="60"
            height="100"
            fill={bottle.liquidColor}
            opacity={bottle.glassFinish === "frosted" ? 0.55 : 0.85}
          />
        </g>
      )}

      {/* label */}
      {bottle.labelColor && kind !== "vial" && kind !== "atomizer" && !ghost && (
        <g clipPath={`url(#body-${uid})`}>
          <rect x="18" y={body.top + (96 - body.top) * 0.42} width="24" height={(96 - body.top) * 0.22} rx="1" fill={bottle.labelColor} opacity="0.92" />
        </g>
      )}

      {/* 3D shading over glass, juice and label */}
      {!ghost && (
        <g clipPath={`url(#body-${uid})`}>
          <rect x="0" y="0" width="60" height="100" fill={`url(#glass-${uid})`} opacity={opaque ? 0.75 : 1} />
          <rect x="0" y="0" width="60" height="100" fill={`url(#depth-${uid})`} />
        </g>
      )}

      {/* cap */}
      {/* outline keeps pale/clear caps visible against the paper background */}
      <g opacity={ghost ? 0.45 : 1} stroke={shade(capColor, -0.4)} strokeOpacity={0.5} strokeWidth={0.7}>
        <Cap shape={capShape} neckTop={neckTop} fill={capFill} />
        {kind === "atomizer" && <rect x="28" y={neckTop - 10} width="4" height="4" fill="#8f8a83" />}
      </g>
    </svg>
  );
}
