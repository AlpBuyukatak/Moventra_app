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

export default function MyJoinedEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
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
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/events/my/joined`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to fetch joined events");
        }

        const data = await res.json();

        // Backend iki şekilde olabilir:
        // 1) { events: Event[] }
        // 2) { participations: { event: Event }[] }
        const joinedEvents: Event[] =
          data.events ||
          (data.participations
            ? data.participations.map((p: any) => p.event)
            : []);

        setEvents(joinedEvents || []);
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
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>My Joined Events</h1>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "#f97373" }}>{error}</p>}

        {!loading && events.length === 0 && !error && (
          <p>Henüz katıldığın bir etkinlik yok.</p>
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
              <h2>{event.title}</h2>
              <p style={{ opacity: 0.8 }}>
                {event.city}
                {event.location ? ` • ${event.location}` : ""}
              </p>
              <p style={{ opacity: 0.7 }}>
                {new Date(event.dateTime).toLocaleString()}
              </p>
              {event.hobby && (
                <p style={{ fontSize: 13, opacity: 0.7 }}>
                  Hobby: {event.hobby.name}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
