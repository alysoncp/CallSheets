"use client";

import { useState } from "react";
import { ExpenseList } from "@/components/expenses/expense-list";
import { ExpenseEntryDialog } from "@/components/expenses/expense-entry-dialog";
import { ReceiptsPreview } from "@/components/receipts/receipts-preview";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ExpensesPageClientProps {
  expenseRecords: any[];
  receiptRecords: any[];
}

export function ExpensesPageClient({
  expenseRecords,
  receiptRecords,
}: ExpensesPageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [receipts, setReceipts] = useState(receiptRecords);

  const refreshReceipts = async () => {
    const response = await fetch("/api/receipts", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setReceipts(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>
      <ReceiptsPreview initialData={receipts} onDelete={refreshReceipts} />
      <ExpenseList
        initialData={expenseRecords}
        receiptRecords={receipts}
        onEdit={(expense) => {
          setEditingExpense(expense);
          setDialogOpen(true);
        }}
      />
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
    </div>
  );
}
