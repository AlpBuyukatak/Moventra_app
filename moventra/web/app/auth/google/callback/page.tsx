"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const err = searchParams.get("error");

    // Backend bir hata döndürdüyse
    if (err) {
      setError(err);
      return;
    }

    // URL'de token geldiyse localStorage'a kaydet ve /events'e gönder
    if (token) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("token", token);
      }
      router.replace("/events");
    } else {
      setError("Login token not found in callback URL.");
    }
  }, [searchParams, router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--fg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "1.8rem",
          borderRadius: "1rem",
          border: "1px solid var(--card-border)",
          background:
            "radial-gradient(circle at top, rgba(56,189,248,0.18), transparent 55%), var(--card-bg)",
          boxShadow: "0 18px 40px rgba(15,23,42,0.5)",
          textAlign: "center",
        }}
      >
        {!error ? (
          <>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                margin: "0 auto 12px",
                border: "3px solid rgba(96,165,250,0.8)",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Signing you in with Google…
            </h1>
            <p style={{ fontSize: 14, opacity: 0.8 }}>
              Please wait a moment while we complete your login.
            </p>
          </>
        ) : (
          <>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 8,
                color: "#fca5a5",
              }}
            >
              Google login error
            </h1>
            <p
              style={{
                fontSize: 14,
                opacity: 0.9,
                marginBottom: 16,
              }}
            >
              {error}
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(135deg,#3b82f6,#2563eb,#1d4ed8)",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Back to login
            </button>
          </>
        )}
      </div>

      {/* basit spinner animasyonu için küçük inline keyframes */}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
