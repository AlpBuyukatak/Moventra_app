"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CityPickerModal, {
  type LocationSelection,
} from "../components/CityPickerModal";
import { useLanguage, type Language } from "../context/LanguageContext";

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

type Hobby = {
  id: number;
  name: string;
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

// gender değeri veritabanında İngilizce kalıyor (value), label i18n
const GENDER_OPTIONS = [
  { value: "", labelKey: "settings.profile.gender.preferNot" },
  { value: "Female", labelKey: "settings.profile.gender.female" },
  { value: "Male", labelKey: "settings.profile.gender.male" },
  { value: "Non-binary", labelKey: "settings.profile.gender.nonBinary" },
];

const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "tr", label: "Türkçe" },
];

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get("tab") as Tab) || "profile";

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const { t: baseT, language, setLanguage } = useLanguage();

  // --- ÇEVİRİ WRAPPER: key görünüyorsa düzgün İngilizce fallback kullan ---
  const t = (key: string): string => {
    const original = baseT(key);
    if (original && original !== key) return original;

    switch (key) {
      // Sidebar
      case "settings.sidebar.title":
        return "Settings";
      case "settings.sidebar.profile":
        return "Edit profile";
      case "settings.sidebar.account":
        return "Account management";
      case "settings.sidebar.email":
        return "Email updates";
      case "settings.sidebar.privacy":
        return "Privacy";
      case "settings.sidebar.social":
        return "Social media";
      case "settings.sidebar.interests":
        return "Interests";
      case "settings.sidebar.payments":
        return "Payment methods";
      case "settings.badge.soon":
        return "soon";

      // Profile – header
      case "settings.profile.title":
        return "Edit profile";
      case "settings.profile.subtitle":
        return "Update your basic info. We use this to personalise events and recommendations for you.";
      case "settings.profile.loading":
        return "Loading your profile…";

      // Profile – name
      case "settings.profile.name.label":
        return "Name";
      case "settings.profile.name.placeholder":
        return "How should we call you?";

      // Profile – location
      case "settings.profile.location.label":
        return "Location";
      case "settings.profile.location.placeholder":
        return "Choose your city";
      case "settings.profile.location.button":
        return "Choose on map";
      case "settings.profile.location.helper":
        return "We use your city to show nearby events first.";

      // Profile – birth date
      case "settings.profile.birth.label":
        return "Birth date";
      case "settings.profile.birth.dayPlaceholder":
        return "Day";
      case "settings.profile.birth.monthPlaceholder":
        return "Month";
      case "settings.profile.birth.yearPlaceholder":
        return "Year";
      case "settings.profile.birth.helper":
        return "This is optional and only used in aggregated stats.";
      case "settings.profile.birth.month1":
        return "January";
      case "settings.profile.birth.month2":
        return "February";
      case "settings.profile.birth.month3":
        return "March";
      case "settings.profile.birth.month4":
        return "April";
      case "settings.profile.birth.month5":
        return "May";
      case "settings.profile.birth.month6":
        return "June";
      case "settings.profile.birth.month7":
        return "July";
      case "settings.profile.birth.month8":
        return "August";
      case "settings.profile.birth.month9":
        return "September";
      case "settings.profile.birth.month10":
        return "October";
      case "settings.profile.birth.month11":
        return "November";
      case "settings.profile.birth.month12":
        return "December";

      // Profile – gender
      case "settings.profile.gender.label":
        return "Gender";
      case "settings.profile.gender.preferNot":
        return "Prefer not to say";
      case "settings.profile.gender.female":
        return "Female";
      case "settings.profile.gender.male":
        return "Male";
      case "settings.profile.gender.nonBinary":
        return "Non-binary";

      // Profile – bio
      case "settings.profile.bio.label":
        return "Bio";
      case "settings.profile.bio.placeholder":
        return "Tell people a bit about your hobbies, languages you speak or what kind of meetups you enjoy.";

      // Profile – toggles
      case "settings.profile.toggles.groups.label":
        return "Show groups on profile";
      case "settings.profile.toggles.groups.description":
        return "People can see which groups you’re part of.";
      case "settings.profile.toggles.interests.label":
        return "Show interests on profile";
      case "settings.profile.toggles.interests.description":
        return "People can see which hobbies you’re into.";

      // Profile – buttons / status
      case "settings.profile.buttons.save":
        return "Save changes";
      case "settings.profile.buttons.saving":
        return "Saving…";
      case "settings.profile.status.saved":
        return "Profile updated.";
      case "settings.profile.status.errorDefault":
        return "Could not save profile.";

      // Account – general
      case "settings.account.title":
        return "Account";
      case "settings.account.email.label":
        return "Email address";

      // Account – language
      case "settings.account.language.label":
        return "Interface language";
      case "settings.account.language.helper":
        return "This only changes the Moventra interface language.";

      // Account – timezone
      case "settings.account.timezone.label":
        return "Time zone";
      case "settings.account.timezone.system":
        return "Use system time zone";
      case "settings.account.timezone.cet":
        return "Central European Time (CET)";
      case "settings.account.timezone.gmt":
        return "Greenwich Mean Time (GMT)";
      case "settings.account.timezone.helper":
        return "We use this to display event times.";

      // Account – password
      case "settings.account.password.sectionTitle":
        return "Password";
      case "settings.account.password.helper":
        return "Change your Moventra password.";
      case "settings.account.password.toggleOpen":
        return "Change password";
      case "settings.account.password.toggleClose":
        return "Hide password form";
      case "settings.account.password.currentPlaceholder":
        return "Current password";
      case "settings.account.password.newPlaceholder":
        return "New password";
      case "settings.account.password.confirmPlaceholder":
        return "Confirm new password";
      case "settings.account.password.loading":
        return "Saving…";
      case "settings.account.password.button":
        return "Update password";
      case "settings.account.password.status.success":
        return "Your password has been updated.";
      case "settings.account.password.error.fillAll":
        return "Please fill in all fields.";
      case "settings.account.password.error.mismatch":
        return "New passwords do not match.";
      case "settings.account.password.error.tooShort":
        return "New password must be at least 8 characters.";
      case "settings.account.password.error.default":
        return "Could not change password. Please try again.";

      // Account – deactivate
      case "settings.account.deactivate.sectionTitle":
        return "Deactivate account";
      case "settings.account.deactivate.helper":
        return "You can temporarily deactivate your account. You can reactivate it by logging in again.";
      case "settings.account.deactivate.loading":
        return "Deactivating…";
      case "settings.account.deactivate.button":
        return "Deactivate my account";
      case "settings.account.deactivate.confirmDialog":
        return "Are you sure you want to deactivate your account?";
      case "settings.account.deactivate.status.success":
        return "Your account has been deactivated. We’ll log you out now.";
      case "settings.account.deactivate.status.errorDefault":
        return "Could not deactivate account. Please try again.";

      // Account – GDPR
      case "settings.account.gdpr.sectionTitle":
        return "Data & privacy requests (GDPR)";
      case "settings.account.gdpr.helper":
        return "You can request access to, or deletion of, your personal data stored by Moventra.";
      case "settings.account.gdpr.type.label":
        return "Request type";
      case "settings.account.gdpr.type.access":
        return "Access to my data (Art. 15 GDPR)";
      case "settings.account.gdpr.type.erasure":
        return "Deletion of my data (Art. 17 GDPR)";
      case "settings.account.gdpr.type.other":
        return "Other data-related request";
      case "settings.account.gdpr.details.label":
        return "Details";
      case "settings.account.gdpr.details.placeholder":
        return "Describe your request. For example, which data you’d like to receive or delete.";
      case "settings.account.gdpr.buttons.loading":
        return "Sending…";
      case "settings.account.gdpr.buttons.submit":
        return "Submit request";
      case "settings.account.gdpr.status.success":
        return "Your request has been submitted. We’ll get back to you via email.";
      case "settings.account.gdpr.status.errorDefault":
        return "Could not submit GDPR request. Please try again.";

      // Email
      case "settings.email.title":
        return "Email updates";
      case "settings.email.subtitle":
        return "Control which emails you receive from Moventra.";
      case "settings.email.sectionTitle":
        return "Activity emails";
      case "settings.email.sectionHelper":
        return "These emails help you stay up to date with what’s happening.";
      case "settings.email.rows.messages.title":
        return "Messages";
      case "settings.email.rows.messages.description":
        return "When someone sends you a direct message.";
      case "settings.email.rows.replies.title":
        return "Replies & comments";
      case "settings.email.rows.replies.description":
        return "When someone replies to you in an event or group.";
      case "settings.email.rows.suggested.title":
        return "Suggested events";
      case "settings.email.rows.suggested.description":
        return "Recommended events based on your interests.";
      case "settings.email.rows.newGroups.title":
        return "New groups near you";
      case "settings.email.rows.newGroups.description":
        return "When new groups start in your city.";
      case "settings.email.rows.updatesHQ.title":
        return "News from Moventra";
      case "settings.email.rows.updatesHQ.description":
        return "Product updates, tips and announcements.";
      case "settings.email.rows.surveys.title":
        return "Feedback & surveys";
      case "settings.email.rows.surveys.description":
        return "Short surveys to help us improve.";
      case "settings.email.rows.ical.title":
        return "Calendar reminders (iCal)";
      case "settings.email.rows.ical.description":
        return "Event invitations you can add to your calendar.";
      case "settings.email.rows.proNetwork.title":
        return "Professional networking";
      case "settings.email.rows.proNetwork.description":
        return "Occasional emails about pro networking features.";
      case "settings.email.rows.connections.title":
        return "New connections";
      case "settings.email.rows.connections.description":
        return "When someone connects with you.";
      case "settings.email.turnOff.title":
        return "Turn off all emails";
      case "settings.email.turnOff.text":
        return "You can disable almost all Moventra emails. Some transactional emails (like security alerts) cannot be turned off.";
      case "settings.email.turnOff.button":
        return "Turn off non-essential emails";

      // Privacy
      case "settings.privacy.title":
        return "Privacy";
      case "settings.privacy.subtitle":
        return "Control who can contact you and what is visible on your profile.";
      case "settings.privacy.contacts.sectionTitle":
        return "Who can contact you";
      case "settings.privacy.contacts.helper":
        return "Choose who can send you messages or invitations.";
      case "settings.privacy.contacts.organizers":
        return "Only event organizers";
      case "settings.privacy.contacts.groups":
        return "Organizers and people from my groups";
      case "settings.privacy.contacts.anyone":
        return "Anyone on Moventra";
      case "settings.privacy.profile.sectionTitle":
        return "Profile visibility";
      case "settings.privacy.profile.helper":
        return "You can adjust which details appear on your public profile.";
      case "settings.privacy.profile.button":
        return "Edit profile visibility";

      // Interests tab
      case "settings.interests.title":
        return "Your interests";
      case "settings.interests.subtitle":
        return "Choose the topics you’d like to see more events about.";
      case "settings.interests.helper":
        return "We use your interests to recommend events and groups. You can change them anytime.";
      case "settings.interests.loading":
        return "Loading your interests…";
      case "settings.interests.empty":
        return "We couldn’t load any interests yet.";
      case "settings.interests.card.helper":
        return "Tap to add this interest.";
      case "settings.interests.card.selected":
        return "Selected interest";
      case "settings.interests.autoSave.helper":
        return "Your changes are saved automatically.";
      case "settings.interests.autoSave.saving":
        return "Saving your interests…";

      // Coming soon
      case "settings.comingSoon.title":
        return "This section is coming soon";
      case "settings.comingSoon.text":
        return "We’re still working on this part of the settings. In the meantime, you can manage your basic profile information in the Profile tab.";

      default:
        return original || key;
    }
  };

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

  // Account management – timezone
  const [timeZone, setTimeZone] = useState("system");

  // Change password state
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>("");
  const [changePwStatus, setChangePwStatus] = useState<string | null>(null);
  const [changePwError, setChangePwError] = useState<string | null>(null);
  const [changePwLoading, setChangePwLoading] = useState(false);

  // Deactivate account state
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateStatus, setDeactivateStatus] = useState<string | null>(
    null
  );

  // GDPR request state
  const [gdprType, setGdprType] = useState<"access" | "erasure" | "other">(
    "access"
  );
  const [gdprMessage, setGdprMessage] = useState("");
  const [gdprLoading, setGdprLoading] = useState(false);
  const [gdprStatus, setGdprStatus] = useState<string | null>(null);
  const [gdprError, setGdprError] = useState<string | null>(null);

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

  // Interests – onboarding tarzı kartlar için state
  const [allHobbies, setAllHobbies] = useState<Hobby[]>([]);
  const [selectedHobbyIds, setSelectedHobbyIds] = useState<number[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [savingInterests, setSavingInterests] = useState(false);
  const [interestsLoaded, setInterestsLoaded] = useState(false);

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

  // Interests tab için hobileri yükle (sadece ilk açılışta)
  useEffect(() => {
    if (activeTab !== "interests" || interestsLoaded) return;

    const token = getToken();
    setLoadingInterests(true);

    const loadInterests = async () => {
      try {
        // Tüm hobiler (public)
        const allRes = await fetch(`${API_URL}/hobbies`);
        const allData = await allRes.json().catch(() => ({}));
        if (allRes.ok && Array.isArray(allData.hobbies)) {
          setAllHobbies(allData.hobbies as Hobby[]);
        }

        // Kullanıcının kendi hobileri
        if (token) {
          const myRes = await fetch(`${API_URL}/hobbies/my`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const myData = await myRes.json().catch(() => ({}));
          if (myRes.ok && Array.isArray(myData.hobbies)) {
            const ids = (myData.hobbies as Hobby[]).map((h) => h.id);
            setSelectedHobbyIds(ids);
          }
        }

        setInterestsLoaded(true);
      } catch (error) {
        console.error("Failed to load interests", error);
      } finally {
        setLoadingInterests(false);
      }
    };

    loadInterests();
  }, [activeTab, interestsLoaded]);

  // Doğum tarihi için dropdown seçenekleri
  const dayOptions = useMemo(
    () => Array.from({ length: 31 }, (_, i) => String(i + 1)),
    []
  );

  const monthOptions = [
    { value: "1", labelKey: "settings.profile.birth.month1" },
    { value: "2", labelKey: "settings.profile.birth.month2" },
    { value: "3", labelKey: "settings.profile.birth.month3" },
    { value: "4", labelKey: "settings.profile.birth.month4" },
    { value: "5", labelKey: "settings.profile.birth.month5" },
    { value: "6", labelKey: "settings.profile.birth.month6" },
    { value: "7", labelKey: "settings.profile.birth.month7" },
    { value: "8", labelKey: "settings.profile.birth.month8" },
    { value: "9", labelKey: "settings.profile.birth.month9" },
    { value: "10", labelKey: "settings.profile.birth.month10" },
    { value: "11", labelKey: "settings.profile.birth.month11" },
    { value: "12", labelKey: "settings.profile.birth.month12" },
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

      setProfileMessage(t("settings.profile.status.saved"));
      setUser(data.user);
    } catch (err: any) {
      console.error(err);
      setProfileMessage(
        err.message || t("settings.profile.status.errorDefault")
      );
    } finally {
      setSavingProfile(false);
    }
  }

  // ---------------- INTERESTS AUTO-SAVE ----------------

  async function autoSaveInterests(nextIds: number[]) {
    const token = getToken();
    if (!token) return;

    setSavingInterests(true);
    try {
      const res = await fetch(`${API_URL}/hobbies/my`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hobbyIds: nextIds,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Failed to auto-save interests:", data.error);
      }
    } catch (error) {
      console.error("Auto-save interests error:", error);
    } finally {
      setSavingInterests(false);
    }
  }

  function toggleHobbySelection(hobbyId: number) {
    setSelectedHobbyIds((prev) => {
      const isSelected = prev.includes(hobbyId);
      const next = isSelected
        ? prev.filter((id) => id !== hobbyId)
        : [...prev, hobbyId];

      // Optimistic UI + auto-save
      void autoSaveInterests(next);

      return next;
    });
  }

  // ---------------- ACCOUNT ACTIONS ----------------

  async function handleChangePassword() {
    if (!user) return;
    const token = getToken();
    if (!token) return;

    setChangePwError(null);
    setChangePwStatus(null);

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setChangePwError(t("settings.account.password.error.fillAll"));
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setChangePwError(t("settings.account.password.error.mismatch"));
      return;
    }

    if (newPassword.length < 8) {
      setChangePwError(t("settings.account.password.error.tooShort"));
      return;
    }

    setChangePwLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data.error || t("settings.account.password.error.default");
        throw new Error(msg);
      }

      setChangePwStatus(t("settings.account.password.status.success"));
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setChangePwOpen(false);
    } catch (err: any) {
      console.error(err);
      setChangePwError(
        err.message || t("settings.account.password.error.default")
      );
    } finally {
      setChangePwLoading(false);
    }
  }

