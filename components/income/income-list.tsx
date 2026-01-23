"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { INCOME_TYPES } from "@/lib/validations/expense-categories";
import { IncomeEntryDialog } from "@/components/income/income-entry-dialog";

interface IncomeRecord {
  id: string;
  amount: string | number;
  date: string;
  incomeType: string;
  description?: string | null;
  productionName?: string | null;
  employerName?: string | null;
}

interface IncomeListProps {
  initialData: IncomeRecord[];
  onEdit?: (income: IncomeRecord) => void;
}

export function IncomeList({ initialData, onEdit }: IncomeListProps) {
  const [incomeRecords, setIncomeRecords] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this income record?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/income/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setIncomeRecords(incomeRecords.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Error deleting income:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (income: IncomeRecord) => {
    setEditingIncome(income);
    setDialogOpen(true);
    if (onEdit) {
      onEdit(income);
    }
  };

  if (incomeRecords.length === 0) {
    return (
      <>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No income records yet.</p>
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
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {incomeRecords.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between border-b pb-4 last:border-0"
            >
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">
                      {record.description ||
                        record.productionName ||
                        record.employerName ||
                        INCOME_TYPES.find((t) => t === record.incomeType) ||
                        "Income"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(record.date), "MMM dd, yyyy")} •{" "}
                      {record.incomeType.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-green-600">
                  ${Number(record.amount).toLocaleString("en-CA", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <div className="flex gap-2">
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
      </CardContent>
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
    </Card>
  );
}
