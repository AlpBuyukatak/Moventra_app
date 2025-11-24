"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type SettingsUser = {
  id: number;
  email: string;
  name: string;
  city?: string | null;
  bio?: string | null;
  showGroups?: boolean;
  showInterests?: boolean;
};

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<SettingsUser | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");

  const [showGroups, setShowGroups] = useState(true);
  const [showInterests, setShowInterests] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Avatar initial
  const initials =
    (user?.name &&
      user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")) ||
    (user?.email ? user.email[0]?.toUpperCase() : "M");

  // Kullanıcıyı yükle
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login?from=/settings");
      return;
    }

    async function fetchMe() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("token");
          }
          router.replace("/login?from=/settings");
          return;
        }

        const data = await res.json().catch(() => ({} as any));

        if (!res.ok || !data.user) {
          setError(data.error || "Could not load your settings.");
          return;
        }

        const u: SettingsUser = data.user;
        setUser(u);

        setName(u.name || "");
        setCity(u.city || "");
        setBio(u.bio || "");
        setShowGroups(
          typeof u.showGroups === "boolean" ? u.showGroups : true
        );
        setShowInterests(
          typeof u.showInterests === "boolean" ? u.showInterests : true
        );
      } catch (err) {
        console.error(err);
        setError("Network error while loading settings.");
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, [router]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const token = getToken();
    if (!token) {
      router.replace("/login?from=/settings");
      return;
    }

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          city: city.trim() || null,
          bio: bio.trim() || null,
          showGroups,
          showInterests,
        }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data.user) {
        setError(data.error || "Could not save changes.");
        return;
      }

      setUser(data.user);
      setMessage("Your profile has been updated.");
    } catch (err) {
      console.error(err);
      setError("Network error while saving changes.");
    } finally {
      setSaving(false);
    }
  }

  // Toggle switch component (inline, Meetup benzeri)
  function Toggle({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
  }) {
    return (
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: 38,
          height: 22,
          borderRadius: 999,
          border: "none",
          padding: 0,
          backgroundColor: checked ? "#22c55e" : "rgba(148,163,184,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: checked ? "flex-end" : "flex-start",
          cursor: "pointer",
          transition: "background-color 0.18s ease, justify-content 0.18s ease",
        }}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: "999px",
            background: "#ffffff",
            boxShadow: "0 1px 4px rgba(15,23,42,0.45)",
          }}
        />
      </button>
    );
  }

  return (
    <main
      style={{
        minHeight: "70vh",
        paddingTop: 24,
        paddingBottom: 32,
        fontFamily: "system-ui, sans-serif",
        color: "var(--fg)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px minmax(0, 1.6fr)",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        {/* Sol: sidebar navigation */}
        <aside
          style={{
            borderRadius: 18,
            border: "1px solid var(--card-border)",
            backgroundColor: "var(--card-bg)",
            padding: "1.1rem 1rem",
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              margin: "0 0 10px 2px",
            }}
          >
            Settings
          </h2>

          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              fontSize: 14,
            }}
          >
            <button
              type="button"
              style={{
                textAlign: "left",
                padding: "0.45rem 0.7rem",
                borderRadius: 8,
                border: "none",
                background:
                  "linear-gradient(135deg,rgba(129,140,248,0.18),rgba(59,130,246,0.18))",
                color: "var(--fg)",
                fontWeight: 600,
                cursor: "default",
              }}
            >
              Edit profile
            </button>

            {/* Diğer satırlar sadece görsel amaçlı (şimdilik pasif) */}
            {[
              "Personal info",
              "Account management",
              "Email updates",
              "Privacy",
              "Social media",
              "Interests",
              "Payment methods",
            ].map((label) => (
              <button
                key={label}
                type="button"
                style={{
                  textAlign: "left",
                  padding: "0.4rem 0.7rem",
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  color: "rgba(148,163,184,0.9)",
                  fontSize: 13,
                  cursor: "not-allowed",
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Sağ: ana içerik */}
        <section
          style={{
            borderRadius: 18,
            border: "1px solid var(--card-border)",
            background:
              "radial-gradient(circle at top, rgba(96,165,250,0.18), transparent 55%), var(--card-bg)",
            boxShadow: "0 20px 45px rgba(15,23,42,0.55)",
            padding: "1.6rem 1.8rem 1.4rem",
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 999,
                background:
                  "radial-gradient(circle at 30% 0,#facc15,#fb923c,#fb7185)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                fontWeight: 800,
                color: "#0f172a",
                boxShadow: "0 0 26px rgba(250,204,21,0.6)",
              }}
            >
              {initials}
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                Edit profile
              </h1>
              <p
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  opacity: 0.75,
                }}
              >
                This information will appear on your Moventra profile.
              </p>
            </div>
          </header>

          {loading ? (
            <p style={{ fontSize: 14, opacity: 0.8 }}>Loading your profile…</p>
          ) : (
            <form onSubmit={handleSave}>
              {/* Name */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Name<span style={{ color: "#f97373" }}> *</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    borderRadius: 10,
                    border: "1px solid var(--card-border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 14,
                  }}
                />
              </div>

              {/* Location */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Your location
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Nürnberg, Germany"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    borderRadius: 10,
                    border: "1px solid var(--card-border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 14,
                  }}
                />
              </div>

              {/* Bio */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Write a little bit about yourself here"
                  style={{
                    width: "100%",
                    padding: "0.7rem 0.8rem",
                    borderRadius: 10,
                    border: "1px solid var(--card-border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 14,
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Toggles */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  marginBottom: 22,
                  fontSize: 13,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>Show Meetup-style groups</div>
                    <div style={{ opacity: 0.72 }}>
                      On your profile, people can see all groups you belong to.
                    </div>
                  </div>
                  <Toggle
                    checked={showGroups}
                    onChange={(v) => setShowGroups(v)}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>Show interests</div>
                    <div style={{ opacity: 0.72 }}>
                      On your profile, people can see your list of interests.
                    </div>
                  </div>
                  <Toggle
                    checked={showInterests}
                    onChange={(v) => setShowInterests(v)}
                  />
                </div>
              </div>

              {/* Error / success */}
              {error && (
                <p
                  style={{
                    marginBottom: 10,
                    fontSize: 13,
                    color: "#fca5a5",
                  }}
                >
                  {error}
                </p>
              )}
              {message && (
                <p
                  style={{
                    marginBottom: 10,
                    fontSize: 13,
                    color: "#bbf7d0",
                  }}
                >
                  {message}
                </p>
              )}

              {/* Save button */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  marginTop: 6,
                  padding: "0.7rem 1.6rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#6366f1,#38bdf8,#22c55e)",
                  color: "#020617",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: saving ? 0.8 : 1,
                }}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
