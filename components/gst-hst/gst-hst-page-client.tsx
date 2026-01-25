"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GstHstData {
  gstCollected: number;
  iitcFromExpenses: number;
  iitcFromAssets: number;
  iitcFromLeases: number;
  totalIitc: number;
  netGst: number;
}

export function GstHstPageClient() {
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">GST/HST Summary</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Year</CardTitle>
          <CardDescription>Select the tax year to view GST/HST tracking</CardDescription>
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
            <Button onClick={fetchData} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

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
              <div className="flex justify-between">
                <span>From Leases:</span>
                <span className="font-medium">
                  ${formatCurrency(data.iitcFromLeases)}
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
