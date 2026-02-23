import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/forms/profile-form";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { EXPENSE_CATEGORIES } from "@/lib/validations/expense-categories";

const ASSETS_FEATURE_DISABLED_FLAG = "__feature_assets_disabled__";
const DEFAULT_ENABLED_EXPENSE_CATEGORIES = [
  ...EXPENSE_CATEGORIES.SELF_EMPLOYMENT,
  ...EXPENSE_CATEGORIES.VEHICLE,
  ASSETS_FEATURE_DISABLED_FLAG,
];

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>;
}) {const resolvedSearchParams = await searchParams;const isSetupMode = resolvedSearchParams.setup === "true";
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const [userProfile] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  // Auto-create user profile if it doesn't exist
  if (!userProfile) {
    const subscriptionTier = (user.user_metadata?.subscriptionTier as "basic" | "personal" | "corporate") || "personal";
    const taxFilingStatus = subscriptionTier === "corporate" ? "personal_and_corporate" : "personal_only";
    const [newUser] = await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email!,
        subscriptionTier,
        taxFilingStatus,
        province: "BC",
        enabledExpenseCategories: DEFAULT_ENABLED_EXPENSE_CATEGORIES,
        trackPersonalExpenses: false,
        hasHomeOffice: false,
        homeOfficePercentage: "0",
        mileageLoggingStyle: "trip_distance",
      })
      .returning();

    return (
      <div className="space-y-6">
        <div className="sticky top-0 z-10 -mx-4 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Profile Setup</h1>
        </div>
        {isSetupMode && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Complete Your Profile</AlertTitle>
            <AlertDescription>
              Please complete your profile to continue using CallSheets. All fields marked with an asterisk (*) are required.
            </AlertDescription>
          </Alert>
        )}
        <ProfileForm initialData={newUser} isSetupMode={isSetupMode} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-4 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Profile</h1>
      </div>
      {isSetupMode && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Complete Your Profile</AlertTitle>
          <AlertDescription>
            Please complete your profile to continue using CallSheets. All fields marked with an asterisk (*) are required.
          </AlertDescription>
        </Alert>
      )}
      <ProfileForm initialData={userProfile} isSetupMode={isSetupMode} />
    </div>
  );
}
