import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { receipts } from "@/lib/db/schema";
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
    const receiptIds = body.receiptIds as string[] | undefined;

    // Fetch receipts
    let receiptRecords;
    if (receiptIds && receiptIds.length > 0) {
      receiptRecords = await db
        .select()
        .from(receipts)
        .where(
          and(
            eq(receipts.userId, user.id),
            inArray(receipts.id, receiptIds)
          )
        )
        .orderBy(desc(receipts.uploadedAt));
    } else {
      receiptRecords = await db
        .select()
        .from(receipts)
        .where(eq(receipts.userId, user.id))
        .orderBy(desc(receipts.uploadedAt));
    }

    if (receiptRecords.length === 0) {
      return NextResponse.json(
        { error: "No receipts found" },
        { status: 404 }
      );
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50, autoFirstPage: false });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    // Download and add each receipt image to PDF
    for (const receipt of receiptRecords) {
      try {
        // Fetch image from URL
        const imageResponse = await fetch(receipt.imageUrl);
        if (!imageResponse.ok) {
          console.error(`Failed to fetch image for receipt ${receipt.id}`);
          continue;
        }

        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

        // Add new page for each receipt
        doc.addPage();

        // Get image dimensions (approximate for PDF)
        // For better results, you might want to use a library like sharp to get actual dimensions
        const maxWidth = 500;
        const maxHeight = 700;

        // Add image to PDF
        doc.image(imageBuffer, {
          fit: [maxWidth, maxHeight],
          align: "center",
          valign: "center",
        });

        // Add receipt metadata
        doc.moveDown();
        doc.fontSize(10).text(`Receipt ID: ${receipt.id}`, { align: "center" });
        if (receipt.uploadedAt) {
          const date = new Date(receipt.uploadedAt);
          doc.text(`Uploaded: ${date.toLocaleDateString()}`, { align: "center" });
        }
        if (receipt.notes) {
          doc.text(`Notes: ${receipt.notes}`, { align: "center" });
        }
      } catch (error) {
        console.error(`Error processing receipt ${receipt.id}:`, error);
        // Continue with next receipt
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
        "Content-Disposition": `attachment; filename="receipts-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/receipts/export-pdf:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
