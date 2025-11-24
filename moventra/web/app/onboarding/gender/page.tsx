"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type MeUser = {
  id: number;
  onboardingCompleted?: boolean;
  gender?: string | null;
};

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export default function OnboardingGenderPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login?from=/onboarding/gender");
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
          router.replace("/login?from=/onboarding/gender");
          return;
        }
        const data = await res.json().catch(() => ({}));
        const u: MeUser | undefined = data.user;
        if (!u) {
          router.replace("/login?from=/onboarding/gender");
          return;
        }
        if (u.onboardingCompleted) {
          router.replace("/events");
          return;
        }
        setUser(u);
        if (u.gender) {
          setGender(u.gender);
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
    if (!gender) {
      setError("Please choose an option.");
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace("/login?from=/onboarding/gender");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gender,
        }),
      });

      router.push("/onboarding/plan");
    } catch (err) {
      console.error(err);
      setError("Could not save your answer.");
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    router.push("/onboarding/birthdate");
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
                width: "80%",
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
            Step 4 of 5
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
          What&apos;s your gender?
        </h1>
        <p
          style={{
            fontSize: 15,
            opacity: 0.75,
            marginBottom: 24,
          }}
        >
          Your gender helps us suggest events and groups that are right for you.
          It won&apos;t be shared with anyone.
        </p>

        {loading ? (
          <p style={{ fontSize: 14, opacity: 0.8 }}>
            Loading your profile...
          </p>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 18,
              }}
            >
              {[
                { id: "female", label: "Female" },
                { id: "male", label: "Male" },
                { id: "non_binary", label: "Non-binary" },
                { id: "prefer_not_say", label: "Prefer not to say" },
              ].map((opt) => {
                const selected = gender === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setGender(opt.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "0.9rem 1rem",
                      borderRadius: 999,
                      border: selected
                        ? "2px solid #6366f1"
                        : "1px solid var(--card-border)",
                      backgroundColor: selected
                        ? "rgba(79,70,229,0.18)"
                        : "var(--card-bg)",
                      color: "var(--fg)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                      }}
                    >
                      {opt.label}
                    </span>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        border: selected
                          ? "5px solid #6366f1"
                          : "2px solid rgba(148,163,184,0.7)",
                        backgroundColor: selected
                          ? "#312e81"
                          : "transparent",
                      }}
                    />
                  </button>
                );
              })}
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
