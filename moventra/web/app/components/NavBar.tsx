"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLanguage, type Language } from "../context/LanguageContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  city?: string | null;
  createdAt: string;
  isEmailVerified: boolean;
  onboardingCompleted: boolean;
  birthDate?: string | null;
  gender?: string | null;
  planType?: string | null;
};

type NearbyEvent = {
  id: number;
  title: string;
  city: string;
  dateTime: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

/** ================================
 *  Dil bazlı tagline'lar
 *  ================================ */
const TAGLINES_BY_LANG: Record<Language, string[]> = {
  en: [
    "find new friends in every city",
    "meet people through your hobbies",
    "discover small, interest-based meetups",
    "move, travel, meet people",
  ],
  de: [
    "lerne neue Freunde in jeder Stadt kennen",
    "triff Menschen über deine Hobbys",
    "entdecke kleine, interessenbasierte Treffen",
    "reisen, umziehen, Menschen treffen",
  ],
  tr: [
    "her şehirde yeni arkadaşlar bul",
    "hobilerin üzerinden insanlarla tanış",
    "küçük ve ilgi alanı odaklı buluşmalar keşfet",
    "taşın, gez, insanlarla tanış",
  ],
};

/** ================================
 *  Dil bazlı metinler
 *  ================================ */
const TEXT = {
  events: {
    en: "Events",
    de: "Events",
    tr: "Etkinlikler",
  },
  hobbies: {
    en: "All Hobbies",
    de: "Alle Hobbys",
    tr: "Tüm Hobiler",
  },
  createEvent: {
    en: "Create event",
    de: "Event erstellen",
    tr: "Etkinlik oluştur",
  },
  nearbyTitle: {
    en: "Notifications",
    de: "Benachrichtigungen",
    tr: "Bildirimler",
  },
  nearbyDesc: {
    en: "Your upcoming and joined events, favorites and new meetups near your city.",
    de: "Deine anstehenden und beigetretenen Events, Favoriten und neue Treffen in deiner Nähe.",
    tr: "Yaklaşan ve katıldığın etkinlikler, favorilerin ve şehrine yakın yeni buluşmalar.",
  },
  checkingCity: {
    en: "Checking nearby events…",
    de: "Events in deiner Nähe werden geprüft…",
    tr: "Yakındaki etkinlikler kontrol ediliyor…",
  },
  yourUpcomingTitle: {
    en: "Your upcoming events",
    de: "Deine anstehenden Events",
    tr: "Oluşturduğun yaklaşan etkinlikler",
  },
  yourUpcomingEmpty: {
    en: "You don’t have any upcoming events you created yet.",
    de: "Du hast noch keine anstehenden eigenen Events.",
    tr: "Henüz oluşturduğun yaklaşan bir etkinlik yok.",
  },
  joinedTitle: {
    en: "Events you joined",
    de: "Events, denen du beigetreten bist",
    tr: "Katıldığın etkinlikler",
  },
  joinedEmpty: {
    en: "You haven't joined any upcoming events yet.",
    de: "Du bist noch keinen anstehenden Events beigetreten.",
    tr: "Henüz katıldığın yaklaşan bir etkinlik yok.",
  },
  favoritesTitle: {
    en: "Your favorites",
    de: "Deine Favoriten",
    tr: "Favorilerin",
  },
  favoritesEmpty: {
    en: "You don't have any favorite events yet.",
    de: "Du hast noch keine Favoriten.",
    tr: "Henüz favorilerine eklediğin etkinlik yok.",
  },
  favoritesNewBadge: {
    en: "New",
    de: "Neu",
    tr: "Yeni",
  },
  noEventsWithCity: {
    en: (city: string) => `No new events near ${city} this week.`,
    de: (city: string) =>
      `Keine neuen Events in der Nähe von ${city} diese Woche.`,
    tr: (city: string) => `${city} yakınlarında bu hafta yeni etkinlik yok.`,
  },
  noEventsNoCity: {
    en: "Add your city in your profile to get nearby event alerts.",
    de: "Füge deine Stadt in deinem Profil hinzu, um Benachrichtigungen zu erhalten.",
    tr: "Yakındaki etkinlikler için bildirim almak istiyorsan profilinden şehrini ekle.",
  },
  messagesAria: {
    en: "Moventra assistant",
    de: "Moventra-Assistent",
    tr: "Moventra asistanı",
  },
  notificationsAria: {
    en: "Notifications",
    de: "Benachrichtigungen",
    tr: "Bildirimler",
  },
  signedInAs: {
    en: "Signed in as",
    de: "Angemeldet als",
    tr: "Giriş yapılan hesap",
  },
  yourEvents: {
    en: "Your events",
    de: "Deine Events",
    tr: "Etkinliklerin",
  },
  yourGroups: {
    en: "Your groups",
    de: "Deine Gruppen",
    tr: "Grupların",
  },
  viewProfile: {
    en: "View profile",
    de: "Profil ansehen",
    tr: "Profili görüntüle",
  },
  settings: {
    en: "Settings",
    de: "Einstellungen",
    tr: "Ayarlar",
  },
  darkMode: {
    en: "Dark mode",
    de: "Dunkelmodus",
    tr: "Karanlık mod",
  },
  lightMode: {
    en: "Light mode",
    de: "Hellmodus",
    tr: "Aydınlık mod",
  },
  logout: {
    en: "Log out",
    de: "Abmelden",
    tr: "Çıkış yap",
  },
  login: {
    en: "Log in",
    de: "Anmelden",
    tr: "Giriş yap",
  },
  register: {
    en: "Sign up",
    de: "Registrieren",
    tr: "Kayıt ol",
  },
};

const CHAT_STORAGE_KEY = "moventra_chat_history_v1";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [nearbyEvents, setNearbyEvents] = useState<NearbyEvent[] | null>(null);
  const [loadingNearby, setLoadingNearby] = useState(false);

  // Oluşturulan etkinlikler
  const [createdEvents, setCreatedEvents] = useState<NearbyEvent[]>([]);
  const [loadingCreated, setLoadingCreated] = useState(false);

  // Katılınan etkinlikler
  const [joinedEvents, setJoinedEvents] = useState<NearbyEvent[]>([]);
  const [loadingJoined, setLoadingJoined] = useState(false);

  // Favoriler
  const [favoriteEvents, setFavoriteEvents] = useState<NearbyEvent[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // "New" badge'leri için
  const [recentFavoriteId, setRecentFavoriteId] = useState<number | null>(null);
  const [recentJoinedId, setRecentJoinedId] = useState<number | null>(null);

  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [taglineIndex, setTaglineIndex] = useState(0);
  const [logoHover, setLogoHover] = useState(false);
  const [createHover, setCreateHover] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const taglines = TAGLINES_BY_LANG[language] ?? TAGLINES_BY_LANG.en;
  const isLoggedIn = !!user;

  /* ========================
   *  User fetch
   * ======================== */
  useEffect(() => {
    let cancelled = false;

    const token = getToken();
    if (!token) {
      if (!cancelled) setUser(null);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }

        const data = await res.json();
        if (!cancelled) {
          setUser(data.user as CurrentUser);
        }
      } catch {
        if (!cancelled) setUser(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  /* ========================
   *  Theme load
   * ======================== */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;
    const stored = window.localStorage.getItem("theme");

    const initial: "light" | "dark" =
      stored === "light" || stored === "dark"
        ? (stored as "light" | "dark")
        : html.classList.contains("dark")
        ? "dark"
        : "light";

    html.classList.remove("light", "dark");
    html.classList.add(initial);
    setTheme(initial);
  }, []);

  const toggleTheme = () => {
    if (typeof window === "undefined") return;

    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      const html = document.documentElement;
      html.classList.remove("light", "dark");
      html.classList.add(next);
      window.localStorage.setItem("theme", next);
      return next;
    });
  };

  /* ========================
   *  Tagline rotation
   * ======================== */
  useEffect(() => {
    const id = window.setInterval(() => {
      setTaglineIndex((p) => (p + 1) % taglines.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, [taglines.length]);

  /* ========================
   *  Outside click / Esc
   * ======================== */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setNotifOpen(false);
        setChatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  /* ========================
   *  EventDetail'den gelen sinyaller
   * ======================== */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFav = (e: Event) => {
      const custom = e as CustomEvent<{
        eventId?: number;
        title?: string;
        city?: string;
        dateTime?: string;
      }>;
      if (custom.detail?.eventId) {
        setRecentFavoriteId(custom.detail.eventId);
      }
      setNotifOpen(true);
    };

    const handleJoined = (e: Event) => {
      const custom = e as CustomEvent<{
        eventId?: number;
        title?: string;
        city?: string;
        dateTime?: string;
      }>;
      if (custom.detail?.eventId) {
        setRecentJoinedId(custom.detail.eventId);
      }
      setNotifOpen(true);
    };

    window.addEventListener("moventra:favorites-updated", handleFav as any);
    window.addEventListener("moventra:joined-updated", handleJoined as any);

    return () => {
      window.removeEventListener(
        "moventra:favorites-updated",
        handleFav as any
      );
      window.removeEventListener(
        "moventra:joined-updated",
        handleJoined as any
      );
    };
  }, []);

  // Çan kapandığında "New" badge'lerini sıfırla
  useEffect(() => {
    if (!notifOpen) {
      setRecentFavoriteId(null);
      setRecentJoinedId(null);
    }
  }, [notifOpen]);

  /* ========================
   *  Nearby events fetch
   * ======================== */
  useEffect(() => {
    if (!notifOpen) return;

    const token = getToken();
    const city = user?.city ?? "";

    if (!city) {
      setNearbyEvents(null);
      setLoadingNearby(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoadingNearby(true);
        const params = new URLSearchParams();
        params.append("city", city);

        const url = `${API_URL}/events?${params.toString()}`;

        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(url, { headers });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (!cancelled) setNearbyEvents([]);
          return;
        }

        const events = (data.events || []) as NearbyEvent[];
        if (!cancelled) {
          setNearbyEvents(events.slice(0, 3));
        }
      } catch {
        if (!cancelled) setNearbyEvents([]);
      } finally {
        if (!cancelled) setLoadingNearby(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [notifOpen, user?.city]);

  /* ========================
   *  Created events
   * ======================== */
  useEffect(() => {
    if (!notifOpen) return;

    const token = getToken();
    if (!token) {
      setCreatedEvents([]);
      setLoadingCreated(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoadingCreated(true);

        const res = await fetch(`${API_URL}/events/my/created`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (!cancelled) setCreatedEvents([]);
          return;
        }

        const all = (data.events || []) as NearbyEvent[];
        const now = new Date();

        const upcoming = all.filter(
          (ev) => new Date(ev.dateTime).getTime() >= now.getTime()
        );

        if (!cancelled) {
          setCreatedEvents(upcoming.slice(0, 3));
        }
      } catch {
        if (!cancelled) setCreatedEvents([]);
      } finally {
        if (!cancelled) setLoadingCreated(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [notifOpen]);

  /* ========================
   *  Joined events
   * ======================== */
  useEffect(() => {
    if (!notifOpen) return;

    const token = getToken();
    if (!token) {
      setJoinedEvents([]);
      setLoadingJoined(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoadingJoined(true);

        const res = await fetch(`${API_URL}/events/my/joined`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (!cancelled) setJoinedEvents([]);
          return;
        }

        const all = (data.events || []) as NearbyEvent[];
        const now = new Date();

        const upcoming = all.filter(
          (ev) => new Date(ev.dateTime).getTime() >= now.getTime()
        );

        if (!cancelled) {
          setJoinedEvents(upcoming.slice(0, 3));
        }
      } catch {
        if (!cancelled) setJoinedEvents([]);
      } finally {
        if (!cancelled) setLoadingJoined(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [notifOpen]);

  /* ========================
   *  Favorite events
   * ======================== */
  useEffect(() => {
    if (!notifOpen) return;

    const token = getToken();
    if (!token) {
      setFavoriteEvents([]);
      setLoadingFavorites(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoadingFavorites(true);

        const res = await fetch(`${API_URL}/events/my/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (!cancelled) setFavoriteEvents([]);
          return;
        }

        const favs = (data.events || []) as NearbyEvent[];
        if (!cancelled) {
          setFavoriteEvents(favs.slice(0, 4));
        }
      } catch {
        if (!cancelled) setFavoriteEvents([]);
      } finally {
        if (!cancelled) setLoadingFavorites(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [notifOpen]);

  /* ========================
   *  Helpers
   * ======================== */
  const isEvents = pathname?.startsWith("/events");
  const isHobbies = pathname?.startsWith("/hobbies");

  const navLabelEvents = TEXT.events[language];
  const navLabelHobbies = TEXT.hobbies[language];
  const navLabelCreateEvent = TEXT.createEvent[language];

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
    }
    setUser(null);
    setProfileOpen(false);
    router.push("/login");
  };

  const handleToggleNotif = () => {
    setNotifOpen((v) => !v);
  };

  /* ========================
   *  RENDER
   * ======================== */
  return (
    <>
      <header
        style={{
          width: "100%",
          position: "sticky",
          top: 0,
          zIndex: 40,
          color: "#e5e7eb",
          background:
            "linear-gradient(135deg,#020617 0%,#0a0f24 70%,#0e152b 100%)",
          boxShadow: "0 1px 0 rgba(15,23,42,0.9)",
        }}
      >
        <nav
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            height: 56,
            padding: "0 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* SOL KISIM */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              minWidth: 0,
            }}
          >
            {/* Logo + tagline */}
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                minWidth: 0,
                width: 260,
                flexShrink: 0,
              }}
            >
              <div className="moventra-logo-bubble">
                <div
                  onMouseEnter={() => setLogoHover(true)}
                  onMouseLeave={() => setLogoHover(false)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    background:
                      "conic-gradient(from 120deg,#38bdf8,#6366f1,#f97316,#22c55e,#38bdf8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: logoHover ? "scale(1.06)" : "scale(1)",
                    boxShadow: logoHover
                      ? "0 0 20px rgba(56,189,248,0.95)"
                      : "0 0 14px rgba(56,189,248,0.75)",
                    transition:
                      "transform 150ms ease-out, box-shadow 150ms ease-out",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 18,
                      color: "#0f172a",
                    }}
                  >
                    M
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    color: "#f9fafb",
                    whiteSpace: "nowrap",
                  }}
                >
                  Moventra
                </span>

                <span
                  key={taglineIndex}
                  className="moventra-tagline-slide"
                  style={{
                    fontSize: 11,
                    lineHeight: 1.1,
                    opacity: 0.78,
                    color: "#cbd5f5",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 210,
                    display: "block",
                  }}
                >
                  {taglines[taglineIndex]}
                </span>
              </div>
            </Link>

            {/* Orta navigasyon */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                fontSize: 14,
              }}
            >
              <Link
                href="/events"
                style={{
                  color: isEvents ? "#fcd34d" : "rgba(226,232,240,0.9)",
                  fontWeight: isEvents ? 600 : 500,
                  textDecoration: "none",
                }}
              >
                {navLabelEvents}
              </Link>

              <Link
                href="/hobbies"
                style={{
                  color: isHobbies ? "#fcd34d" : "rgba(226,232,240,0.9)",
                  fontWeight: isHobbies ? 600 : 500,
                  textDecoration: "none",
                }}
              >
                {navLabelHobbies}
              </Link>

              {/* Create event CTA */}
              <Link href="/events/create" style={{ textDecoration: "none" }}>
                <button
                  type="button"
                  onMouseEnter={() => setCreateHover(true)}
                  onMouseLeave={() => setCreateHover(false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "0.32rem 1.1rem",
                    borderRadius: 999,
                    border: "1px solid rgba(45,212,191,0.55)",
                    background: createHover
                      ? "linear-gradient(135deg,rgba(34,197,235,0.32),rgba(16,185,129,0.32))"
                      : "linear-gradient(135deg,rgba(34,197,235,0.18),rgba(16,185,129,0.18))",
                    color: "#E5FBFF",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    backdropFilter: "blur(10px)",
                    boxShadow: createHover
                      ? "0 8px 22px rgba(6,182,212,0.55)"
                      : "0 0 0 1px rgba(15,23,42,0.8)",
                    transform: createHover ? "translateY(-1px)" : "translateY(0)",
                    transition:
                      "background 160ms ease, box-shadow 160ms ease, transform 130ms ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      marginTop: -1,
                    }}
                  >
                    +
                  </span>
                  <span>{navLabelCreateEvent}</span>
                </button>
              </Link>
            </div>
          </div>

          {/* SAĞ: ikonlar + auth alanı */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Moventra Asistan */}
            <button
              type="button"
              onClick={() => setChatOpen((v) => !v)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                background: "rgba(15,23,42,0.82)",
                border: "1px solid rgba(148,163,184,0.6)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition:
                  "transform 120ms ease, box-shadow 150ms ease, background 150ms ease",
                boxShadow: chatOpen
                  ? "0 0 0 1px rgba(251,191,36,0.8),0 0 18px rgba(251,191,36,0.4)"
                  : "0 0 0 1px rgba(15,23,42,0.9)",
                backdropFilter: "blur(10px)",
              }}
              aria-label={TEXT.messagesAria[language]}
            >
              💬
            </button>

            {/* Bildirimler */}
            <div style={{ position: "relative" }} ref={notifRef}>
              <button
                type="button"
                onClick={handleToggleNotif}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  background: "rgba(15,23,42,0.82)",
                  border: "1px solid rgba(148,163,184,0.6)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition:
                    "transform 120ms ease, box-shadow 150ms ease, background 150ms ease",
                  boxShadow: notifOpen
                    ? "0 0 0 1px rgba(148,163,184,0.9),0 0 18px rgba(148,163,184,0.35)"
                    : "0 0 0 1px rgba(15,23,42,0.9)",
                  backdropFilter: "blur(10px)",
                }}
                aria-label={TEXT.notificationsAria[language]}
              >
                🔔
              </button>

              {notifOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: 8,
                    width: 300,
                    background: "#020617",
                    borderRadius: 16,
                    border: "1px solid rgba(148,163,184,0.6)",
                    padding: "0.9rem",
                    fontSize: 13,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                    color: "#e5e7eb",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {TEXT.nearbyTitle[language]}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      opacity: 0.7,
                      marginBottom: 8,
                    }}
                  >
                    {TEXT.nearbyDesc[language]}
                  </div>

                  {/* Oluşturduğun etkinlikler */}
                  <div
                    style={{
                      marginBottom: 8,
                      paddingBottom: 6,
                      borderBottom: "1px solid rgba(31,41,55,0.9)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        marginBottom: 4,
                      }}
                    >
                      {TEXT.yourUpcomingTitle[language]}
                    </div>

                    {loadingCreated && (
                      <p style={{ fontSize: 11, opacity: 0.8 }}>
                        Loading your events…
                      </p>
                    )}

                    {!loadingCreated && createdEvents.length > 0 && (
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {createdEvents.map((ev) => {
                          const d = new Date(ev.dateTime);
                          const label = d.toLocaleDateString(undefined, {
                            day: "2-digit",
                            month: "short",
                          });
                          return (
                            <li
                              key={ev.id}
                              style={{
                                padding: "0.45rem 0.55rem",
                                borderRadius: 10,
                                background: "rgba(15,23,42,0.92)",
                                border:
                                  "1px solid rgba(148,163,184,0.65)",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setNotifOpen(false);
                                router.push(`/events/${ev.id}`);
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                }}
                              >
                                {ev.title}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  opacity: 0.75,
                                }}
                              >
                                {ev.city} · {label}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {!loadingCreated && createdEvents.length === 0 && (
                      <p
                        style={{
                          fontSize: 11,
                          opacity: 0.8,
                        }}
                      >
                        {TEXT.yourUpcomingEmpty[language]}
                      </p>
                    )}
                  </div>

                  {/* Joined events */}
                  <div
                    style={{
                      marginBottom: 8,
                      paddingBottom: 6,
                      borderBottom: "1px solid rgba(31,41,55,0.9)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        marginBottom: 4,
                      }}
                    >
                      {TEXT.joinedTitle[language]}
                    </div>

                    {loadingJoined && (
                      <p style={{ fontSize: 11, opacity: 0.8 }}>
                        Loading joined events…
                      </p>
                    )}

                    {!loadingJoined && joinedEvents.length > 0 && (
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {joinedEvents.map((ev) => {
                          const d = new Date(ev.dateTime);
                          const label = isNaN(d.getTime())
                            ? ""
                            : d.toLocaleDateString(undefined, {
                                day: "2-digit",
                                month: "short",
                              });
                          const isNew = recentJoinedId === ev.id;

                          return (
                            <li
                              key={ev.id}
                              style={{
                                padding: "0.45rem 0.55rem",
                                borderRadius: 10,
                                background: isNew
                                  ? "rgba(96,165,250,0.12)"
                                  : "rgba(15,23,42,0.9)",
                                border: isNew
                                  ? "1px solid rgba(59,130,246,0.8)"
                                  : "1px solid rgba(148,163,184,0.55)",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 8,
                              }}
                              onClick={() => {
                                setNotifOpen(false);
                                router.push(`/events/${ev.id}`);
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                  }}
                                >
                                  {ev.title}
                                </div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    opacity: 0.75,
                                  }}
                                >
                                  {ev.city}
                                  {label ? ` · ${label}` : ""}
                                </div>
                              </div>
                              {isNew && (
                                <span
                                  style={{
                                    alignSelf: "center",
                                    fontSize: 10,
                                    padding: "2px 6px",
                                    borderRadius: 999,
                                    background:
                                      "rgba(59,130,246,0.16)",
                                    border:
                                      "1px solid rgba(59,130,246,0.8)",
                                    color: "#bfdbfe",
                                  }}
                                >
                                  {TEXT.favoritesNewBadge[language]}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {!loadingJoined && joinedEvents.length === 0 && (
                      <p
                        style={{
                          fontSize: 11,
                          opacity: 0.8,
                        }}
                      >
                        {TEXT.joinedEmpty[language]}
                      </p>
                    )}
                  </div>

                  {/* FAVORITES SECTION */}
                  <div
                    style={{
                      marginBottom: 8,
                      paddingBottom: 6,
                      borderBottom: "1px solid rgba(31,41,55,0.9)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        marginBottom: 4,
                      }}
                    >
                      {TEXT.favoritesTitle[language]}
                    </div>

                    {loadingFavorites && (
                      <p style={{ fontSize: 11, opacity: 0.8 }}>
                        Loading favorites…
                      </p>
                    )}

                    {!loadingFavorites && favoriteEvents.length > 0 && (
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {favoriteEvents.map((ev) => {
                          const d = new Date(ev.dateTime);
                          const label = isNaN(d.getTime())
                            ? ""
                            : d.toLocaleDateString(undefined, {
                                day: "2-digit",
                                month: "short",
                              });
                          const isNew = recentFavoriteId === ev.id;

                          return (
                            <li
                              key={ev.id}
                              style={{
                                padding: "0.45rem 0.55rem",
                                borderRadius: 10,
                                background: isNew
                                  ? "rgba(251,191,36,0.12)"
                                  : "rgba(15,23,42,0.9)",
                                border: isNew
                                  ? "1px solid rgba(250,204,21,0.7)"
                                  : "1px solid rgba(148,163,184,0.55)",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 8,
                              }}
                              onClick={() => {
                                setNotifOpen(false);
                                router.push(`/events/${ev.id}`);
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                  }}
                                >
                                  {ev.title}
                                </div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    opacity: 0.75,
                                  }}
                                >
                                  {ev.city}
                                  {label ? ` · ${label}` : ""}
                                </div>
                              </div>
                              {isNew && (
                                <span
                                  style={{
                                    alignSelf: "center",
                                    fontSize: 10,
                                    padding: "2px 6px",
                                    borderRadius: 999,
                                    background:
                                      "rgba(250,204,21,0.16)",
                                    border:
                                      "1px solid rgba(250,204,21,0.8)",
                                    color: "#facc15",
                                  }}
                                >
                                  {TEXT.favoritesNewBadge[language]}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {!loadingFavorites && favoriteEvents.length === 0 && (
                      <p
                        style={{
                          fontSize: 11,
                          opacity: 0.8,
                        }}
                      >
                        {TEXT.favoritesEmpty[language]}
                      </p>
                    )}
                  </div>

                  {/* Yakındaki etkinlikler */}
                  {loadingNearby && (
                    <p style={{ fontSize: 11, opacity: 0.8 }}>
                      {TEXT.checkingCity[language]}
                    </p>
                  )}

                  {!loadingNearby &&
                    nearbyEvents &&
                    nearbyEvents.length > 0 && (
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {nearbyEvents.map((ev) => {
                          const d = new Date(ev.dateTime);
                          const label = d.toLocaleDateString(undefined, {
                            day: "2-digit",
                            month: "short",
                          });
                          return (
                            <li
                              key={ev.id}
                              style={{
                                padding: "0.45rem 0.55rem",
                                borderRadius: 10,
                                background: "rgba(15,23,42,0.9)",
                                border:
                                  "1px solid rgba(148,163,184,0.55)",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setNotifOpen(false);
                                router.push(`/events/${ev.id}`);
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                }}
                              >
                                {ev.title}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  opacity: 0.75,
                                }}
                              >
                                {ev.city} · {label}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                  {!loadingNearby &&
                    (nearbyEvents === null || nearbyEvents.length === 0) && (
                      <p
                        style={{
                          fontSize: 12,
                          opacity: 0.85,
                          marginTop: 4,
                        }}
                      >
                        {user?.city
                          ? TEXT.noEventsWithCity[language](user.city || "")
                          : TEXT.noEventsNoCity[language]}
                      </p>
                    )}
                </div>
              )}
            </div>

            {/* AUTH ALANI */}
            {isLoggedIn ? (
              <div ref={profileRef} style={{ position: "relative" }}>
                {(() => {
                  const initial =
                    user?.name?.charAt(0).toUpperCase() ||
                    user?.email?.charAt(0).toUpperCase() ||
                    "U";
                  const displayName = user?.name || user?.email || "";

                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => setProfileOpen((v) => !v)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "0.25rem 0.75rem",
                          borderRadius: 999,
                          background:
                            "linear-gradient(135deg, #facc15, #eab308)",
                          border: "1px solid rgba(15,23,42,0.85)",
                          color: "#0f172a",
                          cursor: "pointer",
                          maxWidth: 220,
                          boxShadow: "0 4px 14px rgba(15,23,42,0.7)",
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 999,
                            background: "#0f172a",
                            color: "#facc15",
                            fontWeight: 700,
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {initial}
                        </div>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {displayName}
                        </span>
                        <span style={{ fontSize: 12 }}>▾</span>
                      </button>

                      {profileOpen && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            marginTop: 8,
                            width: 230,
                            background: "#020617",
                            borderRadius: 16,
                            border: "1px solid rgba(148,163,184,0.7)",
                            padding: "0.75rem 0.4rem",
                            fontSize: 13,
                            color: "#e5e7eb",
                            boxShadow: "0 22px 45px rgba(15,23,42,0.9)",
                          }}
                        >
                          <div
                            style={{
                              padding: "0.25rem 0.8rem 0.6rem",
                              borderBottom: "1px solid rgba(51,65,85,0.8)",
                              marginBottom: 4,
                            }}
                          >
                            <div
                              style={{ fontSize: 12, opacity: 0.7 }}
                            >
                              {TEXT.signedInAs[language]}
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 500,
                                wordBreak: "break-all",
                              }}
                            >
                              {user?.email}
                            </div>
                          </div>

                          <MenuItem
                            label={TEXT.yourEvents[language]}
                            onClick={() => {
                              setProfileOpen(false);
                              router.push("/events/my/created");
                            }}
                          />
                          <MenuItem
                            label={TEXT.yourGroups[language]}
                            onClick={() => {
                              setProfileOpen(false);
                              router.push("/hobbies");
                            }}
                          />
                          <MenuItem
                            label={TEXT.viewProfile[language]}
                            onClick={() => {
                              setProfileOpen(false);
                              router.push("/profile");
                            }}
                          />
                          <MenuItem
                            label={TEXT.settings[language]}
                            onClick={() => {
                              setProfileOpen(false);
                              router.push("/settings");
                            }}
                          />

                          <div
                            style={{
                              borderTop: "1px solid rgba(51,65,85,0.8)",
                              marginTop: 4,
                              paddingTop: 4,
                            }}
                          >
                            <MenuItem
                              label={TEXT.logout[language]}
                              variant="danger"
                              onClick={handleLogout}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  href="/login"
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <button
                    type="button"
                    style={{
                      padding: "0.35rem 0.95rem",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.7)",
                      background: "transparent",
                      color: "#e5e7eb",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {TEXT.login[language]}
                  </button>
                </Link>

                <Link
                  href="/register"
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <button
                    type="button"
                    style={{
                      padding: "0.35rem 0.95rem",
                      borderRadius: 999,
                      border: "none",
                      background: "#facc15",
                      color: "#0f172a",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {TEXT.register[language]}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {chatOpen && <ChatWidget onClose={() => setChatOpen(false)} />}
    </>
  );
}

type MenuItemProps = {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
};

function MenuItem({ label, onClick, variant = "default" }: MenuItemProps) {
  const isDanger = variant === "danger";
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "0.45rem 0.8rem",
        borderRadius: 10,
        border: "none",
        background: "transparent",
        color: isDanger ? "#fecaca" : "#e5e7eb",
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

/* ============================
 *  Moventra ChatWidget
 * ============================ */

function ChatWidget({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const TEXT_WIDGET = {
    headerTitle:
      language === "de"
        ? "Moventra-Assistent"
        : language === "en"
        ? "Moventra Assistant"
        : "Moventra asistanı",
    headerSubtitle:
      language === "de"
        ? "Antwortet auf Fragen zu deinem Moventra-Konto, Events und Einstellungen."
        : language === "en"
        ? "Answers questions about your Moventra account, events and settings."
        : "Moventra hesabın, etkinliklerin ve ayarlar hakkında sorularını yanıtlar.",
    newChatLabel:
      language === "de"
        ? "Neuer Chat"
        : language === "en"
        ? "New chat"
        : "Yeni sohbet",
    historyNote:
      language === "de"
        ? "Dein Chat-Verlauf wird lokal auf diesem Gerät gespeichert. Mit „Neuer Chat“ kannst du ihn löschen."
        : language === "en"
        ? "Your chat history is stored locally on this device. Use “New chat” to clear it."
        : "Sohbet geçmişin bu cihazda saklanır. “Yeni sohbet” ile temizleyebilirsin.",
    inputPlaceholder:
      language === "de"
        ? "Stelle eine Frage zu Moventra..."
        : language === "en"
        ? "Ask something about Moventra..."
        : "Moventra ile ilgili bir soru yaz...",
    sendLabel:
      language === "de" ? "Senden" : language === "en" ? "Send" : "Gönder",
    sendingLabel:
      language === "de"
        ? "Wird gesendet…"
        : language === "en"
        ? "Sending…"
        : "Gönderiliyor…",
    errorMessage:
      language === "de"
        ? "Es ist ein Fehler aufgetreten. Bitte überprüfe deine Verbindung und versuche es erneut."
        : language === "en"
        ? "Something went wrong. Please check your connection and try again."
        : "Bir hata oluştu, lütfen bağlantını kontrol edip tekrar dene.",
    intro:
      language === "de"
        ? `Hallo 👋 Du kannst Fragen zu deinem Moventra-Konto, Events und Einstellungen stellen. For example:

– "How do I create an account?"
– "Who is the creator of Moventra?"
– "How do I create a new event?"`
        : language === "en"
        ? `Hello 👋 You can ask questions about your Moventra account, events and settings. For example:

– "How do I create an account?"
– "Who is the creator of Moventra?"
– "How do I create a new event?"`
        : `Merhaba 👋 Moventra hesabın, etkinlikler ve ayarlar hakkında sorular sorabilirsin. For example:

– "How do I create an account?"
– "Who is the creator of Moventra?"
– "How do I create a new event?"`,
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const newUserMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setSending(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error("AI error");
      }

      const data = (await res.json()) as { answer?: string; error?: string };
      const answerText = data.answer || data.error || TEXT_WIDGET.errorMessage;

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: answerText,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: `${Date.now()}-error`,
        role: "assistant",
        content: TEXT_WIDGET.errorMessage,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 50,
        maxWidth: 360,
        width: "100%",
      }}
    >
      <div
        style={{
          borderRadius: 20,
          background: "rgba(15,23,42,0.98)",
          border: "1px solid rgba(148,163,184,0.6)",
          boxShadow: "0 24px 60px rgba(15,23,42,0.85)",
          overflow: "hidden",
          color: "#e5e7eb",
          display: "flex",
          flexDirection: "column",
          maxHeight: "70vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "0.65rem 0.9rem",
            borderBottom: "1px solid rgba(51,65,85,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {TEXT_WIDGET.headerTitle}
            </div>
            <div
              style={{
                fontSize: 11,
                opacity: 0.7,
              }}
            >
              {TEXT_WIDGET.headerSubtitle}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              onClick={handleNewChat}
              style={{
                fontSize: 11,
                padding: "0.25rem 0.5rem",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.7)",
                background: "rgba(15,23,42,0.9)",
                color: "#e5e7eb",
                cursor: "pointer",
              }}
            >
              {TEXT_WIDGET.newChatLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                border: "none",
                background: "rgba(15,23,42,0.9)",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mesajlar */}
        <div
          ref={scrollRef}
          style={{
            padding: "0.7rem 0.8rem",
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                fontSize: 12,
                opacity: 0.75,
                padding: "0.4rem 0.2rem",
                whiteSpace: "pre-wrap",
              }}
            >
              {TEXT_WIDGET.intro}
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                padding: "0.45rem 0.6rem",
                borderRadius:
                  m.role === "user"
                    ? "14px 14px 2px 14px"
                    : "14px 14px 14px 2px",
                background:
                  m.role === "user"
                    ? "linear-gradient(135deg,#22c55e,#16a34a,#15803d)"
                    : "rgba(15,23,42,0.95)",
                border:
                  m.role === "user"
                    ? "1px solid rgba(22,163,74,0.7)"
                    : "1px solid rgba(51,65,85,0.9)",
                fontSize: 12,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.content}
            </div>
          ))}
        </div>

        {/* Input */}
        <div
          style={{
            padding: "0.55rem 0.6rem 0.6rem",
            borderTop: "1px solid rgba(51,65,85,0.9)",
            background: "rgba(15,23,42,0.98)",
          }}
        >
          <div
            style={{
              marginBottom: 4,
              fontSize: 10,
              opacity: 0.6,
            }}
          >
            {TEXT_WIDGET.historyNote}
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={TEXT_WIDGET.inputPlaceholder}
              style={{
                flex: 1,
                borderRadius: 999,
                border: "1px solid rgba(51,65,85,0.95)",
                padding: "0.4rem 0.7rem",
                fontSize: 12,
                background: "rgba(15,23,42,0.95)",
                color: "#e5e7eb",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              style={{
                borderRadius: 999,
                border: "none",
                padding: "0.4rem 0.8rem",
                fontSize: 12,
                fontWeight: 600,
                background:
                  "linear-gradient(135deg,#22c55e,#16a34a,#15803d)",
                color: "#f9fafb",
                cursor: sending || !input.trim() ? "default" : "pointer",
                opacity: sending || !input.trim() ? 0.6 : 1,
              }}
            >
              {sending ? TEXT_WIDGET.sendingLabel : TEXT_WIDGET.sendLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
