import type { NoteRole } from "@/types";

type Tone = NoteRole | "neutral" | "resin";

const toneStyles: Record<Tone, string> = {
  top: "bg-citrus-wash text-[#6e5518] border-citrus/30",
  middle: "bg-heart-wash text-[#7a3348] border-heart/30",
  base: "bg-wood-wash text-wood border-wood/25",
  neutral: "bg-paper-deep text-ink-soft border-line",
  resin: "bg-resin-wash text-resin-deep border-resin/30",
};

interface TagProps {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}

export default function Tag({ children, tone = "neutral", className = "" }: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[13px] leading-5 ${toneStyles[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export const LAYER_LABEL: Record<NoteRole, string> = { top: "Top", middle: "Heart", base: "Base" };
export const LAYER_DOT: Record<NoteRole, string> = { top: "bg-citrus", middle: "bg-heart", base: "bg-wood" };
export const LAYER_TEXT: Record<NoteRole, string> = {
  top: "text-citrus",
  middle: "text-heart",
  base: "text-wood",
};
