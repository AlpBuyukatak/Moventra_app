"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type MeUser = {
  id: number;
  name?: string | null;
  onboardingCompleted?: boolean;
  birthDate?: string | null;
  gender?: string | null;
  planType?: string | null;
};

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

type Step = "interests" | "name" | "birthdate" | "gender" | "plan";

// 🔹 Onboarding ilgi alanları – genel kategori + alt hobi isimleri
// Alt hobi isimleri, Prisma'daki Hobby.name ile aynı olacak şekilde seçildi.
type InterestCategory = {
  id: string;
  label: string;
  subHobbies: string[];
};

const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    id: "sports_fitness",
    label: "Sports & fitness",
    subHobbies: ["Running", "Gym / Fitness", "Cycling", "Hiking", "Yoga"],
  },
  {
    id: "board_games",
    label: "Board games & chess",
    subHobbies: [
      "Board Games",
      "Strategy Board Games",
      "Party Board Games",
      "Chess Club",
      "Puzzle & Brain Games",
    ],
  },
  {
    id: "gaming",
    label: "Video games & esports",
    subHobbies: [
      "Casual Gaming",
      "Esports",
      "LAN Party",
      "Mobile Games Meetup",
    ],
  },
  {
    id: "tech_coding",
    label: "Tech & coding",
    subHobbies: [
      "Coding Meetup",
      "Web Development Meetup",
      "AI & Machine Learning Meetup",
      "Data Science Meetup",
    ],
  },
  {
    id: "study",
    label: "Study & co-learning",
    subHobbies: [
      "Study Group - General",
      "Study Group - Programming",
      "Deep Work Session",
      "Online Study Group",
    ],
  },
  {
    id: "languages",
    label: "Language & culture",
    subHobbies: [
      "Language Exchange - English",
      "Language Exchange - German",
      "Language Exchange - Turkish",
      "Coffee & Language Exchange",
      "Book Club",
    ],
  },
  {
    id: "art_photo",
    label: "Art & photography",
    subHobbies: [
      "Drawing",
      "Digital Art",
      "Photography",
      "Street Photography Walk",
      "Content Creation Meetup",
    ],
  },
  {
    id: "music",
    label: "Music & performance",
    subHobbies: [
      "Jam Session",
      "Guitar Circle",
      "Open Mic Night",
      "Karaoke Night",
    ],
  },
  {
    id: "food",
    label: "Food & cooking",
    subHobbies: [
      "Cooking Class",
      "Baking",
      "Street Food Tour",
      "Restaurant Discovery Group",
    ],
  },
  {
    id: "travel",
    label: "Travel & exploration",
    subHobbies: [
      "City Walking Tour",
      "Weekend Trip Planning",
      "Backpacking Meetup",
      "Travel Photo Walk",
    ],
  },
  {
    id: "wellness",
    label: "Wellness & mindfulness",
    subHobbies: [
      "Meditation",
      "Yoga & Meditation",
      "Morning Routine Club",
      "Stress Relief Walk",
    ],
  },
  {
    id: "volunteering",
    label: "Volunteering & community",
    subHobbies: [
      "Volunteering & Charity",
      "Beach Cleanup",
      "Animal Shelter Volunteering",
      "Climate Action Meetup",
    ],
  },
];

const STEPS: Step[] = ["interests", "name", "birthdate", "gender", "plan"];

// 🔐 Onboarding ilerleme durumu localStorage key
const ONBOARDING_STORAGE_KEY = "moventra_onboarding_state_v1";

type OnboardingState = {
  step: Step;
  // Burada tutulanlar ALT hobiler (ör: "Running", "Chess Club")
  selectedInterests: string[];
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string | null;
};

function loadOnboardingState(): OnboardingState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return null;
  }
}

function saveOnboardingState(state: OnboardingState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessiz geç
  }
}

function clearOnboardingState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

