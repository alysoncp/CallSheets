"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { ExpenseEntryDialog } from "@/components/expenses/expense-entry-dialog";
import { DialogTrigger } from "@/components/ui/dialog";

interface ReceiptRecord {
  id: string;
  imageUrl: string;
  uploadedAt: string | Date;
  notes?: string | null;
  ocrStatus?: string | null;
  linkedExpenseId?: string | null;
  linkedIncomeId?: string | null;
}

interface ReceiptsGridProps {
  initialData: ReceiptRecord[];
  onReceiptsUpdated?: () => void;
}

export function ReceiptsGrid({ initialData, onReceiptsUpdated }: ReceiptsGridProps) {
  const [receipts, setReceipts] = useState(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this receipt?")) {
      return;
    }

    try {
      const response = await fetch(`/api/receipts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReceipts(receipts.filter((r) => r.id !== id));
        if (onReceiptsUpdated) {
          onReceiptsUpdated();
        }
      }
    } catch (error) {
      console.error("Error deleting receipt:", error);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open && onReceiptsUpdated) {
      // Refresh receipts when dialog closes
      fetch("/api/receipts", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => setReceipts(data))
        .catch(console.error);
    }
  };

  if (receipts.length === 0) {
    return (
      <>
        <Card>
          <CardContent className="py-20 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No receipts uploaded yet.</p>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)}>
                Upload Your First Receipt
              </Button>
            </DialogTrigger>
          </CardContent>
        </Card>
        <ExpenseEntryDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-4">
        <DialogTrigger asChild>
          <Button onClick={() => setDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Receipt
          </Button>
        </DialogTrigger>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {receipts.map((receipt) => (
          <Card key={receipt.id} className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              <Image
                src={receipt.imageUrl}
                alt="Receipt"
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">
                {format(
                  typeof receipt.uploadedAt === "string"
                    ? parseISO(receipt.uploadedAt)
                    : receipt.uploadedAt,
                  "MMM dd, yyyy"
                )}
              </p>
              {receipt.ocrStatus && (
                <p className="text-xs text-muted-foreground mb-2">
                  OCR: {receipt.ocrStatus}
                </p>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(receipt.id)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <ExpenseEntryDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
      />
    </>
  );
}
