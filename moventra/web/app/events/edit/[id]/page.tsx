"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Hobby = {
  id: number;
  name: string;
};

type EventDetail = {
  id: number;
  title: string;
  description?: string | null;
  city: string;
  location?: string | null;
  dateTime: string;
  hobbyId: number;
  capacity?: number | null;
};

function formatForInput(dateStr: string) {
  // "2025-02-20T11:00" formatına çevir
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const minute = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hobbies, setHobbies] = useState<Hobby[]>([]);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [hobbyId, setHobbyId] = useState<string>("");
  const [capacity, setCapacity] = useState<string>("");

  function getToken() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("token");
  }

  // Etkinlik + hobiler
  useEffect(() => {
    if (!id) return;

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const headers = { Authorization: `Bearer ${token}` };

        const [eventRes, hobbiesRes] = await Promise.all([
          fetch(`${API_URL}/events/${id}`, { headers }),
          fetch(`${API_URL}/hobbies`, {}),
        ]);

        if (!eventRes.ok) {
          const data = await eventRes.json().catch(() => ({}));
          throw new Error(data.error || "Event not found");
        }

        const eventJson = await eventRes.json();
        const event: EventDetail = eventJson.event;

        const hobbiesJson = await hobbiesRes.json();
        setHobbies(hobbiesJson.hobbies || []);

        // Formu doldur
        setTitle(event.title);
        setDescription(event.description || "");
        setCity(event.city);
        setLocation(event.location || "");
        setDateTime(formatForInput(event.dateTime));
        setHobbyId(String(event.hobbyId));
        setCapacity(
          event.capacity === null || event.capacity === undefined
            ? ""
            : String(event.capacity)
        );
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`${API_URL}/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description: description || null,
          city,
          location: location || null,
          dateTime,
          hobbyId: Number(hobbyId),
          capacity: capacity === "" ? null : Number(capacity),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      alert("Event updated successfully!");

      // İstersen detay sayfasına da dönebilirdik; şimdilik My Created'e gidelim
      router.push("/events/my/created");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    router.push("/events/my/created");
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "white",
          padding: 40,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p>Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "white",
          padding: 40,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p style={{ color: "#f97373" }}>{error}</p>
        <button
          onClick={handleCancel}
          style={{
            marginTop: 16,
            padding: "0.5rem 1rem",
            borderRadius: 999,
            border: "1px solid rgba(148,163,184,0.7)",
            background: "transparent",
            color: "white",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        padding: "40px 16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
          Edit Event
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #4b5563",
                background: "#020617",
                color: "white",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4 }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #4b5563",
                background: "#020617",
                color: "white",
                resize: "vertical",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4 }}>City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #4b5563",
                background: "#020617",
                color: "white",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4 }}>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #4b5563",
                background: "#020617",
                color: "white",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4 }}>
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #4b5563",
                background: "#020617",
                color: "white",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4 }}>Hobby</label>
            <select
              value={hobbyId}
              onChange={(e) => setHobbyId(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #4b5563",
                background: "#020617",
                color: "white",
              }}
            >
              <option value="">Select hobby</option>
              {hobbies.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4 }}>
              Capacity (optional)
            </label>
            <input
              type="number"
              min={0}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #4b5563",
                background: "#020617",
                color: "white",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "#f97373", marginTop: 4 }}>{error}</p>
          )}

          <div
            style={{
              marginTop: 8,
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.7)",
                background: "transparent",
                color: "white",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "0.5rem 1.2rem",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(135deg,rgba(16,185,129,1),rgba(59,130,246,1))",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
