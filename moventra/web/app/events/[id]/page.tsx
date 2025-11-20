"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function EventDetailPage() {
  const { id } = useParams();
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("token")
        : null;

    if (!token) {
      window.location.href = "/login";
      return;
    }

    async function fetchEvent() {
      try {
        const res = await fetch(`${API_URL}/events/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Event not found");
        }

        const data = await res.json();
        setEventData(data.event);
      } catch (err: any) {
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (error) return <p style={{ padding: 20, color: "red" }}>{error}</p>;
  if (!eventData) return <p style={{ padding: 20 }}>Event not found</p>;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 16px",
        fontFamily: "system-ui, sans-serif",
        background: "#020617",
        color: "white",
      }}
    >
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>
          {eventData.title}
        </h1>

        <p style={{ fontSize: 18 }}>
          {eventData.city} • {eventData.location}
        </p>

        <p style={{ marginTop: 10, opacity: 0.8 }}>
          {new Date(eventData.dateTime).toLocaleString()}
        </p>

        <p style={{ marginTop: 10 }}>
          <strong>Hobby:</strong> {eventData.hobby?.name}
        </p>

        <h3 style={{ marginTop: 30, fontSize: 22 }}>Participants:</h3>

        {eventData.participants.length === 0 && (
          <p style={{ opacity: 0.7 }}>No participants yet.</p>
        )}

        <ul style={{ marginTop: 10 }}>
          {eventData.participants.map((p: any) => (
            <li key={p.id} style={{ marginBottom: 6 }}>
              {p.user.name}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
