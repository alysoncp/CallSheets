import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DISCLAIMER_VERSION } from "@/lib/constants";

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

      // Disclaimer acceptance from signup (stored in auth user_metadata)
      const disclaimerVersion = (authUser.user_metadata?.disclaimer_version as string) ?? null;
      const disclaimerAcceptedAt = (authUser.user_metadata?.disclaimer_accepted_at as string) ?? null;
      
      const [newUser] = await db
        .insert(users)
        .values({
          id: authUser.id,
          email: authUser.email!,
          subscriptionTier: subscriptionTier,
          taxFilingStatus: taxFilingStatus,
          province: "BC",
          disclaimerVersion: disclaimerVersion,
          disclaimerAcceptedAt: disclaimerAcceptedAt ? new Date(disclaimerAcceptedAt) : null,
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

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    if (body.acceptDisclaimer !== true) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const now = new Date();
    const [updated] = await db
      .update(users)
      .set({
        disclaimerAcceptedAt: now,
        disclaimerVersion: DISCLAIMER_VERSION,
        updatedAt: now,
      })
      .where(eq(users.id, authUser.id))
      .returning();

    if (updated) {
      return NextResponse.json(updated);
    }

    // User row may not exist yet (e.g. first load returned 401). Create it with disclaimer accepted.
    const subscriptionTier = (authUser.user_metadata?.subscriptionTier as "basic" | "personal" | "corporate") || "personal";
    const taxFilingStatus = subscriptionTier === "corporate" ? "personal_and_corporate" : "personal_only";
    const [inserted] = await db
      .insert(users)
      .values({
        id: authUser.id,
        email: authUser.email!,
        subscriptionTier,
        taxFilingStatus,
        province: "BC",
        disclaimerVersion: DISCLAIMER_VERSION,
        disclaimerAcceptedAt: now,
        updatedAt: now,
      })
      .returning();

    if (!inserted) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    return NextResponse.json(inserted);
  } catch (error) {
    console.error("Error in PATCH /api/auth/user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
