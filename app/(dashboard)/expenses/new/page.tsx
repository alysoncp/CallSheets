import { ExpenseForm } from "@/components/forms/expense-form";

export default function NewExpensePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add Expense</h1>
      <ExpenseForm />
    </div>
  );
}
