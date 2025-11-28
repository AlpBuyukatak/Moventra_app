// src/routes/auth.ts
import { Router } from "express";
import prisma from "../prisma";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";
import { loginLimiter, emailCodeLimiter } from "../middleware/rateLimit";
import nodemailer from "nodemailer";
import axios from "axios";
import crypto from "crypto";

const router = Router();

/* =========================
   Ortak ayarlar
   ========================= */

const FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL || "http://localhost:3000";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:4000/auth/google/callback";

/* =========================
   JWT yardımcı fonksiyonu
   ========================= */

function signJwtForUser(user: { id: number; email: string }) {
  const jwtSecret = (process.env.JWT_SECRET || "dev-secret") as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as string;

  return jwt.sign({ userId: user.id, email: user.email }, jwtSecret, {
    expiresIn,
  } as SignOptions);
}

/* =========================
   Nodemailer
   ========================= */

const hasSmtpConfig =
  !!process.env.SMTP_HOST &&
  !!process.env.SMTP_PORT &&
  !!process.env.SMTP_USER &&
  !!process.env.SMTP_PASS;

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

if (!hasSmtpConfig) {
  console.warn(
    "[auth] SMTP is not fully configured. Emails (verification, login code, GDPR) will NOT be sent."
  );
} else {
  console.log("[auth] SMTP configured.");
}

/* =========================
   Google yardımcıları
   ========================= */

async function upsertUserFromGooglePayload(googleData: any) {
  const email = googleData.email as string | undefined;
  const name = (googleData.name as string | undefined) || "Google User";
  const picture = googleData.picture as string | undefined;
  const googleSub = googleData.sub as string | undefined;
  const aud = googleData.aud as string | undefined;

  if (!email) {
    throw new Error("Google token has no email");
  }

  if (GOOGLE_CLIENT_ID && aud && aud !== GOOGLE_CLIENT_ID) {
    console.warn("Google aud mismatch:", aud);
    throw new Error("Google client mismatch");
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const randomPwd = googleSub || Math.random().toString(36);
    const passwordHash = await bcrypt.hash(randomPwd, 10);

    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        city: null,
        googleId: googleSub,
        avatarUrl: picture,
        isEmailVerified: true,
        onboardingCompleted: false,
        planType: "free",
      },
    });
  } else {
    if (!user.googleId || !user.avatarUrl || !user.isEmailVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || googleSub,
          avatarUrl: user.avatarUrl || picture,
          isEmailVerified: true,
        },
      });
    }
  }

  return user;
}

/* =========================
   REGISTER + EMAIL VERIFY
   ========================= */

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, city } = req.body as {
      email?: string;
      password?: string;
      name?: string;
      city?: string;
    };

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const now = new Date();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        city,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationSentAt: now,
        onboardingCompleted: false,
        planType: "free",
      },
      select: {
        id: true,
        email: true,
        name: true,
        city: true,
        createdAt: true,
        isEmailVerified: true,
        onboardingCompleted: true,
        planType: true,
      },
    });

    const baseUrl =
      process.env.BACKEND_BASE_URL ||
      `${req.protocol}://${req.get("host")}`;

    const verifyUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: "Verify your Moventra account",
          text: `Welcome to Moventra!\n\nPlease confirm your email address by clicking the link below:\n\n${verifyUrl}\n\nIf you did not create an account, you can ignore this email.`,
          html: `<p>Welcome to <strong>Moventra</strong>!</p>
<p>Please confirm your email address by clicking the button below:</p>
<p>
  <a href="${verifyUrl}"
    style="display:inline-block;padding:10px 18px;border-radius:999px;
           background:#22c55e;color:#020617;text-decoration:none;
           font-weight:600;">
    Verify my email
  </a>
</p>
<p>If the button doesn't work, copy and paste this URL into your browser:</p>
<p style="word-break:break-all;">${verifyUrl}</p>`,
        });
      } catch (mailErr) {
        console.error("register sendMail error:", mailErr);
        return res.json({
          user,
          message:
            "Account created, but we could not send the verification email. Please contact support.",
        });
      }
    }

    return res.json({
      user,
      message:
        "Account created. Please check your email and verify your account.",
    });
  } catch (error) {
    console.error("register error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /auth/verify-email?token=...
 */
router.get("/verify-email", async (req, res) => {
  try {
    const token = req.query.token as string | undefined;

    if (!token) {
      return res.status(400).send("Missing token");
    }

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return res.status(400).send("Invalid or expired verification link");
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });

    const jwtToken = signJwtForUser(updated);

    const redirectUrl = new URL(
      `${FRONTEND_BASE_URL}/auth/email-verified`
    );
    redirectUrl.searchParams.set("token", jwtToken);

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("verify-email error:", error);
    return res.status(500).send("Email verification failed");
  }
});

