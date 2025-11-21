"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Hobby = {
  id: number;
  name: string;
};

type Participant = {
  id: number;
};

type Event = {
  id: number;
  title: string;
  description?: string | null;
  city: string;
  location?: string | null;
  dateTime: string;
  hobby?: Hobby;
  capacity?: number | null;
  participants?: Participant[];
};

export default function MyFavoriteEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unfavLoadingId, setUnfavLoadingId] = useState<number | null>(null);

  function getToken() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("token");
  }

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchFavorites() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/events/my/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || "Could not load favorites");
        }

        setEvents(data.events || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [router]);

  async function handleDetails(eventId: number) {
    router.push(`/events/${eventId}`);
  }

  async function handleUnfavorite(eventId: number) {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setUnfavLoadingId(eventId);
      const res = await fetch(`${API_URL}/events/${eventId}/unfavorite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Unfavorite failed");
        return;
      }

      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error(err);
      alert("Unfavorite failed");
    } finally {
      setUnfavLoadingId(null);
    }
  }

  const isEmpty = !loading && events.length === 0 && !error;

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
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
          My Favorite Events
        </h1>

        {loading && <p>Loading...</p>}
        {error && (
          <p style={{ color: "#f97373", marginBottom: 16 }}>{error}</p>
        )}
        {isEmpty && <p>Henüz favorilere eklediğin bir etkinlik yok.</p>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: 18,
          }}
        >
          {events.map((event) => {
            const date = new Date(event.dateTime);
            const formattedDate = date.toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
            const formattedTime = date.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            });

            const participantsCount = event.participants
              ? event.participants.length
              : 0;
            const capacity = event.capacity ?? null;

            const isUnfavLoading = unfavLoadingId === event.id;

            return (
              <div
                key={event.id}
                style={{
                  borderRadius: "1rem",
                  border: "1px solid #111827",
                  background:
                    "linear-gradient(135deg,rgba(15,23,42,0.88),rgba(30,64,175,0.55))",
                  padding: "1.4rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.7rem",
                  boxShadow: "0 12px 30px rgba(15,23,42,0.8)",
                }}
              >
                {/* Üst satır */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        marginBottom: 2,
                      }}
                    >
                      {event.title}
                    </h2>
                    <p
                      style={{
                        fontSize: 14,
                        opacity: 0.85,
                      }}
                    >
                      {event.city}
                      {event.location ? ` • ${event.location}` : ""}
                    </p>
                  </div>

                  {event.hobby && (
                    <span
                      style={{
                        alignSelf: "flex-start",
                        padding: "0.25rem 0.7rem",
                        borderRadius: 999,
                        backgroundColor: "rgba(15,23,42,0.9)",
                        border: "1px solid rgba(148,163,184,0.7)",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {event.hobby.name}
                    </span>
                  )}
                </div>

                {/* Orta satır */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.8rem",
                    fontSize: 13,
                    opacity: 0.92,
                  }}
                >
                  <span>
                    🗓 {formattedDate} · {formattedTime}
                  </span>
                  {capacity !== null && (
                    <span>
                      👥 {participantsCount}/{capacity}
                    </span>
                  )}
                </div>

                {/* Butonlar */}
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleDetails(event.id)}
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.7)",
                      backgroundColor: "transparent",
                      color: "white",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Details
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUnfavorite(event.id)}
                    disabled={isUnfavLoading}
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: 999,
                      border: "1px solid #eab308",
                      backgroundColor: "rgba(250,204,21,0.12)",
                      color: "#facc15",
                      fontSize: 13,
                      cursor: "pointer",
                      opacity: isUnfavLoading ? 0.7 : 1,
                    }}
                  >
                    {isUnfavLoading ? "Removing..." : "Remove Favorite"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
