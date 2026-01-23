import { IncomeForm } from "@/components/forms/income-form";

export default function NewIncomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add Income</h1>
      <IncomeForm />
    </div>
  );
}
