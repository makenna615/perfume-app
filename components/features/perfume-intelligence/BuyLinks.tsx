import { PerfumeIntelligenceAvailability } from "@/types";

interface BuyLinksProps {
  availability: PerfumeIntelligenceAvailability[];
}

export default function BuyLinks({ availability }: BuyLinksProps) {
  if (availability.length === 0) {
    return <p className="text-slate-400 text-sm">No retailer links provided.</p>;
  }

  return (
    <div className="space-y-3">
      {availability.map((item) => (
        <a
          key={`${item.store}-${item.region}-${item.url}`}
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="block p-3 rounded-xl border border-slate-700/40 bg-perfume-surface/40 hover:border-cyan-400/40 hover:bg-cyan-500/10 transition-colors"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-pale-blue font-semibold">{item.store}</p>
              <p className="text-xs text-slate-400">{item.region}</p>
            </div>
            <span className="text-xs text-cyan-300 font-semibold uppercase tracking-wide">Visit</span>
          </div>
        </a>
      ))}
    </div>
  );
}
