"use client";

import { memo } from "react";
import { Perfume } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { SparklesIcon } from "@heroicons/react/24/solid";

interface PerfumeCardProps {
  perfume: Perfume;
  onClick?: () => void;
  showSimilarity?: boolean;
}

function PerfumeCard({
  perfume,
  onClick,
  showSimilarity = false,
}: PerfumeCardProps) {
  return (
    <div className="will-change-transform cursor-pointer transition-transform duration-200 hover:-translate-y-0.5">
      <Card onClick={onClick} variant="luxury" className="p-8 cursor-pointer h-full flex flex-col hover:shadow-luxury transition-all duration-200">
        {/* Header with match badge */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-playfair font-bold text-pale-blue mb-2">
              {perfume.name}
            </h3>
            <p className="text-sm md:text-base text-slate-400 font-inter">{perfume.brand}</p>
          </div>
          {showSimilarity && perfume.similarityScore && (
            <div>
              <Badge variant="success" size="md">
                <SparklesIcon className="w-3 h-3 inline mr-1" />
                {perfume.similarityScore}%
              </Badge>
            </div>
          )}
        </div>

        {/* Description */}
        {perfume.description && (
          <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed flex-grow font-inter">
            {perfume.description}
          </p>
        )}

        {/* Notes Grid */}
        <div className="space-y-4">
          {/* Top Notes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-gradient-to-b from-pale-blue to-cyan-400 rounded-full" />
              <p className="text-xs font-bold text-pale-blue uppercase tracking-wide">Top Notes</p>
              <span className="text-xs text-slate-500">5-15 min</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {perfume.topNotes?.map((note, idx) => (
                <Badge key={`top-${idx}`} variant="secondary" size="sm">
                  {note}
                </Badge>
              ))}
            </div>
          </div>

          {/* Middle Notes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-gradient-to-b from-perfume-accent to-purple-400 rounded-full" />
              <p className="text-xs font-bold text-perfume-accent uppercase tracking-wide">Heart Notes</p>
              <span className="text-xs text-slate-500">30-60 min</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {perfume.middleNotes?.map((note, idx) => (
                <Badge key={`middle-${idx}`} variant="primary" size="sm">
                  {note}
                </Badge>
              ))}
            </div>
          </div>

          {/* Base Notes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-gradient-to-b from-pale-green to-emerald-400 rounded-full" />
              <p className="text-xs font-bold text-pale-green uppercase tracking-wide">Base Notes</p>
              <span className="text-xs text-slate-500">2-8+ hrs</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {perfume.baseNotes?.map((note, idx) => (
                <Badge key={`base-${idx}`} variant="success" size="sm">
                  {note}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default memo(PerfumeCard);
