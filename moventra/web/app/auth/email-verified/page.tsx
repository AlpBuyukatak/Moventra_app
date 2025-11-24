"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EmailVerifiedPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    // URL'den token'i çek
    const token = params.get("token");

    if (token) {
      // localStorage’a kaydet
      if (typeof window !== "undefined") {
        window.localStorage.setItem("token", token);
      }

      // 1 saniye sonra onboarding’e yönlendir
      setTimeout(() => {
        router.replace("/onboarding/purpose");
      }, 800);
    } else {
      // token yoksa login’e geri dön
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
        color: "var(--fg)"
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
