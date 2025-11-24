"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CityPickerModal, {
  LocationSelection,
} from "../components/CityPickerModal";
import { useLanguage } from "../context/LanguageContext";

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

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

const translations = {
  en: {
    heroKicker: "With Moventra",
    heroTitleLine1: "Discover events",
    heroTitleLine2: "anywhere in the world.",
    heroText:
      "Find sport, board game, workshop and social events in the city you live in or the city you visit, and meet like-minded people.",
    heroLocationPlaceholder: "Select location (country / city)",
    heroButton: "Show events",
    popularHeading: "Popular event types",
    popularText: "Sport, games, workshops and social meetups.",
    listHeading: "Upcoming Events",
    listSub: (count: number, city?: string, hobbyName?: string) => {
      let base = `${count} event${count === 1 ? "" : "s"}`;
      const tags: string[] = [];
      if (city) tags.push(city);
      if (hobbyName) tags.push(hobbyName);
      if (tags.length > 0) {
        base += " • " + tags.join(" • ");
      }
      return base + " found.";
    },
    searchPlaceholder: "Search by title, city or hobby...",
    loading: "Loading events...",
    noEvents: "No events found. Try changing the city or search text.",
  },
  de: {
    heroKicker: "Mit Moventra",
    heroTitleLine1: "Entdecke Events",
    heroTitleLine2: "auf der ganzen Welt.",
    heroText:
      "Finde Sport-, Brettspiel-, Workshop- und Social-Events in der Stadt, in der du lebst oder die du besuchst, und triff Gleichgesinnte.",
    heroLocationPlaceholder: "Standort wählen (Land / Stadt)",
    heroButton: "Events anzeigen",
    popularHeading: "Beliebte Event-Typen",
    popularText: "Sport, Spiele, Workshops und Social-Events.",
    listHeading: "Bevorstehende Events",
    listSub: (count: number, city?: string, hobbyName?: string) => {
      let base = `${count} Event${count === 1 ? "" : "s"}`;
      const tags: string[] = [];
      if (city) tags.push(city);
      if (hobbyName) tags.push(hobbyName);
      if (tags.length > 0) {
        base += " • " + tags.join(" • ");
      }
      return base + " gefunden.";
    },
    searchPlaceholder: "Nach Titel, Stadt oder Hobby suchen...",
    loading: "Events werden geladen...",
    noEvents:
      "Keine Events gefunden. Versuche, Stadt oder Suchtext zu ändern.",
  },
  tr: {
    heroKicker: "Moventra ile",
    heroTitleLine1: "Etkinliklerini",
    heroTitleLine2: "dünyanın her yerinde keşfet.",
    heroText:
      "Yaşadığın şehirde veya ziyaret ettiğin şehirde spor, oyun, workshop ve sosyalleşme odaklı etkinlikleri bul, yeni insanlarla tanış.",
    heroLocationPlaceholder: "Konum seç (ülke / şehir)",
    heroButton: "Etkinlikleri göster",
    popularHeading: "Popüler etkinlik tipleri",
    popularText: "Spor, oyun, workshop ve sosyalleşme odaklı etkinlikler.",
    listHeading: "Yaklaşan Etkinlikler",
    listSub: (count: number, city?: string, hobbyName?: string) => {
      const parts: string[] = [];
      parts.push(`${count} etkinlik`);
      if (city) parts.push(city);
      if (hobbyName) parts.push(hobbyName);
      return parts.join(" • ") + " bulundu.";
    },
    searchPlaceholder: "Başlık, şehir veya hobi ile ara...",
    loading: "Etkinlikler yükleniyor...",
    noEvents:
      "Etkinlik bulunamadı. Şehri veya arama metnini değiştirerek tekrar dene.",
  },
};

const quickHobbySearches = [
  "Board Games",
  "Cycling",
  "Gym",
  "Language Exchange",
  "Coffee",
  "Workshop",
];

