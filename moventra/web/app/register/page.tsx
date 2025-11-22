"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // 🔒 Zaten login ise register sayfasına gelmesin
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("token");
    if (token) {
      router.push("/events");
    }
  }, [router]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !name || !password) {
      setError("Please fill all required fields.");
      return;
    }

    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, city }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Register failed");
        return;
      }

      setMessage("Account created. You can now login.");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
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
            "radial-gradient(circle at top, rgba(96,165,250,0.12), transparent 55%), #020617",
          boxShadow: "0 18px 50px rgba(15,23,42,0.9)",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          Create account
        </h1>
        <p style={{ opacity: 0.75, marginBottom: 20, fontSize: 14 }}>
          Join Moventra and start discovering events.
        </p>

        <form onSubmit={handleRegister}>
          <label style={{ fontSize: 13, opacity: 0.9 }}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

          <label style={{ fontSize: 13, opacity: 0.9 }}>City (optional)</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
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

          <label style={{ fontSize: 13, opacity: 0.9 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          <label style={{ fontSize: 13, opacity: 0.9 }}>Repeat password</label>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            style={{
              width: "100%",
              marginTop: 4,
              marginBottom: 12,
              padding: "0.45rem 0.7rem",
              borderRadius: 8,
              border: "1px solid #1f2937",
              background: "rgba(15,23,42,0.9)",
              color: "white",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.5rem 0.9rem",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg,#4ade80,#22c55e,#16a34a)",
              color: "black",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

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
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            style={{ color: "#60a5fa", cursor: "pointer" }}
          >
            Login
          </span>
        </p>
      </div>
    </main>
  );
}
