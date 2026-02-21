import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { receipts, expenses } from "@/lib/db/schema";
import { eq, desc, isNotNull, and } from "drizzle-orm";

export async function GET(_request: NextRequest) {
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
        id: receipts.id,
        userId: receipts.userId,
        imageUrl: receipts.imageUrl,
        uploadedAt: receipts.uploadedAt,
        linkedExpenseId: receipts.linkedExpenseId,
        linkedIncomeId: receipts.linkedIncomeId,
        notes: receipts.notes,
        ocrJobId: receipts.ocrJobId,
        ocrStatus: receipts.ocrStatus,
        ocrResult: receipts.ocrResult,
        ocrProcessedAt: receipts.ocrProcessedAt,
        expenseDate: expenses.date,
      })
      .from(receipts)
      .innerJoin(expenses, eq(receipts.linkedExpenseId, expenses.id))
      .where(
        and(
          eq(receipts.userId, user.id),
          isNotNull(receipts.linkedExpenseId)
        )
      )
      .orderBy(desc(expenses.date));

    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/receipts:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