/* =========================================
   RESEND EMAIL VERIFICATION
   ========================================= */

router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Gizlilik için: email yoksa bile "ok" dönelim
    if (!user) {
      return res.json({
        ok: true,
        message:
          "If this email exists, a verification link has been sent.",
      });
    }

    if (user.isEmailVerified) {
      return res.json({
        ok: true,
        message: "Your email is already verified. You can log in now.",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const now = new Date();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationSentAt: now,
      },
    });

    const baseUrl =
      process.env.BACKEND_BASE_URL ||
      `${req.protocol}://${req.get("host")}`;

    const verifyUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: "Verify your Moventra account",
          text: `Please confirm your email address by clicking the link below:\n\n${verifyUrl}\n\nIf you did not create an account, you can ignore this email.`,
          html: `<p>Please confirm your email address by clicking the button below:</p>
<p>
  <a href="${verifyUrl}"
    style="display:inline-block;padding:10px 18px;border-radius:999px;
           background:#22c55e;color:#020617;text-decoration:none;
           font-weight:600;">
    Verify my email
  </a>
</p>
<p>If the button doesn't work, copy and paste this URL into your browser:</p>
<p style="word-break:break-all;">${verifyUrl}</p>`,
        });
      } catch (mailErr) {
        console.error("resend-verification sendMail error:", mailErr);
      }
    }

    return res.json({
      ok: true,
      message:
        "If this email exists, a verification link has been sent.",
    });
  } catch (error) {
    console.error("resend-verification error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   PASSWORD LOGIN (JWT)
   ========================= */

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Missing email or password" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid email or password" });
    }

    // ✅ Eğer hesap daha önce tamamen deaktive edildiyse
    if (user.isActive === false) {
      return res.status(403).json({
        error:
          "Your account has been deactivated. Please contact support if this is unexpected.",
      });
    }

    const now = new Date();

    // ✅ Deactivation zamanı geçmişse → hesabı tamamen kapat
    if (user.deactivationScheduledAt && user.deactivationScheduledAt <= now) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isActive: false,
          deactivatedAt: now,
          deactivationScheduledAt: null,
        },
      });

      return res.status(403).json({
        error:
          "Your account has been deactivated. Please contact support if this is unexpected.",
      });
    }

    // ✅ Deactivation zamanı gelecekteyse ve kullanıcı giriş yapıyorsa → iptal et
    if (user.deactivationScheduledAt && user.deactivationScheduledAt > now) {
      await prisma.user.update({
        where: { id: user.id },
        data: { deactivationScheduledAt: null },
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        error: "Please verify your email address before logging in.",
      });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res
        .status(401)
        .json({ error: "Invalid email or password" });
    }

    const token = signJwtForUser(user);
    const { passwordHash, ...safeUser } = user;

    return res.json({
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ==========================================
   GOOGLE LOGIN (1) - ID TOKEN (POST /google)
   ========================================== */

router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body as { idToken?: string };

    if (!idToken) {
      return res.status(400).json({ error: "idToken is required" });
    }

    const googleRes = await axios.get(
      "https://oauth2.googleapis.com/tokeninfo",
      { params: { id_token: idToken } }
    );
    const googleData = googleRes.data as any;

    const user = await upsertUserFromGooglePayload(googleData);

    const token = signJwtForUser(user);
    const { passwordHash, ...safeUser } = user as any;

    return res.json({
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error("Google login error:", error?.response?.data || error);
    return res.status(500).json({ error: "Google login failed" });
  }
});

/* ==================================================
   GOOGLE LOGIN (2) - Redirect flow: /start & /callback
   ================================================== */

router.get("/google/start", (req, res) => {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return res
        .status(500)
        .send("GOOGLE_CLIENT_ID is not configured on the server");
    }

    const redirectParam = (req.query.redirect_uri as string) || "";
    const stateRedirectUri =
      redirectParam || `${FRONTEND_BASE_URL}/auth/google/callback`;

    const state = encodeURIComponent(stateRedirectUri);

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
      state,
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return res.redirect(googleAuthUrl);
  } catch (error) {
    console.error("google/start error:", error);
    return res.status(500).send("Google start failed");
  }
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).send("Missing code");
    }
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res
        .status(500)
        .send("Google client id/secret not configured on the server");
    }

    const frontendRedirectRaw = (state as string) || "";
    const fallbackFrontend = `${FRONTEND_BASE_URL}/auth/google/callback`;
    const frontendRedirect = frontendRedirectRaw
      ? decodeURIComponent(frontendRedirectRaw)
      : fallbackFrontend;

    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code: String(code),
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { id_token: idToken } = tokenRes.data as { id_token: string };

    const googleRes = await axios.get(
      "https://oauth2.googleapis.com/tokeninfo",
      { params: { id_token: idToken } }
    );
    const googleData = googleRes.data as any;

    const user = await upsertUserFromGooglePayload(googleData);
    const jwtToken = signJwtForUser(user);

    const url = new URL(frontendRedirect);
    url.searchParams.set("token", jwtToken);

    return res.redirect(url.toString());
  } catch (error: any) {
    console.error("google/callback error:", error?.response?.data || error);

    const fallback = `${FRONTEND_BASE_URL}/auth/google/callback`;
    const url = new URL(fallback);
    url.searchParams.set("error", "google_login_failed");

    return res.redirect(url.toString());
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
        googleId: true,
        appleId: true,
        avatarUrl: true,
        isEmailVerified: true,
        onboardingCompleted: true,
        onboardingPurpose: true,
        birthDate: true,
        gender: true,
        planType: true,
        bio: true,
        showGroups: true,
        showInterests: true,
        isActive: true,
        deactivatedAt: true,
        deactivationScheduledAt: true,
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
   PROFILE / ONBOARDING UPDATE
   ========================= */

router.put("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      name,
      city,
      birthDate,
      gender,
      planType,
      onboardingCompleted,
      onboardingPurpose,
      bio,
      showGroups,
      showInterests,
    } = req.body as {
      name?: string;
      city?: string | null;
      birthDate?: string | null;
      gender?: string | null;
      planType?: string | null;
      onboardingCompleted?: boolean;
      onboardingPurpose?: string | null;
      bio?: string | null;
      showGroups?: boolean;
      showInterests?: boolean;
    };

    const updateData: any = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: "Name cannot be empty" });
      }
      updateData.name = name.trim();
    }

    if (city !== undefined) {
      updateData.city = city?.trim() || null;
    }

    if (birthDate !== undefined) {
      updateData.birthDate = birthDate ? new Date(birthDate) : null;
    }

    if (gender !== undefined) {
      updateData.gender = gender;
    }

    if (planType !== undefined) {
      updateData.planType = planType;
    }

    if (typeof onboardingCompleted === "boolean") {
      updateData.onboardingCompleted = onboardingCompleted;
    }

    if (onboardingPurpose !== undefined) {
      updateData.onboardingPurpose = onboardingPurpose;
    }

    if (bio !== undefined) {
      if (bio === null) {
        updateData.bio = null;
      } else {
        const trimmed = bio.trim();
        updateData.bio = trimmed.length ? trimmed : null;
      }
    }

    if (typeof showGroups === "boolean") {
      updateData.showGroups = showGroups;
    }

    if (typeof showInterests === "boolean") {
      updateData.showInterests = showInterests;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        city: true,
        createdAt: true,
        googleId: true,
        appleId: true,
        avatarUrl: true,
        isEmailVerified: true,
        onboardingCompleted: true,
        onboardingPurpose: true,
        birthDate: true,
        gender: true,
        planType: true,
        bio: true,
        showGroups: true,
        showInterests: true,
        isActive: true,
        deactivatedAt: true,
        deactivationScheduledAt: true,
      },
    });

    return res.json({ user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   CHANGE PASSWORD
   ========================= */

router.post(
  "/change-password",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { currentPassword, newPassword } = req.body as {
        currentPassword?: string;
        newPassword?: string;
      };

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: "Current password and new password are required.",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          error:
            "New password must be at least 8 characters long.",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );
      if (!isValid) {
        return res.status(401).json({
          error: "Current password is incorrect.",
        });
      }

      const newHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });

      return res.json({
        ok: true,
        message: "Password updated successfully.",
      });
    } catch (error) {
      console.error("change-password error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

/* =========================
   DEACTIVATE ACCOUNT (24h schedule)
   ========================= */

router.post(
  "/deactivate",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          deactivationScheduledAt: in24h,
        },
        select: {
          id: true,
          email: true,
          deactivationScheduledAt: true,
        },
      });

      return res.json({
        ok: true,
        message:
          "Your account is scheduled for deactivation in the next 24 hours. If you log in again before that time, we will cancel it.",
        deactivationScheduledAt: updated.deactivationScheduledAt,
      });
    } catch (error) {
      console.error("deactivate error:", error);
      return res.status(500).json({
        error:
          "Could not schedule account deactivation. Please try again.",
      });
    }
  }
);

