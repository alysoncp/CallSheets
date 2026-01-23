import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Help & FAQ</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Welcome to CallSheets! To get started, create an account and begin tracking your income and expenses.
                You can upload receipts and paystubs, track vehicle mileage, and calculate your taxes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How do I track income?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Navigate to the Income page and click "Add Income". Enter the date, amount, income type,
                and any additional details. You can link paystubs to income records for better organization.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How do I track expenses?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Go to the Expenses page and click "Add Expense". Fill in the details including date, amount,
                category, and expense type. You can upload receipts and link them to expense records.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What is OCR?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                OCR (Optical Character Recognition) automatically extracts data from your receipts and paystubs.
                This saves you time by automatically filling in amounts, dates, and vendor information.
                OCR usage is limited based on your subscription tier.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How does the tax calculator work?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The tax calculator uses your income and expenses for the selected tax year to calculate
                your estimated taxes. It includes federal tax, provincial tax (BC), and CPP contributions.
                The calculator is available for Personal and Corporate subscription tiers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you need additional help, please contact our support team at support@callsheets.ca
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
