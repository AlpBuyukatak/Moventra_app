"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [loadingPasswordLogin, setLoadingPasswordLogin] = useState(false);
  const [loadingCodeRequest, setLoadingCodeRequest] = useState(false);
  const [loadingCodeVerify, setLoadingCodeVerify] = useState(false);

  const [codeRequested, setCodeRequested] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔒 Eğer zaten token varsa bu sayfayı gösterme, /events'e gönder
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("token");
    if (token) {
      router.push("/events");
    }
  }, [router]);

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
      setMessage("Logged in successfully.");
      router.push("/events");
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
      setMessage("Logged in with code.");
      router.push("/events");
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoadingCodeVerify(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
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
          border: "1px solid #1f2937",
          background:
            "radial-gradient(circle at top, rgba(56,189,248,0.1), transparent 55%), #020617",
          boxShadow: "0 18px 50px rgba(15,23,42,0.9)",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          Welcome back
        </h1>
        <p style={{ opacity: 0.75, marginBottom: 20, fontSize: 14 }}>
          Login with password or email code.
        </p>

        {/* ortak email input */}
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
            border: "1px solid #1f2937",
            background: "rgba(15,23,42,0.9)",
            color: "white",
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
              border: "1px solid #1f2937",
              background: "rgba(15,23,42,0.9)",
              color: "white",
            }}
          />

          <button
            type="submit"
            disabled={loadingPasswordLogin}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "0.5rem 0.9rem",
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
            borderTop: "1px solid rgba(148,163,184,0.2)",
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
                border: "1px solid #1f2937",
                background: "rgba(15,23,42,0.9)",
                color: "white",
                letterSpacing: "0.25em",
                textAlign: "center",
              }}
            />

            <button
              type="submit"
              disabled={loadingCodeVerify}
              style={{
                width: "100%",
                padding: "0.5rem 0.9rem",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(135deg, #22c55e, #16a34a, #15803d)",
                color: "black",
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
            opacity: 0.7,
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
      </div>
    </main>
  );
}
