"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function MyCreatedEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    async function load() {
      try {
        const res = await fetch(`${API_URL}/events/my/created`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to fetch events");
        }

        const data = await res.json();
        setEvents(data.events || []);
      } catch (err: any) {
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 16px",
        background: "#020617",
        color: "white",
        fontFamily: "system-ui",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>My Created Events</h1>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "#f97373" }}>{error}</p>}

        <div style={{ display: "grid", gap: 12 }}>
          {events.map((event: any) => (
            <div
              key={event.id}
              style={{
                padding: 16,
                borderRadius: 12,
                background: "#020617",
                border: "1px solid #1f2937",
              }}
            >
              <h2>{event.title}</h2>
              <p style={{ opacity: 0.8 }}>
                {event.city}
                {event.location ? ` • ${event.location}` : ""}
              </p>
              <p style={{ opacity: 0.7 }}>
                {new Date(event.dateTime).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
