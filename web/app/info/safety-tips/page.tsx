"use client";

import { useLanguage } from "../../context/LanguageContext";

export default function SafetyTipsPage() {
  const { t: baseT } = useLanguage();

  const t = (key: string): string => {
    const original = baseT(key);
    if (original && original !== key) return original;

    switch (key) {
      case "info.safety.title":
        return "Safety tips";
      case "info.safety.subtitle":
        return "A few simple habits make offline meetups much safer, calmer and more enjoyable.";
      case "info.safety.person.title":
        return "Personal safety";
      case "info.safety.person.1":
        return "For first events, meet in public places – cafés, parks, libraries, community centres or coworking spaces.";
      case "info.safety.person.2":
        return "Tell a friend or family member where you are going, with whom, and when you expect to be back.";
      case "info.safety.person.3":
        return "Keep your own transport options in mind (enough battery, ticket, taxi/ride-share app, etc.) so you can leave anytime.";
      case "info.safety.person.4":
        return "Do not share more personal information than you feel comfortable with. It is fine to keep some details private.";
      case "info.safety.person.5":
        return "Trust your feeling. If something feels off or uncomfortable, you can always leave early – you do not need a special reason.";
      case "info.safety.community.title":
        return "Community behaviour";
      case "info.safety.community.1":
        return "Be kind and respectful. No harassment, hate speech, discrimination or bullying is allowed at Moventra events.";
      case "info.safety.community.2":
        return "Romantic or sexual attention must always be welcome and mutual. Unwanted flirting, repeated pushing or touching is not acceptable.";
      case "info.safety.community.3":
        return "Respect boundaries immediately. “No” or “I’m not comfortable with that” should be enough for the topic or behaviour to stop.";
      case "info.safety.community.4":
        return "Keep discussions constructive. You can disagree about politics, sports or opinions – but stay calm and avoid personal attacks.";
      case "info.safety.community.5":
        return "If you see someone being isolated or uncomfortable, check in with them or inform the host.";
      case "info.safety.platform.title":
        return "Using Moventra safely";
      case "info.safety.platform.1":
        return "Use the official platform or in-app messages for coordination. Be careful with links that look suspicious or ask for login data.";
      case "info.safety.platform.2":
        return "Moventra team will never ask for your password or full login code via chat, email or phone.";
      case "info.safety.platform.3":
        return "If an account or message feels fake, aggressive or scam-like (money requests, strange investment offers), do not reply and report it.";
      case "info.safety.platform.4":
        return "Check the event details carefully before you go: time, exact location, organiser name and any costs.";
      case "info.safety.platform.5":
        return "Use the report tools or contact support if you experience or witness behaviour that breaks these guidelines.";
      case "info.safety.note":
        return "Safety is a shared responsibility. Most meetups are friendly and relaxed – these tips just help protect that atmosphere.";
      default:
        return original || key;
    }
  };

  const outerStyle = {
    position: "relative",
    borderRadius: 30,
    padding: "2px",
  } as const;

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
    padding: "1.8rem 1.9rem 2.1rem",
    background:
      "radial-gradient(circle at top,#eef2ff,#fdfbff 55%)",
    border: "1px solid rgba(129,140,248,0.65)",
    boxShadow: "0 24px 60px rgba(79,70,229,0.25)",
    color: "#0f172a",
    zIndex: 1,
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
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              {t("info.safety.title")}
            </h1>
            <p
              style={{
                fontSize: 14,
                opacity: 0.9,
                marginBottom: 18,
                maxWidth: 560,
              }}
            >
              {t("info.safety.subtitle")}
            </p>

            {[
              {
                titleKey: "info.safety.person.title",
                items: [
                  "info.safety.person.1",
                  "info.safety.person.2",
                  "info.safety.person.3",
                  "info.safety.person.4",
                  "info.safety.person.5",
                ],
              },
              {
                titleKey: "info.safety.community.title",
                items: [
                  "info.safety.community.1",
                  "info.safety.community.2",
                  "info.safety.community.3",
                  "info.safety.community.4",
                  "info.safety.community.5",
                ],
              },
              {
                titleKey: "info.safety.platform.title",
                items: [
                  "info.safety.platform.1",
                  "info.safety.platform.2",
                  "info.safety.platform.3",
                  "info.safety.platform.4",
                  "info.safety.platform.5",
                ],
              },
            ].map((section, idx) => (
              <section
                key={idx}
                style={{
                  marginTop: idx === 0 ? 4 : 16,
                }}
              >
                <h2
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  {t(section.titleKey)}
                </h2>
                <ul
                  style={{
                    paddingLeft: 18,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  {section.items.map((itemKey) => (
                    <li
                      key={itemKey}
                      style={{
                        fontSize: 12,
                        opacity: 0.95,
                      }}
                    >
                      {t(itemKey)}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <p
              style={{
                marginTop: 18,
                fontSize: 12,
                opacity: 0.85,
                maxWidth: 560,
              }}
            >
              {t("info.safety.note")}
            </p>
          </div>
        </div>
      </div>

      <style>
        {`
        @keyframes moventraGlow {
          80%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
      </style>
    </main>
  );
}
