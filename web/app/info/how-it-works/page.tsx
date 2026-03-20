"use client";

import { useLanguage } from "../../context/LanguageContext";

export default function HowItWorksPage() {
  const { t: baseT } = useLanguage();

  const t = (key: string): string => {
    const original = baseT(key);
    if (original && original !== key) return original;

    switch (key) {
      case "legal.how.title":
        return "How Moventra Works";
      case "legal.how.intro":
        return "Moventra is built around small, relaxed, hobby-based meetups. This page explains, in simple language, how the platform works from creating an account to joining or hosting events.";
      case "legal.how.section.account":
        return "1. Creating your account";
      case "legal.how.account.1":
        return "You sign up with your email address or a supported single sign-on provider. We ask for a name and your city so that events can be localised.";
      case "legal.how.account.2":
        return "Some profile fields such as gender or a short bio are optional. You decide how much you want to share.";
      case "legal.how.account.3":
        return "You can update or correct most profile information at any time in Settings.";
      case "legal.how.section.hobbies":
        return "2. Choosing hobbies and interests";
      case "legal.how.hobbies.1":
        return "Moventra is organised around hobbies such as language exchange, hiking, board games, coding, arts and many more.";
      case "legal.how.hobbies.2":
        return "During onboarding you select the topics you care about. These choices are used to pre-fill your recommendations.";
      case "legal.how.hobbies.3":
        return "You can add or remove interests later. Your recommendations will adapt over time.";
      case "legal.how.section.discovery":
        return "3. Discovering events";
      case "legal.how.discovery.1":
        return "The events page shows upcoming meetups in your city or online. You can filter by hobby, date or distance.";
      case "legal.how.discovery.2":
        return "Small-group, hobby-focused events are prioritised over large, anonymous gatherings.";
      case "legal.how.discovery.3":
        return "You can see basic event details such as location area, languages, capacity and who is hosting.";
      case "legal.how.section.join":
        return "4. Joining an event";
      case "legal.how.join.1":
        return "When you join, the organiser can see your profile name and relevant details needed to manage the meetup.";
      case "legal.how.join.2":
        return "The organiser may send you updates through the event chat, such as meeting point changes or last-minute notes.";
      case "legal.how.join.3":
        return "If you can no longer attend, you are encouraged to leave the event so your spot becomes available to someone else.";
      case "legal.how.section.host":
        return "5. Hosting your own meetups";
      case "legal.how.host.1":
        return "Once your account is in good standing, you can create new events: choose a hobby, date/time, approximate location and a short description.";
      case "legal.how.host.2":
        return "Moventra helps you keep track of who has joined, sends notifications to participants, and provides a simple event chat.";
      case "legal.how.host.3":
        return "Hosts are expected to respect local laws, community guidelines and safety recommendations. Additional host guidelines are available on a separate page.";
      case "legal.how.section.messaging":
        return "6. Messaging and notifications";
      case "legal.how.messaging.1":
        return "Event chats are designed for practical coordination and friendly conversation related to the meetup.";
      case "legal.how.messaging.2":
        return "You may receive notifications about events you joined, direct messages (if enabled) and important safety or product updates.";
      case "legal.how.messaging.3":
        return "Notification settings can be adjusted in your account or device settings where supported.";
      case "legal.how.section.limitations":
        return "7. Early-stage limitations";
      case "legal.how.limitations.1":
        return "Moventra is currently in an early product stage. Features may change, and availability may be limited to certain cities or regions.";
      case "legal.how.limitations.2":
        return "We may temporarily disable certain functions if we detect abuse, spam or technical problems.";
      case "legal.how.limitations.3":
        return "This page is a human-readable overview and does not replace formal legal terms or policies.";
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
              {t("legal.how.title")}
            </h1>
            <p
              style={{
                fontSize: 13,
                opacity: 0.85,
                marginBottom: 16,
                maxWidth: 620,
              }}
            >
              {t("legal.how.intro")}
            </p>

            {/* 1. Account */}
            <section style={{ marginTop: 4, marginBottom: 14 }}>
              <h2 style={sectionTitle}>{t("legal.how.section.account")}</h2>
              <ul style={listStyle}>
                <li>{t("legal.how.account.1")}</li>
                <li>{t("legal.how.account.2")}</li>
                <li>{t("legal.how.account.3")}</li>
              </ul>
            </section>

            {/* 2. Hobbies */}
            <section style={{ marginBottom: 14 }}>
              <h2 style={sectionTitle}>{t("legal.how.section.hobbies")}</h2>
              <ul style={listStyle}>
                <li>{t("legal.how.hobbies.1")}</li>
                <li>{t("legal.how.hobbies.2")}</li>
                <li>{t("legal.how.hobbies.3")}</li>
              </ul>
            </section>

            {/* 3. Discovery */}
            <section style={{ marginBottom: 14 }}>
              <h2 style={sectionTitle}>{t("legal.how.section.discovery")}</h2>
              <ul style={listStyle}>
                <li>{t("legal.how.discovery.1")}</li>
                <li>{t("legal.how.discovery.2")}</li>
                <li>{t("legal.how.discovery.3")}</li>
              </ul>
            </section>

            {/* 4. Joining */}
            <section style={{ marginBottom: 14 }}>
              <h2 style={sectionTitle}>{t("legal.how.section.join")}</h2>
              <ul style={listStyle}>
                <li>{t("legal.how.join.1")}</li>
                <li>{t("legal.how.join.2")}</li>
                <li>{t("legal.how.join.3")}</li>
              </ul>
            </section>

            {/* 5. Hosting */}
            <section style={{ marginBottom: 14 }}>
              <h2 style={sectionTitle}>{t("legal.how.section.host")}</h2>
              <ul style={listStyle}>
                <li>{t("legal.how.host.1")}</li>
                <li>{t("legal.how.host.2")}</li>
                <li>{t("legal.how.host.3")}</li>
              </ul>
            </section>

            {/* 6. Messaging */}
            <section style={{ marginBottom: 14 }}>
              <h2 style={sectionTitle}>{t("legal.how.section.messaging")}</h2>
              <ul style={listStyle}>
                <li>{t("legal.how.messaging.1")}</li>
                <li>{t("legal.how.messaging.2")}</li>
                <li>{t("legal.how.messaging.3")}</li>
              </ul>
            </section>

            {/* 7. Limitations */}
            <section style={{ marginBottom: 12 }}>
              <h2 style={sectionTitle}>{t("legal.how.section.limitations")}</h2>
              <ul style={listStyle}>
                <li>{t("legal.how.limitations.1")}</li>
                <li>{t("legal.how.limitations.2")}</li>
                <li>{t("legal.how.limitations.3")}</li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      {/* Glow animasyonu */}
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
