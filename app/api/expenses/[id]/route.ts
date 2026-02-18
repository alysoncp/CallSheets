import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { expenses, vehicles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { expenseSchema } from "@/lib/validations/expense";

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
    const validatedData = expenseSchema.parse(body);
    const vehicleId =
      validatedData.vehicleId && validatedData.vehicleId !== ""
        ? validatedData.vehicleId
        : null;

    if (vehicleId) {
      const [ownedVehicle] = await db
        .select({ id: vehicles.id })
        .from(vehicles)
        .where(and(eq(vehicles.id, vehicleId), eq(vehicles.userId, user.id)))
        .limit(1);

      if (!ownedVehicle) {
        return NextResponse.json({ error: "Invalid vehicle" }, { status: 400 });
      }
    }

    // Map form data to DB types (numeric columns expect string)
    const updateData = {
      amount: String(validatedData.amount),
      date: validatedData.date,
      title: validatedData.title,
      category: validatedData.category,
      subcategory: validatedData.subcategory ?? null,
      vehicleId,
      description: validatedData.description ?? null,
      vendor: validatedData.vendor ?? null,
      receiptImageUrl: validatedData.receiptImageUrl && validatedData.receiptImageUrl !== "" ? validatedData.receiptImageUrl : null,
      isTaxDeductible: validatedData.isTaxDeductible,
      baseCost: validatedData.baseCost != null ? String(validatedData.baseCost) : null,
      gstAmount: String(validatedData.gstAmount ?? 0),
      pstAmount: String(validatedData.pstAmount ?? 0),
      expenseType: validatedData.expenseType,
      businessUsePercentage: validatedData.businessUsePercentage != null ? String(validatedData.businessUsePercentage) : null,
      updatedAt: new Date(),
    };

    const [updated] = await db
      .update(expenses)
      .set(updateData)
      .where(and(eq(expenses.id, id), eq(expenses.userId, user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error in PATCH /api/expenses/[id]:", error);
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

    await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/expenses/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
