import { Ingredient } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface IngredientCardProps {
  ingredient: Ingredient;
  onClick?: () => void;
}

export default function IngredientCard({ ingredient, onClick }: IngredientCardProps) {
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
    <Card onClick={onClick} className="p-6 cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-pale-blue">{ingredient.name}</h3>
        <Badge variant={roleColors[ingredient.role]} size="sm">
          {ingredient.role.charAt(0).toUpperCase() + ingredient.role.slice(1)}
        </Badge>
      </div>

      {ingredient.description && (
        <p className="text-pale-purple/70 text-sm mb-4">{ingredient.description}</p>
      )}

      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-perfume-accent mb-1">Scent Profile</p>
          <div className="flex flex-wrap gap-1">
            {ingredient.scentProfile.map((profile, idx) => (
              <Badge key={`profile-${idx}`} variant="secondary" size="sm">
                {profile}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-pale-purple/60 mb-1">Typical Usage</p>
            <p className="font-semibold text-pale-blue">
              {ingredient.typicalUsagePercent}%
            </p>
          </div>
          <div>
            <p className="text-xs text-pale-purple/60 mb-1">Volatility</p>
            <Badge variant={volatilityColors[ingredient.volatility]} size="sm">
              {ingredient.volatility}
            </Badge>
          </div>
        </div>

        {ingredient.substitutes && ingredient.substitutes.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-pale-purple mb-1">
              Can substitute with
            </p>
            <p className="text-sm text-pale-purple/70">
              {ingredient.substitutes.join(", ")}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