export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const t = translations[language];

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🌍 Konum seçimi (CityPickerModal)
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [locationLabel, setLocationLabel] = useState<string>("");

  // 🎯 Hobi filtresi (All Hobbies'den gelirse)
  const [selectedHobbyId, setSelectedHobbyId] = useState<string | null>(null);
  const [selectedHobbyName, setSelectedHobbyName] = useState<string>("");

  // 🔍 Search bar
  const [searchQuery, setSearchQuery] = useState("");

  // İlk açılışta: URL'den hobbyId/hobbyName oku + eventleri yükle
  useEffect(() => {
    const hobbyIdFromUrl = searchParams.get("hobbyId");
    const hobbyNameFromUrl = searchParams.get("hobbyName") || "";

    if (hobbyIdFromUrl) {
      setSelectedHobbyId(hobbyIdFromUrl);
    }
    if (hobbyNameFromUrl) {
      setSelectedHobbyName(hobbyNameFromUrl);
    }

    fetchEvents(undefined, hobbyIdFromUrl || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Dil veya seçili şehir değişince konum label'ı güncelle
  useEffect(() => {
    if (!selectedCity && !selectedCountry) {
      setLocationLabel(t.heroLocationPlaceholder);
    } else {
      setLocationLabel(
        selectedCity && selectedCountry
          ? `${selectedCity}, ${selectedCountry}`
          : selectedCity || selectedCountry
      );
    }
  }, [
    language,
    selectedCity,
    selectedCountry,
    t.heroLocationPlaceholder,
  ]);

  // API'den eventleri çek (city + hobby filtresi opsiyonel)
  async function fetchEvents(cityName?: string, hobbyId?: string) {
    const authToken = getToken(); // varsa gönder, yoksa public

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (cityName && cityName.trim()) {
        params.append("city", cityName.trim());
      }

      if (hobbyId) {
        params.append("hobbyId", hobbyId);
      }

      const query = params.toString();
      const url =
        query.length > 0
          ? `${API_URL}/events?${query}`
          : `${API_URL}/events`;

      const headers: HeadersInit = {};
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const res = await fetch(url, {
        headers,
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

  async function handleShowEventsClick() {
    await fetchEvents(
      selectedCity || undefined,
      selectedHobbyId || undefined
    );
  }

  async function handleJoin(eventId: number) {
    const authToken = getToken();

    // login yoksa login sayfasına
    if (!authToken) {
      router.push("/login?from=/events");
      return;
    }

    try {
      setJoiningId(eventId);

      const res = await fetch(`${API_URL}/events/${eventId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Join failed");
        return;
      }

      await fetchEvents(
        selectedCity || undefined,
        selectedHobbyId || undefined
      );
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

  // 🔎 Search (title, city, description, hobby)
  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return events;

    return events.filter((e) => {
      const title = e.title?.toLowerCase() || "";
      const city = e.city?.toLowerCase() || "";
      const desc = (e.description || "").toLowerCase();
      const hobbyName = e.hobby?.name?.toLowerCase() || "";

      return (
        title.includes(q) ||
        city.includes(q) ||
        desc.includes(q) ||
        hobbyName.includes(q)
      );
    });
  }, [events, searchQuery]);

  const isEmpty = !loading && filteredEvents.length === 0 && !error;

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
          border: "1px solid var(--card-border)",
          background: "var(--card-bg)",
          padding: "1.4rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.7rem",
          boxShadow: "0 12px 30px rgba(15,23,42,0.35)",
          cursor: "pointer",
          color: "var(--fg)",
        }}
      >
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
                opacity: 0.75,
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
                color: "#e5e7eb",
              }}
            >
              {event.hobby.name}
            </span>
          )}
        </div>

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
              color: isFull ? "#e5e7eb" : "#020617",
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
        background: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* HERO BÖLÜMÜ */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,2.1fr) minmax(0,1.4fr)",
            gap: 32,
            marginBottom: 32,
            alignItems: "stretch",
          }}
        >
          {/* Sol: büyük başlık + konum seçimi */}
          <div>
            <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>
              {t.heroKicker}
            </p>
            <h1
              style={{
                fontSize: 40,
                lineHeight: 1.1,
                fontWeight: 800,
                marginBottom: 12,
              }}
            >
              {t.heroTitleLine1}
              <br />
              {t.heroTitleLine2}
            </h1>
            <p
              style={{
                fontSize: 15,
                opacity: 0.85,
                marginBottom: 20,
                maxWidth: 520,
              }}
            >
              {t.heroText}
            </p>

            {/* Konum seç + CTA */}
            <div
              style={{
                padding: "1rem",
                borderRadius: 16,
                border: "1px solid var(--card-border)",
                background:
                  "linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,64,175,0.7))",
                boxShadow: "0 20px 40px rgba(15,23,42,0.8)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                color: "#f9fafb",
              }}
            >
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "0.75rem 1rem",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.7)",
                  backgroundColor: "rgba(15,23,42,0.9)",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  cursor: "pointer",
                  color: "#e5e7eb",
                }}
              >
                <span>
                  {locationLabel || t.heroLocationPlaceholder}
                </span>
                <span style={{ opacity: 0.8 }}>▼</span>
              </button>

              <button
                type="button"
                onClick={handleShowEventsClick}
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "0.8rem 1rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#22c55e,#38bdf8,#2563eb)",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "#020617",
                }}
              >
                {t.heroButton}
              </button>
            </div>
          </div>

          {/* Sağ: örnek/popüler etkinlik tipleri */}
          <aside
            style={{
              borderRadius: 24,
              border: "1px solid var(--card-border)",
              background:
                "radial-gradient(circle at top,#1d4ed8,var(--bg) 60%)",
              padding: "1.2rem 1.4rem",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              color: "#f9fafb",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {t.popularHeading}
            </h2>
            <p
              style={{
                fontSize: 13,
                opacity: 0.85,
                marginBottom: 8,
              }}
            >
              {t.popularText}
            </p>

            {[
              {
                title: "Board Game Night",
                city: "Berlin",
                badge: "Soon",
              },
              {
                title: "Cycling Meetup",
                city: "Istanbul",
                badge: "Soon",
              },
              {
                title: "Coffee & Language Exchange",
                city: "London",
                badge: "Soon",
              },
              {
                title: "Afterwork Gym Session",
                city: "Munich",
                badge: "Soon",
              },
              {
                title: "Photography Walk",
                city: "Amsterdam",
                badge: "Soon",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  borderRadius: 14,
                  padding: "0.7rem 0.9rem",
                  marginTop: 4,
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(55,65,81,0.8)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 14,
                  color: "#e5e7eb",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{item.title}</div>
                  <div style={{ opacity: 0.75, fontSize: 13 }}>
                    {item.city}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    padding: "0.2rem 0.6rem",
                    borderRadius: 999,
                    border: "1px solid rgba(74,222,128,0.8)",
                    backgroundColor: "rgba(22,163,74,0.15)",
                    color: "#bbf7d0",
                  }}
                >
                  {item.badge}
                </span>
              </div>
            ))}
          </aside>
        </section>

        {/* Search bar + liste başlığı */}
        <section
          style={{
            marginBottom: 16,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {t.listHeading}
            </h2>
            <p style={{ fontSize: 13, opacity: 0.8 }}>
              {t.listSub(
                filteredEvents.length,
                selectedCity || undefined,
                selectedHobbyName || undefined
              )}
            </p>
          </div>

          <div
            style={{
              maxWidth: 360,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem",
                borderRadius: 999,
                border: "1px solid var(--card-border)",
                backgroundColor: "var(--card-bg)",
                color: "var(--fg)",
                fontSize: 14,
              }}
            />
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                fontSize: 11,
              }}
            >
              {quickHobbySearches.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchQuery(tag)}
                  style={{
                    padding: "0.18rem 0.65rem",
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.7)",
                    background: "transparent",
                    color: "var(--fg)",
                    cursor: "pointer",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading && <p>{t.loading}</p>}
        {error && (
          <p style={{ color: "#f97373", marginBottom: 16 }}>{error}</p>
        )}
        {isEmpty && <p>{t.noEvents}</p>}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: 18,
          }}
        >
          {filteredEvents.map((e) => renderCard(e))}
        </section>
      </div>

      {/* City picker modal */}
      <CityPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSelect={(loc: LocationSelection) => {
          const cityName = loc.stateName;
          const countryName = loc.countryName;

          setSelectedCity(cityName);
          setSelectedCountry(countryName);
          setLocationLabel(
            cityName && countryName
              ? `${cityName}, ${countryName}`
              : cityName || countryName || t.heroLocationPlaceholder
          );

          setLocationModalOpen(false);
        }}
      />
    </main>
  );
}
