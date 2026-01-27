"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight, Receipt } from "lucide-react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import Link from "next/link";

interface ReceiptRecord {
  id: string;
  imageUrl: string;
  uploadedAt: string | Date;
  notes?: string | null;
  ocrStatus?: string | null;
  linkedExpenseId?: string | null;
  linkedIncomeId?: string | null;
}

interface ReceiptsPreviewProps {
  initialData: ReceiptRecord[];
  onDelete?: (id: string) => void;
}

export function ReceiptsPreview({ initialData, onDelete }: ReceiptsPreviewProps) {const [receipts, setReceipts] = useState(initialData);

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
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <Image
                  src={receipt.imageUrl}
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
                      const dateValue = typeof receipt.uploadedAt === "string" ? parseISO(receipt.uploadedAt) : receipt.uploadedAt;
                      return format(dateValue, "MMM dd, yyyy");
                    } catch (e) {
                      return receipt.uploadedAt?.toString() || 'Invalid date';
                    }
                  })()}
                </p>
                <div className="flex gap-2">
                  {receipt.linkedExpenseId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Navigate to expenses page - the expense will be visible there
                        window.location.href = "/expenses";
                      }}
                      className="mt-1 h-8"
                    >
                      <Receipt className="h-3 w-3 mr-1" />
                      View Expense
                    </Button>
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
    </Card>
  );
}
