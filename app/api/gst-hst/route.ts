import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { income, expenses, assets, leasePayments } from "@/lib/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
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

    // Calculate GST collected from income
    const [gstCollectedResult] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${income.gstHstCollected}::numeric), 0)`,
      })
      .from(income)
      .where(
        and(
          eq(income.userId, user.id),
          gte(income.date, startDate),
          lte(income.date, endDate)
        )
      );

    // Calculate IITC from expenses
    const [iitcExpensesResult] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${expenses.gstAmount}::numeric), 0)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, user.id),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      );

    // Calculate IITC from assets (based on purchase date)
    const [iitcAssetsResult] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${assets.purchaseGst}::numeric), 0)`,
      })
      .from(assets)
      .where(
        and(
          eq(assets.userId, user.id),
          gte(assets.purchaseDate, startDate),
          lte(assets.purchaseDate, endDate)
        )
      );

    // Calculate IITC from lease payments
    const [iitcLeasesResult] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${leasePayments.gstAmount}::numeric), 0)`,
      })
      .from(leasePayments)
      .where(
        and(
          eq(leasePayments.userId, user.id),
          gte(leasePayments.paymentDate, startDate),
          lte(leasePayments.paymentDate, endDate)
        )
      );

    const gstCollected = Number(gstCollectedResult?.total || 0);
    const iitcFromExpenses = Number(iitcExpensesResult?.total || 0);
    const iitcFromAssets = Number(iitcAssetsResult?.total || 0);
    const iitcFromLeases = Number(iitcLeasesResult?.total || 0);
    const totalIitc = iitcFromExpenses + iitcFromAssets + iitcFromLeases;
    const netGst = gstCollected - totalIitc;

    return NextResponse.json({
      gstCollected,
      iitcFromExpenses,
      iitcFromAssets,
      iitcFromLeases,
      totalIitc,
      netGst,
    });
  } catch (error) {
    console.error("Error in GET /api/gst-hst:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
