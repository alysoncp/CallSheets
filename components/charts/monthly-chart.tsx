"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

interface MonthlyChartProps {
  income: Array<{ date: string; amount: string | number }>;
  expenses: Array<{ date: string; amount: string | number }>;
}

export function MonthlyChart({ income, expenses }: MonthlyChartProps) {
  // Group by date
  const dataMap = new Map<string, { income: number; expenses: number }>();

  income.forEach((item) => {
    const date = format(parseISO(item.date), "MMM dd");
    const existing = dataMap.get(date) || { income: 0, expenses: 0 };
    dataMap.set(date, {
      ...existing,
      income: existing.income + Number(item.amount),
    });
  });

  expenses.forEach((item) => {
    const date = format(parseISO(item.date), "MMM dd");
    const existing = dataMap.get(date) || { income: 0, expenses: 0 };
    dataMap.set(date, {
      ...existing,
      expenses: existing.expenses + Number(item.amount),
    });
  });

  const chartData = Array.from(dataMap.entries()).map(([date, values]) => ({
    date,
    income: values.income,
    expenses: values.expenses,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data available for this month
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          formatter={(value: number) =>
            `$${value.toLocaleString("en-CA", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          }
        />
        <Legend />
        <Bar dataKey="income" fill="#22c55e" name="Income" />
        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
}
