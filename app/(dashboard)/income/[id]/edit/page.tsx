import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { income } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { IncomeForm } from "@/components/forms/income-form";

export default async function EditIncomePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const [incomeRecord] = await db
    .select()
    .from(income)
    .where(eq(income.id, params.id))
    .limit(1);

  if (!incomeRecord || incomeRecord.userId !== user.id) {
    redirect("/income");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Income</h1>
      <IncomeForm initialData={{ ...incomeRecord, id: incomeRecord.id }} />
    </div>
  );
}
