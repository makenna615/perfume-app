import { Formula } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import IngredientSupplierInfo from "@/components/features/IngredientSupplierInfo";

interface FormulaDisplayProps {
  formula: Formula;
}

export default function FormulaDisplay({ formula }: FormulaDisplayProps) {
  const totalPercentage = formula.ingredients.reduce((sum, ing) => sum + ing.percentage, 0);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-pale-blue mb-2">{formula.name}</h3>
      {formula.inspiration && (
        <p className="text-pale-purple/70 text-sm mb-4">
          Inspired by: <span className="font-medium text-pale-purple">{formula.inspiration}</span>
        </p>
      )}

      <div className="space-y-3">
        <p className="text-sm font-semibold text-perfume-accent">Formula Breakdown</p>
        {formula.ingredients.map((ing) => (
          <div key={ing.ingredientId} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-pale-blue">{ing.ingredientName}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-perfume-accent h-2 rounded-full"
                    style={{
                      width: `${(ing.percentage / totalPercentage) * 100}%`,
                    }}
                  />
                </div>
                <Badge variant="secondary" size="sm">
                  {ing.percentage}%
                </Badge>
                {ing.role && (
                  <Badge variant="primary" size="sm">
                    {ing.role}
                  </Badge>
                )}
              </div>
            </div>

            <IngredientSupplierInfo
              ingredientName={ing.ingredientName}
              ingredientId={ing.ingredientId}
              percentage={ing.percentage}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700">
        <p className="text-sm text-pale-purple/70">
          Total: <span className="font-bold text-pale-blue">{totalPercentage}%</span>
        </p>
      </div>
    </Card>
  );
}
