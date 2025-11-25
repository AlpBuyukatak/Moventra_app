"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  city?: string | null;
  createdAt: string;
  isEmailVerified: boolean;
  onboardingCompleted: boolean;
  birthDate?: string | null;
  gender?: string | null;
  planType?: string | null;
};

type NearbyEvent = {
  id: number;
  title: string;
  city: string;
  dateTime: string;
};

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [nearbyEvents, setNearbyEvents] = useState<NearbyEvent[] | null>(null);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [taglineIndex, setTaglineIndex] = useState(0);
  const [logoHover, setLogoHover] = useState(false);

  const profileRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const TAGLINES = [
    "find new friends in every city",
    "meet people through your hobbies",
    "discover small, interest-based meetups",
    "move, travel, meet people",
  ];

  /* ========================
   *  User fetch
   * ======================== */
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }

        const data = await res.json();
        if (!cancelled) setUser(data.user as CurrentUser);
      } catch {
        if (!cancelled) setUser(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ========================
   *  Theme load
   * ======================== */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;
    const stored = window.localStorage.getItem("theme");

    const initial: "light" | "dark" =
      stored === "light" || stored === "dark"
        ? (stored as "light" | "dark")
        : html.classList.contains("dark")
        ? "dark"
        : "light";

    html.classList.remove("light", "dark");
    html.classList.add(initial);
    setTheme(initial);
  }, []);

  const toggleTheme = () => {
    if (typeof window === "undefined") return;

    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      const html = document.documentElement;
      html.classList.remove("light", "dark");
      html.classList.add(next);
      window.localStorage.setItem("theme", next);
      return next;
    });
  };

  /* ========================
   *  Tagline rotation
   * ======================== */
  useEffect(() => {
    const id = window.setInterval(() => {
      setTaglineIndex((p) => (p + 1) % TAGLINES.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

  /* ========================
   *  Outside click / Esc
   * ======================== */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  /* ========================
   *  Helpers
   * ======================== */
  const isEvents = pathname?.startsWith("/events");
  const isHobbies = pathname?.startsWith("/hobbies");

  const navLabelEvents =
    language === "tr" ? "Etkinlikler" : language === "de" ? "Events" : "Events";

  const navLabelHobbies =
    language === "tr"
      ? "Tüm Hobiler"
      : language === "de"
      ? "Alle Hobbys"
      : "All Hobbies";

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
    }
    setUser(null);
    setProfileOpen(false);
    router.push("/login");
  };

  const initial = user?.name?.charAt(0).toUpperCase() || "A";
  const displayName = user?.name || "Guest";

  /* ========================
   *  RENDER
   * ======================== */
  return (
    <header
      style={{
        width: "100%",
        background: "#020617",
        position: "sticky",
        top: 0,
        zIndex: 40,
        color: "#e5e7eb",
      }}
    >
      <nav
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0.7rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* SOL KISIM — LOGO + DİNAMİK TAGLINE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            minWidth: 0,
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              minWidth: 0,
              width: 260, // sabit genişlik → sağdaki ikonlar sabit
            }}
          >
            {/* Outer: sürekli hafif float animasyonu */}
            <div className="moventra-logo-bubble">
              {/* Inner: hover'da büyüme + glow */}
              <div
                onMouseEnter={() => setLogoHover(true)}
                onMouseLeave={() => setLogoHover(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  background:
                    "conic-gradient(from 120deg,#38bdf8,#6366f1,#f97316,#22c55e,#38bdf8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: logoHover ? "scale(1.06)" : "scale(1)",
                  boxShadow: logoHover
                    ? "0 0 20px rgba(56,189,248,0.95)"
                    : "0 0 14px rgba(56,189,248,0.75)",
                  transition:
                    "transform 150ms ease-out, box-shadow 150ms ease-out",
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: "#0f172a",
                  }}
                >
                  M
                </span>
              </div>
            </div>

            {/* Moventra + tagline */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  color: "#f9fafb",
                  whiteSpace: "nowrap",
                }}
              >
                Moventra
              </span>

              <span
                key={taglineIndex}
                className="moventra-tagline-slide"
                style={{
                  fontSize: 11,
                  opacity: 0.78,
                  color: "#cbd5f5",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 210,
                  display: "block",
                }}
              >
                {TAGLINES[taglineIndex]}
              </span>
            </div>
          </Link>

          {/* Orta navigasyon */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 14 }}>
            <Link
              href="/events"
              style={{
                color: isEvents ? "#facc15" : "#e5e7eb",
                fontWeight: isEvents ? 600 : 500,
                textDecoration: "none",
              }}
            >
              {navLabelEvents}
            </Link>

            <Link
              href="/hobbies"
              style={{
                color: isHobbies ? "#facc15" : "#e5e7eb",
                fontWeight: isHobbies ? 600 : 500,
                textDecoration: "none",
              }}
            >
              {navLabelHobbies}
            </Link>
          </div>
        </div>

        {/* SAĞ: ikonlar + profil */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Mesajlar */}
          <button
            type="button"
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              background: "rgba(15,23,42,0.8)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Messages (coming soon)"
          >
            💬
          </button>

          {/* Bildirimler */}
          <div style={{ position: "relative" }} ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                background: "rgba(15,23,42,0.8)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Notifications"
            >
              🔔
            </button>

            {notifOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  marginTop: 8,
                  width: 260,
                  background: "#020617",
                  borderRadius: 16,
                  border: "1px solid rgba(148,163,184,0.6)",
                  padding: "0.9rem",
                  fontSize: 13,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                  color: "#e5e7eb",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  Nearby events
                </div>
                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.7,
                    marginBottom: 8,
                  }}
                >
                  We’ll ping you when new events appear near your location.
                </div>

                {loadingNearby && <p>Checking your city…</p>}

                {!loadingNearby &&
                  nearbyEvents &&
                  nearbyEvents.length > 0 && (
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {nearbyEvents.map((ev) => {
                        const d = new Date(ev.dateTime);
                        const label = d.toLocaleDateString(undefined, {
                          day: "2-digit",
                          month: "short",
                        });
                        return (
                          <li
                            key={ev.id}
                            style={{
                              padding: "0.45rem 0.55rem",
                              borderRadius: 10,
                              background: "rgba(15,23,42,0.9)",
                              border: "1px solid rgba(148,163,184,0.55)",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setNotifOpen(false);
                              router.push(`/events/${ev.id}`);
                            }}
                          >
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 500,
                              }}
                            >
                              {ev.title}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                opacity: 0.75,
                              }}
                            >
                              {ev.city} · {label}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                {!loadingNearby &&
                  (nearbyEvents === null || nearbyEvents.length === 0) && (
                    <p
                      style={{
                        fontSize: 12,
                        opacity: 0.85,
                      }}
                    >
                      {user?.city
                        ? `No new events near ${user.city} this week.`
                        : "Add your city in your profile to get nearby event alerts."}
                    </p>
                  )}
              </div>
            )}
          </div>

          {/* Profil */}
          <div ref={profileRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0.25rem 0.75rem",
                borderRadius: 999,
                border: "none",
                background: "#facc15",
                color: "#0f172a",
                cursor: "pointer",
                maxWidth: 220,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: "#0f172a",
                  color: "#facc15",
                  fontWeight: 700,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {initial}
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {displayName}
              </span>
              <span style={{ fontSize: 12 }}>▾</span>
            </button>

            {profileOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  marginTop: 8,
                  width: 230,
                  background: "#020617",
                  borderRadius: 16,
                  border: "1px solid rgba(148,163,184,0.7)",
                  padding: "0.75rem 0.4rem",
                  fontSize: 13,
                  color: "#e5e7eb",
                  boxShadow: "0 22px 45px rgba(15,23,42,0.9)",
                }}
              >
                <div
                  style={{
                    padding: "0.25rem 0.8rem 0.6rem",
                    borderBottom: "1px solid rgba(51,65,85,0.8)",
                    marginBottom: 4,
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Signed in as</div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      wordBreak: "break-all",
                    }}
                  >
                    {user?.email || "guest@example.com"}
                  </div>
                </div>

                <MenuItem
                  label="Your events"
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/events/my/created");
                  }}
                />
                <MenuItem
                  label="Your groups"
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/hobbies");
                  }}
                />
                <MenuItem
                  label="View profile"
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/profile");
                  }}
                />
                <MenuItem
                  label="Settings"
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/settings");
                  }}
                />
                <MenuItem
                  label={theme === "light" ? "Dark mode" : "Light mode"}
                  onClick={() => {
                    toggleTheme();
                    setProfileOpen(false);
                  }}
                />

                <div
                  style={{
                    borderTop: "1px solid rgba(51,65,85,0.8)",
                    marginTop: 4,
                    paddingTop: 4,
                  }}
                >
                  <MenuItem
                    label="Log out"
                    variant="danger"
                    onClick={handleLogout}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

type MenuItemProps = {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
};

function MenuItem({ label, onClick, variant = "default" }: MenuItemProps) {
  const isDanger = variant === "danger";
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "0.45rem 0.8rem",
        borderRadius: 10,
        border: "none",
        background: "transparent",
        color: isDanger ? "#fecaca" : "#e5e7eb",
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
