import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { paystubs, income } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

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

    const results = await db
      .select({
        id: paystubs.id,
        userId: paystubs.userId,
        imageUrl: paystubs.imageUrl,
        uploadedAt: paystubs.uploadedAt,
        linkedIncomeId: paystubs.linkedIncomeId,
        notes: paystubs.notes,
        ocrStatus: paystubs.ocrStatus,
        ocrJobId: paystubs.ocrJobId,
        ocrResult: paystubs.ocrResult,
        ocrProcessedAt: paystubs.ocrProcessedAt,
        stubDate: income.date,
      })
      .from(paystubs)
      .leftJoin(income, eq(paystubs.linkedIncomeId, income.id))
      .where(eq(paystubs.userId, user.id))
      .orderBy(desc(income.date), desc(paystubs.uploadedAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in GET /api/paystubs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
