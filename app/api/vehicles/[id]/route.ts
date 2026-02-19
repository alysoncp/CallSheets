import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { vehicles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { vehicleSchema } from "@/lib/validations/vehicle";

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
    const validatedData = vehicleSchema.parse(body);

    // Map form data to DB types (numeric columns expect string, ccaClass expects "10" | "10.1")
    const validCcaClass = validatedData.ccaClass && (validatedData.ccaClass === "10" || validatedData.ccaClass === "10.1")
      ? (validatedData.ccaClass as "10" | "10.1")
      : null;
    const updateData = {
      name: validatedData.name,
      make: validatedData.make ?? null,
      model: validatedData.model ?? null,
      year: validatedData.year ?? null,
      licensePlate: validatedData.licensePlate ?? null,
      isPrimary: validatedData.isPrimary,
      usedExclusivelyForBusiness: validatedData.usedExclusivelyForBusiness,
      claimsCca: validatedData.claimsCca,
      ccaClass: validCcaClass,
      currentMileage: validatedData.currentMileage ?? null,
      mileageAtBeginningOfYear: validatedData.mileageAtBeginningOfYear ?? null,
      totalAnnualMileage: validatedData.totalAnnualMileage ?? null,
      estimatedYearlyMileage: validatedData.estimatedYearlyMileage ?? null,
      mileageEstimate: validatedData.mileageEstimate,
      purchasedThisYear: validatedData.purchasedThisYear,
      purchasePrice: validatedData.purchasePrice != null ? String(validatedData.purchasePrice) : null,
      updatedAt: new Date(),
    };

    const [updated] = await db
      .update(vehicles)
      .set(updateData)
      .where(and(eq(vehicles.id, id), eq(vehicles.userId, user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error in PATCH /api/vehicles/[id]:", error instanceof Error ? error.message : String(error));
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
      .delete(vehicles)
      .where(and(eq(vehicles.id, id), eq(vehicles.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/vehicles/[id]:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

