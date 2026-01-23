"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, type ExpenseFormData } from "@/lib/validations/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getCategoriesByExpenseType, ALL_EXPENSE_CATEGORIES } from "@/lib/validations/expense-categories";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData> & { id?: string };
  onSuccess?: () => void;
  ocrData?: any;
}

export function ExpenseForm({ initialData, onSuccess, ocrData }: ExpenseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enabledCategories, setEnabledCategories] = useState<string[] | null>(null);

  // Merge OCR data with initial data
  const mergedData = ocrData ? { ...initialData, ...ocrData } : initialData;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: mergedData,
  });

  const expenseType = watch("expenseType");

  // Fetch user profile to get enabled categories
  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error && data.enabledExpenseCategories) {
          setEnabledCategories(data.enabledExpenseCategories);
        }
      })
      .catch(() => {
        // Silently fail - will show all categories
      });
  }, []);

  // Clear category when expense type changes
  useEffect(() => {
    if (expenseType) {
      setValue("category", "");
    }
  }, [expenseType, setValue]);

  // Get available categories based on expense type and enabled categories
  const getAvailableCategories = () => {
    let categories: readonly string[] = [];
    
    if (expenseType) {
      categories = getCategoriesByExpenseType(expenseType);
    } else {
      categories = ALL_EXPENSE_CATEGORIES;
    }

    // Filter by enabled categories if available
    if (enabledCategories && enabledCategories.length > 0) {
      return categories.filter((cat) => enabledCategories.includes(cat));
    }

    return categories;
  };

  const availableCategories = getAvailableCategories();

  const onSubmit = async (data: ExpenseFormData) => {
    setLoading(true);
    setError(null);

    try {
      const url = initialData?.id
        ? `/api/expenses/${initialData.id}`
        : "/api/expenses";
      const method = initialData?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save expense");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/expenses");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                required
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount")}
                required
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                required
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenseType">Expense Type *</Label>
              <Select id="expenseType" {...register("expenseType")} required>
                <option value="">Select type</option>
                <option value="home_office_living">Home Office/Living</option>
                <option value="vehicle">Vehicle</option>
                <option value="self_employment">Self-Employment</option>
                <option value="personal">Personal</option>
                <option value="mixed">Mixed</option>
              </Select>
              {errors.expenseType && (
                <p className="text-sm text-destructive">{errors.expenseType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                id="category" 
                {...register("category")} 
                required
                disabled={!expenseType}
              >
                <option value="">{expenseType ? "Select category" : "Select expense type first"}</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            {(expenseType === "mixed" || expenseType === "home_office_living") && (
              <div className="space-y-2">
                <Label htmlFor="businessUsePercentage">Business Use Percentage</Label>
                <Input
                  id="businessUsePercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  {...register("businessUsePercentage")}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                {...register("vendor")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstAmount">GST Amount</Label>
              <Input
                id="gstAmount"
                type="number"
                step="0.01"
                {...register("gstAmount")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pstAmount">PST Amount</Label>
              <Input
                id="pstAmount"
                type="number"
                step="0.01"
                {...register("pstAmount")}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register("description")}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : initialData?.id ? "Update" : "Create"}
            </Button>
            {onSuccess && (
              <Button
                type="button"
                variant="outline"
                onClick={onSuccess}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
  );
}
