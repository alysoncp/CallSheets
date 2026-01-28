import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { income, expenses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";

async function getDashboardData(userId: string) {
  // Fetch all income and expense records (client will filter by year)
  const allIncome = await db
    .select()
    .from(income)
    .where(eq(income.userId, userId));

  const allExpenses = await db
    .select()
    .from(expenses)
    .where(eq(expenses.userId, userId));

  // Calculate totals across all years (client will recalculate for selected year)
  const totalIncome = allIncome.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const totalExpenses = allExpenses.reduce((sum, record) => sum + Number(record.amount || 0), 0);

  return {
    totalIncome,
    totalExpenses,
    monthlyIncome: allIncome,
    monthlyExpenses: allExpenses,
    yearlyIncome: allIncome,
    yearlyExpenses: allExpenses,
    recentIncome: allIncome.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10),
    recentExpenses: allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10),
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

  return <DashboardPageClient allData={data} />;
}
