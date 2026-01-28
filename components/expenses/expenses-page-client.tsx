"use client";

import { useState, useMemo, useEffect } from "react";
import { ExpenseList } from "@/components/expenses/expense-list";
import { ExpenseEntryDialog } from "@/components/expenses/expense-entry-dialog";
import { ReceiptsPreview } from "@/components/receipts/receipts-preview";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTaxYear } from "@/lib/contexts/tax-year-context";

interface ExpensesPageClientProps {
  expenseRecords: any[];
  receiptRecords: any[];
}

export function ExpensesPageClient({
  expenseRecords,
  receiptRecords,
}: ExpensesPageClientProps) {
  const { taxYear } = useTaxYear();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [receipts, setReceipts] = useState(receiptRecords);
  const [expenseList, setExpenseList] = useState(expenseRecords);

  const refreshReceipts = async () => {
    const response = await fetch("/api/receipts", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setReceipts(data);
    }
  };

  const refreshExpenses = async () => {
    const response = await fetch("/api/expenses", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setExpenseList(data);
      // Dispatch event to update sidebar year list
      window.dispatchEvent(new Event('expenseUpdated'));
    }
  };

  // Filter expense records by selected year from context
  const filteredExpenseList = useMemo(() => {
    return expenseList.filter((record) => {
      try {
        const recordDate = typeof record.date === 'string' 
          ? new Date(record.date) 
          : new Date(record.date);
        return recordDate.getFullYear() === taxYear;
      } catch {
        return false;
      }
    });
  }, [expenseList, taxYear]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>
      <ReceiptsPreview initialData={receipts} onDelete={(id) => { refreshReceipts(); }} />
      <ExpenseList
        initialData={filteredExpenseList}
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
            refreshExpenses(); // Refresh expense list when dialog closes
          }
        }}
        initialData={editingExpense || undefined}
      />
    </div>
  );
}
