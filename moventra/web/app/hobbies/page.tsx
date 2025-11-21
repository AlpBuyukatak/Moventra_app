"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Hobby = {
  id: number;
  name: string;
};

export default function HobbiesPage() {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHobbies() {
      try {
        const res = await fetch(`${API_URL}/hobbies`);
        const data = await res.json();
        setHobbies(data.hobbies || []);
      } catch {
        setError("Could not load hobbies");
      } finally {
        setLoading(false);
      }
    }

    fetchHobbies();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 16px",
        background: "#020617",
        color: "white",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>
        All Hobbies
      </h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#f97373" }}>{error}</p>}

      <ul style={{ marginTop: 12, fontSize: 18 }}>
        {hobbies.map((h) => (
          <li key={h.id} style={{ marginBottom: 8 }}>
            {h.name}
          </li>
        ))}
      </ul>
    </main>
  );
}
