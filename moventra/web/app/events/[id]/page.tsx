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
    if (checking) return; // auth kontrolü bitmeden fetch etme

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

      setIsFavorite(!isFavorite);
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

  // 🔐 Auth check sırasında
  if (checking) {
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
        {/* HEADER */}
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

        {/* JOIN / FAVORITE */}
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

          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid rgba(250,250,250,0.4)",
              background: isFavorite
                ? "rgba(250,204,21,0.18)"
                : "rgba(15,23,42,0.9)",
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

        {/* PARTICIPANTS */}
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

        {/* EVENT DISCUSSION */}
        <section
          style={{
            marginTop: 32,
            padding: "1.25rem",
            borderRadius: 16,
            background:
              "radial-gradient(circle at top left, #111827, #020617 60%)",
            border: "1px solid rgba(148,163,184,0.6)",
            boxShadow: "0 20px 40px rgba(15,23,42,0.8)",
          }}
        >
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
              gap: 8,
            }}
          >
            <div>
              <h3 style={{ fontSize: 20, marginBottom: 4 }}>Event Discussion</h3>
              <p style={{ fontSize: 12, opacity: 0.7 }}>
                Discussion stays open until 2 days after the event. Participants
                can post <strong>one comment per hour</strong>; the organizer
                has no limit.
              </p>
            </div>

            <span
              style={{
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 999,
                backgroundColor: "rgba(37,99,235,0.2)",
                border: "1px solid rgba(59,130,246,0.7)",
              }}
            >
              Organizer & participants only
            </span>
          </header>

          <div
            style={{
              maxHeight: 260,
              overflowY: "auto",
              padding: "0.5rem",
              borderRadius: 10,
              border: "1px solid rgba(51,65,85,0.9)",
              background: "rgba(15,23,42,0.9)",
              marginBottom: 10,
            }}
          >
            {messages.length === 0 ? (
              <p style={{ opacity: 0.6, fontSize: 13 }}>
                No comments yet. Be the first to share some details or ask a
                question.
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
                      padding: "8px 10px",
                      borderRadius: 10,
                      marginBottom: 6,
                      backgroundColor: "rgba(15,23,42,0.95)",
                      border: "1px solid rgba(31,41,55,0.9)",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 2,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            opacity: 0.9,
                          }}
                        >
                          {m.user.name}
                        </span>
                        <span style={{ fontSize: 11, opacity: 0.6 }}>
                          {new Date(m.createdAt).toLocaleString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      </div>

                      {editingMessageId === m.id ? (
                        <div>
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
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
                            opacity: 0.9,
                            fontSize: 13,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {m.content}
                        </p>
                      )}
                    </div>

                    {(canEdit || canDelete) && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          alignItems: "flex-end",
                          marginLeft: 4,
                          fontSize: 11,
                        }}
                      >
                        {canEdit && editingMessageId !== m.id && (
                          <button
                            type="button"
                            onClick={() => startEditMessage(m)}
                            disabled={msgMutateLoading}
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "#93c5fd",
                              cursor: "pointer",
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
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* INPUT AREA */}
          <div style={{ marginTop: 10 }}>
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
                padding: "10px",
                borderRadius: 10,
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
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {msgError ? (
                  <span style={{ color: "#f97373" }}>{msgError}</span>
                ) : (
                  <span>
                    Participants: max 1 message per hour. Organizer has no
                    limit.
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
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: "#2563eb",
                  color: "white",
                  cursor: messageSending ? "wait" : "pointer",
                  fontSize: 14,
                  opacity:
                    messageSending || !messageInput.trim() || !canUseDiscussion
                      ? 0.6
                      : 1,
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
