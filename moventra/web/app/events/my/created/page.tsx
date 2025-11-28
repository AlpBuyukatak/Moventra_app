"use client";

import useRequireAuth from "../../../hooks/useRequireAuth";
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

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export default function MyCreatedEventsPage() {
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

    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/events/my/created`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || "Could not load created events");
        }

        setEvents(data.events || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [router, checking]);

  async function handleDelete(eventId: number) {
    const sure = window.confirm("Bu etkinliği silmek istediğinden emin misin?");
    if (!sure) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/events/${eventId}`, {
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

      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  function handleEdit(eventId: number) {
    router.push(`/events/edit/${eventId}`);
  }

  function handleDetails(eventId: number) {
    router.push(`/events/${eventId}`);
  }

  const isEmpty = !loading && events.length === 0 && !error;

  // 🔐 Auth check sırasında skeleton
  if (checking) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "40px 16px",
          background: "var(--bg)",
          color: "var(--fg)",
          fontFamily: "system-ui, sans-serif",
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
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
          My Created Events
        </h1>

        {loading && <p>Loading...</p>}
        {error && (
          <p style={{ color: "#f97373", marginBottom: 16 }}>{error}</p>
        )}
        {isEmpty && <p>Henüz oluşturduğun bir etkinlik yok.</p>}

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

            return (
              <div
                key={event.id}
                style={{
                  position: "relative",
                  borderRadius: "1.5rem",
                  border: "1px solid var(--card-border)",
                  background: "var(--card-bg)",
                  padding: "1.4rem 1.5rem 4.1rem", // altta butonlar için ekstra boşluk
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  boxShadow: "0 16px 40px rgba(15,23,42,0.35)",
                  color: "var(--fg)",
                  minHeight: 220,
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
                  <div style={{ minWidth: 0 }}>
                    <h2
                      style={{
                        fontSize: 18,
                        fontWeight: 650,
                        marginBottom: 2,
                        wordBreak: "break-word",
                      }}
                    >
                      {event.title}
                    </h2>
                    <p
                      style={{
                        fontSize: 14,
                        opacity: 0.85,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 220,
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
                        padding: "0.25rem 0.9rem",
                        borderRadius: 999,
                        backgroundColor: "rgba(15,23,42,0.95)",
                        border: "1px solid rgba(148,163,184,0.7)",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                        color: "#e5e7eb",
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

                {/* Açıklama kısa önizleme (varsa) */}
                {event.description && (
                  <p
                    style={{
                      fontSize: 13,
                      opacity: 0.8,
                      maxHeight: 48,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {event.description}
                  </p>
                )}

                {/* Butonlar – kartın sağ altına sabit */}
                <div
                  style={{
                    position: "absolute",
                    right: 16,
                    bottom: 16,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    justifyContent: "flex-end",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Details */}
                  <button
                    type="button"
                    onClick={() => handleDetails(event.id)}
                    style={{
                      padding: "0.45rem 0.95rem",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.75)",
                      backgroundColor: "#ffffff",
                      color: "#0f172a",
                      fontSize: 13,
                      cursor: "pointer",
                      boxShadow: "0 6px 14px rgba(15,23,42,0.15)",
                      transition:
                        "transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(-1px)";
                      el.style.boxShadow =
                        "0 10px 22px rgba(15,23,42,0.25)";
                      el.style.filter = "brightness(1.03)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(0)";
                      el.style.boxShadow =
                        "0 6px 14px rgba(15,23,42,0.15)";
                      el.style.filter = "brightness(1)";
                    }}
                    onMouseDown={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(0px)";
                      el.style.boxShadow =
                        "0 4px 10px rgba(15,23,42,0.20)";
                      el.style.filter = "brightness(0.98)";
                    }}
                    onMouseUp={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(-1px)";
                      el.style.boxShadow =
                        "0 10px 22px rgba(15,23,42,0.25)";
                      el.style.filter = "brightness(1.03)";
                    }}
                  >
                    Details
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => handleEdit(event.id)}
                    style={{
                      padding: "0.45rem 1rem",
                      borderRadius: 999,
                      border: "none",
                      background:
                        "linear-gradient(135deg,#22c55e,#16a34a,#15803d)",
                      color: "#f9fafb",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 10px 26px rgba(22,163,74,0.45)",
                      transition:
                        "transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(-1px)";
                      el.style.boxShadow =
                        "0 14px 32px rgba(22,163,74,0.65)";
                      el.style.filter = "brightness(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(0)";
                      el.style.boxShadow =
                        "0 10px 26px rgba(22,163,74,0.45)";
                      el.style.filter = "brightness(1)";
                    }}
                    onMouseDown={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(0px)";
                      el.style.boxShadow =
                        "0 6px 18px rgba(22,163,74,0.55)";
                      el.style.filter = "brightness(0.97)";
                    }}
                    onMouseUp={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(-1px)";
                      el.style.boxShadow =
                        "0 14px 32px rgba(22,163,74,0.65)";
                      el.style.filter = "brightness(1.05)";
                    }}
                  >
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    style={{
                      padding: "0.45rem 1rem",
                      borderRadius: 999,
                      border: "1px solid rgba(239,68,68,0.75)",
                      background:
                        "linear-gradient(135deg,#fee2e2,#fecaca)",
                      color: "#991b1b",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      boxShadow: "0 8px 22px rgba(239,68,68,0.35)",
                      transition:
                        "transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(-1px)";
                      el.style.boxShadow =
                        "0 12px 30px rgba(239,68,68,0.55)";
                      el.style.filter = "brightness(1.03)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(0)";
                      el.style.boxShadow =
                        "0 8px 22px rgba(239,68,68,0.35)";
                      el.style.filter = "brightness(1)";
                    }}
                    onMouseDown={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(0px)";
                      el.style.boxShadow =
                        "0 5px 16px rgba(239,68,68,0.45)";
                      el.style.filter = "brightness(0.97)";
                    }}
                    onMouseUp={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(-1px)";
                      el.style.boxShadow =
                        "0 12px 30px rgba(239,68,68,0.55)";
                      el.style.filter = "brightness(1.03)";
                    }}
                  >
                    Delete
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
