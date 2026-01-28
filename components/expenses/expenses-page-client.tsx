"use client";

import { useState, useMemo } from "react";
import { ExpenseList } from "@/components/expenses/expense-list";
import { ExpenseEntryDialog } from "@/components/expenses/expense-entry-dialog";
import { ReceiptsPreview } from "@/components/receipts/receipts-preview";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface ExpensesPageClientProps {
  expenseRecords: any[];
  receiptRecords: any[];
}

export function ExpensesPageClient({
  expenseRecords,
  receiptRecords,
}: ExpensesPageClientProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
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
      // If the newly added record is from a different year, switch to that year
      if (data.length > 0) {
        try {
          const latestDate = typeof data[0].date === 'string' 
            ? new Date(data[0].date) 
            : new Date(data[0].date);
          const latestYear = latestDate.getFullYear().toString();
          if (latestYear !== selectedYear) {
            setSelectedYear(latestYear);
          }
        } catch {
          // Ignore date parsing errors
        }
      }
    }
  };

  // Filter expense records by selected year
  const filteredExpenseList = useMemo(() => {
    return expenseList.filter((record) => {
      try {
        const recordDate = typeof record.date === 'string' 
          ? new Date(record.date) 
          : new Date(record.date);
        return recordDate.getFullYear().toString() === selectedYear;
      } catch {
        return false;
      }
    });
  }, [expenseList, selectedYear]);

  // Get available years from expense records
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    expenseList.forEach((record) => {
      try {
        const recordDate = typeof record.date === 'string' 
          ? new Date(record.date) 
          : new Date(record.date);
        years.add(recordDate.getFullYear());
      } catch {
        // Skip invalid dates
      }
    });
    // Add current year if no records exist
    if (years.size === 0) {
      years.add(currentYear);
    }
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [expenseList, currentYear]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="year-select" className="text-sm font-medium">
              Year:
            </Label>
            <Select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {availableYears.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
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
