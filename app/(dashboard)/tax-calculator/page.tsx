"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaxYear } from "@/lib/contexts/tax-year-context";

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
  const { taxYear } = useTaxYear();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaxCalculationResult | null>(null);

  useEffect(() => {
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

    calculate();
  }, [taxYear]);

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-4 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Tax Calculator</h1>
      </div>

      {loading && (
        <div className="text-center py-4 text-muted-foreground">
          Calculating...
        </div>
      )}

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
