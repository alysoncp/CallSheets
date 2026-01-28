"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, Receipt, Pencil } from "lucide-react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { ExpenseEntryDialog } from "@/components/expenses/expense-entry-dialog";
import { ImageViewDialog } from "@/components/ui/image-view-dialog";

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
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [expenseEditDialogOpen, setExpenseEditDialogOpen] = useState(false);

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

  const handleEditExpense = async (expenseId: string) => {
    try {
      // Fetch all expenses and find the one with matching ID
      const response = await fetch("/api/expenses", { cache: "no-store" });
      if (response.ok) {
        const expenses = await response.json();
        const expense = expenses.find((e: any) => e.id === expenseId);
        if (expense) {
          setEditingExpense(expense);
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
              onClick={() => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'receipts-grid.tsx:100',message:'Receipt image clicked',data:{receiptId:receipt.id,imageUrl:receipt.imageUrl,imageUrlLength:receipt.imageUrl?.length,imageUrlIsEmpty:receipt.imageUrl==='',imageUrlIsNull:receipt.imageUrl===null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                setViewingImage(receipt.imageUrl);
              }}
            >
              <Image
                src={receipt.imageUrl}
                alt="Receipt"
                fill
                className="object-cover"
                unoptimized
                onError={(e) => {
                  console.error("Error loading receipt image:", receipt.imageUrl);
                  e.currentTarget.src = "/placeholder-image.png";
                }}
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
              <div className="flex gap-2">
                {receipt.linkedExpenseId && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditExpense(receipt.linkedExpenseId!)}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Expense
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        window.location.href = "/expenses";
                      }}
                      className="flex-1"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(receipt.id)}
                  className={receipt.linkedExpenseId ? "flex-1" : "w-full"}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <ExpenseEntryDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
      />
      {viewingImage && (
        <ImageViewDialog
          open={viewingImage !== null}
          onOpenChange={(open) => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'receipts-grid.tsx:195',message:'ImageViewDialog onOpenChange',data:{open,viewingImage,viewingImageIsNull:viewingImage===null,viewingImageIsEmpty:viewingImage===''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            if (!open) setViewingImage(null);
          }}
          imageUrl={viewingImage}
          title="Receipt"
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
