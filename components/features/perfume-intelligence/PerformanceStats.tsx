import Badge from "@/components/ui/Badge";
import { PerfumeIntelligencePerformance } from "@/types";

interface PerformanceStatsProps {
  performance?: PerfumeIntelligencePerformance;
}

export default function PerformanceStats({ performance }: PerformanceStatsProps) {
  if (!performance) {
    return <p className="text-slate-400 text-sm">No performance data available.</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Badge variant="secondary">Longevity: {performance.longevity}</Badge>
      <Badge variant="primary">Sillage: {performance.sillage}</Badge>
    </div>
  );
}
