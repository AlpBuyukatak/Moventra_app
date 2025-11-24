"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Hobby = {
  id: number;
  name: string;
};

export default function HobbiesPage() {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchHobbies() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/hobbies`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || "Could not load hobbies");
        }

        setHobbies(data.hobbies || data || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    fetchHobbies();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return hobbies;

    return hobbies.filter((h) =>
      (h.name || "").toLowerCase().includes(q)
    );
  }, [hobbies, search]);

  function handleHobbyClick(hobby: Hobby) {
    // 🔥 Seçilen hobiyi query string ile /events'e gönder
    router.push(
      `/events?hobbyId=${hobby.id}&hobbyName=${encodeURIComponent(
        hobby.name
      )}`
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 16px",
        background: "var(--bg)",
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
            All Hobbies
          </h1>
          <p style={{ fontSize: 14, opacity: 0.8 }}>
            Click a hobby to see events worldwide related to that interest.
          </p>
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
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            {filtered.length} hobby found
          </div>

          <div style={{ width: "100%", maxWidth: 260 }}>
            <input
              type="text"
              placeholder="Search hobbies..."
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

        {loading && <p>Loading hobbies...</p>}
        {error && (
          <p style={{ color: "#f97373", marginBottom: 16 }}>{error}</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p>No hobbies found for this search.</p>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 12,
          }}
        >
          {filtered.map((h) => (
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
              {h.name}
            </button>
          ))}
        </section>
      </div>
    </main>
  );
}
