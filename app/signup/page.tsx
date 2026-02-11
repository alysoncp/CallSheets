import { getAppBaseUrl } from "@/lib/app-url";
import { SignUpForm } from "./signup-form";

export default function SignUpPage() {
  const baseUrl = getAppBaseUrl();
  return <SignUpForm baseUrl={baseUrl} />;
}
