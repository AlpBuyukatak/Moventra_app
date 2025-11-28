"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import CityPickerModal, {
  type LocationSelection,
} from "../components/CityPickerModal";

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
  const { t } = useLanguage();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  // location picker
  const [city, setCity] = useState(""); // backend’e gidecek string
  const [locationLabel, setLocationLabel] = useState("");
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const brandName = t("common.brandName") || "Moventra";
  const tagline =
    (t("nav.taglines.1") as string) || "meet people through hobbies";

  // Eğer zaten login ise: /events veya onboarding'e at
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
          router.replace("/onboarding");
        } else {
          router.replace("/events");
        }
      } catch {
        // sessiz geç
      }
    })();
  }, [router]);

  const handleLocationSelect = (loc: LocationSelection) => {
    const label =
      loc.stateName && loc.countryName
        ? `${loc.stateName}, ${loc.countryName}`
        : loc.stateName || loc.countryName || "";

    setLocationLabel(label);
    setCity(label); // backend’e city olarak gönderilecek
    setLocationModalOpen(false);
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    if (!firstName.trim() || !lastName.trim() || !email || !password) {
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
        body: JSON.stringify({
          email,
          password,
          name: fullName, // profil sayfasındaki user.name buradan gelecek
          city: city || null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Register failed");
        return;
      }

      setMessage(
        "Account created. Please check your email and verify your account."
      );

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

  const cardBackground =
    "radial-gradient(circle at top, rgba(56,189,248,0.22), transparent 55%), var(--card-bg, #020617)";

  return (
    <>
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f3e9",
          color: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1040,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
            gap: 36,
            alignItems: "center",
          }}
        >
          {/* Sol panel: branding + anlatım */}
          <section
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
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
                  {brandName}
                </span>
                <span style={{ fontSize: 13, opacity: 0.75 }}>{tagline}</span>
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
                opacity: 0.82,
                maxWidth: 460,
              }}
            >
              Save your favourite hobbies, create events and join meetups around
              the world. Setting up your account takes less than a minute.
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
              <li>Customize your profile, location and avatar</li>
            </ul>
          </section>

          {/* Sağ panel: Register kartı */}
          <section
            style={{
              width: "100%",
              maxWidth: 420,
              marginLeft: "auto",
              marginRight: "auto",
              padding: "1.9rem 1.9rem 1.7rem",
              borderRadius: 24,
              border: "1px solid rgba(148,163,184,0.5)",
              background: cardBackground,
              boxShadow: "0 22px 55px rgba(15,23,42,0.7)",
              color: "var(--fg, #e5e7eb)",
            }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
              Sign up
            </h2>
            <p style={{ opacity: 0.8, marginBottom: 18, fontSize: 14 }}>
              Join Moventra and start discovering events near you.
            </p>

            <form onSubmit={handleRegister}>
              {/* Ad */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label style={{ fontSize: 13, opacity: 0.9 }}>
                    First name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{
                      width: "100%",
                      marginTop: 4,
                      marginBottom: 8,
                      padding: "0.5rem 0.8rem",
                      borderRadius: 10,
                      border: "1px solid var(--card-border, #1f2937)",
                      background: "var(--bg, #020617)",
                      color: "var(--fg, #e5e7eb)",
                      fontSize: 14,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, opacity: 0.9 }}>
                    Last name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{
                      width: "100%",
                      marginTop: 4,
                      marginBottom: 8,
                      padding: "0.5rem 0.8rem",
                      borderRadius: 10,
                      border: "1px solid var(--card-border, #1f2937)",
                      background: "var(--bg, #020617)",
                      color: "var(--fg, #e5e7eb)",
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>

              {/* Location picker */}
              <label style={{ fontSize: 13, opacity: 0.9 }}>
                Country & city (optional)
              </label>
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                style={{
                  width: "100%",
                  marginTop: 4,
                  marginBottom: 6,
                  padding: "0.55rem 0.85rem",
                  borderRadius: 999,
                  border: "1px solid var(--card-border, #1f2937)",
                  background: "var(--bg, #020617)",
                  color: locationLabel
                    ? "var(--fg, #e5e7eb)"
                    : "rgba(148,163,184,0.9)",
                  fontSize: 14,
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <span>
                  {locationLabel || "Select your country and city"}
                </span>
                <span style={{ fontSize: 11 }}>✦</span>
              </button>
              <p
                style={{
                  fontSize: 11,
                  opacity: 0.7,
                  marginBottom: 12,
                }}
              >
                This helps us suggest nearby events. You can change it later in
                Settings.
              </p>

              {/* Email */}
              <label style={{ fontSize: 13, opacity: 0.9 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 4,
                  marginBottom: 10,
                  padding: "0.5rem 0.8rem",
                  borderRadius: 10,
                  border: "1px solid var(--card-border, #1f2937)",
                  background: "var(--bg, #020617)",
                  color: "var(--fg, #e5e7eb)",
                  fontSize: 14,
                }}
              />

              {/* Password */}
              <label style={{ fontSize: 13, opacity: 0.9 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 4,
                  marginBottom: 10,
                  padding: "0.5rem 0.8rem",
                  borderRadius: 10,
                  border: "1px solid var(--card-border, #1f2937)",
                  background: "var(--bg, #020617)",
                  color: "var(--fg, #e5e7eb)",
                  fontSize: 14,
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
                  marginBottom: 16,
                  padding: "0.5rem 0.8rem",
                  borderRadius: 10,
                  border: "1px solid var(--card-border, #1f2937)",
                  background: "var(--bg, #020617)",
                  color: "var(--fg, #e5e7eb)",
                  fontSize: 14,
                }}
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.95rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg, #3b82f6, #2563eb, #1d4ed8)",
                  color: "#f9fafb",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: loading ? 0.75 : 1,
                  boxShadow: "0 16px 36px rgba(37,99,235,0.55)",
                }}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            {error && (
              <p
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: "#fecaca",
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
                opacity: 0.8,
                textAlign: "center",
              }}
            >
              Already have an account?{" "}
              <span
                onClick={() => router.push("/login")}
                style={{ color: "#93c5fd", cursor: "pointer" }}
              >
                Login
              </span>
            </p>
          </section>
        </div>
      </main>

      {/* Ülke / şehir seçme modali */}
      <CityPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSelect={handleLocationSelect}
      />
    </>
  );
}
