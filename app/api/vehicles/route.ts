import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { vehicles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { vehicleSchema } from "@/lib/validations/vehicle";

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
      .from(vehicles)
      .where(eq(vehicles.userId, user.id))
      .orderBy(desc(vehicles.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in GET /api/vehicles:", error);
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
    const validatedData = vehicleSchema.parse(body);

    // Map form data to DB types (numeric columns expect string, ccaClass expects "10" | "10.1")
    const validCcaClass = validatedData.ccaClass && (validatedData.ccaClass === "10" || validatedData.ccaClass === "10.1")
      ? (validatedData.ccaClass as "10" | "10.1")
      : null;
    const insertData = {
      userId: user.id,
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
    };

    const [newVehicle] = await db
      .insert(vehicles)
      .values(insertData)
      .returning();

    return NextResponse.json(newVehicle, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/vehicles:", error);
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
