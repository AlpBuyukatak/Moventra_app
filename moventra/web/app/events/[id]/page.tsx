"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Participant = {
  id: number;
  user: {
    id: number;
    name: string;
  };
};

type EventDetail = {
  id: number;
  title: string;
  description?: string | null;
  city: string;
  location?: string | null;
  dateTime: string;
  hobby?: { id: number; name: string };
  participants: Participant[];
  createdBy?: {
    id: number;
    name: string;
    city?: string | null;
  };
};

export default function EventDetailPage() {
  const { id } = useParams();
  const [eventData, setEventData] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Etkinlik detayını çeken kısım
  useEffect(() => {
    if (!id) return;

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

    async function fetchEvent() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/events/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Event not found");
        }

        const data = await res.json();
        setEventData(data.event);
      } catch (err: any) {
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  // Join butonunun çalıştığı yer
  async function handleJoin() {
    if (!eventData) return;

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
      setJoinLoading(true);
      const res = await fetch(`${API_URL}/events/${eventData.id}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Join failed");
        return;
      }

      alert("You successfully joined this event!");

      // İstersen burada tekrar fetchEvent yaparak katılımcı listesini yenileyebiliriz.
      // Şimdilik sadece alert veriyoruz, basit kalsın.
    } catch (err) {
      alert("Join failed");
    } finally {
      setJoinLoading(false);
    }
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: 24,
          background: "#020617",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p>Loading...</p>
      </main>
    );
  }

  if (error || !eventData) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: 24,
          background: "#020617",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p style={{ color: "#f97373" }}>{error || "Event not found"}</p>
      </main>
    );
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
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>{eventData.title}</h1>

        <p style={{ fontSize: 18, opacity: 0.9 }}>
          {eventData.city}
          {eventData.location ? ` • ${eventData.location}` : ""}
        </p>

        <p style={{ marginTop: 8, opacity: 0.8 }}>
          {new Date(eventData.dateTime).toLocaleString()}
        </p>

        {eventData.hobby && (
          <p style={{ marginTop: 8, opacity: 0.8 }}>
            <strong>Hobby:</strong> {eventData.hobby.name}
          </p>
        )}

        {eventData.description && (
          <p style={{ marginTop: 16, opacity: 0.9 }}>
            {eventData.description}
          </p>
        )}

        {/* JOIN BUTTON */}
        <button
          onClick={handleJoin}
          disabled={joinLoading}
          style={{
            marginTop: 24,
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          {joinLoading ? "Joining..." : "Join Event"}
        </button>

        <h3 style={{ marginTop: 32, fontSize: 22 }}>Participants</h3>

        {eventData.participants.length === 0 && (
          <p style={{ opacity: 0.7, marginTop: 8 }}>No participants yet.</p>
        )}

        <ul style={{ marginTop: 12 }}>
          {eventData.participants.map((p) => (
            <li key={p.id} style={{ marginBottom: 6 }}>
              {p.user.name}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
