"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EmailVerifiedPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");

    if (token) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("token", token);
      }

      // ✅ Artık /onboarding
      setTimeout(() => {
        router.replace("/onboarding");
      }, 800);
    } else {
      router.replace("/login");
    }
  }, [params, router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui",
        color: "var(--fg)",
      }}
    >
      <div
        style={{
          padding: "2rem",
          borderRadius: 16,
          border: "1px solid var(--card-border)",
          background: "var(--card-bg)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 22, marginBottom: 10 }}>
          Email Verified Successfully 🎉
        </h2>
        <p style={{ opacity: 0.7, fontSize: 14 }}>
          Redirecting you to onboarding…
        </p>
      </div>
    </main>
  );
}
