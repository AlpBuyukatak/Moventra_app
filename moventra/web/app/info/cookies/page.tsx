"use client";

import { useLanguage } from "../../context/LanguageContext";

export default function CookiesPage() {
  const { t: baseT } = useLanguage();

  const t = (key: string): string => {
    const original = baseT(key);
    if (original && original !== key) return original;

    switch (key) {
      case "legal.cookies.title":
        return "Cookies";
      case "legal.cookies.intro":
        return "Moventra uses cookies and similar technologies to keep you logged in and to understand how the platform is used.";
      case "legal.cookies.point1":
        return "Essential cookies are used for login, security and basic site functionality.";
      case "legal.cookies.point2":
        return "We may use analytics cookies to see which pages are popular and to improve the product.";
      case "legal.cookies.point3":
        return "You can control cookies through your browser settings. Disabling essential cookies may break some features.";
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
              "radial-gradient(circle at top,#fef9c3,#fffdf7 55%)",
            border: "1px solid rgba(234,179,8,0.55)",
            boxShadow: "0 22px 52px rgba(161,98,7,0.26)",
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
            {t("legal.cookies.title")}
          </h1>
          <p
            style={{
              fontSize: 13,
              opacity: 0.85,
              marginBottom: 14,
              maxWidth: 560,
            }}
          >
            {t("legal.cookies.intro")}
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
            <li>{t("legal.cookies.point1")}</li>
            <li>{t("legal.cookies.point2")}</li>
            <li>{t("legal.cookies.point3")}</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
