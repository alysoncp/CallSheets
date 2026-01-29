import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKETS = ["paystubs", "receipts"] as const;
const EXT_TO_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
};

function contentTypeForPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  return (ext && EXT_TO_TYPE[ext]) || "application/octet-stream";
}

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

    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get("bucket");
    const path = searchParams.get("path");

    if (!bucket || !path) {
      return NextResponse.json(
        { error: "Missing bucket or path" },
        { status: 400 }
      );
    }

    if (!BUCKETS.includes(bucket as (typeof BUCKETS)[number])) {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    // Path must be {userId}/{filename} and userId must match current user
    const pathParts = path.split("/");
    if (pathParts.length < 2 || pathParts[0] !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Not found" },
        { status: 404 }
      );
    }

    const contentType = contentTypeForPath(path);
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    console.error("Storage image proxy error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
