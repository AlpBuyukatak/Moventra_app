"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Hobby = {
  id: number;
  name: string;
};

// messages.ts’teki hobbyNames.* key’leriyle UYUMLU code üretici
function makeHobbyCode(name: string): string {
  if (!name) return "";

  return name
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9]+/g, " ") // &, - vs. sil, boşluğa çevir
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w, i) => {
      const lower = w.toLowerCase();
      if (i === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

export default function HobbiesPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [hobbies, setHobbies] = useState<(Hobby & { code: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchHobbies() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/hobbies`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            data.error ||
              t("hobbies.error.couldNotLoad") ||
              "Could not load hobbies"
          );
        }

        const list: Hobby[] = data.hobbies || data || [];

        // BACKEND’DEKİ code alanını TAMAMEN BOŞVER → frontend’de yeniden üret
        const withCodes = list.map((h) => ({
          ...h,
          code: makeHobbyCode(h.name),
        }));

        setHobbies(withCodes);
      } catch (err: any) {
        console.error(err);
        setError(err.message || t("hobbies.error.generic") || "Error");
      } finally {
        setLoading(false);
      }
    }

    fetchHobbies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return hobbies;
    return hobbies.filter((h) => h.name.toLowerCase().includes(q));
  }, [hobbies, search]);

  function handleHobbyClick(hobby: Hobby) {
    router.push(
      `/events?hobbyId=${hobby.id}&hobbyName=${encodeURIComponent(
        hobby.name
      )}`
    );
  }

  const title = t("nav.hobbies") || "All hobbies";
  const subtitle =
    t("hobbies.intro") ||
    "Click a hobby to see events worldwide related to that interest.";

  const countLabel =
    t("hobbies.list.count", { count: String(filtered.length) }) ||
    `${filtered.length} hobby found`;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 16px",
        color: "var(--fg)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <header
          style={{
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: 14, opacity: 0.8 }}>{subtitle}</p>
        </header>

        <section
          style={{
            marginBottom: 20,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.8 }}>{countLabel}</div>

          <div style={{ width: "100%", maxWidth: 260 }}>
            <input
              type="text"
              placeholder={
                t("hobbies.search.placeholder") || "Search hobbies..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.7rem",
                borderRadius: 999,
                border: "1px solid var(--card-border)",
                backgroundColor: "var(--card-bg)",
                color: "var(--fg)",
                fontSize: 14,
              }}
            />
          </div>
        </section>

        {loading && <p>{t("hobbies.loading") || "Loading hobbies..."}</p>}

        {error && (
          <p style={{ color: "#f97373", marginBottom: 16 }}>{error}</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p>{t("hobbies.list.empty") || "No hobbies found for this search."}</p>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 12,
          }}
        >
          {filtered.map((h) => {
            const key = `hobbyNames.${h.code}`;
            const translated = t(key);

            // t(key) bulunamazsa veya aynen "hobbyNames.xxx" dönerse → İngilizce ismi kullan
            const label =
              !translated || translated === key ? h.name : translated;

            return (
              <button
                key={h.id}
                type="button"
                onClick={() => handleHobbyClick(h)}
                style={{
                  padding: "0.7rem 0.9rem",
                  borderRadius: 999,
                  border: "1px solid var(--card-border)",
                  background: "var(--card-bg)",
                  color: "var(--fg)",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  boxShadow: "0 8px 20px rgba(15,23,42,0.25)",
                  cursor: "pointer",
                  transition:
                    "transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease",
                }}
              >
                {label}
              </button>
            );
          })}
        </section>
      </div>
    </main>
  );
}
