"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, BookOpen, MessageCircle, FileText } from "lucide-react";

export default function HelpPage() {
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(dashboard)/help/page.tsx:9',message:'Dashboard help page rendering',data:{page:'dashboard-help',pathname:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }, []);
  // #endregion
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Help & Support</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Getting Started
            </CardTitle>
            <CardDescription>Learn how to use CallSheets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Setting Up Your Profile</h3>
              <p className="text-sm text-muted-foreground">
                Start by completing your profile in the Profile section. This includes your tax filing status, 
                province, and other important information that affects your tax calculations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Adding Income</h3>
              <p className="text-sm text-muted-foreground">
                Track all your income sources including union and non-union production income, royalties, 
                and residuals. You can upload paystubs and use OCR to automatically extract data.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Managing Expenses</h3>
              <p className="text-sm text-muted-foreground">
                Record all your business expenses with proper categorization. Upload receipts and link 
                them to expense records for easy tracking and tax preparation.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Features Guide
            </CardTitle>
            <CardDescription>Detailed feature information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Vehicle Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Add your vehicles and track mileage. If you claim CCA (Capital Cost Allowance), 
                you can specify the purchase price or CCA balance and select the appropriate CCA class.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tax Calculator</h3>
              <p className="text-sm text-muted-foreground">
                Use the tax calculator to estimate your tax liability based on your income and expenses. 
                Select the tax year from the navbar to calculate for different years.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">GST/HST Tracking</h3>
              <p className="text-sm text-muted-foreground">
                If you have a GST/HST number, you can track your GST/HST collected and paid. 
                This feature is available when you add your GST number to your profile.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Common Questions
            </CardTitle>
            <CardDescription>Frequently asked questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">How do I change the tax year?</h3>
              <p className="text-sm text-muted-foreground">
                Use the tax year selector in the top navigation bar. This affects calculations and 
                data filtering throughout the application.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What is CCA?</h3>
              <p className="text-sm text-muted-foreground">
                CCA (Capital Cost Allowance) is a tax deduction for the depreciation of capital assets 
                like vehicles. You can claim CCA on vehicles used for business purposes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How do I upload receipts?</h3>
              <p className="text-sm text-muted-foreground">
                When adding an expense, you can upload receipt images. The system uses OCR to 
                automatically extract information like date, amount, and merchant name.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Need More Help?
            </CardTitle>
            <CardDescription>Get additional support</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              If you need additional assistance or have questions not covered here, please contact 
              our support team. We're here to help you make the most of CallSheets.
            </p>
            <p className="text-sm text-muted-foreground">
              Remember: This application is designed to help you track and organize your financial 
              information. Always consult with a qualified tax professional for tax advice and 
              filing your returns.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
