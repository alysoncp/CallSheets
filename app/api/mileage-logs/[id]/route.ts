import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { vehicleMileageLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { mileageLogSchema } from "@/lib/validations/mileage-log";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = mileageLogSchema.parse(body);

    const updateData = {
      vehicleId: validatedData.vehicleId,
      date: validatedData.date,
      odometerReading: validatedData.odometerReading ?? null,
      tripDistance: validatedData.tripDistance ?? null,
      description: validatedData.description ?? null,
      isBusinessUse: validatedData.isBusinessUse,
      updatedAt: new Date(),
    };

    const [updated] = await db
      .update(vehicleMileageLogs)
      .set(updateData)
      .where(and(eq(vehicleMileageLogs.id, id), eq(vehicleMileageLogs.userId, user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error in PATCH /api/mileage-logs/[id]:", error);
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
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await db
      .delete(vehicleMileageLogs)
      .where(and(eq(vehicleMileageLogs.id, id), eq(vehicleMileageLogs.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/mileage-logs/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
