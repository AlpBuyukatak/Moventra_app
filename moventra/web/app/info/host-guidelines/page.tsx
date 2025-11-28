"use client";

import { useLanguage } from "../../context/LanguageContext";

export default function HostGuidelinesPage() {
  const { t: baseT } = useLanguage();

  const t = (key: string): string => {
    const original = baseT(key);
    if (original && original !== key) return original;

    // Fallback İngilizce metinler
    switch (key) {
      case "info.host.title":
        return "Host guidelines";
      case "info.host.subtitle":
        return "Simple rules to keep Moventra events safe, welcoming and respectful for everyone.";
      case "info.host.section.before":
        return "Before your event";
      case "info.host.before.1":
        return "Write a clear, honest description: who is this event for, what will you actually do, and what level (beginner / intermediate / advanced) people should expect.";
      case "info.host.before.2":
        return "Choose a realistic group size. Moventra is about small, human meetups – usually 4–12 people is ideal for real conversations.";
      case "info.host.before.3":
        return "Pick a safe, easy-to-find location. For first-time events, prefer public spaces like cafés, parks, libraries or coworking spaces.";
      case "info.host.before.4":
        return "Set basic expectations in the description: for example, if people should bring a board game, a notebook, a laptop, sports clothes or a small participation fee.";
      case "info.host.before.5":
        return "Check your calendar before publishing so you do not cancel at the last minute. Last-minute cancellations break trust in the community.";
      case "info.host.section.during":
        return "During your event";
      case "info.host.during.1":
        return "Arrive a little earlier so you can welcome people by name and help them find the group.";
      case "info.host.during.2":
        return "Start with a short round of introductions. People feel safer when they know who is in the group and why they came.";
      case "info.host.during.3":
        return "Gently protect the atmosphere: if someone dominates the conversation, is pushy, flirts inappropriately or ignores boundaries, step in as a host.";
      case "info.host.during.4":
        return "Avoid alcohol-heavy or overly intimate situations, especially for first meetups. Keep things light, friendly and inclusive.";
      case "info.host.during.5":
        return "Share practical information: where toilets are, how long the event will last, and whether you plan a break or after-event.";
      case "info.host.section.after":
        return "After your event";
      case "info.host.after.1":
        return "Post a short update or thank-you message in the event description or group chat, so people know the event actually happened.";
      case "info.host.after.2":
        return "Ask for quick feedback: what worked well, and what could be improved next time (time, location, group size, format, etc.).";
      case "info.host.after.3":
        return "If you noticed worrying behaviour (harassment, aggressive behaviour, hate speech), document what happened and report it to Moventra.";
      case "info.host.after.4":
        return "If the meetup went well, consider creating a follow-up series (for example, “weekly language exchange” or “monthly board game night”).";
      case "info.host.after.5":
        return "Respect people’s privacy: do not share photos, phone numbers or social media handles without explicit permission.";
      case "info.host.note":
        return "You are not responsible for fixing every problem, but as a host you set the tone. Calm, clear communication is usually enough to keep events comfortable for everyone.";
      default:
        return original || key;
    }
  };

  const cardStyle = {
    borderRadius: 24,
    padding: "1.8rem 1.9rem 2rem",
    background:
      "radial-gradient(circle at top,#e0f2fe,#fdfdfd 55%)",
    border: "1px solid rgba(148,163,184,0.7)",
    boxShadow: "0 22px 56px rgba(30,64,175,0.28)",
    color: "#0f172a",
  } as const;

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
        <div style={cardStyle}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            {t("info.host.title")}
          </h1>
          <p
            style={{
              fontSize: 14,
              opacity: 0.85,
              marginBottom: 18,
              maxWidth: 560,
            }}
          >
            {t("info.host.subtitle")}
          </p>

          {[
            {
              titleKey: "info.host.section.before",
              items: [
                "info.host.before.1",
                "info.host.before.2",
                "info.host.before.3",
                "info.host.before.4",
                "info.host.before.5",
              ],
            },
            {
              titleKey: "info.host.section.during",
              items: [
                "info.host.during.1",
                "info.host.during.2",
                "info.host.during.3",
                "info.host.during.4",
                "info.host.during.5",
              ],
            },
            {
              titleKey: "info.host.section.after",
              items: [
                "info.host.after.1",
                "info.host.after.2",
                "info.host.after.3",
                "info.host.after.4",
                "info.host.after.5",
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
                      opacity: 0.9,
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
              opacity: 0.8,
              maxWidth: 560,
            }}
          >
            {t("info.host.note")}
          </p>
        </div>
      </div>
    </main>
  );
}
