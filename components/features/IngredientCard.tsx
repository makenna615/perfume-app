"use client";

import { memo } from "react";
import { Ingredient } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface IngredientCardProps {
  ingredient: Ingredient;
  onClick?: () => void;
}

function IngredientCard({ ingredient, onClick }: IngredientCardProps) {
  const roleColors = {
    top: "warning" as const,
    middle: "primary" as const,
    base: "secondary" as const,
  };

  const volatilityColors = {
    high: "warning" as const,
    medium: "primary" as const,
    low: "secondary" as const,
  };

  return (
    <div className="will-change-transform cursor-pointer transition-transform duration-200 hover:-translate-y-0.5">
      <Card
        onClick={onClick}
        variant="luxury"
        className="p-6 cursor-pointer h-[410px] flex flex-col hover:shadow-luxury transition-all duration-200"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-playfair font-bold text-pale-blue flex-1 leading-snug">
            {ingredient.name}
          </h3>
          <div className="ml-2 flex-shrink-0">
            <Badge variant={roleColors[ingredient.role]} size="sm">
              {ingredient.role.charAt(0).toUpperCase() + ingredient.role.slice(1)}
            </Badge>
          </div>
        </div>

        <p className="text-pale-purple/70 text-sm mb-5 font-inter line-clamp-2 min-h-[40px]">
          {ingredient.description || "No description available."}
        </p>

        <div className="space-y-4 flex-grow">
          <div>
            <p className="text-xs font-semibold text-perfume-accent uppercase tracking-wide mb-2">
              Scent Profile
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ingredient.scentProfile.slice(0, 3).map((profile, idx) => (
                <Badge key={`profile-${idx}`} variant="secondary" size="sm">
                  {profile}
                </Badge>
              ))}
              {ingredient.scentProfile.length > 3 && (
                <Badge variant="secondary" size="sm">
                  +{ingredient.scentProfile.length - 3}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-perfume-surface/50 rounded-xl p-3">
            <div>
              <p className="text-xs text-pale-purple/60 uppercase tracking-wide mb-1.5">Usage</p>
              <p className="text-sm font-semibold text-pale-green">
                {ingredient.typicalUsagePercent}%
              </p>
            </div>
            <div>
              <p className="text-xs text-pale-purple/60 uppercase tracking-wide mb-1.5">Volatility</p>
              <Badge variant={volatilityColors[ingredient.volatility]} size="sm">
                {ingredient.volatility}
              </Badge>
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-3 min-h-[64px]">
            <p className="text-xs font-semibold text-perfume-accent uppercase tracking-wide mb-2">
              Alternatives
            </p>
            <p className="text-sm text-pale-purple/70 line-clamp-2 font-inter">
              {ingredient.substitutes && ingredient.substitutes.length > 0
                ? `${ingredient.substitutes.slice(0, 2).join(", ")}${
                    ingredient.substitutes.length > 2
                      ? ` +${ingredient.substitutes.length - 2}`
                      : ""
                  }`
                : "No substitutes listed."}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default memo(IngredientCard);
