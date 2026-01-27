import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Pricing</h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan - Greyed out */}
          <Card className="opacity-50 cursor-not-allowed">
            <CardHeader>
              <CardTitle>Basic</CardTitle>
              <CardDescription>Free</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-6">$0<span className="text-lg font-normal">/month</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Income/expense tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Receipt/paystub upload</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>10 OCR requests/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Basic dashboard</span>
                </li>
              </ul>
              <Button disabled className="w-full" variant="outline">
                Not Available
              </Button>
            </CardContent>
          </Card>

          {/* Personal Plan - Free during beta */}
          <Card className="border-primary border-2">
            <CardHeader>
              <CardTitle>Personal</CardTitle>
              <CardDescription>Most Popular - Free during beta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                <span className="line-through text-muted-foreground">$9.99</span>
                <span className="ml-2">Free</span>
                <span className="text-lg font-normal">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Free during beta period</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>All Basic features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Vehicle mileage tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Tax calculator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Asset/CCA tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Lease management</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>100 OCR requests/month</span>
                </li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/signup">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Corporate Plan - Coming soon */}
          <Card className="opacity-50 cursor-not-allowed">
            <CardHeader>
              <CardTitle>Corporate</CardTitle>
              <CardDescription>Coming Soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-6">$24.99<span className="text-lg font-normal">/month</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>All Personal features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Unlimited OCR requests</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Advanced reporting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Corporate tax features</span>
                </li>
              </ul>
              <Button disabled className="w-full" variant="outline">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