/* =========================
   GDPR REQUEST
   ========================= */

router.post(
  "/gdpr-request",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { type, message } = req.body as {
        type?: "access" | "erasure" | "other";
        message?: string | null;
      };

      const normalizedType: "access" | "erasure" | "other" =
        type === "erasure" || type === "other" ? type : "access";

      if (!transporter) {
        console.warn(
          "[auth] GDPR request received but SMTP is not configured."
        );
        return res.status(500).json({
          error:
            "Email is not configured on the server. Please contact support.",
        });
      }

      const gdprRecipient =
        process.env.GDPR_EMAIL ||
        process.env.SMTP_FROM ||
        process.env.SMTP_USER;

      const userRecord = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      const userEmail = userRecord?.email || req.user.email;
      const userName = userRecord?.name || "Unknown user";

      const subject = `[Moventra] GDPR request (${normalizedType}) from ${userEmail}`;

      const textBody = `A new GDPR request has been submitted.

Type: ${normalizedType}
User ID: ${req.user.id}
User email: ${userEmail}
User name: ${userName}

Message:
${message || "(no additional message)"}
`;

      const htmlBody = `<p>A new <strong>GDPR request</strong> has been submitted.</p>
<ul>
  <li><strong>Type:</strong> ${normalizedType}</li>
  <li><strong>User ID:</strong> ${req.user.id}</li>
  <li><strong>User email:</strong> ${userEmail}</li>
  <li><strong>User name:</strong> ${userName}</li>
</ul>
<p><strong>Message:</strong></p>
<p style="white-space:pre-wrap;">${(message ||
        "(no additional message)")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</p>`;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: gdprRecipient,
        subject,
        text: textBody,
        html: htmlBody,
      });

      return res.json({
        ok: true,
        message:
          "Your request has been submitted. We'll contact you via email.",
      });
    } catch (error) {
      console.error("gdpr-request error:", error);
      return res.status(500).json({
        error:
          "Could not submit GDPR request. Please try again.",
      });
    }
  }
);

