"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CityPickerModal, {
  type LocationSelection,
} from "../components/CityPickerModal";
import { useLanguage } from "../context/LanguageContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Onboarding interests -> events önceliklendirme için localStorage key
const PREFERRED_INTERESTS_KEY = "moventra_preferred_interests_v1";
// Events sayfası için konum saklama key’i
const EVENTS_LOCATION_STORAGE_KEY = "moventra_events_location_v1";

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

type ExternalEvent = {
  id: string;
  title: string;
  city: string;
  location?: string | null;
  dateTime: string;
  source: string;
  url: string;
};

type CurrentUser = {
  id: number;
  name: string;
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
    heroAllLocations: "Show events from all locations",
    popularHeading: "Popular event types",
    popularText: "Sport, games, workshops and social meetups.",
    listHeading: "Upcoming Events",
    listSub: (count: number, city?: string, hobbyName?: string) => {
      let base =
        count === 0
          ? "No upcoming events"
          : `${count} upcoming event${count === 1 ? "" : "s"}`;
      const tags: string[] = [];
      if (city) tags.push(city);
      if (hobbyName) tags.push(hobbyName);
      if (tags.length > 0) {
        base += " • " + tags.join(" • ");
      }
      return base + ".";
    },
    pastHeading: "Past events",
    pastSub: (count: number) =>
      count === 0
        ? "No past events."
        : `${count} past event${count === 1 ? "" : "s"}.`,
    searchSectionTitle: "Search & quick filters",
    searchSectionHint:
      "Filter events by title, city or hobby – or tap one of the quick tags.",
    searchPlaceholder: "Search by title, city or hobby...",
    loading: "Loading events...",
    noEvents: "No events found. Try changing the city or search text.",
    joinLabel: "Join",
    joiningLabel: "Joining...",
    rejoinLabel: "Leave event",
    fullLabel: "Full",
    soonBadge: "Soon",
    searchLabel: "Search",
    externalHeading: "Events in this city from other platforms",
    externalSub: (city?: string) =>
      city
        ? `Public events in ${city} from platforms like Eventbrite or Meetup.`
        : "Public events from platforms like Eventbrite or Meetup.",
    externalNone: (city?: string) =>
      city
        ? `No external events found for ${city} yet.`
        : "No external events found.",
    externalOpenLabel: "Open event",
  },
  de: {
    heroKicker: "Mit Moventra",
    heroTitleLine1: "Entdecke Events",
    heroTitleLine2: "auf der ganzen Welt.",
    heroText:
      "Finde Sport-, Brettspiel-, Workshop- und Social-Events in der Stadt, in der du lebst oder die du besuchst, und triff Gleichgesinnte.",
    heroLocationPlaceholder: "Standort wählen (Land / Stadt)",
    heroButton: "Events anzeigen",
    heroAllLocations: "Events aus allen Orten anzeigen",
    popularHeading: "Beliebte Event-Typen",
    popularText: "Sport, Spiele, Workshops und Social-Events.",
    listHeading: "Bevorstehende Events",
    listSub: (count: number, city?: string, hobbyName?: string) => {
      let base =
        count === 0
          ? "Keine bevorstehenden Events"
          : `${count} bevorstehendes Event${count === 1 ? "" : "s"}`;
      const tags: string[] = [];
      if (city) tags.push(city);
      if (hobbyName) tags.push(hobbyName);
      if (tags.length > 0) {
        base += " • " + tags.join(" • ");
      }
      return base + ".";
    },
    pastHeading: "Vergangene Events",
    pastSub: (count: number) =>
      count === 0
        ? "Keine vergangenen Events."
        : `${count} vergangenes Event${count === 1 ? "" : "s"}.`,
    searchSectionTitle: "Suche & Quick-Filter",
    searchSectionHint:
      "Filtere Events nach Titel, Stadt oder Hobby – oder nutze die Quick-Tags.",
    searchPlaceholder: "Nach Titel, Stadt oder Hobby suchen...",
    loading: "Events werden geladen...",
    noEvents:
      "Keine Events gefunden. Versuche, Stadt oder Suchtext zu ändern.",
    joinLabel: "Teilnehmen",
    joiningLabel: "Beitreten...",
    rejoinLabel: "Teilnahme beenden",
    fullLabel: "Voll",
    soonBadge: "Bald",
    searchLabel: "Suche",
    externalHeading:
      "Events in dieser Stadt von anderen Plattformen",
    externalSub: (city?: string) =>
      city
        ? `Öffentliche Events in ${city} von Plattformen wie Eventbrite oder Meetup.`
        : "Öffentliche Events von Plattformen wie Eventbrite oder Meetup.",
    externalNone: (city?: string) =>
      city
        ? `Keine externen Events für ${city} gefunden.`
        : "Keine externen Events gefunden.",
    externalOpenLabel: "Event öffnen",
  },
  tr: {
    heroKicker: "Moventra ile",
    heroTitleLine1: "Etkinliklerini",
    heroTitleLine2: "dünyanın her yerinde keşfet.",
    heroText:
      "Yaşadığın şehirde veya ziyaret ettiğin şehirde spor, oyun, atölye ve sosyalleşme odaklı etkinlikleri bul, yeni insanlarla tanış.",
    heroLocationPlaceholder: "Konum seç (ülke / şehir)",
    heroButton: "Etkinlikleri göster",
    heroAllLocations: "Tüm konumlardaki etkinlikleri göster",
    popularHeading: "Popüler etkinlik tipleri",
    popularText: "Spor, oyun, atölye ve sosyalleşme odaklı etkinlikler.",
    listHeading: "Yaklaşan Etkinlikler",
    listSub: (count: number, city?: string, hobbyName?: string) => {
      const pieces: string[] = [];
      if (count === 0) {
        pieces.push("Yaklaşan etkinlik yok");
      } else {
        pieces.push(`${count} yaklaşan etkinlik`);
      }
      if (city) pieces.push(city);
      if (hobbyName) pieces.push(hobbyName);
      return pieces.join(" • ") + ".";
    },
    pastHeading: "Geçmiş etkinlikler",
    pastSub: (count: number) =>
      count === 0
        ? "Geçmiş etkinlik yok."
        : `${count} geçmiş etkinlik.`,
    searchSectionTitle: "Arama & hızlı filtreler",
    searchSectionHint:
      "Başlık, şehir veya hobi yazarak filtrele; istersen aşağıdaki hızlı etiketlere dokun.",
    searchPlaceholder: "Başlık, şehir veya hobi ile ara...",
    loading: "Etkinlikler yükleniyor...",
    noEvents:
      "Etkinlik bulunamadı. Şehri veya arama metnini değiştirerek tekrar dene.",
    joinLabel: "Katıl",
    joiningLabel: "Katılıyor...",
    rejoinLabel: "Katılmaktan vazgeç",
    fullLabel: "Dolu",
    soonBadge: "Yakında",
    searchLabel: "Arama",
    externalHeading: "Bu şehirdeki diğer platform etkinlikleri",
    externalSub: (city?: string) =>
      city
        ? `${city} için Eventbrite, Meetup gibi açık platformlardaki herkese açık etkinlikler.`
        : "Eventbrite, Meetup gibi açık platformlardaki herkese açık etkinlikler.",
    externalNone: (city?: string) =>
      city
        ? `Şimdilik ${city} için dış etkinlik bulunamadı.`
        : "Şimdilik dış etkinlik bulunamadı.",
    externalOpenLabel: "Etkinliği aç",
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

function getModeTagline(
  theme: "light" | "dark",
  language: keyof typeof translations
) {
  if (language === "tr") {
    return theme === "dark"
      ? "Gece modundasın – geç saat etkinlikleri ve iç mekân buluşmaları için birebir."
      : "Gündüz modundasın – kahve buluşmaları ve güneşli yürüyüşler için ideal.";
  }
  if (language === "de") {
    return theme === "dark"
      ? "Du bist im Nachtmodus – perfekt für späte Meetups und Indoor-Events."
      : "Du bist im Tagesmodus – ideal für Kaffee-Treffen und Spaziergänge.";
  }
  return theme === "dark"
    ? "Night mode on – perfect for late meetups and cozy indoor events."
    : "Day mode on – perfect for sunny walks, coffee meetups and weekend trips.";
}

// Onboarding interest -> event eşleştirme için basit keyword map’i
const interestKeywordMap: Record<string, string[]> = {
  "Sports & outdoors": [
    "running",
    "cycling",
    "road cycling",
    "mountain biking",
    "football",
    "basketball",
    "volleyball",
    "hiking",
    "trail",
    "climbing",
    "bouldering",
    "swimming",
    "yoga",
    "pilates",
    "ski",
    "snowboard",
    "walk",
  ],
  "Board games & chess": [
    "board game",
    "board games",
    "chess",
    "go",
    "card game",
    "tabletop",
    "rpg",
    "dungeons & dragons",
    "trivia",
    "quiz",
    "puzzle",
  ],
  "Language exchange": [
    "language exchange",
    "language",
    "conversation practice",
    "coffee & language",
  ],
  "Live music & concerts": [
    "jam session",
    "concert",
    "live music",
    "open mic",
    "karaoke",
    "band practice",
    "dj",
    "music",
  ],
  "Tech & coding": [
    "coding",
    "programming",
    "web development",
    "mobile development",
    "devops",
    "cloud",
    "hackathon",
    "ai",
    "machine learning",
    "data science",
    "cybersecurity",
    "tech",
  ],
  "Art & drawing": [
    "drawing",
    "sketch",
    "illustration",
    "painting",
    "watercolor",
    "acrylic",
    "digital art",
    "graphic design",
    "art",
  ],
  "Photography & film": [
    "photography",
    "photo walk",
    "film",
    "videography",
    "content creation",
    "youtube creators",
  ],
  "Food & cooking": [
    "cooking",
    "baking",
    "dessert",
    "coffee workshop",
    "tea tasting",
    "wine tasting",
    "restaurant",
    "street food",
    "picnic",
    "dinner",
    "food",
  ],
  "Travel & hiking": [
    "travel",
    "city walking tour",
    "hidden spots",
    "weekend trip",
    "backpacking",
    "nature day trip",
    "hiking",
    "trip",
  ],
  "Fitness & gym": [
    "gym",
    "fitness",
    "calisthenics",
    "crossfit",
    "workout",
    "training",
    "morning run",
    "afterwork gym",
  ],
};

export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const t = translations[language];

  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(
    null
  );

  // ⭐ Favoriler
  const [favoriteEventIds, setFavoriteEventIds] = useState<number[]>([]);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState<number | null>(
    null
  );

  // 🌍 Konum seçimi
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [locationLabel, setLocationLabel] = useState<string>("");

  // 🎯 Hobi filtresi
  const [selectedHobbyId, setSelectedHobbyId] = useState<string | null>(
    null
  );
  const [selectedHobbyName, setSelectedHobbyName] = useState<string>("");

  // 🔍 Search bar
  const [searchQuery, setSearchQuery] = useState("");

  // 🔁 Past events için sayfa durumları
  const [pastPage, setPastPage] = useState(0);
  const PAST_PER_PAGE = 3;

  // 🔎 Onboarding’de seçilen interest’ler (localStorage)
  const [preferredInterests, setPreferredInterests] = useState<string[]>(
    []
  );

  // 🌐 Dış kaynak eventleri
  const [externalEvents, setExternalEvents] = useState<ExternalEvent[]>(
    []
  );
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalError, setExternalError] = useState<string | null>(
    null
  );

  // initialisation flag
  const [initialized, setInitialized] = useState(false);

  // Tema değişimini izle
  useEffect(() => {
    if (typeof window === "undefined") return;
    const html = document.documentElement;

    const detectTheme = () => {
      setTheme(html.classList.contains("dark") ? "dark" : "light");
    };

    detectTheme();

    const observer = new MutationObserver(detectTheme);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  // Onboarding interest’leri localStorage’dan yükle
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PREFERRED_INTERESTS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setPreferredInterests(parsed.filter((x) => typeof x === "string"));
      }
    } catch {
      // sessiz geç
    }
  }, []);

  // İlk açılışta konumu localStorage'dan çek
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(EVENTS_LOCATION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          city?: string;
          country?: string;
        };
        const city = parsed.city || "";
        const country = parsed.country || "";

        setSelectedCity(city);
        setSelectedCountry(country);
        if (!city && !country) {
          setLocationLabel("");
        } else if (city && country) {
          setLocationLabel(`${city}, ${country}`);
        } else {
          setLocationLabel(city || country);
        }
      }
    } catch {
      // ignore
    } finally {
      setInitialized(true);
    }
  }, []);

  // 🔐 /auth/me ile current user
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCurrentUser(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.user) {
          if (!cancelled) setCurrentUser(null);
          return;
        }
        if (!cancelled) {
          setCurrentUser({
            id: data.user.id,
            name: data.user.name || "",
          });
        }
      } catch {
        if (!cancelled) setCurrentUser(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ⭐ /events/my/favorites ile favoriler
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setFavoriteEventIds([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/events/my/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.events) {
          if (!cancelled) setFavoriteEventIds([]);
          return;
        }
        const ids = (data.events as { id: number }[]).map((e) => e.id);
        if (!cancelled) setFavoriteEventIds(ids);
      } catch {
        if (!cancelled) setFavoriteEventIds([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // API'den eventleri çek
  async function fetchEvents(cityName?: string, hobbyId?: string) {
    const authToken = getToken();

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
        query.length > 0 ? `${API_URL}/events?${query}` : `${API_URL}/events`;

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

  // Dış kaynak eventleri çek
  async function fetchExternalEvents(
    cityName: string,
    countryName?: string
  ) {
    try {
      setExternalLoading(true);
      setExternalError(null);

      const params = new URLSearchParams();
      params.append("city", cityName);
      if (countryName) params.append("country", countryName);

      const res = await fetch(
        `${API_URL}/events/external?${params.toString()}`
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Could not load external events");
      }

      setExternalEvents(data.events || []);
    } catch (err: any) {
      console.error(err);
      setExternalError(err.message || "Error");
      setExternalEvents([]);
    } finally {
      setExternalLoading(false);
    }
  }

  // URL parametreleri + konum değişince eventleri yükle
  useEffect(() => {
    if (!initialized) return;

    const hobbyIdFromUrl = searchParams.get("hobbyId");
    const hobbyNameFromUrl = searchParams.get("hobbyName") || "";

    if (hobbyIdFromUrl) {
      setSelectedHobbyId(hobbyIdFromUrl);
    } else {
      setSelectedHobbyId(null);
    }

    setSelectedHobbyName(hobbyNameFromUrl);

    fetchEvents(selectedCity || undefined, hobbyIdFromUrl || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, initialized, selectedCity]);

  // Seçili şehir değişince dış eventleri yükle
  useEffect(() => {
    if (!selectedCity) {
      setExternalEvents([]);
      setExternalError(null);
      setExternalLoading(false);
      return;
    }
    fetchExternalEvents(selectedCity, selectedCountry || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity, selectedCountry]);

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
  }, [language, selectedCity, selectedCountry, t.heroLocationPlaceholder]);

  async function handleShowEventsClick() {
    await fetchEvents(selectedCity || undefined, selectedHobbyId || undefined);
  }

  // ✅ Join (çan için custom event)
  async function handleJoin(event: Event) {
    const authToken = getToken();

    if (!authToken) {
      router.push("/login?from=/events");
      return;
    }

    try {
      setJoiningId(event.id);

      const res = await fetch(`${API_URL}/events/${event.id}/join`, {
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

      // 🔔 NavBar'daki çana joined bildirimi
      if (typeof window !== "undefined") {
        try {
          const customEvent = new CustomEvent("moventra:joined-updated", {
            detail: {
              eventId: event.id,
              title: event.title,
              city: event.city,
              dateTime: event.dateTime,
            },
          });
          window.dispatchEvent(customEvent);
        } catch {
          // sessiz geç
        }
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

  // ⭐ Favori toggle (çan için custom event)
  async function handleToggleFavorite(event: Event) {
    const authToken = getToken();

    if (!authToken) {
      router.push("/login?from=/events");
      return;
    }

    const currentlyFavorite = favoriteEventIds.includes(event.id);

    try {
      setFavoriteLoadingId(event.id);

      const path = currentlyFavorite ? "unfavorite" : "favorite";

      const res = await fetch(`${API_URL}/events/${event.id}/${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Favorite action failed");
        return;
      }

      setFavoriteEventIds((prev) =>
        currentlyFavorite
          ? prev.filter((id) => id !== event.id)
          : [...prev, event.id]
      );

      // Sadece yeni favori eklendiğinde çana NEW düşsün
      if (!currentlyFavorite && typeof window !== "undefined") {
        try {
          const customEvent = new CustomEvent("moventra:favorites-updated", {
            detail: {
              eventId: event.id,
              title: event.title,
              city: event.city,
              dateTime: event.dateTime,
            },
          });
          window.dispatchEvent(customEvent);
        } catch {
          // sessiz geç
        }
      }
    } catch (err) {
      console.error(err);
      alert("Favorite action failed");
    } finally {
      setFavoriteLoadingId(null);
    }
  }

  function handleCardClick(eventId: number) {
    router.push(`/events/${eventId}`);
  }

  // 🔍 Search (title, city, description, hobby)
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

  // 🎯 Onboarding interest’lerine göre event puanlama
  function scoreEventByPreference(event: Event): number {
    if (!preferredInterests.length) return 0;

    const hobbyName = (event.hobby?.name || "").toLowerCase();
    const title = (event.title || "").toLowerCase();
    const haystack = `${hobbyName} ${title}`;

    let score = 0;

    for (const interest of preferredInterests) {
      const key = interestKeywordMap[interest] ? interest : null;
      const keywords = key ? interestKeywordMap[interest] : [];

      if (interest && haystack.includes(interest.toLowerCase().split(" ")[0])) {
        score += 1;
      }

      for (const kw of keywords) {
        if (haystack.includes(kw.toLowerCase())) {
          score += 2;
          break;
        }
      }
    }

    return score;
  }

  // 🧠 Önce filtrele, sonra puana göre sıralayıp göster
  const prioritizedEvents = useMemo(() => {
    if (!preferredInterests.length) return filteredEvents;
    const copy = [...filteredEvents];

    copy.sort((a, b) => {
      const scoreB = scoreEventByPreference(b);
      const scoreA = scoreEventByPreference(a);
      if (scoreB !== scoreA) return scoreB - scoreA;
      const da = new Date(a.dateTime).getTime();
      const db = new Date(b.dateTime).getTime();
      return da - db;
    });

    return copy;
  }, [filteredEvents, preferredInterests]);

  // ⏰ Upcoming vs Past ayrımı
  const now = new Date().getTime();

  const upcomingEvents = useMemo(
    () =>
      prioritizedEvents.filter(
        (e) => new Date(e.dateTime).getTime() >= now
      ),
    [prioritizedEvents, now]
  );

  const pastEvents = useMemo(() => {
    const past = prioritizedEvents.filter(
      (e) => new Date(e.dateTime).getTime() < now
    );
    past.sort(
      (a, b) =>
        new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );
    return past;
  }, [prioritizedEvents, now]);

  const totalPastPages = Math.ceil(pastEvents.length / PAST_PER_PAGE);

  useEffect(() => {
    if (pastPage > 0 && pastPage >= totalPastPages) {
      setPastPage(totalPastPages - 1);
    }
  }, [pastPage, totalPastPages]);

  const pagedPastEvents = useMemo(
    () =>
      pastEvents.slice(
        pastPage * PAST_PER_PAGE,
        pastPage * PAST_PER_PAGE + PAST_PER_PAGE
      ),
    [pastEvents, pastPage, PAST_PER_PAGE]
  );

  const isEmpty = !loading && upcomingEvents.length === 0 && !error;

  // ⛔️ Hobi filtresiyle hiç event bulunmazsa filtreyi sıfırla
  useEffect(() => {
    if (
      !loading &&
      selectedHobbyId &&
      upcomingEvents.length === 0 &&
      pastEvents.length === 0
    ) {
      setSelectedHobbyId(null);
      setSelectedHobbyName("");

      const params = new URLSearchParams(searchParams.toString());
      params.delete("hobbyId");
      params.delete("hobbyName");
      const query = params.toString();

      router.replace(query ? `/events?${query}` : "/events");
    }
  }, [
    loading,
    selectedHobbyId,
    upcomingEvents.length,
    pastEvents.length,
    searchParams,
    router,
  ]);

  // 🎴 Etkinlik kartı
  function renderCard(event: Event, currentTheme: "light" | "dark") {
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

    const isJoinedByUser =
      !!currentUser &&
      (event.participants || []).some(
        (p) => p.user.id === currentUser.id
      );

    const isFavorite = favoriteEventIds.includes(event.id);

    const cardBackground =
      currentTheme === "dark"
        ? "radial-gradient(circle at top left, rgba(56,189,248,0.09), #020617)"
        : "radial-gradient(circle at top left, rgba(59,130,246,0.04), #ffffff)";

    const baseShadow =
      currentTheme === "dark"
        ? "0 20px 55px rgba(0,0,0,0.9), 0 0 0 1px rgba(15,23,42,0.95)"
        : "0 18px 40px rgba(15,23,42,0.16), 0 0 0 1px rgba(148,163,184,0.22)";

    const hoverShadow =
      currentTheme === "dark"
        ? "0 26px 70px rgba(0,0,0,0.95), 0 0 0 1px rgba(129,140,248,0.45)"
        : "0 22px 55px rgba(15,23,42,0.22), 0 0 0 1px rgba(96,165,250,0.55)";

    const buttonLabel = isFull
      ? t.fullLabel
      : joiningId === event.id
      ? t.joiningLabel
      : isJoinedByUser
      ? t.rejoinLabel
      : t.joinLabel;

    // ✅ Join yeşil gradient
    const joinBackground = isFull
      ? "rgba(148,163,184,0.28)"
      : "linear-gradient(135deg,#22c55e,#16a34a,#15803d)";

    const joinTextColor = isFull ? "#4b5563" : "#f9fafb";

    return (
      <div
        key={event.id}
        onClick={() => handleCardClick(event.id)}
        style={{
          borderRadius: 20,
          border:
            currentTheme === "dark"
              ? "1px solid rgba(148,163,184,0.5)"
              : "1px solid rgba(148,163,184,0.26)",
          background: cardBackground,
          padding: "1.4rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          boxShadow: baseShadow,
          cursor: "pointer",
          color: currentTheme === "dark" ? "#f9fafb" : "#111827",
          transition:
            "transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(-3px)";
          el.style.boxShadow = hoverShadow;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = baseShadow;
        }}
      >
        {/* ÜST SATIR: başlık + şehir + hobi badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div
            style={{
              minWidth: 0,
            }}
          >
            <h2
              style={{
                fontSize: 17,
                fontWeight: 650,
                marginBottom: 2,
              }}
            >
              {event.title}
            </h2>
            <p
              style={{
                fontSize: 13,
                color:
                  currentTheme === "dark"
                    ? "rgba(203,213,245,0.85)"
                    : "rgba(107,114,128,0.8)",
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
                padding: "4px 10px",
                borderRadius: 999,
                background:
                  currentTheme === "dark"
                    ? "rgba(15,23,42,0.86)"
                    : "rgba(248,250,252,0.96)",
                border:
                  currentTheme === "dark"
                    ? "1px solid rgba(148,163,184,0.7)"
                    : "1px solid rgba(148,163,184,0.55)",
                fontSize: 11,
                fontWeight: 500,
                color: currentTheme === "dark" ? "#e5e7eb" : "#0f172a",
                whiteSpace: "nowrap",
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
            gap: "0.6rem",
            fontSize: 12,
            color:
              currentTheme === "dark"
                ? "rgba(209,213,219,0.9)"
                : "rgba(107,114,128,0.8)",
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
              color: currentTheme === "dark" ? "#e5e7eb" : "#4b5563",
              marginTop: 6,
              marginBottom: 4,
              maxHeight: "3.2em",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {event.description}
          </p>
        )}

        {/* ALT SATIR: sol altta ⭐, sağda join/leave */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* Sol alt köşe: küçük yıldız */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(event);
            }}
            disabled={favoriteLoadingId === event.id}
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              border: isFavorite
                ? "1px solid rgba(250,204,21,0.78)"
                : "1px solid rgba(148,163,184,0.7)",
              background: isFavorite
                ? "rgba(250,204,21,0.10)"
                : currentTheme === "dark"
                ? "rgba(15,23,42,0.92)"
                : "rgba(248,250,252,0.96)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 14,
              color: isFavorite
                ? "#eab308"
                : currentTheme === "dark"
                ? "#cbd5f5"
                : "#6b7280",
              boxShadow: isFavorite
                ? "0 3px 8px rgba(250,204,21,0.22)"
                : "0 2px 6px rgba(15,23,42,0.16)",
              opacity: favoriteLoadingId === event.id ? 0.7 : 1,
            }}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            {isFavorite ? "★" : "☆"}
          </button>

          {/* Sağ: join / leave */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isFull) handleJoin(event);
            }}
            disabled={joiningId === event.id || isFull}
            style={{
              padding: "0.5rem 1.1rem",
              borderRadius: 999,
              border: isFull ? "none" : "1px solid rgba(34,197,94,0.5)",
              background: joinBackground,
              color: joinTextColor,
              fontSize: 13,
              fontWeight: 600,
              cursor: isFull ? "not-allowed" : "pointer",
              opacity: joiningId === event.id ? 0.78 : 1,
              boxShadow: isFull
                ? "none"
                : "0 10px 22px rgba(22,163,74,0.55)",
            }}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    );
  }

  const modeTagline = getModeTagline(theme, language);

  // 🔢 Grid için kolon sayıları (max 4)
  const upcomingColumns = Math.min(
    4,
    Math.max(1, upcomingEvents.length || 1)
  );
  const pastColumns = Math.min(4, Math.max(1, pagedPastEvents.length || 1));
  const externalColumns = Math.min(
    4,
    Math.max(1, externalEvents.length || 1)
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 16px",
        fontFamily: "system-ui, sans-serif",
        color: "var(--fg)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* HERO BÖLÜMÜ */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,2.1fr) minmax(0,1.4fr)",
            gap: 32,
            marginBottom: 28,
            alignItems: "stretch",
          }}
        >
          {/* Sol: başlık + konum seçimi */}
          <div>
            <p
              style={{
                fontSize: 14,
                color:
                  theme === "dark"
                    ? "rgba(148,163,184,0.95)"
                    : "rgba(30,64,175,0.95)",
                marginBottom: 8,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
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
                opacity: 0.9,
                marginBottom: 4,
                maxWidth: 520,
              }}
            >
              {t.heroText}
            </p>
            <p
              style={{
                fontSize: 13,
                opacity: 0.8,
                marginBottom: 16,
                maxWidth: 520,
              }}
            >
              {modeTagline}
            </p>

            {/* Konum seç + CTA */}
            <div
              style={{
                padding: "0.8rem 1rem",
                borderRadius: 24,
                background:
                  theme === "dark"
                    ? "radial-gradient(circle at top,rgba(59,130,246,0.18),rgba(15,23,42,0.96))"
                    : "radial-gradient(circle at top,rgba(59,130,246,0.12),rgba(16,185,129,0.08),var(--bg))",
                border:
                  theme === "dark"
                    ? "1px solid rgba(148,163,184,0.45)"
                    : "1px solid rgba(148,163,184,0.3)",
                boxShadow:
                  theme === "dark"
                    ? "0 22px 45px rgba(15,23,42,0.9)"
                    : "0 18px 34px rgba(15,23,42,0.18)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {/* Konum barı */}
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "0.7rem 0.9rem",
                  borderRadius: 999,
                  border:
                    theme === "dark"
                      ? "1px solid rgba(75,85,99,0.9)"
                      : "1px solid var(--card-border)",
                  backgroundColor:
                    theme === "dark"
                      ? "rgba(15,23,42,0.96)"
                      : "rgba(248,250,252,0.96)",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  cursor: "pointer",
                  color: "var(--fg)",
                  boxShadow:
                    theme === "dark"
                      ? "0 10px 24px rgba(15,23,42,0.9)"
                      : "0 10px 22px rgba(15,23,42,0.12)",
                  boxSizing: "border-box",
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
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        opacity: 0.7,
                      }}
                    >
                      {language === "tr"
                        ? "Konum"
                        : language === "de"
                        ? "Standort"
                        : "Location"}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {locationLabel || t.heroLocationPlaceholder}
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 16,
                    opacity: 0.7,
                  }}
                >
                  ▼
                </span>
              </button>

              {/* CTA + "all locations" link */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  marginTop: 2,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={handleShowEventsClick}
                  style={{
                    flexShrink: 0,
                    padding: "0.75rem 1.35rem",
                    borderRadius: 999,
                    border: "none",
                    background:
                      "linear-gradient(135deg,#22c55e,#16a34a,#15803d)",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    color: "#ffffff",
                    boxShadow:
                      "0 10px 24px rgba(22,163,74,0.45), 0 0 0 1px rgba(21,128,61,0.15)",
                    transition:
                      "transform 0.14s ease, box-shadow 0.14s ease, filter 0.14s ease",
                  }}
                  onMouseDown={(e) => {
                    const el = e.currentTarget;
                    el.style.transform = "translateY(1px) scale(0.98)";
                    el.style.boxShadow =
                      "0 6px 18px rgba(22,163,74,0.35), 0 0 0 1px rgba(21,128,61,0.2)";
                  }}
                  onMouseUp={(e) => {
                    const el = e.currentTarget;
                    el.style.transform = "translateY(0) scale(1)";
                    el.style.boxShadow =
                      "0 10px 24px rgba(22,163,74,0.45), 0 0 0 1px rgba(21,128,61,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.transform = "translateY(0) scale(1)";
                    el.style.boxShadow =
                      "0 10px 24px rgba(22,163,74,0.45), 0 0 0 1px rgba(21,128,61,0.15)";
                  }}
                >
                  {t.heroButton}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity("");
                    setSelectedCountry("");
                    setLocationLabel(t.heroLocationPlaceholder);
                    if (typeof window !== "undefined") {
                      window.localStorage.removeItem(
                        EVENTS_LOCATION_STORAGE_KEY
                      );
                    }
                    fetchEvents(undefined, selectedHobbyId || undefined);
                    setExternalEvents([]);
                    setExternalError(null);
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 12,
                    cursor: "pointer",
                    textDecoration: "underline",
                    opacity: 0.8,
                  }}
                >
                  {t.heroAllLocations}
                </button>
              </div>
            </div>
          </div>

          {/* Sağ: örnek/popüler etkinlik tipleri */}
          <aside
            style={{
              borderRadius: 26,
              border:
                theme === "dark"
                  ? "1px solid rgba(148,163,184,0.45)"
                  : "1px solid rgba(148,163,184,0.38)",
              background:
                theme === "dark"
                  ? "radial-gradient(circle at top,rgba(59,130,246,0.22),rgba(15,23,42,0.96))"
                  : "radial-gradient(circle at top,rgba(59,130,246,0.16),rgba(16,185,129,0.06),var(--bg))",
              padding: "1.5rem 1.7rem 1.6rem",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              color: "var(--fg)",
              boxShadow:
                theme === "dark"
                  ? "0 20px 45px rgba(15,23,42,0.8)"
                  : "0 18px 32px rgba(15,23,42,0.12)",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              {t.popularHeading}
            </h2>
            <p
              style={{
                fontSize: 13,
                opacity: 0.9,
                marginBottom: 8,
              }}
            >
              {t.popularText}
            </p>

            {[
              {
                title: "Board Game Night",
                city: "Berlin",
              },
              {
                title: "Cycling Meetup",
                city: "Istanbul",
              },
              {
                title: "Coffee & Language Exchange",
                city: "London",
              },
              {
                title: "Afterwork Gym Session",
                city: "Munich",
              },
              {
                title: "Photography Walk",
                city: "Amsterdam",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  borderRadius: 18,
                  padding: "0.75rem 0.95rem",
                  marginTop: 4,
                  background:
                    theme === "dark"
                      ? "rgba(15,23,42,0.96)"
                      : "rgba(248,250,252,0.96)",
                  border:
                    theme === "dark"
                      ? "1px solid rgba(148,163,184,0.55)"
                      : "1px solid rgba(148,163,184,0.32)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 14,
                  color: "var(--fg)",
                  boxShadow:
                    theme === "dark"
                      ? "0 10px 22px rgba(15,23,42,0.7)"
                      : "0 8px 18px rgba(15,23,42,0.08)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{item.title}</div>
                  <div
                    style={{
                      opacity: 0.85,
                      fontSize: 13,
                    }}
                  >
                    {item.city}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    padding: "4px 12px",
                    borderRadius: 999,
                    background: "rgba(22,163,74,0.12)",
                    border: "1px solid rgba(22,163,74,0.45)",
                    color: "#16a34a",
                    fontWeight: 500,
                  }}
                >
                  {t.soonBadge}
                </span>
              </div>
            ))}
          </aside>
        </section>

        {/* 🔍 Search & quick filters */}
        <section
          style={{
            marginBottom: 24,
            padding: "0.75rem 0",
          }}
        >
          <div
            style={{
              maxWidth: 520,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <label
              style={{
                fontSize: 13,
                opacity: 0.85,
                marginBottom: 2,
              }}
            >
              {t.searchSectionTitle}
            </label>
            <p
              style={{
                fontSize: 11,
                opacity: 0.75,
                marginBottom: 4,
                maxWidth: 520,
              }}
            >
              {t.searchSectionHint}
            </p>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 0.95rem",
                borderRadius: 999,
                border: "1px solid var(--card-border)",
                backgroundColor: "var(--card-bg)",
                color: "var(--fg)",
                fontSize: 14,
                boxShadow: "0 8px 16px rgba(15,23,42,0.12)",
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
                    padding: "0.2rem 0.7rem",
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.8)",
                    background: "rgba(248,250,252,0.95)",
                    color: "var(--fg)",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(15,23,42,0.08)",
                    fontSize: 11,
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 🌐 External events */}
        {selectedCity && (
          <section
            style={{
              marginBottom: 24,
              padding: "1.2rem 0 0.5rem",
              borderTop: "1px dashed rgba(148,163,184,0.4)",
            }}
          >
            <div
              style={{
                marginBottom: 8,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                {t.externalHeading}
              </h2>
              <p
                style={{
                  fontSize: 12,
                  opacity: 0.75,
                  maxWidth: 600,
                }}
              >
                {t.externalSub(selectedCity)}
              </p>
            </div>

            {externalLoading && (
              <p
                style={{
                  fontSize: 12,
                  opacity: 0.75,
                  marginBottom: 8,
                }}
              >
                {t.loading}
              </p>
            )}

            {externalError && (
              <p
                style={{
                  color: "#dc2626",
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                {externalError}
              </p>
            )}

            {!externalLoading &&
              !externalError &&
              externalEvents.length === 0 && (
                <p
                  style={{
                    fontSize: 12,
                    opacity: 0.75,
                    marginBottom: 4,
                  }}
                >
                  {t.externalNone(selectedCity)}
                </p>
              )}

            {externalEvents.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${externalColumns}, minmax(0, 1fr))`,
                  gap: 16,
                  alignItems: "stretch",
                  marginTop: 4,
                }}
              >
                {externalEvents.map((ev) => {
                  const date = new Date(ev.dateTime);
                  const formattedDate = date.toLocaleDateString(
                    undefined,
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  );
                  const formattedTime = date.toLocaleTimeString(
                    undefined,
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                  const cardBackground =
                    theme === "dark"
                      ? "radial-gradient(circle at top left, rgba(56,189,248,0.09), #020617)"
                      : "radial-gradient(circle at top left, rgba(254,240,138,0.24), #fffaf2)";

                  const baseShadow =
                    theme === "dark"
                      ? "0 18px 50px rgba(0,0,0,0.9), 0 0 0 1px rgba(15,23,42,0.95)"
                      : "0 16px 36px rgba(15,23,42,0.14), 0 0 0 1px rgba(148,163,184,0.22)";

                  const hoverShadow =
                    theme === "dark"
                      ? "0 24px 65px rgba(0,0,0,0.95), 0 0 0 1px rgba(129,140,248,0.45)"
                      : "0 20px 50px rgba(15,23,42,0.2), 0 0 0 1px rgba(96,165,250,0.55)";

                  return (
                    <div
                      key={ev.id}
                      style={{
                        borderRadius: 20,
                        border:
                          theme === "dark"
                            ? "1px solid rgba(148,163,184,0.6)"
                            : "1px solid rgba(148,163,184,0.35)",
                        background: cardBackground,
                        padding: "1.1rem 1.3rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        boxShadow: baseShadow,
                        color: theme === "dark" ? "#f9fafb" : "#111827",
                        transition:
                          "transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        el.style.transform = "translateY(-2px)";
                        el.style.boxShadow = hoverShadow;
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget;
                        el.style.transform = "translateY(0)";
                        el.style.boxShadow = baseShadow;
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            minWidth: 0,
                          }}
                        >
                          <h3
                            style={{
                              fontSize: 15,
                              fontWeight: 600,
                              marginBottom: 2,
                            }}
                          >
                            {ev.title}
                          </h3>
                          <p
                            style={{
                              fontSize: 12,
                              opacity: 0.8,
                            }}
                          >
                            {ev.city}
                            {ev.location ? ` • ${ev.location}` : ""}
                          </p>
                        </div>
                        <span
                          style={{
                            alignSelf: "flex-start",
                            padding: "3px 9px",
                            borderRadius: 999,
                            background:
                              theme === "dark"
                                ? "rgba(15,23,42,0.9)"
                                : "rgba(248,250,252,0.98)",
                            border:
                              theme === "dark"
                                ? "1px solid rgba(148,163,184,0.7)"
                                : "1px solid rgba(148,163,184,0.55)",
                            fontSize: 10,
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ev.source}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: 12,
                          opacity: 0.85,
                        }}
                      >
                        🗓 {formattedDate} · {formattedTime}
                      </p>

                      <div
                        style={{
                          marginTop: "auto",
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            window.open(
                              ev.url,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }}
                          style={{
                            padding: "0.45rem 0.9rem",
                            borderRadius: 999,
                            border:
                              "1px solid rgba(59,130,246,0.55)",
                            background:
                              "linear-gradient(135deg,#3b82f6,#2563eb)",
                            color: "#f9fafb",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            boxShadow:
                              "0 8px 18px rgba(37,99,235,0.5)",
                          }}
                        >
                          {t.externalOpenLabel}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Başlık + sayaç */}
        <section
          style={{
            marginBottom: 12,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 0,
            }}
          >
            {t.listHeading}
          </h2>
          <p style={{ fontSize: 13, opacity: 0.7 }}>
            {t.listSub(
              upcomingEvents.length,
              selectedCity || undefined,
              selectedHobbyName || undefined
            )}
          </p>
        </section>

        {loading && <p>{t.loading}</p>}
        {error && (
          <p style={{ color: "#dc2626", marginBottom: 16 }}>{error}</p>
        )}
        {isEmpty && <p>{t.noEvents}</p>}

        {/* ✅ UPCOMING – grid, max 4 kolon, aynı yükseklik */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${upcomingColumns}, minmax(0, 1fr))`,
            gap: 18,
            alignItems: "stretch",
            marginBottom: pastEvents.length ? 32 : 0,
          }}
        >
          {upcomingEvents.map((e) => (
            <div
              key={e.id}
              style={{
                height: "100%",
              }}
            >
              {renderCard(e, theme)}
            </div>
          ))}
        </section>

        {/* ✅ PAST – aynı kart boyutu, grid */}
        {pastEvents.length > 0 && (
          <section style={{ marginTop: 8, marginBottom: 40 }}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 2,
              }}
            >
              {t.pastHeading}
            </h3>
            <p
              style={{
                fontSize: 12,
                opacity: 0.75,
                marginBottom: 12,
              }}
            >
              {t.pastSub(pastEvents.length)}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${pastColumns}, minmax(0, 1fr))`,
                gap: 18,
                alignItems: "stretch",
                minHeight: 0,
              }}
            >
              {pagedPastEvents.map((e) => (
                <div
                  key={e.id}
                  style={{
                    height: "100%",
                  }}
                >
                  {renderCard(e, theme)}
                </div>
              ))}
            </div>

            {totalPastPages > 1 && (
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setPastPage((p) => Math.max(0, p - 1))}
                    disabled={pastPage === 0}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.7)",
                      background:
                        pastPage === 0
                          ? "rgba(148,163,184,0.15)"
                          : "rgba(248,250,252,0.95)",
                      cursor: pastPage === 0 ? "default" : "pointer",
                      fontSize: 12,
                    }}
                  >
                    ‹ Prev
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPastPage((p) =>
                        Math.min(totalPastPages - 1, p + 1)
                      )
                    }
                    disabled={pastPage >= totalPastPages - 1}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.7)",
                      background:
                        pastPage >= totalPastPages - 1
                          ? "rgba(148,163,184,0.15)"
                          : "rgba(248,250,252,0.95)",
                      cursor:
                        pastPage >= totalPastPages - 1
                          ? "default"
                          : "pointer",
                      fontSize: 12,
                    }}
                  >
                    Next ›
                  </button>
                </div>

                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.75,
                  }}
                >
                  Page {pastPage + 1} / {totalPastPages}
                </div>
              </div>
            )}
          </section>
        )}
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

          if (typeof window !== "undefined") {
            try {
              window.localStorage.setItem(
                EVENTS_LOCATION_STORAGE_KEY,
                JSON.stringify({
                  city: cityName || "",
                  country: countryName || "",
                })
              );
            } catch {
              // ignore
            }
          }

          setLocationLabel(
            cityName && countryName
              ? `${cityName}, ${countryName}`
              : cityName || countryName || t.heroLocationPlaceholder
          );

          setLocationModalOpen(false);
          fetchEvents(
            cityName || undefined,
            selectedHobbyId || undefined
          );
          if (cityName) {
            fetchExternalEvents(cityName, countryName || undefined);
          } else {
            setExternalEvents([]);
            setExternalError(null);
          }
        }}
      />
    </main>
  );
}
