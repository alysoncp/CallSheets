import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { vehicles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { vehicleSchema } from "@/lib/validations/vehicle";

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

    const [newVehicle] = await db
      .insert(vehicles)
      .values({
        userId: user.id,
        ...validatedData,
      })
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
