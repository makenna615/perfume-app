import { Perfume } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface PerfumeCardProps {
  perfume: Perfume;
  onClick?: () => void;
  showSimilarity?: boolean;
}

export default function PerfumeCard({
  perfume,
  onClick,
  showSimilarity = false,
}: PerfumeCardProps) {
  return (
    <Card onClick={onClick} className="p-6 cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-bold text-pale-blue">{perfume.name}</h3>
          <p className="text-sm text-pale-purple/80">{perfume.brand}</p>
        </div>
        {showSimilarity && perfume.similarityScore && (
          <Badge variant="success" size="sm">
            {perfume.similarityScore}% match
          </Badge>
        )}
      </div>

      {perfume.description && (
        <p className="text-pale-purple/70 text-sm mb-4">{perfume.description}</p>
      )}

      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-perfume-accent mb-1">Top Notes</p>
          <div className="flex flex-wrap gap-1">
            {perfume.topNotes?.map((note, idx) => (
              <Badge key={`top-${idx}`} variant="primary" size="sm">
                {note}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-pale-purple mb-1">Middle Notes</p>
          <div className="flex flex-wrap gap-1">
            {perfume.middleNotes?.map((note, idx) => (
              <Badge key={`middle-${idx}`} variant="primary" size="sm">
                {note}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-pale-blue mb-1">Base Notes</p>
          <div className="flex flex-wrap gap-1">
            {perfume.baseNotes?.map((note, idx) => (
              <Badge key={`base-${idx}`} variant="primary" size="sm">
                {note}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
