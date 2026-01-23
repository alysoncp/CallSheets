"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface TaxCalculationResult {
  grossIncome: number;
  totalExpenses: number;
  netIncome: number;
  taxableIncome: number;
  federalTax: number;
  provincialTax: number;
  cppContribution: number;
  totalTax: number;
  afterTaxIncome: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
}

export default function TaxCalculatorPage() {
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaxCalculationResult | null>(null);

  const calculate = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/tax-calculation?taxYear=${taxYear}`
      );
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error("Error calculating tax:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tax Calculator</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Year</CardTitle>
          <CardDescription>Select the tax year to calculate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="taxYear">Tax Year</Label>
              <Input
                id="taxYear"
                type="number"
                value={taxYear}
                onChange={(e) => setTaxYear(parseInt(e.target.value))}
                min="2020"
                max="2030"
              />
            </div>
            <Button onClick={calculate} disabled={loading}>
              {loading ? "Calculating..." : "Calculate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Income Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Gross Income:</span>
                <span className="font-medium">
                  ${result.grossIncome.toLocaleString("en-CA", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Expenses:</span>
                <span className="font-medium">
                  ${result.totalExpenses.toLocaleString("en-CA", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Net Income:</span>
                <span className="font-medium">
                  ${result.netIncome.toLocaleString("en-CA", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Federal Tax:</span>
                <span className="font-medium">
                  ${result.federalTax.toLocaleString("en-CA", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Provincial Tax:</span>
                <span className="font-medium">
                  ${result.provincialTax.toLocaleString("en-CA", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>CPP Contribution:</span>
                <span className="font-medium">
                  ${result.cppContribution.toLocaleString("en-CA", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total Tax:</span>
                <span>
                  ${result.totalTax.toLocaleString("en-CA", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>After-Tax Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${result.afterTaxIncome.toLocaleString("en-CA", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Rates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Effective Tax Rate:</span>
                <span className="font-medium">
                  {result.effectiveTaxRate.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Marginal Tax Rate:</span>
                <span className="font-medium">
                  {result.marginalTaxRate.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