async function handleDeactivateAccount() {
  if (!user) return;

  const token = getToken();
  if (!token) {
    setDeactivateStatus("No token in localStorage");
    return;
  }

  const confirmed = window.confirm(
    t("settings.account.deactivate.confirmDialog")
  );
  if (!confirmed) return;

  setDeactivateStatus(null);
  setDeactivateLoading(true);

  try {
    const res = await fetch(`${API_URL}/auth/deactivate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 🔴 kritik kısım
      },
      // body gerek yok, boş POST
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Deactivate error:", data);
      setDeactivateStatus(
        data.error || t("settings.account.deactivate.status.errorDefault")
      );
      return;
    }

    // Backend'e göre mesajı ayarla
    // (ben daha önce "24 saat içinde deaktive edilecek" şeklinde ayarlamıştım)
    setDeactivateStatus(
      t("settings.account.deactivate.status.success")
    );

    // Token'ı temizle + ana sayfaya at
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
    }

    setTimeout(() => {
      router.push("/");
    }, 800);
  } catch (err: any) {
    console.error("deactivate request failed:", err);
    setDeactivateStatus(
      err.message ||
        t("settings.account.deactivate.status.errorDefault")
    );
  } finally {
    setDeactivateLoading(false);
  }
}


  async function handleSubmitGdprRequest() {
    if (!user) return;
    const token = getToken();
    if (!token) return;

    setGdprError(null);
    setGdprStatus(null);
    setGdprLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/gdpr-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: gdprType,
          message: gdprMessage.trim() || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.error || t("settings.account.gdpr.status.errorDefault")
        );
      }

      setGdprStatus(t("settings.account.gdpr.status.success"));
      setGdprMessage("");
    } catch (err: any) {
      console.error(err);
      setGdprError(
        err.message || t("settings.account.gdpr.status.errorDefault")
      );
    } finally {
      setGdprLoading(false);
    }
  }

  // ---------------- RENDER HELPERS ----------------

  function renderSidebarItem(tab: Tab, label: string, badgeKey?: string) {
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
            ? "rgba(59,130,246,0.16)"
            : "transparent",
          color: isActive ? "#0f172a" : "rgba(15,23,42,0.85)",
          fontWeight: isActive ? 600 : 400,
          fontSize: 14,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition:
            "background-color 120ms ease, transform 120ms ease, box-shadow 150ms ease",
          boxShadow: isActive
            ? "0 6px 16px rgba(59,130,246,0.18)"
            : "none",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(0.97)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
      >
        <span>{label}</span>
        {badgeKey && (
          <span
            style={{
              fontSize: 11,
              opacity: 0.7,
            }}
          >
            {t(badgeKey)}
          </span>
        )}
      </button>
    );
  }

  function renderEditProfileTab() {
    const firstLetter = user?.name?.charAt(0).toUpperCase() || "A";

    return (
      <div style={settingsCardStyle}>
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
              boxShadow: "0 0 16px rgba(56,189,248,0.7)",
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
              {t("settings.profile.title")}
            </h1>
            <p
              style={{
                fontSize: 13,
                opacity: 0.8,
                maxWidth: 420,
              }}
            >
              {t("settings.profile.subtitle")}
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
              {t("settings.profile.name.label")}{" "}
              <span style={{ color: "#ef4444" }}>*</span>
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
              placeholder={t("settings.profile.name.placeholder")}
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
              {t("settings.profile.location.label")}
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
                placeholder={t("settings.profile.location.placeholder")}
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
                  backgroundColor: "rgba(255,255,255,0.8)",
                  fontSize: 12,
                  cursor: "pointer",
                  color: "#0f172a",
                  transition:
                    "transform 120ms ease, box-shadow 150ms ease, background-color 120ms ease",
                  boxShadow: "0 2px 6px rgba(15,23,42,0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 10px rgba(15,23,42,0.12)";
                  e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.95)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 6px rgba(15,23,42,0.08)";
                  e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.8)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "scale(0.97)";
                  e.currentTarget.style.boxShadow =
                    "0 1px 4px rgba(15,23,42,0.1)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 10px rgba(15,23,42,0.12)";
                }}
              >
                {t("settings.profile.location.button")}
              </button>
            </div>
            <p
              style={{
                fontSize: 11,
                opacity: 0.7,
                marginTop: 4,
              }}
            >
              {t("settings.profile.location.helper")}
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
              {t("settings.profile.birth.label")}
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
                <option value="">
                  {t("settings.profile.birth.dayPlaceholder")}
                </option>
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
                <option value="">
                  {t("settings.profile.birth.monthPlaceholder")}
                </option>
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {t(m.labelKey)}
                  </option>
                ))}
              </select>
              <select
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                style={dateSelectStyle}
              >
                <option value="">
                  {t("settings.profile.birth.yearPlaceholder")}
                </option>
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
              {t("settings.profile.birth.helper")}
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
              {t("settings.profile.gender.label")}
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
              {GENDER_OPTIONS.map((g) => (
                <option key={g.value || "none"} value={g.value}>
                  {t(g.labelKey)}
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
              {t("settings.profile.bio.label")}
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t("settings.profile.bio.placeholder")}
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
              label={t("settings.profile.toggles.groups.label")}
              description={t(
                "settings.profile.toggles.groups.description"
              )}
              checked={showGroups}
              onChange={setShowGroups}
            />
            <ToggleCard
              label={t("settings.profile.toggles.interests.label")}
              description={t(
                "settings.profile.toggles.interests.description"
              )}
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
                boxShadow: "0 4px 10px rgba(22,163,74,0.28)",
                transition:
                  "transform 120ms ease, box-shadow 150ms ease",
              }}
              onMouseEnter={(e) => {
                if (savingProfile) return;
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 18px rgba(22,163,74,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 10px rgba(22,163,74,0.28)";
              }}
              onMouseDown={(e) => {
                if (savingProfile) return;
                e.currentTarget.style.transform = "scale(0.97)";
                e.currentTarget.style.boxShadow =
                  "0 3px 8px rgba(22,163,74,0.26)";
              }}
              onMouseUp={(e) => {
                if (savingProfile) return;
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 18px rgba(22,163,74,0.35)";
              }}
            >
              {savingProfile
                ? t("settings.profile.buttons.saving")
                : t("settings.profile.buttons.save")}
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
    const languageOption =
      LANGUAGE_OPTIONS.find((opt) => opt.code === language) ??
      LANGUAGE_OPTIONS[0];

    return (
      <div style={settingsCardStyle}>
        <h1 style={settingsTitleStyle}>{t("settings.account.title")}</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={fieldLabelStyle}>
              {t("settings.account.email.label")}
            </label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              style={readOnlyInputStyle}
            />
          </div>

          <div>
            <label style={fieldLabelStyle}>
              {t("settings.account.language.label")}
            </label>
            <select
              value={languageOption.code}
              onChange={(e) => setLanguage(e.target.value as Language)}
              style={inputStyle}
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p style={helperTextStyle}>
              {t("settings.account.language.helper")}
            </p>
          </div>

          <div>
            <label style={fieldLabelStyle}>
              {t("settings.account.timezone.label")}
            </label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              style={inputStyle}
            >
              <option value="system">
                {t("settings.account.timezone.system")}
              </option>
              <option value="cet">
                {t("settings.account.timezone.cet")}
              </option>
              <option value="gmt">
                {t("settings.account.timezone.gmt")}
              </option>
            </select>
            <p style={helperTextStyle}>
              {t("settings.account.timezone.helper")}
            </p>
          </div>

          <hr style={dividerStyle} />

          {/* CHANGE PASSWORD */}
          <section
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <h2 style={sectionTitleStyle}>
              {t("settings.account.password.sectionTitle")}
            </h2>
            <p style={helperTextStyle}>
              {t("settings.account.password.helper")}
            </p>
            <button
              type="button"
              style={linkButtonStyle}
              onClick={() => {
                setChangePwOpen((v) => !v);
                setChangePwError(null);
                setChangePwStatus(null);
              }}
            >
              {changePwOpen
                ? t("settings.account.password.toggleClose")
                : t("settings.account.password.toggleOpen")}
            </button>

            {changePwOpen && (
              <div
                style={{
                  marginTop: 8,
                  display: "grid",
                  gap: 8,
                  maxWidth: 380,
                }}
              >
                <input
                  type="password"
                  placeholder={t(
                    "settings.account.password.currentPlaceholder"
                  )}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder={t(
                    "settings.account.password.newPlaceholder"
                  )}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder={t(
                    "settings.account.password.confirmPlaceholder"
                  )}
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  style={inputStyle}
                />
                {changePwError && (
                  <p
                    style={{
                      ...helperTextStyle,
                      color: "#b91c1c",
                    }}
                  >
                    {changePwError}
                  </p>
                )}
                {changePwStatus && (
                  <p
                    style={{
                      ...helperTextStyle,
                      color: "#166534",
                    }}
                  >
                    {changePwStatus}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={changePwLoading}
                  style={{
                    ...primarySmallButtonStyle,
                    transition:
                      "transform 120ms ease, box-shadow 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (changePwLoading) return;
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 18px rgba(37,99,235,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 14px rgba(37,99,235,0.35)";
                  }}
                  onMouseDown={(e) => {
                    if (changePwLoading) return;
                    e.currentTarget.style.transform = "scale(0.97)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 10px rgba(37,99,235,0.32)";
                  }}
                  onMouseUp={(e) => {
                    if (changePwLoading) return;
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 18px rgba(37,99,235,0.4)";
                  }}
                >
                  {changePwLoading
                    ? t("settings.account.password.loading")
                    : t("settings.account.password.button")}
                </button>
              </div>
            )}
          </section>

          <hr style={dividerStyle} />

          {/* DEACTIVATE ACCOUNT */}
          <section
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <h2 style={sectionTitleStyle}>
              {t("settings.account.deactivate.sectionTitle")}
            </h2>
            <p style={helperTextStyle}>
              {t("settings.account.deactivate.helper")}
            </p>
            <button
              type="button"
              style={{
                ...linkButtonStyle,
                color: "#b91c1c",
                opacity: deactivateLoading ? 0.7 : 1,
              }}
              onClick={handleDeactivateAccount}
              disabled={deactivateLoading}
            >
              {deactivateLoading
                ? t("settings.account.deactivate.loading")
                : t("settings.account.deactivate.button")}
            </button>
            {deactivateStatus && (
              <p
                style={{
                  ...helperTextStyle,
                  color: "#b91c1c",
                  marginTop: 2,
                }}
              >
                {deactivateStatus}
              </p>
            )}
          </section>

          <hr style={dividerStyle} />

          {/* GDPR REQUESTS */}
          <section
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <h2 style={sectionTitleStyle}>
              {t("settings.account.gdpr.sectionTitle")}
            </h2>
            <p style={helperTextStyle}>
              {t("settings.account.gdpr.helper")}
            </p>

            <div
              style={{
                marginTop: 6,
                display: "grid",
                gap: 8,
                maxWidth: 420,
              }}
            >
              <div>
                <label style={fieldLabelStyle}>
                  {t("settings.account.gdpr.type.label")}
                </label>
                <select
                  value={gdprType}
                  onChange={(e) =>
                    setGdprType(
                      e.target.value as "access" | "erasure" | "other"
                    )
                  }
                  style={inputStyle}
                >
                  <option value="access">
                    {t("settings.account.gdpr.type.access")}
                  </option>
                  <option value="erasure">
                    {t("settings.account.gdpr.type.erasure")}
                  </option>
                  <option value="other">
                    {t("settings.account.gdpr.type.other")}
                  </option>
                </select>
              </div>

              <div>
                <label style={fieldLabelStyle}>
                  {t("settings.account.gdpr.details.label")}
                </label>
                <textarea
                  rows={3}
                  value={gdprMessage}
                  onChange={(e) => setGdprMessage(e.target.value)}
                  placeholder={t(
                    "settings.account.gdpr.details.placeholder"
                  )}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: 70,
                  }}
                />
              </div>

              {gdprError && (
                <p
                  style={{
                    ...helperTextStyle,
                    color: "#b91c1c",
                  }}
                >
                  {gdprError}
                </p>
              )}
              {gdprStatus && (
                <p
                  style={{
                    ...helperTextStyle,
                    color: "#166534",
                  }}
                >
                  {gdprStatus}
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmitGdprRequest}
                disabled={gdprLoading}
                style={{
                  ...primarySmallButtonStyle,
                  transition:
                    "transform 120ms ease, box-shadow 150ms ease",
                }}
                onMouseEnter={(e) => {
                  if (gdprLoading) return;
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 18px rgba(37,99,235,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 14px rgba(37,99,235,0.35)";
                }}
                onMouseDown={(e) => {
                  if (gdprLoading) return;
                  e.currentTarget.style.transform = "scale(0.97)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 10px rgba(37,99,235,0.32)";
                }}
                onMouseUp={(e) => {
                  if (gdprLoading) return;
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 18px rgba(37,99,235,0.4)";
                }}
              >
                {gdprLoading
                  ? t("settings.account.gdpr.buttons.loading")
                  : t("settings.account.gdpr.buttons.submit")}
              </button>
            </div>
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
        <h1 style={settingsTitleStyle}>{t("settings.email.title")}</h1>

        <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 18 }}>
          {t("settings.email.subtitle")}
        </p>

        <section style={{ marginBottom: 18 }}>
          <h2 style={sectionTitleStyle}>
            {t("settings.email.sectionTitle")}
          </h2>
          <p style={helperTextStyle}>
            {t("settings.email.sectionHelper")}
          </p>

          <div style={{ marginTop: 8 }}>
            {row(
              "messages",
              t("settings.email.rows.messages.title"),
              t("settings.email.rows.messages.description")
            )}
            {row(
              "replies",
              t("settings.email.rows.replies.title"),
              t("settings.email.rows.replies.description")
            )}
            {row(
              "suggested",
              t("settings.email.rows.suggested.title"),
              t("settings.email.rows.suggested.description")
            )}
            {row(
              "newGroups",
              t("settings.email.rows.newGroups.title"),
              t("settings.email.rows.newGroups.description")
            )}
            {row(
              "updatesHQ",
              t("settings.email.rows.updatesHQ.title"),
              t("settings.email.rows.updatesHQ.description")
            )}
            {row(
              "surveys",
              t("settings.email.rows.surveys.title"),
              t("settings.email.rows.surveys.description")
            )}
            {row(
              "ical",
              t("settings.email.rows.ical.title"),
              t("settings.email.rows.ical.description")
            )}
            {row(
              "proNetwork",
              t("settings.email.rows.proNetwork.title"),
              t("settings.email.rows.proNetwork.description")
            )}
            {row(
              "connections",
              t("settings.email.rows.connections.title"),
              t("settings.email.rows.connections.description")
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
          <h2 style={sectionTitleStyle}>
            {t("settings.email.turnOff.title")}
          </h2>
          <p style={helperTextStyle}>
            {t("settings.email.turnOff.text")}
          </p>
          <button type="button" style={outlineButtonStyle}>
            {t("settings.email.turnOff.button")}
          </button>
        </section>
      </div>
    );
  }

  function renderPrivacyTab() {
    const labelFor = {
      organizers: t("settings.privacy.contacts.organizers"),
      groups: t("settings.privacy.contacts.groups"),
      anyone: t("settings.privacy.contacts.anyone"),
    }[contactPermission];

    return (
      <div style={settingsCardStyle}>
        <h1 style={settingsTitleStyle}>{t("settings.privacy.title")}</h1>

        <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 18 }}>
          {t("settings.privacy.subtitle")}
        </p>

        {/* Contacts */}
        <section style={{ marginBottom: 26 }}>
          <h2 style={sectionTitleStyle}>
            {t("settings.privacy.contacts.sectionTitle")}
          </h2>
          <p style={helperTextStyle}>
            {t("settings.privacy.contacts.helper")}
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
                    ["organizers", "settings.privacy.contacts.organizers"],
                    ["groups", "settings.privacy.contacts.groups"],
                    ["anyone", "settings.privacy.contacts.anyone"],
                  ] as const
                ).map(([value, labelKey]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setContactPermission(value);
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
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </details>
          </div>
        </section>

        {/* Edit profile kısa linki */}
        <section>
          <h2 style={sectionTitleStyle}>
            {t("settings.privacy.profile.sectionTitle")}
          </h2>
          <p style={helperTextStyle}>
            {t("settings.privacy.profile.helper")}
          </p>
          <button
            type="button"
            style={linkButtonStyle}
            onClick={() => setActiveTab("profile")}
          >
            {t("settings.privacy.profile.button")}
          </button>
        </section>
      </div>
    );
  }

  function renderInterestsTab() {
    return (
      <div style={settingsCardStyle}>
        <h1 style={settingsTitleStyle}>
          {t("settings.interests.title")}
        </h1>
        <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 10 }}>
          {t("settings.interests.subtitle")}
        </p>
        <p style={{ fontSize: 11, opacity: 0.7, marginBottom: 18 }}>
          {savingInterests
            ? t("settings.interests.autoSave.saving")
            : t("settings.interests.autoSave.helper")}
        </p>

        {loadingInterests ? (
          <p style={{ fontSize: 13, opacity: 0.8 }}>
            {t("settings.interests.loading")}
          </p>
        ) : allHobbies.length === 0 ? (
          <p style={{ fontSize: 13, opacity: 0.8 }}>
            {t("settings.interests.empty")}
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
              gap: 10,
            }}
          >
            {allHobbies.map((hobby) => {
              const selected = selectedHobbyIds.includes(hobby.id);
              return (
                <button
                  key={hobby.id}
                  type="button"
                  onClick={() => toggleHobbySelection(hobby.id)}
                  style={{
                    borderRadius: 18,
                    padding: "0.7rem 0.9rem",
                    border: selected
                      ? "1px solid rgba(59,130,246,0.7)"
                      : "1px solid rgba(148,163,184,0.55)",
                    background: selected
                      ? "radial-gradient(circle at top,#dbeafe,#ffffff 60%)"
                      : "radial-gradient(circle at top,#fefce8,#ffffff 60%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 6,
                    textAlign: "left",
                    cursor: "pointer",
                    boxShadow: selected
                      ? "0 10px 26px rgba(37,99,235,0.24)"
                      : "0 6px 16px rgba(15,23,42,0.12)",
                    transition:
                      "transform 120ms ease, box-shadow 150ms ease, border-color 120ms ease, background 120ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = selected
                      ? "0 12px 30px rgba(37,99,235,0.28)"
                      : "0 8px 20px rgba(15,23,42,0.18)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = selected
                      ? "0 10px 26px rgba(37,99,235,0.24)"
                      : "0 6px 16px rgba(15,23,42,0.12)";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.97)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    {hobby.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      opacity: 0.75,
                    }}
                  >
                    {selected
                      ? t("settings.interests.card.selected")
                      : t("settings.interests.card.helper")}
                  </span>
                </button>
              );
            })}
          </div>
        )}
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
            {t("settings.sidebar.title")}
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {renderSidebarItem("profile", t("settings.sidebar.profile"))}
            {renderSidebarItem("account", t("settings.sidebar.account"))}
            {renderSidebarItem("email", t("settings.sidebar.email"))}
            {renderSidebarItem("privacy", t("settings.sidebar.privacy"))}
            {renderSidebarItem(
              "social",
              t("settings.sidebar.social"),
              "settings.badge.soon"
            )}
            {renderSidebarItem(
              "interests",
              t("settings.sidebar.interests")
            )}
            {renderSidebarItem(
              "payments",
              t("settings.sidebar.payments"),
              "settings.badge.soon"
            )}
          </div>
        </aside>

        {/* SAĞ ANA İÇERİK */}
        <section>
          {loadingProfile && activeTab === "profile" ? (
            <p style={{ opacity: 0.8 }}>
              {t("settings.profile.loading")}
            </p>
          ) : activeTab === "profile" ? (
            renderEditProfileTab()
          ) : activeTab === "account" ? (
            renderAccountTab()
          ) : activeTab === "email" ? (
            renderEmailTab()
          ) : activeTab === "privacy" ? (
            renderPrivacyTab()
          ) : activeTab === "interests" ? (
            renderInterestsTab()
          ) : (
            <div style={settingsCardStyle}>
              <h1 style={settingsTitleStyle}>
                {t("settings.comingSoon.title")}
              </h1>
              <p style={{ fontSize: 13, opacity: 0.8 }}>
                {t("settings.comingSoon.text")}
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
  boxShadow: "0 20px 52px rgba(15,23,42,0.26)",
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

const primarySmallButtonStyle: React.CSSProperties = {
  marginTop: 4,
  padding: "0.55rem 1.2rem",
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(135deg,#2563eb,#1d4ed8,#1e40af)",
  color: "#f9fafb",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
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
        boxShadow: "0 4px 10px rgba(15,23,42,0.12)",
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
