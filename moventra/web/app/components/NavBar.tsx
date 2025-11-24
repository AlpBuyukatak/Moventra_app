"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

type NavItemProps = {
  href: string;
  label: string;
  pathname: string;
};

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
      }}
    >
      {label}
    </Link>
  );
}

type Theme = "light" | "dark";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [scrolled, setScrolled] = useState(false);

  // Token kontrolü
  useEffect(() => {
    const token = getToken();
    setLoggedIn(!!token);
  }, [pathname]);

  // storage dinle
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === "token") {
        setLoggedIn(!!e.newValue);
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
      return;
    }

    if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }, []);

  // Tema değişince <html> class
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  // Scroll efekti
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      setScrolled(window.scrollY > 4);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
    }
    setLoggedIn(false);
    router.push("/login");
  }

  const hideOnAuthPages = pathname === "/login" || pathname === "/register";
  if (hideOnAuthPages) return null;

  // Logout durumunda görülen linkler
  const publicLinks = [
    { href: "/events", label: "Events" },
    { href: "/hobbies", label: "All Hobbies" },
  ];

  // Sadece login olunca gelenler
  const privateLinks = [
    { href: "/events/new", label: "Create Event" },
    { href: "/events/my/created", label: "My Created" },
    { href: "/events/my/joined", label: "My Joined" },
    { href: "/profile", label: "My Profile" },
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          color: "#e5e7eb",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Sol: Logo → /events */}
        <Link
          href="/events"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                background:
                  "conic-gradient(from 120deg,#38bdf8,#6366f1,#f97316,#22c55e,#38bdf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 14px rgba(56,189,248,0.7)",
                transform: scrolled ? "scale(0.96)" : "scale(1)",
                transition: "transform 0.15s ease",
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                M
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  fontSize: 16,
                }}
              >
                Moventra
              </span>
              <span style={{ fontSize: 11, opacity: 0.7 }}>
                meet people through hobbies
              </span>
            </div>
          </div>
        </Link>

        {/* Orta: menü */}
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          {publicLinks.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              pathname={pathname}
            />
          ))}

          {loggedIn &&
            privateLinks.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                pathname={pathname}
              />
            ))}
        </div>

        {/* Sağ: Tema + Auth */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
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

          {!loggedIn && (
            <>
              <NavItem href="/login" label="Login" pathname={pathname} />
              <NavItem href="/register" label="Register" pathname={pathname} />
            </>
          )}

          {loggedIn && (
            <button
              onClick={handleLogout}
              style={{
                padding: "0.3rem 0.9rem",
                borderRadius: 999,
                border: "1px solid rgba(248,113,113,0.7)",
                backgroundColor: "transparent",
                color: "#fecaca",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
