"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  // Token varsa menü + logout göster
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("token");
    setLoggedIn(!!token);
  }, [pathname]);

  // Login sayfasında navbar görünmesin
  if (pathname === "/login") {
    return null;
  }

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        backgroundColor: "#020617", // 🔹 koyu arkaplan
        borderBottom: "1px solid #111827",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#e5e7eb", // açık gri yazı
        }}
      >
        {/* Sol: logo */}
        <Link
          href="/events"
          style={{ fontSize: "1.15rem", fontWeight: 700, color: "#e5e7eb" }}
        >
          Moventra
        </Link>

        {/* Orta: menü */}
        {loggedIn && (
          <div style={{ display: "flex", gap: "1rem" }}>
            <NavItem href="/events" label="Events" pathname={pathname} />
            <NavItem href="/events/new" label="Create Event" pathname={pathname} />
            <NavItem
              href="/events/my/created"
              label="My Created"
              pathname={pathname}
            />
            <NavItem
              href="/events/my/joined"
              label="My Joined"
              pathname={pathname}
            />
            <NavItem href="/hobbies" label="All Hobbies" pathname={pathname} />
            <NavItem href="/profile" label="My Profile" pathname={pathname} />


          </div>
        )}

        {/* Sağ: Logout */}
        {loggedIn && (
          <button
            onClick={handleLogout}
            style={{
              padding: "0.3rem 0.8rem",
              borderRadius: "999px",
              border: "1px solid #4b5563",
              backgroundColor: "#020617",
              color: "#e5e7eb",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string | null;
}) {
  const active =
    pathname === href || (pathname && pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      style={{
        padding: "0.3rem 0.7rem",
        borderRadius: "999px",
        fontSize: "0.9rem",
        textDecoration: "none",
        color: "#e5e7eb",
        backgroundColor: active ? "#1f2937" : "transparent", // aktif: koyu gri balon
        fontWeight: active ? 600 : 400,
      }}
    >
      {label}
    </Link>
  );
}
