import Link from "next/link";
import type { NoteRole } from "@/types";
import { LAYER_DOT, LAYER_LABEL } from "@/components/ui/Tag";
import { ROLE_TIMING } from "@/lib/format";

interface NotePyramidProps {
  notes: { top: string[]; middle: string[]; base: string[] };
  structure?: "pyramid" | "linear";
  /** Highlight these notes (e.g. notes shared with another perfume). */
  highlight?: string[];
  /** Link each note to the materials library. */
  linkNotes?: boolean;
}

const ORDER: NoteRole[] = ["top", "middle", "base"];
const WIDTHS: Record<NoteRole, string> = { top: "md:w-[62%]", middle: "md:w-[81%]", base: "md:w-full" };

function NoteChip({ note, highlighted, link }: { note: string; highlighted: boolean; link: boolean }) {
  const className = `inline-flex rounded-full border px-3 py-1 text-sm transition-colors ${
    highlighted ? "border-resin bg-resin-wash text-resin-deep" : "border-line bg-card text-ink"
  } ${link ? "hover:border-ink" : ""}`;
  return link ? (
    <Link href={`/ingredients?q=${encodeURIComponent(note)}`} className={className} title={`How is "${note}" made?`}>
      {note}
    </Link>
  ) : (
    <span className={className}>{note}</span>
  );
}

export default function NotePyramid({ notes, structure = "pyramid", highlight = [], linkNotes = false }: NotePyramidProps) {
  const highlighted = new Set(highlight.map((n) => n.toLowerCase()));

  if (structure === "linear") {
    const all = [...notes.top, ...notes.middle, ...notes.base];
    return (
      <div>
        <p className="mb-3 text-sm text-ink-faint">
          This perfume is published as a linear composition — its notes are presented together rather than as a pyramid.
        </p>
        <div className="flex flex-wrap gap-2">
          {all.map((note) => (
            <NoteChip key={note} note={note} highlighted={highlighted.has(note.toLowerCase())} link={linkNotes} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ol className="flex flex-col items-center gap-2">
      {ORDER.map((role) => (
        <li key={role} className={`w-full ${WIDTHS[role]} rounded-sm border border-line bg-paper/60 px-4 py-3`}>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className={`h-2 w-2 rounded-full ${LAYER_DOT[role]}`} aria-hidden />
              {LAYER_LABEL[role]} notes
            </span>
            <span className="text-xs text-ink-faint">{ROLE_TIMING[role]}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {notes[role].length > 0 ? (
              notes[role].map((note) => (
                <NoteChip key={note} note={note} highlighted={highlighted.has(note.toLowerCase())} link={linkNotes} />
              ))
            ) : (
              <span className="text-sm text-ink-faint">Not listed</span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
