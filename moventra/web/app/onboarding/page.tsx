"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * /onboarding → otomatik olarak ilk adıma (purpose) yönlendirir.
 */
export default function OnboardingIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/onboarding/purpose");
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <p style={{ opacity: 0.7, fontSize: 14 }}>Loading onboarding…</p>
    </main>
  );
}
