"use client";
import useRequireAuth from "../hooks/useRequireAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AvatarCanvas from "../components/AvatarCanvas";

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

// Avatar renkleri için tip
type Avatar = {
  id: number;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  skinColor: string;
  hatColor?: string | null;
  hasHat?: boolean | null;
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

  // Profil edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileCity, setProfileCity] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Avatar state (DB)
  const [avatar, setAvatar] = useState<Avatar | null>(null);

  // 🎨 Manuel renk seçimi için local state
  const [hairColorInput, setHairColorInput] = useState("#facc15");
  const [shirtColorInput, setShirtColorInput] = useState("#3b82f6");
  const [pantsColorInput, setPantsColorInput] = useState("#111827");
  const [skinColorInput, setSkinColorInput] = useState("#f3c9a8");
  const [hatColorInput, setHatColorInput] = useState("#ef4444");
  const [hasHatInput, setHasHatInput] = useState(false);

  // Avatar DB'den geldiğinde inputları senkronla
  useEffect(() => {
    if (avatar) {
      if (avatar.hairColor) setHairColorInput(avatar.hairColor);
      if (avatar.shirtColor) setShirtColorInput(avatar.shirtColor);
      if (avatar.pantsColor) setPantsColorInput(avatar.pantsColor);
      if (avatar.skinColor) setSkinColorInput(avatar.skinColor);
      if (avatar.hatColor) setHatColorInput(avatar.hatColor);
      setHasHatInput(!!avatar.hasHat);
    }
  }, [avatar]);

  // Avatar random renk paleti
  const colorPalette = [
    "#f97316",
    "#22c55e",
    "#3b82f6",
    "#eab308",
    "#ec4899",
    "#8b5cf6",
  ];

  function pickRandomColor() {
    const idx = Math.floor(Math.random() * colorPalette.length);
    return colorPalette[idx];
  }

  // RANDOMIZE AVATAR
  async function handleRandomizeAvatar() {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const newHair = pickRandomColor();
    const newShirt = pickRandomColor();
    const newPants = pickRandomColor();
    const newSkin = "#f3c9a8";
    const newHasHat = Math.random() < 0.6; // %60 şapkalı
    const newHat = newHasHat ? pickRandomColor() : hatColorInput;

    // Önce UI'da göster
    setHairColorInput(newHair);
    setShirtColorInput(newShirt);
    setPantsColorInput(newPants);
    setSkinColorInput(newSkin);
    setHasHatInput(newHasHat);
    setHatColorInput(newHat);

    try {
      const res = await fetch(`${API_URL}/avatar/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hairColor: newHair,
          shirtColor: newShirt,
          pantsColor: newPants,
          skinColor: newSkin,
          hatColor: newHasHat ? newHat : null,
          hasHat: newHasHat,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.avatar) {
        console.error(data);
        alert(data.error || "Could not update avatar");
        return;
      }

      setAvatar(data.avatar as Avatar);
    } catch (err) {
      console.error(err);
      alert("Could not update avatar");
    }
  }

  // MANUEL RENKLERİ KAYDET
  async function handleSaveAvatarColors() {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/avatar/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hairColor: hairColorInput,
          shirtColor: shirtColorInput,
          pantsColor: pantsColorInput,
          skinColor: skinColorInput,
          hatColor: hasHatInput ? hatColorInput : null,
          hasHat: hasHatInput,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.avatar) {
        console.error(data);
        alert(data.error || "Could not update avatar");
        return;
      }

      setAvatar(data.avatar as Avatar);
      alert("Avatar colors saved!");
    } catch (err) {
      console.error(err);
      alert("Could not update avatar");
    }
  }

  // Basit kıyafet preset’leri
  function applyOutfitPreset(preset: "casual" | "sporty" | "night") {
    if (preset === "casual") {
      setHairColorInput("#facc15");
      setShirtColorInput("#3b82f6");
      setPantsColorInput("#111827");
      setSkinColorInput("#f3c9a8");
      setHasHatInput(false);
    } else if (preset === "sporty") {
      setHairColorInput("#fb923c");
      setShirtColorInput("#22c55e");
      setPantsColorInput("#1d4ed8");
      setSkinColorInput("#f9d7aa");
      setHasHatInput(true);
      setHatColorInput("#22c55e");
    } else if (preset === "night") {
      setHairColorInput("#facc15");
      setShirtColorInput("#0f172a");
      setPantsColorInput("#020617");
      setSkinColorInput("#f3c9a8");
      setHasHatInput(true);
      setHatColorInput("#8b5cf6");
    }
  }

  function getToken() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("token");
  }

  // PROFİL + EVENTS + HOBBIES + AVATAR FETCH
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

        const [
          meRes,
          createdRes,
          joinedRes,
          hobbiesRes,
          myHobbiesRes,
          avatarRes,
        ] = await Promise.all([
          fetch(`${API_URL}/auth/me`, { headers }),
          fetch(`${API_URL}/events/my/created`, { headers }),
          fetch(`${API_URL}/events/my/joined`, { headers }),
          fetch(`${API_URL}/hobbies`, { headers }),
          fetch(`${API_URL}/hobbies/my`, { headers }),
          fetch(`${API_URL}/avatar/me`, { headers }),
        ]);

        if (!meRes.ok) {
          const data = await meRes.json().catch(() => ({}));
          throw new Error(data.error || "Could not load user");
        }
        const meJson = await meRes.json();
        setUser(meJson.user);

        setProfileName(meJson.user.name || "");
        setProfileCity(meJson.user.city || "");

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

        if (avatarRes.ok) {
          const avatarJson = await avatarRes.json().catch(() => null);
          if (avatarJson && avatarJson.avatar) {
            setAvatar(avatarJson.avatar as Avatar);
          }
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

  // HOBBY toggle
  function handleToggleHobby(id: number) {
    setSelectedHobbyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // HOBBY save
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

  // PROFİL SAVE
  async function handleSaveProfile() {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setSavingProfile(true);

      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileName,
          city: profileCity,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Could not update profile");
        return;
      }

      setUser(data.user);
      setEditingProfile(false);
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Could not update profile");
    } finally {
      setSavingProfile(false);
    }
  }

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
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "grid",
          gap: 24,
        }}
      >
        {/* USER CARD + AVATAR + EDIT MODE */}
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
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
              gap: 24,
              alignItems: "center",
            }}
          >
            {/* Sol: metin + butonlar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                {editingProfile ? (
                  <>
                    <label style={{ fontSize: 13, opacity: 0.85 }}>Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      style={{
                        width: "100%",
                        marginTop: 4,
                        marginBottom: 10,
                        padding: "0.4rem 0.7rem",
                        borderRadius: 8,
                        border: "1px solid #1f2937",
                        background: "rgba(15,23,42,0.9)",
                        color: "white",
                      }}
                    />

                    <label style={{ fontSize: 13, opacity: 0.85 }}>City</label>
                    <input
                      type="text"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      style={{
                        width: "100%",
                        marginTop: 4,
                        padding: "0.4rem 0.7rem",
                        borderRadius: 8,
                        border: "1px solid #1f2937",
                        background: "rgba(15,23,42,0.9)",
                        color: "white",
                      }}
                    />
                  </>
                ) : (
                  <>
                    <h1
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      {user.name}
                    </h1>
                    <p style={{ opacity: 0.9 }}>{user.email}</p>
                    {user.city && (
                      <p style={{ opacity: 0.85, marginTop: 4 }}>
                        City: {user.city}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
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

              {/* Edit butonları */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 12,
                  flexWrap: "wrap",
                }}
              >
                {editingProfile ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      style={{
                        padding: "0.4rem 0.9rem",
                        borderRadius: 999,
                        border: "none",
                        background:
                          "linear-gradient(135deg,#22c55e,#16a34a)",
                        color: "black",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {savingProfile ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingProfile(false);
                        setProfileName(user.name || "");
                        setProfileCity(user.city || "");
                      }}
                      style={{
                        padding: "0.4rem 0.9rem",
                        borderRadius: 999,
                        border: "1px solid #4b5563",
                        background: "transparent",
                        color: "#e5e7eb",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingProfile(true)}
                    style={{
                      padding: "0.4rem 0.9rem",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.8)",
                      background: "rgba(15,23,42,0.9)",
                      color: "white",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Edit profile
                  </button>
                )}
              </div>
            </div>

            {/* Sağ: 3D Avatar + Random + renk paneli */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <AvatarCanvas
                hairColor={hairColorInput}
                shirtColor={shirtColorInput}
                pantsColor={pantsColorInput}
                skinColor={skinColorInput}
                hatColor={hatColorInput}
                hasHat={hasHatInput}
              />

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  fontSize: 12,
                }}
              >
                <button
                  onClick={handleRandomizeAvatar}
                  style={{
                    padding: "0.35rem 0.9rem",
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.8)",
                    background: "rgba(15,23,42,0.9)",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Randomize
                </button>
                <button
                  onClick={handleSaveAvatarColors}
                  style={{
                    padding: "0.35rem 0.9rem",
                    borderRadius: 999,
                    border: "none",
                    background:
                      "linear-gradient(135deg,#22c55e,#16a34a)",
                    color: "black",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Save colors
                </button>
              </div>

              {/* Preset outfit butonları */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  fontSize: 11,
                }}
              >
                <button
                  onClick={() => applyOutfitPreset("casual")}
                  style={{
                    padding: "0.25rem 0.7rem",
                    borderRadius: 999,
                    border: "1px solid #1f2933",
                    background: "#020617",
                    color: "#e5e7eb",
                    cursor: "pointer",
                  }}
                >
                  Casual
                </button>
                <button
                  onClick={() => applyOutfitPreset("sporty")}
                  style={{
                    padding: "0.25rem 0.7rem",
                    borderRadius: 999,
                    border: "1px solid #1f2933",
                    background: "#020617",
                    color: "#e5e7eb",
                    cursor: "pointer",
                  }}
                >
                  Sporty
                </button>
                <button
                  onClick={() => applyOutfitPreset("night")}
                  style={{
                    padding: "0.25rem 0.7rem",
                    borderRadius: 999,
                    border: "1px solid #1f2933",
                    background: "#020617",
                    color: "#e5e7eb",
                    cursor: "pointer",
                  }}
                >
                  Night out
                </button>
              </div>

              {/* Renk + Şapka seçiciler */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  fontSize: 11,
                  backgroundColor: "rgba(15,23,42,0.85)",
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid #1f2933",
                  width: "100%",
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Hair</span>
                  <input
                    type="color"
                    value={hairColorInput}
                    onChange={(e) => setHairColorInput(e.target.value)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: "none",
                      padding: 0,
                    }}
                  />
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Shirt</span>
                  <input
                    type="color"
                    value={shirtColorInput}
                    onChange={(e) => setShirtColorInput(e.target.value)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: "none",
                      padding: 0,
                    }}
                  />
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Pants</span>
                  <input
                    type="color"
                    value={pantsColorInput}
                    onChange={(e) => setPantsColorInput(e.target.value)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: "none",
                      padding: 0,
                    }}
                  />
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Skin</span>
                  <input
                    type="color"
                    value={skinColorInput}
                    onChange={(e) => setSkinColorInput(e.target.value)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: "none",
                      padding: 0,
                    }}
                  />
                </label>

                {/* Şapka satırı: 2 sütunu kaplasın */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    gridColumn: "span 2",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={hasHatInput}
                      onChange={(e) => setHasHatInput(e.target.checked)}
                    />
                    <span>Hat</span>
                  </span>
                  <input
                    type="color"
                    value={hatColorInput}
                    onChange={(e) => setHatColorInput(e.target.value)}
                    disabled={!hasHatInput}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: "none",
                      padding: 0,
                      opacity: hasHatInput ? 1 : 0.4,
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* HOBBIES, CREATED, JOINED aşağıda aynı */}
        {/* ... senin önceki kodunla aynı, dokunmadım ... */}

        {/* My Hobbies */}
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
            These preferences are used when you select{" "}
            <strong>“Only my hobbies”</strong> on the Events or Explore pages.
          </p>
        </section>

        {/* My Created Events */}
        <section>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>My Created Events</h2>
          {createdEvents.length === 0 && (
            <p style={{ opacity: 0.7 }}>
              You have not created any events yet.
            </p>
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

        {/* My Joined Events */}
        <section>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>My Joined Events</h2>
          {joinedEvents.length === 0 && (
            <p style={{ opacity: 0.7 }}>
              You have not joined any events yet.
            </p>
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
