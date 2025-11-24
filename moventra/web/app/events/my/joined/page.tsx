"use client";

import useRequireAuth from "../../../hooks/useRequireAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Event = {
  id: number;
  title: string;
  city: string;
  location?: string | null;
  dateTime: string;
  hobby?: { id: number; name: string };
};

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export default function MyJoinedEventsPage() {
  const router = useRouter();
  const { checking } = useRequireAuth("/login");

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (checking) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/events/my/joined`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch joined events");
        }

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
  }, [checking, router]);

  // 🔐 Auth check skeleton
  if (checking) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "40px 16px",
          background: "var(--bg)",
          color: "var(--fg)",
          fontFamily: "system-ui",
        }}
      >
        <p>Checking authentication...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 16px",
        background: "var(--bg)",
        color: "var(--fg)",
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
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                boxShadow: "0 12px 30px rgba(15,23,42,0.3)",
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>{event.title}</h2>
              <p style={{ opacity: 0.8, fontSize: 14 }}>
                {event.city}
                {event.location ? ` • ${event.location}` : ""}
              </p>
              <p style={{ opacity: 0.7, fontSize: 13, marginTop: 4 }}>
                {new Date(event.dateTime).toLocaleString()}
              </p>
              {event.hobby && (
                <p style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
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
