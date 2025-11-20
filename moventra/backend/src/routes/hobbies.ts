import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

// Tüm hobileri getir
router.get("/", async (req, res) => {
  try {
    const hobbies = await prisma.hobby.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ hobbies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Login kullanıcının hobilerini getir
router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        hobbies: {
          include: {
            hobby: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hobbies = user.hobbies.map((uh) => uh.hobby);

    res.json({ hobbies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Login kullanıcının hobilerini ayarla (tam listeyi günceller)
router.post("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { hobbyIds } = req.body as { hobbyIds: number[] };

    if (!Array.isArray(hobbyIds)) {
      return res.status(400).json({ error: "hobbyIds must be an array" });
    }

    // Önce mevcut bağlantıları sil
    await prisma.userHobby.deleteMany({
      where: { userId: req.user.id },
    });

    // Sonra yeni bağlantıları ekle
    await prisma.userHobby.createMany({
      data: hobbyIds.map((id) => ({
        userId: req.user!.id,
        hobbyId: id,
      })),
    });

    const updated = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        hobbies: {
          include: { hobby: true },
        },
      },
    });

    const hobbies = updated?.hobbies.map((uh) => uh.hobby) || [];

    res.json({ hobbies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
