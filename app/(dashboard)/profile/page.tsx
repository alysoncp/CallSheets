import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/forms/profile-form";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
    const [newUser] = await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email!,
        subscriptionTier: "basic",
        taxFilingStatus: "personal_only",
        province: "BC",
      })
      .returning();

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Profile Setup</h1>
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
      <h1 className="text-3xl font-bold">Profile</h1>
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
