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
  user: {
    id: number;
    name: string;
  };
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

export default function ExploreEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

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

    async function fetchExplore() {
      try {
        setLoading(true);
        setError(null);

        const headers = { Authorization: `Bearer ${token}` };
        const params = new URLSearchParams();
        params.append("myHobbies", "true");

        const [eventsRes, favoritesRes] = await Promise.all([
          fetch(`${API_URL}/events?${params.toString()}`, { headers }),
          fetch(`${API_URL}/events/my/favorites`, { headers }),
        ]);

        if (!eventsRes.ok) {
          const data = await eventsRes.json().catch(() => ({}));
          throw new Error(data.error || "Could not load events");
        }

        const data = await eventsRes.json();
        setEvents(data.events || []);

        if (favoritesRes.ok) {
          const favJson = await favoritesRes.json().catch(() => ({ events: [] }));
          const favIds =
            favJson.events?.map((e: { id: number }) => e.id) || [];
          setFavoriteIds(favIds);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    fetchExplore();
  }, [router]);

  async function handleJoin(eventId: number) {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setJoiningId(eventId);

      const res = await fetch(`${API_URL}/events/${eventId}/join`, {
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

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Join failed");
    } finally {
      setJoiningId(null);
    }
  }

  async function toggleFavorite(eventId: number) {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const isFav = favoriteIds.includes(eventId);
    const endpoint = isFav ? "unfavorite" : "favorite";

    try {
      const res = await fetch(`${API_URL}/events/${eventId}/${endpoint}`, {
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

      setFavoriteIds((prev) =>
        isFav ? prev.filter((id) => id !== eventId) : [...prev, eventId]
      );
    } catch (err) {
      console.error(err);
      alert("Favorite action failed");
    }
  }

  function handleCardClick(eventId: number) {
    router.push(`/events/${eventId}`);
  }

  const isEmpty = !loading && events.length === 0 && !error;

  const now = new Date();
  const upcomingEvents = events.filter(
    (e) => new Date(e.dateTime) >= now
  );
  const pastEvents = events.filter((e) => new Date(e.dateTime) < now);

  function renderCard(event: Event, dimmed = false) {
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
    const isFull = capacity !== null && participantsCount >= capacity;
    const isFav = favoriteIds.includes(event.id);

    return (
      <div
        key={event.id}
        onClick={() => handleCardClick(event.id)}
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
          cursor: "pointer",
          opacity: dimmed ? 0.6 : 1,
        }}
      >
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

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
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

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(event.id);
              }}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              {isFav ? "★" : "☆"}
            </button>
          </div>
        </div>

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
          {dimmed && <span>⏱ Past event</span>}
        </div>

        {event.description && (
          <p
            style={{
              fontSize: 13,
              opacity: 0.85,
              marginTop: 4,
              maxHeight: "3.2em",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {event.description}
          </p>
        )}

        <div
          style={{
            marginTop: 8,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isFull) handleJoin(event.id);
            }}
            disabled={joiningId === event.id || isFull}
            style={{
              padding: "0.45rem 1rem",
              borderRadius: 999,
              border: "none",
              background: isFull
                ? "rgba(55,65,81,0.8)"
                : "linear-gradient(135deg,rgba(59,130,246,1),rgba(56,189,248,1))",
              color: isFull ? "#e5e7eb" : "black",
              fontSize: 13,
              fontWeight: 600,
              cursor: isFull ? "not-allowed" : "pointer",
              opacity: joiningId === event.id ? 0.7 : 1,
            }}
          >
            {isFull
              ? "Full"
              : joiningId === event.id
              ? "Joining..."
              : "Join"}
          </button>
        </div>
      </div>
    );
  }

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
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
          Explore for You
        </h1>
        <p style={{ opacity: 0.8, fontSize: 14, marginBottom: 20 }}>
          Events matched with your hobbies.
        </p>

        {loading && <p>Loading...</p>}
        {error && (
          <p style={{ color: "#f97373", marginBottom: 16 }}>{error}</p>
        )}
        {isEmpty && (
          <p>
            No recommended events based on your hobbies yet. Try adding some
            hobbies or check the main Events page.
          </p>
        )}

        {upcomingEvents.length > 0 && (
          <>
            <h2 style={{ fontSize: 20, marginBottom: 10 }}>Upcoming</h2>
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
                gap: 18,
                marginBottom: 24,
              }}
            >
              {upcomingEvents.map((e) => renderCard(e, false))}
            </section>
          </>
        )}

        {pastEvents.length > 0 && (
          <>
            <h2 style={{ fontSize: 20, marginBottom: 10 }}>Past</h2>
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
                gap: 18,
              }}
            >
              {pastEvents.map((e) => renderCard(e, true))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
