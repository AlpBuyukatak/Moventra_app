"use client";

import { useLanguage } from "../../context/LanguageContext";

export default function CookiesPage() {
  const { t: baseT } = useLanguage();

  const t = (key: string): string => {
    const original = baseT(key);
    if (original && original !== key) return original;

    switch (key) {
      case "legal.cookies.title":
        return "Cookies & Local Storage";
      case "legal.cookies.intro":
        return "Moventra uses a small number of cookies and local storage entries to keep your account running securely and to remember your preferences. We avoid unnecessary tracking and do not sell your data to advertisers.";
      case "legal.cookies.section.what":
        return "1. What we store";
      case "legal.cookies.what.1":
        return "Session cookies: used to keep you logged in securely and to protect your account from unauthorised access.";
      case "legal.cookies.what.2":
        return "Preference storage: language, interface options and onboarding progress may be stored in your browser so the site feels familiar each time you return.";
      case "legal.cookies.what.3":
        return "Basic technical logs: for example, error information when something breaks, to help us debug and keep Moventra stable.";
      case "legal.cookies.section.why":
        return "2. Why we use these technologies";
      case "legal.cookies.why.1":
        return "To provide core functionality such as secure login, event participation and profile management.";
      case "legal.cookies.why.2":
        return "To remember harmless settings like your last selected language or city, so you do not need to choose them every time.";
      case "legal.cookies.why.3":
        return "To understand, in an aggregated way, which pages are used, so we can improve the product without building detailed personal profiles.";
      case "legal.cookies.section.third":
        return "3. Third-party services";
      case "legal.cookies.third.1":
        return "Some features may rely on third-party providers in the future (for example maps, payment providers or video tools). They may set their own cookies or similar technologies.";
      case "legal.cookies.third.2":
        return "When we add such integrations, we will clearly describe which partner is involved and what data they receive.";
      case "legal.cookies.section.control":
        return "4. How you can control cookies";
      case "legal.cookies.control.1":
        return "You can clear cookies and local storage at any time using your browser settings. This may log you out and reset some preferences.";
      case "legal.cookies.control.2":
        return "You can block certain categories of cookies in your browser, but essential ones are required for login and basic security.";
      case "legal.cookies.control.3":
        return "As regulations evolve, we plan to add in-product controls for optional analytics and third-party tools where required.";
      case "legal.cookies.disclaimer":
        return "This cookie summary explains the current early-stage behaviour of Moventra. It will be expanded into a more formal and jurisdiction-specific document as the platform grows.";
      default:
        return original || key;
    }
  };

  const outerStyle = {
    position: "relative" as const,
    borderRadius: 30,
    padding: "2px",
  };

  const glowStyle = {
    position: "absolute" as const,
    inset: 0,
    borderRadius: 30,
    background:
      "conic-gradient(from 180deg,#c7d2fe,#a5b4fc,#f9a8d4,#bef264,#c7d2fe)",
    filter: "blur(18px)",
    opacity: 0.9,
    zIndex: 0,
    animation: "moventraGlow 60s linear infinite",
  };

  const cardStyle = {
    position: "relative" as const,
    borderRadius: 24,
    padding: "1.7rem 1.8rem 2rem",
    background: "radial-gradient(circle at top,#eef2ff,#fdfbff 55%)",
    border: "1px solid rgba(129,140,248,0.65)",
    boxShadow: "0 24px 60px rgba(79,70,229,0.25)",
    color: "#111827",
    zIndex: 1,
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 6,
  };

  const listStyle: React.CSSProperties = {
    paddingLeft: 18,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 12,
    opacity: 0.9,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <div style={outerStyle}>
          <div style={glowStyle} />
          <div style={cardStyle}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              {t("legal.cookies.title")}
            </h1>
            <p
              style={{
                fontSize: 13,
                opacity: 0.85,
                marginBottom: 16,
                maxWidth: 620,
              }}
            >
              {t("legal.cookies.intro")}
            </p>

            <section style={{ marginTop: 4, marginBottom: 14 }}>
              <h2 style={sectionTitle}>{t("legal.cookies.section.what")}</h2>
              <ul style={listStyle}>
                <li>{t("legal.cookies.what.1")}</li>
                <li>{t("legal.cookies.what.2")}</li>
                <li>{t("legal.cookies.what.3")}</li>
              </ul>
            </section>

            <section style={{ marginBottom: 14 }}>
              <h2 style={sectionTitle}>{t("legal.cookies.section.why")}</h2>
              <ul style={listStyle}>
                <li>{t("legal.cookies.why.1")}</li>
                <li>{t("legal.cookies.why.2")}</li>
                <li>{t("legal.cookies.why.3")}</li>
              </ul>
            </section>

            <section style={{ marginBottom: 14 }}>
              <h2 style={sectionTitle}>{t("legal.cookies.section.third")}</h2>
              <ul style={listStyle}>
                <li>{t("legal.cookies.third.1")}</li>
                <li>{t("legal.cookies.third.2")}</li>
              </ul>
            </section>

            <section style={{ marginBottom: 12 }}>
              <h2 style={sectionTitle}>{t("legal.cookies.section.control")}</h2>
              <ul style={listStyle}>
                <li>{t("legal.cookies.control.1")}</li>
                <li>{t("legal.cookies.control.2")}</li>
                <li>{t("legal.cookies.control.3")}</li>
              </ul>
            </section>

            <p
              style={{
                marginTop: 6,
                fontSize: 11,
                opacity: 0.8,
                maxWidth: 620,
              }}
            >
              {t("legal.cookies.disclaimer")}
            </p>
          </div>
        </div>
      </div>

      <style>
        {`
        @keyframes moventraGlow {
          75%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
      </style>
    </main>
  );
}
