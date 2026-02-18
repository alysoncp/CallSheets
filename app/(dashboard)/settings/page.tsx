import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/forms/settings-form";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function SettingsPage() {
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

  if (!userProfile) {
    redirect("/signin");
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-4 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
      </div>
      <SettingsForm initialData={userProfile} />
    </div>
  );
}
