import { Router } from "express";
import prisma from "../prisma";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";
import { loginLimiter, emailCodeLimiter } from "../middleware/rateLimit";
import nodemailer from "nodemailer";
import axios from "axios";

const router = Router();

/* =========================
   JWT yardımcı fonksiyonu
   ========================= */
function signJwtForUser(user: { id: number; email: string }) {
  const jwtSecret = (process.env.JWT_SECRET || "dev-secret") as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as string;

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    jwtSecret,
    { expiresIn } as SignOptions
  );

  return token;
}

/* =========================
   NODEMAILER TRANSPORTER
   ========================= */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* =========================
   REGISTER
   ========================= */

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, city } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

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

/* =========================
   PASSWORD LOGIN (JWT)
   ========================= */

router.post("/login", loginLimiter, async (req, res) => {
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

    const token = signJwtForUser(user);

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

/* =========================
   GOOGLE LOGIN (OAuth)
   ========================= */
/**
 * POST /auth/google
 * Body: { idToken: string }
 *
 * Frontend, Google'dan aldığı ID token'ı gönderir.
 * Backend:
 *  - Google token'i doğrular
 *  - Kullanıcıyı bulur ya da oluşturur
 *  - JWT üretip döner
 */
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body as { idToken?: string };

    if (!idToken) {
      return res.status(400).json({ error: "idToken is required" });
    }

    // Google ID token doğrulama (axios ile)
    const googleRes = await axios.get(
      "https://oauth2.googleapis.com/tokeninfo",
      {
        params: { id_token: idToken },
      }
    );

    const googleData = googleRes.data as any;

    const email = googleData.email as string | undefined;
    const name =
      (googleData.name as string | undefined) || "Google User";
    const picture = googleData.picture as string | undefined;
    const googleSub = googleData.sub as string | undefined;
    const aud = googleData.aud as string | undefined;

    if (!email) {
      return res.status(400).json({ error: "Google token has no email" });
    }

    // İstersen burada CLIENT_ID kontrolü yap:
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && aud && aud !== expectedClientId) {
      console.warn("Google aud mismatch:", aud);
      return res.status(401).json({ error: "Google client mismatch" });
    }

    // Kullanıcı var mı?
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // Yoksa oluştur
    if (!user) {
      // Google kullanıcıları için random bir "dummy" password hash
      const randomPwd = googleSub || Math.random().toString(36);
      const passwordHash = await bcrypt.hash(randomPwd, 10);

      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          googleId: googleSub,
          avatarUrl: picture,
        },
      });
    } else {
      // Varsa, googleId / avatarUrl varsa güncelle
      if (!user.googleId || !user.avatarUrl) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: user.googleId || googleSub,
            avatarUrl: user.avatarUrl || picture,
          },
        });
      }
    }

    const token = signJwtForUser(user);
    const { passwordHash, ...safeUser } = user;

    return res.json({
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error("Google login error:", error?.response?.data || error);
    return res.status(500).json({ error: "Google login failed" });
  }
});

/* =========================
   CURRENT USER
   ========================= */

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
        // Bu alanlar artık Prisma schema'da var:
        googleId: true,
        appleId: true,
        avatarUrl: true,
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

/* =========================
   PROFILE UPDATE (name, city)
   ========================= */

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
        googleId: true,
        appleId: true,
        avatarUrl: true,
      },
    });

    return res.json({ user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ======================================================
   EMAIL-BASED LOGIN (magic code): CODE REQUEST ENDPOINT
   ====================================================== */

/**
 * POST /auth/request-login-code
 * Body: { email }
 *
 * Verilen email için 6 haneli kod üretir,
 * EmailLoginCode tablosuna yazar ve mail gönderir.
 */
router.post("/request-login-code", emailCodeLimiter, async (req, res) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Kullanıcı var mı? (bilgi sızdırmamak için hep aynı mesaj döneceğiz)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Email kayıtlı değilse bile "ok" dönüyoruz (security)
      return res.json({ ok: true });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 dk

    // Eski kodları invalidate et
    await prisma.emailLoginCode.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // Yeni kod kaydı
    await prisma.emailLoginCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Mail gönder
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Your Moventra login code",
      text: `Your Moventra login code is: ${code} (valid for 10 minutes)`,
      html: `<p>Your Moventra login code is:</p>
             <p style="font-size:24px;font-weight:bold;">${code}</p>
             <p>This code is valid for 10 minutes.</p>`,
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error("request-login-code error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ======================================================
   EMAIL-BASED LOGIN: CODE VERIFY ENDPOINT
   ====================================================== */

/**
 * POST /auth/verify-login-code
 * Body: { email, code }
 *
 * Kod geçerliyse JWT üretir ve user ile döner.
 */
router.post("/verify-login-code", loginLimiter, async (req, res) => {
  try {
    const { email, code } = req.body as { email?: string; code?: string };

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    const record = await prisma.emailLoginCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    // Kodu kullanılmış işaretle
    await prisma.emailLoginCode.update({
      where: { id: record.id },
      data: { used: true },
    });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const token = signJwtForUser(user);
    const { passwordHash, ...safeUser } = user;

    return res.json({
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("verify-login-code error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
