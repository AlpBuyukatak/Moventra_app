"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Event = {
  id: number;
  title: string;
  city: string;
  location?: string | null;
  dateTime: string;
  hobby?: { id: number; name: string };
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("token")
        : null;

    if (!token) {
      // login yoksa login sayfasına gönder
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }

    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/events`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

    fetchEvents();
  }, []);

  // 🔹 JOIN FONKSİYONU — useEffect'in ALTINDA
  async function handleJoin(eventId: number) {
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("token")
        : null;

    if (!token) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }

    try {
      const res = await fetch(`${API_URL}/events/${eventId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "An error occurred");
        return;
      }

      alert("You successfully joined this event!");
    } catch (err) {
      alert("Join failed!");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 16px",
        fontFamily: "system-ui, sans-serif",
        background: "#020617",
        color: "white",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>Events</h1>

        {loading && <p>Loading events...</p>}

        {error && (
          <p style={{ color: "#f97373", marginBottom: 12 }}>{error}</p>
        )}

        {!loading && events.length === 0 && !error && (
          <p>Şu anda hiç etkinlik yok.</p>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {events.map((event) => (
            <div
              key={event.id}
              style={{
                padding: 16,
                borderRadius: 12,
                background: "#020617",
                border: "1px solid #1f2937",
              }}
            >
              <h2 style={{ fontSize: 20, marginBottom: 4 }}>{event.title}</h2>
              <p style={{ fontSize: 14, opacity: 0.8 }}>
                {event.city}
                {event.location ? ` • ${event.location}` : ""}
              </p>
              <p style={{ fontSize: 14, opacity: 0.7 }}>
                {new Date(event.dateTime).toLocaleString()}
              </p>
              {event.hobby && (
                <p style={{ fontSize: 13, opacity: 0.7 }}>
                  Hobby: {event.hobby.name}
                </p>
              )}

              {/* 🔹 JOIN BUTONU — kartın EN ALTINA eklendi */}
              <button
                onClick={() => handleJoin(event.id)}
                style={{
                  marginTop: 12,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Join Event
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
