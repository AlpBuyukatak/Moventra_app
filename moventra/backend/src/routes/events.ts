import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";
import jwt from "jsonwebtoken";
import axios from "axios";

const router = Router();

// myHobbies filtresi için JWT'yi manuel okuyacağız
const jwtSecret = (process.env.JWT_SECRET || "dev-secret") as string;

/**
 * POST /events
 * Etkinlik oluştur (sadece giriş yapmış kullanıcı)
 */
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      title,
      description,
      city,
      location,
      dateTime,
      hobbyId,
      capacity,
    } = req.body;

    if (!title || !city || !dateTime || !hobbyId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        city,
        location,
        dateTime: new Date(dateTime),
        hobbyId: Number(hobbyId),
        capacity: capacity ? Number(capacity) : null,
        createdById: req.user.id,
      },
    });

    res.json({ event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /events
 * Etkinlikleri listele (ARTIK PUBLIC)
 * Opsiyonel filtreler:
 *   ?city=Berlin
 *   ?hobbyId=1
 *   ?from=2025-01-01T00:00:00.000Z
 *   ?to=2025-02-01T00:00:00.000Z
 *   ?myHobbies=true  → kullanıcının hobilerine göre öneri (token zorunlu)
 */
router.get("/", async (req: AuthRequest, res) => {
  try {
    const { city, hobbyId, from, to, myHobbies } = req.query;

    const filters: any = {};

    if (city) {
      filters.city = String(city);
    }

    if (hobbyId) {
      filters.hobbyId = Number(hobbyId);
    }

    if (from || to) {
      filters.dateTime = {};
      if (from) filters.dateTime.gte = new Date(String(from));
      if (to) filters.dateTime.lte = new Date(String(to));
    }

    // 🔑 Opsiyonel token okuma (Authorization header varsa)
    let userId: number | null = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, jwtSecret) as {
          userId: number;
          email: string;
        };
        userId = decoded.userId;
      } catch (e) {
        // Token geçersizse sessizce yok say → public devam etsin
        userId = null;
      }
    }

    // Kullanıcının hobilerine göre filtreleme (myHobbies=true ve token varsa)
    if (myHobbies === "true") {
      if (!userId) {
        return res.status(401).json({
          error: "You must be logged in to use myHobbies filter",
        });
      }

      const userHobbies = await prisma.userHobby.findMany({
        where: { userId },
        select: { hobbyId: true },
      });

      const hobbyIds = userHobbies.map((h) => h.hobbyId);

      if (hobbyIds.length === 0) {
        // Kullanıcının hobisi yoksa direkt boş liste
        return res.json({ events: [] });
      }

      filters.hobbyId = { in: hobbyIds };
    }

    const events = await prisma.event.findMany({
      where: filters,
      orderBy: { dateTime: "asc" },
      include: {
        hobby: true,
        createdBy: { select: { id: true, name: true, city: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    res.json({ events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /events/external
 * Seçilen şehre göre dış event sağlayıcılardan etkinlik getir
 *
 * Query:
 *   ?city=Berlin
 *   ?country=DE
 *   ?limit=10
 *
 * Örnek: /events/external?city=Nuremberg&country=DE&limit=6
 *
 * Kaynaklar:
 *  - Ticketmaster Discovery API
 *  - Eventbrite API
 *
 * Not: Aynı isme (title) sahip etkinlikler tekilleştirilir.
 */
router.get("/external", async (req, res) => {
  try {
    const city = (req.query.city as string | undefined)?.trim();
    const country = (req.query.country as string | undefined)?.trim();
    const limitRaw = req.query.limit as string | undefined;
    const limit = limitRaw
      ? Math.min(Math.max(parseInt(limitRaw, 10) || 0, 1), 20)
      : 10;

    if (!city) {
      return res.status(400).json({ error: "city query param is required" });
    }

    const ticketmasterKey = process.env.TICKETMASTER_API_KEY;
    const eventbriteKey = process.env.EVENTBRITE_API_KEY;

    if (!ticketmasterKey && !eventbriteKey) {
      return res.status(500).json({
        error:
          "External events provider is not configured (missing TICKETMASTER_API_KEY / EVENTBRITE_API_KEY)",
      });
    }

    // İstekleri paralel atalım (olan provider'lar için)
    const requests: Promise<any>[] = [];

    if (ticketmasterKey) {
      requests.push(
        axios
          .get("https://app.ticketmaster.com/discovery/v2/events.json", {
            params: {
              apikey: ticketmasterKey,
              city,
              countryCode: country,
              size: limit,
              sort: "date,asc",
            },
            timeout: 8000,
          })
          .catch((err) => {
            console.error(
              "Ticketmaster fetch error:",
              err?.response?.data || err
            );
            return { data: null };
          })
      );
    } else {
      requests.push(Promise.resolve({ data: null }));
    }

    if (eventbriteKey) {
      // Eventbrite search endpoint
      requests.push(
        axios
          .get("https://www.eventbriteapi.com/v3/events/search/", {
            params: {
              "location.address": city,
              "location.within": "15km",
              sort_by: "date",
              page_size: limit,
            },
            headers: {
              Authorization: `Bearer ${eventbriteKey}`,
            },
            timeout: 8000,
          })
          .catch((err) => {
            console.error(
              "Eventbrite fetch error:",
              err?.response?.data || err
            );
            return { data: null };
          })
      );
    } else {
      requests.push(Promise.resolve({ data: null }));
    }

    const [tmRes, ebRes] = await Promise.all(requests);

    /* ---------- Ticketmaster map ---------- */
    const tmEventsRaw = tmRes?.data?._embedded?.events || [];
    const tmMapped = (tmEventsRaw as any[]).map((ev) => {
      const firstVenue = ev._embedded?.venues?.[0];
      const cityName =
        firstVenue?.city?.name || firstVenue?.name || city;

      const startDate =
        ev.dates?.start?.dateTime || ev.dates?.start?.localDate;

      return {
        id: `tm_${ev.id}`,
        externalId: ev.id,
        externalSource: "ticketmaster",
        title: ev.name || "External event",
        description: ev.info || ev.pleaseNote || "",
        city: cityName || city,
        location:
          firstVenue?.name ||
          [firstVenue?.address?.line1, firstVenue?.city?.name]
            .filter(Boolean)
            .join(" • ") ||
          null,
        dateTime: startDate
          ? new Date(startDate).toISOString()
          : new Date().toISOString(),
        hobby: null,
        capacity: null,
        participants: [],
        url: ev.url || null,
        imageUrl:
          (ev.images || []).find((img: any) => img.url)?.url || null,
      };
    });

    /* ---------- Eventbrite map ---------- */
    const ebEventsRaw = ebRes?.data?.events || [];
    const ebMapped = (ebEventsRaw as any[]).map((ev) => {
      const startDate = ev.start?.utc || ev.start?.local;
      return {
        id: `eb_${ev.id}`,
        externalId: ev.id,
        externalSource: "eventbrite",
        title: ev.name?.text || "External event",
        description: ev.summary || ev.description?.text || "",
        city, // Eventbrite'te venue için ayrı istek gerekir; basitçe seçili city
        location: null, // İstersen venue endpoint ile genişletebiliriz
        dateTime: startDate
          ? new Date(startDate).toISOString()
          : new Date().toISOString(),
        hobby: null,
        capacity: ev.capacity ?? null,
        participants: [],
        url: ev.url || null,
        imageUrl: ev.logo?.url || null,
      };
    });

    /* ---------- Merge + title'e göre dedupe ---------- */
    const mergedMap = new Map<string, any>();

    const addToMap = (list: any[]) => {
      for (const ev of list) {
        const key = (ev.title || "").trim().toLowerCase();
        if (!key) continue;

        if (!mergedMap.has(key)) {
          mergedMap.set(key, ev);
        } else {
          // Aynı title varsa, tarihi daha erken olanı tercih edelim
          const existing = mergedMap.get(key);
          const existingTime = new Date(existing.dateTime).getTime();
          const newTime = new Date(ev.dateTime).getTime();
          if (newTime < existingTime) {
            mergedMap.set(key, ev);
          }
        }
      }
    };

    addToMap(tmMapped);
    addToMap(ebMapped);

    let events = Array.from(mergedMap.values());

    // Tarihe göre sırala
    events.sort(
      (a, b) =>
        new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );

    return res.json({ events });
  } catch (error: any) {
    console.error("GET /events/external error:", error?.response?.data || error);
    return res.status(500).json({ error: "Failed to load external events" });
  }
});

/**
 * GET /events/my/created
 * Oturum açmış kullanıcının oluşturduğu etkinlikler
 */
router.get("/my/created", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const events = await prisma.event.findMany({
      where: { createdById: req.user.id },
      orderBy: { dateTime: "asc" },
      include: {
        hobby: true,
        participants: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    res.json({ events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /events/my/joined
 * Oturum açmış kullanıcının katıldığı etkinlikler
 */
router.get("/my/joined", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const participations = await prisma.eventParticipant.findMany({
      where: { userId: req.user.id },
      include: {
        event: {
          include: {
            hobby: true,
            createdBy: { select: { id: true, name: true, city: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const events = participations.map((p) => p.event);

    res.json({ events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /events/my/upcoming
 * Oturum açmış kullanıcının oluşturduğu veya katıldığı
 * ve bugünden sonraki tüm etkinlikler (upcoming)
 */
router.get("/my/upcoming", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const now = new Date();

    const events = await prisma.event.findMany({
      where: {
        dateTime: { gte: now },
        OR: [
          { createdById: req.user.id },
          { participants: { some: { userId: req.user.id } } },
        ],
      },
      orderBy: { dateTime: "asc" },
      include: {
        hobby: true,
        createdBy: { select: { id: true, name: true, city: true } },
        participants: {
          select: {
            userId: true,
          },
        },
      },
    });

    return res.json({ events });
  } catch (error) {
    console.error("GET /events/my/upcoming error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /events/:id/messages
 * Bir etkinliğin mesajlarını getir (mini chat)
 * Son 50 mesaj, eski→yeni
 */
router.get("/:id/messages", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const eventId = Number(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const messages = await prisma.eventMessage.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
      take: 50,
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return res.json({ messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /events/:id/messages
 * Etkinlik mini chat'ine mesaj gönder
 */
router.post("/:id/messages", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const eventId = Number(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    const { content } = req.body as { content?: string };

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Message content is required" });
    }

    if (content.length > 500) {
      return res.status(400).json({ error: "Message is too long" });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: {
          where: { userId: req.user.id },
          select: { id: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const isOwner = event.createdById === req.user.id;
    const isParticipant = event.participants.length > 0;

    if (!isOwner && !isParticipant) {
      return res
        .status(403)
        .json({ error: "You must join the event to send messages" });
    }

    const now = new Date();

    const twoDaysAfter = new Date(event.dateTime);
    twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);

    if (now > twoDaysAfter) {
      return res.status(400).json({ error: "Chat is closed for this event" });
    }

    if (!isOwner) {
      const lastMessage = await prisma.eventMessage.findFirst({
        where: {
          eventId,
          userId: req.user.id,
        },
        orderBy: { createdAt: "desc" },
      });

      if (lastMessage) {
        const diffMs = now.getTime() - lastMessage.createdAt.getTime();
        const diffMinutes = diffMs / (1000 * 60);

        if (diffMinutes < 60) {
          const minutesLeft = Math.ceil(60 - diffMinutes);
          return res.status(400).json({
            error: `You can send a new message in ${minutesLeft} minute(s).`,
          });
        }
      }
    }

    const message = await prisma.eventMessage.create({
      data: {
        eventId,
        userId: req.user.id,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return res.json({ message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PATCH /events/:eventId/messages/:messageId
 * Mesaj düzenle
 */
router.patch(
  "/:eventId/messages/:messageId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const eventId = Number(req.params.eventId);
      const messageId = Number(req.params.messageId);

      if (isNaN(eventId) || isNaN(messageId)) {
        return res.status(400).json({ error: "Invalid ids" });
      }

      const { content } = req.body as { content?: string };

      if (!content || !content.trim()) {
        return res.status(400).json({ error: "Message content is required" });
      }
      if (content.length > 500) {
        return res.status(400).json({ error: "Message is too long" });
      }

      const message = await prisma.eventMessage.findUnique({
        where: { id: messageId },
        include: {
          event: {
            select: { id: true, createdById: true, dateTime: true },
          },
        },
      });

      if (!message || message.eventId !== eventId) {
        return res.status(404).json({ error: "Message not found" });
      }

      const isOwner = message.event.createdById === req.user.id;
      const isAuthor = message.userId === req.user.id;

      if (!isOwner && !isAuthor) {
        return res.status(403).json({
          error: "You are not allowed to edit this message",
        });
      }

      const now = new Date();
      const twoDaysAfter = new Date(message.event.dateTime);
      twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);

      if (now > twoDaysAfter) {
        return res
          .status(400)
          .json({ error: "Chat is closed for this event" });
      }

      const updated = await prisma.eventMessage.update({
        where: { id: messageId },
        data: {
          content: content.trim(),
        },
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      return res.json({ message: updated });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * DELETE /events/:eventId/messages/:messageId
 * Mesaj sil
 */
router.delete(
  "/:eventId/messages/:messageId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const eventId = Number(req.params.eventId);
      const messageId = Number(req.params.messageId);

      if (isNaN(eventId) || isNaN(messageId)) {
        return res.status(400).json({ error: "Invalid ids" });
      }

      const message = await prisma.eventMessage.findUnique({
        where: { id: messageId },
        include: {
          event: {
            select: { id: true, createdById: true, dateTime: true },
          },
        },
      });

      if (!message || message.eventId !== eventId) {
        return res.status(404).json({ error: "Message not found" });
      }

      const isOwner = message.event.createdById === req.user.id;
      const isAuthor = message.userId === req.user.id;

      if (!isOwner && !isAuthor) {
        return res.status(403).json({
          error: "You are not allowed to delete this message",
        });
      }

      const now = new Date();
      const twoDaysAfter = new Date(message.event.dateTime);
      twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);

      if (now > twoDaysAfter) {
        return res
          .status(400)
          .json({ error: "Chat is closed for this event" });
      }

      await prisma.eventMessage.delete({
        where: { id: messageId },
      });

      return res.json({ ok: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * GET /events/:id
 * Tek bir etkinliği detayları ile getir
 */
router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        hobby: true,
        createdBy: { select: { id: true, name: true, city: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /events/:id/unjoin
 * Etkinlikten ayrıl
 */
router.post("/:id/unjoin", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const eventId = Number(req.params.id);

    const existing = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId: req.user.id,
          eventId,
        },
      },
    });

    if (!existing) {
      return res
        .status(400)
        .json({ error: "You are not joined to this event" });
    }

    await prisma.eventParticipant.delete({
      where: {
        userId_eventId: {
          userId: req.user.id,
          eventId,
        },
      },
    });

    return res.json({ message: "Successfully unjoined" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /events/:id/join
 * Etkinliğe katıl (capacity kontrolü ile)
 */
router.post("/:id/join", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const eventId = Number(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (
      event.capacity !== null &&
      event.capacity !== undefined &&
      event.participants.length >= event.capacity
    ) {
      return res.status(400).json({ error: "Event is full" });
    }

    const existing = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId: req.user.id,
          eventId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: "Already joined" });
    }

    const participant = await prisma.eventParticipant.create({
      data: {
        userId: req.user.id,
        eventId,
      },
    });

    return res.json({ participant });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE /events/:id
 * Event silme (sadece oluşturan kişi)
 */
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const eventId = Number(req.params.id);

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.createdById !== req.user.id) {
      return res.status(403).json({ error: "You cannot delete this event" });
    }

    await prisma.eventParticipant.deleteMany({
      where: { eventId },
    });

    await prisma.event.delete({
      where: { id: eventId },
    });

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * PUT /events/:id
 * Etkinliği güncelle (sadece oluşturan kullanıcı)
 */
router.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const eventId = Number(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    const existing = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (existing.createdById !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not allowed to edit this event" });
    }

    const {
      title,
      description,
      city,
      location,
      dateTime,
      hobbyId,
      capacity,
    } = req.body;

    if (!title || !city || !dateTime || !hobbyId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updateData: any = {
      title,
      description,
      city,
      location,
      dateTime: new Date(dateTime),
      hobbyId: Number(hobbyId),
    };

    if (capacity === null || capacity === undefined || capacity === "") {
      updateData.capacity = null;
    } else {
      updateData.capacity = Number(capacity);
      if (Number.isNaN(updateData.capacity)) {
        return res.status(400).json({ error: "Invalid capacity" });
      }
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    return res.json({ event: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /events/my/favorites
 * Oturum açmış kullanıcının favori etkinlikleri
 */
router.get("/my/favorites", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const favorites = await prisma.eventFavorite.findMany({
      where: { userId: req.user.id },
      include: {
        event: {
          include: {
            hobby: true,
            createdBy: { select: { id: true, name: true, city: true } },
            participants: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const events = favorites.map((f) => f.event);

    return res.json({ events });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /events/:id/favorite
 * Etkinliği favorilere ekle
 */
router.post("/:id/favorite", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const eventId = Number(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    await prisma.eventFavorite.upsert({
      where: {
        userId_eventId: {
          userId: req.user.id,
          eventId,
        },
      },
      update: {},
      create: {
        userId: req.user.id,
        eventId,
      },
    });

    return res.json({ message: "Favorited" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /events/:id/unfavorite
 * Etkinliği favorilerden çıkar
 */
router.post(
  "/:id/unfavorite",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const eventId = Number(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ error: "Invalid event id" });
      }

      await prisma.eventFavorite.deleteMany({
        where: {
          userId: req.user.id,
          eventId,
        },
      });

      return res.json({ message: "Unfavorited" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * GET /events/:id/comments
 * Bir etkinliğin yorumlarını getir
 */
router.get("/:id/comments", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const eventId = Number(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    const comments = await prisma.eventComment.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return res.json({ comments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /events/:id/comments
 * Yorum ekle (mini chat)
 */
router.post("/:id/comments", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const eventId = Number(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    const { content } = req.body as { content?: string };

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Content is required" });
    }
    if (content.length > 300) {
      return res
        .status(400)
        .json({ error: "Comment is too long (max 300 characters)" });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const now = new Date();
    const endLimit = new Date(event.dateTime);
    endLimit.setDate(endLimit.getDate() + 7);

    if (now > endLimit) {
      return res.status(400).json({
        error: "Comments are closed for this event (time limit reached)",
      });
    }

    const comment = await prisma.eventComment.create({
      data: {
        eventId,
        userId: req.user.id,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return res.json({ comment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
