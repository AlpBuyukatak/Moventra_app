"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type User = {
  id: number;
  name: string;
  email: string;
  city?: string | null;
};

type Event = {
  id: number;
  title: string;
  city: string;
  dateTime: string;
};

type Hobby = {
  id: number;
  name: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);

  const [allHobbies, setAllHobbies] = useState<Hobby[]>([]);
  const [selectedHobbyIds, setSelectedHobbyIds] = useState<number[]>([]);
  const [savingHobbies, setSavingHobbies] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- PROFİL EDİT STATE’LERİ ----
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  function getToken() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("token");
  }

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        const headers = { Authorization: `Bearer ${token}` };

        const [meRes, createdRes, joinedRes, hobbiesRes, myHobbiesRes] =
          await Promise.all([
            fetch(`${API_URL}/auth/me`, { headers }),
            fetch(`${API_URL}/events/my/created`, { headers }),
            fetch(`${API_URL}/events/my/joined`, { headers }),
            fetch(`${API_URL}/hobbies`, { headers }),
            fetch(`${API_URL}/hobbies/my`, { headers }),
          ]);

        if (!meRes.ok) {
          const data = await meRes.json().catch(() => ({}));
          throw new Error(data.error || "Could not load user");
        }
        const meJson = await meRes.json();
        const meUser: User = meJson.user;
        setUser(meUser);

        // edit alanlarını doldur
        setNameInput(meUser.name);
        setCityInput(meUser.city ?? "");

        if (createdRes.ok) {
          const createdJson = await createdRes.json();
          setCreatedEvents(createdJson.events || []);
        }

        if (joinedRes.ok) {
          const joinedJson = await joinedRes.json();
          setJoinedEvents(joinedJson.events || []);
        }

        if (hobbiesRes.ok) {
          const hobbiesJson = await hobbiesRes.json();
          setAllHobbies(hobbiesJson.hobbies || hobbiesJson || []);
        }

        if (myHobbiesRes.ok) {
          const myHobbiesJson = await myHobbiesRes.json();
          const myHobbies: Hobby[] =
            myHobbiesJson.hobbies || myHobbiesJson || [];
          setSelectedHobbyIds(myHobbies.map((h) => h.id));
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  // ---------- HOBİLER ----------
  function handleToggleHobby(id: number) {
    setSelectedHobbyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSaveHobbies() {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setSavingHobbies(true);
      const res = await fetch(`${API_URL}/hobbies/my`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hobbyIds: selectedHobbyIds }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Could not save hobbies");
        return;
      }

      alert("Hobbies updated!");
    } catch (err) {
      console.error(err);
      alert("Could not save hobbies");
    } finally {
      setSavingHobbies(false);
    }
  }

  // ---------- PROFİL EDİT KISMI ----------
  function startEditingProfile() {
    if (!user) return;
    setNameInput(user.name);
    setCityInput(user.city ?? "");
    setEditingProfile(true);
  }

  function cancelEditingProfile() {
    if (user) {
      setNameInput(user.name);
      setCityInput(user.city ?? "");
    }
    setEditingProfile(false);
  }

  async function handleSaveProfile() {
    if (!user) return;

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setSavingProfile(true);

      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT", // backend tarafında buna göre route ekleyeceğiz
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nameInput.trim(),
          city: cityInput.trim() === "" ? null : cityInput.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Could not update profile");
        return;
      }

      // backend updatedUser döndürüyorsa:
      const updatedUser: User = data.user ?? {
        ...user,
        name: nameInput.trim(),
        city: cityInput.trim() === "" ? null : cityInput.trim(),
      };

      setUser(updatedUser);
      setEditingProfile(false);
      alert("Profile updated");
    } catch (err) {
      console.error(err);
      alert("Could not update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  // ---------- RENDER ----------
  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: 24,
          background: "#020617",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p>Loading profile...</p>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: 24,
          background: "#020617",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p style={{ color: "#f97373" }}>{error || "Profile not found"}</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 16px",
        background: "#020617",
        color: "white",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 24 }}>
        {/* USER CARD */}
        <section
          style={{
            padding: "1.5rem",
            borderRadius: "1rem",
            border: "1px solid #111827",
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,64,175,0.4))",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <div style={{ flex: 1 }}>
              {editingProfile ? (
                <>
                  <label style={{ display: "block", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, opacity: 0.8 }}>Name</span>
                    <input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      style={{
                        width: "100%",
                        marginTop: 4,
                        padding: "0.4rem 0.6rem",
                        borderRadius: 8,
                        border: "1px solid #1f2937",
                        backgroundColor: "#020617",
                        color: "white",
                      }}
                    />
                  </label>

                  <label style={{ display: "block", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, opacity: 0.8 }}>City</span>
                    <input
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      placeholder="e.g. Berlin"
                      style={{
                        width: "100%",
                        marginTop: 4,
                        padding: "0.4rem 0.6rem",
                        borderRadius: 8,
                        border: "1px solid #1f2937",
                        backgroundColor: "#020617",
                        color: "white",
                      }}
                    />
                  </label>
                </>
              ) : (
                <>
                  <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                    {user.name}
                  </h1>
                  <p style={{ opacity: 0.9 }}>{user.email}</p>
                  {user.city && (
                    <p style={{ opacity: 0.85, marginTop: 4 }}>City: {user.city}</p>
                  )}
                </>
              )}

              <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
                <div
                  style={{
                    padding: "0.5rem 0.9rem",
                    borderRadius: 999,
                    backgroundColor: "#0f172a",
                    border: "1px solid #1f2933",
                    fontSize: 14,
                  }}
                >
                  Created events: <strong>{createdEvents.length}</strong>
                </div>
                <div
                  style={{
                    padding: "0.5rem 0.9rem",
                    borderRadius: 999,
                    backgroundColor: "#0f172a",
                    border: "1px solid #1f2933",
                    fontSize: 14,
                  }}
                >
                  Joined events: <strong>{joinedEvents.length}</strong>
                </div>
              </div>
            </div>

            {/* Edit / Save Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {editingProfile ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    style={{
                      padding: "0.4rem 0.9rem",
                      borderRadius: 999,
                      border: "none",
                      backgroundColor: "#22c55e",
                      color: "black",
                      fontSize: 14,
                      cursor: "pointer",
                      opacity: savingProfile ? 0.8 : 1,
                    }}
                  >
                    {savingProfile ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelEditingProfile}
                    type="button"
                    style={{
                      padding: "0.4rem 0.9rem",
                      borderRadius: 999,
                      border: "1px solid #4b5563",
                      backgroundColor: "transparent",
                      color: "#e5e7eb",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={startEditingProfile}
                  style={{
                    padding: "0.4rem 0.9rem",
                    borderRadius: 999,
                    border: "1px solid #2563eb",
                    backgroundColor: "transparent",
                    color: "#bfdbfe",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Edit profile
                </button>
              )}
            </div>
          </div>
        </section>

        {/* MY HOBBIES */}
        <section
          style={{
            padding: "1.2rem 1.3rem",
            borderRadius: "1rem",
            border: "1px solid #111827",
            backgroundColor: "#020617",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <h2 style={{ fontSize: 20 }}>My Hobbies</h2>
            <button
              onClick={handleSaveHobbies}
              disabled={savingHobbies}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: 999,
                border: "none",
                backgroundColor: "#2563eb",
                color: "white",
                fontSize: 14,
                cursor: "pointer",
                opacity: savingHobbies ? 0.85 : 1,
              }}
            >
              {savingHobbies ? "Saving..." : "Save"}
            </button>
          </div>

          {allHobbies.length === 0 && (
            <p style={{ opacity: 0.7 }}>No hobbies found.</p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 8,
              marginTop: 8,
            }}
          >
            {allHobbies.map((hobby) => {
              const checked = selectedHobbyIds.includes(hobby.id);
              return (
                <label
                  key={hobby.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 14,
                    padding: "0.35rem 0.6rem",
                    borderRadius: 999,
                    border: "1px solid #1f2933",
                    backgroundColor: checked ? "#111827" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleHobby(hobby.id)}
                  />
                  {hobby.name}
                </label>
              );
            })}
          </div>

          <p style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>
            These preferences are used on the{" "}
            <strong>Events</strong> and <strong>Explore</strong> pages.
          </p>
        </section>

        {/* CREATED EVENTS */}
        <section>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>My Created Events</h2>
          {createdEvents.length === 0 && (
            <p style={{ opacity: 0.7 }}>You have not created any events yet.</p>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {createdEvents.map((ev) => (
              <button
                key={ev.id}
                onClick={() => router.push(`/events/${ev.id}`)}
                style={{
                  textAlign: "left",
                  padding: "0.9rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #111827",
                  backgroundColor: "#020617",
                  cursor: "pointer",
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{ev.title}</h3>
                <p style={{ fontSize: 14, opacity: 0.85 }}>
                  {ev.city} • {new Date(ev.dateTime).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* JOINED EVENTS */}
        <section>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>My Joined Events</h2>
          {joinedEvents.length === 0 && (
            <p style={{ opacity: 0.7 }}>You have not joined any events yet.</p>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {joinedEvents.map((ev) => (
              <button
                key={ev.id}
                onClick={() => router.push(`/events/${ev.id}`)}
                style={{
                  textAlign: "left",
                  padding: "0.9rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #111827",
                  backgroundColor: "#020617",
                  cursor: "pointer",
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{ev.title}</h3>
                <p style={{ fontSize: 14, opacity: 0.85 }}>
                  {ev.city} • {new Date(ev.dateTime).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
