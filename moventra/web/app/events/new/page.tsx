"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Hobby = {
  id: number;
  name: string;
};

export default function NewEventPage() {
  const router = useRouter();

  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loadingHobbies, setLoadingHobbies] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [hobbyId, setHobbyId] = useState<number | "">("");
  const [capacity, setCapacity] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hobileri backend'den çek (veya fallback listeye düş)
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("token")
        : null;

    if (!token) {
      if (typeof window !== "undefined") {
        router.push("/login");
      }
      return;
    }

    async function fetchHobbies() {
      try {
        setLoadingHobbies(true);
        const res = await fetch(`${API_URL}/hobbies`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load hobbies");
        }

        const data = await res.json();
        setHobbies(data.hobbies || []);
      } catch (err: any) {
        console.error("Error loading hobbies:", err);

        // Backend çökse bile fallback liste:
        setHobbies([
          { id: 1, name: "Running" },
          { id: 2, name: "Cycling" },
          { id: 3, name: "Gym" },
          { id: 6, name: "Tasting" },
          { id: 7, name: "Workshop" },
        ]);

        setError(null);
      } finally {
        setLoadingHobbies(false);
      }
    }

    fetchHobbies();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("token")
        : null;

    if (!token) {
      if (typeof window !== "undefined") {
        router.push("/login");
      }
      return;
    }

    if (!title || !city || !dateTime || !hobbyId) {
      setError("Please fill in title, city, date/time and hobby.");
      return;
    }

    try {
      setSubmitting(true);

      const dateIso = new Date(dateTime).toISOString();

      const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description: description || null,
          city,
          location: location || null,
          dateTime: dateIso,
          hobbyId: Number(hobbyId),
          capacity: capacity ? Number(capacity) : null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      router.push("/events");
    } catch (err: any) {
      console.error("Error creating event:", err);
      setError(err.message || "Error creating event");
    } finally {
      setSubmitting(false);
    }
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
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>Create New Event</h1>

        {error && (
          <p style={{ color: "#f97373", marginBottom: 12 }}>{error}</p>
        )}

        {loadingHobbies ? (
          <p>Loading hobbies...</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: 12, marginTop: 8 }}
          >
            <label style={{ display: "grid", gap: 4 }}>
              <span>Title *</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid #4b5563",
                  background: "#020617",
                  color: "white",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 4 }}>
              <span>Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid #4b5563",
                  background: "#020617",
                  color: "white",
                  resize: "vertical",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 4 }}>
              <span>City *</span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid #4b5563",
                  background: "#020617",
                  color: "white",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 4 }}>
              <span>Location</span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid #4b5563",
                  background: "#020617",
                  color: "white",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 4 }}>
              <span>Date & Time *</span>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid #4b5563",
                  background: "#020617",
                  color: "white",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 4 }}>
              <span>Hobby *</span>
              <select
                value={hobbyId}
                onChange={(e) =>
                  setHobbyId(
                    e.target.value ? Number(e.target.value) : ("" as any)
                  )
                }
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid #4b5563",
                  background: "#020617",
                  color: "white",
                }}
              >
                <option value="">Select hobby</option>
                {hobbies.map((hobby) => (
                  <option key={hobby.id} value={hobby.id}>
                    {hobby.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 4 }}>
              <span>Capacity</span>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                min={1}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid #4b5563",
                  background: "#020617",
                  color: "white",
                }}
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 8,
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
              }}
            >
              {submitting ? "Creating..." : "Create Event"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
