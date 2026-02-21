"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import { ImageViewDialog } from "@/components/ui/image-view-dialog";
import { storageImageToProxyUrl, isPdfUrl } from "@/lib/utils/storage-image-url";
import { FileText } from "lucide-react";

interface IncomeRecord {
  id: string;
  amount: string | number;
  date: string;
  incomeType: string;
  description?: string | null;
  productionName?: string | null;
  employerName?: string | null;
  paystubImageUrl?: string | null;
}

interface PaystubRecord {
  id: string;
  imageUrl: string;
  linkedIncomeId?: string | null;
}

interface IncomeListProps {
  initialData: IncomeRecord[];
  paystubRecords?: PaystubRecord[];
  onEdit?: (income: IncomeRecord) => void;
  onAddClick?: () => void;
}

export function IncomeList({ initialData, paystubRecords = [], onEdit, onAddClick }: IncomeListProps) {
  const [incomeRecords, setIncomeRecords] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  // Refresh income records when initialData changes
  useEffect(() => {
    setIncomeRecords(initialData);
  }, [initialData]);

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
        // Dispatch event to update sidebar year list
        window.dispatchEvent(new Event('incomeUpdated'));
      }
    } catch (error) {
      console.error("Error deleting income:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (income: IncomeRecord) => {
    if (onEdit) {
      onEdit(income);
    }
  };

  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
    }
  };

  const getPaystubImageUrl = (income: IncomeRecord): string | null => {
    // Check if income has direct paystubImageUrl
    if (income.paystubImageUrl) {
      return income.paystubImageUrl;
    }
    // Check if any paystub is linked to this income
    const linkedPaystub = paystubRecords.find(
      (paystub) => paystub.linkedIncomeId === income.id
    );
    return linkedPaystub?.imageUrl || null;
  };

  const getPaystubDisplayUrl = (income: IncomeRecord): string | null => {
    const raw = getPaystubImageUrl(income);
    if (!raw) return null;
    return storageImageToProxyUrl(raw) ?? raw;
  };

  const handleViewPaystub = (income: IncomeRecord) => {
    const displayUrl = getPaystubDisplayUrl(income);
    if (displayUrl) {
      setViewingImageUrl(displayUrl);
      setImageDialogOpen(true);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Income Records</CardTitle>
        </CardHeader>
        <CardContent>
          {incomeRecords.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground mb-4">No income records yet.</p>
              <Button onClick={handleAddClick}>
                Add Your First Income Record
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {incomeRecords.map((record) => {
                const paystubUrl = getPaystubDisplayUrl(record);
                const rawPaystubUrl = getPaystubImageUrl(record);

                return (
                  <div
                    key={record.id}
                    className="flex items-start gap-3 border-b pb-4 last:border-0 sm:items-center sm:gap-4"
                  >
                    {paystubUrl && (
                      <div
                        className="relative h-16 w-16 bg-muted rounded overflow-hidden flex-shrink-0 cursor-pointer flex flex-col items-center justify-center text-muted-foreground"
                        onClick={() => handleViewPaystub(record)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && handleViewPaystub(record)}
                      >
                        {isPdfUrl(rawPaystubUrl) ? (
                          <>
                            <FileText className="h-6 w-6" />
                            <span className="text-[10px] font-medium">PDF</span>
                          </>
                        ) : (
                          <Image
                            src={paystubUrl}
                            alt="Paystub thumbnail"
                            fill
                            className="object-cover pointer-events-none"
                            unoptimized
                            onError={(e) => {
                              console.error("Error loading paystub thumbnail:", paystubUrl);
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {record.productionName || "Income"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(record.date), "MMM dd, yyyy")}
                          </p>
                        </div>

                        <span className="text-lg font-semibold text-green-600 sm:whitespace-nowrap sm:flex-none sm:w-36 sm:text-right">
                          ${Number(record.amount).toLocaleString("en-CA", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>

                        <div className="flex items-center gap-1 sm:gap-2">
                          {paystubUrl && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewPaystub(record)}
                                title="View Paystub"
                                className="h-8 px-2 sm:hidden"
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewPaystub(record)}
                                title="View Paystub"
                                className="hidden sm:inline-flex"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(record)}
                            className="h-8 px-2 sm:hidden"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(record)}
                            className="hidden sm:inline-flex"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                            disabled={loading}
                            className="h-8 px-2 sm:hidden"
                          >
                            Delete
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(record.id)}
                            disabled={loading}
                            className="hidden sm:inline-flex"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      {viewingImageUrl && (
        <ImageViewDialog
          open={imageDialogOpen}
          onOpenChange={setImageDialogOpen}
          imageUrl={viewingImageUrl}
          title="View Paystub"
        />
      )}
    </>
  );
}
