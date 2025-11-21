"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Hobby = {
  id: number;
  name: string;
};

type EventParticipant = {
  user: {
    id: number;
    name: string;
  };
};

type Event = {
  id: number;
  title: string;
  city: string;
  location?: string | null;
  dateTime: string;
  capacity?: number | null;
  hobby?: Hobby | null;
  participants?: EventParticipant[];
};

type CurrentUser = {
  id: number;
  name: string;
};

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [cityFilter, setCityFilter] = useState("");
  const [hobbyFilter, setHobbyFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [onlyMyHobbies, setOnlyMyHobbies] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // İlk açılışta token kontrolü + hobiler + currentUser + events
  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchHobbies(token);
    fetchMe(token);
    fetchEvents(token);
  }, [router]);

  function buildEventsUrl() {
    const params = new URLSearchParams();

    if (cityFilter.trim()) {
      params.set("city", cityFilter.trim());
    }
    if (hobbyFilter) {
      params.set("hobbyId", hobbyFilter);
    }
    if (startDate) {
      // 🔹 backend from / to bekliyor
      params.set("from", startDate);
    }
    if (endDate) {
      params.set("to", endDate);
    }
    if (onlyMyHobbies) {
      // 🔹 backend param adı myHobbies
      params.set("myHobbies", "true");
    }

    const qs = params.toString();
    return `${API_URL}/events${qs ? `?${qs}` : ""}`;
  }

  async function fetchMe(token: string) {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      setCurrentUser(data.user);
    } catch {
      // sessiz geç
    }
  }

  async function fetchHobbies(token: string) {
    try {
      const res = await fetch(`${API_URL}/hobbies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      setHobbies(data.hobbies || data || []);
    } catch {
      // sessiz geç
    }
  }

  async function fetchEvents(token: string) {
    setLoading(true);
    setError(null);

    try {
      const url = buildEventsUrl();
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("Events could not be loaded.");
        setEvents([]);
        return;
      }

      const data = await res.json();
      setEvents(data.events || data || []);
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading events.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyFilters() {
    const token = window.localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    await fetchEvents(token);
  }

  function handleClearFilters() {
    setCityFilter("");
    setHobbyFilter("");
    setStartDate("");
    setEndDate("");
    setOnlyMyHobbies(false);

    const token = window.localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchEvents(token);
  }

  async function handleJoin(eventId: number) {
    const token = window.localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/events/${eventId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Could not join this event.");
        return;
      }

      await fetchEvents(token);
    } catch (err) {
      console.error(err);
      alert("An error occurred while joining the event.");
    }
  }

  async function handleUnjoin(eventId: number) {
    const token = window.localStorage.getItem("token");
    if (!token || !currentUser) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/events/${eventId}/unjoin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Could not unjoin this event.");
        return;
      }

      await fetchEvents(token);
    } catch (err) {
      console.error(err);
      alert("An error occurred while unjoining the event.");
    }
  }

  return (
    <div>
      {/* Üst başlık + create */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ fontSize: "1.8rem", fontWeight: 600 }}>Events</h1>
        <Link
          href="/events/new"
          style={{
            backgroundColor: "#16a34a",
            padding: "0.5rem 1rem",
            borderRadius: "999px",
            color: "white",
            fontWeight: 500,
          }}
        >
          Create Event
        </Link>
      </div>

      {/* Filtre paneli */}
      <div
        style={{
          marginBottom: "1.5rem",
          padding: "1rem",
          borderRadius: "0.75rem",
          backgroundColor: "#020617",
          border: "1px solid #111827",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", minWidth: 150 }}>
          <label style={{ fontSize: "0.8rem", marginBottom: "0.2rem" }}>
            City
          </label>
          <input
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            placeholder="e.g. Berlin"
            style={{
              padding: "0.4rem 0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid #1f2937",
              backgroundColor: "#020617",
              color: "#e5e7eb",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", minWidth: 170 }}>
          <label style={{ fontSize: "0.8rem", marginBottom: "0.2rem" }}>
            Hobby
          </label>
          <select
            value={hobbyFilter}
            onChange={(e) => setHobbyFilter(e.target.value)}
            style={{
              padding: "0.4rem 0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid #1f2937",
              backgroundColor: "#020617",
              color: "#e5e7eb",
            }}
          >
            <option value="">All hobbies</option>
            {hobbies.map((hobby) => (
              <option key={hobby.id} value={hobby.id}>
                {hobby.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "0.8rem", marginBottom: "0.2rem" }}>
            From date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: "0.4rem 0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid #1f2937",
              backgroundColor: "#020617",
              color: "#e5e7eb",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "0.8rem", marginBottom: "0.2rem" }}>
            To date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: "0.4rem 0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid #1f2937",
              backgroundColor: "#020617",
              color: "#e5e7eb",
            }}
          />
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.9rem",
            marginLeft: "0.5rem",
          }}
        >
          <input
            type="checkbox"
            checked={onlyMyHobbies}
            onChange={(e) => setOnlyMyHobbies(e.target.checked)}
          />
          Only my hobbies
        </label>

        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          <button
            onClick={handleClearFilters}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "999px",
              border: "1px solid #4b5563",
              backgroundColor: "#020617",
              color: "#e5e7eb",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
          <button
            onClick={handleApplyFilters}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "999px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "white",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Apply filters
          </button>
        </div>
      </div>

      {loading && <p>Loading events...</p>}
      {error && (
        <p style={{ color: "#f97316", marginBottom: "0.5rem" }}>{error}</p>
      )}

      {/* CARD GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "1.2rem",
        }}
      >
        {events.map((event) => {
          const joined =
            currentUser &&
            event.participants?.some(
              (p) => p.user.id === currentUser.id
            );
          const full =
            event.capacity != null &&
            event.participants &&
            event.participants.length >= event.capacity;

          return (
            <div
              key={event.id}
              onClick={() => router.push(`/events/${event.id}`)}
              style={{
                cursor: "pointer",
                padding: "1.5rem",
                borderRadius: "1rem",
                background:
                  "linear-gradient(135deg, rgba(10,10,20,0.7), rgba(20,20,35,0.7))",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                transition:
                  "transform 0.15s ease, box-shadow 0.2s ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(0,0,0,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0,0,0,0.2)";
              }}
            >
              {/* üst satır: title + badges */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    marginRight: "0.5rem",
                  }}
                >
                  {event.title}
                </h2>

                <div style={{ display: "flex", gap: "0.4rem" }}>
                  {joined && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "999px",
                        backgroundColor: "#16a34a",
                        color: "white",
                      }}
                    >
                      Joined
                    </span>
                  )}
                  {full && !joined && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "999px",
                        backgroundColor: "#dc2626",
                        color: "white",
                      }}
                    >
                      Full
                    </span>
                  )}
                </div>
              </div>

              <p style={{ opacity: 0.9 }}>
                {event.city}
                {event.location ? ` • ${event.location}` : ""}
              </p>

              <p style={{ opacity: 0.9 }}>
                {new Date(event.dateTime).toLocaleString()}
              </p>

              {event.hobby && (
                <p
                  style={{
                    marginTop: "0.4rem",
                    opacity: 0.8,
                    fontSize: "0.9rem",
                  }}
                >
                  Hobby: {event.hobby.name}
                </p>
              )}

              {event.capacity != null && (
                <p
                  style={{
                    marginTop: "0.4rem",
                    fontSize: "0.9rem",
                    opacity: 0.8,
                  }}
                >
                  Capacity: {event.capacity}
                  {event.participants &&
                    ` • Joined: ${event.participants.length}`}
                </p>
              )}

              {/* Butonlar */}
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  gap: "0.5rem",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleJoin(event.id)}
                  disabled={!!joined || full}
                  style={{
                    background:
                      joined || full
                        ? "#4b5563"
                        : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    border: "none",
                    padding: "0.55rem 1.2rem",
                    borderRadius: "0.5rem",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    cursor:
                      joined || full ? "not-allowed" : "pointer",
                  }}
                >
                  {joined
                    ? "Joined"
                    : full
                    ? "Full"
                    : "Join Event"}
                </button>

                {joined && (
                  <button
                    onClick={() => handleUnjoin(event.id)}
                    style={{
                      borderRadius: "0.5rem",
                      border: "1px solid #dc2626",
                      backgroundColor: "transparent",
                      color: "#fecaca",
                      padding: "0.55rem 1.1rem",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    Unjoin
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {!loading && events.length === 0 && !error && (
          <p>No events found for the selected filters.</p>
        )}
      </div>
    </div>
  );
}
