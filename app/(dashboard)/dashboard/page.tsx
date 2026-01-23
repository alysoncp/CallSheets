import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, DollarSign, Receipt, TrendingUp, Calculator } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { income, expenses } from "@/lib/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { MonthlyChart } from "@/components/charts/monthly-chart";

async function getDashboardData(userId: string) {
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);

  const [totalIncomeResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${income.amount}::numeric), 0)`,
    })
    .from(income)
    .where(eq(income.userId, userId));

  const [totalExpensesResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${expenses.amount}::numeric), 0)`,
    })
    .from(expenses)
    .where(eq(expenses.userId, userId));

  const totalIncome = Number(totalIncomeResult?.total || 0);
  const totalExpenses = Number(totalExpensesResult?.total || 0);

  const monthlyIncome = await db
    .select()
    .from(income)
    .where(
      and(
        eq(income.userId, userId),
        gte(income.date, format(startOfCurrentMonth, "yyyy-MM-dd")),
        lte(income.date, format(endOfCurrentMonth, "yyyy-MM-dd"))
      )
    );

  const monthlyExpenses = await db
    .select()
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        gte(expenses.date, format(startOfCurrentMonth, "yyyy-MM-dd")),
        lte(expenses.date, format(endOfCurrentMonth, "yyyy-MM-dd"))
      )
    );

  const recentIncome = await db
    .select()
    .from(income)
    .where(eq(income.userId, userId))
    .orderBy(income.date)
    .limit(5);

  const recentExpenses = await db
    .select()
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .orderBy(expenses.date)
    .limit(5);

  return {
    totalIncome,
    totalExpenses,
    monthlyIncome,
    monthlyExpenses,
    recentIncome,
    recentExpenses,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const data = await getDashboardData(user.id);
  const netIncome = data.totalIncome - data.totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/income/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Income
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/expenses/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.totalIncome.toLocaleString("en-CA", {
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
            <div className="text-2xl font-bold">
              ${data.totalExpenses.toLocaleString("en-CA", {
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
            <div className="text-2xl font-bold">
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>
              Income and expenses for {format(new Date(), "MMMM yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyChart
              income={data.monthlyIncome}
              expenses={data.monthlyExpenses}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest income and expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Recent Income</h3>
                <div className="space-y-2">
                  {data.recentIncome.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No income records yet</p>
                  ) : (
                    data.recentIncome.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{item.description || item.incomeType}</span>
                        <span className="font-medium text-green-600">
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
                  {data.recentExpenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No expense records yet</p>
                  ) : (
                    data.recentExpenses.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{item.title}</span>
                        <span className="font-medium text-red-600">
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
    </div>
  );
}
