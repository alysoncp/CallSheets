import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DISCLAIMER_VERSION } from "@/lib/constants";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Always read disclaimer from database (users table) - never from user_metadata.
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    // One-time sync for production safety:
    // If signup metadata already has disclaimer acceptance but DB row is missing/stale,
    // persist it so users are not asked to accept a second time.
    const metadataAcceptedAt = authUser.user_metadata?.disclaimer_accepted_at;
    const metadataVersion = authUser.user_metadata?.disclaimer_version;
    const canSyncFromMetadata =
      typeof metadataAcceptedAt === "string" &&
      metadataAcceptedAt.length > 0 &&
      metadataVersion === DISCLAIMER_VERSION;

    if (canSyncFromMetadata) {
      const acceptedAt = new Date(metadataAcceptedAt);
      if (!Number.isNaN(acceptedAt.getTime())) {
        const needsSync =
          !existingUser ||
          existingUser.disclaimerAcceptedAt == null ||
          existingUser.disclaimerVersion !== DISCLAIMER_VERSION;

        if (needsSync) {
          const subscriptionTier =
            (authUser.user_metadata?.subscriptionTier as "basic" | "personal" | "corporate") ||
            "personal";
          const taxFilingStatus =
            subscriptionTier === "corporate" ? "personal_and_corporate" : "personal_only";

          await db
            .insert(users)
            .values({
              id: authUser.id,
              email: authUser.email!,
              subscriptionTier,
              taxFilingStatus,
              province: "BC",
              disclaimerVersion: DISCLAIMER_VERSION,
              disclaimerAcceptedAt: acceptedAt,
            })
            .onConflictDoUpdate({
              target: users.id,
              set: {
                disclaimerVersion: DISCLAIMER_VERSION,
                disclaimerAcceptedAt: acceptedAt,
                updatedAt: new Date(),
              },
            });

          const [syncedUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, authUser.id))
            .limit(1);

          if (syncedUser) {
            return NextResponse.json(syncedUser);
          }
        }
      }
    }

    if (existingUser) {
      return NextResponse.json(existingUser);
    }

    // No users row: trigger may not have run yet, or edge case.
    // Return minimal user with disclaimer NOT accepted - do NOT trust metadata.
    // User will see disclaimer, accept, and PATCH will create the row.
    return NextResponse.json({
      id: authUser.id,
      email: authUser.email ?? "",
      disclaimerAcceptedAt: null,
      disclaimerVersion: null,
    });
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
    const subscriptionTier = (authUser.user_metadata?.subscriptionTier as "basic" | "personal" | "corporate") || "personal";
    const taxFilingStatus = subscriptionTier === "corporate" ? "personal_and_corporate" : "personal_only";

    // Upsert: update if user exists (from trigger), insert if not.
    // Avoid .returning() — serverless + pooled connections can fail on RETURNING with onConflictDoUpdate.
    await db
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
      .onConflictDoUpdate({
        target: users.id,
        set: {
          disclaimerAcceptedAt: now,
          disclaimerVersion: DISCLAIMER_VERSION,
          updatedAt: now,
        },
      });

    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error in PATCH /api/auth/user:", error);
    console.error("PATCH error details:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
