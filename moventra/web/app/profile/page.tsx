// app/profile/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useRequireAuth from "../hooks/useRequireAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type ProfileUser = {
  id: number;
  name: string;
  email: string;
  city?: string | null;
  createdAt: string;
  avatarUrl?: string | null;
  bio?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  showGroups?: boolean;
  showInterests?: boolean;
  planType?: string | null; // ✅ EKLENDİ
};

type HobbyTag = {
  id: number;
  name: string;
};

export default function ProfilePage() {
  const router = useRouter();

  // 🔐 Auth koruması (login değilse /login’e at)
  const { checking, token } = useRequireAuth("/login");

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [hobbyTags, setHobbyTags] = useState<HobbyTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ================================
     PROFIL VERİLERİNİ ÇEK
  ================================= */
  useEffect(() => {
    if (checking) return;
    if (!token) return;

    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        // 1) /auth/me → temel profil
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const meData = await meRes.json().catch(() => ({}));
        if (!meRes.ok) {
          throw new Error(meData.error || "Could not load profile");
        }

        setUser(meData.user as ProfileUser);

        // 2) kullanıcının ilgi alanları (varsa)
        try {
          const hobbiesRes = await fetch(`${API_URL}/hobbies/my`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (hobbiesRes.ok) {
            const hobbiesData = await hobbiesRes.json().catch(() => []);
            setHobbyTags(hobbiesData.hobbies || hobbiesData || []);
          }
        } catch {
          // Hobi endpoint'i yoksa sessiz geç
        }
      } catch (err: any) {
        console.error("profile fetch error:", err);
        setError(err.message || "Error while loading profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [checking, token]);

  const displayName = useMemo(
    () => user?.name || "there",
    [user?.name]
  );

  const joinedText = useMemo(() => {
    if (!user?.createdAt) return "";
    const d = new Date(user.createdAt);
    const month = d.toLocaleString(undefined, { month: "short" });
    const year = d.getFullYear();
    return `${month} ${year}`;
  }, [user?.createdAt]);

  const groupsCount = 0; // ileride backend'den besleyebiliriz
  const interestsCount = hobbyTags.length;
  const rsvpsCount = 0;

  if (checking || loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "40px 16px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ opacity: 0.8 }}>Loading your profile…</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "40px 16px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ color: "#f97373" }}>
            {error || "Could not load profile."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* HERO başlık */}
        <header style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              marginBottom: 6,
              maxWidth: "100%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            What are you up to, {displayName}?
          </h1>
          <p
            style={{
              fontSize: 14,
              opacity: 0.85,
              maxWidth: 520,
            }}
          >
            Plan new events, explore groups and manage your Moventra profile
            from here.
          </p>
        </header>

        {/* 2 sütunlu layout */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1.8fr)",
            gap: 24,
            alignItems: "flex-start",
          }}
        >
          {/* SOL KOLON – Dashboard kartları */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Your events */}
            <div
              style={{
                borderRadius: 24,
                padding: "1.4rem 1.5rem",
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                boxShadow: "0 18px 40px rgba(15,23,42,0.16)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 10,
                }}
              >
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  Your events
                </h2>
                <button
                  type="button"
                  onClick={() => router.push("/events/my/created")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: 12,
                    color: "#2563eb",
                    cursor: "pointer",
                  }}
                >
                  See all
                </button>
              </div>

              <p
                style={{
                  fontSize: 13,
                  opacity: 0.8,
                  marginBottom: 14,
                }}
              >
                No plans yet? Let&apos;s fix that!
              </p>

              <button
                type="button"
                onClick={() => router.push("/events")}
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: "#2563eb",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 10px 24px rgba(37,99,235,0.4)",
                }}
              >
                Find events
              </button>
            </div>

            {/* Your groups */}
            <div
              style={{
                borderRadius: 24,
                padding: "1.4rem 1.5rem",
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                boxShadow: "0 18px 40px rgba(15,23,42,0.16)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 10,
                }}
              >
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  Your groups
                </h2>
                <button
                  type="button"
                  onClick={() => router.push("/events")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: 12,
                    color: "#2563eb",
                    cursor: "pointer",
                  }}
                >
                  See all
                </button>
              </div>

              <p
                style={{
                  fontSize: 13,
                  opacity: 0.8,
                  marginBottom: 14,
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
                  padding: "0.7rem 1rem",
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: "#0f172a",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Explore groups near you
              </button>
            </div>

            {/* Your interests */}
            <div
              style={{
                borderRadius: 24,
                padding: "1.4rem 1.5rem",
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                boxShadow: "0 18px 40px rgba(15,23,42,0.16)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 10,
                }}
              >
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  Your interests
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    router.push("/settings?tab=interests")
                  }
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: 12,
                    color: "#2563eb",
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
                {hobbyTags.length === 0 && (
                  <span
                    style={{
                      fontSize: 13,
                      opacity: 0.75,
                    }}
                  >
                    You haven&apos;t added any interests yet.
                  </span>
                )}
                {hobbyTags.map((hobby) => (
                  <span
                    key={hobby.id}
                    style={{
                      padding: "0.25rem 0.8rem",
                      borderRadius: 999,
                      backgroundColor: "#020617",
                      color: "#e5e7eb",
                      fontSize: 12,
                      boxShadow: "0 8px 18px rgba(15,23,42,0.5)",
                    }}
                  >
                    {hobby.name}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/settings?tab=interests")
                }
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 13,
                  color: "#2563eb",
                  cursor: "pointer",
                }}
              >
                + Add interests
              </button>
            </div>
          </div>

          {/* SAĞ KOLON – Profil kartı (view only) */}
          <article
            style={{
              borderRadius: 28,
              padding: "1.8rem 1.9rem 1.7rem",
              background:
                "linear-gradient(145deg, rgba(239,246,255,0.96), rgba(248,250,252,0.92))",
              border: "1px solid rgba(148,163,184,0.4)",
              boxShadow: "0 30px 80px rgba(15,23,42,0.25)",
            }}
          >
            {/* Üst kısım: avatar + başlık + özet */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  background:
                    "conic-gradient(from 140deg,#38bdf8,#6366f1,#f97316,#22c55e,#38bdf8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 24px rgba(56,189,248,0.85)",
                  overflow: "hidden",
                }}
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase() || "M"}
                  </span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginBottom: 4,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Profile &amp; account details
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    opacity: 0.8,
                    maxWidth: 420,
                  }}
                >
                  Update your basic info in Settings. We use this to
                  personalise events and recommendations for you.
                </p>
              </div>
            </div>

            {/* Hesap özeti bandı */}
            <div
              style={{
                borderRadius: 20,
                padding: "1rem 1.1rem",
                backgroundColor: "#0f172a",
                color: "#e5e7eb",
                marginBottom: 16,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  margin: 0,
                  opacity: 0.95,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Signed in as{" "}
                <span style={{ fontWeight: 600 }}>{user.email}</span>
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  fontSize: 12,
                  opacity: 0.85,
                }}
              >
                {user.city && (
                  <span>
                    Home city:{" "}
                    <strong style={{ fontWeight: 600 }}>
                      {user.city}
                    </strong>
                  </span>
                )}
                {joinedText && (
                  <span>
                    Member since{" "}
                    <strong style={{ fontWeight: 600 }}>
                      {joinedText}
                    </strong>
                  </span>
                )}
                {user.planType && (
                  <span>
                    Plan:{" "}
                    <strong style={{ fontWeight: 600 }}>
                      {user.planType}
                    </strong>
                  </span>
                )}
              </div>
            </div>

            {/* İstatistik kutuları */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,minmax(0,1fr))",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {[
                { label: "Groups", value: groupsCount },
                { label: "Interests", value: interestsCount },
                { label: "RSVPs", value: rsvpsCount },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    borderRadius: 14,
                    padding: "0.7rem 0.8rem",
                    backgroundColor: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(148,163,184,0.5)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      marginBottom: 2,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.75,
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Detaylar (sadece görüntüleme) */}
            <section
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 20,
                fontSize: 13,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 0.08,
                    opacity: 0.7,
                    marginBottom: 2,
                  }}
                >
                  Name
                </div>
                <div
                  style={{
                    padding: "0.55rem 0.8rem",
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(209,213,219,0.9)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.name}
                </div>
              </div>

              {user.city && (
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.08,
                      opacity: 0.7,
                      marginBottom: 2,
                    }}
                  >
                    Location
                  </div>
                  <div
                    style={{
                      padding: "0.55rem 0.8rem",
                      borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(209,213,219,0.9)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.city}
                  </div>
                </div>
              )}

              {user.gender && (
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.08,
                      opacity: 0.7,
                      marginBottom: 2,
                    }}
                  >
                    Gender
                  </div>
                  <div
                    style={{
                      padding: "0.55rem 0.8rem",
                      borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(209,213,219,0.9)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.gender}
                  </div>
                </div>
              )}

              {user.bio && (
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.08,
                      opacity: 0.7,
                      marginBottom: 2,
                    }}
                  >
                    Bio
                  </div>
                  <div
                    style={{
                      padding: "0.7rem 0.85rem",
                      borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(209,213,219,0.9)",
                      minHeight: 60,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {user.bio}
                  </div>
                </div>
              )}
            </section>

            {/* Toggle özetleri */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                gap: 12,
                fontSize: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  borderRadius: 14,
                  padding: "0.85rem 0.9rem",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(209,213,219,0.9)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      backgroundColor: user.showGroups
                        ? "#22c55e"
                        : "#9ca3af",
                    }}
                  />
                  <strong style={{ fontSize: 12 }}>
                    Show groups
                  </strong>
                </div>
                <p style={{ margin: 0, opacity: 0.8 }}>
                  On your profile, people can see the groups you belong
                  to.
                </p>
              </div>

              <div
                style={{
                  borderRadius: 14,
                  padding: "0.85rem 0.9rem",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(209,213,219,0.9)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      backgroundColor: user.showInterests
                        ? "#22c55e"
                        : "#9ca3af",
                    }}
                  />
                  <strong style={{ fontSize: 12 }}>
                    Show interests
                  </strong>
                </div>
                <p style={{ margin: 0, opacity: 0.8 }}>
                  On your profile, people can see your list of interests.
                </p>
              </div>
            </section>

            {/* Edit profile butonu */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => router.push("/settings")}
                style={{
                  padding: "0.75rem 1.4rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#2563eb,#22c55e)",
                  color: "#f9fafb",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 16px 36px rgba(15,23,42,0.35)",
                }}
              >
                Edit profile in Settings
              </button>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
