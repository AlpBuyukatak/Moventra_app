"use client";

import useRequireAuth from "../hooks/useRequireAuth";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function HobbiesPage() {
  useRequireAuth();   // ✔️ HOOK BURADA OLACAK → component gövdesinin EN BAŞINDA

  const [hobbies, setHobbies] = useState([]);

  useEffect(() => {
    async function load() {
      const token = window.localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/hobbies`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      setHobbies(data.hobbies || []);
    }

    load();
  }, []);

  return (
    <main style={{ padding: 20, color: "white" }}>
      <h1>All Hobbies</h1>

      {hobbies.length === 0 && <p>No hobbies found.</p>}

      <ul>
        {hobbies.map((h: any) => (
          <li key={h.id}>{h.name}</li>
        ))}
      </ul>
    </main>
  );
}
