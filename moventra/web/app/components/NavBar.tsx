"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type NavItemProps = {
  href: string;
  label: string;
  pathname: string;
};

function NavItem({ href, label, pathname }: NavItemProps) {
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      style={{
        padding: "0.45rem 0.95rem",
        borderRadius: 999,
        fontSize: 14,
        textDecoration: "none",
        color: isActive ? "#e5e7eb" : "#cbd5f5",
        backgroundColor: isActive ? "rgba(148,163,184,0.2)" : "transparent",
        border: isActive ? "1px solid rgba(148,163,184,0.6)" : "none",
        whiteSpace: "nowrap", // <-- satıra bölünmesin
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("token");
    setLoggedIn(!!token);
  }, []);

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
      router.push("/login");
    }
  }

  return (
    <nav
      style={{
        width: "100%",
        borderBottom: "1px solid rgba(15,23,42,0.9)",
        background: "#020617",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0.9rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* Logo / Sol taraf */}
        <Link
          href="/events"
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "white",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Moventra
        </Link>

        {/* Orta: menü */}
        {loggedIn && (
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <NavItem href="/events" label="Events" pathname={pathname} />
            <NavItem
              href="/events/new"
              label="Create Event"
              pathname={pathname}
            />
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
<NavItem
  href="/events/my/favorites"
  label="Favorites"
  pathname={pathname}
/>

            <NavItem href="/explore" label="Explore" pathname={pathname} />
            <NavItem href="/hobbies" label="All Hobbies" pathname={pathname} />
            <NavItem href="/profile" label="My Profile" pathname={pathname} />
          </div>
        )}

        {/* Sağ: Logout */}
        {loggedIn && (
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "0.45rem 1.1rem",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.7)",
              backgroundColor: "transparent",
              color: "#e5e7eb",
              fontSize: 14,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
