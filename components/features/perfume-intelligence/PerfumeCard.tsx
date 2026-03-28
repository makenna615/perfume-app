import Card from "@/components/ui/Card";
import { PerfumeIntelligenceDetails } from "@/types";

interface PerfumeCardProps {
  perfume: PerfumeIntelligenceDetails;
}

export default function PerfumeCard({ perfume }: PerfumeCardProps) {
  return (
    <Card variant="luxury" className="p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-2xl md:text-3xl font-playfair font-bold text-pale-blue">
            {perfume.name}
          </h3>
          <p className="text-pale-purple/80 font-semibold">{perfume.brand}</p>
          {perfume.fragranceFamily && (
            <p className="text-xs uppercase tracking-wide text-cyan-300 mt-1">{perfume.fragranceFamily}</p>
          )}
        </div>
        <div className="text-right text-sm text-slate-300">
          {perfume.releaseYear && <p>Released: {perfume.releaseYear}</p>}
          {perfume.perfumer && <p>Perfumer: {perfume.perfumer}</p>}
          {perfume.gender && <p className="capitalize">Gender: {perfume.gender}</p>}
          {perfume.community && (
            <p>
              Community: {perfume.community.rating.toFixed(1)} ({perfume.community.reviewsCount} reviews)
            </p>
          )}
        </div>
      </div>
      <p className="text-slate-300 leading-relaxed">{perfume.description}</p>
    </Card>
  );
}
