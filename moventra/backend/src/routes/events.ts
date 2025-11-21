import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

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
 * Etkinlikleri listele
 * Opsiyonel filtreler:
 *   ?city=Berlin
 *   ?hobbyId=1
 *   ?from=2025-01-01T00:00:00.000Z
 *   ?to=2025-02-01T00:00:00.000Z
 *   ?myHobbies=true  → kullanıcının hobilerine göre öneri
 */
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
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

    // Kullanıcının hobilerine göre filtreleme
    if (myHobbies === "true" && req.user) {
      const userHobbies = await prisma.userHobby.findMany({
        where: { userId: req.user.id },
        select: { hobbyId: true },
      });

      const hobbyIds = userHobbies.map(
        (h: { hobbyId: number }) => h.hobbyId
      );

      if (hobbyIds.length === 0) {
        // Kullanıcının hobisi yoksa direkt boş liste
        return res.json({ events: [] });
      }

      // Eğer ayrıca hobbyId query'si verdiyse bunu override etmemesi için
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

    // Sadece event listesini dönmek istersen:
    const events = participations.map((p) => p.event);

    res.json({ events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


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
 * Etkinliğe katıl
 */
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

    // 1) Etkinliği capacity ve katılımcıları ile çek
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // 2) Capacity dolu mu kontrol et (null ise sınırsız demek)
    if (
      event.capacity !== null &&
      event.capacity !== undefined &&
      event.participants.length >= event.capacity
    ) {
      return res.status(400).json({ error: "Event is full" });
    }

    // 3) Zaten katılmış mı?
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

    // 4) Katılım yarat
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

    // Etkinliği bul ve kontrol et
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.createdById !== req.user.id) {
      return res.status(403).json({ error: "You cannot delete this event" });
    }

    // Önce tüm participant kayıtlarını sil
    await prisma.eventParticipant.deleteMany({
      where: { eventId },
    });

    // Sonra event'i sil
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

    // Etkinliği bul
    const existing = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Sadece oluşturan kişi editleyebilsin
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

    // capacity isteğe bağlı
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


export default router;

