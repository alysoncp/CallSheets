import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user exists in database
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    // Auto-create user if doesn't exist
    if (!existingUser) {
      const [newUser] = await db
        .insert(users)
        .values({
          id: authUser.id,
          email: authUser.email!,
          subscriptionTier: "basic",
          taxFilingStatus: "personal_only",
          province: "BC",
        })
        .returning();

      return NextResponse.json(newUser);
    }

    return NextResponse.json(existingUser);
  } catch (error) {
    console.error("Error in GET /api/auth/user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
