"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type MeUser = {
  id: number;
  onboardingCompleted?: boolean;
  planType?: string | null;
};

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export default function OnboardingPlanPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login?from=/onboarding/plan");
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
          router.replace("/login?from=/onboarding/plan");
          return;
        }
        const data = await res.json().catch(() => ({}));
        const u: MeUser | undefined = data.user;
        if (!u) {
          router.replace("/login?from=/onboarding/plan");
          return;
        }
        if (u.onboardingCompleted) {
          router.replace("/events");
          return;
        }
        setUser(u);
      } catch (err) {
        console.error(err);
        setError("Could not load your profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function handleFinish() {
    const token = getToken();
    if (!token) {
      router.replace("/login?from=/onboarding/plan");
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
          planType: "free",
          onboardingCompleted: true,
        }),
      });

      router.replace("/events");
    } catch (err) {
      console.error(err);
      setError("Could not finish onboarding.");
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    router.push("/onboarding/gender");
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
                width: "100%",
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
            Step 5 of 5
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
          Join Moventra+
        </h1>
        <p
          style={{
            fontSize: 15,
            opacity: 0.75,
            marginBottom: 24,
          }}
        >
          Good news: Moventra is currently{" "}
          <strong>completely free</strong> to use. You can create and join
          events without paying anything.
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
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  borderRadius: 18,
                  padding: "1rem 1.1rem",
                  border: "2px solid #22c55e",
                  background:
                    "linear-gradient(135deg,rgba(34,197,94,0.16),rgba(15,23,42,0.95))",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    Free plan
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      opacity: 0.8,
                    }}
                  >
                    Create and join events, save your hobbies and chat with
                    people – all for free.
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#bbf7d0",
                  }}
                >
                  €0 / month
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  padding: "0.85rem 1.1rem",
                  border: "1px dashed rgba(148,163,184,0.6)",
                  backgroundColor: "rgba(15,23,42,0.85)",
                  fontSize: 13,
                  opacity: 0.85,
                }}
              >
                In the future we may add optional paid features for organizers,
                but your basic Moventra experience will stay free.
              </div>
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
                onClick={handleFinish}
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
                {saving ? "Finishing..." : "Finish and go to events"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
