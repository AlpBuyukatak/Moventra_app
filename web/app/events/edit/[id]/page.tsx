"use client";

import type React from "react";
import useRequireAuth from "../../../hooks/useRequireAuth";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CityPickerModal, {
  type LocationSelection,
} from "../../../components/CityPickerModal";

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
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [hobbyId, setHobbyId] = useState<string>("");
  const [capacity, setCapacity] = useState<string>("");

  // location picker
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSelection | null>(null);

  // ------------------------------------------------
  // DATA LOAD – etkinlik + hobiler
  // ------------------------------------------------
  useEffect(() => {
    if (checking) return;
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
        setCity(event.city); // bizde city = stateName gibi davranıyor
        setLocation(event.location || ""); // bizde country
        setHobbyId(String(event.hobbyId));
        setCapacity(
          event.capacity == null ? "" : String(event.capacity)
        );

        // Tarih & saat inputları
        const d = new Date(event.dateTime);
        const pad = (n: number) => String(n).padStart(2, "0");
        const dateStr = d.toISOString().slice(0, 10); // yyyy-MM-dd
        const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setDateInput(dateStr);
        setTimeInput(timeStr);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, router, checking]);

  // ------------------------------------------------
  // TITLE SUGGESTIONS – create event ile aynı mantık
  // ------------------------------------------------
  const selectedHobbyName = useMemo(() => {
    const h = hobbies.find((x) => String(x.id) === hobbyId);
    return h?.name ?? "";
  }, [hobbies, hobbyId]);

  const titleSuggestions = useMemo(() => {
    if (!selectedHobbyName) return [];

    const key = selectedHobbyName.toLowerCase();

    if (key.includes("baking") || key.includes("cook")) {
      return [
        "Baking meetup for newcomers",
        "Casual baking night",
        "Sunday baking & coffee",
      ];
    }

    if (key.includes("chess") || key.includes("board")) {
      return [
        "Casual board games night",
        "Beginner friendly chess meetup",
        "Strategy games & snacks",
      ];
    }

    if (key.includes("run") || key.includes("fitness")) {
      return [
        "Morning run for all levels",
        "Easy evening fitness meetup",
        "Weekend city park run",
      ];
    }

    // genel fallback
    return [
      `Casual ${selectedHobbyName} meetup`,
      `${selectedHobbyName} for newcomers`,
      `${selectedHobbyName} evening hangout`,
    ];
  }, [selectedHobbyName]);

  // ------------------------------------------------
  // HELPERS
  // ------------------------------------------------
  function buildDateFromInputs(dateStr: string, timeStr: string) {
    if (!dateStr) return null;
    const t = timeStr && timeStr.trim().length > 0 ? timeStr : "00:00";
    const raw = `${dateStr}T${t}`;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }

  function handleLocationSelect(sel: LocationSelection) {
    setSelectedLocation(sel);
    // CityPickerModal -> state = şehir, country = ülke
    setCity(sel.stateName);
    setLocation(sel.countryName);
    setLocationModalOpen(false);
  }

  // ------------------------------------------------
  // SUBMIT
  // ------------------------------------------------
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

      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        setError("Title is required.");
        return;
      }
      if (trimmedTitle.includes("\n")) {
        setError("Title must be a single line (no line breaks).");
        return;
      }

      const dt = buildDateFromInputs(dateInput, timeInput);
      if (!dt) {
        setError("Please provide a valid date and time.");
        return;
      }

      // geçmiş tarih bloğu (küçük tolerans)
      const now = Date.now();
      if (dt.getTime() < now - 60_000) {
        setError("Event date must be in the future.");
        return;
      }

      // Lokasyon: varsa modal’dan (stateName/countryName), yoksa eski değer
      const cityToSend =
        selectedLocation?.stateName || city;
      const locationToSend =
        selectedLocation?.countryName || location || null;

      if (!cityToSend) {
        setError("Please select a city.");
        return;
      }

      const capacityNumber =
        capacity.trim() === "" ? null : Number(capacity);
      if (capacityNumber != null && capacityNumber < 0) {
        setError("Capacity cannot be negative.");
        return;
      }

      const res = await fetch(`${API_URL}/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: trimmedTitle,
          description: description || null,
          city: cityToSend,
          location: locationToSend,
          dateTime: dt.toISOString(),
          hobbyId: Number(hobbyId),
          capacity: capacityNumber,
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

  // ------------------------------------------------
  // SIMPLE STATES
  // ------------------------------------------------
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

  if (error && !title) {
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

  // ------------------------------------------------
  // NORMAL RENDER – create-event formuna benzer tasarım
  // ------------------------------------------------
  const cityLabel = selectedLocation?.stateName || city;
  const countryLabel = selectedLocation?.countryName || location;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f3e9", // krem zemin
        color: "#0f172a",
        padding: "40px 16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
        }}
      >
        {/* Üst açıklama alanı */}
        <div
          style={{
            marginBottom: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 750,
                marginBottom: 4,
                letterSpacing: "-0.02em",
              }}
            >
              Edit Event
            </h1>
            <p
              style={{
                fontSize: 14,
                opacity: 0.8,
              }}
            >
              Update your event details. Changes will be reflected for
              all participants.
            </p>
          </div>

          <div
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              background:
                "linear-gradient(135deg,rgba(219,234,254,0.95),rgba(191,219,254,0.98))",
              border: "1px solid rgba(59,130,246,0.4)",
              boxShadow: "0 10px 20px rgba(37,99,235,0.25)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.09em",
              color: "#1d4ed8",
              whiteSpace: "nowrap",
            }}
          >
            Editing: {title || "Untitled event"}
          </div>
        </div>

        {/* Ana kart */}
        <section
          style={{
            borderRadius: 32,
            border: "1px solid rgba(250,250,249,0.9)",
            background:
              "radial-gradient(circle at 0 0,#ffffff,#fdf7ec)",
            boxShadow: "0 26px 80px rgba(15,23,42,0.18)",
            padding: "1.8rem 1.7rem 1.5rem",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {/* Hobby */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Hobby <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                value={hobbyId}
                onChange={(e) => setHobbyId(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.7rem 0.9rem",
                  borderRadius: 18,
                  border: "1px solid rgba(209,213,219,0.9)",
                  background:
                    "linear-gradient(135deg,#fffdf8,#f8f3e5)",
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
              <p
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  opacity: 0.7,
                }}
              >
                Select a hobby to see title ideas.
              </p>
            </div>

            {/* Title */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Title <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.7rem 0.9rem",
                  borderRadius: 18,
                  border: "1px solid rgba(209,213,219,0.9)",
                  background:
                    "linear-gradient(135deg,#fffdf8,#f8f3e5)",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <p
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  opacity: 0.7,
                }}
              >
                One short line is best. Avoid line breaks in the title.
              </p>

              {/* Öneri butonları */}
              {selectedHobbyName && titleSuggestions.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {titleSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTitle(s)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        border:
                          "1px solid rgba(234,179,8,0.55)",
                        background:
                          "linear-gradient(135deg,rgba(254,243,199,0.96),rgba(254,249,195,0.98))",
                        fontSize: 11,
                        cursor: "pointer",
                        color: "#92400e",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 13,
                  fontWeight: 600,
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
                  padding: "0.7rem 0.9rem",
                  borderRadius: 20,
                  border: "1px solid rgba(209,213,219,0.9)",
                  background:
                    "linear-gradient(135deg,#fffdf8,#f8f3e5)",
                  fontSize: 14,
                  resize: "vertical",
                  minHeight: 90,
                  outline: "none",
                }}
                placeholder="What should people expect? Level, vibe, language, meeting point / exact location, etc."
              />
            </div>

            {/* Location – CityPickerModal ile */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Location <span style={{ color: "#dc2626" }}>*</span>
              </label>

              <div
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => setLocationModalOpen(true)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 0.9rem",
                    borderRadius: 24,
                    border:
                      "1px solid rgba(209,213,219,0.9)",
                    background:
                      "radial-gradient(circle at 0 0,#ffffff,#f8fafc)",
                    boxShadow:
                      "0 10px 26px rgba(15,23,42,0.06)",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        background:
                          "radial-gradient(circle at 30% 0,#22c55e,#16a34a)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 18,
                      }}
                    >
                      📍
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          opacity: 0.7,
                        }}
                      >
                        Country &amp; City
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        {cityLabel
                          ? countryLabel
                            ? `${cityLabel}, ${countryLabel}`
                            : cityLabel
                          : "Select country & city"}
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLocationModalOpen(true)}
                  style={{
                    padding: "0.6rem 1rem",
                    borderRadius: 999,
                    border:
                      "1px solid rgba(148,163,184,0.7)",
                    background: "white",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Change
                </button>
              </div>

              <p
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  opacity: 0.7,
                }}
              >
                We&apos;ll use the city for discovery and the country
                as a short location tag.
              </p>

              <CityPickerModal
                isOpen={locationModalOpen}
                onClose={() => setLocationModalOpen(false)}
                onSelect={handleLocationSelect}
              />
            </div>

            {/* Date & Time + Capacity */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Date &amp; Time{" "}
                <span style={{ color: "#dc2626" }}>*</span>
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 0.9fr)",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                {/* Date */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      background:
                        "radial-gradient(circle at 30% 0,#3b82f6,#2563eb)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: 18,
                    }}
                  >
                    📅
                  </div>
                  <input
                    type="date"
                    value={dateInput}
                    onChange={(e) =>
                      setDateInput(e.target.value)
                    }
                    required
                    style={{
                      flex: 1,
                      padding: "0.7rem 0.9rem",
                      borderRadius: 18,
                      border:
                        "1px solid rgba(209,213,219,0.9)",
                      background:
                        "linear-gradient(135deg,#fffdf8,#f8f3e5)",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>

                {/* Time */}
                <input
                  type="time"
                  value={timeInput}
                  onChange={(e) =>
                    setTimeInput(e.target.value)
                  }
                  required
                  style={{
                    padding: "0.7rem 0.9rem",
                    borderRadius: 18,
                    border:
                      "1px solid rgba(209,213,219,0.9)",
                    background:
                      "linear-gradient(135deg,#fffdf8,#f8f3e5)",
                    fontSize: 14,
                    outline: "none",
                  }}
                />

                {/* Capacity */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontSize: 11,
                      opacity: 0.7,
                    }}
                  >
                    Capacity
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={capacity}
                    onChange={(e) =>
                      setCapacity(e.target.value)
                    }
                    placeholder="Optional limit (e.g. 8)"
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.8rem",
                      borderRadius: 18,
                      border:
                        "1px solid rgba(209,213,219,0.9)",
                      background:
                        "linear-gradient(135deg,#fffdf8,#f8f3e5)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <p
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  opacity: 0.7,
                }}
              >
                You can&apos;t save events in the past. Capacity is
                optional.
              </p>
            </div>

            {/* Error */}
            {error && (
              <p
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: "#b91c1c",
                }}
              >
                {error}
              </p>
            )}

            {/* Buttons */}
            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: "0.7rem 1.4rem",
                  borderRadius: 999,
                  border:
                    "1px solid rgba(148,163,184,0.75)",
                  background: "white",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "0.8rem 2.4rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#22c55e,#16a34a,#16a34a)",
                  color: "#f9fafb",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: saving ? "wait" : "pointer",
                  boxShadow:
                    "0 18px 40px rgba(22,163,74,0.55)",
                  opacity: saving ? 0.85 : 1,
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
