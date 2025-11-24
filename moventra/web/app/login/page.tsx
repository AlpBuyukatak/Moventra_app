"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const HERO_TAGS = [
  "🎲 Board game nights",
  "🚴‍♀️ Cycling meetups",
  "☕ Language exchange",
];

type LoginUser = {
  id: number;
  email: string;
  name: string;
  city?: string | null;
  createdAt?: string;
  onboardingCompleted?: boolean;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [loadingPasswordLogin, setLoadingPasswordLogin] = useState(false);
  const [loadingCodeRequest, setLoadingCodeRequest] = useState(false);
  const [loadingCodeVerify, setLoadingCodeVerify] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const [codeRequested, setCodeRequested] = useState(false);

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeMessage, setCodeMessage] = useState<string | null>(null);

  // resend verification state
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  const [activeTagIndex, setActiveTagIndex] = useState(0);

  const redirectAfterLogin = searchParams.get("from") || "/profile";

  function safeSetToken(token: string) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("token", token);
    }
  }

  function goAfterLogin(user?: LoginUser | null) {
    const needsOnboarding = user && user.onboardingCompleted === false;
    if (needsOnboarding) {
      router.push("/onboarding/purpose");
    } else {
      router.push(redirectAfterLogin);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          window.localStorage.removeItem("token");
          return;
        }
        const data = await res.json().catch(() => ({}));
        const user: LoginUser | undefined = data.user;
        const needsOnboarding = user && user.onboardingCompleted === false;
        if (needsOnboarding) {
          router.replace("/onboarding/purpose");
        } else {
          router.replace("/profile");
        }
      } catch {
        // sessiz geç
      }
    })();
  }, [router]);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveTagIndex((prev) => (prev + 1) % HERO_TAGS.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setCodeError(null);
    setCodeMessage(null);
    setEmailNotVerified(false);
    setResendStatus(null);
    setResendError(null);

    if (!email || !password) {
      setPasswordError("Please enter email and password.");
      return;
    }

    try {
      setLoadingPasswordLogin(true);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (
          res.status === 403 &&
          typeof data.error === "string" &&
          data.error.toLowerCase().includes("verify your email")
        ) {
          setEmailNotVerified(true);
        }
        setPasswordError(data.error || "Login failed");
        return;
      }

      if (!data.token) {
        setPasswordError("No token returned from server.");
        return;
      }

      safeSetToken(data.token);
      const user: LoginUser | undefined = data.user;
      goAfterLogin(user || null);
    } catch (err) {
      console.error(err);
      setPasswordError("Network error");
    } finally {
      setLoadingPasswordLogin(false);
    }
  }

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setCodeError(null);
    setCodeMessage(null);
    setEmailNotVerified(false);
    setResendStatus(null);
    setResendError(null);

    if (!email) {
      setCodeError("Please enter your email first.");
      return;
    }

    try {
      setLoadingCodeRequest(true);
      const res = await fetch(`${API_URL}/auth/request-login-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setCodeError(data.error || "Could not send code.");
        return;
      }

      setCodeRequested(true);
      setCodeMessage("If this email exists, a login code has been sent.");
    } catch (err) {
      console.error(err);
      setCodeError("Network error");
    } finally {
      setLoadingCodeRequest(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setCodeError(null);
    setCodeMessage(null);
    setEmailNotVerified(false);
    setResendStatus(null);
    setResendError(null);

    if (!email || !code) {
      setCodeError("Please enter email and code.");
      return;
    }

    try {
      setLoadingCodeVerify(true);
      const res = await fetch(`${API_URL}/auth/verify-login-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (
          res.status === 403 &&
          typeof data.error === "string" &&
          data.error.toLowerCase().includes("verify your email")
        ) {
          setEmailNotVerified(true);
        }
        setCodeError(data.error || "Invalid or expired code.");
        return;
      }

      if (!data.token) {
        setCodeError("No token returned from server.");
        return;
      }

      safeSetToken(data.token);
      const user: LoginUser | undefined = data.user;
      goAfterLogin(user || null);
    } catch (err) {
      console.error(err);
      setCodeError("Network error");
    } finally {
      setLoadingCodeVerify(false);
    }
  }

  // RESEND VERIFICATION EMAIL
  async function handleResendVerification() {
    setResendError(null);
    setResendStatus(null);

    if (!email) {
      setResendError("Please enter your email above first.");
      return;
    }

    try {
      setResendLoading(true);
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setResendError(data.error || "Could not resend verification email.");
        return;
      }

      setResendStatus(
        data.message ||
          "If this email exists, a verification link has been sent."
      );
    } catch (err) {
      console.error(err);
      setResendError("Network error while resending verification email.");
    } finally {
      setResendLoading(false);
    }
  }

  function handleGoogleLogin() {
    setPasswordError(null);
    setCodeError(null);
    setCodeMessage(null);
    setEmailNotVerified(false);
    setResendStatus(null);
    setResendError(null);

    if (typeof window === "undefined") return;

    setLoadingGoogle(true);

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const url = `${API_URL}/auth/google/start?redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;

    window.location.href = url;
  }

  function handleLogoClick() {
    router.push("/events");
  }

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
          maxWidth: 980,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 1fr)",
          gap: 32,
          alignItems: "center",
        }}
      >
        {/* Sol panel */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <button
            onClick={handleLogoClick}
            style={{
              padding: 0,
              margin: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  background:
                    "conic-gradient(from 120deg,#38bdf8,#6366f1,#f97316,#22c55e,#38bdf8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 22px rgba(56,189,248,0.8)",
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  M
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontWeight: 800,
                    letterSpacing: 0.4,
                    fontSize: 22,
                  }}
                >
                  Moventra
                </span>
                <span style={{ fontSize: 13, opacity: 0.75 }}>
                  meet people through hobbies
                </span>
              </div>
            </div>
          </button>

          <h1
            style={{
              fontSize: 34,
              lineHeight: 1.1,
              fontWeight: 800,
            }}
          >
            Welcome back 👋
          </h1>
          <p
            style={{
              fontSize: 15,
              opacity: 0.82,
              maxWidth: 440,
            }}
          >
            Log in to join events, track your hobbies and meet people with
            similar interests. You can use your password, a one-time email code
            or sign in with Google.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              fontSize: 12,
            }}
          >
            {HERO_TAGS.map((tag, index) => {
              const isActive = index === activeTagIndex;
              return (
                <span
                  key={tag}
                  style={{
                    padding: "0.25rem 0.9rem",
                    borderRadius: 999,
                    border: isActive
                      ? "1px solid rgba(59,130,246,0.9)"
                      : "1px solid var(--card-border)",
                    background: isActive
                      ? "linear-gradient(135deg,rgba(59,130,246,0.3),rgba(56,189,248,0.2))"
                      : "transparent",
                    boxShadow: isActive
                      ? "0 0 20px rgba(59,130,246,0.45)"
                      : "none",
                    opacity: isActive ? 1 : 0.6,
                    transform: isActive ? "scale(1.02)" : "scale(0.98)",
                    transition:
                      "opacity 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease, background 0.25s ease",
                  }}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </section>

        {/* Sağ panel */}
        <section
          style={{
            width: "100%",
            maxWidth: 420,
            marginLeft: "auto",
            marginRight: "auto",
            padding: "1.9rem",
            borderRadius: "1.2rem",
            border: "1px solid var(--card-border)",
            background:
              "radial-gradient(circle at top, rgba(56,189,248,0.18), transparent 55%), var(--card-bg)",
            boxShadow: "0 18px 40px rgba(15,23,42,0.55)",
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            Sign in
          </h2>
          <p style={{ opacity: 0.75, marginBottom: 16, fontSize: 14 }}>
            Login with your password, a one-time email code or Google.
          </p>

          {/* GOOGLE */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            style={{
              width: "100%",
              marginBottom: 14,
              padding: "0.55rem 0.9rem",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.6)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: loadingGoogle ? 0.7 : 1,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.02 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.14-3.08-.39-4.55H24v9.02h12.94c-.56 2.9-2.25 5.37-4.78 7.04l7.73 6c4.52-4.18 7.09-10.36 7.09-17.51z"
              />
              <path
                fill="#FBBC05"
                d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.12.79-4.54l-7.98-6.19A23.86 23.86 0 0 0 0 24c0 3.82.92 7.42 2.56 10.63l7.98-6.04z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.9-5.82l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-3.52-13.86-8.69l-7.98 6.04C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span>
              {loadingGoogle ? "Connecting to Google..." : "Continue with Google"}
            </span>
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
              fontSize: 11,
              opacity: 0.7,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgba(148,163,184,0.4)",
              }}
            />
            <span>or sign in with email</span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgba(148,163,184,0.4)",
              }}
            />
          </div>

          {/* EMAIL */}
          <label style={{ fontSize: 13, opacity: 0.9 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              marginTop: 4,
              marginBottom: 10,
              padding: "0.45rem 0.7rem",
              borderRadius: 8,
              border: "1px solid var(--card-border)",
              background: "var(--bg)",
              color: "var(--fg)",
            }}
          />

          {/* PASSWORD LOGIN */}
          <form onSubmit={handlePasswordLogin} style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 13, opacity: 0.9 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                marginTop: 4,
                marginBottom: 8,
                padding: "0.45rem 0.7rem",
                borderRadius: 8,
                border: "1px solid var(--card-border)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />

            <button
              type="submit"
              disabled={loadingPasswordLogin}
              style={{
                width: "100%",
                marginTop: 4,
                padding: "0.55rem 0.9rem",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(135deg, #3b82f6, #2563eb, #1d4ed8)",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                opacity: loadingPasswordLogin ? 0.7 : 1,
              }}
            >
              {loadingPasswordLogin ? "Logging in..." : "Login with password"}
            </button>
          </form>

          {/* PASSWORD HATA + RESEND VERIFICATION */}
          {passwordError && (
            <p
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "#fca5a5",
              }}
            >
              {passwordError}
            </p>
          )}

          {emailNotVerified && (
            <div
              style={{
                marginTop: 6,
                marginBottom: 8,
                fontSize: 12,
              }}
            >
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                style={{
                  padding: "0.2rem 0",
                  border: "none",
                  background: "none",
                  color: "#60a5fa",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {resendLoading
                  ? "Sending verification email..."
                  : "Resend verification email"}
              </button>
              {resendError && (
                <p
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: "#fca5a5",
                  }}
                >
                  {resendError}
                </p>
              )}
              {resendStatus && (
                <p
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: "#bbf7d0",
                  }}
                >
                  {resendStatus}
                </p>
              )}
            </div>
          )}

          <p
            style={{
              fontSize: 12,
              opacity: 0.75,
              marginBottom: 16,
              textAlign: "right",
            }}
          >
            Forgot your password?{" "}
            <span
              style={{ color: "#60a5fa", cursor: "pointer" }}
              onClick={() => router.push("/forgot-password")}
            >
              Reset it
            </span>
          </p>

          <div
            style={{
              borderTop: "1px solid rgba(148,163,184,0.25)",
              marginBottom: 16,
              marginTop: 4,
            }}
          />

          {/* MAGIC LOGIN – email verify zorunluluğu yüzünden,
              emailNotVerified iken komple gizliyoruz */}
          {!emailNotVerified && (
            <>
              <form onSubmit={handleRequestCode} style={{ marginBottom: 8 }}>
                <button
                  type="submit"
                  disabled={loadingCodeRequest}
                  style={{
                    width: "100%",
                    padding: "0.45rem 0.9rem",
                    borderRadius: 999,
                    border: "1px solid rgba(59,130,246,0.9)",
                    background: "transparent",
                    color: "#bfdbfe",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    opacity: loadingCodeRequest ? 0.7 : 1,
                  }}
                >
                  {loadingCodeRequest
                    ? "Sending code..."
                    : "Send login code to my email"}
                </button>
              </form>

              {codeRequested && (
                <form onSubmit={handleVerifyCode} style={{ marginTop: 8 }}>
                  <label style={{ fontSize: 13, opacity: 0.9 }}>
                    Enter the 6-digit code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    style={{
                      width: "100%",
                      marginTop: 4,
                      marginBottom: 8,
                      padding: "0.45rem 0.7rem",
                      borderRadius: 8,
                      border: "1px solid var(--card-border)",
                      background: "var(--bg)",
                      color: "var(--fg)",
                      letterSpacing: "0.25em",
                      textAlign: "center",
                    }}
                  />

                  <button
                    type="submit"
                    disabled={loadingCodeVerify}
                    style={{
                      width: "100%",
                      padding: "0.55rem 0.9rem",
                      borderRadius: 999,
                      border: "none",
                      background:
                        "linear-gradient(135deg, #22c55e, #16a34a, #15803d)",
                      color: "#020617",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      opacity: loadingCodeVerify ? 0.7 : 1,
                    }}
                  >
                    {loadingCodeVerify ? "Verifying..." : "Login with code"}
                  </button>
                </form>
              )}

              {codeError && (
                <p
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    color: "#fca5a5",
                  }}
                >
                  {codeError}
                </p>
              )}
              {codeMessage && (
                <p
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: "#bbf7d0",
                  }}
                >
                  {codeMessage}
                </p>
              )}
            </>
          )}

          <p
            style={{
              marginTop: 18,
              fontSize: 13,
              opacity: 0.75,
              textAlign: "center",
            }}
          >
            Don&apos;t have an account?{" "}
            <span
              onClick={() => router.push("/register")}
              style={{ color: "#60a5fa", cursor: "pointer" }}
            >
              Register
            </span>
          </p>
        </section>
      </div>
    </main>
  );
}
