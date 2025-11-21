"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  const router = useRouter();

  const [eventData, setEventData] = useState<EventDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [unjoinLoading, setUnjoinLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Favorite için
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  function getToken() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("token");
  }

  // Etkinlik + currentUser + favoriler
  useEffect(() => {
    if (!id) return;

    const token = getToken();

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

        const [eventRes, meRes, favRes] = await Promise.all([
          fetch(`${API_URL}/events/${id}`, { headers }),
          fetch(`${API_URL}/auth/me`, { headers }),
          fetch(`${API_URL}/events/my/favorites`, { headers }),
        ]);

        // event
        if (!eventRes.ok) {
          const data = await eventRes.json().catch(() => ({}));
          throw new Error(data.error || "Event not found");
        }
        const eventJson = await eventRes.json();
        const ev: EventDetail = eventJson.event;
        setEventData(ev);

        // current user
        if (meRes.ok) {
          const meJson = await meRes.json();
          setCurrentUser(meJson.user);
        }

        // favorites
        if (favRes.ok) {
          const favJson = await favRes.json().catch(() => ({}));
          const favEvents = (favJson.events || []) as { id: number }[];
          const alreadyFav = favEvents.some((e) => e.id === ev.id);
          setIsFavorite(alreadyFav);
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

  // Kullanıcı bu etkinliğin sahibi mi?
  const isOwner =
    !!currentUser &&
    !!eventData &&
    !!eventData.createdBy &&
    eventData.createdBy.id === currentUser.id;

  // Event full mü?
  const isFull =
    !!eventData &&
    eventData.capacity != null &&
    eventData.participants.length >= eventData.capacity;

  // Join
  async function handleJoin() {
    if (!eventData) return;

    const token = getToken();

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
    } catch {
      alert("Join failed");
    } finally {
      setJoinLoading(false);
    }
  }

  // Unjoin
  async function handleUnjoin() {
    if (!eventData || !currentUser) return;

    const token = getToken();

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
    } catch {
      alert("Unjoin failed");
    } finally {
      setUnjoinLoading(false);
    }
  }

  // Delete (sadece owner)
  async function handleDelete() {
    if (!eventData) return;
    const sure = window.confirm(
      "Bu etkinliği silmek istediğinden emin misin? Bu işlem geri alınamaz."
    );
    if (!sure) return;

    const token = getToken();

    if (!token) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }

    try {
      setDeleteLoading(true);
      const res = await fetch(`${API_URL}/events/${eventData.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Delete failed");
        return;
      }

      alert("Event deleted");
      router.push("/events/my/created");
    } catch {
      alert("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  }

  // Favorite toggle
  async function handleToggleFavorite() {
    if (!eventData) return;

    const token = getToken();

    if (!token) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }

    try {
      setFavoriteLoading(true);

      const path = isFavorite ? "unfavorite" : "favorite";

      const res = await fetch(`${API_URL}/events/${eventData.id}/${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Favorite action failed");
        return;
      }

      setIsFavorite(!isFavorite);
    } catch {
      alert("Favorite action failed");
    } finally {
      setFavoriteLoading(false);
    }
  }

  // Edit (sadece owner)
  function handleEdit() {
    if (!eventData) return;
    router.push(`/events/edit/${eventData.id}`);
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
        {/* Başlık + organizer badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1 style={{ fontSize: 32, marginBottom: 4 }}>
              {eventData.title}
            </h1>

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
          </div>

          {isOwner && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: "flex-end",
              }}
            >
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 999,
                  border: "1px solid rgba(52,211,153,0.7)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  opacity: 0.9,
                }}
              >
                You are the organizer
              </span>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleEdit}
                  disabled={deleteLoading}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "1px solid #22c55e",
                    backgroundColor: "rgba(34,197,94,0.15)",
                    color: "#bbf7d0",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "1px solid #b91c1c",
                    backgroundColor: "rgba(239,68,68,0.12)",
                    color: "#fecaca",
                    fontSize: 13,
                    cursor: "pointer",
                    opacity: deleteLoading ? 0.7 : 1,
                  }}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}
        </div>

        {eventData.description && (
          <p style={{ marginTop: 16, opacity: 0.9 }}>
            {eventData.description}
          </p>
        )}

        {/* JOIN / UNJOIN + FAVORITE BUTTONLARI */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
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
                opacity: unjoinLoading ? 0.7 : 1,
              }}
            >
              {unjoinLoading ? "Unjoining..." : "Unjoin Event"}
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joinLoading || isFull}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: isFull ? "#4b5563" : "#2563eb",
                color: "white",
                cursor: isFull ? "not-allowed" : "pointer",
                opacity: joinLoading ? 0.7 : 1,
              }}
            >
              {isFull
                ? "Event is full"
                : joinLoading
                ? "Joining..."
                : "Join Event"}
            </button>
          )}

          {/* ⭐ Favorite butonu (toggle) */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid rgba(250,250,250,0.4)",
              background: isFavorite
                ? "rgba(250,204,21,0.2)"
                : "rgba(15,23,42,0.8)",
              color: isFavorite ? "#facc15" : "#e5e7eb",
              cursor: "pointer",
              opacity: favoriteLoading ? 0.7 : 1,
            }}
          >
            {favoriteLoading
              ? "..."
              : isFavorite
              ? "★ Remove Favorite"
              : "☆ Add to Favorites"}
          </button>
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
