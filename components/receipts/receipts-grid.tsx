"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { ExpenseEntryDialog } from "@/components/expenses/expense-entry-dialog";
import { DocumentImageViewDialog } from "@/components/ui/document-image-view-dialog";
import { storageImageToProxyUrl } from "@/lib/utils/storage-image-url";

interface ReceiptRecord {
  id: string;
  imageUrl: string;
  uploadedAt: string | Date;
  notes?: string | null;
  ocrStatus?: string | null;
  linkedExpenseId?: string | null;
  linkedIncomeId?: string | null;
  expenseDate?: string | null;
}

interface ReceiptsGridProps {
  initialData: ReceiptRecord[];
  onReceiptsUpdated?: () => void;
}

export function ReceiptsGrid({ initialData, onReceiptsUpdated }: ReceiptsGridProps) {
  const [receipts, setReceipts] = useState(initialData);

  // Sync with parent when initialData changes (e.g. after adding a new receipt)
  useEffect(() => {
    setReceipts(initialData);
  }, [initialData]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<ReceiptRecord | null>(null);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [expenseEditDialogOpen, setExpenseEditDialogOpen] = useState(false);

  const handleDelete = async (id: string, deleteEntry: boolean) => {
    const url = deleteEntry
      ? `/api/receipts/${id}?deleteEntry=true`
      : `/api/receipts/${id}`;
    const response = await fetch(url, { method: "DELETE" });
    if (response.ok) {
      setReceipts((prev) => prev.filter((r) => r.id !== id));
      if (onReceiptsUpdated) onReceiptsUpdated();
    } else {
      console.error("Error deleting receipt");
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open && onReceiptsUpdated) {
      fetch("/api/receipts", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => setReceipts(data))
        .catch(console.error);
    }
  };

  const handleEditExpense = async (expenseId: string) => {
    try {
      const response = await fetch("/api/expenses", { cache: "no-store" });
      if (response.ok) {
        const expensesList = await response.json();
        const entry = expensesList.find((e: any) => e.id === expenseId);
        if (entry) {
          setEditingExpense(entry);
          setViewingReceipt(null);
          setExpenseEditDialogOpen(true);
        } else {
          alert("Expense not found");
        }
      }
    } catch (error) {
      console.error("Error fetching expense:", error);
      alert("Failed to load expense for editing");
    }
  };

  const displayDate = (receipt: ReceiptRecord) => {
    if (receipt.expenseDate) {
      return format(
        typeof receipt.expenseDate === "string"
          ? parseISO(receipt.expenseDate)
          : (receipt.expenseDate as Date),
        "MMM dd, yyyy"
      );
    }
    return format(
      typeof receipt.uploadedAt === "string"
        ? parseISO(receipt.uploadedAt)
        : receipt.uploadedAt,
      "MMM dd, yyyy"
    );
  };

  if (receipts.length === 0) {
    return (
      <>
        <Card>
          <CardContent className="py-20 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No receipts uploaded yet.</p>
            <Button onClick={() => setDialogOpen(true)}>
              Add Your First Expense
            </Button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {receipts.map((receipt) => (
          <Card key={receipt.id} className="overflow-hidden">
            <div
              className="relative aspect-video bg-muted cursor-pointer"
              onClick={() => setViewingReceipt(receipt)}
            >
              <Image
                src={storageImageToProxyUrl(receipt.imageUrl) ?? receipt.imageUrl}
                alt="Receipt"
                fill
                className="object-cover"
                unoptimized
                onError={(e) => {
                  console.error("Error loading receipt image:", receipt.imageUrl);
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">
                {displayDate(receipt)}
              </p>
              {receipt.ocrStatus && (
                <p className="text-xs text-muted-foreground mb-2">
                  OCR: {receipt.ocrStatus}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <ExpenseEntryDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
      />
      {viewingReceipt && (
        <DocumentImageViewDialog
          open={!!viewingReceipt}
          onOpenChange={(open) => {
            if (!open) setViewingReceipt(null);
          }}
          imageUrl={
            storageImageToProxyUrl(viewingReceipt.imageUrl) ??
            viewingReceipt.imageUrl
          }
          title="Receipt"
          documentType="receipt"
          documentId={viewingReceipt.id}
          viewHref="/expenses"
          hasLinkedEntry={!!viewingReceipt.linkedExpenseId}
          onEdit={() => {
            if (viewingReceipt.linkedExpenseId) {
              handleEditExpense(viewingReceipt.linkedExpenseId);
            }
          }}
          onDelete={handleDelete}
        />
      )}
      <ExpenseEntryDialog
        open={expenseEditDialogOpen}
        onOpenChange={(open) => {
          setExpenseEditDialogOpen(open);
          if (!open) {
            setEditingExpense(null);
            if (onReceiptsUpdated) {
              onReceiptsUpdated();
            }
          }
        }}
        initialData={editingExpense}
      />
    </>
  );
}
