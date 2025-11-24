"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const HERO_TAGS = [
  "🎲 Board game nights",
  "🚴‍♀️ Cycling meetups",
  "☕ Language exchange",
];

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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeTagIndex, setActiveTagIndex] = useState(0);

  const redirectAfterLogin = searchParams.get("from") || "/events";

  // Zaten login ise /events'e yönlendir
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("token");
    if (token) {
      router.replace("/events");
    }
  }, [router]);

  // Soldaki bullet yazıları sırayla highlight et
  useEffect(() => {
    const id = setInterval(() => {
      setActiveTagIndex((prev) => (prev + 1) % HERO_TAGS.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  function safeSetToken(token: string) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("token", token);
    }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError("Please enter email and password.");
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
        setError(data.error || "Login failed");
        return;
      }

      if (!data.token) {
        setError("No token returned from server.");
        return;
      }

      safeSetToken(data.token);
      router.push(redirectAfterLogin);
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoadingPasswordLogin(false);
    }
  }

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Please enter your email first.");
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
        setError(data.error || "Could not send code.");
        return;
      }

      setCodeRequested(true);
      setMessage("If this email exists, a login code has been sent.");
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoadingCodeRequest(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !code) {
      setError("Please enter email and code.");
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
        setError(data.error || "Invalid or expired code.");
        return;
      }

      if (!data.token) {
        setError("No token returned from server.");
        return;
      }

      safeSetToken(data.token);
      router.push(redirectAfterLogin);
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoadingCodeVerify(false);
    }
  }

  // GOOGLE LOGIN
  function handleGoogleLogin() {
    setError(null);
    setMessage(null);

    if (typeof window === "undefined") return;

    setLoadingGoogle(true);

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const url = `${API_URL}/auth/google/start?redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;

    window.location.href = url;
  }

  // Logo tıklandığında event sayfasına git
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
        {/* Sol panel: branding + dinamik yazılar */}
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

        {/* Sağ panel: login kartı */}
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

          {/* GOOGLE BUTTON */}
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
            <span style={{ fontSize: 16 }}>🟦</span>
            <span>
              {loadingGoogle ? "Redirecting to Google..." : "Continue with Google"}
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

          {/* Ortak email input */}
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

          {/* Forgot password link */}
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

          {/* EMAIL CODE LOGIN */}
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

          {error && (
            <p
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "#fca5a5",
              }}
            >
              {error}
            </p>
          )}

          {message && (
            <p
              style={{
                marginTop: 8,
                fontSize: 13,
                color: "#bbf7d0",
              }}
            >
              {message}
            </p>
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
