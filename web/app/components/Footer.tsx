"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import type { Language } from "../context/LanguageContext";

const AVAILABLE_LANGUAGES: Language[] = ["en", "tr", "de"];

// Creamy palette – events sayfasıyla aynı aile
const PAGE_BG = "#f7f3e9";
const CARD_BG = "linear-gradient(135deg,#fffdf8,#f8f3e5)";
const CARD_BORDER = "#e8e2d8";
const CARD_SHADOW = "0 14px 32px rgba(100,85,30,0.10)";
const SOFT_CARD_BG = "#fdf9f2";
const SOFT_CARD_BORDER = "#e8e0d4";
const PRIMARY_TEXT = "#3b2d10";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t, language, setLanguage } = useLanguage();

  return (
    <footer
      style={{
        width: "100%",
        marginTop: "3rem",
        padding: "1.5rem 1rem 2.5rem",
        backgroundColor: PAGE_BG,
        color: PRIMARY_TEXT,
        fontFamily: "system-ui, sans-serif",
        borderTop: `1px solid ${SOFT_CARD_BORDER}`,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Üst CTA banner – krem & amber */}
        <section
          style={{
            borderRadius: 24,
            padding: "1.6rem 1.8rem",
            background: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
            color: PRIMARY_TEXT,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            boxShadow: CARD_SHADOW,
          }}
        >
          <div
            style={{
              maxWidth: 520,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 0.3,
                color: "#111827",
              }}
            >
              {t("footer.ctaTitle")}
            </h2>
            <p
              style={{
                fontSize: 14,
                opacity: 0.9,
                color: "#4b5563",
              }}
            >
              {t("footer.ctaText")}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              alignItems: "flex-end",
              minWidth: 180,
            }}
          >
            <Link
              href="/events/new"
              style={{
                padding: "0.7rem 1.3rem",
                borderRadius: 999,
                border: "1px solid #f4d9a6",
                background: "linear-gradient(135deg,#ffecc7,#ffdfae)",
                color: PRIMARY_TEXT,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 14px 30px rgba(149,119,46,0.35)",
              }}
            >
              {t("footer.ctaButton")}
            </Link>
            <p
              style={{
                fontSize: 11,
                opacity: 0.8,
                textAlign: "right",
                maxWidth: 260,
                color: "#6b7280",
              }}
            >
              {t("footer.ctaNote")}
            </p>
          </div>
        </section>

        {/* Mini stats – krem pill */}
        <section
          style={{
            borderRadius: 999,
            padding: "0.7rem 1.3rem",
            backgroundColor: "#fffdf8",
            border: `1px solid ${SOFT_CARD_BORDER}`,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            fontSize: 12,
            boxShadow: "0 8px 18px rgba(149,119,46,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              opacity: 0.9,
              color: "#4b5563",
            }}
          >
            <span>
              <strong>12</strong> {t("footer.miniStats.cities")}
            </span>
            <span style={{ opacity: 0.6 }}>·</span>
            <span>
              <strong>58</strong> {t("footer.miniStats.hobbies")}
            </span>
            <span style={{ opacity: 0.6 }}>·</span>
            <span>
              <strong>143</strong> {t("footer.miniStats.events")}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              opacity: 0.9,
              color: "#4b5563",
            }}
          >
            <span style={{ opacity: 0.8 }}>
              {t("footer.miniStats.currentlyExploring")}
            </span>
            <span
              style={{
                fontWeight: 600,
                color: PRIMARY_TEXT,
              }}
            >
              Berlin, Germany
            </span>
            <span style={{ opacity: 0.6 }}>·</span>
            <Link
              href="/events"
              style={{
                fontSize: 12,
                textDecoration: "underline",
                textUnderlineOffset: 3,
                opacity: 0.9,
                color: "#92400e",
              }}
            >
              {t("footer.miniStats.changeCity")}
            </Link>
          </div>
        </section>

        {/* Alt footer alanı – krem kart */}
        <section
          style={{
            borderRadius: 24,
            padding: "1.6rem 1.8rem",
            backgroundColor: SOFT_CARD_BG,
            border: `1px solid ${SOFT_CARD_BORDER}`,
            display: "grid",
            gridTemplateColumns: "minmax(0,2fr) repeat(3,minmax(0,1fr))",
            gap: 18,
            boxShadow: CARD_SHADOW,
          }}
        >
          {/* Sol kolon – marka açıklaması */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg,#ffecc7,#fdba74,#fb923c)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 12px rgba(249,115,22,0.45)",
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    color: "#fff7ed",
                  }}
                >
                  M
                </span>
              </div>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  color: "#111827",
                }}
              >
                Moventra
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                opacity: 0.8,
                maxWidth: 280,
                color: "#4b5563",
              }}
            >
              {t("footer.brandText")}
            </p>
            <p
              style={{
                fontSize: 11,
                opacity: 0.8,
                maxWidth: 260,
                color: "#6b7280",
              }}
            >
              {t("footer.brandSubText")}
            </p>
          </div>

          {/* Orta kolonlar – linkler */}
          <div>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 8,
                color: "#111827",
              }}
            >
              {t("footer.discoverTitle")}
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: 13,
                opacity: 0.9,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                color: "#4b5563",
              }}
            >
              <li>
                <Link
                  href="/events"
                  style={{
                    textDecoration: "none",
                    color: "#4b5563",
                    cursor: "pointer",
                  }}
                >
                  {t("footer.discoverItems.nearYou")}
                </Link>
              </li>
              <li>
                <Link
                  href="/hobbies"
                  style={{
                    textDecoration: "none",
                    color: "#4b5563",
                    cursor: "pointer",
                  }}
                >
                  {t("footer.discoverItems.popular")}
                </Link>
              </li>
              <li>
                <Link
                  href="/events?type=remote"
                  style={{
                    textDecoration: "none",
                    color: "#4b5563",
                    cursor: "pointer",
                  }}
                >
                  {t("footer.discoverItems.remote")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 8,
                color: "#111827",
              }}
            >
              {t("footer.organizersTitle")}
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: 13,
                opacity: 0.9,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                color: "#4b5563",
              }}
            >
              <li>
                <Link
                  href="/info/how-it-works"
                  style={{
                    textDecoration: "none",
                    color: "#4b5563",
                    cursor: "pointer",
                  }}
                >
                  {t("footer.organizersItems.howItWorks")}
                </Link>
              </li>
              <li>
                <Link
                  href="/info/host-guidelines"
                  style={{
                    textDecoration: "none",
                    color: "#4b5563",
                    cursor: "pointer",
                  }}
                >
                  {t("footer.organizersItems.hostGuidelines")}
                </Link>
              </li>
              <li>
                <Link
                  href="/info/safety-tips"
                  style={{
                    textDecoration: "none",
                    color: "#4b5563",
                    cursor: "pointer",
                  }}
                >
                  {t("footer.organizersItems.safetyTips")}
                </Link>
              </li>
            </ul>
            <p
              style={{
                fontSize: 11,
                opacity: 0.8,
                marginTop: 8,
                maxWidth: 220,
                color: "#6b7280",
              }}
            >
              {t("footer.organizersNote")}
            </p>
          </div>

          {/* Sosyal & newsletter */}
          <div>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 8,
                color: "#111827",
              }}
            >
              {t("footer.connectTitle")}
            </h3>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 10,
              }}
            >
              {["📷", "✕", "▶"].map((icon, idx) => (
                <button
                  key={idx}
                  type="button"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    border: `1px solid ${SOFT_CARD_BORDER}`,
                    backgroundColor: "#fffdf8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                  aria-label="Social (coming soon)"
                >
                  {icon}
                </button>
              ))}
            </div>

            <p
              style={{
                fontSize: 11,
                opacity: 0.75,
                marginBottom: 10,
                color: "#6b7280",
              }}
            >
              {t("footer.connectNote")}
            </p>

            {/* Newsletter pill */}
            <div
              style={{
                marginTop: 6,
                padding: "0.6rem 0.7rem",
                borderRadius: 999,
                border: `1px dashed ${SOFT_CARD_BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
                fontSize: 11,
                backgroundColor: "#fffdf8",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <input
                disabled
                placeholder={t("footer.newsletterPlaceholder")}
                style={{
                  flex: 1,
                  minWidth: 120,
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  fontSize: 11,
                  opacity: 0.8,
                  color: "#4b5563",
                }}
              />
              <button
                type="button"
                disabled
                style={{
                  borderRadius: 999,
                  border: "1px solid #f4d9a6",
                  padding: "0.25rem 0.7rem",
                  fontSize: 11,
                  fontWeight: 600,
                  backgroundColor: "#ffecc7",
                  color: PRIMARY_TEXT,
                  cursor: "not-allowed",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  marginTop: 2,
                }}
              >
                {t("footer.newsletterButton")}
              </button>
            </div>
          </div>
        </section>

        {/* En alt satır */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            fontSize: 11,
            opacity: 0.8,
            paddingTop: 4,
            color: "#6b7280",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              alignItems: "center",
            }}
          >
            <span>
              © {currentYear} Moventra. {t("footer.bottom.rights")}
            </span>
            <span style={{ opacity: 0.6 }}>·</span>
            <span>{t("footer.bottom.builtWithLove")}</span>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
            }}
          >
            <Link
              href="/info/terms"
              style={{
                textDecoration: "none",
                color: "#6b7280",
                cursor: "pointer",
              }}
            >
              {t("footer.bottom.terms")}
            </Link>
            <Link
              href="/info/privacy"
              style={{
                textDecoration: "none",
                color: "#6b7280",
                cursor: "pointer",
              }}
            >
              {t("footer.bottom.privacy")}
            </Link>
            <Link
              href="/info/cookies"
              style={{
                textDecoration: "none",
                color: "#6b7280",
                cursor: "pointer",
              }}
            >
              {t("footer.bottom.cookies")}
            </Link>
            <span
              style={{
                width: 1,
                height: 14,
                backgroundColor: "rgba(148,163,184,0.6)",
              }}
            />
            <span>
              {t("footer.bottom.languageLabel")}:{" "}
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isActive = lang === language;
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      marginLeft: 4,
                      marginRight: 2,
                      fontWeight: isActive ? 700 : 400,
                      opacity: isActive ? 1 : 0.7,
                      cursor: "pointer",
                      textDecoration: isActive ? "underline" : "none",
                      color: isActive ? "#111827" : "#6b7280",
                    }}
                  >
                    {lang.toUpperCase()}
                  </button>
                );
              })}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
