"use client";

import { useState } from "react";
import { ExpenseList } from "@/components/expenses/expense-list";
import { ExpenseEntryDialog } from "@/components/expenses/expense-entry-dialog";
import { ReceiptsGrid } from "@/components/receipts/receipts-grid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>
      <ExpenseList
        initialData={expenseRecords}
        onEdit={(expense) => {
          setEditingExpense(expense);
          setDialogOpen(true);
        }}
      />
      <Card>
        <CardHeader>
          <CardTitle>Receipt Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <ReceiptsGrid initialData={receiptRecords} />
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
    </div>
  );
}
