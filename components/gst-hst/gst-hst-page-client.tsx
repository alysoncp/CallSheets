"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaxYear } from "@/lib/contexts/tax-year-context";

interface GstHstData {
  gstCollected: number;
  iitcFromExpenses: number;
  iitcFromAssets: number;
  totalIitc: number;
  netGst: number;
}

export function GstHstPageClient() {
  const { taxYear } = useTaxYear();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GstHstData | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/gst-hst?taxYear=${taxYear}`
      );
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching GST/HST data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxYear]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-4 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6">
        <h1 className="text-2xl font-bold sm:text-3xl">GST/HST Summary</h1>
      </div>

      {loading && (
        <div className="text-center py-4 text-muted-foreground">
          Loading...
        </div>
      )}

      {data && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>GST Collected</CardTitle>
              <CardDescription>Total GST/HST collected on income</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${formatCurrency(data.gstCollected)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>IITC Breakdown</CardTitle>
              <CardDescription>Input Tax Credits by source</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>From Expenses:</span>
                <span className="font-medium">
                  ${formatCurrency(data.iitcFromExpenses)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>From Assets:</span>
                <span className="font-medium">
                  ${formatCurrency(data.iitcFromAssets)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total IITC:</span>
                <span>
                  ${formatCurrency(data.totalIitc)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Net GST</CardTitle>
              <CardDescription>
                GST Collected minus Total IITC
                {data.netGst >= 0 
                  ? " (amount to remit)" 
                  : " (refund/credit)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${
                data.netGst >= 0 ? "text-red-600" : "text-green-600"
              }`}>
                ${formatCurrency(data.netGst)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
