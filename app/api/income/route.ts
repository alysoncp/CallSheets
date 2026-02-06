import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { income, paystubs } from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { incomeSchema } from "@/lib/validations/income";

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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const incomeType = searchParams.get("incomeType");

    const validIncomeTypes = ["union_production", "non_union_production", "royalty_residual", "cash"] as const;
    const conditions = [eq(income.userId, user.id)];
    if (startDate) conditions.push(gte(income.date, startDate));
    if (endDate) conditions.push(lte(income.date, endDate));
    if (incomeType && validIncomeTypes.includes(incomeType as typeof validIncomeTypes[number])) {
      conditions.push(eq(income.incomeType, incomeType as typeof validIncomeTypes[number]));
    }

    const results = await db
      .select()
      .from(income)
      .where(and(...conditions))
      .orderBy(desc(income.date));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in GET /api/income:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paystubId, ...incomeData } = body;
    const validatedData = incomeSchema.parse(incomeData);

    // Omit form-only fields not in DB (paystubIssuer, reimbursements, totalDeductions)
    const { paystubIssuer: _pi, reimbursements: _r, totalDeductions: _td, agentCommissionAmount: aca, ...rest } = validatedData as typeof validatedData & { paystubIssuer?: string; reimbursements?: number; totalDeductions?: number; agentCommissionAmount?: number };

    // Map form data to DB types (numeric columns expect string)
    const insertData = {
      userId: user.id,
      ...rest,
      amount: String(rest.amount),
      grossPay: rest.grossPay != null ? String(rest.grossPay) : null,
      gstHstCollected: String(rest.gstHstCollected ?? 0),
      cppContribution: String(rest.cppContribution ?? 0),
      eiContribution: String(rest.eiContribution ?? 0),
      incomeTaxDeduction: String(rest.incomeTaxDeduction ?? 0),
      dues: String(rest.dues ?? 0),
      retirement: String(rest.retirement ?? 0),
      pension: String(rest.pension ?? 0),
      insurance: String(rest.insurance ?? 0),
      agentCommissionAmount: aca != null ? String(aca) : null,
      paystubImageUrl: rest.paystubImageUrl && rest.paystubImageUrl !== "" ? rest.paystubImageUrl : null,
    };

    const [newIncome] = await db
      .insert(income)
      .values(insertData)
      .returning();

    // Link paystub to income if paystubId is provided
    if (paystubId && newIncome) {
      await db
        .update(paystubs)
        .set({ linkedIncomeId: newIncome.id })
        .where(eq(paystubs.id, paystubId));
    }

    return NextResponse.json(newIncome, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/income:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
