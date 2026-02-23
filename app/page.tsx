import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const pageShowcase = [
  {
    title: "Dashboard Overview",
    description: "See income, expenses, tax estimates, and key reminders in one place.",
    screenshotPath: "/screenshots/dashboard-overview.png",
  },
  {
    title: "Income + Expenses",
    description: "Track productions, categorize write-offs, and keep records tax-ready.",
    screenshotPath: "/screenshots/income-expenses.png",
  },
  {
    title: "Receipts + OCR",
    description: "Upload receipt photos and paystubs, then auto-extract details in seconds.",
    screenshotPath: "/screenshots/receipts-ocr.png",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <p className="inline-flex rounded-full border bg-background px-4 py-1 text-sm font-medium mb-6">
          Beta pricing: Free right now
        </p>
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

      {/* Product Screenshots */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">See the Main Pages</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Add your real screenshots in <code className="text-foreground">public/screenshots</code>.
            The layout and descriptions are ready now.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {pageShowcase.map((page) => (
            <Card key={page.title} className="overflow-hidden">
              <div className="aspect-video border-b bg-muted/40 p-4">
                <div className="h-full w-full rounded-md border border-dashed border-muted-foreground/40 bg-gradient-to-br from-muted to-background flex items-center justify-center text-center px-6">
                  <p className="text-sm text-muted-foreground">
                    Screenshot placeholder:
                    <br />
                    <span className="text-foreground font-medium">{page.screenshotPath}</span>
                  </p>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{page.title}</CardTitle>
                <CardDescription>{page.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
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

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <Card className="max-w-3xl mx-auto border-primary/30">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Simple Pricing</CardTitle>
            <CardDescription>
              CallSheets is currently free during beta.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <p className="text-4xl font-bold">Free during beta</p>
              <p className="text-sm text-muted-foreground">No credit card required right now.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/signup">Start Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">View All Plans</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
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
