"use client";

// app/profile/page.tsx

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useRequireAuth from "../hooks/useRequireAuth";
import { useLanguage } from "../context/LanguageContext";

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
  planType?: string | null;
};

type HobbyTag = {
  id: number;
  name: string;
};

type DashboardEvent = {
  id: number;
  title: string;
  city: string;
  dateTime: string;
  hobby?: {
    id: number;
    name: string;
  } | null;
  createdBy?: {
    id: number;
    name: string;
    city?: string | null;
  } | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();

  // 🔐 Giriş kontrolü
  const { checking, token } = useRequireAuth("/login");

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [hobbyTags, setHobbyTags] = useState<HobbyTag[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================
  // PROFİL VERİLERİNİ ÇEK
  // ==========================
  useEffect(() => {
    if (checking) return;
    if (!token) return;

    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        // 1) Temel profil
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const meData = await meRes.json().catch(() => ({}));
        if (!meRes.ok) {
          throw new Error(
            meData.error ||
              t("profile.error.couldNotLoad") ||
              "Could not load profile"
          );
        }

        setUser(meData.user as ProfileUser);

        // 2) Kullanıcının ilgi alanları (varsa)
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
          // hobi endpoint'i yoksa sessiz geç
        }

        // 3) Kullanıcının upcoming eventleri (oluşturduğu veya katıldığı)
        try {
          const eventsRes = await fetch(`${API_URL}/events/my/upcoming`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (eventsRes.ok) {
            const eventsData = await eventsRes.json().catch(() => ({}));
            setUpcomingEvents(eventsData.events || []);
          }
        } catch {
          // hata olursa sessiz geç (profil yine çalışsın)
        }
      } catch (err: any) {
        console.error("profile fetch error:", err);
        setError(
          err.message ||
            t("profile.error.couldNotLoad") ||
            "Error while loading profile"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking, token]);

  const displayName = useMemo(
    () => user?.name || (t("profile.hero.defaultName") as string) || "there",
    [user?.name, t]
  );

  const joinedText = useMemo(() => {
    if (!user?.createdAt) return "";
    const d = new Date(user.createdAt);
    const month = d.toLocaleString(undefined, { month: "short" });
    const year = d.getFullYear();
    return `${month} ${year}`;
  }, [user?.createdAt]);

  const groupsCount = 0; // ileride backend'den doldurulabilir
  const interestsCount = hobbyTags.length;
  const rsvpsCount = upcomingEvents.length;

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
          <p style={{ opacity: 0.8 }}>
            {t("profile.loading") || "Loading your profile…"}
          </p>
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
            {error ||
              t("profile.error.couldNotLoad") ||
              "Could not load profile."}
          </p>
        </div>
      </main>
    );
  }

  const heroTitle =
    t("profile.hero.title", { name: displayName }) ||
    `What are you up to, ${displayName}?`;
  const heroSubtitle =
    t("profile.hero.subtitle") ||
    "Plan new events, explore groups and manage your Moventra profile from here.";

  const stats = [
    {
      label: t("profile.stats.groups") || "Groups",
      value: groupsCount,
    },
    {
      label: t("profile.stats.interests") || "Interests",
      value: interestsCount,
    },
    {
      label: t("profile.stats.rsvps") || "RSVPs",
      value: rsvpsCount,
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* HERO */}
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
            {heroTitle}
          </h1>
          <p
            style={{
              fontSize: 14,
              opacity: 0.85,
              maxWidth: 520,
            }}
          >
            {heroSubtitle}
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
          {/* SOL – dashboard kutuları */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Your events */}
            <div
              style={{
                borderRadius: 24,
                padding: "1.4rem 1.5rem",
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                boxShadow: "0 6px 14px rgba(15,23,42,0.16)",
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
                  {t("profile.dashboard.events.title") || "Your events"}
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
                  {t("profile.dashboard.events.ctaAll") || "See all"}
                </button>
              </div>

              {upcomingEvents.length === 0 ? (
                <p
                  style={{
                    fontSize: 13,
                    opacity: 0.8,
                    marginBottom: 14,
                  }}
                >
                  {t("profile.dashboard.events.empty") ||
                    "No plans yet? Let’s fix that!"}
                </p>
              ) : (
                <>
                  <p
                    style={{
                      fontSize: 13,
                      opacity: 0.8,
                      marginBottom: 10,
                    }}
                  >
                    {t("profile.dashboard.events.hasUpcoming") ||
                      "Here are your next events."}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    {upcomingEvents.slice(0, 3).map((ev) => {
                      const d = new Date(ev.dateTime);
                      const dateLabel = d.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      });

                      const roleLabel =
                        ev.createdBy && ev.createdBy.id === user.id
                          ? t("profile.dashboard.events.roleHost") ||
                            "Hosting"
                          : t("profile.dashboard.events.roleAttendee") ||
                            "Going";

                      const hobbyName = ev.hobby?.name;

                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => router.push(`/events/${ev.id}`)}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "0.6rem 0.8rem",
                            borderRadius: 12,
                            border: "1px solid rgba(148,163,184,0.6)",
                            background: "rgba(255,255,255,0.92)",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {ev.title}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              opacity: 0.8,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {dateLabel} · {ev.city}
                            {hobbyName ? ` · ${hobbyName}` : ""} · {roleLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => router.push("/events")}
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#2563eb,#1d4ed8,#1e40af)",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 6px 14px rgba(37,99,235,0.45)",
                  transition: "transform 120ms ease, box-shadow 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 36px rgba(37,99,235,0.55)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 28px rgba(37,99,235,0.45)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "scale(0.97)";
                  e.currentTarget.style.boxShadow =
                    "0 7px 16px rgba(37,99,235,0.45)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 36px rgba(37,99,235,0.55)";
                }}
              >
                {t("profile.dashboard.events.button") || "Find events"}
              </button>
            </div>

            {/* Your groups */}
            <div
              style={{
                borderRadius: 24,
                padding: "1.4rem 1.5rem",
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                boxShadow: "0 6px 14px rgba(15,23,42,0.16)",
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
                  {t("profile.dashboard.groups.title") || "Your groups"}
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
                  {t("profile.dashboard.groups.ctaAll") || "See all"}
                </button>
              </div>

              <p
                style={{
                  fontSize: 13,
                  opacity: 0.8,
                  marginBottom: 14,
                }}
              >
                {t("profile.dashboard.groups.text") ||
                  "Join a group that shares your passions – and start connecting today."}
              </p>

              <button
                type="button"
                onClick={() => router.push("/events")}
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#020617,#111827,#020617)",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 6px 14px rgba(15,23,42,0.6)",
                  transition: "transform 120ms ease, box-shadow 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 40px rgba(15,23,42,0.72)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 30px rgba(15,23,42,0.6)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "scale(0.97)";
                  e.currentTarget.style.boxShadow =
                    "0 7px 18px rgba(15,23,42,0.6)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 40px rgba(15,23,42,0.72)";
                }}
              >
                {t("profile.dashboard.groups.button") ||
                  "Explore groups near you"}
              </button>
            </div>

            {/* Your interests */}
            <div
              style={{
                borderRadius: 24,
                padding: "1.4rem 1.5rem",
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                boxShadow: "0 6px 14px rgba(15,23,42,0.16)",
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
                  {t("profile.dashboard.interests.title") ||
                    "Your interests"}
                </h2>
                <button
                  type="button"
                  onClick={() => router.push("/settings?tab=interests")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: 12,
                    color: "#2563eb",
                    cursor: "pointer",
                  }}
                >
                  {t("profile.dashboard.interests.edit") || "Edit"}
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
                    {t("profile.dashboard.interests.empty") ||
                      "You haven’t added any interests yet."}
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
                      boxShadow: "0 6px 14px rgba(15,23,42,0.5)",
                    }}
                  >
                    {hobby.name}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => router.push("/settings?tab=interests")}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 13,
                  color: "#2563eb",
                  cursor: "pointer",
                }}
              >
                {t("profile.dashboard.interests.addButton") ||
                  "+ Add interests"}
              </button>
            </div>
          </div>

          {/* SAĞ – profil kartı (view only) */}
          <article
            style={{
              borderRadius: 28,
              padding: "1.8rem 1.9rem 1.7rem",
              background:
                "linear-gradient(145deg, rgba(239,246,255,0.96), rgba(248,250,252,0.92))",
              border: "1px solid rgba(148,163,184,0.4)",
              boxShadow: "0 6px 14px rgba(15,23,42,0.25)",
            }}
          >
            {/* Üst kısım: avatar + başlık */}
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
                  boxShadow: "0 0 14px rgba(56,189,248,0.85)",
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
                  {t("profile.card.title") || "Profile & account details"}
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    opacity: 0.8,
                    maxWidth: 420,
                  }}
                >
                  {t("profile.card.subtitle") ||
                    "Update your basic info in Settings. We use this to personalise events and recommendations for you."}
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
                {t("nav.signedInAs") || "Signed in as"}{" "}
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
                    {t("profile.summary.homeCity") || "Home city:"}{" "}
                    <strong style={{ fontWeight: 600 }}>{user.city}</strong>
                  </span>
                )}
                {joinedText && (
                  <span>
                    {t("profile.summary.memberSince") || "Member since"}{" "}
                    <strong style={{ fontWeight: 600 }}>{joinedText}</strong>
                  </span>
                )}
                {user.planType && (
                  <span>
                    {t("profile.summary.plan") || "Plan:"}{" "}
                    <strong style={{ fontWeight: 600 }}>{user.planType}</strong>
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
              {stats.map((stat) => (
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

            {/* Detaylar */}
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
                  {t("settings.profile.nameLabel") || "Name"}
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
                    {t("settings.profile.locationLabel") || "Location"}
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
                    {t("settings.profile.genderLabel") || "Gender"}
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
                    {t("settings.profile.bioLabel") || "Bio"}
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
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(220px,1fr))",
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
                    {t("settings.profile.toggles.showGroupsLabel") ||
                      "Show groups"}
                  </strong>
                </div>
                <p style={{ margin: 0, opacity: 0.8 }}>
                  {t(
                    "settings.profile.toggles.showGroupsDescription"
                  ) ||
                    "On your profile, people can see the groups you belong to."}
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
                    {t(
                      "settings.profile.toggles.showInterestsLabel"
                    ) || "Show interests"}
                  </strong>
                </div>
                <p style={{ margin: 0, opacity: 0.8 }}>
                  {t(
                    "settings.profile.toggles.showInterestsDescription"
                  ) ||
                    "On your profile, people can see your list of interests."}
                </p>
              </div>
            </section>

            {/* Edit butonu */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => router.push("/settings")}
                style={{
                  padding: "0.75rem 1.4rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#22c55e,#16a34a,#15803d)",
                  color: "#f9fafb",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 6px 36px rgba(22,163,74,0.55)",
                  transition: "transform 120ms ease, box-shadow 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 32px rgba(22,163,74,0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 32px rgba(22,163,74,0.55)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "scale(0.97)";
                  e.currentTarget.style.boxShadow =
                    "0 9px 20px rgba(22,163,74,0.55)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 32px rgba(22,163,74,0.7)";
                }}
              >
                {t("profile.card.editInSettingsButton") ||
                  "Edit profile in Settings"}
              </button>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
