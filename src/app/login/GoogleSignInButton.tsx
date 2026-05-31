"use client";

import { signIn } from "next-auth/react";

export default function GoogleSignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="aether-button aether-button-primary w-full px-4 py-4 text-base font-medium cursor-pointer"
    >
      Sign in with Google
    </button>
  );
}
