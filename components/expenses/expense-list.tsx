"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2, Eye, FileText } from "lucide-react";
import { ExpenseEntryDialog } from "@/components/expenses/expense-entry-dialog";
import { ImageViewDialog } from "@/components/ui/image-view-dialog";
import { storageImageToProxyUrl, isPdfUrl } from "@/lib/utils/storage-image-url";
import Image from "next/image";

interface ExpenseRecord {
  id: string;
  amount: string | number;
  date: string;
  title: string;
  category: string;
  expenseType: string;
  description?: string | null;
  vendor?: string | null;
  receiptImageUrl?: string | null;
}

interface ReceiptRecord {
  id: string;
  imageUrl: string;
  linkedExpenseId?: string | null;
}

interface ExpenseListProps {
  initialData: ExpenseRecord[];
  receiptRecords?: ReceiptRecord[];
  onEdit?: (expense: ExpenseRecord) => void;
}

export function ExpenseList({ initialData, receiptRecords = [], onEdit }: ExpenseListProps) {
  const [expenseRecords, setExpenseRecords] = useState(initialData);

  // Sync with parent when initialData changes (e.g. tax year filter)
  useEffect(() => {
    setExpenseRecords(initialData);
  }, [initialData]);

  const [loading, setLoading] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense record?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setExpenseRecords(expenseRecords.filter((item) => item.id !== id));
        // Dispatch event to update sidebar year list
        window.dispatchEvent(new Event("expenseUpdated"));
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense: ExpenseRecord) => {
    setEditingExpense(expense);
    setDialogOpen(true);
    if (onEdit) {
      onEdit(expense);
    }
  };

  const handleAddClick = () => {
    setEditingExpense(null);
    setDialogOpen(true);
  };

  const getReceiptImageUrl = (expense: ExpenseRecord): string | null => {
    // Check if expense has direct receiptImageUrl
    if (expense.receiptImageUrl) {
      return expense.receiptImageUrl;
    }
    // Check if any receipt is linked to this expense
    const linkedReceipt = receiptRecords.find(
      (receipt) => receipt.linkedExpenseId === expense.id
    );
    return linkedReceipt?.imageUrl || null;
  };

  const handleViewReceipt = (expense: ExpenseRecord) => {
    const raw = getReceiptImageUrl(expense);
    if (!raw) return;
    const displayUrl = storageImageToProxyUrl(raw) ?? raw;
    setViewingImageUrl(displayUrl);
    setImageDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
        </CardHeader>
        <CardContent>
          {expenseRecords.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground mb-4">No expense records yet.</p>
              <Button onClick={handleAddClick}>
                Add Your First Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {expenseRecords.map((record) => {
                const receiptRawUrl = getReceiptImageUrl(record);
                const receiptDisplayUrl = receiptRawUrl
                  ? (storageImageToProxyUrl(receiptRawUrl) ?? receiptRawUrl)
                  : null;

                return (
                  <div
                    key={record.id}
                    className="flex items-start gap-3 border-b pb-4 last:border-0 sm:items-center sm:gap-4"
                  >
                    {receiptDisplayUrl && (
                      <div
                        className="relative h-16 w-16 bg-muted rounded overflow-hidden flex-shrink-0 cursor-pointer flex flex-col items-center justify-center text-muted-foreground"
                        onClick={() => handleViewReceipt(record)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && handleViewReceipt(record)}
                      >
                        {isPdfUrl(receiptRawUrl) ? (
                          <>
                            <FileText className="h-6 w-6" />
                            <span className="text-[10px] font-medium">PDF</span>
                          </>
                        ) : (
                          <Image
                            src={receiptDisplayUrl}
                            alt="Receipt thumbnail"
                            fill
                            className="object-cover pointer-events-none"
                            unoptimized
                            onError={(e) => {
                              console.error("Error loading receipt thumbnail:", receiptDisplayUrl);
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{record.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {(() => {
                              try {
                                const dateValue = typeof record.date === "string" ? parseISO(record.date) : new Date(record.date);
                                return `${format(dateValue, "MMM dd, yyyy")} - ${record.category.replace(/_/g, " ")}`;
                              } catch (e) {
                                return record.date?.toString() || "Invalid date";
                              }
                            })()}
                          </p>
                        </div>

                        <span className="text-lg font-semibold text-red-600 sm:whitespace-nowrap">
                          ${Number(record.amount).toLocaleString("en-CA", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>

                        <div className="flex items-center gap-1 sm:gap-2">
                          {receiptDisplayUrl && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewReceipt(record)}
                                title="View Receipt"
                                className="h-8 px-2 sm:hidden"
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewReceipt(record)}
                                title="View Receipt"
                                className="hidden sm:inline-flex"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(record)}
                            className="h-8 px-2 sm:hidden"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(record)}
                            className="hidden sm:inline-flex"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                            disabled={loading}
                            className="h-8 px-2 sm:hidden"
                          >
                            Delete
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(record.id)}
                            disabled={loading}
                            className="hidden sm:inline-flex"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <ExpenseEntryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingExpense(null);
          }
        }}
        initialData={editingExpense || undefined}
      />
      {viewingImageUrl && (
        <ImageViewDialog
          open={imageDialogOpen}
          onOpenChange={setImageDialogOpen}
          imageUrl={viewingImageUrl}
          title="View Receipt"
        />
      )}
    </>
  );
}
