"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userProfileSchema, type UserProfileFormData } from "@/lib/validations/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EXPENSE_CATEGORIES, getExpenseCategoryLabel } from "@/lib/validations/expense-categories";
import type { SubscriptionTier } from "@/lib/utils/subscription";

interface SettingsFormProps {
  initialData: any;
}

const ASSETS_FEATURE_DISABLED_FLAG = "__feature_assets_disabled__";
const DEFAULT_ENABLED_EXPENSE_CATEGORIES = [
  ...EXPENSE_CATEGORIES.SELF_EMPLOYMENT,
  ...EXPENSE_CATEGORIES.VEHICLE,
  ASSETS_FEATURE_DISABLED_FLAG,
];

const unique = (items: string[]) => [...new Set(items)];
const inGroup = (group: readonly string[], category: string) =>
  (group as readonly string[]).includes(category);

export function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToastOpen, setSuccessToastOpen] = useState(false);
  const subscriptionTier = initialData?.subscriptionTier as SubscriptionTier | undefined;
  const initialEnabledExpenseCategories = Array.isArray(initialData?.enabledExpenseCategories)
    ? (initialData.enabledExpenseCategories as string[])
    : [];
  const hasStoredEnabledCategories = initialEnabledExpenseCategories.length > 0;
  const defaultEnabledExpenseCategories = hasStoredEnabledCategories
    ? initialEnabledExpenseCategories
    : DEFAULT_ENABLED_EXPENSE_CATEGORIES;
  const [lastHomeOfficeCategories, setLastHomeOfficeCategories] = useState<string[]>(
    defaultEnabledExpenseCategories.filter((c) => inGroup(EXPENSE_CATEGORIES.HOME_OFFICE_LIVING, c))
  );
  const [lastPersonalCategories, setLastPersonalCategories] = useState<string[]>(
    defaultEnabledExpenseCategories.filter(
      (c) =>
        inGroup(EXPENSE_CATEGORIES.TAX_DEDUCTIBLE_PERSONAL, c) ||
        inGroup(EXPENSE_CATEGORIES.NON_DEDUCTIBLE_PERSONAL, c)
    )
  );
  const [lastVehicleCategories, setLastVehicleCategories] = useState<string[]>(
    defaultEnabledExpenseCategories.filter((c) => inGroup(EXPENSE_CATEGORIES.VEHICLE, c))
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema) as Resolver<UserProfileFormData>,
    defaultValues: {
      ...initialData,
      enabledExpenseCategories: defaultEnabledExpenseCategories,
      mileageLoggingStyle: initialData?.mileageLoggingStyle || "trip_distance",
      hasHomeOffice: initialData?.hasHomeOffice === true,
      homeOfficePercentage: initialData?.homeOfficePercentage ?? 0,
      trackPersonalExpenses: hasStoredEnabledCategories && initialData?.trackPersonalExpenses === true,
    },
  });

  const enabledCategories =
    ((watch("enabledExpenseCategories") as string[] | undefined) ?? defaultEnabledExpenseCategories);
  const hasHomeOffice = watch("hasHomeOffice") === true;
  const homeOfficePercentageRaw = watch("homeOfficePercentage");
  const parsedHomeOfficePercentage =
    homeOfficePercentageRaw === null || homeOfficePercentageRaw === undefined
      ? null
      : Number(homeOfficePercentageRaw);
  const homeOfficePercentage =
    parsedHomeOfficePercentage !== null && Number.isFinite(parsedHomeOfficePercentage)
      ? Math.min(100, Math.max(0, parsedHomeOfficePercentage))
      : null;
  const personalHomeExpensesPercentage =
    homeOfficePercentage !== null ? 100 - homeOfficePercentage : null;
  const trackPersonalExpenses = watch("trackPersonalExpenses") === true;
  const trackVehicleExpenses = EXPENSE_CATEGORIES.VEHICLE.some((cat) => enabledCategories.includes(cat));
  const trackHomeOfficeExpenses = EXPENSE_CATEGORIES.HOME_OFFICE_LIVING.some((cat) => enabledCategories.includes(cat));
  const trackAssets = !enabledCategories.includes(ASSETS_FEATURE_DISABLED_FLAG);

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
      const newCategories = unique([...current, ...categories]);
      setValue("enabledExpenseCategories", newCategories);
    } else {
      // Remove all categories from this group
      setValue("enabledExpenseCategories", current.filter((c) => !categories.includes(c)));
    }
  };

  const renderCategoryGroup = (title: string, categories: readonly string[]) => {
    const allSelected = categories.every((cat) => enabledCategories.includes(cat));
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">{title}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="bg-muted hover:bg-muted/80 border-border"
            onClick={() => handleGroupToggle(categories, !allSelected)}
          >
            {allSelected ? "Deselect All" : "Select All"}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={enabledCategories.includes(category)}
                onChange={(e) => handleCategoryChange(category, e.target.checked)}
              />
              <Label
                htmlFor={category}
                className="text-sm font-normal cursor-pointer"
              >
                {getExpenseCategoryLabel(category)}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const nextInitialEnabledExpenseCategories = Array.isArray(initialData?.enabledExpenseCategories)
      ? (initialData.enabledExpenseCategories as string[])
      : [];
    const nextHasStoredEnabledCategories = nextInitialEnabledExpenseCategories.length > 0;
    const nextDefaultEnabledExpenseCategories = nextHasStoredEnabledCategories
      ? nextInitialEnabledExpenseCategories
      : DEFAULT_ENABLED_EXPENSE_CATEGORIES;

    setLastHomeOfficeCategories(
      nextDefaultEnabledExpenseCategories.filter((c) => inGroup(EXPENSE_CATEGORIES.HOME_OFFICE_LIVING, c))
    );
    setLastPersonalCategories(
      nextDefaultEnabledExpenseCategories.filter(
        (c) =>
          inGroup(EXPENSE_CATEGORIES.TAX_DEDUCTIBLE_PERSONAL, c) ||
          inGroup(EXPENSE_CATEGORIES.NON_DEDUCTIBLE_PERSONAL, c)
      )
    );
    setLastVehicleCategories(
      nextDefaultEnabledExpenseCategories.filter((c) => inGroup(EXPENSE_CATEGORIES.VEHICLE, c))
    );

    reset({
      ...initialData,
      enabledExpenseCategories: nextDefaultEnabledExpenseCategories,
      mileageLoggingStyle: initialData?.mileageLoggingStyle || "trip_distance",
      hasHomeOffice: initialData?.hasHomeOffice === true,
      homeOfficePercentage: initialData?.homeOfficePercentage ?? 0,
      trackPersonalExpenses: nextHasStoredEnabledCategories && initialData?.trackPersonalExpenses === true,
    });
  }, [initialData, reset]);

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

      setSuccessToastOpen(true);
      setTimeout(() => setSuccessToastOpen(false), 3000);
      
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
      {successToastOpen && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-50 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-lg"
        >
          Settings saved successfully.
        </div>
      )}

      {/* Employment Expense Categories Customization */}
      <Card>
        <CardHeader>
          <CardTitle>Employment Expense Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Select which employment expense categories you want to use
          </p>
          {renderCategoryGroup("General Self-Employment", EXPENSE_CATEGORIES.SELF_EMPLOYMENT)}
        </CardContent>
      </Card>

      {/* Home Office Percentage */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Home Office / Home Expenses</CardTitle>
            </div>
            <div className="flex items-center pr-1">
              <Switch
                id="trackHomeOfficeExpenses"
                aria-label="Track home office or home expenses"
                checked={trackHomeOfficeExpenses}
                onCheckedChange={(checked) => {
                  const current = (enabledCategories as string[]) || [];
                  if (checked) {
                    const categoriesToRestore =
                      lastHomeOfficeCategories.length > 0
                        ? lastHomeOfficeCategories
                        : [...EXPENSE_CATEGORIES.HOME_OFFICE_LIVING];
                    setValue("enabledExpenseCategories", unique([...current, ...categoriesToRestore]));
                    setValue("hasHomeOffice", false);
                    setValue("homeOfficePercentage", 0);
                  } else {
                    setLastHomeOfficeCategories(
                      current.filter((c) => inGroup(EXPENSE_CATEGORIES.HOME_OFFICE_LIVING, c))
                    );
                    setValue(
                      "enabledExpenseCategories",
                      current.filter((c) => !inGroup(EXPENSE_CATEGORIES.HOME_OFFICE_LIVING, c))
                    );
                    setValue("hasHomeOffice", false);
                    setValue("homeOfficePercentage", 0);
                  }
                }}
                className="scale-125 origin-right"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Track home-related expenses such as rent and utilities. If part of your home is used as a home office, set the business-use percentage to have deductible portions automatically calculated.
          </p>
          {trackHomeOfficeExpenses && (
            <>
              <div className="space-y-3">
                <Label>Do you use part of your home for a home office?</Label>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="has_home_office_yes"
                      checked={hasHomeOffice}
                      onChange={() => {
                        setValue("hasHomeOffice", true);
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="has_home_office_yes" className="text-sm font-normal cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="has_home_office_no"
                      checked={!hasHomeOffice}
                      onChange={() => {
                        setValue("hasHomeOffice", false);
                        setValue("homeOfficePercentage", 0);
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="has_home_office_no" className="text-sm font-normal cursor-pointer">
                      No
                    </Label>
                  </div>
                </div>
              </div>

              <div className={`space-y-2 ${!hasHomeOffice ? "opacity-50" : ""}`}>
                <Label htmlFor="homeOfficePercentage">Home Office Percentage (%) used for BUSINESS</Label>
                <Input
                  id="homeOfficePercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  {...register("homeOfficePercentage")}
                  placeholder="e.g., 25.5"
                  disabled={!hasHomeOffice}
                />
                {errors.homeOfficePercentage && (
                  <p className="text-sm text-destructive">
                    {errors.homeOfficePercentage.message}
                  </p>
                )}
              </div>
              {renderCategoryGroup(
                hasHomeOffice
                  ? `Home Office (${homeOfficePercentage !== null ? `${homeOfficePercentage}%` : "--"}) / Personal Home Expenses (${personalHomeExpensesPercentage !== null ? `${personalHomeExpensesPercentage}%` : "--"})`
                  : "Home Expenses",
                EXPENSE_CATEGORIES.HOME_OFFICE_LIVING
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Track Personal Expenses */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Personal Expenses</CardTitle>
            </div>
            <div className="flex items-center pr-1">
              <Switch
                id="trackPersonalExpenses"
                aria-label="Track personal expenses"
                checked={trackPersonalExpenses}
                onCheckedChange={(checked) => {
                  const current = (enabledCategories as string[]) || [];
                  const personalCategories = [
                    ...EXPENSE_CATEGORIES.TAX_DEDUCTIBLE_PERSONAL,
                    ...EXPENSE_CATEGORIES.NON_DEDUCTIBLE_PERSONAL,
                  ];
                  setValue("trackPersonalExpenses", checked);
                  if (checked) {
                    const categoriesToRestore =
                      lastPersonalCategories.length > 0 ? lastPersonalCategories : personalCategories;
                    setValue("enabledExpenseCategories", unique([...current, ...categoriesToRestore]));
                  } else {
                    setLastPersonalCategories(current.filter((c) => inGroup(personalCategories, c)));
                    setValue(
                      "enabledExpenseCategories",
                      current.filter((c) => !inGroup(personalCategories, c))
                    );
                  }
                }}
                className="scale-125 origin-right"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Choose whether to track tax-deductible and non-tax deductible personal expenses.
          </p>
          {trackPersonalExpenses && (
            <div className="space-y-6 pt-4">
              <p className="text-xs text-muted-foreground">
                When disabled, the "Personal" expense type will be removed from the expense form.
              </p>
              {renderCategoryGroup("Tax-Deductible Personal", EXPENSE_CATEGORIES.TAX_DEDUCTIBLE_PERSONAL)}
              {renderCategoryGroup("Non-Deductible Personal", EXPENSE_CATEGORIES.NON_DEDUCTIBLE_PERSONAL)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mileage Logging Style */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Vehicles and Mileage Logging</CardTitle>
            </div>
            <div className="flex items-center pr-1">
              <Switch
                id="trackVehicleExpenses"
                aria-label="Track vehicle expenses"
                checked={trackVehicleExpenses}
                onCheckedChange={(checked) => {
                  const current = (enabledCategories as string[]) || [];
                  if (checked) {
                    const categoriesToRestore =
                      lastVehicleCategories.length > 0
                        ? lastVehicleCategories
                        : [...EXPENSE_CATEGORIES.VEHICLE];
                    setValue("enabledExpenseCategories", unique([...current, ...categoriesToRestore]));
                  } else {
                    setLastVehicleCategories(current.filter((c) => inGroup(EXPENSE_CATEGORIES.VEHICLE, c)));
                    setValue(
                      "enabledExpenseCategories",
                      current.filter((c) => !inGroup(EXPENSE_CATEGORIES.VEHICLE, c))
                    );
                  }
                }}
                className="scale-125 origin-right"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            If you drive for work with a personal vehicle, you can choose to track vehicle expenses. By keeping track of your business use mileage, the tax-deductible portion of vehicle expenses will be calculated automatically.
          </p>
          {trackVehicleExpenses && (
            <div className="space-y-6 pt-2">
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
              {renderCategoryGroup("Vehicle Categories", EXPENSE_CATEGORIES.VEHICLE)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assets */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Assets</CardTitle>
            </div>
            <div className="flex items-center pr-1">
              <Switch
                id="trackAssets"
                aria-label="Track assets"
                checked={trackAssets}
                onCheckedChange={(checked) => {
                  const current = (enabledCategories as string[]) || [];
                  if (checked) {
                    setValue(
                      "enabledExpenseCategories",
                      current.filter((c) => c !== ASSETS_FEATURE_DISABLED_FLAG)
                    );
                  } else if (!current.includes(ASSETS_FEATURE_DISABLED_FLAG)) {
                    setValue("enabledExpenseCategories", [...current, ASSETS_FEATURE_DISABLED_FLAG]);
                  }
                }}
                className="scale-125 origin-right"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            For self-employed persons, an asset is a longer-term business item
            (for example camera, tools, computer) that is usually
            claimed over time instead of fully deducted in the year you buy it.
            An asset must be a durable good that will provide value over multiple years. Assets are subject to CCA rules and are tracked separately from regular expenses.
          </p>
          <p className="text-sm text-muted-foreground">
            *Vehicles are also assets, but these are tracked in the vehicle section*
          </p>
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
