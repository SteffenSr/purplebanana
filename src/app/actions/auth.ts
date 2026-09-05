"use server";

import { signIn, signOut } from "@/auth";

/**
 * Sends the user a magic-link email via Auth.js's Resend provider. Called
 * from src/components/LoginForm.tsx. `signIn` redirects on success (throws
 * a special redirect error Next.js handles itself), so there's nothing to
 * return on the happy path.
 */
export async function sendMagicLink(formData: FormData): Promise<void> {
  const email = formData.get("email");
  const callbackUrl = formData.get("callbackUrl");
  await signIn("resend", {
    email,
    redirectTo: typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/",
  });
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
