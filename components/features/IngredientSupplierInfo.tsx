"use client";

import Badge from "@/components/ui/Badge";
import { getIngredientSupplierData } from "@/lib/utils/ingredientMarket";

interface IngredientSupplierInfoProps {
  ingredientName: string;
  ingredientId?: string;
  percentage: number;
}

export default function IngredientSupplierInfo({
  ingredientName,
  ingredientId,
  percentage,
}: IngredientSupplierInfoProps) {
  const supplier = getIngredientSupplierData(ingredientName, ingredientId);
  const estimatedCost = (supplier.price || 60) * (percentage / 100);

  return (
    <div className="bg-perfume-surface/40 border border-slate-700 rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-perfume-accent uppercase">Supplier</p>
          <p className="text-sm text-pale-blue font-medium">{supplier.name}</p>
        </div>
        <Badge
          variant={
            supplier.availability === "in-stock"
              ? "success"
              : supplier.availability === "limited"
                ? "warning"
                : "secondary"
          }
          size="sm"
        >
          {supplier.availability === "in-stock"
            ? "In Stock"
            : supplier.availability === "limited"
              ? "Limited"
              : "Backordered"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-pale-purple/60">Price per 100ml</p>
          <p className="font-semibold text-pale-green">${supplier.price?.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-pale-purple/60">For {percentage}% of formula</p>
          <p className="font-semibold text-pale-green">${estimatedCost.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
