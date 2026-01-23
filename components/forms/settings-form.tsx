"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userProfileSchema, type UserProfileFormData } from "@/lib/validations/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EXPENSE_CATEGORIES, ALL_EXPENSE_CATEGORIES } from "@/lib/validations/expense-categories";
import type { SubscriptionTier } from "@/lib/utils/subscription";

interface SettingsFormProps {
  initialData: any;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const subscriptionTier = initialData?.subscriptionTier as SubscriptionTier | undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      ...initialData,
      enabledExpenseCategories: initialData?.enabledExpenseCategories || ALL_EXPENSE_CATEGORIES,
      mileageLoggingStyle: initialData?.mileageLoggingStyle || "trip_distance",
      homeOfficePercentage: initialData?.homeOfficePercentage || undefined,
    },
  });

  const enabledCategories = watch("enabledExpenseCategories") as string[] || ALL_EXPENSE_CATEGORIES;

  // Handle category checkbox changes
  const handleCategoryChange = (category: string, checked: boolean) => {
    const current = (enabledCategories as string[]) || [];
    if (checked) {
      setValue("enabledExpenseCategories", [...current, category]);
    } else {
      setValue("enabledExpenseCategories", current.filter((c) => c !== category));
    }
  };

  // Handle select all/none for a category group
  const handleGroupToggle = (categories: readonly string[], checked: boolean) => {
    const current = (enabledCategories as string[]) || [];
    if (checked) {
      // Add all categories from this group
      const newCategories = [...new Set([...current, ...categories])];
      setValue("enabledExpenseCategories", newCategories);
    } else {
      // Remove all categories from this group
      setValue("enabledExpenseCategories", current.filter((c) => !categories.includes(c)));
    }
  };

  const onSubmit = async (data: UserProfileFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update settings");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Trigger sidebar refresh
      localStorage.setItem('profileLastUpdate', Date.now().toString());
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: data, bubbles: true }));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Show corporate message for corporate subscriptions
  if (subscriptionTier === "corporate") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Corporate Settings</CardTitle>
          <CardDescription>Settings for corporate subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Corporate settings coming soon.</p>
        </CardContent>
      </Card>
    );
  }

  // Render settings for basic and personal subscriptions
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
          Settings saved successfully!
        </div>
      )}

      {/* Expense Categories Customization */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
          <CardDescription>Select which expense categories you want to use</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Self-Employment Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Self-Employment</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const allSelected = EXPENSE_CATEGORIES.SELF_EMPLOYMENT.every((cat) =>
                    enabledCategories.includes(cat)
                  );
                  handleGroupToggle(EXPENSE_CATEGORIES.SELF_EMPLOYMENT, !allSelected);
                }}
              >
                {EXPENSE_CATEGORIES.SELF_EMPLOYMENT.every((cat) =>
                  enabledCategories.includes(cat)
                )
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {EXPENSE_CATEGORIES.SELF_EMPLOYMENT.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={enabledCategories.includes(category)}
                    onChange={(e) =>
                      handleCategoryChange(category, e.target.checked)
                    }
                  />
                  <Label
                    htmlFor={category}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Home Office/Living Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Home Office/Living</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const allSelected = EXPENSE_CATEGORIES.HOME_OFFICE_LIVING.every((cat) =>
                    enabledCategories.includes(cat)
                  );
                  handleGroupToggle(EXPENSE_CATEGORIES.HOME_OFFICE_LIVING, !allSelected);
                }}
              >
                {EXPENSE_CATEGORIES.HOME_OFFICE_LIVING.every((cat) =>
                  enabledCategories.includes(cat)
                )
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {EXPENSE_CATEGORIES.HOME_OFFICE_LIVING.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={enabledCategories.includes(category)}
                    onChange={(e) =>
                      handleCategoryChange(category, e.target.checked)
                    }
                  />
                  <Label
                    htmlFor={category}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Vehicle</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const allSelected = EXPENSE_CATEGORIES.VEHICLE.every((cat) =>
                    enabledCategories.includes(cat)
                  );
                  handleGroupToggle(EXPENSE_CATEGORIES.VEHICLE, !allSelected);
                }}
              >
                {EXPENSE_CATEGORIES.VEHICLE.every((cat) => enabledCategories.includes(cat))
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {EXPENSE_CATEGORIES.VEHICLE.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={enabledCategories.includes(category)}
                    onChange={(e) =>
                      handleCategoryChange(category, e.target.checked)
                    }
                  />
                  <Label
                    htmlFor={category}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tax-Deductible Personal Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Tax-Deductible Personal</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const allSelected = EXPENSE_CATEGORIES.TAX_DEDUCTIBLE_PERSONAL.every((cat) =>
                    enabledCategories.includes(cat)
                  );
                  handleGroupToggle(EXPENSE_CATEGORIES.TAX_DEDUCTIBLE_PERSONAL, !allSelected);
                }}
              >
                {EXPENSE_CATEGORIES.TAX_DEDUCTIBLE_PERSONAL.every((cat) =>
                  enabledCategories.includes(cat)
                )
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {EXPENSE_CATEGORIES.TAX_DEDUCTIBLE_PERSONAL.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={enabledCategories.includes(category)}
                    onChange={(e) =>
                      handleCategoryChange(category, e.target.checked)
                    }
                  />
                  <Label
                    htmlFor={category}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Non-Deductible Personal Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Non-Deductible Personal</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const allSelected = EXPENSE_CATEGORIES.NON_DEDUCTIBLE_PERSONAL.every((cat) =>
                    enabledCategories.includes(cat)
                  );
                  handleGroupToggle(EXPENSE_CATEGORIES.NON_DEDUCTIBLE_PERSONAL, !allSelected);
                }}
              >
                {EXPENSE_CATEGORIES.NON_DEDUCTIBLE_PERSONAL.every((cat) =>
                  enabledCategories.includes(cat)
                )
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {EXPENSE_CATEGORIES.NON_DEDUCTIBLE_PERSONAL.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={enabledCategories.includes(category)}
                    onChange={(e) =>
                      handleCategoryChange(category, e.target.checked)
                    }
                  />
                  <Label
                    htmlFor={category}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mileage Logging Style */}
      <Card>
        <CardHeader>
          <CardTitle>Mileage Logging</CardTitle>
          <CardDescription>Choose how you want to track vehicle mileage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="trip_distance"
                value="trip_distance"
                {...register("mileageLoggingStyle")}
                className="h-4 w-4"
              />
              <Label htmlFor="trip_distance" className="text-sm font-normal cursor-pointer">
                Trip Distance - Track individual trips and their distances
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="odometer"
                value="odometer"
                {...register("mileageLoggingStyle")}
                className="h-4 w-4"
              />
              <Label htmlFor="odometer" className="text-sm font-normal cursor-pointer">
                Odometer Readings - Track mileage by recording odometer readings
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Home Office Percentage */}
      <Card>
        <CardHeader>
          <CardTitle>Home Office</CardTitle>
          <CardDescription>Enter the percentage of your home used for business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="homeOfficePercentage">Home Office Percentage (%)</Label>
            <Input
              id="homeOfficePercentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              {...register("homeOfficePercentage")}
              placeholder="e.g., 25.5"
            />
            {errors.homeOfficePercentage && (
              <p className="text-sm text-destructive">
                {errors.homeOfficePercentage.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
