"use client";

interface BlendingOptimizerProps {
  selectedMode: "balanced" | "longevity" | "projection";
  onModeChange: (mode: "balanced" | "longevity" | "projection") => void;
}

export default function BlendingOptimizer({
  selectedMode,
  onModeChange,
}: BlendingOptimizerProps) {
  const modes = [
    {
      id: "balanced" as const,
      label: "Balanced",
      description: "Equal emphasis on all fragrance aspects",
      tips: "Creates a well-rounded fragrance that evolves naturally",
    },
    {
      id: "longevity" as const,
      label: "Longevity",
      description: "Maximize how long the scent lasts",
      tips: "Leans on base notes (30%+) for extended wear",
    },
    {
      id: "projection" as const,
      label: "Maximum Projection",
      description: "Maximize impact and throw",
      tips: "Uses highly diffusive notes for stronger opening presence",
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-pale-blue">Blending Optimization</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`text-left transition-all rounded-lg border-2 p-4 ${
              selectedMode === mode.id
                ? "border-perfume-accent bg-perfume-accent/10 shadow-lg shadow-perfume-accent/30"
                : "border-slate-700 bg-perfume-surface/50 hover:border-perfume-accent/50"
            }`}
          >
            <h4 className="font-bold text-pale-blue mb-1">{mode.label}</h4>
            <p className="text-sm text-pale-purple/80 mb-2">{mode.description}</p>
            <p className="text-xs text-pale-purple/60 border-t border-slate-700 pt-2">
              {mode.tips}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
