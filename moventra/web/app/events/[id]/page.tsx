"use client";

import useRequireAuth from "../../hooks/useRequireAuth";
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

type EventMessage = {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
};

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  // 🔐 PRIVATE GUARD
  const { checking } = useRequireAuth("/login");

  const [eventData, setEventData] = useState<EventDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [joinLoading, setJoinLoading] = useState(false);
  const [unjoinLoading, setUnjoinLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // --- Discussion (messages) ---
  const [messages, setMessages] = useState<EventMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [messageSending, setMessageSending] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);

  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [msgMutateLoading, setMsgMutateLoading] = useState(false);

  // ------------------------------------------------
  // DATA LOAD
  // ------------------------------------------------
  useEffect(() => {
    if (!id) return;
    if (checking) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const headers = { Authorization: `Bearer ${token}` };

        const [eventRes, meRes, favRes, msgRes] = await Promise.all([
          fetch(`${API_URL}/events/${id}`, { headers }),
          fetch(`${API_URL}/auth/me`, { headers }),
          fetch(`${API_URL}/events/my/favorites`, { headers }),
          fetch(`${API_URL}/events/${id}/messages`, { headers }),
        ]);

        if (!eventRes.ok) {
          const data = await eventRes.json().catch(() => ({}));
          throw new Error(data.error || "Event not found");
        }

        const eventJson = await eventRes.json();
        const ev: EventDetail = eventJson.event;
        setEventData(ev);

        if (meRes.ok) {
          const meJson = await meRes.json();
          setCurrentUser(meJson.user);
        }

        if (favRes.ok) {
          const favJson = await favRes.json().catch(() => ({}));
          const favEvents = (favJson.events || []) as { id: number }[];
          const alreadyFav = favEvents.some((e) => e.id === ev.id);
          setIsFavorite(alreadyFav);
        }

        if (msgRes.ok) {
          const msgJson = await msgRes.json().catch(() => ({}));
          setMessages(msgJson.messages || []);
        }
      } catch (err: any) {
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, checking, router]);

  // ------------------------------------------------
  // DERIVED FLAGS
  // ------------------------------------------------
  const isJoined =
    !!currentUser &&
    !!eventData &&
    eventData.participants.some((p) => p.user.id === currentUser.id);

  const isOwner =
    !!currentUser &&
    !!eventData &&
    !!eventData.createdBy &&
    eventData.createdBy.id === currentUser.id;

  const isFull =
    !!eventData &&
    eventData.capacity != null &&
    eventData.participants.length >= eventData.capacity;

  const canUseDiscussion =
    !!eventData &&
    !!currentUser &&
    (eventData.createdBy?.id === currentUser.id ||
      eventData.participants.some((p) => p.user.id === currentUser.id));

  // ------------------------------------------------
  // EVENT ACTIONS
  // ------------------------------------------------
  async function handleJoin() {
    if (!eventData) return;
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setJoinLoading(true);
      const res = await fetch(`${API_URL}/events/${eventData.id}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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

      // 🔔 NavBar'a "event joined" sinyali
      if (typeof window !== "undefined") {
        try {
          const customEvent = new CustomEvent("moventra:joined-updated", {
            detail: {
              eventId: eventData.id,
              title: eventData.title,
              city: eventData.city,
              dateTime: eventData.dateTime,
            },
          });
          window.dispatchEvent(customEvent);
        } catch {
          // sessiz geç
        }
      }
    } catch {
      alert("Join failed");
    } finally {
      setJoinLoading(false);
    }
  }

  async function handleUnjoin() {
    if (!eventData || !currentUser) return;
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setUnjoinLoading(true);
      const res = await fetch(`${API_URL}/events/${eventData.id}/unjoin`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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

  async function handleDelete() {
    if (!eventData) return;
    if (!window.confirm("Delete this event? This cannot be undone.")) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setDeleteLoading(true);
      const res = await fetch(`${API_URL}/events/${eventData.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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

  function handleEdit() {
    if (!eventData) return;
    router.push(`/events/edit/${eventData.id}`);
  }

  async function handleToggleFavorite() {
    if (!eventData) return;
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setFavoriteLoading(true);
      const path = isFavorite ? "unfavorite" : "favorite";

      const res = await fetch(`${API_URL}/events/${eventData.id}/${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Favorite action failed");
        return;
      }

      const next = !isFavorite;
      setIsFavorite(next);

      // 🔔 Favori eklendiyse NavBar'a haber ver
      if (typeof window !== "undefined" && next) {
        try {
          const customEvent = new CustomEvent("moventra:favorites-updated", {
            detail: {
              eventId: eventData.id,
              title: eventData.title,
              city: eventData.city,
              dateTime: eventData.dateTime,
            },
          });
          window.dispatchEvent(customEvent);
        } catch {
          // sessiz geç
        }
      }
    } catch {
      alert("Favorite action failed");
    } finally {
      setFavoriteLoading(false);
    }
  }

  // ------------------------------------------------
  // DISCUSSION ACTIONS
  // ------------------------------------------------
  async function handleSendMessage() {
    if (!eventData || !messageInput.trim()) return;
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setMessageSending(true);
      setMsgError(null);

      const res = await fetch(`${API_URL}/events/${eventData.id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: messageInput }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsgError(data.error || "Could not send message");
        return;
      }

      setMessages((prev) => [...prev, data.message]);
      setMessageInput("");
    } catch {
      setMsgError("Could not send message");
    } finally {
      setMessageSending(false);
    }
  }

  function startEditMessage(msg: EventMessage) {
    setEditingMessageId(msg.id);
    setEditingText(msg.content);
    setMsgError(null);
  }

  function cancelEdit() {
    setEditingMessageId(null);
    setEditingText("");
  }

  async function handleSaveEdit(messageId: number) {
    if (!eventData) return;
    if (!editingText.trim()) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setMsgMutateLoading(true);
      setMsgError(null);

      const res = await fetch(
        `${API_URL}/events/${eventData.id}/messages/${messageId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: editingText }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsgError(data.error || "Could not update message");
        return;
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? data.message : m))
      );
      cancelEdit();
    } catch {
      setMsgError("Could not update message");
    } finally {
      setMsgMutateLoading(false);
    }
  }

  async function handleDeleteMessage(messageId: number) {
    if (!eventData) return;
    if (!window.confirm("Delete this message?")) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setMsgMutateLoading(true);
      setMsgError(null);

      const res = await fetch(
        `${API_URL}/events/${eventData.id}/messages/${messageId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsgError(data.error || "Could not delete message");
        return;
      }

      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch {
      setMsgError("Could not delete message");
    } finally {
      setMsgMutateLoading(false);
    }
  }

  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------

  if (checking) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: 24,
          background: "var(--bg)",
          color: "var(--fg)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p>Checking authentication...</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: 24,
          background: "var(--bg)",
          color: "var(--fg)",
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
          background: "var(--bg)",
          color: "var(--fg)",
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
        color: "var(--fg)",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* HEADER CARD */}
        <section
          style={{
            borderRadius: 26,
            border: "1px solid rgba(148,163,184,0.28)",
            background:
              "radial-gradient(circle at top left, rgba(255,255,255,0.96), rgba(248,250,252,0.98))",
            boxShadow: "0 18px 40px rgba(15,23,42,0.14)",
            padding: "1.6rem 1.7rem 1.4rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  fontSize: 30,
                  fontWeight: 750,
                  marginBottom: 6,
                  letterSpacing: "-0.02em",
                }}
              >
                {eventData.title}
              </h1>

              <p
                style={{
                  fontSize: 16,
                  opacity: 0.9,
                  marginBottom: 4,
                }}
              >
                {eventData.city}
                {eventData.location ? ` • ${eventData.location}` : ""}
              </p>

              <p
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  opacity: 0.8,
                }}
              >
                {new Date(eventData.dateTime).toLocaleString()}
              </p>

              {eventData.hobby && (
                <p
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    opacity: 0.9,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Hobby:</span>{" "}
                  {eventData.hobby.name}
                </p>
              )}

              {eventData.capacity != null && (
                <p
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    opacity: 0.85,
                  }}
                >
                  Capacity: {eventData.capacity} • Joined:{" "}
                  {eventData.participants.length}
                </p>
              )}

              {eventData.description && (
                <p
                  style={{
                    marginTop: 14,
                    fontSize: 14,
                    opacity: 0.9,
                    maxWidth: 620,
                  }}
                >
                  {eventData.description}
                </p>
              )}
            </div>

            {isOwner && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  alignItems: "flex-end",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(22,163,74,0.4)",
                    background:
                      "radial-gradient(circle at 10% 0,rgba(34,197,94,0.12),rgba(16,185,129,0.04))",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#166534",
                    boxShadow: "0 8px 18px rgba(22,163,74,0.25)",
                  }}
                >
                  You are the organizer
                </span>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={handleEdit}
                    disabled={deleteLoading}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      border: "1px solid rgba(37,99,235,0.4)",
                      background:
                        "linear-gradient(135deg,rgba(219,234,254,0.95),rgba(191,219,254,0.96))",
                      color: "#1d4ed8",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition:
                        "transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease",
                      boxShadow: "0 10px 20px rgba(37,99,235,0.18)",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(-1px)";
                      el.style.boxShadow =
                        "0 14px 26px rgba(37,99,235,0.30)";
                      el.style.filter = "brightness(1.04)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(0)";
                      el.style.boxShadow =
                        "0 10px 20px rgba(37,99,235,0.18)";
                      el.style.filter = "brightness(1)";
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      border: "1px solid rgba(239,68,68,0.55)",
                      background:
                        "linear-gradient(135deg,rgba(254,242,242,0.96),rgba(254,226,226,0.98))",
                      color: "#b91c1c",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      opacity: deleteLoading ? 0.8 : 1,
                      transition:
                        "transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease",
                      boxShadow: "0 10px 22px rgba(239,68,68,0.26)",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(-1px)";
                      el.style.boxShadow =
                        "0 14px 30px rgba(239,68,68,0.35)";
                      el.style.filter = "brightness(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(0)";
                      el.style.boxShadow =
                        "0 10px 22px rgba(239,68,68,0.26)";
                      el.style.filter = "brightness(1)";
                    }}
                  >
                    {deleteLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* JOIN / FAVORITE */}
        <section
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {isJoined ? (
            <button
              onClick={handleUnjoin}
              disabled={unjoinLoading}
              style={{
                padding: "0.7rem 1.4rem",
                borderRadius: 999,
                border: "1px solid rgba(220,38,38,0.6)",
                background:
                  "linear-gradient(135deg,rgba(254,242,242,0.96),rgba(254,202,202,0.98))",
                color: "#b91c1c",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                opacity: unjoinLoading ? 0.8 : 1,
                boxShadow: "0 10px 22px rgba(239,68,68,0.25)",
                transition:
                  "transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(-1px)";
                el.style.boxShadow =
                  "0 14px 30px rgba(239,68,68,0.36)";
                el.style.filter = "brightness(1.03)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(0)";
                el.style.boxShadow =
                  "0 10px 22px rgba(239,68,68,0.25)";
                el.style.filter = "brightness(1)";
              }}
            >
              {unjoinLoading ? "Unjoining..." : "Leave Event"}
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joinLoading || isFull}
              style={{
                padding: "0.75rem 1.6rem",
                borderRadius: 999,
                border: "none",
                background: isFull
                  ? "rgba(148,163,184,0.45)"
                  : "linear-gradient(135deg,#22c55e,#16a34a,#15803d)",
                color: isFull ? "#e5e7eb" : "#f9fafb",
                fontSize: 14,
                fontWeight: 700,
                cursor: isFull ? "not-allowed" : "pointer",
                opacity: joinLoading ? 0.85 : 1,
                boxShadow: isFull
                  ? "none"
                  : "0 14px 30px rgba(22,163,74,0.45)",
                transition:
                  "transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease",
              }}
              onMouseEnter={(e) => {
                if (isFull) return;
                const el = e.currentTarget;
                el.style.transform = "translateY(-2px)";
                el.style.boxShadow =
                  "0 18px 38px rgba(22,163,74,0.60)";
                el.style.filter = "brightness(1.05)";
              }}
              onMouseLeave={(e) => {
                if (isFull) return;
                const el = e.currentTarget;
                el.style.transform = "translateY(0)";
                el.style.boxShadow =
                  "0 14px 30px rgba(22,163,74,0.45)";
                el.style.filter = "brightness(1)";
              }}
            >
              {isFull
                ? "Event is full"
                : joinLoading
                ? "Joining..."
                : "Join Event"}
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
            style={{
              padding: "0.7rem 1.4rem",
              borderRadius: 999,
              border: isFavorite
                ? "1px solid rgba(234,179,8,0.8)"
                : "1px solid rgba(15,23,42,0.2)",
              background: isFavorite
                ? "linear-gradient(135deg,rgba(250,204,21,0.16),rgba(252,211,77,0.22))"
                : "rgba(15,23,42,0.92)",
              color: isFavorite ? "#854d0e" : "#e5e7eb",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              opacity: favoriteLoading ? 0.8 : 1,
              boxShadow: isFavorite
                ? "0 12px 26px rgba(250,204,21,0.35)"
                : "0 12px 28px rgba(15,23,42,0.55)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition:
                "transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(-1px)";
              el.style.boxShadow = isFavorite
                ? "0 16px 32px rgba(250,204,21,0.45)"
                : "0 16px 34px rgba(15,23,42,0.75)";
              el.style.filter = "brightness(1.03)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = isFavorite
                ? "0 12px 26px rgba(250,204,21,0.35)"
                : "0 12px 28px rgba(15,23,42,0.55)";
              el.style.filter = "brightness(1)";
            }}
          >
            <span style={{ fontSize: 16 }}>
              {isFavorite ? "★" : "☆"}
            </span>
            {favoriteLoading
              ? "Updating..."
              : isFavorite
              ? "Remove from Favorites"
              : "Add to Favorites"}
          </button>
        </section>

        {/* PARTICIPANTS */}
        <section>
          <h3 style={{ marginTop: 8, fontSize: 20, fontWeight: 600 }}>
            Participants
          </h3>
          {eventData.participants.length === 0 && (
            <p style={{ opacity: 0.7, marginTop: 6 }}>
              No participants yet.
            </p>
          )}
          <ul style={{ marginTop: 10 }}>
            {eventData.participants.map((p) => (
              <li
                key={p.id}
                style={{
                  marginBottom: 6,
                  fontSize: 14,
                  opacity: 0.92,
                }}
              >
                {p.user.name}
              </li>
            ))}
          </ul>
        </section>

        {/* EVENT DISCUSSION – sade yorum listesi */}
        <section
          style={{
            marginTop: 8,
            padding: "1.4rem 1.5rem 1.3rem",
            borderRadius: 24,
            background:
              "radial-gradient(circle at top left,#020617,#020617 55%)",
            border: "1px solid rgba(148,163,184,0.6)",
            boxShadow: "0 22px 50px rgba(15,23,42,0.9)",
            color: "#f9fafb",
          }}
        >
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
              gap: 10,
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Event Discussion
              </h3>
              <p
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  maxWidth: 520,
                }}
              >
                Discussion stays open until 2 days after the event.
                Participants can post{" "}
                <strong>one comment per hour</strong>; the organizer has
                no limit.
              </p>
            </div>

            <span
              style={{
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(148,163,184,0.7)",
                boxShadow: "0 8px 20px rgba(15,23,42,0.85)",
                whiteSpace: "nowrap",
              }}
            >
              Organizer & participants only
            </span>
          </header>

          {/* COMMENT LIST */}
          <div
            style={{
              maxHeight: 260,
              overflowY: "auto",
              padding: "0.4rem 0.2rem",
              borderRadius: 16,
              border: "1px solid rgba(30,64,175,0.45)",
              background: "rgba(15,23,42,0.95)",
              marginBottom: 12,
            }}
          >
            {messages.length === 0 ? (
              <p
                style={{
                  opacity: 0.65,
                  fontSize: 13,
                  padding: "0.4rem 0.6rem",
                }}
              >
                No comments yet. Be the first to share some details or ask
                a question.
              </p>
            ) : (
              messages.map((m) => {
                const mine = currentUser && m.user.id === currentUser.id;
                const owner =
                  currentUser &&
                  eventData.createdBy &&
                  eventData.createdBy.id === currentUser.id;

                const canEdit = mine;
                const canDelete = mine || owner;

                return (
                  <div
                    key={m.id}
                    style={{
                      padding: "0.55rem 0.7rem",
                      borderBottom:
                        "1px solid rgba(30,64,175,0.35)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 10,
                        marginBottom: 2,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                        >
                          {m.user.name}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            opacity: 0.65,
                          }}
                        >
                          {new Date(m.createdAt).toLocaleString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      </div>

                      {(canEdit || canDelete) &&
                        editingMessageId !== m.id && (
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              fontSize: 11,
                              opacity: 0.75,
                            }}
                          >
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => startEditMessage(m)}
                                disabled={msgMutateLoading}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  color: "#bfdbfe",
                                  cursor: "pointer",
                                  padding: 0,
                                }}
                              >
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(m.id)}
                                disabled={msgMutateLoading}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  color: "#fecaca",
                                  cursor: "pointer",
                                  padding: 0,
                                }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                    </div>

                    {editingMessageId === m.id ? (
                      <div>
                        <textarea
                          value={editingText}
                          onChange={(e) =>
                            setEditingText(e.target.value)
                          }
                          rows={2}
                          style={{
                            width: "100%",
                            fontSize: 13,
                            borderRadius: 8,
                            border: "1px solid #1f2937",
                            backgroundColor: "#020617",
                            color: "white",
                            padding: 6,
                            resize: "vertical",
                          }}
                        />
                        <div
                          style={{
                            marginTop: 4,
                            display: "flex",
                            gap: 6,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(m.id)}
                            disabled={msgMutateLoading}
                            style={{
                              padding: "3px 10px",
                              borderRadius: 999,
                              border: "none",
                              backgroundColor: "#22c55e",
                              color: "black",
                              fontSize: 11,
                              cursor: "pointer",
                            }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={msgMutateLoading}
                            style={{
                              padding: "3px 10px",
                              borderRadius: 999,
                              border: "1px solid #4b5563",
                              backgroundColor: "transparent",
                              color: "#e5e7eb",
                              fontSize: 11,
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p
                        style={{
                          marginTop: 2,
                          opacity: 0.96,
                          fontSize: 13,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {m.content}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* INPUT AREA */}
          <div style={{ marginTop: 4 }}>
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={
                canUseDiscussion
                  ? "Write a message (max 500 chars)..."
                  : "You must join the event to write a message."
              }
              maxLength={500}
              rows={3}
              disabled={!canUseDiscussion}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 14,
                backgroundColor: "#020617",
                border: "1px solid #1e293b",
                color: "white",
                fontSize: 14,
                resize: "vertical",
                opacity: canUseDiscussion ? 1 : 0.5,
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
                gap: 12,
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {msgError ? (
                  <span style={{ color: "#f97373" }}>{msgError}</span>
                ) : (
                  <span>
                    Participants: max 1 message per hour. Organizer has
                    no limit.
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={
                  messageSending ||
                  !messageInput.trim() ||
                  !canUseDiscussion
                }
                style={{
                  padding: "8px 20px",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,rgba(59,130,246,1),rgba(129,140,248,1))",
                  color: "white",
                  cursor: messageSending ? "wait" : "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  opacity:
                    messageSending ||
                    !messageInput.trim() ||
                    !canUseDiscussion
                      ? 0.6
                      : 1,
                  boxShadow: "0 14px 32px rgba(37,99,235,0.65)",
                  transition:
                    "transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease",
                }}
                onMouseEnter={(e) => {
                  if (
                    messageSending ||
                    !messageInput.trim() ||
                    !canUseDiscussion
                  )
                    return;
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-1px)";
                  el.style.boxShadow =
                    "0 18px 40px rgba(37,99,235,0.8)";
                  el.style.filter = "brightness(1.05)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow =
                    "0 14px 32px rgba(37,99,235,0.65)";
                  el.style.filter = "brightness(1)";
                }}
              >
                {messageSending ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
