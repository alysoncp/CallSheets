import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DISCLAIMER_VERSION } from "@/lib/constants";

/** Build default user row values from auth user (for create). */
function buildUserFromAuth(
  authUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
  disclaimerOverrides?: { disclaimerAcceptedAt: Date; disclaimerVersion: string }
) {
  const subscriptionTier = (authUser.user_metadata?.subscriptionTier as "basic" | "personal" | "corporate") || "personal";
  const taxFilingStatus = subscriptionTier === "corporate" ? "personal_and_corporate" : "personal_only";
  const disclaimerVersion = disclaimerOverrides?.disclaimerVersion ?? (authUser.user_metadata?.disclaimer_version as string) ?? null;
  const metaAccepted = authUser.user_metadata?.disclaimer_accepted_at as string | undefined;
  const disclaimerAcceptedAt = disclaimerOverrides
    ? disclaimerOverrides.disclaimerAcceptedAt
    : metaAccepted
      ? new Date(metaAccepted)
      : null;
  return {
    id: authUser.id,
    email: authUser.email ?? "",
    subscriptionTier,
    taxFilingStatus,
    province: "BC",
    disclaimerVersion,
    disclaimerAcceptedAt,
  };
}

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

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(existingUser);
    }

    // Auto-create user if doesn't exist (from signup metadata, including disclaimer)
    const values = buildUserFromAuth(authUser);
    try {
      const [newUser] = await db.insert(users).values(values).returning();
      return NextResponse.json(newUser);
    } catch (insertError) {
      // Race: another request may have created the user; fetch and return
      const [raceUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
      if (raceUser) return NextResponse.json(raceUser);
      throw insertError;
    }
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

    // User row may not exist yet (e.g. GET failed before creating). Create with disclaimer accepted.
    const values = buildUserFromAuth(authUser, {
      disclaimerAcceptedAt: now,
      disclaimerVersion: DISCLAIMER_VERSION,
    });
    try {
      const [created] = await db.insert(users).values(values).returning();
      if (created) return NextResponse.json(created);
    } catch {
      // Race: user may have been created by another request; try update again
    }
    const [retryUpdated] = await db
      .update(users)
      .set({
        disclaimerAcceptedAt: now,
        disclaimerVersion: DISCLAIMER_VERSION,
        updatedAt: now,
      })
      .where(eq(users.id, authUser.id))
      .returning();
    if (retryUpdated) return NextResponse.json(retryUpdated);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  } catch (error) {
    console.error("Error in PATCH /api/auth/user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
