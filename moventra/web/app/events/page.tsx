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

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);

  const [cityFilter, setCityFilter] = useState("");
  const [hobbyFilter, setHobbyFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [onlyMyHobbies, setOnlyMyHobbies] = useState(false);

  const [loading, setLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ortak token helper
  function getToken() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("token");
  }

  // İlk açılışta hobiler + eventler
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchInitial() {
      try {
        setLoading(true);
        setError(null);

        const headers = { Authorization: `Bearer ${token}` };

        const [hobbiesRes, eventsRes] = await Promise.all([
          fetch(`${API_URL}/hobbies`, { headers }),
          fetch(`${API_URL}/events`, { headers }),
        ]);

        if (hobbiesRes.ok) {
          const hobbiesJson = await hobbiesRes.json();
          setHobbies(hobbiesJson.hobbies || []);
        }

        if (!eventsRes.ok) {
          const data = await eventsRes.json().catch(() => ({}));
          throw new Error(data.error || "Could not load events");
        }

        const eventsJson = await eventsRes.json();
        setEvents(eventsJson.events || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    fetchInitial();
  }, [router]);

  // Ortak event fetch (filtreli)
  async function fetchEventsWithFilters() {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setFiltersLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (cityFilter.trim()) params.set("city", cityFilter.trim());
      if (hobbyFilter !== "all") params.set("hobbyId", hobbyFilter);
      if (fromDate) params.set("from", new Date(fromDate).toISOString());
      if (toDate) params.set("to", new Date(toDate).toISOString());
      if (onlyMyHobbies) params.set("myHobbies", "true");

      const query = params.toString();
      const url = `${API_URL}/events${query ? `?${query}` : ""}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not load events");
      }

      const data = await res.json();
      setEvents(data.events || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error");
    } finally {
      setFiltersLoading(false);
    }
  }

  function handleApplyFilters() {
    fetchEventsWithFilters();
  }

  function handleClearFilters() {
    setCityFilter("");
    setHobbyFilter("all");
    setFromDate("");
    setToDate("");
    setOnlyMyHobbies(false);
    fetchEventsWithFilters();
  }

  // Join event
  async function handleJoin(eventId: number) {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
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

      // join sonrası listeyi tazele
      await fetchEventsWithFilters();
    } catch (err) {
      console.error(err);
      alert("Join failed");
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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
            Events
          </h1>

          <button
            onClick={() => router.push("/events/new")}
            style={{
              alignSelf: "center",
              padding: "0.55rem 1.5rem",
              borderRadius: 999,
              border: "none",
              background: "#16a34a",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Create Event
          </button>
        </div>

        {/* Filters Card */}
        <section
          style={{
            marginBottom: 24,
            padding: "1.1rem 1.3rem",
            borderRadius: "1rem",
            border: "1px solid #111827",
            backgroundColor: "#020617",
            boxShadow: "0 10px 30px rgba(15,23,42,0.9)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              gap: 14,
              marginBottom: 10,
            }}
          >
            {/* City */}
            <div>
              <label style={{ fontSize: 13, opacity: 0.8 }}>City</label>
              <input
                type="text"
                placeholder="e.g. Berlin"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "0.5rem 0.7rem",
                  borderRadius: 999,
                  border: "1px solid #1f2937",
                  backgroundColor: "#020617",
                  color: "white",
                  outline: "none",
                }}
              />
            </div>

            {/* Hobby */}
            <div>
              <label style={{ fontSize: 13, opacity: 0.8 }}>Hobby</label>
              <select
                value={hobbyFilter}
                onChange={(e) => setHobbyFilter(e.target.value)}
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "0.5rem 0.7rem",
                  borderRadius: 999,
                  border: "1px solid #1f2937",
                  backgroundColor: "#020617",
                  color: "white",
                  outline: "none",
                }}
              >
                <option value="all">All hobbies</option>
                {hobbies.map((h) => (
                  <option key={h.id} value={String(h.id)}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* From date */}
            <div>
              <label style={{ fontSize: 13, opacity: 0.8 }}>From date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "0.5rem 0.7rem",
                  borderRadius: 999,
                  border: "1px solid #1f2937",
                  backgroundColor: "#020617",
                  color: "white",
                  outline: "none",
                }}
              />
            </div>

            {/* To date */}
            <div>
              <label style={{ fontSize: 13, opacity: 0.8 }}>To date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "0.5rem 0.7rem",
                  borderRadius: 999,
                  border: "1px solid #1f2937",
                  backgroundColor: "#020617",
                  color: "white",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Only my hobbies + buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 4,
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
              }}
            >
              <input
                type="checkbox"
                checked={onlyMyHobbies}
                onChange={(e) => setOnlyMyHobbies(e.target.checked)}
              />
              <span>Only my hobbies</span>
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={handleClearFilters}
                style={{
                  padding: "0.4rem 1.1rem",
                  borderRadius: 999,
                  border: "1px solid #374151",
                  backgroundColor: "transparent",
                  color: "white",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                disabled={filtersLoading}
                style={{
                  padding: "0.45rem 1.2rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#2563eb,#1d4ed8,#22c55e)",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {filtersLoading ? "Filtering..." : "Apply filters"}
              </button>
            </div>
          </div>
        </section>

        {/* Error / Loading / Empty */}
        {loading && <p>Loading events...</p>}
        {error && (
          <p style={{ color: "#f97373", marginBottom: 16 }}>{error}</p>
        )}
        {isEmpty && <p>No events found for the selected filters.</p>}

        {/* Events grid */}
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
            const isFull =
              capacity !== null && participantsCount >= capacity;

            return (
              <div
                key={event.id}
                onClick={() => router.push(`/events/${event.id}`)}
                style={{
                  borderRadius: "1rem",
                  border: "1px solid #111827",
                  background:
                    "linear-gradient(135deg,rgba(15,23,42,0.88),rgba(30,64,175,0.55))",
                  padding: "1.4rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.7rem",
                  cursor: "pointer",
                  transition:
                    "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
                  boxShadow: "0 12px 30px rgba(15,23,42,0.8)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "translateY(-2px)";
                  el.style.boxShadow = "0 18px 40px rgba(15,23,42,1)";
                  el.style.borderColor = "#1d4ed8";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "none";
                  el.style.boxShadow = "0 12px 30px rgba(15,23,42,0.8)";
                  el.style.borderColor = "#111827";
                }}
              >
                {/* üst satır: başlık + hobby badge */}
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

                {/* orta satır: tarih, saat, kapasite */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.8rem",
                    fontSize: 13,
                    opacity: 0.92,
                  }}
                >
                  <span>🗓 {formattedDate} · {formattedTime}</span>
                  {capacity !== null && (
                    <span>👥 {participantsCount}/{capacity}</span>
                  )}
                </div>

                {/* alt satır: butonlar */}
                <div
                  style={{
                    marginTop: 4,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/events/${event.id}`);
                    }}
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
  disabled={isFull}
  onClick={(e) => {
    e.stopPropagation();
    handleJoin(event.id);
  }}
  style={{
    padding: "0.5rem 1.1rem",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: isFull
      ? "rgba(120,120,120,0.2)"
      : "rgba(59,130,246,0.15)", // mavi glass
    backdropFilter: "blur(8px)",
    color: isFull ? "rgba(200,200,200,0.6)" : "white",
    fontSize: 14,
    fontWeight: 600,
    cursor: isFull ? "not-allowed" : "pointer",
    boxShadow: isFull
      ? "none"
      : "0 0 10px rgba(59,130,246,0.45)",
    transition: "all 0.22s ease",
  }}
  onMouseEnter={(e) => {
    if (isFull) return;
    const el = e.currentTarget;
    el.style.transform = "scale(1.05)";
    el.style.boxShadow = "0 0 15px rgba(59,130,246,0.8)";
    el.style.background = "rgba(59,130,246,0.3)";
  }}
  onMouseLeave={(e) => {
    const el = e.currentTarget;
    el.style.transform = "scale(1)";
    el.style.boxShadow = "0 0 10px rgba(59,130,246,0.45)";
    el.style.background = "rgba(59,130,246,0.15)";
  }}
>
  {isFull ? "Full" : "Join"}
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
