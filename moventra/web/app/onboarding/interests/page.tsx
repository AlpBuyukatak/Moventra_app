"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type MeUser = {
  id: number;
  onboardingCompleted?: boolean;
};

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

const ALL_TAGS = [
  "Sports & outdoors",
  "Board games & chess",
  "Language exchange",
  "Live music & concerts",
  "Tech & coding",
  "Art & drawing",
  "Photography & film",
  "Food & cooking",
  "Travel & hiking",
  "Fitness & gym",
];

export default function OnboardingInterestsPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login?from=/onboarding/interests");
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
          router.replace("/login?from=/onboarding/interests");
          return;
        }

        const data = await res.json().catch(() => ({}));
        const u: MeUser | undefined = data.user;
        if (!u) {
          router.replace("/login?from=/onboarding/interests");
          return;
        }
        if (u.onboardingCompleted) {
          router.replace("/events");
          return;
        }

        setUser(u);

        // İstersen burada backend’ten daha önce seçilmiş hobileri okuyup set edebilirsin.
      } catch (err) {
        console.error(err);
        setError("Could not load your profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  function toggleTag(tag: string) {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleContinue() {
    setError(null);

    if (!selected.length) {
      setError("Please select at least one interest or skip this step.");
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace("/login?from=/onboarding/interests");
      return;
    }

    try {
      setSaving(true);

      // Şimdilik seçilen hobileri backend’e göndermiyoruz;
      // sadece sonraki adıma geçiyoruz.
      // İleride istersen buradan /user-hobbies endpoint’ine kaydederiz.

      router.push("/onboarding/birthdate");
    } catch (err) {
      console.error(err);
      setError("Could not save your interests.");
    } finally {
      setSaving(false);
    }
  }

  function handleSkip() {
    router.push("/onboarding/birthdate");
  }

  function handleBack() {
    router.push("/onboarding/purpose");
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
                width: "40%",
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
            Step 2 of 5
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
          What are you interested in?
        </h1>
        <p
          style={{
            fontSize: 15,
            opacity: 0.75,
            marginBottom: 20,
          }}
        >
          Choose a few topics you like. We’ll use them to suggest events and
          groups you might enjoy.
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
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 18,
              }}
            >
              {ALL_TAGS.map((tag) => {
                const active = selected.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: 999,
                      border: active
                        ? "2px solid #22c55e"
                        : "1px solid var(--card-border)",
                      backgroundColor: active
                        ? "rgba(34,197,94,0.15)"
                        : "var(--card-bg)",
                      color: "var(--fg)",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {error && (
              <p
                style={{
                  fontSize: 13,
                  color: "#fca5a5",
                  marginBottom: 10,
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

              <div style={{ display: "flex", gap: 8 }}>
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
                  Skip
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
            </div>
          </>
        )}
      </div>
    </main>
  );
}
