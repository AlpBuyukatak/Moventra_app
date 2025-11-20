"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function LoginPage() {
  const [email, setEmail] = useState("alp@test.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed");
      }

      const data = await res.json();

      setToken(data.token);

      if (typeof window !== "undefined") {
        window.localStorage.setItem("token", data.token);
      }
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

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
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          padding: 24,
          borderRadius: 12,
          border: "1px solid #ddd",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>Login</h1>

        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 12 }}
        >
          <label style={{ display: "grid", gap: 4 }}>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: 8,
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 4 }}>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: 8,
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#111827",
              color: "white",
              cursor: "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && (
          <p
            style={{
              color: "red",
              marginTop: 12,
              fontSize: 14,
            }}
          >
            {error}
          </p>
        )}

        {token && (
          <div
            style={{
              marginTop: 16,
              padding: 8,
              borderRadius: 8,
              background: "#ecfdf3",
              fontSize: 12,
              wordBreak: "break-all",
            }}
          >
            <strong>Token:</strong> {token}
          </div>
        )}
      </div>
    </main>
  );
}
