import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Financial Management for Canadian Film & TV Professionals
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Track income, manage expenses, calculate taxes, and optimize your finances
          with tools designed specifically for the entertainment industry.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Income Tracking</CardTitle>
              <CardDescription>
                Track all your income sources with detailed categorization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Record union and non-union production income, royalties, residuals, and more.
                Link paystubs and automatically extract data with OCR.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Management</CardTitle>
              <CardDescription>
                Organize and categorize all your business expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track self-employment expenses, home office costs, vehicle expenses,
                and personal tax-deductible items with receipt uploads.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receipt Upload</CardTitle>
              <CardDescription>
                Upload and organize receipts with OCR processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload receipts and paystubs, automatically extract data using OCR,
                and link them to your income and expense records.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Calculations</CardTitle>
              <CardDescription>
                Calculate your taxes with Canadian tax rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get accurate tax calculations based on federal and provincial rates,
                including CPP contributions and deductions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Tools</CardTitle>
              <CardDescription>
                Optimize your tax strategy with dividend vs. salary analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                For incorporated professionals, compare dividend and salary strategies
                to minimize your total tax burden.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Your financial data is secure and private
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All data is encrypted and stored securely. You have complete control
                over your financial information.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-8">
          Join Canadian film and TV professionals who trust CallSheets for their financial management.
        </p>
        <Button asChild size="lg">
          <Link href="/signup">Create Your Account</Link>
        </Button>
      </section>
    </div>
  );
}