// 13 yaşından büyükler için max doğum tarihi (bugünden 13 yıl önce)
function getMaxBirthdateFor13(): string {
  const today = new Date();
  const cutoff = new Date(
    today.getFullYear() - 13,
    today.getMonth(),
    today.getDate()
  );
  const yyyy = cutoff.getFullYear();
  const mm = String(cutoff.getMonth() + 1).padStart(2, "0");
  const dd = String(cutoff.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function OnboardingPage() {
  const router = useRouter();

  const [user, setUser] = useState<MeUser | null>(null);
  const [step, setStep] = useState<Step>("interests");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ALT hobi isimleri (ör: "Running", "Board Games")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [birthDate, setBirthDate] = useState("");

  // custom date picker için parçalı state
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const [gender, setGender] = useState<string | null>(null);

  // Hangi kategori açık?
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(
    INTEREST_CATEGORIES[0]?.id ?? null
  );

  const currentIndex = STEPS.indexOf(step) + 1;
  const totalSteps = STEPS.length;
  const progressPercent = (currentIndex / totalSteps) * 100;

  const amberGradient = "linear-gradient(135deg,#ffdfae,#ffecc7)";

  // parçalı tarihten ISO date üret
  function updateBirthDateFromParts(
    nextDay: string,
    nextMonth: string,
    nextYear: string
  ) {
    setBirthDay(nextDay);
    setBirthMonth(nextMonth);
    setBirthYear(nextYear);

    if (nextDay && nextMonth && nextYear) {
      setBirthDate(`${nextYear}-${nextMonth}-${nextDay}`);
    } else {
      setBirthDate("");
    }
  }

  // 🔄 Kullanıcı + onboarding durumu yükle
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login?from=/onboarding");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("token");
          }
          router.replace("/login?from=/onboarding");
          return;
        }

        const data = await res.json().catch(() => ({}));
        const u: MeUser | undefined = data.user;

        if (!u) {
          router.replace("/login?from=/onboarding");
          return;
        }

        // Onboarding zaten bittiyse bu sayfaya giremesin
        if (u.onboardingCompleted) {
          clearOnboardingState();
          router.replace("/events");
          return;
        }

        const saved = loadOnboardingState();

        let initialStep: Step = "interests";
        let initialBirthDate = u.birthDate ? u.birthDate.slice(0, 10) : "";
        let initialGender = u.gender ?? null;
        let initialInterests: string[] = [];
        let initialFirstName = "";
        let initialLastName = "";

        if (saved) {
          initialStep = saved.step;
          initialInterests = saved.selectedInterests || [];
          if (saved.birthDate) initialBirthDate = saved.birthDate;
          if (saved.gender) initialGender = saved.gender;
          initialFirstName = saved.firstName || "";
          initialLastName = saved.lastName || "";
        } else if (u.name) {
          const parts = u.name.trim().split(" ");
          initialFirstName = parts[0] || "";
          initialLastName = parts.slice(1).join(" ") || "";
        }

        setUser(u);
        setSelectedInterests(initialInterests);
        setFirstName(initialFirstName);
        setLastName(initialLastName);
        setGender(initialGender);

        setBirthDate(initialBirthDate);
        if (initialBirthDate) {
          const [yyyy, mm, dd] = initialBirthDate.split("-");
          setBirthYear(yyyy || "");
          setBirthMonth(mm || "");
          setBirthDay(dd || "");
        }

        setStep(initialStep);
      } catch (err) {
        console.error(err);
        setError("Could not load your profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // 🧠 Her değişiklikte ilerleme durumunu kaydet
  useEffect(() => {
    if (!user || user.onboardingCompleted) {
      clearOnboardingState();
      return;
    }

    saveOnboardingState({
      step,
      selectedInterests,
      firstName,
      lastName,
      birthDate,
      gender,
    });
  }, [user, step, selectedInterests, firstName, lastName, birthDate, gender]);

  // Sekme kapatırken uyarı – onboarding bitmediyse
  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  function toggleSubInterest(hobbyName: string) {
    setSelectedInterests((prev) =>
      prev.includes(hobbyName)
        ? prev.filter((t) => t !== hobbyName)
        : [...prev, hobbyName]
    );
  }

  function goToStep(next: Step) {
    setError(null);
    setStep(next);

    // Step değişince sayfanın en üstüne kaydır
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function saveInterestsToBackend(interests: string[]) {
    const token = getToken();
    if (!token) return;

    try {
      await fetch(`${API_URL}/hobbies/save-from-onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // backend’de interests: string[] alıp UserHobby'ye map edebilirsin
          interests,
        }),
      });
    } catch (err) {
      console.error("save interests failed (can be ignored):", err);
    }
  }

  // ✅ En az 2 alt hobi zorunlu, Skip yok
  async function handleInterestsContinue() {
    setError(null);
    if (selectedInterests.length < 2) {
      setError("Please select at least two interests.");
      return;
    }

    setSaving(true);
    await saveInterestsToBackend(selectedInterests);
    setSaving(false);

    goToStep("name");
  }

  async function handleNameContinue() {
    setError(null);
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst || !trimmedLast) {
      setError("Please enter both your first and last name.");
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace("/login?from=/onboarding");
      return;
    }

    try {
      setSaving(true);
      const fullName = `${trimmedFirst} ${trimmedLast}`;
      await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: fullName }),
      });
      goToStep("birthdate");
    } catch (err) {
      console.error(err);
      setError("Could not save your name.");
    } finally {
      setSaving(false);
    }
  }

  async function handleBirthdateContinue() {
    setError(null);
    if (!birthDate) {
      setError("Please enter your date of birth.");
      return;
    }

    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) {
      setError("Please enter a valid date.");
      return;
    }

    const max13 = new Date(getMaxBirthdateFor13());
    if (birth > max13) {
      setError("You must be at least 13 years old to use Moventra.");
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace("/login?from=/onboarding");
      return;
    }

    try {
      setSaving(true);
      await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ birthDate }),
      });
      goToStep("gender");
    } catch (err) {
      console.error(err);
      setError("Could not save your birth date.");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenderContinue() {
    setError(null);
    if (!gender) {
      setError("Please choose an option.");
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace("/login?from=/onboarding");
      return;
    }

    try {
      setSaving(true);
      await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gender }),
      });
      goToStep("plan");
    } catch (err) {
      console.error(err);
      setError("Could not save your answer.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFinish() {
    setError(null);

    const token = getToken();
    if (!token) {
      router.replace("/login?from=/onboarding");
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
          planType: "free",
          onboardingCompleted: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not finish onboarding.");
      }

      clearOnboardingState();
      router.replace("/events");
    } catch (err) {
      console.error(err);
      setError("Could not finish onboarding.");
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    setError(null);
    const idx = STEPS.indexOf(step);
    if (idx <= 0) return;
    goToStep(STEPS[idx - 1]);
  }

  // custom date picker seçenekleri
  const dayOptions = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const monthOptions = [
    { value: "01", label: "Jan" },
    { value: "02", label: "Feb" },
    { value: "03", label: "Mar" },
    { value: "04", label: "Apr" },
    { value: "05", label: "May" },
    { value: "06", label: "Jun" },
    { value: "07", label: "Jul" },
    { value: "08", label: "Aug" },
    { value: "09", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dec" },
  ];
  const today = new Date();
  const cutoffYear = today.getFullYear() - 13;
  const oldestYear = cutoffYear - 90;
  const yearOptions = Array.from(
    { length: cutoffYear - oldestYear + 1 },
    (_, i) => String(cutoffYear - i)
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f3e9",
        color: "#3b2d10",
        display: "flex",
        justifyContent: "center",
        padding: "40px 16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 720 }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              height: 4,
              borderRadius: 999,
              backgroundColor: "rgba(191,148,78,0.25)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: amberGradient,
              }}
            />
          </div>
          <p
            style={{
              marginTop: 8,
              fontSize: 12,
              opacity: 0.7,
            }}
          >
            Step {currentIndex} of {totalSteps}
          </p>
        </div>

        {loading ? (
          <p style={{ fontSize: 14, opacity: 0.8 }}>
            Loading your profile...
          </p>
        ) : (
          <>
            {/* INTERESTS – kategori + alt hobi seçimi */}
            {step === "interests" && (
              <>
                <h1
                  style={{
                    fontSize: 30,
                    lineHeight: 1.1,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  What are you interested in?
                </h1>
                <p
                  style={{
                    fontSize: 15,
                    opacity: 0.75,
                    marginBottom: 20,
                  }}
                >
                  Tap a category to open it, then choose at least{" "}
                  <strong>two interests</strong>. We&apos;ll use them to
                  suggest events and groups you might enjoy.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 18,
                  }}
                >
                  {INTEREST_CATEGORIES.map((cat) => {
                    const isOpen = openCategoryId === cat.id;
                    const selectedCount = cat.subHobbies.filter((h) =>
                      selectedInterests.includes(h)
                    ).length;

                    return (
                      <div
                        key={cat.id}
                        onClick={() =>
                          setOpenCategoryId((prev) =>
                            prev === cat.id ? null : cat.id
                          )
                        }
                        style={{
                          borderRadius: 16,
                          padding: "0.75rem 0.9rem",
                          backgroundColor: "#fbf2e0",
                          boxShadow: "0 6px 16px rgba(149,119,46,0.12)",
                          border: "1px solid #e8e0d4",
                          cursor: "pointer",
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenCategoryId((prev) =>
                              prev === cat.id ? null : cat.id
                            );
                          }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            color: "#3b2d10",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              gap: 2,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 15,
                                fontWeight: 600,
                              }}
                            >
                              {cat.label}
                            </span>
                            {selectedCount > 0 && (
                              <span
                                style={{
                                  fontSize: 12,
                                  opacity: 0.7,
                                }}
                              >
                                {selectedCount} selected
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 16,
                              opacity: 0.7,
                            }}
                          >
                            {isOpen ? "▲" : "▼"}
                          </span>
                        </button>

                        {isOpen && (
                          <div
                            style={{
                              marginTop: 10,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 8,
                            }}
                          >
                            {cat.subHobbies.map((hobby) => {
                              const active =
                                selectedInterests.includes(hobby);
                              return (
                                <button
                                  key={hobby}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSubInterest(hobby);
                                  }}
                                  style={{
                                    padding: "0.35rem 0.8rem",
                                    borderRadius: 999,
                                    border: active
                                      ? "2px solid #c47b24"
                                      : "1px solid #e8e0d4",
                                    backgroundColor: active
                                      ? "#ffecc7"
                                      : "#fffdf8",
                                    color: "#3b2d10",
                                    fontSize: 12,
                                    cursor: "pointer",
                                    boxShadow: active
                                      ? "0 6px 16px rgba(149,119,46,0.22)"
                                      : "0 3px 8px rgba(149,119,46,0.08)",
                                  }}
                                >
                                  {hobby}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {error && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "#b91c1c",
                      marginBottom: 10,
                    }}
                  >
                    {error}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={handleInterestsContinue}
                    disabled={saving}
                    style={{
                      padding: "0.65rem 1.4rem",
                      borderRadius: 999,
                      border: "none",
                      background: amberGradient,
                      color: "#3b2d10",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      opacity: saving ? 0.7 : 1,
                      boxShadow: "0 10px 24px rgba(149,119,46,0.25)",
                    }}
                  >
                    {saving ? "Saving..." : "Continue"}
                  </button>
                </div>
              </>
            )}

            {/* NAME */}
            {step === "name" && (
              <>
                <h1
                  style={{
                    fontSize: 30,
                    lineHeight: 1.1,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  Tell us your name
                </h1>
                <p
                  style={{
                    fontSize: 15,
                    opacity: 0.75,
                    marginBottom: 24,
                  }}
                >
                  We’ll use your name on your profile and in events you join or
                  create.
                </p>

                <div
                  style={{
                    borderRadius: 18,
                    padding: "1.2rem 1.1rem",
                    backgroundColor: "#fbf2e0",
                    boxShadow: "0 10px 24px rgba(149,119,46,0.16)",
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: "1 1 160px" }}>
                      <label
                        style={{
                          fontSize: 13,
                          opacity: 0.9,
                        }}
                      >
                        First name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Alperen"
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "0.55rem 0.8rem",
                          borderRadius: 10,
                          border: "1px solid #e8e0d4",
                          backgroundColor: "#fffdf8",
                          color: "#3b2d10",
                          fontSize: 14,
                        }}
                      />
                    </div>

                    <div style={{ flex: "1 1 160px" }}>
                      <label
                        style={{
                          fontSize: 13,
                          opacity: 0.9,
                        }}
                      >
                        Last name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Büyükatak"
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "0.55rem 0.8rem",
                          borderRadius: 10,
                          border: "1px solid #e8e0d4",
                          backgroundColor: "#fffdf8",
                          color: "#3b2d10",
                          fontSize: 14,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "#b91c1c",
                      marginBottom: 8,
                    }}
                  >
                    {error}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      padding: "0.65rem 1.4rem",
                      borderRadius: 999,
                      border: "1px solid #e8e0d4",
                      background: "#fffdf8",
                      color: "#3b2d10",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleNameContinue}
                    disabled={saving}
                    style={{
                      padding: "0.65rem 1.4rem",
                      borderRadius: 999,
                      border: "none",
                      background: amberGradient,
                      color: "#3b2d10",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      opacity: saving ? 0.7 : 1,
                      boxShadow: "0 10px 24px rgba(149,119,46,0.25)",
                    }}
                  >
                    {saving ? "Saving..." : "Continue"}
                  </button>
                </div>
              </>
            )}

            {/* BIRTHDATE – custom picker */}
            {step === "birthdate" && (
              <>
                <h1
                  style={{
                    fontSize: 30,
                    lineHeight: 1.1,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  Let&apos;s get to know you!
                </h1>
                <p
                  style={{
                    fontSize: 15,
                    opacity: 0.75,
                    marginBottom: 24,
                  }}
                >
                  Enter your date of birth. Knowing your age helps us find the
                  right events and groups for you. It won&apos;t be shared with
                  anyone.
                </p>

                <div
                  style={{
                    borderRadius: 18,
                    padding: "1.2rem 1.1rem",
                    backgroundColor: "#fbf2e0",
                    boxShadow: "0 10px 24px rgba(149,119,46,0.16)",
                    marginBottom: 18,
                  }}
                >
                  <label
                    style={{
                      fontSize: 13,
                      opacity: 0.9,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Date of birth
                  </label>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 8,
                    }}
                  >
                    {/* Day */}
                    <select
                      value={birthDay}
                      onChange={(e) =>
                        updateBirthDateFromParts(
                          e.target.value,
                          birthMonth,
                          birthYear
                        )
                      }
                      style={{
                        padding: "0.6rem 0.7rem",
                        borderRadius: 12,
                        border: "1px solid #e8e0d4",
                        backgroundColor: "#fffdf8",
                        color: "#3b2d10",
                        fontSize: 14,
                      }}
                    >
                      <option value="">Day</option>
                      {dayOptions.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>

                    {/* Month */}
                    <select
                      value={birthMonth}
                      onChange={(e) =>
                        updateBirthDateFromParts(
                          birthDay,
                          e.target.value,
                          birthYear
                        )
                      }
                      style={{
                        padding: "0.6rem 0.7rem",
                        borderRadius: 12,
                        border: "1px solid #e8e0d4",
                        backgroundColor: "#fffdf8",
                        color: "#3b2d10",
                        fontSize: 14,
                      }}
                    >
                      <option value="">Month</option>
                      {monthOptions.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>

                    {/* Year */}
                    <select
                      value={birthYear}
                      onChange={(e) =>
                        updateBirthDateFromParts(
                          birthDay,
                          birthMonth,
                          e.target.value
                        )
                      }
                      style={{
                        padding: "0.6rem 0.7rem",
                        borderRadius: 12,
                        border: "1px solid #e8e0d4",
                        backgroundColor: "#fffdf8",
                        color: "#3b2d10",
                        fontSize: 14,
                      }}
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
                      marginTop: 6,
                      fontSize: 12,
                      opacity: 0.7,
                    }}
                  >
                    You must be at least 13 years old to use Moventra.
                  </p>
                </div>

                {error && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "#b91c1c",
                      marginBottom: 8,
                    }}
                  >
                    {error}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      padding: "0.65rem 1.4rem",
                      borderRadius: 999,
                      border: "1px solid #e8e0d4",
                      background: "#fffdf8",
                      color: "#3b2d10",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleBirthdateContinue}
                    disabled={saving}
                    style={{
                      padding: "0.65rem 1.4rem",
                      borderRadius: 999,
                      border: "none",
                      background: amberGradient,
                      color: "#3b2d10",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      opacity: saving ? 0.7 : 1,
                      boxShadow: "0 10px 24px rgba(149,119,46,0.25)",
                    }}
                  >
                    {saving ? "Saving..." : "Continue"}
                  </button>
                </div>
              </>
            )}

            {/* GENDER */}
            {step === "gender" && (
              <>
                <h1
                  style={{
                    fontSize: 30,
                    lineHeight: 1.1,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  What&apos;s your gender?
                </h1>
                <p
                  style={{
                    fontSize: 15,
                    opacity: 0.75,
                    marginBottom: 24,
                  }}
                >
                  Your gender helps us suggest events and groups that are right
                  for you. It won&apos;t be shared with anyone.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginBottom: 18,
                  }}
                >
                  {[
                    { id: "female", label: "Female" },
                    { id: "male", label: "Male" },
                    { id: "non_binary", label: "Non-binary" },
                    { id: "prefer_not_say", label: "Prefer not to say" },
                  ].map((opt) => {
                    const selected = gender === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setGender(opt.id)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "0.9rem 1rem",
                          borderRadius: 999,
                          border: selected
                            ? "2px solid #c47b24"
                            : "1px solid #e8e0d4",
                          backgroundColor: selected ? "#ffecc7" : "#fffdf8",
                          color: "#3b2d10",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          boxShadow: selected
                            ? "0 8px 20px rgba(149,119,46,0.24)"
                            : "0 4px 10px rgba(149,119,46,0.08)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 500,
                          }}
                        >
                          {opt.label}
                        </span>
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 999,
                            border: selected
                              ? "5px solid #c47b24"
                              : "2px solid rgba(191,148,78,0.7)",
                            backgroundColor: selected
                              ? "#ffdfae"
                              : "transparent",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>

                {error && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "#b91c1c",
                      marginBottom: 8,
                    }}
                  >
                    {error}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      padding: "0.65rem 1.4rem",
                      borderRadius: 999,
                      border: "1px solid #e8e0d4",
                      background: "#fffdf8",
                      color: "#3b2d10",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleGenderContinue}
                    disabled={saving}
                    style={{
                      padding: "0.65rem 1.4rem",
                      borderRadius: 999,
                      border: "none",
                      background: amberGradient,
                      color: "#3b2d10",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      opacity: saving ? 0.7 : 1,
                      boxShadow: "0 10px 24px rgba(149,119,46,0.25)",
                    }}
                  >
                    {saving ? "Saving..." : "Continue"}
                  </button>
                </div>
              </>
            )}

            {/* PLAN */}
            {step === "plan" && (
              <>
                <h1
                  style={{
                    fontSize: 30,
                    lineHeight: 1.1,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  Join Moventra+
                </h1>
                <p
                  style={{
                    fontSize: 15,
                    opacity: 0.75,
                    marginBottom: 24,
                  }}
                >
                  Good news: Moventra is currently{" "}
                  <strong>completely free</strong> to use. You can create and
                  join events without paying anything.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      borderRadius: 18,
                      padding: "1rem 1.1rem",
                      border: "2px solid #c47b24",
                      background: "linear-gradient(135deg,#fffdf8,#ffecc7)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      boxShadow: "0 12px 28px rgba(149,119,46,0.25)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          marginBottom: 4,
                        }}
                      >
                        Free plan
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          opacity: 0.8,
                        }}
                      >
                        Create and join events, save your hobbies and chat with
                        people – all for free.
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#7c5015",
                      }}
                    >
                      €0 / month
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 18,
                      padding: "0.85rem 1.1rem",
                      border: "1px dashed rgba(191,148,78,0.7)",
                      backgroundColor: "#fdf9f2",
                      fontSize: 13,
                      opacity: 0.9,
                    }}
                  >
                    In the future we may add optional paid features for
                    organizers, but your basic Moventra experience will stay
                    free.
                  </div>
                </div>

                {error && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "#b91c1c",
                      marginBottom: 8,
                    }}
                  >
                    {error}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      padding: "0.65rem 1.4rem",
                      borderRadius: 999,
                      border: "1px solid #e8e0d4",
                      background: "#fffdf8",
                      color: "#3b2d10",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={saving}
                    style={{
                      padding: "0.65rem 1.4rem",
                      borderRadius: 999,
                      border: "none",
                      background: amberGradient,
                      color: "#3b2d10",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      opacity: saving ? 0.7 : 1,
                      boxShadow: "0 10px 24px rgba(149,119,46,0.25)",
                    }}
                  >
                    {saving ? "Finishing..." : "Finish and go to events"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
