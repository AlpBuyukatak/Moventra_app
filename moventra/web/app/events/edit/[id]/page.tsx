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

type FormState = {
  title: string;
  description: string;
  city: string;
  location: string;
  dateTime: string; // input type="datetime-local" formatında
  hobbyId: string;
  capacity: string;
};

function toDateTimeLocal(value: string) {
  // backend'den gelen ISO string'i input için "YYYY-MM-DDTHH:MM" formatına çevir
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();

  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    city: "",
    location: "",
    dateTime: "",
    hobbyId: "",
    capacity: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getToken() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("token");
  }

  // Sayfa açılınca: etkinlik detayını + hobi listesini çek
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

        // event + hobbies paralel çekilsin
        const [eventRes, hobbiesRes] = await Promise.all([
          fetch(`${API_URL}/events/${id}`, { headers }),
          fetch(`${API_URL}/hobbies`),
        ]);

        if (!eventRes.ok) {
          const data = await eventRes.json().catch(() => ({}));
          throw new Error(data.error || "Event not found");
        }

        const eventJson = await eventRes.json();
        const ev: EventDetail = eventJson.event;

        const hobbiesJson = hobbiesRes.ok
          ? await hobbiesRes.json().catch(() => ({}))
          : { hobbies: [] };

        setHobbies(hobbiesJson.hobbies || []);

        setForm({
          title: ev.title || "",
          description: ev.description || "",
          city: ev.city || "",
          location: ev.location || "",
          dateTime: toDateTimeLocal(ev.dateTime),
          hobbyId: String(ev.hobbyId ?? ""),
          capacity:
            ev.capacity === null || ev.capacity === undefined
              ? ""
              : String(ev.capacity),
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

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

      const body = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        city: form.city.trim(),
        location: form.location.trim() || null,
        dateTime: form.dateTime, // backend'te new Date(dateTime) ile parse ediliyor
        hobbyId: form.hobbyId ? Number(form.hobbyId) : null,
        capacity: form.capacity ? Number(form.capacity) : null,
      };

      const res = await fetch(`${API_URL}/events/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      // Başarılı → ister detay sayfasına ister my/created'e dönelim
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
          type="button"
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
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
          Edit Event
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            background:
              "linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,64,175,0.7))",
            padding: 24,
            borderRadius: 16,
            boxShadow: "0 20px 40px rgba(15,23,42,0.9)",
          }}
        >
          {/* Title */}
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #1f2937",
                background: "rgba(15,23,42,0.9)",
                color: "white",
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #1f2937",
                background: "rgba(15,23,42,0.9)",
                color: "white",
              }}
            />
          </div>

          {/* City + Location */}
          <div
            style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
          >
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ display: "block", marginBottom: 4 }}>City</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: 8,
                  border: "1px solid #1f2937",
                  background: "rgba(15,23,42,0.9)",
                  color: "white",
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ display: "block", marginBottom: 4 }}>
                Location
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Tiergarten Park"
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: 8,
                  border: "1px solid #1f2937",
                  background: "rgba(15,23,42,0.9)",
                  color: "white",
                }}
              />
            </div>
          </div>

          {/* DateTime */}
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>
              Date & Time
            </label>
            <input
              type="datetime-local"
              name="dateTime"
              value={form.dateTime}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #1f2937",
                background: "rgba(15,23,42,0.9)",
                color: "white",
              }}
            />
          </div>

          {/* Hobby + Capacity */}
          <div
            style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
          >
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ display: "block", marginBottom: 4 }}>Hobby</label>
              <select
                name="hobbyId"
                value={form.hobbyId}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: 8,
                  border: "1px solid #1f2937",
                  background: "rgba(15,23,42,0.9)",
                  color: "white",
                }}
              >
                <option value="">Select a hobby</option>
                {hobbies.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ width: 140 }}>
              <label style={{ display: "block", marginBottom: 4 }}>
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                min={1}
                value={form.capacity}
                onChange={handleChange}
                placeholder="optional"
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: 8,
                  border: "1px solid #1f2937",
                  background: "rgba(15,23,42,0.9)",
                  color: "white",
                }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div
            style={{
              marginTop: 8,
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.8)",
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
                padding: "0.5rem 1.3rem",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(135deg,#22c55e,#16a34a)",
                color: "black",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
