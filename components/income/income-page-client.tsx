"use client";

import { useState } from "react";
import { IncomeList } from "@/components/income/income-list";
import { IncomeEntryDialog } from "@/components/income/income-entry-dialog";
import { PaystubsGrid } from "@/components/paystubs/paystubs-grid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IncomePageClientProps {
  incomeRecords: any[];
  paystubRecords: any[];
}

export function IncomePageClient({
  incomeRecords,
  paystubRecords,
}: IncomePageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Income</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Income
        </Button>
      </div>
      <IncomeList
        initialData={incomeRecords}
        onEdit={(income) => {
          setEditingIncome(income);
          setDialogOpen(true);
        }}
      />
      <Card>
        <CardHeader>
          <CardTitle>Paystub Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <PaystubsGrid initialData={paystubRecords} />
        </CardContent>
      </Card>
      <IncomeEntryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingIncome(null);
          }
        }}
        initialData={editingIncome || undefined}
      />
    </div>
  );
}
