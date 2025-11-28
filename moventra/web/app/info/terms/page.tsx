"use client";

import { useLanguage } from "../../context/LanguageContext";

export default function TermsPage() {
  const { t: baseT } = useLanguage();

  const t = (key: string): string => {
    const original = baseT(key);
    if (original && original !== key) return original;

    switch (key) {
      case "legal.terms.title":
        return "Terms of Use";
      case "legal.terms.intro":
        return "These terms describe how Moventra should be used while the product is in its early stage. They are written in simple language and will later be complemented by a full legal document.";
      case "legal.terms.section.account":
        return "1. Your account";
      case "legal.terms.account.1":
        return "You must be at least 13 years old to create an account and attend events through Moventra.";
      case "legal.terms.account.2":
        return "You are responsible for keeping your login details secure and for activity that happens under your account.";
      case "legal.terms.account.3":
        return "Fake profiles, impersonation of other people or organisations, and deliberately misleading information are not allowed.";
      case "legal.terms.section.behaviour":
        return "2. Behaviour and community rules";
      case "legal.terms.behaviour.1":
        return "Moventra focuses on respectful, hobby-first meetups. Harassment, discrimination, hate speech or threatening behaviour is not tolerated.";
      case "legal.terms.behaviour.2":
        return "You may not use Moventra to promote illegal activity, dangerous behaviour or events that violate local law.";
      case "legal.terms.behaviour.3":
        return "Unwanted advertising, spam messaging or scraping data from the platform is not permitted.";
      case "legal.terms.section.content":
        return "3. Content you share";
      case "legal.terms.content.1":
        return "You keep the rights to content you create (such as event descriptions or messages), but you grant Moventra a licence to display it within the service.";
      case "legal.terms.content.2":
        return "You may only upload content that you have the right to use and that does not infringe the rights of others.";
      case "legal.terms.content.3":
        return "We may remove or hide content that breaks these rules, is clearly abusive or appears unsafe.";
      case "legal.terms.section.service":
        return "4. Changes to the service";
      case "legal.terms.service.1":
        return "Moventra is still evolving. Features, layouts and availability may change, sometimes without prior notice.";
      case "legal.terms.service.2":
        return "We do not guarantee continuous uptime or error-free operation, although we aim for a stable experience.";
      case "legal.terms.service.3":
        return "Accounts that seriously or repeatedly break the rules may be restricted or suspended to protect the community.";
      case "legal.terms.section.liability":
        return "5. Liability and responsibility";
      case "legal.terms.liability.1":
        return "Moventra helps you organise and discover events, but we do not control what happens at in-person meetups. Participants remain responsible for their own behaviour and safety.";
      case "legal.terms.liability.2":
        return "You should always follow local laws, health guidance and venue rules when attending or hosting events.";
      case "legal.terms.liability.3":
        return "To the extent permitted by law, Moventra is not liable for damages arising from user behaviour, third-party services or events organised through the platform.";
      case "legal.terms.disclaimer":
        return "This summary is meant to be readable and transparent. A more detailed and jurisdiction-specific legal text will be added as Moventra grows.";
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
              {t("legal.terms.title")}
            </h1>
            <p
              style={{
                fontSize: 13,
                opacity: 0.85,
                marginBottom: 16,
                maxWidth: 620,
              }}
            >
              {t("legal.terms.intro")}
            </p>

            <section style={{ marginTop: 4, marginBottom: 14 }}>
              <h2 style={sectionTitle}>{t("legal.terms.section.account")}</h2>
              <ul style={listStyle}>
                <li>{t("legal.terms.account.1")}</li>
                <li>{t("legal.terms.account.2")}</li>
                <li>{t("legal.terms.account.3")}</li>
              </ul>
            </section>

            <section style={{ marginBottom: 14 }}>
              <h2 style={sectionTitle}>
                {t("legal.terms.section.behaviour")}
              </h2>
              <ul style={listStyle}>
                <li>{t("legal.terms.behaviour.1")}</li>
                <li>{t("legal.terms.behaviour.2")}</li>
                <li>{t("legal.terms.behaviour.3")}</li>
              </ul>
            </section>

            <section style={{ marginBottom: 14 }}>
              <h2 style={sectionTitle}>{t("legal.terms.section.content")}</h2>
              <ul style={listStyle}>
                <li>{t("legal.terms.content.1")}</li>
                <li>{t("legal.terms.content.2")}</li>
                <li>{t("legal.terms.content.3")}</li>
              </ul>
            </section>

            <section style={{ marginBottom: 14 }}>
              <h2 style={sectionTitle}>{t("legal.terms.section.service")}</h2>
              <ul style={listStyle}>
                <li>{t("legal.terms.service.1")}</li>
                <li>{t("legal.terms.service.2")}</li>
                <li>{t("legal.terms.service.3")}</li>
              </ul>
            </section>

            <section style={{ marginBottom: 12 }}>
              <h2 style={sectionTitle}>
                {t("legal.terms.section.liability")}
              </h2>
              <ul style={listStyle}>
                <li>{t("legal.terms.liability.1")}</li>
                <li>{t("legal.terms.liability.2")}</li>
                <li>{t("legal.terms.liability.3")}</li>
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
              {t("legal.terms.disclaimer")}
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
