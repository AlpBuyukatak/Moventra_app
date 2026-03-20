// src/middleware/rateLimit.ts
import rateLimit from "express-rate-limit";

/**
 * Genel rate limit (isteğe bağlı, ileride global olarak da kullanabiliriz)
 */
export const genericLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 dakika
  max: 100,                  // 1 dakikada max 100 istek / IP
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Şifre ile login için daha sıkı limit
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 dakika
  max: 10,                   // 15 dk'da max 10 giriş denemesi / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts. Please try again later.",
  },
});

/**
 * Email login code (magic code) için limit
 */
export const emailCodeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 dakika
  max: 5,                    // 10 dk'da max 5 kod isteği / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Too many code requests. Please check your email or try again later.",
  },
});
