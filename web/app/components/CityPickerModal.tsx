"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Country = {
  id: number;
  name: string;
  iso2: string;
};

type State = {
  id: number;
  name: string;
  country_id: number;
};

export type LocationSelection = {
  countryCode: string;
  countryName: string;
  stateId: number;
  stateName: string;  // Bavaria, Berlin, NRW...
  // cityName'ı ARTIK kullanmıyoruz, istersen tamamen silebilirsin
  // cityName?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: LocationSelection) => void;
  initialCountryCode?: string;
  initialRegionName?: string;
};

export default function CityPickerModal({
  isOpen,
  onClose,
  onSelect,
  initialCountryCode,
  initialRegionName,
}: Props) {
  const { t } = useLanguage();

  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Modal açıldığında dışarıdan gelen başlangıç değerlerini yükle
  useEffect(() => {
    if (!isOpen) return;

    if (initialCountryCode) {
      setSelectedCountry(initialCountryCode);
    } else {
      setSelectedCountry("");
    }
    setSelectedState("");
    setStates([]);
  }, [isOpen, initialCountryCode]);

  // ⌨️ ESC tuşu ile kapatma
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Ülkeler
  useEffect(() => {
    if (!isOpen) return;

    const fetchCountries = async () => {
      try {
        const res = await fetch(`${API_URL}/location/countries`);
        const data = await res.json();
        setCountries(
          data.map((c: any) => ({
            id: c.id,
            name: c.name,
            iso2: c.iso2,
          }))
        );
      } catch (err) {
        console.error("Countries fetch error", err);
      }
    };

    fetchCountries();
  }, [isOpen]);

  // Ülke seçilince state’leri getir
  useEffect(() => {
    if (!selectedCountry || !isOpen) return;

    const fetchStates = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_URL}/location/states?country_code=${selectedCountry}`
        );
        const data = await res.json();

        const mapped = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          country_id: s.country_id,
        }));

        setStates(mapped);

// Eğer başlangıç region adı geldiyse (ör: "Berlin"),
// ona karşılık gelen state’i otomatik seç
if (initialRegionName) {
  const match = mapped.find(
    (s: State) =>
      s.name.toLowerCase() === initialRegionName.toLowerCase()
  );

  if (match) {
    setSelectedState(String(match.id));
  }
}
      } catch (err) {
        console.error("States fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, [selectedCountry, isOpen, initialRegionName]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCountry(value);
    setSelectedState("");
    setStates([]);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
  };

  const handleConfirm = () => {
    if (!selectedCountry || !selectedState) return;

    const country = countries.find((c) => c.iso2 === selectedCountry)!;
    const state = states.find(
      (s) => String(s.id) === String(selectedState)
    )!;

onSelect({
  countryCode: country.iso2,
  countryName: country.name,
  stateId: state.id,
  stateName: state.name,
});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose} // overlay'e tıklayınca kapat
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()} // içeri tıklayınca kapanmasın
        style={{
          width: "90%",
          maxWidth: 480,
          background: "var(--bg)",
          borderRadius: 24,
          padding: "1.5rem",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          border: "1px solid var(--card-border)",
          color: "var(--fg)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>
            {t("cityPicker.title")}
          </h2>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              color: "#94a3b8",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Ülke seçimi */}
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            style={{
              padding: "0.6rem 0.8rem",
              borderRadius: 999,
              border: "1px solid var(--card-border)",
              background: "var(--card-bg)",
              color: "var(--fg)",
              fontSize: 14,
            }}
          >
            <option value="">
              {t("cityPicker.countryPlaceholder")}
            </option>
            {countries.map((c) => (
              <option key={c.id} value={c.iso2}>
                {c.name}
              </option>
            ))}
          </select>

          {/* State / şehir benzeri ikinci seçim */}
          <select
            value={selectedState}
            onChange={handleStateChange}
            disabled={!selectedCountry || loading}
            style={{
              padding: "0.6rem 0.8rem",
              borderRadius: 999,
              border: "1px solid var(--card-border)",
              background: "var(--card-bg)",
              color: "var(--fg)",
              fontSize: 14,
              opacity: !selectedCountry ? 0.5 : 1,
            }}
          >
            <option value="">
              {!selectedCountry
                ? t("cityPicker.selectCountryFirst")
                : loading
                ? t("cityPicker.loadingStates")
                : t("cityPicker.statePlaceholder")}
            </option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selectedCountry || !selectedState}
          style={{
            marginTop: "1.25rem",
            width: "100%",
            padding: "0.7rem 1rem",
            borderRadius: 999,
            border: "none",
            fontWeight: 600,
            fontSize: 15,
            cursor:
              !selectedCountry || !selectedState ? "not-allowed" : "pointer",
            background:
              !selectedCountry || !selectedState
                ? "rgba(148,163,184,0.3)"
                : "linear-gradient(135deg,#22c55e,#16a34a,#15803d)",
            color: "white",
          }}
        >
          {t("cityPicker.showEventsButton")}
        </button>
      </div>
    </div>
  );
}
