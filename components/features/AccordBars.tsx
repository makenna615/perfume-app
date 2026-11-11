interface AccordBarsProps {
  accords: Array<{ name: string; strength: "dominant" | "prominent" | "subtle" }>;
}

const WIDTH = { dominant: "100%", prominent: "68%", subtle: "38%" } as const;

export default function AccordBars({ accords }: AccordBarsProps) {
  if (accords.length === 0) {
    return <p className="text-sm text-ink-faint">No accords available.</p>;
  }

  return (
    <ul className="space-y-2.5">
      {accords.map((accord) => (
        <li key={accord.name} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 text-sm">
          <span className="truncate capitalize text-ink-soft">{accord.name}</span>
          <span className="relative h-2 rounded-full bg-paper-deep" aria-label={`${accord.name}: ${accord.strength}`}>
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-resin"
              style={{ width: WIDTH[accord.strength], opacity: accord.strength === "subtle" ? 0.55 : 1 }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}
