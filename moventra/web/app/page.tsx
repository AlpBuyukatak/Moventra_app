"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "system-ui, sans-serif",
        padding: "40px 16px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,2fr) minmax(0,1.4fr)",
            gap: 32,
            alignItems: "center",
          }}
        >
          {/* Sol taraf: Hero */}
          <div>
            <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>
              Welcome to Moventra
            </p>
            <h1
              style={{
                fontSize: 42,
                lineHeight: 1.1,
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              Meet people
              <br />
              through your hobbies.
            </h1>
            <p
              style={{
                fontSize: 15,
                opacity: 0.85,
                marginBottom: 22,
                maxWidth: 520,
              }}
            >
              Discover local and global events based on what you love:
              board games, sports, workshops, language exchange and more.
              Join small, friendly groups instead of crowded random meetups.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link
                href="/events"
                style={{
                  padding: "0.8rem 1.3rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#22c55e,#38bdf8,#2563eb)",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#020617",
                  textDecoration: "none",
                }}
              >
                Browse events
              </Link>

              <Link
                href="/hobbies"
                style={{
                  padding: "0.8rem 1.2rem",
                  borderRadius: 999,
                  border: "1px solid var(--card-border)",
                  background: "transparent",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--fg)",
                  textDecoration: "none",
                }}
              >
                See all hobbies
              </Link>
            </div>

            <p
              style={{
                marginTop: 14,
                fontSize: 12,
                opacity: 0.7,
              }}
            >
              No spam, no giant crowds. Just small, interest-based meetups.
            </p>
          </div>

          {/* Sağ taraf: basit “stat / card” alanı */}
          <aside
            style={{
              borderRadius: 24,
              border: "1px solid var(--card-border)",
              background:
                "radial-gradient(circle at top,#1d4ed8,var(--bg) 60%)",
              padding: "1.4rem 1.6rem",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              color: "#f9fafb",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              Why Moventra?
            </h2>
            <p
              style={{
                fontSize: 13,
                opacity: 0.85,
              }}
            >
              Instead of scrolling through random events, Moventra focuses on
              hobbies first. You choose what you love, we show you where you
              can meet.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
                gap: 10,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  padding: "0.7rem 0.8rem",
                  borderRadius: 14,
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(148,163,184,0.5)",
                  fontSize: 13,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700 }}>50+</div>
                <div style={{ opacity: 0.8 }}>Cities tested</div>
              </div>
              <div
                style={{
                  padding: "0.7rem 0.8rem",
                  borderRadius: 14,
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(148,163,184,0.5)",
                  fontSize: 13,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700 }}>100+</div>
                <div style={{ opacity: 0.8 }}>Hobby types</div>
              </div>
              <div
                style={{
                  padding: "0.7rem 0.8rem",
                  borderRadius: 14,
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(148,163,184,0.5)",
                  fontSize: 13,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700 }}>Small</div>
                <div style={{ opacity: 0.8 }}>Group meetups</div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
