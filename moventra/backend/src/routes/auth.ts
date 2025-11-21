import { Router } from "express";
import prisma from "../prisma";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";



const router = Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, city } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Email zaten var mı?
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Şifre hash
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        city,
      },
      select: {
        id: true,
        email: true,
        name: true,
        city: true,
        createdAt: true,
      },
    });

    return res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

const jwtSecret = (process.env.JWT_SECRET || "dev-secret") as string;

const token = jwt.sign(
  { userId: user.id, email: user.email },
  jwtSecret,
  {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as string,
  } as SignOptions
);


    // Şifreyi dönmüyoruz
    const { passwordHash, ...safeUser } = user;

    return res.json({
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
// CURRENT USER
router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        city: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * PUT /auth/me
 * Profili güncelle (name, city)
 */
router.put("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, city } = req.body as {
      name?: string;
      city?: string | null;
    };

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name.trim(),
        city: city !== undefined ? city?.trim() || null : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        city: true,
        createdAt: true,
      },
    });

    return res.json({ user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});


/**
 * PUT /auth/me
 * Mevcut kullanıcının profilini güncelle (name, city)
 */
router.put("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, city } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Name is required" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        city: city ?? null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        city: true,
        createdAt: true,
      },
    });

    return res.json({ user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});


export default router;
