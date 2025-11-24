"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type MeUser = {
  id: number;
  email: string;
  name: string;
  onboardingCompleted?: boolean;
  onboardingPurpose?: string | null;
};

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export default function OnboardingPurposePage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [purpose, setPurpose] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // token + /auth/me
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login?from=/onboarding/purpose");
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
          router.replace("/login?from=/onboarding/purpose");
          return;
        }
        const data = await res.json().catch(() => ({}));
        const u: MeUser | undefined = data.user;
        if (!u) {
          router.replace("/login?from=/onboarding/purpose");
          return;
        }
        if (u.onboardingCompleted) {
          router.replace("/events");
          return;
        }
        setUser(u);
        if (u.onboardingPurpose) {
          setPurpose(u.onboardingPurpose);
        }
      } catch {
        setError("Could not load your profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function handleContinue() {
    if (!purpose) {
      setError("Please choose one option to continue.");
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace("/login?from=/onboarding/purpose");
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
          onboardingPurpose: purpose,
        }),
      });

      router.push("/onboarding/interests");
    } catch (err) {
      console.error(err);
      setError("Could not save your answer.");
    } finally {
      setSaving(false);
    }
  }

  function handleSkip() {
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
      <div
        style={{
          width: "100%",
          maxWidth: 720,
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            marginBottom: 32,
          }}
        >
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
                width: "20%",
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
            Step 1 of 5
          </p>
        </div>

        <h1
          style={{
            fontSize: 32,
            lineHeight: 1.1,
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          What brings you to Moventra?
        </h1>
        <p
          style={{
            fontSize: 15,
            opacity: 0.75,
            marginBottom: 24,
          }}
        >
          Choose what you&apos;d like to do first, and we&apos;ll guide you from
          there.
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
                marginBottom: 24,
              }}
            >
              {[
                {
                  id: "find_join",
                  title: "Find groups and join events",
                  desc: "I want to explore events and meet people.",
                },
                {
                  id: "create_host",
                  title: "Create groups and organize events",
                  desc: "I plan to host events and build a community.",
                },
                {
                  id: "both",
                  title: "Not sure yet – open to both",
                  desc: "I might join and host events in the future.",
                },
              ].map((opt) => {
                const selected = purpose === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPurpose(opt.id)}
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
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                        }}
                      >
                        {opt.title}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          opacity: 0.78,
                        }}
                      >
                        {opt.desc}
                      </div>
                    </div>
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
                  marginBottom: 12,
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
                marginTop: 8,
              }}
            >
              <button
                type="button"
                onClick={handleSkip}
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
                Skip for now
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
