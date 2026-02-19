import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { userProfileSchema } from "@/lib/validations/user";

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

    const [userProfile] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userProfile) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error in GET /api/user/profile:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    // Transform null values to undefined for optional fields
    const cleanedBody = Object.fromEntries(
      Object.entries(body).map(([key, value]) => [key, value === null ? undefined : value])
    );

    const validatedData = userProfileSchema.parse(cleanedBody);

    // Map form data to DB types (numeric columns expect string). Round commission % to 2 decimals.
    const agentCommissionRounded =
      validatedData.agentCommission != null
        ? Math.round(validatedData.agentCommission * 100) / 100
        : null;
    const updateData = {
      ...validatedData,
      agentCommission: agentCommissionRounded != null ? String(agentCommissionRounded) : null,
      homeOfficePercentage: validatedData.homeOfficePercentage != null ? String(validatedData.homeOfficePercentage) : null,
      profileImageUrl: validatedData.profileImageUrl && validatedData.profileImageUrl !== "" ? validatedData.profileImageUrl : null,
      updatedAt: new Date(),
    };

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error in PATCH /api/user/profile:", error instanceof Error ? error.message : String(error));

    // Check for Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
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

