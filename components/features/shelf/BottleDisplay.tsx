import type { BottleSpec, ShelfPhoto, ShelfStatus } from "@/types";
import BottleIllustration from "@/components/features/shelf/BottleIllustration";

type Size = "shelf" | "card" | "hero";

const SIZES: Record<Size, { stage: string; height: string; bottle: string; photo: string; floor: string }> = {
  shelf: { stage: "h-[150px] w-[92px]", height: "h-[150px]", bottle: "h-[118px] w-auto", photo: "max-h-[132px] max-w-[84px]", floor: "h-[26px]" },
  card: { stage: "h-[170px] w-[150px]", height: "h-[170px]", bottle: "h-[124px] w-auto", photo: "max-h-[146px] max-w-[136px]", floor: "h-[30px]" },
  hero: { stage: "h-[190px] w-[150px]", height: "h-[190px]", bottle: "h-[140px] w-auto", photo: "max-h-[170px] max-w-[140px]", floor: "h-[32px]" },
};

interface BottleDisplayProps {
  bottle: BottleSpec;
  status: ShelfStatus;
  photo?: ShelfPhoto;
  size?: Size;
  label: string;
}

/** The visual itself — used twice per niche (bottle + its reflection). */
function Visual({ bottle, status, photo, size, label, decorative = false }: BottleDisplayProps & { size: Size; decorative?: boolean }) {
  const s = SIZES[size];
  if (photo?.display === "render" && photo.renderSrc) {
    // AI studio render: transparent background, so it stands in the niche as a true cut-out.
    return (
      // eslint-disable-next-line @next/next/no-img-element -- private, already-resized image served by our own authenticated route
      <img
        src={photo.renderSrc}
        alt={decorative ? "" : label}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`${s.photo} h-auto w-auto object-contain drop-shadow-[0_6px_6px_rgba(40,25,10,0.18)]`}
        style={{
          opacity: status === "wishlist" ? 0.55 : 1,
          filter: status === "finished" ? "saturate(0.6)" : undefined,
        }}
      />
    );
  }
  if (photo && photo.display === "photo") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- private, already-resized image served by our own authenticated route
      <img
        src={photo.src}
        alt={decorative ? "" : label}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`${s.photo} h-auto w-auto object-contain mix-blend-multiply`}
        // Feather the edges so studio backdrops melt into the niche instead of reading as a rectangle.
        style={{
          maskImage: "radial-gradient(ellipse 72% 78% at 50% 52%, #000 62%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 72% 78% at 50% 52%, #000 62%, transparent 100%)",
          opacity: status === "wishlist" ? 0.55 : 1,
          filter: status === "finished" ? "saturate(0.6)" : undefined,
        }}
      />
    );
  }
  return <BottleIllustration bottle={bottle} status={status} className={s.bottle} title={decorative ? undefined : label} />;
}

/**
 * A softly lit glass niche: arched back wall with a spotlight, the bottle standing on a
 * glossy floor with a contact shadow and reflection, and a slight 3D turn on hover
 * (the parent element needs the `group` class).
 */
export default function BottleDisplay({ size = "shelf", ...props }: BottleDisplayProps) {
  const s = SIZES[size];
  return (
    <div className="relative flex flex-col items-center" style={{ perspective: "700px" }}>
      {/* back wall + spotlight */}
      <div className={`relative flex ${s.stage} items-end justify-center overflow-hidden rounded-t-[999px] border border-b-0 border-white/60`}
        style={{
          background:
            "radial-gradient(70% 45% at 50% 6%, rgba(255,252,245,0.98), rgba(255,250,240,0) 70%)," +
            "linear-gradient(180deg, #f3ebe0 0%, #e9dfd1 55%, #ddd0be 100%)",
          boxShadow: "inset 0 10px 18px -12px rgba(60,40,20,0.35), inset 0 -6px 12px -10px rgba(60,40,20,0.25)",
        }}
      >
        {/* contact shadow */}
        <span className="absolute bottom-0 left-1/2 h-3 w-3/5 -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-black/25 blur-[3px]" aria-hidden />
        <div className="relative z-10 origin-bottom transition-transform duration-500 ease-out group-hover:[transform:rotateY(-14deg)_translateY(-3px)] group-focus-within:[transform:rotateY(-14deg)_translateY(-3px)]">
          <Visual {...props} size={size} />
        </div>
      </div>

      {/* glossy floor with a faded reflection */}
      <div
        className={`relative w-full overflow-hidden ${s.floor}`}
        style={{ background: "linear-gradient(180deg, #e7ddd0, #d9cbb8)" }}
        aria-hidden
      >
        {/* Same-height layer as the stage, mirrored as a whole: the bottle’s base lands on the
            floor edge. The mask (in pre-flip coordinates) keeps only the base, fading out. */}
        <div
          className={`absolute inset-x-0 top-0 flex ${s.height} items-end justify-center opacity-25`}
          style={{
            transform: "scaleY(-1)",
            maskImage: "linear-gradient(to top, #000 0%, transparent 28%)",
            WebkitMaskImage: "linear-gradient(to top, #000 0%, transparent 28%)",
          }}
        >
          <Visual {...props} size={size} decorative />
        </div>
        {/* front edge highlight of the glass shelf */}
        <span className="absolute inset-x-0 top-0 h-px bg-white/70" />
      </div>
    </div>
  );
}
