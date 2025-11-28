"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const CHAT_STORAGE_KEY = "moventra_chat_history_v1";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatWidgetProps = {
  onClose: () => void;
};

export default function ChatWidget({ onClose }: ChatWidgetProps) {
  const { language } = useLanguage();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // UI metinleri dil bazlı
  const TEXT = {
    headerTitle:
      language === "de"
        ? "Moventra-Assistent"
        : language === "en"
        ? "Moventra Assistant"
        : "Moventra asistanı",
    headerSubtitle:
      language === "de"
        ? "Antwortet auf Fragen zu deinem Moventra-Konto und Events."
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
        ? `Merhaba 👋 Du kannst Fragen zu deinem Moventra-Konto, Events und Einstellungen stellen. For example:

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

  // Sayfa yenilense bile geçmişi yükle
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
      // bozulan state olursa ignore
    }
  }, []);

  // Her değişimde sakla + aşağı kaydır
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // storage dolu vs. olursa sessiz geç
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
      // Son 6 mesajı history olarak gönderelim (user/assistant)
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
      const answerText =
        data.answer || data.error || TEXT.errorMessage;

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: answerText,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `${Date.now()}-error`,
        role: "assistant",
        content: TEXT.errorMessage,
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
              {TEXT.headerTitle}
            </div>
            <div
              style={{
                fontSize: 11,
                opacity: 0.7,
              }}
            >
              {TEXT.headerSubtitle}
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
              {TEXT.newChatLabel}
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
              {TEXT.intro}
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
            {TEXT.historyNote}
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
              placeholder={TEXT.inputPlaceholder}
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
              {sending ? TEXT.sendingLabel : TEXT.sendLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
