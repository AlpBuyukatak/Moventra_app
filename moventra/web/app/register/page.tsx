"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type RegisterUser = {
  id: number;
  email: string;
  name: string;
  city?: string | null;
  onboardingCompleted?: boolean;
};

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

  function safeSetToken(token: string) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("token", token);
    }
  }

  // Login ise /events veya onboarding'e at
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
        const user: RegisterUser | undefined = data.user;
        const needsOnboarding = user && user.onboardingCompleted === false;
        if (needsOnboarding) {
          router.replace("/onboarding/purpose");
        } else {
          router.replace("/events");
        }
      } catch {
        // sessiz geç
      }
    })();
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

    // ✅ Artık token beklemiyoruz
    setMessage(
      "Account created. Please check your email and verify your account."
    );

    // İsteğe bağlı: 3 sn sonra login sayfasına gönder
    setTimeout(() => {
      router.push("/login");
    }, 3000);
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
          maxWidth: 960,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
          gap: 32,
          alignItems: "center",
        }}
      >
        {/* Sol panel: tanıtım */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 12,
                background:
                  "conic-gradient(from 120deg,#38bdf8,#6366f1,#f97316,#22c55e,#38bdf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 14px rgba(56,189,248,0.7)",
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                M
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  fontSize: 18,
                }}
              >
                Moventra
              </span>
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                meet people through hobbies
              </span>
            </div>
          </div>

          <h1
            style={{
              fontSize: 32,
              lineHeight: 1.1,
              fontWeight: 800,
            }}
          >
            Create your Moventra account
          </h1>
          <p
            style={{
              fontSize: 15,
              opacity: 0.8,
              maxWidth: 430,
            }}
          >
            Save your favourite hobbies, create events and join meetups around
            the world. It takes less than a minute.
          </p>

          <ul
            style={{
              fontSize: 13,
              opacity: 0.85,
              marginTop: 4,
              paddingLeft: 18,
            }}
          >
            <li>Discover events based on your hobbies and city</li>
            <li>See who created each event and who joined</li>
            <li>Customize your profile and avatar</li>
          </ul>
        </section>

        {/* Sağ panel: register kartı */}
        <section
          style={{
            width: "100%",
            maxWidth: 420,
            marginLeft: "auto",
            marginRight: "auto",
            padding: "1.8rem",
            borderRadius: "1rem",
            border: "1px solid var(--card-border)",
            background:
              "radial-gradient(circle at top, rgba(74,222,128,0.18), transparent 55%), var(--card-bg)",
            boxShadow: "0 18px 40px rgba(15,23,42,0.5)",
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            Sign up
          </h2>
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
                border: "1px solid var(--card-border)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />

            <label style={{ fontSize: 13, opacity: 0.9 }}>
              City (optional)
            </label>
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
                border: "1px solid var(--card-border)",
                background: "var(--bg)",
                color: "var(--fg)",
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
                border: "1px solid var(--card-border)",
                background: "var(--bg)",
                color: "var(--fg)",
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
                border: "1px solid var(--card-border)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />

            <label style={{ fontSize: 13, opacity: 0.9 }}>
              Repeat password
            </label>
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
                border: "1px solid var(--card-border)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.55rem 0.9rem",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(135deg,#4ade80,#22c55e,#16a34a)",
                color: "#020617",
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
              opacity: 0.75,
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
        </section>
      </div>
    </main>
  );
}
