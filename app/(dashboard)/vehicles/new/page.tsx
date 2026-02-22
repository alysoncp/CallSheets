import { VehicleForm } from "@/components/forms/vehicle-form";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { EXPENSE_CATEGORIES } from "@/lib/validations/expense-categories";

export default async function NewVehiclePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const [userProfile] = await db
    .select({ enabledExpenseCategories: users.enabledExpenseCategories })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const enabledCategories = Array.isArray(userProfile?.enabledExpenseCategories)
    ? userProfile.enabledExpenseCategories
    : [];
  const trackVehicleExpenses = enabledCategories.length === 0
    ? true
    : EXPENSE_CATEGORIES.VEHICLE.some((cat) => enabledCategories.includes(cat));

  if (!trackVehicleExpenses) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-4 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Add Vehicle</h1>
      </div>
      <VehicleForm />
    </div>
  );
}
