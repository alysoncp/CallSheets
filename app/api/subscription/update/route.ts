import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { SubscriptionTier } from "@/lib/utils/subscription";

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
    const { subscriptionTier } = body;

    // Validate subscription tier
    if (!subscriptionTier || !["basic", "personal", "corporate"].includes(subscriptionTier)) {
      return NextResponse.json(
        { error: "Invalid subscription tier" },
        { status: 400 }
      );
    }

    // During beta, allow upgrading to personal for free
    // Block downgrades and corporate (coming soon)
    const [userProfile] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentTier = userProfile.subscriptionTier || "basic";
    
    // Beta rules: Allow upgrade to personal, block downgrades and corporate
    if (subscriptionTier === "corporate") {
      return NextResponse.json(
        { error: "Corporate plan coming soon" },
        { status: 400 }
      );
    }

    if (subscriptionTier === "basic" && currentTier !== "basic") {
      return NextResponse.json(
        { error: "Cannot downgrade during beta" },
        { status: 400 }
      );
    }

    // Update subscription tier
    const [updated] = await db
      .update(users)
      .set({
        subscriptionTier: subscriptionTier as SubscriptionTier,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error in POST /api/subscription/update:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

