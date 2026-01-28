"use client";

import { useState, useMemo } from "react";
import { IncomeList } from "@/components/income/income-list";
import { IncomeEntryDialog } from "@/components/income/income-entry-dialog";
import { PaystubsPreview } from "@/components/paystubs/paystubs-preview";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface IncomePageClientProps {
  incomeRecords: any[];
  paystubRecords: any[];
}

export function IncomePageClient({
  incomeRecords,
  paystubRecords,
}: IncomePageClientProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [paystubs, setPaystubs] = useState(paystubRecords);
  const [incomeList, setIncomeList] = useState(incomeRecords);

  // Filter income records by selected year
  const filteredIncomeList = useMemo(() => {
    return incomeList.filter((record) => {
      try {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear().toString() === selectedYear;
      } catch {
        return false;
      }
    });
  }, [incomeList, selectedYear]);

  // Get available years from income records
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    incomeList.forEach((record) => {
      try {
        const recordDate = new Date(record.date);
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
  }, [incomeList, currentYear]);

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
      // If the newly added record is from a different year, switch to that year
      if (data.length > 0) {
        try {
          const latestDate = new Date(data[0].date);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Income</h1>
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
            Add Income
          </Button>
        </div>
      </div>
      <PaystubsPreview initialData={paystubs} onDelete={refreshPaystubs} />
      <IncomeList
        initialData={filteredIncomeList}
        paystubRecords={paystubs}
        onEdit={(income) => {
          setEditingIncome(income);
          setDialogOpen(true);
        }}
        onRefresh={refreshIncome}
      />
      <IncomeEntryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingIncome(null);
            refreshIncome(); // Refresh income list when dialog closes
          }
        }}
        initialData={editingIncome || undefined}
        onPaystubUploaded={refreshPaystubs}
      />
    </div>
  );
}
