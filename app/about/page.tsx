import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">About CallSheets</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              CallSheets is designed specifically for Canadian film and TV industry professionals.
              We understand the unique financial challenges you face, from tracking multiple income
              sources to managing business expenses and optimizing your tax strategy.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Comprehensive income and expense tracking</li>
              <li>• Receipt and paystub upload with OCR processing</li>
              <li>• Vehicle mileage tracking for business use</li>
              <li>• Asset and CCA (Capital Cost Allowance) management</li>
              <li>• Lease contract and payment tracking</li>
              <li>• Tax calculations with Canadian tax rules</li>
              <li>• Dividend vs. Salary optimization for incorporated professionals</li>
              <li>• GST/HST tracking and reporting</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target Audience</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              CallSheets is built for performers, crew members, and other professionals in the Canadian
              film and television industry. Whether you're union or non-union, working as an employee
              or self-employed, CallSheets helps you manage your finances and stay organized for tax season.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
