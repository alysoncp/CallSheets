"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO, startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";

interface MonthlyChartProps {
  taxYear: number;
  income: Array<{ date: string; amount: string | number }>;
  expenses: Array<{ date: string; amount: string | number }>;
}

export function MonthlyChart({ taxYear, income, expenses }: MonthlyChartProps) {
  // Use selected tax year for full Jan–Dec range
  const yearStart = startOfYear(new Date(taxYear, 0, 1));
  const yearEnd = endOfYear(new Date(taxYear, 0, 1));
  const months = eachMonthOfInterval({
    start: yearStart,
    end: yearEnd,
  });

  // Group by month (YYYY-MM format)
  const dataMap = new Map<string, { income: number; expenses: number }>();

  // Initialize all months with zeros
  months.forEach((month) => {
    const monthKey = format(month, "MMM");
    dataMap.set(monthKey, { income: 0, expenses: 0 });
  });

  // Aggregate income by month
  income.forEach((item) => {
    const monthKey = format(parseISO(item.date), "MMM");
    const existing = dataMap.get(monthKey) || { income: 0, expenses: 0 };
    dataMap.set(monthKey, {
      ...existing,
      income: existing.income + Number(item.amount),
    });
  });

  // Aggregate expenses by month
  expenses.forEach((item) => {
    const monthKey = format(parseISO(item.date), "MMM");
    const existing = dataMap.get(monthKey) || { income: 0, expenses: 0 };
    dataMap.set(monthKey, {
      ...existing,
      expenses: existing.expenses + Number(item.amount),
    });
  });

  // Convert to array sorted by month order
  const chartData = months.map((month) => {
    const monthKey = format(month, "MMM");
    const values = dataMap.get(monthKey) || { income: 0, expenses: 0 };
    return {
      date: monthKey,
      income: values.income,
      expenses: values.expenses,
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data available for this year
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          formatter={(value: number | undefined) =>
            `$${(value ?? 0).toLocaleString("en-CA", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          }
        />
        <Legend />
        <Line
          type="monotoneX"
          dataKey="income"
          stroke="hsl(var(--chart-2))"
          name="Income"
          strokeWidth={2}
        />
        <Line
          type="monotoneX"
          dataKey="expenses"
          stroke="hsl(var(--chart-1))"
          name="Expenses"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
