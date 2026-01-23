import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { paystubs } from "@/lib/db/schema";
import { eq, inArray, desc, and } from "drizzle-orm";
import PDFDocument from "pdfkit";

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
    const paystubIds = body.paystubIds as string[] | undefined;

    // Fetch paystubs
    let paystubRecords;
    if (paystubIds && paystubIds.length > 0) {
      paystubRecords = await db
        .select()
        .from(paystubs)
        .where(
          and(
            eq(paystubs.userId, user.id),
            inArray(paystubs.id, paystubIds)
          )
        )
        .orderBy(desc(paystubs.uploadedAt));
    } else {
      paystubRecords = await db
        .select()
        .from(paystubs)
        .where(eq(paystubs.userId, user.id))
        .orderBy(desc(paystubs.uploadedAt));
    }

    if (paystubRecords.length === 0) {
      return NextResponse.json(
        { error: "No paystubs found" },
        { status: 404 }
      );
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50, autoFirstPage: false });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    // Download and add each paystub image to PDF
    for (const paystub of paystubRecords) {
      try {
        // Fetch image from URL
        const imageResponse = await fetch(paystub.imageUrl);
        if (!imageResponse.ok) {
          console.error(`Failed to fetch image for paystub ${paystub.id}`);
          continue;
        }

        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

        // Add new page for each paystub
        doc.addPage();

        // Get image dimensions (approximate for PDF)
        const maxWidth = 500;
        const maxHeight = 700;

        // Add image to PDF
        doc.image(imageBuffer, {
          fit: [maxWidth, maxHeight],
          align: "center",
          valign: "center",
        });

        // Add paystub metadata
        doc.moveDown();
        doc.fontSize(10).text(`Paystub ID: ${paystub.id}`, { align: "center" });
        if (paystub.uploadedAt) {
          const date = new Date(paystub.uploadedAt);
          doc.text(`Uploaded: ${date.toLocaleDateString()}`, { align: "center" });
        }
        if (paystub.notes) {
          doc.text(`Notes: ${paystub.notes}`, { align: "center" });
        }
      } catch (error) {
        console.error(`Error processing paystub ${paystub.id}:`, error);
        // Continue with next paystub
      }
    }

    // Finalize PDF
    doc.end();

    // Wait for PDF to be generated
    await new Promise<void>((resolve) => {
      doc.on("end", resolve);
    });

    // Combine all chunks
    const pdfBuffer = Buffer.concat(chunks);

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="paystubs-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/paystubs/export-pdf:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
