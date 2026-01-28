import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { income, paystubs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
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

    let query = db.select().from(income).where(eq(income.userId, user.id));

    if (startDate) {
      query = query.where(eq(income.date, startDate));
    }

    const results = await query.orderBy(desc(income.date));

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

    const [newIncome] = await db
      .insert(income)
      .values({
        userId: user.id,
        ...validatedData,
      })
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
