// src/routes/avatar.ts
import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

// GET /avatar/me
router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const avatar = await prisma.userAvatar.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    const items = await prisma.userAvatarItem.findMany({
      where: { userId: req.user.id },
      include: {
        avatarItem: true,
      },
    });

    return res.json({
      avatar,
      items, // içindeki avatarItem.slot, modelUrl vs. ile birlikte gelecek
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
