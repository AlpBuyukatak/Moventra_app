"use client";

import { useLanguage } from "../../context/LanguageContext";

export default function HowItWorksPage() {
  const { t: baseT } = useLanguage();

  const t = (key: string): string => {
    const original = baseT(key);
    if (original && original !== key) return original;

    switch (key) {
      case "info.howItWorks.title":
        return "How Moventra works";
      case "info.howItWorks.subtitle":
        return "Small, hobby-focused groups instead of anonymous crowds.";
      case "info.howItWorks.step1.title":
        return "1. Create your profile";
      case "info.howItWorks.step1.text":
        return "Tell us your name, city and a few hobbies you enjoy. We only use this to recommend relevant events.";
      case "info.howItWorks.step2.title":
        return "2. Choose your interests";
      case "info.howItWorks.step2.text":
        return "Pick topics like board games, language exchange, hiking or live music. You can change these anytime in Settings.";
      case "info.howItWorks.step3.title":
        return "3. Join small events";
      case "info.howItWorks.step3.text":
        return "Browse events near you, check the description and group size, and join with one click.";
      case "info.howItWorks.step4.title":
        return "4. Host your own meetups";
      case "info.howItWorks.step4.text":
        return "When you are ready, you can create your own event, set the rules and invite people who share your hobby.";
      case "info.howItWorks.note":
        return "Moventra is designed for calm, respectful meetups. No spammy marketing, no massive anonymous parties.";
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
            borderRadius: 28,
            padding: "1.9rem 1.9rem 2.1rem",
            background:
              "radial-gradient(circle at top,#fef3c7,#fffdf7 55%)",
            border: "1px solid rgba(214,187,130,0.55)",
            boxShadow: "0 24px 60px rgba(146,94,26,0.25)",
            color: "#111827",
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            {t("info.howItWorks.title")}
          </h1>
          <p
            style={{
              fontSize: 14,
              opacity: 0.85,
              marginBottom: 18,
              maxWidth: 520,
            }}
          >
            {t("info.howItWorks.subtitle")}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 14,
              marginTop: 6,
            }}
          >
            {[
              {
                titleKey: "info.howItWorks.step1.title",
                textKey: "info.howItWorks.step1.text",
              },
              {
                titleKey: "info.howItWorks.step2.title",
                textKey: "info.howItWorks.step2.text",
              },
              {
                titleKey: "info.howItWorks.step3.title",
                textKey: "info.howItWorks.step3.text",
              },
              {
                titleKey: "info.howItWorks.step4.title",
                textKey: "info.howItWorks.step4.text",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: 20,
                  padding: "0.9rem 1rem",
                  backgroundColor: "#fffdf8",
                  border: "1px solid rgba(214,187,130,0.6)",
                  boxShadow: "0 10px 26px rgba(146,94,26,0.18)",
                }}
              >
                <h2
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  {t(item.titleKey)}
                </h2>
                <p
                  style={{
                    fontSize: 12,
                    opacity: 0.85,
                  }}
                >
                  {t(item.textKey)}
                </p>
              </div>
            ))}
          </div>

          <p
            style={{
              marginTop: 18,
              fontSize: 12,
              opacity: 0.8,
              maxWidth: 540,
            }}
          >
            {t("info.howItWorks.note")}
          </p>
        </div>
      </div>
    </main>
  );
}
