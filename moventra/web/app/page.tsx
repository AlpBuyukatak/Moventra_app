"use client";

import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "system-ui, sans-serif",
        padding: "40px 16px 60px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* HERO + STATS */}
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
              Discover local and global events based on what you love: board
              games, sports, workshops, language exchange and more. Join small,
              friendly groups instead of crowded random meetups.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {/* HERO primary CTA */}
              <Link
                href="/events"
                style={{
                  padding: "0.8rem 1.3rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#22c55e,#16a34a,#15803d)",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#ffffff",
                  textDecoration: "none",
                  boxShadow: "0 6px 18px rgba(22,163,74,0.35)",
                  transition:
                    "transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-2px)";
                  el.style.boxShadow =
                    "0 10px 24px rgba(22,163,74,0.5)";
                  el.style.filter = "brightness(1.03)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow =
                    "0 6px 18px rgba(22,163,74,0.35)";
                  el.style.filter = "brightness(1)";
                }}
              >
                Browse events
              </Link>

              {/* HERO secondary CTA */}
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
                  transition:
                    "background-color 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = "rgba(248,250,252,0.95)";
                  el.style.boxShadow =
                    "0 6px 16px rgba(15,23,42,0.08)";
                  el.style.borderColor = "rgba(148,163,184,0.7)";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = "transparent";
                  el.style.boxShadow = "none";
                  el.style.borderColor = "var(--card-border)";
                  el.style.transform = "translateY(0)";
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

          {/* Sağ taraf: “Why Moventra” kartı */}
          <aside
            style={{
              borderRadius: 26,
              border: "1px solid rgba(148,163,184,0.38)",
              background:
                "radial-gradient(circle at top,rgba(59,130,246,0.22),rgba(15,23,42,0.06),var(--bg) 70%)",
              padding: "1.5rem 1.7rem 1.6rem",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              color: "var(--fg)",
              boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Why Moventra?
            </h2>
            <p
              style={{
                fontSize: 13,
                opacity: 0.9,
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
                  borderRadius: 16,
                  background: "rgba(15,23,42,0.96)",
                  border: "1px solid rgba(148,163,184,0.45)",
                  fontSize: 13,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: "#f9fafb" }}>
                  50+
                </div>
                <div style={{ opacity: 0.85, color: "#e5e7eb" }}>
                  Cities tested
                </div>
              </div>
              <div
                style={{
                  padding: "0.7rem 0.8rem",
                  borderRadius: 16,
                  background: "rgba(15,23,42,0.96)",
                  border: "1px solid rgba(148,163,184,0.45)",
                  fontSize: 13,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: "#f9fafb" }}>
                  100+
                </div>
                <div style={{ opacity: 0.85, color: "#e5e7eb" }}>
                  Hobby types
                </div>
              </div>
              <div
                style={{
                  padding: "0.7rem 0.8rem",
                  borderRadius: 16,
                  background: "rgba(15,23,42,0.96)",
                  border: "1px solid rgba(148,163,184,0.45)",
                  fontSize: 13,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: "#f9fafb" }}>
                  Small
                </div>
                <div style={{ opacity: 0.85, color: "#e5e7eb" }}>
                  Group meetups
                </div>
              </div>
            </div>

            {/* extra mini-benefit pill'leri */}
            <div
              style={{
                marginTop: 12,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                fontSize: 11,
              }}
            >
              {[
                "Great for newcomers",
                "Perfect for expats & students",
                "No big crowds",
              ].map((label) => (
                <span
                  key={label}
                  style={{
                    padding: "0.3rem 0.6rem",
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.55)",
                    background: "rgba(15,23,42,0.75)",
                    color: "#e5e7eb",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 12 }}>✓</span>
                  {label}
                </span>
              ))}
            </div>
          </aside>
        </section>

        {/* HOW IT WORKS */}
        <section
          style={{
            marginTop: 48,
            padding: "1.6rem 1.4rem 1.8rem",
            borderRadius: 24,
            border: "1px solid var(--card-border)",
            background:
              "linear-gradient(135deg,rgba(248,250,252,0.22),rgba(248,250,252,0))",
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            How Moventra works
          </h2>
          <p
            style={{
              fontSize: 13,
              opacity: 0.8,
              marginBottom: 18,
              maxWidth: 580,
            }}
          >
            Pick your city, choose a hobby, and join a small group. Moventra
            keeps things simple so you can focus on real conversations, not
            endless feeds.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              gap: 16,
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                borderRadius: 18,
                background: "linear-gradient(145deg,#ffffff,#f3f4f6)",
                border: "1px solid rgba(148,163,184,0.22)",
                boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
                padding: "1rem 1.2rem",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>①</div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Choose your city
              </h3>
              <p
                style={{
                  fontSize: 13,
                  opacity: 0.8,
                }}
              >
                Set your home base or travel destination. We&apos;ll show
                events nearby first.
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                borderRadius: 18,
                background: "linear-gradient(145deg,#ffffff,#f3f4f6)",
                border: "1px solid rgba(148,163,184,0.22)",
                boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
                padding: "1rem 1.2rem",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>②</div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Pick your hobbies
              </h3>
              <p
                style={{
                  fontSize: 13,
                  opacity: 0.8,
                }}
              >
                From board games to hiking, language exchange or tech talks:
                choose what you actually enjoy.
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                borderRadius: 18,
                background: "linear-gradient(145deg,#ffffff,#f3f4f6)",
                border: "1px solid rgba(148,163,184,0.22)",
                boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
                padding: "1rem 1.2rem",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>③</div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Join small groups
              </h3>
              <p
                style={{
                  fontSize: 13,
                  opacity: 0.8,
                }}
              >
                Meet up in small, friendly groups where it&apos;s easy to talk
                and actually remember people&apos;s names.
              </p>
            </div>
          </div>
        </section>

        {/* POPULAR HOBBIES GRID */}
        <section
          style={{
            marginTop: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                Explore by hobby
              </h2>
              <p
                style={{
                  fontSize: 13,
                  opacity: 0.8,
                }}
              >
                Some of the most popular ways people use Moventra right now.
              </p>
            </div>

            <Link
              href="/hobbies"
              style={{
                fontSize: 13,
                textDecoration: "none",
                color: "#2563eb",
              }}
            >
              View all hobbies →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: 14,
            }}
          >
            {[
              {
                emoji: "🎲",
                title: "Board games",
                text: "Catan, Codenames, chess nights & more.",
              },
              {
                emoji: "🚶‍♀️",
                title: "Walk & talk",
                text: "Casual city walks and coffee afterwards.",
              },
              {
                emoji: "🗣️",
                title: "Language exchange",
                text: "Practice English, German, Turkish & more.",
              },
              {
                emoji: "🏃‍♂️",
                title: "Outdoor & sports",
                text: "Running clubs, hiking groups, cycling meetups.",
              },
              {
                emoji: "💻",
                title: "Tech & startup",
                text: "Side-project nights, coding meetups, study groups.",
              },
              {
                emoji: "🎨",
                title: "Creative hobbies",
                text: "Drawing, photography and creative workshops.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  borderRadius: 18,
                  border: "1px solid var(--card-border)",
                  background: "rgba(15,23,42,0.02)",
                  padding: "0.8rem 0.9rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    marginBottom: 2,
                  }}
                >
                  {item.emoji}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TRUST / SMALL GROUPS + CTA */}
        <section
          style={{
            marginTop: 44,
            display: "grid",
            gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1.2fr)",
            gap: 24,
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Built for real-world conversations
            </h2>
            <p
              style={{
                fontSize: 13,
                opacity: 0.8,
                marginBottom: 14,
                maxWidth: 520,
              }}
            >
              Moventra is for people who want to actually meet – not just join
              another online group. Events are designed around small groups,
              clear descriptions and real interests.
            </p>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: 13,
                opacity: 0.85,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <li>
                • Hosts share clear event details, locations and group size.
              </li>
              <li>
                • You decide how often you join – no commitment, no pressure.
              </li>
              <li>
                • Great for moving to a new city or restarting old hobbies.
              </li>
            </ul>
          </div>

          <div
            style={{
              borderRadius: 24,
              padding: "1.4rem 1.5rem",
              background:
                "linear-gradient(135deg,rgba(59,130,246,0.2),rgba(16,185,129,0.18))",
              border: "1px solid rgba(148,163,184,0.45)",
              boxShadow: "0 20px 45px rgba(15,23,42,0.20)",
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Ready to meet people through your hobbies?
            </h3>
            <p
              style={{
                fontSize: 13,
                opacity: 0.85,
                marginBottom: 14,
              }}
            >
              Start by browsing events in your city or explore all hobbies to
              see what&apos;s possible with Moventra.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {/* Alt primary CTA */}
              <Link
                href="/events"
                style={{
                  padding: "0.65rem 1.2rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#22c55e,#16a34a,#15803d)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#f9fafb",
                  textDecoration: "none",
                  boxShadow: "0 6px 18px rgba(22,163,74,0.35)",
                  transition:
                    "transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-2px)";
                  el.style.boxShadow =
                    "0 10px 24px rgba(22,163,74,0.5)";
                  el.style.filter = "brightness(1.03)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow =
                    "0 6px 18px rgba(22,163,74,0.35)";
                  el.style.filter = "brightness(1)";
                }}
              >
                Browse nearby events
              </Link>

              {/* Alt secondary CTA */}
              <Link
                href="/hobbies"
                style={{
                  padding: "0.65rem 1.15rem",
                  borderRadius: 999,
                  border: "1px solid rgba(15,23,42,0.15)",
                  background: "rgba(248,250,252,0.9)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#0f172a",
                  textDecoration: "none",
                  transition:
                    "background-color 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = "#ffffff";
                  el.style.boxShadow =
                    "0 6px 16px rgba(15,23,42,0.12)";
                  el.style.borderColor = "rgba(148,163,184,0.8)";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = "rgba(248,250,252,0.9)";
                  el.style.boxShadow = "none";
                  el.style.borderColor = "rgba(15,23,42,0.15)";
                  el.style.transform = "translateY(0)";
                }}
              >
                Explore hobby ideas
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
