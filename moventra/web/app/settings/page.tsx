"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import CityPickerModal, {
  LocationSelection,
} from "../components/CityPickerModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type User = {
  id: number;
  name: string;
  email: string;
  city?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  bio?: string | null;
  showGroups?: boolean;
  showInterests?: boolean;
};

type Tab =
  | "profile"
  | "account"
  | "email"
  | "privacy"
  | "social"
  | "interests"
  | "payments";

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

const genderOptions = ["Female", "Male", "Non-binary", "Prefer not to say"];

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "profile";

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // Profil verisi
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [cityLabel, setCityLabel] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [showGroups, setShowGroups] = useState(true);
  const [showInterests, setShowInterests] = useState(true);

  // Doğum tarihi (3 select)
  const [birthDay, setBirthDay] = useState<string>("");
  const [birthMonth, setBirthMonth] = useState<string>("");
  const [birthYear, setBirthYear] = useState<string>("");

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Location modal
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Account management – sadece front-end state
  const [language, setLanguage] = useState("English");
  const [timeZone, setTimeZone] = useState("system");

  // Email updates – sadece front-end state
  const [emailPrefs, setEmailPrefs] = useState<Record<string, boolean>>({
    messages: false,
    replies: false,
    suggested: false,
    newGroups: false,
    updatesHQ: false,
    surveys: false,
    ical: false,
    proNetwork: false,
    connections: false,
  });

  // Privacy – sadece front-end state
  const [contactPermission, setContactPermission] =
    useState<"organizers" | "groups" | "anyone">("anyone");

  // ---------------- FETCH PROFILE ----------------

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoadingProfile(false);
      return;
    }

    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to load profile");

        const u: User = data.user;
        setUser(u);
        setName(u.name || "");
        setCityLabel(u.city || "");
        setGender(u.gender || null);
        setBio(u.bio || "");
        setShowGroups(u.showGroups ?? true);
        setShowInterests(u.showInterests ?? true);

        if (u.birthDate) {
          const d = new Date(u.birthDate);
          setBirthDay(String(d.getDate()));
          setBirthMonth(String(d.getMonth() + 1)); // 1–12
          setBirthYear(String(d.getFullYear()));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchMe();
  }, []);

  // Doğum tarihi için dropdown seçenekleri
  const dayOptions = useMemo(
    () => Array.from({ length: 31 }, (_, i) => String(i + 1)),
    []
  );

  const monthOptions = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let y = currentYear - 100; y <= currentYear - 13; y++) {
      years.push(String(y));
    }
    return years.reverse();
  }, []);

  // BirthDate -> ISO string ya da null
  function buildBirthDate(): string | null {
    if (!birthDay || !birthMonth || !birthYear) return null;
    const day = birthDay.padStart(2, "0");
    const month = birthMonth.padStart(2, "0");
    return `${birthYear}-${month}-${day}T00:00:00.000Z`;
  }

  // ---------------- SAVE PROFILE ----------------

  async function handleSaveProfile() {
    if (!user) return;
    const token = getToken();
    if (!token) return;

    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const birthDateIso = buildBirthDate();

      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          city: cityLabel.trim() || null,
          birthDate: birthDateIso,
          gender: gender,
          bio: bio.trim() || null,
          showGroups,
          showInterests,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      setProfileMessage("Profile updated.");
      setUser(data.user);
    } catch (err: any) {
      console.error(err);
      setProfileMessage(err.message || "Could not save profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  // ---------------- RENDER HELPERS ----------------

  function renderSidebarItem(tab: Tab, label: string, badge?: string) {
    const isActive = activeTab === tab;
    return (
      <button
        type="button"
        onClick={() => setActiveTab(tab)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "0.55rem 1rem",
          borderRadius: 999,
          border: "none",
          backgroundColor: isActive
            ? "rgba(59,130,246,0.15)"
            : "transparent",
          color: isActive ? "#0f172a" : "rgba(15,23,42,0.85)",
          fontWeight: isActive ? 600 : 400,
          fontSize: 14,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>{label}</span>
        {badge && (
          <span
            style={{
              fontSize: 11,
              opacity: 0.7,
            }}
          >
            {badge}
          </span>
        )}
      </button>
    );
  }

  function renderEditProfileTab() {
    const firstLetter = user?.name?.charAt(0).toUpperCase() || "A";

    return (
      <div
        style={{
          borderRadius: 28,
          background:
            "radial-gradient(circle at top,#dbeafe,#ffffff 55%)",
          border: "1px solid rgba(148,163,184,0.6)",
          boxShadow: "0 22px 55px rgba(15,23,42,0.32)",
          padding: "1.6rem 1.9rem 1.9rem",
          color: "#020617",
        }}
      >
        {/* Başlık + avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              background:
                "conic-gradient(from 140deg,#38bdf8,#6366f1,#f97316,#22c55e,#38bdf8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 18px rgba(56,189,248,0.8)",
            }}
          >
            <span
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              {firstLetter}
            </span>
          </div>

          <div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Edit profile
            </h1>
            <p
              style={{
                fontSize: 13,
                opacity: 0.8,
                maxWidth: 420,
              }}
            >
              Update your basic info. We use this to personalise events
              and recommendations for you.
            </p>
          </div>
        </div>

        {/* Form alanları */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Name */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                borderRadius: 10,
                border: "1px solid var(--card-border)",
                padding: "0.7rem 0.9rem",
                fontSize: 14,
                backgroundColor: "#fdfaf5",
                color: "#020617",
              }}
              placeholder="Your name"
            />
          </div>

          {/* Location */}
          <div>
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
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={cityLabel}
                readOnly
                placeholder="Select city"
                style={{
                  flex: 1,
                  borderRadius: 10,
                  border: "1px solid var(--card-border)",
                  padding: "0.7rem 0.9rem",
                  fontSize: 14,
                  backgroundColor: "#fdfaf5",
                  cursor: "default",
                  color: "#020617",
                }}
              />
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                style={{
                  padding: "0.55rem 0.9rem",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.9)",
                  backgroundColor: "transparent",
                  fontSize: 12,
                  cursor: "pointer",
                  color: "#0f172a",
                }}
              >
                Edit address
              </button>
            </div>
            <p
              style={{
                fontSize: 11,
                opacity: 0.7,
                marginTop: 4,
              }}
            >
              We&apos;ll use this to show you nearby events.
            </p>
          </div>

          {/* Birth date – üç dropdown */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Birth date
            </label>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <select
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                style={dateSelectStyle}
              >
                <option value="">Day</option>
                {dayOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
                style={dateSelectStyle}
              >
                <option value="">Month</option>
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                style={dateSelectStyle}
              >
                <option value="">Year</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <p
              style={{
                fontSize: 11,
                opacity: 0.7,
                marginTop: 4,
              }}
            >
              We&apos;ll never show your exact birthday publicly.
              It&apos;s only used for age-appropriate recommendations.
            </p>
          </div>

          {/* Gender */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Gender
            </label>
            <select
              value={gender || ""}
              onChange={(e) =>
                setGender(e.target.value ? e.target.value : null)
              }
              style={{
                width: "100%",
                borderRadius: 10,
                border: "1px solid var(--card-border)",
                padding: "0.7rem 0.9rem",
                fontSize: 14,
                backgroundColor: "#fdfaf5",
                color: "#020617",
              }}
            >
              <option value="">Prefer not to say</option>
              {genderOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Bio */}
          <div>
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
              placeholder="Write a little bit about yourself here"
              rows={4}
              style={{
                width: "100%",
                borderRadius: 10,
                border: "1px solid var(--card-border)",
                padding: "0.7rem 0.9rem",
                fontSize: 14,
                backgroundColor: "#fdfaf5",
                resize: "vertical",
                color: "#020617",
              }}
            />
          </div>

          {/* Toggles */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 12,
              marginTop: 4,
            }}
          >
            <ToggleCard
              label="Show Meetup-style groups"
              description="On your profile, people can see all groups you belong to."
              checked={showGroups}
              onChange={setShowGroups}
            />
            <ToggleCard
              label="Show interests"
              description="On your profile, people can see your list of interests."
              checked={showInterests}
              onChange={setShowInterests}
            />
          </div>

          {/* Kaydet butonu */}
          <div
            style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={savingProfile}
              style={{
                padding: "0.75rem 1.6rem",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(135deg,#22c55e,#16a34a,#15803d)",
                color: "#f9fafb",
                fontSize: 14,
                fontWeight: 700,
                cursor: savingProfile ? "wait" : "pointer",
                boxShadow: "0 14px 32px rgba(22,163,74,0.6)",
              }}
            >
              {savingProfile ? "Saving…" : "Save changes"}
            </button>
            {profileMessage && (
              <span style={{ fontSize: 12, opacity: 0.8 }}>
                {profileMessage}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderAccountTab() {
    return (
      <div style={settingsCardStyle}>
        <h1 style={settingsTitleStyle}>Account management</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={fieldLabelStyle}>Your email</label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              style={readOnlyInputStyle}
            />
          </div>

          <div>
            <label style={fieldLabelStyle}>Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={inputStyle}
            >
              <option>English</option>
              <option>Deutsch</option>
              <option>Türkçe</option>
            </select>
          </div>

          <div>
            <label style={fieldLabelStyle}>Primary time zone</label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              style={inputStyle}
            >
              <option value="system">
                System time (default) – use device time zone
              </option>
              <option value="cet">Central European Time (CET)</option>
              <option value="gmt">Greenwich Mean Time (GMT)</option>
            </select>
            <p style={helperTextStyle}>
              Your choice will influence how event times are displayed. If
              you want the time zone to be determined by your location,
              select &quot;System time (default)&quot;.
            </p>
          </div>

          <hr style={dividerStyle} />

          <section
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <h2 style={sectionTitleStyle}>Change your password</h2>
            <p style={helperTextStyle}>
              When you change your password, you&apos;ll be automatically
              signed out from your other sessions.
            </p>
            <button type="button" style={linkButtonStyle}>
              Change password
            </button>
          </section>

          <hr style={dividerStyle} />

          <section
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <h2 style={sectionTitleStyle}>Deactivate your account</h2>
            <p style={helperTextStyle}>
              If you decide to leave Moventra, you&apos;ll need to create a
              new account to come back.
            </p>
            <button type="button" style={linkButtonStyle}>
              Deactivate account
            </button>
          </section>

          <hr style={dividerStyle} />

          <section
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <h2 style={sectionTitleStyle}>Data &amp; GDPR requests</h2>
            <p style={helperTextStyle}>
              Submit requests for data portability and erasure in accordance
              with GDPR regulations.
            </p>
            <button type="button" style={linkButtonStyle}>
              Submit GDPR request
            </button>
          </section>
        </div>
      </div>
    );
  }

  function renderEmailTab() {
    const toggle = (key: keyof typeof emailPrefs) => {
      setEmailPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const row = (
      key: keyof typeof emailPrefs,
      title: string,
      description: string
    ) => (
      <div
        key={key}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "0.7rem 0",
          borderBottom: "1px solid rgba(148,163,184,0.3)",
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{title}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{description}</div>
        </div>
        <Switch checked={emailPrefs[key]} onChange={() => toggle(key)} />
      </div>
    );

    return (
      <div style={settingsCardStyle}>
        <h1 style={settingsTitleStyle}>Email updates</h1>

        <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 18 }}>
          Select what email updates you get about your activity, events and
          groups. When certain push notifications are on, we can skip
          sending the same info via email.
        </p>

        <section style={{ marginBottom: 18 }}>
          <h2 style={sectionTitleStyle}>Updates from Moventra</h2>
          <p style={helperTextStyle}>
            Control what types of email notifications from Moventra you get.
          </p>

          <div style={{ marginTop: 8 }}>
            {row(
              "messages",
              "Messages",
              "Email me when someone sends me a message."
            )}
            {row(
              "replies",
              "Replies to my comments",
              "Email me when someone replies to my comments."
            )}
            {row(
              "suggested",
              "Suggested events",
              "Weekly highlights based on your groups and interests."
            )}
            {row(
              "newGroups",
              "New Moventra groups",
              "Tell me about new groups that match my interests."
            )}
            {row(
              "updatesHQ",
              "Updates from Moventra HQ",
              "Tell me about new features and important Moventra news."
            )}
            {row(
              "surveys",
              "Moventra surveys",
              "Ask me things that could make Moventra better."
            )}
            {row(
              "ical",
              "iCal attachments",
              "Send me email reminders with calendar attachments."
            )}
            {row(
              "proNetwork",
              "Updates from Pro networks",
              "Receive updates from my Pro groups."
            )}
            {row(
              "connections",
              "Connections",
              "Notify me about new connections on Moventra."
            )}
          </div>
        </section>

        <section
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px solid rgba(148,163,184,0.4)",
          }}
        >
          <h2 style={sectionTitleStyle}>Turn off all email updates</h2>
          <p style={helperTextStyle}>
            We&apos;ll stop sending you email updates. You may still receive
            certain communications, such as legal announcements and
            transactional updates.
          </p>
          <button type="button" style={outlineButtonStyle}>
            Turn off
          </button>
        </section>
      </div>
    );
  }

  function renderPrivacyTab() {
    const labelFor = {
      organizers: "Organizers only",
      groups: "Members of my groups only",
      anyone: "Anyone on Moventra",
    }[contactPermission];

    return (
      <div style={settingsCardStyle}>
        <h1 style={settingsTitleStyle}>Privacy</h1>

        <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 18 }}>
          Control who can contact you and what others can see on your public
          profile.
        </p>

        {/* Contacts */}
        <section style={{ marginBottom: 26 }}>
          <h2 style={sectionTitleStyle}>Contacts</h2>
          <p style={helperTextStyle}>
            Who can contact you on Moventra? You can adjust this at any time.
          </p>

          <div style={{ marginTop: 10, position: "relative", maxWidth: 260 }}>
            <details style={{ position: "relative" }}>
              <summary
                style={{
                  listStyle: "none",
                  cursor: "pointer",
                  borderRadius: 999,
                  border: "1px solid var(--card-border)",
                  padding: "0.6rem 0.9rem",
                  fontSize: 14,
                  backgroundColor: "#fdfaf5",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#020617",
                }}
              >
                <span>{labelFor}</span>
                <span style={{ opacity: 0.7 }}>▾</span>
              </summary>
              <div
                style={{
                  position: "absolute",
                  top: "110%",
                  left: 0,
                  right: 0,
                  borderRadius: 14,
                  backgroundColor: "#f9fafb",
                  border: "1px solid var(--card-border)",
                  boxShadow: "0 18px 40px rgba(15,23,42,0.4)",
                  zIndex: 20,
                  color: "#020617",
                }}
              >
                {(
                  [
                    ["organizers", "Organizers only"],
                    ["groups", "Member of my groups only"],
                    ["anyone", "Anyone on Moventra"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setContactPermission(value);
                      // <details> kapansın
                      document.activeElement &&
                        (document.activeElement as HTMLElement).blur();
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                      background: "transparent",
                      padding: "0.55rem 0.85rem",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </details>
          </div>
        </section>

        {/* Edit profile kısa linki */}
        <section>
          <h2 style={sectionTitleStyle}>Public profile</h2>
          <p style={helperTextStyle}>
            Control what others are able to see on your public profile.
          </p>
          <button
            type="button"
            style={linkButtonStyle}
            onClick={() => setActiveTab("profile")}
          >
            Edit profile
          </button>
        </section>
      </div>
    );
  }

  // ---------------- MAIN RENDER ----------------

  return (
    <main
      id="settings"
      style={{
        minHeight: "100vh",
        padding: "40px 16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0,0.95fr) minmax(0,2fr)",
          gap: 28,
          alignItems: "flex-start",
        }}
      >
        {/* SOL MENU */}
        <aside
          style={{
            borderRadius: 28,
            background:
              "radial-gradient(circle at top,#e0edff,#ffffff 55%)",
            border: "1px solid rgba(148,163,184,0.5)",
            boxShadow: "0 18px 46px rgba(15,23,42,0.25)",
            padding: "1.4rem 1.4rem 1.6rem",
            color: "#020617",
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            Settings
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {renderSidebarItem("profile", "Edit profile")}
            {renderSidebarItem("account", "Account management")}
            {renderSidebarItem("email", "Email updates")}
            {renderSidebarItem("privacy", "Privacy")}
            {renderSidebarItem("social", "Social media", "soon")}
            {renderSidebarItem("interests", "Interests", "soon")}
            {renderSidebarItem("payments", "Payment methods", "soon")}
          </div>
        </aside>

        {/* SAĞ ANA İÇERİK */}
        <section>
          {loadingProfile && activeTab === "profile" ? (
            <p style={{ opacity: 0.8 }}>Loading profile…</p>
          ) : activeTab === "profile" ? (
            renderEditProfileTab()
          ) : activeTab === "account" ? (
            renderAccountTab()
          ) : activeTab === "email" ? (
            renderEmailTab()
          ) : activeTab === "privacy" ? (
            renderPrivacyTab()
          ) : (
            <div style={settingsCardStyle}>
              <h1 style={settingsTitleStyle}>Coming soon</h1>
              <p style={{ fontSize: 13, opacity: 0.8 }}>
                This settings section will be available in a future update.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Şehir seçimi için modal */}
      <CityPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSelect={(loc: LocationSelection) => {
          const label =
            loc.stateName && loc.countryName
              ? `${loc.stateName}, ${loc.countryName}`
              : loc.stateName || loc.countryName;
          setCityLabel(label || "");
          setLocationModalOpen(false);
        }}
      />
    </main>
  );
}

// ---------------- SMALL COMPONENTS & STYLES ----------------

const dateSelectStyle: React.CSSProperties = {
  minWidth: 90,
  borderRadius: 999,
  border: "1px solid var(--card-border)",
  padding: "0.5rem 0.8rem",
  fontSize: 14,
  backgroundColor: "#fdfaf5",
  color: "#020617",
};

const settingsCardStyle: React.CSSProperties = {
  borderRadius: 28,
  background: "radial-gradient(circle at top,#e5f0ff,#ffffff 55%)",
  border: "1px solid rgba(148,163,184,0.6)",
  boxShadow: "0 22px 55px rgba(15,23,42,0.3)",
  padding: "1.6rem 1.9rem 1.9rem",
  color: "#020617",
};

const settingsTitleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  marginBottom: 14,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  marginBottom: 4,
};

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 6,
};

const helperTextStyle: React.CSSProperties = {
  fontSize: 11,
  opacity: 0.75,
};

const dividerStyle: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid rgba(148,163,184,0.4)",
  margin: "1rem 0",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid var(--card-border)",
  padding: "0.7rem 0.9rem",
  fontSize: 14,
  backgroundColor: "#fdfaf5",
  color: "#020617",
};

const readOnlyInputStyle: React.CSSProperties = {
  ...inputStyle,
  backgroundColor: "#e5e7eb",
  cursor: "default",
};

const linkButtonStyle: React.CSSProperties = {
  border: "none",
  background: "none",
  padding: 0,
  fontSize: 13,
  color: "#2563eb",
  cursor: "pointer",
};

const outlineButtonStyle: React.CSSProperties = {
  marginTop: 10,
  padding: "0.55rem 1.1rem",
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.9)",
  backgroundColor: "transparent",
  fontSize: 13,
  cursor: "pointer",
  color: "#0f172a",
};

type ToggleProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
};

function ToggleCard({ label, description, checked, onChange }: ToggleProps) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid rgba(148,163,184,0.7)",
        backgroundColor: "rgba(255,255,255,0.9)",
        padding: "0.7rem 0.9rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        color: "#020617",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11, opacity: 0.75 }}>{description}</div>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

type SwitchProps = {
  checked: boolean;
  onChange: (v: boolean) => void;
};

function Switch({ checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 38,
        height: 22,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        padding: 2,
        background: checked ? "#22c55e" : "rgba(148,163,184,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: checked ? "flex-end" : "flex-start",
        transition: "background 150ms ease, transform 150ms ease",
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 6px rgba(15,23,42,0.5)",
        }}
      />
    </button>
  );
}
