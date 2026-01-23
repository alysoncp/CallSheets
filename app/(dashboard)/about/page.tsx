import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Target, Shield, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">About CallSheets</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            What is CallSheets?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            CallSheets is a comprehensive financial management platform designed specifically for 
            Canadian film and television professionals. Whether you're a performer, crew member, 
            or both, CallSheets helps you track income, manage expenses, and prepare for tax season.
          </p>
          <p className="text-muted-foreground">
            Our platform understands the unique financial needs of entertainment industry professionals, 
            including irregular income patterns, union affiliations, vehicle expenses, and the 
            complexities of Canadian tax law.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              To provide Canadian film and TV professionals with powerful, easy-to-use tools for 
              managing their finances, so they can focus on what they do best—creating great content. 
              We believe that financial management shouldn't be a burden, and we're committed to 
              making tax preparation as simple and stress-free as possible.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Comprehensive income and expense tracking</li>
              <li>Receipt and paystub upload with OCR</li>
              <li>Vehicle mileage and CCA tracking</li>
              <li>Tax calculations based on Canadian tax rules</li>
              <li>GST/HST tracking for registered businesses</li>
              <li>Asset and lease management</li>
              <li>Tax optimization tools for incorporated professionals</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your financial data is important and sensitive. We take security seriously:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>All data is encrypted in transit and at rest</li>
              <li>Secure authentication and authorization</li>
              <li>Your data is stored securely in Canada</li>
              <li>We never share your information with third parties</li>
              <li>You have complete control over your data</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Important Disclaimer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              CallSheets is designed to help you organize and track your financial information. 
              However, it is not a substitute for professional tax advice.
            </p>
            <p className="text-sm text-muted-foreground">
              Always consult with a qualified tax professional or accountant for advice on your 
              specific tax situation and when filing your tax returns. Tax laws and regulations 
              can be complex and may change, and individual circumstances vary.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Version Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            CallSheets is continuously being improved with new features and updates. We're 
            committed to providing you with the best possible experience for managing your 
            financial information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