/* ======================================================
   EMAIL-BASED LOGIN (magic code): CODE REQUEST ENDPOINT
   ====================================================== */

router.post("/request-login-code", emailCodeLimiter, async (req, res) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res
        .status(400)
        .json({ error: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({ ok: true });
    }

    const code = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.emailLoginCode.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    await prisma.emailLoginCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: "Your Moventra login code",
          text: `Your Moventra login code is: ${code} (valid for 10 minutes)`,
          html: `<p>Your Moventra login code is:</p>
<p style="font-size:24px;font-weight:bold;">${code}</p>
<p>This code is valid for 10 minutes.</p>`,
        });
      } catch (mailErr) {
        console.error("[auth] login code sendMail error:", mailErr);
      }
    } else {
      console.warn(
        "[auth] Cannot send login code email because SMTP is not configured."
      );
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error("request-login-code error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ======================================================
   EMAIL-BASED LOGIN: CODE VERIFY ENDPOINT
   ====================================================== */

router.post("/verify-login-code", loginLimiter, async (req, res) => {
  try {
    const { email, code } = req.body as {
      email?: string;
      code?: string;
    };

    if (!email || !code) {
      return res.status(400).json({
        error: "Email and code are required",
      });
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
      return res.status(400).json({
        error: "Invalid or expired code",
      });
    }

    await prisma.emailLoginCode.update({
      where: { id: record.id },
      data: { used: true },
    });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Hesap tamamen deaktif ise
    if (user.isActive === false) {
      return res.status(403).json({
        error:
          "Your account has been deactivated. Please contact support if this is unexpected.",
      });
    }

    const now = new Date();

    // ✅ Süresi geçmiş scheduled deactivation → hesabı kapat
    if (user.deactivationScheduledAt && user.deactivationScheduledAt <= now) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isActive: false,
          deactivatedAt: now,
          deactivationScheduledAt: null,
        },
      });

      return res.status(403).json({
        error:
          "Your account has been deactivated. Please contact support if this is unexpected.",
      });
    }

    // ✅ Gelecekte ise ve kullanıcı login oluyorsa → iptal et
    if (user.deactivationScheduledAt && user.deactivationScheduledAt > now) {
      await prisma.user.update({
        where: { id: user.id },
        data: { deactivationScheduledAt: null },
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        error: "Please verify your email address before logging in.",
      });
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
