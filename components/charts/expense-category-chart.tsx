"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ExpenseCategoryChartProps {
  expenses: Array<{ category: string; amount: string | number }>;
}

// Theme-aware palette using CSS variables (chart-1 through chart-5, then repeat)
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function formatCategoryLabel(key: string): string {
  return key
    .trim()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ExpenseCategoryChart({ expenses }: ExpenseCategoryChartProps) {
  const data = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const item of expenses) {
      const category = item.category?.trim() || "Uncategorized";
      const amount = Number(item.amount) || 0;
      if (amount <= 0) continue;
      byCategory.set(category, (byCategory.get(category) ?? 0) + amount);
    }
    return Array.from(byCategory.entries())
      .map(([name, value]) => ({
        name: formatCategoryLabel(name),
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        No expenses for this year
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius="70%"
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{ borderRadius: "var(--radius)" }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
