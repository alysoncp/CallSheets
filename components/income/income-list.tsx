"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { INCOME_TYPES } from "@/lib/validations/expense-categories";

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
}

export function IncomeList({ initialData }: IncomeListProps) {
  const [incomeRecords, setIncomeRecords] = useState(initialData);
  const [loading, setLoading] = useState(false);

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

  if (incomeRecords.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">No income records yet.</p>
          <Button asChild className="mt-4">
            <Link href="/income/new">Add Your First Income Record</Link>
          </Button>
        </CardContent>
      </Card>
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
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/income/${record.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
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
    </Card>
  );
}
