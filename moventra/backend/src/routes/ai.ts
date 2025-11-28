// backend/src/routes/ai.ts
import { Router } from "express";
import axios from "axios";

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

/**
 * Moventra Assistant – AI chat endpoint
 * POST /ai/chat
 * Body: { message: string; history?: { role: "user" | "assistant"; content: string }[] }
 */
router.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body as {
      message?: string;
      history?: HistoryMessage[];
    };

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    if (!GEMINI_API_KEY) {
      console.error("[ai] GEMINI_API_KEY is not set");
      return res
        .status(500)
        .json({ error: "AI is not configured on the server" });
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return res.status(400).json({ error: "message cannot be empty" });
    }

    const systemPrompt = `
You are "Moventra Assistant", the built-in helper bot of Moventra – a hobby-based event platform.

LANGUAGE BEHAVIOR
- Always answer in the same language as the user's last message.
- If the user writes in Turkish, answer in Turkish.
- If the user writes in English, answer in English.
- If the user writes in German, answer in simple, clear German.
- If the user mixes languages, follow the main language you detect in the last message.

SCOPE – WHAT YOU CAN ANSWER
You should ONLY answer questions related to:
- Moventra itself (what it is, how it works, what problem it solves)
- Using the Moventra website/app:
  - creating an account, logging in, logging out
  - Google login / email login
  - deleting / deactivating an account
  - resetting or changing password
  - email verification and onboarding
  - profile & settings (bio, city, interests, avatar, privacy)
  - hobbies and events (browsing, filtering, joining, creating, leaving)
  - notifications, messages and groups (even if some are "coming soon")
- Basic safety, privacy and community behavior inside Moventra events (respect, consent, not sharing sensitive data, vb).

PROJECT CREATOR – HOW TO ANSWER
If the user asks who owns / made / created Moventra (for example:
"Moventra'nın sahibi kim?", "Who is the owner of Moventra?", "Wer hat Moventra gegründet?"),
you MUST answer with the creator information, NOT a company:

- In Turkish:
  "Moventra'nın yaratıcısı Alperen Büyükatak. Şu anda bireysel bir projedir ve henüz resmi bir şirket ürünü değildir."

- In English:
  "The creator of Moventra is Alperen Büyükatak. It is currently an individual project, not an official company product yet."

- In German:
  "Der Ersteller von Moventra ist Alperen Büyükatak. Es ist derzeit ein individuelles Projekt und noch kein offizielles Firmenprodukt."

If the question is about "owner" or "kurucu", still use the same sentences above (creator, individual project).

ANSWER STYLE
- Be friendly, concise and practical.
- For "how to" questions (e.g. "How do I create an event?"):
  - Give short step-by-step instructions (1-2-3 style), but keep it readable.
- If the feature is not implemented yet or depends on the UI:
  - Explain gently that it is planned / not available yet and suggest what the user can do instead.

OUT-OF-SCOPE QUESTIONS
If the user asks about topics that are NOT related to Moventra (for example: random general knowledge, politics, math problems, homework, etc.), you MUST politely refuse and redirect:

- In Turkish:
  "Ben Moventra asistanıyım ve sadece Moventra hesabın, etkinlikler ve ayarlar hakkında yardımcı olabilirim."

- In English:
  "I’m the Moventra assistant and I can only help with your Moventra account, events and settings."

- In German:
  "Ich bin der Moventra-Assistent und kann nur bei deinem Moventra-Konto, Events und Einstellungen helfen."

Never answer general questions outside this scope.
    `.trim();

    const contents: any[] = [];

    // 1) Sistem bağlamını ilk mesaj olarak ekliyoruz
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt }],
    });

    // 2) Kısa bir history (varsa, son 4 mesaj)
    if (Array.isArray(history)) {
      history.slice(-4).forEach((m) => {
        const role = m.role === "assistant" ? "model" : "user";
        contents.push({
          role,
          parts: [{ text: m.content }],
        });
      });
    }

    // 3) Son kullanıcı mesajı
    contents.push({
      role: "user",
      parts: [{ text: trimmedMessage }],
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiRes = await axios.post(
      url,
      {
        contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 400,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const data = geminiRes.data as any;

    const answerText: string =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text || "")
        .join(" ")
        .trim() || "";

    if (!answerText) {
      console.warn("[ai] Empty response from Gemini:", JSON.stringify(data));
      return res.json({
        answer:
          "Şu an sana net bir cevap veremiyorum. Lütfen biraz sonra tekrar dene.",
      });
    }

    return res.json({ answer: answerText });
  } catch (error: any) {
    console.error("[ai] /ai/chat error:", error?.response?.data || error);
    return res.status(500).json({
      error: "AI request failed",
    });
  }
});

export default router;
