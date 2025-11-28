"use client";

import type React from "react";
import useRequireAuth from "../../../hooks/useRequireAuth";
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
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const minute = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();

  // 🔐 PRIVATE GUARD
  const { checking } = useRequireAuth("/login");

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

  // Etkinlik + hobiler
  useEffect(() => {
    if (checking) return; // auth kontrolü bitmeden fetch yok
    if (!id) return;

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

        const [eventRes, hobbiesRes] = await Promise.all([
          fetch(`${API_URL}/events/${id}`, { headers }),
          fetch(`${API_URL}/hobbies`, { headers }),
        ]);

        if (!eventRes.ok) {
          const data = await eventRes.json().catch(() => ({}));
          throw new Error(data.error || "Event not found");
        }

        const eventJson = await eventRes.json();
        const event: EventDetail = eventJson.event;

        const hobbiesJson = await hobbiesRes.json().catch(() => ({}));
        setHobbies(hobbiesJson.hobbies || []);

        // Formu doldur
        setTitle(event.title);
        setDescription(event.description || "");
        setCity(event.city);
        setLocation(event.location || "");
        setDateTime(formatForInput(event.dateTime));
        setHobbyId(String(event.hobbyId));
        setCapacity(
          event.capacity == null ? "" : String(event.capacity)
        );
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, router, checking]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // datetime-local -> ISO
      const dateIso = new Date(dateTime).toISOString();

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
          dateTime: dateIso,
          hobbyId: Number(hobbyId),
          capacity: capacity === "" ? null : Number(capacity),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      alert("Event updated successfully!");
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

  // 🔐 Auth check sırasında
  if (checking) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          color: "var(--fg)",
          padding: 40,
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
          background: "var(--bg)",
          color: "var(--fg)",
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
          background: "var(--bg)",
          color: "var(--fg)",
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
            color: "var(--fg)",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </main>
    );
  }

  // --- NORMAL RENDER (detail tasarımına uyumlu) ---
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--fg)",
        padding: "40px 16px",
        fontFamily: "system-ui, sans-serif",
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
        {/* HEADER CARD – detail sayfasıyla aynı aile */}
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
                Edit Event
              </h1>
              <p
                style={{
                  fontSize: 14,
                  opacity: 0.8,
                  maxWidth: 520,
                }}
              >
                Update your event details. Changes will be reflected for all
                participants.
              </p>
            </div>

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
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(59,130,246,0.4)",
                  background:
                    "radial-gradient(circle at 10% 0,rgba(59,130,246,0.12),rgba(191,219,254,0.08))",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#1d4ed8",
                  boxShadow: "0 8px 18px rgba(37,99,235,0.25)",
                  whiteSpace: "nowrap",
                }}
              >
                Editing: {title || "Untitled event"}
              </span>
              {city && (
                <span
                  style={{
                    fontSize: 12,
                    opacity: 0.75,
                  }}
                >
                  📍 {city}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* FORM CARD – yumuşak, detail ile uyumlu */}
        <section
          style={{
            borderRadius: 24,
            border: "1px solid rgba(148,163,184,0.35)",
            background:
              "linear-gradient(135deg,rgba(248,250,252,0.98),rgba(241,245,249,0.98))",
            boxShadow: "0 18px 40px rgba(15,23,42,0.14)",
            padding: "1.7rem 1.6rem 1.5rem",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: 16,
            }}
          >
            {/* Title + City */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.3fr)",
                gap: 14,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    opacity: 0.8,
                  }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.8rem",
                    borderRadius: 12,
                    border: "1px solid rgba(148,163,184,0.7)",
                    background: "rgba(255,255,255,0.95)",
                    color: "#0f172a",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    opacity: 0.8,
                  }}
                >
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.8rem",
                    borderRadius: 12,
                    border: "1px solid rgba(148,163,184,0.7)",
                    background: "rgba(255,255,255,0.95)",
                    color: "#0f172a",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontSize: 13,
                  fontWeight: 500,
                  opacity: 0.8,
                }}
              >
                Location (optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.55rem 0.8rem",
                  borderRadius: 12,
                  border: "1px solid rgba(148,163,184,0.7)",
                  background: "rgba(255,255,255,0.95)",
                  color: "#0f172a",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontSize: 13,
                  fontWeight: 500,
                  opacity: 0.8,
                }}
              >
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.8rem",
                  borderRadius: 14,
                  border: "1px solid rgba(148,163,184,0.7)",
                  background: "rgba(255,255,255,0.97)",
                  color: "#0f172a",
                  fontSize: 14,
                  resize: "vertical",
                  minHeight: 80,
                  outline: "none",
                }}
              />
              <p
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  opacity: 0.65,
                }}
              >
                Add details so people know what to expect (what to bring, level,
                meeting point, etc.).
              </p>
            </div>

            {/* Date & Time + Hobby + Capacity */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1.2fr) minmax(0, 0.8fr)",
                gap: 14,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    opacity: 0.8,
                  }}
                >
                  Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.8rem",
                    borderRadius: 12,
                    border: "1px solid rgba(148,163,184,0.7)",
                    background: "rgba(255,255,255,0.95)",
                    color: "#0f172a",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    opacity: 0.8,
                  }}
                >
                  Hobby
                </label>
                <select
                  value={hobbyId}
                  onChange={(e) => setHobbyId(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.8rem",
                    borderRadius: 12,
                    border: "1px solid rgba(148,163,184,0.7)",
                    background: "rgba(255,255,255,0.95)",
                    color: "#0f172a",
                    fontSize: 14,
                    outline: "none",
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
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    opacity: 0.8,
                  }}
                >
                  Capacity
                </label>
                <input
                  type="number"
                  min={0}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="No limit"
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.8rem",
                    borderRadius: 12,
                    border: "1px solid rgba(148,163,184,0.7)",
                    background: "rgba(255,255,255,0.95)",
                    color: "#0f172a",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {error && (
              <p style={{ color: "#f97373", marginTop: 4 }}>{error}</p>
            )}

            {/* BUTTON ROW – detail sayfasındaki buton stilini koru */}
            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: "0.55rem 1.1rem",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.8)",
                  background: "rgba(15,23,42,0.02)",
                  color: "#0f172a",
                  fontSize: 13,
                  cursor: "pointer",
                  transition:
                    "transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease, background 0.16s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-1px)";
                  el.style.boxShadow =
                    "0 10px 20px rgba(148,163,184,0.4)";
                  el.style.background = "rgba(15,23,42,0.04)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                  el.style.background = "rgba(15,23,42,0.02)";
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "0.6rem 1.4rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#22c55e,#16a34a,#15803d)",
                  color: "#f9fafb",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: saving ? "wait" : "pointer",
                  opacity: saving ? 0.85 : 1,
                  boxShadow: "0 14px 30px rgba(22,163,74,0.45)",
                  transition:
                    "transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease",
                }}
                onMouseEnter={(e) => {
                  if (saving) return;
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-2px)";
                  el.style.boxShadow =
                    "0 18px 40px rgba(22,163,74,0.65)";
                  el.style.filter = "brightness(1.04)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow =
                    "0 14px 30px rgba(22,163,74,0.45)";
                  el.style.filter = "brightness(1)";
                }}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
