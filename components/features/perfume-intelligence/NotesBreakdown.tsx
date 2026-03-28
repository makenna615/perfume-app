import Card from "@/components/ui/Card";

interface NotesBreakdownProps {
  top: string[];
  middle: string[];
  base: string[];
}

function NoteColumn({ title, notes }: { title: string; notes: string[] }) {
  return (
    <Card variant="luxury" className="p-4">
      <h4 className="text-sm uppercase tracking-wide text-pale-blue/80 mb-3">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {notes.length > 0 ? (
          notes.map((note) => (
            <span
              key={`${title}-${note}`}
              className="px-2.5 py-1 rounded-lg text-xs bg-perfume-surface/70 text-pale-purple border border-slate-700/40"
            >
              {note}
            </span>
          ))
        ) : (
          <span className="text-slate-400 text-sm">No notes listed</span>
        )}
      </div>
    </Card>
  );
}

export default function NotesBreakdown({ top, middle, base }: NotesBreakdownProps) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <NoteColumn title="Top Notes" notes={top} />
      <NoteColumn title="Heart Notes" notes={middle} />
      <NoteColumn title="Base Notes" notes={base} />
    </div>
  );
}
