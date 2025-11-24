"use client";

import type React from "react";
import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type User = {
  id: number;
  email: string;
  name: string;
  city?: string | null;
  createdAt?: string;
  onboardingPurpose?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  planType?: string | null;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function getToken() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("token");
  }

  // Sayfa açılınca current user'ı çek
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login?from=/profile");
      return;
    }

    async function fetchMe() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("token");
          }
          router.replace("/login?from=/profile");
          return;
        }

        const data = await res.json().catch(() => ({} as any));

        if (!res.ok || !data.user) {
          setError(data.error || "Could not load profile.");
          return;
        }

        const u: User = data.user;
        setUser(u);
        setName(u.name || "");
        setCity(u.city || "");
      } catch (err) {
        console.error(err);
        setError("Network error while loading profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, [router]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const token = getToken();
    if (!token) {
      router.replace("/login?from=/profile");
      return;
    }

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          city: city.trim() || null,
        }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data.user) {
        setError(data.error || "Could not update profile.");
        return;
      }

      setUser(data.user);
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Network error while saving profile.");
    } finally {
      setSaving(false);
    }
  }

  // Basit avatar initials (navbar’daki harfle uyumlu olsun)
  const initials =
    (user?.name &&
      user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")) ||
    (user?.email ? user.email[0]?.toUpperCase() : "M");

  const firstName =
    user?.name?.trim().split(/\s+/)[0] || user?.email?.split("@")[0] || "there";

  // Şimdilik dummy interest listesi (ileride UserHobby’den dolduracağız)
  const demoInterests = ["Adventure", "Outdoor Adventures", "Outdoor Fitness"];

  return (
    <main
      style={{
        minHeight: "80vh",
        paddingTop: 24,
        paddingBottom: 40,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1150, margin: "0 auto" }}>
        {/* Üst başlık */}
        <header style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 32,
              lineHeight: 1.1,
              fontWeight: 800,
              marginBottom: 4,
            }}
          >
            What are you up to, {firstName}?
          </h1>
          <p
            style={{
              fontSize: 14,
              opacity: 0.75,
            }}
          >
            Plan new events, explore groups and manage your Moventra profile
            from here.
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.5fr)",
            gap: 24,
            alignItems: "flex-start",
          }}
        >
          {/* SOL SÜTUN – Meetup tarzı kartlar */}
          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {/* Your events */}
            <div
              style={{
                borderRadius: 20,
                border: "1px solid var(--card-border)",
                background: "var(--card-bg)",
                padding: "1.1rem 1.2rem",
                boxShadow: "0 10px 24px rgba(15,23,42,0.22)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  Your events
                </h2>
                <button
                  type="button"
                  onClick={() => router.push("/events")}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 12,
                    color: "#60a5fa",
                    cursor: "pointer",
                  }}
                >
                  See all
                </button>
              </div>

              <p
                style={{
                  fontSize: 13,
                  opacity: 0.7,
                  margin: "8px 0 14px",
                }}
              >
                No plans yet? Let&apos;s fix that!
              </p>

              <button
                type="button"
                onClick={() => router.push("/events")}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.9rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#3b82f6,#2563eb,#1d4ed8)",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Find events
              </button>
            </div>

            {/* Your groups */}
            <div
              style={{
                borderRadius: 20,
                border: "1px solid var(--card-border)",
                background: "var(--card-bg)",
                padding: "1.1rem 1.2rem",
                boxShadow: "0 10px 24px rgba(15,23,42,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  Your groups
                </h2>
                <button
                  type="button"
                  onClick={() => router.push("/events")}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 12,
                    color: "#60a5fa",
                    cursor: "pointer",
                  }}
                >
                  See all
                </button>
              </div>

              <p
                style={{
                  fontSize: 13,
                  opacity: 0.7,
                  margin: "8px 0 14px",
                }}
              >
                Join a group that shares your passions – and start connecting
                today.
              </p>

              <button
                type="button"
                onClick={() => router.push("/events")}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.9rem",
                  borderRadius: 999,
                  border: "1px solid var(--card-border)",
                  background: "transparent",
                  color: "var(--fg)",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Explore groups near you
              </button>
            </div>

            {/* Your interests */}
            <div
              style={{
                borderRadius: 20,
                border: "1px solid var(--card-border)",
                background: "var(--card-bg)",
                padding: "1.1rem 1.2rem",
                boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  Your interests
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    router.push("/onboarding/interests")
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 12,
                    color: "#60a5fa",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                {demoInterests.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      padding: "0.25rem 0.7rem",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.6)",
                      backgroundColor: "rgba(15,23,42,0.9)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/onboarding/interests")
                }
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 12,
                  color: "#60a5fa",
                  cursor: "pointer",
                  padding: 0,
                  marginTop: 4,
                }}
              >
                + Add interests
              </button>
            </div>
          </aside>

          {/* SAĞ SÜTUN – Profil özeti + form (artık login form yok) */}
          <section>
            <div
              style={{
                borderRadius: 22,
                border: "1px solid var(--card-border)",
                background:
                  "radial-gradient(circle at top, rgba(56,189,248,0.18), transparent 55%), var(--card-bg)",
                boxShadow: "0 20px 45px rgba(15,23,42,0.6)",
                padding: "1.8rem 1.9rem",
              }}
            >
              {/* Üst kısım: avatar + kısa özet */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 22,
                    background:
                      "conic-gradient(from 120deg,#38bdf8,#6366f1,#f97316,#22c55e,#38bdf8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 22px rgba(56,189,248,0.9)",
                    color: "#0f172a",
                    fontWeight: 800,
                    fontSize: 24,
                  }}
                >
                  {initials}
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    Profile & account details
                  </h2>
                  <p
                    style={{
                      fontSize: 13,
                      opacity: 0.78,
                      marginTop: 4,
                    }}
                  >
                    Update your basic info. We use this to personalise events
                    and recommendations.
                  </p>
                </div>
              </div>

              {/* Profil meta bilgileri */}
              {loading ? (
                <p style={{ fontSize: 14, opacity: 0.8 }}>
                  Loading profile…
                </p>
              ) : (
                user && (
                  <div
                    style={{
                      marginBottom: 18,
                      padding: "0.8rem 0.95rem",
                      borderRadius: 12,
                      background: "rgba(15,23,42,0.88)",
                      border: "1px solid rgba(148,163,184,0.5)",
                      fontSize: 13,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <div>
                      <span style={{ opacity: 0.6 }}>Signed in as </span>
                      <span style={{ fontWeight: 600 }}>{user.email}</span>
                    </div>
                    {user.createdAt && (
                      <div style={{ opacity: 0.85 }}>
                        Member since{" "}
                        {new Date(user.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </div>
                    )}
                    {user.city && (
                      <div style={{ opacity: 0.85 }}>
                        Home city: <strong>{user.city}</strong>
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Düzenleme formu */}
              {!loading && (
                <>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      marginBottom: 12,
                    }}
                  >
                    Edit profile
                  </h3>

                  <form onSubmit={handleSave}>
                    <div style={{ marginBottom: 14 }}>
                      <label
                        style={{
                          fontSize: 13,
                          opacity: 0.9,
                        }}
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "0.55rem 0.75rem",
                          borderRadius: 8,
                          border: "1px solid var(--card-border)",
                          background: "var(--bg)",
                          color: "var(--fg)",
                          fontSize: 14,
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <label
                        style={{
                          fontSize: 13,
                          opacity: 0.9,
                        }}
                      >
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Berlin, Istanbul…"
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "0.55rem 0.75rem",
                          borderRadius: 8,
                          border: "1px solid var(--card-border)",
                          background: "var(--bg)",
                          color: "var(--fg)",
                          fontSize: 14,
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        padding: "0.7rem 1.6rem",
                        borderRadius: 999,
                        border: "none",
                        background:
                          "linear-gradient(135deg,#22c55e,#38bdf8,#2563eb)",
                        color: "#020617",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        opacity: saving ? 0.75 : 1,
                        boxShadow: "0 14px 28px rgba(15,23,42,0.6)",
                      }}
                    >
                      {saving ? "Saving…" : "Save changes"}
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
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
