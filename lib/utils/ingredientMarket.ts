import { Ingredient } from "@/types";

type Availability = "in-stock" | "limited" | "backordered";

const supplierLookup: Record<
  string,
  { name: string; price: number; availability: Availability; link?: string }
> = {
  bergamot: {
    name: "Dragoco",
    price: 45.99,
    availability: "in-stock",
  },
  rose: {
    name: "Grasse International",
    price: 125.5,
    availability: "in-stock",
  },
  sandalwood: {
    name: "Taj Fine Fragrance",
    price: 89.99,
    availability: "limited",
  },
  vanilla: {
    name: "International Fragrance Sources",
    price: 34.5,
    availability: "in-stock",
  },
  jasmine: {
    name: "Fragrance Resources",
    price: 95,
    availability: "backordered",
  },
  musk: {
    name: "Advanced Biotech",
    price: 72,
    availability: "in-stock",
  },
  "iso-e-super": {
    name: "Aroma Lab Direct",
    price: 56,
    availability: "in-stock",
  },
  hedione: {
    name: "Aroma Lab Direct",
    price: 62,
    availability: "in-stock",
  },
};

function toKey(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

export function getIngredientSupplierData(
  ingredientName: string,
  ingredientId?: string
): NonNullable<Ingredient["supplier"]> {
  const key = ingredientId ? toKey(ingredientId) : toKey(ingredientName);
  const result = supplierLookup[key];

  if (result) {
    return result;
  }

  return {
    name: "Various Suppliers",
    price: 60,
    availability: "in-stock",
  };
}
