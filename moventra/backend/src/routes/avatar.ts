// src/routes/avatar.ts
import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

// GET /avatar/me
router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    // Avatarı bul
    let avatar = await prisma.userAvatar.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Yoksa default renklerle oluştur
    if (!avatar) {
      avatar = await prisma.userAvatar.create({
        data: {
          userId: req.user.id,
          // Prisma'daki default değerler zaten devreye girer,
          // istersen buraya da yazabilirsin ama şart değil.
        },
        include: {
          user: { select: { id: true, name: true } },
        },
      });
    }

    // Avatar item'ları (ileride aksesuar için)
    const items = await prisma.userAvatarItem.findMany({
      where: { userId: req.user.id },
      include: {
        avatarItem: true,
      },
    });

    return res.json({
      avatar,
      items,
    });
  } catch (err) {
    console.error("Avatar GET error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// PUT /avatar/me  -> renkleri + şapka bilgisi güncelle
router.put("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { hairColor, shirtColor, pantsColor, skinColor, hatColor, hasHat } =
      req.body;

    const avatar = await prisma.userAvatar.upsert({
      where: { userId: req.user.id },
      update: {
        // buradaki alan isimleri Prisma şemasıyla birebir aynı:
        hairColor,
        shirtColor,
        pantsColor,
        skinColor,
        hatColor,
        hasHat,
      },
      create: {
        userId: req.user.id,
        hairColor: hairColor ?? "#facc15",
        shirtColor: shirtColor ?? "#3b82f6",
        pantsColor: pantsColor ?? "#111827",
        skinColor: skinColor ?? "#f3c9a8",
        hatColor,
        hasHat: !!hasHat,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return res.json({ avatar });
  } catch (err) {
    console.error("Avatar PUT error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
