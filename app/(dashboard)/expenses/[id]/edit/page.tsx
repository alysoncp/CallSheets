import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ExpenseForm } from "@/components/forms/expense-form";

export default async function EditExpensePage({
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

  const [expenseRecord] = await db
    .select()
    .from(expenses)
    .where(eq(expenses.id, params.id))
    .limit(1);

  if (!expenseRecord || expenseRecord.userId !== user.id) {
    redirect("/expenses");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Expense</h1>
      <ExpenseForm initialData={{ ...expenseRecord, id: expenseRecord.id }} />
    </div>
  );
}
