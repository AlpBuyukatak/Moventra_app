"use client";

import { useLanguage } from "../../context/LanguageContext";

export default function PrivacyPage() {
  const { t: baseT } = useLanguage();

  const t = (key: string): string => {
    const original = baseT(key);
    if (original && original !== key) return original;

    switch (key) {
      case "legal.privacy.title":
        return "Privacy";
      case "legal.privacy.intro":
        return "Moventra is designed for small, real-world communities. We try to collect only the data we really need to run the service.";
      case "legal.privacy.section.data":
        return "What data we store";
      case "legal.privacy.data.1":
        return "Account data: your email address, name, password hash, and basic profile details such as city and chosen hobbies.";
      case "legal.privacy.data.2":
        return "Usage data: events you create or join, messages you send in event chats, and preferences like language and notification settings.";
      case "legal.privacy.data.3":
        return "Technical data: basic logs like IP address, browser type and timestamps, mainly to keep the platform secure and to prevent abuse.";
      case "legal.privacy.data.4":
        return "Analytics: aggregated, anonymised statistics to understand which features are used and to improve the product over time.";
      case "legal.privacy.section.why":
        return "How we use this data";
      case "legal.privacy.why.1":
        return "To run your account: log you in, remember your language and city, and show you relevant events and hobbies.";
      case "legal.privacy.why.2":
        return "To keep the community safe: detect spam, fake accounts, abusive behaviour and technical attacks on the platform.";
      case "legal.privacy.why.3":
        return "To improve Moventra: see which pages people visit, which features work well, and where people get stuck or drop out.";
      case "legal.privacy.why.4":
        return "To communicate with you: occasionally send important updates about security, changes to terms or product-level announcements.";
      case "legal.privacy.section.rights":
        return "Your controls and rights";
      case "legal.privacy.rights.1":
        return "You can edit basic profile data (name, city, hobbies, visibility settings) at any time in Settings.";
      case "legal.privacy.rights.2":
        return "You can request a copy of your personal data or ask us to delete it via the GDPR / privacy section in Settings.";
      case "legal.privacy.rights.3":
        return "You can leave or delete events you created, and you can remove content that you posted, where technically possible.";
      case "legal.privacy.rights.4":
        return "You can control cookies and local storage through your browser settings. Some essential cookies are required for login and security.";
      case "legal.privacy.disclaimer":
        return "This is a human-readable summary for the early product stage and does not replace a full legal privacy policy. As Moventra grows, we will provide a more detailed legal document.";
      default:
        return original || key;
    }
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
        <div
          style={{
            borderRadius: 24,
            padding: "1.7rem 1.8rem 2rem",
            background:
              "radial-gradient(circle at top,#eef2ff,#fdfbff 55%)",
            border: "1px solid rgba(129,140,248,0.7)",
            boxShadow: "0 22px 52px rgba(79,70,229,0.28)",
            color: "#111827",
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {t("legal.privacy.title")}
          </h1>
          <p
            style={{
              fontSize: 13,
              opacity: 0.85,
              marginBottom: 16,
              maxWidth: 580,
            }}
          >
            {t("legal.privacy.intro")}
          </p>

          {/* What data we store */}
          <section
            style={{
              marginTop: 4,
              marginBottom: 14,
            }}
          >
            <h2
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {t("legal.privacy.section.data")}
            </h2>
            <ul
              style={{
                paddingLeft: 18,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontSize: 12,
                opacity: 0.9,
              }}
            >
              <li>{t("legal.privacy.data.1")}</li>
              <li>{t("legal.privacy.data.2")}</li>
              <li>{t("legal.privacy.data.3")}</li>
              <li>{t("legal.privacy.data.4")}</li>
            </ul>
          </section>

          {/* Why we use it */}
          <section
            style={{
              marginBottom: 14,
            }}
          >
            <h2
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {t("legal.privacy.section.why")}
            </h2>
            <ul
              style={{
                paddingLeft: 18,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontSize: 12,
                opacity: 0.9,
              }}
            >
              <li>{t("legal.privacy.why.1")}</li>
              <li>{t("legal.privacy.why.2")}</li>
              <li>{t("legal.privacy.why.3")}</li>
              <li>{t("legal.privacy.why.4")}</li>
            </ul>
          </section>

          {/* Rights & controls */}
          <section
            style={{
              marginBottom: 12,
            }}
          >
            <h2
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {t("legal.privacy.section.rights")}
            </h2>
            <ul
              style={{
                paddingLeft: 18,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontSize: 12,
                opacity: 0.9,
              }}
            >
              <li>{t("legal.privacy.rights.1")}</li>
              <li>{t("legal.privacy.rights.2")}</li>
              <li>{t("legal.privacy.rights.3")}</li>
              <li>{t("legal.privacy.rights.4")}</li>
            </ul>
          </section>

          <p
            style={{
              marginTop: 6,
              fontSize: 11,
              opacity: 0.8,
              maxWidth: 600,
            }}
          >
            {t("legal.privacy.disclaimer")}
          </p>
        </div>
      </div>
    </main>
  );
}
