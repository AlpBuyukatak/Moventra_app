"use client";

import useRequireAuth from "../hooks/useRequireAuth";
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
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔎 Filtreler
  const [cityFilter, setCityFilter] = useState("");
  const [hobbyFilter, setHobbyFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [onlyMyHobbies, setOnlyMyHobbies] = useState(false);

  function getToken() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("token");
  }

  // İlk açılışta: hem hobileri hem eventleri çek
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

        // Hobiler (dropdown için)
        const hobbiesRes = await fetch(`${API_URL}/hobbies`);
        if (hobbiesRes.ok) {
          const hobbiesJson = await hobbiesRes.json().catch(() => ({}));
          setHobbies(hobbiesJson.hobbies || hobbiesJson || []);
        }

        // Varsayılan olarak tüm eventleri yükle
        await fetchEvents();
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // 🔁 API'den eventleri filtrelerle çek
  async function fetchEvents() {
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
        // backend DateTime bekliyor → ISO string
        params.append("from", new Date(fromDate).toISOString());
      }

      if (toDate) {
        params.append("to", new Date(toDate).toISOString());
      }

      if (onlyMyHobbies) {
        params.append("myHobbies", "true");
      }

      const query = params.toString();
      const url =
        query.length > 0
          ? `${API_URL}/events?${query}`
          : `${API_URL}/events`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Could not load events");
      }

      setEvents(data.events || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

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

      // Tekrar listeyi yenileyelim ki kapasite / katılımcı sayısı güncellensin
      await fetchEvents();
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

  function handleClearFilters() {
    setCityFilter("");
    setHobbyFilter("");
    setFromDate("");
    setToDate("");
    setOnlyMyHobbies(false);
    // Filtreleri sıfırlayınca tekrar tüm eventleri çek
    fetchEvents();
  }

  const isEmpty = !loading && events.length === 0 && !error;

  function renderCard(event: Event) {
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
        {/* Üst satır: başlık + hobi etiketi */}
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

        {/* Tarih / kapasite */}
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

        {/* Description kısaltma */}
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

        {/* Join butonu */}
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
          All Events
        </h1>
        <p style={{ opacity: 0.8, fontSize: 14, marginBottom: 20 }}>
          Browse all events, or narrow them down with filters.
        </p>

        {/* 🔎 FİLTRE PANELİ */}
        <section
          style={{
            marginBottom: 20,
            padding: "1rem",
            borderRadius: 16,
            border: "1px solid #111827",
            backgroundColor: "#020617",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 12,
            alignItems: "flex-end",
          }}
        >
          {/* City */}
          <div>
            <label style={{ fontSize: 13, opacity: 0.85, display: "block" }}>
              City
            </label>
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Berlin, Nuremberg..."
              style={{
                width: "100%",
                padding: "0.4rem 0.6rem",
                borderRadius: 8,
                border: "1px solid #1f2937",
                background: "rgba(15,23,42,0.9)",
                color: "white",
                fontSize: 14,
              }}
            />
          </div>

          {/* Hobby */}
          <div>
            <label style={{ fontSize: 13, opacity: 0.85, display: "block" }}>
              Hobby
            </label>
            <select
              value={hobbyFilter}
              onChange={(e) => setHobbyFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "0.4rem 0.6rem",
                borderRadius: 8,
                border: "1px solid #1f2937",
                background: "rgba(15,23,42,0.9)",
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
          <div>
            <label style={{ fontSize: 13, opacity: 0.85, display: "block" }}>
              From (date)
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                width: "100%",
                padding: "0.4rem 0.6rem",
                borderRadius: 8,
                border: "1px solid #1f2937",
                background: "rgba(15,23,42,0.9)",
                color: "white",
                fontSize: 14,
              }}
            />
          </div>

          {/* To date */}
          <div>
            <label style={{ fontSize: 13, opacity: 0.85, display: "block" }}>
              To (date)
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                width: "100%",
                padding: "0.4rem 0.6rem",
                borderRadius: 8,
                border: "1px solid #1f2937",
                background: "rgba(15,23,42,0.9)",
                color: "white",
                fontSize: 14,
              }}
            />
          </div>

          {/* My hobbies only + buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                opacity: 0.9,
              }}
            >
              <input
                type="checkbox"
                checked={onlyMyHobbies}
                onChange={(e) => setOnlyMyHobbies(e.target.checked)}
              />
              Only my hobbies
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={fetchEvents}
                style={{
                  flex: 1,
                  padding: "0.4rem 0.8rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#2563eb,#38bdf8)",
                  color: "black",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Apply
              </button>

              <button
                type="button"
                onClick={handleClearFilters}
                style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: 999,
                  border: "1px solid #4b5563",
                  background: "transparent",
                  color: "#e5e7eb",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {loading && <p>Loading events...</p>}
        {error && (
          <p style={{ color: "#f97373", marginBottom: 16 }}>{error}</p>
        )}
        {isEmpty && (
          <p>
            No events found with these filters. Try clearing them or changing
            the criteria.
          </p>
        )}

        {/* Kart grid */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: 18,
          }}
        >
          {events.map((e) => renderCard(e))}
        </section>
      </div>
    </main>
  );
}
