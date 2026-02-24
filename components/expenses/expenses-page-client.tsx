"use client";

import { useState, useMemo } from "react";
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

  // Filter receipts by selected year (expense date or upload date)
  const filteredReceiptsForYear = useMemo(() => {
    return receipts.filter((r) => {
      try {
        const dateRaw = r.expenseDate ?? r.uploadedAt;
        if (!dateRaw) return false;
        const d = typeof dateRaw === "string" ? new Date(dateRaw) : new Date(dateRaw);
        return d.getFullYear() === taxYear;
      } catch {
        return false;
      }
    });
  }, [receipts, taxYear]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="sticky top-0 z-10 -mx-4 flex flex-col gap-3 border-b border-border bg-background px-4 py-3 sm:-mx-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5 md:-mx-6 md:px-6 lg:h-16 lg:py-0">
        <h1 className="text-2xl font-bold sm:text-3xl">Expenses</h1>
        <Button data-tour="add-expense" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>
      <ReceiptsPreview initialData={filteredReceiptsForYear} onDelete={() => { refreshReceipts(); }} />
      <ExpenseList
        key={taxYear}
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
            refreshReceipts(); // Refresh receipt gallery so new receipt appears
          }
        }}
        initialData={editingExpense || undefined}
      />
    </div>
  );
}
