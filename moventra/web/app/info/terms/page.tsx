"use client";

import { useLanguage } from "../../context/LanguageContext";

export default function TermsPage() {
  const { t: baseT } = useLanguage();

  const t = (key: string): string => {
    const original = baseT(key);
    if (original && original !== key) return original;

    switch (key) {
      case "legal.terms.title":
        return "Terms of use";
      case "legal.terms.intro":
        return "This is a short, human-readable summary of how Moventra should be used. The full legal text will be added later.";
      case "legal.terms.point1":
        return "Moventra is for real-world, hobby-based meetups — not for spam, advertising or dating apps.";
      case "legal.terms.point2":
        return "You are responsible for your own behaviour at events. Please follow local laws and respect other participants.";
      case "legal.terms.point3":
        return "Content that is illegal, hateful or abusive may be removed and accounts may be restricted.";
      case "legal.terms.point4":
        return "We may update these terms as the product grows. Significant changes will be communicated in advance.";
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
              "radial-gradient(circle at top,#e5e7eb,#fdfdfd 55%)",
            border: "1px solid rgba(148,163,184,0.7)",
            boxShadow: "0 22px 52px rgba(15,23,42,0.28)",
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
            {t("legal.terms.title")}
          </h1>
          <p
            style={{
              fontSize: 13,
              opacity: 0.85,
              marginBottom: 14,
              maxWidth: 560,
            }}
          >
            {t("legal.terms.intro")}
          </p>
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
            <li>{t("legal.terms.point1")}</li>
            <li>{t("legal.terms.point2")}</li>
            <li>{t("legal.terms.point3")}</li>
            <li>{t("legal.terms.point4")}</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
