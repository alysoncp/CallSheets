"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, DollarSign, Receipt, TrendingUp, Calculator } from "lucide-react";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { ExpenseCategoryChart } from "@/components/charts/expense-category-chart";
import { useTaxYear } from "@/lib/contexts/tax-year-context";
import { ExpenseEntryDialog } from "@/components/expenses/expense-entry-dialog";
import { IncomeEntryDialog } from "@/components/income/income-entry-dialog";

const INCOME_TYPE_LABELS: Record<string, string> = {
  union_production: "Union Production",
  non_union_production: "Non-Union Production",
  royalty_residual: "Royalty/Residual",
  cash: "Cash",
};

function getIncomeDisplayName(item: { productionName?: string | null; description?: string | null; incomeType?: string }, maxWords = 6) {
  let name: string;
  if (item.productionName?.trim()) name = item.productionName.trim();
  else if (item.description?.trim()) name = item.description.trim();
  else name = INCOME_TYPE_LABELS[item.incomeType ?? ""] ?? item.incomeType ?? "Income";
  const words = name.split(/\s+/);
  return words.length <= maxWords ? name : words.slice(0, maxWords).join(" ") + (words.length > maxWords ? "…" : "");
}

interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  monthlyIncome: any[];
  monthlyExpenses: any[];
  yearlyIncome: any[];
  yearlyExpenses: any[];
  recentIncome: any[];
  recentExpenses: any[];
}

interface DashboardPageClientProps {
  allData: DashboardData;
}

export function DashboardPageClient({ allData }: DashboardPageClientProps) {
  const router = useRouter();
  const { taxYear } = useTaxYear();
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  // Filter all data by selected year
  const filteredData = useMemo(() => {
    const filterByYear = (records: any[]) => {
      return records.filter((record) => {
        try {
          const recordDate = new Date(record.date);
          return recordDate.getFullYear() === taxYear;
        } catch {
          return false;
        }
      });
    };

    const filteredYearlyIncome = filterByYear(allData.yearlyIncome);
    const filteredYearlyExpenses = filterByYear(allData.yearlyExpenses);
    const filteredMonthlyIncome = filterByYear(allData.monthlyIncome);
    const filteredMonthlyExpenses = filterByYear(allData.monthlyExpenses);
    const filteredRecentIncome = filterByYear(allData.recentIncome).slice(0, 5);
    const filteredRecentExpenses = filterByYear(allData.recentExpenses).slice(0, 5);

    // Calculate totals for selected year
    const totalIncome = filteredYearlyIncome.reduce(
      (sum, record) => sum + Number(record.amount || 0),
      0
    );
    const totalExpenses = filteredYearlyExpenses.reduce(
      (sum, record) => sum + Number(record.amount || 0),
      0
    );

    return {
      totalIncome,
      totalExpenses,
      monthlyIncome: filteredMonthlyIncome,
      monthlyExpenses: filteredMonthlyExpenses,
      yearlyIncome: filteredYearlyIncome,
      yearlyExpenses: filteredYearlyExpenses,
      recentIncome: filteredRecentIncome,
      recentExpenses: filteredRecentExpenses,
    };
  }, [allData, taxYear]);

  const netIncome = filteredData.totalIncome - filteredData.totalExpenses;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="sticky top-0 z-10 -mx-4 flex flex-col gap-3 border-b border-border bg-background px-4 py-3 sm:-mx-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5 md:-mx-6 md:px-6 lg:h-16 lg:py-0">
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Button size="sm" className="text-xs sm:text-sm" onClick={() => setIncomeDialogOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
            Add Income
          </Button>
          <Button size="sm" className="text-xs sm:text-sm" onClick={() => setExpenseDialogOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              ${filteredData.totalIncome.toLocaleString("en-CA", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              ${filteredData.totalExpenses.toLocaleString("en-CA", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              ${netIncome.toLocaleString("en-CA", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Calculator</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/tax-calculator">Calculate Taxes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Yearly Overview</CardTitle>
            <CardDescription>
              Income and expenses for {taxYear}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-1 pr-2 sm:px-6">
            <MonthlyChart
              taxYear={taxYear}
              income={filteredData.yearlyIncome}
              expenses={filteredData.yearlyExpenses}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by category</CardTitle>
            <CardDescription>
              Expense breakdown for {taxYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseCategoryChart expenses={filteredData.yearlyExpenses} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest income and expenses for {taxYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Recent Income</h3>
                <div className="space-y-2">
                  {filteredData.recentIncome.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No income records for {taxYear}</p>
                  ) : (
                    filteredData.recentIncome.map((item) => (
                      <div
                        key={item.id}
                        className="flex min-w-0 items-center justify-between gap-3 text-sm"
                      >
                        <span className="min-w-0 truncate">{getIncomeDisplayName(item)}</span>
                        <span className="shrink-0 font-medium text-green-600">
                          ${Number(item.amount).toLocaleString("en-CA", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Recent Expenses</h3>
                <div className="space-y-2">
                  {filteredData.recentExpenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No expense records for {taxYear}</p>
                  ) : (
                    filteredData.recentExpenses.map((item) => (
                      <div
                        key={item.id}
                        className="flex min-w-0 items-center justify-between gap-3 text-sm"
                      >
                        <span className="min-w-0 truncate">{item.title}</span>
                        <span className="shrink-0 font-medium text-red-600">
                          ${Number(item.amount).toLocaleString("en-CA", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <IncomeEntryDialog
        open={incomeDialogOpen}
        onOpenChange={(open) => {
          setIncomeDialogOpen(open);
          if (!open) {
            router.refresh();
            window.dispatchEvent(new Event("incomeUpdated"));
          }
        }}
        initialData={undefined}
        onPaystubUploaded={() => router.refresh()}
      />
      <ExpenseEntryDialog
        open={expenseDialogOpen}
        onOpenChange={(open) => {
          setExpenseDialogOpen(open);
          if (!open) {
            router.refresh();
            window.dispatchEvent(new Event("expenseUpdated"));
          }
        }}
        initialData={undefined}
      />
    </div>
  );
}
