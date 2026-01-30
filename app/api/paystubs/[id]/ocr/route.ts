import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { paystubs, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user's subscription tier and OCR limits
    const [userProfile] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check OCR limits
    const ocrLimits: Record<string, number> = {
      basic: 10,
      personal: 100,
      corporate: Infinity,
    };

    const limit = ocrLimits[userProfile.subscriptionTier || "basic"];
    if (userProfile.ocrRequestsThisMonth && userProfile.ocrRequestsThisMonth >= limit) {
      return NextResponse.json(
        { error: "OCR request limit reached for this month" },
        { status: 429 }
      );
    }

    // Get paystub
    const [paystub] = await db
      .select()
      .from(paystubs)
      .where(and(eq(paystubs.id, id), eq(paystubs.userId, user.id)))
      .limit(1);

    if (!paystub) {
      return NextResponse.json({ error: "Paystub not found" }, { status: 404 });
    }

    // Update paystub status to processing
    await db
      .update(paystubs)
      .set({ ocrStatus: "processing" })
      .where(eq(paystubs.id, id));

    // TODO: Call Veryfi API here
    // const veryfiClient = new VeryfiClient();
    // const ocrResult = await veryfiClient.processPaystub(paystub.imageUrl);

    // For now, return a placeholder
    const ocrResult = {
      employer: "Example Employer",
      employee_name: "",
      gross_pay: 0,
      net_pay: 0,
      deductions: {
        cpp: 0,
        ei: 0,
        income_tax: 0,
      },
      pay_period: new Date().toISOString(),
    };

    // Update paystub with OCR result
    await db
      .update(paystubs)
      .set({
        ocrStatus: "completed",
        ocrResult: ocrResult as any,
        ocrProcessedAt: new Date(),
      })
      .where(eq(paystubs.id, id));

    // Increment OCR request count
    await db
      .update(users)
      .set({
        ocrRequestsThisMonth: (userProfile.ocrRequestsThisMonth || 0) + 1,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true, result: ocrResult });
  } catch (error) {
    console.error("Error in POST /api/paystubs/[id]/ocr:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
