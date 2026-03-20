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

/* ============================================
 * Title suggestion endpoint for events
 * POST /ai/title-suggestions
 * Body: { hobbyName: string; language?: "tr" | "en" | "de" }
 * Response: { suggestions: string[] }
 * ============================================
 */

type TitleSuggestionBody = {
  hobbyName?: string;
  language?: "tr" | "en" | "de";
};

router.post("/title-suggestions", async (req, res) => {
  try {
    const { hobbyName, language } = req.body as TitleSuggestionBody;

    if (!hobbyName || typeof hobbyName !== "string") {
      return res
        .status(400)
        .json({ error: "hobbyName is required as a non-empty string" });
    }

    const trimmedHobby = hobbyName.trim();
    if (!trimmedHobby) {
      return res
        .status(400)
        .json({ error: "hobbyName cannot be an empty string" });
    }

    // Dil ayarı – boşsa İngilizce kabul edelim
    const lang: "tr" | "en" | "de" =
      language === "tr" || language === "de" ? language : "en";

    // Gemini çalışmasa bile backend tarafında fallback üretelim
    const buildFallback = (base: string): string[] => {
      const b = base.trim();
      if (!b) return [];
      return [
        `${b} meetup for newcomers`,
        `${b} night with new friends`,
        `${b} club – let's meet!`,
        `${b} hangout in your city`,
      ];
    };

    // Eğer gemini key yoksa, direkt fallback dön
    if (!GEMINI_API_KEY) {
      console.warn("[ai] GEMINI_API_KEY not set, using fallback suggestions");
      return res.json({ suggestions: buildFallback(trimmedHobby) });
    }

    const languageHint =
      lang === "tr"
        ? "Write all titles in natural Turkish."
        : lang === "de"
        ? "Write all titles in simple, clear German."
        : "Write all titles in natural, friendly English.";

    const prompt = `
You are helping users create small, friendly hobby meetups on Moventra.

HOBBY: "${trimmedHobby}"

TASK:
- Generate 4 short, catchy event title ideas for a meetup based on this hobby.
- Titles should sound like real event names people would happily join.
- Keep each title under 60 characters if possible.

${languageHint}

RESPONSE FORMAT (VERY IMPORTANT):
- Return ONLY a valid JSON array of strings.
- Do NOT add any explanations, markdown or extra text.

Example (shape only):

[
  "Chess night for curious beginners",
  "Sunday board game hangout",
  "Casual game night with new friends",
  "Strategy & snacks evening"
]
    `.trim();

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    let suggestions: string[] = [];

    try {
      const geminiRes = await axios.post(
        url,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
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

      const rawText: string =
        data?.candidates?.[0]?.content?.parts
          ?.map((p: any) => p.text || "")
          .join(" ")
          .trim() || "";

      if (!rawText) {
        console.warn("[ai] Empty response from Gemini for title-suggestions");
        suggestions = buildFallback(trimmedHobby);
      } else {
        try {
          const parsed = JSON.parse(rawText);
          if (Array.isArray(parsed)) {
            suggestions = parsed
              .filter((x) => typeof x === "string")
              .map((s) => s.trim())
              .filter((s) => s.length > 0)
              .slice(0, 4);
          }
        } catch (parseErr) {
          console.warn(
            "[ai] Failed to parse Gemini JSON for title-suggestions:",
            parseErr
          );
          suggestions = buildFallback(trimmedHobby);
        }
      }
    } catch (geminiErr: any) {
      console.error(
        "[ai] /ai/title-suggestions Gemini error:",
        geminiErr?.response?.data || geminiErr
      );
      suggestions = buildFallback(trimmedHobby);
    }

    if (!suggestions || suggestions.length === 0) {
      suggestions = buildFallback(trimmedHobby);
    }

    return res.json({ suggestions });
  } catch (error: any) {
    console.error(
      "[ai] /ai/title-suggestions error:",
      error?.response?.data || error
    );
    // Burada bile mümkünse fallback dönelim ki frontend kırılmasın
    const hobbyName =
      (req.body as TitleSuggestionBody)?.hobbyName?.trim() || "Hobby meetup";
    const fallback = [
      `${hobbyName} meetup for newcomers`,
      `${hobbyName} night with new friends`,
      `${hobbyName} club – let's meet!`,
      `${hobbyName} hangout in your city`,
    ];
    return res.json({ suggestions: fallback });
  }
});

export default router;
