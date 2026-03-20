"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "./context/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();

  // ---------- Live stats için basit animasyon ----------
  const [citiesTarget] = useState(52);
  const [hobbiesTarget] = useState(118);
  const [groupsTarget] = useState(340);

  // ---------- Hobby spotlight (otomatik değişen) ----------
  const spotlightItems = [
    { emoji: "🎲", baseKey: "home.explore.cards.boardGames" },
    { emoji: "🗣️", baseKey: "home.explore.cards.language" },
    { emoji: "🚶‍♀️", baseKey: "home.explore.cards.walkTalk" },
    { emoji: "💻", baseKey: "home.explore.cards.tech" },
  ] as const;

  const [spotlightIndex, setSpotlightIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % spotlightItems.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  const spotlight = spotlightItems[spotlightIndex];
  const spotlightTitle = t(`${spotlight.baseKey}.title`);
  const spotlightText = t(`${spotlight.baseKey}.text`);

  // ---------- "Why Moventra?" mini carousel (3 sayfa) ----------
  const [whyIndex, setWhyIndex] = useState(0);
  const WHY_PAGE_COUNT = 3;

  useEffect(() => {
    const id = window.setInterval(() => {
      setWhyIndex((prev) => (prev + 1) % WHY_PAGE_COUNT);
    }, 7000); // 7 saniyede sayfa değişsin
    return () => window.clearInterval(id);
  }, []);

  const pageLabel = `0${whyIndex + 1}/0${WHY_PAGE_COUNT}`;

  return (
    <main
      className="home-shell"
      style={{
        minHeight: "100vh",
        color: "var(--fg)",
        fontFamily: "system-ui, sans-serif",
        padding: "40px 16px 60px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
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
              {t("home.hero.welcome")}
            </p>
            <h1
              style={{
                fontSize: 42,
                lineHeight: 1.1,
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              {t("home.hero.titleLine1")}
              <br />
              {t("home.hero.titleLine2")}
            </h1>
            <p
              style={{
                fontSize: 15,
                opacity: 0.85,
                marginBottom: 22,
                maxWidth: 520,
              }}
            >
              {t("home.hero.description")}
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
                  boxShadow:
                    "0 10px 24px rgba(22,163,74,0.45), 0 0 0 1px rgba(21,128,61,0.15)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition:
                    "transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-2px)";
                  el.style.boxShadow =
                    "0 14px 30px rgba(22,163,74,0.6), 0 0 0 1px rgba(21,128,61,0.25)";
                  el.style.filter = "brightness(1.04)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow =
                    "0 10px 24px rgba(22,163,74,0.45), 0 0 0 1px rgba(21,128,61,0.15)";
                  el.style.filter = "brightness(1)";
                }}
              >
                {t("home.hero.browseEvents")}
              </Link>

              {/* HERO secondary CTA */}
              <Link
                href="/hobbies"
                style={{
                  padding: "0.8rem 1.2rem",
                  borderRadius: 999,
                  border: "1px solid var(--card-border)",
                  background: "rgba(248,250,252,0.9)",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#020617",
                  textDecoration: "none",
                  boxShadow: "0 6px 14px rgba(15,23,42,0.08)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition:
                    "background-color 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = "#ffffff";
                  el.style.boxShadow =
                    "0 10px 22px rgba(15,23,42,0.12)";
                  el.style.borderColor = "rgba(148,163,184,0.8)";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = "rgba(248,250,252,0.9)";
                  el.style.boxShadow = "0 6px 14px rgba(15,23,42,0.08)";
                  el.style.borderColor = "var(--card-border)";
                  el.style.transform = "translateY(0)";
                }}
              >
                {t("home.hero.seeHobbies")}
              </Link>
            </div>

            <p
              style={{
                marginTop: 14,
                fontSize: 12,
                opacity: 0.7,
              }}
            >
              {t("home.hero.smallNote")}
            </p>
          </div>

          {/* Sağ taraf: “Why Moventra” 3 sayfalı mini-carousel */}
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
              boxShadow: "0 20px 45px rgba(15,23,42,0.20)",
              height: 440, // sabit yükseklik
            }}
          >
            {/* Başlık + sayfa göstergesi + dots */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {whyIndex === 0 && t("home.why.title")}
                {whyIndex === 1 && t("home.why.page2Title")}
                {whyIndex === 2 && t("home.why.page3Title")}
              </h2>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11,
                  opacity: 0.85,
                }}
              >
                <span
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: 1,
                  }}
                >
                  {pageLabel}
                </span>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                  }}
                >
                  {[0, 1, 2].map((i) => {
                    const active = i === whyIndex;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setWhyIndex(i)}
                        style={{
                          width: active ? 14 : 8,
                          height: 8,
                          borderRadius: 999,
                          border: "none",
                          padding: 0,
                          backgroundColor: active
                            ? "rgba(15,23,42,0.95)"
                            : "rgba(148,163,184,0.6)",
                          cursor: "pointer",
                          transition:
                            "width 0.18s ease, background-color 0.18s ease, transform 0.18s ease",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SLIDE 1 – Mevcut içerik, aynen korundu */}
            {whyIndex === 0 && (
              <>
                <p
                  style={{
                    fontSize: 13,
                    opacity: 0.9,
                  }}
                >
                  {t("home.why.text")}
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
                      boxShadow: "0 10px 22px rgba(15,23,42,0.55)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#f9fafb",
                      }}
                    >
                      <AnimatedNumber value={citiesTarget} />+
                    </div>
                    <div style={{ opacity: 0.85, color: "#e5e7eb" }}>
                      {t("home.why.citiesLabel")}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "0.7rem 0.8rem",
                      borderRadius: 16,
                      background: "rgba(15,23,42,0.96)",
                      border: "1px solid rgba(148,163,184,0.45)",
                      fontSize: 13,
                      boxShadow: "0 10px 22px rgba(15,23,42,0.55)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#f9fafb",
                      }}
                    >
                      <AnimatedNumber value={hobbiesTarget} />+
                    </div>
                    <div style={{ opacity: 0.85, color: "#e5e7eb" }}>
                      {t("home.why.hobbiesLabel")}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "0.7rem 0.8rem",
                      borderRadius: 16,
                      background: "rgba(15,23,42,0.96)",
                      border: "1px solid rgba(148,163,184,0.45)",
                      fontSize: 13,
                      boxShadow: "0 10px 22px rgba(15,23,42,0.55)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#f9fafb",
                      }}
                    >
                      <AnimatedNumber value={groupsTarget} />
                    </div>
                    <div style={{ opacity: 0.85, color: "#e5e7eb" }}>
                      {t("home.why.groupsLabel")}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    fontSize: 11,
                  }}
                >
                  {[t("home.why.pill1"), t("home.why.pill2"), t("home.why.pill3")].map(
                    (label) => (
                      <span
                        key={label}
                        style={{
                          padding: "0.3rem 0.6rem",
                          borderRadius: 999,
                          border: "1px solid rgba(148,163,184,0.55)",
                          background: "rgba(15,23,42,0.9)",
                          color: "#e5e7eb",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          boxShadow: "0 6px 16px rgba(15,23,42,0.6)",
                        }}
                      >
                        <span style={{ fontSize: 12 }}>✓</span>
                        {label}
                      </span>
                    )
                  )}
                </div>
              </>
            )}

            {/* SLIDE 2 – Small groups / gerçek insanlar */}
            {whyIndex === 1 && (
              <>
                <p
                  style={{
                    fontSize: 13,
                    opacity: 0.9,
                    marginBottom: 10,
                  }}
                >
                  {t("home.why.page2Text")}
                </p>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    fontSize: 13,
                    opacity: 0.9,
                  }}
                >
                  <li>• {t("home.why.page2Bullet1")}</li>
                  <li>• {t("home.why.page2Bullet2")}</li>
                  <li>• {t("home.why.page2Bullet3")}</li>
                </ul>

                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    fontSize: 11,
                  }}
                >
                  <span
                    style={{
                      padding: "0.3rem 0.7rem",
                      borderRadius: 999,
                      border: "1px solid rgba(34,197,94,0.6)",
                      backgroundColor: "rgba(22,163,74,0.08)",
                      color: "#16a34a",
                    }}
                  >
                    {t("home.why.page2Tag1")}
                  </span>
                  <span
                    style={{
                      padding: "0.3rem 0.7rem",
                      borderRadius: 999,
                      border: "1px solid rgba(59,130,246,0.6)",
                      backgroundColor: "rgba(59,130,246,0.08)",
                      color: "#2563eb",
                    }}
                  >
                    {t("home.why.page2Tag2")}
                  </span>
                </div>

                {/* Free to use notu – sadece 2. sayfada */}
                <div
                  style={{
                    marginTop: 18,
                    padding: "0.8rem 0.95rem",
                    borderRadius: 18,
                    border: "1px dashed rgba(148,163,184,0.7)",
                    background:
                      "radial-gradient(circle at top left,rgba(248,250,252,0.85),rgba(241,245,249,0.95))",
                    fontSize: 12,
                    color: "#0f172a",
                  }}
                >
                  {t("home.why.freeNote")}
                </div>
              </>
            )}

            {/* SLIDE 3 – Hobby-first + yeni tasarımlı alt bölüm */}
            {whyIndex === 2 && (
              <>
                <p
                  style={{
                    fontSize: 13,
                    opacity: 0.9,
                    marginBottom: 10,
                  }}
                >
                  {t("home.why.page3Text")}
                </p>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    fontSize: 13,
                    opacity: 0.9,
                  }}
                >
                  <li>• {t("home.why.page3Bullet1")}</li>
                  <li>• {t("home.why.page3Bullet2")}</li>
                  <li>• {t("home.why.page3Bullet3")}</li>
                </ul>

                {/* Koyu highlight kutu */}
                <div
                  style={{
                    marginTop: 14,
                    padding: "0.75rem 0.9rem",
                    borderRadius: 16,
                    border: "1px dashed rgba(148,163,184,0.7)",
                    backgroundColor: "rgba(15,23,42,0.96)",
                    fontSize: 12,
                    color: "#e5e7eb",
                    boxShadow: "0 12px 30px rgba(15,23,42,0.6)",
                  }}
                >
                  {t("home.why.page3BottomNote")}
                </div>

                {/* Yeni: 3 mini badge’li satır – algoritma yok vb. */}
                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    fontSize: 11,
                  }}
                >
                  <span
                    style={{
                      padding: "0.35rem 0.75rem",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.7)",
                      background:
                        "linear-gradient(135deg,rgba(248,250,252,0.95),rgba(241,245,249,0.95))",
                    }}
                  >
                    {t("home.why.page3Tag1")}
                  </span>
                  <span
                    style={{
                      padding: "0.35rem 0.75rem",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.7)",
                      background:
                        "linear-gradient(135deg,rgba(248,250,252,0.95),rgba(241,245,249,0.95))",
                    }}
                  >
                    {t("home.why.page3Tag2")}
                  </span>
                  <span
                    style={{
                      padding: "0.35rem 0.75rem",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.7)",
                      background:
                        "linear-gradient(135deg,rgba(248,250,252,0.95),rgba(241,245,249,0.95))",
                    }}
                  >
                    {t("home.why.page3Tag3")}
                  </span>
                </div>
              </>
            )}
          </aside>
        </section>

        {/* HOBBY SPOTLIGHT */}
        <section
          style={{
            marginTop: 28,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              borderRadius: 999,
              padding: "0.55rem 0.85rem",
              border: "1px solid rgba(148,163,184,0.4)",
              background:
                "linear-gradient(90deg,rgba(248,250,252,0.9),rgba(248,250,252,0.6))",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 10px 20px rgba(15,23,42,0.10)",
              maxWidth: "100%",
            }}
          >
            <span style={{ fontSize: 18 }}>{spotlight.emoji}</span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                maxWidth: 520,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {t("home.spotlight.prefix")}{" "}
                <span style={{ textDecoration: "underline" }}>
                  {spotlightTitle}
                </span>
                .
              </span>
              <span
                style={{
                  fontSize: 12,
                  opacity: 0.8,
                }}
              >
                {spotlightText}
              </span>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          style={{
            marginTop: 32,
            padding: "1.6rem 1.4rem 1.8rem",
            borderRadius: 24,
            border: "1px solid var(--card-border)",
            background:
              "linear-gradient(135deg,rgba(248,250,252,0.22),rgba(248,250,252,0))",
            boxShadow: "0 14px 32px rgba(15,23,42,0.12)",
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            {t("home.how.title")}
          </h2>
          <p
            style={{
              fontSize: 13,
              opacity: 0.8,
              marginBottom: 18,
              maxWidth: 580,
            }}
          >
            {t("home.how.text")}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              gap: 16,
            }}
          >
            <DepthCard>
              <div style={{ fontSize: 24, marginBottom: 6 }}>①</div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {t("home.how.step1Title")}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  opacity: 0.8,
                }}
              >
                {t("home.how.step1Text")}
              </p>
            </DepthCard>

            <DepthCard>
              <div style={{ fontSize: 24, marginBottom: 6 }}>②</div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {t("home.how.step2Title")}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  opacity: 0.8,
                }}
              >
                {t("home.how.step2Text")}
              </p>
            </DepthCard>

            <DepthCard>
              <div style={{ fontSize: 24, marginBottom: 6 }}>③</div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {t("home.how.step3Title")}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  opacity: 0.8,
                }}
              >
                {t("home.how.step3Text")}
              </p>
            </DepthCard>
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
                {t("home.explore.title")}
              </h2>
              <p
                style={{
                  fontSize: 13,
                  opacity: 0.8,
                }}
              >
                {t("home.explore.subtitle")}
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
              {t("home.explore.viewAll")}
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
              { emoji: "🎲", baseKey: "home.explore.cards.boardGames" },
              { emoji: "🚶‍♀️", baseKey: "home.explore.cards.walkTalk" },
              { emoji: "🗣️", baseKey: "home.explore.cards.language" },
              { emoji: "🏃‍♂️", baseKey: "home.explore.cards.sports" },
              { emoji: "💻", baseKey: "home.explore.cards.tech" },
              { emoji: "🎨", baseKey: "home.explore.cards.creative" },
            ].map((item) => (
              <HoverCard key={item.baseKey}>
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
                  {t(`${item.baseKey}.title`)}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  {t(`${item.baseKey}.text`)}
                </div>
              </HoverCard>
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
              {t("home.trust.title")}
            </h2>
            <p
              style={{
                fontSize: 13,
                opacity: 0.8,
                marginBottom: 14,
                maxWidth: 520,
              }}
            >
              {t("home.trust.text")}
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
              <li>• {t("home.trust.bullet1")}</li>
              <li>• {t("home.trust.bullet2")}</li>
              <li>• {t("home.trust.bullet3")}</li>
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
              {t("home.trust.boxTitle")}
            </h3>
            <p
              style={{
                fontSize: 13,
                opacity: 0.85,
                marginBottom: 14,
              }}
            >
              {t("home.trust.boxText")}
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
                  boxShadow:
                    "0 10px 24px rgba(22,163,74,0.45), 0 0 0 1px rgba(21,128,61,0.18)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition:
                    "transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-2px)";
                  el.style.boxShadow =
                    "0 14px 30px rgba(22,163,74,0.6), 0 0 0 1px rgba(21,128,61,0.26)";
                  el.style.filter = "brightness(1.04)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow =
                    "0 10px 24px rgba(22,163,74,0.45), 0 0 0 1px rgba(21,128,61,0.18)";
                  el.style.filter = "brightness(1)";
                }}
              >
                {t("home.trust.browseEvents")}
              </Link>

              {/* Alt secondary CTA */}
              <Link
                href="/hobbies"
                style={{
                  padding: "0.65rem 1.15rem",
                  borderRadius: 999,
                  border: "1px solid rgba(15,23,42,0.15)",
                  background: "rgba(248,250,252,0.92)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#0f172a",
                  textDecoration: "none",
                  boxShadow: "0 6px 16px rgba(15,23,42,0.10)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition:
                    "background-color 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = "#ffffff";
                  el.style.boxShadow =
                    "0 10px 22px rgba(15,23,42,0.16)";
                  el.style.borderColor = "rgba(148,163,184,0.85)";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = "rgba(248,250,252,0.92)";
                  el.style.boxShadow = "0 6px 16px rgba(15,23,42,0.10)";
                  el.style.borderColor = "rgba(15,23,42,0.15)";
                  el.style.transform = "translateY(0)";
                }}
              >
                {t("home.trust.exploreHobbies")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================
 *  Küçük reusable bileşenler
 * ============================ */

type AnimatedNumberProps = {
  value: number;
  duration?: number;
};

function AnimatedNumber({ value, duration = 1200 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frameId: number;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const next = Math.round(value * progress);
      setDisplay(next);
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return <>{display}</>;
}

function DepthCard({ children }: { children: React.ReactNode }) {
  const baseStyle: React.CSSProperties = {
    borderRadius: 18,
    background: "linear-gradient(145deg,#ffffff,#f3f4f6)",
    border: "1px solid rgba(148,163,184,0.22)",
    boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
    padding: "1rem 1.2rem",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  };

  return (
    <div
      style={baseStyle}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 14px 28px rgba(15,23,42,0.14)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "0 8px 20px rgba(15,23,42,0.06)";
      }}
    >
      {children}
    </div>
  );
}

function HoverCard({ children }: { children: React.ReactNode }) {
  const baseStyle: React.CSSProperties = {
    borderRadius: 18,
    border: "1px solid var(--card-border)",
    background: "rgba(15,23,42,0.02)",
    padding: "0.8rem 0.9rem",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    transition:
      "transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
  };

  return (
    <div
      style={baseStyle}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 10px 22px rgba(15,23,42,0.14)";
        el.style.backgroundColor = "rgba(248,250,252,0.96)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
        el.style.backgroundColor = "rgba(15,23,42,0.02)";
      }}
    >
      {children}
    </div>
  );
}
