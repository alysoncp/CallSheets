"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ArrowLeft } from "lucide-react";
import { DISCLAIMER_VERSION } from "@/lib/constants";

type SubscriptionTier = "basic" | "personal" | "corporate";

export default function SignUpPage() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPlan) {
      setError("Please select a subscription plan");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!agreedToDisclaimer) {
      setError("You must agree to the disclaimer to continue");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Use /auth/confirm for token_hash flow - bypasses PKCE code_verifier cookie issues
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
        data: {
          subscriptionTier: selectedPlan,
          disclaimer_version: DISCLAIMER_VERSION,
          disclaimer_accepted_at: new Date().toISOString(),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a confirmation link to verify your email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please check your email and click the confirmation link to complete your registration.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/signin">Back to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
            <p className="text-muted-foreground">
              Select a subscription plan to get started
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
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
                <Button
                  className="w-full"
                  onClick={() => setSelectedPlan("personal")}
                >
                  Select Personal Plan
                </Button>
              </CardContent>
            </Card>

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedPlan(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>
                Create your account - {selectedPlan === "personal" ? "Personal Plan (Free during beta)" : selectedPlan}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-3 rounded-md border p-3">
              <p className="text-sm text-muted-foreground">
                <Link href="/disclaimer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Read Full Disclaimer
                </Link>
              </p>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="disclaimer"
                  checked={agreedToDisclaimer}
                  onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="disclaimer"
                  className="text-sm font-normal cursor-pointer leading-snug text-muted-foreground"
                >
                  I acknowledge that this app provides record-keeping and organizational tools only, does not provide tax, accounting, legal, or financial advice, and that I am responsible for verifying all information and consulting a qualified Canadian tax or accounting professional before filing taxes or making financial decisions.
                </Label>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
