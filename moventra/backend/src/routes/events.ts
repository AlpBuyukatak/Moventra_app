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
 * POST /events/:id/join
 * Etkinliğe katıl
 */
router.post("/:id/join", authMiddleware, async (req: AuthRequest, res) => {
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

    if (existing) {
      return res.status(400).json({ error: "Already joined" });
    }

    const participant = await prisma.eventParticipant.create({
      data: {
        userId: req.user.id,
        eventId,
      },
    });

    res.json({ participant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
