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

/**
 * GET /hobbies/my
 * Oturum açmış kullanıcının seçili hobileri
 */
router.get("/my", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userHobbies = await prisma.userHobby.findMany({
      where: { userId: req.user.id },
      include: { hobby: true },
    });

    const hobbies = userHobbies.map((uh) => uh.hobby);

    return res.json({ hobbies });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /hobbies/my
 * Kullanıcının hobilerini güncelle
 * Body: { hobbyIds: number[] }
 */
router.post("/my", authMiddleware, async (req: AuthRequest, res) => {
  try {
    // LOG BURADA
    console.log("📥 SAVE HOBBIES BODY:", req.body);

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { hobbyIds } = req.body as { hobbyIds?: number[] };

    if (!Array.isArray(hobbyIds)) {
      return res.status(400).json({ error: "hobbyIds must be an array" });
    }

    // Önce mevcut hobileri sil
    await prisma.userHobby.deleteMany({
      where: { userId: req.user.id },
    });

    // Yeni hobileri ekle
    if (hobbyIds.length > 0) {
      await prisma.userHobby.createMany({
        data: hobbyIds.map((hobbyId) => ({
          userId: req.user!.id,
          hobbyId,
        })),
        skipDuplicates: true,
      });
    }

    return res.json({ message: "Hobbies updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
