"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  TooltipContentProps,
} from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { Formula } from "@/types";

interface FormulaChartProps {
  formula: Formula;
}

const COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#3aa655",
  "#f59e0b",
  "#ec4899",
  "#10b981",
  "#0ea5e9",
  "#f97316",
];

function FormulaTooltip({
  active,
  payload,
}: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-perfume-surface border border-slate-700 rounded-lg p-3 shadow-lg">
      <p className="text-perfume-accent font-semibold">{String(payload[0].name)}</p>
      <p className="text-pale-green text-sm">{String(payload[0].value)}%</p>
    </div>
  );
}

export function FormulaChart({ formula }: FormulaChartProps) {
  const data = formula.ingredients.map((ing) => ({
    name: ing.ingredientName,
    value: ing.percentage,
  }));

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name} ${value}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={FormulaTooltip} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-sm text-perfume-accent">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-perfume-accent/70">
        Total: {formula.ingredients.reduce((sum, ing) => sum + ing.percentage, 0)}%
      </div>
    </div>
  );
}
