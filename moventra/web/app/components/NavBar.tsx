"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

type NavItemProps = {
  href: string;
  label: string;
  pathname: string;
};

type Theme = "light" | "dark";

type MeUser = {
  id: number;
  email: string;
  name: string;
  city?: string | null;
  avatarUrl?: string | null;
  onboardingCompleted?: boolean;
};

const TAGLINES = [
  "meet people through hobbies",
  "meet • event • travel",
  "discover events anywhere in the world",
  "find new friends in every city",
];

// Aktif route hesaplama
function isRouteActive(pathname: string, href: string) {
  if (href === "/events") {
    return pathname === "/events";
  }
  if (href === "/login" || href === "/register") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(href + "/");
}

function NavItem({ href, label, pathname }: NavItemProps) {
  const active = isRouteActive(pathname, href);

  return (
    <Link
      href={href}
      style={{
        padding: "0.35rem 0.9rem",
        borderRadius: 999,
        fontSize: 14,
        textDecoration: "none",
        color: active ? "#0f172a" : "#e5e7eb",
        backgroundColor: active ? "#fbbf24" : "transparent",
        border: active ? "none" : "1px solid transparent",
        transition:
          "background 0.15s ease, color 0.15s ease, transform 0.12s ease",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Link>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [me, setMe] = useState<MeUser | null>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [scrolled, setScrolled] = useState(false);

  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineVisible, setTaglineVisible] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);

  // token & me çek
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoggedIn(false);
      setMe(null);
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
          setLoggedIn(false);
          setMe(null);
          return;
        }
        const data = await res.json().catch(() => ({}));
        setMe(data.user as MeUser);
        setLoggedIn(true);
      } catch (err) {
        console.error("NavBar /auth/me error:", err);
        setLoggedIn(false);
        setMe(null);
      }
    })();
  }, [pathname]);

  // storage dinle (başka tabde logout vs.)
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === "token") {
        setLoggedIn(!!e.newValue);
        if (!e.newValue) {
          setMe(null);
        }
      }
    }
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }
  }, []);

  // Tema ilk yükleme
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else {
      setTheme("light");
    }
  }, []);

  // Tema <html> class
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", theme);
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  // Scroll efekti
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tagline döndürme
  useEffect(() => {
    if (typeof window === "undefined") return;

    let fadeTimeout: number;
    const cycle = () => {
      setTaglineVisible(false);
      fadeTimeout = window.setTimeout(() => {
        setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
        setTaglineVisible(true);
      }, 220);
    };

    const interval = window.setInterval(cycle, 4000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(fadeTimeout);
    };
  }, []);

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
    }
    setLoggedIn(false);
    setMe(null);
    setMenuOpen(false);
    router.push("/login");
  }

  function getInitials(name?: string | null, email?: string | null) {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (
        parts[0].charAt(0).toUpperCase() +
        parts[parts.length - 1].charAt(0).toUpperCase()
      );
    }
    if (email) return email.charAt(0).toUpperCase();
    return "M";
  }

  const hideOnAuthPages = pathname === "/login" || pathname === "/register";
  if (hideOnAuthPages) return null;

  const publicLinks = [
    { href: "/events", label: "Events" },
    { href: "/hobbies", label: "All Hobbies" },
  ];

  return (
    <nav
      style={{
        width: "100%",
        position: "sticky",
        top: 0,
        zIndex: 40,
        borderBottom: scrolled
          ? "1px solid rgba(15,23,42,0.9)"
          : "1px solid rgba(15,23,42,0.6)",
        background: scrolled
          ? "rgba(15,23,42,0.96)"
          : "linear-gradient(90deg, rgba(15,23,42,0.98), rgba(15,23,42,0.92))",
        backdropFilter: "blur(16px)",
        boxShadow: scrolled
          ? "0 8px 20px rgba(15,23,42,0.6)"
          : "0 0 0 rgba(0,0,0,0)",
        transition: "background 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0.55rem 1.2rem",
          display: "grid",
          gridTemplateColumns: "260px 1fr auto",
          alignItems: "center",
          columnGap: 16,
          color: "#e5e7eb",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* SOL: Logo + tagline */}
        <Link href={loggedIn ? "/profile" : "/"} style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              maxWidth: 260,
            }}
          >
            <div className={`logo-bubble ${scrolled ? "logo-bubble--scrolled" : ""}`}>
              <span className="logo-bubble-text">M</span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  fontSize: 17,
                  whiteSpace: "nowrap",
                }}
              >
                Moventra
              </span>
              <span
                className={`tagline-rotator ${
                  taglineVisible
                    ? "tagline-rotator--visible"
                    : "tagline-rotator--hidden"
                }`}
              >
                {TAGLINES[taglineIndex]}
              </span>
            </div>
          </div>
        </Link>

        {/* ORTA: sade menü */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.8rem",
            flexWrap: "wrap",
          }}
        >
          {publicLinks.map((item) => (
            <NavItem key={item.href} {...item} pathname={pathname} />
          ))}
        </div>

        {/* SAĞ: ikonlar + avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: "flex-end",
          }}
        >
          {/* Logout olmamış kullanıcılar için tema + auth butonları */}
          {!loggedIn && (
            <>
              <button
                onClick={toggleTheme}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  border: "1px solid #334155",
                  backgroundColor: "rgba(15,23,42,0.9)",
                  color: "#e5e7eb",
                  fontSize: 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>

              <NavItem href="/login" label="Login" pathname={pathname} />
              <NavItem href="/register" label="Register" pathname={pathname} />
            </>
          )}

          {/* Giriş yapmış kullanıcı – Meetup tarzı sağ taraf */}
          {loggedIn && me && (
            <>
              {/* Mesaj ikonu */}
              <button
                type="button"
                aria-label="Messages"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                💬
              </button>

              {/* Bildirim ikonu */}
              <button
                type="button"
                aria-label="Notifications"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                🔔
              </button>

              {/* Avatar + dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "0.2rem 0.5rem",
                    borderRadius: 999,
                    border: "none",
                    backgroundColor: "#facc15",
                    cursor: "pointer",
                    color: "#0f172a",
                    fontSize: 13,
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "999px",
                      backgroundColor: "#fde68a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                    }}
                  >
                    {getInitials(me.name, me.email)}
                  </div>
                  <span style={{ fontSize: 16, transform: "translateY(1px)" }}>
                    ▾
                  </span>
                </button>

                {menuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "110%",
                      right: 0,
                      minWidth: 210,
                      padding: "0.5rem 0.4rem",
                      borderRadius: 16,
                      border: "1px solid rgba(148,163,184,0.35)",
                      backgroundColor: "var(--card-bg)",
                      boxShadow: "0 18px 40px rgba(15,23,42,0.75)",
                      fontSize: 14,
                      zIndex: 50,
                    }}
                  >
                    {/* üst kısım */}
                    <div
                      style={{
                        padding: "0.5rem 0.75rem 0.35rem",
                        borderBottom: "1px solid rgba(148,163,184,0.25)",
                        marginBottom: 4,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          opacity: 0.7,
                          marginBottom: 2,
                        }}
                      >
                        Signed in as
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {me.name || me.email}
                      </div>
                    </div>

                    {/* menü item'ları */}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        router.push("/events/my/joined");
                      }}
                      style={menuItemStyle}
                    >
                      <span>📅 Your events</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        router.push("/groups");
                      }}
                      style={menuItemStyle}
                    >
                      <span>👥 Your groups</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        router.push("/profile");
                      }}
                      style={menuItemStyle}
                    >
                      <span>👤 View profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        router.push("/settings");
                      }}
                      style={menuItemStyle}
                    >
                      <span>⚙️ Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        toggleTheme();
                        // menü açık kalsın → kullanıcı modu görsün
                      }}
                      style={menuItemStyle}
                    >
                      <span>
                        {theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}
                      </span>
                    </button>

                    <div
                      style={{
                        height: 1,
                        margin: "4px 0",
                        background: "rgba(148,163,184,0.25)",
                      }}
                    />

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        ...menuItemStyle,
                        color: "#fca5a5",
                      }}
                    >
                      <span>🚪 Log out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Dropdown menü item ortak stili
const menuItemStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: "0.45rem 0.75rem",
  borderRadius: 12,
  border: "none",
  background: "transparent",
  color: "var(--fg)",
  cursor: "pointer",
  display: "block",
  fontSize: 14,
};
