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
  capacity?: number | null;
  createdBy?: {
    id: number;
    name: string;
    city?: string | null;
  };
};

type CurrentUser = {
  id: number;
  name: string;
};

export default function EventDetailPage() {
  const { id } = useParams();
  const [eventData, setEventData] = useState<EventDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [unjoinLoading, setUnjoinLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Etkinlik + currentUser çek
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

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const headers = { Authorization: `Bearer ${token}` };

        const [eventRes, meRes] = await Promise.all([
          fetch(`${API_URL}/events/${id}`, { headers }),
          fetch(`${API_URL}/auth/me`, { headers }),
        ]);

        // event
        if (!eventRes.ok) {
          const data = await eventRes.json().catch(() => ({}));
          throw new Error(data.error || "Event not found");
        }
        const eventJson = await eventRes.json();
        setEventData(eventJson.event);

        // current user
        if (meRes.ok) {
          const meJson = await meRes.json();
          setCurrentUser(meJson.user);
        }
      } catch (err: any) {
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Kullanıcı bu etkinliğe katılmış mı?
  const isJoined =
    !!currentUser &&
    !!eventData &&
    eventData.participants.some((p) => p.user.id === currentUser.id);

  // Join
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

      // participants state'ini güncelle
      if (currentUser) {
        setEventData((prev) =>
          prev
            ? {
                ...prev,
                participants: [
                  ...prev.participants,
                  {
                    id: data.participant?.id ?? Date.now(),
                    user: {
                      id: currentUser.id,
                      name: currentUser.name,
                    },
                  },
                ],
              }
            : prev
        );
      }
    } catch (err) {
      alert("Join failed");
    } finally {
      setJoinLoading(false);
    }
  }

  // Unjoin
  async function handleUnjoin() {
    if (!eventData || !currentUser) return;

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
      setUnjoinLoading(true);
      const res = await fetch(`${API_URL}/events/${eventData.id}/unjoin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Unjoin failed");
        return;
      }

      // participants'tan currentUser'ı çıkar
      setEventData((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.filter(
                (p) => p.user.id !== currentUser.id
              ),
            }
          : prev
      );
    } catch (err) {
      alert("Unjoin failed");
    } finally {
      setUnjoinLoading(false);
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

        {eventData.capacity != null && (
          <p style={{ marginTop: 8, opacity: 0.8 }}>
            Capacity: {eventData.capacity} • Joined:{" "}
            {eventData.participants.length}
          </p>
        )}

        {eventData.description && (
          <p style={{ marginTop: 16, opacity: 0.9 }}>
            {eventData.description}
          </p>
        )}

        {/* JOIN / UNJOIN BUTTON */}
        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          {isJoined ? (
            <button
              onClick={handleUnjoin}
              disabled={unjoinLoading}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: "#dc2626",
                color: "white",
                cursor: "pointer",
              }}
            >
              {unjoinLoading ? "Unjoining..." : "Unjoin Event"}
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joinLoading}
              style={{
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
          )}
        </div>

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
