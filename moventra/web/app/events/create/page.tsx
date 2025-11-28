"use client";

import useRequireAuth from "../../hooks/useRequireAuth";
import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import CityPickerModal, {
  type LocationSelection,
} from "../../components/CityPickerModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Hobby = {
  id: number;
  name: string;
};

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

// ----------------------
// Yardımcılar
// ----------------------
function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return "";
  return `${d}.${m}.${y}`;
}

// Takvim matrisi (Pazartesi başlangıç)
function buildCalendar(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  // JS: 0 = Sun ... 6 = Sat → biz Pazartesi olsun diye kaydırıyoruz
  const jsDay = first.getDay(); // 0–6
  const mondayIndex = (jsDay + 6) % 7; // 0 = Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < mondayIndex; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

// Saat seçenekleri (07:00–22:30, 30 dk aralık)
const TIME_OPTIONS: string[] = (() => {
  const arr: string[] = [];
  for (let h = 7; h <= 22; h++) {
    for (const min of [0, 30]) {
      const hh = String(h).padStart(2, "0");
      const mm = String(min).padStart(2, "0");
      arr.push(`${hh}:${mm}`);
    }
  }
  return arr;
})();

// Basit hobi -> başlık önerileri (4 adet)
const HOBBY_TITLE_SUGGESTIONS: Record<string, string[]> = {
  Cycling: [
    "Weekend city cycling tour",
    "Sunset ride with new friends",
    "Easy Sunday bike loop",
    "Relaxed city ride & coffee",
  ],
  Running: [
    "Easy 5K with new buddies",
    "Sunday morning run & coffee",
    "Beginner-friendly running meetup",
    "Evening run along the river",
  ],
  Gym: [
    "Afterwork gym session",
    "Leg day with accountability buddies",
    "Push & pull group workout",
    "Saturday strength meetup",
  ],
  Workshop: [
    "Hands-on hobby workshop",
    "Beginner-friendly skill sharing",
    "Saturday creative workshop",
    "Weekend beginners workshop",
  ],
  Tasting: [
    "Coffee & dessert tasting night",
    "Local flavors tasting meetup",
    "Casual wine & snacks evening",
    "Barista & coffee tasting meetup",
  ],
};

function buildGenericSuggestions(hobbyName: string): string[] {
  const base = hobbyName.trim();
  if (!base) return [];
  return [
    `${base} meetup for newcomers`,
    `${base} night with new friends`,
    `${base} club – let's meet!`,
    `${base} hangout in your city`,
  ];
}

export default function NewEventPage() {
  const router = useRouter();

  // 🔐 PRIVATE GUARD
  const { checking } = useRequireAuth("/login");

  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loadingHobbies, setLoadingHobbies] = useState(true);

  // Form state
  const [hobbyId, setHobbyId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Ülke/şehir seçimi (CityPickerModal)
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [city, setCity] = useState(""); // backend'e gidecek city
  const [country, setCountry] = useState(""); // backend'e location olarak yazacağız

  // Tarih & saat (custom picker)
  const [eventDate, setEventDate] = useState(""); // YYYY-MM-DD
  const [eventTime, setEventTime] = useState(""); // HH:MM
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState<number>(
    () => new Date().getMonth()
  );
  const [pickerYear, setPickerYear] = useState<number>(
    () => new Date().getFullYear()
  );

  const [capacity, setCapacity] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // date/time alanının tamamı için ref (dışarı tıklayınca kapansın)
  const dateTimeWrapperRef = useRef<HTMLDivElement | null>(null);

  // ===========================
  // Hobileri backend'den çek
  // ===========================
  useEffect(() => {
    if (checking) return;

    const token = getToken();

    if (!token) {
      router.replace("/login");
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

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || "Failed to load hobbies");
        }

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
  }, [router, checking]);

  // ===========================
  // Dışarı tıklayınca date/time picker'ı kapat
  // ===========================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleClick = (e: MouseEvent) => {
      if (
        dateTimeWrapperRef.current &&
        !dateTimeWrapperRef.current.contains(e.target as Node)
      ) {
        setDatePickerOpen(false);
        setTimePickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Seçili hobinin adı
  const selectedHobbyName = useMemo(() => {
    if (!hobbyId) return "";
    const found = hobbies.find((h) => h.id === hobbyId);
    return found?.name || "";
  }, [hobbyId, hobbies]);

  // Hobiye göre başlık önerileri (4 adet)
  const titleSuggestions = useMemo(() => {
    if (!selectedHobbyName) return [];
    const direct = HOBBY_TITLE_SUGGESTIONS[selectedHobbyName];
    if (direct && direct.length > 0) return direct;
    return buildGenericSuggestions(selectedHobbyName);
  }, [selectedHobbyName]);

  // ===========================
  // Takvim hesaplamaları
  // ===========================
  const calendarCells = useMemo(
    () => buildCalendar(pickerYear, pickerMonth),
    [pickerYear, pickerMonth]
  );

  const monthLabel = useMemo(
    () =>
      new Date(pickerYear, pickerMonth, 1).toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [pickerYear, pickerMonth]
  );

  const handleMonthChange = (delta: number) => {
    setPickerMonth((prev) => {
      let m = prev + delta;
      let y = pickerYear;
      if (m < 0) {
        m = 11;
        y = pickerYear - 1;
      } else if (m > 11) {
        m = 0;
        y = pickerYear + 1;
      }
      setPickerYear(y);
      return m;
    });
  };

  // ===========================
  // Submit
  // ===========================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (!hobbyId || !trimmedTitle || !city || !eventDate || !eventTime) {
      setError(
        "Please select a hobby, enter a title, choose location and pick date & time."
      );
      return;
    }

    // çok kısa başlık / açıklama engeli
    if (trimmedTitle.length < 8) {
      setError("Please write a slightly longer title (at least 8 characters).");
      return;
    }

    if (trimmedDesc.length < 20) {
      setError(
        "Please add a short description (at least 20 characters) about level, vibe, language and meeting point."
      );
      return;
    }

    // Geçmiş tarih kontrolü
    const combined = new Date(`${eventDate}T${eventTime}`);
    const now = new Date();
    if (combined.getTime() < now.getTime()) {
      setError("Please choose a date & time in the future.");
      return;
    }

    try {
      setSubmitting(true);

      const dateIso = combined.toISOString();

      const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDesc,
          city, // seçilen şehir
          location: country || null, // ülkeyi location alanına yazıyoruz
          dateTime: dateIso,
          hobbyId: Number(hobbyId),
          capacity: capacity ? Number(capacity) : null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      // Bildirimi nav'da gösterebilmek için localStorage'a yaz
      try {
        if (typeof window !== "undefined" && data.event) {
          window.localStorage.setItem(
            "moventra_last_created_event_v1",
            JSON.stringify(data.event)
          );
        }
      } catch {
        // storage dolu vs. olursa sessiz geç
      }

      // Başarılı → ilgili event sayfasına git
      if (data.event && data.event.id) {
        router.push(`/events/${data.event.id}`);
      } else {
        // fallback: sadece başarı mesajı göster
        setSuccessMessage("Your event has been created successfully.");
      }
    } catch (err: any) {
      console.error("Error creating event:", err);
      setError(err.message || "Error creating event");
    } finally {
      setSubmitting(false);
    }
  }

  // 🔐 Auth check sırasında skeleton
  if (checking) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "40px 16px",
          fontFamily: "system-ui, sans-serif",
          color: "var(--fg)",
        }}
      >
        <p>Checking authentication...</p>
      </main>
    );
  }

  const locationLabel =
    city && country
      ? `${city}, ${country}`
      : city || country || "Select country & city";

  const displayDate = formatDisplayDate(eventDate);
  const displayTime = eventTime || "--:--";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 16px",
        fontFamily: "system-ui, sans-serif",
        color: "var(--fg)",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
              Create Event
            </h1>
            <p style={{ fontSize: 13, opacity: 0.8 }}>
              Pick a hobby, choose a city and time, and let people join.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/events")}
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.7)",
              background: "transparent",
              color: "var(--fg)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            ← Back to events
          </button>
        </header>

        {/* Card */}
        <section
          style={{
            borderRadius: 22,
            border: "1px solid var(--card-border)",
            padding: "1.7rem 1.6rem 1.9rem",
            boxShadow: "0 18px 40px rgba(15,23,42,0.30)",
            background:
              "radial-gradient(circle at top,#f9fafb,rgba(248,250,252,0.96),var(--bg))",
          }}
        >
          {/* Hata / başarı mesajları */}
          {error && (
            <p
              style={{
                color: "#b91c1c",
                marginBottom: 10,
                fontSize: 13,
                background: "rgba(248,113,113,0.08)",
                padding: "0.55rem 0.75rem",
                borderRadius: 10,
                border: "1px solid rgba(248,113,113,0.6)",
              }}
            >
              {error}
            </p>
          )}

          {successMessage && (
            <div
              style={{
                marginBottom: 12,
                padding: "0.6rem 0.8rem",
                borderRadius: 12,
                border: "1px solid rgba(22,163,74,0.6)",
                background:
                  "linear-gradient(135deg,rgba(34,197,94,0.10),rgba(16,185,129,0.06))",
                color: "#065f46",
                fontSize: 13,
              }}
            >
              ✅ {successMessage}
            </div>
          )}

          {loadingHobbies ? (
            <p>Loading hobbies...</p>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: "grid", gap: 14, marginTop: 4 }}
            >
              {/* 1) Hobby (en üstte) */}
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Hobby *</span>
                <select
                  value={hobbyId}
                  onChange={(e) =>
                    setHobbyId(
                      e.target.value ? Number(e.target.value) : ("" as any)
                    )
                  }
                  style={{
                    padding: "0.55rem 0.75rem",
                    borderRadius: 12,
                    border: "1px solid var(--card-border)",
                    color: "var(--fg)",
                    background: "var(--bg)",
                    fontSize: 14,
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

              {/* 2) Title + öneriler */}
              <div
                style={{
                  display: "grid",
                  gap: 8, // Title ile öneriler arasındaki boşluk
                }}
              >
                <label style={{ display: "grid", gap: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Title *</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      selectedHobbyName
                        ? `Give your ${selectedHobbyName.toLowerCase()} meetup a name`
                        : "Give your event a friendly name"
                    }
                    style={{
                      padding: "0.55rem 0.75rem",
                      borderRadius: 12,
                      border: "1px solid var(--card-border)",
                      background: "var(--bg)",
                      color: "var(--fg)",
                      fontSize: 14,
                    }}
                  />
                </label>

                {/* Öneri alanı: minHeight ile sabit → kart yüksekliği zıplamaz */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    fontSize: 11,
                    minHeight: 60,
                    alignItems: titleSuggestions.length
                      ? "flex-start"
                      : "center",
                  }}
                >
                  {selectedHobbyName && titleSuggestions.length > 0 ? (
                    <>
                      {titleSuggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setTitle(s)}
                          style={{
                            padding: "0.22rem 0.7rem",
                            borderRadius: 999,
                            border: "1px solid rgba(148,163,184,0.7)",
                            background: "rgba(248,250,252,0.95)",
                            color: "var(--fg)",
                            cursor: "pointer",
                            boxShadow: "0 4px 10px rgba(15,23,42,0.08)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s}
                        </button>
                      ))}
                      <span
                        style={{
                          fontSize: 11,
                          opacity: 0.7,
                          marginLeft: 2,
                        }}
                      >
                        You can still type your own title.
                      </span>
                    </>
                  ) : (
                    <span
                      style={{
                        fontSize: 11,
                        opacity: 0.65,
                      }}
                    >
                      Select a hobby to see title ideas.
                    </span>
                  )}
                </div>
              </div>

              {/* 3) Description */}
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  Description
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What should people expect? Level, vibe, language, meeting point / exact location, etc."
                  style={{
                    padding: "0.55rem 0.75rem",
                    borderRadius: 12,
                    border: "1px solid var(--card-border)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    resize: "vertical",
                    fontSize: 14,
                  }}
                />
              </label>

              {/* 4) Location (ülke + şehir seçimi) */}
              <div style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  Location *
                </span>
                <div
                  style={{
                    borderRadius: 18,
                    padding: "0.7rem 0.75rem",
                    border: "1px solid var(--card-border)",
                    background:
                      "linear-gradient(135deg,rgba(248,250,252,0.98),rgba(241,245,249,0.96))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        background:
                          "radial-gradient(circle at 30% 20%,#22c55e,#16a34a,#15803d)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 6px 14px rgba(22,163,74,0.60)",
                        color: "#f9fafb",
                        fontSize: 18,
                      }}
                    >
                      📍
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          opacity: 0.7,
                        }}
                      >
                        Country & City
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {locationLabel}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocationModalOpen(true)}
                    style={{
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.7)",
                      background: "white",
                      padding: "0.25rem 0.7rem",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Change
                  </button>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    opacity: 0.7,
                  }}
                >
                  We’ll use the city for discovery and the country as a short
                  location tag.
                </span>
              </div>

              {/* 5) Date & Time (CUSTOM picker) */}
              <div style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  Date & Time *
                </span>
                <div
                  ref={dateTimeWrapperRef}
                  style={{
                    borderRadius: 18,
                    padding: "0.75rem 0.85rem",
                    border: "1px solid var(--card-border)",
                    background:
                      "linear-gradient(135deg,rgba(248,250,252,0.98),rgba(241,245,249,0.96))",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      background:
                        "radial-gradient(circle at 30% 20%,#38bdf8,#6366f1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0f172a",
                      fontSize: 18,
                      boxShadow: "0 6px 14px rgba(37,99,235,0.55)",
                    }}
                  >
                    📅
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      flex: 1,
                    }}
                  >
                    {/* DATE pill + custom calendar */}
                    <div style={{ position: "relative" }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (eventDate) {
                            const [y, m] = eventDate.split("-").map(Number);
                            if (!Number.isNaN(y) && !Number.isNaN(m)) {
                              setPickerYear(y);
                              setPickerMonth(m - 1);
                            }
                          }
                          setDatePickerOpen((v) => !v);
                          setTimePickerOpen(false);
                        }}
                        style={{
                          padding: "0.4rem 0.8rem",
                          borderRadius: 999,
                          border: "1px solid rgba(148,163,184,0.8)",
                          background: "#ffffff",
                          fontSize: 13,
                          minWidth: 150,
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        {displayDate || "tt.mm.jjjj"}
                      </button>

                      {datePickerOpen && (
                        <div
                          style={{
                            position: "absolute",
                            zIndex: 20,
                            top: "110%",
                            left: 0,
                            marginTop: 6,
                            width: 260,
                            borderRadius: 12,
                            border: "1px solid rgba(148,163,184,0.7)",
                            background: "#ffffff",
                            boxShadow:
                              "0 18px 40px rgba(15,23,42,0.35)",
                            padding: "0.6rem 0.6rem 0.7rem",
                            fontSize: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 6,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => handleMonthChange(-1)}
                              style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                fontSize: 14,
                              }}
                            >
                              ‹
                            </button>
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: 12,
                              }}
                            >
                              {monthLabel}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleMonthChange(1)}
                              style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                fontSize: 14,
                              }}
                            >
                              ›
                            </button>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(7,1fr)",
                              gap: 2,
                              marginBottom: 4,
                              textAlign: "center",
                              fontSize: 11,
                              opacity: 0.7,
                            }}
                          >
                            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(
                              (d) => (
                                <span key={d}>{d}</span>
                              )
                            )}
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(7,1fr)",
                              gap: 2,
                            }}
                          >
                            {calendarCells.map((day, idx) =>
                              day === null ? (
                                <span
                                  key={idx}
                                  style={{ fontSize: 11 }}
                                ></span>
                              ) : (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    const m = pickerMonth + 1;
                                    const mm = String(m).padStart(2, "0");
                                    const dd = String(day).padStart(2, "0");
                                    const yyyy = String(pickerYear);
                                    setEventDate(`${yyyy}-${mm}-${dd}`);
                                    setDatePickerOpen(false);
                                  }}
                                  style={{
                                    borderRadius: 999,
                                    border: "none",
                                    padding: "4px 0",
                                    fontSize: 11,
                                    cursor: "pointer",
                                    background:
                                      eventDate &&
                                      (() => {
                                        const [y, m, d] =
                                          eventDate.split("-").map(Number);
                                        return (
                                          y === pickerYear &&
                                          m === pickerMonth + 1 &&
                                          d === day
                                        );
                                      })()
                                        ? "rgba(59,130,246,0.9)"
                                        : "transparent",
                                    color:
                                      eventDate &&
                                      (() => {
                                        const [y, m, d] =
                                          eventDate.split("-").map(Number);
                                        return (
                                          y === pickerYear &&
                                          m === pickerMonth + 1 &&
                                          d === day
                                        );
                                      })()
                                        ? "#f9fafb"
                                        : "#0f172a",
                                  }}
                                >
                                  {day}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* TIME pill + custom list */}
                    <div style={{ position: "relative" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setTimePickerOpen((v) => !v);
                          setDatePickerOpen(false);
                        }}
                        style={{
                          padding: "0.4rem 0.8rem",
                          borderRadius: 999,
                          border: "1px solid rgba(148,163,184,0.8)",
                          background: "#ffffff",
                          fontSize: 13,
                          minWidth: 110,
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        {displayTime}
                      </button>

                      {timePickerOpen && (
                        <div
                          style={{
                            position: "absolute",
                            zIndex: 20,
                            top: "110%",
                            left: 0,
                            marginTop: 6,
                            width: 120,
                            maxHeight: 210,
                            overflowY: "auto",
                            borderRadius: 12,
                            border: "1px solid rgba(148,163,184,0.7)",
                            background: "#ffffff",
                            boxShadow:
                              "0 18px 40px rgba(15,23,42,0.35)",
                            padding: "0.3rem 0.2rem",
                            fontSize: 12,
                          }}
                        >
                          {TIME_OPTIONS.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setEventTime(t);
                                setTimePickerOpen(false);
                              }}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "3px 8px",
                                borderRadius: 8,
                                border: "none",
                                background:
                                  eventTime === t
                                    ? "rgba(59,130,246,0.1)"
                                    : "transparent",
                                cursor: "pointer",
                                fontSize: 12,
                              }}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 6) Capacity */}
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  Capacity
                </span>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  min={1}
                  placeholder="Optional limit (e.g. 8)"
                  style={{
                    padding: "0.55rem 0.75rem",
                    borderRadius: 12,
                    border: "1px solid var(--card-border)",
                    color: "var(--fg)",
                    background: "var(--bg)",
                    fontSize: 14,
                  }}
                />
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: 8,
                  padding: "10px 16px",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#22c55e,#16a34a,#15803d)",
                  color: "white",
                  cursor: "pointer",
                  opacity: submitting ? 0.7 : 1,
                  fontWeight: 600,
                  fontSize: 15,
                  boxShadow: "0 12px 26px rgba(22,163,74,0.55)",
                }}
              >
                {submitting ? "Creating..." : "Create Event"}
              </button>
            </form>
          )}
        </section>
      </div>

      {/* City picker modal */}
      <CityPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSelect={(loc: LocationSelection) => {
          const cityName = loc.stateName;
          const countryName = loc.countryName;

          setCity(cityName);
          setCountry(countryName);
          setLocationModalOpen(false);
        }}
      />
    </main>
  );
}
