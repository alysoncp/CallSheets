"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2, Eye } from "lucide-react";
import { ExpenseEntryDialog } from "@/components/expenses/expense-entry-dialog";
import { ImageViewDialog } from "@/components/ui/image-view-dialog";

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

export function ExpenseList({ initialData, receiptRecords = [], onEdit }: ExpenseListProps) {const [expenseRecords, setExpenseRecords] = useState(initialData);
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
    const imageUrl = getReceiptImageUrl(expense);
    if (imageUrl) {
      setViewingImageUrl(imageUrl);
      setImageDialogOpen(true);
    }
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
              {expenseRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{record.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {(() => {
                            try {
                              const dateValue = typeof record.date === 'string' ? parseISO(record.date) : new Date(record.date);
                              return format(dateValue, "MMM dd, yyyy");
                            } catch (e) {
                              return record.date?.toString() || 'Invalid date';
                            }
                          })()} •{" "}
                          {record.category.replace(/_/g, " ")} •{" "}
                          {record.expenseType.replace(/_/g, " ")}
                          {record.vendor && ` • ${record.vendor}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-red-600">
                      ${Number(record.amount).toLocaleString("en-CA", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <div className="flex gap-2">
                      {getReceiptImageUrl(record) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewReceipt(record)}
                          title="View Receipt"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(record)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(record.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
