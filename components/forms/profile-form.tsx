"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userProfileSchema, type UserProfileFormData } from "@/lib/validations/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SubscriptionSection } from "@/components/forms/subscription-section";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DISCLAIMER_VERSION } from "@/lib/constants";

interface ProfileFormProps {
  initialData: any;
  isSetupMode?: boolean;
}

export function ProfileForm({ initialData, isSetupMode = false }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const needsDisclaimerAcceptance = !initialData?.disclaimerAcceptedAt;
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(!needsDisclaimerAcceptance);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema) as Resolver<UserProfileFormData>,
    defaultValues: {
      ...initialData,
      province: "BC",
      ubcpActraStatus: initialData?.ubcpActraStatus ?? "none",
      iatseStatus: initialData?.iatseStatus ?? "none",
    },
  });

  // Watch for conditional field rendering
  const hasAgent = watch("hasAgent");
  const userType = watch("userType");

  const onSubmit = async (data: UserProfileFormData) => {
    setLoading(true);
    setError(null);

    try {
      if (isSetupMode && needsDisclaimerAcceptance) {
        if (!agreedToDisclaimer) {
          throw new Error("You must accept the disclaimer to continue.");
        }

        const disclaimerResponse = await fetch("/api/auth/user", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ acceptDisclaimer: true }),
        });

        if (!disclaimerResponse.ok) {
          const disclaimerErrorData = await disclaimerResponse.json().catch(() => ({}));
          throw new Error(disclaimerErrorData.error || "Failed to record disclaimer acceptance");
        }
      }

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const result = await response.json();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Trigger sidebar refresh
      localStorage.setItem('profileLastUpdate', Date.now().toString());
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: result, bubbles: true }));
      router.refresh();

      // Redirect to dashboard if in setup mode
      if (isSetupMode) {
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(
        onSubmit,
        () => {
          setError('Please fix the form errors before saving');
        }
      )} 
      className="space-y-6"
    >
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
          {isSetupMode 
            ? "Profile completed successfully! Redirecting to dashboard..." 
            : "Profile updated successfully"}
        </div>
      )}

      {/* Personal Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Basic information about you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                {...register("firstName")}
                required={isSetupMode}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                {...register("lastName")}
                required={isSetupMode}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">
                Province <span className="text-destructive">*</span>
              </Label>
              <input type="hidden" {...register("province")} defaultValue="BC" />
              <Input
                id="province"
                value="British Columbia"
                readOnly
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-sm text-muted-foreground">
                Support for other provinces coming soon
              </p>
              {errors.province && (
                <p className="text-sm text-destructive">{errors.province.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">
                User Type <span className="text-destructive">*</span>
              </Label>
              <Select id="userType" {...register("userType")} required={isSetupMode}>
                <option value="">Select user type</option>
                <option value="performer">Performer</option>
                <option value="crew">Crew</option>
                <option value="both">Both</option>
              </Select>
              {userType === "both" && (
                <p className="text-sm text-muted-foreground">
                  Support for separating benefit amounts between UBCP/IATSE coming soon
                </p>
              )}
              {errors.userType && (
                <p className="text-sm text-destructive">{errors.userType.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Union Status Section */}
      <Card>
        <CardHeader>
          <CardTitle>Union Status</CardTitle>
          <CardDescription>Your union membership status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ubcpActraStatus">
                UBCP/ACTRA Status
              </Label>
              <Select id="ubcpActraStatus" {...register("ubcpActraStatus")}>
                <option value="none">None</option>
                <option value="background">Background</option>
                <option value="apprentice">Apprentice</option>
                <option value="full_member">Full Member</option>
              </Select>
              {errors.ubcpActraStatus && (
                <p className="text-sm text-destructive">{errors.ubcpActraStatus.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="iatseStatus">
                IATSE Union Status
              </Label>
              <Select id="iatseStatus" {...register("iatseStatus")}>
                <option value="none">None</option>
                <option value="full">Full</option>
                <option value="permittee">Permittee</option>
              </Select>
              {errors.iatseStatus && (
                <p className="text-sm text-destructive">{errors.iatseStatus.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Information</CardTitle>
          <CardDescription>GST/HST information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasGstNumber"
                  {...register("hasGstNumber")}
                />
                <Label htmlFor="hasGstNumber" className="cursor-pointer">
                  Do you collect GST/HST? <span className="text-destructive">*</span>
                </Label>
              </div>
              {errors.hasGstNumber && (
                <p className="text-sm text-destructive">{errors.hasGstNumber.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Information</CardTitle>
          <CardDescription>Information about your agent or representative</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasAgent"
                {...register("hasAgent")}
              />
              <Label htmlFor="hasAgent" className="cursor-pointer">
                Do you have an agent? <span className="text-destructive">*</span>
              </Label>
            </div>
            {errors.hasAgent && (
              <p className="text-sm text-destructive">{errors.hasAgent.message}</p>
            )}

            {hasAgent && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="agentName">
                    Agent Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="agentName"
                    {...register("agentName")}
                    placeholder="Enter agent name"
                  />
                  {errors.agentName && (
                    <p className="text-sm text-destructive">{errors.agentName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agentCommission">Agent Commission (%)</Label>
                  <Input
                    id="agentCommission"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...register("agentCommission")}
                    placeholder="e.g., 10.00"
                  />
                  {errors.agentCommission && (
                    <p className="text-sm text-destructive">{errors.agentCommission.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <SubscriptionSection subscriptionTier={initialData?.subscriptionTier || "personal"} />

      {isSetupMode && needsDisclaimerAcceptance && (
        <Card>
          <CardHeader>
            <CardTitle>Disclaimer Acceptance</CardTitle>
            <CardDescription>
              You must accept this disclaimer to finish setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <Link
                href="/disclaimer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Read Full Disclaimer
              </Link>
              {" "}({DISCLAIMER_VERSION})
            </p>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="setup-disclaimer"
                checked={agreedToDisclaimer}
                onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
              />
              <Label htmlFor="setup-disclaimer" className="cursor-pointer font-normal leading-snug">
                I acknowledge that this app provides record-keeping and organizational tools only, does not provide tax, accounting, legal, or financial advice, and that I am responsible for verifying all information and consulting a qualified Canadian tax or accounting professional before filing taxes or making financial decisions.
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button 
          type="submit" 
          disabled={loading}
        >
          {loading ? "Saving..." : isSetupMode ? "Complete Profile" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
