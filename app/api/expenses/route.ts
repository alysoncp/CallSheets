import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { expenses, receipts, vehicles } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { expenseSchema } from "@/lib/validations/expense";

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
      .select()
      .from(expenses)
      .where(eq(expenses.userId, user.id))
      .orderBy(desc(expenses.date));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in GET /api/expenses:", error instanceof Error ? error.message : String(error));
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
    const insertData = {
      userId: user.id,
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
    };

    const [newExpense] = await db
      .insert(expenses)
      .values(insertData)
      .returning();

    // Link receipt to expense if receiptImageUrl is provided
    if (validatedData.receiptImageUrl) {
      try {
        // Find receipt by imageUrl
        const receiptRecords = await db
          .select()
          .from(receipts)
          .where(eq(receipts.userId, user.id))
          .limit(100); // Get recent receipts to find match
        
        const matchingReceipt = receiptRecords.find(
          (r) => r.imageUrl === validatedData.receiptImageUrl
        );

        if (matchingReceipt && !matchingReceipt.linkedExpenseId) {
          // Link the receipt to this expense
          await db
            .update(receipts)
            .set({ linkedExpenseId: newExpense.id })
            .where(eq(receipts.id, matchingReceipt.id));
        }
      } catch (linkError) {
        // Non-critical error, log but don't fail
        console.error("Error linking receipt to expense:", linkError instanceof Error ? linkError.message : String(linkError));
      }
    }

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/expenses:", error instanceof Error ? error.message : String(error));
    
    // Check if it's a Zod validation error
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: "Validation error", details: (error as any).issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

