"use client";

import { useState, useMemo } from "react";
import { IncomeList } from "@/components/income/income-list";
import { IncomeEntryDialog } from "@/components/income/income-entry-dialog";
import { PaystubsPreview } from "@/components/paystubs/paystubs-preview";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTaxYear } from "@/lib/contexts/tax-year-context";

interface IncomePageClientProps {
  incomeRecords: any[];
  paystubRecords: any[];
}

export function IncomePageClient({
  incomeRecords,
  paystubRecords,
}: IncomePageClientProps) {
  const { taxYear } = useTaxYear();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [paystubs, setPaystubs] = useState(paystubRecords);
  const [incomeList, setIncomeList] = useState(incomeRecords);

  // Filter income records by selected year from context
  const filteredIncomeList = useMemo(() => {
    return incomeList.filter((record) => {
      try {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === taxYear;
      } catch {
        return false;
      }
    });
  }, [incomeList, taxYear]);

  // Filter paystubs by selected year (stub date or upload date)
  const filteredPaystubsForYear = useMemo(() => {
    return paystubs.filter((p) => {
      try {
        const dateRaw = p.stubDate ?? p.uploadedAt;
        if (!dateRaw) return false;
        const d = typeof dateRaw === "string" ? new Date(dateRaw) : new Date(dateRaw);
        return d.getFullYear() === taxYear;
      } catch {
        return false;
      }
    });
  }, [paystubs, taxYear]);

  const refreshPaystubs = async () => {
    const response = await fetch("/api/paystubs", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setPaystubs(data);
    }
  };

  const refreshIncome = async () => {
    const response = await fetch("/api/income", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setIncomeList(data);
      // Dispatch event to update sidebar year list
      window.dispatchEvent(new Event('incomeUpdated'));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="sticky top-0 z-10 -mx-4 flex flex-col gap-3 border-b border-border bg-background px-4 py-3 sm:-mx-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5 md:-mx-6 md:px-6 lg:h-16 lg:py-0">
        <h1 className="text-2xl font-bold sm:text-3xl">Income</h1>
        <Button onClick={() => { setEditingIncome(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Income
        </Button>
      </div>
      <PaystubsPreview initialData={filteredPaystubsForYear} onDelete={refreshPaystubs} />
      <IncomeList
        initialData={filteredIncomeList}
        paystubRecords={paystubs}
        onEdit={(income) => {
          setEditingIncome(income);
          setDialogOpen(true);
        }}
        onAddClick={() => {
          setEditingIncome(null);
          setDialogOpen(true);
        }}
      />
      <IncomeEntryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            refreshIncome(); // Refresh income list when dialog closes
            refreshPaystubs(); // Refresh paystub gallery so new paystub appears
          }
        }}
        initialData={editingIncome || undefined}
        onPaystubUploaded={refreshPaystubs}
      />
    </div>
  );
}
