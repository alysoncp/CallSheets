import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { paystubs } from "@/lib/db/schema";

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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const notes = formData.get("notes") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `paystubs/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("paystubs")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("paystubs").getPublicUrl(filePath);

    // Create paystub record
    const [newPaystub] = await db
      .insert(paystubs)
      .values({
        userId: user.id,
        imageUrl: publicUrl,
        notes: notes || null,
        ocrStatus: "pending",
      })
      .returning();

    return NextResponse.json(newPaystub, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/paystubs/upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
