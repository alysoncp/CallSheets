"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight, Receipt, Pencil } from "lucide-react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { ImageViewDialog } from "@/components/ui/image-view-dialog";
import { ExpenseEntryDialog } from "@/components/expenses/expense-entry-dialog";
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

interface ReceiptsPreviewProps {
  initialData: ReceiptRecord[];
  onDelete?: (id: string) => void;
}

export function ReceiptsPreview({ initialData, onDelete }: ReceiptsPreviewProps) {
  const [receipts, setReceipts] = useState(initialData);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [expenseEditDialogOpen, setExpenseEditDialogOpen] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    setReceipts(initialData);
  }, [initialData]);

  const previewReceipts = receipts.slice(0, 3);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this receipt?")) {
      return;
    }

    try {
      const response = await fetch(`/api/receipts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Optimistically update local state
        setReceipts(receipts.filter((r) => r.id !== id));
        // Call parent callback if provided
        if (onDelete) {
          onDelete(id);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error deleting receipt:", errorData.error || "Unknown error");
        alert("Failed to delete receipt. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting receipt:", error);
      alert("Failed to delete receipt. Please try again.");
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
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Receipts</CardTitle>
          <Link href="/receipts">
            <Button variant="outline" size="sm">
              View Full Gallery
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {previewReceipts.map((receipt) => (
            <div key={receipt.id} className="relative group">
              <div 
                className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer"
                onClick={() => {
                  setViewingImage(storageImageToProxyUrl(receipt.imageUrl) ?? receipt.imageUrl);
                }}
              >
                <Image
                  src={storageImageToProxyUrl(receipt.imageUrl) ?? receipt.imageUrl}
                  alt="Receipt"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    try {
                      const dateRaw = receipt.expenseDate ?? receipt.uploadedAt;
                      const dateValue = typeof dateRaw === "string" ? parseISO(dateRaw) : dateRaw;
                      return format(dateValue, "MMM dd, yyyy");
                    } catch (e) {
                      return receipt.expenseDate?.toString() ?? receipt.uploadedAt?.toString() ?? "Invalid date";
                    }
                  })()}
                </p>
                <div className="flex gap-2">
                  {receipt.linkedExpenseId && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditExpense(receipt.linkedExpenseId!)}
                        className="mt-1 h-8"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          window.location.href = "/expenses";
                        }}
                        className="mt-1 h-8"
                      >
                        <Receipt className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(receipt.id)}
                    className="mt-1 h-8"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {receipts.length > 3 && (
          <div className="mt-4 text-center">
            <Link href="/receipts">
              <Button variant="outline">
                View All {receipts.length} Receipts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
      {viewingImage && (
        <ImageViewDialog
          open={viewingImage !== null}
          onOpenChange={(open) => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'receipts-preview.tsx:186',message:'ImageViewDialog onOpenChange',data:{open,viewingImage,viewingImageIsNull:viewingImage===null,viewingImageIsEmpty:viewingImage===''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
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
          }
        }}
        initialData={editingExpense}
      />
    </Card>
  );
}
