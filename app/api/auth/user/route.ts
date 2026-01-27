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
      // Get subscription tier from user metadata (set during signup)
      const subscriptionTier = (authUser.user_metadata?.subscriptionTier as "basic" | "personal" | "corporate") || "personal";
      
      // Determine tax filing status based on subscription tier
      const taxFilingStatus = subscriptionTier === "corporate" ? "personal_and_corporate" : "personal_only";
      
      const [newUser] = await db
        .insert(users)
        .values({
          id: authUser.id,
          email: authUser.email!,
          subscriptionTier: subscriptionTier,
          taxFilingStatus: taxFilingStatus,
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
