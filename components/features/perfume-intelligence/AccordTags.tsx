interface AccordTagsProps {
  accords: Array<{
    name: string;
    strength: "dominant" | "prominent" | "subtle";
  }>;
}

export default function AccordTags({ accords }: AccordTagsProps) {
  if (accords.length === 0) {
    return <p className="text-slate-400 text-sm">No accords available.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {accords.map((accord) => (
        <span
          key={`${accord.name}-${accord.strength}`}
          className="px-3 py-1.5 rounded-full bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 text-xs font-semibold uppercase tracking-wide"
        >
          {accord.name} ({accord.strength})
        </span>
      ))}
    </div>
  );
}
