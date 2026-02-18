import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { vehicleMileageLogs, vehicles } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { mileageLogSchema } from "@/lib/validations/mileage-log";

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
      .from(vehicleMileageLogs)
      .where(eq(vehicleMileageLogs.userId, user.id))
      .orderBy(desc(vehicleMileageLogs.date));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in GET /api/mileage-logs:", error);
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
    const validatedData = mileageLogSchema.parse(body);
    const [ownedVehicle] = await db
      .select({ id: vehicles.id })
      .from(vehicles)
      .where(and(eq(vehicles.id, validatedData.vehicleId), eq(vehicles.userId, user.id)))
      .limit(1);

    if (!ownedVehicle) {
      return NextResponse.json({ error: "Invalid vehicle" }, { status: 400 });
    }

    const insertData = {
      userId: user.id,
      vehicleId: validatedData.vehicleId,
      date: validatedData.date,
      odometerReading: validatedData.odometerReading ?? null,
      tripDistance: validatedData.tripDistance ?? null,
      description: validatedData.description ?? null,
      isBusinessUse: validatedData.isBusinessUse,
    };

    const [newLog] = await db
      .insert(vehicleMileageLogs)
      .values(insertData)
      .returning();

    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/mileage-logs:", error);
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
