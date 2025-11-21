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

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filtre state'leri
  const [cityFilter, setCityFilter] = useState("");
  const [hobbyFilter, setHobbyFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [onlyMyHobbies, setOnlyMyHobbies] = useState(false);

  const [joiningId, setJoiningId] = useState<number | null>(null);

  function getToken() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("token");
  }

  // İlk yüklemede hem hobileri hem eventleri çek
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    async function initialLoad() {
      try {
        setLoading(true);
        setError(null);

        const headers = { Authorization: `Bearer ${token}` };

        const [eventsRes, hobbiesRes] = await Promise.all([
          fetch(`${API_URL}/events`, { headers }),
          fetch(`${API_URL}/hobbies`),
        ]);

        if (!eventsRes.ok) {
          const data = await eventsRes.json().catch(() => ({}));
          throw new Error(data.error || "Could not load events");
        }

        const eventsJson = await eventsRes.json();
        setEvents(eventsJson.events || []);

        const hobbiesJson = await hobbiesRes.json().catch(() => ({ hobbies: [] }));
        setHobbies(hobbiesJson.hobbies || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    initialLoad();
  }, [router]);

  // Filtrelere göre event çek
  async function fetchFilteredEvents() {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (cityFilter.trim()) {
        params.append("city", cityFilter.trim());
      }

      if (hobbyFilter) {
        params.append("hobbyId", hobbyFilter);
      }

      if (fromDate) {
        const from = new Date(fromDate);
        params.append("from", from.toISOString());
      }

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        params.append("to", to.toISOString());
      }

      if (onlyMyHobbies) {
        params.append("myHobbies", "true");
      }

      const query = params.toString();
      const url = `${API_URL}/events${query ? `?${query}` : ""}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      setLoading(false);
    }
  }

  // Filtreler değişince otomatik yeniden çek
  useEffect(() => {
    // ilk yüklemede zaten initialLoad çalıştı, ikinci kez çağırmak için:
    fetchFilteredEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityFilter, hobbyFilter, fromDate, toDate, onlyMyHobbies]);

  // Join butonu
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

      // Çok uğraşmadan: join sonrası listeyi yeniden çek
      await fetchFilteredEvents();
    } catch (err) {
      console.error(err);
      alert("Join failed");
    } finally {
      setJoiningId(null);
    }
  }

  function handleCardClick(eventId: number) {
    router.push(`/events/${eventId}`);
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
        {/* Başlık + açıklama */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
              Events
            </h1>
            <p style={{ opacity: 0.8, fontSize: 14 }}>
              Filter by city, hobby, date or your own hobbies.
            </p>
          </div>
        </div>

        {/* Filtre Paneli */}
        <section
          style={{
            marginBottom: 24,
            padding: 16,
            borderRadius: 16,
            border: "1px solid #111827",
            background:
              "linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,64,175,0.6))",
            boxShadow: "0 16px 35px rgba(15,23,42,0.9)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 12,
            }}
          >
            {/* City */}
            <div style={{ minWidth: 160, flex: 1 }}>
              <label style={{ fontSize: 12, opacity: 0.8, marginBottom: 4, display: "block" }}>
                City
              </label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="e.g. Berlin"
                style={{
                  width: "100%",
                  padding: "0.45rem 0.7rem",
                  borderRadius: 999,
                  border: "1px solid #1f2937",
                  backgroundColor: "rgba(15,23,42,0.9)",
                  color: "white",
                  fontSize: 14,
                }}
              />
            </div>

            {/* Hobby */}
            <div style={{ minWidth: 160, flex: 1 }}>
              <label style={{ fontSize: 12, opacity: 0.8, marginBottom: 4, display: "block" }}>
                Hobby
              </label>
              <select
                value={hobbyFilter}
                onChange={(e) => setHobbyFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.45rem 0.7rem",
                  borderRadius: 999,
                  border: "1px solid #1f2937",
                  backgroundColor: "rgba(15,23,42,0.9)",
                  color: "white",
                  fontSize: 14,
                }}
              >
                <option value="">All hobbies</option>
                {hobbies.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* From date */}
            <div style={{ minWidth: 160 }}>
              <label style={{ fontSize: 12, opacity: 0.8, marginBottom: 4, display: "block" }}>
                From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.45rem 0.7rem",
                  borderRadius: 999,
                  border: "1px solid #1f2937",
                  backgroundColor: "rgba(15,23,42,0.9)",
                  color: "white",
                  fontSize: 14,
                }}
              />
            </div>

            {/* To date */}
            <div style={{ minWidth: 160 }}>
              <label style={{ fontSize: 12, opacity: 0.8, marginBottom: 4, display: "block" }}>
                To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.45rem 0.7rem",
                  borderRadius: 999,
                  border: "1px solid #1f2937",
                  backgroundColor: "rgba(15,23,42,0.9)",
                  color: "white",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          {/* Only my hobbies */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 4,
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={onlyMyHobbies}
                onChange={(e) => setOnlyMyHobbies(e.target.checked)}
              />
              <span>Only my hobbies</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setCityFilter("");
                setHobbyFilter("");
                setFromDate("");
                setToDate("");
                setOnlyMyHobbies(false);
              }}
              style={{
                padding: "0.35rem 0.9rem",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.7)",
                backgroundColor: "transparent",
                color: "white",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Clear filters
            </button>
          </div>
        </section>

        {loading && <p>Loading...</p>}
        {error && (
          <p style={{ color: "#f97373", marginBottom: 16 }}>{error}</p>
        )}
        {isEmpty && <p>No events found with these filters.</p>}

        {/* Event kartları */}
        <section
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

                {/* Açıklama (kısa) */}
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

                {/* Buton */}
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
                      handleJoin(event.id);
                    }}
                    disabled={joiningId === event.id}
                    style={{
                      padding: "0.45rem 1rem",
                      borderRadius: 999,
                      border: "none",
                      background:
                        "linear-gradient(135deg,rgba(59,130,246,1),rgba(56,189,248,1))",
                      color: "black",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      opacity: joiningId === event.id ? 0.7 : 1,
                    }}
                  >
                    {joiningId === event.id ? "Joining..." : "Join"}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
