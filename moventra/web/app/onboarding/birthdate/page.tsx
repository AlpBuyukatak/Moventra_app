"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type MeUser = {
  id: number;
  onboardingCompleted?: boolean;
  birthDate?: string | null;
};

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export default function OnboardingBirthdatePage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login?from=/onboarding/birthdate");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("token");
          }
          router.replace("/login?from=/onboarding/birthdate");
          return;
        }
        const data = await res.json().catch(() => ({}));
        const u: MeUser | undefined = data.user;
        if (!u) {
          router.replace("/login?from=/onboarding/birthdate");
          return;
        }
        if (u.onboardingCompleted) {
          router.replace("/events");
          return;
        }
        setUser(u);
        if (u.birthDate) {
          setBirthDate(u.birthDate.slice(0, 10));
        }
      } catch (err) {
        console.error(err);
        setError("Could not load your profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function handleContinue() {
    setError(null);

    if (!birthDate) {
      setError("Please enter your date of birth.");
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace("/login?from=/onboarding/birthdate");
      return;
    }

    try {
      setSaving(true);
      await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          birthDate,
        }),
      });

      router.push("/onboarding/gender");
    } catch (err) {
      console.error(err);
      setError("Could not save your birth date.");
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    router.push("/onboarding/interests");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--fg)",
        display: "flex",
        justifyContent: "center",
        padding: "40px 16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 720 }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              height: 4,
              borderRadius: 999,
              backgroundColor: "rgba(148,163,184,0.3)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "60%",
                height: "100%",
                background:
                  "linear-gradient(90deg,#6366f1,#38bdf8,#22c55e)",
              }}
            />
          </div>
          <p
            style={{
              marginTop: 8,
              fontSize: 12,
              opacity: 0.7,
            }}
          >
            Step 3 of 5
          </p>
        </div>

        <h1
          style={{
            fontSize: 30,
            lineHeight: 1.1,
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          Let&apos;s get to know you!
        </h1>
        <p
          style={{
            fontSize: 15,
            opacity: 0.75,
            marginBottom: 24,
          }}
        >
          Enter your date of birth. Knowing your age helps us find the right
          events and groups for you. It won&apos;t be shared with anyone.
        </p>

        {loading ? (
          <p style={{ fontSize: 14, opacity: 0.8 }}>
            Loading your profile...
          </p>
        ) : (
          <>
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  fontSize: 13,
                  opacity: 0.9,
                }}
              >
                Date
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 4,
                  padding: "0.55rem 0.8rem",
                  borderRadius: 10,
                  border: "1px solid var(--card-border)",
                  backgroundColor: "var(--card-bg)",
                  color: "var(--fg)",
                  fontSize: 14,
                }}
              />
            </div>

            {error && (
              <p
                style={{
                  fontSize: 13,
                  color: "#fca5a5",
                  marginBottom: 8,
                }}
              >
                {error}
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginTop: 12,
              }}
            >
              <button
                type="button"
                onClick={handleBack}
                style={{
                  padding: "0.65rem 1.4rem",
                  borderRadius: 999,
                  border: "1px solid var(--card-border)",
                  background: "transparent",
                  color: "var(--fg)",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleContinue}
                disabled={saving}
                style={{
                  padding: "0.65rem 1.4rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#6366f1,#38bdf8,#22c55e)",
                  color: "#020617",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving..." : "Continue"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
