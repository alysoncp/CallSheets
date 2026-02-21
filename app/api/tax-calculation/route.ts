import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { income, expenses, users } from "@/lib/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { calculateTax } from "@/lib/tax/calculator";
import { format, startOfYear, endOfYear } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const taxYear = parseInt(searchParams.get("taxYear") || new Date().getFullYear().toString());

    const startDate = format(startOfYear(new Date(taxYear, 0, 1)), "yyyy-MM-dd");
    const endDate = format(endOfYear(new Date(taxYear, 0, 1)), "yyyy-MM-dd");

    // Get user profile for province and filing status
    const [userProfile] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    // Calculate total income
    const [incomeResult] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${income.amount}::numeric), 0)`,
      })
      .from(income)
      .where(
        and(
          eq(income.userId, user.id),
          gte(income.date, startDate),
          lte(income.date, endDate)
        )
      );

    // Calculate total expenses
    const [expensesResult] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${expenses.amount}::numeric), 0)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, user.id),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      );

    // Calculate CCA deductions (simplified - would need proper CCA calculation)
    const ccaDeductions = 0; // TODO: Calculate from assets

    // Calculate lease expenses
    const leaseExpenses = 0; // TODO: Calculate from lease payments

    const grossIncome = Number(incomeResult?.total || 0);
    const totalExpenses = Number(expensesResult?.total || 0);

    const result = calculateTax({
      grossIncome,
      totalExpenses,
      ccaDeductions,
      leaseExpenses,
      province: userProfile?.province || "BC",
      isSelfEmployed: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/tax-calculation:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

