import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { income } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { incomeSchema } from "@/lib/validations/income";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = incomeSchema.parse(body);

    const { paystubIssuer: _pi, reimbursements: _r, totalDeductions: _td, agentCommissionAmount: aca, ...rest } = validatedData as typeof validatedData & { paystubIssuer?: string; reimbursements?: number; totalDeductions?: number; agentCommissionAmount?: number };

    // Map form data to DB types (numeric columns expect string)
    const updateData = {
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
      updatedAt: new Date(),
    };

    const [updated] = await db
      .update(income)
      .set(updateData)
      .where(and(eq(income.id, id), eq(income.userId, user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error in PATCH /api/income/[id]:", error);
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db
      .delete(income)
      .where(and(eq(income.id, id), eq(income.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/income/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
